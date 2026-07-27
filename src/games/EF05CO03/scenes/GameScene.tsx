import Phaser from 'phaser'
import { runtimeGameBridge } from '../../../shared/bridge/runtimeGameBridge'
import { EventBus } from '../../../shared/EventBus'
import { createTutorial, type TutorialStep } from '../../../shared/tutorial/createTutorial'
import { showLevelComplete } from '../../../shared/level/showLevelComplete'
import { LEVELS } from '../data/levels'
import {
    OPERATOR_LABEL,
    OPERATOR_RULE,
    OPERATOR_TEXTURE,
    collectLeaves,
    collectOperators,
    evalExpr,
    exprDepth,
    truthTable,
} from '../data/logic'
import type {
    ExprNode,
    LeafNode,
    LevelConfig,
    OperatorNode,
    PhaseConfig,
    UnknownPhase,
} from '../types'
import { PLACA } from './BootScene'

const GAME_ID = 'arena-da-logica'

const W = 1280
const H = 720

const LEAF_X = 270
const LEAF_W = 440
const LEAF_H = 112
const BTN_V_X = 548
const BTN_F_X = 640
const BTN_SIZE = 76

const OP_X0 = 770
const OP_GAP = 124
const OP_R = 54

const GATE_Y = 340

const FINAL_W = 270
const FINAL_H = 74
const BAR_Y = 648

/** O cano sai da borda da placa e corre por baixo dos botões V/F. */
const PIPE_OUT = LEAF_X + LEAF_W / 2

const C = {
    blue: 0x3b82f6,
    purple: 0x8b5cf6,
    amber: 0xf59e0b,
    green: 0x22c55e,
    red: 0xef4444,
    slate: 0x64748b,
    dim: 0x475569,
    white: 0xffffff,
    ink: 0x0f2547,
}

interface Pos {
    x: number
    y: number
}

interface LeafView {
    node: LeafNode
    pos: Pos
    placa: Phaser.GameObjects.NineSlice
    selo?: Phaser.GameObjects.Image
    btnV?: Phaser.GameObjects.Image
    btnF?: Phaser.GameObjects.Image
}

interface OpView {
    node: OperatorNode
    pos: Pos
    sprite: Phaser.GameObjects.Image
}

export class GameScene extends Phaser.Scene {
    private levelIdx = 0
    private phaseIdx = 0
    private points = 0
    private locked = true
    private ended = false

    private marks = new Map<string, boolean>()
    private finalAnswer: boolean | null = null
    private justifyChoice = -1
    private reviewMode = false

    private positions = new Map<ExprNode, Pos>()
    private leafViews: LeafView[] = []
    private opViews: OpView[] = []

    private pipeLayer!: Phaser.GameObjects.Graphics
    private jointLayer!: Phaser.GameObjects.Container

    private gate!: Phaser.GameObjects.Image
    private gateHalo!: Phaser.GameObjects.Image
    private gateLocks: Phaser.GameObjects.Image[] = []
    private gateX = 1140
    private gateSize = 260
    private gateIn = 1000

    private btnTrue?: Phaser.GameObjects.Container
    private btnFalse?: Phaser.GameObjects.Container
    private confirmBtn?: Phaser.GameObjects.Container
    private hudSub = ''

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; phase?: number; points?: number }) {
        this.levelIdx = (data.level ?? 1) - 1
        this.phaseIdx = data.phase ?? 0
        this.points = data.points ?? 0
        this.locked = true
        this.ended = false
        this.marks = new Map()
        this.finalAnswer = null
        this.justifyChoice = -1
        this.reviewMode = false
        this.positions = new Map()
        this.leafViews = []
        this.opViews = []
        this.gateLocks = []
    }

    private get level(): LevelConfig {
        return LEVELS[this.levelIdx]
    }

    private get phase(): PhaseConfig {
        return this.level.phases[this.phaseIdx]
    }

    create() {
        this.drawBackground()
        this.layoutExpr()
        this.buildGate()
        this.buildLeaves()
        this.buildOperators()
        this.buildBottomBar()
        this.refresh()

        EventBus.on('timer-end', () => this.onTimeUp(), this)
        this.events.once('shutdown', () => EventBus.off('timer-end', undefined, this))

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        if (this.phaseIdx === 0) {
            this.showLevelIntro(() => this.runTutorials(() => this.startPhase()))
        } else {
            this.runTutorials(() => this.startPhase())
        }
    }

    private startPhase() {
        this.publishHud()
        if (this.level.timeLimit) this.startTimer()
        this.locked = false
    }

    private drawBackground() {
        const key = this.level.level === 3 ? 'bg-arena-mestre' : 'bg-arena'

        // Os assets são quadrados: escalar para 1280x720 achataria a imagem.
        // Cobre a tela mantendo a proporção e deixa sobrar nas laterais.
        const bg = this.add.image(W / 2, H / 2, key).setDepth(-2)
        bg.setScale(Math.max(W / bg.width, H / bg.height))

        const veil = this.add.graphics().setDepth(-1)
        veil.fillStyle(C.ink, 0.34)
        veil.fillRect(0, 0, W, H)

        this.pipeLayer = this.add.graphics().setDepth(4)
        this.jointLayer = this.add.container(0, 0).setDepth(5)
    }

    // ---------------------------------------------------------------- layout

    /**
     * As folhas ocupam linhas na ordem de leitura. Cada operador fica na
     * coluna correspondente à sua altura na árvore, o que garante que a
     * energia sempre corre da esquerda para a direita, sem cano voltando.
     */
    private layoutExpr() {
        const leaves = collectLeaves(this.phase.expr)
        const gap = leaves.length >= 3 ? 140 : 172
        const top = 360 - ((leaves.length - 1) * gap) / 2

        leaves.forEach((leaf, i) => {
            this.positions.set(leaf, { x: LEAF_X, y: top + i * gap })
        })

        const place = (node: ExprNode): Pos => {
            if (node.kind === 'folha') return this.positions.get(node)!

            const kids: ExprNode[] =
                node.kind === 'nao' ? [node.child] : [node.left, node.right]
            const kidPos = kids.map(place)

            const pos: Pos = {
                x: OP_X0 + (exprDepth(node) - 1) * OP_GAP,
                y: kidPos.reduce((s, p) => s + p.y, 0) / kidPos.length,
            }
            this.positions.set(node, pos)
            return pos
        }

        place(this.phase.expr)
        this.computeGate()
    }

    /**
     * O portão ocupa o espaço que sobrar à direita da raiz. Cadeias rasas
     * ganham um portão grande; a cadeia de profundidade 3 ganha um menor,
     * que é o suficiente para não encostar no último operador.
     */
    private computeGate() {
        const root = this.phase.expr
        const rootRight = root.kind === 'folha' ? PIPE_OUT : this.posOf(root).x + OP_R

        this.gateSize = Phaser.Math.Clamp(W - rootRight - 70, 170, 260)
        this.gateX = W - 24 - this.gateSize / 2
        this.gateIn = this.gateX - this.gateSize / 2 - 8
    }

    private posOf(node: ExprNode): Pos {
        return this.positions.get(node) ?? { x: LEAF_X, y: 370 }
    }

    // ------------------------------------------------------------- construção

    private buildLeaves() {
        const isIncognita = this.phase.kind === 'incognita'

        collectLeaves(this.phase.expr).forEach(node => {
            const pos = this.posOf(node)
            const hidden = !!node.unknown

            const placa = this.add.nineslice(
                pos.x, pos.y, 'bloco-placa', undefined,
                LEAF_W, LEAF_H,
                PLACA.slice, PLACA.slice, PLACA.slice, PLACA.slice,
            ).setDepth(10)

            const view: LeafView = { node, pos, placa }

            if (hidden) {
                this.add.image(pos.x, pos.y, 'icone-interrogacao')
                    .setDisplaySize(70, 70).setDepth(11)
            } else {
                this.add.text(pos.x - 34, pos.y, node.text, {
                    fontFamily: 'Arial',
                    fontStyle: 'bold',
                    fontSize: '22px',
                    color: '#1e293b',
                    align: 'center',
                    wordWrap: { width: LEAF_W - 130 },
                }).setOrigin(0.5).setDepth(11).setResolution(2)

                view.selo = this.add.image(pos.x + LEAF_W / 2 - 52, pos.y, 'selo-verdadeiro')
                    .setDisplaySize(66, 66).setDepth(12).setVisible(false)

                view.btnV = this.makeIconButton(BTN_V_X, pos.y, 'btn-v', () => this.markLeaf(node, true))
                view.btnF = this.makeIconButton(BTN_F_X, pos.y, 'btn-f', () => this.markLeaf(node, false))
            }

            this.leafViews.push(view)
        })

        if (isIncognita) this.hint((this.phase as UnknownPhase).question)
        else this.hint('Marque se cada frase é verdadeira ou falsa por si só. Os operadores cuidam do resto.')
    }

    private buildOperators() {
        collectOperators(this.phase.expr).forEach(node => {
            const pos = this.posOf(node)
            const [off] = OPERATOR_TEXTURE[node.kind]

            const sprite = this.add.image(pos.x, pos.y, off)
                .setDisplaySize(OP_R * 2, OP_R * 2)
                .setDepth(10)
                .setAlpha(0.55)

            const help = this.add.image(pos.x + 42, pos.y - 48, 'icone-ajuda')
                .setDisplaySize(38, 38)
                .setDepth(12)
                .setInteractive({ useHandCursor: true })

            help.on('pointerdown', () => this.showTruthTable(node))

            this.opViews.push({ node, pos, sprite })
        })
    }

    private buildGate() {
        const halo = this.gateSize * 1.7
        this.gateHalo = this.add.image(this.gateX, GATE_Y, 'brilho-radial')
            .setDisplaySize(halo, halo)
            .setBlendMode(Phaser.BlendModes.ADD)
            .setDepth(8)
            .setAlpha(0)

        this.gate = this.add.image(this.gateX, GATE_Y, 'portao-fechado')
            .setDisplaySize(this.gateSize, this.gateSize)
            .setDepth(9)

        const step = this.gateSize * 0.27
        const lock = this.gateSize * 0.2

        for (let i = 0; i < 3; i++) {
            this.gateLocks.push(
                this.add.image(this.gateX, GATE_Y - step + i * step, 'portao-trava')
                    .setDisplaySize(lock, lock)
                    .setDepth(11),
            )
        }
    }

    private buildBottomBar() {
        const p = this.phase
        const askUnknown = p.kind === 'incognita'

        this.hudSub = askUnknown
            ? (p as UnknownPhase).question
            : 'Qual é o valor final do mecanismo?'

        this.btnTrue = this.makeButton(400, BAR_Y, FINAL_W, FINAL_H, 'VERDADEIRO', C.green, () => {
            this.chooseFinal(true)
        })
        this.btnFalse = this.makeButton(690, BAR_Y, FINAL_W, FINAL_H, 'FALSO', C.red, () => {
            this.chooseFinal(false)
        })

        this.confirmBtn = this.makeButton(1075, BAR_Y, 310, FINAL_H, 'Ativar mecanismo', C.blue, () => {
            this.onConfirm()
        })

        this.setFinalEnabled(false)
    }

    private hint(text: string) {
        this.add.text(W / 2, 706, text, {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: '17px',
            color: '#cbd5e1',
        }).setOrigin(0.5).setDepth(12).setResolution(2)
    }

    // ------------------------------------------------------------- interação

    private markLeaf(node: LeafNode, value: boolean) {
        if (this.locked || this.reviewMode) return
        this.marks.set(node.id, value)
        this.finalAnswer = null
        this.playTone(value ? 660 : 420, 0.05, 'sine', 0.1)
        this.refresh()
    }

    private chooseFinal(value: boolean) {
        if (this.locked || !this.allLeavesMarked()) return
        this.finalAnswer = value
        this.playTone(600, 0.05, 'sine', 0.1)
        this.paintFinalButtons()
        this.confirmBtn?.setAlpha(1)
    }

    private onConfirm() {
        if (this.locked || this.finalAnswer === null) return

        if (this.phase.justify) {
            this.showJustify()
            return
        }
        this.grade()
    }

    private allLeavesMarked() {
        return this.leafViews
            .filter(v => !v.node.unknown)
            .every(v => this.marks.has(v.node.id))
    }

    private setFinalEnabled(on: boolean) {
        const a = on ? 1 : 0.4
        this.btnTrue?.setAlpha(a)
        this.btnFalse?.setAlpha(a)
        if (!on) this.confirmBtn?.setAlpha(0.4)
    }

    private paintFinalButtons() {
        const paint = (btn: Phaser.GameObjects.Container | undefined, active: boolean, base: number) => {
            if (!btn) return
            const g = btn.getData('bg') as Phaser.GameObjects.Graphics
            this.paintButton(g, FINAL_W, FINAL_H, active ? C.amber : base)
        }
        paint(this.btnTrue, this.finalAnswer === true, C.green)
        paint(this.btnFalse, this.finalAnswer === false, C.red)
    }

    // ------------------------------------------------------------- avaliação

    /**
     * Valor de um nó usando o que a criança marcou. Devolve null enquanto
     * alguma parte ainda não foi resolvida — é isso que mantém o operador
     * apagado até a última placa ser respondida.
     */
    private valueOf(node: ExprNode): boolean | null {
        if (this.reviewMode) return evalExpr(node)

        switch (node.kind) {
            case 'folha':
                if (node.unknown) return null
                return this.marks.has(node.id) ? this.marks.get(node.id)! : null
            case 'nao': {
                const v = this.valueOf(node.child)
                return v === null ? null : !v
            }
            default: {
                const a = this.valueOf(node.left)
                const b = this.valueOf(node.right)
                if (a === null || b === null) return null
                return node.kind === 'e' ? a && b : a || b
            }
        }
    }

    private refresh() {
        this.leafViews.forEach(v => {
            const mark = this.marks.get(v.node.id)

            if (this.reviewMode && !v.node.unknown) {
                const ok = mark === v.node.value
                v.placa.setTexture(ok ? 'bloco-placa-v' : 'bloco-placa-f')
                v.selo?.setTexture(v.node.value ? 'selo-verdadeiro' : 'selo-falso').setVisible(true)
            } else if (mark !== undefined) {
                v.selo?.setTexture(mark ? 'selo-verdadeiro' : 'selo-falso').setVisible(true)
            }

            const chosen = this.reviewMode ? v.node.value : mark
            v.btnV?.setAlpha(chosen === true ? 1 : 0.55)
            v.btnF?.setAlpha(chosen === false ? 1 : 0.55)
        })

        this.opViews.forEach(v => {
            const value = this.valueOf(v.node)
            const [off, on] = OPERATOR_TEXTURE[v.node.kind]
            const wasOn = v.sprite.texture.key === on

            v.sprite.setTexture(value === true ? on : off)
            v.sprite.setAlpha(value === null ? 0.55 : 1)

            if (value === true && !wasOn) this.sparkAt(v.pos)
        })

        this.drawPipes()

        const ready = this.allLeavesMarked()
        this.setFinalEnabled(ready)
        this.paintFinalButtons()
        if (ready && this.finalAnswer !== null) this.confirmBtn?.setAlpha(1)

        if (this.reviewMode) {
            const rootValue = evalExpr(this.phase.expr)
            this.gateHalo.setTint(rootValue ? C.green : C.red)
            this.gateHalo.setAlpha(0.45)
        }
    }

    private drawPipes() {
        this.pipeLayer.clear()
        this.jointLayer.removeAll(true)

        collectOperators(this.phase.expr).forEach(node => {
            const target = this.posOf(node)
            const kids: ExprNode[] =
                node.kind === 'nao' ? [node.child] : [node.left, node.right]

            kids.forEach((kid, i) => {
                const from = this.posOf(kid)
                const startX = kid.kind === 'folha' ? PIPE_OUT : from.x + OP_R
                const dy = kids.length === 1 ? 0 : i === 0 ? -16 : 16
                this.strokePipe(
                    startX, from.y,
                    target.x - OP_R, target.y + dy,
                    this.valueOf(kid),
                )
            })
        })

        const root = this.phase.expr
        const rootPos = this.posOf(root)
        const startX = root.kind === 'folha' ? PIPE_OUT : rootPos.x + OP_R
        this.strokePipe(startX, rootPos.y, this.gateIn, GATE_Y, this.valueOf(root))
    }

    private strokePipe(x1: number, y1: number, x2: number, y2: number, value: boolean | null) {
        const color = value === true ? C.green : value === false ? C.slate : C.dim
        const alpha = value === null ? 0.45 : 1
        const width = value === true ? 11 : 7
        const midX = (x1 + x2) / 2

        this.pipeLayer.lineStyle(width, color, alpha)
        this.pipeLayer.beginPath()
        this.pipeLayer.moveTo(x1, y1)
        this.pipeLayer.lineTo(midX, y1)
        this.pipeLayer.lineTo(midX, y2)
        this.pipeLayer.lineTo(x2, y2)
        this.pipeLayer.strokePath()

        if (Math.abs(y1 - y2) > 2) {
            this.addJoint(midX, y1, color, alpha)
            this.addJoint(midX, y2, color, alpha)
        }
    }

    private addJoint(x: number, y: number, color: number, alpha: number) {
        const joint = this.add.image(x, y, 'cano-no')
            .setDisplaySize(24, 24)
            .setTint(color)
            .setAlpha(alpha)
        this.jointLayer.add(joint)
    }

    private sparkAt(pos: Pos) {
        for (let i = 0; i < 6; i++) {
            const spark = this.add.image(pos.x, pos.y, 'faisca')
                .setDisplaySize(20, 20).setDepth(13)
                .setBlendMode(Phaser.BlendModes.ADD)
            const angle = (Math.PI * 2 * i) / 6
            this.tweens.add({
                targets: spark,
                x: pos.x + Math.cos(angle) * 70,
                y: pos.y + Math.sin(angle) * 70,
                alpha: 0,
                duration: 420,
                ease: 'Cubic.easeOut',
                onComplete: () => spark.destroy(),
            })
        }
        this.playTone(880, 0.06, 'triangle', 0.09)
    }

    // ------------------------------------------------------------- correção

    private expectedAnswer(): boolean {
        if (this.phase.kind === 'incognita') {
            const hidden = collectLeaves(this.phase.expr).find(l => l.unknown)
            return hidden?.value ?? true
        }
        return evalExpr(this.phase.expr)
    }

    private grade() {
        const p = this.phase
        const answerOk = this.finalAnswer === this.expectedAnswer()
        const justifyOk = !p.justify || this.justifyChoice === p.justify.correctIndex
        const leavesOk = this.leafViews
            .filter(v => !v.node.unknown)
            .every(v => this.marks.get(v.node.id) === v.node.value)

        if (answerOk && justifyOk) {
            this.resolve(true, p.explanation)
            return
        }

        this.reviewMode = true
        this.refresh()

        if (!answerOk && !leavesOk) {
            const wrong = this.leafViews.find(
                v => !v.node.unknown && this.marks.get(v.node.id) !== v.node.value,
            )
            const frase = wrong
                ? `A frase "${wrong.node.text}" é ${wrong.node.value ? 'verdadeira' : 'falsa'}. `
                : ''
            this.resolve(false, `${frase}Marque em cada placa o valor que a frase tem sozinha — os operadores fazem a transformação depois. ${p.explanation}`)
            return
        }

        if (!answerOk && leavesOk) {
            this.resolve(false, `Você leu as frases certo! O que escorregou foi o operador. ${p.explanation}`)
            return
        }

        this.resolve(false, `O valor final está certo, mas a explicação não. ${p.explanation}`)
    }

    private resolve(correct: boolean, message: string) {
        this.locked = true
        this.stopTimer()

        if (correct) {
            this.points += 10
            this.openGate()
            this.playSuccess()
            runtimeGameBridge.emit({
                type: 'CORRECT_ANSWER', gameId: GAME_ID,
                pointsEarned: 10, stage: this.level.level,
            })
        } else {
            this.points = Math.max(0, this.points - 3)
            this.playError()
            this.cameras.main.shake(140, 0.005)
            runtimeGameBridge.emit({
                type: 'WRONG_ANSWER', gameId: GAME_ID,
                pointsEarned: -3, stage: this.level.level,
            })
        }

        this.emitCheckpoint()
        this.time.delayedCall(correct ? 700 : 260, () => this.showFeedback(correct, message))
    }

    private openGate() {
        this.gateHalo.setTint(C.green)
        this.tweens.add({ targets: this.gateHalo, alpha: 0.75, duration: 260 })

        this.gateLocks.forEach((lock, i) => {
            this.tweens.add({
                targets: lock,
                delay: i * 130,
                y: lock.y + this.gateSize * 0.4,
                angle: 140,
                alpha: 0,
                duration: 340,
                ease: 'Back.easeIn',
            })
        })

        this.time.delayedCall(520, () => this.gate.setTexture('portao-aberto'))
    }

    // ------------------------------------------------------------- overlays

    private showJustify() {
        const p = this.phase
        if (!p.justify) return

        this.locked = true
        const overlay = this.add.rectangle(W / 2, H / 2, W, H, C.ink, 0.78)
            .setDepth(300).setInteractive()
        const panel = this.add.container(W / 2, H / 2).setDepth(301)

        const PW = 760
        const PH = 380

        const bg = this.add.graphics()
        bg.fillStyle(0xf8fafc, 0.99)
        bg.fillRoundedRect(-PW / 2, -PH / 2, PW, PH, 26)
        bg.fillStyle(C.purple, 1)
        bg.fillRoundedRect(-PW / 2, -PH / 2, PW, 12, { tl: 26, tr: 26, bl: 0, br: 0 })

        const title = this.add.text(0, -PH / 2 + 52, 'Por que deu esse resultado?', {
            fontFamily: 'Arial Black, Arial', fontSize: '30px', color: '#0f172a',
        }).setOrigin(0.5).setResolution(2)

        panel.add([bg, title])

        let choice = -1
        const buttons: Phaser.GameObjects.Container[] = []
        const confirm = this.makeButton(0, PH / 2 - 46, 240, 52, 'Confirmar', C.green, () => {
            if (choice < 0) return
            this.justifyChoice = choice
            overlay.destroy()
            panel.destroy()
            this.grade()
        })
        confirm.setAlpha(0.4)

        p.justify.options.forEach((opt, i) => {
            const btn = this.makeButton(0, -70 + i * 74, PW - 90, 66, opt, C.slate, () => {
                choice = i
                this.playTone(560, 0.04, 'sine', 0.09)
                buttons.forEach((b, bi) => {
                    const g = b.getData('bg') as Phaser.GameObjects.Graphics
                    this.paintButton(g, PW - 90, 66, bi === i ? C.amber : C.slate)
                })
                confirm.setAlpha(1)
            })
            buttons.push(btn)
            panel.add(btn)
        })

        panel.add(confirm)
        panel.setScale(0.92).setAlpha(0)
        this.tweens.add({ targets: panel, alpha: 1, scale: 1, duration: 220, ease: 'Back.easeOut' })
    }

    private showTruthTable(node: OperatorNode) {
        const rows = truthTable(node.kind)
        const label = OPERATOR_LABEL[node.kind]

        const overlay = this.add.rectangle(W / 2, H / 2, W, H, C.ink, 0.72)
            .setDepth(400).setInteractive()
        const panel = this.add.container(W / 2, H / 2).setDepth(401)

        const word = label.toLowerCase()
        const PW = 560
        const PH = 200 + rows.length * 46

        const bg = this.add.graphics()
        bg.fillStyle(0xf8fafc, 0.99)
        bg.fillRoundedRect(-PW / 2, -PH / 2, PW, PH, 24)
        bg.fillStyle(C.amber, 1)
        bg.fillRoundedRect(-PW / 2, -PH / 2, PW, 12, { tl: 24, tr: 24, bl: 0, br: 0 })

        const title = this.add.text(0, -PH / 2 + 48, `Tabela do ${label}`, {
            fontFamily: 'Arial Black, Arial', fontSize: '30px', color: '#0f172a',
        }).setOrigin(0.5).setResolution(2)

        const rule = this.add.text(0, -PH / 2 + 86, OPERATOR_RULE[node.kind], {
            fontFamily: 'Arial', fontStyle: 'bold', fontSize: '19px', color: '#334155',
            align: 'center', wordWrap: { width: PW - 70 },
        }).setOrigin(0.5).setResolution(2)

        panel.add([bg, title, rule])

        const top = -PH / 2 + 138
        rows.forEach(([inputs, out], i) => {
            const y = top + i * 46
            const left = node.kind === 'nao'
                ? `${word} ${inputs[0] ? 'V' : 'F'}`
                : inputs.map(v => (v ? 'V' : 'F')).join(`  ${word}  `)

            panel.add(this.add.text(-PW / 2 + 70, y, left, {
                fontFamily: 'Arial Black, Arial', fontSize: '23px', color: '#334155',
            }).setOrigin(0, 0.5).setResolution(2))

            panel.add(this.add.text(40, y, '→', {
                fontFamily: 'Arial Black, Arial', fontSize: '26px', color: '#94a3b8',
            }).setOrigin(0.5).setResolution(2))

            panel.add(this.add.text(PW / 2 - 80, y, out ? 'V' : 'F', {
                fontFamily: 'Arial Black, Arial', fontSize: '27px',
                color: out ? '#15803d' : '#b91c1c',
            }).setOrigin(0.5).setResolution(2))
        })

        const close = this.makeButton(0, PH / 2 - 44, 200, 50, 'Entendi', C.blue, () => {
            overlay.destroy()
            panel.destroy()
        })
        panel.add(close)

        panel.setScale(0.92).setAlpha(0)
        this.tweens.add({ targets: panel, alpha: 1, scale: 1, duration: 200, ease: 'Back.easeOut' })
    }

    private showFeedback(correct: boolean, message: string) {
        const overlay = this.add.rectangle(W / 2, H / 2, W, H, C.ink, 0.7)
            .setDepth(300).setInteractive()
        const panel = this.add.container(W / 2, H / 2).setDepth(301)

        const text = this.add.text(0, 0, message, {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: '22px',
            color: '#1e293b',
            align: 'center',
            wordWrap: { width: 600 },
        }).setOrigin(0.5).setResolution(2)

        const title = this.add.text(0, 0, correct ? 'Mecanismo ativado!' : 'Quase lá!', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '38px',
            color: correct ? '#15803d' : '#b91c1c',
        }).setOrigin(0.5).setResolution(2)

        const PH = 210 + text.height
        title.setY(-PH / 2 + 58)
        text.setY(-PH / 2 + 58 + 36 + text.height / 2)

        const bg = this.add.graphics()
        bg.fillStyle(0x000000, 0.22)
        bg.fillRoundedRect(-322, -PH / 2 + 8, 660, PH, 26)
        bg.fillStyle(0xf8fafc, 0.99)
        bg.fillRoundedRect(-330, -PH / 2, 660, PH, 26)
        bg.fillStyle(correct ? C.green : C.red, 1)
        bg.fillRoundedRect(-330, -PH / 2, 660, 12, { tl: 26, tr: 26, bl: 0, br: 0 })

        const btn = this.makeButton(0, PH / 2 - 48, 280, 52,
            correct ? 'Continuar' : 'Tentar de novo',
            correct ? C.green : C.blue,
            () => {
                overlay.destroy()
                panel.destroy()
                if (correct) this.completePhase()
                else this.retryPhase()
            })

        panel.add([bg, title, text, btn])
        panel.setScale(0.9).setAlpha(0)
        this.tweens.add({ targets: panel, alpha: 1, scale: 1, duration: 240, ease: 'Back.easeOut' })
    }

    private showLevelIntro(onStart: () => void) {
        const overlay = this.add.rectangle(W / 2, H / 2, W, H, C.ink, 0.88)
            .setDepth(500).setInteractive()
        const panel = this.add.container(W / 2, H / 2).setDepth(501)

        const PW = 660
        const PH = 400

        const bg = this.add.graphics()
        bg.fillStyle(0x000000, 0.25)
        bg.fillRoundedRect(-PW / 2 + 6, -PH / 2 + 8, PW, PH, 28)
        bg.fillStyle(0xf8fafc, 0.99)
        bg.fillRoundedRect(-PW / 2, -PH / 2, PW, PH, 28)
        bg.fillStyle(C.purple, 1)
        bg.fillRoundedRect(-PW / 2, -PH / 2, PW, 72, { tl: 28, tr: 28, bl: 0, br: 0 })

        const badge = this.add.text(0, -PH / 2 + 36, `NÍVEL ${this.level.level} DE ${LEVELS.length}`, {
            fontFamily: 'Arial Black, Arial', fontSize: '23px', color: '#ffffff',
        }).setOrigin(0.5).setResolution(2)

        const title = this.add.text(0, -PH / 2 + 120, this.level.title, {
            fontFamily: 'Arial Black, Arial', fontSize: '34px', color: '#0f172a',
            align: 'center', wordWrap: { width: PW - 90 },
        }).setOrigin(0.5).setResolution(2)

        const objective = this.add.text(0, -PH / 2 + 190, this.level.objective, {
            fontFamily: 'Arial', fontStyle: 'bold', fontSize: '21px', color: '#334155',
            align: 'center', wordWrap: { width: PW - 110 },
        }).setOrigin(0.5).setResolution(2)

        const phaseLabel = this.add.text(0, 56, `${this.level.phases.length} portões neste nível`, {
            fontFamily: 'Arial', fontStyle: 'bold', fontSize: '15px', color: '#64748b',
        }).setOrigin(0.5).setResolution(2)

        const dots = this.add.graphics()
        const gap = 30
        const startX = -((this.level.phases.length - 1) * gap) / 2
        this.level.phases.forEach((_, i) => {
            dots.fillStyle(i === 0 ? C.purple : 0xcbd5e1, 1)
            dots.fillCircle(startX + i * gap, 90, 9)
        })

        const btn = this.makeButton(0, 152, 280, 56, 'Começar', C.purple, () => {
            this.tweens.add({
                targets: [overlay, panel], alpha: 0, duration: 250,
                onComplete: () => { overlay.destroy(); panel.destroy(); onStart() },
            })
        })

        panel.add([bg, badge, title, objective, phaseLabel, dots, btn])
        panel.setScale(0.9).setAlpha(0)
        this.tweens.add({ targets: panel, alpha: 1, scale: 1, duration: 280, ease: 'Back.easeOut' })
    }

    // ------------------------------------------------------------- tutoriais

    private runTutorials(onDone: () => void) {
        const queue: Array<{ key: string; steps: TutorialStep[] }> = []
        const first = this.leafViews[0]

        if (this.level.level === 1 && this.phaseIdx === 0) {
            queue.push({
                key: 'logica-l1',
                steps: [
                    {
                        text: 'Cada placa tem uma frase. Leia com calma: ela é verdadeira ou falsa por si só?',
                        shape: 'rect',
                        x: first?.pos.x ?? LEAF_X, y: first?.pos.y ?? 370,
                        w: LEAF_W + 60, h: LEAF_H + 60,
                    },
                    {
                        text: 'Toque em V se for verdadeira e em F se for falsa.',
                        shape: 'rect', x: (BTN_V_X + BTN_F_X) / 2, y: first?.pos.y ?? 360, w: 230, h: 130,
                    },
                    {
                        text: 'O cano acende quando a resposta é verdadeira. O portão só abre com energia chegando.',
                        shape: 'rect', x: this.gateX, y: GATE_Y, w: this.gateSize + 90, h: this.gateSize + 90,
                    },
                    {
                        text: 'Escolha o valor final e toque em Ativar mecanismo.',
                        shape: 'rect', x: W / 2, y: BAR_Y, w: 1180, h: 120,
                    },
                ],
            })
        }

        if (this.level.level === 1 && this.phaseIdx === 1) {
            const op = this.opViews[0]
            queue.push({
                key: 'logica-operador',
                steps: [
                    {
                        text: 'Esta peça é o NÃO. Marque a frase normalmente — é o NÃO que inverte o valor dela depois.',
                        shape: 'circle',
                        x: op?.pos.x ?? OP_X0, y: op?.pos.y ?? 370, w: 190, h: 190,
                    },
                    {
                        text: 'Na dúvida, toque na lupa ao lado do operador para ver a tabela dele.',
                        shape: 'circle',
                        x: (op?.pos.x ?? OP_X0) + 42, y: (op?.pos.y ?? 360) - 48, w: 130, h: 130,
                    },
                ],
            })
        }

        if (this.level.level === 2 && this.phaseIdx === 0) {
            queue.push({
                key: 'logica-l2',
                steps: [
                    {
                        text: 'Agora são dois operadores no mesmo mecanismo.',
                        shape: 'rect', x: W / 2 - 60, y: 370, w: 1080, h: 420,
                    },
                    {
                        text: 'Resolva as placas primeiro. Os operadores acendem sozinhos, na ordem certa.',
                        shape: 'rect', x: OP_X0 + OP_GAP / 2, y: 370, w: 400, h: 380,
                    },
                ],
            })
        }

        if (this.level.level === 3 && this.phaseIdx === 0) {
            queue.push({
                key: 'logica-l3',
                steps: [
                    {
                        text: 'As cadeias ficaram longas — e agora tem tempo. Fique de olho na barra.',
                        shape: 'rect', x: W - 186, y: 44, w: 340, h: 60,
                    },
                    {
                        text: 'Em algumas fases você também vai explicar por que deu esse resultado.',
                        shape: 'none', balloonY: 400,
                    },
                ],
            })
        }

        if (this.phase.kind === 'incognita') {
            queue.push({
                key: 'logica-incognita',
                steps: [
                    {
                        text: 'Uma das placas está coberta. Resolva as outras e descubra o que ela precisa ser.',
                        shape: 'rect', x: LEAF_X, y: 370, w: LEAF_W + 80, h: 380,
                    },
                ],
            })
        }

        const next = (i: number) => {
            if (i >= queue.length) {
                onDone()
                return
            }
            createTutorial(this, {
                key: queue[i].key,
                accent: C.purple,
                safeTop: 130,
                onFinish: () => next(i + 1),
                steps: queue[i].steps,
            })
        }

        next(0)
    }

    // ------------------------------------------------------------- progressão

    private retryPhase() {
        this.scene.restart({ level: this.level.level, phase: this.phaseIdx, points: this.points })
    }

    private completePhase() {
        const isLastPhase = this.phaseIdx + 1 >= this.level.phases.length
        const isLastLevel = this.levelIdx + 1 >= LEVELS.length

        if (!isLastPhase) {
            this.scene.restart({ level: this.level.level, phase: this.phaseIdx + 1, points: this.points })
            return
        }

        if (!isLastLevel) {
            showLevelComplete(this, {
                subtitle: `Nível ${this.level.level} concluído`,
                message: LEVELS[this.levelIdx + 1].objective,
                accent: C.purple,
                overlayColor: C.ink,
                titleColor: '#3c3489',
                subtitleColor: '#8b5cf6',
                progress: { total: LEVELS.length, current: this.level.level },
                autoAdvance: {
                    delay: 2300,
                    onComplete: () => this.scene.restart({
                        level: this.level.level + 1,
                        phase: 0,
                        points: this.points,
                    }),
                },
            })
            return
        }

        this.ended = true
        runtimeGameBridge.emit({ type: 'GAME_COMPLETED', gameId: GAME_ID, stage: this.level.level })

        showLevelComplete(this, {
            title: 'Jogo concluído!',
            subtitle: 'Você já resolve sentenças com NÃO, E e OU',
            accent: C.purple,
            overlayColor: C.ink,
            titleColor: '#3c3489',
            subtitleColor: '#8b5cf6',
            progress: { total: LEVELS.length, current: LEVELS.length },
            buttons: [
                { label: 'Jogar novamente', color: C.green, onClick: () => this.scene.restart({ level: 1, phase: 0, points: 0 }) },
                { label: 'Outros jogos', color: C.purple, onClick: () => EventBus.emit('exit-game') },
            ],
        })
    }

    private onTimeUp() {
        if (this.ended || this.locked) return
        this.ended = true
        this.locked = true
        this.stopTimer()

        runtimeGameBridge.emit({
            type: 'WRONG_ANSWER', gameId: GAME_ID,
            pointsEarned: -3, stage: this.level.level,
        })
        runtimeGameBridge.emit({ type: 'GAME_OVER', gameId: GAME_ID, stage: this.level.level })

        this.playError()
        this.showFeedback(false, 'O tempo acabou! Vamos tentar este portão de novo.')
    }

    private emitCheckpoint() {
        const done = this.levelIdx * 4 + this.phaseIdx
        runtimeGameBridge.emit({
            type: 'CHECKPOINT',
            gameId: GAME_ID,
            stage: this.level.level,
            progress: Math.round((done / (LEVELS.length * 4)) * 100),
            score: this.points,
        })
    }

    private publishHud() {
        this.registry.set('hud', {
            instruction: this.phase.instruction,
            sub: this.hudSub,
            level: this.level.level,
            phase: this.phaseIdx + 1,
            totalPhases: this.level.phases.length,
        })
    }

    private startTimer() {
        if (!this.level.timeLimit) return
        EventBus.emit('timer-start', this.level.timeLimit)
    }

    private stopTimer() {
        EventBus.emit('timer-stop')
    }

    // ------------------------------------------------------------- widgets

    /**
     * O hover mexe só na escala. O alpha pertence ao refresh(), que é quem
     * sabe qual dos dois botões está escolhido — antes o hover escrevia alpha
     * e nada devolvia, então os dois ficavam acesos ao mesmo tempo.
     */
    private makeIconButton(x: number, y: number, texture: string, onClick: () => void) {
        const img = this.add.image(x, y, texture)
            .setDisplaySize(BTN_SIZE, BTN_SIZE)
            .setDepth(12)
            .setAlpha(0.55)
            .setInteractive({ useHandCursor: true })

        const base = img.scale

        img.on('pointerdown', () => {
            this.tweens.add({ targets: img, scale: base * 0.9, duration: 70, yoyo: true })
            onClick()
        })
        img.on('pointerover', () => {
            if (this.locked || this.reviewMode) return
            this.tweens.add({ targets: img, scale: base * 1.12, duration: 90 })
        })
        img.on('pointerout', () => {
            this.tweens.add({ targets: img, scale: base, duration: 90 })
        })

        return img
    }

    private paintButton(g: Phaser.GameObjects.Graphics, w: number, h: number, color: number) {
        g.clear()
        g.fillStyle(color, 1)
        g.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
        g.fillStyle(C.white, 0.18)
        g.fillRoundedRect(-w / 2 + 6, -h / 2 + 6, w - 12, h * 0.3, h / 4)
        g.lineStyle(3, C.white, 0.9)
        g.strokeRoundedRect(-w / 2, -h / 2, w, h, h / 2)
    }

    private makeButton(
        x: number, y: number, w: number, h: number,
        label: string, color: number, onClick: () => void,
    ) {
        const btn = this.add.container(x, y).setDepth(20)
        const g = this.add.graphics()
        this.paintButton(g, w, h, color)

        const text = this.add.text(0, 0, label, {
            fontFamily: 'Arial Black, Arial',
            fontSize: label.length > 40 ? '17px' : '21px',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: w - 30 },
        }).setOrigin(0.5).setResolution(2)

        btn.add([g, text])
        btn.setData('bg', g)
        btn.setSize(w, h)
        btn.setInteractive({ useHandCursor: true })
        btn.on('pointerdown', () => {
            this.tweens.add({ targets: btn, scale: 0.96, duration: 70, yoyo: true })
            onClick()
        })
        return btn
    }

    private playTone(freq: number, dur: number, type: OscillatorType = 'sine', gain = 0.2) {
        const ctx = (this.sound as Phaser.Sound.WebAudioSoundManager).context
        if (!ctx) return
        const osc = ctx.createOscillator()
        const g = ctx.createGain()
        osc.connect(g)
        g.connect(ctx.destination)
        osc.type = type
        osc.frequency.setValueAtTime(freq, ctx.currentTime)
        g.gain.setValueAtTime(gain, ctx.currentTime)
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur)
        osc.start()
        osc.stop(ctx.currentTime + dur)
    }

    private playSuccess() {
        this.playTone(523, 0.1, 'sine', 0.2)
        this.time.delayedCall(100, () => this.playTone(659, 0.1, 'sine', 0.2))
        this.time.delayedCall(200, () => this.playTone(784, 0.18, 'sine', 0.22))
    }

    private playError() {
        this.playTone(311, 0.16, 'square', 0.15)
        this.time.delayedCall(140, () => this.playTone(233, 0.24, 'square', 0.13))
    }
}