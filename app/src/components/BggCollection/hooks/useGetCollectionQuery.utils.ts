import { XMLValidator, XMLParser } from "fast-xml-parser";
import * as _ from "lodash-es";
import type {
  Collection,
  Thing,
  Name,
  SuggestedNumPlayersResult,
} from "./bggTypes";

//#region transformToThingIdsCollection

const transformToThingIds = (i: Collection["items"]["item"][number]) =>
  i.objectid;

const THING_QUERY_LIMIT = 20; // TODO unit test. also render error in future

const transformToUniqueChunks = (games?: Collection) =>
  _.chunk(
    _.uniq(games?.items.item.map(transformToThingIds)),
    THING_QUERY_LIMIT,
  ).map((numbers) => numbers.join(","));

export const transformToThingIdsCollection = (
  boardgames?: Collection,
  expansions?: Collection,
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
    String.fromCharCode(charCode),
  );

const getPrimaryName = (name: Name | Name[]) =>
  Array.isArray(name)
    ? name.filter((n) => n.type === "primary")[0].value.toString()
    : name.value.toString();

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
  result: SuggestedNumPlayersResult["result"],
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
    },
  );

const addOneIfHasPlusSign = (value: string) => (value.endsWith("+") ? 1 : 0);

const normalizeNumPlayers = (
  numplayers: SuggestedNumPlayersResult["numplayers"],
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

const calcPercentAndAddSortScore = (
  playerRec: ReturnType<typeof flattenSuggestedNumPlayersResult>,
) => {
  const { Best, Recommended, ["Not Recommended"]: notRec } = playerRec;
  const totalVotes = Best + Recommended + notRec;

  const BestPercent = Math.round((Best * 100) / totalVotes);
  const RecommendedPercent = Math.round((Recommended * 100) / totalVotes);
  const NotRecommendedPercent = Math.round((notRec * 100) / totalVotes);

  return {
    ...playerRec,

    /** Percentage of users voting this player count as the best. */
    BestPercent,

    /** Percentage of users recommending this player count. */
    RecommendedPercent,

    /** Percentage of users not recommending this player count. */
    NotRecommendedPercent,
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
const makeNotRecommendedNegative = (
  i: ReturnType<typeof calcPercentAndAddSortScore>,
) => ({
  ...i,

  /** Number of people who voted "Not Recommended" to play this game at this player count. */
  "Not Recommended": 0 - i["Not Recommended"],
});

const transformToRecommendedPlayerCount = (
  poll: Thing["items"]["item"][number]["poll"],
) => {
  const recommendations =
    ((poll || []).filter((p) => p.name === "suggested_numplayers")?.[0]
      ?.results as SuggestedNumPlayersResult[]) || [];

  return Array.isArray(recommendations)
    ? recommendations
        .map(flattenSuggestedNumPlayersResult)
        .map(calcPercentAndAddSortScore)
        .map(makeNotRecommendedNegative)
    : [];
};

export const transformToUserRating = (
  collectionData?: Collection["items"]["item"][number],
) => {
  const rating = collectionData?.stats.rating.value;
  return typeof rating === "number" ? +rating.toFixed(1) : rating;
};

export const transformToBoardGame = (
  thingData: Thing["items"]["item"][number],
  collectionData?: Collection["items"]["item"][number],
) => ({
  owners: [] as string[],

  /** Board Game's primary name */
  name: decodeHtmlCharCodes(
    collectionData?.name.text.toString() ||
      collectionData?.originalname ||
      getPrimaryName(thingData.name),
  ),

  /** BGG' Board Game Thing ID */
  id: thingData.id,

  /** BGG Thing type */
  type: thingData.type,

  /** Board Game's thumbnail URL (or BGG's No Image Available) */
  thumbnail:
    collectionData?.thumbnail ||
    thingData.thumbnail ||
    "https://cf.geekdo-images.com/zxVVmggfpHJpmnJY9j-k1w__itemrep/img/Py7CTY0tSBSwKQ0sgVjRFfsVUZU=/fit-in/246x300/filters:strip_icc()/pic1657689.jpg",

  /** Board Game's minimum number of players */
  minPlayers: thingData.minplayers.value,

  /** Board Game's maximum number of players */
  maxPlayers: thingData.maxplayers.value,

  /** Board Game's minimum playtime. */
  minPlaytime:
    thingData.minplaytime.value || collectionData?.stats.minplaytime || 0,

  /** Board Game's maximum playtime. */
  maxPlaytime:
    thingData.maxplaytime.value ||
    collectionData?.stats.maxplaytime ||
    thingData.minplaytime.value ||
    collectionData?.stats.minplaytime ||
    0,

  /** Board Game's average weight */
  averageWeight: +thingData.statistics.ratings.averageweight.value.toFixed(1),

  /** User's rating */
  userRating: transformToUserRating(collectionData),

  /** Average rating from all users */
  averageRating:
    typeof collectionData?.stats.rating.average?.value === "number"
      ? +collectionData.stats.rating.average.value.toFixed(1)
      : undefined,

  /** Board Game's recommended player count according to BGG poll */
  recommendedPlayerCount: transformToRecommendedPlayerCount(thingData.poll),
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
  numberParseOptions: { hex: false, leadingZeros: false },
  isArray: (_tagName, jpath) =>
    [
      "items.item",
      "items.item.stats.rating.ranks.rank",
      "items.item.poll",
      "items.item.poll.results",
      "items.item.poll.results.result",
    ].includes(jpath),
});

const hasRequiredCollectionFields = (
  item: Collection["items"]["item"][number],
) =>
  Number.isInteger(item.objectid) &&
  !!item.name &&
  item.name.text != null &&
  !!item.stats?.rating;

const hasRequiredThingFields = (item: Thing["items"]["item"][number]) =>
  Number.isInteger(item.id) &&
  !!item.name &&
  !!item.minplayers &&
  !!item.maxplayers &&
  !!item.minplaytime &&
  !!item.maxplaytime &&
  !!item.statistics?.ratings?.averageweight;

export const fetchBggCollection = async (
  username: string,
  showExpansions: boolean,
  signal?: AbortSignal,
): Promise<Collection> => {
  const params = new URLSearchParams({ username, stats: "1", own: "1" });
  params.set(
    showExpansions ? "subtype" : "excludesubtype",
    "boardgameexpansion",
  );
  const response = await fetch(`/api/xmlapi2/collection?${params}`, { signal });
  if (response.status === 202) throw new Error("202 Accepted");
  if (!response.ok)
    throw new Error(`Unable to query collection (${response.status})`);
  const xml = await response.text();
  if (XMLValidator.validate(xml) !== true)
    throw new Error("Invalid collection XML");
  const json = parser.parse(xml);
  if (!json?.items || json.errors || json.error)
    throw new Error("Invalid collection response");
  const items = json.items.item || [];
  if (
    !Array.isArray(items) ||
    items.some((item) => !hasRequiredCollectionFields(item))
  ) {
    throw new Error("Invalid collection items");
  }
  if (!items.length && Number(json.items.totalitems) !== 0)
    throw new Error("Invalid empty collection response");
  return { ...json, items: { ...json.items, item: items } };
};

export const fetchBggThings = async (
  thingIds: string,
  signal?: AbortSignal,
): Promise<Thing> => {
  const response = await fetch(
    `/api/xmlapi2/thing?${new URLSearchParams({ id: thingIds, stats: "1", v: "1" })}`,
    { signal },
  );
  if (!response.ok)
    throw new Error(`Unable to query games (${response.status})`);
  const xml = await response.text();
  if (XMLValidator.validate(xml) !== true) throw new Error("Invalid games XML");
  const json = parser.parse(xml);
  if (
    !Array.isArray(json?.items?.item) ||
    !json.items.item.length ||
    json.items.item.some(
      (item: Thing["items"]["item"][number]) => !hasRequiredThingFields(item),
    )
  )
    throw new Error("Invalid games response");
  return json;
};