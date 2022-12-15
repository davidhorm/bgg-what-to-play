import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import type { BoardGame } from "./useGetCollectionQuery";

type Props = {
  game: BoardGame;
};

export const GameCard = ({ game }: Props) => (
  <Card>
    <CardMedia
      component="img"
      src={game.thumbnail}
      alt={`${game.name} thumbnail`}
    />
    <CardContent>
      <h2 className="my-0 text-2xl font-normal">{game.name}</h2>
    </CardContent>
  </Card>
);
