import { useQuery } from "@tanstack/react-query";
import { XMLParser } from "fast-xml-parser";
import type { BriefCollection, Thing } from "./bggTypes";
import {
  BoardGame,
  getLoadingStatus,
  transformToBoardGame,
  transformToThingIds,
} from "./useGetCollectionQuery.utils";

// TODO: handle querying array of usernames (p3)

export const useGetCollectionQuery = (username: string) => {
  // TODO: handle response code 202 for queued request. (p1)
  // see https://boardgamegeek.com/wiki/page/BGG_XML_API2#toc11

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
    textNodeName: "text",
    removeNSPrefix: true,
    allowBooleanAttributes: true,
    parseAttributeValue: true,
  });

  const {
    isLoading: collectionIsLoading,
    error: collectionError,
    data: collectionData,
  } = useQuery<BriefCollection, Error>({
    enabled: !!username,
    queryKey: ["BggCollection", username],
    queryFn: () =>
      fetch(
        `https://boardgamegeek.com/xmlapi2/collection?username=${username}&brief=1&own=1&excludesubtype=boardgameexpansion` // TODO: include expansions later (p3)
      )
        .then((response) => response.text())
        .then((xml) => parser.parse(xml))
        .catch(() => {
          throw new Error(`Unable to query collection for ${username}`);
        }),
    retry: false,
  });

  // TODO: handle long list of things (p1)
  const thingIds = collectionData?.items?.item
    .map(transformToThingIds)
    .join(",");

  const {
    isLoading: thingsIsLoading,
    error: thingsError,
    data: thingsData,
  } = useQuery<Thing, Error>({
    enabled: !!thingIds,
    queryKey: ["BggThings", thingIds],
    queryFn: () =>
      fetch(`https://boardgamegeek.com/xmlapi2/thing?id=${thingIds}&stats=1`)
        .then((response) => response.text())
        .then((xml) => parser.parse(xml))
        .catch((err) => {
          throw new Error(JSON.stringify(err));
        }),
  });

  const data: BoardGame[] | undefined =
    thingsData?.items.item.map(transformToBoardGame);

  return {
    loadingStatus: getLoadingStatus({
      username,
      collectionIsLoading,
      thingsIsLoading,
      errorMessage: collectionError?.message || thingsError?.message,
    }),
    data,
  };
};