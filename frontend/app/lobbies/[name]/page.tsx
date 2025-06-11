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
import { useMemo } from 'react';

// Mapping from die value to icon
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
  const lobbyName = params.name;

  const player = "You";
  const enemy = "Enemy";

  const dice = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => ({
      id: i,
      value: Math.floor(Math.random() * 6) + 1,
      offset: Math.floor(Math.random() * 200), // marginTop in px
    }));
  }, []);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Enemy name */}
      <div className="h-12 w-full flex flex-row items-center justify-center text-xl bg-[var(--color-table)] text-[var(--color-burgundy)] border-b border-[var(--color-burgundy)]">
        <GiBlackKnightHelm />
        <div className="ml-2">[ {enemy} ]</div>
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
                    <div className="text-black rounded-md flex items-center justify-center shadow text-4xl">
                      <Icon />
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
        <div className="ml-2">[ {player} ]</div>
      </div>
    </div>
  );
}
