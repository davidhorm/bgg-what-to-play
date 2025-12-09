'use client';

import Image from "next/image";
import { useFilterState } from "../ServiceProvider";

export const MaybeHeader = () => {
  const {
    filterState: { username },
  } = useFilterState();

  return !username ? (
    <header className="p-4">
      <div className="flex flex-row gap-4 flex-wrap items-end">
        <h1 className="m-1 text-5xl">What to Play</h1>
        <a href="https://boardgamegeek.com/" className="h-12 mb-2 sm:mb-0">
          <Image
            src="/powered-by-bgg.png"
            alt="Powered by BGG"
            priority
            width={1472}
            height={432}
            className="h-full w-auto"
          />
        </a>
      </div>
      <p>
        Filter and sort your <a href="https://boardgamegeek.com/">BGG</a> collection by different criteria to determine what to play.
      </p>
    </header>
  ) : (
    <></>
  );
};
