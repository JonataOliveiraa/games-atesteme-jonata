import Phaser from 'phaser'
import { Ease, FX } from '../../../../shared/effects/FX'
import { DEPTH, H, W } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'

export function createCareRibbon(scene: Phaser.Scene, text: string) {
    const root = scene.add.container(0, 0).setDepth(DEPTH.seal)

    const label = scene.add.text(0, 0, text, {
        fontFamily: FONT.black,
        fontSize: '20px',
        color: CSS.gold,
        align: 'center',
        wordWrap: { width: 300 },
    }).setOrigin(0.5).setResolution(2)

    const w = Math.min(360, label.width + 40)
    const h = label.height + 24

    const g = scene.add.graphics()
    g.fillStyle(C.ink, 0.26)
    g.fillRoundedRect(-w / 2, -h / 2 + 5, w, h, 15)
    g.fillStyle(C.goldDark, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 15)
    g.fillStyle(C.gold, 1)
    g.fillRoundedRect(-w / 2 + 4, -h / 2 + 4, w - 8, h - 10, 12)
    g.fillStyle(C.cream, 1)
    g.fillRoundedRect(-w / 2 + 4, -h / 2 + 4, w - 8, h - 14, 12)

    root.add([g, label])
    return root
}

export async function showSafeSeal(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    hold: number,
) {
    const root = scene.add.container(0, 0).setDepth(DEPTH.seal)

    const title = scene.add.text(0, -22, 'SEGURO!', {
        fontFamily: FONT.black,
        fontSize: '21px',
        color: CSS.white,
    }).setOrigin(0.5).setResolution(2)
    title.setStroke(CSS.ink, 5)

    const line = scene.add.text(0, 12, text, {
        fontFamily: FONT.black,
        fontSize: '20px',
        color: CSS.ok,
        align: 'center',
        wordWrap: { width: 320 },
    }).setOrigin(0.5).setResolution(2)

    const w = Math.min(400, Math.max(260, line.width + 48))
    const h = line.height + 62

    const g = scene.add.graphics()
    g.fillStyle(C.ink, 0.3)
    g.fillRoundedRect(-w / 2, -h / 2 + 6, w, h, 20)
    g.fillStyle(C.okDark, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 20)
    g.fillStyle(C.ok, 1)
    g.fillRoundedRect(-w / 2 + 5, -h / 2 + 5, w - 10, h - 14, 16)
    g.fillStyle(C.cream, 1)
    g.fillRoundedRect(-w / 2 + 5, -h / 2 + 36, w - 10, h - 46, 16)

    const tail = scene.add.graphics()
    tail.fillStyle(C.okDark, 1)
    tail.fillTriangle(-16, h / 2 - 2, 16, h / 2 - 2, 0, h / 2 + 20)

    root.add([g, tail, title, line])

    const px = Phaser.Math.Clamp(x, w / 2 + 24, W - w / 2 - 24)
    const py = Phaser.Math.Clamp(y - 132, 150, H - 190)
    root.setPosition(px, py).setScale(0.6).setAlpha(0)

    await FX.to(scene, root, { scale: 1, alpha: 1 }, { duration: 240, ease: Ease.back(2.4) })
    await FX.wait(scene, hold)
    await FX.to(scene, root, { alpha: 0, scale: 0.9 }, { duration: 200 })
    root.destroy(true)
}
