import type { Detail, FindDef, Kind, Request, Topic } from '../types'

const find = (id: string, topic: Topic, kind: Kind, caption: string, frame: number, detail?: Detail, extra: string[] = []): FindDef => ({
    id,
    topic,
    kind,
    detail,
    caption,
    frame,
    words: [topic, kind, ...(detail ? [detail] : []), ...extra],
})

export const FIND_LIST: FindDef[] = [
    find('foto-tucano', 'tucano', 'foto', 'Foto de tucano', 0, undefined, ['pássaro']),
    find('foto-tucano-voando', 'tucano', 'foto', 'Foto de tucano voando', 1, 'voando', ['pássaro']),
    find('foto-tucano-perto', 'tucano', 'foto', 'Foto de tucano de perto', 2, 'de perto', ['pássaro']),
    find('desenho-tucano', 'tucano', 'desenho', 'Desenho de tucano', 3),
    find('pelucia-tucano', 'tucano', 'pelúcia', 'Tucano de pelúcia', 4),
    find('chinelo-tucano', 'tucano', 'chinelo', 'Chinelo de tucano', 5),
    find('video-tucano', 'tucano', 'vídeo', 'Vídeo de tucano', 6),
    find('texto-tucano', 'tucano', 'texto', 'Texto sobre tucanos', 7),
    find('video-vulcao-erupcao', 'vulcão', 'vídeo', 'Vídeo de vulcão em erupção', 8, 'erupção'),
    find('video-vulcao-parado', 'vulcão', 'vídeo', 'Vídeo de vulcão parado', 9, 'parado'),
    find('foto-vulcao', 'vulcão', 'foto', 'Foto de vulcão', 10),
    find('maquete-vulcao', 'vulcão', 'maquete', 'Maquete de vulcão', 11),
    find('desenho-vulcao', 'vulcão', 'desenho', 'Desenho de vulcão', 12),
    find('texto-vulcao', 'vulcão', 'texto', 'Texto sobre vulcões', 13),
    find('texto-baleia', 'baleia', 'texto', 'Texto sobre baleias', 14),
    find('texto-baleia-filhote', 'baleia', 'texto', 'Texto sobre filhote de baleia', 15, 'filhote'),
    find('foto-baleia', 'baleia', 'foto', 'Foto de baleia', 16),
    find('foto-baleia-pulando', 'baleia', 'foto', 'Foto de baleia pulando', 17, 'pulando'),
    find('video-baleia-pulando', 'baleia', 'vídeo', 'Vídeo de baleia pulando', 18, 'pulando'),
    find('boia-baleia', 'baleia', 'boia', 'Boia de baleia', 19),
    find('desenho-baleia', 'baleia', 'desenho', 'Desenho de baleia', 20),
]

export const FIND: Record<string, FindDef> = Object.fromEntries(FIND_LIST.map(f => [f.id, f]))

export const matches = (f: FindDef, words: string[]) => words.length > 0 && words.every(w => f.words.includes(w))

export const answers = (f: FindDef, r: Request) =>
    f.topic === r.topic && f.kind === r.kind && (r.detail === undefined || f.detail === r.detail)

const KIND_LABEL: Record<Kind, string> = {
    foto: 'FOTO',
    vídeo: 'VÍDEO',
    texto: 'TEXTO',
    desenho: 'desenho',
    pelúcia: 'pelúcia',
    chinelo: 'chinelo',
    maquete: 'maquete',
    boia: 'boia',
}

const DETAIL_MISS: Record<Detail, string> = {
    voando: 'Esse tucano não está voando!',
    'de perto': 'Pedi o tucano de perto!',
    erupção: 'Esse vulcão não está em erupção!',
    parado: 'Pedi o vulcão parado!',
    pulando: 'Essa baleia não está pulando!',
    filhote: 'Pedi sobre o filhote!',
}

export function whyWrong(f: FindDef, r: Request): string {
    if (f.topic !== r.topic) return `Isso nem é ${r.topic}!`
    if (f.kind !== r.kind) return `Pedi ${KIND_LABEL[r.kind]}, isso é ${KIND_LABEL[f.kind].toLowerCase()}!`
    if (r.detail && f.detail !== r.detail) return DETAIL_MISS[r.detail]
    return 'Não era bem isso!'
}
