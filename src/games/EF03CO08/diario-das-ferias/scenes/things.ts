import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { FARM_SHEET, NIGHT_SHEET, NOTE, THINGS_SHEET, THING_CELL, cellKey, type Sheet } from '../data/files'
import { DEPTH } from '../data/layout'
import { beatAt, beatIndexAt } from '../data/things'
import { C } from '../data/theme'
import type { Beat, ThingDef, ThingId, Tool } from '../types'
import { fit } from './art'
import type { Rect } from './guide'

export interface ThingView {
    readonly def: ThingDef
    beat(): Beat
    /** os desenhos que a foto copia (as notas ficam de fora: elas são o som) */
    photoParts(): Phaser.GameObjects.GameObject[]
    update(delta: number): void
    react(tool: Tool): void
    enter(): Promise<void>
    leave(): Promise<void>
    rect(): Rect
    destroy(): void
}

export interface ThingOptions {
    /** marca o objeto como do mundo (a câmera da praia o desenha) */
    world<T extends Phaser.GameObjects.GameObject>(obj: T): T
    /** toca o som da coisa; o volume depende de onde está o visor */
    sing(id: ThingId): void
}

const NOTE_EVERY = 300

export function createThing(scene: Phaser.Scene, def: ThingDef, opts: ThingOptions): ThingView {
    const parts: Phaser.GameObjects.Image[] = []
    const add = (cell: number, size: number, x: number, y: number, sheet: Sheet = THINGS_SHEET) => {
        const image = opts.world(fit(scene, sheet, cell, size).setPosition(x, y).setDepth(DEPTH.thing))
        parts.push(image)
        return image
    }

    let t = 0
    let beatIndex = -1
    let noteClock = 0
    let alive = true
    let running = false
    const notes = new Set<Phaser.GameObjects.Image>()

    const emitNote = () => {
        const from = def.notes
        const x = from.x + Phaser.Math.Between(-from.spread, from.spread)
        const tint = C.note[Phaser.Math.Between(0, C.note.length - 1)]
        const image = opts.world(scene.add.image(x, from.y, NOTE))
            .setOrigin(0.5)
            .setTint(tint)
            .setScale(0.75)
            .setAlpha(0)
            .setDepth(DEPTH.notes)
            .setAngle(Phaser.Math.Between(-14, 14))
        notes.add(image)
        const sway = Phaser.Math.Between(-36, 36)
        scene.tweens.add({ targets: image, alpha: 1, duration: 160 })
        scene.tweens.add({
            targets: image,
            y: from.y - 110,
            x: x + sway,
            scale: 0.95,
            duration: 1300,
            ease: 'Sine.easeOut',
            onComplete: () => {
                notes.delete(image)
                image.destroy()
            },
        })
        scene.tweens.add({ targets: image, alpha: 0, duration: 400, delay: 900 })
    }

    // ── cada coisa e o seu jeito de aparecer

    let crab: Phaser.GameObjects.Image | undefined
    let dolphin: Phaser.GameObjects.Image | undefined
    let dive: Phaser.GameObjects.Image | undefined
    let splash: Phaser.GameObjects.Image | undefined
    let wave: Phaser.GameObjects.Image | undefined

    if (def.id === 'rainbow') add(THING_CELL.rainbow, 340, def.x, def.y + 10).setAlpha(0)
    if (def.id === 'castle') add(THING_CELL.castle, 190, def.x, def.y).setAlpha(0)
    if (def.id === 'crab') crab = add(THING_CELL.crabWalk, 150, def.x, def.y + 40).setAlpha(0)
    if (def.id === 'dolphin') {
        dolphin = add(THING_CELL.dolphinJump, 230, def.x, def.y + 40).setAlpha(0)
        dive = add(THING_CELL.dolphinDive, 170, def.x + 90, def.y + 50).setAlpha(0)
        splash = add(THING_CELL.splash, 150, def.x, def.y + 80).setAlpha(0)
    }
    if (def.id === 'wave') {
        wave = add(THING_CELL.wave, 220, def.x, def.y + 70).setOrigin(0.5, 1).setAlpha(0)
        splash = add(THING_CELL.splash, 140, def.x + 20, def.y - 60).setAlpha(0)
    }

    // ── a figura genérica do N2 e do N3: aparece do jeito dela enquanto a coisa se vê
    const look = def.look
    const bx = def.x + (look?.dx ?? 0)
    const by = def.y + (look?.dy ?? 0)
    const fig = look ? add(look.cell, look.size, bx, by, look.sheet === 'coisas-sitio' ? FARM_SHEET : NIGHT_SHEET).setAlpha(0) : undefined
    const figScale = fig?.scale ?? 1
    let figShown = false
    let flickerClock = 0

    const showFig = (beat: Beat) => {
        if (!fig || !look) return
        const frame = beat.hear && look.alt !== undefined && look.motion !== 'flicker' ? look.alt : look.cell
        fig.setFrame(cellKey(frame))
        if (figShown) {
            if (beat.hear && look.alt !== undefined) void FX.to(scene, fig, { scale: figScale * 1.08 }, { duration: 140, yoyo: true })
            return
        }
        figShown = true
        scene.tweens.killTweensOf(fig)
        fig.setScale(figScale).setAngle(0)
        const m = look.motion
        if (m === 'hop') {
            fig.setPosition(bx, by + 50).setAlpha(0)
            scene.tweens.add({ targets: fig, y: by, alpha: 1, duration: 320, ease: 'Back.easeOut' })
        } else if (m === 'walk') {
            fig.setPosition(bx - 70, by).setAlpha(0)
            scene.tweens.add({ targets: fig, x: bx, alpha: 1, duration: 420, ease: 'Sine.easeOut' })
        } else if (m === 'drive') {
            fig.setPosition(bx - 150, by).setAlpha(0)
            scene.tweens.add({ targets: fig, alpha: 1, duration: 220 })
            scene.tweens.add({ targets: fig, x: bx + 150, duration: beat.ms, ease: 'Linear' })
        } else if (m === 'streak') {
            fig.setPosition(bx - 170, by - 50).setAlpha(0).setAngle(18)
            scene.tweens.add({ targets: fig, alpha: 1, duration: 200 })
            scene.tweens.add({ targets: fig, x: bx + 170, y: by + 50, duration: beat.ms, ease: 'Sine.easeInOut' })
        } else if (m === 'still') {
            fig.setPosition(bx, by)
            void FX.popIn(scene, fig, { from: 0.6, duration: 420 })
        } else {
            fig.setPosition(bx, by).setAlpha(0)
            scene.tweens.add({ targets: fig, alpha: 1, duration: 260 })
        }
    }

    const hideFig = () => {
        if (!fig || !look || !figShown) return
        figShown = false
        scene.tweens.killTweensOf(fig)
        const m = look.motion
        if (m === 'hop') scene.tweens.add({ targets: fig, y: by + 50, alpha: 0, duration: 260, ease: 'Sine.easeIn' })
        else if (m === 'walk') scene.tweens.add({ targets: fig, x: bx - 70, alpha: 0, duration: 320 })
        else scene.tweens.add({ targets: fig, alpha: 0, duration: 240 })
    }

    const moveFig = (delta: number) => {
        if (!fig || !look || !figShown) return
        const m = look.motion
        if (m === 'walk') fig.y = by + Math.abs(Math.sin(t / 160)) * -6
        else if (m === 'flutter') {
            fig.setPosition(bx + Math.sin(t / 500) * 40, by + Math.sin(t / 230) * 16)
            fig.setScale(figScale * (0.82 + 0.18 * Math.abs(Math.sin(t / 90))), figScale)
        } else if (m === 'bob') fig.setPosition(bx + Math.sin(t / 900) * 22, by + Math.sin(t / 380) * 5)
        else if (m === 'blink') fig.setAlpha(0.5 + 0.5 * Math.abs(Math.sin(t / 230)))
        else if (m === 'flicker' && look.alt !== undefined) {
            flickerClock += delta
            if (flickerClock > 150) {
                flickerClock = 0
                fig.setFrame(cellKey(fig.frame.name === cellKey(look.cell) ? look.alt : look.cell))
            }
        }
    }

    const puff = (image: Phaser.GameObjects.Image | undefined, ms = 500) => {
        if (!image) return
        scene.tweens.killTweensOf(image)
        image.setAlpha(1).setScale(image.scale)
        scene.tweens.add({ targets: image, alpha: 0, duration: ms, delay: 120 })
    }

    const onBeat = (beat: Beat) => {
        if (beat.hear) opts.sing(def.id)
        if (beat.hear) noteClock = NOTE_EVERY
        if (fig) {
            if (beat.see) showFig(beat)
            else hideFig()
        }
        if (crab) {
            scene.tweens.killTweensOf(crab)
            if (beat.see) {
                crab.setFrame(`c${THING_CELL.crabWalk}`)
                scene.tweens.add({ targets: crab, alpha: 1, y: def.y, duration: 240, ease: 'Back.easeOut' })
            } else scene.tweens.add({ targets: crab, alpha: 0, y: def.y + 40, duration: 220 })
        }
        if (dolphin && dive && splash) {
            scene.tweens.killTweensOf([dolphin, dive])
            if (beat.see) {
                const base = dolphin.scale
                dolphin.setPosition(def.x - 30, def.y + 50).setAlpha(1).setAngle(-6)
                scene.tweens.add({ targets: dolphin, x: def.x + 20, y: def.y - 20, angle: 4, duration: 1100, ease: 'Sine.easeOut' })
                dive.setAlpha(0)
                puff(splash, 420)
                scene.time.delayedCall(1150, () => {
                    if (!alive || !running) return
                    dolphin?.setAlpha(0).setScale(base)
                    dive?.setAlpha(1)
                    scene.tweens.add({ targets: dive, alpha: 0, y: def.y + 80, duration: 340, onComplete: () => dive?.setY(def.y + 50) })
                })
            } else {
                dolphin.setAlpha(0)
                puff(splash, 420)
            }
        }
        if (wave && splash) {
            scene.tweens.killTweensOf(wave)
            if (beat.see) {
                wave.setAlpha(1).setScale(wave.scaleX, wave.scaleX * 0.2)
                scene.tweens.add({ targets: wave, scaleY: wave.scaleX, duration: 360, ease: 'Back.easeOut' })
                scene.time.delayedCall(300, () => {
                    if (alive && running) puff(splash, 600)
                })
            } else scene.tweens.add({ targets: wave, alpha: 0, scaleY: wave.scaleX * 0.3, duration: 320 })
        }
    }

    const view: ThingView = {
        def,
        beat: () => (running ? beatAt(def, t) : { ms: 0, see: false, hear: false }),
        photoParts: () => parts,
        update(delta) {
            if (!running) return
            t += delta
            const index = beatIndexAt(def, t)
            if (index !== beatIndex) {
                beatIndex = index
                onBeat(def.cycle[index])
            }
            const beat = def.cycle[index]
            if (crab && beat.see) crab.x = def.x + Math.sin(t / 260) * 18
            moveFig(delta)
            if (beat.hear) {
                noteClock += delta
                if (noteClock >= NOTE_EVERY) {
                    noteClock = 0
                    emitNote()
                }
            }
        },
        react(tool) {
            if (crab && tool === 'photo') {
                crab.setFrame(`c${THING_CELL.crabScared}`)
                scene.time.delayedCall(700, () => {
                    if (alive) crab?.setFrame(`c${THING_CELL.crabWalk}`)
                })
            }
            if (splash && tool === 'sound') puff(splash, 500)
            if (fig && figShown && tool === 'photo') void FX.to(scene, fig, { angle: 8 }, { duration: 90, yoyo: true, repeat: 1 })
        },
        async enter() {
            t = 0
            beatIndex = -1
            running = true
            if (def.id !== 'rainbow' && def.id !== 'castle') return
            await Promise.all(parts.map(p => FX.popIn(scene, p, { from: 0.6, duration: 420 })))
        },
        async leave() {
            running = false
            notes.forEach(n => scene.tweens.add({ targets: n, alpha: 0, duration: 200 }))
            parts.forEach(p => scene.tweens.killTweensOf(p))
            await FX.to(scene, parts, { alpha: 0 }, { duration: 320 })
        },
        rect: () => ({ x: def.x, y: def.y, w: def.w, h: def.h }),
        destroy() {
            alive = false
            running = false
            parts.forEach(p => {
                scene.tweens.killTweensOf(p)
                p.destroy()
            })
            notes.forEach(n => {
                scene.tweens.killTweensOf(n)
                n.destroy()
            })
            notes.clear()
        },
    }
    return view
}
