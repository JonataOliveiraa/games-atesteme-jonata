/**
 * ══════════════════════════════════════════════════════════════════════════
 *  ONDE CADA COISA FICA
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Tela 1280x720 fixa, escalada por `Scale.FIT`. Todo número tem um porquê
 * escrito ao lado.
 *
 * ── DUAS COLUNAS ─────────────────────────────────────────────────────────
 *
 *   BANCADA (esquerda, 900px)   tudo que é jogável
 *   COLUNA  (direita, 312px)    o treinador, a fala dele e o botão
 *
 * ── OS QUATRO ANDARES DA BANCADA ─────────────────────────────────────────
 *
 *   CENA        os objetos e o estado de cada um
 *   AVISO       a frase do que travou — FORA da cena
 *   TRILHA      o algoritmo, com setas entre os passos
 *   PRATELEIRA  os blocos disponíveis
 *
 * O aviso já morou dentro da cena e cobria os objetos justamente quando a
 * criança mais precisava vê-los: ela lia "a escova está sem pasta" com a
 * escova escondida atrás da própria frase. Agora ele tem linha própria.
 *
 * ── TRILHA E PRATELEIRA NÃO PODEM PARECER A MESMA COISA ──────────────────
 *
 * Na primeira versão eram duas fileiras iguais de caixas marrons, e nada
 * dizia qual era qual. Agora:
 *
 *   · a trilha tem SETAS entre os espaços — uma fila de caixas com setas lê
 *     como "isto acontece nesta ordem", que é exatamente o que ela é;
 *   · a trilha é ESCAVADA (buraco escuro afundado); a prateleira é ELEVADA
 *     (cartão claro com sombra embaixo). Um convida a encaixar, o outro a
 *     pegar;
 *   · só a trilha tem número.
 */

export const W = 1280
export const H = 720

/** Só o nível e o progresso. O pedido é do treinador, e mora no balão dele. */
export const HUD = {
  x: 0,
  y: 0,
  w: W,
  h: 68,
  acento: 3,

  nivel: { x: 28, cy: 24 },
  bolinha: { r: 8, gap: 26, y: 48, x: 36 },
  ajuda: { cx: 1226, cy: 34, r: 30 },
}

export const BANCADA = {
  x: 24,
  y: HUD.h + 12,
  w: 900,
  h: 620,
  raio: 28,
  pad: 20,
}

/**
 * A CENA — os objetos do problema, e o estado de cada um.
 *
 * Eles NÃO são enfeite. Cada um mostra, embaixo de si, o que já é verdade
 * sobre ele: "sem pasta", "na mão", "aberta". É o painel que a criança lê para
 * entender por que um passo travou.
 */
export const CENA = {
  x: BANCADA.x + BANCADA.pad,
  y: BANCADA.y + BANCADA.pad,
  w: BANCADA.w - BANCADA.pad * 2,
  h: 214,
  raio: 20,

  /** A arte do objeto, e a faixa de estado logo abaixo. */
  objeto: { tamanho: 118, gap: 60, cy: BANCADA.y + BANCADA.pad + 88 },
  estado: { dy: 82, h: 34, raio: 14, w: 168 },

  /** Onde a ação acontece: o objeto sobe para cá e volta. */
  foco: { dy: -28 },
}

/**
 * O AVISO — a frase do que travou, em linha própria.
 *
 * Sempre no mesmo lugar, sempre com a mesma altura. Ele não empurra nada e não
 * cobre nada: uma tela que se reorganiza no erro faz a criança perder o ponto
 * onde estava olhando.
 */
export const AVISO = {
  cx: BANCADA.x + BANCADA.w / 2,
  cy: CENA.y + CENA.h + 36,
  w: BANCADA.w - BANCADA.pad * 2,
  h: 54,
  raio: 16,
}

/**
 * A TRILHA — os espaços do algoritmo, ligados por setas.
 *
 * Três espaços no Nível 1. O quarto só entra quando o caso precisar, e quatro
 * é o teto: acima disso o alvo de toque encolhe demais para um dedo de criança.
 */
export const TRILHA = {
  cy: 452,
  larguraEspaco: 178,
  alturaEspaco: 108,
  gap: 46,
  raio: 18,

  /** O número do passo, na quina de cima à esquerda. */
  numero: { dx: -74, dy: -38, r: 20 },

  /** A seta entre um espaço e o seguinte. Mora no vão do `gap`. */
  seta: { largura: 26, altura: 20 },

  /**
   * A cabeça de leitura: o ponto de luz que percorre a trilha ao executar.
   *
   * É a peça central da animação — ela transforma "o algoritmo rodou" em algo
   * que se vê acontecendo, passo a passo. Quando trava, ela PARA em cima do
   * espaço culpado: a depuração vira imagem em vez de texto.
   */
  cabeca: { r: 14, dy: -74 },
}

/**
 * A PRATELEIRA — os blocos disponíveis.
 *
 * Cartões elevados sobre uma tábua, para ler como "coisas que dá para pegar".
 * Três ou quatro, nunca uma paleta.
 */
export const PRATELEIRA = {
  cy: 594,
  /** A tábua atrás dos cartões. */
  tabua: { y: 640, h: 14 },

  largura: 192,
  altura: 112,
  gap: 26,
  raio: 18,
  icone: { dy: -24, tamanho: 52 },
  rotulo: { dy: 34 },
}

/**
 * A COLUNA DO TREINADOR — fala, botão e personagem, nesta ordem.
 *
 * O botão fica JUNTO de quem pede a coisa, e não solto no rodapé: quem manda
 * executar é o treinador, e a tela diz isso pela posição.
 */
export const COLUNA = {
  cx: 1100,
  x: 944,
  w: 312,

  balao: { cy: 168, w: 300, hMin: 116, hMax: 196, raio: 24 },
  botao: { cy: 340, w: 280, h: 82, raio: 41 },
  treinador: { cy: 550, w: 280, h: 300 },
}
