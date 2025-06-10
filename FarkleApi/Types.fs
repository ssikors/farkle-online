module Types

type Player = { name: string }

type Lobby = { name: string; ownerName: string; playerName: string option }