import { getInitialState, setQueryParam } from "./boolean-control.utils";
import { printDebugMessage } from "./is-debug.service";
import type { BooleanFilterControl } from "./useCollectionFilters";

const QUERY_PARAM_SHOW_EXPANSIONS = "showExpansions";

const applyFilters: BooleanFilterControl["applyFilters"] =
  (filterState) => (games) => {
    const filteredGames = games.filter((game) => {
      if (filterState.showExpansions) return true;

      return game.type === "boardgame";
    });

    filterState.isDebug &&
      printDebugMessage(
        "Maybe Show Expansions",
        filteredGames,
        filterState.showExpansions
      );

    return filteredGames;
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
  applyFilters,
};
