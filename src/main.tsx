import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles/global.css";
import { GameProvider } from "./context/GameContext";
import { carregarFonteDoJogo } from "./shared/fonts/gameFont";

/*
 * A fonte dos jogos começa a baixar junto com o site.
 *
 * Quem ESPERA por ela é o `PhaserCanvas`, porque é ele que não pode criar um
 * Phaser antes de a fonte existir. Disparar o download aqui é só para que essa
 * espera já esteja vencida quando alguém abrir um jogo — a promessa é guardada,
 * então a segunda chamada não baixa nada.
 *
 * Isto NÃO muda a aparência do site: nenhum CSS pede DynaPuff. A fonte só vale
 * dentro do canvas dos jogos.
 */
void carregarFonteDoJogo();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <GameProvider>
        <App />
      </GameProvider>
    </BrowserRouter>
  </React.StrictMode>
);