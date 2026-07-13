import type { GameItem, DeliveryStation, LevelConfig, MissionConfig } from '../types'

/**
 * Matriz de compatibilidade item x canal.
 * Áudio só existe para itens com som característico natural — os demais
 * ficam sem 'audio' de propósito, e a estação de microfone deve indicar
 * visualmente (microfone_indisponivel) que aquele item não pode ser
 * transmitido por som.
 */
export const CONCEPTS: Record<string, GameItem> = {
  cachorro: {
    id: 'item_cachorro',
    nameKey: 'Cachorro',
    textureKey: 'info_cachorro',
    soundKey: 'som_latido',
    validChannels: ['image', 'text', 'audio']
  },
  gato: {
    id: 'item_gato',
    nameKey: 'Gato',
    textureKey: 'info_gato',
    soundKey: 'som_miado',
    validChannels: ['image', 'text', 'audio']
  },
  carro: {
    id: 'item_carro',
    nameKey: 'Carro',
    textureKey: 'info_carro',
    soundKey: 'som_buzina',
    validChannels: ['image', 'text', 'audio']
  },
  casa: {
    id: 'item_casa',
    nameKey: 'Casa',
    textureKey: 'info_casa',
    validChannels: ['image', 'text']
  },
  maca: {
    id: 'item_maca',
    nameKey: 'Maçã',
    textureKey: 'info_maca',
    validChannels: ['image', 'text']
  },
  sol: {
    id: 'item_sol',
    nameKey: 'Sol',
    textureKey: 'info_sol',
    validChannels: ['image', 'text']
  }
}

/**
 * 3 estações reais e clicáveis no mapa. O alto-falante NÃO está aqui —
 * ele é o estágio de reprodução do canal 'audio', usado durante a
 * animação de transmissão, não uma estação de escolha do jogador.
 */
export const STATIONS: DeliveryStation[] = [
  { id: 'st_mic', channel: 'audio', textureKey: 'estacao_microfone', activeTextureKey: 'estacao_microfone_ativa' },
  { id: 'st_pen', channel: 'image', textureKey: 'estacao_lapis', activeTextureKey: 'estacao_lapis_ativa' },
  { id: 'st_env', channel: 'text', textureKey: 'estacao_envelope', activeTextureKey: 'estacao_envelope_ativa' }
]

const nivel1Missions: MissionConfig[] = [
  { id: 'm01', item: CONCEPTS.cachorro, requiredChannels: ['image'] },
  { id: 'm02', item: CONCEPTS.sol, requiredChannels: ['text'] }
]

const nivel2Missions: MissionConfig[] = [
  { id: 'm03', item: CONCEPTS.cachorro, requiredChannels: ['image', 'audio'] },
  { id: 'm04', item: CONCEPTS.gato, requiredChannels: ['image', 'text'] },
  { id: 'm05', item: CONCEPTS.carro, requiredChannels: ['text', 'audio'] }
]

/**
 * Nível 3: estrutura já definida, mas o campo 'context' ainda não é
 * consumido pela GameScene — falta providenciar os ícones visuais de
 * contexto (contexto_sem_som, contexto_sem_lapis) antes de ligar essa
 * lógica de fato.
 */
const nivel3Missions: MissionConfig[] = [
  { id: 'm06', item: CONCEPTS.cachorro, requiredChannels: ['image'], context: 'sem_som' },
  { id: 'm07', item: CONCEPTS.gato, requiredChannels: ['text'], context: 'sem_lapis' },
  { id: 'm08', item: CONCEPTS.carro, requiredChannels: ['image'], context: 'sem_som' }
]

export const LEVELS: LevelConfig[] = [
  { level: 1, mode: 'single', missions: nivel1Missions },
  { level: 2, mode: 'dual', missions: nivel2Missions },
  { level: 3, mode: 'mastery', missions: nivel3Missions }
]