export const CustomTooltip = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  { payload, label }: any
) => {
  if (!payload?.[0]?.payload) return null;

  const {
    Best,
    BestPercent,
    Recommended,
    RecommendedPercent,
    ["Not Recommended"]: notRecNeg,
    NotRecommendedPercent,
  } = payload[0].payload;
  const notRec = Math.abs(notRecNeg);

  return (
    <div className="bg-white/90 p-1 text-left text-sm">
      <p>Player Count: {label}</p>
      <ul className="table list-none pl-1">
        <li className="table-row">
          <span className="table-cell text-right" role="img" aria-label="best">
            😍:
          </span>
          <span className="table-cell px-1 text-right">{Best}</span>
          <span className="table-cell text-right">{BestPercent}%</span>
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
          <span className="table-cell text-right">{RecommendedPercent}%</span>
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
          <span className="table-cell text-right">
            {NotRecommendedPercent}%
          </span>
        </li>
      </ul>
    </div>
  );
};
