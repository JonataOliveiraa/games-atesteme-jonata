import Phaser from 'phaser'
import { BG, DEPTH, H, PROPS, TRAIL, W, WORLD } from '../data/layout'
import { C } from '../data/theme'
import { boxOf, cutSheet, trimTop } from './sheet'
import type { Solid } from '../types'

type Made = Phaser.GameObjects.Image | Phaser.GameObjects.Graphics

export function createMundo(scene: Phaser.Scene) {
    let made: Made[] = []
    let solids: Solid[] = []

    const keep = <T extends Made>(object: T): T => {
        made.push(object)
        return object
    }

    const buildSky = (hour: number) => {
        const sheet = cutSheet(scene, 'ceu', 1, 3)
        if (!sheet) {
            const g = keep(scene.add.graphics()).setScrollFactor(0).setDepth(DEPTH.sky)
            g.fillStyle(C.ceu, 1)
            g.fillRect(0, 0, W, BG.skyBottom)
            g.fillStyle(C.white, 0.35)
            g.fillRect(0, BG.skyBottom - 130, W, 130)
            return
        }
        const scale = BG.skyBottom / sheet.frameH
        keep(scene.add.image(0, 0, 'ceu', String(hour)))
            .setOrigin(0, 0)
            .setDisplaySize(sheet.frameW * scale, BG.skyBottom)
            .setScrollFactor(BG.skyFactor)
            .setDepth(DEPTH.sky)
    }

    const buildHills = () => {
        const sheet = cutSheet(scene, 'morros', 1, 1)
        if (!sheet) {
            const g = keep(scene.add.graphics()).setScrollFactor(0).setDepth(DEPTH.hills)
            g.fillStyle(C.mato, 1)
            g.fillEllipse(300, BG.hillsBottom + 50, 940, 280)
            g.fillEllipse(980, BG.hillsBottom + 50, 1140, 320)
            return
        }
        const scale = BG.hillsH / sheet.frameH
        const width = sheet.frameW * scale
        const span = W + (WORLD.width - W) * BG.hillsFactor + width
        const copies = Math.ceil(span / width)
        for (let i = 0; i < copies; i++) {
            keep(scene.add.image(i * (width - 1), BG.hillsBottom, 'morros'))
                .setOrigin(0, 1)
                .setDisplaySize(width, BG.hillsH)
                .setScrollFactor(BG.hillsFactor)
                .setDepth(DEPTH.hills)
        }
    }

    const buildGround = () => {
        const skirt = keep(scene.add.graphics()).setDepth(DEPTH.ground - 1)
        skirt.fillStyle(C.terra, 1)
        skirt.fillRect(0, WORLD.groundY, WORLD.width, H - WORLD.groundY)

        const sheet = cutSheet(scene, 'chao', 1, 1, true)
        if (!sheet) {
            const g = keep(scene.add.graphics()).setDepth(DEPTH.ground)
            g.fillStyle(C.areia, 1)
            g.fillRect(0, WORLD.groundY, WORLD.width, 18)
            return
        }
        const height = trimTop(scene, sheet)
        const copies = Math.ceil(WORLD.width / (sheet.frameW - 1)) + 1
        for (let i = 0; i < copies; i++) {
            keep(scene.add.image(i * (sheet.frameW - 1), WORLD.groundY, 'chao', 'ink0'))
                .setOrigin(0, 0)
                .setDisplaySize(sheet.frameW, height)
                .setDepth(DEPTH.ground)
        }
    }

    const buildProps = () => {
        const sheet = cutSheet(scene, 'trilha', 4, 1)

        TRAIL.forEach(item => {
            const prop = PROPS[item.prop]

            if (!sheet) {
                const g = keep(scene.add.graphics()).setDepth(prop.solid ? DEPTH.solid : DEPTH.decor)
                g.fillStyle(prop.solid ? C.terra : C.mato, 1)
                g.fillRoundedRect(item.x - 44, WORLD.groundY - prop.height, 88, prop.height, 12)
                if (prop.solid) {
                    solids.push({ x: item.x - 44, y: WORLD.groundY - prop.height, w: 88 })
                }
                return
            }

            const box = boxOf(sheet, prop.frame)
            const scale = prop.height / (box.height * sheet.frameH)
            const drawnW = sheet.frameW * scale
            const drawnH = sheet.frameH * scale
            const centerShift = (box.left + box.width / 2 - 0.5) * drawnW

            keep(
                scene.add.image(
                    item.x - centerShift,
                    WORLD.groundY + (1 - box.bottom) * drawnH,
                    'trilha',
                    String(prop.frame),
                ),
            )
                .setOrigin(0.5, 1)
                .setDisplaySize(drawnW, drawnH)
                .setDepth(prop.solid ? DEPTH.solid : DEPTH.decor)

            if (!prop.solid) return
            const width = box.width * drawnW
            solids.push({ x: item.x - width / 2, y: WORLD.groundY - prop.height, w: width })
        })
    }

    const buildWorkshop = () => {
        const sheet = cutSheet(scene, 'oficina', 1, 1)
        if (!sheet) {
            const g = keep(scene.add.graphics()).setDepth(DEPTH.workshop)
            g.fillStyle(C.terra, 1)
            g.fillRect(WORLD.workshopX - 150, WORLD.groundY - 250, 300, 250)
            g.fillStyle(C.coral, 1)
            g.fillTriangle(
                WORLD.workshopX - 190,
                WORLD.groundY - 240,
                WORLD.workshopX + 190,
                WORLD.groundY - 240,
                WORLD.workshopX,
                WORLD.groundY - 360,
            )
            g.fillStyle(C.ink, 1)
            g.fillRoundedRect(WORLD.workshopX - 62, WORLD.groundY - 170, 124, 170, 10)
            return
        }
        const box = boxOf(sheet, 0)
        const height = 330
        const scale = height / (box.height * sheet.frameH)
        const drawnW = sheet.frameW * scale
        const drawnH = sheet.frameH * scale
        const centerShift = (box.left + box.width / 2 - 0.5) * drawnW

        keep(
            scene.add.image(
                WORLD.workshopX - centerShift,
                WORLD.groundY + (1 - box.bottom) * drawnH + 6,
                'oficina',
            ),
        )
            .setOrigin(0.5, 1)
            .setDisplaySize(drawnW, drawnH)
            .setDepth(DEPTH.workshop)
    }

    const buildDestino = (frame: number, x: number) => {
        const sheet = cutSheet(scene, 'destinos', 3, 1)
        if (!sheet) {
            const g = keep(scene.add.graphics()).setDepth(DEPTH.workshop)
            g.fillStyle(C.cardDeep, 1)
            g.fillRoundedRect(x - 120, WORLD.groundY - 200, 240, 200, 14)
            g.fillStyle(C.coral, 1)
            g.fillTriangle(x - 150, WORLD.groundY - 190, x + 150, WORLD.groundY - 190, x, WORLD.groundY - 290)
            return
        }
        const box = boxOf(sheet, frame)
        const height = 300
        const scale = height / (box.height * sheet.frameH)
        const drawnW = sheet.frameW * scale
        const drawnH = sheet.frameH * scale
        const centerShift = (box.left + box.width / 2 - 0.5) * drawnW

        keep(
            scene.add.image(
                x - centerShift,
                WORLD.groundY + (1 - box.bottom) * drawnH + 10,
                'destinos',
                String(frame),
            ),
        )
            .setOrigin(0.5, 1)
            .setDisplaySize(drawnW, drawnH)
            .setDepth(DEPTH.workshop)
    }

    const buildRiver = () => {
        const g = keep(scene.add.graphics()).setDepth(DEPTH.puddle)
        const x0 = WORLD.riverX
        const x1 = WORLD.riverX + WORLD.riverW
        const cx = (x0 + x1) / 2
        const lip = 34
        const ground = WORLD.groundY
        const surface = ground + 12
        const left = x0 - lip
        const width = WORLD.riverW + lip * 2

        g.fillStyle(0x6b4527, 1)
        g.fillRoundedRect(left, ground - 8, width, H - ground + 30, { tl: 24, tr: 24, bl: 0, br: 0 })
        g.fillStyle(0x2c6b8a, 1)
        g.fillRoundedRect(left + 16, surface, width - 32, H - surface + 20, {
            tl: 18,
            tr: 18,
            bl: 0,
            br: 0,
        })
        g.fillStyle(C.agua, 1)
        g.fillRoundedRect(left + 16, surface, width - 32, 40, { tl: 18, tr: 18, bl: 0, br: 0 })

        g.fillStyle(C.white, 0.5)
        g.fillEllipse(cx - 50, surface + 16, 66, 9)
        g.fillEllipse(cx + 52, surface + 44, 48, 8)
        g.fillStyle(C.white, 0.28)
        g.fillEllipse(cx - 8, surface + 74, 88, 10)

        g.fillStyle(C.areia, 1)
        g.fillEllipse(left + 8, ground + 1, 84, 26)
        g.fillEllipse(left + width - 8, ground + 1, 84, 26)

        g.fillStyle(0xb07a45, 1)
        g.fillRoundedRect(left - 26, ground - 28, 62, 13, 5)
        g.fillRoundedRect(left + width - 36, ground - 28, 62, 13, 5)
        g.fillStyle(C.ink, 0.3)
        g.fillRoundedRect(left - 26, ground - 19, 62, 4, 2)
        g.fillRoundedRect(left + width - 36, ground - 19, 62, 4, 2)
    }

    const buildPuddle = () => {
        const g = keep(scene.add.graphics()).setDepth(DEPTH.puddle)
        const x = WORLD.puddleX + WORLD.puddleW / 2
        g.fillStyle(C.ink, 0.16)
        g.fillEllipse(x, WORLD.groundY + 6, WORLD.puddleW, 32)
        g.fillStyle(C.agua, 0.85)
        g.fillEllipse(x, WORLD.groundY + 4, WORLD.puddleW - 18, 24)
        g.fillStyle(C.white, 0.5)
        g.fillEllipse(x - 44, WORLD.groundY, 72, 8)
    }

    const clear = () => {
        made.forEach(object => object.destroy())
        made = []
        solids = []
    }

    return {
        build(hour: number, destino?: { frame: number; x: number }, semRio = false) {
            clear()
            buildSky(hour)
            buildHills()
            buildGround()
            if (destino) buildDestino(destino.frame, destino.x)
            if (!semRio) buildRiver()
            buildPuddle()
            buildProps()
            buildWorkshop()
        },

        solids() {
            return solids
        },

        inPuddle(x: number) {
            return x > WORLD.puddleX && x < WORLD.puddleX + WORLD.puddleW
        },

        splash(x: number) {
            const drops = scene.add.graphics().setDepth(DEPTH.puddle + 1)
            drops.fillStyle(C.agua, 0.9)
            for (let i = 0; i < 7; i++) {
                drops.fillCircle(
                    x + Phaser.Math.Between(-44, 44),
                    WORLD.groundY - Phaser.Math.Between(2, 18),
                    Phaser.Math.Between(4, 9),
                )
            }
            scene.tweens.add({
                targets: drops,
                y: -36,
                alpha: 0,
                duration: 440,
                ease: 'Cubic.easeOut',
                onComplete: () => drops.destroy(),
            })
        },

        destroy() {
            clear()
        },
    }
}

export type Mundo = ReturnType<typeof createMundo>
