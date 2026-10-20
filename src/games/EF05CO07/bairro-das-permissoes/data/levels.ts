import type { LevelDef } from '../types'
import { PLACES } from './places'

export const POINTS = 10

export const MIN_GAP = 650

export const guideKey = (level: number) => `ef05co07-bairro-l${level}`

const N1: LevelDef = {
    level: 1,
    title: 'Só o sistema abre o portão',
    message: 'Os programas não alcançam as peças sozinhos. O sistema leva a peça para quem precisa e diz NÃO para quem não precisa.',
    world: { w: 3000, h: 1900 },
    start: { x: 1500, y: 1250 },
    plaza: { x: 1500, y: 1060, r: 270 },
    roads: [
        [
            { x: 260, y: 640 },
            { x: 2740, y: 640 },
        ],
        [
            { x: 260, y: 1060 },
            { x: 2740, y: 1060 },
        ],
        [
            { x: 260, y: 1690 },
            { x: 2740, y: 1690 },
        ],
        [
            { x: 260, y: 640 },
            { x: 260, y: 1690 },
        ],
        [
            { x: 1500, y: 640 },
            { x: 1500, y: 1690 },
        ],
        [
            { x: 2740, y: 640 },
            { x: 2740, y: 1690 },
        ],
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
    calls: [
        {
            id: 'fotos-camera',
            app: 'fotos',
            wants: 'camera',
            ok: true,
            says: 'O app de FOTOS quer a CÂMERA.',
            why: 'As FOTOS precisam da CÂMERA para tirar foto!',
        },
        {
            id: 'lanterna-contatos',
            app: 'lanterna',
            wants: 'contatos',
            ok: false,
            says: 'A LANTERNA quer os seus CONTATOS.',
            why: 'A LANTERNA só ilumina. Ela não precisa dos seus CONTATOS!',
        },
        {
            id: 'calculadora-microfone',
            app: 'calculadora',
            wants: 'microfone',
            ok: false,
            says: 'A CALCULADORA quer o MICROFONE.',
            why: 'A CALCULADORA só faz conta. Ela não precisa ouvir você!',
        },
        {
            id: 'musica-altofalante',
            app: 'musica',
            wants: 'altofalante',
            ok: true,
            says: 'O app de MÚSICA quer o ALTO-FALANTE.',
            why: 'A MÚSICA precisa do ALTO-FALANTE para tocar!',
        },
    ],
}

export const LEVELS: LevelDef[] = [N1]

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
        })
        if (level.calls.length > 5) problems.push(`${tag}: mais de 5 chamados`)
        if (level.calls.every(c => c.ok) || level.calls.every(c => !c.ok)) problems.push(`${tag}: só uma resposta possível`)
        level.calls.forEach(c => {
            if (!seen.has(c.app)) problems.push(`${tag} ${c.id}: a casa ${c.app} não está no bairro`)
            if (!seen.has(c.wants)) problems.push(`${tag} ${c.id}: a oficina ${c.wants} não está no bairro`)
            if (PLACES[c.app].family !== 'app') problems.push(`${tag} ${c.id}: ${c.app} não é programa`)
            if (PLACES[c.wants].family !== 'peca') problems.push(`${tag} ${c.id}: ${c.wants} não é peça`)
        })
    })
    if (problems.length) throw new Error(`Bairro das Permissões — níveis inválidos:\n${problems.join('\n')}`)
}

if (import.meta.env.DEV) validateLevels()
