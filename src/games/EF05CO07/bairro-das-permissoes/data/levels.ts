import type { AppId, DecoSpot, LevelDef, PartId, Vec } from '../types'
import { PLACES } from './places'

export const POINTS = 10

export const MIN_GAP = 650

export const guideKey = (level: number) => `ef05co07-bairro-l${level}`

const line = (a: Vec, b: Vec): Vec[] => [a, b]

const N1: LevelDef = {
    level: 1,
    title: 'Só o sistema abre o portão',
    message: 'Os programas não alcançam as peças sozinhos. O sistema leva a peça para quem precisa e diz NÃO para quem não precisa.',
    intro: 'full',
    wait: false,
    world: { w: 3000, h: 1900 },
    start: { x: 1500, y: 1250 },
    plaza: { x: 1500, y: 1060, r: 270 },
    roads: [
        line({ x: 260, y: 640 }, { x: 2740, y: 640 }),
        line({ x: 260, y: 1060 }, { x: 2740, y: 1060 }),
        line({ x: 260, y: 1690 }, { x: 2740, y: 1690 }),
        line({ x: 260, y: 640 }, { x: 260, y: 1690 }),
        line({ x: 1500, y: 640 }, { x: 1500, y: 1690 }),
        line({ x: 2740, y: 640 }, { x: 2740, y: 1690 }),
    ],
    houses: [
        { id: 'fotos', at: { x: 480, y: 520 } },
        { id: 'camera', at: { x: 1130, y: 520 } },
        { id: 'contatos', at: { x: 1870, y: 520 } },
        { id: 'lanterna', at: { x: 2520, y: 520 } },
        { id: 'musica', at: { x: 480, y: 1570 } },
        { id: 'altofalante', at: { x: 1130, y: 1570 } },
        { id: 'microfone', at: { x: 1870, y: 1570 } },
        { id: 'calculadora', at: { x: 2520, y: 1570 } },
    ],
    decor: [
        { kind: 'chafariz', at: { x: 1500, y: 1110 } },
        { kind: 'arvore', at: { x: 700, y: 860 } },
        { kind: 'arvore', at: { x: 1030, y: 930 } },
        { kind: 'arvore', at: { x: 1990, y: 870 } },
        { kind: 'arvore', at: { x: 2330, y: 940 } },
        { kind: 'arvore', at: { x: 690, y: 1330 } },
        { kind: 'arvore', at: { x: 1060, y: 1420 } },
        { kind: 'arvore', at: { x: 1960, y: 1380 } },
        { kind: 'arvore', at: { x: 2330, y: 1330 } },
        { kind: 'pinheiro', at: { x: 120, y: 320 } },
        { kind: 'pinheiro', at: { x: 2880, y: 330 } },
        { kind: 'pinheiro', at: { x: 130, y: 1860 } },
        { kind: 'pinheiro', at: { x: 2870, y: 1860 } },
        { kind: 'pinheiro', at: { x: 420, y: 880 } },
        { kind: 'pinheiro', at: { x: 2580, y: 1260 } },
        { kind: 'arbusto', at: { x: 820, y: 560 } },
        { kind: 'arbusto', at: { x: 2200, y: 560 } },
        { kind: 'arbusto', at: { x: 800, y: 1610 } },
        { kind: 'arbusto', at: { x: 2200, y: 1610 } },
        { kind: 'flores', at: { x: 1280, y: 830 } },
        { kind: 'flores', at: { x: 1720, y: 830 } },
        { kind: 'flores', at: { x: 1280, y: 1300 } },
        { kind: 'flores', at: { x: 1720, y: 1300 } },
        { kind: 'banco', at: { x: 1300, y: 1000 } },
        { kind: 'banco', at: { x: 1700, y: 1000 } },
        { kind: 'poste', at: { x: 1190, y: 1150 } },
        { kind: 'poste', at: { x: 1810, y: 1150 } },
    ],
    using: [],
    calls: [
        {
            id: 'fotos-camera',
            app: 'fotos',
            wants: ['camera'],
            answer: 'pode',
            says: 'O app de FOTOS quer a CÂMERA.',
            why: 'As FOTOS precisam da CÂMERA para tirar foto!',
        },
        {
            id: 'lanterna-contatos',
            app: 'lanterna',
            wants: ['contatos'],
            answer: 'nao',
            says: 'A LANTERNA quer os seus CONTATOS.',
            why: 'A LANTERNA só ilumina. Ela não precisa dos seus CONTATOS!',
        },
        {
            id: 'calculadora-microfone',
            app: 'calculadora',
            wants: ['microfone'],
            answer: 'nao',
            says: 'A CALCULADORA quer o MICROFONE.',
            why: 'A CALCULADORA só faz conta. Ela não precisa ouvir você!',
        },
        {
            id: 'musica-altofalante',
            app: 'musica',
            wants: ['altofalante'],
            answer: 'pode',
            says: 'O app de MÚSICA quer o ALTO-FALANTE.',
            why: 'A MÚSICA precisa do ALTO-FALANTE para tocar!',
        },
    ],
}

const plazaDecor = (x: number, y: number): DecoSpot[] => [
    { kind: 'chafariz', at: { x, y: y + 50 } },
    { kind: 'banco', at: { x: x - 200, y: y - 60 } },
    { kind: 'banco', at: { x: x + 200, y: y - 60 } },
    { kind: 'poste', at: { x: x - 310, y: y + 90 } },
    { kind: 'poste', at: { x: x + 310, y: y + 90 } },
    { kind: 'flores', at: { x: x - 220, y: y - 230 } },
    { kind: 'flores', at: { x: x + 220, y: y - 230 } },
    { kind: 'flores', at: { x: x - 220, y: y + 240 } },
    { kind: 'flores', at: { x: x + 220, y: y + 240 } },
]

const N2: LevelDef = {
    level: 2,
    title: 'Um programa, duas peças',
    message: 'A VIDEOCHAMADA usou a CÂMERA e o MICROFONE juntos. O sistema buscou cada peça e guardou de volta quando o programa terminou.',
    intro: 'grow',
    wait: false,
    world: { w: 3900, h: 2500 },
    start: { x: 1950, y: 1180 },
    plaza: { x: 1950, y: 1000, r: 250 },
    roads: [
        line({ x: 260, y: 640 }, { x: 3640, y: 640 }),
        line({ x: 260, y: 1000 }, { x: 3640, y: 1000 }),
        line({ x: 260, y: 1540 }, { x: 3640, y: 1540 }),
        line({ x: 260, y: 2360 }, { x: 3640, y: 2360 }),
        line({ x: 260, y: 640 }, { x: 260, y: 2360 }),
        line({ x: 1950, y: 640 }, { x: 1950, y: 2360 }),
        line({ x: 3640, y: 640 }, { x: 3640, y: 2360 }),
    ],
    houses: [
        { id: 'fotos', at: { x: 450, y: 520 } },
        { id: 'camera', at: { x: 1150, y: 520 } },
        { id: 'mapa', at: { x: 1950, y: 520 } },
        { id: 'localizacao', at: { x: 2750, y: 520 } },
        { id: 'joguinho', at: { x: 3450, y: 520 } },
        { id: 'contatos', at: { x: 450, y: 1420 } },
        { id: 'microfone', at: { x: 1150, y: 1420 } },
        { id: 'videochamada', at: { x: 2750, y: 1420 } },
        { id: 'lanterna', at: { x: 3450, y: 1420 } },
        { id: 'musica', at: { x: 450, y: 2240 } },
        { id: 'altofalante', at: { x: 1150, y: 2240 } },
        { id: 'calculadora', at: { x: 2750, y: 2240 } },
    ],
    decor: [
        ...plazaDecor(1950, 1000),
        { kind: 'arvore', at: { x: 800, y: 830 } },
        { kind: 'arvore', at: { x: 1550, y: 860 } },
        { kind: 'arvore', at: { x: 2380, y: 860 } },
        { kind: 'arvore', at: { x: 3100, y: 830 } },
        { kind: 'arvore', at: { x: 800, y: 1780 } },
        { kind: 'arvore', at: { x: 3100, y: 1780 } },
        { kind: 'arvore', at: { x: 2350, y: 1300 } },
        { kind: 'pinheiro', at: { x: 120, y: 320 } },
        { kind: 'pinheiro', at: { x: 3780, y: 330 } },
        { kind: 'pinheiro', at: { x: 130, y: 2450 } },
        { kind: 'pinheiro', at: { x: 3770, y: 2450 } },
        { kind: 'pinheiro', at: { x: 130, y: 1260 } },
        { kind: 'arbusto', at: { x: 800, y: 560 } },
        { kind: 'arbusto', at: { x: 2350, y: 560 } },
        { kind: 'arbusto', at: { x: 800, y: 1460 } },
        { kind: 'arbusto', at: { x: 3100, y: 1460 } },
        { kind: 'arbusto', at: { x: 800, y: 2280 } },
        { kind: 'escorregador', at: { x: 1600, y: 1820 } },
        { kind: 'gangorra', at: { x: 2300, y: 1820 } },
        { kind: 'lago', at: { x: 3450, y: 2230 } },
        { kind: 'sorvete', at: { x: 2150, y: 2250 } },
        { kind: 'pedra', at: { x: 3100, y: 1300 } },
        { kind: 'hidrante', at: { x: 800, y: 1600 } },
        { kind: 'correio', at: { x: 2520, y: 2290 } },
        { kind: 'canteiro', at: { x: 1550, y: 1290 } },
    ],
    using: [],
    calls: [
        {
            id: 'mapa-localizacao',
            app: 'mapa',
            wants: ['localizacao'],
            answer: 'pode',
            says: 'O MAPA quer a LOCALIZAÇÃO.',
            why: 'O MAPA precisa da LOCALIZAÇÃO para mostrar onde você está!',
        },
        {
            id: 'joguinho-contatos',
            app: 'joguinho',
            wants: ['contatos'],
            answer: 'nao',
            says: 'O JOGUINHO quer os seus CONTATOS.',
            why: 'O JOGUINHO é para brincar. Ele não precisa dos seus CONTATOS!',
        },
        {
            id: 'video-camera-microfone',
            app: 'videochamada',
            wants: ['camera', 'microfone'],
            answer: 'pode',
            says: 'A VIDEOCHAMADA quer a CÂMERA e o MICROFONE.',
            why: 'A VIDEOCHAMADA precisa da CÂMERA para ver e do MICROFONE para ouvir!',
        },
        {
            id: 'lanterna-localizacao',
            app: 'lanterna',
            wants: ['localizacao'],
            answer: 'nao',
            says: 'A LANTERNA quer a LOCALIZAÇÃO.',
            why: 'A LANTERNA só ilumina. Ela não precisa saber onde você está!',
        },
        {
            id: 'joguinho-altofalante',
            app: 'joguinho',
            wants: ['altofalante'],
            answer: 'pode',
            says: 'O JOGUINHO quer o ALTO-FALANTE.',
            why: 'O JOGUINHO precisa do ALTO-FALANTE para fazer os sons!',
        },
    ],
}

const N3: LevelDef = {
    level: 3,
    title: 'Uma de cada vez',
    message: 'Uma peça atende um programa de cada vez. Quando ela está em uso, o sistema faz o outro programa esperar a vez.',
    intro: 'busy',
    wait: true,
    world: { w: 4600, h: 2900 },
    start: { x: 2300, y: 1230 },
    plaza: { x: 2300, y: 1040, r: 250 },
    roads: [
        line({ x: 260, y: 640 }, { x: 4340, y: 640 }),
        line({ x: 260, y: 1040 }, { x: 4340, y: 1040 }),
        line({ x: 260, y: 1570 }, { x: 4340, y: 1570 }),
        line({ x: 260, y: 2540 }, { x: 4340, y: 2540 }),
        line({ x: 260, y: 640 }, { x: 260, y: 2540 }),
        line({ x: 1775, y: 640 }, { x: 1775, y: 2540 }),
        line({ x: 2825, y: 640 }, { x: 2825, y: 2540 }),
        line({ x: 4340, y: 640 }, { x: 4340, y: 2540 }),
    ],
    houses: [
        { id: 'fotos', at: { x: 450, y: 520 } },
        { id: 'camera', at: { x: 1250, y: 520 } },
        { id: 'contatos', at: { x: 2300, y: 520 } },
        { id: 'mapa', at: { x: 3350, y: 520 } },
        { id: 'lanterna', at: { x: 4150, y: 520 } },
        { id: 'microfone', at: { x: 450, y: 1450 } },
        { id: 'videochamada', at: { x: 1250, y: 1450 } },
        { id: 'localizacao', at: { x: 3350, y: 1450 } },
        { id: 'joguinho', at: { x: 4150, y: 1450 } },
        { id: 'musica', at: { x: 450, y: 2420 } },
        { id: 'calculadora', at: { x: 1250, y: 2420 } },
        { id: 'altofalante', at: { x: 2300, y: 2420 } },
    ],
    decor: [
        ...plazaDecor(2300, 1040),
        { kind: 'arvore', at: { x: 850, y: 840 } },
        { kind: 'arvore', at: { x: 1450, y: 870 } },
        { kind: 'arvore', at: { x: 3150, y: 870 } },
        { kind: 'arvore', at: { x: 3750, y: 840 } },
        { kind: 'arvore', at: { x: 850, y: 1880 } },
        { kind: 'arvore', at: { x: 1500, y: 1900 } },
        { kind: 'arvore', at: { x: 2550, y: 1880 } },
        { kind: 'arvore', at: { x: 3150, y: 1900 } },
        { kind: 'arvore', at: { x: 3750, y: 1880 } },
        { kind: 'arvore', at: { x: 1400, y: 2760 } },
        { kind: 'arvore', at: { x: 3200, y: 2760 } },
        { kind: 'pinheiro', at: { x: 130, y: 320 } },
        { kind: 'pinheiro', at: { x: 4470, y: 330 } },
        { kind: 'pinheiro', at: { x: 130, y: 2800 } },
        { kind: 'pinheiro', at: { x: 4470, y: 2800 } },
        { kind: 'pinheiro', at: { x: 600, y: 2760 } },
        { kind: 'pinheiro', at: { x: 2300, y: 2780 } },
        { kind: 'pinheiro', at: { x: 4000, y: 2760 } },
        { kind: 'arbusto', at: { x: 850, y: 560 } },
        { kind: 'arbusto', at: { x: 1775, y: 560 } },
        { kind: 'arbusto', at: { x: 2825, y: 560 } },
        { kind: 'arbusto', at: { x: 3750, y: 560 } },
        { kind: 'arbusto', at: { x: 850, y: 1490 } },
        { kind: 'arbusto', at: { x: 3750, y: 1490 } },
        { kind: 'escorregador', at: { x: 3250, y: 2380 } },
        { kind: 'lago', at: { x: 3750, y: 2360 } },
        { kind: 'gangorra', at: { x: 4200, y: 2380 } },
        { kind: 'sorvete', at: { x: 2050, y: 1880 } },
        { kind: 'pedra', at: { x: 4150, y: 1900 } },
        { kind: 'hidrante', at: { x: 1000, y: 1630 } },
        { kind: 'correio', at: { x: 3600, y: 1630 } },
        { kind: 'canteiro', at: { x: 2300, y: 1380 } },
        { kind: 'canteiro', at: { x: 1775, y: 2760 } },
    ],
    using: [{ part: 'altofalante', app: 'joguinho' }],
    calls: [
        {
            id: 'fotos-camera',
            app: 'fotos',
            wants: ['camera'],
            answer: 'pode',
            keep: true,
            says: 'As FOTOS querem a CÂMERA.',
            why: 'As FOTOS precisam da CÂMERA para tirar foto!',
        },
        {
            id: 'video-espera',
            app: 'videochamada',
            wants: ['camera', 'microfone'],
            answer: 'espera',
            keep: true,
            says: 'A VIDEOCHAMADA quer a CÂMERA e o MICROFONE.',
            why: 'A CÂMERA está com as FOTOS. Uma de cada vez: espere a vez!',
        },
        {
            id: 'joguinho-camera',
            app: 'joguinho',
            wants: ['camera'],
            answer: 'nao',
            says: 'O JOGUINHO quer a CÂMERA.',
            why: 'O JOGUINHO é para brincar. Ele não precisa da CÂMERA!',
        },
        {
            id: 'musica-espera',
            app: 'musica',
            wants: ['altofalante'],
            answer: 'espera',
            says: 'A MÚSICA quer o ALTO-FALANTE.',
            why: 'O ALTO-FALANTE está com o JOGUINHO. Uma de cada vez: espere a vez!',
        },
        {
            id: 'mapa-localizacao',
            app: 'mapa',
            wants: ['localizacao'],
            answer: 'pode',
            says: 'O MAPA quer a LOCALIZAÇÃO.',
            why: 'O MAPA precisa da LOCALIZAÇÃO para mostrar onde você está!',
        },
    ],
}

export const LEVELS: LevelDef[] = [N1, N2, N3]

export function validateLevels(levels: LevelDef[] = LEVELS) {
    const problems: string[] = []
    levels.forEach(level => {
        const tag = `N${level.level}`
        const seen = new Set<string>()
        level.houses.forEach((a, i) => {
            if (seen.has(a.id)) problems.push(`${tag}: casa repetida ${a.id}`)
            seen.add(a.id)
            level.houses.slice(i + 1).forEach(b => {
                const d = Math.hypot(a.at.x - b.at.x, a.at.y - b.at.y)
                if (d < MIN_GAP) problems.push(`${tag}: ${a.id} e ${b.id} estão perto demais (${Math.round(d)})`)
            })
            if (a.at.x < 200 || a.at.x > level.world.w - 200 || a.at.y < 360 || a.at.y > level.world.h - 200)
                problems.push(`${tag}: ${a.id} fora do bairro`)
            level.decor.forEach(d => {
                if (Math.abs(d.at.x - a.at.x) < 160 && d.at.y > a.at.y - 110 && d.at.y < a.at.y + 140)
                    problems.push(`${tag}: ${d.kind} em (${d.at.x}, ${d.at.y}) na frente da porta de ${a.id}`)
            })
        })
        if (level.calls.length > 5) problems.push(`${tag}: mais de 5 chamados`)
        const answers = new Set(level.calls.map(c => c.answer))
        if (answers.size < 2) problems.push(`${tag}: só uma resposta possível`)
        if (level.wait !== answers.has('espera')) problems.push(`${tag}: ESPERAR só existe no nível que tem chamado de espera`)
        const busy = new Map<PartId, AppId>(level.using.map(u => [u.part, u.app]))
        level.calls.forEach(c => {
            if (!seen.has(c.app)) problems.push(`${tag} ${c.id}: a casa ${c.app} não está no bairro`)
            if (PLACES[c.app].family !== 'app') problems.push(`${tag} ${c.id}: ${c.app} não é programa`)
            if (!c.wants.length || c.wants.length > 2) problems.push(`${tag} ${c.id}: pede de 1 a 2 peças`)
            c.wants.forEach(p => {
                if (!seen.has(p)) problems.push(`${tag} ${c.id}: a oficina ${p} não está no bairro`)
                if (PLACES[p].family !== 'peca') problems.push(`${tag} ${c.id}: ${p} não é peça`)
            })
            const held = c.wants.filter(p => busy.has(p) && busy.get(p) !== c.app)
            if (c.answer === 'pode' && held.length) problems.push(`${tag} ${c.id}: PODE com peça em uso (${held.join(', ')})`)
            if (c.answer === 'espera' && !held.length) problems.push(`${tag} ${c.id}: ESPERAR sem nenhuma peça em uso`)
            if (c.answer === 'nao' && c.keep) problems.push(`${tag} ${c.id}: NÃO PODE não fica com peça`)
            if (c.answer === 'nao') return
            c.wants.forEach(p => busy.delete(p))
            if (c.keep) c.wants.forEach(p => busy.set(p, c.app))
        })
    })
    if (problems.length) throw new Error(`Bairro das Permissões — níveis inválidos:\n${problems.join('\n')}`)
}

if (import.meta.env.DEV) validateLevels()
