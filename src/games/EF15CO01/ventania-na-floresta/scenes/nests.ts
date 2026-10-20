import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { CHICK_SHEET, NEST_CELL, NEST_SHEET, OBJECT2_CELL, OBJECT2_SHEET, PIPA_CELL, cellKey, chickCell, sheetData } from '../data/files'
import { DEPTH, NEST } from '../data/layout'
import { nestOf } from '../data/logic'
import { C, COR } from '../data/theme'
import { TIMING } from '../data/timing'
import type { Bird, Cor, FichaPhase, Field, Rect, Vec } from '../types'
import { baked } from './art'
import type { Pipa } from './pipa'

export interface Nests {
    build(phase: FichaPhase): void
    hide(): void
    scatter(): Promise<void>
    bring(index: number): Promise<void>
    holding(): Bird | undefined
    activate(onNest: (index: number) => void): void
    deactivate(): void
    fly(index: number): Promise<void>
    settle(index: number): Promise<void>
    mismatch(index: number, field: Field): Promise<void>
    showMatch(bird: Bird): Promise<void>
    celebrate(): Promise<void>
    nestCenter(index: number): Vec
    cardRect(index: number): Rect
    labelsRect(index: number): Rect
    nestsRect(): Rect
    destroy(): void
}

interface Chick {
    def: Bird
    box: Phaser.GameObjects.Container
    sprite: Phaser.GameObjects.Image
    crest?: Phaser.GameObjects.Image
}

interface Card {
    box: Phaser.GameObjects.Container
    rows: Phaser.GameObjects.Container[]
    glows: Phaser.GameObjects.Image[]
    h: number
}

interface NestArt {
    parts: Phaser.GameObjects.Image[]
    scale: number
}

const RING_KEY = 'vnf-label-ring'
const NONE_KEY = 'vnf-none'
const GLOW_KEY = 'vnf-row-glow'
const BEAK_KEY = 'vnf-beak-ring'
const dotKey = (cor: Cor) => `vnf-dot-${cor}`

function ensureCardBits(scene: Phaser.Scene) {
    const r = NEST.labelR
    baked(scene, RING_KEY, r * 2 + 4, r * 2 + 4, g => {
        g.fillStyle(C.labelRing, 1)
        g.fillCircle(r + 2, r + 2, r)
        g.lineStyle(3, C.labelIcon, 0.7)
        g.strokeCircle(r + 2, r + 2, r - 1)
    })
    const d = NEST.dotR
    ;(['laranja', 'verde', 'roxo'] as Cor[]).forEach(cor =>
        baked(scene, dotKey(cor), d * 2 + 6, d * 2 + 6, g => {
            g.fillStyle(COR[cor].fill, 1)
            g.fillCircle(d + 3, d + 3, d)
            g.lineStyle(4, COR[cor].dark, 1)
            g.strokeCircle(d + 3, d + 3, d)
            g.fillStyle(C.white, 0.45)
            g.fillCircle(d - 3, d - 3, d * 0.3)
        }),
    )
    baked(scene, NONE_KEY, 48, 14, g => {
        g.fillStyle(C.labelIcon, 0.75)
        g.fillRoundedRect(2, 2, 44, 10, 5)
    })
    const gw = NEST.cardW - NEST.cardPad
    const gh = NEST.row - 6
    baked(scene, GLOW_KEY, gw, gh, g => {
        g.fillStyle(C.butter, 0.8)
        g.fillRoundedRect(0, 0, gw, gh, gh / 2)
        g.lineStyle(4, C.ringYellow, 1)
        g.strokeRoundedRect(2, 2, gw - 4, gh - 4, gh / 2 - 2)
    })
    baked(scene, BEAK_KEY, 64, 64, g => {
        g.lineStyle(7, C.ringRim, 0.5)
        g.strokeCircle(32, 32, 26)
        g.lineStyle(4, C.ringYellow, 1)
        g.strokeCircle(32, 32, 26)
    })
}

export function createNests(scene: Phaser.Scene, pipa: Pipa): Nests {
    ensureCardBits(scene)
    let phase: FichaPhase | undefined
    let nests: NestArt[] = []
    let cards: Card[] = []
    let chicks: (Chick | undefined)[] = []
    let homed: (Chick | undefined)[] = []
    let carried: Chick | undefined
    let pile: Phaser.GameObjects.Image | undefined
    const zones: Phaser.GameObjects.Zone[] = []
    const rings: Phaser.GameObjects.Graphics[] = []
    const marks = new Set<Phaser.GameObjects.Image>()

    const xs = () => NEST.xs[(phase as FichaPhase).nests.length]
    const chickScale = () => NEST.chickH / (sheetData(scene, CHICK_SHEET).maxH ?? 200)
    const cardH = () => {
        const frame = scene.textures.get(OBJECT2_SHEET.key).get(cellKey(OBJECT2_CELL.card))
        return Math.max(NEST.cardTop + (phase as FichaPhase).fields.length * NEST.row + NEST.cardPad, NEST.cardW * frame.height / frame.width)
    }
    const scaleNest = (nest: NestArt, factor = 1) => nest.parts.forEach(part => part.setScale(nest.scale * factor))

    const makeChick = (def: Bird) => {
        const sprite = scene.add.image(0, 0, CHICK_SHEET.key, cellKey(chickCell(def))).setOrigin(0.5, 1)
        sprite.setScale(chickScale())
        const parts: Phaser.GameObjects.GameObject[] = [sprite]
        let crest: Phaser.GameObjects.Image | undefined
        if (def.topete) {
            crest = scene.add
                .image(sprite.displayWidth * NEST.crest.x, sprite.displayHeight * NEST.crest.y, OBJECT2_SHEET.key, cellKey(OBJECT2_CELL.crest))
                .setOrigin(0.5, 0.85)
                .setTint(COR[def.pena].fill)
            crest.setScale((sprite.displayWidth * NEST.crest.w) / crest.width)
            parts.push(crest)
        }
        const box = scene.add.container(0, 0, parts)
        return { def, box, sprite, crest }
    }

    const valueOf = (field: Field, nest: Bird) => {
        if (field === 'topete') {
            if (!nest.topete) return scene.add.image(0, 0, NONE_KEY)
            const img = scene.add.image(0, 6, OBJECT2_SHEET.key, cellKey(OBJECT2_CELL.crest)).setTint(COR[nest.pena].fill)
            return img.setScale(36 / img.height)
        }
        return scene.add.image(0, 0, dotKey(nest[field]))
    }

    const LABEL_CELL: Record<Field, number> = { pena: OBJECT2_CELL.pena, bico: OBJECT2_CELL.bico, topete: OBJECT2_CELL.topete }

    const makeCard = (nest: Bird, x: number): Card => {
        const p = phase as FichaPhase
        const h = cardH()
        const art = scene.add.image(0, 0, OBJECT2_SHEET.key, cellKey(OBJECT2_CELL.card)).setOrigin(0.5, 0)
        art.setScale(Math.min(NEST.cardW / art.width, h / art.height))
        const rowH = (h - NEST.cardTop - NEST.cardPad) / p.fields.length
        const glows: Phaser.GameObjects.Image[] = []
        const rows = p.fields.map((field, r) => {
            const y = NEST.cardTop + (r + 0.5) * rowH
            const glow = scene.add.image(0, 0, GLOW_KEY).setVisible(false)
            glows.push(glow)
            const ring = scene.add.image(-NEST.cardW * 0.22, 0, RING_KEY)
            const icon = scene.add.image(ring.x, 0, OBJECT2_SHEET.key, cellKey(LABEL_CELL[field]))
            icon.setScale((NEST.labelR * 1.5) / Math.max(icon.width, icon.height))
            const value = valueOf(field, nest).setX(NEST.cardW * 0.2)
            return scene.add.container(0, y, [glow, ring, icon, value])
        })
        const box = scene.add.container(x, NEST.cardY, [art, ...rows]).setDepth(DEPTH.stake)
        return { box, rows, glows, h }
    }

    const nestSpot = (i: number): Vec => ({ x: xs()[i], y: NEST.chickY })

    const unhook = () => {
        nests.forEach(nest => scaleNest(nest))
        zones.forEach(z => z.destroy())
        zones.length = 0
        rings.forEach(r => {
            scene.tweens.killTweensOf(r)
            r.destroy()
        })
        rings.length = 0
    }

    const dropChick = (c?: Chick) => {
        if (!c) return
        scene.tweens.killTweensOf([c.box, c.sprite])
        if (c.crest) scene.tweens.killTweensOf(c.crest)
        c.box.destroy()
    }

    const clear = () => {
        unhook()
        marks.forEach(m => {
            scene.tweens.killTweensOf(m)
            m.destroy()
        })
        marks.clear()
        nests.forEach(n => n.parts.forEach(part => part.destroy()))
        cards.forEach(c => {
            scene.tweens.killTweensOf([c.box, ...c.rows, ...c.glows])
            c.box.destroy()
        })
        chicks.forEach(dropChick)
        homed.forEach(c => {
            if (c && !chicks.includes(c)) dropChick(c)
        })
        if (carried && !chicks.includes(carried)) dropChick(carried)
        pile?.destroy()
        nests = []
        cards = []
        chicks = []
        homed = []
        carried = undefined
        pile = undefined
    }

    const flutter = (c: Chick, to: Vec, height: number, ms: number) => {
        const s = c.sprite.scaleY
        const flap = scene.tweens.add({ targets: c.sprite, scaleY: s * 0.86, duration: FX.ms(scene, 90), yoyo: true, repeat: -1 })
        c.sprite.setFlipX(to.x > c.box.x)
        return FX.arcTo(scene, c.box, to, { height, duration: ms }).then(() => {
            flap.stop()
            c.sprite.setScale(c.sprite.scaleX, s)
        })
    }

    const blinkPart = async (c: Chick, field: Field, times = 3) => {
        if (field === 'pena') {
            for (let k = 0; k < times; k++) {
                c.sprite.setTintFill(C.white)
                await FX.wait(scene, 130)
                c.sprite.clearTint()
                await FX.wait(scene, 150)
            }
            return
        }
        if (field === 'topete' && c.crest) {
            for (let k = 0; k < times; k++) {
                await FX.to(scene, c.crest, { alpha: 0.15 }, { duration: 130 })
                await FX.to(scene, c.crest, { alpha: 1 }, { duration: 150 })
            }
            return
        }
        const w = c.sprite.displayWidth
        const h = c.sprite.displayHeight
        const flip = c.sprite.flipX ? -1 : 1
        const at = field === 'bico' ? { x: NEST.beak.x * w * flip, y: NEST.beak.y * h } : { x: NEST.crest.x * w, y: NEST.crest.y * h - 10 }
        const ring = scene.add.image(c.box.x + at.x, c.box.y + at.y, BEAK_KEY).setDepth(DEPTH.fx).setScale(0.9)
        marks.add(ring)
        for (let k = 0; k < times; k++) {
            await FX.to(scene, ring, { alpha: 0.1 }, { duration: 140 })
            await FX.to(scene, ring, { alpha: 1 }, { duration: 160 })
        }
        await FX.to(scene, ring, { alpha: 0 }, { duration: 200 })
        marks.delete(ring)
        ring.destroy()
    }

    const view: Nests = {
        build(next) {
            clear()
            phase = next
            ensureCardBits(scene)
            pile = scene.add.image(NEST.pile.x, NEST.pile.y, OBJECT2_SHEET.key, cellKey(OBJECT2_CELL.pile)).setOrigin(0.5, 1).setDepth(DEPTH.trail)
            pile.setScale(NEST.pile.w / pile.width)
            next.nests.forEach((nest, i) => {
                const x = xs()[i]
                if (scene.textures.exists(NEST_SHEET.key)) {
                    const scale = NEST.w / (sheetData(scene, NEST_SHEET).maxW ?? NEST_SHEET.cellW)
                    const back = scene.add.image(x, NEST.y, NEST_SHEET.key, cellKey(NEST_CELL.back)).setDepth(DEPTH.piece - 2)
                    const front = scene.add.image(x, NEST.y, NEST_SHEET.key, cellKey(NEST_CELL.front)).setDepth(DEPTH.piece)
                    const art = { parts: [back, front], scale }
                    scaleNest(art)
                    nests.push(art)
                } else {
                    const img = scene.add.image(x, NEST.y, OBJECT2_SHEET.key, cellKey(OBJECT2_CELL.nest)).setOrigin(0.5, 0.62).setDepth(DEPTH.piece - 2)
                    const art = { parts: [img], scale: NEST.w / img.width }
                    scaleNest(art)
                    nests.push(art)
                }
                cards.push(makeCard(nest, x))
            })
            homed = next.nests.map(() => undefined)
            chicks = next.bring.map(def => {
                const c = makeChick(def)
                const home = nestOf(next.nests, def, next.fields)
                const at = nestSpot(home)
                c.box.setPosition(at.x, at.y).setDepth(DEPTH.piece - 1)
                homed[home] = c
                return c
            })
            pipa.stand(NEST.pipa.x, NEST.pipa.y)
            pipa.face(true)
        },
        hide() {
            clear()
            phase = undefined
        },
        async scatter() {
            const p = phase as FichaPhase
            pipa.brace(true)
            homed = p.nests.map(() => undefined)
            const jobs = chicks.map((c, i) => {
                if (!c) return Promise.resolve()
                const spot = NEST.spots[i]
                const to = { x: NEST.pile.x + spot.dx, y: NEST.pile.y + spot.dy }
                return FX.wait(scene, i * 130).then(async () => {
                    c.box.setDepth(DEPTH.flying)
                    void FX.to(scene, c.sprite, { angle: 360 + spot.a }, { duration: TIMING.tumble, ease: 'Sine.easeOut' })
                    await FX.arcTo(scene, c.box, to, { height: 140, duration: TIMING.tumble })
                    c.box.setDepth(DEPTH.piece + 2 + i * 0.1)
                    await FX.impact(scene, c.sprite, 0.16)
                })
            })
            void FX.all(...cards.map((c, i) => FX.wait(scene, i * 80).then(() => FX.to(scene, c.box, { angle: 7 }, { duration: 200, yoyo: true, repeat: 1 }))))
            await FX.all(...jobs)
            pipa.brace(false)
            pipa.pose(PIPA_CELL.surprised)
        },
        async bring(index) {
            const c = chicks[index]
            if (!c) return
            chicks[index] = undefined
            pipa.pose(PIPA_CELL.point)
            c.sprite.setAngle(0)
            c.box.setDepth(DEPTH.flying)
            await flutter(c, NEST.hold, 150, TIMING.fly + 120)
            pipa.pose(PIPA_CELL.cheer)
            c.box.setDepth(DEPTH.pipa + 1)
            c.sprite.setFlipX(false)
            carried = c
            await FX.impact(scene, c.sprite, 0.12)
            await FX.wait(scene, TIMING.pick)
        },
        holding: () => carried?.def,
        activate(onNest) {
            view.deactivate()
            const p = phase as FichaPhase
            p.nests.forEach((_, i) => {
                if (homed[i]) return
                const r = view.cardRect(i)
                const top = NEST.chickY - NEST.chickH - 14
                const bottom = r.y + r.h / 2 + 8
                const w = Math.max(NEST.cardW, NEST.w) + 28
                const h = bottom - top
                const ring = scene.add.graphics().setDepth(DEPTH.ring).setPosition(r.x, (top + bottom) / 2)
                ring.lineStyle(11, C.ringRim, 0.5)
                ring.strokeRoundedRect(-w / 2, -h / 2, w, h, 30)
                ring.lineStyle(6, C.ringYellow, 1)
                ring.strokeRoundedRect(-w / 2, -h / 2, w, h, 30)
                scene.tweens.add({ targets: ring, alpha: 0.35, scale: 1.03, duration: 620, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
                rings.push(ring)
                const zone = scene.add
                    .zone(r.x, (top + bottom) / 2, w + 20, h)
                    .setDepth(DEPTH.fx)
                    .setInteractive({ useHandCursor: true })
                const nest = nests[i]
                zone.on('pointerover', () => scaleNest(nest, 1.05))
                zone.on('pointerout', () => scaleNest(nest))
                zone.on('pointerdown', () => {
                    scaleNest(nest)
                    onNest(i)
                })
                zones.push(zone)
            })
        },
        deactivate: unhook,
        async fly(index) {
            const c = carried
            if (!c) return
            pipa.pose(PIPA_CELL.point)
            c.box.setDepth(DEPTH.flying)
            const to = nestSpot(index)
            await flutter(c, { x: to.x, y: to.y - 40 }, 120, TIMING.fly + 200)
            c.box.setDepth(DEPTH.piece - 1)
            await FX.to(scene, c.box, { y: to.y }, { duration: 200, ease: 'Sine.easeIn' })
            c.sprite.setFlipX(false)
            carried = undefined
            homed[index] = c
            pipa.pose(PIPA_CELL.idle)
        },
        async settle(index) {
            const c = homed[index]
            const card = cards[index]
            if (!c) return
            void FX.sparks(scene, c.box.x, c.box.y - NEST.chickH * 0.6, { color: C.butter, count: 12, spread: 80, size: 8, depth: DEPTH.fx })
            void FX.to(scene, card.box, { angle: 6 }, { duration: 180, yoyo: true, repeat: 1, ease: 'Sine.easeInOut' })
            await FX.to(scene, c.box, { y: c.box.y - 18 }, { duration: 150, yoyo: true, ease: 'Sine.easeOut' })
            await FX.impact(scene, c.sprite, 0.12)
        },
        async mismatch(index, field) {
            const p = phase as FichaPhase
            const c = homed[index]
            const card = cards[index]
            const r = p.fields.indexOf(field)
            const row = card.rows[r]
            const glow = card.glows[r]
            if (c) void FX.to(scene, c.sprite, { angle: -16 }, { duration: 220, ease: 'Sine.easeOut' })
            glow.setVisible(true).setAlpha(0)
            void FX.to(scene, glow, { alpha: 1 }, { duration: 200 })
            const jobs: Promise<void>[] = [FX.shake(scene, row, { amount: 8, times: 5 })]
            if (c) jobs.push(blinkPart(c, field, 4))
            await FX.all(...jobs)
            if (c) await FX.shake(scene, c.box, { amount: 6, times: 3 })
        },
        async showMatch(bird) {
            const p = phase as FichaPhase
            const home = nestOf(p.nests, bird, p.fields)
            const card = cards[home]
            const c = carried
            for (let r = 0; r < p.fields.length; r++) {
                const glow = card.glows[r]
                glow.setVisible(true).setAlpha(0)
                void FX.to(scene, glow, { alpha: 1 }, { duration: 200 })
                void FX.to(scene, card.rows[r], { scale: 1.1 }, { duration: 160, yoyo: true })
                if (c) await blinkPart(c, p.fields[r], 2)
                else await FX.wait(scene, 560)
                await FX.wait(scene, 160)
            }
            await FX.wait(scene, 300)
            await FX.all(...card.glows.map(g => FX.to(scene, g, { alpha: 0 }, { duration: 220 })))
            card.glows.forEach(g => g.setVisible(false))
        },
        async celebrate() {
            pipa.pose(PIPA_CELL.cheer)
            const jobs = homed.map((c, i) =>
                FX.wait(scene, i * 110).then(async () => {
                    if (!c) return
                    void FX.to(scene, cards[i].box, { angle: 6 }, { duration: 200, yoyo: true, repeat: 1 })
                    await FX.to(scene, c.box, { y: c.box.y - 26 }, { duration: 170, yoyo: true, ease: 'Sine.easeOut' })
                }),
            )
            await FX.all(...jobs)
            await FX.wait(scene, 200)
            pipa.pose(PIPA_CELL.idle)
        },
        nestCenter(index) {
            return { x: xs()[index], y: NEST.y - 10 }
        },
        cardRect(index) {
            const h = cardH()
            return { x: xs()[index], y: NEST.cardY + h / 2, w: NEST.cardW + 10, h: h + 10 }
        },
        labelsRect(index) {
            const h = cardH() - NEST.cardTop - NEST.cardPad
            return { x: xs()[index] - NEST.cardW * 0.22, y: NEST.cardY + NEST.cardTop + h / 2, w: NEST.labelR * 2 + 26, h: h + 8 }
        },
        nestsRect() {
            const list = xs()
            const h = cardH()
            const top = NEST.chickY - NEST.chickH - 14
            const bottom = NEST.cardY + h + 10
            return { x: (list[0] + list[list.length - 1]) / 2, y: (top + bottom) / 2, w: list[list.length - 1] - list[0] + Math.max(NEST.cardW, NEST.w) + 40, h: bottom - top }
        },
        destroy() {
            clear()
        },
    }
    return view
}
