import { ITEM_GAP, PAPER, PAPER_PAD } from './layout'
import type { Item, LevelDef, Reach, Sheet } from '../types'

const FAR: Record<Reach, number> = { ninguem: 0, turma: 1, escola: 2, mundo: 3 }

/** Precisa de tarja quando o papel vai mais longe do que aquele dado pode ir. */
export const needsCover = (item: Item, level: LevelDef) => FAR[level.reach] > FAR[item.reach]

/** Cada item tapado exatamente quando devia. Nada além disso é o veredito. */
export const canStamp = (sheet: Sheet, covered: Set<string>, level: LevelDef) =>
    sheet.items.every(item => needsCover(item, level) === covered.has(item.id))

export const pending = (sheet: Sheet, covered: Set<string>, level: LevelDef) =>
    sheet.items.filter(item => needsCover(item, level) !== covered.has(item.id))

export const pointsFor = (locked: boolean) => (locked ? 5 : 10)

const center = (item: Item) => ({
    x: item.box.x + item.box.w / 2,
    y: item.box.y + item.box.h / 2,
})

/**
 * O NÍVEL 1 inteiro: três papéis, todos indo para o MURAL DA SALA.
 *
 * A fase 1.1 é estreia e tem UM dado sensível; a 1.2 tem dois e estreia a
 * assinatura, que nunca se tapa; a 1.3 troca texto por ROSTO — quem aparece na
 * foto é um dado como qualquer outro. Os níveis 2 e 3 entram depois da
 * avaliação, e é o DESTINO deles que muda o veredito.
 */
export const LEVELS: LevelDef[] = [
    {
        level: 1,
        title: 'Mural da sala',
        closing: 'O que é de outra pessoa você tapou. O resto pode ser visto.',
        goal: 'Confira antes de aprovar',
        destination: 'muralDaSala',
        reach: 'turma',
        sheets: [
            {
                id: '1.1',
                who: 'duda',
                ask: 'Posso pôr o cartaz do campeonato no mural?',
                praise: 'Agora sim! Todo mundo vai querer jogar.',
                glued: { art: 'quadra', x: 40, y: 44, w: 230, h: 165 },
                lines: [
                    { text: 'CAMPEONATO DE QUEIMADA', x: 300, y: 44, size: 32, black: true, wrap: 520 },
                    { text: 'quinta, no recreio, na quadra', x: 302, y: 96, size: 24 },
                    { text: 'Faça um time com cinco pessoas.', x: 40, y: 246, size: 20 },
                    { text: 'A lista dos times fica no tablet da sala.', x: 300, y: 170, size: 18, soft: true },
                    { text: 'Senha do tablet:', x: 300, y: 204, size: 18, soft: true },
                    { text: 'Organiza:', x: 40, y: 320, size: 18, soft: true },
                ],
                items: [
                    {
                        id: 'senha',
                        kind: 'senha',
                        text: 'pipoca7',
                        reading: 'pipoca7',
                        owner: 'duda',
                        reach: 'ninguem',
                        box: { x: 470, y: 200, w: 120, h: 34 },
                    },
                    {
                        id: 'nome',
                        kind: 'nome',
                        text: 'Duda Lima',
                        reading: 'Duda Lima',
                        owner: 'duda',
                        reach: 'escola',
                        box: { x: 150, y: 316, w: 160, h: 34 },
                    },
                ],
            },
            {
                id: '1.2',
                who: 'bia',
                ask: 'A ficha do passeio já pode ir pro mural?',
                praise: 'Ficou do jeito que a turma precisa saber.',
                glued: { art: 'parque', x: 40, y: 44, w: 210, h: 150 },
                lines: [
                    { text: 'FICHA DO PASSEIO AO PARQUE', x: 290, y: 44, size: 30, black: true, wrap: 530 },
                    { text: 'sexta, saída às 8h', x: 292, y: 92, size: 24 },
                    { text: 'Levar lanche, boné e água.', x: 40, y: 230, size: 20 },
                    { text: 'Cuidado especial:', x: 300, y: 150, size: 18, soft: true },
                    { text: 'Mora em:', x: 40, y: 300, size: 18, soft: true },
                    { text: 'Desenho do cartaz:', x: 440, y: 338, size: 18, soft: true },
                ],
                items: [
                    {
                        id: 'alergia',
                        kind: 'saude',
                        text: 'Bia: alergia a amendoim',
                        reading: 'Bia: alergia a amendoim',
                        owner: 'bia',
                        reach: 'ninguem',
                        box: { x: 300, y: 186, w: 320, h: 34 },
                    },
                    {
                        id: 'casa',
                        kind: 'endereco',
                        text: 'R. das Flores, 12',
                        reading: 'R. das Flores, 12',
                        owner: 'teo',
                        reach: 'ninguem',
                        box: { x: 150, y: 296, w: 250, h: 34 },
                    },
                    {
                        id: 'autor',
                        kind: 'assinatura',
                        text: 'Rafa',
                        reading: 'Rafa',
                        owner: 'rafa',
                        reach: 'mundo',
                        box: { x: 440, y: 372, w: 90, h: 34 },
                    },
                ],
            },
            {
                id: '1.3',
                who: 'teo',
                ask: 'Tirei essa foto no passeio! Dá pra pôr no mural?',
                praise: 'Agora é só a nossa turma na parede.',
                glued: { art: 'parque', x: 40, y: 56, w: 390, h: 260 },
                lines: [
                    { text: 'A TURMA NO PASSEIO', x: 470, y: 60, size: 32, black: true, wrap: 350 },
                    { text: 'foi no parque, e foi demais', x: 472, y: 152, size: 22 },
                    { text: 'Quem aparece:', x: 470, y: 250, size: 18, soft: true },
                ],
                items: [
                    {
                        id: 'rosto1',
                        kind: 'rosto',
                        text: '',
                        reading: 'alguém de outra turma',
                        owner: 'estranho',
                        reach: 'ninguem',
                        box: { x: 96, y: 150, w: 80, h: 120 },
                    },
                    {
                        id: 'rosto2',
                        kind: 'rosto',
                        text: '',
                        reading: 'alguém de outra turma',
                        owner: 'estranho',
                        reach: 'ninguem',
                        box: { x: 286, y: 158, w: 80, h: 120 },
                    },
                    {
                        id: 'nomes',
                        kind: 'nome',
                        text: 'Bia e Téo',
                        reading: 'Bia e Téo',
                        owner: 'bia',
                        reach: 'escola',
                        box: { x: 470, y: 286, w: 180, h: 34 },
                    },
                ],
            },
        ],
    },
]

/**
 * A conferência que impede as duas estratégias preguiçosas: carimbar sem olhar
 * e tapar tudo. Sem ela, um papel mal escrito passa e ninguém percebe.
 */
export function validateLevels(levels: LevelDef[]): string[] {
    const problems: string[] = []

    levels.forEach(level => {
        if (level.sheets.length < 1 || level.sheets.length > 5) {
            problems.push(`nível ${level.level}: ${level.sheets.length} papéis`)
        }

        level.sheets.forEach(sheet => {
            const toCover = sheet.items.filter(item => needsCover(item, level))
            if (!toCover.length) problems.push(`${sheet.id}: nenhum item pede tarja`)
            if (toCover.length === sheet.items.length) {
                problems.push(`${sheet.id}: todo item pede tarja`)
            }

            sheet.items.forEach(item => {
                const { x, y, w, h } = item.box
                const fits =
                    x >= PAPER_PAD &&
                    y >= PAPER_PAD &&
                    x + w <= PAPER.w - PAPER_PAD &&
                    y + h <= PAPER.h - PAPER_PAD
                if (!fits) problems.push(`${sheet.id}/${item.id}: a caixa sai do papel`)
            })

            sheet.items.forEach((a, i) => {
                sheet.items.slice(i + 1).forEach(b => {
                    const pa = center(a)
                    const pb = center(b)
                    const distance = Math.hypot(pa.x - pb.x, pa.y - pb.y)
                    if (distance < ITEM_GAP) {
                        problems.push(`${sheet.id}: ${a.id} e ${b.id} a ${Math.round(distance)}px`)
                    }
                })
            })
        })
    })

    return problems
}
