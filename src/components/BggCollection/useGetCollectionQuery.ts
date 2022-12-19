import { useQuery } from "@tanstack/react-query";
// TODO: replace since client can't handle errors
import { getBggCollection, getBggThing } from "bgg-xml-api-client";
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
    queryFn: () => getBggThing({ id: thingIds, stats: 1 }),
  });

  const data: BoardGame[] = thingsData?.data.item.map(transformToBoardGame);

  return {
    loadingStatus: getLoadingStatus({
      username,
      collectionIsLoading,
      collectionData: collectionData?.data,
      thingsIsLoading,
    }),
    error: collectionError || thingsError,
    data,
  };
};
