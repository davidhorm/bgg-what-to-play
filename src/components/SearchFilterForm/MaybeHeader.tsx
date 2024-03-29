import { useFilterState } from "../ServiceProvider";

export const MaybeHeader = () => {
  const {
    filterState: { username },
  } = useFilterState();

  return !username ? (
    <header className="p-4">
      <h1 className="m-1 text-5xl">What to Play</h1>
      <div>
        Filter and sort your <a href="https://boardgamegeek.com/">BGG</a>{" "}
        collection by different criteria to determine what to play.
      </div>
    </header>
  ) : (
    <></>
  );
};
