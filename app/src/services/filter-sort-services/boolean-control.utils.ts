export const getInitialState = (
  searchParams: URLSearchParams,
  queryParamKey: string,
) => searchParams.get(queryParamKey) === "1";

export const setQueryParam = (
  searchParams: URLSearchParams,
  queryParamKey: string,
  value: boolean,
) => {
  if (value) {
    searchParams.set(queryParamKey, "1");
  } else {
    searchParams.delete(queryParamKey);
  }
};
