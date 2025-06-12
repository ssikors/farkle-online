module Repositories

open System.Collections.Concurrent
open Types

module LobbyRepository =
    // <playerName, player>
    let private players = ConcurrentDictionary<string, Player>()

    // <lobbyName, lobby>
    let private lobbies = ConcurrentDictionary<string, Lobby>()

    // <lobbyName, GameState>
    let private games = ConcurrentDictionary<string, GameState>()

     // get the current game state for a lobby
    let getGameState (lobbyName: string) : GameState option =
        match games.TryGetValue(lobbyName) with
        | true, gameState -> Some gameState
        | false, _ -> None

    // update the game state for a lobby using a function that transforms the existing state
    let updateGameState (lobbyName: string) (updateFn: GameState option -> GameState) : unit =
        games.AddOrUpdate(
            lobbyName,
            // if lobby not present, create new with updateFn None
            (fun _ -> updateFn None),
            // if present, update with current state
            (fun _ oldState -> updateFn (Some oldState))
        ) |> ignore

    // --- Players ---
    let addPlayer (player: Player) : Result<unit, string> =
        if players.ContainsKey player.name then Ok ()
        else players.TryAdd(player.name, player) |> ignore; Ok ()

    let removePlayer (name: string) =
        players.TryRemove(name) |> ignore

    let playerExists name = players.ContainsKey name

    // --- Lobbies ---
    let removeLobby (name: string) : bool =
        match lobbies.TryRemove(name) with
        | true, _ -> true
        | false, _ -> false


    let updateLobby (lobby: Lobby) : Result<unit, string> =
        match lobbies.TryGetValue(lobby.name) with
        | true, existing ->
            lobbies.TryUpdate(lobby.name, lobby, existing) |> ignore
            Ok ()
        | false, _ -> Error "Lobby not found."


    let addLobby (lobby: Lobby) : Result<unit, string> =
        if lobbies.ContainsKey lobby.name then
            printfn "(repo) Lobby already exists"
            Error $"Lobby '{lobby.name}' already exists."
        elif not (playerExists lobby.ownerName) then
            printfn "(repo) Owner not registered"
            Error "The owner is not registered."
        else
            lobbies.TryAdd(lobby.name, lobby) |> ignore
            Ok ()

    let getLobby name =
        match lobbies.TryGetValue(name) with
        | true, lobby -> Some lobby
        | _ -> None

    let getAllLobbies () = lobbies.Values |> Seq.toList

    let joinLobby (lobby: Lobby) : Result<unit, string> =
        match lobbies.TryGetValue(lobby.name) with
        | true, existing ->
            match lobby.playerName with
            | None -> 
                printfn "(repo) Second player must be provided"
                Error "Second player must be provided."
            | Some playerName ->
                if not (playerExists playerName) then
                    printfn "(repo) Player must be registered."
                    Error "Player must be registered."
                elif existing.playerName.IsSome then
                    printfn "(repo) Lobby already has a second player."
                    Error "Lobby already has a second player."
                else
                    let updated = { existing with playerName = Some playerName }
                    lobbies.TryUpdate(lobby.name, updated, existing) |> ignore
                    Ok ()
        | false, _ -> 
            printfn "(repo) Lobby not found"
            Error "Lobby not found."

    let removePlayerFromLobby (lobbyName: string) (playerName: string) : Result<Lobby option, string> =
        match lobbies.TryGetValue(lobbyName) with
        | true, existing ->
            if existing.ownerName = playerName && existing.playerName.IsSome then
                // Promote second player to owner
                let updated = { existing with ownerName = existing.playerName.Value; playerName = None }
                lobbies.TryUpdate(lobbyName, updated, existing) |> ignore
                Ok (Some updated)
            elif existing.ownerName = playerName then
                // No one left in lobby, remove it
                lobbies.TryRemove(lobbyName) |> ignore
                Ok None
            elif existing.playerName = Some playerName then
                let updated = { existing with playerName = None }
                lobbies.TryUpdate(lobbyName, updated, existing) |> ignore
                Ok (Some updated)
            else
                Ok (Some existing)
        | false, _ -> 
            printfn "(repo) Lobby not found when removing player"
            Error "Lobby not found."
