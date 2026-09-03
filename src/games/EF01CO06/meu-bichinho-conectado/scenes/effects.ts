import Phaser from 'phaser'
import { FX, Ease } from '../../../../shared/effects/FX'
import { C, FONT, SIZE, hex } from '../data/theme'
import { W, H, ASK, SHELF, TOAST, type ShelfArrangement } from '../data/layout'
import type { NicheState, StampState } from '../types'

/** Painel creme com sombra, brilho no topo e borda grossa. */
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
    g.fillStyle(C.white, 0.28)
    g.fillRoundedRect(-w / 2 + 16, -h / 2 + 12, w - 32, 18, 9)
    g.lineStyle(strokeWidth, stroke, 1)
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, r)
}

/** Balão do pedido, com rabicho apontando para o bichinho. */
export function paintAsk(g: Phaser.GameObjects.Graphics) {
    const { w, h, r, tailY } = ASK
    paintPanel(g, w, h, r, C.cream, C.amber, 7)
    g.fillStyle(C.cream, 0.99)
    g.fillTriangle(-34, tailY - 6, 30, tailY - 6, -4, tailY + 40)
    g.lineStyle(7, C.amber, 1)
    g.lineBetween(-34, tailY - 2, -4, tailY + 40)
    g.lineBetween(30, tailY - 2, -4, tailY + 40)
}

/** Estante de madeira: costas, prateleiras e sombra interna. */
export function paintShelf(g: Phaser.GameObjects.Graphics, arr: ShelfArrangement) {
    const { y, h, r } = SHELF
    const { cx, w, nicheH, rows } = arr
    const x = cx - w / 2

    g.clear()
    g.fillStyle(C.shadow, 0.26)
    g.fillRoundedRect(x + 8, y + 12, w, h, r)
    g.fillStyle(C.wood, 1)
    g.fillRoundedRect(x, y, w, h, r)
    g.fillStyle(C.woodLight, 0.5)
    g.fillRoundedRect(x + 12, y + 12, w - 24, 20, 10)
    g.fillStyle(C.woodDark, 0.45)
    g.fillRoundedRect(x + 18, y + 42, w - 36, h - 60, 24)

    rows.forEach(sy => {
        g.fillStyle(C.woodDark, 0.55)
        g.fillRoundedRect(x + 24, sy + nicheH / 2 + 4, w - 48, 16, 8)
        g.fillStyle(C.woodLight, 0.4)
        g.fillRoundedRect(x + 28, sy + nicheH / 2 + 6, w - 56, 6, 3)
    })

    g.lineStyle(5, C.woodDark, 0.9)
    g.strokeRoundedRect(x, y, w, h, r)
}

/**
 * Cartão do artefato dentro do nicho.
 *
 * `hover` e `hint` não podem ser o mesmo desenho: o primeiro é "o dedo está
 * aqui", o segundo é "é este que ajuda". A dica ganha borda mais grossa e um
 * anel branco por dentro, que o hover não tem.
 */
export function paintNiche(
    g: Phaser.GameObjects.Graphics,
    w: number,
    h: number,
    state: NicheState,
) {
    const r = SHELF.nicheR
    g.clear()
    g.fillStyle(C.shadow, 0.2)
    g.fillRoundedRect(-w / 2 + 5, -h / 2 + 8, w, h, r)

    g.fillStyle(state === 'idle' ? C.cream : C.amber, state === 'idle' ? 0.97 : 0.99)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, r)
    g.fillStyle(C.white, 0.3)
    g.fillRoundedRect(-w / 2 + 10, -h / 2 + 8, w - 20, 16, 8)

    if (state === 'hint') {
        g.lineStyle(4, C.white, 0.9)
        g.strokeRoundedRect(-w / 2 + 12, -h / 2 + 12, w - 24, h - 24, r - 8)
    }

    g.lineStyle(state === 'idle' ? 5 : state === 'hover' ? 6 : 10,
        state === 'idle' ? C.woodDark : C.amberDark, 1)
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, r)
}

/**
 * Selo de fase, no topo. Um por pedido do nível.
 *
 * Os três estados dizem a mesma coisa que a pílula "Fase 2 de 3" ao lado,
 * mas em desenho: o que já foi (verde, com o pictograma), o que está sendo
 * jogado agora (âmbar, com um alvo no meio) e o que ainda vem (apagado).
 */
export function paintStamp(g: Phaser.GameObjects.Graphics, size: number, state: StampState) {
    const r = size / 2
    const done = state === 'done'
    const current = state === 'current'

    g.clear()
    g.fillStyle(C.shadow, 0.18)
    g.fillCircle(3, 4, r)
    g.fillStyle(done ? C.greenLight : C.cream, done ? 1 : 0.94)
    g.fillCircle(0, 0, r)
    g.fillStyle(C.white, 0.35)
    g.fillEllipse(0, -r * 0.45, r * 1.1, r * 0.45)

    // O selo sem pictograma precisa de miolo: sem ele a criança vê bolas
    // apagadas e não uma fileira de lugares a preencher.
    if (!done) {
        g.fillStyle(current ? C.amber : C.creamEdge, 1)
        g.fillCircle(0, 0, r * (current ? 0.42 : 0.34))
        if (current) {
            g.fillStyle(C.white, 0.55)
            g.fillCircle(0, 0, r * 0.18)
        }
    }

    g.lineStyle(
        done ? 5 : current ? 7 : 5,
        done ? C.green : C.amberDark,
        done || current ? 1 : 0.55,
    )
    g.strokeCircle(0, 0, r)
}

/**
 * Brilho nas bordas da tela: verde no acerto, vermelho no erro.
 *
 * Era uma faixa chapada de 26px, que parecia moldura de quadro colada por
 * cima do quarto. Agora são anéis concêntricos com alfa caindo para dentro:
 * a luz nasce na borda e some, sem desenhar uma linha onde o cenário acaba.
 */
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

function drawHeart(g: Phaser.GameObjects.Graphics, size: number, color: number) {
    const r = size * 0.29
    g.fillStyle(color, 1)
    g.fillCircle(-r * 0.82, -r * 0.4, r)
    g.fillCircle(r * 0.82, -r * 0.4, r)
    g.fillTriangle(-r * 1.82, 0, r * 1.82, 0, 0, size * 0.7)
    g.fillStyle(C.white, 0.42)
    g.fillCircle(-r * 0.9, -r * 0.7, r * 0.34)
}

/** Corações subindo do bichinho: o "ele gostou" que dispensa texto. */
export function heartBurst(scene: Phaser.Scene, x: number, y: number) {
    const sizes = [46, 30, 26]
    const offsets = [0, -52, 46]

    sizes.forEach((size, i) => {
        const g = scene.add.graphics().setDepth(210)
        drawHeart(g, size, C.heart)
        g.setPosition(x + offsets[i], y).setScale(0.2)

        FX.to(scene, g, { scale: 1, y: y - 34 }, {
            duration: 320, delay: i * 130, ease: Ease.back(2.4),
        }).then(() => FX.to(scene, g, { y: y - 150 - i * 26, alpha: 0, scale: 0.7 }, {
            duration: 620, ease: Ease.smooth,
        }).then(() => g.destroy()))
    })
}

/** Anéis que saem do aparelho ligado — a função dele "alcançando" o bichinho. */
export function deviceWaves(scene: Phaser.Scene, x: number, y: number, color: number) {
    for (let i = 0; i < 3; i += 1) {
        scene.time.delayedCall(i * 190, () => {
            FX.ping(scene, x, y, color, { radius: 96 + i * 34, duration: 620, depth: 205 })
        })
    }
}

export function showToast(scene: Phaser.Scene, message: string, tone: number, life = 1600) {
    const box = scene.add.container(TOAST.cx, TOAST.y + 40).setDepth(220)
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
