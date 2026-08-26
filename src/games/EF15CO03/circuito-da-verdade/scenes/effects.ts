import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { C, ATTRACTION, signalColor, signalGlow } from '../data/theme'
import { W, RIDE, STAGE } from '../data/layout'
import type { AttractionDef, AttractionId } from '../types'

export interface RideView {
    container: Phaser.GameObjects.Container
    def: AttractionDef
    quizY: number
    stageY: number
    enter: (delay?: number) => void
    leave: (onDone?: () => void) => void
    toStage: (onDone?: () => void) => void
    toQuiz: (onDone?: () => void) => void
    powerOn: (onDone?: () => void) => void
    powerFail: (onDone?: () => void) => void
    preview: (value: boolean) => void
    clearPreview: () => void
    nudge: (amount?: number) => void
    worldPoint: () => { x: number; y: number }
}

export function createRide(
    scene: Phaser.Scene,
    layer: Phaser.GameObjects.Container,
    id: AttractionId,
): RideView {
    const def = ATTRACTION[id] as AttractionDef

    const quizW = def.portrait ? RIDE.tallW : RIDE.wideW
    const quizH = def.portrait ? RIDE.tallH : RIDE.wideH
    const stageW = def.portrait ? STAGE.tallW : STAGE.wideW
    const stageH = def.portrait ? STAGE.tallH : STAGE.wideH
    const quizY = def.portrait ? RIDE.tallY : RIDE.wideY
    const stageY = def.portrait ? STAGE.tallY : STAGE.wideY

    const container = scene.add.container(STAGE.x, stageY)
    const body = scene.add.container(0, 0)
    const art = scene.add.container(0, 0)

    const halo = scene.add.graphics()
    const shadow = scene.add.graphics()

    const off = scene.add.image(0, 0, def.off)
    const on = scene.add.image(0, 0, def.on).setAlpha(0)

    const quizScale = Math.min(quizW / off.width, quizH / off.height) * def.scale
    const stageScale = Math.min(stageW / off.width, stageH / off.height) * def.scale
    const ratio = stageScale / quizScale

    off.setScale(quizScale)
    on.setScale(quizScale)
    art.add([off, on])

    const halfH = (off.height * quizScale) / 2

    const paintHalo = (tone: number, alpha: number, spread: number) => {
        halo.clear()
        if (alpha <= 0) return
        halo.fillStyle(tone, alpha * 0.26)
        halo.fillCircle(0, 0, RIDE.haloR * spread)
        halo.fillStyle(tone, alpha * 0.32)
        halo.fillCircle(0, 0, RIDE.haloR * spread * 0.64)
        halo.fillStyle(C.cream, alpha * 0.24)
        halo.fillCircle(0, 0, RIDE.haloR * spread * 0.34)
    }
    paintHalo(C.sky, 0, 1)

    shadow.fillStyle(C.shadow, 0.26)
    shadow.fillEllipse(0, halfH + RIDE.shadowGap, off.width * quizScale * 0.7, 28)

    const name = scene.add.text(0, halfH + RIDE.nameGap, def.name, {
        fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
        fontSize: '20px',
        color: '#fbf49e',
        stroke: '#001a33',
        strokeThickness: 5,
    }).setOrigin(0.5).setResolution(2)

    body.add([halo, shadow, art, name])
    body.setScale(ratio)
    container.add(body)
    layer.add(container)

    let idle: Phaser.Tweens.Tween[] = []

    const stopIdle = () => {
        idle.forEach(t => t.stop())
        idle = []
        art.setAngle(0)
        art.setY(0)
    }

    const startIdle = () => {
        stopIdle()
        idle.push(scene.tweens.add({
            targets: on,
            alpha: { from: 1, to: 0.86 },
            duration: 900,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        }))
        if (def.spin) {
            idle.push(scene.tweens.add({
                targets: art,
                angle: { from: -1.8, to: 1.8 },
                duration: 2000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
            }))
        }
        if (def.bob) {
            idle.push(scene.tweens.add({
                targets: art,
                y: -16,
                duration: 1400,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
            }))
        }
        idle.push(scene.tweens.add({
            targets: { v: 0 },
            v: 1,
            duration: 1300,
            repeat: -1,
            onUpdate: (_tw, t) => paintHalo(C.gold, 0.48 + Math.sin(t.v * Math.PI * 2) * 0.14, 1),
        }))
    }

    const worldPoint = () => ({ x: container.x, y: container.y })

    return {
        container,
        def,
        quizY,
        stageY,

        enter: (delay = 0) => {
            body.setAlpha(0)
            body.setScale(ratio * 0.82)
            scene.tweens.add({
                targets: body,
                alpha: 1,
                scale: ratio,
                delay,
                duration: 640,
                ease: 'Back.easeOut',
            })
        },

        leave: (onDone) => {
            stopIdle()
            scene.tweens.add({
                targets: body,
                alpha: 0,
                scale: body.scale * 0.86,
                duration: 340,
                ease: 'Sine.easeIn',
                onComplete: () => {
                    container.destroy()
                    onDone?.()
                },
            })
        },

        toStage: (onDone) => {
            name.setVisible(true)
            scene.tweens.add({
                targets: container,
                x: STAGE.x,
                y: stageY,
                duration: 700,
                ease: 'Cubic.easeInOut',
            })
            scene.tweens.add({
                targets: body,
                scale: ratio,
                duration: 700,
                ease: 'Cubic.easeInOut',
                onComplete: () => onDone?.(),
            })
        },

        toQuiz: (onDone) => {
            name.setVisible(false)
            scene.tweens.add({
                targets: container,
                x: RIDE.x,
                y: quizY,
                duration: 700,
                ease: 'Cubic.easeInOut',
            })
            scene.tweens.add({
                targets: body,
                scale: 1,
                duration: 700,
                ease: 'Cubic.easeInOut',
                onComplete: () => onDone?.(),
            })
        },

        powerOn: (onDone) => {
            stopIdle()
            const p = worldPoint()

            scene.tweens.add({
                targets: { v: 0 },
                v: 1,
                duration: 340,
                onUpdate: (_tw, t) => paintHalo(C.cream, t.v * 0.9, 0.7 + t.v * 0.5),
            })

            scene.tweens.add({
                targets: on,
                alpha: 1,
                duration: 95,
                yoyo: true,
                repeat: 2,
                ease: 'Sine.easeOut',
            })

            scene.time.delayedCall(450, () => {
                on.setAlpha(1)
                scene.tweens.add({
                    targets: art,
                    scaleX: 1.06,
                    scaleY: 0.94,
                    duration: 150,
                    yoyo: true,
                    ease: 'Sine.easeOut',
                })
                EventBus.emit('sparks', { x: p.x, y: p.y, color: C.gold, count: 32, spread: 260 })
                EventBus.emit('park-flash', C.cream)
                startIdle()
                scene.time.delayedCall(620, () => onDone?.())
            })
        },

        powerFail: (onDone) => {
            stopIdle()
            const flick = { v: 0 }
            scene.tweens.add({
                targets: flick,
                v: 1,
                duration: 520,
                onUpdate: () => {
                    const blink = Math.sin(flick.v * Math.PI * 5)
                    on.setAlpha(Math.max(0, blink) * 0.4)
                    paintHalo(C.off, Math.max(0, blink) * 0.5, 0.8)
                },
                onComplete: () => {
                    on.setAlpha(0)
                    paintHalo(C.off, 0, 1)
                    scene.time.delayedCall(220, () => onDone?.())
                },
            })
            const baseX = container.x
            scene.tweens.add({
                targets: container,
                x: baseX + 9,
                duration: 60,
                yoyo: true,
                repeat: 3,
                onComplete: () => container.setX(baseX),
            })
        },

        preview: (value: boolean) => {
            paintHalo(signalGlow(value), 0.4, 0.9)
            on.setAlpha(value ? 0.32 : 0)
            off.setTint(value ? signalGlow(true) : signalColor(false))
        },

        clearPreview: () => {
            off.clearTint()
            if (idle.length) return
            on.setAlpha(0)
            paintHalo(C.sky, 0, 1)
        },

        nudge: (amount = 0.04) => {
            const base = body.scale
            scene.tweens.add({
                targets: body,
                scale: base * (1 + amount),
                duration: 170,
                yoyo: true,
                ease: 'Sine.easeInOut',
            })
        },

        worldPoint,
    }
}

export function pulseRail(
    scene: Phaser.Scene,
    layer: Phaser.GameObjects.Graphics,
    from: { x: number; y: number },
    to: { x: number; y: number },
    value: boolean,
    onDone?: () => void,
) {
    const state = { t: 0 }
    const tone = signalColor(value)
    const glow = signalGlow(value)

    scene.tweens.add({
        targets: state,
        t: 1,
        duration: 620,
        ease: 'Sine.easeInOut',
        onUpdate: () => {
            const x = Phaser.Math.Linear(from.x, to.x, state.t)
            const y = Phaser.Math.Linear(from.y, to.y, state.t)
            layer.clear()
            layer.fillStyle(glow, 0.3)
            layer.fillCircle(x, y, 22)
            layer.fillStyle(tone, 1)
            layer.fillCircle(x, y, 11)
            layer.fillStyle(C.cream, 0.9)
            layer.fillCircle(x - 3, y - 3, 4)
        },
        onComplete: () => {
            layer.clear()
            onDone?.()
        },
    })
}

export function litReveal(
    scene: Phaser.Scene,
    dark: Phaser.GameObjects.Image,
    lit: Phaser.GameObjects.Image,
    onDone?: () => void,
) {
    scene.tweens.add({ targets: lit, alpha: 1, duration: 1100, ease: 'Sine.easeInOut' })
    scene.tweens.add({
        targets: dark,
        alpha: 0.15,
        duration: 1100,
        ease: 'Sine.easeInOut',
        onComplete: () => onDone?.(),
    })
    EventBus.emit('sparks', { x: W / 2, y: 300, color: C.gold, count: 44, spread: 400 })
}