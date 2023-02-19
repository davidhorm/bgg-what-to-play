import { useReducer } from "react";

const DEFAULT_PLAYER_COUNT_MIN = 1;
const DEFAULT_PLAYER_COUNT_MAX = Number.POSITIVE_INFINITY;

//#region QueryParams

const QUERY_PARAMS = {
  USERNAME: "username",
  PLAYER_COUNT: "playerCount",
  SHOW_INVALID_PLAYER_COUNT: "showInvalid",
  SHOW_EXPANSIONS: "showExpansions",
  SHOW_USER_RATINGS: "showUserRatings",
  SHOW_AVERAGE_RATINGS: "showRatings",
  IS_DEBUG: "debug",
} as const;

type QueryParamKey = typeof QUERY_PARAMS[keyof typeof QUERY_PARAMS];

const getQueryParamValue = (key: QueryParamKey) =>
  new URLSearchParams(document.location.search).get(key) || "";

const convertPlayerCountRangeValueToQueryParam = (
  playerCountRange: CollectionFilterState["playerCountRange"]
): string => {
  const [minRange, maxRange] = playerCountRange;

  return minRange === maxRange
    ? minRange.toString()
    : playerCountRange.join("-");
};

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

type RatingVisibility = "NO_RATING" | "USER_RATING" | "AVERAGE_RATING";
const getShowRatings = (): RatingVisibility => {
  if (getQueryParamValue(QUERY_PARAMS.SHOW_USER_RATINGS) === "1")
    return "USER_RATING";

  if (getQueryParamValue(QUERY_PARAMS.SHOW_AVERAGE_RATINGS) === "1")
    return "AVERAGE_RATING";

  return "NO_RATING";
};

const maybeSetQueryParams = (newState: CollectionFilterState) => {
  // if username is set, then also update the query param
  if (newState.username) {
    const url = new URL(document.location.href);

    // Always set username if it exists
    url.searchParams.set(QUERY_PARAMS.USERNAME, newState.username);

    // Only set the playerCount if not using the default values
    const [minRange, maxRange] = newState.playerCountRange;
    if (
      minRange !== DEFAULT_PLAYER_COUNT_MIN ||
      maxRange !== DEFAULT_PLAYER_COUNT_MAX
    ) {
      url.searchParams.set(
        QUERY_PARAMS.PLAYER_COUNT,
        convertPlayerCountRangeValueToQueryParam(newState.playerCountRange)
      );
    } else {
      url.searchParams.delete(QUERY_PARAMS.PLAYER_COUNT);
    }

    if (newState.showInvalidPlayerCount) {
      url.searchParams.set(QUERY_PARAMS.SHOW_INVALID_PLAYER_COUNT, "1");
    } else {
      url.searchParams.delete(QUERY_PARAMS.SHOW_INVALID_PLAYER_COUNT);
    }

    if (newState.showExpansions) {
      url.searchParams.set(QUERY_PARAMS.SHOW_EXPANSIONS, "1");
    } else {
      url.searchParams.delete(QUERY_PARAMS.SHOW_EXPANSIONS);
    }

    // Always initially delete the ratings query params, then maybe add them back in
    url.searchParams.delete(QUERY_PARAMS.SHOW_USER_RATINGS);
    url.searchParams.delete(QUERY_PARAMS.SHOW_AVERAGE_RATINGS);
    if (newState.showRatings === "USER_RATING") {
      url.searchParams.set(QUERY_PARAMS.SHOW_USER_RATINGS, "1");
    } else if (newState.showRatings === "AVERAGE_RATING") {
      url.searchParams.set(QUERY_PARAMS.SHOW_AVERAGE_RATINGS, "1");
    }

    history.pushState({}, "", url);
  }
};

//#endregion QueryParams

const initialFilterState = {
  /** The username defined in the query param, or submitted in the input. */
  username: getQueryParamValue(QUERY_PARAMS.USERNAME),

  /** If `true`, then show the invalid Player Count outside of the game's actual min/max Player Count. */
  showInvalidPlayerCount:
    getQueryParamValue(QUERY_PARAMS.SHOW_INVALID_PLAYER_COUNT) === "1",

  /**
   * The `[minRange, maxRange]` the user wants to filter/sort the collection.
   * - Valid `minRange` values are 1-11.
   * - Valid `maxRange` values are 1-10, or Infinity;
   */
  playerCountRange: convertPlayerCountRangeQueryParamToValue(
    getQueryParamValue(QUERY_PARAMS.PLAYER_COUNT)
  ),

  /** If `true`, then show expansions in collection. */
  showExpansions: getQueryParamValue(QUERY_PARAMS.SHOW_EXPANSIONS) === "1",

  showRatings: getShowRatings(),

  /** If `true`, then `console.log` messages to help troubleshoot. */
  isDebug: getQueryParamValue(QUERY_PARAMS.IS_DEBUG) === "1",
};

export type CollectionFilterState = typeof initialFilterState;

type ActionHandler<T> = (
  state: CollectionFilterState,
  payload: T
) => CollectionFilterState;

const resetFilters: ActionHandler<Partial<undefined>> = () =>
  initialFilterState;

const setQueryParamAndState: ActionHandler<Partial<CollectionFilterState>> = (
  state,
  payload
) => {
  const newState = { ...state, ...payload };
  maybeSetQueryParams(newState);
  return newState;
};

const setUsername: ActionHandler<string> = (state, username) =>
  setQueryParamAndState(state, { username });

const toggleShowInvalidPlayerCount: ActionHandler<Partial<undefined>> = (
  state
) =>
  setQueryParamAndState(state, {
    showInvalidPlayerCount: !state.showInvalidPlayerCount,
  });

const toggleShowRatings: ActionHandler<Partial<undefined>> = (state) =>
  setQueryParamAndState(state, {
    showRatings:
      state.showRatings === "NO_RATING" ? "USER_RATING" : "NO_RATING",
  });

const setShowRatings: ActionHandler<CollectionFilterState["showRatings"]> = (
  state,
  showRatings
) => setQueryParamAndState(state, { showRatings });

const toggleShowExpansions: ActionHandler<Partial<undefined>> = (state) =>
  setQueryParamAndState(state, { showExpansions: !state.showExpansions });

const setPlayerCountRange: ActionHandler<[number, number]> = (state, payload) =>
  setQueryParamAndState(state, {
    playerCountRange: [payload[0], convertElevenToInfinity(payload[1])],
  });

const actions = {
  RESET_FILTERS: resetFilters,
  SET_PLAYER_COUNT_RANGE: setPlayerCountRange,
  SET_USERNAME: setUsername,
  TOGGLE_SHOW_EXPANSIONS: toggleShowExpansions,
  TOGGLE_SHOW_INVALID_PLAYER_COUNT: toggleShowInvalidPlayerCount,
  TOGGLE_SHOW_RATINGS: toggleShowRatings,
  SET_SHOW_RATINGS: setShowRatings,
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
const reducer: ActionHandler<Action> = (state, action): CollectionFilterState =>
  (actions[action.type] as ActionHandler<typeof action["payload"]>)(
    state,
    action.payload
  );

export const useCollectionFilters = () => {
  const [filterState, filterDispatch] = useReducer(reducer, initialFilterState);

  return { filterState, filterDispatch };
};

export type CollectionFilterReducer = ReturnType<typeof useCollectionFilters>;
