import { useState } from "react";
import type { CollectionFilterReducer } from "@/types";
import Slider from "@mui/material/Slider";

type Props = {
  filter: CollectionFilterReducer;
};

const getAriaLabel = (index: number) =>
  index === 0 ? "Minimum Time Range" : "Maximum Time Range";

const getValueLabel = (value: number) =>
  value > 240 ? "240+" : value.toString();

const marks = Array.from({ length: 18 }, (_, index) => index * 15).map(
  (value) => ({
    value,
    label: [0, 60, 120, 180, 240, 255].includes(value)
      ? getValueLabel(value)
      : "",
  })
);

const convertGreaterThan240ToInfinity = (value: number) =>
  value > 240 ? Number.POSITIVE_INFINITY : value;

export const PlaytimeRangeSlider = ({
  filter: { filterState, filterDispatch },
}: Props) => {
  const [range, setRange] = useState(filterState.playtimeRange);

  return (
    <div className="mt-2 mr-6 flex flex-col">
      <label htmlFor="time-range" className="text-sm">
        Filter by Time (minutes)
      </label>
      <Slider
        id="time-range"
        className="mx-4"
        getAriaLabel={getAriaLabel}
        getAriaValueText={getValueLabel}
        valueLabelFormat={getValueLabel}
        valueLabelDisplay="auto"
        min={0}
        max={255}
        marks={marks}
        step={15}
        scale={convertGreaterThan240ToInfinity}
        value={range}
        onChange={(_, value) => setRange(value as [number, number])}
        onChangeCommitted={(_, value) => {
          filterDispatch({
            type: "SET_PLAYTIME_RANGE",
            payload: value as [number, number],
          });
        }}
      />
    </div>
  );
};
