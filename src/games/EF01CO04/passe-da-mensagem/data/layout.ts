export const W = 1280
export const H = 720

export const DEPTH = {
    room: 0,
    furniture: 8,
    person: 20,
    tableTop: 28,
    panel: 60,
    slot: 70,
    card: 80,
    hud: 90,
    flying: 110,
    balloon: 130,
    fx: 150,
    edge: 170,
    overlay: 400,
}

/**
 * TRÊS FAIXAS, e é só isso que existe na tela.
 *
 *   topo    o recado que chegou  →  a mesa que a criança preenche
 *   meio    ela, o colega esperando, e a mesa dele
 *   base    as quatro cartas e o ENVIAR
 *
 * O mesmo formato de Pulo Programado: o que eu monto em cima, o mundo no meio,
 * minhas peças embaixo. Painel nenhum invade a faixa do outro.
 */
export const BOARD = { x: 16, y: 10, w: 1248, h: 180, r: 28 }

export const LEVEL_PILL = { x: 34, y: 22, w: 166, h: 30 }

/** O mural: uma vaga por fase entregue, embaixo da pílula do nível. */
export const MURAL = { cx: [56, 106, 156], cy: 122, size: 42 }

/** O RECADO — o que chegou, sempre em desenho. Até três itens. */
export const NOTE = { labelX: 206, labelY: 36, size: 80, gap: 12, from: 206, cy: 116 }

/** A seta grande entre o recado e a mesa: é ela que diz "isto vira aquilo". */
export const ARROW = { x: 524, y: 116 }

/** A MESA — os quadrados que a criança preenche, na linguagem da fase. */
export const DESK = { labelX: 764, labelY: 36, size: 96, gap: 18, cx: 764, cy: 116 }

/** O selo da linguagem, ao lado da mesa. Diz de novo, em desenho, o que pedir. */
export const SEAL = { x: 1062, y: 116, size: 92 }

export const HELP = { x: 1210, y: 106, r: 30 }

// ─────────────────────────────────────────────────── o meio: a sala

export const ROOM = { top: 200, bottom: 502 }

/** A linha do chão. Os dois personagens PISAM nela. */
export const FLOOR = { y: 470 }

/**
 * Os pés do personagem ficam em 98 % da altura do quadro — medido no PNG. Por
 * isso o centro dele mora a 48 % da altura acima do ponto do chão.
 */
export const PERSON = { h: 158, footRatio: 0.48, ratio: 400 / 500 }

export const SENDER = { x: 140 }
export const RECEIVER = { x: 892 }

/** A bancada do colega: é aqui que o recado dele vira objeto de novo. */
export const TABLE = { x: 976, w: 280, top: 424, cy: 388, slot: 74, gap: 12 }

// ─────────────────────────────────────────────────── a base: as cartas

export const TRAY = { x: 16, y: 512, w: 1248, h: 196, r: 28 }

/** Quatro cartas, sempre nas mesmas posições — a criança decora onde estão. */
export const CARD = { w: 172, h: 152, cy: 610, cx: [180, 374, 568, 762] }

export const SEND = { x: 1060, y: 610, r: 88 }

export const BALLOON = { x: 640, y: 330, w: 560 }
