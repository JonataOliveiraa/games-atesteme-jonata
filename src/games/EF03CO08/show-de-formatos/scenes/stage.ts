import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { SHEET } from '../data/art'
import { CINEMA, DEPTH, H, SCREEN, W } from '../data/layout'
import { C } from '../data/theme'

const CONE = [
    { x: 132, aim: SCREEN.cx - 120 },
    { x: 1148, aim: SCREEN.cx + 120 },
]

function paintCurtain(g: Phaser.GameObjects.Graphics, w: number, flip: number) {
    const folds = 6
    const fold = w / folds
    g.clear()
    g.fillStyle(C.curtainDeep, 1)
    g.fillRect(0, 0, w, H)
    for (let i = 0; i < folds; i++) {
        g.fillStyle(i % 2 ? C.curtain : C.curtainDeep, 1)
        g.fillRect(i * fold, 0, fold, H)
        g.fillStyle(C.white, 0.07)
        g.fillRect(i * fold + fold * 0.2, 0, fold * 0.22, H)
    }
    g.fillStyle(C.ink, 0.35)
    g.fillRect(flip > 0 ? w - 10 : 0, 0, 10, H)
}

export function createStage(scene: Phaser.Scene) {
    const parts: Phaser.GameObjects.GameObject[] = []

    if (scene.textures.exists(SHEET.background)) {
        parts.push(scene.add.image(W / 2, H / 2, SHEET.background).setDisplaySize(W, H + 2).setDepth(DEPTH.bg))
    } else {
        const g = scene.add.graphics().setDepth(DEPTH.bg)
        g.fillStyle(C.purpleDeep, 1)
        g.fillRect(0, 0, W, 460)
        g.fillStyle(C.yellowDeep, 1)
        g.fillRect(0, 460, W, H - 460)
        parts.push(g)
    }

    const veil = scene.add.graphics().setDepth(DEPTH.bg + 1)
    veil.fillStyle(C.ink, 0.2)
    veil.fillRect(0, 0, W, H)
    parts.push(veil)

    const beams = scene.add.graphics().setDepth(DEPTH.spot).setAlpha(0)
    const paintBeams = (cinema: boolean) => {
        beams.clear()
        const foot = cinema ? 660 : 470
        CONE.forEach(cone => {
            const aim = cinema ? CINEMA.x : cone.aim
            beams.fillStyle(C.glow, cinema ? 0.3 : 0.26)
            beams.fillTriangle(cone.x, 40, aim - (cinema ? 330 : 150), foot, aim + (cinema ? 330 : 150), foot)
            beams.fillStyle(C.glow, 0.14)
            beams.fillTriangle(cone.x, 40, aim - (cinema ? 420 : 240), foot + 50, aim + (cinema ? 420 : 240), foot + 50)
        })
    }
    paintBeams(false)
    parts.push(beams)

    const half = W / 2 + 20
    const left = scene.add.graphics().setDepth(DEPTH.curtain)
    paintCurtain(left, half, 1)
    left.setX(-half)
    const right = scene.add.graphics().setDepth(DEPTH.curtain)
    paintCurtain(right, half, -1)
    right.setX(W)
    parts.push(left, right)

    let pulse: Phaser.Tweens.Tween | null = null

    return {
        lights(on: boolean, lifted = false) {
            pulse?.remove()
            pulse = null
            scene.tweens.killTweensOf(beams)
            beams.setDepth(lifted ? DEPTH.curtain - 4 : DEPTH.spot)
            if (on) paintBeams(lifted)
            if (!on) {
                void FX.to(scene, beams, { alpha: 0 }, { duration: 260 })
                return
            }
            beams.setAlpha(0)
            void FX.to(scene, beams, { alpha: 1 }, { duration: 220 }).then(() => {
                if (!beams.active) return
                pulse = scene.tweens.add({
                    targets: beams,
                    alpha: 0.55,
                    duration: FX.ms(scene, 520),
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut',
                })
            })
        },

        async close() {
            await FX.all(
                FX.to(scene, left, { x: 0 }, { duration: 420, ease: 'Cubic.easeIn' }),
                FX.to(scene, right, { x: W - half }, { duration: 420, ease: 'Cubic.easeIn' }),
            )
        },

        async open() {
            await FX.all(
                FX.to(scene, left, { x: -half }, { duration: 520, ease: 'Cubic.easeOut' }),
                FX.to(scene, right, { x: W }, { duration: 520, ease: 'Cubic.easeOut' }),
            )
        },

        destroy() {
            pulse?.remove()
            scene.tweens.killTweensOf([beams, left, right])
            parts.forEach(part => part.destroy())
        },
    }
}

export type Stage = ReturnType<typeof createStage>
