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
  beforeFilterGames: T[],
  afterFilterGames?: T[],
  columns?: Array<keyof SimpleBoardGame>,
  isFiltered?: boolean
) => {
  if (isFiltered || isFiltered === undefined) {
    if (afterFilterGames) {
      // if `afterFilterGames` defined, then print diff
      const afterFilterGamesIds = afterFilterGames.map(({ id }) => id);
      const filteredGames = beforeFilterGames.filter(
        (before) => !afterFilterGamesIds.includes(before.id)
      );

      console.groupCollapsed(
        `${groupLabel} (keep: ${afterFilterGames.length}, filter: ${filteredGames.length})`
      );

      filteredGames.length > 0 &&
        console.groupCollapsed(`keep: ${afterFilterGames.length}`);
      console.table(afterFilterGames, ["id", "name", ...(columns || [])]);

      if (filteredGames.length > 0) {
        console.groupEnd();
        console.groupCollapsed(`filter out: ${filteredGames.length}`);
        console.table(filteredGames, ["id", "name", ...(columns || [])]);
        console.groupEnd();
      }

      console.groupEnd();
    } else {
      // if `afterFilterGames` not defined, then only print out `beforeFilterGames`
      console.groupCollapsed(
        `${groupLabel} (length: ${beforeFilterGames.length})`
      );
      console.table(beforeFilterGames, ["id", "name", ...(columns || [])]);
      console.groupEnd();
    }
  } else {
    console.log(`Skipping ${groupLabel}`);
  }
};
