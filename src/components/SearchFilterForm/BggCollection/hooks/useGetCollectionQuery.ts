import { useQuery, useQueries } from "@tanstack/react-query";
import * as _ from "lodash-es";
import type { BriefCollection } from "./bggTypes";
import {
  fetchBggCollection,
  fetchBggThings,
  SimpleBoardGame,
  transformToBoardGame,
  transformToThingIdsCollection,
} from "./useGetCollectionQuery.utils";

// TODO: handle querying array of usernames (p3)
// TODO: handle querying other things like geeklists (p3)

export const useGetCollectionQuery = (
  username: string,
  showExpansions: boolean
) => {
  const {
    status: boardGameCollectionStatus,
    error: boardGameCollectionError,
    data: boardGameCollectionData,
  } = useQuery<BriefCollection, Error>({
    enabled: !!username,
    queryKey: ["BggCollectionBoardGame", username],
    queryFn: () => fetchBggCollection(username, false),
  });

  const {
    status: boardGameExpansionStatus,
    error: boardGameExpansionCollectionError,
    data: boardGameExpansionCollectionData,
  } = useQuery<BriefCollection, Error>({
    enabled: !!username && showExpansions,
    queryKey: ["BggCollectionBoardGameExpansion", username],
    queryFn: () => fetchBggCollection(username, true),
  });

  const thingIdsCollection = transformToThingIdsCollection(
    boardGameCollectionData,
    boardGameExpansionCollectionData
  );

  const thingResults = useQueries({
    queries: thingIdsCollection.map((thingIds) => ({
      queryKey: ["BggThings", thingIds],
      enabled: !!thingIds,
      queryFn: () => fetchBggThings(thingIds),
    })),
  });

  const data: SimpleBoardGame[] | undefined = _.flatten(
    thingResults.map((result) =>
      result.data?.items.item
        ? result.data.items.item.map(transformToBoardGame)
        : []
    )
  );

  /**
   * Returns the total number of queries (Collections + Things). If still querying the collection,
   * then assume at least 1 extra Thing query, and append '?' char.
   */
  const getQueryDenominator = () => {
    if (!username) return "/ 0";

    if (showExpansions) {
      if (
        boardGameCollectionStatus === "loading" &&
        boardGameExpansionStatus === "loading"
      )
        return "/ 4?";

      if (
        boardGameCollectionStatus === "success" &&
        boardGameExpansionStatus === "loading"
      )
        return `/ ${thingResults.length + 3}?`;

      return `/ ${thingResults.length + 2}`;
    }

    if (boardGameCollectionStatus === "loading") return "/ 2?";

    return `/ ${
      thingResults.length + 1 + Number(boardGameExpansionStatus === "success")
    }`;
  };

  const initialLoadingState = {
    /** Number of queries in `success` state. */
    successfulQueryCount:
      Number(boardGameCollectionStatus === "success") +
      Number(boardGameExpansionStatus === "success"),

    /** True if there are any errors in the queries. */
    isError:
      boardGameCollectionStatus === "error" ||
      boardGameExpansionStatus === "error",

    /** Any error messages. */
    errorMessage: `${boardGameCollectionError?.message || ""} ${
      boardGameExpansionCollectionError?.message || ""
    }`.trim(),
  };

  const loadingStatus = thingResults.reduce(
    (prevVal, currVal) => ({
      successfulQueryCount:
        prevVal.successfulQueryCount + Number(currVal.status === "success"),
      isError: prevVal.isError || currVal.status === "error",
      errorMessage: `${prevVal.errorMessage} ${
        (currVal.error as Error)?.message
      }`.trim(),
    }),
    initialLoadingState
  );

  const loadingMessage =
    loadingStatus.successfulQueryCount <
    thingResults.length + 1 + Number(showExpansions)
      ? `Loading (${
          loadingStatus.successfulQueryCount + getQueryDenominator()
        })`
      : "";

  return {
    pubdate: boardGameCollectionData?.items?.pubdate
      ? `Collection as of: ${new Date(
          boardGameCollectionData?.items?.pubdate
        ).toLocaleDateString()}`
      : "",
    loadingMessage,
    data,
    error: loadingStatus.isError
      ? {
          isBoardGameAccepted:
            boardGameCollectionError?.message === "202 Accepted",
          isExpansionAccepted:
            boardGameExpansionCollectionError?.message === "202 Accepted",
          message: loadingStatus.errorMessage,
        }
      : undefined,
  };
};
