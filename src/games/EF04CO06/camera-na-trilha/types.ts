/**
 * EF04CO06 — usar ferramentas computacionais para criar conteúdo.
 * A criança cria fotos e vídeos com o app de câmera do tablet do Téo, e cada nível
 * traz um recurso: o modo (FOTO/VÍDEO), a LUZ e o ZOOM. O modo e os recursos ficam onde ela os deixou.
 */

export type Mode = 'photo' | 'video'
export type Tool = 'light' | 'zoom'
export type Show = 'detail' | 'whole'
export type SubjectId =
    | 'mushroom'
    | 'butterfly'
    | 'sunflower'
    | 'frog'
    | 'lake'
    | 'waterfall'
    | 'duck'
    | 'bluecrystal'
    | 'crystal'
    | 'drops'
    | 'glowmoss'
    | 'glowshroom'
    | 'cavefish'
    | 'fireflies'
    | 'stalagmite'
    | 'nest'
    | 'boulder'
    | 'ladybug'
    | 'bigtree'
    | 'ants'
    | 'anthill'
    | 'bee'
export type Motion = 'still' | 'hop' | 'flutter' | 'swim' | 'flow' | 'ripple' | 'drip' | 'blink' | 'march' | 'buzz'
export type MapId = 'prado' | 'gruta' | 'bosque'
export type Theme = 'meadow' | 'cave' | 'forest'
export type Pose = 'front' | 'back' | 'side' | 'frontUp' | 'backUp' | 'sideUp' | 'cheer' | 'oops'
export type PropKind = 'bigTree' | 'smallTree' | 'bush' | 'rock' | 'log' | 'reeds' | 'flowers' | 'lily' | 'caveRock' | 'gravel'
export type Fault = 'mode' | 'dark' | 'washed' | 'small' | 'cut'

export interface Vec {
    x: number
    y: number
}

export interface Rect {
    x: number
    y: number
    w: number
    h: number
}

export interface Circle {
    x: number
    y: number
    r: number
}

export interface Ellipse {
    x: number
    y: number
    rx: number
    ry: number
}

export interface SubjectDef {
    id: SubjectId
    name: string
    article: 'o' | 'a' | 'os' | 'as'
    motion: Motion
    size: number
    moving: string
    glows?: boolean
}

export interface Spot {
    subject: SubjectId
    at: Vec
    view: Vec
    face: Vec
    route?: Vec[]
    solid?: number
    size?: number
}

export interface Prop {
    kind: PropKind
    x: number
    y: number
    size?: number
    flip?: boolean
}

export interface MapDef {
    id: MapId
    theme: Theme
    w: number
    h: number
    start: Vec
    startFace: Vec
    lake?: Ellipse
    pool?: Circle
    cliff?: Circle
    river?: Vec[]
    riverW?: number
    pier?: { x: number; top: number; bottom: number; w: number; skew: number }
    ponds?: Ellipse[]
    walls?: Circle[]
    floor?: Ellipse[]
    trail: Vec[][]
    field?: Ellipse
    shade: Ellipse[]
    dark?: { alpha: number; areas?: Ellipse[] }
    lights?: Circle[]
    sparks?: Circle[]
    props: Prop[]
    spots: Spot[]
}

export interface Order {
    subject: SubjectId
    mode: Mode
    hint: string
    show?: Show
}

export interface Phase {
    orders: Order[]
}

export interface LevelDef {
    level: number
    title: string
    message: string
    map: MapId
    tools: Tool[]
    startMode: Mode
    demo: Order[]
    phases: Phase[]
}

export interface Capture {
    order: Order
    mode: Mode
    keys: string[]
}

export type State = 'intro' | 'guide' | 'play' | 'capture' | 'help' | 'error' | 'finale' | 'done'

