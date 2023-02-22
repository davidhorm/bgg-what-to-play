import * as _ from "lodash-es";
import type { FilterControl } from "./useCollectionFilters";

const QUERY_PARAM_COMPLEXITY = "complexity";
const DEFAULT_COMPLEXITY_MIN = 1;
const DEFAULT_COMPLEXITY_MAX = 5;

const convertRangeQueryParamToValue = (
  value: string | null
): [number, number] => {
  if (!value) {
    return [DEFAULT_COMPLEXITY_MIN, DEFAULT_COMPLEXITY_MAX];
  }

  const normalizedValue = value.includes("-") ? value : `${value}-${value}`;
  const [minRangeStr, maxRangeStr] = normalizedValue.split("-");

  const parsedMinRange = parseFloat(minRangeStr);
  const minRange = isNaN(parsedMinRange)
    ? DEFAULT_COMPLEXITY_MIN
    : _.clamp(parsedMinRange, DEFAULT_COMPLEXITY_MIN, DEFAULT_COMPLEXITY_MAX);

  const parsedMaxRange = parseFloat(maxRangeStr);
  const maxRange = isNaN(parsedMaxRange)
    ? DEFAULT_COMPLEXITY_MAX
    : _.clamp(parsedMaxRange, DEFAULT_COMPLEXITY_MIN, DEFAULT_COMPLEXITY_MAX);

  return [minRange, maxRange];
};

const getInitialState = () =>
  convertRangeQueryParamToValue(
    new URLSearchParams(document.location.search).get(QUERY_PARAM_COMPLEXITY) ||
      ""
  );

type ComplexityState = ReturnType<typeof getInitialState>;

const convertRangeValueToQueryParam = (range: ComplexityState): string => {
  const [minRange, maxRange] = range;

  return minRange === maxRange ? minRange.toString() : range.join("-");
};

const getReducer: FilterControl<ComplexityState>["getReducer"] = (
  state,
  payload
) => {
  if (!state.username) return state;
  const [minRange, maxRange] = payload;
  const complexityRange = [minRange, maxRange] as [number, number];
  const newState = { ...state, complexityRange };

  // Only set the playerCount query param if not using the default values
  const url = new URL(document.location.href);
  if (
    minRange !== DEFAULT_COMPLEXITY_MIN ||
    maxRange !== DEFAULT_COMPLEXITY_MAX
  ) {
    url.searchParams.set(
      QUERY_PARAM_COMPLEXITY,
      convertRangeValueToQueryParam(complexityRange)
    );
  } else {
    url.searchParams.delete(QUERY_PARAM_COMPLEXITY);
  }

  history.pushState({}, "", url);

  return newState;
};

export const complexityRange: FilterControl<ComplexityState> = {
  getInitialState,
  getReducer,
};
