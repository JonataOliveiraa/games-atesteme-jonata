import type Phaser from "phaser";

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  O JOGO QUE ESTÁ NA TELA, E QUEM PODE PARÁ-LO
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Duas coisas que nenhum dos 87 jogos fazia sozinho:
 *
 *  1. OBEDECER `PAUSE_GAME` / `RESUME_GAME`. Metade tratava o comando, metade
 *     ignorava — e os que ignoravam seguiam com relógio e animação rodando
 *     atrás do modal da plataforma.
 *  2. PARAR NO `GAME_OVER`. O jogo avisava a plataforma e continuava jogável:
 *     dava para seguir respondendo, apertar "Tentar de novo" e até chegar a um
 *     `GAME_COMPLETED` depois de ter perdido.
 *
 * Os dois moram aqui, e não em cada jogo, pelo mesmo motivo do
 * `createLives`: 87 cópias da mesma regra são 87 chances de errar.
 *
 * ── PAUSAR É PARAR O LOOP INTEIRO ────────────────────────────────────────
 *
 * `game.pause()` desliga o passo do Phaser: cenas, relógios, animações e o
 * desenho. `input.enabled = false` corta mouse e toque na origem (os
 * gerenciadores conferem esse campo antes de repassar qualquer evento). Isso
 * vale para qualquer jogo, trate ele o comando ou não — e os que tratam
 * continuam tratando, sem conflito.
 *
 * ── PERDEU, NÃO VOLTA ────────────────────────────────────────────────────
 *
 * Depois do `GAME_OVER`, o toque some NA HORA (senão a criança erra de novo
 * enquanto o jogo ainda mostra o erro) e o loop para um pouco depois, para o
 * som e a tremida do erro terminarem de tocar. Nenhum `RESUME_GAME` religa
 * uma partida encerrada: destravar é trocar de partida, e uma partida nova é
 * um jogo novo.
 *
 * ── O ERRO FICA NA TELA ANTES DE ALGUÉM COBRI-LO ─────────────────────────
 *
 * O `GAME_OVER` sai na hora — o resultado não espera, senão fechar a aba no
 * meio da espera apagaria a derrota. O que espera é a TELA: o jogo segue
 * animando por `ESPERA_PARA_VER_O_ERRO_MS`, e quem hospeda usa o mesmo número
 * antes de pôr o "Fim de jogo" por cima (`EmbedGamePage`) ou abrir o modal
 * (`GameDetailsPage`). Um número só, para o congelamento e a cobertura
 * caírem no mesmo instante.
 */

export const ESPERA_PARA_VER_O_ERRO_MS = 1350;

let ativo: Phaser.Game | null = null;
let encerrada = false;

const pronto = (game: Phaser.Game | null): game is Phaser.Game =>
  !!game && game.isBooted;

function congelar(game: Phaser.Game) {
  game.input.enabled = false;
  game.sound?.pauseAll();
  game.pause();
}

/** Chame ao criar o jogo. Devolve quem desfaz, para o desmontar do componente. */
export function registrarJogoAtivo(game: Phaser.Game): () => void {
  ativo = game;
  encerrada = false;
  return () => {
    if (ativo === game) ativo = null;
  };
}

export function pausarJogo(): void {
  if (!pronto(ativo)) return;
  congelar(ativo);
}

export function retomarJogo(): void {
  if (encerrada || !pronto(ativo)) return;
  ativo.input.enabled = true;
  ativo.sound?.resumeAll();
  ativo.resume();
}

export function partidaEncerrada(): boolean {
  return encerrada;
}

/** Chamado pelo `runtimeGameBridge` quando o jogo emite `GAME_OVER`. */
export function encerrarPartida(): void {
  if (encerrada) return;
  encerrada = true;
  if (!pronto(ativo)) return;

  const game = ativo;
  game.input.enabled = false;

  window.setTimeout(() => {
    if (ativo === game && pronto(game)) congelar(game);
  }, ESPERA_PARA_VER_O_ERRO_MS);
}
