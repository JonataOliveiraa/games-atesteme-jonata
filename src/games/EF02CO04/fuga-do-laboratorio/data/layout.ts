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
 *  TRÊS MÓVEIS, E NÃO TRÊS PLACAS
 * ══════════════════════════════════════════════════════════════════════════
 *
 * A versão anterior empilhava quatro faixas de interface — header, tira da
 * porta, laje da mesa, dois botões — e nenhuma delas era uma coisa do
 * laboratório. Aqui a tela tem uma barra fina de plataforma no topo e, embaixo
 * dela, três MÓVEIS: a prateleira alta onde as máquinas revividas moram, o
 * chassi no meio da bancada, e o rack baixo de onde saem as peças.
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

/** A prateleira de parede: o progresso mora aqui, e ele é mobília. */
export const SHELF = {
    cx: 640,
    cy: 132,
    w: 1000,
    h: 112,

    nicheY: 122,
    nicheGap: 244,
    nicheSize: 116,
    trophy: 86,
}

/** O chassi, no meio da bancada. Tudo dentro dele é relativo a S. */
export const MACHINE = {
    cx: 640,
    cy: 392,
    s: 400,

    displayDX: 0,
    displayDY: -140,
    displayW: 190,
    displayH: 70,

    trayDX: -95,
    trayDY: -10,
    trayW: 150,
    trayH: 104,

    readerDX: 95,
    readerDY: -10,
    readerW: 114,
    readerH: 114,

    buttonDY: 110,
    buttonD: 120,

    /** Alvos de toque bem maiores que o desenho, para o dedo de 7 anos. */
    trayHit: { w: 176, h: 136 },
    readerHit: { w: 146, h: 146 },
    buttonHit: { w: 152, h: 152 },
}

export const machinePoint = (dx: number, dy: number) => ({
    x: MACHINE.cx + dx,
    y: MACHINE.cy + dy,
})

export const TRAY = machinePoint(MACHINE.trayDX, MACHINE.trayDY)
export const READER = machinePoint(MACHINE.readerDX, MACHINE.readerDY)
export const BUTTON = machinePoint(0, MACHINE.buttonDY)
export const DISPLAY = machinePoint(MACHINE.displayDX, MACHINE.displayDY)

/**
 * O rack baixo: é daqui que a criança tira as coisas.
 *
 * As fichas não têm nome escrito embaixo. Seis rótulos de 18px numa fileira
 * viram uma linha de texto que ninguém lê, e o desenho já diz o que é. O nome
 * aparece uma vez só, no recado do topo, no instante em que a criança escolhe
 * — que é quando ela está olhando.
 */
export const RACK = {
    cx: 640,
    cy: 656,
    w: 1160,
    h: 124,

    tileY: 650,
    tile: 118,
    gap: 24,
    icon: 92,
    lift: 16,
}

export const rackX = (i: number, n: number) => {
    const span = n * RACK.tile + (n - 1) * RACK.gap
    return RACK.cx - span / 2 + RACK.tile / 2 + i * (RACK.tile + RACK.gap)
}

export const nicheX = (i: number, n: number) =>
    SHELF.cx + (i - (n - 1) / 2) * SHELF.nicheGap

/** A mascote numa tela de parede: ela é um móvel do laboratório, não adesivo. */
export const MASCOT = {
    cx: 122,
    cy: 348,
    r: 90,
    size: 170,
    bezel: 226,
}
