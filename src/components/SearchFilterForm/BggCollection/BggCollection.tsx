import type { CollectionFilterState } from "@/types";
import { applyFiltersAndSorts } from "./BggCollection.utils";
import { GameCard } from "./GameCard";
import { MissingQueryValue } from "./MissingQueryValue";
import { NoDataDisplay } from "./NoDataDisplay";
import { useGetCollectionQuery } from "./hooks/useGetCollectionQuery";

type Props = {
  filterState: CollectionFilterState;
};

export const BggCollection = ({ filterState }: Props) => {
  const { loadingStatus, data, pubdate } = useGetCollectionQuery(
    filterState.username,
    filterState.showExpansions
  );

  if (!filterState.username) return <MissingQueryValue />;

  if (loadingStatus.status !== "FETCHING_COMPLETE" || !data)
    return <NoDataDisplay loadingStatus={loadingStatus} />;

  const filteredGames = applyFiltersAndSorts(data, filterState);

  return (
    <div>
      <section className="flex gap-4 px-4 text-xs text-gray-500">
        <span>
          {pubdate
            ? `Collection as of: ${new Date(pubdate).toLocaleDateString()}`
            : ""}
        </span>
        <span>
          # of Games:
          {filteredGames.length !== data.length
            ? ` ${filteredGames.length} / `
            : ` `}
          {data.length}
        </span>
      </section>

      <section className="flex flex-wrap">
        {filteredGames?.map((game) => (
          <GameCard key={game.id} game={game} filterState={filterState} />
        ))}
      </section>
    </div>
  );
};
