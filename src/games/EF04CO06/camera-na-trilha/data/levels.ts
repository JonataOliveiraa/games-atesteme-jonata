import type { LevelDef, Mode, Order, Show } from '../types'
import { MAPS, frameAt, sizeOf, spotOf, validateMaps, within } from './maps'
import { DETAIL_MAX, SUBJECTS, WHOLE_MIN, moves } from './subjects'

export const POINTS = 10

export const guideKey = (level: number) => `camera-na-trilha-guide-${level}`

const order = (subject: Order['subject'], mode: Mode, hint: string, show?: Show): Order => ({ subject, mode, hint, show })

export const LEVELS: LevelDef[] = [
    {
        level: 1,
        title: 'O Prado do Lago',
        message: 'Fotos e vídeos prontos para a Feira de Ciências!',
        map: 'prado',
        tools: [],
        startMode: 'video',
        demo: [order('mushroom', 'photo', 'Cresce na sombra úmida.'), order('butterfly', 'video', 'Voa de flor em flor.')],
        phases: [
            { orders: [order('sunflower', 'photo', 'Ele vira para o sol.'), order('frog', 'video', 'Ele pula na beira do lago.')] },
            { orders: [order('frog', 'photo', 'Ele mora perto da água.'), order('lake', 'video', 'O vento faz ondinhas.')] },
            { orders: [order('waterfall', 'video', 'A água cai das pedras.'), order('duck', 'photo', 'Ele nada com os pés.')] },
        ],
    },
    {
        level: 2,
        title: 'A Gruta',
        message: 'Até no escuro você criou fotos e vídeos!',
        map: 'gruta',
        tools: ['light'],
        startMode: 'photo',
        demo: [order('bluecrystal', 'photo', 'Brilha com a luz.'), order('glowmoss', 'photo', 'Brilha sozinho.')],
        phases: [
            { orders: [order('crystal', 'photo', 'Cresce devagar na pedra.'), order('drops', 'video', 'A água pinga do teto.')] },
            { orders: [order('glowshroom', 'photo', 'Brilha sozinho no escuro.'), order('cavefish', 'video', 'Ele não tem olhos.')] },
            { orders: [order('fireflies', 'video', 'Piscam para conversar.'), order('stalagmite', 'photo', 'Cresce do chão, gota a gota.')] },
        ],
    },
    {
        level: 3,
        title: 'O Bosque',
        message: 'De perto e de longe: tudo pronto para a Feira!',
        map: 'bosque',
        tools: ['light', 'zoom'],
        startMode: 'photo',
        demo: [order('nest', 'photo', 'Os ovinhos são pequenos.', 'detail'), order('boulder', 'photo', 'Ela é bem grande.', 'whole')],
        phases: [
            {
                orders: [
                    order('ladybug', 'photo', 'Mostre as pintinhas.', 'detail'),
                    order('bigtree', 'photo', 'Ela inteira, da raiz à copa!', 'whole'),
                ],
            },
            {
                orders: [order('ants', 'video', 'Carregam folhas em fila.', 'detail'), order('anthill', 'photo', 'A casa delas inteira!', 'whole')],
            },
            {
                orders: [order('bee', 'video', 'Ela leva o pólen.', 'detail'), order('glowshroom', 'photo', 'Brilha na grota escura.', 'whole')],
            },
        ],
    },
]

export const ordersOf = (level: LevelDef) => level.phases.flatMap(phase => phase.orders)

export function validateLevels(levels: LevelDef[]): string[] {
    const problems: string[] = []
    levels.forEach(level => {
        const at = `nível ${level.level}`
        const map = MAPS[level.map]
        const here = new Set(map.spots.map(s => s.subject))
        const all = ordersOf(level)
        if (level.phases.length !== 3) problems.push(`${at}: precisa de 3 fases`)
        level.phases.forEach((phase, i) => {
            if (phase.orders.length !== 2) problems.push(`${at}, fase ${i + 1}: precisa de 2 pedidos`)
        })
        ;[...level.demo, ...all].forEach(o => {
            if (!here.has(o.subject)) problems.push(`${at}: ${o.subject} não está no mapa`)
            if (o.mode === 'video' && !moves(o.subject)) problems.push(`${at}: vídeo de ${o.subject}, que não se mexe`)
        })
        const modes = [level.startMode, ...all.map(o => o.mode)]
        for (let i = 2; i < all.length; i++)
            if (all[i].mode === all[i - 1].mode && all[i].mode === all[i - 2].mode) problems.push(`${at}: 3 pedidos seguidos em ${all[i].mode}`)
        if (!all.some((o, i) => o.mode === modes[i])) problems.push(`${at}: nenhum pedido já começa no modo certo`)
        if (!level.tools.length) {
            const both = all.some(a => all.some(b => a.subject === b.subject && a.mode !== b.mode))
            if (!both) problems.push(`${at}: nenhum assunto pedido nos dois formatos`)
        }
        level.demo.forEach(d => {
            if (all.some(o => o.subject === d.subject)) problems.push(`${at}: ${d.subject} da demonstração volta nas fases`)
        })
        if (level.tools.includes('light') && !level.tools.includes('zoom')) {
            if (level.phases[0].orders.some(o => SUBJECTS[o.subject].glows)) problems.push(`${at}: a fase 1 só pede LUZ acesa`)
            level.phases.slice(1).forEach((phase, i) => {
                const glows = phase.orders.filter(o => SUBJECTS[o.subject].glows).length
                if (glows !== 1) problems.push(`${at}, fase ${i + 2}: precisa de um pedido com LUZ apagada e um com LUZ acesa`)
            })
        }
        if (level.tools.includes('zoom')) {
            const shows = [...all, ...level.demo]
            shows.forEach(o => {
                const spot = spotOf(map, o.subject)
                const size = sizeOf(spot)
                if (o.show === 'detail') {
                    if (size > DETAIL_MAX) problems.push(`${at}: ${o.subject} é grande demais para pedir ZOOM`)
                    if (!within(frameAt(spot.view, spot.face, true), spot.at)) problems.push(`${at}: com ZOOM o visor não cobre ${o.subject}`)
                }
                if (o.show === 'whole' && size < WHOLE_MIN) problems.push(`${at}: ${o.subject} é pequeno demais para cortar com ZOOM`)
            })
            if (!all.some(o => o.show === 'detail') || !all.some(o => o.show === 'whole')) problems.push(`${at}: precisa de pedidos com e sem ZOOM`)
            for (let i = 1; i < all.length; i++)
                if (all[i].show && all[i].show === all[i - 1].show && all[i - 1].show === all[i - 2]?.show)
                    problems.push(`${at}: 3 pedidos seguidos iguais no ZOOM`)
        } else if (all.some(o => o.show)) problems.push(`${at}: pede ZOOM sem ter o botão`)
    })
    return problems
}

if (import.meta.env.DEV) {
    const problems = [...validateLevels(LEVELS), ...validateMaps(Object.values(MAPS))]
    if (problems.length) console.error('[camera-na-trilha]', problems)
}
