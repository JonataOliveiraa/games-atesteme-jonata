import Phaser from 'phaser'
import { FX, Ease } from '../../../../shared/effects/FX'
import { C, A, FONT, SIZE, TYPE_MS, LONG_QUESTION, hex } from '../data/theme'
import { W, H, HUD, QUESTION, SITE, CLEANER, EDITOR, TOAST } from '../data/layout'
import { TOP, type WindowState } from '../types'

/*
 * Painters puros e construtores. A GameScene não desenha nada: se ela precisar
 * de um `fillRoundedRect`, falta um painter aqui.
 *
 * Neste jogo SÓ o céu é textura. Prédio, janelas, limpador, blocos, botões e
 * relatório saem todos de `Graphics` — é o que permite a janela ter três
 * estados e o bloco pulsar na cor do laço sem virar dezenas de PNGs.
 */

/* ═══════════════════════════════════════════════════════════ cenário */

export const SKY: Record<'day' | 'sunset' | 'night', string> = {
    day: 'bg-building-day',
    sunset: 'bg-building-sunset',
    night: 'bg-building-night',
}

/**
 * O limpador em duas poses.
 *
 * São as ÚNICAS texturas de personagem do jogo, e existem porque um boneco
 * chibi desenhado à mão vale mais que qualquer `Graphics`. Todo o resto —
 * janela, bloco, botão — continua em `Graphics`, porque muda de estado.
 */
export const TEX = {
    parado: 'personagem-parado',
    limpando: 'personagem-limpando',
} as const

export const hasTex = (scene: Phaser.Scene, key: string) => scene.textures.exists(key)

/**
 * Encaixa a imagem numa CAIXA, pela menor razão.
 *
 * `setDisplaySize` esticaria o boneco para preencher a caixa; aqui ele só
 * encolhe até caber, e a proporção do desenho fica intacta.
 */
export function fitImage(img: Phaser.GameObjects.Image, maxW: number, maxH: number) {
    // medido na TEXTURA, não em `img.width`: os tipos do Phaser deste projeto
    // não expõem `width` em `Image`, e o `tsc` do build reprova
    const src = img.texture.getSourceImage() as { width: number; height: number }
    img.setScale(Math.min(maxW / src.width, maxH / src.height))
}

/** Céu em degradê, quando a textura não estiver na pasta. */
export function paintSky(g: Phaser.GameObjects.Graphics, sky: 'day' | 'sunset' | 'night') {
    const pair = sky === 'day' ? [0x8fd0f5, 0xd8eefb]
        : sky === 'sunset' ? [0x3d4a80, 0xf2a05a]
            : [0x0d1430, 0x2b3a6b]

    g.clear()
    for (let i = 0; i < 18; i += 1) {
        const t = i / 17
        const color = Phaser.Display.Color.Interpolate.ColorWithColor(
            Phaser.Display.Color.ValueToColor(pair[0]),
            Phaser.Display.Color.ValueToColor(pair[1]),
            17, i,
        )
        g.fillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b), 1)
        g.fillRect(0, Math.floor(t * H), W, Math.ceil(H / 18) + 1)
    }
    if (sky === 'night') {
        g.fillStyle(C.white, 0.7)
        for (let i = 0; i < 60; i += 1) {
            const x = (i * 137) % W
            const y = (i * 71) % 360
            g.fillCircle(x, y, 1.5)
        }
    }
    g.fillStyle(C.base, 1)
    g.fillRect(0, SITE.bottom, W, H - SITE.bottom)
}

export function createScene(scene: Phaser.Scene, sky: 'day' | 'sunset' | 'night'): void {
    const key = SKY[sky]

    if (!hasTex(scene, key)) {
        const g = scene.add.graphics().setDepth(-20)
        paintSky(g, sky)
        return
    }

    const bg = scene.add.image(W / 2, H / 2, key).setDepth(-20)
    const src = bg.texture.getSourceImage() as { width: number; height: number }
    bg.setScale(Math.max(W / src.width, H / src.height))

    const veil = scene.add.graphics().setDepth(-19)
    veil.fillStyle(C.ink, A.veil)
    veil.fillRect(0, 0, W, H)
    veil.fillStyle(C.ink, 0.2)
    veil.fillRect(0, 0, W, 70)
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
    g.lineStyle(3, C.outer, 0.6)
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
    pill.fillStyle(C.outer, 1)
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

    const help = createRoundButton(scene, HUD.helpX, HUD.cy, HUD.helpR, '?', onHelp, C.outer)
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
                    g.fillStyle(C.outer, 1)
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
 * cairia fora, comendo o clique. Vale para todo botão e passo daqui.
 */
export function createRoundButton(
    scene: Phaser.Scene,
    x: number, y: number, r: number,
    label: string,
    onClick: () => void,
    tone = C.outer,
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
    const hit = scene.add.zone(x, y, r * 2 + 18, r * 2 + 18).setOrigin(0.5).setDepth(60)
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

export interface BigButton {
    container: Phaser.GameObjects.Container
    setEnabled(on: boolean): void
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
    const container = scene.add.container(x, y).setDepth(50)
    const bg = scene.add.graphics()
    const text = scene.add.text(0, -3, label, {
        fontFamily: FONT.black, fontSize: SIZE.button, color: hex(C.white),
    }).setOrigin(0.5).setResolution(2)

    let enabled = true
    let pressed = false
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

    const hit = scene.add.zone(x, y, w + 26, h + 24).setOrigin(0.5).setDepth(51)
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

    const pulse = FX.breathe(scene, container, { grow: 1.03, duration: 1200 })

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
        setLabel: t => text.setText(t),
        destroy: () => { pulse?.remove(); hit.destroy(); container.destroy() },
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
        stroke: hex(C.ink), strokeThickness: 4,
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

/* ═══════════════════════════════════════════════════════════ prédio */

/**
 * A janela nos três estados.
 *
 * `dirty` tem manchas e vidro fosco; `clean` é vidro azul com um brilho
 * diagonal. A diferença precisa ser óbvia a 30px de lado, que é o tamanho da
 * janela num prédio de dez andares.
 */
export function paintWindow(
    g: Phaser.GameObjects.Graphics,
    size: number,
    { state }: { state: WindowState },
) {
    const half = size / 2
    const r = Math.max(4, size * 0.14)

    g.clear()

    if (state === 'clean') {
        g.fillStyle(C.clean, 1)
        g.fillRoundedRect(-half, -half, size, size, r)
        g.fillStyle(C.white, 0.55)
        g.fillTriangle(-half, half, -half, -half * 0.1, half * 0.1, -half)
        g.fillStyle(C.white, 0.3)
        g.fillTriangle(half * 0.35, -half, half, -half, half, -half * 0.35)
        g.lineStyle(3, C.cleanEdge, 1)
        g.strokeRoundedRect(-half, -half, size, size, r)
        return
    }

    if (state === 'washing') {
        g.fillStyle(C.innerSoft, 1)
        g.fillRoundedRect(-half, -half, size, size, r)
        g.fillStyle(C.white, 0.6)
        for (let i = 0; i < 3; i += 1) {
            g.fillRoundedRect(-half + 4, -half + 6 + i * (size / 3.4), size - 8, size * 0.1, size * 0.05)
        }
        g.lineStyle(4, C.inner, 1)
        g.strokeRoundedRect(-half, -half, size, size, r)
        return
    }

    g.fillStyle(C.dirty, 1)
    g.fillRoundedRect(-half, -half, size, size, r)
    // manchas: posição determinística, senão o prédio muda de cara a cada
    // repintura e a criança acha que alguma coisa aconteceu
    g.fillStyle(C.dirtyEdge, 0.55)
    g.fillCircle(-half * 0.35, -half * 0.3, size * 0.16)
    g.fillCircle(half * 0.28, half * 0.12, size * 0.2)
    g.fillCircle(half * 0.05, -half * 0.55, size * 0.1)
    g.lineStyle(3, C.dirtyEdge, 1)
    g.strokeRoundedRect(-half, -half, size, size, r)
}

export function paintBuildingShell(
    g: Phaser.GameObjects.Graphics,
    w: number, h: number,
) {
    const left = -w / 2

    g.clear()
    g.fillStyle(C.shadow, 0.3)
    g.fillRoundedRect(left + 8, -h + 12, w, h, 14)

    g.fillStyle(C.wall, 1)
    g.fillRoundedRect(left, -h, w, h, 14)
    g.fillStyle(C.wallLight, 0.5)
    g.fillRoundedRect(left + 6, -h + 6, w * 0.3, h - 12, 10)
    g.fillStyle(C.wallDark, 0.4)
    g.fillRoundedRect(left + w * 0.72, -h + 6, w * 0.24, h - 12, 10)

    // telhado e base: é o que faz a caixa virar prédio
    g.fillStyle(C.roof, 1)
    g.fillRoundedRect(left - 12, -h - 18, w + 24, 26, 8)
    g.fillStyle(C.base, 1)
    g.fillRoundedRect(left - 8, -18, w + 16, 22, 6)
    g.lineStyle(3, C.roof, 0.9)
    g.strokeRoundedRect(left, -h, w, h, 14)
}

/** O limpador desenhado à mão, quando as PNGs não estiverem na pasta. */
export function paintCleanerBody(g: Phaser.GameObjects.Graphics) {
    const cw = CLEANER.w
    const ch = CLEANER.h

    g.clear()
    // gôndola
    g.fillStyle(C.shadow, 0.24)
    g.fillRoundedRect(-cw / 2 + 3, ch / 2 - 12, cw, 16, 6)
    g.fillStyle(C.roof, 1)
    g.fillRoundedRect(-cw / 2, ch / 2 - 16, cw, 16, 6)
    g.fillStyle(C.inner, 1)
    g.fillRoundedRect(-cw / 2, ch / 2 - 20, cw, 7, 3)
    // pessoa
    g.fillStyle(C.paper, 1)
    g.fillRoundedRect(-16, -6, 32, 30, 12)
    g.fillStyle(C.outer, 1)
    g.fillRoundedRect(-16, -6, 32, 14, 7)
    g.fillStyle(C.cream, 1)
    g.fillCircle(0, -18, 14)
    g.fillStyle(C.inner, 1)
    g.fillRoundedRect(-15, -30, 30, 9, 4)
    // braço com rodo, apontando para a direita
    g.fillStyle(C.cream, 1)
    g.fillRoundedRect(12, -6, 26, 8, 4)
    g.fillStyle(C.slate, 1)
    g.fillRoundedRect(34, -16, 6, 26, 3)
}

export interface BuildingView {
    container: Phaser.GameObjects.Container
    posOf(floor: number, win: number): { x: number; y: number }
    setWindow(floor: number, win: number, state: WindowState): void
    resetWindows(): void
    /** Acende a faixa do andar na cor do laço de FORA. */
    highlightFloor(floor: number, on: boolean): void
    moveCleaner(floor: number, win: number, duration: number): Promise<void>
    /** Troca a pose: esfregando o rodo ou parado de rodo na mão. */
    setWashing(on: boolean): void
    parkCleaner(): void
    /** Mandou subir além do último andar. */
    bumpTop(): Promise<void>
    /** Mandou lavar além da última janela do andar. */
    bumpSide(floor: number): Promise<void>
    destroy(): void
}

export function createBuilding(
    scene: Phaser.Scene,
    { floors, windows }: { floors: number; windows: number },
): BuildingView {
    const container = scene.add.container(0, 0).setDepth(20)

    /*
     * A janela encolhe conforme o prédio cresce, e não o contrário: um prédio
     * de dez andares que não coubesse na tela obrigaria a rolar, e rolagem num
     * jogo de observar cobertura é o fim da observação.
     */
    const usableW = SITE.w - SITE.pad * 2 - (windows - 1) * SITE.gap
    const usableH = (SITE.bottom - SITE.top) - SITE.pad * 2 - SITE.roof - (floors - 1) * SITE.gap
    const cell = Phaser.Math.Clamp(
        Math.floor(Math.min(usableW / windows, usableH / floors)),
        SITE.minCell, SITE.maxCell,
    )

    const gridW = windows * cell + (windows - 1) * SITE.gap
    const gridH = floors * cell + (floors - 1) * SITE.gap
    const shellW = gridW + SITE.pad * 2
    const shellH = gridH + SITE.pad * 2 + SITE.roof

    const ground = SITE.bottom
    const shell = scene.add.graphics().setPosition(SITE.cx, ground)
    paintBuildingShell(shell, shellW, shellH)
    container.add(shell)

    const originX = SITE.cx - gridW / 2 + cell / 2
    const originY = ground - SITE.pad - cell / 2

    const at = (floor: number, win: number) => ({
        x: originX + win * (cell + SITE.gap),
        y: originY - floor * (cell + SITE.gap),
    })

    // ── faixas de andar: acendem na cor do laço de fora ────────────────
    const bands: Phaser.GameObjects.Graphics[] = []
    for (let f = 0; f < floors; f += 1) {
        const y = at(f, 0).y
        const band = scene.add.graphics()
        band.fillStyle(C.outer, 0.3)
        band.fillRoundedRect(
            SITE.cx - shellW / 2 + 6, y - cell / 2 - 5,
            shellW - 12, cell + 10, 10,
        )
        band.setVisible(false)
        container.add(band)
        bands.push(band)
    }

    // ── janelas ────────────────────────────────────────────────────────
    const wins = new Map<string, Phaser.GameObjects.Graphics>()
    const key = (f: number, w: number) => `${f}:${w}`

    for (let f = 0; f < floors; f += 1) {
        for (let w = 0; w < windows; w += 1) {
            const p = at(f, w)
            const g = scene.add.graphics().setPosition(p.x, p.y)
            paintWindow(g, cell, { state: 'dirty' })
            container.add(g)
            wins.set(key(f, w), g)
        }
    }

    /*
     * ── O LIMPADOR ─────────────────────────────────────────────────────
     *
     * A corda entra ANTES do boneco no container: assim ela passa por trás
     * dele, e o rapaz aparece pendurado em vez de amarrado por cima.
     */
    const rope = scene.add.graphics()
    container.add(rope)

    const cleaner = scene.add.container(SITE.cx, SITE.top + 60)
    container.add(cleaner)

    const useArt = hasTex(scene, TEX.parado) && hasTex(scene, TEX.limpando)
    let art: Phaser.GameObjects.Image | undefined

    /** Onde a lâmina do rodo cai, em relação ao centro do boneco. */
    let bladeDX: number
    let bladeDY: number
    /** Onde a corda encosta no boneco. */
    let ropeDY: number

    if (useArt) {
        // O boneco encolhe junto com a janela: num prédio de dez andares ele
        // taparia meio prédio se ficasse do tamanho do de um andar só.
        const artH = Phaser.Math.Clamp(Math.round(cell * 1.5), CLEANER.minH, CLEANER.maxH)
        art = scene.add.image(0, 0, TEX.parado)
        fitImage(art, artH * CLEANER.ratio, artH)
        cleaner.add(art)

        bladeDX = CLEANER.bladeX * art.displayWidth
        bladeDY = CLEANER.bladeY * art.displayHeight
        ropeDY = CLEANER.ropeY * art.displayHeight
    } else {
        const body = scene.add.graphics()
        paintCleanerBody(body)
        cleaner.add(body)

        bladeDX = CLEANER.fallbackBladeX
        bladeDY = CLEANER.fallbackBladeY
        ropeDY = -CLEANER.h / 2 + 6
    }

    /*
     * De que lado da janela ele para.
     *
     * O rodo da arte aponta para a ESQUERDA e o do boneco desenhado para a
     * DIREITA; o sinal de `bladeDX` decide sozinho, e o corpo nunca cobre o
     * vidro que a criança precisa ver mudar.
     */
    const side = bladeDX < 0 ? 1 : -1

    const stopAt = (p: { x: number; y: number }) => ({
        x: p.x + side * (cell / 2 + CLEANER.reach) - bladeDX,
        y: p.y - bladeDY,
    })

    const parkSpot = () => ({
        x: SITE.cx,
        y: Math.max(SITE.top + 46, ground - shellH - 44),
    })

    const drawRope = () => {
        rope.clear()
        const foot = cleaner.y + ropeDY
        rope.lineStyle(5, C.shadow, 0.16)
        rope.lineBetween(cleaner.x + 2, CLEANER.ropeTop, cleaner.x + 2, foot)
        rope.lineStyle(4, C.slate, 0.9)
        rope.lineBetween(cleaner.x, CLEANER.ropeTop, cleaner.x, foot)
        // roldana: dá um ponto de partida à corda, senão ela sai do nada
        rope.fillStyle(C.roof, 1)
        rope.fillCircle(cleaner.x, CLEANER.ropeTop, 8)
        rope.fillStyle(C.inner, 1)
        rope.fillCircle(cleaner.x, CLEANER.ropeTop, 4)
    }

    const setPose = (washing: boolean) => {
        if (!art) return
        const key = washing ? TEX.limpando : TEX.parado
        if (art.texture.key !== key) art.setTexture(key)
    }

    const start = parkSpot()
    cleaner.setPosition(start.x, start.y)
    drawRope()

    const moveTo = (x: number, y: number, duration: number) =>
        new Promise<void>(resolve => {
            const s = { x: cleaner.x, y: cleaner.y }
            scene.tweens.add({
                targets: s, x, y, duration, ease: 'Sine.easeInOut',
                onUpdate: () => {
                    if (!cleaner.active) return
                    cleaner.setPosition(s.x, s.y)
                    drawRope()
                },
                onComplete: () => resolve(),
            })
        })

    return {
        container,

        posOf: (floor, win) => at(floor, win),

        setWindow: (floor, win, state) => {
            const g = wins.get(key(floor, win))
            if (!g) return
            paintWindow(g, cell, { state })
            if (state === 'clean') {
                FX.to(scene, g, { scale: 1.16 },
                    { duration: 140, yoyo: true, ease: Ease.back(2) })
            }
        },

        resetWindows: () => {
            wins.forEach(g => paintWindow(g, cell, { state: 'dirty' }))
        },

        highlightFloor: (floor, on) => {
            bands.forEach((b, i) => b.setVisible(on && i === floor))
            if (!on) return
            const band = bands[floor]
            if (!band) return
            FX.kill(scene, band)
            band.setAlpha(0.2)
            FX.to(scene, band, { alpha: 1 }, { duration: 200, ease: Ease.smooth })
        },

        moveCleaner: (floor, win, duration) => {
            const spot = stopAt(at(floor, win))
            return moveTo(spot.x, spot.y, duration)
        },

        setWashing: on => setPose(on),

        parkCleaner: () => {
            setPose(false)
            const spot = parkSpot()
            cleaner.setPosition(spot.x, spot.y)
            drawRope()
        },

        bumpTop: async () => {
            setPose(false)
            const x = SITE.cx
            const y = ground - shellH + 20
            await moveTo(x, y, 220)
            void FX.sparks(scene, x + bladeDX, y + bladeDY,
                { color: C.bump, count: 14, spread: 120 })
            await FX.shake(scene, cleaner, { amount: 10, times: 3 })
        },

        bumpSide: async floor => {
            setPose(false)
            const last = at(Math.min(floor, floors - 1), windows - 1)
            // a janela que NÃO existe, logo depois da última do andar
            const spot = stopAt({ x: last.x + cell + SITE.gap, y: last.y })
            await moveTo(spot.x, spot.y, 200)
            void FX.sparks(scene, spot.x + bladeDX, spot.y + bladeDY,
                { color: C.bump, count: 12, spread: 110 })
            await FX.shake(scene, cleaner, { amount: 10, times: 3 })
        },

        destroy: () => container.destroy(),
    }
}

/* ═══════════════════════════════════════════════════════════ editor */

export interface Hole { x: number; y: number; w: number; h: number; r: number }

/**
 * O corpo do bloco de laço.
 *
 * O buraco é passado por fora, em coordenadas reais, e não calculado por
 * frações da altura: era assim antes e o recorte escuro sobrava 36px à
 * esquerda do bloco de dentro e 2px à direita — parecia torto porque estava.
 */
export function paintLoopBlock(
    g: Phaser.GameObjects.Graphics,
    w: number, h: number, r: number,
    { tone, hole }: { tone: number; hole?: Hole },
) {
    const left = -w / 2
    const top = -h / 2

    g.clear()
    g.fillStyle(C.shadow, 0.32)
    g.fillRoundedRect(left + 6, top + 10, w, h, r)
    g.fillStyle(tone, 1)
    g.fillRoundedRect(left, top, w, h, r)
    g.fillStyle(C.white, A.gloss)
    g.fillRoundedRect(left + 14, top + 10, w - 28, 16, 8)

    if (hole) {
        const hx = hole.x - hole.w / 2
        const hy = hole.y - hole.h / 2
        // o braço do laço: a barra que desce pela esquerda e abraça o de dentro
        g.fillStyle(C.white, 0.16)
        g.fillRoundedRect(hx - 22, hy, 14, hole.h, 7)
        g.fillStyle(C.ink, 0.16)
        g.fillRoundedRect(hx, hy, hole.w, hole.h, hole.r)
    }

    g.lineStyle(4, C.white, 0.5)
    g.strokeRoundedRect(left, top, w, h, r)
}

/* ─────────────────────────────────────────── ícones das duas ordens */

/** Seta subindo de um degrau: o laço de fora. */
export function paintFloorIcon(g: Phaser.GameObjects.Graphics, r: number) {
    g.clear()
    g.fillStyle(C.white, 0.95)
    g.fillTriangle(0, -r, -r * 0.95, r * 0.05, r * 0.95, r * 0.05)
    g.fillRoundedRect(-r * 0.4, r * 0.02, r * 0.8, r * 0.78, 3)
    g.fillStyle(C.white, 0.55)
    g.fillRoundedRect(-r, r * 0.86, r * 2, r * 0.34, 3)
}

/** Janela com o brilho na diagonal: o laço de dentro. */
export function paintWindowIcon(g: Phaser.GameObjects.Graphics, r: number, tone: number) {
    g.clear()
    g.fillStyle(C.white, 0.95)
    g.fillRoundedRect(-r, -r, r * 2, r * 2, 4)
    g.fillStyle(tone, 0.85)
    g.fillTriangle(-r, r, -r, -r * 0.15, r * 0.15, -r)
}

/* ════════════════════════════════════════ bolinhas de repetição */

/**
 * Uma bolinha por volta do laço.
 *
 * Ela faz DOIS trabalhos e por isso vale o espaço que ocupa: parada, mostra o
 * número escolhido em quantidade, para quem ainda conta melhor do que lê; e
 * rodando, acende uma a uma, que é a resposta ao "cadê o efeito a cada ordem".
 *
 * No laço indefinido do Nível 3 não há quantidade para mostrar, e a fileira
 * vira texto: "quantas vezes precisar", depois "andar 1", "andar 2"...
 */
export interface PipRow {
    container: Phaser.GameObjects.Container
    setCount(n: number): void
    setNote(text: string): void
    light(i: number): void
    reset(): void
    destroy(): void
}

export function createPipRow(
    scene: Phaser.Scene,
    { x, y, maxWidth }: { x: number; y: number; maxWidth: number },
): PipRow {
    const container = scene.add.container(x, y)
    const g = scene.add.graphics()
    const note = scene.add.text(0, 0, '', {
        fontFamily: FONT.body, fontStyle: 'bold', fontSize: SIZE.blockNote,
        color: hex(C.white),
    }).setOrigin(0.5).setResolution(2).setVisible(false)
    container.add([g, note])

    let count = 0
    let lit = 0
    /** 1 → 0 logo depois de acender: é o estalo da bolinha que acabou de virar. */
    let pop = 0
    let popTween: Phaser.Tweens.Tween | null = null

    const paint = () => {
        if (!g.active) return
        g.clear()
        if (count <= 0) return

        const gap = count > 1 ? Math.min(EDITOR.pipGap, maxWidth / (count - 1)) : 0
        const start = -((count - 1) * gap) / 2

        for (let i = 0; i < count; i += 1) {
            const px = start + i * gap
            const last = i === lit - 1
            if (i < lit) {
                const r = EDITOR.pipR * (last ? 1 + pop * 0.55 : 1)
                if (last && pop > 0) {
                    g.lineStyle(3, C.white, pop * 0.7)
                    g.strokeCircle(px, 0, r + 6 * pop)
                }
                g.fillStyle(C.white, 0.96)
                g.fillCircle(px, 0, r)
            } else {
                g.fillStyle(C.ink, 0.26)
                g.fillCircle(px, 0, EDITOR.pipR)
                g.lineStyle(2, C.white, 0.38)
                g.strokeCircle(px, 0, EDITOR.pipR)
            }
        }
    }

    const stopPop = () => { popTween?.remove(); popTween = null; pop = 0 }

    return {
        container,

        setCount: n => {
            stopPop()
            note.setVisible(false)
            count = Math.max(0, n)
            lit = 0
            paint()
        },

        setNote: text => {
            stopPop()
            count = 0
            g.clear()
            note.setText(text).setVisible(true)
            FX.kill(scene, note)
            note.setScale(1)
            FX.to(scene, note, { scale: 1.14 },
                { duration: 150, yoyo: true, ease: Ease.back(2) })
        },

        light: i => {
            if (count <= 0) return
            lit = Phaser.Math.Clamp(i + 1, 0, count)
            stopPop()
            pop = 1
            paint()
            const s = { v: 1 }
            popTween = scene.tweens.add({
                targets: s, v: 0, duration: 210, ease: 'Sine.easeOut',
                onUpdate: () => { pop = s.v; paint() },
                onComplete: () => { pop = 0; popTween = null; paint() },
            })
        },

        reset: () => { stopPop(); lit = 0; paint() },

        destroy: () => { stopPop(); container.destroy() },
    }
}

export interface Stepper {
    container: Phaser.GameObjects.Container
    value(): number
    set(v: number): void
    setEnabled(on: boolean): void
    destroy(): void
}

/** A tampa redonda do − e do +: creme, igual à caixa do número, com aro na cor do laço. */
export function paintStepButton(
    g: Phaser.GameObjects.Graphics,
    r: number,
    { tone, enabled }: { tone: number; enabled: boolean },
) {
    g.clear()
    g.fillStyle(C.shadow, 0.3)
    g.fillCircle(0, 5, r)
    g.fillStyle(enabled ? C.paper : C.paperEdge, 1)
    g.fillCircle(0, 0, r)
    g.fillStyle(C.white, 0.75)
    g.fillCircle(0, -r * 0.34, r * 0.58)
    g.lineStyle(4, tone, enabled ? 1 : 0.45)
    g.strokeCircle(0, 0, r)
}

/**
 * O contador de um laço.
 *
 * ── POR QUE O − E O + SÃO DESENHADOS AQUI DENTRO ─────────────────────────
 *
 * Eles já existiram como `createRoundButton`, que cria o próprio container no
 * nível da CENA — profundidade 0. O editor mora em profundidade 40, então os
 * dois botões nasciam ATRÁS dos blocos de laço: invisíveis, com a zona de toque
 * sozinha lá em cima em 60. Ninguém conseguia mudar o número.
 *
 * Agora o − e o + são filhos do próprio passo: herdam a profundidade do editor
 * e não têm como sumir de novo. Só a ZONA de toque continua solta na cena, e por
 * um motivo diferente: o botão cresce no hover e afunda no clique, e uma área de
 * toque que muda de tamanho no meio do gesto come o clique da criança.
 *
 * O "até o topo" já morou aqui, como o passo seguinte do `+`. Saiu: para
 * chegar nele a criança apertava `+` doze vezes, ou descobria por acaso que o
 * `−` no 1 dava a volta. Uma ideia central da habilidade não pode depender de
 * um acidente — no Nível 3 ela agora está escrita no bloco.
 */
export function createStepper(
    scene: Phaser.Scene,
    { x, y, tone, max, onChange }: {
        x: number; y: number; tone: number
        max: number
        onChange: (v: number) => void
    },
): Stepper {
    const container = scene.add.container(x, y)

    /*
     * A caixa do número mora numa camada própria porque é SÓ ela que pulsa a
     * cada toque. Com o pulso no container inteiro, o − e o + escorregavam para
     * fora das próprias zonas de toque por 130ms a cada clique.
     */
    const boxLayer = scene.add.container(0, 0)
    const box = scene.add.graphics()
    const label = scene.add.text(0, 0, '1', {
        fontFamily: FONT.black, fontSize: SIZE.count, color: hex(C.slate),
    }).setOrigin(0.5).setResolution(2)
    boxLayer.add([box, label])
    container.add(boxLayer)

    let value = 1
    let enabled = true

    const paintBox = () => {
        box.clear()
        box.fillStyle(C.shadow, 0.22)
        box.fillRoundedRect(-EDITOR.boxW / 2 + 3, -EDITOR.boxH / 2 + 5, EDITOR.boxW, EDITOR.boxH, EDITOR.boxR)
        box.fillStyle(C.paper, 1)
        box.fillRoundedRect(-EDITOR.boxW / 2, -EDITOR.boxH / 2, EDITOR.boxW, EDITOR.boxH, EDITOR.boxR)
        box.lineStyle(4, tone, 1)
        box.strokeRoundedRect(-EDITOR.boxW / 2, -EDITOR.boxH / 2, EDITOR.boxW, EDITOR.boxH, EDITOR.boxR)

        label.setText(`${value}`)
    }

    /** O `+` respira até a criança encostar nele — depois cala a boca para sempre. */
    let hint: Phaser.Tweens.Tween | null = null
    let hintTarget: Phaser.GameObjects.Container | null = null
    const killHint = () => {
        if (!hint) return
        hint.remove()
        hint = null
        hintTarget?.setScale(1)
        hintTarget = null
    }

    const bump = (dir: 1 | -1) => {
        if (!enabled) return
        killHint()
        value = Phaser.Math.Clamp(value + dir, 1, max)
        paintBox()
        FX.to(scene, boxLayer, { scale: 1.07 },
            { duration: 130, yoyo: true, ease: Ease.back(2) })
        onChange(value)
    }

    // ── os dois botões, dentro do container do passo ────────────────────
    const zones: Phaser.GameObjects.Zone[] = []

    const makeStep = (dx: number, glyph: string, dir: 1 | -1) => {
        const node = scene.add.container(dx, 0)
        const face = scene.add.graphics()
        const sign = scene.add.text(0, -2, glyph, {
            fontFamily: FONT.black, fontSize: SIZE.stepper, color: hex(tone),
        }).setOrigin(0.5).setResolution(2)
        node.add([face, sign])
        container.add(node)

        const hit = scene.add
            .zone(x + dx, y, EDITOR.stepHit, EDITOR.stepHit)
            .setOrigin(0.5)
            .setDepth(60)
        hit.setInteractive({ useHandCursor: true })
        hit.on('pointerover', () => {
            if (!enabled) return
            killHint()
            FX.to(scene, node, { scale: 1.14 }, { duration: 110 })
        })
        hit.on('pointerout', () => {
            if (enabled) FX.to(scene, node, { scale: 1 }, { duration: 110 })
        })
        hit.on('pointerup', () => {
            if (!enabled) return
            FX.press(scene, node)
            bump(dir)
        })
        zones.push(hit)

        return {
            node,
            repaint: () => {
                paintStepButton(face, EDITOR.stepR, { tone, enabled })
                sign.setColor(hex(enabled ? tone : C.idle))
            },
        }
    }

    const dx = EDITOR.boxW / 2 + EDITOR.stepGap + EDITOR.stepR
    const minus = makeStep(-dx, '−', -1)
    const plus = makeStep(dx, '+', 1)

    paintBox()
    minus.repaint()
    plus.repaint()

    hintTarget = plus.node
    hint = FX.breathe(scene, plus.node, { grow: 1.12, duration: 1000 })

    return {
        container,
        value: () => value,
        set: v => { value = v; paintBox() },
        setEnabled: on => {
            // Repinta SEMPRE, mesmo sem mudança: basta o visual e a flag saírem
            // de sincronia uma vez para o passo ficar morto até o fim da fase.
            enabled = on
            if (!on) killHint()
            minus.repaint()
            plus.repaint()
            zones.forEach(z => { if (z.input) z.input.cursor = on ? 'pointer' : 'default' })
            container.setAlpha(on ? 1 : 0.75)
        },
        destroy: () => {
            killHint()
            zones.forEach(z => z.destroy())
            container.destroy()
        },
    }
}

/**
 * A placa do laço indefinido, no lugar onde os outros blocos têm o número.
 *
 * Ela ocupa a MESMA caixa do contador de propósito: a criança do Nível 2 já
 * sabe que ali mora "quantas vezes", e a leitura vira "aqui, em vez de um
 * número, está escrito até o topo".
 */
export function createTopBadge(
    scene: Phaser.Scene,
    { x, y }: { x: number; y: number },
): { container: Phaser.GameObjects.Container; destroy(): void } {
    const container = scene.add.container(x, y)

    const g = scene.add.graphics()
    g.fillStyle(C.shadow, 0.22)
    g.fillRoundedRect(-EDITOR.boxW / 2 + 3, -EDITOR.boxH / 2 + 5, EDITOR.boxW, EDITOR.boxH, EDITOR.boxR)
    g.fillStyle(C.cream, 1)
    g.fillRoundedRect(-EDITOR.boxW / 2, -EDITOR.boxH / 2, EDITOR.boxW, EDITOR.boxH, EDITOR.boxR)
    g.lineStyle(4, C.outerDark, 1)
    g.strokeRoundedRect(-EDITOR.boxW / 2, -EDITOR.boxH / 2, EDITOR.boxW, EDITOR.boxH, EDITOR.boxR)

    // seta batendo num teto: o desenho do "até o topo"
    const mark = scene.add.graphics().setPosition(-EDITOR.boxW / 2 + 26, 0)
    mark.fillStyle(C.outerDark, 1)
    mark.fillRect(-9, -13, 18, 4)
    mark.fillTriangle(0, -8, -9, 3, 9, 3)
    mark.fillRoundedRect(-3.5, 1, 7, 11, 2)

    const text = scene.add.text(10, 0, 'até o topo', {
        fontFamily: FONT.black, fontSize: SIZE.countWord, color: hex(C.outerDark),
    }).setOrigin(0.5).setResolution(2)

    container.add([g, mark, text])

    return { container, destroy: () => container.destroy() }
}

export interface Editor {
    container: Phaser.GameObjects.Container
    outer(): number
    inner(): number
    setEnabled(on: boolean): void
    /** Zera as bolinhas dos dois laços, antes de o programa rodar. */
    beginRun(): void
    /** Uma volta do laço de FORA: acende a bolinha do andar e ilumina o bloco. */
    newFloor(index: number): void
    /** Uma volta do laço de DENTRO: acende a bolinha da janela. */
    washWindow(index: number): void
    setReport(text: string, tone: number): void
    destroy(): void
}

export function createEditor(
    scene: Phaser.Scene,
    { nested, allowTop, maxOuter, maxInner, onRun }: {
        nested: boolean; allowTop: boolean
        maxOuter: number; maxInner: number
        onRun: () => void
    },
): Editor {
    const container = scene.add.container(0, 0).setDepth(40)
    const parts: Array<{ destroy: () => void }> = []

    /*
     * Sem laço externo (Nível 1) o bloco de dentro sobe e ocupa o lugar do de
     * fora. É melhor do que desenhar um bloco externo desabilitado: um bloco
     * que existe mas não faz nada é a pior explicação possível de laço.
     */
    const innerCY = nested ? EDITOR.innerCY : EDITOR.soloCY
    const innerH = nested ? EDITOR.innerH : EDITOR.soloH
    const innerW = nested ? EDITOR.innerW : EDITOR.outerW
    const innerX = EDITOR.cx + (nested ? EDITOR.innerDX : 0)

    /**
     * As duas primeiras linhas de um bloco: o que ele faz, e quantas vezes.
     *
     * O ícone é posicionado DEPOIS do texto existir, a partir da largura
     * medida dele: um `x` fixo só ficaria certo para uma das duas frases.
     */
    const addRows = (
        bx: number, cy: number,
        { action, actionY, pipsY, icon }: {
            action: string
            actionY: number
            pipsY: number
            icon: (g: Phaser.GameObjects.Graphics) => void
        },
    ) => {
        const label = scene.add.text(bx + EDITOR.iconGap / 2, cy + actionY, action, {
            fontFamily: FONT.black, fontSize: SIZE.blockAction, color: hex(C.white),
        }).setOrigin(0.5).setResolution(2)
        container.add(label)

        const mark = scene.add.graphics()
            .setPosition(label.x - label.width / 2 - EDITOR.iconGap, cy + actionY)
        icon(mark)
        container.add(mark)

        const pips = createPipRow(scene, {
            x: bx, y: cy + pipsY, maxWidth: EDITOR.pipMaxW,
        })
        container.add(pips.container)
        parts.push(pips)
        return pips
    }

    let outerBody: Phaser.GameObjects.Graphics | undefined
    let outerStep: Stepper | undefined
    let outerPips: PipRow | undefined

    if (nested) {
        outerBody = scene.add.graphics().setPosition(EDITOR.cx, EDITOR.outerCY)
        paintLoopBlock(outerBody, EDITOR.outerW, EDITOR.outerH, EDITOR.outerR, {
            tone: C.outer,
            hole: {
                x: EDITOR.innerDX,
                y: EDITOR.innerCY - EDITOR.outerCY,
                w: EDITOR.innerW + EDITOR.holePad * 2,
                h: EDITOR.innerH + EDITOR.holePad * 2,
                r: EDITOR.innerR + 6,
            },
        })
        container.add(outerBody)

        outerPips = addRows(EDITOR.cx, EDITOR.outerCY, {
            action: 'SUBIR UM ANDAR',
            actionY: EDITOR.outerActionY,
            pipsY: EDITOR.outerPipsY,
            icon: g => paintFloorIcon(g, EDITOR.iconR),
        })

        const stepY = EDITOR.outerCY + EDITOR.outerStepY

        if (allowTop) {
            /*
             * NÍVEL 3: o laço de fora perde o número.
             *
             * Ele não é um enigma escondido atrás do `+` — está escrito no
             * bloco. A criança não precisa contar dez andares para descobrir
             * que não precisava contar dez andares: é justamente esse o
             * conteúdo da habilidade, e ele fica dito em vez de adivinhado.
             */
            const badge = createTopBadge(scene, { x: EDITOR.cx, y: stepY })
            container.add(badge.container)
            parts.push(badge)
            outerPips.setNote('quantas vezes precisar')
        } else {
            outerStep = createStepper(scene, {
                x: EDITOR.cx, y: stepY,
                tone: C.outerDark, max: maxOuter,
                onChange: v => outerPips?.setCount(v),
            })
            container.add(outerStep.container)
            parts.push(outerStep)
            outerPips.setCount(1)
        }
    }

    const innerBody = scene.add.graphics().setPosition(innerX, innerCY)
    paintLoopBlock(innerBody, innerW, innerH, EDITOR.innerR, { tone: C.inner })
    container.add(innerBody)

    const innerPips = addRows(innerX, innerCY, {
        action: 'LAVAR UMA JANELA',
        actionY: EDITOR.actionY,
        pipsY: EDITOR.pipsY,
        icon: g => paintWindowIcon(g, EDITOR.iconR, C.inner),
    })

    const innerStep = createStepper(scene, {
        x: innerX, y: innerCY + EDITOR.stepY,
        tone: C.innerDark, max: maxInner,
        onChange: v => innerPips.setCount(v),
    })
    container.add(innerStep.container)
    parts.push(innerStep)
    innerPips.setCount(1)

    const run = createBigButton(scene, {
        x: EDITOR.cx, y: EDITOR.runY, w: EDITOR.runW, h: EDITOR.runH,
        label: 'EXECUTAR', tone: C.ok, onClick: onRun,
    })
    parts.push(run)

    const report = scene.add.text(EDITOR.cx, EDITOR.reportY, '', {
        fontFamily: FONT.black, fontSize: SIZE.report, color: hex(C.paper),
        align: 'center', wordWrap: { width: EDITOR.reportWrap },
        stroke: hex(C.ink), strokeThickness: 4,
    }).setOrigin(0.5).setResolution(2).setDepth(41)

    /*
     * O clarão do bloco que está rodando.
     *
     * Só o laço de FORA ganha clarão. O de dentro pisca a cada janela, e num
     * prédio de dez andares isso é uma janela a cada 55ms — clarão nessa
     * cadência vira estrobo. Lá, o efeito é a bolinha acendendo: mesma
     * informação, área pequena, sem piscar a tela na cara de uma criança.
     */
    const glow = scene.add.graphics().setAlpha(0)
    glow.lineStyle(6, C.white, 0.9)
    glow.strokeRoundedRect(
        EDITOR.cx - EDITOR.outerW / 2, EDITOR.outerCY - EDITOR.outerH / 2,
        EDITOR.outerW, EDITOR.outerH, EDITOR.outerR,
    )
    container.add(glow)

    const pulse = (body: Phaser.GameObjects.Graphics | undefined, grow: number) => {
        if (!body) return
        FX.kill(scene, body)
        body.setScale(1)
        FX.to(scene, body, { scale: grow }, { duration: 120, yoyo: true, ease: Ease.smooth })
    }

    return {
        container,
        outer: () => (allowTop ? TOP : outerStep?.value() ?? 1),
        inner: () => innerStep.value(),

        setEnabled: on => {
            outerStep?.setEnabled(on)
            innerStep.setEnabled(on)
            run.setEnabled(on)
        },

        beginRun: () => {
            outerPips?.reset()
            innerPips.reset()
            if (allowTop) outerPips?.setNote('quantas vezes precisar')
        },

        newFloor: index => {
            if (allowTop) outerPips?.setNote(`andar ${index + 1}`)
            else outerPips?.light(index)

            // o de dentro recomeça do zero a cada andar — é ISSO que é aninhar
            innerPips.reset()

            pulse(outerBody, 1.03)
            if (!outerBody) return
            FX.kill(scene, glow)
            glow.setAlpha(0.85)
            FX.to(scene, glow, { alpha: 0 }, { duration: 320, ease: Ease.smooth })
        },

        washWindow: index => {
            innerPips.light(index)
            pulse(innerBody, 1.03)
        },

        setReport: (text, tone) => {
            report.setText(text).setColor(hex(tone))
            if (!text) return
            FX.kill(scene, report)
            report.setAlpha(0)
            FX.to(scene, report, { alpha: 1 }, { duration: 220 })
        },

        destroy: () => {
            parts.forEach(p => p.destroy())
            report.destroy()
            container.destroy()
        },
    }
}

/* ═════════════════════════════════════════════════════════════ toast */

export function showToast(
    scene: Phaser.Scene,
    message: string,
    tone: number,
    life = 2200,
) {
    const container = scene.add.container(QUESTION.cx, TOAST.hiddenY).setDepth(400)

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
