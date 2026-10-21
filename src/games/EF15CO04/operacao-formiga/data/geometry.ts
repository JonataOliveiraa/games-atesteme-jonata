import type { Poly, Rect, Vec, Vertex } from '../types'

/**
 * A geometria do corte. Os pedaços são polígonos CONVEXOS: a fruta inteira é
 * convexa, e cortar um convexo por uma reta dá dois convexos. Por isso um
 * corte sempre dá exatamente dois pedaços, e "o traço atravessa o pedaço"
 * se resolve com dois pontos de entrada e saída.
 */

const EPS = 1e-6

export function area(poly: Poly): number {
    let s = 0
    for (let i = 0; i < poly.length; i++) {
        const p = poly[i]
        const q = poly[(i + 1) % poly.length]
        s += p.x * q.y - q.x * p.y
    }
    return Math.abs(s) / 2
}

export function centroid(poly: Poly): Vec {
    let cx = 0
    let cy = 0
    let s = 0
    for (let i = 0; i < poly.length; i++) {
        const p = poly[i]
        const q = poly[(i + 1) % poly.length]
        const k = p.x * q.y - q.x * p.y
        s += k
        cx += (p.x + q.x) * k
        cy += (p.y + q.y) * k
    }
    if (Math.abs(s) < EPS) {
        const n = poly.length || 1
        return { x: poly.reduce((a, p) => a + p.x, 0) / n, y: poly.reduce((a, p) => a + p.y, 0) / n }
    }
    return { x: cx / (3 * s), y: cy / (3 * s) }
}

export function bounds(poly: Poly): Rect {
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity
    poly.forEach(p => {
        minX = Math.min(minX, p.x)
        minY = Math.min(minY, p.y)
        maxX = Math.max(maxX, p.x)
        maxY = Math.max(maxY, p.y)
    })
    return { x: minX, y: minY, w: maxX - minX, h: maxY - minY }
}

const side = (a: Vec, b: Vec, p: Vec) => (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x)

export function contains(poly: Poly, p: Vec): boolean {
    let sign = 0
    for (let i = 0; i < poly.length; i++) {
        const s = side(poly[i], poly[(i + 1) % poly.length], p)
        if (Math.abs(s) < EPS) continue
        const now = s > 0 ? 1 : -1
        if (sign === 0) sign = now
        else if (sign !== now) return false
    }
    return true
}

export function isConvex(poly: Poly): boolean {
    let sign = 0
    for (let i = 0; i < poly.length; i++) {
        const a = poly[i]
        const b = poly[(i + 1) % poly.length]
        const c = poly[(i + 2) % poly.length]
        const s = side(a, b, c)
        if (Math.abs(s) < EPS) continue
        const now = s > 0 ? 1 : -1
        if (sign === 0) sign = now
        else if (sign !== now) return false
    }
    return true
}

const lerp = (p: Vec, q: Vec, t: number): Vec => ({ x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t })

function clean(poly: Poly): Poly {
    const out: Poly = []
    poly.forEach(v => {
        const last = out[out.length - 1]
        if (last && Math.hypot(last.x - v.x, last.y - v.y) < 0.01) {
            last.cut = last.cut && v.cut
            return
        }
        out.push(v)
    })
    while (out.length > 1 && Math.hypot(out[0].x - out[out.length - 1].x, out[0].y - out[out.length - 1].y) < 0.01) out.pop()
    return out
}

/**
 * Corta pela reta que passa por `a` e `b`. Devolve os dois lados, ou `null`
 * se a reta não separa o polígono. A aresta nova, ao longo da reta, sai
 * marcada como borda de corte nos dois pedaços.
 */
export function split(poly: Poly, a: Vec, b: Vec): [Poly, Poly] | null {
    const len = Math.hypot(b.x - a.x, b.y - a.y)
    if (len < EPS) return null
    const s = poly.map(p => {
        const v = side(a, b, p) / len
        return Math.abs(v) < 1e-4 ? 1e-4 : v
    })
    if (s.every(v => v > 0) || s.every(v => v < 0)) return null

    const left: Poly = []
    const right: Poly = []
    for (let i = 0; i < poly.length; i++) {
        const j = (i + 1) % poly.length
        const p = poly[i]
        const sp = s[i]
        const sq = s[j]
        if (sp > 0) left.push({ ...p })
        else right.push({ ...p })
        if ((sp > 0) === (sq > 0)) continue
        const at = lerp(p, poly[j], sp / (sp - sq))
        if (sp > 0) {
            // saindo da esquerda: lá, o ponto abre a aresta do corte; à direita, continua a aresta original
            left.push({ x: at.x, y: at.y, cut: true })
            right.push({ x: at.x, y: at.y, cut: p.cut })
        } else {
            left.push({ x: at.x, y: at.y, cut: p.cut })
            right.push({ x: at.x, y: at.y, cut: true })
        }
    }
    const l = clean(left)
    const r = clean(right)
    if (l.length < 3 || r.length < 3) return null
    return [l, r]
}

/**
 * O traço atravessa o polígono de ponta a ponta: começa e termina fora dele,
 * e a reta entra e sai do polígono entre as duas pontas do traço.
 */
export function crosses(poly: Poly, a: Vec, b: Vec): boolean {
    if (contains(poly, a) || contains(poly, b)) return false
    const len2 = (b.x - a.x) ** 2 + (b.y - a.y) ** 2
    if (len2 < EPS) return false
    let hits = 0
    for (let i = 0; i < poly.length; i++) {
        const p = poly[i]
        const q = poly[(i + 1) % poly.length]
        const sp = side(a, b, p)
        const sq = side(a, b, q)
        if ((sp > 0) === (sq > 0)) continue
        const at = lerp(p, q, sp / (sp - sq))
        const t = ((at.x - a.x) * (b.x - a.x) + (at.y - a.y) * (b.y - a.y)) / len2
        if (t <= 0 || t >= 1) return false
        hits += 1
    }
    return hits >= 2
}

export const translate = (poly: Poly, d: Vec): Poly => poly.map(v => ({ x: v.x + d.x, y: v.y + d.y, cut: v.cut }))

export const vertex = (x: number, y: number, cut = false): Vertex => ({ x, y, cut })
