"use client"

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

import * as signalR from '@microsoft/signalr';

let connection: signalR.HubConnection | null = null;

export function getConnection(): signalR.HubConnection {
  if (!connection) {
    connection = new signalR.HubConnectionBuilder()
      .withUrl(`${baseUrl}/hub`) // update to your URL
      .withAutomaticReconnect()
      .build();
  }
  return connection;
}

export async function startConnection() {
  const conn = getConnection();
  if (conn.state === signalR.HubConnectionState.Disconnected) {
    await conn.start();
  }
}

export async function stopConnection() {
  if (connection && connection.state !== signalR.HubConnectionState.Disconnected) {
    await connection.stop();
  }
}