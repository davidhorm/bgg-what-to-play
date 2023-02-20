import { useReducer } from "react";
import { booleanQueryParam } from "./booleanQueryParam";
import { playerCountRange } from "./playerCountRange";
import { showRatings } from "./showRatings";

//#region QueryParams

const QUERY_PARAMS = {
  USERNAME: "username",
} as const;

type QueryParamKey = typeof QUERY_PARAMS[keyof typeof QUERY_PARAMS];

const getQueryParamValue = (key: QueryParamKey) =>
  new URLSearchParams(document.location.search).get(key) || "";

export type FilterControl<T> = {
  getInitialState: () => T;
  getReducer: ActionHandler<T>;
};

export type BooleanFilterControl = {
  getInitialState: (queryParamKey: string) => boolean;
  getReducer: (props: {
    /** Key in CollectionFilterState used to store the value */
    stateKey: keyof CollectionFilterState;

    /** The key used in the query parameter. If empty, then use `stateKey` */
    queryParamKey?: string;
  }) => ActionHandler<Partial<undefined>>;
};

const maybeSetQueryParams = (newState: CollectionFilterState) => {
  // if username is set, then also update the query param
  if (newState.username) {
    const url = new URL(document.location.href);

    // Always set username if it exists
    url.searchParams.set(QUERY_PARAMS.USERNAME, newState.username);

    history.pushState({}, "", url);
  }
};

//#endregion QueryParams

const initialFilterState = {
  /** The username defined in the query param, or submitted in the input. */
  username: getQueryParamValue(QUERY_PARAMS.USERNAME),

  /** If `true`, then show the invalid Player Count outside of the game's actual min/max Player Count. */
  showInvalidPlayerCount: booleanQueryParam.getInitialState("showInvalid"),

  /**
   * The `[minRange, maxRange]` the user wants to filter/sort the collection.
   * - Valid `minRange` values are 1-11.
   * - Valid `maxRange` values are 1-10, or Infinity;
   */
  playerCountRange: playerCountRange.getInitialState(),

  /** If `true`, then show expansions in collection. */
  showExpansions: booleanQueryParam.getInitialState("showExpansions"),

  /**
   * If `"NO_RATING"`, then don't show any ratings in the cards
   * If `"USER_RATING"`, then only show the User Rating in the card (and use in filtering)
   * If `"AVERAGE_RATING"`, then only show the Average Rating in the card (and use in filtering)
   */
  showRatings: showRatings.getInitialState(),

  /** If `true`, then `console.log` messages to help troubleshoot. */
  isDebug: booleanQueryParam.getInitialState("debug"),
};

export type CollectionFilterState = typeof initialFilterState;

export type ActionHandler<T> = (
  state: CollectionFilterState,
  payload: T
) => CollectionFilterState;

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

const actions = {
  SET_PLAYER_COUNT_RANGE: playerCountRange.getReducer,
  SET_USERNAME: setUsername,
  TOGGLE_SHOW_EXPANSIONS: booleanQueryParam.getReducer({
    stateKey: "showExpansions",
  }),
  TOGGLE_SHOW_INVALID_PLAYER_COUNT: booleanQueryParam.getReducer({
    stateKey: "showInvalidPlayerCount",
    queryParamKey: "showInvalid",
  }),
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
