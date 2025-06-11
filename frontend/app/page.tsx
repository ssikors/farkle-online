'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPlayerAsync } from './lib/lobby_service';

export default function Home() {
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState<string>('');

  const router = useRouter();

  const isValidNickname = (name: string): boolean => name.trim().length > 2;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isValidNickname(nickname)) {
      try {
        await createPlayerAsync(nickname);

        localStorage.setItem("playerName", nickname)

        router.push('/lobbies');
      } catch (e) {
        if (e instanceof Error) {
          setError(e.message);
        }
      }
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 items-center text-2xl"
        >
          <input
            type="text"
            placeholder="Enter your nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-800 bg-white text-black"
          />
          <button
            type="submit"
            className="bg-[#4b0000] text-white px-6 py-2 rounded-md hover:bg-[#5c0000] transition"
          >
            Join
          </button>
          {error != '' ? <div className='text-red-800'>{error}</div> : '' }
        </form>
      </main>
    </div>
  );
}
