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
import { useEffect, useRef, useState, useMemo } from 'react';
import * as signalR from "@microsoft/signalr";
import { GameState } from '@/app/lib/types';

// Import your scoring utility functions here:
import { hasScorableSubset, isScorableSelection } from '@/app/lib/game_logic'; // adjust path as needed
import Image from 'next/image';

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
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [message, setMessage] = useState<string>("Waiting for the game to start...");
  const [owner, setOwner] = useState<string>("");
  const [selectedDice, setSelectedDice] = useState<number[]>([]);
  const [diceOffsets, setDiceOffsets] = useState<number[]>([]);
  const [winnerModalVisible, setWinnerModalVisible] = useState(false);
  const [winnerName, setWinnerName] = useState<string | null>(null);


  useEffect(() => {
    setSelectedDice([]);
    setDiceOffsets(prev => {
      const dice = gameState?.diceList;
      if (!dice) return prev; // prevent returning undefined
      if (prev.length === dice.length) return prev;
      return dice.map(() => Math.floor(Math.random() * 100));
    });
  }, [gameState?.ownerTurn]);

  useEffect(() => {
    const storedName = localStorage.getItem("playerName") || "Anonymous";
    setPlayerName(storedName);

    if (owner === "") {
      setOwner(storedName);
    }

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

      conn.on("GameStateUpdated", (gameState: GameState) => {
        const victorySound = new Audio('/sounds/move.mp3');
        victorySound.volume = 0.3;
        victorySound.play().catch(console.error);

        setGameState(gameState);
        setMessage(gameState.started ? "Game in progress..." : "Waiting for the game to start...");
      });

      conn.on("GameFinished", (winner: string) => {
        setWinnerName(winner.toUpperCase());
        setWinnerModalVisible(true);

        const victorySound = new Audio('/sounds/victory.mp3');
        victorySound.volume = 0.5;
        victorySound.play().catch(console.error);


        setTimeout(() => {
          setWinnerModalVisible(false);
          setWinnerName(null);
        }, 5000);
      });


      conn.on("LobbyUpdated", (lobby) => {
        const enemy = lobby.ownerName === storedName ? lobby.playerName : lobby.ownerName;
        if (owner !== lobby.ownerName) {
          setOwner(lobby.ownerName);
        }
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
      connectionRef.current.invoke("joinGame", lobbyName, storedName).catch(console.error);
    }

    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop().catch(console.error);
        connectionRef.current = null;
      }
    };
  }, [lobbyName]);

  async function startGame() {
    try {
      await connectionRef.current?.invoke("startGame", lobbyName);
    } catch (err) {
      console.error("Failed to start game:", err);
    }
  }

  const renderDice = (diceList: number[]) => {
    return (
      <div className="flex gap-1">
        {diceList.sort().map((value, index) => {
          const Icon = diceIcons[value as keyof typeof diceIcons];
          const offset = diceOffsets[index] || 0;
          const selected = selectedDice.includes(index);

          const toggleDice = () => {
            setSelectedDice((prev) =>
              prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
            );
            console.log("selectedDice")
            console.log(selectedDice)
            console.log("diceList")
            console.log(diceList)
          };

          return (
            <div
              key={index}
              className="relative flex items-center justify-center"
              style={{ marginTop: `${offset}px` }}
            >
              <div
                onClick={toggleDice}
                className={`text-burgundy p-2 flex items-center justify-center text-4xl border-2 ${selected ? "border-red-600" : "border-table"
                  } hover:border-amber-500 hover:cursor-pointer rounded-full`}
              >
                <Icon className="bg-white rounded-sm" />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const isPlayerOwner = playerName === owner;
  const isPlayersTurn = gameState?.ownerTurn === isPlayerOwner;

  // Calculate if entire dice set has scorable subsets
  const hasAnyScorable = useMemo(() => {
    if (!gameState) return false;
    return hasScorableSubset(gameState.diceList);
  }, [gameState]);

  // Calculate if the selected dice form a scorable selection
  const isValidSelection = useMemo(() => {
    if (!gameState) return false;
    const selectedValues = selectedDice.map(i => gameState.diceList[i]);
    return isScorableSelection(selectedValues);
  }, [selectedDice, gameState]);

  const scoreAndPass = async () => {
  try {
    if (!gameState?.diceList) return;

    const sortedDice = [...gameState.diceList].sort();
    const scoringDice = selectedDice.map(i => sortedDice[i]);

    console.log("scoring")
    console.log(scoringDice)

    await connectionRef.current?.invoke("scoreAndPass", lobbyName, scoringDice);
    setSelectedDice([]);
  } catch (err) {
    console.error("Failed to score and pass:", err);
  }
};

const scoreAndRoll = async () => {
  try {
    if (!gameState?.diceList) return;

    const sortedDice = [...gameState.diceList].sort();
    const scoringDice = selectedDice.map(i => sortedDice[i]);

    console.log("scoring")
    console.log(scoringDice)

    await connectionRef.current?.invoke("scoreAndRoll", lobbyName, scoringDice);
    setSelectedDice([]);
  } catch (err) {
    console.error("Failed to score and roll:", err);
  }
};


  const pass = async () => {
    try {
      await connectionRef.current?.invoke("endTurn", lobbyName);
      setSelectedDice([]);
    } catch (err) {
      console.error("Failed to pass:", err);
    }
  };


  const buttonClass = "py-1 px-4 rounded-md bg-burgundy text-white text-sm shadow-black shadow-sm hover:cursor-pointer hover:text-amber-200 hover:bg-red-900 disabled:opacity-50 disabled:cursor-not-allowed";

  const startButton = (
    <div
      onClick={startGame}
      className={buttonClass}
    >
      Play
    </div>
  );

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {winnerModalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fadeIn">
          <div className="bg-parchment text-burgundy text-2xl font-bold px-8 py-6 rounded-lg shadow-lg border-2 border-burgundy">
            Game over! {winnerName} wins 🎉
          </div>
        </div>
      )}

      <div className="h-12 w-full flex flex-row items-center justify-center text-xl bg-table text-burgundy border-b border-burgundy">
        <GiBlackKnightHelm />
        <div className="ml-2">[ {enemyName} ]</div>
      </div>

      <div className="flex-1 w-full grid grid-rows-[1fr_auto_1fr] divide-y divide-burgundy bg-table text-burgundy">
        <div className="flex items-center justify-center text-2xl w-full">
          <div className="flex flex-col justify-center items-center h-full w-1/4">
          </div>
          <div className="flex h-full justify-center items-center w-1/2">
            {gameState && !isPlayersTurn && renderDice(gameState.diceList.sort())}
          </div>
          <div className="flex flex-col justify-center items-center h-full w-1/4">
            <div className="text-sm">Enemy's Score</div>
            <div className="text-lg font-bold">
              {isPlayerOwner ? gameState?.playerScore : gameState?.ownerScore}
            </div>
            <div className="text-xs italic">
              Round: {isPlayerOwner ? gameState?.playerRoundScore : gameState?.ownerRoundScore}
            </div>
          </div>

        </div>

        <div className="py-2 flex items-center justify-center text-lg italic text-burgundy bg-parchment">
          {!gameState || !gameState.started
            ? (playerName === owner ? startButton : message)
            : message}
        </div>

        <div className="flex shrink items-center justify-center text-2xl w-full">
          <div className="flex justify-start items-center h-full w-1/4">
            <Image width={200} height={200} src={'/scoring.jpg' } alt={''}></Image>
          </div>

          <div className="flex flex-col h-full justify-around items-center w-1/2">
            {gameState && isPlayersTurn &&
              <>
                {renderDice(gameState.diceList)}
                <div className='flex flex-row justify-center items-center gap-2'>
                  <button
                    onClick={scoreAndPass}
                    className={buttonClass}
                    disabled={selectedDice.length == 0 || (!hasAnyScorable || !isValidSelection)}
                  >
                    Score & pass
                  </button>
                  <button
                    onClick={scoreAndRoll}
                    className={buttonClass}
                    disabled={selectedDice.length == 0 || (!hasAnyScorable || !isValidSelection)}
                  >
                    Score & roll
                  </button>
                  <button
                    onClick={pass}
                    className={buttonClass}
                  >
                    Pass
                  </button>
                </div>
              </>}
          </div>
          <div className="flex flex-col justify-center items-center h-full w-1/4">
            <div className="text-sm">Your Score</div>
            <div className="text-lg font-bold">
              {isPlayerOwner ? gameState?.ownerScore : gameState?.playerScore}
            </div>
            <div className="text-xs italic">
              Round: {isPlayerOwner ? gameState?.ownerRoundScore : gameState?.playerRoundScore}
            </div>
          </div>

        </div>
      </div>

      <div className="h-12 w-full flex flex-row items-center text-center justify-center text-xl bg-table text-burgundy border-t border-burgundy">
        <GiBlackKnightHelm />
        <div className="ml-2">[ {playerName} ]</div>
      </div>
    </div>
  );
}
