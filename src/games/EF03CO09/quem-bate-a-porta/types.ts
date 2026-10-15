/**
 * EF03CO09 — o potencial impacto de compartilhar informações pessoais (ou dos colegas).
 * Dentro do tablet, cada contato é uma porta. Quem bate pede uma informação:
 * ENVIAR (entra pela porta e fica lá, ou é passada adiante) ou NÃO ENVIAR (fica com a criança).
 */

export type InfoId = 'address' | 'phone' | 'face' | 'trip' | 'drawing' | 'color' | 'nickname' | 'friendPhoto'
export type AskerId = 'grandma' | 'class' | 'school' | 'stranger'
export type DoorId = AskerId | 'davi'
export type Choice = 'send' | 'keep'
/** o que o botão faz: decidir, ou perguntar ao dono (N2) */
export type Action = Choice | 'ask'
export type PersonPose = 'ask' | 'happy' | 'sad'

export interface Request {
    asker: AskerId
    info: InfoId
    /** de quem é a informação, quando não é da Nina (N2) */
    owner?: 'davi'
    /** a seta mostra o botão certo até o toque (primeiras jogadas) */
    guided?: boolean
}

export interface LevelDef {
    level: number
    title: string
    message: string
    /** o objetivo do nível, no primeiro balão do tutorial */
    goal: string
    /** pedidos que o próprio jogo joga na demonstração */
    demo: Request[]
    requests: Request[]
    /** N3: abre com o APAGAR (uma informação enviada "ontem" que não volta) */
    erase?: InfoId
}

export type Mode = 'intro' | 'guide' | 'input' | 'act' | 'erase' | 'jam' | 'finale' | 'done' | 'panel'
