export const W = 1280
export const H = 720

export const HUD = {
  x: 16,
  y: 10,
  w: W - 32,
  h: 72,
  pillX: 40,
  pillY: 28,
  pillW: 132,
  pillH: 40,
  phaseX: 190,
  titleX: 620,
  cy: 46,
  helpX: 1226,
  helpR: 26,
}

export const BOARD = {
  x: 24,
  y: 94,
  w: 936,
  h: 612,
  r: 30,
  cx: 492,
  headerH: 52,
}

export const OP = {
  cx: 1120,
  y: 556,
  maxW: 250,
  maxH: 300,

  /**
   * Onde o Vico para em cada rodada. Ele salta de um para o outro.
   *
   * O passeio é curto de propósito, e o motivo é técnico: o balão e o brilho
   * de foco do diálogo são desenhados em `OP.cx`/`OP.y` FIXOS, não colados
   * nele. Sair muito daqui descola o personagem do próprio balão. A coluna
   * dele também só tem 320px (o tabuleiro vai até 960) e ele ocupa 250 —
   * sobra pouco chão para andar.
   *
   * Se quiser um deslocamento maior, o caminho é o balão seguir o boneco, e
   * não a lista crescer.
   */
  spots: [
    { x: 1120, y: 556 },
    { x: 1084, y: 530 },
    { x: 1152, y: 572 },
  ],
  /** Altura do salto entre um ponto e outro. */
  hopH: 54,
  bubbleY: 196,
  bubbleW: 288,
  bubbleMinH: 108,
  bubbleMaxH: 196,
  btnY: 348,
  btnW: 258,
  btnH: 82,
}

export const DIALOG = {
  x: 566,
  y: 340,
  w: 740,
  minH: 190,
  maxH: 320,
  wrap: 648,
  r: 30,
  btnW: 244,
  btnH: 74,
  btnGap: 54,
  opGrow: 1.14,
}

export const COMPUTER = {
  cx: BOARD.cx,
  sortY: 356,
  pickY: 320,
  /** Acompanha o `RAIL.cy`: o computador fica na mesma linha dos encaixes. */
  chainY: 372,
  maxW: 300,
  maxH: 160,
  chainMaxW: 320,
  chainMaxH: 176,
  screen: { fx: 0.39125, fy: 0.42889, fw: 0.6725, fh: 0.64889 },
  /*
   * Os plugues encostam na BORDA de baixo (fy 1), não a 90% da altura.
   *
   * Com 0.9 o ponto ficava dentro da carcaça, e o cabo tinha que subir por
   * cima do desenho para chegar nele. Na borda, ele encosta vindo de fora — a
   * barriga do fio (`sag` positivo) passa por baixo da máquina.
   */
  plugIn: { fx: 0.04, fy: 1 },
  plugOut: { fx: 0.96, fy: 1 },
  plugDown: { fx: 0.5, fy: 1 },
}

/**
 * As duas portas do Nível 1.
 *
 * O rótulo mora DENTRO da faixa colorida do botão, e não solto acima dele:
 * assim a porta lê como um aparelho com plaqueta, e não como um retângulo com
 * uma legenda ao lado. A antiga linha de apoio ("vai para dentro" / "vem para
 * fora") saiu — quem diz a direção agora são as setas que andam.
 */
export const PORTS = {
  cy: 578,
  w: 340,
  h: 180,
  r: 28,
  gap: 90,
  /** Faixa colorida do topo, onde fica o rótulo. */
  bandH: 64,
  labelDY: -58,
  /** Centro do fluxo de setas, na área clara do botão. */
  flowY: 30,
  chevW: 74,
  chevThick: 15,
  chevGap: 26,
  plugDY: -90,
}

export const SORT_CARD = {
  cx: BOARD.cx,
  cy: 200,
  w: 340,
  h: 128,
  r: 26,
  iconX: -104,
  iconSize: 92,
  labelX: -34,
}

export const TASK = {
  cx: BOARD.cx,
  cy: 176,
  w: 872,
  h: 108,
  r: 26,
  iconX: -368,
  iconSize: 76,
  titleX: -300,
  titleDY: -20,
  textDY: 22,
}

export const RAIL = {
  /*
   * Descido de 330 para 372.
   *
   * O rótulo ENTRADA/SAÍDA mora 120px acima do centro do encaixe, ou seja em
   * y=210 na altura antiga — dentro do cartão de pedido, que ocupa de 122 a
   * 230. As duas palavras caíam em cima do texto do pedido. Com 372 o rótulo
   * vai para 252 e sobra folga de 22px abaixo do cartão.
   */
  cy: 372,
  slotW: 208,
  slotH: 208,
  r: 28,
  offsetX: 306,
  labelDY: -120,
  arrowW: 46,
  arrowH: 34,
}

export const BANK = {
  cx: BOARD.cx,
  singleY: 596,
  soloY: 592,
  maxW: 872,
  cardW: 194,
  cardH: 176,
  gap: 20,
  r: 24,
  iconDY: -16,
  labelDY: 60,
}

export const PACKET = {
  r: 26,
  travelMs: 720,
  arcH: 62,
}

export const TOAST = {
  y: 648,
  w: 720,
  h: 74,
  r: 22,
}