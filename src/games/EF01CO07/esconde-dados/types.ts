import type { Talk } from './scenes/talk'

export type DataKind = 'name' | 'photo' | 'address' | 'school' | 'phone'

export type TrustRole = 'trustedAdult' | 'unknownAdult' | 'appAvatar'

export interface CardDef {
    kind: DataKind
    /** Palavra curta de apoio. O pictograma é quem diz o que é o dado. */
    label: string
    /** A frase da abertura da fase: o que é este cartão. */
    intro: string
    /**
     * O estrago, quando o cartão vai para a pessoa errada: diz QUAL dado foi
     * embora, e não um "errou" genérico.
     */
    lost: string
}

export interface PersonDef {
    role: TrustRole
    /** Quadro em `pessoas` (tira vertical, de cima para baixo). */
    frame: number
    /** Cor do boneco de Graphics, quando a textura não existe. */
    color: number
    /**
     * O pedido do avatar no caminho (nível 3). No portão quem fala é a FASE
     * (`PhaseDef.talk`), porque a mesma pessoa pede de um jeito rude no nível 1
     * e de um jeito doce no nível 2.
     */
    ask?: string
    askIcon?: 'shield' | 'eye'
}

export interface PhaseDef {
    id: string
    card: DataKind
    /**
     * Quem espera no portão. A ordem aqui não é a da tela: os lados são
     * sorteados, senão a criança aprende "é sempre o da esquerda" em vez de
     * ouvir quem está falando.
     */
    gate: PersonId[]
    /**
     * O que cada pessoa do portão diz. É A PISTA DA FASE.
     *
     * Não há escudo nem cor que diga quem é quem: quem cuida chama a criança
     * pelo que ela é para ele ("Oi, filho!", "Oi, meu aluno!"); quem não cuida
     * só quer o cartão. `validateLevels` confere as duas metades da regra.
     */
    talk: Partial<Record<PersonId, string>>
    /**
     * Quem para a criança NO CAMINHO, antes do portão.
     *
     * É o pedido que não vem de uma pessoa na sua frente e sim de dentro de um
     * aparelho: o avatar de um app oferecendo figurinha pelo cartão. Recusar e
     * seguir é a resposta — e recusar aqui não é o mesmo gesto que escolher no
     * portão, porque não há ninguém certo para tocar.
     */
    intercept?: PersonId
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
    /**
     * Quantos curiosos rondam a pracinha. Com dois, eles se alternam: cada
     * janela de luz nasce de um lado diferente, e esperar "a lanterna virar"
     * deixa de ser um relógio e passa a ser olhar quem está de vez.
     */
    watchers: 1 | 2
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
    /** A fala do pedido, que espera o Próximo e fica na tela para ser relida. */
    talk?: Talk
    /** O balão curto de reação ("Deixa comigo!", "Valeu! Tchau!"). */
    bubble?: Phaser.GameObjects.Container
    hit: Phaser.GameObjects.Zone
}
