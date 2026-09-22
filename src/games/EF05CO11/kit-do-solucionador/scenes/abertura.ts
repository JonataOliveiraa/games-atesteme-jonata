import Phaser from 'phaser'
import { H, W } from '../data/layout'
import { C, FONT, HEX } from '../data/theme'
import { boxOf, cutSheet, type Sheet } from './sheet'
import { criarBotao, type Botao } from './botao'

/**
 * A ABERTURA: quem é a criança, e o que ela vai fazer aqui.
 *
 * O jogo começava na vila, com um kit subindo e um recado de uma linha — e a
 * criança tinha de deduzir sozinha que ela é quem leva a notícia, que as casas
 * de porta aberta são as que faltam avisar, e que o Sr. Exagero não é o chefe
 * dela. Três coisas que custam dois cartões para dizer, e que sem elas fazem o
 * primeiro minuto inteiro ser adivinhação.
 *
 * Cada cartão tem UMA frase de título e UMA de explicação, uma figura grande, e
 * um botão PRÓXIMO — e só o botão o tira da tela. Quem já sabe passa em dois
 * toques; quem lê devagar lê o tempo que quiser.
 */
export interface Cartao {
    titulo: string
    linha: string
    /** A folha e o quadro da figura: `ferramentas`, `exagero` ou `gente`. */
    folha: 'ferramentas' | 'exagero' | 'gente'
    frame: number
    /** O que vai escrito no botão. O padrão é "Próximo". */
    botao?: string
}

export interface Abertura {
    cartao(c: Cartao): Promise<void>
    /** A faixa que acompanha a volta da vila. Fica até mandarem tirar. */
    legenda(texto: string): void
    limparLegenda(): void
    destroy(): void
}

const GRADES: Record<string, [number, number]> = {
    ferramentas: [4, 3],
    exagero: [5, 1],
    gente: [6, 1],
}

export function createAbertura(scene: Phaser.Scene): Abertura {
    const folhas: Record<string, Sheet | null> = {}
    for (const [key, [cols, rows]] of Object.entries(GRADES)) {
        folhas[key] = cutSheet(scene, key, cols, rows)
    }

    const root = scene.add
        .container(0, 0)
        .setDepth(620)
        .setScrollFactor(0)
        .setVisible(false)

    const veu = scene.add.graphics()
    veu.fillStyle(C.ink, 0.8)
    veu.fillRect(0, 0, W, H)
    root.add(veu)

    const painel = scene.add.graphics()
    painel.fillStyle(C.ink, 0.3)
    painel.fillRoundedRect(196, 190, 900, 344, 28)
    painel.fillStyle(C.card, 1)
    painel.fillRoundedRect(190, 182, 900, 344, 28)
    painel.lineStyle(6, C.warnDark, 1)
    painel.strokeRoundedRect(190, 182, 900, 344, 28)
    root.add(painel)

    const arte = scene.add.image(340, 360, 'ferramentas', '0').setOrigin(0.5)
    root.add(arte)

    const titulo = scene.add
        .text(486, 268, '', {
            fontFamily: FONT.black,
            fontSize: '40px',
            color: HEX.ink,
            wordWrap: { width: 560 },
            lineSpacing: 4,
        })
        .setOrigin(0, 0.5)
    root.add(titulo)

    const linha = scene.add
        .text(486, 330, '', {
            fontFamily: FONT.body,
            fontSize: '27px',
            color: HEX.inkSoft,
            wordWrap: { width: 566 },
            lineSpacing: 8,
        })
        .setOrigin(0, 0)
    root.add(linha)

    /*
     * O botão vive FORA do `root`: o teste de toque do Phaser corrige o
     * `scrollFactor` pelo objeto tocado, e não pelo container dele.
     */
    const botao: Botao = criarBotao(scene, 650)

    /* A faixa da volta da vila: mesma linguagem do recado do dia. */
    const faixa = scene.add
        .container(W / 2, 128)
        .setDepth(610)
        .setScrollFactor(0)
        .setVisible(false)
    const faixaBg = scene.add.graphics()
    const faixaTexto = scene.add
        .text(0, 0, '', { fontFamily: FONT.black, fontSize: '30px', color: HEX.card })
        .setOrigin(0.5)
    faixa.add([faixaBg, faixaTexto])

    /* Uma tampa: enquanto o cartão está na tela, nada atrás dele recebe toque. */
    let tampa: Phaser.GameObjects.Zone | null = null

    const api: Abertura = {
        cartao: c =>
            new Promise<void>(resolve => {
                const folha = folhas[c.folha]
                if (scene.textures.exists(c.folha) && folha) {
                    const box = boxOf(folha, c.frame)
                    const escala = Math.min(
                        230 / (box.width * folha.frameW),
                        200 / (box.height * folha.frameH),
                    )
                    const dx = (box.left + box.width / 2 - 0.5) * folha.frameW * escala
                    const dy = (box.top + box.height / 2 - 0.5) * folha.frameH * escala
                    arte
                        .setTexture(c.folha, String(c.frame))
                        .setScale(escala)
                        .setPosition(340 - dx, 360 - dy)
                        .setVisible(true)
                } else {
                    arte.setVisible(false)
                }

                titulo.setText(c.titulo)
                linha.setText(c.linha)
                linha.setY(268 + titulo.height / 2 + 22)

                root.setVisible(true).setAlpha(0)
                scene.tweens.killTweensOf(root)
                scene.tweens.add({ targets: root, alpha: 1, duration: 240 })

                /*
                 * SÓ O BOTÃO FECHA O CARTÃO.
                 *
                 * Havia um `delayedCall` de 4,2 s aqui, e um toque em qualquer
                 * lugar da tela. Os dois saíram: relógio tira o texto da frente
                 * de quem ainda está lendo, e toque solto fecha sem querer.
                 */
                let pronto = false
                const soltar = () => {
                    if (pronto) return
                    pronto = true
                    botao.esconder()
                    tampa?.destroy()
                    tampa = null
                    scene.tweens.killTweensOf(root)
                    scene.tweens.add({
                        targets: root,
                        alpha: 0,
                        duration: 200,
                        onComplete: () => {
                            root.setVisible(false)
                            resolve()
                        },
                    })
                }

                tampa = scene.add
                    .zone(W / 2, H / 2, W, H)
                    .setOrigin(0.5)
                    .setScrollFactor(0)
                    .setDepth(630)
                    .setInteractive()
                botao.mostrar(W / 2, 584, c.botao ?? 'Próximo', soltar)
            }),

        legenda: texto => {
            faixaTexto.setScale(1).setText(texto)
            if (faixaTexto.width > 1000) faixaTexto.setScale(1000 / faixaTexto.width)
            const w = faixaTexto.width * faixaTexto.scaleX + 72
            faixaBg.clear()
            faixaBg.fillStyle(C.ink, 0.85)
            faixaBg.fillRoundedRect(-w / 2, -30, w, 60, 30)
            faixaBg.lineStyle(3, C.warn, 0.85)
            faixaBg.strokeRoundedRect(-w / 2, -30, w, 60, 30)

            scene.tweens.killTweensOf(faixa)
            faixa.setVisible(true).setAlpha(0).setY(104)
            scene.tweens.add({
                targets: faixa,
                alpha: 1,
                y: 128,
                duration: 300,
                ease: 'Back.easeOut',
            })
        },

        limparLegenda: () => {
            scene.tweens.killTweensOf(faixa)
            scene.tweens.add({
                targets: faixa,
                alpha: 0,
                duration: 240,
                onComplete: () => faixa.setVisible(false),
            })
        },

        destroy: () => {
            scene.tweens.killTweensOf([root, faixa])
            tampa?.destroy()
            tampa = null
            botao.destroy()
            faixa.destroy()
            root.destroy()
        },
    }

    return api
}
