import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BUTTONS, DEPTH, HEADLINE } from '../data/layout'
import { A, C, CSS, FONT } from '../data/theme'
import type { Headline } from '../types'
import { TEX } from './BootScene'

export interface Slip {
    show(headline: Headline): Promise<void>
    /** Pisca quando uma plaquinha sobe: é com a manchete que se compara. */
    pulse(): void
    /** Espalhou: vira avião e sai voando. */
    toPlane(): Promise<void>
    /** Segurou: vira bolinha e cai no cesto. */
    toBall(): Promise<void>
    shake(): Promise<void>
    destroy(): void
}

export function createSlip(scene: Phaser.Scene): Slip {
    const cx = HEADLINE.x + HEADLINE.w / 2
    const cy = HEADLINE.y + HEADLINE.h / 2
    const root = scene.add.container(cx, cy).setDepth(DEPTH.slip).setAlpha(0)

    // Papel de verdade: branco, com a borda de baixo RASGADA. É o que separa a
    // notícia dos balões de fala e das plaquinhas, que são caixas lisas.
    const paper = scene.add.graphics()
    const paint = () => {
        const w = HEADLINE.w
        const h = HEADLINE.h
        const teeth = 46
        const step = w / teeth

        paper.clear()
        paper.fillStyle(C.ink, A.shadow)
        paper.fillRect(-w / 2 + 6, -h / 2 + 8, w, h)
        paper.fillStyle(C.ink, 1)
        paper.fillRect(-w / 2, -h / 2, w, h + 6)
        paper.fillStyle(C.paper, 1)
        paper.fillRect(-w / 2 + 5, -h / 2 + 5, w - 10, h - 12)

        for (let i = 0; i < teeth; i++) {
            const x = -w / 2 + 5 + i * step
            const deep = i % 2 === 0 ? 0 : 9
            paper.fillStyle(C.paper, 1)
            paper.fillTriangle(x, h / 2 - 7, x + step, h / 2 - 7, x + step / 2, h / 2 - 7 + (9 - deep))
        }

        paper.fillStyle(C.band, 1)
        paper.fillRect(-w / 2 + 5, -h / 2 + 5, w - 10, 7)
    }
    paint()
    root.add(paper)

    // A etiqueta escrita. É a resposta literal para "o que é notícia aqui?", e
    // ela entra DEPOIS do papel assentar — a criança vê a etiqueta ser colada.
    const tagBox = scene.add.container(
        -HEADLINE.w / 2 - 10 + HEADLINE.tagW / 2,
        -HEADLINE.h / 2 - 18 + HEADLINE.tagH / 2,
    )
    const tag = scene.add.graphics()
    tag.fillStyle(C.ink, 1)
    tag.fillRoundedRect(-HEADLINE.tagW / 2, -HEADLINE.tagH / 2, HEADLINE.tagW, HEADLINE.tagH, 10)
    tag.fillStyle(C.band, 1)
    tag.fillRoundedRect(-HEADLINE.tagW / 2 + 4, -HEADLINE.tagH / 2 + 4, HEADLINE.tagW - 8, HEADLINE.tagH - 8, 7)
    tagBox.add(tag)

    const tagText = scene.add
        .text(0, 0, 'NOTÍCIA', {
            fontFamily: FONT.black,
            fontSize: '20px',
            color: CSS.white,
        })
        .setOrigin(0.5)
        .setResolution(2)
    tagText.setStroke(CSS.ink, 4)
    tagBox.add(tagText)
    tagBox.setScale(0)
    root.add(tagBox)

    const iconBack = scene.add.graphics()
    iconBack.fillStyle(C.sky, 1)
    iconBack.fillCircle(HEADLINE.iconCX - HEADLINE.w / 2, 0, HEADLINE.iconR)
    iconBack.lineStyle(4, C.ink, 1)
    iconBack.strokeCircle(HEADLINE.iconCX - HEADLINE.w / 2, 0, HEADLINE.iconR)
    root.add(iconBack)

    const icon = scene.textures.exists(TEX.icons)
        ? scene.add.sprite(HEADLINE.iconCX - HEADLINE.w / 2, 0, TEX.icons, 0)
        : undefined
    if (icon) {
        icon.setDisplaySize(HEADLINE.iconR * 1.7, HEADLINE.iconR * 1.7)
        root.add(icon)
    }

    const label = scene.add
        .text(HEADLINE.textX - HEADLINE.w / 2, 2, '', {
            fontFamily: FONT.black,
            fontSize: '44px',
            color: CSS.ink,
            wordWrap: { width: HEADLINE.wrap },
            lineSpacing: 2,
        })
        .setOrigin(0, 0.5)
        .setResolution(2)
    root.add(label)

    const reset = () => {
        root.setPosition(cx, cy)
        root.setScale(1)
        root.setAngle(0)
        root.setAlpha(0)
        tagBox.setScale(0)
    }

    return {
        /**
         * O papel vem DA MÃO DO ROBÔ, planando, e bate no balcão. Só depois de
         * assentar é que a etiqueta NOTÍCIA é colada nele, com um estalo — é o
         * momento em que a criança aprende o que aquele papel é.
         */
        show: async headline => {
            reset()
            label.setText(headline.text)
            icon?.setFrame(headline.icon)

            root.setPosition(cx + 520, cy - 150)
            root.setAngle(16)
            root.setScale(0.72)

            await FX.all(
                FX.to(scene, root, { x: cx, y: cy + 10, alpha: 1 }, { duration: 560, ease: 'Sine.easeOut' }),
                FX.to(scene, root, { angle: -3, scale: 1.04 }, { duration: 560 }),
            )
            await FX.to(scene, root, { y: cy, scale: 1, angle: -1.5 }, { duration: 260, ease: 'Back.easeOut' })
            await FX.wait(scene, 140)
            await FX.to(scene, tagBox, { scale: 1 }, { duration: 320, ease: 'Back.easeOut' })
        },

        pulse: () => {
            void FX.to(scene, root, { scale: 1.035 }, { duration: 120 })
                .then(() => FX.to(scene, root, { scale: 1 }, { duration: 220, ease: 'Back.easeOut' }))
        },

        // Sobe para o BAIRRO, não para o robô: a notícia boa foi publicada, e
        // quem perdeu a rodada foi ele. Um papel voando na direção do megafone
        // diria o contrário do que acabou de acontecer.
        toPlane: async () => {
            await FX.to(scene, root, { angle: 8, scale: 0.9 }, { duration: 200 })
            await FX.to(
                scene, root,
                { x: 300, y: -140, angle: -26, scale: 0.3, alpha: 0 },
                { duration: 760, ease: 'Sine.easeIn' },
            )
        },

        toBall: async () => {
            await FX.to(scene, root, { scale: 0.34, angle: 24 }, { duration: 300, ease: 'Back.easeIn' })
            await FX.to(
                scene, root,
                { x: BUTTONS.holdX + BUTTONS.w / 2, y: BUTTONS.y + BUTTONS.h + 30, angle: 220, alpha: 0 },
                { duration: 520, ease: 'Quad.easeIn' },
            )
        },

        shake: () => FX.shake(scene, root),

        destroy: () => root.destroy(true),
    }
}
