import { createContext, useContext, ReactNode } from "react";
import {
  useCollectionFilters,
  initialFilterState,
  sortByOptions,
} from "@/services/filter-sort-services";

const FilterAndSortContext = createContext<
  Omit<
    ReturnType<typeof useCollectionFilters>,
    "filterDispatch" | "toggleSelectedSort" | "deleteSort"
  > & { sortByOptions: typeof sortByOptions }
>({
  filterState: initialFilterState,
  sliderControls: [],
  initialSliderValues: {},
  applyFiltersAndSorts: () => [],
  selectedSort: [],
  sortByOptions,
});

const FilterAndSortDispatchContext = createContext<
  Pick<
    ReturnType<typeof useCollectionFilters>,
    "filterDispatch" | "toggleSelectedSort" | "deleteSort"
  >
>({
  filterDispatch: (state) => state,
  toggleSelectedSort: () => {
    return;
  },
  deleteSort: () => {
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
    selectedSort,
    toggleSelectedSort,
    deleteSort,
  } = useCollectionFilters();

  const state = {
    filterState,
    sliderControls,
    initialSliderValues,
    applyFiltersAndSorts,
    selectedSort,
    sortByOptions,
  };

  const dispatch = {
    filterDispatch,
    toggleSelectedSort,
    deleteSort,
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
