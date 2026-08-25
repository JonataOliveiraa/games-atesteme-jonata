import Phaser from 'phaser'
import { FX, Ease } from '../../../../shared/effects/FX'
import { C, A, FONT, SIZE, TYPE_MS, LONG_QUESTION, hex, inkOn } from '../data/theme'
import { W, H, HUD, QUESTION, GRID, LEGENDA, CARDS, TOAST } from '../data/layout'
import { FORMATOS, SIGLA, TINTAS } from '../data/tintas'
import type { Face, Formato, Tinta } from '../types'

/*
 * Painters puros e construtores. A GameScene não desenha nada: se ela precisar
 * de um `fillRoundedRect`, falta um painter aqui.
 *
 * Neste jogo só o CENÁRIO é textura. Célula, ficha da legenda, carta de
 * formato, visto de linha certa — tudo tem estado, e estado é trabalho de
 * `Graphics`. A versão antiga tinha um PNG de 1,1 MB para desenhar UMA célula.
 */

/* ═══════════════════════════════════════════════════════════ cenário */

export const TEX = { fundo: 'bg-atelie' } as const

export const hasTex = (scene: Phaser.Scene, key: string) => scene.textures.exists(key)

/** Parede de ateliê em Graphics, quando a textura não estiver na pasta. */
export function paintWall(g: Phaser.GameObjects.Graphics) {
    g.clear()
    g.fillStyle(C.ink, 1)
    g.fillRect(0, 0, W, H)

    // tábuas verticais: posição fixa, senão a parede muda de desenho a cada
    // repintura e a criança acha que alguma coisa aconteceu
    g.fillStyle(C.wood, 0.5)
    for (let i = 0; i < 16; i += 1) g.fillRect(i * 82, 0, 62, H)
    g.fillStyle(C.woodDark, 0.55)
    for (let i = 0; i < 16; i += 1) g.fillRect(i * 82 + 62, 0, 20, H)

    // duas prateleiras vazias
    g.fillStyle(C.woodLight, 0.45)
    g.fillRoundedRect(0, 168, W, 14, 6)
    g.fillRoundedRect(0, 556, W, 14, 6)
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

    /*
     * O véu é obrigatório aqui, e não é decoração.
     *
     * Neste jogo a COR é o conteúdo: cinza 128, vermelho puro, branco 255. Um
     * fundo com cor própria competiria com a obra, e a criança não saberia
     * mais o que é tinta e o que é parede.
     */
    const veil = scene.add.graphics().setDepth(-19)
    veil.fillStyle(C.ink, A.veil)
    veil.fillRect(0, 0, W, H)
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
    setProgress(done: number, total: number): void
    /** Acende as oficinas deste nível na plaquinha. */
    setOficinas(list: Formato[]): void
    setHelpEnabled(on: boolean): void
    destroy(): void
}

export const ACCENT: Record<Formato, number> = {
    bitmap: C.bitmap,
    cinza: C.cinza,
    cor: C.cor,
    ascii: C.ascii,
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

    /*
     * As abinhas das oficinas.
     *
     * É o "hub" do briefing, sem uma tela de navegação: a criança vê as quatro
     * oficinas o tempo todo e vê qual está aberta. No Nível 3 acendem todas —
     * e isso já diz, sem uma palavra, que a missão final mistura as quatro.
     */
    const tabsG = scene.add.graphics()
    container.add(tabsG)

    const tabX = (i: number) => {
        const n = FORMATOS.length
        const total = n * HUD.tabW + (n - 1) * HUD.tabGap
        return HUD.tabsCX - total / 2 + HUD.tabW / 2 + i * (HUD.tabW + HUD.tabGap)
    }

    const tabTexts = FORMATOS.map((f, i) =>
        scene.add.text(tabX(i), HUD.cy, SIGLA[f.key], {
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

        setOficinas: list => {
            tabsG.clear()
            FORMATOS.forEach((f, i) => {
                const on = list.includes(f.key)
                const x = tabX(i)
                tabsG.fillStyle(on ? ACCENT[f.key] : C.white, on ? 1 : 0.07)
                tabsG.fillRoundedRect(x - HUD.tabW / 2, HUD.cy - HUD.tabH / 2, HUD.tabW, HUD.tabH, HUD.tabR)
                if (on) {
                    tabsG.fillStyle(C.white, 0.24)
                    tabsG.fillRoundedRect(x - HUD.tabW / 2 + 6, HUD.cy - HUD.tabH / 2 + 5, HUD.tabW - 12, 9, 4)
                }
                tabTexts[i].setColor(hex(on ? inkOn(ACCENT[f.key]) : C.idle))
            })
        },

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

/* ══════════════════════════════════════════════════════════ botão */

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
 * cairia fora, comendo o clique. Vale para toda célula, ficha e carta daqui.
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

/* ═════════════════════════════════════════════════════════════ grade */

/**
 * O tamanho da célula sai da CAIXA, não do contrário.
 *
 * As duas grades precisam ocupar exatamente o mesmo retângulo para a criança
 * comparar linha com linha. Então a caixa é fixa em 332px e a célula se ajusta:
 * 6x6 dá célula de 52, 3x3 dá 108 — que é justamente o motivo de "255,0,0"
 * caber escrito dentro de uma célula de cor.
 */
export function cellSizeFor(cols: number, rows: number, maxCell = GRID.maxCell): number {
    const n = Math.max(cols, rows)
    return Phaser.Math.Clamp(
        Math.floor((GRID.box - (n - 1) * GRID.gap) / n),
        GRID.minCell, maxCell,
    )
}

/** A seta entre a encomenda e o quadro: uma coisa vira a outra. */
export function paintFlowArrow(g: Phaser.GameObjects.Graphics, tone: number) {
    const w = GRID.arrowW
    g.clear()
    g.fillStyle(tone, 0.85)
    g.fillRoundedRect(-w / 2, -6, w * 0.62, 12, 6)
    g.fillTriangle(w * 0.1, -18, w * 0.1, 18, w / 2, 0)
}

/**
 * Uma célula.
 *
 * `tinta` indefinida é célula VAZIA, e ela é importante: o quadro começa vazio,
 * não branco. Começar branco seria mentira em três das quatro oficinas — no
 * cinza o primeiro valor é preto, na cor é vermelho — e daria linhas certas de
 * graça antes da criança tocar em nada.
 */
export function paintCell(
    g: Phaser.GameObjects.Graphics,
    cell: number,
    { tinta, face, matched }: { tinta?: Tinta; face: Face; matched: boolean },
) {
    const h = cell / 2

    g.clear()
    if (!tinta) {
        g.fillStyle(C.slot, 0.5)
        g.fillRoundedRect(-h, -h, cell, cell, GRID.r)
        g.fillStyle(C.white, 0.04)
        g.fillCircle(0, 0, cell * 0.16)
    } else if (face === 'imagem') {
        g.fillStyle(C.shadow, 0.24)
        g.fillRoundedRect(-h + 2, -h + 3, cell, cell, GRID.r)
        g.fillStyle(tinta.color, 1)
        g.fillRoundedRect(-h, -h, cell, cell, GRID.r)
    } else {
        g.fillStyle(C.slot, 1)
        g.fillRoundedRect(-h, -h, cell, cell, GRID.r)
    }
    g.lineStyle(matched ? 3 : 2, matched ? C.ok : C.slotEdge, matched ? 1 : 0.85)
    g.strokeRoundedRect(-h, -h, cell, cell, GRID.r)
}

/** O visto que acende ao lado da linha que já bate com a encomenda. */
export function paintCheck(g: Phaser.GameObjects.Graphics, on: boolean) {
    g.clear()
    if (!on) return
    const r = GRID.checkR
    g.fillStyle(C.ok, 1)
    g.fillCircle(0, 0, r)
    g.lineStyle(4, C.white, 1)
    g.beginPath()
    g.moveTo(-r * 0.44, 0)
    g.lineTo(-r * 0.1, r * 0.4)
    g.lineTo(r * 0.5, -r * 0.42)
    g.strokePath()
}

export interface GridView {
    container: Phaser.GameObjects.Container
    cell: number
    set(r: number, c: number, index: number): void
    get(r: number, c: number): number
    values(): number[][]
    markRow(r: number, on: boolean): void
    /** Troca o código pela imagem, célula a célula. O "depois" da codificação. */
    reveal(): Promise<void>
    setEnabled(on: boolean): void
    destroy(): void
}

export function createGrid(
    scene: Phaser.Scene,
    { cx, cy, cols, rows, tintas, face, values, maxCell, onTap }: {
        cx: number; cy: number
        cols: number; rows: number
        tintas: Tinta[]
        face: Face
        values: number[][]
        maxCell?: number
        onTap?: (r: number, c: number) => void
    },
): GridView {
    const container = scene.add.container(0, 0).setDepth(25)

    const cell = cellSizeFor(cols, rows, maxCell)
    const gw = cols * cell + (cols - 1) * GRID.gap
    const gh = rows * cell + (rows - 1) * GRID.gap
    const x0 = cx - gw / 2 + cell / 2
    const y0 = cy - gh / 2 + cell / 2

    const at = (r: number, c: number) => ({
        x: x0 + c * (cell + GRID.gap),
        y: y0 + r * (cell + GRID.gap),
    })

    // moldura: separa a obra da parede, e diz onde uma grade acaba e a outra começa
    const frame = scene.add.graphics()
    frame.fillStyle(C.shadow, 0.3)
    frame.fillRoundedRect(cx - gw / 2 - 10, cy - gh / 2 - 6, gw + 24, gh + 24, 16)
    frame.fillStyle(C.woodDark, 0.92)
    frame.fillRoundedRect(cx - gw / 2 - 14, cy - gh / 2 - 14, gw + 28, gh + 28, 16)
    frame.lineStyle(3, C.edge, 0.9)
    frame.strokeRoundedRect(cx - gw / 2 - 14, cy - gh / 2 - 14, gw + 28, gh + 28, 16)
    container.add(frame)

    const state: number[][] = values.map(row => [...row])
    const faces: Face[] = []
    const cellsG: Phaser.GameObjects.Graphics[] = []
    const cellsT: Phaser.GameObjects.Text[] = []
    const marked: boolean[] = new Array(rows).fill(false)

    /*
     * As zonas de toque são objetos de CENA, fora do container que anima — e é
     * por isso que precisam ser guardadas e destruídas na mão. Sem esta lista,
     * as zonas do caso anterior continuariam comendo os toques do seguinte,
     * invisíveis por cima da grade nova.
     */
    const zones: Phaser.GameObjects.Zone[] = []

    let enabled = true
    const charSize = `${Math.round(cell * 0.42)}px`

    const render = (r: number, c: number) => {
        const i = r * cols + c
        const g = cellsG[i]
        const t = cellsT[i]
        if (!g || !t) return

        const tinta = tintas[state[r][c]]
        const f = faces[i]
        paintCell(g, cell, { tinta, face: f, matched: marked[r] })

        if (!tinta) {
            t.setText('')
        } else if (f === 'imagem') {
            t.setText(tinta.char ?? '')
            t.setColor(hex(inkOn(tinta.color)))
            t.setFontSize(charSize)
            t.setFontFamily(FONT.black)
        } else {
            t.setText(tinta.code)
            t.setColor(hex(C.paper))
            t.setFontSize(tinta.code.length > 4 ? SIZE.cellCodeSmall : SIZE.cellCode)
            t.setFontFamily(FONT.mono)
        }
    }

    for (let r = 0; r < rows; r += 1) {
        for (let c = 0; c < cols; c += 1) {
            const p = at(r, c)
            const g = scene.add.graphics().setPosition(p.x, p.y)
            const t = scene.add.text(p.x, p.y, '', {
                fontFamily: FONT.mono, fontStyle: 'bold', fontSize: SIZE.cellCode,
                color: hex(C.paper),
            }).setOrigin(0.5).setResolution(2)

            container.add([g, t])
            cellsG.push(g)
            cellsT.push(t)
            faces.push(face)
            render(r, c)

            if (!onTap) continue

            const hit = scene.add.zone(p.x, p.y, cell, cell).setOrigin(0.5).setDepth(60)
            hit.setInteractive({ useHandCursor: true })
            hit.on('pointerover', () => { if (enabled) g.setAlpha(0.78) })
            hit.on('pointerout', () => { g.setAlpha(1) })
            hit.on('pointerup', () => { if (enabled) onTap(r, c) })
            zones.push(hit)
        }
    }

    const checks: Phaser.GameObjects.Graphics[] = []
    for (let r = 0; r < rows; r += 1) {
        const p = at(r, cols - 1)
        const g = scene.add.graphics().setPosition(p.x + cell / 2 + GRID.checkDX, p.y)
        paintCheck(g, false)
        container.add(g)
        checks.push(g)
    }

    return {
        container,
        cell,

        set: (r, c, index) => {
            state[r][c] = index
            render(r, c)
            const i = r * cols + c
            const g = cellsG[i]
            if (!g) return
            FX.kill(scene, g)
            g.setScale(0.72)
            FX.to(scene, g, { scale: 1 }, { duration: 190, ease: Ease.back(2.6) })
        },

        get: (r, c) => state[r][c],
        values: () => state.map(row => [...row]),

        markRow: (r, on) => {
            if (marked[r] === on) return
            marked[r] = on
            for (let c = 0; c < cols; c += 1) render(r, c)
            const g = checks[r]
            if (!g) return
            paintCheck(g, on)
            if (!on) return
            FX.kill(scene, g)
            g.setScale(0.3)
            FX.to(scene, g, { scale: 1 }, { duration: 260, ease: Ease.back(3) })
        },

        /*
         * A revelação varre as células na ordem da leitura.
         *
         * É um tween só, com um contador: nada de um `delayedCall` por célula.
         * Trinta e seis timers soltos sobreviveriam a uma troca de caso e
         * pintariam por cima da grade seguinte.
         */
        reveal: () => new Promise<void>(resolve => {
            const total = rows * cols
            if (faces.every(f => f === 'imagem')) { resolve(); return }
            const s = { t: 0 }
            scene.tweens.add({
                targets: s, t: 1, duration: 620, ease: 'Sine.easeInOut',
                onUpdate: () => {
                    const upTo = Math.floor(s.t * total)
                    for (let i = 0; i < upTo; i += 1) {
                        if (faces[i] === 'imagem') continue
                        faces[i] = 'imagem'
                        render(Math.floor(i / cols), i % cols)
                    }
                },
                onComplete: () => {
                    faces.forEach((f, i) => {
                        if (f === 'imagem') return
                        faces[i] = 'imagem'
                        render(Math.floor(i / cols), i % cols)
                    })
                    resolve()
                },
            })
        }),

        setEnabled: on => {
            enabled = on
            container.setAlpha(on ? 1 : 0.8)
            zones.forEach(z => { if (z.input) z.input.cursor = on ? 'pointer' : 'default' })
        },

        destroy: () => { zones.forEach(z => z.destroy()); container.destroy() },
    }
}

/** O rótulo em cima de cada grade. */
export function createGridLabel(scene: Phaser.Scene, cx: number, text: string, tone: number) {
    return scene.add.text(cx, GRID.labelY, text, {
        fontFamily: FONT.black, fontSize: SIZE.panelLabel, color: hex(tone),
    }).setOrigin(0.5).setResolution(2).setDepth(26)
}

/* ═══════════════════════════════════════════════════════════ legenda */

export function paintChip(
    g: Phaser.GameObjects.Graphics,
    w: number,
    { tinta, picked, accent }: { tinta: Tinta; picked: boolean; accent: number },
) {
    const hw = w / 2
    const hh = LEGENDA.chipH / 2

    g.clear()
    g.fillStyle(C.shadow, 0.3)
    g.fillRoundedRect(-hw + 3, -hh + 5, w, LEGENDA.chipH, LEGENDA.chipR)
    g.fillStyle(picked ? C.slate : C.woodDark, 1)
    g.fillRoundedRect(-hw, -hh, w, LEGENDA.chipH, LEGENDA.chipR)

    // a tinta de verdade, para a criança escolher pelo olho e não pelo número
    g.fillStyle(tinta.color, 1)
    g.fillRoundedRect(-hw + 8, -hh + 8, w - 16, LEGENDA.swatchH, LEGENDA.swatchR)

    g.lineStyle(picked ? 4 : 2, picked ? accent : C.edge, picked ? 1 : 0.8)
    g.strokeRoundedRect(-hw, -hh, w, LEGENDA.chipH, LEGENDA.chipR)
}

export interface Legenda {
    container: Phaser.GameObjects.Container
    picked(): number
    setEnabled(on: boolean): void
    destroy(): void
}

export function createLegenda(
    scene: Phaser.Scene,
    { tintas, accent, titulo, onPick }: {
        tintas: Tinta[]
        accent: number
        titulo: string
        onPick: (index: number) => void
    },
): Legenda {
    const container = scene.add.container(0, 0).setDepth(35)

    const bar = scene.add.graphics()
    bar.fillStyle(C.shadow, 0.3)
    bar.fillRoundedRect(LEGENDA.barX + 4, LEGENDA.barY + 6, LEGENDA.barW, LEGENDA.barH, LEGENDA.barR)
    bar.fillStyle(C.ink, 0.92)
    bar.fillRoundedRect(LEGENDA.barX, LEGENDA.barY, LEGENDA.barW, LEGENDA.barH, LEGENDA.barR)
    bar.lineStyle(3, C.edge, 0.85)
    bar.strokeRoundedRect(LEGENDA.barX, LEGENDA.barY, LEGENDA.barW, LEGENDA.barH, LEGENDA.barR)
    container.add(bar)

    /*
     * A legenda tem nome, e o nome diz de qual oficina ela é.
     *
     * Sem isso, a criança que chega no Nível 3 vê a mesma fileira de fichas
     * trocar de conteúdo entre um caso e outro sem nada anunciar a troca.
     */
    container.add(scene.add.text(W / 2, LEGENDA.titleY, titulo, {
        fontFamily: FONT.black, fontSize: SIZE.panelLabel, color: hex(accent),
    }).setOrigin(0.5).setResolution(2))

    const n = tintas.length
    const chipW = Math.min(
        LEGENDA.chipMaxW,
        Math.floor((LEGENDA.chipSpan - (n - 1) * LEGENDA.chipGap) / n),
    )
    const total = n * chipW + (n - 1) * LEGENDA.chipGap
    const startX = W / 2 - total / 2 + chipW / 2

    const zones: Phaser.GameObjects.Zone[] = []
    const chips: Array<{
        node: Phaser.GameObjects.Container
        g: Phaser.GameObjects.Graphics
    }> = []

    let enabled = true
    /*
     * A primeira tinta útil já vem escolhida.
     *
     * No bitmap a legenda tem só `0` e `1`, e obrigar um toque na ficha antes
     * do primeiro toque no quadro seria um passo a mais sem nada em troca. Por
     * isso começa no índice 1 (o preto) quando ele existe: é com ele que se
     * desenha.
     */
    let sel = tintas.length > 1 ? 1 : 0

    const repaint = () => {
        chips.forEach((chip, i) => paintChip(chip.g, chipW, {
            tinta: tintas[i], picked: i === sel, accent,
        }))
    }

    tintas.forEach((tinta, i) => {
        const x = startX + i * (chipW + LEGENDA.chipGap)
        const node = scene.add.container(x, LEGENDA.cy)

        const g = scene.add.graphics()
        node.add(g)

        // a "imagem" da tinta: uma letra, quando a oficina é a das letras
        if (tinta.char) {
            node.add(scene.add.text(0, -LEGENDA.chipH / 2 + 8 + LEGENDA.swatchH / 2, tinta.char, {
                fontFamily: FONT.black, fontSize: SIZE.chipChar, color: hex(inkOn(tinta.color)),
            }).setOrigin(0.5).setResolution(2))
        }

        node.add(scene.add.text(0, LEGENDA.codeDY, tinta.code, {
            fontFamily: FONT.mono, fontStyle: 'bold',
            fontSize: tinta.code.length > 6 ? SIZE.cellCodeSmall : SIZE.chipCode,
            color: hex(C.paper),
        }).setOrigin(0.5).setResolution(2))

        container.add(node)
        chips.push({ node, g })

        const hit = scene.add
            .zone(x, LEGENDA.cy, chipW + LEGENDA.hitPad, LEGENDA.chipH + LEGENDA.hitPad)
            .setOrigin(0.5).setDepth(60)
        hit.setInteractive({ useHandCursor: true })
        hit.on('pointerover', () => { if (enabled) FX.to(scene, node, { scale: 1.06 }, { duration: 110 }) })
        hit.on('pointerout', () => { if (enabled) FX.to(scene, node, { scale: 1 }, { duration: 110 }) })
        hit.on('pointerup', () => {
            if (!enabled) return
            sel = i
            repaint()
            FX.press(scene, node)
            onPick(i)
        })
        zones.push(hit)
    })

    repaint()

    return {
        container,
        picked: () => sel,
        setEnabled: on => {
            enabled = on
            container.setAlpha(on ? 1 : 0.75)
            zones.forEach(z => { if (z.input) z.input.cursor = on ? 'pointer' : 'default' })
        },
        destroy: () => { zones.forEach(z => z.destroy()); container.destroy() },
    }
}

/* ══════════════════════════════════════════════════ cartas de formato */

/** A amostrinha dentro da carta: o formato mostrado, não descrito. */
export function paintSample(g: Phaser.GameObjects.Graphics, formato: Formato) {
    g.clear()
    const tintas = TINTAS[formato]

    if (formato === 'ascii') {
        g.fillStyle(C.paper, 1)
        g.fillRoundedRect(-58, -22, 44, 44, 8)
        g.fillRoundedRect(14, -22, 44, 44, 8)
        return
    }

    if (formato === 'bitmap') {
        const s = 26
        const on = [1, 0, 1, 0, 1, 0, 1, 0, 1]
        for (let i = 0; i < 9; i += 1) {
            const x = -s * 1.5 + (i % 3) * s + 4
            const y = -s * 1.5 + Math.floor(i / 3) * s + 4
            g.fillStyle(tintas[on[i]].color, 1)
            g.fillRoundedRect(x, y, s - 4, s - 4, 4)
        }
        return
    }

    // cinza e cor: uma tirinha das tintas, na ordem da legenda
    const w = 30
    const total = tintas.length * w
    tintas.forEach((t, i) => {
        g.fillStyle(t.color, 1)
        g.fillRoundedRect(-total / 2 + i * w + 2, -20, w - 4, 40, 6)
    })
}

export interface Cards {
    container: Phaser.GameObjects.Container
    setEnabled(on: boolean): void
    /** Sacode a carta que não serve. */
    reject(formato: Formato): Promise<void>
    destroy(): void
}

export function createCards(
    scene: Phaser.Scene,
    { pedido, onPick }: {
        pedido: string
        onPick: (formato: Formato) => void
    },
): Cards {
    const container = scene.add.container(0, 0).setDepth(45)

    container.add(scene.add.text(W / 2, CARDS.pedidoY, pedido, {
        fontFamily: FONT.black, fontSize: SIZE.pedido, color: hex(C.paper),
        align: 'center', wordWrap: { width: CARDS.pedidoWrap },
        stroke: hex(C.ink), strokeThickness: 5,
    }).setOrigin(0.5).setResolution(2))

    const n = FORMATOS.length
    const total = n * CARDS.w + (n - 1) * CARDS.gap
    const startX = W / 2 - total / 2 + CARDS.w / 2

    const zones: Phaser.GameObjects.Zone[] = []
    const nodes = new Map<Formato, Phaser.GameObjects.Container>()
    let enabled = true

    FORMATOS.forEach((f, i) => {
        const x = startX + i * (CARDS.w + CARDS.gap)
        const node = scene.add.container(x, CARDS.cy)
        const tone = ACCENT[f.key]

        const g = scene.add.graphics()
        g.fillStyle(C.shadow, 0.34)
        g.fillRoundedRect(-CARDS.w / 2 + 5, -CARDS.h / 2 + 9, CARDS.w, CARDS.h, CARDS.r)
        g.fillStyle(C.wood, 1)
        g.fillRoundedRect(-CARDS.w / 2, -CARDS.h / 2, CARDS.w, CARDS.h, CARDS.r)
        g.fillStyle(tone, 1)
        g.fillRoundedRect(-CARDS.w / 2, -CARDS.h / 2, CARDS.w, 12, CARDS.r)
        g.fillStyle(C.white, A.gloss)
        g.fillRoundedRect(-CARDS.w / 2 + 12, -CARDS.h / 2 + 18, CARDS.w - 24, 12, 6)
        g.lineStyle(3, tone, 0.9)
        g.strokeRoundedRect(-CARDS.w / 2, -CARDS.h / 2, CARDS.w, CARDS.h, CARDS.r)
        node.add(g)

        node.add(scene.add.text(0, CARDS.nameDY, f.nome, {
            fontFamily: FONT.black, fontSize: SIZE.cardName, color: hex(tone),
        }).setOrigin(0.5).setResolution(2))

        node.add(scene.add.text(0, CARDS.resumoDY, f.resumo, {
            fontFamily: FONT.body, fontStyle: 'bold', fontSize: SIZE.cardResumo,
            color: hex(C.idle), align: 'center', wordWrap: { width: CARDS.w - 30 },
        }).setOrigin(0.5).setResolution(2))

        const sample = scene.add.graphics().setPosition(0, CARDS.sampleDY)
        paintSample(sample, f.key)
        node.add(sample)

        if (f.key === 'ascii') {
            node.add(scene.add.text(-36, CARDS.sampleDY, 'A', {
                fontFamily: FONT.black, fontSize: '26px', color: hex(C.slate),
            }).setOrigin(0.5).setResolution(2))
            node.add(scene.add.text(36, CARDS.sampleDY, '65', {
                fontFamily: FONT.mono, fontStyle: 'bold', fontSize: '20px', color: hex(C.slate),
            }).setOrigin(0.5).setResolution(2))
        }

        container.add(node)
        nodes.set(f.key, node)

        const hit = scene.add
            .zone(x, CARDS.cy, CARDS.w + 12, CARDS.h + 12)
            .setOrigin(0.5).setDepth(60)
        hit.setInteractive({ useHandCursor: true })
        hit.on('pointerover', () => { if (enabled) FX.to(scene, node, { scale: 1.05 }, { duration: 120 }) })
        hit.on('pointerout', () => { if (enabled) FX.to(scene, node, { scale: 1 }, { duration: 120 }) })
        hit.on('pointerup', () => { if (enabled) onPick(f.key) })
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
        fontFamily: FONT.black, fontSize: SIZE.toast, color: hex(inkOn(tone)),
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
