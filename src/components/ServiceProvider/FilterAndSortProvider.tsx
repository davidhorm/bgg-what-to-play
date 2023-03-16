import { createContext, useContext, ReactNode } from "react";
import {
  useCollectionFilters,
  initialFilterState,
  sortByOptions,
} from "@/services/filter-sort-services";

const FilterAndSortContext = createContext<
  Omit<
    ReturnType<typeof useCollectionFilters>,
    "filterDispatch" | "toggleSelectedSort" | "deleteSelectedSort"
  > & { sortByOptions: typeof sortByOptions }
>({
  filterState: initialFilterState,
  sliderControls: [],
  initialSliderValues: {},
  applyFiltersAndSorts: () => [],
  selectedSorts: [],
  sortByOptions,
});

const FilterAndSortDispatchContext = createContext<
  Pick<
    ReturnType<typeof useCollectionFilters>,
    "filterDispatch" | "toggleSelectedSort" | "deleteSelectedSort"
  >
>({
  filterDispatch: (state) => state,
  toggleSelectedSort: () => {
    return;
  },
  deleteSelectedSort: () => {
    return;
  },
});

export const FilterAndSortProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const {
    filterState,
    filterDispatch,
    sliderControls,
    initialSliderValues,
    applyFiltersAndSorts,
    selectedSorts,
    toggleSelectedSort,
    deleteSelectedSort,
  } = useCollectionFilters();

  const state = {
    filterState,
    sliderControls,
    initialSliderValues,
    applyFiltersAndSorts,
    selectedSorts,
    sortByOptions,
  };

  const dispatch = {
    filterDispatch,
    toggleSelectedSort,
    deleteSelectedSort,
  };

  return (
    <FilterAndSortContext.Provider value={state}>
      <FilterAndSortDispatchContext.Provider value={dispatch}>
        {children}
      </FilterAndSortDispatchContext.Provider>
    </FilterAndSortContext.Provider>
  );
};

export const useFilterState = () => useContext(FilterAndSortContext);
export const useFilterDispatch = () => useContext(FilterAndSortDispatchContext);
