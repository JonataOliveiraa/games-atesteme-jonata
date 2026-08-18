import Phaser from 'phaser'
import { FX, Ease } from '../../../../shared/effects/FX'
import { C, FONT, SIZE, TYPE_MS, hex, formatTone } from '../data/theme'
import { READER } from '../data/layout'
import { FORMAT_INFO, FORMAT_GIVEN } from '../data/missions'
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

export type ReaderState = 'off' | 'scanning' | 'fail' | 'success'

export interface Reader {
    container: Phaser.GameObjects.Container
    /** Varre e mostra o resultado. Resolve quando o texto terminou de sair. */
    read(readings: BoxReading[]): Promise<void>
    /** Falha sem leitura: caixa errada, tempo esgotado. */
    refuse(reason: string): Promise<void>
    reset(): void
    destroy(): void
}

const SW = READER.screenW
const SH = READER.screenH

/** Faixa de status no topo do visor. */
const STRIP_H = 30
const STRIP_Y = -SH / 2 + STRIP_H / 2
/** Área útil do conteúdo, entre a faixa de status e a frase. */
const BODY_TOP = -SH / 2 + STRIP_H + 8
const BODY_BOTTOM = SH / 2 - 76

const STATUS: Record<ReaderState, { text: string; tone: number }> = {
    off: { text: 'PRONTO', tone: C.idle },
    scanning: { text: 'LENDO...', tone: C.screenGlow },
    fail: { text: 'SEM LEITURA', tone: C.fail },
    success: { text: 'RECUPERADO', tone: C.screenGlow },
}

export function createReader(scene: Phaser.Scene): Reader {
    const container = scene.add.container(READER.cx, READER.screenY).setDepth(30)

    const chassis = scene.add.graphics()
    const glass = scene.add.graphics()
    const grid = scene.add.graphics()
    const content = scene.add.container(0, 0)
    const noise = scene.add.graphics()
    const scan = scene.add.graphics()
    const crt = scene.add.graphics()
    const strip = scene.add.graphics()

    const statusText = scene.add.text(-SW / 2 + 34, STRIP_Y, 'PRONTO', {
        fontFamily: FONT.black, fontSize: '14px', color: hex(C.idle),
    }).setOrigin(0, 0.5).setResolution(2)

    container.add([chassis, glass, grid, content, noise, scan, crt, strip, statusText])

    const title = scene.add.text(READER.cx, READER.labelY, 'LEITOR', {
        fontFamily: FONT.black, fontSize: SIZE.readerTitle, color: hex(C.idle),
    }).setOrigin(0.5).setResolution(2).setDepth(30)

    let state: ReaderState = 'off'
    let idleTween: Phaser.Tweens.Tween | undefined
    let ledTween: Phaser.Tweens.Tween | undefined

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

    const paintGlass = () => {
        const tint = STATUS[state].tone

        glass.clear()
        glass.fillStyle(C.screen, 1)
        glass.fillRoundedRect(-SW / 2, -SH / 2, SW, SH, READER.screenR)

        glass.fillStyle(tint, state === 'success' ? 0.13 : state === 'fail' ? 0.09 : 0.04)
        glass.fillRoundedRect(-SW / 2, -SH / 2, SW, SH, READER.screenR)

        glass.fillStyle(C.white, 0.05)
        glass.fillTriangle(-SW / 2, -SH / 2, SW / 2, -SH / 2, -SW / 2, SH / 2)

        glass.lineStyle(3, tint, state === 'off' ? 0.25 : 0.65)
        glass.strokeRoundedRect(-SW / 2, -SH / 2, SW, SH, READER.screenR)
    }

    /** Grade fraca de fundo: o visor parece um aparelho, não um retângulo. */
    const paintGrid = () => {
        grid.clear()
        grid.lineStyle(1, C.screenGlow, 0.07)
        for (let x = -SW / 2 + 20; x < SW / 2; x += 20) grid.lineBetween(x, BODY_TOP, x, SH / 2 - 10)
        for (let y = BODY_TOP; y < SH / 2 - 10; y += 20) grid.lineBetween(-SW / 2 + 8, y, SW / 2 - 8, y)
    }

    /** Linhas horizontais de tubo. Sempre ligadas, bem fracas. */
    const paintCrt = () => {
        crt.clear()
        crt.fillStyle(C.shadow, 0.16)
        for (let y = -SH / 2 + 2; y < SH / 2; y += 4) {
            crt.fillRect(-SW / 2 + 2, y, SW - 4, 1.5)
        }
    }

    const paintStrip = () => {
        const { tone } = STATUS[state]
        strip.clear()
        strip.fillStyle(tone, 0.14)
        strip.fillRoundedRect(-SW / 2 + 6, -SH / 2 + 6, SW - 12, STRIP_H - 4, 10)
        strip.fillStyle(tone, 0.35)
        strip.fillRect(-SW / 2 + 10, -SH / 2 + STRIP_H + 1, SW - 20, 1)
        // led
        strip.fillStyle(tone, 1)
        strip.fillCircle(-SW / 2 + 22, STRIP_Y, 5)
        strip.fillStyle(C.white, 0.5)
        strip.fillCircle(-SW / 2 + 20.5, STRIP_Y - 1.5, 2)

        statusText.setText(STATUS[state].text).setColor(hex(tone))
    }

    const setState = (s: ReaderState) => {
        state = s
        paintGlass()
        paintStrip()

        ledTween?.remove()
        ledTween = undefined
        strip.setAlpha(1)
        if (s === 'scanning') {
            ledTween = scene.tweens.add({
                targets: strip, alpha: 0.55,
                duration: 260, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
            })
        }
    }

    /* ── estado apagado ───────────────────────────────────────────── */

    const goOff = () => {
        idleTween?.remove()
        idleTween = undefined
        clearContent()
        noise.clear()
        scan.clear()
        setState('off')

        const cursor = scene.add.text(0, (BODY_TOP + BODY_BOTTOM) / 2, '▮', {
            fontFamily: FONT.black, fontSize: '26px', color: hex(C.screenGlow),
        }).setOrigin(0.5).setResolution(2).setAlpha(0.55)
        content.add(cursor)

        const hint = scene.add.text(0, (BODY_TOP + BODY_BOTTOM) / 2 + 34, 'aguardando dados', {
            fontFamily: FONT.body, fontStyle: 'bold', fontSize: '14px', color: hex(C.idle),
        }).setOrigin(0.5).setResolution(2).setAlpha(0.6)
        content.add(hint)

        idleTween = scene.tweens.add({
            targets: cursor, alpha: 0.08,
            duration: 620, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
        })
    }

    /* ── animações ────────────────────────────────────────────────── */

    /** Duas passadas com rastro. A varredura é o "estou trabalhando". */
    const runScan = async () => {
        idleTween?.remove()
        idleTween = undefined
        clearContent()
        noise.clear()
        setState('scanning')

        const s = { y: BODY_TOP, pass: 0 }
        const draw = () => {
            scan.clear()
            // rastro
            for (let i = 6; i >= 1; i -= 1) {
                scan.fillStyle(C.screenGlow, 0.05 * i / 6 + 0.02)
                scan.fillRect(-SW / 2 + 6, s.y - i * 7, SW - 12, 7)
            }
            // linha
            scan.fillStyle(C.screenGlow, 0.85)
            scan.fillRect(-SW / 2 + 6, s.y, SW - 12, 4)
            scan.fillStyle(C.white, 0.5)
            scan.fillRect(-SW / 2 + 6, s.y + 1, SW - 12, 1)
        }
        draw()

        await new Promise<void>(resolve => {
            scene.tweens.add({
                targets: s, y: SH / 2 - 12,
                duration: 320 * FX.getTimeScale(scene),
                repeat: 1, ease: 'Sine.easeInOut',
                onUpdate: draw,
                onRepeat: () => { s.y = BODY_TOP },
                onComplete: () => resolve(),
            })
        })
        scan.clear()
    }

    /** Chuvisco com três quadros de tremida — falha de leitura, não erro. */
    const burstNoise = async () => {
        const frame = () => {
            noise.clear()
            for (let i = 0; i < 44; i += 1) {
                noise.fillStyle(i % 3 === 0 ? C.fail : C.screenGlow, Phaser.Math.FloatBetween(0.12, 0.36))
                noise.fillRect(
                    Phaser.Math.Between(-SW / 2 + 6, SW / 2 - 40),
                    Phaser.Math.Between(BODY_TOP, SH / 2 - 12),
                    Phaser.Math.Between(16, 44),
                    Phaser.Math.Between(3, 9),
                )
            }
        }

        for (let i = 0; i < 3; i += 1) {
            frame()
            noise.setAlpha(1)
            container.setX(READER.cx + (i % 2 === 0 ? 3 : -3))
            await FX.wait(scene, 70)
        }
        container.setX(READER.cx)
        await FX.to(scene, noise, { alpha: 0 }, { duration: 380 })
        noise.clear()
        noise.setAlpha(1)
    }

    /* ── renderizadores por formato ───────────────────────────────── */

    const smallText = (x: number, y: number, s: string, color: number, origin = 0.5) =>
        scene.add.text(x, y, s, {
            fontFamily: FONT.body, fontStyle: 'bold', fontSize: SIZE.readerNote, color: hex(color),
        }).setOrigin(origin, 0.5).setResolution(2)

    /** Data: as três linhas rotuladas, depois a composição. */
    const renderDate = (r: BoxReading, top: number, h: number) => {
        const nodes: Phaser.GameObjects.GameObject[] = []
        const rowH = Math.min(26, (h - 34) / r.cells.length)

        r.cells.forEach((cell, i) => {
            const y = top + 12 + i * rowH
            nodes.push(smallText(-SW / 2 + 22, y, cell.field.label.toLowerCase(), C.idle, 0))
            nodes.push(scene.add.text(-SW / 2 + 96, y, cell.piece?.reads ?? '—', {
                fontFamily: FONT.black, fontSize: SIZE.readerNote,
                color: hex(cell.ok ? C.screenGlow : C.fail),
            }).setOrigin(0, 0.5).setResolution(2))
        })

        const line = scene.add.graphics()
        const sepY = top + 12 + r.cells.length * rowH - 4
        line.fillStyle(C.screenGlow, 0.25)
        line.fillRect(-SW / 2 + 20, sepY, SW - 40, 2)
        nodes.push(line)

        const composed = r.ok
            ? `${r.cells[0]?.piece?.reads} de ${r.cells[1]?.piece?.reads}` +
            (r.cells[2] ? ` de ${r.cells[2].piece?.reads}` : '')
            : r.cells.map(c => c.piece?.reads ?? '—').join(' / ')

        nodes.push(scene.add.text(0, sepY + 20, composed, {
            fontFamily: FONT.black, fontSize: SIZE.readerBody,
            color: hex(r.ok ? C.screenGlow : C.fail),
            align: 'center', wordWrap: { width: SW - 32 },
        }).setOrigin(0.5).setResolution(2))

        return nodes
    }

    /** Texto: a sequência em letras grandes, com as posições marcadas. */
    const renderText = (r: BoxReading, top: number, h: number) => {
        const nodes: Phaser.GameObjects.GameObject[] = []
        const literal = literalOf(r.cells)

        nodes.push(scene.add.text(0, top + h / 2 - 12, literal, {
            fontFamily: FONT.black,
            fontSize: literal.length > 8 ? SIZE.readerBody : SIZE.readerBig,
            color: hex(r.ok ? C.screenGlow : C.fail),
            align: 'center', wordWrap: { width: SW - 28 },
        }).setOrigin(0.5).setResolution(2))

        const ticks = scene.add.graphics()
        const n = r.cells.length
        const step = 22
        const start = -((n - 1) * step) / 2
        r.cells.forEach((cell, i) => {
            ticks.fillStyle(cell.ok ? C.screenGlow : C.fail, cell.ok ? 0.8 : 1)
            ticks.fillRoundedRect(start + i * step - 8, top + h / 2 + 14, 16, 5, 2)
        })
        nodes.push(ticks)

        return nodes
    }

    /**
     * Pixels: a imagem desenhada de verdade. Campo vazio ou com peça que não
     * é cor vira XADREZ CINZA — o padrão que todo editor de imagem usa para
     * "nada aqui". A criança vê o buraco antes de ler qualquer palavra.
     */
    const renderPixels = (r: BoxReading, top: number, h: number) => {
        const g = scene.add.graphics()
        const n = r.cells.length
        const size = Math.min(52, (SW - 40) / n - 8)
        const gap = 8
        const total = n * size + (n - 1) * gap
        const start = -total / 2
        const y = top + h / 2 - size / 2 - 4

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

    const renderBox = (r: BoxReading, top: number, h: number) => {
        const nodes: Phaser.GameObjects.GameObject[] = []
        nodes.push(smallText(-SW / 2 + 22, top - 2, r.box.title.toUpperCase(), formatTone(r.box.format), 0))

        const inner = top + 12
        const innerH = h - 12

        if (r.box.format === 'date') nodes.push(...renderDate(r, inner, innerH))
        else if (r.box.format === 'text') nodes.push(...renderText(r, inner, innerH))
        else nodes.push(...renderPixels(r, inner, innerH))

        return nodes
    }

    /* ── API ──────────────────────────────────────────────────────── */

    const showPhrase = async (phrase: string, tone: number) => {
        const label = scene.add.text(0, SH / 2 - 52, '', {
            fontFamily: FONT.body, fontStyle: 'bold', fontSize: SIZE.readerNote,
            color: hex(tone), align: 'center', wordWrap: { width: SW - 30 }, lineSpacing: 3,
        }).setOrigin(0.5).setResolution(2)
        content.add(label)

        // mede com o texto completo para o bloco não subir letra a letra
        label.setText(phrase)
        label.setY(SH / 2 - 20 - label.height / 2)
        label.setText('')

        const tw = FX.type(scene, label, phrase, { delay: TYPE_MS.reader })
        typing = tw
        await tw
        typing = null
    }

    const revealRows = async (readings: BoxReading[]) => {
        const areaH = (BODY_BOTTOM - BODY_TOP) / readings.length

        for (let i = 0; i < readings.length; i += 1) {
            const nodes = renderBox(readings[i], BODY_TOP + i * areaH + 8, areaH - 10)
            nodes.forEach(nd => {
                content.add(nd)
                const obj = nd as unknown as Phaser.GameObjects.Container
                const restX = obj.x ?? 0
                obj.setAlpha(0)
                obj.setX(restX - 14)
                FX.to(scene, obj, { alpha: 1, x: restX }, { duration: 220, ease: Ease.smooth })
            })
            if (i < readings.length - 1) await FX.wait(scene, 160)
        }
    }

    const read = async (readings: BoxReading[]) => {
        await runScan()

        const ok = readings.every(r => r.ok)
        setState(ok ? 'success' : 'fail')

        if (!ok) await burstNoise()
        await revealRows(readings)

        const failing = readings.find(r => !r.ok)
        if (failing) {
            await showPhrase(failing.failure, C.failSoft)
        } else {
            void FX.sparks(scene, READER.cx, READER.screenY, {
                color: C.screenGlow, count: 20, spread: 160,
            })
            await showPhrase('Informação recuperada.', C.screenGlow)
        }
    }

    const refuse = async (reason: string) => {
        await runScan()
        setState('fail')
        await burstNoise()
        await showPhrase(reason, C.failSoft)
    }

    paintChassis()
    paintGrid()
    paintCrt()
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
            ledTween?.remove()
            title.destroy()
            container.destroy()
        },
    }
}
