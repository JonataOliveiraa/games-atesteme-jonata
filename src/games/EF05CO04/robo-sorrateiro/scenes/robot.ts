import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BUBBLE, DEPTH, PATH, ROBOT, W } from '../data/layout'
import { A, C, CSS, FONT } from '../data/theme'
import { POSE, TEX } from './BootScene'

export interface Robot {
    placeAt(x: number): void
    walkTo(x: number, ms: number): Promise<void>
    duck(ms: number): Promise<void>
    stand(): Promise<void>
    shrug(): Promise<void>
    cheer(): Promise<void>
    caught(): Promise<void>
    /** O balão curto. Some sozinho, e qualquer movimento cala ele. */
    say(line: string, ms?: number): void
    hush(): void
    x(): number
    destroy(): void
}

export interface RobotOptions {
    /** Chamado quando ele entra num esconderijo, com o x dele. */
    onHide(x: number): void
    /** Chamado quando ele sai de lá. */
    onShow(): void
}

export function createRobot(scene: Phaser.Scene, options: RobotOptions): Robot {
    let hiding = false
    let stepTimer: Phaser.Time.TimerEvent | undefined
    let hushTimer: Phaser.Time.TimerEvent | undefined

    const art = scene.textures.exists(TEX.robot)
        ? scene.add.sprite(PATH.startX, PATH.y, TEX.robot, POSE.idle).setDepth(DEPTH.robot)
        : undefined
    if (art) {
        art.setOrigin(0.5, 1)
        art.setDisplaySize(ROBOT.h, ROBOT.h)
    }

    const body = scene.add.graphics().setDepth(DEPTH.robot)
    if (!art) {
        body.fillStyle(C.ink, 1)
        body.fillRoundedRect(PATH.startX - 34, PATH.y - 96, 68, 96, 24)
        body.fillStyle(C.bip, 1)
        body.fillRoundedRect(PATH.startX - 28, PATH.y - 90, 56, 84, 20)
    }

    const shadow = scene.add.graphics().setDepth(DEPTH.path + 3)
    const paintShadow = (x: number) => {
        shadow.clear()
        shadow.fillStyle(C.ink, hiding ? 0.1 : 0.22)
        shadow.fillEllipse(x, PATH.y + 6, 84, 22)
    }
    paintShadow(PATH.startX)

    const bubble = scene.add.container(PATH.startX, PATH.y + BUBBLE.dy).setDepth(DEPTH.balloon).setAlpha(0)
    const bubbleBody = scene.add.graphics()
    const bubbleText = scene.add
        .text(0, -2, '', { fontFamily: FONT.black, fontSize: '26px', color: CSS.ink })
        .setOrigin(0.5)
        .setResolution(2)
    bubble.add(bubbleBody)
    bubble.add(bubbleText)

    const paintBubble = () => {
        const w = Math.min(BUBBLE.max, bubbleText.width + BUBBLE.padX * 2)
        const h = BUBBLE.h
        bubbleBody.clear()
        bubbleBody.fillStyle(C.ink, A.shadow)
        bubbleBody.fillRoundedRect(-w / 2 + 3, -h / 2 + 6, w, h, 20)
        bubbleBody.fillStyle(C.ink, 1)
        bubbleBody.fillRoundedRect(-w / 2, -h / 2, w, h, 20)
        bubbleBody.fillStyle(C.card, 1)
        bubbleBody.fillRoundedRect(-w / 2 + 5, -h / 2 + 5, w - 10, h - 10, 16)
        bubbleBody.fillStyle(C.ink, 1)
        bubbleBody.fillTriangle(-20, h / 2 - 4, 8, h / 2 - 4, -6, h / 2 + 26)
        bubbleBody.fillStyle(C.card, 1)
        bubbleBody.fillTriangle(-16, h / 2 - 10, 2, h / 2 - 10, -8, h / 2 + 16)
    }

    const hush = () => {
        hushTimer?.remove()
        hushTimer = undefined
        FX.kill(scene, bubble)
        bubble.setAlpha(0)
    }

    const startStepping = () => {
        stepTimer?.remove()
        let flip = false
        stepTimer = scene.time.addEvent({
            delay: FX.ms(scene, 150),
            loop: true,
            callback: () => {
                flip = !flip
                art?.setFrame(flip ? POSE.walkA : POSE.walkB)
            },
        })
    }

    const stopStepping = () => {
        stepTimer?.remove()
        stepTimer = undefined
        if (!hiding) art?.setFrame(POSE.idle)
    }

    const at = () => art?.x ?? PATH.startX

    const baseScale = { x: art?.scaleX ?? 1, y: art?.scaleY ?? 1 }

    /** Ele volta a aparecer, e o móvel volta a ser só um móvel. */
    const reveal = () => {
        hiding = false
        options.onShow()
        if (!art) return
        FX.kill(scene, art)
        art.setVisible(true).setY(PATH.y).setDepth(DEPTH.robot).setFrame(POSE.idle)
        art.setScale(baseScale.x, baseScale.y)
        shadow.setAlpha(1)
        paintShadow(at())
    }

    return {
        placeAt: x => {
            if (hiding) reveal()
            art?.setPosition(x, PATH.y).setFrame(POSE.idle).setDepth(DEPTH.robot)
            paintShadow(x)
            hush()
        },

        walkTo: async (x, ms) => {
            hush()
            if (!art) return
            if (hiding) reveal()
            startStepping()
            await FX.to(scene, art, { x }, { duration: ms, ease: 'Linear' })
            stopStepping()
            paintShadow(x)
        },

/*
         * ESCONDER É TROCAR A PEÇA, NÃO EMPILHAR DESENHO.
         *
         * O robô some e o móvel passa a ser a versão COM ele dentro, que veio
         * desenhada. Antes ele ia para trás do móvel por profundidade e sobrava
         * só a antena — agora aparece o rosto inteiro espiando, que é o que a
         * criança precisa ver para entender que ele se escondeu ALI.
         */
        duck: async ms => {
            hush()
            if (!art) return
            if (!hiding) {
                hiding = true
                const x = at()
                await FX.to(scene, art, { y: PATH.y + 8, scaleX: art.scaleX * 1.08 }, { duration: 110 })
                art.setVisible(false).setY(PATH.y).setScale(baseScale.x, baseScale.y)
                shadow.setAlpha(0)
                options.onHide(x)
                await FX.wait(scene, Math.max(0, ms - 110))
                return
            }
            await FX.wait(scene, ms)
        },

        stand: async () => {
            if (!art || !hiding) return
            reveal()
            await FX.to(scene, art, { y: PATH.y - 10 }, { duration: 120, yoyo: true })
        },

        shrug: async () => {
            if (!art) return
            art.setFrame(POSE.hide)
            await FX.to(scene, art, { y: art.y - 14 }, { duration: 200, yoyo: true, repeat: 1 })
        },

        cheer: async () => {
            if (!art) return
            art.setFrame(POSE.cheer)
            await FX.to(scene, art, { y: art.y - 26 }, { duration: 220, yoyo: true })
            art.setFrame(POSE.idle)
        },

        caught: async () => {
            if (!art) return
            art.setFrame(POSE.idle)
            await FX.to(scene, art, { angle: -10 }, { duration: 110, yoyo: true, repeat: 2 })
            art.setAngle(0)
        },

        say: (line, ms = 2200) => {
            hush()
            bubbleText.setText(line)
            paintBubble()
            const half = Math.min(BUBBLE.max, bubbleText.width + BUBBLE.padX * 2) / 2
            bubble.setPosition(Phaser.Math.Clamp(at() + 40, half + 16, W - half - 16), PATH.y + BUBBLE.dy)
            FX.kill(scene, bubble)
            bubble.setScale(0.9)
            void FX.to(scene, bubble, { alpha: 1, scale: 1 }, { duration: 200 })
            hushTimer = scene.time.delayedCall(FX.ms(scene, ms), () => {
                void FX.to(scene, bubble, { alpha: 0 }, { duration: 220 })
            })
        },

        hush,
        x: at,

        destroy: () => {
            stepTimer?.remove()
            hushTimer?.remove()
            bubble.destroy(true)
            shadow.destroy()
            body.destroy()
            art?.destroy()
        },
    }
}
