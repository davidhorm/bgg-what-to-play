import { useEffect } from "react";
import type { SimpleBoardGame } from "@/types";
import { cleanup, render, screen } from "@testing-library/react";
import { describe, test, expect, afterEach } from "vitest";
import {
  applyFiltersAndSorts,
  initialFilterState,
  CollectionFilterState,
  useCollectionFilters,
} from "./useCollectionFilters";

describe(applyFiltersAndSorts.name, () => {
  const buildMockGame = (
    props?: Partial<SimpleBoardGame>
  ): SimpleBoardGame => ({
    name: props?.name ?? "Ticket to Ride",
    type: props?.type ?? "boardgame",
    id: 0,
    thumbnail: "thumbnail.png",
    minPlaytime: props?.minPlaytime ?? 0,
    maxPlaytime: props?.maxPlaytime ?? 0,
    minPlayers: props?.minPlayers ?? 1,
    maxPlayers: props?.maxPlayers ?? 1,
    recommendedPlayerCount: props?.recommendedPlayerCount ?? [
      { playerCountValue: 1, NotRecommendedPercent: 0 } as any,
    ],
    averageWeight: props?.averageWeight ?? 1,
    userRating: props?.userRating ?? "N/A",
    averageRating: props?.averageRating ?? undefined,
  });

  const buildMockFilters = (
    props: Partial<CollectionFilterState>
  ): CollectionFilterState => ({
    ...initialFilterState,
    ...props,
  });

  describe("Filters", () => {
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
            { playerCountValue: 1, NotRecommendedPercent: 0 },
            { playerCountValue: 2, NotRecommendedPercent: 0 },
            { playerCountValue: 3, NotRecommendedPercent: 0 },
          ] as any,
        });

        const filter = buildMockFilters({ showInvalidPlayerCount });
        const actual = applyFiltersAndSorts(filter, [])([gameWith3Recs]);
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
        const actual = applyFiltersAndSorts(filter, [])([boardgame]);
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
        const actual = applyFiltersAndSorts(filter, [])([boardgame, expansion]);
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
            (playerCountValue: number) => ({
              playerCountValue,
              NotRecommendedPercent: 0,
            })
          ) as any,
        });

        const filter = buildMockFilters({
          playerCountRange: filterPlayerCountRange,
        });
        const actual = applyFiltersAndSorts(filter, [])([boardgame]);

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
        const actual = applyFiltersAndSorts(filter, [])([boardgame]);
        expect(actual.length).toBe(expectedLength);
      }
    );

    test.each`
      averageWeight | filterComplexityRange | expectedLength
      ${0}          | ${[1, 1]}             | ${1 /* edge case: show games w/o weights if filtering from 1 */}
      ${0}          | ${[1.1, 1.1]}         | ${0}
      ${1}          | ${[1, 1]}             | ${1}
      ${1.1}        | ${[1, 1]}             | ${0}
      ${1.1}        | ${[1.1, 1.1]}         | ${1}
      ${1.1}        | ${[1.2, 1.2]}         | ${0}
      ${1.1}        | ${[1, 1.1]}           | ${1}
      ${1.1}        | ${[1.1, 1.2]}         | ${1}
      ${1.2}        | ${[1, 1.1]}           | ${0}
      ${1.2}        | ${[1.3, 1.4]}         | ${0}
    `(
      "GIVEN averageWeight=$averageWeight, WHEN filterComplexityRange=$filterComplexityRange, THEN expectedLength=$expectedLength",
      ({ averageWeight, filterComplexityRange, expectedLength }) => {
        const boardgame = buildMockGame({ averageWeight });

        const filter = buildMockFilters({
          complexityRange: filterComplexityRange,
        });
        const actual = applyFiltersAndSorts(filter, [])([boardgame]);
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
        const actual = applyFiltersAndSorts(filter, [])([boardgame]);
        expect(actual.length).toBe(expectedLength);
      }
    );

    const halfBest = { NotRecommendedPercent: 50, playerCountValue: 1 };
    const notRec = { NotRecommendedPercent: 51, playerCountValue: 1 };
    const noData = { NotRecommendedPercent: Number.NaN, playerCountValue: 1 };
    test.each`
      recommendedPlayerCount  | showNotRecommended | expectedLength
      ${[notRec]}             | ${false}           | ${0}
      ${[notRec, notRec]}     | ${false}           | ${0}
      ${[notRec]}             | ${true}            | ${1}
      ${[notRec, notRec]}     | ${true}            | ${1}
      ${[halfBest, notRec]}   | ${true}            | ${1}
      ${[halfBest, notRec]}   | ${false}           | ${1}
      ${[halfBest, halfBest]} | ${false}           | ${1}
      ${[halfBest, halfBest]} | ${true}            | ${1}
      ${[noData]}             | ${false}           | ${1}
    `(
      "GIVEN recommendedPlayerCount=$recommendedPlayerCount, WHEN showNotRecommended=$showNotRecommended, THEN expectedLength=$expectedLength",
      ({ recommendedPlayerCount, showNotRecommended, expectedLength }) => {
        const boardgame = buildMockGame({ recommendedPlayerCount });

        const filter = buildMockFilters({ showNotRecommended });
        const actual = applyFiltersAndSorts(filter, [])([boardgame]);
        expect(actual.length).toBe(expectedLength);
      }
    );
  });

  describe("Sort", () => {
    type Props = { games: SimpleBoardGame[]; sortBys: string[] };
    const MockComponent = ({ games, sortBys }: Props) => {
      const { applyFiltersAndSorts, toggleSelectedSort, selectedSorts } =
        useCollectionFilters();

      useEffect(() => {
        const sortBy = sortBys.shift();
        sortBy && toggleSelectedSort({ sortBy, allowDelete: false });
      }, [selectedSorts]);

      const filteredAndSortedGames = applyFiltersAndSorts(games);

      return (
        filteredAndSortedGames && (
          <div data-testid="actual">
            {JSON.stringify(filteredAndSortedGames)}
          </div>
        )
      );
    };

    afterEach(() => cleanup());

    const GIVEN_GAME_PROPS: Record<string, Partial<SimpleBoardGame>[]> = {
      "name": ["second", "third", "first"].map((name) => ({ name })),
      "same min max playtime": [20, 30, 10].map((time) => ({
        minPlaytime: time,
        maxPlaytime: time,
      })),
      "different min max playtime": [
        [20, 30],
        [20, 40],
        [10, 30],
      ].map(([minPlaytime, maxPlaytime]) => ({ minPlaytime, maxPlaytime })),
      "averageWeight": [2, 3, 1].map((averageWeight) => ({ averageWeight })),
      "averageRating": [2, 3, 1].map((averageRating) => ({ averageRating })),
    };

    // TODO: add test cases for Player Count Recommendation
    // TODO: add test cases for user ratings

    test.each`
      gamesProps                                        | sortBys                                     | expectedOrder
      ${GIVEN_GAME_PROPS["name"]}                       | ${["Name"]}                                 | ${["first", "second", "third"]}
      ${GIVEN_GAME_PROPS["name"]}                       | ${["Name", "Name"]}                         | ${["third", "second", "first"]}
      ${GIVEN_GAME_PROPS["same min max playtime"]}      | ${["Average Playtime"]}                     | ${["3", "2", "1"]}
      ${GIVEN_GAME_PROPS["same min max playtime"]}      | ${["Average Playtime", "Average Playtime"]} | ${["1", "2", "3"]}
      ${GIVEN_GAME_PROPS["different min max playtime"]} | ${["Average Playtime"]}                     | ${["3", "2", "1"]}
      ${GIVEN_GAME_PROPS["different min max playtime"]} | ${["Average Playtime", "Average Playtime"]} | ${["1", "2", "3"]}
      ${GIVEN_GAME_PROPS["averageWeight"]}              | ${["Complexity"]}                           | ${["3", "2", "1"]}
      ${GIVEN_GAME_PROPS["averageWeight"]}              | ${["Complexity", "Complexity"]}             | ${["1", "2", "3"]}
      ${GIVEN_GAME_PROPS["averageRating"]}              | ${["Ratings"]}                              | ${["3", "2", "1"]}
      ${GIVEN_GAME_PROPS["averageRating"]}              | ${["Ratings", "Ratings"]}                   | ${["1", "2", "3"]}
    `(
      "GIVEN games ordered 2-3-1, WHEN sortBys=$sortBys, THEN expectedOrder=$expectedOrder",
      async ({ gamesProps, sortBys, expectedOrder }) => {
        const DEFAULT_NAMES = ["2", "3", "1"];
        const games = (gamesProps as Partial<SimpleBoardGame>[]).map(
          (game, i) => buildMockGame({ name: DEFAULT_NAMES[i], ...game })
        );

        render(<MockComponent games={games} sortBys={sortBys} />);

        const actual = await screen.getByTestId(`actual`)?.innerHTML;

        const actualOrder = JSON.parse(actual).map((g: any) => g.name);
        expect(actualOrder).toEqual(expectedOrder);
      }
    );
  });
});
