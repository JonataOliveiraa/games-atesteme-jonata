import type { TechDef, TechId } from '../types'

export const TECH: Record<TechId, TechDef> = {
  celular: {
    id: 'celular',
    name: 'Celular',
    texture: 'tech-celular',
    precisaInternet: false,
    scores: { levar: 5, rapido: 5, criar: 3, falar: 5, guardar: 2, custo: 2 },
  },
  tablet: {
    id: 'tablet',
    name: 'Tablet',
    texture: 'tech-tablet',
    precisaInternet: false,
    scores: { levar: 4, rapido: 4, criar: 5, falar: 4, guardar: 3, custo: 2 },
  },
  notebook: {
    id: 'notebook',
    name: 'Notebook',
    texture: 'tech-notebook',
    precisaInternet: false,
    scores: { levar: 3, rapido: 4, criar: 5, falar: 4, guardar: 4, custo: 1 },
  },
  projetor: {
    id: 'projetor',
    name: 'Projetor',
    texture: 'tech-projetor',
    precisaInternet: false,
    scores: { levar: 2, rapido: 2, criar: 0, falar: 5, guardar: 0, custo: 2 },
  },
  impressora: {
    id: 'impressora',
    name: 'Impressora',
    texture: 'tech-impressora',
    precisaInternet: false,
    scores: { levar: 1, rapido: 4, criar: 2, falar: 2, guardar: 0, custo: 2 },
  },
  scanner: {
    id: 'scanner',
    name: 'Scanner',
    texture: 'tech-scanner',
    precisaInternet: false,
    scores: { levar: 1, rapido: 3, criar: 4, falar: 1, guardar: 1, custo: 2 },
  },
  nuvem: {
    id: 'nuvem',
    name: 'Nuvem',
    texture: 'tech-nuvem',
    precisaInternet: true,
    scores: { levar: 5, rapido: 3, criar: 1, falar: 4, guardar: 5, custo: 4 },
  },
  'hd-externo': {
    id: 'hd-externo',
    name: 'HD externo',
    texture: 'tech-hd-externo',
    precisaInternet: false,
    scores: { levar: 3, rapido: 4, criar: 0, falar: 0, guardar: 5, custo: 3 },
  },
  pendrive: {
    id: 'pendrive',
    name: 'Pendrive',
    texture: 'tech-pendrive',
    precisaInternet: false,
    scores: { levar: 5, rapido: 3, criar: 0, falar: 1, guardar: 2, custo: 5 },
  },
  'caixa-som': {
    id: 'caixa-som',
    name: 'Caixa de som',
    texture: 'tech-caixa-som',
    precisaInternet: false,
    scores: { levar: 3, rapido: 3, criar: 0, falar: 4, guardar: 0, custo: 3 },
  },
  camera: {
    id: 'camera',
    name: 'Câmera',
    texture: 'tech-camera',
    precisaInternet: false,
    scores: { levar: 4, rapido: 4, criar: 5, falar: 1, guardar: 3, custo: 1 },
  },
  microfone: {
    id: 'microfone',
    name: 'Microfone',
    texture: 'tech-microfone',
    precisaInternet: false,
    scores: { levar: 4, rapido: 3, criar: 4, falar: 5, guardar: 0, custo: 3 },
  },
  'lousa-digital': {
    id: 'lousa-digital',
    name: 'Lousa digital',
    texture: 'tech-lousa-digital',
    precisaInternet: false,
    scores: { levar: 0, rapido: 3, criar: 5, falar: 4, guardar: 2, custo: 0 },
  },
  fone: {
    id: 'fone',
    name: 'Fone de ouvido',
    texture: 'tech-fone',
    precisaInternet: false,
    scores: { levar: 5, rapido: 3, criar: 1, falar: 1, guardar: 0, custo: 4 },
  },
}

export const TECH_LIST = Object.values(TECH)