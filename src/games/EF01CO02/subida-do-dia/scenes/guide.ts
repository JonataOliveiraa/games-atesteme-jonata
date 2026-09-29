import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { createVisualGuide, type GuideRect } from '../../../../shared/guide/createVisualGuide'
import { PIECE_CELL, PIECES } from '../data/files'
import { OPTIONS } from '../data/layout'
import { C } from '../data/theme'
import type { Board } from './board'
import type { Ladder } from './ladder'
import type { Options } from './options'

export interface ClimbGuide {
    pointAt(slot: number, until: Promise<unknown>): Promise<void>
    help(rung?: number): Promise<void>
    readonly active: boolean
    destroy(): void
}

const TAP_DY = 34

export function createClimbGuide(
    scene: Phaser.Scene,
    deps: { board: Board; ladder: Ladder; options: Options },
): ClimbGuide {
    const guide = createVisualGuide(scene, {
        veilColor: C.shadow,
        rimColor: C.gold,
        handTexture: { key: PIECES, frame: PIECE_CELL.guideHand, tipX: 80, tipY: 26, height: 130 },
    })

    const lowTap = (r: GuideRect): GuideRect => ({ x: r.x, y: r.y + TAP_DY, w: r.w, h: r.h + TAP_DY * 2 })

    const bothOptions: GuideRect = {
        x: OPTIONS.x,
        y: (OPTIONS.ys[0] + OPTIONS.ys[OPTIONS.ys.length - 1]) / 2,
        w: OPTIONS.card,
        h: OPTIONS.ys[OPTIONS.ys.length - 1] - OPTIONS.ys[0] + OPTIONS.card,
    }

    const look = (target: GuideRect, ms: number, pulse?: Phaser.GameObjects.Container) =>
        guide.demo({ target, gesture: { kind: 'none' }, pulse, action: () => FX.wait(scene, ms) })

    return {
        async pointAt(slot, until) {
            let met = false
            void until.then(() => {
                met = true
            })
            await guide.waitFor({ target: lowTap(deps.options.rect(slot)), until: () => met })
            await guide.hide()
        },
        async help(rung) {
            if (!(await look(deps.board.frameRect, 1400))) return
            if (!(await look(deps.board.cloudRect, 1400, deps.board.cloud))) return
            const step = rung === undefined ? deps.ladder.rect : deps.ladder.rungRect(rung)
            if (!(await look(step, 1200))) return
            if (!(await look(bothOptions, 1400))) return
            await guide.hide()
        },
        get active() {
            return guide.active
        },
        destroy() {
            guide.destroy()
        },
    }
}
