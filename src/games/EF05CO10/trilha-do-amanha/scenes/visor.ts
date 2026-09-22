import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, H, W } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import { cutSheet, fitFrame } from './sheet'
import type { Entrega, Item, MotivoFalha } from '../types'

interface Ponto {
    x: number
    y: number
}

const RAIO = 190
const CX = W / 2
const CY = 372

/**
 * O que o instrumento mostra: a tela escurece e sobra um círculo. Dentro dele
 * entra o quadro de `visoes.png` quando a escolha foi certa, e uma mancha
 * borrada quando não foi — a criança vê o motivo antes de ler.
 */
export function createVisor(scene: Phaser.Scene) {
    let feito: Phaser.GameObjects.GameObject[] = []

    const keep = <T extends Phaser.GameObjects.GameObject>(object: T): T => {
        feito.push(object)
        return object
    }

    const clear = () => {
        feito.forEach(object => {
            scene.tweens.killTweensOf(object)
            object.destroy()
        })
        feito = []
    }

    /** O buraco redondo na vinheta, pelo mesmo caminho do kit de tutorial. */
    const recorte = (raio: number) => {
        const spot = keep(
            scene.add.renderTexture(0, 0, W, H).setOrigin(0).setDepth(DEPTH.veil).setScrollFactor(0),
        )
        const pintar = () => {
            spot.clear()
            spot.fill(0x120d08, 0.92)
            const chave = `__visor_${Date.now()}`
            const molde = scene.make.graphics({ x: 0, y: 0 }, false)
            molde.fillStyle(0xffffff, 1)
            molde.fillCircle(raio, raio, raio)
            molde.generateTexture(chave, raio * 2, raio * 2)
            molde.destroy()
            const furo = scene.make.image({ key: chave }, false)
            spot.erase(furo, CX, CY)
            furo.destroy()
            scene.textures.remove(chave)
        }
        pintar()
        return spot
    }

    /** Um polígono ao longo de um eixo, para o cabo da lupa não ser um retângulo. */
    const barra = (
        g: Phaser.GameObjects.Graphics,
        de: number,
        ate: number,
        meiaDe: number,
        meiaAte: number,
        ang: number,
    ) => {
        const dx = Math.cos(ang)
        const dy = Math.sin(ang)
        const px = -dy
        const py = dx
        g.fillPoints(
            [
                { x: dx * de + px * meiaDe, y: dy * de + py * meiaDe },
                { x: dx * ate + px * meiaAte, y: dy * ate + py * meiaAte },
                { x: dx * ate - px * meiaAte, y: dy * ate - py * meiaAte },
                { x: dx * de - px * meiaDe, y: dy * de - py * meiaDe },
            ],
            true,
        )
    }

    const moldura = (id: string) => {
        const g = keep(scene.add.graphics().setDepth(DEPTH.panel + 1).setScrollFactor(0))
        g.setPosition(CX, CY)

        if (id === 'celular') {
            const w = RAIO * 1.72
            const h = RAIO * 2.12
            g.fillStyle(C.ink, 0.4)
            g.fillRoundedRect(-w / 2 + 6, -h / 2 + 10, w, h, 30)
            g.lineStyle(20, C.celular, 1)
            g.strokeRoundedRect(-w / 2, -h / 2, w, h, 30)
            g.lineStyle(5, 0x7d8898, 1)
            g.strokeRoundedRect(-w / 2 - 8, -h / 2 - 8, w + 16, h + 16, 36)
            g.fillStyle(C.ink, 0.9)
            g.fillRoundedRect(-52, -h / 2 - 2, 104, 20, 10)
            g.lineStyle(9, C.white, 0.92)
            const canto = 52
            const marcas: Array<[number, number, number, number]> = [
                [-w / 2 + 34, -h / 2 + 46, 1, 1],
                [w / 2 - 34, -h / 2 + 46, -1, 1],
                [-w / 2 + 34, h / 2 - 34, 1, -1],
                [w / 2 - 34, h / 2 - 34, -1, -1],
            ]
            marcas.forEach(([x, y, dx, dy]) => {
                g.lineBetween(x, y, x + canto * dx, y)
                g.lineBetween(x, y, x, y + canto * dy)
            })
            return g
        }

        if (id === 'lupa') {
            const ang = Math.PI * 0.25

            // o cabo primeiro, para o aro cobrir a emenda
            g.fillStyle(C.ink, 0.35)
            barra(g, RAIO * 0.74, RAIO * 1.52, 21, 16, ang + 0.02)
            g.fillStyle(0x7a2733, 1)
            barra(g, RAIO * 0.72, RAIO * 1.5, 19, 14, ang)
            g.fillStyle(C.lupa, 1)
            barra(g, RAIO * 0.72, RAIO * 1.44, 14, 10, ang)
            g.fillStyle(0xb9707c, 0.55)
            barra(g, RAIO * 0.8, RAIO * 1.34, 5, 4, ang - 0.05)

            // o anel de metal que prende o cabo no aro
            g.fillStyle(0x9aa4b2, 1)
            barra(g, RAIO * 0.72, RAIO * 0.98, 23, 21, ang)
            g.fillStyle(0xc6cedb, 1)
            barra(g, RAIO * 0.76, RAIO * 0.92, 18, 17, ang)

            // o aro: sombra, corpo escovado e o fio de luz por cima
            g.lineStyle(34, C.ink, 0.3)
            g.strokeCircle(3, 5, RAIO + 13)
            g.lineStyle(30, 0x818d9c, 1)
            g.strokeCircle(0, 0, RAIO + 12)
            g.lineStyle(14, 0xb9c3d1, 1)
            g.strokeCircle(0, 0, RAIO + 16)
            g.lineStyle(6, C.white, 0.75)
            g.beginPath()
            g.arc(0, 0, RAIO + 18, Phaser.Math.DegToRad(182), Phaser.Math.DegToRad(268))
            g.strokePath()
            g.lineStyle(7, C.ink, 0.5)
            g.strokeCircle(0, 0, RAIO - 2)

            // o vidro: dois brilhos na diagonal, como reflexo de janela
            g.fillStyle(C.white, 0.2)
            barra(g, -RAIO * 0.82, RAIO * 0.1, 34, 34, -Math.PI * 0.25)
            g.fillStyle(C.white, 0.14)
            barra(g, -RAIO * 0.5, RAIO * 0.42, 15, 15, -Math.PI * 0.25)
            return g
        }

        if (id === 'luneta') {
            g.lineStyle(30, C.ink, 0.35)
            g.strokeCircle(2, 4, RAIO + 12)
            g.lineStyle(26, 0x8a6528, 1)
            g.strokeCircle(0, 0, RAIO + 11)
            g.lineStyle(11, C.luneta, 1)
            g.strokeCircle(0, 0, RAIO + 15)
            g.lineStyle(6, 0xf0d9a4, 0.8)
            g.beginPath()
            g.arc(0, 0, RAIO + 17, Phaser.Math.DegToRad(188), Phaser.Math.DegToRad(262))
            g.strokePath()

            g.lineStyle(5, C.ink, 0.55)
            g.lineBetween(-RAIO * 0.58, 0, -RAIO * 0.16, 0)
            g.lineBetween(RAIO * 0.16, 0, RAIO * 0.58, 0)
            g.lineBetween(0, -RAIO * 0.58, 0, -RAIO * 0.16)
            g.lineBetween(0, RAIO * 0.16, 0, RAIO * 0.58)
            g.lineStyle(4, C.ink, 0.4)
            for (const t of [-0.42, -0.28, 0.28, 0.42]) {
                g.lineBetween(RAIO * t, -9, RAIO * t, 9)
            }
            g.fillStyle(C.ink, 0.22)
            g.fillCircle(0, 0, 7)
            return g
        }

        g.lineStyle(30, C.ink, 0.35)
        g.strokeCircle(2, 4, RAIO + 12)
        g.lineStyle(26, 0xa87a1c, 1)
        g.strokeCircle(0, 0, RAIO + 11)
        g.lineStyle(11, C.detector, 1)
        g.strokeCircle(0, 0, RAIO + 15)
        g.lineStyle(5, 0x2e7d4f, 0.55)
        for (const r of [0.34, 0.58, 0.82]) {
            g.strokeCircle(0, 0, RAIO * r)
        }
        return g
    }

    const ondas = () => {
        for (let i = 0; i < 3; i++) {
            const anel = keep(scene.add.graphics().setDepth(DEPTH.panel).setScrollFactor(0))
            anel.lineStyle(7, C.detector, 0.8)
            anel.strokeCircle(0, 0, RAIO * 0.42)
            anel.setPosition(CX, CY)
            scene.tweens.add({
                targets: anel,
                scale: 2.3,
                alpha: 0,
                duration: FX.ms(scene, 1100),
                delay: FX.ms(scene, i * 340),
                repeat: 1,
                ease: 'Sine.easeOut',
            })
        }
    }

    /** Só terra: é o que o olho vê quando a coisa está debaixo dela. */
    const soTerra = () => {
        const g = keep(scene.add.graphics().setDepth(DEPTH.panel).setScrollFactor(0))
        g.setPosition(CX, CY)
        g.fillStyle(C.terra, 1)
        g.fillCircle(0, 0, RAIO - 10)
        g.fillStyle(0x8a5b31, 1)
        for (let i = 0; i < 9; i++) {
            const a = (i / 9) * Math.PI * 2
            g.fillCircle(Math.cos(a) * RAIO * 0.5, Math.sin(a) * RAIO * 0.45, 12 + (i % 3) * 5)
        }
        g.fillStyle(0xb9a184, 1)
        g.fillCircle(-40, 30, 9)
        g.fillCircle(52, -18, 7)
        return g
    }

    const duvida = async () => {
        const mark = keep(
            scene.add
                .text(CX + RAIO * 0.62, CY - RAIO * 0.62, '?', {
                    fontFamily: FONT.black,
                    fontSize: '84px',
                    color: CSS.warn,
                })
                .setOrigin(0.5)
                .setResolution(2)
                .setDepth(DEPTH.panel + 2)
                .setScrollFactor(0),
        )
        mark.setStroke(CSS.white, 12)
        mark.setScale(0.3).setAlpha(0)
        await FX.to(scene, mark, { scale: 1, alpha: 1 }, { duration: 300, ease: 'Back.easeOut' })
    }

    /**
     * O MESMO desenho, em dois tamanhos.
     *
     * Grande, é o que o instrumento certo mostrou. Minúsculo, é o que continua
     * sendo sem ele — e é essa comparação que explica o erro sem uma palavra.
     */
    const revelacao = (visao: number, fator: number) => {
        const folha = cutSheet(scene, 'visoes', 3, 1)
        if (!folha) {
            const g = keep(scene.add.graphics().setDepth(DEPTH.panel).setScrollFactor(0))
            g.fillStyle(C.ok, 0.9)
            g.fillCircle(CX, CY, RAIO * 0.6 * fator)
            return g
        }
        // O quadrado que cabe DENTRO do círculo tem lado 2R/√2. Maior que isso
        // e o desenho escapa pela borda do visor.
        const cabe = RAIO * 1.32 * fator
        const fit = fitFrame(folha, visao, cabe, cabe)
        return keep(
            scene.add
                .image(CX + fit.offsetX, CY + fit.offsetY, 'visoes', String(visao))
                .setOrigin(0.5)
                .setDisplaySize(fit.width, fit.height)
                .setDepth(DEPTH.panel)
                .setScrollFactor(0),
        )
    }

    /** O mesmo desenho lá no mundo, do tamanho em que ele está: um pontinho. */
    const marcador = scene.add
        .image(0, 0, '__alvo')
        .setOrigin(0.5)
        .setDepth(DEPTH.carried)
        .setVisible(false)
    const halo = scene.add.graphics().setDepth(DEPTH.carried - 1).setVisible(false)

    /**
     * O instrumento sai da mão dele e vai até o alvo. Sem isso, o visor abre do
     * nada e a criança não liga uma coisa à outra.
     */
    const voar = async (item: Item, de: Ponto, para: Ponto) => {
        const folha = cutSheet(scene, item.sheet, item.cols, item.rows)
        const emUso = folha ? folha.cols + item.coluna : item.coluna
        const voador = folha
            ? (() => {
                  const fit = fitFrame(folha, emUso, 96, 96)
                  return keep(
                      scene.add
                          .image(de.x + fit.offsetX, de.y + fit.offsetY, item.sheet, String(emUso))
                          .setOrigin(0.5)
                          .setDisplaySize(fit.width, fit.height)
                          .setDepth(DEPTH.carried + 1),
                  )
              })()
            : (() => {
                  const g = keep(scene.add.graphics().setDepth(DEPTH.carried + 1))
                  g.fillStyle(item.cor, 1)
                  g.fillCircle(0, 0, 34)
                  g.setPosition(de.x, de.y)
                  return g
              })()

        voador.setScale(voador.scale * 0.7)
        await FX.to(scene, voador, { scale: voador.scale / 0.7 }, { duration: 220, ease: 'Back.easeOut' })
        await FX.arcTo(scene, voador, para, { height: 120, duration: 640 })

        // o ajuste de foco: ele procura em cima do alvo antes de mostrar
        await FX.to(scene, voador, { x: para.x - 22 }, { duration: 260, yoyo: true, ease: 'Sine.easeInOut' })
        await FX.to(scene, voador, { scale: voador.scale * 1.14 }, { duration: 200, yoyo: true })
        await FX.to(scene, voador, { alpha: 0, scale: voador.scale * 1.5 }, { duration: 260 })
        voador.destroy()
    }

    return {
        async show(item: Item, resultado: Entrega, visao: number, de: Ponto, para: Ponto) {
            clear()
            const viu = resultado.kind === 'chegou'

            await voar(item, de, para)

            const fundo = recorte(RAIO)
            fundo.setAlpha(0)
            const aro = moldura(item.id)
            aro.setAlpha(0).setScale(0.55)

            await FX.all(
                FX.to(scene, fundo, { alpha: 1 }, { duration: 300 }),
                FX.to(scene, aro, { alpha: 1, scale: 1 }, { duration: 420, ease: 'Back.easeOut' }),
            )

            if (item.id === 'detector') ondas()

            const motivo: MotivoFalha | null =
                resultado.kind === 'naoChegou' ? resultado.motivo : null

            const dentro = viu
                ? revelacao(visao, 1)
                : motivo === 'escondido'
                  ? soTerra()
                  : revelacao(visao, motivo === 'longeDemais' ? 0.14 : 0.2)

            if (viu) {
                dentro.setAlpha(0).setScale(0.6)
                await FX.to(scene, dentro, { alpha: 1, scale: 1 }, { duration: 420, ease: 'Back.easeOut' })
                await FX.wait(scene, 1500)
            } else {
                dentro.setAlpha(0)
                await FX.to(
                    scene,
                    dentro,
                    { alpha: motivo === 'longeDemais' ? 0.62 : 1 },
                    { duration: 300 },
                )
                await duvida()
                await FX.wait(scene, 1100)
            }

            await FX.all(
                FX.to(scene, [aro, dentro], { alpha: 0, scale: 0.7 }, { duration: 320 }),
                FX.to(scene, fundo, { alpha: 0 }, { duration: 360 }),
            )
            clear()
        },

        /**
         * O alvo no mundo, do tamanho em que ele está. É o contexto: a criança
         * vê a semente minúscula na mão dele ANTES de ir buscar a lupa.
         */
        marcarAlvo(x: number, y: number, visao: number, onde: 'mao' | 'chao' | 'longe') {
            scene.tweens.killTweensOf(halo)
            halo.clear()
            halo.setPosition(x, y).setVisible(true).setScale(1)
            halo.lineStyle(5, C.warn, 0.9)
            halo.strokeCircle(0, 0, 32)
            scene.tweens.add({
                targets: halo,
                alpha: { from: 0.95, to: 0 },
                scale: 2.1,
                duration: FX.ms(scene, 1100),
                repeat: -1,
                ease: 'Sine.easeOut',
            })

            const folha = cutSheet(scene, 'visoes', 3, 1)
            if (onde === 'chao' || !folha) {
                marcador.setVisible(false)
                return
            }
            const alvoPx = onde === 'longe' ? 26 : 42
            const fit = fitFrame(folha, visao, alvoPx, alvoPx)
            marcador
                .setTexture('visoes', String(visao))
                .setDisplaySize(fit.width, fit.height)
                .setPosition(x + fit.offsetX, y + fit.offsetY)
                .setVisible(true)
        },

        limparAlvo() {
            scene.tweens.killTweensOf(halo)
            halo.setVisible(false)
            marcador.setVisible(false)
        },

        clear,

        destroy() {
            clear()
            scene.tweens.killTweensOf(halo)
            halo.destroy()
            marcador.destroy()
        },
    }
}

export type Visor = ReturnType<typeof createVisor>
