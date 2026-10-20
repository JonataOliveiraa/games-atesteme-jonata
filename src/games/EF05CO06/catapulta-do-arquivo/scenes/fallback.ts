import Phaser from 'phaser'
import { CATAPULT_SHEET, DEVICE_SHEET, DIRT, PIECE_SHEET, PLANK, SKY, type Sheet } from '../data/files'
import { C } from '../data/theme'

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
    bakeOne(scene, SKY, 1280, 720, sky)
    bakeOne(scene, DIRT, 256, 256, dirt)
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

// ───────────────────────────────────────────── aparelhos (células de 320)

function gabinete(g: G) {
    box(g, 55, 15, 210, 290, 22, C.tower)
    box(g, 72, 34, 176, 236, 14, C.towerInside, 4)
    circ(g, 160, 82, 34, C.fan, 4)
    g.lineStyle(5, C.towerInside, 1)
    for (let a = 0; a < 4; a++) {
        const t = (a * Math.PI) / 2 + 0.4
        g.lineBetween(160, 82, 160 + Math.cos(t) * 28, 82 + Math.sin(t) * 28)
    }
    circ(g, 160, 82, 8, C.metal, 3)
    box(g, 90, 127, 140, 96, 10, C.bay, 4)
    g.lineStyle(3, C.fan, 1)
    g.strokeRoundedRect(98, 135, 124, 80, 6)
    for (let y = 240; y <= 258; y += 9) rect(g, 92, y, 120, 4, C.fan)
    box(g, 230, 236, 30, 12, 3, C.bay, 3)
    box(g, 230, 254, 30, 12, 3, C.bay, 3)
    circ(g, 160, 290, 8, C.gold, 3)
}

function hdInterno(g: G) {
    box(g, 85, 110, 150, 100, 10, C.metal)
    box(g, 104, 126, 86, 64, 6, C.metalLight, 3)
    g.lineStyle(3, C.metalDark, 1)
    g.lineBetween(114, 146, 178, 146)
    g.lineBetween(114, 160, 166, 160)
    ;[[97, 122], [223, 122], [97, 198], [223, 198]].forEach(([x, y]) => {
        circ(g, x, y, 6, C.metalDark, 2)
        g.lineStyle(2, C.ink, 1)
        g.lineBetween(x - 3, y, x + 3, y)
    })
    box(g, 202, 140, 26, 40, 4, C.bay, 3)
    for (let y = 146; y < 176; y += 8) rect(g, 208, y, 14, 3, C.gold)
}

function penDrive(g: G) {
    box(g, 40, 130, 52, 60, 6, C.metal)
    box(g, 52, 146, 12, 10, 2, C.bay, 0)
    box(g, 52, 164, 12, 10, 2, C.bay, 0)
    box(g, 84, 115, 140, 90, 30, C.penBody)
    box(g, 104, 132, 72, 18, 9, C.penDark, 0)
    g.lineStyle(LINE + 1, C.ink, 1)
    g.strokeCircle(238, 160, 16)
    g.lineStyle(LINE - 1, C.gold, 1)
    g.strokeCircle(238, 160, 16)
}

function cartao(g: G) {
    poly(g, [[100, 85], [194, 85], [220, 111], [220, 235], [100, 235]], C.card)
    box(g, 116, 150, 88, 66, 8, C.cardDark, 0)
    for (let x = 112; x < 190; x += 18) box(g, x, 96, 10, 26, 3, C.gold, 2)
}

function hdExterno(g: G) {
    stroke(g, 78, 168, 34, 186, 12, C.ink)
    stroke(g, 78, 168, 34, 186, 6, C.cable)
    box(g, 18, 178, 26, 18, 4, C.metal, 3)
    box(g, 92, 210, 26, 12, 4, C.extDark, 3)
    box(g, 202, 210, 26, 12, 4, C.extDark, 3)
    box(g, 75, 100, 170, 116, 30, C.extBody)
    box(g, 92, 116, 136, 64, 18, C.extDark, 0)
    circ(g, 220, 196, 7, C.led, 3)
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

// ───────────────────────────────────────────── a terra (256, repete sem emenda), a tábua e a mola

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
