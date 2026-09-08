import Phaser from 'phaser'
import { LANE_WX, P_SPAWN, SIGN, depthOf, pOf, xOf, yOf, zOf } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import { TECH } from '../data/tech'
import type { Lane, TechId } from '../types'

type SignState = 'idle' | 'ok' | 'blocked'

interface Sign {
    root: Phaser.GameObjects.Container
    body: Phaser.GameObjects.Graphics
    ring: Phaser.GameObjects.Graphics
    face: Phaser.GameObjects.GameObject
    tech: TechId
    state: SignState
}

const OUT = [-1, 1] as const

function paint(g: Phaser.GameObjects.Graphics, lane: Lane, state: SignState) {
    const out = OUT[lane]
    const postX = out * (SIGN.postWX - LANE_WX)
    const half = SIGN.panel / 2
    const border = state === 'ok' ? C.okDark : state === 'blocked' ? C.warnDark : C.ink
    const face = state === 'ok' ? C.ok : state === 'blocked' ? C.warn : C.cream

    g.clear()

    g.fillStyle(C.ink, 0.18)
    g.fillEllipse(postX, 6, 78, 22)

    g.fillStyle(C.woodDark, 1)
    g.fillRoundedRect(postX - SIGN.postW / 2, -SIGN.postH, SIGN.postW, SIGN.postH, 12)
    g.fillStyle(C.wood, 1)
    g.fillRoundedRect(postX - SIGN.postW / 2 + 5, -SIGN.postH + 6, SIGN.postW - 14, SIGN.postH - 12, 8)

    const armFrom = Math.min(postX, 0)
    const armTo = Math.max(postX, 0)
    g.fillStyle(C.woodDark, 1)
    g.fillRoundedRect(armFrom, SIGN.panelY - SIGN.armH / 2, armTo - armFrom, SIGN.armH, 8)

    g.fillStyle(C.ink, 0.22)
    g.fillRoundedRect(-half + 8, SIGN.panelY - half + 14, SIGN.panel, SIGN.panel, 26)

    g.fillStyle(border, 1)
    g.fillRoundedRect(-half, SIGN.panelY - half, SIGN.panel, SIGN.panel, 26)
    g.fillStyle(face, 1)
    g.fillRoundedRect(-half + 11, SIGN.panelY - half + 11, SIGN.panel - 22, SIGN.panel - 22, 18)
    g.fillStyle(C.white, state === 'idle' ? 0.7 : 0.32)
    g.fillRoundedRect(-half + 20, SIGN.panelY - half + 20, SIGN.panel - 40, 34, 16)

    if (state !== 'blocked') return

    const barFrom = Math.min(postX, -out * (LANE_WX - 1))
    const barTo = Math.max(postX, -out * (LANE_WX - 1))
    const h = SIGN.barrierH
    const y0 = SIGN.barrierY - h / 2

    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(barFrom - 6, y0 - 6, barTo - barFrom + 12, h + 12, 14)
    g.fillStyle(C.warn, 1)
    g.fillRoundedRect(barFrom, y0, barTo - barFrom, h, 10)

    g.fillStyle(C.white, 1)
    for (let x = barFrom + 12; x + 30 + h < barTo; x += 62) {
        g.fillPoints(
            [
                new Phaser.Geom.Point(x, y0 + h),
                new Phaser.Geom.Point(x + 26, y0 + h),
                new Phaser.Geom.Point(x + 26 + h, y0),
                new Phaser.Geom.Point(x + h, y0),
            ],
            true,
        )
    }

    const lockY = SIGN.panelY + half - 6
    g.lineStyle(12, C.ink, 1)
    g.beginPath()
    g.arc(0, lockY - 18, 20, Math.PI, 0)
    g.strokePath()
    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(-32, lockY - 20, 64, 52, 12)
    g.fillStyle(C.gold, 1)
    g.fillCircle(0, lockY + 4, 9)
}

export function createSignPair(
    scene: Phaser.Scene,
    options: { techByLane: [TechId, TechId] },
) {
    const hasSheet = scene.textures.exists('tecnologias')
    let z = zOf(P_SPAWN)
    let resolved = false

    const signs: Sign[] = options.techByLane.map((tech, index) => {
        const lane = index as Lane
        const root = scene.add.container(0, 0)

        const body = scene.add.graphics()
        paint(body, lane, 'idle')

        const ring = scene.add.graphics().setAlpha(0)
        ring.lineStyle(14, C.ok, 1)
        ring.strokeRoundedRect(
            -SIGN.panel / 2 - 14,
            SIGN.panelY - SIGN.panel / 2 - 14,
            SIGN.panel + 28,
            SIGN.panel + 28,
            34,
        )

        let face: Phaser.GameObjects.GameObject
        if (hasSheet) {
            face = scene.add
                .image(0, SIGN.panelY, 'tecnologias', TECH[tech].frame)
                .setDisplaySize(SIGN.icon, SIGN.icon)
        } else {
            face = scene.add
                .text(0, SIGN.panelY, TECH[tech].label, {
                    fontFamily: FONT.black,
                    fontSize: '34px',
                    color: CSS.ink,
                    align: 'center',
                    wordWrap: { width: SIGN.icon },
                })
                .setOrigin(0.5)
        }

        root.add([body, ring, face])
        return { root, body, ring, face, tech, state: 'idle' as SignState }
    })

    const project = () => {
        const p = pOf(z)
        signs.forEach((sign, index) => {
            const lane = index as Lane
            sign.root.setPosition(xOf(p, lane === 0 ? -LANE_WX : LANE_WX), yOf(p))
            sign.root.setScale(p)
            sign.root.setDepth(depthOf(p))
        })
    }

    project()

    return {
        get z() {
            return z
        },
        get p() {
            return pOf(z)
        },
        get resolved() {
            return resolved
        },
        set resolved(value: boolean) {
            resolved = value
        },

        techAt(lane: Lane) {
            return signs[lane].tech
        },

        advance(dz: number) {
            z -= dz
            project()
        },

        project,

        panelAt(lane: Lane) {
            const p = pOf(z)
            return {
                x: xOf(p, lane === 0 ? -LANE_WX : LANE_WX),
                y: yOf(p) + SIGN.panelY * p,
                size: SIGN.panel * p,
            }
        },

        setState(lane: Lane, state: SignState) {
            const sign = signs[lane]
            sign.state = state
            paint(sign.body, lane, state)
            if (state === 'ok') {
                sign.ring.setAlpha(1)
                scene.tweens.add({
                    targets: sign.ring,
                    alpha: 0,
                    duration: 620,
                    ease: 'Cubic.easeOut',
                })
            }
        },

        hint(lane: Lane) {
            const sign = signs[lane]
            scene.tweens.killTweensOf(sign.ring)
            sign.ring.setAlpha(0)
            scene.tweens.add({
                targets: sign.ring,
                alpha: 0.95,
                duration: 420,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
            })
        },

        fall() {
            signs.forEach((sign, index) => {
                scene.tweens.killTweensOf(sign.ring)
                sign.ring.setAlpha(0)
                scene.tweens.add({
                    targets: sign.root,
                    rotation: (index === 0 ? -1 : 1) * 0.7,
                    duration: 360,
                    delay: index * 60,
                    ease: 'Quad.easeIn',
                })
                scene.tweens.add({
                    targets: sign.root,
                    alpha: 0,
                    duration: 300,
                    delay: 110 + index * 60,
                    ease: 'Cubic.easeIn',
                })
            })
        },

        hideFace(lane: Lane) {
            const sign = signs[lane]
            scene.tweens.add({ targets: sign.face, alpha: 0, duration: 220, ease: 'Cubic.easeOut' })
        },

        destroy() {
            signs.forEach(sign => {
                scene.tweens.killTweensOf(sign.ring)
                sign.root.destroy(true)
            })
        },
    }
}

export type SignPair = ReturnType<typeof createSignPair>
