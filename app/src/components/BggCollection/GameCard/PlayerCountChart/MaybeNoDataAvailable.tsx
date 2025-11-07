import { BoardGame } from "@/types";

/** If the polling data has zero votes, then display "No Data Available" text */
export const MaybeNoDataAvailable = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  { data, height, width }: any, // disable any because of how <Customized component /> works
) => {
  if (
    (data as BoardGame["recommendedPlayerCount"])?.filter(
      (rec) =>
        rec["Not Recommended"] !== 0 ||
        rec["Recommended"] !== 0 ||
        rec["Best"] !== 0,
    ).length > 0
  ) {
    return null;
  }

  const h = isNaN(height) ? 2 : height;
  const w = isNaN(width) ? 2 : width;

  return (
    <text dy={h / 2} dx={w / 2} fontSize="0.875rem" textAnchor="middle">
      No Recommendations Available
    </text>
  );
};
