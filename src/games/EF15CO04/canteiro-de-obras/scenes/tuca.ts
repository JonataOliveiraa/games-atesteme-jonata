import Phaser from 'phaser'
import { FX, type FxTarget } from '../../../../shared/effects/FX'
import { POSE, TUCA_SHEET, type Pose } from '../data/files'
import { DEPTH, HUD, TUCA, W } from '../data/layout'
import { C, CSS, FONT, SIZE, TYPE_MS } from '../data/theme'

const fx = (o: unknown) => o as unknown as FxTarget

const BALLOON = {
    wrap: 300,
    padX: 26,
    padY: 20,
    buttonH: 52,
    buttonW: 186,
    radius: 18,
}

const TOP_MIN = HUD.h + 14

export interface Tuca {
    /** Entra (se precisar), escreve a fala e ESPERA o Próximo. */
    say(text: string, pose?: Pose, label?: string): Promise<void>
    /** `say` seguido da saída. */
    beat(text: string, pose?: Pose, label?: string): Promise<void>
    /** Aparece sem falar. */
    show(pose?: Pose): Promise<void>
    /** Tira o balão e deixa ela em cena. */
    hideBalloon(): void
    setPose(pose: Pose): void
    /** Vira para o lado e aponta. */
    pointAt(x: number): Promise<void>
    moveTo(x: number): Promise<void>
    exit(): Promise<void>
    destroy(): void
}

export function createTuca(scene: Phaser.Scene): Tuca {
    const homeX: number = TUCA.cx
    let station: number = homeX

    const container = scene.add.container(homeX + TUCA.offX, TUCA.baseY).setDepth(DEPTH.tuca).setAlpha(0)
    const body = scene.add.container(0, 0)
    const figure = scene.add.container(0, 0)
    body.add(figure)
    container.add(body)

    let sprite: Phaser.GameObjects.Sprite | undefined
    if (scene.textures.exists(TUCA_SHEET)) {
        sprite = scene.add.sprite(0, 0, TUCA_SHEET, POSE.calm).setOrigin(0.5, 1).setScale(TUCA.scale)
        figure.add(sprite)
    } else {
        const g = scene.add.graphics()
        g.fillStyle(C.paper, 1)
        g.fillRoundedRect(-70, -TUCA.h, 140, TUCA.h, 40)
        g.lineStyle(6, C.line, 1)
        g.strokeRoundedRect(-70, -TUCA.h, 140, TUCA.h, 40)
        g.fillStyle(C.gold, 1)
        g.fillEllipse(0, -TUCA.h + 28, 120, 54)
        g.lineStyle(6, C.amberDark, 1)
        g.strokeEllipse(0, -TUCA.h + 28, 120, 54)
        figure.add(g)
    }

    /* a vida parada: três ondas de períodos diferentes, que nunca somam junto */
    FX.breathe(scene, fx(body), { grow: 1.035, duration: 1300 })
    FX.float(scene, fx(body), { amount: 7, duration: 1700 })
    FX.wiggle(scene, fx(body), { deg: 2.2, duration: 2300 })

    const balloonArt = scene.add.graphics()
    const buttonArt = scene.add.graphics()
    const speech = scene.add
        .text(0, 0, '', {
            fontFamily: FONT.body,
            fontSize: `${SIZE.speech}px`,
            color: CSS.ink,
            align: 'center',
            wordWrap: { width: BALLOON.wrap },
        })
        .setOrigin(0.5, 0)
        .setResolution(2)
    const buttonText = scene.add
        .text(0, 0, 'Próximo', { fontFamily: FONT.black, fontSize: `${SIZE.button}px`, color: CSS.white })
        .setOrigin(0.5)
        .setResolution(2)

    const balloon = scene.add
        .container(0, 0, [balloonArt, speech, buttonArt, buttonText])
        .setDepth(DEPTH.tuca + 1)
        .setVisible(false)

    const balloonZone = scene.add
        .zone(0, 0, 10, 10)
        .setOrigin(0.5)
        .setDepth(DEPTH.tuca + 2)
        .setInteractive({ useHandCursor: true })
    const buttonZone = scene.add
        .zone(0, 0, BALLOON.buttonW + 30, BALLOON.buttonH + 18)
        .setOrigin(0.5)
        .setDepth(DEPTH.tuca + 3)
        .setInteractive({ useHandCursor: true })
    balloonZone.input!.enabled = false
    buttonZone.input!.enabled = false

    let hideToken = 0
    let typing: { skip(): void } | undefined
    let waiting: (() => void) | undefined

    balloonZone.on('pointerdown', () => typing?.skip())
    buttonZone.on('pointerdown', () => {
        typing?.skip()
        const resolve = waiting
        waiting = undefined
        resolve?.()
    })

    const paintBalloon = (w: number, h: number, buttonCy: number) => {
        balloonArt.clear()
        balloonArt.fillStyle(C.paper, 1)
        balloonArt.fillRoundedRect(-w / 2, -h / 2, w, h, BALLOON.radius)
        balloonArt.lineStyle(5, C.line, 1)
        balloonArt.strokeRoundedRect(-w / 2, -h / 2, w, h, BALLOON.radius)
        balloonArt.fillStyle(C.paper, 1)
        balloonArt.fillTriangle(16, h / 2 - 2, 60, h / 2 - 2, 34, h / 2 + 26)

        buttonArt.clear()
        buttonArt.fillStyle(C.greenDark, 1)
        buttonArt.fillRoundedRect(-BALLOON.buttonW / 2, buttonCy - BALLOON.buttonH / 2 + 5, BALLOON.buttonW, BALLOON.buttonH, 14)
        buttonArt.fillStyle(C.green, 1)
        buttonArt.fillRoundedRect(-BALLOON.buttonW / 2, buttonCy - BALLOON.buttonH / 2, BALLOON.buttonW, BALLOON.buttonH, 14)
    }

    const setPose = (pose: Pose) => {
        sprite?.setFrame(pose)
        /* o desenho aponta para a direita, e o terreno mora à esquerda dela */
        sprite?.setFlipX(pose === POSE.point)
    }

    const enter = async () => {
        if (container.alpha > 0.95 && Math.abs(container.x - station) < 1) return
        container.setX(station + TUCA.offX)
        figure.setScale(1, 0.9)
        await FX.all(
            FX.to(scene, fx(container), { alpha: 1, x: station }, { duration: 380, ease: 'Back.easeOut' }),
            FX.to(scene, fx(figure), { scaleY: 1 }, { duration: 380, ease: 'Back.easeOut' }),
        )
    }

    const talkPulse = () => {
        FX.to(scene, fx(figure), { scaleY: 1.03 }, { duration: 90, yoyo: true, ease: 'Sine.easeOut' })
    }

    const hideBalloon = () => {
        balloonZone.input!.enabled = false
        buttonZone.input!.enabled = false
        if (!balloon.visible) return
        const token = ++hideToken
        void FX.to(scene, fx(balloon), { alpha: 0, scale: 0.9 }, { duration: 180 }).then(() => {
            if (token === hideToken) balloon.setVisible(false)
        })
    }

    const speak = async (text: string, pose: Pose, label: string) => {
        setPose(pose)

        speech.setText(text)
        buttonText.setText(label)
        const w = Math.max(speech.width + BALLOON.padX * 2, BALLOON.buttonW + 70)
        const h = speech.height + BALLOON.padY * 2 + BALLOON.buttonH + 10
        const buttonCy = h / 2 - BALLOON.padY - BALLOON.buttonH / 2 + 4
        paintBalloon(w, h, buttonCy)
        speech.setPosition(0, -h / 2 + BALLOON.padY)
        buttonText.setPosition(0, buttonCy)

        let by = -TUCA.h - h / 2 - 16
        const top = TUCA.baseY + by - h / 2
        if (top < TOP_MIN) by += TOP_MIN - top

        /* o balão não pode sair pela borda: ele desliza para dentro da tela */
        const wanted = station - 40
        const bx = Phaser.Math.Clamp(wanted, 20 + w / 2, W - 20 - w / 2)

        const already = container.alpha > 0.95 && Math.abs(container.x - station) < 1
        hideToken++
        FX.kill(scene, fx(balloon))
        balloon.setPosition(bx, TUCA.baseY + by).setVisible(true).setAlpha(1)
        speech.setText('')

        if (already) {
            await FX.to(scene, fx(balloon), { scale: 1.05 }, { duration: 120, yoyo: true, ease: 'Sine.easeOut' })
        } else {
            balloon.setScale(0.85)
            await FX.all(enter(), FX.to(scene, fx(balloon), { scale: 1 }, { duration: 300, ease: 'Back.easeOut' }))
        }

        balloonZone.setPosition(bx, TUCA.baseY + by).setSize(w, h)
        buttonZone.setPosition(bx, TUCA.baseY + by + buttonCy)
        balloonZone.input!.enabled = true
        buttonZone.input!.enabled = true

        const writer = FX.type(scene, speech, text, {
            delay: TYPE_MS,
            onChar: i => {
                if (i % 4 === 0) talkPulse()
            },
        })
        typing = writer
        await writer
        typing = undefined

        await new Promise<void>(resolve => {
            waiting = resolve
        })
        balloonZone.input!.enabled = false
        buttonZone.input!.enabled = false
    }

    const exit = async () => {
        hideBalloon()
        if (container.alpha < 0.05) return
        await FX.to(scene, fx(container), { alpha: 0, x: station + TUCA.offX }, { duration: 300 })
    }

    return {
        say: (text, pose = POSE.talk, label = 'Próximo') => speak(text, pose, label),

        async beat(text, pose = POSE.talk, label = 'Próximo') {
            await speak(text, pose, label)
            await exit()
        },

        async show(pose = POSE.calm) {
            setPose(pose)
            await enter()
        },

        hideBalloon,
        setPose,

        async pointAt(x) {
            setPose(POSE.point)
            sprite?.setFlipX(x < station)
            await FX.to(scene, fx(figure), { angle: x < station ? -4 : 4 }, { duration: 180, yoyo: true })
        },

        async moveTo(x) {
            const target = Phaser.Math.Clamp(x, 220, homeX)
            if (Math.abs(target - station) < 2) return
            if (container.alpha < 0.05) {
                station = target
                container.setX(target)
                return
            }
            const distance = Math.abs(target - station)
            const left = target < station
            station = target
            const duration = Phaser.Math.Clamp(Math.round(distance / 1.1), 260, 900)
            const steps = Math.max(1, Math.round(distance / 190))
            await FX.all(
                FX.to(scene, fx(container), { x: target }, { duration, ease: 'Sine.easeInOut' }),
                FX.to(
                    scene,
                    fx(figure),
                    { y: -12, angle: left ? -4 : 4 },
                    { duration: Math.round(duration / (steps * 2)), yoyo: true, repeat: steps - 1, ease: 'Sine.easeInOut' },
                ),
            )
            figure.setAngle(0).setY(0)
        },

        exit,

        destroy() {
            waiting?.()
            waiting = undefined
            typing = undefined
            balloonZone.destroy()
            buttonZone.destroy()
            balloon.destroy()
            container.destroy()
        },
    }
}
