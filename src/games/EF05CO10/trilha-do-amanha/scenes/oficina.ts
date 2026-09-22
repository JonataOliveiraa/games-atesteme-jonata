import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, H, SHOP, W } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import { cutSheet, fitFrame } from './sheet'
import type { Encomenda, Item } from '../types'

export interface OficinaCallbacks {
    onPick: (id: string) => void
}

interface Card {
    id: string
    root: Phaser.GameObjects.Container
    art: Phaser.GameObjects.Image
    plaque: Phaser.GameObjects.Graphics
    name: Phaser.GameObjects.Text
    faz: Phaser.GameObjects.Text
    root2: Phaser.GameObjects.Graphics
    zone: Phaser.GameObjects.Zone
}

export function createOficina(scene: Phaser.Scene, callbacks: OficinaCallbacks) {
    const veil = scene.add
        .rectangle(W / 2, H / 2, W, H, C.veil, 0.62)
        .setDepth(DEPTH.veil)
        .setScrollFactor(0)
        .setVisible(false)

    const title = scene.add
        .text(W / 2, SHOP.titleY, '', {
            fontFamily: FONT.black,
            fontSize: '40px',
            color: CSS.white,
            align: 'center',
        })
        .setOrigin(0.5)
        .setResolution(2)
        .setDepth(DEPTH.panel + 2)
        .setScrollFactor(0)
        .setVisible(false)
    title.setStroke(CSS.ink, 8)

    const note = scene.add
        .text(W / 2, SHOP.noteY, '', {
            fontFamily: FONT.black,
            fontSize: '28px',
            color: CSS.warn,
            align: 'center',
            wordWrap: { width: 1020 },
        })
        .setOrigin(0.5)
        .setResolution(2)
        .setDepth(DEPTH.panel + 2)
        .setScrollFactor(0)
        .setVisible(false)
    note.setStroke(CSS.white, 7)

    const pacote = scene.add
        .image(0, SHOP.noteY, '__encomenda')
        .setOrigin(0.5)
        .setDepth(DEPTH.panel + 2)
        .setScrollFactor(0)
        .setVisible(false)

    const cards: Card[] = []
    let open = false
    let locked = false

    for (let index = 0; index < 3; index++) {
        const cx = SHOP.cx[index]
        const root = scene.add
            .container(cx, 374)
            .setDepth(DEPTH.panel)
            .setScrollFactor(0)
            .setVisible(false)

        const card = scene.add.graphics()
        card.fillStyle(C.ink, 0.4)
        card.fillRoundedRect(-128, -166, 256, 352, 28)
        card.fillStyle(C.cardDeep, 1)
        card.fillRoundedRect(-130, -174, 260, 352, 28)
        card.fillStyle(C.card, 1)
        card.fillRoundedRect(-130, -174, 260, 340, 28)
        card.fillStyle(C.white, 0.8)
        card.fillRoundedRect(-112, -158, 224, 26, 13)

        const art = scene.add.image(0, -56, '__item').setOrigin(0.5).setVisible(false)
        const root2 = scene.add.graphics()
        const faz = scene.add
            .text(0, 70, '', {
                fontFamily: FONT.body,
                fontSize: '23px',
                color: CSS.inkSoft,
                align: 'center',
                wordWrap: { width: 224 },
            })
            .setOrigin(0.5)
            .setResolution(2)
        const plaque = scene.add.graphics()
        const name = scene.add
            .text(0, 125, '', {
                fontFamily: FONT.black,
                fontSize: `${SHOP.nameFont}px`,
                color: CSS.white,
            })
            .setOrigin(0.5)
            .setResolution(2)
        name.setStroke(CSS.ink, 6)

        root.add([card, root2, art, faz, plaque, name])

        const zone = scene.add
            .zone(cx, 374, 264, 356)
            .setOrigin(0.5)
            .setDepth(DEPTH.panel + 3)
            .setScrollFactor(0)
            .setInteractive({ useHandCursor: true })

        zone.on('pointerdown', () => {
            if (!open || locked) return
            locked = true
            callbacks.onPick(cards[index].id)
        })
        if (zone.input) zone.input.enabled = false

        cards.push({ id: '', root, art, faz, plaque, name, root2, zone })
    }

    const vestir = (itens: Item[]) => {
        itens.slice(0, 3).forEach((item, index) => {
            const card = cards[index]
            card.id = item.id
            card.name.setText(item.nome)
            card.faz.setText(item.faz ?? '')

            card.plaque.clear()
            card.plaque.fillStyle(item.placa, 1)
            card.plaque.fillRoundedRect(-112, 96, 224, 58, 18)
            card.plaque.fillStyle(C.white, 0.22)
            card.plaque.fillRoundedRect(-104, 102, 208, 18, 9)

            const folha = cutSheet(scene, item.sheet, item.cols, item.rows)
            card.root2.clear()
            if (folha) {
                const fit = fitFrame(folha, item.coluna, 210, 178)
                card.art
                    .setTexture(item.sheet, String(item.coluna))
                    .setPosition(fit.offsetX, -56 + fit.offsetY)
                    .setDisplaySize(fit.width, fit.height)
                    .setVisible(true)
            } else {
                card.art.setVisible(false)
                card.root2.fillStyle(item.cor, 1)
                card.root2.fillRoundedRect(-95, -130, 190, 180, 22)
            }
        })
    }

    const setZones = (value: boolean) => {
        cards.forEach(card => {
            if (card.zone.input) card.zone.input.enabled = value
        })
    }

    return {
        get isOpen() {
            return open
        },

        cardPoint(index: number) {
            return { x: SHOP.cx[index], y: 374 }
        },

        indexOf(id: string) {
            return cards.findIndex(card => card.id === id)
        },

        async show(
            titulo: string,
            lembrete: string,
            itens: Item[],
            encomenda: Encomenda | undefined,
            hint: string | null,
        ) {
            open = true
            locked = false
            vestir(itens)
            title.setText(titulo)
            note.setText(lembrete)

            const folhaPacote = encomenda ? cutSheet(scene, 'encomendas', 3, 1) : null
            if (encomenda && folhaPacote) {
                const fit = fitFrame(folhaPacote, encomenda.coluna, 74, 74)
                pacote
                    .setTexture('encomendas', String(encomenda.coluna))
                    .setDisplaySize(fit.width, fit.height)
                    .setPosition(W / 2 - note.width / 2 - 56 + fit.offsetX, SHOP.noteY + fit.offsetY)
                    .setVisible(true)
                    .setAlpha(0)
                scene.tweens.add({ targets: pacote, alpha: 1, duration: FX.ms(scene, 380), delay: FX.ms(scene, 160) })
            } else {
                pacote.setVisible(false)
            }
            veil.setVisible(true).setAlpha(0)
            title.setVisible(true).setAlpha(0).setY(SHOP.titleY - 22)
            note.setVisible(true).setAlpha(0)

            scene.tweens.add({ targets: veil, alpha: 1, duration: FX.ms(scene, 260) })
            scene.tweens.add({ targets: note, alpha: 1, duration: FX.ms(scene, 380), delay: FX.ms(scene, 160) })
            scene.tweens.add({
                targets: title,
                alpha: 1,
                y: SHOP.titleY,
                duration: FX.ms(scene, 300),
                ease: 'Back.easeOut',
            })

            cards.forEach((card, index) => {
                card.root.setVisible(true).setAlpha(0).setScale(0.86)
                card.root.y = 374 + 40
                scene.tweens.add({
                    targets: card.root,
                    alpha: 1,
                    scale: 1,
                    y: 374,
                    delay: FX.ms(scene, 90 * index),
                    duration: FX.ms(scene, 320),
                    ease: 'Back.easeOut',
                })
            })

            await FX.wait(scene, 420)
            setZones(true)

            if (!hint) return
            const target = cards.find(card => card.id === hint)
            if (target) FX.breathe(scene, target.root, { grow: 1.06, duration: 900 })
        },

        async pickAnimation(id: string) {
            setZones(false)
            const chosen = cards.find(card => card.id === id)
            const others = cards.filter(card => card.id !== id)

            scene.tweens.killTweensOf(cards.map(card => card.root))
            others.forEach(card => {
                scene.tweens.add({
                    targets: card.root,
                    alpha: 0,
                    scale: 0.8,
                    duration: FX.ms(scene, 220),
                })
            })

            if (chosen) {
                await FX.to(scene, chosen.root, { scale: 1.18 }, { duration: 180, ease: 'Back.easeOut' })
                await FX.to(scene, chosen.root, { alpha: 0, scale: 0.4, y: 220 }, { duration: 300 })
            }

            await FX.all(
                FX.to(scene, veil, { alpha: 0 }, { duration: 240 }),
                FX.to(scene, [title, note, pacote], { alpha: 0 }, { duration: 200 }),
            )

            open = false
            veil.setVisible(false)
            title.setVisible(false)
            note.setVisible(false)
            pacote.setVisible(false)
            cards.forEach(card => card.root.setVisible(false).setScale(1).setAlpha(1))
        },

        hide() {
            open = false
            setZones(false)
            scene.tweens.killTweensOf(cards.map(card => card.root))
            veil.setVisible(false)
            title.setVisible(false)
            note.setVisible(false)
            pacote.setVisible(false)
            cards.forEach(card => card.root.setVisible(false).setScale(1).setAlpha(1))
        },

        destroy() {
            scene.tweens.killTweensOf([veil, title, note, pacote])
            cards.forEach(card => {
                scene.tweens.killTweensOf(card.root)
                card.root.destroy(true)
                card.zone.destroy()
            })
            veil.destroy()
            title.destroy()
            note.destroy()
            pacote.destroy()
        },
    }
}

export type Oficina = ReturnType<typeof createOficina>
