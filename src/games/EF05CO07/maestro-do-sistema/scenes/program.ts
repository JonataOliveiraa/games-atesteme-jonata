import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BALLOON, DEPTH, SCORE, SEAT } from '../data/layout'
import { C } from '../data/theme'
import { FOOT, FRAME, PROGRAMS, frameFor } from '../data/cast'
import type { Piece, ProgramState } from '../types'
import { TEX } from './BootScene'
import { flatPiece, makePiece } from './pieceArt'

export interface ProgramView {
    readonly x: number
    readonly headY: number
    setState(state: ProgramState): void
    ask(piece: Piece, lit: boolean): void
    setLit(lit: boolean): void
    clearAsk(): void
    setNotes(total: number): void
    lightNote(index: number): void
    goldNotes(): Promise<void>
    beat(): void
    receive(): Promise<void>
    bow(): Promise<void>
    wave(): void
    shrug(): void
    nudge(on: boolean): void
    lean(dir: number): void
    enter(delay: number): Promise<void>
    /** Entra andando pela lateral do palco, aos pulinhos, até a cadeira dele. */
    walkIn(fromX: number, ms: number): Promise<void>
    /** Murcha por um instante, sem mexer no estado do mundo. */
    slump(on: boolean): void
    hide(): void
    /** Põe de volta no lugar, inteiro — é o que o "pular" usa. */
    place(): void
    destroy(): void
}

export function createProgram(
    scene: Phaser.Scene,
    options: { id: string; x: number; onTap(): void },
): ProgramView {
    const info = PROGRAMS[options.id]
    const x = options.x
    const foot = SEAT.footY
    let state: ProgramState = 'resting'
    let notes = 0
    let litNotes = 0
    let gold = false
    let asking: Piece | undefined

    const zone = scene.add
        .zone(x, SEAT.footY - 110, SEAT.hitW, SEAT.hitH)
        .setOrigin(0.5)
        .setDepth(DEPTH.balloon + 1)
        .setInteractive({ useHandCursor: true })
    zone.on('pointerdown', () => options.onTap())

    const halo = scene.add.graphics().setDepth(DEPTH.halo).setAlpha(0)
    halo.fillStyle(C.gold, 0.3)
    halo.fillCircle(0, 0, 142)
    halo.lineStyle(7, C.gold, 0.85)
    halo.strokeCircle(0, 0, 142)
    halo.setPosition(x, foot - 118)

    const art = scene.textures.exists(TEX.programs)
        ? scene.add.sprite(x, foot, TEX.programs, info.row * 4).setDepth(DEPTH.program)
        : undefined
    const fallback = art ? undefined : scene.add.graphics().setDepth(DEPTH.program)

    if (art) art.setDisplaySize(SEAT.cell, SEAT.cell)
    const base = art ? art.scaleX : 1

    const paintFallback = () => {
        if (!fallback) return
        const h = state === 'resting' ? 132 : 164
        const w = 118
        fallback.clear()
        fallback.fillStyle(C.ink, 0.24)
        fallback.fillEllipse(x, foot + 6, w * 1.1, 26)
        fallback.fillStyle(state === 'frozen' ? C.gray : info.color, 1)
        fallback.fillRoundedRect(x - w / 2, foot - h, w, h, 22)
        fallback.fillStyle(C.cream, 1)
        fallback.fillRoundedRect(x - w / 2 + 16, foot - h + 18, w - 32, h * 0.44, 12)
        fallback.fillStyle(C.ink, 1)
        fallback.fillCircle(x - 18, foot - h + 18 + h * 0.2, 7)
        fallback.fillCircle(x + 18, foot - h + 18 + h * 0.2, 7)
    }

    const applyFrame = () => {
        if (!art) {
            paintFallback()
            return
        }
        const col = frameFor(state)
        art.setFrame(info.row * 4 + col)
        art.setOrigin(0.5, FOOT[info.row][col])
    }
    applyFrame()

    /* ── a partitura ─────────────────────────────────────────────────────── */

    const score = scene.add.graphics().setDepth(DEPTH.score)

    const noteX = (i: number) => x + (i - (notes - 1) / 2) * SCORE.gap
    const noteY = foot + SCORE.dy

    const paintScore = () => {
        score.clear()
        if (!notes) return
        const half = ((notes - 1) * SCORE.gap) / 2 + 22
        score.fillStyle(C.ink, 0.2)
        score.fillRoundedRect(x - half, noteY - 17, half * 2, 34, 17)
        score.fillStyle(C.cream, 0.55)
        score.fillRoundedRect(x - half + 2, noteY - 15, half * 2 - 4, 30, 15)
        for (let i = 0; i < notes; i++) {
            score.fillStyle(C.ink, 0.28)
            score.fillCircle(noteX(i), noteY + 2, SCORE.r)
            score.fillStyle(i < litNotes ? (gold ? C.gold : info.color) : C.noteOff, 1)
            score.fillCircle(noteX(i), noteY, SCORE.r)
        }
    }

    /* ── o balão do pedido ───────────────────────────────────────────────── */

    const balloon = scene.add.container(x, foot + BALLOON.dy).setDepth(DEPTH.balloon).setScale(0)
    const bubble = scene.add.graphics()
    const ring = scene.add.graphics()
    balloon.add([ring, bubble])

    /** O pictograma do pedido: o mesmo recorte de papel do atril, menor. */
    let glyph: Phaser.GameObjects.Sprite | Phaser.GameObjects.Graphics | undefined

    const paintBalloon = (piece: Piece, lit: boolean) => {
        const w = BALLOON.w
        const h = BALLOON.h
        bubble.clear()
        ring.clear()

        if (glyph) glyph.destroy()
        glyph = makePiece(scene, piece, 112)
        glyph.setPosition(0, -2)
        balloon.add(glyph)
        flatPiece(glyph, !lit, piece)

        bubble.fillStyle(C.ink, 0.28)
        bubble.fillRoundedRect(-w / 2 + 4, -h / 2 + 6, w, h, 22)
        bubble.fillStyle(lit ? C.gold : C.gray, 1)
        bubble.fillRoundedRect(-w / 2 - 6, -h / 2 - 6, w + 12, h + 12, 26)
        bubble.fillStyle(lit ? C.paper : 0xded7de, 1)
        bubble.fillRoundedRect(-w / 2, -h / 2, w, h, 20)
        bubble.fillStyle(lit ? C.gold : C.gray, 1)
        bubble.fillTriangle(-16, h / 2 - 2, 16, h / 2 - 2, 2, h / 2 + BALLOON.tail + 6)
        bubble.fillStyle(lit ? C.paper : 0xded7de, 1)
        bubble.fillTriangle(-11, h / 2 - 6, 11, h / 2 - 6, 1, h / 2 + BALLOON.tail)

        if (lit) {
            ring.lineStyle(9, C.gold, 0.55)
            ring.strokeRoundedRect(-w / 2 - 14, -h / 2 - 14, w + 28, h + 28, 32)
        }
    }

    /* ── as animações ────────────────────────────────────────────────────── */

    const idle = () => {
        if (!art) return
        FX.kill(scene, art)
        art.setScale(base, base)
        art.setAngle(0)
        if (state === 'asking') {
            void FX.to(scene, art, { scaleY: base * 1.04 }, {
                duration: 760, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
            })
        } else if (state === 'playing') {
            void FX.to(scene, art, { angle: 3 }, {
                duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
            })
        } else if (state === 'frozen') {
            void FX.to(scene, art, { x: x + 4 }, {
                duration: 70, yoyo: true, repeat: -1,
            })
        } else {
            void FX.to(scene, art, { scaleY: base * 1.02 }, {
                duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
            })
        }
    }

    const floatBalloon = () => {
        FX.kill(scene, balloon)
        balloon.setPosition(x, foot + BALLOON.dy)
        void FX.to(scene, balloon, { y: foot + BALLOON.dy - 10 }, {
            duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
        })
    }

    return {
        x,
        headY: foot - 180,

        setState: next => {
            if (state === next) return
            state = next
            applyFrame()
            idle()
        },

        ask: (piece, lit) => {
            asking = piece
            paintBalloon(piece, lit)
            balloon.setScale(0).setAngle(lit ? -4 : 3)
            void FX.to(scene, balloon, { scale: 1 }, { duration: 340, ease: 'Back.easeOut' })
                .then(floatBalloon)
        },

        setLit: lit => {
            if (!asking) return
            paintBalloon(asking, lit)
            balloon.setAngle(lit ? -4 : 3)
        },

        clearAsk: () => {
            asking = undefined
            FX.kill(scene, balloon)
            void FX.to(scene, balloon, { scale: 0, y: foot + BALLOON.dy + 30 }, {
                duration: 220, ease: 'Back.easeIn',
            })
        },

        setNotes: total => {
            notes = Math.min(total, SCORE.max)
            litNotes = 0
            gold = false
            paintScore()
        },

        lightNote: index => {
            litNotes = Math.max(litNotes, Math.min(index + 1, notes))
            paintScore()
            void FX.ping(scene, noteX(index), noteY, info.color, {
                radius: 30, duration: 420, depth: DEPTH.score + 1,
            })
        },

        goldNotes: async () => {
            gold = true
            for (let i = 0; i < notes; i++) {
                paintScore()
                void FX.ping(scene, noteX(i), noteY, C.gold, {
                    radius: 26, duration: 380, depth: DEPTH.score + 1,
                })
                await FX.wait(scene, 70)
            }
        },

        beat: () => {
            if (!art) return
            const note = scene.add
                .text(x + Phaser.Math.Between(-30, 30), foot - 210, '♪', {
                    fontFamily: 'Arial', fontSize: '34px', color: '#ffffff',
                })
                .setOrigin(0.5).setDepth(DEPTH.balloon - 1).setAlpha(0.9)
            note.setTint(info.color)
            void FX.to(scene, note, { y: note.y - 74, alpha: 0, angle: Phaser.Math.Between(-24, 24) },
                { duration: 900 }).then(() => note.destroy())

            FX.kill(scene, art)
            art.setScale(base, base)
            void FX.to(scene, art, { scaleY: base * 0.93, scaleX: base * 1.06 }, { duration: 110 })
                .then(() => FX.to(scene, art, { scaleY: base, scaleX: base }, {
                    duration: 260, ease: 'Back.easeOut',
                }))
                .then(idle)
        },

        receive: async () => {
            void FX.ping(scene, x, foot - 140, C.gold, { radius: 150, depth: DEPTH.program - 1 })
            void FX.sparks(scene, x, foot - 140, { color: C.gold, count: 14 })
            if (!art) return
            FX.kill(scene, art)
            await FX.to(scene, art, { scaleX: base * 1.18, scaleY: base * 0.86 }, { duration: 120 })
            await FX.to(scene, art, { scaleX: base, scaleY: base }, { duration: 320, ease: 'Back.easeOut' })
            idle()
        },

        bow: async () => {
            if (!art) return
            FX.kill(scene, art)
            await FX.to(scene, art, { angle: 16 }, { duration: 260, ease: 'Sine.easeOut' })
            await FX.wait(scene, 140)
            await FX.to(scene, art, { angle: 0 }, { duration: 300, ease: 'Back.easeOut' })
            idle()
        },

        wave: () => {
            if (!art) return
            FX.kill(scene, art)
            void FX.to(scene, art, { angle: -7 }, { duration: 130, yoyo: true, repeat: 1 })
                .then(idle)
        },

        shrug: () => {
            if (!art) return
            FX.kill(scene, art)
            void FX.to(scene, art, { y: foot - 14 }, { duration: 150, yoyo: true })
                .then(() => FX.to(scene, art, { angle: 6 }, { duration: 120, yoyo: true }))
                .then(idle)
        },

        nudge: on => {
            FX.kill(scene, halo)
            if (!on) {
                halo.setAlpha(0)
                return
            }
            halo.setAlpha(0.001).setScale(0.8)
            void FX.to(scene, halo, { alpha: 0.7, scale: 1.08 }, {
                duration: 760, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
            })
        },

        lean: dir => {
            if (!art) return
            FX.kill(scene, art)
            void FX.to(scene, art, { angle: 9 * dir }, { duration: 300, yoyo: true })
                .then(idle)
        },

        enter: async delay => {
            if (art) {
                art.setAlpha(0)
                art.y = foot - 150
                await FX.wait(scene, delay)
                await FX.all(
                    FX.to(scene, art, { alpha: 1 }, { duration: 200 }),
                    FX.to(scene, art, { y: foot }, { duration: 620, ease: 'Bounce.easeOut' }),
                )
            } else {
                await FX.wait(scene, delay)
            }
            idle()
        },

        walkIn: async (fromX, ms) => {
            if (!art) {
                await FX.wait(scene, ms)
                return
            }
            FX.kill(scene, art)
            score.setAlpha(0)
            art.setAlpha(1).setPosition(fromX, foot).setScale(base, base).setAngle(0)
            // entra de braços erguidos: o quadro de descanso é murcho, e um
            // boneco murcho atravessando o palco parece cansado, não animado
            art.setFrame(info.row * 4 + FRAME.asking)
            art.setOrigin(0.5, FOOT[info.row][FRAME.asking])

            const hops = Math.max(3, Math.round(ms / 300))
            void FX.to(scene, art, { y: foot - 38 }, {
                duration: ms / (hops * 2), yoyo: true, repeat: hops - 1, ease: 'Sine.easeOut',
            })
            void FX.to(scene, art, { angle: fromX < x ? 7 : -7 }, {
                duration: ms / hops, yoyo: true, repeat: hops - 1, ease: 'Sine.easeInOut',
            })
            await FX.to(scene, art, { x }, { duration: ms, ease: 'Sine.easeInOut' })

            FX.kill(scene, art)
            art.setAngle(0).setPosition(x, foot)
            applyFrame()
            await FX.to(scene, art, { scaleX: base * 1.14, scaleY: base * 0.88 }, { duration: 120 })
            await FX.to(scene, art, { scaleX: base, scaleY: base }, { duration: 280, ease: 'Back.easeOut' })
            void FX.to(scene, score, { alpha: 1 }, { duration: 320 })
            idle()
        },

        slump: on => {
            if (!art) return
            const col = on ? FRAME.waiting : frameFor(state)
            art.setFrame(info.row * 4 + col)
            art.setOrigin(0.5, FOOT[info.row][col])
        },

        hide: () => {
            if (art) {
                FX.kill(scene, art)
                art.setAlpha(0)
            }
            fallback?.setAlpha(0)
            score.setAlpha(0)
        },

        place: () => {
            if (art) {
                FX.kill(scene, art)
                art.setAlpha(1).setPosition(x, foot).setScale(base, base).setAngle(0)
            }
            fallback?.setAlpha(1)
            FX.kill(scene, score)
            score.setAlpha(1)
            applyFrame()
            idle()
        },

        destroy: () => {
            zone.destroy()
            FX.kill(scene, [halo, balloon, score])
            if (art) {
                FX.kill(scene, art)
                art.destroy()
            }
            fallback?.destroy()
            halo.destroy()
            score.destroy()
            balloon.destroy(true)
        },
    }
}
