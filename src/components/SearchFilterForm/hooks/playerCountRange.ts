import * as _ from "lodash-es";
import type { FilterControl } from "./useCollectionFilters";

const QUERY_PARAM_PLAYER_COUNT = "playerCount";
const DEFAULT_PLAYER_COUNT_MIN = 1;
const DEFAULT_PLAYER_COUNT_MAX = Number.POSITIVE_INFINITY;
const DEFAULT_PLAYER_COUNT_MAX_TICK = 11;

const convertElevenToInfinity = (value: number) =>
  value >= 11 ? Number.POSITIVE_INFINITY : value;

const convertPlayerCountRangeQueryParamToValue = (
  value: string | null
): [number, number] => {
  if (!value) {
    return [DEFAULT_PLAYER_COUNT_MIN, DEFAULT_PLAYER_COUNT_MAX];
  }

  const normalizedValue = value.includes("-") ? value : `${value}-${value}`;
  const [minRangeStr, maxRangeStr] = normalizedValue.split("-");

  const parsedMinRange = parseInt(minRangeStr, 10);
  const minRange = isNaN(parsedMinRange)
    ? DEFAULT_PLAYER_COUNT_MIN
    : _.clamp(
        parsedMinRange,
        DEFAULT_PLAYER_COUNT_MIN,
        DEFAULT_PLAYER_COUNT_MAX_TICK
      );

  const parsedMaxRange = parseInt(maxRangeStr, 10);
  const maxRange = isNaN(parsedMaxRange)
    ? DEFAULT_PLAYER_COUNT_MAX
    : convertElevenToInfinity(
        _.clamp(
          parsedMaxRange,
          DEFAULT_PLAYER_COUNT_MIN,
          DEFAULT_PLAYER_COUNT_MAX_TICK
        )
      );

  return [minRange, maxRange];
};

const getInitialState = () =>
  convertPlayerCountRangeQueryParamToValue(
    new URLSearchParams(document.location.search).get(
      QUERY_PARAM_PLAYER_COUNT
    ) || ""
  );

type PlayerCountState = ReturnType<typeof getInitialState>;

const convertPlayerCountRangeValueToQueryParam = (
  playerCountRange: PlayerCountState
): string => {
  const [minRange, maxRange] = playerCountRange;

  return minRange === maxRange
    ? minRange.toString()
    : playerCountRange.join("-");
};

const getReducedState: FilterControl<PlayerCountState>["getReducedState"] = (
  state,
  payload
) => {
  const [minRange, maybeMaxRange] = payload;
  const maxRange = convertElevenToInfinity(maybeMaxRange);
  const playerCountRange = [minRange, maxRange] as [number, number];
  return { ...state, playerCountRange };
};

const setQueryParam: FilterControl<PlayerCountState>["setQueryParam"] = (
  searchParams,
  state
) => {
  // Only set the playerCount query param if not using the default values
  if (
    state.playerCountRange[0] !== DEFAULT_PLAYER_COUNT_MIN ||
    state.playerCountRange[1] !== DEFAULT_PLAYER_COUNT_MAX
  ) {
    searchParams.set(
      QUERY_PARAM_PLAYER_COUNT,
      convertPlayerCountRangeValueToQueryParam(state.playerCountRange)
    );
  } else {
    searchParams.delete(QUERY_PARAM_PLAYER_COUNT);
  }
};

export const playerCountRange: FilterControl<PlayerCountState> = {
  getInitialState,
  getReducedState,
  setQueryParam,
};
