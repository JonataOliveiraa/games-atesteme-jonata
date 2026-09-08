import Phaser from 'phaser'
import { FX, Ease } from '../../../../shared/effects/FX'
import { ASK, DEPTH } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { problemIcon } from './problems'
import type { ProblemId } from '../types'

const SHEET = 'morador'

/** Quadros de `morador.png`: pedindo, comemorando, preocupado. */
export const FACE = { asking: 0, happy: 1, worried: 2 }

function drawVillager(scene: Phaser.Scene) {
    const villager = scene.add.container(0, 0)

    const body = scene.add.graphics()
    body.fillStyle(C.ink, 1)
    body.fillRoundedRect(-30, -6, 60, 50, 18)
    body.fillStyle(0x5b8def, 1)
    body.fillRoundedRect(-26, -2, 52, 44, 15)
    body.fillStyle(C.white, 0.24)
    body.fillRoundedRect(-18, 2, 36, 9, 5)

    const arm = scene.add.graphics()
    arm.fillStyle(C.ink, 1)
    arm.fillRoundedRect(-8, -6, 16, 44, 8)
    arm.fillStyle(0xf0c39b, 1)
    arm.fillRoundedRect(-5, -3, 10, 38, 5)
    arm.fillStyle(C.ink, 1)
    arm.fillCircle(0, 36, 10)
    arm.fillStyle(0xf0c39b, 1)
    arm.fillCircle(0, 36, 7)
    arm.setPosition(28, 2).setAngle(196)

    const head = scene.add.graphics()
    head.fillStyle(C.ink, 1)
    head.fillCircle(0, -30, 28)
    head.fillStyle(0xf0c39b, 1)
    head.fillCircle(0, -30, 24)
    head.fillStyle(0x8a5a2b, 1)
    head.slice(0, -30, 24, Phaser.Math.DegToRad(180), Phaser.Math.DegToRad(348), false)
    head.fillPath()
    head.fillStyle(C.ink, 1)
    head.fillCircle(-9, -30, 3.6)
    head.fillCircle(9, -30, 3.6)
    head.lineStyle(3.6, C.ink, 1)
    head.beginPath()
    head.arc(0, -26, 10, Phaser.Math.DegToRad(20), Phaser.Math.DegToRad(160), false)
    head.strokePath()

    villager.add([arm, body, head])
    return { villager, arm }
}

/**
 * O morador. Com a folha carregada ele é um sprite de três expressões; sem
 * ela, o boneco em `Graphics` continua valendo e o `arm` é quem acena.
 */
function makeVillager(scene: Phaser.Scene) {
    if (!scene.textures.exists(SHEET)) {
        const drawn = drawVillager(scene)
        return {
            villager: drawn.villager,
            arm: drawn.arm as Phaser.GameObjects.GameObject | null,
            setFace: () => { },
        }
    }

    const villager = scene.add.container(0, 0)
    const sprite = scene.add.sprite(0, 0, SHEET, FACE.asking)
    sprite.setScale(ASK.villagerSize / sprite.width)
    villager.add(sprite)

    return {
        villager,
        arm: null,
        setFace: (face: number) => sprite.setFrame(face),
    }
}

export function createAsk(scene: Phaser.Scene) {
    const root = scene.add.container(ASK.cx, ASK.cy).setDepth(DEPTH.ask)

    const panel = scene.add.graphics()
    panel.fillStyle(C.ink, 0.24)
    panel.fillRoundedRect(-ASK.w / 2, -ASK.h / 2 + 7, ASK.w, ASK.h, ASK.r)
    panel.fillStyle(C.ink, 1)
    panel.fillRoundedRect(-ASK.w / 2, -ASK.h / 2, ASK.w, ASK.h, ASK.r)
    panel.fillStyle(C.cream, 1)
    panel.fillRoundedRect(-ASK.w / 2 + 6, -ASK.h / 2 + 6, ASK.w - 12, ASK.h - 12, ASK.r - 6)
    panel.fillStyle(C.white, 0.6)
    panel.fillRoundedRect(-ASK.w / 2 + 20, -ASK.h / 2 + 13, ASK.w - 40, 18, 9)

    const { villager, arm, setFace } = makeVillager(scene)
    villager.setPosition(ASK.villagerX, ASK.villagerY)

    const label = scene.add.text(ASK.labelX, 0, '', {
        fontFamily: FONT.black,
        fontSize: SIZE.askLabel,
        color: CSS.ink,
    }).setOrigin(0, 0.5).setResolution(2)

    root.add([panel, villager, label])

    let icon: Phaser.GameObjects.Container | null = null
    let wave: Phaser.Tweens.Tween | null = null

    /**
     * O aceno. No sprite ele já está desenhado no quadro, então o que se
     * anima é o morador inteiro, com um balanço curto; no boneco em
     * `Graphics` quem gira é o braço.
     */
    const greet = () => {
        wave?.remove()
        wave = arm
            ? scene.tweens.add({
                targets: arm,
                angle: 232,
                duration: FX.ms(scene, 340),
                yoyo: true,
                repeat: 3,
                ease: 'Sine.easeInOut',
            })
            : scene.tweens.add({
                targets: villager,
                angle: 5,
                duration: FX.ms(scene, 420),
                yoyo: true,
                repeat: 3,
                ease: 'Sine.easeInOut',
            })
    }

    return {
        root,
        iconPoint() {
            return { x: ASK.cx + ASK.iconX, y: ASK.cy }
        },

        async show(problem: ProblemId, word: string) {
            icon?.destroy()
            icon = problemIcon(scene, problem, ASK.iconSize)
            icon.setPosition(ASK.iconX, 0)
            root.add(icon)
            label.setText(word)
            setFace(FACE.asking)
            greet()

            root.setAlpha(0).setScale(0.92)
            await FX.to(scene, root, { alpha: 1, scale: 1 }, { duration: 320, ease: Ease.back(1.8) })
            void FX.to(scene, icon, { scale: 1.18 }, { duration: 220, yoyo: true, repeat: 1, ease: Ease.back(2.2) })
        },

        cheer() {
            wave?.remove()
            wave = null
            setFace(FACE.happy)
            villager.setAngle(0)
            return FX.to(
                scene,
                villager,
                { y: ASK.villagerY - 14 },
                { duration: 210, yoyo: true, repeat: 1, ease: Ease.back(2.4) },
            )
        },

        /** Preocupado só enquanto a gag acontece: depois ele volta a pedir. */
        async worry() {
            wave?.remove()
            wave = null
            setFace(FACE.worried)
            villager.setAngle(0)
            await FX.shake(scene, villager, { amount: 9, times: 3 })
            await FX.wait(scene, 1100)
            setFace(FACE.asking)
        },

        fade(alpha: number, ms: number) {
            return FX.to(scene, root, { alpha }, { duration: ms })
        },

        hide() {
            wave?.remove()
            wave = null
            return FX.to(scene, root, { alpha: 0, scale: 0.94 }, { duration: 240 })
        },

        destroy() {
            wave?.remove()
            FX.kill(scene, root)
            root.destroy(true)
        },
    }
}

export type Ask = ReturnType<typeof createAsk>
