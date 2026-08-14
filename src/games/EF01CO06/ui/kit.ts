import Phaser from 'phaser'

export const W = 1280
export const H = 720

/** Paleta quente, alto contraste. Texto escuro sobre claro — nunca o contrário. */
export const C = {
    deskTop: 0x2b4d63,
    deskDeep: 0x1a3547,

    paper: 0xfffdf7,
    paperEdge: 0xf2e3c9,
    paperShade: 0xe8d9bd,

    ink: 0x17313f,
    inkSoft: 0x5b7c8d,

    sky: 0x4aa8e0, skyDeep: 0x1d6fa5,
    mint: 0x52c98a, mintDeep: 0x2f9b63,
    sun: 0xffc94d, sunDeep: 0xd99a1e,
    coral: 0xff7a6b, coralDeep: 0xd9503f,
    lilac: 0xa78bfa, lilacDeep: 0x7c5bd6,
    slate: 0x5b7c8d, slateDeep: 0x3a5666,

    white: 0xffffff,
    shadow: 0x0b2330,
}

export const hex = (n: number) => '#' + n.toString(16).padStart(6, '0')

export type AppId = 'relogio' | 'calculadora' | 'pasta' | 'gravador' | 'desenho' | 'player' | 'power'

export interface AppSkin {
    label: string
    /** Como o app se apresenta na tarefa quando o jogo dá a dica. */
    verb: string
    tint: number
    deep: number
    texture: string
}

export const SKIN: Record<AppId, AppSkin> = {
    relogio: { label: 'Relógio', verb: 'ver e acertar as horas', tint: C.sky, deep: C.skyDeep, texture: 'icon-relogio' },
    calculadora: { label: 'Calculadora', verb: 'fazer contas', tint: C.mint, deep: C.mintDeep, texture: 'icon-calculadora' },
    pasta: { label: 'Pasta', verb: 'guardar arquivos', tint: C.sun, deep: C.sunDeep, texture: 'icon-pasta' },
    gravador: { label: 'Gravador', verb: 'gravar a voz', tint: C.coral, deep: C.coralDeep, texture: 'icon-gravador' },
    desenho: { label: 'Desenho', verb: 'desenhar e pintar', tint: C.lilac, deep: C.lilacDeep, texture: 'icon-desenho' },
    player: { label: 'Músicas', verb: 'ouvir música', tint: C.slate, deep: C.slateDeep, texture: 'icon-player' },
    power: { label: 'Desligar', verb: 'desligar o computador', tint: C.coralDeep, deep: 0x8f3226, texture: 'icon-power' },
}

// ─────────────────────────────────────────────────────────── tipografia

type Weight = 'black' | 'bold'

export function label(
    scene: Phaser.Scene, x: number, y: number, text: string,
    { size = 20, color = C.ink, weight = 'black' as Weight, wrap = 0, align = 'center' as const } = {},
) {
    const t = scene.add.text(x, y, text, {
        fontFamily: weight === 'black' ? 'Arial Black, Arial' : 'Arial',
        fontStyle: weight === 'bold' ? 'bold' : undefined,
        fontSize: `${size}px`,
        color: hex(color),
        align,
        wordWrap: wrap ? { width: wrap, useAdvancedWrap: true } : undefined,
        lineSpacing: 4,
    }).setOrigin(0.5).setResolution(2)
    return t
}

// ─────────────────────────────────────────────────────────── formas

/** Cartão de papel: sombra difusa + corpo claro + borda quente. Base de tudo. */
export function paperCard(
    scene: Phaser.Scene, w: number, h: number,
    { radius = 26, fill = C.paper, edge = C.paperEdge, lift = 10 } = {},
) {
    const g = scene.add.graphics()
    g.fillStyle(C.shadow, 0.10); g.fillRoundedRect(-w / 2 - 3, -h / 2 + lift - 3, w + 6, h + 6, radius + 3)
    g.fillStyle(C.shadow, 0.16); g.fillRoundedRect(-w / 2, -h / 2 + lift, w, h, radius)
    g.fillStyle(edge, 1); g.fillRoundedRect(-w / 2, -h / 2, w, h, radius)
    g.fillStyle(fill, 1); g.fillRoundedRect(-w / 2 + 5, -h / 2 + 5, w - 10, h - 12, radius - 4)
    return g
}

/** Faixa de cabeçalho colorida com brilho superior. */
export function headerBand(
    scene: Phaser.Scene, w: number, h: number, y: number, tint: number, deep: number, radius = 26,
) {
    const g = scene.add.graphics()
    g.fillStyle(deep, 1)
    g.fillRoundedRect(-w / 2, y, w, h, { tl: radius, tr: radius, bl: 0, br: 0 })
    g.fillStyle(tint, 1)
    g.fillRoundedRect(-w / 2 + 4, y + 4, w - 8, h - 4, { tl: radius - 3, tr: radius - 3, bl: 0, br: 0 })
    g.fillStyle(C.white, 0.22)
    g.fillRoundedRect(-w / 2 + 16, y + 9, w - 32, h * 0.32, 12)
    return g
}

// ─────────────────────────────────────────────────────────── botões

export interface ButtonOpts {
    w?: number
    h?: number
    tone?: number
    deep?: number
    size?: number
    textColor?: number
    enabled?: boolean
}

export interface Btn {
    root: Phaser.GameObjects.Container
    setEnabled: (on: boolean) => void
    setLabel: (s: string) => void
}

/** Botão gordo com profundidade real: o corpo afunda sobre a base escura. */
export function chunkyButton(
    scene: Phaser.Scene, x: number, y: number, text: string,
    onTap: () => void, o: ButtonOpts = {},
): Btn {
    const w = o.w ?? 200, h = o.h ?? 64
    const tone = o.tone ?? C.sky, deep = o.deep ?? C.skyDeep
    const drop = 7, r = Math.min(20, h / 2)

    const root = scene.add.container(x, y)
    const g = scene.add.graphics()
    const txt = label(scene, 0, -drop / 2, text, { size: o.size ?? 21, color: o.textColor ?? C.white })

    let enabled = o.enabled ?? true
    let pressed = false

    const paint = () => {
        g.clear()
        const a = enabled ? 1 : 0.4
        g.fillStyle(deep, a)
        g.fillRoundedRect(-w / 2, -h / 2, w, h + drop, r)
        g.fillStyle(tone, a)
        g.fillRoundedRect(-w / 2, -h / 2 + (pressed ? drop : 0), w, h, r)
        g.fillStyle(C.white, 0.26 * a)
        g.fillRoundedRect(-w / 2 + 10, -h / 2 + (pressed ? drop : 0) + 7, w - 20, h * 0.3, r - 6)
        txt.setY(-drop / 2 + (pressed ? drop : 0))
    }
    paint()

    const hit = scene.add.zone(0, drop / 2, w, h + drop).setInteractive({ useHandCursor: true })
    hit.on('pointerdown', () => { if (!enabled) return; pressed = true; paint() })
    hit.on('pointerout', () => { if (!pressed) return; pressed = false; paint() })
    hit.on('pointerup', () => {
        if (!enabled || !pressed) return
        pressed = false; paint(); onTap()
    })

    root.add([g, txt, hit])
    return {
        root,
        setEnabled: (on) => { enabled = on; paint() },
        setLabel: (s) => txt.setText(s),
    }
}

/** Botão redondo de ícone desenhado (fechar, ajuda, som). */
export function circleButton(
    scene: Phaser.Scene, x: number, y: number, r: number, tone: number, deep: number,
    draw: (g: Phaser.GameObjects.Graphics) => void, onTap: () => void,
) {
    const root = scene.add.container(x, y)
    const g = scene.add.graphics()
    g.fillStyle(deep, 1); g.fillCircle(0, 5, r)
    g.fillStyle(tone, 1); g.fillCircle(0, 0, r)
    g.fillStyle(C.white, 0.28); g.fillEllipse(0, -r * 0.35, r * 1.2, r * 0.5)
    draw(g)

    const hit = scene.add.zone(0, 0, r * 2 + 14, r * 2 + 14).setInteractive({ useHandCursor: true })
    hit.on('pointerover', () => scene.tweens.add({ targets: root, scale: 1.1, duration: 120 }))
    hit.on('pointerout', () => scene.tweens.add({ targets: root, scale: 1, duration: 120 }))
    hit.on('pointerdown', () => {
        scene.tweens.add({ targets: root, scale: 0.9, duration: 70, yoyo: true })
        onTap()
    })

    root.add([g, hit])
    return root
}

// ─────────────────────────────────────────────────────────── feedback

/** Balão que sobe do ponto da ação e some. Substitui os modais de "passo concluído". */
export function floatingNote(
    scene: Phaser.Scene, x: number, y: number, text: string,
    { tone = C.mint, deep = C.mintDeep, depth = 900 } = {},
) {
    const root = scene.add.container(x, y).setDepth(depth)
    const t = label(scene, 0, 0, text, { size: 20, color: C.white })
    const w = t.width + 46, h = t.height + 24

    const g = scene.add.graphics()
    g.fillStyle(deep, 1); g.fillRoundedRect(-w / 2, -h / 2 + 4, w, h, h / 2)
    g.fillStyle(tone, 1); g.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
    g.fillStyle(C.white, 0.25); g.fillRoundedRect(-w / 2 + 10, -h / 2 + 5, w - 20, h * 0.32, h / 4)

    root.add([g, t])
    root.setScale(0.6).setAlpha(0)

    scene.tweens.add({ targets: root, scale: 1, alpha: 1, duration: 220, ease: 'Back.easeOut' })
    scene.tweens.add({
        targets: root, y: y - 64, alpha: 0, delay: 700, duration: 520, ease: 'Sine.easeIn',
        onComplete: () => root.destroy(),
    })
    return root
}

/** Estrelas subindo — celebração calma, sem tomar a tela. */
export function starBurst(scene: Phaser.Scene, x: number, y: number, count = 9, tone = C.sun) {
    for (let i = 0; i < count; i++) {
        const g = scene.add.graphics({ x, y }).setDepth(880)
        g.fillStyle(tone, 1)
        const pts: Phaser.Geom.Point[] = []
        for (let k = 0; k < 10; k++) {
            const a = -Math.PI / 2 + (k * Math.PI) / 5
            const r = k % 2 === 0 ? 11 : 5
            pts.push(new Phaser.Geom.Point(Math.cos(a) * r, Math.sin(a) * r))
        }
        g.fillPoints(pts, true)
        g.setScale(0)

        scene.tweens.add({
            targets: g, scale: Phaser.Math.FloatBetween(0.7, 1.2),
            duration: 180, delay: i * 45, ease: 'Back.easeOut',
        })
        scene.tweens.add({
            targets: g,
            x: x + Phaser.Math.Between(-110, 110),
            y: y - Phaser.Math.Between(60, 170),
            alpha: 0, angle: Phaser.Math.Between(-140, 140),
            duration: 900, delay: i * 45, ease: 'Sine.easeOut',
            onComplete: () => g.destroy(),
        })
    }
}

/** Barra de vidro fosco. Recorta a faixa do wallpaper, desfoca e escurece por cima.
 *  Só funciona com fundo estático — se o wallpaper animar, o recorte congela. */
export function glassBar(
    scene: Phaser.Scene,
    x: number, y: number, w: number, h: number,
    source: Phaser.GameObjects.Image,
    { tint = C.deskDeep, alpha = 0.46, edge = 'bottom' as 'bottom' | 'top', accent = C.sky } = {},
) {
    const layer = scene.add.container(0, 0)

    // 9 amostras deslocadas somando alpha 1 = box blur barato e independente de versão
    const rt = scene.add.renderTexture(x, y, w, h).setOrigin(0)
    const O = 7
    const kernel: Array<[number, number]> = [
        [0, 0], [-O, 0], [O, 0], [0, -O], [0, O],
        [-O, -O], [O, O], [-O, O], [O, -O],
    ]
    kernel.forEach(([ox, oy]) =>
        rt.draw(source, source.x - x + ox, source.y - y + oy, 1 / kernel.length))

    // Se o projeto estiver em Phaser >= 3.60, refina com o blur real
    const fx = (rt as unknown as { postFX?: { addBlur: (q: number, sx: number, sy: number, s: number) => void } }).postFX
    fx?.addBlur?.(1, 2, 2, 1.1)

    // Véu escuro: é ele que garante contraste do texto claro
    const veil = scene.add.graphics()
    veil.fillStyle(tint, alpha)
    veil.fillRect(x, y, w, h)
    // captação de luz no topo do vidro
    veil.fillStyle(C.white, 0.07)
    veil.fillRect(x, y, w, Math.min(28, h * 0.35))

    // Fio de luz na borda interna + fio de cor na separação
    const lines = scene.add.graphics()
    const lineY = edge === 'bottom' ? y + h : y
    lines.fillStyle(C.white, 0.16)
    lines.fillRect(x, edge === 'bottom' ? y : y + h - 2, w, 2)
    lines.fillStyle(accent, 0.85)
    lines.fillRect(x, edge === 'bottom' ? lineY - 3 : lineY, w, 3)

    layer.add([rt, veil, lines])
    return layer
}