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

      const { direction, sort } =
        defaultSortConfigs.find((s) => s.sortBy === sortBy) ||
        defaultSortConfigs[0];

      let newState: SortConfig[] = [];

      if (!existingSelectedSort) {
        // if doesn't exist in array, then append to end
        newState = [...existing, { sortBy, direction, sort }];
      } else if (allowDelete && existingSelectedSort.direction !== direction) {
        // if direction is different than default (and allowed to delete), then remove from array
        newState = existing.filter((e) => e.sortBy !== sortBy);
      } else {
        const toggledDirection =
          existingSelectedSort.direction === "ASC" ? "DESC" : "ASC";

        // if direction is default (or don't allow delete), then toggle.
        newState = existing.map((e) => ({
          sortBy: e.sortBy,
          sort: e.sort,
          direction: e.sortBy === sortBy ? toggledDirection : e.direction,
        }));
      }

      return newState;
    });

export const deleteSelectedSort =
  (setSelectedSorts: Dispatch<SetStateAction<SortConfig[]>>) =>
  (sortBy: string) =>
    setSelectedSorts((existing) => existing.filter((e) => e.sortBy !== sortBy));

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
