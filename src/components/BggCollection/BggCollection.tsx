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
        className="m-0 flex list-none flex-wrap gap-4 p-0 text-center"
      >
        {filteredGames?.map((game) => (
          <li key={game.id} className="min-w-[40ch] flex-1">
            <GameCard game={game} />
          </li>
        ))}
        {Array.from({ length: 10 }).map((_, i) => (
          <li
            key={`placeholder-${i}`}
            className="m-2 min-w-[40ch] flex-1"
            aria-hidden="true"
          ></li>
        ))}
      </ol>
    </div>
  );
};
