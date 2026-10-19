/**
 * EF05CO05: identificar os componentes principais de um computador. Todo plugue
 * é igual, então a tomada certa (ENTRADA, SAÍDA ou ARMAZENAMENTO) só se acha
 * pela função do aparelho. O processador fica no meio, e tudo passa por ele.
 */

export type Kind = 'entrada' | 'saida' | 'armazenamento'

export type DeviceId = 'teclado' | 'mouse' | 'microfone' | 'camera' | 'monitor' | 'altofalante' | 'pendrive'

/** O que um aparelho manda quando funciona. */
export type Payload = 'texto' | 'cursor' | 'foto' | 'voz' | 'musica'

export type State = 'intro' | 'play' | 'drag' | 'flow' | 'error' | 'help' | 'done' | 'finale'

/** Dono de uma tomada: o computador ou um aparelho que leva mais cabos. */
export type Owner = 'pc' | DeviceId

export interface Vec {
    x: number
    y: number
}

/** Centro e tamanho, como o `spot` do tutorial espera. */
export interface Rect {
    x: number
    y: number
    w: number
    h: number
}

export interface SocketDef {
    id: string
    kind: Kind
    /** Relativo ao centro do dono. */
    at: Vec
}

export interface DeviceDef {
    id: DeviceId
    name: string
    kind: Kind
    cell: number
    at: Vec
    /** Tamanho na tela; o padrão é DEVICE.size. */
    size?: number
    /** O que ele manda ao ser tocado, ligado. */
    sends?: Payload
    /** O que ele recebe e mostra, toca ou guarda. */
    takes?: Payload[]
    /** Tomadas próprias: o aparelho leva mais cabos. */
    sockets?: SocketDef[]
    /** A frase do erro: a função dele, em palavra de criança. */
    why: string
}

export interface MissionDef {
    id: string
    ask: string
    /** Aparelhos que precisam estar ligados. */
    needs: DeviceId[]
    /** O aparelho que se toca para cumprir. */
    use: DeviceId
    /** Onde a informação precisa chegar. */
    goal: { payload: Payload; at: DeviceId }
    /** Aparelhos que acordam neste pedido. */
    wake?: DeviceId[]
    done: string
}

export interface LevelDef {
    level: number
    title: string
    message: string
    pc: SocketDef[]
    devices: DeviceId[]
    /** Dormem até um pedido acordá-los. */
    asleep: DeviceId[]
    missions: MissionDef[]
}
