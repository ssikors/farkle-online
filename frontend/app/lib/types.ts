export type Player = { name: string }

export type Lobby = { name: string; ownerName: string; playerName: string | null }

export type GameState = {
    ownerTurn: boolean;
    ownerScore: number;
    ownerRoundScore: number;
    playerScore: number;
    playerRoundScore: number;
    diceList: number[];
    diceCount: number;
    started: boolean;
}