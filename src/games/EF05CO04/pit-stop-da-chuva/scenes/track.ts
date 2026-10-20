import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { MUD_KEY, PIECE_CELL, PIECE_SHEET, TENT_KEY, TRACK_KEY, TRAIL_CELL, TRAIL_KEY, TRAIL_SHEET, cellKey } from '../data/files'
import { CAR_X, DEPTH, FINISH, HAY, MUD, PIT_LANE, PIT_MARK, PUDDLES, STRIP, TENT, TRACK_BAND, TRAIL, W } from '../data/layout'
import { totalOf } from '../data/levels'
import { C } from '../data/theme'
import type { LevelDef, Sector } from '../types'
import type { View } from './view'

/**
 * O mundo que corre. Tudo é desenhado em função da distância da Kika (`d`):
 * ela fica em CAR_X, e um ponto `p` da corrida aparece em CAR_X + (p − d).
 * O que é da volta (tendas, poças, chegada) se repete a cada `lap`; a lama e a
 * trilha estreita são trechos da corrida, em distância absoluta.
 */
export interface Track {
    readonly d: number
    paint(d: number): void
    screenX(p: number): number
    near(q: number): number
    setWet(on: boolean, ms: number): Promise<void>
    mark(p: number | null): void
    hay(p: number | null): void
    hayX(): number
    tentRect(p: number): { x: number; y: number; w: number; h: number }
    gateAhead(p: number): number | null
    cones(p: number | null): void
    bump(p: number): Promise<void>
    destroy(): void
}

export function createTrack(scene: Phaser.Scene, view: View, level: LevelDef): Track {
    const L = level.lap
    const strip = view.world(scene.add.tileSprite(0, STRIP.y, W, STRIP.h, TRACK_KEY).setOrigin(0, 0).setDepth(DEPTH.strip))
    const src = scene.textures.get(TRACK_KEY).getSourceImage() as { width: number; height: number }
    const sx = W / src.width
    strip.setTileScale(sx, STRIP.h / src.height)

    const total = totalOf(level)
    const band = (key: string, sectors: Sector[]) => {
        const src = scene.textures.get(key).getSourceImage() as { width: number; height: number }
        const scale = { x: W / src.width, y: MUD.h / src.height }
        return sectors.map(s => {
            const t = view.world(scene.add.tileSprite(0, MUD.y, W, MUD.h, key).setOrigin(0, 0).setDepth(DEPTH.mud))
            t.setTileScale(scale.x, scale.y)
            return { t, s, scale }
        })
    }
    const muds = band(MUD_KEY, level.mud)
    const trails = band(
        TRAIL_KEY,
        level.narrow.map(s => ({ from: s.from <= 0 ? -W * 2 : s.from + TRAIL.mouth, to: s.to >= total ? total + W * 2 : s.to - TRAIL.mouth })),
    )
    const entries = level.narrow.filter(s => s.from > 0).map(s => s.from + TRAIL.mouth)

    const coneSet = (at: number | null) => {
        const imgs = TRAIL.cones.map(c => {
            const img = view.world(scene.add.image(0, c.y, TRAIL_SHEET.key, cellKey(TRAIL_CELL.cone)).setOrigin(0.5, 1).setDepth(DEPTH.cone))
            return img.setScale(TRAIL.coneH / img.frame.height)
        })
        return { at, imgs }
    }
    const gates = entries.map(p => coneSet(p))
    const spare = coneSet(null)
    const signs = entries.map(p => {
        const img = view.world(scene.add.image(0, TRAIL.signY, TRAIL_SHEET.key, cellKey(TRAIL_CELL.sign)).setOrigin(0.5, 1).setDepth(DEPTH.sign))
        img.setScale(TRAIL.signH / img.frame.height)
        return { img, at: p - TRAIL.sign }
    })

    const tents = level.boxes.map(() => {
        const img = view.world(scene.add.image(0, TENT.base, TENT_KEY).setOrigin(0.5, 1).setDepth(DEPTH.tent))
        return img.setScale(TENT.w / img.frame.width)
    })

    const puddles = PUDDLES.at.map(() => {
        const img = view.world(scene.add.image(0, PUDDLES.y, PIECE_SHEET.key, cellKey(PIECE_CELL.puddle)).setDepth(DEPTH.puddle).setAlpha(0))
        return img.setScale(PUDDLES.w / img.frame.width)
    })

    const finish = view.world(scene.add.graphics().setDepth(DEPTH.finish))
    const cells = 7
    const cell = FINISH.w / 2
    for (let y = PIT_LANE.top; y < TRACK_BAND.bottom; y += cell)
        for (let c = 0; c < 2; c++) {
            finish.fillStyle(((y - PIT_LANE.top) / cell + c) % 2 ? C.white : C.flagDark, 1)
            finish.fillRect(-FINISH.w / 2 + c * cell, y, cell, cell)
        }
    ;[-1, 1].forEach(side => {
        const x = side * (FINISH.w / 2 + 10)
        finish.fillStyle(C.metalDark, 1)
        finish.fillRect(x - 5, PIT_LANE.top - FINISH.poleH, 10, FINISH.poleH)
    })
    finish.fillStyle(C.line, 1)
    finish.fillRect(-FINISH.w / 2 - 30, PIT_LANE.top - FINISH.poleH - 6, FINISH.w + 60, 40)
    for (let c = 0; c < cells; c++) {
        finish.fillStyle(c % 2 ? C.white : C.flagDark, 1)
        finish.fillRect(-FINISH.w / 2 - 26 + (c * (FINISH.w + 52)) / cells, PIT_LANE.top - FINISH.poleH - 2, (FINISH.w + 52) / cells, 16)
        finish.fillStyle(c % 2 ? C.flagDark : C.white, 1)
        finish.fillRect(-FINISH.w / 2 - 26 + (c * (FINISH.w + 52)) / cells, PIT_LANE.top - FINISH.poleH + 14, (FINISH.w + 52) / cells, 16)
    }

    const markG = view.world(scene.add.graphics().setDepth(DEPTH.pitMark).setVisible(false))
    const markW = 360
    markG.fillStyle(C.pit, 0.35)
    markG.fillRoundedRect(-markW / 2, PIT_MARK.y - PIT_MARK.h / 2, markW, PIT_MARK.h, 10)
    markG.lineStyle(6, C.pit, 1)
    markG.strokeRoundedRect(-markW / 2, PIT_MARK.y - PIT_MARK.h / 2, markW, PIT_MARK.h, 10)
    markG.lineStyle(8, C.white, 1)
    markG.lineBetween(markW / 2 - 40, PIT_MARK.y - PIT_MARK.h / 2 + 6, markW / 2 - 40, PIT_MARK.y + PIT_MARK.h / 2 - 6)
    let markAt: number | null = null
    const pulse = scene.tweens.add({ targets: markG, alpha: 0.45, duration: 420, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', paused: true })

    const hayImg = view.world(scene.add.image(0, HAY.y, PIECE_SHEET.key, cellKey(PIECE_CELL.hay)).setOrigin(0.5, 1).setDepth(DEPTH.hay).setVisible(false))
    hayImg.setScale(HAY.size / Math.max(hayImg.frame.width, hayImg.frame.height))
    let hayAt: number | null = null

    let d = 0
    const view0 = W / 2 - CAR_X
    const screenX = (p: number) => CAR_X + (p - d)
    const near = (q: number) => q + L * Math.round((d + view0 - q) / L)

    const paint = () => {
        strip.tilePositionX = d / sx
        ;[...muds, ...trails].forEach(({ t, s, scale }) => {
            const x0 = screenX(s.from)
            const a = Math.max(0, x0)
            const b = Math.min(W, screenX(s.to))
            if (b <= a) {
                t.setVisible(false)
                return
            }
            t.setVisible(true).setPosition(a, MUD.y)
            t.setSize(b - a, MUD.h)
            t.tilePositionX = (a - x0 + s.from) / scale.x
        })
        ;[...gates, spare].forEach(g => {
            g.imgs.forEach((img, i) => {
                if (g.at === null) return img.setVisible(false)
                const x = screenX(g.at) + TRAIL.cones[i].dx
                img.setVisible(x > -100 && x < W + 100).setX(x)
            })
        })
        signs.forEach(s => s.img.setX(screenX(s.at)))
        level.boxes.forEach((q, i) => tents[i].setX(screenX(near(q))))
        puddles.forEach((img, i) => img.setX(screenX(near(PUDDLES.at[i] * L))))
        finish.setX(screenX(near(0)))
        if (markAt !== null) markG.setX(screenX(markAt))
        if (hayAt !== null) hayImg.setX(screenX(hayAt))
    }

    const track: Track = {
        get d() {
            return d
        },
        paint(next) {
            d = next
            paint()
        },
        screenX,
        near,
        setWet(on, ms) {
            return FX.to(scene, puddles, { alpha: on ? 1 : 0 }, { duration: ms })
        },
        mark(p) {
            markAt = p
            markG.setVisible(p !== null)
            if (p !== null) {
                markG.setAlpha(1)
                pulse.resume()
                paint()
            } else pulse.pause()
        },
        hay(p) {
            hayAt = p
            hayImg.setVisible(p !== null)
            paint()
        },
        hayX: () => hayImg.x,
        tentRect(p) {
            const x = screenX(p)
            return { x, y: TENT.base - 110, w: TENT.w, h: 240 }
        },
        gateAhead(p) {
            return entries.find(e => e > p && e - p < TRAIL.ahead) ?? null
        },
        cones(p) {
            spare.at = p
            paint()
        },
        async bump(p) {
            const g = [...gates, spare].find(x => x.at !== null && Math.abs(x.at - p) < 10)
            if (!g) return
            await FX.all(
                ...g.imgs.map((img, i) =>
                    FX.to(scene, img, { angle: i % 2 ? -14 : 14 }, { duration: 110, yoyo: true, repeat: 2, delay: i * 40 }).then(() => img.setAngle(0)),
                ),
            )
        },
        destroy() {
            pulse.remove()
            const cones = [...gates, spare].flatMap(g => g.imgs)
            scene.tweens.killTweensOf([...puddles, markG, ...cones])
            ;[strip, ...muds.map(m => m.t), ...trails.map(m => m.t), ...cones, ...signs.map(s => s.img), ...tents, ...puddles, finish, markG, hayImg].forEach(o => o.destroy())
        },
    }
    paint()
    return track
}
