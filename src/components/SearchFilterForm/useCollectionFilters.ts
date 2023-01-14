import { useReducer } from "react";

//#region QueryParams

const QUERY_PARAMS = {
  USERNAME: "username",
} as const;

type QueryParamKey = typeof QUERY_PARAMS[keyof typeof QUERY_PARAMS];

const getQueryParamValue = (key: QueryParamKey) =>
  new URLSearchParams(document.location.search).get(key) || "";

const setQueryParam = (key: QueryParamKey, value: string) => {
  const url = new URL(document.location.href);
  url.searchParams.set(key, value);
  history.pushState({}, "", url);
};

//#endregion QueryParams

const initialFilterState = {
  /** The username defined in the query param, or submitted in the input. */
  username: getQueryParamValue(QUERY_PARAMS.USERNAME),

  /** If `true`, then show the invalid Player Count outside of the game's actual min/max Player Count. */
  showInvalidPlayerCount: false,

  /**
   * The `[minRange, maxRange]` the user wants to filter/sort the collection.
   * - Valid `minRange` values are 1-11.
   * - Valid `maxRange` values are 1-10, or Infinity;
   */
  playerCountRange: [1, Number.POSITIVE_INFINITY] as [number, number],
};

export type CollectionFilterState = typeof initialFilterState;
type ActionHandler<T> = (
  state: CollectionFilterState,
  payload: T
) => CollectionFilterState;

const resetFilters: ActionHandler<Partial<undefined>> = () =>
  initialFilterState;

const setUsername: ActionHandler<string> = (state, username) => {
  setQueryParam(QUERY_PARAMS.USERNAME, username);
  return { ...state, username };
};

const toggleShowInvalidPlayerCount: ActionHandler<Partial<undefined>> = (
  state
) => ({ ...state, showInvalidPlayerCount: !state.showInvalidPlayerCount });

const convertElevenToInfinity = (value: number) =>
  value >= 11 ? Number.POSITIVE_INFINITY : value;

const setPlayerCountRange: ActionHandler<[number, number]> = (
  state,
  payload
) => ({
  ...state,
  playerCountRange: [payload[0], convertElevenToInfinity(payload[1])],
});

const actions = {
  RESET_FILTERS: resetFilters,
  SET_USERNAME: setUsername,
  TOGGLE_SHOW_INVALID_PLAYER_COUNT: toggleShowInvalidPlayerCount,
  SET_PLAYER_COUNT_RANGE: setPlayerCountRange,
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
