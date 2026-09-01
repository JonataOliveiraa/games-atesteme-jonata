import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { FX, Ease } from '../../../../shared/effects/FX'
import { LEVELS } from '../data/challenges'
import { C, A, FONT, SIZE, hex, ICON_FALLBACK, type ChefFrameKey } from '../data/theme'
import { W, H, HUD, BOARD, CHEF, MISSION_CARD, DROPS, BANK, CHIP } from '../data/layout'
import {
    paintPlate, paintCard, paintBoard, waitBadge, createChefDialog, createBigButton,
    createRoundButton, flyToPlate, plateAccept, plateComplete, dealIn, showToast,
    comparePlans, type ChefDialog, type BigButton, type PlateState,
} from './effects'
import type { ChefMission, PlayState, SequenceStep, SubtaskPlate } from '../types'

const GAME_ID = 'chef-dos-subproblemas'

type DragKind = 'action' | 'subtask'
type DropKind = 'split' | 'order' | 'combine'

interface CardInfo {
    label: string
    iconKey: string
    hasWait?: boolean
}

interface DropView {
    id: string
    kind: DropKind
    x: number
    y: number
    w: number
    h: number
    capacity: number
    bg: Phaser.GameObjects.Graphics
    box: Phaser.GameObjects.Container
    helper?: Phaser.GameObjects.Text
    count?: Phaser.GameObjects.Text
    sealed?: boolean
}

export class GameScene extends Phaser.Scene {
    private levelIdx = 0
    private missionIdx = 0
    private points = 0
    private hits = 0
    private errors = 0
    private state: PlayState = 'intro'
    private locked = false
    private ended = false
    private isMuted = false

    private stage?: Phaser.GameObjects.Container
    private hud?: Phaser.GameObjects.Container
    private chefLayer?: Phaser.GameObjects.Container
    /** O botão vive fora da camada da chef: no modo foco ela sobe acima de tudo. */
    private actionLayer?: Phaser.GameObjects.Container
    private chef?: Phaser.GameObjects.Image
    private dialog?: ChefDialog
    private primary?: BigButton
    private idleTween?: Phaser.Tweens.Tween

    private drops: DropView[] = []
    private cards = new Map<string, Phaser.GameObjects.Container>()
    private chips = new Map<string, Phaser.GameObjects.Container>()
    private homes = new Map<string, { x: number; y: number; w: number; h: number }>()
    private placed = new Map<string, string>()
    private drag: { id: string; kind: DragKind; node: Phaser.GameObjects.Container } | null = null
    private hoverDrop: DropView | null = null
    private orderSubtasks: SubtaskPlate[] = []
    private orderIndex = 0
    private unsubPlatform?: () => void

    /**
     * Ids cujo cartão ainda está voando para o prato. Enquanto voam, eles já
     * contam em `placed` (para a checagem de capacidade fechar), mas NÃO podem
     * virar ficha — senão o jogador vê o cartão no ar e a ficha no prato ao
     * mesmo tempo, que era a duplicação relatada.
     */
    private flying = new Set<string>()

    /**
     * Geração da tela. Todo `clearStage` incrementa. Callbacks atrasados
     * comparam contra o valor que capturaram e desistem se a tela já trocou —
     * sem isso, um `delayedCall` da fase anterior mexe em objetos destruídos.
     */
    private stageGen = 0

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number }) {
        this.levelIdx = Phaser.Math.Clamp(data.level ?? 1, 1, 3) - 1
        this.missionIdx = 0
        this.points = data.points ?? 0
        this.hits = 0
        this.errors = 0
        this.state = 'intro'
        this.locked = false
        this.ended = false
        this.orderIndex = 0
    }

    create() {
        this.drawBackground()
        this.registerPlatformCommands()
        this.input.on('pointermove', this.onPointerMove, this)
        this.input.on('pointerup', this.onPointerUp, this)
        EventBus.on('mute-audio', this.onMuteAudio, this)
        EventBus.on('show-tutorial', this.replayTutorial, this)
        this.events.once('shutdown', this.shutdownScene, this)

        // A cozinheira vive fora do `stage`: ela não é redesenhada a cada etapa,
        // então a fala e a pose sobrevivem à troca de tela.
        this.chefLayer = this.add.container(0, 0).setDepth(12)
        this.actionLayer = this.add.container(0, 0).setDepth(13)
        this.buildChef()

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()
        this.showSplit()
    }

    private get level() { return LEVELS[this.levelIdx] }
    private get mission(): ChefMission { return this.level.missions[this.missionIdx] }

    private shutdownScene() {
        this.input.off('pointermove', this.onPointerMove, this)
        this.input.off('pointerup', this.onPointerUp, this)
        EventBus.off('mute-audio', this.onMuteAudio, this)
        EventBus.off('show-tutorial', this.replayTutorial, this)
        this.idleTween?.remove()
        this.dialog?.destroy()
        this.unsubPlatform?.()
    }

    private registerPlatformCommands() {
        this.unsubPlatform = runtimeGameBridge.onCommand((cmd: PlatformCommand) => {
            if (cmd.type === 'START_GAME') this.points = cmd.points ?? this.points
        })
    }

    private onMuteAudio(muted: boolean) {
        this.isMuted = muted
    }

    private drawBackground() {
        const bg = this.add.image(W / 2, H / 2, 'bg-chef-bancada').setDepth(-20)
        bg.setScale(Math.max(W / bg.width, H / bg.height))
        const veil = this.add.graphics().setDepth(-19)
        veil.fillStyle(C.ink, A.veil)
        veil.fillRect(0, 0, W, H)
        // vinheta leve: puxa o olho para a bancada
        veil.fillStyle(C.ink, 0.18)
        veil.fillRect(0, 0, W, 60)
        veil.fillRect(0, H - 60, W, 60)
    }

    /* ─────────────────────────────────────────────────────── cozinheira */

    private buildChef() {
        if (!this.chefLayer) return
        this.chef = this.add.image(CHEF.cx, CHEF.y, 'chef-c1')
        this.fit(this.chef, CHEF.maxW, CHEF.maxH)
        this.chefLayer.add(this.chef)
        this.dialog = createChefDialog(this, this.chefLayer, this.chef, 12)
        // respiração contínua — a personagem nunca fica "morta" na tela
        this.idleTween = FX.float(this, this.chef, { amount: 7, duration: 2200 })
    }

    /** Troca de pose, sem falar. */
    private setPose(frame: ChefFrameKey) {
        if (!this.chef) return
        this.chef.setTexture(`chef-${frame}`)
        // `fit` recalcula a escala base; o modo foco multiplica sobre ela.
        this.fit(this.chef, CHEF.maxW, CHEF.maxH)
        FX.impact(this, this.chef, 0.1)
    }

    /** Comentário curto de canto. Não bloqueia o jogo. */
    private react(frame: ChefFrameKey, line: string) {
        this.setPose(frame)
        this.dialog?.react(line)
    }

    /**
     * Aula: escurece a bancada, aproxima a cozinheira e avança no "Próximo".
     * Trava a interação enquanto ela fala e devolve o controle no fim.
     */
    private async speak(frame: ChefFrameKey, ...lines: Array<string | undefined>) {
        const gen = this.stageGen
        this.setPose(frame)
        this.locked = true
        this.syncPrimary()

        await this.dialog?.speak(lines.filter((l): l is string => !!l))

        if (gen !== this.stageGen) return
        this.locked = false
        this.syncPrimary()
    }

    /* ─────────────────────────────────────────────────────────── HUD */

    private renderHud() {
        this.hud?.destroy()
        this.hud = this.add.container(0, 0).setDepth(80)

        const bg = this.add.graphics()
        bg.fillStyle(C.ink, 0.94)
        bg.fillRoundedRect(HUD.x, HUD.y, HUD.w, HUD.h, 24)
        bg.fillStyle(C.cream, 0.08)
        bg.fillRoundedRect(HUD.x + 14, HUD.y + 10, HUD.w - 28, 20, 10)
        bg.lineStyle(3, C.gold, 0.8)
        bg.strokeRoundedRect(HUD.x, HUD.y, HUD.w, HUD.h, 24)
        this.hud.add(bg)

        const pill = this.add.graphics()
        pill.fillStyle(C.gold, 1)
        pill.fillRoundedRect(HUD.pillX, HUD.pillY, HUD.pillW, HUD.pillH, HUD.pillH / 2)
        pill.fillStyle(C.white, 0.26)
        pill.fillRoundedRect(HUD.pillX + 10, HUD.pillY + 6, HUD.pillW - 20, 12, 6)
        this.hud.add(pill)

        this.hud.add(this.add.text(HUD.pillX + HUD.pillW / 2, HUD.cy, `NÍVEL ${this.level.level}`, {
            fontFamily: FONT.black, fontSize: SIZE.hudLevel, color: hex(C.ink),
        }).setOrigin(0.5).setResolution(2))

        // Progresso da fase em pontinhos: lê-se sem alfabetização.
        const total = this.level.missions.length
        const dots = this.add.graphics()
        for (let i = 0; i < total; i += 1) {
            const dx = HUD.phaseX + i * 30
            const done = i < this.missionIdx
            const now = i === this.missionIdx
            dots.fillStyle(done ? C.greenLight : now ? C.gold : C.cream, done || now ? 1 : 0.3)
            if (now) dots.fillRoundedRect(dx - 14, HUD.cy - 8, 28, 16, 8)
            else dots.fillCircle(dx, HUD.cy, 8)
        }
        this.hud.add(dots)

        this.hud.add(this.add.text(HUD.titleX, HUD.cy, this.mission.title, {
            fontFamily: FONT.black, fontSize: SIZE.hudMission, color: hex(C.cream),
            align: 'center', wordWrap: { width: 560 },
        }).setOrigin(0.5).setResolution(2))

        this.hud.add(createRoundButton(this, HUD.helpX, HUD.cy, HUD.helpR, '?', () => this.replayTutorial()))

        FX.slideIn(this, this.hud, { dy: 26, duration: 340 })
    }

    /* ───────────────────────────────────────────────────── etapa: dividir */

    private showSplit() {
        this.clearStage()
        this.renderHud()
        this.drawBoard('Divida em pratos', 'Cada prato é uma parte menor do pedido.')
        this.state = 'split'
        this.locked = false

        this.drawMissionCard(this.mission.splitInstruction)
        this.drawSplitDrops()
        this.drawBank(Phaser.Utils.Array.Shuffle([...this.mission.actions]).map(a => a.id), 'action')
        this.primary = this.makePrimary('Testar plano', () => this.checkSplit())
        this.syncPrimary()
        this.emitCheckpoint()

        // A aula vem antes do tutorial: ela explica, depois o holofote aponta.
        const gen = this.stageGen
        const firstOfLevel = (this.level.level === 1 || this.level.level === 2) && this.missionIdx === 0
        void this.speak(
            this.introFrame(),
            this.mission.chefLine,
            firstOfLevel ? this.mission.splitInstruction : undefined,
        ).then(() => {
            if (gen !== this.stageGen || !firstOfLevel) return
            this.runSplitTutorial(false)
        })
    }

    private drawMissionCard(instruction: string) {
        const box = this.add.container(MISSION_CARD.cx, MISSION_CARD.cy)
        const { w, h, r } = MISSION_CARD
        const bg = this.add.graphics()
        bg.fillStyle(C.shadow, 0.18)
        bg.fillRoundedRect(-w / 2 + 5, -h / 2 + 9, w, h, r)
        bg.fillStyle(C.cream, 0.99)
        bg.fillRoundedRect(-w / 2, -h / 2, w, h, r)
        bg.fillStyle(C.gold, 0.2)
        bg.fillRoundedRect(-w / 2 + 14, -h / 2 + 12, w - 28, 18, 9)
        bg.lineStyle(5, C.gold, 0.95)
        bg.strokeRoundedRect(-w / 2, -h / 2, w, h, r)

        const halo = this.add.graphics()
        halo.fillStyle(C.gold, 0.26)
        halo.fillCircle(MISSION_CARD.iconX, 0, 46)

        const icon = this.add.image(MISSION_CARD.iconX, 0, this.safeIcon(this.mission.goalIconKey))
        this.fit(icon, MISSION_CARD.iconSize, MISSION_CARD.iconSize)

        const title = this.add.text(MISSION_CARD.titleX, MISSION_CARD.titleDY, this.mission.title, {
            fontFamily: FONT.black, fontSize: SIZE.cardTitle, color: hex(C.ink),
            wordWrap: { width: w - 200 },
        }).setOrigin(0, 0.5).setResolution(2)

        const text = this.add.text(MISSION_CARD.titleX, MISSION_CARD.textDY, instruction, {
            fontFamily: FONT.body, fontStyle: 'bold', fontSize: SIZE.cardText, color: hex(C.inkMid),
            wordWrap: { width: w - 200 },
        }).setOrigin(0, 0.5).setResolution(2)

        box.add([bg, halo, icon, title, text])
        this.stage?.add(box)

        FX.slideIn(this, box, { dy: 30, duration: 420 })
        FX.float(this, icon, { amount: 5, duration: 2000 })
    }

    private drawSplitDrops() {
        const n = this.mission.subtasks.length
        const gap = n === 2 ? DROPS.gapWide : DROPS.gapTight
        const w = Math.min(n === 2 ? 384 : 272, (DROPS.maxRowW - (n - 1) * gap) / n)
        const total = n * w + (n - 1) * gap
        const start = BOARD.cx - total / 2 + w / 2

        this.mission.subtasks.forEach((subtask, i) => {
            const drop = this.makeDrop(
                subtask.id, 'split',
                start + i * (w + gap), DROPS.cy, w, DROPS.splitH,
                subtask.actionIds.length,
            )

            const icon = this.add.image(0, DROPS.splitIconDY, this.safeIcon(subtask.iconKey))
            this.fit(icon, 62, 62)

            const label = this.add.text(0, DROPS.splitLabelDY, subtask.label, {
                fontFamily: FONT.black,
                fontSize: n === 2 ? SIZE.plateLabel : SIZE.plateLabelSmall,
                color: hex(C.ink), align: 'center', wordWrap: { width: w - 36 },
            }).setOrigin(0.5).setResolution(2)

            // Contador vira selo no canto: liberta a faixa de baixo para as fichas.
            const badge = this.add.graphics()
            badge.fillStyle(C.lavender, 1)
            badge.fillRoundedRect(w / 2 - 78, -DROPS.splitH / 2 + 12, 62, 32, 16)
            const count = this.add.text(w / 2 - 47, -DROPS.splitH / 2 + 28, `0/${subtask.actionIds.length}`, {
                fontFamily: FONT.black, fontSize: SIZE.plateCount, color: hex(C.cream),
            }).setOrigin(0.5).setResolution(2)

            drop.count = count
            drop.box.add([icon, label, badge, count])
            this.drops.push(drop)
            FX.popIn(this, drop.box, { from: 0.8, delay: 120 + i * 90, duration: 380 })
        })
    }

    /* ────────────────────────────────────────────────── etapa: ordenar */

    private showOrder() {
        const subtask = this.orderSubtasks[this.orderIndex]
        if (!subtask) {
            if (this.mission.mode === 'split-and-combine') this.showCombine()
            else this.completeMission()
            return
        }

        this.clearStage()
        this.renderHud()
        this.drawBoard('Ordem dos passos', 'Primeiro o 1, depois o 2, depois o 3.')
        this.state = 'order-subtask'
        this.locked = false

        this.drawOrderHeader(subtask)
        this.drawOrderDrops(subtask)
        // A prateleira da ordenação usa os QUADROS DE ESTADO, não os objetos
        // da divisão. São conjuntos diferentes: ver `SubtaskPlate.sequence`.
        this.drawBank(Phaser.Utils.Array.Shuffle(this.sequenceOf(subtask).map(s => s.id)), 'action')
        this.primary = this.makePrimary('Pronto', () => this.checkOrder())
        this.syncPrimary()

        const gen = this.stageGen
        const firstOrder = this.level.level === 2 && this.missionIdx === 0 && this.orderIndex === 0

        // Só a primeira subreceita da missão vira aula. Nas seguintes ela
        // comenta de canto — senão a criança leva um diálogo inteiro a cada
        // prato, três vezes seguidas.
        if (this.orderIndex === 0) {
            void this.speak(
                'c3',
                this.mission.orderInstruction ?? 'Agora vamos pôr em ordem.',
                'Do começo até ficar pronto.',
            ).then(() => {
                if (gen !== this.stageGen || !firstOrder) return
                this.runOrderTutorial(false)
            })
        } else {
            this.react('c3', `Agora a parte ${subtask.label}.`)
        }
    }

    private drawOrderHeader(subtask: SubtaskPlate) {
        const box = this.add.container(MISSION_CARD.cx, MISSION_CARD.cy)
        const { w, h, r } = MISSION_CARD
        const bg = this.add.graphics()
        bg.fillStyle(C.shadow, 0.18)
        bg.fillRoundedRect(-w / 2 + 5, -h / 2 + 9, w, h, r)
        bg.fillStyle(C.cream, 0.99)
        bg.fillRoundedRect(-w / 2, -h / 2, w, h, r)
        bg.fillStyle(C.green, 0.18)
        bg.fillRoundedRect(-w / 2 + 14, -h / 2 + 12, w - 28, 18, 9)
        bg.lineStyle(5, C.green, 0.85)
        bg.strokeRoundedRect(-w / 2, -h / 2, w, h, r)

        const halo = this.add.graphics()
        halo.fillStyle(C.greenLight, 0.34)
        halo.fillCircle(MISSION_CARD.iconX, 0, 46)

        const icon = this.add.image(MISSION_CARD.iconX, 0, this.safeIcon(subtask.iconKey))
        this.fit(icon, MISSION_CARD.iconSize, MISSION_CARD.iconSize)

        const title = this.add.text(MISSION_CARD.titleX, MISSION_CARD.titleDY, subtask.label, {
            fontFamily: FONT.black, fontSize: SIZE.cardTitle, color: hex(C.ink),
            wordWrap: { width: w - 200 },
        }).setOrigin(0, 0.5).setResolution(2)

        const sub = this.add.text(MISSION_CARD.titleX, MISSION_CARD.textDY,
            `Parte ${this.orderIndex + 1} de ${this.orderSubtasks.length}`, {
            fontFamily: FONT.body, fontStyle: 'bold', fontSize: SIZE.cardText, color: hex(C.inkMid),
        }).setOrigin(0, 0.5).setResolution(2)

        box.add([bg, halo, icon, title, sub])
        this.stage?.add(box)
        FX.slideIn(this, box, { dy: 30, duration: 420 })
    }

    private drawOrderDrops(subtask: SubtaskPlate) {
        const n = this.sequenceOf(subtask).length
        const gap = n <= 2 ? DROPS.gapWide : DROPS.gapTight
        const w = Math.min(n <= 2 ? 320 : 264, (DROPS.maxRowW - (n - 1) * gap) / n)
        const total = n * w + (n - 1) * gap
        const start = BOARD.cx - total / 2 + w / 2

        // Setas entre os slots: sem elas a fileira parecia três caixas soltas,
        // e não uma sequência que se lê da esquerda para a direita.
        for (let i = 0; i < n - 1; i += 1) {
            const ax = start + i * (w + gap) + w / 2 + gap / 2
            const arrow = this.add.graphics().setDepth(6)
            arrow.fillStyle(C.gold, 0.9)
            arrow.fillTriangle(ax - 9, DROPS.cy - 16, ax - 9, DROPS.cy + 16, ax + 11, DROPS.cy)
            this.stage?.add(arrow)
            FX.fadeIn(this, arrow, 300, 260 + i * 80)
        }

        for (let i = 0; i < n; i += 1) {
            const drop = this.makeDrop(`slot-${i}`, 'order', start + i * (w + gap), DROPS.cy, w, DROPS.orderH, 1)

            // Número grande em disco, no topo do slot. A ficha entra abaixo
            // (DROPS.orderChipDY) e não cobre mais o número.
            const disc = this.add.graphics()
            disc.fillStyle(C.gold, 1)
            disc.fillCircle(0, DROPS.orderNumDY, DROPS.orderNumR)
            disc.lineStyle(4, C.goldDark, 0.9)
            disc.strokeCircle(0, DROPS.orderNumDY, DROPS.orderNumR)

            const num = this.add.text(0, DROPS.orderNumDY, `${i + 1}`, {
                fontFamily: FONT.black, fontSize: SIZE.slotNumber, color: hex(C.ink),
            }).setOrigin(0.5).setResolution(2)

            const helper = this.add.text(0, DROPS.orderH / 2 - 28, i === 0 ? 'comece aqui' : 'solte aqui', {
                fontFamily: FONT.body, fontStyle: 'bold', fontSize: SIZE.slotHelper, color: hex(C.inkMid),
            }).setOrigin(0.5).setResolution(2)

            drop.helper = helper
            drop.box.add([disc, num, helper])
            this.drops.push(drop)
            FX.popIn(this, drop.box, { from: 0.8, delay: 120 + i * 80, duration: 360 })
        }
    }

    /* ───────────────────────────────────────────────── etapa: combinar */

    private showCombine() {
        this.clearStage()
        this.renderHud()
        this.drawBoard('Plano final', 'Use a espera para adiantar outra parte.')
        this.state = 'combine'
        this.locked = false

        this.drawMissionCard(this.mission.combineInstruction ?? 'Monte o plano final.')
        this.drawCombineDrops()
        this.drawBank(this.mission.subtasks.map(s => s.id), 'subtask')
        this.primary = this.makePrimary('Testar', () => this.checkCombine())
        this.syncPrimary()

        const gen = this.stageGen
        const firstCombine = this.level.level === 3 && this.missionIdx === 0
        void this.speak('c3', this.mission.combineInstruction ?? 'Agora combine as partes prontas.')
            .then(() => {
                if (gen !== this.stageGen || !firstCombine) return
                this.runCombineTutorial(false)
            })
    }

    private drawCombineDrops() {
        const slots = this.mission.combineSlots ?? []
        const gap = DROPS.gapTight
        const w = Math.min(276, (DROPS.maxRowW - (slots.length - 1) * gap) / slots.length)
        const total = slots.length * w + (slots.length - 1) * gap
        const start = BOARD.cx - total / 2 + w / 2

        slots.forEach((slot, i) => {
            const drop = this.makeDrop(slot.id, 'combine', start + i * (w + gap), DROPS.cy, w, DROPS.combineH, 1)

            const label = this.add.text(0, -DROPS.combineH / 2 + 34, slot.label, {
                fontFamily: FONT.black, fontSize: SIZE.plateLabelSmall, color: hex(C.ink),
                align: 'center', wordWrap: { width: w - 28 },
            }).setOrigin(0.5).setResolution(2)

            const helper = this.add.text(0, DROPS.combineH / 2 - 28, slot.helper, {
                fontFamily: FONT.body, fontStyle: 'bold', fontSize: SIZE.slotHelper, color: hex(C.inkMid),
                align: 'center', wordWrap: { width: w - 34 },
            }).setOrigin(0.5).setResolution(2)

            drop.helper = helper
            drop.box.add([label, helper])
            this.drops.push(drop)
            FX.popIn(this, drop.box, { from: 0.8, delay: 120 + i * 90, duration: 380 })
        })
    }

    /* ───────────────────────────────────────────────────── prateleira */

    private drawBank(ids: string[], kind: DragKind) {
        const isSubtask = kind === 'subtask'
        const cardW = isSubtask ? BANK.cardWSubtask : BANK.cardW
        const cardH = isSubtask ? BANK.cardHSubtask : BANK.cardH

        // Máximo 5 por linha: acima disso o cartão encolhe demais para o dedo.
        const perRow = ids.length > 5 ? Math.ceil(ids.length / 2) : ids.length
        const rows = ids.length > perRow ? 2 : 1
        const w = Math.min(cardW, (BANK.maxW - (perRow - 1) * BANK.gap) / perRow)
        const h = rows > 1 ? Math.min(cardH, 104) : cardH

        const made: Phaser.GameObjects.Container[] = []
        for (let row = 0; row < rows; row += 1) {
            const part = ids.slice(row * perRow, row * perRow + perRow)
            const total = part.length * w + (part.length - 1) * BANK.gap
            const start = BANK.cx - total / 2 + w / 2
            const y = rows === 1 ? BANK.singleY : row === 0 ? BANK.row1Y : BANK.row2Y
            part.forEach((id, i) => {
                made.push(this.makeCard(id, kind, start + i * (w + BANK.gap), y, w, h))
            })
        }
        dealIn(this, made)
    }

    private makeCard(id: string, kind: DragKind, x: number, y: number, w: number, h: number) {
        // Nunca deixa dois cartões vivos para o mesmo id: o Map guardava só o
        // último e o anterior ficava órfão na bancada, arrastável e fantasma.
        this.cards.get(id)?.destroy()
        this.cards.delete(id)

        const info = this.cardInfo(id)
        const card = this.add.container(x, y).setDepth(20)

        const bg = this.add.graphics()
        paintCard(bg, w, h, BANK.r)

        const iconSize = Math.min(w * 0.46, h * 0.46)
        const icon = this.add.image(0, -h * 0.14, this.safeIcon(info.iconKey))
        this.fit(icon, iconSize, iconSize)

        const label = this.add.text(0, h / 2 - 24, info.label, {
            fontFamily: FONT.black, fontSize: labelSize(info.label, w), color: hex(C.ink),
            align: 'center', wordWrap: { width: w - 16 },
        }).setOrigin(0.5).setResolution(2)

        card.add([bg, icon, label])

        if (info.hasWait) {
            const badge = waitBadge(this, w / 2 - 26, -h / 2 + 26, 34)
            card.add(badge)
        }

        // A zona de toque é filha do cartão, então acompanha o voo até o prato.
        // Sem checar `cards.has(id)`, o ponteiro "saía" do cartão em movimento,
        // o pointerout disparava um tween de volta para o y de origem e brigava
        // com o arco — o cartão tremia e depois saltava para o prato.
        const atHome = () => !this.locked && !this.drag && this.cards.has(id)

        const hit = this.add.zone(0, 0, w, h).setOrigin(0.5).setInteractive({ useHandCursor: true })
        hit.on('pointerdown', () => this.beginDrag(id, kind, card))
        hit.on('pointerover', () => {
            if (!atHome()) return
            FX.to(this, card, { scale: 1.07, y: y - 6 }, { duration: 130 })
        })
        hit.on('pointerout', () => {
            if (!atHome()) return
            FX.to(this, card, { scale: 1, y }, { duration: 130 })
        })
        card.add(hit)
        card.setSize(w, h)

        this.stage?.add(card)
        this.cards.set(id, card)
        this.homes.set(id, { x, y, w, h })
        return card
    }

    private makeDrop(id: string, kind: DropKind, x: number, y: number, w: number, h: number, capacity: number) {
        const box = this.add.container(x, y)
        const bg = this.add.graphics()
        box.add(bg)
        this.stage?.add(box)
        const drop: DropView = { id, kind, x, y, w, h, capacity, bg, box }
        paintPlate(bg, w, h, DROPS.r, 'normal')
        return drop
    }

    /* ──────────────────────────────────────────────────────── arraste */

    private beginDrag(id: string, kind: DragKind, node: Phaser.GameObjects.Container) {
        if (this.locked || this.ended) return
        // Um arraste por vez, e só de cartão que ainda está na prateleira.
        // Sem isso, dois pointerdown no mesmo frame criavam dois arrastes do
        // mesmo id e a carta se duplicava no encaixe.
        if (this.drag || !this.cards.has(id)) return
        this.drag = { id, kind, node }
        node.setDepth(140)
        FX.kill(this, node)
        FX.to(this, node, { scale: 1.14, angle: -3 }, { duration: 120, ease: Ease.back(2) })
        this.playClick()
    }

    private onPointerMove(pointer: Phaser.Input.Pointer) {
        if (!this.drag || this.locked) return
        this.drag.node.setPosition(pointer.x, pointer.y)

        const drop = this.findDrop(pointer.x, pointer.y)
        if (drop === this.hoverDrop) return
        if (this.hoverDrop) this.repaint(this.hoverDrop)
        this.hoverDrop = drop
        if (drop && this.canDrop(this.drag, drop)) {
            paintPlate(drop.bg, drop.w, drop.h, DROPS.r, 'hover')
            FX.to(this, drop.box, { scale: 1.04 }, { duration: 130 })
        }
    }

    private onPointerUp(pointer: Phaser.Input.Pointer) {
        if (!this.drag) return
        const drag = this.drag
        const drop = this.findDrop(pointer.x, pointer.y)
        this.drag = null

        if (this.hoverDrop) {
            FX.to(this, this.hoverDrop.box, { scale: 1 }, { duration: 130 })
            this.repaint(this.hoverDrop)
        }
        this.hoverDrop = null

        // O ângulo não é zerado na marra: tanto `flyToPlate` quanto
        // `returnHome` já tweenam de volta, e o corte seco aparecia como
        // um tranco no primeiro frame depois de soltar.
        if (!drop || !this.canDrop(drag, drop)) {
            this.returnHome(drag.id)
            return
        }
        void this.place(drag.id, drop)
    }

    private findDrop(x: number, y: number) {
        return this.drops.find(d =>
            x >= d.x - d.w / 2 && x <= d.x + d.w / 2 &&
            y >= d.y - d.h / 2 && y <= d.y + d.h / 2) ?? null
    }

    private canDrop(drag: { kind: DragKind }, drop: DropView) {
        if (this.state === 'combine') return drag.kind === 'subtask' && drop.kind === 'combine' && this.countInDrop(drop.id) < 1
        if (this.state === 'order-subtask') return drag.kind === 'action' && drop.kind === 'order' && this.countInDrop(drop.id) < 1
        return drag.kind === 'action' && drop.kind === 'split' && this.countInDrop(drop.id) < drop.capacity
    }

    private async place(id: string, drop: DropView) {
        const card = this.cards.get(id)
        if (!card) return

        const gen = this.stageGen
        const target = this.chipSpot(drop, this.countInDrop(drop.id))
        const endScale = drop.kind === 'split' ? 0.46 : 0.8

        // Reserva o lugar já: a checagem de capacidade do próximo arraste
        // precisa enxergar esta ficha mesmo antes de ela aterrissar.
        this.cards.delete(id)
        this.placed.set(id, drop.id)
        this.flying.add(id)
        this.playDrop()
        this.syncPrimary()

        card.setDepth(120)
        FX.kill(this, card)
        await flyToPlate(this, card, target, endScale)

        this.flying.delete(id)

        // A tela trocou no meio do voo (erro, fim de fase): nada a montar.
        if (gen !== this.stageGen) {
            card.destroy()
            return
        }

        // Monta a ficha ANTES de tirar o cartão: ela nasce embaixo (depth 30 vs
        // 120) e o cartão some por cima. Trocar na marra fazia um "pisca" —
        // cartão tem legenda e a ficha não.
        this.layoutChips()
        this.refreshDrops()
        this.syncPrimary()

        plateAccept(this, drop.box, drop.x, drop.y - drop.h * 0.2)
        const chip = this.chips.get(id)
        if (chip) FX.impact(this, chip, 0.22)

        if (this.countInDrop(drop.id) >= drop.capacity && !drop.sealed) {
            drop.sealed = true
            plateComplete(this, drop.box, drop.w, drop.h)
        }

        if (this.state === 'combine') this.refreshWaitCue()

        await FX.to(this, card, { alpha: 0, scale: card.scale * 0.88 }, { duration: 120 })
        card.destroy()
    }

    /**
     * Quando a parte com ampulheta entra em "Primeiro", o espaço "Enquanto
     * espera" acende.
     *
     * É o instante em que o N3 explica a si mesmo: a criança vê, sem ler
     * nada, que a pausa daquela parte abriu lugar para outra. Antes esse
     * momento passava em branco e o nível virava só mais um arrasta-e-solta.
     */
    private refreshWaitCue() {
        const waiting = this.drops.find(d => d.id === 'while-waiting')
        if (!waiting) return

        const firstId = [...this.placed.entries()].find(([, dropId]) => dropId === 'first')?.[0]
        const armed = !!this.mission.subtasks.find(s => s.id === firstId)?.hasWait
            && this.countInDrop('while-waiting') === 0

        if (armed === !!waiting.box.getData('armed')) return
        waiting.box.setData('armed', armed)

        if (!armed) {
            this.repaint(waiting)
            return
        }
        paintPlate(waiting.bg, waiting.w, waiting.h, DROPS.r, 'hover')
        FX.ping(this, waiting.x, waiting.y, C.gold, { radius: 96 })
        FX.to(this, waiting.box, { scale: 1.06 }, { duration: 220, yoyo: true, ease: Ease.back(2) })
        this.react('c4', 'Agora dá para adiantar outra parte!')
    }

    /**
     * Fonte única do estado do botão. Antes cada ponto de mutação decidia
     * sozinho, e bastava um deles ficar para trás para o botão nunca acender.
     */
    private syncPrimary() {
        const need = this.activeIds().length
        const ready = need > 0 && this.placed.size === need && this.flying.size === 0
        this.primary?.setEnabled(ready && !this.locked)
    }

    private returnHome(id: string) {
        const card = this.cards.get(id)
        const home = this.homes.get(id)
        if (!card || !home) return
        card.setDepth(20)
        FX.to(this, card, { x: home.x, y: home.y, scale: 1, angle: 0 },
            { duration: 320, ease: Ease.settle })
    }

    private removePlaced(id: string, force = false) {
        // Clique duplo na mesma ficha chamava isto duas vezes e a segunda
        // recriava um cartão extra na prateleira. Agora só sai o que está lá.
        if (!this.placed.has(id) || this.flying.has(id)) return
        if (!force && (this.locked || this.state === 'simulate' || this.state === 'complete')) return

        const dropId = this.placed.get(id)
        this.chips.get(id)?.destroy()
        this.chips.delete(id)
        this.placed.delete(id)

        const drop = this.drops.find(d => d.id === dropId)
        if (drop) drop.sealed = false

        const home = this.homes.get(id)
        if (home) {
            const card = this.makeCard(id, this.state === 'combine' ? 'subtask' : 'action', home.x, home.y, home.w, home.h)
            FX.popIn(this, card, { from: 0.6, duration: 300 })
        }
        this.layoutChips()
        this.refreshDrops()
        this.syncPrimary()
        if (this.state === 'combine') this.refreshWaitCue()
    }

    /** Onde a i-ésima ficha assenta dentro do prato. */
    private chipSpot(drop: DropView, index: number) {
        if (drop.kind === 'order') return { x: drop.x, y: drop.y + DROPS.orderChipDY }
        if (drop.kind === 'combine') return { x: drop.x, y: drop.y + DROPS.combineChipDY }
        const n = Math.max(1, drop.capacity)
        const span = Math.min(CHIP.splitGap, (drop.w - 36) / n)
        return {
            x: drop.x - ((n - 1) * span) / 2 + index * span,
            y: drop.y + DROPS.splitChipDY,
        }
    }

    private layoutChips() {
        this.chips.forEach(chip => chip.destroy())
        this.chips.clear()

        this.drops.forEach(drop => {
            const ids = [...this.placed.entries()]
                .filter(([id, d]) => d === drop.id && !this.flying.has(id))
                .map(([id]) => id)
            ids.forEach((id, i) => {
                const info = this.cardInfo(id)
                const small = drop.kind === 'split'
                const spot = this.chipSpot(drop, i)
                const w = small ? CHIP.splitSize : Math.min(CHIP.bigW, drop.w - 44)
                const h = small ? CHIP.splitSize
                    : drop.kind === 'order' ? CHIP.orderH
                        : CHIP.bigH

                const chip = this.add.container(spot.x, spot.y).setDepth(30)
                const bg = this.add.graphics()
                paintCard(bg, w, h, CHIP.r, { placed: true })

                const icon = this.add.image(0, small ? 0 : -h * 0.16, this.safeIcon(info.iconKey))
                this.fit(icon, small ? 40 : 54, small ? 40 : 54)
                chip.add([bg, icon])

                if (!small) {
                    chip.add(this.add.text(0, h / 2 - 24, info.label, {
                        fontFamily: FONT.black, fontSize: SIZE.chipLabel, color: hex(C.ink),
                        align: 'center', wordWrap: { width: w - 16 },
                    }).setOrigin(0.5).setResolution(2))
                    if (info.hasWait) chip.add(waitBadge(this, w / 2 - 24, -h / 2 + 24, 30))
                }

                const hit = this.add.zone(0, 0, w, h).setOrigin(0.5).setInteractive({ useHandCursor: true })
                hit.on('pointerdown', () => this.removePlaced(id))
                hit.on('pointerover', () => { if (!this.locked) FX.to(this, chip, { scale: 1.06 }, { duration: 110 }) })
                hit.on('pointerout', () => { if (!this.locked) FX.to(this, chip, { scale: 1 }, { duration: 110 }) })
                chip.add(hit)

                this.stage?.add(chip)
                this.chips.set(id, chip)
            })
        })
    }

    private repaint(drop: DropView) {
        paintPlate(drop.bg, drop.w, drop.h, DROPS.r, this.dropState(drop))
    }

    private refreshDrops() {
        this.drops.forEach(drop => {
            const count = this.countInDrop(drop.id)
            drop.count?.setText(`${count}/${drop.capacity}`)
            if (drop.helper) drop.helper.setAlpha(count > 0 ? 0 : 1)
            this.repaint(drop)
        })
    }

    private dropState(drop: DropView): PlateState {
        return this.countInDrop(drop.id) >= drop.capacity ? 'complete' : 'normal'
    }

    private countInDrop(dropId: string) {
        return [...this.placed.values()].filter(id => id === dropId).length
    }

    /* ────────────────────────────────────────────────────── validação */

    private checkSplit() {
        if (this.locked || this.flying.size > 0) return
        if (this.placed.size !== this.mission.actions.length) return
        const gen = this.stageGen
        this.locked = true
        this.syncPrimary()

        const wrong = this.mission.actions
            .filter(a => this.placed.get(a.id) !== a.subtaskId)
            .map(a => a.id)

        if (wrong.length) {
            const hint = this.mission.actions.find(a => a.id === wrong[0])?.hint
            this.fail(wrong, hint ?? 'Hehe!')
            return
        }

        this.award(30)
        this.react('c4', 'Boa!')
        this.celebrateDrops()
        this.time.delayedCall(900, () => {
            if (gen !== this.stageGen) return
            this.afterSplit()
        })
    }

    private checkOrder() {
        const subtask = this.orderSubtasks[this.orderIndex]
        const steps = this.sequenceOf(subtask)
        if (!subtask || this.locked || this.flying.size > 0) return
        if (this.placed.size !== steps.length) return
        const gen = this.stageGen
        this.locked = true
        this.syncPrimary()

        // A sequência é uma história com ordem única por construção
        // (estado inicial → acréscimo → estado final), então a comparação é
        // direta: o quadro do slot i tem que ser o i-ésimo da história.
        const wrong = [...this.placed.keys()].filter(id => {
            const slot = Number(this.placed.get(id)?.replace('slot-', ''))
            return Number.isNaN(slot) || steps[slot]?.id !== id
        })

        if (wrong.length) {
            this.fail(wrong, 'Ainda não. Olhe os números.')
            return
        }

        this.award(35)
        this.react('c4', 'Na ordem certa!')
        this.celebrateDrops()
        this.time.delayedCall(860, () => {
            if (gen !== this.stageGen) return
            this.orderIndex += 1
            this.showOrder()
        })
    }

    private checkCombine() {
        const slots = this.mission.combineSlots ?? []
        if (this.locked || this.flying.size > 0) return
        if (this.placed.size !== slots.length) return
        this.locked = true
        this.syncPrimary()

        const expected = this.mission.expectedCombineOrder ?? []
        const wrong = [...this.placed.keys()]
            .filter(id => this.placed.get(id) !== slots[expected.indexOf(id)]?.id)

        if (wrong.length) {
            this.fail(wrong, 'A que espera vem antes.')
            return
        }

        this.award(50)
        this.simulateCombine()
    }

    private award(value: number) {
        this.points += value
        this.hits += 1
        runtimeGameBridge.emit({ type: 'CORRECT_ANSWER', gameId: GAME_ID, pointsEarned: value, stage: this.level.level })
        this.emitCheckpoint()
        this.playCorrect()
        FX.popText(this, BOARD.cx, DROPS.cy - 40, `+${value}`, { color: hex(C.gold), size: '40px' })
    }

    private celebrateDrops() {
        const gen = this.stageGen
        FX.flash(this, C.cream, { duration: 300, peak: 0.3 })
        this.drops.forEach((drop, i) => {
            this.time.delayedCall(i * 90, () => {
                // O prato pode já ter sido destruído se a fase virou nesse meio.
                if (gen !== this.stageGen || !drop.box.active) return
                paintPlate(drop.bg, drop.w, drop.h, DROPS.r, 'complete')
                FX.impact(this, drop.box, 0.14)
                FX.sparks(this, drop.x, drop.y, { color: C.greenLight, count: 14, spread: 130 })
            })
        })
    }

    private fail(ids: string[], message: string) {
        const gen = this.stageGen
        this.errors += 1
        runtimeGameBridge.emit({ type: 'WRONG_ANSWER', gameId: GAME_ID, pointsEarned: -2, stage: this.level.level })
        this.emitCheckpoint()
        this.react('c7', message)
        this.playError()
        FX.shakeCam(this, 'leve')
        if (this.stage) showToast(this, this.stage, message, C.red, 1700)

        ids.forEach(id => {
            const chip = this.chips.get(id)
            if (chip) FX.shake(this, chip, { amount: 12, times: 4 })
            const drop = this.drops.find(d => d.id === this.placed.get(id))
            if (drop) {
                paintPlate(drop.bg, drop.w, drop.h, DROPS.r, 'warning')
                FX.shake(this, drop.box, { amount: 9, times: 3 })
            }
        })

        this.time.delayedCall(950, () => {
            if (gen !== this.stageGen) return
            ids.forEach(id => this.removePlaced(id, true))
            this.locked = false
            this.syncPrimary()
        })
    }

    private afterSplit() {
        if (this.mission.mode === 'split-only') {
            this.completeMission()
            return
        }
        // Só entram na ordenação as partes que têm história de três quadros.
        this.orderSubtasks = this.mission.subtasks.filter(s => (s.sequence?.length ?? 0) > 1)
        this.orderIndex = 0
        this.showOrder()
    }

    private async simulateCombine() {
        const gen = this.stageGen
        this.state = 'simulate'
        this.react('c6', 'Vou provar o plano...')

        const slots = this.mission.combineSlots ?? []
        for (let i = 0; i < slots.length; i += 1) {
            if (gen !== this.stageGen) return
            const drop = this.drops.find(d => d.id === slots[i].id)
            if (!drop || !drop.box.active) continue
            paintPlate(drop.bg, drop.w, drop.h, DROPS.r, 'hover')
            FX.impact(this, drop.box, 0.16)
            FX.ping(this, drop.x, drop.y, C.gold, { radius: 90 })
            await FX.wait(this, 400)
        }

        if (gen !== this.stageGen) return
        // A economia aparece como comprimento de barra, não como número.
        if (this.stage) await comparePlans(this, this.stage, slots.length + 1, slots.length)
        if (gen !== this.stageGen) return
        this.completeMission()
    }

    private completeMission() {
        const gen = this.stageGen
        this.state = 'complete'
        this.locked = true
        this.syncPrimary()

        const last = this.missionIdx + 1 >= this.level.missions.length
        this.react(last ? 'c8' : 'c5', this.mission.successMessage)
        FX.stars(this, CHEF.cx, CHEF.y - 90, { color: C.gold, count: 12 })
        FX.sparks(this, BOARD.cx, DROPS.cy, { color: C.gold, count: 26, spread: 240 })
        this.playFanfare()

        this.time.delayedCall(1250, () => {
            if (gen !== this.stageGen || this.ended) return
            if (!last) {
                this.missionIdx += 1
                this.showSplit()
                return
            }
            this.endLevel()
        })
    }

    private endLevel() {
        this.ended = true
        this.locked = true
        runtimeGameBridge.emit({ type: 'GAME_COMPLETED', gameId: GAME_ID, stage: this.level.level, totalStages: LEVELS.length })
        this.emitCheckpoint(true)

        const next = this.level.level < 3 ? this.level.level + 1 : null
        if (next) {
            showLevelComplete(this, {
                title: `Nível ${this.level.level} completo`,
                subtitle: this.level.title,
                message: 'Você dividiu um problema grande em partes menores.',
                accent: C.gold,
                panelColor: C.cream,
                overlayColor: C.ink,
                progress: { total: 3, current: this.level.level },
                autoAdvance: {
                    delay: 1800,
                    label: `Preparando nível ${next}...`,
                    onComplete: () => this.scene.restart({ level: next, points: this.points }),
                },
            })
            return
        }

        FX.confetti(this, { colors: [C.gold, C.greenLight, C.lavender, C.cream] })
        showLevelComplete(this, {
            title: 'Cozinha completa',
            subtitle: 'Chef dos Subproblemas',
            message: 'Você dividiu, ordenou e combinou tarefas em planos melhores.',
            accent: C.green,
            panelColor: C.cream,
            overlayColor: C.ink,
            progress: { total: 3, current: 3 },
            // Rótulos explícitos: "Voltar" não dizia para onde. A largura do
            // botão em showLevelComplete cresce com o texto (label.length * 15
            // + 76), então os dois somados precisam caber nos 604px do painel.
            buttons: [
                { label: 'Jogar de novo', color: C.green, onClick: () => this.scene.restart({ level: 1, points: 0 }) },
                { label: 'Escolher jogo', color: C.gold, onClick: () => EventBus.emit('exit-game') },
            ],
        })
    }

    /* ───────────────────────────────────────────────────────── tutorial */

    private runSplitTutorial(force: boolean) {
        if (this.state !== 'split') return
        this.locked = true
        const steps: TutorialStep[] = this.level.level === 2
            ? [
                { text: 'Separe cada ícone no prato certo.', shape: 'rect', x: BOARD.cx, y: DROPS.cy, w: DROPS.maxRowW + 30, h: DROPS.splitH + 34, balloonY: 595 },
                { text: 'Depois vamos ordenar cada parte.', shape: 'rect', x: BANK.cx, y: 595, w: BANK.maxW + 24, h: 214, balloonY: 250 },
            ]
            : [
                { text: 'Os pratos ficam aqui.', shape: 'rect', x: BOARD.cx, y: DROPS.cy, w: DROPS.maxRowW + 30, h: DROPS.splitH + 34, balloonY: 595},
                { text: 'E o plano se testa aqui.', shape: 'rect', x: CHEF.cx, y: CHEF.btnY, w: CHEF.btnW + 30, h: CHEF.btnH + 26, balloonX: 520, balloonY: 336 },
            ]

        this.setPose('c3')
        createTutorial(this, {
            key: this.level.level === 2 ? 'chef-n2-split' : 'chef-n1-split',
            once: !force,
            accent: C.gold,
            safeTop: HUD.y + HUD.h + 14,
            steps,
            onFinish: () => { this.locked = false; this.syncPrimary() },
        })
    }

    private runOrderTutorial(force: boolean) {
        if (this.state !== 'order-subtask') return
        this.locked = true
        this.setPose('c3')
        createTutorial(this, {
            key: 'chef-n2-order',
            once: !force,
            accent: C.green,
            safeTop: HUD.y + HUD.h + 14,
            // Dois passos só. As figuras contam a história sozinhas — o
            // holofote só precisa dizer ONDE se monta e ONDE estão as peças.
            steps: [
                { text: 'Monte a ordem: 1, 2, 3.', shape: 'rect', x: BOARD.cx, y: DROPS.cy, w: DROPS.maxRowW + 30, h: DROPS.orderH + 34, balloonY: 595 },
                { text: 'Cada figura mostra um momento.', shape: 'rect', x: BANK.cx, y: 595, w: BANK.maxW + 24, h: 214, balloonY: 250 },
            ],
            onFinish: () => { this.locked = false; this.syncPrimary() },
        })
    }

    private runCombineTutorial(force: boolean) {
        if (this.state !== 'combine') return
        this.locked = true
        this.setPose('c3')
        createTutorial(this, {
            key: 'chef-n3-combine',
            once: !force,
            accent: C.gold,
            safeTop: HUD.y + HUD.h + 14,
            steps: [
                { text: 'A parte com ampulheta começa primeiro.', shape: 'rect', x: BOARD.cx, y: DROPS.cy, w: DROPS.maxRowW + 30, h: DROPS.combineH + 34, balloonY: 595 },
                { text: 'Na pausa dela, adiante outra parte.', shape: 'rect', x: BANK.cx, y: 595, w: BANK.maxW + 24, h: 214, balloonY: 250 },
            ],
            onFinish: () => { this.locked = false; this.syncPrimary() },
        })
    }

    private replayTutorial() {
        if (this.state === 'split') this.runSplitTutorial(true)
        else if (this.state === 'order-subtask') this.runOrderTutorial(true)
        else if (this.state === 'combine') this.runCombineTutorial(true)
    }

    /* ────────────────────────────────────────────────────────── cenário */

    private clearStage() {
        this.stageGen += 1
        this.stage?.destroy()
        this.stage = this.add.container(0, 0).setDepth(5)
        this.drops = []
        this.cards.clear()
        this.chips.clear()
        this.homes.clear()
        this.placed.clear()
        this.flying.clear()
        this.drag = null
        this.hoverDrop = null
        this.primary?.destroy()
        this.primary = undefined
    }

    private drawBoard(title: string, helper: string) {
        const g = this.add.graphics()
        paintBoard(g, BOARD.x, BOARD.y, BOARD.w, BOARD.h, BOARD.r)

        const titleText = this.add.text(BOARD.x + 40, BOARD.y + 22, title, {
            fontFamily: FONT.black, fontSize: SIZE.boardTitle, color: hex(C.cream),
        }).setOrigin(0, 0.5).setResolution(2)

        const helperText = this.add.text(BOARD.x + BOARD.w - 40, BOARD.y + 22, helper, {
            fontFamily: FONT.body, fontStyle: 'bold', fontSize: SIZE.boardHelper, color: hex(C.cream),
            align: 'right', wordWrap: { width: 420 },
        }).setOrigin(1, 0.5).setResolution(2)

        this.stage?.add([g, titleText, helperText])
        FX.fadeIn(this, g, 320)
    }

    private makePrimary(label: string, onClick: () => void) {
        if (!this.actionLayer) return undefined
        const btn = createBigButton(
            this, this.actionLayer,
            CHEF.cx, CHEF.btnY, CHEF.btnW, CHEF.btnH,
            label,
            () => { this.playClick(); onClick() },
        )
        btn.setEnabled(false)
        return btn
    }

    private introFrame(): ChefFrameKey {
        if ((this.level.level === 1 || this.level.level === 2) && this.missionIdx === 0) return 'c3'
        return this.missionIdx % 2 === 0 ? 'c1' : 'c2'
    }

    /* ───────────────────────────────────────────────────────── suporte */

    /** Os quadros de estado desta parte, na ordem certa da história. */
    private sequenceOf(subtask?: SubtaskPlate): SequenceStep[] {
        return subtask?.sequence ?? []
    }

    private activeIds() {
        if (this.state === 'combine') return this.mission.subtasks.map(s => s.id)
        if (this.state === 'order-subtask') {
            return this.sequenceOf(this.orderSubtasks[this.orderIndex]).map(s => s.id)
        }
        return this.mission.actions.map(a => a.id)
    }

    private cardInfo(id: string): CardInfo {
        if (this.state === 'combine') {
            const subtask = this.mission.subtasks.find(s => s.id === id)
            if (!subtask) return { label: id, iconKey: ICON_FALLBACK }
            return { label: subtask.label, iconKey: subtask.iconKey, hasWait: subtask.hasWait }
        }
        if (this.state === 'order-subtask') {
            const step = this.sequenceOf(this.orderSubtasks[this.orderIndex]).find(s => s.id === id)
            if (!step) return { label: id, iconKey: ICON_FALLBACK }
            return { label: step.label, iconKey: step.iconKey }
        }
        const action = this.mission.actions.find(a => a.id === id)
        if (!action) return { label: id, iconKey: ICON_FALLBACK }
        return { label: action.label, iconKey: action.iconKey }
    }

    /** Nunca devolve uma chave sem textura — evita o quadrado verde do Phaser. */
    private safeIcon(key: string) {
        return this.textures.exists(key) ? key : ICON_FALLBACK
    }

    private fit(image: Phaser.GameObjects.Image, maxW: number, maxH: number) {
        image.setScale(Math.min(maxW / image.width, maxH / image.height))
    }

    private emitCheckpoint(forceComplete = false) {
        const before = LEVELS.slice(0, this.levelIdx).reduce((sum, l) => sum + l.missions.length, 0)
        const completed = before + this.missionIdx + (forceComplete ? 1 : 0)
        const total = LEVELS.reduce((sum, l) => sum + l.missions.length, 0)
        runtimeGameBridge.emit({
            type: 'CHECKPOINT',
            gameId: GAME_ID,
            progress: Math.round((completed / total) * 100),
            score: this.points,
            stage: this.level.level,
            hits: this.hits,
            errors: this.errors,
        })
    }

    /* ─────────────────────────────────────────────────────────── áudio */

    private getAudioCtx(): AudioContext | null {
        if (this.isMuted) return null
        try { return (this.sound as Phaser.Sound.WebAudioSoundManager).context } catch { return null }
    }

    private playTone(freq: number, dur: number, type: OscillatorType = 'sine', gain = 0.12) {
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

    private playClick() { this.playTone(420, 0.045, 'sine', 0.07) }
    private playDrop() { this.playTone(560, 0.06, 'triangle', 0.08) }
    private playCorrect() {
        this.playTone(620, 0.08, 'sine', 0.13)
        this.time.delayedCall(85, () => this.playTone(820, 0.1, 'sine', 0.1))
    }
    private playError() { this.playTone(210, 0.18, 'square', 0.11) }
    private playFanfare() {
        [523, 659, 784].forEach((f, i) => this.time.delayedCall(i * 110, () => this.playTone(f, 0.18, 'sine', 0.16)))
    }
}

/** Rótulo nunca abaixo de 16px: encolhe a fonte só até onde ainda dá para ler. */
function labelSize(label: string, cardW: number) {
    if (label.length > 12) return cardW > 150 ? '17px' : '16px'
    if (label.length > 9) return '18px'
    return '19px'
}
