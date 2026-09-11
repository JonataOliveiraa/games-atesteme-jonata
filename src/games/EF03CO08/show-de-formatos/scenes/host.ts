import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { HOST_BOX, HOST_FRAME, HOST_SHEET, SHEET } from '../data/art'
import { DEPTH, HOST } from '../data/layout'
import { C } from '../data/theme'

type Pose = keyof typeof HOST_FRAME

export function createHost(scene: Phaser.Scene) {
    const root = scene.add.container(HOST.cx, HOST.feet).setDepth(DEPTH.host)
    const scale = HOST.h / HOST_BOX.h
    let sprite: Phaser.GameObjects.Image | null = null
    let sway: Phaser.Tweens.Tween | null = null

    if (scene.textures.exists(SHEET.host)) {
        sprite = scene.add
            .image(0, 0, SHEET.host, HOST_FRAME.idle)
            .setOrigin(0.5, (HOST_BOX.y + HOST_BOX.h) / HOST_SHEET.frameHeight)
            .setScale(scale)
        root.add(sprite)
    } else {
        const g = scene.add.graphics()
        const h = HOST.h
        g.fillStyle(C.ink, 1)
        g.fillRoundedRect(-52, -h, 104, h, 26)
        g.fillStyle(C.purple, 1)
        g.fillRoundedRect(-46, -h * 0.68, 92, h * 0.4, 20)
        g.fillStyle(C.coral, 1)
        g.fillRoundedRect(-40, -h * 0.3, 80, h * 0.29, 16)
        g.fillStyle(C.creamDeep, 1)
        g.fillCircle(0, -h * 0.82, 48)
        root.add(g)
    }

    const stopSway = () => {
        sway?.remove()
        sway = null
        root.setAngle(0).setScale(1)
    }

    return {
        pose(next: Pose) {
            stopSway()
            sprite?.setFrame(HOST_FRAME[next])
            if (next !== 'dancing') return
            sway = scene.tweens.add({
                targets: root,
                angle: 4,
                duration: FX.ms(scene, 420),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
            })
        },

        async cheer() {
            stopSway()
            sprite?.setFrame(HOST_FRAME.celebrating)
            await FX.to(scene, root, { scaleX: 1.06, scaleY: 0.94 }, { duration: 120, yoyo: true })
            root.setScale(1)
        },

        bounds() {
            return { x: HOST.cx, y: HOST.feet - HOST.h / 2, w: 240, h: HOST.h }
        },

        destroy() {
            stopSway()
            scene.tweens.killTweensOf(root)
            root.destroy(true)
        },
    }
}

export type Host = ReturnType<typeof createHost>
