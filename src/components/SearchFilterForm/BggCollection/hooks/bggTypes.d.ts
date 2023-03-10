type BriefBoardGameThing = {
  objecttype: "thing";
  objectid: number;
  subtype: "boardgame" | "boardgameexpansion";
  collid: number;
  name: {
    text: string | number;
    sortindex: number;
  };
  status: {
    own: 0 | 1;
    prevowned: 0 | 1;
    fortrade: 0 | 1;
    want: 0 | 1;
    wanttoplay: 0 | 1;
    wanttobuy: 0 | 1;
    wishlist: 0 | 1;
    preordered: 0 | 1;
    lastmodified: string;
  };
};

type NonBriefBoardGameThing = {
  comment?: string;
  image?: string;
  numplays: number;
  originalname?: string;
  thumbnail?: string;
  wishlistcomment?: string;
  yearpublished?: number;
};

type BoardGameThingRank = {
  type: "subtype" | "family";
  name: string;
  friendlyname: string;
  id: number;
  value: number | "Not Ranked";
  bayesaverage: number | "Not Ranked";
};

type BoardGameThingStats = {
  stats: {
    rating: {
      usersrated: { value: number };
      average: { value: number };
      bayesaverage: { value: number };
      stddev: { value: number };
      median: { value: number };
      ranks: {
        rank: BoardGameThingRank[];
      };
      value: number | "N/A";
    };
    minplayers?: number;
    maxplayers?: number;
    minplaytime?: number;
    maxplaytime?: number;
    playingtime?: number;
    numowned: number;
  };
};

type BoardGameThing = BriefBoardGameThing &
  NonBriefBoardGameThing &
  BoardGameThingStats;

export type Collection = {
  items: {
    totalitems: number;
    termsofuse: string;
    pubdate: string;
    item: BoardGameThing[];
  };
};

type Name = {
  type: "primary" | "alternate";
  sortindex: 1;
  value: string | number;
};

type Link = { type: string; id: number; value: string };

type SuggestedNumPlayersResult = {
  numplayers: number | string;
  result: [
    { value: "Best"; numvotes: number },
    { value: "Recommended"; numvotes: number },
    { value: "Not Recommended"; numvotes: number }
  ];
};

type SuggestedNumPlayersPoll = {
  name: "suggested_numplayers";
  title: string;
  totalvotes: number;
  results: SuggestedNumPlayersResult | SuggestedNumPlayersResult[];
};

type SuggestedPlayerAgeResult = {
  value: number | string;
  numvotes: number;
};

type SuggestedPlayerAgePoll = {
  name: "suggested_playerage";
  title: string;
  totalvotes: number;
  results: {
    result: SuggestedPlayerAgeResult[];
  };
};

type LanguageDependenceResult = {
  level: number;
  value: string;
  numvotes: number;
};

type LanguageDependencePoll = {
  name: "language_dependence";
  title: string;
  totalvotes: number;
  results: {
    result: LanguageDependenceResult[];
  };
};

type Poll =
  | SuggestedNumPlayersPoll
  | SuggestedPlayerAgePoll
  | LanguageDependencePoll;

type Rank = {
  type: string;
  id: string;
  name: string;
  friendlyname: string;
  value: string;
  bayesaverage: string;
};

type ValueObject<S extends string> = Record<S, { value: number }>;

type BoardGameThingItem = {
  type: "boardgame" | "boardgameexpansion";
  id: number;
  thumbnail: string;
  image: string;
  name: Name | Name[];
  description: string;
  poll: Poll[];
  link: Link[];
  statistics: {
    page: number;
    ratings: {
      ranks: {
        rank: Rank[];
      };
    } & ValueObject<
      | "usersrated"
      | "average"
      | "bayesaverage"
      | "stddev"
      | "median"
      | "owned"
      | "trading"
      | "wanting"
      | "wishing"
      | "numcomments"
      | "numweights"
      | "averageweight"
    >;
  };
} & ValueObject<
  | "yearpublished"
  | "minplayers"
  | "maxplayers"
  | "playingtime"
  | "minplaytime"
  | "maxplaytime"
  | "minage"
>;

export type Thing = {
  items: {
    termsofuse: "https://boardgamegeek.com/xmlapi/termsofuse";
    item: BoardGameThingItem[];
  };
};
