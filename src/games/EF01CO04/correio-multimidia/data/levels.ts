import type { GameItem, DeliveryStation, LevelConfig, MissionConfig } from '../types'

export const CONCEPTS: Record<string, GameItem> = {
  cachorro: {
    id: 'item_cachorro',
    nameKey: 'Cachorro',
    textureKey: 'info_cachorro',
    phrase: 'O cachorro late no quintal.',
    soundKey: 'som_latido',
    validChannels: ['image', 'text', 'audio']
  },
  gato: {
    id: 'item_gato',
    nameKey: 'Gato',
    textureKey: 'info_gato',
    phrase: 'O gato dorme no sofá.',
    soundKey: 'som_miado',
    validChannels: ['image', 'text', 'audio']
  },
  carro: {
    id: 'item_carro',
    nameKey: 'Carro',
    textureKey: 'info_carro',
    phrase: 'O carro anda pela rua.',
    soundKey: 'som_buzina',
    validChannels: ['image', 'text', 'audio']
  },
  casa: {
    id: 'item_casa',
    nameKey: 'Casa',
    textureKey: 'info_casa',
    phrase: 'A casa tem porta e janela.',
    validChannels: ['image', 'text']
  },
  maca: {
    id: 'item_maca',
    nameKey: 'Maçã',
    textureKey: 'info_maca',
    phrase: 'A maçã é uma fruta vermelha.',
    validChannels: ['image', 'text']
  },
  sol: {
    id: 'item_sol',
    nameKey: 'Sol',
    textureKey: 'info_sol',
    phrase: 'O sol brilha no céu.',
    validChannels: ['image', 'text']
  }
}

export const STATIONS: DeliveryStation[] = [
  { id: 'st_mic', channel: 'audio', textureKey: 'estacao_microfone', activeTextureKey: 'estacao_microfone_ativa' },
  { id: 'st_pen', channel: 'image', textureKey: 'estacao_lapis', activeTextureKey: 'estacao_lapis_ativa' },
  { id: 'st_env', channel: 'text', textureKey: 'estacao_envelope', activeTextureKey: 'estacao_envelope_ativa' }
]

const nivel1Missions: MissionConfig[] = [
  { id: 'm01', item: CONCEPTS.cachorro, requiredChannels: ['image'] },
  { id: 'm02', item: CONCEPTS.sol,      requiredChannels: ['text'] },
  { id: 'm03', item: CONCEPTS.gato,     requiredChannels: ['audio'] },
  { id: 'm04', item: CONCEPTS.casa,     requiredChannels: ['text'] }
]

const nivel2Missions: MissionConfig[] = [
  { id: 'm05', item: CONCEPTS.cachorro, requiredChannels: ['image', 'audio'] },
  { id: 'm06', item: CONCEPTS.gato,     requiredChannels: ['image', 'text'] },
  { id: 'm07', item: CONCEPTS.carro,    requiredChannels: ['text', 'audio'] },
  { id: 'm08', item: CONCEPTS.maca,     requiredChannels: ['image', 'text'] }
]

const nivel3Missions: MissionConfig[] = [
  { id: 'm09', item: CONCEPTS.carro,    requiredChannels: ['image'] },
  { id: 'm10', item: CONCEPTS.cachorro, requiredChannels: ['text', 'audio'] },
  { id: 'm11', item: CONCEPTS.maca,     requiredChannels: ['text'] },
  { id: 'm12', item: CONCEPTS.gato,     requiredChannels: ['image', 'audio'] }
]

export const LEVELS: LevelConfig[] = [
  {
    level: 1,
    mode: 'single',
    title: 'Um caminho de cada vez',
    objective: 'Veja o que o destino pede e envie pela estação certa.',
    missions: nivel1Missions
  },
  {
    level: 2,
    mode: 'dual',
    title: 'Dois caminhos juntos',
    objective: 'Agora o destino quer receber a mesma mensagem por dois caminhos.',
    missions: nivel2Missions
  },
  {
    level: 3,
    mode: 'mastery',
    title: 'Fique atento!',
    objective: 'Às vezes é um caminho, às vezes são dois. Confira sempre antes de enviar.',
    missions: nivel3Missions
  }
]