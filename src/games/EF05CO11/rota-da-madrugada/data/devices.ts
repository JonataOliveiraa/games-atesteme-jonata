import type { DeviceDef, DeviceId } from '../types'

export const DEVICES: Record<DeviceId, DeviceDef> = {
    buzina: { id: 'buzina', label: 'BUZINA', effect: 'avisar', reach: 'perto' },
    farol: { id: 'farol', label: 'FAROL', effect: 'luz', stays: true },
    mensagem: { id: 'mensagem', label: 'MENSAGEM', effect: 'avisar', reach: 'celular', online: true },
    limpador: { id: 'limpador', label: 'LIMPADOR', effect: 'limpar' },
    gps: { id: 'gps', label: 'GPS', effect: 'caminho', online: true },
    altofalante: { id: 'altofalante', label: 'ALTO-FALANTE', effect: 'avisar', reach: 'todos' },
    mapa: { id: 'mapa', label: 'MAPA', effect: 'caminho', paper: true },
    radio: { id: 'radio', label: 'RÁDIO', effect: 'avisar', reach: 'radio' },
}
