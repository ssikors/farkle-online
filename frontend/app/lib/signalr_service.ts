'use client';

import { getConnection } from './signalr';

export interface Player {
  name: string;
}

export interface Lobby {
  name: string;
  owner: Player;
  player?: Player;
}

export async function createPlayer(player: Player) {
  const connection = getConnection();
  try {
    const result = await connection.invoke<{ ok: boolean; value?: Player; error?: string }>(
      'CreatePlayer',
      player
    );
    return result;
  } catch (error) {
    throw error;
  }
}

export async function createLobby(lobby: Lobby) {
  const connection = getConnection();
  try {
    const result = await connection.invoke<{ ok: boolean; value?: Lobby; error?: string }>(
      'CreateLobby',
      lobby
    );
    return result;
  } catch (error) {
    throw error;
  }
}

export async function joinLobby(lobby: Lobby) {
  const connection = getConnection();
  try {
    const result = await connection.invoke<{ ok: boolean; value?: Lobby; error?: string }>(
      'JoinLobby',
      lobby
    );
    return result;
  } catch (error) {
    throw error;
  }
}
