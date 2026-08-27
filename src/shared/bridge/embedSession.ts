/**
 * ══════════════════════════════════════════════════════════════════════════
 *  O CONTEXTO DA TENTATIVA, NUM LUGAR SÓ
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Quando o site roda dentro da plataforma, cada partida pertence a uma
 * TENTATIVA — um identificador opaco que a plataforma criou e que precisa
 * voltar junto com todo evento, senão o resultado não é creditável.
 *
 * Isto é um módulo com estado, e não um contexto de React, porque quem
 * precisa dessa informação é a camada de saída dos eventos, que roda dentro
 * do Phaser — fora da árvore de componentes. Um `useContext` não alcança lá.
 *
 * Quem escreve aqui é a rota de embed, uma vez, antes de o jogo montar.
 * Ninguém mais escreve, e nenhum jogo lê.
 */

export type EmbedSession = {
  /** Eco exato do parâmetro da URL. Opaco: não interpretamos nada dele. */
  attempt: string;
  /** O `id` do catálogo. */
  gameId: string;
  /** Quantas fases este jogo tem, segundo o catálogo. */
  totalStages: number;
};

let sessao: EmbedSession | null = null;

/**
 * O `GAME_READY` já saiu nesta tentativa?
 *
 * ── POR QUE ISTO PRECISA EXISTIR ─────────────────────────────────────────
 *
 * 44 dos 45 jogos emitem `GAME_READY` dentro do `create()` da cena — e a cena
 * REINICIA a cada nível (`scene.restart`). Então o evento dispara uma vez por
 * FASE, não por partida: três vezes num jogo de três níveis.
 *
 * Do lado de dentro isso nunca incomodou ninguém. Do lado de fora é um
 * problema de verdade, porque `GAME_READY` é o aperto de mão que autoriza o
 * `START_GAME`: quem integrar do jeito óbvio ("recebi READY, mando START")
 * vai mandar um START_GAME no meio da partida, no começo do nível 2, com os
 * pontos iniciais — zerando o que a criança fez.
 *
 * Consertar nos 44 seria mover a emissão para fora do ciclo de vida da cena,
 * um a um, sem conseguir testar. Aqui é uma linha, no lugar por onde todos
 * passam.
 */
let prontoEnviado = false;

export function setEmbedSession(nova: EmbedSession) {
  sessao = nova;
  prontoEnviado = false;
}

/**
 * Devolve `true` só na PRIMEIRA vez em cada tentativa.
 *
 * Fora do embed não há sessão, e aí devolve sempre `true`: a página normal do
 * site continua recebendo um `GAME_READY` por nível, exatamente como sempre
 * recebeu. Mudança de comportamento só onde ela é necessária.
 */
export function primeiroProntoDaTentativa(): boolean {
  if (!sessao) return true;
  if (prontoEnviado) return false;
  prontoEnviado = true;
  return true;
}

export function getEmbedSession(): EmbedSession | null {
  return sessao;
}

export function clearEmbedSession() {
  sessao = null;
  prontoEnviado = false;
}
