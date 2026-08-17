import type { SecurityItem } from '../types'

export const ALL_SECURITY_ITEMS: SecurityItem[] = [
  { id: 'password',  label: 'Senha Forte',         iconKey: 'icon-password',  shouldBeOn: true,
    why: 'Uma senha forte impede que outras pessoas entrem na sua conta.' },
  { id: 'location',  label: 'Compartilhar Local.', iconKey: 'icon-location',  shouldBeOn: false,
    why: 'Compartilhar onde você está permite que estranhos descubram sua localização.' },
  { id: 'camera',    label: 'Permitir Câmera',      iconKey: 'icon-camera',    shouldBeOn: false,
    why: 'Apps não precisam da sua câmera para funcionar. Deixe desligada!' },
  { id: 'purchases', label: 'Compras no App',       iconKey: 'icon-purchases', shouldBeOn: false,
    why: 'Compras liberadas podem gastar dinheiro sem você perceber.' },
  { id: 'strangers', label: 'Falar com Estranhos',  iconKey: 'icon-strangers', shouldBeOn: false,
    why: 'Nunca converse com quem você não conhece na vida real.' },
  { id: 'privacy',   label: 'Perfil Privado',       iconKey: 'icon-privacity', shouldBeOn: true,
    why: 'Com o perfil privado, só seus amigos veem suas informações.' },
]