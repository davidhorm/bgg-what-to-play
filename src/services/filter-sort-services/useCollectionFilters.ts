import { useReducer, ComponentProps } from "react";
import type { SimpleBoardGame } from "@/types";
import Slider from "@mui/material/Slider";
import { complexityService } from "./complexity.service";
import { isDebugService } from "./is-debug.service";
import { playerCountService } from "./player-count.service";
import { playtimeService } from "./playtime.service";
import { ratingsService } from "./ratings.service";
import { showExpansionsService } from "./show-expansions.service";
import { showInvalidPlayerCountService } from "./show-invalid-player-count.service";
import { showNotRecommendedService } from "./show-not-recommended.service";
import { showRatingsService } from "./show-ratings.service";
import { usernameService } from "./username.service";

/** Interface to abstract filter control logic. Needs to be able to provide initial state, and a reducer to set state */
export type FilterControl<T> = {
  getInitialState: () => T;
  getReducedState: ActionHandler<T>;
  setQueryParam: (
    searchParams: URLSearchParams,
    state: CollectionFilterState
  ) => void;
};

export type SliderFilterControl = FilterControl<[number, number]> & {
  getSliderLabel: (filterState: CollectionFilterState) => string;
  getSliderProps: (
    filterState: CollectionFilterState
  ) => ComponentProps<typeof Slider>;
  isWithinRange: (
    filterState: CollectionFilterState
  ) => (game: SimpleBoardGame) => boolean;
};

/** Interface to abstract boolean filter controls. */
export type BooleanFilterControl = Pick<
  FilterControl<boolean>,
  "getInitialState" | "setQueryParam"
> & {
  toggleReducedState: ActionHandler<Partial<undefined>>;
};

const initialFilterState = {
  /** The username defined in the query param, or submitted in the input. */
  username: usernameService.getInitialState(),

  /** If `true`, then show the invalid Player Count outside of the game's actual min/max Player Count. */
  showInvalidPlayerCount: showInvalidPlayerCountService.getInitialState(),

  /**
   * The Player Count `[minRange, maxRange]` the user wants to filter the collection.
   * - Valid `minRange` values are 1-11.
   * - Valid `maxRange` values are 1-10, or Infinity;
   */
  playerCountRange: playerCountService.getInitialState(),

  /**
   * The Play Time `[minRange, maxRange]` the user wants to filter the collection.
   * - Valid `minRange` values are 0-240.
   * - Valid `maxRange` values are 0-240, or Infinity;
   */
  playtimeRange: playtimeService.getInitialState(),

  /**
   * The Complexity `[minRange, maxRange]` the user wants to filter the collection.
   * - Valid `minRange` and `maxRange` values are 1-5.
   */
  complexityRange: complexityService.getInitialState(),

  /** If `true`, then show expansions in collection. */
  showExpansions: showExpansionsService.getInitialState(),

  /**
   * If `"NO_RATING"`, then don't show any ratings in the cards
   * If `"AVERAGE_RATING"`, then only show the Average Rating in the card (and use in filtering)
   * If `"USER_RATING"`, then only show the User Rating in the card (and use in filtering)
   */
  showRatings: showRatingsService.getInitialState(),

  /**
   * The Ratings `[minRange, maxRange]` the user wants to filter the collection.
   * By default, will filter by Average Ratings. But will filter by User Rating if showRatings = "USER_RATING"
   * - Valid `minRange` and `maxRange` values are 1-10.
   */
  ratingsRange: ratingsService.getInitialState(),

  /** If `true`, then show games where all of the filtered player counts are not recommended. */
  showNotRecommended: showNotRecommendedService.getInitialState(),

  /** If `true`, then `console.log` messages to help troubleshoot. */
  isDebug: isDebugService.getInitialState(),
};

export type CollectionFilterState = typeof initialFilterState;

export type ActionHandler<T> = (
  state: CollectionFilterState,
  payload: T
) => CollectionFilterState;

const actions = {
  SET_COMPLEXITY: complexityService.getReducedState,
  SET_PLAYER_COUNT_RANGE: playerCountService.getReducedState,
  SET_PLAYTIME_RANGE: playtimeService.getReducedState,
  SET_USERNAME: usernameService.getReducedState,

  TOGGLE_SHOW_RATINGS: showRatingsService.getToggleShowRatings,
  SET_SHOW_RATINGS: showRatingsService.getReducedState,
  SET_RATINGS: ratingsService.getReducedState,

  TOGGLE_SHOW_EXPANSIONS: showExpansionsService.toggleReducedState,

  TOGGLE_SHOW_INVALID_PLAYER_COUNT:
    showInvalidPlayerCountService.toggleReducedState,

  TOGGLE_SHOW_NOT_RECOMMENDED_PLAYER_COUNT:
    showNotRecommendedService.toggleReducedState,
};

/**
 * Collection of SliderControl and their action type to set their value.
 * So that we can transform to `initialSliderValues` and `sliderControls`
 */
const sliderSetActions: Array<{
  sliderControl: SliderFilterControl;
  setAction: keyof typeof actions;
}> = [
  {
    sliderControl: playerCountService,
    setAction: "SET_PLAYER_COUNT_RANGE",
  },
  { sliderControl: playtimeService, setAction: "SET_PLAYTIME_RANGE" },
  { sliderControl: complexityService, setAction: "SET_COMPLEXITY" },
  { sliderControl: ratingsService, setAction: "SET_RATINGS" },
];

/** Creates an array of initial states for the slider value local state */
const initialSliderValues: Record<string, [number, number]> =
  sliderSetActions.reduce(
    (prevVal, currVal, index) => ({
      ...prevVal,
      [index]: currVal.sliderControl.getInitialState(),
    }),
    {}
  );

//#region reducer

const maybeSetQueryParam = (state: CollectionFilterState) => {
  if (!state.username) return;

  const url = new URL(document.location.href);

  usernameService.setQueryParam(url.searchParams, state);
  playerCountService.setQueryParam(url.searchParams, state);
  playtimeService.setQueryParam(url.searchParams, state);
  complexityService.setQueryParam(url.searchParams, state);
  ratingsService.setQueryParam(url.searchParams, state);
  showRatingsService.setQueryParam(url.searchParams, state);

  showExpansionsService.setQueryParam(url.searchParams, state);

  showNotRecommendedService.setQueryParam(url.searchParams, state);

  showInvalidPlayerCountService.setQueryParam(url.searchParams, state);

  isDebugService.setQueryParam(url.searchParams, state);

  history.pushState({}, "", url);
};

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
type Payload<T> = T extends (...args: any[]) => any ? Parameters<T>[1] : never;

type CreateActions<T extends typeof actions> = {
  [K in keyof T]: Payload<T[K]> extends undefined
    ? {
        type: K;
        payload?: undefined;
      }
    : {
        type: K;
        payload: Payload<T[K]>;
      };
}[keyof T];

type Action = CreateActions<typeof actions>;

/** Reducer pattern based off of https://stackoverflow.com/questions/74884329/how-to-derive-action-type-from-mapping-object-for-usereducer-dispatch-type-safet */
const reducer: ActionHandler<Action> = (
  state,
  action
): CollectionFilterState => {
  const newState = (
    actions[action.type] as ActionHandler<typeof action["payload"]>
  )(state, action.payload);

  maybeSetQueryParam(newState);

  return newState;
};

//#endregion reducer

//#region apply

const maybeOutputList =
  <T extends SimpleBoardGame>(
    filterState: CollectionFilterState,
    groupLabel: string
  ) =>
  (game: T, index: number, array: T[]) => {
    if (filterState.isDebug && index === 0) {
      console.groupCollapsed(groupLabel);
      console.table(array.map(({ id, name }) => ({ id, name })));
      console.groupEnd();
    }

    return game;
  };

const maybeShowExpansions =
  (filterState: CollectionFilterState) => (game: SimpleBoardGame) => {
    if (filterState.showExpansions) return true;

    return game.type === "boardgame";
  };

//#region maybeShowInvalidPlayerCount

const removeRecsLessThan =
  (minPlayers: SimpleBoardGame["minPlayers"]) =>
  (rec: SimpleBoardGame["recommendedPlayerCount"][number]): boolean =>
    rec.playerCountValue >= minPlayers;

const removeRecsMoreThan =
  (maxPlayers: SimpleBoardGame["maxPlayers"]) =>
  (rec: SimpleBoardGame["recommendedPlayerCount"][number]): boolean =>
    rec.playerCountValue <= maxPlayers;

const maybeShowInvalidPlayerCount =
  (filterState: CollectionFilterState) =>
  (game: SimpleBoardGame): SimpleBoardGame =>
    filterState.showInvalidPlayerCount
      ? game
      : {
          ...game,
          recommendedPlayerCount: game.recommendedPlayerCount
            .filter(removeRecsLessThan(game.minPlayers))
            .filter(removeRecsMoreThan(game.maxPlayers)),
        };

//#endregion maybeShowInvalidPlayerCount

/** Used to determine which bar to highlight in the graph */
const addIsPlayerCountWithinRange =
  (filterState: CollectionFilterState) => (game: SimpleBoardGame) => {
    const [minFilterCount, maxFilterCount] = filterState.playerCountRange;

    return {
      ...game,

      /** Board Game's recommended player count according to BGG poll */
      recommendedPlayerCount: game.recommendedPlayerCount.map((rec) => ({
        ...rec,

        /** Is `true` if the Poll's Player Count value is within the filter's Player Count Range. */
        isPlayerCountWithinRange:
          minFilterCount <= rec.playerCountValue &&
          rec.playerCountValue <= maxFilterCount,
      })),
    };
  };

const maybeShowNotRecommended =
  (filterState: CollectionFilterState) =>
  (game: ReturnType<ReturnType<typeof addIsPlayerCountWithinRange>>) =>
    filterState.showNotRecommended || filterState.showInvalidPlayerCount
      ? true
      : game.recommendedPlayerCount.filter(
          (rec) =>
            rec.isPlayerCountWithinRange &&
            (rec.NotRecommendedPercent <= 50 ||
              Number.isNaN(rec.NotRecommendedPercent)) // Show games even if no data because technically not "not rec'd"
        ).length > 0;

//#region maybeSortByScore

const calcSortScoreSum = (
  game: SimpleBoardGame,
  minRange: number,
  maxRange: number
): number =>
  game.recommendedPlayerCount
    .filter(
      (g) => minRange <= g.playerCountValue && g.playerCountValue <= maxRange
    )
    .reduce((prev, curr) => curr.sortScore + prev, 0);

const maybeSortByScore =
  (filterState: CollectionFilterState) =>
  (gameA: SimpleBoardGame, gameB: SimpleBoardGame): number => {
    // if using non-default player range, then sort by score
    const [minRange, maxRange] = filterState.playerCountRange;
    if (minRange !== 1 || maxRange !== Number.POSITIVE_INFINITY) {
      return (
        calcSortScoreSum(gameB, minRange, maxRange) -
        calcSortScoreSum(gameA, minRange, maxRange)
      );
    }

    // else sort by game name by default.
    return gameA.name.localeCompare(gameB.name);
  };

//#endregion maybeSortByScore

export const applyFiltersAndSorts =
  (filterState: CollectionFilterState) => (games: SimpleBoardGame[]) =>
    games
      ?.map(maybeOutputList(filterState, "All Games"))
      .filter(maybeShowExpansions(filterState)) // Show as many things as needed from here
      .map(maybeOutputList(filterState, "maybeShowExpansions"))
      .map(maybeShowInvalidPlayerCount(filterState))
      .filter(playerCountService.isWithinRange(filterState)) // Start removing things as needed from here
      .map(maybeOutputList(filterState, "isMinMaxPlayerRangeWithinRange"))
      .filter(playtimeService.isWithinRange(filterState))
      .map(maybeOutputList(filterState, "isPlaytimeWithinRange"))
      .filter(complexityService.isWithinRange(filterState))
      .map(maybeOutputList(filterState, "isComplexityWithinRange"))
      .filter(ratingsService.isWithinRange(filterState))
      .map(maybeOutputList(filterState, "isRatingsWithinRange"))
      .map(addIsPlayerCountWithinRange(filterState)) // Add any calculations from here
      .filter(maybeShowNotRecommended(filterState)) // But do one more filter based on isPlayerCountWithinRange
      .map(maybeOutputList(filterState, "maybeShowNotRecommended"))
      .sort(maybeSortByScore(filterState));

export type BoardGame = ReturnType<
  ReturnType<typeof applyFiltersAndSorts>
>[number];

//#endregion apply

export const useCollectionFilters = () => {
  const [filterState, filterDispatch] = useReducer(reducer, initialFilterState);

  const sliderControls: Array<{
    sliderLabel: string;
    sliderProps: ComponentProps<typeof Slider>;
  }> = sliderSetActions.map(
    ({ sliderControl: { getSliderLabel, getSliderProps }, setAction }) => ({
      sliderLabel: getSliderLabel(filterState),
      sliderProps: {
        ...getSliderProps(filterState),

        /** When the change is committed (i.e. Mouse Up), then update the reducer state */
        onChangeCommitted: (_, value) => {
          filterDispatch({
            type: setAction as any,
            payload: value as [number, number],
          });
        },
      },
    })
  );

  return {
    filterState,
    filterDispatch,
    usernameControl: {
      username: filterState.username,
      setUsername: (payload: string) =>
        filterDispatch({ type: "SET_USERNAME", payload }),
    },
    sliderControls,
    initialSliderValues,
    applyFiltersAndSorts: applyFiltersAndSorts(filterState),
  };
};

export type CollectionFilterReducer = ReturnType<typeof useCollectionFilters>;
