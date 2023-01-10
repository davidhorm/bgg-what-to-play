import { useRef } from "react";
import {
  Bar,
  BarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import type { BoardGame } from "..";
import { useOnScreen } from "../hooks/useOnScreen";

const tooltipSort = ["Best", "Recommended", "Not Recommended"];

type Props = Pick<BoardGame, "recommendedPlayerCount">;

// TODO: replace tooltip with % in label (p3) - see https://recharts.org/en-US/api/Label
// TODO: add gradients to bar colors (p3)
// TODO: highlight bar (or dull other bars) when filtered (p2)
// TODO: display placeholder when no data available (p2) - see https://github.com/recharts/recharts/issues/430

export const PlayerCountChart = ({ recommendedPlayerCount }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const isOnScreen = useOnScreen(ref);

  return (
    <div ref={ref} className="h-36">
      {isOnScreen && (
        <ResponsiveContainer minWidth="6rem" minHeight="9rem">
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
            <XAxis dataKey="numplayers" axisLine={false} />
            <Tooltip
              formatter={(value) => Math.abs(parseInt(value.toString(), 10))}
              itemSorter={(item) => tooltipSort.indexOf(item.dataKey as string)}
              labelFormatter={(label) => `Player Count: ${label}`}
            />
            <ReferenceLine y={0} stroke="#000" />
            <Bar
              stackId="playerCount"
              maxBarSize={32}
              dataKey="Recommended"
              fill="#22c55e"
            />
            <Bar
              stackId="playerCount"
              maxBarSize={32}
              dataKey="Best"
              fill="#15803d"
            />
            <Bar
              stackId="playerCount"
              maxBarSize={32}
              dataKey="Not Recommended"
              fill="#f87171"
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
