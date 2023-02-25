import type { FilterControl } from "./useCollectionFilters";

const QUERY_PARAM_PLAYTIME = "playtime";
const DEFAULT_PLAYTIME_MIN = 0;
const DEFAULT_PLAYTIME_MAX = Number.POSITIVE_INFINITY;
const DEFAULT_PLAYTIME_MAX_TICK = 255;

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
    : parsedMinRange > 240
    ? DEFAULT_PLAYTIME_MAX_TICK
    : parsedMinRange;

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

const getReducedState: FilterControl<TimeRangeState>["getReducedState"] = (
  state,
  payload
) => {
  const [maybeMinRange, maybeMaxRange] = payload;
  const minRange = convertGreaterThan240To241(maybeMinRange);
  const maxRange = convertGreaterThan240ToInfinity(maybeMaxRange);
  const playtimeRange = [minRange, maxRange] as [number, number];
  return { ...state, playtimeRange };
};

const setQueryParam: FilterControl<TimeRangeState>["setQueryParam"] = (
  searchParams,
  state
) => {
  // Only set the playtime query param if not using the default values
  if (
    state.playtimeRange[0] !== DEFAULT_PLAYTIME_MIN ||
    state.playtimeRange[1] !== DEFAULT_PLAYTIME_MAX
  ) {
    searchParams.set(
      QUERY_PARAM_PLAYTIME,
      convertTimeRangeValueToQueryParam(state.playtimeRange)
    );
  } else {
    searchParams.delete(QUERY_PARAM_PLAYTIME);
  }
};

export const playtimeRange: FilterControl<TimeRangeState> = {
  getInitialState,
  getReducedState,
  setQueryParam,
};
