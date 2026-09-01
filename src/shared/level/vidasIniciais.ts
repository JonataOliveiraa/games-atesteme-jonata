import type Phaser from "phaser";

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  COM QUANTAS VIDAS ESTA PARTIDA COMEÇA
 * ══════════════════════════════════════════════════════════════════════════
 *
 * A plataforma manda `?lives=3` na URL. O valor chega aqui pelo `registry` do
 * Phaser, escrito no `preBoot` — o mesmo caminho do `faseInicial`, e pela mesma
 * razão: o `START_GAME` chega DEPOIS de o jogo bootar, com a cena já montada.
 * Um jogo que só descobrisse as vidas ali teria que se reiniciar na frente da
 * criança para desenhar a quantidade certa de corações.
 *
 * ── AS VIDAS VALEM PELA PARTIDA, NÃO PELO NÍVEL ──────────────────────────
 *
 * Este valor é o do COMEÇO. Ao trocar de nível o saldo viaja no
 * `scene.restart({ lives })`, como o `points` já faz — quem chama esta função
 * é só o primeiro nível.
 *
 * ── `lives=0` NÃO REPROVA ANTES DE COMEÇAR ───────────────────────────────
 *
 * Zero vidas significaria uma partida perdida antes do primeiro toque, o que
 * nunca é o que se quis dizer. Vira 1 — "errou, perdeu" — e o caso fica
 * registrado no console, porque quase sempre é engano de quem montou a URL.
 */
export function vidasIniciais(scene: Phaser.Scene, padrao = 3): number {
  const bruto = scene.game.registry.get("vidasIniciais");

  // fora do embed ninguém escreve no registry, e o padrão do jogo vale
  if (bruto === undefined || bruto === null) return padrao;

  const n = Number(bruto);
  if (!Number.isInteger(n) || n < 0) {
    console.warn(`[vidas] valor inválido na query: ${String(bruto)} — usando ${padrao}`);
    return padrao;
  }

  if (n === 0) {
    console.warn("[vidas] lives=0 reprovaria antes do primeiro toque — usando 1");
    return 1;
  }

  return n;
}
