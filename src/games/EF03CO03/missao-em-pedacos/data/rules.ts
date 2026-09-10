import type { Item, Job, Station, Step, Task, Trip } from '../types'

export const TRIP_SLOTS = 4

export const jobOf = (task: Task, item: Item): Job =>
    task.jobs.find(job => job.id === item.jobId)!

/** O trabalho de uma viagem é o do primeiro item que entrou nela. */
export const tripJob = (trip: Trip) => (trip.length ? trip[0].jobId : null)

/**
 * O ÚNICO erro do corte: pôr num painel algo da outra metade.
 *
 * O painel tem dono desde o começo — ele leva o nome do grupo escrito na tarja.
 * Antes o dono era decidido pelo primeiro item que entrasse; com o nome na tela,
 * deixar isso implícito seria mentir para a criança.
 */
export const fits = (task: Task, tripIndex: number, item: Item) =>
    task.jobs[tripIndex]?.id === item.jobId

export const tripFull = (trip: Trip) => trip.length >= TRIP_SLOTS

/** Guarda: o item apanhado tem que ser um dos quatro desta viagem. */
export const belongsToRun = (trip: Trip, item: Item) =>
    trip.some(other => other.id === item.id)

export const itemsOfJob = (task: Task, jobId: string) =>
    task.items.filter(item => item.jobId === jobId)

export const runLocked = (trip: Trip, task: Task, doneJobs: Set<string>) => {
    const jobId = tripJob(trip)
    const job = task.jobs.find(other => other.id === jobId)
    return !!job?.requires && !doneJobs.has(job.requires)
}

/** O corte fecha quando todo item está num painel. */
export const planReady = (trips: Trip[], task: Task) =>
    trips.reduce((total, trip) => total + trip.length, 0) === task.items.length

/** Uma estação só abre depois das que ela exige. */
export const stationReady = (station: Station, done: Set<string>) =>
    (station.after ?? []).every(id => done.has(id))

/** E só é atendida com TODOS os itens dela na mão. */
export const stationFed = (station: Station, carried: Item[]) =>
    station.needs.every(id => carried.some(item => item.id === id))

/** A tarefa com estação não tem fase final: a receita acontece na viagem. */
export const hasStations = (task: Task) => task.jobs.some(job => !!job.stations?.length)

/** Na fase final, um passo só pode acontecer depois dos que ele exige. */
export const stepReady = (step: Step, done: Set<string>) =>
    (step.after ?? []).every(id => done.has(id))

/** O chão de um mapa, em pedaços, já com os buracos abertos. */
export const groundSegments = (length: number, gaps: { x: number; w: number }[]) => {
    const sorted = [...gaps].sort((a, b) => a.x - b.x)
    const parts: { x: number; w: number }[] = []
    let cursor = 0
    sorted.forEach(gap => {
        if (gap.x > cursor) parts.push({ x: cursor, w: gap.x - cursor })
        cursor = gap.x + gap.w
    })
    if (cursor < length) parts.push({ x: cursor, w: length - cursor })
    return parts
}
