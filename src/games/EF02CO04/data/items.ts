import type { MuseumItem } from '../types'

export const ALL_ITEMS: MuseumItem[] = [
  { id: 'keyboard', name: 'Teclado',              category: 'hardware', textureKey: 'hw-keyboard' },
  { id: 'mouse',    name: 'Mouse',                category: 'hardware', textureKey: 'hw-mouse' },
  { id: 'monitor',  name: 'Monitor',               category: 'hardware', textureKey: 'hw-monitor' },
  { id: 'hd',       name: 'HD Externo',             category: 'hardware', textureKey: 'hw-hd' },
  { id: 'speaker',  name: 'Caixa de Som',           category: 'hardware', textureKey: 'hw-speaker' },
  { id: 'printer',  name: 'Impressora',             category: 'hardware', textureKey: 'hw-printer' },

  { id: 'game',           name: 'Jogo',                  category: 'software', textureKey: 'sw-game' },
  { id: 'browser',        name: 'Navegador',             category: 'software', textureKey: 'sw-browser' },
  { id: 'music',          name: 'Música',                category: 'software', textureKey: 'sw-music' },
  { id: 'photo',          name: 'Álbum de Fotos',        category: 'software', textureKey: 'sw-photo' },
  { id: 'text',           name: 'Editor de Texto',       category: 'software', textureKey: 'sw-text' },
  { id: 'printerDriver',  name: 'Driver da Impressora',  category: 'software', textureKey: 'sw-printer-driver' },
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
