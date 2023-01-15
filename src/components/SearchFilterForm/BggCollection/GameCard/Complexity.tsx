import { memo } from "react";
import type { BoardGame } from "@/types";
import Rating from "@mui/material/Rating";

type Props = {
  averageWeight: BoardGame["averageWeight"];
};
const NonMemoComplexity = ({ averageWeight }: Props) => (
  <div>
    Complexity:{" "}
    <Rating // TODO: style for mobile (p2)
      name="Complexity"
      value={averageWeight}
      readOnly
      size="small"
      precision={0.1}
      getLabelText={(value) => `${value} Complexity`}
    />
  </div>
);

export const Complexity = memo(NonMemoComplexity);
