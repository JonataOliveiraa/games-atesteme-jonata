import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { createVisualGuide } from '../../../../shared/guide/createVisualGuide'
import { HAND, PIECE_CELL, PIECES } from '../data/files'
import { A, C, CSS } from '../data/theme'
import type { Board } from './board'
import type { Sail } from './sail'
import type { FishView, School } from './school'

export interface FishingGuide {
    intro(onBeat: () => void): Promise<boolean>
    catchDemo(p: { isTarget: (fish: FishView) => boolean; onSpotted: () => void; catchLit: () => Promise<void> }): Promise<boolean>
    replay(onBeat: () => void): Promise<void>
    hide(): Promise<void>
    readonly active: boolean
    destroy(): void
}

const GUIDE_DEPTH = 8500
const SAY = 'Pesque a mesma cor!'

export function createFishingGuide(scene: Phaser.Scene, deps: { board: Board; sail: Sail; school: School }): FishingGuide {
    const guide = createVisualGuide(scene, {
        depth: GUIDE_DEPTH,
        veilColor: C.shadow,
        veilAlpha: A.veil,
        rimColor: C.glow,
        captionColor: CSS.ink,
        handTexture: { key: PIECES, frame: PIECE_CELL.guideHand, tipX: HAND.tipX, tipY: HAND.tipY, height: 120 },
    })

    const showClue = async (onBeat: () => void) => {
        const heard = await guide.demo({
            target: deps.board.rect,
            gesture: { kind: 'none' },
            action: () => deps.board.play(onBeat),
        })
        if (!heard) return false
        return guide.demo({ target: deps.board.rect, gesture: { kind: 'tap' }, action: () => deps.board.play(onBeat) })
    }

    const showLegend = (onBeat: () => void) =>
        guide.demo({ target: deps.sail.rect, gesture: { kind: 'none' }, action: () => deps.sail.walk(onBeat) })

    return {
        async intro(onBeat) {
            if (!(await showClue(onBeat))) return false
            return showLegend(onBeat)
        },
        async catchDemo({ isTarget, onSpotted, catchLit }) {
            const seen = await guide.demo({
                target: deps.school.beamRect,
                gesture: { kind: 'none' },
                say: SAY,
                action: async () => {
                    await deps.school.waitLit(isTarget)
                    onSpotted()
                },
            })
            if (!seen) return false
            return guide.demo({ target: deps.school.beamRect, gesture: { kind: 'tap' }, action: catchLit })
        },
        async replay(onBeat) {
            try {
                if (!(await showClue(onBeat))) return
                if (!(await showLegend(onBeat))) return
                await guide.demo({ target: deps.school.beamRect, gesture: { kind: 'none' }, say: SAY, action: () => FX.wait(scene, 1400) })
            } finally {
                await guide.hide()
            }
        },
        hide: () => guide.hide(),
        get active() {
            return guide.active
        },
        destroy() {
            guide.destroy()
        },
    }
}
