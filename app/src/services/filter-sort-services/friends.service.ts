import { getInitialState, setQueryParam } from "./boolean-control.utils";
import type {
  BooleanFilterControl,
  FilterControl,
} from "./useCollectionFilters";

export const normalizeFriends = (
  friends: string[],
  username: string,
): string[] => {
  const seen = new Set([username.trim().toLowerCase()]);
  return friends
    .map((friend) => friend.trim())
    .filter((friend) => {
      const key = friend.toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};

export const friendsService: FilterControl<string[]> = {
  getInitialState: (params) =>
    normalizeFriends(params.getAll("friend"), params.get("username") || ""),
  getReducedState: (state, friends) => ({
    ...state,
    friendUsernames: normalizeFriends(friends, state.username),
  }),
  setQueryParam: (params, state) => {
    params.delete("friend");
    normalizeFriends(state.friendUsernames, state.username).forEach((friend) =>
      params.append("friend", friend),
    );
  },
  applyFilters: () => (games) => games,
};

const booleanService = (
  key: "includeFriends" | "showOwners",
): BooleanFilterControl => ({
  getInitialState: (params) => getInitialState(params, key),
  toggleReducedState: (state) => ({ ...state, [key]: !state[key] }),
  setQueryParam: (params, state) => setQueryParam(params, key, state[key]),
  applyFilters: () => (games) => games,
});

export const includeFriendsService = booleanService("includeFriends");
export const showOwnersService = booleanService("showOwners");
