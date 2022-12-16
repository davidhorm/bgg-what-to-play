import {
  Bar,
  BarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

const mockData = [
  { "numplayers": "1", "Best": 36, "Recommended": 145, "Not Recommended": -30 },
  { "numplayers": "2", "Best": 182, "Recommended": 87, "Not Recommended": -5 },
  { "numplayers": "3", "Best": 150, "Recommended": 99, "Not Recommended": -6 },
  { "numplayers": "4", "Best": 48, "Recommended": 159, "Not Recommended": -27 },
];

const tooltipSort = ["Best", "Recommended", "Not Recommended"];

export const PlayerCountChart = () => (
  <ResponsiveContainer minWidth={100} minHeight={150}>
    <BarChart
      width={500}
      height={300}
      data={mockData}
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
