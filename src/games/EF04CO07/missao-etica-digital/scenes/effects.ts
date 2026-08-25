import Phaser from 'phaser'
import { FX, Ease } from '../../../../shared/effects/FX'
import { C, A, FONT, SIZE, TYPE_MS, LONGA, hex, inkOn } from '../data/theme'
import { W, H, HUD, SELOS, SITUACAO, FICHA, ACOES, IMPACTO, TOAST } from '../data/layout'
import { PRINCIPIOS } from '../data/principios'
import type { Acao, Arquivo, Efeito, Marca, Principio, TipoArquivo } from '../types'

/*
 * Painters puros e construtores. A GameScene não desenha nada: se ela precisar
 * de um `fillRoundedRect`, falta um painter aqui.
 *
 * Neste jogo as texturas são o CENÁRIO e as artes do acervo — que são conteúdo,
 * não interface. Ficha, etiqueta, cartão de ação, selo, carimbo, cadeado e
 * escudo têm estado e saem todos de `Graphics`.
 */

/* ═══════════════════════════════════════════════════════════ texturas */

export const TEX = { fundo: 'bg-missao-etica' } as const

export const hasTex = (scene: Phaser.Scene, key: string) => scene.textures.exists(key)

/** Encaixa a imagem numa caixa, pela menor razão — nunca estica. */
export function fitImage(img: Phaser.GameObjects.Image, maxW: number, maxH: number) {
    // medido na TEXTURA: os tipos do Phaser deste projeto não expõem `width`
    // em `Image`, e o `tsc` do build reprova
    const src = img.texture.getSourceImage() as { width: number; height: number }
    img.setScale(Math.min(maxW / src.width, maxH / src.height))
}

export const ACCENT: Record<Principio, number> = {
    autoria: C.autoria,
    permissao: C.permissao,
    privacidade: C.privacidade,
    guarda: C.guarda,
}

/* ═══════════════════════════════════════════════════════════ cenário */

/** Sala de servidores em Graphics, quando a textura não estiver na pasta. */
export function paintSala(g: Phaser.GameObjects.Graphics) {
    g.clear()
    g.fillStyle(C.ink, 1)
    g.fillRect(0, 0, W, H)

    // racks: posição fixa, senão a parede muda de desenho a cada repintura e a
    // criança acha que alguma coisa aconteceu
    for (let col = 0; col < 8; col += 1) {
        const x = 20 + col * 160
        g.fillStyle(C.rackDark, 0.85)
        g.fillRoundedRect(x, 40, 128, 640, 12)
        g.fillStyle(C.rack, 0.9)
        g.fillRoundedRect(x + 8, 52, 112, 616, 8)
        for (let row = 0; row < 14; row += 1) {
            const y = 64 + row * 43
            g.fillStyle(C.rackLight, 0.5)
            g.fillRoundedRect(x + 16, y, 96, 30, 5)
            // as luzinhas: sempre nos mesmos lugares, sem piscar
            g.fillStyle((col + row) % 3 === 0 ? C.guarda : C.permissao, 0.55)
            g.fillCircle(x + 26, y + 15, 3.5)
            g.fillStyle(C.idle, 0.3)
            g.fillCircle(x + 38, y + 15, 3.5)
        }
    }
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
 * cairia fora, comendo o clique. Vale para todo botão, ficha e cartão daqui.
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
    { x, y, w, h, label, tone, onClick }: {
        x: number; y: number; w: number; h: number
        label: string; tone: number; onClick: () => void
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
        bg.fillStyle(enabled ? deep : 0x3a4a52, 1)
        bg.fillRoundedRect(-w / 2, -h / 2, w, h + drop, h / 2)
        bg.fillStyle(enabled ? tone : 0x5b6d76, 1)
        bg.fillRoundedRect(-w / 2, -h / 2 + dy, w, h, h / 2)
        bg.fillStyle(C.white, enabled ? 0.28 : 0.1)
        bg.fillRoundedRect(-w / 2 + 14, -h / 2 + dy + 9, w - 28, h * 0.26, h / 4)
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

    const pulse = FX.breathe(scene, container, { grow: 1.03, duration: 1200 })

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
    g.fillRoundedRect(HUD.x + 16, HUD.y + 9, HUD.w - 32, 16, 8)
    g.lineStyle(3, C.edge, 0.9)
    g.strokeRoundedRect(HUD.x, HUD.y, HUD.w, HUD.h, HUD.r)
}

/**
 * Um selo de princípio.
 *
 * Aceso é a pastilha cheia na cor do princípio; apagado é o contorno fino. As
 * bolinhas de alerta ficam registradas mesmo depois de o selo acender: elas
 * são parte do relatório, não uma punição que some quando a criança acerta.
 */
export function paintSelo(
    g: Phaser.GameObjects.Graphics,
    { tone, marca }: { tone: number; marca: Marca },
) {
    const hw = SELOS.w / 2
    const hh = SELOS.h / 2
    const acesa = marca.respeitado

    g.clear()
    g.fillStyle(acesa ? tone : C.white, acesa ? 1 : 0.05)
    g.fillRoundedRect(-hw, -hh, SELOS.w, SELOS.h, SELOS.r)
    if (acesa) {
        g.fillStyle(C.white, 0.24)
        g.fillRoundedRect(-hw + 6, -hh + 5, SELOS.w - 12, 9, 4)
    }
    g.lineStyle(acesa ? 3 : 2, tone, acesa ? 1 : 0.4)
    g.strokeRoundedRect(-hw, -hh, SELOS.w, SELOS.h, SELOS.r)

    for (let i = 0; i < Math.min(marca.alertas, 3); i += 1) {
        g.fillStyle(C.alerta, 1)
        g.fillCircle(hw + SELOS.alertaDX - i * 11, -hh + SELOS.alertaDY, SELOS.alertaR)
    }
}

export interface Hud {
    container: Phaser.GameObjects.Container
    setLevel(level: number): void
    setTitle(text: string): void
    setProgress(done: number, total: number): void
    /** Repinta os quatro selos a partir do estado da partida. */
    setSelos(marcas: Record<Principio, Marca>): void
    /**
     * O gesto de carimbo sobre um selo.
     *
     * Ele cai grande e encolhe até o tamanho certo — é o mesmo movimento de um
     * carimbo de mesa, e é o que faz o selo parecer conquistado em vez de
     * aparecer do nada.
     */
    carimbarSelo(p: Principio, ok: boolean): Promise<void>
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

    /* ── os quatro selos ────────────────────────────────────────────── */
    const seloX = (i: number) => {
        const n = PRINCIPIOS.length
        const total = n * SELOS.w + (n - 1) * SELOS.gap
        return SELOS.cx - total / 2 + SELOS.w / 2 + i * (SELOS.w + SELOS.gap)
    }

    const selos = PRINCIPIOS.map((p, i) => {
        const node = scene.add.container(seloX(i), SELOS.cy)
        const g = scene.add.graphics()
        const t = scene.add.text(0, 0, p.selo, {
            fontFamily: FONT.black, fontSize: SIZE.selo, color: hex(C.idle),
        }).setOrigin(0.5).setResolution(2)
        node.add([g, t])
        container.add(node)
        return { key: p.key, node, g, t }
    })

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
                    g.fillStyle(C.paper, 1)
                    g.fillRoundedRect(x - 13, HUD.cy - 7, 26, 14, 7)
                } else {
                    g.fillStyle(C.white, 0.18)
                    g.fillCircle(x, HUD.cy, HUD.dotR)
                }
                dots.add(g)
            }
        },

        setSelos: marcas => {
            selos.forEach(s => {
                const marca = marcas[s.key]
                const tone = ACCENT[s.key]
                paintSelo(s.g, { tone, marca })
                s.t.setColor(hex(marca.respeitado ? inkOn(tone) : C.idle))
            })
        },

        carimbarSelo: (p, ok) => {
            const s = selos.find(x => x.key === p)
            if (!s) return Promise.resolve()
            FX.kill(scene, s.node)
            s.node.setScale(ok ? 2.4 : 1)
            if (!ok) {
                return FX.shake(scene, s.node, { amount: 5, times: 2 })
            }
            return FX.to(scene, s.node, { scale: 1 },
                { duration: 260, ease: 'Back.easeIn' })
        },

        setHelpEnabled: help.setEnabled,
        destroy: () => { help.destroy(); container.destroy() },
    }
}

/* ═══════════════════════════════════════════════════════ a situação */

export interface Situacao {
    container: Phaser.GameObjects.Container
    /** Escreve letra a letra. Para quando a situação MUDA. */
    show(text: string): Promise<void>
    /**
     * Põe o texto na hora, sem digitar.
     *
     * É o que a volta depois de um alerta usa: a situação é a mesma de antes,
     * e ver a mesma frase ser datilografada de novo a cada tentativa cansa
     * rápido — e atrasa em dois segundos a única coisa que a criança quer
     * naquele momento, que é tentar outra vez.
     */
    set(text: string): void
    destroy(): void
}

export function createSituacao(scene: Phaser.Scene): Situacao {
    const container = scene.add.container(0, 0).setDepth(30)

    const g = scene.add.graphics()
    g.fillStyle(C.shadow, 0.3)
    g.fillRoundedRect(SITUACAO.x + 4, SITUACAO.y + 6, SITUACAO.w, SITUACAO.h, SITUACAO.r)
    g.fillStyle(C.painel, 0.94)
    g.fillRoundedRect(SITUACAO.x, SITUACAO.y, SITUACAO.w, SITUACAO.h, SITUACAO.r)
    g.lineStyle(3, C.edge, 0.9)
    g.strokeRoundedRect(SITUACAO.x, SITUACAO.y, SITUACAO.w, SITUACAO.h, SITUACAO.r)
    container.add(g)

    const label = scene.add.text(SITUACAO.cx, SITUACAO.cy, '', {
        fontFamily: FONT.body, fontStyle: 'bold', fontSize: SIZE.situacao,
        color: hex(C.paper), align: 'center', wordWrap: { width: SITUACAO.wrap },
    }).setOrigin(0.5).setResolution(2)
    container.add(label)

    let typing: { skip: () => void } | null = null

    return {
        container,
        show: async text => {
            typing?.skip()
            label.setFontSize(text.length > LONGA ? SIZE.situacaoLonga : SIZE.situacao)
            // mede com o texto completo antes de escrever, senão a linha
            // cresceria letra a letra e o texto pularia dentro da faixa
            label.setText(text)
            label.setText('')
            const tw = FX.type(scene, label, text, { delay: TYPE_MS.situacao })
            typing = tw
            await tw
            typing = null
        },
        set: text => {
            typing?.skip()
            typing = null
            label.setFontSize(text.length > LONGA ? SIZE.situacaoLonga : SIZE.situacao)
            label.setText(text)
        },
        destroy: () => { typing?.skip(); container.destroy() },
    }
}

/* ══════════════════════════════════════ ícones: o tipo do arquivo */

/**
 * O ícone do tipo, quando a arte do arquivo ainda não está na pasta.
 *
 * É rede de segurança, não a primeira escolha: uma clave de sol diz "isto é
 * música", e a capa do disco diz "isto é o forró da Banda Pé de Vento" — que é
 * a informação de que a decisão precisa.
 */
export function paintTipoIcone(g: Phaser.GameObjects.Graphics, tipo: TipoArquivo, tone: number) {
    g.clear()
    g.fillStyle(tone, 1)

    if (tipo === 'musica') {
        g.fillCircle(-26, 40, 22)
        g.fillCircle(34, 26, 22)
        g.fillRoundedRect(-8, -52, 12, 94, 6)
        g.fillRoundedRect(52, -66, 12, 94, 6)
        g.fillRoundedRect(-8, -66, 72, 22, 8)
        return
    }

    if (tipo === 'video') {
        g.fillRoundedRect(-70, -50, 140, 100, 12)
        g.fillStyle(C.verso, 1)
        g.fillRoundedRect(-58, -38, 116, 76, 8)
        g.fillStyle(tone, 1)
        g.fillTriangle(-16, -22, -16, 22, 26, 0)
        for (let i = 0; i < 3; i += 1) {
            g.fillRoundedRect(-78, -34 + i * 32, 10, 20, 3)
            g.fillRoundedRect(68, -34 + i * 32, 10, 20, 3)
        }
        return
    }

    if (tipo === 'documento') {
        g.fillRoundedRect(-54, -70, 108, 140, 10)
        g.fillStyle(C.verso, 1)
        g.fillTriangle(24, -70, 54, -70, 54, -40)
        g.fillStyle(C.verso, 0.55)
        for (let i = 0; i < 5; i += 1) g.fillRoundedRect(-38, -26 + i * 20, 76, 8, 4)
        return
    }

    // imagem: uma moldura com um morro e um sol
    g.fillRoundedRect(-72, -56, 144, 112, 10)
    g.fillStyle(C.verso, 1)
    g.fillRoundedRect(-62, -46, 124, 92, 6)
    g.fillStyle(tone, 0.9)
    g.fillCircle(-28, -20, 12)
    g.fillTriangle(-58, 40, -6, -14, 46, 40)
}

/* ═══════════════════════════════════ ícones: o gesto de cada ação */

/**
 * O desenho do que a ação FAZ.
 *
 * Ele existe pelo mesmo motivo que o rótulo encolheu: aos nove anos, comparar
 * três frases custa caro e comparar três desenhos não custa quase nada. O
 * ícone dá a leitura de relance, e o rótulo confirma.
 */
export function paintEfeitoIcone(g: Phaser.GameObjects.Graphics, efeito: Efeito, tone: number) {
    g.clear()
    g.lineStyle(4, tone, 1)
    g.fillStyle(tone, 1)

    switch (efeito) {
        case 'credito': {
            // uma etiqueta pendurada, com o furo e um risco de nome dentro
            g.fillRoundedRect(-18, -16, 34, 32, 6)
            g.fillTriangle(-18, -16, -18, 16, -34, 0)
            g.fillStyle(C.verso, 1)
            g.fillCircle(-14, 0, 4)
            g.fillStyle(C.verso, 0.7)
            g.fillRoundedRect(-6, -6, 18, 4, 2)
            g.fillRoundedRect(-6, 2, 12, 4, 2)
            return
        }
        case 'semCredito': {
            // a mesma etiqueta, caindo, com um X no lugar do nome
            g.fillRoundedRect(-16, -14, 32, 30, 6)
            g.fillTriangle(-16, -14, -16, 16, -32, 1)
            g.fillStyle(C.verso, 1)
            g.fillCircle(-12, 1, 4)
            g.lineStyle(4, C.verso, 1)
            g.lineBetween(-4, -6, 12, 10)
            g.lineBetween(12, -6, -4, 10)
            return
        }
        case 'pergunta': {
            // um balão de fala com uma interrogação
            g.fillRoundedRect(-26, -22, 52, 38, 12)
            g.fillTriangle(-8, 16, 6, 16, -14, 28)
            g.lineStyle(5, C.verso, 1)
            g.beginPath()
            g.arc(0, -8, 9, Math.PI * 1.05, Math.PI * 0.35, false)
            g.strokePath()
            g.fillStyle(C.verso, 1)
            g.fillRect(-2, 0, 5, 4)
            g.fillCircle(0, 9, 3)
            return
        }
        case 'trava': {
            // uma ampulheta
            g.fillRoundedRect(-20, -26, 40, 7, 3)
            g.fillRoundedRect(-20, 19, 40, 7, 3)
            g.fillTriangle(-15, -19, 15, -19, 0, 0)
            g.fillTriangle(-15, 19, 15, 19, 0, 0)
            return
        }
        case 'protege': {
            // um escudo com um visto
            g.fillRoundedRect(-22, -24, 44, 30, 8)
            g.fillTriangle(-22, 4, 22, 4, 0, 28)
            g.lineStyle(5, C.verso, 1)
            g.beginPath()
            g.moveTo(-9, -3)
            g.lineTo(-2, 5)
            g.lineTo(11, -11)
            g.strokePath()
            return
        }
        case 'libera': {
            // um cadeado com o arco aberto para o lado
            g.fillRoundedRect(-18, -4, 36, 30, 7)
            g.lineStyle(6, tone, 1)
            g.beginPath()
            g.arc(2, -8, 13, Math.PI, Math.PI * 1.9, false)
            g.strokePath()
            g.fillStyle(C.verso, 1)
            g.fillCircle(0, 10, 5)
            return
        }
        case 'vaza': {
            // três setas escapando de um ponto
            g.fillCircle(-16, 0, 8)
            for (let i = 0; i < 3; i += 1) {
                const a = -0.7 + i * 0.7
                const x = -4 + Math.cos(a) * 16
                const y = Math.sin(a) * 16
                g.fillTriangle(x, y - 7, x, y + 7, x + 16, y)
            }
            return
        }
        case 'link': {
            // dois elos de corrente
            g.lineStyle(6, tone, 1)
            g.strokeRoundedRect(-26, -11, 30, 22, 11)
            g.strokeRoundedRect(-2, -11, 30, 22, 11)
            return
        }
        case 'copia': {
            // dois retângulos sobrepostos
            g.fillRoundedRect(-22, -22, 32, 38, 6)
            g.fillStyle(C.verso, 1)
            g.fillRoundedRect(-16, -16, 26, 32, 5)
            g.fillStyle(tone, 1)
            g.fillRoundedRect(-10, -10, 32, 38, 6)
            return
        }
        case 'cofre': {
            // uma pasta com um cadeado na frente
            g.fillRoundedRect(-26, -18, 24, 8, 3)
            g.fillRoundedRect(-26, -12, 52, 34, 6)
            g.fillStyle(C.verso, 1)
            g.fillRoundedRect(-8, 0, 17, 14, 3)
            g.lineStyle(4, C.verso, 1)
            g.beginPath()
            g.arc(0, 0, 7, Math.PI, 0, false)
            g.strokePath()
            return
        }
        case 'solto': {
            // uma folha largada, com um olho em cima
            g.fillRoundedRect(-24, -20, 40, 30, 5)
            g.fillStyle(C.verso, 1)
            g.fillEllipse(4, 12, 40, 22)
            g.fillStyle(tone, 1)
            g.fillCircle(4, 12, 8)
            g.fillStyle(C.verso, 1)
            g.fillCircle(4, 12, 4)
            return
        }
        case 'apaga': {
            // uma lixeira
            g.fillRoundedRect(-22, -24, 44, 8, 4)
            g.fillRoundedRect(-8, -32, 16, 8, 3)
            g.fillRoundedRect(-18, -13, 36, 38, 6)
            g.fillStyle(C.verso, 0.8)
            g.fillRoundedRect(-9, -6, 5, 24, 2)
            g.fillRoundedRect(4, -6, 5, 24, 2)
            return
        }
    }
}

/* ═══════════════════════════════════════════════════════════ a ficha */

export function paintFichaFrente(g: Phaser.GameObjects.Graphics, tone: number) {
    const hw = FICHA.w / 2
    const hh = FICHA.h / 2

    g.clear()
    g.fillStyle(C.shadow, 0.36)
    g.fillRoundedRect(-hw + 6, -hh + 10, FICHA.w, FICHA.h, FICHA.r)
    g.fillStyle(C.ficha, 1)
    g.fillRoundedRect(-hw, -hh, FICHA.w, FICHA.h, FICHA.r)
    g.fillStyle(tone, 1)
    g.fillRoundedRect(-hw, -hh, FICHA.w, 12, FICHA.r)
    g.fillStyle(C.fichaEdge, 0.5)
    g.fillRect(-hw + 20, FICHA.nomeY - 24, FICHA.w - 40, 2)
    g.lineStyle(4, tone, 1)
    g.strokeRoundedRect(-hw, -hh, FICHA.w, FICHA.h, FICHA.r)
}

export function paintFichaVerso(g: Phaser.GameObjects.Graphics, tone: number, temAviso: boolean) {
    const hw = FICHA.w / 2
    const hh = FICHA.h / 2

    g.clear()
    g.fillStyle(C.shadow, 0.36)
    g.fillRoundedRect(-hw + 6, -hh + 10, FICHA.w, FICHA.h, FICHA.r)
    g.fillStyle(C.verso, 1)
    g.fillRoundedRect(-hw, -hh, FICHA.w, FICHA.h, FICHA.r)
    g.fillStyle(tone, 1)
    g.fillRoundedRect(-hw, -hh, FICHA.w, 12, FICHA.r)

    // os riscos que separam autor, permissão e aviso
    g.fillStyle(C.edge, 0.55)
    g.fillRect(-hw + 22, FICHA.permRotuloY - 22, FICHA.w - 44, 2)
    if (temAviso) g.fillRect(-hw + 22, FICHA.avisoRotuloY - 22, FICHA.w - 44, 2)

    g.lineStyle(4, tone, 1)
    g.strokeRoundedRect(-hw, -hh, FICHA.w, FICHA.h, FICHA.r)
}

/** A dobra de papel do canto: o convite para virar, sem uma palavra. */
export function paintOrelha(g: Phaser.GameObjects.Graphics, tone: number) {
    const r = FICHA.orelhaR
    g.clear()
    g.fillStyle(C.shadow, 0.22)
    g.fillTriangle(-r + 3, -r + 5, r + 3, -r + 5, r + 3, r + 5)
    g.fillStyle(tone, 1)
    g.fillTriangle(-r, -r, r, -r, r, r)
    g.fillStyle(C.white, 0.28)
    g.fillTriangle(-r + 8, -r + 6, r - 6, -r + 6, r - 6, r - 8)
}

export interface Ficha {
    container: Phaser.GameObjects.Container
    /** Gira a ficha. Resolve quando a outra cara já está à mostra. */
    virar(): Promise<void>
    /** Se a etiqueta já foi vista alguma vez nesta missão. */
    conferida(): boolean
    /**
     * O que acontece com o arquivo por causa da escolha.
     *
     * O `ok` não troca a animação: troca a COR dela e o final. Carimbar o
     * crédito com o nome certo e com o nome errado é o mesmo gesto — só que no
     * segundo o carimbo escorrega da ficha e cai.
     */
    reagir(efeito: Efeito, ok: boolean): Promise<void>
    /** Sai de cena pela esquerda, no fim da missão. */
    sair(): Promise<void>
    setEnabled(on: boolean): void
    destroy(): void
}

export function createFicha(
    scene: Phaser.Scene,
    { arquivo, tone, entrando, onVirar }: {
        arquivo: Arquivo
        tone: number
        /** Primeira missão da tela: a ficha entra deslizando pela direita. */
        entrando: boolean
        onVirar: () => void
    },
): Ficha {
    const container = scene.add.container(FICHA.cx, FICHA.cy).setDepth(35)

    /*
     * As duas caras existem ao mesmo tempo; só uma fica visível.
     *
     * Montar e destruir a cada giro perderia a arte carregada e piscaria a
     * imagem. Trocar `visible` no fundo do poço é o que faz o giro parecer
     * uma ficha de papel de verdade.
     */
    const frente = scene.add.container(0, 0)
    const verso = scene.add.container(0, 0).setVisible(false)
    /** Onde as consequências acontecem: carimbos, escudos, cópias, pixels. */
    const palco = scene.add.container(0, 0)
    container.add([frente, verso, palco])

    /* ── frente ────────────────────────────────────────────────────── */
    const gf = scene.add.graphics()
    paintFichaFrente(gf, tone)
    frente.add(gf)

    if (arquivo.arte && hasTex(scene, arquivo.arte)) {
        const img = scene.add.image(0, FICHA.arteCY, arquivo.arte)
        fitImage(img, FICHA.arteW, FICHA.arteH)
        frente.add(img)
    } else {
        // a arte ainda não está na pasta: o ícone do tipo entra no lugar e o
        // jogo continua inteiro
        const icone = scene.add.graphics().setPosition(0, FICHA.arteCY)
        paintTipoIcone(icone, arquivo.tipo, tone)
        frente.add(icone)
    }

    frente.add(scene.add.text(0, FICHA.nomeY, arquivo.nome, {
        fontFamily: FONT.mono, fontStyle: 'bold', fontSize: SIZE.fichaNome,
        color: hex(C.slate), align: 'center', wordWrap: { width: FICHA.nomeWrap },
    }).setOrigin(0.5).setResolution(2))

    /* ── verso: a etiqueta ─────────────────────────────────────────── */
    const gv = scene.add.graphics()
    paintFichaVerso(gv, tone, !!arquivo.etiqueta.aviso)
    verso.add(gv)

    const rotulo = (y: number, txt: string) =>
        scene.add.text(FICHA.rotuloX, y, txt, {
            fontFamily: FONT.black, fontSize: SIZE.etiquetaRotulo, color: hex(tone),
        }).setOrigin(0, 0.5).setResolution(2)

    const valor = (y: number, txt: string, cor: number, tam: string) =>
        scene.add.text(FICHA.rotuloX, y, txt, {
            fontFamily: FONT.body, fontStyle: 'bold', fontSize: tam,
            color: hex(cor), wordWrap: { width: FICHA.textoWrap },
        }).setOrigin(0, 0).setResolution(2)

    verso.add(rotulo(FICHA.autorRotuloY, 'QUEM FEZ'))
    verso.add(valor(FICHA.autorY, arquivo.etiqueta.autor, C.paper, SIZE.etiquetaTexto))
    verso.add(rotulo(FICHA.permRotuloY, 'O QUE PODE'))
    verso.add(valor(FICHA.permY, arquivo.etiqueta.permissao, C.paper, SIZE.etiquetaTexto))

    if (arquivo.etiqueta.aviso) {
        verso.add(rotulo(FICHA.avisoRotuloY, 'ATENÇÃO'))
        verso.add(valor(FICHA.avisoY, arquivo.etiqueta.aviso, C.alertaSoft, SIZE.etiquetaAviso))
    }

    /* ── a orelha ──────────────────────────────────────────────────── */
    const orelha = scene.add.container(
        FICHA.w / 2 + FICHA.orelhaDX, -FICHA.h / 2 + FICHA.orelhaDY,
    )
    const go = scene.add.graphics()
    paintOrelha(go, tone)
    /*
     * A seta vai para CIMA e para a DIREITA dentro da dobra, e não para o
     * centro dela.
     *
     * A dobra é um triângulo com a hipotenusa descendo da esquerda para a
     * direita, então "o meio da caixa" fica FORA do papel: em (4, -4) a barriga
     * do glifo cruzava a hipotenusa e a seta aparecia meio derramada para fora
     * da orelha. Em (10, -10) ela fica inteira dentro, com folga.
     */
    const seta = scene.add.text(10, -10, '↻', {
        fontFamily: FONT.black, fontSize: SIZE.orelha, color: hex(inkOn(tone)),
    }).setOrigin(0.5).setResolution(2)
    orelha.add([go, seta])
    container.add(orelha)

    let mostrandoVerso = false
    let jaConferiu = false
    let enabled = true
    let girando = false

    const hit = scene.add
        .zone(FICHA.cx, FICHA.cy, FICHA.w + FICHA.hitPad, FICHA.h + FICHA.hitPad)
        .setOrigin(0.5).setDepth(60)
    hit.setInteractive({ useHandCursor: true })

    /** A orelha chama enquanto a criança não virou. Depois cala a boca. */
    let chama: Phaser.Tweens.Tween | null = FX.wiggle(scene, orelha, { deg: 7, duration: 900 })
    const calarOrelha = () => {
        if (!chama) return
        chama.remove()
        chama = null
        orelha.setAngle(0)
    }

    /**
     * O giro.
     *
     * Uma escala em X que vai a zero e volta, com a troca de cara no fundo do
     * poço. É o gesto de virar um papel na mesa, e é o gesto que o jogo inteiro
     * quer que a criança aprenda a fazer antes de decidir.
     */
    const virar = () => new Promise<void>(resolve => {
        if (girando) { resolve(); return }
        girando = true
        calarOrelha()
        scene.tweens.add({
            targets: container, scaleX: 0, duration: 150, ease: 'Sine.easeIn',
            onComplete: () => {
                mostrandoVerso = !mostrandoVerso
                if (mostrandoVerso) jaConferiu = true
                frente.setVisible(!mostrandoVerso)
                verso.setVisible(mostrandoVerso)
                scene.tweens.add({
                    targets: container, scaleX: 1, duration: 170, ease: 'Back.easeOut',
                    onComplete: () => { girando = false; resolve() },
                })
            },
        })
    })

    hit.on('pointerover', () => {
        if (enabled && !girando) FX.to(scene, orelha, { scale: 1.16 }, { duration: 120 })
    })
    hit.on('pointerout', () => {
        if (enabled) FX.to(scene, orelha, { scale: 1 }, { duration: 120 })
    })
    hit.on('pointerup', () => {
        if (!enabled || girando) return
        void virar()
        onVirar()
    })

    if (entrando) {
        /*
         * A zona de toque já nasce no lugar final, e a ficha ainda está lá
         * fora. Sem desligar a ficha durante o trajeto, um toque apressado
         * viraria um papel que ninguém está vendo.
         */
        enabled = false
        container.setPosition(W + 320, FICHA.cy)
        void FX.to(scene, container, { x: FICHA.cx },
            { duration: 460, ease: Ease.back(1.2) })
            .then(() => { enabled = true })
    } else {
        void FX.popIn(scene, container, { from: 0.94, duration: 300 })
    }

    /* ══════════════════════════════════════════ as consequências */

    /** Uma miniatura da ficha, para as cópias que escapam ou ficam. */
    const miniFicha = (x: number, y: number, escala: number) => {
        const g = scene.add.graphics().setPosition(x, y).setScale(escala)
        g.fillStyle(C.shadow, 0.3)
        g.fillRoundedRect(-54 + 3, -66 + 4, 108, 132, 10)
        g.fillStyle(C.ficha, 1)
        g.fillRoundedRect(-54, -66, 108, 132, 10)
        g.fillStyle(tone, 1)
        g.fillRoundedRect(-54, -66, 108, 8, 4)
        g.fillStyle(C.fichaEdge, 0.8)
        g.fillRoundedRect(-40, -46, 80, 62, 6)
        g.fillStyle(C.idle, 0.55)
        g.fillRoundedRect(-40, 28, 80, 7, 3)
        g.lineStyle(3, tone, 0.9)
        g.strokeRoundedRect(-54, -66, 108, 132, 10)
        palco.add(g)
        return g
    }

    const cor = (ok: boolean) => (ok ? C.ok : C.alerta)

    /** O carimbo de crédito: uma pastilha com o nome de quem fez. */
    const carimboCredito = async (ok: boolean) => {
        const tom = cor(ok)
        const node = scene.add.container(0, 46)
        const g = scene.add.graphics()
        g.fillStyle(C.ficha, 1)
        g.fillRoundedRect(-124, -32, 248, 64, 14)
        g.fillStyle(tom, 0.2)
        g.fillRoundedRect(-124, -32, 248, 64, 14)
        g.lineStyle(6, tom, 1)
        g.strokeRoundedRect(-124, -32, 248, 64, 14)
        const t = scene.add.text(0, 0, arquivo.etiqueta.autor, {
            fontFamily: FONT.black, fontSize: SIZE.carimbo, color: hex(tom),
            align: 'center', wordWrap: { width: 224 },
        }).setOrigin(0.5).setResolution(2)
        node.add([g, t])
        node.setScale(3).setAlpha(0).setAngle(-7)
        palco.add(node)

        await FX.to(scene, node, { scale: 1, alpha: 1 }, { duration: 260, ease: 'Back.easeIn' })
        void FX.impact(scene, container, 0.07)
        if (ok) {
            void FX.sparks(scene, FICHA.cx, FICHA.cy + 46, { color: tom, count: 16, spread: 150 })
            await FX.wait(scene, 320)
            return
        }
        // o carimbo errado não cola: escorrega da ficha e cai
        await FX.wait(scene, 260)
        await FX.to(scene, node, { y: 320, angle: 26, alpha: 0 },
            { duration: 520, ease: Ease.anticipate(0.5) })
    }

    /** A etiqueta de autoria se solta e cai. */
    const soltarEtiqueta = async () => {
        const node = scene.add.container(96, -150)
        const g = scene.add.graphics()
        g.fillStyle(C.alerta, 1)
        g.fillRoundedRect(-34, -22, 68, 44, 8)
        g.fillStyle(C.verso, 1)
        g.fillCircle(-22, 0, 5)
        g.fillStyle(C.verso, 0.75)
        g.fillRoundedRect(-10, -9, 34, 6, 3)
        g.fillRoundedRect(-10, 3, 22, 6, 3)
        node.add(g)
        palco.add(node)

        node.setScale(0.6).setAlpha(0)
        await FX.to(scene, node, { scale: 1, alpha: 1 }, { duration: 180 })
        await FX.wait(scene, 180)
        await FX.all(
            FX.to(scene, node, { y: 360, x: 150, angle: 52, alpha: 0 },
                { duration: 620, ease: Ease.anticipate(0.4) }),
            FX.shake(scene, container, { amount: 7, times: 2 }),
        )
    }

    /** Um balão sobe até o autor e volta com a resposta. */
    const balaoPergunta = async (ok: boolean) => {
        const tom = cor(ok)
        const node = scene.add.container(120, -110)
        const g = scene.add.graphics()
        g.fillStyle(C.ficha, 1)
        g.fillCircle(0, 0, 34)
        g.lineStyle(5, tom, 1)
        g.strokeCircle(0, 0, 34)
        const t = scene.add.text(0, -2, '?', {
            fontFamily: FONT.black, fontSize: '34px', color: hex(tom),
        }).setOrigin(0.5).setResolution(2)
        node.add([g, t])
        node.setScale(0.3).setAlpha(0)
        palco.add(node)

        await FX.to(scene, node, { scale: 1, alpha: 1, y: -220 },
            { duration: 380, ease: Ease.back(1.6) })
        await FX.wait(scene, 340)
        t.setText(ok ? '✓' : '!')
        void FX.impact(scene, node, 0.2)
        await FX.wait(scene, 260)
        await FX.to(scene, node, { y: -110, alpha: 0 }, { duration: 320 })
        if (ok) void FX.sparks(scene, FICHA.cx, FICHA.cy - 110, { color: tom, count: 14, spread: 130 })
    }

    /** Nada acontece: o arquivo esfria e uma ampulheta gira em cima. */
    const travar = async () => {
        const veu = scene.add.graphics()
        veu.fillStyle(C.rackDark, 0.62)
        veu.fillRoundedRect(-FICHA.w / 2, -FICHA.h / 2, FICHA.w, FICHA.h, FICHA.r)
        veu.setAlpha(0)
        palco.add(veu)

        const amp = scene.add.graphics().setPosition(0, 0).setAlpha(0)
        amp.fillStyle(C.alerta, 1)
        amp.fillRoundedRect(-26, -36, 52, 9, 4)
        amp.fillRoundedRect(-26, 27, 52, 9, 4)
        amp.fillTriangle(-19, -27, 19, -27, 0, 0)
        amp.fillTriangle(-19, 27, 19, 27, 0, 0)
        palco.add(amp)

        await FX.all(
            FX.to(scene, veu, { alpha: 1 }, { duration: 280 }),
            FX.to(scene, amp, { alpha: 1 }, { duration: 280 }),
        )
        await FX.to(scene, amp, { angle: 180 }, { duration: 620, ease: Ease.smooth })
        await FX.to(scene, amp, { angle: 360 }, { duration: 620, ease: Ease.smooth })
    }

    /** Um escudo cresce e fecha sobre o arquivo. */
    const escudar = async (ok: boolean) => {
        const tom = cor(ok)
        const g = scene.add.graphics()
        g.fillStyle(tom, 0.22)
        g.fillRoundedRect(-96, -112, 192, 132, 26)
        g.fillTriangle(-96, 14, 96, 14, 0, 122)
        g.lineStyle(8, tom, 1)
        g.strokeRoundedRect(-96, -112, 192, 132, 26)
        g.lineStyle(10, tom, 1)
        g.beginPath()
        g.moveTo(-36, -18)
        g.lineTo(-8, 14)
        g.lineTo(44, -50)
        g.strokePath()
        g.setScale(0.2).setAlpha(0)
        palco.add(g)

        await FX.to(scene, g, { scale: 1, alpha: 1 }, { duration: 380, ease: Ease.back(1.8) })
        void FX.ping(scene, FICHA.cx, FICHA.cy, tom, { radius: 190 })
        await FX.wait(scene, 300)
    }

    /** O cadeado da etiqueta abre. */
    const abrirCadeado = async (ok: boolean) => {
        const tom = cor(ok)
        const node = scene.add.container(0, 20)
        const corpo = scene.add.graphics()
        corpo.fillStyle(C.ficha, 1)
        corpo.fillRoundedRect(-46, -14, 92, 74, 12)
        corpo.lineStyle(6, tom, 1)
        corpo.strokeRoundedRect(-46, -14, 92, 74, 12)
        corpo.fillStyle(tom, 1)
        corpo.fillCircle(0, 22, 11)
        const arco = scene.add.graphics().setPosition(0, -14)
        arco.lineStyle(12, tom, 1)
        arco.beginPath()
        arco.arc(0, 0, 27, Math.PI, 0, false)
        arco.strokePath()
        node.add([arco, corpo])
        node.setScale(0.4).setAlpha(0)
        palco.add(node)

        await FX.to(scene, node, { scale: 1, alpha: 1 }, { duration: 300, ease: Ease.back(1.7) })
        // o arco levanta e gira para o lado: o cadeado abriu
        await FX.to(scene, arco, { x: 24, y: -34, angle: 34 }, { duration: 340, ease: Ease.back(1.4) })
        void FX.sparks(scene, FICHA.cx, FICHA.cy, { color: tom, count: 20, spread: 190 })
        await FX.wait(scene, 300)
    }

    /** Cópias escapam pelas bordas da tela. */
    const vazar = async () => {
        const destinos: Array<[number, number]> = [
            [-520, -300], [-460, 300], [700, -260],
            [760, 220], [120, -420], [180, 340],
        ]
        await FX.all(
            FX.shake(scene, container, { amount: 8, times: 2 }),
            ...destinos.map(([dx, dy], i) => {
                const m = miniFicha(0, 0, 0.55)
                return FX.to(scene, m, {
                    x: dx, y: dy, angle: (i % 2 === 0 ? 1 : -1) * 34, alpha: 0, scale: 0.3,
                }, { duration: 760, delay: i * 60, ease: Ease.anticipate(0.35) })
                    .then(() => m.destroy())
            }),
        )
    }

    /** Sai um elo de corrente em vez do arquivo. */
    const mandarLink = async (ok: boolean) => {
        const tom = cor(ok)
        const g = scene.add.graphics().setPosition(0, 0)
        g.lineStyle(11, tom, 1)
        g.strokeRoundedRect(-46, -18, 52, 36, 18)
        g.strokeRoundedRect(-6, -18, 52, 36, 18)
        g.setScale(0.4).setAlpha(0)
        palco.add(g)

        await FX.to(scene, g, { scale: 1, alpha: 1 }, { duration: 260, ease: Ease.back(1.8) })
        await FX.arcTo(scene, g, { x: 620, y: -160 }, { height: 120, duration: 620 })
        await FX.to(scene, g, { alpha: 0, scale: 0.4 }, { duration: 220 })
        if (ok) void FX.sparks(scene, FICHA.cx + 620, FICHA.cy - 160, { color: tom, count: 14, spread: 140 })
    }

    /** O arquivo se duplica e a cópia fica para trás. */
    const duplicar = async () => {
        const m = miniFicha(0, 0, 1)
        m.setAlpha(0.001)
        await FX.to(scene, m, { alpha: 1 }, { duration: 160 })
        await FX.to(scene, m, { x: 74, y: 132, angle: 9, scale: 0.62 },
            { duration: 520, ease: Ease.back(1.2) })
        await FX.all(
            FX.shake(scene, m, { amount: 5, times: 2 }),
            FX.ping(scene, FICHA.cx + 74, FICHA.cy + 132, C.alerta, { radius: 110 }),
        )
        await FX.wait(scene, 220)
    }

    /** Uma pasta sobe, cobre o arquivo e o cadeado fecha. */
    const guardar = async (ok: boolean) => {
        const tom = cor(ok)
        const pasta = scene.add.graphics().setPosition(0, FICHA.h)
        pasta.fillStyle(C.shadow, 0.34)
        pasta.fillRoundedRect(-152, -128, 304, 264, 20)
        pasta.fillStyle(C.rackLight, 1)
        pasta.fillRoundedRect(-158, -150, 130, 34, 10)
        pasta.fillRoundedRect(-158, -134, 316, 270, 18)
        pasta.fillStyle(C.white, 0.1)
        pasta.fillRoundedRect(-144, -120, 288, 22, 10)
        pasta.lineStyle(5, tom, 1)
        pasta.strokeRoundedRect(-158, -134, 316, 270, 18)
        palco.add(pasta)

        await FX.to(scene, pasta, { y: 30 }, { duration: 460, ease: Ease.back(1.1) })

        const cad = scene.add.container(0, 30)
        const corpo = scene.add.graphics()
        corpo.fillStyle(tom, 1)
        corpo.fillRoundedRect(-38, -10, 76, 62, 10)
        corpo.fillStyle(C.verso, 1)
        corpo.fillCircle(0, 20, 9)
        const arco = scene.add.graphics().setPosition(0, -46)
        arco.lineStyle(11, tom, 1)
        arco.beginPath()
        arco.arc(0, 0, 23, Math.PI, 0, false)
        arco.strokePath()
        cad.add([arco, corpo])
        palco.add(cad)

        cad.setScale(0.5).setAlpha(0)
        await FX.to(scene, cad, { scale: 1, alpha: 1 }, { duration: 240, ease: Ease.back(1.8) })
        // o arco desce e tranca
        await FX.to(scene, arco, { y: -10 }, { duration: 220, ease: Ease.back(2.4) })
        void FX.impact(scene, cad, 0.16)
        if (ok) void FX.sparks(scene, FICHA.cx, FICHA.cy + 30, { color: tom, count: 18, spread: 170 })
        await FX.wait(scene, 300)
    }

    /** O arquivo fica largado, e olhos aparecem em volta. */
    const largar = async () => {
        const olho = (x: number, y: number) => {
            const g = scene.add.graphics().setPosition(x, y).setScale(0.2).setAlpha(0)
            g.fillStyle(C.ficha, 1)
            g.fillEllipse(-22, 0, 42, 30)
            g.fillEllipse(22, 0, 42, 30)
            g.fillStyle(C.alerta, 1)
            g.fillCircle(-22, 0, 9)
            g.fillCircle(22, 0, 9)
            g.fillStyle(C.verso, 1)
            g.fillCircle(-22, 0, 4)
            g.fillCircle(22, 0, 4)
            palco.add(g)
            return g
        }

        const olhos = [olho(-210, -130), olho(226, -46), olho(-186, 190)]
        await FX.all(
            FX.shake(scene, container, { amount: 6, times: 2 }),
            ...olhos.map((g, i) => FX.to(scene, g, { scale: 1, alpha: 1 },
                { duration: 300, delay: 140 * i, ease: Ease.back(2) })),
        )
        await FX.wait(scene, 420)
    }

    /** O arquivo se desfaz em pixels. */
    const desfazer = async (ok: boolean) => {
        const tom = cor(ok)
        const cara = mostrandoVerso ? verso : frente
        const quadros: Phaser.GameObjects.Graphics[] = []

        for (let i = 0; i < 24; i += 1) {
            const col = i % 6
            const row = Math.floor(i / 6)
            const g = scene.add.graphics()
                .setPosition(-132 + col * 53, -150 + row * 74)
            g.fillStyle(mostrandoVerso ? C.verso : C.ficha, 1)
            g.fillRoundedRect(-24, -34, 48, 68, 5)
            g.lineStyle(2, tom, 0.7)
            g.strokeRoundedRect(-24, -34, 48, 68, 5)
            palco.add(g)
            quadros.push(g)
        }

        await FX.to(scene, cara, { alpha: 0 }, { duration: 200 })
        orelha.setVisible(false)
        await FX.all(
            ...quadros.map((g, i) => FX.to(scene, g, {
                x: g.x + Phaser.Math.Between(-160, 160),
                y: g.y + Phaser.Math.Between(-40, 220),
                angle: Phaser.Math.Between(-70, 70),
                alpha: 0, scale: 0.3,
            }, { duration: 620, delay: i * 16, ease: Ease.anticipate(0.4) })
                .then(() => g.destroy())),
        )
        if (ok) void FX.sparks(scene, FICHA.cx, FICHA.cy, { color: tom, count: 20, spread: 220 })
    }

    const reagir = async (efeito: Efeito, ok: boolean): Promise<void> => {
        calarOrelha()
        switch (efeito) {
            case 'credito': return carimboCredito(ok)
            case 'semCredito': return soltarEtiqueta()
            case 'pergunta': return balaoPergunta(ok)
            case 'trava': return travar()
            case 'protege': return escudar(ok)
            case 'libera': return abrirCadeado(ok)
            case 'vaza': return vazar()
            case 'link': return mandarLink(ok)
            case 'copia': return duplicar()
            case 'cofre': return guardar(ok)
            case 'solto': return largar()
            case 'apaga': return desfazer(ok)
        }
    }

    return {
        container,
        virar,
        conferida: () => jaConferiu,
        reagir,
        sair: () => FX.to(scene, container,
            { x: -FICHA.w, angle: -12, alpha: 0 },
            { duration: 420, ease: Ease.anticipate(0.4) }),
        setEnabled: on => {
            enabled = on
            if (!on) calarOrelha()
            orelha.setAlpha(on ? 1 : 0.35)
            if (hit.input) hit.input.cursor = on ? 'pointer' : 'default'
        },
        destroy: () => { calarOrelha(); hit.destroy(); container.destroy() },
    }
}

/* ═══════════════════════════════════════════════════════════ as ações */

export function paintAcao(
    g: Phaser.GameObjects.Graphics,
    { tone }: { tone: number },
) {
    const hw = ACOES.w / 2
    const hh = ACOES.h / 2

    g.clear()
    g.fillStyle(C.shadow, 0.32)
    g.fillRoundedRect(-hw + 4, -hh + 7, ACOES.w, ACOES.h, ACOES.r)
    g.fillStyle(C.painel, 1)
    g.fillRoundedRect(-hw, -hh, ACOES.w, ACOES.h, ACOES.r)
    // a lombada colorida, e o disco onde o ícone mora
    g.fillStyle(tone, 1)
    g.fillRoundedRect(-hw, -hh, 12, ACOES.h, 6)
    g.fillStyle(tone, 0.14)
    g.fillCircle(ACOES.iconeDX, 0, ACOES.iconeR + 12)
    g.fillStyle(C.white, A.gloss)
    g.fillRoundedRect(-hw + 24, -hh + 10, ACOES.w - 44, 12, 6)
    g.lineStyle(3, tone, 0.8)
    g.strokeRoundedRect(-hw, -hh, ACOES.w, ACOES.h, ACOES.r)
}

export interface Acoes {
    container: Phaser.GameObjects.Container
    /**
     * A escolha vira movimento.
     *
     * As duas não escolhidas encolhem e somem; a escolhida VOA em arco até a
     * ficha. É o que liga a decisão à consequência: sem esse trajeto, o cartão
     * sumia aqui e um painel de texto aparecia acolá, e nada dizia que um
     * tinha causado o outro.
     */
    escolher(i: number): Promise<void>
    setEnabled(on: boolean): void
    destroy(): void
}

export function createAcoes(
    scene: Phaser.Scene,
    { pergunta, acoes, tone, onPick }: {
        pergunta: string
        acoes: Acao[]
        tone: number
        onPick: (i: number) => void
    },
): Acoes {
    const container = scene.add.container(0, 0).setDepth(40)

    const titulo = scene.add.text(ACOES.cx, ACOES.perguntaY, pergunta, {
        fontFamily: FONT.black, fontSize: SIZE.pergunta, color: hex(C.paper),
        align: 'center', wordWrap: { width: ACOES.perguntaWrap },
        stroke: hex(C.ink), strokeThickness: 4,
    }).setOrigin(0.5).setResolution(2)
    container.add(titulo)

    /*
     * As zonas de toque são objetos de CENA, fora do container que anima — e é
     * por isso que precisam ser guardadas e destruídas na mão. Sem esta lista,
     * as zonas da missão anterior continuariam comendo os toques da seguinte,
     * invisíveis por cima das opções novas.
     */
    const zones: Phaser.GameObjects.Zone[] = []
    const nodes: Phaser.GameObjects.Container[] = []
    let enabled = true

    acoes.forEach((acao, i) => {
        const y = ACOES.primeiroCY + i * (ACOES.h + ACOES.gap)
        const node = scene.add.container(ACOES.cx, y)

        const g = scene.add.graphics()
        paintAcao(g, { tone })
        node.add(g)

        const icone = scene.add.graphics().setPosition(ACOES.iconeDX, 0)
        paintEfeitoIcone(icone, acao.efeito, tone)
        node.add(icone)

        node.add(scene.add.text(ACOES.textoDX, 0, acao.rotulo, {
            fontFamily: FONT.black, fontSize: SIZE.acao,
            color: hex(C.paper), align: 'center', wordWrap: { width: ACOES.textoWrap },
        }).setOrigin(0.5).setResolution(2))

        container.add(node)
        nodes.push(node)

        node.setAlpha(0)
        void FX.slideIn(scene, node, { dx: 44, dy: 0, duration: 320, delay: i * 90 })

        const hit = scene.add
            .zone(ACOES.cx, y, ACOES.w + ACOES.hitPad, ACOES.h + ACOES.hitPad)
            .setOrigin(0.5).setDepth(62)
        hit.setInteractive({ useHandCursor: true })
        hit.on('pointerover', () => { if (enabled) FX.to(scene, node, { scale: 1.03 }, { duration: 110 }) })
        hit.on('pointerout', () => { if (enabled) FX.to(scene, node, { scale: 1 }, { duration: 110 }) })
        hit.on('pointerup', () => {
            if (!enabled) return
            FX.press(scene, node)
            onPick(i)
        })
        zones.push(hit)
    })

    return {
        container,

        escolher: async i => {
            const escolhido = nodes[i]
            if (!escolhido) return

            const outros = nodes.filter((_, k) => k !== i)
            await FX.all(
                FX.to(scene, titulo, { alpha: 0 }, { duration: 200 }),
                ...outros.map(n => FX.to(scene, n, { alpha: 0, scale: 0.9 }, { duration: 220 })),
            )
            /*
             * O cartão passa POR CIMA da ficha sem precisar de profundidade
             * própria: ele é filho do container das ações, que está em 40, e a
             * ficha inteira está em 35. `setDepth` num filho de container seria
             * inútil aqui — o Phaser só ordena por profundidade dentro do pai
             * quando alguém chama `sort`, e ninguém chama.
             */
            await FX.arcTo(scene, escolhido,
                { x: FICHA.cx, y: FICHA.cy },
                { height: 150, duration: 560 })
            await FX.to(scene, escolhido, { scale: 0.2, alpha: 0 }, { duration: 220 })
        },

        setEnabled: on => {
            enabled = on
            zones.forEach(z => { if (z.input) z.input.cursor = on ? 'pointer' : 'default' })
        },
        destroy: () => { zones.forEach(z => z.destroy()); container.destroy() },
    }
}

/* ═══════════════════════════════════════════════════════════ o impacto */

export interface Impacto {
    container: Phaser.GameObjects.Container
    destroy(): void
}

export function createImpacto(
    scene: Phaser.Scene,
    { certa, texto }: { certa: boolean; texto: string },
): Impacto {
    const container = scene.add.container(0, 0).setDepth(44)
    const tone = certa ? C.ok : C.alerta

    const g = scene.add.graphics()
    g.fillStyle(C.shadow, 0.34)
    g.fillRoundedRect(IMPACTO.cx - IMPACTO.w / 2 + 5, IMPACTO.cy - IMPACTO.h / 2 + 9,
        IMPACTO.w, IMPACTO.h, IMPACTO.r)
    g.fillStyle(C.painel, 0.98)
    g.fillRoundedRect(IMPACTO.cx - IMPACTO.w / 2, IMPACTO.cy - IMPACTO.h / 2,
        IMPACTO.w, IMPACTO.h, IMPACTO.r)
    g.fillStyle(tone, 0.18)
    g.fillRoundedRect(IMPACTO.cx - IMPACTO.w / 2, IMPACTO.cy - IMPACTO.h / 2,
        IMPACTO.w, 62, IMPACTO.r)
    g.lineStyle(4, tone, 1)
    g.strokeRoundedRect(IMPACTO.cx - IMPACTO.w / 2, IMPACTO.cy - IMPACTO.h / 2,
        IMPACTO.w, IMPACTO.h, IMPACTO.r)
    container.add(g)

    container.add(scene.add.text(IMPACTO.cx, IMPACTO.tituloY,
        certa ? 'BOA ESCOLHA' : 'ALERTA DE RISCO', {
        fontFamily: FONT.black, fontSize: SIZE.impactoTitulo, color: hex(tone),
    }).setOrigin(0.5).setResolution(2))

    // origem 0.5/0.5: o texto se centra sozinho no vão abaixo da faixa, tenha
    // ele duas linhas ou cinco
    container.add(scene.add.text(IMPACTO.cx, IMPACTO.textoY, texto, {
        fontFamily: FONT.body, fontStyle: 'bold', fontSize: SIZE.impactoTexto,
        color: hex(C.paper), align: 'center', wordWrap: { width: IMPACTO.textoWrap },
    }).setOrigin(0.5).setResolution(2))

    FX.popIn(scene, container, { from: 0.92, duration: 300 })

    return { container, destroy: () => container.destroy() }
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
        fontFamily: FONT.black, fontSize: SIZE.impactoTexto, color: hex(inkOn(tone)),
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
