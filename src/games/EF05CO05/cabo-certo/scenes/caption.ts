import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { CAPTION, DEPTH } from '../data/layout'
import { C, CSS, FONT, SIZE, inkOn } from '../data/theme'

/**
 * A legenda da demonstração: uma ou duas palavras grandes no alto da janela
 * ("PROCESSADOR", "ENTRA", "SUA VEZ!"). Ela é o texto que sobrou do tutorial.
 */
export interface Caption {
    /** `grow`: a legenda só ganhou palavra nova (o resumo), então ela não salta de novo. */
    say(text: string, tone?: number, grow?: boolean): void
    hide(): void
    /** Some devagar, em vez de sumir de uma vez. */
    fade(): Promise<void>
    /** A altura da legenda: logo abaixo do cabeçalho, ou no lugar dele quando ele sobe. */
    setY(y: number): void
    destroy(): void
}

export function createCaption(scene: Phaser.Scene): Caption {
    const g = scene.add.graphics()
    const label = scene.add
        .text(0, 0, '', { fontFamily: FONT.black, fontSize: `${SIZE.caption}px`, color: CSS.ink, align: 'center' })
        .setOrigin(0.5)
        .setResolution(2)
    const box = scene.add.container(CAPTION.x, CAPTION.y, [g, label]).setDepth(DEPTH.banner).setVisible(false)

    const hide = () => {
        scene.tweens.killTweensOf(box)
        box.setVisible(false)
    }

    return {
        say(text, tone = C.white, grow = false) {
            const was = box.visible
            hide()
            label.setText(text).setColor(inkOn(tone))
            const w = label.width + 70
            const h = label.height + 26
            g.clear()
            g.fillStyle(C.shadow, 0.22)
            g.fillRoundedRect(-w / 2 + 4, -h / 2 + 7, w, h, h / 2)
            g.fillStyle(tone, 1)
            g.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
            box.setVisible(true).setAlpha(1).setScale(1)
            if (grow && was) void FX.press(scene, box, 1.06)
            else void FX.popIn(scene, box, { from: 0.5, duration: 340 })
        },
        hide,
        async fade() {
            if (!box.visible) return
            scene.tweens.killTweensOf(box)
            await FX.to(scene, box, { alpha: 0, scale: 0.92 }, { duration: 220 })
            box.setVisible(false)
        },
        setY(y) {
            box.setY(y)
        },
        destroy() {
            hide()
            box.destroy()
        },
    }
}
