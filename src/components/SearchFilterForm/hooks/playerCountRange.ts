import type { FilterControl } from "./useCollectionFilters";

const QUERY_PARAM_PLAYER_COUNT = "playerCount";
const DEFAULT_PLAYER_COUNT_MIN = 1;
const DEFAULT_PLAYER_COUNT_MAX = Number.POSITIVE_INFINITY;

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
    : Math.max(Math.min(parsedMinRange, 11), 1);

  const parsedMaxRange = parseInt(maxRangeStr, 10);
  const maxRange = isNaN(parsedMaxRange)
    ? DEFAULT_PLAYER_COUNT_MAX
    : convertElevenToInfinity(Math.max(parsedMaxRange, 1));

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

const getReducer: FilterControl<PlayerCountState>["getReducer"] = (
  state,
  playerCountRange
) => {
  if (!state.username) return state;

  const url = new URL(document.location.href);
  const newState = { ...state, playerCountRange };

  // Only set the playerCount if not using the default values
  const [minRange, maybeMaxRange] = playerCountRange;
  const maxRange = convertElevenToInfinity(maybeMaxRange);

  if (
    minRange !== DEFAULT_PLAYER_COUNT_MIN ||
    maxRange !== DEFAULT_PLAYER_COUNT_MAX
  ) {
    url.searchParams.set(
      QUERY_PARAM_PLAYER_COUNT,
      convertPlayerCountRangeValueToQueryParam(playerCountRange)
    );
  } else {
    url.searchParams.delete(QUERY_PARAM_PLAYER_COUNT);
  }

  history.pushState({}, "", url);
  return newState;
};

export const playerCountRange: FilterControl<PlayerCountState> = {
  getInitialState,
  getReducer,
};
