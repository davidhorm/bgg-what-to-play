import * as _ from "lodash-es";
import {
  getAriaLabel,
  getQueryParamValue,
  getValueLabel,
  maybeSetQueryParam,
} from "./slider-utils";
import type { SliderControl } from "./useCollectionFilters";

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

const getReducedState: SliderControl["getReducedState"] = (state, payload) => {
  const [minRange, maxRange] = payload;
  const complexityRange = [minRange, maxRange] as [number, number];
  return { ...state, complexityRange };
};

// TODO: can this also be in utils?
const setQueryParam: SliderControl["setQueryParam"] = (searchParams, state) =>
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

const getSliderProps: SliderControl["getSliderProps"] = () => ({
  valueLabelDisplay: "auto",
  getAriaLabel: getAriaLabel("Complexity"),
  getAriaValueText: getValueLabel,
  valueLabelFormat: getValueLabel,
  min: DEFAULT_COMPLEXITY_MIN,
  max: DEFAULT_COMPLEXITY_MAX,
  step: 0.1,
  marks,
});

export const complexityService: SliderControl = {
  getInitialState,
  getReducedState,
  setQueryParam,
  getSliderLabel: () => "Filter by Complexity",
  getSliderProps,
};
