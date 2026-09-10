import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BUCKET, DEPTH, LANE } from '../data/layout'
import { C, FORMAT } from '../data/theme'
import type { FormatId } from '../types'

interface Lane {
    format: FormatId
    x: number
    bucket: Phaser.GameObjects.Container
    face: Phaser.GameObjects.Graphics
    dots: Phaser.GameObjects.Graphics
    stored: number
}

/**
 * As pistas e as caixas de formato. Cada caixa mostra o ícone de `formatos`
 * — som, texto, imagem e vídeo — e vai enchendo com o que foi guardado ali.
 * Quantas pistas existem muda por onda, e a largura acompanha: com duas
 * pistas o alvo é enorme; com quatro ele ainda passa de 44 px no celular.
 */
export function createLanes(scene: Phaser.Scene) {
    const columns = scene.add.graphics().setDepth(DEPTH.lane)
    let lanes: Lane[] = []

    const pitchFor = (count: number) => Math.min(LANE.maxPitch, LANE.span / count)

    const paintColumns = () => {
        columns.clear()
        const pitch = pitchFor(lanes.length)
        const width = Math.min(LANE.width, pitch - 14)
        lanes.forEach(lane => {
            columns.fillStyle(C.white, 0.16)
            columns.fillRoundedRect(lane.x - width / 2, LANE.top, width, BUCKET.y - LANE.top - 40, 26)
            columns.lineStyle(3, C.white, 0.28)
            columns.strokeRoundedRect(lane.x - width / 2, LANE.top, width, BUCKET.y - LANE.top - 40, 26)
        })
    }

    const paintBucket = (lane: Lane, glow: boolean) => {
        const skin = FORMAT[lane.format]
        const { w, h } = BUCKET
        lane.face.clear()
        lane.face.fillStyle(C.ink, 0.3)
        lane.face.fillRoundedRect(-w / 2 + 5, -h / 2 + 9, w, h, 22)
        lane.face.fillStyle(skin.deep, 1)
        lane.face.fillRoundedRect(-w / 2, -h / 2, w, h, 22)
        lane.face.fillStyle(glow ? C.white : skin.tint, 1)
        lane.face.fillRoundedRect(-w / 2 + 7, -h / 2 + 7, w - 14, h - 18, 17)
        lane.face.fillStyle(C.white, 0.4)
        lane.face.fillRoundedRect(-w / 2 + 18, -h / 2 + 14, w - 36, 12, 6)
    }

    const paintDots = (lane: Lane) => {
        lane.dots.clear()
        const total = Math.min(lane.stored, 6)
        const gap = BUCKET.dot + 6
        const span = (total - 1) * gap
        for (let i = 0; i < total; i++) {
            lane.dots.fillStyle(C.white, 0.9)
            lane.dots.fillCircle(-span / 2 + i * gap, BUCKET.h / 2 - 16, BUCKET.dot / 2)
        }
    }

    const clear = () => {
        lanes.forEach(lane => {
            scene.tweens.killTweensOf(lane.bucket)
            lane.bucket.destroy(true)
        })
        lanes = []
    }

    return {
        build(formats: FormatId[]) {
            clear()
            const pitch = pitchFor(formats.length)
            formats.forEach((format, i) => {
                const x = 640 + (i - (formats.length - 1) / 2) * pitch
                const bucket = scene.add.container(x, BUCKET.y).setDepth(DEPTH.bucket)
                const face = scene.add.graphics()
                const dots = scene.add.graphics()
                bucket.add([face, dots])

                const lane: Lane = { format, x, bucket, face, dots, stored: 0 }
                paintBucket(lane, false)
                paintDots(lane)

                if (scene.textures.exists('formatos')) {
                    // O PNG dos formatos vem com fundo branco; o disco claro
                    // atrás dele faz esse fundo virar parte da caixa.
                    const disc = scene.add.graphics()
                    disc.fillStyle(C.white, 1)
                    disc.fillRoundedRect(-BUCKET.icon / 2 - 4, -BUCKET.icon / 2 - 12, BUCKET.icon + 8, BUCKET.icon + 8, 16)
                    bucket.add(disc)
                    bucket.add(
                        scene.add
                            .image(0, -8, 'formatos', FORMAT[format].icon)
                            .setDisplaySize(BUCKET.icon, BUCKET.icon),
                    )
                }

                lanes.push(lane)
                bucket.setScale(0.7).setAlpha(0)
                void FX.wait(scene, 80 + i * 90).then(() =>
                    FX.to(scene, bucket, { scale: 1, alpha: 1 }, { duration: 320, ease: 'Back.easeOut' }),
                )
            })
            paintColumns()
        },

        /**
         * As caixas trocam de lugar no meio da onda. Elas deslizam, e o que já
         * foi guardado vai junto: a gaveta é a mesma, só mudou de vaga.
         */
        async reorder(formats: FormatId[]) {
            const pitch = pitchFor(formats.length)
            const moved: Lane[] = []
            formats.forEach((format, i) => {
                const lane = lanes.find(item => item.format === format)
                if (!lane) return
                lane.x = 640 + (i - (formats.length - 1) / 2) * pitch
                moved.push(lane)
            })
            lanes = moved
            paintColumns()
            await FX.all(
                ...lanes.map(lane =>
                    FX.to(scene, lane.bucket, { x: lane.x }, { duration: 520, ease: 'Back.easeOut' }),
                ),
            )
        },

        count() {
            return lanes.length
        },

        formatAt(index: number) {
            return lanes[index]?.format ?? null
        },

        xAt(index: number) {
            return lanes[index]?.x ?? 640
        },

        indexOf(format: FormatId) {
            return lanes.findIndex(lane => lane.format === format)
        },

        /** A caixa aceitou: ela pisca e ganha mais uma bolinha. */
        async accept(index: number) {
            const lane = lanes[index]
            if (!lane) return
            lane.stored += 1
            paintDots(lane)
            paintBucket(lane, true)
            void FX.to(scene, lane.bucket, { scaleY: 0.88, scaleX: 1.08 }, { duration: 120, yoyo: true })
            void FX.sparks(scene, lane.x, BUCKET.y - 30, { color: FORMAT[lane.format].tint, count: 16, spread: 150 })
            await FX.wait(scene, 220)
            paintBucket(lane, false)
        },

        /** A caixa errada devolve: um tremor curto, sem estrago. */
        refuse(index: number) {
            const lane = lanes[index]
            if (!lane) return
            return FX.shake(scene, lane.bucket, { times: 3, amount: 9 })
        },

        /** Depois de duas tentativas, a caixa certa respira. */
        hint(format: FormatId) {
            const lane = lanes.find(item => item.format === format)
            if (!lane) return
            scene.tweens.killTweensOf(lane.bucket)
            scene.tweens.add({
                targets: lane.bucket,
                scale: 1.08,
                duration: 520,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
            })
        },

        clearHints() {
            lanes.forEach(lane => {
                scene.tweens.killTweensOf(lane.bucket)
                lane.bucket.setScale(1)
            })
        },

        celebrate() {
            lanes.forEach((lane, i) => {
                if (!lane.stored) return
                void FX.wait(scene, i * 110).then(() =>
                    FX.ping(scene, lane.x, BUCKET.y - 10, FORMAT[lane.format].tint, {
                        radius: 90,
                        depth: DEPTH.stored,
                    }),
                )
            })
        },

        destroy() {
            clear()
            columns.destroy()
        },
    }
}

export type Lanes = ReturnType<typeof createLanes>
