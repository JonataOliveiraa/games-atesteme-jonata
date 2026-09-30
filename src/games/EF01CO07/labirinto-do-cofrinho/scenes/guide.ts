import Phaser from 'phaser'
import { createVisualGuide, type GuideRect } from '../../../../shared/guide/createVisualGuide'
import { HAND, PIECES } from '../data/files'
import { GRID } from '../data/layout'
import { A, C, CSS } from '../data/theme'
import type { Point } from '../types'
import type { MagnetView } from './magnet'

export interface MazeGuide {
    magnet(m: MagnetView): Promise<boolean>
    walk(p: { at: Point; to: Point; walk: () => Promise<void> }): Promise<boolean>
    practice(p: { area: GuideRect; until: () => boolean }): Promise<boolean>
    hide(): Promise<void>
    destroy(): void
}

const GUIDE_DEPTH = 8500
const MARGIN = GRID.cell * 0.8

export function createMazeGuide(scene: Phaser.Scene): MazeGuide {
    const guide = createVisualGuide(scene, {
        depth: GUIDE_DEPTH,
        veilColor: C.shadow,
        veilAlpha: A.veil,
        rimColor: C.glow,
        captionColor: CSS.ink,
        handTexture: { key: PIECES, frame: 'hand', tipX: HAND.tipX, tipY: HAND.tipY, height: 120 },
    })

    return {
        magnet(m) {
            return guide.demo({ target: m.rect, gesture: { kind: 'none' }, action: () => m.ghostPull() })
        },
        walk({ at, to, walk }) {
            const target = {
                x: to.x,
                y: to.y,
                w: Math.abs(to.x - at.x) * 2 + MARGIN * 2,
                h: Math.abs(to.y - at.y) * 2 + MARGIN * 2,
            }
            return guide.demo({ target, gesture: { kind: 'tap' }, action: walk })
        },
        practice({ area, until }) {
            return guide.waitFor({ target: area, gesture: { kind: 'none' }, until })
        },
        hide: () => guide.hide(),
        destroy() {
            guide.destroy()
        },
    }
}
