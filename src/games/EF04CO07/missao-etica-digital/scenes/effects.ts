import Phaser from 'phaser'
import { FX, Ease } from '../../../../shared/effects/FX'
import { C, A, FONT, SIZE, TYPE_MS, LONGA, hex, inkOn } from '../data/theme'
import {
    W, H, HUD, SITUACAO, FICHA, ACOES, IMPACTO, PAINEL, TOAST,
} from '../data/layout'
import { PRINCIPIOS } from '../data/principios'
import type { Acao, Arquivo, Marca, Principio, TipoArquivo } from '../types'

/*
 * Painters puros e construtores. A GameScene não desenha nada: se ela precisar
 * de um `fillRoundedRect`, falta um painter aqui.
 *
 * Neste jogo as texturas são o CENÁRIO e as três fotos do acervo — que são
 * conteúdo, não interface. Ficha, etiqueta, ação, lâmpada e ícone de tipo têm
 * estado e saem todos de `Graphics`.
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
 * cairia fora, comendo o clique. Vale para a ficha, as ações e os botões daqui.
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
    const drop = 6
    const deep = Phaser.Display.Color.ValueToColor(tone).darken(30).color

    const paint = () => {
        const dy = pressed ? drop : 0
        bg.clear()
        bg.fillStyle(C.shadow, 0.3)
        bg.fillRoundedRect(-w / 2 + 4, -h / 2 + drop + 6, w, h, h / 2)
        bg.fillStyle(enabled ? deep : 0x2c3b42, 1)
        bg.fillRoundedRect(-w / 2, -h / 2, w, h + drop, h / 2)
        bg.fillStyle(enabled ? tone : 0x45565e, 1)
        bg.fillRoundedRect(-w / 2, -h / 2 + dy, w, h, h / 2)
        bg.fillStyle(C.white, enabled ? 0.26 : 0.1)
        bg.fillRoundedRect(-w / 2 + 14, -h / 2 + dy + 8, w - 28, h * 0.26, h / 4)
        bg.lineStyle(4, C.white, enabled ? 0.9 : 0.28)
        bg.strokeRoundedRect(-w / 2, -h / 2 + dy, w, h, h / 2)
        text.setY(-3 + dy)
    }

    container.add([bg, text])
    paint()

    const hit = scene.add.zone(x, y, w + 24, h + 22).setOrigin(0.5).setDepth(51)
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
    g.fillRoundedRect(HUD.x + 4, HUD.y + 6, HUD.w, HUD.h, HUD.r)
    g.fillStyle(C.ink, 0.95)
    g.fillRoundedRect(HUD.x, HUD.y, HUD.w, HUD.h, HUD.r)
    g.fillStyle(C.white, 0.06)
    g.fillRoundedRect(HUD.x + 16, HUD.y + 9, HUD.w - 32, 16, 8)
    g.lineStyle(3, C.edge, 0.9)
    g.strokeRoundedRect(HUD.x, HUD.y, HUD.w, HUD.h, HUD.r)
}

export interface Hud {
    container: Phaser.GameObjects.Container
    setLevel(level: number): void
    setTitle(text: string): void
    setHint(text: string): void
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

    const dots = scene.add.container(0, 0)
    container.add(dots)

    const help = createRoundButton(scene, HUD.helpX, HUD.cy, HUD.helpR, '?', onHelp, C.edge)
    container.add(help.container)

    FX.slideIn(scene, container, { dy: 24, duration: 340 })

    return {
        container,
        setLevel: level => levelLabel.setText(`NÍVEL ${level}`),
        setTitle: text => title.setText(text),
        setHint: text => hint.setText(text),
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
        setHelpEnabled: help.setEnabled,
        destroy: () => { help.destroy(); container.destroy() },
    }
}

/* ═══════════════════════════════════════════════════════ a situação */

export interface Situacao {
    container: Phaser.GameObjects.Container
    show(text: string): Promise<void>
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
        destroy: () => { typing?.skip(); container.destroy() },
    }
}

/* ═══════════════════════════════════════════════════════════ a ficha */

/** O ícone do tipo, para os arquivos que não são imagem. */
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
        // as perfurações do filme
        for (let i = 0; i < 3; i += 1) {
            g.fillRoundedRect(-78, -34 + i * 32, 10, 20, 3)
            g.fillRoundedRect(68, -34 + i * 32, 10, 20, 3)
        }
        return
    }

    // documento: uma folha com linhas e o canto dobrado
    g.fillRoundedRect(-54, -70, 108, 140, 10)
    g.fillStyle(C.verso, 1)
    g.fillTriangle(24, -70, 54, -70, 54, -40)
    g.fillStyle(C.verso, 0.55)
    for (let i = 0; i < 5; i += 1) g.fillRoundedRect(-38, -26 + i * 20, 76, 8, 4)
}

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
    g.fillRect(-hw + 20, FICHA.nomeY - 22, FICHA.w - 40, 2)
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

export interface Ficha {
    container: Phaser.GameObjects.Container
    /** Gira a ficha. Resolve quando a outra cara já está à mostra. */
    virar(): Promise<void>
    /** Se a etiqueta já foi vista alguma vez nesta missão. */
    conferida(): boolean
    setEnabled(on: boolean): void
    destroy(): void
}

export function createFicha(
    scene: Phaser.Scene,
    { arquivo, tone, onVirar }: {
        arquivo: Arquivo
        tone: number
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
    container.add([frente, verso])

    /* ── frente ────────────────────────────────────────────────────── */
    const gf = scene.add.graphics()
    paintFichaFrente(gf, tone)
    frente.add(gf)

    if (arquivo.tipo === 'imagem' && arquivo.arte && hasTex(scene, arquivo.arte)) {
        const img = scene.add.image(0, FICHA.arteCY, arquivo.arte)
        fitImage(img, FICHA.arteW, FICHA.arteH)
        frente.add(img)
    } else {
        // arte ainda não está na pasta, ou o arquivo não é imagem: o ícone do
        // tipo entra no lugar e o jogo continua inteiro
        const icone = scene.add.graphics().setPosition(0, FICHA.arteCY)
        paintTipoIcone(icone, arquivo.tipo, tone)
        frente.add(icone)
    }

    frente.add(scene.add.text(0, FICHA.nomeY, arquivo.nome, {
        fontFamily: FONT.mono, fontStyle: 'bold', fontSize: SIZE.fichaNome,
        color: hex(C.slate), align: 'center', wordWrap: { width: FICHA.nomeWrap },
    }).setOrigin(0.5).setResolution(2))

    frente.add(scene.add.text(0, FICHA.tipoY, arquivo.tipo.toUpperCase(), {
        fontFamily: FONT.black, fontSize: SIZE.fichaTipo, color: hex(C.idle),
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

    /* ── o convite ─────────────────────────────────────────────────── */
    const dica = scene.add.text(0, FICHA.dicaY, 'toque para virar  ↻', {
        fontFamily: FONT.black, fontSize: SIZE.fichaDica, color: hex(tone),
    }).setOrigin(0.5).setResolution(2)
    container.add(dica)

    let mostrandoVerso = false
    let jaConferiu = false
    let enabled = true
    let girando = false

    const hit = scene.add
        .zone(FICHA.cx, FICHA.cy, FICHA.w + FICHA.hitPad, FICHA.h + FICHA.hitPad)
        .setOrigin(0.5).setDepth(60)
    hit.setInteractive({ useHandCursor: true })

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
        scene.tweens.add({
            targets: container, scaleX: 0, duration: 150, ease: 'Sine.easeIn',
            onComplete: () => {
                mostrandoVerso = !mostrandoVerso
                if (mostrandoVerso) jaConferiu = true
                frente.setVisible(!mostrandoVerso)
                verso.setVisible(mostrandoVerso)
                dica.setText(mostrandoVerso ? 'toque para voltar  ↻' : 'toque para virar  ↻')
                scene.tweens.add({
                    targets: container, scaleX: 1, duration: 170, ease: 'Back.easeOut',
                    onComplete: () => { girando = false; resolve() },
                })
            },
        })
    })

    hit.on('pointerover', () => { if (enabled && !girando) FX.to(scene, dica, { scale: 1.12 }, { duration: 120 }) })
    hit.on('pointerout', () => { if (enabled) FX.to(scene, dica, { scale: 1 }, { duration: 120 }) })
    hit.on('pointerup', () => {
        if (!enabled || girando) return
        void virar()
        onVirar()
    })

    // a dica respira até a criança virar a ficha pela primeira vez
    const chama = FX.breathe(scene, dica, { grow: 1.1, duration: 1100 })

    return {
        container,
        virar,
        conferida: () => jaConferiu,
        setEnabled: on => {
            enabled = on
            if (!on) { chama?.remove(); dica.setScale(1) }
            dica.setAlpha(on ? 1 : 0.4)
            if (hit.input) hit.input.cursor = on ? 'pointer' : 'default'
        },
        destroy: () => { chama?.remove(); hit.destroy(); container.destroy() },
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
    g.fillStyle(tone, 1)
    g.fillRoundedRect(-hw, -hh, 12, ACOES.h, 6)
    g.fillStyle(C.white, A.gloss)
    g.fillRoundedRect(-hw + 24, -hh + 10, ACOES.w - 44, 12, 6)
    g.lineStyle(3, tone, 0.8)
    g.strokeRoundedRect(-hw, -hh, ACOES.w, ACOES.h, ACOES.r)
}

export interface Acoes {
    container: Phaser.GameObjects.Container
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

    container.add(scene.add.text(ACOES.cx, ACOES.perguntaY, pergunta, {
        fontFamily: FONT.black, fontSize: SIZE.pergunta, color: hex(C.paper),
        align: 'center', wordWrap: { width: ACOES.perguntaWrap },
        stroke: hex(C.ink), strokeThickness: 4,
    }).setOrigin(0.5).setResolution(2))

    /*
     * As zonas de toque são objetos de CENA, fora do container que anima — e é
     * por isso que precisam ser guardadas e destruídas na mão. Sem esta lista,
     * as zonas da missão anterior continuariam comendo os toques da seguinte,
     * invisíveis por cima das opções novas.
     */
    const zones: Phaser.GameObjects.Zone[] = []
    let enabled = true

    acoes.forEach((acao, i) => {
        const y = ACOES.primeiroCY + i * (ACOES.h + ACOES.gap)
        const node = scene.add.container(ACOES.cx, y)

        const g = scene.add.graphics()
        paintAcao(g, { tone })
        node.add(g)

        node.add(scene.add.text(10, 0, acao.rotulo, {
            fontFamily: FONT.body, fontStyle: 'bold', fontSize: SIZE.acao,
            color: hex(C.paper), align: 'center', wordWrap: { width: ACOES.textoWrap },
        }).setOrigin(0.5).setResolution(2))

        container.add(node)

        node.setAlpha(0)
        FX.to(scene, node, { alpha: 1 }, { duration: 260, delay: i * 90 })
        FX.slideIn(scene, node, { dx: 30, duration: 300, delay: i * 90 })

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
        IMPACTO.w, 64, IMPACTO.r)
    g.lineStyle(4, tone, 1)
    g.strokeRoundedRect(IMPACTO.cx - IMPACTO.w / 2, IMPACTO.cy - IMPACTO.h / 2,
        IMPACTO.w, IMPACTO.h, IMPACTO.r)
    container.add(g)

    container.add(scene.add.text(IMPACTO.cx, IMPACTO.tituloY,
        certa ? 'BOA ESCOLHA' : 'ALERTA DE RISCO', {
        fontFamily: FONT.black, fontSize: SIZE.impactoTitulo, color: hex(tone),
    }).setOrigin(0.5).setResolution(2))

    container.add(scene.add.text(IMPACTO.cx, IMPACTO.textoY, texto, {
        fontFamily: FONT.body, fontStyle: 'bold', fontSize: SIZE.impactoTexto,
        color: hex(C.paper), align: 'center', wordWrap: { width: IMPACTO.textoWrap },
    }).setOrigin(0.5, 0).setResolution(2))

    FX.popIn(scene, container, { from: 0.92, duration: 300 })

    return { container, destroy: () => container.destroy() }
}

/* ═══════════════════════════════════════════════════════════ o painel */

export function paintLampada(
    g: Phaser.GameObjects.Graphics,
    { tone, marca }: { tone: number; marca: Marca },
) {
    const hw = PAINEL.lampW / 2
    const hh = PAINEL.lampH / 2
    const acesa = marca.respeitado
    const cor = marca.alertas > 0 && !acesa ? C.alerta : tone

    g.clear()
    g.fillStyle(acesa ? cor : C.white, acesa ? 0.16 : 0.04)
    g.fillRoundedRect(-hw, -hh, PAINEL.lampW, PAINEL.lampH, PAINEL.lampR)
    g.lineStyle(acesa ? 3 : 2, cor, acesa ? 1 : 0.35)
    g.strokeRoundedRect(-hw, -hh, PAINEL.lampW, PAINEL.lampH, PAINEL.lampR)

    // a bolinha: apagada, acesa, ou acesa com a marca de quem tropeçou no caminho
    const bx = PAINEL.bolaDX
    if (acesa) {
        g.fillStyle(cor, 0.3)
        g.fillCircle(bx, 0, PAINEL.bolaR + 6)
        g.fillStyle(cor, 1)
        g.fillCircle(bx, 0, PAINEL.bolaR)
        g.lineStyle(4, inkOn(cor), 1)
        g.beginPath()
        g.moveTo(bx - 6, 0)
        g.lineTo(bx - 1, 5)
        g.lineTo(bx + 7, -6)
        g.strokePath()
    } else {
        g.fillStyle(C.verso, 1)
        g.fillCircle(bx, 0, PAINEL.bolaR)
        g.lineStyle(2, cor, 0.5)
        g.strokeCircle(bx, 0, PAINEL.bolaR)
    }

    if (marca.alertas <= 0) return
    // os alertas ficam registrados mesmo depois de a lâmpada acender: eles são
    // parte do relatório, não uma punição que some quando a criança acerta
    for (let i = 0; i < Math.min(marca.alertas, 3); i += 1) {
        g.fillStyle(C.alerta, 1)
        g.fillCircle(hw - 18 - i * 15, -hh + 14, 5)
    }
}

export interface Painel {
    container: Phaser.GameObjects.Container
    set(marcas: Record<Principio, Marca>): void
    /** Chama a atenção para a lâmpada que acabou de mudar. */
    destacar(p: Principio): void
    destroy(): void
}

export function createPainel(scene: Phaser.Scene): Painel {
    const container = scene.add.container(0, 0).setDepth(33)

    const bar = scene.add.graphics()
    bar.fillStyle(C.shadow, 0.3)
    bar.fillRoundedRect(PAINEL.x + 4, PAINEL.y + 6, PAINEL.w, PAINEL.h, PAINEL.r)
    bar.fillStyle(C.ink, 0.93)
    bar.fillRoundedRect(PAINEL.x, PAINEL.y, PAINEL.w, PAINEL.h, PAINEL.r)
    bar.lineStyle(3, C.edge, 0.85)
    bar.strokeRoundedRect(PAINEL.x, PAINEL.y, PAINEL.w, PAINEL.h, PAINEL.r)
    container.add(bar)

    const n = PRINCIPIOS.length
    const total = n * PAINEL.lampW + (n - 1) * PAINEL.lampGap
    const startX = W / 2 - total / 2 + PAINEL.lampW / 2

    const nodes = new Map<Principio, {
        node: Phaser.GameObjects.Container
        g: Phaser.GameObjects.Graphics
    }>()

    PRINCIPIOS.forEach((p, i) => {
        const x = startX + i * (PAINEL.lampW + PAINEL.lampGap)
        const node = scene.add.container(x, PAINEL.cy)

        const g = scene.add.graphics()
        node.add(g)

        node.add(scene.add.text(PAINEL.bolaDX + 34, PAINEL.nomeDY, p.nome, {
            fontFamily: FONT.black, fontSize: SIZE.lampadaNome, color: hex(ACCENT[p.key]),
        }).setOrigin(0, 0.5).setResolution(2))

        node.add(scene.add.text(PAINEL.bolaDX + 34, PAINEL.resumoDY, p.resumo, {
            fontFamily: FONT.body, fontStyle: 'bold', fontSize: SIZE.lampadaResumo,
            color: hex(C.idle), wordWrap: { width: PAINEL.lampW - 60 },
        }).setOrigin(0, 0.5).setResolution(2))

        container.add(node)
        nodes.set(p.key, { node, g })
    })

    return {
        container,
        set: marcas => {
            PRINCIPIOS.forEach(p => {
                const item = nodes.get(p.key)
                if (!item) return
                paintLampada(item.g, { tone: ACCENT[p.key], marca: marcas[p.key] })
            })
        },
        destacar: p => {
            const item = nodes.get(p)
            if (!item) return
            FX.kill(scene, item.node)
            item.node.setScale(1)
            FX.to(scene, item.node, { scale: 1.08 },
                { duration: 240, yoyo: true, ease: Ease.back(2.4) })
        },
        destroy: () => container.destroy(),
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
