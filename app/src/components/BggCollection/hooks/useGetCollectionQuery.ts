import { normalizeFriends } from "@/services/filter-sort-services/friends.service";
import {
  useQueries,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import * as _ from "lodash-es";
import type { Collection, Thing } from "./bggTypes";
import {
  fetchBggCollection,
  fetchBggThings,
  transformToBoardGame,
  transformToUserRating,
} from "./useGetCollectionQuery.utils";

type CollectionEntry = Collection["items"]["item"][number];

const mergeCollectionEntries = (
  sources: { username: string; items: CollectionEntry[] }[],
  primaryUsername: string,
) => {
  const games = new Map<
    number,
    {
      owners: string[];
      metadataEntry: CollectionEntry;
      primaryEntry?: CollectionEntry;
    }
  >();
  sources.forEach((source) =>
    source.items.forEach((item) => {
      const existing = games.get(item.objectid);
      if (existing) {
        if (source.username === primaryUsername && !existing.primaryEntry)
          existing.primaryEntry = item;
        if (!existing.owners.includes(source.username))
          existing.owners.push(source.username);
      } else {
        games.set(item.objectid, {
          owners: [source.username],
          metadataEntry: item,
          primaryEntry: source.username === primaryUsername ? item : undefined,
        });
      }
    }),
  );
  return games;
};

const getCollectionMessage = (result: UseQueryResult<Collection, Error>) => {
  if (result.error) {
    if (result.error.message === "202 Accepted") return "Queued by BGG";
    return result.error.message;
  }
  if (result.isFetching) return "Loading";
  if (result.data?.items.item.length === 0) return "Empty collection";
  return "";
};

export const useGetCollectionQuery = (
  username: string,
  showExpansions: boolean,
  friendUsernames: string[] = [],
  includeFriends = false,
) => {
  const queryClient = useQueryClient();
  const primary = username.trim();
  const users = primary
    ? [
        primary,
        ...(includeFriends ? normalizeFriends(friendUsernames, primary) : []),
      ]
    : [];
  const requests = users.flatMap((user) => [
    { username: user, expansion: false },
    ...(showExpansions ? [{ username: user, expansion: true }] : []),
  ]);
  const collections = useQueries({
    queries: requests.map((request) => ({
      queryKey: [
        request.expansion
          ? "BggCollectionBoardGameExpansion"
          : "BggCollectionBoardGame",
        request.username,
      ],
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        fetchBggCollection(request.username, request.expansion, signal),
      retry: (count: number, error: Error) =>
        error.message !== "202 Accepted" && count < 3,
    })),
  });
  const merged = mergeCollectionEntries(
    users.map((user) => ({
      username: user,
      items: collections.flatMap((result, index) =>
        requests[index].username === user ? result.data?.items.item || [] : [],
      ),
    })),
    primary,
  );
  const batches = _.chunk([...merged.keys()], 20).map((ids) => ids.join(","));
  const things = useQueries({
    queries: batches.map((ids) => ({
      queryKey: ["BggThings", ids],
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        fetchBggThings(ids, signal),
    })),
  });
  // Reuse fetched details while a changed union is being batched. Only active IDs
  // may contribute cards or ownership, even when old queries remain cached.
  const details = new Map<number, Thing["items"]["item"][number]>();
  const cachedThings = queryClient.getQueriesData<Thing>({
    queryKey: ["BggThings"],
  });
  [
    ...cachedThings.map(([, value]) => value),
    ...things.map((result) => result.data),
  ].forEach((value) =>
    value?.items.item.forEach((thing) => {
      if (merged.has(thing.id)) details.set(thing.id, thing);
    }),
  );
  const data = [...details.values()].map((thing) => {
    const entry = merged.get(thing.id)!;
    const game = transformToBoardGame(thing, entry.metadataEntry);
    return {
      ...game,
      owners: entry.owners,
      // Friend-only games have no rating from the primary user.
      userRating: entry.primaryEntry
        ? transformToUserRating(entry.primaryEntry)
        : "N/A",
    };
  });
  const completed = [...collections, ...things].filter(
    (result) => result.isSuccess,
  ).length;
  const total = collections.length + things.length;
  const unresolved = [...collections, ...things].some(
    (result) => !result.isSuccess || result.isFetching,
  );
  const pubdate = collections[0]?.data?.items.pubdate;
  return {
    data,
    pubdate: pubdate ? new Date(pubdate).toLocaleDateString() : "",
    loadingMessage: unresolved
      ? `(${completed} / ${total}${collections.some((result) => result.isPending) ? "?" : ""})`
      : "",
    statuses: collections
      .map((result, index) => ({
        key: `${requests[index].username}-${requests[index].expansion}`,
        username: requests[index].username,
        kind: requests[index].expansion ? "expansions" : "games",
        message: getCollectionMessage(result),
        retry: result.isError
          ? () => {
              void result.refetch();
            }
          : undefined,
      }))
      .filter((status) => status.message),
    thingErrors: things.flatMap((result, index) =>
      result.isError
        ? [
            {
              key: batches[index],
              message: result.error.message,
              retry: () => {
                void result.refetch();
              },
            },
          ]
        : [],
    ),
  };
};
