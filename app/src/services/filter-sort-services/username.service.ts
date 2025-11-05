import type { FilterControl } from "./useCollectionFilters";

const QUERY_PARAM_USERNAME = "username";

export const usernameService: FilterControl<string> = {
  getInitialState: (searchParams) =>
    searchParams.get(QUERY_PARAM_USERNAME) || "",
  getReducedState: (state, username) => ({ ...state, username }),
  setQueryParam: (searchParams, state) =>
    searchParams.set(QUERY_PARAM_USERNAME, state.username),
  applyFilters: () => (notUsed) => notUsed,
};
