import CircularProgress from "@mui/material/CircularProgress";
import type { useGetCollectionQuery } from "../hooks/useGetCollectionQuery";
import { AcceptedResponse } from "./AcceptedResponse";

type Props = Pick<ReturnType<typeof useGetCollectionQuery>, "loadingStatus">;

// TODO: implement aria-busy? (p3)
export const NoDataDisplay = ({ loadingStatus }: Props) =>
  loadingStatus.message === "202 Accepted" ? (
    <AcceptedResponse />
  ) : (
    <section className="p-4">
      <div>{loadingStatus.message}</div>

      {loadingStatus.status !== "FETCHING_ERROR" && (
        <CircularProgress
          variant="determinate"
          value={loadingStatus.progress}
        />
      )}
    </section>
  );
