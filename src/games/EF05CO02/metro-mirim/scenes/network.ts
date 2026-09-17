import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { KEY } from '../data/art'
import { hasEdge, key } from '../data/graph'
import { DEPTH, TRACK } from '../data/layout'
import { C } from '../data/theme'
import type { Edge, Link, Station } from '../types'

export interface NetworkOptions {
    onKnob: (edge: Edge) => void
}

/**
 * As arestas: as POSSÍVEIS (tracejadas) e as CONSTRUÍDAS (trilho).
 *
 * As duas camadas são o mesmo dado em dois estados, por isso moram no mesmo
 * módulo: quando o trilho nasce, o tracejado daquela ligação some no mesmo
 * quadro — em arquivos separados isso viraria sincronização.
 *
 * Com `trilho-tile.png`, o trilho é a arte REPETIDA ao longo da ligação (um
 * `TileSprite` girado); sem ela, sai em `Graphics` com dormentes desenhados.
 */
export function createNetwork(scene: Phaser.Scene, options: NetworkOptions) {
    const ghosts = scene.add.graphics().setDepth(DEPTH.links)
    const rails = scene.add.graphics().setDepth(DEPTH.tracks)
    const knobs = scene.add.graphics().setDepth(DEPTH.knobs)
    const tiles: Phaser.GameObjects.TileSprite[] = []
    const zones: Phaser.GameObjects.Zone[] = []

    let stations = new Map<string, Station>()
    let links: Link[] = []
    let edges: Edge[] = []
    let selected: string | null = null
    let enabled = true
    let hover: string | null = null
    const lit = new Set<string>()

    const at = (id: string) => stations.get(id)!
    const art = () => scene.textures.exists(KEY.tile)

    const dashed = (g: Phaser.GameObjects.Graphics, a: Station, b: Station, step: number, run: number) => {
        const dx = b.x - a.x
        const dy = b.y - a.y
        const len = Math.hypot(dx, dy)
        const ux = dx / len
        const uy = dy / len
        for (let d = 20; d < len - 20; d += step + run) {
            const e = Math.min(d + step, len - 20)
            g.lineBetween(a.x + ux * d, a.y + uy * d, a.x + ux * e, a.y + uy * e)
        }
    }

    /**
     * O tracejado é a única coisa que diz ONDE cabe trilho, e ele tem de ser
     * lido por cima de um fundo cheio de telhado e árvore: casca escura
     * embaixo, miolo claro em cima.
     */
    const paintGhosts = () => {
        ghosts.clear()
        links.forEach(link => {
            if (hasEdge(edges, link.a, link.b)) return
            const k = key(link.a, link.b)
            const touches = selected === link.a || selected === link.b || hover === k
            const a = at(link.a)
            const b = at(link.b)
            ghosts.lineStyle(touches ? 30 : 24, C.ink, touches ? 0.9 : 0.5)
            dashed(ghosts, a, b, TRACK.dash, TRACK.gap)
            ghosts.lineStyle(touches ? 20 : 15, touches ? C.blue : C.disc, touches ? 1 : 0.85)
            dashed(ghosts, a, b, TRACK.dash, TRACK.gap)
        })
    }

    const clearTiles = () => {
        tiles.forEach(t => t.destroy())
        tiles.length = 0
    }

    const paintRails = () => {
        rails.clear()
        knobs.clear()
        clearTiles()

        edges.forEach(edge => {
            const a = at(edge.a)
            const b = at(edge.b)
            const on = lit.has(key(edge.a, edge.b))
            const near = selected === edge.a || selected === edge.b

            const dx = b.x - a.x
            const dy = b.y - a.y
            const len = Math.hypot(dx, dy)
            const ux = dx / len
            const uy = dy / len
            const nx = -uy
            const ny = ux
            const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }

            rails.lineStyle(TRACK.width + 12, C.ink, 1)
            rails.lineBetween(a.x, a.y, b.x, b.y)

            if (art()) {
                const height = TRACK.width + 10
                const tile = scene.add
                    .tileSprite(mid.x, mid.y, len, height, KEY.tile)
                    .setRotation(Math.atan2(dy, dx))
                    .setDepth(DEPTH.tracks)
                // a via repete no tamanho DELA: sem isto o desenho estica na
                // vertical e os dormentes viram traços
                const shrink = height / scene.textures.get(KEY.tile).getSourceImage().height
                tile.setTileScale(shrink, shrink)
                if (on) tile.setTint(C.amber)
                tiles.push(tile)
            } else {
                rails.lineStyle(TRACK.width, on ? C.amber : C.tie, 1)
                rails.lineBetween(a.x, a.y, b.x, b.y)

                // os dormentes: sem eles a aresta parece uma tábua, não um trilho
                rails.lineStyle(6, C.ink, 0.45)
                for (let d = 34; d < len - 34; d += 34) {
                    const px = a.x + ux * d
                    const py = a.y + uy * d
                    rails.lineBetween(px + nx * 15, py + ny * 15, px - nx * 15, py - ny * 15)
                }

                const off = 9
                rails.lineStyle(TRACK.tie, on ? C.white : C.railLight, 1)
                rails.lineBetween(a.x + nx * off, a.y + ny * off, b.x + nx * off, b.y + ny * off)
                rails.lineBetween(a.x - nx * off, a.y - ny * off, b.x - nx * off, b.y - ny * off)
            }

            knobs.fillStyle(C.ink, 1)
            knobs.fillCircle(mid.x, mid.y + 4, TRACK.knobR)
            knobs.fillStyle(near ? C.amber : C.rail, 1)
            knobs.fillCircle(mid.x, mid.y, TRACK.knobR)
            knobs.fillStyle(near ? C.white : C.railLight, 1)
            knobs.fillRoundedRect(mid.x - 24, mid.y - 11, 48, 22, 8)
        })
    }

    const rebuildZones = () => {
        zones.forEach(z => z.destroy())
        zones.length = 0
        edges.forEach(edge => {
            const a = at(edge.a)
            const b = at(edge.b)
            const zone = scene.add
                .zone((a.x + b.x) / 2, (a.y + b.y) / 2, TRACK.knobHit, TRACK.knobHit)
                .setDepth(DEPTH.knobs + 1)
                .setInteractive({ useHandCursor: true })
            zone.on('pointerdown', () => {
                if (!enabled) return
                options.onKnob(edge)
            })
            zones.push(zone)
        })
    }

    const repaint = () => {
        paintGhosts()
        paintRails()
        rebuildZones()
    }

    return {
        setPhase(list: Station[], possible: Link[]) {
            stations = new Map(list.map(s => [s.id, s]))
            links = possible
            edges = []
            selected = null
            hover = null
            lit.clear()
            repaint()
        },

        setEdges(next: Edge[]) {
            edges = next
            repaint()
        },

        setSelected(id: string | null) {
            selected = id
            paintGhosts()
            paintRails()
        },

        /** A ligação que a peça arrastada vai ocupar se soltar agora. */
        setHover(link: Link | null) {
            const k = link ? key(link.a, link.b) : null
            if (k === hover) return
            hover = k
            paintGhosts()
        },

        setEnabled(value: boolean) {
            enabled = value
        },

        /** A ligação possível mais perto de um ponto — o alvo do arraste. */
        nearestLink(x: number, y: number, limit: number): Link | null {
            let best: Link | null = null
            let bestDist = limit
            links.forEach(link => {
                if (hasEdge(edges, link.a, link.b)) return
                const a = at(link.a)
                const b = at(link.b)
                const dx = b.x - a.x
                const dy = b.y - a.y
                const len2 = dx * dx + dy * dy
                const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((x - a.x) * dx + (y - a.y) * dy) / len2))
                const dist = Math.hypot(x - (a.x + t * dx), y - (a.y + t * dy))
                if (dist < bestDist) {
                    bestDist = dist
                    best = link
                }
            })
            return best
        },

        midpoint(a: string, b: string) {
            return { x: (at(a).x + at(b).x) / 2, y: (at(a).y + at(b).y) / 2 }
        },

        setLit(a: string, b: string, on: boolean) {
            const k = key(a, b)
            if (on) lit.add(k)
            else lit.delete(k)
            paintRails()
        },

        clearLit() {
            lit.clear()
            paintRails()
        },

        /** A dica do segundo erro: a ligação que resolve, piscando em verde. */
        async flashHint(link: Link) {
            const a = at(link.a)
            const b = at(link.b)
            const hint = scene.add.graphics().setDepth(DEPTH.links + 1)
            for (let i = 0; i < 3; i++) {
                hint.clear()
                hint.lineStyle(22, C.green, 1)
                dashed(hint, a, b, TRACK.dash, TRACK.gap)
                await FX.wait(scene, 260)
                hint.clear()
                await FX.wait(scene, 200)
            }
            hint.destroy()
        },

        destroy() {
            zones.forEach(z => z.destroy())
            clearTiles()
            ghosts.destroy()
            rails.destroy()
            knobs.destroy()
        },
    }
}

export type Network = ReturnType<typeof createNetwork>
