module Hubs

open Types
open Repositories
open System.Threading.Tasks
open Microsoft.AspNetCore.SignalR
open System.Collections.Concurrent

type LobbyHub() =
    inherit Hub()

    member this.CreatePlayer(player: Player) : Task = 
        task {
            match LobbyRepository.addPlayer player with
            | Ok () -> do! this.Clients.Caller.SendAsync("PlayerCreated", player)
            | Error msg -> do! this.Clients.Caller.SendAsync("Error", msg)
        }

    member this.CreateLobby(lobby: Lobby) : Task =
        task {
            match LobbyRepository.addLobby lobby with
            | Ok () -> do! this.Clients.Caller.SendAsync("LobbyCreated", lobby)
            | Error msg -> do! this.Clients.Caller.SendAsync("Error", msg)
        }

    member this.JoinLobby(lobby: Lobby) : Task =
        task {
            match LobbyRepository.joinLobby lobby with
            | Ok () -> do! this.Clients.Caller.SendAsync("LobbyJoined", lobby)
            | Error msg -> do! this.Clients.Caller.SendAsync("Error", msg)
        }

    //override this.OnDisconnectedAsync(ex) =
    //    task {
    //        //let playerName = /* lookup by Context.ConnectionId */
    //        //let lobbyName = /* lookup by Context.ConnectionId */

    //        match playerName, lobbyName with
    //        | Some p, Some l ->
    //            LobbyRepository.removePlayer l p
    //            LobbyRepository.removePlayerFromGlobal p
    //        | _ -> ()

    //        return! base.OnDisconnectedAsync(ex)
    //    }