import Phaser from 'phaser'
import { DEPTH } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import { TECH } from '../data/tech'
import type { TechId } from '../types'

const PANEL = { x: 640, y: 145, w: 880, h: 150 }

export function showTrava(scene: Phaser.Scene, tech: TechId) {
    const root = scene.add.container(PANEL.x, PANEL.y + 40).setDepth(DEPTH.trava).setAlpha(0)

    const half = PANEL.w / 2
    const top = -PANEL.h / 2

    const g = scene.add.graphics()
    g.fillStyle(C.ink, 0.25)
    g.fillRoundedRect(-half + 6, top + 10, PANEL.w, PANEL.h, 26)
    g.fillStyle(C.warnDark, 1)
    g.fillRoundedRect(-half, top, PANEL.w, PANEL.h, 26)
    g.fillStyle(C.cream, 1)
    g.fillRoundedRect(-half + 8, top + 8, PANEL.w - 16, PANEL.h - 16, 20)
    g.fillStyle(C.white, 0.8)
    g.fillRoundedRect(-half + 20, top + 16, PANEL.w - 40, 20, 10)

    const iconX = -half + 92
    g.fillStyle(C.creamDeep, 1)
    g.fillCircle(iconX, 0, 58)

    root.add(g)

    if (scene.textures.exists('tecnologias')) {
        root.add(
            scene.add
                .image(iconX, 0, 'tecnologias', TECH[tech].frame)
                .setDisplaySize(96, 96),
        )
    }

    root.add(
        scene.add
            .text(iconX + 84, 0, TECH[tech].use, {
                fontFamily: FONT.black,
                fontSize: '33px',
                color: CSS.warn,
                align: 'left',
                wordWrap: { width: PANEL.w - 240 },
                lineSpacing: 2,
            })
            .setOrigin(0, 0.5)
            .setResolution(2),
    )

    scene.tweens.add({
        targets: root,
        alpha: 1,
        y: PANEL.y,
        duration: 380,
        ease: 'Back.easeOut',
    })

    return {
        destroy() {
            scene.tweens.killTweensOf(root)
            scene.tweens.add({
                targets: root,
                alpha: 0,
                y: PANEL.y - 30,
                duration: 220,
                ease: 'Cubic.easeIn',
                onComplete: () => root.destroy(true),
            })
        },
    }
}

export type Trava = ReturnType<typeof showTrava>
