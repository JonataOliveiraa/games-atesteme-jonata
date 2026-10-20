import type { EraDef, FishKind, Gadget, Outcome, Sent, Target, Tool } from '../types'

export const REACH: Record<Tool, { deep: boolean; dark: boolean }> = {
    lanca: { deep: false, dark: false },
    vara: { deep: true, dark: false },
    sonar: { deep: true, dark: true },
}

export const has = (era: EraDef, fish: FishKind) => (fish === 'small' ? era.small > 0 : fish === 'big' ? era.big : era.school)

export function fishOutcome(tool: Tool, era: EraDef, fish: FishKind, night: boolean): Outcome {
    if (night && !REACH[tool].dark) return 'dark'
    if (!has(era, fish)) return 'gone'
    if (fish === 'big' && !REACH[tool].deep) return 'reach'
    return 'ok'
}

export function sendOutcome(gadget: Gadget, to: Target, busy: boolean, twist: boolean): Sent {
    if (to === 'mercado' && (gadget === 'buzio' || gadget === 'voz')) return 'far'
    if (to === 'mercado' && gadget === 'telefone' && busy) return 'busy'
    if (to === 'vila' && gadget === 'audio' && twist) return 'nophone'
    return 'ok'
}
