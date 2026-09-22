import Phaser from 'phaser'
import { C, FONT, HEX } from '../data/theme'

/**
 * O BOTÃO DE SEGUIR, e a regra que ele carrega.
 *
 * TODO painel que para o jogo para ser lido tem um destes, e NENHUM deles sai
 * sozinho. Os cartões da abertura e os fechos saíam num `delayedCall` de 4 e de
 * 6 segundos, e cronômetro de leitura castiga exatamente quem precisa do
 * painel: quem lê devagar. Quem lê rápido toca e passa; quem não lê, fica.
 *
 * Ele mora no primeiro nível da cena (e não dentro do painel) porque o teste de
 * toque do Phaser corrige o `scrollFactor` pelo objeto QUE RECEBE o toque, e
 * não pelo container em que ele está: filho de container com `scrollFactor(0)`
 * continua sendo testado como se fosse do mundo, e num mapa de 3600 px o clique
 * cai a meia tela do desenho.
 */
export interface Botao {
    /** Põe o botão em cena, com o rótulo e o que fazer quando tocarem. */
    mostrar(x: number, y: number, rotulo: string, onClick: () => void): void
    esconder(): void
    destroy(): void
}

const ALTURA = 62

export function criarBotao(scene: Phaser.Scene, depth = 650): Botao {
    const raiz = scene.add
        .container(0, 0)
        .setDepth(depth)
        .setScrollFactor(0)
        .setVisible(false)

    const fundo = scene.add.graphics()
    const texto = scene.add
        .text(0, 0, '', { fontFamily: FONT.black, fontSize: '30px', color: HEX.white })
        .setOrigin(0.5)
    raiz.add([fundo, texto])

    /*
     * QUEM RECEBE O TOQUE É UMA `Zone`, e não o container do desenho.
     *
     * Duas tentativas falharam antes desta, e as duas valem para os outros 50:
     *
     * 1. `container.setInteractive()` sem argumento congela a área de toque no
     *    tamanho que o container tem NAQUELE instante — e um container
     *    recém-criado tem 0 × 0. O botão aparecia inteiro e não recebia nada.
     *
     * 2. `setInteractive(retangulo, Contains)` deu `input.hitAreaCallback is not
     *    a function`, e esse erro estoura DENTRO da varredura de toque do
     *    Phaser: derruba o teste inteiro daquele quadro. O botão do tutorial,
     *    que não tem nada a ver com este arquivo, parou de responder junto —
     *    um objeto mal registrado cega a cena toda.
     *
     * `Zone.setSize(w, h)` redimensiona a área de toque junto com a caixa, que
     * é o caminho suportado, e é o mesmo que o kit já usa nas cartas.
     */
    const zona = scene.add
        .zone(0, 0, 230, ALTURA + 8)
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(depth + 1)
        .setInteractive({ useHandCursor: true })

    let acao: (() => void) | null = null

    zona.on('pointerdown', () => {
        if (!acao) return
        const chamar = acao
        acao = null
        scene.tweens.add({ targets: raiz, scale: 0.94, duration: 70, yoyo: true })
        chamar()
    })

    const ligar = (v: boolean) => {
        if (zona.input) zona.input.enabled = v
    }
    ligar(false)

    const api: Botao = {
        mostrar: (x, y, rotulo, onClick) => {
            acao = onClick
            texto.setText(rotulo)
            const largura = Math.max(230, texto.width + 84)

            fundo.clear()
            fundo.fillStyle(C.ink, 0.28)
            fundo.fillRoundedRect(-largura / 2 + 4, -ALTURA / 2 + 6, largura, ALTURA, ALTURA / 2)
            fundo.fillStyle(C.warn, 1)
            fundo.fillRoundedRect(-largura / 2, -ALTURA / 2, largura, ALTURA, ALTURA / 2)
            /* O brilho de cima é o que faz a pílula parecer apertável. */
            fundo.fillStyle(C.white, 0.2)
            fundo.fillRoundedRect(-largura / 2 + 7, -ALTURA / 2 + 6, largura - 14, 20, 10)
            fundo.lineStyle(4, C.white, 0.85)
            fundo.strokeRoundedRect(-largura / 2, -ALTURA / 2, largura, ALTURA, ALTURA / 2)

            zona.setPosition(x, y).setSize(largura, ALTURA + 8)
            ligar(true)

            raiz.setPosition(x, y).setScale(1).setVisible(true).setAlpha(0)
            scene.tweens.killTweensOf(raiz)
            scene.tweens.add({
                targets: raiz,
                alpha: 1,
                duration: 220,
                delay: 160,
                ease: 'Back.easeOut',
            })
        },

        esconder: () => {
            acao = null
            ligar(false)
            scene.tweens.killTweensOf(raiz)
            raiz.setVisible(false)
        },

        destroy: () => {
            acao = null
            scene.tweens.killTweensOf(raiz)
            zona.destroy()
            raiz.destroy()
        },
    }

    return api
}
