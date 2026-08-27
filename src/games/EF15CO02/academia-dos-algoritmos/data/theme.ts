/**
 * ══════════════════════════════════════════════════════════════════════════
 *  AS CORES DA ACADEMIA
 * ══════════════════════════════════════════════════════════════════════════
 *
 * O cenário é uma academia de treino: madeira, latão e luz quente.
 *
 * ── A REGRA DA LETRA, E ELA NÃO TEM EXCEÇÃO ──────────────────────────────
 *
 * TODA letra deste jogo é BRANCA com CONTORNO PRETO grosso.
 *
 * Não é preferência. A versão anterior escolhia a cor da letra pelo fundo —
 * letra escura sobre botão âmbar —, e o resultado foi um EXECUTAR que sumia
 * dentro do próprio botão. Contraste calculado caso a caso falha sempre em
 * algum lugar; branco com contorno preto se lê sobre madeira, sobre âmbar,
 * sobre foto de academia e sobre coral.
 *
 * Use `LETRA` em todo texto. Se algum lugar parecer precisar de outra cor de
 * letra, a resposta é mudar o FUNDO, não a letra.
 */
export const C = {
  /** O contorno de toda letra, e o véu sobre o cenário. */
  ink: 0x1c0f04,
  /** A placa translúcida atrás das coisas. */
  vidro: 0x3d2412,

  /** A madeira do móvel: a bancada, a prateleira. */
  madeira: 0x8a5a2b,
  madeiraEscura: 0x4a2f14,
  /** A luz da academia: molduras, o espaço da vez, o botão aceso. */
  latao: 0xf2b544,
  /** Um creme quente, para placas claras. Nunca para letra. */
  creme: 0xfff3dc,
  /** Rótulo secundário, e o espaço ainda vazio. */
  dim: 0xb99a76,
  /** O miolo do espaço vazio, e o bloco desligado. */
  fosco: 0x33200e,

  // ── as duas cores com significado ────────────────────────────────────
  /** Deu certo: o passo rodou, o caso fechou. */
  verde: 0x5ec36a,
  /** Travou aqui: o passo que a criança precisa olhar. */
  coral: 0xff7a6b,

  branco: 0xffffff,
  preto: 0x000000,
  sombra: 0x000000,
}

export const hex = (n: number) => `#${n.toString(16).padStart(6, '0')}`

/**
 * O ESTILO DE TODA LETRA DO JOGO.
 *
 * Branca, contorno preto grosso. Ver a explicação lá em cima — e, se der
 * vontade de abrir uma exceção, a resposta é trocar o fundo.
 */
export const LETRA = {
  cor: C.branco,
  contorno: C.preto,
  /** Grosso mesmo: é o que faz a letra sobreviver a uma foto atrás dela. */
  grossura: 7,
}

export const A = {
  /** O véu que faz o cenário virar fundo. É aqui que se mexe se a cena
   *  estiver berrante ou apagada — não no blur. */
  veu: 0.58,
  /** A placa de vidro atrás dos painéis. */
  vidro: 0.86,
  /** O espaço da trilha ainda vazio. */
  vazio: 0.4,
  sombra: 0.32,
}

export const FONT = {
  black: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
  body: 'DynaPuff, Arial, sans-serif',
}

/**
 * ESTA TELA É JOGADA POR UMA CRIANÇA DE SETE ANOS, MUITAS VEZES NO CELULAR.
 *
 * É a habilidade mais transversal do catálogo — vale do 1º ao 5º ano —, então
 * o piso é o do menor: nada abaixo de 24px.
 */
export const SIZE = {
  /** O pedido do treinador: a única frase feita para ler. */
  pedido: 32,
  pedidoMin: 26,
  /** O rótulo do bloco, dentro dele. */
  bloco: '25px',
  /** O número do espaço da trilha. */
  numero: '30px',
  botao: '32px',
  /** A faixa de estado embaixo de cada objeto. */
  estado: '24px',
  /** A frase que explica o que travou. */
  aviso: '26px',
  ajuda: '32px',
}

/** Quanto tempo cada batida da execução fica na tela. */
export const RITMO = {
  /** Uma batida: acende o espaço, o objeto age. */
  batida: 620,
  /** O voo de um bloco da prateleira até a trilha. */
  voo: 320,
  /** A pausa em cima do passo que travou, antes de explicar. */
  travou: 800,
}
