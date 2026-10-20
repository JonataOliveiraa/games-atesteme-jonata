/**
 * EF05CO06 — os dados podem ser guardados num dispositivo local ou remoto. Local é o que está
 * acoplado ao computador (o HD de dentro dele); remoto é o que sai dele: removível ou na internet.
 */

export type FileId = 'video' | 'foto' | 'musica' | 'trabalho'

export type DeviceId = 'hdInterno' | 'penDrive' | 'cartao' | 'hdExterno' | 'nuvem'

export type Kind = 'local' | 'remoto'

/** o remoto se abre em dois: o que se tira do computador e o que mora na internet */
export type Place = 'local' | 'removivel' | 'internet'

/** N1 pede o tipo (LOCAL/REMOTO); N2 e N3 pedem o lugar */
export type Want = Kind | Place

/** cada nível num lugar: muda o céu, a textura do chão e a borda de cima dele */
export type Scenery = 'campo' | 'praia' | 'serra'

export type Point = [number, number]

/** um aparelho em pé na superfície: no chão em `x` ou em cima da tábua `on`; o arquivo que encosta nele é guardado */
export interface DeviceDef {
    x: number
    device: Exclude<DeviceId, 'nuvem'>
    on?: number
}

/** um buraco no chão (a boca vai de x0 a x1): o arquivo cai, percorre o túnel por baixo da terra e sai rolando em `exit` */
export interface TunnelDef {
    x0: number
    x1: number
    exit: number
}

/** tábua flutuante: o arquivo pousa, rola e cai pelas pontas */
export interface PlatformDef {
    x: number
    y: number
    w: number
}

/** mola no chão: quem cai nela é jogado para cima */
export interface SpringDef {
    x: number
}

export interface CloudDef {
    x: number
    y: number
    /** px para cada lado */
    sway: number
}

export interface MapDef {
    width: number
    /** trechos do chão, da esquerda para a direita; entre dois trechos fica a boca de um túnel */
    ground: Point[][]
    tunnels: TunnelDef[]
    devices: DeviceDef[]
    platforms: PlatformDef[]
    springs: SpringDef[]
    clouds: CloudDef[]
}

/** alvo: `d0`, `d1`… para os aparelhos da superfície e `c0`, `c1`… para as nuvens */
export type TargetId = `d${number}` | `c${number}`

export interface Round {
    file: FileId
    want: Want
    /** N3: o pedido é uma situação, sem a palavra do lugar */
    situation?: string
    /** N3: o porquê, na faixa do erro */
    why?: string
    map: MapDef
}

export interface LevelDef {
    level: number
    title: string
    message: string
    scenery: Scenery
    rounds: Round[]
}

export type Mode = 'intro' | 'tour' | 'guide' | 'aim' | 'pan' | 'pull' | 'flight' | 'tunnel' | 'judge' | 'help' | 'error' | 'finale' | 'done'
