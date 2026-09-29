import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { FISH_BODY_W, FISH_CELL, FISH_MARK, FISH_POSE, FISH_SHEET } from '../data/files'
import { BEAM, DEPTH, FISH, H, SCHOOL } from '../data/layout'
import { fishInBeam, maxX } from '../data/levels'
import { A, C, HUE } from '../data/theme'
import type { FishPose, LevelDef, Mark, Point } from '../types'
import { discPart } from './marks'

export interface FishView {
    readonly container: Phaser.GameObjects.Container
    readonly mark: Mark
    setLit(on: boolean): void
    setPose(pose: FishPose): void
    flap(): void
    mouth(): Point
    destroy(): void
}

export interface School {
    set(marks: Mark[]): void
    enter(): Promise<void>
    leave(): Promise<void>
    update(deltaMs: number): void
    setMoving(on: boolean): void
    lit(): number | null
    fish(index: number): FishView | undefined
    take(index: number): FishView | undefined
    waitLit(match: (fish: FishView) => boolean): Promise<FishView>
    readonly beamRect: { x: number; y: number; w: number; h: number }
    clear(): void
    destroy(): void
}

function paintBody(g: Phaser.GameObjects.Graphics, tailUp: boolean) {
    const tail = tailUp ? -1 : 1
    g.clear()
    g.lineStyle(5, C.ink, 1)
    g.fillStyle(C.fin, 1)
    g.fillTriangle(-62, 0, -100, -34 + tail * 8, -100, 34 + tail * 8)
    g.strokeTriangle(-62, 0, -100, -34 + tail * 8, -100, 34 + tail * 8)
    g.fillTriangle(-14, -40, 22, -40, -30, -62)
    g.strokeTriangle(-14, -40, 22, -40, -30, -62)
    g.fillStyle(C.fish, 1)
    g.fillEllipse(0, 0, 150, 100)
    g.strokeEllipse(0, 0, 150, 100)
    g.fillStyle(C.fishDark, 1)
    g.fillEllipse(6, 30, 104, 26)
    g.fillStyle(C.fish, 1)
    g.fillEllipse(0, 22, 128, 34)
}

function paintFace(g: Phaser.GameObjects.Graphics, pose: FishPose) {
    g.clear()
    g.fillStyle(C.coral, 0.8)
    g.fillEllipse(48, 14, 18, 10)
    if (pose === 'happy') {
        g.lineStyle(5, C.ink, 1)
        g.beginPath()
        g.arc(42, -10, 10, Math.PI * 1.1, Math.PI * 1.9)
        g.strokePath()
        g.beginPath()
        g.arc(66, 6, 7, 0.1 * Math.PI, 0.9 * Math.PI)
        g.strokePath()
        return
    }
    if (pose === 'yuck') {
        g.lineStyle(5, C.ink, 1)
        g.lineBetween(32, -20, 50, -12)
        g.lineBetween(32, -4, 50, -12)
        g.fillStyle(C.coral, 1)
        g.fillEllipse(72, 14, 14, 20)
        g.lineStyle(3, C.ink, 1)
        g.strokeEllipse(72, 14, 14, 20)
        g.lineStyle(5, C.ink, 1)
        g.lineBetween(62, 6, 76, 6)
        return
    }
    const wide = pose === 'hooked'
    g.fillStyle(C.white, 1)
    g.fillCircle(42, -10, wide ? 17 : 15)
    g.lineStyle(4, C.ink, 1)
    g.strokeCircle(42, -10, wide ? 17 : 15)
    g.fillStyle(C.ink, 1)
    g.fillCircle(46, -10, wide ? 7 : 9)
    g.fillStyle(C.white, 1)
    g.fillCircle(49, -14, 3.5)
    g.lineStyle(4, C.ink, 1)
    if (wide) {
        g.strokeCircle(70, 6, 5)
    } else {
        g.beginPath()
        g.arc(64, 4, 7, 0.15 * Math.PI, 0.8 * Math.PI)
        g.strokePath()
    }
}

function createFish(scene: Phaser.Scene, mark: Mark): FishView {
    const hasArt = scene.textures.exists(FISH_SHEET)
    const scale = FISH.w / FISH_BODY_W

    const aura = scene.add.graphics().setVisible(false)
    aura.fillStyle(C.glow, 0.55)
    aura.fillCircle(0, 0, FISH.aura)
    aura.lineStyle(5, C.white, 0.9)
    aura.strokeCircle(0, 0, FISH.aura)

    const pose = scene.add.container(0, 0)
    let image: Phaser.GameObjects.Image | undefined
    let body: Phaser.GameObjects.Graphics | undefined
    let face: Phaser.GameObjects.Graphics | undefined
    if (hasArt) {
        image = scene.add.image(0, 0, FISH_SHEET, FISH_CELL.swimA).setScale(scale)
        pose.add(image)
    } else {
        body = scene.add.graphics()
        paintBody(body, true)
        face = scene.add.graphics()
        paintFace(face, 'swim')
        pose.add([body, face])
    }

    const disc = discPart(scene, FISH.mark, mark.kind === 'hue' ? HUE[mark.hue] : C.white)
    pose.add(disc)
    const showFrame = (frame: number) => {
        if (!image) {
            disc.setPosition(-8, 14)
            return
        }
        image.setFrame(frame)
        const spot = FISH_MARK[frame]
        disc.setPosition((spot.x - 192) * scale, (spot.y - 192) * scale)
    }
    showFrame(FISH_CELL.swimA)

    const container = scene.add.container(0, SCHOOL.y, [aura, pose]).setDepth(DEPTH.school)
    let current: FishPose = 'swim'
    let tailUp = true
    let lit = false

    const turned = () => !hasArt && (current === 'hooked' || current === 'yuck')

    return {
        container,
        mark,
        setLit(on) {
            if (on === lit) return
            lit = on
            aura.setVisible(on)
            if (on) {
                aura.setScale(0.6).setAlpha(0)
                scene.tweens.add({ targets: aura, scale: 1, alpha: 1, duration: 180, ease: 'Back.easeOut' })
            }
        },
        setPose(p) {
            current = p
            showFrame(FISH_POSE[p])
            if (face) paintFace(face, p)
            if (body) paintBody(body, true)
            pose.setRotation(turned() ? -Math.PI / 2 : 0)
        },
        flap() {
            if (current !== 'swim') return
            tailUp = !tailUp
            if (image) showFrame(tailUp ? FISH_CELL.swimA : FISH_CELL.swimB)
            if (body) paintBody(body, tailUp)
        },
        mouth() {
            if (current === 'swim') return { x: container.x + FISH.mouthX, y: container.y }
            return { x: container.x, y: container.y - FISH.mouthX }
        },
        destroy() {
            scene.tweens.killTweensOf([container, aura, pose])
            container.destroy()
        },
    }
}

export function createSchool(scene: Phaser.Scene, level: LevelDef): School {
    const beamHalf = level.beam / 2
    const right = maxX(level)
    const loop = level.spacing * level.schoolSize

    const beam = scene.add.graphics().setDepth(DEPTH.beam)
    let beamLit = false
    const paintBeam = () => {
        beam.clear()
        const alpha = beamLit ? A.beamLit : A.beam
        const topHalf = beamHalf - BEAM.spread
        beam.fillStyle(C.beam, alpha)
        beam.beginPath()
        beam.moveTo(BEAM.x - topHalf, BEAM.top)
        beam.lineTo(BEAM.x + topHalf, BEAM.top)
        beam.lineTo(BEAM.x + beamHalf, BEAM.bottom)
        beam.lineTo(BEAM.x - beamHalf, BEAM.bottom)
        beam.closePath()
        beam.fillPath()
        beam.fillStyle(C.beam, alpha * 0.8)
        beam.fillEllipse(BEAM.x, SCHOOL.y, beamHalf * 2, 70)
    }
    paintBeam()

    let fishes: (FishView | null)[] = []
    let xs: (number | null)[] = []
    let moving = false
    let entering = false
    let clock = 0
    let flapClock = 0
    let litIndex: number | null = null
    let waiter: { match: (fish: FishView) => boolean; resolve: (fish: FishView) => void } | undefined

    const place = () => {
        fishes.forEach((fish, i) => {
            const x = xs[i]
            if (!fish || x === null) return
            fish.container.x = x
            fish.container.y = SCHOOL.y + Math.sin(clock / 520 + i * 1.7) * SCHOOL.bob
        })
    }

    const refreshLit = () => {
        const index = entering ? null : fishInBeam(xs, BEAM.x, level.beam)
        if (index !== litIndex) {
            if (litIndex !== null) fishes[litIndex]?.setLit(false)
            litIndex = index
            if (index !== null) fishes[index]?.setLit(true)
            beamLit = index !== null
            paintBeam()
        }
        if (waiter && index !== null) {
            const fish = fishes[index]
            if (fish && waiter.match(fish)) {
                const done = waiter.resolve
                waiter = undefined
                done(fish)
            }
        }
    }

    const clear = () => {
        waiter = undefined
        fishes.forEach(fish => fish?.destroy())
        fishes = []
        xs = []
        litIndex = null
        beamLit = false
        paintBeam()
    }

    return {
        set(marks) {
            clear()
            const firstX = BEAM.x - beamHalf - SCHOOL.firstGap
            fishes = marks.map(mark => createFish(scene, mark))
            xs = marks.map((_, i) => firstX - i * level.spacing)
            place()
        },
        async enter() {
            entering = true
            const targets = fishes.flatMap((fish, i) => {
                const x = xs[i]
                if (!fish || x === null) return []
                fish.container.x = x - SCHOOL.enterFrom
                fish.container.setAlpha(0)
                return [FX.to(scene, fish.container, { x, alpha: 1 }, { duration: SCHOOL.enterMs, ease: 'Sine.easeOut' })]
            })
            await Promise.all(targets)
            entering = false
        },
        async leave() {
            moving = false
            entering = true
            refreshLit()
            await Promise.all(
                fishes.map(fish =>
                    fish
                        ? FX.to(scene, fish.container, { x: fish.container.x + SCHOOL.leaveBy, alpha: 0 }, { duration: SCHOOL.leaveMs, ease: 'Sine.easeIn' })
                        : Promise.resolve(),
                ),
            )
            entering = false
            clear()
        },
        update(deltaMs) {
            if (entering) return
            clock += deltaMs
            if (moving) {
                const step = (level.speed * deltaMs) / 1000
                xs = xs.map(x => {
                    if (x === null) return null
                    const next = x + step
                    return next > right ? next - loop : next
                })
                flapClock += deltaMs
                if (flapClock >= SCHOOL.flapMs) {
                    flapClock = 0
                    fishes.forEach(fish => fish?.flap())
                }
            }
            place()
            refreshLit()
        },
        setMoving(on) {
            moving = on
        },
        lit() {
            return litIndex
        },
        fish(index) {
            return fishes[index] ?? undefined
        },
        take(index) {
            const fish = fishes[index]
            if (!fish) return undefined
            fishes[index] = null
            xs[index] = null
            if (litIndex === index) {
                litIndex = null
                beamLit = false
                paintBeam()
            }
            fish.setLit(false)
            return fish
        },
        waitLit(match) {
            return new Promise(resolve => {
                waiter = { match, resolve }
            })
        },
        beamRect: { x: BEAM.x, y: (BEAM.top + H) / 2, w: level.beam + 40, h: H - BEAM.top },
        clear,
        destroy() {
            clear()
            beam.destroy()
        },
    }
}
