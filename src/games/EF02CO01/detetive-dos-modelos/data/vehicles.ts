import type { Attribute, TestZone, VehicleId, VehicleModel } from '../types'

export const VEHICLES: VehicleModel[] = [
    { id: 'plane', name: 'AVIÃO', frame: 0, media: ['air'], hasMotor: true, hasWheels: true },
    { id: 'car', name: 'CARRO', frame: 1, media: ['land'], hasMotor: true, hasWheels: true },
    { id: 'boat', name: 'BARCO', frame: 2, media: ['water'], hasMotor: false, hasWheels: false },
    { id: 'bike', name: 'BICICLETA', frame: 3, media: ['land'], hasMotor: false, hasWheels: true },
    { id: 'helicopter', name: 'HELICÓPTERO', frame: 4, media: ['air'], hasMotor: true, hasWheels: false },
    { id: 'bus', name: 'ÔNIBUS', frame: 5, media: ['land'], hasMotor: true, hasWheels: true },
    { id: 'speedboat', name: 'LANCHA', frame: 6, media: ['water'], hasMotor: true, hasWheels: false },
    { id: 'rocket', name: 'FOGUETE', frame: 7, media: ['air'], hasMotor: true, hasWheels: false },
    { id: 'sailboat', name: 'BARCO A VELA', frame: 8, media: ['water'], hasMotor: false, hasWheels: false },
    { id: 'scooter', name: 'PATINETE', frame: 9, media: ['land'], hasMotor: false, hasWheels: true },
    { id: 'train', name: 'TREM', frame: 10, media: ['rail'], hasMotor: true, hasWheels: true },
    { id: 'seaplane', name: 'HIDROAVIÃO', frame: 11, media: ['air', 'water'], hasMotor: true, hasWheels: false },
]

export const vehicleOf = (id: VehicleId): VehicleModel =>
    VEHICLES.find(v => v.id === id) ?? VEHICLES[0]

export function matchesZone(vehicle: VehicleModel, zone: TestZone): boolean {
    if (zone.kind === 'medium') return vehicle.media.includes(zone.medium)
    if (zone.kind === 'motor') return vehicle.hasMotor === zone.hasMotor
    return vehicle.hasWheels === zone.hasWheels
}

export const fittingZone = (vehicle: VehicleModel, zones: TestZone[]) =>
    zones.findIndex(zone => matchesZone(vehicle, zone))

export function zoneAttribute(zone: TestZone): Attribute {
    if (zone.kind === 'medium') return zone.medium
    if (zone.kind === 'motor') return 'motor'
    return 'wheels'
}

export const ZONE_NAME: Record<string, string> = {
    air: 'CÉU',
    land: 'ESTRADA',
    water: 'ÁGUA',
    rail: 'TRILHO',
    'motor-true': 'TEM MOTOR',
    'motor-false': 'SEM MOTOR',
    'wheels-true': 'TEM RODAS',
    'wheels-false': 'SEM RODAS',
}

export function zoneName(zone: TestZone): string {
    if (zone.kind === 'medium') return ZONE_NAME[zone.medium]
    if (zone.kind === 'motor') return ZONE_NAME[`motor-${zone.hasMotor}`]
    return ZONE_NAME[`wheels-${zone.hasWheels}`]
}

export function zoneKey(zone: TestZone): string {
    if (zone.kind === 'medium') return zone.medium
    if (zone.kind === 'motor') return `motor-${zone.hasMotor}`
    return `wheels-${zone.hasWheels}`
}

export const SCENERY: Record<string, string> = {
    air: 'bg-ceu',
    land: 'bg-estrada',
    water: 'bg-mar',
}

/**
 * O pedaço do cenário que o CARTÃO mostra, em frações da imagem: centro e
 * altura. A largura sai da proporção do cartão.
 *
 * O quarto de baixo do cartão fica sob a fita com o nome, então o que precisa
 * ser lido mora no meio: o sol e as nuvens no céu, a faixa tracejada na
 * estrada, o horizonte e as ondas no mar. Na animação do teste o mesmo
 * arquivo aparece inteiro.
 */
export const CARD_VIEW: Record<string, { cx: number; cy: number; h: number }> = {
    air: { cx: 0.76, cy: 0.38, h: 0.64 },
    land: { cx: 0.44, cy: 0.65, h: 0.68 },
    water: { cx: 0.5, cy: 0.58, h: 0.64 },
}

export const MISS_LINE: Record<string, string> = {
    air: 'Ele não voa.',
    land: 'Ele não anda aqui.',
    water: 'Ele não flutua.',
    rail: 'Trem usa trilho.',
    motor: 'Olhe o motor.',
    wheels: 'Olhe as rodas.',
}
