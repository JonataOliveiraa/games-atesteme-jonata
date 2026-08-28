import Phaser from 'phaser'
import { Ease, FX, type FxTarget } from '../../../../shared/effects/FX'
import { BIOME, C, CSS, FONT, SIZE, SWATCH } from '../data/theme'
import {
    ALBUM, CAR, CAR_H, COPILOT, DEPTH, GATE, HEADER, HELP, PROGRESS,
    ROAD, SIGN, W, laneLeft, laneWidth, laneX,
} from '../data/layout'
import type { Biome, Candidate, ColorName, ItemDef, Rule, ShapeName } from '../types'

/**
 * Todo desenho deste jogo mora aqui. A GameScene não desenha nada: se ela
 * precisar de um `fillRoundedRect`, é sinal de que falta um painter neste
 * arquivo. Painter que vive dentro de container animável desenha em torno de
 * (0,0) — escalar um Graphics feito em coordenadas de tela joga a peça para
 * fora do mundo.
 */

const fx = (o: unknown) => o as unknown as FxTarget

export const hasTex = (scene: Phaser.Scene, key: string) => scene.textures.exists(key)

function text(
    scene: Phaser.Scene,
    x: number, y: number, value: string,
    size: string, color: string, family = FONT.black,
) {
    return scene.add.text(x, y, value, { fontFamily: family, fontSize: size, color })
        .setOrigin(0.5).setResolution(2)
}

function starPoints(cx: number, cy: number, outer: number, inner: number, tips = 5) {
    const pts: Phaser.Types.Math.Vector2Like[] = []
    for (let i = 0; i < tips * 2; i++) {
        const r = i % 2 === 0 ? outer : inner
        const a = -Math.PI / 2 + (i * Math.PI) / tips
        pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r })
    }
    return pts
}

// ══════════════════════════════════════════════════════ moldura da tela

export function createFrame(scene: Phaser.Scene, biome: Biome) {
    const accent = BIOME[biome].plantLight
    const g = scene.add.graphics().setDepth(DEPTH.hud)

    g.fillStyle(C.ink, 1)
    g.fillRect(0, 0, W, HEADER.h)
    g.fillStyle(C.white, 0.07)
    g.fillRect(0, 0, W, 3)
    g.fillStyle(accent, 1)
    g.fillRect(0, HEADER.h, W, HEADER.accent)
    for (let i = 0; i < 8; i++) {
        g.fillStyle(0x000000, 0.055 - i * 0.006)
        g.fillRect(0, HEADER.h + HEADER.accent + i * 2, W, 2)
    }

    return { destroy: () => g.destroy() }
}

// ══════════════════════════════════════════════════════ pictograma

export function paintPictogram(
    g: Phaser.GameObjects.Graphics,
    rule: Rule,
    cx: number, cy: number, size: number,
) {
    const r = size / 2

    if (rule.kind === 'color') {
        const sw = SWATCH[rule.value as ColorName]
        g.fillStyle(sw.dark, 1)
        g.fillRoundedRect(cx - r, cy - r, size, size, 15)
        g.fillStyle(sw.main, 1)
        g.fillRoundedRect(cx - r + 5, cy - r + 5, size - 10, size - 10, 11)
        g.fillStyle(C.white, 0.6)
        g.fillEllipse(cx - r * 0.3, cy - r * 0.34, size * 0.3, size * 0.2)
        return
    }

    if (rule.kind === 'size') {
        /*
         * Os dois na MESMA LINHA DE BASE, como coisas apoiadas no chão: é
         * assim que o olho compara tamanho. O citado ganha cor e um aro
         * escuro por fora; o outro fica cinza-claro, presente só como régua.
         */
        const wantsBig = rule.value === 'big'
        const baseline = cy + r * 0.66
        const ball = (x: number, rad: number, on: boolean) => {
            const y = baseline - rad
            if (on) {
                g.fillStyle(C.ink, 1)
                g.fillCircle(x, y, rad + 4)
            }
            g.fillStyle(on ? C.warnDark : 0xb4c1cb, 1)
            g.fillCircle(x, y, rad)
            g.fillStyle(on ? C.warn : 0xd6dee5, 1)
            g.fillCircle(x, y - rad * 0.1, rad * 0.84)
            g.fillStyle(C.white, on ? 0.65 : 0.4)
            g.fillEllipse(x - rad * 0.3, y - rad * 0.42, rad * 0.62, rad * 0.36)
        }
        ball(cx - r * 0.62, r * 0.32, !wantsBig)
        ball(cx + r * 0.34, r * 0.54, wantsBig)
        return
    }

    paintShape(g, rule.value as ShapeName, cx, cy, size * 0.94)
}

function paintShape(
    g: Phaser.GameObjects.Graphics,
    shape: ShapeName,
    cx: number, cy: number, size: number,
) {
    const r = size / 2
    const body = C.inkSoft
    const edge = C.ink

    if (shape === 'redondo') {
        g.fillStyle(edge, 1); g.fillCircle(cx, cy, r)
        g.fillStyle(body, 1); g.fillCircle(cx, cy, r - 5)
    } else if (shape === 'quadrado') {
        g.fillStyle(edge, 1); g.fillRoundedRect(cx - r, cy - r, size, size, 12)
        g.fillStyle(body, 1); g.fillRoundedRect(cx - r + 5, cy - r + 5, size - 10, size - 10, 8)
    } else if (shape === 'retangulo') {
        g.fillStyle(edge, 1); g.fillRoundedRect(cx - r, cy - r * 0.62, size, size * 0.62, 10)
        g.fillStyle(body, 1); g.fillRoundedRect(cx - r + 5, cy - r * 0.62 + 5, size - 10, size * 0.62 - 10, 7)
    } else if (shape === 'triangulo') {
        g.fillStyle(edge, 1)
        g.fillPoints([{ x: cx, y: cy - r }, { x: cx + r, y: cy + r * 0.82 }, { x: cx - r, y: cy + r * 0.82 }], true)
        g.fillStyle(body, 1)
        g.fillPoints([{ x: cx, y: cy - r + 9 }, { x: cx + r - 7, y: cy + r * 0.82 - 5 }, { x: cx - r + 7, y: cy + r * 0.82 - 5 }], true)
    } else if (shape === 'estrela') {
        g.fillStyle(edge, 1); g.fillPoints(starPoints(cx, cy, r, r * 0.45), true)
        g.fillStyle(body, 1); g.fillPoints(starPoints(cx, cy, r - 5, r * 0.38), true)
    } else {
        g.fillStyle(edge, 1); g.fillEllipse(cx, cy, size, size * 0.44)
        g.fillStyle(body, 1); g.fillEllipse(cx, cy, size - 10, size * 0.44 - 10)
    }

    g.fillStyle(C.white, 0.35)
    g.fillEllipse(cx - r * 0.3, cy - r * 0.36, size * 0.26, size * 0.16)
}

// ══════════════════════════════════════════════════════ placa da regra

export interface RuleSign {
    set: (rule: Rule) => void
    swap: (rule: Rule) => Promise<void>
    alert: () => Promise<void>
    at: () => { x: number; y: number }
    destroy: () => void
}

export function createRuleSign(scene: Phaser.Scene): RuleSign {
    const halfW = SIGN.w / 2
    const halfH = SIGN.h / 2
    const panelLeft = -halfW + SIGN.tabW
    const panelMid = (panelLeft + halfW) / 2

    const container = scene.add.container(SIGN.x, SIGN.y).setDepth(DEPTH.hud + 2)
    const body = scene.add.graphics()
    const picto = scene.add.graphics()
    const alertRing = scene.add.graphics().setAlpha(0)
    const verb = text(scene, panelLeft / 2 - halfW / 2 + SIGN.tabW / 2, 0, '', SIZE.verb, CSS.white)
    const word = text(scene, panelMid, 0, '', SIZE.ruleWord, CSS.ink)
    verb.setAlign('center').setLineSpacing(-4)
    container.add([body, picto, alertRing, verb, word])

    /*
     * A aba diz sempre PEGUE, porque a ação é sempre pegar. O que muda é o
     * QUE: na regra de negação a aba vira "PEGUE TUDO" e o pictograma ganha
     * um proibido vermelho, com a palavra em vermelho junto. A versão antiga
     * dizia só "NÃO PEGUE ESTRELAS", e isso é lido como "desvie das estrelas"
     * — calado sobre a metade do trabalho que o jogo cobra.
     */
    function paint(rule: Rule) {
        const exclude = rule.mode === 'exclude'
        const tone = C.okDark
        const glow = C.ok

        body.clear()
        body.fillStyle(0x000000, 0.28)
        body.fillRoundedRect(-halfW + 4, -halfH + 7, SIGN.w, SIGN.h, 18)
        body.fillStyle(C.ink, 1)
        body.fillRoundedRect(-halfW, -halfH, SIGN.w, SIGN.h, 18)
        body.fillStyle(C.cream, 1)
        body.fillRoundedRect(-halfW + 5, -halfH + 5, SIGN.w - 10, SIGN.h - 10, 14)
        body.fillStyle(tone, 1)
        body.fillRoundedRect(-halfW + 5, -halfH + 5, SIGN.tabW - 5, SIGN.h - 10,
            { tl: 14, bl: 14, tr: 0, br: 0 })
        body.fillStyle(glow, 0.5)
        body.fillRect(-halfW + 5, -halfH + 5, SIGN.tabW - 5, 5)
        body.fillStyle(C.ink, 0.22)
        body.fillRect(panelLeft, -halfH + 5, 4, SIGN.h - 10)
        body.fillStyle(C.bolt, 1)
        body.fillCircle(halfW - 18, -halfH + 17, 5)
        body.fillCircle(halfW - 18, halfH - 17, 5)

        verb.setFontSize(exclude ? SIZE.verbSmall : SIZE.verb)
        verb.setText(exclude ? 'PEGUE\nTUDO' : 'PEGUE')
        verb.setPosition(-halfW + SIGN.tabW / 2 + 2, 0)

        let px = 32
        word.setFontSize(`${px}px`).setText(rule.word).setColor(exclude ? CSS.bad : CSS.ink)
        const budget = SIGN.w - SIGN.tabW - 28 - 84
        while (word.width > budget && px > 21) {
            px -= 2
            word.setFontSize(`${px}px`)
        }

        const total = 84 + word.width
        const left = panelMid - total / 2
        const iconX = left + 34
        picto.clear()
        paintPictogram(picto, rule, iconX, 0, 56)
        if (exclude) {
            picto.lineStyle(8, C.bad, 1)
            picto.strokeCircle(iconX, 0, 33)
            picto.beginPath()
            picto.moveTo(iconX - 23, 23)
            picto.lineTo(iconX + 23, -23)
            picto.strokePath()
        }
        word.setPosition(left + 84 + word.width / 2, 1)

        alertRing.clear()
        alertRing.lineStyle(6, C.bad, 1)
        alertRing.strokeRoundedRect(-halfW - 6, -halfH - 6, SIGN.w + 12, SIGN.h + 12, 22)
    }

    return {
        set: paint,
        swap: (rule: Rule) => FX.flip(scene, fx(container), () => paint(rule), 460),
        alert: async () => {
            await FX.all(
                FX.to(scene, fx(alertRing), { alpha: 1 }, { duration: 130, yoyo: true, repeat: 2 }),
                FX.shake(scene, fx(container), { amount: 8 }),
            )
            alertRing.setAlpha(0)
        },
        at: () => ({ x: SIGN.x, y: SIGN.y }),
        destroy: () => container.destroy(),
    }
}

// ══════════════════════════════════════════════════════ nível e trechos

/**
 * O indicador do Ateliê de Códigos Digitais: uma pílula com `NÍVEL x/3` e uma
 * fileira de bolinhas para os trechos — cheia é trecho vencido, comprimida é
 * o de agora, apagada é o que falta.
 */
export function createProgress(scene: Phaser.Scene, stretches: number) {
    const container = scene.add.container(0, 0).setDepth(DEPTH.hud + 2)
    const pill = scene.add.graphics()
    const label = text(
        scene,
        PROGRESS.pillX + PROGRESS.pillW / 2, PROGRESS.cy,
        'NÍVEL 1/3', SIZE.hudLevel, CSS.cream,
    )
    container.add([pill, label])

    pill.fillStyle(0x000000, 0.3)
    pill.fillRoundedRect(PROGRESS.pillX + 2, PROGRESS.pillY + 4,
        PROGRESS.pillW, PROGRESS.pillH, PROGRESS.pillH / 2)
    pill.fillStyle(C.inkSoft, 1)
    pill.fillRoundedRect(PROGRESS.pillX, PROGRESS.pillY,
        PROGRESS.pillW, PROGRESS.pillH, PROGRESS.pillH / 2)
    pill.fillStyle(C.white, 0.2)
    pill.fillRoundedRect(PROGRESS.pillX + 12, PROGRESS.pillY + 6,
        PROGRESS.pillW - 24, 12, 6)

    const marks: { holder: Phaser.GameObjects.Container; g: Phaser.GameObjects.Graphics }[] = []
    for (let i = 0; i < stretches; i++) {
        const holder = scene.add.container(PROGRESS.dotsX + i * PROGRESS.gap, PROGRESS.cy)
        const g = scene.add.graphics()
        holder.add(g)
        container.add(holder)
        marks.push({ holder, g })
    }

    function paintDot(g: Phaser.GameObjects.Graphics, state: 'done' | 'now' | 'next') {
        g.clear()
        if (state === 'done') {
            g.fillStyle(C.ok, 1)
            g.fillCircle(0, 0, PROGRESS.dotR)
            g.lineStyle(2, C.white, 0.85)
            g.strokeCircle(0, 0, PROGRESS.dotR)
            return
        }
        if (state === 'now') {
            g.fillStyle(C.warn, 1)
            g.fillRoundedRect(-15, -9, 30, 18, 9)
            g.lineStyle(2, C.white, 0.9)
            g.strokeRoundedRect(-15, -9, 30, 18, 9)
            return
        }
        g.fillStyle(C.white, 0.2)
        g.fillCircle(0, 0, PROGRESS.dotR)
    }

    let pulsing: Phaser.GameObjects.Container | null = null

    return {
        setLevel(level: number, total: number) {
            label.setText(`NÍVEL ${level}/${total}`)
        },
        set(done: number, current: number) {
            marks.forEach((mark, i) => {
                paintDot(mark.g, i < done ? 'done' : i === current ? 'now' : 'next')
            })
            if (pulsing) {
                FX.kill(scene, fx(pulsing))
                pulsing.setScale(1)
            }
            const target = marks[current]?.holder
            if (target) {
                pulsing = target
                FX.breathe(scene, fx(target), { grow: 1.18, duration: 820 })
            }
        },
        celebrate(index: number) {
            const mark = marks[index]
            return mark ? FX.impact(scene, fx(mark.holder), 0.3) : Promise.resolve()
        },
        destroy() {
            if (pulsing) FX.kill(scene, fx(pulsing))
            container.destroy()
        },
    }
}

// ══════════════════════════════════════════════════════ botão de ajuda

export function createHelpButton(scene: Phaser.Scene, onTap: () => void) {
    const container = scene.add.container(HELP.x, HELP.y).setDepth(DEPTH.hud + 2)
    const g = scene.add.graphics()
    const mark = text(scene, 0, 1, '?', '32px', CSS.ink)
    container.add([g, mark])

    g.fillStyle(0x000000, 0.24)
    g.fillCircle(2, 4, HELP.r)
    g.fillStyle(C.cream, 1)
    g.fillCircle(0, 0, HELP.r)
    g.fillStyle(C.white, 0.7)
    g.fillEllipse(-6, -10, HELP.r * 0.9, HELP.r * 0.5)

    const zone = scene.add.zone(HELP.x, HELP.y, HELP.r * 2 + 12, HELP.r * 2 + 12)
        .setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(DEPTH.hud + 3)
    zone.on('pointerdown', () => {
        FX.press(scene, fx(container))
        onTap()
    })

    return {
        setEnabled: (on: boolean) => {
            zone.input!.enabled = on
            container.setAlpha(on ? 1 : 0.45)
        },
        destroy: () => { zone.destroy(); container.destroy() },
    }
}

// ══════════════════════════════════════════════════════ o copiloto

export type Mood = 'calm' | 'happy' | 'oops'

/**
 * O recado tem endereço fixo no painel do carro. Ele NÃO some sozinho: fica
 * até haver outra coisa a dizer, então ninguém precisa ler correndo.
 */
export function createCopilot(scene: Phaser.Scene) {
    const halfW = COPILOT.w / 2
    const halfH = COPILOT.h / 2
    const plate = scene.add.container(COPILOT.x, COPILOT.y).setDepth(DEPTH.hud)
    const board = scene.add.graphics()
    const face = scene.add.container(-halfW + 44, 0)
    const g = scene.add.graphics()
    face.add(g)

    board.fillStyle(0x000000, 0.26)
    board.fillRoundedRect(-halfW + 4, -halfH + 7, COPILOT.w, COPILOT.h, 24)
    board.fillStyle(C.ink, 1)
    board.fillRoundedRect(-halfW, -halfH, COPILOT.w, COPILOT.h, 24)
    board.fillStyle(C.cream, 1)
    board.fillRoundedRect(-halfW + 5, -halfH + 5, COPILOT.w - 10, COPILOT.h - 10, 20)
    board.fillStyle(C.white, 0.7)
    board.fillRoundedRect(-halfW + 12, -halfH + 11, COPILOT.w - 24, 12, 6)

    const line = scene.add.text(-halfW + 76, 0, '', {
        fontFamily: FONT.black,
        fontSize: SIZE.copilot,
        color: CSS.ink,
        wordWrap: { width: COPILOT.w - 100 },
        lineSpacing: 3,
    }).setOrigin(0, 0.5).setResolution(2)

    plate.add([board, line, face])

    function paintFace(mood: Mood) {
        g.clear()
        g.fillStyle(C.warnDark, 1); g.fillCircle(0, 2, 21)
        g.fillStyle(C.warn, 1); g.fillCircle(0, 0, 20)
        g.fillStyle(C.white, 0.5); g.fillEllipse(-6, -8, 16, 9)
        g.fillStyle(C.ink, 1)
        if (mood === 'oops') {
            g.fillRect(-11, -6, 8, 3)
            g.fillRect(3, -6, 8, 3)
            g.fillCircle(0, 9, 5)
        } else {
            g.fillCircle(-7, -4, 3.4)
            g.fillCircle(7, -4, 3.4)
            if (mood === 'happy') {
                g.fillEllipse(0, 7, 18, 12)
                g.fillStyle(C.warn, 1)
                g.fillRect(-9, 1, 18, 5)
            } else {
                g.fillRoundedRect(-7, 6, 14, 4, 2)
            }
        }
    }

    paintFace('calm')

    return {
        say(message: string, mood: Mood = 'calm') {
            paintFace(mood)
            line.setText(message)
            FX.kill(scene, fx(face))
            face.setScale(1)
            return FX.impact(scene, fx(face), mood === 'calm' ? 0.1 : 0.26)
        },
        destroy() { FX.kill(scene, fx(face)); plate.destroy() },
    }
}

// ══════════════════════════════════════════════════════ ícone de item

/**
 * Sempre um container: assim item caindo, carga na traseira e figurinha do
 * álbum são a mesma peça, e escalar qualquer uma delas é seguro.
 */
export function createItemIcon(
    scene: Phaser.Scene,
    def: ItemDef,
    size: number,
    aura = false,
) {
    const container = scene.add.container(0, 0)

    // No nível 1 quem combina com a placa vem com um halo respirando: a
    // criança aprende a regra vendo, antes de precisar ler a placa.
    if (aura) {
        const halo = scene.add.graphics()
        halo.fillStyle(C.ok, 0.16)
        halo.fillCircle(0, 0, size * 0.86)
        halo.fillStyle(C.ok, 0.24)
        halo.fillCircle(0, 0, size * 0.68)
        halo.lineStyle(5, C.ok, 0.9)
        halo.strokeCircle(0, 0, size * 0.74)
        container.add(halo)
        FX.breathe(scene, fx(halo), { grow: 1.16, duration: 760 })
    }

    if (hasTex(scene, def.sheet)) {
        const sprite = scene.add.sprite(0, 0, def.sheet, def.frame).setScale(size / 300)
        container.add(sprite)
        return container
    }

    const g = scene.add.graphics()
    const sw = SWATCH[def.color]
    const rule: Rule = { mode: 'include', kind: 'shape', value: def.shape, word: '' }
    paintShape(g, def.shape, 0, 0, size)
    g.fillStyle(sw.main, 0.85)
    g.fillCircle(0, 0, size * 0.22)
    void rule
    container.add(g)
    return container
}

// ══════════════════════════════════════════════════════ o carro

export function createCar(scene: Phaser.Scene, lanes: number, startLane: number) {
    let current = startLane
    const container = scene.add.container(laneX(startLane, lanes), CAR.y).setDepth(DEPTH.car)
    const shadow = scene.add.graphics()

    shadow.fillStyle(0x000000, 0.26)
    shadow.fillEllipse(6, 12, CAR.w * 1.02, CAR_H * 0.9)
    container.add(shadow)

    if (hasTex(scene, 'carro')) {
        container.add(scene.add.image(0, 0, 'carro').setScale(CAR.w / CAR.sheetW))
    } else {
        const g = scene.add.graphics()
        g.fillStyle(0xd96a12, 1)
        g.fillRoundedRect(-CAR.w / 2, -CAR_H / 2, CAR.w, CAR_H, 26)
        g.fillStyle(0xff9f2e, 1)
        g.fillRoundedRect(-CAR.w / 2 + 6, -CAR_H / 2 + 6, CAR.w - 12, CAR_H - 12, 22)
        g.fillStyle(0x2e9bf0, 1)
        g.fillRoundedRect(-CAR.w / 2 + 18, -CAR_H / 2 + 20, CAR.w - 36, 34, 12)
        g.fillRoundedRect(-CAR.w / 2 + 18, CAR_H / 2 - 56, CAR.w - 36, 30, 12)
        container.add(g)
    }

    return {
        lane: () => current,
        at: () => ({ x: container.x, y: container.y }),
        laneCount: () => lanes,

        moveTo(lane: number) {
            if (lane === current) return Promise.resolve()
            const dir = Math.sign(lane - current)
            current = lane
            return FX.all(
                FX.to(scene, fx(container), { x: laneX(lane, lanes) }, { duration: 240, ease: Ease.back(1.5) }),
                FX.seq(
                    () => FX.to(scene, fx(container), { angle: dir * 9 }, { duration: 110 }),
                    () => FX.to(scene, fx(container), { angle: 0 }, { duration: 170, ease: Ease.settle }),
                ),
            )
        },

        bounce: () => FX.impact(scene, fx(container), 0.14),
        nudge: () => FX.shake(scene, fx(container), { amount: 7, times: 2 }),
        driveOff: () => FX.to(scene, fx(container), { y: -CAR_H }, { duration: 900, ease: 'Quad.easeIn' }),
        destroy() { FX.kill(scene, fx(container)); container.destroy() },
    }
}

// ══════════════════════════════════════════════════════ portal do trecho

export function createGate(
    scene: Phaser.Scene,
    kind: 'stretch' | 'rule',
    label: string,
    y: number,
) {
    const container = scene.add.container(ROAD.x + ROAD.w / 2, y).setDepth(DEPTH.gate)
    const g = scene.add.graphics()
    const caption = text(scene, 0, -GATE.h / 2 - 22, label, SIZE.stretch, CSS.cream)
    caption.setStroke(CSS.ink, 7)
    container.add([g, caption])

    const half = ROAD.w / 2
    const cell = GATE.h / 2
    const cols = Math.ceil(ROAD.w / cell)

    g.fillStyle(0x000000, 0.22)
    g.fillRect(-half + 4, -GATE.h / 2 + 6, ROAD.w, GATE.h)

    if (kind === 'rule') {
        g.fillStyle(C.warn, 1)
        g.fillRect(-half, -GATE.h / 2, ROAD.w, GATE.h)
        g.fillStyle(C.ink, 1)
        for (let i = 0; i < cols + 2; i++) {
            g.fillPoints([
                { x: -half + i * cell - cell, y: -GATE.h / 2 },
                { x: -half + i * cell, y: -GATE.h / 2 },
                { x: -half + i * cell - cell * 0.5, y: GATE.h / 2 },
                { x: -half + i * cell - cell * 1.5, y: GATE.h / 2 },
            ], true)
        }
    } else {
        for (let row = 0; row < 2; row++) {
            for (let col = 0; col < cols; col++) {
                g.fillStyle((row + col) % 2 === 0 ? C.cream : C.ink, 1)
                g.fillRect(-half + col * cell, -GATE.h / 2 + row * cell, cell, cell)
            }
        }
    }

    return {
        setY: (value: number) => container.setY(value),
        y: () => container.y,
        destroy: () => container.destroy(),
    }
}

// ══════════════════════════════════════════════════════ faixa acesa

/** Depois de dois erros no mesmo item, a faixa certa acende. */
export function createLaneHint(scene: Phaser.Scene, lanes: number) {
    const g = scene.add.graphics().setDepth(DEPTH.item - 1).setAlpha(0)
    let running = false

    return {
        show(list: number[]) {
            g.clear()
            const width = laneWidth(lanes)
            for (const lane of list) {
                const x = laneLeft(lane, lanes)
                g.fillStyle(C.warn, 0.3)
                g.fillRect(x + 6, ROAD.top, width - 12, CAR.y - ROAD.top)
                g.lineStyle(6, C.warn, 0.85)
                g.strokeRect(x + 6, ROAD.top, width - 12, CAR.y - ROAD.top)
            }
            if (running) return
            running = true
            FX.to(scene, fx(g), { alpha: 1 }, { duration: 420, yoyo: true, repeat: -1 })
        },
        hide() {
            running = false
            FX.kill(scene, fx(g))
            g.setAlpha(0)
            g.clear()
        },
        destroy() { FX.kill(scene, fx(g)); g.destroy() },
    }
}

// ══════════════════════════════════════════════════════ cadeado da trava

export function createLock(scene: Phaser.Scene) {
    const container = scene.add.container(0, 0).setDepth(DEPTH.fx).setVisible(false)
    const g = scene.add.graphics()
    container.add(g)

    g.fillStyle(0x000000, 0.25); g.fillRoundedRect(-24, -14, 52, 44, 10)
    g.lineStyle(9, C.cream, 1); g.beginPath()
    g.arc(0, -18, 16, Math.PI, 0, false); g.strokePath()
    g.fillStyle(C.bad, 1); g.fillRoundedRect(-26, -16, 52, 44, 10)
    g.fillStyle(C.badDark, 1); g.fillCircle(0, 4, 7)
    g.fillRect(-3, 4, 6, 13)

    return {
        showAt(x: number, y: number) {
            container.setPosition(x, y).setVisible(true).setScale(0.4).setAlpha(1)
            return FX.seq(
                () => FX.to(scene, fx(container), { scale: 1 }, { duration: 240, ease: Ease.back(3) }),
                () => FX.to(scene, fx(container), { angle: 8 }, { duration: 90, yoyo: true, repeat: 3 }),
            )
        },
        hide() {
            FX.kill(scene, fx(container))
            container.setVisible(false).setAngle(0)
        },
        destroy() { FX.kill(scene, fx(container)); container.destroy() },
    }
}



// ══════════════════════════════════════════════════════ fumaça do escapamento

export function puff(scene: Phaser.Scene, x: number, y: number, color: number) {
    const dot = scene.add
        .circle(x, y, Phaser.Math.Between(7, 13), color, 0.42)
        .setDepth(DEPTH.car - 1)
    void FX.to(scene, fx(dot), {
        y: y + Phaser.Math.Between(28, 58),
        scale: Phaser.Math.FloatBetween(1.7, 2.5),
        alpha: 0,
    }, { duration: 440 }).then(() => dot.destroy())
}

// ══════════════════════════════════════════════════════ o álbum do grupo

/**
 * A comemoração do fim do nível acontece NO MUNDO: as peças que a criança
 * recolheu se alinham sob a frase que nomeia o grupo, uma a uma, com faísca.
 * Só depois disso entra o painel de fim de nível padrão do projeto — este
 * momento é o do conteúdo, aquele é o da navegação.
 */
export function createAlbum(scene: Phaser.Scene) {
    const parts: Phaser.GameObjects.GameObject[] = []

    return {
        async show(items: Candidate[], headline: string, stars: number) {
            const title = text(scene, W / 2, ALBUM.titleY, headline, '34px', CSS.cream)
            title.setStroke(CSS.ink, 9).setDepth(DEPTH.fx).setScale(0.6).setAlpha(0)
            parts.push(title)

            const shown = items.slice(-8)
            const icons = shown.map((entry, i) => {
                const x = W / 2 + (i - (shown.length - 1) / 2) * ALBUM.gap
                const icon = createItemIcon(scene, entry.def, ALBUM.size)
                icon.setPosition(x, ALBUM.y).setDepth(DEPTH.fx).setScale(0)
                parts.push(icon)
                return icon
            })

            await FX.to(scene, fx(title), { scale: 1, alpha: 1 },
                { duration: 380, ease: Ease.back(2.2) })

            await FX.stagger(scene, icons.map(fx), async target => {
                await FX.to(scene, target, { scale: 1 }, { duration: 250, ease: Ease.back(2.6) })
                void FX.sparks(scene, target.x, target.y,
                    { color: C.warn, count: 9, spread: 84, duration: 520 })
            }, 105)

            const medals: Phaser.GameObjects.Graphics[] = []
            for (let i = 0; i < 3; i++) {
                const on = i < stars
                const star = scene.add.graphics().setDepth(DEPTH.fx).setScale(0)
                star.fillStyle(on ? C.warnDark : 0x5a6a78, 1)
                star.fillPoints(starPoints(0, 0, 32, 13), true)
                star.fillStyle(on ? C.warn : 0x76858f, 1)
                star.fillPoints(starPoints(0, -2, 27, 11), true)
                star.setPosition(W / 2 + (i - 1) * 84, ALBUM.y + 106)
                medals.push(star)
                parts.push(star)
            }
            await FX.stagger(scene, medals.map(fx), target =>
                FX.to(scene, target, { scale: 1 }, { duration: 300, ease: Ease.back(3) }), 170)
        },

        async hide() {
            const list = parts.splice(0)
            if (!list.length) return
            await FX.to(scene, list.map(fx), { alpha: 0, scale: 0.72 }, { duration: 280 })
            list.forEach(part => part.destroy())
        },

        destroy() {
            parts.splice(0).forEach(part => part.destroy())
        },
    }
}
