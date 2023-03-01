import { useState } from "react";
import type { CollectionFilterReducer } from "@/types";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import { ReactComponent as MagnifyingGlassIcon } from "./magnifying-glass.svg";

export const UsernameInput = ({
  username,
  setUsername,
}: CollectionFilterReducer["usernameControl"]) => {
  const [usernameInput, setUsernameInput] = useState(username);

  return (
    <form
      role="search"
      onSubmit={(e) => {
        setUsername(usernameInput);
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
              <IconButton type="submit" aria-label="Search">
                <MagnifyingGlassIcon className="h-4" />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </form>
  );
};
