import type { SimpleBoardGame } from "@/types";
import { getInitialState, setQueryParam } from "./boolean-control.utils";
import type { BooleanFilterControl } from "./useCollectionFilters";

const QUERY_PARAM_IS_DEBUG = "debug";

export const isDebugService: BooleanFilterControl = {
  getInitialState: () => getInitialState(QUERY_PARAM_IS_DEBUG),
  toggleReducedState: (state) => ({ ...state, isDebug: !state.isDebug }),
  setQueryParam: (searchParams, state) =>
    setQueryParam(searchParams, QUERY_PARAM_IS_DEBUG, state.isDebug),
  applyFilters: () => (whatever) => whatever,
};

export const printDebugMessage = <T extends SimpleBoardGame>(
  groupLabel: string,
  games: T[],
  isFiltered?: boolean
) => {
  if (isFiltered || isFiltered === undefined) {
    console.groupCollapsed(groupLabel);
    console.log(`length: ${games.length}`);
    console.table(games.map(({ id, name }) => ({ id, name })));
    console.groupEnd();
  } else {
    console.log(`Skipping ${groupLabel}`);
  }
};
