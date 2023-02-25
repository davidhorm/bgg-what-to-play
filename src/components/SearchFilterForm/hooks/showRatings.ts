import type {
  CollectionFilterState,
  FilterControl,
} from "./useCollectionFilters";

const QUERY_PARAM_SHOW_USER_RATINGS = "showUserRatings";
const QUERY_PARAM_SHOW_AVERAGE_RATINGS = "showRatings";

type RatingVisibility = "NO_RATING" | "USER_RATING" | "AVERAGE_RATING";

const getInitialState = (): RatingVisibility => {
  if (
    new URLSearchParams(document.location.search).get(
      QUERY_PARAM_SHOW_USER_RATINGS
    ) === "1"
  )
    return "USER_RATING";

  if (
    new URLSearchParams(document.location.search).get(
      QUERY_PARAM_SHOW_AVERAGE_RATINGS
    ) === "1"
  )
    return "AVERAGE_RATING";

  return "NO_RATING";
};

const setQueryParam: FilterControl<RatingVisibility>["setQueryParam"] = (
  searchParams,
  state
) => {
  // Always initially delete the ratings query params, then maybe add them back in
  searchParams.delete(QUERY_PARAM_SHOW_USER_RATINGS);
  searchParams.delete(QUERY_PARAM_SHOW_AVERAGE_RATINGS);

  if (state.showRatings === "USER_RATING") {
    searchParams.set(QUERY_PARAM_SHOW_USER_RATINGS, "1");
  } else if (state.showRatings === "AVERAGE_RATING") {
    searchParams.set(QUERY_PARAM_SHOW_AVERAGE_RATINGS, "1");
  }
};

export const showRatings: FilterControl<RatingVisibility> & {
  getToggleShowRatings: (state: CollectionFilterState) => CollectionFilterState;
} = {
  getInitialState,
  getReducedState: (state, showRatings) => ({ ...state, showRatings }),
  getToggleShowRatings: (state) => ({
    ...state,
    showRatings:
      state.showRatings === "NO_RATING" ? "AVERAGE_RATING" : "NO_RATING",
  }),
  setQueryParam,
};
