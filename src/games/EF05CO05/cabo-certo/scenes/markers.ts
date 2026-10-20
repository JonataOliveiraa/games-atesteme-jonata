import Phaser from 'phaser'
import { DEPTH, MARKER } from '../data/layout'
import { C } from '../data/theme'
import type { DeviceId, Vec } from '../types'
import type { View } from './view'

/**
 * Setinhas na borda da janela apontando os aparelhos acordados e sem cabo que
 * estão fora da vista. São o "tem mais coisa ali" de um mapa maior que a tela.
 */
export interface Markers {
    update(targets: { id: DeviceId; at: Vec }[]): void
    visible(on: boolean): void
    destroy(): void
}

export function createMarkers(scene: Phaser.Scene, view: View): Markers {
    const pool = new Map<DeviceId, Phaser.GameObjects.Container>()
    let shown = true

    const make = () => {
        const g = scene.add.graphics()
        g.fillStyle(C.shadow, 0.25)
        g.fillCircle(2, 4, MARKER.size)
        g.fillStyle(C.white, 1)
        g.fillCircle(0, 0, MARKER.size)
        const s = MARKER.size
        g.fillStyle(C.accent, 1)
        g.fillTriangle(s * 0.72, 0, s * 0.02, -s * 0.5, s * 0.02, s * 0.5)
        g.fillRoundedRect(-s * 0.62, -s * 0.16, s * 0.7, s * 0.32, s * 0.12)
        const box = scene.add.container(0, 0, [g]).setDepth(DEPTH.marker)
        scene.tweens.add({ targets: box, scale: 1.15, duration: 520, yoyo: true, repeat: -1 })
        return box
    }

    return {
        update(targets) {
            // A janela do mapa cresce quando o cabeçalho sobe: as bordas são medidas agora.
            const r = view.rect()
            const left = r.x + MARKER.inset
            const right = r.x + r.w - MARKER.inset
            const top = r.y + MARKER.inset
            const bottom = r.y + r.h - MARKER.inset
            const cx = r.x + r.w / 2
            const cy = r.y + r.h / 2
            const keep = new Set<DeviceId>()
            targets.forEach(({ id, at }) => {
                if (view.inView(at, 40)) return
                keep.add(id)
                const s = view.toScreen(at)
                const dx = s.x - cx
                const dy = s.y - cy
                const k = Math.min(Math.abs((dx > 0 ? right - cx : left - cx) / (dx || 1e-6)), Math.abs((dy > 0 ? bottom - cy : top - cy) / (dy || 1e-6)))
                let box = pool.get(id)
                if (!box) {
                    box = make()
                    pool.set(id, box)
                }
                box.setPosition(cx + dx * k, cy + dy * k).setRotation(Math.atan2(dy, dx)).setVisible(shown)
            })
            pool.forEach((box, id) => {
                if (keep.has(id)) return
                scene.tweens.killTweensOf(box)
                box.destroy()
                pool.delete(id)
            })
        },
        visible(on) {
            shown = on
            pool.forEach(box => box.setVisible(on))
        },
        destroy() {
            pool.forEach(box => {
                scene.tweens.killTweensOf(box)
                box.destroy()
            })
            pool.clear()
        },
    }
}
