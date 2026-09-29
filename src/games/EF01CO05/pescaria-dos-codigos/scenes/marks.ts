import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DRUM_ART, MARK_ART, PIECE_CELL, PIECES } from '../data/files'
import { C, HUE } from '../data/theme'
import type { Mark } from '../types'

export interface MarkView {
    readonly container: Phaser.GameObjects.Container
    readonly width: number
    readonly parts: Phaser.GameObjects.Container[]
    beat(index: number): Promise<void>
    destroy(): void
}

export function paintDrum(g: Phaser.GameObjects.Graphics, s: number) {
    const w = s * 0.78
    const h = s * 0.5
    const top = -h / 2 + s * 0.08
    const ry = s * 0.13
    g.lineStyle(Math.max(2, s * 0.06), C.ink, 1)
    g.fillStyle(C.lilac, 1)
    g.fillRect(-w / 2, top, w, h)
    g.fillEllipse(0, top + h, w, ry * 2)
    g.strokeEllipse(0, top + h, w, ry * 2)
    g.fillRect(-w / 2, top, w, h)
    g.lineBetween(-w / 2, top, -w / 2, top + h)
    g.lineBetween(w / 2, top, w / 2, top + h)
    g.fillStyle(C.wood, 1)
    g.fillRect(-w / 2, top + h * 0.72, w, h * 0.16)
    g.fillStyle(C.cream, 1)
    g.fillEllipse(0, top, w, ry * 2)
    g.strokeEllipse(0, top, w, ry * 2)
    g.lineStyle(Math.max(3, s * 0.08), C.woodDark, 1)
    g.lineBetween(s * 0.08, top - s * 0.02, s * 0.42, top - s * 0.34)
    g.fillStyle(C.woodDark, 1)
    g.fillCircle(s * 0.08, top - s * 0.02, s * 0.06)
}

export function paintDisc(g: Phaser.GameObjects.Graphics, s: number, color: number) {
    g.fillStyle(color, 1)
    g.fillCircle(0, 0, s / 2)
    g.lineStyle(Math.max(2, s * 0.08), C.ink, 1)
    g.strokeCircle(0, 0, s / 2)
    g.fillStyle(C.white, 0.35)
    g.fillEllipse(-s * 0.14, -s * 0.16, s * 0.28, s * 0.18)
}

function drumPart(scene: Phaser.Scene, size: number): Phaser.GameObjects.Container {
    if (scene.textures.exists(PIECES)) {
        const image = scene.add.image(0, 0, PIECES, PIECE_CELL.drum).setScale(size / DRUM_ART)
        return scene.add.container(0, 0, [image])
    }
    const g = scene.add.graphics()
    paintDrum(g, size)
    return scene.add.container(0, 0, [g])
}

export function discPart(scene: Phaser.Scene, size: number, color: number): Phaser.GameObjects.Container {
    if (scene.textures.exists(PIECES)) {
        const image = scene.add.image(0, 0, PIECES, PIECE_CELL.mark).setScale(size / MARK_ART).setTint(color)
        return scene.add.container(0, 0, [image])
    }
    const g = scene.add.graphics()
    paintDisc(g, size, color)
    return scene.add.container(0, 0, [g])
}

export function createMarkView(scene: Phaser.Scene, mark: Mark, size: number, gap = 6): MarkView {
    const parts: Phaser.GameObjects.Container[] = []
    let width = size
    if (mark.kind === 'beats') {
        width = mark.n * size + (mark.n - 1) * gap
        for (let i = 0; i < mark.n; i++) {
            const part = drumPart(scene, size)
            part.x = -width / 2 + size / 2 + i * (size + gap)
            parts.push(part)
        }
    } else {
        parts.push(discPart(scene, size, HUE[mark.hue]))
    }
    const container = scene.add.container(0, 0, parts)

    return {
        container,
        width,
        parts,
        async beat(index) {
            const part = parts[Math.min(index, parts.length - 1)]
            if (!part?.active) return
            FX.kill(scene, part)
            part.setScale(1).setY(0)
            await FX.to(scene, part, { scale: 1.3, y: -size * 0.12 }, { duration: 110, yoyo: true, ease: 'Sine.easeOut' })
        },
        destroy() {
            parts.forEach(part => FX.kill(scene, part))
            container.destroy()
        },
    }
}
