import * as _ from "lodash-es";
import { printDebugMessage } from "./is-debug.service";
import {
  getAriaLabel,
  getQueryParamValue,
  maybeSetQueryParam,
  isBoardGameRangeWithinFilterRange,
} from "./slider-control.utils";
import type { SliderFilterControl } from "./useCollectionFilters";

const QUERY_PARAM_PLAYER_COUNT = "playerCount";
const DEFAULT_PLAYER_COUNT_MIN = 1;
const DEFAULT_PLAYER_COUNT_MAX = Number.POSITIVE_INFINITY;
const DEFAULT_PLAYER_COUNT_MAX_TICK = 11;
const DEFAULT_RANGE = [DEFAULT_PLAYER_COUNT_MIN, DEFAULT_PLAYER_COUNT_MAX] as [
  number,
  number
];

const convertElevenToInfinity = (value: number) =>
  value >= 11 ? Number.POSITIVE_INFINITY : value;

const convertPlayerCountRangeQueryParamToValue = (
  value: string | null
): [number, number] => {
  if (!value) {
    return DEFAULT_RANGE;
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
    getQueryParamValue(QUERY_PARAM_PLAYER_COUNT)
  );

const getReducedState: SliderFilterControl["getReducedState"] = (
  state,
  payload
) => {
  const [minRange, maybeMaxRange] = payload;
  const maxRange = convertElevenToInfinity(maybeMaxRange);
  const playerCountRange = [minRange, maxRange] as [number, number];
  return { ...state, playerCountRange };
};

const setQueryParam: SliderFilterControl["setQueryParam"] = (
  searchParams,
  state
) =>
  maybeSetQueryParam(
    searchParams,
    state.playerCountRange,
    DEFAULT_RANGE,
    QUERY_PARAM_PLAYER_COUNT
  );

const getValueLabel = (value: number) =>
  value > 10 ? "10+" : value.toString();

const marks = Array.from({ length: 11 }, (_, i) => i + 1).map((value) => ({
  value,
  label: getValueLabel(value),
}));

const getSliderProps: SliderFilterControl["getSliderProps"] = () => ({
  getAriaLabel: getAriaLabel("Player Count"),
  getAriaValueText: getValueLabel,
  valueLabelFormat: getValueLabel,
  min: DEFAULT_PLAYER_COUNT_MIN,
  max: DEFAULT_PLAYER_COUNT_MAX_TICK,
  marks,
  scale: convertElevenToInfinity,
});

const applyFilters: SliderFilterControl["applyFilters"] =
  (filterState) => (games) => {
    const filteredGames = games.filter(
      (game) =>
        isBoardGameRangeWithinFilterRange(
          [game.minPlayers, game.maxPlayers],
          filterState.playerCountRange
        ) ||
        // handle edge case for id = 40567
        (filterState.showInvalidPlayerCount && game.minPlayers === 0)
    );

    filterState.isDebug &&
      printDebugMessage(
        `Filter by Player Count: ${filterState.playerCountRange}`,
        filteredGames,
        ["minPlayers", "maxPlayers"]
      );

    return filteredGames;
  };

export const playerCountRangeService: SliderFilterControl = {
  getInitialState,
  getReducedState,
  setQueryParam,
  getSliderLabel: () => "Filter by Player Count",
  getSliderProps,
  applyFilters,
};
