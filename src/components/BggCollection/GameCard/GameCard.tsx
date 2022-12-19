import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Rating from "@mui/material/Rating";
import type { BoardGame } from "..";
import { PlayerCountChart } from "./PlayerCountChart";

type Props = {
  game: BoardGame;
};

// TODO: make cards consistent size (thumbnail height/width, and title ellipsis) (p2)
// TODO: add content-visibility css. https://web.dev/content-visibility/ (p2)
// TODO: format min/max player number to combine if same (p2)

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
          Players: {game.minPlayers} - {game.maxPlayers}
        </div>
        <div>Time: {game.playingTime}</div>
        <div>
          Complexity:{" "}
          <Rating // TODO: style for mobile (p2)
            name="Complexity"
            value={game.averageWeight}
            readOnly
            size="small"
            precision={0.1}
            getLabelText={(value) => `${value} Complexity`}
          />
        </div>
      </div>
      <PlayerCountChart recommendedPlayerCount={game.recommendedPlayerCount} />
    </CardContent>
  </Card>
);
