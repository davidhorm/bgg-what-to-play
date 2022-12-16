import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import type { BoardGame } from "./useGetCollectionQuery";

type Props = {
  game: BoardGame;
};

export const GameCard = ({ game }: Props) => (
  <Card className="m-2 w-64 flex-auto text-center">
    <CardMedia
      className="mx-auto w-32"
      component="img"
      src={game.thumbnail}
      alt={`${game.name} thumbnail`}
    />
    <CardContent>
      <h2 className="my-0 text-2xl font-normal">{game.name}</h2>
      <div className="flex justify-between">
        <div>
          Players: {game.minplayers} - {game.maxplayers}
        </div>
        <div>Time: {game.playingtime}</div>
      </div>
    </CardContent>
  </Card>
);
