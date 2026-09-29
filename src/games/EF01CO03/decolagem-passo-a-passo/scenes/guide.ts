import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { createVisualGuide } from '../../../../shared/guide/createVisualGuide'
import { CARD_CELL, CARDS } from '../data/files'
import { C } from '../data/theme'
import type { Bench } from './bench'
import type { Ruler } from './ruler'
import type { Stage } from './stage'

export interface StepGuidePlay {
    next: () => string
    pick: (stepId: string) => Promise<void>
}

export interface StepGuide {
    play(steps: StepGuidePlay): Promise<void>
    replay(steps: Pick<StepGuidePlay, 'next'>): Promise<void>
    readonly active: boolean
    destroy(): void
}

export function createStepGuide(
    scene: Phaser.Scene,
    deps: { stage: Stage; bench: Bench; ruler: Ruler },
): StepGuide {
    const guide = createVisualGuide(scene, {
        veilColor: C.shadow,
        rimColor: C.gold,
        handTexture: { key: CARDS, frame: CARD_CELL.guideHand, tipX: 128, tipY: 20, height: 120 },
    })

    const lookAtMission = () =>
        guide.demo({
            target: deps.stage.rect,
            gesture: { kind: 'none' },
            pulse: deps.stage.hero,
            action: () => FX.wait(scene, 1500),
        })

    const tapCard = (id: string, action: () => Promise<void>) =>
        guide.demo({
            target: deps.bench.rect(id),
            action: async () => {
                const card = deps.bench.view(id)
                if (card) guide.follow(card.container, { w: 250, h: 160 })
                await action()
            },
        })

    const stagedPick = async (id: string) => {
        const card = deps.bench.take(id)
        if (!card) return
        const to = deps.ruler.slotRect(0)
        await FX.to(scene, card.container, { x: to.x, y: to.y, scale: deps.ruler.cardScale }, { duration: 520, ease: 'Sine.easeInOut' })
        await FX.wait(scene, 500)
        await deps.bench.putBack(id, card)
    }

    return {
        async play({ next, pick }) {
            if (!(await lookAtMission())) return
            const id = next()
            if (!(await tapCard(id, () => pick(id)))) return
            await guide.demo({ target: deps.ruler.slotRect(0), gesture: { kind: 'none' }, action: () => FX.wait(scene, 700) })
            await guide.hide()
        },
        async replay({ next }) {
            if (!(await lookAtMission())) return
            const id = next()
            await tapCard(id, () => stagedPick(id))
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
