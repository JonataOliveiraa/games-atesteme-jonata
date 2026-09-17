import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BALLOON, COACH, DEPTH } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import type { Verb } from '../types'
import { TEX } from './BootScene'

export interface Coach {
    /** `typed` escreve letra a letra — é o pedido novo. Sem ele, só repõe. */
    say(line: string, verb: Verb, typed?: boolean): Promise<void>
    tip(line: string): void
    cheer(): Promise<void>
    pulse(): void
    balloonBox(): { x: number; y: number; w: number; h: number }
    destroy(): void
}

/** Os três quadros de perfil: pedindo, aprovando e mandando parar. */
const POSE = { ask: 0, good: 1, stop: 2 } as const

const VERB_TONE: Record<Verb, number> = {
    remove: C.red,
    insert: C.green,
    move: C.pin,
}

function drawVerb(g: Phaser.GameObjects.Graphics, verb: Verb, cx: number, cy: number) {
    g.fillStyle(VERB_TONE[verb], 1)
    g.fillCircle(cx, cy, 28)
    g.fillStyle(C.white, 1)

    if (verb === 'remove') {
        g.fillRoundedRect(cx - 16, cy - 14, 18, 28, 5)
        g.fillTriangle(cx + 4, cy, cx + 18, cy - 12, cx + 18, cy + 12)
        return
    }
    if (verb === 'insert') {
        g.fillRoundedRect(cx - 4, cy - 16, 8, 32, 4)
        g.fillRoundedRect(cx - 16, cy - 4, 32, 8, 4)
        return
    }
    g.fillRoundedRect(cx - 18, cy - 4, 26, 8, 4)
    g.fillTriangle(cx + 4, cy - 14, cx + 18, cy, cx + 4, cy + 14)
}

export function createCoach(scene: Phaser.Scene): Coach {
    const root = scene.add.container(0, 0).setDepth(DEPTH.coach)

    const art = scene.textures.exists(TEX.coach)
        ? scene.add.sprite(COACH.x, COACH.base, TEX.coach, 0)
        : undefined
    if (art) {
        art.setOrigin(0.5, 1)
        art.setDisplaySize(COACH.h * (500 / 550), COACH.h)
        root.add(art)
    } else {
        const body = scene.add.graphics()
        body.fillStyle(C.waterDeep, 1)
        body.fillRoundedRect(COACH.x - 46, COACH.base - COACH.h + 40, 92, COACH.h - 40, 18)
        body.fillStyle(C.tile, 1)
        body.fillCircle(COACH.x, COACH.base - COACH.h + 40, 34)
        root.add(body)
    }

    const balloon = scene.add.graphics().setDepth(DEPTH.balloon)
    const glyph = scene.add.graphics().setDepth(DEPTH.balloon + 1)

    const text = scene.add
        .text(BALLOON.textX, BALLOON.y + BALLOON.h / 2, '', {
            fontFamily: FONT.black,
            fontSize: '36px',
            color: CSS.ink,
            wordWrap: { width: BALLOON.wrap },
            lineSpacing: 2,
        })
        .setOrigin(0, 0.5)
        .setResolution(2)
        .setDepth(DEPTH.balloon + 2)

    let tone: number = C.card

    const paint = (verb: Verb | undefined, background: number) => {
        tone = background
        balloon.clear()
        balloon.fillStyle(C.ink, 0.22)
        balloon.fillRoundedRect(BALLOON.x + 5, BALLOON.y + 9, BALLOON.w, BALLOON.h, 26)
        balloon.fillStyle(C.ink, 1)
        balloon.fillRoundedRect(BALLOON.x, BALLOON.y, BALLOON.w, BALLOON.h, 26)
        balloon.fillStyle(tone, 1)
        balloon.fillRoundedRect(BALLOON.x + 5, BALLOON.y + 5, BALLOON.w - 10, BALLOON.h - 10, 22)
        balloon.fillStyle(C.ink, 1)
        balloon.fillTriangle(
            BALLOON.x + 6, BALLOON.y + 34,
            BALLOON.x + 6, BALLOON.y + 74,
            BALLOON.tailX, BALLOON.y + 56,
        )
        balloon.fillStyle(tone, 1)
        balloon.fillTriangle(
            BALLOON.x + 10, BALLOON.y + 40,
            BALLOON.x + 10, BALLOON.y + 68,
            BALLOON.tailX + 12, BALLOON.y + 55,
        )

        glyph.clear()
        if (verb) drawVerb(glyph, verb, BALLOON.iconX - 38, BALLOON.y + BALLOON.h / 2)
    }
    paint(undefined, C.card)

    root.add(balloon)
    root.add(glyph)
    root.add(text)

    return {
        say: async (line, verb, typed = true) => {
            paint(verb, C.card)
            art?.setFrame(POSE.ask)
            FX.kill(scene, text)
            text.setAlpha(1)
            if (!typed) {
                text.setText(line)
                return
            }
            await FX.type(scene, text, line, { delay: 20 })
        },

        tip: line => {
            paint(undefined, C.cardLift)
            art?.setFrame(POSE.stop)
            text.setText(line)
            void FX.to(scene, text, { alpha: 1 }, { duration: 160 })
        },

        cheer: async () => {
            art?.setFrame(POSE.good)
            await FX.to(scene, art ?? balloon, { angle: 3 }, { duration: 160, yoyo: true, repeat: 1 })
            art?.setFrame(POSE.ask)
        },

        pulse: () => {
            void FX.to(scene, text, { alpha: 0.55 }, { duration: 260, yoyo: true, repeat: 1 })
        },

        balloonBox: () => ({ x: BALLOON.x, y: BALLOON.y, w: BALLOON.w, h: BALLOON.h }),

        destroy: () => {
            art?.destroy()
            root.destroy(true)
        },
    }
}
