import Phaser from 'phaser'
import { FX, Ease } from '../../../../shared/effects/FX'
import { C, A, FONT, SIZE, TYPE_MS, hex, inkOn } from '../data/theme'
import {
    W, H, HUD, PASSOS, PALCO, PEDIDO, OPCOES, LEMBRETE, OBRA, CARIMBOS,
    CARDS, TOAST,
} from '../data/layout'
import { MIDIAS, SIGLA, LEGENDA_FOTO } from '../data/formatos'
import type { Formato, Opcao, Slot } from '../types'

/*
 * Painters puros e construtores. A GameScene não desenha nada: se ela precisar
 * de um `fillRoundedRect`, falta um painter aqui.
 *
 * Neste jogo as texturas são o CENÁRIO e as cinco fotos do acervo — que são
 * conteúdo, não interface. Trilha, carta, moldura e carimbo têm estado e saem
 * todos de `Graphics`.
 */

/* ═══════════════════════════════════════════════════════════ texturas */

export const TEX = { fundo: 'bg-estudio' } as const

export const hasTex = (scene: Phaser.Scene, key: string) => scene.textures.exists(key)

/** Encaixa a imagem numa caixa, pela menor razão — nunca estica. */
export function fitImage(img: Phaser.GameObjects.Image, maxW: number, maxH: number) {
    // medido na TEXTURA: os tipos do Phaser deste projeto não expõem `width`
    // em `Image`, e o `tsc` do build reprova
    const src = img.texture.getSourceImage() as { width: number; height: number }
    img.setScale(Math.min(maxW / src.width, maxH / src.height))
}

export const ACCENT: Record<Formato, number> = {
    texto: C.texto,
    apresentacao: C.apresentacao,
    video: C.video,
}

/* ═══════════════════════════════════════════════════════════ cenário */

/** Parede de estúdio em Graphics, quando a textura não estiver na pasta. */
export function paintWall(g: Phaser.GameObjects.Graphics) {
    g.clear()
    g.fillStyle(C.ink, 1)
    g.fillRect(0, 0, W, H)

    // painéis acústicos: posição fixa, senão a parede muda de desenho a cada
    // repintura e a criança acha que alguma coisa aconteceu
    g.fillStyle(C.wall, 0.55)
    for (let row = 0; row < 5; row += 1) {
        for (let col = 0; col < 11; col += 1) {
            const off = row % 2 === 0 ? 0 : 58
            g.fillRoundedRect(-40 + off + col * 118, 20 + row * 148, 100, 128, 10)
        }
    }
    g.fillStyle(C.wallDark, 0.5)
    g.fillRect(0, 96, W, 8)
}

export function createRoom(scene: Phaser.Scene): void {
    if (!hasTex(scene, TEX.fundo)) {
        const g = scene.add.graphics().setDepth(-20)
        paintWall(g)
        return
    }

    const bg = scene.add.image(W / 2, H / 2, TEX.fundo).setDepth(-20)
    const src = bg.texture.getSourceImage() as { width: number; height: number }
    bg.setScale(Math.max(W / src.width, H / src.height))

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
 * cairia fora, comendo o clique. Vale para toda carta e botão daqui.
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
        fontFamily: FONT.black, fontSize: SIZE.help, color: hex(C.white),
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
    { x, y, w, h, label, tone, onClick, breathe = true }: {
        x: number; y: number; w: number; h: number
        label: string; tone: number; onClick: () => void
        breathe?: boolean
    },
): BigButton {
    const container = scene.add.container(x, y).setDepth(50)
    const bg = scene.add.graphics()
    const text = scene.add.text(0, -3, label, {
        fontFamily: FONT.black, fontSize: SIZE.button, color: hex(C.white),
    }).setOrigin(0.5).setResolution(2)

    let enabled = true
    let pressed = false
    const drop = 7
    const deep = Phaser.Display.Color.ValueToColor(tone).darken(30).color

    const paint = () => {
        const dy = pressed ? drop : 0
        bg.clear()
        bg.fillStyle(C.shadow, 0.3)
        bg.fillRoundedRect(-w / 2 + 4, -h / 2 + drop + 6, w, h, h / 2)
        bg.fillStyle(enabled ? deep : 0x3a4557, 1)
        bg.fillRoundedRect(-w / 2, -h / 2, w, h + drop, h / 2)
        bg.fillStyle(enabled ? tone : 0x57647a, 1)
        bg.fillRoundedRect(-w / 2, -h / 2 + dy, w, h, h / 2)
        bg.fillStyle(C.white, enabled ? 0.28 : 0.1)
        bg.fillRoundedRect(-w / 2 + 14, -h / 2 + dy + 10, w - 28, h * 0.26, h / 4)
        bg.lineStyle(4, C.white, enabled ? 0.9 : 0.28)
        bg.strokeRoundedRect(-w / 2, -h / 2 + dy, w, h, h / 2)
        text.setY(-3 + dy)
    }

    container.add([bg, text])
    paint()

    const hit = scene.add.zone(x, y, w + 26, h + 24).setOrigin(0.5).setDepth(51)
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
            // de sincronia uma vez para o botão ficar morto até o fim do passo.
            enabled = on
            pressed = false
            paint()
            if (hit.input) hit.input.cursor = on ? 'pointer' : 'default'
        },
        destroy: () => { pulse?.remove(); hit.destroy(); container.destroy() },
    }
}

/* ═══════════════════════════════════════════════════════════════ HUD */

export function paintHudBar(g: Phaser.GameObjects.Graphics) {
    g.clear()
    g.fillStyle(C.shadow, 0.32)
    g.fillRoundedRect(HUD.x + 4, HUD.y + 7, HUD.w, HUD.h, HUD.r)
    g.fillStyle(C.ink, 0.95)
    g.fillRoundedRect(HUD.x, HUD.y, HUD.w, HUD.h, HUD.r)
    g.fillStyle(C.white, 0.06)
    g.fillRoundedRect(HUD.x + 16, HUD.y + 10, HUD.w - 32, 18, 9)
    g.lineStyle(3, C.edge, 0.9)
    g.strokeRoundedRect(HUD.x, HUD.y, HUD.w, HUD.h, HUD.r)
}

export interface Hud {
    container: Phaser.GameObjects.Container
    setLevel(level: number): void
    setTitle(text: string): void
    setHint(text: string): void
    setMidia(formato: Formato | null): void
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

    const title = scene.add.text(HUD.titleX, HUD.titleY, '', {
        fontFamily: FONT.black, fontSize: SIZE.hudTitle, color: hex(C.paper),
        align: 'center', wordWrap: { width: HUD.titleW },
    }).setOrigin(0.5).setResolution(2)
    container.add(title)

    const hint = scene.add.text(HUD.titleX, HUD.hintY, '', {
        fontFamily: FONT.body, fontStyle: 'bold', fontSize: SIZE.hudHint,
        color: hex(C.idle), align: 'center', wordWrap: { width: HUD.hintW },
    }).setOrigin(0.5).setResolution(2)
    container.add(hint)

    const tabsG = scene.add.graphics()
    container.add(tabsG)

    const tabX = (i: number) => {
        const n = MIDIAS.length
        const total = n * HUD.tabW + (n - 1) * HUD.tabGap
        return HUD.tabsCX - total / 2 + HUD.tabW / 2 + i * (HUD.tabW + HUD.tabGap)
    }

    const tabTexts = MIDIAS.map((m, i) =>
        scene.add.text(tabX(i), HUD.cy, SIGLA[m.key], {
            fontFamily: FONT.black, fontSize: SIZE.hudTab, color: hex(C.idle),
        }).setOrigin(0.5).setResolution(2))
    container.add(tabTexts)

    const help = createRoundButton(scene, HUD.helpX, HUD.cy, HUD.helpR, '?', onHelp, C.edge)
    container.add(help.container)

    FX.slideIn(scene, container, { dy: 26, duration: 340 })

    return {
        container,
        setLevel: level => levelLabel.setText(`NÍVEL ${level}`),
        setTitle: text => title.setText(text),
        setHint: text => hint.setText(text),

        setMidia: formato => {
            tabsG.clear()
            MIDIAS.forEach((m, i) => {
                const on = m.key === formato
                const x = tabX(i)
                tabsG.fillStyle(on ? ACCENT[m.key] : C.white, on ? 1 : 0.07)
                tabsG.fillRoundedRect(x - HUD.tabW / 2, HUD.cy - HUD.tabH / 2, HUD.tabW, HUD.tabH, HUD.tabR)
                if (on) {
                    tabsG.fillStyle(C.white, 0.24)
                    tabsG.fillRoundedRect(x - HUD.tabW / 2 + 7, HUD.cy - HUD.tabH / 2 + 5, HUD.tabW - 14, 9, 4)
                }
                tabTexts[i].setColor(hex(on ? inkOn(ACCENT[m.key]) : C.idle))
            })
        },

        setHelpEnabled: help.setEnabled,
        destroy: () => { help.destroy(); container.destroy() },
    }
}

/* ═══════════════════════════════════════════════════ trilha de passos */

/**
 * A trilha.
 *
 * Ela responde as duas perguntas que uma criança faz num trabalho longo:
 * "onde eu estou" e "quanto falta". Sem ela, a sequência de telas viraria uma
 * enxurrada de perguntas sem fim à vista.
 *
 * O passo feito fica verde com um visto; o de agora é maior e na cor da mídia;
 * o que ainda vem fica apagado. E quando os jurados mandam rever, a trilha
 * ANDA PARA TRÁS — a criança vê para onde está voltando.
 */
export interface Trilha {
    container: Phaser.GameObjects.Container
    setTotal(n: number): void
    setAtual(atual: number, feitos?: number): void
    setTom(tone: number): void
    destroy(): void
}

export function createTrilha(scene: Phaser.Scene): Trilha {
    const container = scene.add.container(0, 0).setDepth(35)

    const g = scene.add.graphics()
    container.add(g)

    const nums = scene.add.container(0, 0)
    container.add(nums)

    let total = 3
    let atual = 0
    let feitos = 0
    // anotado como `number`: `C` é `as const`, e sem a anotação o tipo
    // estreitaria no literal do âmbar e recusaria a cor das outras mídias
    let tom: number = C.texto

    const px = (i: number) => {
        if (total <= 1) return W / 2
        const gap = Math.min(PASSOS.gap, PASSOS.maxW / (total - 1))
        return W / 2 - (gap * (total - 1)) / 2 + i * gap
    }

    const paint = () => {
        g.clear()
        nums.removeAll(true)

        // o trilho, primeiro: ele passa por trás das bolinhas
        for (let i = 0; i < total - 1; i += 1) {
            const feito = i < feitos
            g.fillStyle(feito ? C.ok : C.white, feito ? 1 : 0.12)
            g.fillRoundedRect(px(i), PASSOS.cy - PASSOS.lineH / 2,
                px(i + 1) - px(i), PASSOS.lineH, PASSOS.lineH / 2)
        }

        for (let i = 0; i < total; i += 1) {
            const x = px(i)
            const agora = i === atual
            const feito = !agora && i < feitos
            const r = agora ? PASSOS.rNow : PASSOS.r

            g.fillStyle(C.shadow, 0.3)
            g.fillCircle(x, PASSOS.cy + 3, r)
            g.fillStyle(feito ? C.ok : agora ? tom : C.wall, 1)
            g.fillCircle(x, PASSOS.cy, r)
            g.lineStyle(3, feito ? C.okSoft : agora ? C.white : C.edge, agora ? 1 : 0.8)
            g.strokeCircle(x, PASSOS.cy, r)

            if (feito) {
                g.lineStyle(4, C.white, 1)
                g.beginPath()
                g.moveTo(x - 6, PASSOS.cy)
                g.lineTo(x - 1, PASSOS.cy + 5)
                g.lineTo(x + 7, PASSOS.cy - 6)
                g.strokePath()
            } else {
                nums.add(scene.add.text(x, PASSOS.cy, `${i + 1}`, {
                    fontFamily: FONT.black, fontSize: SIZE.passoNum,
                    color: hex(agora ? inkOn(tom) : C.idle),
                }).setOrigin(0.5).setResolution(2))
            }
        }
    }

    paint()

    return {
        container,
        setTotal: n => { total = Math.max(1, n); paint() },
        setTom: t => { tom = t; paint() },
        setAtual: (a, f) => {
            atual = a
            // na revisão a criança volta para um passo com tudo o mais pronto:
            // `feitos` continua adiante, e só a bolinha de agora recua
            feitos = f ?? a
            paint()
            // um pulinho na bolinha de agora: é o que faz a trilha "andar"
            FX.kill(scene, container)
            container.setScale(1)
            FX.to(scene, container, { scale: 1.02 },
                { duration: 160, yoyo: true, ease: Ease.smooth })
        },
        destroy: () => container.destroy(),
    }
}

/* ═══════════════════════════════════════════════════ título do passo */

export interface Titulo {
    show(text: string, tone: number): void
    destroy(): void
}

export function createTitulo(scene: Phaser.Scene): Titulo {
    const label = scene.add.text(W / 2, PALCO.tituloY, '', {
        fontFamily: FONT.black, fontSize: SIZE.passoTitulo, color: hex(C.paper),
        align: 'center', wordWrap: { width: PALCO.tituloWrap },
        stroke: hex(C.ink), strokeThickness: 5,
    }).setOrigin(0.5).setResolution(2).setDepth(36)

    return {
        show: (text, tone) => {
            label.setText(text).setColor(hex(tone))
            FX.kill(scene, label)
            label.setAlpha(0).setScale(0.9)
            FX.to(scene, label, { alpha: 1, scale: 1 },
                { duration: 260, ease: Ease.back(2) })
        },
        destroy: () => label.destroy(),
    }
}

/* ═══════════════════════════════════════════════════════ o pedido */

export interface CartaoPedido {
    container: Phaser.GameObjects.Container
    show(texto: string, quem: string): Promise<void>
    destroy(): void
}

export function createCartaoPedido(scene: Phaser.Scene): CartaoPedido {
    const container = scene.add.container(0, 0).setDepth(40)

    const g = scene.add.graphics()
    g.fillStyle(C.shadow, 0.34)
    g.fillRoundedRect(PEDIDO.cx - PEDIDO.w / 2 + 5, PEDIDO.cy - PEDIDO.h / 2 + 9,
        PEDIDO.w, PEDIDO.h, PEDIDO.r)
    g.fillStyle(C.panel, 0.97)
    g.fillRoundedRect(PEDIDO.cx - PEDIDO.w / 2, PEDIDO.cy - PEDIDO.h / 2,
        PEDIDO.w, PEDIDO.h, PEDIDO.r)
    g.fillStyle(C.white, A.gloss)
    g.fillRoundedRect(PEDIDO.cx - PEDIDO.w / 2 + 16, PEDIDO.cy - PEDIDO.h / 2 + 12,
        PEDIDO.w - 32, 14, 7)
    g.lineStyle(3, C.edge, 0.95)
    g.strokeRoundedRect(PEDIDO.cx - PEDIDO.w / 2, PEDIDO.cy - PEDIDO.h / 2,
        PEDIDO.w, PEDIDO.h, PEDIDO.r)
    g.fillStyle(C.edge, 0.7)
    g.fillRect(PEDIDO.cx - PEDIDO.w / 2 + 40, PEDIDO.dividerY, PEDIDO.w - 80, 2)
    container.add(g)

    const texto = scene.add.text(PEDIDO.cx, PEDIDO.textoY, '', {
        fontFamily: FONT.body, fontStyle: 'bold', fontSize: SIZE.briefText,
        color: hex(C.paper), align: 'center', wordWrap: { width: PEDIDO.textoWrap },
    }).setOrigin(0.5, 0).setResolution(2)
    container.add(texto)

    container.add(scene.add.text(PEDIDO.cx, PEDIDO.quemLabelY, 'PRA QUEM É', {
        fontFamily: FONT.black, fontSize: SIZE.briefLabel, color: hex(C.idle),
    }).setOrigin(0.5).setResolution(2))

    const quem = scene.add.text(PEDIDO.cx, PEDIDO.quemY, '', {
        fontFamily: FONT.body, fontStyle: 'bold', fontSize: SIZE.briefPublico,
        color: hex(C.okSoft), align: 'center', wordWrap: { width: PEDIDO.quemWrap },
    }).setOrigin(0.5, 0).setResolution(2)
    container.add(quem)

    let typing: { skip: () => void } | null = null

    return {
        container,
        show: async (t, q) => {
            typing?.skip()
            quem.setText(q)
            // mede com o texto completo antes de escrever, senão o parágrafo
            // cresceria linha a linha e empurraria o resto do cartão
            texto.setText(t)
            texto.setText('')
            const tw = FX.type(scene, texto, t, { delay: TYPE_MS.briefing })
            typing = tw
            await tw
            typing = null
        },
        destroy: () => { typing?.skip(); container.destroy() },
    }
}

/* ══════════════════════════════════════ a barra do pedido, embaixo */

export interface Lembrete {
    container: Phaser.GameObjects.Container
    set(texto: string, quem: string): void
    setVisible(on: boolean): void
    destroy(): void
}

export function createLembrete(scene: Phaser.Scene): Lembrete {
    const container = scene.add.container(0, 0).setDepth(34)

    const g = scene.add.graphics()
    g.fillStyle(C.shadow, 0.3)
    g.fillRoundedRect(LEMBRETE.x + 4, LEMBRETE.y + 6, LEMBRETE.w, LEMBRETE.h, LEMBRETE.r)
    g.fillStyle(C.ink, 0.93)
    g.fillRoundedRect(LEMBRETE.x, LEMBRETE.y, LEMBRETE.w, LEMBRETE.h, LEMBRETE.r)
    g.lineStyle(3, C.edge, 0.85)
    g.strokeRoundedRect(LEMBRETE.x, LEMBRETE.y, LEMBRETE.w, LEMBRETE.h, LEMBRETE.r)
    container.add(g)

    const texto = scene.add.text(LEMBRETE.pedidoX, LEMBRETE.pedidoY, '', {
        fontFamily: FONT.body, fontStyle: 'bold', fontSize: SIZE.lembreteTexto,
        color: hex(C.paper), wordWrap: { width: LEMBRETE.pedidoWrap },
    }).setOrigin(0, 0.5).setResolution(2)
    container.add(texto)

    container.add(scene.add.text(LEMBRETE.quemX, LEMBRETE.y + 22, 'PRA QUEM É', {
        fontFamily: FONT.black, fontSize: SIZE.lembreteLabel, color: hex(C.idle),
    }).setOrigin(1, 0.5).setResolution(2))

    const quem = scene.add.text(LEMBRETE.quemX, LEMBRETE.quemY, '', {
        fontFamily: FONT.body, fontStyle: 'bold', fontSize: SIZE.lembreteTexto,
        color: hex(C.okSoft), align: 'right', wordWrap: { width: LEMBRETE.quemWrap },
    }).setOrigin(1, 0.5).setResolution(2)
    container.add(quem)

    return {
        container,
        set: (t, q) => { texto.setText(t); quem.setText(q) },
        setVisible: on => container.setVisible(on),
        destroy: () => container.destroy(),
    }
}

/* ═══════════════════════════════════════════ as opções de um passo */

export function paintOpcao(
    g: Phaser.GameObjects.Graphics,
    { tone, foto, atual }: { tone: number; foto: boolean; atual: boolean },
) {
    const hw = OPCOES.w / 2
    const hh = OPCOES.h / 2

    g.clear()
    g.fillStyle(C.shadow, 0.34)
    g.fillRoundedRect(-hw + 4, -hh + 8, OPCOES.w, OPCOES.h, OPCOES.r)
    g.fillStyle(foto ? C.slate : C.panel, 1)
    g.fillRoundedRect(-hw, -hh, OPCOES.w, OPCOES.h, OPCOES.r)
    g.fillStyle(tone, 1)
    g.fillRoundedRect(-hw, -hh, OPCOES.w, 10, OPCOES.r)
    g.fillStyle(C.white, A.gloss)
    g.fillRoundedRect(-hw + 14, -hh + 16, OPCOES.w - 28, 12, 6)
    g.lineStyle(atual ? 6 : 3, tone, atual ? 1 : 0.85)
    g.strokeRoundedRect(-hw, -hh, OPCOES.w, OPCOES.h, OPCOES.r)

    // a que já está na obra: um visto no canto, para a revisão saber de onde parte
    if (!atual) return
    g.fillStyle(tone, 1)
    g.fillCircle(hw - 26, -hh + 30, 15)
    g.lineStyle(4, inkOn(tone), 1)
    g.beginPath()
    g.moveTo(hw - 32, -hh + 30)
    g.lineTo(hw - 28, -hh + 35)
    g.lineTo(hw - 20, -hh + 24)
    g.strokePath()
}

export interface Opcoes {
    container: Phaser.GameObjects.Container
    setEnabled(on: boolean): void
    destroy(): void
}

export function createOpcoes(
    scene: Phaser.Scene,
    { slot, tone, escolhida, onPick }: {
        slot: Slot
        tone: number
        escolhida: number
        onPick: (i: number, opcao: Opcao) => void
    },
): Opcoes {
    const container = scene.add.container(0, 0).setDepth(42)

    const n = slot.opcoes.length
    const total = n * OPCOES.w + (n - 1) * OPCOES.gap
    const startX = W / 2 - total / 2 + OPCOES.w / 2

    /*
     * As zonas de toque são objetos de CENA, fora do container que anima — e é
     * por isso que precisam ser guardadas e destruídas na mão. Sem esta lista,
     * as zonas do passo anterior continuariam comendo os toques do seguinte,
     * invisíveis por cima das cartas novas.
     */
    const zones: Phaser.GameObjects.Zone[] = []
    let enabled = true

    slot.opcoes.forEach((opcao, i) => {
        const x = startX + i * (OPCOES.w + OPCOES.gap)
        const node = scene.add.container(x, OPCOES.cy)

        const g = scene.add.graphics()
        paintOpcao(g, { tone, foto: slot.tipo === 'imagem', atual: i === escolhida })
        node.add(g)

        if (slot.tipo === 'imagem') {
            if (hasTex(scene, opcao.valor)) {
                const img = scene.add.image(0, OPCOES.fotoCY, opcao.valor)
                fitImage(img, OPCOES.fotoW, OPCOES.fotoH)
                node.add(img)
            } else {
                // a arte ainda não está na pasta: o quadro continua tocável
                const ph = scene.add.graphics().setPosition(0, OPCOES.fotoCY)
                ph.fillStyle(C.panel, 1)
                ph.fillRoundedRect(-OPCOES.fotoW / 2, -OPCOES.fotoH / 2,
                    OPCOES.fotoW, OPCOES.fotoH, 10)
                ph.lineStyle(2, C.edge, 1)
                ph.strokeRoundedRect(-OPCOES.fotoW / 2, -OPCOES.fotoH / 2,
                    OPCOES.fotoW, OPCOES.fotoH, 10)
                node.add(ph)
            }
            node.add(scene.add.text(0, OPCOES.fotoLabelY,
                LEGENDA_FOTO[opcao.valor] ?? opcao.valor, {
                fontFamily: FONT.black, fontSize: SIZE.opcaoFoto, color: hex(C.paper),
                align: 'center', wordWrap: { width: OPCOES.fotoLabelWrap },
            }).setOrigin(0.5).setResolution(2))
        } else {
            node.add(scene.add.text(0, 6, opcao.valor, {
                fontFamily: FONT.body, fontStyle: 'bold', fontSize: SIZE.opcaoTexto,
                color: hex(C.paper), align: 'center',
                wordWrap: { width: OPCOES.textoWrap },
            }).setOrigin(0.5).setResolution(2))
        }

        container.add(node)

        node.setScale(0.9).setAlpha(0)
        FX.to(scene, node, { scale: 1, alpha: 1 },
            { duration: 280, delay: i * 90, ease: Ease.back(2) })

        const hit = scene.add
            .zone(x, OPCOES.cy, OPCOES.w + OPCOES.hitPad, OPCOES.h + OPCOES.hitPad)
            .setOrigin(0.5).setDepth(62)
        hit.setInteractive({ useHandCursor: true })
        hit.on('pointerover', () => { if (enabled) FX.to(scene, node, { scale: 1.05 }, { duration: 120 }) })
        hit.on('pointerout', () => { if (enabled) FX.to(scene, node, { scale: 1 }, { duration: 120 }) })
        hit.on('pointerup', () => {
            if (!enabled) return
            FX.press(scene, node)
            onPick(i, opcao)
        })
        zones.push(hit)
    })

    return {
        container,
        setEnabled: on => {
            enabled = on
            zones.forEach(z => { if (z.input) z.input.cursor = on ? 'pointer' : 'default' })
        },
        destroy: () => { zones.forEach(z => z.destroy()); container.destroy() },
    }
}

/* ═══════════════════════════════════════════════════ a obra montada */

/** A moldura, com a cara da mídia. */
export function paintMoldura(g: Phaser.GameObjects.Graphics, formato: Formato) {
    const hw = OBRA.w / 2
    const hh = OBRA.h / 2
    const tone = ACCENT[formato]

    g.clear()
    g.fillStyle(C.shadow, 0.4)
    g.fillRoundedRect(-hw + 6, -hh + 10, OBRA.w, OBRA.h, OBRA.r)

    if (formato === 'texto') {
        g.fillStyle(C.paper, 1)
        g.fillRoundedRect(-hw, -hh, OBRA.w, OBRA.h, OBRA.r)
        g.fillStyle(C.paperEdge, 0.5)
        g.fillRoundedRect(-hw + 12, -hh + 12, OBRA.w - 24, 8, 4)
    } else {
        g.fillStyle(C.slate, 1)
        g.fillRoundedRect(-hw, -hh, OBRA.w, OBRA.h, OBRA.r)
        g.fillStyle(C.screen, 1)
        g.fillRoundedRect(-hw + 14, -hh + 14, OBRA.w - 28, OBRA.h - 28, OBRA.r - 6)
    }

    if (formato === 'video') {
        // as perfurações do filme: é o que faz a moldura ser um QUADRO de vídeo
        g.fillStyle(C.screen, 1)
        g.fillRoundedRect(-hw + 2, -hh + 14, 10, OBRA.h - 28, 5)
        g.fillRoundedRect(hw - 12, -hh + 14, 10, OBRA.h - 28, 5)
        g.fillStyle(C.paper, 0.6)
        for (let i = 0; i < 9; i += 1) {
            const y = -hh + 30 + i * ((OBRA.h - 60) / 8)
            g.fillRoundedRect(-hw + 3, y - 5, 8, 11, 3)
            g.fillRoundedRect(hw - 11, y - 5, 8, 11, 3)
        }
    }

    g.lineStyle(5, tone, 1)
    g.strokeRoundedRect(-hw, -hh, OBRA.w, OBRA.h, OBRA.r)
}

export interface ObraMontada {
    container: Phaser.GameObjects.Container
    /** As peças entram uma a uma, na ordem em que foram escolhidas. */
    montar(): Promise<void>
    /** O flash da publicação. */
    flash(): Promise<void>
    /** Sacode a obra quando um carimbo cai nela. */
    bater(): void
    destroy(): void
}

export function createObraMontada(
    scene: Phaser.Scene,
    { formato, slots, escolhas }: {
        formato: Formato
        slots: Slot[]
        escolhas: number[]
    },
): ObraMontada {
    const container = scene.add.container(OBRA.cx, OBRA.cy).setDepth(38)

    const moldura = scene.add.graphics()
    paintMoldura(moldura, formato)
    container.add(moldura)

    const clara = formato === 'texto'
    const innerW = OBRA.w - OBRA.pad * 2

    /*
     * As peças são criadas ANTES de serem posicionadas.
     *
     * Só depois de existir é que um `Text` sabe a própria altura, e só sabendo
     * a altura de todas dá para empilhar sem sobrar nem faltar espaço. Medir
     * primeiro, posicionar depois — o contrário deixaria a última peça
     * pendurada para fora da moldura em metade dos casos.
     */
    /**
     * `escala` é o tamanho de REPOUSO da peça, e não decoração.
     *
     * Para um texto ela é 1; para a foto é o que o `fitImage` calculou para
     * caber na caixa. A animação de entrada tem que voltar para ESSE valor —
     * animar toda peça para `scale: 1` desfazia o encaixe e devolvia a foto ao
     * tamanho original do arquivo, que então cobria o título e a frase.
     */
    type Peca = {
        obj: Phaser.GameObjects.Image | Phaser.GameObjects.Text
        h: number
        escala: number
    }
    /** Guarda o lugar da foto na fila enquanto ainda não se sabe o tamanho dela. */
    const fila: Array<Peca | { foto: string }> = []
    let primeiroTexto = true
    let alturaTextos = 0

    slots.forEach((slot, i) => {
        const escolha = escolhas[i]
        if (escolha < 0) return
        const opcao = slot.opcoes[escolha]
        if (!opcao) return

        if (slot.tipo === 'imagem' && hasTex(scene, opcao.valor)) {
            fila.push({ foto: opcao.valor })
            return
        }

        const titulo = slot.tipo === 'texto' && primeiroTexto
        if (slot.tipo === 'texto') primeiroTexto = false

        const t = scene.add.text(0, 0,
            slot.tipo === 'imagem' ? (LEGENDA_FOTO[opcao.valor] ?? opcao.valor) : opcao.valor, {
            fontFamily: titulo ? FONT.black : FONT.body,
            fontStyle: titulo ? undefined : 'bold',
            fontSize: titulo ? SIZE.pecaTitulo : SIZE.pecaTexto,
            color: hex(clara ? C.slate : C.paper),
            align: 'center', wordWrap: { width: innerW },
        }).setOrigin(0.5).setResolution(2)
        container.add(t)
        alturaTextos += t.height
        fila.push({ obj: t, h: t.height, escala: 1 })
    })

    /*
     * A FOTO FICA COM O QUE SOBRAR, e não com uma altura fixa.
     *
     * Era daqui que vinha a sobreposição: com a foto sempre em 196px, um
     * trabalho de quatro peças somava mais do que a moldura tinha por dentro, e
     * a pilha vazava — o título subia por cima da borda e a última frase caía
     * em cima da foto. Medindo os textos primeiro e dando o resto para a
     * imagem, é impossível a pilha não caber.
     */
    const innerH = OBRA.h - OBRA.pad * 2
    const vaos = Math.max(0, fila.length - 1) * OBRA.gap
    const sobra = innerH - alturaTextos - vaos
    const fotoAltura = Phaser.Math.Clamp(sobra, OBRA.fotoMin, OBRA.fotoH)

    const pecas: Peca[] = fila.map(item => {
        if (!('foto' in item)) return item
        const img = scene.add.image(0, 0, item.foto)
        fitImage(img, OBRA.fotoW, fotoAltura)
        container.add(img)
        return { obj: img, h: img.displayHeight, escala: img.scaleX }
    })

    // empilha centralizado na vertical
    const alturaTotal = pecas.reduce((s, p) => s + p.h, 0)
        + Math.max(0, pecas.length - 1) * OBRA.gap
    let y = -alturaTotal / 2

    pecas.forEach(p => {
        p.obj.y = y + p.h / 2
        y += p.h + OBRA.gap
        p.obj.setAlpha(0)
        p.obj.setScale(p.escala * 0.86)
    })

    const brilho = scene.add.graphics()
    brilho.fillStyle(C.white, 1)
    brilho.fillRoundedRect(-OBRA.w / 2, -OBRA.h / 2, OBRA.w, OBRA.h, OBRA.r)
    brilho.setAlpha(0)
    container.add(brilho)

    return {
        container,

        montar: () => new Promise<void>(resolve => {
            if (!pecas.length) { resolve(); return }
            pecas.forEach((p, i) => {
                FX.to(scene, p.obj, { alpha: 1, scale: p.escala },
                    { duration: 320, delay: 120 + i * 170, ease: Ease.back(2.2) })
            })
            scene.tweens.addCounter({
                from: 0, to: 1,
                duration: 120 + pecas.length * 170 + 320,
                onComplete: () => resolve(),
            })
        }),

        flash: async () => {
            FX.kill(scene, brilho)
            brilho.setAlpha(0.85)
            await FX.to(scene, brilho, { alpha: 0 }, { duration: 420, ease: Ease.smooth })
        },

        bater: () => {
            FX.kill(scene, container)
            container.setScale(1)
            FX.to(scene, container, { scale: 1.02 },
                { duration: 90, yoyo: true, ease: Ease.smooth })
        },

        destroy: () => container.destroy(),
    }
}

/* ═══════════════════════════════════════════════════════ os carimbos */

export function paintCarimbo(
    g: Phaser.GameObjects.Graphics,
    { verde }: { verde: boolean },
) {
    const hw = CARIMBOS.w / 2
    const hh = CARIMBOS.h / 2
    const tone = verde ? C.ok : C.warn

    g.clear()
    g.fillStyle(tone, 0.16)
    g.fillRoundedRect(-hw, -hh, CARIMBOS.w, CARIMBOS.h, CARIMBOS.r)
    g.lineStyle(5, tone, 1)
    g.strokeRoundedRect(-hw, -hh, CARIMBOS.w, CARIMBOS.h, CARIMBOS.r)
    g.lineStyle(2, tone, 0.6)
    g.strokeRoundedRect(-hw + 8, -hh + 8, CARIMBOS.w - 16, CARIMBOS.h - 16, CARIMBOS.r - 6)

    // o sinal: visto quando passou, seta de volta quando é para rever
    const mx = -hw + 40
    g.lineStyle(6, tone, 1)
    if (verde) {
        g.beginPath()
        g.moveTo(mx - 12, 0)
        g.lineTo(mx - 3, 10)
        g.lineTo(mx + 13, -11)
        g.strokePath()
    } else {
        g.beginPath()
        g.arc(mx, 1, 12, Math.PI * 0.35, Math.PI * 1.75, false)
        g.strokePath()
        g.fillStyle(tone, 1)
        g.fillTriangle(mx - 18, -6, mx - 4, -6, mx - 11, 7)
    }
}

export interface Carimbos {
    container: Phaser.GameObjects.Container
    /** Cada carimbo cai do alto e bate. Resolve quando o último assenta. */
    bater(
        selos: Array<{ nome: string; verde: boolean }>,
        onBatida: (i: number) => void,
    ): Promise<void>
    destroy(): void
}

export function createCarimbos(scene: Phaser.Scene): Carimbos {
    const container = scene.add.container(0, 0).setDepth(46)

    return {
        container,

        bater: (selos, onBatida) => new Promise<void>(resolve => {
            container.removeAll(true)

            selos.forEach((selo, i) => {
                const y = CARIMBOS.cyPrimeiro + i * CARIMBOS.passo
                const node = scene.add.container(CARIMBOS.cx, y)

                const g = scene.add.graphics()
                paintCarimbo(g, { verde: selo.verde })
                node.add(g)

                node.add(scene.add.text(26, 0, selo.nome, {
                    fontFamily: FONT.black, fontSize: SIZE.carimbo,
                    color: hex(selo.verde ? C.okSoft : C.warnSoft),
                }).setOrigin(0.5).setResolution(2))

                /*
                 * O carimbo cai grande e encolhe até o tamanho certo.
                 *
                 * É o gesto do carimbo de verdade: vem de cima, bate e para.
                 * Só a escala faz isso — sem ela, o selo apareceria do nada e a
                 * publicação perderia justamente a hora que a criança esperou.
                 */
                node.setScale(3).setAlpha(0).setAngle(i % 2 === 0 ? -5 : 4)
                container.add(node)

                scene.tweens.add({
                    targets: node, scale: 1, alpha: 1,
                    duration: 260, delay: 240 + i * 420, ease: 'Back.easeIn',
                    onComplete: () => onBatida(i),
                })
            })

            scene.tweens.addCounter({
                from: 0, to: 1,
                duration: 240 + selos.length * 420 + 320,
                onComplete: () => resolve(),
            })
        }),

        destroy: () => container.destroy(),
    }
}

export interface Veredito {
    show(text: string, tone: number): void
    setVisible(on: boolean): void
    destroy(): void
}

export function createVeredito(scene: Phaser.Scene): Veredito {
    const label = scene.add.text(W / 2, CARIMBOS.vereditoY, '', {
        fontFamily: FONT.black, fontSize: SIZE.veredito, color: hex(C.paper),
        align: 'center', wordWrap: { width: CARIMBOS.vereditoWrap },
        stroke: hex(C.ink), strokeThickness: 5,
    }).setOrigin(0.5).setResolution(2).setDepth(47).setVisible(false)

    return {
        show: (text, tone) => {
            label.setText(text).setColor(hex(tone)).setVisible(true)
            FX.kill(scene, label)
            label.setAlpha(0)
            FX.to(scene, label, { alpha: 1 }, { duration: 280 })
        },
        setVisible: on => label.setVisible(on),
        destroy: () => label.destroy(),
    }
}

/* ══════════════════════════════════════════════════ cartas de mídia */

/** A amostrinha da carta: a mídia mostrada, não descrita. */
export function paintMidiaSample(g: Phaser.GameObjects.Graphics, formato: Formato) {
    g.clear()
    const tone = ACCENT[formato]

    if (formato === 'texto') {
        g.fillStyle(C.paper, 1)
        g.fillRoundedRect(-42, -50, 84, 100, 8)
        g.fillStyle(tone, 1)
        g.fillRoundedRect(-32, -40, 64, 12, 4)
        g.fillStyle(C.slate, 0.35)
        for (let i = 0; i < 4; i += 1) g.fillRoundedRect(-32, -18 + i * 14, 64, 6, 3)
        return
    }

    if (formato === 'apresentacao') {
        for (let i = 0; i < 3; i += 1) {
            g.fillStyle(C.slate, 1)
            g.fillRoundedRect(-58 + i * 22, -34 + i * 6, 84, 62, 8)
            g.lineStyle(2, tone, i === 2 ? 1 : 0.45)
            g.strokeRoundedRect(-58 + i * 22, -34 + i * 6, 84, 62, 8)
        }
        return
    }

    g.fillStyle(C.slate, 1)
    g.fillRoundedRect(-56, -44, 112, 88, 8)
    g.fillStyle(C.screen, 1)
    g.fillRoundedRect(-40, -34, 80, 68, 6)
    g.fillStyle(tone, 1)
    g.fillTriangle(-10, -14, -10, 14, 16, 0)
    g.fillStyle(C.paper, 0.6)
    for (let i = 0; i < 4; i += 1) {
        g.fillRoundedRect(-52, -32 + i * 22, 8, 12, 2)
        g.fillRoundedRect(44, -32 + i * 22, 8, 12, 2)
    }
}

export interface Cards {
    container: Phaser.GameObjects.Container
    setEnabled(on: boolean): void
    reject(formato: Formato): Promise<void>
    destroy(): void
}

export function createCards(
    scene: Phaser.Scene,
    { onPick }: { onPick: (formato: Formato) => void },
): Cards {
    const container = scene.add.container(0, 0).setDepth(45)

    const n = MIDIAS.length
    const total = n * CARDS.w + (n - 1) * CARDS.gap
    const startX = CARDS.cx - total / 2 + CARDS.w / 2

    const zones: Phaser.GameObjects.Zone[] = []
    const nodes = new Map<Formato, Phaser.GameObjects.Container>()
    let enabled = true

    MIDIAS.forEach((m, i) => {
        const x = startX + i * (CARDS.w + CARDS.gap)
        const node = scene.add.container(x, CARDS.cy)
        const tone = ACCENT[m.key]

        const g = scene.add.graphics()
        g.fillStyle(C.shadow, 0.34)
        g.fillRoundedRect(-CARDS.w / 2 + 5, -CARDS.h / 2 + 9, CARDS.w, CARDS.h, CARDS.r)
        g.fillStyle(C.panel, 1)
        g.fillRoundedRect(-CARDS.w / 2, -CARDS.h / 2, CARDS.w, CARDS.h, CARDS.r)
        g.fillStyle(tone, 1)
        g.fillRoundedRect(-CARDS.w / 2, -CARDS.h / 2, CARDS.w, 12, CARDS.r)
        g.lineStyle(3, tone, 0.9)
        g.strokeRoundedRect(-CARDS.w / 2, -CARDS.h / 2, CARDS.w, CARDS.h, CARDS.r)
        node.add(g)

        node.add(scene.add.text(0, CARDS.nameDY, m.nome, {
            fontFamily: FONT.black, fontSize: SIZE.cardName, color: hex(tone),
            align: 'center', wordWrap: { width: CARDS.w - 30 },
        }).setOrigin(0.5).setResolution(2))

        node.add(scene.add.text(0, CARDS.resumoDY, m.resumo, {
            fontFamily: FONT.body, fontStyle: 'bold', fontSize: SIZE.cardResumo,
            color: hex(C.idle), align: 'center', wordWrap: { width: CARDS.w - 30 },
        }).setOrigin(0.5).setResolution(2))

        const sample = scene.add.graphics().setPosition(0, CARDS.sampleDY)
        paintMidiaSample(sample, m.key)
        node.add(sample)

        node.add(scene.add.text(0, CARDS.recursosDY, m.recursos, {
            fontFamily: FONT.body, fontStyle: 'bold', fontSize: SIZE.cardRecursos,
            color: hex(C.idle), align: 'center', wordWrap: { width: CARDS.w - 30 },
        }).setOrigin(0.5).setResolution(2))

        container.add(node)
        nodes.set(m.key, node)

        const hit = scene.add
            .zone(x, CARDS.cy, CARDS.w + 12, CARDS.h + 12)
            .setOrigin(0.5).setDepth(62)
        hit.setInteractive({ useHandCursor: true })
        hit.on('pointerover', () => { if (enabled) FX.to(scene, node, { scale: 1.05 }, { duration: 120 }) })
        hit.on('pointerout', () => { if (enabled) FX.to(scene, node, { scale: 1 }, { duration: 120 }) })
        hit.on('pointerup', () => { if (enabled) onPick(m.key) })
        zones.push(hit)
    })

    FX.popIn(scene, container, { from: 0.92, duration: 320 })

    return {
        container,
        setEnabled: on => {
            enabled = on
            zones.forEach(z => { if (z.input) z.input.cursor = on ? 'pointer' : 'default' })
        },
        reject: async formato => {
            const node = nodes.get(formato)
            if (!node) return
            await FX.shake(scene, node, { amount: 10, times: 3 })
        },
        destroy: () => { zones.forEach(z => z.destroy()); container.destroy() },
    }
}

/* ═════════════════════════════════════════════════════════════ toast */

export function showToast(
    scene: Phaser.Scene,
    message: string,
    tone: number,
    life = 2800,
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
        fontFamily: FONT.black, fontSize: SIZE.veredito, color: hex(inkOn(tone)),
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

export { W, H }
