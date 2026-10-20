import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { EDGE, PIECE, PIECE_SHEET, PLANK, PLANK_CORNER, SCENERY, cellKey } from '../data/files'
import { DEPTH, H, PLATFORM, SPRING, TUNNEL_PATH } from '../data/layout'
import { C } from '../data/theme'
import type { MapDef, Point, Scenery } from '../types'
import { fit } from './art'
import type { World } from './world'

export interface Stage {
    bounce(spring: number): void
    destroy(): void
}

const LINE = 5
/** distância entre os pontos da borda e o quanto cada quina é arredondada */
const STEP = 16
const ROUND = 14

/** corta cada quina com dois pontos, para a borda dobrar sem dente */
function rounded(line: Point[]): Point[] {
    const out: Point[] = [line[0]]
    for (let i = 1; i < line.length - 1; i++) {
        const [px, py] = line[i - 1]
        const [x, y] = line[i]
        const [nx, ny] = line[i + 1]
        const a = Math.min(ROUND, Math.hypot(x - px, y - py) / 3) / Math.hypot(x - px, y - py)
        const b = Math.min(ROUND, Math.hypot(nx - x, ny - y) / 3) / Math.hypot(nx - x, ny - y)
        out.push([x + (px - x) * a, y + (py - y) * a], [x + (nx - x) * b, y + (ny - y) * b])
    }
    out.push(line[line.length - 1])
    return out
}

/** o ponto a uma distância `s` ao longo da linha */
function walker(line: Point[]) {
    const acc = [0]
    for (let i = 1; i < line.length; i++) acc.push(acc[i - 1] + Math.hypot(line[i][0] - line[i - 1][0], line[i][1] - line[i - 1][1]))
    let i = 1
    return {
        length: acc[acc.length - 1],
        at(s: number): Point {
            while (i < line.length - 1 && acc[i] < s) i++
            while (i > 1 && acc[i - 1] > s) i--
            const span = acc[i] - acc[i - 1]
            const t = span === 0 ? 0 : (s - acc[i - 1]) / span
            return [line[i - 1][0] + (line[i][0] - line[i - 1][0]) * t, line[i - 1][1] + (line[i][1] - line[i - 1][1]) * t]
        },
    }
}

/**
 * A borda de cima do chão: a textura segue o relevo em pedaços de 512 px de comprimento, sem esticar.
 * A Rope centra a textura no caminho; os pontos descem pela normal para a linha do PNG cair no chão.
 */
function createEdge(scene: Phaser.Scene, key: string, line: Point[]) {
    const texture = scene.textures.get(key)
    const source = texture.getSourceImage() as { width: number; height: number }
    const k = source.width / EDGE.w
    const drop = (source.height / k / 2 - EDGE.line) * k
    const path = walker(rounded(line))
    const ropes: Phaser.GameObjects.Rope[] = []
    for (let start = 0; start < path.length - 0.5; start += EDGE.w) {
        const len = Math.min(EDGE.w, path.length - start)
        const n = Math.max(2, Math.ceil(len / STEP))
        const raw: Point[] = []
        for (let j = 0; j <= n; j++) raw.push(path.at(start + (len * j) / n))
        const points = raw.map(([x, y], j) => {
            const [ax, ay] = raw[Math.max(0, j - 1)]
            const [bx, by] = raw[Math.min(n, j + 1)]
            const d = Math.hypot(bx - ax, by - ay) || 1
            return new Phaser.Math.Vector2(x * k - ((by - ay) / d) * drop, y * k + ((bx - ax) / d) * drop)
        })
        const width = Math.round(len * k)
        const frame = `w${width}`
        if (!texture.has(frame)) texture.add(frame, 0, 0, 0, width, source.height)
        ropes.push(
            scene.add
                .rope(0, 0, key, frame, points)
                .setScale(1 / k)
                .setDepth(DEPTH.ground + 0.6),
        )
    }
    return ropes
}

/** o PNG do túnel na largura `width` (escala do cano) repetido na vertical até `height` px, numa textura só */
function runTexture(scene: Phaser.Scene, key: string, width: number, height: number) {
    const name = `${key}~${width}x${height}`
    if (scene.textures.exists(name)) return name
    const source = scene.textures.get(key).getSourceImage() as HTMLImageElement | HTMLCanvasElement
    const canvas = scene.textures.createCanvas(name, width, height)
    if (!canvas) return key
    const tile = (source.height * width) / source.width
    for (let y = 0; y < height; y += tile) canvas.context.drawImage(source, 0, y, width, tile)
    canvas.refresh()
    return name
}

/** quanto do cano cabe de cada lado do eixo a `s` px do começo: abre até a boca nas duas pontas */
function halfAt(s: number, length: number, mouth: number, pipe: number) {
    const edge = Math.min(s, length - s)
    if (edge >= TUNNEL_PATH.taper) return pipe / 2
    const t = edge / TUNNEL_PATH.taper
    const ease = t * t * (3 - 2 * t)
    return (mouth + (pipe - mouth) * ease) / 2
}

/**
 * O túnel por dentro da terra: um cano só, da boca até a saída, com a textura repetida ao longo do
 * caminho (sem esticar). Nas duas pontas ele abre até a largura da abertura; os vértices da Rope e o
 * contorno dos dois lados saem das mesmas normais e da mesma largura em cada ponto.
 */
function createTube(scene: Phaser.Scene, key: string, path: Array<{ x: number; y: number }>, mouth: number, pipe: number, g: Phaser.GameObjects.Graphics) {
    const source = scene.textures.get(key).getSourceImage() as { width: number }
    const texW = Math.min(source.width, Math.ceil(pipe * 1.25))
    const k = pipe / texW
    const walk = walker(path.map(p => [p.x, p.y] as Point))
    const n = Math.max(2, Math.ceil(walk.length / STEP))
    const raw: Point[] = []
    for (let j = 0; j <= n; j++) raw.push(walk.at((walk.length * j) / n))
    const left: Phaser.Math.Vector2[] = []
    const right: Phaser.Math.Vector2[] = []
    raw.forEach(([x, y], j) => {
        const [ax, ay] = raw[Math.max(0, j - 1)]
        const [bx, by] = raw[Math.min(n, j + 1)]
        const d = Math.hypot(bx - ax, by - ay) || 1
        const half = halfAt((walk.length * j) / n, walk.length, mouth, pipe)
        const nx = ((by - ay) / d) * half
        const ny = (-(bx - ax) / d) * half
        left.push(new Phaser.Math.Vector2(x + nx, y + ny))
        right.push(new Phaser.Math.Vector2(x - nx, y - ny))
    })
    const texture = runTexture(scene, key, texW, Math.max(1, Math.round(walk.length / k)))
    const tube = scene.add
        .rope(
            0,
            0,
            texture,
            undefined,
            raw.map(([x, y]) => new Phaser.Math.Vector2(x / k, y / k)),
            false,
        )
        .setScale(k)
        .setDepth(DEPTH.ground + 0.5)
    left.forEach((l, j) => {
        tube.vertices[j * 4] = l.x / k
        tube.vertices[j * 4 + 1] = l.y / k
        tube.vertices[j * 4 + 2] = right[j].x / k
        tube.vertices[j * 4 + 3] = right[j].y / k
    })
    g.lineStyle(LINE - 1, C.ink, 1)
    g.strokePoints(left)
    g.strokePoints(right)
    return tube
}

/** a sombra leve logo abaixo de cada abertura do tubo (na boca e na saída) */
function shade(g: Phaser.GameObjects.Graphics, x: number, y: number, mouth: number, pipe: number) {
    ;[0.32, 0.2, 0.1].forEach((alpha, k) => {
        const top = halfAt(k * 14, Infinity, mouth, pipe)
        const bottom = halfAt((k + 1) * 14, Infinity, mouth, pipe)
        g.fillStyle(C.shadow, alpha)
        g.fillPoints(
            [
                new Phaser.Math.Vector2(x - top, y + k * 14),
                new Phaser.Math.Vector2(x + top, y + k * 14),
                new Phaser.Math.Vector2(x + bottom, y + (k + 1) * 14),
                new Phaser.Math.Vector2(x - bottom, y + (k + 1) * 14),
            ],
            true,
        )
    })
}

/** corta uma linha do chão nos trechos [a, b] (as saídas dos túneis), interpolando a altura nas pontas */
function cutLine(line: Point[], gaps: Array<[number, number]>): Point[][] {
    const yAt = (x: number) => {
        for (let i = 0; i < line.length - 1; i++) {
            const [x0, y0] = line[i]
            const [x1, y1] = line[i + 1]
            if (x >= x0 && x <= x1) return x1 === x0 ? y0 : y0 + ((y1 - y0) * (x - x0)) / (x1 - x0)
        }
        return line[line.length - 1][1]
    }
    let pieces: Point[][] = [line]
    gaps.forEach(([a, b]) => {
        pieces = pieces.flatMap(piece => {
            const from = piece[0][0]
            const to = piece[piece.length - 1][0]
            if (b <= from || a >= to) return [piece]
            const out: Point[][] = []
            if (a > from) out.push([...piece.filter(([x]) => x < a), [a, yAt(a)]])
            if (b < to) out.push([[b, yAt(b)], ...piece.filter(([x]) => x > b)])
            return out
        })
    })
    return pieces.filter(p => p.length >= 2)
}

/** o relevo de um mapa: o chão do lugar repetido dentro do relevo, túneis, a borda de cima, tábuas e molas */
export function createStage(scene: Phaser.Scene, map: MapDef, world: World, scenery: Scenery = 'campo'): Stage {
    const art = SCENERY[scenery]
    const shape = scene.make.graphics({ x: 0, y: 0 }, false)
    shape.fillStyle(0xffffff, 1)
    map.ground.forEach(line => {
        const pts = [...line, [line[line.length - 1][0], H + 20], [line[0][0], H + 20]].map(([x, y]) => new Phaser.Math.Vector2(x, y))
        shape.fillPoints(pts, true)
    })
    map.tunnels.forEach((t, i) => {
        const top = world.tunnelTop(i)
        shape.fillRect(t.x0 - 1, top, t.x1 - t.x0 + 2, H + 20 - top)
    })
    const dirt = scene.add.tileSprite(0, 0, map.width, H, art.ground).setOrigin(0).setDepth(DEPTH.ground)
    dirt.setMask(shape.createGeometryMask())

    const g = scene.add.graphics().setDepth(DEPTH.ground + 0.55)
    const exits: Array<[number, number]> = []
    const tunnels = map.tunnels.map((t, i) => {
        const mouth = t.x1 - t.x0
        const pipe = mouth * TUNNEL_PATH.width
        shade(g, (t.x0 + t.x1) / 2, world.tunnelTop(i), mouth, pipe)
        shade(g, t.exit, world.groundAt(t.exit) ?? world.tunnelTop(i), mouth, pipe)
        exits.push([t.exit - mouth / 2, t.exit + mouth / 2])
        return createTube(scene, art.tunnel, world.tunnelPath(i), mouth, pipe, g)
    })
    const edges = map.ground.flatMap(line => cutLine(line, exits)).flatMap(line => createEdge(scene, art.edge, line))

    const planks = map.platforms.map(p =>
        scene.add
            .nineslice(p.x, p.y, PLANK, undefined, p.w, PLATFORM.h + 12, PLANK_CORNER, PLANK_CORNER, 0, 0)
            .setDepth(DEPTH.platform),
    )

    const springs = map.springs.map(s => {
        const ground = world.groundAt(s.x) ?? 560
        return fit(scene, PIECE_SHEET, PIECE.spring, SPRING.w).setOrigin(0.5, 1).setPosition(s.x, ground + 4).setDepth(DEPTH.platform)
    })

    return {
        bounce(i) {
            const spring = springs[i]
            if (!spring) return
            const base = spring.scaleY
            spring.setFrame(cellKey(PIECE.springDown))
            void FX.to(scene, spring, { scaleY: base * 1.25 }, { duration: 90, yoyo: true }).then(() => {
                if (spring.active) spring.setFrame(cellKey(PIECE.spring)).setScale(spring.scaleX, base)
            })
        },
        destroy() {
            dirt.clearMask(true)
            dirt.destroy()
            shape.destroy()
            g.destroy()
            tunnels.forEach(t => t.destroy())
            edges.forEach(e => e.destroy())
            planks.forEach(p => p.destroy())
            springs.forEach(s => s.destroy())
        },
    }
}
