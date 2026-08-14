import Phaser from 'phaser'
import { C, hex, label, chunkyButton, floatingNote, type AppId } from '../ui/kit'
import type { MissionStep } from '../types'
import { FX } from '../../../shared/effects/FX';

/** Área útil dentro da janela, em coordenadas locais do container. */
export interface Area { top: number; h: number; w: number; cy: number }

export interface AppCtx {
    scene: Phaser.Scene
    /** O passo atual, se e somente se ele for deste app. Null = exploração livre. */
    step: MissionStep | null
    /** Avisa o jogo que a ação-chave foi cumprida. */
    done: (actionKey: string) => void
    /** Avisa que o jogador agiu num app que não é o da tarefa. */
    offTask: () => void
}

export interface AppView {
    objects: Phaser.GameObjects.GameObject[]
    /** Chamado a cada frame enquanto a janela estiver aberta. */
    tick?: (dt: number) => void
    dispose?: () => void
}

const fmt = (h: number, m: number) => `${h}:${String(m).padStart(2, '0')}`

// ═══════════════════════════════════════════════════════ RELÓGIO
// Arrastar o ponteiro dos minutos é a diferença: a criança sente a relação
// entre volta completa e uma hora, em vez de apertar +15 quatro vezes.

function drawFace(
    g: Phaser.GameObjects.Graphics, cx: number, cy: number, r: number, detailed: boolean,
) {
    g.fillStyle(C.shadow, 0.12); g.fillCircle(cx, cy + 6, r + 9)
    g.fillStyle(C.paperEdge, 1); g.fillCircle(cx, cy, r + 9)
    g.fillStyle(C.paper, 1); g.fillCircle(cx, cy, r)

    const step = detailed ? 1 : 5
    for (let i = 0; i < 60; i += step) {
        const a = (i * 6 - 90) * Math.PI / 180
        const main = i % 5 === 0
        g.fillStyle(main ? C.skyDeep : C.inkSoft, main ? 1 : 0.3)
        g.fillCircle(cx + Math.cos(a) * (r - r * 0.14), cy + Math.sin(a) * (r - r * 0.14), main ? r * 0.038 : r * 0.016)
    }
}

function drawHands(
    g: Phaser.GameObjects.Graphics, cx: number, cy: number, r: number,
    h: number, m: number, scale = 1,
) {
    const hA = (((h % 12) + m / 60) / 12 * 360 - 90) * Math.PI / 180
    const mA = (m / 60 * 360 - 90) * Math.PI / 180

    g.lineStyle(13 * scale, C.ink, 1)
    g.lineBetween(cx, cy, cx + Math.cos(hA) * (r * 0.5), cy + Math.sin(hA) * (r * 0.5))
    g.lineStyle(9 * scale, C.skyDeep, 1)
    g.lineBetween(cx, cy, cx + Math.cos(mA) * (r - r * 0.22), cy + Math.sin(mA) * (r - r * 0.22))
    g.fillStyle(C.coral, 1); g.fillCircle(cx, cy, 9 * scale)
}


export function clockApp(ctx: AppCtx, area: Area): AppView {
    const s = ctx.scene
    const objects: Phaser.GameObjects.GameObject[] = []
    const cleanups: Array<() => void> = []

    const start = ctx.step?.clockStart ?? { h: 8, m: 45 }
    const target = ctx.step?.clockTarget ?? { h: 9, m: 0 }
    let curH = start.h, curM = start.m
    let lastM = start.m
    let settled = false
    let wasOk = false

    // ── COLUNA ESQUERDA: o relógio grande, único elemento arrastável ───────
    const CX = -158, CY = -6, R = 116

    objects.push(label(s, 0, area.top + 30, 'Arraste o ponteiro azul até a hora certa',
        { size: 21, color: C.ink }))

    const face = s.add.graphics()
    drawFace(face, CX, CY, R, true)
    objects.push(face)

    for (let i = 0; i < 12; i++) {
        const a = (i * 30 - 90) * Math.PI / 180
        objects.push(label(s,
            CX + Math.cos(a) * (R - 36), CY + Math.sin(a) * (R - 36),
            String(i === 0 ? 12 : i), { size: 21, color: C.ink }))
    }

    const ghost = s.add.graphics()
    const hands = s.add.graphics()
    objects.push(ghost, hands)

    // ── COLUNA DIREITA: o alvo mostrado como relógio, não como número ──────
    const RX = 152
    const chipG = s.add.graphics()
    chipG.fillStyle(C.mint, 0.22); chipG.fillRoundedRect(RX - 148, area.top + 58, 296, 250, 24)
    objects.push(chipG)

    objects.push(label(s, RX, area.top + 86, 'PRECISA FICAR ASSIM', { size: 17, color: C.mintDeep }))

    const targetFace = s.add.graphics()
    drawFace(targetFace, RX, -68, 62, false)
    drawHands(targetFace, RX, -68, 62, target.h, target.m, 0.55)
    objects.push(targetFace)

    objects.push(label(s, RX, 16, `${target.h}:${String(target.m).padStart(2, '0')}`,
        { size: 30, color: C.mintDeep }))

    // Leitura da hora atual, grande e separada do alvo
    const nowPill = s.add.graphics()
    nowPill.fillStyle(C.paperEdge, 1); nowPill.fillRoundedRect(RX - 118, 62, 236, 62, 31)
    objects.push(nowPill)
    const digital = label(s, RX, 93, fmt(curH, curM), { size: 38, color: C.skyDeep })
    objects.push(digital)

    // ── Controles de hora, embaixo do relógio a que pertencem ──────────────
    const hourDown = chunkyButton(s, CX - 68, 168, '−1 hora', () => {
        if (settled) return
        curH = curH <= 1 ? 12 : curH - 1; refresh()
    }, { w: 124, h: 54, tone: C.slate, deep: C.slateDeep, size: 18 })

    const hourUp = chunkyButton(s, CX + 68, 168, '+1 hora', () => {
        if (settled) return
        curH = curH >= 12 ? 1 : curH + 1; refresh()
    }, { w: 124, h: 54, tone: C.slate, deep: C.slateDeep, size: 18 })

    const confirm = chunkyButton(s, RX, 178, 'Está certo!', () => {
        if (settled) return
        settled = true
        confirm.setEnabled(false)
        if (!ctx.step) { ctx.offTask(); return }
        FX.seq(
            () => FX.impact(s, face, 0.1),
            () => FX.sparks(s, 640 + CX, 374 + CY, { color: C.mint, count: 24 }),
        )
        ctx.done('set-time')
    }, { w: 236, h: 62, tone: C.mint, deep: C.mintDeep, enabled: false })

    objects.push(hourDown.root, hourUp.root, confirm.root)

    const refresh = () => {
        ghost.clear()
        const tA = (target.m / 60 * 360 - 90) * Math.PI / 180
        ghost.lineStyle(11, C.mint, 0.3)
        ghost.lineBetween(CX, CY, CX + Math.cos(tA) * (R - 26), CY + Math.sin(tA) * (R - 26))

        hands.clear()
        drawHands(hands, CX, CY, R, curH, curM)
        // Alça visível na ponta: é o que diz "isto se pega"
        const mA = (curM / 60 * 360 - 90) * Math.PI / 180
        const hx = CX + Math.cos(mA) * (R - 26), hy = CY + Math.sin(mA) * (R - 26)
        hands.fillStyle(C.skyDeep, 1); hands.fillCircle(hx, hy, 16)
        hands.fillStyle(C.white, 1); hands.fillCircle(hx, hy, 7)

        digital.setText(fmt(curH, curM))
        const ok = curH % 12 === target.h % 12 && curM === target.m
        digital.setColor(hex(ok ? C.mintDeep : C.skyDeep))
        confirm.setEnabled(ok)

        // Encaixe: só dispara na transição, não a cada frame do arrasto
        if (ok && !wasOk) {
            FX.ping(s, 640 + CX, 374 + CY, C.mint, { radius: R + 20 })
            FX.impact(s, digital, 0.2)
        }
        wasOk = ok
    }

    // ── Arrasto: escuta a cena, não a zona, senão o ponteiro "escapa" ──────
    const grab = s.add.zone(CX, CY, R * 2 + 40, R * 2 + 40).setInteractive({ useHandCursor: true })
    objects.push(grab)
    let dragging = false

    const apply = (p: Phaser.Input.Pointer) => {
        const win = grab.parentContainer
        const lx = p.worldX - win.x - CX
        const ly = p.worldY - win.y - CY
        if (Math.hypot(lx, ly) < 20) return
        let deg = Phaser.Math.RadToDeg(Math.atan2(ly, lx)) + 90
        if (deg < 0) deg += 360
        const m = (Math.round(deg / 30) * 5) % 60

        if (m === curM) return
        if (lastM >= 45 && m <= 15) curH = curH % 12 + 1
        else if (lastM <= 15 && m >= 45) curH = curH <= 1 ? 12 : curH - 1
        lastM = m
        curM = m
        refresh()
    }

    grab.on('pointerdown', (p: Phaser.Input.Pointer) => {
        if (settled) return
        dragging = true
        apply(p)
    })
    const onMove = (p: Phaser.Input.Pointer) => { if (dragging && !settled) apply(p) }
    const onUp = () => { dragging = false }
    s.input.on('pointermove', onMove)
    s.input.on('pointerup', onUp)
    cleanups.push(() => { s.input.off('pointermove', onMove); s.input.off('pointerup', onUp) })

    refresh()
    return { objects, dispose: () => cleanups.forEach(fn => fn()) }
}

// ═══════════════════════════════════════════════════════ CALCULADORA
// Sem eval(): parser de duas passadas. Além de seguro, permite mensagem
// específica quando o resultado está errado.

function evalExpr(src: string): number | null {
    const tokens = src.match(/\d+\.?\d*|[+\-x/]/g)
    if (!tokens || !tokens.length) return null

    const stack: Array<number | string> = []
    for (const tk of tokens) {
        if ('+-x/'.includes(tk) && tk.length === 1) { stack.push(tk); continue }
        let n = parseFloat(tk)
        if (!isFinite(n)) return null
        const op = stack[stack.length - 1]
        if (op === 'x' || op === '/') {
            stack.pop()
            const prev = stack.pop()
            if (typeof prev !== 'number') return null
            n = op === 'x' ? prev * n : prev / n
        }
        stack.push(n)
    }

    let acc = stack[0]
    if (typeof acc !== 'number') return null
    for (let i = 1; i < stack.length; i += 2) {
        const op = stack[i], v = stack[i + 1]
        if (typeof v !== 'number') return null
        acc = op === '+' ? acc + v : op === '-' ? acc - v : NaN
    }
    return isFinite(acc as number) ? (acc as number) : null
}

export function calcApp(ctx: AppCtx, area: Area): AppView {
    const s = ctx.scene
    const objects: Phaser.GameObjects.GameObject[] = []
    let expr = ''
    let settled = false

    if (ctx.step?.expectedExpr) {
        const strip = s.add.graphics()
        strip.fillStyle(C.sun, 0.35); strip.fillRoundedRect(-260, area.top + 10, 520, 50, 16)
        objects.push(strip)
        objects.push(label(s, 0, area.top + 35, `Faça esta conta:  ${ctx.step.expectedExpr}`,
            { size: 22, color: C.ink }))
    }

    const visorY = area.top + 92
    const visor = s.add.graphics()
    visor.fillStyle(C.ink, 1); visor.fillRoundedRect(-230, visorY - 32, 460, 64, 14)
    visor.fillStyle(C.mintDeep, 0.25); visor.fillRoundedRect(-224, visorY - 26, 448, 22, 10)
    objects.push(visor)

    const display = s.add.text(206, visorY, '0', {
        fontFamily: 'Courier New, monospace', fontSize: '40px', color: hex(C.mint),
    }).setOrigin(1, 0.5).setResolution(2)
    objects.push(display)

    const show = (v: string, color = C.mint) => {
        display.setText(v.length ? v : '0').setColor(hex(color))
    }

    const KEYS = [
        ['7', '8', '9', '/'],
        ['4', '5', '6', 'x'],
        ['1', '2', '3', '-'],
        ['C', '0', '=', '+'],
    ]
    const BW = 100, BH = 58, GAP = 10
    const gridW = 4 * BW + 3 * GAP
    const x0 = -gridW / 2 + BW / 2
    const y0 = visorY + 64

    const press = (key: string) => {
        if (settled) return

        if (key === 'C') { expr = ''; show(''); return }

        if (key === '=') {
            const result = evalExpr(expr)
            if (result === null) { show('Ops', C.coral); s.cameras.main.shake(120, 0.003); return }

            const want = ctx.step?.expectedAnswer
            if (want !== undefined && result !== want) {
                show(String(result), C.coral)
                s.cameras.main.shake(140, 0.004)
                floatingNote(s, 640, 320, 'Confira a conta', { tone: C.sun, deep: C.sunDeep })
                s.time.delayedCall(1100, () => { expr = ''; show('') })
                return
            }

            show(String(result))
            settled = true
            if (!ctx.step) { ctx.offTask(); return }
            floatingNote(s, 640, 300, `Certinho: ${result}`)
            s.time.delayedCall(320, () => ctx.done('calculate'))
            return
        }

        const isOp = '+-x/'.includes(key)
        const last = expr.slice(-1)
        if (isOp && '+-x/'.includes(last)) expr = expr.slice(0, -1)
        if (isOp && !expr) return
        expr += key
        show(expr)
    }

    KEYS.forEach((row, ri) => row.forEach((key, ci) => {
        const isOp = '+-x/'.includes(key)
        const tone = key === '=' ? C.mint : key === 'C' ? C.coral : isOp ? C.sky : C.paperEdge
        const deep = key === '=' ? C.mintDeep : key === 'C' ? C.coralDeep : isOp ? C.skyDeep : C.paperShade
        const txtColor = tone === C.paperEdge ? C.ink : C.white

        const b = chunkyButton(s, x0 + ci * (BW + GAP), y0 + ri * (BH + GAP), key,
            () => press(key), { w: BW, h: BH, tone, deep, size: 26, textColor: txtColor })
        objects.push(b.root)
    }))

    return { objects }
}

// ═══════════════════════════════════════════════════════ PASTA
// Cada documento tem sua gaveta. Classificar > empilhar: exige ler o rótulo.

export function folderApp(ctx: AppCtx, area: Area): AppView {
    const s = ctx.scene
    const objects: Phaser.GameObjects.GameObject[] = []
    const cleanups: Array<() => void> = []

    const DOCS = [
        { key: 'pasta-doc-matematica', name: 'Matemática', bin: 0 },
        { key: 'pasta-doc-leitura', name: 'Leitura', bin: 1 },
        { key: 'pasta-doc-arte', name: 'Arte', bin: 2 },
    ]
    const BINS = ['Matemática', 'Leitura', 'Arte']
    const BIN_W = 168, BIN_H = 104
    const BIN_Y = area.cy + 92
    const binX = (i: number) => -186 + i * 186

    objects.push(label(s, 0, area.top + 26, 'Leve cada arquivo para a gaveta certa',
        { size: 21, color: C.ink }))

    const binsG = s.add.graphics()
    objects.push(binsG)
    const filled = [false, false, false]
    let hovered = -1

    const drawBins = () => {
        binsG.clear()
        BINS.forEach((_, i) => {
            const x = binX(i), on = hovered === i, ok = filled[i]
            binsG.fillStyle(C.shadow, 0.10)
            binsG.fillRoundedRect(x - BIN_W / 2, BIN_Y - BIN_H / 2 + 6, BIN_W, BIN_H, 16)
            binsG.fillStyle(ok ? C.mint : on ? C.sun : C.paperEdge, ok ? 0.9 : on ? 0.75 : 1)
            binsG.fillRoundedRect(x - BIN_W / 2, BIN_Y - BIN_H / 2, BIN_W, BIN_H, 16)
            binsG.fillStyle(ok ? C.mintDeep : C.sunDeep, ok ? 1 : 0.9)
            binsG.fillRoundedRect(x - BIN_W / 2, BIN_Y - BIN_H / 2, BIN_W * 0.42, 18, { tl: 16, tr: 10, bl: 0, br: 0 })
            binsG.lineStyle(4, ok ? C.mintDeep : on ? C.sunDeep : C.paperShade, 1)
            binsG.strokeRoundedRect(x - BIN_W / 2, BIN_Y - BIN_H / 2, BIN_W, BIN_H, 16)
        })
    }
    drawBins()
    BINS.forEach((name, i) => objects.push(
        label(s, binX(i), BIN_Y + 18, name, { size: 19, color: C.ink })))

    let placed = 0
    const counter = label(s, 0, area.top + 58, '0 de 3 guardados', { size: 18, color: C.inkSoft, weight: 'bold' })
    objects.push(counter)

    const confirm = chunkyButton(s, 0, area.cy + 182, 'Está tudo no lugar', () => {
        if (placed < 3) return
        if (!ctx.step) { ctx.offTask(); return }
        ctx.done('organize-files')
    }, { w: 300, h: 60, tone: C.mint, deep: C.mintDeep, enabled: false })
    objects.push(confirm.root)

    DOCS.forEach((doc, i) => {
        const homeX = -186 + i * 186, homeY = area.top + 130
        const card = s.add.container(homeX, homeY)
        const img = s.add.image(0, 0, doc.key).setDisplaySize(108, 84)
        const tag = label(s, 0, 54, doc.name, { size: 16, color: C.ink })
        const hit = s.add.zone(0, 0, 118, 100).setInteractive({ useHandCursor: true })
        card.add([img, tag, hit])
        objects.push(card)

        let dragging = false, dropped = false, offX = 0, offY = 0

        hit.on('pointerdown', (p: Phaser.Input.Pointer) => {
            if (dropped) return
            const win = card.parentContainer
            dragging = true
            offX = card.x - (p.worldX - win.x)
            offY = card.y - (p.worldY - win.y)
            card.setDepth(50)
            s.tweens.add({ targets: card, scale: 1.12, duration: 120 })
        })

        const move = (p: Phaser.Input.Pointer) => {
            if (!dragging || dropped || !card.active) return
            const win = card.parentContainer
            card.x = p.worldX - win.x + offX
            card.y = p.worldY - win.y + offY
            const over = BINS.findIndex((_, bi) =>
                Math.abs(card.x - binX(bi)) < BIN_W / 2 && Math.abs(card.y - BIN_Y) < BIN_H / 2)
            if (over !== hovered) { hovered = over; drawBins() }
        }

        const up = () => {
            if (!dragging || !card.active) return
            dragging = false
            s.tweens.add({ targets: card, scale: 1, duration: 120 })
            const over = hovered
            hovered = -1; drawBins()

            if (over === doc.bin) {
                dropped = true
                filled[doc.bin] = true
                drawBins()
                placed++
                counter.setText(`${placed} de 3 guardados`)
                s.tweens.add({
                    targets: card, x: binX(doc.bin), y: BIN_Y, scale: 0.35, alpha: 0,
                    duration: 300, ease: 'Back.easeIn',
                })
                if (placed === 3) {
                    confirm.setEnabled(true)
                    floatingNote(s, 640, 340, 'Tudo organizado!')
                }
                return
            }

            if (over >= 0) {
                // gaveta errada: devolve com sacudida, sem punir
                s.cameras.main.shake(110, 0.002)
                floatingNote(s, 640, 300, `${doc.name} vai na gaveta ${doc.name}`,
                    { tone: C.sun, deep: C.sunDeep })
            }
            s.tweens.add({ targets: card, x: homeX, y: homeY, duration: 260, ease: 'Back.easeOut' })
        }

        s.input.on('pointermove', move)
        s.input.on('pointerup', up)
        cleanups.push(() => { s.input.off('pointermove', move); s.input.off('pointerup', up) })
    })

    return { objects, dispose: () => cleanups.forEach(fn => fn()) }
}

// ═══════════════════════════════════════════════════════ GRAVADOR
// Segurar para gravar (como um walkie-talkie) e ouvir antes de salvar.
// O passo "ouvir" transforma apertar botão em compreender o que o app faz.

export function recorderApp(ctx: AppCtx, area: Area): AppView {
    const s = ctx.scene
    const objects: Phaser.GameObjects.GameObject[] = []

    type Phase = 'idle' | 'rec' | 'has' | 'playing'
    let phase: Phase = 'idle'
    let samples: number[] = []
    let recT = 0, playT = 0
    let settled = false

    const status = label(s, 0, area.top + 34, 'Segure o botão para gravar', { size: 22, color: C.inkSoft, weight: 'bold' })
    objects.push(status)

    const waveY = area.cy - 24
    const wave = s.add.graphics()
    objects.push(wave)

    const drawWave = (progress = 1) => {
        wave.clear()
        wave.fillStyle(C.paperEdge, 1)
        wave.fillRoundedRect(-240, waveY - 62, 480, 124, 18)

        if (!samples.length) {
            wave.fillStyle(C.paperShade, 1)
            wave.fillRoundedRect(-224, waveY - 3, 448, 6, 3)
            return
        }
        const n = samples.length
        const bw = Math.max(3, 448 / n - 2)
        samples.forEach((v, i) => {
            const x = -224 + (i / n) * 448
            const lit = i / n <= progress
            wave.fillStyle(lit ? C.coral : C.paperShade, 1)
            const hh = Math.max(4, v * 54)
            wave.fillRoundedRect(x, waveY - hh, bw, hh * 2, bw / 2)
        })
    }
    drawWave()

    const setPhase = (p: Phase) => {
        phase = p
        if (p === 'idle') { status.setText('Segure o botão para gravar').setColor(hex(C.inkSoft)) }
        if (p === 'rec') { status.setText('Gravando...').setColor(hex(C.coralDeep)) }
        if (p === 'has') { status.setText('Ouça e depois salve').setColor(hex(C.skyDeep)) }
        if (p === 'playing') { status.setText('Tocando...').setColor(hex(C.mintDeep)) }
        listen.setEnabled(p === 'has')
        save.setEnabled(p === 'has')
    }

    // Botão de gravar: pressiona e segura.
    const micRoot = s.add.container(0, area.cy + 92)
    const micG = s.add.graphics()
    const micTxt = label(s, 0, 62, 'GRAVAR', { size: 20, color: C.coralDeep })
    const paintMic = (held: boolean) => {
        micG.clear()
        micG.fillStyle(C.coralDeep, 1); micG.fillCircle(0, 6, 52)
        micG.fillStyle(held ? C.coralDeep : C.coral, 1); micG.fillCircle(0, held ? 4 : 0, 52)
        micG.fillStyle(C.white, 0.9)
        micG.fillRoundedRect(-11, (held ? 4 : 0) - 22, 22, 34, 11)
        micG.lineStyle(4, C.white, 0.9)
        micG.beginPath(); micG.arc(0, (held ? 4 : 0) + 4, 20, Math.PI * 0.15, Math.PI * 0.85, false); micG.strokePath()
        micG.fillStyle(C.white, 0.9); micG.fillRect(-2, (held ? 4 : 0) + 22, 4, 10)
    }
    paintMic(false)
    const micHit = s.add.zone(0, 0, 120, 120).setInteractive({ useHandCursor: true })
    micRoot.add([micG, micTxt, micHit])
    objects.push(micRoot)

    micHit.on('pointerdown', () => {
        if (settled || phase === 'playing') return
        samples = []; recT = 0
        setPhase('rec'); paintMic(true)
    })
    const release = () => {
        if (phase !== 'rec') return
        paintMic(false)
        if (samples.length < 6) { samples = []; setPhase('idle'); drawWave(); return }
        setPhase('has'); drawWave()
    }
    micHit.on('pointerup', release)
    micHit.on('pointerout', release)

    const listen = chunkyButton(s, -132, area.cy + 176, 'Ouvir', () => {
        if (phase !== 'has') return
        playT = 0
        setPhase('playing')
    }, { w: 190, h: 58, tone: C.sky, deep: C.skyDeep, enabled: false })

    const save = chunkyButton(s, 132, area.cy + 176, 'Salvar', () => {
        if (phase !== 'has' || settled) return
        settled = true
        setPhase('idle')
        save.setEnabled(false); listen.setEnabled(false)
        if (!ctx.step) { ctx.offTask(); return }
        floatingNote(s, 640, 300, 'Áudio salvo!')
        ctx.done('save-recording')
    }, { w: 190, h: 58, tone: C.mint, deep: C.mintDeep, enabled: false })

    objects.push(listen.root, save.root)

    const tick = (dt: number) => {
        if (phase === 'rec') {
            recT += dt
            if (recT > 70 && samples.length < 46) {
                recT = 0
                samples.push(Phaser.Math.FloatBetween(0.25, 1))
                drawWave()
            }
            micRoot.setScale(1 + Math.sin(s.time.now / 90) * 0.05)
            return
        }
        micRoot.setScale(1)

        if (phase === 'playing') {
            playT += dt
            const total = samples.length * 70
            const p = playT / total
            drawWave(p)
            if (p >= 1) { drawWave(); setPhase('has') }
        }
    }

    return { objects, tick }
}

// ═══════════════════════════════════════════════════════ DESENHO
// Traço real (segmentos), não pontos soltos: o desenho fica contínuo e
// a criança vê a linha que fez.

export function paintApp(ctx: AppCtx, area: Area): AppView {
    const s = ctx.scene
    const objects: Phaser.GameObjects.GameObject[] = []
    const cleanups: Array<() => void> = []

    const CANVAS_W = 460, CANVAS_H = 250
    const CANVAS_Y = area.top + 24 + CANVAS_H / 2
    let color = C.coral
    let brush = 9
    let ink = 0
    let settled = false

    const paper = s.add.image(0, CANVAS_Y, 'desenho-canvas').setDisplaySize(CANVAS_W, CANVAS_H)
    const frame = s.add.graphics()
    frame.lineStyle(6, C.lilacDeep, 1)
    frame.strokeRoundedRect(-CANVAS_W / 2, CANVAS_Y - CANVAS_H / 2, CANVAS_W, CANVAS_H, 14)
    objects.push(paper, frame)

    const strokes = s.add.graphics()
    objects.push(strokes)

    const hint = label(s, 0, CANVAS_Y, 'desenhe aqui', { size: 20, color: C.inkSoft, weight: 'bold' })
    hint.setAlpha(0.5)
    objects.push(hint)

    let drawing = false
    let lx = 0, ly = 0

    const inside = (x: number, y: number) =>
        Math.abs(x) < CANVAS_W / 2 - 4 &&
        Math.abs(y - CANVAS_Y) < CANVAS_H / 2 - 4

    const local = (p: Phaser.Input.Pointer) => {
        const win = paper.parentContainer
        return { x: p.worldX - win.x, y: p.worldY - win.y }
    }

    const zone = s.add.zone(0, CANVAS_Y, CANVAS_W, CANVAS_H).setInteractive({ cursor: 'crosshair' })
    objects.push(zone)

    zone.on('pointerdown', (p: Phaser.Input.Pointer) => {
        const { x, y } = local(p)
        if (!inside(x, y)) return
        drawing = true; lx = x; ly = y
        hint.setAlpha(0)
        strokes.fillStyle(color, 1)
        strokes.fillCircle(x, y, brush / 2)
    })

    const move = (p: Phaser.Input.Pointer) => {
        if (!drawing) return
        const { x, y } = local(p)
        if (!inside(x, y)) { drawing = false; return }
        strokes.lineStyle(brush, color, 1)
        strokes.lineBetween(lx, ly, x, y)
        strokes.fillStyle(color, 1)
        strokes.fillCircle(x, y, brush / 2)
        ink += Math.hypot(x - lx, y - ly)
        lx = x; ly = y
        if (ink > 320) ready.setEnabled(true)
    }
    const up = () => { drawing = false }

    s.input.on('pointermove', move)
    s.input.on('pointerup', up)
    cleanups.push(() => { s.input.off('pointermove', move); s.input.off('pointerup', up) })

    // Paleta
    const PALETTE = [C.coral, C.sun, C.mint, C.sky, C.lilac, C.ink]
    const swatchY = CANVAS_Y + CANVAS_H / 2 + 44
    const ring = s.add.graphics()
    objects.push(ring)
    const drawRing = (i: number) => {
        ring.clear()
        ring.lineStyle(5, C.ink, 1)
        ring.strokeCircle(-198 + i * 62, swatchY, 27)
    }
    PALETTE.forEach((cc, i) => {
        const x = -198 + i * 62
        const g = s.add.graphics()
        g.fillStyle(C.shadow, 0.15); g.fillCircle(x, swatchY + 4, 22)
        g.fillStyle(cc, 1); g.fillCircle(x, swatchY, 22)
        g.fillStyle(C.white, 0.35); g.fillEllipse(x - 5, swatchY - 8, 20, 10)
        const h = s.add.zone(x, swatchY, 54, 54).setInteractive({ useHandCursor: true })
        h.on('pointerdown', () => { color = cc; drawRing(i) })
        objects.push(g, h)
    })
    drawRing(0)

    // Espessura
    const thin = chunkyButton(s, 186, swatchY, 'fino', () => { brush = 5 },
        { w: 78, h: 46, tone: C.slate, deep: C.slateDeep, size: 16 })
    const thick = chunkyButton(s, 272, swatchY, 'grosso', () => { brush = 18 },
        { w: 90, h: 46, tone: C.slate, deep: C.slateDeep, size: 16 })
    objects.push(thin.root, thick.root)

    const clear = chunkyButton(s, -168, swatchY + 74, 'Apagar tudo', () => {
        strokes.clear(); ink = 0; hint.setAlpha(0.5); ready.setEnabled(false)
    }, { w: 200, h: 56, tone: C.sun, deep: C.sunDeep, size: 18, textColor: C.ink })

    const ready = chunkyButton(s, 130, swatchY + 74, 'Pronto!', () => {
        if (settled) return
        settled = true
        ready.setEnabled(false)
        if (!ctx.step) { ctx.offTask(); return }
        floatingNote(s, 640, 300, 'Que desenho bonito!')
        ctx.done('confirm-drawing')
    }, { w: 200, h: 56, tone: C.mint, deep: C.mintDeep, enabled: false })

    objects.push(clear.root, ready.root)

    return { objects, dispose: () => cleanups.forEach(fn => fn()) }
}

// ═══════════════════════════════════════════════════════ MÚSICAS

export function musicApp(ctx: AppCtx, area: Area): AppView {
    const s = ctx.scene
    const objects: Phaser.GameObjects.GameObject[] = []
    let playing = false
    let progress = 0
    let claimed = false

    const art = s.add.image(0, area.top + 130, 'album-art').setDisplaySize(200, 200)
    const artFrame = s.add.graphics()
    artFrame.lineStyle(7, C.slateDeep, 1)
    artFrame.strokeRoundedRect(-104, area.top + 26, 208, 208, 20)
    objects.push(art, artFrame)

    objects.push(label(s, 0, area.top + 262, 'Canção da Turma', { size: 26, color: C.ink }))

    // Equalizador: prova visual de que o som está tocando
    const eq = s.add.graphics()
    objects.push(eq)
    const bars = Array.from({ length: 13 }, () => Phaser.Math.FloatBetween(0.2, 1))
    const eqY = area.top + 320

    const drawEq = () => {
        eq.clear()
        bars.forEach((v, i) => {
            const x = -156 + i * 26
            const h = playing ? 8 + v * 44 : 8
            eq.fillStyle(playing ? C.mint : C.paperShade, 1)
            eq.fillRoundedRect(x, eqY - h / 2, 16, h, 8)
        })
    }
    drawEq()

    const trackY = area.top + 372
    const track = s.add.graphics()
    objects.push(track)
    const drawTrack = () => {
        track.clear()
        track.fillStyle(C.paperShade, 1); track.fillRoundedRect(-200, trackY - 7, 400, 14, 7)
        track.fillStyle(C.slate, 1); track.fillRoundedRect(-200, trackY - 7, 400 * progress, 14, 7)
        track.fillStyle(C.white, 1); track.fillCircle(-200 + 400 * progress, trackY, 12)
        track.lineStyle(4, C.slateDeep, 1); track.strokeCircle(-200 + 400 * progress, trackY, 12)
    }
    drawTrack()

    const play = chunkyButton(s, 0, area.top + 434, 'Tocar', () => {
        playing = !playing
        play.setLabel(playing ? 'Pausar' : 'Tocar')
        drawEq()
        if (playing && !claimed) {
            claimed = true
            if (!ctx.step) { ctx.offTask(); return }
            s.time.delayedCall(600, () => ctx.done('play-music'))
        }
    }, { w: 220, h: 62, tone: C.slate, deep: C.slateDeep })
    objects.push(play.root)

    let acc = 0
    const tick = (dt: number) => {
        if (!playing) return
        art.setAngle(art.angle + dt * 0.02)
        progress = Math.min(1, progress + dt / 14000)
        drawTrack()
        acc += dt
        if (acc > 90) {
            acc = 0
            for (let i = 0; i < bars.length; i++) bars[i] = Phaser.Math.FloatBetween(0.15, 1)
            drawEq()
        }
        if (progress >= 1) { playing = false; play.setLabel('Tocar'); drawEq() }
    }

    return { objects, tick }
}

export const APP_BUILDERS: Partial<Record<AppId, (ctx: AppCtx, area: Area) => AppView>> = {
    relogio: clockApp,
    calculadora: calcApp,
    pasta: folderApp,
    gravador: recorderApp,
    desenho: paintApp,
    player: musicApp,
}