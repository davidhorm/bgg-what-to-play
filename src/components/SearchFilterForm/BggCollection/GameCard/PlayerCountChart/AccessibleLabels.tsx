import type { BoardGame } from "@/types";

const toNumberAndPercentage = (value: number, total: number) =>
  `${value} (${Math.round((value / total) * 100)}%)`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const AccessibleLabels = ({ data }: any) => (
  <>
    {(data as BoardGame["recommendedPlayerCount"]).map((rec) => {
      const {
        playerCountLabel,
        Best,
        Recommended,
        "Not Recommended": negNotRec,
      } = rec;
      const notRec = Math.abs(negNotRec);
      const total = Best + Recommended + notRec;

      return (
        <text
          key={playerCountLabel}
          aria-label={`${playerCountLabel} player count poll`}
          aria-details={`${toNumberAndPercentage(
            Best,
            total
          )} voted best. ${toNumberAndPercentage(
            Recommended,
            total
          )} voted recommended. ${toNumberAndPercentage(
            notRec,
            total
          )} voted not recommended.`}
        ></text>
      );
    })}
  </>
);
