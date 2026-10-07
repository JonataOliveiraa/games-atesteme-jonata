import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, H, MAP, W } from '../data/layout'
import { RIDERS } from '../data/riders'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { MAP_TITLE, NO_TECH } from '../data/words'
import type { RiderId, SituationId } from '../types'
import { riderImage, situationImage } from './art'

export interface Finale {
    map(pairs: [SituationId, RiderId][], onPop: (i: number) => void): Promise<void>
    destroy(): void
}

function noTechTag(scene: Phaser.Scene) {
    const label = scene.add
        .text(0, 0, NO_TECH, { fontFamily: FONT.black, fontSize: `${SIZE.tag}px`, color: CSS.white })
        .setOrigin(0.5)
        .setResolution(2)
    const w = label.width + 18
    const h = SIZE.tag + 12
    const pill = scene.add.graphics()
    pill.fillStyle(C.coral, 1)
    pill.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
    pill.lineStyle(2, C.ink, 1)
    pill.strokeRoundedRect(-w / 2, -h / 2, w, h, h / 2)
    return scene.add.container(0, 0, [pill, label])
}

export function createFinale(scene: Phaser.Scene): Finale {
    const parts: Phaser.GameObjects.GameObject[] = []
    const keep = <T extends Phaser.GameObjects.GameObject>(obj: T) => {
        parts.push(obj)
        return obj
    }

    return {
        async map(pairs, onPop) {
            const veil = keep(scene.add.rectangle(W / 2, H / 2, W, H, C.shadow, 0).setDepth(DEPTH.finale))
            await FX.to(scene, veil, { fillAlpha: 0.4 }, { duration: 260 })

            const panel = scene.add.graphics()
            panel.fillStyle(C.shadow, 0.2)
            panel.fillRoundedRect(-MAP.w / 2 + 5, -MAP.h / 2 + 8, MAP.w, MAP.h, 30)
            panel.fillStyle(C.cream, 1)
            panel.fillRoundedRect(-MAP.w / 2, -MAP.h / 2, MAP.w, MAP.h, 30)
            panel.lineStyle(5, C.ink, 1)
            panel.strokeRoundedRect(-MAP.w / 2, -MAP.h / 2, MAP.w, MAP.h, 30)

            const columnX = (i: number) => (i - (pairs.length - 1) / 2) * MAP.column
            const route = scene.add.graphics()
            route.fillStyle(C.creamDark, 1)
            const left = columnX(0) - MAP.column / 2
            const right = columnX(pairs.length - 1) + MAP.column / 2
            for (let x = left; x < right; x += 26) route.fillRoundedRect(x, MAP.routeY - 4, 16, 8, 4)
            pairs.forEach((_, i) => {
                route.fillStyle(C.yellow, 1)
                route.fillCircle(columnX(i), MAP.routeY, 12)
                route.lineStyle(3, C.ink, 1)
                route.strokeCircle(columnX(i), MAP.routeY, 12)
            })

            const title = scene.add
                .text(0, -MAP.h / 2 + 40, MAP_TITLE, { fontFamily: FONT.black, fontSize: `${SIZE.mapTitle}px`, color: CSS.ink })
                .setOrigin(0.5)
                .setResolution(2)

            const board = keep(scene.add.container(MAP.x, MAP.y, [panel, route, title]).setDepth(DEPTH.finale + 1))
            await FX.popIn(scene, board, { from: 0.7, duration: 420 })

            for (let i = 0; i < pairs.length; i++) {
                const [situation, rider] = pairs[i]
                const x = columnX(i)
                const picture = situationImage(scene, situation, MAP.pictureSize).setPosition(x, MAP.pictureY)
                const art = riderImage(scene, rider, MAP.riderSize).setPosition(x, MAP.riderY)
                const name = scene.add
                    .text(x, MAP.nameY, RIDERS[rider].name, {
                        fontFamily: FONT.black,
                        fontSize: `${SIZE.mapName}px`,
                        color: CSS.ink,
                        align: 'center',
                        wordWrap: { width: MAP.column - 16 },
                    })
                    .setOrigin(0.5, 0)
                    .setResolution(2)
                board.add([picture, art, name])
                const pops = [
                    FX.popIn(scene, picture, { from: 0.3, duration: 300 }),
                    FX.popIn(scene, art, { from: 0.3, delay: 90, duration: 300 }),
                    FX.popIn(scene, name, { from: 0.6, delay: 120, duration: 260 }),
                ]
                if (!RIDERS[rider].tech) {
                    const tag = noTechTag(scene).setPosition(x, MAP.nameY + name.height + 16)
                    board.add(tag)
                    pops.push(FX.popIn(scene, tag, { from: 0.4, delay: 200, duration: 280 }))
                }
                onPop(i)
                await Promise.all(pops)
            }
        },
        destroy() {
            parts.forEach(p => p.destroy())
            parts.length = 0
        },
    }
}
