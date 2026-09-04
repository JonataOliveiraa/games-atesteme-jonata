import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, SHELF, nicheX } from '../data/layout'
import { C } from '../data/theme'
import type { Goal, LabItem } from '../types'
import { createItemIcon } from './itemIcon'
import { MOVEIS, MOVEIS_SHEET } from './furniture'
import { UI, UI_SHEET } from './machine'

const hasFrame = (scene: Phaser.Scene, key: string, frame: number) =>
    scene.textures.exists(key) && scene.textures.get(key).has(String(frame))

function paintNiche(g: Phaser.GameObjects.Graphics, size: number, full: boolean) {
    const half = size / 2
    g.clear()
    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(-half, -half, size, size, 22)
    g.fillStyle(full ? C.woodDark : C.woodDeep, 1)
    g.fillRoundedRect(-half + 6, -half + 6, size - 12, size - 12, 16)
    if (full) {
        g.fillStyle(C.light, 0.42)
        g.fillRoundedRect(-half + 12, -half + 12, size - 24, size - 24, 13)
    }
}

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  A PRATELEIRA É O PROGRESSO
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Não existe barra, bolinha nem porcentagem em lugar nenhum deste jogo. O que
 * a criança tem para olhar é esta prateleira: três vãos vazios no começo e,
 * a cada montagem que funciona, uma máquina a mais morando ali, viva e
 * mexendo, até o fim da partida.
 *
 * A vantagem sobre um medidor é que ela diz mais de uma coisa: quantas faltam,
 * e POR QUE aquelas estão ligadas. Cada troféu é uma peça que alguém mandou
 * funcionar.
 */
export function createShelf(scene: Phaser.Scene, count: number) {
    const root = scene.add.container(0, 0).setDepth(DEPTH.shelf)

    const plank = hasFrame(scene, MOVEIS_SHEET, MOVEIS.shelf)
        ? scene.add.image(SHELF.cx, SHELF.cy, MOVEIS_SHEET, MOVEIS.shelf)
            .setDisplaySize(SHELF.w, SHELF.h)
        : null

    const fallback = plank ? null : scene.add.graphics()
    if (fallback) {
        const x = SHELF.cx - SHELF.w / 2
        const y = SHELF.cy - SHELF.h / 2
        fallback.fillStyle(C.ink, 0.3)
        fallback.fillRect(x, y + SHELF.h - 12, SHELF.w, 16)
        fallback.fillStyle(C.woodDeep, 1)
        fallback.fillRoundedRect(x, y, SHELF.w, SHELF.h, 14)
        fallback.fillStyle(C.woodDark, 1)
        fallback.fillRoundedRect(x + 6, y + 6, SHELF.w - 12, SHELF.h - 12, 10)
        fallback.fillStyle(C.wood, 1)
        fallback.fillRoundedRect(x + 6, y + SHELF.h - 30, SHELF.w - 12, 22, 10)
    }
    root.add(plank ?? fallback!)

    const niches: Array<{
        x: number
        sprite: Phaser.GameObjects.Sprite | null
        art: Phaser.GameObjects.Graphics | null
        trophy: Phaser.GameObjects.Container | null
    }> = []

    for (let i = 0; i < count; i++) {
        const x = nicheX(i, count)
        const sprite = hasFrame(scene, UI_SHEET, UI.nicheEmpty)
            ? scene.add.sprite(x, SHELF.nicheY, UI_SHEET, UI.nicheEmpty)
                .setDisplaySize(SHELF.nicheSize, SHELF.nicheSize)
            : null
        const art = sprite ? null : scene.add.graphics().setPosition(x, SHELF.nicheY)
        if (art) paintNiche(art, SHELF.nicheSize, false)
        root.add(sprite ?? art!)
        niches.push({ x, sprite, art, trophy: null })
    }

    /** O bichinho de cada máquina viva: o que ela fica fazendo para sempre. */
    const animate = (holder: Phaser.GameObjects.Container, goal: Goal) => {
        if (goal === 'dance') {
            scene.tweens.add({
                targets: holder, angle: 8, duration: FX.ms(scene, 420),
                yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
            })
            return
        }
        if (goal === 'photo') {
            scene.tweens.add({
                targets: holder, scale: 1.12, duration: FX.ms(scene, 180),
                yoyo: true, repeat: -1, repeatDelay: FX.ms(scene, 1500), ease: 'Quad.easeOut',
            })
            return
        }
        scene.tweens.add({
            targets: holder, y: holder.y - 7, duration: FX.ms(scene, 700),
            yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
        })
    }

    return {
        get container() {
            return root
        },

        nicheAt(index: number) {
            return { x: niches[index]?.x ?? SHELF.cx, y: SHELF.nicheY }
        },

        bounds() {
            return { x: SHELF.cx, y: SHELF.cy, w: SHELF.w + 20, h: SHELF.h + 40 }
        },

        nicheBounds(index: number) {
            return {
                x: niches[index]?.x ?? SHELF.cx,
                y: SHELF.nicheY,
                w: SHELF.nicheSize + 20,
                h: SHELF.nicheSize + 20,
            }
        },

        /** A máquina montada sobe e passa a morar aqui. */
        async place(index: number, target: LabItem, goal: Goal) {
            const niche = niches[index]
            if (!niche) return

            if (niche.sprite && hasFrame(scene, UI_SHEET, UI.nicheFull)) {
                niche.sprite.setFrame(UI.nicheFull)
                niche.sprite.setDisplaySize(SHELF.nicheSize, SHELF.nicheSize)
            } else if (niche.art) {
                paintNiche(niche.art, SHELF.nicheSize, true)
            }

            const holder = scene.add.container(niche.x, SHELF.nicheY).setDepth(DEPTH.trophy)
            const icon = createItemIcon(scene, target, SHELF.trophy)
            holder.add(icon)
            root.add(holder)
            niche.trophy = holder

            holder.setScale(0.2).setAlpha(0)
            await FX.to(scene, holder, { scale: 1, alpha: 1 },
                { duration: 340, ease: 'Back.easeOut' })
            await FX.ping(scene, niche.x, SHELF.nicheY, C.ok, { radius: 78, duration: 460 })
            animate(holder, goal)
        },

        destroy() {
            niches.forEach(niche => {
                if (niche.trophy) scene.tweens.killTweensOf(niche.trophy)
            })
            scene.tweens.killTweensOf(root)
            root.destroy(true)
        },
    }
}

export type Shelf = ReturnType<typeof createShelf>
