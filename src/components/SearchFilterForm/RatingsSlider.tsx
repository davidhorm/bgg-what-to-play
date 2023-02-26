import { useState } from "react";
import type { CollectionFilterReducer } from "@/types";
import Slider from "@mui/material/Slider";

type Props = {
  filter: CollectionFilterReducer;
};

const getLabelByFilter = (
  filterState: CollectionFilterReducer["filterState"]
) =>
  filterState.showRatings === "USER_RATING"
    ? "User Ratings"
    : "Average Ratings";

const getAriaLabel =
  (filterState: CollectionFilterReducer["filterState"]) => (index: number) =>
    index === 0
      ? `Minimum ${getLabelByFilter(filterState)}`
      : `Maximum ${getLabelByFilter(filterState)}`;

const getValueLabel = (value: number) => value.toString();

const marks = Array.from({ length: 101 }, (_, index) => ({
  value: index / 10,
  label: index % 10 === 0 ? (index / 10).toString() : "",
}));

export const RatingsSlider = ({
  filter: { filterState, filterDispatch },
}: Props) => {
  const [range, setRange] = useState(filterState.ratingsRange);

  return (
    <div className="mt-2 mr-6 flex flex-col">
      <label htmlFor="ratings-range" className="text-sm">
        Filter by {getLabelByFilter(filterState)}
      </label>
      <Slider
        id="ratings-range"
        className="mx-4"
        valueLabelDisplay="auto"
        getAriaLabel={getAriaLabel(filterState)}
        getAriaValueText={getValueLabel}
        valueLabelFormat={getValueLabel}
        min={1}
        max={10}
        step={0.1}
        marks={marks}
        value={range}
        onChange={(_, value) => setRange(value as [number, number])}
        onChangeCommitted={(_, value) => {
          filterDispatch({
            type: "SET_RATINGS",
            payload: value as [number, number],
          });
        }}
      />
    </div>
  );
};
