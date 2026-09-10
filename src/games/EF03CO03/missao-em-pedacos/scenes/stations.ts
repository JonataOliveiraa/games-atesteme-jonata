import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, STATION, WORLD } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import type { Station } from '../types'

interface Placed {
    station: Station
    art: Phaser.GameObjects.Image | null
    mark: Phaser.GameObjects.Graphics
    label: Phaser.GameObjects.Text
    done: boolean
}

/**
 * AS ESTAÇÕES DO MAPA.
 *
 * Cada uma fica no chão, num ponto fixo, e mostra o quadro do `final-nN` que ela
 * vai virar — mas ESCURECIDO, como uma sombra do que ainda não aconteceu.
 * Quando a criança chega com o que ela pede, o desenho acende.
 *
 * A silhueta é de propósito: ela diz "aqui vai a chaleira no fogo" antes de a
 * chaleira chegar, e é isso que faz a criança entender o que está carregando e
 * para onde. Sem ela a estação seria um ponto invisível do mapa.
 */
export function createStations(scene: Phaser.Scene) {
    let list: Placed[] = []

    const clear = () => {
        list.forEach(placed => {
            scene.tweens.killTweensOf(placed.art ?? placed.mark)
            placed.art?.destroy()
            placed.mark.destroy()
            placed.label.destroy()
        })
        list = []
    }

    const paintMark = (g: Phaser.GameObjects.Graphics, x: number, done: boolean) => {
        g.clear()
        g.fillStyle(C.ink, 0.18)
        g.fillEllipse(x, WORLD.groundY + 6, STATION.size * 0.86, 30)
        if (done) return
        g.lineStyle(6, C.gold, 0.9)
        g.strokeRoundedRect(
            x - STATION.size / 2,
            WORLD.groundY - STATION.size,
            STATION.size,
            STATION.size,
            26,
        )
    }

    return {
        spawn(stations: Station[], finalKey: string) {
            clear()
            const art = scene.textures.exists(finalKey)
            list = stations.map((station, index) => {
                const mark = scene.add.graphics().setDepth(DEPTH.bench - 1)
                paintMark(mark, station.x, false)

                const image = art
                    ? scene.add
                          .image(station.x, WORLD.groundY + 6, finalKey, station.frame)
                          .setOrigin(0.5, 1)
                          .setDisplaySize(STATION.size, STATION.size)
                          .setDepth(DEPTH.bench)
                          .setTint(STATION.shadow)
                          .setAlpha(0.85)
                    : null

                const label = scene.add
                    .text(station.x, WORLD.groundY - STATION.size - 26, String(index + 1), {
                        fontFamily: FONT.black,
                        fontSize: '30px',
                        color: CSS.white,
                    })
                    .setOrigin(0.5)
                    .setResolution(2)
                    .setDepth(DEPTH.bench + 1)
                label.setStroke(CSS.ink, 7)

                return { station, art: image, mark, label, done: false }
            })
        },

        /** A estação que o herói está encostando agora, se alguma. */
        touching(heroX: number) {
            return (
                list.find(
                    placed => !placed.done && Math.abs(placed.station.x - heroX) < STATION.reach,
                )?.station ?? null
            )
        },

        /** Atendida: o desenho acende e a moldura sai. */
        async complete(id: string) {
            const placed = list.find(other => other.station.id === id)
            if (!placed) return
            placed.done = true
            paintMark(placed.mark, placed.station.x, true)
            placed.label.setVisible(false)
            void FX.sparks(scene, placed.station.x, WORLD.groundY - STATION.size / 2, {
                color: C.gold,
                count: 18,
            })
            if (!placed.art) {
                await FX.wait(scene, 420)
                return
            }
            placed.art.clearTint().setAlpha(1)
            await FX.to(
                scene,
                placed.art,
                { displayWidth: STATION.size * 1.16, displayHeight: STATION.size * 1.16 },
                { duration: 200, ease: 'Back.easeOut' },
            )
            await FX.to(
                scene,
                placed.art,
                { displayWidth: STATION.size, displayHeight: STATION.size },
                { duration: 180 },
            )
        },

        /** Fora de hora ou sem o que ela pede: só balança. */
        async refuse(id: string) {
            const placed = list.find(other => other.station.id === id)
            if (!placed?.art) return
            await FX.shake(scene, placed.art, { amount: 12 })
        },

        allDone() {
            return list.length > 0 && list.every(placed => placed.done)
        },

        position(id: string) {
            const placed = list.find(other => other.station.id === id)
            return { x: placed?.station.x ?? 0, y: WORLD.groundY - STATION.size / 2 }
        },

        setVisible(value: boolean) {
            list.forEach(placed => {
                placed.art?.setVisible(value)
                placed.mark.setVisible(value)
                placed.label.setVisible(value && !placed.done)
            })
        },

        clear,

        destroy() {
            clear()
        },
    }
}

export type Stations = ReturnType<typeof createStations>
