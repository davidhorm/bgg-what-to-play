import { useFilterState } from "@/components/ServiceProvider";
import type { BoardGame } from "@/types";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import { PlayerCountChart } from "./PlayerCountChart";

type Props = {
  game: BoardGame;
};

export const GameCard = ({ game }: Props) => {
  const {
    filterState: { showRatings },
  } = useFilterState();
  return (
    <Card>
      <CardContent>
        <a
          className="block min-w-0 truncate text-2xl font-normal text-black no-underline decoration-1 hover:underline"
          href={`https://boardgamegeek.com/${game.type}/${game.id}`}
        >
          {game.name}
        </a>

        <div className="mt-2 flex justify-between">
          <CardMedia
            className="max-h-40 min-w-fit object-contain p-4"
            component="img"
            src={game.thumbnail}
            alt={`${game.name} thumbnail`}
          />

          <dl className="my-2 min-w-fit">
            {showRatings === "USER_RATING" && (
              <>
                <dt className="text-xs text-gray-500">User Rating</dt>
                <dd className="mb-2 ml-0 text-2xl">
                  {game.userRating}{" "}
                  {game.userRating !== "N/A" && (
                    <span className="text-xs text-gray-500">/ 10</span>
                  )}
                </dd>
              </>
            )}

            {showRatings === "AVERAGE_RATING" && (
              <>
                <dt className="text-xs text-gray-500">Average Rating</dt>
                <dd className="mb-2 ml-0 text-2xl">
                  {game.averageRating}{" "}
                  <span className="text-xs text-gray-500">/ 10</span>
                </dd>
              </>
            )}

            <dt className="text-xs text-gray-500">Time (minutes)</dt>
            <dd className="mb-2 ml-0 text-2xl">
              {game.minPlaytime === game.maxPlaytime
                ? game.maxPlaytime === 0
                  ? "N/A"
                  : `${game.maxPlaytime}`
                : `${game.minPlaytime} - ${game.maxPlaytime}`}
            </dd>

            <dt className="text-xs text-gray-500">Complexity</dt>
            <dd className="ml-0 text-2xl">
              {game.averageWeight === 0 ? (
                "N/A"
              ) : (
                <>
                  {game.averageWeight}{" "}
                  <span className="text-xs text-gray-500">/ 5</span>
                </>
              )}
            </dd>
          </dl>
        </div>

        <PlayerCountChart
          gameId={game.id}
          recommendedPlayerCount={game.recommendedPlayerCount}
        />
      </CardContent>
    </Card>
  );
};
