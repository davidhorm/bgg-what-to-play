import { useQuery } from "@tanstack/react-query";
import { getBggCollection } from "bgg-xml-api-client";

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

  return {
    isLoading: collectionIsLoading,
    error: collectionError,
    data: collectionData,
  };
};
