import Phaser from 'phaser'

/**
 * O tamanho de PROJETO desta tela — o cartao, os textos e a barra sao
 * desenhados nestas coordenadas.
 *
 * NAO e o tamanho do canvas. A EF01CO03 (oficina-dos-algoritmos) roda em
 * 960x540, e enquanto estes numeros eram usados como se fossem o canvas o
 * cartao nascia centrado em (640, 360) — o centro de OUTRA tela — e metade
 * dele ficava para fora. O conteudo continua sendo desenhado em 1280x720 e
 * o container inteiro e escalado para caber; assim a tela fica identica em
 * qualquer resolucao, em vez de so caber.
 */
const DESIGN_W = 1280
const DESIGN_H = 720

export type BackgroundSpec =
    | { kind: 'solid'; color?: number }
    | { kind: 'grid'; color?: number; base?: number; size?: number; width?: number; alpha?: number }
    | { kind: 'stripes'; color?: number; base?: number; size?: number; gap?: number; alpha?: number; angle?: 'horizontal' | 'vertical' | 'diagonal' }
    | { kind: 'gradient'; from?: number; to?: number; direction?: 'vertical' | 'horizontal' | 'diagonal' }
    | { kind: 'waves'; color?: number; base?: number; amplitude?: number; length?: number; rows?: number; alpha?: number }
    | { kind: 'dots'; color?: number; base?: number; size?: number; radius?: number; alpha?: number }
    | { kind: 'checker'; color?: number; base?: number; size?: number; alpha?: number }
    | { kind: 'rays'; color?: number; base?: number; count?: number; alpha?: number }

export interface LoadingScreenTheme {
    background?: number | BackgroundSpec

    card?: number
    cardShadow?: number
    cardHighlight?: number
    cardBorder?: number

    title?: number
    subtitle?: number
    description?: number
    titleStroke?: number

    progressTrack?: number
    progressBorder?: number
    progressFill?: number
    progressHighlight?: number
}

export interface LoadingScreenOptions {
    title?: string
    subtitle?: string
    description?: string
    theme?: LoadingScreenTheme
}

const DEFAULT = {
    background: { kind: 'grid' } as BackgroundSpec,

    card: 0x352f70,
    cardShadow: 0x000000,
    cardHighlight: 0xffffff,
    cardBorder: 0xffd166,

    title: 0xffffff,
    subtitle: 0xffd166,
    description: 0xf5f1d8,
    titleStroke: 0x000000,

    progressTrack: 0x000000,
    progressBorder: 0xffffff,
    progressFill: 0xffd166,
    progressHighlight: 0xffffff,
}

const BASE = 0x2b2560
const INK = 0xffffff

const color = (hex: number) => '#' + hex.toString(16).padStart(6, '0')

function paintBackground(scene: Phaser.Scene, spec: BackgroundSpec, W: number, H: number) {
    const g = scene.add.graphics()

    if (spec.kind === 'gradient') {
        const from = spec.from ?? BASE
        const to = spec.to ?? 0x120f2e
        const dir = spec.direction ?? 'vertical'

        const corners: [number, number, number, number] =
            dir === 'horizontal' ? [from, to, from, to]
                : dir === 'diagonal' ? [from, from, to, to]
                    : [from, from, to, to]

        if (dir === 'diagonal') {
            g.fillGradientStyle(from, to, to, from, 1)
        } else {
            g.fillGradientStyle(...corners, 1)
        }
        g.fillRect(0, 0, W, H)
        return g
    }

    const base = 'base' in spec ? spec.base ?? BASE : BASE
    g.fillStyle(base, 1)
    g.fillRect(0, 0, W, H)

    if (spec.kind === 'solid') {
        if (spec.color !== undefined) {
            g.fillStyle(spec.color, 1)
            g.fillRect(0, 0, W, H)
        }
        return g
    }

    const ink = spec.color ?? INK
    const alpha = spec.alpha ?? 0.12

    if (spec.kind === 'grid') {
        const size = spec.size ?? 72
        g.lineStyle(spec.width ?? 2, ink, alpha)
        for (let x = 0; x <= W; x += size) g.lineBetween(x, 0, x, H)
        for (let y = 0; y <= H; y += size) g.lineBetween(0, y, W, y)
        return g
    }

    if (spec.kind === 'stripes') {
        const size = spec.size ?? 48
        const gap = spec.gap ?? 48
        const step = size + gap
        const angle = spec.angle ?? 'diagonal'

        g.fillStyle(ink, alpha)

        if (angle === 'horizontal') {
            for (let y = -step; y < H + step; y += step) g.fillRect(0, y, W, size)
            return g
        }
        if (angle === 'vertical') {
            for (let x = -step; x < W + step; x += step) g.fillRect(x, 0, size, H)
            return g
        }
        for (let x = -H; x < W + H; x += step) {
            g.fillPoints([
                { x, y: H },
                { x: x + size, y: H },
                { x: x + size + H, y: 0 },
                { x: x + H, y: 0 },
            ], true)
        }
        return g
    }

    if (spec.kind === 'waves') {
        const amplitude = spec.amplitude ?? 26
        const length = spec.length ?? 220
        const rows = spec.rows ?? 6
        const step = H / rows

        g.lineStyle(4, ink, alpha)
        for (let r = 0; r <= rows; r++) {
            const y0 = r * step
            let prev = { x: 0, y: y0 + Math.sin(0) * amplitude }
            for (let x = 8; x <= W; x += 8) {
                const y = y0 + Math.sin((x / length) * Math.PI * 2 + r) * amplitude
                g.lineBetween(prev.x, prev.y, x, y)
                prev = { x, y }
            }
        }
        return g
    }

    if (spec.kind === 'dots') {
        const size = spec.size ?? 60
        const radius = spec.radius ?? 5
        g.fillStyle(ink, alpha)
        for (let y = size / 2; y < H; y += size) {
            const offset = ((y / size) | 0) % 2 ? size / 2 : 0
            for (let x = size / 2 + offset; x < W; x += size) g.fillCircle(x, y, radius)
        }
        return g
    }

    if (spec.kind === 'checker') {
        const size = spec.size ?? 80
        g.fillStyle(ink, alpha)
        for (let r = 0; r * size < H; r++) {
            for (let c = 0; c * size < W; c++) {
                if ((r + c) % 2) continue
                g.fillRect(c * size, r * size, size, size)
            }
        }
        return g
    }

    const count = spec.count ?? 16
    g.fillStyle(ink, alpha)
    for (let i = 0; i < count; i++) {
        const a = (Math.PI * 2 * i) / count
        const b = a + Math.PI / count
        const far = W + H
        g.fillPoints([
            { x: W / 2, y: H / 2 },
            { x: W / 2 + Math.cos(a) * far, y: H / 2 + Math.sin(a) * far },
            { x: W / 2 + Math.cos(b) * far, y: H / 2 + Math.sin(b) * far },
        ], true)
    }
    return g
}

export function createLoadingScreen(
    scene: Phaser.Scene,
    options: LoadingScreenOptions = {},
) {
    const theme = { ...DEFAULT, ...options.theme }
    const layer = scene.add.container(0, 0).setDepth(10000)

    // A CAIXA DE PROJETO — onde o cartao e desenhado.
    const W = DESIGN_W
    const H = DESIGN_H

    // O CANVAS DESTE JOGO, que nao e necessariamente a caixa de projeto.
    const telaW = scene.scale.width || DESIGN_W
    const telaH = scene.scale.height || DESIGN_H

    const spec: BackgroundSpec = typeof theme.background === 'number'
        ? { kind: 'solid', color: theme.background }
        : theme.background

    // O fundo cobre o canvas INTEIRO (nao entra no container escalado, senao
    // sobraria borda nao pintada quando as proporcoes nao baterem).
    layer.add(paintBackground(scene, spec, telaW, telaH))

    // O cartao vive em coordenadas de projeto; o container inteiro encolhe.
    const k = Math.min(telaW / W, telaH / H)
    const conteudo = scene.add.container((telaW - W * k) / 2, (telaH - H * k) / 2)
        .setScale(k)
    layer.add(conteudo)

    const midY = H / 2
    const card = scene.add.graphics()

    card.fillStyle(theme.cardShadow, 0.45)
    card.fillRoundedRect(W / 2 - 340, midY - 130, 680, 280, 30)
    card.fillStyle(theme.card, 1)
    card.fillRoundedRect(W / 2 - 340, midY - 142, 680, 280, 30)
    card.fillStyle(theme.cardHighlight, 0.06)
    card.fillRoundedRect(W / 2 - 328, midY - 132, 656, 86, 22)
    card.lineStyle(5, theme.cardBorder, 1)
    card.strokeRoundedRect(W / 2 - 340, midY - 142, 680, 280, 30)

    conteudo.add(card)

    const stroke = color(theme.titleStroke)

    const title = scene.add.text(W / 2, midY - 86, options.title ?? 'Carregando', {
        fontFamily: '"DynaPuff Black", "Arial Black", sans-serif',
        fontSize: '34px',
        color: color(theme.title),
        stroke,
        strokeThickness: 8,
    }).setOrigin(0.5).setResolution(2)

    const subtitle = scene.add.text(W / 2, midY - 30, options.subtitle ?? '', {
        fontFamily: '"DynaPuff Black", "Arial Black", sans-serif',
        fontSize: '48px',
        color: color(theme.subtitle),
        stroke,
        strokeThickness: 9,
    }).setOrigin(0.5).setResolution(2)

    const description = scene.add.text(W / 2, midY + 28, options.description ?? 'Preparando...', {
        fontFamily: 'DynaPuff, Arial, sans-serif',
        fontStyle: 'bold',
        fontSize: '20px',
        color: color(theme.description),
    }).setOrigin(0.5).setResolution(2)

    conteudo.add([title, subtitle, description])

    const BAR_W = 540
    const BAR_H = 32
    const barX = W / 2 - BAR_W / 2
    const barY = midY + 68

    const track = scene.add.graphics()
    track.fillStyle(theme.progressTrack, 1)
    track.fillRoundedRect(barX, barY, BAR_W, BAR_H, 16)
    track.lineStyle(4, theme.progressBorder, 1)
    track.strokeRoundedRect(barX, barY, BAR_W, BAR_H, 16)

    const fill = scene.add.graphics()
    conteudo.add([track, fill])

    const draw = (progress: number) => {
        const w = Math.max(14, (BAR_W - 10) * progress)
        fill.clear()
        fill.fillStyle(theme.progressFill, 1)
        fill.fillRoundedRect(barX + 5, barY + 5, w, 22, 11)
        fill.fillStyle(theme.progressHighlight, 0.35)
        fill.fillRoundedRect(barX + 9, barY + 8, Math.max(6, w - 8), 7, 4)
    }

    draw(0)

    scene.load.on('progress', draw)
    scene.load.once('complete', () => scene.load.off('progress', draw))

    return layer
}