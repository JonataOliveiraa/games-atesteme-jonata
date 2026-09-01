export interface SecurityItem {
    id: string
    label: string
    iconKey: string
    shouldBeOn: boolean
    why: string
}

export interface RoundItemState {
    itemId: string
    initialOn: boolean
}

export interface DelayedRiskItem extends RoundItemState {
    appearAfterMs: number
    alertText: string
}

export interface ChecklistRound {
    id: string
    question: string
    hint: string
    items: RoundItemState[]
    delayedItem?: DelayedRiskItem
}

export interface LevelConfig {
    level: 1 | 2 | 3
    timeLimit: number
    rounds: ChecklistRound[]
    title: string
    objective: string
    tip: string
}

export interface GameSceneData {
    /** Saldo de vidas que atravessa a troca de nível. */
    lives?: number
    level?: number
    round?: number
    score?: number
    hits?: number
    errors?: number
}