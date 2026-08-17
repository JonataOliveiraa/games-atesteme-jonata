import type { Vehicle } from '../types'

export const ALL_VEHICLES: Vehicle[] = [
  { id: 'aviao', name: 'Avião', texture: 'aviao', attributes: { voa: true, temRodas: true, temMotor: true, meio: 'ar' } },
  { id: 'helicoptero', name: 'Helicóptero', texture: 'helicoptero', attributes: { voa: true, temRodas: false, temMotor: true, meio: 'ar' } },
  { id: 'foguete', name: 'Foguete', texture: 'foguete', attributes: { voa: true, temRodas: false, temMotor: true, meio: 'ar' } },
  { id: 'carro', name: 'Carro', texture: 'carro', attributes: { voa: false, temRodas: true, temMotor: true, meio: 'terra' } },
  { id: 'onibus', name: 'Ônibus', texture: 'onibus', attributes: { voa: false, temRodas: true, temMotor: true, meio: 'terra' } },
  { id: 'bicicleta', name: 'Bicicleta', texture: 'bicicleta', attributes: { voa: false, temRodas: true, temMotor: false, meio: 'terra' } },
  { id: 'trem', name: 'Trem', texture: 'trem', attributes: { voa: false, temRodas: true, temMotor: true, meio: 'terra' } },
  { id: 'moto', name: 'Moto', texture: 'moto', attributes: { voa: false, temRodas: true, temMotor: true, meio: 'terra' } },
  { id: 'patinete', name: 'Patinete', texture: 'patinete', attributes: { voa: false, temRodas: true, temMotor: false, meio: 'terra' } },
  { id: 'barco', name: 'Barco', texture: 'barco', attributes: { voa: false, temRodas: false, temMotor: false, meio: 'agua' } },
  { id: 'lancha', name: 'Lancha', texture: 'lancha', attributes: { voa: false, temRodas: false, temMotor: true, meio: 'agua' } },
  { id: 'navio', name: 'Navio', texture: 'navio', attributes: { voa: false, temRodas: false, temMotor: true, meio: 'agua' } },
]

export const vehicleById = (id: string): Vehicle => {
  const vehicle = ALL_VEHICLES.find(v => v.id === id)
  if (!vehicle) throw new Error(`Veículo não encontrado: ${id}`)
  return vehicle
}