import type { CollectionFilterReducer } from "@/types";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";

type Props = {
  filter: CollectionFilterReducer;
};

export const FilterControls = ({
  filter: { filterState, filterDispatch },
}: Props) => (
  <div className="mt-1">
    <FormControlLabel
      label="Show expansions"
      control={
        <Checkbox
          checked={filterState.showExpansions}
          onChange={() => filterDispatch({ type: "TOGGLE_SHOW_EXPANSIONS" })}
        />
      }
    />

    <FormGroup row>
      <FormControlLabel
        id="show-ratings"
        label="Show ratings"
        control={
          <Checkbox
            checked={filterState.showRatings !== "NO_RATING"}
            onChange={() => filterDispatch({ type: "TOGGLE_SHOW_RATINGS" })}
          />
        }
      />
      <RadioGroup
        className="ml-8"
        aria-labelledby="show-ratings"
        name="show-ratings-group"
        row
        value={filterState.showRatings}
        onChange={(_, newRating) =>
          filterDispatch({
            type: "SET_SHOW_RATINGS",
            payload: newRating as "USER_RATING" | "AVERAGE_RATING",
          })
        }
      >
        <FormControlLabel
          value="AVERAGE_RATING"
          disabled={filterState.showRatings === "NO_RATING"}
          control={<Radio />}
          label="Average Ratings"
        />
        <FormControlLabel
          value="USER_RATING"
          disabled={filterState.showRatings === "NO_RATING"}
          control={<Radio />}
          label="User Ratings"
        />
      </RadioGroup>
    </FormGroup>

    <FormControlLabel
      label="Show invalid player counts"
      control={
        <Checkbox
          checked={filterState.showInvalidPlayerCount}
          onChange={() =>
            filterDispatch({ type: "TOGGLE_SHOW_INVALID_PLAYER_COUNT" })
          }
        />
      }
    />
  </div>
);
