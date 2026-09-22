import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, HERO_FRAME, PHYS, WORLD } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import { boxOf, cutSheet, fitFrame } from './sheet'
import type { Item, Solid } from '../types'

export interface HeroInput {
    left: boolean
    right: boolean
    jump: boolean
}

export interface HeroCallbacks {
    onStep: () => void
    onJump: () => void
    onLand: () => void
}

export function createMensageiro(scene: Phaser.Scene, callbacks: HeroCallbacks) {
    const sheet = cutSheet(scene, 'menino', 4, 2)

    const tallest = sheet ? Math.max(...sheet.boxes.map(box => box.height)) : 1
    const scale = sheet ? PHYS.heroH / (tallest * sheet.frameH) : 1

    const shadow = scene.add.graphics().setDepth(DEPTH.shadow)
    const body = sheet
        ? scene.add
              .image(0, 0, 'menino', '0')
              .setOrigin(0.5, 1)
              .setDisplaySize(sheet.frameW * scale, sheet.frameH * scale)
              .setDepth(DEPTH.hero)
        : null
    const reserve = sheet ? null : scene.add.graphics().setDepth(DEPTH.hero)

    let held: Phaser.GameObjects.Image | Phaser.GameObjects.Graphics | null = null
    let heldItem: Item | null = null
    let heldOffsetX = 0
    let heldOffsetY = 0
    let heldInUse = false

    let x = WORLD.startX
    let y = WORLD.groundY
    let vy = 0
    let onGround = true
    let coyote = 0
    let facing = 1
    let frozen = false
    let pose: number | null = null
    let frame = HERO_FRAME.idle
    let walkTime = 0
    let stepFlip = 0
    let minX = 60
    let maxX = WORLD.width - 60

    const paintReserve = () => {
        if (!reserve) return
        const h = PHYS.heroH
        const w = PHYS.heroHalfW * 2
        reserve.clear()
        reserve.fillStyle(C.terracota, 1)
        reserve.fillRoundedRect(x - w / 2, y - h, w, h * 0.6, 16)
        reserve.fillStyle(C.ink, 1)
        reserve.fillCircle(x, y - h + 8, w * 0.42)
        const spread = frame === HERO_FRAME.jump ? 16 : (frame % 2) * 14
        reserve.fillStyle(C.inkSoft, 1)
        reserve.fillRoundedRect(x - 18 - spread / 2, y - h * 0.4, 15, h * 0.4, 7)
        reserve.fillRoundedRect(x + 3 + spread / 2, y - h * 0.4, 15, h * 0.4, 7)
    }

    const placeHeld = () => {
        if (!held) return
        const raised = frame === HERO_FRAME.carry
        held.setVisible((heldItem?.naMao ?? true) && (raised || heldInUse))
        const lift = heldInUse ? PHYS.heroH * 0.56 : PHYS.heroH + 2
        const side = heldInUse ? 34 : 26
        const flip = facing < 0
        if ('setFlipX' in held) held.setFlipX(flip)
        held.setPosition(
            x - facing * side + (flip ? -heldOffsetX : heldOffsetX),
            y - lift + heldOffsetY,
        )
    }

    const place = () => {
        if (body && sheet) {
            const box = boxOf(sheet, frame)
            const shift = (box.left + box.width / 2 - 0.5) * sheet.frameW * scale
            body.setPosition(x - facing * shift, y + (1 - box.bottom) * sheet.frameH * scale)
            body.setFlipX(facing < 0)
        } else {
            paintReserve()
        }
        placeHeld()
    }

    const setFrame = (next: number) => {
        if (frame === next) return
        frame = next
        if (body) body.setFrame(String(next))
    }

    const groundBelow = (solids: Solid[]) => {
        let best = WORLD.groundY
        solids.forEach(solid => {
            if (x < solid.x || x > solid.x + solid.w) return
            if (solid.y < y - 2) return
            best = Math.min(best, solid.y)
        })
        return best
    }

    const paintShadow = (solids: Solid[]) => {
        const floor = groundBelow(solids)
        const air = Phaser.Math.Clamp((floor - y) / 200, 0, 1)
        shadow.clear()
        shadow.fillStyle(C.ink, 0.24 * (1 - air * 0.6))
        shadow.fillEllipse(x, floor + 3, 74 * (1 - air * 0.4), 20 * (1 - air * 0.4))
    }

    return {
        get x() {
            return x
        },
        get y() {
            return y
        },
        get facing() {
            return facing
        },
        get onGround() {
            return onGround
        },
        get carrying() {
            return heldItem
        },

        spawn(atX: number, bounds: { min: number; max: number }) {
            x = atX
            y = WORLD.groundY
            vy = 0
            onGround = true
            coyote = 0
            facing = -1
            pose = null
            minX = bounds.min
            maxX = bounds.max
            setFrame(HERO_FRAME.idle)
            place()
            shadow.clear()
        },

        setFrozen(value: boolean) {
            frozen = value
        },

        setPose(next: number | null) {
            pose = next
            if (next !== null) {
                setFrame(next)
                place()
            }
        },

        faceTo(dir: number) {
            facing = dir >= 0 ? 1 : -1
            place()
        },

        carry(item: Item | null) {
            heldItem = item
            heldInUse = false
            held?.destroy()
            held = null
            if (!item) return

            heldOffsetX = 0
            heldOffsetY = 0
            const folha = cutSheet(scene, item.sheet, item.cols, item.rows)

            if (folha) {
                const fit = fitFrame(folha, item.coluna, 84, 84)
                heldOffsetX = fit.offsetX
                heldOffsetY = fit.offsetY
                held = scene.add
                    .image(0, 0, item.sheet, String(item.coluna))
                    .setOrigin(0.5, 0.5)
                    .setDisplaySize(fit.width, fit.height)
                    .setDepth(DEPTH.carried)
            } else {
                const g = scene.add.graphics().setDepth(DEPTH.carried)
                g.fillStyle(item.cor, 1)
                g.fillRoundedRect(-32, -24, 64, 48, 10)
                held = g
            }
            placeHeld()
        },

        /** Troca o desenho da invenção para o quadro "em uso" da folha. */
        useCarried(on: boolean) {
            heldInUse = on
            const folha = heldItem ? cutSheet(scene, heldItem.sheet, heldItem.cols, heldItem.rows) : null
            if (!heldItem || !folha || !held || !('setFrame' in held)) {
                placeHeld()
                return
            }
            const frameIndex = on ? folha.cols + heldItem.coluna : heldItem.coluna
            const fit = fitFrame(folha, frameIndex, 84, 84)
            heldOffsetX = fit.offsetX
            heldOffsetY = fit.offsetY
            held.setFrame(String(frameIndex))
            held.setDisplaySize(fit.width, fit.height)
            placeHeld()
        },

        /** O "e agora?" dele: a mesma marca que a pessoa usa, do lado de cá. */
        async worry() {
            const topo = y - PHYS.heroH - 6
            const mark = scene.add
                .text(x + 26, topo + 18, '!', {
                    fontFamily: FONT.black,
                    fontSize: '54px',
                    color: CSS.warn,
                })
                .setOrigin(0.5)
                .setResolution(2)
                .setDepth(DEPTH.balloon)
            mark.setStroke(CSS.white, 8)
            mark.setAlpha(0)
            await FX.to(scene, mark, { alpha: 1, y: topo - 30 }, { duration: 300, ease: 'Back.easeOut' })
            await FX.wait(scene, 620)
            await FX.to(scene, mark, { alpha: 0, y: topo - 56 }, { duration: 260 })
            mark.destroy()
        },

        handPoint() {
            return { x: x - facing * 34, y: y - PHYS.heroH * 0.52 }
        },

        update(dt: number, input: HeroInput, solids: Solid[], onSurface?: (from: number, to: number) => void) {
            if (frozen) {
                place()
                paintShadow(solids)
                return
            }

            const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0)
            if (dir !== 0) facing = dir

            if (input.jump && (onGround || coyote > 0)) {
                vy = -PHYS.jump
                onGround = false
                coyote = 0
                callbacks.onJump()
            }

            vy = Math.min(vy + PHYS.gravity * dt, PHYS.maxFall)

            const fromX = x
            let previousY = y
            let nextX = Phaser.Math.Clamp(x + dir * PHYS.speed * dt, minX, maxX)

            if (dir !== 0) {
                solids.forEach(solid => {
                    if (y <= solid.y + 1) return
                    const leftEdge = solid.x - PHYS.heroHalfW
                    const rightEdge = solid.x + solid.w + PHYS.heroHalfW
                    if (nextX <= leftEdge || nextX >= rightEdge) return

                    if (onGround && y - solid.y <= PHYS.stepUp) {
                        y = solid.y
                        previousY = solid.y - 1
                        vy = 0
                        return
                    }
                    nextX = fromX <= solid.x + solid.w / 2 ? leftEdge : rightEdge
                })
            }

            x = nextX

            const nextY = y + vy * dt
            const wasOnGround = onGround
            onGround = false
            let landedAt = Number.POSITIVE_INFINITY

            if (vy >= 0) {
                if (previousY <= WORLD.groundY && nextY >= WORLD.groundY) landedAt = WORLD.groundY
                solids.forEach(solid => {
                    if (x < solid.x || x > solid.x + solid.w) return
                    if (previousY > solid.y + 2) return
                    if (nextY < solid.y) return
                    landedAt = Math.min(landedAt, solid.y)
                })
            }

            if (landedAt < Number.POSITIVE_INFINITY) {
                onGround = true
                y = landedAt
                vy = 0
                if (!wasOnGround) callbacks.onLand()
            } else {
                y = nextY
            }

            coyote = onGround ? PHYS.coyoteMs : Math.max(0, coyote - dt * 1000)

            if (pose === null) {
                if (!onGround) {
                    setFrame(HERO_FRAME.jump)
                    walkTime = 0
                } else if (dir !== 0) {
                    walkTime += dt * 7
                    const index = Math.floor(walkTime) % HERO_FRAME.walk.length
                    setFrame(HERO_FRAME.walk[index])
                    const flip = index % 2
                    if (flip !== stepFlip) {
                        stepFlip = flip
                        callbacks.onStep()
                    }
                } else {
                    setFrame(heldItem ? HERO_FRAME.carry : HERO_FRAME.idle)
                    walkTime = 0
                }
            }

            place()
            paintShadow(solids)
            if (onSurface && fromX !== x) onSurface(fromX, x)
        },

        setVisible(value: boolean) {
            body?.setVisible(value)
            reserve?.setVisible(value)
            shadow.setVisible(value)
            held?.setVisible(value)
        },

        destroy() {
            if (body) scene.tweens.killTweensOf(body)
            body?.destroy()
            reserve?.destroy()
            held?.destroy()
            shadow.destroy()
        },
    }
}

export type Mensageiro = ReturnType<typeof createMensageiro>
