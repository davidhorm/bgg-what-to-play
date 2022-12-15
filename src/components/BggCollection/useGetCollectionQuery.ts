import { useQuery } from "@tanstack/react-query";
import { getBggCollection, getBggThing } from "bgg-xml-api-client";

type CollectionItem = {
  objecttype: "thing";
  objectid: string;
  subtype: "boardgame";
  collid: string;
  name: {
    text: string;
    sortindex: string;
  };
  status: {
    own: "0" | "1";
    prevowned: "0" | "1";
    fortrade: "0" | "1";
    want: "0" | "1";
    wanttoplay: "0" | "1";
    wanttobuy: "0" | "1";
    wishlist: "0" | "1";
    preordered: "0" | "1";
    lastmodified: string;
  };
};

type Name = { type: "primary" | "alternate"; sortindex: "1"; value: string };

type Link = { type: string; id: string; value: string };

type SuggestedNumPlayersResult = {
  numplayers: string;
  result: [
    { value: "Best"; numvotes: string },
    { value: "Recommended"; numvotes: string },
    { value: "Not Recommended"; numvotes: string }
  ];
};

type SuggestedNumPlayersPoll = {
  name: "suggested_numplayers";
  title: string;
  totalvotes: string;
  results: SuggestedNumPlayersResult[];
};

type SuggestedPlayerAgeResult = {
  value: string;
  numvotes: string;
};

type SuggestedPlayerAgePoll = {
  name: "suggested_playerage";
  title: string;
  totalvotes: string;
  results: {
    result: SuggestedPlayerAgeResult[];
  };
};

type LanguageDependenceResult = {
  level: string;
  value: string;
  numvotes: string;
};

type LanguageDependencePoll = {
  name: "language_dependence";
  title: string;
  totalvotes: string;
  results: {
    result: LanguageDependenceResult[];
  };
};

type Poll =
  | SuggestedNumPlayersPoll
  | SuggestedPlayerAgePoll
  | LanguageDependencePoll;

type ThingItem = {
  type: "boardgame";
  id: string;
  thumbnail: string;
  image: string;
  name: Name | Name[];
  description: string;
  yearpublished: { value: string };
  minplayers: { value: string };
  maxplayers: { value: string };
  poll: Poll[];
  playingtime: { value: string };
  minplaytime: { value: string };
  maxplaytime: { value: string };
  minage: { value: string };
  link: Link[];
};

const getPrimaryName = (name: Name | Name[]) => {
  const primaryName = Array.isArray(name)
    ? name.filter((n) => n.type === "primary")[0]
    : name;
  return primaryName.value;
};

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

  const thingIds = collectionData?.data.item.map((i: CollectionItem) =>
    parseInt(i.objectid, 10)
  );

  const {
    isLoading: thingsIsLoading,
    error: thingsError,
    data: thingsData,
  } = useQuery({
    enabled: !!thingIds,
    queryKey: ["BggThings", thingIds],
    queryFn: () => getBggThing({ id: thingIds }),
  });

  const data = (thingsData?.data.item as ThingItem[])?.map((i) => ({
    name: getPrimaryName(i.name),
    id: i.id,
    thumbnail: i.thumbnail,
    minplayers: i.minplayers.value,
    maxplayers: i.maxplayers.value,
    playingtime: i.playingtime.value,
    suggested_numplayers: i.poll.filter(
      (p) => p.name === "suggested_numplayers"
    )[0],
  }));

  return {
    isLoading: collectionIsLoading || thingsIsLoading,
    error: collectionError || thingsError,
    data,
  };
};

export type BoardGame = ReturnType<typeof useGetCollectionQuery>["data"][0];
