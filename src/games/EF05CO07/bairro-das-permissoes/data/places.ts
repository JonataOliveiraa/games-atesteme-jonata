import type { PlaceDef, PlaceId } from '../types'

export const PLACES: Record<PlaceId, PlaceDef> = {
    fotos: { id: 'fotos', name: 'FOTOS', the: 'as FOTOS', family: 'app', icon: 0, look: 0, calling: 'As FOTOS estão chamando!', works: 'flash' },
    lanterna: { id: 'lanterna', name: 'LANTERNA', the: 'a LANTERNA', family: 'app', icon: 1, look: 2, calling: 'A LANTERNA está chamando!', works: 'glow' },
    calculadora: { id: 'calculadora', name: 'CALCULADORA', the: 'a CALCULADORA', family: 'app', icon: 2, look: 3, calling: 'A CALCULADORA está chamando!', works: 'glow' },
    musica: { id: 'musica', name: 'MÚSICA', the: 'a MÚSICA', family: 'app', icon: 3, look: 1, calling: 'A MÚSICA está chamando!', works: 'notes' },
    mapa: { id: 'mapa', name: 'MAPA', the: 'o MAPA', family: 'app', icon: 4, look: 6, calling: 'O MAPA está chamando!', works: 'glow' },
    joguinho: { id: 'joguinho', name: 'JOGUINHO', the: 'o JOGUINHO', family: 'app', icon: 5, look: 7, calling: 'O JOGUINHO está chamando!', works: 'glow' },
    videochamada: { id: 'videochamada', name: 'VIDEOCHAMADA', the: 'a VIDEOCHAMADA', family: 'app', icon: 10, look: 0, calling: 'A VIDEOCHAMADA está chamando!', works: 'glow' },
    camera: { id: 'camera', name: 'CÂMERA', the: 'a CÂMERA', family: 'peca', icon: 6, look: 4, fetch: 'Busque a CÂMERA!' },
    contatos: { id: 'contatos', name: 'CONTATOS', the: 'os CONTATOS', family: 'peca', icon: 7, look: 4, fetch: 'Busque os CONTATOS!' },
    microfone: { id: 'microfone', name: 'MICROFONE', the: 'o MICROFONE', family: 'peca', icon: 8, look: 4, fetch: 'Busque o MICROFONE!' },
    altofalante: { id: 'altofalante', name: 'ALTO-FALANTE', the: 'o ALTO-FALANTE', family: 'peca', icon: 9, look: 4, fetch: 'Busque o ALTO-FALANTE!' },
    localizacao: { id: 'localizacao', name: 'LOCALIZAÇÃO', the: 'a LOCALIZAÇÃO', family: 'peca', icon: 11, look: 4, fetch: 'Busque a LOCALIZAÇÃO!' },
}

export const GATE_OPEN = 5
