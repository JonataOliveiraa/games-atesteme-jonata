import { Routes, Route } from "react-router-dom";
import Layout from "./layouts/Layout";
import GamesPage from "./pages/GamesPage";
import ResourcesPage from "./pages/ResourcesPage";
import RankingPage from "./pages/RankingPage";
import GameDetailsPageRoute from "./pages/GameDetailsPageRoute";
import GameDetailsPage from "./pages/GameDetailsPage";
import GameStandalone from "./pages/GameStandalone";
import EmbedReturnPage from "./pages/EmbedReturnPage";
import EventMonitor from "./platform/components/EventMonitor";

export default function App() {
  return (
    <>
      {/*
        Fora do `Routes` de propósito: o monitor precisa sobreviver à troca de
        página, senão a lista se perde justamente quando alguém navega para
        investigar. Ele decide sozinho se aparece (tecla Y, e só na janela de
        cima) — ver `EventMonitor`.
      */}
      <EventMonitor />

      <Routes>
      <Route path="/games/base-dos-classificadores" element={<GameStandalone />} />

      {/*
        O retorno da partida, fora do `Layout` — estas telas não têm cabeçalho
        nem menu, do mesmo jeito que o modo embed não tem.

        São SIMULAÇÃO das rotas da Atesteme, e existem só porque os testes
        locais mandam `returnBase` apontando para este site. Ver a docstring de
        `EmbedReturnPage`.
      */}
      <Route path="/approve" element={<EmbedReturnPage resultado="approve" />} />
      <Route path="/reprove" element={<EmbedReturnPage resultado="reprove" />} />

      {/*
        `/jogos/:slug` fica FORA do `Layout` — é só o canvas do jogo, feito
        para ser o `src` de um iframe. Dentro do `Layout` ele herdaria
        cabeçalho e menu, que é exatamente o que não pode aparecer.
      */}
      <Route path="/jogos/:slug" element={<GameDetailsPageRoute />} />

      <Route path="/" element={<Layout />}>
        <Route index element={<GamesPage />} />
        <Route path="recursos" element={<ResourcesPage />} />
        <Route path="ranking" element={<RankingPage />} />

        {/*
          A página da plataforma: pontos, vidas, modais e o jogo desenhado
          num iframe apontado para `/jogos/:slug`. É para cá que a lista de
          jogos manda quem clica num card.
        */}
        <Route path="iframe/:slug" element={<GameDetailsPage />} />
      </Route>
      </Routes>
    </>
  );
}
