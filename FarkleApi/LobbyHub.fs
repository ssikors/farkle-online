module Hubs

open Types
open Repositories
open Microsoft.AspNetCore.SignalR
open System.Threading.Tasks
open Game

type LobbyHub() =
    inherit Hub()

    override this.OnDisconnectedAsync(ex: System.Exception) =
        let baseCall = base.OnDisconnectedAsync(ex)
        task {
            let nameFound, nameObj = this.Context.Items.TryGetValue("name")
            let lobbyFound, lobbyObj = this.Context.Items.TryGetValue("lobby")

            match nameFound, nameObj, lobbyFound, lobbyObj with
            | true, (:? string as playerName), true, (:? string as lobbyName) ->
                match LobbyRepository.getLobby lobbyName with
                | Some lobby ->
                    let updatedLobbyOpt =
                        if lobby.ownerName = playerName && lobby.playerName.IsSome then
                            // Promote second player to owner
                            Some { lobby with ownerName = lobby.playerName.Value; playerName = None }
                        elif lobby.ownerName = playerName then
                            // Only owner → delete lobby
                            LobbyRepository.removeLobby lobby.name |> ignore
                            None
                        elif lobby.playerName = Some playerName then
                            Some { lobby with playerName = None }
                        else
                            Some lobby

                    match updatedLobbyOpt with
                    | Some updatedLobby ->
                        // Use an "update" function instead of addLobby here, or replace existing lobby entry:
                        LobbyRepository.updateLobby updatedLobby |> ignore
                        do! this.Clients.Group(lobby.name).SendAsync("LobbyUpdated", updatedLobby)
                    | None ->
                        // Lobby removed, notify clients:
                        do! this.Clients.Group(lobby.name).SendAsync("LobbyDeleted", lobby.name)

                    do! this.Groups.RemoveFromGroupAsync(this.Context.ConnectionId, lobbyName)
                    printfn $"{playerName} disconnected from lobby {lobbyName}"

                | None -> ()
            | _ -> ()

            return! baseCall
        }


    member this.joinGame(lobbyName: string, playerName: string) : Task =
        printfn "join game invoked"
        
        task {
            this.Context.Items["name"] <- playerName :> obj
            this.Context.Items["lobby"] <- lobbyName :> obj

            printfn $"{playerName} joined lobby {lobbyName}"

            match LobbyRepository.getLobby lobbyName with
            | Some lobby ->
                let isOwner = lobby.ownerName = playerName
                let isPlayer = lobby.playerName = Some playerName

                if not isOwner && not isPlayer then
                    let updatedLobby = { lobby with playerName = Some playerName }
                    match LobbyRepository.joinLobby updatedLobby with
                    | Ok () -> printfn $"{playerName} joined lobby {lobbyName}"
                    | Error msg -> 
                        printfn "Error joining lobby"
                        do! this.Clients.Caller.SendAsync("Error", msg)
                else
                    printfn $"{playerName} rejoined lobby {lobbyName}"

                do! this.Groups.AddToGroupAsync(this.Context.ConnectionId, lobbyName)

                printfn "Added to group"

                match LobbyRepository.getLobby lobbyName with
                | Some lobby -> do! this.Clients.Group(lobbyName).SendAsync("LobbyUpdated", lobby)
                | None -> 
                    printfn "getLobby returned None"
                    ()
            | None ->
                printfn "Lobby not found"
                do! this.Clients.Caller.SendAsync("Error", $"Lobby {lobbyName} not found")
        }

        member this.scoreAndPass(lobbyName: string, scoringDice: int list) : Task =
        task {
            printfn $"Passing, dice: {scoringDice.ToString()}"
            match GameService.scoreAndPass lobbyName scoringDice with
            | Ok gameState ->
                match gameState.started with
                | true -> do! this.Clients.Group(lobbyName).SendAsync("GameStateUpdated", gameState)
                | false -> do! this.Clients.Group(lobbyName).SendAsync("GameFinished", gameState)
            | Error msg ->
                do! this.Clients.Caller.SendAsync("Error", msg)
        }

        member this.scoreAndRoll(lobbyName: string, scoringDice: int list) : Task =
            task {
                printfn $"Rolling, dice: {scoringDice.ToString()}"
                match GameService.scoreAndRoll lobbyName scoringDice with
                | Ok gameState ->
                    do! this.Clients.Group(lobbyName).SendAsync("GameStateUpdated", gameState)
                | Error msg ->
                    do! this.Clients.Caller.SendAsync("Error", msg)
            }

        member this.endTurn(lobbyName: string) : Task =
            task {
                match GameService.endTurn lobbyName with
                | Ok gameState ->
                    do! this.Clients.Group(lobbyName).SendAsync("GameStateUpdated", gameState)
                | Error msg ->
                    do! this.Clients.Caller.SendAsync("Error", msg)
            }

        member this.startGame(lobbyName: string) : Task =
            task {
                match GameService.startGame lobbyName with
                | Ok gameState ->
                    do! this.Clients.Group(lobbyName).SendAsync("GameStateUpdated", gameState)
                | Error msg ->
                    do! this.Clients.Caller.SendAsync("Error", msg)
            }
