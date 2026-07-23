import type { MuseumItem } from '../types'

export const ALL_ITEMS: MuseumItem[] = [
  { id: 'keyboard', name: 'Teclado',       category: 'pecas', textureKey: 'hw-keyboard',
    fact: 'Você toca nas teclas para escrever.' },
  { id: 'mouse',    name: 'Mouse',         category: 'pecas', textureKey: 'hw-mouse',
    fact: 'Você move o mouse com a mão para clicar.' },
  { id: 'monitor',  name: 'Monitor',       category: 'pecas', textureKey: 'hw-monitor',
    fact: 'A tela mostra tudo o que o computador faz.' },
  { id: 'hd',       name: 'HD Externo',    category: 'pecas', textureKey: 'hw-hd',
    fact: 'Guarda arquivos, como uma caixa de guardar coisas.' },
  { id: 'speaker',  name: 'Caixa de Som',  category: 'pecas', textureKey: 'hw-speaker',
    fact: 'É por ela que o som sai do computador.' },
  { id: 'printer',  name: 'Impressora',    category: 'pecas', textureKey: 'hw-printer',
    fact: 'Coloca no papel o que está na tela.' },

  { id: 'game',          name: 'Jogo',              category: 'programas', textureKey: 'sw-game',
    fact: 'É um programa: você não pode tocar nele.' },
  { id: 'browser',       name: 'Navegador',         category: 'programas', textureKey: 'sw-browser',
    fact: 'Programa que abre páginas da internet.' },
  { id: 'music',         name: 'Tocador de Música', category: 'programas', textureKey: 'sw-music',
    fact: 'Manda a música para a caixa de som tocar.' },
  { id: 'photo',         name: 'Álbum de Fotos',    category: 'programas', textureKey: 'sw-photo',
    fact: 'Manda as fotos para o monitor mostrar.' },
  { id: 'text',          name: 'Editor de Texto',   category: 'programas', textureKey: 'sw-text',
    fact: 'Recebe o que você digita no teclado.' },
  { id: 'printerDriver', name: 'Driver da Impressora', category: 'programas', textureKey: 'sw-printer-driver',
    fact: 'Ensina o computador a conversar com a impressora.' },
]