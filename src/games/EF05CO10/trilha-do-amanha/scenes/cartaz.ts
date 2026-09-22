import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, H, W } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import { cutSheet, fitFrame } from './sheet'
import type { SheetKey } from '../types'

export interface CartazItem {
    pessoaSheet: SheetKey
    pessoaLinha: number
    pessoaTrocado: boolean
    itemSheet: SheetKey
    itemCols: number
    itemRows: number
    itemColuna: number
}

export function createCartaz(scene: Phaser.Scene) {
    let made: Phaser.GameObjects.GameObject[] = []

    const keep = <T extends Phaser.GameObjects.GameObject>(object: T): T => {
        made.push(object)
        return object
    }

    const clear = () => {
        made.forEach(object => {
            scene.tweens.killTweensOf(object)
            object.destroy()
        })
        made = []
    }

    return {
        async show(itens: CartazItem[], fecho: string) {
            clear()

            const veil = keep(
                scene.add
                    .rectangle(W / 2, H / 2, W, H, C.veil, 0)
                    .setDepth(DEPTH.poster)
                    .setScrollFactor(0),
            )
            scene.tweens.add({ targets: veil, fillAlpha: 0.82, duration: FX.ms(scene, 320) })

            const title = keep(
                scene.add
                    .text(W / 2, 150, 'Os três recados chegaram!', {
                        fontFamily: FONT.black,
                        fontSize: '52px',
                        color: CSS.white,
                    })
                    .setOrigin(0.5)
                    .setResolution(2)
                    .setDepth(DEPTH.poster + 1)
                    .setScrollFactor(0)
                    .setAlpha(0),
            )
            title.setStroke(CSS.ink, 9)
            scene.tweens.add({ targets: title, alpha: 1, duration: FX.ms(scene, 320) })

            const cx = [320, 640, 960]

            itens.slice(0, 3).forEach((item, index) => {
                const card = keep(
                    scene.add
                        .container(cx[index], 380)
                        .setDepth(DEPTH.poster + 1)
                        .setScrollFactor(0)
                        .setAlpha(0)
                        .setScale(0.8),
                )

                const plate = scene.add.graphics()
                plate.fillStyle(C.ink, 0.4)
                plate.fillRoundedRect(-124, -104, 250, 216, 22)
                plate.fillStyle(C.card, 1)
                plate.fillRoundedRect(-126, -108, 250, 214, 22)
                card.add(plate)

                const pessoas = cutSheet(scene, item.pessoaSheet, 2, 3)
                if (pessoas) {
                    const frame = item.pessoaLinha * 2 + (item.pessoaTrocado ? 0 : 1)
                    const fit = fitFrame(pessoas, frame, 132, 152)
                    card.add(
                        scene.add
                            .image(-40 - fit.offsetX, 2 + fit.offsetY, item.pessoaSheet, String(frame))
                            .setOrigin(0.5)
                            .setDisplaySize(fit.width, fit.height)
                            .setFlipX(true),
                    )
                }

                const itens = cutSheet(scene, item.itemSheet, item.itemCols, item.itemRows)
                if (itens) {
                    const fit = fitFrame(itens, item.itemColuna, 96, 96)
                    card.add(
                        scene.add
                            .image(64 + fit.offsetX, 44 + fit.offsetY, item.itemSheet, String(item.itemColuna))
                            .setOrigin(0.5)
                            .setDisplaySize(fit.width, fit.height),
                    )
                }

                scene.tweens.add({
                    targets: card,
                    alpha: 1,
                    scale: 1,
                    y: 370,
                    delay: FX.ms(scene, 180 * index),
                    duration: FX.ms(scene, 340),
                    ease: 'Back.easeOut',
                })
            })

            await FX.wait(scene, 1500)

            const line = keep(
                scene.add
                    .text(W / 2, 560, fecho, {
                        fontFamily: FONT.black,
                        fontSize: '34px',
                        color: CSS.white,
                        align: 'center',
                    })
                    .setOrigin(0.5)
                    .setResolution(2)
                    .setDepth(DEPTH.poster + 1)
                    .setScrollFactor(0)
                    .setAlpha(0),
            )
            line.setStroke(CSS.ink, 8)
            await FX.to(scene, line, { alpha: 1 }, { duration: 340 })

            void FX.confetti(scene)
            await FX.wait(scene, 1600)
        },

        /** Sai de cena antes do painel de fim de nível, para os dois não se somarem. */
        async fadeOut() {
            if (!made.length) return
            await FX.to(scene, made as Parameters<typeof FX.to>[1], { alpha: 0 }, { duration: 340 })
            clear()
        },

        destroy() {
            clear()
        },
    }
}

export type Cartaz = ReturnType<typeof createCartaz>
