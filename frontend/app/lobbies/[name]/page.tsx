"use client"

import { useParams } from 'next/navigation';

export default function LobbyPage() {
  const params = useParams();
  const lobbyName = params.name;

  return <div>Welcome to lobby: {lobbyName}</div>;
}
