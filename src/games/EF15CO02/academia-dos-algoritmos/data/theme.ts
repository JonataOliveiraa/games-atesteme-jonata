export const C = {
  ink: 0x1c0f04,
  glass: 0x3d2412,
  wood: 0x8a5a2b,
  darkWood: 0x4a2f14,
  brass: 0xf2b544,
  cream: 0xfff3dc,
  dim: 0xb99a76,
  matte: 0x33200e,
  green: 0x5ec36a,
  coral: 0xff7a6b,
  white: 0xffffff,
  black: 0x000000,
  shadow: 0x000000,
}

export const hex = (n: number) => `#${n.toString(16).padStart(6, '0')}`

/**
 * Toda letra do jogo: branca, com contorno grosso.
 *
 * O contorno é `C.ink` — o quase-preto amarronzado da paleta — e não
 * `C.black`. Preto puro sobre a madeira e o latão desta cena vira um
 * buraco: não pertence a nenhuma das outras cores da tela.
 */
export const TEXT = {
  color: C.white,
  stroke: C.ink,
  thickness: 7,
}

export const ALPHA = {
  /*
   * O cenário é uma ilustração marrom, e a madeira das peças é marrom:
   * sem véu forte as duas viram a mesma poça. O véu subiu, e a faixa do
   * algoritmo ganhou uma chapa própria (`band`) para os ícones pararem
   * de disputar leitura com o desenho de trás.
   */
  veil: 0.72,
  glass: 0.86,
  empty: 0.34,
  shadow: 0.32,
}

export const FONT = {
  black: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
  body: 'DynaPuff, Arial, sans-serif',
}

/** 24px floor: this skill spans years 1 to 5, and the youngest sets the size. */
export const SIZE = {
  request: 32,
  requestMin: 26,
  block: '25px',
  badge: '30px',
  button: '32px',
  notice: '26px',
  help: '32px',
}

export const TIMING = {
  beat: 620,
  flight: 320,
  stuck: 800,
}
