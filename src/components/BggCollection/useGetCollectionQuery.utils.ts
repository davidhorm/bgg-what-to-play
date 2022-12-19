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

// TODO: format min/max player number to combine if same (p2)

export const transformToBoardGame = (i: ThingItem) => ({
  name: getPrimaryName(i.name),
  id: i.id,
  thumbnail: i.thumbnail,
  minPlayers: parseInt(i.minplayers.value, 10),
  maxPlayers: parseInt(i.maxplayers.value, 10),
  playingTime: parseInt(i.playingtime.value, 10),
  recommendedPlayerCount: transformToRecommendedPlayerCount(i.poll),
});

export type BoardGame = ReturnType<typeof transformToBoardGame>;
