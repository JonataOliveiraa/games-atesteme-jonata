/**
 * EF05CO05: identificar os componentes principais de um computador. Todo plugue
 * é igual, então a tomada certa (ENTRADA, SAÍDA ou ARMAZENAMENTO) só se acha
 * pela função do aparelho. O processador fica no meio, e tudo passa por ele.
 */

export type Kind = 'entrada' | 'saida' | 'armazenamento' | 'memoria'

export type DeviceId =
    | 'teclado'
    | 'mouse'
    | 'microfone'
    | 'camera'
    | 'monitor'
    | 'altofalante'
    | 'pendrive'
    | 'memoria'
    | 'hub'
    | 'cartao'

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
    /** Para dizer "do MONITOR" ou "da CÂMERA". */
    gender: 'o' | 'a'
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
    /** Onde cada aparelho do pedido aparece no mapa. Só eles aparecem. */
    place: Partial<Record<DeviceId, Vec>>
    /** As tomadas dos aparelhos (o monitor que leva o alto-falante) valem neste pedido. */
    nested?: boolean
    /** Aparelhos que só entram na mesa quando os outros já estão ligados. */
    later?: DeviceId[]
    /** Aparelhos que ficam na mesa sem que o pedido precise deles. */
    extra?: DeviceId[]
    /** A novidade que este pedido estreia, com demonstração curta. */
    teach?: MissionTeach
    /** O resumo do caminho, mostrado em letras grandes quando o pedido é cumprido. */
    done: string
}

export type MissionTeach = 'memoria' | 'hub' | 'cartao'

export interface LevelDef {
    level: number
    title: string
    message: string
    pc: SocketDef[]
    /** Os aparelhos trazem as tomadas próprias. Cada pedido diz se elas valem (`MissionDef.nested`). */
    nested: boolean
    /** Entre um pedido e outro os cabos se soltam e a mesa começa vazia. */
    reset: boolean
    /** As tomadas trazem o nome escrito; sem isso, só o ícone. */
    plates: boolean
    missions: MissionDef[]
}
