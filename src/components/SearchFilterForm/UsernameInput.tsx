import { useState } from "react";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import { ReactComponent as MagnifyingGlassIcon } from "./magnifying-glass.svg";
import type { useCollectionFilters } from "./useCollectionFilters";

type Props = {
  filter: ReturnType<typeof useCollectionFilters>;
};

export const UsernameInput = ({
  filter: { filterState, filterDispatch },
}: Props) => {
  const [usernameInput, setUsernameInput] = useState(filterState.username);

  return (
    <form
      onSubmit={(e) => {
        filterDispatch({ type: "SET_USERNAME", payload: usernameInput });
        e.preventDefault();
      }}
    >
      <TextField
        id="username"
        label="BGG Username"
        variant="filled"
        size="small"
        value={usernameInput}
        onChange={({ target: { value } }) => setUsernameInput(value)}
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
  );
};
