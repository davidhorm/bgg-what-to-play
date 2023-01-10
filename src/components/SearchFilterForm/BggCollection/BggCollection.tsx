import { applyFiltersAndSorts } from "./BggCollection.utils";
import { FilterControls } from "./FilterControls";
import { GameCard } from "./GameCard";
import { MissingQueryValue } from "./MissingQueryValue";
import { NoDataDisplay } from "./NoDataDisplay";
import { useCollectionFilters } from "./hooks/useCollectionFilters";
import { useGetCollectionQuery } from "./hooks/useGetCollectionQuery";

type Props = {
  username: string;
};

export const BggCollection = ({ username }: Props) => {
  const { loadingStatus, data, pubdate } = useGetCollectionQuery(username);
  const filter = useCollectionFilters();

  if (!username) return <MissingQueryValue />;

  if (loadingStatus.status !== "FETCHING_COMPLETE" || !data)
    return <NoDataDisplay loadingStatus={loadingStatus} />;

  const filteredGames = applyFiltersAndSorts(data, filter.filterState);

  return (
    <div>
      <FilterControls filter={filter} />

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
          <GameCard key={game.id} game={game} />
        ))}
      </section>
    </div>
  );
};
