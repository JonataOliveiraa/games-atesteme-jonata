import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEVICE_CELL, DEVICE_SHEET, GABINETE_CELL } from '../data/files'
import { CLOUD, DEPTH, DEVICE_ART, DEVICE_H, DEVICE_SCALE } from '../data/layout'
import { deviceAt, targetsOf } from '../data/levels'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { NAME } from '../data/words'
import type { DeviceId, Round, TargetId } from '../types'
import { cell } from './art'
import type { World } from './world'

export type Rect = { x: number; y: number; w: number; h: number }

export interface Targets {
    update(time: number): void
    clouds(): Array<{ x: number; y: number }>
    pos(id: TargetId): { x: number; y: number }
    rect(id: TargetId): Rect
    glow(id: TargetId, color: number): void
    shake(id: TargetId): Promise<void>
    tag(id: TargetId, text: string, color: string): void
    destroy(): void
}

interface Item {
    root: Phaser.GameObjects.Container
    label: Phaser.GameObjects.Container
}

function label(scene: Phaser.Scene, x: number, y: number, text: string) {
    const t = scene.add
        .text(0, 1, text, { fontFamily: FONT.black, fontSize: `${SIZE.label}px`, color: CSS.ink })
        .setOrigin(0.5)
        .setResolution(2)
    const w = t.width + 24
    const h = 34
    const g = scene.add.graphics()
    g.fillStyle(C.shadow, 0.18)
    g.fillRoundedRect(-w / 2 + 2, -h / 2 + 4, w, h, h / 2)
    g.fillStyle(C.white, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
    g.lineStyle(3, C.ink, 1)
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, h / 2)
    return scene.add.container(x, y, [g, t]).setDepth(DEPTH.label)
}

/** a arte do aparelho em pé, com a base na origem; o HD interno aparece como o computador que o traz dentro */
function deviceArt(scene: Phaser.Scene, id: DeviceId) {
    if (id === 'nuvem') return cell(scene, DEVICE_SHEET, DEVICE_CELL.nuvem, CLOUD.scale)
    const index = id === 'hdInterno' ? GABINETE_CELL : DEVICE_CELL[id]
    return cell(scene, DEVICE_SHEET, index, DEVICE_SCALE[id]).setOrigin(0.5, DEVICE_ART.baseY / DEVICE_SHEET.cellH)
}

/** os alvos do mapa: os aparelhos em pé na superfície e as nuvens do céu */
export function createTargets(scene: Phaser.Scene, round: Round, world: World): Targets {
    const items = new Map<TargetId, Item>()
    const tags: Phaser.GameObjects.Text[] = []
    const cloudX = round.map.clouds.map(c => c.x)
    const labelY = (i: number) => world.deviceBase(i).y - DEVICE_H[round.map.devices[i].device] - DEVICE_ART.labelGap

    targetsOf(round).forEach(id => {
        const i = Number(id.slice(1))
        const device = deviceAt(round, id)
        if (id.startsWith('d')) {
            const base = world.deviceBase(i)
            const root = scene.add.container(base.x, base.y, [deviceArt(scene, device)]).setDepth(DEPTH.device)
            items.set(id, { root, label: label(scene, base.x, labelY(i), NAME[device]) })
            return
        }
        const c = round.map.clouds[i]
        const root = scene.add.container(c.x, c.y, [deviceArt(scene, device)]).setDepth(DEPTH.cloud)
        items.set(id, { root, label: label(scene, c.x, c.y + CLOUD.labelDy, NAME[device]) })
    })

    const pos = (id: TargetId) => {
        const item = items.get(id)
        if (!item) return { x: 0, y: 0 }
        if (id.startsWith('c')) return { x: item.root.x, y: item.root.y }
        const box = world.deviceBox(Number(id.slice(1)))
        return { x: box.x, y: box.y }
    }

    return {
        update(time) {
            round.map.clouds.forEach((c, i) => {
                cloudX[i] = c.x + Math.sin((time / 6000 + i * 0.37) * Math.PI * 2) * c.sway
                const item = items.get(`c${i}`)
                item?.root.setX(cloudX[i])
                item?.label.setX(cloudX[i])
            })
        },
        clouds: () => round.map.clouds.map((c, i) => ({ x: cloudX[i], y: c.y })),
        pos,
        rect(id) {
            const p = pos(id)
            if (id.startsWith('c')) return { x: p.x, y: p.y + 20, w: 240, h: 200 }
            const i = Number(id.slice(1))
            const top = labelY(i) - 26
            const bottom = world.deviceBase(i).y + 16
            return { x: p.x, y: (top + bottom) / 2, w: 200, h: bottom - top }
        },
        glow(id, color) {
            const p = pos(id)
            void FX.ping(scene, p.x, p.y, color, { radius: 110, duration: 620, depth: DEPTH.fx })
            const root = items.get(id)?.root
            if (root) void FX.impact(scene, root, 0.16)
        },
        async shake(id) {
            const root = items.get(id)?.root
            if (root) await FX.shake(scene, root, { amount: 12, times: 4 })
        },
        tag(id, text, color) {
            const p = pos(id)
            const y = id.startsWith('c') ? p.y - 96 : labelY(Number(id.slice(1))) - 50
            const t = scene.add
                .text(p.x, y, text, { fontFamily: FONT.black, fontSize: '30px', color, stroke: CSS.white, strokeThickness: 8 })
                .setOrigin(0.5)
                .setResolution(2)
                .setDepth(DEPTH.fx)
            tags.push(t)
            void FX.popIn(scene, t, { from: 0.4, duration: 300 })
        },
        destroy() {
            items.forEach(item => {
                item.root.destroy()
                item.label.destroy()
            })
            tags.splice(0).forEach(t => t.destroy())
        },
    }
}
