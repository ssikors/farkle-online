'use client';

import { useParams } from 'next/navigation';
import {
  GiBlackKnightHelm,
  GiDiceSixFacesOne,
  GiDiceSixFacesTwo,
  GiDiceSixFacesThree,
  GiDiceSixFacesFour,
  GiDiceSixFacesFive,
  GiDiceSixFacesSix,
} from "react-icons/gi";
import { useEffect, useMemo, useRef, useState } from 'react';
import * as signalR from "@microsoft/signalr";

const diceIcons = {
  1: GiDiceSixFacesOne,
  2: GiDiceSixFacesTwo,
  3: GiDiceSixFacesThree,
  4: GiDiceSixFacesFour,
  5: GiDiceSixFacesFive,
  6: GiDiceSixFacesSix,
};

export default function LobbyPage() {
  const params = useParams();
  const lobbyName = params.name as string;

  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const [playerName, setPlayerName] = useState<string>("You");
  const [enemyName, setEnemyName] = useState<string>("Waiting...");

  const dice = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => ({
      id: i,
      value: Math.floor(Math.random() * 6) + 1,
      offset: Math.floor(Math.random() * 200),
    }));
  }, []);

  useEffect(() => {
    const storedName = localStorage.getItem("playerName") || "Anonymous";
    setPlayerName(storedName);

    if (!connectionRef.current) {
      const conn = new signalR.HubConnectionBuilder()
        .withUrl(`${process.env.NEXT_PUBLIC_API_URL}/hub`, {
          withCredentials: true,
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information)
        .build();

      connectionRef.current = conn;

      conn.onclose(error => {
        console.log("SignalR connection closed.", error);
      });

      conn.on("LobbyUpdated", (lobby) => {
        const enemy = lobby.ownerName === storedName ? lobby.playerName : lobby.ownerName;
        setEnemyName(enemy || "Waiting...");
      });

      conn.on("LobbyDeleted", () => {
        alert("Lobby has been closed.");
        window.location.href = "/";
      });

      conn.on("PlayerJoined", (name) => {
        console.log(`${name} joined the lobby`);
      });

      conn.start()
        .then(() => {
          console.log("Connected to SignalR hub");
          return conn.invoke("joinGame", lobbyName, storedName);
        })
        .catch(err => {
          console.error("SignalR Connection Error: ", err);
        });
    } else if (connectionRef.current.state === signalR.HubConnectionState.Connected) {
      // If connection already exists and is connected, just invoke joinGame again for the new lobbyName
      connectionRef.current.invoke("joinGame", lobbyName, storedName).catch(console.error);
    }

    return () => {
      // Cleanup on component unmount
      if (connectionRef.current) {
        connectionRef.current.stop().catch(console.error);
        connectionRef.current = null;
      }
    };
  }, [lobbyName]);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Enemy name */}
      <div className="h-12 w-full flex flex-row items-center justify-center text-xl bg-[var(--color-table)] text-[var(--color-burgundy)] border-b border-[var(--color-burgundy)]">
        <GiBlackKnightHelm />
        <div className="ml-2">[ {enemyName} ]</div>
      </div>

      {/* Tabletop */}
      <div className="flex-1 w-full grid grid-rows-2 divide-y divide-[var(--color-burgundy)] bg-[var(--color-table)] text-[var(--color-burgundy)]">
        {/* Enemy area */}
        <div className="flex items-center justify-center text-2xl w-full">
          Enemy's Dice Area
        </div>

        {/* Player area */}
        <div className="flex flex-row items-center justify-center text-2xl w-full">
          <div className="flex flex-col justify-center items-center h-full w-1/4">
            Dice put away
          </div>

          {/* Dice display */}
          <div className="flex h-full justify-center items-center w-1/2">
            <div className="flex gap-1">
              {dice.map(die => {
                const Icon = diceIcons[die.value as keyof typeof diceIcons];
                return (
                  <div
                    key={die.id}
                    className="relative flex items-center justify-center"
                    style={{ marginTop: `${die.offset}px` }}
                  >
                    <div className="text-[var(--color-burgundy)] p-2 flex items-center justify-center text-4xl border-2 border-[var(--color-table)] hover:border-amber-500 rounded-full">
                      <Icon className='bg-white rounded-sm' />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col justify-center items-center h-full w-1/4">
            Scores area
          </div>
        </div>
      </div>

      {/* Player name */}
      <div className="h-12 w-full flex flex-row items-center text-center justify-center text-xl bg-[var(--color-table)] text-[var(--color-burgundy)] border-t border-[var(--color-burgundy)]">
        <GiBlackKnightHelm />
        <div className="ml-2">[ {playerName} ]</div>
      </div>
    </div>
  );
}
