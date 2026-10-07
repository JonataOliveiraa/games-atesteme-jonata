/**
 * EF03CO06 — o computador se comunica com o mundo por aparelhos de entrada e saída.
 * O computador fica no meio; os aparelhos de entrada ficam ligados nas portas dele.
 * As informações chegam do mundo lá fora e só entram pelo aparelho que pega aquele tipo.
 */

export type DeviceId = 'keyboard' | 'mic' | 'camera' | 'speaker' | 'screen' | 'printer'
export type Side = 'input' | 'output'
export type InfoId = 'note' | 'photo' | 'letter'
export type InfoPose = 'walkA' | 'walkB' | 'happy' | 'dizzy'
export type PoseId = 'ask' | 'happy' | 'sad' | 'listen' | 'look' | 'paper' | 'sing' | 'write' | 'show' | 'call'

export interface Device {
    id: DeviceId
    side: Side
    name: string
    /** com artigo: "o MICROFONE" */
    art: string
}

export interface Mission {
    info: InfoId
    /** primeira vez deste tipo: o balão mostra a porta certa */
    guided?: boolean
    /** a porta nova aparece nesta missão */
    debut?: DeviceId
}

export interface LevelDef {
    level: number
    title: string
    message: string
    hello: string
    bye: string
    /** portas desde o começo; as de `debut` aparecem depois */
    doors: DeviceId[]
    missions: Mission[]
}

export type Mode = 'intro' | 'guide' | 'input' | 'send' | 'result' | 'jam' | 'finale' | 'done' | 'panel'
