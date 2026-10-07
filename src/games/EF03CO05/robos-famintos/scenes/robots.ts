import Phaser from 'phaser'
import { FX, Ease } from '../../../../shared/effects/FX'
import { OBJ, OBJ_CELL, OBJECTS, PLATE_ART, readAs, ROBOT_ART, ROBOT_CELL, ROBOTS, robotFrame, type Face } from '../data/files'
import { robotRect } from '../data/flight'
import { DEPTH, PLATE, ROBOT } from '../data/layout'
import { CSS, FONT, SIZE } from '../data/theme'
import { PLATE as PLATE_WORDS } from '../data/words'
import type { Format, Payload, Rect, Vec } from '../types'
import { createDataView, type DataView } from './data-art'

interface Bot {
    format: Format
    feet: Vec
    body: Phaser.GameObjects.Container
    sprite: Phaser.GameObjects.Sprite
    screen: DataView
    plate: Phaser.GameObjects.Container
}

export interface Robots {
    load(spots: Partial<Record<Format, Vec>>): void
    enter(): Promise<void>
    aim(format: Format | undefined): void
    eat(format: Format, payload: Payload, right: boolean): Promise<void>
    refuse(format: Format): Promise<void>
    cheer(): Promise<void>
    mouth(format: Format): Vec
    rect(format: Format): Rect
    allRect(): Rect
    face(format: Format, face: Face): void
    destroy(): void
}

const SCREEN: Rect = { x: 0, y: 0, w: ROBOT_ART.belly.w, h: ROBOT_ART.belly.h }

const bellyAt = (frame: number) => ROBOT_ART.bellyY[frame] - ROBOT_ART.foot

export function createRobots(scene: Phaser.Scene): Robots {
    let bots: Bot[] = []
    let aimed: Format | undefined

    const find = (format: Format) => bots.find(b => b.format === format)

    const clear = () => {
        bots.forEach(b => {
            scene.tweens.killTweensOf([b.body, b.plate])
            b.screen.destroy()
            b.body.destroy()
            b.plate.destroy()
        })
        bots = []
        aimed = undefined
    }

    const pop = (b: Bot) => {
        const c = b.screen.container
        scene.tweens.killTweensOf(c)
        c.setScale(ROBOT.bellyPop)
        scene.tweens.add({ targets: c, scale: 1, delay: 1100, duration: 380, ease: 'Back.easeIn' })
    }

    const setFace = (b: Bot, face: Face) => {
        const frame = robotFrame(b.format, face)
        b.sprite.setFrame(frame)
        b.screen.container.setY(bellyAt(frame))
    }

    return {
        load(spots) {
            clear()
            ;(Object.entries(spots) as [Format, Vec][]).forEach(([format, feet]) => {
                const p = feet
                const sprite = scene.add.sprite(0, 0, ROBOTS, robotFrame(format, 'idle')).setOrigin(ROBOT_ART.centerX[format] / ROBOT_CELL, ROBOT_ART.foot / ROBOT_CELL)
                const screen = createDataView(scene)
                screen.container.setY(bellyAt(robotFrame(format, 'idle')))
                const body = scene.add.container(p.x, p.y, [sprite, screen.container]).setScale(ROBOT.scale).setDepth(DEPTH.robot)
                const art = scene.add.sprite(0, 0, OBJECTS, OBJ.plate).setOrigin(PLATE_ART.x / OBJ_CELL, PLATE_ART.y / OBJ_CELL).setScale(PLATE.scale)
                const label = scene.add
                    .text(0, 1, PLATE_WORDS[format], { fontFamily: FONT.black, fontSize: `${SIZE.plate}px`, color: CSS.ink })
                    .setOrigin(0.5)
                    .setResolution(2)
                const plate = scene.add.container(p.x, p.y + PLATE.dy, [art, label]).setDepth(DEPTH.plate)
                bots.push({ format, feet, body, sprite, screen, plate })
            })
        },
        async enter() {
            await Promise.all(
                bots.map((b, i) => {
                    const y = b.body.y
                    b.body.setY(y - ROBOT.jump * 3).setAlpha(0)
                    b.plate.setAlpha(0)
                    void FX.to(scene, b.plate, { alpha: 1 }, { duration: 260, delay: 200 + i * 120 })
                    return FX.to(scene, b.body, { y, alpha: 1 }, { duration: 520, delay: i * 120, ease: Ease.back(1.4) })
                }),
            )
        },
        aim(format) {
            if (format === aimed) return
            aimed = format
            bots.forEach(b => {
                const on = b.format === format
                setFace(b, on ? 'open' : 'idle')
                scene.tweens.killTweensOf(b.body)
                void FX.to(scene, b.body, { scaleX: ROBOT.scale * (on ? 1.06 : 1), scaleY: ROBOT.scale * (on ? 1.08 : 1), angle: on ? -4 : 0 }, { duration: 160 })
            })
        },
        async eat(format, payload, right) {
            const b = find(format)
            if (!b) return
            aimed = undefined
            scene.tweens.killTweensOf(b.body)
            setFace(b, 'chew')
            await FX.to(scene, b.body, { scaleX: ROBOT.scale * 1.14, scaleY: ROBOT.scale * 0.9, angle: 0 }, { duration: 110 })
            void FX.to(scene, b.body, { scaleX: ROBOT.scale, scaleY: ROBOT.scale }, { duration: 420, ease: Ease.spring(2, 7) })
            if (right) {
                b.screen.show(payload, 'decoded', SCREEN, 1800)
                b.screen.reveal(0)
                pop(b)
                const step = { t: 0 }
                await new Promise<void>(resolve =>
                    scene.tweens.add({ targets: step, t: 1, duration: 520, onUpdate: () => b.screen.reveal(step.t), onComplete: () => resolve() }),
                )
                void FX.sparks(scene, b.body.x, b.body.y - 110, { color: 0xffe27a, count: 10, spread: 90, depth: DEPTH.fx })
                scene.time.delayedCall(900, () => {
                    if (b.sprite.active && aimed !== b.format) setFace(b, 'idle')
                })
                return
            }
            b.screen.show(readAs(b.format, payload), 'garbage', SCREEN, 1400)
            pop(b)
            await FX.wait(scene, 380)
            setFace(b, 'yuck')
            await FX.shake(scene, b.body, { amount: 6, times: 3 })
        },
        async refuse(format) {
            const b = find(format)
            if (!b) return
            aimed = undefined
            setFace(b, 'idle')
            await FX.to(scene, b.body, { angle: 6, scaleX: ROBOT.scale, scaleY: ROBOT.scale }, { duration: 120, yoyo: true, repeat: 1 })
            b.body.setAngle(0)
        },
        async cheer() {
            await Promise.all(
                bots.map((b, i) => {
                    setFace(b, 'chew')
                    const y = b.body.y
                    return FX.to(scene, b.body, { y: y - 26 }, { duration: 200, delay: i * 90, yoyo: true, repeat: 1, ease: Ease.smooth })
                }),
            )
        },
        mouth(format) {
            const b = find(format)
            if (!b) return { x: 0, y: 0 }
            return {
                x: b.body.x + ROBOT_ART.mouth.dx * ROBOT.scale,
                y: b.body.y - (ROBOT_ART.foot - ROBOT_ART.mouth.y) * ROBOT.scale,
            }
        },
        rect(format) {
            const b = find(format)
            return b ? robotRect(b.feet) : { x: 0, y: 0, w: 0, h: 0 }
        },
        allRect() {
            const rs = bots.map(b => robotRect(b.feet))
            const left = Math.min(...rs.map(r => r.x - r.w / 2))
            const right = Math.max(...rs.map(r => r.x + r.w / 2))
            const top = Math.min(...rs.map(r => r.y - r.h / 2))
            const bottom = Math.max(...bots.map(b => b.feet.y + PLATE.dy + 28))
            return { x: (left + right) / 2, y: (top + bottom) / 2, w: right - left, h: bottom - top }
        },
        face(format, face) {
            const b = find(format)
            if (b) setFace(b, face)
        },
        destroy: clear,
    }
}
