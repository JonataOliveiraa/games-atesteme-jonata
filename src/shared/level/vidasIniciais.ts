import type Phaser from "phaser";

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  QUANTOS ERROS A PARTIDA TOLERA
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Um. Errou, ou o tempo acabou, perdeu: o primeiro `lose()` do `createLives`
 * já emite o `GAME_OVER`.
 *
 * ── A DERROTA É DO JOGO, AS VIDAS SÃO DA PLATAFORMA ──────────────────────
 *
 * Este valor já veio de fora, pelo `?lives=` da URL, e era aí que duas coisas
 * diferentes se misturavam: a vida da plataforma (a moeda que desbloqueia um
 * jogo bloqueado) e a tolerância a erro da partida. Com a mistura, o mesmo
 * jogo perdia no 1º erro num lugar e no 3º em outro, conforme quem embutia.
 *
 * Agora a regra é uma só, e mora aqui: os jogos chamam esta função por
 * costume, e ela responde sempre a mesma coisa. O `?lives=` continua aceito
 * na URL — existem iframes escritos com ele — e é ignorado.
 */
const TOLERANCIA_A_ERRO = 1;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function vidasIniciais(_scene: Phaser.Scene, _padrao?: number): number {
  return TOLERANCIA_A_ERRO;
}
