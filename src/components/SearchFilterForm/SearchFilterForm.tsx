import { useState } from "react";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import { BggCollection } from "./BggCollection";
import { ReactComponent as MagnifyingGlassIcon } from "./magnifying-glass.svg";
import { useQueryParams, QUERY_PARAMS } from "./useQueryParams";

export const SearchFilterForm = () => {
  const { username: usernameQueryParam, setQueryParam } = useQueryParams();
  const [username, setUsername] = useState(usernameQueryParam);

  return (
    <main>
      <Paper elevation={1} className="m-4 p-4">
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
      </Paper>

      <BggCollection username={usernameQueryParam} />
    </main>
  );
};
