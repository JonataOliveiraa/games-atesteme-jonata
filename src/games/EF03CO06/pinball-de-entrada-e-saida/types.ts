/**
 * EF03CO06 — o computador se comunica com o mundo por aparelhos de entrada e saída.
 * A mesa é o computador por dentro; os aparelhos ficam do lado de fora, ligados por fios.
 * A bolinha é a informação: ENTRA pelo fio de um aparelho, passa pelo PROCESSADOR e SAI pelo fio de outro.
 */

export type DeviceId = 'keyboard' | 'mic' | 'camera' | 'speaker' | 'screen' | 'printer'
export type Row = 'input' | 'output'
export type ContentId = 'letters' | 'voice' | 'drawing' | 'music' | 'cartoon' | 'story' | 'invite' | 'name'
export type PoseId = 'ask' | 'happy' | 'sad' | 'listen' | 'look' | 'paper' | 'sing' | 'write' | 'show' | 'call'

export interface Device {
    id: DeviceId
    row: Row
    name: string
    /** com artigo: "o TECLADO" */
    art: string
}

export interface Mission {
    ask: string
    pose: PoseId
    input: DeviceId
    output: DeviceId
    carries: ContentId
    becomes: ContentId
    /** saídas na mesa nesta missão (padrão: as do nível) */
    outputs?: DeviceId[]
    /** balão de estreia antes do pedido */
    debut?: DeviceId
}

export interface LevelDef {
    level: number
    title: string
    message: string
    /** a Lily abre e fecha o nível; no meio, só o visor */
    hello: string
    bye: string
    inputs: DeviceId[]
    outputs: DeviceId[]
    descentMs: number
    missions: Mission[]
}

export type Mode = 'intro' | 'guide' | 'ask' | 'input' | 'send' | 'play' | 'choose' | 'result' | 'jam' | 'finale' | 'done' | 'panel'
