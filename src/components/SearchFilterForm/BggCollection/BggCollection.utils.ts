import type { BoardGame } from ".";
import type { CollectionFilters } from "../useCollectionFilters";

const addOneIfHasPlusSign = (value: string) => (value.endsWith("+") ? 1 : 0);

const normalizeToNumPlayers = (
  numplayers: BoardGame["recommendedPlayerCount"][number]["numplayers"]
): number =>
  typeof numplayers === "number"
    ? numplayers
    : parseInt(numplayers, 10) + addOneIfHasPlusSign(numplayers);

const removeRecsLessThan =
  (minPlayers: BoardGame["minPlayers"]) =>
  (rec: BoardGame["recommendedPlayerCount"][number]): boolean =>
    normalizeToNumPlayers(rec.numplayers) >= minPlayers;

const removeRecsMoreThan =
  (maxPlayers: BoardGame["maxPlayers"]) =>
  (rec: BoardGame["recommendedPlayerCount"][number]): boolean =>
    normalizeToNumPlayers(rec.numplayers) <= maxPlayers;

const maybeShowInvalidPlayerCount =
  (filterState: CollectionFilters) =>
  (game: BoardGame): BoardGame =>
    filterState.showInvalidPlayerCount
      ? game
      : {
          ...game,
          recommendedPlayerCount: game.recommendedPlayerCount
            .filter(removeRecsLessThan(game.minPlayers))
            .filter(removeRecsMoreThan(game.maxPlayers)),
        };

const maybeRemoveGamesNotWithinPlayerCountValue =
  (filterState: CollectionFilters) =>
  (game: BoardGame): boolean =>
    filterState.filterByPlayerCountActive
      ? game.recommendedPlayerCount.filter(
          (g) => g.numplayers === filterState.filterByPlayerCountValue
        ).length > 0
      : true;

const maybeSortByScore =
  (filterState: CollectionFilters) =>
  (gameA: BoardGame, gameB: BoardGame): number =>
    filterState.filterByPlayerCountActive
      ? gameB.recommendedPlayerCount.filter(
          (b) => b.numplayers === filterState.filterByPlayerCountValue
        )?.[0].sortScore -
        gameA.recommendedPlayerCount.filter(
          (a) => a.numplayers === filterState.filterByPlayerCountValue
        )?.[0].sortScore
      : 0;

export const applyFiltersAndSorts = (
  games: BoardGame[],
  filterState: CollectionFilters
) =>
  games
    ?.map(maybeShowInvalidPlayerCount(filterState))
    .filter(maybeRemoveGamesNotWithinPlayerCountValue(filterState))
    .sort(maybeSortByScore(filterState));
