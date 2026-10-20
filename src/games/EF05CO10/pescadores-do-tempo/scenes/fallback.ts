import Phaser from 'phaser'
import { BACKGROUNDS, FISHER_SHEET, FISH_SHEET, ICON2_SHEET, ICON_SHEET, INVENT_SHEET, MARKET_SHEET, TALK_SHEET, VILA_SHEET, type Sheet } from '../data/files'
import { BANK, H, W, WATER } from '../data/layout'
import { C } from '../data/theme'

type G = Phaser.GameObjects.Graphics

interface P {
    x: number
    y: number
}

const rr = (g: G, x: number, y: number, w: number, h: number, r: number, color: number, alpha = 1) => {
    g.fillStyle(color, alpha)
    g.fillRoundedRect(x, y, w, h, Math.max(0.5, Math.min(r, w / 2, h / 2)))
}

const dot = (g: G, x: number, y: number, r: number, color: number, alpha = 1) => {
    g.fillStyle(color, alpha)
    g.fillCircle(x, y, r)
}

const oval = (g: G, x: number, y: number, w: number, h: number, color: number, alpha = 1) => {
    g.fillStyle(color, alpha)
    g.fillEllipse(x, y, w, h)
}

const tri = (g: G, a: P, b: P, c: P, color: number, alpha = 1) => {
    g.fillStyle(color, alpha)
    g.fillTriangle(a.x, a.y, b.x, b.y, c.x, c.y)
}

const poly = (g: G, pts: P[], color: number, alpha = 1) => {
    g.fillStyle(color, alpha)
    g.fillPoints(pts.map(p => new Phaser.Math.Vector2(p.x, p.y)), true)
}

const limb = (g: G, a: P, b: P, w: number, color: number) => {
    const len = Math.hypot(b.x - a.x, b.y - a.y)
    g.save()
    g.translateCanvas(a.x, a.y)
    g.rotateCanvas(Math.atan2(b.y - a.y, b.x - a.x))
    rr(g, -w / 2, -w / 2, len + w, w, w / 2, color)
    g.restore()
}

const stick = (g: G, a: P, b: P, w: number, color: number) => {
    g.lineStyle(w, color, 1)
    g.lineBetween(a.x, a.y, b.x, b.y)
}

const mix = (a: number, b: number, t: number) => {
    const ch = (s: number) => Math.round(((a >> s) & 0xff) + (((b >> s) & 0xff) - ((a >> s) & 0xff)) * t)
    return (ch(16) << 16) | (ch(8) << 8) | ch(0)
}

const bankX = (y: number) => BANK.edge + ((y - BANK.top) * (BANK.foot - BANK.edge)) / (H - BANK.top)

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

const cloud = (g: G, x: number, y: number, s: number) => {
    oval(g, x, y, 120 * s, 46 * s, C.cloud, 0.95)
    dot(g, x - 26 * s, y - 12 * s, 26 * s, C.cloud, 0.95)
    dot(g, x + 14 * s, y - 20 * s, 32 * s, C.cloud, 0.95)
}

const tree = (g: G, x: number, base: number, s: number, tone: number = C.leaf) => {
    rr(g, x - 7 * s, base - 70 * s, 14 * s, 70 * s, 6 * s, C.trunk)
    dot(g, x, base - 92 * s, 40 * s, tone)
    dot(g, x - 26 * s, base - 72 * s, 26 * s, tone)
    dot(g, x + 26 * s, base - 74 * s, 28 * s, tone)
    dot(g, x - 8 * s, base - 108 * s, 20 * s, C.leafLight, 0.7)
}

const palm = (g: G, x: number, base: number, s: number) => {
    limb(g, { x, y: base }, { x: x + 10 * s, y: base - 110 * s }, 10 * s, C.trunk)
    const top = { x: x + 10 * s, y: base - 112 * s }
    for (let i = 0; i < 5; i++) {
        const a = -Math.PI + (i * Math.PI) / 4
        limb(g, top, { x: top.x + Math.cos(a) * 54 * s, y: top.y + Math.sin(a) * 30 * s + 18 * s }, 12 * s, C.leafDark)
    }
}

const strawHut = (g: G, x: number, base: number, s: number) => {
    rr(g, x - 46 * s, base - 50 * s, 92 * s, 50 * s, 8 * s, C.woodLight)
    rr(g, x - 12 * s, base - 36 * s, 24 * s, 36 * s, 10 * s, C.door)
    tri(g, { x: x - 66 * s, y: base - 44 * s }, { x: x + 66 * s, y: base - 44 * s }, { x, y: base - 120 * s }, C.straw)
    for (let i = -3; i <= 3; i++) stick(g, { x: x + i * 16 * s, y: base - 46 * s }, { x: x + i * 4 * s, y: base - 110 * s }, 2 * s, C.strawDark)
}

const woodHouse = (g: G, x: number, base: number, s: number, wall: number) => {
    rr(g, x - 44 * s, base - 64 * s, 88 * s, 64 * s, 4 * s, wall)
    tri(g, { x: x - 54 * s, y: base - 60 * s }, { x: x + 54 * s, y: base - 60 * s }, { x, y: base - 110 * s }, C.roof)
    rr(g, x - 30 * s, base - 46 * s, 22 * s, 20 * s, 3 * s, C.window)
    rr(g, x + 8 * s, base - 40 * s, 20 * s, 40 * s, 3 * s, C.door)
}

const building = (g: G, x: number, base: number, w: number, h: number, wall: number) => {
    rr(g, x - w / 2, base - h, w, h, 6, wall)
    rr(g, x - w / 2 - 4, base - h - 8, w + 8, 12, 4, mix(wall, 0x000000, 0.12))
    const cols = Math.max(2, Math.floor(w / 26))
    const rows = Math.max(2, Math.floor((h - 20) / 30))
    for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
            const wx = x - w / 2 + 10 + c * ((w - 20) / cols)
            rr(g, wx, base - h + 14 + r * 30, (w - 20) / cols - 8, 18, 3, (r + c) % 3 === 0 ? C.windowDark : C.window)
        }
}

const greenBuilding = (g: G, x: number, base: number, w: number, h: number, wall: number) => {
    rr(g, x - w / 2, base - h, w, h, w * 0.4, wall)
    g.fillStyle(C.grass, 1)
    g.slice(x, base - h + w * 0.42, w * 0.52, Math.PI, Math.PI * 2, false)
    g.fillPath()
    for (let r = 0; r < Math.floor((h - w * 0.5) / 30); r++)
        for (let c = -1; c <= 1; c += 2) dot(g, x + c * w * 0.2, base - h + w * 0.6 + r * 30, 8, C.windowDark)
    dot(g, x - w / 2 + 4, base - h * 0.4, 14, C.leaf)
    dot(g, x + w / 2 - 4, base - h * 0.65, 12, C.leafDark)
}

const turbine = (g: G, x: number, base: number, s: number) => {
    const hub = { x, y: base - 190 * s }
    rr(g, x - 4 * s, hub.y, 8 * s, 190 * s, 4 * s, C.white)
    ;[-Math.PI / 2, Math.PI / 6, (Math.PI * 5) / 6].forEach(a =>
        limb(g, hub, { x: hub.x + Math.cos(a) * 70 * s, y: hub.y + Math.sin(a) * 70 * s }, 9 * s, C.white),
    )
    dot(g, hub.x, hub.y, 8 * s, C.creamDark)
}

function paintBackground(g: G, era: number) {
    const today = era === 2
    for (let i = 0; i < 24; i++) {
        const y0 = (i * WATER.y) / 24
        g.fillStyle(mix(C.skyTop, C.skyLow, i / 23), 1)
        g.fillRect(0, y0, W, WATER.y / 24 + 1)
    }
    const clouds = [
        [
            [220, 170, 1],
            [610, 130, 0.8],
            [1010, 190, 1.1],
        ],
        [
            [330, 150, 0.9],
            [760, 200, 1],
            [1140, 140, 0.8],
        ],
        [
            [180, 200, 0.8],
            [560, 150, 1],
            [980, 130, 0.9],
        ],
        [
            [260, 160, 1],
            [700, 120, 0.9],
            [1100, 180, 1],
        ],
    ][era]
    clouds.forEach(([x, y, s]) => cloud(g, x, y, s))
    if (today) {
        g.lineStyle(4, C.white, 0.6)
        g.lineBetween(700, 118, 980, 96)
    }

    if (today) {
        rr(g, 600, 344, W - 600, 14, 4, C.concreteDark)
        for (let x = 640; x < W; x += 150) rr(g, x, 352, 16, 60, 4, C.concreteDark)
    }
    if (era === 3) {
        g.lineStyle(12, C.leafLight, 0.55)
        g.beginPath()
        g.arc(1010, 560, 270, Math.PI * 1.22, Math.PI * 1.78, false)
        g.strokePath()
    }

    const farTop = 405
    poly(
        g,
        [
            { x: 620, y: 470 },
            { x: 640, y: farTop + 8 },
            { x: 700, y: farTop },
            { x: W, y: farTop - 4 },
            { x: W, y: 470 },
        ],
        C.farLand,
    )
    for (let x = 640; x < W; x += 46) dot(g, x, farTop + 4, 16, C.farLandDark, 0.5)

    if (era === 0) {
        ;[640, 760, 1240].forEach((x, i) => tree(g, x, farTop + 2, 0.95 + i * 0.05))
        palm(g, 1080, farTop + 2, 1)
        palm(g, 905, farTop + 2, 0.9)
        strawHut(g, 830, farTop + 2, 0.85)
        strawHut(g, 990, farTop + 2, 0.75)
        strawHut(g, 1160, farTop + 2, 0.85)
        tree(g, 1010, farTop + 4, 0.7, C.leafDark)
    } else if (era === 1) {
        tree(g, 650, farTop + 2, 0.85)
        tree(g, 1250, farTop + 2, 0.9)
        rr(g, 1206, farTop - 150, 30, 150, 4, C.cream)
        tri(g, { x: 1200, y: farTop - 148 }, { x: 1242, y: farTop - 148 }, { x: 1221, y: farTop - 190 }, C.roofDark)
        woodHouse(g, 830, farTop + 2, 0.95, C.woodLight)
        woodHouse(g, 935, farTop + 2, 0.85, C.buildingA)
        woodHouse(g, 1040, farTop + 2, 1, C.buildingC)
        woodHouse(g, 1145, farTop + 2, 0.85, C.buildingB)
        ;[780, 1100].forEach(x => rr(g, x - 3, farTop - 120, 6, 122, 2, C.pole))
        g.lineStyle(2, C.wire, 0.8)
        g.lineBetween(780, farTop - 114, 1100, farTop - 110)
    } else if (era === 3) {
        tree(g, 650, farTop + 2, 0.9)
        tree(g, 770, farTop + 2, 0.8, C.leafDark)
        turbine(g, 1070, farTop + 2, 1)
        turbine(g, 1245, farTop + 2, 0.85)
        greenBuilding(g, 860, farTop + 2, 96, 120, C.villagerC)
        greenBuilding(g, 970, farTop + 2, 104, 156, C.buildingB)
        tree(g, 1035, farTop + 4, 0.7)
        greenBuilding(g, 1150, farTop + 2, 92, 112, C.buildingA)
        tree(g, 1210, farTop + 4, 0.65, C.leafDark)
    } else {
        tree(g, 660, farTop + 2, 0.8)
        building(g, 820, farTop + 2, 92, 128, C.buildingA)
        building(g, 925, farTop + 2, 104, 164, C.buildingB)
        building(g, 1035, farTop + 2, 92, 110, C.buildingC)
        building(g, 1140, farTop + 2, 100, 150, C.buildingA)
        rr(g, 1232, farTop - 210, 8, 212, 3, C.poleMetal)
        for (let k = 0; k < 4; k++) rr(g, 1222, farTop - 200 + k * 26, 28, 5, 2, C.poleMetal)
        rr(g, 760, farTop - 110, 6, 112, 3, C.poleMetal)
        rr(g, 760, farTop - 112, 34, 6, 3, C.poleMetal)
        dot(g, 792, farTop - 104, 7, C.window)
        g.lineStyle(2, C.wire, 0.7)
        g.lineBetween(763, farTop - 100, 1236, farTop - 150)
        rr(g, 600, farTop + 34, W - 600, 36, 4, C.concrete)
        for (let x = 610; x < W; x += 64) rr(g, x, farTop + 40, 3, 26, 1, C.concreteDark)
    }

    const top = today ? C.waterTopToday : C.waterTop
    const deep = today ? C.waterDeepToday : C.waterDeep
    for (let i = 0; i < 20; i++) {
        const y0 = WATER.y + (i * (H - WATER.y)) / 20
        const y1 = WATER.y + ((i + 1) * (H - WATER.y)) / 20 + 1
        poly(
            g,
            [
                { x: bankX(y0) - 2, y: y0 },
                { x: W, y: y0 },
                { x: W, y: y1 },
                { x: bankX(y1) - 2, y: y1 },
            ],
            mix(top, deep, i / 19),
        )
    }
    if (!today)
        [620, 840, 1080].forEach(x =>
            poly(
                g,
                [
                    { x, y: WATER.y },
                    { x: x + 46, y: WATER.y },
                    { x: x - 30, y: H - 30 },
                    { x: x - 60, y: H - 30 },
                ],
                C.white,
                0.08,
            ),
        )
    poly(
        g,
        [
            { x: bankX(WATER.bed), y: WATER.bed },
            { x: W, y: WATER.bed - 4 },
            { x: W, y: H },
            { x: bankX(H), y: H },
        ],
        C.sand,
    )
    for (let x = 580; x < W; x += 38) oval(g, x + (x % 7), WATER.bed + 10, 18, 9, C.sandDark, 0.8)
    const weeds = [[600, 700, 760, 980, 1120, 1210], [640, 900, 1190], [700], [600, 680, 770, 880, 990, 1080, 1170, 1240]][era]
    weeds.forEach((x, i) => {
        const h = 60 + ((i * 37) % 50)
        limb(g, { x, y: WATER.bed + 4 }, { x: x - 10, y: WATER.bed - h }, 9, C.weed)
        limb(g, { x: x + 10, y: WATER.bed + 4 }, { x: x + 18, y: WATER.bed - h * 0.7 }, 8, C.weedDark)
    })
    if (today) {
        g.lineStyle(10, C.tyre, 1)
        g.strokeEllipse(905, WATER.bed + 2, 64, 26)
        rr(g, 960, WATER.bed - 6, 26, 16, 4, C.poleMetal)
    }

    poly(
        g,
        [
            { x: 0, y: BANK.top },
            { x: BANK.edge, y: BANK.top },
            { x: BANK.foot, y: H },
            { x: 0, y: H },
        ],
        C.earth,
    )
    poly(
        g,
        [
            { x: BANK.edge - 40, y: BANK.top + 20 },
            { x: BANK.edge, y: BANK.top },
            { x: BANK.foot, y: H },
            { x: BANK.foot - 50, y: H },
        ],
        C.earthDark,
        0.5,
    )
    for (let i = 0; i < 26; i++) {
        const x = 30 + ((i * 97) % 400)
        const y = 486 + ((i * 53) % 220)
        if (x < bankX(y) - 30) oval(g, x, y, 16, 10, i % 3 === 0 ? C.pebble : C.earthLight, 0.7)
    }
    g.lineStyle(4, C.root, 0.5)
    g.lineBetween(60, BANK.top + 14, 90, BANK.top + 60)
    g.lineBetween(330, BANK.top + 14, 300, BANK.top + 52)
    rr(g, 0, BANK.top - 6, BANK.edge + 6, 18, 8, C.grass)
    for (let x = 6; x < BANK.edge; x += 22) tri(g, { x, y: BANK.top - 4 }, { x: x + 12, y: BANK.top - 4 }, { x: x + 4, y: BANK.top - 18 }, C.grassDark)
    if (today) rr(g, BANK.edge - 50, BANK.top - 6, 60, 26, 3, C.concrete)
    if (era === 3)
        [24, 70, 380, 430, 140].forEach((x, i) => {
            stick(g, { x, y: BANK.top }, { x, y: BANK.top - 18 }, 3, C.grassDark)
            dot(g, x, BANK.top - 20, 6, i % 2 === 0 ? C.scarf : C.butter)
            dot(g, x, BANK.top - 20, 2.5, C.white)
        })

    const hx = 250
    const hb = BANK.top
    if (era === 0) {
        stick(g, { x: 120, y: hb }, { x: 120, y: hb - 80 }, 5, C.woodDark)
        stick(g, { x: 168, y: hb }, { x: 168, y: hb - 80 }, 5, C.woodDark)
        stick(g, { x: 112, y: hb - 72 }, { x: 176, y: hb - 72 }, 4, C.woodDark)
        rr(g, hx - 80, hb - 86, 160, 86, 12, C.woodLight)
        for (let i = 0; i < 6; i++) stick(g, { x: hx - 70 + i * 28, y: hb - 82 }, { x: hx - 70 + i * 28, y: hb - 4 }, 3, C.wood)
        rr(g, hx - 22, hb - 64, 44, 64, 18, C.door)
        tri(g, { x: hx - 112, y: hb - 76 }, { x: hx + 112, y: hb - 76 }, { x: hx, y: hb - 206 }, C.straw)
        for (let i = -5; i <= 5; i++) stick(g, { x: hx + i * 20, y: hb - 78 }, { x: hx + i * 5, y: hb - 190 }, 3, C.strawDark)
    } else if (era === 1) {
        rr(g, hx - 100, hb - 110, 200, 110, 4, C.woodLight)
        for (let i = 0; i < 6; i++) rr(g, hx - 100, hb - 104 + i * 18, 200, 3, 1, C.wood)
        rr(g, hx + 48, hb - 196, 26, 60, 3, C.brickDark)
        tri(g, { x: hx - 122, y: hb - 104 }, { x: hx + 122, y: hb - 104 }, { x: hx, y: hb - 196 }, C.roof)
        rr(g, hx - 76, hb - 80, 50, 40, 4, C.window)
        rr(g, hx - 80, hb - 40, 58, 12, 3, C.roofDark)
        dot(g, hx - 66, hb - 42, 6, C.scarf)
        dot(g, hx - 46, hb - 42, 6, C.butter)
        rr(g, hx + 14, hb - 78, 44, 78, 4, C.door)
        for (let x = 10; x < 120; x += 20) rr(g, x, hb - 40, 8, 40, 3, C.woodLight)
        rr(g, 4, hb - 30, 120, 6, 3, C.wood)
    } else if (era === 3) {
        rr(g, hx - 100, hb - 132, 200, 132, 56, C.villagerC)
        g.fillStyle(C.grass, 1)
        g.slice(hx, hb - 100, 108, Math.PI, Math.PI * 2, false)
        g.fillPath()
        ;[-70, -30, 20, 64].forEach((dx, i) => dot(g, hx + dx, hb - 160 - (i % 2) * 18, 16, i % 2 === 0 ? C.leaf : C.leafDark))
        ;[-56, -16, 24].forEach((dx, i) => {
            const y = hb - 196 + (i === 1 ? -10 : 6)
            rr(g, hx + dx, y, 34, 14, 3, C.windowDark)
            g.lineStyle(1.5, C.white, 0.6)
            g.lineBetween(hx + dx + 17, y + 1, hx + dx + 17, y + 13)
        })
        dot(g, hx - 44, hb - 68, 30, C.creamDark)
        dot(g, hx - 44, hb - 68, 24, C.windowDark)
        dot(g, hx - 52, hb - 76, 8, C.white, 0.5)
        rr(g, hx + 18, hb - 88, 48, 88, 24, C.door)
        dot(g, hx + 56, hb - 44, 4, C.butter)
    } else {
        rr(g, hx - 104, hb - 124, 208, 124, 6, C.brick)
        rr(g, hx - 112, hb - 136, 224, 16, 4, C.brickDark)
        rr(g, hx + 30, hb - 176, 54, 40, 6, C.tank)
        stick(g, { x: hx - 60, y: hb - 136 }, { x: hx - 60, y: hb - 196 }, 4, C.poleMetal)
        stick(g, { x: hx - 84, y: hb - 186 }, { x: hx - 36, y: hb - 186 }, 4, C.poleMetal)
        stick(g, { x: hx - 78, y: hb - 172 }, { x: hx - 42, y: hb - 172 }, 4, C.poleMetal)
        rr(g, hx - 84, hb - 96, 84, 54, 6, C.windowDark)
        rr(g, hx - 80, hb - 92, 76, 46, 4, C.window)
        rr(g, hx + 26, hb - 86, 48, 86, 6, C.door)
    }
    if (era === 1) {
        rr(g, 470, WATER.y - 34, 8, 52, 3, C.woodDark)
        poly(
            g,
            [
                { x: 484, y: WATER.y - 18 },
                { x: 630, y: WATER.y - 18 },
                { x: 606, y: WATER.y + 10 },
                { x: 504, y: WATER.y + 10 },
            ],
            C.wood,
        )
        rr(g, 490, WATER.y - 22, 136, 8, 4, C.woodDark)
    }
    if (era === 3) {
        rr(g, 470, WATER.y - 40, 8, 60, 3, C.wood)
        rr(g, 520, WATER.y - 92, 6, 72, 3, C.poleMetal)
        rr(g, 606, WATER.y - 92, 6, 72, 3, C.poleMetal)
        rr(g, 500, WATER.y - 100, 132, 14, 5, C.windowDark)
        for (let x = 522; x < 632; x += 22) rr(g, x, WATER.y - 99, 2, 12, 1, C.white)
        poly(
            g,
            [
                { x: 486, y: WATER.y - 22 },
                { x: 646, y: WATER.y - 22 },
                { x: 622, y: WATER.y + 12 },
                { x: 506, y: WATER.y + 12 },
            ],
            C.white,
        )
        rr(g, 490, WATER.y - 10, 150, 8, 4, C.villagerB)
    }
    if (today) {
        rr(g, 470, WATER.y - 40, 8, 60, 3, C.poleMetal)
        poly(
            g,
            [
                { x: 486, y: WATER.y - 22 },
                { x: 650, y: WATER.y - 22 },
                { x: 628, y: WATER.y + 12 },
                { x: 506, y: WATER.y + 12 },
            ],
            C.white,
        )
        rr(g, 490, WATER.y - 10, 150, 8, 4, C.boat)
        rr(g, 642, WATER.y - 40, 22, 38, 6, C.motor)
        rr(g, 650, WATER.y - 6, 6, 26, 3, C.motor)
    }
}

type Mouth = 'smile' | 'grin' | 'open' | 'puff'

const face = (g: G, x: number, y: number, r: number, mouth: Mouth) => {
    dot(g, x, y, r, C.skin)
    dot(g, x + r * 0.9, y + r * 0.15, r * 0.26, C.skinDark)
    dot(g, x + r * 0.42, y - r * 0.12, r * 0.13, C.ink)
    dot(g, x + r * 0.46, y - r * 0.18, r * 0.05, C.white)
    dot(g, x + r * 0.2, y + r * 0.38, r * (mouth === 'puff' ? 0.34 : 0.2), C.cheek, 0.7)
    if (mouth === 'open') {
        oval(g, x + r * 0.58, y + r * 0.4, r * 0.34, r * 0.3, C.ink)
        return
    }
    if (mouth === 'puff') {
        dot(g, x + r * 0.62, y + r * 0.32, r * 0.3, C.skin)
        dot(g, x + r * 0.95, y + r * 0.34, r * 0.1, C.ink)
        return
    }
    g.lineStyle(3, C.ink, 1)
    g.beginPath()
    g.arc(x + r * 0.5, y + r * 0.32, r * (mouth === 'grin' ? 0.3 : 0.2), 0.2, Math.PI - 0.6)
    g.strokePath()
}

interface Look {
    shirt: number
    shirtDark: number
    pants: number
    feet: number
}

const LOOKS: Look[] = [
    { shirt: C.shirtOld, shirtDark: C.shirtOldDark, pants: C.pantsOld, feet: C.skinDark },
    { shirt: C.shirtGrand, shirtDark: C.shirtGrandDark, pants: C.pantsGrand, feet: C.boots },
    { shirt: C.coat, shirtDark: C.coatDark, pants: C.jeans, feet: C.sneaker },
    { shirt: C.cream, shirtDark: C.creamDark, pants: C.villagerB, feet: C.coat },
]

interface Stance {
    lean: number
    back: P
    front: P
    mouth: Mouth
}

const STANCES: Stance[] = [
    { lean: 0, back: { x: 112, y: 196 }, front: { x: 160, y: 190 }, mouth: 'smile' },
    { lean: 14, back: { x: 84, y: 168 }, front: { x: 214, y: 132 }, mouth: 'smile' },
    { lean: 0, back: { x: 92, y: 36 }, front: { x: 164, y: 36 }, mouth: 'grin' },
]

const HIP = { x: 120, y: 196 }

function figure(g: G, look: number, st: Stance, behind?: () => void, held?: () => void) {
    const { lean, back, front } = st
    const shoulder = { x: 124 + lean, y: 118 }
    const head = { x: 128 + lean * 1.4, y: 80 }
    const k = LOOKS[look]

    limb(g, { x: HIP.x - 8, y: HIP.y }, { x: HIP.x - 18 - lean * 0.4, y: 296 }, 22, k.pants)
    limb(g, { x: HIP.x + 10, y: HIP.y }, { x: HIP.x + 22, y: 296 }, 22, k.pants)
    rr(g, HIP.x - 38 - lean * 0.4, 288, 40, 16, 8, k.feet)
    rr(g, HIP.x + 10, 288, 40, 16, 8, k.feet)
    if (look === 0) {
        rr(g, HIP.x - 30, 250, 30, 14, 6, C.skin)
        rr(g, HIP.x + 10, 250, 30, 14, 6, C.skin)
    }
    if (look === 3) {
        rr(g, HIP.x - 34 - lean * 0.4, 260, 30, 36, 10, k.feet)
        rr(g, HIP.x + 12, 260, 30, 36, 10, k.feet)
    }

    limb(g, shoulder, back, 18, k.shirtDark)
    dot(g, back.x, back.y, 10, C.skin)
    behind?.()

    rr(g, HIP.x - 34 + lean * 0.5, shoulder.y - 8, 70, HIP.y - shoulder.y + 22, 24, k.shirt)
    if (look === 1)
        for (let n = 0; n < 4; n++) rr(g, HIP.x - 30 + lean * 0.5, shoulder.y + 8 + n * 18, 62, 4, 2, k.shirtDark)
    if (look === 2) rr(g, HIP.x - 2 + lean * 0.5, shoulder.y, 6, HIP.y - shoulder.y + 10, 3, C.coatDark)
    if (look === 3) {
        const strap = mix(C.villagerB, C.ink, 0.15)
        rr(g, HIP.x - 34 + lean * 0.5, shoulder.y + 34, 70, HIP.y - shoulder.y - 12, 20, C.villagerB)
        rr(g, HIP.x - 18 + lean * 0.5, shoulder.y + 10, 38, 40, 8, C.villagerB)
        rr(g, HIP.x - 22 + lean * 0.5, shoulder.y - 4, 8, 20, 4, strap)
        rr(g, HIP.x + 16 + lean * 0.5, shoulder.y - 4, 8, 20, 4, strap)
        rr(g, HIP.x - 8 + lean * 0.5, shoulder.y + 22, 18, 12, 4, strap)
    }

    face(g, head.x, head.y, 34, st.mouth)
    if (look === 0) {
        oval(g, head.x + 12, head.y + 26, 46, 30, C.beard)
        oval(g, head.x, head.y - 26, 112, 22, C.hat)
        rr(g, head.x - 30, head.y - 58, 60, 34, 16, C.hat)
        rr(g, head.x - 30, head.y - 34, 60, 6, 3, C.hatDark)
    } else if (look === 1) {
        g.fillStyle(C.hairGrey, 1)
        g.slice(head.x, head.y, 35, Math.PI * 0.95, Math.PI * 1.55, false)
        g.fillPath()
        rr(g, head.x - 34, head.y - 42, 62, 26, 14, C.cap)
        rr(g, head.x + 10, head.y - 24, 40, 10, 5, C.cap)
        oval(g, head.x + 30, head.y + 6, 18, 8, C.hairGrey)
    } else if (look === 2) {
        g.fillStyle(C.hairGirl, 1)
        g.slice(head.x, head.y, 36, Math.PI * 0.9, Math.PI * 1.9, false)
        g.fillPath()
        oval(g, head.x - 40, head.y + 6, 24, 46, C.hairGirl)
        dot(g, head.x - 34, head.y - 14, 8, C.scarf)
    } else {
        const curl = mix(C.hairGirl, C.ink, 0.2)
        dot(g, head.x - 12, head.y - 40, 16, C.hairGirl)
        dot(g, head.x - 38, head.y - 22, 15, C.hairGirl)
        g.fillStyle(C.hairGirl, 1)
        g.slice(head.x, head.y, 36, Math.PI * 0.9, Math.PI * 1.85, false)
        g.fillPath()
        ;[
            [-16, -46],
            [-6, -36],
            [-44, -26],
            [-34, -14],
            [-20, -30],
        ].forEach(([dx, dy]) => dot(g, head.x + dx, head.y + dy, 5, curl))
    }

    held?.()
    limb(g, shoulder, front, 18, k.shirt)
    dot(g, front.x, front.y, 11, C.skin)
}

function paintFisher(g: G, i: number) {
    const era = Math.floor(i / 3)
    const pose = i % 3
    const st = STANCES[pose]
    const behind = () => {
        if (era !== 2 || pose === 2) return
        rr(g, st.back.x - 12, st.back.y - 30, 24, 40, 5, C.phone)
        rr(g, st.back.x - 9, st.back.y - 26, 18, 30, 3, C.screen)
    }
    const held = () => {
        if (era === 0 && pose === 0) {
            stick(g, { x: 172, y: 304 }, { x: 172, y: 18 }, 7, C.spear)
            tri(g, { x: 166, y: 22 }, { x: 178, y: 22 }, { x: 172, y: 0 }, C.spearTip)
        }
        if (era === 0 && pose === 2) stick(g, { x: 40, y: 300 }, { x: 70, y: 30 }, 7, C.spear)
        if (era > 0) {
            const rod = era === 1 ? C.rodBamboo : C.rodModern
            if (pose === 0) {
                stick(g, { x: 172, y: 290 }, { x: 200, y: 8 }, 6, rod)
                dot(g, 176, 240, 9, C.poleMetal)
            } else if (pose === 1) {
                stick(g, { x: 190, y: 150 }, { x: 244, y: 40 }, 6, rod)
                dot(g, 200, 146, 9, C.poleMetal)
            } else stick(g, { x: 40, y: 300 }, { x: 64, y: 30 }, 6, rod)
        }
    }
    figure(g, era, st, behind, held)
}

const rotaryPhone = (g: G, x: number, y: number, s: number) => {
    rr(g, x - 26 * s, y - 28 * s, 52 * s, 28 * s, 10 * s, C.motor)
    rr(g, x - 28 * s, y - 36 * s, 56 * s, 10 * s, 5 * s, mix(C.motor, C.ink, 0.3))
    dot(g, x, y - 14 * s, 11 * s, C.cream)
    for (let n = 0; n < 6; n++) {
        const a = (n / 6) * Math.PI * 2
        dot(g, x + Math.cos(a) * 7 * s, y - 14 * s + Math.sin(a) * 7 * s, 1.8 * s, C.motor)
    }
}

const cord = (g: G, a: P, b: P, loops: number) => {
    g.lineStyle(2.5, C.motor, 1)
    g.beginPath()
    const steps = loops * 8
    for (let n = 0; n <= steps; n++) {
        const t = n / steps
        const x = a.x + (b.x - a.x) * t + Math.cos(t * loops * Math.PI * 2) * 4
        const y = a.y + (b.y - a.y) * t + Math.sin(t * Math.PI) * 24 + Math.sin(t * loops * Math.PI * 2) * 4
        if (n === 0) g.moveTo(x, y)
        else g.lineTo(x, y)
    }
    g.strokePath()
}

const handset = (g: G, x: number, y: number, s: number) => {
    rr(g, x - 9 * s, y - 25 * s, 18 * s, 50 * s, 8 * s, C.motor)
    rr(g, x - 13 * s, y - 29 * s, 26 * s, 14 * s, 6 * s, C.motor)
    rr(g, x - 13 * s, y + 15 * s, 26 * s, 14 * s, 6 * s, C.motor)
}

const smartphone = (g: G, x: number, y: number, w: number, h: number) => {
    rr(g, x - w / 2, y - h / 2, w, h, Math.min(w, h) * 0.25, C.phone)
    rr(g, x - w / 2 + 3, y - h / 2 + 3, w - 6, h - 6, Math.min(w, h) * 0.18, C.screen)
}

function paintTalk(g: G, i: number) {
    const rest = STANCES[0]
    if (i === 0) {
        const st: Stance = { lean: 0, back: { x: 168, y: 106 }, front: { x: 184, y: 100 }, mouth: 'puff' }
        figure(g, 0, st, undefined, () => {
            tri(g, { x: 156, y: 94 }, { x: 222, y: 58 }, { x: 226, y: 118 }, C.cream)
            dot(g, 186, 76, 9, C.creamDark)
            dot(g, 202, 70, 8, C.creamDark)
            oval(g, 222, 88, 24, 56, C.cheek)
            oval(g, 224, 88, 12, 38, C.brick)
        })
    } else if (i === 1) {
        const st: Stance = { lean: 0, back: { x: 108, y: 104 }, front: rest.front, mouth: 'grin' }
        rr(g, 184, 248, 8, 56, 3, C.woodDark)
        rr(g, 232, 248, 8, 56, 3, C.woodDark)
        rr(g, 176, 238, 72, 14, 5, C.wood)
        rotaryPhone(g, 212, 238, 1)
        figure(g, 1, st, undefined, () => {
            handset(g, 106, 86, 1)
            cord(g, { x: 106, y: 114 }, { x: 196, y: 214 }, 7)
        })
    } else if (i === 2) {
        const st: Stance = { lean: 0, back: rest.back, front: { x: 174, y: 108 }, mouth: 'open' }
        figure(g, 2, st, undefined, () => smartphone(g, 176, 100, 38, 16))
    } else if (i === 3) {
        const st: Stance = { lean: 0, back: { x: 160, y: 96 }, front: { x: 170, y: 106 }, mouth: 'open' }
        figure(g, 2, st)
        rr(g, 160, 86, 22, 30, 10, C.skin)
        dot(g, 180, 92, 8, C.skinDark)
    } else if (i < 7) figure(g, 3, STANCES[i - 4])
    else {
        const st: Stance = { lean: 0, back: rest.back, front: { x: 194, y: 150 }, mouth: 'smile' }
        figure(g, 3, st, undefined, () => {
            stick(g, { x: 172, y: 196 }, { x: 244, y: 40 }, 6, C.rodModern)
            dot(g, 186, 168, 9, C.poleMetal)
        })
    }
}

const fishShape = (g: G, x: number, y: number, len: number, body: number, dark: number, belly: number, flip: boolean) => {
    const h = len * 0.46
    const tail = flip ? -0.25 : 0.25
    tri(
        g,
        { x: x - len * 0.42, y },
        { x: x - len * 0.62, y: y - h * 0.55 + tail * h },
        { x: x - len * 0.62, y: y + h * 0.55 + tail * h },
        dark,
    )
    oval(g, x, y, len * 0.9, h, body)
    oval(g, x + len * 0.02, y + h * 0.16, len * 0.66, h * 0.46, belly)
    tri(g, { x: x - len * 0.1, y: y - h * 0.4 }, { x: x + len * 0.14, y: y - h * 0.42 }, { x: x - len * 0.18, y: y - h * 0.7 }, dark)
    dot(g, x + len * 0.28, y - h * 0.1, len * 0.06, C.white)
    dot(g, x + len * 0.29, y - h * 0.1, len * 0.035, C.ink)
}

function paintFish(g: G, i: number) {
    const cx = 96
    const cy = 64
    if (i === 0 || i === 1) fishShape(g, cx, cy, 110, C.fishSmall, C.fishSmallDark, C.fishBelly, i === 1)
    else if (i === 2 || i === 3) fishShape(g, cx + 6, cy, 168, C.fishBig, C.fishBigDark, C.fishBigBelly, i === 3)
    else if (i === 4)
        [
            [60, 44],
            [120, 40],
            [90, 66],
            [40, 86],
            [140, 82],
        ].forEach(([x, y], k) => fishShape(g, x, y, 54, C.fishSmall, C.fishSmallDark, C.fishBelly, k % 2 === 0))
    else if (i === 5) {
        rr(g, 46, 50, 96, 34, 16, C.bottle, 0.9)
        rr(g, 132, 58, 22, 18, 6, C.bottle, 0.9)
        rr(g, 150, 56, 12, 22, 4, C.bottleCap)
        rr(g, 64, 56, 40, 8, 4, C.white, 0.7)
    } else if (i === 6) {
        rr(g, 8, 60, 160, 8, 4, C.spear)
        tri(g, { x: 164, y: 54 }, { x: 164, y: 74 }, { x: 188, y: 64 }, C.spearTip)
    } else {
        dot(g, cx, cy + 6, 30, C.buoyDark)
        dot(g, cx, cy, 30, C.buoy)
        dot(g, cx - 10, cy - 10, 8, C.white, 0.6)
        rr(g, cx - 4, cy - 40, 8, 12, 3, C.poleMetal)
        dot(g, cx, cy - 42, 6, C.led)
    }
}

function paintVila(g: G, i: number) {
    const lift = i === 1 ? 16 : 0
    const people = [
        { x: 96, h: 150, body: C.villagerA, hair: C.hairGrey },
        { x: 160, h: 110, body: C.villagerC, hair: C.hairGirl },
        { x: 226, h: 160, body: C.villagerB, hair: C.door },
    ]
    people.forEach((p, k) => {
        const base = 180 - (i === 1 ? lift + (k % 2) * 6 : 0)
        const top = base - p.h
        const r = p.h * 0.17
        rr(g, p.x - 10, base - p.h * 0.36, 8, p.h * 0.36, 4, C.pantsGrand)
        rr(g, p.x + 2, base - p.h * 0.36, 8, p.h * 0.36, 4, C.pantsGrand)
        rr(g, p.x - r * 1.1, top + r * 1.7, r * 2.2, p.h * 0.42, r * 0.8, p.body)
        const sh = { x: p.x, y: top + r * 2.1 }
        const phones = i === 2 && k > 0
        const puzzled = i === 2 && k === 0
        const hold = { x: p.x, y: sh.y + p.h * 0.16 }
        const down = (side: number) => ({ x: sh.x + side * r * 1.4, y: sh.y + p.h * 0.26 })
        const up = (side: number) => ({ x: sh.x + side * r * 1.6, y: top - 4 })
        const open = (side: number) => ({ x: sh.x + side * r * 2.3, y: sh.y + r * 0.1 })
        const arm = (side: number) =>
            phones ? { x: hold.x + side * 4, y: hold.y + 4 } : puzzled ? open(side) : i === 1 || (side < 0 && k === 1 && i === 0) ? up(side) : down(side)
        limb(g, { x: sh.x - r * 0.8, y: sh.y }, arm(-1), 9, p.body)
        limb(g, { x: sh.x + r * 0.8, y: sh.y }, arm(1), 9, p.body)
        if (puzzled) {
            dot(g, open(-1).x, open(-1).y, 5, C.skin)
            dot(g, open(1).x, open(1).y, 5, C.skin)
        }
        if (k === 0) dot(g, p.x, top - r * 0.05, r * 0.5, p.hair)
        dot(g, p.x, top + r, r, C.skin)
        g.fillStyle(p.hair, 1)
        g.slice(p.x, top + r, r + 1, Math.PI, Math.PI * 2, false)
        g.fillPath()
        const eyeY = top + r * (phones ? 1.25 : 1.05)
        dot(g, p.x - r * 0.35, eyeY, 2.5, C.ink)
        dot(g, p.x + r * 0.35, eyeY, 2.5, C.ink)
        g.lineStyle(2, C.ink, 1)
        if (puzzled) {
            g.lineBetween(p.x - r * 0.55, top + r * 0.62, p.x - r * 0.2, top + r * 0.52)
            g.lineBetween(p.x + r * 0.2, top + r * 0.52, p.x + r * 0.55, top + r * 0.62)
            dot(g, p.x, top + r * 1.5, r * 0.14, C.ink)
        } else {
            g.beginPath()
            g.arc(p.x, top + r * 1.3, r * 0.35, 0.3, Math.PI - 0.3)
            g.strokePath()
        }
        if (phones) smartphone(g, hold.x, hold.y, 14, 20)
    })
}

const portrait = (g: G, cx: number, cy: number, shirt: number) => {
    dot(g, cx, cy, 58, C.creamDark)
    dot(g, cx, cy, 54, C.cream)
    rr(g, cx - 34, cy + 26, 68, 40, 20, shirt)
    dot(g, cx, cy + 2, 28, C.skin)
    dot(g, cx - 10, cy - 2, 3.5, C.ink)
    dot(g, cx + 10, cy - 2, 3.5, C.ink)
    dot(g, cx - 14, cy + 10, 5, C.cheek, 0.7)
    dot(g, cx + 14, cy + 10, 5, C.cheek, 0.7)
}

const smile = (g: G, x: number, y: number, r: number) => {
    g.lineStyle(3, C.ink, 1)
    g.beginPath()
    g.arc(x, y, r, 0.3, Math.PI - 0.3)
    g.strokePath()
}

function paintMarket(g: G, i: number) {
    const juca = i < 3
    const cx = 128
    dot(g, cx, cx, 118, C.cream)
    for (let n = 0; n < 6; n++) rr(g, 70 + n * 20, 30, 20, 26, 0, n % 2 ? C.white : juca ? C.leaf : C.scarf)
    rr(g, 30, 120, 56, 38, 6, C.wood)
    rr(g, 170, 120, 56, 38, 6, C.wood)
    ;[42, 58, 74].forEach(x => dot(g, x, 116, 9, C.oops))
    ;[182, 198, 214].forEach(x => dot(g, x, 116, 9, C.leaf))

    const shirt = juca ? C.shirtOld : C.buildingB
    const apron = juca ? C.leaf : C.scarf
    rr(g, 78, 130, 100, 80, 30, shirt)
    rr(g, 96, 146, 64, 64, 14, apron)
    dot(g, cx, 98, 32, C.skin)
    dot(g, cx - 12, 96, 3.5, C.ink)
    dot(g, cx + 12, 96, 3.5, C.ink)
    dot(g, cx - 18, 108, 5, C.cheek, 0.7)
    dot(g, cx + 18, 108, 5, C.cheek, 0.7)
    if (juca) {
        smile(g, cx, 114, 8)
        oval(g, cx, 111, 36, 10, C.hairGrey)
        oval(g, cx, 72, 96, 16, C.woodDark)
        rr(g, cx - 28, 44, 56, 32, 12, C.woodDark)
        rr(g, cx - 28, 64, 56, 6, 3, mix(C.woodDark, C.ink, 0.3))
    } else {
        smile(g, cx, 110, i === 4 ? 11 : 8)
        g.fillStyle(C.hairGirl, 1)
        g.slice(cx, 94, 34, Math.PI * 0.95, Math.PI * 2.05, false)
        g.fillPath()
        oval(g, cx - 30, 100, 14, 30, C.hairGirl)
        oval(g, cx + 30, 100, 14, 30, C.hairGirl)
    }

    rr(g, 52, 178, 152, 36, 8, C.woodLight)
    rr(g, 52, 178, 152, 8, 4, C.wood)

    const arm = (from: P, to: P) => {
        limb(g, from, to, 16, shirt)
        dot(g, to.x, to.y, 10, C.skin)
    }
    const left = { x: 92, y: 142 }
    const right = { x: 164, y: 142 }
    const rest = () => {
        arm(left, { x: 96, y: 182 })
        arm(right, { x: 160, y: 182 })
    }
    if (i === 0 || i === 5) rest()
    else if (i === 1) {
        rotaryPhone(g, 172, 186, 0.8)
        cord(g, { x: 98, y: 118 }, { x: 160, y: 168 }, 5)
        arm(left, { x: 100, y: 104 })
        handset(g, 96, 98, 0.7)
        arm(right, { x: 188, y: 74 })
    } else if (i === 2) {
        rotaryPhone(g, cx, 186, 0.8)
        limb(g, { x: 22, y: 126 }, { x: 46, y: 146 }, 14, C.villagerB)
        limb(g, { x: 234, y: 126 }, { x: 210, y: 146 }, 14, C.villagerA)
        rr(g, 36, 140, 30, 38, 4, C.woodLight)
        rr(g, 190, 140, 30, 38, 4, C.woodLight)
        arm(left, { x: 60, y: 150 })
        arm(right, { x: 196, y: 150 })
    } else if (i === 3) {
        smartphone(g, 84, 182, 36, 12)
        rr(g, 150, 160, 44, 20, 4, C.poleMetal)
        oval(g, 172, 156, 58, 10, mix(C.poleMetal, C.white, 0.4))
        ;[160, 174, 186].forEach(x => dot(g, x, 146, 8, C.oops))
        arm(left, { x: 150, y: 166 })
        arm(right, { x: 196, y: 160 })
    } else {
        arm(left, { x: 100, y: 104 })
        smartphone(g, 96, 96, 16, 28)
        arm(right, { x: 182, y: 124 })
        rr(g, 178, 102, 9, 18, 4, C.skin)
    }
}

const robot = (g: G, full: boolean) => {
    stick(g, { x: 172, y: 150 }, { x: 206, y: 134 }, 5, C.poleMetal)
    g.lineStyle(2, C.creamDark, 1)
    for (let k = -2; k <= 2; k++) {
        g.lineBetween(214 + k * 12, 140, 214 + k * 12, 194)
        g.lineBetween(184, 166 + k * 12, 244, 166 + k * 12)
    }
    if (full) {
        g.lineStyle(7, C.tyre, 1)
        g.strokeCircle(200, 180, 13)
        rr(g, 196, 148, 36, 14, 6, C.bottle)
        rr(g, 230, 151, 8, 8, 2, C.bottleCap)
        rr(g, 220, 166, 16, 24, 3, C.poleMetal)
    }
    g.lineStyle(5, C.poleMetal, 1)
    g.strokeCircle(214, 166, 32)
    oval(g, 118, 166, 164, 64, C.white)
    rr(g, 42, 170, 152, 26, 13, C.villagerB)
    stick(g, { x: 110, y: 90 }, { x: 110, y: 70 }, 3, C.poleMetal)
    dot(g, 110, 68, 6, C.led)
    dot(g, 110, 128, 40, C.white)
    rr(g, 84, 110, 60, 34, 14, C.sonarBg)
    oval(g, 108, 126, 10, 14, C.blip)
    oval(g, 128, 126, 10, 14, C.blip)
}

const nursery = (g: G, open: boolean) => {
    oval(g, 128, 200, 204, 46, C.woodDark)
    oval(g, 128, 194, 204, 40, C.wood)
    rr(g, 66, 110, 124, 86, 30, C.straw)
    g.lineStyle(3, C.strawDark, 1)
    for (let k = 0; k < 3; k++) g.lineBetween(72, 134 + k * 18, 184, 134 + k * 18)
    for (let x = 84; x < 180; x += 18) g.lineBetween(x, 118, x, 190)
    if (!open) {
        oval(g, 128, 110, 134, 26, C.strawDark)
        dot(g, 128, 98, 9, C.wood)
        return
    }
    oval(g, 128, 112, 124, 22, mix(C.strawDark, C.ink, 0.3))
    oval(g, 212, 92, 70, 16, C.strawDark)
    ;[
        { x: 96, y: 72, flip: false },
        { x: 138, y: 50, flip: true },
        { x: 178, y: 78, flip: false },
    ].forEach(f => fishShape(g, f.x, f.y, 46, C.fishSmall, C.fishSmallDark, C.fishBelly, f.flip))
}

const drone = (g: G) => {
    stick(g, { x: 128, y: 124 }, { x: 128, y: 160 }, 2, C.woodDark)
    stick(g, { x: 128, y: 160 }, { x: 128, y: 136 }, 4, C.leafDark)
    oval(g, 118, 140, 22, 10, C.leafLight)
    oval(g, 140, 136, 22, 10, C.leafLight)
    poly(
        g,
        [
            { x: 106, y: 160 },
            { x: 150, y: 160 },
            { x: 143, y: 196 },
            { x: 113, y: 196 },
        ],
        C.roof,
    )
    rr(g, 102, 156, 52, 10, 4, C.roofDark)
    rr(g, 40, 88, 176, 8, 4, C.leafDark)
    ;[56, 200].forEach(x => {
        rr(g, x - 3, 72, 6, 18, 3, C.leafDark)
        oval(g, x, 70, 76, 10, C.creamDark, 0.9)
    })
    rr(g, 76, 92, 104, 36, 16, C.leaf)
    oval(g, 160, 108, 9, 12, C.ink)
    oval(g, 172, 108, 7, 11, C.ink)
}

function paintInvent(g: G, i: number) {
    if (i < 2) robot(g, i === 1)
    else if (i < 4) nursery(g, i === 3)
    else if (i === 4) drone(g)
    else {
        tree(g, 128, 244, 1.55)
        g.fillStyle(C.trunk, 1)
        g.fillRect(128 - 11, 220, 22, 24)
    }
}

function paintIcon2(g: G, i: number) {
    const cx = 64
    const cy = 64
    if (i === 0) {
        stick(g, { x: 22, y: 110 }, { x: 96, y: 36 }, 9, C.spear)
        tri(g, { x: 102, y: 43 }, { x: 89, y: 30 }, { x: 114, y: 18 }, C.spearTip)
        dot(g, 92, 40, 6, C.woodDark)
    } else if (i === 1) {
        stick(g, { x: 24, y: 112 }, { x: 108, y: 22 }, 7, C.rodBamboo)
        ;[0.3, 0.55, 0.8].forEach(t => dot(g, 24 + 84 * t, 112 - 90 * t, 5, C.strawDark))
        dot(g, 42, 92, 12, C.poleMetal)
        dot(g, 42, 92, 4, C.motor)
        g.lineStyle(2, C.inkSoft, 1)
        g.beginPath()
        g.arc(110, 36, 12, -Math.PI / 2, Math.PI, false)
        g.strokePath()
    } else if (i === 2) {
        tri(g, { x: 20, y: 70 }, { x: 96, y: 24 }, { x: 104, y: 108 }, C.cream)
        ;[
            [48, 58],
            [66, 46],
            [82, 38],
        ].forEach(([x, y]) => dot(g, x, y, 7, C.creamDark))
        dot(g, 22, 70, 8, C.creamDark)
        oval(g, 98, 66, 30, 76, C.cheek)
        oval(g, 100, 66, 14, 48, C.brick)
    } else if (i === 3) {
        woodHouse(g, 30, 112, 0.42, C.buildingA)
        woodHouse(g, 98, 112, 0.42, C.buildingB)
        woodHouse(g, 64, 116, 0.5, C.buildingC)
        fishShape(g, 64, 30, 52, C.fishSmall, C.fishSmallDark, C.fishBelly, false)
    } else if (i === 4) {
        rr(g, 20, 40, 6, 72, 3, C.woodDark)
        rr(g, 102, 40, 6, 72, 3, C.woodDark)
        for (let n = 0; n < 6; n++) {
            const tone = n % 2 ? C.white : C.scarf
            rr(g, 13 + n * 17, 22, 17, 28, 0, tone)
            dot(g, 21.5 + n * 17, 50, 8.5, tone)
        }
        rr(g, 16, 82, 46, 30, 4, C.wood)
        rr(g, 66, 82, 46, 30, 4, C.wood)
        ;[28, 40, 52].forEach(x => dot(g, x, 80, 8, C.oops))
        ;[78, 90, 102].forEach(x => dot(g, x, 80, 8, C.leaf))
    } else if (i === 5) {
        portrait(g, cx, cy, C.villagerB)
        dot(g, cx - 26, cy - 30, 13, C.hairGirl)
        dot(g, cx + 26, cy - 30, 13, C.hairGirl)
        g.fillStyle(C.hairGirl, 1)
        g.slice(cx, cy - 2, 30, Math.PI * 1.05, Math.PI * 1.95, false)
        g.fillPath()
        ;[-30, -20, 20, 30].forEach(dx => dot(g, cx + dx, cy - 32 + Math.abs(dx) * 0.1, 4, mix(C.hairGirl, C.ink, 0.2)))
    } else if (i === 6) {
        dot(g, cx, 54, 38, C.sunGlow, 0.7)
        dot(g, cx, 54, 30, C.butter)
        rr(g, 50, 82, 28, 10, 4, C.poleMetal)
        rr(g, 53, 94, 22, 8, 4, C.motor)
        stick(g, { x: cx, y: 76 }, { x: cx, y: 48 }, 4, C.leafDark)
        oval(g, 54, 50, 20, 10, C.leaf)
        oval(g, 74, 46, 20, 10, C.leaf)
        dot(g, 50, 38, 6, C.white, 0.6)
    } else {
        portrait(g, cx, cy, C.villagerA)
        dot(g, cx, cy - 34, 13, C.beard)
        g.fillStyle(C.beard, 1)
        g.slice(cx, cy - 2, 30, Math.PI * 1.02, Math.PI * 1.98, false)
        g.fillPath()
        oval(g, cx - 27, cy + 2, 10, 22, C.beard)
        oval(g, cx + 27, cy + 2, 10, 22, C.beard)
    }
}

function paintIcon(g: G, i: number) {
    const cx = 64
    const cy = 64
    if (i === 0) fishShape(g, cx + 4, cy, 96, C.fishSmall, C.fishSmallDark, C.fishBelly, false)
    else if (i === 1) fishShape(g, cx + 6, cy, 108, C.fishBig, C.fishBigDark, C.fishBigBelly, false)
    else if (i === 2) {
        g.fillStyle(C.butter, 1)
        g.slice(cx + 26, 30, 20, Math.PI * 0.5, Math.PI * 1.5, false)
        g.fillPath()
        ;[
            [44, 70],
            [84, 64],
            [64, 96],
        ].forEach(([x, y]) => fishShape(g, x, y, 46, C.fishSmall, C.fishSmallDark, C.fishBelly, false))
    } else if (i === 3) {
        g.lineStyle(4, C.woodDark, 1)
        g.beginPath()
        g.arc(cx, cy - 70, 84, Math.PI * 0.28, Math.PI * 0.72, false)
        g.strokePath()
        ;[C.scarf, C.butter, C.accent, C.yes, C.time].forEach((tone, k) => {
            const a = Math.PI * (0.3 + k * 0.1)
            const x = cx + Math.cos(a) * 84
            const y = cy - 70 + Math.sin(a) * 84
            tri(g, { x: x - 12, y: y - 2 }, { x: x + 12, y: y - 2 }, { x, y: y + 26 }, tone)
        })
    }
    else if (i >= 4 && i <= 6) {
        const era = i - 4
        portrait(g, cx, cy, [C.shirtOld, C.shirtGrand, C.coat][era])
        if (era === 0) {
            oval(g, cx, cy + 20, 40, 24, C.beard)
            oval(g, cx, cy - 22, 92, 18, C.hat)
            rr(g, cx - 24, cy - 50, 48, 30, 14, C.hat)
        } else if (era === 1) {
            rr(g, cx - 28, cy - 34, 56, 22, 11, C.cap)
            rr(g, cx - 4, cy - 18, 38, 8, 4, C.cap)
            oval(g, cx - 26, cy - 4, 10, 16, C.hairGrey)
        } else {
            g.fillStyle(C.coat, 1)
            g.slice(cx, cy, 32, Math.PI * 0.95, Math.PI * 2.05, false)
            g.fillPath()
            dot(g, cx, cy + 2, 24, C.skin)
            dot(g, cx - 9, cy, 3.5, C.ink)
            dot(g, cx + 9, cy, 3.5, C.ink)
            g.fillStyle(C.hairGirl, 1)
            g.slice(cx, cy - 4, 24, Math.PI * 1.05, Math.PI * 1.95, false)
            g.fillPath()
        }
    } else {
        rr(g, cx - 32, cy - 54, 64, 108, 14, C.phone)
        rr(g, cx - 26, cy - 44, 52, 86, 8, C.sonarBg)
        rr(g, cx - 24, cy - 12, 48, 2, 1, C.sonarGrid)
        rr(g, cx - 24, cy + 14, 48, 2, 1, C.sonarGrid)
        oval(g, cx - 6, cy - 22, 22, 11, C.blip)
        oval(g, cx + 8, cy + 26, 26, 13, C.blip)
        rr(g, cx - 10, cy + 46, 20, 4, 2, C.sonarGrid)
    }
}

export function ensureArt(scene: Phaser.Scene) {
    BACKGROUNDS.forEach((key, era) => bakeImage(scene, key, W, H, g => paintBackground(g, era)))
    bakeSheet(scene, FISHER_SHEET, paintFisher)
    bakeSheet(scene, FISH_SHEET, paintFish)
    bakeSheet(scene, VILA_SHEET, paintVila)
    bakeSheet(scene, ICON_SHEET, paintIcon)
    bakeSheet(scene, TALK_SHEET, paintTalk)
    bakeSheet(scene, MARKET_SHEET, paintMarket)
    bakeSheet(scene, INVENT_SHEET, paintInvent)
    bakeSheet(scene, ICON2_SHEET, paintIcon2)
}

