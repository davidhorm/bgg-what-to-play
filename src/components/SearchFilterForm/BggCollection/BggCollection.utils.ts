import type { CollectionFilterState } from "@/types";
import type { SimpleBoardGame } from ".";

const maybeOutputList =
  <T extends SimpleBoardGame>(
    filterState: CollectionFilterState,
    groupLabel: string
  ) =>
  (game: T, index: number, array: T[]) => {
    if (filterState.isDebug && index === 0) {
      console.groupCollapsed(groupLabel);
      console.table(array.map(({ id, name }) => ({ id, name })));
      console.groupEnd();
    }

    return game;
  };

const maybeShowExpansions =
  (filterState: CollectionFilterState) => (game: SimpleBoardGame) => {
    if (filterState.showExpansions) return true;

    return game.type === "boardgame";
  };

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

const isBoardGameRangeWithinFilterRange = (
  boardgameRange: [number, number],
  filterRange: [number, number]
): boolean => {
  const [boardgameMin, boardgameMax] = boardgameRange;
  const [filterMin, filterMax] = filterRange;

  return (
    (filterMin <= boardgameMin && boardgameMin <= filterMax) ||
    (filterMin <= boardgameMax && boardgameMax <= filterMax) ||
    (boardgameMin <= filterMin && filterMin <= boardgameMax) ||
    (boardgameMin <= filterMax && filterMax <= boardgameMax)
  );
};

const addIsPlayerCountWithinRange =
  (filterState: CollectionFilterState) => (game: SimpleBoardGame) => {
    const [minFilterCount, maxFilterCount] = filterState.playerCountRange;

    const isPlayerCountWithinRange =
      isBoardGameRangeWithinFilterRange(
        [game.minPlayers, game.maxPlayers],
        filterState.playerCountRange
      ) ||
      // handle edge case for id = 40567
      (filterState.showInvalidPlayerCount && game.minPlayers === 0);

    return {
      ...game,

      /** Is `true` if the Board Game's min or max player count is within the filter's Player Count Range. */
      isPlayerCountWithinRange,

      /** Board Game's recommended player count according to BGG poll */
      recommendedPlayerCount: game.recommendedPlayerCount.map((rec) => ({
        ...rec,

        /** Is `true` if the Poll's Player Count value is within the filter's Player Count Range. */
        isPlayerCountWithinRange:
          minFilterCount <= rec.playerCountValue &&
          rec.playerCountValue <= maxFilterCount,
      })),
    };
  };

const isPlaytimeWithinRange =
  (filterState: CollectionFilterState) => (game: SimpleBoardGame) =>
    isBoardGameRangeWithinFilterRange(
      [game.minPlaytime, game.maxPlaytime],
      filterState.playtimeRange
    );

const isComplexityWithinRange =
  (filterState: CollectionFilterState) => (game: SimpleBoardGame) =>
    isBoardGameRangeWithinFilterRange(
      [game.averageWeight, game.averageWeight],
      filterState.complexityRange
    );

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
    // if using non-default player range, then sort by score
    const [minRange, maxRange] = filterState.playerCountRange;
    if (minRange !== 1 || maxRange !== Number.POSITIVE_INFINITY) {
      return (
        calcSortScoreSum(gameB, minRange, maxRange) -
        calcSortScoreSum(gameA, minRange, maxRange)
      );
    }

    // else sort by game name by default.
    return gameA.name.localeCompare(gameB.name);
  };

//#endregion maybeSortByScore

export const applyFiltersAndSorts = (
  games: SimpleBoardGame[],
  filterState: CollectionFilterState
) =>
  games
    ?.map(maybeOutputList(filterState, "All Games"))
    .filter(maybeShowExpansions(filterState))
    .map(maybeOutputList(filterState, "maybeShowExpansions"))
    .map(maybeShowInvalidPlayerCount(filterState))
    .map(addIsPlayerCountWithinRange(filterState))
    .filter((g) => g.isPlayerCountWithinRange) // Remove games not within Player Count Range
    .map(maybeOutputList(filterState, "isPlayerCountWithinRange"))
    .filter(isPlaytimeWithinRange(filterState))
    .map(maybeOutputList(filterState, "isPlaytimeWithinRange"))
    .filter(isComplexityWithinRange(filterState))
    .map(maybeOutputList(filterState, "isComplexityWithinRange"))
    .sort(maybeSortByScore(filterState));

export type BoardGame = ReturnType<typeof applyFiltersAndSorts>[number];
