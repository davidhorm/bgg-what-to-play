import Paper from "@mui/material/Paper";
import { BggCollection } from "./BggCollection";
import { FilterControls } from "./FilterControls";
import { Header } from "./Header";
import { PlayerCountSlider } from "./PlayerCountSlider";
import { PlaytimeRangeSlider } from "./PlaytimeRangeSlider";
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

        <FilterControls filter={filter} />
      </Paper>

      <BggCollection filterState={filter.filterState} />
    </main>
  );
};
