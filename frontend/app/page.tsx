'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [nickname, setNickname] = useState('');
  const router = useRouter();

  const isValidNickname = (name: string): boolean => name.trim().length > 2;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValidNickname(nickname)) {
      router.push('/lobbies');
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
        </form>
      </main>
    </div>
  );
}
