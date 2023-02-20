import type { BooleanFilterControl } from "./useCollectionFilters";

const getReducer: BooleanFilterControl["getReducer"] =
  ({ stateKey, queryParamKey }) =>
  (state) => {
    if (!state.username) return state;

    const url = new URL(document.location.href);
    const newValue = !state[stateKey];

    const actualQueryParamKey = queryParamKey || stateKey;
    if (newValue) {
      url.searchParams.set(actualQueryParamKey, "1");
    } else {
      url.searchParams.delete(actualQueryParamKey);
    }

    history.pushState({}, "", url);
    return { ...state, [stateKey]: newValue };
  };

export const booleanQueryParam: BooleanFilterControl = {
  getInitialState: (queryParamKey: string) =>
    new URLSearchParams(document.location.search).get(queryParamKey) === "1",
  getReducer,
};
