import type { CharacterDef } from '../types'

export const CHARACTERS: Record<CharacterDef['id'], CharacterDef> = {
  tino: {
    id: 'tino',
    name: 'Tino',
    texture: 'treinador-normal',
    role: 'Treinador da academia',
    voice: 'curto, calmo e incentivador',
  },
  jogador: {
    id: 'jogador',
    name: 'Jogador',
    texture: 'avatar-crianca',
    role: 'Autor do algoritmo',
    voice: 'decide, testa e melhora a solucao',
  },
  lia: {
    id: 'lia',
    name: 'Lia',
    texture: 'personagem-lia',
    role: 'Colega que usa poucos blocos',
    voice: 'organizada e direta',
  },
  caio: {
    id: 'caio',
    name: 'Caio',
    texture: 'personagem-caio',
    role: 'Colega que explica passo a passo',
    voice: 'detalhista e visual',
  },
  nina: {
    id: 'nina',
    name: 'Nina',
    texture: 'personagem-nina',
    role: 'Colega que testa caminhos alternativos',
    voice: 'curiosa e investigativa',
  },
}

export const TRAINER_TEXTURES = {
  normal: 'treinador-normal',
  feliz: 'treinador-feliz',
  pensando: 'treinador-pensando',
} as const
