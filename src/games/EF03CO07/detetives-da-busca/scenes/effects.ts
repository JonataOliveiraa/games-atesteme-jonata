import Phaser from 'phaser'
import { FX, Ease } from '../../../../shared/effects/FX'
import {
    C, A, FONT, SIZE, TYPE_MS, LONG_QUESTION, LONG_WORD, hex, typeLabel,
} from '../data/theme'
import {
    W, H, HUD, CASE, SEARCH, FILTERS, TRAY, LENS, OPEN, TOAST,
} from '../data/layout'
import type { FilterId, Result, ResultType, Word } from '../types'

/*
 * Duas metades, e a separação é a regra do projeto (VISUAL.md §1):
 *
 * 1. PAINTERS — recebem um Graphics e desenham. Não criam objeto, não animam,
 *    não guardam estado. Podem ser chamados de novo para repintar, e é isso que
 *    faz um cartão passar de 'na parede' para 'fora do assunto' sem recriar nada.
 * 2. CONSTRUTORES — criam um pedaço de interface e devolvem um handle com
 *    métodos e `destroy`. A cena nunca toca nos objetos internos.
 *
 * Se a GameScene precisar de um `fillRoundedRect`, falta um painter aqui.
 */

/* ═══════════════════════════════════════════════════════════ texturas */

export const TEX = {
    bg: 'bg-escritorio',
    lens: 'lupa',
    pin: 'pino',
    caso: 'selo-caso',
    empty: 'mural-vazio',
    serve: 'marca-serve',
    fora: 'marca-fora',
} as const

export const SELO: Record<ResultType, string> = {
    site: 'selo-site',
    imagem: 'selo-imagem',
    video: 'selo-video',
}

export const hasTex = (scene: Phaser.Scene, key: string) => scene.textures.exists(key)

/**
 * Encaixa a imagem numa CAIXA MÁXIMA, sem distorcer.
 *
 * Escala pela menor razão em vez de `setDisplaySize`: os PNGs são 350x350 com
 * folga transparente em volta, então forçar largura e altura esticaria o
 * desenho. A medida do layout é um teto, e a arte se acomoda dentro dele com a
 * proporção que tem.
 */
export function fitImage(image: Phaser.GameObjects.Image, maxW: number, maxH: number) {
    image.setScale(Math.min(maxW / image.width, maxH / image.height))
    return image
}

/* ═══════════════════════════════════════════════════════════ cenário */

/**
 * A cortiça, desenhada.
 *
 * O granulado é o que faz cortiça parecer cortiça, e custa um `for`. Os pontos
 * são posicionados por uma sequência determinística (não `Math.random`), senão
 * o fundo mudaria de textura a cada repintura.
 */
export function paintCorkBoard(g: Phaser.GameObjects.Graphics) {
    g.clear()

    g.fillStyle(C.cork, 1)
    g.fillRect(0, 0, W, H)

    // granulado: 520 pontinhos em posição determinística
    let seed = 20260824
    const rnd = () => {
        seed = (seed * 1664525 + 1013904223) % 4294967296
        return seed / 4294967296
    }
    for (let i = 0; i < 520; i += 1) {
        const x = rnd() * W
        const y = rnd() * H
        const r = 1.5 + rnd() * 3.5
        g.fillStyle(rnd() > 0.5 ? C.corkDark : C.wood, 0.1 + rnd() * 0.1)
        g.fillCircle(x, y, r)
    }

    // moldura de madeira
    g.fillStyle(C.wood, 1)
    g.fillRect(0, 0, W, 22)
    g.fillRect(0, H - 40, W, 40)
    g.fillRect(0, 0, 22, H)
    g.fillRect(W - 22, 0, 22, H)
    g.fillStyle(C.woodLight, 0.55)
    g.fillRect(0, 0, W, 4)
    g.fillRect(0, H - 40, W, 3)

    // vinheta: prende o olho no meio da tela
    g.fillStyle(C.ink, 0.2)
    g.fillRect(0, 22, W, 60)
    g.fillRect(0, H - 100, W, 60)
}

/**
 * O cenário, decidindo entre arte e código.
 *
 * Construtor e não painter porque o caminho da textura cria dois objetos —
 * imagem e véu — e painter, por definição, não cria nada.
 *
 * A imagem entra por COBERTURA (`Math.max`), nunca esticada: se um dia a arte
 * vier com outra proporção é melhor cortar a sobra do que deformar a parede.
 */
export function createScene(scene: Phaser.Scene): void {
    if (!hasTex(scene, TEX.bg)) {
        const g = scene.add.graphics().setDepth(-20)
        paintCorkBoard(g)
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
    g.lineStyle(3, C.search, 0.55)
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
    pill.fillStyle(C.search, 1)
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
        color: hex(C.idle), align: 'center', wordWrap: { width: HUD.hintW },
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
                    g.fillStyle(C.search, 1)
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
 * cairia fora, comendo o clique. Vale para todo botão, ficha, filtro e cartão
 * deste arquivo.
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
    g.fillStyle(C.search, 1)
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

export interface BigButton {
    container: Phaser.GameObjects.Container
    setEnabled(on: boolean): void
    /**
     * Esconde o botão E a zona de toque dele.
     *
     * `setVisible` só no container deixaria a zona viva e invisível, roubando o
     * clique de quem estivesse embaixo — no cartão aberto, é o toque de fechar
     * que sumiria num retângulo de 260x66 no meio da tela.
     */
    setVisible(on: boolean): void
    destroy(): void
}

export function createBigButton(
    scene: Phaser.Scene,
    { x, y, w, h, label, tone, depth = 60, onClick }: {
        x: number; y: number; w: number; h: number
        label: string; tone: number; depth?: number; onClick: () => void
    },
): BigButton {
    const container = scene.add.container(x, y).setDepth(depth)
    const bg = scene.add.graphics()
    const text = scene.add.text(0, -3, label, {
        fontFamily: FONT.black, fontSize: SIZE.button, color: hex(C.white),
    }).setOrigin(0.5).setResolution(2)

    let enabled = true
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

    const hit = scene.add.zone(x, y, w + 26, h + 24).setOrigin(0.5).setDepth(depth + 1)
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

    // o botão só respira quando de fato dá para tocar nele
    pulse = FX.breathe(scene, container, { grow: 1.035, duration: 1100 })

    return {
        container,
        setEnabled: on => {
            // Aplicado SEMPRE, mesmo sem mudança: basta o visual e a flag saírem
            // de sincronia uma vez para o botão ficar morto até o fim da fase.
            enabled = on
            pressed = false
            paint()
            if (hit.input) hit.input.cursor = on ? 'pointer' : 'default'
        },
        setVisible: on => {
            container.setVisible(on)
            if (on) hit.setInteractive({ useHandCursor: true })
            else hit.disableInteractive()
        },
        destroy: () => { pulse?.remove(); hit.destroy(); container.destroy() },
    }
}

/* ══════════════════════════════════════════════════ cartão do caso */

export function paintCaseCard(g: Phaser.GameObjects.Graphics) {
    const { w, h, r } = CASE
    const left = -w / 2
    const top = -h / 2

    g.clear()
    g.fillStyle(C.shadow, A.shadow)
    g.fillRoundedRect(left + 6, top + 10, w, h, r)
    g.fillStyle(C.paperEdge, 1)
    g.fillRoundedRect(left, top, w, h, r)
    g.fillStyle(C.paper, 1)
    g.fillRoundedRect(left + 4, top + 4, w - 8, h - 10, r - 4)
    // aba lateral azul: o caso pertence à busca
    g.fillStyle(C.search, 1)
    g.fillRoundedRect(left + 4, top + 4, 14, h - 10, { tl: r - 4, bl: r - 4, tr: 0, br: 0 })
    g.lineStyle(3, C.search, 0.4)
    g.strokeRoundedRect(left, top, w, h, r)
}

/** Pasta de detetive desenhada, quando a textura não está lá. */
function drawCaseMark(g: Phaser.GameObjects.Graphics, x: number, size: number) {
    const half = size / 2
    g.fillStyle(C.shadow, 0.16)
    g.fillRoundedRect(x - half + 3, -half + 6, size, size * 0.86, 8)
    g.fillStyle(C.warn, 1)
    g.fillRoundedRect(x - half, -half + 3, size, size * 0.86, 8)
    g.fillStyle(C.white, 0.9)
    g.fillRoundedRect(x - half + 7, -half + 12, size - 14, size * 0.58, 5)
    g.fillStyle(C.idle, 1)
    g.fillRoundedRect(x + half - 22, -half - 4, 8, 26, 4)
}

export interface CaseCard {
    container: Phaser.GameObjects.Container
    show(question: string, criterion?: string): Promise<void>
    skip(): void
    destroy(): void
}

export function createCaseCard(scene: Phaser.Scene): CaseCard {
    const container = scene.add.container(CASE.cx, CASE.cy).setDepth(20)

    const surface = scene.add.graphics()
    paintCaseCard(surface)

    const mark = scene.add.graphics()
    const markImage = scene.add.image(CASE.iconX, 0, '__DEFAULT').setVisible(false)

    const body = scene.add.text(CASE.textX, 0, '', {
        fontFamily: FONT.body, fontStyle: 'bold', fontSize: SIZE.question,
        color: hex(C.slate), wordWrap: { width: CASE.wrap }, lineSpacing: 6,
    }).setOrigin(0, 0.5).setResolution(2)

    const chip = scene.add.graphics().setVisible(false)
    const chipText = scene.add.text(CASE.chipX, 0, '', {
        fontFamily: FONT.black, fontSize: SIZE.criterion, color: hex(C.white),
    }).setOrigin(0.5).setResolution(2).setVisible(false)

    container.add([surface, mark, markImage, body, chip, chipText])

    if (hasTex(scene, TEX.caso)) {
        markImage.setTexture(TEX.caso).setVisible(true)
        fitImage(markImage, CASE.iconTexBox, CASE.iconTexBox)
    } else {
        drawCaseMark(mark, CASE.iconX, CASE.iconSize)
    }

    let typing: { skip: () => void } | null = null

    return {
        container,

        show: async (question, criterion) => {
            typing?.skip()

            body.setFontSize(question.length > LONG_QUESTION ? SIZE.questionLong : SIZE.question)
            // mede com o texto completo antes de escrever, senão o cartão
            // cresceria letra a letra e o texto pularia dentro dele
            body.setText(question)
            body.setText('')

            if (criterion) {
                chipText.setText(criterion)
                const cw = Math.max(CASE.chipW, chipText.width + 34)
                chip.clear()
                chip.fillStyle(C.search, 1)
                chip.fillRoundedRect(CASE.chipX - cw / 2, -CASE.chipH / 2, cw, CASE.chipH, CASE.chipR)
                chip.fillStyle(C.white, 0.24)
                chip.fillRoundedRect(CASE.chipX - cw / 2 + 10, -CASE.chipH / 2 + 6, cw - 20, 12, 6)
                chip.setVisible(true)
                chipText.setVisible(true)
                body.setWordWrapWidth(CASE.wrap - 260)
            } else {
                chip.setVisible(false)
                chipText.setVisible(false)
                body.setWordWrapWidth(CASE.wrap)
            }

            FX.kill(scene, container)
            container.setAlpha(0).setScale(0.97)
            await FX.to(scene, container, { alpha: 1, scale: 1 }, { duration: 240, ease: Ease.back(1.5) })

            const tw = FX.type(scene, body, question, { delay: TYPE_MS.question })
            typing = tw
            await tw
            typing = null
        },

        skip: () => typing?.skip(),
        destroy: () => { typing?.skip(); container.destroy() },
    }
}

/* ═════════════════════════════════════════════ barra de busca */

export function paintSearchBar(g: Phaser.GameObjects.Graphics, slots: number) {
    const { w, h, r } = SEARCH
    const left = -w / 2
    const top = -h / 2

    g.clear()
    g.fillStyle(C.shadow, 0.28)
    g.fillRoundedRect(left + 5, top + 9, w, h, r)
    g.fillStyle(C.paper, 1)
    g.fillRoundedRect(left, top, w, h, r)
    g.fillStyle(C.white, A.gloss)
    g.fillRoundedRect(left + 16, top + 8, w - 32, 14, 7)
    g.lineStyle(4, C.search, 0.85)
    g.strokeRoundedRect(left, top, w, h, r)

    // lupa pequena à esquerda, sempre desenhada: é o ícone do campo
    g.lineStyle(5, C.search, 1)
    g.strokeCircle(SEARCH.lensX, -4, 14)
    g.lineBetween(SEARCH.lensX + 10, 6, SEARCH.lensX + 20, 16)

    // slot vazio é TRACEJADO, não um retângulo cinza: buraco pede para ser
    // preenchido, caixa cinza lê como "campo desativado"
    for (let i = 0; i < slots; i += 1) {
        const x = SEARCH.slot0X + i * (SEARCH.slotW + SEARCH.slotGap)
        strokeDashedRoundedRect(
            g, x, -SEARCH.slotH / 2, SEARCH.slotW, SEARCH.slotH, SEARCH.slotR,
            3, 12, 9, C.idle,
        )
    }
}

function strokeDashedRoundedRect(
    g: Phaser.GameObjects.Graphics,
    x: number, y: number, w: number, h: number, r: number,
    thickness: number, dash: number, gap: number, color: number,
) {
    g.lineStyle(thickness, color, 0.75)
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

export interface SearchBar {
    container: Phaser.GameObjects.Container
    /** Posição absoluta do slot `i`, para a ficha voar até lá. */
    slotPos(i: number): { x: number; y: number }
    setWords(labels: string[]): void
    setCount(n: number): Promise<void>
    sweep(): Promise<void>
    destroy(): void
}

export function createSearchBar(scene: Phaser.Scene, slots: number): SearchBar {
    const container = scene.add.container(SEARCH.cx, SEARCH.cy).setDepth(22)

    const surface = scene.add.graphics()
    paintSearchBar(surface, slots)

    const filled = scene.add.graphics()
    const labels: Phaser.GameObjects.Text[] = []

    container.add([surface, filled])

    for (let i = 0; i < slots; i += 1) {
        const x = SEARCH.slot0X + i * (SEARCH.slotW + SEARCH.slotGap) + SEARCH.slotW / 2
        const t = scene.add.text(x, 0, '', {
            fontFamily: FONT.black, fontSize: SIZE.word, color: hex(C.white),
        }).setOrigin(0.5).setResolution(2)
        labels.push(t)
        container.add(t)
    }

    // ── contador, fora da barra ────────────────────────────────────────
    const countNum = scene.add.text(SEARCH.counterX, SEARCH.counterY, '0', {
        fontFamily: FONT.black, fontSize: SIZE.counter, color: hex(C.search),
    }).setOrigin(0.5).setResolution(2).setDepth(22)

    const countLabel = scene.add.text(SEARCH.counterX, SEARCH.counterLabelY, 'resultados', {
        fontFamily: FONT.body, fontStyle: 'bold', fontSize: SIZE.counterLabel,
        color: hex(C.paper),
    }).setOrigin(0.5).setResolution(2).setDepth(22)

    let shown = 0

    const setWords = (list: string[]) => {
        filled.clear()
        labels.forEach((t, i) => {
            const label = list[i]
            if (!label) { t.setText(''); return }
            const x = SEARCH.slot0X + i * (SEARCH.slotW + SEARCH.slotGap)
            filled.fillStyle(C.search, 1)
            filled.fillRoundedRect(x, -SEARCH.slotH / 2, SEARCH.slotW, SEARCH.slotH, SEARCH.slotR)
            filled.fillStyle(C.white, 0.26)
            filled.fillRoundedRect(x + 12, -SEARCH.slotH / 2 + 7, SEARCH.slotW - 24, 12, 6)
            t.setFontSize(label.length > LONG_WORD ? SIZE.wordSmall : SIZE.word)
            t.setText(label)
        })
    }

    return {
        container,

        slotPos: i => ({
            x: SEARCH.cx + SEARCH.slot0X + i * (SEARCH.slotW + SEARCH.slotGap) + SEARCH.slotW / 2,
            y: SEARCH.cy,
        }),

        setWords,

        setCount: async n => {
            const from = shown
            shown = n
            await FX.count(scene, countNum, n, { from, duration: 380 })
            countLabel.setText(n === 1 ? 'resultado' : 'resultados')
            FX.impact(scene, countNum, 0.2)
        },

        /** Varredura de luz atravessando a barra: a busca rodando. */
        sweep: () => FX.shine(scene, container, {
            w: SEARCH.w, h: SEARCH.h, duration: 460, radius: SEARCH.r,
        }),

        destroy: () => { countNum.destroy(); countLabel.destroy(); container.destroy() },
    }
}

/* ═══════════════════════════════════════════════ fichas de palavra */

/**
 * A ficha é um INTERRUPTOR, e os dois estados têm de ser lidos sem cor.
 *
 * Ligada é elevada — sombra externa, borda cheia. Desligada é rebaixada —
 * sombra interna, borda pontilhada. Elevado convida a desligar; rebaixado
 * convida a ligar. É a mesma lógica do poço do Formato Certo, invertida.
 */
export function paintWordChip(
    g: Phaser.GameObjects.Graphics,
    w: number, h: number, r: number,
    { on, hover = false }: { on: boolean; hover?: boolean },
) {
    const left = -w / 2
    const top = -h / 2

    g.clear()

    if (on) {
        g.fillStyle(C.shadow, 0.3)
        g.fillRoundedRect(left + 4, top + 8, w, h, r)
        g.fillStyle(C.searchSoft, 1)
        g.fillRoundedRect(left, top, w, h, r)
        g.fillStyle(C.white, 0.5)
        g.fillRoundedRect(left + 12, top + 7, w - 24, 12, 6)
        g.lineStyle(5, C.search, 1)
        g.strokeRoundedRect(left, top, w, h, r)
        return
    }

    // rebaixada: sombra interna no aro de cima, miolo claro
    g.fillStyle(C.shadow, 0.14)
    g.fillRoundedRect(left, top, w, h, r)
    g.fillStyle(C.paper, hover ? 0.95 : A.off + 0.3)
    g.fillRoundedRect(left + 3, top + 5, w - 6, h - 8, r - 2)
    strokeDashedRoundedRect(g, left, top, w, h, r, 3, 11, 8, hover ? C.search : C.idle)
}

export interface Tray {
    container: Phaser.GameObjects.Container
    setOn(ids: string[]): void
    setEnabled(on: boolean): void
    /** Posição absoluta da ficha, para a cópia voar até a barra. */
    posOf(id: string): { x: number; y: number } | null
    destroy(): void
}

export function paintTray(g: Phaser.GameObjects.Graphics) {
    const { cx, y, w, h, r } = TRAY
    const left = cx - w / 2
    g.clear()
    g.fillStyle(C.shadow, 0.22)
    g.fillRoundedRect(left, y, w, h, r)
    g.fillStyle(C.wood, 0.42)
    g.fillRoundedRect(left + 4, y + 4, w - 8, h - 8, r - 4)
    g.lineStyle(3, C.woodLight, 0.4)
    g.strokeRoundedRect(left, y, w, h, r)
}

export function createTray(
    scene: Phaser.Scene,
    words: Word[],
    onTap: (id: string) => void,
): Tray {
    const container = scene.add.container(0, 0).setDepth(24)

    const panel = scene.add.graphics()
    paintTray(panel)
    container.add(panel)

    const n = words.length
    const cw = Math.min(TRAY.chipW, (TRAY.w - 60 - (n - 1) * TRAY.gap) / Math.max(1, n))
    const total = n * cw + (n - 1) * TRAY.gap
    const startX = TRAY.cx - total / 2 + cw / 2
    const cy = TRAY.y + TRAY.h / 2

    const chips = new Map<string, {
        node: Phaser.GameObjects.Container
        g: Phaser.GameObjects.Graphics
        x: number
    }>()

    let enabled = true
    const on = new Set<string>()
    /*
     * As zonas de toque são objetos de CENA, não filhos do container.
     *
     * Destruir só o container as deixaria vivas e invisíveis, e a bandeja do
     * caso anterior continuaria comendo os toques da bandeja nova — um bug que
     * só aparece no segundo caso e parece "o jogo travou".
     */
    const zones: Phaser.GameObjects.Zone[] = []

    words.forEach((word, i) => {
        const x = startX + i * (cw + TRAY.gap)
        const node = scene.add.container(x, cy)
        const g = scene.add.graphics()
        paintWordChip(g, cw, TRAY.chipH, TRAY.chipR, { on: false })

        const label = scene.add.text(0, 0, word.label, {
            fontFamily: FONT.black,
            fontSize: word.label.length > LONG_WORD ? SIZE.wordSmall : SIZE.word,
            color: hex(C.slate), align: 'center', wordWrap: { width: cw - 24 },
        }).setOrigin(0.5).setResolution(2)

        node.add([g, label])
        container.add(node)

        const hit = scene.add.zone(x, cy, cw, TRAY.chipH).setOrigin(0.5).setDepth(25)
        hit.setInteractive({ useHandCursor: true })
        hit.on('pointerover', () => {
            if (!enabled || on.has(word.id)) return
            paintWordChip(g, cw, TRAY.chipH, TRAY.chipR, { on: false, hover: true })
            FX.to(scene, node, { scale: 1.06 }, { duration: 120 })
        })
        hit.on('pointerout', () => {
            if (!enabled) return
            paintWordChip(g, cw, TRAY.chipH, TRAY.chipR, { on: on.has(word.id) })
            FX.to(scene, node, { scale: 1 }, { duration: 120 })
        })
        hit.on('pointerup', () => {
            if (!enabled) return
            FX.press(scene, node)
            onTap(word.id)
        })

        zones.push(hit)
        chips.set(word.id, { node, g, x })
        FX.popIn(scene, node, { from: 0.7, delay: 120 + i * 70, duration: 320 })
    })

    return {
        container,

        setOn: ids => {
            on.clear()
            ids.forEach(id => on.add(id))
            chips.forEach((chip, id) => {
                paintWordChip(chip.g, cw, TRAY.chipH, TRAY.chipR, { on: on.has(id) })
            })
        },

        setEnabled: value => {
            enabled = value
            container.setAlpha(value ? 1 : 0.6)
        },

        posOf: id => {
            const chip = chips.get(id)
            return chip ? { x: chip.x, y: cy } : null
        },

        destroy: () => { zones.forEach(z => z.destroy()); container.destroy() },
    }
}

/* ═══════════════════════════════════════════════════════ filtros */

export function paintFilterButton(
    g: Phaser.GameObjects.Graphics,
    w: number, h: number, r: number,
    { active, hover = false }: { active: boolean; hover?: boolean },
) {
    const left = -w / 2
    const top = -h / 2
    const dy = active ? 4 : 0

    g.clear()
    g.fillStyle(C.shadow, active ? 0.14 : 0.26)
    g.fillRoundedRect(left + 3, top + (active ? 4 : 8), w, h, r)
    g.fillStyle(active ? C.search : C.paper, 1)
    g.fillRoundedRect(left, top + dy, w, h, r)
    g.fillStyle(C.white, active ? 0.26 : A.gloss)
    g.fillRoundedRect(left + 12, top + dy + 7, w - 24, 12, 6)
    g.lineStyle(active ? 5 : 3, active ? C.searchDark : hover ? C.search : C.paperEdge, 1)
    g.strokeRoundedRect(left, top + dy, w, h, r)
}

export interface FilterRow {
    container: Phaser.GameObjects.Container
    setActive(id: FilterId): void
    setEnabled(on: boolean): void
    destroy(): void
}

export function createFilterRow(
    scene: Phaser.Scene,
    filters: FilterId[],
    onTap: (id: FilterId) => void,
): FilterRow {
    const container = scene.add.container(0, 0).setDepth(24)

    const n = filters.length
    const fw = Math.min(FILTERS.w, (1160 - (n - 1) * FILTERS.gap) / Math.max(1, n))
    const total = n * fw + (n - 1) * FILTERS.gap
    const startX = 640 - total / 2 + fw / 2

    const parts = new Map<FilterId, {
        node: Phaser.GameObjects.Container
        g: Phaser.GameObjects.Graphics
        label: Phaser.GameObjects.Text
    }>()

    let active: FilterId = 'all'
    let enabled = true
    /** Mesma razão da bandeja: zona é objeto de cena e precisa morrer junto. */
    const zones: Phaser.GameObjects.Zone[] = []

    const repaint = () => {
        parts.forEach((part, id) => {
            const on = id === active
            paintFilterButton(part.g, fw, FILTERS.h, FILTERS.r, { active: on })
            part.label.setColor(hex(on ? C.white : C.muted))
            part.label.setY(on ? 4 : 0)
        })
    }

    filters.forEach((id, i) => {
        const x = startX + i * (fw + FILTERS.gap)
        const node = scene.add.container(x, FILTERS.cy)
        const g = scene.add.graphics()

        const text = id === 'all' ? 'Tudo' : typeLabel[id]
        const hasSelo = id !== 'all'
        const label = scene.add.text(hasSelo ? FILTERS.labelDX + 22 : 0, 0, text, {
            fontFamily: FONT.black, fontSize: SIZE.filter, color: hex(C.muted),
        }).setOrigin(hasSelo ? 0 : 0.5, 0.5).setResolution(2)

        node.add([g, label])

        if (hasSelo) {
            const selo = createTypeMark(scene, id, FILTERS.seloSize)
            selo.setPosition(FILTERS.seloDX, 0)
            node.add(selo)
        }

        container.add(node)

        const hit = scene.add.zone(x, FILTERS.cy, fw, FILTERS.h).setOrigin(0.5).setDepth(25)
        hit.setInteractive({ useHandCursor: true })
        hit.on('pointerover', () => {
            if (!enabled || id === active) return
            paintFilterButton(g, fw, FILTERS.h, FILTERS.r, { active: false, hover: true })
            FX.to(scene, node, { scale: 1.05 }, { duration: 120 })
        })
        hit.on('pointerout', () => {
            if (!enabled) return
            paintFilterButton(g, fw, FILTERS.h, FILTERS.r, { active: id === active })
            FX.to(scene, node, { scale: 1 }, { duration: 120 })
        })
        hit.on('pointerup', () => { if (enabled) { FX.press(scene, node); onTap(id) } })

        zones.push(hit)
        parts.set(id, { node, g, label })
        FX.popIn(scene, node, { from: 0.8, delay: 100 + i * 60, duration: 300 })
    })

    repaint()

    return {
        container,
        setActive: id => { active = id; repaint() },
        setEnabled: on => { enabled = on; container.setAlpha(on ? 1 : 0.6) },
        destroy: () => { zones.forEach(z => z.destroy()); container.destroy() },
    }
}

/* ══════════════════════════════════════════════ selo do tipo */

/**
 * O tipo do resultado se distingue pela FORMA, nunca por cor (VISUAL.md §2.2).
 * Estes três desenhos são o fallback de `selo-site`, `selo-imagem` e
 * `selo-video`.
 */
export function drawTypeMark(
    g: Phaser.GameObjects.Graphics,
    type: ResultType,
    size: number,
) {
    const half = size / 2

    if (type === 'site') {
        g.fillStyle(C.paper, 1)
        g.fillRoundedRect(-half, -half, size * 0.82, size, size * 0.12)
        g.lineStyle(3, C.slate, 0.5)
        g.strokeRoundedRect(-half, -half, size * 0.82, size, size * 0.12)
        g.fillStyle(C.idle, 0.75)
        for (let i = 0; i < 3; i += 1) {
            g.fillRoundedRect(-half + size * 0.12, -half + size * 0.2 + i * size * 0.18,
                size * 0.5, size * 0.08, size * 0.04)
        }
        g.fillStyle(C.search, 1)
        g.fillCircle(half * 0.55, half * 0.4, size * 0.26)
        g.lineStyle(2.5, C.white, 0.85)
        g.strokeCircle(half * 0.55, half * 0.4, size * 0.26)
        g.lineBetween(half * 0.55 - size * 0.26, half * 0.4, half * 0.55 + size * 0.26, half * 0.4)
        return
    }

    if (type === 'imagem') {
        g.fillStyle(C.paper, 1)
        g.fillRoundedRect(-half, -half * 0.8, size, size * 0.82, size * 0.12)
        g.lineStyle(3, C.slate, 0.5)
        g.strokeRoundedRect(-half, -half * 0.8, size, size * 0.82, size * 0.12)
        g.fillStyle(C.ok, 0.85)
        g.fillTriangle(-half * 0.7, half * 0.4, -half * 0.05, -half * 0.2, half * 0.6, half * 0.4)
        g.fillStyle(C.warn, 1)
        g.fillCircle(half * 0.45, -half * 0.35, size * 0.11)
        return
    }

    // video
    g.fillStyle(C.paper, 1)
    g.fillRoundedRect(-half, -half * 0.78, size, size * 0.78, size * 0.14)
    g.lineStyle(3, C.slate, 0.5)
    g.strokeRoundedRect(-half, -half * 0.78, size, size * 0.78, size * 0.14)
    g.fillStyle(C.slate, 0.9)
    g.fillTriangle(-size * 0.12, -size * 0.26, -size * 0.12, size * 0.14, size * 0.2, -size * 0.06)
}

/** O selo, decidindo entre arte e código. Devolve sempre um objeto posicionável. */
export function createTypeMark(
    scene: Phaser.Scene,
    type: ResultType,
    size: number,
): Phaser.GameObjects.Container {
    const node = scene.add.container(0, 0)
    const key = SELO[type]

    if (hasTex(scene, key)) {
        const img = scene.add.image(0, 0, key)
        fitImage(img, size, size)
        node.add(img)
        return node
    }

    const g = scene.add.graphics()
    drawTypeMark(g, type, size)
    node.add(g)
    return node
}

/* ══════════════════════════════════════════════ marcas de veredito */

export function drawVerdictMark(
    g: Phaser.GameObjects.Graphics,
    kind: 'serve' | 'fora',
    r: number,
) {
    const tone = kind === 'serve' ? C.ok : C.warn

    // roseta: círculo com dentes suaves
    g.fillStyle(C.shadow, 0.22)
    g.fillCircle(2, 4, r)
    g.fillStyle(tone, 1)
    const pts: Phaser.Geom.Point[] = []
    for (let i = 0; i < 24; i += 1) {
        const a = (i / 24) * Math.PI * 2
        const rad = i % 2 === 0 ? r : r * 0.88
        pts.push(new Phaser.Geom.Point(Math.cos(a) * rad, Math.sin(a) * rad))
    }
    g.fillPoints(pts, true)

    g.lineStyle(Math.max(4, r * 0.16), C.white, 1)
    if (kind === 'serve') {
        g.beginPath()
        g.moveTo(-r * 0.42, 0)
        g.lineTo(-r * 0.08, r * 0.34)
        g.lineTo(r * 0.46, -r * 0.36)
        g.strokePath()
    } else {
        g.lineBetween(0, -r * 0.44, 0, r * 0.12)
        g.fillStyle(C.white, 1)
        g.fillCircle(0, r * 0.4, Math.max(3, r * 0.11))
    }
}

export function createVerdictMark(
    scene: Phaser.Scene,
    kind: 'serve' | 'fora',
    size: number,
): Phaser.GameObjects.Container {
    const node = scene.add.container(0, 0)
    const key = kind === 'serve' ? TEX.serve : TEX.fora

    if (hasTex(scene, key)) {
        const img = scene.add.image(0, 0, key)
        fitImage(img, size, size)
        node.add(img)
        return node
    }

    const g = scene.add.graphics()
    drawVerdictMark(g, kind, size / 2)
    node.add(g)
    return node
}

/* ═══════════════════════════════════════════════ cartão de resultado */

export type CardState = 'idle' | 'hover' | 'open' | 'serve' | 'fora' | 'leaving'

const CARD_FILL: Record<CardState, number> = {
    idle: C.paper,
    hover: C.cream,
    open: C.cream,
    serve: C.okSoft,
    fora: C.warnSoft,
    leaving: C.paper,
}

const CARD_STROKE: Record<CardState, number> = {
    idle: C.paperEdge,
    hover: C.search,
    open: C.search,
    serve: C.ok,
    fora: C.warn,
    leaving: C.paperEdge,
}

/** O cartão é um papel pregado na parede: creme, sombra funda, borda fina. */
export function paintResultCard(
    g: Phaser.GameObjects.Graphics,
    w: number, h: number, r: number,
    { state }: { state: CardState },
) {
    const left = -w / 2
    const top = -h / 2
    const thick = state === 'idle' || state === 'leaving' ? 3 : state === 'hover' ? 5 : 6

    g.clear()
    g.fillStyle(C.shadow, state === 'hover' ? 0.32 : 0.24)
    g.fillRoundedRect(left + (state === 'hover' ? 7 : 5), top + (state === 'hover' ? 12 : 9), w, h, r)
    g.fillStyle(CARD_FILL[state], 1)
    g.fillRoundedRect(left, top, w, h, r)
    g.fillStyle(C.white, A.gloss)
    g.fillRoundedRect(left + 10, top + 8, w - 20, 14, 7)
    g.lineStyle(thick, CARD_STROKE[state], 1)
    g.strokeRoundedRect(left, top, w, h, r)

    if (state === 'hover') {
        g.lineStyle(2, C.search, 0.35)
        g.strokeRoundedRect(left - 6, top - 6, w + 12, h + 12, r + 5)
    }
}

/** O pino desenhado, quando a textura não está lá. */
export function drawPin(g: Phaser.GameObjects.Graphics, size: number) {
    const r = size * 0.34
    g.fillStyle(C.shadow, 0.26)
    g.fillEllipse(2, size * 0.34, r * 1.5, r * 0.5)
    g.fillStyle(C.idle, 1)
    g.fillRoundedRect(-2.5, 0, 5, size * 0.36, 2.5)
    g.fillStyle(C.pinDark, 1)
    g.fillCircle(0, 0, r)
    g.fillStyle(C.pin, 1)
    g.fillCircle(0, -1.5, r * 0.92)
    g.fillStyle(C.white, 0.45)
    g.fillEllipse(-r * 0.3, -r * 0.42, r * 0.5, r * 0.34)
}

export function createPin(scene: Phaser.Scene, size: number): Phaser.GameObjects.Container {
    const node = scene.add.container(0, 0)
    if (hasTex(scene, TEX.pin)) {
        const img = scene.add.image(0, 0, TEX.pin)
        fitImage(img, size, size)
        node.add(img)
        return node
    }
    const g = scene.add.graphics()
    drawPin(g, size)
    node.add(g)
    return node
}

/* ═════════════════════════════════════════════════════════ a lupa */

export interface Lens {
    node: Phaser.GameObjects.Container
    flyTo(x: number, y: number): Promise<void>
    rest(): Promise<void>
    destroy(): void
}

/**
 * A lupa.
 *
 * O vidro precisa ser transparente de verdade: ela pousa em cima do cartão
 * aberto e o cartão tem de continuar legível por baixo. Se a textura vier com o
 * miolo opaco, o fallback em Graphics é melhor — e é por isso que ele existe
 * mesmo quando a arte chega.
 */
export function createLens(scene: Phaser.Scene): Lens {
    const node = scene.add.container(LENS.restX, LENS.restY).setDepth(320)

    if (hasTex(scene, TEX.lens)) {
        const img = scene.add.image(0, 0, TEX.lens)
        fitImage(img, LENS.size, LENS.size)
        node.add(img)
    } else {
        const g = scene.add.graphics()
        const r = LENS.size * 0.33
        g.fillStyle(C.shadow, 0.28)
        g.fillCircle(3, 6, r + 6)
        // cabo
        g.fillStyle(C.pin, 1)
        g.fillRoundedRect(r * 0.5, r * 0.5, LENS.size * 0.42, 16, 8)
        g.fillStyle(C.warn, 1)
        g.fillRoundedRect(r * 0.5, r * 0.5, 20, 16, 8)
        // aro
        g.fillStyle(C.search, 1)
        g.fillCircle(0, 0, r + 7)
        g.fillStyle(C.searchDark, 0.5)
        g.fillCircle(0, 0, r + 7)
        g.fillStyle(C.search, 1)
        g.fillCircle(0, 0, r + 4)
        // vidro: alfa baixo de verdade
        g.fillStyle(C.white, 0.18)
        g.fillCircle(0, 0, r)
        g.fillStyle(C.white, 0.4)
        g.fillEllipse(-r * 0.32, -r * 0.34, r * 0.5, r * 0.34)
        node.add(g)
    }

    let idle: Phaser.Tweens.Tween | undefined = FX.float(scene, node, { amount: 8, duration: 2200 })

    const stopIdle = () => { idle?.remove(); idle = undefined }

    return {
        node,
        flyTo: async (x, y) => {
            stopIdle()
            FX.kill(scene, node)
            await FX.arcTo(scene, node, { x, y }, { height: 120, duration: 420 })
        },
        rest: async () => {
            stopIdle()
            FX.kill(scene, node)
            await FX.arcTo(scene, node, { x: LENS.restX, y: LENS.restY }, { height: 100, duration: 380 })
            idle = FX.float(scene, node, { amount: 8, duration: 2200 })
        },
        destroy: () => { stopIdle(); node.destroy() },
    }
}

/* ══════════════════════════════════════════════ texto com destaque */

interface Token { text: string; hi: boolean }

function tokenize(text: string): Token[] {
    const out: Token[] = []
    text.split(/(\*[^*]+\*)/).forEach(part => {
        if (!part) return
        const hi = part.startsWith('*') && part.endsWith('*') && part.length > 2
        const raw = hi ? part.slice(1, -1) : part
        raw.split(/\s+/).forEach(word => {
            if (word) out.push({ text: word, hi })
        })
    })
    return out
}

/**
 * O trecho, com as palavras da busca acesas dentro dele.
 *
 * É o único lugar do jogo que faz layout de texto na mão, e vale a pena: ver a
 * palavra que você escolheu acesa dentro da frase é a explicação inteira do
 * jogo em um segundo.
 *
 * Se um token marcado não couber numa linha sozinho, ele sai sem destaque em
 * vez de estourar a caixa. Degradar é melhor do que quebrar.
 */
export function drawRichLine(
    scene: Phaser.Scene,
    text: string,
    { wrap, size, color, accent }: {
        wrap: number; size: string; color: number; accent: number
    },
): { nodes: Phaser.GameObjects.GameObject[]; texts: Phaser.GameObjects.Text[]; height: number } {
    const tokens = tokenize(text)
    const lineH = parseInt(size, 10) * 1.5

    const style = {
        fontFamily: FONT.body, fontStyle: 'bold', fontSize: size, color: hex(color),
    }
    const styleHi = { ...style, fontFamily: FONT.black, color: hex(accent) }

    const probe = scene.add.text(0, 0, ' ', style).setResolution(2).setVisible(false)
    const spaceW = probe.width
    probe.destroy()

    const highlights = scene.add.graphics()
    const texts: Phaser.GameObjects.Text[] = []

    let x = 0
    let line = 0

    tokens.forEach(token => {
        const t = scene.add.text(0, 0, token.text, token.hi ? styleHi : style).setResolution(2)
        const tw = t.width

        if (x > 0 && x + tw > wrap) { x = 0; line += 1 }

        const y = line * lineH
        t.setPosition(x, y)
        texts.push(t)

        if (token.hi && tw <= wrap) {
            highlights.fillStyle(accent, 0.16)
            highlights.fillRoundedRect(x - 5, y - 3, tw + 10, lineH * 0.78, 7)
        }

        x += tw + spaceW
    })

    // a graphics vai ANTES dos textos na lista: fica atrás deles
    return {
        nodes: [highlights, ...texts],
        texts,
        height: (line + 1) * lineH,
    }
}

/* ═══════════════════════════════════════════════ cartão aberto */

export function paintOpenCard(g: Phaser.GameObjects.Graphics, tone: number) {
    const { w, h, r } = OPEN
    const left = -w / 2
    const top = -h / 2

    g.clear()
    g.fillStyle(C.shadow, 0.4)
    g.fillRoundedRect(left + 8, top + 14, w, h, r)
    g.fillStyle(C.paperEdge, 1)
    g.fillRoundedRect(left, top, w, h, r)
    g.fillStyle(C.cream, 1)
    g.fillRoundedRect(left + 5, top + 5, w - 10, h - 12, r - 4)
    g.fillStyle(C.white, A.gloss)
    g.fillRoundedRect(left + 18, top + 12, w - 36, 16, 8)
    g.lineStyle(6, tone, 1)
    g.strokeRoundedRect(left, top, w, h, r)
}

export interface OpenCard {
    open(result: Result): Promise<void>
    verdict(kind: 'serve' | 'fora', line: string): Promise<void>
    close(): Promise<void>
    isOpen(): boolean
    destroy(): void
}

export function createOpenCard(
    scene: Phaser.Scene,
    { onPick, onClose }: { onPick: () => void; onClose: () => void },
): OpenCard {
    const veil = scene.add.rectangle(W / 2, H / 2, W, H, C.ink, 0)
        .setDepth(300).setVisible(false)

    const container = scene.add.container(OPEN.cx, OPEN.cy).setDepth(310).setVisible(false)
    const surface = scene.add.graphics()
    container.add(surface)

    const seloHolder = scene.add.container(OPEN.seloX, -10)
    container.add(seloHolder)

    const title = scene.add.text(OPEN.textX, OPEN.titleDY, '', {
        fontFamily: FONT.black, fontSize: SIZE.openTitle, color: hex(C.slate),
        wordWrap: { width: OPEN.titleWrap },
    }).setOrigin(0, 0.5).setResolution(2)

    const source = scene.add.text(OPEN.textX, OPEN.sourceDY, '', {
        fontFamily: FONT.body, fontStyle: 'bold', fontSize: SIZE.openSource,
        color: hex(C.muted),
    }).setOrigin(0, 0.5).setResolution(2)

    const snippet = scene.add.container(OPEN.textX, OPEN.snippetDY)

    const verdictLine = scene.add.text(0, OPEN.verdictDY, '', {
        fontFamily: FONT.black, fontSize: SIZE.openVerdict, color: hex(C.slate),
        align: 'center', wordWrap: { width: OPEN.w - 120 },
    }).setOrigin(0.5).setResolution(2).setVisible(false)

    const markHolder = scene.add.container(OPEN.w / 2 - 46, -OPEN.h / 2 + 40)

    container.add([title, source, snippet, verdictLine, markHolder])

    /*
     * Bloqueador: o corpo do cartão engole o toque.
     *
     * Sem ele, tocar no meio do cartão aberto chegaria na zona de fechar (que
     * cobre a tela inteira por baixo) e o cartão fecharia sozinho no gesto mais
     * natural que existe — apontar para o que se está lendo.
     */
    const blocker = scene.add.zone(0, 0, OPEN.w, OPEN.h).setOrigin(0.5)
    blocker.setInteractive()
    container.add(blocker)

    const pick = createBigButton(scene, {
        x: OPEN.cx, y: OPEN.cy + OPEN.btnY, w: OPEN.btnW, h: OPEN.btnH,
        label: 'É ESSA!', tone: C.ok, depth: 312,
        onClick: () => onPick(),
    })
    pick.setVisible(false)

    // fechar tocando fora: a zona cobre a tela e fica ABAIXO do cartão
    const outside = scene.add.zone(W / 2, H / 2, W, H).setOrigin(0.5).setDepth(301)
    outside.on('pointerup', () => { if (open) onClose() })

    let open = false
    let typing: { skip: () => void } | null = null

    const clearBody = () => {
        typing?.skip()
        typing = null
        snippet.removeAll(true)
        seloHolder.removeAll(true)
        markHolder.removeAll(true)
        verdictLine.setVisible(false).setText('')
    }

    const showPick = (on: boolean) => {
        pick.setVisible(on)
        pick.setEnabled(on)
    }

    return {
        isOpen: () => open,

        open: async result => {
            clearBody()
            open = true

            paintOpenCard(surface, C.search)
            title.setText(result.title)
            source.setText(result.source)

            const selo = createTypeMark(scene, result.type, OPEN.seloSize)
            seloHolder.add(selo)

            veil.setVisible(true).setAlpha(0)
            outside.setInteractive()
            container.setVisible(true).setAlpha(0).setScale(0.9)

            await FX.all(
                FX.to(scene, veil, { alpha: A.dim }, { duration: 220 }),
                FX.to(scene, container, { alpha: 1, scale: 1 }, { duration: 280, ease: Ease.back(1.6) }),
            )

            // trecho com as palavras da busca acesas
            const rich = drawRichLine(scene, result.snippet, {
                wrap: OPEN.snippetWrap, size: SIZE.openSnippet,
                color: C.slate, accent: C.searchDark,
            })
            rich.nodes.forEach(n => snippet.add(n))
            snippet.setY(OPEN.snippetDY - rich.height / 2)

            /*
             * Revela palavra a palavra os Text que já estão posicionados.
             *
             * O `t.active` não é zelo: se a criança fechar o cartão no meio da
             * revelação, o `clearBody` destrói estes Text e o laço continuaria
             * chamando `setAlpha` em objeto morto. Mesma família de bug do
             * typewriter do Formato Certo.
             */
            const words = rich.texts
            words.forEach(t => t.setAlpha(0))
            for (const t of words) {
                if (!t.active) break
                t.setAlpha(1)
                await FX.wait(scene, TYPE_MS.snippet * 2.2)
            }

            showPick(true)
            FX.popIn(scene, pick.container, { from: 0.8, duration: 260 })
        },

        verdict: async (kind, line) => {
            showPick(false)
            paintOpenCard(surface, kind === 'serve' ? C.ok : C.warn)

            const mark = createVerdictMark(scene, kind, 74)
            markHolder.add(mark)
            FX.popIn(scene, mark, { from: 0.4, duration: 320 })

            verdictLine.setText(line).setVisible(true).setAlpha(0)
            await FX.to(scene, verdictLine, { alpha: 1 }, { duration: 220 })
            await FX.wait(scene, 1500)
        },

        close: async () => {
            if (!open) return
            open = false
            showPick(false)
            outside.disableInteractive()
            await FX.all(
                FX.to(scene, veil, { alpha: 0 }, { duration: 200 }),
                FX.to(scene, container, { alpha: 0, scale: 0.92 }, { duration: 220 }),
            )
            container.setVisible(false)
            veil.setVisible(false)
            clearBody()
        },

        destroy: () => {
            clearBody()
            pick.destroy()
            outside.destroy()
            veil.destroy()
            container.destroy()
        },
    }
}

/* ═════════════════════════════════════════════════════════════ toast */

export function showToast(
    scene: Phaser.Scene,
    message: string,
    tone: number,
    life = 2000,
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
