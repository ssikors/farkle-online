'use client';

let connection: any = null;

export async function getConnection() {
  if (!connection) {
    const signalR = await import('@microsoft/signalr');

    connection = new signalR.HubConnectionBuilder()
      .withUrl(`${process.env.NEXT_PUBLIC_API_URL}/hub`)
      .withAutomaticReconnect()
      .build();
  }

  return connection;
}

export async function startConnection() {
  const conn = await getConnection();
  if (conn.state === 'Disconnected') {
    await conn.start();
  }
}

export async function stopConnection() {
  if (connection && connection.state !== 'Disconnected') {
    await connection.stop();
  }
}
