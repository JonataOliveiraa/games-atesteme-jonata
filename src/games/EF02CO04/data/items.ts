import type { MuseumItem } from '../types'

export const ALL_ITEMS: MuseumItem[] = [
  { id: 'keyboard', name: 'Teclado',              category: 'pecas',    textureKey: 'hw-keyboard' },
  { id: 'mouse',    name: 'Mouse',                category: 'pecas',    textureKey: 'hw-mouse' },
  { id: 'monitor',  name: 'Monitor',              category: 'pecas',    textureKey: 'hw-monitor' },
  { id: 'hd',       name: 'HD Externo',           category: 'pecas',    textureKey: 'hw-hd' },
  { id: 'speaker',  name: 'Caixa de Som',         category: 'pecas',    textureKey: 'hw-speaker' },
  { id: 'printer',  name: 'Impressora',           category: 'pecas',    textureKey: 'hw-printer' },

  { id: 'game',           name: 'Jogo',                 category: 'programas', textureKey: 'sw-game' },
  { id: 'browser',        name: 'Navegador',            category: 'programas', textureKey: 'sw-browser' },
  { id: 'music',          name: 'Música',               category: 'programas', textureKey: 'sw-music' },
  { id: 'photo',          name: 'Álbum de Fotos',       category: 'programas', textureKey: 'sw-photo' },
  { id: 'text',           name: 'Editor de Texto',      category: 'programas', textureKey: 'sw-text' },
  { id: 'printerDriver',  name: 'Driver Impressora',    category: 'programas', textureKey: 'sw-printer-driver' },
]

/** Pares pedagógicos: qual software "dá vida" a qual hardware (Nível 2) */
export const HW_SW_PAIRS: Array<{ hwId: string; swId: string }> = [
  { hwId: 'printer', swId: 'printerDriver' },
  { hwId: 'speaker',  swId: 'music' },
  { hwId: 'monitor',  swId: 'photo' },
  { hwId: 'keyboard', swId: 'text' },
  { hwId: 'mouse',    swId: 'browser' },
  { hwId: 'hd',       swId: 'game' },
]
