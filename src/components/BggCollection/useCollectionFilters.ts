import { useReducer } from "react";

const initialState = {
  showInvalidPlayerCount: false,
};

export type CollectionFilters = typeof initialState;

// TODO: make action types easier to manage (p3)
type Action =
  | { type: "RESET_FILTERS" }
  | { type: "TOGGLE_SHOW_INVALID_PLAYER_COUNT" };

const reducer = (
  state: CollectionFilters,
  action: Action
): CollectionFilters => {
  if (action.type === "RESET_FILTERS") return initialState;

  if (action.type === "TOGGLE_SHOW_INVALID_PLAYER_COUNT")
    return { ...state, showInvalidPlayerCount: !state.showInvalidPlayerCount };

  return state;
};

export const useCollectionFilters = () => {
  const [filterState, filterDispatch] = useReducer(reducer, initialState);

  return { filterState, filterDispatch };
};
