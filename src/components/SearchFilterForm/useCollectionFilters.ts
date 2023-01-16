import { useReducer } from "react";

const DEFAULT_PLAYER_COUNT_MIN = 1;
const DEFAULT_PLAYER_COUNT_MAX = Number.POSITIVE_INFINITY;

//#region QueryParams

const QUERY_PARAMS = {
  USERNAME: "username",
  PLAYER_COUNT: "playerCount",
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
    : convertElevenToInfinity(Math.max(parsedMinRange, 1));

  return [minRange, maxRange];
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

    history.pushState({}, "", url);
  }
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
  playerCountRange: convertPlayerCountRangeQueryParamToValue(
    getQueryParamValue(QUERY_PARAMS.PLAYER_COUNT)
  ),
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
) => ({ ...state, showInvalidPlayerCount: !state.showInvalidPlayerCount });

const convertElevenToInfinity = (value: number) =>
  value >= 11 ? Number.POSITIVE_INFINITY : value;

const setPlayerCountRange: ActionHandler<[number, number]> = (state, payload) =>
  setQueryParamAndState(state, {
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
