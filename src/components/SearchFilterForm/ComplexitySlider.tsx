import { useState } from "react";
import type { CollectionFilterReducer } from "@/types";
import Slider from "@mui/material/Slider";

type Props = {
  filter: CollectionFilterReducer;
};

const getAriaLabel = (index: number) =>
  index === 0 ? "Minimum Complexity" : "Maximum Complexity";

const getValueLabel = (value: number) => value.toString();

const marks = Array.from({ length: 51 }, (_, index) => ({
  value: index / 10,
  label: index % 10 === 0 ? (index / 10).toString() : "",
}));

export const ComplexitySlider = ({
  filter: { filterState, filterDispatch },
}: Props) => {
  const [range, setRange] = useState(filterState.complexityRange);

  return (
    <div className="mt-2 mr-6 flex flex-col">
      <label htmlFor="complexity-range" className="text-sm">
        Filter by Complexity
      </label>
      <Slider
        id="complexity-range"
        className="mx-4"
        valueLabelDisplay="auto"
        getAriaLabel={getAriaLabel}
        getAriaValueText={getValueLabel}
        valueLabelFormat={getValueLabel}
        min={1}
        max={5}
        step={0.1}
        marks={marks}
        value={range}
        onChange={(_, value) => setRange(value as [number, number])}
        onChangeCommitted={(_, value) => {
          filterDispatch({
            type: "SET_COMPLEXITY",
            payload: value as [number, number],
          });
        }}
      />
    </div>
  );
};
