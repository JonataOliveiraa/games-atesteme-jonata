import Phaser from 'phaser'
import { DEVICE_SHEET, FLOOR_KEY, HAND_KEY, PC_KEY, PIECE_SHEET, type Sheet } from '../data/files'
import { WORLD } from '../data/layout'
import { C } from '../data/theme'

/**
 * A arte de reserva, em Graphics, nas mesmas chaves e grades do TEXTURAS.md.
 * Vetor chapado sem contorno: retângulo de canto redondo, cápsula e círculo.
 * Um PNG com o mesmo nome em src/assets/games/EF05CO05/cabo-certo/ substitui.
 */

type G = Phaser.GameObjects.Graphics

const rr = (g: G, x: number, y: number, w: number, h: number, r: number, color: number) => {
    g.fillStyle(color, 1)
    g.fillRoundedRect(x, y, w, h, Math.min(r, w / 2, h / 2))
}

const dot = (g: G, x: number, y: number, r: number, color: number) => {
    g.fillStyle(color, 1)
    g.fillCircle(x, y, r)
}

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
    bakeSheet(scene, DEVICE_SHEET, device)
    bakeSheet(scene, PIECE_SHEET, piece)
    bakeImage(scene, PC_KEY, 400, 480, computer)
    bakeImage(scene, FLOOR_KEY, WORLD.w, WORLD.h, floor)
    bakeImage(scene, HAND_KEY, 256, 256, hand)
}

// ───────────────────────────────────────────── mãozinha (256 × 256)

/** Dedo indicador em pé, ponta em (87, 18): é o HAND_TIP. Borda branca para aparecer sobre tudo. */
function hand(g: G) {
    const paint = (grow: number, tone: number, dark: number) => {
        rr(g, 68 - grow, 10 - grow, 38 + grow * 2, 130 + grow, 19 + grow, tone)
        rr(g, 104 - grow, 92 - grow, 34 + grow * 2, 70 + grow, 17 + grow, tone)
        rr(g, 134 - grow, 102 - grow, 32 + grow * 2, 64 + grow, 16 + grow, tone)
        rr(g, 162 - grow, 114 - grow, 28 + grow * 2, 56 + grow, 14 + grow, tone)
        rr(g, 30 - grow, 128 - grow, 70 + grow * 2, 34 + grow * 2, 17 + grow, tone)
        rr(g, 64 - grow, 120 - grow, 128 + grow * 2, 110 + grow * 2, 40 + grow, tone)
        if (dark >= 0) rr(g, 76, 196, 104, 12, 6, dark)
    }
    paint(10, C.white, -1)
    paint(0, C.skin, C.skinDark)
    rr(g, 76, 22, 22, 18, 9, C.white)
}

// ───────────────────────────────────────────── aparelhos (256 × 256)

function device(g: G, i: number) {
    switch (i) {
        case 0:
            return keyboard(g)
        case 1:
            return mouse(g)
        case 2:
            return microphone(g)
        case 3:
            return camera(g)
        case 4:
            return monitor(g)
        case 5:
            return speaker(g)
        case 6:
            return flashDrive(g)
        case 7:
            return memoryStick(g)
        case 8:
            return hub(g)
        case 9:
            return card(g)
        default:
            return
    }
}

function keyboard(g: G) {
    rr(g, 16, 84, 224, 116, 24, C.slate)
    rr(g, 16, 76, 224, 116, 24, C.slateLight)
    const keyW = 18
    const gap = 4
    for (let row = 0; row < 3; row++) {
        const count = 9 - (row === 2 ? 1 : 0)
        const width = count * keyW + (count - 1) * gap
        const x0 = 128 - width / 2
        for (let k = 0; k < count; k++) {
            rr(g, x0 + k * (keyW + gap), 92 + row * 24 + 3, keyW, 17, 5, C.keyDark)
            rr(g, x0 + k * (keyW + gap), 92 + row * 24, keyW, 17, 5, C.key)
        }
    }
    rr(g, 70, 167, 116, 17, 6, C.keyDark)
    rr(g, 70, 164, 116, 17, 6, C.key)
    rr(g, 38, 166, 24, 15, 5, C.accentYellow)
}

function mouse(g: G) {
    rr(g, 82, 50, 92, 160, 46, C.keyDark)
    rr(g, 82, 44, 92, 160, 46, C.ice)
    rr(g, 82, 44, 45, 66, 23, C.key)
    rr(g, 129, 44, 45, 66, 23, C.key)
    rr(g, 82, 92, 92, 18, 0, C.ice)
    rr(g, 120, 60, 16, 30, 8, C.graphite)
    rr(g, 110, 170, 36, 10, 5, C.accentPink)
}

function microphone(g: G) {
    rr(g, 74, 210, 108, 24, 12, C.graphiteDark)
    rr(g, 74, 204, 108, 24, 12, C.graphite)
    rr(g, 120, 140, 16, 72, 8, C.metalDark)
    rr(g, 96, 136, 64, 14, 7, C.metal)
    dot(g, 128, 92, 56, C.slate)
    dot(g, 128, 88, 52, C.slateLight)
    for (let y = 56; y <= 120; y += 16)
        for (let x = 96; x <= 160; x += 16) {
            if (Phaser.Math.Distance.Between(x, y, 128, 88) < 42) dot(g, x, y, 4, C.slate)
        }
    rr(g, 74, 118, 108, 16, 8, C.accentYellow)
}

function camera(g: G) {
    rr(g, 66, 58, 64, 34, 12, C.graphiteDark)
    rr(g, 160, 64, 34, 22, 8, C.accentPink)
    rr(g, 34, 84, 188, 128, 28, C.graphiteDark)
    rr(g, 34, 78, 188, 128, 28, C.graphite)
    rr(g, 176, 94, 30, 18, 6, C.ice)
    dot(g, 128, 144, 52, C.metal)
    dot(g, 128, 144, 40, C.lens)
    dot(g, 128, 144, 24, C.graphiteDark)
    dot(g, 114, 130, 10, C.lensLight)
}

function monitor(g: G) {
    rr(g, 70, 210, 116, 20, 10, C.slate)
    rr(g, 114, 172, 28, 44, 6, C.slateLight)
    rr(g, 20, 40, 216, 140, 20, C.graphiteDark)
    rr(g, 20, 34, 216, 140, 20, C.graphite)
    rr(g, 30, 46, 196, 116, 12, C.screenOff)
    rr(g, 44, 56, 40, 10, 5, C.screenOn)
    dot(g, 128, 168, 4, C.accentYellow)
}

function speaker(g: G) {
    rr(g, 70, 36, 116, 196, 26, C.graphiteDark)
    rr(g, 70, 30, 116, 196, 26, C.graphite)
    dot(g, 128, 78, 26, C.metal)
    dot(g, 128, 78, 14, C.graphiteDark)
    dot(g, 128, 160, 44, C.metal)
    dot(g, 128, 160, 30, C.slate)
    dot(g, 128, 160, 12, C.graphiteDark)
    rr(g, 96, 210, 64, 8, 4, C.accentBlue)
}

function flashDrive(g: G) {
    rr(g, 30, 102, 62, 52, 8, C.metalDark)
    rr(g, 30, 98, 62, 52, 8, C.metal)
    rr(g, 44, 112, 12, 10, 3, C.metalDark)
    rr(g, 66, 112, 12, 10, 3, C.metalDark)
    rr(g, 84, 88, 144, 80, 34, C.slate)
    rr(g, 84, 82, 144, 80, 34, C.accentBlue)
    rr(g, 110, 112, 70, 16, 8, C.accentYellow)
    dot(g, 204, 122, 10, C.slate)
    dot(g, 204, 122, 6, C.ice)
}

function memoryStick(g: G) {
    rr(g, 20, 104, 216, 70, 10, C.boardDark)
    rr(g, 20, 98, 216, 70, 10, C.board)
    for (let k = 0; k < 4; k++) rr(g, 36 + k * 48, 110, 38, 34, 5, C.chip)
    for (let k = 0; k < 18; k++) {
        if (k === 7) continue
        rr(g, 28 + k * 11.4, 156, 7, 16, 2, C.pin)
    }
}

function hub(g: G) {
    rr(g, 34, 104, 188, 74, 24, C.slate)
    rr(g, 34, 96, 188, 74, 24, C.slateLight)
    rr(g, 52, 108, 152, 20, 10, C.ice)
    ;[86, 128, 170].forEach(x => {
        dot(g, x, 148, 10, C.graphiteDark)
        dot(g, x, 148, 5, C.accentYellow)
    })
}

function card(g: G) {
    g.fillStyle(C.slate, 1)
    g.fillPoints([{ x: 76, y: 46 }, { x: 160, y: 46 }, { x: 190, y: 76 }, { x: 190, y: 220 }, { x: 76, y: 220 }], true)
    g.fillStyle(C.slateLight, 1)
    g.fillPoints([{ x: 76, y: 40 }, { x: 160, y: 40 }, { x: 190, y: 70 }, { x: 190, y: 212 }, { x: 76, y: 212 }], true)
    for (let k = 0; k < 5; k++) rr(g, 90 + k * 16, 50, 9, 30, 3, C.pin)
    rr(g, 92, 120, 82, 70, 10, C.ice)
}

// ───────────────────────────────────────────── peças (128 × 128)

function piece(g: G, i: number) {
    if (i === 0) {
        rr(g, 16, 42, 80, 48, 22, C.plugDark)
        rr(g, 16, 38, 80, 48, 22, C.plug)
        rr(g, 92, 48, 28, 9, 4, C.metal)
        rr(g, 92, 68, 28, 9, 4, C.metal)
        rr(g, 28, 50, 34, 8, 4, C.cableLight)
        return
    }
    if (i > 4) return
    const tone = [0, C.entrada, C.saida, C.armazenamento, C.memoria][i]
    const dark = [0, C.entradaDark, C.saidaDark, C.armazenamentoDark, C.memoriaDark][i]
    dot(g, 64, 68, 56, dark)
    dot(g, 64, 62, 56, tone)
    dot(g, 64, 50, 24, dark)
    dot(g, 64, 50, 17, C.hole)
    g.fillStyle(C.white, 1)
    if (i === 4) {
        rr(g, 38, 82, 52, 20, 4, C.white)
        for (let k = 0; k < 5; k++) rr(g, 42 + k * 9.5, 102, 5, 8, 1, C.white)
        return
    }
    if (i === 3) {
        rr(g, 44, 82, 40, 26, 6, C.white)
        rr(g, 44, 78, 40, 12, 6, C.white)
        rr(g, 44, 88, 40, 4, 0, tone)
        rr(g, 60, 86, 8, 10, 3, tone)
        return
    }
    rr(g, 36, 88, 38, 12, 6, C.white)
    g.fillTriangle(70, 78, 70, 110, 94, 94)
}

// ───────────────────────────────────────────── computador (400 × 480)

function computer(g: G) {
    rr(g, 20, 18, 360, 456, 40, C.caseSideDark)
    rr(g, 20, 10, 360, 456, 40, C.caseSide)
    rr(g, 44, 22, 312, 432, 30, C.caseFace)
    rr(g, 70, 55, 260, 190, 24, C.boardDark)
    rr(g, 76, 61, 248, 178, 20, C.board)
    for (let k = 0; k < 5; k++) {
        const x = 152 + k * 24
        const y = 102 + k * 24
        rr(g, x - 4, 76, 8, 16, 3, C.pin)
        rr(g, x - 4, 208, 8, 16, 3, C.pin)
        rr(g, 124, y - 4, 16, 8, 3, C.pin)
        rr(g, 260, y - 4, 16, 8, 3, C.pin)
    }
    rr(g, 138, 88, 124, 124, 18, C.chip)
    rr(g, 160, 110, 80, 80, 12, C.chipLight)
    dot(g, 200, 330, 30, C.slateLight)
    dot(g, 200, 330, 20, C.caseFace)
    dot(g, 200, 330, 10, C.accentBlue)
    rr(g, 120, 386, 160, 14, 7, C.keyDark)
    rr(g, 120, 412, 160, 14, 7, C.keyDark)
}

// ───────────────────────────────────────────── chão (o mapa inteiro)

function floor(g: G) {
    const { w, h } = WORLD
    g.fillStyle(C.floor, 1)
    g.fillRect(0, 0, w, h)
    rr(g, 110, 96, w - 220, h - 190, 90, C.rugEdge)
    rr(g, 126, 112, w - 252, h - 222, 80, C.rug)
    // Tapete liso: nada no chão disputa a atenção com os aparelhos e os cabos.
    dot(g, 70, 1270, 54, C.pot)
    dot(g, 70, 1236, 62, C.plantDark)
    dot(g, 50, 1214, 40, C.plant)
    dot(g, 100, 1222, 36, C.plant)
    dot(g, 2330, 90, 48, C.pot)
    dot(g, 2330, 60, 54, C.plantDark)
    dot(g, 2310, 44, 34, C.plant)
}
