import { MISSIONS } from './missions'
import { TRACK_COLOR, minutesLabel } from './theme'
import type {
    CombineTask,
    MissionId,
    MissionResult,
    PartDef,
    PlanBlock,
    PlanTrace,
    ScoreCard,
    TrackId,
} from '../types'

export function partOf(mission: MissionId, id: string): PartDef {
    return MISSIONS[mission].parts[id]
}

export function partsOf(mission: MissionId, ids: string[]): PartDef[] {
    return ids.map(id => partOf(mission, id)).filter(Boolean)
}

export function trackOf(part: PartDef, tracks: TrackId[]): TrackId {
    if (part.track && tracks.includes(part.track)) return part.track
    return tracks[0]
}

export function trackTint(track: TrackId) {
    return TRACK_COLOR[track]
}

export function missingDep(mission: MissionId, order: string[]): { partId: string; needs: string } | undefined {
    const placed = new Set<string>()
    for (const id of order) {
        const part = partOf(mission, id)
        if (!part) continue
        const missing = part.needs.find(need => !placed.has(need))
        if (missing) return { partId: id, needs: missing }
        placed.add(id)
    }
    return undefined
}

export function canPlace(mission: MissionId, order: string[], candidate: string): boolean {
    const placed = new Set(order)
    const part = partOf(mission, candidate)
    if (!part) return false
    return part.needs.every(need => placed.has(need))
}

export function simulate(
    mission: MissionId,
    order: string[],
    tracks: TrackId[],
    reused: Set<string> = new Set(),
): PlanTrace {
    const broken = missingDep(mission, order)
    const laneFree = new Map<TrackId, number>()
    tracks.forEach(t => laneFree.set(t, 0))

    const finished = new Map<string, number>()
    const blocks: PlanBlock[] = []

    order.forEach(id => {
        const part = partOf(mission, id)
        if (!part) return

        const track = trackOf(part, tracks)
        const depEnd = part.needs.reduce((acc, need) => Math.max(acc, finished.get(need) ?? 0), 0)
        const start = Math.max(laneFree.get(track) ?? 0, depEnd)
        const minutes = reused.has(id) ? Math.max(1, Math.round(part.minutes * 0.5)) : part.minutes
        const end = start + minutes

        laneFree.set(track, end)
        finished.set(id, end)

        blocks.push({
            partId: id,
            label: part.label,
            track,
            start,
            end,
            minutes,
            reused: reused.has(id),
        })
    })

    const totalMinutes = blocks.reduce((acc, b) => Math.max(acc, b.end), 0)

    return {
        blocks,
        totalMinutes,
        bestMinutes: bestPlan(mission, order, tracks),
        valid: !broken,
        brokenDep: broken,
    }
}

export function bestPlan(mission: MissionId, ids: string[], tracks: TrackId[]): number {
    const pending = [...ids]
    const laneFree = new Map<TrackId, number>()
    tracks.forEach(t => laneFree.set(t, 0))
    const finished = new Map<string, number>()
    let guard = pending.length * 4

    while (pending.length && guard-- > 0) {
        const ready = pending.filter(id => {
            const part = partOf(mission, id)
            return part && part.needs.every(need => finished.has(need))
        })
        if (!ready.length) break

        ready.sort((a, b) => partOf(mission, b).minutes - partOf(mission, a).minutes)

        ready.forEach(id => {
            const part = partOf(mission, id)
            const track = trackOf(part, tracks)
            const depEnd = part.needs.reduce((acc, need) => Math.max(acc, finished.get(need) ?? 0), 0)
            const start = Math.max(laneFree.get(track) ?? 0, depEnd)
            const end = start + part.minutes
            laneFree.set(track, end)
            finished.set(id, end)
            pending.splice(pending.indexOf(id), 1)
        })
    }

    return Math.max(0, ...finished.values())
}

export function planLabel(trace: PlanTrace): string {
    if (!trace.valid) return 'Este plano ainda não roda.'
    return `Plano de ${minutesLabel(trace.totalMinutes)}.`
}

export function isEfficient(trace: PlanTrace, task: CombineTask): boolean {
    return trace.totalMinutes <= task.bestMinutes
}

export function isAcceptable(trace: PlanTrace, task: CombineTask): boolean {
    return trace.valid && trace.totalMinutes <= task.parMinutes
}

export function scoreMission(result: MissionResult, useReuse: boolean): ScoreCard {
    const completo = 1
    const limpo = result.wrongPicks + result.wrongOrder === 0
        ? 1
        : Math.max(0.25, 1 - (result.wrongPicks * 0.2 + result.wrongOrder * 0.15))

    const rapido = result.minutes <= 0
        ? 1
        : Math.min(1, result.bestMinutes / Math.max(result.bestMinutes, result.minutes))

    const reuso = useReuse ? Math.min(1, result.reusedCount / 2) : 0

    const parts = [
        `Você dividiu o pedido em partes menores`,
        `resolveu cada uma`,
        `e juntou tudo em ${minutesLabel(result.minutes)}`,
    ]

    return {
        completo,
        limpo,
        rapido,
        reuso,
        summary: `${parts.join(', ')}.`,
    }
}

export function stars(card: ScoreCard, useReuse: boolean): number {
    const keys: Array<keyof ScoreCard> = useReuse
        ? ['completo', 'limpo', 'rapido', 'reuso']
        : ['completo', 'limpo', 'rapido']
    const sum = keys.reduce((acc, k) => acc + (card[k] as number), 0)
    const avg = sum / keys.length
    return avg >= 0.92 ? 3 : avg >= 0.7 ? 2 : 1
}

export function orderExplains(mission: MissionId, order: string[]): string[] {
    return order.map((id, i) => {
        const part = partOf(mission, id)
        if (!part) return ''
        if (!part.needs.length) return `${i + 1}. ${part.label}: pode começar a qualquer hora.`
        const need = partOf(mission, part.needs[0])
        return `${i + 1}. ${part.label}: só depois de ${need?.label.toLowerCase() ?? part.needs[0]}.`
    }).filter(Boolean)
}