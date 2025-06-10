// pages/api/socket.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';

type ExtendedRes = NextApiResponse & {
  socket: {
    server: HttpServer & {
      wss?: WebSocketServer;
    };
  };
};

export default function handler(req: NextApiRequest, res: ExtendedRes) {
  if (res.socket.server.wss) {
    console.log('WebSocket server already running');
    res.end();
    return;
  }

  const wss = new WebSocketServer({ noServer: true });

  wss.on('connection', (ws: WebSocket) => {
    ws.on('message', (message: string) => {
      console.log('Received:', message);
    });

    ws.send('Connected to WebSocket server');
  });

  res.socket.server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  });

  res.socket.server.wss = wss;
  console.log('WebSocket server started');
  res.end();
}
