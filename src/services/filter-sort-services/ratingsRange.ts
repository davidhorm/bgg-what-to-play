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

const getReducedState: FilterControl<RatingsState>["getReducedState"] = (
  state,
  payload
) => {
  const [minRange, maxRange] = payload;
  const ratingsRange = [minRange, maxRange] as [number, number];
  return { ...state, ratingsRange };
};

const setQueryParam: FilterControl<RatingsState>["setQueryParam"] = (
  searchParams,
  state
) => {
  // Only set the ratings query param if not using the default values
  if (
    state.ratingsRange[0] !== DEFAULT_RATINGS_MIN ||
    state.ratingsRange[1] !== DEFAULT_RATINGS_MAX
  ) {
    searchParams.set(
      QUERY_PARAM_RATINGS,
      convertRangeValueToQueryParam(state.ratingsRange)
    );
  } else {
    searchParams.delete(QUERY_PARAM_RATINGS);
  }
};

export const ratingsRange: FilterControl<RatingsState> = {
  getInitialState,
  getReducedState,
  setQueryParam,
};
