import type { Rule, RuleId, World } from '../types'

export const RULES: Record<RuleId, Rule> = {
    ovenLit: {
        id: 'ovenLit',
        kind: 'while',
        watch: 'oven',
        text: ['ENQUANTO o forno estiver ACESO', 'esteira LIGADA'],
        icon: 'flame',
        jam: 'O forno apagou: desligue!',
    },
    trayFull: {
        id: 'trayFull',
        kind: 'until',
        watch: 'tray',
        text: ['Esteira LIGADA', 'ATÉ a bandeja ter 6'],
        icon: 'tray',
        jam: 'A bandeja encheu: desligue!',
    },
    whistle: {
        id: 'whistle',
        kind: 'until',
        watch: 'whistle',
        text: ['Esteira LIGADA', 'ATÉ o apito do chef'],
        icon: 'whistle',
        jam: 'O chef apitou: desligue!',
    },
}

const watched = (rule: Rule, world: World) => {
    if (rule.watch === 'oven') return world.lit
    if (rule.watch === 'tray') return world.trayCount >= world.trayCap
    return world.whistled
}

export const running = (rule: Rule, world: World) => (rule.kind === 'while' ? watched(rule, world) : !watched(rule, world))
