import { GameCard } from "./GameCard";
import { useGetCollectionQuery } from "./useGetCollectionQuery";

export const BggCollection = () => {
  const { isLoading, error, data } = useGetCollectionQuery("davidhorm");

  if (isLoading) return <>Loading...</>;

  if (error) return <>An error has occurred: {JSON.stringify(error)}</>;

  return (
    <div className="flex flex-wrap">
      {data?.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  );
};
