import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { PISTA, PISTA_SHEET, TUBE_TILE, cellKey } from '../data/files'
import { DEPTH, GATE, GATE_ART, H, PLAY, W } from '../data/layout'
import { offsetAt, poseAt, type Path, type Point, type Pose } from '../data/path'
import { C, CSS, FONT } from '../data/theme'
import type { Bit } from '../types'

type Img = Phaser.GameObjects.Image

export interface Tube {
    readonly root: Phaser.GameObjects.Container
    readonly carLayer: Phaser.GameObjects.Container
    readonly gates: number[]
    readonly startS: number
    readonly endS: number
    /** onde o carrinho entra no conector */
    readonly dockS: number
    readonly scroll: number
    build(path: Path, gates: number): void
    pose(s: number): Pose
    lanePoint(s: number, up: number): Point
    follow(x: number): void
    toScreen(p: Point): Point
    startView(): void
    endView(): void
    light(i: number, bit: Bit): void
    dimAll(): void
    setAlpha(a: number): void
    destroy(): void
}

/** a corrida, dentro do fio: o tubo dobra ao longo do caminho; nada mais no fundo */
export function createTube(scene: Phaser.Scene, gap: number): Tube {
    const bg = scene.add.rectangle(0, 0, W, H, C.playBg).setOrigin(0).setDepth(DEPTH.playBg)
    const root = scene.add.container(0, 0).setDepth(DEPTH.play)
    const tubeLayer = scene.add.container(0, 0)
    const carLayer = scene.add.container(0, 0)
    const front = scene.add.container(0, 0)
    root.add([tubeLayer, carLayer, front])

    let path!: Path
    let gates: number[] = []
    let glows: Array<Record<Bit, Img>> = []
    let scroll = 0
    let minScroll = 0
    let maxScroll = 0
    let plugLength = 0

    const setScroll = (s: number) => {
        scroll = s
        root.x = -s
    }

    const build = (next: Path, count: number) => {
        path = next
        tubeLayer.removeAll(true)
        front.removeAll(true)
        glows = []

        const tile = scene.textures.get(TUBE_TILE).getSourceImage() as HTMLCanvasElement
        const per = Math.max(2, Math.round(tile.width / path.step))
        for (let i = 0; i < path.xs.length - 1; i += per) {
            const pts: Phaser.Math.Vector2[] = []
            for (let j = i; j <= Math.min(i + per, path.xs.length - 1); j++) pts.push(new Phaser.Math.Vector2(path.xs[j], path.ys[j]))
            if (pts.length < 2) break
            tubeLayer.add(scene.add.rope(0, 0, TUBE_TILE, undefined, pts, true))
        }

        gates = Array.from({ length: count }, (_, i) => PLAY.lead + PLAY.before + i * gap)
        gates.forEach(s => {
            const pose = poseAt(path, s)
            const gate = scene.add
                .image(pose.x, pose.y, PISTA_SHEET.key, cellKey(PISTA.gate))
                .setOrigin((GATE_ART.centerX - GATE_ART.left) / GATE_ART.width, (GATE_ART.windowsMid - GATE_ART.top) / GATE_ART.height)
                .setRotation(pose.angle)
                .setScale((2 * PLAY.lane) / GATE_ART.windowGap)
            const glow = {} as Record<Bit, Img>
            ;(['1', '0'] as Bit[]).forEach(bit => {
                const up = bit === '1' ? PLAY.lane : -PLAY.lane
                const p = offsetAt(pose, up)
                const g = scene.add.image(p.x, p.y, PISTA_SHEET.key, cellKey(bit === '1' ? PISTA.glow1 : PISTA.glow0))
                g.setScale(GATE.glow / Math.max(g.frame.width, g.frame.height)).setAlpha(0)
                glow[bit] = g
                const d = offsetAt(pose, (bit === '1' ? 1 : -1) * GATE.digit)
                const digit = scene.add
                    .text(d.x, d.y, bit, { fontFamily: FONT.black, fontSize: '40px', color: CSS.white, stroke: CSS.ink, strokeThickness: 8 })
                    .setOrigin(0.5)
                    .setResolution(2)
                front.add([g, digit])
            })
            front.addAt(gate, 0)
            glows.push(glow)
        })

        const end = poseAt(path, path.length)
        const plug = scene.add.image(end.x, end.y, PISTA_SHEET.key, cellKey(PISTA.plug)).setOrigin(1, 0.5).setRotation(end.angle)
        plug.setScale((PLAY.tube * PLAY.plug) / plug.frame.height)
        plugLength = plug.displayWidth
        front.add(plug)

        const start = poseAt(path, PLAY.lead)
        minScroll = start.x - PLAY.carX
        maxScroll = end.x - PLAY.endX
        setScroll(minScroll)
    }

    return {
        root,
        carLayer,
        get gates() {
            return gates
        },
        get startS() {
            return PLAY.lead
        },
        get endS() {
            return path.length
        },
        get dockS() {
            return path.length - plugLength + 40
        },
        get scroll() {
            return scroll
        },
        build,
        pose: s => poseAt(path, s),
        lanePoint: (s, up) => offsetAt(poseAt(path, s), up),
        follow(x) {
            setScroll(Phaser.Math.Clamp(x - PLAY.carX, minScroll, maxScroll))
        },
        toScreen: p => ({ x: p.x - scroll, y: p.y }),
        startView: () => setScroll(minScroll),
        endView: () => setScroll(maxScroll),
        light(i, bit) {
            const glow = glows[i]?.[bit]
            if (!glow) return
            const base = glow.scale
            glow.setAlpha(1).setScale(base * 0.4)
            void FX.to(scene, glow, { scale: base }, { duration: 260, ease: 'Back.easeOut' })
        },
        dimAll() {
            glows.forEach(g => Object.values(g).forEach(img => img.setAlpha(0)))
        },
        setAlpha(a) {
            root.setAlpha(a)
            bg.setAlpha(a)
            root.setVisible(a > 0)
            bg.setVisible(a > 0)
        },
        destroy() {
            bg.destroy()
            root.destroy()
        },
    }
}
