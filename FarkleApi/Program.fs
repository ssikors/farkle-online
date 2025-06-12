
module Farkle

open Microsoft.AspNetCore.Builder
open Microsoft.AspNetCore.Hosting
open Microsoft.Extensions.Hosting
open Microsoft.Extensions.DependencyInjection
open Giraffe
open LobbyHandlers
open Hubs

let webApp =
    choose [
        POST >=> route "/player" >=> createPlayerHandler
        POST >=> route "/lobby" >=> createLobbyHandler
        GET >=> route "/lobby" >=> getLobbiesHandler
        POST >=> route "/join" >=> joinLobbyHandler
    ]


let configureApp (app: IApplicationBuilder) =
    app.UseRouting() |> ignore
    app.UseCors("AllowLocalhost") |> ignore
    app.UseEndpoints(fun endpoints ->
        endpoints.MapHub<LobbyHub>("/hub") |> ignore
    ) |> ignore

    app.UseGiraffe webApp
    

let configureServices (services : IServiceCollection) =
    services.AddCors(fun options ->
        options.AddPolicy("AllowLocalhost", fun builder ->
            builder
                .WithOrigins("http://localhost:3000")
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials()
                |> ignore
        )
    ) |> ignore
    services.AddGiraffe() |> ignore
    services.AddSignalR() |> ignore

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