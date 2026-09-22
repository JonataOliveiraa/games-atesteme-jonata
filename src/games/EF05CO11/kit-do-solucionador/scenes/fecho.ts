import Phaser from 'phaser'
import { H, W } from '../data/layout'
import { C, FONT, HEX } from '../data/theme'
import { ferramenta } from '../data/ferramentas'
import { boxOf, cutSheet, type Sheet } from './sheet'
import { criarBotao, type Botao } from './botao'

export interface Fecho {
    /** O quadro do fim do dia: o que resolveu, e o que sobrou no carrinho. */
    dia(usadas: string[], sobraram: string[], titulo: string): Promise<void>
    /** O cartaz do nível, com a frase-síntese. */
    cartaz(): Promise<void>
    destroy(): void
}

const FRASE_SINTESE = 'Adequado é o que resolve ESTE problema —\nnão o mais caro nem o mais novo.'

export function createFecho(scene: Phaser.Scene): Fecho {
    const sheetF: Sheet | null = cutSheet(scene, 'ferramentas', 4, 3)
    const sheetE: Sheet | null = cutSheet(scene, 'exagero', 5, 1)

    /*
     * ELE MORA NA TELA, E NÃO NO MUNDO.
     *
     * Sem `setScrollFactor(0)` este painel é desenhado em coordenada de mundo:
     * o véu cobria de 0 a 1280 do MAPA, e não da tela. Quando o dia fechava com
     * o sino — que planta em x 1310 e deixa a câmera parada lá —, o quadro
     * inteiro aparecia 670 px à esquerda, meio fora da tela, com o véu tapando
     * só metade. Dava para ver como "a tela bugou", e era só isto.
     *
     * Num mundo de 3600 px, TODA sobreposição tem de dizer em qual dos dois
     * espaços ela vive. Aqui: na tela.
     */
    const root = scene.add.container(0, 0).setDepth(600).setScrollFactor(0).setVisible(false)
    const botao: Botao = criarBotao(scene, 655)
    const veu = scene.add.graphics()
    root.add(veu)

    const conteudo = scene.add.container(0, 0)
    root.add(conteudo)

    const desenharVeu = () => {
        veu.clear()
        veu.fillStyle(C.ink, 0.72)
        veu.fillRect(0, 0, W, H)
    }

    const iconeFerramenta = (id: string, x: number, y: number, alturaAlvo: number) => {
        if (!scene.textures.exists('ferramentas') || !sheetF) return null
        const f = ferramenta(id)
        const box = boxOf(sheetF, f.frame)
        const escala = Math.min(
            (alturaAlvo * 1.3) / (box.width * sheetF.frameW),
            alturaAlvo / (box.height * sheetF.frameH),
        )
        const dx = (box.left + box.width / 2 - 0.5) * sheetF.frameW * escala
        const dy = (box.top + box.height / 2 - 0.5) * sheetF.frameH * escala
        return scene.add
            .image(x - dx, y - dy, 'ferramentas', String(f.frame))
            .setOrigin(0.5)
            .setScale(escala)
    }

    const limpar = () => conteudo.removeAll(true)

    const mostrar = () =>
        new Promise<void>(resolve => {
            desenharVeu()
            root.setVisible(true).setAlpha(0)
            scene.tweens.add({ targets: root, alpha: 1, duration: 260, onComplete: () => resolve() })
        })

    /*
     * O FECHO ESPERA O BOTÃO, e não o cronômetro.
     *
     * Eram 6 s e um toque em qualquer lugar. Este quadro é o único lugar onde a
     * criança vê o que ela gastou e o que sobrou no carrinho — a lição inteira
     * do dia está nele. Tirar isso da frente de quem ainda está olhando é tirar
     * o dia inteiro.
     */
    const esperarBotao = (rotulo: string, y: number) =>
        new Promise<void>(resolve => {
            const tampa = scene.add
                .zone(W / 2, H / 2, W, H)
                .setOrigin(0.5)
                .setScrollFactor(0)
                .setDepth(640)
                .setInteractive()
            botao.mostrar(W / 2, y, rotulo, () => {
                botao.esconder()
                tampa.destroy()
                resolve()
            })
        })

    const sumir = () =>
        new Promise<void>(resolve => {
            scene.tweens.add({
                targets: root,
                alpha: 0,
                duration: 240,
                onComplete: () => {
                    root.setVisible(false)
                    limpar()
                    resolve()
                },
            })
        })

    const api: Fecho = {
        dia: async (usadas, sobraram, titulo) => {
            limpar()

            const painel = scene.add.graphics()
            painel.fillStyle(C.card, 1)
            painel.fillRoundedRect(140, 150, W - 280, 420, 26)
            painel.lineStyle(6, C.warnDark, 1)
            painel.strokeRoundedRect(140, 150, W - 280, 420, 26)
            conteudo.add(painel)

            conteudo.add(
                scene.add
                    .text(W / 2, 205, titulo, {
                        fontFamily: FONT.black,
                        fontSize: '40px',
                        color: HEX.ink,
                    })
                    .setOrigin(0.5),
            )

            conteudo.add(
                scene.add
                    .text(W / 2, 258, 'Ninguém ficou sem saber. Isto resolveu:', {
                        fontFamily: FONT.body,
                        fontSize: '28px',
                        color: HEX.ok,
                    })
                    .setOrigin(0.5),
            )

            const larguraUsadas = usadas.length * 120
            usadas.forEach((id, i) => {
                const x = W / 2 - larguraUsadas / 2 + 60 + i * 120
                const icone = iconeFerramenta(id, x, 340, 76)
                if (icone) {
                    icone.setAlpha(0).setScale(icone.scale * 0.6)
                    conteudo.add(icone)
                    scene.tweens.add({
                        targets: icone,
                        alpha: 1,
                        scale: icone.scale / 0.6,
                        duration: 260,
                        delay: 200 + i * 130,
                        ease: 'Back.easeOut',
                    })
                }
            })

            if (sobraram.length) {
                conteudo.add(
                    scene.add
                        .text(W / 2, 430, 'E isto voltou para o carrinho sem precisar sair:', {
                            fontFamily: FONT.body,
                            fontSize: '24px',
                            color: HEX.inkSoft,
                        })
                        .setOrigin(0.5),
                )

                const larguraSobra = sobraram.length * 92
                sobraram.forEach((id, i) => {
                    const x = W / 2 - larguraSobra / 2 + 46 + i * 92
                    const icone = iconeFerramenta(id, x, 500, 54)
                    if (icone) {
                        icone.setAlpha(0.55)
                        conteudo.add(icone)
                    }
                })

                if (scene.textures.exists('exagero') && sheetE) {
                    const box = boxOf(sheetE, 2)
                    const escala = 150 / (box.height * sheetE.frameH)
                    const homem = scene.add
                        .image(W - 250, 540, 'exagero', '2')
                        .setOrigin(0.5, 1)
                        .setScale(escala)
                    conteudo.add(homem)
                }
            }

            await mostrar()
            await esperarBotao('Próximo', 620)
            await sumir()
        },

        cartaz: async () => {
            limpar()

            const painel = scene.add.graphics()
            painel.fillStyle(C.card, 1)
            painel.fillRoundedRect(110, 190, W - 220, 340, 26)
            painel.lineStyle(6, C.warn, 1)
            painel.strokeRoundedRect(110, 190, W - 220, 340, 26)
            conteudo.add(painel)

            conteudo.add(
                scene.add
                    .text(W / 2, 258, 'Recadista da vila!', {
                        fontFamily: FONT.black,
                        fontSize: '44px',
                        color: HEX.warnDark,
                    })
                    .setOrigin(0.5),
            )

            conteudo.add(
                scene.add
                    .text(W / 2, 380, FRASE_SINTESE, {
                        fontFamily: FONT.black,
                        fontSize: '32px',
                        color: HEX.ink,
                        align: 'center',
                        lineSpacing: 10,
                    })
                    .setOrigin(0.5),
            )

            await mostrar()
            await esperarBotao('Próximo', 600)
            await sumir()
        },

        destroy: () => {
            scene.tweens.killTweensOf(root)
            botao.destroy()
            root.destroy()
        },
    }

    return api
}
