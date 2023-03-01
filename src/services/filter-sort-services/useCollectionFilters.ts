import { useState, useReducer, ComponentProps } from "react";
import Slider from "@mui/material/Slider";
import { booleanQueryParam } from "./booleanQueryParam";
import { complexityService } from "./complexityService";
import { playerCountService } from "./playerCountService";
import { playtimeService } from "./playtimeService";
import { ratingsService } from "./ratingsService";
import { showRatings } from "./showRatings";
import { username } from "./username";

/** Interface to abstract filter control logic. Needs to be able to provide initial state, and a reducer to set state */
export type FilterControl<T> = {
  getInitialState: () => T;
  getReducedState: ActionHandler<T>;
  setQueryParam: (
    searchParams: URLSearchParams,
    state: CollectionFilterState
  ) => void;
};

export type SliderControl = FilterControl<[number, number]> & {
  getSliderLabel: (filterState: CollectionFilterState) => string;
  getSliderProps: (
    filterState: CollectionFilterState
  ) => ComponentProps<typeof Slider>;
};

/** Interface to abstract boolean filter controls. */
export type BooleanFilterControl = {
  getInitialState: (queryParamKey: string) => boolean;
  getReducedState: (
    /** Key in CollectionFilterState used to store the value */
    stateKey: keyof CollectionFilterState
  ) => ActionHandler<Partial<undefined>>;
  setQueryParam: (
    searchParams: URLSearchParams,
    queryParamKey: string,
    value: boolean
  ) => void;
};

const QUERY_PARAMS = {
  SHOW_INVALID_PLAYER_COUNT: "showInvalid",
  SHOW_EXPANSIONS: "showExpansions",
  SHOW_USER_RATINGS: "showUserRatings",
  SHOW_AVERAGE_RATINGS: "showRatings",
  SHOW_NOT_RECOMMENDED: "showNotRec",
  IS_DEBUG: "debug",
} as const;

const initialFilterState = {
  /** The username defined in the query param, or submitted in the input. */
  username: username.getInitialState(),

  /** If `true`, then show the invalid Player Count outside of the game's actual min/max Player Count. */
  showInvalidPlayerCount: booleanQueryParam.getInitialState(
    QUERY_PARAMS.SHOW_INVALID_PLAYER_COUNT
  ),

  /**
   * The Player Count `[minRange, maxRange]` the user wants to filter the collection.
   * - Valid `minRange` values are 1-11.
   * - Valid `maxRange` values are 1-10, or Infinity;
   */
  playerCountRange: playerCountService.getInitialState(),

  /**
   * The Play Time `[minRange, maxRange]` the user wants to filter the collection.
   * - Valid `minRange` values are 0-240.
   * - Valid `maxRange` values are 0-240, or Infinity;
   */
  playtimeRange: playtimeService.getInitialState(),

  /**
   * The Complexity `[minRange, maxRange]` the user wants to filter the collection.
   * - Valid `minRange` and `maxRange` values are 1-5.
   */
  complexityRange: complexityService.getInitialState(),

  /** If `true`, then show expansions in collection. */
  showExpansions: booleanQueryParam.getInitialState(
    QUERY_PARAMS.SHOW_EXPANSIONS
  ),

  /**
   * If `"NO_RATING"`, then don't show any ratings in the cards
   * If `"AVERAGE_RATING"`, then only show the Average Rating in the card (and use in filtering)
   * If `"USER_RATING"`, then only show the User Rating in the card (and use in filtering)
   */
  showRatings: showRatings.getInitialState(),

  /**
   * The Ratings `[minRange, maxRange]` the user wants to filter the collection.
   * By default, will filter by Average Ratings. But will filter by User Rating if showRatings = "USER_RATING"
   * - Valid `minRange` and `maxRange` values are 1-10.
   */
  ratingsRange: ratingsService.getInitialState(),

  /** If `true`, then show games where all of the filtered player counts are not recommended. */
  showNotRecommended: booleanQueryParam.getInitialState(
    QUERY_PARAMS.SHOW_NOT_RECOMMENDED
  ),

  /** If `true`, then `console.log` messages to help troubleshoot. */
  isDebug: booleanQueryParam.getInitialState(QUERY_PARAMS.IS_DEBUG),
};

export type CollectionFilterState = typeof initialFilterState;

export type ActionHandler<T> = (
  state: CollectionFilterState,
  payload: T
) => CollectionFilterState;

const actions = {
  SET_COMPLEXITY: complexityService.getReducedState,
  SET_PLAYER_COUNT_RANGE: playerCountService.getReducedState,
  SET_PLAYTIME_RANGE: playtimeService.getReducedState,
  SET_USERNAME: username.getReducedState,

  TOGGLE_SHOW_RATINGS: showRatings.getToggleShowRatings,
  SET_SHOW_RATINGS: showRatings.getReducedState,
  SET_RATINGS: ratingsService.getReducedState,

  TOGGLE_SHOW_EXPANSIONS: booleanQueryParam.getReducedState("showExpansions"),
  TOGGLE_SHOW_INVALID_PLAYER_COUNT: booleanQueryParam.getReducedState(
    "showInvalidPlayerCount"
  ),
  TOGGLE_SHOW_NOT_RECOMMENDED_PLAYER_COUNT:
    booleanQueryParam.getReducedState("showNotRecommended"),
};

/**
 * Collection of SliderControl and their action type to set their value.
 * So that we can transform to `initialSliderValues` and `sliderControls`
 */
const sliderSetActions: Array<{
  sliderControl: SliderControl;
  setAction: keyof typeof actions;
}> = [
  {
    sliderControl: playerCountService,
    setAction: "SET_PLAYER_COUNT_RANGE",
  },
  { sliderControl: playtimeService, setAction: "SET_PLAYTIME_RANGE" },
  { sliderControl: complexityService, setAction: "SET_COMPLEXITY" },
  { sliderControl: ratingsService, setAction: "SET_RATINGS" },
];

/** Creates an array of initial states for the slider value local state */
const initialSliderValues: Record<string, [number, number]> =
  sliderSetActions.reduce(
    (prevVal, currVal, index) => ({
      ...prevVal,
      [index]: currVal.sliderControl.getInitialState(),
    }),
    {}
  );

const maybeSetQueryParam = (state: CollectionFilterState) => {
  if (!state.username) return;

  const url = new URL(document.location.href);

  username.setQueryParam(url.searchParams, state);
  playerCountService.setQueryParam(url.searchParams, state);
  playtimeService.setQueryParam(url.searchParams, state);
  complexityService.setQueryParam(url.searchParams, state);
  ratingsService.setQueryParam(url.searchParams, state);
  showRatings.setQueryParam(url.searchParams, state);

  booleanQueryParam.setQueryParam(
    url.searchParams,
    QUERY_PARAMS.SHOW_EXPANSIONS,
    state.showExpansions
  );

  booleanQueryParam.setQueryParam(
    url.searchParams,
    QUERY_PARAMS.SHOW_NOT_RECOMMENDED,
    state.showNotRecommended
  );

  booleanQueryParam.setQueryParam(
    url.searchParams,
    QUERY_PARAMS.SHOW_INVALID_PLAYER_COUNT,
    state.showInvalidPlayerCount
  );

  booleanQueryParam.setQueryParam(
    url.searchParams,
    QUERY_PARAMS.IS_DEBUG,
    state.isDebug
  );

  history.pushState({}, "", url);
};

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
type Payload<T> = T extends (...args: any[]) => any ? Parameters<T>[1] : never;

type CreateActions<T extends typeof actions> = {
  [K in keyof T]: Payload<T[K]> extends undefined
    ? {
        type: K;
        payload?: undefined;
      }
    : {
        type: K;
        payload: Payload<T[K]>;
      };
}[keyof T];

type Action = CreateActions<typeof actions>;

/** Reducer pattern based off of https://stackoverflow.com/questions/74884329/how-to-derive-action-type-from-mapping-object-for-usereducer-dispatch-type-safet */
const reducer: ActionHandler<Action> = (
  state,
  action
): CollectionFilterState => {
  const newState = (
    actions[action.type] as ActionHandler<typeof action["payload"]>
  )(state, action.payload);

  maybeSetQueryParam(newState);

  return newState;
};

export const useCollectionFilters = () => {
  const [filterState, filterDispatch] = useReducer(reducer, initialFilterState);
  const [sliderValues, setSliderValues] = useState(initialSliderValues);

  const sliderControls: Array<{
    sliderLabel: string;
    sliderProps: ComponentProps<typeof Slider>;
  }> = sliderSetActions.map(
    (
      { sliderControl: { getSliderLabel, getSliderProps }, setAction },
      index
    ) => ({
      sliderLabel: getSliderLabel(filterState),
      sliderProps: {
        ...getSliderProps(filterState),

        /** Local state of the UI */
        value: sliderValues[index],

        /** When changing, then only set the local state to update the UI */
        onChange: (_, value) =>
          setSliderValues({
            ...sliderValues,
            [index]: value as [number, number],
          }),

        /** When the change is committed (i.e. Mouse Up), then update the reducer state */
        onChangeCommitted: (_, value) => {
          filterDispatch({
            type: setAction as any,
            payload: value as [number, number],
          });
        },
      },
    })
  );

  return {
    filterState,
    filterDispatch,
    usernameControl: {
      username: filterState.username,
      setUsername: (payload: string) =>
        filterDispatch({ type: "SET_USERNAME", payload }),
    },
    sliderControls,
  };
};

export type CollectionFilterReducer = ReturnType<typeof useCollectionFilters>;