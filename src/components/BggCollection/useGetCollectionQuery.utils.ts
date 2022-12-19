import type { BggCollectionResponse } from "bgg-xml-api-client";
import type {
  CollectionItem,
  ThingItem,
  Name,
  SuggestedNumPlayersResult,
} from "./bggTypes";

export const transformToThingIds = (i: CollectionItem) =>
  parseInt(i.objectid, 10);

const getPrimaryName = (name: Name | Name[]) => {
  const primaryName = Array.isArray(name)
    ? name.filter((n) => n.type === "primary")[0]
    : name;
  return primaryName.value;
};

// Maybe don't need to filter if `transformToRecommendedPlayerCount` checks if it's an array?
// export const hasSuggestedPlayersVotes = (thing: ThingItem) => {
//   const suggestedPlayers = thing.poll.filter(
//     (p) => p.name === "suggested_numplayers"
//   );

//   if (suggestedPlayers.length > 0) {
//     const totalVotes = parseInt(suggestedPlayers[0].totalvotes, 10);
//     return totalVotes > 0;
//   }

//   return false;
// };

/**
 * Transforms the following array
 * ```
 * [{ value: "Best", numvotes: "42" }, { value: "Rec", numvotes: "37" }]
 * ```
 *
 * to the following object
 * ```
 * { Best: 42, Rec: 37 }
 * ```
 */
const reduceValueAndNumVotesToObjectProperties = (
  result: SuggestedNumPlayersResult["result"]
) =>
  result.reduce(
    (prevVal, currVal) => ({
      ...prevVal,
      [currVal.value]: parseInt(currVal.numvotes, 10),
    }),
    { "Not Recommended": 0, "Recommended": 0, "Best": 0 }
  );

/**
 * Transforms the following object
 * ```
 * {
 *   numplayers: "4+",
 *   result: [{ value: "Best", numvotes: "42" }, { value: "Rec", numvotes: "37" }]
 * }
 * ```
 *
 * to the following object
 * ```
 * { numplayers: "4+", Best: 42, Rec: 37 }
 * ```
 */
const flattenSuggestedNumPlayersResult = ({
  numplayers,
  result,
}: SuggestedNumPlayersResult) => ({
  numplayers,
  ...reduceValueAndNumVotesToObjectProperties(result),
});

const addSortScore = (
  i: ReturnType<typeof flattenSuggestedNumPlayersResult>
) => {
  const totalVotes = i["Best"] + i["Recommended"] + i["Not Recommended"];
  const bestPercent = i["Best"] / totalVotes;
  const recPercent = i["Recommended"] / totalVotes;
  const notRecPercent = i["Not Recommended"] / totalVotes;
  const sortScore = bestPercent * 2 + recPercent - notRecPercent;

  return { ...i, sortScore };
};

/**
 * Makes the "Not Recommended" value negative.
 *
 * Transform the following object
 * ```
 * { "Best": 42, "Not Recommended": 37 }
 * ```
 *
 * to the following object
 * ```
 * { "Best": 42, "Not Recommended": -37 }
 * ```
 */
const makeNotRecommendedNegative = (i: ReturnType<typeof addSortScore>) => ({
  ...i,
  "Not Recommended": 0 - i["Not Recommended"],
});

const transformToRecommendedPlayerCount = (poll: ThingItem["poll"]) => {
  const recommendations =
    (poll.filter((p) => p.name === "suggested_numplayers")?.[0]
      ?.results as SuggestedNumPlayersResult[]) || [];

  return Array.isArray(recommendations)
    ? recommendations
        .map(flattenSuggestedNumPlayersResult)
        .map(addSortScore)
        .map(makeNotRecommendedNegative)
    : [];
};

export const transformToBoardGame = (i: ThingItem) => ({
  name: getPrimaryName(i.name),
  id: i.id,
  thumbnail: i.thumbnail,
  minPlayers: parseInt(i.minplayers.value, 10),
  maxPlayers: parseInt(i.maxplayers.value, 10),
  playingTime: parseInt(i.playingtime.value, 10),
  averageWeight: parseFloat(i.statistics.ratings.averageweight.value),
  recommendedPlayerCount: transformToRecommendedPlayerCount(i.poll),
});

export type BoardGame = ReturnType<typeof transformToBoardGame>;

type FetchingStatus =
  | "FETCHING_COLLECTION"
  | "FETCHING_THINGS"
  | "FETCHING_ERROR"
  | "FETCHING_COMPLETE";

type Progress = {
  status: FetchingStatus;
  progress: number;
  message?: string;
};

type MaybeErrors = {
  errors?: {
    error: {
      message: string;
    };
  };
};

type GetLoadingStatusProps = {
  username: string;
  collectionIsLoading: boolean;
  collectionData?: BggCollectionResponse & MaybeErrors;
  thingsIsLoading: boolean;
};

// TODO: add some unit tests (p3)
export const getLoadingStatus = ({
  username,
  collectionIsLoading,
  collectionData,
  thingsIsLoading,
}: GetLoadingStatusProps): Progress => {
  if (collectionIsLoading) {
    return {
      status: "FETCHING_COLLECTION",
      progress: 1,
      message: `Fetching collection for ${username}...`,
    };
  }

  if (collectionData?.errors?.error) {
    return {
      status: "FETCHING_ERROR",
      progress: 100,
      message: `${collectionData.errors.error.message} - ${username}`,
    };
  }

  if (thingsIsLoading) {
    // TODO: calc progress based on number of things in collection (p1)
    return {
      status: "FETCHING_THINGS",
      progress: 50,
      message: `Fetching boardgame details for ${username}...`,
    };
  }

  return { status: "FETCHING_COMPLETE", progress: 100 };
};
