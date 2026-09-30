import Phaser from 'phaser'
import { FX, Ease } from '../../../../shared/effects/FX'
import { POSE, ROBOT as ROBOT_KEY, ROBOT_CELL, type Pose } from '../data/files'
import { DEPTH, ROBOT } from '../data/layout'

export interface Robot {
    place(x: number): void
    walkTo(x: number): Promise<void>
    paint(): Promise<void>
    pose(p: Pose): void
    cheer(): Promise<void>
    shake(): Promise<void>
    destroy(): void
}

export function createRobot(scene: Phaser.Scene): Robot {
    const sprite = scene.add
        .sprite(0, ROBOT.foot, ROBOT_KEY, POSE.idle)
        .setOrigin(0.5, ROBOT_CELL.foot / ROBOT_CELL.size)
        .setScale(ROBOT.scale)
        .setDepth(DEPTH.robot)
    const pose = (p: Pose) => {
        sprite.setFrame(POSE[p])
    }

    return {
        place(x) {
            scene.tweens.killTweensOf(sprite)
            sprite.setPosition(x, ROBOT.foot).setScale(ROBOT.scale).setAngle(0).setAlpha(1)
            pose('idle')
        },
        async walkTo(x) {
            pose('walk')
            await Promise.all([
                FX.to(scene, sprite, { x }, { duration: 360, ease: Ease.smooth }),
                FX.to(scene, sprite, { y: ROBOT.foot - 12 }, { duration: 180, yoyo: true }),
            ])
            sprite.y = ROBOT.foot
            pose('idle')
        },
        async paint() {
            pose('paint')
            await FX.to(scene, sprite, { angle: 4 }, { duration: 140, yoyo: true, repeat: 1 })
            sprite.setAngle(0)
        },
        pose,
        async cheer() {
            pose('cheer')
            await FX.to(scene, sprite, { y: ROBOT.foot - 30 }, { duration: 220, yoyo: true, repeat: 1, ease: Ease.smooth })
            sprite.y = ROBOT.foot
        },
        async shake() {
            await FX.shake(scene, sprite, { amount: 6, times: 3 })
        },
        destroy() {
            sprite.destroy()
        },
    }
}
