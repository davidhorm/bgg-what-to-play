import type { BooleanFilterControl } from "./useCollectionFilters";

const setQueryParam: BooleanFilterControl["setQueryParam"] = (
  searchParams,
  queryParamKey,
  value
) => {
  if (value) {
    searchParams.set(queryParamKey, "1");
  } else {
    searchParams.delete(queryParamKey);
  }
};

export const booleanQueryParam: BooleanFilterControl = {
  getInitialState: (queryParamKey: string) =>
    new URLSearchParams(document.location.search).get(queryParamKey) === "1",
  getReducedState: (stateKey) => (state) => ({
    ...state,
    [stateKey]: !state[stateKey],
  }),
  setQueryParam,
};
