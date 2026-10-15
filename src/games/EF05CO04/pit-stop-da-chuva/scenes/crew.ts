import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { CREW_CELL, CREW_SHEET, cellKey, type FigureData } from '../data/files'
import { CREW, DEPTH, GROUND } from '../data/layout'
import { TIMING } from '../data/timing'
import type { Rect, TireId, Vec } from '../types'
import { SHADOW, heightOf } from './art'
import type { Audio } from './audio'
import type { Kart } from './kart'
import type { Rider } from './track'
import type { View } from './view'

export interface Crew extends Rider {
    beto(cell: number): void
    swap(kart: Kart, tire: TireId): Promise<void>
    betoHead(): Vec
    betoRect(): Rect
    destroy(): void
}

interface Person {
    img: Phaser.GameObjects.Image
    shadow: Phaser.GameObjects.Image
    scale: number
    baseX: number
    feet: number
    idle: number
    busy: boolean
}

export function createCrew(scene: Phaser.Scene, view: View, audio: Audio): Crew {
    const person = (cell: number, x: number, feet: number, height: number, depth: number): Person => {
        const img = view.world(scene.add.image(x, feet, CREW_SHEET.key, cellKey(cell)).setDepth(depth))
        const scale = height / heightOf(scene, CREW_SHEET, cell)
        const shadow = view.world(scene.add.image(x, feet - 2, SHADOW).setDisplaySize(height * 0.5, 18).setAlpha(0.18).setDepth(depth - 0.5))
        const p: Person = { img, shadow, scale, baseX: x, feet, idle: cell, busy: false }
        frame(p, cell)
        return p
    }

    const frame = (p: Person, cell: number) => {
        p.img.setFrame(cellKey(cell))
        const px = (p.img.frame.customData as FigureData).px ?? 0.5
        p.img.setOrigin(px, 1).setScale(p.scale)
    }

    const place = (p: Person, x: number, feet: number) => {
        p.img.setPosition(x, feet)
        p.shadow.setPosition(x, feet - 2)
    }

    const beto = person(CREW_CELL.beto, CREW.betoX, GROUND + 8, CREW.betoH, DEPTH.beto)
    const lua = person(CREW_CELL.lua, CREW.luaX, CREW.idleFeet, CREW.kidH, DEPTH.crewBack)
    const davi = person(CREW_CELL.davi, CREW.daviX, CREW.idleFeet, CREW.kidH, DEPTH.crewBack)
    const people = [beto, lua, davi]
    let ox = 0

    const run = (p: Person, x: number, feet: number) => {
        const from = { x: p.img.x, y: p.img.y }
        const k = { t: 0 }
        return new Promise<void>(resolve => {
            scene.tweens.add({
                targets: k,
                t: 1,
                duration: FX.ms(scene, TIMING.run),
                ease: 'Sine.easeInOut',
                onUpdate: () => {
                    const hop = Math.sin(k.t * Math.PI * 2) * 6
                    place(p, Phaser.Math.Linear(from.x, x, k.t), Phaser.Math.Linear(from.y, feet, k.t) - Math.abs(hop))
                },
                onComplete: () => resolve(),
            })
        })
    }

    const work = async (p: Person, cell: number) => {
        frame(p, cell)
        for (let n = 0; n < 2; n++) {
            audio.zzzt()
            await FX.to(scene, p.img, { angle: 4 }, { duration: TIMING.zzzt / 2, yoyo: true })
            p.img.setAngle(0)
        }
    }

    const crew: Crew = {
        ride(offset) {
            ox = offset
            people.forEach(p => {
                if (p.busy) return
                place(p, p.baseX - ox, p.feet)
            })
        },
        beto(cell) {
            frame(beto, cell)
        },
        async swap(kart, tire) {
            lua.busy = true
            davi.busy = true
            const rear = kart.wheel(0)
            const front = kart.wheel(1)
            ;[lua, davi].forEach(p => {
                p.img.setDepth(DEPTH.crewFront)
                p.shadow.setDepth(DEPTH.crewFront - 0.5)
            })
            await FX.all(run(lua, rear.x - CREW.workGap, CREW.workFeet), run(davi, front.x + CREW.workGap, CREW.workFeet))
            await FX.all(work(lua, CREW_CELL.luaWork), work(davi, CREW_CELL.daviWork))
            audio.pop()
            await kart.swapTires(tire)
            frame(lua, CREW_CELL.lua)
            frame(davi, CREW_CELL.davi)
            await FX.all(run(lua, lua.baseX - ox, lua.feet), run(davi, davi.baseX - ox, davi.feet))
            ;[lua, davi].forEach(p => {
                p.img.setDepth(DEPTH.crewBack)
                p.shadow.setDepth(DEPTH.crewBack - 0.5)
                p.busy = false
            })
        },
        betoHead() {
            return { x: beto.img.x, y: beto.img.y - CREW.betoH * 0.62 }
        },
        betoRect() {
            return { x: beto.img.x, y: beto.img.y - CREW.betoH / 2, w: CREW.betoH * 0.7, h: CREW.betoH }
        },
        destroy() {
            people.forEach(p => {
                scene.tweens.killTweensOf(p.img)
                p.img.destroy()
                p.shadow.destroy()
            })
        },
    }
    return crew
}
