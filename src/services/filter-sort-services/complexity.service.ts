import * as _ from "lodash-es";
import { printDebugMessage } from "./is-debug.service";
import {
  getAriaLabel,
  getQueryParamValue,
  getValueLabel,
  maybeSetQueryParam,
  isBoardGameRangeWithinFilterRange,
} from "./slider-control.utils";
import { numberSort, SortFn } from "./sort.service";
import type { SliderFilterControl } from "./useCollectionFilters";

const QUERY_PARAM_COMPLEXITY = "complexity";
const DEFAULT_COMPLEXITY_MIN = 1;
const DEFAULT_COMPLEXITY_MAX = 5;
const DEFAULT_RANGE = [DEFAULT_COMPLEXITY_MIN, DEFAULT_COMPLEXITY_MAX] as [
  number,
  number
];

const convertRangeQueryParamToValue = (
  value: string | null
): [number, number] => {
  if (!value) {
    return DEFAULT_RANGE;
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
  convertRangeQueryParamToValue(getQueryParamValue(QUERY_PARAM_COMPLEXITY));

const getReducedState: SliderFilterControl["getReducedState"] = (
  state,
  payload
) => {
  const [minRange, maxRange] = payload;
  const complexityRange = [minRange, maxRange] as [number, number];
  return { ...state, complexityRange };
};

const setQueryParam: SliderFilterControl["setQueryParam"] = (
  searchParams,
  state
) =>
  maybeSetQueryParam(
    searchParams,
    state.complexityRange,
    DEFAULT_RANGE,
    QUERY_PARAM_COMPLEXITY
  );

const marks = Array.from({ length: 51 }, (_, index) => ({
  value: index / 10,
  label: index % 10 === 0 ? (index / 10).toString() : "",
}));

const getSliderProps: SliderFilterControl["getSliderProps"] = () => ({
  valueLabelDisplay: "auto",
  getAriaLabel: getAriaLabel("Complexity"),
  getAriaValueText: getValueLabel,
  valueLabelFormat: getValueLabel,
  min: DEFAULT_COMPLEXITY_MIN,
  max: DEFAULT_COMPLEXITY_MAX,
  step: 0.1,
  marks,
});

/** Edge case: Some games don't have a weight, but ought to still show if the min filter value = 1 */
const convertMinWeightToZero = (minWeight: number) =>
  minWeight === DEFAULT_COMPLEXITY_MIN ? 0 : minWeight;

const applyFilters: SliderFilterControl["applyFilters"] =
  (filterState) => (games) => {
    const [minFilter, maxFilter] = filterState.complexityRange;

    const filteredGames = games.filter((game) =>
      isBoardGameRangeWithinFilterRange(
        [game.averageWeight, game.averageWeight],
        [convertMinWeightToZero(minFilter), maxFilter]
      )
    );

    filterState.isDebug &&
      printDebugMessage(
        `Filter by Complexity: ${filterState.complexityRange}`,
        games,
        filteredGames,
        ["averageWeight"]
      );

    return filteredGames;
  };

const sort: SortFn = (dir, a, b) =>
  numberSort(dir, a.averageWeight, b.averageWeight);

export const complexityService: SliderFilterControl & { sort: SortFn } = {
  getInitialState,
  getReducedState,
  setQueryParam,
  getSliderLabel: () => "Filter by Complexity",
  getSliderProps,
  applyFilters,
  sort,
};
