import { applyFiltersAndSorts } from "./BggCollection.utils";
import { FilterControls } from "./FilterControls";
import { GameCard } from "./GameCard";
import { ProgressSpinner } from "./ProgressSpinner";
import { useCollectionFilters } from "./useCollectionFilters";
import { useGetCollectionQuery } from "./useGetCollectionQuery";

export const BggCollection = () => {
  const { loadingStatus, error, data } = useGetCollectionQuery("davidhorm");
  const filter = useCollectionFilters();

  // TODO: implement aria-busy? (p3)
  if (loadingStatus.status !== "FETCHING_COMPLETE")
    return <ProgressSpinner loadingStatus={loadingStatus} />;

  if (error) return <>An error has occurred: {JSON.stringify(error)}</>;

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
