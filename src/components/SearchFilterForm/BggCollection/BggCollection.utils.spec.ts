import type { CollectionFilterState } from "@/types";
import { describe, test, expect } from "vitest";
import { applyFiltersAndSorts } from "./BggCollection.utils";
import type { SimpleBoardGame } from "./hooks/useGetCollectionQuery.utils";

describe(applyFiltersAndSorts.name, () => {
  const buildMockGame = (
    props?: Partial<SimpleBoardGame>
  ): SimpleBoardGame => ({
    name: "Ticket to Ride",
    type: props?.type ?? "boardgame",
    id: 0,
    thumbnail: "thumbnail.png",
    minPlaytime: props?.minPlaytime ?? 0,
    maxPlaytime: props?.maxPlaytime ?? 0,
    minPlayers: props?.minPlayers ?? 1,
    maxPlayers: props?.maxPlayers ?? 1,
    recommendedPlayerCount: props?.recommendedPlayerCount ?? [
      { playerCountValue: 1 } as any,
    ],
    averageWeight: props?.averageWeight ?? 1,
    userRating: props?.userRating ?? "N/A",
    averageRating: props?.averageRating ?? undefined,
  });

  const buildMockFilters = (
    props: Partial<CollectionFilterState>
  ): CollectionFilterState => ({
    username: props.username ?? "",
    showInvalidPlayerCount: props.showInvalidPlayerCount ?? false,
    showExpansions: props.showExpansions ?? false,
    playerCountRange: props.playerCountRange ?? [1, Number.POSITIVE_INFINITY],
    playtimeRange: props.playtimeRange ?? [0, Number.POSITIVE_INFINITY],
    ratingsRange: props.ratingsRange ?? [1, 10],
    showRatings: props.showRatings ?? "NO_RATING",
    complexityRange: props.complexityRange ?? [1, 5],
    isDebug: props.isDebug ?? false, // PRO TIP: set to true to help debug tests
  });

  test.each`
    showInvalidPlayerCount | expectedLength
    ${true}                | ${3}
    ${false}               | ${1}
  `(
    "GIVEN game has player count range 1-3, but only 2 is valid, WHEN showInvalidPlayerCount=$showInvalidPlayerCount, THEN expect recommendedPlayerCount length = $expectedLength",
    ({ showInvalidPlayerCount, expectedLength }) => {
      const gameWith3Recs = buildMockGame({
        minPlayers: 2,
        maxPlayers: 2,
        recommendedPlayerCount: [
          { playerCountValue: 1 },
          { playerCountValue: 2 },
          { playerCountValue: 3 },
        ] as any,
      });

      const filter = buildMockFilters({ showInvalidPlayerCount });
      const actual = applyFiltersAndSorts([gameWith3Recs], filter);
      expect(actual[0].recommendedPlayerCount.length).toBe(expectedLength);
    }
  );

  test.each`
    showInvalidPlayerCount | expectedLength
    ${true}                | ${1}
    ${false}               | ${0}
  `(
    "GIVEN boardgame has 0 player count, WHEN showInvalidPlayerCount=$showInvalidPlayerCount, THEN expectedLength=$expectedLength",
    ({ showInvalidPlayerCount, expectedLength }) => {
      /** edge case for game id = 40567 */
      const boardgame = buildMockGame({
        minPlayers: 0,
        maxPlayers: 0,
        recommendedPlayerCount: [],
      });

      const filter = buildMockFilters({ showInvalidPlayerCount });
      const actual = applyFiltersAndSorts([boardgame], filter);
      expect(actual.length).toBe(expectedLength);
    }
  );

  test.each`
    showExpansions | expectedLength
    ${true}        | ${2}
    ${false}       | ${1}
  `(
    "GIVEN a collection with a boardgame and expansion, WHEN showExpansions=$showExpansions, THEN expectedLength=$expectedLength",
    ({ showExpansions, expectedLength }) => {
      const boardgame = buildMockGame();
      const expansion = buildMockGame({ type: "boardgameexpansion" });

      const filter = buildMockFilters({ showExpansions });
      const actual = applyFiltersAndSorts([boardgame, expansion], filter);
      expect(actual.length).toBe(expectedLength);
    }
  );

  test.each`
    boardGamePlayerCount | filterPlayerCountRange           | expectedLength | expectedIsPlayerCountWithinRange
    ${[2, 3, 4]}         | ${[1, 1]}                        | ${0}           | ${0}
    ${[2, 3, 4]}         | ${[2, 2]}                        | ${1}           | ${1}
    ${[2, 3, 4]}         | ${[3, 3]}                        | ${1}           | ${1}
    ${[2, 3, 4]}         | ${[4, 4]}                        | ${1}           | ${1}
    ${[2, 3, 4]}         | ${[1, 2]}                        | ${1}           | ${1}
    ${[2, 3, 4]}         | ${[4, Number.POSITIVE_INFINITY]} | ${1}           | ${1}
    ${[2, 3, 4]}         | ${[5, Number.POSITIVE_INFINITY]} | ${0}           | ${0}
    ${[3]}               | ${[1, 2]}                        | ${0}           | ${0}
    ${[3]}               | ${[2, 3]}                        | ${1}           | ${1}
    ${[3]}               | ${[3, 4]}                        | ${1}           | ${1}
    ${[3]}               | ${[4, 5]}                        | ${0}           | ${0}
    ${[4]}               | ${[3, Number.POSITIVE_INFINITY]} | ${1}           | ${1}
    ${[4]}               | ${[4, Number.POSITIVE_INFINITY]} | ${1}           | ${1}
    ${[4]}               | ${[5, Number.POSITIVE_INFINITY]} | ${0}           | ${0}
    ${[2, 4]}            | ${[1, 1]}                        | ${0}           | ${0}
    ${[2, 4]}            | ${[2, 2]}                        | ${1}           | ${1 /* TODO: FIX ${[2, 4]} | ${[3, 3]} | ${0} */}
    ${[2, 4]}            | ${[4, 4]}                        | ${1}           | ${1}
    ${[2, 4]}            | ${[5, 5]}                        | ${0}           | ${0}
    ${[1, 2, 3]}         | ${[1, Number.POSITIVE_INFINITY]} | ${1}           | ${3}
    ${[1, 2, 3]}         | ${[2, Number.POSITIVE_INFINITY]} | ${1}           | ${2}
    ${[1, 2, 3]}         | ${[3, Number.POSITIVE_INFINITY]} | ${1}           | ${1}
    ${[1, 2, 3]}         | ${[1, 3]}                        | ${1}           | ${3}
    ${[1, 2, 3]}         | ${[1, 2]}                        | ${1}           | ${2}
    ${[1, 2, 3]}         | ${[1, 1]}                        | ${1}           | ${1}
  `(
    "GIVEN boardGamePlayerCount=$boardGamePlayerCount, WHEN filterPlayerCountRange=$filterPlayerCountRange, THEN expectedLength=$expectedLength, and count of isPlayerCountWithinRange=$expectedIsPlayerCountWithinRange",
    ({
      boardGamePlayerCount,
      filterPlayerCountRange,
      expectedLength,
      expectedIsPlayerCountWithinRange,
    }) => {
      const boardgame = buildMockGame({
        minPlayers: boardGamePlayerCount[0],
        maxPlayers: boardGamePlayerCount.at(-1),
        recommendedPlayerCount: boardGamePlayerCount.map(
          (playerCountValue: number) => ({ playerCountValue })
        ) as any,
      });

      const filter = buildMockFilters({
        playerCountRange: filterPlayerCountRange,
      });
      const actual = applyFiltersAndSorts([boardgame], filter);

      expect(actual.length).toBe(expectedLength);

      if (expectedLength) {
        expect(
          actual[0].recommendedPlayerCount.filter(
            (r) => r.isPlayerCountWithinRange
          ).length
        ).toBe(expectedIsPlayerCountWithinRange);
      }
    }
  );

  test.each`
    boardGamePlaytime | filterPlaytimeRange                | expectedLength
    ${[0, 0]}         | ${[0, 0]}                          | ${1}
    ${[0, 0]}         | ${[0, 15]}                         | ${1}
    ${[0, 0]}         | ${[0, Number.POSITIVE_INFINITY]}   | ${1}
    ${[0, 0]}         | ${[15, 15]}                        | ${0}
    ${[15, 15]}       | ${[0, 0]}                          | ${0}
    ${[15, 15]}       | ${[15, 15]}                        | ${1}
    ${[15, 15]}       | ${[30, 30]}                        | ${0}
    ${[15, 15]}       | ${[0, 15]}                         | ${1}
    ${[15, 15]}       | ${[15, 30]}                        | ${1}
    ${[241, 241]}     | ${[240, 240]}                      | ${0}
    ${[241, 241]}     | ${[241, Number.POSITIVE_INFINITY]} | ${1}
    ${[241, 241]}     | ${[240, Number.POSITIVE_INFINITY]} | ${1}
    ${[60, 75]}       | ${[45, 45]}                        | ${0}
    ${[60, 75]}       | ${[60, 60]}                        | ${1}
    ${[60, 75]}       | ${[75, 75]}                        | ${1}
    ${[60, 75]}       | ${[90, 90]}                        | ${0}
    ${[60, 75]}       | ${[45, Number.POSITIVE_INFINITY]}  | ${1}
    ${[60, 75]}       | ${[60, Number.POSITIVE_INFINITY]}  | ${1}
    ${[60, 75]}       | ${[75, Number.POSITIVE_INFINITY]}  | ${1}
    ${[60, 75]}       | ${[90, Number.POSITIVE_INFINITY]}  | ${0}
  `(
    "GIVEN boardGamePlaytime=$boardGamePlaytime, WHEN filterPlaytimeRange=$filterPlaytimeRange, THEN expectedLength=$expectedLength",
    ({ boardGamePlaytime, filterPlaytimeRange, expectedLength }) => {
      const boardgame = buildMockGame({
        minPlaytime: boardGamePlaytime[0],
        maxPlaytime: boardGamePlaytime[1],
      });

      const filter = buildMockFilters({ playtimeRange: filterPlaytimeRange });
      const actual = applyFiltersAndSorts([boardgame], filter);
      expect(actual.length).toBe(expectedLength);
    }
  );

  test.each`
    boardGameComplexity | filterComplexityRange | expectedLength
    ${1.1}              | ${[1, 1]}             | ${0}
    ${1.1}              | ${[1.1, 1.1]}         | ${1}
    ${1.1}              | ${[1.2, 1.2]}         | ${0}
    ${1.1}              | ${[1, 1.1]}           | ${1}
    ${1.1}              | ${[1.1, 1.2]}         | ${1}
    ${1.2}              | ${[1, 1.1]}           | ${0}
    ${1.2}              | ${[1.3, 1.4]}         | ${0}
  `(
    "GIVEN boardGameComplexity=$boardGameComplexity, WHEN filterComplexityRange=$filterComplexityRange, THEN expectedLength=$expectedLength",
    ({ boardGameComplexity, filterComplexityRange, expectedLength }) => {
      const boardgame = buildMockGame({ averageWeight: boardGameComplexity });

      const filter = buildMockFilters({
        complexityRange: filterComplexityRange,
      });
      const actual = applyFiltersAndSorts([boardgame], filter);
      expect(actual.length).toBe(expectedLength);
    }
  );

  test.each`
    boardGameWithRatings            | filterRatingsRange | showRatings         | expectedLength
    ${{ averageRating: 1.1 }}       | ${[1, 1]}          | ${"NO_RATING"}      | ${0}
    ${{ averageRating: 1.1 }}       | ${[1.1, 1.1]}      | ${"NO_RATING"}      | ${1}
    ${{ averageRating: 1.1 }}       | ${[1.2, 1.2]}      | ${"NO_RATING"}      | ${0}
    ${{ averageRating: 1.2 }}       | ${[1, 1.1]}        | ${"NO_RATING"}      | ${0}
    ${{ averageRating: 1.2 }}       | ${[1.1, 1.2]}      | ${"NO_RATING"}      | ${1}
    ${{ averageRating: 1.2 }}       | ${[1.2, 1.3]}      | ${"NO_RATING"}      | ${1}
    ${{ averageRating: 1.2 }}       | ${[1.3, 1.4]}      | ${"NO_RATING"}      | ${0}
    ${{ averageRating: undefined }} | ${[1, 1]}          | ${"NO_RATING"}      | ${1}
    ${{ averageRating: undefined }} | ${[1.1, 1.1]}      | ${"NO_RATING"}      | ${0}
    ${{ averageRating: 1.1 }}       | ${[1, 1]}          | ${"AVERAGE_RATING"} | ${0}
    ${{ averageRating: 1.1 }}       | ${[1.1, 1.1]}      | ${"AVERAGE_RATING"} | ${1}
    ${{ averageRating: 1.1 }}       | ${[1.2, 1.2]}      | ${"AVERAGE_RATING"} | ${0}
    ${{ averageRating: 1.2 }}       | ${[1, 1.1]}        | ${"AVERAGE_RATING"} | ${0}
    ${{ averageRating: 1.2 }}       | ${[1.1, 1.2]}      | ${"AVERAGE_RATING"} | ${1}
    ${{ averageRating: 1.2 }}       | ${[1.2, 1.3]}      | ${"AVERAGE_RATING"} | ${1}
    ${{ averageRating: 1.2 }}       | ${[1.3, 1.4]}      | ${"AVERAGE_RATING"} | ${0}
    ${{ averageRating: undefined }} | ${[1, 1]}          | ${"AVERAGE_RATING"} | ${1}
    ${{ averageRating: undefined }} | ${[1.1, 1.1]}      | ${"AVERAGE_RATING"} | ${0}
    ${{ userRating: 1.1 }}          | ${[1, 1]}          | ${"USER_RATING"}    | ${0}
    ${{ userRating: 1.1 }}          | ${[1.1, 1.1]}      | ${"USER_RATING"}    | ${1}
    ${{ userRating: 1.1 }}          | ${[1.2, 1.2]}      | ${"USER_RATING"}    | ${0}
    ${{ userRating: 1.2 }}          | ${[1, 1.1]}        | ${"USER_RATING"}    | ${0}
    ${{ userRating: 1.2 }}          | ${[1.1, 1.2]}      | ${"USER_RATING"}    | ${1}
    ${{ userRating: 1.2 }}          | ${[1.2, 1.3]}      | ${"USER_RATING"}    | ${1}
    ${{ userRating: 1.2 }}          | ${[1.3, 1.4]}      | ${"USER_RATING"}    | ${0}
    ${{ userRating: undefined }}    | ${[1, 1]}          | ${"USER_RATING"}    | ${1}
    ${{ userRating: undefined }}    | ${[1.1, 1.1]}      | ${"USER_RATING"}    | ${0}
    ${{ userRating: "N/A" }}        | ${[1, 1]}          | ${"USER_RATING"}    | ${1}
    ${{ userRating: "N/A" }}        | ${[1.1, 1.1]}      | ${"USER_RATING"}    | ${0}
  `(
    "GIVEN boardGameWithRatings=$boardGameWithRatings, WHEN filterRatingsRange=$filterRatingsRange and showRatings=$showRatings, THEN expectedLength=$expectedLength",
    ({
      boardGameWithRatings,
      filterRatingsRange,
      showRatings,
      expectedLength,
    }) => {
      const boardgame = buildMockGame(boardGameWithRatings);

      const filter = buildMockFilters({
        ratingsRange: filterRatingsRange,
        showRatings,
      });
      const actual = applyFiltersAndSorts([boardgame], filter);
      expect(actual.length).toBe(expectedLength);
    }
  );
});
