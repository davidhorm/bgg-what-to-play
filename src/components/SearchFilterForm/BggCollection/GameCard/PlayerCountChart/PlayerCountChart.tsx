import type { BoardGame, CollectionFilterState } from "@/types";
import { useInView } from "react-intersection-observer";
import {
  Bar,
  BarChart,
  Cell,
  Customized,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { CustomTooltip } from "./CustomTooltip";
import { MaybeNoDataAvailable } from "./MaybeNoDataAvailable";

type Recommendation = "Best" | "Recommended" | "Not Recommended";

const colorFillByRec: Record<Recommendation, [string, string]> = {
  "Best": ["#15803d" /* green-700 */, "#bbf7d0" /* green-200 */],
  "Recommended": ["#22c55e" /* green-500 */, "#dcfce7" /* green-100 */],
  "Not Recommended": ["#f87171" /* red-400 */, "#fee2e2" /* red-100 */],
};

type Props = Pick<BoardGame, "recommendedPlayerCount"> & {
  filterState: CollectionFilterState;
};

const getFill = (
  isPlayerCountWithinRange: Props["recommendedPlayerCount"][number]["isPlayerCountWithinRange"],
  filterState: CollectionFilterState,
  recommendation: Recommendation
) => {
  const [defaultColor, fadedColor] = colorFillByRec[recommendation];
  const [minRange, maxRange] = filterState.playerCountRange;

  if (minRange !== 1 || maxRange !== Number.POSITIVE_INFINITY) {
    return isPlayerCountWithinRange ? defaultColor : fadedColor;
  }

  return defaultColor;
};

export const PlayerCountChart = ({
  recommendedPlayerCount,
  filterState,
}: Props) => {
  const { ref, inView } = useInView();

  return (
    <div ref={ref} className="h-36">
      {inView && (
        <figure className="m-0">
          <figcaption className="mt-4 text-xs text-gray-500">
            Player Count Recommendations
          </figcaption>
          <ResponsiveContainer minWidth="18rem" minHeight="9rem">
            <BarChart
              width={500}
              height={300}
              data={recommendedPlayerCount}
              stackOffset="sign"
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <XAxis
                dataKey="playerCountLabel"
                axisLine={false}
                interval="preserveStartEnd"
              />

              <Tooltip content={<CustomTooltip />} />

              <ReferenceLine y={0} stroke="#000" />

              <Customized component={<MaybeNoDataAvailable />} />

              {["Recommended", "Best", "Not Recommended"].map(
                (recommendation, recommendationIndex) => (
                  <Bar
                    key={`${recommendation}-${recommendationIndex}`}
                    stackId="playerCount"
                    maxBarSize={32}
                    dataKey={recommendation}
                  >
                    {recommendedPlayerCount.map(
                      (playerCount, playerCountIndex) => (
                        <Cell
                          key={`${recommendation}-${playerCount.playerCountValue}-${playerCountIndex}`}
                          fill={getFill(
                            playerCount.isPlayerCountWithinRange,
                            filterState,
                            recommendation as Recommendation
                          )}
                        />
                      )
                    )}
                  </Bar>
                )
              )}
            </BarChart>
          </ResponsiveContainer>
        </figure>
      )}
    </div>
  );
};
