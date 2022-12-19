import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import Slider from "@mui/material/Slider";
import type { useCollectionFilters } from "./useCollectionFilters";

type Props = {
  filter: ReturnType<typeof useCollectionFilters>;
};

export const FilterControls = ({
  filter: { filterState, filterDispatch },
}: Props) => (
  <section className="p-4">
    <FormGroup>
      <div className="flex">
        <FormControlLabel
          label="Filter by player count"
          className="min-w-fit"
          control={
            <Checkbox
              checked={filterState.filterByPlayerCountActive}
              onChange={() =>
                filterDispatch({ type: "TOGGLE_FILTER_BY_PLAYER_COUNT_ACTIVE" })
              }
            />
          }
        />

        <Slider
          aria-label="Filter by player count"
          className="mx-4 mt-8"
          getAriaValueText={(value) => value.toString()}
          valueLabelDisplay="on"
          size="small"
          min={1}
          max={15} // TODO: maybe calc max range based on collection (p3)
          marks
          disabled={!filterState.filterByPlayerCountActive}
          value={filterState.filterByPlayerCountValue}
          onChange={(_, value) =>
            filterDispatch({
              type: "SET_FILTER_BY_PLAYER_COUNT_VALUE",
              payload: value as number,
            })
          }
        />
      </div>

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
    </FormGroup>
  </section>
);
