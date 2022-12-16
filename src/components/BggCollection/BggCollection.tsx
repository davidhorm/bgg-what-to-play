import { GameCard } from "./GameCard";
import { useGetCollectionQuery } from "./useGetCollectionQuery";

export const BggCollection = () => {
  const { isLoading, error, data } = useGetCollectionQuery("davidhorm");

  if (isLoading) return <>Loading...</>;

  if (error) return <>An error has occurred: {JSON.stringify(error)}</>;

  // TODO: filter to show only valid player count (p1)
  // TODO: build filter and sort by specific player count (p1)
  // TODO: render user's collection last published date (p3)
  return (
    <div className="flex flex-wrap">
      {data?.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  );
};
