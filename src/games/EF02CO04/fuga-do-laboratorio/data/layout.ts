export const W = 1280
export const H = 720

export const DEPTH = {
    scene: 0,
    veil: 10,
    shelf: 20,
    trophy: 30,
    rack: 40,
    machine: 50,
    slot: 60,
    item: 80,
    fly: 90,
    hud: 100,
    fx: 200,
    overlay: 400,
}

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  DUAS COLUNAS: DE ONDE SE TIRA, E ONDE SE MONTA
 * ══════════════════════════════════════════════════════════════════════════
 *
 * A tela é lida da esquerda para a direita, e a partida também: a criança PEGA
 * à esquerda e MONTA à direita.
 *
 * A versão anterior era horizontal — prateleira em cima, máquina no meio, rack
 * embaixo — e pagava caro por isso: a máquina tinha 437px de altura espremidos
 * entre dois móveis, e ela é a coisa que a criança precisa enxergar. Virando a
 * composição, o chassi ganhou a metade direita inteira e cresceu para 560, e o
 * rack virou estante: duas colunas de fichas, que é como material fica guardado
 * numa bancada de verdade.
 *
 *   ┌──────────────┬──────────────────────────┐
 *   │  prateleira  │                          │
 *   ├──────────────┤   o chassi, grande       │
 *   │              │                          │
 *   │  o rack      │   mascote no vão         │
 *   │  (2 colunas) │                          │
 *   └──────────────┴──────────────────────────┘
 */

/** Fina de propósito: o jogo se explica pelos móveis, não pelo cabeçalho. */
export const HUD = {
    h: 72,
    cy: 36,

    pillX: 20,
    pillY: 15,
    pillW: 168,
    pillH: 42,

    titleX: 660,
    titleY: 24,
    titleW: 620,
    hintY: 52,
    hintW: 700,

    helpX: 1218,
    helpR: 26,
    helpHit: 122,

    livesX: 1040,
}

/**
 * A prateleira de parede: o progresso mora aqui, e ele é mobília.
 *
 * Ela coroa a coluna da esquerda, alinhada com o rack — as três máquinas
 * ligadas ficam logo acima de onde saíram as peças que as ligaram.
 */
export const SHELF = {
    cx: 208,
    cy: 146,
    w: 344,
    h: 108,

    /** O nicho apoia na tábua e começa em y=94, livre da sombra do header. */
    nicheY: 137,
    nicheGap: 104,
    nicheSize: 86,
    trophy: 68,
}

/** O chassi, no meio da bancada. Tudo dentro dele é relativo a S. */
/**
 * O chassi, na metade direita. Tudo dentro dele é relativo a S.
 *
 * Os deslocamentos internos são medidos NA ARTE, em pixels — então quando o
 * `s` muda, todos eles mudam junto, pelo mesmo fator. Da última afinação
 * (tecla P, com s=437) para estes números foi exatamente isso: x 1,281.
 */
export const MACHINE = {
    cx: 900,
    cy: 400,
    s: 560,

    /** A arte do chassi dentro do container: os vãos dela raramente caem no centro. */
    bodyDX: 0,
    bodyDY: -19,

    displayDX: -5,
    displayDY: -118,
    displayW: 232,
    displayH: 86,

    trayDX: -81,
    trayDY: 40,
    trayW: 170,
    trayH: 118,

    readerDX: 106,
    readerDY: 40,
    readerW: 113,
    readerH: 113,

    buttonDX: -1,
    buttonDY: 151,
    buttonD: 97,

    /**
     * O símbolo dentro do visor tem medida própria, e não a do vão.
     *
     * O quadro da folha 'pedidos.png' traz margem vazia em volta da silhueta,
     * então o tamanho aqui é do QUADRO, não do desenho: 86 de quadro dá uns 64
     * de símbolo. E o vão da arte não é simétrico — a moldura de cima é mais
     * grossa —, por isso o empurrão para baixo.
     */
    goalBox: 86,
    goalDY: 25,

    /**
     * Alvos de toque maiores que o desenho, para o dedo de 7 anos — mas não
     * tão maiores que se encostem: entre a bandeja e o leitor sobram 7px, e
     * quem estivesse por cima roubaria o toque do vizinho.
     */
    trayHit: { w: 180, h: 126 },
    readerHit: { w: 180, h: 150 },
    buttonHit: { w: 150, h: 112 },
}

export const machinePoint = (dx: number, dy: number) => ({
    x: MACHINE.cx + dx,
    y: MACHINE.cy + dy,
})

export const TRAY = machinePoint(MACHINE.trayDX, MACHINE.trayDY)
export const READER = machinePoint(MACHINE.readerDX, MACHINE.readerDY)
export const BUTTON = machinePoint(MACHINE.buttonDX, MACHINE.buttonDY)
export const DISPLAY = machinePoint(MACHINE.displayDX, MACHINE.displayDY)

/**
 * O rack, agora em pé: é daqui que a criança tira as coisas.
 *
 * Duas colunas, e quantas fileiras a montagem pedir — quatro fichas viram 2x2,
 * seis viram 2x3, sempre centradas na estante. Em fileira única, seis fichas
 * ocupavam a largura inteira da tela e empurravam a máquina para o meio de um
 * corredor.
 *
 * As fichas não têm nome escrito embaixo. Seis rótulos de 18px viram texto que
 * ninguém lê, e o desenho já diz o que é. O nome aparece uma vez só, no recado
 * do topo, no instante em que a criança escolhe — que é quando ela olha.
 */
export const RACK = {
    cx: 208,
    cy: 428,
    w: 344,
    h: 436,

    cols: 2,
    colGap: 152,
    rowGap: 142,
    tile: 122,
    /** Sem a carta atrás, o desenho é a ficha inteira. */
    icon: 104,
    lift: 12,
}

/** Onde cai a ficha `i` de `n`, na grade da estante. */
export const rackSlot = (i: number, n: number) => {
    const cols = Math.min(RACK.cols, n)
    const rows = Math.ceil(n / cols)
    return {
        x: RACK.cx + ((i % cols) - (cols - 1) / 2) * RACK.colGap,
        y: RACK.cy + (Math.floor(i / cols) - (rows - 1) / 2) * RACK.rowGap,
    }
}

export const nicheX = (i: number, n: number) =>
    SHELF.cx + (i - (n - 1) / 2) * SHELF.nicheGap

/**
 * A mascote numa tela de parede: ela é um móvel do laboratório, não adesivo.
 *
 * Mora no vão entre as duas colunas, que é de onde ela consegue apontar para
 * os dois lados — para o rack quando é hora de escolher, para a máquina
 * quando é hora de olhar o que aconteceu.
 */
export const MASCOT = {
    cx: 508,
    cy: 230,
    r: 74,
    size: 140,
    bezel: 186,
}
