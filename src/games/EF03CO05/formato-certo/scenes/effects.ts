import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { FX, Ease } from '../../../../shared/effects/FX'
import {
    C, A, FONT, SIZE, LONG_REQUEST, LONG_PIECE_LABEL, TYPE_MS, hex, formatTone,
} from '../data/theme'
import {
    W, H, HUD, TIMER, BENCH, REQUEST, BOXES, FIELD, TRAY, TOAST,
} from '../data/layout'
import type { Field, FormatBoxSpec, FormatId, Piece } from '../types'

/*
 * Duas metades, e a separação é a regra do projeto (VISUAL.md §1):
 *
 * 1. PAINTERS — recebem um Graphics e desenham. Não criam objeto, não animam,
 *    não guardam estado. Podem ser chamados de novo para repintar, e é isso
 *    que faz uma caixa passar de 'vazia' para 'com defeito' sem recriar nada.
 * 2. CONSTRUTORES — criam um pedaço de interface e devolvem um handle com
 *    métodos e `destroy`. A cena nunca toca nos objetos internos.
 *
 * Se a GameScene precisar de um `fillRoundedRect`, falta um painter aqui.
 */

/* ═══════════════════════════════════════════════════════════ painters */

/**
 * Cenário: parede em degradê, laje da bancada e vinheta.
 *
 * A prateleira com silhuetas descrita no VISUAL.md §4.1 caiu: ela moraria em
 * y≈150, exatamente onde o cartão de pedido (884px de largura) e o visor do
 * leitor ficam. Seria trabalho para desenhar algo que nunca aparece. No lugar
 * ficou uma trama de pontos na parede — motivo de pixel, discreto o bastante
 * para não competir com a bancada.
 */
export function paintWorkbench(g: Phaser.GameObjects.Graphics) {
    const BENCH_TOP = 470

    g.clear()

    // parede: 14 faixas, do escuro em cima ao claro embaixo
    for (let i = 0; i < 14; i += 1) {
        const t = i / 13
        const color = Phaser.Display.Color.Interpolate.ColorWithColor(
            Phaser.Display.Color.ValueToColor(C.wall),
            Phaser.Display.Color.ValueToColor(C.wallLight),
            13, i,
        )
        g.fillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b), 1)
        g.fillRect(0, Math.floor(t * BENCH_TOP), W, Math.ceil(BENCH_TOP / 14) + 1)
    }

    // trama de pontos: motivo de pixel, quase invisível
    g.fillStyle(C.white, 0.035)
    for (let y = 26; y < BENCH_TOP; y += 34) {
        for (let x = 26; x < W; x += 34) g.fillCircle(x, y, 2)
    }

    // laje da bancada
    g.fillStyle(C.wood, 1)
    g.fillRect(0, BENCH_TOP, W, H - BENCH_TOP)

    // veio da madeira
    g.fillStyle(C.woodDark, 0.12)
    for (let i = 0; i < 7; i += 1) {
        g.fillRect(0, BENCH_TOP + 24 + i * 34, W, 3)
    }
    g.fillStyle(C.woodLight, 0.16)
    for (let i = 0; i < 6; i += 1) {
        g.fillRect(0, BENCH_TOP + 40 + i * 34, W, 2)
    }

    // borda frontal: a espessura é o que faz a bancada virar móvel
    g.fillStyle(C.woodDark, 1)
    g.fillRect(0, BENCH_TOP, W, 14)
    g.fillStyle(C.woodLight, 0.5)
    g.fillRect(0, BENCH_TOP, W, 3)

    // vinheta
    g.fillStyle(C.ink, 0.2)
    g.fillRect(0, 0, W, 70)
    g.fillRect(0, H - 70, W, 70)
}

export function paintHudBar(g: Phaser.GameObjects.Graphics) {
    g.clear()

    g.fillStyle(C.shadow, 0.32)
    g.fillRoundedRect(HUD.x + 4, HUD.y + 7, HUD.w, HUD.h, HUD.r)

    g.fillStyle(C.ink, 0.94)
    g.fillRoundedRect(HUD.x, HUD.y, HUD.w, HUD.h, HUD.r)

    g.fillStyle(C.white, 0.07)
    g.fillRoundedRect(HUD.x + 16, HUD.y + 10, HUD.w - 32, 18, 9)

    g.lineStyle(3, C.idle, 0.55)
    g.strokeRoundedRect(HUD.x, HUD.y, HUD.w, HUD.h, HUD.r)
}

/** Cartão do pedido: papel creme com faixa na cor do formato pedido. */
export function paintRequestCard(g: Phaser.GameObjects.Graphics, tone: number) {
    const { w, h, r } = REQUEST
    const left = -w / 2
    const top = -h / 2

    g.clear()

    g.fillStyle(C.shadow, A.shadow)
    g.fillRoundedRect(left + 6, top + 10, w, h, r)

    g.fillStyle(C.panelEdge, 1)
    g.fillRoundedRect(left, top, w, h, r)

    g.fillStyle(C.panel, 1)
    g.fillRoundedRect(left + 4, top + 4, w - 8, h - 10, r - 4)

    // aba lateral na cor do formato — a única pista de cor antes de escolher
    g.fillStyle(tone, 1)
    g.fillRoundedRect(left + 4, top + 4, 14, h - 10, { tl: r - 4, bl: r - 4, tr: 0, br: 0 })

    g.lineStyle(3, tone, 0.4)
    g.strokeRoundedRect(left, top, w, h, r)
}

export type BoxState = 'closed' | 'open' | 'full' | 'broken' | 'rejected'

const BOX_FILL: Record<BoxState, number> = {
    closed: C.panel,
    open: C.panel,
    full: C.okSoft,
    broken: C.failSoft,
    rejected: C.failSoft,
}

/**
 * A caixa é um aparelho: chassi, plaqueta de identificação e poços.
 *
 * O tracejado do `broken` é a única borda não-contínua do jogo. Serve para a
 * criança bater o olho no Nível 3 e saber que aquela caixa está doente antes
 * de ler qualquer palavra.
 */
export function paintFormatBox(
    g: Phaser.GameObjects.Graphics,
    w: number,
    h: number,
    r: number,
    { tone, state }: { tone: number; state: BoxState },
) {
    const left = -w / 2
    const top = -h / 2
    const stroke = state === 'full' ? C.ok
        : state === 'broken' || state === 'rejected' ? C.fail
            : tone

    g.clear()

    g.fillStyle(C.shadow, A.shadow)
    g.fillRoundedRect(left + 6, top + 11, w, h, r)

    g.fillStyle(BOX_FILL[state], state === 'closed' ? 0.9 : 1)
    g.fillRoundedRect(left, top, w, h, r)

    // brilho superior
    g.fillStyle(C.white, A.gloss)
    g.fillRoundedRect(left + 12, top + 8, w - 24, 14, 7)

    if (state === 'open') {
        // halo interno: a caixa aberta "acende"
        g.lineStyle(3, tone, 0.28)
        g.strokeRoundedRect(left + 12, top + 12, w - 24, h - 24, r - 8)
    }

    if (state === 'broken') {
        strokeDashedRoundedRect(g, left, top, w, h, r, 6, 14, 10)
    } else {
        g.lineStyle(state === 'closed' ? 4 : 6, stroke, 1)
        g.strokeRoundedRect(left, top, w, h, r)
    }

    // três leds na base — o aparelho tem energia
    const ledY = top + h - 18
    for (let i = 0; i < 3; i += 1) {
        g.fillStyle(state === 'full' ? C.ok : state === 'broken' || state === 'rejected' ? C.fail : tone, 0.8)
        g.fillRoundedRect(left + 20 + i * 18, ledY, 12, 6, 3)
    }
}

/** Retângulo arredondado tracejado. O Phaser não tem, e o `broken` precisa. */
function strokeDashedRoundedRect(
    g: Phaser.GameObjects.Graphics,
    x: number, y: number, w: number, h: number, r: number,
    thickness: number, dash: number, gap: number,
) {
    g.lineStyle(thickness, C.fail, 1)
    const seg = dash + gap
    // lados retos; os cantos ficam sem traço, e a leitura não sofre
    for (let i = x + r; i < x + w - r; i += seg) {
        const len = Math.min(dash, x + w - r - i)
        g.lineBetween(i, y, i + len, y)
        g.lineBetween(i, y + h, i + len, y + h)
    }
    for (let i = y + r; i < y + h - r; i += seg) {
        const len = Math.min(dash, y + h - r - i)
        g.lineBetween(x, i, x, i + len)
        g.lineBetween(x + w, i, x + w, i + len)
    }
}

export type FieldState = 'empty' | 'hover' | 'filled' | 'wrong'

/**
 * O poço onde a peça assenta.
 *
 * `empty` é REBAIXADO, não elevado: sombra interna em vez de externa. Buraco
 * convida a encaixar; caixinha saliente convida a clicar. É a diferença entre
 * a criança entender o gesto em dois segundos ou em vinte.
 */
export function paintField(
    g: Phaser.GameObjects.Graphics,
    w: number,
    h: number,
    r: number,
    { tone, state, kind }: { tone: number; state: FieldState; kind: 'slot' | 'pixel' },
) {
    const left = -w / 2
    const top = -h / 2
    const stroke = state === 'wrong' ? C.fail : tone

    g.clear()

    /*
     * O poço é um BURACO, e o buraco é a principal pista do jogo: é ele que
     * diz "solte aqui" sem nenhuma palavra.
     *
     * A primeira versão empilhava sombra a 0.34 e branco a 0.22, e sobre a
     * caixa creme o resultado era um bloco cinza opaco — lia como "campo
     * bloqueado", o oposto do convite. Agora a sombra é só o aro superior e o
     * miolo fica claro: recesso raso, fundo iluminado.
     */
    g.fillStyle(C.shadow, state === 'empty' ? 0.15 : 0.09)
    g.fillRoundedRect(left, top, w, h, r)
    g.fillStyle(C.white, state === 'empty' ? 0.46 : 0.66)
    g.fillRoundedRect(left + 3, top + 5, w - 6, h - 8, r - 2)

    if (kind === 'pixel') {
        // grade interna: o poço parece um ponto de imagem, não uma gaveta
        g.lineStyle(1, stroke, 0.28)
        for (let i = 1; i < 3; i += 1) {
            g.lineBetween(left + (w / 3) * i, top + 8, left + (w / 3) * i, top + h - 8)
            g.lineBetween(left + 8, top + (h / 3) * i, left + w - 8, top + (h / 3) * i)
        }
    }

    if (state === 'empty') {
        strokeDottedRoundedRect(g, left, top, w, h, r, stroke)
        return
    }

    g.lineStyle(state === 'hover' ? 6 : 4, stroke, 1)
    g.strokeRoundedRect(left, top, w, h, r)

    if (state === 'hover') {
        g.lineStyle(2, stroke, 0.4)
        g.strokeRoundedRect(left - 6, top - 6, w + 12, h + 12, r + 5)
    }
}

function strokeDottedRoundedRect(
    g: Phaser.GameObjects.Graphics,
    x: number, y: number, w: number, h: number, r: number, tone: number,
) {
    g.fillStyle(tone, 0.5)
    const step = 12
    for (let i = x + r; i < x + w - r; i += step) {
        g.fillCircle(i, y, 2.5)
        g.fillCircle(i, y + h, 2.5)
    }
    for (let i = y + r; i < y + h - r; i += step) {
        g.fillCircle(x, i, 2.5)
        g.fillCircle(x + w, i, 2.5)
    }
}

/**
 * Corpo do cartão de dado.
 *
 * `hasOwner` false desenha SEM borda colorida: é a peça intrusa. Todas as
 * outras carregam a cor do formato a que pertencem, então quem não pertence a
 * nada não ganha cor. É a dica silenciosa de que aquilo não encaixa em lugar
 * nenhum.
 */
export function paintPiece(
    g: Phaser.GameObjects.Graphics,
    w: number,
    h: number,
    r: number,
    { tone, held = false, hasOwner = true, placed = false }:
        { tone: number; held?: boolean; hasOwner?: boolean; placed?: boolean },
) {
    const left = -w / 2
    const top = -h / 2

    g.clear()

    /*
     * Dentro de um poço a peça não tem corpo nenhum: só o desenho e o número.
     *
     * O poço já é um cartão — tem borda, sombra e fundo. Manter o corpo da
     * peça punha cartão dentro de cartão, com duas bordas concêntricas
     * disputando a mesma forma, e o campo parecia moldura de quadro em vez de
     * encaixe. Sem corpo, o dado simplesmente ocupa o buraco.
     */
    if (placed) return

    g.fillStyle(C.shadow, held ? 0.32 : 0.2)
    g.fillRoundedRect(left + (held ? 8 : 4), top + (held ? 14 : 7), w, h, r)

    g.fillStyle(C.cream, 1)
    g.fillRoundedRect(left, top, w, h, r)

    g.fillStyle(C.white, A.gloss)
    g.fillRoundedRect(left + 8, top + 7, w - 16, 14, 7)

    if (hasOwner) {
        g.lineStyle(4, tone, 0.9)
        g.strokeRoundedRect(left, top, w, h, r)
    } else {
        g.lineStyle(3, C.idle, 0.5)
        g.strokeRoundedRect(left, top, w, h, r)
    }
}

/** Nicho da bandeja, sob os cartões. */
export function paintTray(g: Phaser.GameObjects.Graphics) {
    const { cx, y, w, h, r } = TRAY
    const left = cx - w / 2

    g.clear()
    g.fillStyle(C.shadow, 0.26)
    g.fillRoundedRect(left, y, w, h, r)
    g.fillStyle(C.woodDark, 0.5)
    g.fillRoundedRect(left + 4, y + 4, w - 8, h - 8, r - 4)
    g.lineStyle(3, C.woodLight, 0.45)
    g.strokeRoundedRect(left, y, w, h, r)
}

/* ══════════════════════════════════════════════ desenhos das peças */

/**
 * A marca de cada tipo de peça. Desenhada em Graphics local ao cartão.
 * Devolve o `y` sugerido para o rótulo, ou `null` quando a peça não usa
 * rótulo separado (o glifo já é o conteúdo).
 */
export function drawPieceMark(
    g: Phaser.GameObjects.Graphics,
    piece: Piece,
    h: number,
): number | null {
    switch (piece.kind) {
        case 'cor': {
            const tone = piece.tone ?? C.idle
            g.fillStyle(C.shadow, 0.18)
            g.fillEllipse(2, 20, 42, 12)
            g.fillStyle(tone, 1)
            g.fillCircle(0, -2, 24)
            g.fillTriangle(-16, -12, 16, -12, 0, -44)
            g.fillStyle(C.white, 0.42)
            g.fillEllipse(-8, -8, 12, 18)
            return h / 2 - 18
        }

        case 'mes': {
            g.fillStyle(C.shadow, 0.16)
            g.fillRoundedRect(-32, -22, 66, 54, 8)
            g.fillStyle(C.white, 1)
            g.fillRoundedRect(-34, -26, 66, 54, 8)
            g.fillStyle(C.date, 1)
            g.fillRoundedRect(-34, -26, 66, 18, { tl: 8, tr: 8, bl: 0, br: 0 })
            g.fillStyle(C.date, 0.85)
            g.fillCircle(-18, -28, 4)
            g.fillCircle(16, -28, 4)
            return 6
        }

        case 'palavra': {
            g.fillStyle(C.shadow, 0.16)
            g.fillRoundedRect(-48, -14, 96, 34, 10)
            g.fillStyle(C.white, 1)
            g.fillRoundedRect(-50, -18, 96, 34, 10)
            g.lineStyle(3, C.text, 0.75)
            g.strokeRoundedRect(-50, -18, 96, 34, 10)
            g.fillStyle(C.text, 0.8)
            g.fillCircle(-40, -1, 4)
            return -1
        }

        case 'intrusa': {
            g.fillStyle(C.shadow, 0.16)
            drawStar(g, 2, -4, 26, 12)
            g.fillStyle(C.idle, 0.9)
            drawStar(g, 0, -8, 26, 12)
            g.fillStyle(C.white, 0.3)
            drawStar(g, 0, -8, 15, 7)
            return h / 2 - 18
        }

        default:
            return null
    }
}

function drawStar(g: Phaser.GameObjects.Graphics, cx: number, cy: number, outer: number, inner: number) {
    const pts: Phaser.Geom.Point[] = []
    for (let i = 0; i < 10; i += 1) {
        const a = -Math.PI / 2 + (i * Math.PI) / 5
        const r = i % 2 === 0 ? outer : inner
        pts.push(new Phaser.Geom.Point(cx + Math.cos(a) * r, cy + Math.sin(a) * r))
    }
    g.fillPoints(pts, true)
}

/* ═══════════════════════════════════════════════════════════════ HUD */

export interface Hud {
    container: Phaser.GameObjects.Container
    setLevel(level: number): void
    setTitle(text: string): void
    setHint(text: string): void
    setProgress(done: number, total: number): void
    setHelpEnabled(on: boolean): void
    destroy(): void
}

export function createHud(
    scene: Phaser.Scene,
    { onHelp }: { onHelp: () => void },
): Hud {
    const container = scene.add.container(0, 0).setDepth(80)

    const bar = scene.add.graphics()
    paintHudBar(bar)
    container.add(bar)

    const pill = scene.add.graphics()
    pill.fillStyle(C.pixels, 1)
    pill.fillRoundedRect(HUD.pillX, HUD.pillY, HUD.pillW, HUD.pillH, HUD.pillH / 2)
    pill.fillStyle(C.white, 0.28)
    pill.fillRoundedRect(HUD.pillX + 10, HUD.pillY + 6, HUD.pillW - 20, 12, 6)
    container.add(pill)

    const levelLabel = scene.add.text(HUD.pillX + HUD.pillW / 2, HUD.cy, 'NÍVEL 1', {
        fontFamily: FONT.black, fontSize: SIZE.hudLevel, color: hex(C.ink),
    }).setOrigin(0.5).setResolution(2)
    container.add(levelLabel)

    const title = scene.add.text(HUD.titleX, HUD.titleY, '', {
        fontFamily: FONT.black, fontSize: SIZE.hudTitle, color: hex(C.cream),
        align: 'center', wordWrap: { width: HUD.titleW },
    }).setOrigin(0.5).setResolution(2)
    container.add(title)

    const hint = scene.add.text(HUD.titleX, HUD.hintY, '', {
        fontFamily: FONT.body, fontStyle: 'bold', fontSize: SIZE.hudHint,
        color: hex(C.idle), align: 'center', wordWrap: { width: HUD.hintW },
    }).setOrigin(0.5).setResolution(2)
    container.add(hint)

    const dots = scene.add.container(0, 0)
    container.add(dots)

    const help = createRoundButton(scene, HUD.helpX, HUD.cy, HUD.helpR, '?', onHelp, C.pixels)
    container.add(help.container)

    const mute = createMuteButton(scene)
    container.add(mute.container)

    FX.slideIn(scene, container, { dy: 26, duration: 340 })

    return {
        container,
        setLevel: (level) => levelLabel.setText(`NÍVEL ${level}`),
        setTitle: (text) => title.setText(text),
        setHint: (text) => hint.setText(text),
        setProgress: (done, total) => {
            dots.removeAll(true)
            if (total <= 0) return

            const gap = total > 1 ? Math.min(26, HUD.dotsMaxW / (total - 1)) : 0
            for (let i = 0; i < total; i += 1) {
                const x = HUD.dotsX + i * gap
                const g = scene.add.graphics()
                if (i < done) {
                    g.fillStyle(C.ok, 1)
                    g.fillCircle(x, HUD.cy, HUD.dotR)
                    g.lineStyle(2, C.okSoft, 1)
                    g.strokeCircle(x, HUD.cy, HUD.dotR)
                } else if (i === done) {
                    g.fillStyle(C.pixels, 1)
                    g.fillRoundedRect(x - 14, HUD.cy - 8, 28, 16, 8)
                    g.lineStyle(2, C.white, 0.8)
                    g.strokeRoundedRect(x - 14, HUD.cy - 8, 28, 16, 8)
                } else {
                    g.fillStyle(C.white, 0.18)
                    g.fillCircle(x, HUD.cy, HUD.dotR)
                }
                dots.add(g)
            }
        },
        setHelpEnabled: help.setEnabled,
        destroy: () => { help.destroy(); mute.destroy(); container.destroy() },
    }
}

/* ══════════════════════════════════════════════════════════ botões */

export interface RoundButton {
    container: Phaser.GameObjects.Container
    setEnabled(on: boolean): void
    destroy(): void
}

/**
 * A zona de toque é um objeto separado, parado. O container cresce no hover e
 * afunda no clique; se a área de toque fosse ele, a borda mudaria de tamanho
 * no meio do gesto e um `pointerup` perto da margem cairia fora, comendo o
 * clique. Vale para todo botão daqui.
 */
export function createRoundButton(
    scene: Phaser.Scene,
    x: number, y: number, r: number,
    label: string,
    onClick: () => void,
    tone = C.pixels,
): RoundButton {
    const container = scene.add.container(x, y)

    const g = scene.add.graphics()
    g.fillStyle(C.shadow, 0.3)
    g.fillCircle(0, 4, r)
    g.fillStyle(tone, 1)
    g.fillCircle(0, 0, r)
    g.fillStyle(C.white, 0.22)
    g.fillCircle(0, -r * 0.32, r * 0.62)
    g.lineStyle(3, C.white, 0.9)
    g.strokeCircle(0, 0, r)

    const text = scene.add.text(0, -1, label, {
        fontFamily: FONT.black, fontSize: SIZE.help, color: hex(C.white),
    }).setOrigin(0.5).setResolution(2)

    container.add([g, text])

    let enabled = true
    const hit = scene.add.zone(x, y, r * 2 + 18, r * 2 + 18).setOrigin(0.5)
    hit.setInteractive({ useHandCursor: true })

    hit.on('pointerover', () => { if (enabled) FX.to(scene, container, { scale: 1.12 }, { duration: 120 }) })
    hit.on('pointerout', () => { if (enabled) FX.to(scene, container, { scale: 1 }, { duration: 120 }) })
    hit.on('pointerup', () => {
        if (!enabled) return
        FX.press(scene, container)
        onClick()
    })

    return {
        container,
        setEnabled: (on) => {
            enabled = on
            container.setAlpha(on ? 1 : A.dim)
            if (hit.input) hit.input.cursor = on ? 'pointer' : 'default'
        },
        destroy: () => { hit.destroy(); container.destroy() },
    }
}

function createMuteButton(scene: Phaser.Scene) {
    let muted = false
    const container = scene.add.container(HUD.muteX, HUD.cy)

    const g = scene.add.graphics()
    g.fillStyle(C.shadow, 0.3)
    g.fillCircle(0, 4, HUD.muteR)
    g.fillStyle(C.wallLight, 1)
    g.fillCircle(0, 0, HUD.muteR)
    g.lineStyle(3, C.idle, 0.9)
    g.strokeCircle(0, 0, HUD.muteR)

    const icon = scene.add.text(0, 0, '🔊', { fontSize: '26px' }).setOrigin(0.5)
    container.add([g, icon])

    const hit = scene.add.zone(HUD.muteX, HUD.cy, HUD.muteR * 2 + 18, HUD.muteR * 2 + 18).setOrigin(0.5)
    hit.setInteractive({ useHandCursor: true })
    hit.on('pointerover', () => FX.to(scene, container, { scale: 1.1 }, { duration: 120 }))
    hit.on('pointerout', () => FX.to(scene, container, { scale: 1 }, { duration: 120 }))
    hit.on('pointerup', () => {
        muted = !muted
        icon.setText(muted ? '🔇' : '🔊')
        FX.press(scene, container)
        EventBus.emit('mute-audio', muted)
    })

    return { container, destroy: () => { hit.destroy(); container.destroy() } }
}

export interface BigButton {
    container: Phaser.GameObjects.Container
    setEnabled(on: boolean): void
    isEnabled(): boolean
    setLabel(text: string): void
    destroy(): void
}

export function createBigButton(
    scene: Phaser.Scene,
    { x, y, w, h, label, tone, onClick }: {
        x: number; y: number; w: number; h: number
        label: string; tone: number; onClick: () => void
    },
): BigButton {
    const container = scene.add.container(x, y).setDepth(60)
    const bg = scene.add.graphics()
    const text = scene.add.text(0, -3, label, {
        fontFamily: FONT.black, fontSize: SIZE.button, color: hex(C.white),
    }).setOrigin(0.5).setResolution(2)

    let enabled = false
    let pressed = false
    let pulse: Phaser.Tweens.Tween | undefined
    const drop = 7
    const deep = Phaser.Display.Color.ValueToColor(tone).darken(30).color

    const paint = () => {
        const dy = pressed ? drop : 0
        bg.clear()
        bg.fillStyle(C.shadow, 0.3)
        bg.fillRoundedRect(-w / 2 + 4, -h / 2 + drop + 6, w, h, h / 2)
        bg.fillStyle(enabled ? deep : 0x50505a, 1)
        bg.fillRoundedRect(-w / 2, -h / 2, w, h + drop, h / 2)
        bg.fillStyle(enabled ? tone : 0x74747f, 1)
        bg.fillRoundedRect(-w / 2, -h / 2 + dy, w, h, h / 2)
        bg.fillStyle(C.white, enabled ? 0.28 : 0.1)
        bg.fillRoundedRect(-w / 2 + 14, -h / 2 + dy + 10, w - 28, h * 0.28, h / 4)
        bg.lineStyle(4, C.white, enabled ? 0.9 : 0.3)
        bg.strokeRoundedRect(-w / 2, -h / 2 + dy, w, h, h / 2)
        text.setY(-3 + dy)
    }

    container.add([bg, text])
    paint()

    const hit = scene.add.zone(x, y, w + 26, h + 24).setOrigin(0.5).setDepth(61)
    hit.setInteractive({ useHandCursor: true })

    hit.on('pointerover', () => { if (enabled) FX.to(scene, container, { scale: 1.05 }, { duration: 120 }) })
    hit.on('pointerout', () => {
        if (pressed) { pressed = false; paint() }
        if (enabled) FX.to(scene, container, { scale: 1 }, { duration: 120 })
    })
    hit.on('pointerdown', () => { if (!enabled) return; pressed = true; paint() })
    hit.on('pointerup', () => {
        if (!enabled || !pressed) return
        pressed = false
        paint()
        onClick()
    })

    const setEnabled = (on: boolean) => {
        // Aplicado SEMPRE, mesmo sem mudança: basta o visual e a flag saírem
        // de sincronia uma vez para o botão ficar morto até o fim da fase.
        const changed = on !== enabled
        enabled = on
        pressed = false
        paint()
        if (hit.input) hit.input.cursor = on ? 'pointer' : 'default'
        if (!changed) return

        pulse?.remove()
        pulse = undefined
        FX.kill(scene, container)
        container.setScale(1)
        if (on) {
            // o botão só respira quando de fato dá para tocar nele
            FX.to(scene, container, { scale: 1.08 }, { duration: 180, yoyo: true, ease: Ease.back(2) })
            pulse = FX.breathe(scene, container, { grow: 1.035, duration: 1100 })
        }
    }

    return {
        container,
        setEnabled,
        isEnabled: () => enabled,
        setLabel: (t) => text.setText(t),
        destroy: () => { pulse?.remove(); hit.destroy(); container.destroy() },
    }
}

/* ══════════════════════════════════════════════════ cartão do pedido */

export interface RequestCard {
    container: Phaser.GameObjects.Container
    show(text: string, icon: FormatId): Promise<void>
    skipTyping(): void
    destroy(): void
}

export function createRequestCard(scene: Phaser.Scene): RequestCard {
    const container = scene.add.container(REQUEST.cx, REQUEST.cy).setDepth(20)

    const surface = scene.add.graphics()
    const mark = scene.add.graphics()

    const body = scene.add.text(REQUEST.textX, 0, '', {
        fontFamily: FONT.body, fontStyle: 'bold', fontSize: SIZE.request,
        color: hex(C.slate), wordWrap: { width: REQUEST.wrap }, lineSpacing: 6,
    }).setOrigin(0, 0.5).setResolution(2)

    container.add([surface, mark, body])

    let typing: { skip: () => void } | null = null

    /** Desenha o selo do formato pedido: calendário, grade ou "A". */
    const drawMark = (icon: FormatId) => {
        const tone = formatTone(icon)
        mark.clear()
        mark.fillStyle(C.white, 1)
        mark.fillRoundedRect(REQUEST.iconX - 31, -31, 62, 62, 14)
        mark.lineStyle(3, tone, 0.85)
        mark.strokeRoundedRect(REQUEST.iconX - 31, -31, 62, 62, 14)

        if (icon === 'date') {
            mark.fillStyle(tone, 1)
            mark.fillRoundedRect(REQUEST.iconX - 22, -22, 44, 12, { tl: 6, tr: 6, bl: 0, br: 0 })
            mark.fillStyle(tone, 0.34)
            for (let r = 0; r < 2; r += 1) {
                for (let c = 0; c < 3; c += 1) {
                    mark.fillRoundedRect(REQUEST.iconX - 20 + c * 14, -4 + r * 14, 10, 10, 2)
                }
            }
        } else if (icon === 'pixels') {
            const tones = [C.paintRed, C.paintBlue, C.paintYellow, tone]
            for (let i = 0; i < 4; i += 1) {
                mark.fillStyle(tones[i], 0.9)
                mark.fillRoundedRect(
                    REQUEST.iconX - 20 + (i % 2) * 22, -20 + Math.floor(i / 2) * 22, 18, 18, 4,
                )
            }
        } else {
            mark.fillStyle(tone, 0.9)
            mark.fillRoundedRect(REQUEST.iconX - 20, -6, 40, 8, 4)
            mark.fillStyle(tone, 0.45)
            mark.fillRoundedRect(REQUEST.iconX - 20, 8, 26, 8, 4)
            mark.fillRoundedRect(REQUEST.iconX - 20, -20, 32, 8, 4)
        }
    }

    return {
        container,

        show: async (text, icon) => {
            typing?.skip()
            paintRequestCard(surface, formatTone(icon))
            drawMark(icon)

            body.setFontSize(text.length > LONG_REQUEST ? SIZE.requestLong : SIZE.request)
            // mede com o texto completo antes de escrever, senão o cartão
            // cresceria letra a letra e o texto pularia dentro dele
            body.setText(text)
            body.setText('')

            FX.kill(scene, container)
            container.setAlpha(0).setScale(0.97)
            await FX.to(scene, container, { alpha: 1, scale: 1 }, { duration: 240, ease: Ease.back(1.5) })

            const tw = FX.type(scene, body, text, { delay: TYPE_MS.request })
            typing = tw
            await tw
            typing = null
        },

        skipTyping: () => typing?.skip(),
        destroy: () => { typing?.skip(); container.destroy() },
    }
}

/* ═════════════════════════════════════════════════ caixa de formato */

export interface FieldView {
    field: Field
    /** Centro absoluto na tela. */
    x: number
    y: number
    w: number
    h: number
    g: Phaser.GameObjects.Graphics
    label: Phaser.GameObjects.Text
    /** Escala com que uma peça assenta neste campo. */
    pieceScale: number
}

export interface FormatBox {
    spec: FormatBoxSpec
    container: Phaser.GameObjects.Container
    x: number
    y: number
    w: number
    h: number
    fields: FieldView[]
    tone: number
    setState(state: BoxState): void
    setFieldState(fieldId: string, state: FieldState): void
    resetFields(occupied: (fieldId: string) => boolean): void
    fieldAt(x: number, y: number): FieldView | null
    setTappable(on: boolean, onTap?: () => void): void
    shine(): Promise<void>
    shake(): Promise<void>
    destroy(): void
}

export function createFormatBox(
    scene: Phaser.Scene,
    spec: FormatBoxSpec,
    { x, y, w, h, showFields }: { x: number; y: number; w: number; h: number; showFields: boolean },
): FormatBox {
    const tone = formatTone(spec.format)
    const container = scene.add.container(x, y).setDepth(20)

    const surface = scene.add.graphics()
    container.add(surface)

    const title = scene.add.text(0, BOXES.titleDY, spec.title, {
        fontFamily: FONT.black, fontSize: SIZE.boxTitle, color: hex(C.slate),
    }).setOrigin(0.5).setResolution(2)

    const subtitle = scene.add.text(0, BOXES.subtitleDY, spec.subtitle, {
        fontFamily: FONT.body, fontStyle: 'bold', fontSize: SIZE.boxSubtitle,
        color: hex(C.muted), align: 'center', wordWrap: { width: w - 40 },
    }).setOrigin(0.5).setResolution(2)

    container.add([title, subtitle])

    // ── campos ─────────────────────────────────────────────────────────
    const n = spec.fields.length
    const tight = n > 3 || w <= BOXES.w3
    const fw = spec.fields[0]?.kind === 'pixel'
        ? FIELD.pixelSize
        : tight ? FIELD.wTight : FIELD.w
    const fh = spec.fields[0]?.kind === 'pixel' ? FIELD.pixelSize : (tight ? FIELD.wTight : FIELD.h)
    const gap = tight ? FIELD.gapTight : FIELD.gap
    const totalW = n * fw + (n - 1) * gap
    const startX = -totalW / 2 + fw / 2

    const fields: FieldView[] = spec.fields.map((field, i) => {
        const fx = startX + i * (fw + gap)
        const fy = BOXES.fieldsDY

        const g = scene.add.graphics().setPosition(fx, fy)
        paintField(g, fw, fh, FIELD.r, { tone, state: 'empty', kind: field.kind })

        const label = scene.add.text(fx, fy - fh / 2 - 16, field.label, {
            fontFamily: FONT.black, fontSize: SIZE.fieldLabel, color: hex(C.muted),
        }).setOrigin(0.5).setResolution(2)

        container.add([g, label])

        return {
            field, g, label,
            x: x + fx,
            y: y + fy,
            w: fw,
            h: fh,
            pieceScale: field.kind === 'pixel' ? 0.66 : (tight ? 0.68 : 0.78),
        }
    })

    if (!showFields) fields.forEach(f => { f.g.setVisible(false); f.label.setVisible(false) })

    let state: BoxState = showFields ? 'open' : 'closed'
    paintFormatBox(surface, w, h, BOXES.r, { tone, state })

    // ── toque (só na fase de escolher) ─────────────────────────────────
    let tapCb: (() => void) | undefined
    let tappable = false
    const hit = scene.add.zone(x, y, w, h).setOrigin(0.5).setDepth(21)

    hit.on('pointerover', () => { if (tappable) FX.to(scene, container, { scale: 1.04 }, { duration: 130 }) })
    hit.on('pointerout', () => { if (tappable) FX.to(scene, container, { scale: 1 }, { duration: 130 }) })
    hit.on('pointerup', () => { if (tappable) { FX.press(scene, container); tapCb?.() } })

    return {
        spec, container, x, y, w, h, fields, tone,

        setState: (s) => {
            state = s
            paintFormatBox(surface, w, h, BOXES.r, { tone, state: s })
        },

        setFieldState: (fieldId, s) => {
            const view = fields.find(f => f.field.id === fieldId)
            if (!view) return
            paintField(view.g, view.w, view.h, FIELD.r, { tone, state: s, kind: view.field.kind })
            view.label.setAlpha(s === 'empty' ? 1 : 0.62)
        },

        resetFields: (occupied) => {
            fields.forEach(f => {
                const s: FieldState = occupied(f.field.id) ? 'filled' : 'empty'
                paintField(f.g, f.w, f.h, FIELD.r, { tone, state: s, kind: f.field.kind })
                f.label.setAlpha(s === 'empty' ? 1 : 0.62)
            })
        },

        fieldAt: (px, py) => fields.find(f =>
            px >= f.x - f.w / 2 && px <= f.x + f.w / 2 &&
            py >= f.y - f.h / 2 && py <= f.y + f.h / 2) ?? null,

        setTappable: (on, cb) => {
            tappable = on
            tapCb = cb
            if (on) hit.setInteractive({ useHandCursor: true })
            else hit.disableInteractive()
        },

        shine: () => FX.shine(scene, container, { w, h, duration: 640, radius: BOXES.r }),
        shake: () => FX.shake(scene, container, { amount: 10, times: 3 }),
        destroy: () => { hit.destroy(); container.destroy() },
    }
}

/** Prévia dos campos numa caixa ainda fechada, para a escolha ter informação. */
export function drawBoxPreview(
    scene: Phaser.Scene,
    box: FormatBox,
    format: FormatId,
) {
    const g = scene.add.graphics()
    const tone = formatTone(format)
    const n = format === 'text' ? 4 : 3
    const size = format === 'pixels' ? 46 : 40
    const gap = 12
    const total = n * size + (n - 1) * gap
    const start = -total / 2 + size / 2

    for (let i = 0; i < n; i += 1) {
        const px = start + i * (size + gap)
        g.fillStyle(C.shadow, 0.16)
        g.fillRoundedRect(px - size / 2, BOXES.fieldsDY - size / 2, size, size, 10)
        g.fillStyle(C.white, 0.55)
        g.fillRoundedRect(px - size / 2 + 2, BOXES.fieldsDY - size / 2 + 2, size - 4, size - 5, 8)
        g.lineStyle(3, tone, 0.85)
        g.strokeRoundedRect(px - size / 2, BOXES.fieldsDY - size / 2, size, size, 10)

        if (format === 'pixels') {
            g.fillStyle([C.paintRed, C.paintBlue, C.paintYellow][i] ?? tone, 0.32)
            g.fillRoundedRect(px - size / 2 + 8, BOXES.fieldsDY - size / 2 + 8, size - 16, size - 16, 5)
        }
    }

    box.container.add(g)
    return g
}

/* ═══════════════════════════════════════════════════════════ peças */

export interface PieceView {
    piece: Piece
    container: Phaser.GameObjects.Container
    homeX: number
    homeY: number
    w: number
    h: number
    setHome(x: number, y: number): void
    moveTo(x: number, y: number): void
    lift(on: boolean): void
    /** Dentro de um poço a peça perde o corpo e fica só o dado. */
    place(on: boolean): void
    compact(on: boolean): void
    destroy(): void
}

export function createPiece(
    scene: Phaser.Scene,
    piece: Piece,
    { x, y, w, h, onDown }: {
        x: number; y: number; w: number; h: number
        onDown: (piece: Piece) => void
    },
): PieceView {
    const tone = formatTone(piece.format)
    const hasOwner = piece.format !== null

    const container = scene.add.container(x, y).setDepth(40)

    const body = scene.add.graphics()
    paintPiece(body, w, h, TRAY.cardR, { tone, hasOwner })

    const markG = scene.add.graphics()
    const labelY = drawPieceMark(markG, piece, h)

    container.add([body, markG])

    let glyph: Phaser.GameObjects.Text | undefined
    let label: Phaser.GameObjects.Text | undefined

    if (piece.kind === 'numero') {
        glyph = scene.add.text(0, -4, piece.label, {
            fontFamily: FONT.black,
            fontSize: piece.label.length > 3 ? SIZE.pieceGlyphSmall : SIZE.pieceGlyph,
            color: hex(tone),
        }).setOrigin(0.5).setResolution(2)
        container.add(glyph)
    } else if (piece.kind === 'mes') {
        // 16px encolhia para ~12px dentro do poço e o mês virava borrão
        glyph = scene.add.text(0, 7, piece.label, {
            fontFamily: FONT.black, fontSize: SIZE.pieceLabel, color: hex(C.date),
        }).setOrigin(0.5).setResolution(2)
        container.add(glyph)
    } else if (piece.kind === 'palavra') {
        glyph = scene.add.text(0, -1, piece.label, {
            fontFamily: FONT.black,
            fontSize: piece.label.length > LONG_PIECE_LABEL ? SIZE.pieceLabelSmall : SIZE.pieceLabel,
            color: hex(C.text),
        }).setOrigin(0.5).setResolution(2)
        container.add(glyph)
    } else if (labelY !== null) {
        label = scene.add.text(0, labelY, piece.label, {
            fontFamily: FONT.body, fontStyle: 'bold',
            fontSize: piece.label.length > LONG_PIECE_LABEL ? SIZE.pieceLabelSmall : SIZE.pieceLabel,
            color: hex(C.muted),
        }).setOrigin(0.5).setResolution(2)
        container.add(label)
    }

    // A zona de toque é FILHA do cartão: precisa acompanhar o voo até o
    // campo. Zona parada aqui deixaria a peça inalcançável em movimento.
    const hit = scene.add.zone(0, 0, w, h).setOrigin(0.5).setInteractive({ useHandCursor: true })
    hit.on('pointerdown', () => onDown(piece))
    container.add(hit)
    container.setSize(w, h)

    let homeX = x
    let homeY = y
    let held = false
    let placed = false

    const repaint = () => paintPiece(body, w, h, TRAY.cardR, { tone, held, hasOwner, placed })

    return {
        piece, container, w, h,
        get homeX() { return homeX },
        get homeY() { return homeY },

        setHome: (nx, ny) => { homeX = nx; homeY = ny },
        moveTo: (nx, ny) => container.setPosition(nx, ny),

        lift: (on) => { held = on; repaint() },
        place: (on) => { placed = on; repaint() },

        /** Dentro de um poço de pixel o rótulo não cabe; a cor já é o dado. */
        compact: (on) => label?.setVisible(!on),

        destroy: () => container.destroy(),
    }
}

/* ═════════════════════════════════════════════════════════════ toast */

export function showToast(
    scene: Phaser.Scene,
    message: string,
    tone: number,
    life = 1800,
) {
    const container = scene.add.container(BENCH.cx, TOAST.hiddenY).setDepth(200)

    const g = scene.add.graphics()
    g.fillStyle(C.shadow, 0.3)
    g.fillRoundedRect(-TOAST.w / 2 + 4, -TOAST.h / 2 + 8, TOAST.w, TOAST.h, TOAST.r)
    g.fillStyle(tone, 0.97)
    g.fillRoundedRect(-TOAST.w / 2, -TOAST.h / 2, TOAST.w, TOAST.h, TOAST.r)
    g.fillStyle(C.white, 0.2)
    g.fillRoundedRect(-TOAST.w / 2 + 12, -TOAST.h / 2 + 8, TOAST.w - 24, 14, 7)
    g.lineStyle(4, C.white, 0.88)
    g.strokeRoundedRect(-TOAST.w / 2, -TOAST.h / 2, TOAST.w, TOAST.h, TOAST.r)

    const text = scene.add.text(0, 0, message, {
        fontFamily: FONT.black, fontSize: SIZE.toast, color: hex(C.white),
        align: 'center', wordWrap: { width: TOAST.w - 56 },
    }).setOrigin(0.5).setResolution(2)

    container.add([g, text])

    FX.seq(
        () => FX.to(scene, container, { y: TOAST.y }, { duration: 300, ease: Ease.back(1.6) }),
        () => FX.wait(scene, life),
        () => FX.to(scene, container, { y: TOAST.hiddenY, alpha: 0 }, { duration: 260 }),
    ).then(() => container.destroy())

    return container
}

/* ══════════════════════════════════════════════════════ cronômetro */

export interface TimerBar {
    set(progress: number): void
    flashFail(): void
    destroy(): void
}

export function createTimerBar(scene: Phaser.Scene): TimerBar {
    const left = TIMER.cx - TIMER.w / 2

    const track = scene.add.graphics().setDepth(18)
    track.fillStyle(C.shadow, 0.36)
    track.fillRoundedRect(left - 5, TIMER.y - 5, TIMER.w + 10, TIMER.h + 10, TIMER.r + 5)
    track.fillStyle(C.wallLight, 1)
    track.fillRoundedRect(left, TIMER.y, TIMER.w, TIMER.h, TIMER.r)
    track.lineStyle(3, C.idle, 0.6)
    track.strokeRoundedRect(left, TIMER.y, TIMER.w, TIMER.h, TIMER.r)

    const fill = scene.add.graphics().setDepth(19)
    let panicking = false
    let pulse: Phaser.Tweens.Tween | undefined

    const set = (progress: number) => {
        const p = Phaser.Math.Clamp(progress, 0, 1)
        const width = TIMER.w * p
        const tone = p > TIMER.warnAt ? C.ok : p > TIMER.panicAt ? C.pixels : C.fail

        fill.clear()
        if (width > 2) {
            // o raio nunca passa de metade da largura: com a barra quase
            // vazia o arredondamento estourava e o resto virava uma bolha
            const r = Math.min(TIMER.r, width / 2)
            fill.fillStyle(tone, 1)
            fill.fillRoundedRect(left, TIMER.y, width, TIMER.h, r)
            fill.fillStyle(C.white, 0.24)
            fill.fillRoundedRect(left + 6, TIMER.y + 5, Math.max(4, width - 12), 8, 4)
        }

        // O pulso é instalado UMA vez ao cruzar o limiar. Reinstalar a cada
        // onUpdate criava dezenas de tweens no mesmo alvo.
        const shouldPanic = p > 0 && p <= TIMER.panicAt
        if (shouldPanic !== panicking) {
            panicking = shouldPanic
            pulse?.remove()
            pulse = undefined
            fill.setAlpha(1)
            if (shouldPanic) {
                pulse = scene.tweens.add({
                    targets: fill, alpha: 0.55,
                    duration: 320, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
                })
            }
        }
    }

    set(1)

    return {
        set,
        flashFail: () => {
            const flash = scene.add.graphics().setDepth(20)
            flash.fillStyle(C.fail, 0.7)
            flash.fillRoundedRect(left, TIMER.y, TIMER.w, TIMER.h, TIMER.r)
            FX.to(scene, flash, { alpha: 0 }, { duration: 500 }).then(() => flash.destroy())
        },
        destroy: () => { pulse?.remove(); fill.destroy(); track.destroy() },
    }
}

/** Voo em arco da peça até o campo. Linha reta lê como teletransporte. */
export function flyToField(
    scene: Phaser.Scene,
    node: Phaser.GameObjects.Container,
    to: { x: number; y: number },
    endScale: number,
    duration = 320,
) {
    FX.to(scene, node, { scale: endScale, angle: 0 }, { duration, ease: Ease.smooth })
    return FX.arcTo(scene, node, to, { height: 74, duration })
}

/** Cascata de entrada da bandeja. */
export function dealIn(scene: Phaser.Scene, pieces: PieceView[]) {
    return FX.stagger(
        scene,
        pieces.map(p => p.container),
        (node) => FX.popIn(scene, node, { from: 0.7, duration: 340 }),
        60,
    )
}

export { W, H }
