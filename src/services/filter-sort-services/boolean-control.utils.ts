export const getInitialState = (queryParamKey: string) =>
  new URLSearchParams(document.location.search).get(queryParamKey) === "1";

export const setQueryParam = (
  searchParams: URLSearchParams,
  queryParamKey: string,
  value: boolean
) => {
  if (value) {
    searchParams.set(queryParamKey, "1");
  } else {
    searchParams.delete(queryParamKey);
  }
};
