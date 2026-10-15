import type { SubjectDef } from '../types'

export const MODE_LABEL = { photo: 'FOTO', video: 'VÍDEO' } as const
export const TOOL_LABEL = { light: 'LUZ', zoom: 'ZOOM' } as const

export const TEACH = {
    hello: 'Oi! Eu sou o Téo.',
    fair: 'Fotos e vídeos para a Feira!',
    read: 'Leia o pedido.',
    photo: 'FOTO: um instante.',
    toVideo: 'Troque para VÍDEO.',
    video: 'VÍDEO: o movimento.',
    walk: 'Ande com o joystick ou WASD.',
    check: 'Confira o modo!',
}

export const TEACH2 = {
    dark: 'Na gruta é escuro.',
    black: 'Ficou preto!',
    lit: 'Com LUZ, aparece!',
    key: 'LUZ: toque ou tecla L.',
    glow: 'Este brilha sozinho.',
    washed: 'Com LUZ, o brilho some!',
    shine: 'Sem LUZ, ele brilha!',
}

export const TEACH3 = {
    small: 'Coisa pequenininha?',
    tiny: 'Ficou pequenininho!',
    close: 'Com ZOOM, de perto!',
    big: 'E coisa grande?',
    cut: 'Cortou!',
    whole: 'Grande? Sem ZOOM.',
    key: 'ZOOM: toque ou tecla Z.',
}

export const HELP = {
    order: 'Leia o pedido.',
    frame: 'O que está no visor sai na foto.',
    app: 'Confira o modo e dispare. Teclas F e espaço.',
    walk: 'Ande com o joystick ou WASD.',
    light: 'LUZ: acende no escuro e apaga no que brilha. Tecla L.',
    zoom: 'ZOOM: chega perto do pequeno. Tecla Z.',
}

export const MURAL = {
    title: 'Feira de Ciências',
    note: 'Toque para ver de perto.',
    done: 'Continuar',
}

const plural = (s: SubjectDef) => s.article === 'os' || s.article === 'as'

export const SAY = {
    notThis: (s: SubjectDef) => `${plural(s) ? 'Não são' : 'Não é'} ${s.article} ${s.name.toLowerCase()}.`,
    left: 'Saiu do quadro!',
    wantVideo: (s: SubjectDef) => `Era VÍDEO: ${s.moving}!`,
    wantPhoto: 'Era FOTO: só um instante!',
    dark: 'Ficou escuro! Faltou a LUZ.',
    washed: 'Com a LUZ, o brilho sumiu!',
    small: 'Pequeno demais! Faltou o ZOOM.',
    cut: (s: SubjectDef) => `Cortou ${s.article} ${s.name.toLowerCase()}! Tire o ZOOM.`,
}
