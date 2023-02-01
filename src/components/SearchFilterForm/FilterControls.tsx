import type { CollectionFilterReducer } from "@/types";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";

type Props = {
  filter: CollectionFilterReducer;
};

export const FilterControls = ({
  filter: { filterState, filterDispatch },
}: Props) => (
  <section className="p-4">
    <FormGroup>
      <FormControlLabel
        label="Show expansions"
        control={
          <Checkbox
            checked={filterState.showExpansions}
            onChange={() => filterDispatch({ type: "TOGGLE_SHOW_EXPANSIONS" })}
          />
        }
      />

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
