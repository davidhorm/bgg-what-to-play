import type { CollectionFilterState } from "@/types";
import CircularProgress from "@mui/material/CircularProgress";
import { AcceptedResponse } from "./AcceptedResponse";
import { applyFiltersAndSorts } from "./BggCollection.utils";
import { GameCard } from "./GameCard";
import { MissingQueryValue } from "./MissingQueryValue";
import { useGetCollectionQuery } from "./hooks/useGetCollectionQuery";

type Props = {
  filterState: CollectionFilterState;
};

export const BggCollection = ({ filterState }: Props) => {
  const { data, pubdate, loadingMessage, error } = useGetCollectionQuery(
    filterState.username,
    filterState.showExpansions
  );

  if (!filterState.username) return <MissingQueryValue />;

  if (error?.isBoardGameAccepted) return <AcceptedResponse />;

  const filteredGames = applyFiltersAndSorts(data, filterState);

  return (
    <div>
      <section className="flex gap-4 px-4 pt-1 text-xs text-gray-500">
        <span>{pubdate}</span>
        <span>
          # of Games:
          {filteredGames.length !== data.length
            ? ` ${filteredGames.length} / `
            : ` `}
          {data.length}
        </span>
        {loadingMessage && (
          <span>
            {loadingMessage} <CircularProgress size="0.75rem" />
          </span>
        )}
      </section>

      <section className="flex flex-wrap">
        {filteredGames?.map((game) => (
          <GameCard key={game.id} game={game} filterState={filterState} />
        ))}
      </section>
    </div>
  );
};
