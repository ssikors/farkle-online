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

