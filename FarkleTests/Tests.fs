module Tests

open Xunit
open FsUnit.Xunit
open Repositories
open Types
open Game

module GameServiceTests =

    [<Fact>]
    let ``Single dice scored correctly`` () =
        // Arrange
        let lobbyName = "testLobby"
        let owner = { name = "owner1" }
        let lobby = { name = lobbyName; ownerName = owner.name; playerName = None }
        LobbyRepository.addPlayer owner |> ignore
        LobbyRepository.addLobby lobby |> ignore

        let gameStateDice = [1; 2; 5]
        let newDiceList = [1;]

        // Act
        let result = GameService.scoreDice newDiceList gameStateDice

        // Assert
        result |> should equal 100

    [<Fact>]
    let ``Invalid dice scored correctly`` () =
        // Arrange
        let lobbyName = "testLobby"
        let owner = { name = "owner1" }
        let lobby = { name = lobbyName; ownerName = owner.name; playerName = None }
        LobbyRepository.addPlayer owner |> ignore
        LobbyRepository.addLobby lobby |> ignore

        let gameStateDice = [1; 2; 5]
        let newDiceList = [2;]

        // Act
        let result = GameService.scoreDice newDiceList gameStateDice

        // Assert
        result |> should equal 0

    [<Fact>]
    let ``Fake dice scored correctly`` () =
        // Arrange
        let lobbyName = "testLobby"
        let owner = { name = "owner1" }
        let lobby = { name = lobbyName; ownerName = owner.name; playerName = None }
        LobbyRepository.addPlayer owner |> ignore
        LobbyRepository.addLobby lobby |> ignore

        let gameStateDice = [1; 2; 5]
        let newDiceList = [1; 1;]

        // Act
        let result = GameService.scoreDice newDiceList gameStateDice

        // Assert
        result |> should equal 0


    [<Fact>]
    let ``Two dice`` () =
        // Arrange
        let lobbyName = "testLobby"
        let owner = { name = "owner1" }
        let lobby = { name = lobbyName; ownerName = owner.name; playerName = None }
        LobbyRepository.addPlayer owner |> ignore
        LobbyRepository.addLobby lobby |> ignore

        let gameStateDice = [1; 2; 5]
        let newDiceList = [1; 5]

        // Act
        let result = GameService.scoreDice newDiceList gameStateDice

        // Assert
        result |> should equal 150

    [<Fact>]
    let ``Three dice combo`` () =
        // Arrange
        let lobbyName = "testLobby"
        let owner = { name = "owner1" }
        let lobby = { name = lobbyName; ownerName = owner.name; playerName = None }
        LobbyRepository.addPlayer owner |> ignore
        LobbyRepository.addLobby lobby |> ignore

        let gameStateDice = [1; 1; 1; 3]
        let newDiceList = [1; 1; 1]

        // Act
        let result = GameService.scoreDice newDiceList gameStateDice

        // Assert
        result |> should equal 1000

    [<Fact>]
    let ``Three dice count`` () =
        // Arrange
        let lobbyName = "testLobby"
        let owner = { name = "owner1" }
        let lobby = { name = lobbyName; ownerName = owner.name; playerName = None }
        LobbyRepository.addPlayer owner |> ignore
        LobbyRepository.addLobby lobby |> ignore

        let gameStateDice = [1; 5; 1; 3]
        let newDiceList = [1; 5; 1]

        // Act
        let result = GameService.scoreDice newDiceList gameStateDice

        // Assert
        result |> should equal 250

    [<Fact>]
    let ``Four dice combo`` () =
        // Arrange
        let lobbyName = "testLobby"
        let owner = { name = "owner1" }
        let lobby = { name = lobbyName; ownerName = owner.name; playerName = None }
        LobbyRepository.addPlayer owner |> ignore
        LobbyRepository.addLobby lobby |> ignore

        let gameStateDice = [1; 1; 1; 1]
        let newDiceList = [1; 1; 1; 1]

        // Act
        let result = GameService.scoreDice newDiceList gameStateDice

        // Assert
        result |> should equal 2000

    [<Fact>]
    let ``Four dice combo plus one`` () =
        // Arrange
        let lobbyName = "testLobby"
        let owner = { name = "owner1" }
        let lobby = { name = lobbyName; ownerName = owner.name; playerName = None }
        LobbyRepository.addPlayer owner |> ignore
        LobbyRepository.addLobby lobby |> ignore

        let gameStateDice = [1; 1; 1; 5]
        let newDiceList = [1; 1; 1; 5]

        // Act
        let result = GameService.scoreDice newDiceList gameStateDice

        // Assert
        result |> should equal 1050

    [<Fact>]
    let ``Five dice street`` () =
        // Arrange
        let lobbyName = "testLobby"
        let owner = { name = "owner1" }
        let lobby = { name = lobbyName; ownerName = owner.name; playerName = None }
        LobbyRepository.addPlayer owner |> ignore
        LobbyRepository.addLobby lobby |> ignore

        let gameStateDice = [1; 2; 3; 4; 5; 3]
        let newDiceList = [1; 2; 3; 4; 5]

        // Act
        let result = GameService.scoreDice newDiceList gameStateDice

        // Assert
        result |> should equal 750

    [<Fact>]
    let ``Five dice combo`` () =
        // Arrange
        let lobbyName = "testLobby"
        let owner = { name = "owner1" }
        let lobby = { name = lobbyName; ownerName = owner.name; playerName = None }
        LobbyRepository.addPlayer owner |> ignore
        LobbyRepository.addLobby lobby |> ignore

        let gameStateDice = [1; 1; 1; 1; 1; 3]
        let newDiceList = [1; 1; 1; 1; 1]

        // Act
        let result = GameService.scoreDice newDiceList gameStateDice

        // Assert
        result |> should equal 4000

    [<Fact>]
    let ``Alt five dice street`` () =
        // Arrange
        let lobbyName = "testLobby"
        let owner = { name = "owner1" }
        let lobby = { name = lobbyName; ownerName = owner.name; playerName = None }
        LobbyRepository.addPlayer owner |> ignore
        LobbyRepository.addLobby lobby |> ignore

        let gameStateDice = [2; 2; 3; 4; 5; 6]
        let newDiceList = [2; 3; 4; 5; 6]

        // Act
        let result = GameService.scoreDice newDiceList gameStateDice

        // Assert
        result |> should equal 750

    [<Fact>]
    let ``Six dice street`` () =
        // Arrange
        let lobbyName = "testLobby"
        let owner = { name = "owner1" }
        let lobby = { name = lobbyName; ownerName = owner.name; playerName = None }
        LobbyRepository.addPlayer owner |> ignore
        LobbyRepository.addLobby lobby |> ignore

        let gameStateDice = [1; 2; 3; 4; 5; 6]
        let newDiceList = [1; 2; 3; 4; 5; 6]

        // Act
        let result = GameService.scoreDice newDiceList gameStateDice

        // Assert
        result |> should equal 1500

    [<Fact>]
    let ``Double combo`` () =
        // Arrange
        let lobbyName = "testLobby"
        let owner = { name = "owner1" }
        let lobby = { name = lobbyName; ownerName = owner.name; playerName = None }
        LobbyRepository.addPlayer owner |> ignore
        LobbyRepository.addLobby lobby |> ignore

        let gameStateDice = [1; 1; 1; 5; 5; 5]
        let newDiceList = [1; 1; 1; 5; 5; 5]

        // Act
        let result = GameService.scoreDice newDiceList gameStateDice

        // Assert
        result |> should equal 1500

    [<Fact>]
    let ``Six dice combo`` () =
        // Arrange
        let lobbyName = "testLobby"
        let owner = { name = "owner1" }
        let lobby = { name = lobbyName; ownerName = owner.name; playerName = None }
        LobbyRepository.addPlayer owner |> ignore
        LobbyRepository.addLobby lobby |> ignore

        let gameStateDice = [1; 1; 1; 1; 1; 1]
        let newDiceList = [1; 1; 1; 1; 1; 1]

        // Act
        let result = GameService.scoreDice newDiceList gameStateDice

        // Assert
        result |> should equal 8000