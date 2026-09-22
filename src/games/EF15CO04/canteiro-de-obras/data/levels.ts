import type { Chunk, LevelDef, LotDef, PieceDef, SiteDef } from '../types'

/**
 * OS NÍVEIS. Este é o único lugar onde eles moram.
 *
 * Entrega de teste com o NÍVEL 1 só. Os níveis 2 (a linha opcional) e 3 (o
 * cadeado) estão escritos no PLANEJAMENTO.md e ainda não têm cena.
 *
 * Nenhum gabarito aqui: quais peças são de qual obra é consequência dos
 * cortes, e sai de `chunksOf` + `belongsTo`.
 */

const praca: SiteDef = {
    id: 'praca',
    sheet: 'pecas-praca',
    line: 'Vamos construir esta praça!',
    cheer: 'Você cortou, fez um de cada vez, e olha a praça!',
    lots: [
        {
            id: 'parquinho',
            pieces: [
                { id: 'escorregador', frame: 0, spot: [0.22, 0.6] },
                { id: 'balanco', frame: 1, spot: [0.52, 0.34] },
                { id: 'gira-gira', frame: 2, spot: [0.8, 0.64] },
            ],
        },
        {
            id: 'jardim',
            pieces: [
                { id: 'arvore', frame: 3, spot: [0.24, 0.36] },
                { id: 'flores', frame: 4, spot: [0.52, 0.66] },
                { id: 'banco', frame: 5, spot: [0.8, 0.38] },
            ],
        },
    ],
    cuts: [{ afterLot: 'parquinho', optional: false }],
}

const festa: SiteDef = {
    id: 'festa',
    sheet: 'pecas-festa',
    line: 'Agora a festa junina!',
    cheer: 'Dois pedaços pequenos, e a festa ficou pronta!',
    lots: [
        {
            id: 'comes',
            pieces: [
                { id: 'barraca', frame: 0, spot: [0.24, 0.38] },
                { id: 'pipoca', frame: 1, spot: [0.54, 0.66] },
                { id: 'macas', frame: 2, spot: [0.8, 0.36] },
            ],
        },
        {
            id: 'pescaria',
            pieces: [
                { id: 'tanque', frame: 3, spot: [0.26, 0.62] },
                { id: 'vara', frame: 4, spot: [0.52, 0.34] },
                { id: 'peixinhos', frame: 5, spot: [0.78, 0.62] },
            ],
        },
    ],
    cuts: [{ afterLot: 'comes', optional: false }],
}

const horta: SiteDef = {
    id: 'horta',
    sheet: 'pecas-horta',
    line: 'Hoje a gente faz a horta!',
    cheer: 'Cada pedaço com as coisas dele. Que horta linda!',
    lots: [
        {
            id: 'canteiro',
            pieces: [
                { id: 'caixote', frame: 0, spot: [0.24, 0.62] },
                { id: 'mudas', frame: 1, spot: [0.52, 0.36] },
                { id: 'plaquinha', frame: 2, spot: [0.8, 0.62] },
            ],
        },
        {
            id: 'cuidado',
            pieces: [
                { id: 'regador', frame: 3, spot: [0.24, 0.36] },
                { id: 'mangueira', frame: 4, spot: [0.52, 0.64] },
                { id: 'espantalho', frame: 5, spot: [0.8, 0.36] },
            ],
        },
    ],
    cuts: [{ afterLot: 'canteiro', optional: false }],
}

export const LEVELS: LevelDef[] = [{ level: 1, sites: [praca, festa, horta] }]

export const TOTAL_SITES = LEVELS.reduce((n, l) => n + l.sites.length, 0)

/** +10 no canteiro sem trava, +5 depois dela. */
export const pointsFor = (missed: boolean) => (missed ? 5 : 10)

/** Os pedaços de agora: lotes vizinhos sem corte feito entre eles. */
export function chunksOf(site: SiteDef, cut: ReadonlySet<string>): Chunk[] {
    const out: Chunk[] = [[]]
    site.lots.forEach((lot, i) => {
        out[out.length - 1].push(lot)
        const last = i === site.lots.length - 1
        if (!last && cut.has(lot.id)) out.push([])
    })
    return out
}

export const piecesOf = (chunk: Chunk): PieceDef[] => chunk.flatMap(lot => lot.pieces)

/**
 * O que vai para o chão: o que ainda falta neste pedaço, MAIS uma peça de
 * outro. A intrusa é derivada — a primeira ainda não usada do pedaço mais
 * cheio —, nunca escrita nos dados.
 */
export function groundFor(
    open: Chunk,
    others: Chunk[],
    placed: ReadonlySet<string>,
): PieceDef[] {
    const missing = piecesOf(open).filter(p => !placed.has(p.id))
    const outsider = others
        .map(c => piecesOf(c).filter(p => !placed.has(p.id)))
        .sort((a, b) => b.length - a.length)[0]?.[0]
    return outsider ? [...missing, outsider] : missing
}

export const belongsTo = (piece: PieceDef, chunk: Chunk) =>
    piecesOf(chunk).some(p => p.id === piece.id)

export const lotOfPiece = (site: SiteDef, id: string): LotDef | undefined =>
    site.lots.find(lot => lot.pieces.some(p => p.id === id))

/** Em qual pedaço aquela peça mora, para o dono piscar no erro. */
export const chunkOfPiece = (chunks: Chunk[], id: string) =>
    chunks.findIndex(chunk => piecesOf(chunk).some(p => p.id === id))

export function validateLevels(levels: LevelDef[]): string[] {
    const problems: string[] = []

    levels.forEach(level => {
        if (level.sites.length < 1 || level.sites.length > 5) {
            problems.push(`nível ${level.level}: ${level.sites.length} canteiros`)
        }

        level.sites.forEach(site => {
            const where = `${level.level}/${site.id}`

            if (site.lots.length < 2 || site.lots.length > 4) {
                problems.push(`${where}: ${site.lots.length} lotes`)
            }

            const ids = new Set<string>()
            const frames = new Set<number>()

            site.lots.forEach(lot => {
                if (lot.pieces.length < 2 || lot.pieces.length > 3) {
                    problems.push(`${where}/${lot.id}: ${lot.pieces.length} peças`)
                }
                lot.pieces.forEach(piece => {
                    if (ids.has(piece.id)) problems.push(`${where}: peça repetida ${piece.id}`)
                    ids.add(piece.id)
                    if (frames.has(piece.frame)) problems.push(`${where}: quadro repetido ${piece.frame}`)
                    frames.add(piece.frame)

                    const [x, y] = piece.spot
                    if (x < 0.12 || x > 0.88 || y < 0.12 || y > 0.88) {
                        problems.push(`${where}/${piece.id}: spot fora da margem`)
                    }
                })

                lot.pieces.forEach((a, i) =>
                    lot.pieces.slice(i + 1).forEach(b => {
                        const d = Math.hypot(a.spot[0] - b.spot[0], a.spot[1] - b.spot[1])
                        if (d < 0.22) problems.push(`${where}: ${a.id} e ${b.id} encostadas`)
                    }),
                )
            })

            site.cuts.forEach(cut => {
                const index = site.lots.findIndex(lot => lot.id === cut.afterLot)
                if (index < 0) problems.push(`${where}: corte depois de ${cut.afterLot}, que não existe`)
                if (index === site.lots.length - 1) problems.push(`${where}: corte depois do último lote`)
            })

            /* a maior obra possível cabe na caçamba de 5: 4 peças + 1 intrusa */
            const whole = chunksOf(site, new Set(site.cuts.filter(c => !c.optional).map(c => c.afterLot)))
            whole.forEach(chunk => {
                if (piecesOf(chunk).length > 4) {
                    problems.push(`${where}: um pedaço com ${piecesOf(chunk).length} peças`)
                }
            })

            if (level.level === 1) {
                if (site.cuts.length !== 1) problems.push(`${where}: o nível 1 tem 1 corte só`)
                if (site.cuts.some(c => c.optional)) problems.push(`${where}: o nível 1 não tem corte opcional`)
                if (site.dependency) problems.push(`${where}: o nível 1 não tem dependência`)
            }
        })
    })

    return problems
}

const PROBLEMS = validateLevels(LEVELS)
if (PROBLEMS.length && import.meta.env?.DEV) console.error('[canteiro-de-obras]', PROBLEMS)
