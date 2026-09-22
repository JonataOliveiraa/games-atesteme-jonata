import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { FONT_JOGO } from '../../../../shared/fonts/gameFont'
import { C, CSS } from '../data/theme'
import { DEPTH, H, W } from '../data/layout'
import { COISA, IMAGES, SHEETS, TUCA_F, has } from '../data/files'
import { criarTuca, type Tuca } from './tuca'
import { criarAudio, type Audio } from './audio'

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  A INTRODUÇÃO
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Três momentos, uma frase curta em cada, e **a criança que passa de um para o
 * outro**, no botão. Nada some sozinho por tempo: quem lê devagar não perde a
 * frase, e quem já leu não espera.
 *
 *   1. o Tuca acena       — "Oi! Eu sou o Tuca."
 *   2. os brinquedos caem — "Caiu tudo no chão!"
 *   3. o convite          — "Vamos guardar?"
 *
 * **Quando ele fala, o salão escurece e só ele fica aceso.** É o jeito mais
 * direto de dizer "olhe aqui" sem escrever isso: a luz vai onde a atenção
 * precisa ir, e a bagunça continua visível ao fundo, apagada.
 *
 * As palavras são as mais simples que eu consegui. Nada de "organizar",
 * "estrutura" ou "classificar" — quem ainda não lê entende só pelo desenho.
 */

const PASSOS = [
    { fala: 'Oi! Eu sou o Tuca.', pose: TUCA_F.acenando, botao: 'Próximo' },
    { fala: 'Caiu tudo no chão!', pose: TUCA_F.curioso, botao: 'Próximo' },
    { fala: 'Vamos guardar?', pose: TUCA_F.apontando, botao: 'Vamos!' },
]

const TUCA_X = 316
const TUCA_Y = 452

export class IntroScene extends Phaser.Scene {
    private tuca!: Tuca
    private audio!: Audio
    private coisas: Phaser.GameObjects.Image[] = []
    private escuro!: Phaser.GameObjects.Rectangle
    private foco!: Phaser.GameObjects.Ellipse
    private botao?: Phaser.GameObjects.Container
    private passo = 0
    private ocupado = false
    private saindo = false
    private proximo: { level: number; points: number } = { level: 1, points: 0 }

    constructor() {
        super({ key: 'IntroScene' })
    }

    init(data: { level?: number; points?: number }) {
        this.proximo = { level: data.level ?? 1, points: data.points ?? 0 }
        this.saindo = false
        this.ocupado = false
        this.passo = 0
        this.coisas = []
    }

    create() {
        this.audio = criarAudio()

        if (has(this, IMAGES.fundo)) {
            this.add.image(W / 2, H / 2, IMAGES.fundo).setDisplaySize(W, H).setDepth(DEPTH.fundo)
        } else {
            this.add.rectangle(W / 2, H / 2, W, H, C.papel).setDepth(DEPTH.fundo)
        }

        /* O FOCO. A elipse quente entra por baixo do Tuca e o véu escuro por
           cima de todo o resto — os dois juntos são o refletor. */
        this.foco = this.add.ellipse(TUCA_X, TUCA_Y + 30, 520, 470, C.ambar, 0.16)
            .setDepth(DEPTH.faixa - 2).setAlpha(0)
        this.escuro = this.add.rectangle(W / 2, H / 2, W, H, 0x1a1208, 0.62)
            .setDepth(DEPTH.faixa - 3).setAlpha(0)

        this.tuca = criarTuca(this, TUCA_X, TUCA_Y, 1.2)
        this.tuca.sprite.setDepth(DEPTH.faixa - 1).setAlpha(0)

        this.botaoPular()
        void this.entrar()
    }

    /* ─────────────────────────────── a história ───────────────────────── */

    private async entrar() {
        this.tuca.pose(TUCA_F.acenando)
        await FX.popIn(this, this.tuca.sprite, { from: 0.6, duration: 460 })
        if (this.saindo) return
        this.audio.oi()
        await this.mostrarPasso()
    }

    /** Acende o refletor, põe a pose, diz a frase e oferece o botão. */
    private async mostrarPasso() {
        const p = PASSOS[this.passo]
        this.tuca.pose(p.pose)
        await this.acender(true)
        if (this.saindo) return
        this.tuca.fala(p.fala)
        this.mostrarBotao(p.botao)
        this.ocupado = false
    }

    private async avancar() {
        if (this.ocupado || this.saindo) return
        this.ocupado = true

        this.esconderBotao()
        this.tuca.fala()

        /* Saindo do passo 1: apaga o refletor e derruba os brinquedos à luz do
           dia — a queda é o que a criança precisa VER, não uma frase por cima. */
        if (this.passo === 0) {
            await this.acender(false)
            if (this.saindo) return
            this.tuca.pose(TUCA_F.espiando)
            await this.derrubar()
            if (this.saindo) return
        }

        this.passo += 1
        if (this.passo >= PASSOS.length) { this.sair(); return }
        await this.mostrarPasso()
    }

    private acender(on: boolean): Promise<void> {
        return FX.all(
            FX.to(this, this.escuro, { alpha: on ? 1 : 0 }, { duration: 340 }),
            FX.to(this, this.foco, { alpha: on ? 1 : 0 }, { duration: 340 }),
        )
    }

    /**
     * Os brinquedos caem do alto, quicam e ficam tortos no chão. É a única vez
     * em que o jogo mostra bagunça de verdade — e é ela que dá sentido a tudo
     * que a criança vai fazer depois.
     */
    private async derrubar() {
        const quais = [COISA.ursinho, COISA.bola, COISA.livro, COISA.caixa, COISA.planta, COISA.chapeu]
        const jobs: Array<Promise<unknown>> = []

        quais.forEach((objeto, i) => {
            const x = 620 + (i % 3) * 230 + (i > 2 ? 110 : 0)
            const y = 432 + Math.floor(i / 3) * 154
            const img = has(this, SHEETS.coisas.key)
                ? this.add.image(x, -160, SHEETS.coisas.key, objeto).setDisplaySize(158, 158)
                : (this.add.rectangle(x, -160, 130, 130, C.madeira) as unknown as Phaser.GameObjects.Image)
            img.setDepth(DEPTH.solta).setAngle(Phaser.Math.Between(-30, 30))
            this.coisas.push(img)

            jobs.push(new Promise<void>(res => {
                this.time.delayedCall(i * 160, () => {
                    this.audio.cair()
                    this.tweens.add({
                        targets: img,
                        y,
                        angle: Phaser.Math.Between(-22, 22),
                        duration: 620,
                        ease: 'Bounce.easeOut',
                        onComplete: () => res(),
                    })
                })
            }))
        })

        await FX.all(...jobs)
        void FX.shakeCam(this, 'leve')
        await FX.wait(this, 240)
    }

    /* ──────────────────────────────── botões ──────────────────────────── */

    private mostrarBotao(rotulo: string) {
        this.esconderBotao()
        const c = this.add.container(TUCA_X, H + 80).setDepth(DEPTH.intro)

        const larg = rotulo.length > 7 ? 340 : 300
        const g = this.add.graphics()
        g.fillStyle(C.ambar, 1)
        g.fillRoundedRect(-larg / 2, -44, larg, 88, 44)
        g.fillStyle(0xffffff, 0.22)
        g.fillRoundedRect(-larg / 2 + 12, -34, larg - 24, 30, 15)
        c.add(g)
        c.add(this.add.text(0, 0, rotulo, {
            fontFamily: FONT_JOGO.black, fontSize: '40px', color: CSS.tinta,
        }).setOrigin(0.5).setResolution(2))

        c.setSize(larg, 88).setInteractive({ useHandCursor: true })
        c.on('pointerdown', () => { this.audio.pegar(); void this.avancar() })

        this.botao = c
        void FX.to(this, c, { y: 640 }, { duration: 380, ease: 'Back.easeOut' })
        FX.breathe(this, c, { grow: 1.05, duration: 1000 })
    }

    private esconderBotao() {
        const c = this.botao
        this.botao = undefined
        if (!c) return
        FX.kill(this, c)
        void FX.to(this, c, { y: H + 80, alpha: 0 }, { duration: 220 })
            .then(() => c.destroy())
    }

    private botaoPular() {
        const c = this.add.container(W - 112, 48).setDepth(DEPTH.intro)
        const g = this.add.graphics()
        g.fillStyle(C.tinta, 0.72)
        g.fillRoundedRect(-86, -30, 172, 60, 30)
        c.add(g)
        c.add(this.add.text(0, 0, 'Pular', {
            fontFamily: FONT_JOGO.black, fontSize: '28px', color: CSS.creme,
        }).setOrigin(0.5).setResolution(2))
        c.setSize(172, 60).setInteractive({ useHandCursor: true })
        c.on('pointerdown', () => this.sair())
    }

    /* ─────────────────────────────── a saída ──────────────────────────── */

    private sair() {
        if (this.saindo) return
        this.saindo = true
        this.tuca.fala()
        this.tuca.pose(TUCA_F.feliz)
        this.esconderBotao()
        void this.acender(false)

        this.cameras.main.fadeOut(300, 243, 226, 200)
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.audio.destroy()
            this.scene.start('GameScene', this.proximo)
        })
    }
}
