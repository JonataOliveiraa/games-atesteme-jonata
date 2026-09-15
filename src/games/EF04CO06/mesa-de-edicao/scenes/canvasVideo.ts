import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { ART_BOX, ART_SHEET, SHEET } from '../data/art'
import { VIDEO, type SuporteGeo } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import type { Medida, Peca } from '../types'

/**
 * O VÍDEO — o que está tocando na tela do celular.
 *
 * Três estados, três formas: a imagem DEITADA (girada 90°, com tarja dos dois
 * lados, que é como um vídeo filmado de lado aparece num celular em pé), a faixa
 * de legenda embaixo da cena, e a mistura de som — a voz de um lado, a música do
 * outro, com as notas crescendo até cobrirem a onda da voz.
 */
export function createCanvasVideo(
    scene: Phaser.Scene,
    inner: Phaser.GameObjects.Container,
    geo: SuporteGeo,
) {
    const screenW = geo.innerW - VIDEO.pad * 2
    const frameTop = -geo.innerH / 2 + VIDEO.pad + 8
    const frameH = Math.min(VIDEO.frameH, geo.innerH * 0.62)
    const frameCY = frameTop + frameH / 2

    const back = scene.add.graphics()
    inner.add(back)

    const shot = scene.textures.exists(SHEET.art) ? scene.add.image(0, frameCY, SHEET.art, 0) : undefined
    if (shot) inner.add(shot)

    const front = scene.add.graphics()
    inner.add(front)

    const caption = scene.add
        .text(0, 0, '', {
            fontFamily: FONT.body,
            fontSize: '13px',
            color: CSS.white,
            align: 'center',
            wordWrap: { width: screenW - 20 },
            lineSpacing: 2,
        })
        .setOrigin(0.5)
        .setResolution(2)
    inner.add(caption)

    const paintShot = (peca: Peca) => {
        back.clear()
        back.fillStyle(C.ink, 1)
        back.fillRoundedRect(-screenW / 2, frameTop, screenW, frameH, 8)

        const box = ART_BOX[peca.imagem] ?? ART_BOX[0]
        const artW = box.w * ART_SHEET.frameWidth
        const artH = box.h * ART_SHEET.frameHeight

        // deitado: a cena cabe pela ALTURA e vira 90°, e sobram tarjas nos lados
        const scale = peca.deitado
            ? Math.min((frameH - 16) / artW, (screenW - 16) / artH)
            : Math.min((screenW - 16) / artW, (frameH - 44) / artH)

        if (!shot) {
            back.fillStyle(C.slate, 1)
            const w = peca.deitado ? artH * scale : artW * scale
            const h = peca.deitado ? artW * scale : artH * scale
            back.fillRoundedRect(-w / 2, frameCY - h / 2, w, h, 6)
            return
        }

        shot.setFrame(peca.imagem)
        shot.setScale(scale)
        shot.setAngle(peca.deitado ? -90 : 0)
        const dx = (box.cx - 0.5) * ART_SHEET.frameWidth * scale
        const dy = (box.cy - 0.5) * ART_SHEET.frameHeight * scale
        shot.setPosition(peca.deitado ? dy : -dx, frameCY + (peca.deitado ? -dx : -dy))
    }

    const paintCaption = (peca: Peca) => {
        if (!peca.legenda) {
            caption.setVisible(false)
            return
        }
        const barTop = frameTop + frameH - VIDEO.barH - 6
        front.fillStyle(C.ink, 0.82)
        front.fillRoundedRect(-screenW / 2 + 8, barTop, screenW - 16, VIDEO.barH, 6)
        caption.setText(peca.frase)
        caption.setPosition(0, barTop + VIDEO.barH / 2)
        caption.setVisible(true)
    }

    const paintMix = (peca: Peca) => {
        const y = frameTop + frameH + 44
        const vozX = -screenW / 4
        const musicaX = screenW / 4

        front.fillStyle(C.wallDeep, 1)
        front.fillRoundedRect(-screenW / 2, y - 34, screenW, 68, 12)

        // a voz: cabeça falando e a onda dela
        front.fillStyle(C.slate, 1)
        front.fillCircle(vozX, y - 12, 9)
        front.fillRoundedRect(vozX - 12, y - 1, 24, 15, 7)
        front.fillStyle(C.green, 1)
        for (let i = 0; i < 4; i++) {
            const alto = 6 + (i % 2) * 8
            front.fillRoundedRect(vozX - 20 + i * 11, y + 20 - alto / 2, 6, alto, 3)
        }

        // a música: uma nota por degrau de volume
        const notas = peca.som - 1
        front.fillStyle(notas >= 2 ? C.amberDeep : C.slate, notas ? 1 : 0.3)
        for (let i = 0; i < Math.max(1, notas); i++) {
            const nx = musicaX - 12 + i * 22
            const size = notas >= 2 ? 9 : 6
            front.fillCircle(nx, y + 8, size)
            front.fillRect(nx + size - 3, y - 16, 4, 24)
            front.fillRect(nx + size - 3, y - 16, 14, 5)
        }

        // som alto: as notas transbordam por cima da onda da voz
        if (peca.som >= 3) {
            front.fillStyle(C.amberDeep, 0.85)
            front.fillRoundedRect(vozX - 26, y + 4, 62, 22, 10)
            front.fillStyle(C.amber, 1)
            front.fillCircle(vozX - 8, y + 15, 7)
            front.fillRect(vozX - 2, y - 2, 4, 18)
            front.fillRect(vozX - 2, y - 2, 12, 4)
        }
    }

    return {
        render(peca: Peca) {
            front.clear()
            paintShot(peca)
            paintCaption(peca)
            paintMix(peca)
        },

        measure(): Medida {
            return { tituloCabe: true, textoCabe: true }
        },

        async react() {
            await FX.impact(scene, front, 0.06)
        },

        setClip() {},

        destroy() {},
    }
}
