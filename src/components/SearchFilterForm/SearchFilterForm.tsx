import Paper from "@mui/material/Paper";
import { BggCollection } from "./BggCollection";
import { ComplexitySlider } from "./ComplexitySlider";
import { FilterControls } from "./FilterControls";
import { Header } from "./Header";
import { PlayerCountSlider } from "./PlayerCountSlider";
import { PlaytimeRangeSlider } from "./PlaytimeRangeSlider";
import { RatingsSlider } from "./RatingsSlider";
import { UsernameInput } from "./UsernameInput";
import { useCollectionFilters } from "./hooks/useCollectionFilters";

export const SearchFilterForm = () => {
  const filter = useCollectionFilters();

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

        <PlayerCountSlider filter={filter} />

        <PlaytimeRangeSlider filter={filter} />

        <ComplexitySlider filter={filter} />

        <RatingsSlider filter={filter} />

        <FilterControls filter={filter} />
      </Paper>

      <BggCollection filterState={filter.filterState} />
    </main>
  );
};
