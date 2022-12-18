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

export const applyFiltersAndSorts = (
  games: BoardGame[],
  filterState: CollectionFilters
) => games?.map(maybeShowInvalidPlayerCount(filterState));
