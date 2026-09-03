import Phaser from 'phaser'
import { FX, Ease } from '../../../../shared/effects/FX'
import { C, FONT, SIZE, hex } from '../data/theme'
import { W, H, PARK, TOAST } from '../data/layout'
import type { DataKind, ShieldState } from '../types'

/* ──────────────────────────────────────────────────────────── superfícies */

export function paintPanel(
    g: Phaser.GameObjects.Graphics,
    w: number,
    h: number,
    r: number,
    fill: number,
    stroke: number,
    strokeWidth = 6,
) {
    g.clear()
    g.fillStyle(C.shadow, 0.22)
    g.fillRoundedRect(-w / 2 + 6, -h / 2 + 10, w, h, r)
    g.fillStyle(fill, 0.99)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, r)
    g.fillStyle(C.white, 0.26)
    g.fillRoundedRect(-w / 2 + 16, -h / 2 + 12, w - 32, 16, 8)
    g.lineStyle(strokeWidth, stroke, 1)
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, r)
}

export function paintPill(
    g: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    w: number,
    h: number,
    fill: number,
    stroke: number,
) {
    g.clear()
    g.fillStyle(C.shadow, 0.16)
    g.fillRoundedRect(x + 4, y + 6, w, h, h / 2)
    g.fillStyle(fill, 0.97)
    g.fillRoundedRect(x, y, w, h, h / 2)
    g.fillStyle(C.white, 0.28)
    g.fillRoundedRect(x + 14, y + 8, w - 28, 14, 7)
    g.lineStyle(5, stroke, 1)
    g.strokeRoundedRect(x, y, w, h, h / 2)
}

/* ─────────────────────────────────────────────────────────────── escudo */

const SHIELD_SHAPE: Array<[number, number]> = [
    [-0.5, -0.44], [0.5, -0.44], [0.5, 0.06],
    [0.33, 0.34], [0, 0.56], [-0.33, 0.34], [-0.5, 0.06],
]

export function shieldPoints(size: number, cx = 0, cy = 0) {
    return SHIELD_SHAPE.map(([x, y]) => new Phaser.Geom.Point(cx + x * size, cy + y * size))
}

/** Escudo cheio, com brilho. Serve de selo de fase e de crachá de confiança. */
export function drawShield(
    g: Phaser.GameObjects.Graphics,
    size: number,
    fill: number,
    stroke: number,
    strokeWidth = 5,
) {
    g.fillStyle(fill, 1)
    g.fillPoints(shieldPoints(size), true)
    g.fillStyle(C.white, 0.3)
    g.fillEllipse(0, -size * 0.2, size * 0.5, size * 0.2)
    g.lineStyle(strokeWidth, stroke, 1)
    g.strokePoints(shieldPoints(size), true, true)
}

/**
 * Selo de fase, no header. Três estados: o cartão que já foi protegido, o que
 * está sendo levado agora e os que ainda vêm.
 */
export function paintShieldSlot(g: Phaser.GameObjects.Graphics, size: number, state: ShieldState) {
    const done = state === 'done'
    const current = state === 'current'

    g.clear()
    g.fillStyle(C.shadow, 0.18)
    g.translateCanvas(3, 4)
    g.fillPoints(shieldPoints(size), true)
    g.translateCanvas(-3, -4)

    drawShield(
        g, size,
        done ? C.safeLight : C.cream,
        done ? C.safeGreen : C.amberDark,
        done ? 5 : current ? 7 : 5,
    )

    if (done) {
        // cadeadinho no canto: o escudo cheio quer dizer "este dado está trancado"
        g.fillStyle(C.gold, 1)
        g.fillRoundedRect(size * 0.16, -size * 0.34, size * 0.2, size * 0.17, size * 0.05)
        g.lineStyle(size * 0.05, C.amberDark, 1)
        g.beginPath()
        g.arc(size * 0.26, -size * 0.34, size * 0.07, Math.PI, 0)
        g.strokePath()
        return
    }

    // vazio: a silhueta de um cartão, para a fileira ler "cartões a guardar"
    g.fillStyle(current ? C.amber : C.creamEdge, current ? 0.9 : 0.75)
    g.fillRoundedRect(-size * 0.2, -size * 0.15, size * 0.4, size * 0.3, size * 0.06)
    if (current) {
        g.fillStyle(C.white, 0.6)
        g.fillRoundedRect(-size * 0.14, -size * 0.09, size * 0.28, size * 0.06, size * 0.03)
    }
}

/* ───────────────────────────────────────────────────── cartão de dados */

/**
 * Os pictogramas dos dados pessoais.
 *
 * Todos passam pela mesma regra: nada de letra de verdade nem de número de
 * verdade. O nome vira etiqueta com riscos, o telefone vira aparelho com
 * bolinhas. O cartão fala do dado sem carregar o dado.
 */
export function drawDataIcon(g: Phaser.GameObjects.Graphics, kind: DataKind, s: number) {
    const face = (cx: number, cy: number, r: number) => {
        g.fillStyle(0xf2b28c, 1)
        g.fillCircle(cx, cy, r)
        g.lineStyle(Math.max(2, s * 0.045), C.ink, 1)
        g.strokeCircle(cx, cy, r)
        g.fillStyle(C.ink, 1)
        g.fillCircle(cx - r * 0.34, cy - r * 0.12, r * 0.12)
        g.fillCircle(cx + r * 0.34, cy - r * 0.12, r * 0.12)
    }

    if (kind === 'name') {
        g.fillStyle(C.white, 1)
        g.fillRoundedRect(-s * 0.44, -s * 0.28, s * 0.88, s * 0.56, s * 0.1)
        g.lineStyle(s * 0.05, C.ink, 1)
        g.strokeRoundedRect(-s * 0.44, -s * 0.28, s * 0.88, s * 0.56, s * 0.1)
        face(-s * 0.22, 0, s * 0.16)
        g.fillStyle(C.inkSoft, 1)
        g.fillRoundedRect(s * 0.0, -s * 0.11, s * 0.36, s * 0.07, s * 0.035)
        g.fillRoundedRect(s * 0.0, s * 0.04, s * 0.26, s * 0.07, s * 0.035)
        return
    }

    if (kind === 'photo') {
        g.fillStyle(C.white, 1)
        g.fillRoundedRect(-s * 0.36, -s * 0.36, s * 0.72, s * 0.72, s * 0.09)
        g.lineStyle(s * 0.05, C.ink, 1)
        g.strokeRoundedRect(-s * 0.36, -s * 0.36, s * 0.72, s * 0.72, s * 0.09)
        g.fillStyle(C.skyDeep, 1)
        g.fillRoundedRect(-s * 0.27, -s * 0.27, s * 0.54, s * 0.54, s * 0.06)
        face(0, -s * 0.04, s * 0.15)
        g.fillStyle(C.shirt, 1)
        g.fillRoundedRect(-s * 0.16, s * 0.11, s * 0.32, s * 0.16, s * 0.06)
        return
    }

    if (kind === 'address') {
        g.fillStyle(C.amber, 1)
        g.fillRoundedRect(-s * 0.32, -s * 0.06, s * 0.64, s * 0.4, s * 0.06)
        g.fillStyle(C.red, 1)
        g.fillTriangle(-s * 0.4, -s * 0.06, s * 0.4, -s * 0.06, 0, -s * 0.4)
        g.fillStyle(C.white, 1)
        g.fillRoundedRect(-s * 0.09, s * 0.1, s * 0.18, s * 0.24, s * 0.03)
        g.lineStyle(s * 0.05, C.ink, 1)
        g.strokeRoundedRect(-s * 0.32, -s * 0.06, s * 0.64, s * 0.4, s * 0.06)
        return
    }

    if (kind === 'school') {
        g.fillStyle(C.steel, 1)
        g.fillRoundedRect(-s * 0.38, -s * 0.22, s * 0.76, s * 0.5, s * 0.06)
        g.fillStyle(C.red, 1)
        g.fillTriangle(-s * 0.44, -s * 0.22, s * 0.44, -s * 0.22, 0, -s * 0.46)
        g.fillStyle(C.white, 1)
        g.fillRoundedRect(-s * 0.24, -s * 0.1, s * 0.16, s * 0.16, s * 0.03)
        g.fillRoundedRect(s * 0.08, -s * 0.1, s * 0.16, s * 0.16, s * 0.03)
        g.fillStyle(C.shirt, 1)
        g.fillRoundedRect(-s * 0.14, s * 0.06, s * 0.28, s * 0.22, s * 0.07)
        g.lineStyle(s * 0.05, C.ink, 1)
        g.strokeRoundedRect(-s * 0.38, -s * 0.22, s * 0.76, s * 0.5, s * 0.06)
        return
    }

    // telefone: aparelho com bolinhas, nunca números
    g.fillStyle(C.inkSoft, 1)
    g.fillRoundedRect(-s * 0.26, -s * 0.42, s * 0.52, s * 0.84, s * 0.1)
    g.fillStyle(C.lightSoft, 1)
    g.fillRoundedRect(-s * 0.19, -s * 0.34, s * 0.38, s * 0.52, s * 0.05)
    g.fillStyle(C.inkSoft, 1)
    for (let i = 0; i < 3; i += 1) {
        for (let j = 0; j < 2; j += 1) {
            g.fillCircle(-s * 0.1 + j * s * 0.2, -s * 0.22 + i * s * 0.16, s * 0.045)
        }
    }
    g.lineStyle(s * 0.05, C.ink, 1)
    g.strokeRoundedRect(-s * 0.26, -s * 0.42, s * 0.52, s * 0.84, s * 0.1)
}

/** O cartão que a criança carrega: retângulo com brilho de tesouro. */
export function paintCard(g: Phaser.GameObjects.Graphics, w: number, h: number) {
    g.clear()
    g.fillStyle(C.shadow, 0.2)
    g.fillRoundedRect(-w / 2 + 4, -h / 2 + 6, w, h, 14)
    g.fillStyle(C.cream, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 14)
    g.fillStyle(C.white, 0.5)
    g.fillRoundedRect(-w / 2 + 7, -h / 2 + 6, w - 14, 10, 5)
    g.lineStyle(5, C.gold, 1)
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 14)
}

/* ─────────────────────────────────────────────────────────── pracinha */

export function paintPark(g: Phaser.GameObjects.Graphics) {
    g.clear()

    g.fillStyle(C.sky, 1)
    g.fillRect(0, 0, W, PARK.horizon)
    g.fillStyle(C.white, 0.55)
    g.fillEllipse(220, 150, 220, 74)
    g.fillEllipse(320, 132, 160, 60)
    g.fillEllipse(1010, 190, 260, 80)

    g.fillStyle(C.grass, 1)
    g.fillRect(0, PARK.horizon, W, H - PARK.horizon)
    g.fillStyle(C.grassDark, 0.45)
    g.fillEllipse(W / 2, PARK.horizon + 8, W * 1.2, 60)

    g.fillStyle(C.pathEdge, 1)
    g.fillRoundedRect(-20, PARK.pathTop - 8, W + 40, PARK.pathBottom - PARK.pathTop + 16, 40)
    g.fillStyle(C.path, 1)
    g.fillRoundedRect(-20, PARK.pathTop, W + 40, PARK.pathBottom - PARK.pathTop, 34)

    g.fillStyle(C.grassDark, 0.35)
    for (let i = 0; i < 26; i += 1) {
        const x = 20 + i * 49
        g.fillEllipse(x, PARK.pathBottom + 44 + (i % 3) * 26, 26, 9)
    }
}

/**
 * Moita de esconderijo, para quando `moita.png` não existir.
 *
 * O estado não vira moldura retangular em volta — isso lia como caixa, não
 * como mato. O brilho no chão e a seta moram em `paintHideoutGlow` e
 * `paintHideoutArrow`, que valem para os dois casos, textura ou desenho.
 */
export function paintHideout(g: Phaser.GameObjects.Graphics, w: number, h: number, blocked: boolean) {
    g.clear()

    g.fillStyle(C.shadow, 0.18)
    g.fillEllipse(6, h / 2 + 6, w * 0.9, 22)

    g.fillStyle(C.bushOutline, 1)
    g.fillCircle(-w * 0.3, 0, h * 0.45)
    g.fillCircle(w * 0.3, 0, h * 0.45)
    g.fillCircle(0, -h * 0.12, h * 0.53)
    g.fillRoundedRect(-w / 2 - 4, -h * 0.1, w + 8, h * 0.58, h * 0.2)

    g.fillStyle(C.bush, 1)
    g.fillCircle(-w * 0.3, 0, h * 0.42)
    g.fillCircle(w * 0.3, 0, h * 0.42)
    g.fillCircle(0, -h * 0.12, h * 0.5)
    g.fillRoundedRect(-w / 2, -h * 0.1, w, h * 0.55, h * 0.2)

    if (!blocked) {
        g.fillStyle(C.bushLight, 1)
        g.fillCircle(-w * 0.26, -h * 0.18, h * 0.3)
        g.fillCircle(w * 0.08, -h * 0.26, h * 0.26)
    }
}

/** Poça de luz verde no chão: "dá para correr até aqui". */
export function paintHideoutGlow(g: Phaser.GameObjects.Graphics, w: number, on: boolean) {
    g.clear()
    if (!on) return
    g.fillStyle(C.safeLight, 0.3)
    g.fillEllipse(0, 0, w * 1.3, 56)
    g.fillStyle(C.safeLight, 0.2)
    g.fillEllipse(0, 0, w * 1.6, 78)
}

/** Seta verde apontando a moita: o "toque aqui" que não depende de ler. */
export function paintHideoutArrow(g: Phaser.GameObjects.Graphics, on: boolean) {
    g.clear()
    if (!on) return
    g.fillStyle(C.safeGreen, 1)
    g.fillTriangle(-30, 0, 30, 0, 0, 40)
    g.fillRoundedRect(-11, -34, 22, 36, 8)
    g.fillStyle(C.white, 0.45)
    g.fillRoundedRect(-7, -30, 8, 26, 4)
}

/** O curioso: geométrico e simpático. O obstáculo é a lanterna, não ele. */
export function paintWatcher(g: Phaser.GameObjects.Graphics, s: number, lit: boolean) {
    g.clear()

    g.fillStyle(C.shadow, 0.16)
    g.fillEllipse(4, s * 0.54, s * 0.62, 18)

    g.fillStyle(C.curious, 1)
    g.fillRoundedRect(-s * 0.24, -s * 0.14, s * 0.48, s * 0.6, s * 0.16)
    g.fillStyle(0xf2b28c, 1)
    g.fillCircle(0, -s * 0.3, s * 0.22)
    g.fillStyle(0x3b2a22, 1)
    g.fillRoundedRect(-s * 0.22, -s * 0.5, s * 0.44, s * 0.2, s * 0.1)

    g.fillStyle(C.ink, 1)
    g.fillCircle(-s * 0.08, -s * 0.3, s * 0.035)
    g.fillCircle(s * 0.08, -s * 0.3, s * 0.035)
    g.lineStyle(s * 0.03, C.ink, 1)
    g.beginPath()
    g.arc(0, -s * 0.22, s * 0.07, 0.2, Math.PI - 0.2)
    g.strokePath()

    // o braço com a lanterna aponta para o caminho
    g.fillStyle(C.curious, 1)
    g.fillRoundedRect(s * 0.18, -s * 0.06, s * 0.3, s * 0.13, s * 0.06)
    g.fillStyle(lit ? C.light : C.steelDark, 1)
    g.fillRoundedRect(s * 0.42, -s * 0.09, s * 0.18, s * 0.19, s * 0.05)
    g.lineStyle(s * 0.03, C.ink, 1)
    g.strokeRoundedRect(s * 0.42, -s * 0.09, s * 0.18, s * 0.19, s * 0.05)
}

/**
 * O cone da lanterna, desenhado do ponto do foco até o chão.
 *
 * São faixas com alfa caindo para fora, e não um triângulo chapado: assim a
 * luz tem miolo forte e borda suave, e a criança lê onde ela realmente pega.
 */
export function paintCone(
    g: Phaser.GameObjects.Graphics,
    from: { x: number; y: number },
    aimX: number,
    reach: number,
    strength: number,
) {
    g.clear()
    if (strength <= 0) return

    const bands = 6
    for (let i = bands; i >= 1; i -= 1) {
        const spread = reach * (0.2 + i * 0.13)
        g.fillStyle(C.light, strength * (0.12 + (bands - i) * 0.09))
        g.fillTriangle(
            from.x, from.y,
            aimX - spread, PARK.pathBottom + 10,
            aimX + spread, PARK.pathBottom + 10,
        )
    }

    // a poça de luz no chão é o que a criança olha para decidir
    g.fillStyle(C.lightSoft, strength * 0.75)
    g.fillEllipse(aimX, PARK.pathBottom - 26, reach * 1.7, 66)
    g.fillStyle(C.white, strength * 0.4)
    g.fillEllipse(aimX, PARK.pathBottom - 26, reach * 1.1, 40)
}

/* ───────────────────────────────────────────────────────────── cofre */

/**
 * O cofre.
 *
 * A porta gira numa dobradiça à ESQUERDA: `open` encolhe a largura dela e a
 * espessura da lateral aparece, que é o que dá a sensação de porta abrindo.
 * Antes ela só encolhia, e lia como retângulo sumindo.
 *
 * Dentro fica um vão escuro que acende quando abre — o cartão entra ali.
 */
export function paintSafe(g: Phaser.GameObjects.Graphics, w: number, h: number, open: number) {
    const inset = 18
    const iw = w - inset * 2
    const ih = h - inset * 2

    g.clear()

    // corpo
    g.fillStyle(C.shadow, 0.24)
    g.fillRoundedRect(-w / 2 + 8, -h / 2 + 12, w, h, 24)
    g.fillStyle(C.steelDark, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 24)
    g.fillStyle(C.steel, 1)
    g.fillRoundedRect(-w / 2 + 7, -h / 2 + 7, w - 14, h - 14, 19)
    g.fillStyle(C.white, 0.16)
    g.fillRoundedRect(-w / 2 + 14, -h / 2 + 13, w - 28, 14, 7)

    // parafusos dos cantos
    g.fillStyle(C.steelDark, 1)
    const bolt = 5
    ;[[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy]) => {
        g.fillCircle(sx * (w / 2 - 15), sy * (h / 2 - 15), bolt)
    })

    // vão interno: escuro fechado, aceso aberto
    g.fillStyle(0x2b3746, 1)
    g.fillRoundedRect(-iw / 2, -ih / 2, iw, ih, 12)
    if (open > 0.05) {
        g.fillStyle(C.lightSoft, 0.22 + 0.4 * open)
        g.fillRoundedRect(-iw / 2 + 4, -ih / 2 + 4, iw - 8, ih - 8, 10)
        g.fillStyle(C.white, 0.3 * open)
        g.fillEllipse(0, ih * 0.1, iw * 0.7, ih * 0.45)
    }

    // a porta, presa na dobradiça esquerda
    const doorW = iw * (1 - open)
    if (doorW > 3) {
        const dx = -iw / 2
        g.fillStyle(C.steel, 1)
        g.fillRoundedRect(dx, -ih / 2, doorW, ih, 12)
        g.fillStyle(C.white, 0.18)
        g.fillRoundedRect(dx + 6, -ih / 2 + 6, Math.max(2, doorW - 12), 10, 5)
        g.lineStyle(4, C.steelDark, 1)
        g.strokeRoundedRect(dx, -ih / 2, doorW, ih, 12)

        // espessura da porta: a faixa que aparece quando ela gira
        if (open > 0.08) {
            g.fillStyle(C.steelDark, 1)
            g.fillRoundedRect(dx + doorW - 5, -ih / 2, 9, ih, 4)
        }

        // volante, só enquanto a porta tem largura para ele
        if (doorW > iw * 0.55) {
            const cx = dx + doorW * 0.58
            g.fillStyle(C.gold, 1)
            g.fillCircle(cx, 0, 17)
            g.lineStyle(5, C.amberDark, 1)
            g.strokeCircle(cx, 0, 17)
            g.lineStyle(4, C.amberDark, 1)
            g.lineBetween(cx - 12, 0, cx + 12, 0)
            g.lineBetween(cx, -12, cx, 12)
        }
    }

    // dobradiças
    g.fillStyle(C.steelDark, 1)
    g.fillRoundedRect(-iw / 2 - 8, -ih * 0.34, 10, 20, 4)
    g.fillRoundedRect(-iw / 2 - 8, ih * 0.18, 10, 20, 4)

    g.lineStyle(6, C.ink, 0.85)
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 24)
}

/**
 * O cadeado que fecha o cofre.
 *
 * É ele que diz "guardado" — o escudo pairando sobre o cofre não dizia nada
 * de concreto. Cadeado aberto vira cadeado fechado na frente da criança.
 */
export function drawPadlock(g: Phaser.GameObjects.Graphics, s: number, closed: boolean) {
    g.clear()

    // arco: aberto sai para a esquerda, fechado assenta no corpo
    g.lineStyle(s * 0.16, C.steelDark, 1)
    g.beginPath()
    if (closed) {
        g.arc(0, -s * 0.3, s * 0.28, Math.PI, 0)
    } else {
        g.arc(-s * 0.1, -s * 0.34, s * 0.28, Math.PI, Math.PI * 1.85)
    }
    g.strokePath()

    g.fillStyle(C.shadow, 0.22)
    g.fillRoundedRect(-s * 0.36 + 3, -s * 0.06 + 5, s * 0.72, s * 0.62, s * 0.14)
    g.fillStyle(C.gold, 1)
    g.fillRoundedRect(-s * 0.36, -s * 0.06, s * 0.72, s * 0.62, s * 0.14)
    g.fillStyle(C.white, 0.35)
    g.fillRoundedRect(-s * 0.28, -s * 0.0, s * 0.56, s * 0.12, s * 0.06)
    g.lineStyle(s * 0.07, C.amberDark, 1)
    g.strokeRoundedRect(-s * 0.36, -s * 0.06, s * 0.72, s * 0.62, s * 0.14)

    g.fillStyle(C.amberDark, 1)
    g.fillCircle(0, s * 0.2, s * 0.1)
    g.fillRoundedRect(-s * 0.05, s * 0.2, s * 0.1, s * 0.22, s * 0.05)
}

/** Raios de luz saindo do cofre aberto. */
export function drawSafeBeam(g: Phaser.GameObjects.Graphics, w: number, h: number, strength: number) {
    g.clear()
    if (strength <= 0) return
    for (let i = 0; i < 7; i += 1) {
        const a = -Math.PI / 2 + (i - 3) * 0.28
        const len = h * (1.4 + (i % 2) * 0.4)
        g.fillStyle(C.lightSoft, strength * 0.32)
        g.fillTriangle(
            0, 0,
            Math.cos(a - 0.06) * len, Math.sin(a - 0.06) * len,
            Math.cos(a + 0.06) * len, Math.sin(a + 0.06) * len,
        )
    }
    g.fillStyle(C.white, strength * 0.4)
    g.fillEllipse(0, 0, w * 0.7, h * 0.5)
}

/* ────────────────────────────────────────────────────────── fala */

export type BubbleIcon = 'shield' | 'eye' | 'lock' | 'no'

function drawBubbleIcon(g: Phaser.GameObjects.Graphics, icon: BubbleIcon, s: number) {
    if (icon === 'shield') {
        drawShield(g, s, C.safeLight, C.safeGreen, 4)
        return
    }
    if (icon === 'eye') {
        g.fillStyle(C.white, 1)
        g.fillEllipse(0, 0, s * 1.1, s * 0.7)
        g.lineStyle(4, C.inkSoft, 1)
        g.strokeEllipse(0, 0, s * 1.1, s * 0.7)
        g.fillStyle(C.inkSoft, 1)
        g.fillCircle(0, 0, s * 0.22)
        return
    }
    if (icon === 'lock') {
        drawPadlock(g, s * 0.9, true)
        return
    }
    // mão aberta de "não"
    g.fillStyle(C.red, 1)
    g.fillCircle(0, 0, s * 0.48)
    g.fillStyle(C.white, 1)
    g.fillRoundedRect(-s * 0.3, -s * 0.06, s * 0.6, s * 0.12, s * 0.06)
}

/**
 * Balão de fala.
 *
 * É o que faz o portão virar uma conversa em vez de duas figuras paradas: cada
 * pessoa PEDE alguma coisa, e a criança responde escolhendo. O ícone à
 * esquerda carrega o sentido para quem ainda não lê.
 */
export function speechBubble(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    icon: BubbleIcon,
    tone: number = C.cream,
): Phaser.GameObjects.Container {
    const box = scene.add.container(x, y).setDepth(48)

    const label = scene.add.text(0, 0, text, {
        fontFamily: FONT.black,
        fontSize: '22px',
        color: hex(C.ink),
        align: 'center',
        wordWrap: { width: 210 },
    }).setOrigin(0.5).setResolution(2)

    const iconSize = 38
    const w = Math.max(180, label.width + iconSize + 62)
    const h = Math.max(76, label.height + 40)

    label.setX(iconSize / 2 + 6)

    const bg = scene.add.graphics()
    bg.fillStyle(C.shadow, 0.2)
    bg.fillRoundedRect(-w / 2 + 4, -h / 2 + 7, w, h, 22)
    bg.fillStyle(tone, 0.99)
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 22)
    bg.fillStyle(C.white, 0.4)
    bg.fillRoundedRect(-w / 2 + 12, -h / 2 + 9, w - 24, 12, 6)
    bg.lineStyle(5, C.ink, 0.85)
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 22)
    // rabicho para baixo, apontando quem fala
    bg.fillStyle(tone, 0.99)
    bg.fillTriangle(-16, h / 2 - 4, 20, h / 2 - 4, -2, h / 2 + 26)
    bg.lineStyle(5, C.ink, 0.85)
    bg.lineBetween(-16, h / 2 - 2, -2, h / 2 + 26)
    bg.lineBetween(20, h / 2 - 2, -2, h / 2 + 26)

    const iconG = scene.add.graphics().setPosition(-w / 2 + 34, 0)
    drawBubbleIcon(iconG, icon, iconSize)

    box.add([bg, iconG, label])
    return box
}

/* ─────────────────────────────────────────── boneco sem textura (fallback) */

/**
 * Se `pessoas.png` não existir, cada pessoa vira um boneco de Graphics com a
 * cor do papel dela. O jogo tem que rodar sem arte nenhuma.
 */
export function paintPerson(g: Phaser.GameObjects.Graphics, s: number, color: number) {
    g.clear()
    g.fillStyle(C.shadow, 0.16)
    g.fillEllipse(4, s * 0.52, s * 0.6, 18)
    g.fillStyle(color, 1)
    g.fillRoundedRect(-s * 0.26, -s * 0.16, s * 0.52, s * 0.66, s * 0.18)
    g.fillStyle(0xf2b28c, 1)
    g.fillCircle(0, -s * 0.32, s * 0.23)
    g.fillStyle(C.ink, 1)
    g.fillCircle(-s * 0.08, -s * 0.33, s * 0.035)
    g.fillCircle(s * 0.08, -s * 0.33, s * 0.035)
    g.lineStyle(s * 0.028, C.ink, 1)
    g.beginPath()
    g.arc(0, -s * 0.26, s * 0.08, 0.25, Math.PI - 0.25)
    g.strokePath()
}

/* ────────────────────────────────────────────────────────── feedback */

/** Brilho nas bordas: verde quando o dado fica seguro, vermelho quando não. */
export function screenGlow(
    scene: Phaser.Scene,
    color: number,
    { life = 900, peak = 0.85, bands = 16, step = 7 } = {},
) {
    const g = scene.add.graphics().setDepth(400)

    for (let i = 0; i < bands; i += 1) {
        const inset = i * step
        const fade = 1 - i / bands
        g.lineStyle(step + 1.5, color, peak * fade * fade)
        g.strokeRoundedRect(
            inset + step / 2, inset + step / 2,
            W - inset * 2 - step, H - inset * 2 - step,
            44 + inset * 0.7,
        )
    }
    g.setAlpha(0)

    FX.seq(
        () => FX.to(scene, g, { alpha: 1 }, { duration: 170 }),
        () => FX.wait(scene, life),
        () => FX.to(scene, g, { alpha: 0 }, { duration: 340 }),
    ).then(() => g.destroy())

    return g
}

export function showToast(scene: Phaser.Scene, message: string, tone: number, life = 1700) {
    const box = scene.add.container(TOAST.cx, TOAST.y + 40).setDepth(320)
    const bg = scene.add.graphics()
    paintPanel(bg, TOAST.w, TOAST.h, TOAST.r, tone, C.white, 5)

    const text = scene.add.text(0, 0, message, {
        fontFamily: FONT.black,
        fontSize: SIZE.toast,
        color: hex(C.white),
        align: 'center',
        wordWrap: { width: TOAST.w - 60 },
    }).setOrigin(0.5).setResolution(2)

    box.add([bg, text])
    box.setAlpha(0)

    FX.seq(
        () => FX.to(scene, box, { alpha: 1, y: TOAST.y }, { duration: 240, ease: Ease.back(1.6) }),
        () => FX.wait(scene, life),
        () => FX.to(scene, box, { alpha: 0, y: TOAST.y + 40 }, { duration: 240 }),
    ).then(() => box.destroy())

    return box
}
