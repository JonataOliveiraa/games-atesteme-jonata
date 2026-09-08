import Phaser from 'phaser'
import { DEPTH } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'

const PANEL = { x: 640, y: 268, w: 880, h: 108 }

const panel = (
    scene: Phaser.Scene,
    text: string,
    border: number,
    face: number,
    color: string,
) => {
    const root = scene.add.container(PANEL.x, PANEL.y + 26).setDepth(DEPTH.trava).setAlpha(0)
    const g = scene.add.graphics()
    const hw = PANEL.w / 2
    const hh = PANEL.h / 2
    g.fillStyle(C.ink, 0.25)
    g.fillRoundedRect(-hw + 5, -hh + 9, PANEL.w, PANEL.h, 24)
    g.fillStyle(border, 1)
    g.fillRoundedRect(-hw, -hh, PANEL.w, PANEL.h, 24)
    g.fillStyle(face, 1)
    g.fillRoundedRect(-hw + 8, -hh + 8, PANEL.w - 16, PANEL.h - 16, 18)
    g.fillStyle(C.white, 0.75)
    g.fillRoundedRect(-hw + 18, -hh + 16, PANEL.w - 36, 16, 8)

    const label = scene.add
        .text(0, 0, text, {
            fontFamily: FONT.black,
            fontSize: '29px',
            color,
            align: 'center',
            wordWrap: { width: PANEL.w - 70 },
            lineSpacing: 2,
        })
        .setOrigin(0.5)
        .setResolution(2)

    root.add([g, label])
    scene.tweens.add({
        targets: root,
        alpha: 1,
        y: PANEL.y,
        duration: 320,
        ease: 'Back.easeOut',
    })

    return {
        destroy() {
            scene.tweens.killTweensOf(root)
            scene.tweens.add({
                targets: root,
                alpha: 0,
                y: PANEL.y - 24,
                duration: 200,
                onComplete: () => root.destroy(true),
            })
        },
    }
}

export const showTrava = (scene: Phaser.Scene, line: string) =>
    panel(scene, line, C.warnDark, C.warn, CSS.white)

export function createLock(scene: Phaser.Scene) {
    const g = scene.add.graphics().setDepth(DEPTH.robot + 1).setAlpha(0)
    g.lineStyle(11, C.ink, 1)
    g.beginPath()
    g.arc(0, -18, 18, Math.PI, 0)
    g.strokePath()
    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(-29, -20, 58, 48, 11)
    g.fillStyle(C.gold, 1)
    g.fillCircle(0, 4, 8)

    return {
        show(x: number, y: number) {
            g.setPosition(x, y).setAlpha(1).setScale(0.6)
            scene.tweens.killTweensOf(g)
            scene.tweens.add({ targets: g, scale: 1, duration: 260, ease: 'Back.easeOut' })
        },
        hide() {
            scene.tweens.killTweensOf(g)
            scene.tweens.add({ targets: g, alpha: 0, duration: 180 })
        },
        destroy() {
            scene.tweens.killTweensOf(g)
            g.destroy()
        },
    }
}

export type Lock = ReturnType<typeof createLock>
