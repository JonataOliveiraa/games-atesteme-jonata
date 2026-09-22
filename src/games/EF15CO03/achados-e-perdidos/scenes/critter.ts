import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { A, C } from '../data/theme'
import { CRITTER, DEPTH, STAND } from '../data/layout'
import { CRITTER_ANCHOR, CRITTER_SHEET } from '../data/critters'
import type { CritterDef, Field } from '../types'
import { ANCHOR, drawCritter } from './art'

export interface Critter {
    show(def: CritterDef): Promise<void>
    leave(): Promise<void>
    /** Pulsa o atributo de que a carta está falando. É a conferência, vista. */
    highlight(field: Field, ok: boolean): Promise<void>
    celebrate(): Promise<void>
    worldAnchor(field: Field): { x: number; y: number }
    destroy(): void
}

export function createCritter(scene: Phaser.Scene): Critter {
    const hasArt = scene.textures.exists(CRITTER_SHEET.key)

    const shadow = scene.add.graphics().setDepth(DEPTH.critter - 1)
    const sprite = hasArt
        ? scene.add.sprite(0, 0, CRITTER_SHEET.key, 0).setOrigin(0.5, 1)
        : null
    const fallback = hasArt ? null : scene.add.graphics()
    const holder = scene.add
        .container(STAND.cx, STAND.topY, [sprite ?? fallback!])
        .setDepth(DEPTH.critter)

    let current: CritterDef | null = null
    let scale = CRITTER.scale
    let breathing = false

    const paintShadow = () => {
        shadow.clear()
        if (!current) return
        const w = CRITTER_SHEET.frameWidth * scale * 0.62
        shadow.fillStyle(C.shadow, A.shadow)
        shadow.fillEllipse(STAND.cx, STAND.topY + 4, w, w * 0.17)
    }

    /** A âncora do atributo, em coordenada local do container (pé em y = 0). */
    const localAnchor = (field: Field) => ({
        x: 0,
        y: (hasArt ? CRITTER_ANCHOR[field] : ANCHOR[field].y + 108) * scale,
    })

    return {
        async show(def) {
            /**
             * Mata o `breathe` da fase anterior ANTES de medir a escala nova.
             * Sem isso o tween antigo continua puxando o container para o alvo
             * dele, e o bichinho grande entra com o tamanho do pequeno — o que
             * num nível com régua é uma resposta errada desenhada na tela.
             */
            FX.kill(scene, holder)
            breathing = false

            current = def
            scale = CRITTER.scale * (def.big ? 1 : CRITTER.smallOf)

            if (sprite) {
                sprite.setFrame(def.frame)
                /* medido, não estimado: o pé cai no tampo e o centro é o da
                   caixa alfa, senão a figura desliza ao trocar de quadro */
                sprite.setOrigin(CRITTER_SHEET.originX[def.frame], 1)
                sprite.setY(CRITTER_SHEET.footPad[def.frame])
                sprite.setScale(1)
            } else if (fallback) {
                drawCritter(fallback, def, {})
                fallback.setY(-108)
            }
            holder.setScale(scale)
            holder.setPosition(STAND.cx, STAND.topY)
            paintShadow()

            holder.setAlpha(0)
            shadow.setAlpha(0)
            holder.y = STAND.topY - 240
            await FX.all(
                FX.to(scene, holder, { alpha: 1 }, { duration: 160 }),
                FX.to(scene, shadow, { alpha: 1 }, { duration: 300 }),
                FX.to(scene, holder, { y: STAND.topY }, { duration: 540, ease: 'Bounce.easeOut' }),
            )
            if (!breathing) {
                breathing = true
                FX.breathe(scene, holder, { grow: 1.025, duration: 2200 })
            }
        },

        async leave() {
            breathing = false
            FX.kill(scene, holder)
            await FX.all(
                FX.to(scene, holder, { alpha: 0, y: holder.y - 90 }, { duration: 320 }),
                FX.to(scene, shadow, { alpha: 0 }, { duration: 240 }),
            )
            current = null
            shadow.clear()
            fallback?.clear()
        },

        async highlight(field, ok) {
            const at = this.worldAnchor(field)
            await FX.ping(scene, at.x, at.y, ok ? C.green : C.orange, {
                radius: 74,
                duration: 540,
                depth: DEPTH.hint,
            })
        },

        async celebrate() {
            FX.kill(scene, holder)
            holder.setScale(scale)
            await FX.to(scene, holder, { y: STAND.topY - 52 }, { duration: 190, ease: 'Sine.easeOut' })
            await FX.to(scene, holder, { y: STAND.topY }, { duration: 280, ease: 'Bounce.easeOut' })
            await FX.to(scene, holder, { angle: -7 }, { duration: 120, yoyo: true, repeat: 1 })
            holder.setAngle(0)
            breathing = true
            FX.breathe(scene, holder, { grow: 1.025, duration: 2200 })
        },

        worldAnchor(field) {
            const a = localAnchor(field)
            return { x: holder.x + a.x, y: STAND.topY + a.y }
        },

        destroy() {
            FX.kill(scene, holder)
            holder.destroy()
            shadow.destroy()
        },
    }
}
