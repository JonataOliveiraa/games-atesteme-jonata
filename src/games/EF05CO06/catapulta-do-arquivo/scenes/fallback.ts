import Phaser from 'phaser'
import { CATAPULT_SHEET, DEVICE_SHEET, EDGE, PIECE_SHEET, PLANK, SCENERY, TUNNEL, type Sheet } from '../data/files'
import { C, LAND, type Land } from '../data/theme'
import type { Scenery } from '../types'

type G = Phaser.GameObjects.Graphics
type P = [number, number]

const LINE = 5

function bakeSheet(scene: Phaser.Scene, sheet: Sheet, paint: Array<(g: G) => void>) {
    if (scene.textures.exists(sheet.key)) return
    const g = scene.make.graphics({ x: 0, y: 0 }, false)
    paint.forEach((draw, i) => {
        g.save()
        g.translateCanvas((i % sheet.cols) * sheet.cellW, Math.floor(i / sheet.cols) * sheet.cellH)
        draw(g)
        g.restore()
    })
    g.generateTexture(sheet.key, sheet.cols * sheet.cellW, sheet.rows * sheet.cellH)
    g.destroy()
}

function bakeOne(scene: Phaser.Scene, key: string, w: number, h: number, paint: (g: G) => void) {
    if (scene.textures.exists(key)) return
    const g = scene.make.graphics({ x: 0, y: 0 }, false)
    paint(g)
    g.generateTexture(key, w, h)
    g.destroy()
}

export function ensureArt(scene: Phaser.Scene) {
    bakeOne(scene, SCENERY.campo.sky, 1280, 720, sky)
    bakeOne(scene, SCENERY.campo.ground, 256, 256, dirt)
    bakeOne(scene, SCENERY.praia.sky, 1280, 720, beachSky)
    bakeOne(scene, SCENERY.praia.ground, 256, 256, sand)
    bakeOne(scene, SCENERY.serra.sky, 1280, 720, ridgeSky)
    bakeOne(scene, SCENERY.serra.ground, 256, 256, rock)
    const tuft: Record<Scenery, [number, number]> = { campo: [13, 18], praia: [9, 12], serra: [12, 16] }
    ;(Object.keys(SCENERY) as Scenery[]).forEach(s => {
        bakeOne(scene, SCENERY[s].edge, EDGE.w, EDGE.h, g => edge(g, LAND[s], ...tuft[s]))
        bakeOne(scene, SCENERY[s].tunnel, TUNNEL.w, TUNNEL.h, g => tunnel(g, LAND[s]))
    })
    bakeOne(scene, PLANK, 240, 40, plank)
    bakeSheet(scene, DEVICE_SHEET, [gabinete, hdInterno, penDrive, cartao, hdExterno, nuvem])
    bakeSheet(scene, PIECE_SHEET, [video, foto, musica, trabalho, bolinha, brilho, g => mola(g, false), g => mola(g, true)])
    bakeSheet(scene, CATAPULT_SHEET, [catapulta])
}

// ───────────────────────────────────────────── primitivas com contorno

function box(g: G, x: number, y: number, w: number, h: number, r: number, fill: number, line = LINE) {
    g.fillStyle(fill, 1)
    g.fillRoundedRect(x, y, w, h, r)
    if (line > 0) {
        g.lineStyle(line, C.ink, 1)
        g.strokeRoundedRect(x, y, w, h, r)
    }
}

function rect(g: G, x: number, y: number, w: number, h: number, fill: number) {
    g.fillStyle(fill, 1)
    g.fillRect(x, y, w, h)
}

function circ(g: G, x: number, y: number, r: number, fill: number, line = LINE) {
    g.fillStyle(fill, 1)
    g.fillCircle(x, y, r)
    if (line > 0) {
        g.lineStyle(line, C.ink, 1)
        g.strokeCircle(x, y, r)
    }
}

function ell(g: G, x: number, y: number, w: number, h: number, fill: number, line = LINE) {
    g.fillStyle(fill, 1)
    g.fillEllipse(x, y, w, h)
    if (line > 0) {
        g.lineStyle(line, C.ink, 1)
        g.strokeEllipse(x, y, w, h)
    }
}

function poly(g: G, pts: P[], fill: number, line = LINE) {
    const points = pts.map(([x, y]) => new Phaser.Math.Vector2(x, y))
    g.fillStyle(fill, 1)
    g.fillPoints(points, true)
    if (line > 0) {
        g.lineStyle(line, C.ink, 1)
        g.strokePoints(points, true)
    }
}

/** forma fofa: os círculos com contorno por baixo e o recheio por cima, sem costura */
function blob(g: G, parts: Array<[number, number, number]>, fill: number) {
    g.fillStyle(C.ink, 1)
    parts.forEach(([x, y, r]) => g.fillCircle(x, y, r + LINE))
    g.fillStyle(fill, 1)
    parts.forEach(([x, y, r]) => g.fillCircle(x, y, r))
}

function stroke(g: G, x1: number, y1: number, x2: number, y2: number, width: number, color: number) {
    g.lineStyle(width, color, 1)
    g.lineBetween(x1, y1, x2, y2)
    g.fillStyle(color, 1)
    g.fillCircle(x1, y1, width / 2)
    g.fillCircle(x2, y2, width / 2)
}

// ───────────────────────────────────────────── aparelhos (células de 320, em pé com a base em y 300; a nuvem centrada)

function gabinete(g: G) {
    box(g, 70, 286, 30, 14, 4, C.towerDark, 3)
    box(g, 220, 286, 30, 14, 4, C.towerDark, 3)
    box(g, 60, 20, 200, 270, 22, C.tower)
    box(g, 76, 38, 168, 216, 14, C.towerInside, 4)
    circ(g, 160, 82, 30, C.fan, 4)
    g.lineStyle(5, C.towerInside, 1)
    for (let a = 0; a < 4; a++) {
        const t = (a * Math.PI) / 2 + 0.4
        g.lineBetween(160, 82, 160 + Math.cos(t) * 24, 82 + Math.sin(t) * 24)
    }
    circ(g, 160, 82, 7, C.metal, 3)
    box(g, 96, 126, 128, 88, 10, C.bay, 4)
    box(g, 108, 140, 104, 60, 6, C.metal, 3)
    box(g, 120, 150, 54, 38, 4, C.metalLight, 2)
    ;[[116, 148], [204, 148], [116, 192], [204, 192]].forEach(([x, y]) => circ(g, x, y, 4, C.metalDark, 2))
    for (let y = 226; y <= 242; y += 8) rect(g, 96, y, 110, 4, C.fan)
    circ(g, 230, 270, 7, C.gold, 3)
}

function hdInterno(g: G) {
    box(g, 80, 190, 160, 110, 10, C.metal)
    box(g, 100, 206, 90, 70, 6, C.metalLight, 3)
    g.lineStyle(3, C.metalDark, 1)
    g.lineBetween(110, 228, 178, 228)
    g.lineBetween(110, 244, 166, 244)
    ;[[93, 202], [227, 202], [93, 288], [227, 288]].forEach(([x, y]) => {
        circ(g, x, y, 6, C.metalDark, 2)
        g.lineStyle(2, C.ink, 1)
        g.lineBetween(x - 3, y, x + 3, y)
    })
    box(g, 202, 222, 26, 40, 4, C.bay, 3)
    for (let y = 228; y < 258; y += 8) rect(g, 208, y, 14, 3, C.gold)
}

function penDrive(g: G) {
    box(g, 132, 100, 56, 66, 6, C.metal)
    box(g, 144, 112, 12, 12, 2, C.bay, 0)
    box(g, 164, 112, 12, 12, 2, C.bay, 0)
    box(g, 115, 156, 90, 144, 26, C.penBody)
    box(g, 132, 186, 18, 84, 9, C.penDark, 0)
    g.lineStyle(LINE + 1, C.ink, 1)
    g.strokeCircle(160, 276, 11)
    g.lineStyle(LINE - 1, C.gold, 1)
    g.strokeCircle(160, 276, 11)
}

function cartao(g: G) {
    poly(g, [[90, 120], [200, 120], [230, 150], [230, 300], [90, 300]], C.card)
    box(g, 108, 196, 104, 84, 8, C.cardDark, 0)
    for (let x = 104; x < 196; x += 20) box(g, x, 132, 12, 30, 3, C.gold, 2)
}

function hdExterno(g: G) {
    stroke(g, 240, 270, 282, 292, 12, C.ink)
    stroke(g, 240, 270, 282, 292, 6, C.cable)
    box(g, 276, 284, 22, 16, 4, C.metal, 3)
    box(g, 92, 288, 30, 12, 4, C.extDark, 3)
    box(g, 198, 288, 30, 12, 4, C.extDark, 3)
    box(g, 80, 100, 160, 192, 30, C.extBody)
    box(g, 98, 120, 124, 112, 18, C.extDark, 0)
    circ(g, 160, 262, 8, C.led, 3)
}

function nuvem(g: G) {
    g.fillStyle(C.cloudShade, 1)
    g.fillEllipse(160, 230, 230, 34)
    blob(
        g,
        [
            [100, 180, 46],
            [150, 140, 60],
            [210, 160, 48],
            [235, 196, 30],
            [80, 206, 28],
            [160, 200, 50],
        ],
        C.cloud,
    )
    g.fillStyle(C.cloudShade, 1)
    g.fillEllipse(170, 222, 150, 18)
}

// ───────────────────────────────────────────── peças (células de 200)

function video(g: G) {
    box(g, 38, 82, 124, 86, 10, C.clap)
    poly(g, [[38, 52], [160, 30], [166, 58], [44, 80]], C.white)
    ;[0, 1, 2].forEach(i => {
        const x = 62 + i * 34
        poly(g, [[x, 48 - i * 5], [x + 16, 45 - i * 5], [x + 4, 76 - i * 5], [x - 12, 79 - i * 5]], C.clap, 0)
    })
    rect(g, 52, 100, 96, 6, C.white)
    rect(g, 52, 120, 60, 6, C.white)
}

function foto(g: G) {
    box(g, 36, 36, 128, 128, 10, C.white)
    rect(g, 50, 50, 100, 82, C.photoSky)
    poly(g, [[50, 132], [92, 82], [118, 110], [132, 96], [150, 132]], C.photoHill, 0)
    g.fillStyle(C.sun, 1)
    g.fillCircle(128, 70, 12)
    g.lineStyle(3, C.ink, 1)
    g.strokeRect(50, 50, 100, 82)
}

function musica(g: G) {
    stroke(g, 82, 52, 82, 140, 12, C.ink)
    stroke(g, 146, 40, 146, 128, 12, C.ink)
    poly(g, [[76, 46], [152, 32], [152, 60], [76, 74]], C.note)
    ell(g, 66, 144, 48, 36, C.note)
    ell(g, 130, 132, 48, 36, C.note)
}

function trabalho(g: G) {
    box(g, 50, 30, 96, 134, 8, C.paper)
    for (let y = 58; y < 150; y += 18) rect(g, 64, y, 66, 4, C.paperLine)
    poly(g, [[118, 168], [168, 74], [184, 82], [134, 176], [114, 186]], C.pencil)
    poly(g, [[114, 186], [118, 168], [134, 176]], C.paper, 3)
}

function brilho(g: G) {
    poly(g, [[100, 20], [118, 82], [180, 100], [118, 118], [100, 180], [82, 118], [20, 100], [82, 82]], C.star)
}


function bolinha(g: G) {
    circ(g, 100, 100, 84, C.white, 6)
    g.lineStyle(4, C.lilac, 1)
    g.strokeCircle(100, 100, 70)
    g.fillStyle(C.white, 0.9)
    g.fillEllipse(70, 62, 34, 18)
}

// ───────────────────────────────────────────── o céu (1280 × 720, opaco)

function sky(g: G) {
    rect(g, 0, 0, 1280, 720, C.sky)
    rect(g, 0, 300, 1280, 420, C.skyLow)
    g.fillStyle(C.sun, 1)
    g.fillCircle(1130, 170, 46)
    g.fillStyle(C.white, 0.6)
    ;[
        [180, 170, 50],
        [230, 150, 40],
        [520, 230, 34],
        [560, 214, 28],
    ].forEach(([x, y, r]) => g.fillCircle(x, y, r))
    g.fillStyle(C.hillFar, 1)
    g.fillEllipse(260, 520, 760, 260)
    g.fillEllipse(900, 540, 900, 240)
    g.fillStyle(C.hill, 1)
    g.fillEllipse(620, 560, 820, 200)
}

/** faixas finas de uma cor para outra: o Graphics assado não faz degradê */
function bands(g: G, y0: number, y1: number, from: number, to: number, steps: number) {
    const a = Phaser.Display.Color.ValueToColor(from)
    const b = Phaser.Display.Color.ValueToColor(to)
    const h = (y1 - y0) / steps
    for (let i = 0; i < steps; i++) {
        const c = Phaser.Display.Color.Interpolate.ColorWithColor(a, b, steps - 1, i)
        rect(g, 0, y0 + i * h, 1280, h + 1, Phaser.Display.Color.GetColor(c.r, c.g, c.b))
    }
}

function beachSky(g: G) {
    bands(g, 0, 470, 0xb9a6e6, 0xffc9a8, 24)
    g.fillStyle(0xffe3a3, 0.5)
    g.fillCircle(880, 450, 120)
    g.fillStyle(0xffd68a, 1)
    g.fillCircle(880, 450, 78)
    g.fillStyle(C.white, 0.55)
    ;[
        [220, 150, 46],
        [270, 132, 36],
        [610, 210, 30],
        [650, 196, 24],
    ].forEach(([x, y, r]) => g.fillCircle(x, y, r))
    bands(g, 470, 720, 0x9fe3cf, 0x7ccdb6, 10)
    g.fillStyle(0xffe3a3, 0.45)
    for (let i = 0; i < 6; i++) g.fillRoundedRect(880 - 90 + i * 12, 490 + i * 26, 180 - i * 24, 8, 4)
    g.fillStyle(C.white, 0.5)
    ;[
        [140, 520, 120],
        [420, 580, 160],
        [1100, 540, 140],
        [640, 650, 180],
    ].forEach(([x, y, w]) => g.fillRoundedRect(x, y, w, 6, 3))
}

function ridgeSky(g: G) {
    bands(g, 0, 720, 0x35346a, 0x7a68ad, 28)
    g.fillStyle(0xfff1c9, 1)
    ;[
        [140, 90],
        [330, 170],
        [520, 70],
        [700, 140],
        [860, 60],
        [1200, 260],
        [980, 300],
        [260, 300],
    ].forEach(([x, y], i) => g.fillCircle(x, y, 2 + (i % 2)))
    g.fillStyle(0xfff1c9, 0.25)
    g.fillCircle(1080, 150, 74)
    g.fillStyle(0xfff1c9, 1)
    g.fillCircle(1080, 150, 52)
    g.fillStyle(0xe8d8a8, 1)
    g.fillCircle(1064, 138, 9)
    g.fillCircle(1096, 166, 6)
    const peak = (x: number, y: number, w: number, base: number, fill: number, snow: number) => {
        poly(g, [[x - w / 2, base], [x, y], [x + w / 2, base]], fill, 0)
        const k = 0.28
        poly(g, [[x - (w / 2) * k, y + (base - y) * k], [x, y], [x + (w / 2) * k, y + (base - y) * k], [x + 8, y + (base - y) * k - 10], [x - 10, y + (base - y) * k - 4]], snow, 0)
    }
    peak(220, 330, 620, 720, 0x5e5a9c, 0xd9d0f2)
    peak(760, 290, 720, 720, 0x5e5a9c, 0xd9d0f2)
    peak(1180, 350, 560, 720, 0x5e5a9c, 0xd9d0f2)
    peak(480, 420, 560, 720, 0x46427f, 0xe4dcf7)
    peak(1000, 440, 620, 720, 0x46427f, 0xe4dcf7)
}

// ───────────────────────────────────────────── a borda de cima (512 × 96, repete na horizontal, chão em y 36) e o túnel (128 × 256)

const darker = (tone: number, amount: number) => Phaser.Display.Color.IntegerToColor(tone).darken(amount).color

/** a camada embaixo da linha do chão termina numa onda que fecha em 512 */
const wave = (x: number, base: number) => base + Math.sin((x / 128) * Math.PI * 2) * 5 + Math.sin((x / 64) * Math.PI * 2 + 1) * 3

function layer(g: G, base: number, fill: number) {
    const pts: P[] = [[0, EDGE.line - 2]]
    for (let x = 0; x <= EDGE.w; x += 8) pts.push([x, wave(x, base)])
    pts.push([EDGE.w, EDGE.line - 2])
    poly(g, pts, fill, 0)
}

function edge(g: G, land: Land, rMin: number, rMax: number) {
    const line = darker(land.edge, 22)
    const base = land.band === null ? 74 : 62
    const count = 16
    const tufts = Array.from({ length: count }, (_, i) => ({
        x: (i + 0.5) * (EDGE.w / count) + (((i * 3) % 4) - 1.5) * 3,
        r: rMin + (((i * 7) % 5) / 4) * (rMax - rMin),
    }))
    const each = (draw: (x: number, r: number) => void) => tufts.forEach(t => [-EDGE.w, 0, EDGE.w].forEach(dx => draw(t.x + dx, t.r)))
    if (land.band !== null) {
        layer(g, base + 22, darker(land.band, 18))
        layer(g, base + 19, land.band)
    }
    layer(g, base + 3, line)
    each((x, r) => circ(g, x, EDGE.line + 2, r + 3, line, 0))
    layer(g, base, land.edge)
    each((x, r) => circ(g, x, EDGE.line + 2, r, land.edge, 0))
    g.fillStyle(land.edgeLight, 0.9)
    each((x, r) => g.fillEllipse(x - r * 0.3, EDGE.line + 2 - r * 0.55, r * 0.8, r * 0.36))
}

function tunnel(g: G, land: Land) {
    rect(g, 0, 0, TUNNEL.w, TUNNEL.h, land.chamberRim)
    rect(g, 12, 0, TUNNEL.w - 24, TUNNEL.h, land.chamber)
    const pebbles: Array<[number, number, number]> = [
        [30, 20, 7],
        [84, 54, 9],
        [52, 110, 6],
        [96, 150, 7],
        [36, 190, 9],
        [76, 232, 6],
    ]
    pebbles.forEach(([x, y, r]) =>
        [-TUNNEL.h, 0, TUNNEL.h].forEach(dy => {
            g.fillStyle(land.chamberRim, 1)
            g.fillEllipse(x, y + dy, r * 2.2, r * 1.6)
            g.fillStyle(darker(land.chamber, 12), 1)
            g.fillEllipse(x + 2, y + dy + 3, r * 1.6, r * 0.8)
        }),
    )
}

// ───────────────────────────────────────────── os chões (256, repetem sem emenda), a tábua e a mola

function sand(g: G) {
    rect(g, 0, 0, 256, 256, 0xe9c48f)
    g.fillStyle(0xd9b07c, 1)
    for (let i = 0; i < 30; i++) g.fillCircle((i * 97) % 256, (i * 61) % 256, 2 + (i % 2))
    g.fillStyle(0xf6dcae, 0.8)
    for (let i = 0; i < 14; i++) g.fillCircle((i * 131 + 30) % 256, (i * 73 + 50) % 256, 2)
    g.fillStyle(0xf4a9a0, 1)
    g.fillEllipse(70, 180, 14, 9)
    g.fillStyle(0xc4b2ee, 1)
    g.fillEllipse(196, 60, 12, 8)
}

function rock(g: G) {
    rect(g, 0, 0, 256, 256, 0x8e93b0)
    g.fillStyle(0x7a7f9e, 1)
    ;[
        [40, 50, 60, 34],
        [170, 30, 70, 38],
        [110, 140, 80, 42],
        [220, 190, 64, 36],
        [30, 210, 56, 30],
    ].forEach(([x, y, w, h]) => g.fillEllipse(x, y, w, h))
    g.fillStyle(0xa6abc6, 1)
    ;[
        [34, 44, 26, 10],
        [162, 24, 30, 10],
        [100, 132, 34, 12],
        [212, 184, 26, 10],
        [24, 204, 22, 8],
    ].forEach(([x, y, w, h]) => g.fillEllipse(x, y, w, h))
    g.fillStyle(0x6b6f8e, 1)
    for (let i = 0; i < 16; i++) g.fillCircle((i * 89 + 12) % 256, (i * 53 + 90) % 256, 2)
}

function dirt(g: G) {
    rect(g, 0, 0, 256, 256, C.dirt)
    g.fillStyle(C.dirtSpeck, 1)
    for (let i = 0; i < 26; i++) g.fillCircle((i * 97) % 256, (i * 61) % 256, 3 + (i % 3))
    g.fillStyle(C.dirtDark, 0.5)
    for (let i = 0; i < 10; i++) g.fillEllipse((i * 151 + 40) % 256, (i * 89 + 20) % 256, 18, 8)
}

function plank(g: G) {
    box(g, 3, 3, 234, 34, 10, C.desk, 4)
    rect(g, 12, 10, 216, 5, C.deskLight)
    g.fillStyle(C.deskDark, 1)
    g.fillCircle(20, 26, 4)
    g.fillCircle(220, 26, 4)
}

function mola(g: G, down: boolean) {
    const top = down ? 92 : 60
    box(g, 30, 150, 140, 22, 8, C.metalDark)
    const coils = 4
    for (let i = 0; i < coils; i++) {
        const y = 150 - ((150 - top - 16) * (i + 1)) / (coils + 1)
        g.lineStyle(14, C.ink, 1)
        g.lineBetween(54, y, 146, y)
        g.lineStyle(8, C.metal, 1)
        g.lineBetween(54, y, 146, y)
    }
    box(g, 22, top, 156, 22, 10, C.coral)
}

// ───────────────────────────────────────────── a catapulta (célula de 320; base em y 300, pontas em (110, 30) e (210, 30))

function catapulta(g: G) {
    poly(g, [[60, 260], [260, 260], [244, 296], [76, 296]], C.desk)
    circ(g, 92, 298, 20, C.tire)
    circ(g, 228, 298, 20, C.tire)
    circ(g, 92, 298, 7, C.metal, 0)
    circ(g, 228, 298, 7, C.metal, 0)
    box(g, 144, 140, 32, 124, 10, C.desk)
    poly(g, [[150, 150], [96, 30], [124, 22], [170, 140]], C.desk)
    poly(g, [[170, 150], [224, 30], [196, 22], [150, 140]], C.desk)
    circ(g, 110, 30, 12, C.deskDark, 4)
    circ(g, 210, 30, 12, C.deskDark, 4)
    rect(g, 150, 180, 20, 6, C.deskDark)
    rect(g, 150, 210, 20, 6, C.deskDark)
}
