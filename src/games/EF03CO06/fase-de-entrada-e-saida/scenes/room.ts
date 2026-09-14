import Phaser from 'phaser'
import { CPU, DEPTH, H, PLAQUE, STATION, TABLE, W } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'

const BG = 'bg-laboratorio'

function paintTable(g: Phaser.GameObjects.Graphics) {
    const { x0, x1, top, thick, apron, legW, legBottom } = TABLE
    const w = x1 - x0
    const apronY = top + thick

    g.fillStyle(C.ink, 0.18)
    g.fillEllipse(x0 + 48, legBottom + 4, 90, 18)
    g.fillEllipse(x1 - 48, legBottom + 4, 90, 18)

    for (const lx of [x0 + 34, x1 - 34 - legW]) {
        g.fillStyle(C.ink, 1)
        g.fillRect(lx - 3, apronY, legW + 6, legBottom - apronY + 3)
        g.fillStyle(C.woodDark, 1)
        g.fillRect(lx, apronY, legW, legBottom - apronY)
        g.fillStyle(C.wood, 1)
        g.fillRect(lx + 4, apronY, 8, legBottom - apronY - 4)
    }

    g.fillStyle(C.ink, 0.22)
    g.fillRoundedRect(x0 + 6, apronY + 8, w - 12, apron, 12)
    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(x0 + 10, apronY - 4, w - 20, apron + 7, 12)
    g.fillStyle(C.woodDark, 1)
    g.fillRoundedRect(x0 + 13, apronY - 2, w - 26, apron, 10)

    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(x0 - 3, top - 3, w + 6, thick + 6, 12)
    g.fillStyle(C.wood, 1)
    g.fillRoundedRect(x0, top, w, thick, 10)
    g.fillStyle(C.woodLight, 1)
    g.fillRoundedRect(x0 + 8, top + 3, w - 16, 7, 4)
}

function makePlaque(scene: Phaser.Scene, x: number, label: string, fill: number, deep: number) {
    const y = TABLE.top + TABLE.thick + TABLE.apron / 2 - 2
    const text = scene.add
        .text(0, 0, label, { fontFamily: FONT.black, fontSize: '23px', color: CSS.white })
        .setOrigin(0.5)
        .setResolution(2)
    text.setStroke(CSS.ink, 4)
    const w = text.width + 40
    const h = PLAQUE.h
    const g = scene.add.graphics()
    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(-w / 2 - 3, -h / 2 - 3, w + 6, h + 6, h / 2 + 3)
    g.fillStyle(deep, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
    g.fillStyle(fill, 1)
    g.fillRoundedRect(-w / 2 + 3, -h / 2 + 2, w - 6, h - 8, h / 2 - 3)
    return scene.add.container(x, y, [g, text]).setDepth(DEPTH.table + 1)
}

function makeArrow(scene: Phaser.Scene, x: number) {
    const y = TABLE.top + TABLE.thick + TABLE.apron / 2 - 2
    const g = scene.add.graphics().setDepth(DEPTH.table + 1)
    g.fillStyle(C.ink, 1)
    g.fillTriangle(x - 12, y - 15, x - 12, y + 15, x + 15, y)
    g.fillStyle(C.cream, 1)
    g.fillTriangle(x - 8, y - 9, x - 8, y + 9, x + 8, y)
    return g
}

export function createRoom(scene: Phaser.Scene) {
    const parts: Phaser.GameObjects.GameObject[] = []

    if (scene.textures.exists(BG)) {
        parts.push(scene.add.image(W / 2, H / 2, BG).setDisplaySize(W, H + 2).setDepth(DEPTH.bg))
    } else {
        const g = scene.add.graphics().setDepth(DEPTH.bg)
        g.fillStyle(C.cream, 1)
        g.fillRect(0, 0, W, H)
        g.fillStyle(0xa9c4de, 1)
        g.fillRect(0, 540, W, H - 540)
        parts.push(g)
    }

    const veil = scene.add.graphics().setDepth(DEPTH.bg + 1)
    veil.fillStyle(C.cream, 0.22)
    veil.fillRect(0, 0, W, H)
    parts.push(veil)

    const table = scene.add.graphics().setDepth(DEPTH.table)
    paintTable(table)
    parts.push(table)

    const entrada = makePlaque(scene, STATION.input.x, 'ENTRADA', C.input, C.inputDeep)
    const computador = makePlaque(scene, CPU.x, 'COMPUTADOR', C.inkSoft, C.ink)
    const saida = makePlaque(scene, STATION.output.x, 'SAÍDA', C.output, C.outputDeep)
    parts.push(entrada, computador, saida)

    const leftGap = (STATION.input.x + entrada.getBounds().width / 2 + CPU.x - computador.getBounds().width / 2) / 2
    const rightGap = (CPU.x + computador.getBounds().width / 2 + STATION.output.x - saida.getBounds().width / 2) / 2
    parts.push(makeArrow(scene, leftGap), makeArrow(scene, rightGap))

    return {
        destroy() {
            parts.forEach(part => part.destroy())
        },
    }
}

export type Room = ReturnType<typeof createRoom>
