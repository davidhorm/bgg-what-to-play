import { useState } from "react";
import Paper from "@mui/material/Paper";
import Slider from "@mui/material/Slider";
import { useFilterState } from "../ServiceProvider";
import { CheckboxControls } from "./CheckboxControls";
import { CustomSortControls } from "./CustomSortControls";
import { UsernameInput } from "./UsernameInput";

export const SearchFilterForm = () => {
  const { sliderControls, initialSliderValues } = useFilterState();

  const [sliderValues, setSliderValues] = useState(initialSliderValues);

  return (
    <Paper
      elevation={1}
      className="p-4"
      component="section"
      aria-label="Filter controls"
    >
      <UsernameInput />

      {sliderControls.map(({ sliderLabel, sliderProps }, index) => (
        <div key={sliderLabel} className="mt-2 mr-6 flex flex-col">
          <label htmlFor={sliderLabel} className="text-sm">
            {sliderLabel}
          </label>
          <Slider
            id={sliderLabel}
            className="mx-4"
            {...sliderProps}
            value={sliderValues[index]}
            onChange={(_, value) =>
              setSliderValues({
                ...sliderValues,
                [index]: value as [number, number],
              })
            }
          />
        </div>
      ))}

      <CheckboxControls />

      <CustomSortControls />
    </Paper>
  );
};
