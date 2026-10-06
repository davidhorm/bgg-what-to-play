"use client";

import { useState, type FormEvent } from "react";
import { normalizeFriends } from "@/services/filter-sort-services/friends.service";
import {
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  IconButton,
  InputAdornment,
  TextField,
} from "@mui/material";
import { useFilterDispatch, useFilterState } from "../ServiceProvider";
import MagnifyingGlassIcon from "./magnifying-glass.svg";

export const FriendsInput = () => {
  const {
    filterState: { username, friendUsernames, includeFriends, showOwners },
  } = useFilterState();
  const { filterDispatch } = useFilterDispatch();
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const friends = normalizeFriends(friendUsernames, username);
  const handleAddFriend = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = normalizeFriends([...friends, input], username);
    if (next.length === friends.length) {
      setError("Enter a different, non-empty BGG username.");
      return;
    }
    filterDispatch({ type: "SET_FRIENDS", payload: next });
    setInput("");
    setError("");
  };

  return (
    <div className="mt-3">
      <FormControlLabel
        label="Include friends library"
        control={
          <Checkbox
            checked={includeFriends}
            onChange={() => filterDispatch({ type: "TOGGLE_INCLUDE_FRIENDS" })}
          />
        }
      />
      {includeFriends && (
        <>
          <form onSubmit={handleAddFriend} className="flex items-start gap-2">
            <TextField
              label="Friend's BGG username"
              size="small"
              value={input}
              onChange={(event) => {
                setInput(event.target.value);
                setError("");
              }}
              error={!!error}
              helperText={error || "Add friends to include their owned games."}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton type="submit" aria-label="Search friends">
                      <MagnifyingGlassIcon className="h-4" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button type="submit" variant="outlined">
              Add friend
            </Button>
          </form>
          <ul
            aria-label="Friends"
            className="flex list-none flex-wrap gap-2 p-0"
          >
            {friends.map((friend) => (
              <li key={friend.toLowerCase()}>
                <Chip label={friend} />
                <Button
                  size="small"
                  aria-label={`Remove ${friend}`}
                  onClick={() =>
                    filterDispatch({
                      type: "SET_FRIENDS",
                      payload: friends.filter((name) => name !== friend),
                    })
                  }
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        </>
      )}
      <FormControlLabel
        label="Show owners"
        control={
          <Checkbox
            checked={showOwners}
            onChange={() => filterDispatch({ type: "TOGGLE_SHOW_OWNERS" })}
          />
        }
      />
    </div>
  );
};
