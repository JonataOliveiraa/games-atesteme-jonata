import Phaser from 'phaser'
import { FX, Ease } from '../../../../shared/effects/FX'
import { DEPTH, H, PANEL, STAGE, W } from '../data/layout'
import { C } from '../data/theme'
import { TIMING } from '../data/timing'
import type { Art, Point, Rect } from '../types'
import { baked, cardImage, cloudBox, createArtView, paintArrowRight, paintArrowUp, paintCloud } from './art'
import type { Audio } from './audio'

export type ActKind = 'ok' | 'fail' | 'stray'

export interface Panel {
    enter(start: Art, goal: Art): Promise<void>
    setState(art: Art, puff?: boolean): Promise<void>
    act(step: Art, after: Art | undefined, kind: ActKind): Promise<void>
    celebrate(): Promise<void>
    setVisible(on: boolean): void
    readonly goalRect: Rect
    readonly stateRect: Rect
    readonly rect: Rect
    readonly statePoint: Point
    readonly goalPoint: Point
    destroy(): void
}

const GOAL_KEY = 'sdd-panel-goal'
const ARROW_UP = 'sdd-arrow-up'
const ARROW_RIGHT = 'sdd-arrow-right'

export function createPanel(scene: Phaser.Scene, audio: Pick<Audio, 'puff' | 'boing'>): Panel {
    const fixed = <T extends Phaser.GameObjects.Components.ScrollFactor>(o: T) => o.setScrollFactor(0)

    const box = cloudBox(PANEL.goalW, PANEL.goalH)
    baked(scene, GOAL_KEY, box.w, box.h, g => paintCloud(g, box.w / 2, box.h / 2, PANEL.goalW, PANEL.goalH, 5))
    const goalArt = createArtView(scene, 0, 4, PANEL.goalArt)
    const goal = fixed(scene.add.container(PANEL.x, PANEL.goalY, [scene.add.image(0, 0, GOAL_KEY), goalArt.container])).setDepth(DEPTH.panel)

    baked(scene, ARROW_UP, 80, 80, g => paintArrowUp(g, 40, 62, 56))
    const arrow = fixed(scene.add.image(PANEL.x, PANEL.arrowY, ARROW_UP)).setDepth(DEPTH.panel)

    const stateArt = createArtView(scene, 0, 0, PANEL.stateArt)
    const state = fixed(
        scene.add.container(PANEL.x, PANEL.stateY, [cardImage(scene, 'sdd-state-card', PANEL.state, PANEL.state, 30), stateArt.container]),
    ).setDepth(DEPTH.panel)

    const veil = fixed(scene.add.rectangle(W / 2, H / 2, W, H, C.shadow, 1))
        .setDepth(DEPTH.veil)
        .setAlpha(0)
        .setVisible(false)

    const iconArt = createArtView(scene, 0, 0, STAGE.iconArt)
    const icon = fixed(
        scene.add.container(STAGE.iconX, STAGE.iconY, [cardImage(scene, 'sdd-icon-card', STAGE.icon, STAGE.icon, 28), iconArt.container]),
    )
        .setDepth(DEPTH.stage)
        .setVisible(false)

    baked(scene, ARROW_RIGHT, 110, 110, g => paintArrowRight(g, 48, 55, 70))
    const pointer = fixed(scene.add.image(STAGE.arrowX, STAGE.iconY, ARROW_RIGHT)).setDepth(DEPTH.stage).setVisible(false)

    const puffs = new Set<Phaser.GameObjects.Arc>()
    const puff = (x: number, y: number, spread: number) => {
        for (let i = 0; i < 8; i++) {
            const a = (i / 8) * Math.PI * 2
            const dot = fixed(scene.add.circle(x, y, 18, C.paperLight).setStrokeStyle(4, C.ink)).setDepth(DEPTH.stage + 2)
            puffs.add(dot)
            scene.tweens.add({
                targets: dot,
                x: x + Math.cos(a) * spread,
                y: y + Math.sin(a) * spread * 0.9,
                scale: 0.3,
                alpha: 0,
                duration: FX.ms(scene, 380),
                ease: 'Sine.easeOut',
                onComplete: () => {
                    puffs.delete(dot)
                    dot.destroy()
                },
            })
        }
    }

    const shake = async (target: Phaser.GameObjects.Container, x: number) => {
        for (let i = 0; i < 4; i++) {
            await FX.to(scene, target, { angle: 4, x: x + 8 }, { duration: 85 })
            await FX.to(scene, target, { angle: -4, x: x - 8 }, { duration: 85 })
        }
        await FX.to(scene, target, { angle: 0, x }, { duration: 110 })
    }

    const home = () => {
        FX.kill(scene, state)
        state.setPosition(PANEL.x, PANEL.stateY).setScale(1).setAngle(0).setAlpha(1).setDepth(DEPTH.panel)
    }

    const swap = async (art: Art, withPuff: boolean, x: number, y: number, spread: number) => {
        const s = state.scale
        await FX.to(scene, state, { scale: s * 0.86, alpha: 0.4 }, { duration: 110 })
        stateArt.set(art)
        if (withPuff) puff(x, y, spread)
        await FX.to(scene, state, { scale: s, alpha: 1 }, { duration: 260, ease: Ease.back(2) })
    }

    const stateRect: Rect = { x: PANEL.x, y: PANEL.stateY, w: PANEL.state + 20, h: PANEL.state + 20 }
    const goalRect: Rect = { x: PANEL.x, y: PANEL.goalY, w: PANEL.goalW + 10, h: PANEL.goalH + 10 }
    const top = PANEL.goalY - PANEL.goalH / 2 - 10
    const bottom = PANEL.stateY + PANEL.state / 2 + 16

    return {
        async enter(start, goalPic) {
            home()
            stateArt.set(start)
            goalArt.set(goalPic)
            FX.kill(scene, [goal, arrow])
            goal.setScale(1)
            arrow.setScale(1)
            ;[goal, arrow, state].forEach(o => o.setVisible(true))
            await FX.all(
                FX.popIn(scene, goal, { from: 0.5 }),
                FX.popIn(scene, arrow, { from: 0.5, delay: 120 }),
                FX.popIn(scene, state, { from: 0.5, delay: 220 }),
            )
        },
        setState(art, withPuff = true) {
            home()
            return swap(art, withPuff, PANEL.x, PANEL.stateY, 150)
        },
        async act(step, after, kind) {
            home()
            iconArt.set(step)
            veil.setVisible(true)
            state.setDepth(DEPTH.stage + 1)
            await FX.all(
                FX.to(scene, veil, { alpha: 0.62 }, { duration: TIMING.stageIn }),
                FX.to(scene, state, { x: STAGE.frameX, y: STAGE.frameY, scale: STAGE.frameScale }, { duration: TIMING.stageIn }),
            )
            icon.setVisible(true).setPosition(STAGE.iconX, STAGE.iconY).setAngle(0).setAlpha(1)
            pointer.setVisible(true)
            await FX.all(FX.popIn(scene, icon, { from: 0.4 }), FX.popIn(scene, pointer, { from: 0.4, delay: 140 }))
            await FX.wait(scene, TIMING.beat)

            if (kind === 'stray') {
                await FX.to(scene, icon, { x: STAGE.frameX - 230, angle: 8 }, { duration: 260, ease: 'Quad.easeIn' })
                audio.boing()
                void shake(state, STAGE.frameX)
                await FX.to(scene, icon, { x: STAGE.iconX - 30, y: STAGE.iconY - 60, angle: -30 }, { duration: 260, ease: 'Quad.easeOut' })
                await FX.to(scene, icon, { y: H + 200, angle: -120, alpha: 0.6 }, { duration: 520, ease: 'Quad.easeIn' })
                await FX.wait(scene, TIMING.stageHold)
            } else {
                await FX.all(
                    FX.to(scene, icon, { x: STAGE.frameX, y: STAGE.frameY, scale: 0.35, alpha: 0 }, { duration: TIMING.iconDive, ease: 'Quad.easeIn' }),
                    FX.to(scene, pointer, { alpha: 0 }, { duration: TIMING.iconDive }),
                )
                if (kind === 'ok') audio.puff()
                else audio.boing()
                if (after) await swap(after, kind === 'ok', STAGE.frameX, STAGE.frameY, 210)
                if (kind === 'fail') {
                    await shake(state, STAGE.frameX)
                    await FX.wait(scene, TIMING.stageFail)
                } else {
                    await FX.wait(scene, TIMING.stageHold)
                }
            }

            icon.setVisible(false).setScale(1)
            pointer.setVisible(false).setAlpha(1)
            await FX.all(
                FX.to(scene, veil, { alpha: 0 }, { duration: TIMING.stageOut }),
                FX.to(scene, state, { x: PANEL.x, y: PANEL.stateY, scale: 1 }, { duration: TIMING.stageOut }),
            )
            veil.setVisible(false)
            home()
        },
        async celebrate() {
            home()
            void FX.sparks(scene, PANEL.x, PANEL.stateY + scene.cameras.main.scrollY, { color: C.gold, count: 14, spread: 150, depth: DEPTH.stage })
            await FX.all(FX.impact(scene, goal, 0.12), FX.impact(scene, state, 0.1))
        },
        setVisible(on) {
            ;[goal, arrow, state].forEach(o => o.setVisible(on))
        },
        goalRect,
        stateRect,
        rect: { x: PANEL.x, y: (top + bottom) / 2, w: PANEL.state + 30, h: bottom - top },
        statePoint: { x: PANEL.x, y: PANEL.stateY },
        goalPoint: { x: PANEL.x, y: PANEL.goalY },
        destroy() {
            puffs.forEach(p => p.destroy())
            puffs.clear()
            stateArt.destroy()
            goalArt.destroy()
            iconArt.destroy()
            ;[goal, arrow, state, veil, icon, pointer].forEach(o => o.destroy())
        },
    }
}
