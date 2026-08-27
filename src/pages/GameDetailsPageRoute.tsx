import { useParams } from "react-router-dom";
import EmbedGamePage from "./EmbedGamePage";

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  `/jogos/:slug` — O JOGO E NADA MAIS
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Esta rota é SÓ O CANVAS. Sem cabeçalho, sem menu, sem título, sem
 * pontuação, sem botão de voltar. Ela existe para ser o `src` de um iframe —
 * o nosso, em `/iframe/:slug`, e o da Atesteme, em produção.
 *
 * ── ANTES ERA UMA ROTA COM DOIS ROSTOS ───────────────────────────────────
 *
 * Até agosto/2026 este arquivo escolhia entre a página completa e a página
 * embutida, olhando `?embed=1`. Um endereço com dois comportamentos é fácil
 * de escrever e difícil de confiar: "abri o link e veio diferente" vira uma
 * investigação toda vez, e quem integra nunca sabe se está vendo o que o
 * outro lado vai ver.
 *
 * Agora são dois endereços com um comportamento cada:
 *
 *   /jogos/<slug>    o jogo, sempre igual, para embutir
 *   /iframe/<slug>   a plataforma de jogos, que embute o de cima
 *
 * A query continua trazendo o CONTEXTO da partida (`stage`, `points`,
 * `lives`, `id`/`attempt`, `returnBase`, `inline`) — ela ajusta a partida,
 * não troca a página.
 */
export default function GameDetailsPageRoute() {
  const { slug } = useParams<{ slug: string }>();

  return <EmbedGamePage key={slug ?? "jogo"} />;
}
