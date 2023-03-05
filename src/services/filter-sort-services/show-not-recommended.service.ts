import { getInitialState, setQueryParam } from "./boolean-control.utils";
import type { BooleanFilterControl } from "./useCollectionFilters";

const QUERY_PARAM_SHOW_NOT_RECOMMENDED = "showNotRec";

export const showNotRecommendedService: BooleanFilterControl = {
  getInitialState: () => getInitialState(QUERY_PARAM_SHOW_NOT_RECOMMENDED),
  toggleReducedState: (state) => ({
    ...state,
    showNotRecommended: !state.showNotRecommended,
  }),
  setQueryParam: (searchParams, state) =>
    setQueryParam(
      searchParams,
      QUERY_PARAM_SHOW_NOT_RECOMMENDED,
      state.showNotRecommended
    ),
};
