import type Phaser from "phaser";

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  EM QUE FASE ESTE JOGO DEVE COMEÇAR
 * ══════════════════════════════════════════════════════════════════════════
 *
 * A plataforma manda `?stage=2` na URL quando quer abrir o jogo direto na
 * fase 2. Essa informação precisa chegar ao `BootScene` — que é quem decide
 * com que dados a `GameScene` nasce.
 *
 * ── POR QUE PELO REGISTRY, E NÃO POR UM COMANDO ──────────────────────────
 *
 * O caminho óbvio seria o `START_GAME`, que já carrega `stage`. Só que ele
 * chega DEPOIS de o jogo bootar: a cena já nasceu na fase 1, já montou o
 * tabuleiro e já emitiu `GAME_READY`. Para obedecer, o jogo teria que se
 * reiniciar na frente da criança.
 *
 * O `registry` do Phaser é preenchido no `preBoot`, antes de qualquer cena
 * existir. Quando o `BootScene` roda, o valor já está lá.
 *
 * ── FORA DO EMBED NÃO EXISTE VALOR, E O PADRÃO VALE ──────────────────────
 *
 * Na página normal do site ninguém escreve no registry, então todo jogo
 * continua começando onde sempre começou. É por isso que o padrão é
 * argumento: cada jogo passa o que já usava.
 */
export function faseInicial(scene: Phaser.Scene, padrao = 1): number {
  const bruto = scene.game.registry.get("faseInicial");
  const n = Number(bruto);

  // 1, 2 ou 3 — qualquer outra coisa é lixo de URL e cai no padrão
  return Number.isInteger(n) && n >= 1 && n <= 3 ? n : padrao;
}

/** A mesma coisa em base zero, para os jogos que indexam a lista direto. */
export function indiceInicial(scene: Phaser.Scene, padrao = 0): number {
  const bruto = scene.game.registry.get("faseInicial");
  const n = Number(bruto);
  return Number.isInteger(n) && n >= 1 && n <= 3 ? n - 1 : padrao;
}
