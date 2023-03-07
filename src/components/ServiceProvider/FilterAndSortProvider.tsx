import { createContext, useContext, ReactNode } from "react";
import {
  useCollectionFilters,
  initialFilterState,
} from "@/services/filter-sort-services";

const FilterAndSortContext = createContext<
  Omit<ReturnType<typeof useCollectionFilters>, "filterDispatch">
>({
  filterState: initialFilterState,
  sliderControls: [],
  initialSliderValues: {},
  applyFiltersAndSorts: () => [],
});

const FilterAndSortDispatchContext = createContext<
  ReturnType<typeof useCollectionFilters>["filterDispatch"]
>((state) => state);

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
  } = useCollectionFilters();

  const value = {
    filterState,
    sliderControls,
    initialSliderValues,
    applyFiltersAndSorts,
  };

  return (
    <FilterAndSortContext.Provider value={value}>
      <FilterAndSortDispatchContext.Provider value={filterDispatch}>
        {children}
      </FilterAndSortDispatchContext.Provider>
    </FilterAndSortContext.Provider>
  );
};

export const useFilterState = () => useContext(FilterAndSortContext);
export const useFilterDispatch = () => useContext(FilterAndSortDispatchContext);
