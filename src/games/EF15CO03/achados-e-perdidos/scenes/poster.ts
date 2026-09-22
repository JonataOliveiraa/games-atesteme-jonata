import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { A, C, CSS, FONT, SIZE } from '../data/theme'
import { DEPTH, FIELD_LAYOUT, POSTER } from '../data/layout'
import { CRITTER_SHEET } from '../data/critters'
import type { CritterDef, Field, Value } from '../types'
import { createIcon, drawCheck, drawCritter } from './art'

export interface Poster {
    show(def: CritterDef, fields: Field[]): Promise<void>
    /** Acende o campo com o que a carta disse — inclusive quando é um NÃO. */
    fill(field: Field, value: Value, negated: boolean): Promise<void>
    fieldWorld(field: Field): { x: number; y: number }
    isFilled(field: Field): boolean
    complete(): Promise<void>
    destroy(): void
}

/** O ícone cinza que diz SOBRE O QUE aquele campo fala, sem dizer a resposta. */
const GHOST_OF: Record<Field, Value> = {
    color: 'blue',
    hat: 'hat',
    glasses: 'glasses',
    size: 'big',
}

interface Slot {
    holder: Phaser.GameObjects.Container
    bg: Phaser.GameObjects.Graphics
    icon: Phaser.GameObjects.Container
    size: number
}

export function createPoster(scene: Phaser.Scene): Poster {
    const hasArt = scene.textures.exists(CRITTER_SHEET.key)

    const root = scene.add.container(0, 0).setDepth(DEPTH.poster)
    const paper = scene.add.graphics()
    const portraitArt = hasArt ? null : scene.add.graphics()
    const portraitSprite = hasArt
        ? scene.add.sprite(0, 0, CRITTER_SHEET.key, 0).setOrigin(0.5, 1)
        : null
    const portrait = (portraitSprite ?? portraitArt)!
    const banner = scene.add
        .text(POSTER.x + POSTER.w / 2, POSTER.y + POSTER.bandH / 2, 'ACHEI!', {
            fontFamily: FONT.black,
            fontSize: `${SIZE.banner}px`,
            color: CSS.white,
        })
        .setOrigin(0.5)
        .setResolution(2)

    const portraitHolder = scene.add.container(POSTER.portraitX, POSTER.portraitY, [portrait])
    root.add([paper, portraitHolder, banner])

    const slots = new Map<Field, Slot>()
    let height = POSTER.hSmall

    const paintPaper = () => {
        paper.clear()
        paper.fillStyle(C.shadow, A.shadow)
        paper.fillRoundedRect(POSTER.x + 6, POSTER.y + 8, POSTER.w, height, 22)
        paper.fillStyle(C.paper, 1)
        paper.fillRoundedRect(POSTER.x, POSTER.y, POSTER.w, height, 22)
        paper.lineStyle(6, C.line, 1)
        paper.strokeRoundedRect(POSTER.x, POSTER.y, POSTER.w, height, 22)

        paper.fillStyle(C.coral, 1)
        paper.fillRoundedRect(POSTER.x, POSTER.y, POSTER.w, POSTER.bandH, { tl: 22, tr: 22, bl: 0, br: 0 })
        paper.fillStyle(C.coralDark, 1)
        paper.fillRect(POSTER.x, POSTER.y + POSTER.bandH - 6, POSTER.w, 6)
    }

    const paintBox = (bg: Phaser.GameObjects.Graphics, size: number, filled: boolean) => {
        const half = size / 2
        bg.clear()
        bg.fillStyle(filled ? C.greenSoft : C.paperEdge, filled ? 1 : 0.35)
        bg.fillRoundedRect(-half, -half, size, size, 18)
        bg.lineStyle(filled ? 6 : 5, filled ? C.green : C.line, filled ? 1 : 0.5)
        bg.strokeRoundedRect(-half, -half, size, size, 18)
    }

    const clearSlots = () => {
        slots.forEach(({ holder }) => holder.destroy())
        slots.clear()
    }

    return {
        async show(def, fields) {
            clearSlots()

            const layout = FIELD_LAYOUT[fields.length]
            if (!layout) throw new Error(`[achados-e-perdidos] cartaz de ${fields.length} campos não existe`)

            /**
             * Com 2 campos sobra lugar para o retrato; com 3 e 4 ele sai. Um
             * retrato espremido entre quatro campos seria o quinto objeto de
             * uma coluna que já está cheia — e o bichinho está ali no balcão,
             * a 300 px de distância.
             */
            const withPortrait = fields.length <= 2
            height = withPortrait ? POSTER.hSmall : POSTER.hBig
            paintPaper()
            portraitHolder.setVisible(withPortrait)

            if (withPortrait) {
                if (portraitSprite) {
                    portraitSprite.setFrame(def.frame)
                    portraitSprite.setOrigin(CRITTER_SHEET.originX[def.frame], 1)
                    portraitSprite.setY(CRITTER_SHEET.frameHeight / 2)
                } else if (portraitArt) {
                    drawCritter(portraitArt, def, {})
                }
                portraitHolder.setScale(POSTER.portraitScale * (def.big ? 1 : 0.9))
            }

            fields.forEach((field, i) => {
                const spot = layout.spots[i]
                const bg = scene.add.graphics()
                const icon = createIcon(scene, GHOST_OF[field], layout.size * 0.62, { ghost: true })
                const holder = scene.add.container(spot.x, spot.y, [bg, icon])
                root.add(holder)
                slots.set(field, { holder, bg, icon, size: layout.size })
                paintBox(bg, layout.size, false)
                holder.setAlpha(0).setScale(0.7)
            })

            root.setAlpha(0)
            await FX.to(scene, root, { alpha: 1 }, { duration: 240 })
            await FX.stagger(
                scene,
                [...slots.values()].map(s => s.holder),
                holder => FX.to(scene, holder, { alpha: 1, scale: 1 }, { duration: 260, ease: 'Back.easeOut' }),
                90,
            )
        },

        async fill(field, value, negated) {
            const slot = slots.get(field)
            if (!slot) return
            slot.holder.setData('filled', true)
            paintBox(slot.bg, slot.size, true)
            slot.icon.destroy()
            slot.icon = createIcon(scene, value, slot.size * 0.62, { negated })
            slot.holder.add(slot.icon)
            await FX.to(scene, slot.holder, { scale: 1.16 }, { duration: 150, ease: 'Back.easeOut' })
            await FX.to(scene, slot.holder, { scale: 1 }, { duration: 200 })
        },

        fieldWorld(field) {
            const slot = slots.get(field)
            if (!slot) return { x: POSTER.x + POSTER.w / 2, y: POSTER.y + height / 2 }
            return { x: slot.holder.x, y: slot.holder.y }
        },

        isFilled(field) {
            return Boolean(slots.get(field)?.holder.getData('filled'))
        },

        async complete() {
            const stamp = scene.add.graphics()
            drawCheck(stamp, 150)
            const holder = scene.add
                .container(POSTER.x + POSTER.w - 64, POSTER.y + height - 52, [stamp])
                .setDepth(DEPTH.poster + 1)
                .setScale(0.2)
                .setAngle(-18)
            await FX.to(scene, holder, { scale: 1 }, { duration: 260, ease: 'Back.easeOut' })
            await FX.to(scene, root, { y: -8 }, { duration: 140, yoyo: true })
            await FX.wait(scene, 380)
            const lift = -height - 200
            await FX.all(
                FX.to(scene, root, { y: lift, alpha: 0 }, { duration: 520, ease: 'Back.easeIn' }),
                FX.to(scene, holder, { y: holder.y + lift, alpha: 0 }, { duration: 520, ease: 'Back.easeIn' }),
            )
            holder.destroy()
            root.setY(0)
        },

        destroy() {
            FX.kill(scene, root)
            clearSlots()
            root.destroy()
        },
    }
}
