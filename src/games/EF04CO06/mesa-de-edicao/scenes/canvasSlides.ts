import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { ART_BOX, ART_SHEET, SHEET } from '../data/art'
import { PIECE, SLIDE, type SuporteGeo } from '../data/layout'
import { C, CSS, FONT, TITLE_STEPS } from '../data/theme'
import { frasesDoSlide, totalDeSlides } from '../data/levels'
import type { Medida, Peca } from '../types'

/**
 * O SLIDE — um só, grande, como numa apresentação de verdade.
 *
 * A primeira versão punha a tira inteira no telão: três cartõezinhos de 89 px
 * com barras cinzas no lugar do texto. O usuário reprovou, e com razão — não
 * havia como VER o problema, só barras. Agora o telão mostra o slide que está
 * passando, com as frases escritas, e "esse slide não acaba mais" é uma coisa
 * que se lê na tela: o texto passa do fim do slide e é cortado ali.
 *
 * Quantos slides existem aparece nas bolinhas do alto — é por elas que DIVIDIR
 * mostra que criou um slide novo.
 */
export function createCanvasSlides(
    scene: Phaser.Scene,
    inner: Phaser.GameObjects.Container,
    geo: SuporteGeo,
) {
    const meiaL = geo.innerW / 2
    const meiaA = geo.innerH / 2

    const back = scene.add.graphics()
    inner.add(back)

    const photo = scene.textures.exists(SHEET.art) ? scene.add.image(0, 0, SHEET.art, 0) : undefined
    const photoBack = scene.add.graphics()
    inner.add(photoBack)
    if (photo) inner.add(photo)

    const title = scene.add
        .text(0, SLIDE.titleY, '', {
            fontFamily: FONT.black,
            fontSize: `${TITLE_STEPS[2]}px`,
            color: CSS.ink,
        })
        .setOrigin(0.5)
        .setResolution(2)
    inner.add(title)

    const body = scene.add
        .text(0, 0, '', {
            fontFamily: FONT.body,
            fontSize: `${SLIDE.bodySize}px`,
            color: CSS.ink,
            align: 'left',
            wordWrap: { width: geo.innerW - SLIDE.pad * 2 },
            lineSpacing: SLIDE.lineGap,
        })
        .setOrigin(0.5, 0)
        .setResolution(2)
    inner.add(body)

    const dots = scene.add.graphics()
    inner.add(dots)

    /*
     * A tirinha da sobra mora num contêiner PRÓPRIO, fora do recorte do slide e
     * um pouco torto: ela não está no slide, ela caiu dele.
     */
    const sobraRoot = scene.add.container(0, SLIDE.sobraY).setAngle(-3)
    inner.add(sobraRoot)

    const sobraBack = scene.add.graphics()
    sobraRoot.add(sobraBack)

    const sobra = scene.add
        .text(0, 0, '', {
            fontFamily: FONT.body,
            fontSize: `${SLIDE.sobraSize}px`,
            color: CSS.ink,
            align: 'left',
            wordWrap: { width: geo.innerW - SLIDE.pad * 2 },
            lineSpacing: 6,
        })
        .setOrigin(0.5, 0)
        .setResolution(2)
    sobraRoot.add(sobra)

    const shape = scene.make.graphics({ x: 0, y: 0 }, false)
    shape.fillStyle(0xffffff, 1)
    shape.fillRect(
        PIECE.cx + geo.innerDX - meiaL,
        PIECE.cy + geo.innerDY - meiaA,
        geo.innerW,
        geo.innerH,
    )
    const mask = shape.createGeometryMask()
    body.setMask(mask)
    title.setMask(mask)

    let atual: Peca | undefined
    let sobrando: string[] = []

    const bodyTop = (peca: Peca) => (peca.comFoto ? SLIDE.bodyComFoto : SLIDE.bodySemFoto)
    const bodyLimite = (peca: Peca) => meiaA - SLIDE.pad - bodyTop(peca)

    /**
     * QUANTAS FRASES CABEM, E O QUE SOBRA.
     *
     * A versão anterior desenhava tudo e deixava o recorte comer o fim: o slide
     * mostrava quatro linhas, tinha seis, e as duas que faltavam eram invisíveis.
     * Uma faixa com setinhas avisava que faltava coisa — mas faixa é um símbolo
     * que precisa ser aprendido, e ninguém aprendeu.
     *
     * Agora o texto é PARTIDO aqui: o que cabe fica no slide, e o que sobra vai
     * para a tirinha caída embaixo do telão, escrito por extenso. A criança lê o
     * que não coube, e vê exatamente o que DIVIDIR vai levar para o slide novo.
     */
    const partir = (frases: string[], limite: number) => {
        if (!frases.length) return { dentro: [] as string[], fora: [] as string[] }
        body.setText(frases.join('\n'))
        const altura = body.height / frases.length
        const cabem = Math.max(1, Math.min(frases.length, Math.floor(limite / altura)))
        return { dentro: frases.slice(0, cabem), fora: frases.slice(cabem) }
    }

    const paintSobra = (fora: string[]) => {
        sobraBack.clear()
        if (!fora.length) {
            sobra.setText('')
            sobraRoot.setVisible(false)
            return
        }
        sobraRoot.setVisible(true)
        sobra.setText(fora.join('\n'))
        const w = Math.min(geo.innerW - 8, sobra.width + SLIDE.sobraPad * 2)
        const h = sobra.height + SLIDE.sobraPad * 2
        sobra.setY(-h / 2 + SLIDE.sobraPad)
        sobraBack.fillStyle(C.ink, 0.25)
        sobraBack.fillRoundedRect(-w / 2 + 3, -h / 2 + 5, w, h, 8)
        sobraBack.fillStyle(C.paper, 1)
        sobraBack.fillRoundedRect(-w / 2, -h / 2, w, h, 8)
        sobraBack.lineStyle(3, C.amberDeep, 1)
        sobraBack.strokeRoundedRect(-w / 2, -h / 2, w, h, 8)
    }

    const paintDots = (peca: Peca) => {
        const total = totalDeSlides(peca)
        dots.clear()
        const passo = 26
        const largura = (total - 1) * passo
        for (let i = 0; i < total; i++) {
            const x = -largura / 2 + i * passo
            dots.fillStyle(i === 0 ? C.amber : C.wallDeep, 1)
            dots.fillCircle(x, SLIDE.dotsY, 9)
            dots.lineStyle(3, C.ink, 0.6)
            dots.strokeCircle(x, SLIDE.dotsY, 9)
        }
    }

    const paintPhoto = (peca: Peca) => {
        photoBack.clear()
        photo?.setVisible(false)
        if (!peca.comFoto) return

        const box = ART_BOX[peca.imagem] ?? ART_BOX[0]
        const artW = box.w * ART_SHEET.frameWidth
        const artH = box.h * ART_SHEET.frameHeight
        const scale = Math.min((geo.innerW - SLIDE.pad * 4) / artW, SLIDE.fotoH / artH)

        if (!photo) {
            photoBack.fillStyle(C.wallDeep, 1)
            photoBack.fillRoundedRect(-(artW * scale) / 2, SLIDE.fotoY - SLIDE.fotoH / 2, artW * scale, SLIDE.fotoH, 8)
            return
        }
        photo.setFrame(peca.imagem)
        photo.setScale(scale)
        photo.setPosition(
            -(box.cx - 0.5) * ART_SHEET.frameWidth * scale,
            SLIDE.fotoY - (box.cy - 0.5) * ART_SHEET.frameHeight * scale,
        )
        photo.setVisible(true)
    }

    return {
        render(peca: Peca) {
            atual = peca
            back.clear()
            back.fillStyle(C.white, 1)
            back.fillRect(-meiaL, -meiaA, geo.innerW, geo.innerH)
            back.lineStyle(3, C.wallDeep, 1)
            back.strokeRect(-meiaL + 4, -meiaA + 4, geo.innerW - 8, geo.innerH - 8)

            title.setFontSize(TITLE_STEPS[peca.tamanho - 1])
            title.setText(peca.titulo)

            const { dentro, fora } = partir(frasesDoSlide(peca), bodyLimite(peca))
            body.setText(dentro.join('\n'))
            body.setY(bodyTop(peca))
            sobrando = fora

            paintPhoto(peca)
            paintDots(peca)
            paintSobra(fora)
        },

        /** Cabe quando o título não passa da borda e o texto termina dentro do slide. */
        measure(): Medida {
            if (!atual) return { tituloCabe: true, textoCabe: true }
            return {
                tituloCabe: title.displayWidth <= geo.innerW - SLIDE.pad * 2,
                textoCabe: sobrando.length === 0,
            }
        },

        async react() {
            await FX.impact(scene, body, 0.08)
        },

        setClip(on: boolean) {
            if (on) {
                body.setMask(mask)
                title.setMask(mask)
                return
            }
            body.clearMask()
            title.clearMask()
        },

        destroy() {
            body.clearMask()
            title.clearMask()
            mask.destroy()
            shape.destroy()
        },
    }
}
