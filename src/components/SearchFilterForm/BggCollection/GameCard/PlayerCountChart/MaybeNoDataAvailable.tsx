import { BoardGame } from "@/types";

/** If the polling data has zero votes, then display "No Data Available" text */
export const MaybeNoDataAvailable = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  { data, height, width }: any // disable any because of how <Customized component /> works
) => {
  if (
    (data as BoardGame["recommendedPlayerCount"]).filter(
      (rec) =>
        rec["Not Recommended"] !== 0 ||
        rec["Recommended"] !== 0 ||
        rec["Best"] !== 0
    ).length > 0
  ) {
    return null;
  }

  return (
    <text
      dy={height / 2}
      dx={width / 2}
      fontSize="0.875rem"
      textAnchor="middle"
    >
      No Recommendations Available
    </text>
  );
};
