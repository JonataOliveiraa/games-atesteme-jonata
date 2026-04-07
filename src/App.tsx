import { Routes, Route } from "react-router-dom";
import Layout from "./layouts/Layout";
import GamesPage from "./pages/GamesPage";
import ResourcesPage from "./pages/ResourcesPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<GamesPage />} />
        <Route path="recursos" element={<ResourcesPage />} />
      </Route>
    </Routes>
  );
}