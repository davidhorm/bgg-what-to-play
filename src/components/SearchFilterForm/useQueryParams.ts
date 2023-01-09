import { useState } from "react";

export const QUERY_PARAMS = {
  USERNAME: "username",
} as const;

type QueryParamKey = typeof QUERY_PARAMS[keyof typeof QUERY_PARAMS];

const getQueryParamValue = (key: QueryParamKey) =>
  new URLSearchParams(document.location.search).get(key) || "";

// TODO: make this Context (p1)
export const useQueryParams = () => {
  const [username, setUsername] = useState(
    getQueryParamValue(QUERY_PARAMS.USERNAME)
  );

  const setQueryParam = (key: QueryParamKey, value: string) => {
    const url = new URL(document.location.href);
    url.searchParams.set(key, value);
    history.pushState({}, "", url);

    switch (key) {
      case QUERY_PARAMS.USERNAME:
        setUsername(value);
        break;
      default:
        break;
    }
  };

  return { username, setQueryParam };
};
