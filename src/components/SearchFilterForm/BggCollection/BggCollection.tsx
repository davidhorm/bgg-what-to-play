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
  const { loadingStatus, data } = useGetCollectionQuery(username);
  const filter = useCollectionFilters();

  if (!username) return <MissingQueryValue />;

  if (loadingStatus.status !== "FETCHING_COMPLETE" || !data)
    return <NoDataDisplay loadingStatus={loadingStatus} />;

  // TODO: add count of visible games (p2)
  // TODO: render user's collection last published date (p3)
  return (
    <div>
      <FilterControls filter={filter} />
      <section className="flex flex-wrap">
        {applyFiltersAndSorts(data, filter.filterState)?.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </section>
    </div>
  );
};
