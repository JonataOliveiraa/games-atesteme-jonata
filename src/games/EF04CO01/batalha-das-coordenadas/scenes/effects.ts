import Phaser from 'phaser'
import { FX, Ease } from '../../../../shared/effects/FX'
import { C, A, FONT, SIZE, hex, colName, rowName } from '../data/theme'
import { W, H, HUD, GRID, PANEL, TOAST } from '../data/layout'
import type { CellState, Mood } from '../types'

/*
 * Painters puros e construtores. A GameScene não desenha nada: se ela precisar
 * de um `fillRoundedRect`, falta um painter aqui.
 */

/* ═══════════════════════════════════════════════════════════ texturas */

export const TEX = {
    bg: 'bg-praia',
    bau: 'icone-bau',
    anel: 'icone-anel',
    mapa: 'icone-mapa',
    sorridente: 'icone-pirata-sorridente',
    duvida: 'icone-pirata-duvida',
    feliz: 'icone-pirata-feliz',
} as const

export type IconKind = 'bau' | 'anel' | 'mapa' | Mood

const ICON_KEY: Record<IconKind, string> = {
    bau: TEX.bau,
    anel: TEX.anel,
    mapa: TEX.mapa,
    sorridente: TEX.sorridente,
    duvida: TEX.duvida,
    feliz: TEX.feliz,
}

export const hasTex = (scene: Phaser.Scene, key: string) => scene.textures.exists(key)

/**
 * Encaixa a imagem numa CAIXA MÁXIMA, sem distorcer.
 *
 * Os ícones são 200x200 com folga transparente, então a medida do layout é um
 * teto e o desenho se acomoda dentro dele com a proporção que tem. Forçar
 * largura e altura esticaria a arte.
 */
export function fitImage(image: Phaser.GameObjects.Image, maxW: number, maxH: number) {
    image.setScale(Math.min(maxW / image.width, maxH / image.height))
    return image
}

/** Desenho de cada ícone, para quando a textura não estiver na pasta. */
export function drawIcon(g: Phaser.GameObjects.Graphics, kind: IconKind, size: number) {
    const r = size / 2

    if (kind === 'bau') {
        g.fillStyle(C.shadow, 0.22)
        g.fillEllipse(2, r * 0.82, r * 1.7, r * 0.3)
        g.fillStyle(C.wood, 1)
        g.fillRoundedRect(-r * 0.8, -r * 0.2, r * 1.6, r * 0.9, r * 0.14)
        g.fillStyle(C.woodLight, 1)
        g.fillRoundedRect(-r * 0.8, -r * 0.62, r * 1.6, r * 0.5, r * 0.22)
        g.fillStyle(C.gold, 1)
        g.fillRoundedRect(-r * 0.16, -r * 0.34, r * 0.32, r * 0.5, r * 0.1)
        g.fillStyle(C.goldDark, 1)
        g.fillRect(-r * 0.8, -r * 0.22, r * 1.6, r * 0.1)
        return
    }

    if (kind === 'anel') {
        g.fillStyle(C.shadow, 0.2)
        g.fillEllipse(2, r * 0.7, r * 1.1, r * 0.24)
        g.lineStyle(Math.max(6, r * 0.26), C.gold, 1)
        g.strokeCircle(0, r * 0.22, r * 0.52)
        g.fillStyle(C.water, 1)
        g.fillTriangle(-r * 0.3, -r * 0.34, r * 0.3, -r * 0.34, 0, -r * 0.84)
        g.fillTriangle(-r * 0.3, -r * 0.34, r * 0.3, -r * 0.34, 0, r * 0.02)
        g.fillStyle(C.white, 0.5)
        g.fillTriangle(-r * 0.3, -r * 0.34, 0, -r * 0.34, 0, -r * 0.84)
        return
    }

    if (kind === 'mapa') {
        g.fillStyle(C.shadow, 0.2)
        g.fillRoundedRect(-r * 0.78, -r * 0.58, r * 1.6, r * 1.2, r * 0.12)
        g.fillStyle(C.paper, 1)
        g.fillRoundedRect(-r * 0.82, -r * 0.64, r * 1.6, r * 1.2, r * 0.12)
        g.lineStyle(3, C.sandDeep, 0.7)
        g.strokeRoundedRect(-r * 0.82, -r * 0.64, r * 1.6, r * 1.2, r * 0.12)
        g.lineStyle(4, C.wood, 0.6)
        g.lineBetween(-r * 0.5, r * 0.34, -r * 0.1, -r * 0.1)
        g.lineBetween(-r * 0.1, -r * 0.1, r * 0.36, r * 0.14)
        g.lineStyle(6, C.gold, 1)
        g.lineBetween(r * 0.16, -r * 0.06, r * 0.56, r * 0.34)
        g.lineBetween(r * 0.56, -r * 0.06, r * 0.16, r * 0.34)
        return
    }

    // piratas: um bonequinho simples, e a boca muda com o humor
    const tone = kind === 'feliz' ? C.gold : kind === 'duvida' ? C.off : C.water
    g.fillStyle(C.shadow, 0.2)
    g.fillEllipse(2, r * 0.88, r * 1.3, r * 0.26)
    g.fillStyle(tone, 1)
    g.fillRoundedRect(-r * 0.58, r * 0.1, r * 1.16, r * 0.78, r * 0.3)
    g.fillStyle(C.sand, 1)
    g.fillCircle(0, -r * 0.28, r * 0.46)
    g.fillStyle(C.slate, 1)
    g.fillRoundedRect(-r * 0.56, -r * 0.62, r * 1.12, r * 0.24, r * 0.1)
    g.fillCircle(-r * 0.18, -r * 0.3, r * 0.06)
    if (kind === 'duvida') {
        g.fillRoundedRect(r * 0.02, -r * 0.36, r * 0.26, r * 0.12, r * 0.05)
        g.fillRoundedRect(-r * 0.12, -r * 0.06, r * 0.24, r * 0.06, r * 0.03)
    } else {
        g.fillCircle(r * 0.18, -r * 0.3, r * 0.06)
        g.fillRoundedRect(-r * 0.16, -r * 0.08, r * 0.32, r * 0.09, r * 0.045)
    }
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

/** Mar em cima, areia embaixo. Fallback do cenário. */
export function paintBeach(g: Phaser.GameObjects.Graphics) {
    const shore = 250
    g.clear()

    for (let i = 0; i < 12; i += 1) {
        const t = i / 11
        const color = Phaser.Display.Color.Interpolate.ColorWithColor(
            Phaser.Display.Color.ValueToColor(C.waterDark),
            Phaser.Display.Color.ValueToColor(C.water),
            11, i,
        )
        g.fillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b), 1)
        g.fillRect(0, Math.floor(t * shore), W, Math.ceil(shore / 12) + 1)
    }
    g.fillStyle(C.white, 0.16)
    for (let i = 0; i < 5; i += 1) g.fillRoundedRect(0, 40 + i * 42, W, 5, 3)

    g.fillStyle(C.sand, 1)
    g.fillRect(0, shore, W, H - shore)
    g.fillStyle(C.white, 0.4)
    g.fillRoundedRect(0, shore - 6, W, 14, 7)
    g.fillStyle(C.sandDark, 0.35)
    for (let i = 0; i < 9; i += 1) {
        g.fillRoundedRect(0, shore + 40 + i * 52, W, 5, 3)
    }
    g.fillStyle(C.ink, 0.18)
    g.fillRect(0, 0, W, 70)
    g.fillRect(0, H - 60, W, 60)
}

export function createScene(scene: Phaser.Scene): void {
    if (!hasTex(scene, TEX.bg)) {
        const g = scene.add.graphics().setDepth(-20)
        paintBeach(g)
        return
    }

    const bg = scene.add.image(W / 2, H / 2, TEX.bg).setDepth(-20)
    bg.setScale(Math.max(W / bg.width, H / bg.height))

    const veil = scene.add.graphics().setDepth(-19)
    veil.fillStyle(C.ink, A.veil)
    veil.fillRect(0, 0, W, H)
    veil.fillStyle(C.ink, 0.2)
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
    g.lineStyle(3, C.gold, 0.6)
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
    pill.fillStyle(C.gold, 1)
    pill.fillRoundedRect(HUD.pillX, HUD.pillY, HUD.pillW, HUD.pillH, HUD.pillH / 2)
    pill.fillStyle(C.white, 0.28)
    pill.fillRoundedRect(HUD.pillX + 10, HUD.pillY + 6, HUD.pillW - 20, 12, 6)
    container.add(pill)

    const levelLabel = scene.add.text(HUD.pillX + HUD.pillW / 2, HUD.cy, 'NÍVEL 1', {
        fontFamily: FONT.black, fontSize: SIZE.hudLevel, color: hex(C.ink),
    }).setOrigin(0.5).setResolution(2)
    container.add(levelLabel)

    const title = scene.add.text(HUD.titleX, HUD.titleY, '', {
        fontFamily: FONT.black, fontSize: SIZE.hudTitle, color: hex(C.paper),
        align: 'center', wordWrap: { width: HUD.titleW },
    }).setOrigin(0.5).setResolution(2)
    container.add(title)

    const hint = scene.add.text(HUD.titleX, HUD.hintY, '', {
        fontFamily: FONT.body, fontStyle: 'bold', fontSize: SIZE.hudHint,
        color: hex(C.sandDark), align: 'center', wordWrap: { width: HUD.hintW },
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
                    g.fillStyle(C.ok, 1)
                    g.fillCircle(x, HUD.cy, HUD.dotR)
                    g.lineStyle(2, C.okSoft, 1)
                    g.strokeCircle(x, HUD.cy, HUD.dotR)
                } else if (i === done) {
                    g.fillStyle(C.gold, 1)
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

/* ══════════════════════════════════════════════════════════ botão */

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
    g.fillStyle(C.gold, 1)
    g.fillCircle(0, 0, r)
    g.fillStyle(C.white, 0.22)
    g.fillCircle(0, -r * 0.32, r * 0.62)
    g.lineStyle(3, C.white, 0.9)
    g.strokeCircle(0, 0, r)

    const text = scene.add.text(0, -1, label, {
        fontFamily: FONT.black, fontSize: SIZE.help, color: hex(C.ink),
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
            container.setAlpha(on ? 1 : A.dim)
            if (hit.input) hit.input.cursor = on ? 'pointer' : 'default'
        },
        destroy: () => { hit.destroy(); container.destroy() },
    }
}

/* ═══════════════════════════════════════════════════════════ a grade */

/**
 * A célula da matriz.
 *
 * `idle` é areia levemente ELEVADA e `dug` é um buraco REBAIXADO — a diferença
 * entre "ainda dá para cavar aqui" e "aqui já foi" tem de ser lida de relance,
 * sem depender de cor.
 */
export function paintCell(
    g: Phaser.GameObjects.Graphics,
    size: number,
    { state }: { state: CellState },
) {
    const half = size / 2
    const r = GRID.r

    g.clear()

    if (state === 'dug') {
        g.fillStyle(C.sandDeep, 1)
        g.fillRoundedRect(-half, -half, size, size, r)
        g.fillStyle(C.shadow, 0.28)
        g.fillRoundedRect(-half + 6, -half + 6, size - 12, size - 14, r - 4)
        g.lineStyle(3, C.sandDark, 0.9)
        g.strokeRoundedRect(-half, -half, size, size, r)
        return
    }

    if (state === 'discarded') {
        g.fillStyle(C.off, 0.85)
        g.fillRoundedRect(-half, -half, size, size, r)
        g.lineStyle(4, C.offSoft, 1)
        g.strokeRoundedRect(-half, -half, size, size, r)
        return
    }

    if (state === 'treasure') {
        g.fillStyle(C.shadow, 0.22)
        g.fillRoundedRect(-half + 4, -half + 7, size, size, r)
        g.fillStyle(C.goldSoft, 1)
        g.fillRoundedRect(-half, -half, size, size, r)
        g.lineStyle(7, C.gold, 1)
        g.strokeRoundedRect(-half, -half, size, size, r)
        return
    }

    // areia: idle, hover e chest
    g.fillStyle(C.shadow, 0.2)
    g.fillRoundedRect(-half + 3, -half + 6, size, size, r)
    g.fillStyle(state === 'hover' ? C.sand : C.sandDark, 1)
    g.fillRoundedRect(-half, -half, size, size, r)
    g.fillStyle(C.white, state === 'hover' ? 0.34 : 0.18)
    g.fillRoundedRect(-half + 8, -half + 7, size - 16, size * 0.22, r - 6)

    // grãos: dá textura de areia sem custo e sem PNG
    g.fillStyle(C.sandDeep, 0.18)
    for (let i = 0; i < 9; i += 1) {
        const a = (i * 2.399) % (Math.PI * 2)
        const d = (i / 9) * half * 0.7
        g.fillCircle(Math.cos(a) * d, Math.sin(a) * d, 2.5)
    }

    const stroke = state === 'hover' ? C.gold : state === 'chest' ? C.goldDark : C.sandDeep
    g.lineStyle(state === 'idle' ? 3 : 6, stroke, state === 'idle' ? 0.6 : 1)
    g.strokeRoundedRect(-half, -half, size, size, r)
}

interface CellView {
    col: number
    row: number
    x: number
    y: number
    node: Phaser.GameObjects.Container
    g: Phaser.GameObjects.Graphics
    holder: Phaser.GameObjects.Container
    cross: Phaser.GameObjects.Graphics
    state: CellState
}

export interface GridView {
    container: Phaser.GameObjects.Container
    /** Centro absoluto da célula, para faíscas e textos flutuantes. */
    posOf(col: number, row: number): { x: number; y: number }
    putChest(col: number, row: number): void
    /** Cavou e não tinha nada. */
    dig(col: number, row: number): Promise<void>
    /** Achou: o baú abre e o anel salta. */
    reveal(col: number, row: number): Promise<void>
    /** Registro de descarte: o X cinza. */
    discard(col: number, row: number): Promise<void>
    /** Recusa suave: treme e volta. */
    nudge(col: number, row: number): Promise<void>
    stateOf(col: number, row: number): CellState
    setEnabled(on: boolean): void
    destroy(): void
}

export function createGrid(
    scene: Phaser.Scene,
    { cols, rows, onTap }: {
        cols: number; rows: number
        onTap: (col: number, row: number) => void
    },
): GridView {
    const container = scene.add.container(0, 0).setDepth(30)
    const step = GRID.cell + GRID.gap
    const totalW = cols * GRID.cell + (cols - 1) * GRID.gap
    const originX = GRID.cx - totalW / 2 + GRID.cell / 2
    const originY = GRID.top + GRID.labelGap + GRID.cell / 2

    const at = (col: number, row: number) => ({
        x: originX + col * step,
        y: originY + row * step,
    })

    // ── rótulos: a letra é a coluna, o número é a linha ────────────────
    for (let col = 0; col < cols; col += 1) {
        const t = scene.add.text(at(col, 0).x, GRID.top + 2, colName(col), {
            fontFamily: FONT.black, fontSize: SIZE.label, color: hex(C.paper),
        }).setOrigin(0.5, 0).setResolution(2)
        container.add(t)
    }
    for (let row = 0; row < rows; row += 1) {
        const t = scene.add.text(
            originX - GRID.cell / 2 - GRID.labelGap / 2 - 6, at(0, row).y, rowName(row), {
            fontFamily: FONT.black, fontSize: SIZE.label, color: hex(C.paper),
        }).setOrigin(0.5).setResolution(2)
        container.add(t)
    }

    const cells = new Map<string, CellView>()
    const zones: Phaser.GameObjects.Zone[] = []
    let enabled = true

    const key = (col: number, row: number) => `${col}:${row}`

    for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
            const p = at(col, row)
            const node = scene.add.container(p.x, p.y)
            const g = scene.add.graphics()
            paintCell(g, GRID.cell, { state: 'idle' })

            const holder = scene.add.container(0, 0)
            const cross = scene.add.graphics().setVisible(false)

            node.add([g, holder, cross])
            container.add(node)

            const view: CellView = {
                col, row, x: p.x, y: p.y, node, g, holder, cross, state: 'idle',
            }
            cells.set(key(col, row), view)

            const zone = scene.add.zone(p.x, p.y, GRID.cell, GRID.cell)
                .setOrigin(0.5).setDepth(31)
            zone.setInteractive({ useHandCursor: true })

            const tappable = () =>
                enabled && (view.state === 'idle' || view.state === 'chest' || view.state === 'hover')

            zone.on('pointerover', () => {
                if (!tappable()) return
                const back: CellState = view.state === 'chest' ? 'chest' : 'hover'
                paintCell(g, GRID.cell, { state: back === 'chest' ? 'chest' : 'hover' })
                FX.to(scene, node, { scale: 1.05 }, { duration: 120 })
            })
            zone.on('pointerout', () => {
                if (!tappable()) return
                paintCell(g, GRID.cell, { state: view.state === 'chest' ? 'chest' : 'idle' })
                FX.to(scene, node, { scale: 1 }, { duration: 120 })
            })
            zone.on('pointerup', () => {
                if (!tappable()) return
                FX.press(scene, node)
                onTap(col, row)
            })

            zones.push(zone)
        }
    }

    const get = (col: number, row: number) => cells.get(key(col, row))

    return {
        container,

        posOf: (col, row) => at(col, row),

        putChest: (col, row) => {
            const view = get(col, row)
            if (!view) return
            view.state = 'chest'
            paintCell(view.g, GRID.cell, { state: 'chest' })
            const chest = createIcon(scene, 'bau', GRID.chestSize)
            view.holder.add(chest)
            FX.popIn(scene, chest, { from: 0.5, duration: 340 })
        },

        dig: async (col, row) => {
            const view = get(col, row)
            if (!view) return
            view.state = 'dug'
            paintCell(view.g, GRID.cell, { state: 'dug' })
            void FX.sparks(scene, view.x, view.y, {
                color: C.sandDeep, count: 10, spread: 90, size: 9, duration: 460,
            })
            await FX.to(scene, view.node, { scale: 0.94 },
                { duration: 130, yoyo: true, ease: Ease.smooth })
        },

        reveal: async (col, row) => {
            const view = get(col, row)
            if (!view) return
            view.state = 'treasure'
            paintCell(view.g, GRID.cell, { state: 'treasure' })

            // o baú abre e o anel salta: a recompensa é um objeto, não um texto
            view.holder.removeAll(true)
            const chest = createIcon(scene, 'bau', GRID.chestSize)
            view.holder.add(chest)
            await FX.popIn(scene, chest, { from: 0.6, duration: 260 })

            const ring = createIcon(scene, 'anel', GRID.ringSize)
            ring.setPosition(0, -6)
            view.holder.add(ring)
            void FX.sparks(scene, view.x, view.y - 20, {
                color: C.gold, count: 20, spread: 150,
            })
            await FX.all(
                FX.popIn(scene, ring, { from: 0.2, duration: 380 }),
                FX.to(scene, ring, { y: -58 }, { duration: 420, ease: Ease.back(1.6) }),
                FX.to(scene, view.node, { scale: 1.12 },
                    { duration: 200, yoyo: true, ease: Ease.back(2) }),
            )
        },

        discard: async (col, row) => {
            const view = get(col, row)
            if (!view) return
            view.state = 'discarded'
            paintCell(view.g, GRID.cell, { state: 'discarded' })
            view.holder.setAlpha(0.45)

            const m = GRID.markSize / 2
            view.cross.clear()
            view.cross.lineStyle(11, C.offSoft, 1)
            view.cross.lineBetween(-m, -m, m, m)
            view.cross.lineBetween(m, -m, -m, m)
            view.cross.setVisible(true).setScale(0.3).setAlpha(0)

            await FX.all(
                FX.to(scene, view.cross, { scale: 1, alpha: 1 },
                    { duration: 280, ease: Ease.back(2.2) }),
                FX.to(scene, view.node, { scale: 0.95 },
                    { duration: 140, yoyo: true, ease: Ease.smooth }),
            )
        },

        nudge: async (col, row) => {
            const view = get(col, row)
            if (!view) return
            paintCell(view.g, GRID.cell, { state: 'hover' })
            await FX.shake(scene, view.node, { amount: 9, times: 3 })
            paintCell(view.g, GRID.cell, {
                state: view.state === 'chest' ? 'chest' : view.state,
            })
        },

        stateOf: (col, row) => get(col, row)?.state ?? 'idle',

        setEnabled: on => { enabled = on },

        destroy: () => { zones.forEach(z => z.destroy()); container.destroy() },
    }
}

/* ═══════════════════════════════════════════════ painel do pirata */

export interface Panel {
    setMood(mood: Mood): void
    /** Nível 1: a coordenada, enorme. */
    showBig(text: string): Promise<void>
    /** Níveis 2 e 3: as pistas escritas. */
    showClues(lines: string[]): Promise<void>
    setCount(done: number, total: number): void
    destroy(): void
}

export function createPanel(scene: Phaser.Scene): Panel {
    const container = scene.add.container(0, 0).setDepth(40)

    const pirate = scene.add.container(PANEL.cx, PANEL.piradaY)
    container.add(pirate)
    let mood: Mood = 'sorridente'
    const drawPirate = () => {
        pirate.removeAll(true)
        pirate.add(createIcon(scene, mood, PANEL.pirataSize))
    }
    drawPirate()

    // ── cartão das pistas ──────────────────────────────────────────────
    const clueCard = scene.add.container(PANEL.cx, PANEL.cardY).setVisible(false)
    const clueBg = scene.add.graphics()
    const clueText = scene.add.text(PANEL.clueX, 0, '', {
        fontFamily: FONT.black, fontSize: SIZE.clue, color: hex(C.slate),
        wordWrap: { width: PANEL.clueWrap }, lineSpacing: 12,
    }).setOrigin(0, 0.5).setResolution(2)
    clueCard.add([clueBg, clueText])
    container.add(clueCard)

    const mapIcon = createIcon(scene, 'mapa', PANEL.mapSize)
    mapIcon.setPosition(PANEL.mapX, 0)
    clueCard.add(mapIcon)

    // ── cartão da coordenada ───────────────────────────────────────────
    const bigCard = scene.add.container(PANEL.cx, PANEL.bigY).setVisible(false)
    const bigBg = scene.add.graphics()
    bigBg.fillStyle(C.shadow, 0.3)
    bigBg.fillRoundedRect(-PANEL.bigW / 2 + 5, -PANEL.bigH / 2 + 9, PANEL.bigW, PANEL.bigH, PANEL.bigR)
    bigBg.fillStyle(C.paper, 1)
    bigBg.fillRoundedRect(-PANEL.bigW / 2, -PANEL.bigH / 2, PANEL.bigW, PANEL.bigH, PANEL.bigR)
    bigBg.fillStyle(C.white, A.gloss)
    bigBg.fillRoundedRect(-PANEL.bigW / 2 + 14, -PANEL.bigH / 2 + 10, PANEL.bigW - 28, 16, 8)
    bigBg.lineStyle(6, C.gold, 1)
    bigBg.strokeRoundedRect(-PANEL.bigW / 2, -PANEL.bigH / 2, PANEL.bigW, PANEL.bigH, PANEL.bigR)
    const bigText = scene.add.text(0, 2, '', {
        fontFamily: FONT.black, fontSize: SIZE.big, color: hex(C.goldDark),
    }).setOrigin(0.5).setResolution(2)
    bigCard.add([bigBg, bigText])
    container.add(bigCard)

    const counter = scene.add.text(PANEL.cx, PANEL.countY, '', {
        fontFamily: FONT.black, fontSize: SIZE.counter, color: hex(C.paper),
    }).setOrigin(0.5).setResolution(2)
    container.add(counter)

    const paintClueCard = () => {
        const h = Math.max(PANEL.cardH, clueText.height + 56)
        clueBg.clear()
        clueBg.fillStyle(C.shadow, 0.3)
        clueBg.fillRoundedRect(-PANEL.cardW / 2 + 5, -h / 2 + 9, PANEL.cardW, h, PANEL.cardR)
        clueBg.fillStyle(C.paper, 1)
        clueBg.fillRoundedRect(-PANEL.cardW / 2, -h / 2, PANEL.cardW, h, PANEL.cardR)
        clueBg.fillStyle(C.white, A.gloss)
        clueBg.fillRoundedRect(-PANEL.cardW / 2 + 14, -h / 2 + 10, PANEL.cardW - 28, 16, 8)
        clueBg.lineStyle(5, C.gold, 1)
        clueBg.strokeRoundedRect(-PANEL.cardW / 2, -h / 2, PANEL.cardW, h, PANEL.cardR)
    }

    return {
        setMood: next => {
            if (next === mood) return
            mood = next
            drawPirate()
            FX.impact(scene, pirate, 0.12)
        },

        showBig: async text => {
            clueCard.setVisible(false)
            bigText.setText(text)
            bigCard.setVisible(true)
            FX.kill(scene, bigCard)
            bigCard.setAlpha(0).setScale(0.8)
            await FX.to(scene, bigCard, { alpha: 1, scale: 1 },
                { duration: 320, ease: Ease.back(2) })
        },

        showClues: async lines => {
            bigCard.setVisible(false)
            // mede com o texto completo antes de pintar: o cartão cresce com o
            // número de pistas, e pintar antes deixaria a moldura curta
            clueText.setText(lines.map(l => `•  ${l}`).join('\n'))
            paintClueCard()
            clueCard.setVisible(true)
            FX.kill(scene, clueCard)
            clueCard.setAlpha(0).setScale(0.94)
            await FX.to(scene, clueCard, { alpha: 1, scale: 1 },
                { duration: 300, ease: Ease.back(1.6) })
        },

        setCount: (done, total) => counter.setText(`${done} de ${total}`),

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
    const container = scene.add.container(GRID.cx, TOAST.hiddenY).setDepth(400)

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
