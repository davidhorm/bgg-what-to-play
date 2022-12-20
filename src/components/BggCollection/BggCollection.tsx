import { applyFiltersAndSorts } from "./BggCollection.utils";
import { FilterControls } from "./FilterControls";
import { GameCard } from "./GameCard";
import { ProgressSpinner } from "./ProgressSpinner";
import { useCollectionFilters } from "./hooks/useCollectionFilters";
import { useGetCollectionQuery } from "./hooks/useGetCollectionQuery";

export const BggCollection = () => {
  const { loadingStatus, data } = useGetCollectionQuery("davidhorm");
  const filter = useCollectionFilters();

  // TODO: implement aria-busy? (p3)
  if (loadingStatus.status !== "FETCHING_COMPLETE" || !data)
    return <ProgressSpinner loadingStatus={loadingStatus} />;

  // TODO: add count of visible games (p2)
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
