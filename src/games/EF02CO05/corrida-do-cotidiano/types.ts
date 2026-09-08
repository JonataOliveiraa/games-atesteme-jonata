export type LevelNumber = 1 | 2 | 3

export type TechId =
    | 'relogio'
    | 'geladeira'
    | 'caixinha'
    | 'televisao'
    | 'microondas'
    | 'maquina-de-lavar'
    | 'telefone'
    | 'camera'
    | 'computador'
    | 'liquidificador'
    | 'ventilador'
    | 'vassoura'

export type SituationId =
    | 'horas'
    | 'gelar'
    | 'musica'
    | 'desenho'
    | 'leite'
    | 'roupa'
    | 'vo'
    | 'foto'
    | 'bolo'
    | 'recreio'
    | 'merenda'
    | 'marmita'
    | 'chamada'
    | 'festa'
    | 'aviso'
    | 'planetas'
    | 'mural'
    | 'uniforme'
    | 'suco'
    | 'calor'
    | 'folhas'
    | 'gelo'
    | 'pipoca'
    | 'aniversario'
    | 'jornal'
    | 'recado'
    | 'lencol'

export interface Tech {
    id: TechId
    label: string
    frame: number
    use: string
}

export interface Situation {
    id: SituationId
    prompt: string
    options: [TechId, TechId]
}

export interface PhaseDef {
    situations: SituationId[]
    speed: number
}

export interface Mood {
    sky: number
    skyLow: number
    hill: number
    sun: number
    ground?: number
    /** Véu branco sobre a grama: quanto mais alto, mais neve no chão. */
    frost?: number
    /** Neve caindo, rajadas de vento e rastro permanente no corredor. */
    wild?: boolean
}

export interface LevelDef {
    level: LevelNumber
    name: string
    place: string
    mood: Mood
    phases: PhaseDef[]
}

export type Lane = 0 | 1

export type Mode = 'intro' | 'running' | 'tutorial' | 'blocked' | 'done'
