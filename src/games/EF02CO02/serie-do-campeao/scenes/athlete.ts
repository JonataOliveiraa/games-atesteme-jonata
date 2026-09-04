import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH } from '../data/layout'
import { C } from '../data/theme'

export const ATHLETE_SHEET = 'atleta'
export const ATHLETE_COLUMNS = 5

export type Pose = 'idle' | 'jump' | 'spin' | 'cheer' | 'oops'

const FRAME: Record<Pose, number> = { idle: 0, jump: 1, spin: 2, cheer: 3, oops: 4 }

const ARMS: Record<Pose, [number, number]> = {
    idle: [-22, 22],
    jump: [-158, 158],
    spin: [-96, 96],
    cheer: [-150, 150],
    oops: [-118, 34],
}

const LEGS: Record<Pose, [number, number]> = {
    idle: [-9, 9],
    jump: [-34, 34],
    spin: [-12, 54],
    cheer: [-16, 16],
    oops: [-42, 14],
}

function limb(
    g: Phaser.GameObjects.Graphics,
    x: number, y: number,
    width: number, length: number,
    deg: number, color: number,
) {
    g.save()
    g.translateCanvas(x, y)
    g.rotateCanvas(Phaser.Math.DegToRad(deg))
    g.fillStyle(color, 1)
    g.fillRoundedRect(-width / 2, 0, width, length, width / 2)
    g.restore()
}

const tipOf = (x: number, y: number, deg: number, length: number) => {
    const a = Phaser.Math.DegToRad(deg)
    return { x: x + Math.sin(a) * length, y: y + Math.cos(a) * length }
}

function drawAthlete(g: Phaser.GameObjects.Graphics, pose: Pose, h: number) {
    g.clear()

    const bodyW = 0.3 * h
    const bodyTop = -0.7 * h
    const bodyH = 0.26 * h
    const hipY = bodyTop + bodyH
    const shortsH = 0.12 * h
    const legLen = pose === 'jump' ? 0.17 * h : 0.24 * h
    const armLen = 0.23 * h
    const shoulderY = bodyTop + 0.05 * h
    const headR = 0.135 * h
    const headY = -0.845 * h

    const [legL, legR] = LEGS[pose]
    const [armL, armR] = ARMS[pose]

    limb(g, -0.07 * h, hipY + shortsH * 0.5, 0.085 * h, legLen, legL, C.skin)
    limb(g, 0.07 * h, hipY + shortsH * 0.5, 0.085 * h, legLen, legR, C.skin)

    const footL = tipOf(-0.07 * h, hipY + shortsH * 0.5, legL, legLen)
    const footR = tipOf(0.07 * h, hipY + shortsH * 0.5, legR, legLen)
    g.fillStyle(C.shoes, 1)
    g.fillEllipse(footL.x, footL.y, 0.13 * h, 0.075 * h)
    g.fillEllipse(footR.x, footR.y, 0.13 * h, 0.075 * h)

    g.fillStyle(C.shorts, 1)
    g.fillRoundedRect(-bodyW / 2, hipY - shortsH * 0.35, bodyW, shortsH, 0.04 * h)

    limb(g, -bodyW / 2 + 0.01 * h, shoulderY, 0.075 * h, armLen, armL, C.skin)
    limb(g, bodyW / 2 - 0.01 * h, shoulderY, 0.075 * h, armLen, armR, C.skin)

    g.fillStyle(C.shirt, 1)
    g.fillRoundedRect(-bodyW / 2, bodyTop, bodyW, bodyH, 0.06 * h)

    g.fillStyle(C.skin, 1)
    g.fillCircle(0, headY, headR)
    g.fillStyle(C.hair, 1)
    g.fillEllipse(0, headY - headR * 0.62, headR * 2.02, headR * 1.1)
    g.fillStyle(C.ink, 1)
    g.fillCircle(-headR * 0.36, headY - headR * 0.02, headR * 0.16)
    g.fillCircle(headR * 0.36, headY - headR * 0.02, headR * 0.16)
    g.lineStyle(Math.max(2, 0.016 * h), C.ink, 1)
    g.beginPath()
    g.arc(0, headY + headR * 0.16, headR * 0.42,
        Phaser.Math.DegToRad(pose === 'oops' ? 210 : 20),
        Phaser.Math.DegToRad(pose === 'oops' ? 330 : 160), false)
    g.strokePath()

    if (pose !== 'cheer') return
    g.fillStyle(C.gold, 1)
    for (let i = 0; i < 6; i++) {
        const a = Phaser.Math.DegToRad(-30 - i * 24)
        g.fillCircle(Math.cos(a) * 0.32 * h, headY + Math.sin(a) * 0.3 * h, 0.022 * h)
    }
}

export interface AthleteOptions {
    x: number
    feetY: number
    h: number
    hop: number
}

export function createAthlete(scene: Phaser.Scene, options: AthleteOptions) {
    const { x, feetY, h, hop } = options
    const root = scene.add.container(x, feetY).setDepth(DEPTH.athlete)

    const shadow = scene.add.graphics()
    shadow.fillStyle(C.ink, 0.26)
    shadow.fillEllipse(0, 6, h * 0.46, h * 0.11)

    const body = scene.add.container(0, 0)

    const sheetOk =
        scene.textures.exists(ATHLETE_SHEET) && scene.textures.get(ATHLETE_SHEET).has('0')

    let sprite: Phaser.GameObjects.Sprite | null = null
    let art: Phaser.GameObjects.Graphics | null = null

    if (sheetOk) {
        const source = scene.textures.get(ATHLETE_SHEET).get(0)
        const ratio = source.width / source.height
        sprite = scene.add.sprite(0, 0, ATHLETE_SHEET, 0)
            .setOrigin(0.5, 1)
            .setDisplaySize(h * ratio, h)
        body.add(sprite)
    } else {
        art = scene.add.graphics()
        drawAthlete(art, 'idle', h)
        body.add(art)
    }

    root.add([shadow, body])

    let pose: Pose = 'idle'

    const setPose = (next: Pose) => {
        pose = next
        if (sprite) {
            const w = sprite.displayWidth
            const height = sprite.displayHeight
            sprite.setFrame(FRAME[next])
            sprite.setDisplaySize(w, height)
            return
        }
        if (art) drawAthlete(art, next, h)
    }

    const lift = (height: number, ms: number) =>
        new Promise<void>(resolve => {
            scene.tweens.add({
                targets: body,
                y: -height,
                duration: FX.ms(scene, ms),
                ease: 'Sine.easeOut',
                yoyo: true,
                onComplete: () => resolve(),
            })
            scene.tweens.add({
                targets: shadow,
                scaleX: 0.62,
                scaleY: 0.62,
                alpha: 0.45,
                duration: FX.ms(scene, ms),
                ease: 'Sine.easeOut',
                yoyo: true,
            })
        })

    const trail = () => {
        const g = scene.add.graphics().setDepth(DEPTH.athlete - 1)
        g.lineStyle(9, C.teal, 0.85)
        g.strokeEllipse(0, 0, h * 0.62, h * 0.2)
        g.setPosition(x, feetY - h * 0.42)
        scene.tweens.add({
            targets: g,
            scaleX: 1.5,
            scaleY: 1.5,
            alpha: 0,
            duration: FX.ms(scene, 460),
            onComplete: () => g.destroy(),
        })
    }

    return {
        get container() {
            return root
        },

        get pose() {
            return pose
        },

        setPose,

        async hop(speed = 1) {
            setPose('jump')
            await lift(hop, 230 / speed)
            setPose('idle')
        },

        async twirl(speed = 1) {
            setPose('spin')
            trail()
            const flip = new Promise<void>(resolve => {
                scene.tweens.add({
                    targets: body,
                    scaleX: -1,
                    duration: FX.ms(scene, 190 / speed),
                    yoyo: true,
                    onComplete: () => resolve(),
                })
            })
            await Promise.all([flip, lift(hop * 0.28, 200 / speed)])
            body.setScale(1)
            setPose('idle')
        },

        async cheer() {
            setPose('cheer')
            await lift(hop * 0.42, 170)
            await lift(hop * 0.3, 150)
            setPose('idle')
        },

        async oops() {
            setPose('oops')
            await FX.to(scene, body, { angle: -12 }, { duration: 150 })
            await FX.to(scene, body, { angle: 8 }, { duration: 210 })
            await FX.to(scene, body, { angle: 0 }, { duration: 180 })
            setPose('idle')
        },

        reset() {
            scene.tweens.killTweensOf(body)
            scene.tweens.killTweensOf(shadow)
            body.setPosition(0, 0).setScale(1).setAngle(0)
            shadow.setScale(1).setAlpha(1)
            setPose('idle')
        },

        destroy() {
            scene.tweens.killTweensOf(body)
            scene.tweens.killTweensOf(shadow)
            root.destroy(true)
        },
    }
}
