import Phaser from 'phaser'
import { FX, type FxTarget } from '../../../../shared/effects/FX'
import { PROPS, SHEET } from '../data/art'
import { CHANNEL_NAME, CHANNELS, digitOf } from '../data/levels'
import { DEPTH, LAUNCH, ROCKET, TAPS } from '../data/layout'
import { C, CHANNEL_COLOR, CSS, FONT } from '../data/theme'
import type { Channel, Mix, Step, TapSteps } from '../types'

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  A MESA: TRÊS TORNEIRAS, O FOGUETE E O BOTÃO
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Um controle só no jogo inteiro: tocar na torneira muda o estado dela. No nível
 * 3 ela ganha mais paradas — não é interface nova, é a mesma com mais posições.
 *
 * O bulbo da folha é CINZA e o corpo do foguete também: a cor entra por cima, em
 * `Graphics` aditivo, sempre vinda de `toColor`. Uma peça já pintada obrigaria a
 * arte a concordar com o código, e no dia em que discordassem a criança veria
 * uma cor que não é a que ela montou.
 *
 * As zonas de toque são objetos soltos de cena, criados na posição definitiva: o
 * desenho encolhe no gesto, e uma zona dentro de um container que anima seria
 * comida pela animação.
 */

const CHANNEL_CSS: Record<Channel, string> = { r: CSS.r, g: CSS.g, b: CSS.b }

export interface ConsoleOptions {
    steps: TapSteps
    onTap: (channel: Channel) => void
    onLaunch: () => void
}

export function createConsole(scene: Phaser.Scene, options: ConsoleOptions) {
    const hasArt = scene.textures.exists(SHEET.props)
    const zones: Phaser.GameObjects.Zone[] = []
    /*
     * Tudo que sai de cena no lançamento.
     *
     * A mesa não é um container único (as zonas de toque precisam ser objetos
     * soltos, e os rótulos vivem fora dos containers das peças), então a lista é
     * o jeito de animar as dez peças como uma coisa só.
     */
    const pieces: Phaser.GameObjects.GameObject[] = []
    let enabled = true
    let mix: Mix = { r: 0, g: 0, b: 0 }

    /* ────────────────────────────────────────────────────── as torneiras */

    const taps = CHANNELS.map((channel, i) => {
        const cx = TAPS.cx[i]
        const container = scene.add.container(cx, TAPS.cy).setDepth(DEPTH.console)

        const body = scene.add.graphics()
        const image = hasArt
            ? scene.add.image(0, 0, SHEET.props, PROPS.tapOff).setDisplaySize(TAPS.size, TAPS.size)
            : undefined
        const glow = scene.add.graphics().setBlendMode(Phaser.BlendModes.ADD)
        container.add(image ? [body, image, glow] : [body, glow])

        const label = scene.add
            .text(cx, TAPS.labelY, CHANNEL_NAME[channel], {
                fontFamily: FONT.black,
                fontSize: '26px',
                color: CHANNEL_CSS[channel],
            })
            .setOrigin(0.5)
            .setResolution(2)
            .setDepth(DEPTH.console)
        label.setStroke(CSS.ink, 6)

        const digit = scene.add
            .text(cx, TAPS.valueY, '0', {
                fontFamily: FONT.black,
                fontSize: '40px',
                color: CSS.dim,
            })
            .setOrigin(0.5)
            .setResolution(2)
            .setDepth(DEPTH.console)
        digit.setStroke(CSS.ink, 7)

        /** O bulbo fica no alto da peça; o glow tem de cair em cima dele. */
        const bulbY = -TAPS.size * 0.3
        const bulbR = TAPS.size * 0.17

        const paint = (value: Step) => {
            const lit = value / 3

            body.clear()
            if (image) {
                image.setFrame(value > 0 ? PROPS.tapOn : PROPS.tapOff)
            } else {
                body.fillStyle(C.woodDeep, 1)
                body.fillRoundedRect(-52, 28, 104, 34, 8)
                body.fillStyle(C.brassDeep, 1)
                body.fillRoundedRect(-20, -18, 40, 50, 10)
                body.fillStyle(C.brass, 1)
                body.fillCircle(-38, 8, 20)
                body.fillStyle(value > 0 ? C.white : C.bulb, 0.45 + lit * 0.55)
                body.fillCircle(0, bulbY, bulbR + 6)
            }

            glow.clear()
            if (lit > 0) {
                glow.fillStyle(CHANNEL_COLOR[channel], 0.2 * lit)
                glow.fillCircle(0, bulbY, bulbR * 3.1)
                glow.fillStyle(CHANNEL_COLOR[channel], 0.62 * lit)
                glow.fillCircle(0, bulbY, bulbR * 1.35)
            }

            digit.setText(digitOf(value, options.steps))
            digit.setColor(lit > 0 ? CHANNEL_CSS[channel] : CSS.dim)
        }

        const zone = scene.add
            .zone(cx, TAPS.cy, TAPS.hitW, TAPS.hitH)
            .setOrigin(0.5)
            .setDepth(DEPTH.console + 1)
            .setInteractive({ useHandCursor: true })
        zone.on('pointerdown', () => {
            if (!enabled) return
            void FX.press(scene, container)
            options.onTap(channel)
        })
        zones.push(zone)

        paint(0)
        pieces.push(container, label, digit)
        return { channel, container, label, digit, paint }
    })

    /* ──────────────────────────────────────────── o foguete e a rampa */

    const rocket = scene.add.container(ROCKET.cx, ROCKET.cy).setDepth(DEPTH.console)
    const rocketArt = hasArt
        ? scene.add.image(0, 0, SHEET.props, PROPS.rocketReady).setDisplaySize(ROCKET.size, ROCKET.size)
        : undefined
    const rocketBody = scene.add.graphics()
    const rocketGlow = scene.add.graphics().setBlendMode(Phaser.BlendModes.ADD)
    rocket.add(rocketArt ? [rocketBody, rocketArt, rocketGlow] : [rocketBody, rocketGlow])

    const paintRocket = (color: number, lit: number) => {
        rocketBody.clear()
        if (!rocketArt) {
            rocketBody.fillStyle(C.woodDeep, 1)
            rocketBody.fillRoundedRect(-48, 52, 96, 22, 6)
            rocketBody.fillStyle(C.bulb, 1)
            rocketBody.fillRoundedRect(-16, -62, 32, 106, 14)
            rocketBody.fillStyle(C.brass, 1)
            rocketBody.fillTriangle(-16, -58, 16, -58, 0, -92)
        }
        rocketGlow.clear()
        if (lit <= 0) return
        rocketGlow.fillStyle(color, 0.16 * lit)
        rocketGlow.fillCircle(6, -18, 72)
        rocketGlow.fillStyle(color, 0.5 * lit)
        rocketGlow.fillEllipse(6, -18, 46, 92)
    }
    paintRocket(0x000000, 0)
    pieces.push(rocket)

    /* ─────────────────────────────────────────────────────── o botão */

    const button = scene.add.container(LAUNCH.cx, LAUNCH.cy).setDepth(DEPTH.console)
    const buttonArt = hasArt
        ? scene.add.image(0, 0, SHEET.props, PROPS.buttonUp).setDisplaySize(LAUNCH.size, LAUNCH.size)
        : undefined
    const buttonBody = scene.add.graphics()
    button.add(buttonArt ? [buttonBody, buttonArt] : [buttonBody])

    const paintButton = (down: boolean) => {
        buttonBody.clear()
        if (buttonArt) {
            buttonArt.setFrame(down ? PROPS.buttonDown : PROPS.buttonUp)
            return
        }
        buttonBody.fillStyle(C.brassDeep, 1)
        buttonBody.fillCircle(0, 8, 68)
        buttonBody.fillStyle(C.brass, 1)
        buttonBody.fillCircle(0, 2, 64)
        buttonBody.fillStyle(0xc4342c, 1)
        buttonBody.fillCircle(0, down ? 6 : -4, 46)
        buttonBody.fillStyle(0xe5584f, 1)
        buttonBody.fillCircle(0, down ? 4 : -8, 42)
    }
    paintButton(false)

    const buttonLabel = scene.add
        .text(LAUNCH.cx, LAUNCH.labelY, 'LANÇAR', {
            fontFamily: FONT.black,
            fontSize: '30px',
            color: CSS.paper,
        })
        .setOrigin(0.5)
        .setResolution(2)
        .setDepth(DEPTH.console)
    buttonLabel.setStroke(CSS.ink, 7)
    pieces.push(button, buttonLabel)

    /** O cadeado da TRAVA mora no botão: quem recusou foi ele. */
    const lock = scene.add
        .graphics({ x: LAUNCH.cx + 54, y: LAUNCH.cy - 56 })
        .setDepth(DEPTH.console + 2)
        .setVisible(false)
    lock.fillStyle(C.ink, 0.5)
    lock.fillRoundedRect(-30, -18, 60, 54, 10)
    lock.fillStyle(C.trava, 1)
    lock.fillRoundedRect(-26, -14, 52, 46, 9)
    lock.fillStyle(C.ink, 1)
    lock.fillCircle(0, 6, 8)
    lock.lineStyle(9, C.trava, 1)
    lock.beginPath()
    lock.arc(0, -16, 16, Math.PI, 0)
    lock.strokePath()

    const buttonZone = scene.add
        .zone(LAUNCH.cx, LAUNCH.cy + 18, LAUNCH.hitW, LAUNCH.hitH)
        .setOrigin(0.5)
        .setDepth(DEPTH.console + 1)
        .setInteractive({ useHandCursor: true })
    buttonZone.on('pointerdown', () => {
        if (!enabled) return
        options.onLaunch()
    })
    zones.push(buttonZone)

    const breathing = scene.tweens.add({
        targets: button,
        scale: 1.05,
        duration: 1300,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
    })

    return {
        /** A mesa sai de cena: durante o voo não há nada para decidir. */
        hide() {
            return FX.to(scene, pieces as FxTarget[], { alpha: 0 }, { duration: 240, ease: 'Sine.easeIn' })
        },

        show() {
            return FX.to(scene, pieces as FxTarget[], { alpha: 1 }, { duration: 280, ease: 'Sine.easeOut' })
        },

        setMix(next: Mix, color: number) {
            mix = next
            taps.forEach(tap => tap.paint(mix[tap.channel]))
            const lit = Math.max(mix.r, mix.g, mix.b) / 3
            paintRocket(color, lit)
        },

        setEnabled(value: boolean) {
            enabled = value
            zones.forEach(zone => {
                if (zone.input) zone.input.enabled = value
            })
            taps.forEach(tap => tap.container.setAlpha(value ? 1 : 0.75))
            button.setAlpha(value ? 1 : 0.75)
        },

        /** O foguete sai da rampa: some daqui e quem assume é o céu. */
        async fire() {
            breathing.pause()
            paintButton(true)
            await FX.wait(scene, 160)
            paintButton(false)
            breathing.resume()
            rocket.setVisible(false)
        },

        reload() {
            rocket.setVisible(true)
            void FX.popIn(scene, rocket, { from: 0.7, duration: 320 })
        },

        async hint(channel: Channel) {
            const tap = taps.find(t => t.channel === channel)
            if (!tap) return
            await FX.to(scene, tap.container, { scale: 1.14 }, {
                duration: 250,
                yoyo: true,
                repeat: 3,
                ease: 'Sine.easeInOut',
            })
            tap.container.setScale(1)
        },

        showLock() {
            lock.setVisible(true).setAlpha(0).setScale(0.7)
            return FX.to(scene, lock, { alpha: 1, scale: 1 }, { duration: 190, ease: 'Back.easeOut' })
        },

        hideLock() {
            lock.setVisible(false)
        },

        rocketNose() {
            return { x: ROCKET.cx + 4, y: ROCKET.cy - ROCKET.size * 0.28 }
        },

        tapBounds(channel: Channel) {
            const i = CHANNELS.indexOf(channel)
            return { x: TAPS.cx[i], y: TAPS.cy, w: TAPS.hitW, h: TAPS.hitH }
        },

        allTapsBounds() {
            return { x: (TAPS.cx[0] + TAPS.cx[2]) / 2, y: TAPS.cy - 6, w: 580, h: 250 }
        },

        launchBounds() {
            return { x: LAUNCH.cx, y: LAUNCH.cy + 18, w: LAUNCH.hitW + 20, h: LAUNCH.hitH + 20 }
        },

        destroy() {
            breathing.stop()
            zones.forEach(zone => zone.destroy())
            taps.forEach(tap => {
                scene.tweens.killTweensOf(tap.container)
                tap.container.destroy(true)
                tap.label.destroy()
                tap.digit.destroy()
            })
            scene.tweens.killTweensOf(rocket)
            scene.tweens.killTweensOf(button)
            rocket.destroy(true)
            button.destroy(true)
            buttonLabel.destroy()
            lock.destroy()
        },
    }
}

export type Console = ReturnType<typeof createConsole>
