import type { FilterControl } from "./useCollectionFilters";

const QUERY_PARAM_PLAYTIME = "playtime";
const DEFAULT_PLAYTIME_MIN = 0;
const DEFAULT_PLAYTIME_MAX = Number.POSITIVE_INFINITY;

const convertGreaterThan240To241 = (value: number) =>
  value > 240 ? 241 : value;

const convertGreaterThan240ToInfinity = (value: number) =>
  value > 240 ? Number.POSITIVE_INFINITY : value;

const convertPlaytimeRangeQueryParamToValue = (
  value: string | null
): [number, number] => {
  if (!value) {
    return [DEFAULT_PLAYTIME_MIN, DEFAULT_PLAYTIME_MAX];
  }

  const normalizedValue = value.includes("-") ? value : `${value}-${value}`;
  const [minRangeStr, maxRangeStr] = normalizedValue.split("-");

  const parsedMinRange = parseInt(minRangeStr, 10);
  const minRange = isNaN(parsedMinRange)
    ? DEFAULT_PLAYTIME_MIN
    : Math.max(Math.min(parsedMinRange, 241), DEFAULT_PLAYTIME_MIN);

  const parsedMaxRange = parseInt(maxRangeStr, 10);
  const maxRange = isNaN(parsedMaxRange)
    ? DEFAULT_PLAYTIME_MAX
    : convertGreaterThan240ToInfinity(
        Math.max(parsedMaxRange, DEFAULT_PLAYTIME_MIN)
      );

  return [minRange, maxRange];
};

const getInitialState = () =>
  convertPlaytimeRangeQueryParamToValue(
    new URLSearchParams(document.location.search).get(QUERY_PARAM_PLAYTIME) ||
      ""
  );

type TimeRangeState = ReturnType<typeof getInitialState>;

const convertTimeRangeValueToQueryParam = (
  timeRange: TimeRangeState
): string => {
  const [minRange, maxRange] = timeRange;

  return minRange === maxRange ? minRange.toString() : timeRange.join("-");
};

const getReducer: FilterControl<TimeRangeState>["getReducer"] = (
  state,
  payload
) => {
  if (!state.username) return state;
  const [maybeMinRange, maybeMaxRange] = payload;
  const minRange = convertGreaterThan240To241(maybeMinRange);
  const maxRange = convertGreaterThan240ToInfinity(maybeMaxRange);
  const playtimeRange = [minRange, maxRange] as [number, number];
  const newState = { ...state, playtimeRange };

  // Only set the playtime query param if not using the default values
  const url = new URL(document.location.href);
  if (minRange !== DEFAULT_PLAYTIME_MIN || maxRange !== DEFAULT_PLAYTIME_MAX) {
    url.searchParams.set(
      QUERY_PARAM_PLAYTIME,
      convertTimeRangeValueToQueryParam(playtimeRange)
    );
  } else {
    url.searchParams.delete(QUERY_PARAM_PLAYTIME);
  }

  history.pushState({}, "", url);

  return newState;
};

export const playtimeRange: FilterControl<TimeRangeState> = {
  getInitialState,
  getReducer,
};
