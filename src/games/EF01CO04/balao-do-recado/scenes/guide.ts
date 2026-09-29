import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { createVisualGuide, type GuideRect } from '../../../../shared/guide/createVisualGuide'
import { PIECE_CELL, PIECES } from '../data/files'
import { BALLOON, BAND, W } from '../data/layout'
import { C } from '../data/theme'
import type { Arrival } from './arrival'
import type { Balloon } from './balloon'
import type { Card } from './card'
import type { Choice } from './choice'
import type { RecipientWindow } from './window'

export interface FlightGuide {
    play(p: { press: (on: boolean) => void; childHold: Promise<unknown> }): Promise<void>
    replay(p: { press: (on: boolean) => void }): Promise<void>
    choose(childTap: Promise<unknown>): Promise<void>
    chooseHint(): Promise<void>
    readonly active: boolean
    destroy(): void
}

const HOLD_MS = 1100
const LOOP_HOLD_MS = 900

const GUIDE_DEPTH = 8500
const HOVER_MS = 520
const REST_MS = 560

export function createFlightGuide(
    scene: Phaser.Scene,
    deps: { card: Card; balloon: Balloon; window: RecipientWindow; choice: Choice; arrival: Arrival },
): FlightGuide {
    const guide = createVisualGuide(scene, {
        depth: GUIDE_DEPTH,
        veilColor: C.shadow,
        rimColor: C.gold,
        handTexture: { key: PIECES, frame: PIECE_CELL.guideHand, tipX: 89, tipY: 28, height: 120 },
    })

    const band: GuideRect = { x: W / 2, y: (BAND.top + BAND.bottom) / 2, w: W - 40, h: BAND.bottom - BAND.top + 20 }
    const balloonRect = (): GuideRect => ({ x: BALLOON.x - 20, y: deps.balloon.y + 20, w: 240, h: 300 })

    const finger = scene.textures.exists(PIECES)
        ? scene.add.image(0, 0, PIECES, PIECE_CELL.guideHand).setOrigin(89 / 320, 28 / 320).setScale(0.5)
        : scene.add.circle(0, 0, 14, C.white).setStrokeStyle(4, C.ink)
    finger.setDepth(GUIDE_DEPTH + 6).setScrollFactor(0).setAlpha(0)
    let hovering = 0

    const choiceArea = (): GuideRect => {
        const box = deps.window.bounds
        const cards = deps.choice.points()
        const half = deps.choice.size / 2 + 10
        const left = Math.max(8, Math.min(box.x - box.w / 2, ...cards.map(p => p.x - half)))
        const right = Math.min(W - 8, Math.max(box.x + box.w / 2, ...cards.map(p => p.x + half)))
        const top = Math.max(96, Math.min(box.y - box.h / 2, ...cards.map(p => p.y - half)))
        const bottom = Math.min(712, Math.max(box.y + box.h / 2, ...cards.map(p => p.y + half)))
        return { x: (left + right) / 2, y: (top + bottom) / 2, w: right - left, h: bottom - top }
    }

    const stopHover = () => {
        hovering += 1
        scene.tweens.killTweensOf(finger)
        if (finger.active) scene.tweens.add({ targets: finger, alpha: 0, duration: 160 })
    }

    const hover = async (rounds: number, until?: () => boolean) => {
        const run = ++hovering
        const live = () => run === hovering && finger.active && !(until?.() ?? false)
        const spots = deps.choice.points().map(p => ({ x: p.x + 20, y: p.y + 40 }))
        if (!spots.length) return
        finger.setPosition(spots[0].x + 30, spots[0].y + 40).setAlpha(0)
        await FX.to(scene, finger, { alpha: 1 }, { duration: 200 })
        for (let round = 0; rounds <= 0 || round < rounds; round++) {
            for (const spot of spots) {
                if (!live()) return
                await FX.to(scene, finger, { x: spot.x, y: spot.y }, { duration: HOVER_MS, ease: 'Sine.easeInOut' })
                if (!live()) return
                await FX.to(scene, finger, { y: spot.y - 10 }, { duration: REST_MS / 2, yoyo: true, ease: 'Sine.easeInOut' })
            }
        }
    }

    const showRange = async () => {
        const grown = await guide.demo({
            target: { x: W / 2, y: 408, w: W - 20, h: 600 },
            gesture: { kind: 'none' },
            action: () => deps.arrival.voiceRange(),
        })
        if (!grown) return false
        return guide.demo({ target: deps.window.bounds, gesture: { kind: 'none' }, action: () => FX.wait(scene, 1300) })
    }

    const lookAtMessage = async () => {
        const card = await guide.demo({
            target: deps.card.rect,
            gesture: { kind: 'none' },
            pulse: deps.card.container,
            action: () => FX.wait(scene, 1400),
        })
        if (!card) return false
        return guide.demo({
            target: balloonRect(),
            gesture: { kind: 'none' },
            action: () => FX.wait(scene, 1100),
        })
    }

    const showHold = async (press: (on: boolean) => void) => {
        const held = await guide.demo({
            target: band,
            gesture: { kind: 'hold', ms: HOLD_MS },
            action: async () => {
                press(true)
                await FX.wait(scene, HOLD_MS)
                press(false)
            },
        })
        if (!held) {
            press(false)
            return false
        }
        return guide.demo({ target: band, gesture: { kind: 'none' }, action: () => FX.wait(scene, 1100) })
    }

    return {
        async play({ press, childHold }) {
            if (!(await lookAtMessage())) return
            if (!(await showHold(press))) return
            await guide.waitFor({ target: band, gesture: { kind: 'hold', ms: LOOP_HOLD_MS }, until: childHold })
            await guide.hide()
        },
        async replay({ press }) {
            if (!(await lookAtMessage())) return
            await showHold(press)
            await guide.hide()
        },
        async choose(childTap) {
            let tapped = false
            void childTap.then(() => {
                tapped = true
                stopHover()
            })
            try {
                if (!(await showRange()) || tapped) return
                void hover(0, () => tapped)
                await guide.waitFor({ target: choiceArea(), gesture: { kind: 'none' }, until: childTap })
            } finally {
                stopHover()
                await guide.hide()
            }
        },
        async chooseHint() {
            try {
                if (!(await showRange())) return
                await guide.demo({ target: choiceArea(), gesture: { kind: 'none' }, action: () => hover(2) })
            } finally {
                stopHover()
                await guide.hide()
            }
        },
        get active() {
            return guide.active
        },
        destroy() {
            hovering += 1
            scene.tweens.killTweensOf(finger)
            finger.destroy()
            guide.destroy()
        },
    }
}
