import Phaser from 'phaser'
import { FX, Ease } from '../../../../shared/effects/FX'
import {
    C, A, FONT, SIZE, TYPE_MS, LONG_QUESTION, hex, FIELD_LABEL, FIELD_ORDER,
} from '../data/theme'
import { W, H, HUD, QUESTION, BIG, CARD, FORM, TOAST, COUNTER } from '../data/layout'
import type { CardState, Criterio, Ficha, FieldId, RowState } from '../types'

/*
 * Painters puros e construtores. A GameScene não desenha nada: se ela precisar
 * de um `fillRoundedRect`, falta um painter aqui.
 */

/* ═══════════════════════════════════════════════════════════ texturas */

export const TEX = { bg: 'bg-escritorio', pin: 'pino' } as const

export const hasTex = (scene: Phaser.Scene, key: string) => scene.textures.exists(key)

/**
 * Encaixa a imagem numa CAIXA MÁXIMA, sem distorcer.
 *
 * Os retratos são 500x500 e o pino é menor: escalar pela menor razão faz os dois
 * caberem na medida do layout sem esticar nenhum.
 */
export function fitImage(image: Phaser.GameObjects.Image, maxW: number, maxH: number) {
    image.setScale(Math.min(maxW / image.width, maxH / image.height))
    return image
}

/**
 * O retrato, dentro de uma moldura redonda.
 *
 * A máscara é o que faz doze desenhos de origens diferentes parecerem o mesmo
 * arquivo: sem ela, cada retrato traz a própria margem branca e as fichas ficam
 * desalinhadas.
 */
export function createPortrait(
    scene: Phaser.Scene,
    key: string,
    size: number,
): Phaser.GameObjects.Container {
    const node = scene.add.container(0, 0)
    const r = size / 2

    const frame = scene.add.graphics()
    frame.fillStyle(C.shadow, 0.2)
    frame.fillCircle(2, 4, r)
    frame.fillStyle(C.cream, 1)
    frame.fillCircle(0, 0, r)
    node.add(frame)

    if (hasTex(scene, key)) {
        const img = scene.add.image(0, 0, key)
        fitImage(img, size * 1.04, size * 1.04)
        node.add(img)

        const mask = scene.make.graphics({ x: 0, y: 0 }, false)
        mask.fillStyle(0xffffff, 1)
        mask.fillCircle(0, 0, r - 2)
        const geo = mask.createGeometryMask()
        img.setMask(geo)
        // a máscara vive em coordenadas de tela: sem seguir o container, o
        // retrato apareceria recortado no canto superior esquerdo
        node.on('destroy', () => mask.destroy())
        node.setData('__mask', mask)
    } else {
        const g = scene.add.graphics()
        g.fillStyle(C.stampSoft, 1)
        g.fillCircle(0, 0, r - 3)
        g.fillStyle(C.stamp, 0.8)
        g.fillCircle(0, -r * 0.22, r * 0.34)
        g.fillRoundedRect(-r * 0.52, r * 0.14, r * 1.04, r * 0.7, r * 0.3)
        node.add(g)
    }

    const ring = scene.add.graphics()
    ring.lineStyle(5, C.paperEdge, 1)
    ring.strokeCircle(0, 0, r)
    node.add(ring)

    return node
}

/**
 * Reposiciona a máscara do retrato depois que o container achou o lugar dele.
 *
 * Máscara geométrica do Phaser não é filha do container: ela usa coordenadas de
 * mundo. Todo retrato precisa desta chamada depois de posicionado, senão o
 * recorte fica no canto da tela.
 */
export function syncPortrait(node: Phaser.GameObjects.Container, x: number, y: number) {
    const mask = node.getData('__mask') as Phaser.GameObjects.Graphics | undefined
    if (mask) mask.setPosition(x, y)
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
    const r = size * 0.34
    g.fillStyle(C.shadow, 0.24)
    g.fillEllipse(2, size * 0.3, r * 1.5, r * 0.5)
    g.fillStyle(C.muted, 1)
    g.fillRoundedRect(-2.5, 0, 5, size * 0.34, 2.5)
    g.fillStyle(C.pin, 1)
    g.fillCircle(0, -2, r)
    g.fillStyle(C.white, 0.42)
    g.fillEllipse(-r * 0.3, -r * 0.42, r * 0.5, r * 0.34)
    node.add(g)
    return node
}

/* ═══════════════════════════════════════════════════════════ cenário */

/** Sala de arquivo: parede fria e um balcão de madeira. Fallback do cenário. */
export function paintRoom(g: Phaser.GameObjects.Graphics) {
    g.clear()
    for (let i = 0; i < 14; i += 1) {
        const t = i / 13
        const color = Phaser.Display.Color.Interpolate.ColorWithColor(
            Phaser.Display.Color.ValueToColor(C.ink),
            Phaser.Display.Color.ValueToColor(C.inkSoft),
            13, i,
        )
        g.fillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b), 1)
        g.fillRect(0, Math.floor(t * H), W, Math.ceil(H / 14) + 1)
    }
    g.fillStyle(C.white, 0.03)
    for (let y = 30; y < H; y += 40) {
        for (let x = 30; x < W; x += 40) g.fillCircle(x, y, 2)
    }
    g.fillStyle(C.wood, 1)
    g.fillRect(0, H - 48, W, 48)
    g.fillStyle(C.woodLight, 0.4)
    g.fillRect(0, H - 48, W, 4)
    g.fillStyle(C.ink, 0.22)
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
    g.lineStyle(3, C.stamp, 0.55)
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
    pill.fillStyle(C.stamp, 1)
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
        color: hex(C.line), align: 'center', wordWrap: { width: HUD.hintW },
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
                    g.fillStyle(C.stamp, 1)
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
    g.fillStyle(C.stamp, 1)
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
            container.setAlpha(on ? 1 : A.dim)
            if (hit.input) hit.input.cursor = on ? 'pointer' : 'default'
        },
        destroy: () => { hit.destroy(); container.destroy() },
    }
}

/* ═════════════════════════════════════════════ pergunta e contador */

export interface QuestionLine {
    show(text: string): Promise<void>
    setCount(text: string): void
    destroy(): void
}

export function createQuestionLine(scene: Phaser.Scene): QuestionLine {
    const label = scene.add.text(QUESTION.cx, QUESTION.cy, '', {
        fontFamily: FONT.black, fontSize: SIZE.question, color: hex(C.paper),
        align: 'center', wordWrap: { width: QUESTION.wrap },
    }).setOrigin(0.5).setResolution(2).setDepth(30)

    const counter = scene.add.text(COUNTER.cx, COUNTER.cy, '', {
        fontFamily: FONT.black, fontSize: SIZE.counter, color: hex(C.stamp),
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
        setCount: text => counter.setText(text),
        destroy: () => { typing?.skip(); counter.destroy(); label.destroy() },
    }
}

/* ═══════════════════════════════════════════════ a ficha aberta (N1) */

export function paintCardSurface(
    g: Phaser.GameObjects.Graphics,
    w: number, h: number, r: number,
    { tone, thick }: { tone: number; thick: number },
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
    g.lineStyle(thick, tone, 1)
    g.strokeRoundedRect(left, top, w, h, r)
}

/**
 * A linha de um campo.
 *
 * `idle` tem só um filete embaixo, como pauta de formulário. É o rótulo à
 * esquerda que carrega a lição — o valor sozinho não diz o que ele é.
 */
export function paintFieldRow(
    g: Phaser.GameObjects.Graphics,
    w: number, h: number, r: number,
    { state }: { state: RowState },
) {
    const left = -w / 2
    const top = -h / 2

    g.clear()

    if (state === 'ok') {
        g.fillStyle(C.okSoft, 1)
        g.fillRoundedRect(left, top, w, h, r)
        g.lineStyle(4, C.ok, 1)
        g.strokeRoundedRect(left, top, w, h, r)
        return
    }
    if (state === 'no') {
        g.fillStyle(C.noSoft, 1)
        g.fillRoundedRect(left, top, w, h, r)
        g.lineStyle(4, C.no, 1)
        g.strokeRoundedRect(left, top, w, h, r)
        return
    }
    if (state === 'hover') {
        g.fillStyle(C.stampSoft, 1)
        g.fillRoundedRect(left, top, w, h, r)
        g.lineStyle(4, C.stamp, 1)
        g.strokeRoundedRect(left, top, w, h, r)
        return
    }
    g.fillStyle(C.cream, 0.9)
    g.fillRoundedRect(left, top, w, h, r)
    g.fillStyle(C.line, 1)
    g.fillRoundedRect(left + 10, top + h - 4, w - 20, 3, 2)
}

export interface BigFicha {
    container: Phaser.GameObjects.Container
    setRowState(field: FieldId, state: RowState): void
    resetRows(): void
    setEnabled(on: boolean): void
    destroy(): void
}

export function createBigFicha(
    scene: Phaser.Scene,
    ficha: Ficha,
    onTapField: (field: FieldId) => void,
): BigFicha {
    const container = scene.add.container(BIG.cx, BIG.cy).setDepth(30)

    const surface = scene.add.graphics()
    paintCardSurface(surface, BIG.w, BIG.h, BIG.r, { tone: C.stamp, thick: 6 })
    container.add(surface)

    const portrait = createPortrait(scene, ficha.portrait, BIG.portraitSize)
    portrait.setPosition(BIG.portraitX, BIG.portraitY)
    container.add(portrait)
    syncPortrait(portrait, BIG.cx + BIG.portraitX, BIG.cy + BIG.portraitY)

    const name = scene.add.text(BIG.nameX, BIG.nameY, ficha.nome, {
        fontFamily: FONT.black, fontSize: SIZE.bigName, color: hex(C.slate),
    }).setOrigin(0, 0.5).setResolution(2)
    container.add(name)

    const rows = new Map<FieldId, {
        g: Phaser.GameObjects.Graphics
        label: Phaser.GameObjects.Text
        value: Phaser.GameObjects.Text
        state: RowState
    }>()
    const zones: Phaser.GameObjects.Zone[] = []
    let enabled = true

    FIELD_ORDER.forEach((field, i) => {
        const y = BIG.rowTop + i * (BIG.rowH + BIG.rowGap)

        const g = scene.add.graphics().setPosition(BIG.rowX, y)
        paintFieldRow(g, BIG.rowW, BIG.rowH, BIG.rowR, { state: 'idle' })

        const label = scene.add.text(BIG.rowX + BIG.labelDX, y, FIELD_LABEL[field], {
            fontFamily: FONT.black, fontSize: SIZE.rowLabel, color: hex(C.muted),
        }).setOrigin(0, 0.5).setResolution(2)

        const value = scene.add.text(BIG.rowX + BIG.valueDX, y, ficha[field], {
            fontFamily: FONT.body, fontStyle: 'bold', fontSize: SIZE.rowValue,
            color: hex(C.slate),
        }).setOrigin(0, 0.5).setResolution(2)

        container.add([g, label, value])

        const view = { g, label, value, state: 'idle' as RowState }
        rows.set(field, view)

        const zone = scene.add.zone(BIG.cx + BIG.rowX, BIG.cy + y, BIG.rowW, BIG.rowH)
            .setOrigin(0.5).setDepth(31)
        zone.setInteractive({ useHandCursor: true })
        zone.on('pointerover', () => {
            if (!enabled || view.state !== 'idle') return
            paintFieldRow(g, BIG.rowW, BIG.rowH, BIG.rowR, { state: 'hover' })
        })
        zone.on('pointerout', () => {
            if (!enabled || view.state !== 'idle') return
            paintFieldRow(g, BIG.rowW, BIG.rowH, BIG.rowR, { state: 'idle' })
        })
        zone.on('pointerup', () => {
            if (!enabled || view.state !== 'idle') return
            onTapField(field)
        })
        zones.push(zone)

        FX.popIn(scene, g, { from: 0.9, delay: 90 + i * 60, duration: 300 })
    })

    return {
        container,

        setRowState: (field, state) => {
            const view = rows.get(field)
            if (!view) return
            view.state = state
            paintFieldRow(view.g, BIG.rowW, BIG.rowH, BIG.rowR, { state })
            if (state === 'ok') {
                view.label.setColor(hex(C.ok))
                FX.to(scene, view.g, { scale: 1.04 },
                    { duration: 180, yoyo: true, ease: Ease.back(2) })
            } else if (state === 'no') {
                void FX.shake(scene, view.g, { amount: 8, times: 2 })
            }
        },

        resetRows: () => {
            rows.forEach((view, field) => {
                if (view.state === 'ok') return
                view.state = 'idle'
                view.label.setColor(hex(C.muted))
                paintFieldRow(view.g, BIG.rowW, BIG.rowH, BIG.rowR, { state: 'idle' })
                void field
            })
        },

        setEnabled: on => { enabled = on },

        destroy: () => { zones.forEach(z => z.destroy()); container.destroy() },
    }
}

/* ═══════════════════════════════════════════ a ficha pequena (N2/N3) */

const CARD_TONE: Record<CardState, number> = {
    idle: C.paperEdge,
    hover: C.stamp,
    ok: C.ok,
    no: C.no,
}

export interface CardView {
    container: Phaser.GameObjects.Container
    id: string
    x: number
    y: number
    setState(state: CardState): void
    /** Acende a linha do campo que decidiu — a trilha do raciocínio. */
    lightField(field: FieldId, tone: number): void
    clearLights(): void
    pin(): Promise<void>
    shake(): Promise<void>
    setEnabled(on: boolean): void
    destroy(): void
}

export function createCard(
    scene: Phaser.Scene,
    ficha: Ficha,
    show: FieldId[],
    { x, y, onTap }: { x: number; y: number; onTap: (id: string) => void },
): CardView {
    const container = scene.add.container(x, y).setDepth(30)

    const surface = scene.add.graphics()
    paintCardSurface(surface, CARD.w, CARD.h, CARD.r, { tone: C.paperEdge, thick: 4 })
    container.add(surface)

    const lights = scene.add.graphics()
    container.add(lights)

    const portrait = createPortrait(scene, ficha.portrait, CARD.portraitSize)
    portrait.setPosition(CARD.portraitX, CARD.portraitY)
    container.add(portrait)
    syncPortrait(portrait, x + CARD.portraitX, y + CARD.portraitY)

    const name = scene.add.text(CARD.nameX, CARD.nameY, ficha.nome, {
        fontFamily: FONT.black, fontSize: SIZE.cardName, color: hex(C.slate),
    }).setOrigin(0, 0.5).setResolution(2)
    container.add(name)

    const lineY = new Map<FieldId, number>()
    show.forEach((field, i) => {
        const ly = CARD.lineTop + i * CARD.lineH
        lineY.set(field, ly)
        const t = scene.add.text(CARD.lineX, ly, `${FIELD_LABEL[field]}: ${ficha[field]}`, {
            fontFamily: FONT.body, fontStyle: 'bold', fontSize: SIZE.cardLine,
            color: hex(C.slate), wordWrap: { width: CARD.lineWrap },
        }).setOrigin(0, 0.5).setResolution(2)
        container.add(t)
    })

    const pinNode = createPin(scene, CARD.pinSize)
    pinNode.setPosition(CARD.pinX, CARD.pinY).setVisible(false)
    container.add(pinNode)

    let state: CardState = 'idle'
    let enabled = true

    const hit = scene.add.zone(x, y, CARD.w, CARD.h).setOrigin(0.5).setDepth(31)
    hit.setInteractive({ useHandCursor: true })
    hit.on('pointerover', () => {
        if (!enabled || state !== 'idle') return
        paintCardSurface(surface, CARD.w, CARD.h, CARD.r, { tone: C.stamp, thick: 6 })
        FX.to(scene, container, { scale: 1.04 }, { duration: 130 })
    })
    hit.on('pointerout', () => {
        if (!enabled || state !== 'idle') return
        paintCardSurface(surface, CARD.w, CARD.h, CARD.r, { tone: C.paperEdge, thick: 4 })
        FX.to(scene, container, { scale: 1 }, { duration: 130 })
    })
    hit.on('pointerup', () => {
        if (!enabled || state !== 'idle') return
        FX.press(scene, container)
        onTap(ficha.id)
    })

    return {
        container,
        id: ficha.id,
        x, y,

        setState: next => {
            state = next
            paintCardSurface(surface, CARD.w, CARD.h, CARD.r, {
                tone: CARD_TONE[next], thick: next === 'idle' ? 4 : 6,
            })
        },

        lightField: (field, tone) => {
            const ly = lineY.get(field)
            if (ly === undefined) return
            lights.fillStyle(tone, 0.22)
            lights.fillRoundedRect(CARD.lineX - 10, ly - 15, CARD.lineWrap + 22, 30, 9)
        },

        clearLights: () => lights.clear(),

        pin: async () => {
            pinNode.setVisible(true)
            await FX.popIn(scene, pinNode, { from: 0.3, duration: 300 })
        },

        shake: () => FX.shake(scene, container, { amount: 9, times: 3 }),

        setEnabled: on => { enabled = on },

        destroy: () => { hit.destroy(); container.destroy() },
    }
}

/** Onde cada ficha assenta: três por fileira, duas fileiras, sempre centradas. */
export function cardSpots(count: number): Array<{ x: number; y: number }> {
    const spots: Array<{ x: number; y: number }> = []
    for (let i = 0; i < count; i += 1) {
        const col = i % CARD.cols
        const row = Math.floor(i / CARD.cols)
        const perRow = Math.min(CARD.cols, count - row * CARD.cols)
        const total = perRow * CARD.w + (perRow - 1) * CARD.gap
        const startX = W / 2 - total / 2 + CARD.w / 2
        spots.push({
            x: startX + col * (CARD.w + CARD.gap),
            y: CARD.rowsY[Math.min(row, CARD.rowsY.length - 1)],
        })
    }
    return spots
}

/* ═══════════════════════════════════════════ formulário anônimo (N3) */

export interface FormStrip {
    container: Phaser.GameObjects.Container
    show(): Promise<void>
    destroy(): void
}

/**
 * O formulário que chegou sem nome e sem foto.
 *
 * Ele mostra só pares campo/valor — é o registro sem identidade, que é
 * exatamente o que a criança precisa reconstruir cruzando as fichas.
 */
export function createFormStrip(scene: Phaser.Scene, criterios: Criterio[]): FormStrip {
    const container = scene.add.container(FORM.cx, FORM.cy).setDepth(28)

    const g = scene.add.graphics()
    g.fillStyle(C.shadow, 0.3)
    g.fillRoundedRect(-FORM.w / 2 + 5, -FORM.h / 2 + 9, FORM.w, FORM.h, FORM.r)
    g.fillStyle(C.cream, 1)
    g.fillRoundedRect(-FORM.w / 2, -FORM.h / 2, FORM.w, FORM.h, FORM.r)
    g.fillStyle(C.white, A.gloss)
    g.fillRoundedRect(-FORM.w / 2 + 14, -FORM.h / 2 + 10, FORM.w - 28, 14, 7)
    g.lineStyle(5, C.stamp, 1)
    g.strokeRoundedRect(-FORM.w / 2, -FORM.h / 2, FORM.w, FORM.h, FORM.r)
    container.add(g)

    const title = scene.add.text(FORM.titleX, 0, 'FORMULÁRIO\nSEM NOME', {
        fontFamily: FONT.black, fontSize: SIZE.formLabel, color: hex(C.muted),
        align: 'left', lineSpacing: 3,
    }).setOrigin(0, 0.5).setResolution(2)
    container.add(title)

    criterios.forEach((crit, i) => {
        const x = FORM.chipX + i * (FORM.chipW + FORM.chipGap) + FORM.chipW / 2
        const chip = scene.add.graphics()
        chip.fillStyle(C.stampSoft, 1)
        chip.fillRoundedRect(x - FORM.chipW / 2, -FORM.chipH / 2, FORM.chipW, FORM.chipH, FORM.chipR)
        chip.lineStyle(4, C.stamp, 1)
        chip.strokeRoundedRect(x - FORM.chipW / 2, -FORM.chipH / 2, FORM.chipW, FORM.chipH, FORM.chipR)
        container.add(chip)

        const label = scene.add.text(x, -13, FIELD_LABEL[crit.field].toUpperCase(), {
            fontFamily: FONT.black, fontSize: SIZE.formLabel, color: hex(C.stampDark),
        }).setOrigin(0.5).setResolution(2)

        const value = scene.add.text(x, 12, crit.value, {
            fontFamily: FONT.black, fontSize: SIZE.formValue, color: hex(C.slate),
        }).setOrigin(0.5).setResolution(2)

        container.add([label, value])
    })

    container.setVisible(false)

    return {
        container,
        show: async () => {
            container.setVisible(true).setAlpha(0).setScale(0.94)
            await FX.to(scene, container, { alpha: 1, scale: 1 },
                { duration: 300, ease: Ease.back(1.6) })
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
