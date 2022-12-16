import {
  Bar,
  BarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import type { BoardGame } from "..";

const tooltipSort = ["Best", "Recommended", "Not Recommended"];

type Props = Pick<BoardGame, "recommendedPlayerCount">;

export const PlayerCountChart = ({ recommendedPlayerCount }: Props) => (
  <ResponsiveContainer minWidth={100} minHeight={150}>
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
      <Bar stackId="playerCount" dataKey="Recommended" fill="#22c55e" />
      <Bar stackId="playerCount" dataKey="Best" fill="#15803d" />
      <Bar stackId="playerCount" dataKey="Not Recommended" fill="#f87171" />
    </BarChart>
  </ResponsiveContainer>
);
