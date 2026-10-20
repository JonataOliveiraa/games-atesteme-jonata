import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { CREW_CELL, CREW_SHEET, cellKey, type FigureData } from '../data/files'
import { CAR_X, CREW, DEPTH, FINISH } from '../data/layout'
import { TIMING } from '../data/timing'
import type { Vec } from '../types'
import { SHADOW, heightOf } from './art'
import type { Audio } from './audio'
import type { Car } from './car'
import type { View } from './view'

/**
 * A equipe mora na corrida, não na tela: cada um tem uma distância `p` e o
 * `update` o desenha onde a pista estiver. A Lua e o Davi esperam na tenda
 * chamada; o Tio Beto fica na linha de chegada.
 */
export interface Crew {
    update(screenX: (p: number) => number, near: (q: number) => number): void
    call(box: number | null): void
    readonly box: number | null
    toWheels(car: Car, carP: number): Promise<void>
    work(): Promise<void>
    back(): Promise<void>
    beto(cell: number): void
    betoHead(): Vec
    destroy(): void
}

interface Person {
    img: Phaser.GameObjects.Image
    shadow: Phaser.GameObjects.Image
    scale: number
    p: number
    feet: number
}

export function createCrew(scene: Phaser.Scene, view: View, audio: Audio): Crew {
    const person = (cell: number, height: number, depth: number): Person => {
        const img = view.world(scene.add.image(-500, 0, CREW_SHEET.key, cellKey(cell)).setDepth(depth))
        const scale = height / heightOf(scene, CREW_SHEET, cell)
        const shadow = view.world(scene.add.image(-500, 0, SHADOW).setDisplaySize(height * 0.5, 14).setAlpha(0.18).setDepth(depth - 0.2))
        const p: Person = { img, shadow, scale, p: 0, feet: CREW.idleFeet }
        frame(p, cell)
        return p
    }

    const frame = (p: Person, cell: number) => {
        p.img.setFrame(cellKey(cell))
        const px = (p.img.frame.customData as FigureData).px ?? 0.5
        p.img.setOrigin(px, 1).setScale(p.scale)
    }

    const beto = person(CREW_CELL.beto, CREW.betoH, DEPTH.beto)
    beto.feet = CREW.betoFeet
    const lua = person(CREW_CELL.lua, CREW.kidH, DEPTH.crewBack)
    const davi = person(CREW_CELL.davi, CREW.kidH, DEPTH.crewBack)
    const kids = [lua, davi]
    let box: number | null = null
    let sx: (p: number) => number = p => p
    let betoP = 0

    const draw = (p: Person, visible: boolean) => {
        const x = sx(p.p)
        p.img.setPosition(x, p.feet).setVisible(visible)
        p.shadow.setPosition(x, p.feet - 2).setVisible(visible)
    }

    const run = (p: Person, to: number, feet: number) => {
        const from = { p: p.p, feet: p.feet }
        const k = { t: 0 }
        return new Promise<void>(resolve => {
            scene.tweens.add({
                targets: k,
                t: 1,
                duration: FX.ms(scene, TIMING.run),
                ease: 'Sine.easeInOut',
                onUpdate: () => {
                    p.p = Phaser.Math.Linear(from.p, to, k.t)
                    p.feet = Phaser.Math.Linear(from.feet, feet, k.t) - Math.abs(Math.sin(k.t * Math.PI * 2) * 6)
                },
                onComplete: () => resolve(),
            })
        })
    }

    const depth = (front: boolean) =>
        kids.forEach(p => {
            p.img.setDepth(front ? DEPTH.crewFront : DEPTH.crewBack)
            p.shadow.setDepth((front ? DEPTH.crewFront : DEPTH.crewBack) - 0.2)
        })

    const crew: Crew = {
        update(screenX, near) {
            sx = screenX
            betoP = near(0) + FINISH.betoDX
            beto.p = betoP
            draw(beto, true)
            kids.forEach(p => draw(p, box !== null))
        },
        call(next) {
            if (next === box) return
            box = next
            scene.tweens.killTweensOf(kids.map(k => k.img))
            depth(false)
            frame(lua, CREW_CELL.lua)
            frame(davi, CREW_CELL.davi)
            if (next === null) return
            lua.p = next + CREW.luaDX
            davi.p = next + CREW.daviDX
            lua.feet = davi.feet = CREW.idleFeet
        },
        get box() {
            return box
        },
        async toWheels(car, carP) {
            depth(true)
            const rear = car.wheel(0).x - CAR_X + carP
            const front = car.wheel(1).x - CAR_X + carP
            await FX.all(run(lua, rear - CREW.workGap, CREW.workFeet), run(davi, front + CREW.workGap, CREW.workFeet))
            frame(lua, CREW_CELL.luaWork)
            frame(davi, CREW_CELL.daviWork)
        },
        async work() {
            for (let n = 0; n < 2; n++) {
                audio.zzzt()
                await FX.to(scene, [lua.img, davi.img], { angle: 4 }, { duration: TIMING.zzzt / 2, yoyo: true })
                lua.img.setAngle(0)
                davi.img.setAngle(0)
            }
        },
        async back() {
            if (box === null) return
            frame(lua, CREW_CELL.lua)
            frame(davi, CREW_CELL.davi)
            await FX.all(run(lua, box + CREW.luaDX, CREW.idleFeet), run(davi, box + CREW.daviDX, CREW.idleFeet))
            depth(false)
        },
        beto(cell) {
            frame(beto, cell)
        },
        betoHead() {
            return { x: beto.img.x, y: beto.img.y - CREW.betoH * 0.66 }
        },
        destroy() {
            ;[beto, ...kids].forEach(p => {
                scene.tweens.killTweensOf(p.img)
                p.img.destroy()
                p.shadow.destroy()
            })
        },
    }
    return crew
}
