import Phaser from 'phaser'
import { BOX_SHEET, NICO_CELL, NICO_SHEET, PIECES_SHEET, ROOM_KEY, TABLE_KEY, UI_SHEET, type Sheet } from '../data/files'
import { H, TABLE, W } from '../data/layout'
import { C } from '../data/theme'
import { dashedRoundRect } from './art'

type G = Phaser.GameObjects.Graphics

const INK = C.line

function bakeSheet(scene: Phaser.Scene, sheet: Sheet, paint: (g: G, i: number) => void) {
    if (scene.textures.exists(sheet.key)) return
    const g = scene.make.graphics({ x: 0, y: 0 }, false)
    for (let i = 0; i < sheet.cols * sheet.rows; i++) {
        g.save()
        g.translateCanvas((i % sheet.cols) * sheet.cellW, Math.floor(i / sheet.cols) * sheet.cellH)
        paint(g, i)
        g.restore()
    }
    g.generateTexture(sheet.key, sheet.cols * sheet.cellW, sheet.rows * sheet.cellH)
    g.destroy()
}

function bakeImage(scene: Phaser.Scene, key: string, w: number, h: number, paint: (g: G) => void) {
    if (scene.textures.exists(key)) return
    const g = scene.make.graphics({ x: 0, y: 0 }, false)
    paint(g)
    g.generateTexture(key, w, h)
    g.destroy()
}

export function ensureArt(scene: Phaser.Scene) {
    bakeImage(scene, ROOM_KEY, W, H, room)
    bakeImage(scene, TABLE_KEY, TABLE.w, TABLE.h, table)
    bakeSheet(scene, PIECES_SHEET, piece)
    bakeSheet(scene, NICO_SHEET, nico)
    bakeSheet(scene, BOX_SHEET, box)
    bakeSheet(scene, UI_SHEET, ui)
}

// ───────────────────────────────────────────── quarto

function room(g: G) {
    g.fillStyle(C.wall, 1)
    g.fillRect(0, 0, W, H)
    for (let x = 30; x < W; x += 120) {
        g.fillStyle(C.wallStripe, 1)
        g.fillRect(x, 0, 40, 548)
    }
    g.fillStyle(C.wallLow, 1)
    g.fillRect(0, 470, W, 78)
    g.fillStyle(C.skirting, 1)
    g.fillRect(0, 540, W, 16)
    g.fillStyle(C.floor, 1)
    g.fillRect(0, 556, W, H - 556)
    g.lineStyle(3, C.floorLine, 0.6)
    for (let y = 600; y < H; y += 46) g.lineBetween(0, y, W, y)
    for (let x = 90; x < W; x += 210) {
        g.lineBetween(x, 556, x, 600)
        g.lineBetween(x + 105, 600, x + 105, 646)
        g.lineBetween(x + 40, 646, x + 40, 692)
    }

    const wx = 34
    const wy = 128
    const ww = 210
    const wh = 150
    g.fillStyle(C.woodDark, 1)
    g.fillRoundedRect(wx - 10, wy - 10, ww + 20, wh + 20, 14)
    g.fillStyle(C.sky, 1)
    g.fillRoundedRect(wx, wy, ww, wh, 8)
    g.fillStyle(C.cloud, 1)
    g.fillCircle(wx + 80, wy + 60, 22)
    g.fillCircle(wx + 108, wy + 52, 28)
    g.fillCircle(wx + 136, wy + 62, 20)
    g.fillRect(wx + 80, wy + 62, 56, 20)
    g.lineStyle(6, C.woodDark, 1)
    g.lineBetween(wx + ww / 2, wy, wx + ww / 2, wy + wh)
    g.lineBetween(wx, wy + wh / 2, wx + ww, wy + wh / 2)
    g.fillStyle(C.curtain, 1)
    g.fillRoundedRect(wx - 18, wy - 14, 40, wh + 40, 12)
    g.fillRoundedRect(wx + ww - 22, wy - 14, 40, wh + 40, 12)
    g.fillStyle(C.curtainDark, 1)
    g.fillRect(wx - 4, wy - 14, 6, wh + 40)
    g.fillRect(wx + ww - 2, wy - 14, 6, wh + 40)

    g.fillStyle(C.woodDark, 1)
    g.fillRoundedRect(wx + 10, wy + wh + 54, 190, 14, 6)
    g.fillStyle(0xc98a52, 1)
    g.fillCircle(wx + 54, wy + wh + 34, 18)
    g.fillCircle(wx + 54, wy + wh + 12, 14)
    g.fillCircle(wx + 42, wy + wh + 0, 6)
    g.fillCircle(wx + 66, wy + wh + 0, 6)
    g.fillStyle(C.coral, 1)
    g.fillTriangle(wx + 150, wy + wh - 10, wx + 136, wy + wh + 52, wx + 164, wy + wh + 52)
    g.fillStyle(C.white, 1)
    g.fillCircle(wx + 150, wy + wh + 22, 7)

    g.lineStyle(3, C.string, 1)
    const flags = [C.flagA, C.flagB, C.flagC, C.flagD]
    for (let x = 300, i = 0; x < 1220; x += 70, i++) {
        const sag = Math.sin(((x - 300) / 920) * Math.PI) * 12
        g.lineBetween(x, 104 + sag, x + 70, 104 + Math.sin(((x + 70 - 300) / 920) * Math.PI) * 12)
        g.fillStyle(flags[i % flags.length], 1)
        g.fillTriangle(x + 14, 106 + sag, x + 50, 106 + sag, x + 32, 140 + sag)
    }
}

// ───────────────────────────────────────────── mesa

function table(g: G) {
    const w = TABLE.w
    const top = TABLE.imageTop
    g.fillStyle(C.legs, 1)
    ;[60, 190, w - 218, w - 88].forEach(x => {
        g.fillRoundedRect(x, 96, 28, TABLE.h - 96, 8)
        g.fillStyle(C.legsDark, 1)
        g.fillRect(x + 18, 96, 10, TABLE.h - 96)
        g.fillStyle(C.legs, 1)
    })
    g.lineStyle(4, INK, 1)
    ;[60, 190, w - 218, w - 88].forEach(x => g.strokeRoundedRect(x, 96, 28, TABLE.h - 96, 8))
    g.fillStyle(C.woodDark, 1)
    g.fillRoundedRect(22, top + 40, w - 44, 54, 14)
    g.lineStyle(4, INK, 1)
    g.strokeRoundedRect(22, top + 40, w - 44, 54, 14)
    g.fillStyle(C.woodDeep, 0.5)
    g.fillRect(40, top + 78, w - 80, 8)
    g.fillStyle(C.wood, 1)
    g.fillRoundedRect(2, top, w - 4, 44, 12)
    g.fillStyle(C.woodLight, 1)
    g.fillRoundedRect(14, top + 6, w - 28, 10, 5)
    g.lineStyle(4, INK, 1)
    g.strokeRoundedRect(2, top, w - 4, 44, 12)
}

// ───────────────────────────────────────────── peças

const BLOCK_TONES: Array<[number, number]> = [
    [C.yellow, C.yellowDark],
    [C.blue, C.blueDark],
    [C.green, C.greenDark],
    [C.coral, C.coralDark],
]

function block(g: G, fill: number, dark: number) {
    g.fillStyle(fill, 1)
    g.fillRoundedRect(6, 6, 244, 244, 22)
    g.fillStyle(dark, 1)
    g.fillRoundedRect(196, 6, 54, 244, { tl: 0, tr: 22, bl: 0, br: 22 })
    g.fillStyle(C.white, 0.35)
    g.fillRoundedRect(24, 20, 150, 18, 9)
    g.fillStyle(dark, 1)
    g.fillCircle(118, 128, 30)
    g.fillStyle(C.shadow, 0.25)
    g.fillCircle(118, 132, 24)
    g.lineStyle(7, INK, 1)
    g.strokeRoundedRect(6, 6, 244, 244, 22)
}

function ramp(g: G, mirror: boolean) {
    const fx = (x: number) => (mirror ? 256 - x : x)
    const body = [
        { x: fx(10), y: 46 },
        { x: fx(246), y: 212 },
        { x: fx(246), y: 248 },
        { x: fx(10), y: 248 },
    ]
    g.fillStyle(C.ramp, 1)
    g.fillPoints(body, true)
    g.fillStyle(C.rampDark, 1)
    g.fillPoints(
        [
            { x: fx(10), y: 46 },
            { x: fx(246), y: 212 },
            { x: fx(246), y: 232 },
            { x: fx(10), y: 76 },
        ],
        true,
    )
    g.fillStyle(C.rampDeep, 1)
    g.fillPoints(
        [
            { x: fx(10), y: 62 },
            { x: fx(246), y: 224 },
            { x: fx(246), y: 230 },
            { x: fx(10), y: 72 },
        ],
        true,
    )
    g.fillStyle(C.white, 0.3)
    g.fillPoints(
        [
            { x: fx(30), y: 110 },
            { x: fx(120), y: 172 },
            { x: fx(120), y: 186 },
            { x: fx(30), y: 124 },
        ],
        true,
    )
    g.lineStyle(7, INK, 1)
    g.strokePoints(body, true)
}

function bell(g: G) {
    g.fillStyle(C.woodDark, 1)
    g.fillRoundedRect(48, 64, 20, 182, 8)
    g.fillRoundedRect(188, 64, 20, 182, 8)
    g.fillStyle(C.wood, 1)
    g.fillRoundedRect(36, 52, 184, 26, 12)
    g.lineStyle(6, INK, 1)
    g.strokeRoundedRect(48, 64, 20, 182, 8)
    g.strokeRoundedRect(188, 64, 20, 182, 8)
    g.strokeRoundedRect(36, 52, 184, 26, 12)
    g.lineStyle(6, INK, 1)
    g.lineBetween(128, 78, 128, 96)
    const shape = [
        { x: 128, y: 92 },
        { x: 160, y: 104 },
        { x: 172, y: 150 },
        { x: 190, y: 186 },
        { x: 66, y: 186 },
        { x: 84, y: 150 },
        { x: 96, y: 104 },
    ]
    g.fillStyle(C.gold, 1)
    g.fillPoints(shape, true)
    g.fillStyle(C.goldDark, 1)
    g.fillRect(70, 176, 116, 10)
    g.fillStyle(C.goldLight, 1)
    g.fillEllipse(108, 128, 14, 36)
    g.lineStyle(6, INK, 1)
    g.strokePoints(shape, true)
    g.fillStyle(C.goldDark, 1)
    g.fillCircle(128, 198, 12)
    g.strokeCircle(128, 198, 12)
    g.fillStyle(C.cup, 1)
    g.fillEllipse(70, 222, 70, 34)
    g.fillStyle(C.cupDark, 1)
    g.fillEllipse(70, 214, 52, 16)
    g.lineStyle(5, INK, 1)
    g.strokeEllipse(70, 222, 70, 34)
}

function marble(g: G) {
    g.fillStyle(C.marble, 1)
    g.fillCircle(128, 128, 58)
    g.fillStyle(C.white, 0.85)
    g.fillEllipse(118, 136, 70, 24)
    g.fillStyle(C.marbleDark, 1)
    g.fillEllipse(140, 112, 48, 16)
    g.fillStyle(C.white, 1)
    g.fillCircle(104, 100, 12)
    g.lineStyle(7, INK, 1)
    g.strokeCircle(128, 128, 58)
}

function piece(g: G, i: number) {
    if (i < 4) block(g, BLOCK_TONES[i][0], BLOCK_TONES[i][1])
    else if (i === 4) ramp(g, false)
    else if (i === 5) ramp(g, true)
    else if (i === 6) bell(g)
    else marble(g)
}

// ───────────────────────────────────────────── Nico

interface Arm {
    to: { x: number; y: number }
    hand?: boolean
}

function limb(g: G, from: { x: number; y: number }, to: { x: number; y: number }, color: number, width: number) {
    g.lineStyle(width + 8, INK, 1)
    g.lineBetween(from.x, from.y, to.x, to.y)
    g.lineStyle(width, color, 1)
    g.lineBetween(from.x, from.y, to.x, to.y)
    g.fillStyle(color, 1)
    g.fillCircle(to.x, to.y, width / 2)
    g.fillCircle(from.x, from.y, width / 2)
}

function nico(g: G, i: number) {
    const lift = i === NICO_CELL.cheer ? 16 : 0
    const lean = i === NICO_CELL.oops ? -8 : 0
    const feet = 314 - lift
    const hip = feet - 70
    const shoulder = hip - 64
    const headY = shoulder - 66
    const bx = 120 + lean

    limb(g, { x: bx - 16, y: hip }, { x: bx - 22, y: feet - 12 }, C.overallsDark, 22)
    limb(g, { x: bx + 16, y: hip }, { x: bx + 22, y: feet - 12 }, C.overalls, 22)
    ;[bx - 24, bx + 26].forEach(x => {
        g.fillStyle(C.shoe, 1)
        g.fillRoundedRect(x - 18, feet - 22, 44, 22, 10)
        g.fillStyle(C.shoeDark, 1)
        g.fillRect(x - 18, feet - 8, 44, 6)
        g.lineStyle(5, INK, 1)
        g.strokeRoundedRect(x - 18, feet - 22, 44, 22, 10)
    })

    const arms: Arm[] =
        i === NICO_CELL.box
            ? [{ to: { x: bx + 70, y: shoulder + 30 } }, { to: { x: bx + 76, y: shoulder + 40 } }]
            : i === NICO_CELL.place
              ? [{ to: { x: bx + 86, y: shoulder - 18 }, hand: true }, { to: { x: bx + 92, y: shoulder - 4 }, hand: true }]
              : i === NICO_CELL.cheer
                ? [{ to: { x: bx - 48, y: shoulder - 70 }, hand: true }, { to: { x: bx + 52, y: shoulder - 74 }, hand: true }]
                : i === NICO_CELL.oops
                  ? [{ to: { x: bx - 30, y: headY - 30 }, hand: true }, { to: { x: bx + 36, y: headY - 34 }, hand: true }]
                  : i === NICO_CELL.read
                    ? [{ to: { x: bx + 58, y: shoulder + 34 }, hand: true }, { to: { x: bx + 70, y: shoulder + 30 }, hand: true }]
                    : i === NICO_CELL.release
                      ? [{ to: { x: bx - 26, y: hip - 4 }, hand: true }, { to: { x: bx + 82, y: shoulder - 64 }, hand: true }]
                      : i === NICO_CELL.think
                        ? [{ to: { x: bx - 26, y: hip - 4 }, hand: true }, { to: { x: bx + 40, y: headY + 52 }, hand: true }]
                        : [{ to: { x: bx - 34, y: hip - 2 }, hand: true }, { to: { x: bx + 36, y: hip - 2 }, hand: true }]

    limb(g, { x: bx - 26, y: shoulder + 10 }, arms[0].to, C.shirtDark, 18)
    if (arms[0].hand) {
        g.fillStyle(C.skinDark, 1)
        g.fillCircle(arms[0].to.x, arms[0].to.y, 12)
    }

    g.fillStyle(C.shirt, 1)
    g.fillRoundedRect(bx - 36, shoulder, 72, 64, 24)
    g.lineStyle(5, INK, 1)
    g.strokeRoundedRect(bx - 36, shoulder, 72, 64, 24)
    g.fillStyle(C.white, 1)
    g.fillRect(bx - 34, shoulder + 22, 68, 9)
    g.fillStyle(C.overalls, 1)
    g.fillRoundedRect(bx - 34, shoulder + 30, 68, 50, { tl: 6, tr: 6, bl: 18, br: 18 })
    g.fillRect(bx - 24, shoulder + 2, 10, 32)
    g.fillRect(bx + 14, shoulder + 2, 10, 32)
    g.fillStyle(C.overallsDark, 1)
    g.fillRoundedRect(bx - 14, shoulder + 40, 28, 18, 5)
    g.fillStyle(C.shoe, 1)
    g.fillCircle(bx - 19, shoulder + 30, 5)
    g.fillCircle(bx + 19, shoulder + 30, 5)
    g.lineStyle(5, INK, 1)
    g.strokeRoundedRect(bx - 34, shoulder + 30, 68, 50, { tl: 6, tr: 6, bl: 18, br: 18 })

    if (i === NICO_CELL.box) {
        g.fillStyle(C.box, 1)
        g.fillRoundedRect(bx + 20, shoulder + 2, 104, 80, 10)
        g.fillStyle(C.boxDark, 1)
        g.fillRect(bx + 20, shoulder + 2, 104, 14)
        g.fillStyle(C.yellow, 1)
        g.fillRect(bx + 36, shoulder + 52, 20, 20)
        g.fillStyle(C.blue, 1)
        g.fillRect(bx + 36, shoulder + 32, 20, 20)
        g.fillStyle(C.ramp, 1)
        g.fillTriangle(bx + 56, shoulder + 32, bx + 84, shoulder + 52, bx + 56, shoulder + 52)
        g.fillStyle(C.gold, 1)
        g.fillCircle(bx + 104, shoulder + 60, 11)
        g.lineStyle(5, INK, 1)
        g.strokeRoundedRect(bx + 20, shoulder + 2, 104, 80, 10)
    }
    if (i === NICO_CELL.read) {
        g.fillStyle(C.paper, 1)
        g.fillRoundedRect(bx + 36, shoulder + 6, 56, 44, 6)
        g.lineStyle(4, INK, 1)
        g.strokeRoundedRect(bx + 36, shoulder + 6, 56, 44, 6)
    }

    limb(g, { x: bx + 26, y: shoulder + 10 }, arms[1].to, C.shirt, 18)
    if (arms[1].hand || i === NICO_CELL.box) {
        g.fillStyle(C.skin, 1)
        g.fillCircle(arms[1].to.x, arms[1].to.y, 12)
        g.lineStyle(4, INK, 1)
        g.strokeCircle(arms[1].to.x, arms[1].to.y, 12)
    }

    g.fillStyle(C.skin, 1)
    g.fillCircle(bx + 4, headY, 62)
    g.lineStyle(5, INK, 1)
    g.strokeCircle(bx + 4, headY, 62)
    g.fillStyle(C.hair, 1)
    ;[
        [-40, -40, 26],
        [-12, -54, 28],
        [20, -52, 26],
        [44, -34, 22],
        [-52, -12, 20],
        [-30, -20, 18],
    ].forEach(([dx, dy, r]) => g.fillCircle(bx + 4 + dx, headY + dy, r))
    g.fillStyle(C.hairLight, 1)
    g.fillCircle(bx - 10, headY - 60, 8)
    g.fillStyle(C.skin, 1)
    g.fillEllipse(bx - 40, headY + 6, 22, 30)

    const down = i === NICO_CELL.read ? 10 : 0
    const ex = [bx + 12, bx + 46]
    const ey = headY + 4 + down
    if (i === NICO_CELL.cheer) {
        g.lineStyle(6, C.eye, 1)
        ex.forEach(x => {
            g.beginPath()
            g.arc(x, ey + 4, 10, Math.PI * 1.1, Math.PI * 1.9)
            g.strokePath()
        })
    } else {
        const big = i === NICO_CELL.oops ? 1.15 : 1
        ex.forEach(x => {
            g.fillStyle(C.eye, 1)
            g.fillEllipse(x, ey, 18 * big, 26 * big)
            g.fillStyle(C.white, 1)
            g.fillCircle(x + 3, ey - 6, 5)
        })
    }
    g.fillStyle(C.cheek, 0.8)
    g.fillCircle(bx + 2, headY + 26, 9)
    g.fillCircle(bx + 56, headY + 24, 7)
    g.lineStyle(5, C.eye, 1)
    if (i === NICO_CELL.oops) {
        g.fillStyle(C.eye, 1)
        g.fillEllipse(bx + 30, headY + 34, 16, 18)
        g.fillStyle(0x9ad6ff, 1)
        g.fillEllipse(bx + 70, headY - 40, 12, 18)
    } else {
        g.beginPath()
        g.arc(bx + 30, headY + 26, 12, Math.PI * 0.15, Math.PI * 0.85)
        g.strokePath()
    }
}

// ───────────────────────────────────────────── caixa

function box(g: G, i: number) {
    const open = i === 1
    if (open) {
        g.fillStyle(C.boxDeep, 1)
        g.fillPoints(
            [
                { x: 60, y: 96 },
                { x: 324, y: 96 },
                { x: 300, y: 24 },
                { x: 84, y: 24 },
            ],
            true,
        )
        g.lineStyle(6, INK, 1)
        g.strokePoints(
            [
                { x: 60, y: 96 },
                { x: 324, y: 96 },
                { x: 300, y: 24 },
                { x: 84, y: 24 },
            ],
            true,
        )
    }
    g.fillStyle(C.box, 1)
    g.fillRoundedRect(48, 100, 288, 214, 14)
    if (open) {
        g.fillStyle(C.boxInside, 1)
        g.fillRect(56, 100, 272, 26)
    } else {
        g.fillStyle(C.boxDark, 1)
        g.fillRoundedRect(38, 84, 308, 40, 12)
        g.lineStyle(6, INK, 1)
        g.strokeRoundedRect(38, 84, 308, 40, 12)
    }
    const px = 92
    const py = 286
    g.fillStyle(C.yellow, 1)
    g.fillRect(px, py - 44, 44, 44)
    g.fillStyle(C.blue, 1)
    g.fillRect(px, py - 88, 44, 44)
    g.fillStyle(C.ramp, 1)
    g.fillTriangle(px + 44, py - 88, px + 104, py - 44, px + 44, py - 44)
    g.fillStyle(C.green, 1)
    g.fillRect(px + 104, py - 44, 44, 44)
    g.fillStyle(C.ramp, 1)
    g.fillTriangle(px + 148, py - 44, px + 196, py - 4, px + 148, py - 4)
    g.fillStyle(C.gold, 1)
    g.fillCircle(px + 222, py - 22, 18)
    g.lineStyle(4, INK, 0.8)
    g.strokeRect(px, py - 88, 44, 88)
    g.strokeRect(px + 104, py - 44, 44, 44)
    g.lineStyle(6, INK, 1)
    g.strokeRoundedRect(48, 100, 288, 214, 14)
}

// ───────────────────────────────────────────── UI

function ui(g: G, i: number) {
    const x = 10
    const y = 10
    const w = 236
    const h = 172
    if (i === 0) {
        g.fillStyle(C.paperRim, 1)
        g.fillRoundedRect(x, y + 6, w, h, 18)
        g.fillStyle(C.paper, 1)
        g.fillRoundedRect(x, y, w, h, 18)
        g.lineStyle(3, C.paperLine, 1)
        g.strokeRoundedRect(x + 10, y + 10, w - 20, h - 20, 12)
        g.fillStyle(C.paperFold, 1)
        g.fillTriangle(x + w - 40, y, x + w, y, x + w, y + 40)
        g.lineStyle(4, C.paperRim, 1)
        g.strokeRoundedRect(x, y, w, h, 18)
    } else if (i === 1) {
        g.fillStyle(C.white, 0.35)
        g.fillRoundedRect(x, y, w, h, 18)
        g.lineStyle(5, C.white, 0.9)
        dashedRoundRect(g, x, y, w, h, 18)
    } else {
        const on = i === 2
        const face = on ? C.yes : C.off
        const dark = on ? C.yesDark : C.offDark
        g.fillStyle(dark, 1)
        g.fillRoundedRect(x, y + 14, w, h - 14, 30)
        g.fillStyle(face, 1)
        g.fillRoundedRect(x, y, w, h - 22, 30)
        g.fillStyle(C.white, on ? 0.3 : 0.2)
        g.fillRoundedRect(x + 20, y + 10, w - 40, 16, 8)
        const hx = x + 46
        const hy = y + 72
        g.fillStyle(on ? C.wood : C.offDark, 1)
        g.fillRoundedRect(hx - 6, hy - 10, 12, 62, 6)
        g.fillStyle(on ? C.woodDeep : 0x8a8494, 1)
        g.fillRoundedRect(hx - 28, hy - 30, 56, 28, 8)
        g.lineStyle(4, INK, on ? 1 : 0.5)
        g.strokeRoundedRect(hx - 6, hy - 10, 12, 62, 6)
        g.strokeRoundedRect(hx - 28, hy - 30, 56, 28, 8)
        g.lineStyle(5, INK, on ? 1 : 0.4)
        g.strokeRoundedRect(x, y, w, h - 22, 30)
    }
}
