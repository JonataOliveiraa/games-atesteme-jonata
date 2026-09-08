import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, MASCOT } from '../data/layout'
import { C } from '../data/theme'
import { UI, UI_SHEET } from './machine'

export const MASCOT_SHEET = 'mascote'
export const MASCOT_COLUMNS = 4
export const MASCOT_ROWS = 1

export type MascotPose = 'idle' | 'point' | 'happy' | 'think'

const FRAME: Record<MascotPose, number> = { idle: 0, point: 1, happy: 2, think: 3 }

function drawFallbackFace(g: Phaser.GameObjects.Graphics, r: number) {
    g.fillStyle(C.gold, 1)
    g.fillCircle(0, -r * 0.16, r * 0.72)
    g.fillStyle(0xf7c99a, 1)
    g.fillCircle(0, 0, r * 0.56)
    g.fillStyle(C.ink, 1)
    g.fillCircle(-r * 0.2, -r * 0.06, r * 0.08)
    g.fillCircle(r * 0.2, -r * 0.06, r * 0.08)
    g.lineStyle(r * 0.07, C.ink, 1)
    g.beginPath()
    g.arc(0, r * 0.1, r * 0.24, Phaser.Math.DegToRad(20), Phaser.Math.DegToRad(160), false)
    g.strokePath()
    g.fillStyle(C.hard, 1)
    g.fillRoundedRect(-r * 0.55, r * 0.5, r * 1.1, r * 0.5, r * 0.16)
}

/**
 * A mascote numa TELA DE PAREDE.
 *
 * Antes ela era um círculo colado no canto — um adesivo em cima do cenário.
 * Agora ela é um monitor do laboratório: tem moldura, parafuso e um vidro que
 * pertence à sala. A diferença não é enfeite; é ela deixar de flutuar.
 *
 * Ela não fala: ajuda o OLHAR. Aponta para o que acabou de mudar, comemora
 * quando a máquina liga e fica em dúvida quando a entrada recusa.
 */
export function createMascot(scene: Phaser.Scene) {
    const root = scene.add.container(MASCOT.cx, MASCOT.cy).setDepth(DEPTH.machine)

    const glass = scene.add.graphics()
    glass.fillStyle(C.ink, 1)
    glass.fillCircle(0, 0, MASCOT.r + 6)
    glass.fillStyle(0x123a5c, 1)
    glass.fillCircle(0, 0, MASCOT.r)

    const body = scene.add.container(0, 0)

    const sheetOk =
        scene.textures.exists(MASCOT_SHEET) && scene.textures.get(MASCOT_SHEET).has('0')

    let sprite: Phaser.GameObjects.Sprite | null = null
    if (sheetOk) {
        sprite = scene.add.sprite(0, MASCOT.r * 0.14, MASCOT_SHEET, 0)
            .setOrigin(0.5)
            .setDisplaySize(MASCOT.size, MASCOT.size)
        body.add(sprite)
    } else {
        const art = scene.add.graphics()
        drawFallbackFace(art, MASCOT.r)
        body.add(art)
    }

    const maskShape = scene.make.graphics({ x: MASCOT.cx, y: MASCOT.cy }, false)
    maskShape.fillStyle(0xffffff, 1)
    maskShape.fillCircle(0, 0, MASCOT.r)
    body.setMask(maskShape.createGeometryMask())

    const bezelOk =
        scene.textures.exists(UI_SHEET) && scene.textures.get(UI_SHEET).has(String(UI.bezel))

    const bezel = bezelOk
        ? scene.add.sprite(0, 0, UI_SHEET, UI.bezel).setDisplaySize(MASCOT.bezel, MASCOT.bezel)
        : null

    const rim = bezel ? null : scene.add.graphics()
    if (rim) {
        rim.lineStyle(9, C.steelDark, 1)
        rim.strokeCircle(0, 0, MASCOT.r + 3)
        rim.lineStyle(4, C.steel, 1)
        rim.strokeCircle(0, 0, MASCOT.r + 8)
        rim.fillStyle(C.steelDark, 1)
        for (const a of [-135, -45, 45, 135]) {
            const rad = Phaser.Math.DegToRad(a)
            rim.fillCircle(Math.cos(rad) * (MASCOT.r + 8), Math.sin(rad) * (MASCOT.r + 8), 5)
        }
    }

    root.add([glass, body, bezel ?? rim!])

    const setPose = (pose: MascotPose) => sprite?.setFrame(FRAME[pose])

    return {
        get container() {
            return root
        },

        setPose,

        async point() {
            setPose('point')
            await FX.to(scene, body, { x: 10 }, { duration: 180, yoyo: true })
            body.setX(0)
        },

        async happy() {
            setPose('happy')
            await FX.to(scene, body, { y: -12 }, { duration: 170, yoyo: true })
            body.setY(0)
        },

        async think() {
            setPose('think')
            await FX.to(scene, root, { angle: -4 }, { duration: 200, yoyo: true })
            root.setAngle(0)
        },

        bounds() {
            return { x: MASCOT.cx, y: MASCOT.cy, w: MASCOT.bezel, h: MASCOT.bezel }
        },

        destroy() {
            scene.tweens.killTweensOf(root)
            scene.tweens.killTweensOf(body)
            maskShape.destroy()
            root.destroy(true)
        },
    }
}

export type Mascot = ReturnType<typeof createMascot>
