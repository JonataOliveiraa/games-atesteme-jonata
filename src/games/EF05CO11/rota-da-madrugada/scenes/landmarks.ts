import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { HOUSE_SHEET, HOUSE_WINDOW, VILLAGE_CELL, VILLAGE_SHEET, cellKey, houseFrame } from '../data/files'
import { DEPTH, NEIGHBOR, VILLAGE } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import type { Vec } from '../types'
import { HALO_KEY } from './art'

export interface Landmarks {
    villageCenter(): Vec
    villageWindow(i: number): Vec
    lightVillage(stagger: number): Promise<void>
    lightOne(i: number): void
    neighborWindow(): Vec
    lightNeighbor(): void
    tagNeighbor(text: string): Promise<void>
    destroy(): void
}


export function createLandmarks(scene: Phaser.Scene): Landmarks {
    const village = scene.add
        .image(VILLAGE.x, VILLAGE.y, VILLAGE_SHEET.key, cellKey(VILLAGE_CELL.dark))
        .setOrigin(0.5, 1)
        .setScale(VILLAGE.scale)
        .setDepth(DEPTH.sky + 1)
    const hill = scene.add.ellipse(NEIGHBOR.x, NEIGHBOR.hillY, NEIGHBOR.hillW, NEIGHBOR.hillH, C.hill).setDepth(DEPTH.sky + 1)
    const house = scene.add
        .image(NEIGHBOR.x, NEIGHBOR.y, HOUSE_SHEET.key, houseFrame('a', false))
        .setOrigin(0.5, 1)
        .setScale(NEIGHBOR.scale)
        .setDepth(DEPTH.sky + 1)
    const glows: Phaser.GameObjects.GameObject[] = []
    let tag: Phaser.GameObjects.Container | undefined
    const cellW = (VILLAGE_SHEET.cell * VILLAGE.scale) / 2
    const cellH = (VILLAGE_SHEET.cellH ?? VILLAGE_SHEET.cell) * VILLAGE.scale

    const windowAt = (i: number): Vec => {
        const w = VILLAGE.windows[i % VILLAGE.windows.length]
        return { x: VILLAGE.x - cellW + (w.x + w.w / 2) * VILLAGE.scale, y: VILLAGE.y - cellH + (w.y + w.h / 2) * VILLAGE.scale }
    }

    const glow = (at: Vec, scale: number) => {
        const g = scene.add.image(at.x, at.y, HALO_KEY).setDepth(DEPTH.glow).setBlendMode(Phaser.BlendModes.ADD).setScale(0)
        glows.push(g)
        void FX.to(scene, g, { scale }, { duration: 240, ease: 'Back.easeOut' })
    }

    const lightOne = (i: number) => {
        const at = windowAt(i)
        const box = VILLAGE.windows[i % VILLAGE.windows.length]
        glows.push(scene.add.rectangle(at.x, at.y, box.w * VILLAGE.scale, box.h * VILLAGE.scale, C.windowLit).setDepth(DEPTH.sky + 2))
        glow(at, 0.35)
    }

    return {
        villageCenter: () => ({ x: VILLAGE.x, y: VILLAGE.y - cellH * 0.45 }),
        villageWindow: windowAt,
        async lightVillage(stagger) {
            for (let i = 0; i < VILLAGE.windows.length; i++) {
                lightOne(i)
                await FX.wait(scene, stagger)
            }
            village.setFrame(cellKey(VILLAGE_CELL.lit))
        },
        lightOne,
        neighborWindow: () => ({ x: house.x + HOUSE_WINDOW.a.x * NEIGHBOR.scale, y: house.y + HOUSE_WINDOW.a.y * NEIGHBOR.scale }),
        lightNeighbor() {
            house.setFrame(houseFrame('a', true))
            glow({ x: house.x + HOUSE_WINDOW.a.x * NEIGHBOR.scale, y: house.y + HOUSE_WINDOW.a.y * NEIGHBOR.scale }, 0.5)
        },
        async tagNeighbor(text) {
            const label = scene.add
                .text(0, 0, text, { fontFamily: FONT.black, fontSize: '24px', color: CSS.ink })
                .setOrigin(0.5)
                .setResolution(2)
            const w = label.width + 36
            const g = scene.add.graphics()
            g.fillStyle(C.shadow, 0.3)
            g.fillRoundedRect(-w / 2, -20 + 5, w, 40, 20)
            g.fillStyle(C.white, 1)
            g.fillRoundedRect(-w / 2, -20, w, 40, 20)
            g.fillTriangle(-10, 18, 10, 18, 0, 32)
            tag = scene.add
                .container(house.x, house.y - house.displayHeight * 0.8 - 30, [g, label])
                .setDepth(DEPTH.person)
            await FX.popIn(scene, tag, { from: 0.4, duration: 300 })
        },
        destroy() {
            glows.forEach(g => {
                scene.tweens.killTweensOf(g)
                g.destroy()
            })
            tag?.destroy()
            house.destroy()
            hill.destroy()
            village.destroy()
        },
    }
}
