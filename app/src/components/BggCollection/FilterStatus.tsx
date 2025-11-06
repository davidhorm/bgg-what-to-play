import CircularProgress from "@mui/material/CircularProgress";

type Props = {
  pubdate: string;
  filteredGamesLength: number;
  totalGamesLength: number;
  loadingMessage: string;
};

export const FilterStatus = ({
  pubdate,
  filteredGamesLength,
  totalGamesLength,
  loadingMessage,
}: Props) => (
  <dl
    aria-label="Search and filter results"
    role="status"
    className="flex px-4 text-xs text-gray-500"
  >
    <dt>Collection as of:</dt>
    <dd className="ml-1 mr-8">{pubdate}</dd>

    <dt># of Games:</dt>
    <dd className="ml-1 mr-8">
      {filteredGamesLength !== totalGamesLength
        ? ` ${filteredGamesLength} / ${totalGamesLength}`
        : ` ${totalGamesLength}`}
    </dd>

    {loadingMessage && (
      <>
        <dt id="loading-search-results">Loading</dt>
        <dd className="ml-1 mr-8">
          {loadingMessage}{" "}
          <CircularProgress
            aria-labelledby="loading-search-results"
            size="0.75rem"
          />
        </dd>
      </>
    )}
  </dl>
);
