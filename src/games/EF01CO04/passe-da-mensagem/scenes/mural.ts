import Phaser from 'phaser'
import { Ease, FX, type FxTarget } from '../../../../shared/effects/FX'
import { C, CSS, FONT, LANGUAGE_COLOR, SIZE } from '../data/theme'
import { DEPTH, H, MURAL, W } from '../data/layout'
import { createMessageCard } from './cards'
import type { Language, SubjectDef } from '../types'

const fx = (o: unknown) => o as unknown as FxTarget

export interface Delivered {
    subject: SubjectDef
    chain: Language[]
}

/**
 * ══════════════════════════════════════════════════════════════════════
 *  O MURAL — A INFORMAÇÃO GUARDADA
 * ══════════════════════════════════════════════════════════════════════
 *
 * Não é tela de comemoração. É a única parte do jogo que mostra a terceira
 * afirmação da habilidade: que a informação pode ser ARMAZENADA. E é aqui que
 * a corrente de linguagens aparece inteira de uma vez — desenho → fala →
 * palavra — para a frase-chave ter em que se apoiar.
 */
export function createMural(scene: Phaser.Scene) {
    let parts: Phaser.GameObjects.GameObject[] = []

    function clear() {
        parts.forEach(p => {
            FX.kill(scene, fx(p))
            p.destroy()
        })
        parts = []
    }

    async function play(entries: Delivered[], title: string, line: string) {
        clear()

        const veil = scene.add.graphics().setDepth(DEPTH.mural).setAlpha(0)
        veil.fillStyle(C.ink, 1)
        veil.fillRect(0, 0, W, H)
        parts.push(veil)

        const board = scene.add.graphics().setDepth(DEPTH.mural + 1).setAlpha(0)
        board.fillStyle(C.ink, 1)
        board.fillRoundedRect(120, 120, W - 240, 420, 34)
        board.fillStyle(C.creamDeep, 1)
        board.fillRoundedRect(130, 130, W - 260, 400, 28)
        board.fillStyle(C.cream, 1)
        board.fillRoundedRect(130, 130, W - 260, 386, 28)
        parts.push(board)

        const heading = scene.add.text(W / 2, MURAL.titleY, title, {
            fontFamily: FONT.black, fontSize: SIZE.banner, color: CSS.ink, align: 'center',
        }).setOrigin(0.5).setDepth(DEPTH.mural + 3).setResolution(2).setAlpha(0).setScale(0.7)
        parts.push(heading)

        await FX.all(
            FX.to(scene, fx(veil), { alpha: 0.6 }, { duration: 240 }),
            FX.to(scene, fx(board), { alpha: 1 }, { duration: 260 }),
            FX.to(scene, fx(heading), { alpha: 1, scale: 1 },
                { duration: 320, ease: Ease.back(2.6) }),
        )

        const totalW = (entries.length - 1) * MURAL.gap
        const startX = W / 2 - totalW / 2

        for (let i = 0; i < entries.length; i++) {
            const entry = entries[i]
            const x = startX + i * MURAL.gap

            const card = createMessageCard(
                scene,
                { subject: entry.subject, language: entry.chain[entry.chain.length - 1] },
                MURAL.size,
            )
            card.setPosition(x, MURAL.rowY).setDepth(DEPTH.mural + 3).setScale(0).setAlpha(0)
            parts.push(card)

            await FX.to(scene, fx(card), { scale: 1, alpha: 1 },
                { duration: 200, ease: Ease.back(3) })
            void FX.sparks(scene, x, MURAL.rowY, { color: C.warn, count: 10, spread: 140 })

            /*
             * A corrente por baixo de cada mensagem: por quais linguagens ela
             * passou. É o desenho da frase-chave — sem ele, "a mesma mensagem
             * viajou de três jeitos" seria só uma frase bonita.
             */
            const chain = scene.add.graphics().setDepth(DEPTH.mural + 3).setAlpha(0)
            entry.chain.forEach((language, k) => {
                const cx = x - (entry.chain.length - 1) * 15 + k * 30
                const tone = LANGUAGE_COLOR[language]
                chain.fillStyle(C.ink, 1)
                chain.fillCircle(cx, MURAL.chainY, 13)
                chain.fillStyle(tone.main, 1)
                chain.fillCircle(cx, MURAL.chainY, 10)
                if (k < entry.chain.length - 1) {
                    chain.lineStyle(4, C.ink, 0.5)
                    chain.lineBetween(cx + 12, MURAL.chainY, cx + 18, MURAL.chainY)
                }
            })
            parts.push(chain)
            void FX.to(scene, fx(chain), { alpha: 1 }, { duration: 180 })

            await FX.wait(scene, 90)
        }

        const key = scene.add.text(W / 2, 494, line, {
            fontFamily: FONT.black,
            fontSize: '26px',
            color: CSS.ink,
            align: 'center',
            wordWrap: { width: W - 360 },
            lineSpacing: 5,
        }).setOrigin(0.5).setDepth(DEPTH.mural + 3).setResolution(2).setAlpha(0)
        parts.push(key)

        await FX.wait(scene, 200)
        await FX.to(scene, fx(key), { alpha: 1 }, { duration: 320 })
        await FX.wait(scene, 1700)
        await FX.to(scene, parts.map(fx), { alpha: 0 }, { duration: 300 })
        clear()
    }

    return { play, destroy: clear }
}
