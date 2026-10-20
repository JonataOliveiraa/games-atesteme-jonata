import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import {
    ANT_CELL,
    ANT_SHEET,
    CHICK_SHEET,
    FLOWER_SHEET,
    HOUSE_SHEET,
    OBJECT_CELL,
    OBJECT_SHEET,
    PIECE_SHEET,
    cellKey,
    flowerCell,
    houseCell,
    pieceCell,
    sheetData,
} from '../data/files'
import { DEPTH, PIECE_TEXT_AT, WHIRL } from '../data/layout'
import { C, CSS, FONT, inkOn } from '../data/theme'
import { TIMING } from '../data/timing'
import { HOME_LABEL, PIECE_TEXT } from '../data/words'
import type { Home, Piece, Rect, RedemoinhoPhase, Vec } from '../types'
import { baked } from './art'

export interface Whirl {
    build(phase: RedemoinhoPhase): void
    hide(): void
    spin(): Promise<void>
    spit(index: number): Promise<void>
    current(): Piece | undefined
    activate(onHome: (home: Home) => void): void
    deactivate(): void
    send(home: Home): Promise<void>
    accept(home: Home): Promise<void>
    reject(home: Home, right: Home): Promise<void>
    pulse(home: Home): Promise<void>
    celebrate(): Promise<void>
    houseCenter(home: Home): Vec
    housesRect(): Rect
    destroy(): void
}

interface House {
    home: Home
    box: Phaser.GameObjects.Container
    art: Phaser.GameObjects.Image
    glow: Phaser.GameObjects.Image
    pill: Phaser.GameObjects.Container
}

const SPIRAL_KEY = 'vnf-spiral'
const GLOW_KEY = 'vnf-house-glow'

function ensureWhirlBits(scene: Phaser.Scene) {
    const s = WHIRL.size
    baked(scene, SPIRAL_KEY, s, s, g => {
        const c = s / 2
        for (let arm = 0; arm < 4; arm++) {
            const pts: Vec[] = []
            for (let i = 0; i <= 40; i++) {
                const t = i / 40
                const a = arm * (Math.PI / 2) + t * Math.PI * 1.6
                const r = 18 + t * (c - 26)
                pts.push({ x: c + Math.cos(a) * r, y: c + Math.sin(a) * r * 0.62 })
            }
            g.lineStyle(10, C.wind, 0.35)
            g.strokePoints(pts.slice(6), false)
            g.lineStyle(4, C.wind, 0.9)
            g.strokePoints(pts.slice(10, 34), false)
        }
    })
    baked(scene, GLOW_KEY, 260, 220, g => {
        for (let k = 6; k >= 1; k--) {
            g.fillStyle(C.butter, 0.1)
            g.fillEllipse(130, 110, 40 + k * 36, 30 + k * 30)
        }
    })
}

export function createWhirl(scene: Phaser.Scene): Whirl {
    ensureWhirlBits(scene)
    let phase: RedemoinhoPhase | undefined
    let houses: House[] = []
    let piece: Phaser.GameObjects.Container | undefined
    let pieceDef: Piece | undefined
    let wobble: Phaser.Tweens.Tween | undefined
    const spins: Phaser.Tweens.Tween[] = []
    const extras = new Set<Phaser.GameObjects.GameObject>()
    const zones: Phaser.GameObjects.Zone[] = []
    const rings: Phaser.GameObjects.Graphics[] = []

    const spiralA = scene.add.image(0, 0, SPIRAL_KEY)
    const spiralB = scene.add.image(0, 0, SPIRAL_KEY).setScale(0.62).setAlpha(0.8)
    const leaves = Array.from({ length: WHIRL.leaves }, (_, i) => {
        const a = (i / WHIRL.leaves) * Math.PI * 2
        const r = WHIRL.size * (0.22 + (i % 3) * 0.08)
        const leaf = scene.add.image(Math.cos(a) * r, Math.sin(a) * r * 0.62, OBJECT_SHEET.key, cellKey(OBJECT_CELL.windLeaf))
        return leaf.setScale(0.26 + (i % 2) * 0.08).setAngle(i * 60)
    })
    const leafRing = scene.add.container(0, 0, leaves)
    const whirl = scene.add.container(WHIRL.x, WHIRL.y, [spiralA, spiralB, leafRing]).setDepth(DEPTH.plot).setVisible(false)

    const houseXs = () => {
        const n = (phase as RedemoinhoPhase).homes.length
        return Array.from({ length: n }, (_, i) => WHIRL.x + (i - (n - 1) / 2) * WHIRL.gap)
    }
    const houseOf = (h: Home) => houses.find(o => o.home === h) as House

    const startSpin = () => {
        stopSpin()
        spins.push(
            scene.tweens.add({ targets: spiralA, angle: 360, duration: 2600, repeat: -1 }),
            scene.tweens.add({ targets: spiralB, angle: -360, duration: 1900, repeat: -1 }),
            scene.tweens.add({ targets: leafRing, angle: 360, duration: 3400, repeat: -1 }),
        )
    }

    const stopSpin = () => {
        spins.forEach(t => t.stop())
        spins.length = 0
    }

    const pillOf = (text: string) => {
        const label = scene.add
            .text(0, -1, text, { fontFamily: FONT.black, fontSize: '24px', color: inkOn(C.chip) })
            .setOrigin(0.5)
            .setResolution(2)
        const w = label.width + 32
        const h = 40
        const key = baked(scene, `vnf-pill-${text}`, w, h + 4, g => {
            g.fillStyle(C.chipDark, 1)
            g.fillRoundedRect(0, 4, w, h, h / 2)
            g.fillStyle(C.chip, 1)
            g.fillRoundedRect(0, 0, w, h, h / 2)
        })
        const art = scene.add.image(0, 2, key)
        return scene.add.container(0, 0, [art, label])
    }

    const makePiece = (p: Piece) => {
        const img = scene.add.image(0, 0, PIECE_SHEET.key, cellKey(pieceCell(p)))
        img.setScale(WHIRL.pieceW / Math.max(img.width, img.height))
        const parts: Phaser.GameObjects.GameObject[] = [img]
        const at = PIECE_TEXT_AT[p]
        const text = (PIECE_TEXT as Record<string, string>)[p]
        if (at && text) {
            parts.push(
                scene.add
                    .text(at.x * img.displayWidth, at.y * img.displayHeight, text, {
                        fontFamily: FONT.black,
                        fontSize: `${Math.round(at.size * WHIRL.pieceW)}px`,
                        color: CSS.ink,
                    })
                    .setOrigin(0.5)
                    .setResolution(2),
            )
        }
        return scene.add.container(WHIRL.x, WHIRL.y, parts).setDepth(DEPTH.flying)
    }

    const dropPiece = () => {
        wobble?.stop()
        wobble = undefined
        if (piece) {
            scene.tweens.killTweensOf(piece)
            piece.destroy()
        }
        piece = undefined
        pieceDef = undefined
    }

    const unhook = () => {
        zones.forEach(z => z.destroy())
        zones.length = 0
        rings.forEach(r => {
            scene.tweens.killTweensOf(r)
            r.destroy()
        })
        rings.length = 0
    }

    const clear = () => {
        unhook()
        dropPiece()
        stopSpin()
        extras.forEach(o => {
            scene.tweens.killTweensOf(o)
            o.destroy()
        })
        extras.clear()
        houses.forEach(h => {
            scene.tweens.killTweensOf([h.box, h.art, h.glow, h.pill])
            h.box.destroy()
            h.pill.destroy()
        })
        houses = []
        whirl.setVisible(false)
    }

    const glowOn = (h: House, alpha = 0.9) => {
        h.glow.setVisible(true).setAlpha(0)
        return FX.to(scene, h.glow, { alpha }, { duration: 260 })
    }

    const pop = (img: Phaser.GameObjects.Image, h: House, rise: number) => {
        extras.add(img)
        img.setPosition(h.box.x, h.box.y - 10).setDepth(DEPTH.piece + 1)
        const s = img.scale
        img.setScale(s * 0.2)
        return FX.all(FX.to(scene, img, { scale: s }, { duration: 260, ease: 'Back.easeOut' }), FX.to(scene, img, { y: h.box.y - rise }, { duration: 300, ease: 'Sine.easeOut' })).then(async () => {
            await FX.to(scene, img, { angle: 12 }, { duration: 140, yoyo: true, repeat: 1 })
            await FX.to(scene, img, { y: h.box.y - 10, scale: s * 0.2, alpha: 0 }, { duration: 260, ease: 'Sine.easeIn' })
            extras.delete(img)
            img.destroy()
        })
    }

    const react = (h: House) => {
        if (h.home === 'fila') {
            const ant = scene.add.image(0, 0, ANT_SHEET.key, cellKey(ANT_CELL.cheer)).setOrigin(0.5, 1)
            ant.setScale(70 / (sheetData(scene, ANT_SHEET).maxH ?? 200))
            return pop(ant, h, 60)
        }
        if (h.home === 'grade') {
            const flower = scene.add.image(0, 0, FLOWER_SHEET.key, cellKey(flowerCell('margarida', 'rosa'))).setOrigin(0.5, 1)
            flower.setScale(80 / (sheetData(scene, FLOWER_SHEET).maxH ?? 200))
            return pop(flower, h, 50)
        }
        if (h.home === 'ficha') {
            const chick = scene.add.image(0, 0, CHICK_SHEET.key, cellKey(1)).setOrigin(0.5, 1)
            chick.setScale(70 / (sheetData(scene, CHICK_SHEET).maxH ?? 200))
            return pop(chick, h, 60)
        }
        if (h.home === 'teia') {
            void FX.sparks(scene, h.box.x, h.box.y - 30, { color: C.white, count: 18, spread: 110, size: 9, depth: DEPTH.fx })
            return FX.to(scene, h.art, { scale: h.art.scale * 1.08 }, { duration: 200, yoyo: true })
        }
        return FX.to(scene, h.art, { angle: 8 }, { duration: 130, yoyo: true, repeat: 2, ease: 'Sine.easeInOut' })
    }

    const view: Whirl = {
        build(next) {
            clear()
            phase = next
            ensureWhirlBits(scene)
            const xs = houseXs()
            houses = next.homes.map((home, i) => {
                const art = scene.add.image(0, 0, HOUSE_SHEET.key, cellKey(houseCell(home)))
                art.setScale(WHIRL.houseW / Math.max(art.width, art.height))
                const glow = scene.add.image(0, 0, GLOW_KEY).setVisible(false)
                const box = scene.add.container(xs[i], WHIRL.houseY, [glow, art]).setDepth(DEPTH.piece)
                const pill = pillOf(HOME_LABEL[home]).setPosition(xs[i], WHIRL.pillY).setDepth(DEPTH.piece + 2)
                return { home, box, art, glow, pill }
            })
            whirl.setVisible(false).setScale(1).setAlpha(1)
        },
        hide() {
            clear()
            phase = undefined
        },
        async spin() {
            whirl.setVisible(true).setScale(0.2).setAlpha(0)
            startSpin()
            await FX.to(scene, whirl, { scale: 1, alpha: 1 }, { duration: 700, ease: 'Back.easeOut' })
        },
        async spit(index) {
            const p = phase as RedemoinhoPhase
            dropPiece()
            pieceDef = p.pieces[index]
            piece = makePiece(pieceDef).setScale(0.2).setAlpha(0)
            const node = piece
            void FX.to(scene, whirl, { scale: 1.12 }, { duration: 160, yoyo: true })
            await FX.all(
                FX.to(scene, node, { scale: 1, alpha: 1, angle: 360 }, { duration: 620, ease: 'Sine.easeOut' }),
                FX.arcTo(scene, node, WHIRL.piece, { height: 80, duration: 620 }),
            )
            node.setAngle(-8)
            wobble = scene.tweens.add({ targets: node, angle: 8, duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
        },
        current: () => pieceDef,
        activate(onHome) {
            view.deactivate()
            houses.forEach(h => {
                const ring = scene.add.graphics().setDepth(DEPTH.ring).setPosition(h.box.x, h.box.y + 20)
                const w = WHIRL.hit
                const hh = WHIRL.hit
                ring.lineStyle(11, C.ringRim, 0.5)
                ring.strokeRoundedRect(-w / 2, -hh / 2, w, hh, 36)
                ring.lineStyle(6, C.ringYellow, 1)
                ring.strokeRoundedRect(-w / 2, -hh / 2, w, hh, 36)
                scene.tweens.add({ targets: ring, alpha: 0.35, scale: 1.03, duration: 620, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
                rings.push(ring)
                const zone = scene.add.zone(h.box.x, h.box.y + 20, w, hh).setDepth(DEPTH.fx).setInteractive({ useHandCursor: true })
                const base = h.art.scale
                zone.on('pointerover', () => h.art.setScale(base * 1.05))
                zone.on('pointerout', () => h.art.setScale(base))
                zone.on('pointerdown', () => {
                    h.art.setScale(base)
                    onHome(h.home)
                })
                zones.push(zone)
            })
        },
        deactivate: unhook,
        async send(home) {
            const node = piece
            if (!node) return
            wobble?.stop()
            wobble = undefined
            const h = houseOf(home)
            await FX.all(
                FX.arcTo(scene, node, { x: h.box.x, y: h.box.y - 70 }, { height: 70, duration: TIMING.fly }),
                FX.to(scene, node, { angle: 0, scale: 0.8 }, { duration: TIMING.fly }),
            )
        },
        async accept(home) {
            const node = piece
            const h = houseOf(home)
            const reaction = react(h)
            if (node) {
                await FX.to(scene, node, { y: h.box.y - 10, scale: 0.15, alpha: 0 }, { duration: 300, ease: 'Sine.easeIn' })
                dropPiece()
            }
            void FX.impact(scene, h.art, 0.12)
            await reaction
        },
        async reject(home, right) {
            const node = piece
            const h = houseOf(home)
            if (node) {
                await FX.to(scene, node, { y: h.box.y - 40, scale: 0.86 }, { duration: 140, ease: 'Sine.easeIn' })
                const side = h.box.x >= WHIRL.x ? 1 : -1
                void FX.to(scene, node, { angle: side * 200 }, { duration: 700, ease: 'Sine.easeOut' })
                void FX.arcTo(scene, node, { x: h.box.x + side * 150, y: WHIRL.houseY + 60 }, { height: 130, duration: 700 })
            }
            void glowOn(houseOf(right), 0.7)
            await FX.shake(scene, h.box, { amount: 10, times: 5 })
            await FX.wait(scene, 360)
        },
        async pulse(home) {
            const h = houseOf(home)
            const node = piece
            await glowOn(h)
            for (let k = 0; k < 2; k++) {
                const jobs: Promise<void>[] = [FX.to(scene, h.box, { scale: 1.08 }, { duration: 220, yoyo: true, ease: 'Sine.easeInOut' })]
                if (node) jobs.push(FX.to(scene, node, { scale: 1.16 }, { duration: 220, yoyo: true, ease: 'Sine.easeInOut' }))
                await FX.all(...jobs)
            }
            await FX.wait(scene, 240)
            await FX.to(scene, h.glow, { alpha: 0 }, { duration: 240 })
            h.glow.setVisible(false)
        },
        async celebrate() {
            await FX.all(...houses.map((h, i) => FX.wait(scene, i * 120).then(() => FX.to(scene, h.box, { y: h.box.y - 22 }, { duration: 170, yoyo: true, ease: 'Sine.easeOut' }))))
            await FX.to(scene, whirl, { scale: 0.1, alpha: 0 }, { duration: 520, ease: 'Sine.easeIn' })
            stopSpin()
            whirl.setVisible(false)
        },
        houseCenter(home) {
            const h = houseOf(home)
            return { x: h.box.x, y: h.box.y }
        },
        housesRect() {
            const xs = houseXs()
            const top = WHIRL.houseY - WHIRL.houseW / 2 - 6
            const bottom = WHIRL.pillY + 26
            return { x: (xs[0] + xs[xs.length - 1]) / 2, y: (top + bottom) / 2, w: xs[xs.length - 1] - xs[0] + WHIRL.houseW + 30, h: bottom - top }
        },
        destroy() {
            clear()
            whirl.destroy()
        },
    }
    return view
}
