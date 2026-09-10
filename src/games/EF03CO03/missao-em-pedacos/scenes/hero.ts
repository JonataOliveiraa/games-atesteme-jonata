import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, HERO_ART, PHYS, WORLD } from '../data/layout'
import { C } from '../data/theme'
import type { Solid } from '../types'

export interface HeroInput {
    left: boolean
    right: boolean
    jump: boolean
}

export interface HeroCallbacks {
    onStep: () => void
    onJump: () => void
    onLand: () => void
    onFall: () => void
}

const RUN_FRAMES = [1, 2, 3, 4]

export function createHero(scene: Phaser.Scene, callbacks: HeroCallbacks) {
    const shadow = scene.add.graphics().setDepth(DEPTH.shadow)
    const hasArt = scene.textures.exists('heroi')

    const body = hasArt
        ? scene.add
              .image(0, 0, 'heroi', 0)
              .setOrigin(0.5, HERO_ART.feet)
              .setDisplaySize(
                  (HERO_ART.display * HERO_ART.frameW) / HERO_ART.frameH,
                  HERO_ART.display,
              )
              .setDepth(DEPTH.hero)
        : null

    const reserve = hasArt ? null : scene.add.graphics().setDepth(DEPTH.hero)

    let x = WORLD.startX
    let y = WORLD.groundY
    let vy = 0
    let onGround = true
    let coyote = 0
    let frozen = false
    let runTime = 0
    let stepFlip = 0
    let facing = 1
    let pose: number | null = null

    const paintReserve = (frame: number) => {
        if (!reserve) return
        const h = PHYS.heroH
        const w = PHYS.heroW
        reserve.clear()
        reserve.fillStyle(C.blue, 1)
        reserve.fillRoundedRect(x - w / 2, y - h, w, h * 0.62, 18)
        reserve.fillStyle(C.ink, 1)
        reserve.fillCircle(x, y - h + 6, w * 0.36)
        reserve.fillStyle(C.warn, 1)
        reserve.fillRoundedRect(x - w / 2 - 10, y - h * 0.9, 18, h * 0.42, 8)
        const spread = frame === 5 || frame === 6 ? 18 : (frame % 2) * 16
        reserve.fillStyle(C.blueDark, 1)
        reserve.fillRoundedRect(x - 22 - spread / 2, y - h * 0.42, 18, h * 0.42, 8)
        reserve.fillRoundedRect(x + 4 + spread / 2, y - h * 0.42, 18, h * 0.42, 8)
    }

    const setFrame = (frame: number) => {
        if (body) body.setFrame(frame)
        else paintReserve(frame)
    }

    const paintShadow = (solids: Solid[]) => {
        let groundBelow = WORLD.fallY
        solids.forEach(solid => {
            if (x < solid.x || x > solid.x + solid.w) return
            if (solid.y < y - 4) return
            groundBelow = Math.min(groundBelow, solid.y)
        })
        shadow.clear()
        if (groundBelow >= WORLD.fallY) return
        const height = Phaser.Math.Clamp((groundBelow - y) / 260, 0, 1)
        const scale = 1 - height * 0.45
        shadow.fillStyle(C.ink, 0.26 * (1 - height * 0.5))
        shadow.fillEllipse(x, groundBelow + 6, 78 * scale, 22 * scale)
    }

    const place = () => {
        if (body) body.setPosition(x, y)
        else paintReserve(pose ?? 0)
    }

    return {
        get x() {
            return x
        },
        get y() {
            return y
        },
        get onGround() {
            return onGround
        },
        get facing() {
            return facing
        },

        spawn(atX: number) {
            x = atX
            y = WORLD.groundY
            vy = 0
            onGround = true
            coyote = 0
            pose = null
            place()
        },

        setFrozen(value: boolean) {
            frozen = value
        },

        /** Uma pose fixa: comemorar, entregar, "eca". */
        setPose(frame: number | null) {
            pose = frame
            if (frame !== null) setFrame(frame)
        },

        update(dt: number, input: HeroInput, solids: Solid[], blocks: Solid[], length: number) {
            if (frozen) {
                paintShadow(solids)
                place()
                return
            }

            const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0)
            if (dir !== 0) facing = dir
            const vx = dir * PHYS.speed

            if (input.jump && (onGround || coyote > 0)) {
                vy = -PHYS.jump
                onGround = false
                coyote = 0
                callbacks.onJump()
            }

            vy = Math.min(vy + PHYS.gravity * dt, PHYS.maxFall)

            const previous = y
            const previousX = x
            x = Phaser.Math.Clamp(x + vx * dt, 40, length - 40)
            const next = y + vy * dt

            const wasOnGround = onGround
            onGround = false
            let landedAt = Number.POSITIVE_INFINITY

            // só pousa quem estava CAINDO e cruzou o topo neste quadro: é o que
            // faz a plataforma ser atravessável de baixo para cima.
            if (vy >= 0) {
                solids.forEach(solid => {
                    if (x < solid.x || x > solid.x + solid.w) return
                    if (previous > solid.y + 2) return
                    if (next < solid.y) return
                    landedAt = Math.min(landedAt, solid.y)
                })
            }

            if (landedAt < Number.POSITIVE_INFINITY) {
                onGround = true
                y = landedAt
                vy = 0
                if (!wasOnGround) callbacks.onLand()
            } else {
                y = next
            }

            // A pedra é a única coisa que empurra de lado: quem não pulou fica
            // parado nela, e é isso que transforma o obstáculo num pulo.
            const halfW = PHYS.heroW / 2
            blocks.forEach(block => {
                if (y <= block.y + 6) return
                const leftEdge = block.x - halfW
                const rightEdge = block.x + block.w + halfW
                if (x <= leftEdge || x >= rightEdge) return
                x = previousX <= block.x + block.w / 2 ? leftEdge : rightEdge
            })

            coyote = onGround ? PHYS.coyoteMs : Math.max(0, coyote - dt * 1000)

            if (pose === null) {
                if (!onGround) {
                    setFrame(vy < 0 ? 5 : 6)
                    runTime = 0
                } else if (dir !== 0) {
                    runTime += dt * (PHYS.speed / 100)
                    const index = Math.floor(runTime) % RUN_FRAMES.length
                    setFrame(RUN_FRAMES[index])
                    const flip = index % 2
                    if (flip !== stepFlip) {
                        stepFlip = flip
                        callbacks.onStep()
                    }
                } else {
                    setFrame(0)
                    runTime = 0
                }
            }

            if (body) body.setFlipX(facing < 0)
            place()
            paintShadow(solids)

            if (y > WORLD.fallY) callbacks.onFall()
        },

        async hop() {
            if (!body) return
            await FX.to(scene, body, { scaleY: body.scaleY * 1.12 }, { duration: 120, yoyo: true })
        },

        setVisible(value: boolean) {
            body?.setVisible(value)
            reserve?.setVisible(value)
            shadow.setVisible(value)
        },

        destroy() {
            if (body) scene.tweens.killTweensOf(body)
            body?.destroy()
            reserve?.destroy()
            shadow.destroy()
        },
    }
}

export type Hero = ReturnType<typeof createHero>
