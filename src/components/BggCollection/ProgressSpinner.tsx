import CircularProgress from "@mui/material/CircularProgress";
import type { useGetCollectionQuery } from "./hooks/useGetCollectionQuery";

type Props = Pick<ReturnType<typeof useGetCollectionQuery>, "loadingStatus">;

export const ProgressSpinner = ({ loadingStatus }: Props) => (
  <section>
    <div>{loadingStatus.message}</div>

    {loadingStatus.status !== "FETCHING_ERROR" && (
      <CircularProgress variant="determinate" value={loadingStatus.progress} />
    )}
  </section>
);
