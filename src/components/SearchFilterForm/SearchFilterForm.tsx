import { useState } from "react";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import { BggCollection } from "./BggCollection";
import { FilterControls } from "./FilterControls";
import { Header } from "./Header";
import { ReactComponent as MagnifyingGlassIcon } from "./magnifying-glass.svg";
import { useCollectionFilters } from "./useCollectionFilters";
import { useQueryParams, QUERY_PARAMS } from "./useQueryParams";

export const SearchFilterForm = () => {
  const { username: usernameQueryParam, setQueryParam } = useQueryParams();
  const [username, setUsername] = useState(usernameQueryParam);
  const filter = useCollectionFilters();

  return (
    <main className="p-4">
      {!usernameQueryParam && <Header />}

      <Paper elevation={1} className="p-4">
        <form
          onSubmit={(e) => {
            setQueryParam(QUERY_PARAMS.USERNAME, username);
            e.preventDefault();
          }}
        >
          <TextField
            id="username"
            label="BGG Username"
            variant="filled"
            size="small"
            value={username}
            onChange={({ target: { value } }) => setUsername(value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton type="submit">
                    <MagnifyingGlassIcon className="h-4" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </form>

        <FilterControls filter={filter} />
      </Paper>

      <BggCollection
        filterState={{ ...filter.filterState, username: usernameQueryParam }}
      />
    </main>
  );
};
