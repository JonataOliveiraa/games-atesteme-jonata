import Phaser from 'phaser'
import { FX, Ease } from '../../../../shared/effects/FX'
import { createTimeBar, type TimeBar } from '../../../../shared/hud/createTimeBar'
import { C, A, BARRA, TINTA, FONT, SIZE, TYPE_MS, LONGO, hex, inkOn } from '../data/theme'
import {
    W, H, HUD, RELOGIO, OBJETIVO, TRILHO, VIZINHOS, FOCO, BALAO, PERSONAGEM,
} from '../data/layout'
import { rotuloDe, texturaDe, type Carta, type Vizinhanca } from '../types'

/*
 * Painters puros e construtores. A GameScene não desenha nada: se ela precisar
 * de um `fillRoundedRect`, falta um painter aqui.
 *
 * Este é o único jogo do conjunto em que a textura é o CONTEÚDO e não o
 * cenário: a carta é o dado da lista. Trilho, espaços, halos, vistos e painel
 * de vizinhos continuam todos em `Graphics`, porque todos têm estado.
 */

/* ═══════════════════════════════════════════════════════════ texturas */

export const TEX = {
    mesa1: 'bg-table-1',
    mesa2: 'bg-table-2',
    slot: 'slot-insert-card',
    /** Ainda não existe na pasta; o `paintVerso` desenha enquanto isso. */
    verso: 'card-back',
} as const

/** As três poses da menina: feliz, pensando, comemorando. */
export const POSE = { feliz: 'p-1', pensando: 'p-2', comemorando: 'p-3' } as const
export type Pose = keyof typeof POSE

export const hasTex = (scene: Phaser.Scene, key: string) => scene.textures.exists(key)

/** Encaixa a imagem numa caixa, pela menor razão — nunca estica. */
export function fitImage(img: Phaser.GameObjects.Image, maxW: number, maxH: number) {
    // medido na TEXTURA: os tipos do Phaser deste projeto não expõem `width`
    // em `Image`, e o `tsc` do build reprova
    const src = img.texture.getSourceImage() as { width: number; height: number }
    img.setScale(Math.min(maxW / src.width, maxH / src.height))
}

/* ═══════════════════════════════════════════════════════════ a mesa */

/** Mesa de feltro em Graphics, quando a textura não estiver na pasta. */
export function paintMesa(g: Phaser.GameObjects.Graphics) {
    g.clear()
    g.fillStyle(C.madeiraEscura, 1)
    g.fillRect(0, 0, W, H)
    g.fillStyle(C.madeira, 1)
    g.fillRoundedRect(10, 10, W - 20, H - 20, 90)
    g.fillStyle(C.feltroEscuro, 1)
    g.fillRoundedRect(34, 34, W - 68, H - 68, 74)
    g.fillStyle(C.feltro, 1)
    g.fillRoundedRect(40, 40, W - 80, H - 80, 70)
}

export function createMesa(scene: Phaser.Scene, mesa: string): void {
    const key = hasTex(scene, mesa) ? mesa : TEX.mesa1

    if (!hasTex(scene, key)) {
        const g = scene.add.graphics().setDepth(-20)
        paintMesa(g)
        return
    }

    const bg = scene.add.image(W / 2, H / 2, key).setDepth(-20)
    const src = bg.texture.getSourceImage() as { width: number; height: number }
    bg.setScale(Math.max(W / src.width, H / src.height))

    /*
     * ── A MESA SAI DE FOCO ───────────────────────────────────────────────
     *
     * O feltro tem textura, o aro tem madeira, e havia um baralho, fichas e um
     * bloquinho desenhados nos cantos. Tudo isso disputava atenção com as
     * cartas de verdade — que são o conteúdo.
     *
     * O desfoque é QUASE IMPERCEPTÍVEL de propósito (força 0.35, e já foi 1.4):
     * o suficiente para o olho não conseguir focar nos detalhes do fundo, sem
     * borrar a mesa a ponto de a arte parecer defeito. Quem escurece é o véu,
     * logo abaixo — e é ele, não o blur, que faz o fundo virar fundo.
     *
     * `preFX` só existe no renderizador WebGL. No Canvas o `?.` deixa passar e
     * sobra o véu, que sozinho já resolve metade do problema.
     */
    bg.preFX?.addBlur(1, 2, 2, 0.35)

    const veil = scene.add.graphics().setDepth(-19)
    veil.fillStyle(C.ink, A.veil)
    veil.fillRect(0, 0, W, H)
}

/* ══════════════════════════════════════════════════════════ botões */

export interface RoundButton {
    container: Phaser.GameObjects.Container
    setEnabled(on: boolean): void
    destroy(): void
}

/**
 * A zona de toque é um objeto separado, parado.
 *
 * O container cresce no hover e afunda no clique; se a área de toque fosse ele,
 * a borda mudaria de tamanho no meio do gesto e um `pointerup` perto da margem
 * cairia fora, comendo o clique. E a zona NÃO acompanha tween nenhum: quem
 * animar um botão para longe dela deixa o botão morto para sempre.
 */
export function createRoundButton(
    scene: Phaser.Scene,
    x: number, y: number, r: number,
    label: string,
    onClick: () => void,
    tone = C.lataoEscuro,
): RoundButton {
    const container = scene.add.container(x, y)

    const g = scene.add.graphics()
    g.fillStyle(C.shadow, 0.3)
    g.fillCircle(0, 4, r)
    g.fillStyle(tone, 1)
    g.fillCircle(0, 0, r)
    g.fillStyle(C.white, 0.22)
    g.fillCircle(0, -r * 0.32, r * 0.62)
    g.lineStyle(3, C.white, 0.9)
    g.strokeCircle(0, 0, r)

    const text = scene.add.text(0, -1, label, {
        fontFamily: FONT.black, fontSize: SIZE.help, color: hex(inkOn(tone)),
    }).setOrigin(0.5).setResolution(2)

    container.add([g, text])

    let enabled = true
    const hit = scene.add.zone(x, y, r * 2 + 18, r * 2 + 18).setOrigin(0.5).setDepth(90)
    hit.setInteractive({ useHandCursor: true })

    hit.on('pointerover', () => { if (enabled) FX.to(scene, container, { scale: 1.12 }, { duration: 120 }) })
    hit.on('pointerout', () => { if (enabled) FX.to(scene, container, { scale: 1 }, { duration: 120 }) })
    hit.on('pointerup', () => { if (!enabled) return; FX.press(scene, container); onClick() })

    return {
        container,
        setEnabled: on => {
            enabled = on
            container.setAlpha(on ? 1 : A.dim)
            if (hit.input) hit.input.cursor = on ? 'pointer' : 'default'
        },
        destroy: () => { hit.destroy(); container.destroy() },
    }
}

export interface BigButton {
    container: Phaser.GameObjects.Container
    setEnabled(on: boolean): void
    destroy(): void
}

export function createBigButton(
    scene: Phaser.Scene,
    { x, y, w, h, label, tone, onClick, breathe = true, depth = 50 }: {
        x: number; y: number; w: number; h: number
        label: string; tone: number; onClick: () => void
        breathe?: boolean
        depth?: number
    },
): BigButton {
    const container = scene.add.container(x, y).setDepth(depth)
    const bg = scene.add.graphics()
    // o rótulo se pinta a partir do TOM: tinta escura em fundo claro, clara em
    // fundo escuro — nenhum botão deste jogo pode nascer ilegível
    const text = scene.add.text(0, -3, label, {
        fontFamily: FONT.black, fontSize: SIZE.button, color: hex(inkOn(tone)),
    }).setOrigin(0.5).setResolution(2)

    let enabled = true
    let pressed = false
    const drop = 6
    const deep = Phaser.Display.Color.ValueToColor(tone).darken(30).color

    const paint = () => {
        const dy = pressed ? drop : 0
        bg.clear()
        bg.fillStyle(C.shadow, 0.34)
        bg.fillRoundedRect(-w / 2 + 4, -h / 2 + drop + 6, w, h, h / 2)
        bg.fillStyle(enabled ? deep : 0x33513e, 1)
        bg.fillRoundedRect(-w / 2, -h / 2, w, h + drop, h / 2)
        bg.fillStyle(enabled ? tone : 0x4d6d58, 1)
        bg.fillRoundedRect(-w / 2, -h / 2 + dy, w, h, h / 2)
        bg.fillStyle(C.white, enabled ? 0.28 : 0.1)
        bg.fillRoundedRect(-w / 2 + 14, -h / 2 + dy + 8, w - 28, h * 0.26, h / 4)
        bg.lineStyle(4, C.white, enabled ? 0.9 : 0.28)
        bg.strokeRoundedRect(-w / 2, -h / 2 + dy, w, h, h / 2)
        text.setColor(hex(enabled ? inkOn(tone) : C.idle))
        text.setY(-3 + dy)
    }

    container.add([bg, text])
    paint()

    const hit = scene.add.zone(x, y, w + 24, h + 22).setOrigin(0.5).setDepth(depth + 1)
    hit.setInteractive({ useHandCursor: true })

    hit.on('pointerover', () => { if (enabled) FX.to(scene, container, { scale: 1.05 }, { duration: 120 }) })
    hit.on('pointerout', () => {
        if (pressed) { pressed = false; paint() }
        if (enabled) FX.to(scene, container, { scale: 1 }, { duration: 120 })
    })
    hit.on('pointerdown', () => { if (!enabled) return; pressed = true; paint() })
    hit.on('pointerup', () => {
        if (!enabled || !pressed) return
        pressed = false
        paint()
        onClick()
    })

    const pulse = breathe ? FX.breathe(scene, container, { grow: 1.03, duration: 1200 }) : null

    return {
        container,
        setEnabled: on => {
            // Repinta SEMPRE, mesmo sem mudança: basta o visual e a flag saírem
            // de sincronia uma vez para o botão ficar morto até o fim do caso.
            enabled = on
            pressed = false
            paint()
            if (hit.input) hit.input.cursor = on ? 'pointer' : 'default'
        },
        destroy: () => { pulse?.remove(); hit.destroy(); container.destroy() },
    }
}

/* ═══════════════════════════════════════════════════════════════ HUD */

/** A faixa do header, de ponta a ponta, fechada por uma linha dourada. */
export function paintHudBar(g: Phaser.GameObjects.Graphics) {
    g.clear()
    g.fillStyle(C.painel, 0.98)
    g.fillRect(0, 0, HUD.w, HUD.h)
    g.fillStyle(C.white, 0.05)
    g.fillRect(0, 0, HUD.w, 24)
    g.fillStyle(C.white, 0.03)
    g.fillRect(0, 24, HUD.w, 12)
    g.fillStyle(C.latao, 1)
    g.fillRect(0, HUD.h - HUD.linha, HUD.w, HUD.linha)
    g.fillStyle(C.shadow, 0.3)
    g.fillRect(0, HUD.h, HUD.w, 9)
    g.fillStyle(C.shadow, 0.14)
    g.fillRect(0, HUD.h + 9, HUD.w, 7)
}

export interface Hud {
    container: Phaser.GameObjects.Container
    setLevel(level: number): void
    setTitle(text: string): void
    setProgress(done: number, total: number): void
    /**
     * A barra de tempo do caso, do kit compartilhado.
     *
     * O HUD só a hospeda: quem manda nela é a cena, que sabe quando o jogo
     * está de fato esperando uma decisão. `tempo.tick(delta)` todo frame,
     * `tempo.setRunning(...)` quando o estado muda, `tempo.reset(ms)` a cada
     * caso novo.
     */
    tempo: TimeBar
    setHelpEnabled(on: boolean): void
    destroy(): void
}

export function createHud(
    scene: Phaser.Scene,
    { onHelp, onDanger, onEmpty }: {
        onHelp: () => void
        /** A barra entrou na faixa crítica. */
        onDanger?: () => void
        /** A barra zerou — é aqui que a cena perde o caso. */
        onEmpty?: () => void
    },
): Hud {
    const container = scene.add.container(0, 0).setDepth(80)

    const bar = scene.add.graphics()
    paintHudBar(bar)
    container.add(bar)

    const pill = scene.add.graphics()
    pill.fillStyle(C.lataoEscuro, 1)
    pill.fillRoundedRect(HUD.pillX, HUD.pillY, HUD.pillW, HUD.pillH, HUD.pillH / 2)
    pill.fillStyle(C.white, 0.24)
    pill.fillRoundedRect(HUD.pillX + 10, HUD.pillY + 6, HUD.pillW - 20, 12, 6)
    container.add(pill)

    const levelLabel = scene.add.text(HUD.pillX + HUD.pillW / 2, HUD.cy, 'NÍVEL 1', {
        fontFamily: FONT.black, fontSize: SIZE.hudLevel, color: hex(C.creme),
    }).setOrigin(0.5).setResolution(2)
    container.add(levelLabel)

    const title = scene.add.text(HUD.titleX, HUD.cy, '', {
        fontFamily: FONT.black, fontSize: SIZE.hudTitle, color: hex(C.creme),
        align: 'center', wordWrap: { width: HUD.titleW },
    }).setOrigin(0.5).setResolution(2)
    container.add(title)

    const dots = scene.add.container(0, 0)
    container.add(dots)

    /* ── a barra de tempo ──────────────────────────────────────────── */
    // as cores vêm de `BARRA`, em data/theme.ts, junto com o resto da paleta
    const tempo = createTimeBar(scene, {
        cx: RELOGIO.cx, cy: HUD.cy, w: RELOGIO.w, h: RELOGIO.h,
        duration: 60_000,
        iconDX: RELOGIO.iconeDX,
        iconR: RELOGIO.iconeR,
        onDanger,
        onEmpty,
        theme: BARRA,
    })
    container.add(tempo.container)

    const help = createRoundButton(scene, HUD.helpX, HUD.cy, HUD.helpR, '?', onHelp, C.lataoEscuro)
    container.add(help.container)

    FX.slideIn(scene, container, { dy: 26, duration: 340 })

    return {
        container,
        setLevel: level => levelLabel.setText(`NÍVEL ${level}`),
        setTitle: text => title.setText(text),

        setProgress: (done, total) => {
            dots.removeAll(true)
            if (total <= 0) return
            const gap = total > 1 ? Math.min(26, HUD.dotsMaxW / (total - 1)) : 0
            for (let i = 0; i < total; i += 1) {
                const x = HUD.dotsX + i * gap
                const g = scene.add.graphics()
                if (i < done) {
                    g.fillStyle(C.ok, 1)
                    g.fillCircle(x, HUD.cy, HUD.dotR)
                    g.lineStyle(2, C.okSoft, 1)
                    g.strokeCircle(x, HUD.cy, HUD.dotR)
                } else if (i === done) {
                    g.fillStyle(C.espaco, 1)
                    g.fillRoundedRect(x - 13, HUD.cy - 7, 26, 14, 7)
                } else {
                    g.fillStyle(C.white, 0.18)
                    g.fillCircle(x, HUD.cy, HUD.dotR)
                }
                dots.add(g)
            }
        },

        tempo,
        setHelpEnabled: help.setEnabled,
        destroy: () => { tempo.destroy(); help.destroy(); container.destroy() },
    }
}

/* ═══════════════════════════════════════════════════════ o objetivo */

export interface Objetivo {
    container: Phaser.GameObjects.Container
    /** Escreve letra a letra. Para quando o objetivo MUDA. */
    show(text: string): Promise<void>
    /** Põe na hora, sem digitar. Para a volta depois de um erro. */
    set(text: string): void
    /** "ações: 2 / 2" — o número que o briefing pede que conte. */
    setAcoes(usadas: number, minimas: number): void
    /**
     * O caso fechou sem ação desperdiçada.
     *
     * O bônus era uma frase colada no fim da fala da menina ("E sem gastar
     * nenhuma ação à toa"), que dobrava o tamanho do texto justo na hora em que
     * a criança já tinha uma frase para ler. Agora quem comemora é o próprio
     * contador de ações: ele fica verde e dá um pulo. Zero palavra, e o sinal
     * acontece em cima do número de que ele fala.
     */
    marcarEficiente(): void
    destroy(): void
}

export function createObjetivo(scene: Phaser.Scene): Objetivo {
    const container = scene.add.container(0, 0).setDepth(30)

    const g = scene.add.graphics()
    g.fillStyle(C.shadow, 0.34)
    g.fillRoundedRect(OBJETIVO.x + 4, OBJETIVO.y + 6, OBJETIVO.w, OBJETIVO.h, OBJETIVO.r)
    g.fillStyle(C.painel, 0.96)
    g.fillRoundedRect(OBJETIVO.x, OBJETIVO.y, OBJETIVO.w, OBJETIVO.h, OBJETIVO.r)
    g.lineStyle(3, C.latao, 0.75)
    g.strokeRoundedRect(OBJETIVO.x, OBJETIVO.y, OBJETIVO.w, OBJETIVO.h, OBJETIVO.r)
    container.add(g)

    const label = scene.add.text(OBJETIVO.cx, OBJETIVO.cy, '', {
        fontFamily: FONT.black, fontSize: SIZE.objetivo,
        color: hex(C.creme), align: 'center', wordWrap: { width: OBJETIVO.wrap },
    }).setOrigin(0.5).setResolution(2)
    container.add(label)

    const acoes = scene.add.text(OBJETIVO.acoesX, OBJETIVO.cy, '', {
        fontFamily: FONT.body, fontStyle: 'bold', fontSize: SIZE.acoes, color: hex(C.idle),
    }).setOrigin(1, 0.5).setResolution(2)
    container.add(acoes)

    let typing: { skip: () => void } | null = null
    const medir = (t: string) =>
        label.setFontSize(t.length > LONGO ? SIZE.objetivoLongo : SIZE.objetivo)

    return {
        container,
        show: async text => {
            typing?.skip()
            medir(text)
            // mede com o texto completo antes de escrever, senão a linha
            // cresceria letra a letra e o texto pularia dentro da faixa
            label.setText(text)
            label.setText('')
            const tw = FX.type(scene, label, text, { delay: TYPE_MS.objetivo })
            typing = tw
            await tw
            typing = null
        },
        set: text => {
            typing?.skip()
            typing = null
            medir(text)
            label.setText(text)
        },
        setAcoes: (usadas, minimas) => {
            acoes.setText(`ações: ${usadas} / ${minimas}`)
            // passou do mínimo: o número deixa de ser cinza e vira alerta
            acoes.setColor(hex(usadas > minimas ? C.alerta : C.idle))
        },
        marcarEficiente: () => {
            acoes.setColor(hex(C.ok))
            FX.kill(scene, acoes)
            acoes.setScale(1)
            void FX.to(scene, acoes, { scale: 1.35 },
                { duration: 220, yoyo: true, ease: Ease.back(2.6) })
            void FX.sparks(scene, OBJETIVO.acoesX - 40, OBJETIVO.cy,
                { color: C.ok, count: 12, spread: 90 })
        },
        destroy: () => { typing?.skip(); container.destroy() },
    }
}

/* ═════════════════════════════════════════════════════════════ cartas */

/**
 * A carta desenhada, para quando o PNG dela não estiver na pasta.
 *
 * Nenhum caso deste jogo usa carta que não existe — as listas foram escritas
 * em cima do baralho que a pasta tem. Isto é rede: se um dia alguém acrescentar
 * um 5 de copas nos dados antes de a arte chegar, a criança vê uma carta feia
 * em vez de um quadrado verde do Phaser.
 */
export function paintCartaFallback(
    g: Phaser.GameObjects.Graphics,
    carta: Carta,
    w: number, h: number,
) {
    const hw = w / 2
    const hh = h / 2
    const tom = carta.naipe === 'copas' ? 0xef4444
        : carta.naipe === 'espadas' ? 0x1e3a8a
            : C.espaco

    g.clear()
    g.fillStyle(C.shadow, 0.34)
    g.fillRoundedRect(-hw + 4, -hh + 6, w, h, TRILHO.cardR)
    g.fillStyle(tom, 1)
    g.fillRoundedRect(-hw, -hh, w, h, TRILHO.cardR)
    g.fillStyle(C.creme, 1)
    g.fillRoundedRect(-hw + 9, -hh + 9, w - 18, h - 18, TRILHO.cardR - 5)
}

/**
 * O VERSO DA CARTA — a peça que faltava para a busca fazer sentido.
 *
 * Com as seis cartas viradas para cima, a criança VIA o 7 e o jogo mandava ela
 * conferir da esquerda para a direita mesmo assim, recusando o toque fora da
 * vez. Do lado de cá isso é "acesso sequencial"; do lado de lá é uma regra
 * arbitrária que impede de tocar no que está bem ali. Era essa a confusão do
 * Nível 2, e nenhuma dose de tutorial ia resolver — a mecânica contradizia os
 * olhos.
 *
 * De costas, virar uma de cada vez deixa de ser regra e vira a única coisa
 * possível. E "a carta pode não estar no monte" — o pedido do enunciado da
 * BNCC — passa a ser uma dúvida de verdade até a última.
 */
export function paintVerso(
    g: Phaser.GameObjects.Graphics,
    w: number, h: number,
) {
    const hw = w / 2
    const hh = h / 2

    g.clear()
    g.fillStyle(C.shadow, 0.34)
    g.fillRoundedRect(-hw + 4, -hh + 6, w, h, TRILHO.cardR)
    g.fillStyle(C.creme, 1)
    g.fillRoundedRect(-hw, -hh, w, h, TRILHO.cardR)
    g.fillStyle(C.verso, 1)
    g.fillRoundedRect(-hw + 7, -hh + 7, w - 14, h - 14, TRILHO.cardR - 4)

    /*
     * Os losangos são posicionados DENTRO do retângulo interno, um por célula.
     * `Graphics` não recorta: uma treliça de linhas diagonais, que seria o
     * desenho óbvio, vazaria para fora da carta.
     */
    const iw = w - 22
    const ih = h - 22
    const cols = 3
    const rows = 5
    const s = Math.min(iw / cols, ih / rows) * 0.42
    g.fillStyle(C.versoLosango, 0.55)
    for (let r = 0; r < rows; r += 1) {
        for (let c = 0; c < cols; c += 1) {
            const cx = -iw / 2 + (c + 0.5) * (iw / cols)
            const cy = -ih / 2 + (r + 0.5) * (ih / rows)
            g.fillTriangle(cx, cy - s, cx - s, cy, cx + s, cy)
            g.fillTriangle(cx, cy + s, cx - s, cy, cx + s, cy)
        }
    }

    g.lineStyle(3, C.creme, 0.9)
    g.strokeRoundedRect(-hw + 7, -hh + 7, w - 14, h - 14, TRILHO.cardR - 4)
}

export interface CartaView {
    node: Phaser.GameObjects.Container
    trocar(nova: Carta): void
    /** De costas, ou de frente. */
    setVerso(on: boolean): void
    destroy(): void
}

/** Uma carta na tela: a arte, ou o desenho de emergência com o valor. */
export function createCartaView(
    scene: Phaser.Scene,
    carta: Carta,
    w: number, h: number,
    { verso = false } = {},
): CartaView {
    const node = scene.add.container(0, 0)
    const frente = scene.add.container(0, 0)
    node.add(frente)

    let img: Phaser.GameObjects.Image | undefined
    let desenho: Phaser.GameObjects.Graphics | undefined
    let rotulo: Phaser.GameObjects.Text | undefined
    let atual = carta

    const montar = (c: Carta) => {
        img?.destroy(); img = undefined
        desenho?.destroy(); desenho = undefined
        rotulo?.destroy(); rotulo = undefined

        const tex = texturaDe(c)
        if (hasTex(scene, tex)) {
            img = scene.add.image(0, 0, tex)
            fitImage(img, w, h)
            frente.add(img)
            return
        }
        desenho = scene.add.graphics()
        paintCartaFallback(desenho, c, w, h)
        frente.add(desenho)
        rotulo = scene.add.text(0, 0, rotuloDe(c), {
            fontFamily: FONT.black, fontSize: SIZE.cartaValor,
            color: hex(c.naipe === 'copas' ? 0xef4444 : c.naipe === 'espadas' ? 0x1e3a8a : C.lataoEscuro),
        }).setOrigin(0.5).setResolution(2)
        frente.add(rotulo)
    }

    montar(carta)

    /** O verso: a arte `card-back` se ela existir, senão o desenho. */
    const costas: Phaser.GameObjects.GameObject & { setVisible(v: boolean): unknown } =
        (() => {
            if (hasTex(scene, TEX.verso)) {
                const i = scene.add.image(0, 0, TEX.verso)
                fitImage(i, w, h)
                node.add(i)
                return i
            }
            const g = scene.add.graphics()
            paintVerso(g, w, h)
            node.add(g)
            return g
        })()

    const setVerso = (on: boolean) => {
        costas.setVisible(on)
        frente.setVisible(!on)
    }
    setVerso(verso)

    return {
        node,
        trocar: nova => { atual = nova; montar(nova) },
        setVerso,
        destroy: () => { void atual; node.destroy() },
    }
}

/* ═══════════════════════════════════════════════════════════ o trilho */

interface Item {
    carta: Carta
    node: Phaser.GameObjects.Container
    view: CartaView
    halo: Phaser.GameObjects.Graphics
    marca: Phaser.GameObjects.Graphics
    /** Enquanto voa da mão para a lista, o layout não mexe nela. */
    voando: boolean
    conferida: boolean
    /** É a próxima da fila na busca: fica levantada. */
    apontada: boolean
    /** Está de costas. */
    oculta: boolean
}

export interface Trilho {
    container: Phaser.GameObjects.Container
    lista(): Carta[]
    /** Onde a carta do índice `i` está, em coordenadas de tela. */
    posDaCarta(i: number): { x: number; y: number }
    /** Onde o espaço `gap` está — o tutorial precisa disso para apontar. */
    posDoEspaco(gap: number): { x: number; y: number }
    /** Recoloca tudo. Com `anim`, as cartas deslizam — é o "antes e depois". */
    layout(anim: boolean): Promise<void>
    /** Liga os espaços entre as cartas. */
    setEspacos(on: boolean): void
    /**
     * Liga o toque nas cartas.
     *
     * `somente` limita a UMA carta — e é a peça que apaga o erro "uma de cada
     * vez, da esquerda para a direita" da existência. Recusar o toque com uma
     * bronca ensina a regra depois de a criança já ter errado; não haver nada
     * para tocar fora da vez ensina antes, sem custo. Só existe uma carta
     * tocável, e ela está levantada e acesa.
     */
    setCartasAtivas(on: boolean, somente?: number | null): void
    /** Vira TODAS de costas (ou de volta para cima), com um leve escalonamento. */
    virarTodas(oculto: boolean): Promise<void>
    /** Acende a carta `i` e desenha halo azul nos vizinhos dela. */
    destacarCarta(i: number | null): void
    /** Acende as duas cartas que abraçam o espaço `gap`. */
    destacarEspaco(gap: number | null): void
    /**
     * Levanta a carta que é a PRÓXIMA da fila na busca.
     *
     * Não entrega resposta nenhuma: qual é a próxima é regra do jogo — sempre a
     * seguinte, da esquerda para a direita — e não a coisa que a criança tem que
     * descobrir. Descobrir é se o VALOR dela bate. Deixar a regra visível tira
     * do jogo a única parte em que ele era adivinhação.
     */
    apontar(i: number | null): void
    /**
     * Abre o espaço, e a carta entra voando de `origem`.
     *
     * `aoVoar` dispara no instante em que a carta levanta voo — é o gancho para
     * quem estava segurando a carta soltar a dela, senão existem duas cartas
     * iguais na tela durante a viagem.
     */
    inserir(
        gap: number, carta: Carta,
        origem: { x: number; y: number },
        aoVoar?: () => void,
    ): Promise<void>
    /** A carta sai por cima, e os vizinhos se aproximam. */
    remover(i: number): Promise<void>
    /** A carta vira no lugar e volta sendo outra. */
    substituir(i: number, nova: Carta): Promise<void>
    /**
     * Vira a carta `i` para cima, na busca.
     *
     * `achou` decide o desfecho, e a diferença entre os dois é o que fazia o
     * Nível 2 mentir: a versão anterior carimbava um VISTO VERDE em toda carta
     * olhada. Verde quer dizer "certo" na tela inteira, então a criança
     * conferia o 2, ganhava um certo, e concluía que o 2 era a carta procurada.
     * Agora quem não era só fica virada e apagada — já foi, não é mais nada — e
     * o visto verde é só da que era.
     */
    revelar(i: number, achou: boolean): Promise<void>
    /** Sacode: não era essa, ou não era aí. */
    recusar(i: number): Promise<void>
    /** Sacode o espaço `gap`: a carta não entra aí. */
    recusarEspaco(gap: number): Promise<void>
    destroy(): void
}

export function paintTrilhoMovel(g: Phaser.GameObjects.Graphics) {
    g.clear()
    g.fillStyle(C.shadow, 0.34)
    g.fillRoundedRect(TRILHO.x + 5, TRILHO.y + 8, TRILHO.w, TRILHO.h, TRILHO.r)
    g.fillStyle(C.trilho, 0.9)
    g.fillRoundedRect(TRILHO.x, TRILHO.y, TRILHO.w, TRILHO.h, TRILHO.r)
    g.lineStyle(4, C.latao, 0.85)
    g.strokeRoundedRect(TRILHO.x, TRILHO.y, TRILHO.w, TRILHO.h, TRILHO.r)
    // os dois sulcos do trilho, em cima e embaixo das cartas
    g.fillStyle(C.white, 0.05)
    g.fillRoundedRect(TRILHO.x + 18, TRILHO.cy - TRILHO.cardH / 2 - 12, TRILHO.w - 36, 6, 3)
    g.fillRoundedRect(TRILHO.x + 18, TRILHO.cy + TRILHO.cardH / 2 + 6, TRILHO.w - 36, 6, 3)
}

/**
 * O espaço entre duas cartas.
 *
 * Desligado ele é um sulco quase invisível — não há o que fazer ali. Ligado
 * vira uma FENDA DE ENCAIXE amarela de 34px com um `+` grande no meio, alta
 * como a carta: um alvo do tamanho de um dedo, que se lê de longe como "cabe
 * uma carta aqui".
 *
 * A versão anterior desenhava uma barrinha de 8px entre duas cartas de 118. A
 * interação central do jogo era a coisa menos visível da tela, e era por isso
 * que ninguém entendia o que fazer.
 */
export function paintEspaco(
    g: Phaser.GameObjects.Graphics,
    { ativo }: { ativo: boolean },
) {
    g.clear()

    if (!ativo) {
        g.fillStyle(C.white, 0.06)
        g.fillRoundedRect(-3, -(TRILHO.cardH - 40) / 2, 6, TRILHO.cardH - 40, 3)
        return
    }

    const hw = TRILHO.fendaW / 2
    const hh = TRILHO.fendaH / 2

    g.fillStyle(C.shadow, 0.3)
    g.fillRoundedRect(-hw + 2, -hh + 4, TRILHO.fendaW, TRILHO.fendaH, 12)
    g.fillStyle(C.ink, 0.75)
    g.fillRoundedRect(-hw, -hh, TRILHO.fendaW, TRILHO.fendaH, 12)
    g.lineStyle(4, C.espaco, 1)
    g.strokeRoundedRect(-hw, -hh, TRILHO.fendaW, TRILHO.fendaH, 12)

    // o + no meio da fenda
    g.fillStyle(C.espaco, 1)
    g.fillRoundedRect(-5, -16, 10, 32, 4)
    g.fillRoundedRect(-16, -5, 32, 10, 4)
}

export function createTrilho(
    scene: Phaser.Scene,
    { cartas, onCarta, onEspaco }: {
        cartas: Carta[]
        onCarta: (i: number) => void
        onEspaco: (gap: number) => void
    },
): Trilho {
    const container = scene.add.container(0, 0).setDepth(25)

    const movel = scene.add.graphics()
    paintTrilhoMovel(movel)
    container.add(movel)

    /** Os espaços entram antes das cartas: eles passam POR BAIXO. */
    const camadaEspacos = scene.add.container(0, 0)
    const camadaCartas = scene.add.container(0, 0)
    container.add([camadaEspacos, camadaCartas])

    const itens: Item[] = []
    let espacosAtivos = false
    let cartasAtivas = false
    /** `null` = todas as cartas; um índice = só aquela aceita toque. */
    let somenteCarta: number | null = null
    const tocavel = (i: number) =>
        cartasAtivas && (somenteCarta === null || i === somenteCarta)

    /*
     * As zonas de toque são objetos de CENA soltos, e elas NÃO acompanham
     * tween. Como a lista muda de tamanho a cada ação, elas são refeitas do
     * zero a cada `layout` — e sempre na posição FINAL, antes de qualquer
     * animação começar. Zona parada no lugar antigo é clique comido.
     */
    let zonas: Phaser.GameObjects.Zone[] = []
    let espacos: Phaser.GameObjects.Graphics[] = []

    const largura = (n: number) => n * TRILHO.cardW + (n + 1) * TRILHO.gapW
    const esquerda = (n: number) => TRILHO.cx - largura(n) / 2

    const xCarta = (i: number, n: number) =>
        esquerda(n) + TRILHO.gapW + i * (TRILHO.cardW + TRILHO.gapW) + TRILHO.cardW / 2

    const xEspaco = (i: number, n: number) =>
        esquerda(n) + i * (TRILHO.cardW + TRILHO.gapW) + TRILHO.gapW / 2

    const paintHalo = (g: Phaser.GameObjects.Graphics, tom: number) => {
        const hw = TRILHO.cardW / 2 + 9
        const hh = TRILHO.cardH / 2 + 9
        g.clear()
        g.fillStyle(tom, 0.28)
        g.fillRoundedRect(-hw, -hh, hw * 2, hh * 2, TRILHO.cardR + 6)
        g.lineStyle(5, tom, 1)
        g.strokeRoundedRect(-hw, -hh, hw * 2, hh * 2, TRILHO.cardR + 6)
    }

    /**
     * O visto verde. Só a carta ENCONTRADA ganha um.
     *
     * A carta virada que não era não recebe selo nenhum: ela já está de cara
     * para cima e apagada, e isso é a informação inteira. Um segundo carimbo em
     * cinza era mais um objeto na tela dizendo o que o olho já sabia.
     */
    const paintMarca = (g: Phaser.GameObjects.Graphics) => {
        const x = TRILHO.cardW / 2 - 14
        const y = -TRILHO.cardH / 2 + 14
        g.clear()
        g.fillStyle(C.ok, 1)
        g.fillCircle(x, y, 18)
        g.lineStyle(5, C.ink, 1)
        g.beginPath()
        g.moveTo(x - 8, y)
        g.lineTo(x - 2, y + 7)
        g.lineTo(x + 9, y - 8)
        g.strokePath()
    }

    const novoItem = (carta: Carta): Item => {
        const node = scene.add.container(0, TRILHO.cy)
        const halo = scene.add.graphics().setAlpha(0)
        paintHalo(halo, C.vizinho)
        const view = createCartaView(scene, carta, TRILHO.cardW, TRILHO.cardH)
        const marca = scene.add.graphics().setAlpha(0)
        paintMarca(marca)
        node.add([halo, view.node, marca])
        camadaCartas.add(node)
        return {
            carta, node, view, halo, marca,
            voando: false, conferida: false, apontada: false, oculta: false,
        }
    }

    /** Onde a carta `i` pousa: em cima da linha, ou levantada por ser a da vez. */
    const baseY = (item: Item) =>
        item.apontada ? TRILHO.cy - TRILHO.liftApontada : TRILHO.cy

    cartas.forEach(c => itens.push(novoItem(c)))

    const limparZonas = () => {
        zonas.forEach(z => z.destroy())
        zonas = []
        espacos.forEach(g => g.destroy())
        espacos = []
    }

    /** Refaz espaços e zonas nas posições finais. Roda ANTES de animar. */
    const montarZonas = () => {
        limparZonas()
        const n = itens.length

        for (let i = 0; i <= n; i += 1) {
            const x = xEspaco(i, n)
            const g = scene.add.graphics().setPosition(x, TRILHO.cy)
            paintEspaco(g, { ativo: espacosAtivos })
            camadaEspacos.add(g)
            espacos.push(g)

            if (!espacosAtivos) continue

            /*
             * A fenda RESPIRA enquanto ninguém encostou nela.
             *
             * É o sinal mais barato e mais forte de "toque aqui" que existe:
             * numa tela parada, a única coisa que se mexe é para onde o olho
             * vai. Assim que a criança passa o dedo por cima, o respiro morre
             * e a fenda cresce — ela já foi notada, não precisa mais chamar.
             */
            const respiro = FX.breathe(scene, g, { grow: 1.07, duration: 1000 })

            const hit = scene.add
                .zone(x, TRILHO.cy, TRILHO.gapHitW, TRILHO.cardH)
                .setOrigin(0.5).setDepth(60)
            hit.setInteractive({ useHandCursor: true })
            const idx = i
            hit.on('pointerover', () => {
                if (!espacosAtivos) return
                respiro?.remove()
                g.setScale(1)
                FX.to(scene, g, { scale: 1.3 }, { duration: 110 })
            })
            hit.on('pointerout', () => { FX.to(scene, g, { scale: 1 }, { duration: 110 }) })
            hit.on('pointerup', () => { if (espacosAtivos) onEspaco(idx) })
            zonas.push(hit)
        }

        if (!cartasAtivas) return
        for (let i = 0; i < n; i += 1) {
            // fora da vez não existe zona: não há o que recusar
            if (!tocavel(i)) continue
            const x = xCarta(i, n)
            const hit = scene.add
                .zone(x, TRILHO.cy, TRILHO.cardW, TRILHO.cardH)
                .setOrigin(0.5).setDepth(61)
            hit.setInteractive({ useHandCursor: true })
            const idx = i
            const item = itens[i]
            hit.on('pointerover', () => {
                if (tocavel(idx)) FX.to(scene, item.node, { y: TRILHO.cy - TRILHO.liftHover }, { duration: 120 })
            })
            // volta para a linha, ou para a altura de "é a sua vez" — sem isto,
            // passar o dedo por cima da carta da vez a derrubava para sempre
            hit.on('pointerout', () => { FX.to(scene, item.node, { y: baseY(item) }, { duration: 120 }) })
            hit.on('pointerup', () => { if (tocavel(idx)) onCarta(idx) })
            zonas.push(hit)
        }
    }

    const layout = async (anim: boolean) => {
        const n = itens.length
        montarZonas()

        const jobs: Array<Promise<void>> = []
        itens.forEach((item, i) => {
            if (item.voando) return
            const x = xCarta(i, n)
            const y = baseY(item)
            if (!anim) { item.node.setPosition(x, y); return }
            jobs.push(FX.to(scene, item.node, { x, y },
                { duration: 380, ease: Ease.back(1.1) }))
        })
        await FX.all(...jobs)
    }

    void layout(false)

    /** O fantasma do espaço aberto: a carta-slot em tamanho real. */
    const fantasma = (() => {
        if (hasTex(scene, TEX.slot)) {
            const img = scene.add.image(0, TRILHO.cy, TEX.slot).setAlpha(0)
            fitImage(img, TRILHO.cardW, TRILHO.cardH)
            camadaEspacos.add(img)
            return img as Phaser.GameObjects.Image | Phaser.GameObjects.Graphics
        }
        const g = scene.add.graphics().setAlpha(0)
        g.lineStyle(6, C.espaco, 1)
        g.strokeRoundedRect(-TRILHO.cardW / 2, -TRILHO.cardH / 2, TRILHO.cardW, TRILHO.cardH, TRILHO.cardR)
        g.setPosition(0, TRILHO.cy)
        camadaEspacos.add(g)
        return g
    })()

    /*
     * Apagar não é sempre alpha 0.
     *
     * Quando as CARTAS estão tocáveis, cada uma fica com um aro dourado fraco:
     * sem isso, nada na tela dizia que dava para tocar nelas, e a criança ficava
     * olhando para um trilho bonito sem saber o que fazer. Nos passos de
     * inserir, em que só os espaços aceitam toque, os aros somem de vez.
     */
    const apagarHalos = () => itens.forEach((it, i) => {
        FX.kill(scene, it.halo)
        if (!tocavel(i)) { it.halo.setAlpha(0); return }
        // creme, e não amarelo: amarelo já é O ESPAÇO onde uma carta entra, e
        // duas coisas diferentes com a mesma cor é a confusão mais barata que
        // existe. Creme aqui é só "dá para tocar" — e a carta da vez usa o
        // mesmo creme forte, que é a mesma ideia com mais volume.
        paintHalo(it.halo, C.creme)
        it.halo.setAlpha(it.apontada ? 1 : 0.28)
    })

    const acender = (i: number, tom: number, forte: boolean) => {
        const it = itens[i]
        if (!it) return
        paintHalo(it.halo, tom)
        FX.kill(scene, it.halo)
        it.halo.setAlpha(0)
        void FX.to(scene, it.halo, { alpha: forte ? 1 : 0.7 }, { duration: 200 })
    }

    return {
        container,
        lista: () => itens.map(it => it.carta),
        posDaCarta: i => ({ x: xCarta(i, itens.length), y: TRILHO.cy }),
        posDoEspaco: gap => ({ x: xEspaco(gap, itens.length), y: TRILHO.cy }),
        layout,

        setEspacos: on => {
            espacosAtivos = on
            montarZonas()
        },

        setCartasAtivas: (on, somente = null) => {
            cartasAtivas = on
            somenteCarta = on ? somente : null
            if (!on) itens.forEach(it => it.node.setY(TRILHO.cy))
            montarZonas()
            apagarHalos()
        },

        virarTodas: async oculto => {
            /*
             * Virar para BAIXO limpa a busca anterior; virar para CIMA não
             * limpa nada. É o fim do passo de busca: as que sobraram se abrem
             * para a criança ver a lista inteira, e a que ela achou continua
             * apagada de verde com o visto — senão o final apagaria justamente
             * a resposta.
             */
            if (oculto) {
                itens.forEach(it => {
                    it.conferida = false
                    FX.kill(scene, it.view.node)
                    it.view.node.setScale(1).setAlpha(1)
                    it.marca.setAlpha(0)
                })
            }

            await FX.all(...itens.map((it, i) => FX.wait(scene, i * 70).then(async () => {
                if (it.oculta === oculto) return
                it.oculta = oculto
                await FX.to(scene, it.view.node, { scaleX: 0 },
                    { duration: 140, ease: 'Sine.easeIn' })
                it.view.setVerso(oculto)
                await FX.to(scene, it.view.node, { scaleX: 1 },
                    { duration: 200, ease: Ease.back(1.8) })
            })))
        },

        destacarCarta: i => {
            apagarHalos()
            if (i === null) return
            acender(i, C.espaco, true)
            if (i > 0) acender(i - 1, C.vizinho, false)
            if (i < itens.length - 1) acender(i + 1, C.vizinho, false)
        },

        destacarEspaco: gap => {
            apagarHalos()
            if (gap === null) return
            if (gap > 0) acender(gap - 1, C.vizinho, false)
            if (gap < itens.length) acender(gap, C.vizinho, false)
        },

        apontar: i => {
            itens.forEach((it, k) => {
                const querido = k === i
                if (it.apontada === querido) return
                it.apontada = querido
                FX.kill(scene, it.node)
                void FX.to(scene, it.node, { y: baseY(it) },
                    { duration: 260, ease: Ease.back(1.6) })
            })
            apagarHalos()
        },

        /*
         * A INSERÇÃO É O CORAÇÃO DO JOGO, E POR ISSO TEM QUATRO TEMPOS.
         *
         * Primeiro as vizinhas se AFASTAM — é aí que a criança vê que a lista
         * abriu espaço, e não que a carta caiu num buraco que já estava lá.
         * Depois o slot amarelo aparece no vão, mostrando o tamanho exato do
         * que vai entrar. Só então a carta voa da mão. E o slot some por baixo
         * dela. Sem o primeiro tempo, "a lista tem número variável de itens"
         * seria uma frase; com ele, é uma coisa que se vê acontecer.
         */
        inserir: async (gap, carta, origem, aoVoar) => {
            const item = novoItem(carta)
            item.voando = true
            item.node.setPosition(origem.x, origem.y)
            item.node.setVisible(false)
            itens.splice(gap, 0, item)

            await layout(true)

            const destino = xCarta(gap, itens.length)
            fantasma.setPosition(destino, TRILHO.cy)
            await FX.to(scene, fantasma, { alpha: 1 }, { duration: 180 })

            item.node.setVisible(true)
            aoVoar?.()
            await FX.arcTo(scene, item.node, { x: destino, y: TRILHO.cy },
                { height: 150, duration: 520 })

            item.voando = false
            void FX.to(scene, fantasma, { alpha: 0 }, { duration: 160 })
            await FX.impact(scene, item.node, 0.12)
        },

        remover: async i => {
            const item = itens[i]
            if (!item) return
            await FX.to(scene, item.node,
                { y: TRILHO.cy - 220, alpha: 0, angle: -14 },
                { duration: 420, ease: Ease.anticipate(0.4) })
            item.view.destroy()
            item.node.destroy()
            itens.splice(i, 1)
            // e agora o "depois": os vizinhos se aproximam
            await layout(true)
        },

        substituir: async (i, nova) => {
            const item = itens[i]
            if (!item) return
            await FX.to(scene, item.node, { scaleX: 0 }, { duration: 170, ease: 'Sine.easeIn' })
            item.view.trocar(nova)
            item.carta = nova
            await FX.to(scene, item.node, { scaleX: 1 }, { duration: 230, ease: Ease.back(2) })
            void FX.sparks(scene, xCarta(i, itens.length), TRILHO.cy,
                { color: C.espaco, count: 16, spread: 140 })
        },

        revelar: async (i, achou) => {
            const item = itens[i]
            if (!item) return
            item.conferida = true

            // a virada: encolhe na horizontal, troca a face, volta
            await FX.to(scene, item.view.node, { scaleX: 0 },
                { duration: 150, ease: 'Sine.easeIn' })
            item.oculta = false
            item.view.setVerso(false)
            await FX.to(scene, item.view.node, { scaleX: 1 },
                { duration: 220, ease: Ease.back(2) })

            if (!achou) {
                /*
                 * A carta virada que não era APAGA.
                 *
                 * É o que faz a lista encurtar diante do olho: o que já passou
                 * sai do caminho e o que falta fica sozinho aceso. Sem isso, na
                 * sexta carta a criança estava olhando seis cartas viradas e
                 * tentando lembrar quais já tinha visto.
                 */
                void FX.to(scene, item.view.node, { alpha: 0.42 }, { duration: 240 })
                return
            }

            FX.kill(scene, item.marca)
            item.marca.setAlpha(0).setScale(0.3)
            await FX.to(scene, item.marca, { alpha: 1, scale: 1 },
                { duration: 240, ease: Ease.back(2.4) })
            void FX.impact(scene, item.node, 0.14)
        },

        recusar: async i => {
            const item = itens[i]
            if (!item) return
            paintHalo(item.halo, C.alerta)
            item.halo.setAlpha(1)
            await FX.shake(scene, item.node, { amount: 9, times: 2 })
            await FX.to(scene, item.halo, { alpha: 0 }, { duration: 220 })
        },

        recusarEspaco: async gap => {
            const g = espacos[gap]
            if (!g) return
            const antes = { x: g.x }
            g.setScale(1.3)
            await FX.shake(scene, g, { amount: 8, times: 2 })
            g.setPosition(antes.x, TRILHO.cy)
            await FX.to(scene, g, { scale: 1 }, { duration: 160 })
        },

        destroy: () => {
            limparZonas()
            itens.forEach(it => it.view.destroy())
            container.destroy()
        },
    }
}

/* ═══════════════════════════════════════════════════ painel de vizinhos */

export function paintMiniCarta(
    g: Phaser.GameObjects.Graphics,
    { carta, tom }: { carta?: Carta; tom: number },
) {
    const hw = VIZINHOS.miniW / 2
    const hh = VIZINHOS.miniH / 2

    g.clear()
    if (!carta) {
        // casa vazia: não há ninguém deste lado, e é isso que precisa aparecer
        g.lineStyle(3, C.idle, 0.7)
        g.strokeRoundedRect(-hw, -hh, VIZINHOS.miniW, VIZINHOS.miniH, VIZINHOS.miniR)
        g.lineStyle(4, C.idle, 0.55)
        g.lineBetween(-hw + 12, hh - 12, hw - 12, -hh + 12)
        return
    }
    g.fillStyle(C.shadow, 0.3)
    g.fillRoundedRect(-hw + 2, -hh + 3, VIZINHOS.miniW, VIZINHOS.miniH, VIZINHOS.miniR)
    g.fillStyle(tom, 1)
    g.fillRoundedRect(-hw, -hh, VIZINHOS.miniW, VIZINHOS.miniH, VIZINHOS.miniR)
    g.fillStyle(C.creme, 1)
    g.fillRoundedRect(-hw + 5, -hh + 5, VIZINHOS.miniW - 10, VIZINHOS.miniH - 10, VIZINHOS.miniR - 3)
}

/** A casa que ainda está de costas, na busca: verso de carta, e não vazio. */
export function paintMiniVerso(g: Phaser.GameObjects.Graphics) {
    const hw = VIZINHOS.miniW / 2
    const hh = VIZINHOS.miniH / 2
    g.clear()
    g.fillStyle(C.shadow, 0.3)
    g.fillRoundedRect(-hw + 2, -hh + 3, VIZINHOS.miniW, VIZINHOS.miniH, VIZINHOS.miniR)
    g.fillStyle(C.creme, 1)
    g.fillRoundedRect(-hw, -hh, VIZINHOS.miniW, VIZINHOS.miniH, VIZINHOS.miniR)
    g.fillStyle(C.verso, 1)
    g.fillRoundedRect(-hw + 4, -hh + 4, VIZINHOS.miniW - 8, VIZINHOS.miniH - 8, VIZINHOS.miniR - 2)
}

export function paintSeta(g: Phaser.GameObjects.Graphics, dir: 1 | -1) {
    g.clear()
    g.fillStyle(C.idle, 0.9)
    g.fillRect(-11 * dir, -3, 22 * dir, 6)
    g.fillTriangle(9 * dir, -10, 9 * dir, 10, 20 * dir, 0)
}

export interface Vizinhos {
    container: Phaser.GameObjects.Container
    /** Mostra quem fica antes, no meio e depois. */
    set(v: Vizinhanca): void
    destroy(): void
}

export function createVizinhos(scene: Phaser.Scene): Vizinhos {
    const container = scene.add.container(0, 0).setDepth(30)

    const g = scene.add.graphics()
    g.fillStyle(C.shadow, 0.34)
    g.fillRoundedRect(VIZINHOS.x + 4, VIZINHOS.y + 6, VIZINHOS.w, VIZINHOS.h, VIZINHOS.r)
    g.fillStyle(C.painel, 0.96)
    g.fillRoundedRect(VIZINHOS.x, VIZINHOS.y, VIZINHOS.w, VIZINHOS.h, VIZINHOS.r)
    g.lineStyle(3, C.vizinho, 0.7)
    g.strokeRoundedRect(VIZINHOS.x, VIZINHOS.y, VIZINHOS.w, VIZINHOS.h, VIZINHOS.r)
    container.add(g)

    container.add(scene.add.text(VIZINHOS.rotuloX, VIZINHOS.cy, 'VIZINHOS', {
        fontFamily: FONT.black, fontSize: SIZE.vizinhoRotulo, color: hex(C.vizinho),
    }).setOrigin(0, 0.5).setResolution(2))

    /*
     * Cada casa tem nome.
     *
     * Três cartinhas iguais lado a lado não diziam qual era qual — e a do meio,
     * que é a carta em questão e não um vizinho, parecia só mais uma. "ANTES",
     * "ESTA" e "DEPOIS" custam três palavras de 12px e resolvem o painel
     * inteiro.
     */
    const nomes = ['ANTES', 'ESTA', 'DEPOIS']
    const casas = [-1, 0, 1].map((k, idx) => {
        const x = VIZINHOS.cardsCX + k * VIZINHOS.cardsGap
        const y = VIZINHOS.cy + VIZINHOS.cardDY

        container.add(scene.add.text(x, VIZINHOS.cy + VIZINHOS.rotuloDY, nomes[idx], {
            fontFamily: FONT.black, fontSize: SIZE.vizinhoCasa,
            color: hex(idx === 1 ? C.espaco : C.vizinho),
        }).setOrigin(0.5).setResolution(2))

        const gc = scene.add.graphics().setPosition(x, y)
        const t = scene.add.text(x, y, '', {
            fontFamily: FONT.black, fontSize: SIZE.vizinhoValor, color: hex(C.ink),
        }).setOrigin(0.5).setResolution(2)
        container.add([gc, t])
        return { g: gc, t }
    })

    ;[-1, 1].forEach(k => {
        const gs = scene.add.graphics()
            .setPosition(VIZINHOS.cardsCX + k * VIZINHOS.setaDX, VIZINHOS.cy + VIZINHOS.cardDY)
        paintSeta(gs, k > 0 ? 1 : -1)
        container.add(gs)
    })

    const tomDe = (c?: Carta, meio = false) => {
        if (!c) return C.idle
        if (c.naipe === 'coringa') return C.espaco
        if (meio) return C.espaco
        return C.vizinho
    }

    const por = (
        k: number,
        carta: Carta | undefined,
        meio: boolean,
        oculto = false,
    ) => {
        const casa = casas[k]
        if (oculto) {
            paintMiniVerso(casa.g)
            casa.t.setText('?')
            casa.t.setColor(hex(C.creme))
        } else {
            paintMiniCarta(casa.g, { carta, tom: tomDe(carta, meio) })
            casa.t.setText(carta ? rotuloDe(carta) : '')
            casa.t.setColor(hex(C.ink))
        }
        FX.kill(scene, casa.g)
        casa.g.setScale(0.8)
        void FX.to(scene, casa.g, { scale: 1 }, { duration: 220, ease: Ease.back(2) })
    }

    return {
        container,
        set: v => {
            por(0, v.anterior, false)
            por(1, v.alvo, true)
            por(2, v.seguinte, false, v.depoisOculto === true)
        },
        destroy: () => container.destroy(),
    }
}

/* ═════════════════════════════════════ a coluna da direita: a carta em foco */

/** A moldura fixa da coluna. Ela não pisca entre um passo e outro. */
export function paintFocoMoldura(g: Phaser.GameObjects.Graphics) {
    g.clear()
    g.fillStyle(C.shadow, 0.34)
    g.fillRoundedRect(FOCO.x + 4, FOCO.y + 6, FOCO.w, FOCO.h, FOCO.r)
    g.fillStyle(C.painel, 0.96)
    g.fillRoundedRect(FOCO.x, FOCO.y, FOCO.w, FOCO.h, FOCO.r)
    g.lineStyle(3, C.latao, 0.75)
    g.strokeRoundedRect(FOCO.x, FOCO.y, FOCO.w, FOCO.h, FOCO.r)
}

/** O lugar vazio da carta, entre um passo e o outro. */
export function paintFocoVazio(g: Phaser.GameObjects.Graphics) {
    const hw = FOCO.cardW / 2
    const hh = FOCO.cardH / 2
    g.clear()
    g.lineStyle(3, C.idle, 0.45)
    g.strokeRoundedRect(-hw, -hh, FOCO.cardW, FOCO.cardH, TRILHO.cardR)
}

export interface Foco {
    container: Phaser.GameObjects.Container
    /** Troca o conteúdo: a carta do passo e o que fazer com ela. */
    mostrar(carta: Carta, rotulo: string): void
    /** A carta saiu para a lista; a moldura fica. */
    esvaziar(): void
    /** De onde a carta voa, quando entra no trilho. */
    pos(): { x: number; y: number }
    destroy(): void
}

/**
 * A coluna nasce com a cena e morre com ela.
 *
 * A versão anterior criava e destruía um objeto solto no canto a cada passo —
 * e nos passos de busca não criava nada, deixando o canto direito ser um botão
 * pendurado no vazio. Moldura fixa, conteúdo trocável: a criança aprende uma
 * vez onde olhar, e o lugar continua lá.
 */
export function createFoco(scene: Phaser.Scene): Foco {
    const container = scene.add.container(0, 0).setDepth(35)

    const moldura = scene.add.graphics()
    paintFocoMoldura(moldura)
    container.add(moldura)

    const rotulo = scene.add.text(FOCO.cx, FOCO.rotuloY, '', {
        fontFamily: FONT.black, fontSize: SIZE.focoRotulo, color: hex(C.creme),
    }).setOrigin(0.5).setResolution(2)
    container.add(rotulo)

    const vazio = scene.add.graphics().setPosition(FOCO.cx, FOCO.cardCY)
    paintFocoVazio(vazio)
    container.add(vazio)

    /** O suporte que a carta habita: é ele que flutua, e nunca a moldura. */
    const berco = scene.add.container(FOCO.cx, FOCO.cardCY)
    container.add(berco)

    let view: CartaView | undefined
    let flutua: Phaser.Tweens.Tween | null = null

    const limpar = () => {
        flutua?.remove(); flutua = null
        FX.kill(scene, berco)
        // o `float` para no meio do caminho quando é morto: sem devolver o
        // berço ao lugar, cada passo começa alguns pixels mais acima que o
        // anterior e a coluna sobe sozinha ao longo do jogo
        berco.setPosition(FOCO.cx, FOCO.cardCY).setScale(1).setAlpha(1)
        view?.destroy(); view = undefined
    }

    return {
        container,

        mostrar: (carta, texto) => {
            limpar()
            vazio.setAlpha(0)
            rotulo.setText(texto)

            view = createCartaView(scene, carta, FOCO.cardW, FOCO.cardH)
            berco.add(view.node)

            void FX.popIn(scene, berco, { from: 0.62, duration: 380 })
            FX.kill(scene, rotulo)
            rotulo.setAlpha(0)
            void FX.to(scene, rotulo, { alpha: 1 }, { duration: 240 })
            flutua = FX.float(scene, berco, { amount: 7, duration: 1900 })
        },

        esvaziar: () => {
            limpar()
            rotulo.setText('')
            vazio.setAlpha(1)
        },

        pos: () => ({ x: FOCO.cx, y: FOCO.cardCY }),
        destroy: () => { limpar(); container.destroy() },
    }
}

/* ═════════════════════════════════════════════════════════ a menina */

export interface Personagem {
    container: Phaser.GameObjects.Container
    setPose(p: Pose): void
    comemorar(): Promise<void>
    destroy(): void
}

export function createPersonagem(scene: Phaser.Scene): Personagem {
    const container = scene.add.container(PERSONAGEM.cx, PERSONAGEM.cy).setDepth(28)
    let img: Phaser.GameObjects.Image | undefined

    const trocar = (p: Pose) => {
        const key = POSE[p]
        if (!hasTex(scene, key)) return
        if (img) {
            if (img.texture.key !== key) img.setTexture(key)
            return
        }
        img = scene.add.image(0, 0, key)
        fitImage(img, PERSONAGEM.altura, PERSONAGEM.altura)
        container.add(img)
    }

    trocar('pensando')
    const respira = FX.float(scene, container, { amount: 6, duration: 2400 })

    return {
        container,
        setPose: trocar,
        comemorar: async () => {
            trocar('comemorando')
            FX.kill(scene, container)
            container.setScale(1)
            await FX.to(scene, container, { scale: 1.12 },
                { duration: 180, yoyo: true, ease: Ease.back(2.4) })
        },
        destroy: () => { respira?.remove(); container.destroy() },
    }
}

/* ═══════════════════════════════════════════════════ o balão da menina */

/**
 * O balão é PAPEL LIMPO: creme, com tinta escura, e nada em volta do texto.
 *
 * Sem borda e sem a tarja de cor que ficava na lateral. Um balão de fala não
 * tem contorno colorido nem faixa vertical — isso era desenho de "caixa de
 * aviso", e ele deixou de ser aviso quando passou a ser fala. O que sobra é o
 * papel, a biqueira apontando para quem fala, e uma sombra fraca para o papel
 * pousar no feltro em vez de flutuar.
 *
 * A cor do recado mora na LETRA (`TINTA`), que é o único lugar que restou — e é
 * o certo: ler nunca depende do que aconteceu, porque o fundo é sempre o mesmo.
 */
export function paintBalao(g: Phaser.GameObjects.Graphics) {
    g.clear()

    g.fillStyle(C.shadow, 0.28)
    g.fillRoundedRect(BALAO.x + 3, BALAO.y + 6, BALAO.w, BALAO.h, BALAO.r)

    // a biqueira, apontando para a menina — desenhada antes do corpo para o
    // corpo cobrir a base dela e os dois virarem uma peça só
    g.fillStyle(C.creme, 1)
    g.fillTriangle(
        BALAO.biqueiraX - BALAO.biqueiraW, BALAO.biqueiraY,
        BALAO.biqueiraX + 14, BALAO.biqueiraY - BALAO.biqueiraH / 2,
        BALAO.biqueiraX + 14, BALAO.biqueiraY + BALAO.biqueiraH / 2,
    )
    g.fillRoundedRect(BALAO.x, BALAO.y, BALAO.w, BALAO.h, BALAO.r)
}

export interface Balao {
    container: Phaser.GameObjects.Container
    /**
     * Fala, e FICA falado.
     *
     * Não existe versão que some sozinha: o que a menina disse continua na tela
     * até haver outra coisa a dizer. Era esse o pedido — os avisos eram grandes
     * e sumiam rápido, e sumir rápido é pior defeito que ser grande.
     *
     * `tinta` é a cor da LETRA (use `TINTA`), e não uma cor de painel: o balão
     * não tem borda nem tarja onde pôr cor.
     */
    dizer(texto: string, tinta?: number): void
    destroy(): void
}

export function createBalao(scene: Phaser.Scene): Balao {
    const container = scene.add.container(0, 0).setDepth(32)

    // o papel é desenhado UMA vez: ele não muda mais com o tipo do recado
    const g = scene.add.graphics()
    paintBalao(g)
    container.add(g)

    const texto = scene.add.text(BALAO.textoX, BALAO.textoY, '', {
        fontFamily: FONT.body, fontStyle: 'bold', fontSize: SIZE.balao,
        color: hex(TINTA.fala), align: 'left',
        wordWrap: { width: BALAO.wrap },
        lineSpacing: 4,
    }).setOrigin(0, 0.5).setResolution(2)
    container.add(texto)

    /*
     * O balão NÃO tem animação de escala.
     *
     * O `Graphics` dele desenha em coordenadas de tela — `fillRoundedRect` em
     * x=340 — dentro de um container parado na origem. Escalar esse container
     * escalaria a partir do canto (0,0) e o balão sairia voando para fora da
     * mesa. O que muda a cada fala é o texto, e é o texto que aparece.
     */
    container.setAlpha(0)
    void FX.to(scene, container, { alpha: 1 }, { duration: 300 })

    return {
        container,
        /*
         * Repete de bom grado.
         *
         * Errar o mesmo espaço duas vezes seguidas produz a mesma frase — e se
         * a fala igual não reaparecesse, o segundo erro seria a única ação do
         * jogo sem resposta nenhuma na tela.
         */
        dizer: (msg, tinta = TINTA.fala) => {
            texto.setText(msg)
            texto.setColor(hex(tinta))
            FX.kill(scene, texto)
            texto.setAlpha(0)
            void FX.to(scene, texto, { alpha: 1 }, { duration: 220 })
        },
        destroy: () => container.destroy(),
    }
}

export { W, H }
