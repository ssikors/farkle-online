"use client";

import { useEffect, useState } from "react";

type Lobby = {
  id: string;
  playerOne: string;
  playerTwo: string;
};

export default function Lobbies() {
  const [loading, setLoading] = useState(true);
  const [lobbies, setLobbies] = useState<Lobby[]>([]);

  useEffect(() => {
    const fetchLobbies = async () => {
      try {
        const res = await fetch("/api/lobbies");
        const data = await res.json();
        console.log("data");
        console.log(data);
        setLobbies(data);
      } catch (err) {
        console.error("Failed to fetch lobbies:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLobbies();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Lobbies</h1>
      {lobbies.length == 0 ? (
        <p>No lobbies found.</p>
      ) : (
        <ul>
          {lobbies.map((lobby) => (
            <li key={lobby.id}>
              {lobby.playerOne} vs {lobby.playerTwo}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}