"use client";

import { useFilterState } from "@/components/ServiceProvider";
import { AcceptedResponse } from "./AcceptedResponse";
import { FilterStatus } from "./FilterStatus";
import { GameCard } from "./GameCard";
import { MissingSomethingResponse } from "./MissingSomethingResponse";
import { useGetCollectionQuery } from "./hooks/useGetCollectionQuery";

export const BggCollection = () => {
  const {
    filterState: { username, showExpansions },
    applyFiltersAndSorts,
  } = useFilterState();

  const { data, pubdate, loadingMessage, error, boardGameCollectionStatus } =
    useGetCollectionQuery(username, showExpansions);

  if (boardGameCollectionStatus === "loading") return <></>;

  if (error?.isBoardGameAccepted) return <AcceptedResponse />;

  if (error?.isBoardGameEmpty)
    return (
      <MissingSomethingResponse message="You have zero games in your collection?" />
    );

  const filteredGames = applyFiltersAndSorts(data);

  return (
    <div>
      <FilterStatus
        pubdate={pubdate}
        filteredGamesLength={filteredGames.length}
        totalGamesLength={data.length}
        loadingMessage={loadingMessage}
      />

      <ol
        aria-label="Search results"
        aria-busy={!!loadingMessage}
        aria-describedby="loading-search-results"
        className="m-0 grid list-none grid-cols-1 gap-4 p-0 text-center sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
      >
        {filteredGames?.map((game) => (
          <li key={game.id}>
            <GameCard game={game} />
          </li>
        ))}
        {Array.from({ length: 10 }).map((_, i) => (
          <li key={`placeholder-${i}`} aria-hidden="true"></li>
        ))}
      </ol>
    </div>
  );
};
