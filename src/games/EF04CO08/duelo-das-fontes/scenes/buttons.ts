import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BUTTONS, DEPTH, H } from '../data/layout'
import { A, C, CSS, FONT } from '../data/theme'
import type { Choice } from '../types'
import { MARK, TEX } from './BootScene'

export interface ChoiceButton {
    rise(delay: number): Promise<void>
    /** Volta para fora da tela, pronto para subir de novo na rodada seguinte. */
    lower(): void
    press(): Promise<void>
    setEnabled(on: boolean): void
    hide(): Promise<void>
    destroy(): void
}

export interface ChoiceButtonOptions {
    choice: Choice
    x: number
    onPress(choice: Choice): void
}

/**
 * Os botões NÃO EXISTEM enquanto não houver o que decidir: eles sobem quando a
 * primeira plaquinha vira. Um botão grande e brilhante que não faz nada é a
 * pior coisa que pode estar na tela de uma criança de 9 anos.
 *
 * Duas silhuetas: ESPALHAR é um avião de papel saindo, SEGURAR é uma mão
 * fechada segurando o papel.
 */
export function createChoiceButton(scene: Phaser.Scene, options: ChoiceButtonOptions): ChoiceButton {
    const w = BUTTONS.w
    const h = BUTTONS.h
    const cx = options.x + w / 2
    const cy = BUTTONS.y + h / 2
    const spread = options.choice === 'spread'
    const hidden = H + h

    const root = scene.add.container(cx, hidden).setDepth(DEPTH.buttons)

    const body = scene.add.graphics()
    const glyph = scene.add.graphics()
    root.add(body)
    root.add(glyph)

    // O ícone é a MINIATURA do que vai acontecer com o papel: avião que sai
    // voando, ou bolinha amassada. Enquanto o PNG não existe, o `glyph` desenha
    // as mesmas duas formas em Graphics.
    const art = scene.textures.exists(TEX.marks)
        ? scene.add.sprite(-124, 0, TEX.marks, spread ? MARK.plane : MARK.ball)
        : undefined
    if (art) {
        art.setDisplaySize(96, 96)
        root.add(art)
    }

    // "PODE" e "NÃO PODE" respondem, palavra por palavra, a pergunta que está
    // escrita na faixa. "Espalhar" e "segurar" eram dois verbos que a criança
    // tinha de traduzir sozinha antes de decidir.
    const label = scene.add
        .text(30, 30, spread ? 'PODE' : 'NÃO PODE', {
            fontFamily: FONT.black,
            fontSize: spread ? '40px' : '34px',
            color: CSS.white,
        })
        .setOrigin(0.5)
        .setResolution(2)
    label.setStroke(CSS.ink, 6)
    root.add(label)

    let enabled = false

    const paint = () => {
        const tone = spread ? C.spread : C.hold
        const deep = spread ? C.spreadDeep : C.holdDeep

        body.clear()
        body.fillStyle(C.ink, A.shadow)
        body.fillRoundedRect(-w / 2 + 6, -h / 2 + 8, w, h, 22)
        body.fillStyle(C.ink, 1)
        body.fillRoundedRect(-w / 2, -h / 2, w, h, 22)
        body.fillStyle(enabled ? tone : deep, 1)
        body.fillRoundedRect(-w / 2 + 6, -h / 2 + 6, w - 12, h - 12, 18)
        body.fillStyle(C.white, enabled ? 0.2 : 0.08)
        body.fillRoundedRect(-w / 2 + 14, -h / 2 + 14, w - 28, 22, 11)

        art?.setAlpha(enabled ? 1 : 0.55)
        label.setAlpha(enabled ? 1 : 0.7)

        glyph.clear()
        if (art) return

        glyph.fillStyle(C.white, enabled ? 1 : 0.5)
        if (spread) {
            glyph.fillTriangle(-150, -22, -66, -4, -150, 22)
            glyph.fillStyle(C.ink, enabled ? 0.55 : 0.25)
            glyph.fillTriangle(-150, -22, -104, 2, -150, 22)
        } else {
            glyph.fillRoundedRect(-160, -30, 52, 40, 8)
            glyph.fillStyle(C.white, enabled ? 1 : 0.5)
            glyph.fillRoundedRect(-166, -2, 72, 34, 14)
            glyph.fillStyle(C.ink, enabled ? 0.5 : 0.25)
            glyph.fillRoundedRect(-160, 6, 60, 6, 3)
        }
    }
    paint()

    const zone = scene.add
        .zone(cx, cy, w, h)
        .setOrigin(0.5)
        .setDepth(DEPTH.buttons + 1)
        .setInteractive({ useHandCursor: true })
    if (zone.input) zone.input.enabled = false

    zone.on('pointerdown', () => {
        if (!enabled) return
        options.onPress(options.choice)
    })

    return {
        lower: () => {
            root.setY(hidden).setAlpha(1)
        },

        rise: async delay => {
            root.setAlpha(1)
            await FX.wait(scene, delay)
            await FX.to(scene, root, { y: cy }, { duration: 460, ease: 'Back.easeOut' })
        },
        press: () => FX.press(scene, root),
        setEnabled: on => {
            enabled = on
            if (zone.input) zone.input.enabled = on
            paint()
        },
        hide: () => FX.to(scene, root, { y: hidden, alpha: 0 }, { duration: 320 }),
        destroy: () => {
            zone.destroy()
            root.destroy(true)
        },
    }
}
