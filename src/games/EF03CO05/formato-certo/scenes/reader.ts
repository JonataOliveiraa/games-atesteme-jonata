import Phaser from 'phaser'
import { FX, Ease } from '../../../../shared/effects/FX'
import { C, FONT, SIZE, TYPE_MS, hex, formatTone } from '../data/theme'
import { READER } from '../data/layout'
import { FORMAT_INFO, FORMAT_GIVEN } from '../data/levels'
import type { BoxReading, FormatBoxSpec, FormatId, Piece, ReadCell } from '../types'

/*
 * O LEITOR.
 *
 * Regra que atravessa o arquivo inteiro: ele NUNCA escreve "errado",
 * "incorreto" ou "tente de novo". Ele relata o que leu. `1A-2` não é uma
 * mensagem de erro, é o resultado honesto de ler aquela caixa daquele jeito.
 * A criança compara com o pedido no alto da tela e decide sozinha o que
 * mexer — que é a diferença entre corrigir e entender.
 */

/* ═══════════════════════════════════════════════════════ a leitura */

/**
 * Lê uma caixa. A ordem dos campos é a ordem da leitura — não existe índice
 * separado, e é por isso que trocar duas peças de lugar muda o resultado sem
 * precisar de nenhuma regra a mais.
 */
export function readBox(
    spec: FormatBoxSpec,
    placed: Record<string, string | undefined>,
    pieces: Map<string, Piece>,
): BoxReading {
    const cells: ReadCell[] = spec.fields.map(field => {
        const pieceId = placed[field.id]
        return {
            field,
            piece: pieceId ? pieces.get(pieceId) ?? null : null,
            ok: pieceId === field.accepts,
        }
    })

    const ok = cells.every(c => c.ok)
    return { box: spec, cells, ok, failure: ok ? '' : failureLine(spec, cells, pieces) }
}

const literalOf = (cells: ReadCell[]) => cells.map(c => c.piece?.reads ?? '?').join('')

const expectedOf = (spec: FormatBoxSpec, pieces: Map<string, Piece>) =>
    spec.fields.map(f => pieces.get(f.accepts)?.reads ?? '?').join('')

/**
 * Uma frase-modelo por tipo de falha, mudando só o dado. Repetição é a favor
 * de quem ainda soleta: a criança aprende a forma da frase uma vez e depois
 * só precisa ler o que mudou.
 */
function failureLine(
    spec: FormatBoxSpec,
    cells: ReadCell[],
    pieces: Map<string, Piece>,
): string {
    // 1. buraco antes de qualquer outra coisa
    const vazio = cells.find(c => !c.piece)
    if (vazio) return `Faltou o ${vazio.field.label.toLowerCase()}.`

    // 2. peça de outro tipo dentro de um ponto de imagem
    if (spec.format === 'pixels') {
        const intrusa = cells.findIndex(c => c.piece?.kind !== 'cor')
        if (intrusa >= 0) return `O ponto ${intrusa + 1} não é uma cor. Ficou buraco.`
        return `Li: ${cells.map(c => c.piece?.reads).join(', ')}. Não é a imagem do pedido.`
    }

    // 3. data com o campo trocado — a frase mais específica do jogo
    if (spec.format === 'date') {
        const dia = cells.find(c => c.field.id === 'dia')
        const valor = Number(dia?.piece?.reads)
        if (dia && !dia.ok && Number.isFinite(valor) && valor > 31) {
            return `Dia ${dia.piece?.reads}? Não existe dia ${dia.piece?.reads}.`
        }
        const mes = cells.find(c => c.field.id === 'mes')
        if (mes && !mes.ok && mes.piece?.kind !== 'mes') {
            return `Mês ${mes.piece?.reads}? Mês não é número aqui.`
        }
        return `Li: ${cells.map(c => `${c.field.label.toLowerCase()} ${c.piece?.reads}`).join(' · ')}.`
    }

    // 4. texto: a leitura literal ao lado do esperado
    return `Li: ${literalOf(cells)}. O pedido era ${expectedOf(spec, pieces)}.`
}

/** Frase de recusa quando a caixa escolhida não serve para o pedido. */
export function refusalLine(chosen: FormatId, needed: FormatId): string {
    return `Esta caixa guarda ${FORMAT_INFO[chosen].guards}. O pedido é ${FORMAT_GIVEN[needed]}.`
}

/* ═════════════════════════════════════════════════════ o componente */

/*
 * O VISOR, REFEITO.
 *
 * A versão anterior desenhava oito camadas ao mesmo tempo num retângulo de
 * 268x300: grade de fósforo, riscos de tubo, reflexo diagonal no vidro, faixa
 * de status com led e rótulo, o conteúdo, a frase, chuvisco e um rastro de
 * seis retângulos atrás da linha de varredura. No Nível 2, com duas caixas
 * para mostrar, tudo isso ainda era dividido em duas metades de 110px. Não dá
 * para ler.
 *
 * Duas regras governam o arquivo agora:
 *
 * 1. UMA COISA POR VEZ. Duas caixas viram duas leituras em sequência, nunca
 *    lado a lado. Enquanto varre, a tela está vazia. A frase só entra depois
 *    de o conteúdo estar parado.
 *
 * 2. NADA DE CENÁRIO DENTRO DO VIDRO. Grade, riscos, reflexo, led e rótulo de
 *    status saíram inteiros. Eram decoração competindo por atenção com o
 *    único elemento que importa: o dado que a caixa devolveu. O estado do
 *    aparelho já é dito pela cor do vidro e pela frase — dizê-lo três vezes
 *    não deixa ninguém mais informado.
 *
 * O que NÃO mudou é a regra de conteúdo do MECANICA.md: o leitor relata o que
 * leu, nunca julga. `1A-2` não é mensagem de erro, é o resultado honesto de
 * ler aquela caixa daquele jeito.
 */

export type ReaderState = 'off' | 'scanning' | 'fail' | 'success'

export interface Reader {
    container: Phaser.GameObjects.Container
    /** Varre e mostra o resultado. Resolve quando a última frase terminou. */
    read(readings: BoxReading[]): Promise<void>
    /** Falha sem leitura: caixa errada, tempo esgotado. */
    refuse(reason: string): Promise<void>
    reset(): void
    destroy(): void
}

const SW = READER.screenW
const SH = READER.screenH

/** Respiro interno do vidro. */
const PAD = 18

/** Nome da caixa, só quando há mais de uma para ler. */
const HEAD_Y = -SH / 2 + 28

/**
 * Centro do conteúdo.
 *
 * Acima do centro geométrico porque a frase mora embaixo: sem o deslocamento,
 * um bloco alto de data encostava nela.
 */
const BODY_CY = -14

/** Base da frase. O texto cresce para cima a partir daqui. */
const PHRASE_BOTTOM = SH / 2 - PAD

const TINT: Record<ReaderState, number> = {
    off: C.idle,
    scanning: C.screenGlow,
    fail: C.fail,
    success: C.screenGlow,
}

/** Pausa entre a leitura de uma caixa e a da seguinte, no Nível 2. */
const BETWEEN_BOXES = 1500

export function createReader(scene: Phaser.Scene): Reader {
    const container = scene.add.container(READER.cx, READER.screenY).setDepth(30)

    // Três superfícies, e nenhuma delas é decoração: moldura, vidro, varredura.
    const chassis = scene.add.graphics()
    const glass = scene.add.graphics()
    const content = scene.add.container(0, 0)
    const scan = scene.add.graphics()

    container.add([chassis, glass, content, scan])

    const title = scene.add.text(READER.cx, READER.labelY, 'LEITOR', {
        fontFamily: FONT.black, fontSize: SIZE.readerTitle, color: hex(C.idle),
    }).setOrigin(0.5).setResolution(2).setDepth(30)

    let state: ReaderState = 'off'
    let idleTween: Phaser.Tweens.Tween | undefined

    /**
     * A máquina de escrever ativa.
     *
     * Guardá-la é obrigatório, não conveniência: `FX.type` registra
     * `label.once('destroy', skip)` e o `skip` faz `setText`. O Phaser emite
     * DESTROY ANTES de zerar `active`, então destruir o Text com a digitação
     * viva escreve numa textura já desmontada e o render estoura em
     * `drawImage`. Toda limpeza do visor passa por `stopTyping()` primeiro.
     */
    let typing: { skip: () => void } | null = null

    const stopTyping = () => { typing?.skip(); typing = null }

    const clearContent = () => {
        stopTyping()
        content.removeAll(true)
    }

    /* ── superfícies ──────────────────────────────────────────────── */

    const paintChassis = () => {
        const b = READER.bezel
        chassis.clear()
        chassis.fillStyle(C.shadow, 0.36)
        chassis.fillRoundedRect(-SW / 2 - b + 6, -SH / 2 - b + 10, SW + b * 2, SH + b * 2, READER.screenR + 8)
        chassis.fillStyle(C.wallLight, 1)
        chassis.fillRoundedRect(-SW / 2 - b, -SH / 2 - b, SW + b * 2, SH + b * 2, READER.screenR + 8)
        chassis.fillStyle(C.white, 0.08)
        chassis.fillRoundedRect(-SW / 2 - b + 10, -SH / 2 - b + 8, SW + b * 2 - 20, 10, 5)
        chassis.lineStyle(3, C.idle, 0.5)
        chassis.strokeRoundedRect(-SW / 2 - b, -SH / 2 - b, SW + b * 2, SH + b * 2, READER.screenR + 8)

        chassis.fillStyle(C.ink, 0.5)
        for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
            chassis.fillCircle(sx * (SW / 2 + b - 9), sy * (SH / 2 + b - 9), 3.5)
        }
    }

    /**
     * O vidro é o ÚNICO sinal ambiente de estado.
     *
     * Antes o estado aparecia em quatro lugares — tinta do vidro, led, rótulo
     * "SEM LEITURA" e a cor do próprio dado. Ficou um: a borda e um banho de
     * cor discreto. O dado continua colorido porque ali a cor é informação
     * por célula, não estado do aparelho.
     */
    const paintGlass = () => {
        const tint = TINT[state]

        glass.clear()
        glass.fillStyle(C.screen, 1)
        glass.fillRoundedRect(-SW / 2, -SH / 2, SW, SH, READER.screenR)

        glass.fillStyle(tint, state === 'off' ? 0.03 : 0.08)
        glass.fillRoundedRect(-SW / 2, -SH / 2, SW, SH, READER.screenR)

        glass.lineStyle(3, tint, state === 'off' ? 0.25 : 0.7)
        glass.strokeRoundedRect(-SW / 2, -SH / 2, SW, SH, READER.screenR)
    }

    const setState = (s: ReaderState) => {
        state = s
        paintGlass()
    }

    /* ── estado apagado ───────────────────────────────────────────── */

    const goOff = () => {
        idleTween?.remove()
        idleTween = undefined
        clearContent()
        scan.clear()
        setState('off')

        const cursor = scene.add.text(0, BODY_CY, '▮', {
            fontFamily: FONT.black, fontSize: '26px', color: hex(C.screenGlow),
        }).setOrigin(0.5).setResolution(2).setAlpha(0.55)
        content.add(cursor)

        const hint = scene.add.text(0, BODY_CY + 36, 'aguardando dados', {
            fontFamily: FONT.body, fontStyle: 'bold', fontSize: '14px', color: hex(C.idle),
        }).setOrigin(0.5).setResolution(2).setAlpha(0.6)
        content.add(hint)

        idleTween = scene.tweens.add({
            targets: cursor, alpha: 0.08,
            duration: 620, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
        })
    }

    /* ── varredura ────────────────────────────────────────────────── */

    /**
     * Uma linha, uma passada, tela vazia.
     *
     * O rastro de seis retângulos saiu: a linha já diz "estou trabalhando", e
     * o rastro só engrossava o borrão. Duas passadas viraram uma — a segunda
     * não acrescentava informação nenhuma e dobrava a espera antes da
     * resposta, que é o que a criança quer ver.
     */
    const runScan = async () => {
        idleTween?.remove()
        idleTween = undefined
        clearContent()
        setState('scanning')

        const s = { y: -SH / 2 + PAD }
        const draw = () => {
            scan.clear()
            scan.fillStyle(C.screenGlow, 0.7)
            scan.fillRect(-SW / 2 + 8, s.y, SW - 16, 3)
        }
        draw()

        await new Promise<void>(resolve => {
            scene.tweens.add({
                targets: s, y: SH / 2 - PAD,
                duration: 460 * FX.getTimeScale(scene),
                ease: 'Sine.easeInOut',
                onUpdate: draw,
                onComplete: () => resolve(),
            })
        })
        scan.clear()
    }

    /* ── renderizadores por formato ───────────────────────────────── */

    const smallText = (x: number, y: number, s: string, color: number, origin = 0.5) =>
        scene.add.text(x, y, s, {
            fontFamily: FONT.body, fontStyle: 'bold', fontSize: SIZE.readerNote, color: hex(color),
        }).setOrigin(origin, 0.5).setResolution(2)

    /**
     * Data: uma linha por campo e, embaixo, a data montada.
     *
     * As duas colunas se encontram no meio — rótulo alinhado à direita, valor
     * à esquerda — e a régua entre elas é o que deixa "dia / mês / ano" legível
     * de relance. A linha separadora que existia aqui saiu: espaço em branco
     * separa igual e não desenha nada.
     */
    const renderDate = (r: BoxReading) => {
        const nodes: Phaser.GameObjects.GameObject[] = []
        const rowH = 28
        const total = r.cells.length * rowH + 38
        const top = BODY_CY - total / 2 + rowH / 2

        r.cells.forEach((cell, i) => {
            const y = top + i * rowH
            nodes.push(smallText(-8, y, cell.field.label.toLowerCase(), C.idle, 1))
            nodes.push(scene.add.text(8, y, cell.piece?.reads ?? '—', {
                fontFamily: FONT.black, fontSize: SIZE.readerNote,
                color: hex(cell.ok ? C.screenGlow : C.fail),
            }).setOrigin(0, 0.5).setResolution(2))
        })

        const composed = r.ok
            ? `${r.cells[0]?.piece?.reads} de ${r.cells[1]?.piece?.reads}` +
            (r.cells[2] ? ` de ${r.cells[2].piece?.reads}` : '')
            : r.cells.map(c => c.piece?.reads ?? '—').join(' / ')

        nodes.push(scene.add.text(0, top + r.cells.length * rowH + 12, composed, {
            fontFamily: FONT.black, fontSize: SIZE.readerBody,
            color: hex(r.ok ? C.screenGlow : C.fail),
            align: 'center', wordWrap: { width: SW - 2 * PAD },
        }).setOrigin(0.5).setResolution(2))

        return nodes
    }

    /**
     * Texto: só a sequência, grande.
     *
     * Os traços que marcavam posição embaixo saíram. A posição já está na
     * ordem dos caracteres, e a peça errada já aparece na cor da falha — o
     * traço repetia pela terceira vez o que duas coisas já diziam.
     */
    const renderText = (r: BoxReading) => {
        const literal = literalOf(r.cells)

        return [scene.add.text(0, BODY_CY, literal, {
            fontFamily: FONT.black,
            fontSize: literal.length > 8 ? SIZE.readerBody : SIZE.readerBig,
            color: hex(r.ok ? C.screenGlow : C.fail),
            align: 'center', wordWrap: { width: SW - 2 * PAD },
        }).setOrigin(0.5).setResolution(2)]
    }

    /**
     * Pixels: a imagem desenhada de verdade. Campo vazio ou com peça que não
     * é cor vira XADREZ CINZA — o padrão que todo editor de imagem usa para
     * "nada aqui". A criança vê o buraco antes de ler qualquer palavra.
     */
    const renderPixels = (r: BoxReading) => {
        const g = scene.add.graphics()
        const n = r.cells.length
        const gap = 10
        const size = Math.min(58, (SW - 2 * PAD - (n - 1) * gap) / n)
        const total = n * size + (n - 1) * gap
        const start = -total / 2
        const y = BODY_CY - size / 2

        r.cells.forEach((cell, i) => {
            const x = start + i * (size + gap)
            const tone = cell.piece?.kind === 'cor' ? cell.piece.tone : undefined

            if (tone === undefined) {
                const c = size / 4
                for (let a = 0; a < 4; a += 1) {
                    for (let b = 0; b < 4; b += 1) {
                        g.fillStyle((a + b) % 2 === 0 ? 0x9aa4ae : 0x6a7580, 1)
                        g.fillRect(x + a * c, y + b * c, c, c)
                    }
                }
                g.lineStyle(3, C.fail, 1)
                g.strokeRect(x, y, size, size)
            } else {
                g.fillStyle(tone, 1)
                g.fillRoundedRect(x, y, size, size, 6)
                g.fillStyle(C.white, 0.22)
                g.fillRoundedRect(x + 5, y + 5, size - 10, size * 0.3, 4)
                g.lineStyle(3, cell.ok ? C.screenGlow : C.fail, 0.9)
                g.strokeRoundedRect(x, y, size, size, 6)
            }
        })

        return [g]
    }

    /* ── uma leitura por vez ──────────────────────────────────────── */

    const showPhrase = async (phrase: string, tone: number) => {
        const label = scene.add.text(0, 0, '', {
            fontFamily: FONT.body, fontStyle: 'bold', fontSize: SIZE.readerNote,
            color: hex(tone), align: 'center', wordWrap: { width: SW - 2 * PAD }, lineSpacing: 3,
        }).setOrigin(0.5, 1).setResolution(2)
        content.add(label)

        // ancorada pela base: com origem no topo, a frase de duas linhas
        // empurrava a de uma linha para cima no meio da digitação
        label.setY(PHRASE_BOTTOM)

        const tw = FX.type(scene, label, phrase, { delay: TYPE_MS.reader })
        typing = tw
        await tw
        typing = null
    }

    /** Mostra UMA caixa. Nada da caixa anterior continua na tela. */
    const showReading = async (r: BoxReading, withHeader: boolean) => {
        clearContent()
        setState(r.ok ? 'success' : 'fail')

        if (withHeader) {
            content.add(smallText(0, HEAD_Y, r.box.title.toUpperCase(), formatTone(r.box.format)))
        }

        const nodes = r.box.format === 'date' ? renderDate(r)
            : r.box.format === 'text' ? renderText(r)
                : renderPixels(r)

        nodes.forEach(nd => {
            content.add(nd)
            const obj = nd as unknown as Phaser.GameObjects.Container
            obj.setAlpha(0)
            FX.to(scene, obj, { alpha: 1 }, { duration: 200, ease: Ease.smooth })
        })

        await FX.wait(scene, 220)
        if (!r.ok) await showPhrase(r.failure, C.failSoft)
    }

    const read = async (readings: BoxReading[]) => {
        await runScan()

        const many = readings.length > 1

        for (let i = 0; i < readings.length; i += 1) {
            await showReading(readings[i], many)
            // a última fica na tela: quem fecha é a frase final ou a próxima fase
            if (i < readings.length - 1) await FX.wait(scene, BETWEEN_BOXES)
        }

        if (readings.every(r => r.ok)) {
            void FX.sparks(scene, READER.cx, READER.screenY, {
                color: C.screenGlow, count: 20, spread: 160,
            })
            await showPhrase('Informação recuperada.', C.screenGlow)
        }
    }

    const refuse = async (reason: string) => {
        await runScan()
        clearContent()
        setState('fail')
        await showPhrase(reason, C.failSoft)
    }

    paintChassis()
    goOff()

    return {
        container,
        read,
        refuse,
        reset: goOff,
        destroy: () => {
            // A digitação morre ANTES dos objetos: ver o comentário de `typing`.
            stopTyping()
            idleTween?.remove()
            title.destroy()
            container.destroy()
        },
    }
}
