import Phaser from 'phaser'
import { DEVICE_CELL, DEVICE_SHEET, GABINETE_CELL, cellKey } from '../data/files'
import { CATAPULT, DEPTH, MINIMAP, W } from '../data/layout'
import { C } from '../data/theme'
import type { Round } from '../types'
import type { World } from './world'

export interface Minimap {
    /** desenha a janela da câmera */
    update(scrollX: number): void
    contains(x: number, y: number): boolean
    /** o scrollX que centraliza a câmera no ponto tocado do mapinha */
    scrollFor(screenX: number): number
    destroy(): void
}

const PAD = 8
const ICON = 22
const TOP_Y = 80

export function createMinimap(scene: Phaser.Scene, round: Round, world: World): Minimap {
    const { x, y, w, h } = MINIMAP
    const map = round.map
    const sx = (w - PAD * 2) / map.width
    const sy = (h - PAD * 2) / (720 - TOP_Y)
    const toX = (wx: number) => x + PAD + wx * sx
    const toY = (wy: number) => y + PAD + (wy - TOP_Y) * sy

    const g = scene.add.graphics().setScrollFactor(0).setDepth(DEPTH.minimap)
    g.fillStyle(C.shadow, 0.18)
    g.fillRoundedRect(x + 2, y + 4, w, h, 14)
    g.fillStyle(C.sky, 0.95)
    g.fillRoundedRect(x, y, w, h, 14)
    map.ground.forEach(line => {
        const pts = [...line, [line[line.length - 1][0], 720], [line[0][0], 720]].map(([px, py]) => new Phaser.Math.Vector2(toX(px), Math.min(toY(py), y + h - PAD)))
        g.fillStyle(C.dirt, 1)
        g.fillPoints(pts, true)
        g.lineStyle(3, C.grassDark, 1)
        g.strokePoints(line.map(([px, py]) => new Phaser.Math.Vector2(toX(px), toY(py))))
    })
    g.lineStyle(3, C.deskDark, 1)
    map.platforms.forEach(p => g.lineBetween(toX(p.x - p.w / 2), toY(p.y), toX(p.x + p.w / 2), toY(p.y)))
    g.fillStyle(C.coral, 1)
    map.springs.forEach(s => g.fillCircle(toX(s.x), toY(world.groundAt(s.x) ?? 560) - 2, 3))
    g.fillStyle(C.deskDark, 1)
    g.fillTriangle(toX(CATAPULT.x) - 5, toY(CATAPULT.baseY), toX(CATAPULT.x) + 5, toY(CATAPULT.baseY), toX(CATAPULT.x), toY(CATAPULT.baseY) - 10)
    g.lineStyle(3, C.ink, 1)
    g.strokeRoundedRect(x, y, w, h, 14)

    const icons: Phaser.GameObjects.Image[] = []
    map.holes.forEach((hole, i) => {
        const cellIndex = hole.device === 'hdInterno' ? GABINETE_CELL : DEVICE_CELL[hole.device]
        const icon = scene.add
            .image(toX((hole.x0 + hole.x1) / 2), toY(world.holeTop(i)) + 2, DEVICE_SHEET.key, cellKey(cellIndex))
            .setScrollFactor(0)
            .setDepth(DEPTH.minimap + 1)
        icon.setScale(ICON / Math.max(icon.frame.width * 0.7, icon.frame.height * 0.7))
        icons.push(icon)
    })
    map.clouds.forEach(c => {
        const icon = scene.add.image(toX(c.x), toY(c.y), DEVICE_SHEET.key, cellKey(DEVICE_CELL.nuvem)).setScrollFactor(0).setDepth(DEPTH.minimap + 1)
        icon.setScale(ICON / (icon.frame.width * 0.75))
        icons.push(icon)
    })

    const view = scene.add.graphics().setScrollFactor(0).setDepth(DEPTH.minimap + 2)
    const viewW = Math.min(w - PAD * 2, W * sx)

    return {
        update(scrollX) {
            view.clear()
            const vx = toX(scrollX)
            view.lineStyle(4, C.white, 1)
            view.strokeRoundedRect(vx, y + 3, viewW, h - 6, 8)
            view.lineStyle(2, C.ink, 1)
            view.strokeRoundedRect(vx - 2, y + 1, viewW + 4, h - 2, 9)
        },
        contains: (px, py) => px >= x && px <= x + w && py >= y && py <= y + h,
        scrollFor(screenX) {
            const wx = (screenX - x - PAD) / sx
            return Phaser.Math.Clamp(wx - W / 2, 0, Math.max(0, map.width - W))
        },
        destroy() {
            g.destroy()
            view.destroy()
            icons.forEach(i => i.destroy())
        },
    }
}
