/**
 * EF04CO08: reconhecer a importância de verificar a confiabilidade das fontes
 * de informações obtidas na Internet. A notícia chega copiada; a criança segue
 * o rastro de site em site até onde ela começou e julga quem a escreveu.
 */

export type SiteId = 'jornal' | 'blog' | 'grupo' | 'canal' | 'perfil' | 'escola'

export type Rule = 'author' | 'date'

export type Verdict = 'trust' | 'distrust'

export type State = 'intro' | 'play' | 'look' | 'decide' | 'react' | 'help' | 'done' | 'finale'

export type HeroPose = 'idle' | 'look' | 'cheer' | 'oops'
export type LiaPose = 'idle' | 'phone' | 'happy' | 'oops'

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

export interface SiteDef {
    id: SiteId
    name: string
    address: string
    logo: number
    facade: number
    tone: number
    home: string
}

export interface Copy {
    site: SiteId
    headline: string
    from: SiteId
}

export interface Origin {
    site: SiteId
    headline: string
    author: string | null
    daysAgo?: number
}

export type Page = Copy | Origin

export interface CaseDef {
    id: string
    ask: string
    phone: { headline: string; from: SiteId }
    copies: Copy[]
    origin: Origin
    lia: { right: string; wrong: string }
    why: string
}

export interface LevelDef {
    level: number
    title: string
    message: string
    rule: Rule
    trail: number
    width: number
    zoom: number
    viewY: number
    start: number
    street: { site: SiteId; x: number }[]
    cases: CaseDef[]
}
