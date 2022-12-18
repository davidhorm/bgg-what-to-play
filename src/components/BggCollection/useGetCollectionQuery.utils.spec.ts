import { describe, test, expect } from "vitest";
import { ThingItem } from "./bggTypes";
import {
  transformToBoardGame, // hasSuggestedPlayersVotes,
} from "./useGetCollectionQuery.utils";

const MOCK_THING_ITEM: ThingItem = {
  type: "boardgame",
  id: "314088",
  thumbnail: "thumbnail.png",
  image: "box-art.png",
  name: [
    { type: "primary", sortindex: "1", value: "Agropolis" },
    { type: "alternate", sortindex: "1", value: "Agrópolis" },
    { type: "alternate", sortindex: "1", value: "Ranczer" },
  ],
  description: "lorem ipsum",
  yearpublished: { value: "2021" },
  minplayers: { value: "1" },
  maxplayers: { value: "4" },
  poll: [], // MOCK_SUGGESTED_PLAYERS
  playingtime: { value: "20" },
  minplaytime: { value: "15" },
  maxplaytime: { value: "20" },
  minage: { value: "8" },
  link: [],
};

// describe(hasSuggestedPlayersVotes.name, () => {
//   const MOCK_ZERO_VOTES: ThingItem["poll"][0] = {
//     name: "suggested_numplayers",
//     title: "User Suggested Number of Players",
//     totalvotes: "0",
//     results: {
//       numplayers: "0+",
//       result: [
//         {
//           value: "Best",
//           numvotes: "0",
//         },
//         {
//           value: "Recommended",
//           numvotes: "0",
//         },
//         {
//           value: "Not Recommended",
//           numvotes: "0",
//         },
//       ],
//     },
//   };

//   test("WHEN ThingItem has empty poll array, THEN return `false`", () => {
//     expect(hasSuggestedPlayersVotes(MOCK_THING_ITEM)).toBeFalsy();
//   });

//   test("WHEN totalvotes = 0, THEN return `false`", () => {
//     const thingWithZeroVotes = {
//       ...MOCK_THING_ITEM,
//       poll: [MOCK_ZERO_VOTES],
//     };

//     expect(hasSuggestedPlayersVotes(thingWithZeroVotes)).toBeFalsy();
//   });

//   test("WHEN totalvotes = 1, THEN return `true`", () => {
//     const thingWithOneVote = {
//       ...MOCK_THING_ITEM,
//       poll: [{ ...MOCK_ZERO_VOTES, totalvotes: "1" }],
//     };

//     expect(hasSuggestedPlayersVotes(thingWithOneVote)).toBeTruthy();
//   });
// });

describe(transformToBoardGame.name, () => {
  const EXPECTED_BOARD_GAME = {
    id: "314088",
    thumbnail: "thumbnail.png",
    maxPlayers: 4,
    minPlayers: 1,
    name: "Agropolis",
    playingTime: 20,
    recommendedPlayerCount: [],
  };

  test("WHEN standard mock ThingItem, THEN transform to expected BoardGame schema", () => {
    expect(transformToBoardGame(MOCK_THING_ITEM)).toEqual(EXPECTED_BOARD_GAME);
  });

  test("WHEN ThingItem has `suggested_numplayers`, THEN transform to `recommendedPlayerCount`", () => {
    const suggestedPlayers: ThingItem["poll"][0] = {
      name: "suggested_numplayers",
      title: "User Suggested Number of Players",
      totalvotes: "32",
      results: [
        {
          numplayers: "1",
          result: [
            { value: "Best", numvotes: "27" },
            { value: "Recommended", numvotes: "5" },
            { value: "Not Recommended", numvotes: "0" },
          ],
        },
        {
          numplayers: "2",
          result: [
            { value: "Best", numvotes: "5" },
            { value: "Recommended", numvotes: "12" },
            { value: "Not Recommended", numvotes: "4" },
          ],
        },
        {
          numplayers: "3",
          result: [
            { value: "Best", numvotes: "0" },
            { value: "Recommended", numvotes: "5" },
            { value: "Not Recommended", numvotes: "12" },
          ],
        },
        {
          numplayers: "4",
          result: [
            { value: "Best", numvotes: "0" },
            { value: "Recommended", numvotes: "2" },
            { value: "Not Recommended", numvotes: "15" },
          ],
        },
        {
          numplayers: "4+",
          result: [
            { value: "Best", numvotes: "0" },
            { value: "Recommended", numvotes: "0" },
            { value: "Not Recommended", numvotes: "18" },
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
          "Not Recommended": 0,
          "Recommended": 5,
          "numplayers": "1",
        },
        {
          "Best": 5,
          "Not Recommended": -4,
          "Recommended": 12,
          "numplayers": "2",
        },
        {
          "Best": 0,
          "Not Recommended": -12,
          "Recommended": 5,
          "numplayers": "3",
        },
        {
          "Best": 0,
          "Not Recommended": -15,
          "Recommended": 2,
          "numplayers": "4",
        },
        {
          "Best": 0,
          "Not Recommended": -18,
          "Recommended": 0,
          "numplayers": "4+",
        },
      ],
    };

    expect(transformToBoardGame(thingWithSuggestedPlayers)).toEqual(expected);
  });

  test("WHEN ThingItem has single `name`, THEN still get primary name", () => {
    const thingWithSingleName: ThingItem = {
      ...MOCK_THING_ITEM,
      name: { type: "primary", sortindex: "1", value: "Agropolis" },
    };
    expect(transformToBoardGame(thingWithSingleName)).toEqual(
      EXPECTED_BOARD_GAME
    );
  });
});
