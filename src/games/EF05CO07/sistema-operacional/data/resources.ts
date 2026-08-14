import type {
    ResourceAvailability,
    ResourceDef,
    ResourceId,
    ResourceState,
} from '../types'

export const RESOURCE_ORDER: ResourceId[] = [
    'memoria',
    'arquivos',
    'teclado',
    'mouse',
    'monitor',
    'impressora',
]

export const RESOURCES: Record<ResourceId, ResourceDef> = {
    memoria: {
        id: 'memoria',
        name: 'Memória',
        texture: 'recurso-memoria',
        description: 'Guarda temporariamente os programas que estão abertos.',
    },
    arquivos: {
        id: 'arquivos',
        name: 'Pasta de arquivos',
        texture: 'recurso-arquivos',
        description: 'Organiza e encontra os arquivos guardados no computador.',
    },
    teclado: {
        id: 'teclado',
        name: 'Teclado',
        texture: 'recurso-teclado',
        description: 'Envia letras, números e comandos para o computador.',
    },
    mouse: {
        id: 'mouse',
        name: 'Mouse',
        texture: 'recurso-mouse',
        description: 'Move o ponteiro e permite escolher itens na tela.',
    },
    monitor: {
        id: 'monitor',
        name: 'Monitor',
        texture: 'recurso-monitor',
        description: 'Mostra textos, imagens e resultados para a pessoa.',
    },
    impressora: {
        id: 'impressora',
        name: 'Impressora',
        texture: 'recurso-impressora',
        description: 'Coloca textos e imagens do computador no papel.',
    },
}

export const RESOURCE_STATE_LABEL: Record<ResourceState, string> = {
    livre: 'Livre',
    ocupado: 'Ocupado',
    desligado: 'Desligado',
}

export const availability = (
    id: ResourceId,
    state: ResourceState = 'livre',
): ResourceAvailability => ({ id, state })

export const getResource = (id: ResourceId): ResourceDef => RESOURCES[id]
