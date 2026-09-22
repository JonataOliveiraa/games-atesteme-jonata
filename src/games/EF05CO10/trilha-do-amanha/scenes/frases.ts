import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, H, SAY, W, leitura } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import type { Frase } from '../types'

export interface FrasesCallbacks {
    onPick: (index: number) => void
}

interface Cartela {
    root: Phaser.GameObjects.Container
    plate: Phaser.GameObjects.Graphics
    label: Phaser.GameObjects.Text
    zone: Phaser.GameObjects.Zone
}

const cardY = (index: number) => SAY.firstCy + index * (SAY.cardH + SAY.gap)

export function createFrases(scene: Phaser.Scene, callbacks: FrasesCallbacks) {
    const veil = scene.add
        .rectangle(W / 2, H / 2, W, H, C.veil, 0.68)
        .setDepth(DEPTH.veil)
        .setScrollFactor(0)
        .setVisible(false)

    const title = scene.add
        .text(W / 2, SAY.titleY, 'O que mudou?', {
            fontFamily: FONT.black,
            fontSize: '44px',
            color: CSS.white,
        })
        .setOrigin(0.5)
        .setResolution(2)
        .setDepth(DEPTH.panel + 2)
        .setScrollFactor(0)
        .setVisible(false)
    title.setStroke(CSS.ink, 8)

    const hint = scene.add
        .text(W / 2, 640, '', {
            fontFamily: FONT.black,
            fontSize: '30px',
            color: CSS.warn,
            align: 'center',
            wordWrap: { width: 960 },
        })
        .setOrigin(0.5)
        .setResolution(2)
        .setDepth(DEPTH.panel + 2)
        .setScrollFactor(0)
        .setVisible(false)
    hint.setStroke(CSS.white, 7)

    const cartelas: Cartela[] = []
    let open = false
    let locked = true

    const paint = (index: number, state: 'normal' | 'certa' | 'apagada' | 'errada') => {
        const { plate, label } = cartelas[index]
        const w = SAY.cardW
        const h = SAY.cardH
        const face =
            state === 'certa' ? C.ok : state === 'errada' ? 0xfff1cf : C.card
        const edge =
            state === 'certa' ? C.okDark : state === 'errada' ? C.warn : C.cardDeep

        plate.clear()
        plate.fillStyle(C.ink, 0.34)
        plate.fillRoundedRect(-w / 2 + 3, -h / 2 + 9, w, h, 24)
        plate.fillStyle(edge, 1)
        plate.fillRoundedRect(-w / 2, -h / 2, w, h, 24)
        plate.fillStyle(face, 1)
        plate.fillRoundedRect(-w / 2, -h / 2, w, h - 9, 24)
        plate.fillStyle(C.white, state === 'certa' ? 0.32 : 0.7)
        plate.fillRoundedRect(-w / 2 + 20, -h / 2 + 10, w - 40, 18, 9)

        label.setColor(state === 'certa' ? CSS.white : CSS.ink)
        if (state === 'certa') label.setStroke(CSS.ok, 6)
        else label.setStroke(CSS.ink, 0)
        cartelas[index].root.setAlpha(state === 'apagada' ? 0.3 : 1)
    }

    for (let index = 0; index < 3; index++) {
        const root = scene.add
            .container(W / 2, cardY(index))
            .setDepth(DEPTH.panel)
            .setScrollFactor(0)
            .setVisible(false)

        const plate = scene.add.graphics()
        const label = scene.add
            .text(0, -4, '', {
                fontFamily: FONT.black,
                fontSize: `${SAY.font}px`,
                color: CSS.ink,
                align: 'center',
                wordWrap: { width: SAY.cardW - 70 },
            })
            .setOrigin(0.5)
            .setResolution(2)

        root.add([plate, label])

        const zone = scene.add
            .zone(W / 2, cardY(index), SAY.cardW, SAY.cardH + 8)
            .setOrigin(0.5)
            .setDepth(DEPTH.panel + 3)
            .setScrollFactor(0)
            .setInteractive({ useHandCursor: true })

        zone.on('pointerdown', () => {
            if (!open || locked) return
            callbacks.onPick(index)
        })
        if (zone.input) zone.input.enabled = false

        cartelas.push({ root, plate, label, zone })
    }

    const setZones = (value: boolean) => {
        locked = !value
        cartelas.forEach(cartela => {
            if (cartela.zone.input) cartela.zone.input.enabled = value
        })
    }

    return {
        cardPoint(index: number) {
            return { x: W / 2, y: cardY(index) }
        },

        async show(frases: Frase[]) {
            open = true
            hint.setVisible(false).setText('')
            veil.setVisible(true).setAlpha(0)
            title.setVisible(true).setAlpha(0)
            scene.tweens.add({ targets: [veil, title], alpha: 1, duration: FX.ms(scene, 260) })

            frases.forEach((frase, index) => {
                cartelas[index].label.setText(frase.texto)
                paint(index, 'normal')
                const root = cartelas[index].root
                root.setVisible(true).setAlpha(0)
                root.x = W / 2 + 90
                scene.tweens.add({
                    targets: root,
                    alpha: 1,
                    x: W / 2,
                    delay: FX.ms(scene, 90 * index),
                    duration: FX.ms(scene, 300),
                    ease: 'Back.easeOut',
                })
            })

            await FX.wait(scene, 420)
            setZones(true)
        },

        async markWrong(index: number, porque: string) {
            setZones(false)
            cartelas.forEach((_, i) => paint(i, i === index ? 'errada' : 'apagada'))
            hint.setText(porque).setVisible(true).setAlpha(0)
            scene.tweens.add({ targets: hint, alpha: 1, duration: FX.ms(scene, 220) })
            await FX.shake(scene, cartelas[index].root, { amount: 9 })
            await FX.wait(scene, leitura(porque))
            cartelas.forEach((_, i) => paint(i, 'normal'))
            setZones(true)
        },

        async markRight(index: number) {
            setZones(false)
            hint.setVisible(false)
            paint(index, 'certa')
            cartelas.forEach((cartela, i) => {
                if (i === index) return
                scene.tweens.add({
                    targets: cartela.root,
                    alpha: 0,
                    x: W / 2 - 70,
                    duration: FX.ms(scene, 240),
                })
            })
            await FX.to(scene, cartelas[index].root, { y: cardY(index) - 16, scale: 1.05 }, { duration: 260, ease: 'Back.easeOut' })
            await FX.wait(scene, 900)
        },

        async hide() {
            setZones(false)
            await FX.to(scene, [veil, title, ...cartelas.map(cartela => cartela.root)], { alpha: 0 }, { duration: 240 })
            open = false
            veil.setVisible(false)
            title.setVisible(false)
            hint.setVisible(false)
            cartelas.forEach((cartela, index) => {
                cartela.root.setVisible(false).setScale(1).setAlpha(1)
                cartela.root.setPosition(W / 2, cardY(index))
            })
        },

        destroy() {
            scene.tweens.killTweensOf([veil, title, hint])
            cartelas.forEach(cartela => {
                scene.tweens.killTweensOf(cartela.root)
                cartela.root.destroy(true)
                cartela.zone.destroy()
            })
            veil.destroy()
            title.destroy()
            hint.destroy()
        },
    }
}

export type Frases = ReturnType<typeof createFrases>
