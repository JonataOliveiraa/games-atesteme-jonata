import Phaser from 'phaser'
import { FX, type FxTarget } from '../../../../shared/effects/FX'
import { C, CSS, FONT, SCENERY, SIZE } from '../data/theme'
import { BALLOON, DEPTH, H, PATH, TARGET, W } from '../data/layout'
import type { Scenery } from '../types'

const fx = (o: unknown) => o as unknown as FxTarget

/**
 * ══════════════════════════════════════════════════════════════════════
 *  O CAMINHO DO DIA
 * ══════════════════════════════════════════════════════════════════════
 *
 * A faixa do meio não é pauta de música: é o caminho por onde o dia da criança
 * passa. O que dá vida é o pontilhado andando devagar e o alvo respirando —
 * movimento suficiente para a tela não morrer, pouco o bastante para não
 * competir com a figura, que é a coisa que precisa ser reconhecida.
 *
 * O anel do alvo cabe INTEIRO entre o painel de cima e o chão. Um anel cortado
 * pela borda do painel não parece desenho, parece defeito.
 */

const DASH = { len: 34, gap: 30, h: 9 }

export function createStage(scene: Phaser.Scene, initial: Scenery) {
    let scenery = initial
    let palette = SCENERY[scenery]

    const bg = scene.add.image(W / 2, H / 2, palette.texture).setDepth(DEPTH.scenery)
    const veil = scene.add.graphics().setDepth(DEPTH.veil)
    const pathG = scene.add.graphics().setDepth(DEPTH.path)
    const ringG = scene.add.graphics().setDepth(DEPTH.target)
    const edgeG = scene.add.graphics().setDepth(DEPTH.edge)

    let clock = 0
    let armed = false
    let pulse = 0
    let flash = 0
    let flashColor = C.ok
    let edge = 0
    let edgeColor = C.ok

    function applyScenery() {
        palette = SCENERY[scenery]
        if (scene.textures.exists(palette.texture)) {
            bg.setTexture(palette.texture)
            bg.setDisplaySize(W, (W * bg.height) / bg.width)
            bg.setVisible(true)
        } else {
            bg.setVisible(false)
        }
        veil.clear()
        veil.fillStyle(palette.veil, palette.veilAlpha)
        veil.fillRect(0, 0, W, H)
    }
    applyScenery()

    // ─────────────────────────────────────────────────────── o caminho

    function drawPath() {
        pathG.clear()

        pathG.fillStyle(C.ink, 0.22)
        pathG.fillRoundedRect(-30, PATH.top + 10, W + 60, PATH.h, PATH.r)

        pathG.fillStyle(C.ink, 1)
        pathG.fillRoundedRect(-30, PATH.top, W + 60, PATH.h, PATH.r)
        pathG.fillStyle(palette.pathEdge, 1)
        pathG.fillRoundedRect(-30, PATH.top + 6, W + 60, PATH.h - 12, PATH.r - 6)
        pathG.fillStyle(palette.path, 1)
        pathG.fillRoundedRect(-30, PATH.top + 6, W + 60, PATH.h - 22, PATH.r - 6)

        // pontilhado andando: é o que diz "isso aqui está passando"
        const offset = (clock * 0.05) % (DASH.len + DASH.gap)
        pathG.fillStyle(palette.dash, 0.85)
        for (let x = W - offset; x > -DASH.len - 40; x -= DASH.len + DASH.gap) {
            pathG.fillRoundedRect(x, PATH.top + PATH.h - 42, DASH.len, DASH.h, DASH.h / 2)
        }
    }

    // ─────────────────────────────────────────────────────── o alvo

    /**
     * Anel largo, não disco: a figura precisa aparecer INTEIRA dentro dele, e
     * o anel é literalmente a janela de acerto. O brilho de fora é curto de
     * propósito — antes era um borrão amarelo que tomava meia tela quando
     * armava, e a criança perdia de vista justamente a figura que ia julgar.
     */
    function drawRing() {
        ringG.clear()

        const breath = 1 + Math.sin(pulse / 380) * (armed ? 0.05 : 0.018)
        const r = TARGET.r * breath
        const color = flash > 0 ? flashColor : armed ? C.warn : C.cyan
        const thick = armed || flash > 0 ? 20 : 14

        if (armed || flash > 0) {
            const wave = (pulse % 700) / 700
            ringG.lineStyle(6, color, 0.45 * (1 - wave))
            ringG.strokeCircle(TARGET.x, TARGET.y, r + TARGET.glow * wave)
        }

        ringG.fillStyle(C.white, armed ? 0.42 : 0.3)
        ringG.fillCircle(TARGET.x, TARGET.y, r - thick / 2)

        ringG.lineStyle(thick + 8, C.ink, 0.9)
        ringG.strokeCircle(TARGET.x, TARGET.y, r)
        ringG.lineStyle(thick, color, 1)
        ringG.strokeCircle(TARGET.x, TARGET.y, r)

        // pezinhos em volta do anel: marcam o lugar sem escrever nada
        const feet = 8
        for (let i = 0; i < feet; i++) {
            const a = (i / feet) * Math.PI * 2 + pulse / 2600
            const rr = r + 18
            const px = TARGET.x + Math.cos(a) * rr
            const py = TARGET.y + Math.sin(a) * rr
            ringG.fillStyle(C.ink, 0.3)
            ringG.fillCircle(px, py + 3, 5)
            ringG.fillStyle(armed ? C.warn : C.white, 0.95)
            ringG.fillCircle(px, py, 5)
        }
    }

    /**
     * A moldura da tela pisca no acerto. É o efeito que faz o jogo parecer
     * grande sem tirar o olho do meio: a cor entra pelas bordas, onde não há
     * nada para ler.
     */
    function drawEdge() {
        edgeG.clear()
        if (edge <= 0) return
        const t = edge / 520
        for (let i = 0; i < 5; i++) {
            edgeG.lineStyle(10 + i * 16, edgeColor, 0.24 * t * (1 - i / 5))
            edgeG.strokeRoundedRect(6 + i * 6, 6 + i * 6, W - 12 - i * 12, H - 12 - i * 12, 40)
        }
    }

    // ─────────────────────────────────────────────────────── o balão

    const balloon = scene.add.container(BALLOON.x, BALLOON.y)
        .setDepth(DEPTH.balloon)
        .setAlpha(0)
        .setScale(0.8)
    const balloonG = scene.add.graphics()
    const balloonText = scene.add.text(0, 0, '', {
        fontFamily: FONT.black,
        fontSize: SIZE.balloon,
        color: CSS.ink,
        align: 'center',
        wordWrap: { width: BALLOON.w - 60 },
        lineSpacing: 4,
    }).setOrigin(0.5).setResolution(2)
    balloon.add([balloonG, balloonText])

    function paintBalloon(accent: number) {
        const w = Math.max(280, balloonText.width + 64)
        const h = balloonText.height + 46
        balloonG.clear()
        balloonG.fillStyle(C.ink, 0.25)
        balloonG.fillRoundedRect(-w / 2 + 4, -h / 2 + 8, w, h, 28)
        balloonG.fillStyle(C.ink, 1)
        balloonG.fillRoundedRect(-w / 2, -h / 2, w, h, 28)
        balloonG.fillStyle(accent, 1)
        balloonG.fillRoundedRect(-w / 2 + 5, -h / 2 + 5, w - 10, h - 10, 24)
        balloonG.fillStyle(C.cream, 1)
        balloonG.fillRoundedRect(-w / 2 + 5, -h / 2 + 5, w - 10, h - 18, 24)
        balloonG.fillStyle(C.ink, 1)
        balloonG.fillTriangle(-w / 2 - 22, 0, -w / 2 + 12, -22, -w / 2 + 12, 22)
        balloonG.fillStyle(C.cream, 1)
        balloonG.fillTriangle(-w / 2 - 12, 0, -w / 2 + 8, -14, -w / 2 + 8, 14)
    }

    return {
        update(dtMs: number) {
            clock += dtMs
            pulse += dtMs
            if (flash > 0) flash = Math.max(0, flash - dtMs)
            if (edge > 0) edge = Math.max(0, edge - dtMs)
            drawPath()
            drawRing()
            drawEdge()
        },

        setScenery(next: Scenery) {
            if (next === scenery) return
            scenery = next
            applyScenery()
        },

        /** O tambor acende junto: os dois ao mesmo tempo dizem "é agora". */
        arm() {
            armed = true
            pulse = 0
        },
        disarm() {
            armed = false
        },

        flashOk() {
            flash = 420
            flashColor = C.ok
            edge = 520
            edgeColor = C.ok
            void FX.ping(scene, TARGET.x, TARGET.y, C.ok, { radius: 190 })
        },
        flashBad() {
            flash = 420
            flashColor = C.bad
            edge = 420
            edgeColor = C.bad
        },

        async say(text: string, accent = C.warn) {
            balloonText.setText(text)
            paintBalloon(accent)
            FX.kill(scene, fx(balloon))
            await FX.to(scene, fx(balloon), { alpha: 1, scale: 1 },
                { duration: 220, ease: 'Back.easeOut' })
        },

        hush() {
            FX.kill(scene, fx(balloon))
            void FX.to(scene, fx(balloon), { alpha: 0, scale: 0.85 }, { duration: 180 })
        },

        destroy() {
            FX.kill(scene, fx(balloon))
            balloon.destroy()
            bg.destroy()
            veil.destroy()
            pathG.destroy()
            ringG.destroy()
            edgeG.destroy()
        },
    }
}
