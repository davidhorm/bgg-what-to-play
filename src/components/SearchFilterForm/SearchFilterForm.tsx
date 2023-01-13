import Paper from "@mui/material/Paper";
import { BggCollection } from "./BggCollection";
import { FilterControls } from "./FilterControls";
import { Header } from "./Header";
import { UsernameInput } from "./UsernameInput";
import { useCollectionFilters } from "./useCollectionFilters";

export const SearchFilterForm = () => {
  const filter = useCollectionFilters();

  return (
    <main className="p-4">
      {!filter.filterState.username && <Header />}

      <Paper elevation={1} className="p-4">
        <UsernameInput filter={filter} />

        <FilterControls filter={filter} />
      </Paper>

      <BggCollection filterState={filter.filterState} />
    </main>
  );
};
