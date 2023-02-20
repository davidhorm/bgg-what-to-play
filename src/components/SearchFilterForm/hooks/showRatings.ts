import type {
  ActionHandler,
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

const setQueryParams = (newState: CollectionFilterState) => {
  const url = new URL(document.location.href);

  // Always initially delete the ratings query params, then maybe add them back in
  url.searchParams.delete(QUERY_PARAM_SHOW_USER_RATINGS);
  url.searchParams.delete(QUERY_PARAM_SHOW_AVERAGE_RATINGS);

  if (newState.showRatings === "USER_RATING") {
    url.searchParams.set(QUERY_PARAM_SHOW_USER_RATINGS, "1");
  } else if (newState.showRatings === "AVERAGE_RATING") {
    url.searchParams.set(QUERY_PARAM_SHOW_AVERAGE_RATINGS, "1");
  }

  history.pushState({}, "", url);
};

const getReducer: FilterControl<RatingVisibility>["getReducer"] = (
  state,
  showRatings
) => {
  if (!state.username) return state;

  const newState = { ...state, showRatings };

  setQueryParams(newState);

  return newState;
};

const getToggleShowRatings: ActionHandler<Partial<undefined>> = (state) =>
  getReducer(
    state,
    state.showRatings === "NO_RATING" ? "USER_RATING" : "NO_RATING"
  );

export const showRatings: FilterControl<RatingVisibility> & {
  getToggleShowRatings: typeof getToggleShowRatings;
} = {
  getInitialState,
  getReducer,
  getToggleShowRatings,
};
