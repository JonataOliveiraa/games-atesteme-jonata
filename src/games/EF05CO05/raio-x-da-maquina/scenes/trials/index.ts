import { cameraTrial, keyboardTrial } from './input'
import { chipTrial, memoryTrial } from './process'
import { diskTrial, stickTrial } from './store'
import { screenTrial, speakerTrial } from './output'
import { powerTrial } from './power'
import type { TrialDef } from './stage'

export { runTrial } from './stage'
export type { TrialCtx, TrialDef } from './stage'
export { powerTrial }

/**
 * Um desafio por PEÇA, e não por categoria: guardar num baú e levar no bolso
 * são a mesma função com gestos diferentes, e é a diferença que fixa o nome.
 */
export const TRIALS: Record<string, TrialDef> = {
    teclado: keyboardTrial,
    camera: cameraTrial,

    chip: chipTrial,
    pente: memoryTrial,

    disco: diskTrial,
    pendrive: stickTrial,

    tela: screenTrial,
    altofalante: speakerTrial,
}

export function trialFor(partId: string): TrialDef | undefined {
    return TRIALS[partId]
}

export function hasTrial(partId: string): boolean {
    return partId in TRIALS
}
