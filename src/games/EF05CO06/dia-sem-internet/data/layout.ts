/**
 * O MUNDO É MAIOR QUE A TELA.
 *
 * A nuvem não é uma caixa no alto da tela: ela está **no céu**, a mais de
 * seiscentos pixels acima do computador, e a câmera **viaja** até lá. É a
 * decisão que o usuário pediu em 18/09/2026, e ela é o jogo inteiro: a criança
 * sente a distância porque a câmera gasta tempo para cobri-la.
 *
 * Por isso há dois sistemas de coordenada aqui:
 *
 * - **o MUNDO** (`SKY`, `ROOM`, `CLOUD`, `PC`, `WIRE`) — 1280 × 1440, onde as
 *   coisas moram. A câmera anda nele;
 * - **a TELA** (`HUD`, `ASK`, `BTN`) — 1280 × 720 fixos, com
 *   `setScrollFactor(0)`. É o que nunca sai do lugar.
 *
 * A criança nunca toca em nada do mundo. Ela toca nos BOTÕES, que são tela.
 */

export const W = 1280
export const H = 720

/* ─────────────────────────────── o mundo ────────────────────────────── */

export const WORLD = { w: 1280, h: 1440 } as const

/** O céu ocupa o topo; o quarto entra por baixo, com 40 px de sobreposição. */
export const SKY = { cx: 640, top: 0, w: 1280, h: 800 } as const
export const ROOM = { cx: 640, top: 760, w: 1280, h: 720 } as const

/**
 * A nuvem de dados, lá em cima. As frações são medidas de `nuvem.png`: o miolo
 * claro vai de 0,218 a 0,848 da altura da folha, e é nele que os cartões ficam.
 */
export const CLOUD = { cx: 640, top: 196, w: 820, h: 266, cardCy: 344 } as const

/**
 * O computador, na mesa. A tela vazia de `computador.png` vai de 0,088 a 0,721
 * da altura da folha.
 */
export const PC = { cx: 560, top: 1046, w: 760, h: 313, cardCy: 1204 } as const

/**
 * O pen drive, ao lado do computador, na mesa.
 *
 * A folha é 709 × 354 — deitada, e não quadrada. Desenhá-la num quadrado
 * amassava o desenho: aqui a altura sai da largura pela proporção da arte.
 */
export const DRIVE = { cx: 1094, cy: 1306, w: 230, h: 115, cardCy: 1080 } as const

/** O cabo, que sobe do computador até o céu e arrebenta no meio. */
export const WIRE = { cx: 560, y0: 462, y1: 1046, cutAt: 754 } as const

/**
 * NENHUM NOME ESCRITO NO MUNDO.
 *
 * As três coisas já se dizem pelo desenho — um monitor, um pen drive e uma
 * nuvem não se confundem —, e o nome escrito mora no BOTÃO, que é quem a
 * criança toca. Repetir o nome em cima do objeto era a mesma informação duas
 * vezes, e a segunda ainda tapava o desenho que a estava dando.
 */

/* ─────────────────────── onde a câmera fica parada ──────────────────── */

/**
 * QUEM VIAJA É O MUNDO, E NÃO A CÂMERA.
 *
 * A primeira versão movia `cameras.main`, e isso quebrou o tutorial: o
 * `createTutorial` de `shared` desenha em coordenada de TELA, e com a câmera
 * rolada 800 px ele ia parar fora da vista, invisível, travando o jogo à espera
 * de um clique que ninguém podia dar.
 *
 * Agora o mundo inteiro mora num container que sobe e desce. A câmera nunca sai
 * do lugar, e tudo que é UI — tutorial, cabeçalho, pedido, botões, plaquinha,
 * vidas — funciona em coordenada de tela, como em qualquer outro jogo do
 * catálogo.
 *
 * `EYE` é onde o olho da criança fica: não é o meio da tela, porque o pedido
 * come 180 px em cima e os botões 120 embaixo. É o centro do que sobra.
 */
const EYE = 398

/** Onde o container do mundo precisa estar para cada vista. */
export const VIEW = {
    sky: EYE - CLOUD.cardCy,
    room: EYE - PC.cardCy,
    wire: EYE - WIRE.cutAt,
} as const

/**
 * ATÉ ONDE A CRIANÇA PODE ROLAR.
 *
 * Os limites são as duas vistas conhecidas — o quarto embaixo e o céu em cima.
 * Entre elas passa o cabo inteiro, que é exatamente o que ela precisa poder
 * seguir com o dedo para acreditar que a nuvem está ligada ao computador.
 *
 * Fora desses dois extremos só há borda de arte, e deixar a criança chegar lá
 * transformaria a rolagem numa forma de quebrar o cenário.
 */
export const SCROLL = { min: VIEW.room, max: VIEW.sky } as const

/* ───────────────────────── o mundo DEITADO (nível 3) ─────────────────── */

/**
 * O MUNDO DO AR — 2100 × 720, e ele rola de lado.
 *
 * Aqui não há quarto nem cabo: há o céu, o chão, e **a nuvem por cima de tudo**,
 * alcançando por onda um computador à esquerda e um celular à direita. A
 * criança nunca vê os dois aparelhos ao mesmo tempo, e é isso que faz "um parou
 * e o outro não" ser uma descoberta, e não um aviso.
 *
 * É um mundo mais de DIAGRAMA que de cenário, e isso é de propósito: o nível 3
 * discute uma coisa invisível — o alcance —, e um quarto desenhado em volta
 * disputaria a atenção com ela.
 *
 * As vistas são as duas pontas. Não há vista do meio para jogar: `wide` existe
 * só para a tomada de abertura, onde a nuvem aparece sozinha antes de a criança
 * saber que há dois aparelhos embaixo dela.
 */
export const WORLD_AIR = { w: 2100, h: 720 } as const

export const GROUND_AIR = { y: 600 } as const

/**
 * A FAIXA ÚTIL DO AR É ESTREITA, e ela mandou em todos os números abaixo.
 *
 * O pedido come até 180 px em cima e os botões começam em 575: sobram 395 px
 * para a nuvem, as duas ondas e os dois aparelhos. Foi essa conta que decidiu
 * o tamanho da nuvem (200 px de altura, e não os 265 do quarto) e que empurra
 * o pé dos aparelhos para baixo dos botões — o que não custa nada, porque o que
 * importa neles é a TELA, e ela fica inteira acima de 575.
 *
 * As frações de `nuvem.png` são as mesmas do quarto: miolo em 0,218–0,848.
 */
export const CLOUD_AIR = { cx: 1050, top: 190, w: 711, h: 230, cardCy: 312 } as const

/** `computador.png`, com a tela vazia em 0,088–0,721 da folha. */
export const PC_AIR = { cx: 330, top: 392, w: 515, h: 212, cardCy: 477 } as const

/** O celular, em pé no chão. A tela dele cabe UM cartão, e a validação cobra. */
export const PHONE_AIR = { cx: 1790, cy: 450, w: 196, h: 290, cardCy: 452 } as const

/**
 * AS DUAS ONDAS, e elas sobem antes de descer.
 *
 * Cada aparelho tem a sua curva até a nuvem, desenhada em **pontinhos** —
 * porque pontinho é o desenho de "sem fio", e uma linha cheia seria exatamente
 * a coisa errada de dizer num nível que existe para tirar o cabo da história.
 *
 * O ponto de controle fica ACIMA das duas pontas de propósito. Na faixa
 * estreita do ar, a nuvem e os aparelhos acabam quase na mesma altura, e uma
 * curva reta entre eles leria como um fio na horizontal. Arqueando por cima, a
 * onda sai do aparelho para o céu e volta — que é o caminho que ela faz.
 */
export const LINK_AIR = {
    pc: { x0: 766, y0: 390, cx: 596, cy: 276, x1: 440, y1: 372 },
    phone: { x0: 1340, y0: 384, cx: 1578, cy: 262, x1: 1790, y1: 288 },
} as const

/** Onde o leque de sinal encosta em cada aparelho. */
export const FAN_AIR = {
    pc: { x: 430, y: 392 },
    phone: { x: 1790, y: 308 },
} as const

export const VIEW_AIR = { pc: 0, phone: -820, wide: -410 } as const

export const SCROLL_AIR = { min: VIEW_AIR.phone, max: VIEW_AIR.pc } as const

/**
 * O TRILHO DE ROLAGEM.
 *
 * Ele existe por um motivo só: dizer que HÁ MAIS TELA. Uma criança não procura
 * o que não sabe que existe, e o mundo deste jogo é sempre maior que a tela —
 * o dobro da altura no quarto, o dobro da largura no ar.
 *
 * `at` é a coordenada FIXA: o x do trilho em pé, o y do deitado. `from` e `len`
 * correm no eixo que rola.
 */
export interface RailDef {
    axis: 'x' | 'y'
    at: number
    from: number
    len: number
    w: number
    thumb: number
}

/** Em pé, na beira direita: o mundo do quarto sobe e desce. */
export const RAIL_ROOM: RailDef = { axis: 'y', at: 1246, from: 232, len: 284, w: 12, thumb: 84 }

/**
 * Deitado, no rodapé — ABAIXO dos botões.
 *
 * No ar não há beira livre: a nuvem ocupa o alto da tela inteira e os dois
 * aparelhos ocupam o meio. O rodapé é o único lugar onde um traço de 500 px não
 * cruza nada, e ainda é onde a mão já está.
 */
export const RAIL_AIR: RailDef = { axis: 'x', at: 700, from: 390, len: 500, w: 12, thumb: 150 }

/* ─────────────────────────────── a tela ─────────────────────────────── */

export const HUD = {
    h: 82,
    cy: 41,

    pillX: 20,
    pillY: 12,
    pillW: 138,
    pillH: 58,

    dotX: 192,
    dotGap: 40,
    dotR: 11,

    livesX: 1006,
    livesY: 26,

    helpX: 1206,
    helpR: 30,
    helpHit: 136,
} as const

/** O pedido: uma linha, e é a primeira coisa que a criança lê. */
export const ASK = { cx: 640, cy: 138, w: 1060, h: 84 } as const

/**
 * OS BOTÕES — os únicos alvos do jogo.
 *
 * Um por lugar onde um arquivo pode morar, com o NOME e mais nada.
 *
 * Eles já tiveram as miniaturas dos arquivos dentro, e a ideia era boa no
 * papel: a criança saberia o que tem em cada lugar sem sair do lugar. Só que um
 * símbolo de 46 px não se explica — o pincel podia ser "desenho", "pintura" ou
 * "arte", e a única forma de descobrir era ver o mesmo símbolo grande, com o
 * nome escrito embaixo, lá no mundo. Para o computador e o pen drive isso
 * acontecia sozinho, porque estavam na tela; para a nuvem, não acontecia nunca.
 *
 * O botão voltou a ser só o nome, e quem responde "o que tem aqui dentro" é a
 * ROLAGEM (`scenes/scroll.ts`), onde cada arquivo aparece grande e com legenda.
 *
 * 340 × 118 dá 102 × 35 px reais num celular de 390 px — o dobro do mínimo para
 * um dedo de criança, e largo o bastante para o nome caber sem encolher.
 */
export const BTN = { cy: 634, w: 340, h: 118, gap: 28 } as const

export const btnX = (index: number, total: number) =>
    640 + (index - (total - 1) / 2) * (BTN.w + BTN.gap)

export const DEPTH = {
    sky: 0,
    /** A área de arrasto: acima do mundo e abaixo de tudo que recebe toque. */
    grab: 1,
    room: 2,
    wire: 6,
    shelf: 10,
    card: 20,
    cardLifted: 30,
    veil: 40,
    rail: 50,
    ask: 60,
    button: 70,
    sign: 80,
    hud: 120,
    frame: 200,
    overlay: 300,
} as const
