
module Farkle

open Microsoft.AspNetCore.Builder
open Microsoft.AspNetCore.Hosting
open Microsoft.Extensions.Hosting
open Microsoft.Extensions.DependencyInjection
open Giraffe
open LobbyHandlers

let webApp =
    choose [
        POST >=> route "/player" >=> createPlayerHandler
        POST >=> route "/lobby" >=> createLobbyHandler
        GET >=> route "/lobby" >=> getLobbiesHandler
        POST >=> route "/join" >=> joinLobbyHandler
        // Add GET routes if needed...
    ]


let configureApp (app : IApplicationBuilder) =
    // Add Giraffe to the ASP.NET Core pipeline
    app.UseGiraffe webApp

let configureServices (services : IServiceCollection) =
    // Add Giraffe dependencies
    services.AddGiraffe() |> ignore


let configure (webHostBuilder : IWebHostBuilder) = 
    webHostBuilder
        .Configure(configureApp)
        .ConfigureServices(configureServices)

[<EntryPoint>]
let main _ =
    Host.CreateDefaultBuilder()
        .ConfigureWebHostDefaults(configure >> ignore)
        .Build()
        .Run()
    0