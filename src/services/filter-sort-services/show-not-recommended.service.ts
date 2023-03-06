import { getInitialState, setQueryParam } from "./boolean-control.utils";
import type { BooleanFilterControl } from "./useCollectionFilters";

const QUERY_PARAM_SHOW_NOT_RECOMMENDED = "showNotRec";

const maybeShow: BooleanFilterControl["maybeShow"] = (filterState) => (game) =>
  filterState.showNotRecommended || filterState.showInvalidPlayerCount
    ? true
    : game.recommendedPlayerCount.filter(
        (rec: any) =>
          rec.isPlayerCountWithinRange &&
          (rec.NotRecommendedPercent <= 50 ||
            Number.isNaN(rec.NotRecommendedPercent)) // Show games even if no data because technically not "not rec'd"
      ).length > 0;

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
  maybeShow,
};
