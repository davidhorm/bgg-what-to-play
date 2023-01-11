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

const initialState = {
  username: getQueryParamValue(QUERY_PARAMS.USERNAME),
  showInvalidPlayerCount: false,
  filterByPlayerCountActive: false,
  filterByPlayerCountValue: 1,
};

export type CollectionFilters = typeof initialState;

type ActionHandler<T> = (
  state: CollectionFilters,
  payload: T
) => CollectionFilters;

const resetFilters: ActionHandler<Partial<undefined>> = () => initialState;

const setUsername: ActionHandler<string> = (state, username) => {
  setQueryParam(QUERY_PARAMS.USERNAME, username);
  return { ...state, username };
};

const toggleShowInvalidPlayerCount: ActionHandler<Partial<undefined>> = (
  state
) => ({ ...state, showInvalidPlayerCount: !state.showInvalidPlayerCount });

const toggleFilterByPlayerCountActive: ActionHandler<Partial<undefined>> = (
  state
) => ({
  ...state,
  filterByPlayerCountActive: !state.filterByPlayerCountActive,
});

const setFilterByPlayerCountValue: ActionHandler<number> = (
  state,
  payload
) => ({ ...state, filterByPlayerCountValue: payload });

const actions = {
  RESET_FILTERS: resetFilters,
  SET_USERNAME: setUsername,
  TOGGLE_SHOW_INVALID_PLAYER_COUNT: toggleShowInvalidPlayerCount,
  TOGGLE_FILTER_BY_PLAYER_COUNT_ACTIVE: toggleFilterByPlayerCountActive,
  SET_FILTER_BY_PLAYER_COUNT_VALUE: setFilterByPlayerCountValue,
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
const reducer: ActionHandler<Action> = (state, action): CollectionFilters =>
  (actions[action.type] as ActionHandler<typeof action["payload"]>)(
    state,
    action.payload
  );

export const useCollectionFilters = () => {
  const [filterState, filterDispatch] = useReducer(reducer, initialState);

  return { filterState, filterDispatch };
};
