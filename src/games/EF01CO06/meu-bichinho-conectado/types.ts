export type Need =
    | 'hear_story'
    | 'call_grandma'
    | 'check_weather'
    | 'know_snack_time'
    | 'share_party_photos'

export type Artifact = 'speaker' | 'tablet' | 'phone' | 'watch'

export interface NeedDef {
    id: Need
    /** Quadro em `pedidos` (tira vertical, de cima para baixo). */
    frame: number
    /** Legenda de apoio. Nunca substitui o pictograma. */
    label: string
    /**
     * O que o bichinho pede, em voz dele.
     *
     * A legenda de uma palavra dizia o ASSUNTO ("História") e deixava a
     * decisão no ar. A fala diz o que ele quer FAZER ("Quero ouvir uma
     * história!") — e é o verbo que aponta o aparelho, sem entregar o nome
     * dele.
     */
    ask: string
}

export interface ArtifactDef {
    id: Artifact
    /** Mesmo índice em `artefato-repouso` e `artefato-uso`. */
    frame: number
    label: string
    color: number
}

export interface RequestDef {
    id: string
    need: Need
    /**
     * Pedido coletivo: os amiguinhos entram no tapete e a necessidade passa a
     * ser de todos. É a metade "coletiva" da habilidade, que um bichinho
     * sozinho na tela não consegue mostrar.
     */
    collective?: boolean
    /** Artefatos visíveis na prateleira, nesta rodada. */
    shelf: Artifact[]
    /**
     * A frase curta de cada escolha incompatível. Ela explica o vínculo que
     * faltou — "tente de novo" não ensina nada.
     */
    hints: Partial<Record<Artifact, string>>
}

export interface LevelConfig {
    level: number
    title: string
    message: string
    requests: RequestDef[]
}

export type NicheState = 'idle' | 'hover' | 'hint'

/** O selo de cada fase: a que já foi, a que está sendo jogada e as que faltam. */
export type StampState = 'done' | 'current' | 'empty'

export interface NicheView {
    def: ArtifactDef
    x: number
    y: number
    w: number
    h: number
    /** Tamanho do ícone no nicho. O voo até a cena escala a partir dele. */
    iconSize: number
    card: Phaser.GameObjects.Container
    bg: Phaser.GameObjects.Graphics
    icon: Phaser.GameObjects.Image
    label: Phaser.GameObjects.Text
    state: NicheState
}
