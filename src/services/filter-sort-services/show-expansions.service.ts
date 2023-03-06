import { getInitialState, setQueryParam } from "./boolean-control.utils";
import type { BooleanFilterControl } from "./useCollectionFilters";

const QUERY_PARAM_SHOW_EXPANSIONS = "showExpansions";

const maybeShow: BooleanFilterControl["maybeShow"] =
  (filterState) => (game) => {
    if (filterState.showExpansions) return true;

    return game.type === "boardgame";
  };

export const showExpansionsService: BooleanFilterControl = {
  getInitialState: () => getInitialState(QUERY_PARAM_SHOW_EXPANSIONS),
  toggleReducedState: (state) => ({
    ...state,
    showExpansions: !state.showExpansions,
  }),
  setQueryParam: (searchParams, state) =>
    setQueryParam(
      searchParams,
      QUERY_PARAM_SHOW_EXPANSIONS,
      state.showExpansions
    ),
  maybeShow,
};
