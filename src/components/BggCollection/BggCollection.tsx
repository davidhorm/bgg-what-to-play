import { applyFiltersAndSorts } from "./BggCollection.utils";
import { FilterControls } from "./FilterControls";
import { GameCard } from "./GameCard";
import { useCollectionFilters } from "./useCollectionFilters";
import { useGetCollectionQuery } from "./useGetCollectionQuery";

export const BggCollection = () => {
  const { isLoading, error, data } = useGetCollectionQuery("davidhorm");
  const filter = useCollectionFilters();

  if (isLoading) return <>Loading...</>;

  if (error) return <>An error has occurred: {JSON.stringify(error)}</>;

  // TODO: build filter and sort by specific player count (p1)
  // TODO: render user's collection last published date (p3)
  return (
    <main>
      <FilterControls filter={filter} />
      <section className="flex flex-wrap">
        {applyFiltersAndSorts(data, filter.filterState)?.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </section>
    </main>
  );
};
