import Phaser from 'phaser'
import { C, GLASSES, HAT, HAT_DARK, TONE } from '../data/theme'
import { ICON_BOX, ICON_FRAME, ICON_SHEET, TINTED } from '../data/icons'
import type { ColorValue, CritterDef, Value } from '../types'

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  OS PINTORES — tudo desenhado em torno de (0, 0)
 * ══════════════════════════════════════════════════════════════════════════
 *
 *  Nenhum pintor daqui desenha em coordenada de tela: quem posiciona é o
 *  container. É o que permite dar `FX.popIn` numa carta sem ela voar para
 *  fora da mesa.
 *
 *  Não há um único PNG neste jogo. O bichinho é geometria porque a regra LÊ
 *  essa geometria: o realce que pulsa na cor, no chapéu e nos óculos sai das
 *  mesmas âncoras que o desenho usa.
 */

/** Onde cada atributo mora, no corpo do bichinho, antes da escala. */
export const ANCHOR: Record<'color' | 'hat' | 'glasses' | 'size', { x: number; y: number }> = {
    color: { x: 0, y: 38 },
    hat: { x: 0, y: -120 },
    glasses: { x: 0, y: -16 },
    /* o tamanho se lê no ALTO dele, que é o que a régua compara */
    size: { x: 0, y: -150 },
}

const lighten = (color: number, amount: number) =>
    Phaser.Display.Color.ValueToColor(color).lighten(amount).color

const darken = (color: number, amount: number) =>
    Phaser.Display.Color.ValueToColor(color).darken(amount).color

/* ──────────────────────────────── o bichinho ──────────────────────────── */

export function drawCritter(
    g: Phaser.GameObjects.Graphics,
    critter: CritterDef,
    { blink = false, happy = false } = {},
) {
    g.clear()

    const tone = TONE[critter.color]
    const deep = darken(tone, 16)
    const soft = lighten(tone, 30)

    /* pés */
    g.fillStyle(deep, 1)
    g.fillEllipse(-48, 94, 56, 28)
    g.fillEllipse(48, 94, 56, 28)

    /* orelhas */
    g.fillStyle(tone, 1)
    g.fillEllipse(-60, -76, 54, 68)
    g.fillEllipse(60, -76, 54, 68)
    g.fillStyle(soft, 1)
    g.fillEllipse(-60, -74, 26, 38)
    g.fillEllipse(60, -74, 26, 38)

    /* corpo */
    g.fillStyle(tone, 1)
    g.fillEllipse(0, 0, 188, 174)

    /* barriga — é ela que a criança olha quando a carta fala de COR */
    g.fillStyle(soft, 1)
    g.fillEllipse(0, 30, 116, 90)

    /* olhos */
    const eyeY = -16
    g.fillStyle(C.white, 1)
    g.fillCircle(-36, eyeY, 26)
    g.fillCircle(36, eyeY, 26)

    if (blink) {
        g.lineStyle(7, C.ink, 1)
        g.beginPath()
        g.arc(-36, eyeY, 16, Phaser.Math.DegToRad(20), Phaser.Math.DegToRad(160))
        g.strokePath()
        g.beginPath()
        g.arc(36, eyeY, 16, Phaser.Math.DegToRad(20), Phaser.Math.DegToRad(160))
        g.strokePath()
    } else {
        g.fillStyle(C.ink, 1)
        g.fillCircle(-34, eyeY + 3, 13)
        g.fillCircle(38, eyeY + 3, 13)
        g.fillStyle(C.white, 1)
        g.fillCircle(-29, eyeY - 3, 5)
        g.fillCircle(43, eyeY - 3, 5)
    }

    /* bochechas */
    g.fillStyle(0xff9c9c, 0.45)
    g.fillEllipse(-66, 16, 30, 20)
    g.fillEllipse(66, 16, 30, 20)

    /* boca */
    g.lineStyle(6, C.ink, 1)
    g.beginPath()
    if (happy) g.arc(0, 18, 26, Phaser.Math.DegToRad(20), Phaser.Math.DegToRad(160))
    else g.arc(0, 14, 18, Phaser.Math.DegToRad(25), Phaser.Math.DegToRad(155))
    g.strokePath()

    /* óculos — sempre do mesmo preto, em todos os bichos */
    if (critter.glasses) {
        g.lineStyle(7, GLASSES, 1)
        g.strokeCircle(-36, eyeY, 31)
        g.strokeCircle(36, eyeY, 31)
        g.beginPath()
        g.moveTo(-5, eyeY)
        g.lineTo(5, eyeY)
        g.strokePath()
    }

    /* chapéu — sempre do mesmo marrom, em todos os bichos */
    if (critter.hat) {
        g.fillStyle(HAT_DARK, 1)
        g.fillEllipse(0, -100, 146, 26)
        g.fillStyle(HAT, 1)
        g.fillRoundedRect(-44, -152, 88, 56, 12)
        g.fillStyle(HAT_DARK, 1)
        g.fillRect(-44, -112, 88, 12)
    }
}

/* ───────────────────────────────── os ícones ──────────────────────────── */

export interface IconOptions {
    /** Cinza e apagado: é o campo do cartaz ainda vazio. */
    ghost?: boolean
    /** O risco do NÃO. */
    negated?: boolean
}

/**
 * O ícone do termo, como objeto de cena, centrado em (0, 0) e ocupando uma
 * caixa de `size` px.
 *
 * Com `icones.png` carregado ele é a arte — e a GOTA vem branca do arquivo,
 * tingida aqui com a MESMA tinta do bichinho (§5½ do TEXTURAS.md). Sem a
 * folha, cai no `drawIcon` em `Graphics` e o jogo continua inteiro.
 */
export function createIcon(
    scene: Phaser.Scene,
    value: Value,
    size: number,
    { ghost = false, negated = false }: IconOptions = {},
): Phaser.GameObjects.Container {
    const holder = scene.add.container(0, 0)

    /**
     * O tamanho NÃO vem de arquivo, e não é economia: ele é uma COMPARAÇÃO,
     * e uma comparação tem três estados (o grande, o pequeno, e os dois
     * apagados no campo vazio) que um quadro fixo não dá. É a mesma razão da
     * régua ser `Graphics`.
     */
    if (value === 'big' || value === 'small') {
        const g = scene.add.graphics()
        drawSizeIcon(g, ghost ? 'both' : value, size)
        holder.add(g)
        if (negated) {
            const slash = scene.add.graphics()
            drawSlash(slash, size)
            holder.add(slash)
        }
        return holder
    }

    if (scene.textures.exists(ICON_SHEET.key)) {
        const frame = ICON_FRAME[value]
        const box = ICON_BOX[frame]
        const k = size / Math.max(box.w, box.h)
        const half = ICON_SHEET.frameWidth / 2

        const img = scene.add
            .image(0, 0, ICON_SHEET.key, frame)
            .setScale(k)
            .setPosition(-(box.cx - half) * k, -(box.cy - half) * k)

        if (ghost) {
            /**
             * Apagado, NUNCA silhueta chapada: `setTintFill` come o contorno
             * preto junto, e o chapéu vira um borrão cinza que não diz que é
             * um chapéu. O que o campo vazio precisa é do desenho de verdade,
             * fraco — e só a gota é acinzentada, para não sugerir uma cor.
             */
            img.setAlpha(0.42)
            if (TINTED[value]) img.setTint(C.inkSoft)
        } else if (TINTED[value]) {
            img.setTint(TONE[value as ColorValue])
        }
        holder.add(img)
    } else {
        const g = scene.add.graphics()
        drawIcon(g, value, size, { ghost })
        holder.add(g)
    }

    if (negated) {
        const slash = scene.add.graphics()
        drawSlash(slash, size)
        holder.add(slash)
    }

    return holder
}

/**
 * O ícone de um termo, dentro de uma caixa de `size` px, centrado em (0, 0).
 * Cor vira gota de tinta, chapéu vira chapéu, óculos viram óculos — o mesmo
 * desenho que está no bichinho, para a criança ligar uma coisa na outra.
 */
export function drawIcon(
    g: Phaser.GameObjects.Graphics,
    value: Value,
    size: number,
    { ghost = false, negated = false }: IconOptions = {},
) {
    const s = size / 100
    const flat = (color: number) => (ghost ? C.inkSoft : color)
    const alpha = ghost ? 0.3 : 1

    /* o mesmo traço preto grosso da arte — senão a carta parece de outro jogo */
    const line = Math.max(3, 6 * s)
    const stroke = () => g.lineStyle(line, ghost ? C.inkSoft : C.line, ghost ? 0.4 : 1)

    if (value === 'hat') {
        /* o chapéu da arte: coco de aba redonda, marrom-madeira */
        g.fillStyle(flat(HAT), alpha)
        g.fillRoundedRect(-30 * s, -36 * s, 60 * s, 54 * s, { tl: 26 * s, tr: 26 * s, bl: 4 * s, br: 4 * s })
        stroke()
        g.strokeRoundedRect(-30 * s, -36 * s, 60 * s, 54 * s, { tl: 26 * s, tr: 26 * s, bl: 4 * s, br: 4 * s })
        g.fillStyle(flat(HAT_DARK), alpha)
        g.fillEllipse(0, 20 * s, 100 * s, 22 * s)
        stroke()
        g.strokeEllipse(0, 20 * s, 100 * s, 22 * s)
    } else if (value === 'glasses') {
        /* armação preta redonda, a mesma nos oito bichinhos */
        g.lineStyle(9 * s, flat(GLASSES), alpha)
        g.strokeCircle(-25 * s, 0, 24 * s)
        g.strokeCircle(25 * s, 0, 24 * s)
        g.beginPath()
        g.moveTo(-1 * s, 0)
        g.lineTo(1 * s, 0)
        g.moveTo(-49 * s, -4 * s)
        g.lineTo(-64 * s, -14 * s)
        g.moveTo(49 * s, -4 * s)
        g.lineTo(64 * s, -14 * s)
        g.strokePath()
    } else {
        /* a gota de tinta: a COR é o atributo, e ela ocupa a gota inteira */
        g.fillStyle(flat(TONE[value]), alpha)
        g.beginPath()
        g.moveTo(0, -44 * s)
        g.lineTo(27 * s, 4 * s)
        g.lineTo(-27 * s, 4 * s)
        g.closePath()
        g.fillPath()
        g.fillCircle(0, 10 * s, 31 * s)

        stroke()
        g.beginPath()
        g.moveTo(-23 * s, 12 * s)
        g.lineTo(0, -44 * s)
        g.lineTo(23 * s, 12 * s)
        g.strokePath()
        g.strokeCircle(0, 10 * s, 31 * s)
    }

    if (negated) drawSlash(g, size)
}

/**
 * O ícone de TAMANHO: dois pilares no mesmo chão, um alto e um baixo, e o da
 * vez cheio. É uma comparação desenhada, que é o que "grande" quer dizer para
 * uma criança de 6 anos — um pilar sozinho não diz nada.
 *
 * `'both'` apaga os dois: é o campo do cartaz que ainda não foi preenchido, e
 * ele não pode entregar a resposta.
 */
export function drawSizeIcon(
    g: Phaser.GameObjects.Graphics,
    which: 'big' | 'small' | 'both',
    size: number,
) {
    const s = size / 100
    const base = 40 * s
    const w = 30 * s
    const tall = 84 * s
    const short = 48 * s
    const gap = 21 * s

    const pillar = (x: number, h: number, on: boolean) => {
        const r = Math.min(w / 2, 12 * s)
        if (on) {
            g.fillStyle(C.ink, 1)
            g.fillRoundedRect(x - w / 2, base - h, w, h, { tl: r, tr: r, bl: 3 * s, br: 3 * s })
        }
        g.lineStyle(Math.max(3, 6 * s), C.line, on ? 1 : 0.28)
        g.strokeRoundedRect(x - w / 2, base - h, w, h, { tl: r, tr: r, bl: 3 * s, br: 3 * s })
    }

    pillar(-gap, tall, which === 'big')
    pillar(gap, short, which === 'small')

    /* o chão comum: sem ele os dois pilares flutuam e não se comparam */
    g.lineStyle(Math.max(3, 6 * s), C.line, which === 'both' ? 0.28 : 0.85)
    g.beginPath()
    g.moveTo(-46 * s, base)
    g.lineTo(46 * s, base)
    g.strokePath()
}

/**
 * A régua do balcão. Uma marca só, na altura que separa grande de pequeno, e
 * a seta apontando para o bichinho — é ele que tem de ser comparado com ela.
 */
export function drawRuler(
    g: Phaser.GameObjects.Graphics,
    { h, w, markFromBase }: { h: number; w: number; markFromBase: number },
) {
    g.clear()

    g.fillStyle(C.paper, 1)
    g.fillRoundedRect(-w / 2, -h, w, h, 8)
    g.lineStyle(5, C.line, 1)
    g.strokeRoundedRect(-w / 2, -h, w, h, 8)

    /* tracinhos, só para ler como régua */
    g.lineStyle(3, C.line, 0.45)
    for (let y = 30; y < h - 8; y += 30) {
        const long = y % 60 === 0
        g.beginPath()
        g.moveTo(-w / 2, -y)
        g.lineTo(-w / 2 + (long ? w * 0.62 : w * 0.34), -y)
        g.strokePath()
    }

    /* a marca: é ela que decide, e por isso é a única linha grossa */
    const my = -markFromBase
    g.lineStyle(7, C.coral, 1)
    g.beginPath()
    g.moveTo(-w / 2 - 6, my)
    g.lineTo(w / 2 + 6, my)
    g.strokePath()

    g.fillStyle(C.coral, 1)
    g.beginPath()
    g.moveTo(-w / 2 - 8, my)
    g.lineTo(-w / 2 - 28, my - 11)
    g.lineTo(-w / 2 - 28, my + 11)
    g.closePath()
    g.fillPath()
    g.lineStyle(4, C.line, 1)
    g.beginPath()
    g.moveTo(-w / 2 - 8, my)
    g.lineTo(-w / 2 - 28, my - 11)
    g.lineTo(-w / 2 - 28, my + 11)
    g.closePath()
    g.strokePath()
}

/** A moldura do operador, entre os dois termos. */
export function drawOperator(
    g: Phaser.GameObjects.Graphics,
    op: 'e' | 'ou',
    w: number,
    h: number,
) {
    g.clear()
    g.fillStyle(op === 'e' ? C.ink : C.orange, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
    g.lineStyle(5, C.line, 1)
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, h / 2)
}

/** A moldura de um termo, dentro da carta de dois. */
export function drawTermBox(g: Phaser.GameObjects.Graphics, w: number, h: number) {
    g.clear()
    g.fillStyle(C.paperEdge, 0.3)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 16)
    g.lineStyle(4, C.line, 0.55)
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 16)
}

/** A tarja do NÃO, em cima do ícone do termo. Dois canais, sempre. */
export function drawNoTag(g: Phaser.GameObjects.Graphics, w: number, h: number) {
    g.clear()
    g.fillStyle(C.no, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
    g.lineStyle(4, C.line, 1)
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, h / 2)
}

/**
 * O balão da atendente: mesmo traço grosso, e o rabicho sai pela ESQUERDA
 * apontando para cima — que é onde ela está. Rabicho embaixo fazia a fala
 * parecer que vinha do balcão.
 */
export function drawSpeech(g: Phaser.GameObjects.Graphics, w: number, h: number) {
    const x = -w / 2
    const tail: Array<[number, number]> = [
        [x + 6, -h / 2 + 14],
        [x - 46, -h / 2 - 16],
        [x + 8, h / 2 - 16],
    ]

    g.fillStyle(C.paper, 1)
    g.fillRoundedRect(x, -h / 2, w, h, 22)
    g.beginPath()
    g.moveTo(tail[0][0], tail[0][1])
    g.lineTo(tail[1][0], tail[1][1])
    g.lineTo(tail[2][0], tail[2][1])
    g.closePath()
    g.fillPath()

    g.lineStyle(5, C.line, 1)
    g.strokeRoundedRect(x, -h / 2, w, h, 22)
    g.beginPath()
    g.moveTo(tail[0][0] + 2, tail[0][1])
    g.lineTo(tail[1][0], tail[1][1])
    g.lineTo(tail[2][0] + 2, tail[2][1])
    g.strokePath()
}

/**
 * O risco do NÃO. Ele fica DENTRO da moldura do termo, atravessando o ícone —
 * é isso, e só isso, que resolve a ambiguidade de escopo. O branco por baixo
 * existe para o risco não sumir sobre um ícone escuro.
 */
export function drawSlash(g: Phaser.GameObjects.Graphics, size: number) {
    const r = size * 0.46
    g.lineStyle(size * 0.17, C.white, 0.95)
    g.beginPath()
    g.moveTo(-r, r)
    g.lineTo(r, -r)
    g.strokePath()
    g.lineStyle(size * 0.11, C.no, 1)
    g.beginPath()
    g.moveTo(-r, r)
    g.lineTo(r, -r)
    g.strokePath()
}

/* ───────────────────────────── carimbos de ✓ e ✗ ──────────────────────── */

export function drawCheck(g: Phaser.GameObjects.Graphics, size: number) {
    const s = size / 100
    g.fillStyle(C.green, 1)
    g.fillCircle(0, 0, 48 * s)
    g.lineStyle(14 * s, C.white, 1)
    g.beginPath()
    g.moveTo(-22 * s, 2 * s)
    g.lineTo(-6 * s, 20 * s)
    g.lineTo(24 * s, -18 * s)
    g.strokePath()
}

export function drawCross(g: Phaser.GameObjects.Graphics, size: number) {
    const s = size / 100
    g.fillStyle(C.orange, 1)
    g.fillCircle(0, 0, 48 * s)
    g.lineStyle(14 * s, C.white, 1)
    g.beginPath()
    g.moveTo(-20 * s, -20 * s)
    g.lineTo(20 * s, 20 * s)
    g.moveTo(20 * s, -20 * s)
    g.lineTo(-20 * s, 20 * s)
    g.strokePath()
}
