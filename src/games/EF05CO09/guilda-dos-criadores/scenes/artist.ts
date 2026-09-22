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
    /**
     * Anda até um x da tela, com passo e inclinação.
     *
     * Só entre falas: o balão fica em coordenadas absolutas, calculadas na
     * hora em que ele abre, então andar com ele aberto deixaria as zonas de
     * toque para trás. Quem chama garante isso — é sempre depois de um `beat`.
     */
    moveTo(x: number): Promise<void>
    /** O posto de casa, à direita da mesa. */
    readonly postoCasa: number
    /**
     * TIRA O BALÃO E DEIXA ELA EM CENA.
     *
     * É o que permite uma professora: ela fala, o balão some, e ela FICA ali
     * — respirando, olhando — enquanto a criança faz a coisa. Sem isto, só
     * havia `beat` (falar e sumir), e a menina piscava para dentro e para
     * fora da tela a cada instrução.
     *
     * O botão `Próximo` some junto, de propósito: botão que continua na tela
     * depois de já ter sido tocado é um toque que não responde.
     */
    hideBalloon(): void
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

    /**
     * ══════════════════════════════════════════════════════════════════════
     *  TRÊS CAMADAS, UM TRABALHO CADA
     * ══════════════════════════════════════════════════════════════════════
     *
     * Antes era tudo num container só, e por isso ela quase não se mexia: a
     * entrada tuitava `scale`, a respiração também, e o gesto mexia em `y` —
     * quem chegasse por último matava o anterior. A saída foi separar:
     *
     *   `container` → ONDE ela está: entra, sai, anda. O balão mora aqui, e
     *                 por isso ele NÃO herda o bambolear do corpo — texto que
     *                 balança não se lê.
     *   `corpo`     → a VIDA PARADA: respira, flutua e gingas, para sempre e
     *                 em três períodos diferentes.
     *   `figura`    → o GESTO e a FALA: o pulo, a inclinação e o pulsinho de
     *                 cada sílaba.
     *
     * Como cada camada mexe numa coisa, as três podem acontecer ao mesmo
     * tempo — e é a soma delas que faz a menina parecer gente em vez de
     * cartaz.
     */
    const corpo = scene.add.container(0, 0)
    const figura = scene.add.container(0, 0)
    figura.add([fallback, img, inicial])
    corpo.add(figura)
    container.add([corpo, balao])

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

    /**
     * O POSTO — ONDE ELA ESTÁ PARADA AGORA.
     *
     * Era `ARTIST.cx` em sete lugares, e por isso ela nunca saía do lugar. O
     * posto é uma variável para ela poder CHEGAR PERTO do que está apontando:
     * quem explica alguma coisa se aproxima dela, e ver isso acontecer diz
     * "é ali" antes de qualquer palavra.
     */
    let posto: number = ARTIST.cx

    /**
     * O PULSINHO DE CADA SÍLABA — E POR QUE ELE PRECISA DE TRANCA.
     *
     * Sem a tranca, dois pulsos se sobrepõem: o segundo começa de 1,035 (onde
     * o primeiro estava), vai até 1,035 e volta para 1,035 — e a escala fica
     * PRESA esticada, para sempre. Foi o que apareceu medindo a cena: 1.035
     * em toda amostra, inclusive parada.
     *
     * Um pulso por vez, e o valor de repouso reposto na mão no fim.
     */
    let pulsando = false
    const pulsoDaFala = () => {
        if (pulsando) return
        pulsando = true
        figura.setScale(1)
        void FX.to(scene, fx(figura), { scaleY: 1.045 },
            { duration: 80, yoyo: true, ease: 'Sine.easeOut' })
            .then(() => { figura.setScale(1); pulsando = false })
    }

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

    let vivo = false
    let ondas: Phaser.Tweens.Tween[] = []

    /**
     * A VIDA PARADA — TRÊS ONDAS QUE NUNCA BATEM JUNTAS.
     *
     * Respirar, flutuar e gingar, cada uma com um período diferente (1,3 s,
     * 1,7 s e 2,3 s). Os números são primos entre si de propósito: com
     * períodos iguais as três somariam sempre no mesmo instante e o resultado
     * seria um pulso mecânico — o contrário de estar viva.
     *
     * A respiração é de propósito ASSIMÉTRICA (cresce em x, encolhe em y):
     * bicho que respira muda de forma, não de tamanho. Crescer nos dois eixos
     * lê como zoom.
     */
    const vidaParada = () => {
        if (vivo) return
        vivo = true
        ondas = [
            scene.tweens.add({
                targets: corpo, scaleX: 1.04, scaleY: 0.97,
                duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
            }),
            FX.float(scene, fx(corpo), { amount: 10, duration: 1700 }),
            FX.wiggle(scene, fx(corpo), { deg: 1.8, duration: 2300 }),
        ]
    }

    const pararVida = () => {
        if (!vivo) return
        vivo = false
        pulsando = false
        ondas.forEach(t => t.remove())
        ondas = []
        /* As ondas morrem no meio do caminho: o repouso volta na mão. */
        corpo.setPosition(0, 0).setAngle(0).setScale(1)
        figura.setPosition(0, 0).setAngle(0).setScale(1)
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

    /** A entrada: de fora e de baixo, com exagero no fim — e um baque ao pousar. */
    const entrar = async (comBalao: boolean) => {
        pararVida()
        container.setAlpha(0).setScale(0.82).setAngle(0)
        container.setPosition(posto + 90, ARTIST.baseY + 40)
        /* O AMASSADO DE CHEGADA, dentro do mesmo tween da entrada.
           Corpo que chega e não amassa nada parece deslizar. Fica JUNTO e não
           depois porque um segundo tween de escala disputaria a `figura` com o
           pulsinho da fala, que começa três letras depois. */
        figura.setScale(1, 0.88)
        await FX.all(
            FX.to(scene, fx(container),
                { alpha: 1, scale: 1, x: posto, y: ARTIST.baseY },
                { duration: 360, ease: 'Back.easeOut' }),
            FX.to(scene, fx(figura), { scaleY: 1 }, { duration: 360, ease: 'Back.easeOut' }),
            comBalao
                ? FX.to(scene, fx(balao), { alpha: 1, scale: 1 },
                    { duration: 260, delay: 90, ease: 'Back.easeOut' })
                : Promise.resolve(),
        )
        vidaParada()
    }

    /**
     * O GESTO DE CADA ESTADO — agora com corpo, e não com 2 graus.
     *
     * Ele mora na `figura`, a camada de dentro: assim o pulo do agradecimento
     * acontece POR CIMA da flutuação do corpo, em vez de disputar o mesmo `y`
     * com ela e ser engolido.
     */
    const gesticular = async (pose: number) => {
        if (pose === POSE.agradecendo) {
            /* Três pulos, e o último mais alto: comemoração cresce, não
               repete. Com a ginga junto, ela quase dança. */
            await FX.to(scene, fx(figura), { y: -26 },
                { duration: 190, yoyo: true, repeat: 1, ease: 'Sine.easeOut' })
            await FX.to(scene, fx(figura), { y: -38, angle: 5 },
                { duration: 220, yoyo: true, ease: 'Back.easeOut' })
        } else if (pose === POSE.confuso) {
            /* O "não fui eu" é a cabeça indo dos dois lados, três vezes. */
            figura.setAngle(0)
            await FX.to(scene, fx(figura), { angle: 7 },
                { duration: 150, yoyo: true, repeat: 2, ease: 'Sine.easeInOut' })
        } else if (pose === POSE.explicando) {
            /* Quem explica se inclina para a frente e volta. */
            await FX.to(scene, fx(figura), { angle: -5, y: -8 },
                { duration: 240, yoyo: true, ease: 'Sine.easeInOut' })
        } else {
            await FX.to(scene, fx(figura), { y: -12 },
                { duration: 260, yoyo: true, ease: 'Sine.easeOut' })
        }
        vidaParada()
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
            /**
             * SE ELA JÁ ESTÁ NA TELA, ELA NÃO REENTRA.
             *
             * Duas falas seguidas faziam a menina sair de cena e voltar
             * deslizando entre uma e outra — o que lê como "chegou outra
             * pessoa", e não como "ela continuou falando". No guia da primeira
             * fase são cinco falas, e cinco reentradas viravam um piscar.
             *
             * Já na tela, só o balão troca de conteúdo com um pulso curto. A
             * entrada continua inteira quando ela vem de fora.
             */
            /* A saída leva o `alpha` a 0 E o x para `cx + 60`: exigir os dois
               evita pegar a menina no meio de um fade que ainda não acabou. */
            const jaEstava = container.alpha > 0.95 && Math.abs(container.x - posto) < 1

            balao.setPosition(6, by).setVisible(true)
            fala.setText('')

            if (jaEstava) {
                balao.setAlpha(1).setScale(1)
                await FX.to(scene, fx(balao), { scale: 1.05 },
                    { duration: 120, yoyo: true, ease: 'Sine.easeOut' })
            } else {
                balao.setAlpha(0).setScale(0.8)
                await entrar(true)
            }

            /* As zonas só ganham lugar depois de o balão parar de andar. */
            const bx = posto + 6
            const byAbs = ARTIST.baseY + by
            zonaBalao.setPosition(bx, byAbs).setSize(w, h)
            zonaBotao.setPosition(bx, byAbs + botaoCy)
            zonaBalao.input!.enabled = true
            zonaBotao.input!.enabled = true

            void gesticular(pose)

            /**
             * ELA SE MEXE ENQUANTO FALA.
             *
             * A máquina de escrever avisa cada letra, e a cada quatro sai um
             * pulsinho na `figura` — o bastante para a boca do desenho parecer
             * estar dizendo aquilo. Sem isso, o texto aparecia sozinho e ela
             * ficava parada olhando, que é a cara de um cartaz com legenda.
             *
             * De quatro em quatro, e não a cada letra: a cada letra vira
             * tremida, e tremida cansa em duas frases.
             */
            escrevendo = FX.type(scene, fala, text, {
                delay: TYPE_MS,
                onChar: i => {
                    if (i % 4 === 0) pulsoDaFala()
                },
            })
            await escrevendo
            escrevendo = undefined

            /* AQUI A CENA PARA. Só o toque no botão resolve. */
            await new Promise<void>(resolve => { esperando = resolve })
            esperando = undefined
            zonaBalao.input!.enabled = false
            zonaBotao.input!.enabled = false
        },

        async moveTo(x) {
            const destino = Phaser.Math.Clamp(x, ARTIST.minX, ARTIST.maxX)
            if (Math.abs(destino - posto) < 2) return

            /* FORA DE CENA ELA NÃO ANDA, ELA JÁ ESTÁ LÁ. Meio segundo de tween
               num container invisível é meio segundo de tela parada — e a
               entrada seguinte, no posto novo, conta a mesma coisa melhor. */
            if (container.alpha < 0.05) {
                posto = destino
                container.setX(destino)
                return
            }
            const distancia = Math.abs(destino - posto)
            const indoParaEsquerda = destino < posto
            posto = destino

            /**
             * O PASSO É PROPORCIONAL À DISTÂNCIA.
             *
             * Um tempo fixo faz a travessia de 810 px parecer um deslize de
             * patins e o passo lateral de 86 px parecer câmera lenta. Aqui a
             * velocidade é constante (~1,1 px/ms) e são os PASSOS que se
             * multiplicam — um a cada 190 px, que é mais ou menos a passada de
             * alguém do tamanho dela.
             */
            const duracao = Phaser.Math.Clamp(Math.round(distancia / 1.1), 260, 900)
            const passos = Math.max(1, Math.round(distancia / 190))

            /* Ela não desliza: dá passos. O corpo sobe e desce a cada um, e a
               inclinação aponta para onde ela vai — é o que transforma um tween
               de `x` em alguém andando. */
            const passada = FX.to(scene, fx(figura),
                { y: -14, angle: indoParaEsquerda ? -4 : 4 },
                {
                    duration: Math.round(duracao / (passos * 2)),
                    yoyo: true,
                    repeat: passos - 1,
                    ease: 'Sine.easeInOut',
                })

            await FX.all(
                FX.to(scene, fx(container), { x: destino }, { duration: duracao, ease: 'Sine.easeInOut' }),
                passada,
            )
            figura.setAngle(0).setY(0)
        },

        async beat(who, pose, text, label) {
            await this.speak(who, pose, text, label)
            await this.exit()
        },

        get postoCasa() {
            return ARTIST.cx
        },

        hideBalloon() {
            escrevendo?.skip()
            escrevendo = undefined
            esperando = undefined
            zonaBalao.input!.enabled = false
            zonaBotao.input!.enabled = false
            if (!balao.visible) return
            void FX.to(scene, fx(balao), { alpha: 0, scale: 0.9 }, { duration: 170 })
                .then(() => balao.setVisible(false))
        },

        async exit(duration = 260) {
            escrevendo?.skip()
            escrevendo = undefined
            esperando = undefined
            zonaBalao.input!.enabled = false
            zonaBotao.input!.enabled = false
            pararVida()
            await FX.to(scene, fx(container),
                { alpha: 0, x: posto + 60, scale: 0.9 }, { duration })
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
            pararVida()
            void FX.to(scene, fx(container),
                { alpha: 0, x: posto + 60, scale: 0.9 }, { duration: 260 })
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
