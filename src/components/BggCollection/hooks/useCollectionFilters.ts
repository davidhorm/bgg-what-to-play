import { useReducer } from "react";

const initialState = {
  showInvalidPlayerCount: false,
  filterByPlayerCountActive: false,
  filterByPlayerCountValue: 1,
};

export type CollectionFilters = typeof initialState;

// TODO: make action types easier to manage (p3)
type Action =
  | { type: "RESET_FILTERS" }
  | { type: "TOGGLE_SHOW_INVALID_PLAYER_COUNT" }
  | { type: "TOGGLE_FILTER_BY_PLAYER_COUNT_ACTIVE" }
  | { type: "SET_FILTER_BY_PLAYER_COUNT_VALUE"; payload: number };

const reducer = (
  state: CollectionFilters,
  action: Action
): CollectionFilters => {
  if (action.type === "RESET_FILTERS") return initialState;

  if (action.type === "TOGGLE_SHOW_INVALID_PLAYER_COUNT")
    return { ...state, showInvalidPlayerCount: !state.showInvalidPlayerCount };

  if (action.type === "TOGGLE_FILTER_BY_PLAYER_COUNT_ACTIVE")
    return {
      ...state,
      filterByPlayerCountActive: !state.filterByPlayerCountActive,
    };

  if (action.type === "SET_FILTER_BY_PLAYER_COUNT_VALUE")
    return { ...state, filterByPlayerCountValue: action.payload };

  return state;
};

export const useCollectionFilters = () => {
  const [filterState, filterDispatch] = useReducer(reducer, initialState);

  return { filterState, filterDispatch };
};
