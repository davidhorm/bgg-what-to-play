import type { Dispatch, SetStateAction } from "react";
import type { BoardGame, CollectionFilterState } from "./useCollectionFilters";

type SortDirection = "ASC" | "DESC";

export type SortFn = (
  direction: SortDirection,
  a: BoardGame,
  b: BoardGame,
  filterState: CollectionFilterState
) => number;

export type SortConfig = {
  /** Label */
  sortBy: string;

  /** Query Parameter Key */
  qpKey: string;

  /** Direction to sort */
  direction: SortDirection;

  /** Sort function */
  sort: SortFn;
};

export const stringSort = (direction: SortDirection, a: string, b: string) =>
  direction === "ASC" ? a.localeCompare(b) : b.localeCompare(a);

export const numberSort = (
  direction: SortDirection,
  a?: number,
  b?: number
) => {
  const valueA = typeof a !== "number" ? 0 : a;
  const valueB = typeof b !== "number" ? 0 : b;

  return direction === "ASC" ? valueA - valueB : valueB - valueA;
};

const QUERY_PARAM_SORT = "sort";

const setQueryParam = (state: SortConfig[]) => {
  const url = new URL(document.location.href);
  if (!url.searchParams.has("username")) return;

  const queryParamValue = state
    .map(({ qpKey, direction }) => `${qpKey}-${direction}`)
    .join("_")
    .toLocaleLowerCase();

  url.searchParams.set(QUERY_PARAM_SORT, queryParamValue);

  history.pushState({}, "", url);
};

/** Parse `"name-asc"` => `{ sortBy: "Name", direction: "ASC" }` */
const parseQueryParamToSortConfigs =
  (defaultSortConfigs: SortConfig[]) =>
  (keyValue: string): SortConfig | false => {
    const [qpKey, dir] = keyValue.split("-");

    const foundSortConfig = defaultSortConfigs.find((s) => s.qpKey === qpKey);
    if (!foundSortConfig) return false;

    const direction = dir.toUpperCase();
    if (direction !== "ASC" && direction !== "DESC") return false;

    return { ...foundSortConfig, direction };
  };

type Truthy<T> = T extends false | "" | 0 | null | undefined ? never : T;

const truthy = <T>(value: T): value is Truthy<T> => !!value;

/**
 * Get initial Sort state based on query parameter values
 * Parse `"sort=name-asc_rec-desc"` => `[{ sortBy: "Name", direction: "ASC" }, { sortBy: "Player Count Recommendation", direction: "DESC" }]`
 */
export const getInitialSortState = (
  defaultSortConfigs: SortConfig[]
): SortConfig[] => {
  const queryStringValue = new URLSearchParams(document.location.search).get(
    QUERY_PARAM_SORT
  );

  const initialState = queryStringValue
    ?.split("_")
    .map(parseQueryParamToSortConfigs(defaultSortConfigs))
    .filter(truthy);

  return initialState || [];
};

/**
 * 1. IF `sortBy` doesn't exist in `selectedSort` array, THEN append value to the end is default direction
 * 2. IF `sortBy` does exists in `selectedSort` array
 *   a. AND direction is different than default
 *     i.  AND `allowDelete`, then remove from `selectedSort` array
 *   b. ELSE (direction is same as default, or not `allowDelete`) toggle to other direction
 */
export const toggleSelectedSort =
  (
    setSelectedSorts: Dispatch<SetStateAction<SortConfig[]>>,
    defaultSortConfigs: SortConfig[]
  ) =>
  ({ sortBy, allowDelete }: { sortBy: string; allowDelete: boolean }) =>
    setSelectedSorts((existing) => {
      const existingSelectedSort = existing.find((s) => s.sortBy === sortBy);

      const defaultSortConfig =
        defaultSortConfigs.find((s) => s.sortBy === sortBy) ||
        defaultSortConfigs[0];

      let newState: SortConfig[] = [];

      if (!existingSelectedSort) {
        // if doesn't exist in array, then append to end
        newState = [...existing, defaultSortConfig];
      } else if (
        allowDelete &&
        existingSelectedSort.direction !== defaultSortConfig.direction
      ) {
        // if direction is different than default (and allowed to delete), then remove from array
        newState = existing.filter((e) => e.sortBy !== sortBy);
      } else {
        const toggledDirection =
          existingSelectedSort.direction === "ASC" ? "DESC" : "ASC";

        // if direction is default (or don't allow delete), then toggle.
        newState = existing.map((existingConfig) => ({
          ...existingConfig,
          direction:
            existingConfig.sortBy === sortBy
              ? toggledDirection
              : existingConfig.direction,
        }));
      }

      setQueryParam(newState);

      return newState;
    });

export const deleteSelectedSort =
  (setSelectedSorts: Dispatch<SetStateAction<SortConfig[]>>) =>
  (sortBy: string) =>
    setSelectedSorts((existing) => {
      const newState = existing.filter((e) => e.sortBy !== sortBy);
      setQueryParam(newState);
      return newState;
    });

export const applySort =
  (filterState: CollectionFilterState, selectedSorts: SortConfig[]) =>
  (a: BoardGame, b: BoardGame): number => {
    for (const { direction, sort } of selectedSorts) {
      const sortResult = sort(direction, a, b, filterState);
      if (sortResult !== 0) {
        return sortResult;
      }
    }

    return 0;
  };
