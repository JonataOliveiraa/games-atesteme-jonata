import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BIA, CARD, DEPTH, INTRO } from '../data/layout'
import { C } from '../data/theme'
import type { Point } from '../types'
import type { Audio } from './audio'
import type { BiaView } from './bia'
import { framed, moveCamera, WIDE, type Shot } from './camera'
import { createIdCard, DATA } from './card'
import type { MagnetView } from './magnet'
import { personFeet, type PersonView } from './people'
import type { VaultView } from './vault'

export interface IntroDeps {
    bia: BiaView
    carer: PersonView
    vault: VaultView
    magnets: MagnetView[]
    audio: Audio
    slot: Point
    live: () => boolean
}

async function showCard(scene: Phaser.Scene, bia: BiaView, audio: Audio, at: Point, scale: number, live: () => boolean) {
    const from = bia.cardWorld()
    const card = createIdCard(scene, from.x, from.y, CARD.mini)
    card.container.setDepth(DEPTH.card)
    bia.setCardVisible(false)
    try {
        audio.show()
        await FX.arcTo(scene, card.container, at, { height: 50, duration: 560 })
        await FX.to(scene, card.container, { scale }, { duration: 320, ease: 'Back.easeOut' })
        if (!live()) return
        for (const kind of DATA) {
            const spot = card.datumWorld(kind)
            audio.plim()
            void FX.impact(scene, card.datum(kind), 0.22)
            void FX.sparks(scene, spot.x, spot.y, { color: C.gold, count: 8, spread: 36, size: 5, depth: DEPTH.card + 1 })
            await FX.wait(scene, 320)
            if (!live()) return
        }
        await FX.wait(scene, 900)
        if (!live()) return
        const back = bia.cardWorld()
        await Promise.all([
            FX.to(scene, card.container, { scale: CARD.mini }, { duration: 420, ease: 'Quad.easeIn' }),
            FX.arcTo(scene, card.container, back, { height: 40, duration: 420 }),
        ])
        if (live()) bia.pulse()
    } finally {
        card.destroy()
        bia.setCardVisible(true)
    }
}

async function dottedArc(scene: Phaser.Scene, from: Point, to: Point, live: () => boolean) {
    const g = scene.add.graphics().setDepth(DEPTH.balloon).setAlpha(0)
    const mid = { x: (from.x + to.x) / 2, y: Math.min(from.y, to.y) - INTRO.arcLift }
    const curve = new Phaser.Curves.QuadraticBezier(
        new Phaser.Math.Vector2(from.x, from.y),
        new Phaser.Math.Vector2(mid.x, mid.y),
        new Phaser.Math.Vector2(to.x, to.y),
    )
    const points = curve.getSpacedPoints(34)
    points.forEach((p, i) => {
        if (i === 0 || i === points.length - 1) return
        g.fillStyle(C.ink, 0.35)
        g.fillCircle(p.x + 1, p.y + 2, 7)
        g.fillStyle(i % 2 ? C.white : C.yellow, 1)
        g.fillCircle(p.x, p.y, 6)
    })
    try {
        await FX.to(scene, g, { alpha: 1 }, { duration: 260 })
        if (!live()) return
        await FX.wait(scene, 1000)
        if (!live()) return
        await FX.to(scene, g, { alpha: 0 }, { duration: 260 })
    } finally {
        g.destroy()
    }
}

async function hug(scene: Phaser.Scene, bia: BiaView, carer: PersonView, audio: Audio) {
    const home = { x: carer.container.x, y: carer.container.y }
    carer.setPose('cheer')
    bia.setPose('happy')
    audio.hug()
    await FX.to(scene, carer.container, { x: home.x - INTRO.hugDX }, { duration: 280, ease: 'Sine.easeOut' })
    void FX.stars(scene, (bia.x + carer.container.x) / 2, bia.y - 50, { color: C.pink, count: 10, rise: 60, depth: DEPTH.balloon })
    await Promise.all([FX.impact(scene, bia.container, 0.14), FX.impact(scene, carer.container, 0.08)])
    await FX.wait(scene, 420)
    await FX.to(scene, carer.container, { x: home.x }, { duration: 280, ease: 'Sine.easeInOut' })
    carer.setPose('wait')
    bia.setPose('idle')
    bia.face('right')
}

export async function playIntro(scene: Phaser.Scene, d: IntroDeps): Promise<boolean> {
    const { bia, carer, vault, audio, live } = d
    const feet = bia.y + BIA.feet
    const carerX = bia.x + INTRO.carerDX
    carer.place(carerX, feet - personFeet(INTRO.carerScale), INTRO.carerScale)
    carer.container.setAlpha(0)
    bia.face('right')

    const close: Shot = framed({ x: (bia.x + carerX) / 2, y: bia.y - INTRO.lookUp, zoom: INTRO.zoom })
    await Promise.all([
        moveCamera(scene, WIDE, close, INTRO.zoomMs),
        FX.to(scene, carer.container, { alpha: 1 }, { duration: 400, delay: 200 }),
    ])
    if (!live()) return false

    await hug(scene, bia, carer, audio)
    if (!live()) return false

    const cardAt = { x: close.x + INTRO.card.dx, y: close.y + INTRO.card.dy }
    await showCard(scene, bia, audio, cardAt, INTRO.card.screen / INTRO.zoom, live)
    if (!live()) return false

    carer.setPose('cheer')
    await FX.to(scene, carer.container, { angle: 8 }, { duration: 150, yoyo: true, repeat: 2 })
    carer.container.setAngle(0)
    carer.setPose('wait')
    if (!live()) return false

    await moveCamera(scene, close, WIDE, INTRO.zoomMs)
    if (!live()) return false

    await carer.walk(
        [
            { x: carer.container.x, y: INTRO.walkY },
            { x: INTRO.sideX, y: INTRO.walkY },
            { x: INTRO.sideX, y: d.slot.y },
            { x: d.slot.x, y: d.slot.y },
        ],
        INTRO.walkMs,
        1,
    )
    if (!live()) return false

    await Promise.all([vault.pulse(), dottedArc(scene, { x: bia.x, y: bia.y - 20 }, vault.door, live)])
    if (!live()) return false
    await Promise.all(d.magnets.map(m => m.pulse()))
    return live()
}
