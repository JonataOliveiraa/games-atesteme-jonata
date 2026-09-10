import Phaser from 'phaser'
import { C, CSS, FONT } from '../data/theme'
import type { Datum } from '../types'

export interface WordSize {
    w: number
    h: number
    icon: number
    font: string
}

export interface WordArt {
    root: Phaser.GameObjects.Container
    /** Repinta a moldura: a ficha muda de dono (bolsa, encaixe, trava). */
    paint: (border: number, face: number) => void
}

/**
 * A palavra que sai da pedra. É a MESMA peça na caverna e no altar — o dado
 * que caiu do cristal é o dado que a criança vai relacionar, e trocar de
 * desenho no meio do caminho quebraria essa continuidade.
 */
export function createWordArt(
    scene: Phaser.Scene,
    datum: Datum,
    sheet: string,
    size: WordSize,
): WordArt {
    const root = scene.add.container(0, 0)
    const g = scene.add.graphics()

    const paint = (border: number, face: number) => {
        const { w, h } = size
        g.clear()
        g.fillStyle(C.ink, 0.28)
        g.fillRoundedRect(-w / 2 + 4, -h / 2 + 7, w, h, 18)
        g.fillStyle(border, 1)
        g.fillRoundedRect(-w / 2, -h / 2, w, h, 18)
        g.fillStyle(face, 1)
        g.fillRoundedRect(-w / 2 + 6, -h / 2 + 6, w - 12, h - 12, 13)
        g.fillStyle(C.white, 0.6)
        g.fillRoundedRect(-w / 2 + 16, -h / 2 + 12, w - 32, 12, 6)
    }
    paint(C.ink, C.panel)

    root.add(g)

    // Sem a folha do nível, a palavra continua legível: o rótulo ocupa a ficha
    // inteira em vez de deixar um buraco onde o pictograma entraria.
    const hasIcon = scene.textures.exists(sheet)
    if (hasIcon) {
        root.add(
            scene.add
                .image(0, -size.h * 0.17, sheet, datum.frame)
                .setDisplaySize(size.icon, size.icon),
        )
    }

    root.add(
        scene.add
            .text(0, hasIcon ? size.h * 0.25 : 0, datum.label, {
                fontFamily: FONT.black,
                fontSize: hasIcon ? size.font : `${Math.round(parseInt(size.font, 10) * 1.25)}px`,
                color: CSS.ink,
                align: 'center',
                wordWrap: { width: size.w - 24 },
            })
            .setOrigin(0.5)
            .setResolution(2),
    )

    return { root, paint }
}
