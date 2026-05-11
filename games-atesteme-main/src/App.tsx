import { Routes, Route } from "react-router-dom";
import Layout from "./layouts/Layout";
import GamesPage from "./pages/GamesPage";
import ResourcesPage from "./pages/ResourcesPage";
import RankingPage from "./pages/RankingPage";
import GameDetailsPageRoute from "./pages/GameDetailsPageRoute";
import GameStandalone from "./pages/GameStandalone";

export default function App() {
  return (
    <Routes>
      <Route path="/games/base-dos-classificadores" element={<GameStandalone />} />

      <Route path="/" element={<Layout />}>
        <Route index element={<GamesPage />} />
        <Route path="recursos" element={<ResourcesPage />} />
        <Route path="ranking" element={<RankingPage />} />
        <Route path="jogos/:slug" element={<GameDetailsPageRoute />} />
      </Route>
    </Routes>
  );
}