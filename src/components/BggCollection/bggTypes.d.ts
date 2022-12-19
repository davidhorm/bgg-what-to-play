export type CollectionItem = {
  objecttype: "thing";
  objectid: string;
  subtype: "boardgame";
  collid: string;
  name: {
    text: string;
    sortindex: string;
  };
  status: {
    own: "0" | "1";
    prevowned: "0" | "1";
    fortrade: "0" | "1";
    want: "0" | "1";
    wanttoplay: "0" | "1";
    wanttobuy: "0" | "1";
    wishlist: "0" | "1";
    preordered: "0" | "1";
    lastmodified: string;
  };
};

export type Name = {
  type: "primary" | "alternate";
  sortindex: "1";
  value: string;
};

type Link = { type: string; id: string; value: string };

type SuggestedNumPlayersResult = {
  numplayers: string;
  result: [
    { value: "Best"; numvotes: string },
    { value: "Recommended"; numvotes: string },
    { value: "Not Recommended"; numvotes: string }
  ];
};

type SuggestedNumPlayersPoll = {
  name: "suggested_numplayers";
  title: string;
  totalvotes: string;
  results: SuggestedNumPlayersResult | SuggestedNumPlayersResult[];
};

type SuggestedPlayerAgeResult = {
  value: string;
  numvotes: string;
};

type SuggestedPlayerAgePoll = {
  name: "suggested_playerage";
  title: string;
  totalvotes: string;
  results: {
    result: SuggestedPlayerAgeResult[];
  };
};

type LanguageDependenceResult = {
  level: string;
  value: string;
  numvotes: string;
};

type LanguageDependencePoll = {
  name: "language_dependence";
  title: string;
  totalvotes: string;
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

type ValueObject<S extends string> = Record<S, { value: string }>;

export type ThingItem = {
  type: "boardgame";
  id: string;
  thumbnail: string;
  image: string;
  name: Name | Name[];
  description: string;
  poll: Poll[];
  link: Link[];
  statistics: {
    page: string;
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
