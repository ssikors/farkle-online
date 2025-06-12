import { Lobby, Player } from "./types";

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

// Player
export async function createPlayerAsync(name: string) {
  const res = await fetch(`${baseUrl}/player`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });

  if (res.status != 201) {
    throw new Error("Failed to create player");
  }

  return await res.json();
}

// Lobby
export async function getLobbiesAsync() {
    const res = await fetch(`${baseUrl}/lobby`, {
    method: 'GET',
    });

    if (!res.ok) {
        throw new Error("Failed to fetch lobbies");
    }

    const data : Lobby[] = await res.json() 

    return data;
}

export async function createLobbyAsync(ownerName: string, name: string) {
    const res = await fetch(`${baseUrl}/lobby`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        name: name,
        ownerName: ownerName
    }),
  });

  if (res.status != 201) {
    throw new Error("Failed to create lobby");
  }

  return await res.json();
}


export async function joinLobbyAsync(lobby: Lobby) : Promise<Lobby> {
  const res = await fetch(`${baseUrl}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(lobby),
  });

  if (!res.ok) {
    throw new Error("Failed to join lobby");
  }

  return await res.json();
}
