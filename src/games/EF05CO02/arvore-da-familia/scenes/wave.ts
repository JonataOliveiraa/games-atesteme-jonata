import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { WAVE_KEY } from '../data/files'
import { DEPTH, W, WAVE } from '../data/layout'
import { C } from '../data/theme'

export const waveReach = (y: number) => {
    const frac = Phaser.Math.Clamp((y - WAVE.from) / (WAVE.to - WAVE.from), 0, 1)
    return (Math.asin(frac) * 2 * WAVE.down) / Math.PI
}

function fallback(scene: Phaser.Scene) {
    const g = scene.add.graphics()
    g.fillStyle(C.sea, 1)
    g.fillRect(-W, 0, W * 2, 400)
    g.fillStyle(C.foam, 1)
    for (let x = -W; x <= W; x += 60) g.fillCircle(x, 400, 34)
    return { obj: g, foam: 420 }
}

export async function crashWave(scene: Phaser.Scene) {
    let front: Phaser.GameObjects.Image | Phaser.GameObjects.Graphics
    let foam: number
    let cover: number
    if (scene.textures.exists(WAVE_KEY)) {
        const img = scene.add.image(W / 2, 0, WAVE_KEY).setOrigin(0.5, 0)
        const s = WAVE.width / img.width
        img.setScale(s)
        front = img
        foam = WAVE.foamAt * s
        cover = WAVE.waterTop * s
    } else {
        const made = fallback(scene)
        made.obj.setX(W / 2)
        front = made.obj
        foam = made.foam
        cover = 0
    }
    const sea = scene.add.rectangle(0, cover, W, 2000, C.sea).setOrigin(0, 1)
    const obj = scene.add.container(0, 0, [sea, front]).setDepth(DEPTH.wave).setY(WAVE.from - foam)
    await FX.to(scene, obj, { y: WAVE.to - foam }, { duration: WAVE.down, ease: 'Sine.easeOut' })
    await FX.wait(scene, WAVE.hold)
    await FX.to(scene, obj, { y: WAVE.from - foam - 120 }, { duration: WAVE.up, ease: 'Sine.easeIn' })
    obj.destroy()
}
