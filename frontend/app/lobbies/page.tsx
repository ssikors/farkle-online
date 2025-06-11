"use client";

import { useEffect, useState } from "react";
import { Lobby } from "../lib/types";
import { createLobbyAsync, getLobbiesAsync } from "../lib/lobby_service";
import { GiBlackKnightHelm } from "react-icons/gi";
import { MdOutlineLogin } from "react-icons/md";
import { useRouter } from "next/navigation";

export default function Lobbies() {
  const [loading, setLoading] = useState(true);
  const [lobbies, setLobbies] = useState<Lobby[]>([]);
  const [lobbyName, setLobbyName] = useState("");

  const router = useRouter();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const fetchLobbies = async () => {
      try {
        const lobbies: Lobby[] = await getLobbiesAsync();
        setLobbies(lobbies);
      } catch (err) {
        console.error("Failed to fetch lobbies:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLobbies().then(() => {
      interval = setInterval(fetchLobbies, 3000);
    });

    return () => clearInterval(interval);
  }, []);

  const handleCreateLobby = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lobbyName.trim()) return;

    try {
      await createLobbyAsync(localStorage.getItem("playerName")!, lobbyName);

      router.push(`/lobbies/${encodeURIComponent(lobbyName)}`);
    } catch (error) {
      console.error("Failed to create lobby:", error);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center w-full h-full">
        Loading...
      </div>
    );

  return (
    <div className="flex flex-col w-full h-full p-4 items-center overflow-hidden">
      <h1 className="text-5xl font-bold mb-4 text-center">Lobbies</h1>

      <div className="flex-1 w-3/5 overflow-y-auto border-4 border-[var(--color-burgundy)] bg-[var(--color-parchment)] rounded-sm p-3 mb-6">
        {lobbies.length === 0 ? (
          <p className="text-center">No lobbies found.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {lobbies.map((lobby) => (
              <li
                key={lobby.name}
                className="flex items-center bg-[var(--color-burgundy)] py-3 px-6 rounded-lg text-amber-50 text-2xl"
              >
                <div className="w-1/3 justify-start">{lobby.name}</div>
                <div className="w-1/3 flex justify-center items-center gap-2 text-lg">
                  <GiBlackKnightHelm className="text-xl" />
                  {lobby.ownerName}
                </div>

                <div className="flex w-1/3 justify-end">
                  <MdOutlineLogin className="scale-110 hover:scale-125 hover:text-amber-200 hover:cursor-pointer" />
                </div>
                
              </li>
            ))}
          </ul>
        )}
      </div>

      <form
        onSubmit={handleCreateLobby}
        className="flex flex-row gap-2 items-center justify-center text-2xl"
      >
        <input
          type="text"
          placeholder="Lobby name"
          value={lobbyName}
          onChange={(e) => setLobbyName(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-800 bg-white text-black"
        />
        <button
          type="submit"
          className="bg-[#4b0000] text-white px-6 py-2 rounded-md hover:bg-[#5c0000] transition"
        >
          Create
        </button>
      </form>
    </div>
  );
}
