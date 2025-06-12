module Types

type Player = { name: string }

type Lobby = { name: string; ownerName: string; playerName: string option }

type GameState = {
    ownerTurn: bool;
    ownerScore: int;
    ownerRoundScore: int;
    playerScore: int;
    playerRoundScore: int;
    diceList: int list;
    diceCount: int;
    started: bool
}