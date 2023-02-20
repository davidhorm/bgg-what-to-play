import type { FilterControl } from "./useCollectionFilters";

const QUERY_PARAM_USERNAME = "username";

const getInitialState = () =>
  new URLSearchParams(document.location.search).get(QUERY_PARAM_USERNAME) || "";

const getReducer: FilterControl<string>["getReducer"] = (state, username) => {
  if (!username) return state;

  const url = new URL(document.location.href);
  url.searchParams.set(QUERY_PARAM_USERNAME, username);
  history.pushState({}, "", url);

  return { ...state, username };
};

export const username: FilterControl<string> = {
  getInitialState,
  getReducer,
};
