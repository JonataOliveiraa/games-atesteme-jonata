import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BG, DOORWAY, DOOR_CELL, DOOR_SHEET, FAR_LIT, FAR_OFF, PIECE, cellKey } from '../data/files'
import { DEPTH, DOOR, DOOR_X, FAR, FAR_SQUEEZE, FLOOR, H, PERSON, PERSON_SCALE, SHOT, W, type Shot } from '../data/layout'
import { PLATE } from '../data/requests'
import { C, CSS, FONT } from '../data/theme'
import type { DoorId, InfoId, PersonPose } from '../types'
import { infoImage, personImage, pieceImage, setPersonPose, tall } from './art'
import { trail } from './trail'

type Point = { x: number; y: number }

export interface Door {
    readonly id: DoorId
    knock(): Promise<void>
    open(pose?: PersonPose): Promise<void>
    close(ms?: number): Promise<void>
    pose(p: PersonPose): void
    /** recebeu: pula e solta coraçõezinhos */
    cheer(): Promise<void>
    /** ficou sem: murcha e balança a cabeça */
    mourn(): Promise<void>
    /** o desconhecido levanta o celular para passar adiante */
    boast(): Promise<void>
    /** no fim do nível, a porta que recebeu algo dá um pulinho */
    shine(): Promise<boolean>
    /** a informação fica na porta de quem recebeu */
    receive(info: InfoId): void
    /** o peito de quem está na porta, em coordenadas do mundo */
    chest(): Point
    head(): Point
    clear(): void
}

/**
 * O corredor dentro do tablet. Tudo o que é do mundo fica num container, e o
 * "zoom" é a escala dele: os botões e o balão ficam fora, fixos na tela.
 */
export interface Hall {
    readonly doors: Record<DoorId, Door>
    /** escurece o corredor e deixa acesa só a porta que importa (e as portinhas, no erro) */
    focus(id: DoorId | null, far?: boolean): Promise<void>
    frame(to: Shot, ms?: number): Promise<void>
    jump(to: Shot): void
    readonly shot: Shot
    toScreen(p: Point): Point
    doorShot(id: DoorId): Shot
    /** a porta na tela, depois do zoom */
    doorScreen(id: DoorId): { x: number; top: number; bottom: number; half: number }
    /** a fileira de portas na tela, no plano atual */
    rowRect(): { x: number; y: number; w: number; h: number }
    /** a porta do desconhecido e as portinhas do fundo, na tela */
    farRect(): { x: number; y: number; w: number; h: number }
    /** as portinhas já acesas com a informação (o "ontem" do N3) */
    lightFar(info: InfoId): void
    /** as portinhas acesas dão um pulinho */
    pulseFar(): Promise<void>
    /** cópias voam de uma porta até as portinhas do fundo, que acendem */
    spread(from: DoorId, info: InfoId): Promise<void>
    add(obj: Phaser.GameObjects.GameObject): void
    setAlpha(a: number): void
    reset(): void
    destroy(): void
}

const COPY_MS = 520
const COPY_GAP = 170
const FAR_DIM = 0.6
const FOCUS_DIM = 0.6

export function createHall(scene: Phaser.Scene): Hall {
    const root = scene.add.container(0, 0).setDepth(DEPTH.world)
    root.add(scene.add.image(W / 2, H / 2, BG).setDisplaySize(W, H))

    const far = FAR.map(f => {
        const img = tall(scene, DOOR_SHEET, FAR_OFF, f.h).setPosition(f.x, f.floor).setAlpha(FAR_DIM)
        img.scaleX *= FAR_SQUEEZE
        root.add(img)
        return { ...f, img, mark: undefined as Phaser.GameObjects.Image | undefined }
    })

    const boxes = {} as Record<DoorId, Phaser.GameObjects.Container>
    const makeDoor = (id: DoorId): Door => {
        const doorway = tall(scene, DOOR_SHEET, DOORWAY, DOOR.h)
        const glow = scene.add.ellipse(0, -DOOR.h * 0.46, DOOR.half * 1.5, DOOR.h * 0.88, C.glow, 0)
        const leaf = tall(scene, DOOR_SHEET, DOOR_CELL[id], DOOR.h)
        const half = leaf.displayWidth / 2
        leaf.setOrigin(0, 1).setX(-half)
        const s = leaf.scaleX
        const person = personImage(scene, id, 'ask', PERSON.h * (PERSON_SCALE[id] ?? 1)).setY(-PERSON.dy).setVisible(false)
        const ps = person.scaleX
        const plate = scene.add
            .text(0, -DOOR.plateDy, PLATE[id], { fontFamily: FONT.black, fontSize: '18px', color: CSS.ink })
            .setOrigin(0.5)
            .setResolution(2)
        if (plate.width > 74) plate.setScale(74 / plate.width)
        const badges = scene.add.container(0, -DOOR.badgeDy)
        const face = [plate, badges]
        const box = scene.add.container(DOOR_X[id], FLOOR, [doorway, glow, person, leaf, plate, badges])
        root.add(box)
        boxes[id] = box
        let opened = false
        let breathe: Phaser.Tweens.Tween | undefined

        const still = () => {
            breathe?.remove()
            breathe = undefined
            person.setScale(ps).setAngle(0).setY(-PERSON.dy)
        }
        const idle = () => {
            still()
            breathe = scene.tweens.add({ targets: person, scaleY: ps * 1.025, duration: FX.ms(scene, 850), yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
        }

        return {
            id,
            async knock() {
                for (let k = 0; k < 3; k++) {
                    const marks = pieceImage(scene, PIECE.knock, 52)
                        .setPosition(half + 22, -DOOR.h * (0.66 - k * 0.09))
                        .setAngle(-12 + k * 12)
                    box.add(marks)
                    void FX.popIn(scene, marks, { from: 0.2, duration: 140 })
                    scene.tweens.add({ targets: marks, alpha: 0, x: marks.x + 16, duration: FX.ms(scene, 320), delay: FX.ms(scene, 300), onComplete: () => marks.destroy() })
                    await FX.to(scene, leaf, { scaleX: s * 0.95 }, { duration: 55, yoyo: true, ease: 'Quad.easeOut' })
                    await FX.wait(scene, 50)
                }
            },
            async open(pose = 'ask') {
                setPersonPose(person, id, pose)
                still()
                opened = true
                person.setVisible(true).setAlpha(0).setScale(ps * 0.88).setY(-PERSON.dy + 26)
                face.forEach(f => void FX.to(scene, f, { alpha: 0 }, { duration: 120 }))
                void FX.to(scene, glow, { fillAlpha: 0.5 }, { duration: 320 })
                await FX.to(scene, leaf, { scaleX: s * 0.08 }, { duration: 380, ease: 'Cubic.easeOut' })
                await FX.to(scene, person, { alpha: 1, scale: ps, y: -PERSON.dy }, { duration: 320, ease: 'Back.easeOut' })
                idle()
            },
            async close(ms = 320) {
                if (!opened) return
                still()
                void FX.to(scene, person, { alpha: 0, y: -PERSON.dy + 12 }, { duration: ms * 0.7 })
                void FX.to(scene, glow, { fillAlpha: 0 }, { duration: ms })
                await FX.to(scene, leaf, { scaleX: s }, { duration: ms, ease: 'Cubic.easeIn' })
                opened = false
                person.setVisible(false).setAlpha(1)
                void FX.to(scene, box, { scaleY: 0.97 }, { duration: 70, yoyo: true })
                face.forEach(f => void FX.to(scene, f, { alpha: 1 }, { duration: 200 }))
            },
            pose(p) {
                setPersonPose(person, id, p)
            },
            async cheer() {
                still()
                setPersonPose(person, id, 'happy')
                for (let k = 0; k < 3; k++) {
                    const heart = pieceImage(scene, PIECE.heart, 34).setPosition(0, -PERSON.h * 0.9)
                    box.add(heart)
                    const dx = (k - 1) * 46
                    scene.tweens.add({
                        targets: heart,
                        x: dx,
                        y: -PERSON.h * 0.9 - 70 - (k % 2) * 24,
                        alpha: { from: 1, to: 0 },
                        scale: { from: heart.scale * 0.4, to: heart.scale * 1.2 },
                        duration: FX.ms(scene, 900),
                        delay: FX.ms(scene, k * 110),
                        ease: 'Sine.easeOut',
                        onComplete: () => heart.destroy(),
                    })
                }
                await FX.to(scene, person, { y: -PERSON.dy - 24 }, { duration: 170, yoyo: true, repeat: 1, ease: 'Sine.easeOut' })
                idle()
            },
            async mourn() {
                still()
                setPersonPose(person, id, 'sad')
                await FX.to(scene, person, { scaleY: ps * 0.95 }, { duration: 260, ease: 'Sine.easeOut' })
                await FX.to(scene, person, { angle: -4 }, { duration: 200, yoyo: true, repeat: 1, ease: 'Sine.easeInOut' })
            },
            async boast() {
                still()
                setPersonPose(person, id, 'sad')
                await FX.to(scene, person, { y: -PERSON.dy - 16 }, { duration: 160, yoyo: true, ease: 'Sine.easeOut' })
            },
            receive(info) {
                const icon = infoImage(scene, info, DOOR.badge)
                const ring = scene.add.circle(0, 0, DOOR.badge / 2 + 6, C.white).setStrokeStyle(3, C.ink)
                const badge = scene.add.container(0, 0, [ring, icon])
                badges.add(badge)
                const n = badges.length
                ;(badges.list as Phaser.GameObjects.Container[]).forEach((b, i) => b.setX((i - (n - 1) / 2) * DOOR.badgeGap))
                if (!opened) void FX.popIn(scene, badge, { from: 0.3, duration: 300 })
            },
            async shine() {
                if (!badges.length) return false
                void FX.to(scene, box, { scaleY: 1.04 }, { duration: 160, yoyo: true, ease: 'Sine.easeOut' })
                await FX.to(scene, badges, { scale: 1.3 }, { duration: 200, yoyo: true, ease: 'Back.easeOut' })
                return true
            },
            chest() {
                return { x: DOOR_X[id], y: FLOOR - PERSON.h * 0.42 }
            },
            head() {
                return { x: DOOR_X[id], y: FLOOR - PERSON.h * 0.82 }
            },
            clear() {
                still()
                badges.removeAll(true)
                leaf.scaleX = s
                glow.setFillStyle(C.glow, 0)
                opened = false
                person.setVisible(false).setAlpha(1)
                face.forEach(f => f.setAlpha(1))
            },
        }
    }

    const doors = {
        grandma: makeDoor('grandma'),
        class: makeDoor('class'),
        davi: makeDoor('davi'),
        school: makeDoor('school'),
        stranger: makeDoor('stranger'),
    } satisfies Record<DoorId, Door>

    const veil = scene.add.rectangle(W / 2, H / 2, W + 40, H + 40, C.shadow, 0)
    root.add(veil)

    let shot: Shot = { x: W / 2, y: H / 2, zoom: 1 }

    const clamp = (to: Shot): Shot => {
        const hw = W / 2 / to.zoom
        const hh = H / 2 / to.zoom
        return { zoom: to.zoom, x: Phaser.Math.Clamp(to.x, hw, W - hw), y: Phaser.Math.Clamp(to.y, hh, H - hh) }
    }
    const apply = (v: Shot) => {
        root.setScale(v.zoom)
        root.setPosition(W / 2 - v.x * v.zoom, H / 2 - v.y * v.zoom)
    }

    const toScreen = (p: Point) => ({ x: root.x + p.x * root.scaleX, y: root.y + p.y * root.scaleY })

    return {
        doors,
        get shot() {
            return shot
        },
        jump(to) {
            shot = clamp(to)
            apply(shot)
        },
        frame(to, ms = 650) {
            const from = { ...shot }
            const end = clamp(to)
            shot = end
            const k = { t: 0 }
            return new Promise(resolve => {
                scene.tweens.add({
                    targets: k,
                    t: 1,
                    duration: FX.ms(scene, ms),
                    ease: 'Sine.easeInOut',
                    onUpdate: () =>
                        apply({
                            zoom: Phaser.Math.Linear(from.zoom, end.zoom, k.t),
                            x: Phaser.Math.Linear(from.x, end.x, k.t),
                            y: Phaser.Math.Linear(from.y, end.y, k.t),
                        }),
                    onComplete: () => resolve(),
                    onStop: () => resolve(),
                })
            })
        },
        toScreen,
        doorShot(id) {
            return clamp({ x: DOOR_X[id] + SHOT.door.dx, y: SHOT.door.y, zoom: SHOT.door.zoom })
        },
        doorScreen(id) {
            const v = clamp({ x: DOOR_X[id] + SHOT.door.dx, y: SHOT.door.y, zoom: SHOT.door.zoom })
            const at = (x: number, y: number) => ({ x: W / 2 + (x - v.x) * v.zoom, y: H / 2 + (y - v.y) * v.zoom })
            const top = at(DOOR_X[id], FLOOR - DOOR.h)
            const bottom = at(DOOR_X[id], FLOOR)
            return { x: top.x, top: top.y, bottom: bottom.y, half: DOOR.half * v.zoom }
        },
        farRect() {
            const a = toScreen({ x: DOOR_X.stranger - DOOR.half - 10, y: FLOOR - DOOR.h - 10 })
            const b = toScreen({ x: W - 6, y: FLOOR + 6 })
            return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, w: b.x - a.x, h: b.y - a.y }
        },
        lightFar(info) {
            far.forEach(f => {
                f.img.setFrame(cellKey(FAR_LIT)).setAlpha(1)
                f.mark?.destroy()
                const mark = infoImage(scene, info, 34)
                mark.setScale(mark.scaleX * (f.h / 120)).setPosition(f.x, f.floor - f.h * 0.62)
                root.add(mark)
                f.mark = mark
            })
        },
        async pulseFar() {
            await FX.all(
                ...far.map(
                    (f, i) =>
                        new Promise<void>(resolve =>
                            scene.tweens.add({
                                targets: [f.img, f.mark].filter(Boolean),
                                y: '-=14',
                                duration: FX.ms(scene, 160),
                                delay: FX.ms(scene, i * 90),
                                yoyo: true,
                                ease: 'Sine.easeOut',
                                onComplete: () => resolve(),
                                onStop: () => resolve(),
                            }),
                        ),
                ),
            )
        },
        rowRect() {
            const a = toScreen({ x: DOOR_X.grandma - DOOR.half - 10, y: FLOOR - DOOR.h - 10 })
            const b = toScreen({ x: DOOR_X.stranger + DOOR.half + 10, y: FLOOR + 2 })
            return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, w: b.x - a.x, h: b.y - a.y }
        },
        async spread(from, info) {
            const start = doors[from].chest()
            await Promise.all(
                far.map(
                    (f, i) =>
                        new Promise<void>(resolve => {
                            const copy = infoImage(scene, info, 34).setPosition(start.x, start.y).setVisible(false)
                            root.add(copy)
                            let stop: (() => void) | undefined
                            const to = { x: f.x, y: f.floor - f.h * 0.62 }
                            const k = { t: 0 }
                            scene.tweens.add({
                                targets: k,
                                t: 1,
                                delay: FX.ms(scene, i * COPY_GAP),
                                duration: FX.ms(scene, COPY_MS),
                                ease: 'Sine.easeInOut',
                                onStart: () => {
                                    copy.setVisible(true)
                                    stop = trail(scene, copy, C.glow, dot => root.add(dot))
                                },
                                onUpdate: () =>
                                    copy
                                        .setPosition(
                                            Phaser.Math.Linear(start.x, to.x, k.t),
                                            Phaser.Math.Linear(start.y, to.y, k.t) - Math.sin(k.t * Math.PI) * 70,
                                        )
                                        .setAngle(Math.sin(k.t * Math.PI * 2) * 12),
                                onComplete: () => {
                                    stop?.()
                                    copy.setAngle(0)
                                    const sx = f.img.scaleX
                                    const sy = f.img.scaleY
                                    f.img.setFrame(cellKey(FAR_LIT)).setAlpha(1)
                                    void FX.to(scene, f.img, { scaleX: sx * 1.14, scaleY: sy * 1.14 }, { duration: 140, yoyo: true, ease: 'Sine.easeOut' })
                                    copy.setScale(copy.scaleX * (f.h / 120))
                                    f.mark = copy
                                    void FX.ping(scene, toScreen(to).x, toScreen(to).y, C.glow, { radius: 40, duration: 380, depth: DEPTH.fx })
                                    resolve()
                                },
                                onStop: () => {
                                    stop?.()
                                    resolve()
                                },
                            })
                        }),
                ),
            )
        },
        async focus(id, withFar = false) {
            if (!id) {
                await FX.to(scene, veil, { fillAlpha: 0 }, { duration: 300 })
                return
            }
            root.bringToTop(veil)
            if (withFar) far.forEach(f => root.bringToTop(f.img))
            root.bringToTop(boxes[id])
            await FX.to(scene, veil, { fillAlpha: FOCUS_DIM }, { duration: 320 })
        },
        add(obj) {
            root.add(obj)
        },
        setAlpha(a) {
            root.setAlpha(a)
        },
        reset() {
            Object.values(doors).forEach(d => d.clear())
            far.forEach(f => {
                f.img.setFrame(cellKey(FAR_OFF)).setAlpha(FAR_DIM)
                f.mark?.destroy()
                f.mark = undefined
            })
        },
        destroy() {
            root.destroy()
        },
    }
}
