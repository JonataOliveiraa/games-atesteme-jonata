import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BG_ROOM } from '../data/files'
import { DEPTH, H, TABLET, W } from '../data/layout'
import type { Hall } from './hall'

/** A Nina no sofá; a câmera entra na tela do tablet e o corredor aparece lá dentro. */
export async function playOpening(scene: Phaser.Scene, hall: Hall) {
    const room = scene.add.image(W / 2, H / 2, BG_ROOM).setDepth(DEPTH.opening).setDisplaySize(W, H)
    const base = room.scaleX
    hall.setAlpha(0)
    await FX.wait(scene, 900)
    const s = Math.max(W / TABLET.w, H / TABLET.h) * 1.05
    const k = { t: 0 }
    await new Promise<void>(resolve =>
        scene.tweens.add({
            targets: k,
            t: 1,
            duration: FX.ms(scene, 1300),
            ease: 'Sine.easeInOut',
            onUpdate: () => {
                const z = Phaser.Math.Linear(1, s, k.t)
                room.setScale(base * z)
                room.setPosition(W / 2 - (TABLET.x - W / 2) * (z - 1), H / 2 - (TABLET.y - H / 2) * (z - 1))
                const fade = Phaser.Math.Clamp((k.t - 0.6) / 0.4, 0, 1)
                room.setAlpha(1 - fade)
                hall.setAlpha(fade)
            },
            onComplete: () => resolve(),
            onStop: () => resolve(),
        }),
    )
    room.destroy()
    hall.setAlpha(1)
}
