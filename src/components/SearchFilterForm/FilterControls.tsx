import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import { useFilterDispatch, useFilterState } from "../ServiceProvider";

export const FilterControls = () => {
  const {
    filterState: {
      showRatings,
      showExpansions,
      showNotRecommended,
      showInvalidPlayerCount,
    },
  } = useFilterState();
  const filterDispatch = useFilterDispatch();

  return (
    <div className="mt-1">
      <FormGroup row>
        <FormControlLabel
          id="show-ratings"
          label="Show ratings"
          control={
            <Checkbox
              checked={showRatings !== "NO_RATING"}
              onChange={() => filterDispatch({ type: "TOGGLE_SHOW_RATINGS" })}
            />
          }
        />
        <RadioGroup
          className="ml-8"
          aria-labelledby="show-ratings"
          name="show-ratings-group"
          row
          value={showRatings}
          onChange={(_, newRating) =>
            filterDispatch({
              type: "SET_SHOW_RATINGS",
              payload: newRating as "USER_RATING" | "AVERAGE_RATING",
            })
          }
        >
          <FormControlLabel
            value="AVERAGE_RATING"
            disabled={showRatings === "NO_RATING"}
            control={<Radio />}
            label="Average Ratings"
          />
          <FormControlLabel
            value="USER_RATING"
            disabled={showRatings === "NO_RATING"}
            control={<Radio />}
            label="User Ratings"
          />
        </RadioGroup>
      </FormGroup>

      <FormControlLabel
        label="Show expansions"
        control={
          <Checkbox
            checked={showExpansions}
            onChange={() => filterDispatch({ type: "TOGGLE_SHOW_EXPANSIONS" })}
          />
        }
      />

      <FormControlLabel
        label="Show not recommended player counts"
        control={
          <Checkbox
            checked={showNotRecommended}
            onChange={() =>
              filterDispatch({
                type: "TOGGLE_SHOW_NOT_RECOMMENDED_PLAYER_COUNT",
              })
            }
          />
        }
      />

      <FormControlLabel
        label="Show invalid player counts"
        control={
          <Checkbox
            checked={showInvalidPlayerCount}
            onChange={() =>
              filterDispatch({ type: "TOGGLE_SHOW_INVALID_PLAYER_COUNT" })
            }
          />
        }
      />
    </div>
  );
};
