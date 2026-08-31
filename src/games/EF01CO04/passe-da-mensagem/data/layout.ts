export const W = 1280
export const H = 720

export const DEPTH = {
    field: 0,
    line: 4,
    lane: 8,
    shadow: 12,
    player: 20,
    plaque: 30,
    ball: 40,
    robot: 50,
    panel: 60,
    hud: 70,
    balloon: 90,
    fx: 110,
    edge: 130,
    mural: 300,
    overlay: 400,
}

/** O painel do topo: nível e fases à esquerda, o RECADO no meio, `?` na ponta. */
export const PANEL = { x: 16, y: 10, w: 1248, h: 152, r: 28 }

export const LEVEL_PILL = { x: 36, y: 26, w: 172, h: 36 }

export const PHASE_PIPS = { cx: 122, y: 84, gap: 28, r: 8 }

/**
 * O RECADO, grande, no centro do painel. Ele mostra o SIGNIFICADO — o desenho
 * e a frase —, e nunca a linguagem de agora: se o topo estivesse escrito em
 * palavra, a criança que ainda nao le nao teria como saber o que mandar.
 */
export const HEADER_CARD = { x: 470, y: 86, size: 116 }

export const HEADER_TEXT = { x: 556, y: 86, w: 560 }

export const HELP = { x: 1210, y: 86, r: 30 }

/**
 * A faixa de instrucao, sempre na tela. Uma frase curta que nao muda e o que
 * responde "o que eu faco aqui" sem a crianca ter que lembrar do tutorial.
 */
export const HINT = { x: 640, y: 186, w: 640, h: 46 }

/** A quadra ocupa tudo o que sobra e NÃO rola: comparar exige ver tudo junto. */
export const COURT = { top: 218, bottom: 716, x: 24, w: 1232, r: 34 }

/**
 * Os pés do personagem ficam em 98 % da altura do quadro — medido no PNG. Por
 * isso o centro dele mora a 48 % da altura acima do ponto do chao: assim ele
 * PISA na quadra em vez de flutuar.
 */
export const PLAYER = { h: 158, footRatio: 0.48, ratio: 400 / 500 }

/**
 * A plaquinha fica ao lado de quem a segura, e tem um BICO apontando para ele:
 * sem o bico ela flutua, e cartao flutuando nao tem dono — a crianca nao lia
 * "este colega esta dizendo isto".
 */
export const PLAQUE = { size: 132, dx: 96, dy: -104 }

/**
 * A bola e SO uma bola: ela marca quem esta com o recado, e nao mostra
 * conteudo nenhum. Antes ela carregava um cartao, e a tela ficava com duas
 * cartas diferentes ao mesmo tempo — a do topo e a da bola — sem nada dizendo
 * qual era qual. Tres papeis, tres aparencias: o topo diz O QUE mandar, a
 * bola diz ONDE ele esta, as plaquinhas dizem COMO cada um falaria.
 */
export const BALL = { r: 46, dx: -96, dy: -104 }

export const DESTINATION = { x: 1160, y: 530, size: 132 }

/**
 * Onde cada colega pisa, por quantidade. Duas fileiras só: com plaquinha ao
 * lado, cada um ocupa uns 240 x 190, e mais fileiras encostariam uma coisa na
 * outra — o que estraga justamente a comparação que o jogo pede.
 */
export const SLOTS: Record<number, Array<[number, number]>> = {
    3: [[270, 440], [620, 700], [960, 440]],
    4: [[270, 440], [270, 700], [700, 440], [700, 700]],
    5: [[250, 440], [250, 700], [610, 440], [610, 700], [940, 570]],
    6: [[250, 440], [250, 700], [590, 440], [590, 700], [930, 440], [930, 700]],
}

export const ROBOT = { size: 190 }

export const BALLOON = { x: 640, y: 250, w: 520 }

export const MURAL = { titleY: 172, rowY: 330, gap: 150, size: 118, chainY: 452 }
