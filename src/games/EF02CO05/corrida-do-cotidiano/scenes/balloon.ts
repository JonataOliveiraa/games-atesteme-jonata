import Phaser from 'phaser'
import { BALLOON, DEPTH } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'

export function createBalloon(scene: Phaser.Scene) {
    const root = scene.add.container(BALLOON.cx, BALLOON.cy).setDepth(DEPTH.balloon).setAlpha(0)

    const half = BALLOON.w / 2
    const top = -BALLOON.h / 2

    const g = scene.add.graphics()
    g.fillStyle(C.ink, 0.22)
    g.fillRoundedRect(-half + 6, top + 10, BALLOON.w, BALLOON.h, 30)
    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(-half, top, BALLOON.w, BALLOON.h, 30)
    g.fillStyle(C.cream, 1)
    g.fillRoundedRect(-half + 7, top + 7, BALLOON.w - 14, BALLOON.h - 14, 24)
    g.fillStyle(C.white, 0.75)
    g.fillRoundedRect(-half + 18, top + 16, BALLOON.w - 36, 22, 11)
    g.fillStyle(C.ink, 1)
    g.fillTriangle(-30, top + BALLOON.h - 4, 30, top + BALLOON.h - 4, -2, top + BALLOON.h + 30)
    g.fillStyle(C.cream, 1)
    g.fillTriangle(-20, top + BALLOON.h - 10, 20, top + BALLOON.h - 10, -4, top + BALLOON.h + 18)

    const text = scene.add
        .text(0, 0, '', {
            fontFamily: FONT.black,
            fontSize: '40px',
            color: CSS.ink,
            align: 'center',
            wordWrap: { width: BALLOON.textW },
        })
        .setOrigin(0.5)
        .setResolution(2)

    root.add([g, text])

    return {
        show(prompt: string) {
            text.setText(prompt)
            scene.tweens.killTweensOf(root)
            root.setAlpha(0).setY(BALLOON.cy - 60).setScale(0.9)
            scene.tweens.add({
                targets: root,
                alpha: 1,
                y: BALLOON.cy,
                scale: 1,
                duration: 420,
                ease: 'Back.easeOut',
            })
        },

        hide() {
            scene.tweens.killTweensOf(root)
            scene.tweens.add({
                targets: root,
                alpha: 0,
                y: BALLOON.cy - 34,
                duration: 260,
                ease: 'Cubic.easeIn',
            })
        },

        bounds() {
            return { x: BALLOON.cx, y: BALLOON.cy, w: BALLOON.w + 20, h: BALLOON.h + 40 }
        },

        destroy() {
            scene.tweens.killTweensOf(root)
            root.destroy(true)
        },
    }
}

export type Balloon = ReturnType<typeof createBalloon>
