import Phaser from 'phaser'
import { CLIENT_SHEET, COUNTER_KEY, DISH_SHEETS, OBJECT_SHEET, OBJECT_SHEET_2, WALL_KEY, type Sheet } from '../data/files'
import { C } from '../data/theme'

type G = Phaser.GameObjects.Graphics
type P = { x: number; y: number }
type Radius = number | { tl: number; tr: number; bl: number; br: number }

const INK = C.line
const LW = 5

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
    bakeImage(scene, WALL_KEY, 1280, 720, wall)
    bakeImage(scene, COUNTER_KEY, 1280, 340, counter)
    bakeSheet(scene, CLIENT_SHEET, (g, i) => animal(g, Math.floor(i / 3), i % 3))
    bakeSheet(scene, OBJECT_SHEET, object)
    bakeSheet(scene, DISH_SHEETS.cereal, cerealFrame)
    bakeSheet(scene, DISH_SHEETS.hotdog, hotdogFrame)
    bakeSheet(scene, DISH_SHEETS.smoothie, smoothieFrame)
    bakeSheet(scene, OBJECT_SHEET_2, object2)
    bakeSheet(scene, DISH_SHEETS.sandwich, sandwichFrame)
    bakeSheet(scene, DISH_SHEETS.sundae, sundaeFrame)
    bakeSheet(scene, DISH_SHEETS.pave, paveFrame)
}

// ───────────────────────────────────────────── N2: objetos e preparos

function object2(g: G, i: number) {
    const cx = 128
    if (i === 0) {
        box(g, 40, 44, 176, 168, 34, C.crust)
        box(g, 56, 60, 144, 136, 26, C.bread, 0)
        return
    }
    if (i === 1) {
        poly(g, [{ x: 28, y: 190 }, { x: 228, y: 190 }, { x: 228, y: 96 }, { x: 60, y: 66 }], C.cheese)
        disc(g, 96, 138, 16, C.butter, 3)
        disc(g, 164, 150, 12, C.butter, 3)
        return
    }
    if (i === 2) {
        poly(g, [{ x: 58, y: 30 }, { x: 198, y: 30 }, { x: 156, y: 170 }, { x: 100, y: 170 }], C.glass)
        box(g, 118, 168, 20, 34, 4, C.glass)
        box(g, 76, 198, 104, 22, 10, C.glass)
        return
    }
    if (i === 3) {
        disc(g, cx, 128, 92, C.scoop)
        g.fillStyle(C.white, 0.5)
        g.fillEllipse(96, 92, 44, 24)
        return
    }
    if (i === 4) {
        poly(g, [{ x: 112, y: 62 }, { x: 122, y: 12 }, { x: 134, y: 12 }, { x: 144, y: 62 }], C.syrup)
        box(g, 72, 58, 112, 178, 28, C.syrup)
        g.fillStyle(C.white, 0.35)
        g.fillRoundedRect(86, 74, 12, 88, 6)
        return
    }
    if (i === 5) {
        box(g, 28, 88, 200, 84, 22, C.cookie)
        ;[52, 92, 132, 172].forEach(x => disc(g, x + 12, 130, 7, C.crust, 0))
        return
    }
    if (i === 6) {
        poly(g, [{ x: 112, y: 62 }, { x: 122, y: 12 }, { x: 134, y: 12 }, { x: 144, y: 62 }], C.cream2)
        box(g, 72, 58, 112, 178, 28, C.cream2)
        drop(g, cx, 160, 24, C.pink)
        return
    }
    if (i === 7) {
        disc(g, cx, 142, 78, C.berry)
        poly(g, [{ x: 84, y: 76 }, { x: 128, y: 44 }, { x: 172, y: 76 }, { x: 128, y: 92 }], C.yes)
    }
}

function sandwichFrame(g: G, i: number) {
    if (i > 4) return
    box(g, 24, 276, 272, 26, 10, C.board)
    if (i >= 1) box(g, 44, 244, 232, 34, 12, C.bread)
    if (i >= 2) box(g, 38, 228, 244, 20, 6, C.cheese)
    if (i >= 3) {
        const zig: P[] = []
        for (let k = 0; k <= 8; k++) zig.push({ x: 56 + k * 26, y: k % 2 ? 218 : 230 })
        g.lineStyle(10, C.ketchup, 1)
        g.strokePoints(zig, false)
    }
    if (i >= 4) box(g, 44, 186, 232, 40, 16, C.bread)
}

function sundaeFrame(g: G, i: number) {
    if (i > 5) return
    oval(g, 160, 286, 230, 36, C.plate)
    if (i === 0) return
    if (i >= 2) disc(g, 160, 116, 56, C.scoop)
    if (i >= 3) {
        g.fillStyle(C.syrup, 1)
        g.fillRoundedRect(112, 80, 96, 22, 10)
    }
    if (i >= 4) disc(g, 160, 66, 46, C.scoop)
    if (i >= 5) {
        g.fillStyle(C.syrup, 1)
        g.fillRoundedRect(124, 30, 72, 20, 10)
    }
    poly(g, [{ x: 86, y: 120 }, { x: 234, y: 120 }, { x: 190, y: 228 }, { x: 130, y: 228 }], C.glass)
    box(g, 148, 226, 24, 40, 4, C.glass)
    box(g, 110, 262, 100, 20, 10, C.glass)
}

function paveFrame(g: G, i: number) {
    if (i > 5) return
    oval(g, 160, 280, 296, 44, C.plate)
    const layer = (y: number) => box(g, 48, y, 224, 34, 12, C.cookie)
    const cream = (y: number) => box(g, 54, y, 212, 20, 10, C.cream2)
    if (i >= 1) layer(240)
    if (i >= 2) cream(222)
    if (i >= 3) layer(190)
    if (i >= 4) cream(172)
    if (i >= 5) disc(g, 160, 146, 30, C.berry)
}

// ───────────────────────────────────────────── primitivas

function disc(g: G, x: number, y: number, r: number, fill: number, line = LW) {
    g.fillStyle(fill, 1)
    g.fillCircle(x, y, r)
    if (line > 0) {
        g.lineStyle(line, INK, 1)
        g.strokeCircle(x, y, r)
    }
}

function oval(g: G, x: number, y: number, w: number, h: number, fill: number, line = LW) {
    g.fillStyle(fill, 1)
    g.fillEllipse(x, y, w, h)
    if (line > 0) {
        g.lineStyle(line, INK, 1)
        g.strokeEllipse(x, y, w, h)
    }
}

function box(g: G, x: number, y: number, w: number, h: number, r: Radius, fill: number, line = LW) {
    g.fillStyle(fill, 1)
    g.fillRoundedRect(x, y, w, h, r)
    if (line > 0) {
        g.lineStyle(line, INK, 1)
        g.strokeRoundedRect(x, y, w, h, r)
    }
}

function poly(g: G, points: P[], fill: number, line = LW) {
    g.fillStyle(fill, 1)
    g.fillPoints(points, true)
    if (line > 0) {
        g.lineStyle(line, INK, 1)
        g.strokePoints(points, true)
    }
}

function arcLine(g: G, x: number, y: number, r: number, from: number, to: number, width = LW, color: number = INK) {
    g.lineStyle(width, color, 1)
    g.beginPath()
    g.arc(x, y, r, Phaser.Math.DegToRad(from), Phaser.Math.DegToRad(to), false)
    g.strokePath()
}

function ellipsePts(cx: number, cy: number, rx: number, ry: number, from = 0, to = 360, n = 32): P[] {
    const pts: P[] = []
    for (let i = 0; i <= n; i++) {
        const a = Phaser.Math.DegToRad(from + ((to - from) * i) / n)
        pts.push({ x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * ry })
    }
    return pts
}

function fatLine(g: G, pts: P[], width: number, fill: number) {
    g.lineStyle(width + LW * 2, INK, 1)
    g.strokePoints(pts, false)
    pts.forEach(p => {
        g.fillStyle(INK, 1)
        g.fillCircle(p.x, p.y, width / 2 + LW)
    })
    g.lineStyle(width, fill, 1)
    g.strokePoints(pts, false)
    pts.forEach(p => {
        g.fillStyle(fill, 1)
        g.fillCircle(p.x, p.y, width / 2)
    })
}

function drop(g: G, x: number, y: number, s: number, fill: number) {
    poly(
        g,
        [
            { x, y: y - s * 1.5 },
            ...ellipsePts(x, y, s, s, -30, 210, 12),
        ],
        fill,
        3,
    )
}

// ───────────────────────────────────────────── o cenário

function wall(g: G) {
    g.fillStyle(C.wall, 1)
    g.fillRect(0, 0, 1280, 720)
    g.fillStyle(C.tile, 1)
    g.fillRect(0, 260, 1280, 460)
    g.lineStyle(3, C.tileLine, 1)
    for (let y = 260; y < 720; y += 62) g.lineBetween(0, y, 1280, y)
    for (let row = 0; row < 8; row++) {
        const y = 260 + row * 62
        for (let x = row % 2 ? 0 : 62; x < 1280; x += 124) g.lineBetween(x, y, x, y + 62)
    }

    box(g, 1118, 92, 140, 176, 10, C.sky, 6)
    g.lineStyle(6, C.frame, 1)
    g.strokeRoundedRect(1118, 92, 140, 176, 10)
    g.lineBetween(1188, 92, 1188, 268)
    g.fillStyle(C.white, 0.85)
    g.fillEllipse(1160, 150, 58, 24)
    g.fillEllipse(1220, 200, 46, 18)
    poly(g, [{ x: 1112, y: 84 }, { x: 1168, y: 84 }, { x: 1134, y: 196 }, { x: 1112, y: 214 }], C.curtain, 4)
    poly(g, [{ x: 1264, y: 84 }, { x: 1208, y: 84 }, { x: 1242, y: 196 }, { x: 1264, y: 214 }], C.curtain, 4)
    box(g, 1100, 266, 176, 18, 6, C.shelf, 4)

    box(g, 1136, 314, 118, 12, 5, C.shelf, 4)
    box(g, 1152, 274 + 8, 36, 32, 8, C.mint, 4)
    box(g, 1204, 276 + 6, 36, 32, 8, C.lilac, 4)
}

function counter(g: G) {
    g.fillStyle(C.counterTop, 1)
    g.fillRect(0, 8, 1280, 272)
    g.lineStyle(3, C.counterLine, 1)
    ;[92, 176, 248].forEach(y => g.lineBetween(0, y, 1280, y))
    g.fillStyle(C.counterEdge, 1)
    g.fillRect(0, 280, 1280, 60)
    g.fillStyle(C.counterEdgeDark, 1)
    g.fillRect(0, 280, 1280, 8)
    g.lineStyle(6, INK, 1)
    g.lineBetween(0, 8, 1280, 8)
    g.lineBetween(0, 280, 1280, 280)
}

// ───────────────────────────────────────────── os animais

function eyes(g: G, mood: number, cx: number, y: number, gap: number) {
    if (mood === 1) {
        arcLine(g, cx - gap, y + 8, 18, 200, 340, 6)
        arcLine(g, cx + gap, y + 8, 18, 200, 340, 6)
        return
    }
    if (mood === 2) {
        g.lineStyle(6, INK, 1)
        g.lineBetween(cx - gap - 18, y - 10, cx - gap + 14, y + 4)
        g.lineBetween(cx - gap - 18, y + 18, cx - gap + 14, y + 4)
        g.lineBetween(cx + gap + 18, y - 10, cx + gap - 14, y + 4)
        g.lineBetween(cx + gap + 18, y + 18, cx + gap - 14, y + 4)
        return
    }
    ;[-gap, gap].forEach(dx => {
        oval(g, cx + dx, y, 38, 46, C.black, 0)
        g.fillStyle(C.white, 1)
        g.fillCircle(cx + dx + 7, y - 11, 9)
        g.fillCircle(cx + dx - 8, y + 11, 4)
    })
}

function mouth(g: G, mood: number, cx: number, y: number) {
    if (mood === 0) {
        oval(g, cx, y + 4, 34, 28, C.mouth, 4)
        g.fillStyle(C.tongue, 1)
        g.fillEllipse(cx, y + 11, 20, 11)
        return
    }
    if (mood === 1) {
        arcLine(g, cx, y - 6, 22, 25, 155, 5)
        return
    }
    g.lineStyle(5, INK, 1)
    g.strokePoints(
        [
            { x: cx - 26, y: y + 4 },
            { x: cx - 13, y: y - 6 },
            { x: cx, y: y + 4 },
            { x: cx + 13, y: y - 6 },
            { x: cx + 26, y: y + 4 },
        ],
        false,
    )
    box(g, cx - 4, y + 2, 24, 24, { tl: 0, tr: 0, bl: 12, br: 12 }, C.tongue, 4)
}

function bodyAndPaws(g: G, fur: number, belly: number) {
    box(g, 66, 250, 188, 146, { tl: 80, tr: 80, bl: 0, br: 0 }, fur)
    g.fillStyle(belly, 1)
    g.fillEllipse(160, 330, 110, 110)
}

function paws(g: G, fur: number) {
    disc(g, 104, 318, 28, fur)
    disc(g, 216, 318, 28, fur)
}

function animal(g: G, row: number, mood: number) {
    const cx = 160
    if (row === 0) {
        bodyAndPaws(g, C.catFur, C.catLight)
        poly(g, [{ x: 58, y: 118 }, { x: 56, y: 12 }, { x: 138, y: 58 }], C.catFur)
        poly(g, [{ x: 262, y: 118 }, { x: 264, y: 12 }, { x: 182, y: 58 }], C.catFur)
        poly(g, [{ x: 74, y: 88 }, { x: 72, y: 38 }, { x: 112, y: 62 }], C.nose, 0)
        poly(g, [{ x: 246, y: 88 }, { x: 248, y: 38 }, { x: 208, y: 62 }], C.nose, 0)
        disc(g, cx, 152, 112, C.catFur)
        g.lineStyle(9, C.catStripe, 1)
        g.lineBetween(cx, 46, cx, 82)
        g.lineBetween(cx - 32, 52, cx - 26, 84)
        g.lineBetween(cx + 32, 52, cx + 26, 84)
        g.lineBetween(52, 150, 74, 156)
        g.lineBetween(268, 150, 246, 156)
        g.fillStyle(C.catLight, 1)
        g.fillEllipse(cx, 200, 116, 76)
        eyes(g, mood, cx, 134, 50)
        g.fillStyle(C.cheek, 0.6)
        g.fillEllipse(cx - 74, 186, 28, 15)
        g.fillEllipse(cx + 74, 186, 28, 15)
        poly(g, [{ x: cx - 11, y: 172 }, { x: cx + 11, y: 172 }, { x: cx, y: 185 }], C.nose, 3)
        g.lineStyle(3, INK, 1)
        ;[-1, 1].forEach(s => {
            g.lineBetween(cx + s * 62, 196, cx + s * 118, 186)
            g.lineBetween(cx + s * 62, 208, cx + s * 118, 212)
        })
        mouth(g, mood, cx, 208)
        paws(g, C.catLight)
    } else if (row === 1) {
        bodyAndPaws(g, C.dogFur, C.dogLight)
        disc(g, cx, 152, 110, C.dogFur)
        g.fillStyle(C.dogDark, 0.9)
        g.fillEllipse(cx + 48, 128, 74, 84)
        oval(g, 48, 150, 62, 146, C.dogDark)
        oval(g, 272, 150, 62, 146, C.dogDark)
        g.fillStyle(C.dogLight, 1)
        g.fillEllipse(cx, 204, 120, 84)
        eyes(g, mood, cx, 128, 48)
        g.fillStyle(C.cheek, 0.55)
        g.fillEllipse(cx - 74, 176, 26, 14)
        g.fillEllipse(cx + 74, 176, 26, 14)
        oval(g, cx, 176, 36, 26, C.black, 0)
        g.fillStyle(C.white, 0.85)
        g.fillEllipse(cx - 6, 170, 11, 6)
        mouth(g, mood, cx, 214)
        if (mood === 0) {
            box(g, cx - 12, 226, 26, 30, { tl: 0, tr: 0, bl: 13, br: 13 }, C.tongue, 4)
        }
        paws(g, C.dogLight)
    } else {
        bodyAndPaws(g, C.monkeyFur, C.monkeyFace)
        disc(g, 40, 150, 40, C.monkeyFur)
        disc(g, 280, 150, 40, C.monkeyFur)
        g.fillStyle(C.monkeyFace, 1)
        g.fillCircle(40, 150, 23)
        g.fillCircle(280, 150, 23)
        disc(g, cx, 150, 112, C.monkeyFur)
        poly(g, [{ x: cx - 18, y: 46 }, { x: cx - 6, y: 16 }, { x: cx + 4, y: 40 }, { x: cx + 18, y: 20 }, { x: cx + 18, y: 48 }], C.monkeyFur)
        g.fillStyle(C.monkeyFace, 1)
        g.fillCircle(cx - 42, 130, 52)
        g.fillCircle(cx + 42, 130, 52)
        g.fillEllipse(cx, 196, 160, 104)
        eyes(g, mood, cx, 128, 44)
        g.fillStyle(C.cheek, 0.55)
        g.fillEllipse(cx - 70, 184, 26, 14)
        g.fillEllipse(cx + 70, 184, 26, 14)
        g.fillStyle(INK, 1)
        g.fillEllipse(cx - 9, 176, 8, 11)
        g.fillEllipse(cx + 9, 176, 8, 11)
        mouth(g, mood, cx, 214)
        paws(g, C.monkeyFace)
    }
    if (mood === 2) drop(g, cx + 96, 76, 13, C.sweat)
}

// ───────────────────────────────────────────── os objetos da bancada

function object(g: G, i: number) {
    const cx = 128
    if (i === 0) {
        poly(g, ellipsePts(cx, 92, 100, 118, 0, 180), C.bowl)
        oval(g, cx, 92, 200, 44, C.bowlIn)
        arcLine(g, cx, 90, 86, 30, 150, 8, C.bowlDark)
        return
    }
    if (i === 1) {
        box(g, 58, 24, 140, 208, 12, C.box)
        g.fillStyle(C.boxDark, 1)
        g.fillRect(61, 26, 134, 26)
        g.fillStyle(C.cream, 1)
        g.fillEllipse(cx, 150, 96, 96)
        ;[
            [-22, -18],
            [12, -26],
            [28, 4],
            [-6, 2],
            [-28, 18],
            [10, 26],
        ].forEach(([dx, dy]) => disc(g, cx + dx, 150 + dy, 13, C.cereal, 3))
        return
    }
    if (i === 2) {
        poly(g, [{ x: 66, y: 76 }, { x: 128, y: 20 }, { x: 190, y: 76 }], C.carton)
        box(g, 62, 74, 132, 160, 8, C.milk)
        g.fillStyle(C.carton, 1)
        g.fillRect(65, 76, 126, 28)
        drop(g, cx, 170, 28, C.carton)
        return
    }
    if (i === 3) {
        box(g, 18, 84, 220, 58, 28, C.bunBack)
        box(g, 18, 112, 220, 64, 30, C.bun)
        g.fillStyle(C.bunLight, 1)
        g.fillRoundedRect(46, 124, 150, 10, 5)
        return
    }
    if (i === 4) {
        box(g, 18, 96, 220, 64, 32, C.sausage)
        g.fillStyle(C.sausageDark, 0.6)
        g.fillRoundedRect(30, 140, 196, 12, 6)
        g.fillStyle(C.white, 0.75)
        g.fillRoundedRect(50, 108, 96, 9, 4)
        return
    }
    if (i === 5) {
        poly(g, [{ x: 112, y: 62 }, { x: 122, y: 12 }, { x: 134, y: 12 }, { x: 144, y: 62 }], C.ketchupDark)
        box(g, 72, 58, 112, 178, 28, C.ketchup)
        disc(g, cx, 150, 34, C.ketchupDark, 4)
        g.fillStyle(C.white, 0.5)
        g.fillRoundedRect(86, 74, 12, 88, 6)
        g.fillStyle(C.yes, 1)
        g.fillTriangle(cx - 14, 122, cx + 14, 122, cx, 136)
        return
    }
    if (i === 6) {
        const curve = ellipsePts(60, 40, 138, 168, 8, 80, 18)
        fatLine(g, curve, 46, C.banana)
        g.lineStyle(5, C.bananaDark, 0.7)
        g.strokePoints(ellipsePts(60, 40, 128, 158, 14, 70, 14), false)
        const tip = curve[curve.length - 1]
        g.fillStyle(C.bananaDark, 1)
        g.fillCircle(tip.x, tip.y, 13)
        const top = curve[0]
        poly(g, [{ x: top.x + 8, y: top.y + 6 }, { x: top.x - 44, y: top.y - 4 }, { x: top.x - 10, y: top.y + 40 }], C.bananaDark, 4)
        poly(g, [{ x: top.x + 24, y: top.y + 20 }, { x: top.x + 56, y: top.y - 24 }, { x: top.x + 54, y: top.y + 42 }], C.banana, 4)
        disc(g, top.x, top.y - 12, 22, C.bananaIn, 4)
        return
    }
    if (i === 7) {
        box(g, 108, 62, 40, 48, 10, C.lid)
        box(g, 26, 104, 204, 58, 18, C.lid)
        g.fillStyle(C.blenderBase, 1)
        g.fillRoundedRect(40, 114, 176, 12, 6)
        return
    }
    box(g, 42, 164, 172, 56, 16, C.blenderDark)
    disc(g, cx, 112, 80, C.buttonDark)
    disc(g, cx, 102, 74, C.button)
    g.lineStyle(11, C.white, 1)
    g.beginPath()
    g.arc(cx, 106, 34, Phaser.Math.DegToRad(-50), Phaser.Math.DegToRad(230), false)
    g.strokePath()
    g.lineBetween(cx, 62, cx, 104)
}

// ───────────────────────────────────────────── preparo: cereal

const CEREAL_BITS = [
    [-64, 2],
    [-34, -8],
    [0, -12],
    [34, -8],
    [64, 2],
    [-46, 10],
    [-14, 6],
    [18, 8],
    [46, 10],
]

function placemat(g: G) {
    oval(g, 160, 286, 296, 54, C.mat)
    g.lineStyle(4, C.matDark, 1)
    g.strokeEllipse(160, 286, 260, 38)
}

function bowlBody(g: G) {
    poly(g, ellipsePts(160, 206, 112, 84, 0, 180), C.bowl)
    g.fillStyle(C.bowlDark, 0.7)
    g.fillEllipse(160, 282, 90, 14)
    oval(g, 160, 206, 224, 44, C.bowlIn)
}

function cerealBit(g: G, x: number, y: number, r = 11) {
    disc(g, x, y, r, C.cereal, 3)
    g.fillStyle(C.cerealDark, 1)
    g.fillCircle(x, y, r * 0.3)
}

function cerealFrame(g: G, i: number) {
    placemat(g)
    if (i === 0) return
    if (i === 4) {
        ;[
            [100, 272],
            [130, 262],
            [160, 268],
            [190, 262],
            [220, 272],
            [116, 248],
            [150, 244],
            [186, 246],
            [160, 224],
            [62, 284],
            [258, 284],
        ].forEach(([x, y]) => cerealBit(g, x, y))
        return
    }
    if (i === 5) {
        oval(g, 160, 276, 262, 42, C.milk, 4)
        g.fillStyle(C.white, 1)
        g.fillEllipse(70, 296, 44, 18)
        g.fillEllipse(254, 298, 36, 14)
        return
    }
    bowlBody(g)
    if (i === 1) return
    if (i === 2) {
        CEREAL_BITS.forEach(([dx, dy]) => cerealBit(g, 160 + dx, 206 + dy))
        return
    }
    if (i === 3) {
        oval(g, 160, 206, 214, 36, C.milk, 3)
        CEREAL_BITS.forEach(([dx, dy]) => cerealBit(g, 160 + dx, 206 + dy * 0.8))
        g.save()
        g.translateCanvas(230, 150)
        g.rotateCanvas(0.45)
        box(g, -8, -42, 16, 96, 8, C.blenderBase, 4)
        oval(g, 0, -56, 34, 44, C.blenderBase, 4)
        g.restore()
        return
    }
    if (i === 6) {
        oval(g, 160, 206, 214, 36, C.milk, 3)
        drop(g, 96, 158, 11, C.milk)
        drop(g, 160, 138, 13, C.milk)
        drop(g, 226, 160, 10, C.milk)
        return
    }
    CEREAL_BITS.forEach(([dx, dy]) => cerealBit(g, 160 + dx, 206 + dy))
    ;[
        [-66, -24],
        [-34, -34],
        [0, -40],
        [34, -34],
        [66, -24],
        [-44, -58],
        [-14, -64],
        [20, -64],
        [46, -56],
        [-16, -88],
        [18, -88],
        [0, -110],
    ].forEach(([dx, dy]) => cerealBit(g, 160 + dx, 206 + dy))
    ;[
        [36, 268],
        [58, 290],
        [270, 262],
        [288, 286],
    ].forEach(([x, y]) => cerealBit(g, x, y))
}

// ───────────────────────────────────────────── preparo: cachorro-quente

function plate(g: G) {
    oval(g, 160, 272, 296, 62, C.plate)
    g.fillStyle(C.plateIn, 1)
    g.fillEllipse(160, 270, 216, 36)
}

function bunBack(g: G) {
    box(g, 44, 208, 232, 46, 22, C.bunBack)
}

function bunFront(g: G) {
    box(g, 44, 226, 232, 44, 22, C.bun)
    g.fillStyle(C.bunLight, 1)
    g.fillRoundedRect(68, 238, 150, 8, 4)
}

function sausageBar(g: G, x: number, y: number, w = 250) {
    box(g, x, y, w, 40, 20, C.sausage)
    g.fillStyle(C.white, 0.7)
    g.fillRoundedRect(x + 24, y + 8, w * 0.42, 6, 3)
}

function hotdogFrame(g: G, i: number) {
    if (i === 7) return
    plate(g)
    if (i === 0) return
    if (i === 4) {
        oval(g, 160, 266, 170, 36, C.ketchup, 4)
        g.fillStyle(C.white, 0.4)
        g.fillEllipse(132, 258, 40, 8)
        return
    }
    bunBack(g)
    if (i === 1) {
        bunFront(g)
        return
    }
    if (i === 5) {
        g.fillStyle(C.ketchup, 1)
        g.fillRoundedRect(60, 212, 200, 24, 10)
        bunFront(g)
        g.fillStyle(C.ketchup, 1)
        g.fillRoundedRect(92, 226, 34, 34, 12)
        g.fillRoundedRect(184, 226, 26, 44, 12)
        g.lineStyle(3, INK, 1)
        g.strokeRoundedRect(92, 226, 34, 34, 12)
        g.strokeRoundedRect(184, 226, 26, 44, 12)
        return
    }
    sausageBar(g, 35, 192)
    if (i === 6) {
        g.save()
        g.translateCanvas(160, 170)
        g.rotateCanvas(0.2)
        sausageBar(g, -125, -20)
        g.restore()
    }
    bunFront(g)
    if (i === 3) {
        const zig: P[] = []
        for (let k = 0; k <= 8; k++) zig.push({ x: 56 + k * 26, y: k % 2 ? 196 : 218 })
        g.lineStyle(11, C.ketchup, 1)
        g.strokePoints(zig, false)
    }
}

// ───────────────────────────────────────────── preparo: vitamina

const JAR_TOP = 62
const JAR_BOTTOM = 246

function jarX(y: number) {
    const t = (y - JAR_TOP) / (JAR_BOTTOM - JAR_TOP)
    return { left: 88 + t * 26, right: 232 - t * 26 }
}

function jarFill(g: G, top: number, fill: number) {
    const a = jarX(top)
    const b = jarX(JAR_BOTTOM - 3)
    g.fillStyle(fill, 1)
    g.fillPoints(
        [
            { x: a.left + 3, y: top },
            { x: a.right - 3, y: top },
            { x: b.right - 3, y: JAR_BOTTOM - 3 },
            { x: b.left + 3, y: JAR_BOTTOM - 3 },
        ],
        true,
    )
}

function jarBack(g: G) {
    g.lineStyle(13, INK, 1)
    g.strokePoints(ellipsePts(226, 136, 42, 58, -80, 80, 16), false)
    g.lineStyle(5, C.jar, 1)
    g.strokePoints(ellipsePts(226, 136, 42, 58, -80, 80, 16), false)
    jarFill(g, JAR_TOP + 2, C.jar)
}

function jarFront(g: G) {
    const a = jarX(JAR_TOP)
    const b = jarX(JAR_BOTTOM)
    g.lineStyle(LW, INK, 1)
    g.strokePoints(
        [
            { x: a.left, y: JAR_TOP },
            { x: a.right, y: JAR_TOP },
            { x: b.right, y: JAR_BOTTOM },
            { x: b.left, y: JAR_BOTTOM },
        ],
        true,
    )
    g.fillStyle(C.white, 0.6)
    g.fillRoundedRect(a.left + 14, JAR_TOP + 14, 10, 90, 5)
    box(g, 94, JAR_BOTTOM - 4, 132, 58, { tl: 12, tr: 12, bl: 16, br: 16 }, C.blenderBase)
    g.fillStyle(C.blenderDark, 1)
    g.fillRect(100, JAR_BOTTOM + 44, 120, 8)
}

function jarLid(g: G) {
    box(g, 76, 38, 168, 30, 10, C.lid)
    box(g, 142, 16, 36, 26, 8, C.lid)
}

function jarBananas(g: G) {
    fatLine(g, ellipsePts(120, 150, 62, 80, 10, 80, 10), 20, C.banana)
    fatLine(g, ellipsePts(200, 150, 62, 80, 100, 170, 10), 20, C.banana)
}

function smoothieFrame(g: G, i: number) {
    if (i === 11) return
    if (i === 5) {
        g.save()
        g.translateCanvas(186, 40)
        g.rotateCanvas(0.2)
        box(g, -8, 0, 16, 150, 6, C.straw, 4)
        g.restore()
        poly(g, [{ x: 92, y: 84 }, { x: 228, y: 84 }, { x: 208, y: 300 }, { x: 112, y: 300 }], C.jar)
        poly(g, [{ x: 98, y: 112 }, { x: 222, y: 112 }, { x: 206, y: 294 }, { x: 114, y: 294 }], C.smoothie, 3)
        oval(g, 160, 112, 124, 22, C.smoothieDark, 3)
        g.fillStyle(C.white, 0.6)
        g.fillRoundedRect(112, 128, 10, 110, 5)
        return
    }
    jarBack(g)
    if (i === 1 || i === 10) jarBananas(g)
    if (i === 2 || i === 3) {
        jarFill(g, 118, C.milk)
        jarBananas(g)
    }
    if (i === 4) {
        jarFill(g, 104, C.smoothie)
        g.lineStyle(7, C.smoothieDark, 1)
        g.strokePoints(ellipsePts(160, 170, 44, 34, 0, 300, 18), false)
        g.strokePoints(ellipsePts(160, 170, 20, 14, 40, 340, 12), false)
    }
    if (i === 6) jarFill(g, 140, C.milk)
    if (i === 8) {
        jarFill(g, JAR_TOP + 4, C.milk)
        jarBananas(g)
    }
    if (i === 9) {
        ;[
            [130, 110, 12],
            [188, 130, 16],
            [140, 180, 10],
            [186, 208, 12],
            [160, 96, 8],
        ].forEach(([x, y, r]) => {
            g.fillStyle(C.smoothie, 1)
            g.fillCircle(x, y, r)
        })
    }
    jarFront(g)
    if (i === 3 || i === 4 || i === 7 || i === 10) jarLid(g)
    if (i === 6) {
        drop(g, 112, 50, 11, C.milk)
        drop(g, 168, 30, 13, C.milk)
        drop(g, 218, 52, 10, C.milk)
    }
    if (i === 8) {
        poly(g, [{ x: 84, y: 56 }, { x: 110, y: 56 }, { x: 96, y: 170 }, { x: 74, y: 170 }], C.milk, 3)
        poly(g, [{ x: 212, y: 56 }, { x: 238, y: 56 }, { x: 246, y: 214 }, { x: 222, y: 214 }], C.milk, 3)
        oval(g, 160, 60, 176, 28, C.milk, 3)
        oval(g, 68, 300, 70, 18, C.milk, 3)
        oval(g, 252, 302, 70, 18, C.milk, 3)
    }
}
