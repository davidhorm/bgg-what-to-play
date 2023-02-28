export const getQueryParamValue = (key: string) =>
  new URLSearchParams(document.location.search).get(key) || "";

export const getAriaLabel = (label: string) => (index: number) =>
  index === 0 ? `Minimum ${label}` : `Maximum ${label}`;

export const getValueLabel = (value: number) => value.toString();

const convertRangeValueToQueryParam = (range: [number, number]): string => {
  const [minRange, maxRange] = range;

  return minRange === maxRange ? minRange.toString() : range.join("-");
};

export const maybeSetQueryParam = (
  searchParams: URLSearchParams,
  range: [number, number],
  defaultRange: [number, number],
  queryParamKey: string
) => {
  // Only set the query param if not using the default values
  if (range[0] !== defaultRange[0] || range[1] !== defaultRange[1]) {
    searchParams.set(queryParamKey, convertRangeValueToQueryParam(range));
  } else {
    searchParams.delete(queryParamKey);
  }
};
