import { CollectionFilterState, SimpleBoardGame, BoardGame } from "@/types";
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

/**
 * MIN(√Best#,10) + Best% + (Rec% * 0.8)
 * See [v1.1.3 in this reply](https://boardgamegeek.com/thread/3028512/article/41805927#41805927) for more details why this formula.
 */
const calcSortScore = ({
  Best,
  BestPercent,
  RecommendedPercent,
}: BoardGame["recommendedPlayerCount"][number]) => {
  const maybeSortScore = Math.round(
    Math.min(Math.sqrt(Best), 10) + BestPercent + RecommendedPercent * 0.8
  );

  return Number.isNaN(maybeSortScore)
    ? Number.NEGATIVE_INFINITY
    : maybeSortScore;
};

const calcSortScoreAverage = (game: BoardGame): number => {
  const sortScores = game.recommendedPlayerCount
    .filter((g) => g.isPlayerCountWithinRange)
    .map(calcSortScore);

  const sortScoreSum = sortScores.reduce((a, b) => a + b, 0);

  return sortScoreSum / sortScores.length;
};

const sort: SortFn = (dir, a, b) => {
  const valueA = calcSortScoreAverage(a);
  const valueB = calcSortScoreAverage(b);

  return numberSort(dir, valueA, valueB);
};

export const playerCountRecommendationService = {
  addIsPlayerCountWithinRange,
  sort,
};
