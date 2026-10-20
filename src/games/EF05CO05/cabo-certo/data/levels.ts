import type { DeviceId, Kind, LevelDef, MissionDef } from '../types'
import { DEVICES } from './devices'

export const POINTS = 2

export const MAX_MISSIONS = 5

export const guideKey = (level: number) => `ef05co05-cabo-l${level}`
export const BASICS_KEY = 'ef05co05-cabo-basics'
export const teachKey = (topic: string) => `ef05co05-cabo-teach-${topic}`

/**
 * N1: uma tomada de cada família e dois aparelhos por pedido, um de cada lado
 * do computador e longe dele. Tudo cabe na tela, sem andar pelo mapa. Entre
 * um pedido e outro os cabos se soltam: cada pedido começa com a mesa limpa.
 */
const N1: LevelDef = {
    level: 1,
    title: 'Cada cabo na sua tomada',
    message: 'Entra, processa, guarda e mostra: cada parte do computador tem a sua função, e tudo passa pelo processador.',
    pc: [
        { id: 'pc-entrada', kind: 'entrada', at: { x: -180, y: 0 } },
        { id: 'pc-saida', kind: 'saida', at: { x: 180, y: 0 } },
        { id: 'pc-armazenamento', kind: 'armazenamento', at: { x: 0, y: 220 } },
    ],
    nested: true,
    reset: true,
    plates: true,
    missions: [
        {
            id: 'escrever',
            ask: 'Quero escrever e ver na tela.',
            needs: ['teclado', 'monitor'],
            use: 'teclado',
            goal: { payload: 'texto', at: 'monitor' },
            place: { teclado: { x: 700, y: 760 }, monitor: { x: 1700, y: 650 } },
            done: 'ENTRA → PROCESSA → MOSTRA',
        },
        {
            id: 'gravar',
            ask: 'Quero gravar minha voz e guardar.',
            needs: ['microfone', 'pendrive'],
            use: 'microfone',
            goal: { payload: 'voz', at: 'pendrive' },
            place: { microfone: { x: 700, y: 700 }, pendrive: { x: 1700, y: 840 } },
            done: 'ENTRA → PROCESSA → GUARDA',
        },
        {
            id: 'ouvir',
            ask: 'Quero ver e ouvir a música do pendrive.',
            needs: ['pendrive', 'monitor', 'altofalante'],
            use: 'pendrive',
            goal: { payload: 'musica', at: 'altofalante' },
            place: { pendrive: { x: 700, y: 840 }, monitor: { x: 1690, y: 540 }, altofalante: { x: 1720, y: 880 } },
            nested: true,
            later: ['altofalante'],
            done: 'GUARDADA → PROCESSA → MONITOR → SAI',
        },
    ],
}

/**
 * N2: mais tomadas de ENTRADA, a MEMÓRIA, aparelhos que nenhum pedido usa e
 * aparelhos fora da vista. As tomadas mostram só o ícone.
 */
const N2: LevelDef = {
    level: 2,
    title: 'Memória e armazenamento',
    message: 'A memória segura só enquanto o computador usa. O armazenamento guarda para depois, até para o ano que vem.',
    pc: [
        { id: 'pc-entrada-1', kind: 'entrada', at: { x: -180, y: -115 } },
        { id: 'pc-entrada-2', kind: 'entrada', at: { x: -180, y: 0 } },
        { id: 'pc-entrada-3', kind: 'entrada', at: { x: -180, y: 115 } },
        { id: 'pc-saida', kind: 'saida', at: { x: 180, y: 0 } },
        { id: 'pc-memoria', kind: 'memoria', at: { x: -95, y: 220 } },
        { id: 'pc-armazenamento', kind: 'armazenamento', at: { x: 95, y: 220 } },
    ],
    nested: false,
    reset: true,
    plates: false,
    missions: [
        {
            id: 'desenhar',
            ask: 'Quero desenhar e ver na tela.',
            needs: ['mouse', 'monitor'],
            use: 'mouse',
            goal: { payload: 'cursor', at: 'monitor' },
            place: { mouse: { x: 330, y: 640 }, monitor: { x: 1700, y: 600 }, teclado: { x: 720, y: 830 } },
            extra: ['teclado'],
            done: 'ENTRA → PROCESSA → MOSTRA',
        },
        {
            id: 'segurar',
            ask: 'Segure meu texto só enquanto eu edito.',
            needs: ['teclado', 'memoria'],
            use: 'teclado',
            goal: { payload: 'texto', at: 'memoria' },
            place: { teclado: { x: 700, y: 620 }, memoria: { x: 700, y: 860 }, pendrive: { x: 1690, y: 860 } },
            extra: ['pendrive'],
            teach: 'memoria',
            done: 'ENTRA → PROCESSA → SEGURA',
        },
        {
            id: 'guardar',
            ask: 'Guarde minha foto para o ano que vem.',
            needs: ['camera', 'pendrive'],
            use: 'camera',
            goal: { payload: 'foto', at: 'pendrive' },
            place: { camera: { x: 640, y: 250 }, pendrive: { x: 1690, y: 860 }, memoria: { x: 700, y: 860 } },
            extra: ['memoria'],
            done: 'ENTRA → PROCESSA → GUARDA',
        },
        {
            id: 'falar',
            ask: 'Quero falar e ouvir no alto-falante.',
            needs: ['microfone', 'altofalante'],
            use: 'microfone',
            goal: { payload: 'voz', at: 'altofalante' },
            place: {
                microfone: { x: 300, y: 960 },
                altofalante: { x: 1720, y: 640 },
                mouse: { x: 700, y: 520 },
                teclado: { x: 720, y: 830 },
            },
            extra: ['mouse', 'teclado'],
            done: 'ENTRA → PROCESSA → SAI',
        },
    ],
}

/**
 * N3: o aninhamento em escala. Uma ENTRADA só no computador (o HUB dá mais),
 * a câmera leva o cartão, e a mesa vai sendo montada: os cabos não se soltam
 * entre um pedido e outro. Os pedidos só dizem o resultado.
 */
const N3: LevelDef = {
    level: 3,
    title: 'Cabo dentro de cabo',
    message: 'Um aparelho pode dar tomada para outro. A informação passa por cada cabo do caminho, mas sempre pelo processador.',
    pc: [
        { id: 'pc-entrada', kind: 'entrada', at: { x: -180, y: 0 } },
        { id: 'pc-saida', kind: 'saida', at: { x: 180, y: 0 } },
        { id: 'pc-armazenamento', kind: 'armazenamento', at: { x: 0, y: 220 } },
    ],
    nested: true,
    reset: false,
    plates: false,
    missions: [
        {
            id: 'letras',
            ask: 'As letras na tela.',
            needs: ['hub', 'monitor', 'teclado'],
            use: 'teclado',
            goal: { payload: 'texto', at: 'monitor' },
            place: { hub: { x: 800, y: 700 }, monitor: { x: 1700, y: 560 }, teclado: { x: 400, y: 560 } },
            nested: true,
            later: ['teclado'],
            teach: 'hub',
            done: 'TECLADO → HUB → PROCESSA → MOSTRA',
        },
        {
            id: 'musica',
            ask: 'A música tocando no alto-falante.',
            needs: ['pendrive', 'monitor', 'altofalante'],
            use: 'pendrive',
            goal: { payload: 'musica', at: 'altofalante' },
            place: { pendrive: { x: 860, y: 1080 }, monitor: { x: 1700, y: 560 }, altofalante: { x: 2060, y: 820 } },
            nested: true,
            later: ['altofalante'],
            done: 'GUARDADA → PROCESSA → MONITOR → SAI',
        },
        {
            id: 'foto',
            ask: 'A foto guardada no cartão.',
            needs: ['hub', 'camera', 'cartao', 'monitor'],
            use: 'camera',
            goal: { payload: 'foto', at: 'cartao' },
            place: { hub: { x: 800, y: 700 }, camera: { x: 440, y: 880 }, cartao: { x: 250, y: 1110 }, monitor: { x: 1700, y: 560 } },
            nested: true,
            later: ['cartao'],
            teach: 'cartao',
            done: 'CÂMERA → HUB → PROCESSA → CARTÃO',
        },
        {
            id: 'voz',
            ask: 'Minha voz no alto-falante.',
            needs: ['hub', 'microfone', 'monitor', 'altofalante'],
            use: 'microfone',
            goal: { payload: 'voz', at: 'altofalante' },
            place: {
                hub: { x: 800, y: 700 },
                microfone: { x: 420, y: 400 },
                monitor: { x: 1700, y: 560 },
                altofalante: { x: 2060, y: 820 },
            },
            nested: true,
            done: 'MICROFONE → HUB → PROCESSA → SAI',
        },
    ],
}

export const LEVELS: LevelDef[] = [N1, N2, N3]

/** Os aparelhos que aparecem na mesa do pedido: os que ele precisa e os que só enfeitam. */
export const onTable = (m: MissionDef): DeviceId[] => [...m.needs, ...(m.extra ?? [])]

/** Todos os aparelhos que algum pedido do nível põe na mesa. */
export const devicesOf = (level: LevelDef): DeviceId[] => [...new Set(level.missions.flatMap(onTable))]

const ownSockets = (level: LevelDef, m: MissionDef, ids: DeviceId[]) =>
    level.nested && m.nested ? ids.flatMap(id => DEVICES[id].sockets ?? []) : []

export function validateLevels(levels: LevelDef[] = LEVELS) {
    const problems: string[] = []
    levels.forEach((level, li) => {
        const tag = `N${level.level}`
        if (level.level !== li + 1) problems.push(`${tag}: fora de ordem`)
        if (!level.missions.length || level.missions.length > MAX_MISSIONS) problems.push(`${tag}: precisa de 1 a ${MAX_MISSIONS} pedidos`)
        const ids = new Set<string>()
        level.pc.forEach(s => {
            if (ids.has(s.id)) problems.push(`${tag}: tomada repetida ${s.id}`)
            ids.add(s.id)
        })
        const taught = new Set<string>()
        let table: DeviceId[] = []
        level.missions.forEach(m => {
            const mtag = `${tag} ${m.id}`
            onTable(m).forEach(id => {
                if (!m.place[id]) problems.push(`${mtag}: ${id} não tem lugar no mapa`)
            })
            m.extra?.forEach(id => {
                if (m.needs.includes(id)) problems.push(`${mtag}: ${id} está em needs e em extra`)
            })
            table = level.reset ? onTable(m) : [...new Set([...table, ...onTable(m)])]
            const own = ownSockets(level, m, table)
            const kinds: Kind[] = ['entrada', 'saida', 'armazenamento', 'memoria']
            kinds.forEach(k => {
                const devices = table.filter(id => DEVICES[id].kind === k).length
                const room = level.pc.filter(s => s.kind === k).length + own.filter(s => s.kind === k).length
                if (devices > room) problems.push(`${mtag}: ${devices} aparelhos de ${k} e só ${room} tomadas`)
            })
            m.needs.forEach(id => {
                const k = DEVICES[id].kind
                if (!level.pc.some(s => s.kind === k) && !own.some(s => s.kind === k)) problems.push(`${mtag}: nenhuma tomada de ${k} para ${id}`)
            })
            m.later?.forEach(id => {
                if (!m.needs.includes(id)) problems.push(`${mtag}: ${id} entra depois mas não está em needs`)
                if (m.nested && !own.some(s => s.kind === DEVICES[id].kind)) problems.push(`${mtag}: ${id} entra depois sem tomada própria para ele`)
            })
            if (m.later?.length && m.later.length >= m.needs.length) problems.push(`${mtag}: nenhum aparelho começa na mesa`)
            if (!m.needs.includes(m.use)) problems.push(`${mtag}: o aparelho tocado não está em needs`)
            if (!m.needs.includes(m.goal.at)) problems.push(`${mtag}: o destino não está em needs`)
            if (DEVICES[m.use].sends !== m.goal.payload) problems.push(`${mtag}: ${m.use} não manda ${m.goal.payload}`)
            if (!DEVICES[m.goal.at].takes?.includes(m.goal.payload)) problems.push(`${mtag}: ${m.goal.at} não recebe ${m.goal.payload}`)
            if (m.teach) {
                if (taught.has(m.teach)) problems.push(`${mtag}: ${m.teach} já foi ensinado`)
                taught.add(m.teach)
            }
            if (m.teach === 'memoria' && !(m.needs.includes('memoria') && onTable(m).includes('pendrive')))
                problems.push(`${mtag}: a estreia da memória precisa da memória e do pendrive na mesa`)
            if ((m.teach === 'hub' || m.teach === 'cartao') && !m.later?.length) problems.push(`${mtag}: a estreia de ${m.teach} acontece quando o aparelho de depois entra`)
        })
        if (!level.reset && level.missions.some(m => m.extra?.length)) problems.push(`${tag}: sem reset, aparelho extra fica para sempre na mesa`)
    })
    if (problems.length) throw new Error(`Cabo Certo — níveis inválidos:\n${problems.join('\n')}`)
}

if (import.meta.env.DEV) validateLevels()
