import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BALAO, DEPTH, H, HUD, W } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'

/**
 * Header de ponta a ponta, com três blocos que não se sobrepõem: nível e
 * bolinhas de onda à esquerda, o que fazer no meio, vidas e `?` à direita. O
 * enunciado tem largura PRÓPRIA — o vão livre entre os laterais —, nunca "a
 * tela toda", senão ele quebra linha por baixo dos corações.
 */
export interface HudOptions {
    nivel: number
    ondas: number
    onHelp: () => void
}

export function createHud(scene: Phaser.Scene, options: HudOptions) {
    const root = scene.add.container(0, 0).setDepth(DEPTH.hud)

    const bar = scene.add.graphics()
    bar.fillStyle(C.ink, 0.22)
    bar.fillRect(0, HUD.h, W, 8)
    bar.fillStyle(C.ink, 1)
    bar.fillRect(0, 0, W, HUD.h)
    bar.fillStyle(C.inkSoft, 1)
    bar.fillRect(0, 0, W, HUD.h - 5)
    bar.fillStyle(C.white, 0.08)
    bar.fillRect(0, 0, W, 18)
    bar.fillStyle(C.gold, 1)
    bar.fillRect(0, HUD.h - 5, W, 4)
    root.add(bar)

    const pill = scene.add.graphics()
    pill.fillStyle(C.ink, 1)
    pill.fillRoundedRect(HUD.pillX, HUD.pillY, HUD.pillW, HUD.pillH, HUD.pillH / 2)
    pill.fillStyle(C.okDark, 1)
    pill.fillRoundedRect(HUD.pillX + 4, HUD.pillY + 4, HUD.pillW - 8, HUD.pillH - 8, HUD.pillH / 2 - 4)
    pill.fillStyle(C.ok, 1)
    pill.fillRoundedRect(HUD.pillX + 4, HUD.pillY + 4, HUD.pillW - 8, HUD.pillH - 14, HUD.pillH / 2 - 4)
    pill.fillStyle(C.white, 0.3)
    pill.fillRoundedRect(HUD.pillX + 14, HUD.pillY + 9, HUD.pillW - 28, 9, 5)
    root.add(pill)

    const nivelTxt = scene.add
        .text(HUD.pillX + HUD.pillW / 2, HUD.cy - 1, `NÍVEL ${options.nivel}`, {
            fontFamily: FONT.black,
            fontSize: '20px',
            color: CSS.white,
        })
        .setOrigin(0.5)
        .setResolution(2)
    nivelTxt.setStroke(CSS.ink, 5)
    root.add(nivelTxt)

    const dotX = (i: number) => HUD.dotX + i * HUD.dotGap
    const dots = scene.add.graphics()
    const paintDots = (feitas: number) => {
        dots.clear()
        for (let i = 0; i < options.ondas; i++) {
            const cheia = i < feitas
            dots.fillStyle(C.ink, 1)
            dots.fillCircle(dotX(i), HUD.cy, HUD.dotR + 3)
            dots.fillStyle(cheia ? C.gold : C.inkSoft, 1)
            dots.fillCircle(dotX(i), HUD.cy, HUD.dotR)
            if (!cheia) continue
            dots.fillStyle(C.white, 0.8)
            dots.fillCircle(dotX(i) - 3, HUD.cy - 3, 4)
        }
    }
    paintDots(0)
    root.add(dots)

    const titulo = scene.add
        .text(HUD.titleX, HUD.cy, '', {
            fontFamily: FONT.black,
            fontSize: '25px',
            color: CSS.cream,
            align: 'center',
            wordWrap: { width: HUD.titleW },
        })
        .setOrigin(0.5)
        .setResolution(2)
    root.add(titulo)

    const helpG = scene.add.graphics().setPosition(HUD.helpX, HUD.cy)
    helpG.fillStyle(C.ink, 1)
    helpG.fillCircle(0, 0, HUD.helpR + 3)
    helpG.fillStyle(C.gold, 1)
    helpG.fillCircle(0, 0, HUD.helpR)
    helpG.fillStyle(C.white, 0.45)
    helpG.fillEllipse(-HUD.helpR * 0.25, -HUD.helpR * 0.38, HUD.helpR * 1.05, HUD.helpR * 0.46)
    root.add(helpG)

    const helpTxt = scene.add
        .text(HUD.helpX, HUD.cy + 1, '?', { fontFamily: FONT.black, fontSize: '30px', color: CSS.ink })
        .setOrigin(0.5)
        .setResolution(2)
    root.add(helpTxt)

    const zone = scene.add
        .zone(HUD.helpX, HUD.cy, HUD.helpHit, HUD.helpHit)
        .setOrigin(0.5)
        .setDepth(DEPTH.hud + 2)
        .setInteractive({ useHandCursor: true })

    let enabled = true
    zone.on('pointerdown', (_p: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
        event?.stopPropagation?.()
        if (!enabled) return
        void FX.press(scene, helpG)
        options.onHelp()
    })

    // ── o balão de uma linha ─────────────────────────────────────────────
    const balao = scene.add.container(BALAO.cx, BALAO.cy).setDepth(DEPTH.balao).setAlpha(0)
    const bg = scene.add.graphics()
    const bh = BALAO.h / 2
    const bw = BALAO.w / 2
    bg.fillStyle(C.ink, 0.22)
    bg.fillRoundedRect(-bw + 5, -bh + 8, BALAO.w, BALAO.h, 22)
    bg.fillStyle(C.naoDark, 1)
    bg.fillRoundedRect(-bw, -bh, BALAO.w, BALAO.h, 22)
    bg.fillStyle(C.cream, 1)
    bg.fillRoundedRect(-bw + 6, -bh + 6, BALAO.w - 12, BALAO.h - 12, 17)
    bg.fillStyle(C.naoDark, 1)
    bg.fillTriangle(-26, bh - 3, 22, bh - 3, -6, bh + 24)
    bg.fillStyle(C.cream, 1)
    bg.fillTriangle(-18, bh - 9, 14, bh - 9, -8, bh + 13)
    balao.add(bg)

    const balaoTxt = scene.add
        .text(0, 0, '', { fontFamily: FONT.black, fontSize: '31px', color: CSS.ink, align: 'center' })
        .setOrigin(0.5)
        .setResolution(2)
    balao.add(balaoTxt)

    const edge = scene.add.graphics().setDepth(DEPTH.fx).setAlpha(0)

    return {
        setTitulo(text: string) {
            titulo.setText(text)
        },

        async marcarOnda(index: number) {
            paintDots(index + 1)
            await FX.ping(scene, dotX(index), HUD.cy, C.gold, { radius: 32, depth: DEPTH.hud + 3 })
        },

        dotPoint(index: number) {
            return { x: dotX(index), y: HUD.cy }
        },

        dizer(texto: string) {
            balaoTxt.setText(texto)
            FX.kill(scene, balao)
            balao.setAlpha(0).setY(BALAO.cy - 26).setScale(0.92)
            void FX.to(scene, balao, { alpha: 1, y: BALAO.cy, scale: 1 }, { duration: 320, ease: 'Back.easeOut' })
        },

        calar() {
            FX.kill(scene, balao)
            void FX.to(scene, balao, { alpha: 0, y: BALAO.cy - 22 }, { duration: 200 })
        },

        flash(color: number) {
            edge.clear()
            edge.lineStyle(18, color, 1)
            edge.strokeRoundedRect(9, 9, W - 18, H - 18, 26)
            edge.setAlpha(0.8)
            scene.tweens.add({
                targets: edge,
                alpha: 0,
                duration: FX.ms(scene, 520),
                ease: 'Cubic.easeOut',
            })
        },

        helpBounds() {
            return { x: HUD.helpX, y: HUD.cy, w: HUD.helpR * 2 + 20, h: HUD.helpR * 2 + 20 }
        },

        setEnabled(value: boolean) {
            enabled = value
            helpG.setAlpha(value ? 1 : 0.5)
            helpTxt.setAlpha(value ? 1 : 0.5)
        },

        destroy() {
            FX.kill(scene, root)
            FX.kill(scene, balao)
            balao.destroy(true)
            root.destroy(true)
            zone.destroy()
            edge.destroy()
        },
    }
}

export type Hud = ReturnType<typeof createHud>
