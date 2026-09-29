import Phaser from 'phaser'
import { FONT_JOGO } from '../fonts/gameFont'

export interface GuideRect {
    x: number
    y: number
    w: number
    h: number
}

export type GuideGesture =
    | { kind: 'tap' }
    | { kind: 'none' }
    | { kind: 'drag'; toX: number; toY: number; duration?: number }
    | { kind: 'hold'; ms: number }

export type GuidePulseTarget = Phaser.GameObjects.GameObject & {
    scaleX: number
    scaleY: number
    setScale(x: number, y?: number): unknown
}

export interface GuideStep {
    target: GuideRect
    gesture?: GuideGesture
    pulse?: GuidePulseTarget
    say?: string
}

export interface GuideDemoStep extends GuideStep {
    action: () => void | Promise<void>
}

export interface GuideWaitStep extends GuideStep {
    until: Promise<unknown> | (() => boolean)
}

export interface VisualGuideOptions {
    depth?: number
    veilColor?: number
    veilAlpha?: number
    rimColor?: number
    handFill?: number
    handLine?: number
    handScale?: number
    clickColor?: number
    handTexture?: { key: string; frame?: string | number; tipX: number; tipY: number; height?: number }
    captionFill?: number
    captionColor?: string
    fontSize?: number
    padding?: number
}

export type GuideFollowTarget = Phaser.GameObjects.GameObject & Phaser.GameObjects.Components.Transform

export interface GuideFollowOptions {
    w?: number
    h?: number
}

export interface VisualGuide {
    demo(step: GuideDemoStep): Promise<boolean>
    follow(target: GuideFollowTarget, options?: GuideFollowOptions): () => void
    waitFor(step: GuideWaitStep): Promise<boolean>
    say(text?: string): void
    hide(): Promise<void>
    readonly active: boolean
    destroy(): void
}

const RADIUS = 18
const REST_DX = 18
const REST_DY = 26
const PRESS = 0.88
const LOOP_GAP = 520

export function createVisualGuide(scene: Phaser.Scene, options: VisualGuideOptions = {}): VisualGuide {
    const W = scene.scale.width || 1280
    const H = scene.scale.height || 720
    const depth = options.depth ?? 8500
    const veilColor = options.veilColor ?? 0x1a1030
    const veilAlpha = options.veilAlpha ?? 0.6
    const rimColor = options.rimColor ?? 0xffd166
    const handFill = options.handFill ?? 0xffffff
    const handLine = options.handLine ?? 0x3a2a4a
    const handScale = options.handScale ?? 1.3
    const clickColor = options.clickColor ?? rimColor
    const captionFill = options.captionFill ?? 0xffffff
    const captionColor = options.captionColor ?? '#3a2a4a'
    const fontSize = Math.max(17, options.fontSize ?? 34)
    const pad = options.padding ?? 18

    const dark = scene.add.graphics().setDepth(depth).setScrollFactor(0).setAlpha(0)
    const rim = scene.add.graphics().setDepth(depth + 1).setScrollFactor(0).setAlpha(0)

    const hand = scene.add.container(0, 0).setDepth(depth + 3).setScrollFactor(0).setAlpha(0)
    const handArt = options.handTexture
    if (handArt && scene.textures.exists(handArt.key)) {
        const image = scene.add.image(0, 0, handArt.key, handArt.frame)
        image.setOrigin(handArt.tipX / image.frame.width, handArt.tipY / image.frame.height)
        image.setScale((handArt.height ?? 90) / image.frame.height)
        hand.add(image)
    } else {
        const drawn = scene.add.graphics()
        drawn.fillStyle(0x000000, 0.18)
        drawn.fillEllipse(4, 88, 54, 16)
        drawn.fillStyle(handFill, 1)
        drawn.fillRoundedRect(-24, 36, 44, 54, 18)
        drawn.fillRoundedRect(-10, 0, 20, 44, 10)
        drawn.lineStyle(5, handLine, 1)
        drawn.strokeRoundedRect(-24, 36, 44, 54, 18)
        drawn.strokeRoundedRect(-10, 0, 20, 44, 10)
        hand.add(drawn)
    }

    const captionBg = scene.add.graphics()
    const captionText = scene.add
        .text(0, 0, '', {
            fontFamily: FONT_JOGO.black,
            fontSize: `${fontSize}px`,
            color: captionColor,
            align: 'center',
        })
        .setOrigin(0.5)
        .setResolution(2)
    const caption = scene.add
        .container(0, 0, [captionBg, captionText])
        .setDepth(depth + 4)
        .setScrollFactor(0)
        .setAlpha(0)

    const blocker = scene.add
        .zone(W / 2, H / 2, W, H)
        .setOrigin(0.5)
        .setDepth(depth + 5)
        .setScrollFactor(0)
        .setInteractive()
    const setBlocking = (on: boolean) => {
        if (blocker.input) blocker.input.enabled = on
    }
    setBlocking(false)

    const hole = { x: W / 2, y: H / 2, w: 0, h: 0 }
    const glow = { a: 1 }
    const rings = new Set<Phaser.GameObjects.Graphics>()

    const paint = () => {
        if (dead) return
        const { x, y, w, h } = hole
        const l = x - w / 2
        const r = x + w / 2
        const t = y - h / 2
        const b = y + h / 2

        dark.clear()
        dark.fillStyle(veilColor, 1)
        dark.fillRect(0, 0, W, Math.max(0, t))
        dark.fillRect(0, Math.min(H, b), W, Math.max(0, H - b))
        dark.fillRect(0, t, Math.max(0, l), Math.max(0, h))
        dark.fillRect(r, t, Math.max(0, W - r), Math.max(0, h))

        rim.clear()
        if (w < 4 || h < 4) return
        rim.lineStyle(10, rimColor, 0.25 * glow.a)
        rim.strokeRoundedRect(l - 3, t - 3, w + 6, h + 6, RADIUS + 3)
        rim.lineStyle(4, rimColor, 0.55 + 0.45 * glow.a)
        rim.strokeRoundedRect(l, t, w, h, RADIUS)
    }

    let dead = false
    let gen = 0
    let busy = 0
    let open = false
    const cancels = new Set<() => void>()
    const cleanups = new Set<() => void>()

    const glowTween = scene.tweens.add({
        targets: glow,
        a: 0.2,
        duration: 620,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        onUpdate: () => {
            if (open) paint()
        },
    })

    const live = (g: number) => !dead && g === gen

    const settle = <T>(p: Promise<T>): Promise<T | undefined> =>
        new Promise(resolve => {
            const stop = () => resolve(undefined)
            cancels.add(stop)
            p.then(
                v => {
                    cancels.delete(stop)
                    resolve(v)
                },
                () => {
                    cancels.delete(stop)
                    resolve(undefined)
                },
            )
        })

    const tween = (
        targets: object | object[],
        props: Record<string, unknown>,
        duration: number,
        extra: Record<string, unknown> = {},
    ): Promise<void> =>
        new Promise(resolve => {
            if (dead) {
                resolve()
                return
            }
            scene.tweens.add({
                targets,
                ...props,
                duration,
                ease: 'Sine.easeInOut',
                ...extra,
                onComplete: () => resolve(),
            })
        })

    const sleep = (ms: number): Promise<void> =>
        new Promise(resolve => {
            if (dead) {
                resolve()
                return
            }
            scene.time.delayedCall(ms, () => resolve())
        })

    const ring = (x: number, y: number) => {
        const g = scene.add.graphics({ x, y }).setDepth(depth + 2).setScrollFactor(0).setScale(0.2)
        g.fillStyle(rimColor, 0.35)
        g.fillCircle(0, 0, 56)
        g.lineStyle(5, rimColor, 0.9)
        g.strokeCircle(0, 0, 56)
        rings.add(g)
        scene.tweens.add({
            targets: g,
            scale: 1,
            alpha: 0,
            duration: 480,
            ease: 'Sine.easeOut',
            onComplete: () => {
                rings.delete(g)
                g.destroy()
            },
        })
    }

    const clickLines = (x: number, y: number) => {
        const g = scene.add.graphics({ x, y }).setDepth(depth + 4).setScrollFactor(0).setScale(0.6)
        for (const deg of [-105, -62, -20, 22, 64]) {
            const a = Phaser.Math.DegToRad(deg - 90)
            const cos = Math.cos(a)
            const sin = Math.sin(a)
            g.lineStyle(9, 0x000000, 0.25)
            g.lineBetween(cos * 26, sin * 26, cos * 44, sin * 44)
            g.lineStyle(6, clickColor, 1)
            g.lineBetween(cos * 26, sin * 26, cos * 44, sin * 44)
        }
        rings.add(g)
        scene.tweens.add({
            targets: g,
            scale: 1.15,
            duration: 200,
            ease: 'Back.easeOut',
            onComplete: () =>
                scene.tweens.add({
                    targets: g,
                    alpha: 0,
                    duration: 220,
                    delay: 120,
                    onComplete: () => {
                        rings.delete(g)
                        g.destroy()
                    },
                }),
        })
    }

    const holdRing = (x: number, y: number, ms: number) => {
        const g = scene.add.graphics({ x, y }).setDepth(depth + 2).setScrollFactor(0)
        const state = { r: 18 }
        const draw = () => {
            if (!g.active) return
            g.clear()
            g.lineStyle(9, 0x000000, 0.2)
            g.strokeCircle(0, 0, state.r)
            g.lineStyle(6, clickColor, 1)
            g.strokeCircle(0, 0, state.r)
        }
        draw()
        rings.add(g)
        scene.tweens.add({ targets: state, r: 58, duration: ms, ease: 'Sine.easeOut', onUpdate: draw })
        return () => {
            scene.tweens.killTweensOf(state)
            scene.tweens.add({
                targets: g,
                alpha: 0,
                duration: 180,
                onComplete: () => {
                    rings.delete(g)
                    g.destroy()
                },
            })
        }
    }

    let pulseTween: Phaser.Tweens.Tween | undefined
    let pulseTarget: GuidePulseTarget | undefined
    let pulseBase = { x: 1, y: 1 }

    const stopPulse = () => {
        pulseTween?.remove()
        pulseTween = undefined
        if (pulseTarget?.active) pulseTarget.setScale(pulseBase.x, pulseBase.y)
        pulseTarget = undefined
    }

    const startPulse = (target?: GuidePulseTarget) => {
        stopPulse()
        if (!target?.active) return
        pulseTarget = target
        pulseBase = { x: target.scaleX, y: target.scaleY }
        pulseTween = scene.tweens.add({
            targets: target,
            scaleX: pulseBase.x * 1.08,
            scaleY: pulseBase.y * 1.08,
            duration: 520,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        })
    }

    let unfollow: (() => void) | undefined

    const follow = (target: GuideFollowTarget, opts: GuideFollowOptions = {}) => {
        unfollow?.()
        if (dead) return () => undefined
        const cam = scene.cameras.main
        const matrix = new Phaser.GameObjects.Components.TransformMatrix()
        const track = () => {
            if (!target.active) return stop()
            target.getWorldTransformMatrix(matrix)
            const scale = Math.hypot(matrix.a, matrix.b)
            hole.x = matrix.tx - cam.scrollX
            hole.y = matrix.ty - cam.scrollY
            hole.w = (opts.w ?? 140) * scale + pad * 2
            hole.h = (opts.h ?? 140) * scale + pad * 2
            paint()
        }
        const stop = () => {
            scene.events.off(Phaser.Scenes.Events.POST_UPDATE, track)
            cleanups.delete(stop)
            if (unfollow === stop) unfollow = undefined
        }
        scene.tweens.killTweensOf(hole)
        if (!open) {
            open = true
            scene.tweens.killTweensOf([dark, rim])
            void tween(dark, { alpha: veilAlpha }, 320)
            void tween(rim, { alpha: 1 }, 320)
        }
        scene.events.on(Phaser.Scenes.Events.POST_UPDATE, track)
        cleanups.add(stop)
        unfollow = stop
        track()
        return stop
    }

    const measure = (r: GuideRect) => ({ x: r.x, y: r.y, w: r.w + pad * 2, h: r.h + pad * 2 })

    const focus = async (r: GuideRect): Promise<void> => {
        unfollow?.()
        const to = measure(r)
        scene.tweens.killTweensOf(hole)
        if (!open) {
            open = true
            Object.assign(hole, to)
            paint()
            scene.tweens.killTweensOf([dark, rim])
            await Promise.all([tween(dark, { alpha: veilAlpha }, 320), tween(rim, { alpha: 1 }, 320)])
            return
        }
        await tween(hole, to, 460, { onUpdate: paint })
        paint()
    }

    const placeCaption = (text?: string) => {
        scene.tweens.killTweensOf(caption)
        if (!text) {
            void tween(caption, { alpha: 0 }, 160)
            return
        }
        captionText.setText(text)
        const w = captionText.width + 48
        const h = captionText.height + 26
        captionBg.clear()
        captionBg.fillStyle(0x000000, 0.18)
        captionBg.fillRoundedRect(-w / 2 + 3, -h / 2 + 5, w, h, h / 2)
        captionBg.fillStyle(captionFill, 1)
        captionBg.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
        captionBg.lineStyle(4, rimColor, 1)
        captionBg.strokeRoundedRect(-w / 2, -h / 2, w, h, h / 2)

        const top = hole.y - hole.h / 2
        const bottom = hole.y + hole.h / 2
        const above = top - 24 - h / 2
        const below = bottom + 24 + h / 2
        const y = above - h / 2 >= 90 ? above : Math.min(H - h / 2 - 12, below)
        const x = Phaser.Math.Clamp(hole.x, w / 2 + 12, W - w / 2 - 12)
        caption.setPosition(x, y).setScale(0.85).setAlpha(0)
        void tween(caption, { alpha: 1, scale: 1 }, 260, { ease: 'Back.easeOut' })
    }

    const handTo = (x: number, y: number, scale: number, duration: number) =>
        tween(hand, { x, y, scale: handScale * scale }, duration)

    const perform = async (
        g: number,
        target: GuideRect,
        gesture: GuideGesture,
        onRelease: (() => Promise<unknown>) | undefined,
        stillOn: () => boolean,
    ): Promise<boolean> => {
        const ok = () => live(g) && stillOn()
        const { x, y } = target
        if (gesture.kind === 'none') {
            if (onRelease) await settle(onRelease())
            return ok()
        }
        scene.tweens.killTweensOf(hand)
        hand.setPosition(x + REST_DX, y + REST_DY).setScale(handScale)
        await settle(tween(hand, { alpha: 1 }, 180))
        if (!ok()) return false
        await settle(handTo(x, y, PRESS, 220))
        if (!ok()) return false
        ring(x, y)

        if (gesture.kind === 'hold') {
            const grow = holdRing(x, y, gesture.ms)
            await settle(Promise.all([sleep(gesture.ms), onRelease ? onRelease() : Promise.resolve()]))
            grow()
            if (!live(g)) return false
            await settle(handTo(x + REST_DX, y + REST_DY, 1, 220))
            return ok()
        }

        clickLines(x, y)

        if (gesture.kind === 'drag') {
            await settle(tween(hand, { x: gesture.toX, y: gesture.toY }, gesture.duration ?? 800))
            if (!ok()) return false
        }

        if (onRelease) {
            await settle(onRelease())
            if (!live(g)) return false
        }

        const endX = gesture.kind === 'drag' ? gesture.toX : x
        const endY = gesture.kind === 'drag' ? gesture.toY : y
        await settle(handTo(endX + REST_DX, endY + REST_DY, 1, 220))
        if (!ok()) return false
        if (gesture.kind === 'drag') {
            await settle(tween(hand, { alpha: 0 }, 160))
            if (!ok()) return false
        }
        return true
    }

    const fadeHand = () => {
        scene.tweens.killTweensOf(hand)
        void tween(hand, { alpha: 0 }, 160)
    }

    const run = async <T>(job: (g: number) => Promise<T>, fallback: T): Promise<T> => {
        if (dead) return fallback
        const g = gen
        busy += 1
        try {
            return await job(g)
        } finally {
            busy -= 1
        }
    }

    const demo = (step: GuideDemoStep): Promise<boolean> =>
        run(async g => {
            setBlocking(true)
            try {
                await settle(focus(step.target))
                if (!live(g)) return false
                if (step.say !== undefined) placeCaption(step.say)
                startPulse(step.pulse)
                const done = await perform(
                    g,
                    step.target,
                    step.gesture ?? { kind: 'tap' },
                    () => Promise.resolve().then(step.action),
                    () => true,
                )
                if (!live(g)) return false
                stopPulse()
                fadeHand()
                await settle(sleep(240))
                return done && live(g)
            } finally {
                if (!dead) setBlocking(false)
            }
        }, false)

    const waitFor = (step: GuideWaitStep): Promise<boolean> =>
        run(async g => {
            let met = false
            let signal: () => void = () => undefined
            const metPromise = new Promise<void>(resolve => {
                signal = resolve
            })
            const meet = () => {
                if (met) return
                met = true
                signal()
            }

            const until = step.until
            if (typeof until === 'function') {
                const check = () => {
                    if (until()) meet()
                }
                scene.events.on(Phaser.Scenes.Events.UPDATE, check)
                const off = () => scene.events.off(Phaser.Scenes.Events.UPDATE, check)
                cleanups.add(off)
                metPromise.then(() => {
                    off()
                    cleanups.delete(off)
                })
                check()
            } else {
                until.then(meet, meet)
            }

            const alive = () => live(g) && !met
            const bounded = <T>(p: Promise<T>) => settle(Promise.race([p, metPromise]))

            await bounded(focus(step.target))
            if (!live(g)) return false
            if (!met) {
                if (step.say !== undefined) placeCaption(step.say)
                startPulse(step.pulse)
                const gesture = step.gesture ?? { kind: 'tap' }
                while (alive()) {
                    await bounded(perform(g, step.target, gesture, undefined, () => !met))
                    if (!alive()) break
                    await bounded(sleep(LOOP_GAP))
                }
            }
            if (!live(g)) return false
            stopPulse()
            fadeHand()
            return true
        }, false)

    const hide = async (): Promise<void> => {
        if (dead) return
        gen += 1
        cancels.forEach(stop => stop())
        cancels.clear()
        unfollow?.()
        stopPulse()
        setBlocking(false)
        open = false
        const g = gen
        scene.tweens.killTweensOf([hand, hole, dark, rim, caption])
        await Promise.all([
            tween(dark, { alpha: 0 }, 240),
            tween(rim, { alpha: 0 }, 240),
            tween(hand, { alpha: 0 }, 160),
            tween(caption, { alpha: 0 }, 160),
        ])
        if (!live(g)) return
        hole.w = 0
        hole.h = 0
        paint()
    }

    const destroy = () => {
        if (dead) return
        dead = true
        gen += 1
        scene.events.off(Phaser.Scenes.Events.SHUTDOWN, destroy)
        scene.events.off(Phaser.Scenes.Events.DESTROY, destroy)
        cancels.forEach(stop => stop())
        cancels.clear()
        cleanups.forEach(off => off())
        cleanups.clear()
        stopPulse()
        glowTween.remove()
        scene.tweens.killTweensOf([hand, hole, dark, rim, caption, glow])
        rings.forEach(g => g.destroy())
        rings.clear()
        blocker.destroy()
        caption.destroy()
        hand.destroy()
        rim.destroy()
        dark.destroy()
    }

    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, destroy)
    scene.events.once(Phaser.Scenes.Events.DESTROY, destroy)

    return {
        demo,
        follow,
        waitFor,
        say(text) {
            if (dead) return
            placeCaption(text)
        },
        hide,
        get active() {
            return !dead && (busy > 0 || open)
        },
        destroy,
    }
}
