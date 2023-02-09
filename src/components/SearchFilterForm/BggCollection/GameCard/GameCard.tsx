import type { BoardGame, CollectionFilterState } from "@/types";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import { PlayerCountChart } from "./PlayerCountChart";

type Props = {
  game: BoardGame;
  filterState: CollectionFilterState;
};

export const GameCard = ({ game, filterState }: Props) => (
  <Card className="m-2 min-w-[40ch] flex-1 text-center">
    <CardContent>
      <a
        className="block min-w-0 truncate text-2xl font-normal text-black no-underline decoration-1 hover:underline"
        href={`https://boardgamegeek.com/${game.type}/${game.id}`}
      >
        {game.name}
      </a>

      <div className="mt-2 flex justify-between">
        <CardMedia
          className="max-w-32 mx-auto h-auto max-h-32 w-auto"
          component="img"
          src={game.thumbnail}
          alt={`${game.name} thumbnail`}
        />

        <dl className="my-2">
          <dt className="text-xs text-gray-500">Time (minutes)</dt>
          <dd className="ml-0 text-2xl">
            {game.minPlaytime === game.maxPlaytime
              ? `${game.maxPlaytime}`
              : `${game.minPlaytime} - ${game.maxPlaytime}`}
          </dd>

          <dt className="mt-4 text-xs text-gray-500">Complexity</dt>
          <dd className="ml-0 text-2xl">
            {game.averageWeight.toFixed(1)}{" "}
            <span className="text-xs text-gray-500">/ 5</span>
          </dd>
        </dl>
      </div>

      <PlayerCountChart
        recommendedPlayerCount={game.recommendedPlayerCount}
        filterState={filterState}
      />
    </CardContent>
  </Card>
);
