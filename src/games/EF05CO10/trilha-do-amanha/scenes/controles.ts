import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, PAD, PHYS } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'

type Which = 'left' | 'right' | 'jump'
export type PadMode = 'off' | 'walk' | 'use' | 'enter' | 'look'

export interface ControlesCallbacks {
    onUse: () => void
    onEnter: () => void
}

const ACTION: Record<'use' | 'enter' | 'look', { label: string; tone: number; dark: number }> = {
    use: { label: 'USAR', tone: 0x35d07f, dark: 0x1f8f56 },
    enter: { label: 'ENTRAR', tone: 0x38bdf8, dark: 0x0d7fb4 },
    look: { label: 'OLHAR', tone: 0xa78bfa, dark: 0x6d4bc4 },
}

export function createControles(scene: Phaser.Scene, callbacks: ControlesCallbacks) {
    const g = scene.add.graphics().setDepth(DEPTH.pad).setScrollFactor(0)
    const held: Record<Which, boolean> = { left: false, right: false, jump: false }
    const touch: Record<Which, boolean> = { left: false, right: false, jump: false }
    let mode: PadMode = 'off'
    let lastJumpAt = -1e9
    let useDown = false
    let frozen = false

    const isAction = (value: PadMode): value is 'use' | 'enter' | 'look' =>
        value === 'use' || value === 'enter' || value === 'look'

    const useLabel = scene.add
        .text(PAD.use.x, PAD.use.y, 'USAR', {
            fontFamily: FONT.black,
            fontSize: '44px',
            color: CSS.white,
        })
        .setOrigin(0.5)
        .setResolution(2)
        .setDepth(DEPTH.pad + 1)
        .setScrollFactor(0)
        .setVisible(false)
    useLabel.setStroke(CSS.ink, 7)

    const round = (x: number, y: number, r: number, down: boolean, tone: number, dark: number) => {
        const alpha = down ? PAD.downAlpha : PAD.idleAlpha
        g.fillStyle(C.ink, alpha * 0.4)
        g.fillCircle(x + 3, y + 8, r)
        g.fillStyle(dark, alpha)
        g.fillCircle(x, y + (down ? 4 : 0), r)
        g.fillStyle(tone, alpha)
        g.fillCircle(x, y + (down ? 4 : 0) - 4, r - 4)
        g.fillStyle(C.white, alpha * 0.4)
        g.fillEllipse(x - r * 0.16, y - r * 0.46, r * 1.05, r * 0.4)
        g.lineStyle(6, C.white, alpha * 0.7)
        g.strokeCircle(x, y + (down ? 4 : 0) - 2, r)
    }

    const paint = () => {
        g.clear()
        useLabel.setVisible(isAction(mode))
        if (mode === 'off') return

        round(PAD.left.x, PAD.left.y, PAD.left.r, held.left, C.warn, C.warnDark)
        round(PAD.right.x, PAD.right.y, PAD.right.r, held.right, C.warn, C.warnDark)

        const arrow = (x: number, y: number, dir: number, down: boolean) => {
            const dy = down ? 4 : 0
            g.fillStyle(C.white, down ? 1 : 0.9)
            g.fillTriangle(x + 22 * dir, y - 30 + dy, x + 22 * dir, y + 30 + dy, x - 24 * dir, y + dy)
        }
        arrow(PAD.left.x, PAD.left.y - 2, 1, held.left)
        arrow(PAD.right.x, PAD.right.y - 2, -1, held.right)

        if (mode === 'walk') {
            round(PAD.jump.x, PAD.jump.y, PAD.jump.r, held.jump, C.blue, C.blueDark)
            const dy = held.jump ? 4 : 0
            g.fillStyle(C.white, held.jump ? 1 : 0.9)
            g.fillTriangle(
                PAD.jump.x,
                PAD.jump.y - 44 + dy,
                PAD.jump.x - 36,
                PAD.jump.y + 2 + dy,
                PAD.jump.x + 36,
                PAD.jump.y + 2 + dy,
            )
            g.fillRoundedRect(PAD.jump.x - 14, PAD.jump.y - 2 + dy, 28, 36, 9)
            return
        }

        if (!isAction(mode)) return
        const skin = ACTION[mode]
        const { x, y, w, h } = PAD.use
        const dy = useDown ? 5 : 0
        g.fillStyle(C.ink, 0.35)
        g.fillRoundedRect(x - w / 2 + 4, y - h / 2 + 12, w, h, 28)
        g.fillStyle(skin.dark, 1)
        g.fillRoundedRect(x - w / 2, y - h / 2 + dy, w, h, 28)
        g.fillStyle(skin.tone, 1)
        g.fillRoundedRect(x - w / 2, y - h / 2 + dy, w, h - 12, 28)
        g.fillStyle(C.white, 0.34)
        g.fillRoundedRect(x - w / 2 + 18, y - h / 2 + 14 + dy, w - 36, 20, 10)
        useLabel.setText(skin.label)
        useLabel.setY(y + dy)
    }

    const zones: Phaser.GameObjects.Zone[] = []

    const zoneFor = (x: number, y: number, w: number, h: number) =>
        scene.add
            .zone(x, y, w, h)
            .setOrigin(0.5)
            .setDepth(DEPTH.pad + 2)
            .setScrollFactor(0)
            .setInteractive({ useHandCursor: true })

    const makeMove = (which: Which, x: number, y: number, r: number) => {
        const zone = zoneFor(x, y, r * 2 + 28, r * 2 + 28)
        zone.on('pointerdown', () => {
            if (mode === 'off' || frozen) return
            if (which === 'jump' && mode !== 'walk') return
            touch[which] = true
            held[which] = true
            if (which === 'jump') lastJumpAt = scene.time.now
            paint()
        })
        const release = () => {
            if (!touch[which]) return
            touch[which] = false
            held[which] = false
            paint()
        }
        zone.on('pointerup', release)
        zone.on('pointerout', release)
        zones.push(zone)
        return zone
    }

    const leftZone = makeMove('left', PAD.left.x, PAD.left.y, PAD.left.r)
    const rightZone = makeMove('right', PAD.right.x, PAD.right.y, PAD.right.r)
    const jumpZone = makeMove('jump', PAD.jump.x, PAD.jump.y, PAD.jump.r)

    const useZone = zoneFor(PAD.use.x, PAD.use.y, PAD.use.w + 20, PAD.use.h + 20)
    useZone.on('pointerdown', () => {
        if (!isAction(mode) || frozen) return
        useDown = true
        paint()
    })
    useZone.on('pointerup', () => {
        if (!isAction(mode) || !useDown) return
        useDown = false
        paint()
        if (mode === 'enter') callbacks.onEnter()
        else callbacks.onUse()
    })
    useZone.on('pointerout', () => {
        if (!useDown) return
        useDown = false
        paint()
    })
    zones.push(useZone)

    const clearAll = () => {
        ;(Object.keys(touch) as Which[]).forEach(which => {
            touch[which] = false
            held[which] = false
        })
        useDown = false
        paint()
    }
    scene.input.on(Phaser.Input.Events.POINTER_UP, clearAll)
    scene.input.on(Phaser.Input.Events.POINTER_UP_OUTSIDE, clearAll)

    const keys = scene.input.keyboard?.addKeys({
        left: Phaser.Input.Keyboard.KeyCodes.LEFT,
        right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
        a: Phaser.Input.Keyboard.KeyCodes.A,
        d: Phaser.Input.Keyboard.KeyCodes.D,
        up: Phaser.Input.Keyboard.KeyCodes.UP,
        w: Phaser.Input.Keyboard.KeyCodes.W,
        space: Phaser.Input.Keyboard.KeyCodes.SPACE,
    }) as Record<string, Phaser.Input.Keyboard.Key> | undefined

    if (keys) {
        ;[keys.up, keys.w, keys.space].forEach(key => {
            key?.on('down', () => {
                if (frozen) return
                if (mode === 'use' || mode === 'look') {
                    callbacks.onUse()
                    return
                }
                if (mode === 'enter') {
                    callbacks.onEnter()
                    return
                }
                if (mode !== 'walk') return
                lastJumpAt = scene.time.now
                held.jump = true
                paint()
            })
            key?.on('up', () => {
                if (touch.jump) return
                held.jump = false
                paint()
            })
        })
    }

    const syncZones = () => {
        const on = mode !== 'off' && !frozen
        if (leftZone.input) leftZone.input.enabled = on
        if (rightZone.input) rightZone.input.enabled = on
        if (jumpZone.input) jumpZone.input.enabled = on && mode === 'walk'
        if (useZone.input) useZone.input.enabled = on && isAction(mode)
    }

    syncZones()
    paint()

    return {
        get left() {
            if (mode === 'off' || frozen) return false
            return held.left || !!keys?.left.isDown || !!keys?.a.isDown
        },

        get right() {
            if (mode === 'off' || frozen) return false
            return held.right || !!keys?.right.isDown || !!keys?.d.isDown
        },

        get jumpHeld() {
            return mode === 'walk' && !frozen && held.jump
        },

        consumeJump() {
            if (mode !== 'walk' || frozen) return false
            if (scene.time.now - lastJumpAt > PHYS.bufferMs) return false
            lastJumpAt = -1e9
            return true
        },

        /** Congela o toque SEM apagar o desenho: o tutorial precisa ver o botão. */
        setFrozen(value: boolean) {
            if (frozen === value) return
            frozen = value
            clearAll()
            syncZones()
            paint()
        },

        setMode(value: PadMode) {
            if (mode === value) return
            mode = value
            clearAll()
            syncZones()
            paint()
            if (isAction(value)) {
                useLabel.setScale(0.6)
                scene.tweens.add({
                    targets: useLabel,
                    scale: 1,
                    duration: FX.ms(scene, 300),
                    ease: 'Back.easeOut',
                })
            }
        },

        walkBounds() {
            return { x: PAD.right.x, y: PAD.right.y, w: PAD.right.r * 2 + 40, h: PAD.right.r * 2 + 40 }
        },

        useBounds() {
            return { x: PAD.use.x, y: PAD.use.y, w: PAD.use.w + 30, h: PAD.use.h + 30 }
        },

        destroy() {
            scene.input.off(Phaser.Input.Events.POINTER_UP, clearAll)
            scene.input.off(Phaser.Input.Events.POINTER_UP_OUTSIDE, clearAll)
            scene.tweens.killTweensOf(useLabel)
            zones.forEach(zone => zone.destroy())
            useLabel.destroy()
            g.destroy()
        },
    }
}

export type Controles = ReturnType<typeof createControles>
