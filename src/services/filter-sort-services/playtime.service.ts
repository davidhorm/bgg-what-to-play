import { printDebugMessage } from "./is-debug.service";
import {
  getAriaLabel,
  getQueryParamValue,
  maybeSetQueryParam,
  isBoardGameRangeWithinFilterRange,
} from "./slider-control.utils";
import { numberSort, SortFn } from "./sort.service";
import type { SliderFilterControl } from "./useCollectionFilters";

const QUERY_PARAM_PLAYTIME = "playtime";
const DEFAULT_PLAYTIME_MIN = 0;
const DEFAULT_PLAYTIME_MAX = Number.POSITIVE_INFINITY;
const DEFAULT_PLAYTIME_MAX_TICK = 255;
const DEFAULT_RANGE = [DEFAULT_PLAYTIME_MIN, DEFAULT_PLAYTIME_MAX] as [
  number,
  number
];

const convertGreaterThan240To241 = (value: number) =>
  value > 240 ? 241 : value;

const convertGreaterThan240ToInfinity = (value: number) =>
  value > 240 ? Number.POSITIVE_INFINITY : value;

const convertPlaytimeRangeQueryParamToValue = (
  value: string | null
): [number, number] => {
  if (!value) {
    return DEFAULT_RANGE;
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
    getQueryParamValue(QUERY_PARAM_PLAYTIME)
  );

const getReducedState: SliderFilterControl["getReducedState"] = (
  state,
  payload
) => {
  const [maybeMinRange, maybeMaxRange] = payload;
  const minRange = convertGreaterThan240To241(maybeMinRange);
  const maxRange = convertGreaterThan240ToInfinity(maybeMaxRange);
  const playtimeRange = [minRange, maxRange] as [number, number];
  return { ...state, playtimeRange };
};

const setQueryParam: SliderFilterControl["setQueryParam"] = (
  searchParams,
  state
) =>
  maybeSetQueryParam(
    searchParams,
    state.playtimeRange,
    DEFAULT_RANGE,
    QUERY_PARAM_PLAYTIME
  );

const getValueLabel = (value: number) =>
  value > 240 ? "240+" : value.toString();

const marks = Array.from({ length: 18 }, (_, index) => index * 15).map(
  (value) => ({
    value,
    label: [0, 60, 120, 180, 240, 255].includes(value)
      ? getValueLabel(value)
      : "",
  })
);

const getSliderProps: SliderFilterControl["getSliderProps"] = () => ({
  getAriaLabel: getAriaLabel("Playtime"),
  getAriaValueText: getValueLabel,
  valueLabelFormat: getValueLabel,
  valueLabelDisplay: "auto",
  min: DEFAULT_PLAYTIME_MIN,
  max: DEFAULT_PLAYTIME_MAX_TICK,
  marks: marks,
  step: 15,
  scale: convertGreaterThan240ToInfinity,
});

const applyFilters: SliderFilterControl["applyFilters"] =
  (filterState) => (games) => {
    const filteredGames = games.filter((game) =>
      isBoardGameRangeWithinFilterRange(
        [game.minPlaytime, game.maxPlaytime],
        filterState.playtimeRange
      )
    );

    filterState.isDebug &&
      printDebugMessage(
        `Filter by Time (minutes): ${filterState.playtimeRange}`,
        games,
        filteredGames,
        ["minPlaytime", "maxPlaytime"]
      );

    return filteredGames;
  };

const sort: SortFn = (dir, a, b) => {
  const valueA = (a.minPlaytime + a.maxPlaytime) / 2;
  const valueB = (b.minPlaytime + b.maxPlaytime) / 2;

  return numberSort(dir, valueA, valueB);
};

export const playtimeService: SliderFilterControl & { sort: SortFn } = {
  getInitialState,
  getReducedState,
  setQueryParam,
  getSliderLabel: () => "Filter by Time (minutes)",
  getSliderProps,
  applyFilters,
  sort,
};
