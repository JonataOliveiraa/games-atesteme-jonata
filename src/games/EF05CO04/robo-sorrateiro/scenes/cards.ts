import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { CARD, DEPTH, cardSlots } from '../data/layout'
import { A, C, CSS, FONT } from '../data/theme'
import { owlFrame } from '../data/cast'
import type { Branch, Card } from '../types'
import { POSE, PROP_FRAME, TEX } from './BootScene'

/** A carta é desenhada neste tamanho e ESCALADA para onde precisar caber. */
const DESIGN = { w: 520, h: 196 } as const

/** Onde a carta escolhida fica enquanto o trecho roda: à vista, fora do chão. */
const PARK = { x: 200, y: 150, scale: 0.54 } as const

const WORD: Record<string, string> = { andar: 'ANDAR', esconder: 'ESCONDER' }

export interface CardsView {
    open(list: Card[], owlColumn: number): Promise<void>
    /** A escolhida vai para o canto e fica valendo; as outras descem. */
    arm(index: number): Promise<void>
    /** Acende a linha que acabou de decidir. `undefined` apaga as duas. */
    light(branch: Branch | undefined, index?: number): void
    /** A trava devolve a carta: as opções voltam para a criança. */
    reopen(): Promise<void>
    /** Guarda a carta armada quando o trecho acaba. */
    stow(): Promise<void>
    blink(index: number): void
    point(index: number): { x: number; y: number }
    setEnabled(on: boolean): void
    destroy(): void
}

export interface CardsOptions {
    onPick(index: number): void
}

interface Piece {
    root: Phaser.GameObjects.Container
    zone: Phaser.GameObjects.Zone
    paint(lit: Branch | undefined): void
}

export function createCards(scene: Phaser.Scene, options: CardsOptions): CardsView {
    let pieces: Piece[] = []
    let armed: Piece | undefined
    let shown: Card[] = []
    let column = 0
    let enabled = false

    const icon = (key: string, frame: number, size: number, x: number, y: number) => {
        if (!scene.textures.exists(key)) return undefined
        const sprite = scene.add.sprite(x, y, key, frame)
        sprite.setDisplaySize(size, size)
        return sprite
    }

    /*
     * A CARTA É UMA TABELA DE DOIS CASOS.
     *
     * Cada linha mostra a coruja de um jeito, uma seta e o que o robô faz. A
     * criança lê o desenho antes da palavra, e o `SE`/`SENÃO` fica de rótulo
     * pequeno — é o nome do que ela está vendo, não o texto a decifrar.
     */
    const build = (card: Card, index: number): Piece => {
        const root = scene.add.container(0, 0).setDepth(DEPTH.card)

        const body = scene.add.graphics()
        body.fillStyle(C.ink, A.shadow)
        body.fillRoundedRect(-DESIGN.w / 2 + 5, -DESIGN.h / 2 + 10, DESIGN.w, DESIGN.h, 26)
        body.fillStyle(C.ink, 1)
        body.fillRoundedRect(-DESIGN.w / 2, -DESIGN.h / 2, DESIGN.w, DESIGN.h, 26)
        body.fillStyle(C.card, 1)
        body.fillRoundedRect(-DESIGN.w / 2 + 6, -DESIGN.h / 2 + 6, DESIGN.w - 12, DESIGN.h - 12, 22)
        root.add(body)

        const rows: Array<{ branch: Branch; y: number; awake: boolean; act: string; tag: string }> = [
            { branch: 'then', y: -46, awake: card.asks === 'acordada', act: card.then, tag: 'SE' },
            { branch: 'else', y: 46, awake: card.asks !== 'acordada', act: card.otherwise, tag: 'SENÃO' },
        ]

        const chips: Phaser.GameObjects.Graphics[] = []

        rows.forEach(row => {
            const chip = scene.add.graphics()
            root.add(chip)
            chips.push(chip)

            const tag = scene.add
                .text(-222, row.y, row.tag, {
                    fontFamily: FONT.black,
                    fontSize: '22px',
                    color: CSS.ink,
                })
                .setOrigin(0, 0.5)
                .setResolution(2)
            root.add(tag)

            const owlIcon = icon(TEX.owl, owlFrame(column, row.awake), 66, -122, row.y)
            if (owlIcon) root.add(owlIcon)

            const arrow = scene.add
                .text(-52, row.y, '→', { fontFamily: FONT.black, fontSize: '34px', color: CSS.ink })
                .setOrigin(0.5)
                .setResolution(2)
            root.add(arrow)

            const art = row.act === 'esconder'
                ? icon(TEX.prop, PROP_FRAME.box, 56, 8, row.y)
                : icon(TEX.robot, POSE.walkA, 62, 8, row.y)
            if (art) root.add(art)

            const label = scene.add
                .text(52, row.y, WORD[row.act], {
                    fontFamily: FONT.black,
                    fontSize: '28px',
                    color: CSS.ink,
                })
                .setOrigin(0, 0.5)
                .setResolution(2)
            root.add(label)
        })

        const paint = (lit: Branch | undefined) => {
            rows.forEach((row, i) => {
                const g = chips[i]
                const on = lit === row.branch
                g.clear()
                g.fillStyle(on ? C.green : C.slate, on ? 1 : 0.3)
                g.fillRoundedRect(-DESIGN.w / 2 + 22, row.y - 40, DESIGN.w - 44, 80, 20)
                g.lineStyle(on ? 5 : 3, on ? C.greenDeep : C.ink, on ? 1 : 0.3)
                g.strokeRoundedRect(-DESIGN.w / 2 + 22, row.y - 40, DESIGN.w - 44, 80, 20)
            })
        }
        paint(undefined)

        const zone = scene.add
            .zone(0, 0, DESIGN.w, DESIGN.h)
            .setOrigin(0.5)
            .setDepth(DEPTH.card + 2)
            .setInteractive({ useHandCursor: true })
        if (zone.input) zone.input.enabled = false
        zone.on('pointerdown', () => {
            if (!enabled) return
            options.onPick(index)
        })

        return { root, zone, paint }
    }

    const layout = () => {
        const slots = cardSlots(pieces.length)
        pieces.forEach((piece, i) => {
            const slot = slots[i]
            piece.root.setPosition(slot.x, CARD.cy).setScale(slot.w / DESIGN.w)
            piece.zone.setPosition(slot.x, CARD.cy).setSize(slot.w, slot.h)
        })
    }

    const clear = () => {
        pieces.splice(0).forEach(piece => {
            piece.zone.destroy()
            piece.root.destroy(true)
        })
        armed = undefined
    }

    const spread = async () => {
        clear()
        pieces = shown.map(build)
        layout()
        await FX.all(...pieces.map((piece, i) => {
            piece.root.setAlpha(0).setY(CARD.cy + 70)
            return FX.to(scene, piece.root, { alpha: 1, y: CARD.cy }, { duration: 300, delay: i * 80 })
        }))
    }

    return {
        open: async (list, owlColumn) => {
            shown = list
            column = owlColumn
            await spread()
        },

        arm: async index => {
            const chosen = pieces[index]
            if (!chosen) return
            armed = chosen
            enabled = false

            const others = pieces.filter(piece => piece !== chosen)
            others.forEach(piece => piece.zone.destroy())
            pieces = [chosen]
            chosen.zone.setPosition(-500, -500)

            void FX.press(scene, chosen.root)
            await FX.all(
                ...others.map(piece =>
                    FX.to(scene, piece.root, { alpha: 0, y: CARD.cy + 70 }, { duration: 240 })
                        .then(() => piece.root.destroy(true))),
                FX.to(scene, chosen.root,
                    { x: PARK.x, y: PARK.y, scale: PARK.scale },
                    { duration: 460 }),
            )
        },

        light: (branch, index) => {
            const target = index === undefined ? armed : pieces[index]
            if (!target) return
            target.paint(branch)
            if (!branch) return
            FX.kill(scene, target.root)
            void FX.to(scene, target.root,
                { scale: target.root.scale * 1.06 },
                { duration: 130, yoyo: true })
        },

        reopen: async () => {
            await spread()
        },

        stow: async () => {
            if (!armed) return
            const piece = armed
            armed = undefined
            pieces = pieces.filter(p => p !== piece)
            piece.paint(undefined)
            await FX.to(scene, piece.root, { alpha: 0, scale: 0.4 }, { duration: 320 })
            piece.zone.destroy()
            piece.root.destroy(true)
        },

        blink: index => {
            const piece = pieces[index]
            if (!piece) return
            void FX.to(scene, piece.root, { scale: piece.root.scale * 1.05 },
                { duration: 220, yoyo: true, repeat: 3 })
        },

        point: index => {
            const piece = pieces[index]
            return piece ? { x: piece.root.x, y: piece.root.y } : { x: 640, y: CARD.cy }
        },

        setEnabled: on => {
            enabled = on
            pieces.forEach(piece => { if (piece.zone.input) piece.zone.input.enabled = on })
        },

        destroy: () => clear(),
    }
}
