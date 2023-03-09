import { server, rest } from "@/mocks";
import { describe, test, expect } from "vitest";
import { Thing } from "./bggTypes";
import {
  transformToBoardGame,
  fetchBggCollection,
} from "./useGetCollectionQuery.utils";

const MOCK_THING_ITEM: Partial<Thing["items"]["item"][number]> = {
  type: "boardgame",
  id: 314088,
  thumbnail: "thumbnail.png",
  image: "box-art.png",
  name: [
    { type: "primary", sortindex: 1, value: "Agropolis" },
    { type: "alternate", sortindex: 1, value: "Agrópolis" },
    { type: "alternate", sortindex: 1, value: "Ranczer" },
  ],
  description: "lorem ipsum",
  yearpublished: { value: 2021 },
  minplayers: { value: 1 },
  maxplayers: { value: 4 },
  poll: [], // MOCK_SUGGESTED_PLAYERS
  playingtime: { value: 20 },
  minplaytime: { value: 15 },
  maxplaytime: { value: 20 },
  minage: { value: 8 },
  link: [],
  statistics: {
    ratings: { averageweight: { value: 2.5 }, ranks: { rank: [] } },
  } as any,
};

describe(transformToBoardGame.name, () => {
  const EXPECTED_BOARD_GAME = {
    id: 314088,
    type: "boardgame",
    thumbnail: "thumbnail.png",
    maxPlayers: 4,
    maxPlaytime: 20,
    minPlayers: 1,
    minPlaytime: 15,
    name: "Agropolis",
    averageWeight: 2.5,
    recommendedPlayerCount: [],
    averageRating: undefined,
    userRating: undefined,
  };

  test("WHEN standard mock ThingItem, THEN transform to expected BoardGame schema", () => {
    expect(transformToBoardGame(MOCK_THING_ITEM as any)).toEqual(
      EXPECTED_BOARD_GAME
    );
  });

  test("WHEN ThingItem has `suggested_numplayers`, THEN transform to `recommendedPlayerCount`", () => {
    const suggestedPlayers: Thing["items"]["item"][number]["poll"][number] = {
      name: "suggested_numplayers",
      title: "User Suggested Number of Players",
      totalvotes: 32,
      results: [
        {
          numplayers: 1,
          result: [
            { value: "Best", numvotes: 27 },
            { value: "Recommended", numvotes: 5 },
            { value: "Not Recommended", numvotes: 0 },
          ],
        },
        {
          numplayers: 2,
          result: [
            { value: "Best", numvotes: 5 },
            { value: "Recommended", numvotes: 12 },
            { value: "Not Recommended", numvotes: 4 },
          ],
        },
        {
          numplayers: 3,
          result: [
            { value: "Best", numvotes: 0 },
            { value: "Recommended", numvotes: 5 },
            { value: "Not Recommended", numvotes: 12 },
          ],
        },
        {
          numplayers: 4,
          result: [
            { value: "Best", numvotes: 0 },
            { value: "Recommended", numvotes: 2 },
            { value: "Not Recommended", numvotes: 15 },
          ],
        },
        {
          numplayers: "4+",
          result: [
            { value: "Best", numvotes: 0 },
            { value: "Recommended", numvotes: 0 },
            { value: "Not Recommended", numvotes: 18 },
          ],
        },
      ],
    };

    const thingWithSuggestedPlayers = {
      ...MOCK_THING_ITEM,
      poll: [suggestedPlayers],
    };

    const expected = {
      ...EXPECTED_BOARD_GAME,
      recommendedPlayerCount: [
        {
          "Best": 27,
          "BestPercent": 84,
          "Not Recommended": 0,
          "NotRecommendedPercent": 0,
          "Recommended": 5,
          "RecommendedPercent": 16,
          "playerCountValue": 1,
          "playerCountLabel": "1",
          "sortScore": 102,
        },
        {
          "Best": 5,
          "BestPercent": 24,
          "Not Recommended": -4,
          "NotRecommendedPercent": 19,
          "Recommended": 12,
          "RecommendedPercent": 57,
          "playerCountValue": 2,
          "playerCountLabel": "2",
          "sortScore": 57,
        },
        {
          "Best": 0,
          "BestPercent": 0,
          "Not Recommended": -12,
          "NotRecommendedPercent": 71,
          "Recommended": 5,
          "RecommendedPercent": 29,
          "playerCountValue": 3,
          "playerCountLabel": "3",
          "sortScore": -34,
        },
        {
          "Best": 0,
          "BestPercent": 0,
          "Not Recommended": -15,
          "NotRecommendedPercent": 88,
          "Recommended": 2,
          "RecommendedPercent": 12,
          "playerCountValue": 4,
          "playerCountLabel": "4",
          "sortScore": -61,
        },
        {
          "Best": 0,
          "BestPercent": 0,
          "Not Recommended": -18,
          "NotRecommendedPercent": 100,
          "Recommended": 0,
          "RecommendedPercent": 0,
          "playerCountValue": 5,
          "playerCountLabel": "4+",
          "sortScore": -80,
        },
      ],
    };

    expect(transformToBoardGame(thingWithSuggestedPlayers as any)).toEqual(
      expected
    );
  });

  test("WHEN ThingItem has single `name`, THEN still get primary name", () => {
    const thingWithSingleName: Partial<Thing["items"]["item"][number]> = {
      ...MOCK_THING_ITEM,
      name: { type: "primary", sortindex: 1, value: "Agropolis" },
    };
    expect(transformToBoardGame(thingWithSingleName as any)).toEqual(
      EXPECTED_BOARD_GAME
    );
  });

  test(`WHEN ThingItem.name = "Can&#039;t Stop", THEN parse as "Can't Stop"`, () => {
    const thingWithSingleName: Partial<Thing["items"]["item"][number]> = {
      ...MOCK_THING_ITEM,
      name: { type: "primary", sortindex: 1, value: "Can&#039;t Stop" },
    };
    expect(transformToBoardGame(thingWithSingleName as any)).toEqual({
      ...EXPECTED_BOARD_GAME,
      name: "Can't Stop",
    });
  });
});

describe(fetchBggCollection.name, () => {
  test("WHEN <name>011</name>, THEN returns { name: { text: '011' } }", async () => {
    server.use(
      rest.get("https://bgg.cc/xmlapi2/collection", (req, res, ctx) => {
        const gameWithNumberAsName = `
<items>
  <item objecttype="thing" objectid="93194" subtype="boardgame" collid="60952918">
    <name sortindex="1">011</name>
  </item>
</items>`;

        return res.once(ctx.status(200), ctx.xml(gameWithNumberAsName));
      })
    );

    const response = await fetchBggCollection("mock_username", false);
    expect(response.items.item[0].name.text).toBe("011");
  });
});
