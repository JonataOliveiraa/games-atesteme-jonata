import Phaser from 'phaser'
import { DEPTH, H, PEDAL, TOUCH_TOP, W } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'

export function createPedal(
    scene: Phaser.Scene,
    options: { onDown: () => void; onUp: () => void },
) {
    const cx = PEDAL.x + PEDAL.w / 2
    const cy = PEDAL.y + PEDAL.h / 2

    const ring = scene.add.graphics().setDepth(DEPTH.ui - 1).setAlpha(0)
    ring.lineStyle(10, C.ok, 1)
    ring.strokeRoundedRect(-PEDAL.w / 2 - 10, -PEDAL.h / 2 - 10, PEDAL.w + 20, PEDAL.h + 20, 34)
    ring.setPosition(cx, cy)

    const g = scene.add.graphics().setDepth(DEPTH.ui)

    const label = scene.add
        .text(cx, cy, 'SEGURE', {
            fontFamily: FONT.black,
            fontSize: '28px',
            color: CSS.white,
        })
        .setOrigin(0.5)
        .setDepth(DEPTH.ui + 1)
        .setResolution(2)
    label.setStroke(CSS.ink, 7)

    let held = false
    let enabled = true
    let urgent = false

    const paint = () => {
        const drop = held ? 4 : 12
        const face = !enabled ? C.steel : urgent ? C.warn : C.ok
        const edge = !enabled ? C.steelDark : urgent ? C.warnDark : C.okDark

        g.clear()

        g.fillStyle(C.ink, 0.28)
        g.fillRoundedRect(PEDAL.x + 4, PEDAL.y + 12, PEDAL.w, PEDAL.h, 28)

        g.fillStyle(edge, 1)
        g.fillRoundedRect(PEDAL.x, PEDAL.y + 8, PEDAL.w, PEDAL.h, 28)

        g.fillStyle(face, 1)
        g.fillRoundedRect(PEDAL.x, PEDAL.y + 8 - drop, PEDAL.w, PEDAL.h - 6, 26)

        g.fillStyle(C.white, enabled ? 0.34 : 0.2)
        g.fillRoundedRect(PEDAL.x + 22, PEDAL.y + 14 - drop, PEDAL.w - 44, 15, 8)

        const dotY = PEDAL.y + PEDAL.h / 2 + 4 - drop
        g.fillStyle(C.white, enabled ? 0.9 : 0.45)
        for (const side of [-1, 1]) {
            for (let i = 0; i < 3; i++) {
                const x = cx + side * (150 + i * 34)
                if (urgent) g.fillCircle(x, dotY - 10 + i * 6, 6 - i)
                else g.fillCircle(x, dotY, 6 - i)
            }
        }

        label.setText(urgent ? 'SOLTE' : 'SEGURE')
        label.setY(cy + 4 - drop)
    }

    paint()

    const zone = scene.add
        .zone(W / 2, (TOUCH_TOP + H) / 2, W, H - TOUCH_TOP)
        .setOrigin(0.5)
        .setDepth(DEPTH.world + 1)
        .setInteractive({ useHandCursor: true })

    const press = () => {
        if (!enabled || held) return
        held = true
        paint()
        options.onDown()
    }

    const release = () => {
        if (!held) return
        held = false
        paint()
        options.onUp()
    }

    zone.on('pointerdown', press)
    zone.on('pointerup', release)
    zone.on('pointerout', release)
    scene.input.on('pointerupoutside', release)

    const keys = scene.input.keyboard
    keys?.on('keydown-SPACE', press)
    keys?.on('keyup-SPACE', release)

    let beat: Phaser.Tweens.Tween | null = null
    let alarm: Phaser.Tweens.Tween | null = null

    return {
        get held() {
            return held
        },

        setEnabled(value: boolean) {
            if (value === enabled) return
            enabled = value
            if (!value) release()
            if (value) zone.setInteractive({ useHandCursor: true })
            else zone.disableInteractive()
            label.setAlpha(value ? 1 : 0.55)
            paint()
        },

        /**
         * O dedo está na tela e a condição não vale mais. O pedal para de
         * convidar e passa a pedir o contrário — é o aviso que faltava entre a
         * mudança e a trava.
         */
        setUrgent(value: boolean) {
            if (value === urgent) return
            urgent = value
            paint()

            alarm?.stop()
            alarm = null
            if (!value) {
                ring.setAlpha(0).setScale(1)
                return
            }

            ring.clear()
            ring.lineStyle(10, C.warn, 1)
            ring.strokeRoundedRect(
                -PEDAL.w / 2 - 10,
                -PEDAL.h / 2 - 10,
                PEDAL.w + 20,
                PEDAL.h + 20,
                34,
            )
            ring.setAlpha(0.95).setScale(1)
            alarm = scene.tweens.add({
                targets: ring,
                alpha: 0.2,
                scaleX: 1.03,
                scaleY: 1.22,
                duration: 320,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
            })
        },

        /** Um pulso por volta do laço: a repetição vira coisa que se vê. */
        beat() {
            if (urgent) return
            ring.clear()
            ring.lineStyle(10, C.ok, 1)
            ring.strokeRoundedRect(
                -PEDAL.w / 2 - 10,
                -PEDAL.h / 2 - 10,
                PEDAL.w + 20,
                PEDAL.h + 20,
                34,
            )
            ring.setAlpha(0.9).setScale(1)
            beat?.stop()
            beat = scene.tweens.add({
                targets: ring,
                alpha: 0,
                scaleX: 1.05,
                scaleY: 1.35,
                duration: 340,
                ease: 'Cubic.easeOut',
            })
        },

        shine(value: number) {
            if (value <= 0 || urgent) return
            ring.setAlpha(value)
        },

        forceRelease: release,

        bounds() {
            return { x: cx, y: cy, w: PEDAL.w + 24, h: PEDAL.h + 28 }
        },

        destroy() {
            beat?.stop()
            alarm?.stop()
            scene.input.off('pointerupoutside', release)
            keys?.off('keydown-SPACE', press)
            keys?.off('keyup-SPACE', release)
            scene.tweens.killTweensOf(ring)
            zone.destroy()
            label.destroy()
            ring.destroy()
            g.destroy()
        },
    }
}

export type Pedal = ReturnType<typeof createPedal>
