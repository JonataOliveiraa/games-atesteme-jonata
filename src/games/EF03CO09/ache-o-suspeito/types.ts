export type LevelNumber = 1 | 2 | 3

export type Owner = 'self' | 'peer'

export type Audience = 'teacher' | 'closed-group' | 'school-site' | 'public' | 'unknown'

export type DataKind =
    | 'address'
    | 'phone'
    | 'live-location'
    | 'school-routine'
    | 'vehicle-plate'
    | 'peer-image'
    | 'peer-story'
    | 'school-work'
    | 'preference'

/**
 * `horizontal` é vaivém em BLOCO: as placas mantêm a distância entre si.
 * `carousel` atravessa a tela e volta pela outra borda.
 *
 * O `vertical` que o §9 previa para o nível 3 não existe: lá as placas ficaram
 * camufladas e em carrossel, o que já pede mira e paciência sem precisar de uma
 * segunda direção de movimento.
 */
export type Movement = 'still' | 'horizontal' | 'carousel'

export interface TargetCard {
    id: string
    message: string
    destination: string
    owner: Owner
    audience: Audience
    kind: DataKind
    consent?: boolean
    note: string
}

export interface Wave {
    id: string
    movement: Movement
    cards: TargetCard[]
}

export interface LevelDef {
    level: LevelNumber
    /**
     * As placas entram cobertas e só mostram o conteúdo depois de levarem uma
     * bolinha. Acertar uma placa coberta REVELA e não julga — quem responde é
     * o segundo arremesso, naquela mesma placa já aberta.
     */
    covered?: boolean
    waves: Wave[]
}

export type Mode = 'intro' | 'choosing' | 'flying' | 'impact' | 'done'
