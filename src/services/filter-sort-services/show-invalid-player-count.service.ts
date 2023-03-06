import type { SimpleBoardGame, CollectionFilterState } from "@/types";
import { getInitialState, setQueryParam } from "./boolean-control.utils";
import type { BooleanFilterControl } from "./useCollectionFilters";

const QUERY_PARAM_SHOW_INVALID_PLAYER_COUNT = "showInvalid";

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

export const showInvalidPlayerCountService: Omit<
  BooleanFilterControl,
  "maybeShow"
> & {
  maybeShow: typeof maybeShowInvalidPlayerCount;
} = {
  getInitialState: () => getInitialState(QUERY_PARAM_SHOW_INVALID_PLAYER_COUNT),
  toggleReducedState: (state) => ({
    ...state,
    showInvalidPlayerCount: !state.showInvalidPlayerCount,
  }),
  setQueryParam: (searchParams, state) =>
    setQueryParam(
      searchParams,
      QUERY_PARAM_SHOW_INVALID_PLAYER_COUNT,
      state.showInvalidPlayerCount
    ),
  maybeShow: maybeShowInvalidPlayerCount,
};
