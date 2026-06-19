import type { SecurityItem } from '../types'

export const ALL_SECURITY_ITEMS: SecurityItem[] = [
  { id: 'password',  label: 'Senha Forte',           iconKey: 'icon-password',  shouldBeOn: true },
  { id: 'location',  label: 'Compartilhar Local.',   iconKey: 'icon-location',  shouldBeOn: false },
  { id: 'camera',    label: 'Permitir Câmera',        iconKey: 'icon-camera',    shouldBeOn: false },
  { id: 'purchases', label: 'Compras no App',         iconKey: 'icon-purchases', shouldBeOn: false },
  { id: 'strangers', label: 'Falar com Estranhos',    iconKey: 'icon-strangers', shouldBeOn: false },
  { id: 'privacy',   label: 'Perfil Privado',         iconKey: 'icon-privacity', shouldBeOn: true },
]
