import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, INTRO, KID, PANEL, WORLD } from '../data/layout'
import { C } from '../data/theme'
import { TIMING } from '../data/timing'
import type { Art } from '../types'
import { cardImage, createArtView } from './art'
import type { Cam } from './camera'
import type { Kid } from './kid'
import type { Panel } from './panel'
import type { World } from './world'

export interface IntroDeps {
    cam: Cam
    kid: Kid
    panel: Panel
    world: World
}

export const groundView = () => WORLD.groundY - 300

function paintBubble(g: Phaser.GameObjects.Graphics, x: number, y: number, headX: number, headY: number) {
    const r = INTRO.bubble / 2 + 16
    const dots = [
        { x: headX + 34, y: headY - 6, r: 9 },
        { x: headX + 62, y: headY - 34, r: 14 },
    ]
    g.fillStyle(C.shadow, 0.12)
    g.fillCircle(x + 3, y + 6, r)
    for (const d of dots) {
        g.fillStyle(C.white, 1)
        g.fillCircle(d.x, d.y, d.r)
        g.lineStyle(4, C.ink, 1)
        g.strokeCircle(d.x, d.y, d.r)
    }
    g.fillStyle(C.white, 1)
    g.fillCircle(x, y, r)
    g.lineStyle(5, C.ink, 1)
    g.strokeCircle(x, y, r)
}

export async function zoomIntro(scene: Phaser.Scene, deps: IntroDeps, start: Art, goal: Art, cloudY: number, alive: () => boolean) {
    const { cam, kid, panel, world } = deps
    const kx = kid.container.x
    const ground = WORLD.groundY
    cam.set(ground - INTRO.lookUp, INTRO.zoom, kx + INTRO.lookDX)

    const cardX = kx + INTRO.cardDX
    const cardY = ground - INTRO.cardUp
    const cardArt = createArtView(scene, 0, 0, INTRO.card - 16)
    cardArt.set(start)
    const card = scene.add
        .container(cardX, cardY, [cardImage(scene, `sdd-intro-card`, INTRO.card, INTRO.card, 22), cardArt.container])
        .setDepth(DEPTH.kid + 1)
        .setVisible(false)

    const bx = kx + INTRO.bubbleDX
    const by = ground - INTRO.bubbleUp
    const bubble = scene.add.graphics().setDepth(DEPTH.kid + 1).setAlpha(0)
    paintBubble(bubble, bx, by, kx + 20, ground - 150)
    const pic = createArtView(scene, bx, by, INTRO.bubble)
    pic.set(goal)
    pic.container.setDepth(DEPTH.kid + 2).setAlpha(0)

    let done = false
    const cleanup = () => {
        if (done) return
        done = true
        cardArt.destroy()
        card.destroy()
        bubble.destroy()
        pic.destroy()
    }
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, cleanup)

    await FX.wait(scene, 400)
    if (!alive()) return cleanup()
    card.setVisible(true)
    await FX.popIn(scene, card, { from: 0.4 })
    await FX.impact(scene, kid.container, 0.12)
    await FX.all(FX.to(scene, bubble, { alpha: 1 }, { duration: 260 }), FX.popIn(scene, pic.container, { from: 0.4, delay: 120 }))
    await FX.wait(scene, TIMING.introHold)
    if (!alive()) return cleanup()

    await cam.look(groundView(), TIMING.introZoom, 1)
    if (!alive()) return cleanup()

    const top = scene.cameras.main.scrollY
    void FX.to(scene, bubble, { alpha: 0 }, { duration: 200 })
    await FX.all(
        FX.to(scene, card, { x: PANEL.x, y: PANEL.stateY + top, scale: PANEL.state / INTRO.card }, { duration: 620, ease: 'Sine.easeInOut' }),
        FX.to(scene, pic.container, { x: PANEL.x, y: PANEL.goalY + top, scale: PANEL.goalArt / INTRO.bubble }, { duration: 620, ease: 'Sine.easeInOut' }),
    )
    if (!alive()) return cleanup()
    cleanup()
    scene.events.off(Phaser.Scenes.Events.SHUTDOWN, cleanup)
    await panel.enter(start, goal)
    if (!alive()) return

    await FX.wait(scene, TIMING.beat)
    if (!alive()) return
    await cam.look(cloudY + 120, TIMING.cameraLong)
    if (!alive()) return
    await world.revealGoal()
    if (!alive()) return
    await FX.wait(scene, TIMING.beat)
    if (!alive()) return
    await cam.look(groundView(), TIMING.cameraLong)
}

export async function phaseIntro(scene: Phaser.Scene, deps: IntroDeps, start: Art, goal: Art, cloudY: number, alive: () => boolean) {
    const { cam, kid, panel, world } = deps
    await FX.all(kid.vanish(), cam.look(cloudY + 120, TIMING.camera))
    if (!alive()) return
    kid.place(KID.startX, WORLD.groundY)
    kid.container.setAlpha(0)
    await world.revealGoal()
    if (!alive()) return
    await panel.enter(start, goal)
    if (!alive()) return
    await FX.wait(scene, TIMING.beat)
    if (!alive()) return
    await cam.look(groundView(), TIMING.cameraLong)
    if (!alive()) return
    await kid.appear()
}
