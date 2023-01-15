import type { CollectionFilterState } from "@/types";
import type { SimpleBoardGame } from ".";

//#region maybeShowInvalidPlayerCount

const removeRecsLessThan =
  (minPlayers: SimpleBoardGame["minPlayers"]) =>
  (rec: SimpleBoardGame["recommendedPlayerCount"][number]): boolean =>
    rec.playerCountValue >= minPlayers;

const removeRecsMoreThan =
  (maxPlayers: SimpleBoardGame["maxPlayers"]) =>
  (rec: SimpleBoardGame["recommendedPlayerCount"][number]): boolean =>
    rec.playerCountValue <= maxPlayers;

const maybeShowInvalidPlayerCount =
  (filterState: CollectionFilterState) =>
  (game: SimpleBoardGame): SimpleBoardGame =>
    filterState.showInvalidPlayerCount
      ? game
      : {
          ...game,
          recommendedPlayerCount: game.recommendedPlayerCount
            .filter(removeRecsLessThan(game.minPlayers))
            .filter(removeRecsMoreThan(game.maxPlayers)),
        };

//#endregion maybeShowInvalidPlayerCount

const calcValueIsWithinRanage = (value: number, min: number, max: number) =>
  min <= value && value <= max;

const addIsPlayerCountWithinRange =
  (filterState: CollectionFilterState) => (game: SimpleBoardGame) => {
    const [minFilterCount, maxFilterCount] = filterState.playerCountRange;

    const minWithinRange = calcValueIsWithinRanage(
      game.minPlayers,
      minFilterCount,
      maxFilterCount
    );
    const maxWithinRange = calcValueIsWithinRanage(
      game.maxPlayers,
      minFilterCount,
      maxFilterCount
    );

    return {
      ...game,

      /** Is `true` if the Board Game's min or max player count is within the filter's Player Count Range. */
      isPlayerCountWithinRange: minWithinRange || maxWithinRange,

      /** Board Game's recommended player count according to BGG poll */
      recommendedPlayerCount: game.recommendedPlayerCount.map((rec) => ({
        ...rec,

        /** Is `true` if the Poll's Player Count value is within the filter's Player Count Range. */
        isPlayerCountWithinRange: calcValueIsWithinRanage(
          rec.playerCountValue,
          minFilterCount,
          maxFilterCount
        ),
      })),
    };
  };

//#region maybeSortByScore

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

const maybeSortByScore =
  (filterState: CollectionFilterState) =>
  (gameA: SimpleBoardGame, gameB: SimpleBoardGame): number => {
    const [minRange, maxRange] = filterState.playerCountRange;

    if (minRange !== 1 || maxRange !== Number.POSITIVE_INFINITY) {
      return (
        calcSortScoreSum(gameB, minRange, maxRange) -
        calcSortScoreSum(gameA, minRange, maxRange)
      );
    }

    return 0;
  };

//#endregion maybeSortByScore

export const applyFiltersAndSorts = (
  games: SimpleBoardGame[],
  filterState: CollectionFilterState
) =>
  games
    ?.map(maybeShowInvalidPlayerCount(filterState))
    .map(addIsPlayerCountWithinRange(filterState))
    .filter((g) => g.isPlayerCountWithinRange) // Remove games not within Player Count Range
    .sort(maybeSortByScore(filterState));

export type BoardGame = ReturnType<typeof applyFiltersAndSorts>[number];
