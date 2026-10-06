"use client";

import { useFilterState } from "@/components/ServiceProvider";
import Button from "@mui/material/Button";
import { FilterStatus } from "./FilterStatus";
import { GameCard } from "./GameCard";
import { useGetCollectionQuery } from "./hooks/useGetCollectionQuery";

export const BggCollection = () => {
  const {
    filterState: { username, showExpansions, friendUsernames, includeFriends },
    applyFiltersAndSorts,
  } = useFilterState();

  const { data, pubdate, loadingMessage, statuses, thingErrors } =
    useGetCollectionQuery(
      username,
      showExpansions,
      friendUsernames,
      includeFriends,
    );

  if (!username.trim()) return null;

  const filteredGames = applyFiltersAndSorts(data);

  return (
    <div>
      <ul
        aria-label="Collection loading status"
        aria-live="polite"
        className="list-none px-4"
      >
        {statuses.map((status) => (
          <li key={status.key}>
            {status.username} ({status.kind}): {status.message}
            {status.retry && (
              <Button
                onClick={status.retry}
                aria-label={`Retry ${status.username} ${status.kind}`}
              >
                Retry
              </Button>
            )}
          </li>
        ))}
        {thingErrors.map((status) => (
          <li key={status.key}>
            Game details: {status.message}
            <Button onClick={status.retry}>Retry game details</Button>
          </li>
        ))}
      </ul>
      <FilterStatus
        pubdate={pubdate}
        filteredGamesLength={filteredGames.length}
        totalGamesLength={data.length}
        loadingMessage={loadingMessage}
      />

      <ol
        aria-label="Search results"
        aria-busy={!!loadingMessage}
        aria-describedby={loadingMessage ? "loading-search-results" : undefined}
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
