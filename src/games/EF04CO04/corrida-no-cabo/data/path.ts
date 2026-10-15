/**
 * Dois caminhos com a mesma forma. Na mesa, o fio fino passa pelos pontos da fase (Catmull-Rom). Na
 * corrida, o mesmo fio esticado: o comprimento dele vira o x, e a altura vira a altura do tubo.
 * Os dois são reamostrados em passos iguais de comprimento, que é a régua da corrida (s).
 */

export interface Point {
    x: number
    y: number
}

export interface Path {
    xs: number[]
    ys: number[]
    step: number
    length: number
}

export interface Pose {
    x: number
    y: number
    /** radianos */
    angle: number
}

function catmull(points: Point[], per = 24): Point[] {
    const p = [points[0], ...points, points[points.length - 1]]
    const out: Point[] = []
    for (let i = 1; i < p.length - 2; i++) {
        for (let k = 0; k < per; k++) {
            const t = k / per
            const t2 = t * t
            const t3 = t2 * t
            const f = (a: number, b: number, c: number, d: number) =>
                0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3)
            out.push({ x: f(p[i - 1].x, p[i].x, p[i + 1].x, p[i + 2].x), y: f(p[i - 1].y, p[i].y, p[i + 1].y, p[i + 2].y) })
        }
    }
    out.push(points[points.length - 1])
    return out
}

function resample(pts: Point[], step: number): Path {
    const xs: number[] = [pts[0].x]
    const ys: number[] = [pts[0].y]
    let walked = 0
    let next = step
    for (let i = 1; i < pts.length; i++) {
        const seg = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y)
        while (seg > 0 && walked + seg >= next) {
            const k = (next - walked) / seg
            xs.push(pts[i - 1].x + (pts[i].x - pts[i - 1].x) * k)
            ys.push(pts[i - 1].y + (pts[i].y - pts[i - 1].y) * k)
            next += step
        }
        walked += seg
    }
    const last = pts[pts.length - 1]
    if (Math.hypot(last.x - xs[xs.length - 1], last.y - ys[ys.length - 1]) > step * 0.25) {
        xs.push(last.x)
        ys.push(last.y)
    }
    return { xs, ys, step, length: walked }
}

function smooth(ys: number[], w: number, passes: number, keep: number) {
    let out = ys
    for (let p = 0; p < passes; p++) {
        out = out.map((y, i) => {
            if (i < keep || i >= out.length - keep) return y
            const r = Math.min(w, i, out.length - 1 - i)
            let sum = 0
            for (let j = i - r; j <= i + r; j++) sum += out[j]
            return sum / (2 * r + 1)
        })
    }
    return out
}

/** o fio da mesa, do notebook ao computador */
export function deskCurve(from: Point, shape: Point[], to: Point): Path {
    return resample(catmull([from, ...shape, to]), 2)
}

/**
 * O fio da corrida: o pedaço do fio da mesa que vai de `from` (fração do comprimento) até o fim,
 * esticado em `span` px, com um trecho reto de `lead` px antes (o fio atrás do carrinho).
 */
export function playPath(desk: Path, opts: { from: number; span: number; lead: number; top: number; bottom: number; step: number }): Path {
    const a0 = Math.floor((opts.from * desk.length) / desk.step)
    const n = desk.xs.length - 1
    const ys = desk.ys.slice(a0)
    const min = Math.min(...ys)
    const max = Math.max(...ys)
    const range = max - min || 1
    const pts: Point[] = []
    const leadSteps = Math.round(opts.lead / 10)
    const y0 = opts.top + ((desk.ys[a0] - min) / range) * (opts.bottom - opts.top)
    for (let i = 0; i < leadSteps; i++) pts.push({ x: -opts.lead + i * 10, y: y0 })
    for (let i = a0; i <= n; i++) {
        const k = (i - a0) / (n - a0)
        pts.push({ x: k * opts.span, y: opts.top + ((desk.ys[i] - min) / range) * (opts.bottom - opts.top) })
    }
    const sy = smooth(
        pts.map(p => p.y),
        14,
        3,
        2,
    )
    return resample(
        pts.map((p, i) => ({ x: p.x, y: sy[i] })),
        opts.step,
    )
}

export function poseAt(path: Path, s: number): Pose {
    const last = path.xs.length - 1
    const f = Math.min(last, Math.max(0, s / path.step))
    const i = Math.min(last - 1, Math.floor(f))
    const k = f - i
    const x = path.xs[i] + (path.xs[i + 1] - path.xs[i]) * k
    const y = path.ys[i] + (path.ys[i + 1] - path.ys[i]) * k
    const a = Math.max(0, i - 3)
    const b = Math.min(last, i + 4)
    const angle = Math.atan2(path.ys[b] - path.ys[a], path.xs[b] - path.xs[a])
    return { x, y, angle }
}

/** o ponto deslocado para fora do eixo do fio: positivo = para o lado de cima */
export function offsetAt(pose: Pose, up: number): Point {
    return { x: pose.x + Math.sin(pose.angle) * up, y: pose.y - Math.cos(pose.angle) * up }
}

/** o menor raio de curva do caminho, para o tubo não dobrar por dentro */
export function tightestRadius(path: Path): number {
    let min = Infinity
    for (let i = 4; i < path.xs.length - 4; i++) {
        const a1 = Math.atan2(path.ys[i] - path.ys[i - 4], path.xs[i] - path.xs[i - 4])
        const a2 = Math.atan2(path.ys[i + 4] - path.ys[i], path.xs[i + 4] - path.xs[i])
        const turn = Math.abs(a2 - a1)
        if (turn > 1e-4) min = Math.min(min, (4 * path.step) / turn)
    }
    return min
}
