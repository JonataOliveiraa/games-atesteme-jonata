export type AppId = 'relogio' | 'gravador' | 'desenho' | 'calculadora' | 'pasta' | 'player' | 'power'

export interface AppDef {
  id: AppId
  label: string
  icon: string
  headerColor: number
  bodyColor: number
}

export interface MissionStep {
  appId: AppId
  actionKey: string
  hint: string
}

export interface Mission {
  id: string
  text: string
  steps: MissionStep[]
}

export interface LevelConfig {
  level: 1 | 2 | 3
  availableApps: AppId[]
  missions: Mission[]
  timeLimit: number  // seconds
}

export const APP_DEFS: AppDef[] = [
  { id: 'relogio',     label: 'Relógio',     icon: '🕐', headerColor: 0x1A3A6B, bodyColor: 0x0D1B2A },
  { id: 'gravador',    label: 'Gravador',    icon: '🎙️', headerColor: 0x922B21, bodyColor: 0x1A0D0A },
  { id: 'desenho',     label: 'Desenho',     icon: '🎨', headerColor: 0x76448A, bodyColor: 0x140E1A },
  { id: 'calculadora', label: 'Calculadora', icon: '🧮', headerColor: 0x1E8449, bodyColor: 0x0A1A10 },
  { id: 'pasta',       label: 'Pasta',       icon: '📁', headerColor: 0xB7770D, bodyColor: 0x1A1100 },
  { id: 'player',      label: 'Músicas',     icon: '🎵', headerColor: 0x1A252F, bodyColor: 0x0A1628 },
  { id: 'power',       label: 'Desligar',    icon: '⏻',  headerColor: 0x7B241C, bodyColor: 0x1A0A0A },
]
