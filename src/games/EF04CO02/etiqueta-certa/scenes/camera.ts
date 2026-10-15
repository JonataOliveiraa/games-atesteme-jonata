import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { CAMERA, H, W } from '../data/layout'
import type { MapDef } from '../data/maps'

export interface Cam {
    /** liga/desliga o arrastar e as teclas A/D ←/→ (só faz algo se map.width > 1280) */
    setEnabled(on: boolean): void
    /** true se o ponteiro atual já andou mais que CAMERA.dragSlop: um toque não vale */
    readonly dragging: boolean
    /** leva o centro da tela até o x do mundo (limitado às bordas) */
    panTo(x: number, ms?: number): Promise<void>
    /** segue o objeto (só no eixo x); null para de seguir */
    follow(target: Phaser.GameObjects.Components.Transform | null): void
    /** o x do mundo no centro da tela */
    centerX(): number
    /** true: a criança começou a olhar o pátio (arrastando ou com A/D); false: o pátio parou de andar */
    onLook(cb: (looking: boolean) => void): void
    destroy(): void
}

const COAST_DECAY = 0.9
const COAST_MIN = 0.02
const VELOCITY_KEEP = 0.6

type Pinned = Phaser.GameObjects.GameObject & { scrollFactorX?: number }

export function createCamera(scene: Phaser.Scene, map: MapDef): Cam {
    const camera = scene.cameras.main
    camera.setBounds(0, 0, map.width, H)
    const wide = map.width > W
    const maxScroll = Math.max(0, map.width - W)
    const clamp = (x: number) => Phaser.Math.Clamp(x, 0, maxScroll)

    let enabled = false
    let dragging = false
    let grab: { id: number; x: number; scroll: number } | null = null
    let velocity = 0
    let lastMove = 0
    let following = false
    let pan: { tween: Phaser.Tweens.Tween; resolve: () => void } | null = null
    let looking = false
    let stillSince = 0
    let lookChanged: (looking: boolean) => void = () => {}

    const look = (on: boolean) => {
        if (on === looking) return
        looking = on
        lookChanged(on)
    }

    const stopPan = () => {
        if (!pan) return
        const { tween, resolve } = pan
        pan = null
        tween.stop()
        resolve()
    }

    const scrollTo = (x: number) => camera.setScroll(clamp(x), 0)

    const onDown = (pointer: Phaser.Input.Pointer, over: Pinned[]) => {
        if (!enabled || !wide || following) return
        if (over.some(o => o.scrollFactorX === 0)) return
        stopPan()
        grab = { id: pointer.id, x: pointer.x, scroll: camera.scrollX }
        dragging = false
        velocity = 0
        lastMove = scene.time.now
    }

    const onMove = (pointer: Phaser.Input.Pointer) => {
        if (!grab || pointer.id !== grab.id || !pointer.isDown) return
        const dx = pointer.x - grab.x
        if (!dragging && Math.abs(dx) <= CAMERA.dragSlop) return
        dragging = true
        const before = camera.scrollX
        scrollTo(grab.scroll - dx)
        const now = scene.time.now
        const dt = Math.max(1, now - lastMove)
        velocity = velocity * (1 - VELOCITY_KEEP) + ((camera.scrollX - before) / dt) * VELOCITY_KEEP
        lastMove = now
    }

    const onUp = (pointer: Phaser.Input.Pointer) => {
        if (grab && pointer.id !== grab.id) return
        if (scene.time.now - lastMove > 80) velocity = 0
        if (!dragging) velocity = 0
        grab = null
        dragging = false
    }

    scene.input.on(Phaser.Input.Events.POINTER_DOWN, onDown)
    scene.input.on(Phaser.Input.Events.POINTER_MOVE, onMove)
    scene.input.on(Phaser.Input.Events.POINTER_UP, onUp)
    scene.input.on(Phaser.Input.Events.POINTER_UP_OUTSIDE, onUp)

    const keyboard = scene.input.keyboard
    const KeyCodes = Phaser.Input.Keyboard.KeyCodes
    const keys = keyboard
        ? {
              left: [keyboard.addKey(KeyCodes.A, false), keyboard.addKey(KeyCodes.LEFT, false)],
              right: [keyboard.addKey(KeyCodes.D, false), keyboard.addKey(KeyCodes.RIGHT, false)],
          }
        : null

    const tick = (time: number, delta: number) => {
        if (!enabled || !wide || following || pan) return
        const dir = keys ? (keys.right.some(k => k.isDown) ? 1 : 0) - (keys.left.some(k => k.isDown) ? 1 : 0) : 0
        if (dir) {
            velocity = 0
            scrollTo(camera.scrollX + (dir * CAMERA.keySpeed * delta) / 1000)
        } else if (!grab && Math.abs(velocity) >= COAST_MIN) {
            scrollTo(camera.scrollX + velocity * delta)
            velocity *= Math.pow(COAST_DECAY, delta / 16.7)
            if (camera.scrollX <= 0 || camera.scrollX >= maxScroll) velocity = 0
        }
        // o dedo arrastando (mesmo parado, ainda no chão), a tecla ou o embalo depois de soltar
        if (dir || dragging || Math.abs(velocity) >= COAST_MIN) {
            stillSince = time
            look(true)
        } else if (looking && time - stillSince > CAMERA.lookHold) look(false)
    }
    scene.events.on(Phaser.Scenes.Events.UPDATE, tick)

    return {
        setEnabled(on) {
            enabled = on
            if (!on) {
                grab = null
                dragging = false
                velocity = 0
                look(false)
            }
        },
        get dragging() {
            return dragging
        },
        panTo(x, ms = CAMERA.panMs) {
            stopPan()
            velocity = 0
            if (following) {
                camera.stopFollow()
                following = false
            }
            const target = clamp(x - W / 2)
            if (!wide || ms <= 0 || Math.abs(target - camera.scrollX) < 1) {
                scrollTo(target)
                return Promise.resolve()
            }
            return new Promise<void>(resolve => {
                const tween = scene.tweens.add({
                    targets: camera,
                    scrollX: target,
                    duration: FX.ms(scene, ms),
                    ease: 'Sine.easeInOut',
                    onComplete: () => {
                        if (pan?.tween === tween) pan = null
                        resolve()
                    },
                })
                pan = { tween, resolve }
            })
        },
        follow(target) {
            stopPan()
            velocity = 0
            grab = null
            dragging = false
            if (!target) {
                camera.stopFollow()
                following = false
                return
            }
            following = true
            camera.startFollow(target, false, CAMERA.followLerp, 0)
        },
        centerX() {
            return camera.scrollX + W / 2
        },
        onLook(cb) {
            lookChanged = cb
        },
        destroy() {
            stopPan()
            camera.stopFollow()
            scene.events.off(Phaser.Scenes.Events.UPDATE, tick)
            scene.input.off(Phaser.Input.Events.POINTER_DOWN, onDown)
            scene.input.off(Phaser.Input.Events.POINTER_MOVE, onMove)
            scene.input.off(Phaser.Input.Events.POINTER_UP, onUp)
            scene.input.off(Phaser.Input.Events.POINTER_UP_OUTSIDE, onUp)
            keys?.left.concat(keys.right).forEach(k => keyboard?.removeKey(k))
        },
    }
}
