module Repositories

open System.Collections.Concurrent
open Types

module LobbyRepository =

    let private players = ConcurrentDictionary<string, Player>()
    let private lobbies = ConcurrentDictionary<string, Lobby>()

    // --- Players ---

    let addPlayer (player: Player) : Result<unit, string> =
        if players.ContainsKey player.name then
            Error $"Player '{player.name}' already exists."
        else
            players.TryAdd(player.name, player) |> ignore
            Ok ()


    // --- Lobby ---

    let addLobby (lobby: Lobby) : Result<unit, string> =
        if lobbies.ContainsKey lobby.name then
            Error $"Lobby '{lobby.name}' already exists."
        elif not (players.ContainsKey lobby.ownerName) then
            Error "The owner is not registered."
        else
            lobbies.TryAdd(lobby.name, lobby) |> ignore
            Ok ()

    let getLobby name : Lobby option =
        match lobbies.TryGetValue(name) with
        | true, lobby -> Some lobby
        | _ -> None

    let getAllLobbies () : Lobby list =
        lobbies.Values |> Seq.toList

    let joinLobby (lobby: Lobby) : Result<unit, string> =
        match lobbies.TryGetValue(lobby.name) with
        | true, existingLobby ->
            match lobby.playerName with
            | None -> Error "Second player must be provided."
            | Some playerName ->
                if not (players.ContainsKey playerName) then
                    Error "Player must be registered."
                elif existingLobby.playerName.IsSome then
                    Error "Lobby already has a second player."
                else
                    lobbies.TryUpdate(lobby.name, lobby, existingLobby) |> ignore
                    Ok ()
        | false, _ -> Error "This lobby does not exist."

