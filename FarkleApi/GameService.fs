module Game
open Repositories
open Types
open System

module GameService = 
    let getDice (count: int) : int list =
        let rng = Random()
        List.init count (fun _ -> rng.Next(1, 7))

    let diceScores = Map.ofList [
        1, 100
        2, 0
        3, 0
        4, 0
        5, 50
        6, 0
    ]

    let tripleDiceScores = Map.ofList [
        1, 1000
        2, 200
        3, 300
        4, 400
        5, 500
        6, 600
    ]

    let scoreRepeated (dice: List<int>) : int =
        let results = dice |> Seq.countBy id |> Seq.toList
        List.fold (
        fun acc (value, count) ->
            acc + match count with
                    | 3 -> 
                        (tripleDiceScores.TryFind value |> Option.defaultValue 0)
                    | 4 ->
                        (tripleDiceScores.TryFind value |> Option.defaultValue 0) * 2
                    | 5 ->
                        (tripleDiceScores.TryFind value |> Option.defaultValue 0) * 4
                    | 6 ->
                        (tripleDiceScores.TryFind value |> Option.defaultValue 0) * 8
                    | _ as n ->
                        n * (diceScores.TryFind value |> Option.defaultValue 0)
        ) 0 results

    let scoreCombination (dice: list<int>) : int =
        let diceCount = dice.Length

        match diceCount with
        | 1 -> scoreRepeated dice
        | 2 -> scoreRepeated dice
        | 3 -> scoreRepeated dice
        | 4 -> scoreRepeated dice
        | 5 -> match Set.ofList dice with
                | s when s = Set.ofList [1; 2; 3; 4; 5] -> 750
                | s when s = Set.ofList [2; 3; 4; 5; 6] -> 750
                | _ ->  scoreRepeated dice
        | 6 -> match Set.ofList dice with
                | s when s = Set.ofList [1; 2; 3; 4; 5; 6] -> 1500
                | _ -> match List.sort dice with
                        | [1; 2; 3; 4; 5; 5] -> 750 + 50
                        | [2; 3; 4; 5; 5; 6] -> 750 + 50
                        | [1; 1; 2; 3; 4; 5] -> 750 + 100
                        | _ -> scoreRepeated dice
        | _ -> 0
        


    let scoreDice (dice: list<int>) (stateDice: list<int>) : int =
        let diceCounts = dice |> Seq.countBy id |> Map.ofSeq
        let stateCounts = stateDice |> Seq.countBy id |> Map.ofSeq

        let isValidSelection =
            diceCounts
            |> Map.forall (fun key count ->
                match Map.tryFind key stateCounts with
                | Some c when c >= count -> true
                | _ -> false
            )

        if isValidSelection then
            scoreCombination dice
        else
            0
    
    let scoreAndPass (lobbyName: string) (scoringDice: int list) : Result<GameState, string> =
        let updatedGameState =
            LobbyRepository.updateGameState lobbyName (fun prevState ->
                let isOwnerTurn = prevState.Value.ownerTurn
                let score = scoreDice scoringDice prevState.Value.diceList

                let winningScore = 2000

                {
                    ownerTurn = not isOwnerTurn
                    ownerScore =
                        if isOwnerTurn then
                            prevState.Value.ownerScore + prevState.Value.ownerRoundScore + score
                        else
                            prevState.Value.ownerScore
                    ownerRoundScore = 0
                    playerScore =
                        if not isOwnerTurn then
                            prevState.Value.playerScore + prevState.Value.playerRoundScore + score
                        else
                            prevState.Value.playerScore
                    playerRoundScore = 0
                    diceList = getDice 6
                    diceCount = 6
                    started = if isOwnerTurn then
                                    if prevState.Value.ownerScore + prevState.Value.ownerRoundScore + score >= winningScore then false else true
                              else
                                    if prevState.Value.playerScore + prevState.Value.playerRoundScore + score >= winningScore then false else true
                }
            )

        match LobbyRepository.getGameState lobbyName with
        | Some gs -> Ok gs
        | None -> Error $"Game state for lobby '{lobbyName}' not found after update."


    let scoreAndRoll (lobbyName: string) (scoringDice: int list)  : Result<GameState, string> =
        let updatedGameState =
            LobbyRepository.updateGameState lobbyName (fun prevState ->
                    let diceCount = match prevState.Value.diceCount - scoringDice.Length with
                                    | 0 -> 6
                                    | _ -> prevState.Value.diceCount - scoringDice.Length
                    { ownerTurn = prevState.Value.ownerTurn
                      ownerScore = prevState.Value.ownerScore
                      ownerRoundScore = match prevState.Value.ownerTurn with
                                        | true -> prevState.Value.ownerRoundScore + scoreDice scoringDice prevState.Value.diceList
                                        | false -> 0
                      playerScore = prevState.Value.playerScore
                      playerRoundScore = match prevState.Value.ownerTurn with
                                            | false -> prevState.Value.playerRoundScore + scoreDice scoringDice prevState.Value.diceList
                                            | true -> 0
                      diceList = getDice diceCount
                      diceCount = diceCount
                      started = true
                    }
            )

        match LobbyRepository.getGameState lobbyName with
        | Some gs -> Ok gs
        | None -> Error $"Game state for lobby '{lobbyName}' not found after update."

    let endTurn (lobbyName: string) : Result<GameState, string> =
        let updatedGameState =
            LobbyRepository.updateGameState lobbyName (fun prevState ->
                    { ownerTurn = not prevState.Value.ownerTurn
                      ownerScore = prevState.Value.ownerScore
                      ownerRoundScore = 0
                      playerScore = prevState.Value.playerScore
                      playerRoundScore = 0
                      diceList = getDice 6
                      diceCount = 6
                      started = true 
                    }
            )

        match LobbyRepository.getGameState lobbyName with
        | Some gs -> Ok gs
        | None -> Error $"Game state for lobby '{lobbyName}' not found after update."

    let startGame (lobbyName: string) : Result<GameState, string> =
        let initialGameState = {
            ownerTurn = true
            ownerScore = 0
            ownerRoundScore = 0
            playerScore = 0
            playerRoundScore = 0
            diceList = getDice 6
            diceCount = 6
            started = true
        }

        let updated =
            LobbyRepository.updateGameState lobbyName (fun _ -> initialGameState)

        match LobbyRepository.getGameState lobbyName with
        | Some gs -> Ok gs
        | None -> Error $"Game state for lobby '{lobbyName}' not found after start."

    