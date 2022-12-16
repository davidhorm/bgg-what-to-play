import { useQuery } from "@tanstack/react-query";
import { getBggCollection, getBggThing } from "bgg-xml-api-client";
import {
  BoardGame,
  transformToBoardGame,
  transformToThingIds,
} from "./useGetCollectionQuery.utils";

export const useGetCollectionQuery = (username: string) => {
  // TODO: handle response code 202 for queued request.
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
        excludesubtype: "boardgameexpansion", // MAYBE TODO: include expansions later
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
    queryFn: () => getBggThing({ id: thingIds }),
  });

  const data: BoardGame[] = thingsData?.data.item.map(transformToBoardGame);

  return {
    isLoading: collectionIsLoading || thingsIsLoading,
    error: collectionError || thingsError,
    data,
  };
};
