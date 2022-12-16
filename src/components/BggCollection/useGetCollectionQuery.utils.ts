import type { CollectionItem, ThingItem, Name } from "./bggTypes";

export const transformToThingIds = (i: CollectionItem) =>
  parseInt(i.objectid, 10);

const getPrimaryName = (name: Name | Name[]) => {
  const primaryName = Array.isArray(name)
    ? name.filter((n) => n.type === "primary")[0]
    : name;
  return primaryName.value;
};

export const transformToBoardGame = (i: ThingItem) => ({
  name: getPrimaryName(i.name),
  id: i.id,
  thumbnail: i.thumbnail,
  minplayers: i.minplayers.value,
  maxplayers: i.maxplayers.value,
  playingtime: i.playingtime.value,
  suggested_numplayers: i.poll.filter(
    (p) => p.name === "suggested_numplayers"
  )[0],
});

export type BoardGame = ReturnType<typeof transformToBoardGame>;
