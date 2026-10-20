/**
 * EF05CO06 — os dados podem ser guardados num dispositivo local ou remoto. Local é o que está
 * acoplado ao computador (o HD de dentro dele); remoto é o que sai dele: removível ou na internet.
 */

export type FileId = 'video' | 'foto' | 'musica' | 'trabalho'

export type DeviceId = 'hdInterno' | 'penDrive' | 'cartao' | 'hdExterno' | 'nuvem'

export type Kind = 'local' | 'remoto'

export type Point = [number, number]

/** um buraco no chão: a boca vai de x0 a x1 e o túnel desce até o dispositivo */
export interface HoleDef {
    x0: number
    x1: number
    device: Exclude<DeviceId, 'nuvem'>
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
    /** trechos do chão, da esquerda para a direita; entre dois trechos fica um buraco */
    ground: Point[][]
    holes: HoleDef[]
    platforms: PlatformDef[]
    springs: SpringDef[]
    clouds: CloudDef[]
}

/** alvo: `h0`, `h1`… para os buracos e `c0`, `c1`… para as nuvens */
export type TargetId = `h${number}` | `c${number}`

export interface Round {
    file: FileId
    want: Kind
    map: MapDef
}

export interface LevelDef {
    level: number
    title: string
    message: string
    rounds: Round[]
}

export type Mode = 'intro' | 'tour' | 'guide' | 'aim' | 'pan' | 'pull' | 'flight' | 'judge' | 'help' | 'error' | 'finale' | 'done'
