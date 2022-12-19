import type { BoardGame } from ".";
import type { CollectionFilters } from "./useCollectionFilters";

const removeRecsLessThan =
  (minPlayers: BoardGame["minPlayers"]) =>
  (rec: BoardGame["recommendedPlayerCount"][number]): boolean =>
    parseInt(rec.numplayers, 10) >= minPlayers;

const addOneIfHasPlusSign = (value: string) => (value.endsWith("+") ? 1 : 0);

const removeRecsMoreThan =
  (maxPlayers: BoardGame["maxPlayers"]) =>
  (rec: BoardGame["recommendedPlayerCount"][number]): boolean =>
    parseInt(rec.numplayers, 10) + addOneIfHasPlusSign(rec.numplayers) <=
    maxPlayers;

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

// TODO: handle numplayers with + character (p3)
const maybeFilterRecsByPlayerCount =
  (filterState: CollectionFilters) =>
  (game: BoardGame): BoardGame =>
    filterState.filterByPlayerCountActive
      ? {
          ...game,
          recommendedPlayerCount: game.recommendedPlayerCount.filter(
            (r) =>
              parseInt(r.numplayers, 10) ===
              filterState.filterByPlayerCountValue
          ),
        }
      : game;

const maybeRemoveEmptyRecs =
  (filterState: CollectionFilters) =>
  (game: BoardGame): boolean =>
    filterState.filterByPlayerCountActive
      ? game.recommendedPlayerCount.length > 0
      : true;

const maybeSortByScore =
  (filterState: CollectionFilters) =>
  (gameA: BoardGame, gameB: BoardGame): number =>
    filterState.filterByPlayerCountActive
      ? gameB.recommendedPlayerCount[0].sortScore -
        gameA.recommendedPlayerCount[0].sortScore
      : 0;

export const applyFiltersAndSorts = (
  games: BoardGame[],
  filterState: CollectionFilters
) =>
  games
    ?.map(maybeShowInvalidPlayerCount(filterState))
    .map(maybeFilterRecsByPlayerCount(filterState)) // TODO: add tests for filterState.filterByPlayerCountActive (p2)
    .filter(maybeRemoveEmptyRecs(filterState))
    .sort(maybeSortByScore(filterState));
