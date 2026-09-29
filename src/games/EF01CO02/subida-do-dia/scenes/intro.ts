import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { CLOUD, DEPTH, H, INTRO, KID, W } from '../data/layout'
import { C } from '../data/theme'
import type { Art } from '../types'
import { createArtView } from './board'
import type { Board } from './board'
import type { Kid } from './kid'

function paintBubble(g: Phaser.GameObjects.Graphics, headX: number, headY: number) {
    const r = INTRO.bubble / 2 + 14
    const dots = [
        { x: headX + 34, y: headY - 12, r: 9 },
        { x: headX + 62, y: headY - 38, r: 14 },
    ]
    g.fillStyle(C.shadow, 0.12)
    g.fillCircle(INTRO.bubbleX + 3, INTRO.bubbleY + 6, r)
    for (const d of dots) {
        g.fillStyle(C.paperLight, 1)
        g.fillCircle(d.x, d.y, d.r)
        g.lineStyle(4, C.ink, 1)
        g.strokeCircle(d.x, d.y, d.r)
    }
    g.fillStyle(C.paperLight, 1)
    g.fillCircle(INTRO.bubbleX, INTRO.bubbleY, r)
    g.lineStyle(5, C.ink, 1)
    g.strokeCircle(INTRO.bubbleX, INTRO.bubbleY, r)
}

export async function playIntro(scene: Phaser.Scene, deps: { board: Board; kid: Kid }, goal: Art): Promise<void> {
    const cam = scene.cameras.main
    cam.setBounds(0, 0, W, H)
    cam.setZoom(INTRO.zoom)
    cam.centerOn(INTRO.focusX, INTRO.focusY)

    const bubble = scene.add.graphics().setDepth(DEPTH.bubble).setAlpha(0)
    paintBubble(bubble, KID.startX, KID.groundY - KID.height)
    const pic = createArtView(scene, INTRO.bubbleX, INTRO.bubbleY, INTRO.bubble)
    pic.set(goal)
    pic.container.setDepth(DEPTH.bubble + 1).setAlpha(0)

    let done = false
    const cleanup = () => {
        if (done) return
        done = true
        bubble.destroy()
        pic.destroy()
    }
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, cleanup)

    await FX.wait(scene, 500)
    await FX.impact(scene, deps.kid.container, 0.14)
    await FX.wait(scene, 300)
    await FX.all(FX.to(scene, bubble, { alpha: 1 }, { duration: 260 }), FX.popIn(scene, pic.container, { from: 0.4, delay: 120 }))
    await FX.wait(scene, INTRO.holdMs)
    if (done) return

    cam.pan(W / 2, H / 2, FX.ms(scene, INTRO.outMs), 'Sine.easeInOut')
    cam.zoomTo(1, FX.ms(scene, INTRO.outMs), 'Sine.easeInOut')
    await FX.wait(scene, INTRO.outMs + 60)
    if (done) return
    cam.setZoom(1)
    cam.centerOn(W / 2, H / 2)

    void FX.to(scene, bubble, { alpha: 0 }, { duration: 200 })
    await FX.to(
        scene,
        pic.container,
        { x: CLOUD.artX, y: CLOUD.artY, scale: CLOUD.art / INTRO.bubble },
        { duration: 620, ease: 'Sine.easeInOut' },
    )
    if (done) return
    const reveal = deps.board.revealGoal()
    await FX.wait(scene, 140)
    cleanup()
    scene.events.off(Phaser.Scenes.Events.SHUTDOWN, cleanup)
    await reveal
}
