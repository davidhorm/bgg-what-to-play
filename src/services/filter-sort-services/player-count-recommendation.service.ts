import { CollectionFilterState, SimpleBoardGame } from "@/types";
import { numberSort, SortFn } from "./sort.service";

/** Used to determine which bar to highlight in the graph */
const addIsPlayerCountWithinRange =
  (filterState: CollectionFilterState) => (games: SimpleBoardGame[]) => {
    const [minFilterCount, maxFilterCount] = filterState.playerCountRange;

    return games.map((game) => ({
      ...game,

      /** Board Game's recommended player count according to BGG poll */
      recommendedPlayerCount: game.recommendedPlayerCount.map((rec) => ({
        ...rec,

        /** Is `true` if the Poll's Player Count value is within the filter's Player Count Range. */
        isPlayerCountWithinRange:
          minFilterCount <= rec.playerCountValue &&
          rec.playerCountValue <= maxFilterCount,
      })),
    }));
  };

const calcSortScoreSum = (
  game: SimpleBoardGame,
  minRange: number,
  maxRange: number
): number =>
  game.recommendedPlayerCount
    .filter(
      (g) => minRange <= g.playerCountValue && g.playerCountValue <= maxRange
    )
    .reduce((prev, curr) => curr.sortScore + prev, 0);

const sort: SortFn = (dir, a, b, filterState) => {
  const [minRange, maxRange] = filterState.playerCountRange;

  const valueA = calcSortScoreSum(a, minRange, maxRange);
  const valueB = calcSortScoreSum(b, minRange, maxRange);

  return numberSort(dir, valueA, valueB);
};

export const playerCountRecommendationService = {
  addIsPlayerCountWithinRange,
  sort,
};
