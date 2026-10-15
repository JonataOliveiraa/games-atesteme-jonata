/**
 * EF03CO06 — o computador se comunica com o mundo por aparelhos de entrada e saída.
 * O computador fica no meio; os aparelhos ficam ligados nas portas dele.
 * N1: a informação ENTRA pelo aparelho que pega aquele tipo.
 * N2: a informação SAI pelo aparelho que dá o que a pessoa pediu.
 * N3: a mesma informação entra e sai.
 */

export type DeviceId = 'keyboard' | 'mic' | 'camera' | 'speaker' | 'screen' | 'printer'
export type Side = 'input' | 'output'
export type InfoId = 'note' | 'photo' | 'letter'
export type InfoPose = 'walkA' | 'walkB' | 'happy' | 'dizzy'
export type PersonId = 'grandma' | 'theo' | 'teacher'
export type PersonPose = 'wait' | 'happy' | 'confused'
export type Wish = 'hear' | 'see' | 'paper'
/** o assunto do nível: só entrada, só saída ou as duas */
export type LevelKind = 'in' | 'out' | 'both'

export interface Device {
    id: DeviceId
    side: Side
    name: string
    /** com artigo: "o MICROFONE" */
    art: string
}

export interface Mission {
    info: InfoId
    /** quem recebe a informação (N2, N3) */
    person?: PersonId
    wish?: Wish
    /** primeira vez deste tipo (N1) ou deste pedido (N2): a seta mostra o aparelho */
    guided?: boolean
    /** o aparelho novo aparece nesta missão */
    debut?: DeviceId
}

export interface LevelDef {
    level: number
    kind: LevelKind
    title: string
    message: string
    /** o objetivo do nível, no primeiro balão do tutorial */
    goal: string
    /** aparelhos acesos desde o começo; os de `debut` aparecem depois */
    doors: DeviceId[]
    /** aparelhos que aparecem apagados, só para mostrar o computador inteiro */
    dim?: DeviceId[]
    missions: Mission[]
}

export type Mode = 'intro' | 'guide' | 'input' | 'send' | 'result' | 'jam' | 'finale' | 'done' | 'panel'
