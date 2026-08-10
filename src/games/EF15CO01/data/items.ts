import type { ItemDef } from '../types'

export const ITEMS: Record<string, ItemDef> = {
  nina: { id: 'nina', label: 'Nina', shape: 'circulo', swatch: 'lilas', size: 3 },
  tom: { id: 'tom', label: 'Tom', shape: 'quadrado', swatch: 'creme', size: 5 },
  lia: { id: 'lia', label: 'Lia', shape: 'triangulo', swatch: 'rosa', size: 2 },
  caio: { id: 'caio', label: 'Caio', shape: 'estrela', swatch: 'uva', size: 4 },
  bel: { id: 'bel', label: 'Bel', shape: 'losango', swatch: 'areia', size: 1 },
  davi: { id: 'davi', label: 'Davi', shape: 'circulo', swatch: 'uva', size: 5 },
  ivo: { id: 'ivo', label: 'Ivo', shape: 'quadrado', swatch: 'rosa', size: 3 },
  mel: { id: 'mel', label: 'Mel', shape: 'triangulo', swatch: 'lilas', size: 4 },
  rui: { id: 'rui', label: 'Rui', shape: 'losango', swatch: 'lilas', size: 4 },
  ana: { id: 'ana', label: 'Ana', shape: 'estrela', swatch: 'rosa', size: 2 },

  p1: { id: 'p1', label: 'menor', shape: 'circulo', swatch: 'creme', size: 1 },
  p2: { id: 'p2', label: 'pequena', shape: 'circulo', swatch: 'rosa', size: 2 },
  p3: { id: 'p3', label: 'média', shape: 'circulo', swatch: 'lilas', size: 3 },
  p4: { id: 'p4', label: 'grande', shape: 'circulo', swatch: 'areia', size: 4 },
  p5: { id: 'p5', label: 'maior', shape: 'circulo', swatch: 'uva', size: 5 },

  'g-cl': { id: 'g-cl', label: 'círculo lilás', shape: 'circulo', swatch: 'lilas', size: 3 },
  'g-cc': { id: 'g-cc', label: 'círculo amarelo', shape: 'circulo', swatch: 'creme', size: 3 },
  'g-cr': { id: 'g-cr', label: 'círculo rosa', shape: 'circulo', swatch: 'rosa', size: 3 },
  'g-ql': { id: 'g-ql', label: 'quadrado lilás', shape: 'quadrado', swatch: 'lilas', size: 3 },
  'g-qc': { id: 'g-qc', label: 'quadrado amarelo', shape: 'quadrado', swatch: 'creme', size: 3 },
  'g-qr': { id: 'g-qr', label: 'quadrado rosa', shape: 'quadrado', swatch: 'rosa', size: 3 },
  'g-tl': { id: 'g-tl', label: 'triângulo lilás', shape: 'triangulo', swatch: 'lilas', size: 3 },
  'g-tc': { id: 'g-tc', label: 'triângulo amarelo', shape: 'triangulo', swatch: 'creme', size: 3 },
  'g-tr': { id: 'g-tr', label: 'triângulo rosa', shape: 'triangulo', swatch: 'rosa', size: 3 },

  's-a1': { id: 's-a1', label: 'poltrona A1', shape: 'quadrado', swatch: 'lilas', size: 3 },
  's-a2': { id: 's-a2', label: 'poltrona A2', shape: 'quadrado', swatch: 'creme', size: 3 },
  's-a3': { id: 's-a3', label: 'poltrona A3', shape: 'quadrado', swatch: 'rosa', size: 3 },
  's-b1': { id: 's-b1', label: 'poltrona B1', shape: 'circulo', swatch: 'lilas', size: 3 },
  's-b2': { id: 's-b2', label: 'poltrona B2', shape: 'circulo', swatch: 'creme', size: 3 },
  's-b3': { id: 's-b3', label: 'poltrona B3', shape: 'circulo', swatch: 'rosa', size: 3 },
  's-c1': { id: 's-c1', label: 'poltrona C1', shape: 'triangulo', swatch: 'lilas', size: 3 },
  's-c2': { id: 's-c2', label: 'poltrona C2', shape: 'triangulo', swatch: 'creme', size: 3 },
  's-c3': { id: 's-c3', label: 'poltrona C3', shape: 'triangulo', swatch: 'rosa', size: 3 },

  'f-v1': { id: 'f-v1', label: 'figurinha 1', shape: 'estrela', swatch: 'lilas', size: 3 },
  'f-v2': { id: 'f-v2', label: 'figurinha 2', shape: 'estrela', swatch: 'creme', size: 3 },
  'f-v3': { id: 'f-v3', label: 'figurinha 3', shape: 'estrela', swatch: 'rosa', size: 3 },
  'f-v4': { id: 'f-v4', label: 'figurinha 4', shape: 'losango', swatch: 'lilas', size: 3 },
  'f-v5': { id: 'f-v5', label: 'figurinha 5', shape: 'losango', swatch: 'creme', size: 3 },
  'f-v6': { id: 'f-v6', label: 'figurinha 6', shape: 'losango', swatch: 'rosa', size: 3 },
}

export const ITEM_LIST = Object.values(ITEMS)

export const SHAPE_LABEL: Record<string, string> = {
  circulo: 'círculo',
  quadrado: 'quadrado',
  triangulo: 'triângulo',
  estrela: 'estrela',
  losango: 'losango',
}