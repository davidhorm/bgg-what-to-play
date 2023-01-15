import type { CollectionFilterState } from "@/types";
import type { BoardGame } from ".";

const removeRecsLessThan =
  (minPlayers: BoardGame["minPlayers"]) =>
  (rec: BoardGame["recommendedPlayerCount"][number]): boolean =>
    rec.playerCountValue >= minPlayers;

const removeRecsMoreThan =
  (maxPlayers: BoardGame["maxPlayers"]) =>
  (rec: BoardGame["recommendedPlayerCount"][number]): boolean =>
    rec.playerCountValue <= maxPlayers;

const maybeShowInvalidPlayerCount =
  (filterState: CollectionFilterState) =>
  (game: BoardGame): BoardGame =>
    filterState.showInvalidPlayerCount
      ? game
      : {
          ...game,
          recommendedPlayerCount: game.recommendedPlayerCount
            .filter(removeRecsLessThan(game.minPlayers))
            .filter(removeRecsMoreThan(game.maxPlayers)),
        };

/** TODO: Add unit tests (p3) */
const removeGamesNotWithinPlayerCountRange =
  (filterState: CollectionFilterState) =>
  (game: BoardGame): boolean => {
    const [minFilterCount, maxFilterCount] = filterState.playerCountRange;

    const minWithinRange =
      minFilterCount <= game.minPlayers && game.minPlayers <= maxFilterCount;
    const maxWithinRange =
      minFilterCount <= game.maxPlayers && game.maxPlayers <= maxFilterCount;

    return minWithinRange || maxWithinRange;
  };

const calcSortScoreSum = (
  game: BoardGame,
  minRange: number,
  maxRange: number
): number =>
  game.recommendedPlayerCount
    .filter(
      (g) => minRange <= g.playerCountValue && g.playerCountValue <= maxRange
    )
    .reduce((prev, curr) => curr.sortScore + prev, 0);

const maybeSortByScore =
  (filterState: CollectionFilterState) =>
  (gameA: BoardGame, gameB: BoardGame): number => {
    const [minRange, maxRange] = filterState.playerCountRange;

    if (minRange !== 1 || maxRange !== Number.POSITIVE_INFINITY) {
      return (
        calcSortScoreSum(gameB, minRange, maxRange) -
        calcSortScoreSum(gameA, minRange, maxRange)
      );
    }

    return 0;
  };

export const applyFiltersAndSorts = (
  games: BoardGame[],
  filterState: CollectionFilterState
) =>
  games
    ?.map(maybeShowInvalidPlayerCount(filterState))
    .filter(removeGamesNotWithinPlayerCountRange(filterState))
    .sort(maybeSortByScore(filterState));
