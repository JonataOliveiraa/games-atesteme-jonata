import Phaser from 'phaser'
import { Ease, FX } from '../../../../shared/effects/FX'
import { DEPTH, FIGHTER, GROUND } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'

const MAX_W = 520

export async function showBalloon(scene: Phaser.Scene, text: string, hold: number) {
    const root = scene.add.container(0, 0).setDepth(DEPTH.balloon)

    const label = scene.add.text(0, 0, text, {
        fontFamily: FONT.black,
        fontSize: '23px',
        color: CSS.ink,
        align: 'center',
        wordWrap: { width: MAX_W - 60 },
    }).setOrigin(0.5).setResolution(2)

    const w = Math.min(MAX_W, label.width + 56)
    const h = label.height + 46

    const g = scene.add.graphics()
    g.fillStyle(C.ink, 0.28)
    g.fillRoundedRect(-w / 2, -h / 2 + 7, w, h, 22)
    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 22)
    g.fillStyle(C.cream, 1)
    g.fillRoundedRect(-w / 2 + 5, -h / 2 + 5, w - 10, h - 12, 18)

    const tail = scene.add.graphics()
    tail.fillStyle(C.ink, 1)
    tail.fillTriangle(w / 2 - 70, h / 2 - 2, w / 2 - 20, h / 2 - 2, w / 2 - 26, h / 2 + 22)

    root.add([g, tail, label])

    const x = Phaser.Math.Clamp(FIGHTER.robotX - 170, w / 2 + 20, 1280 - w / 2 - 20)
    const y = GROUND - 190

    root.setPosition(x, y).setScale(0.7).setAlpha(0)
    await FX.to(scene, root, { scale: 1, alpha: 1 }, { duration: 240, ease: Ease.back(2.2) })
    await FX.wait(scene, hold)
    await FX.to(scene, root, { alpha: 0, y: y - 24 }, { duration: 200 })
    root.destroy(true)
}
