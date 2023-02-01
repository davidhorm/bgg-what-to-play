import { useQuery } from "@tanstack/react-query";
import { XMLParser } from "fast-xml-parser";
import type { BriefCollection, Thing } from "./bggTypes";
import {
  SimpleBoardGame,
  getLoadingStatus,
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

export const useGetCollectionQuery = (
  username: string,
  showExpansions: boolean
) => {
  //#region Board Game
  const {
    isLoading: boardGameCollectionIsLoading,
    error: boardGameCollectionError,
    data: boardGameCollectionData,
  } = useQuery<BriefCollection, Error>({
    enabled: !!username,
    queryKey: ["BggCollectionBoardGame", username],
    queryFn: () => fetchBggCollection(username, false),
  });

  const boardGameThingIds = boardGameCollectionData?.items?.item
    ?.map(transformToThingIds)
    .join(",");

  const {
    isLoading: boardGameThingsIsLoading,
    error: boardGameThingsError,
    data: boardGameThingsData,
  } = useQuery<Thing, Error>({
    enabled: !!boardGameThingIds,
    queryKey: ["BggThings", boardGameThingIds],
    queryFn: () =>
      fetch(`https://bgg.cc/xmlapi2/thing?id=${boardGameThingIds}&stats=1`)
        .then((response) => response.text())
        .then((xml) => parser.parse(xml))
        .catch((err) => {
          throw new Error(JSON.stringify(err));
        }),
  });
  //#endregion Board Game

  //#region Board Game Expansion
  const {
    error: boardGameExpansionCollectionError,
    data: boardGameExpansionCollectionData,
  } = useQuery<BriefCollection, Error>({
    enabled: !!username && showExpansions,
    queryKey: ["BggCollectionBoardGameExpansion", username],
    queryFn: () => fetchBggCollection(username, true),
  });

  const boardGameExpansionThingIds =
    boardGameExpansionCollectionData?.items?.item
      ?.map(transformToThingIds)
      .join(",");

  const {
    error: boardGameExpansionThingsError,
    data: boardGameExpansionThingsData,
  } = useQuery<Thing, Error>({
    enabled: !!boardGameExpansionThingIds,
    queryKey: ["BggThingsBoardGameExpansion", boardGameExpansionThingIds],
    queryFn: () =>
      fetch(
        `https://bgg.cc/xmlapi2/thing?id=${boardGameExpansionThingIds}&stats=1`
      )
        .then((response) => response.text())
        .then((xml) => parser.parse(xml))
        .catch((err) => {
          throw new Error(JSON.stringify(err));
        }),
  });
  //#endregion Board Game Expansion

  const data: SimpleBoardGame[] | undefined = [
    ...(boardGameThingsData?.items.item || []),
    ...(boardGameExpansionThingsData?.items.item || []),
  ].map(transformToBoardGame);

  return {
    loadingStatus: getLoadingStatus({
      username,
      boardGameCollectionIsLoading,
      boardGameThingsIsLoading,
      errorMessage:
        boardGameCollectionError?.message ||
        boardGameThingsError?.message ||
        boardGameExpansionCollectionError?.message ||
        boardGameExpansionThingsError?.message,
      totalitems: data?.length,
    }),
    pubdate: boardGameCollectionData?.items?.pubdate,
    data,
  };
};
