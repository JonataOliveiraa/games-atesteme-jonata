import { useParams } from "react-router-dom";
import GameDetailsPage from "./GameDetailsPage";

export default function GameDetailsPageRoute() {
  const { slug } = useParams<{ slug: string }>();

  return <GameDetailsPage key={slug ?? "game-details"} />;
}