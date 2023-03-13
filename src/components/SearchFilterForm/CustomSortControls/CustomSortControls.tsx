import { useState } from "react";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { ReactComponent as DownArrow } from "./down-arrow.svg";
import { ReactComponent as Plus } from "./plus.svg";

type SortOption = {
  sortBy: string;
  direction: "ASC" | "DESC";
};

const sortOptions: SortOption[] = [
  { sortBy: "Name", direction: "ASC" },
  { sortBy: "Player Count Recommendation", direction: "DESC" },
  { sortBy: "Average Playtime", direction: "DESC" },
  { sortBy: "Complexity", direction: "DESC" },
  { sortBy: "Ratings", direction: "DESC" },
];

const Arrow = ({ direction }: Partial<Pick<SortOption, "direction">>) =>
  direction ? (
    <DownArrow
      className={`ml-2 w-3 fill-current ${
        direction === "ASC" ? "rotate-180" : ""
      }`}
    />
  ) : (
    <></>
  );

export const CustomSortControls = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);
  const id = open ? "add-sorts-dialog" : undefined;

  const [selectedSort, setSelectedSort] = useState<SortOption[]>([]);

  const toggleSelectedSort = (sortOption: SortOption, allowDelete: boolean) => {
    const existingSelectedSort = selectedSort.find(
      (selected) => selected.sortBy === sortOption.sortBy
    );

    if (!existingSelectedSort) {
      // if doesn't exist in array, then append to end
      setSelectedSort((existing) => [...existing, sortOption]);
    } else if (
      allowDelete &&
      existingSelectedSort.direction !== sortOption.direction
    ) {
      // if direction is different than default, then remove from array
      setSelectedSort((existing) =>
        existing.filter((e) => e.sortBy !== sortOption.sortBy)
      );
    } else {
      const toggledDirection =
        existingSelectedSort.direction === "ASC" ? "DESC" : "ASC";

      // if direction is default, then toggle.
      setSelectedSort((existing) =>
        existing.map(({ sortBy, direction }) => ({
          sortBy,
          direction:
            sortBy === sortOption.sortBy ? toggledDirection : direction,
        }))
      );
    }
  };

  return (
    <>
      <ol className="m-1 flex list-none flex-row gap-2 pl-2">
        <li className="pl-2">
          <Button
            variant="outlined"
            startIcon={<Plus className="w-3 fill-current" />}
            aria-controls={open ? id : undefined}
            aria-expanded={open ? "true" : undefined}
            aria-haspopup="true"
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            Sort
          </Button>
        </li>

        {selectedSort.map(({ sortBy, direction }) => (
          <li key={sortBy}>
            <Chip
              label={sortBy}
              variant="outlined"
              icon={<Arrow direction={direction} />}
              onClick={() => toggleSelectedSort({ sortBy, direction }, false)}
              onDelete={() =>
                setSelectedSort((existing) =>
                  existing.filter((e) => e.sortBy !== sortBy)
                )
              }
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
        {sortOptions.map(({ sortBy, direction }) => (
          <MenuItem
            key={sortBy}
            onClick={() => toggleSelectedSort({ sortBy, direction }, true)}
          >
            <ListItemIcon>
              <Arrow
                direction={
                  selectedSort.find((i) => i.sortBy === sortBy)?.direction
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
