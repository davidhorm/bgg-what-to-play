import type { CollectionFilterState, BoardGame } from "@/types";
import { describe, test, expect } from "vitest";
import { applyFiltersAndSorts } from "./BggCollection.utils";

describe(applyFiltersAndSorts.name, () => {
  const MOCK_GAME: Partial<BoardGame> = {
    name: "Ticket to Ride",
    type: "boardgame",
    id: 9209,
    thumbnail: "thumbnail.png",
    minPlayers: 2,
    maxPlayers: 2,
    minPlaytime: 30,
    maxPlaytime: 60,
    recommendedPlayerCount: [],
    averageWeight: 2.5,
  };

  const MOCK_FILTERS: CollectionFilterState = {
    username: "",
    showInvalidPlayerCount: false,
    showExpansions: false,
    showRatings: "NO_RATING",
    playerCountRange: [1, Number.POSITIVE_INFINITY],
    playtimeRange: [0, Number.POSITIVE_INFINITY],
    isDebug: false,
  };

  test.each`
    showInvalidPlayerCount | expectedLength
    ${true}                | ${3}
    ${false}               | ${1}
  `(
    "GIVEN recommendedPlayerCount length originally 3, WHEN showInvalidPlayerCount=$showInvalidPlayerCount, THEN expect recommendedPlayerCount length = $expectedLength",
    ({ showInvalidPlayerCount, expectedLength }) => {
      const gameWith3Recs: Partial<BoardGame> = {
        ...MOCK_GAME,
        recommendedPlayerCount: [
          { playerCountValue: 1 },
          { playerCountValue: 2 },
          { playerCountValue: 3 },
        ] as any,
      };
      const filter = { ...MOCK_FILTERS, showInvalidPlayerCount };
      const actual = applyFiltersAndSorts([gameWith3Recs] as any, filter);
      expect(actual[0].recommendedPlayerCount.length).toBe(expectedLength);
    }
  );
});
