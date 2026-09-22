import { C } from './theme'
import type { Instrumento, InstrumentoId, Item } from '../types'

export const INSTRUMENTOS: Record<InstrumentoId, Instrumento> = {
    luneta: { id: 'luneta', alcanca: true, amplia: false, atravessa: false },
    lupa: { id: 'lupa', alcanca: false, amplia: true, atravessa: false },
    detector: { id: 'detector', alcanca: false, amplia: false, atravessa: true },
    celular: { id: 'celular', alcanca: true, amplia: true, atravessa: false },
}

const item = (id: InstrumentoId, nome: string, faz: string, coluna: number, cor: number): Item => ({
    id,
    nome,
    faz,
    sheet: 'instrumentos',
    cols: 4,
    rows: 2,
    coluna,
    cor,
    placa: cor,
    naMao: false,
})

export const LUNETA = item('luneta', 'Luneta', 'traz o longe para perto', 0, C.luneta)
export const LUPA = item('lupa', 'Lupa', 'aumenta o que é miudinho', 1, C.lupa)
export const DETECTOR = item('detector', 'Detector', 'acha o que está enterrado', 2, C.detector)
export const CELULAR = item('celular', 'Celular', 'traz o longe E aumenta', 3, C.celular)

/** A bancada muda na 3.3: a lupa sai e o celular entra. É o fecho da habilidade. */
export const ITENS_N3 = [LUNETA, LUPA, DETECTOR]
export const ITENS_N3_FINAL = [LUNETA, DETECTOR, CELULAR]
