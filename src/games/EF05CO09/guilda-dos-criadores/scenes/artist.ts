import Phaser from 'phaser'
import { FX, type FxTarget } from '../../../../shared/effects/FX'
import { ARTIST, ARTIST_BOX, DEPTH, HUD } from '../data/layout'
import { C, CSS, FONT, SIZE, TYPE_MS } from '../data/theme'
import { SHEETS, has } from '../data/files'
import { ARTIST_NAMES, POSE } from '../types'

const fx = (o: unknown) => o as unknown as FxTarget

/** O teto do balão: logo abaixo da linha de acento do cabeçalho. */
const BALLOON_TOP_MIN = HUD.h + HUD.accent + 10

const BALLOON = {
    wrap: 232,
    padX: 26,
    padY: 18,
    /** A faixa reservada ao botão, dentro do balão. */
    buttonH: 46,
    buttonW: 156,
    radius: 16,
} as const

export interface Artist {
    container: Phaser.GameObjects.Container
    /** Aparece e faz a pose. Sem texto, é só a figura. */
    show(who: number, pose: number): Promise<void>
    /**
     * Aparece, ESCREVE a fala letra a letra e espera o toque no Próximo.
     * Resolve quando a criança tocou — nunca por relógio.
     */
    speak(who: number, pose: number, text: string, label?: string): Promise<void>
    /** `speak` seguido da saída. */
    beat(who: number, pose: number, text: string, label?: string): Promise<void>
    /** A saída, esperável. */
    exit(duration?: number): Promise<void>
    hide(): void
    destroy(): void
}

/**
 * O ARTISTA — QUE APARECE, FALA E ESPERA
 *
 * ── O RITMO É DA CRIANÇA, NÃO DO RELÓGIO ────────────────────────────────
 *
 * A primeira versão mostrava a fala pronta e a tirava com um `delayedCall` de
 * 1,5 s. O dono do projeto reprovou: *"as falas dos personagens sai mt rapido,
 * nem da pra ler, o certo é botao de proximo."*
 *
 * Agora a frase é ESCRITA letra a letra e a cena PARA: nada anda enquanto ela
 * não tocar no **Próximo**. Um toque em qualquer lugar do balão completa a
 * frase que está sendo escrita, para quem lê rápido não esperar a máquina.
 *
 * É o mesmo contrato da `TutorialScene` do `EF05CO01`, e pela mesma razão.
 *
 * `artistas.png` chegou com célula de 300 (a folha é 1200 × 1200), e a caixa
 * alfa foi medida quadro a quadro: o braço muda de lado entre os estados e a
 * cabeça não, então sem `originX` por quadro ele escorrega de lado ao agradecer.
 */
export function createArtist(scene: Phaser.Scene): Artist {
    const container = scene.add.container(ARTIST.cx, ARTIST.baseY).setDepth(DEPTH.artist).setAlpha(0)

    const img = scene.add.image(0, 0, SHEETS.artistas.key, 0)
    const fallback = scene.add.graphics()
    const inicial = scene.add
        .text(0, -ARTIST.h / 2, '', { fontFamily: FONT, fontSize: '64px', color: CSS.cream })
        .setOrigin(0.5)
        .setResolution(2)

    /* ── o balão ────────────────────────────────────────────────────────── */

    const balao = scene.add.container(0, 0).setVisible(false)
    const balaoG = scene.add.graphics()
    const fala = scene.add
        .text(0, 0, '', {
            fontFamily: FONT,
            fontSize: `${SIZE.sign}px`,
            color: CSS.ink,
            align: 'center',
            wordWrap: { width: BALLOON.wrap },
        })
        .setOrigin(0.5, 0)
        .setResolution(2)
    const botaoG = scene.add.graphics()
    const botaoTxt = scene.add
        .text(0, 0, 'Próximo', { fontFamily: FONT, fontSize: '25px', color: CSS.header })
        .setOrigin(0.5)
        .setResolution(2)
    balao.add([balaoG, fala, botaoG, botaoTxt])

    container.add([fallback, img, inicial, balao])

    const temFolha = has(scene, SHEETS.artistas.key)
    img.setVisible(temFolha)
    inicial.setVisible(!temFolha)

    /** Uma escala só para a família, tirada da célula — não da caixa de cada um. */
    const escala = ARTIST.h / 300

    /* ── as zonas de toque ──────────────────────────────────────────────── */

    /**
     * Duas zonas SOLTAS, criadas no lugar definitivo e ligadas só depois de a
     * entrada terminar. Solta porque o balão entra com `Back` e muda de escala
     * no caminho — uma zona dentro dele comeria o toque na margem enquanto ele
     * ainda está crescendo.
     */
    const zonaBotao = scene.add.zone(0, 0, BALLOON.buttonW + 20, BALLOON.buttonH + 16)
        .setOrigin(0.5).setDepth(DEPTH.artist + 2).setInteractive({ useHandCursor: true })
    const zonaBalao = scene.add.zone(0, 0, 10, 10)
        .setOrigin(0.5).setDepth(DEPTH.artist + 1).setInteractive()
    zonaBotao.input!.enabled = false
    zonaBalao.input!.enabled = false

    let escrevendo: { skip(): void } | undefined
    let esperando: (() => void) | undefined

    /** Um toque no balão completa a frase; no botão, segue em frente. */
    zonaBalao.on('pointerdown', () => {
        if (!zonaBalao.input!.enabled) return
        escrevendo?.skip()
    })
    zonaBotao.on('pointerdown', () => {
        if (!zonaBotao.input!.enabled) return
        if (escrevendo) { escrevendo.skip(); return }
        void FX.press(scene, fx(botaoTxt))
        esperando?.()
    })

    /* ── desenho ────────────────────────────────────────────────────────── */

    const paintFallback = (on: boolean) => {
        fallback.clear()
        if (!on) return
        fallback.fillStyle(C.woodDeep, 1)
        fallback.fillRoundedRect(-84, -ARTIST.h, 168, ARTIST.h, 22)
    }

    const paintBalao = (w: number, h: number) => {
        balaoG.clear()
        balaoG.fillStyle(C.shadow, 0.18)
        balaoG.fillRoundedRect(-w / 2 + 3, -h / 2 + 6, w, h, BALLOON.radius)
        balaoG.fillStyle(C.cream, 1)
        balaoG.fillRoundedRect(-w / 2, -h / 2, w, h, BALLOON.radius)
        balaoG.lineStyle(3, C.ink, 0.32)
        balaoG.strokeRoundedRect(-w / 2, -h / 2, w, h, BALLOON.radius)
        /* O rabicho aponta para a cabeça, que fica embaixo e à direita. */
        balaoG.fillStyle(C.cream, 1)
        balaoG.fillTriangle(6, h / 2 - 2, 38, h / 2 - 2, 16, h / 2 + 20)
    }

    const paintBotao = (cy: number) => {
        const w = BALLOON.buttonW, h = BALLOON.buttonH
        botaoG.clear()
        botaoG.fillStyle(C.goldDeep, 1)
        botaoG.fillRoundedRect(-w / 2, cy - h / 2 + 4, w, h, h / 2)
        botaoG.fillStyle(C.gold, 1)
        botaoG.fillRoundedRect(-w / 2, cy - h / 2, w, h, h / 2)
        botaoG.fillStyle(C.goldSoft, 0.7)
        botaoG.fillRoundedRect(-w / 2 + 8, cy - h / 2 + 5, w - 16, h / 3, h / 6)
        botaoTxt.setPosition(0, cy)
    }

    let respirando = false

    const pararRespiracao = () => {
        if (!respirando) return
        respirando = false
        FX.kill(scene, fx(container))
        /* `FX.breathe` morre no meio do caminho: a escala volta na mão. */
        container.setScale(1)
    }

    /** Põe o quadro certo e ancora pelo pé, com a caixa alfa medida. */
    const vestir = (who: number, pose: number) => {
        const frame = who * 4 + pose
        if (temFolha) {
            img.setFrame(frame)
            const box = ARTIST_BOX[frame] ?? { originX: 0.5, footPad: 0 }
            img.setOrigin(box.originX, 1)
            img.setPosition(0, box.footPad * escala)
            img.setScale(escala)
        } else {
            paintFallback(true)
            inicial.setText(ARTIST_NAMES[who]?.[0] ?? '?')
        }
    }

    /** A entrada: de fora e de baixo, com exagero no fim. */
    const entrar = async (comBalao: boolean) => {
        container.setAlpha(0).setScale(0.82).setAngle(0)
        container.setPosition(ARTIST.cx + 90, ARTIST.baseY + 40)
        await FX.all(
            FX.to(scene, fx(container),
                { alpha: 1, scale: 1, x: ARTIST.cx, y: ARTIST.baseY },
                { duration: 360, ease: 'Back.easeOut' }),
            comBalao
                ? FX.to(scene, fx(balao), { alpha: 1, scale: 1 },
                    { duration: 260, delay: 90, ease: 'Back.easeOut' })
                : Promise.resolve(),
        )
    }

    /** O gesto de cada estado. Sem isso ele vira um cartaz. */
    const gesticular = async (pose: number) => {
        if (pose === POSE.agradecendo) {
            await FX.to(scene, fx(container), { y: ARTIST.baseY - 22 },
                { duration: 210, yoyo: true, repeat: 1, ease: 'Sine.easeOut' })
        } else if (pose === POSE.confuso) {
            await FX.to(scene, fx(container), { angle: 4 },
                { duration: 200, yoyo: true, repeat: 1, ease: 'Sine.easeInOut' })
        } else if (pose === POSE.explicando) {
            await FX.to(scene, fx(container), { angle: -2 },
                { duration: 260, yoyo: true, ease: 'Sine.easeInOut' })
        }
        if (!respirando) {
            respirando = true
            FX.breathe(scene, fx(container), { grow: 1.02, duration: 1500 })
        }
    }

    return {
        container,

        async show(who, pose) {
            vestir(who, pose)
            balao.setVisible(false)
            await entrar(false)
            await gesticular(pose)
        },

        async speak(who, pose, text, label = 'Próximo') {
            vestir(who, pose)

            /* O balão é medido com a frase INTEIRA e só depois esvaziado: se ele
               crescesse junto com a máquina de escrever, o texto pularia de
               lugar a cada letra e a criança perderia a linha. */
            fala.setText(text)
            botaoTxt.setText(label)
            const w = Math.max(fala.width + BALLOON.padX * 2, BALLOON.buttonW + 60)
            const h = fala.height + BALLOON.padY * 2 + BALLOON.buttonH + 6
            const botaoCy = h / 2 - BALLOON.padY - BALLOON.buttonH / 2 + 4
            paintBalao(w, h)
            fala.setPosition(0, -h / 2 + BALLOON.padY)
            paintBotao(botaoCy)

            /* O balão não pode entrar no cabeçalho: quando não cabe acima da
               cabeça, ele desce — nunca some. */
            let by = -ARTIST.h - h / 2 - 18
            const topo = ARTIST.baseY + by - h / 2
            if (topo < BALLOON_TOP_MIN) by += BALLOON_TOP_MIN - topo
            balao.setPosition(6, by).setVisible(true).setAlpha(0).setScale(0.8)

            fala.setText('')
            await entrar(true)

            /* As zonas só ganham lugar depois de o balão parar de andar. */
            const bx = ARTIST.cx + 6
            const byAbs = ARTIST.baseY + by
            zonaBalao.setPosition(bx, byAbs).setSize(w, h)
            zonaBotao.setPosition(bx, byAbs + botaoCy)
            zonaBalao.input!.enabled = true
            zonaBotao.input!.enabled = true

            void gesticular(pose)

            escrevendo = FX.type(scene, fala, text, { delay: TYPE_MS })
            await escrevendo
            escrevendo = undefined

            /* AQUI A CENA PARA. Só o toque no botão resolve. */
            await new Promise<void>(resolve => { esperando = resolve })
            esperando = undefined
            zonaBalao.input!.enabled = false
            zonaBotao.input!.enabled = false
        },

        async beat(who, pose, text, label) {
            await this.speak(who, pose, text, label)
            await this.exit()
        },

        async exit(duration = 260) {
            escrevendo?.skip()
            escrevendo = undefined
            esperando = undefined
            zonaBalao.input!.enabled = false
            zonaBotao.input!.enabled = false
            pararRespiracao()
            await FX.to(scene, fx(container),
                { alpha: 0, x: ARTIST.cx + 60, scale: 0.9 }, { duration })
        },

        hide() {
            escrevendo?.skip()
            escrevendo = undefined
            /* Quem estiver esperando é SOLTO: nunca deixe uma promessa presa
               numa cena que está sendo desmontada. */
            esperando?.()
            esperando = undefined
            zonaBalao.input!.enabled = false
            zonaBotao.input!.enabled = false
            pararRespiracao()
            void FX.to(scene, fx(container),
                { alpha: 0, x: ARTIST.cx + 60, scale: 0.9 }, { duration: 260 })
        },

        destroy() {
            escrevendo?.skip()
            esperando?.()
            zonaBotao.destroy()
            zonaBalao.destroy()
            container.destroy()
        },
    }
}
