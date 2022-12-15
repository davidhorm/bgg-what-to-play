import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
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
      <Typography variant="h5">{game.name}</Typography>
    </CardContent>
  </Card>
);
