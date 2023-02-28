import { useCollectionFilters } from "@/services/filter-sort-services";
import Paper from "@mui/material/Paper";
import Slider from "@mui/material/Slider";
import { BggCollection } from "./BggCollection";
import { FilterControls } from "./FilterControls";
import { Header } from "./Header";
import { UsernameInput } from "./UsernameInput";

export const SearchFilterForm = () => {
  const filter = useCollectionFilters();
  const { sliderControls } = filter;

  return (
    <main className="p-4">
      {!filter.filterState.username && <Header />}

      <Paper
        elevation={1}
        className="p-4"
        component="section"
        aria-label="Filter controls"
      >
        <UsernameInput filter={filter} />

        {sliderControls.map(({ sliderLabel, sliderProps }) => (
          <div key={sliderLabel} className="mt-2 mr-6 flex flex-col">
            <label htmlFor={sliderLabel} className="text-sm">
              {sliderLabel}
            </label>
            <Slider id={sliderLabel} className="mx-4" {...sliderProps} />
          </div>
        ))}

        <FilterControls filter={filter} />
      </Paper>

      <BggCollection filterState={filter.filterState} />
    </main>
  );
};
