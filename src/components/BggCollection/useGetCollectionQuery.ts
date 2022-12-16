import { useQuery } from "@tanstack/react-query";
import { getBggCollection, getBggThing } from "bgg-xml-api-client";
import {
  BoardGame,
  transformToBoardGame,
  transformToThingIds,
} from "./useGetCollectionQuery.utils";

// TODO: handle querying array of usernames (p3)

export const useGetCollectionQuery = (username: string) => {
  // TODO: handle response code 202 for queued request. (p1)
  // see https://boardgamegeek.com/wiki/page/BGG_XML_API2#toc11

  const {
    isLoading: collectionIsLoading,
    error: collectionError,
    data: collectionData,
  } = useQuery({
    enabled: !!username,
    queryKey: ["BggCollection", username],
    queryFn: () =>
      getBggCollection({
        username,
        brief: 1,
        own: 1,
        excludesubtype: "boardgameexpansion", // TODO: include expansions later (p3)
      }),
  });

  const thingIds = collectionData?.data.item.map(transformToThingIds);

  const {
    isLoading: thingsIsLoading,
    error: thingsError,
    data: thingsData,
  } = useQuery({
    enabled: !!thingIds,
    queryKey: ["BggThings", thingIds],
    queryFn: () => getBggThing({ id: thingIds }), // TODO: query game weight with stat: 1 (p1)
  });

  const data: BoardGame[] = thingsData?.data.item.map(transformToBoardGame);

  return {
    isLoading: collectionIsLoading || thingsIsLoading, // TODO: reimplement isLoading with status bar (p1)
    error: collectionError || thingsError,
    data,
  };
};
