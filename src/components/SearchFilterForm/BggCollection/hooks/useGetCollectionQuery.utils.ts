import { XMLParser } from "fast-xml-parser";
import * as _ from "lodash-es";
import type {
  BriefCollection,
  Thing,
  Name,
  SuggestedNumPlayersResult,
} from "./bggTypes";

//#region transformToThingIdsCollection

const transformToThingIds = (i: BriefCollection["items"]["item"][number]) =>
  i.objectid;

const THING_QUERY_LIMIT = 1200;

const transformToUniqueChunks = (games?: BriefCollection) =>
  _.chunk(
    _.uniq(games?.items.item.map(transformToThingIds)),
    THING_QUERY_LIMIT
  ).map((numbers) => numbers.join(","));

export const transformToThingIdsCollection = (
  boardgames?: BriefCollection,
  expansions?: BriefCollection
) => [
  ...transformToUniqueChunks(boardgames),
  ...transformToUniqueChunks(expansions),
];

//#endregion transformToThingIdsCollection

//#region transformToBoardGame

/**
 *
 * @param str - ex. "Can&#039;t Stop"
 * @returns - ex. "Can't Stop"
 */
const decodeHtmlCharCodes = (str: string) =>
  str.replace(/(&#(\d+);)/g, (match, capture, charCode) =>
    String.fromCharCode(charCode)
  );

const getPrimaryName = (name: Name | Name[]) => {
  const primaryName = Array.isArray(name)
    ? name.filter((n) => n.type === "primary")[0]
    : name;

  return decodeHtmlCharCodes(primaryName.value.toString());
};

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
      [currVal.value]: currVal.numvotes,
    }),
    {
      /** Number of people who voted "Not Recommended" to play this game at this player count. */
      "Not Recommended": 0,

      /** Number of people who voted "Recommended" to play this game at this player count. */
      "Recommended": 0,

      /** Number of people who voted "Best" to play this game at this player count. */
      "Best": 0,
    }
  );

const addOneIfHasPlusSign = (value: string) => (value.endsWith("+") ? 1 : 0);

const normalizeNumPlayers = (
  numplayers: SuggestedNumPlayersResult["numplayers"]
): number =>
  typeof numplayers === "number"
    ? numplayers
    : parseInt(numplayers, 10) + addOneIfHasPlusSign(numplayers);

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
 * { playerCountValue: 5, playerCountLabel: "4+" Best: 42, Rec: 37 }
 * ```
 */
const flattenSuggestedNumPlayersResult = ({
  numplayers,
  result,
}: SuggestedNumPlayersResult) => ({
  /** The Player Count value normalized into a number. If the original value is a  string with "+", then add one. */
  playerCountValue: normalizeNumPlayers(numplayers),

  /** The Player Count value as a string, keeping the "+" as-is. */
  playerCountLabel: numplayers.toString(),

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

  return {
    ...i,

    /** 2xBest % + Recommended % - Not Recommended % */
    sortScore,
  };
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

  /** Number of people who voted "Not Recommended" to play this game at this player count. */
  "Not Recommended": 0 - i["Not Recommended"],
});

const transformToRecommendedPlayerCount = (
  poll: Thing["items"]["item"][number]["poll"]
) => {
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

export const transformToBoardGame = (i: Thing["items"]["item"][number]) => ({
  /** Board Game's primary name */
  name: getPrimaryName(i.name),

  /** BGG' Board Game Thing ID */
  id: i.id,

  /** BGG Thing type */
  type: i.type,

  /** Board Game's thumbnail URL (or BGG's No Image Available) */
  thumbnail:
    i.thumbnail ||
    "https://cf.geekdo-images.com/zxVVmggfpHJpmnJY9j-k1w__itemrep/img/Py7CTY0tSBSwKQ0sgVjRFfsVUZU=/fit-in/246x300/filters:strip_icc()/pic1657689.jpg",

  /** Board Game's minimum number of players */
  minPlayers: i.minplayers.value,

  /** Board Game's maximum number of players */
  maxPlayers: i.maxplayers.value,

  /** Board Game's minimum playtime. */
  minPlaytime: i.minplaytime.value,

  /** Board Game's maximum playtime. */
  maxPlaytime: i.maxplaytime.value,

  /** Board Game's average playtime */
  playingTime: i.playingtime.value,

  /** Board Game's average weight */
  averageWeight: i.statistics.ratings.averageweight.value,

  /** Board Game's recommended player count according to BGG poll */
  recommendedPlayerCount: transformToRecommendedPlayerCount(i.poll),
});

/** Board Game that only has simple props calculated from BGG. */
export type SimpleBoardGame = ReturnType<typeof transformToBoardGame>;

//#endregion transformToBoardGame

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  textNodeName: "text",
  removeNSPrefix: true,
  allowBooleanAttributes: true,
  parseAttributeValue: true,
});

export const fetchBggCollection = (username: string, showExpansions: boolean) =>
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

export const fetchBggThings = (thingIds?: string): Promise<Thing> | undefined =>
  thingIds
    ? fetch(`https://bgg.cc/xmlapi2/thing?id=${thingIds}&stats=1`)
        .then((response) => response.text())
        .then((xml) => parser.parse(xml))
        .catch((err) => {
          throw new Error(JSON.stringify(err));
        })
    : undefined;
