import { C } from './theme'
import type { Artifact, ArtifactDef, Need, NeedDef } from '../types'

/** Ordem dos quadros em `pedidos.png`, de cima para baixo. */
export const NEEDS: Record<Need, NeedDef> = {
    hear_story: {
        id: 'hear_story', frame: 0, label: 'História',
        ask: 'Quero OUVIR uma história!',
    },
    call_grandma: {
        id: 'call_grandma', frame: 1, label: 'Vovó',
        ask: 'Quero FALAR com a vovó!',
    },
    check_weather: {
        id: 'check_weather', frame: 2, label: 'Chuva?',
        ask: 'Quero VER se vai chover!',
    },
    know_snack_time: {
        id: 'know_snack_time', frame: 3, label: 'Lanche',
        ask: 'Que HORAS é o meu lanche?',
    },
    share_party_photos: {
        id: 'share_party_photos', frame: 4, label: 'Fotos',
        ask: 'Quero MOSTRAR as fotos!',
    },
}

/** Mesma ordem em `artefato-repouso.png` e `artefato-uso.png`. */
export const ARTIFACTS: Record<Artifact, ArtifactDef> = {
    speaker: { id: 'speaker', frame: 0, label: 'Caixinha', color: C.speaker },
    tablet: { id: 'tablet', frame: 1, label: 'Tablet', color: C.blue },
    phone: { id: 'phone', frame: 2, label: 'Telefone', color: C.phone },
    watch: { id: 'watch', frame: 3, label: 'Relógio', color: C.watch },
}
