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

/** If the polling data has zero votes, then display "No Data Available" text */
const MaybeNoDataAvailable = (
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

const CustomTooltip = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  { payload, label }: any
) => {
  if (!payload[0]?.payload) return null;

  const {
    Best,
    Recommended,
    ["Not Recommended"]: notRecNeg,
  } = payload[0].payload;
  const notRec = Math.abs(notRecNeg);
  const total = Best + Recommended + notRec;

  const getPercentage = (value: number) =>
    ` (${Math.round((value / total) * 100)}%)`;

  return (
    <div className="bg-white/90 p-1 text-left text-sm">
      <p>Player Count: {label}</p>
      <ul className="table list-none pl-1">
        <li className="table-row">
          <span className="table-cell text-right" role="img" aria-label="best">
            😍:
          </span>
          <span className="table-cell px-1 text-right">{Best}</span>
          <span className="table-cell text-right">{getPercentage(Best)}</span>
        </li>
        <li className="table-row">
          <span
            className="table-cell text-right"
            role="img"
            aria-label="recommended"
          >
            🙂:
          </span>
          <span className="table-cell px-1 text-right">{Recommended}</span>
          <span className="table-cell text-right">
            {getPercentage(Recommended)}
          </span>
        </li>
        <li className="table-row">
          <span
            className="table-cell text-right"
            role="img"
            aria-label="not recommended"
          >
            😓:
          </span>
          <span className="table-cell px-1 text-right">{notRec}</span>
          <span className="table-cell text-right">{getPercentage(notRec)}</span>
        </li>
      </ul>
    </div>
  );
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
