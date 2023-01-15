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

export const useGetCollectionQuery = (username: string) => {
  const {
    isLoading: collectionIsLoading,
    error: collectionError,
    data: collectionData,
  } = useQuery<BriefCollection, Error>({
    enabled: !!username,
    queryKey: ["BggCollection", username],
    queryFn: () =>
      fetch(
        `https://bgg.cc/xmlapi2/collection?username=${username}&brief=1&own=1&excludesubtype=boardgameexpansion` // TODO: include expansions later (p3)
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
        }),
  });

  // TODO: handle long list of things (p1)
  const thingIds = collectionData?.items?.item
    ?.map(transformToThingIds)
    .join(",");

  const {
    isLoading: thingsIsLoading,
    error: thingsError,
    data: thingsData,
  } = useQuery<Thing, Error>({
    enabled: !!thingIds,
    queryKey: ["BggThings", thingIds],
    queryFn: () =>
      fetch(`https://bgg.cc/xmlapi2/thing?id=${thingIds}&stats=1`)
        .then((response) => response.text())
        .then((xml) => parser.parse(xml))
        .catch((err) => {
          throw new Error(JSON.stringify(err));
        }),
  });

  const data: SimpleBoardGame[] | undefined =
    thingsData?.items.item.map(transformToBoardGame);

  return {
    loadingStatus: getLoadingStatus({
      username,
      collectionIsLoading,
      thingsIsLoading,
      errorMessage: collectionError?.message || thingsError?.message,
      totalitems: collectionData?.items?.totalitems,
    }),
    pubdate: collectionData?.items?.pubdate,
    data,
  };
};
