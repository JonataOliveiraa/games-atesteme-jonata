export type DataKind = 'name' | 'photo' | 'address' | 'school' | 'phone'

export type TrustRole = 'trustedAdult' | 'unknownAdult' | 'appAvatar'

export interface CardDef {
    kind: DataKind
    /** Palavra curta de apoio. O pictograma é quem diz o que é o dado. */
    label: string
    /** A frase da abertura da fase: o que é este cartão. */
    intro: string
}

export interface PersonDef {
    role: TrustRole
    /** Quadro em `pessoas` (tira vertical, de cima para baixo). */
    frame: number
    /** Cor do boneco de Graphics, quando a textura não existe. */
    color: number
    /** O que ela pede no portão. É a conversa que abre a decisão. */
    ask: string
    askIcon: 'shield' | 'eye'
}

export interface PhaseDef {
    id: string
    card: DataKind
    /**
     * Quem espera no portão. A ordem aqui não é a da tela: os lados são
     * sorteados, senão a criança aprende "é sempre o da esquerda" em vez de
     * procurar o escudo.
     */
    gate: PersonId[]
}

export type PersonId = 'mother' | 'teacher' | 'curious' | 'avatar' | 'neighbor'

export interface LevelConfig {
    level: number
    title: string
    message: string
    /** Quantas paradas o percurso tem, sem contar a entrada. */
    hideouts: number
    /** Duração do caminho livre e do caminho com luz, em ms. */
    freeMs: number
    litMs: number
    phases: PhaseDef[]
}

/** O selo de cada fase: a que já foi, a que está sendo jogada e as que faltam. */
export type ShieldState = 'done' | 'current' | 'empty'

export type HideoutState = 'idle' | 'target' | 'blocked' | 'done'

export interface HideoutView {
    index: number
    x: number
    /** Brilho no chão, atrás da moita. */
    glow: Phaser.GameObjects.Graphics
    /** A moita: a textura quando existe, um desenho quando não. */
    body: Phaser.GameObjects.Image | Phaser.GameObjects.Graphics
    /** Seta de "toque aqui", na frente da moita. */
    arrow: Phaser.GameObjects.Graphics
    hit: Phaser.GameObjects.Zone
    state: HideoutState
}

export interface GateView {
    id: PersonId
    def: PersonDef
    x: number
    /** O tapete embaixo da pessoa: é ele que diz "esta é uma opção". */
    mat: Phaser.GameObjects.Graphics
    /** Sempre um container: dentro dele mora o sprite ou o boneco de Graphics. */
    sprite: Phaser.GameObjects.Container
    badge?: Phaser.GameObjects.Graphics
    /** O balão de fala dela. Troca de texto conforme a cena anda. */
    bubble?: Phaser.GameObjects.Container
    hit: Phaser.GameObjects.Zone
}
