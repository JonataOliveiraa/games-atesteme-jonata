import Phaser from 'phaser'
import { FX, Ease } from '../../../../shared/effects/FX'
import { C, A, FONT, SIZE, TYPE_MS, LONG_QUESTION, hex } from '../data/theme'
import { W, H, HUD, QUESTION, MACHINE, PANEL, TABLE_UI, TOAST, WIRE } from '../data/layout'
import { TABLE, bitsOf, charOf } from '../data/tabela'
import { BITS, type Entry } from '../types'

/*
 * Painters puros e construtores. A GameScene não desenha nada: se ela precisar
 * de um `fillRoundedRect`, falta um painter aqui.
 *
 * Neste jogo só o CENÁRIO e o ROBÔ são textura. Chaves, lâmpadas, placas,
 * fichas, visor e fio saem todos de `Graphics` — todos mudam de estado, e como
 * PNG virariam dezenas de variantes por peça.
 */

/* ═══════════════════════════════════════════════════════════ texturas */

export const TEX = {
    fundo: 'bg-tradutor',
    robo: 'maquina-esperando',
    roboFeliz: 'maquina-recebeu',
} as const

export const hasTex = (scene: Phaser.Scene, key: string) => scene.textures.exists(key)

/** Encaixa a imagem numa caixa, pela menor razão — nunca estica. */
export function fitImage(img: Phaser.GameObjects.Image, maxW: number, maxH: number) {
    // medido na TEXTURA: os tipos do Phaser deste projeto não expõem `width`
    // em `Image`, e o `tsc` do build reprova
    const src = img.texture.getSourceImage() as { width: number; height: number }
    img.setScale(Math.min(maxW / src.width, maxH / src.height))
}

/* ═══════════════════════════════════════════════════════════ cenário */

/** Sala de máquinas em Graphics, quando a textura não estiver na pasta. */
export function paintRoom(g: Phaser.GameObjects.Graphics) {
    g.clear()
    g.fillStyle(C.ink, 1)
    g.fillRect(0, 0, W, H)

    // painéis da parede: fileiras de retângulos escuros, sempre nos mesmos
    // lugares — parede que muda de desenho a cada repintura vira distração
    g.fillStyle(C.steelDark, 0.55)
    for (let row = 0; row < 4; row += 1) {
        for (let col = 0; col < 9; col += 1) {
            g.fillRoundedRect(30 + col * 140, 40 + row * 180, 116, 150, 10)
        }
    }
    g.fillStyle(C.steel, 0.4)
    for (let i = 0; i < 5; i += 1) g.fillRect(0, 120 + i * 140, W, 6)
}

export function createRoom(scene: Phaser.Scene): void {
    if (!hasTex(scene, TEX.fundo)) {
        const g = scene.add.graphics().setDepth(-20)
        paintRoom(g)
        return
    }

    const bg = scene.add.image(W / 2, H / 2, TEX.fundo).setDepth(-20)
    const src = bg.texture.getSourceImage() as { width: number; height: number }
    bg.setScale(Math.max(W / src.width, H / src.height))

    // o véu existe para o fundo NUNCA competir com as lâmpadas: elas são a
    // informação, e ciano sobre parede clara some
    const veil = scene.add.graphics().setDepth(-19)
    veil.fillStyle(C.ink, A.veil)
    veil.fillRect(0, 0, W, H)
}

/* ═══════════════════════════════════════════════════════════════ HUD */

export function paintHudBar(g: Phaser.GameObjects.Graphics) {
    g.clear()
    g.fillStyle(C.shadow, 0.32)
    g.fillRoundedRect(HUD.x + 4, HUD.y + 7, HUD.w, HUD.h, HUD.r)
    g.fillStyle(C.ink, 0.94)
    g.fillRoundedRect(HUD.x, HUD.y, HUD.w, HUD.h, HUD.r)
    g.fillStyle(C.white, 0.07)
    g.fillRoundedRect(HUD.x + 16, HUD.y + 10, HUD.w - 32, 18, 9)
    g.lineStyle(3, C.bit, 0.55)
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
    pill.fillStyle(C.bitDark, 1)
    pill.fillRoundedRect(HUD.pillX, HUD.pillY, HUD.pillW, HUD.pillH, HUD.pillH / 2)
    pill.fillStyle(C.white, 0.26)
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

    const help = createRoundButton(scene, HUD.helpX, HUD.cy, HUD.helpR, '?', onHelp, C.bitDark)
    container.add(help.container)

    FX.slideIn(scene, container, { dy: 26, duration: 340 })

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
                    g.fillStyle(C.bit, 1)
                    g.fillRoundedRect(x - 14, HUD.cy - 8, 28, 16, 8)
                    g.lineStyle(2, C.white, 0.8)
                    g.strokeRoundedRect(x - 14, HUD.cy - 8, 28, 16, 8)
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
 * cairia fora, comendo o clique. Vale para todo botão, chave e ficha daqui.
 */
export function createRoundButton(
    scene: Phaser.Scene,
    x: number, y: number, r: number,
    label: string,
    onClick: () => void,
    tone = C.bitDark,
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
    setLabel(text: string): void
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
        bg.fillStyle(enabled ? deep : 0x46536b, 1)
        bg.fillRoundedRect(-w / 2, -h / 2, w, h + drop, h / 2)
        bg.fillStyle(enabled ? tone : 0x66748c, 1)
        bg.fillRoundedRect(-w / 2, -h / 2 + dy, w, h, h / 2)
        bg.fillStyle(C.white, enabled ? 0.28 : 0.1)
        bg.fillRoundedRect(-w / 2 + 14, -h / 2 + dy + 10, w - 28, h * 0.28, h / 4)
        bg.lineStyle(4, C.white, enabled ? 0.9 : 0.3)
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
            // Aplicado SEMPRE, mesmo sem mudança: basta o visual e a flag saírem
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

/* ═════════════════════════════════════════════════════════ pergunta */

export interface QuestionLine {
    show(text: string): Promise<void>
    destroy(): void
}

export function createQuestionLine(scene: Phaser.Scene): QuestionLine {
    const label = scene.add.text(QUESTION.cx, QUESTION.cy, '', {
        fontFamily: FONT.black, fontSize: SIZE.question, color: hex(C.paper),
        align: 'center', wordWrap: { width: QUESTION.wrap },
        stroke: hex(C.ink), strokeThickness: 4,
    }).setOrigin(0.5).setResolution(2).setDepth(30)

    let typing: { skip: () => void } | null = null

    return {
        show: async text => {
            typing?.skip()
            label.setFontSize(text.length > LONG_QUESTION ? SIZE.questionLong : SIZE.question)
            // mede com o texto completo antes de escrever, senão a linha
            // cresceria letra a letra e o texto pularia
            label.setText(text)
            label.setText('')
            const tw = FX.type(scene, label, text, { delay: TYPE_MS.question })
            typing = tw
            await tw
            typing = null
        },
        destroy: () => { typing?.skip(); label.destroy() },
    }
}

/* ═════════════════════════════════════════════════════════════ robô */

/** O robô desenhado, quando as PNGs não estiverem na pasta. */
export function paintRobot(g: Phaser.GameObjects.Graphics, happy: boolean) {
    g.clear()

    // antena
    g.lineStyle(7, C.steelLight, 1)
    g.lineBetween(0, -104, 0, -78)
    g.fillStyle(happy ? C.bit : C.edge, 1)
    g.fillCircle(0, -110, 13)

    // cabeça
    g.fillStyle(C.shadow, 0.28)
    g.fillRoundedRect(-84, -74, 168, 148, 34)
    g.fillStyle(C.steel, 1)
    g.fillRoundedRect(-88, -80, 176, 148, 34)
    g.fillStyle(C.steelLight, 0.6)
    g.fillRoundedRect(-78, -70, 60, 128, 26)
    g.lineStyle(5, C.edge, 1)
    g.strokeRoundedRect(-88, -80, 176, 148, 34)

    // olhos
    if (happy) {
        g.lineStyle(9, C.bit, 1)
        g.beginPath(); g.arc(-36, -20, 20, Math.PI, 0, false); g.strokePath()
        g.beginPath(); g.arc(36, -20, 20, Math.PI, 0, false); g.strokePath()
    } else {
        g.fillStyle(C.bit, 1)
        g.fillCircle(-36, -18, 21)
        g.fillCircle(36, -18, 21)
        g.fillStyle(C.white, 0.85)
        g.fillCircle(-42, -25, 7)
        g.fillCircle(30, -25, 7)
    }

    // boca
    g.fillStyle(C.ink, 0.85)
    if (happy) g.fillRoundedRect(-26, 20, 52, 26, 13)
    else g.fillRoundedRect(-22, 28, 44, 10, 5)

    // corpo
    g.fillStyle(C.steelDark, 1)
    g.fillRoundedRect(-58, 66, 116, 42, 18)
    g.fillStyle(C.steelLight, 0.5)
    g.fillRoundedRect(-48, 74, 96, 10, 5)
}

export interface Robot {
    container: Phaser.GameObjects.Container
    setHappy(on: boolean): void
    /** Um pulinho, quando uma letra chega. */
    react(): void
    destroy(): void
}

export function createRobot(scene: Phaser.Scene): Robot {
    const container = scene.add.container(MACHINE.robotCX, MACHINE.robotCY).setDepth(18)

    const useArt = hasTex(scene, TEX.robo) && hasTex(scene, TEX.roboFeliz)
    let art: Phaser.GameObjects.Image | undefined
    let drawn: Phaser.GameObjects.Graphics | undefined

    if (useArt) {
        art = scene.add.image(0, 0, TEX.robo)
        fitImage(art, MACHINE.robotW, MACHINE.robotH)
        container.add(art)
    } else {
        drawn = scene.add.graphics()
        paintRobot(drawn, false)
        container.add(drawn)
    }

    const setHappy = (on: boolean) => {
        if (art) {
            const key = on ? TEX.roboFeliz : TEX.robo
            if (art.texture.key !== key) art.setTexture(key)
            return
        }
        if (drawn) paintRobot(drawn, on)
    }

    const idle = FX.float(scene, container, { amount: 6, duration: 2200 })

    return {
        container,
        setHappy,
        react: () => {
            FX.kill(scene, container)
            container.setScale(1)
            FX.to(scene, container, { scale: 1.08 },
                { duration: 150, yoyo: true, ease: Ease.back(2.4) })
        },
        destroy: () => { idle?.remove(); container.destroy() },
    }
}

/* ════════════════════════════════════════════════════ visor da máquina */

export function paintScreenShell(g: Phaser.GameObjects.Graphics) {
    const x = MACHINE.screenCX - MACHINE.screenW / 2
    const y = MACHINE.screenCY - MACHINE.screenH / 2

    g.clear()
    g.fillStyle(C.shadow, 0.34)
    g.fillRoundedRect(x + 5, y + 9, MACHINE.screenW, MACHINE.screenH, MACHINE.screenR)
    g.fillStyle(C.steel, 1)
    g.fillRoundedRect(x, y, MACHINE.screenW, MACHINE.screenH, MACHINE.screenR)
    g.fillStyle(C.ink, 0.9)
    g.fillRoundedRect(x + 12, y + 12, MACHINE.screenW - 24, MACHINE.screenH - 24, MACHINE.screenR - 6)
    g.lineStyle(4, C.edge, 1)
    g.strokeRoundedRect(x, y, MACHINE.screenW, MACHINE.screenH, MACHINE.screenR)
}

/** O slot de uma letra que chegou: vazio, ou com a letra e o número dela. */
export function paintSlot(
    g: Phaser.GameObjects.Graphics,
    { filled }: { filled: boolean },
) {
    const hw = MACHINE.slotW / 2
    const hh = MACHINE.slotH / 2

    g.clear()
    if (!filled) {
        g.fillStyle(C.white, 0.05)
        g.fillRoundedRect(-hw, -hh, MACHINE.slotW, MACHINE.slotH, MACHINE.slotR)
        g.lineStyle(3, C.edge, 0.75)
        g.strokeRoundedRect(-hw, -hh, MACHINE.slotW, MACHINE.slotH, MACHINE.slotR)
        return
    }
    g.fillStyle(C.slate, 1)
    g.fillRoundedRect(-hw, -hh, MACHINE.slotW, MACHINE.slotH, MACHINE.slotR)
    g.fillStyle(C.white, 0.08)
    g.fillRoundedRect(-hw + 8, -hh + 8, MACHINE.slotW - 16, 16, 8)
    g.lineStyle(3, C.letra, 1)
    g.strokeRoundedRect(-hw, -hh, MACHINE.slotW, MACHINE.slotH, MACHINE.slotR)
}

/** Uma fileira recebida: sete lampadinhas, uma seta, e a letra que a máquina leu. */
export function paintReceivedRow(
    g: Phaser.GameObjects.Graphics,
    bits: boolean[],
    { selected, fixed }: { selected: boolean; fixed: boolean },
) {
    const hw = MACHINE.rowW / 2
    const hh = MACHINE.rowH / 2
    const tone = fixed ? C.ok : selected ? C.letra : C.edge

    g.clear()
    g.fillStyle(C.white, selected || fixed ? 0.1 : 0.04)
    g.fillRoundedRect(-hw, -hh, MACHINE.rowW, MACHINE.rowH, MACHINE.rowR)
    g.lineStyle(selected || fixed ? 4 : 2, tone, selected || fixed ? 1 : 0.7)
    g.strokeRoundedRect(-hw, -hh, MACHINE.rowW, MACHINE.rowH, MACHINE.rowR)

    bits.forEach((on, i) => {
        const x = MACHINE.rowLampX + i * MACHINE.rowLampGap
        if (on) {
            g.fillStyle(C.bit, A.halo)
            g.fillCircle(x, 0, MACHINE.rowLampR + 4)
            g.fillStyle(C.bit, 1)
            g.fillCircle(x, 0, MACHINE.rowLampR)
        } else {
            g.fillStyle(C.off, 1)
            g.fillCircle(x, 0, MACHINE.rowLampR)
            g.lineStyle(2, C.offEdge, 1)
            g.strokeCircle(x, 0, MACHINE.rowLampR)
        }
    })

    // a seta: as lâmpadas viram a letra, e não o contrário
    g.fillStyle(C.idle, 0.9)
    g.fillRect(MACHINE.rowArrowX - 14, -2, 20, 4)
    g.fillTriangle(
        MACHINE.rowArrowX + 4, -8,
        MACHINE.rowArrowX + 4, 8,
        MACHINE.rowArrowX + 16, 0,
    )
}

export interface Screen {
    container: Phaser.GameObjects.Container
    setLabel(text: string): void
    /** Níveis 1 e 2: prepara `n` slots vazios. */
    openSlots(n: number): void
    /** Escreve a letra que acabou de chegar no slot `i`. */
    fillSlot(i: number, char: string, code: number): void
    /** Nível 3: mostra as fileiras que chegaram. */
    openRows(received: string, onPick: (i: number) => void): void
    markRow(i: number, state: 'selected' | 'fixed' | 'none'): void
    setRowChar(i: number, char: string, bits: boolean[]): void
    setRowsEnabled(on: boolean): void
    /** A borda inteira pisca quando o pulso do fio chega. */
    flash(tone: number): void
    destroy(): void
}

export function createScreen(scene: Phaser.Scene): Screen {
    const container = scene.add.container(0, 0).setDepth(20)

    const shell = scene.add.graphics()
    paintScreenShell(shell)
    container.add(shell)

    const label = scene.add.text(MACHINE.screenCX, MACHINE.labelY, '', {
        fontFamily: FONT.black, fontSize: SIZE.screenLabel, color: hex(C.idle),
    }).setOrigin(0.5).setResolution(2)
    container.add(label)

    const glow = scene.add.graphics().setAlpha(0)
    container.add(glow)

    const body = scene.add.container(0, 0)
    container.add(body)

    /*
     * As zonas de toque das fileiras são objetos de CENA, fora do container que
     * anima — e é por isso que elas precisam ser guardadas e destruídas na mão.
     * Sem essa lista, as zonas do caso anterior continuariam comendo os toques
     * do caso seguinte, invisíveis.
     */
    let zones: Phaser.GameObjects.Zone[] = []
    let rowG: Phaser.GameObjects.Graphics[] = []
    let rowChar: Phaser.GameObjects.Text[] = []
    let rowBits: boolean[][] = []
    let rowState: Array<'selected' | 'fixed' | 'none'> = []
    let rowsOn = true

    let slotG: Phaser.GameObjects.Graphics[] = []
    let slotChar: Phaser.GameObjects.Text[] = []
    let slotCode: Phaser.GameObjects.Text[] = []

    const clearBody = () => {
        zones.forEach(z => z.destroy())
        zones = []
        rowG = []; rowChar = []; rowBits = []; rowState = []
        slotG = []; slotChar = []; slotCode = []
        body.removeAll(true)
    }

    const rowY = (i: number) => {
        const step = MACHINE.rowH + MACHINE.rowGap
        return MACHINE.rowsCY + (i - 1) * step
    }

    return {
        container,

        setLabel: text => label.setText(text),

        openSlots: n => {
            clearBody()
            const total = n * MACHINE.slotW + (n - 1) * MACHINE.slotGap
            const startX = MACHINE.screenCX - total / 2 + MACHINE.slotW / 2

            for (let i = 0; i < n; i += 1) {
                const x = startX + i * (MACHINE.slotW + MACHINE.slotGap)
                const g = scene.add.graphics().setPosition(x, MACHINE.slotsCY)
                paintSlot(g, { filled: false })
                body.add(g)
                slotG.push(g)

                const ch = scene.add.text(x, MACHINE.slotsCY + MACHINE.slotCharDY, '', {
                    fontFamily: FONT.black, fontSize: SIZE.slotChar, color: hex(C.letra),
                }).setOrigin(0.5).setResolution(2)
                body.add(ch)
                slotChar.push(ch)

                const cd = scene.add.text(x, MACHINE.slotsCY + MACHINE.slotCodeDY, '', {
                    fontFamily: FONT.mono, fontStyle: 'bold', fontSize: SIZE.slotCode,
                    color: hex(C.numero),
                }).setOrigin(0.5).setResolution(2)
                body.add(cd)
                slotCode.push(cd)
            }
        },

        fillSlot: (i, char, code) => {
            const g = slotG[i]
            if (!g) return
            paintSlot(g, { filled: true })
            slotChar[i]?.setText(char)
            slotCode[i]?.setText(`${code}`)
            FX.kill(scene, g)
            g.setScale(0.7)
            FX.to(scene, g, { scale: 1 }, { duration: 260, ease: Ease.back(2.4) })
            const ch = slotChar[i]
            if (ch) {
                ch.setScale(0.4)
                FX.to(scene, ch, { scale: 1 }, { duration: 300, ease: Ease.back(3) })
            }
        },

        openRows: (received, onPick) => {
            clearBody()

            received.split('').forEach((char, i) => {
                const y = rowY(i)
                const bits = bitsOf(TABLE.find(e => e.char === char)?.code ?? 0)
                rowBits.push(bits)
                rowState.push('none')

                const g = scene.add.graphics().setPosition(MACHINE.screenCX, y)
                paintReceivedRow(g, bits, { selected: false, fixed: false })
                body.add(g)
                rowG.push(g)

                const ch = scene.add.text(MACHINE.screenCX + MACHINE.rowCharX, y, char, {
                    fontFamily: FONT.black, fontSize: SIZE.rowChar, color: hex(C.letra),
                }).setOrigin(0.5).setResolution(2)
                body.add(ch)
                rowChar.push(ch)

                const hit = scene.add
                    .zone(MACHINE.screenCX, y, MACHINE.rowW + 12, MACHINE.rowH + 6)
                    .setOrigin(0.5).setDepth(60)
                hit.setInteractive({ useHandCursor: true })
                hit.on('pointerover', () => {
                    if (rowsOn) FX.to(scene, g, { scale: 1.03 }, { duration: 110 })
                })
                hit.on('pointerout', () => {
                    if (rowsOn) FX.to(scene, g, { scale: 1 }, { duration: 110 })
                })
                hit.on('pointerup', () => { if (rowsOn) onPick(i) })
                zones.push(hit)
            })
        },

        markRow: (i, state) => {
            const g = rowG[i]
            if (!g) return
            rowState[i] = state
            paintReceivedRow(g, rowBits[i], {
                selected: state === 'selected',
                fixed: state === 'fixed',
            })
        },

        setRowChar: (i, char, bits) => {
            rowBits[i] = bits
            rowChar[i]?.setText(char)
            const g = rowG[i]
            if (!g) return
            paintReceivedRow(g, bits, {
                selected: rowState[i] === 'selected',
                fixed: rowState[i] === 'fixed',
            })
        },

        setRowsEnabled: on => {
            rowsOn = on
            zones.forEach(z => { if (z.input) z.input.cursor = on ? 'pointer' : 'default' })
        },

        flash: tone => {
            const x = MACHINE.screenCX - MACHINE.screenW / 2
            const y = MACHINE.screenCY - MACHINE.screenH / 2
            glow.clear()
            glow.lineStyle(6, tone, 1)
            glow.strokeRoundedRect(x, y, MACHINE.screenW, MACHINE.screenH, MACHINE.screenR)
            FX.kill(scene, glow)
            glow.setAlpha(1)
            FX.to(scene, glow, { alpha: 0 }, { duration: 420, ease: Ease.smooth })
        },

        destroy: () => { clearBody(); container.destroy() },
    }
}

/* ═══════════════════════════════════════════════════════════════ fio */

export interface Wire {
    container: Phaser.GameObjects.Container
    /** Manda um pulso do botão até o visor. Resolve quando ele chega. */
    send(tone: number): Promise<void>
    /** O pulso sai, faísca no meio do caminho e volta. */
    fail(): Promise<void>
    destroy(): void
}

export function createWire(scene: Phaser.Scene): Wire {
    const container = scene.add.container(0, 0).setDepth(19)

    const cable = scene.add.graphics()
    cable.lineStyle(12, C.steelDark, 1)
    cable.strokePoints(WIRE.map(([x, y]) => new Phaser.Math.Vector2(x, y)), false)
    cable.lineStyle(6, C.steelLight, 0.9)
    cable.strokePoints(WIRE.map(([x, y]) => new Phaser.Math.Vector2(x, y)), false)
    WIRE.forEach(([x, y], i) => {
        if (i === 0 || i === WIRE.length - 1) {
            cable.fillStyle(C.edge, 1)
            cable.fillCircle(x, y, 11)
            cable.fillStyle(C.steelDark, 1)
            cable.fillCircle(x, y, 6)
        }
    })
    container.add(cable)

    const spark = scene.add.graphics().setVisible(false)
    container.add(spark)

    /** Comprimento acumulado, para o pulso andar em velocidade constante. */
    const legs = WIRE.slice(1).map(([x, y], i) => {
        const [px, py] = WIRE[i]
        return Phaser.Math.Distance.Between(px, py, x, y)
    })
    const total = legs.reduce((s, l) => s + l, 0)

    const pointAt = (t: number): { x: number; y: number } => {
        let walked = t * total
        for (let i = 0; i < legs.length; i += 1) {
            if (walked <= legs[i] || i === legs.length - 1) {
                const k = legs[i] === 0 ? 0 : Phaser.Math.Clamp(walked / legs[i], 0, 1)
                const [ax, ay] = WIRE[i]
                const [bx, by] = WIRE[i + 1]
                return { x: ax + (bx - ax) * k, y: ay + (by - ay) * k }
            }
            walked -= legs[i]
        }
        const [lx, ly] = WIRE[WIRE.length - 1]
        return { x: lx, y: ly }
    }

    const drawSpark = (t: number, tone: number) => {
        if (!spark.active) return
        const p = pointAt(t)
        spark.clear()
        spark.fillStyle(tone, 0.3)
        spark.fillCircle(p.x, p.y, 18)
        spark.fillStyle(tone, 1)
        spark.fillCircle(p.x, p.y, 9)
        spark.fillStyle(C.white, 0.9)
        spark.fillCircle(p.x, p.y, 4)
    }

    const run = (from: number, to: number, duration: number, tone: number) =>
        new Promise<void>(resolve => {
            const s = { t: from }
            spark.setVisible(true)
            scene.tweens.add({
                targets: s, t: to, duration, ease: 'Sine.easeInOut',
                onUpdate: () => drawSpark(s.t, tone),
                onComplete: () => resolve(),
            })
        })

    return {
        container,

        send: async tone => {
            await run(0, 1, 420, tone)
            spark.setVisible(false).clear()
        },

        fail: async () => {
            await run(0, 0.55, 240, C.warn)
            const p = pointAt(0.55)
            void FX.sparks(scene, p.x, p.y, { color: C.warn, count: 12, spread: 120 })
            await run(0.55, 0, 260, C.warn)
            spark.setVisible(false).clear()
        },

        destroy: () => container.destroy(),
    }
}

/* ═══════════════════════════════════════════════ placas de leitura */

export function paintPlate(
    g: Phaser.GameObjects.Graphics,
    { tone, live }: { tone: number; live: boolean },
) {
    const hw = PANEL.plateW / 2
    const hh = PANEL.plateH / 2

    g.clear()
    g.fillStyle(C.shadow, 0.3)
    g.fillRoundedRect(-hw + 4, -hh + 7, PANEL.plateW, PANEL.plateH, PANEL.plateR)
    g.fillStyle(C.steelDark, 1)
    g.fillRoundedRect(-hw, -hh, PANEL.plateW, PANEL.plateH, PANEL.plateR)
    g.fillStyle(C.ink, 0.7)
    g.fillRoundedRect(-hw + 8, -hh + 8, PANEL.plateW - 16, PANEL.plateH - 16, PANEL.plateR - 6)
    g.lineStyle(live ? 4 : 3, tone, live ? 1 : 0.6)
    g.strokeRoundedRect(-hw, -hh, PANEL.plateW, PANEL.plateH, PANEL.plateR)
}

export interface Readout {
    container: Phaser.GameObjects.Container
    /** A letra que a máquina precisa receber agora. */
    setTarget(char: string): void
    setTargetLabel(text: string): void
    /** O que as chaves estão somando neste instante. */
    setMade(code: number): void
    destroy(): void
}

export function createReadout(scene: Phaser.Scene): Readout {
    const container = scene.add.container(0, 0).setDepth(40)

    const leftX = PANEL.cx - PANEL.plateW / 2 - PANEL.plateGap / 2
    const rightX = PANEL.cx + PANEL.plateW / 2 + PANEL.plateGap / 2

    const gL = scene.add.graphics().setPosition(leftX, PANEL.plateCY)
    paintPlate(gL, { tone: C.letra, live: true })
    container.add(gL)

    const gR = scene.add.graphics().setPosition(rightX, PANEL.plateCY)
    paintPlate(gR, { tone: C.numero, live: false })
    container.add(gR)

    const mk = (x: number, dy: number, size: string, color: number, font: string = FONT.black) =>
        scene.add.text(x, PANEL.plateCY + dy, '', {
            fontFamily: font, fontSize: size, color: hex(color),
        }).setOrigin(0.5).setResolution(2)

    const targetLabel = mk(leftX, PANEL.plateLabelDY, SIZE.plateLabel, C.idle, FONT.body)
    targetLabel.setStyle({ fontStyle: 'bold' })
    const targetChar = mk(leftX, PANEL.plateBigDY, SIZE.plateChar, C.letra)

    const madeLabel = mk(rightX, PANEL.plateLabelDY, SIZE.plateLabel, C.idle, FONT.body)
    madeLabel.setStyle({ fontStyle: 'bold' }).setText('VOCÊ FEZ')

    const madeNumber = mk(rightX + PANEL.madeNumberDX, PANEL.plateBigDY, SIZE.plateNumber, C.numero, FONT.mono)
    madeNumber.setStyle({ fontStyle: 'bold' })
    const madeEquals = mk(rightX + PANEL.madeEqualsDX, PANEL.plateBigDY, SIZE.plateEquals, C.idle)
    madeEquals.setText('=')
    const madeChar = mk(rightX + PANEL.madeCharDX, PANEL.plateBigDY, SIZE.plateChar, C.letra)

    container.add([targetLabel, targetChar, madeLabel, madeNumber, madeEquals, madeChar])

    return {
        container,

        setTarget: char => {
            targetChar.setText(char)
            FX.kill(scene, targetChar)
            targetChar.setScale(0.5)
            FX.to(scene, targetChar, { scale: 1 }, { duration: 300, ease: Ease.back(3) })
        },

        setTargetLabel: text => targetLabel.setText(text),

        setMade: code => {
            madeNumber.setText(`${code}`)
            /*
             * Nem todo número é letra, e a placa DIZ isso.
             *
             * Mostrar "?" quando a soma cai fora da tabela é metade da aula:
             * a máquina não inventa um caractere para um número qualquer, ela
             * só reconhece o que foi combinado.
             */
            const ch = charOf(code)
            madeChar.setText(ch ?? '?')
            madeChar.setColor(hex(ch ? C.letra : C.idle))
            paintPlate(gR, { tone: C.numero, live: code > 0 })
        },

        destroy: () => container.destroy(),
    }
}

/* ═══════════════════════════════════════════════════════════ chaves */

/**
 * Uma chave.
 *
 * Lâmpada, dígito e valor são a MESMA peça e um toque só resolve os três. Já
 * foram três coisas separadas — um painel de lâmpadas, uma linha de dígitos e
 * uma fileira de botões — e a criança tinha que descobrir sozinha que a
 * terceira mexia nas duas primeiras.
 */
export function paintSwitch(
    g: Phaser.GameObjects.Graphics,
    { on, enabled }: { on: boolean; enabled: boolean },
) {
    const hw = PANEL.colW / 2
    const hh = PANEL.colH / 2

    g.clear()
    g.fillStyle(C.shadow, 0.3)
    g.fillRoundedRect(-hw + 3, -hh + 6, PANEL.colW, PANEL.colH, PANEL.colR)
    g.fillStyle(on ? C.bitDark : C.steelDark, 1)
    g.fillRoundedRect(-hw, -hh, PANEL.colW, PANEL.colH, PANEL.colR)
    g.fillStyle(C.white, A.gloss)
    g.fillRoundedRect(-hw + 8, -hh + 8, PANEL.colW - 16, 14, 7)
    g.lineStyle(3, on ? C.bit : C.edge, enabled ? 1 : 0.5)
    g.strokeRoundedRect(-hw, -hh, PANEL.colW, PANEL.colH, PANEL.colR)

    // a lâmpada
    if (on) {
        g.fillStyle(C.bit, A.halo)
        g.fillCircle(0, PANEL.lampDY, PANEL.lampR + 12)
        g.fillStyle(C.bit, 1)
        g.fillCircle(0, PANEL.lampDY, PANEL.lampR)
        g.fillStyle(C.bitSoft, 0.9)
        g.fillCircle(-PANEL.lampR * 0.3, PANEL.lampDY - PANEL.lampR * 0.34, PANEL.lampR * 0.42)
    } else {
        g.fillStyle(C.off, 1)
        g.fillCircle(0, PANEL.lampDY, PANEL.lampR)
        g.lineStyle(3, C.offEdge, 1)
        g.strokeCircle(0, PANEL.lampDY, PANEL.lampR)
    }

    // o risco que separa o dígito do valor
    g.fillStyle(C.white, 0.14)
    g.fillRect(-hw + 12, PANEL.valueDY - 22, PANEL.colW - 24, 2)
}

export interface SwitchBank {
    container: Phaser.GameObjects.Container
    bits(): boolean[]
    value(): number
    /** Põe as chaves num estado exato, sem disparar `onChange`. */
    set(bits: boolean[]): void
    clear(): void
    setEnabled(on: boolean): void
    /** Sacode o painel inteiro: a soma não bateu. */
    shake(): Promise<void>
    destroy(): void
}

export function createSwitchBank(
    scene: Phaser.Scene,
    { onChange }: { onChange: (bits: boolean[]) => void },
): SwitchBank {
    const container = scene.add.container(0, 0).setDepth(40)

    const bits: boolean[] = BITS.map(() => false)
    let enabled = true

    const zones: Phaser.GameObjects.Zone[] = []
    const cols: Array<{
        node: Phaser.GameObjects.Container
        g: Phaser.GameObjects.Graphics
        digit: Phaser.GameObjects.Text
        value: Phaser.GameObjects.Text
    }> = []

    const colX = (i: number) =>
        PANEL.left + PANEL.colW / 2 + i * (PANEL.colW + PANEL.colGap)

    const repaint = (i: number) => {
        const col = cols[i]
        if (!col) return
        paintSwitch(col.g, { on: bits[i], enabled })
        col.digit.setText(bits[i] ? '1' : '0')
        col.digit.setColor(hex(bits[i] ? C.bitSoft : C.idle))
        col.value.setColor(hex(bits[i] ? C.bit : C.idle))
    }

    const repaintAll = () => bits.forEach((_, i) => repaint(i))

    BITS.forEach((value, i) => {
        const x = colX(i)
        const node = scene.add.container(x, PANEL.colCY)

        const g = scene.add.graphics()
        const digit = scene.add.text(0, PANEL.digitDY, '0', {
            fontFamily: FONT.mono, fontStyle: 'bold', fontSize: SIZE.digit, color: hex(C.idle),
        }).setOrigin(0.5).setResolution(2)
        const label = scene.add.text(0, PANEL.valueDY, `${value}`, {
            fontFamily: FONT.black, fontSize: SIZE.bitValue, color: hex(C.idle),
        }).setOrigin(0.5).setResolution(2)

        node.add([g, digit, label])
        container.add(node)
        cols.push({ node, g, digit, value: label })

        const hit = scene.add
            .zone(x, PANEL.colCY, PANEL.colHitW, PANEL.colHitH)
            .setOrigin(0.5).setDepth(60)
        hit.setInteractive({ useHandCursor: true })
        hit.on('pointerover', () => {
            if (enabled) FX.to(scene, node, { scale: 1.06 }, { duration: 110 })
        })
        hit.on('pointerout', () => {
            if (enabled) FX.to(scene, node, { scale: 1 }, { duration: 110 })
        })
        hit.on('pointerup', () => {
            if (!enabled) return
            bits[i] = !bits[i]
            repaint(i)
            FX.press(scene, node)
            if (bits[i]) {
                void FX.sparks(scene, x, PANEL.colCY + PANEL.lampDY,
                    { color: C.bit, count: 6, spread: 60 })
            }
            onChange([...bits])
        })
        zones.push(hit)
    })

    repaintAll()

    return {
        container,
        bits: () => [...bits],
        value: () => bits.reduce((sum, on, i) => sum + (on ? BITS[i] : 0), 0),

        set: next => {
            next.forEach((on, i) => { bits[i] = !!on })
            repaintAll()
        },

        clear: () => {
            bits.forEach((_, i) => { bits[i] = false })
            repaintAll()
        },

        setEnabled: on => {
            // Repinta SEMPRE, mesmo sem mudança: basta o visual e a flag saírem
            // de sincronia uma vez para o painel ficar morto até o fim da fase.
            enabled = on
            repaintAll()
            container.setAlpha(on ? 1 : 0.72)
            zones.forEach(z => { if (z.input) z.input.cursor = on ? 'pointer' : 'default' })
        },

        shake: () => FX.shake(scene, container, { amount: 9, times: 3 }),

        destroy: () => { zones.forEach(z => z.destroy()); container.destroy() },
    }
}

/* ══════════════════════════════════════════════════════════ tabela */

export function paintChip(
    g: Phaser.GameObjects.Graphics,
    { lit }: { lit: boolean },
) {
    const hw = TABLE_UI.chipW / 2
    const hh = TABLE_UI.chipH / 2

    g.clear()
    g.fillStyle(C.shadow, 0.28)
    g.fillRoundedRect(-hw + 3, -hh + 5, TABLE_UI.chipW, TABLE_UI.chipH, TABLE_UI.chipR)
    g.fillStyle(lit ? C.paper : C.steelDark, 1)
    g.fillRoundedRect(-hw, -hh, TABLE_UI.chipW, TABLE_UI.chipH, TABLE_UI.chipR)
    g.fillStyle(C.white, lit ? 0.5 : 0.06)
    g.fillRoundedRect(-hw + 7, -hh + 7, TABLE_UI.chipW - 14, 12, 6)
    g.lineStyle(lit ? 4 : 2, lit ? C.letra : C.edge, 1)
    g.strokeRoundedRect(-hw, -hh, TABLE_UI.chipW, TABLE_UI.chipH, TABLE_UI.chipR)
}

export interface TableStrip {
    container: Phaser.GameObjects.Container
    /** Acende a ficha de um caractere. `null` apaga todas. */
    highlight(char: string | null): void
    setEnabled(on: boolean): void
    destroy(): void
}

export function createTableStrip(
    scene: Phaser.Scene,
    { onPick }: { onPick: (entry: Entry) => void },
): TableStrip {
    const container = scene.add.container(0, 0).setDepth(35)

    const bar = scene.add.graphics()
    bar.fillStyle(C.shadow, 0.3)
    bar.fillRoundedRect(TABLE_UI.barX + 4, TABLE_UI.barY + 6, TABLE_UI.barW, TABLE_UI.barH, TABLE_UI.barR)
    bar.fillStyle(C.ink, 0.9)
    bar.fillRoundedRect(TABLE_UI.barX, TABLE_UI.barY, TABLE_UI.barW, TABLE_UI.barH, TABLE_UI.barR)
    bar.lineStyle(3, C.edge, 0.8)
    bar.strokeRoundedRect(TABLE_UI.barX, TABLE_UI.barY, TABLE_UI.barW, TABLE_UI.barH, TABLE_UI.barR)
    container.add(bar)

    /*
     * As reticências não são enfeite: esta é uma FATIA da tabela, e a criança
     * precisa saber que existe mundo além do A e do U. Custa dois textos.
     */
    const dots = (x: number) => scene.add.text(x, TABLE_UI.cy, '…', {
        fontFamily: FONT.black, fontSize: SIZE.chipDots, color: hex(C.idle),
    }).setOrigin(0.5).setResolution(2)
    container.add([dots(TABLE_UI.dotsLeftX), dots(TABLE_UI.dotsRightX)])

    const total = TABLE.length * TABLE_UI.chipW + (TABLE.length - 1) * TABLE_UI.chipGap
    const startX = W / 2 - total / 2 + TABLE_UI.chipW / 2

    const zones: Phaser.GameObjects.Zone[] = []
    const chips: Array<{
        node: Phaser.GameObjects.Container
        g: Phaser.GameObjects.Graphics
        char: Phaser.GameObjects.Text
        code: Phaser.GameObjects.Text
    }> = []

    let enabled = true
    let lit: string | null = null

    const repaint = () => {
        chips.forEach((chip, i) => {
            const on = TABLE[i].char === lit
            paintChip(chip.g, { lit: on })
            chip.char.setColor(hex(on ? C.letraDark : C.letra))
            chip.code.setColor(hex(on ? C.numeroDark : C.numero))
        })
    }

    TABLE.forEach((entry, i) => {
        const x = startX + i * (TABLE_UI.chipW + TABLE_UI.chipGap)
        const node = scene.add.container(x, TABLE_UI.cy)

        const g = scene.add.graphics()
        const char = scene.add.text(0, TABLE_UI.charDY, entry.char, {
            fontFamily: FONT.black, fontSize: SIZE.chipChar, color: hex(C.letra),
        }).setOrigin(0.5).setResolution(2)
        const code = scene.add.text(0, TABLE_UI.codeDY, `${entry.code}`, {
            fontFamily: FONT.mono, fontStyle: 'bold', fontSize: SIZE.chipCode, color: hex(C.numero),
        }).setOrigin(0.5).setResolution(2)

        node.add([g, char, code])
        container.add(node)
        chips.push({ node, g, char, code })

        const hit = scene.add
            .zone(x, TABLE_UI.cy, TABLE_UI.chipW + TABLE_UI.hitPad, TABLE_UI.chipH + TABLE_UI.hitPad)
            .setOrigin(0.5).setDepth(60)
        hit.setInteractive({ useHandCursor: true })
        hit.on('pointerover', () => {
            if (enabled) FX.to(scene, node, { scale: 1.08 }, { duration: 110 })
        })
        hit.on('pointerout', () => {
            if (enabled) FX.to(scene, node, { scale: 1 }, { duration: 110 })
        })
        hit.on('pointerup', () => {
            if (!enabled) return
            FX.press(scene, node)
            onPick(entry)
        })
        zones.push(hit)
    })

    repaint()

    return {
        container,

        highlight: char => {
            lit = char
            repaint()
            if (!char) return
            const i = TABLE.findIndex(e => e.char === char)
            const chip = chips[i]
            if (!chip) return
            FX.kill(scene, chip.node)
            chip.node.setScale(1)
            FX.to(scene, chip.node, { scale: 1.14 },
                { duration: 220, yoyo: true, ease: Ease.back(2) })
        },

        setEnabled: on => {
            enabled = on
            zones.forEach(z => { if (z.input) z.input.cursor = on ? 'pointer' : 'default' })
        },

        destroy: () => { zones.forEach(z => z.destroy()); container.destroy() },
    }
}

/* ═════════════════════════════════════════════════════════════ toast */

export function showToast(
    scene: Phaser.Scene,
    message: string,
    tone: number,
    life = 2400,
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
        fontFamily: FONT.black, fontSize: SIZE.toast, color: hex(C.white),
        align: 'center', wordWrap: { width: TOAST.w - 52 },
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
