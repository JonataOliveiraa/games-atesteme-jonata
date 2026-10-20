import { BALL, DEVICE_BOX, DEVICE_H, PLATFORM, SPRING, TUNNEL_PATH } from '../data/layout'
import type { MapDef } from '../types'

export interface Box {
    x: number
    y: number
    w: number
    h: number
}

export interface World {
    map: MapDef
    /** a altura do chão em x; null em cima da boca de um túnel ou fora do mapa */
    groundAt(x: number): number | null
    /** dy/dx (positivo = desce para a direita) */
    slopeAt(x: number): number
    tunnelAt(x: number): number | null
    tunnelTop(i: number): number
    /** da boca (centro) descendo, andando por baixo da terra, subindo até a saída na superfície */
    tunnelPath(i: number): Array<{ x: number; y: number }>
    /** o arquivo sai da boca de saída com um pulinho para a frente */
    exitLaunch(i: number): { x: number; y: number; vx: number; vy: number }
    /** a base do aparelho: no chão ou em cima da tábua */
    deviceBase(i: number): { x: number; y: number }
    /** centro e tamanho da área de acerto, em pé na superfície */
    deviceBox(i: number): Box
    springAt(x: number): number | null
}

export const platformTop = (p: { y: number }) => p.y - PLATFORM.h / 2
export const platformBottom = (p: { y: number }) => p.y + PLATFORM.h / 2

/** arredonda as quinas de um caminho com pontos a cada `step` px */
function smooth(points: Array<[number, number]>, corner: number, straight: number, step: number) {
    const out: Array<{ x: number; y: number }> = []
    const push = (x: number, y: number) => {
        const last = out[out.length - 1]
        if (!last || Math.hypot(last.x - x, last.y - y) > 0.5) out.push({ x, y })
    }
    const line = (ax: number, ay: number, bx: number, by: number) => {
        const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / step))
        for (let j = 0; j <= n; j++) push(ax + ((bx - ax) * j) / n, ay + ((by - ay) * j) / n)
    }
    let [cx, cy] = points[0]
    for (let i = 1; i < points.length - 1; i++) {
        const [px, py] = points[i]
        const [nx, ny] = points[i + 1]
        const inLen = Math.hypot(px - cx, py - cy)
        const outLen = Math.hypot(nx - px, ny - py)
        const first = i === 1
        const last = i === points.length - 2
        const r = Math.max(0, Math.min(corner, first ? inLen - straight : inLen / 2, last ? outLen - straight : outLen / 2))
        const ax = px + ((cx - px) / inLen) * r
        const ay = py + ((cy - py) / inLen) * r
        const bx = px + ((nx - px) / outLen) * r
        const by = py + ((ny - py) / outLen) * r
        line(cx, cy, ax, ay)
        const n = Math.max(2, Math.ceil((r * 1.6) / step))
        for (let j = 1; j <= n; j++) {
            const t = j / n
            const u = 1 - t
            push(u * u * ax + 2 * u * t * px + t * t * bx, u * u * ay + 2 * u * t * py + t * t * by)
        }
        cx = bx
        cy = by
    }
    const [ex, ey] = points[points.length - 1]
    line(cx, cy, ex, ey)
    return out
}

export function createWorld(map: MapDef): World {
    const segmentAt = (x: number) => {
        for (const line of map.ground) {
            if (x < line[0][0] || x > line[line.length - 1][0]) continue
            for (let i = 0; i < line.length - 1; i++) {
                const [x0, y0] = line[i]
                const [x1, y1] = line[i + 1]
                if (x >= x0 && x <= x1) return { x0, y0, x1, y1 }
            }
        }
        return null
    }

    const groundAt = (x: number) => {
        const s = segmentAt(x)
        if (!s) return null
        const t = s.x1 === s.x0 ? 0 : (x - s.x0) / (s.x1 - s.x0)
        return s.y0 + (s.y1 - s.y0) * t
    }

    const tunnelTop = (i: number) => groundAt(map.tunnels[i].x0 - 0.5) ?? 560

    const paths = map.tunnels.map((t, i) => {
        const cx = (t.x0 + t.x1) / 2
        const top = tunnelTop(i)
        const exitY = groundAt(t.exit) ?? top
        const from = Math.min(t.x0, t.exit)
        const to = Math.max(t.x1, t.exit)
        let highest = 0
        for (let x = from; x <= to; x += 4) highest = Math.max(highest, groundAt(x) ?? 0)
        const depth = Math.min(TUNNEL_PATH.maxY, highest + TUNNEL_PATH.cover + ((t.x1 - t.x0) * TUNNEL_PATH.width) / 2)
        return smooth(
            [
                [cx, top],
                [cx, depth],
                [t.exit, depth],
                [t.exit, exitY],
            ],
            TUNNEL_PATH.corner,
            TUNNEL_PATH.straight,
            TUNNEL_PATH.step,
        )
    })

    const deviceBase = (i: number) => {
        const d = map.devices[i]
        if (d.on !== undefined) return { x: d.x, y: platformTop(map.platforms[d.on]) }
        return { x: d.x, y: groundAt(d.x) ?? 560 }
    }

    return {
        map,
        groundAt,
        slopeAt(x) {
            const s = segmentAt(x)
            if (!s || s.x1 === s.x0) return 0
            return (s.y1 - s.y0) / (s.x1 - s.x0)
        },
        tunnelAt(x) {
            const i = map.tunnels.findIndex(t => x > t.x0 && x < t.x1)
            return i < 0 ? null : i
        },
        tunnelTop,
        tunnelPath: i => paths[i],
        exitLaunch(i) {
            const t = map.tunnels[i]
            const dir = t.exit >= (t.x0 + t.x1) / 2 ? 1 : -1
            const ground = groundAt(t.exit) ?? tunnelTop(i)
            return { x: t.exit, y: ground - BALL.r - 2, vx: dir * TUNNEL_PATH.hop.vx, vy: TUNNEL_PATH.hop.vy }
        },
        deviceBase,
        deviceBox(i) {
            const base = deviceBase(i)
            const h = Math.max(DEVICE_BOX.minH, DEVICE_H[map.devices[i].device] + DEVICE_BOX.pad)
            return { x: base.x, y: base.y - h / 2, w: DEVICE_BOX.w, h }
        },
        springAt(x) {
            const i = map.springs.findIndex(s => Math.abs(x - s.x) <= SPRING.w / 2)
            return i < 0 ? null : i
        },
    }
}
