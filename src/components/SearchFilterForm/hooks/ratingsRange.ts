import * as _ from "lodash-es";
import type { FilterControl } from "./useCollectionFilters";

const QUERY_PARAM_RATINGS = "ratings";
const DEFAULT_RATINGS_MIN = 1;
const DEFAULT_RATINGS_MAX = 10;

const convertRangeQueryParamToValue = (
  value: string | null
): [number, number] => {
  if (!value) {
    return [DEFAULT_RATINGS_MIN, DEFAULT_RATINGS_MAX];
  }

  const normalizedValue = value.includes("-") ? value : `${value}-${value}`;
  const [minRangeStr, maxRangeStr] = normalizedValue.split("-");

  const parsedMinRange = parseFloat(minRangeStr);
  const minRange = isNaN(parsedMinRange)
    ? DEFAULT_RATINGS_MIN
    : _.clamp(parsedMinRange, DEFAULT_RATINGS_MIN, DEFAULT_RATINGS_MAX);

  const parsedMaxRange = parseFloat(maxRangeStr);
  const maxRange = isNaN(parsedMaxRange)
    ? DEFAULT_RATINGS_MAX
    : _.clamp(parsedMaxRange, DEFAULT_RATINGS_MIN, DEFAULT_RATINGS_MAX);

  return [minRange, maxRange];
};

const getInitialState = () =>
  convertRangeQueryParamToValue(
    new URLSearchParams(document.location.search).get(QUERY_PARAM_RATINGS) || ""
  );

type RatingsState = ReturnType<typeof getInitialState>;

const convertRangeValueToQueryParam = (range: RatingsState): string => {
  const [minRange, maxRange] = range;

  return minRange === maxRange ? minRange.toString() : range.join("-");
};

const getReducer: FilterControl<RatingsState>["getReducer"] = (
  state,
  payload
) => {
  if (!state.username) return state;
  const [minRange, maxRange] = payload;
  const ratingsRange = [minRange, maxRange] as [number, number];
  const newState = { ...state, ratingsRange };

  // Only set the playerCount query param if not using the default values
  const url = new URL(document.location.href);
  if (minRange !== DEFAULT_RATINGS_MIN || maxRange !== DEFAULT_RATINGS_MAX) {
    url.searchParams.set(
      QUERY_PARAM_RATINGS,
      convertRangeValueToQueryParam(ratingsRange)
    );
  } else {
    url.searchParams.delete(QUERY_PARAM_RATINGS);
  }

  history.pushState({}, "", url);

  return newState;
};

export const ratingsRange: FilterControl<RatingsState> = {
  getInitialState,
  getReducer,
};
