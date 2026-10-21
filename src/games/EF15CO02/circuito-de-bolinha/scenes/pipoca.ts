import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { PIPOCA_CELL, PIPOCA_SHEET, cellKey } from '../data/files'
import { CAT, SD } from '../data/layout'
import { CSS, FONT, SIZE } from '../data/theme'
import { TIMING } from '../data/timing'
import { MEOW } from '../data/words'
import type { Vec } from '../types'
import type { Audio } from './audio'
import type { Stage } from './stage'

export interface Pipoca {
    enter(to: Vec, width: number): Promise<void>
    move(to: Vec): Promise<void>
    wake(): Promise<void>
    leave(): Promise<void>
    head(): Vec
    hide(): void
    destroy(): void
}

export function createPipoca(scene: Phaser.Scene, stage: Stage, audio: Audio): Pipoca {
    const image = stage.add(
        scene.add.image(CAT.enterX, 0, PIPOCA_SHEET.key, cellKey(PIPOCA_CELL.walk)).setOrigin(0.5, 1).setVisible(false),
        SD.cat,
    )
    const notes = new Set<Phaser.GameObjects.Text>()
    let snore: Phaser.Time.TimerEvent | undefined
    let ground = 0

    const word = (text: string, x: number, y: number, size: number) => {
        const t = stage.add(
            scene.add
                .text(x, y, text, { fontFamily: FONT.black, fontSize: `${size}px`, color: CSS.ink, stroke: CSS.white, strokeThickness: 6 })
                .setOrigin(0.5)
                .setResolution(2),
            SD.fx,
        )
        notes.add(t)
        return t
    }

    const drop = (t: Phaser.GameObjects.Text) => {
        if (!notes.delete(t)) return
        scene.tweens.killTweensOf(t)
        t.destroy()
    }

    const quiet = () => {
        snore?.remove()
        snore = undefined
        notes.forEach(drop)
    }

    const zzz = () => {
        const top = pipoca.head()
        const t = word('z', top.x + (image.flipX ? -1 : 1) * 10, top.y - 10, SIZE.zzz).setAlpha(0)
        void FX.to(scene, t, { alpha: 1, y: t.y - 30, x: t.x + 18 }, { duration: TIMING.zzz * 0.6, ease: 'Sine.easeOut' })
            .then(() => (t.active ? FX.to(scene, t, { alpha: 0, y: t.y - 16 }, { duration: TIMING.zzz * 0.5 }) : undefined))
            .then(() => drop(t))
    }

    const sleep = () => {
        image.setFrame(cellKey(PIPOCA_CELL.sleep))
        audio.purr()
        zzz()
        snore = scene.time.addEvent({ delay: TIMING.zzz, loop: true, callback: zzz })
    }

    const walk = async (x: number) => {
        quiet()
        scene.tweens.killTweensOf(image)
        image.setFrame(cellKey(PIPOCA_CELL.walk)).setY(ground).setAngle(0)
        if (x !== image.x) image.setFlipX(x > image.x)
        const ms = Math.abs(x - image.x) / TIMING.walk
        const bob = scene.tweens.add({ targets: image, y: ground - CAT.bob, duration: 140, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
        await FX.to(scene, image, { x }, { duration: Math.max(200, ms), ease: 'Linear' })
        bob.remove()
        image.setY(ground)
    }

    const pipoca: Pipoca = {
        async enter(to, width) {
            quiet()
            ground = to.y
            image.setScale(1).setVisible(true).setAlpha(1).setFlipX(false).setPosition(CAT.enterX, ground)
            image.setScale((width * CAT.w) / image.width)
            await walk(to.x)
            image.setFlipX(false)
            sleep()
        },
        async move(to) {
            ground = to.y
            await walk(to.x)
            image.setFlipX(false)
            sleep()
        },
        async wake() {
            quiet()
            audio.meow()
            image.setFrame(cellKey(PIPOCA_CELL.wake))
            const top = pipoca.head()
            const t = word(MEOW, top.x, top.y - 40, SIZE.meow)
            void FX.popIn(scene, t, { from: 0.5, duration: 260 })
            await FX.to(scene, image, { y: ground - 46 }, { duration: 200, yoyo: true, ease: 'Quad.easeOut' })
            image.setY(ground)
        },
        async leave() {
            await walk(CAT.enterX)
            pipoca.hide()
        },
        head: () => ({ x: image.x, y: image.y - image.displayHeight * CAT.head }),
        hide() {
            quiet()
            scene.tweens.killTweensOf(image)
            image.setVisible(false).setPosition(CAT.enterX, ground)
        },
        destroy() {
            pipoca.hide()
            image.destroy()
        },
    }
    return pipoca
}
