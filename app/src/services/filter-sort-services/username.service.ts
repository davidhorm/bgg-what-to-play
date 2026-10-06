import { normalizeFriends } from "./friends.service";
import type { FilterControl } from "./useCollectionFilters";

const QUERY_PARAM_USERNAME = "username";

export const usernameService: FilterControl<string> = {
  getInitialState: (searchParams) =>
    searchParams.get(QUERY_PARAM_USERNAME) || "",
  getReducedState: (state, username) => ({
    ...state,
    username: username.trim(),
    friendUsernames: normalizeFriends(state.friendUsernames, username),
  }),
  setQueryParam: (searchParams, state) =>
    searchParams.set(QUERY_PARAM_USERNAME, state.username),
  applyFilters: () => (notUsed) => notUsed,
};
