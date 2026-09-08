import Phaser from 'phaser'
import { Ease, FX } from '../../../../shared/effects/FX'
import { DEPTH, FIGHTER } from '../data/layout'
import { C } from '../data/theme'
import type { Pose, Side } from '../types'

export const DUPLA_SHEET = 'dupla'
export const DUPLA_COLUMNS = 4
export const DUPLA_ROWS = 2

const FRAME: Record<Side, Record<Pose, number>> = {
    child: { wait: 0, pull: 1, think: 2, cheer: 3 },
    robot: { wait: 4, pull: 5, think: 6, cheer: 7 },
}

function drawStandIn(g: Phaser.GameObjects.Graphics, side: Side, size: number) {
    const u = size / 100
    const body = side === 'child' ? C.child : C.robot
    const dark = side === 'child' ? C.childDark : C.robotDark

    g.clear()
    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(-26 * u, -14 * u, 52 * u, 54 * u, 14 * u)
    g.fillStyle(dark, 1)
    g.fillRoundedRect(-22 * u, -10 * u, 44 * u, 46 * u, 11 * u)
    g.fillStyle(body, 1)
    g.fillRoundedRect(-22 * u, -10 * u, 44 * u, 34 * u, 11 * u)
    g.fillStyle(C.ink, 1)
    g.fillCircle(0, -30 * u, 21 * u)
    g.fillStyle(body, 1)
    g.fillCircle(0, -30 * u, 17 * u)
    g.fillStyle(C.white, 1)
    g.fillCircle(-6 * u, -32 * u, 4 * u)
    g.fillCircle(6 * u, -32 * u, 4 * u)
    g.fillStyle(C.ink, 1)
    g.fillCircle(-6 * u, -32 * u, 2 * u)
    g.fillCircle(6 * u, -32 * u, 2 * u)
}

function createOne(scene: Phaser.Scene, side: Side, x: number, y: number) {
    const size = FIGHTER.size
    const sheetOk = scene.textures.exists(DUPLA_SHEET)
        && scene.textures.get(DUPLA_SHEET).has(String(FRAME[side].wait))

    const sprite = sheetOk
        ? scene.add.sprite(0, 0, DUPLA_SHEET, FRAME[side].wait).setDisplaySize(size, size)
        : null
    const art = sprite ? null : scene.add.graphics()
    if (art) drawStandIn(art, side, size)

    const root = scene.add.container(x, y, [sprite ?? art!]).setDepth(DEPTH.fighter)

    return {
        root,
        homeX: x,
        homeY: y,
        setPose(pose: Pose) {
            if (!sprite) return
            const frame = FRAME[side][pose]
            if (!scene.textures.get(DUPLA_SHEET).has(String(frame))) return
            sprite.setFrame(frame)
            sprite.setDisplaySize(size, size)
        },
    }
}

export function createFighters(scene: Phaser.Scene) {
    const child = createOne(scene, 'child', FIGHTER.childX, FIGHTER.childY)
    const robot = createOne(scene, 'robot', FIGHTER.robotX, FIGHTER.robotY)

    const both = (pose: Pose) => {
        child.setPose(pose)
        robot.setPose(pose)
    }

    return {
        setPose(side: Side, pose: Pose) {
            (side === 'child' ? child : robot).setPose(pose)
        },

        idle() {
            both('wait')
        },

        thinking() {
            child.setPose('think')
            robot.setPose('think')
        },

        async tug(winner: Side) {
            const lean = winner === 'child' ? -22 : 22
            child.setPose('pull')
            robot.setPose('pull')

            await FX.all(
                FX.to(scene, child.root, { x: child.homeX + lean }, { duration: 220, ease: Ease.back(1.6) }),
                FX.to(scene, robot.root, { x: robot.homeX + lean }, { duration: 220, ease: Ease.back(1.6) }),
            )
            await FX.all(
                FX.to(scene, child.root, { x: child.homeX }, { duration: 320 }),
                FX.to(scene, robot.root, { x: robot.homeX }, { duration: 320 }),
            )

            both('wait')
        },

        async cheer(side: Side) {
            const one = side === 'child' ? child : robot
            one.setPose('cheer')
            await FX.to(scene, one.root, { y: one.homeY - 26 }, { duration: 240, yoyo: true, ease: 'Sine.easeOut' })
            one.root.setY(one.homeY)
        },

        bounds(side: Side) {
            const one = side === 'child' ? child : robot
            return { x: one.root.x, y: one.root.y, w: FIGHTER.size, h: FIGHTER.size }
        },

        destroy() {
            scene.tweens.killTweensOf(child.root)
            scene.tweens.killTweensOf(robot.root)
            child.root.destroy(true)
            robot.root.destroy(true)
        },
    }
}

export type Fighters = ReturnType<typeof createFighters>
