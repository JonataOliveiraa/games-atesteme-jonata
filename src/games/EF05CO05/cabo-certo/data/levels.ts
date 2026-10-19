import type { DeviceId, LevelDef } from '../types'
import { DEVICES } from './devices'

export const POINTS = 2

export const guideKey = (level: number) => `ef05co05-cabo-l${level}`

/**
 * N1: entrada, saída, processador e armazenamento. Os três pedidos montam a
 * mesma mesa, e o terceiro só cabe na tomada do monitor (o aninhamento).
 */
const N1: LevelDef = {
    level: 1,
    title: 'Cada cabo na sua tomada',
    message: 'Entra, processa, guarda e mostra: cada parte do computador tem a sua função, e tudo passa pelo processador.',
    pc: [
        { id: 'pc-entrada-1', kind: 'entrada', at: { x: -180, y: -150 } },
        { id: 'pc-entrada-2', kind: 'entrada', at: { x: -180, y: -50 } },
        { id: 'pc-entrada-3', kind: 'entrada', at: { x: -180, y: 50 } },
        { id: 'pc-entrada-4', kind: 'entrada', at: { x: -180, y: 150 } },
        { id: 'pc-saida-1', kind: 'saida', at: { x: 180, y: -60 } },
        { id: 'pc-armazenamento-1', kind: 'armazenamento', at: { x: 0, y: 220 } },
    ],
    devices: ['teclado', 'mouse', 'microfone', 'camera', 'monitor', 'altofalante', 'pendrive'],
    asleep: ['altofalante'],
    missions: [
        {
            id: 'escrever',
            ask: 'Quero escrever meu nome e ver na tela.',
            needs: ['teclado', 'monitor'],
            use: 'teclado',
            goal: { payload: 'texto', at: 'monitor' },
            done: 'As letras entraram pelo teclado, passaram pelo processador e saíram no monitor!',
        },
        {
            id: 'gravar',
            ask: 'Quero gravar minha voz e guardar para amanhã.',
            needs: ['microfone', 'pendrive'],
            use: 'microfone',
            goal: { payload: 'voz', at: 'pendrive' },
            done: 'Sua voz ficou guardada no pendrive. Amanhã ela ainda vai estar lá!',
        },
        {
            id: 'ouvir',
            ask: 'Quero ouvir a música que está no pendrive.',
            needs: ['pendrive', 'monitor', 'altofalante'],
            use: 'pendrive',
            goal: { payload: 'musica', at: 'altofalante' },
            wake: ['altofalante'],
            done: 'A música saiu do pendrive, passou pelo processador e pelo monitor, e tocou no alto-falante!',
        },
    ],
}

export const LEVELS: LevelDef[] = [N1]

export function validateLevels(levels: LevelDef[] = LEVELS) {
    const problems: string[] = []
    levels.forEach(level => {
        const tag = `N${level.level}`
        const ids = new Set<string>()
        level.pc.forEach(s => {
            if (ids.has(s.id)) problems.push(`${tag}: tomada repetida ${s.id}`)
            ids.add(s.id)
        })
        const has = (id: DeviceId) => level.devices.includes(id)
        level.asleep.forEach(id => {
            if (!level.missions.some(m => m.wake?.includes(id))) problems.push(`${tag}: ${id} dorme e nenhum pedido o acorda`)
        })
        level.missions.forEach(m => {
            const mtag = `${tag} ${m.id}`
            m.needs.forEach(id => {
                if (!has(id)) problems.push(`${mtag}: precisa de ${id}, que não está no mapa`)
            })
            if (!m.needs.includes(m.use)) problems.push(`${mtag}: o aparelho tocado não está em needs`)
            if (!m.needs.includes(m.goal.at)) problems.push(`${mtag}: o destino não está em needs`)
            if (DEVICES[m.use].sends !== m.goal.payload) problems.push(`${mtag}: ${m.use} não manda ${m.goal.payload}`)
            if (!DEVICES[m.goal.at].takes?.includes(m.goal.payload)) problems.push(`${mtag}: ${m.goal.at} não recebe ${m.goal.payload}`)
        })
    })
    if (problems.length) throw new Error(`Cabo Certo — níveis inválidos:\n${problems.join('\n')}`)
}

if (import.meta.env.DEV) validateLevels()
