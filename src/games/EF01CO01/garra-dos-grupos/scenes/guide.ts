import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { createVisualGuide } from '../../../../shared/guide/createVisualGuide'
import { ITEM_CELL, ITEMS } from '../data/files'
import { BOX, SHOWCASE } from '../data/layout'
import { C } from '../data/theme'
import type { Spot } from '../types'
import type { Claw } from './claw'
import type { TrayView } from './tray'
import type { Visor } from './visor'

export interface ClawGuidePlay {
    aligned: () => Promise<Spot>
    grab: () => Promise<void>
    childGrab: Promise<unknown>
}

export interface ClawGuide {
    play(steps: ClawGuidePlay, options?: { drawNot?: boolean }): Promise<void>
    replay(steps: Pick<ClawGuidePlay, 'aligned'>, options?: { drawNot?: boolean }): Promise<void>
    readonly active: boolean
    destroy(): void
}

const SHOWCASE_RECT = { x: SHOWCASE.cx, y: SHOWCASE.cy, w: SHOWCASE.w - 40, h: SHOWCASE.h - 40 }
const BOX_RECT = { x: BOX.cx, y: (BOX.baseY - BOX.h + BOX.slotY + BOX.slotR) / 2, w: BOX.w, h: BOX.h + BOX.slotR }

export function createClawGuide(
    scene: Phaser.Scene,
    deps: { visor: Visor; claw: Claw; tray: TrayView },
): ClawGuide {
    const guide = createVisualGuide(scene, {
        veilColor: C.shadow,
        rimColor: C.gold,
        handTexture: { key: ITEMS, frame: ITEM_CELL.guideHand, tipX: 91.5, tipY: 38, height: 120 },
    })

    const column = (spot: Spot) => ({ x: spot.x, y: spot.y, w: 170, h: 170 })

    const lookAtVisor = (drawNot = false) =>
        guide.demo({
            target: deps.visor.rect,
            gesture: { kind: 'none' },
            pulse: deps.visor.drop,
            action: async () => {
                if (drawNot) await deps.visor.drawNot()
                await FX.wait(scene, drawNot ? 900 : 1600)
            },
        })

    const waitAligned = async (aligned: () => Promise<Spot>) => {
        let spot: Spot | undefined
        const ok = await guide.demo({
            target: SHOWCASE_RECT,
            gesture: { kind: 'none' },
            action: async () => {
                spot = await aligned()
            },
        })
        return ok ? spot : undefined
    }

    const stagedGrab = async (spot: Spot) => {
        const { claw, tray } = deps
        await claw.drop(spot.y)
        const view = tray.take(spot.index)
        await claw.grab(view ?? null)
        await claw.rise()
        await FX.wait(scene, 300)
        if (!view) return
        await claw.drop(spot.y)
        const back = claw.give()
        if (back) await tray.putBack(spot.index, back)
        await claw.rise()
    }

    return {
        async play({ aligned, grab, childGrab }, options = {}) {
            if (!(await lookAtVisor(options.drawNot))) return
            const spot = await waitAligned(aligned)
            if (!spot) return
            const flying = deps.tray.view(spot.index)
            const thrown = await guide.demo({
                target: column(spot),
                action: async () => {
                    if (flying) guide.follow(flying.container, { w: 130, h: 130 })
                    await grab()
                },
            })
            if (!thrown) return
            await guide.demo({ target: BOX_RECT, gesture: { kind: 'none' }, action: () => FX.wait(scene, 900) })
            await guide.waitFor({ target: SHOWCASE_RECT, until: childGrab })
            await guide.hide()
        },
        async replay({ aligned }, options = {}) {
            if (!(await lookAtVisor(options.drawNot))) return
            const spot = await waitAligned(aligned)
            if (!spot) return
            await guide.demo({ target: column(spot), action: () => stagedGrab(spot) })
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
