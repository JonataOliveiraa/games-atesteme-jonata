import type { FileDef, FileId, Place, PlaceDef } from '../types'

export const SHEETS = {
    files: { key: 'arquivos', frameWidth: 256, frameHeight: 256 },
} as const

/** A ordem é o índice do quadro em `arquivos.png`, e é contrato com a arte. */
const FILES: FileDef[] = [
    { id: 'musica', name: 'MÚSICA', want: 'ouvir a MÚSICA', frame: 0 },
    { id: 'video', name: 'VÍDEO', want: 'ver o VÍDEO', frame: 1 },
    { id: 'foto', name: 'FOTO', want: 'ver a FOTO', frame: 2 },
    { id: 'jogo', name: 'JOGO', want: 'JOGAR', frame: 3 },
    { id: 'desenho', name: 'DESENHO', want: 'ver o DESENHO', frame: 4 },
    { id: 'dever', name: 'DEVER', want: 'fazer o DEVER', frame: 5 },
]

const BY_ID = new Map(FILES.map(f => [f.id, f]))

export const file = (id: FileId): FileDef => {
    const found = BY_ID.get(id)
    if (!found) throw new Error(`arquivo desconhecido: ${id}`)
    return found
}

/**
 * Os quatro lugares — mas nunca os quatro na mesma tela.
 *
 * No quarto (níveis 1 e 2) valem o computador, o pen drive e a nuvem. No ar
 * (nível 3), o computador, o celular e a nuvem.
 *
 * **O pen drive** está aqui porque sem um segundo lugar de perto, "não precisa
 * de internet" pareceria propriedade do computador, e não de onde o arquivo
 * está guardado.
 *
 * **O celular** está aqui pelo motivo simétrico: sem um segundo aparelho, "ficou
 * sem sinal" pareceria propriedade da nuvem — como se ela tivesse caído para
 * todo mundo. Com dois, a criança vê um parar e o outro continuar, e o alcance
 * passa a ser de cada aparelho.
 */
const PLACE_DEFS: PlaceDef[] = [
    { id: 'pc', name: 'MEU COMPUTADOR', needsWire: false, device: true },
    { id: 'drive', name: 'PEN DRIVE', needsWire: false, device: false },
    { id: 'phone', name: 'CELULAR', needsWire: false, device: true },
    { id: 'cloud', name: 'NUVEM', needsWire: true, device: false },
]

const PLACE_BY_ID = new Map(PLACE_DEFS.map(p => [p.id, p]))

export const place = (id: Place): PlaceDef => {
    const found = PLACE_BY_ID.get(id)
    if (!found) throw new Error(`lugar desconhecido: ${id}`)
    return found
}
