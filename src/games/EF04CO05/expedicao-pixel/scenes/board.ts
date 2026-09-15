import Phaser from 'phaser'
import { FX, type FxTarget } from '../../../../shared/effects/FX'
import { PROPS, SHEET } from '../data/art'
import { BOARD, BOARD_INNER, DEPTH } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  A PLACA DA FESTA — O ALVO E A PRÉVIA, LADO A LADO
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Dois círculos do mesmo tamanho, encostados: **PEDIDO** e **SUA LUZ**. Comparar
 * duas cores é a única coisa que a criança faz o tempo todo, e comparar exige
 * que as duas estejam no mesmo lugar — separadas por meia tela, ela compara de
 * memória, que é outra tarefa e bem mais difícil.
 *
 * O nome da cor pedida fica escrito embaixo do primeiro círculo. Cor sem nome
 * não serve para uma criança daltônica, e a placa é o lugar onde o nome cabe.
 */

export function createBoard(scene: Phaser.Scene) {
    const cx = BOARD.x + BOARD.w / 2
    const cy = BOARD.y + BOARD.h / 2

    const plank = scene.textures.exists(SHEET.props)
        ? scene.add.image(cx, cy, SHEET.props, PROPS.sign).setDisplaySize(BOARD.w, BOARD.h).setDepth(DEPTH.board)
        : undefined

    const wood = scene.add.graphics().setDepth(DEPTH.board)
    if (!plank) {
        wood.fillStyle(C.ink, 0.5)
        wood.fillRoundedRect(BOARD.x + 5, BOARD.y + 7, BOARD.w, BOARD.h, 16)
        wood.fillStyle(C.woodDeep, 1)
        wood.fillRoundedRect(BOARD.x, BOARD.y, BOARD.w, BOARD.h, 16)
        wood.fillStyle(C.wood, 1)
        wood.fillRoundedRect(BOARD.x + 12, BOARD.y + 12, BOARD.w - 24, BOARD.h - 24, 11)
    }

    const innerLeft = BOARD.x + BOARD.w * BOARD_INNER.left
    const innerRight = BOARD.x + BOARD.w * BOARD_INNER.right
    const innerTop = BOARD.y + BOARD.h * BOARD_INNER.top
    const innerBottom = BOARD.y + BOARD.h * BOARD_INNER.bottom

    const askX = innerLeft + (innerRight - innerLeft) * 0.27
    const mixX = innerLeft + (innerRight - innerLeft) * 0.75
    const discY = innerTop + 94
    const discR = 40

    const label = (x: number, text: string) =>
        scene.add
            .text(x, innerTop + 26, text, {
                fontFamily: FONT.black,
                fontSize: '20px',
                color: CSS.wood,
            })
            .setOrigin(0.5)
            .setResolution(2)
            .setDepth(DEPTH.board + 1)
            // contorno claro: a tábua entregue muda de tom, e sem halo o
            // rótulo some justamente na parte mais escura dela
            .setStroke('#f3e6cd', 5)

    const askLabel = label(askX, 'PEDIDO')
    const mixLabel = label(mixX, 'SUA LUZ')

    const discs = scene.add.graphics().setDepth(DEPTH.board + 1)

    const name = scene.add
        .text(askX, innerBottom - 8, '', {
            fontFamily: FONT.black,
            fontSize: '24px',
            color: CSS.wood,
        })
        .setOrigin(0.5)
        .setResolution(2)
        .setDepth(DEPTH.board + 1)

    const sign = scene.add
        .text((askX + mixX) / 2, discY, '=', {
            fontFamily: FONT.black,
            fontSize: '32px',
            color: CSS.wood,
        })
        .setOrigin(0.5)
        .setResolution(2)
        .setDepth(DEPTH.board + 1)

    let askColor = 0x000000
    let mixColor = 0x000000

    const paint = (bate: boolean) => {
        discs.clear()
        const disc = (x: number, color: number) => {
            discs.fillStyle(C.ink, 0.35)
            discs.fillCircle(x + 2, discY + 3, discR + 7)
            discs.fillStyle(0xf3e6cd, 1)
            discs.fillCircle(x, discY, discR + 6)
            discs.fillStyle(color, 1)
            discs.fillCircle(x, discY, discR)
            discs.fillStyle(C.white, 0.16)
            discs.fillEllipse(x - discR * 0.3, discY - discR * 0.38, discR * 0.9, discR * 0.45)
        }
        disc(askX, askColor)
        disc(mixX, mixColor)
        sign.setText(bate ? '=' : '≠')
        sign.setColor(bate ? CSS.g : CSS.wood)
    }

    const pieces = [plank, wood, discs, askLabel, mixLabel, name, sign].filter(Boolean) as FxTarget[]

    return {
        hide() {
            return FX.to(scene, pieces, { alpha: 0 }, { duration: 240, ease: 'Sine.easeIn' })
        },

        show() {
            return FX.to(scene, pieces, { alpha: 1 }, { duration: 280, ease: 'Sine.easeOut' })
        },

        setAsk(color: number, nome: string) {
            askColor = color
            name.setText(nome)
            paint(askColor === mixColor)
        },

        setMix(color: number) {
            mixColor = color
            paint(askColor === mixColor)
        },

        /** Quando bate, os dois círculos pulsam juntos: a confirmação é visual. */
        async celebrate() {
            await FX.to(scene, discs, { alpha: 0.45 }, { duration: 130, yoyo: true, repeat: 1 })
        },

        bounds() {
            return { x: cx, y: cy, w: BOARD.w + 26, h: BOARD.h + 26 }
        },

        askBounds() {
            return { x: askX, y: discY, w: discR * 2 + 30, h: discR * 2 + 30 }
        },

        destroy() {
            scene.tweens.killTweensOf(discs)
            plank?.destroy()
            wood.destroy()
            discs.destroy()
            askLabel.destroy()
            mixLabel.destroy()
            name.destroy()
            sign.destroy()
        },
    }
}

export type Board = ReturnType<typeof createBoard>
