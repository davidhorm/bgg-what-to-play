import { useReducer } from "react";
import { playerCountRange } from "./playerCountRange";
import { showRatings } from "./showRatings";

//#region QueryParams

const QUERY_PARAMS = {
  USERNAME: "username",
  SHOW_INVALID_PLAYER_COUNT: "showInvalid",
  SHOW_EXPANSIONS: "showExpansions",
  IS_DEBUG: "debug",
} as const;

type QueryParamKey = typeof QUERY_PARAMS[keyof typeof QUERY_PARAMS];

const getQueryParamValue = (key: QueryParamKey) =>
  new URLSearchParams(document.location.search).get(key) || "";

export type FilterControl<T> = {
  getInitialState: () => T;
  getReducer: ActionHandler<T>;
};

const maybeSetQueryParams = (newState: CollectionFilterState) => {
  // if username is set, then also update the query param
  if (newState.username) {
    const url = new URL(document.location.href);

    // Always set username if it exists
    url.searchParams.set(QUERY_PARAMS.USERNAME, newState.username);

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
  playerCountRange: playerCountRange.getInitialState(),

  /** If `true`, then show expansions in collection. */
  showExpansions: getQueryParamValue(QUERY_PARAMS.SHOW_EXPANSIONS) === "1",

  /**
   * If `"NO_RATING"`, then don't show any ratings in the cards
   * If `"USER_RATING"`, then only show the User Rating in the card (and use in filtering)
   * If `"AVERAGE_RATING"`, then only show the Average Rating in the card (and use in filtering)
   */
  showRatings: showRatings.getInitialState(),

  /** If `true`, then `console.log` messages to help troubleshoot. */
  isDebug: getQueryParamValue(QUERY_PARAMS.IS_DEBUG) === "1",
};

export type CollectionFilterState = typeof initialFilterState;

export type ActionHandler<T> = (
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

const toggleShowExpansions: ActionHandler<Partial<undefined>> = (state) =>
  setQueryParamAndState(state, { showExpansions: !state.showExpansions });

const actions = {
  RESET_FILTERS: resetFilters,
  SET_PLAYER_COUNT_RANGE: playerCountRange.getReducer,
  SET_USERNAME: setUsername,
  TOGGLE_SHOW_EXPANSIONS: toggleShowExpansions,
  TOGGLE_SHOW_INVALID_PLAYER_COUNT: toggleShowInvalidPlayerCount,
  TOGGLE_SHOW_RATINGS: showRatings.getToggleShowRatings,
  SET_SHOW_RATINGS: showRatings.getReducer,
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
