import { HOLE_ART, PLATFORM, SPRING } from '../data/layout'
import type { MapDef } from '../types'

export interface World {
    map: MapDef
    /** a altura do chão em x; null em cima de um buraco ou fora do mapa */
    groundAt(x: number): number | null
    /** dy/dx (positivo = desce para a direita) */
    slopeAt(x: number): number
    holeAt(x: number): number | null
    holeTop(i: number): number
    holeCenter(i: number): { x: number; y: number }
    deviceSpot(i: number): { x: number; y: number }
    springAt(x: number): number | null
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

    const holeTop = (i: number) => groundAt(map.holes[i].x0 - 0.5) ?? 560

    return {
        map,
        groundAt,
        slopeAt(x) {
            const s = segmentAt(x)
            if (!s || s.x1 === s.x0) return 0
            return (s.y1 - s.y0) / (s.x1 - s.x0)
        },
        holeAt(x) {
            const i = map.holes.findIndex(h => x > h.x0 && x < h.x1)
            return i < 0 ? null : i
        },
        holeTop,
        holeCenter: i => ({ x: (map.holes[i].x0 + map.holes[i].x1) / 2, y: holeTop(i) }),
        deviceSpot(i) {
            const top = holeTop(i)
            return { x: (map.holes[i].x0 + map.holes[i].x1) / 2, y: Math.max(HOLE_ART.deviceY, top + HOLE_ART.deviceMinDrop) }
        },
        springAt(x) {
            const i = map.springs.findIndex(s => Math.abs(x - s.x) <= SPRING.w / 2)
            return i < 0 ? null : i
        },
    }
}

export const platformTop = (p: { y: number }) => p.y - PLATFORM.h / 2
export const platformBottom = (p: { y: number }) => p.y + PLATFORM.h / 2
