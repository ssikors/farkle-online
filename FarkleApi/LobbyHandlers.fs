module LobbyHandlers

open Giraffe
open Repositories
open Types

// Players
let createPlayerHandler : HttpHandler =
    fun next ctx ->
        task {
            let! player = ctx.BindJsonAsync<Player>()
            match LobbyRepository.addPlayer player with
            | Ok () -> return! Successful.created (json player) next ctx
            | Error msg -> return! RequestErrors.conflict (text msg) next ctx
        }

// Lobbies
let createLobbyHandler : HttpHandler =
    fun next ctx ->
        task {
            let! lobby = ctx.BindJsonAsync<Lobby>()
            match LobbyRepository.addLobby lobby with
            | Ok () -> 
                printfn "created a lobby"
                return! Successful.created (json lobby) next ctx
            | Error msg -> return! RequestErrors.badRequest (text msg) next ctx
        }


let getLobbiesHandler : HttpHandler = 
    fun next ctx ->
        let lobbies = LobbyRepository.getAllLobbies ()
        Successful.ok (json lobbies) next ctx


let joinLobbyHandler : HttpHandler = 
    fun next ctx ->
        task {
            try
                let! lobby = ctx.BindJsonAsync<Lobby>()
                match LobbyRepository.joinLobby lobby with
                | Ok () ->
                    return! Successful.OK lobby next ctx
                | Error msg ->
                    printfn $"{msg}"
                    return! RequestErrors.badRequest (text msg) next ctx
            with ex ->
                return! RequestErrors.badRequest (text $"Invalid body: {ex.Message}") next ctx
        }

