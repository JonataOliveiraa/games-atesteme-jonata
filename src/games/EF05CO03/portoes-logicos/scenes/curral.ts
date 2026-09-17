import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { CURRAL_ORIGIN, RECORTE, SHEET, curralScale, scaleOf } from '../data/art'
import { CURRAL, DEPTH, LANE_Y } from '../data/layout'
import { C, COR } from '../data/theme'
import type { Criatura, Lane } from '../types'

const VAGAS = 8
const POR_FILA = 4

/** Onde cada criaturinha fica dentro da grama, em coordenadas do curral. */
function vaga(index: number) {
    const fila = Math.floor(index / POR_FILA)
    const col = index % POR_FILA
    return {
        x: -78 + col * 52 + (fila === 1 ? 26 : 0),
        y: -20 + fila * 34,
    }
}

export function createCurral(scene: Phaser.Scene, lane: Lane) {
    const y = LANE_Y[lane]
    const scale = curralScale(CURRAL.w)

    const root = scene.add.container(CURRAL.cx, y).setDepth(DEPTH.curral)

    const cerca = scene.add
        .image(0, 0, SHEET.curral)
        .setOrigin(CURRAL_ORIGIN.x, CURRAL_ORIGIN.y)
        .setScale(scale)
    root.add(cerca)

    const pets = scene.add.container(0, 0).setDepth(DEPTH.curralPets)
    root.add(pets)

    let dentro = 0

    return {
        /** A boca do curral, do lado esquerdo: é por onde elas entram. */
        entrada() {
            return { x: CURRAL.cx - CURRAL.w / 2 + 16, y }
        },

        vazio() {
            pets.removeAll(true)
            dentro = 0
        },

        get total() {
            return dentro
        },

        /**
         * Recebe a criaturinha. A silhueta some num corpo de 40 px sem contorno
         * próprio, então cada uma ganha uma mancha da cor dela por baixo — é o
         * contorno que a arte não tem como escalar.
         */
        async receber(c: Criatura) {
            if (dentro >= VAGAS) return
            const spot = vaga(dentro)
            dentro += 1

            const cor = COR[c.cor]
            const halo = scene.add.graphics().setPosition(spot.x, spot.y + 4)
            halo.fillStyle(cor.line, 0.35)
            halo.fillEllipse(0, 6, 40, 14)
            pets.add(halo)

            const small = scaleOf(c.pequena) * 0.42
            const sprite = scene.add
                .sprite(spot.x, spot.y + RECORTE[c.frame].footPad * small, SHEET.criaturinhas, c.frame)
                .setOrigin(RECORTE[c.frame].originX, 1)
                .setScale(small)
            pets.add(sprite)

            sprite.setAlpha(0).setY(sprite.y - 44)
            halo.setAlpha(0)
            await FX.all(
                FX.to(scene, sprite, { alpha: 1, y: sprite.y + 44 }, { duration: 320, ease: 'Bounce.easeOut' }),
                FX.to(scene, halo, { alpha: 1 }, { duration: 320 }),
            )
            void FX.sparks(scene, CURRAL.cx + spot.x, y + spot.y, { count: 7, color: C.gold })
        },

        /** A foto do fim da onda: o curral cheio respira e pisca uma vez. */
        async celebrar() {
            await FX.impact(scene, root, 0.1)
            if (dentro === 0) return
            void FX.stars(scene, CURRAL.cx, y - 20, { count: 10 })
        },

        bounds() {
            return { x: CURRAL.cx, y, w: CURRAL.w + 24, h: CURRAL.w * 0.6 }
        },

        destroy() {
            FX.kill(scene, root)
            root.destroy(true)
        },
    }
}

export type Curral = ReturnType<typeof createCurral>
