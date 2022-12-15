import { useGetCollectionQuery } from "./useGetCollectionQuery";
import { GameCard } from "./GameCard";

export const BggCollection = () => {
  const { isLoading, error, data } = useGetCollectionQuery("davidhorm");

  if (isLoading) return <>Loading...</>;

  if (error) return <>An error has occurred: {JSON.stringify(error)}</>;

  return (
    <>
      {data?.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </>
  );
};
