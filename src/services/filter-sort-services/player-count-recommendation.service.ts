import { CollectionFilterState, SimpleBoardGame } from "@/types";

/** Used to determine which bar to highlight in the graph */
const addIsPlayerCountWithinRange =
  (filterState: CollectionFilterState) => (games: SimpleBoardGame[]) => {
    const [minFilterCount, maxFilterCount] = filterState.playerCountRange;

    return games.map((game) => ({
      ...game,

      /** Board Game's recommended player count according to BGG poll */
      recommendedPlayerCount: game.recommendedPlayerCount.map((rec) => ({
        ...rec,

        /** Is `true` if the Poll's Player Count value is within the filter's Player Count Range. */
        isPlayerCountWithinRange:
          minFilterCount <= rec.playerCountValue &&
          rec.playerCountValue <= maxFilterCount,
      })),
    }));
  };

export const playerCountRecommendationService = {
  addIsPlayerCountWithinRange,
};
