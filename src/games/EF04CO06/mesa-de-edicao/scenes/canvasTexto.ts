import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { ART_BOX, ART_SHEET, SHEET } from '../data/art'
import { CONTENT, CONTENT_LEFT, PAPER, PIECE, type SuporteGeo } from '../data/layout'
import { C, CSS, FONT, TITLE_STEPS } from '../data/theme'
import type { Medida, Peca } from '../types'

/**
 * O CARTAZ — papel pregado na cortiça.
 *
 * O título é TEXTO de verdade, no tamanho de verdade: é a única forma de a
 * palavra deixar de caber e de a criança VER isso acontecer. O recorte é uma
 * máscara no nível da cena, e não um filho do contêiner — máscara de geometria
 * não acompanha a transformação do pai, então ela é desligada antes de a peça
 * voar e religada quando ela volta.
 */
export function createCanvasTexto(
    scene: Phaser.Scene,
    inner: Phaser.GameObjects.Container,
    geo: SuporteGeo,
) {
    const paper = scene.add.graphics()
    inner.add(paper)
    paper.fillStyle(C.ink, 0.22)
    paper.fillRoundedRect(-PAPER.w / 2 + 4, -PAPER.h / 2 + 7, PAPER.w, PAPER.h, PAPER.radius)
    paper.fillStyle(C.paper, 1)
    paper.fillRoundedRect(-PAPER.w / 2, -PAPER.h / 2, PAPER.w, PAPER.h, PAPER.radius)
    paper.fillStyle(C.paperShade, 1)
    paper.fillRoundedRect(-PAPER.w / 2, PAPER.h / 2 - 16, PAPER.w, 16, PAPER.radius)

    const pins = scene.add.graphics()
    inner.add(pins)
    const pin = (x: number) => {
        pins.fillStyle(C.ink, 0.3)
        pins.fillCircle(x + 2, -PAPER.h / 2 + 16, 9)
        pins.fillStyle(C.amber, 1)
        pins.fillCircle(x, -PAPER.h / 2 + 14, 9)
        pins.fillStyle(C.white, 0.7)
        pins.fillCircle(x - 3, -PAPER.h / 2 + 11, 3)
    }
    pin(-PAPER.w / 2 + 26)
    pin(PAPER.w / 2 - 26)

    const photo = scene.textures.exists(SHEET.art)
        ? scene.add.image(0, CONTENT.imageY, SHEET.art, 0)
        : undefined
    const photoBack = scene.add.graphics()
    inner.add(photoBack)
    if (photo) inner.add(photo)

    const title = scene.add
        .text(0, CONTENT.titleY, '', {
            fontFamily: FONT.body,
            fontSize: `${TITLE_STEPS[0]}px`,
            color: CSS.ink,
        })
        .setOrigin(0.5)
        .setResolution(2)
    inner.add(title)

    const phrase = scene.add
        .text(0, CONTENT.phraseY, '', {
            fontFamily: FONT.body,
            fontSize: `${CONTENT.phraseSize}px`,
            color: CSS.ink,
            align: 'center',
            wordWrap: { width: CONTENT.w },
            lineSpacing: 3,
        })
        .setOrigin(0.5)
        .setResolution(2)
    inner.add(phrase)

    const shape = scene.make.graphics({ x: 0, y: 0 }, false)
    shape.fillStyle(0xffffff, 1)
    shape.fillRoundedRect(
        PIECE.cx + geo.innerDX - PAPER.w / 2,
        PIECE.cy + geo.innerDY - PAPER.h / 2,
        PAPER.w,
        PAPER.h,
        PAPER.radius,
    )
    const mask = shape.createGeometryMask()
    title.setMask(mask)

    const paintPhoto = (peca: Peca) => {
        const box = ART_BOX[peca.imagem] ?? ART_BOX[0]
        const artH = box.h * ART_SHEET.frameHeight
        const scale = CONTENT.imageH / artH
        const w = box.w * ART_SHEET.frameWidth * scale
        const cx = peca.centro ? 0 : CONTENT_LEFT + w / 2

        photoBack.clear()
        if (photo) {
            photo.setFrame(peca.imagem)
            photo.setScale(scale)
            photo.setPosition(
                cx - (box.cx - 0.5) * ART_SHEET.frameWidth * scale,
                CONTENT.imageY - (box.cy - 0.5) * ART_SHEET.frameHeight * scale,
            )
            return
        }
        photoBack.fillStyle(C.wallDeep, 1)
        photoBack.fillRoundedRect(cx - w / 2, CONTENT.imageY - CONTENT.imageH / 2, w, CONTENT.imageH, 10)
        photoBack.fillStyle(C.slate, 0.6)
        photoBack.fillTriangle(
            cx - w / 4, CONTENT.imageY + CONTENT.imageH / 3,
            cx, CONTENT.imageY - CONTENT.imageH / 4,
            cx + w / 4, CONTENT.imageY + CONTENT.imageH / 3,
        )
    }

    return {
        render(peca: Peca) {
            title.setStyle({
                fontFamily: FONT.body,
                fontSize: `${TITLE_STEPS[peca.tamanho - 1]}px`,
                fontStyle: peca.forte ? 'bold' : 'normal',
                color: CSS.ink,
            })
            title.setText(peca.titulo)
            if (peca.centro) title.setOrigin(0.5, 0.5).setX(0)
            else title.setOrigin(0, 0.5).setX(CONTENT_LEFT)

            phrase.setText(peca.frase)
            phrase.setAlign(peca.centro ? 'center' : 'left')
            if (peca.centro) phrase.setOrigin(0.5, 0.5).setX(0)
            else phrase.setOrigin(0, 0.5).setX(CONTENT_LEFT)

            paintPhoto(peca)
        },

        measure(): Medida {
            return { tituloCabe: title.displayWidth <= CONTENT.w, textoCabe: true }
        },

        async react() {
            await FX.impact(scene, title, 0.1)
        },

        setClip(on: boolean) {
            if (on) title.setMask(mask)
            else title.clearMask()
        },

        destroy() {
            title.clearMask()
            mask.destroy()
            shape.destroy()
        },
    }
}
