import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { FX, Ease } from '../../../../shared/effects/FX'
import { C, A, FONT, SIZE, TYPE_MS, LONG_SENTENCE, hex } from '../data/theme'
import { W, H, HUD, TIMER, CARD, BADGE, ANSWER, EXPLAIN, TOAST, STAMP, JUDGE } from '../data/layout'
import type { LogicSentence } from '../types'

/*
 * Este arquivo tem duas metades e a separação é proposital:
 *
 * 1. PAINTERS — funções puras que recebem um Graphics e desenham nele. Não
 *    criam objetos, não animam, não guardam estado. Podem ser chamadas de
 *    novo a qualquer momento para repintar o mesmo Graphics.
 * 2. CONSTRUTORES — criam um pedaço de interface e devolvem um handle com
 *    métodos e `destroy`. A cena nunca mexe nos objetos internos deles.
 *
 * A GameScene não desenha nada por conta própria. Se ela precisar de um
 * `fillRoundedRect`, é sinal de que falta um painter aqui.
 */

/* ═════════════════════════════════════════════════════════════ painters */

/**
 * Cartão de sentença: sombra, corpo de madeira, faixa de cabeçalho mais
 * escura e moldura de latão dupla.
 *
 * A altura vem de fora porque só a cena sabe quanto texto entrou. O painter
 * não mede nada — se ele medisse, precisaria conhecer a fonte, e aí deixaria
 * de ser puro.
 */
export function paintSentenceCard(
    g: Phaser.GameObjects.Graphics,
    w: number,
    h: number,
    r: number,
    headerH: number,
) {
    const top = -h / 2
    const left = -w / 2

    g.clear()

    g.fillStyle(C.shadow, A.shadow)
    g.fillRoundedRect(left + 7, top + 11, w, h, r)

    g.fillStyle(C.woodMid, 0.97)
    g.fillRoundedRect(left, top, w, h, r)

    // faixa do cabeçalho: cantos superiores arredondados, inferiores retos
    g.fillStyle(C.wood, 1)
    g.fillRoundedRect(left, top, w, headerH, { tl: r, tr: r, bl: 0, br: 0 })

    // filete de latão separando cabeçalho e corpo
    g.fillStyle(C.brass, 0.42)
    g.fillRect(left + 2, top + headerH - 2, w - 4, 2)

    // brilho superior — volume sem textura
    g.fillStyle(C.white, A.gloss * 0.5)
    g.fillRoundedRect(left + 14, top + 8, w - 28, 12, 6)

    g.lineStyle(5, C.brass, 0.9)
    g.strokeRoundedRect(left, top, w, h, r)

    g.lineStyle(2, C.brassDark, 0.5)
    g.strokeRoundedRect(left + 8, top + 8, w - 16, h - 16, r - 8)
}

/** Painel de papel creme. Usado na explicação e em qualquer caixa de leitura. */
export function paintPanel(
    g: Phaser.GameObjects.Graphics,
    w: number,
    h: number,
    r: number,
    accent: number,
) {
    const top = -h / 2
    const left = -w / 2

    g.clear()

    g.fillStyle(C.shadow, A.shadow)
    g.fillRoundedRect(left + 6, top + 10, w, h, r)

    g.fillStyle(C.panelEdge, 1)
    g.fillRoundedRect(left, top, w, h, r)

    g.fillStyle(C.panel, 1)
    g.fillRoundedRect(left + 4, top + 4, w - 8, h - 10, r - 4)

    // faixa de acento colada no topo, como nos modais da plataforma
    g.fillStyle(accent, 1)
    g.fillRoundedRect(left + 4, top + 4, w - 8, 12, { tl: r - 4, tr: r - 4, bl: 0, br: 0 })

    g.lineStyle(3, accent, 0.55)
    g.strokeRoundedRect(left, top, w, h, r)
}

/**
 * Face do botão de veredicto.
 *
 * Base escura de altura `h + drop` desenhada sempre; a face colorida desce
 * `drop` quando pressionada. É a mesma ideia do botão de `showLevelComplete`
 * e é o que faz o botão ter espessura em vez de parecer um adesivo colado.
 */
export function paintAnswerFace(
    g: Phaser.GameObjects.Graphics,
    w: number,
    h: number,
    r: number,
    { tone, deep, pressed = false, enabled = true, drop = ANSWER.drop }:
        { tone: number; deep: number; pressed?: boolean; enabled?: boolean; drop?: number },
) {
    const dy = pressed ? drop : 0
    const left = -w / 2
    const top = -h / 2

    g.clear()

    g.fillStyle(C.shadow, A.shadow)
    g.fillRoundedRect(left + 4, top + drop + 6, w, h, r)

    g.fillStyle(deep, 1)
    g.fillRoundedRect(left, top, w, h + drop, r)

    g.fillStyle(tone, enabled ? 1 : 0.55)
    g.fillRoundedRect(left, top + dy, w, h, r)

    g.fillStyle(C.white, enabled ? 0.26 : 0.1)
    g.fillRoundedRect(left + 16, top + dy + 12, w - 32, h * 0.26, r * 0.5)

    g.lineStyle(5, C.white, enabled ? 0.9 : 0.35)
    g.strokeRoundedRect(left, top + dy, w, h, r)
}

/** Barra do HUD: madeira escura com filete de latão. */
export function paintHudBar(g: Phaser.GameObjects.Graphics) {
    g.clear()

    g.fillStyle(C.shadow, 0.3)
    g.fillRoundedRect(HUD.x + 4, HUD.y + 7, HUD.w, HUD.h, HUD.r)

    g.fillStyle(C.wood, 0.96)
    g.fillRoundedRect(HUD.x, HUD.y, HUD.w, HUD.h, HUD.r)

    g.fillStyle(C.white, 0.07)
    g.fillRoundedRect(HUD.x + 16, HUD.y + 10, HUD.w - 32, 18, 9)

    g.lineStyle(3, C.brass, 0.7)
    g.strokeRoundedRect(HUD.x, HUD.y, HUD.w, HUD.h, HUD.r)
}

/* ═══════════════════════════════════════════════════════════════ HUD */

export interface Hud {
    container: Phaser.GameObjects.Container
    setLevel(level: number): void
    setTitle(title: string): void
    setHint(hint: string): void
    setProgress(done: number, total: number): void
    setHelpVisible(on: boolean): void
    setHelpEnabled(on: boolean): void
    destroy(): void
}

export function createHud(
    scene: Phaser.Scene,
    { onHelp, depth = 80 }: { onHelp: () => void; depth?: number },
): Hud {
    const container = scene.add.container(0, 0).setDepth(depth)

    const bar = scene.add.graphics()
    paintHudBar(bar)
    container.add(bar)

    const pill = scene.add.graphics()
    pill.fillStyle(C.brass, 1)
    pill.fillRoundedRect(HUD.pillX, HUD.pillY, HUD.pillW, HUD.pillH, HUD.pillH / 2)
    pill.fillStyle(C.white, 0.28)
    pill.fillRoundedRect(HUD.pillX + 10, HUD.pillY + 6, HUD.pillW - 20, 12, 6)
    container.add(pill)

    const levelLabel = scene.add.text(HUD.pillX + HUD.pillW / 2, HUD.cy, 'NÍVEL 1', {
        fontFamily: FONT.black, fontSize: SIZE.hudLevel, color: hex(C.wood),
    }).setOrigin(0.5).setResolution(2)
    container.add(levelLabel)

    const title = scene.add.text(HUD.titleX, HUD.titleY, '', {
        fontFamily: FONT.black, fontSize: SIZE.hudTitle, color: hex(C.cream),
        align: 'center', wordWrap: { width: HUD.titleW },
    }).setOrigin(0.5).setResolution(2)
    container.add(title)

    const hint = scene.add.text(HUD.titleX, HUD.hintY, '', {
        fontFamily: FONT.body, fontStyle: 'bold', fontSize: SIZE.hudHint,
        color: hex(C.brassDim), align: 'center', wordWrap: { width: HUD.hintW },
    }).setOrigin(0.5).setResolution(2)
    container.add(hint)

    // Pontinhos de progresso vivem num container próprio: são redesenhados a
    // cada sentença e não podem levar o resto do HUD junto.
    const dots = scene.add.container(0, 0)
    container.add(dots)

    const help = createRoundButton(scene, HUD.helpX, HUD.cy, HUD.helpR, '?', onHelp, C.amber)
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
                    g.fillStyle(C.brass, 1)
                    g.fillCircle(x, HUD.cy, HUD.dotR)
                    g.lineStyle(2, C.brassDim, 1)
                    g.strokeCircle(x, HUD.cy, HUD.dotR)
                } else if (i === done) {
                    // "atual" é uma cápsula, não um círculo: lê-se de relance
                    g.fillStyle(C.amber, 1)
                    g.fillRoundedRect(x - 14, HUD.cy - 8, 28, 16, 8)
                    g.lineStyle(2, C.white, 0.8)
                    g.strokeRoundedRect(x - 14, HUD.cy - 8, 28, 16, 8)
                } else {
                    g.fillStyle(C.woodLight, 1)
                    g.fillCircle(x, HUD.cy, HUD.dotR)
                }
                dots.add(g)
            }
        },
        setHelpVisible: (on) => help.container.setVisible(on),
        setHelpEnabled: help.setEnabled,
        destroy: () => {
            help.destroy()
            mute.destroy()
            container.destroy()
        },
    }
}

/* ══════════════════════════════════════════════════════════ botões */

export interface RoundButton {
    container: Phaser.GameObjects.Container
    setEnabled(on: boolean): void
    destroy(): void
}

/**
 * Botão redondo do HUD.
 *
 * A zona de toque é um objeto separado, parado. O container cresce no hover e
 * afunda no clique — se a área de toque fosse ele, a borda mudaria de tamanho
 * no meio do gesto e um `pointerup` perto da margem cairia fora do objeto,
 * comendo o clique.
 */
export function createRoundButton(
    scene: Phaser.Scene,
    x: number,
    y: number,
    r: number,
    label: string,
    onClick: () => void,
    tone = C.amber,
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
    g.fillStyle(C.woodLight, 1)
    g.fillCircle(0, 0, HUD.muteR)
    g.lineStyle(3, C.brass, 0.9)
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

export interface AnswerButton {
    container: Phaser.GameObjects.Container
    value: boolean
    setEnabled(on: boolean): void
    isEnabled(): boolean
    /** Recolhe o botão para o painel de explicação ocupar a faixa. */
    retract(): Promise<void>
    /** Devolve o botão à posição de repouso. */
    restore(): Promise<void>
    celebrate(): Promise<void>
    reject(): Promise<void>
    destroy(): void
}

export function createAnswerButton(
    scene: Phaser.Scene,
    {
        x, y, value, label, caption, onClick, onFocus, onBlur,
    }: {
        x: number
        y: number
        value: boolean
        label: string
        caption: string
        onClick: (value: boolean) => void
        onFocus?: (x: number, y: number) => void
        onBlur?: () => void
    },
): AnswerButton {
    const tone = value ? C.green : C.red
    const deep = value ? C.greenDeep : C.redDeep

    const container = scene.add.container(x, y).setDepth(20)
    const face = scene.add.graphics()

    const labelText = scene.add.text(0, ANSWER.labelDY, label, {
        fontFamily: FONT.black, fontSize: SIZE.answerLabel, color: hex(C.white),
        stroke: hex(deep), strokeThickness: 4,
    }).setOrigin(0.5).setResolution(2)

    const captionText = scene.add.text(0, ANSWER.captionDY, caption, {
        fontFamily: FONT.body, fontStyle: 'bold', fontSize: SIZE.answerCaption,
        color: hex(C.white), stroke: hex(deep), strokeThickness: 3,
        align: 'center', wordWrap: { width: ANSWER.w - 40 },
    }).setOrigin(0.5).setResolution(2)

    container.add([face, labelText, captionText])

    let enabled = false
    let pressed = false

    const paint = () => {
        paintAnswerFace(face, ANSWER.w, ANSWER.h, ANSWER.r, { tone, deep, pressed, enabled })
        const dy = pressed ? ANSWER.drop : 0
        labelText.setY(ANSWER.labelDY + dy)
        captionText.setY(ANSWER.captionDY + dy)
    }
    paint()

    const hit = scene.add.zone(x, y, ANSWER.w + 24, ANSWER.h + 24).setOrigin(0.5).setDepth(40)
    hit.setInteractive({ useHandCursor: true })

    hit.on('pointerover', () => {
        if (!enabled) return
        FX.to(scene, container, { scale: 1.05 }, { duration: 110 })
        onFocus?.(x, y + ANSWER.gavelDY)
    })
    hit.on('pointerout', () => {
        if (pressed) { pressed = false; paint() }
        if (!enabled) return
        FX.to(scene, container, { scale: 1 }, { duration: 110 })
        onBlur?.()
    })
    hit.on('pointerdown', () => {
        if (!enabled) return
        pressed = true
        paint()
    })
    hit.on('pointerup', () => {
        if (!enabled || !pressed) return
        pressed = false
        paint()
        onBlur?.()
        onClick(value)
    })

    const setEnabled = (on: boolean) => {
        // O estado é aplicado SEMPRE, mesmo quando não mudou. Basta o visual e
        // a flag saírem de sincronia uma vez para o botão ficar morto até o
        // fim da fase — e a criança não tem como saber o que aconteceu.
        enabled = on
        pressed = false
        paint()
        container.setAlpha(on ? 1 : A.dim)
        if (hit.input) hit.input.cursor = on ? 'pointer' : 'default'
    }

    return {
        container,
        value,
        setEnabled,
        isEnabled: () => enabled,
        retract: () => FX.to(scene, container,
            { y: y + 54, alpha: 0 }, { duration: 220, ease: Ease.anticipate(1.1) }),
        restore: () => {
            container.setPosition(x, y + 54)
            return FX.to(scene, container, { y, alpha: 1 }, { duration: 260, ease: Ease.back(1.4) })
        },
        celebrate: async () => {
            await FX.impact(scene, container, 0.16)
            await FX.sparks(scene, x, y, { color: tone, count: 18, spread: 150 })
        },
        reject: () => FX.shake(scene, container, { amount: 12, times: 4 }),
        destroy: () => { hit.destroy(); container.destroy() },
    }
}

/* ═══════════════════════════════════════════════════════════ martelo */

export interface Gavel {
    point(x: number, y: number): void
    hide(): void
    /** Batida do veredicto sobre o cartão. */
    strike(x: number, y: number): Promise<void>
    destroy(): void
}

export function createGavel(scene: Phaser.Scene): Gavel {
    if (!scene.textures.exists('hammer')) {
        // Sem a arte, o jogo continua: o martelo é adorno, não mecânica.
        return { point: () => { }, hide: () => { }, strike: async () => { }, destroy: () => { } }
    }

    const img = scene.add.image(0, 0, 'hammer')
        .setDisplaySize(ANSWER.gavelSize, ANSWER.gavelSize)
        .setDepth(120)
        .setAlpha(0)

    return {
        point: (x, y) => {
            FX.kill(scene, img)
            img.setPosition(x, y).setAlpha(1).setAngle(-34).setScale(img.scale)
            scene.tweens.add({
                targets: img, angle: -6, duration: 240,
                yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
            })
        },
        hide: () => {
            FX.kill(scene, img)
            img.setAlpha(0)
        },
        strike: async (x, y) => {
            FX.kill(scene, img)
            img.setPosition(x, y - 120).setAlpha(1).setAngle(-52)
            await FX.to(scene, img, { y, angle: 4 }, { duration: 180, ease: Ease.anticipate(1.6) })
            FX.shakeCam(scene, 'leve')
            await FX.to(scene, img, { y: y - 130, angle: -50, alpha: 0 }, { duration: 260 })
        },
        destroy: () => img.destroy(),
    }
}

/* ══════════════════════════════════════════════════════ cartão de sentença */

export interface SentenceCard {
    container: Phaser.GameObjects.Container
    /** Mede, redesenha e escreve a frase. Resolve quando o texto termina. */
    show(sentence: LogicSentence): Promise<void>
    /** Completa a digitação na hora (usado quando a criança responde antes). */
    skipTyping(): void
    /** Altura atual, para posicionar o que vem abaixo. */
    height(): number
    flash(tone: number): Promise<void>
    destroy(): void
}

export function createSentenceCard(scene: Phaser.Scene): SentenceCard {
    const container = scene.add.container(CARD.cx, CARD.cy).setDepth(20)

    const surface = scene.add.graphics()

    const source = scene.add.text(0, 0, '', {
        fontFamily: FONT.body, fontStyle: 'bold', fontSize: SIZE.cardSource,
        color: hex(C.brass),
    }).setOrigin(0, 0.5).setResolution(2)

    const body = scene.add.text(0, 0, '', {
        fontFamily: FONT.body, fontStyle: 'bold', fontSize: SIZE.cardText,
        color: hex(C.cream), align: 'center',
        wordWrap: { width: CARD.wrap }, lineSpacing: 10,
    }).setOrigin(0.5).setResolution(2)

    const badge = scene.add.container(0, 0).setAlpha(0)
    const badgeBg = scene.add.graphics()
    badgeBg.fillStyle(C.red, 0.96)
    badgeBg.fillRoundedRect(-BADGE.w / 2, -BADGE.h / 2, BADGE.w, BADGE.h, BADGE.r)
    badgeBg.fillStyle(C.white, 0.2)
    badgeBg.fillRoundedRect(-BADGE.w / 2 + 8, -BADGE.h / 2 + 5, BADGE.w - 16, 11, 6)
    badgeBg.lineStyle(3, C.white, 0.92)
    badgeBg.strokeRoundedRect(-BADGE.w / 2, -BADGE.h / 2, BADGE.w, BADGE.h, BADGE.r)
    const badgeText = scene.add.text(0, 0, '⚠ Atenção ao NÃO', {
        fontFamily: FONT.black, fontSize: SIZE.badge, color: hex(C.white),
    }).setOrigin(0.5).setResolution(2)
    badge.add([badgeBg, badgeText])

    container.add([surface, source, body, badge])

    let typing: { skip: () => void } | null = null
    let currentH = CARD.minH
    let badgePulse: Phaser.Tweens.Tween | undefined

    /**
     * Mede com o texto COMPLETO antes de escrever.
     *
     * Se a medida saísse durante a digitação, o cartão cresceria letra a
     * letra e o texto ficaria pulando dentro dele — que era o efeito de
     * "cartão tremendo" da primeira tentativa.
     */
    const layoutFor = (sentence: LogicSentence) => {
        body.setFontSize(sentence.text.length > LONG_SENTENCE ? SIZE.cardTextLong : SIZE.cardText)
        body.setText(sentence.text)

        const h = Phaser.Math.Clamp(
            CARD.headerH + body.height + CARD.pad * 2,
            CARD.minH,
            CARD.maxH,
        )
        const top = -h / 2

        paintSentenceCard(surface, CARD.w, h, CARD.r, CARD.headerH)
        source.setPosition(-CARD.w / 2 + CARD.pad, top + CARD.headerH / 2)
        body.setPosition(0, top + CARD.headerH + (h - CARD.headerH) / 2)
        badge.setPosition(CARD.w / 2 - BADGE.inset - BADGE.w / 2, top + CARD.headerH / 2)

        body.setText('')
        currentH = h
        return h
    }

    return {
        container,

        show: async (sentence) => {
            typing?.skip()
            badgePulse?.remove()
            badgePulse = undefined

            layoutFor(sentence)
            source.setText(sentence.source)

            badge.setAlpha(sentence.hasNegation ? 1 : 0)
            if (sentence.hasNegation) {
                badge.setScale(0.7)
                FX.to(scene, badge, { scale: 1 }, { duration: 260, ease: Ease.back(2.2) })
                badgePulse = FX.breathe(scene, badge, { grow: 1.06, duration: 950 })
            }

            FX.kill(scene, container)
            container.setScale(0.96).setAlpha(0)
            await FX.to(scene, container, { scale: 1, alpha: 1 }, { duration: 240, ease: Ease.back(1.6) })

            const tw = FX.type(scene, body, sentence.text, { delay: TYPE_MS.sentence })
            typing = tw
            await tw
            typing = null
        },

        skipTyping: () => typing?.skip(),

        height: () => currentH,

        flash: async (tone) => {
            const glow = scene.add.graphics().setDepth(21)
            glow.lineStyle(8, tone, 1)
            glow.strokeRoundedRect(
                CARD.cx - CARD.w / 2, CARD.cy - currentH / 2, CARD.w, currentH, CARD.r,
            )
            await FX.to(scene, glow, { alpha: 0 }, { duration: 520 })
            glow.destroy()
        },

        destroy: () => {
            typing?.skip()
            badgePulse?.remove()
            container.destroy()
        },
    }
}

/* ════════════════════════════════════════════════════════════ cronômetro */

export interface TimerBar {
    set(progress: number): void
    destroy(): void
}

export function createTimerBar(scene: Phaser.Scene): TimerBar {
    const left = TIMER.cx - TIMER.w / 2

    const track = scene.add.graphics().setDepth(18)
    track.fillStyle(C.shadow, 0.34)
    track.fillRoundedRect(left - 5, TIMER.y - 5, TIMER.w + 10, TIMER.h + 10, TIMER.r + 5)
    track.fillStyle(C.woodMid, 1)
    track.fillRoundedRect(left, TIMER.y, TIMER.w, TIMER.h, TIMER.r)
    track.lineStyle(3, C.brass, 0.8)
    track.strokeRoundedRect(left, TIMER.y, TIMER.w, TIMER.h, TIMER.r)

    const fill = scene.add.graphics().setDepth(19)
    let panicking = false
    let pulse: Phaser.Tweens.Tween | undefined

    const set = (progress: number) => {
        const p = Phaser.Math.Clamp(progress, 0, 1)
        const width = TIMER.w * p
        const tone = p > TIMER.warnAt ? C.green : p > TIMER.panicAt ? C.amber : C.red

        fill.clear()
        if (width > 2) {
            // O raio nunca passa de metade da largura: com a barra quase vazia
            // o arredondamento estourava e o resto virava uma bolha.
            const r = Math.min(TIMER.r, width / 2)
            fill.fillStyle(tone, 1)
            fill.fillRoundedRect(left, TIMER.y, width, TIMER.h, r)
            fill.fillStyle(C.white, 0.24)
            fill.fillRoundedRect(left + 6, TIMER.y + 5, Math.max(4, width - 12), 8, 4)
        }

        // Pulsar só na faixa vermelha, e só uma vez: reinstalar o tween a cada
        // frame do onUpdate criava dezenas de tweens no mesmo alvo.
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
        destroy: () => { pulse?.remove(); fill.destroy(); track.destroy() },
    }
}

/* ══════════════════════════════════════════════════════════ explicação */

export interface ExplanationPanel {
    container: Phaser.GameObjects.Container
    /** Fecha antes da hora (troca de tela). Seguro de chamar duas vezes. */
    close(): Promise<void>
    destroy(): void
}

/**
 * Painel de raciocínio, na faixa que os botões acabaram de liberar.
 *
 * As linhas entram em cascata em vez de aparecerem prontas. A ordem importa
 * pedagogicamente: primeiro o que a frase afirma, depois se aquilo é verdade,
 * depois o efeito do NÃO, e só então o veredicto. Vendo as quatro chegarem
 * uma a uma, a criança acompanha o argumento; chegando juntas, ela lê só a
 * última linha.
 */
export function showExplanation(
    scene: Phaser.Scene,
    sentence: LogicSentence,
    depth = 70,
): ExplanationPanel {
    const accent = sentence.correctValue ? C.green : C.red
    const h = sentence.hasNegation ? EXPLAIN.negationH : EXPLAIN.baseH

    const container = scene.add.container(EXPLAIN.cx, EXPLAIN.cy).setDepth(depth)

    const bg = scene.add.graphics()
    paintPanel(bg, EXPLAIN.w, h, EXPLAIN.r, accent)
    container.add(bg)

    const rows: Array<[string, string, number]> = [
        ['A frase afirma:', sentence.core, C.slate],
        ['Isso é:', sentence.coreValue ? 'VERDADE' : 'MENTIRA', sentence.coreValue ? C.greenDeep : C.redDeep],
    ]
    if (sentence.hasNegation) {
        rows.push(['Mas tem o NÃO:', 'a negação inverte o valor', C.amberDeep])
    }
    rows.push([
        'Logo, a frase é:',
        sentence.correctValue ? 'VERDADEIRA' : 'FALSA',
        sentence.correctValue ? C.greenDeep : C.redDeep,
    ])

    const left = -EXPLAIN.w / 2 + EXPLAIN.padX
    const firstY = -h / 2 + 40
    const lines: Phaser.GameObjects.Container[] = []

    rows.forEach(([label, value, tone], i) => {
        const row = scene.add.container(0, firstY + i * EXPLAIN.rowH)

        row.add(scene.add.text(left, 0, label, {
            fontFamily: FONT.body, fontStyle: 'bold', fontSize: SIZE.explainLabel,
            color: hex(C.muted),
        }).setOrigin(0, 0.5).setResolution(2))

        row.add(scene.add.text(left + EXPLAIN.labelW, 0, value, {
            fontFamily: FONT.black, fontSize: SIZE.explainValue, color: hex(tone),
            wordWrap: { width: EXPLAIN.w - EXPLAIN.padX * 2 - EXPLAIN.labelW },
        }).setOrigin(0, 0.5).setResolution(2))

        container.add(row)
        lines.push(row)
    })

    container.setScale(0.92).setAlpha(0)
    FX.to(scene, container, { scale: 1, alpha: 1 }, { duration: 240, ease: Ease.back(1.8) })
    lines.forEach((row, i) => {
        const restX = row.x
        row.setAlpha(0).setX(restX - 26)
        FX.to(scene, row, { alpha: 1, x: restX }, { duration: 260, delay: 160 + i * 150 })
    })

    let closed = false
    const close = async () => {
        if (closed) return
        closed = true
        await FX.to(scene, container, { alpha: 0, y: EXPLAIN.cy + 16 }, { duration: 220 })
        container.destroy()
    }

    return {
        container,
        close,
        destroy: () => { closed = true; container.destroy() },
    }
}

/* ═══════════════════════════════════════════════════════════ carimbo */

/** Carimbo de veredicto batendo no cartão. Curto, alto e sem texto pequeno. */
export async function stampVerdict(
    scene: Phaser.Scene,
    x: number,
    y: number,
    correct: boolean,
) {
    const tone = correct ? C.green : C.red
    const label = correct ? 'CERTO!' : 'ERRADO'

    const container = scene.add.container(x, y).setDepth(110).setAngle(STAMP.angle)

    const g = scene.add.graphics()
    g.fillStyle(C.white, 0.94)
    g.fillRoundedRect(-STAMP.w / 2, -STAMP.h / 2, STAMP.w, STAMP.h, STAMP.r)
    g.lineStyle(7, tone, 1)
    g.strokeRoundedRect(-STAMP.w / 2, -STAMP.h / 2, STAMP.w, STAMP.h, STAMP.r)
    g.lineStyle(3, tone, 0.5)
    g.strokeRoundedRect(-STAMP.w / 2 + 10, -STAMP.h / 2 + 10, STAMP.w - 20, STAMP.h - 20, STAMP.r - 8)

    const text = scene.add.text(0, 0, label, {
        fontFamily: FONT.black, fontSize: SIZE.stamp, color: hex(tone),
    }).setOrigin(0.5).setResolution(2)

    container.add([g, text])
    container.setScale(2.4).setAlpha(0)

    await FX.to(scene, container, { scale: 1, alpha: 1 }, { duration: 180, ease: Ease.anticipate(1.4) })
    FX.shakeCam(scene, correct ? 'leve' : 'medio')
    await FX.wait(scene, 620)
    await FX.to(scene, container, { alpha: 0, scale: 1.12 }, { duration: 240 })
    container.destroy()
}

/* ═════════════════════════════════════════════════════════════ toast */

export function showToast(
    scene: Phaser.Scene,
    message: string,
    tone: number,
    life = 1900,
) {
    const container = scene.add.container(W / 2, TOAST.hiddenY).setDepth(200)

    const g = scene.add.graphics()
    g.fillStyle(C.shadow, 0.3)
    g.fillRoundedRect(-TOAST.w / 2 + 4, -TOAST.h / 2 + 8, TOAST.w, TOAST.h, TOAST.r)
    g.fillStyle(tone, 0.98)
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
        () => FX.to(scene, container, { y: TOAST.y }, { duration: 320, ease: Ease.back(1.6) }),
        () => FX.wait(scene, life),
        () => FX.to(scene, container, { y: TOAST.hiddenY, alpha: 0 }, { duration: 280 }),
    ).then(() => container.destroy())

    return container
}

/* ═══════════════════════════════════════════════════════════ cenário */

/** Fundo da sala: imagem, véu de contraste e vinheta nas bordas. */
export function paintCourtroom(scene: Phaser.Scene) {
    if (scene.textures.exists('bg-tribunal')) {
        const bg = scene.add.image(W / 2, H / 2, 'bg-tribunal').setDepth(-20)
        bg.setScale(Math.max(W / bg.width, H / bg.height))
    } else {
        scene.add.rectangle(W / 2, H / 2, W, H, C.wood).setDepth(-20)
    }

    // Véu: o fundo é ilustrado e disputa atenção com o cartão. Escurecer
    // resolve sem precisar de outra arte.
    const veil = scene.add.graphics().setDepth(-19)
    veil.fillStyle(C.ink, 0.32)
    veil.fillRect(0, 0, W, H)
    veil.fillStyle(C.ink, 0.2)
    veil.fillRect(0, 0, W, 70)
    veil.fillRect(0, H - 70, W, 70)
}

/** Juiz sobre um estrado, respirando. Sem estrado ele flutua no fundo. */
export function createJudge(scene: Phaser.Scene) {
    const bench = scene.add.graphics().setDepth(1)
    bench.fillStyle(C.shadow, 0.3)
    bench.fillEllipse(JUDGE.x, JUDGE.benchY + 8, JUDGE.benchW, JUDGE.benchH)
    bench.fillStyle(C.woodLight, 0.7)
    bench.fillEllipse(JUDGE.x, JUDGE.benchY, JUDGE.benchW, JUDGE.benchH)

    if (!scene.textures.exists('character-judge')) return bench

    const judge = scene.add.image(JUDGE.x, JUDGE.y, 'character-judge').setDepth(2)
    judge.setScale(Math.min(JUDGE.maxW / judge.width, JUDGE.maxH / judge.height))

    FX.fadeIn(scene, judge, 420)
    FX.float(scene, judge, { amount: JUDGE.floatAmount, duration: JUDGE.floatDuration })

    return judge
}
