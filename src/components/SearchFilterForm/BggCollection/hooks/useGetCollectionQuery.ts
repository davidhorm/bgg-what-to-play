import { useQuery, useQueries } from "@tanstack/react-query";
import { XMLParser } from "fast-xml-parser";
import * as _ from "lodash-es";
import type { BriefCollection, Thing } from "./bggTypes";
import {
  SimpleBoardGame,
  transformToBoardGame,
  transformToThingIds,
} from "./useGetCollectionQuery.utils";

// TODO: handle querying array of usernames (p3)
// TODO: handle querying other things like geeklists (p3)

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  textNodeName: "text",
  removeNSPrefix: true,
  allowBooleanAttributes: true,
  parseAttributeValue: true,
});

const fetchBggCollection = (username: string, showExpansions: boolean) =>
  fetch(
    showExpansions
      ? `https://bgg.cc/xmlapi2/collection?username=${username}&brief=1&own=1&subtype=boardgameexpansion`
      : `https://bgg.cc/xmlapi2/collection?username=${username}&brief=1&own=1&excludesubtype=boardgameexpansion`
  )
    .then((response) => {
      if (response.status === 202) {
        // Handle response code 202 for queued request. (p1)
        // see https://boardgamegeek.com/wiki/page/BGG_XML_API2#toc11
        throw new Error("202 Accepted");
      }

      return response.text();
    })
    .then((xml) => parser.parse(xml))
    .catch((e) => {
      throw new Error(
        e?.message || `Unable to query collection for ${username}`
      );
    });

const fetchBggThings = (thingIds?: string): Promise<Thing> | undefined =>
  thingIds
    ? fetch(`https://bgg.cc/xmlapi2/thing?id=${thingIds}&stats=1`)
        .then((response) => response.text())
        .then((xml) => parser.parse(xml))
        .catch((err) => {
          throw new Error(JSON.stringify(err));
        })
    : undefined;

const THING_QUERY_LIMIT = 1200;

const transformToThingIdsCollection = (
  boardgames?: BriefCollection,
  expansions?: BriefCollection
) =>
  [
    ..._.chunk(boardgames?.items.item, THING_QUERY_LIMIT),
    ..._.chunk(expansions?.items.item, THING_QUERY_LIMIT),
  ].map((briefs) => briefs.map(transformToThingIds).join(","));

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
