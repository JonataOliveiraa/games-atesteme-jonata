import Phaser from 'phaser'
import { DEVICE_CELL, DEVICE_SHEET, GABINETE_CELL, cellKey } from '../data/files'
import { FX } from '../../../../shared/effects/FX'
import { CATAPULT, DEPTH, DEVICE_ART, HEADER, MINIMAP, W } from '../data/layout'
import { C, LAND } from '../data/theme'
import type { Round, Scenery } from '../types'
import type { World } from './world'

export interface Minimap {
    /** desenha a janela da câmera */
    update(scrollX: number): void
    contains(x: number, y: number): boolean
    /** o scrollX que centraliza a câmera no ponto tocado do mapinha */
    scrollFor(screenX: number): number
    setShown(on: boolean): void
    destroy(): void
}

const PAD = 8
const ICON = 22
const TOP_Y = 80
/** px do mundo por traço do túnel tracejado */
const DASH = 60

export function createMinimap(scene: Phaser.Scene, round: Round, world: World, scenery: Scenery = 'campo'): Minimap {
    const land = LAND[scenery]
    const { x, y, w, h } = MINIMAP
    const map = round.map
    const sx = (w - PAD * 2) / map.width
    const sy = (h - PAD * 2) / (720 - TOP_Y)
    const toX = (wx: number) => x + PAD + wx * sx
    const toY = (wy: number) => y + PAD + (wy - TOP_Y) * sy

    const g = scene.add.graphics()
    g.fillStyle(C.shadow, 0.18)
    g.fillRoundedRect(x + 2, y + 4, w, h, 14)
    g.fillStyle(land.mapSky, 0.95)
    g.fillRoundedRect(x, y, w, h, 14)
    map.ground.forEach(line => {
        const pts = [...line, [line[line.length - 1][0], 720], [line[0][0], 720]].map(([px, py]) => new Phaser.Math.Vector2(toX(px), Math.min(toY(py), y + h - PAD)))
        g.fillStyle(land.mapGround, 1)
        g.fillPoints(pts, true)
        g.lineStyle(3, land.mapEdge, 1)
        g.strokePoints(line.map(([px, py]) => new Phaser.Math.Vector2(toX(px), toY(py))))
    })
    map.tunnels.forEach((_, i) => {
        const path = world.tunnelPath(i)
        g.lineStyle(2, C.ink, 0.7)
        let on = true
        let run = 0
        for (let k = 1; k < path.length; k++) {
            const a = path[k - 1]
            const b = path[k]
            if (on) g.lineBetween(toX(a.x), Math.min(toY(a.y), y + h - 3), toX(b.x), Math.min(toY(b.y), y + h - 3))
            run += Math.hypot(b.x - a.x, b.y - a.y)
            if (run > DASH) {
                run = 0
                on = !on
            }
        }
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
    map.devices.forEach((d, i) => {
        const cellIndex = d.device === 'hdInterno' ? GABINETE_CELL : DEVICE_CELL[d.device]
        const base = world.deviceBase(i)
        const icon = scene.add.image(toX(base.x), toY(base.y), DEVICE_SHEET.key, cellKey(cellIndex))
        icon.setOrigin(0.5, DEVICE_ART.baseY / DEVICE_SHEET.cellH)
        icon.setScale(ICON / Math.max(icon.frame.width * 0.7, icon.frame.height * 0.7))
        icons.push(icon)
    })
    map.clouds.forEach(c => {
        const icon = scene.add.image(toX(c.x), toY(c.y), DEVICE_SHEET.key, cellKey(DEVICE_CELL.nuvem))
        icon.setScale(ICON / (icon.frame.width * 0.75))
        icons.push(icon)
    })

    const view = scene.add.graphics()
    const viewW = Math.min(w - PAD * 2, W * sx)
    const root = scene.add.container(0, 0, [g, ...icons, view]).setDepth(DEPTH.minimap).setScrollFactor(0)
    let shown = true

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
        setShown(on) {
            if (on === shown) return
            shown = on
            scene.tweens.killTweensOf(root)
            void FX.to(scene, root, { alpha: on ? 1 : 0 }, { duration: HEADER.slideMs })
        },
        destroy() {
            scene.tweens.killTweensOf(root)
            root.destroy()
        },
    }
}
