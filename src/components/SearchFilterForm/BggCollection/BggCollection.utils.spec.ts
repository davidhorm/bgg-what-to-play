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
    minPlaytime: 0,
    maxPlaytime: 0,
    minPlayers: props?.minPlayers ?? 1,
    maxPlayers: props?.maxPlayers ?? 1,
    recommendedPlayerCount: props?.recommendedPlayerCount ?? [
      { playerCountValue: 1 } as any,
    ],
    averageWeight: 0,
    userRating: 0,
    averageRating: 0,
  });

  const buildMockFilters = (
    props: Partial<CollectionFilterState>
  ): CollectionFilterState => ({
    username: props.username ?? "",
    showInvalidPlayerCount: props.showInvalidPlayerCount ?? false,
    showExpansions: props.showExpansions ?? false,
    showRatings: props.showRatings ?? "NO_RATING",
    playerCountRange: props.playerCountRange ?? [1, Number.POSITIVE_INFINITY],
    playtimeRange: props.playtimeRange ?? [0, Number.POSITIVE_INFINITY],
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

  // TODO: FIX ${[2, 4]} | ${[3, 3]} | ${0}
  test.each`
    boardGamePlayerCount | filterPlayerCountRange           | expectedLength
    ${[2, 3, 4]}         | ${[1, 1]}                        | ${0}
    ${[2, 3, 4]}         | ${[2, 2]}                        | ${1}
    ${[2, 3, 4]}         | ${[3, 3]}                        | ${1}
    ${[2, 3, 4]}         | ${[4, 4]}                        | ${1}
    ${[2, 3, 4]}         | ${[1, 2]}                        | ${1}
    ${[2, 3, 4]}         | ${[4, Number.POSITIVE_INFINITY]} | ${1}
    ${[2, 3, 4]}         | ${[5, Number.POSITIVE_INFINITY]} | ${0}
    ${[3]}               | ${[1, 2]}                        | ${0}
    ${[3]}               | ${[2, 3]}                        | ${1}
    ${[3]}               | ${[3, 4]}                        | ${1}
    ${[3]}               | ${[4, 5]}                        | ${0}
    ${[4]}               | ${[3, Number.POSITIVE_INFINITY]} | ${1}
    ${[4]}               | ${[4, Number.POSITIVE_INFINITY]} | ${1}
    ${[4]}               | ${[5, Number.POSITIVE_INFINITY]} | ${0}
    ${[2, 4]}            | ${[1, 1]}                        | ${0}
    ${[2, 4]}            | ${[2, 2]}                        | ${1}
    ${[2, 4]}            | ${[4, 4]}                        | ${1}
    ${[2, 4]}            | ${[5, 5]}                        | ${0}
  `(
    "GIVEN boardGamePlayerCount=$boardGamePlayerCount, WHEN filterPlayerCountRange=$filterPlayerCountRange, THEN expectedLength=$expectedLength",
    ({ boardGamePlayerCount, filterPlayerCountRange, expectedLength }) => {
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
    }
  );
});
