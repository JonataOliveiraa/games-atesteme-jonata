import Phaser from 'phaser'
import { FX, Ease } from '../../../../shared/effects/FX'
import { createTimeBar, type TimeBar } from '../../../../shared/hud/createTimeBar'
import { C, A, BARRA, FONT, SIZE, LONGO, hex, inkOn } from '../data/theme'
import {
    W, H, HUD, ESTAB, PECAS, MEM, FILA, RODAPE, CHAPA, BANDEJA,
} from '../data/layout'
import { DISPOSITIVOS, PROGRAMAS } from '../data/maquina'
import type { DispositivoId, PedidoDef, ProgramaId } from '../types'

/*
 * Painters puros e construtores. A GameScene não desenha NADA: se ela precisar
 * de um `fillRoundedRect`, é sinal de que falta um painter aqui.
 *
 * Neste jogo a arte é ILUSTRAÇÃO, não conteúdo: o teclado desenhado diz qual
 * peça é aquela, mas quem diz se ela está livre é o aro, e o aro é `Graphics`.
 * Por isso todo estado é desenhado em código — estado que depende de textura é
 * estado que some quando o PNG não está na pasta.
 */

/* ═══════════════════════════════════════════════════════════ ajudantes */

export const hasTex = (scene: Phaser.Scene, key: string) => scene.textures.exists(key)

/**
 * Encaixa a imagem numa caixa, pela menor razão — nunca estica, nunca vaza.
 *
 * É a regra §12 da memória do projeto, e ela já custou duas correções em outros
 * jogos: a forma é desenhada por um raio e a imagem entra com o tamanho
 * natural dela, maior que a forma. Aqui NENHUMA imagem é adicionada sem passar
 * por esta função.
 */
export function fitImage(img: Phaser.GameObjects.Image, maxW: number, maxH: number) {
    const src = img.texture.getSourceImage() as { width: number; height: number }
    img.setScale(Math.min(maxW / src.width, maxH / src.height))
}

/**
 * Encolhe o texto até ele caber em `maxLinhas` linhas dentro de `w`.
 *
 * A largura de texto NUNCA é estimada por `length * k` neste projeto — foi
 * exatamente essa conta que fez a lista do Mapas em Rede quebrar linha em cima
 * do mapa. Quem mede é o Phaser, com a fonte de verdade.
 */
export function ajustarTexto(
    t: Phaser.GameObjects.Text, sizes: number[], w: number, maxLinhas: number,
) {
    for (const s of sizes) {
        t.setFontSize(s)
        t.setWordWrapWidth(w)
        if (t.getWrappedText().length <= maxLinhas) return
    }
    t.setFontSize(sizes[sizes.length - 1])
}

/* ═══════════════════════════════════════════════════════════ o cenário */

/** A sala desenhada de emergência, quando o render não estiver na pasta. */
export function paintSala(g: Phaser.GameObjects.Graphics) {
    g.clear()
    g.fillStyle(C.ink, 1)
    g.fillRect(0, 0, W, H)
    for (let x = 40; x < W; x += 96) {
        g.fillStyle(C.painel, 1)
        g.fillRoundedRect(x, 60, 68, 600, 10)
        g.fillStyle(C.ciano, 0.12)
        g.fillRect(x + 12, 96, 44, 6)
        g.fillRect(x + 12, 118, 44, 6)
    }
}

export function createCenario(scene: Phaser.Scene, key: string): void {
    if (!hasTex(scene, key)) {
        paintSala(scene.add.graphics().setDepth(-20))
        return
    }

    const bg = scene.add.image(W / 2, H / 2, key).setDepth(-20)
    const src = bg.texture.getSourceImage() as { width: number; height: number }
    bg.setScale(Math.max(W / src.width, H / src.height))

    /*
     * O DESFOQUE É QUASE IMPERCEPTÍVEL, DE PROPÓSITO.
     *
     * Força 0.4 (e não 1.4, como já foi em outro jogo): o suficiente para o
     * olho não conseguir focar nos cabos e nas luzinhas do render, sem borrar a
     * arte a ponto de parecer defeito. Quem escurece é o véu logo abaixo — e é
     * ele, não o blur, que faz o fundo virar fundo.
     *
     * `preFX` só existe no WebGL. No Canvas o `?.` deixa passar e sobra o véu,
     * que sozinho já resolve metade do problema.
     */
    bg.preFX?.addBlur(1, 2, 2, 0.4)

    const veil = scene.add.graphics().setDepth(-19)
    veil.fillStyle(C.ink, A.veil)
    veil.fillRect(0, 0, W, H)
}

/* ═══════════════════════════════════════════════════ a chapa e a bandeja */

/** Um parafuso — o detalhe que faz a chapa parecer chapa. */
function parafuso(g: Phaser.GameObjects.Graphics, x: number, y: number) {
    g.fillStyle(C.ink, 0.55)
    g.fillCircle(x, y + 1, 6)
    g.fillStyle(C.metal, 0.9)
    g.fillCircle(x, y, 5)
    g.fillStyle(C.ink, 0.5)
    g.fillRect(x - 3, y - 1, 6, 2)
}

export function paintChapa(g: Phaser.GameObjects.Graphics) {
    g.clear()

    // a máquina
    g.fillStyle(C.shadow, 0.34)
    g.fillRoundedRect(CHAPA.x + 5, CHAPA.y + 7, CHAPA.w, CHAPA.h, CHAPA.r)
    g.fillStyle(C.painel, 0.97)
    g.fillRoundedRect(CHAPA.x, CHAPA.y, CHAPA.w, CHAPA.h, CHAPA.r)
    g.fillStyle(C.white, 0.05)
    g.fillRoundedRect(CHAPA.x + 8, CHAPA.y + 8, CHAPA.w - 16, 40, 18)
    g.lineStyle(3, C.edge, 0.95)
    g.strokeRoundedRect(CHAPA.x, CHAPA.y, CHAPA.w, CHAPA.h, CHAPA.r)
    const p = 22
    parafuso(g, CHAPA.x + p, CHAPA.y + p)
    parafuso(g, CHAPA.x + CHAPA.w - p, CHAPA.y + p)
    parafuso(g, CHAPA.x + p, CHAPA.y + CHAPA.h - p)
    parafuso(g, CHAPA.x + CHAPA.w - p, CHAPA.y + CHAPA.h - p)

    // a bandeja dos pedidos: mais rasa e mais clara, porque é onde as coisas
    // POUSAM — a máquina é chapa, a bandeja é balcão
    g.fillStyle(C.shadow, 0.3)
    g.fillRoundedRect(BANDEJA.x + 4, BANDEJA.y + 6, BANDEJA.w, BANDEJA.h, BANDEJA.r)
    g.fillStyle(C.painelClaro, 0.9)
    g.fillRoundedRect(BANDEJA.x, BANDEJA.y, BANDEJA.w, BANDEJA.h, BANDEJA.r)
    g.lineStyle(3, C.edge, 0.9)
    g.strokeRoundedRect(BANDEJA.x, BANDEJA.y, BANDEJA.w, BANDEJA.h, BANDEJA.r)
}

export function createChapa(scene: Phaser.Scene): void {
    const g = scene.add.graphics().setDepth(0)
    paintChapa(g)
}

/* ══════════════════════════════════════════════════════════════ botões */

export interface RoundButton {
    container: Phaser.GameObjects.Container
    setEnabled(on: boolean): void
    destroy(): void
}

/**
 * A zona de toque é um objeto separado, PARADO.
 *
 * O container cresce no hover e afunda no clique; se a área de toque fosse ele,
 * a borda mudaria de tamanho no meio do gesto e um `pointerup` perto da margem
 * cairia fora. E a zona não acompanha tween nenhum — quem animar um botão para
 * longe dela deixa o botão morto para sempre.
 */
export function createRoundButton(
    scene: Phaser.Scene,
    x: number, y: number, r: number,
    label: string,
    onClick: () => void,
    tone = C.edge,
    depth = 90,
): RoundButton {
    const container = scene.add.container(x, y).setDepth(depth)

    const g = scene.add.graphics()
    g.fillStyle(C.shadow, 0.34)
    g.fillCircle(0, 4, r)
    g.fillStyle(tone, 1)
    g.fillCircle(0, 0, r)
    g.fillStyle(C.white, 0.2)
    g.fillCircle(0, -r * 0.32, r * 0.62)
    g.lineStyle(3, C.metal, 0.9)
    g.strokeCircle(0, 0, r)

    const text = scene.add.text(0, -1, label, {
        fontFamily: FONT.black, fontSize: SIZE.help, color: hex(inkOn(tone)),
    }).setOrigin(0.5).setResolution(2)

    container.add([g, text])

    let enabled = true
    const hit = scene.add.zone(x, y, r * 2 + 18, r * 2 + 18).setOrigin(0.5).setDepth(depth + 1)
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
    setLabel(text: string): void
    destroy(): void
}

export function createBigButton(
    scene: Phaser.Scene,
    { x, y, w, h, label, tone, onClick, breathe = false, depth = 30 }: {
        x: number; y: number; w: number; h: number
        label: string; tone: number; onClick: () => void
        breathe?: boolean
        depth?: number
    },
): BigButton {
    const container = scene.add.container(x, y).setDepth(depth)
    const bg = scene.add.graphics()
    const text = scene.add.text(0, -3, label, {
        fontFamily: FONT.black, fontSize: SIZE.button, color: hex(inkOn(tone)),
    }).setOrigin(0.5).setResolution(2)

    let enabled = true
    let pressed = false
    const drop = 6
    const deep = Phaser.Display.Color.ValueToColor(tone).darken(32).color

    const paint = () => {
        const dy = pressed ? drop : 0
        bg.clear()
        bg.fillStyle(C.shadow, 0.36)
        bg.fillRoundedRect(-w / 2 + 4, -h / 2 + drop + 6, w, h, h / 2)
        bg.fillStyle(enabled ? deep : C.soquete, 1)
        bg.fillRoundedRect(-w / 2, -h / 2, w, h + drop, h / 2)
        bg.fillStyle(enabled ? tone : C.painelClaro, 1)
        bg.fillRoundedRect(-w / 2, -h / 2 + dy, w, h, h / 2)
        bg.fillStyle(C.white, enabled ? 0.26 : 0.08)
        bg.fillRoundedRect(-w / 2 + 14, -h / 2 + dy + 8, w - 28, h * 0.26, h / 4)
        bg.lineStyle(4, C.metal, enabled ? 0.9 : 0.3)
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
            // de sincronia uma vez para o botão ficar morto até o fim da fase.
            enabled = on
            pressed = false
            paint()
            if (hit.input) hit.input.cursor = on ? 'pointer' : 'default'
        },
        setLabel: t => text.setText(t),
        destroy: () => { pulse?.remove(); hit.destroy(); container.destroy() },
    }
}

/* ═══════════════════════════════════════════════════════════════ HUD */

export function paintHudBar(g: Phaser.GameObjects.Graphics) {
    g.clear()
    g.fillStyle(C.ink, 0.97)
    g.fillRect(0, 0, HUD.w, HUD.h)
    g.fillStyle(C.white, 0.05)
    g.fillRect(0, 0, HUD.w, 22)
    g.fillStyle(C.ciano, 1)
    g.fillRect(0, HUD.h - HUD.linha, HUD.w, HUD.linha)
    g.fillStyle(C.shadow, 0.3)
    g.fillRect(0, HUD.h, HUD.w, 9)
}

export interface Hud {
    container: Phaser.GameObjects.Container
    setLevel(n: number): void
    setInstr(text: string): void
    setProgress(done: number, total: number): void
    /**
     * O TURNO (`shared/hud/createTimeBar`).
     *
     * O HUD só hospeda: quem manda nela é a cena, que sabe quando a criança
     * está de fato podendo agir. `tempo.tick(delta)` todo frame,
     * `tempo.setRunning(...)` quando o estado muda, `tempo.reset(ms)` a cada
     * fase nova.
     */
    tempo: TimeBar
    setHelpEnabled(on: boolean): void
    destroy(): void
}

export function createHud(
    scene: Phaser.Scene,
    { onHelp, onDanger, onEmpty }: {
        onHelp: () => void
        onDanger?: () => void
        onEmpty?: () => void
    },
): Hud {
    const container = scene.add.container(0, 0).setDepth(80)

    const bar = scene.add.graphics()
    paintHudBar(bar)
    container.add(bar)

    const pill = scene.add.graphics()
    pill.fillStyle(C.edge, 1)
    pill.fillRoundedRect(HUD.pillX, HUD.pillY, HUD.pillW, HUD.pillH, HUD.pillH / 2)
    pill.fillStyle(C.white, 0.22)
    pill.fillRoundedRect(HUD.pillX + 10, HUD.pillY + 6, HUD.pillW - 20, 12, 6)
    container.add(pill)

    const levelLabel = scene.add.text(HUD.pillX + HUD.pillW / 2, HUD.cy, 'NÍVEL 1', {
        fontFamily: FONT.black, fontSize: SIZE.hudLevel, color: hex(C.creme),
    }).setOrigin(0.5).setResolution(2)
    container.add(levelLabel)

    const instr = scene.add.text(HUD.instrCX, HUD.cy, '', {
        fontFamily: FONT.black, fontSize: SIZE.hudInstr, color: hex(C.creme),
        align: 'center', wordWrap: { width: HUD.instrW }, lineSpacing: 2,
    }).setOrigin(0.5).setResolution(2)
    container.add(instr)

    const dots = scene.add.container(0, 0)
    container.add(dots)

    const tempo = createTimeBar(scene, {
        cx: HUD.barCX, cy: HUD.cy, w: HUD.barW, h: HUD.barH,
        duration: 60_000,
        iconDX: HUD.barIconDX,
        iconR: HUD.barIconR,
        warnAt: BARRA.warnAt,
        dangerAt: BARRA.dangerAt,
        theme: BARRA.theme,
        onDanger,
        onEmpty,
    })
    container.add(tempo.container)

    const help = createRoundButton(
        scene, HUD.helpX, HUD.cy, HUD.helpR, '?', onHelp, C.edge, 82,
    )
    container.add(help.container)

    FX.slideIn(scene, container, { dy: 26, duration: 340 })

    return {
        container,
        setLevel: n => levelLabel.setText(`NÍVEL ${n}`),

        setInstr: text => {
            instr.setText(text)
            ajustarTexto(
                instr,
                text.length > LONGO ? [19, 17, 16] : [22, 19, 17],
                HUD.instrW, HUD.instrMaxLinhas,
            )
        },

        setProgress: (done, total) => {
            dots.removeAll(true)
            if (total <= 0) return
            const gap = total > 1 ? Math.min(26, HUD.dotsMaxW / (total - 1)) : 0
            for (let i = 0; i < total; i += 1) {
                const x = HUD.dotsX + i * gap
                const g = scene.add.graphics()
                if (i < done) {
                    g.fillStyle(C.livre, 1)
                    g.fillCircle(x, HUD.cy, HUD.dotR)
                } else if (i === done) {
                    g.fillStyle(C.ciano, 1)
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

/* ═══════════════════════════════════════════════════════ estabilidade */

export interface Estabilidade {
    container: Phaser.GameObjects.Container
    /** 0..100. */
    set(valor: number, animar?: boolean): void
    destroy(): void
}

/**
 * A ESTABILIDADE — dez segmentos que apagam da direita para a esquerda.
 *
 * Ela é o único indicador da tela que fala do sistema inteiro, e por isso ela
 * fica sozinha numa faixa larga no alto. As cores são as de estado, na ordem
 * de sempre: verde acima de 60, âmbar entre 30 e 60, vermelho abaixo — e
 * abaixo de 30 a faixa inteira PULSA, que é o "indicador visual de
 * instabilidade" da ficha da habilidade.
 */
export function createEstabilidade(scene: Phaser.Scene): Estabilidade {
    const container = scene.add.container(0, 0).setDepth(12)

    const rotulo = scene.add.text(ESTAB.rotuloX, ESTAB.cy, 'ESTABILIDADE', {
        fontFamily: FONT.black, fontSize: SIZE.estabRotulo, color: hex(C.metal),
    }).setOrigin(0, 0.5).setResolution(2)
    container.add(rotulo)

    const g = scene.add.graphics()
    container.add(g)

    const segW = (ESTAB.w - (ESTAB.segmentos - 1) * ESTAB.segGap) / ESTAB.segmentos
    const top = ESTAB.cy - ESTAB.barraH / 2

    let pulso: Phaser.Tweens.Tween | null = null
    let atual = 100

    const pintar = (v: number) => {
        const cheios = Math.max(0, Math.min(ESTAB.segmentos, Math.ceil(v / (100 / ESTAB.segmentos))))
        const tom = v > 60 ? C.livre : v > 30 ? C.ocupado : C.parado

        g.clear()
        g.fillStyle(C.shadow, 0.3)
        g.fillRoundedRect(ESTAB.x - 6, top - 5, ESTAB.w + 12, ESTAB.barraH + 12, ESTAB.r + 4)
        g.fillStyle(C.soquete, 0.95)
        g.fillRoundedRect(ESTAB.x - 6, top - 6, ESTAB.w + 12, ESTAB.barraH + 12, ESTAB.r + 4)
        g.lineStyle(2, C.edge, 0.9)
        g.strokeRoundedRect(ESTAB.x - 6, top - 6, ESTAB.w + 12, ESTAB.barraH + 12, ESTAB.r + 4)

        for (let i = 0; i < ESTAB.segmentos; i += 1) {
            const x = ESTAB.x + i * (segW + ESTAB.segGap)
            if (i < cheios) {
                g.fillStyle(tom, 1)
                g.fillRoundedRect(x, top, segW, ESTAB.barraH, ESTAB.r)
                g.fillStyle(C.white, 0.26)
                g.fillRoundedRect(x + 5, top + 4, segW - 10, ESTAB.barraH * 0.34, ESTAB.r / 2)
            } else {
                g.fillStyle(C.ink, 0.72)
                g.fillRoundedRect(x, top, segW, ESTAB.barraH, ESTAB.r)
            }
        }
    }

    pintar(100)

    return {
        container,
        set: (valor, animar = true) => {
            const v = Math.max(0, Math.min(100, valor))
            const caiu = v < atual
            atual = v
            pintar(v)

            if (v <= 30 && !pulso) {
                pulso = scene.tweens.add({
                    targets: container, alpha: 0.55,
                    duration: 380, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
                })
            } else if (v > 30 && pulso) {
                pulso.remove(); pulso = null; container.setAlpha(1)
            }

            if (animar && caiu) {
                void FX.shake(scene, container, { axis: 'x', amount: 5, times: 3 })
            }
        },
        destroy: () => { pulso?.remove(); container.destroy() },
    }
}

/* ═══════════════════════════════════════════════════════════ hardware */

/** O que a cena conta para a fileira de peças desenhar um frame. */
export interface PecaVista {
    id: DispositivoId
    ligado: boolean
    usadoPor?: ProgramaId
    /** Quanto do uso ainda falta, de 1 a 0. */
    frac: number
    /** Quem está na fila desta peça, em ordem. */
    esperando: ProgramaId[]
}

export interface Hardware {
    container: Phaser.GameObjects.Container
    sync(vistas: PecaVista[]): void
    posDe(id: DispositivoId): { x: number; y: number; tile: number }
    /** Um lampejo em cima de uma peça — acerto, recusa, "olhe aqui". */
    pulsar(id: DispositivoId, tom: number): void
    setAtivo(on: boolean): void
    destroy(): void
}

/** O soquete: a chapa quadrada onde a peça mora. */
export function paintSoquete(g: Phaser.GameObjects.Graphics, tile: number) {
    const h = tile / 2
    g.clear()
    g.fillStyle(C.shadow, 0.34)
    g.fillRoundedRect(-h + 3, -h + 5, tile, tile, PECAS.r)
    g.fillStyle(C.soquete, 1)
    g.fillRoundedRect(-h, -h, tile, tile, PECAS.r)
    g.fillStyle(C.white, 0.05)
    g.fillRoundedRect(-h + 8, -h + 8, tile - 16, tile * 0.3, PECAS.r / 2)
}

export function createHardware(
    scene: Phaser.Scene,
    { pecas, compacto, onPeca }: {
        pecas: DispositivoId[]
        /** Verdadeiro quando a faixa de memória existe: peças menores. */
        compacto: boolean
        onPeca: (id: DispositivoId) => void
    },
): Hardware {
    const cfg = compacto ? PECAS.comMemoria : PECAS.semMemoria
    const container = scene.add.container(0, 0).setDepth(10)

    const n = pecas.length
    const larguraTotal = n * cfg.tile + (n - 1) * cfg.gap
    const x0 = (W - larguraTotal) / 2 + cfg.tile / 2

    interface Slot {
        id: DispositivoId
        x: number
        base: Phaser.GameObjects.Graphics
        arte: Phaser.GameObjects.Image | null
        aro: Phaser.GameObjects.Graphics
        selo: Phaser.GameObjects.Container
        fila: Phaser.GameObjects.Container
        nome: Phaser.GameObjects.Text
        zona: Phaser.GameObjects.Zone
        /**
         * O último estado DESENHADO, em texto.
         *
         * `sync` é chamado a cada frame, porque a régua de uso escorre a cada
         * frame. Repintar `Graphics` sessenta vezes por segundo é barato;
         * destruir e recriar os disquinhos com `Image` dentro é que não é — e
         * era assim que ficaria sem esta linha. Os disquinhos só são refeitos
         * quando o QUE eles mostram muda.
         */
        assinatura: string
    }

    const slots: Slot[] = []
    let ativo = true

    pecas.forEach((id, i) => {
        const def = DISPOSITIVOS[id]
        const x = x0 + i * (cfg.tile + cfg.gap)

        const base = scene.add.graphics().setPosition(x, cfg.cy)
        paintSoquete(base, cfg.tile)
        container.add(base)

        let arte: Phaser.GameObjects.Image | null = null
        if (hasTex(scene, def.textura)) {
            arte = scene.add.image(x, cfg.cy - 6, def.textura)
            fitImage(arte, cfg.tile * PECAS.arte, cfg.tile * PECAS.arte)
            container.add(arte)
        }

        const aro = scene.add.graphics().setPosition(x, cfg.cy)
        container.add(aro)

        const selo = scene.add.container(
            x + cfg.tile * PECAS.seloDX, cfg.cy - cfg.tile * PECAS.seloDY,
        )
        container.add(selo)

        const fila = scene.add.container(
            x - cfg.tile * PECAS.seloDX, cfg.cy - cfg.tile * PECAS.seloDY,
        )
        container.add(fila)

        const nome = scene.add.text(x, cfg.cy + cfg.tile / 2 + PECAS.nomeDY, def.nome, {
            fontFamily: FONT.black, fontSize: SIZE.peca, color: hex(C.creme),
        }).setOrigin(0.5).setResolution(2)
        container.add(nome)

        const zona = scene.add.zone(x, cfg.cy, cfg.tile + 10, cfg.tile + 10)
            .setOrigin(0.5).setDepth(15)
        zona.setInteractive({ useHandCursor: true })
        zona.on('pointerup', () => { if (ativo) onPeca(id) })

        slots.push({ id, x, base, arte, aro, selo, fila, nome, zona, assinatura: '' })
    })

    /** O disquinho com o ícone de um programa. */
    const disco = (prog: ProgramaId, r: number): Phaser.GameObjects.Container => {
        const def = PROGRAMAS[prog]
        const c = scene.add.container(0, 0)
        const g = scene.add.graphics()
        g.fillStyle(C.shadow, 0.35)
        g.fillCircle(0, 3, r)
        g.fillStyle(def.cor, 1)
        g.fillCircle(0, 0, r)
        g.lineStyle(3, C.creme, 0.95)
        g.strokeCircle(0, 0, r)
        c.add(g)
        if (hasTex(scene, def.textura)) {
            const img = scene.add.image(0, 0, def.textura)
            fitImage(img, r * 1.3, r * 1.3)
            c.add(img)
        }
        return c
    }

    const pintarAro = (s: Slot, v: PecaVista) => {
        const h = cfg.tile / 2
        const tom = !v.ligado ? C.parado : v.usadoPor ? C.ocupado : C.livre
        s.aro.clear()
        s.aro.lineStyle(PECAS.aro, tom, 1)
        s.aro.strokeRoundedRect(-h, -h, cfg.tile, cfg.tile, PECAS.r)

        if (!v.ligado) {
            // a peça sem energia some por trás de um véu e ganha o corte
            s.aro.fillStyle(C.ink, 0.5)
            s.aro.fillRoundedRect(-h, -h, cfg.tile, cfg.tile, PECAS.r)
            s.aro.lineStyle(7, C.parado, 0.9)
            s.aro.lineBetween(-h * 0.55, h * 0.55, h * 0.55, -h * 0.55)
            return
        }

        if (!v.usadoPor) return

        // a régua de uso, DENTRO do soquete: quanto falta para vagar
        const bw = cfg.tile - 34
        const by = h - 22
        s.aro.fillStyle(C.ink, 0.85)
        s.aro.fillRoundedRect(-bw / 2, by, bw, 10, 5)
        const f = Math.max(0, Math.min(1, v.frac))
        if (f > 0) {
            s.aro.fillStyle(C.ocupado, 1)
            s.aro.fillRoundedRect(-bw / 2, by, Math.max(6, bw * f), 10, 5)
        }
    }

    const sync = (vistas: PecaVista[]) => {
        const porId = new Map(vistas.map(v => [v.id, v]))
        slots.forEach(s => {
            const v = porId.get(s.id)
            if (!v) return

            pintarAro(s, v)

            const assinatura = `${v.ligado}|${v.usadoPor ?? '-'}|${v.esperando.join(',')}`
            if (assinatura === s.assinatura) return
            s.assinatura = assinatura

            s.arte?.setAlpha(v.ligado ? 1 : A.desligado)
            s.nome.setColor(hex(v.ligado ? C.creme : C.idle))

            s.selo.removeAll(true)
            if (v.usadoPor) s.selo.add(disco(v.usadoPor, PECAS.seloR))

            s.fila.removeAll(true)
            v.esperando.slice(0, 2).forEach((p, i) => {
                const d = disco(p, 15)
                d.setPosition(i * 26, 0)
                d.setAlpha(0.92)
                s.fila.add(d)
            })
        })
    }

    return {
        container,
        sync,
        posDe: id => {
            const s = slots.find(x => x.id === id)
            return { x: s?.x ?? W / 2, y: cfg.cy, tile: cfg.tile }
        },
        pulsar: (id, tom) => {
            const s = slots.find(x => x.id === id)
            if (!s) return
            const h = cfg.tile / 2
            const g = scene.add.graphics().setPosition(s.x, cfg.cy).setDepth(14)
            g.lineStyle(PECAS.aro + 4, tom, 1)
            g.strokeRoundedRect(-h - 6, -h - 6, cfg.tile + 12, cfg.tile + 12, PECAS.r + 6)
            scene.tweens.add({
                targets: g, alpha: 0, scale: 1.14,
                duration: 460, ease: Ease.smooth,
                onComplete: () => g.destroy(),
            })
        },
        setAtivo: on => { ativo = on },
        destroy: () => {
            slots.forEach(s => s.zona.destroy())
            container.destroy()
        },
    }
}

/* ═══════════════════════════════════════════════════════════ memória */

export interface MemVista {
    blocos: number
    abertos: Array<{ id: ProgramaId; inicio: number; tam: number }>
}

export interface Memoria {
    container: Phaser.GameObjects.Container
    sync(v: MemVista): void
    /** O centro da régua, para o tutorial e para os efeitos apontarem. */
    pos(): { x: number; y: number; w: number }
    pulsar(tom: number): void
    setAtivo(on: boolean): void
    destroy(): void
}

/**
 * A RÉGUA DA MEMÓRIA.
 *
 * Blocos vizinhos, e um programa aberto é um pedaço INTEIRO por cima deles com
 * o ícone e o número no meio. É a forma que responde a pergunta da fase de uma
 * olhada: quantos quadradinhos escuros sobraram.
 *
 * Tocar num pedaço fecha o programa. Tocar num bloco vazio tenta abrir o pedido
 * que está na mão. As duas coisas são o MESMO gesto em cima do MESMO objeto, e
 * é o estado do bloco que decide — do mesmo jeito que, no hardware, tocar numa
 * peça livre entrega e tocar numa ocupada põe na fila.
 */
export function createMemoria(
    scene: Phaser.Scene,
    { blocos, onBloco }: {
        blocos: number
        onBloco: (indice: number, programa: ProgramaId | null) => void
    },
): Memoria {
    const container = scene.add.container(0, 0).setDepth(10)
    const blocoW = (MEM.w - (blocos - 1) * MEM.gap) / blocos
    const top = MEM.cy - MEM.blocoH / 2

    const rotulo = scene.add.text(MEM.rotuloX, MEM.cy, 'MEMÓRIA', {
        fontFamily: FONT.black, fontSize: SIZE.memRotulo, color: hex(C.metal),
    }).setOrigin(0, 0.5).setResolution(2)
    container.add(rotulo)

    const g = scene.add.graphics()
    container.add(g)

    const icones = scene.add.container(0, 0)
    container.add(icones)

    let ativo = true
    let ocupacao: Array<ProgramaId | null> = new Array(blocos).fill(null)

    const zonas: Phaser.GameObjects.Zone[] = []
    for (let i = 0; i < blocos; i += 1) {
        const x = MEM.x + i * (blocoW + MEM.gap) + blocoW / 2
        const z = scene.add.zone(x, MEM.cy, blocoW, MEM.blocoH + 8)
            .setOrigin(0.5).setDepth(15)
        z.setInteractive({ useHandCursor: true })
        z.on('pointerup', () => { if (ativo) onBloco(i, ocupacao[i]) })
        zonas.push(z)
    }

    const sync = (v: MemVista) => {
        ocupacao = new Array(blocos).fill(null)
        v.abertos.forEach(a => {
            for (let i = a.inicio; i < a.inicio + a.tam && i < blocos; i += 1) {
                ocupacao[i] = a.id
            }
        })

        g.clear()
        icones.removeAll(true)

        // o sulco por baixo
        g.fillStyle(C.shadow, 0.3)
        g.fillRoundedRect(MEM.x - 6, top - 5, MEM.w + 12, MEM.blocoH + 12, MEM.r + 4)
        g.fillStyle(C.soquete, 0.95)
        g.fillRoundedRect(MEM.x - 6, top - 6, MEM.w + 12, MEM.blocoH + 12, MEM.r + 4)
        g.lineStyle(2, C.edge, 0.9)
        g.strokeRoundedRect(MEM.x - 6, top - 6, MEM.w + 12, MEM.blocoH + 12, MEM.r + 4)

        // os blocos vazios
        for (let i = 0; i < blocos; i += 1) {
            if (ocupacao[i]) continue
            const x = MEM.x + i * (blocoW + MEM.gap)
            g.fillStyle(C.ink, 0.72)
            g.fillRoundedRect(x, top, blocoW, MEM.blocoH, MEM.r)
            g.lineStyle(2, C.edge, 0.45)
            g.strokeRoundedRect(x, top, blocoW, MEM.blocoH, MEM.r)
        }

        // e os programas, cada um numa peça só
        v.abertos.forEach(a => {
            const def = PROGRAMAS[a.id]
            const x = MEM.x + a.inicio * (blocoW + MEM.gap)
            const w = a.tam * blocoW + (a.tam - 1) * MEM.gap
            g.fillStyle(def.cor, 0.95)
            g.fillRoundedRect(x, top, w, MEM.blocoH, MEM.r)
            g.fillStyle(C.white, 0.24)
            g.fillRoundedRect(x + 5, top + 4, w - 10, MEM.blocoH * 0.32, MEM.r / 2)
            g.lineStyle(3, C.creme, 0.9)
            g.strokeRoundedRect(x, top, w, MEM.blocoH, MEM.r)

            const cx = x + w / 2
            if (hasTex(scene, def.textura)) {
                const img = scene.add.image(cx - 34, MEM.cy, def.textura)
                fitImage(img, MEM.blocoH - 14, MEM.blocoH - 14)
                icones.add(img)
            }
            const t = scene.add.text(cx + 8, MEM.cy, def.nome, {
                fontFamily: FONT.black, fontSize: SIZE.memBloco,
                color: hex(inkOn(def.cor)),
            }).setOrigin(0.5).setResolution(2)
            icones.add(t)
        })
    }

    sync({ blocos, abertos: [] })

    return {
        container,
        sync,
        pos: () => ({ x: MEM.x + MEM.w / 2, y: MEM.cy, w: MEM.w }),
        pulsar: tom => {
            const gg = scene.add.graphics().setDepth(14)
            gg.lineStyle(6, tom, 1)
            gg.strokeRoundedRect(MEM.x - 8, top - 8, MEM.w + 16, MEM.blocoH + 16, MEM.r + 6)
            scene.tweens.add({
                targets: gg, alpha: 0,
                duration: 480, ease: Ease.smooth,
                onComplete: () => gg.destroy(),
            })
        },
        setAtivo: on => { ativo = on },
        destroy: () => { zonas.forEach(z => z.destroy()); container.destroy() },
    }
}

/* ══════════════════════════════════════════════════════ ficha de pedido */

export interface Ficha {
    container: Phaser.GameObjects.Container
    setSlot(i: number, animar: boolean): void
    setSelecionada(on: boolean): void
    setPaciencia(frac: number): void
    /** O nome da peça em que ela está na fila, ou `null`. */
    setEspera(nome: string | null): void
    sair(ok: boolean): Promise<void>
    destroy(): void
}

const slotX = (i: number) => FILA.x0 + i * (FILA.w + FILA.gap) + FILA.w / 2

/**
 * A FICHA DE UM PEDIDO.
 *
 * ── A ZONA DE TOQUE MORA DENTRO DO CONTAINER ─────────────────────────────
 *
 * É a exceção à regra da casa, e ela é deliberada. Nos botões a zona fica
 * SOLTA porque o botão muda de escala no gesto e uma área que encolhe come o
 * clique. A ficha nunca muda de escala — ela só desliza de slot e sobe quando
 * é escolhida — e essas duas coisas ela faz o tempo todo. Uma zona solta
 * precisaria de um tween gêmeo em cada movimento, e o dia em que alguém
 * esquecer um deles a ficha fica tocável no lugar onde ELA NÃO ESTÁ MAIS.
 * Dentro do container, o Phaser resolve pela transformação do pai.
 */
export function createFicha(
    scene: Phaser.Scene,
    { pedido, slot, onTap }: {
        pedido: PedidoDef
        slot: number
        onTap: () => void
    },
): Ficha {
    const def = PROGRAMAS[pedido.programa]
    const container = scene.add.container(slotX(slot), FILA.cy).setDepth(20)

    const bg = scene.add.graphics()
    container.add(bg)

    let selecionada = false
    let esperando: string | null = null

    const pintar = () => {
        const tom = esperando ? C.ocupado : selecionada ? C.foco : C.fichaSombra
        bg.clear()
        bg.fillStyle(C.shadow, 0.34)
        bg.fillRoundedRect(-FILA.w / 2 + 3, -FILA.h / 2 + 7, FILA.w, FILA.h, FILA.r)
        bg.fillStyle(C.ficha, 1)
        bg.fillRoundedRect(-FILA.w / 2, -FILA.h / 2, FILA.w, FILA.h, FILA.r)
        bg.fillStyle(def.cor, 0.16)
        bg.fillRoundedRect(-FILA.w / 2, -FILA.h / 2, FILA.w, 40, FILA.r)
        bg.lineStyle(selecionada || esperando ? FILA.aro : 3, tom, 1)
        bg.strokeRoundedRect(-FILA.w / 2, -FILA.h / 2, FILA.w, FILA.h, FILA.r)
    }
    pintar()

    if (hasTex(scene, def.textura)) {
        const img = scene.add.image(FILA.iconDX, FILA.iconDY, def.textura)
        fitImage(img, FILA.iconMax, FILA.iconMax)
        container.add(img)
    }

    const nome = scene.add.text(FILA.textoDX, FILA.nomeDY, def.nome.toUpperCase(), {
        fontFamily: FONT.black, fontSize: SIZE.fichaNome, color: hex(C.idle),
    }).setOrigin(0, 0.5).setResolution(2)
    container.add(nome)

    const fala = scene.add.text(FILA.textoDX, FILA.falaDY, pedido.fala, {
        fontFamily: FONT.body, fontStyle: 'bold', fontSize: SIZE.fichaFala,
        color: hex(C.ink), wordWrap: { width: FILA.textoW }, lineSpacing: 3,
    }).setOrigin(0, 0.5).setResolution(2)
    ajustarTexto(fala, FILA.falaSizes, FILA.textoW, FILA.falaMaxLinhas)
    container.add(fala)

    /** O selo de "estou na fila do teclado". */
    const chip = scene.add.container(FILA.w / 2 - 96, -FILA.h / 2 + 20).setAlpha(0)
    const chipBg = scene.add.graphics()
    chipBg.fillStyle(C.ocupado, 1)
    chipBg.fillRoundedRect(-84, -13, 168, 26, 13)
    const chipTxt = scene.add.text(0, 0, '', {
        fontFamily: FONT.black, fontSize: '12px', color: hex(C.ink),
    }).setOrigin(0.5).setResolution(2)
    chip.add([chipBg, chipTxt])
    container.add(chip)

    const barra = scene.add.graphics()
    container.add(barra)

    const pintarBarra = (f: number) => {
        const frac = Math.max(0, Math.min(1, f))
        const tom = frac > 0.5 ? C.livre : frac > 0.25 ? C.ocupado : C.parado
        const x = -FILA.barraW / 2
        const y = FILA.barraDY
        barra.clear()
        barra.fillStyle(C.fichaSombra, 0.85)
        barra.fillRoundedRect(x, y, FILA.barraW, FILA.barraH, FILA.barraH / 2)
        if (frac > 0) {
            barra.fillStyle(tom, 1)
            barra.fillRoundedRect(x, y, Math.max(6, FILA.barraW * frac), FILA.barraH, FILA.barraH / 2)
        }
    }
    pintarBarra(1)

    // a zona vive DENTRO do container — ver o comentário do cabeçalho
    const zona = scene.add.zone(0, 0, FILA.w, FILA.h).setOrigin(0.5)
    zona.setInteractive({ useHandCursor: true })
    zona.on('pointerup', onTap)
    container.add(zona)

    FX.popIn(scene, container, { from: 0.7, duration: 320 })

    let vivo = true

    return {
        container,

        setSlot: (i, animar) => {
            const x = slotX(i)
            if (!animar) { container.setX(x); return }
            scene.tweens.add({
                targets: container, x,
                duration: 320, ease: Ease.smooth,
            })
        },

        setSelecionada: on => {
            if (selecionada === on) return
            selecionada = on
            pintar()
            container.setDepth(on ? 25 : 20)
            scene.tweens.add({
                targets: container,
                y: FILA.cy + (on ? FILA.liftDY : 0),
                duration: 180, ease: Ease.smooth,
            })
        },

        setPaciencia: pintarBarra,

        setEspera: nomePeca => {
            esperando = nomePeca
            pintar()
            if (!nomePeca) { chip.setAlpha(0); return }
            chipTxt.setText(`NA FILA: ${nomePeca.toUpperCase()}`)
            chip.setAlpha(1)
        },

        sair: async ok => {
            if (!vivo) return
            vivo = false
            zona.destroy()
            await FX.to(
                scene, container,
                { alpha: 0, y: container.y + (ok ? -70 : 60), scale: ok ? 1.08 : 0.86 },
                { duration: 340, ease: Ease.smooth },
            )
            container.destroy()
        },

        destroy: () => { vivo = false; container.destroy() },
    }
}

/* ══════════════════════════════════════════════════════ a voz do sistema */

export type Humor = 'neutro' | 'ok' | 'alerta'

/** O rostinho do sistema: dois olhos e uma boca que vira. */
export function paintRosto(g: Phaser.GameObjects.Graphics, r: number, humor: Humor) {
    const tom = humor === 'ok' ? C.livre : humor === 'alerta' ? C.parado : C.ciano
    g.clear()
    g.fillStyle(C.ink, 1)
    g.fillCircle(0, 0, r)
    g.lineStyle(3, tom, 1)
    g.strokeCircle(0, 0, r)
    g.fillStyle(tom, 1)
    g.fillCircle(-r * 0.34, -r * 0.16, r * 0.15)
    g.fillCircle(r * 0.34, -r * 0.16, r * 0.15)
    g.lineStyle(3, tom, 1)
    if (humor === 'alerta') {
        g.beginPath()
        g.arc(0, r * 0.62, r * 0.42, Math.PI * 1.15, Math.PI * 1.85)
        g.strokePath()
    } else {
        g.beginPath()
        g.arc(0, r * 0.1, r * 0.42, Math.PI * 0.15, Math.PI * 0.85)
        g.strokePath()
    }
}

export interface Mensagem {
    container: Phaser.GameObjects.Container
    dizer(texto: string, tinta: number, humor?: Humor): void
    destroy(): void
}

/**
 * A PLAQUINHA DO RODAPÉ — o balão da personagem, sem personagem.
 *
 * Ela é FIXA: nasce com a cena e só troca de conteúdo. O erro que o Baralho das
 * Listas cometeu e corrigiu foi ter avisos que apareciam e sumiam voando —
 * texto grande que a criança não tem tempo de ler, num lugar diferente a cada
 * vez. Aqui o recado mora sempre no mesmo canto, e quem muda é a cor da letra
 * e o rostinho ao lado.
 */
export function createMensagem(scene: Phaser.Scene): Mensagem {
    const container = scene.add.container(RODAPE.msgCX, RODAPE.cy).setDepth(30)

    const bg = scene.add.graphics()
    bg.fillStyle(C.shadow, 0.32)
    bg.fillRoundedRect(-RODAPE.msgW / 2 + 3, -RODAPE.msgH / 2 + 6, RODAPE.msgW, RODAPE.msgH, RODAPE.msgR)
    bg.fillStyle(C.ficha, 1)
    bg.fillRoundedRect(-RODAPE.msgW / 2, -RODAPE.msgH / 2, RODAPE.msgW, RODAPE.msgH, RODAPE.msgR)
    bg.lineStyle(3, C.edge, 0.8)
    bg.strokeRoundedRect(-RODAPE.msgW / 2, -RODAPE.msgH / 2, RODAPE.msgW, RODAPE.msgH, RODAPE.msgR)
    container.add(bg)

    const rosto = scene.add.graphics().setPosition(-RODAPE.msgW / 2 + 36, 0)
    paintRosto(rosto, RODAPE.msgIconR, 'neutro')
    container.add(rosto)

    const textoX = -RODAPE.msgW / 2 + 68
    const textoW = RODAPE.msgW - 88
    const texto = scene.add.text(textoX, 0, '', {
        fontFamily: FONT.body, fontStyle: 'bold', fontSize: SIZE.mensagem,
        color: hex(C.ink), wordWrap: { width: textoW }, lineSpacing: 3,
    }).setOrigin(0, 0.5).setResolution(2)
    container.add(texto)

    return {
        container,
        dizer: (t, tinta, humor = 'neutro') => {
            texto.setText(t)
            texto.setColor(hex(tinta))
            ajustarTexto(texto, [20, 18, 16], textoW, 2)
            paintRosto(rosto, RODAPE.msgIconR, humor)
            void FX.shake(scene, container, { axis: 'y', amount: 3, times: 1 })
        },
        destroy: () => container.destroy(),
    }
}

/* ═══════════════════════════════════════════════════════════ a pausa */

export interface Pausa {
    mostrar(): void
    esconder(): void
    destroy(): void
}

/**
 * A PAUSA — de graça, quantas vezes quiser.
 *
 * ── POR QUE ELA EXISTE ───────────────────────────────────────────────────
 *
 * Este é o primeiro jogo do conjunto em que o tempo corre SOZINHO: os pedidos
 * chegam quando querem e a paciência escorre sem esperar ninguém. Numa tela
 * assim, uma criança que precisa de trinta segundos para entender a regra
 * perde por um motivo que não tem nada a ver com a habilidade.
 *
 * A pausa devolve esse tempo. Ela congela tudo — o turno, a paciência, os
 * dispositivos — e NÃO deixa agir enquanto está congelada, então ela não é uma
 * forma de jogar devagar: é uma forma de OLHAR devagar. O véu deixa a tela
 * visível de propósito; o que a criança precisa fazer é justamente estudar o
 * tabuleiro parado.
 */
export function createPausa(scene: Phaser.Scene, onSair: () => void): Pausa {
    const container = scene.add.container(0, 0).setDepth(8000).setAlpha(0)
    container.setVisible(false)

    const veu = scene.add.graphics()
    veu.fillStyle(C.ink, 0.62)
    veu.fillRect(0, 0, W, H)
    container.add(veu)

    const placa = scene.add.graphics()
    placa.fillStyle(C.painel, 0.98)
    placa.fillRoundedRect(W / 2 - 250, 250, 500, 150, 26)
    placa.lineStyle(4, C.ciano, 0.95)
    placa.strokeRoundedRect(W / 2 - 250, 250, 500, 150, 26)
    container.add(placa)

    const titulo = scene.add.text(W / 2, 302, 'PAUSADO', {
        fontFamily: FONT.black, fontSize: '44px', color: hex(C.ciano),
    }).setOrigin(0.5).setResolution(2)
    container.add(titulo)

    const sub = scene.add.text(W / 2, 356, 'Olhe com calma. Toque para continuar.', {
        fontFamily: FONT.body, fontStyle: 'bold', fontSize: '20px', color: hex(C.creme),
    }).setOrigin(0.5).setResolution(2)
    container.add(sub)

    /*
     * A ZONA NÃO PODE SER `setVisible(false)`.
     *
     * Uma `Zone` não desenha nada, então a tentação é escondê-la para "desligar"
     * — e ela para de funcionar de vez. O teste de toque do Phaser pula todo
     * objeto cujo `willRender` é falso, e `visible = false` faz exatamente isso.
     * O interruptor certo é `input.enabled`, que é o que está aqui.
     */
    const zona = scene.add.zone(W / 2, H / 2, W, H).setOrigin(0.5).setDepth(8001)
    zona.setInteractive({ useHandCursor: true })
    zona.on('pointerup', onSair)
    if (zona.input) zona.input.enabled = false

    return {
        mostrar: () => {
            container.setVisible(true)
            if (zona.input) zona.input.enabled = true
            FX.to(scene, container, { alpha: 1 }, { duration: 180 })
        },
        esconder: () => {
            if (zona.input) zona.input.enabled = false
            FX.to(scene, container, { alpha: 0 }, { duration: 160 })
            scene.time.delayedCall(170, () => container.setVisible(false))
        },
        destroy: () => { zona.destroy(); container.destroy() },
    }
}
