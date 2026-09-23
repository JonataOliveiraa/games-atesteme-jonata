import Phaser from 'phaser'
import { FX, Ease, type Typewriter } from '../../../../shared/effects/FX'
import { C, FONT, hex } from '../data/theme'

/**
 * ══════════════════════════════════════════════════════════════════════
 *  A FALA DO PORTÃO
 * ══════════════════════════════════════════════════════════════════════
 *
 * No portão as duas pessoas PEDEM o cartão, e é pela fala que a criança
 * descobre quem é quem: quem cuida chama pelo nome da relação ("Oi,
 * filho!"), quem não cuida só quer o cartão. O escudo sobre a cabeça, que
 * vinha antes, entregava a resposta antes de alguém abrir a boca.
 *
 * Então a fala segue a regra do catálogo: sai letra a letra e ESPERA o
 * botão, que mora dentro do balão. Um toque no balão completa a frase para
 * quem lê rápido. Depois do botão o balão fica — só sem o botão —, e a
 * criança relê as duas falas na hora de escolher.
 *
 * As zonas de toque são soltas na cena e só ligam depois de o balão
 * terminar de entrar: ele cresce com `Back`, e uma zona interna comeria o
 * toque na margem.
 */
const TALK = {
    /* Largo o bastante para "Que cartão lindo! Me dá?" caber numa linha — em
     * 380 o "dá?" caía sozinho embaixo. Mais que isso encosta na pílula. */
    maxW: 420,
    minW: 250,
    pad: 20,
    /** Altura do rabicho: a ponta dele é a origem do balão, sobre a cabeça. */
    tail: 22,
    radius: 24,
    font: '28px',
    btnW: 190,
    btnH: 52,
    gap: 14,
}

export interface Talk {
    readonly root: Phaser.GameObjects.Container
    /** Escreve a fala e espera o botão. Resolve no toque (ou no `destroy`). */
    play(button: string): Promise<void>
    destroy(): void
}

export function createTalk(
    scene: Phaser.Scene,
    x: number,
    tipY: number,
    line: string,
    depth = 48,
): Talk {
    const root = scene.add.container(x, tipY).setDepth(depth).setAlpha(0)
    const bg = scene.add.graphics()
    const text = scene.add.text(0, 0, line, {
        fontFamily: FONT.black,
        fontSize: TALK.font,
        color: hex(C.ink),
        align: 'center',
        wordWrap: { width: TALK.maxW - TALK.pad * 2 },
        lineSpacing: 2,
    }).setOrigin(0.5, 0).setResolution(2)

    const button = scene.add.container(0, 0).setAlpha(0)
    const buttonBg = scene.add.graphics()
    const buttonText = scene.add.text(0, -2, '', {
        fontFamily: FONT.black, fontSize: '24px', color: hex(C.white),
    }).setOrigin(0.5).setResolution(2)
    buttonText.setStroke(hex(C.ink), 4)
    button.add([buttonBg, buttonText])
    root.add([bg, text, button])

    // Medido com a frase inteira, antes de apagá-la: o balão não cresce
    // enquanto a máquina escreve.
    const w = Phaser.Math.Clamp(text.width + TALK.pad * 2, TALK.minW, TALK.maxW)
    const textH = text.height

    const skipZone = scene.add.zone(x, tipY, w, 10).setDepth(depth + 20)
    const buttonZone = scene.add.zone(x, tipY, TALK.btnW + 24, TALK.btnH + 18).setDepth(depth + 21)

    let writer: Typewriter | null = null
    let release: (() => void) | null = null
    let dead = false

    function paint(withButton: boolean) {
        const h = TALK.pad + textH + (withButton ? TALK.gap + TALK.btnH : 0) + TALK.pad
        const bottom = -TALK.tail
        const top = bottom - h

        bg.clear()
        bg.fillStyle(C.shadow, 0.2)
        bg.fillRoundedRect(-w / 2 + 4, top + 7, w, h, TALK.radius)
        bg.fillStyle(C.cream, 1)
        bg.fillRoundedRect(-w / 2, top, w, h, TALK.radius)
        bg.fillStyle(C.white, 0.5)
        bg.fillRoundedRect(-w / 2 + 14, top + 9, w - 28, 12, 6)
        bg.lineStyle(5, C.ink, 0.9)
        bg.strokeRoundedRect(-w / 2, top, w, h, TALK.radius)

        // o rabicho aponta para quem fala, logo abaixo
        bg.fillStyle(C.cream, 1)
        bg.fillTriangle(-16, bottom - 4, 16, bottom - 4, 0, 0)
        bg.lineStyle(5, C.ink, 0.9)
        bg.lineBetween(-16, bottom - 2, 0, 0)
        bg.lineBetween(16, bottom - 2, 0, 0)

        text.setPosition(0, top + TALK.pad)
        button.setPosition(0, bottom - TALK.pad - TALK.btnH / 2)

        skipZone.setPosition(x, tipY + top + h / 2).setSize(w, h)
        buttonZone.setPosition(x, tipY + button.y)
    }

    function paintButton(label: string) {
        buttonText.setText(label)
        const { btnW: bw, btnH: bh } = TALK
        buttonBg.clear()
        buttonBg.fillStyle(C.ink, 1)
        buttonBg.fillRoundedRect(-bw / 2, -bh / 2 + 5, bw, bh, bh / 2)
        buttonBg.fillStyle(C.shirt, 1)
        buttonBg.fillRoundedRect(-bw / 2, -bh / 2, bw, bh, bh / 2)
        buttonBg.fillStyle(C.white, 0.3)
        buttonBg.fillRoundedRect(-bw / 2 + 18, -bh / 2 + 8, bw - 36, 10, 5)
        buttonBg.lineStyle(4, C.ink, 1)
        buttonBg.strokeRoundedRect(-bw / 2, -bh / 2, bw, bh, bh / 2)
    }

    skipZone.on('pointerdown', () => writer?.skip())
    buttonZone.on('pointerdown', () => {
        const done = release
        if (!done) return
        release = null
        buttonZone.disableInteractive()
        // um toque durante a entrada do botão deixaria o tween terminar depois
        FX.kill(scene, button)
        button.setAlpha(1)
        void FX.to(scene, button, { scale: 0.9 }, { duration: 70, yoyo: true })
        done()
    })

    return {
        root,

        async play(label: string) {
            paint(true)
            text.setText('')
            root.setScale(0.8)
            await FX.to(scene, root, { alpha: 1, scale: 1 }, { duration: 240, ease: Ease.back(2) })
            if (dead) return

            skipZone.setInteractive()
            writer = FX.type(scene, text, line, { delay: 32 })
            await writer
            writer = null
            if (dead) return
            skipZone.disableInteractive()

            paintButton(label)
            button.setScale(0.6)
            void FX.to(scene, button, { alpha: 1, scale: 1 }, { duration: 260, ease: Ease.back(2.4) })

            await new Promise<void>(resolve => {
                release = resolve
                buttonZone.setInteractive({ useHandCursor: true })
            })
            if (dead) return

            await FX.wait(scene, 140)
            if (dead) return
            FX.kill(scene, button)
            button.setAlpha(0)
            paint(false)
        },

        destroy() {
            if (dead) return
            dead = true
            // solta quem estiver esperando: sem isso a promessa fica presa
            release?.()
            release = null
            FX.kill(scene, [root, button])
            skipZone.destroy()
            buttonZone.destroy()
            root.destroy(true)
        },
    }
}
