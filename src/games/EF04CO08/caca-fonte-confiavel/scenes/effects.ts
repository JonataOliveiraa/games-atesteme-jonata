import Phaser from 'phaser'
import { FX, Ease } from '../../../../shared/effects/FX'
import {
    C, A, FONT, SIZE, TYPE_MS, LONGA, RESPOSTA_LONGA, hex, inkOn,
} from '../data/theme'
import {
    W, H, HUD, PERGUNTA, CARTAO, ESCOLHER, CARIMBO, EXPLICACAO, TOAST,
} from '../data/layout'
import { CRITERIOS, linhaDe, type Criterio, type Pagina } from '../types'

/*
 * Painters puros e construtores. A GameScene não desenha nada: se ela precisar
 * de um `fillRoundedRect`, falta um painter aqui.
 *
 * Neste jogo as texturas são o CENÁRIO e as três ilustrações de tema. Cartão,
 * barra de endereço, ícone de critério, traço de marca-texto e carimbo têm
 * estado e saem todos de `Graphics` — o traço varre a linha, o carimbo cai e
 * gira, e as linhas mudam de cor na revelação.
 */

/* ═══════════════════════════════════════════════════════════ texturas */

export const TEX = { fundo: 'bg-pesquisa' } as const

export const hasTex = (scene: Phaser.Scene, key: string) => scene.textures.exists(key)

/** Encaixa a imagem numa caixa, pela menor razão — nunca estica. */
export function fitImage(img: Phaser.GameObjects.Image, maxW: number, maxH: number) {
    // medido na TEXTURA: os tipos do Phaser deste projeto não expõem `width`
    // em `Image`, e o `tsc` do build reprova
    const src = img.texture.getSourceImage() as { width: number; height: number }
    img.setScale(Math.min(maxW / src.width, maxH / src.height))
}

/* ═══════════════════════════════════════════════════════════ cenário */

/** Biblioteca à noite em Graphics, quando a textura não estiver na pasta. */
export function paintSala(g: Phaser.GameObjects.Graphics) {
    g.clear()
    g.fillStyle(C.ink, 1)
    g.fillRect(0, 0, W, H)

    // estantes nas duas bordas: posição fixa, senão a parede muda de desenho a
    // cada repintura e a criança acha que alguma coisa aconteceu
    const estante = (x0: number) => {
        g.fillStyle(C.estante, 0.95)
        g.fillRoundedRect(x0, 20, 190, 680, 14)
        for (let p = 0; p < 5; p += 1) {
            const y = 44 + p * 132
            g.fillStyle(C.estanteClara, 0.55)
            g.fillRoundedRect(x0 + 12, y + 96, 166, 10, 4)
            // os livros: larguras e cores fixas, em ordem
            let x = x0 + 16
            for (let i = 0; i < 7; i += 1) {
                const lw = 14 + ((i + p) % 3) * 6
                const alt = 62 + ((i * 3 + p) % 4) * 9
                const tons = [C.marca, C.ok, C.alerta, C.edge, C.papel]
                g.fillStyle(tons[(i + p * 2) % tons.length], 0.5)
                g.fillRoundedRect(x, y + 96 - alt, lw, alt, 3)
                x += lw + 3
            }
        }
    }
    estante(-30)
    estante(W - 160)
}

export function createSala(scene: Phaser.Scene): void {
    if (!hasTex(scene, TEX.fundo)) {
        const g = scene.add.graphics().setDepth(-20)
        paintSala(g)
        return
    }

    const bg = scene.add.image(W / 2, H / 2, TEX.fundo).setDepth(-20)
    const src = bg.texture.getSourceImage() as { width: number; height: number }
    bg.setScale(Math.max(W / src.width, H / src.height))

    // o véu existe para o fundo nunca competir com o papel branco dos cartões:
    // eles são a informação, e página clara sobre parede clara some
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
 * cairia fora, comendo o clique. Vale para todo botão, linha e cartão daqui.
 */
export function createRoundButton(
    scene: Phaser.Scene,
    x: number, y: number, r: number,
    label: string,
    onClick: () => void,
    tone = C.edge,
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
    /*
     * O rótulo se pinta a partir do TOM do botão, não de branco fixo.
     *
     * Branco sobre amarelo não se lê — e amarelo é a cor assinatura deste
     * jogo, então mais cedo ou mais tarde algum botão ia usá-la. `inkOn`
     * devolve tinta escura em fundo claro e tinta clara em fundo escuro, e o
     * problema deixa de poder acontecer.
     */
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
        bg.fillStyle(C.shadow, 0.3)
        bg.fillRoundedRect(-w / 2 + 4, -h / 2 + drop + 6, w, h, h / 2)
        bg.fillStyle(enabled ? deep : 0x3b3652, 1)
        bg.fillRoundedRect(-w / 2, -h / 2, w, h + drop, h / 2)
        bg.fillStyle(enabled ? tone : 0x5d5678, 1)
        bg.fillRoundedRect(-w / 2, -h / 2 + dy, w, h, h / 2)
        bg.fillStyle(C.white, enabled ? 0.28 : 0.1)
        bg.fillRoundedRect(-w / 2 + 14, -h / 2 + dy + 8, w - 28, h * 0.26, h / 4)
        bg.lineStyle(4, C.white, enabled ? 0.9 : 0.28)
        bg.strokeRoundedRect(-w / 2, -h / 2 + dy, w, h, h / 2)
        // desligado o botão fica cinza, e a tinta do TOM deixa de servir nele
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

/**
 * A faixa do header, de ponta a ponta.
 *
 * Sem cantos redondos e sem margem: ela encosta nas quatro pontas de cima da
 * tela. O que a separa do jogo não é uma borda em volta — é a linha amarela no
 * pé dela e a sombra que cai logo abaixo. Uma barra que atravessa a tela
 * inteira lê como a barra de uma janela, e é isso que este jogo quer.
 */
export function paintHudBar(g: Phaser.GameObjects.Graphics) {
    g.clear()
    g.fillStyle(C.painel, 0.98)
    g.fillRect(0, 0, HUD.w, HUD.h)
    // o brilho de cima, que dá volume à faixa
    g.fillStyle(C.white, 0.05)
    g.fillRect(0, 0, HUD.w, 24)
    g.fillStyle(C.white, 0.03)
    g.fillRect(0, 24, HUD.w, 12)
    // a linha de acento e a sombra: é o que fecha o header por baixo
    g.fillStyle(C.marca, 0.85)
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
    setHelpEnabled(on: boolean): void
    destroy(): void
}

export function createHud(scene: Phaser.Scene, { onHelp }: { onHelp: () => void }): Hud {
    const container = scene.add.container(0, 0).setDepth(80)

    const bar = scene.add.graphics()
    paintHudBar(bar)
    container.add(bar)

    const pill = scene.add.graphics()
    pill.fillStyle(C.edge, 1)
    pill.fillRoundedRect(HUD.pillX, HUD.pillY, HUD.pillW, HUD.pillH, HUD.pillH / 2)
    pill.fillStyle(C.white, 0.24)
    pill.fillRoundedRect(HUD.pillX + 10, HUD.pillY + 6, HUD.pillW - 20, 12, 6)
    container.add(pill)

    const levelLabel = scene.add.text(HUD.pillX + HUD.pillW / 2, HUD.cy, 'NÍVEL 1', {
        fontFamily: FONT.black, fontSize: SIZE.hudLevel, color: hex(C.white),
    }).setOrigin(0.5).setResolution(2)
    container.add(levelLabel)

    const title = scene.add.text(HUD.titleX, HUD.cy, '', {
        fontFamily: FONT.black, fontSize: SIZE.hudTitle, color: hex(C.paper),
        align: 'center', wordWrap: { width: HUD.titleW },
    }).setOrigin(0.5).setResolution(2)
    container.add(title)

    const dots = scene.add.container(0, 0)
    container.add(dots)

    const help = createRoundButton(scene, HUD.helpX, HUD.cy, HUD.helpR, '?', onHelp, C.edge)
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
                    g.fillStyle(C.marca, 1)
                    g.fillRoundedRect(x - 13, HUD.cy - 7, 26, 14, 7)
                } else {
                    g.fillStyle(C.white, 0.18)
                    g.fillCircle(x, HUD.cy, HUD.dotR)
                }
                dots.add(g)
            }
        },

        setHelpEnabled: help.setEnabled,
        destroy: () => { help.destroy(); container.destroy() },
    }
}

/* ═══════════════════════════════════════════════════════ a pergunta */

/** A lupa da faixa: o símbolo do jogo inteiro. */
export function paintLupa(g: Phaser.GameObjects.Graphics, r: number, tone: number) {
    g.clear()
    g.fillStyle(tone, 0.2)
    g.fillCircle(0, 0, r)
    g.lineStyle(5, tone, 1)
    g.strokeCircle(0, 0, r)
    g.lineStyle(6, tone, 1)
    g.lineBetween(r * 0.72, r * 0.72, r * 1.5, r * 1.5)
}

export interface Pergunta {
    container: Phaser.GameObjects.Container
    /** Escreve letra a letra. Para quando a pergunta MUDA. */
    show(text: string): Promise<void>
    /** Põe na hora, sem digitar. Para a volta depois de um erro. */
    set(text: string): void
    destroy(): void
}

export function createPergunta(scene: Phaser.Scene): Pergunta {
    const container = scene.add.container(0, 0).setDepth(30)

    const g = scene.add.graphics()
    g.fillStyle(C.shadow, 0.3)
    g.fillRoundedRect(PERGUNTA.x + 4, PERGUNTA.y + 6, PERGUNTA.w, PERGUNTA.h, PERGUNTA.r)
    g.fillStyle(C.painel, 0.95)
    g.fillRoundedRect(PERGUNTA.x, PERGUNTA.y, PERGUNTA.w, PERGUNTA.h, PERGUNTA.r)
    g.lineStyle(3, C.marca, 0.7)
    g.strokeRoundedRect(PERGUNTA.x, PERGUNTA.y, PERGUNTA.w, PERGUNTA.h, PERGUNTA.r)
    container.add(g)

    const lupa = scene.add.graphics().setPosition(PERGUNTA.lupaX, PERGUNTA.cy - 3)
    paintLupa(lupa, PERGUNTA.lupaR, C.marca)
    container.add(lupa)

    const label = scene.add.text(PERGUNTA.cx, PERGUNTA.cy, '', {
        fontFamily: FONT.black, fontSize: SIZE.pergunta,
        color: hex(C.paper), align: 'center', wordWrap: { width: PERGUNTA.wrap },
    }).setOrigin(0.5).setResolution(2)
    container.add(label)

    let typing: { skip: () => void } | null = null

    const medir = (text: string) =>
        label.setFontSize(text.length > LONGA ? SIZE.perguntaLonga : SIZE.pergunta)

    return {
        container,
        show: async text => {
            typing?.skip()
            medir(text)
            // mede com o texto completo antes de escrever, senão a linha
            // cresceria letra a letra e o texto pularia dentro da faixa
            label.setText(text)
            label.setText('')
            const tw = FX.type(scene, label, text, { delay: TYPE_MS.pergunta })
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
        destroy: () => { typing?.skip(); container.destroy() },
    }
}

/* ═════════════════════════════════ ícones dos quatro critérios */

/**
 * Os quatro ícones.
 *
 * Eles são o "bloco de critérios de verificação" que o briefing pede — só que
 * distribuído sobre as próprias páginas, onde é usado, em vez de morar numa
 * caixa à parte que a criança teria que consultar e traduzir. Como aparecem
 * sempre na mesma ordem em todos os cartões, é o ícone que ensina por onde
 * começar a ler uma página.
 */
export function paintCriterioIcone(
    g: Phaser.GameObjects.Graphics,
    c: Criterio,
    r: number,
    tone: number,
) {
    g.clear()
    g.lineStyle(2.5, tone, 1)
    g.fillStyle(tone, 1)

    if (c === 'endereco') {
        // um globo: de onde a página vem
        g.strokeCircle(0, 0, r)
        g.beginPath()
        g.arc(0, 0, r, -Math.PI / 2, Math.PI / 2, false)
        g.strokePath()
        g.lineBetween(-r, 0, r, 0)
        g.lineStyle(2.5, tone, 0.8)
        g.strokeEllipse(0, 0, r, r * 2)
        return
    }

    if (c === 'autor') {
        // uma cabecinha: quem escreveu
        g.fillCircle(0, -r * 0.42, r * 0.42)
        g.fillRoundedRect(-r * 0.72, r * 0.1, r * 1.44, r * 0.8, r * 0.36)
        return
    }

    if (c === 'data') {
        // um calendário: de quando é
        g.fillRoundedRect(-r * 0.2 - 4, -r, 4, r * 0.4, 2)
        g.fillRoundedRect(r * 0.2, -r, 4, r * 0.4, 2)
        g.strokeRoundedRect(-r * 0.9, -r * 0.72, r * 1.8, r * 1.6, 3)
        g.lineBetween(-r * 0.9, -r * 0.22, r * 0.9, -r * 0.22)
        return
    }

    // um livro aberto: de onde a página tirou o que diz
    g.lineBetween(0, -r * 0.6, 0, r * 0.72)
    g.beginPath()
    g.moveTo(-r, -r * 0.5)
    g.lineTo(-r * 0.1, -r * 0.62)
    g.lineTo(-r * 0.1, r * 0.66)
    g.lineTo(-r, r * 0.78)
    g.closePath()
    g.strokePath()
    g.beginPath()
    g.moveTo(r, -r * 0.5)
    g.lineTo(r * 0.1, -r * 0.62)
    g.lineTo(r * 0.1, r * 0.66)
    g.lineTo(r, r * 0.78)
    g.closePath()
    g.strokePath()
}

/* ═══════════════════════════════════════════════════ o cartão de página */

export function paintCorpo(g: Phaser.GameObjects.Graphics, w: number) {
    const hw = w / 2
    const hh = CARTAO.h / 2

    g.clear()
    g.fillStyle(C.shadow, 0.4)
    g.fillRoundedRect(-hw + 6, -hh + 10, w, CARTAO.h, CARTAO.r)
    g.fillStyle(C.papel, 1)
    g.fillRoundedRect(-hw, -hh, w, CARTAO.h, CARTAO.r)

    // a barra de endereço, colada no topo
    g.fillStyle(C.barra, 1)
    g.fillRoundedRect(-hw, -hh, w, CARTAO.barraH, CARTAO.r)
    g.fillRect(-hw, -hh + CARTAO.barraH - 14, w, 14)
    g.fillStyle(C.papelEdge, 1)
    g.fillRect(-hw, -hh + CARTAO.barraH, w, 2)

    // as bolinhas de janela de navegador
    for (let i = 0; i < 3; i += 1) {
        g.fillStyle(C.papelEdge, 1)
        g.fillCircle(-hw + CARTAO.bolhaDX + i * CARTAO.bolhaGap, CARTAO.barraY, CARTAO.bolhaR)
    }

    g.lineStyle(3, C.papelEdge, 1)
    g.strokeRoundedRect(-hw, -hh, w, CARTAO.h, CARTAO.r)
}

/** O bloco neutro que ocupa o lugar da ilustração enquanto ela não existe. */
export function paintTemaVazio(g: Phaser.GameObjects.Graphics, w: number) {
    const hw = w / 2 - CARTAO.temaPad
    const hh = CARTAO.temaH / 2

    g.clear()
    g.fillStyle(C.vazio, 1)
    g.fillRoundedRect(-hw, -hh, hw * 2, CARTAO.temaH, 8)
    // um morro e um sol: o desenho universal de "aqui vai uma imagem"
    g.fillStyle(C.papelEdge, 1)
    g.fillCircle(-hw * 0.44, -hh * 0.22, 11)
    g.fillTriangle(-hw * 0.6, hh * 0.62, -hw * 0.05, -hh * 0.3, hw * 0.5, hh * 0.62)
    g.fillTriangle(hw * 0.1, hh * 0.62, hw * 0.46, -hh * 0.02, hw * 0.82, hh * 0.62)
}

export function paintRespostaBox(g: Phaser.GameObjects.Graphics, w: number) {
    const hw = w / 2 - CARTAO.respostaPad
    const hh = CARTAO.respostaH / 2

    g.clear()
    g.fillStyle(C.resposta, 1)
    g.fillRoundedRect(-hw, -hh, hw * 2, CARTAO.respostaH, 10)
    g.lineStyle(3, C.papelEdge, 1)
    g.strokeRoundedRect(-hw, -hh, hw * 2, CARTAO.respostaH, 10)
    // a aspa de citação, no canto: é o que a página AFIRMA
    g.fillStyle(C.papelEdge, 1)
    g.fillRoundedRect(-hw + 12, -hh + 10, 5, 14, 2)
    g.fillRoundedRect(-hw + 21, -hh + 10, 5, 14, 2)
}

export function paintCarimbo(
    g: Phaser.GameObjects.Graphics,
    w: number,
    { confiavel }: { confiavel: boolean },
) {
    const hw = w / 2 - CARIMBO.pad
    const hh = CARIMBO.h / 2
    const tone = confiavel ? C.ok : C.alerta

    g.clear()
    g.fillStyle(C.papel, 0.96)
    g.fillRoundedRect(-hw, -hh, hw * 2, CARIMBO.h, CARIMBO.r)
    g.fillStyle(tone, 0.16)
    g.fillRoundedRect(-hw, -hh, hw * 2, CARIMBO.h, CARIMBO.r)
    g.lineStyle(6, tone, 1)
    g.strokeRoundedRect(-hw, -hh, hw * 2, CARIMBO.h, CARIMBO.r)
    g.lineStyle(2, tone, 0.6)
    g.strokeRoundedRect(-hw + 8, -hh + 8, hw * 2 - 16, CARIMBO.h - 16, CARIMBO.r - 5)
}

export interface Cartao {
    container: Phaser.GameObjects.Container
    /** Grifa ou desgrifa uma linha. Devolve como ficou. */
    alternar(c: Criterio): boolean
    marcadas(): Criterio[]
    /** A escolhida cresce e vem à frente. */
    escolher(): Promise<void>
    /** As outras escurecem e recuam. */
    recuar(): Promise<void>
    /** O carimbo cai sobre a ilustração. */
    revelar(): Promise<void>
    /** A pista decisiva se acende. Se não estava grifada, ela aparece sozinha. */
    acender(c: Criterio, grifada: boolean): Promise<void>
    setEnabled(on: boolean): void
    sair(dx: number): Promise<void>
    destroy(): void
}

export function createCartao(
    scene: Phaser.Scene,
    { pagina, letra, cx, w, tema, entrando, onMarcar }: {
        pagina: Pagina
        letra: string
        cx: number
        w: number
        tema: string
        /** Caso novo: o cartão sobe do rodapé. Retomada: só reaparece. */
        entrando: boolean
        onMarcar: (c: Criterio, ligada: boolean) => void
    },
): Cartao {
    const container = scene.add.container(cx, CARTAO.cy).setDepth(25)
    const hw = w / 2
    const hh = CARTAO.h / 2

    const corpo = scene.add.graphics()
    paintCorpo(corpo, w)
    container.add(corpo)

    /*
     * As marcas entram ANTES do texto e dos ícones.
     *
     * O traço do marca-texto tem que passar POR BAIXO das letras, como o de
     * verdade — por cima ele viraria uma tarja e apagaria justamente a pista
     * que a criança acabou de achar.
     */
    const marcas = new Map<Criterio, {
        g: Phaser.GameObjects.Graphics
        y: number
        on: boolean
        tom: number
        alpha: number
    }>()

    const yDe = (c: Criterio): number => {
        if (c === 'endereco') return CARTAO.barraY
        const i = CRITERIOS.indexOf(c) - 1
        return CARTAO.linha1Y + i * CARTAO.linhaGap
    }

    const marcaW = w - CARTAO.marcaPad * 2

    const pintarMarca = (c: Criterio) => {
        const m = marcas.get(c)
        if (!m) return
        m.g.clear()
        m.g.fillStyle(m.tom, m.alpha)
        m.g.fillRoundedRect(0, -CARTAO.marcaH / 2, marcaW, CARTAO.marcaH, CARTAO.marcaR)
    }

    CRITERIOS.forEach(c => {
        const y = yDe(c)
        const g = scene.add.graphics().setPosition(-hw + CARTAO.marcaPad, y)
        g.setScale(0, 1)
        container.add(g)
        marcas.set(c, { g, y, on: false, tom: C.marca, alpha: A.marca })
        pintarMarca(c)
    })

    /* ── barra de endereço ─────────────────────────────────────────── */
    container.add(scene.add.text(-hw + CARTAO.enderecoDX, CARTAO.barraY, pagina.endereco.texto, {
        fontFamily: FONT.mono, fontStyle: 'bold', fontSize: SIZE.endereco,
        color: hex(C.slate),
    }).setOrigin(0, 0.5).setResolution(2))

    const selo = scene.add.graphics().setPosition(hw + CARTAO.letraDX, CARTAO.barraY)
    selo.fillStyle(C.slate, 1)
    selo.fillCircle(0, 0, CARTAO.letraR)
    container.add(selo)
    container.add(scene.add.text(hw + CARTAO.letraDX, CARTAO.barraY - 1, letra, {
        fontFamily: FONT.black, fontSize: SIZE.letra, color: hex(C.papel),
    }).setOrigin(0.5).setResolution(2))

    /* ── a ilustração do tema ──────────────────────────────────────── */
    if (hasTex(scene, tema)) {
        const img = scene.add.image(0, CARTAO.temaY, tema)
        fitImage(img, w - CARTAO.temaPad * 2, CARTAO.temaH)
        container.add(img)
    } else {
        // a arte ainda não está na pasta: um bloco neutro segura o lugar dela
        const vazio = scene.add.graphics().setPosition(0, CARTAO.temaY)
        paintTemaVazio(vazio, w)
        container.add(vazio)
    }

    /* ── as três linhas de critério ────────────────────────────────── */
    const textos = new Map<Criterio, Phaser.GameObjects.Text>()

    CRITERIOS.filter(c => c !== 'endereco').forEach(c => {
        const y = yDe(c)
        const icone = scene.add.graphics().setPosition(-hw + CARTAO.iconeDX, y)
        paintCriterioIcone(icone, c, CARTAO.iconeR, C.slate)
        container.add(icone)

        const t = scene.add.text(-hw + CARTAO.textoDX, y, linhaDe(pagina, c).texto, {
            fontFamily: FONT.body, fontStyle: 'bold', fontSize: SIZE.linha,
            color: hex(C.slate),
            wordWrap: { width: w - CARTAO.textoDX - CARTAO.textoPadDir },
        }).setOrigin(0, 0.5).setResolution(2)
        container.add(t)
        textos.set(c, t)
    })

    /* ── a resposta que a página dá ────────────────────────────────── */
    const caixa = scene.add.graphics().setPosition(0, CARTAO.respostaY)
    paintRespostaBox(caixa, w)
    container.add(caixa)

    container.add(scene.add.text(0, CARTAO.respostaY + 6, pagina.resposta, {
        fontFamily: FONT.black,
        fontSize: pagina.resposta.length > RESPOSTA_LONGA ? SIZE.respostaLonga : SIZE.resposta,
        color: hex(C.tinta), align: 'center',
        wordWrap: { width: w - CARTAO.respostaPad * 2 - 28 },
    }).setOrigin(0.5).setResolution(2))

    /* ── o carimbo, escondido até a revelação ──────────────────────── */
    const carimbo = scene.add.container(0, CARIMBO.y).setVisible(false)
    const gc = scene.add.graphics()
    paintCarimbo(gc, w, { confiavel: pagina.confiavel })
    carimbo.add(gc)
    carimbo.add(scene.add.text(0, CARIMBO.palavraY - CARIMBO.y, pagina.confiavel ? 'CONFIÁVEL' : 'DESCONFIE', {
        fontFamily: FONT.black, fontSize: SIZE.carimbo,
        color: hex(pagina.confiavel ? C.ok : C.alerta),
    }).setOrigin(0.5).setResolution(2))
    carimbo.add(scene.add.text(0, CARIMBO.veredictoY - CARIMBO.y, pagina.veredito, {
        fontFamily: FONT.body, fontStyle: 'bold', fontSize: SIZE.veredito,
        color: hex(C.tinta), align: 'center',
        wordWrap: { width: w - CARIMBO.pad * 2 - 24 },
    }).setOrigin(0.5, 0).setResolution(2))
    container.add(carimbo)

    /* ── as zonas de toque das linhas ──────────────────────────────── */
    let enabled = true
    const zones: Phaser.GameObjects.Zone[] = []

    const alternar = (c: Criterio): boolean => {
        const m = marcas.get(c)
        if (!m) return false
        m.on = !m.on
        FX.kill(scene, m.g)
        void FX.to(scene, m.g, { scaleX: m.on ? 1 : 0 },
            { duration: m.on ? 260 : 160, ease: m.on ? Ease.smooth : 'Sine.easeIn' })
        return m.on
    }

    CRITERIOS.forEach(c => {
        const y = CARTAO.cy + yDe(c)
        const hit = scene.add
            .zone(cx, y, w - CARTAO.marcaPad, CARTAO.linhaH + CARTAO.hitPad)
            .setOrigin(0.5).setDepth(60)
        hit.setInteractive({ useHandCursor: true })

        const t = textos.get(c)
        hit.on('pointerover', () => {
            if (enabled && t) FX.to(scene, t, { x: -hw + CARTAO.textoDX + 4 }, { duration: 110 })
        })
        hit.on('pointerout', () => {
            if (enabled && t) FX.to(scene, t, { x: -hw + CARTAO.textoDX }, { duration: 110 })
        })
        hit.on('pointerup', () => {
            if (!enabled) return
            onMarcar(c, alternar(c))
        })
        zones.push(hit)
    })

    if (entrando) {
        /*
         * A zona de toque já nasce no lugar final, e o cartão ainda está lá
         * embaixo. Sem desligar durante o trajeto, um toque apressado grifaria
         * uma linha que ninguém está vendo.
         */
        enabled = false
        container.setPosition(cx, CARTAO.cy + H)
        void FX.to(scene, container, { y: CARTAO.cy },
            { duration: 480, ease: Ease.back(1.1) })
            .then(() => { enabled = true })
    } else {
        void FX.popIn(scene, container, { from: 0.96, duration: 280 })
    }

    return {
        container,
        alternar,
        marcadas: () => CRITERIOS.filter(c => marcas.get(c)?.on),

        escolher: async () => {
            container.setDepth(30)
            await FX.to(scene, container, { scale: 1.04 }, { duration: 220, ease: Ease.back(1.6) })
        },

        recuar: () => FX.to(scene, container, { scale: 0.95, alpha: 0.5 }, { duration: 260 }),

        revelar: async () => {
            carimbo.setVisible(true).setScale(3).setAlpha(0).setAngle(CARIMBO.angulo * 3)
            await FX.to(scene, carimbo, { scale: 1, alpha: 1, angle: CARIMBO.angulo },
                { duration: 280, ease: 'Back.easeIn' })
            void FX.impact(scene, container, 0.05)
        },

        acender: async (c, grifada) => {
            const m = marcas.get(c)
            if (!m) return
            m.tom = C.marca
            m.alpha = 0.85
            pintarMarca(c)
            if (!grifada) {
                // a criança não tinha visto: a pista aparece sozinha
                FX.kill(scene, m.g)
                m.g.setScale(0, 1)
                await FX.to(scene, m.g, { scaleX: 1 }, { duration: 320, ease: Ease.smooth })
            }
            m.on = true
            const t = textos.get(c)
            if (t) void FX.impact(scene, t, 0.14)
            await FX.ping(scene, cx, CARTAO.cy + m.y, C.marca, { radius: 90, duration: 460 })
        },

        setEnabled: on => {
            enabled = on
            zones.forEach(z => { if (z.input) z.input.cursor = on ? 'pointer' : 'default' })
        },

        sair: dx => FX.to(scene, container,
            { x: cx + dx, alpha: 0 },
            { duration: 420, ease: Ease.anticipate(0.4) }),

        destroy: () => { zones.forEach(z => z.destroy()); container.destroy() },
    }
}

/* ═══════════════════════════════════════════════════ o painel do porquê */

export interface Explicacao {
    container: Phaser.GameObjects.Container
    destroy(): void
}

export function createExplicacao(
    scene: Phaser.Scene,
    { texto, tone, label, onClick }: {
        texto: string
        tone: number
        label: string
        onClick: () => void
    },
): Explicacao {
    const container = scene.add.container(0, EXPLICACAO.hiddenY - EXPLICACAO.y).setDepth(46)

    const g = scene.add.graphics()
    g.fillStyle(C.shadow, 0.4)
    g.fillRoundedRect(EXPLICACAO.x + 5, EXPLICACAO.y + 8, EXPLICACAO.w, EXPLICACAO.h, EXPLICACAO.r)
    g.fillStyle(C.painel, 0.98)
    g.fillRoundedRect(EXPLICACAO.x, EXPLICACAO.y, EXPLICACAO.w, EXPLICACAO.h, EXPLICACAO.r)
    g.fillStyle(tone, 0.16)
    g.fillRoundedRect(EXPLICACAO.x, EXPLICACAO.y, 10, EXPLICACAO.h, 5)
    g.lineStyle(4, tone, 1)
    g.strokeRoundedRect(EXPLICACAO.x, EXPLICACAO.y, EXPLICACAO.w, EXPLICACAO.h, EXPLICACAO.r)
    container.add(g)

    container.add(scene.add.text(EXPLICACAO.textoX, EXPLICACAO.textoY, texto, {
        fontFamily: FONT.body, fontStyle: 'bold', fontSize: SIZE.explicacao,
        color: hex(C.paper), wordWrap: { width: EXPLICACAO.textoWrap },
    }).setOrigin(0, 0.5).setResolution(2))

    /*
     * ── O BOTÃO NASCE NO LUGAR DEFINITIVO, E NÃO SOBE COM O PAINEL ───────
     *
     * Ele subia junto, e não dava para clicar nele NUNCA. A zona de toque de
     * `createBigButton` é um objeto de cena criado na posição passada e que não
     * acompanha tween nenhum: o botão nascia em 805 (fora da tela de 720),
     * a animação levava o DESENHO para 631, e a zona ficava para trás, lá
     * embaixo, onde nenhum dedo alcança.
     *
     * Agora ele é criado direto em 631 — zona no lugar certo desde o primeiro
     * quadro — e a entrada é um `popIn`, que só mexe em escala e alpha. Nada
     * que se mova pode carregar a zona junto; então nada se move.
     */
    const botao = createBigButton(scene, {
        x: EXPLICACAO.botaoCX, y: EXPLICACAO.botaoCY,
        w: EXPLICACAO.botaoW, h: EXPLICACAO.botaoH,
        label, tone, onClick, depth: 47,
    })

    void FX.to(scene, container, { y: 0 }, { duration: 360, ease: Ease.back(1.2) })
    void FX.popIn(scene, botao.container, { from: 0.7, delay: 200, duration: 320 })

    return {
        container,
        destroy: () => { botao.destroy(); container.destroy() },
    }
}

/* ═════════════════════════════════════════════════════════════ toast */

export function showToast(
    scene: Phaser.Scene,
    message: string,
    tone: number,
    life = 2600,
) {
    const container = scene.add.container(TOAST.cx, TOAST.hiddenY).setDepth(400)

    const g = scene.add.graphics()
    g.fillStyle(C.shadow, 0.34)
    g.fillRoundedRect(-TOAST.w / 2 + 4, -TOAST.h / 2 + 8, TOAST.w, TOAST.h, TOAST.r)
    g.fillStyle(tone, 0.97)
    g.fillRoundedRect(-TOAST.w / 2, -TOAST.h / 2, TOAST.w, TOAST.h, TOAST.r)
    g.fillStyle(C.white, 0.2)
    g.fillRoundedRect(-TOAST.w / 2 + 12, -TOAST.h / 2 + 8, TOAST.w - 24, 14, 7)
    g.lineStyle(4, C.white, 0.88)
    g.strokeRoundedRect(-TOAST.w / 2, -TOAST.h / 2, TOAST.w, TOAST.h, TOAST.r)

    const text = scene.add.text(0, 0, message, {
        fontFamily: FONT.black, fontSize: SIZE.explicacao, color: hex(inkOn(tone)),
        align: 'center', wordWrap: { width: TOAST.w - 56 },
    }).setOrigin(0.5).setResolution(2)

    container.add([g, text])

    FX.seq(
        () => FX.to(scene, container, { y: TOAST.y }, { duration: 300, ease: Ease.back(1.6) }),
        () => FX.wait(scene, life),
        () => FX.to(scene, container, { y: TOAST.hiddenY, alpha: 0 }, { duration: 260 }),
    ).then(() => container.destroy())

    return container
}

export { W, H, ESCOLHER }
