import { useState } from "react";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import { ReactComponent as MagnifyingGlassIcon } from "./magnifying-glass.svg";

const QUERY_PARAMS = {
  USERNAME: "username",
} as const;

type QueryParamKey = typeof QUERY_PARAMS[keyof typeof QUERY_PARAMS];

const pushQueryParam = (key: QueryParamKey, value: string) => {
  const url = new URL(document.location.href);
  url.searchParams.set(key, value);
  history.pushState({}, "", url);
};

const submitUsername =
  (username: string): React.DOMAttributes<HTMLFormElement>["onSubmit"] =>
  (event) => {
    pushQueryParam(QUERY_PARAMS.USERNAME, username);
    event.preventDefault();
  };

export const SearchFilterForm = () => {
  const initialUsername =
    new URLSearchParams(document.location.search).get(QUERY_PARAMS.USERNAME) ||
    "";
  const [username, setUsername] = useState(initialUsername);

  return (
    <Paper elevation={1} className="m-4 p-4">
      <form onSubmit={submitUsername(username)}>
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
  );
};
