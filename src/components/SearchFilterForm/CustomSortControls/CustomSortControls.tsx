import { useState } from "react";
import {
  useFilterDispatch,
  useFilterState,
} from "@/components/ServiceProvider";
import { SortDirection } from "@/types";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { ReactComponent as DownArrow } from "./down-arrow.svg";
import { ReactComponent as Plus } from "./plus.svg";

const Arrow = ({ direction }: { direction?: SortDirection }) =>
  direction ? (
    <DownArrow
      className={`ml-2 w-3 fill-current ${
        direction === "ASC" ? "rotate-180" : ""
      }`}
      title={direction === "ASC" ? "Ascending" : "Descending"}
    />
  ) : (
    <></>
  );

export const CustomSortControls = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);
  const id = open ? "add-sorts-dialog" : undefined;
  const { selectedSorts, sortByOptions } = useFilterState();
  const { toggleSelectedSort, deleteSelectedSort } = useFilterDispatch();

  return (
    <>
      <ol className="m-1 flex list-none flex-row gap-2 pl-2">
        <li className="pl-2">
          <Button
            variant="outlined"
            startIcon={<Plus className="w-3 fill-current" title="Add" />}
            aria-controls={open ? id : undefined}
            aria-expanded={open ? "true" : undefined}
            aria-haspopup="true"
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            Sort
          </Button>
        </li>

        {selectedSorts.map(({ sortBy, direction }) => (
          <li key={sortBy}>
            <Chip
              label={sortBy}
              variant="outlined"
              icon={<Arrow direction={direction} />}
              onClick={() => toggleSelectedSort({ sortBy, allowDelete: false })}
              onDelete={() => deleteSelectedSort(sortBy)}
            />
          </li>
        ))}
      </ol>

      <Menu
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        MenuListProps={{
          "aria-labelledby": id,
        }}
      >
        {sortByOptions.map((sortBy) => (
          <MenuItem
            key={sortBy}
            onClick={() => toggleSelectedSort({ sortBy, allowDelete: true })}
          >
            <ListItemIcon>
              <Arrow
                direction={
                  selectedSorts.find((i) => i.sortBy === sortBy)?.direction
                }
              />
            </ListItemIcon>
            <ListItemText>{sortBy}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
