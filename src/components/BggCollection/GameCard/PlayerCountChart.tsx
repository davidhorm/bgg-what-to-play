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

// TODO: show percentage in tooltip (p3)
// TODO: add gradients to bar colors (p3)
// TODO: highlight bar (or dull other bars) when filtered (p2)
// TODO: maybe add id to bar so when Show Invalid that it doesn't change column (p3)

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
);
