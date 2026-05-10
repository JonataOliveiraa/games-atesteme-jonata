import type { Vehicle } from '../types'

export const ALL_VEHICLES: Vehicle[] = [
  {
    id: 'aviao',
    name: 'Avião',
    emoji: '✈️',
    bodyColor: 0x64B5F6,
    attributes: { voa: true,  temRodas: true,  temMotor: true,  meio: 'ar'    },
  },
  {
    id: 'helicoptero',
    name: 'Helicóptero',
    emoji: '🚁',
    bodyColor: 0x81C784,
    attributes: { voa: true,  temRodas: false, temMotor: true,  meio: 'ar'    },
  },
  {
    id: 'foguete',
    name: 'Foguete',
    emoji: '🚀',
    bodyColor: 0xEF9A9A,
    attributes: { voa: true,  temRodas: false, temMotor: true,  meio: 'ar'    },
  },
  {
    id: 'moto',
    name: 'Moto',
    emoji: '🏍️',
    bodyColor: 0xEF6C00,
    attributes: { voa: false, temRodas: true,  temMotor: true,  meio: 'terra' },
  },
  {
    id: 'carro',
    name: 'Carro',
    emoji: '🚗',
    bodyColor: 0x4FC3F7,
    attributes: { voa: false, temRodas: true,  temMotor: true,  meio: 'terra' },
  },
  {
    id: 'onibus',
    name: 'Ônibus',
    emoji: '🚌',
    bodyColor: 0xFFB74D,
    attributes: { voa: false, temRodas: true,  temMotor: true,  meio: 'terra' },
  },
  {
    id: 'bicicleta',
    name: 'Bicicleta',
    emoji: '🚲',
    bodyColor: 0xA5D6A7,
    attributes: { voa: false, temRodas: true,  temMotor: false, meio: 'terra' },
  },
  {
    id: 'trem',
    name: 'Trem',
    emoji: '🚂',
    bodyColor: 0xB0BEC5,
    attributes: { voa: false, temRodas: true,  temMotor: true,  meio: 'terra' },
  },
  {
    id: 'barco',
    name: 'Barco',
    emoji: '⛵',
    bodyColor: 0x80DEEA,
    attributes: { voa: false, temRodas: false, temMotor: false, meio: 'agua'  },
  },
  {
    id: 'lancha',
    name: 'Lancha',
    emoji: '🚤',
    bodyColor: 0xF48FB1,
    attributes: { voa: false, temRodas: false, temMotor: true,  meio: 'agua'  },
  },
  {
    id: 'patinete',
    name: 'Patinete',
    emoji: '🛴',
    bodyColor: 0xCE93D8,
    attributes: { voa: false, temRodas: true,  temMotor: false, meio: 'terra' },
  },
  {
    id: 'navio',
    name: 'Navio',
    emoji: '🚢',
    bodyColor: 0x4DD0E1,
    attributes: { voa: false, temRodas: false, temMotor: true,  meio: 'agua'  },
  },
]

export const vehicleById = (id: string): Vehicle => {
  const v = ALL_VEHICLES.find((v) => v.id === id)
  if (!v) throw new Error(`Veículo não encontrado: ${id}`)
  return v
}
