/**
 * EF04CO02 — objetos do mundo real representados por registros: cada componente identificado
 * por um nome. A etiqueta da carga é o registro; a placa manda separar por um campo, pelo nome.
 */

export type City =
    | 'Natal'
    | 'Recife'
    | 'Belém'
    | 'Manaus'
    | 'Salvador'
    | 'Maceió'
    | 'Palmas'
    | 'Cuiabá'
    | 'Vitória'
    | 'Aracaju'
    | 'Macapá'
    | 'Goiânia'

export type Field = 'name' | 'to' | 'from' | 'weight'

export type Rule = 'to' | 'from'

export interface Train {
    name: string
    to: City
    from: City
    weight?: number
    /** a ordem dos campos da etiqueta (de cima para baixo no N1, da esquerda para a direita no N2/N3) */
    order: Field[]
    /** a célula do caixote na folha `trens` (0–3) */
    crate: number
    /** a cor da locomotiva (0–2), sem relação com a cidade */
    color: number
}

/** N3: o recado do posto do carimbo — a etiqueta de um trem (achado pelo NOME) muda um campo */
export interface Note {
    name: string
    field: Rule
    value: City
}

export interface Phase {
    /** a cidade de cada galpão, na ordem dos galpões do mapa */
    stations: City[]
    /** a posição de cada alavanca no começo da fase */
    start: number[]
    rule: Rule
    /** N2: a partir deste trem a placa vira para o outro campo */
    flipAt?: number
    /** N3 */
    note?: Note
    trains: Train[]
}

export interface LevelDef {
    level: number
    title: string
    message: string
    phases: Phase[]
}

export type Mode = 'intro' | 'guide' | 'arrive' | 'choose' | 'stamp' | 'send' | 'jam' | 'finale' | 'done' | 'help'
