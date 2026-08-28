import Phaser from 'phaser'
import { BIOME, type BiomePalette } from '../data/theme'
import { DEPTH, H, ROAD, ROAD_RIGHT, W, laneLeft } from '../data/layout'
import type { Biome } from '../types'

/**
 * ══════════════════════════════════════════════════════════════════════
 *  O MUNDO
 * ══════════════════════════════════════════════════════════════════════
 *
 * Vista de cima: a pista é uma faixa vertical parada e o que rola é o chão.
 * Uma única velocidade governa asfalto, tracejado, marcos, cenário e itens —
 * porque no mundo quem anda é o carro, e tudo o mais está plantado no chão.
 * As nuvens são a exceção: passam por cima e mais devagar, que é o único
 * jeito de uma vista aérea mostrar altura.
 *
 * Tudo aqui é Graphics repintado por frame. Nada disto tem estado visual que
 * justifique textura: as folhas mudam de cor, o arbusto muda de tamanho e a
 * pista muda de faixa a cada nível.
 */

const PROP_COUNT = 30
const POST_GAP = 94
const DASH_LEN = 48
const DASH_GAP = 46
const STRIPE_H = 56

interface Prop {
    kind: number
    side: 0 | 1
    x: number
    y: number
    s: number
    seed: number
}

interface Fleck {
    x: number
    y: number
    r: number
    color: number
    drift: number
    spin: number
    speed: number
}

export interface RoadWorld {
    update: (deltaMs: number, speed: number) => void
    /** Marca de pneu na troca de faixa: fica no chão e desce com o mundo. */
    addSkid: (x: number, y: number) => void
    destroy: () => void
}

interface Skid {
    x: number
    y: number
    life: number
}

const rand = Phaser.Math.FloatBetween
const randInt = Phaser.Math.Between

export function createRoad(
    scene: Phaser.Scene,
    options: { biome: Biome; lanes: number },
): RoadWorld {
    const p: BiomePalette = BIOME[options.biome]
    const lanes = options.lanes

    const groundG = scene.add.graphics().setDepth(DEPTH.ground)
    const roadG = scene.add.graphics().setDepth(DEPTH.road)
    const sceneryG = scene.add.graphics().setDepth(DEPTH.scenery)
    const veilG = scene.add.graphics().setDepth(DEPTH.scenery + 1)
    const weatherG = scene.add.graphics().setDepth(DEPTH.weather)

    veilG.fillStyle(p.veil, p.veilAlpha)
    veilG.fillRect(0, ROAD.top, W, H - ROAD.top)

    let scroll = 0
    const skids: Skid[] = []

    const props: Prop[] = []
    const spawnProp = (y: number): Prop => {
        const side: 0 | 1 = Math.random() < 0.5 ? 0 : 1
        const x = side === 0
            ? rand(24, ROAD.x - 46)
            : rand(ROAD_RIGHT + 46, W - 24)
        return { kind: randInt(0, 4), side, x, y, s: rand(0.72, 1.24), seed: rand(0, 6.28) }
    }
    for (let i = 0; i < PROP_COUNT; i++) {
        props.push(spawnProp(ROAD.top - 120 + (i * (H + 200)) / PROP_COUNT))
    }

    const flecks: Fleck[] = []
    for (let i = 0; i < p.fleckCount; i++) {
        flecks.push({
            x: rand(0, W),
            y: rand(ROAD.top, H),
            r: p.fleckKind === 'snow' ? rand(2, 5.5) : rand(5, 10),
            color: p.fleck[randInt(0, p.fleck.length - 1)],
            drift: rand(-26, 26),
            spin: rand(-3, 3),
            speed: rand(0.35, 0.85),
        })
    }

    const clouds: Phaser.GameObjects.Image[] = []
    if (p.cloudCount > 0 && scene.textures.exists('bg-nuvem')) {
        for (let i = 0; i < p.cloudCount; i++) {
            const cloud = scene.add.image(rand(0, W), rand(ROAD.top, H), 'bg-nuvem')
                .setDepth(DEPTH.cloud)
                .setAlpha(p.cloudAlpha)
                .setTint(p.cloud)
                .setScale(rand(0.26, 0.58))
            clouds.push(cloud)
        }
    }

    // ───────────────────────────────────────────────────────── chão

    function drawGround() {
        groundG.clear()
        groundG.fillStyle(p.groundA, 1)
        groundG.fillRect(0, ROAD.top, W, H - ROAD.top)

        const off = scroll % (STRIPE_H * 2)
        groundG.fillStyle(p.groundB, 1)
        for (let y = ROAD.top - STRIPE_H * 2 + off; y < H; y += STRIPE_H * 2) {
            groundG.fillRect(0, Math.max(y, ROAD.top), W, Math.min(STRIPE_H, H - y))
        }

        groundG.fillStyle(p.verge, 1)
        groundG.fillRect(ROAD.x - 52, ROAD.top, 52, H - ROAD.top)
        groundG.fillRect(ROAD_RIGHT, ROAD.top, 52, H - ROAD.top)
    }

    // ───────────────────────────────────────────────────────── pista

    function drawRoad(speed: number) {
        roadG.clear()

        roadG.fillStyle(p.shoulder, 1)
        roadG.fillRect(ROAD.x - ROAD.shoulder, ROAD.top, ROAD.w + ROAD.shoulder * 2, H - ROAD.top)

        roadG.fillStyle(p.road, 1)
        roadG.fillRect(ROAD.x, ROAD.top, ROAD.w, H - ROAD.top)

        // remendos e placas de gelo: dão textura sem pesar
        const patchOff = scroll % 420
        roadG.fillStyle(p.roadPatch, 0.26)
        for (let i = -1; i < 3; i++) {
            const y = ROAD.top + patchOff + i * 420
            roadG.fillEllipse(ROAD.x + 140, y + 60, 150, 74)
            roadG.fillEllipse(ROAD.x + ROAD.w - 110, y + 250, 118, 58)
        }

        roadG.fillStyle(p.edgeLine, 0.92)
        roadG.fillRect(ROAD.x + 9, ROAD.top, 7, H - ROAD.top)
        roadG.fillRect(ROAD_RIGHT - 16, ROAD.top, 7, H - ROAD.top)

        const dashOff = scroll % (DASH_LEN + DASH_GAP)
        roadG.fillStyle(p.dash, 1)
        for (let lane = 1; lane < lanes; lane++) {
            const x = laneLeft(lane, lanes) - 5
            for (let y = ROAD.top - DASH_LEN + dashOff; y < H; y += DASH_LEN + DASH_GAP) {
                const top = Math.max(y, ROAD.top)
                const bottom = Math.min(y + DASH_LEN, H)
                if (bottom > top) roadG.fillRect(x, top, 10, bottom - top)
            }
        }

        drawSkids()
        drawStreaks(speed)
        drawPosts()
    }

    /** Riscos de luz no asfalto: a velocidade que se vê sem mudar o px/s. */
    function drawStreaks(speed: number) {
        const intensity = Phaser.Math.Clamp((speed - 0.05) / 0.24, 0, 1)
        if (intensity < 0.05) return
        const len = 46 + intensity * 130
        roadG.fillStyle(0xffffff, 0.045 + intensity * 0.085)
        for (let i = 0; i < 8; i++) {
            const x = ROAD.x + 34 + ((i * 113) % (ROAD.w - 72))
            const start = ROAD.top - len + ((scroll + i * 91) % 300)
            for (let y = start; y < H; y += 300) {
                const top = Math.max(y, ROAD.top)
                const bottom = Math.min(y + len, H)
                if (bottom > top) roadG.fillRect(x, top, 3, bottom - top)
            }
        }
    }

    function drawSkids() {
        for (const skid of skids) {
            roadG.fillStyle(0x1a1f27, 0.34 * skid.life)
            roadG.fillRoundedRect(skid.x - 26, skid.y, 9, 46, 4)
            roadG.fillRoundedRect(skid.x + 17, skid.y, 9, 46, 4)
        }
    }

    /** Marcos de acostamento: o sinal de velocidade mais barato que existe. */
    function drawPosts() {
        const off = scroll % POST_GAP
        for (let y = ROAD.top - POST_GAP + off; y < H; y += POST_GAP) {
            if (y < ROAD.top - 4) continue
            for (const x of [ROAD.x - ROAD.shoulder - 5, ROAD_RIGHT + ROAD.shoulder - 5]) {
                roadG.fillStyle(0x000000, 0.16)
                roadG.fillRoundedRect(x + 3, y + 4, 10, 22, 4)
                roadG.fillStyle(0xfdf6e6, 1)
                roadG.fillRoundedRect(x, y, 10, 22, 4)
                roadG.fillStyle(p.fleckKind === 'snow' ? 0xff6b52 : 0xe24940, 1)
                roadG.fillRoundedRect(x + 1, y + 3, 8, 7, 3)
            }
        }
    }

    // ───────────────────────────────────────────────────────── cenário

    function shadow(g: Phaser.GameObjects.Graphics, x: number, y: number, r: number) {
        g.fillStyle(0x000000, 0.17)
        g.fillEllipse(x + r * 0.22, y + r * 0.3, r * 2.05, r * 1.7)
    }

    function drawForestProp(g: Phaser.GameObjects.Graphics, prop: Prop) {
        const { x, y, s, kind, seed } = prop
        if (kind === 0) {
            const r = 34 * s
            shadow(g, x, y, r)
            g.fillStyle(p.plantDark, 1)
            g.fillCircle(x, y, r)
            g.fillStyle(p.plant, 1)
            g.fillCircle(x, y, r * 0.86)
            g.fillStyle(p.plantLight, 0.85)
            g.fillCircle(x - r * 0.28, y - r * 0.3, r * 0.34)
            g.fillStyle(p.trunk, 1)
            g.fillCircle(x, y, r * 0.16)
            return
        }
        if (kind === 1) {
            const r = 19 * s
            shadow(g, x, y, r)
            g.fillStyle(p.plant, 1)
            g.fillCircle(x - r * 0.7, y + r * 0.2, r * 0.82)
            g.fillCircle(x + r * 0.72, y + r * 0.14, r * 0.76)
            g.fillCircle(x, y - r * 0.34, r)
            g.fillStyle(p.plantLight, 0.7)
            g.fillCircle(x - r * 0.2, y - r * 0.52, r * 0.36)
            return
        }
        if (kind === 2) {
            g.fillStyle(p.plantLight, 0.55)
            g.fillEllipse(x, y, 46 * s, 30 * s)
            for (let i = 0; i < 5; i++) {
                const a = seed + i * 1.26
                g.fillStyle(p.ornament, 0.95)
                g.fillCircle(x + Math.cos(a) * 15 * s, y + Math.sin(a) * 9 * s, 4.2 * s)
            }
            return
        }
        if (kind === 4) {
            for (let i = 0; i < 7; i++) {
                const a = seed + i * 0.9
                const bx = x + Math.cos(a) * 24 * s
                const by = y + Math.sin(a) * 14 * s
                g.fillStyle(i % 2 ? p.plantDark : p.plant, 0.9)
                g.fillTriangle(bx - 3 * s, by + 6 * s, bx + 3 * s, by + 6 * s, bx, by - 10 * s)
            }
            return
        }

        const r = 15 * s
        shadow(g, x, y, r)
        g.fillStyle(0x8d9aa6, 1)
        g.fillCircle(x, y, r)
        g.fillStyle(0xb3bec8, 1)
        g.fillCircle(x - r * 0.26, y - r * 0.26, r * 0.55)
    }

    function drawSnowProp(g: Phaser.GameObjects.Graphics, prop: Prop) {
        const { x, y, s, kind, seed } = prop
        if (kind === 0 || kind === 1) {
            const r = (kind === 0 ? 33 : 24) * s
            shadow(g, x, y, r)
            g.fillStyle(p.plantDark, 1)
            g.fillCircle(x, y, r)
            g.fillStyle(p.plant, 1)
            g.fillCircle(x, y, r * 0.84)
            g.fillStyle(p.plantLight, 1)
            g.fillCircle(x, y, r * 0.5)
            g.fillStyle(0xffffff, 0.92)
            g.fillCircle(x - r * 0.1, y - r * 0.12, r * 0.28)
            return
        }
        if (kind === 2) {
            const r = 26 * s
            g.fillStyle(0xc9dcec, 0.9)
            g.fillEllipse(x + 4, y + 4, r * 2.1, r * 1.5)
            g.fillStyle(0xffffff, 1)
            g.fillEllipse(x, y, r * 2, r * 1.4)
            return
        }
        if (kind === 4) {
            for (let i = 0; i < 6; i++) {
                const a = seed + i * 1.05
                const bx = x + Math.cos(a) * 22 * s
                const by = y + Math.sin(a) * 13 * s
                g.fillStyle(0xc9dcec, 0.7)
                g.fillEllipse(bx + 2, by + 2, 15 * s, 9 * s)
                g.fillStyle(0xffffff, 1)
                g.fillEllipse(bx, by, 14 * s, 8 * s)
            }
            return
        }

        const r = 15 * s
        shadow(g, x, y, r)
        g.fillStyle(0x7f8b96, 1)
        g.fillCircle(x, y, r)
        g.fillStyle(0xffffff, 1)
        g.fillEllipse(x - r * 0.15, y - r * 0.3, r * 1.5, r * 0.9)
    }

    function drawAutumnProp(g: Phaser.GameObjects.Graphics, prop: Prop) {
        const { x, y, s, kind, seed } = prop
        if (kind === 0 || kind === 1) {
            const r = (kind === 0 ? 35 : 23) * s
            shadow(g, x, y, r)
            g.fillStyle(p.plantDark, 1)
            g.fillCircle(x, y, r)
            g.fillStyle(p.plant, 1)
            g.fillCircle(x, y, r * 0.87)
            g.fillStyle(p.plantLight, 0.9)
            g.fillCircle(x - r * 0.26, y - r * 0.28, r * 0.42)
            g.fillStyle(p.trunk, 1)
            g.fillCircle(x, y, r * 0.15)
            return
        }
        if (kind === 2) {
            for (let i = 0; i < 8; i++) {
                const a = seed + i * 0.78
                g.fillStyle(p.fleck[i % p.fleck.length], 0.92)
                g.fillEllipse(
                    x + Math.cos(a) * 20 * s,
                    y + Math.sin(a) * 12 * s,
                    13 * s, 9 * s,
                )
            }
            return
        }
        if (kind === 4) {
            for (let i = 0; i < 6; i++) {
                const a = seed + i * 1.05
                const bx = x + Math.cos(a) * 26 * s
                const by = y + Math.sin(a) * 15 * s
                g.fillStyle(p.fleck[(i + 1) % p.fleck.length], 0.85)
                g.fillEllipse(bx, by, 11 * s, 7 * s)
            }
            return
        }

        const r = 15 * s
        shadow(g, x, y, r)
        g.fillStyle(0x8d8479, 1)
        g.fillCircle(x, y, r)
        g.fillStyle(0xaea496, 1)
        g.fillCircle(x - r * 0.26, y - r * 0.26, r * 0.55)
    }

    const drawProp =
        options.biome === 'snow' ? drawSnowProp
            : options.biome === 'autumn' ? drawAutumnProp
                : drawForestProp

    function drawScenery() {
        sceneryG.clear()
        for (const prop of props) {
            if (prop.y < ROAD.top - 60 || prop.y > H + 60) continue
            drawProp(sceneryG, prop)
        }
    }

    // ──────────────────────────────────────────────────── neve e folhas

    function drawWeather(deltaMs: number, speed: number) {
        weatherG.clear()
        if (!flecks.length) return

        for (const f of flecks) {
            f.y += (speed * f.speed + 0.05) * deltaMs
            f.x += (f.drift * deltaMs) / 1000
            f.spin += deltaMs * 0.004
            if (f.y > H + 20) {
                f.y = ROAD.top - 20
                f.x = rand(0, W)
            }
            if (f.x < -20) f.x = W + 20
            if (f.x > W + 20) f.x = -20

            if (p.fleckKind === 'snow') {
                weatherG.fillStyle(f.color, 0.85)
                weatherG.fillCircle(f.x, f.y, f.r)
            } else {
                const sway = Math.sin(f.spin) * f.r * 0.9
                weatherG.fillStyle(f.color, 0.9)
                weatherG.fillEllipse(f.x + sway, f.y, f.r * 1.7, f.r * (0.5 + Math.abs(Math.cos(f.spin)) * 0.7))
            }
        }
    }

    function moveClouds(deltaMs: number, speed: number) {
        for (const cloud of clouds) {
            cloud.y += speed * 0.55 * deltaMs
            cloud.x += deltaMs * 0.012
            if (cloud.y > H + cloud.displayHeight) {
                cloud.y = ROAD.top - cloud.displayHeight
                cloud.x = rand(-60, W + 60)
                cloud.setScale(rand(0.26, 0.58))
            }
            if (cloud.x > W + cloud.displayWidth) cloud.x = -cloud.displayWidth
        }
    }

    function update(deltaMs: number, speed: number) {
        const advance = speed * deltaMs
        scroll += advance

        for (const prop of props) {
            prop.y += advance
            if (prop.y > H + 130) {
                const fresh = spawnProp(prop.y - (H + 260))
                prop.kind = fresh.kind
                prop.side = fresh.side
                prop.x = fresh.x
                prop.y = fresh.y
                prop.s = fresh.s
                prop.seed = fresh.seed
            }
        }

        for (let i = skids.length - 1; i >= 0; i--) {
            const skid = skids[i]
            skid.y += advance
            skid.life -= deltaMs / 1300
            if (skid.life <= 0 || skid.y > H) skids.splice(i, 1)
        }

        drawGround()
        drawRoad(speed)
        drawScenery()
        drawWeather(deltaMs, speed)
        moveClouds(deltaMs, speed)
    }

    update(0, 0)

    return {
        update,
        addSkid(x: number, y: number) {
            if (skids.length > 12) skids.shift()
            skids.push({ x, y, life: 1 })
        },
        destroy() {
            groundG.destroy()
            roadG.destroy()
            sceneryG.destroy()
            veilG.destroy()
            weatherG.destroy()
            clouds.forEach(c => c.destroy())
        },
    }
}
