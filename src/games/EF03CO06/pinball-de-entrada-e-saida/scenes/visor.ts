import Phaser from 'phaser'
import { FX, type Typewriter } from '../../../../shared/effects/FX'
import { DEPTH, VISOR } from '../data/layout'
import { C, FONT } from '../data/theme'
import { VISOR_HEAD } from '../data/words'

type Tone = 'ask' | 'hint' | 'oops' | 'yay'

const HEAD_COLOR: Record<Tone, string> = { ask: '#9be7d4', hint: '#ffe27a', oops: '#ffb08a', yay: '#9be7d4' }

export interface Visor {
    /** troca a mensagem do visor; o pedido fica guardado para voltar depois da dica */
    write(text: string, tone?: Tone): Promise<void>
    restore(): void
    off(): void
    rect(): { x: number; y: number; w: number; h: number }
    destroy(): void
}

export function createVisor(scene: Phaser.Scene): Visor {
    const { w, h } = VISOR
    const frame = scene.add.graphics()
    frame.fillStyle(C.shadow, 0.2)
    frame.fillRoundedRect(-w / 2 + 5, -h / 2 + 8, w, h, 26)
    frame.fillStyle(C.rim, 1)
    frame.fillRoundedRect(-w / 2, -h / 2, w, h, 26)
    frame.fillStyle(C.rimLight, 1)
    frame.fillRoundedRect(-w / 2 + 6, -h / 2 + 5, w - 12, 14, 8)
    frame.lineStyle(5, C.ink, 1)
    frame.strokeRoundedRect(-w / 2, -h / 2, w, h, 26)
    frame.fillStyle(C.screenOff, 1)
    frame.fillRoundedRect(-w / 2 + 14, -h / 2 + 14, w - 28, h - 28, 16)
    ;[-1, 1].forEach(s => {
        frame.fillStyle(C.sling, 1)
        frame.fillCircle(s * (w / 2 - 4), 0, 11)
        frame.lineStyle(3, C.ink, 1)
        frame.strokeCircle(s * (w / 2 - 4), 0, 11)
    })

    const glow = scene.add.rectangle(0, 0, w - 28, h - 28, 0x3a3478, 1).setAlpha(0)
    const head = scene.add
        .text(0, -h / 2 + 25, '', { fontFamily: FONT.black, fontSize: '16px', color: HEAD_COLOR.ask })
        .setOrigin(0.5)
        .setResolution(2)
    const line = scene.add
        .text(0, 12, '', { fontFamily: FONT.black, fontSize: '30px', color: '#ffffff', align: 'center' })
        .setOrigin(0.5)
        .setResolution(2)
    const box = scene.add.container(VISOR.x, VISOR.y, [frame, glow, head, line]).setDepth(DEPTH.visor)

    let typing: Typewriter | undefined
    let saved = ''

    const show = (text: string, tone: Tone) => {
        typing?.skip()
        head.setText(VISOR_HEAD[tone]).setColor(HEAD_COLOR[tone])
        line.setScale(1).setFontSize(30).setWordWrapWidth(null).setText(text)
        if (line.width > VISOR.textW) line.setFontSize(25).setWordWrapWidth(VISOR.textW)
        if (line.width > VISOR.textW) line.setScale(VISOR.textW / line.width)
        line.setText('')
        glow.setAlpha(1)
        void FX.to(scene, glow, { alpha: 0 }, { duration: 420 })
        const writer = FX.type(scene, line, text, { delay: 22 })
        typing = writer
        return writer
    }

    return {
        async write(text, tone = 'ask') {
            if (tone === 'ask') saved = text
            await show(text, tone)
        },
        restore() {
            if (saved) void show(saved, 'ask')
        },
        off() {
            typing?.skip()
            saved = ''
            head.setText('')
            line.setText('')
        },
        rect() {
            return { x: VISOR.x, y: VISOR.y, w: w + 24, h: h + 20 }
        },
        destroy() {
            typing?.skip()
            box.destroy()
        },
    }
}
