import type { Dispatch, SetStateAction } from "react";
import type { BoardGame, SortByOption } from "./useCollectionFilters";

export type SortDirection = "ASC" | "DESC";

type SortFn = (direction: SortDirection, a: BoardGame, b: BoardGame) => number;

export type SelectedSort = {
  sortBy: SortByOption;
  direction: SortDirection;
  sort: SortFn;
};

export type SortConfig = Record<
  SortByOption,
  Pick<SelectedSort, "direction" | "sort">
>;

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
    selectedSort: SelectedSort[],
    setSelectedSort: Dispatch<SetStateAction<SelectedSort[]>>,
    sortConfig: SortConfig
  ) =>
  ({ sortBy, allowDelete }: { sortBy: SortByOption; allowDelete: boolean }) => {
    const existingSelectedSort = selectedSort.find((s) => s.sortBy === sortBy);
    const { direction, sort } = sortConfig[sortBy];

    if (!existingSelectedSort) {
      // if doesn't exist in array, then append to end
      setSelectedSort((existing) => [...existing, { sortBy, direction, sort }]);
    } else if (allowDelete && existingSelectedSort.direction !== direction) {
      // if direction is different than default, then remove from array
      setSelectedSort((existing) =>
        existing.filter((e) => e.sortBy !== sortBy)
      );
    } else {
      const toggledDirection =
        existingSelectedSort.direction === "ASC" ? "DESC" : "ASC";

      // if direction is default (or don't allow delete), then toggle.
      setSelectedSort((existing) =>
        existing.map((e) => ({
          sortBy: e.sortBy,
          sort: e.sort,
          direction: e.sortBy === sortBy ? toggledDirection : e.direction,
        }))
      );
    }
  };

export const deleteSort =
  (setSelectedSort: Dispatch<SetStateAction<SelectedSort[]>>) =>
  (sortBy: string) =>
    setSelectedSort((existing) => existing.filter((e) => e.sortBy !== sortBy));

export const applySort =
  (selectedSort: SelectedSort[]) =>
  (a: BoardGame, b: BoardGame): number => {
    for (const { direction, sort } of selectedSort) {
      const sortResult = sort(direction, a, b);
      if (sortResult !== 0) {
        return sortResult;
      }
    }

    return 0;
  };
