import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, WORLD } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import { boxOf, cutSheet, type Sheet } from './sheet'
import type { Quem, SheetKey } from '../types'

const ALTURA = 190

export function createPessoa(scene: Phaser.Scene) {
    const folhas: Partial<Record<SheetKey, { sheet: Sheet; scale: number }>> = {}

    const folhaDe = (key: SheetKey) => {
        const pronta = folhas[key]
        if (pronta) return pronta
        const sheet = cutSheet(scene, key, 2, 3)
        if (!sheet) return null
        const tallest = Math.max(...sheet.boxes.map(box => box.height))
        const feito = { sheet, scale: ALTURA / (tallest * sheet.frameH) }
        folhas[key] = feito
        return feito
    }

    const body = scene.add.image(0, 0, '__pessoa').setOrigin(0.5, 1).setDepth(DEPTH.person).setVisible(false)
    const reserve = scene.add.graphics().setDepth(DEPTH.person).setVisible(false)

    const balloon = scene.add.container(0, 0).setDepth(DEPTH.balloon).setVisible(false)
    const balloonG = scene.add.graphics()
    const balloonText = scene.add
        .text(0, 0, '', {
            fontFamily: FONT.black,
            fontSize: '26px',
            color: CSS.ink,
            align: 'left',
            wordWrap: { width: 420 },
        })
        .setOrigin(0, 0.5)
        .setResolution(2)
    balloon.add([balloonG, balloonText])

    let current: Quem | null = null
    let atX = 0
    let estado = 0

    const place = () => {
        if (!current) return
        const folha = folhaDe(current.sheet)

        if (folha) {
            const coluna = current.estadoTrocado ? 1 - estado : estado
            const frame = current.linha * 2 + coluna
            const { sheet, scale } = folha
            const box = boxOf(sheet, frame)
            const shift = (box.left + box.width / 2 - 0.5) * sheet.frameW * scale
            body.setTexture(current.sheet, String(frame))
            body.setFlipX(current.flip)
            body.setDisplaySize(sheet.frameW * scale, sheet.frameH * scale)
            body.setPosition(
                atX + (current.flip ? shift : -shift),
                WORLD.groundY + (1 - box.bottom) * sheet.frameH * scale,
            )
            body.setVisible(true)
            reserve.setVisible(false)
            return
        }

        reserve.clear()
        reserve.fillStyle(C.inkSoft, 1)
        reserve.fillRoundedRect(atX - 34, WORLD.groundY - ALTURA, 68, ALTURA, 20)
        reserve.fillStyle(C.ink, 1)
        reserve.fillCircle(atX, WORLD.groundY - ALTURA + 26, 26)
        reserve.setVisible(true)
        body.setVisible(false)
    }

    const headY = () => WORLD.groundY - ALTURA - 6

    return {
        show(quem: Quem) {
            current = quem
            atX = quem.x
            estado = 0
            balloon.setVisible(false)
            place()
        },

        setEstado(value: 0 | 1) {
            estado = value
            place()
        },

        headPoint() {
            return { x: atX, y: headY() }
        },

        bodyPoint() {
            return { x: atX, y: WORLD.groundY - ALTURA * 0.55 }
        },

        async puzzled() {
            const mark = scene.add
                .text(atX, headY() + 20, '?', {
                    fontFamily: FONT.black,
                    fontSize: '56px',
                    color: CSS.warn,
                })
                .setOrigin(0.5)
                .setResolution(2)
                .setDepth(DEPTH.balloon)
            mark.setStroke(CSS.white, 8)
            mark.setAlpha(0)
            await FX.to(scene, mark, { alpha: 1, y: headY() - 34 }, { duration: 320, ease: 'Back.easeOut' })
            await FX.wait(scene, 700)
            await FX.to(scene, mark, { alpha: 0, y: headY() - 60 }, { duration: 260 })
            mark.destroy()
        },

        say(text: string, tone: 'dica' | 'boa') {
            const fill = tone === 'boa' ? C.card : 0xfff1cf
            const edge = tone === 'boa' ? C.ok : C.warn

            balloonText.setText(text)
            const width = Math.max(220, balloonText.width) + 46
            const height = Math.max(76, balloonText.height + 40)

            balloonG.clear()
            balloonG.fillStyle(C.ink, 0.22)
            balloonG.fillRoundedRect(4, 8, width, height, 20)
            balloonG.fillStyle(edge, 1)
            balloonG.fillRoundedRect(0, 0, width, height, 20)
            balloonG.fillStyle(fill, 1)
            balloonG.fillRoundedRect(5, 5, width - 10, height - 10, 16)
            balloonG.fillStyle(edge, 1)
            balloonG.fillTriangle(16, height - 4, 54, height - 4, 6, height + 30)
            balloonG.fillStyle(fill, 1)
            balloonG.fillTriangle(22, height - 8, 48, height - 8, 15, height + 20)

            balloonText.setPosition(23, height / 2)
            balloon.setPosition(atX + 26, headY() - height - 22)
            balloon.setVisible(true).setAlpha(0).setScale(0.8)
            scene.tweens.add({
                targets: balloon,
                alpha: 1,
                scale: 1,
                duration: FX.ms(scene, 260),
                ease: 'Back.easeOut',
            })
        },

        hush() {
            balloon.setVisible(false)
        },

        async wave() {
            estado = 1
            place()
            const target = body.visible ? body : reserve
            await FX.to(scene, target, { y: target.y - 16 }, { duration: 180, yoyo: true, repeat: 1 })
        },

        setVisible(value: boolean) {
            if (!value) {
                body.setVisible(false)
                reserve.setVisible(false)
                balloon.setVisible(false)
                return
            }
            place()
        },

        destroy() {
            scene.tweens.killTweensOf(body)
            body.destroy()
            reserve.destroy()
            scene.tweens.killTweensOf(balloon)
            balloon.destroy(true)
        },
    }
}

export type PessoaView = ReturnType<typeof createPessoa>
