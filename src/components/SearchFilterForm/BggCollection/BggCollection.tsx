import type { CollectionFilterReducer } from "@/types";
import { AcceptedResponse } from "./AcceptedResponse";
import { FilterStatus } from "./FilterStatus";
import { GameCard } from "./GameCard";
import { MissingSomethingResponse } from "./MissingSomethingResponse";
import { useGetCollectionQuery } from "./hooks/useGetCollectionQuery";

type Props = Pick<
  CollectionFilterReducer,
  "filterState" | "applyFiltersAndSorts"
>;

export const BggCollection = ({ filterState, applyFiltersAndSorts }: Props) => {
  const { data, pubdate, loadingMessage, error } = useGetCollectionQuery(
    filterState.username,
    filterState.showExpansions
  );

  if (!data) return <></>;

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
            <GameCard game={game} filterState={filterState} />
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
