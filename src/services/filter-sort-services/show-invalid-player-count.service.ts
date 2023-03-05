import { getInitialState, setQueryParam } from "./boolean-control.utils";
import type { BooleanFilterControl } from "./useCollectionFilters";

const QUERY_PARAM_SHOW_INVALID_PLAYER_COUNT = "showInvalid";

export const showInvalidPlayerCountService: BooleanFilterControl = {
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
};
