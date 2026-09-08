import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'

export interface PillOptions {
    x: number
    y: number
    w: number
    h: number
    label: string
    color?: number
    dark?: number
    arrow?: boolean
    depth?: number
    onTap: () => void
}

export function createPillButton(scene: Phaser.Scene, o: PillOptions) {
    const color = o.color ?? C.ok
    const dark = o.dark ?? C.okDark
    const depth = o.depth ?? DEPTH.card
    const r = o.h / 2
    const root = scene.add.container(o.x, o.y).setDepth(depth)

    const g = scene.add.graphics()
    g.fillStyle(C.ink, 0.3)
    g.fillRoundedRect(-o.w / 2, -o.h / 2 + 8, o.w, o.h, r)
    g.fillStyle(dark, 1)
    g.fillRoundedRect(-o.w / 2, -o.h / 2, o.w, o.h, r)
    g.fillStyle(color, 1)
    g.fillRoundedRect(-o.w / 2, -o.h / 2, o.w, o.h - 10, r)
    g.fillStyle(C.white, 0.3)
    g.fillRoundedRect(-o.w / 2 + 18, -o.h / 2 + 10, o.w - 36, 13, 7)

    if (o.arrow) {
        g.fillStyle(C.white, 1)
        g.fillTriangle(-o.w / 2 + 34, -19, -o.w / 2 + 34, 19, -o.w / 2 + 64, 0)
    }

    const label = scene.add.text(o.arrow ? 20 : 0, -2, o.label, {
        fontFamily: FONT.black,
        fontSize: '27px',
        color: CSS.white,
    }).setOrigin(0.5).setResolution(2)
    label.setStroke(CSS.ink, 6)

    root.add([g, label])

    const zone = scene.add
        .zone(o.x, o.y, o.w + 20, o.h + 20)
        .setOrigin(0.5)
        .setDepth(depth + 1)

    let enabled = false
    let pulse: Phaser.Tweens.Tween | null = null

    zone.on('pointerdown', () => {
        if (!enabled) return
        FX.press(scene, root)
        o.onTap()
    })

    function setEnabled(on: boolean) {
        enabled = on
        pulse?.remove()
        pulse = null
        scene.tweens.killTweensOf(root)
        root.setScale(1).setAlpha(on ? 1 : 0.42)
        if (!on) {
            zone.disableInteractive()
            return
        }
        zone.setInteractive({ useHandCursor: true })
        pulse = scene.tweens.add({
            targets: root,
            scale: 1.05,
            duration: FX.ms(scene, 660),
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        })
    }

    setEnabled(false)

    return {
        root,

        setEnabled,

        destroy() {
            pulse?.remove()
            scene.tweens.killTweensOf(root)
            root.destroy()
            zone.destroy()
        },
    }
}
