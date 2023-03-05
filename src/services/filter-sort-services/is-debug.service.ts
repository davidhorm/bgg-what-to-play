import { getInitialState, setQueryParam } from "./boolean-control.utils";
import type { BooleanFilterControl } from "./useCollectionFilters";

const QUERY_PARAM_IS_DEBUG = "debug";

export const isDebugService: BooleanFilterControl = {
  getInitialState: () => getInitialState(QUERY_PARAM_IS_DEBUG),
  toggleReducedState: (state) => ({ ...state, isDebug: !state.isDebug }),
  setQueryParam: (searchParams, state) =>
    setQueryParam(searchParams, QUERY_PARAM_IS_DEBUG, state.isDebug),
};
