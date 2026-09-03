export const W = 1280
export const H = 720

export const DEPTH = {
    sky: 0,
    scenery: 2,
    trail: 6,
    smallChest: 10,
    explorer: 20,
    chest: 30,
    panel: 50,
    card: 60,
    glyph: 70,
    hud: 80,
    legend: 90,
    balloon: 110,
    fx: 130,
    edge: 150,
    overlay: 400,
}

export const BG = { dy: -120, tail: 594 }

export const SKY = { top: 132, mid: 288 }

export const TRAIL = { y: 232, chests: [200, 385, 570, 755, 940], baseY: 250 }

export const SMALL_CHEST = { w: 84 }

export const EXPLORER = { h: 132, startX: 84, baseY: 252 }

export const CHEST = { x: 214, baseY: 442, w: 214 }

export const CLUE = { cx: 640, cy: 352, padX: 44, padY: 28 }

export const clueTile = (n: number) => (n >= 3 ? 120 : 136)
export const cluePitch = (n: number) => (n >= 3 ? 138 : 158)

export const OPTION = { cy: 596, h: 200, cx: 640, gap: 30 }

export const STATUS = {
    x: 16,
    y: 12,
    w: 196,
    h: 92,
    pill: { x: 28, y: 24, w: 172, h: 38, r: 19 },
    dotY: 82,
    dotR: 8,
    dotGap: 26,
}

export const CINEMA = { zoom: 1.34, pan: 340, walkMin: 700, walkPerPx: 4 }

export const HUD = { h: 86 }
export const HELP = { x: 1216, y: 44, r: 30 }
export const LEGEND_BTN = { x: 1104, y: 44, w: 150, h: 56 }
export const LEGEND_PANEL = { cx: 1124, top: 104, w: 244, rowH: 90, pad: 26 }
export const LIVES = { x: 24, y: 44, size: 30 }

export const cluePanelWidth = (n: number) =>
    (n - 1) * cluePitch(n) + clueTile(n) + CLUE.padX * 2

export const cluePanelHeight = (n: number) => clueTile(n) + CLUE.padY * 2

export const clueX = (i: number, n: number) => CLUE.cx + (i - (n - 1) / 2) * cluePitch(n)

export const optionTile = (n: number) => (n >= 3 ? 92 : 110)
export const optionPitch = (n: number) => (n >= 3 ? 104 : 126)

export const optionWidth = (n: number) =>
    (n - 1) * optionPitch(n) + optionTile(n) + (n >= 3 ? 84 : 96)

export const optionX = (i: number, n: number) =>
    OPTION.cx + (i - 1) * (optionWidth(n) + OPTION.gap)

export const optionsSpan = (n: number) => optionWidth(n) * 3 + OPTION.gap * 2

export const glyphX = (i: number, n: number, pitch: number) => (i - (n - 1) / 2) * pitch
