import Phaser from 'phaser'
import { FX, Ease } from '../../../../shared/effects/FX'
import { C, A, FONT, SIZE, TYPE_MS, LONG_QUESTION, hex } from '../data/theme'
import {
    W, H, HUD, QUESTION, MSG, PILL, IMPACT, WATCH, TOAST,
} from '../data/layout'
import type { Chunk, Message } from '../types'

/*
 * Painters puros e construtores. A GameScene não desenha nada: se ela precisar
 * de um `fillRoundedRect`, falta um painter aqui.
 */

/* ═══════════════════════════════════════════════════════════ texturas */

export const TEX = {
    bg: 'bg-investigacao',
    /** Dado exposto. */
    alerta: 'icone-alerta',
    /** Seguro / pode postar. */
    chave: 'icone-chave',
    /** Selo de investigador, no fim do nível. */
    lupa: 'icone-lupa',
    /** Quem passou a saber. */
    desconhecido: 'icone-usuario-desc',
} as const

export const hasTex = (scene: Phaser.Scene, key: string) => scene.textures.exists(key)

/**
 * Encaixa a imagem numa CAIXA MÁXIMA, sem distorcer.
 *
 * Escala pela menor razão em vez de `setDisplaySize`: os PNGs têm folga
 * transparente em volta, então forçar largura e altura esticaria o desenho.
 */
export function fitImage(image: Phaser.GameObjects.Image, maxW: number, maxH: number) {
    image.setScale(Math.min(maxW / image.width, maxH / image.height))
    return image
}

type IconKind = 'alerta' | 'chave' | 'lupa' | 'desconhecido'

const ICON_KEY: Record<IconKind, string> = {
    alerta: TEX.alerta,
    chave: TEX.chave,
    lupa: TEX.lupa,
    desconhecido: TEX.desconhecido,
}

/** Desenho de cada ícone, para quando a textura não estiver na pasta. */
export function drawIcon(g: Phaser.GameObjects.Graphics, kind: IconKind, size: number) {
    const r = size / 2

    if (kind === 'alerta') {
        g.fillStyle(C.shadow, 0.2)
        g.fillCircle(2, 4, r)
        g.fillStyle(C.risk, 1)
        g.fillCircle(0, 0, r)
        g.fillStyle(C.white, 1)
        g.fillRoundedRect(-r * 0.11, -r * 0.5, r * 0.22, r * 0.62, r * 0.11)
        g.fillCircle(0, r * 0.42, r * 0.13)
        return
    }

    if (kind === 'chave') {
        g.fillStyle(C.shadow, 0.2)
        g.fillCircle(2, 4, r * 0.98)
        g.fillStyle(C.safe, 1)
        g.fillCircle(-r * 0.34, 0, r * 0.44)
        g.fillStyle(C.paper, 1)
        g.fillCircle(-r * 0.34, 0, r * 0.18)
        g.fillStyle(C.safe, 1)
        g.fillRoundedRect(-r * 0.1, -r * 0.13, r * 0.95, r * 0.26, r * 0.13)
        g.fillRoundedRect(r * 0.44, 0, r * 0.16, r * 0.4, r * 0.08)
        g.fillRoundedRect(r * 0.72, 0, r * 0.14, r * 0.3, r * 0.07)
        return
    }

    if (kind === 'lupa') {
        g.fillStyle(C.shadow, 0.2)
        g.fillCircle(2, 4, r * 0.9)
        g.lineStyle(Math.max(5, r * 0.2), C.probe, 1)
        g.strokeCircle(-r * 0.16, -r * 0.16, r * 0.56)
        g.fillStyle(C.white, 0.24)
        g.fillCircle(-r * 0.16, -r * 0.16, r * 0.44)
        g.fillStyle(C.risk, 1)
        g.fillRoundedRect(r * 0.22, r * 0.22, r * 0.66, r * 0.2, r * 0.1)
        return
    }

    // desconhecido: silhueta neutra, cinza. Nunca capuz, nunca máscara.
    g.fillStyle(C.shadow, 0.16)
    g.fillEllipse(2, r * 0.86, r * 1.5, r * 0.3)
    g.fillStyle(C.unknown, 1)
    g.fillCircle(0, -r * 0.3, r * 0.42)
    g.fillRoundedRect(-r * 0.66, r * 0.16, r * 1.32, r * 0.72, r * 0.34)
    g.fillStyle(C.paper, 0.9)
    g.fillRoundedRect(-r * 0.1, -r * 0.46, r * 0.2, r * 0.14, r * 0.07)
    g.fillCircle(0, -r * 0.12, r * 0.08)
}

/** O ícone, decidindo entre arte e código. Devolve sempre um posicionável. */
export function createIcon(
    scene: Phaser.Scene,
    kind: IconKind,
    size: number,
): Phaser.GameObjects.Container {
    const node = scene.add.container(0, 0)
    const key = ICON_KEY[kind]

    if (hasTex(scene, key)) {
        const img = scene.add.image(0, 0, key)
        fitImage(img, size, size)
        node.add(img)
        return node
    }

    const g = scene.add.graphics()
    drawIcon(g, kind, size)
    node.add(g)
    return node
}

/* ═══════════════════════════════════════════════════════════ cenário */

/** Parede fria com um degradê barato e vinheta. Fallback do cenário. */
export function paintRoom(g: Phaser.GameObjects.Graphics) {
    g.clear()
    for (let i = 0; i < 16; i += 1) {
        const t = i / 15
        const color = Phaser.Display.Color.Interpolate.ColorWithColor(
            Phaser.Display.Color.ValueToColor(C.ink),
            Phaser.Display.Color.ValueToColor(C.inkSoft),
            15, i,
        )
        g.fillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b), 1)
        g.fillRect(0, Math.floor(t * H), W, Math.ceil(H / 16) + 1)
    }
    g.fillStyle(C.white, 0.03)
    for (let y = 30; y < H; y += 38) {
        for (let x = 30; x < W; x += 38) g.fillCircle(x, y, 2)
    }
    g.fillStyle(C.wood, 1)
    g.fillRect(0, H - 44, W, 44)
    g.fillStyle(C.ink, 0.24)
    g.fillRect(0, 0, W, 70)
}

export function createScene(scene: Phaser.Scene): void {
    if (!hasTex(scene, TEX.bg)) {
        const g = scene.add.graphics().setDepth(-20)
        paintRoom(g)
        return
    }

    const bg = scene.add.image(W / 2, H / 2, TEX.bg).setDepth(-20)
    bg.setScale(Math.max(W / bg.width, H / bg.height))

    const veil = scene.add.graphics().setDepth(-19)
    veil.fillStyle(C.ink, A.veil)
    veil.fillRect(0, 0, W, H)
    veil.fillStyle(C.ink, 0.22)
    veil.fillRect(0, 0, W, 70)
    veil.fillRect(0, H - 70, W, 70)
}

/* ═══════════════════════════════════════════════════════════════ HUD */

export function paintHudBar(g: Phaser.GameObjects.Graphics) {
    g.clear()
    g.fillStyle(C.shadow, 0.32)
    g.fillRoundedRect(HUD.x + 4, HUD.y + 7, HUD.w, HUD.h, HUD.r)
    g.fillStyle(C.ink, 0.94)
    g.fillRoundedRect(HUD.x, HUD.y, HUD.w, HUD.h, HUD.r)
    g.fillStyle(C.white, 0.07)
    g.fillRoundedRect(HUD.x + 16, HUD.y + 10, HUD.w - 32, 18, 9)
    g.lineStyle(3, C.probe, 0.55)
    g.strokeRoundedRect(HUD.x, HUD.y, HUD.w, HUD.h, HUD.r)
}

export interface Hud {
    container: Phaser.GameObjects.Container
    setLevel(level: number): void
    setTitle(text: string): void
    setHint(text: string): void
    setProgress(done: number, total: number): void
    setHelpEnabled(on: boolean): void
    destroy(): void
}

export function createHud(scene: Phaser.Scene, { onHelp }: { onHelp: () => void }): Hud {
    const container = scene.add.container(0, 0).setDepth(80)

    const bar = scene.add.graphics()
    paintHudBar(bar)
    container.add(bar)

    const pill = scene.add.graphics()
    pill.fillStyle(C.probe, 1)
    pill.fillRoundedRect(HUD.pillX, HUD.pillY, HUD.pillW, HUD.pillH, HUD.pillH / 2)
    pill.fillStyle(C.white, 0.28)
    pill.fillRoundedRect(HUD.pillX + 10, HUD.pillY + 6, HUD.pillW - 20, 12, 6)
    container.add(pill)

    const levelLabel = scene.add.text(HUD.pillX + HUD.pillW / 2, HUD.cy, 'NÍVEL 1', {
        fontFamily: FONT.black, fontSize: SIZE.hudLevel, color: hex(C.white),
    }).setOrigin(0.5).setResolution(2)
    container.add(levelLabel)

    const title = scene.add.text(HUD.titleX, HUD.titleY, '', {
        fontFamily: FONT.black, fontSize: SIZE.hudTitle, color: hex(C.paper),
        align: 'center', wordWrap: { width: HUD.titleW },
    }).setOrigin(0.5).setResolution(2)
    container.add(title)

    const hint = scene.add.text(HUD.titleX, HUD.hintY, '', {
        fontFamily: FONT.body, fontStyle: 'bold', fontSize: SIZE.hudHint,
        color: hex(C.unknown), align: 'center', wordWrap: { width: HUD.hintW },
    }).setOrigin(0.5).setResolution(2)
    container.add(hint)

    const dots = scene.add.container(0, 0)
    container.add(dots)

    const help = createRoundButton(scene, HUD.helpX, HUD.cy, HUD.helpR, '?', onHelp)
    container.add(help.container)

    FX.slideIn(scene, container, { dy: 26, duration: 340 })

    return {
        container,
        setLevel: level => levelLabel.setText(`NÍVEL ${level}`),
        setTitle: text => title.setText(text),
        setHint: text => hint.setText(text),
        setProgress: (done, total) => {
            dots.removeAll(true)
            if (total <= 0) return
            const gap = total > 1 ? Math.min(26, HUD.dotsMaxW / (total - 1)) : 0
            for (let i = 0; i < total; i += 1) {
                const x = HUD.dotsX + i * gap
                const g = scene.add.graphics()
                if (i < done) {
                    g.fillStyle(C.safe, 1)
                    g.fillCircle(x, HUD.cy, HUD.dotR)
                    g.lineStyle(2, C.safeSoft, 1)
                    g.strokeCircle(x, HUD.cy, HUD.dotR)
                } else if (i === done) {
                    g.fillStyle(C.probe, 1)
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
        destroy: () => { help.destroy(); container.destroy() },
    }
}

/* ══════════════════════════════════════════════════════════ botões */

export interface RoundButton {
    container: Phaser.GameObjects.Container
    setEnabled(on: boolean): void
    destroy(): void
}

/**
 * A zona de toque é um objeto separado, parado.
 *
 * O container cresce no hover e afunda no clique; se a área de toque fosse ele,
 * a borda mudaria de tamanho no meio do gesto e um `pointerup` perto da margem
 * cairia fora, comendo o clique.
 */
export function createRoundButton(
    scene: Phaser.Scene,
    x: number, y: number, r: number,
    label: string,
    onClick: () => void,
): RoundButton {
    const container = scene.add.container(x, y)

    const g = scene.add.graphics()
    g.fillStyle(C.shadow, 0.3)
    g.fillCircle(0, 4, r)
    g.fillStyle(C.probe, 1)
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
    hit.on('pointerup', () => { if (!enabled) return; FX.press(scene, container); onClick() })

    return {
        container,
        setEnabled: on => {
            enabled = on
            container.setAlpha(on ? 1 : A.off)
            if (hit.input) hit.input.cursor = on ? 'pointer' : 'default'
        },
        destroy: () => { hit.destroy(); container.destroy() },
    }
}

/* ═════════════════════════════════════════════════════════ pergunta */

export interface QuestionLine {
    show(text: string): Promise<void>
    destroy(): void
}

export function createQuestionLine(scene: Phaser.Scene): QuestionLine {
    const label = scene.add.text(QUESTION.cx, QUESTION.cy, '', {
        fontFamily: FONT.black, fontSize: SIZE.question, color: hex(C.paper),
        align: 'center', wordWrap: { width: QUESTION.wrap },
    }).setOrigin(0.5).setResolution(2).setDepth(30)

    let typing: { skip: () => void } | null = null

    return {
        show: async text => {
            typing?.skip()
            label.setFontSize(text.length > LONG_QUESTION ? SIZE.questionLong : SIZE.question)
            // mede com o texto completo antes de escrever, senão a linha
            // cresceria letra a letra e o texto pularia
            label.setText(text)
            label.setText('')
            const tw = FX.type(scene, label, text, { delay: TYPE_MS.question })
            typing = tw
            await tw
            typing = null
        },
        destroy: () => { typing?.skip(); label.destroy() },
    }
}

/* ═══════════════════════════════════════════════ cartão de mensagem */

export function paintPostCard(
    g: Phaser.GameObjects.Graphics,
    w: number, h: number, r: number,
    { tone, thick = 4 }: { tone: number; thick?: number },
) {
    const left = -w / 2
    const top = -h / 2

    g.clear()
    g.fillStyle(C.shadow, 0.34)
    g.fillRoundedRect(left + 7, top + 12, w, h, r)
    g.fillStyle(C.paperEdge, 1)
    g.fillRoundedRect(left, top, w, h, r)
    g.fillStyle(C.paper, 1)
    g.fillRoundedRect(left + 5, top + 5, w - 10, h - 12, r - 4)
    g.fillStyle(C.white, A.gloss)
    g.fillRoundedRect(left + 18, top + 12, w - 36, 16, 8)
    // faixa do cabeçalho, separando "de: Lia" do corpo do post
    g.fillStyle(tone, 0.14)
    g.fillRoundedRect(left + 5, top + 5, w - 10, 74, { tl: r - 4, tr: r - 4, bl: 0, br: 0 })
    g.lineStyle(thick, tone, 1)
    g.strokeRoundedRect(left, top, w, h, r)
}

export type PillState = 'idle' | 'hover' | 'found' | 'safe'

/**
 * A pastilha de informação.
 *
 * `idle` é REBAIXADA com borda pontilhada: buraco convida a tocar. `found` é
 * âmbar cheia — o dado exposto fica marcado para sempre no post, porque é ele
 * que a criança precisa continuar vendo enquanto lê a consequência.
 */
export function paintPill(
    g: Phaser.GameObjects.Graphics,
    w: number, h: number,
    { state }: { state: PillState },
) {
    const left = -w / 2
    const top = -h / 2
    const r = PILL.r

    g.clear()

    if (state === 'found') {
        g.fillStyle(C.shadow, 0.24)
        g.fillRoundedRect(left + 3, top + 6, w, h, r)
        g.fillStyle(C.riskSoft, 1)
        g.fillRoundedRect(left, top, w, h, r)
        g.lineStyle(5, C.risk, 1)
        g.strokeRoundedRect(left, top, w, h, r)
        return
    }

    if (state === 'safe') {
        g.fillStyle(C.safeSoft, 1)
        g.fillRoundedRect(left, top, w, h, r)
        g.lineStyle(5, C.safe, 1)
        g.strokeRoundedRect(left, top, w, h, r)
        return
    }

    g.fillStyle(C.probeSoft, state === 'hover' ? 0.95 : 0.55)
    g.fillRoundedRect(left, top, w, h, r)

    if (state === 'hover') {
        g.lineStyle(5, C.probe, 1)
        g.strokeRoundedRect(left, top, w, h, r)
        return
    }
    strokeDashedRoundedRect(g, left, top, w, h, r, 3, 11, 8, C.probe)
}

function strokeDashedRoundedRect(
    g: Phaser.GameObjects.Graphics,
    x: number, y: number, w: number, h: number, r: number,
    thickness: number, dash: number, gap: number, color: number,
) {
    g.lineStyle(thickness, color, 0.8)
    const seg = dash + gap
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

/* ─────────────────────────────────────────── o post e seus pedaços */

interface Item {
    kind: 'word' | 'pill'
    text: string
    chunk?: Chunk
    w: number
}

/** Pontuação colada no que vem antes: nada de " ." no meio da frase. */
const TIGHT = /^[.,!?;:]/

export interface PostView {
    container: Phaser.GameObjects.Container
    /** Marca o pedaço como dado exposto, com o selo de alerta. */
    markFound(id: string): Promise<void>
    /** Recusa suave: treme e volta. */
    nudge(id: string): Promise<void>
    posOf(id: string): { x: number; y: number } | null
    setEnabled(on: boolean): void
    destroy(): void
}

/**
 * Monta um post com os pedaços fluindo como texto de verdade.
 *
 * As palavras de ligação quebram linha normalmente; a pastilha NUNCA é
 * partida — ela é uma unidade de informação, e um endereço cortado no meio de
 * duas linhas deixaria de ser um alvo de toque e de ser legível.
 */
export function createPost(
    scene: Phaser.Scene,
    message: Message,
    {
        cx, cy, w, h, wrap, lineH, textCY, fromDY, avatarX, fromX, avatarSize,
        fontSize, tone, onTap,
    }: {
        cx: number; cy: number; w: number; h: number
        wrap: number; lineH: number; textCY: number
        fromDY: number; avatarX: number; fromX: number; avatarSize: number
        fontSize: string; tone: number
        onTap?: (chunk: Chunk) => void
    },
): PostView {
    const container = scene.add.container(cx, cy).setDepth(30)

    const surface = scene.add.graphics()
    paintPostCard(surface, w, h, MSG.r, { tone })
    container.add(surface)

    // ── cabeçalho ──────────────────────────────────────────────────────
    const avatar = createIcon(scene, 'desconhecido', avatarSize)
    avatar.setPosition(avatarX, fromDY)
    container.add(avatar)

    const from = scene.add.text(fromX, fromDY, `de: ${message.from}`, {
        fontFamily: FONT.black, fontSize: SIZE.from, color: hex(C.muted),
    }).setOrigin(0, 0.5).setResolution(2)
    container.add(from)

    // ── medir ──────────────────────────────────────────────────────────
    const style = { fontFamily: FONT.body, fontStyle: 'bold', fontSize, color: hex(C.slate) }
    const stylePill = { ...style, fontFamily: FONT.black }

    const probe = scene.add.text(0, 0, ' ', style).setResolution(2).setVisible(false)
    const spaceW = probe.width
    probe.destroy()

    const items: Item[] = []
    message.chunks.forEach(chunk => {
        if (chunk.pill) {
            const t = scene.add.text(0, 0, chunk.text, stylePill).setResolution(2).setVisible(false)
            const tw = t.width
            t.destroy()
            items.push({ kind: 'pill', text: chunk.text, chunk, w: tw + PILL.padX * 2 })
            return
        }
        chunk.text.split(/\s+/).filter(Boolean).forEach(word => {
            const t = scene.add.text(0, 0, word, style).setResolution(2).setVisible(false)
            const tw = t.width
            t.destroy()
            items.push({ kind: 'word', text: word, w: tw })
        })
    })

    // ── quebrar em linhas ──────────────────────────────────────────────
    const lines: Item[][] = [[]]
    const widths: number[] = [0]

    items.forEach(item => {
        const line = lines[lines.length - 1]
        const tight = item.kind === 'word' && TIGHT.test(item.text) && line.length > 0
        const lead = line.length === 0 ? 0 : tight ? 0 : (item.kind === 'pill' ? PILL.gap : spaceW)

        if (line.length > 0 && widths[widths.length - 1] + lead + item.w > wrap) {
            lines.push([item])
            widths.push(item.w)
            return
        }
        line.push(item)
        widths[widths.length - 1] += lead + item.w
    })

    const blockH = lines.length * lineH
    const top = textCY - blockH / 2 + lineH / 2

    // ── desenhar ───────────────────────────────────────────────────────
    const pills = new Map<string, {
        node: Phaser.GameObjects.Container
        g: Phaser.GameObjects.Graphics
        seal: Phaser.GameObjects.Container
        w: number
        x: number
        y: number
        chunk: Chunk
        state: PillState
    }>()
    const zones: Phaser.GameObjects.Zone[] = []
    let enabled = true

    lines.forEach((line, li) => {
        const y = top + li * lineH
        let x = -widths[li] / 2

        line.forEach((item, ii) => {
            if (ii > 0) {
                const prev = line[ii - 1]
                const tight = item.kind === 'word' && TIGHT.test(item.text)
                x += tight ? 0 : (item.kind === 'pill' || prev.kind === 'pill' ? PILL.gap : spaceW)
            }

            const centerX = x + item.w / 2

            if (item.kind === 'word') {
                const t = scene.add.text(centerX, y, item.text, style)
                    .setOrigin(0.5).setResolution(2)
                container.add(t)
                x += item.w
                return
            }

            const chunk = item.chunk!
            const node = scene.add.container(centerX, y)
            const g = scene.add.graphics()
            paintPill(g, item.w, PILL.h, { state: 'idle' })

            const label = scene.add.text(0, 0, chunk.text, stylePill)
                .setOrigin(0.5).setResolution(2)

            const seal = scene.add.container(item.w / 2 - PILL.sealDX, -PILL.h / 2 + 4).setVisible(false)

            node.add([g, label, seal])
            container.add(node)

            const zone = scene.add.zone(cx + centerX, cy + y, item.w, PILL.h)
                .setOrigin(0.5).setDepth(31)
            zone.setInteractive({ useHandCursor: true })

            const view = { node, g, seal, w: item.w, x: centerX, y, chunk, state: 'idle' as PillState }

            zone.on('pointerover', () => {
                if (!enabled || view.state !== 'idle') return
                paintPill(g, item.w, PILL.h, { state: 'hover' })
                FX.to(scene, node, { scale: 1.06 }, { duration: 120 })
            })
            zone.on('pointerout', () => {
                if (!enabled || view.state !== 'idle') return
                paintPill(g, item.w, PILL.h, { state: 'idle' })
                FX.to(scene, node, { scale: 1 }, { duration: 120 })
            })
            zone.on('pointerup', () => {
                if (!enabled || view.state !== 'idle') return
                FX.press(scene, node)
                onTap?.(chunk)
            })

            zones.push(zone)
            pills.set(chunk.id, view)
            x += item.w
        })
    })

    return {
        container,

        markFound: async id => {
            const view = pills.get(id)
            if (!view) return
            view.state = 'found'
            paintPill(view.g, view.w, PILL.h, { state: 'found' })

            const icon = createIcon(scene, 'alerta', PILL.sealSize)
            view.seal.add(icon)
            view.seal.setVisible(true)
            await FX.all(
                FX.popIn(scene, view.seal, { from: 0.3, duration: 300 }),
                FX.to(scene, view.node, { scale: 1.1 }, { duration: 160, yoyo: true, ease: Ease.back(2) }),
            )
        },

        nudge: async id => {
            const view = pills.get(id)
            if (!view) return
            paintPill(view.g, view.w, PILL.h, { state: 'safe' })
            await FX.shake(scene, view.node, { amount: 8, times: 2 })
            if (view.state === 'idle') paintPill(view.g, view.w, PILL.h, { state: 'idle' })
        },

        posOf: id => {
            const view = pills.get(id)
            return view ? { x: cx + view.x, y: cy + view.y } : null
        },

        setEnabled: on => { enabled = on },

        destroy: () => { zones.forEach(z => z.destroy()); container.destroy() },
    }
}

/* ═══════════════════════════════════════════════ cartão de impacto */

export interface ImpactCard {
    show(text: string): Promise<void>
    hide(): void
    destroy(): void
}

export function createImpactCard(scene: Phaser.Scene): ImpactCard {
    const container = scene.add.container(IMPACT.cx, IMPACT.cy).setDepth(40).setVisible(false)

    const g = scene.add.graphics()
    g.fillStyle(C.shadow, 0.3)
    g.fillRoundedRect(-IMPACT.w / 2 + 5, -IMPACT.h / 2 + 9, IMPACT.w, IMPACT.h, IMPACT.r)
    g.fillStyle(C.riskSoft, 1)
    g.fillRoundedRect(-IMPACT.w / 2, -IMPACT.h / 2, IMPACT.w, IMPACT.h, IMPACT.r)
    g.fillStyle(C.white, 0.4)
    g.fillRoundedRect(-IMPACT.w / 2 + 14, -IMPACT.h / 2 + 10, IMPACT.w - 28, 14, 7)
    g.lineStyle(5, C.risk, 1)
    g.strokeRoundedRect(-IMPACT.w / 2, -IMPACT.h / 2, IMPACT.w, IMPACT.h, IMPACT.r)
    container.add(g)

    const icon = createIcon(scene, 'alerta', IMPACT.iconSize)
    icon.setPosition(IMPACT.iconX, 0)
    container.add(icon)

    const text = scene.add.text(IMPACT.textX, 0, '', {
        fontFamily: FONT.black, fontSize: SIZE.impact, color: hex(C.riskDark),
        wordWrap: { width: IMPACT.wrap }, lineSpacing: 5,
    }).setOrigin(0, 0.5).setResolution(2)
    container.add(text)

    return {
        show: async line => {
            text.setText(line)
            container.setVisible(true)
            FX.kill(scene, container)
            container.setAlpha(0).setScale(0.94)
            await FX.to(scene, container, { alpha: 1, scale: 1 },
                { duration: 280, ease: Ease.back(1.6) })
        },
        hide: () => { container.setVisible(false) },
        destroy: () => container.destroy(),
    }
}

/* ═══════════════════════════════════════════ quem passou a saber */

export interface Watchers {
    /** Sobem `n` desconhecidos. Resolve quando o último parou. */
    add(n: number): Promise<void>
    count(): number
    clear(): void
    destroy(): void
}

/**
 * A fileira de desconhecidos.
 *
 * É o impacto virado em QUANTIDADE, e é o coração do jogo: a criança não lê que
 * o vazamento foi grave, ela vê seis pessoas que não conhece aparecerem.
 */
export function createWatchers(scene: Phaser.Scene): Watchers {
    const container = scene.add.container(0, 0).setDepth(35)

    const label = scene.add.text(WATCH.cx, WATCH.labelY, 'QUEM PASSOU A SABER', {
        fontFamily: FONT.black, fontSize: SIZE.watchLabel, color: hex(C.unknown),
    }).setOrigin(0.5).setResolution(2).setVisible(false)
    container.add(label)

    const row = scene.add.container(WATCH.cx, WATCH.y)
    container.add(row)

    let nodes: Phaser.GameObjects.Container[] = []

    /** Reposiciona a fileira inteira: ela cresce e precisa continuar centrada. */
    const relayout = () => {
        const n = nodes.length
        if (!n) return
        const size = WATCH.size
        const step = Math.min(size + WATCH.gap, WATCH.rowW / n)
        const total = (n - 1) * step
        nodes.forEach((node, i) => {
            const x = -total / 2 + i * step
            FX.to(scene, node, { x }, { duration: 240, ease: Ease.smooth })
        })
    }

    return {
        add: async n => {
            label.setVisible(true)
            const fresh: Phaser.GameObjects.Container[] = []

            for (let i = 0; i < n && nodes.length < WATCH.max; i += 1) {
                const node = createIcon(scene, 'desconhecido', WATCH.size)
                node.setPosition(0, 90).setAlpha(0)
                row.add(node)
                nodes.push(node)
                fresh.push(node)
            }

            relayout()

            await FX.stagger(scene, fresh, node =>
                FX.to(scene, node, { y: 0, alpha: 1 }, { duration: 320, ease: Ease.back(1.6) }),
                90)
        },

        count: () => nodes.length,

        clear: () => {
            nodes.forEach(node => node.destroy())
            nodes = []
            label.setVisible(false)
        },

        destroy: () => container.destroy(),
    }
}

/* ═════════════════════════════════════════════════════════════ toast */

export function showToast(
    scene: Phaser.Scene,
    message: string,
    tone: number,
    life = 2200,
) {
    const container = scene.add.container(W / 2, TOAST.hiddenY).setDepth(400)

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

export { W, H }
