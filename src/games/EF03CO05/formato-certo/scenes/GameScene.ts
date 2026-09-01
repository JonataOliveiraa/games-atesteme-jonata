import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { showLevelComplete, type LevelCompleteHandle } from '../../../../shared/level/showLevelComplete'
import { FX, Ease } from '../../../../shared/effects/FX'

import { LEVELS, TOTAL_MISSIONS, FORMAT_INFO, shufflePieces } from '../data/levels'
import { C, A, formatTone } from '../data/theme'
import { W, HUD, BENCH, REQUEST, BOXES, TRAY, READER } from '../data/layout'
import type {
    BoxReading, FormatBoxSpec, FormatId, Level, Mission, MissionState, Piece,
} from '../types'
import {
    createHud, createTimerBar, createRequestCard, createFormatBox, createPiece,
    createBigButton, drawBoxPreview, createWorkbench, paintTray, showToast,
    flyToField, dealIn,
    type Hud, type TimerBar, type RequestCard, type FormatBox, type PieceView,
    type BigButton, type FieldView,
} from './effects'
import { createReader, readBox, refusalLine, type Reader } from './reader'

const GAME_ID = 'formato-certo'

/** Ver PLANEJAMENTO.md §6. */
const POINTS = {
    read: 20,
    choose: 10,
    missRead: -5,
    missChoose: -5,
    timeout: -10,
} as const

const key = (boxId: string, fieldId: string) => `${boxId}:${fieldId}`

export class GameScene extends Phaser.Scene {

    /* ── partida ───────────────────────────────────────────────────── */

    private levelIdx = 0
    private missionIdx = 0
    private points = 0
    private hits = 0
    private errors = 0
    private isMuted = false
    private state: MissionState = 'briefing'
    private locked = false
    private ended = false

    /**
     * Geração da missão. Todo callback atrasado captura este valor e desiste
     * se ele mudou. Sem isso, um `await` pendente da missão anterior volta a
     * mexer em caixa, peça e leitor que a troca de tela já destruiu — e com
     * cronômetro por missão esse caso deixa de ser raro.
     *
     * Incrementa em: nova missão, timeout, fim de nível e shutdown.
     */
    private gen = 0

    /* ── interface fixa ────────────────────────────────────────────── */

    private hud!: Hud
    private timerBar!: TimerBar
    private requestCard!: RequestCard
    private reader!: Reader
    private readButton!: BigButton
    private trayPanel!: Phaser.GameObjects.Graphics
    private modal?: LevelCompleteHandle

    /* ── tabuleiro da missão ───────────────────────────────────────── */

    private boxes: FormatBox[] = []
    private choiceBoxes: FormatBox[] = []
    private pieces = new Map<string, PieceView>()
    private pieceData = new Map<string, Piece>()
    /** `boxId:fieldId` → pieceId */
    private fieldOccupant = new Map<string, string>()
    /** pieceId → onde está */
    private pieceAt = new Map<string, { boxId: string; fieldId: string }>()
    /** Ids em voo: já ocupam a vaga, mas ainda não assentaram. */
    private flying = new Set<string>()
    private unlocked: boolean[] = []

    private drag: { pieceId: string; view: PieceView; from: { boxId: string; fieldId: string } | null } | null = null
    private hoverField: { box: FormatBox; field: FieldView } | null = null

    /* ── cronômetro ────────────────────────────────────────────────── */

    private timerTween?: Phaser.Tweens.Tween
    private timerState = { progress: 1 }
    private timerRunning = false

    private unsubPlatform?: () => void

    constructor() {
        super({ key: 'GameScene' })
    }

    /**
     * Ponto de entrada da partida.
     *
     * `level` é 1-based e `phase` é 0-based, para bater com o resto da
     * plataforma: o `stage` que a bridge manda é o número do nível como a
     * criança o vê, e a fase é índice de array. Mesma assinatura do Museu das
     * Estruturas, que já abre assim.
     *
     * Os dois são grampeados ao que existe de verdade. Um `phase: 7` num
     * nível de três missões faria `this.mission` devolver `undefined`, e o
     * estouro apareceria três telas adiante, dentro do `playMission`, sem
     * nenhuma pista de que veio daqui.
     */
    init(data: { level?: number; phase?: number; points?: number }) {
        this.levelIdx = Phaser.Math.Clamp(data?.level ?? 1, 1, LEVELS.length) - 1
        this.missionIdx = Phaser.Math.Clamp(
            data?.phase ?? 0, 0, LEVELS[this.levelIdx].missions.length - 1,
        )
        this.points = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.isMuted = false
        this.state = 'briefing'
        this.locked = false
        this.ended = false
        this.gen = 0

        this.boxes = []
        this.choiceBoxes = []
        this.pieces = new Map()
        this.pieceData = new Map()
        this.fieldOccupant = new Map()
        this.pieceAt = new Map()
        this.flying = new Set()
        this.unlocked = []
        this.drag = null
        this.hoverField = null

        this.modal = undefined
        this.timerTween = undefined
        this.timerRunning = false
        this.timerState.progress = 1
    }

    create() {
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdownScene, this)

        createWorkbench(this)

        this.trayPanel = this.add.graphics().setDepth(8)
        paintTray(this.trayPanel)

        this.hud = createHud(this, { onHelp: () => this.replayTutorial() })
        this.hud.setLevel(this.level.level)
        this.hud.setTitle(this.level.title)
        this.hud.setHint(this.level.tip)
        this.hud.setProgress(this.missionIdx, this.level.missions.length)

        this.timerBar = createTimerBar(this)
        this.requestCard = createRequestCard(this)
        this.reader = createReader(this)

        this.readButton = createBigButton(this, {
            x: READER.cx, y: READER.btnY, w: READER.btnW, h: READER.btnH,
            label: 'LER', tone: C.ok,
            onClick: () => void this.onRead(),
        })
        this.readButton.setEnabled(false)

        this.add.text(READER.cx, READER.noteY, 'testa se dá para recuperar', {
            fontFamily: 'DynaPuff, Arial, sans-serif', fontStyle: 'bold', fontSize: '15px',
            color: '#8ea3bd', align: 'center', wordWrap: { width: READER.w },
        }).setOrigin(0.5).setResolution(2).setDepth(30)

        this.input.on('pointermove', this.onPointerMove, this)
        this.input.on('pointerup', this.onPointerUp, this)
        EventBus.on('mute-audio', this.onMuteAudio, this)
        EventBus.on('show-tutorial', this.replayTutorial, this)
        this.registerPlatformCommands()

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        // O tutorial é a abertura do nível, não de uma missão qualquer: quem
        // entra direto na fase 3 para testar não quer ser apresentado ao jogo.
        void this.playMission(this.missionIdx === 0)
    }

    private shutdownScene() {
        this.gen += 1
        this.stopTimer()
        this.input.off('pointermove', this.onPointerMove, this)
        this.input.off('pointerup', this.onPointerUp, this)
        EventBus.off('mute-audio', this.onMuteAudio, this)
        EventBus.off('show-tutorial', this.replayTutorial, this)
        this.unsubPlatform?.()
        this.unsubPlatform = undefined
        this.input.setDefaultCursor('default')
    }

    /* ═══════════════════════════════════════════════ atalhos de estado */

    private get level(): Level { return LEVELS[this.levelIdx] }
    private get mission(): Mission { return this.level.missions[this.missionIdx] }
    private get missionTime(): number { return this.mission.time ?? this.level.time }

    /* ═══════════════════════════════════════════════ ciclo da missão */

    private clearBoard() {
        this.boxes.forEach(b => b.destroy())
        this.choiceBoxes.forEach(b => b.destroy())
        this.pieces.forEach(p => p.destroy())
        this.boxes = []
        this.choiceBoxes = []
        this.pieces.clear()
        this.pieceData.clear()
        this.fieldOccupant.clear()
        this.pieceAt.clear()
        this.flying.clear()
        this.unlocked = []
        this.drag = null
        this.hoverField = null
    }

    private async playMission(withTutorial: boolean) {
        const gen = ++this.gen

        this.state = 'briefing'
        /*
         * `locked` é estado de MOMENTO, não de missão, e precisa zerar aqui
         * junto com o resto.
         *
         * Sem esta linha, a missão que termina bem deixa a trava ligada: o
         * `onRead` liga antes de ler e o caminho de sucesso vai direto para o
         * `advance()` sem desligar. A missão seguinte montava as caixas e
         * entrava em 'choosing' normalmente, mas todo clique morria no
         * `if (this.locked)` do `onChoose` — as caixas até reagiam ao passar o
         * mouse, porque o hover só olha `tappable`, e só o clique sumia.
         */
        this.locked = false
        this.clearBoard()
        this.stopTimer()
        this.timerBar.set(1)
        this.reader.reset()
        this.readButton.setEnabled(false)

        // A bandeja só aparece quando há peça nela. Durante a escolha da
        // caixa ela ficava como um vazio marrom ocupando o terço de baixo da
        // tela, e vazio grande lê como "falta alguma coisa aqui".
        this.trayPanel.setVisible(false)

        const m = this.mission
        this.hud.setProgress(this.missionIdx, this.level.missions.length)
        /*
         * Cada missão traz a sua própria dica em `missions.ts`, e nenhuma
         * delas aparecia na tela: o HUD mostrava a dica do NÍVEL, escrita uma
         * vez no `create()` e nunca trocada. No N2 é justamente a dica da
         * missão que carrega a informação que falta — "o convite quer o mês
         * por extenso, o nome da foto quer o número" — sem a qual as duas
         * peças escritas `18` são indistinguíveis para quem está jogando.
         */
        this.hud.setHint(m.hint)
        this.emitCheckpoint()

        await this.requestCard.show(m.request, m.requestIcon)
        if (gen !== this.gen) return

        if (m.offer?.length) {
            this.buildChoice(m.offer)
            this.state = 'choosing'
        } else {
            this.buildBoard()
            this.state = 'filling'
        }

        if (withTutorial) {
            const steps = this.buildTutorialSteps()
            if (steps.length) {
                this.runTutorial(steps, false, () => {
                    if (gen !== this.gen) return
                    this.startTimer()
                })
                return
            }
        }

        this.startTimer()
    }

    /* ─────────────────────────────────────────── fase: escolher a caixa */

    private buildChoice(offer: FormatId[]) {
        const n = offer.length
        const w = BOXES.w3
        const total = n * w + (n - 1) * BOXES.gap
        const start = BENCH.cx - total / 2 + w / 2

        this.choiceBoxes = offer.map((format, i) => {
            const spec: FormatBoxSpec = {
                id: `choice-${format}`,
                format,
                title: FORMAT_INFO[format].title,
                subtitle: FORMAT_INFO[format].subtitle,
                fields: [],
            }

            const box = createFormatBox(this, spec, {
                x: start + i * (w + BOXES.gap),
                y: BOXES.cy,
                w,
                h: BOXES.h,
                showFields: false,
            })

            // prévia dos campos: a escolha precisa de informação, não de sorte
            drawBoxPreview(this, box, format)
            box.setTappable(true, () => void this.onChoose(format, box))
            FX.popIn(this, box.container, { from: 0.82, delay: 120 + i * 90, duration: 380 })

            return box
        })
    }

    private async onChoose(format: FormatId, box: FormatBox) {
        if (this.locked || this.state !== 'choosing') return

        const gen = this.gen
        const needed = this.mission.boxes[0].format
        this.playClick()

        if (format !== needed) {
            this.state = 'reading'
            this.locked = true
            this.choiceBoxes.forEach(b => b.setTappable(false))

            box.setState('rejected')
            void box.shake()
            this.playError()
            FX.shakeCam(this, 'leve')

            this.points += POINTS.missChoose
            this.errors += 1
            runtimeGameBridge.emit({
                type: 'WRONG_ANSWER', gameId: GAME_ID,
                pointsEarned: POINTS.missChoose, stage: this.level.level,
            })
            this.emitCheckpoint()

            this.pauseTimer()
            await this.reader.refuse(refusalLine(format, needed))
            if (gen !== this.gen) return

            box.setState('closed')
            this.locked = false
            this.state = 'choosing'
            this.choiceBoxes.forEach(b => b.setTappable(true))
            this.resumeTimer()
            return
        }

        // acertou: as outras saem, a caixa certa reaparece maior e aberta
        this.state = 'briefing'
        this.locked = true
        this.choiceBoxes.forEach(b => b.setTappable(false))

        this.points += POINTS.choose
        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER', gameId: GAME_ID,
            pointsEarned: POINTS.choose, stage: this.level.level,
        })
        this.emitCheckpoint()

        this.playCorrect()
        void FX.sparks(this, box.x, box.y, { color: formatTone(format), count: 16, spread: 140 })

        await FX.all(
            ...this.choiceBoxes
                .filter(b => b !== box)
                .map(b => FX.to(this, b.container, { alpha: 0, scale: 0.86 }, { duration: 240 })),
            FX.to(this, box.container, { alpha: 0 }, { duration: 240, delay: 120 }),
        )
        if (gen !== this.gen) return

        this.choiceBoxes.forEach(b => b.destroy())
        this.choiceBoxes = []

        this.buildBoard()
        this.locked = false
        this.state = 'filling'
    }

    /* ──────────────────────────────────────────── fase: preencher */

    private buildBoard() {
        const specs = this.mission.boxes
        const n = specs.length
        const w = n === 1 ? BOXES.w1 : BOXES.w2
        const total = n * w + (n - 1) * BOXES.gap
        const start = BENCH.cx - total / 2 + w / 2

        this.boxes = specs.map((spec, i) => createFormatBox(this, spec, {
            x: start + i * (w + BOXES.gap),
            y: BOXES.cy,
            w,
            h: BOXES.h,
            showFields: true,
        }))

        // A segunda caixa do N2 só abre quando a primeira encher: a criança
        // nunca olha para seis campos vazios ao mesmo tempo.
        this.unlocked = specs.map((_, i) => i === 0)
        this.boxes.forEach((box, i) => {
            box.setState(specs[i].preset ? 'broken' : this.unlocked[i] ? 'open' : 'closed')
            if (!this.unlocked[i]) {
                box.container.setAlpha(0.5)
                box.fields.forEach(f => { f.g.setVisible(false); f.label.setVisible(false) })
            }
            FX.popIn(this, box.container, { from: 0.84, delay: 100 + i * 110, duration: 380 })
        })

        const dealt = this.buildTray()
        this.applyPresets()
        this.syncReadButton()

        // depois da cascata de entrada: o `popIn` tenciona alfa até 1 e
        // apagaria qualquer peça que já tivesse sido escurecida antes dele
        const gen = this.gen
        void dealt.then(() => {
            if (gen !== this.gen) return
            this.syncTrayLocks()
        })
    }

    /**
     * Peça que só serve a caixa trancada entra apagada.
     *
     * No N2 a bandeja mostra desde o início as peças das DUAS caixas, mas só
     * a primeira aceita alguma coisa. Sem sinal nenhum, metade da bandeja
     * simplesmente não funciona e não há como saber por quê — foi a maior
     * fonte de confusão do nível. Apagada, a peça se explica sozinha, e
     * acende junto com a caixa dela.
     *
     * A intrusa nunca apaga: ela é isca por projeto, e apagá-la entregaria a
     * resposta antes de a criança pensar.
     */
    private syncTrayLocks() {
        if (this.boxes.length < 2) return

        const open = new Set<string>()
        const locked = new Set<string>()

        this.boxes.forEach((box, i) => {
            const target = this.unlocked[i] ? open : locked
            box.spec.fields.forEach(f => target.add(f.accepts))
        })

        this.pieces.forEach((view, id) => {
            const onlyLocked = !this.pieceAt.has(id) && locked.has(id) && !open.has(id)
            view.container.setAlpha(onlyLocked ? A.dim : 1)
        })
    }

    /** Todas as peças ganham casa na bandeja, inclusive as que já vêm postas. */
    private buildTray() {
        this.trayPanel.setVisible(true)
        const all = shufflePieces(this.mission.pieces)
        all.forEach(p => this.pieceData.set(p.id, p))

        const count = all.length
        const perRow = count > TRAY.perRowMax ? Math.ceil(count / 2) : count
        const rows = count > perRow ? 2 : 1
        const cw = Math.min(
            rows > 1 ? TRAY.cardWTight : TRAY.cardW,
            (TRAY.maxW - (perRow - 1) * TRAY.gap) / perRow,
        )
        const ch = rows > 1 ? TRAY.cardHTight : TRAY.cardH

        const views: PieceView[] = []

        for (let row = 0; row < rows; row += 1) {
            const slice = all.slice(row * perRow, row * perRow + perRow)
            const total = slice.length * cw + (slice.length - 1) * TRAY.gap
            const startX = TRAY.cx - total / 2 + cw / 2
            const y = rows === 1 ? TRAY.singleY : row === 0 ? TRAY.row1Y : TRAY.row2Y

            slice.forEach((piece, i) => {
                const view = createPiece(this, piece, {
                    x: startX + i * (cw + TRAY.gap),
                    y,
                    w: cw,
                    h: ch,
                    onDown: p => this.beginDrag(p.id),
                })
                this.pieces.set(piece.id, view)
                views.push(view)
            })
        }

        return dealIn(this, views)
    }

    /**
     * Nível 3: a caixa chega preenchida e errada.
     *
     * O preset ignora a regra de encaixe de propósito — é justamente assim
     * que um calendário vai parar num ponto de imagem. Ao ser retirado, ele
     * volta para a bandeja e nunca mais consegue entrar, porque não é cor.
     */
    private applyPresets() {
        this.boxes.forEach(box => {
            const preset = box.spec.preset
            if (!preset) return

            Object.entries(preset).forEach(([fieldId, pieceId]) => {
                const view = this.pieces.get(pieceId)
                const field = box.fields.find(f => f.field.id === fieldId)
                if (!view || !field) return

                this.assign(pieceId, box.spec.id, fieldId)
                view.container.setPosition(field.x, field.y).setScale(field.pieceScale)
                view.place(true)
                view.compact(field.field.kind === 'pixel')
                box.setFieldState(fieldId, 'filled')
            })
        })
    }

    /* ═══════════════════════════════════════════════ ocupação dos campos */

    private assign(pieceId: string, boxId: string, fieldId: string) {
        this.fieldOccupant.set(key(boxId, fieldId), pieceId)
        this.pieceAt.set(pieceId, { boxId, fieldId })
    }

    private unassign(pieceId: string) {
        const at = this.pieceAt.get(pieceId)
        if (!at) return null
        this.fieldOccupant.delete(key(at.boxId, at.fieldId))
        this.pieceAt.delete(pieceId)
        return at
    }

    private isBoxFull(box: FormatBox) {
        return box.spec.fields.every(f => this.fieldOccupant.has(key(box.spec.id, f.id)))
    }

    /**
     * Fonte única do estado do botão LER.
     *
     * Nenhum outro lugar decide. No Chef, cada ponto de mutação decidia
     * sozinho e bastava um ficar para trás numa borda do fluxo para o botão
     * nunca acender — a criança ficava com a caixa cheia e nada para apertar.
     */
    private syncReadButton() {
        const ready = this.state === 'filling'
            && !this.locked
            && this.flying.size === 0
            && this.boxes.length > 0
            && this.boxes.every(b => this.isBoxFull(b))
        this.readButton.setEnabled(ready)
    }

    /** Abre a segunda caixa do N2 quando a primeira fica cheia. */
    private refreshLocks() {
        if (this.boxes.length < 2) return

        const shouldOpen = this.isBoxFull(this.boxes[0])
        if (shouldOpen === this.unlocked[1]) return

        this.unlocked[1] = shouldOpen
        const box = this.boxes[1]

        if (shouldOpen) {
            box.container.setAlpha(1)
            box.fields.forEach(f => { f.g.setVisible(true); f.label.setVisible(true) })
            box.setState('open')
            FX.to(this, box.container, { scale: 1.05 }, { duration: 200, yoyo: true, ease: Ease.back(2) })
            void FX.ping(this, box.x, box.y, formatTone(box.spec.format), { radius: 110 })
            this.playUnlock()
            this.syncTrayLocks()
        } else {
            // esvaziou a primeira: a segunda tranca de novo e devolve o que tinha
            box.spec.fields.forEach(f => {
                const occ = this.fieldOccupant.get(key(box.spec.id, f.id))
                if (occ) this.returnHome(occ)
            })
            box.container.setAlpha(0.5)
            box.fields.forEach(f => { f.g.setVisible(false); f.label.setVisible(false) })
            box.setState('closed')
            this.syncTrayLocks()
        }
    }

    /* ═══════════════════════════════════════════════ arrastar e soltar */

    private beginDrag(pieceId: string) {
        if (this.locked || this.ended || this.state !== 'filling') return
        // Um arraste por vez. Dois pointerdown no mesmo frame (dois dedos no
        // tablet) criavam dois arrastes do mesmo id e a peça se duplicava.
        if (this.drag || this.flying.has(pieceId)) return

        const view = this.pieces.get(pieceId)
        if (!view) return

        const from = this.pieceAt.get(pieceId) ?? null
        if (from) {
            const box = this.boxes.find(b => b.spec.id === from.boxId)
            if (box && !this.unlocked[this.boxes.indexOf(box)]) return
            this.unassign(pieceId)
            box?.setFieldState(from.fieldId, 'empty')
            this.playPull()
        } else {
            this.playPick()
        }

        this.drag = { pieceId, view, from }
        view.container.setDepth(140)
        view.place(false)
        view.lift(true)
        view.compact(false)
        FX.kill(this, view.container)
        FX.to(this, view.container, { scale: 1.14, angle: -3 }, { duration: 120, ease: Ease.back(2) })

        this.syncReadButton()
    }

    private onPointerMove(pointer: Phaser.Input.Pointer) {
        if (!this.drag || this.locked) return

        this.drag.view.container.setPosition(pointer.x, pointer.y)

        const target = this.findField(pointer.x, pointer.y)
        if (target?.field === this.hoverField?.field) return

        if (this.hoverField) {
            const occupied = this.fieldOccupant.has(
                key(this.hoverField.box.spec.id, this.hoverField.field.field.id),
            )
            this.hoverField.box.setFieldState(this.hoverField.field.field.id, occupied ? 'filled' : 'empty')
        }

        this.hoverField = target
        if (target) target.box.setFieldState(target.field.field.id, 'hover')
    }

    private onPointerUp(pointer: Phaser.Input.Pointer) {
        if (!this.drag) return

        const drag = this.drag
        const target = this.findField(pointer.x, pointer.y)
        this.drag = null
        this.hoverField = null

        drag.view.lift(false)

        if (!target) {
            this.explainRefusal(drag.pieceId, pointer)
            this.returnHome(drag.pieceId)
            return
        }
        void this.place(drag.pieceId, target.box, target.field, drag.from)
    }

    /**
     * Por que a caixa não aceitou.
     *
     * O `findField` recusa em silêncio: pula a caixa trancada e a de outro
     * formato, devolve `null`, e a peça simplesmente volta para a bandeja. Do
     * lado de quem joga isso é indistinguível de um jogo quebrado — foi o que
     * deixou o N2 confuso, e a criança repete o mesmo arraste esperando que
     * funcione.
     *
     * Aqui a recusa vira frase. Segue a regra do leitor (MECANICA.md): relata
     * o que houve, não julga. Nada de "errado" nem som de erro — recusar dado
     * de outro tipo é a DEFINIÇÃO do formato, não um erro de quem jogou.
     */
    private explainRefusal(pieceId: string, pointer: Phaser.Input.Pointer) {
        const piece = this.pieceData.get(pieceId)
        if (!piece) return

        // Área da caixa inteira, não do poço: com a caixa trancada os poços
        // estão invisíveis, e ninguém mira num alvo que não vê.
        const i = this.boxes.findIndex(b =>
            Math.abs(pointer.x - b.x) <= b.w / 2 && Math.abs(pointer.y - b.y) <= b.h / 2)
        if (i < 0) return

        const box = this.boxes[i]

        if (!this.unlocked[i]) {
            const first = this.boxes[0]
            showToast(this, `A ${box.spec.title} abre quando a ${first.spec.title} encher.`, C.idle, 2200)
            void first.shine()
            return
        }

        if (piece.format !== box.spec.format) {
            showToast(this, `${box.spec.title} guarda ${FORMAT_INFO[box.spec.format].guards}.`, C.idle, 2200)
        }
    }

    /** Só devolve o campo se a peça de fato pode entrar nele. */
    private findField(x: number, y: number) {
        if (!this.drag) return null
        const piece = this.pieceData.get(this.drag.pieceId)
        if (!piece) return null

        for (let i = 0; i < this.boxes.length; i += 1) {
            const box = this.boxes[i]
            if (!this.unlocked[i]) continue
            // A caixa recusa dado de OUTRO TIPO — isso não é a resposta, é a
            // definição do formato. O dado do tipo certo no campo errado ela
            // aceita, senão o leitor não teria erro nenhum para mostrar e o
            // Nível 3 deixaria de existir.
            if (piece.format !== box.spec.format) continue

            const field = box.fieldAt(x, y)
            if (field) return { box, field }
        }
        return null
    }

    private async place(
        pieceId: string,
        box: FormatBox,
        field: FieldView,
        from: { boxId: string; fieldId: string } | null,
    ) {
        const view = this.pieces.get(pieceId)
        if (!view) return

        const gen = this.gen
        const occupantId = this.fieldOccupant.get(key(box.spec.id, field.field.id))

        // Reserva a vaga ANTES do voo: a checagem do próximo arraste precisa
        // enxergar esta peça mesmo antes de ela aterrissar.
        this.assign(pieceId, box.spec.id, field.field.id)
        this.flying.add(pieceId)
        this.playDrop()
        this.syncReadButton()

        if (occupantId && occupantId !== pieceId) {
            if (from) {
                // troca: o ocupante vai para o campo que esta peça deixou
                this.assign(occupantId, from.boxId, from.fieldId)
                const fromBox = this.boxes.find(b => b.spec.id === from.boxId)
                const fromField = fromBox?.fields.find(f => f.field.id === from.fieldId)
                const occView = this.pieces.get(occupantId)
                if (fromBox && fromField && occView) {
                    occView.place(true)
                    occView.compact(fromField.field.kind === 'pixel')
                    fromBox.setFieldState(from.fieldId, 'filled')
                    void flyToField(this, occView.container, fromField, fromField.pieceScale, 260)
                }
            } else {
                this.returnHome(occupantId)
            }
        }

        view.container.setDepth(120)
        FX.kill(this, view.container)
        await flyToField(this, view.container, field, field.pieceScale)

        this.flying.delete(pieceId)

        if (gen !== this.gen) {
            view.destroy()
            return
        }

        view.container.setDepth(40)
        view.place(true)
        view.compact(field.field.kind === 'pixel')
        box.setFieldState(field.field.id, 'filled')
        void FX.ping(this, field.x, field.y, box.tone, { radius: 70, duration: 420 })

        this.refreshLocks()
        this.syncReadButton()

        // Caixa cheia ganha um brilho, NÃO o estado verde.
        //
        // Verde tem um significado só no jogo inteiro: o leitor recuperou a
        // informação. Pintar a caixa de verde só por estar cheia fazia a tela
        // dizer "certo" enquanto o visor mostrava a leitura em vermelho — as
        // duas metades da tela discordando no mesmo instante.
        if (this.isBoxFull(box)) void box.shine()
    }

    private returnHome(pieceId: string) {
        const view = this.pieces.get(pieceId)
        if (!view) return

        const at = this.unassign(pieceId)
        if (at) {
            const box = this.boxes.find(b => b.spec.id === at.boxId)
            box?.setFieldState(at.fieldId, 'empty')
            box?.setState(box.spec.preset ? 'broken' : 'open')
        }

        view.container.setDepth(40)
        view.place(false)
        view.compact(false)
        view.lift(false)
        FX.kill(this, view.container)
        FX.to(
            this, view.container,
            { x: view.homeX, y: view.homeY, scale: 1, angle: 0 },
            { duration: 320, ease: Ease.settle },
        )

        this.refreshLocks()
        this.syncReadButton()
    }

    /* ═══════════════════════════════════════════════════════ o leitor */

    private async onRead() {
        if (this.locked || this.state !== 'filling') return

        const gen = this.gen
        this.state = 'reading'
        this.locked = true
        this.readButton.setEnabled(false)
        this.pauseTimer()
        this.playScan()

        const readings: BoxReading[] = this.boxes.map(box => {
            const placed: Record<string, string | undefined> = {}
            box.spec.fields.forEach(f => {
                placed[f.id] = this.fieldOccupant.get(key(box.spec.id, f.id))
            })
            return readBox(box.spec, placed, this.pieceData)
        })

        await this.reader.read(readings)
        if (gen !== this.gen) return

        const ok = readings.every(r => r.ok)

        if (ok) {
            this.hits += 1
            this.points += POINTS.read
            this.playSolved()
            runtimeGameBridge.emit({
                type: 'CORRECT_ANSWER', gameId: GAME_ID,
                pointsEarned: POINTS.read, stage: this.level.level,
            })
            this.emitCheckpoint()

            this.state = 'solved'
            this.stopTimer()

            this.boxes.forEach(b => { b.setState('full'); void b.shine() })
            void FX.stars(this, BENCH.cx, BOXES.cy, { color: C.ok, count: 14, rise: 150 })
            showToast(this, this.mission.successLine, C.ok, 2200)

            await FX.wait(this, 2400)
            if (gen !== this.gen) return
            this.advance()
            return
        }

        // falhou: marca os campos culpados e devolve o controle
        this.errors += 1
        this.points += POINTS.missRead
        this.playError()
        FX.shakeCam(this, 'leve')
        runtimeGameBridge.emit({
            type: 'WRONG_ANSWER', gameId: GAME_ID,
            pointsEarned: POINTS.missRead, stage: this.level.level,
        })
        this.emitCheckpoint()

        readings.forEach((reading, i) => {
            const box = this.boxes[i]
            if (reading.ok) return
            box.setState(box.spec.preset ? 'broken' : 'rejected')
            void box.shake()
            reading.cells.forEach(cell => {
                if (cell.ok) return
                box.setFieldState(cell.field.id, 'wrong')
                const occ = this.fieldOccupant.get(key(box.spec.id, cell.field.id))
                const view = occ ? this.pieces.get(occ) : undefined
                if (view) void FX.shake(this, view.container, { amount: 10, times: 3 })
            })
        })

        await FX.wait(this, 900)
        if (gen !== this.gen) return

        this.boxes.forEach(box => {
            box.resetFields(fieldId => this.fieldOccupant.has(key(box.spec.id, fieldId)))
            box.setState(box.spec.preset ? 'broken' : 'open')
        })

        this.locked = false
        this.state = 'filling'
        this.resumeTimer()
        this.syncReadButton()
    }

    /* ═══════════════════════════════════════════════════ cronômetro */

    private startTimer() {
        if (this.ended) return
        const gen = this.gen

        this.timerTween?.stop()
        this.timerState.progress = 1
        this.timerRunning = true
        this.timerBar.set(1)

        this.timerTween = this.tweens.add({
            targets: this.timerState,
            progress: 0,
            duration: this.missionTime * 1000,
            ease: 'Linear',
            onUpdate: () => this.timerBar.set(this.timerState.progress),
            onComplete: () => {
                if (!this.timerRunning || gen !== this.gen) return
                this.timerRunning = false
                void this.onTimeout()
            },
        })
    }

    private pauseTimer() { this.timerTween?.pause() }

    private resumeTimer() {
        if (this.timerRunning) this.timerTween?.resume()
    }

    private stopTimer() {
        this.timerRunning = false
        this.timerTween?.stop()
        this.timerTween = undefined
    }

    /**
     * Tempo esgotado custa pontos e devolve a missão ao ponto de partida.
     * Nunca encerra a partida: este jogo ensina por tentativa e leitura do
     * erro, e encerrar puniria exatamente o comportamento que queremos.
     */
    private async onTimeout() {
        if (this.ended || this.state === 'solved') return

        const gen = ++this.gen
        this.state = 'timeout'
        this.locked = true
        this.readButton.setEnabled(false)
        this.drag = null
        this.hoverField = null

        this.timerBar.flashFail()
        this.playError()

        this.errors += 1
        this.points += POINTS.timeout
        runtimeGameBridge.emit({
            type: 'WRONG_ANSWER', gameId: GAME_ID,
            pointsEarned: POINTS.timeout, stage: this.level.level,
        })
        this.emitCheckpoint()

        await this.reader.refuse('Acabou o tempo. Vamos de novo.')
        if (gen !== this.gen) return

        if (this.state === 'timeout' && this.choiceBoxes.length) {
            // estourou ainda escolhendo: só devolve o controle
            this.locked = false
            this.state = 'choosing'
            this.choiceBoxes.forEach(b => b.setTappable(true))
            this.startTimer()
            return
        }

        // devolve as peças e, no N3, restaura o defeito de origem
        const ids = [...this.pieceAt.keys()]
        ids.forEach(id => this.unassign(id))
        this.boxes.forEach(box => {
            box.resetFields(() => false)
            box.setState(box.spec.preset ? 'broken' : 'open')
        })

        await FX.stagger(
            this,
            ids.map(id => this.pieces.get(id)!.container).filter(Boolean),
            (node, i) => {
                const view = this.pieces.get(ids[i])!
                return FX.to(
                    this, node,
                    { x: view.homeX, y: view.homeY, scale: 1, angle: 0 },
                    { duration: 280, ease: Ease.settle },
                )
            },
            60,
        )
        if (gen !== this.gen) return

        this.pieces.forEach(p => { p.place(false); p.compact(false) })
        this.applyPresets()
        this.unlocked = this.boxes.map((_, i) => i === 0)
        this.refreshLocks()

        this.locked = false
        this.state = 'filling'
        this.startTimer()
        this.syncReadButton()
    }

    /* ═══════════════════════════════════════════════ avanço de nível */

    private advance() {
        this.missionIdx += 1

        if (this.missionIdx >= this.level.missions.length) {
            this.endLevel()
            return
        }
        void this.playMission(false)
    }

    private endLevel() {
        this.ended = true
        this.locked = true
        this.gen += 1
        this.stopTimer()
        this.hud.setProgress(this.level.missions.length, this.level.missions.length)
        this.hud.setHelpEnabled(false)

        runtimeGameBridge.emit({
            type: 'GAME_COMPLETED', gameId: GAME_ID, stage: this.level.level, totalStages: LEVELS.length,
        })
        this.emitCheckpoint(true)

        const lvl = this.level.level
        const next = lvl < 3 ? (lvl + 1) as 2 | 3 : null

        if (next) {
            this.modal = showLevelComplete(this, {
                title: 'Muito bem!',
                subtitle: `Nível ${lvl} concluído`,
                message: this.level.objective,
                accent: C.pixels,
                panelColor: C.panel,
                overlayColor: C.ink,
                progress: { total: 3, current: lvl },
                autoAdvance: {
                    delay: 2300,
                    label: 'Preparando o próximo nível...',
                    onComplete: () => this.scene.restart({ level: next, points: this.points }),
                },
            })
            return
        }

        FX.confetti(this, { colors: [C.date, C.pixels, C.text, C.ok] })
        this.modal = showLevelComplete(this, {
            title: 'Formatos dominados!',
            subtitle: 'Você guardou e recuperou todas as informações',
            message: `Acertos: ${this.hits}  ·  Erros: ${this.errors}  ·  Pontos: ${Math.max(0, this.points)}`,
            accent: C.ok,
            panelColor: C.panel,
            overlayColor: C.ink,
            progress: { total: 3, current: 3 },
            buttons: [
                {
                    label: 'Jogar de novo',
                    color: C.ok,
                    onClick: () => this.scene.restart({ level: 1, points: 0 }),
                },
                {
                    label: 'Escolher jogo',
                    color: C.pixels,
                    onClick: () => EventBus.emit('exit-game'),
                },
            ],
        })
    }

    /* ═══════════════════════════════════════════════════════ tutorial */

    private spots() {
        return {
            request: { x: REQUEST.cx, y: REQUEST.cy, w: REQUEST.w + 28, h: REQUEST.h + 28 },
            boxes: { x: BENCH.cx, y: BOXES.cy, w: 928, h: BOXES.h + 44 },
            tray: { x: TRAY.cx, y: TRAY.y + TRAY.h / 2, w: TRAY.w + 20, h: TRAY.h + 20 },
            readBtn: { x: READER.cx, y: READER.btnY, w: READER.btnW + 34, h: READER.btnH + 30 },
            screen: { x: READER.cx, y: READER.screenY, w: READER.screenW + 44, h: READER.screenH + 44 },
        }
    }

    /**
     * Todo passo fixa `balloonY`. A heurística automática do `createTutorial`
     * mede a altura do texto e escolhe acima/abaixo; com o holofote na
     * bandeja, que é baixa, a conta cai em cima das caixas e o botão
     * "Próximo" pousa sobre o campo que o passo anterior mandou olhar.
     */
    private buildTutorialSteps(): TutorialStep[] {
        const spot = this.spots()
        const OVER_BOXES = 366
        const OVER_TRAY = 596

        if (this.level.level === 2) {
            return [
                {
                    text: 'Agora são duas caixas — e a informação a guardar é a mesma nas duas.',
                    shape: 'rect', ...spot.boxes, balloonY: OVER_TRAY,
                },
                {
                    text: 'A segunda caixa abre sozinha quando a primeira ficar cheia.',
                    shape: 'rect', ...spot.tray, balloonY: OVER_BOXES,
                },
            ]
        }

        if (this.level.level === 3) {
            return [
                {
                    text: 'Esta caixa chegou preenchida errado. Repare na borda tracejada.',
                    shape: 'rect', ...spot.boxes, balloonY: OVER_TRAY,
                },
                {
                    text: 'Aperte LER primeiro para ver o que saiu — depois é só consertar.',
                    shape: 'rect', ...spot.readBtn, balloonX: 500, balloonY: OVER_BOXES,
                },
            ]
        }

        return [
            {
                text: 'Aqui está a informação que você precisa guardar.',
                shape: 'rect', ...spot.request, balloonY: OVER_BOXES,
            },
            {
                text: 'Escolha a caixa que sabe guardar esse tipo de informação.',
                shape: 'rect', ...spot.boxes, balloonY: OVER_TRAY,
            },
            {
                text: 'Depois arraste os dados da bandeja para os campos da caixa.',
                shape: 'rect', ...spot.tray, balloonY: OVER_BOXES,
            },
            {
                text: 'E aperte LER: o leitor tenta recuperar a informação e mostra o que saiu.',
                shape: 'rect', ...spot.readBtn, balloonX: 500, balloonY: OVER_BOXES,
            },
        ]
    }

    private runTutorial(steps: TutorialStep[], force: boolean, onFinish: () => void) {
        this.locked = true
        this.hud.setHelpEnabled(false)
        this.readButton.setEnabled(false)

        createTutorial(this, {
            key: `ef03co05-l${this.level.level}`,
            once: !force,
            accent: C.pixels,
            safeTop: HUD.y + HUD.h + 12,
            steps,
            onFinish: () => {
                this.locked = false
                this.hud.setHelpEnabled(true)
                this.syncReadButton()
                onFinish()
            },
        })
    }

    private replayTutorial = () => {
        if (this.ended || this.locked) return
        if (this.state !== 'filling' && this.state !== 'choosing') return

        const gen = this.gen
        const steps = this.buildTutorialSteps()
        if (!steps.length) return

        const back = this.state
        this.pauseTimer()

        this.runTutorial(steps, true, () => {
            if (gen !== this.gen || this.ended) return
            this.state = back
            this.resumeTimer()
        })
    }

    /* ═══════════════════════════════════════════════════════ plataforma */

    private emitCheckpoint(forceComplete = false) {
        const before = LEVELS.slice(0, this.levelIdx).reduce((s, l) => s + l.missions.length, 0)
        const done = before + this.missionIdx + (forceComplete ? 1 : 0)

        runtimeGameBridge.emit({
            type: 'CHECKPOINT',
            gameId: GAME_ID,
            progress: Math.round((done / TOTAL_MISSIONS) * 100),
            score: Math.max(0, this.points),
            stage: this.level.level,
            hits: this.hits,
            errors: this.errors,
        })
    }

    private registerPlatformCommands() {
        this.unsubPlatform = runtimeGameBridge.onCommand((cmd: PlatformCommand) => {
            if (cmd.type !== 'START_GAME') return
            this.points = cmd.points ?? this.points
        })
    }

    private onMuteAudio = (muted: boolean) => { this.isMuted = muted }

    /* ═══════════════════════════════════════════════════════════ áudio */

    private getAudioCtx(): AudioContext | null {
        if (this.isMuted) return null
        try {
            return (this.sound as Phaser.Sound.WebAudioSoundManager).context
        } catch {
            return null
        }
    }

    private playTone(freq: number, dur: number, type: OscillatorType = 'sine', gain = 0.1) {
        const ctx = this.getAudioCtx()
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

    private playClick() { this.playTone(480, 0.045, 'triangle', 0.06) }
    private playPick() { this.playTone(420, 0.045, 'sine', 0.07) }
    private playPull() { this.playTone(380, 0.05, 'sine', 0.06) }
    private playDrop() { this.playTone(560, 0.06, 'triangle', 0.08) }
    private playError() { this.playTone(210, 0.18, 'square', 0.1) }
    private playUnlock() {
        this.playTone(620, 0.07, 'sine', 0.09)
        this.time.delayedCall(90, () => this.playTone(880, 0.09, 'sine', 0.08))
    }
    private playScan() {
        this.playTone(700, 0.05, 'sine', 0.05)
        this.time.delayedCall(220, () => this.playTone(900, 0.05, 'sine', 0.05))
    }
    private playCorrect() {
        this.playTone(620, 0.08, 'sine', 0.12)
        this.time.delayedCall(85, () => this.playTone(820, 0.1, 'sine', 0.1))
    }
    private playSolved() {
        [523, 659, 784].forEach((f, i) =>
            this.time.delayedCall(i * 110, () => this.playTone(f, 0.18, 'sine', 0.14)))
    }
}
