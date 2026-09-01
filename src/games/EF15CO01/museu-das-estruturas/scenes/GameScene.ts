import Phaser from 'phaser'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import { EventBus } from '../../../../shared/EventBus'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { LEVELS } from '../data/levels'
import { ROOMS, ROOM_ORDER } from '../data/rooms'
import { ITEMS } from '../data/items'
import { C, A, SWATCH, hex } from '../data/theme'
import { W, H, TOPBAR, HEADER, HUB, ROOM, STAGE, LISTA, MATRIZ, REGISTRO, GRAFO, SOLTO } from '../data/layout'
import type {
    GrafoTask,
    ListaTask,
    MatrizTask,
    PhaseConfig,
    RegistroTask,
    ReportCard,
    ShapeKind,
    SoltoTask,
    StructureId,
    TaskConfig,
    TokenKind,
    RobotPose,
} from '../types'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'

const GAME_ID = 'museu-das-estruturas'

const BIN_LABEL: Record<TokenKind, string> = {
    numero: 'Números',
    palavra: 'Palavras',
    simnao: 'Sim ou não',
}

const emptyReport = (): ReportCard => ({
    lista: { hits: 0, tries: 0, picks: 0, goodPicks: 0 },
    matriz: { hits: 0, tries: 0, picks: 0, goodPicks: 0 },
    registro: { hits: 0, tries: 0, picks: 0, goodPicks: 0 },
    grafo: { hits: 0, tries: 0, picks: 0, goodPicks: 0 },
    solto: { hits: 0, tries: 0, picks: 0, goodPicks: 0 },
})

export class GameScene extends Phaser.Scene {
    private lives!: Lives
    private livesTotal = 3
    private livesLeft = 3
    private levelIdx = 0
    private phaseIdx = 0
    private points = 0
    private report: ReportCard = emptyReport()
    private stepIdx = 0
    private locked = true
    private ended = false

    private inputBlocker?: Phaser.GameObjects.Rectangle
    private unblockTimer?: Phaser.Time.TimerEvent
    private inputBlockedUntil = 0
    private roomTutorialDone = new Set<StructureId>()

    private hubLayer?: Phaser.GameObjects.Container
    private roomLayer?: Phaser.GameObjects.Container
    private headerLayer?: Phaser.GameObjects.Container
    private helpBtn?: Phaser.GameObjects.Container
    private stepText?: Phaser.GameObjects.Text

    private tino?: Phaser.GameObjects.Image
    private balloonText?: Phaser.GameObjects.Text

    private wrongCount = 0
    private taskLocked = true
    private currentTask?: TaskConfig

    private placed: string[] = []
    private trayCards = new Map<string, Phaser.GameObjects.Container>()
    /** O x de bandeja de cada peça da lista, para ela saber voltar. */
    private listaHome = new Map<string, number>()
    private slotLayer?: Phaser.GameObjects.Graphics

    private edges = new Set<string>()
    private edgeLayer?: Phaser.GameObjects.Graphics
    private selectedNode: string | null = null
    private nodePos = new Map<string, { x: number; y: number }>()
    private typeTimer?: Phaser.Time.TimerEvent

    private selectedToken: string | null = null
    private tokenViews = new Map<string, Phaser.GameObjects.Container>()
    private binCounts = new Map<TokenKind, number>()

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; phase?: number; points?: number; report?: ReportCard; seenRooms?: StructureId[]; lives?: number }) {
        this.livesTotal = vidasIniciais(this, 3)
        this.livesLeft = data?.lives ?? this.livesTotal
        this.levelIdx = (data.level ?? 1) - 1
        this.phaseIdx = data.phase ?? 0
        this.points = data.points ?? 0
        this.report = data.report ?? emptyReport()
        this.stepIdx = 0
        this.locked = true
        this.ended = false

        this.typeTimer?.remove()
        this.typeTimer = undefined
        this.unblockTimer?.remove()
        this.unblockTimer = undefined
        this.inputBlocker?.destroy()
        this.inputBlocker = undefined
        this.inputBlockedUntil = 0

        this.hubLayer = undefined
        this.roomLayer = undefined
        this.headerLayer = undefined
        this.helpBtn = undefined
        this.stepText = undefined
        this.tino = undefined
        this.balloonText = undefined

        this.roomTutorialDone = new Set(data.seenRooms ?? [])

        this.wrongCount = 0
        this.taskLocked = true
        this.currentTask = undefined
        this.placed = []
        this.trayCards = new Map()
        this.listaHome = new Map()
        this.slotLayer = undefined
        this.edges = new Set()
        this.edgeLayer = undefined
        this.selectedNode = null
        this.nodePos = new Map()
        this.selectedToken = null
        this.tokenViews = new Map()
        this.binCounts = new Map()

    }

    private get level() {
        return LEVELS[this.levelIdx]
    }

    private get phase(): PhaseConfig {
        return this.level.phases[this.phaseIdx]
    }

    create() {
        this.buildHeader()
        this.buildHub()
        this.fadeIn()

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        EventBus.on('timer-end', this.onTimeUp, this)
        this.events.once('shutdown', () => EventBus.off('timer-end', this.onTimeUp, this))

        if (this.phaseIdx === 0) this.showLevelIntro(() => this.runTutorial())
        else this.runTutorial()

        /* AJUSTE A POSIÇÃO COM A TECLA M (dev). Ver shared/hud/createLives.ts */
        this.lives = createLives(this, {
            total: this.livesTotal,
            remaining: this.livesLeft,
            gameId: GAME_ID,
            x: 40,
            y: 40,
            size: 30,
            stage: () => this.level.level,
        })
        this.events.once('shutdown', () => this.lives.destroy())
    }

    private fadeIn() {
        const veil = this.add.rectangle(W / 2, H / 2, W, H, C.cream, 1).setDepth(880)
        this.tweens.add({ targets: veil, alpha: 0, duration: 320, onComplete: () => veil.destroy() })
    }

    private startPhase() {
        this.locked = false
        if (this.level.timeLimit) EventBus.emit('timer-start', this.level.timeLimit)
    }

    private buildHeader() {
        this.headerLayer = this.add.container(0, 0).setDepth(60)

        const bar = this.add.graphics()
        bar.fillStyle(C.panel, 0.97)
        bar.fillRect(0, 0, W, TOPBAR)
        bar.lineStyle(3, C.border, 1)
        bar.lineBetween(0, TOPBAR, W, TOPBAR)

        const pill = this.add.graphics()
        pill.fillStyle(C.lilac, 1)
        pill.fillRoundedRect(HEADER.pillX, HEADER.pillY - HEADER.pillH / 2, HEADER.pillW, HEADER.pillH, HEADER.pillH / 2)
        pill.fillStyle(C.white, A.gloss)
        pill.fillRoundedRect(HEADER.pillX + 7, HEADER.pillY - HEADER.pillH / 2 + 6, HEADER.pillW - 14, 11, 6)

        const pillText = this.add.text(HEADER.pillX + HEADER.pillW / 2, HEADER.pillY, `NÍVEL ${this.level.level}`, {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '20px', color: hex(C.ink),
        }).setOrigin(0.5).setResolution(2)

        const dots = this.add.graphics()
        this.level.phases.forEach((_, i) => {
            const x = HEADER.dotsX + i * HEADER.dotGap
            const done = i < this.phaseIdx
            const now = i === this.phaseIdx
            dots.fillStyle(now ? C.stroke : done ? C.good : C.grey, now || done ? 1 : 0.4)
            if (now) dots.fillRoundedRect(x - 15, HEADER.dotsY - HEADER.dotR, 30, HEADER.dotR * 2, HEADER.dotR)
            else dots.fillCircle(x, HEADER.dotsY, HEADER.dotR)
        })

        this.stepText = this.add.text(HEADER.helpX - 62, HEADER.dotsY, '', {
            fontFamily: 'DynaPuff, Arial, sans-serif', fontStyle: 'bold', fontSize: '18px', color: hex(C.inkSoft),
        }).setOrigin(1, 0.5).setResolution(2)

        this.helpBtn = this.buildHelpButton()
        this.helpBtn.setVisible(false)

        this.headerLayer.add([bar, pill, pillText, dots, this.stepText, this.helpBtn])
        this.paintStepText()
    }

    private paintStepText() {
        if (!this.stepText) return
        const p = this.phase
        if (p.kind === 'livre') this.stepText.setText(`parte ${this.stepIdx + 1} de ${p.steps.length}`)
        else this.stepText.setText('')
    }

    private buildHelpButton() {
        const btn = this.add.container(HEADER.helpX, HEADER.helpY)
        const g = this.add.graphics()
        g.fillStyle(C.shadow, 0.16)
        g.fillCircle(0, 6, HEADER.helpR)
        g.fillStyle(C.lilac, 1)
        g.fillCircle(0, 0, HEADER.helpR)
        g.fillStyle(C.white, A.gloss)
        g.fillEllipse(0, -10, 30, 12)

        const t = this.add.text(0, 0, '?', {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '27px', color: hex(C.ink),
        }).setOrigin(0.5).setResolution(2)

        btn.add([g, t])
        btn.setSize(HEADER.helpR * 2 + 12, HEADER.helpR * 2 + 12)
        btn.setInteractive({ useHandCursor: true })
        btn.on('pointerdown', () => {
            if (this.isInputBlocked() || this.ended) return
            this.tweens.add({ targets: btn, scale: 0.9, duration: 80, yoyo: true })
            this.replayTutorial()
        })
        return btn
    }

    private buildHub() {
        this.roomLayer?.destroy()
        this.roomLayer = undefined
        this.hubLayer = this.add.container(0, 0).setDepth(5)

        const bg = this.add.image(W / 2, H / 2, 'bg-saguao')
        bg.setScale(Math.max(W / bg.width, H / bg.height))

        const veil = this.add.graphics()
        veil.fillStyle(C.night, A.veil)
        veil.fillRect(0, 0, W, H)

        const glowFloor = this.add.graphics()
        glowFloor.fillStyle(C.butter, 0.07)
        glowFloor.fillEllipse(W / 2, 470, 1180, 300)

        this.hubLayer.add([bg, veil, glowFloor])

        const list = this.enabledRooms()
        const big = list.length <= 2
        const dw = big ? HUB.doorW : HUB.doorWSmall
        const dh = big ? HUB.doorH : HUB.doorHSmall
        const gap = big ? HUB.gap : HUB.gapSmall
        const total = list.length * dw + (list.length - 1) * gap
        const startX = W / 2 - total / 2 + dw / 2

        list.forEach((id, i) => {
            const x = startX + i * (dw + gap)
            const door = this.buildDoor(id, x, dw, dh)
            this.hubLayer!.add(door)

            door.setAlpha(0).setY(HUB.doorY + 44).setScale(0.86)
            this.tweens.add({
                targets: door, alpha: 1, y: HUB.doorY, scale: 1,
                duration: 520, delay: 120 * i, ease: 'Back.easeOut',
                onComplete: () => {
                    this.tweens.add({
                        targets: door, y: HUB.doorY - 7,
                        duration: 1600 + i * 130, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
                    })
                },
            })
        })

        this.buildTino('hub')
        this.speak('apontando', this.hubLine())
    }

    private enabledRooms(): StructureId[] {
        const p = this.phase
        if (p.kind === 'guiada') return [p.room]
        if (p.kind === 'vitrine') return [...p.offered]
        return [...ROOM_ORDER]
    }

    private hubLine() {
        const p = this.phase
        if (p.kind === 'guiada') return `${p.intro} Toque na porta acesa.`
        if (p.kind === 'vitrine') return `${p.question} Duas portas servem. Toque na que você acha melhor.`
        return `${p.question} ${p.steps[this.stepIdx].need}: em qual sala isso cabe?`
    }

    private buildDoor(id: StructureId, x: number, dw: number, dh: number) {
        const def = ROOMS[id]
        const c = this.add.container(x, HUB.doorY)

        const halo = this.add.graphics()
        halo.fillStyle(C.butter, 0.16)
        halo.fillEllipse(0, dh / 2 - 6, dw * 1.25, 56)

        const img = this.add.image(0, 0, def.texture)
        img.setDisplaySize(dw, dh)

        const frame = this.add.graphics()
        frame.lineStyle(6, C.butter, 0.85)
        frame.strokeRoundedRect(-dw / 2 - 7, -dh / 2 - 7, dw + 14, dh + 14, 22)
        this.tweens.add({ targets: frame, alpha: 0.32, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })

        const icon = this.add.graphics()
        this.drawRoomIcon(icon, id, 0, -14, dw * 0.19, C.ink)

        const pw = dw + 46
        const py = dh / 2 + HUB.plateGap
        const plate = this.add.graphics()
        plate.fillStyle(C.shadow, 0.24)
        plate.fillRoundedRect(-pw / 2 + 3, py - HUB.plateH / 2 + 7, pw, HUB.plateH, HUB.plateH / 2)
        plate.fillStyle(C.panel, 1)
        plate.fillRoundedRect(-pw / 2, py - HUB.plateH / 2, pw, HUB.plateH, HUB.plateH / 2)
        plate.fillStyle(C.white, 0.55)
        plate.fillRoundedRect(-pw / 2 + 12, py - HUB.plateH / 2 + 7, pw - 24, 13, 7)

        const kid = this.add.text(0, py, def.kidName, {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
            fontSize: dw > 220 ? '22px' : '18px',
            color: hex(C.ink),
        }).setOrigin(0.5).setResolution(2)
        if (kid.width > pw - 28) kid.setScale((pw - 28) / kid.width)

        const ty = py + HUB.techGap + 8
        const tw = Math.min(pw - 40, 132)
        const techBg = this.add.graphics()
        techBg.fillStyle(C.lilac, 1)
        techBg.fillRoundedRect(-tw / 2, ty - 15, tw, 30, 15)

        const tech = this.add.text(0, ty, def.techName, {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '15px', color: hex(C.ink),
        }).setOrigin(0.5).setResolution(2)

        c.add([halo, frame, img, icon, plate, kid, techBg, tech])

        const hit = this.add.rectangle(0, 40, dw + 30, dh + 170, C.white, 0.001)
        hit.setInteractive({ useHandCursor: true })
        hit.on('pointerover', () => this.tweens.add({ targets: c, scale: 1.05, duration: 160, ease: 'Sine.easeOut' }))
        hit.on('pointerout', () => this.tweens.add({ targets: c, scale: 1, duration: 160, ease: 'Sine.easeOut' }))
        hit.on('pointerdown', () => this.onDoorPick(id, true))
        c.add(hit)

        return c
    }

    private onDoorPick(id: StructureId, _on: boolean) {
        if (this.isInputBlocked() || this.locked || this.ended) return

        const p = this.phase

        if (p.kind === 'livre') {
            const step = p.steps[this.stepIdx]
            this.report[id].picks++
            if (id !== step.room) {
                this.wrongCount++
                this.speak('duvida', `Aqui não cabe. ${step.need} não fica nesta sala.`)
                return
            }
            this.report[id].goodPicks++
            this.enterRoom(id, step.task)
            return
        }

        if (p.kind === 'vitrine') {
            this.report[id].picks++
            if (id === p.best) {
                this.report[id].goodPicks++
                this.points += 5
            }
            this.stepIdx = ROOM_ORDER.indexOf(id)
            this.enterRoom(id, p.tasks[id])
            return
        }

        this.report[id].picks++
        this.report[id].goodPicks++
        this.enterRoom(id, p.task)
    }

    private enterRoom(id: StructureId, task: TaskConfig) {
        this.locked = true
        EventBus.emit('curtain', () => {
            this.hubLayer?.destroy()
            this.hubLayer = undefined
            this.buildRoom(id, task)
            this.locked = false
        })
    }

    private buildRoom(id: StructureId, task: TaskConfig) {
        const def = ROOMS[id]
        this.currentTask = task
        this.taskLocked = false
        this.roomLayer = this.add.container(0, 0).setDepth(5)

        const bg = this.add.image(W / 2, H / 2, 'bg-sala')
        bg.setScale(Math.max(W / bg.width, H / bg.height))
        const veil = this.add.graphics()
        veil.fillStyle(C.night, 0.34)
        veil.fillRect(0, 0, W, H)
        this.roomLayer.add([bg, veil])

        const pw = 300
        const ph = 74
        const px = 24
        const py = 104
        const plaque = this.add.graphics()
        plaque.fillStyle(C.shadow, 0.24)
        plaque.fillRoundedRect(px + 4, py + 8, pw, ph, 20)
        plaque.fillStyle(C.panel, 1)
        plaque.fillRoundedRect(px, py, pw, ph, 20)
        plaque.fillStyle(C.white, 0.5)
        plaque.fillRoundedRect(px + 12, py + 9, pw - 24, 14, 7)
        plaque.lineStyle(4, C.lilac, 1)
        plaque.strokeRoundedRect(px, py, pw, ph, 20)

        const icon = this.add.graphics()
        this.drawRoomIcon(icon, id, px + 44, py + ph / 2, 24, C.stroke)

        const kid = this.add.text(px + 80, py + 26, def.kidName, {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '20px', color: hex(C.ink),
        }).setOrigin(0, 0.5).setResolution(2)

        const tech = this.add.text(px + 80, py + 51, def.techName, {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '15px', color: hex(C.stroke),
        }).setOrigin(0, 0.5).setResolution(2)

        this.roomLayer.add([plaque, icon, kid, tech])
        this.tweens.add({ targets: [plaque, icon, kid, tech], alpha: { from: 0, to: 1 }, duration: 320 })

        this.buildTino('sala')

        if (task.structure === 'lista') this.buildLista(task)
        if (task.structure === 'matriz') this.buildMatriz(task)
        if (task.structure === 'registro') this.buildRegistro(task)
        if (task.structure === 'grafo') this.buildGrafo(task)
        if (task.structure === 'solto') this.buildSolto(task)

        this.taskLocked = true
        this.time.delayedCall(560, () => {
            this.runRoomTutorial(id, () => this.speak('normal', task.prompt))
        })
    }

    private buildTino(mode: 'hub' | 'sala') {
        const layer = mode === 'hub' ? this.hubLayer! : this.roomLayer!
        const x = mode === 'hub' ? HUB.tinoX : ROOM.tinoX
        const y = mode === 'hub' ? HUB.tinoY : ROOM.tinoY
        const size = mode === 'hub' ? HUB.tinoH : ROOM.tinoH
        const bx = mode === 'hub' ? HUB.balloonX : ROOM.balloonX
        const by = mode === 'hub' ? HUB.balloonY : ROOM.balloonY
        const bw = mode === 'hub' ? HUB.balloonW : ROOM.balloonW
        const bh = mode === 'hub' ? HUB.balloonH : ROOM.balloonH
        const tx = mode === 'hub' ? HUB.tailX : ROOM.tailX
        const ty = mode === 'hub' ? HUB.tailY : ROOM.tailY

        const g = this.add.graphics()
        g.fillStyle(C.shadow, 0.2)
        g.fillRoundedRect(bx + 4, by + 9, bw, bh, 26)
        g.fillStyle(C.panel, 0.99)
        g.fillRoundedRect(bx, by, bw, bh, 26)
        g.fillTriangle(tx + 20, ty - 24, tx + 20, ty + 24, tx - 18, ty + 2)
        g.lineStyle(4, C.lilac, 1)
        g.strokeRoundedRect(bx, by, bw, bh, 26)

        this.balloonText = this.add.text(bx + bw / 2, by + bh / 2, '', {
            fontFamily: 'DynaPuff, Arial, sans-serif', fontStyle: 'bold', fontSize: '25px', color: hex(C.ink),
            align: 'center', wordWrap: { width: bw - 64 },
        }).setOrigin(0.5).setResolution(2)

        this.tino = this.add.image(x, y, 'robo-normal').setOrigin(0.5, 1)
        this.tino.setDisplaySize(size, size)
        this.tino.setData('baseY', y)

        layer.add([g, this.balloonText, this.tino])

        this.tweens.add({
            targets: this.tino, y: y - 10,
            duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
        })
    }

    private speak(pose: RobotPose, text: string) {
        if (!this.tino || !this.balloonText || !this.tino.active) return

        const size = this.tino.displayHeight
        this.tino.setTexture(`robo-${pose}`)
        this.tino.setDisplaySize(size, size)
        this.tweens.add({ targets: this.tino, scaleX: this.tino.scaleX * 1.06, duration: 150, yoyo: true, ease: 'Sine.easeOut' })

        this.typeTimer?.remove()
        this.balloonText.setText('')
        const target = this.balloonText
        let i = 0
        this.typeTimer = this.time.addEvent({
            delay: 18,
            repeat: text.length - 1,
            callback: () => {
                if (!target.active) return
                i++
                target.setText(text.slice(0, i))
            },
        })
    }

    private buildLista(task: ListaTask) {
        this.placed = []
        this.slotLayer = this.add.graphics()
        this.roomLayer!.add(this.slotLayer)

        if (task.variant === 'ordenar') {
            this.paintSlots(task.answer.length)
            task.items.forEach((id, i) => {
                const total = task.items.length * LISTA.cardW + (task.items.length - 1) * LISTA.gap
                const x = STAGE.cx - total / 2 + LISTA.cardW / 2 + i * (LISTA.cardW + LISTA.gap)
                const card = this.buildItemCard(this.itemOf(id), x, LISTA.trayY)
                this.trayCards.set(id, card)
                this.listaHome.set(id, x)
                card.setAlpha(0).setScale(0.8)
                this.tweens.add({ targets: card, alpha: 1, scale: 1, duration: 380, delay: 80 * i, ease: 'Back.easeOut' })
                const hit = this.add.rectangle(0, 0, LISTA.cardW, LISTA.cardH, C.white, 0.001)
                hit.setInteractive({ useHandCursor: true })
                hit.on('pointerdown', () => this.onListaTap(task, id))
                card.add(hit)
            })
            return
        }

        const fila = task.items
        const total = fila.length * LISTA.cardW + (fila.length - 1) * LISTA.gap
        const left = STAGE.cx - total / 2
        fila.forEach((id, i) => {
            const x = left + LISTA.cardW / 2 + i * (LISTA.cardW + LISTA.gap)
            this.buildItemCard(this.itemOf(id), x, LISTA.slotY)
        })

        const incoming = this.buildItemCard(this.itemOf(task.incoming!), STAGE.cx, LISTA.trayY)
        this.tweens.add({ targets: incoming, y: LISTA.trayY - 10, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })

        for (let i = 0; i <= fila.length; i++) {
            const gx = left + i * (LISTA.cardW + LISTA.gap) - LISTA.gap / 2
            const gap = this.add.container(gx, LISTA.slotY)
            const g = this.add.graphics()
            g.lineStyle(4, C.stroke, 0.7)
            g.strokeRoundedRect(-22, -LISTA.cardH / 2, 44, LISTA.cardH, 12)
            g.fillStyle(C.butter, 0.5)
            g.fillRoundedRect(-22, -LISTA.cardH / 2, 44, LISTA.cardH, 12)
            const plus = this.add.text(0, 0, '+', {
                fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '30px', color: hex(C.stroke),
            }).setOrigin(0.5).setResolution(2)
            const hit = this.add.rectangle(0, 0, 56, LISTA.cardH, C.white, 0.001)
            hit.setInteractive({ useHandCursor: true })
            hit.on('pointerdown', () => this.onInsertPick(task, i, gap, incoming))
            gap.add([g, plus, hit])
            this.roomLayer!.add(gap)
        }
    }

    private paintSlots(n: number) {
        if (!this.slotLayer) return
        const total = n * LISTA.cardW + (n - 1) * LISTA.gap
        const left = STAGE.cx - total / 2
        this.slotLayer.clear()
        for (let i = 0; i < n; i++) {
            const x = left + i * (LISTA.cardW + LISTA.gap)
            // vaga cheia não é mais vaga certa: quem confere a ordem é o fim
            const taken = i < this.placed.length
            this.slotLayer.fillStyle(C.panelSoft, 0.9)
            this.slotLayer.fillRoundedRect(x, LISTA.slotY - LISTA.cardH / 2, LISTA.cardW, LISTA.cardH, 16)
            this.slotLayer.lineStyle(4, C.border, 1)
            this.slotLayer.strokeRoundedRect(x, LISTA.slotY - LISTA.cardH / 2, LISTA.cardW, LISTA.cardH, 16)
            if (taken) continue
            this.slotLayer.fillStyle(C.stroke, 0.55)
            this.slotLayer.fillCircle(x + LISTA.cardW / 2, LISTA.slotY, 9)
        }
    }

    private listaSlotX(n: number, i: number) {
        const total = n * LISTA.cardW + (n - 1) * LISTA.gap
        return STAGE.cx - total / 2 + i * (LISTA.cardW + LISTA.gap) + LISTA.cardW / 2
    }

    /*
     * ORDENAR SEM PODER DESFAZER NÃO É ORDENAR.
     *
     * Antes só a peça certa entrava na fila: errar sacudia a carta e ela
     * ficava onde estava. A criança nunca via a própria ordem montada, só o
     * "ainda não" — e um jogo de fila em que a fila só aceita a resposta
     * certa é um quiz disfarçado.
     *
     * Agora qualquer peça entra na primeira vaga livre, tocar numa peça da
     * fila devolve ela para a bandeja (as de trás andam para a frente), e a
     * conferência acontece quando a fila enche. Errado não desmonta nada:
     * a fila fica na tela para ser mexida, que é onde a criança compara
     * tamanho com tamanho de verdade.
     */
    private onListaTap(task: ListaTask, id: string) {
        if (this.isInputBlocked() || this.taskLocked) return
        const card = this.trayCards.get(id)
        if (!card) return
        if (this.placed.includes(id)) this.takeFromLista(task, id, card)
        else this.putInLista(task, id, card)
    }

    private putInLista(task: ListaTask, id: string, card: Phaser.GameObjects.Container) {
        this.placed.push(id)
        const n = task.answer.length
        this.tweens.add({
            targets: card, x: this.listaSlotX(n, this.placed.length - 1), y: LISTA.slotY,
            duration: 340, ease: 'Back.easeOut',
            onComplete: () => {
                if (this.placed.length >= n) this.checkLista(task)
            },
        })
        this.paintSlots(n)
    }

    private takeFromLista(task: ListaTask, id: string, card: Phaser.GameObjects.Container) {
        this.placed = this.placed.filter(other => other !== id)
        this.tweens.add({
            targets: card, x: this.listaHome.get(id) ?? card.x, y: LISTA.trayY,
            duration: 300, ease: 'Back.easeOut',
        })
        this.layoutPlaced(task)
        this.paintSlots(task.answer.length)
    }

    /** Tirou uma do meio: as de trás andam para a frente. */
    private layoutPlaced(task: ListaTask) {
        this.placed.forEach((id, i) => {
            const c = this.trayCards.get(id)
            if (!c) return
            this.tweens.add({
                targets: c, x: this.listaSlotX(task.answer.length, i), y: LISTA.slotY,
                duration: 260, ease: 'Sine.easeOut',
            })
        })
    }

    private checkLista(task: ListaTask) {
        if (this.placed.every((id, i) => id === task.answer[i])) {
            this.taskLocked = true
            this.finishTask(task)
            return
        }

        this.wrongCount++
        this.placed.forEach(id => {
            const c = this.trayCards.get(id)
            if (!c) return
            this.tweens.add({ targets: c, y: LISTA.slotY + 9, duration: 70, yoyo: true, repeat: 2 })
        })
        this.speak('duvida', task.hint)
    }

    private onInsertPick(task: ListaTask, index: number, gap: Phaser.GameObjects.Container, incoming: Phaser.GameObjects.Container) {
        if (this.isInputBlocked() || this.taskLocked) return
        if (index !== task.insertAt) {
            this.wrongCount++
            this.tweens.add({ targets: gap, x: gap.x + 8, duration: 60, yoyo: true, repeat: 2 })
            this.speak('duvida', task.hint)
            return
        }
        this.taskLocked = true
        this.tweens.killTweensOf(incoming)
        this.tweens.add({
            targets: incoming, x: gap.x, y: LISTA.slotY, duration: 420, ease: 'Back.easeOut',
            onComplete: () => this.finishTask(task),
        })
    }

    private itemOf(id: string) {
        return ITEMS[id] ?? { id, label: id, shape: 'circulo' as ShapeKind, swatch: 'lilas' as const, size: 3 }
    }

    private buildItemCard(item: { label: string; shape: ShapeKind; swatch: keyof typeof SWATCH; size: number }, x: number, y: number) {
        const c = this.add.container(x, y)
        const g = this.add.graphics()
        g.fillStyle(C.shadow, A.shadow)
        g.fillRoundedRect(-LISTA.cardW / 2 + 3, -LISTA.cardH / 2 + 8, LISTA.cardW, LISTA.cardH, 16)
        g.fillStyle(C.panel, 1)
        g.fillRoundedRect(-LISTA.cardW / 2, -LISTA.cardH / 2, LISTA.cardW, LISTA.cardH, 16)
        g.fillStyle(C.white, 0.6)
        g.fillRoundedRect(-LISTA.cardW / 2 + 10, -LISTA.cardH / 2 + 8, LISTA.cardW - 20, 14, 7)
        g.lineStyle(3, C.border, 1)
        g.strokeRoundedRect(-LISTA.cardW / 2, -LISTA.cardH / 2, LISTA.cardW, LISTA.cardH, 16)

        const shape = this.add.graphics()
        const r = LISTA.shapeRBase + item.size * LISTA.shapeRStep
        this.drawShape(shape, item.shape, 0, LISTA.shapeDY, r, SWATCH[item.swatch])

        const label = this.add.text(0, LISTA.labelDY, item.label, {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '18px', color: hex(C.ink),
            align: 'center', wordWrap: { width: LISTA.cardW - 16 },
            stroke: hex(C.panel), strokeThickness: 5,
        }).setOrigin(0.5).setResolution(2)

        c.add([g, shape, label])
        this.roomLayer!.add(c)
        return c
    }

    private buildMatriz(task: MatrizTask) {
        const gridW = task.cols * MATRIZ.cell + (task.cols - 1) * MATRIZ.gap
        const gridH = task.rows * MATRIZ.cell + (task.rows - 1) * MATRIZ.gap
        const totalW = MATRIZ.headSize + MATRIZ.headGap + gridW
        const totalH = MATRIZ.headSize + MATRIZ.headGap + gridH
        const left = MATRIZ.cx - totalW / 2
        const top = MATRIZ.cy - totalH / 2
        const gx = left + MATRIZ.headSize + MATRIZ.headGap
        const gy = top + MATRIZ.headSize + MATRIZ.headGap

        task.colKeys.forEach((sw, c) => {
            const x = gx + c * (MATRIZ.cell + MATRIZ.gap) + MATRIZ.cell / 2
            const g = this.add.graphics()
            g.fillStyle(C.panel, 1)
            g.fillRoundedRect(x - MATRIZ.headSize / 2, top, MATRIZ.headSize, MATRIZ.headSize, 14)
            g.lineStyle(3, C.border, 1)
            g.strokeRoundedRect(x - MATRIZ.headSize / 2, top, MATRIZ.headSize, MATRIZ.headSize, 14)
            g.fillStyle(SWATCH[sw], 1)
            g.fillCircle(x, top + MATRIZ.headSize / 2, 19)
            this.roomLayer!.add(g)
        })

        task.rowKeys.forEach((sh, r) => {
            const y = gy + r * (MATRIZ.cell + MATRIZ.gap) + MATRIZ.cell / 2
            const g = this.add.graphics()
            g.fillStyle(C.panel, 1)
            g.fillRoundedRect(left, y - MATRIZ.headSize / 2, MATRIZ.headSize, MATRIZ.headSize, 14)
            g.lineStyle(3, C.border, 1)
            g.strokeRoundedRect(left, y - MATRIZ.headSize / 2, MATRIZ.headSize, MATRIZ.headSize, 14)
            this.drawShape(g, sh, left + MATRIZ.headSize / 2, y, 20, C.stroke)
            this.roomLayer!.add(g)
        })

        for (let r = 0; r < task.rows; r++) {
            for (let c = 0; c < task.cols; c++) {
                const x = gx + c * (MATRIZ.cell + MATRIZ.gap) + MATRIZ.cell / 2
                const y = gy + r * (MATRIZ.cell + MATRIZ.gap) + MATRIZ.cell / 2
                const cell = this.buildCell(task, r, c, x, y)
                this.roomLayer!.add(cell)
            }
        }
    }

    private buildCell(task: MatrizTask, r: number, c: number, x: number, y: number) {
        const cont = this.add.container(x, y)
        const id = task.cells[r * task.cols + c]
        const g = this.add.graphics()
        const paint = (line: number, width: number, fill: number) => {
            g.clear()
            g.fillStyle(fill, 1)
            g.fillRoundedRect(-MATRIZ.cell / 2, -MATRIZ.cell / 2, MATRIZ.cell, MATRIZ.cell, 14)
            g.lineStyle(width, line, 1)
            g.strokeRoundedRect(-MATRIZ.cell / 2, -MATRIZ.cell / 2, MATRIZ.cell, MATRIZ.cell, 14)
        }
        paint(C.border, 3, C.panelSoft)

        const art = this.add.graphics()
        if (id) {
            const item = this.itemOf(id)
            this.drawShape(art, item.shape, 0, 0, 24, SWATCH[item.swatch])
        } else {
            art.lineStyle(3, C.grey, 0.8)
            art.strokeCircle(0, 0, 20)
        }

        const hit = this.add.rectangle(0, 0, MATRIZ.cell, MATRIZ.cell, C.white, 0.001)
        hit.setInteractive({ useHandCursor: true })
        hit.on('pointerover', () => { if (!this.taskLocked) paint(C.stroke, 4, C.panel) })
        hit.on('pointerout', () => { if (!this.taskLocked) paint(C.border, 3, C.panelSoft) })
        hit.on('pointerdown', () => {
            if (this.isInputBlocked() || this.taskLocked) return
            if (r !== task.target.row || c !== task.target.col) {
                this.wrongCount++
                paint(C.warn, 4, C.warnSoft)
                this.tweens.add({ targets: cont, x: cont.x + 8, duration: 60, yoyo: true, repeat: 2 })
                this.time.delayedCall(520, () => paint(C.border, 3, C.panelSoft))
                this.speak('duvida', task.hint)
                return
            }
            this.taskLocked = true
            paint(C.good, 6, C.goodSoft)
            this.tweens.add({ targets: cont, scale: 1.12, duration: 180, yoyo: true })
            this.time.delayedCall(560, () => this.finishTask(task))
        })

        cont.add([g, art, hit])
        return cont
    }

    private buildRegistro(task: RegistroTask) {
        const n = task.fields.length
        const hasOptions = task.variant === 'achar-valor'
        const rowH = hasOptions ? 50 : REGISTRO.rowH
        const rowGap = hasOptions ? 56 : 62
        const cardH = 104 + n * rowGap
        const top = REGISTRO.cardTop
        const cx = REGISTRO.cx

        const g = this.add.graphics()
        g.fillStyle(C.shadow, A.shadow)
        g.fillRoundedRect(cx - REGISTRO.cardW / 2 + 4, top + 9, REGISTRO.cardW, cardH, 24)
        g.fillStyle(C.panel, 1)
        g.fillRoundedRect(cx - REGISTRO.cardW / 2, top, REGISTRO.cardW, cardH, 24)
        g.lineStyle(3, C.stroke, 1)
        g.strokeRoundedRect(cx - REGISTRO.cardW / 2, top, REGISTRO.cardW, cardH, 24)
        g.fillStyle(C.lilac, 1)
        g.fillRoundedRect(cx - REGISTRO.cardW / 2, top, REGISTRO.cardW, 56, { tl: 24, tr: 24, bl: 0, br: 0 })
        this.roomLayer!.add(g)

        const title = this.add.text(cx, top + 28, task.title, {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '23px', color: hex(C.ink),
        }).setOrigin(0.5).setResolution(2)
        this.roomLayer!.add(title)

        const rows = new Map<string, () => void>()

        task.fields.forEach((f, i) => {
            const y = top + 92 + i * rowGap
            const row = this.add.container(cx, y)
            const rg = this.add.graphics()
            const paint = (line: number, width: number, fill: number) => {
                rg.clear()
                rg.fillStyle(fill, 1)
                rg.fillRoundedRect(-REGISTRO.rowW / 2, -rowH / 2, REGISTRO.rowW, rowH, 14)
                rg.lineStyle(width, line, 1)
                rg.strokeRoundedRect(-REGISTRO.rowW / 2, -rowH / 2, REGISTRO.rowW, rowH, 14)
            }
            paint(C.border, 3, C.panelSoft)

            const key = this.add.text(REGISTRO.keyDX, 0, f.label, {
                fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '19px', color: hex(C.stroke),
            }).setOrigin(0, 0.5).setResolution(2)

            const val = this.add.text(REGISTRO.valDX, 0, f.value || '?', {
                fontFamily: 'DynaPuff, Arial, sans-serif', fontStyle: 'bold', fontSize: '20px',
                color: hex(f.value ? C.ink : C.grey),
            }).setOrigin(1, 0.5).setResolution(2)

            row.add([rg, key, val])
            this.roomLayer!.add(row)
            rows.set(f.key, () => paint(C.good, 5, C.goodSoft))

            if (hasOptions) {
                if (f.key === task.answerKey) {
                    paint(C.butter, 4, C.warnSoft)
                    this.tweens.add({ targets: row, scale: 1.03, duration: 700, yoyo: true, repeat: -1 })
                }
                return
            }

            const hit = this.add.rectangle(0, 0, REGISTRO.rowW, rowH, C.white, 0.001)
            hit.setInteractive({ useHandCursor: true })
            hit.on('pointerdown', () => {
                if (this.isInputBlocked() || this.taskLocked) return
                if (f.key !== task.answerKey) {
                    this.wrongCount++
                    paint(C.warn, 4, C.warnSoft)
                    this.tweens.add({ targets: row, x: row.x + 8, duration: 60, yoyo: true, repeat: 2 })
                    this.time.delayedCall(520, () => paint(C.border, 3, C.panelSoft))
                    this.speak('duvida', task.hint)
                    return
                }
                this.taskLocked = true
                paint(C.good, 5, C.goodSoft)
                this.tweens.add({ targets: row, scale: 1.05, duration: 180, yoyo: true })
                this.time.delayedCall(560, () => this.finishTask(task))
            })
            row.add(hit)
        })

        if (!hasOptions) return

        const options = task.options ?? []
        const answer = options[0]
        const shown = Phaser.Utils.Array.Shuffle([...options])
        const totalW = shown.length * REGISTRO.optionW + (shown.length - 1) * REGISTRO.optionGap
        const startX = cx - totalW / 2 + REGISTRO.optionW / 2
        const oy = top + cardH + 52

        shown.forEach((opt, i) => {
            const x = startX + i * (REGISTRO.optionW + REGISTRO.optionGap)
            const btn = this.button(x, oy, REGISTRO.optionW, REGISTRO.optionH, opt, C.lilac, () => {
                if (opt !== answer) {
                    this.wrongCount++
                    this.tweens.add({ targets: btn, x: btn.x + 8, duration: 60, yoyo: true, repeat: 2 })
                    this.speak('duvida', task.hint)
                    return
                }
                this.taskLocked = true
                rows.get(task.answerKey)?.()
                this.time.delayedCall(560, () => this.finishTask(task))
            }, '20px')
            this.roomLayer!.add(btn)
            btn.setAlpha(0)
            this.tweens.add({ targets: btn, alpha: 1, duration: 260, delay: 160 + i * 90 })
        })
    }

    private buildGrafo(task: GrafoTask) {
        const panel = this.add.graphics()
        panel.fillStyle(C.panel, 0.94)
        panel.fillRoundedRect(GRAFO.x, GRAFO.listY - 8, GRAFO.w, 74, 18)
        panel.lineStyle(3, C.border, 1)
        panel.strokeRoundedRect(GRAFO.x, GRAFO.listY - 8, GRAFO.w, 74, 18)
        this.roomLayer!.add(panel)

        const half = Math.ceil(task.statements.length / 2)
        task.statements.forEach((s, i) => {
            const col = i < half ? 0 : 1
            const row = i % half
            const t = this.add.text(GRAFO.x + 24 + col * (GRAFO.w / 2), GRAFO.listY + 10 + row * GRAFO.lineGap, `• ${s}`, {
                fontFamily: 'DynaPuff, Arial, sans-serif', fontStyle: 'bold', fontSize: '18px', color: hex(C.ink),
            }).setOrigin(0, 0.5).setResolution(2)
            this.roomLayer!.add(t)
        })

        this.edgeLayer = this.add.graphics()
        this.roomLayer!.add(this.edgeLayer)

        task.nodes.forEach(n => {
            const x = GRAFO.x + n.x * GRAFO.w
            const y = GRAFO.y + n.y * GRAFO.h
            this.nodePos.set(n.id, { x, y })
        })

        task.nodes.forEach((n, i) => {
            const p = this.nodePos.get(n.id)!
            const cont = this.add.container(p.x, p.y)
            const g = this.add.graphics()
            const paint = (line: number, width: number, fill: number) => {
                g.clear()
                g.fillStyle(C.shadow, A.shadow)
                g.fillCircle(0, 7, GRAFO.nodeR)
                g.fillStyle(fill, 1)
                g.fillCircle(0, 0, GRAFO.nodeR)
                g.fillStyle(C.white, A.gloss)
                g.fillEllipse(0, -16, GRAFO.nodeR, 18)
                g.lineStyle(width, line, 1)
                g.strokeCircle(0, 0, GRAFO.nodeR)
            }
            paint(C.stroke, 4, C.panel)

            const label = this.add.text(0, GRAFO.labelDY, n.label, {
                fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '19px', color: hex(C.ink),
            }).setOrigin(0.5).setResolution(2)

            const hit = this.add.rectangle(0, 0, GRAFO.hitR * 2, GRAFO.hitR * 2, C.white, 0.001)
            hit.setInteractive({ useHandCursor: true })
            hit.on('pointerdown', () => this.onNodeTap(task, n.id, paint))

            cont.add([g, label, hit])
            cont.setData('paint', paint)
            cont.setAlpha(0).setScale(0.7)
            this.tweens.add({ targets: cont, alpha: 1, scale: 1, duration: 380, delay: 80 * i, ease: 'Back.easeOut' })
            this.roomLayer!.add(cont)
            this.trayCards.set(n.id, cont)
        })
    }

    private onNodeTap(task: GrafoTask, id: string, _paint: (l: number, w: number, f: number) => void) {
        if (this.isInputBlocked() || this.taskLocked) return

        const repaint = (nodeId: string, on: boolean) => {
            const c = this.trayCards.get(nodeId)
            const p = c?.getData('paint') as ((l: number, w: number, f: number) => void) | undefined
            p?.(on ? C.good : C.stroke, on ? 7 : 4, on ? C.goodSoft : C.panel)
        }

        if (!this.selectedNode) {
            this.selectedNode = id
            repaint(id, true)
            return
        }

        if (this.selectedNode === id) {
            repaint(id, false)
            this.selectedNode = null
            return
        }

        const from = this.selectedNode
        repaint(from, false)
        this.selectedNode = null

        const key = [from, id].sort().join('|')
        const valid = task.answer.some(([a, b]) => [a, b].sort().join('|') === key)

        if (!valid || this.edges.has(key)) {
            this.wrongCount++
            this.flashEdge(from, id)
            this.speak('duvida', task.hint)
            return
        }

        this.edges.add(key)
        this.paintEdges()
        if (this.edges.size >= task.answer.length) {
            this.taskLocked = true
            this.time.delayedCall(500, () => this.finishTask(task))
        }
    }

    private paintEdges() {
        if (!this.edgeLayer) return
        this.edgeLayer.clear()
        this.edges.forEach(key => {
            const [a, b] = key.split('|')
            const pa = this.nodePos.get(a)
            const pb = this.nodePos.get(b)
            if (!pa || !pb) return
            this.edgeLayer!.lineStyle(11, C.good, 1)
            this.edgeLayer!.lineBetween(pa.x, pa.y, pb.x, pb.y)
            this.edgeLayer!.lineStyle(4, C.goodSoft, 1)
            this.edgeLayer!.lineBetween(pa.x, pa.y, pb.x, pb.y)
        })
    }

    private flashEdge(a: string, b: string) {
        const pa = this.nodePos.get(a)
        const pb = this.nodePos.get(b)
        if (!pa || !pb || !this.roomLayer) return
        const g = this.add.graphics()
        g.lineStyle(9, C.warn, 1)
        g.lineBetween(pa.x, pa.y, pb.x, pb.y)
        this.roomLayer.add(g)
        this.tweens.add({ targets: g, alpha: 0, duration: 480, onComplete: () => g.destroy() })
    }

    private buildSolto(task: SoltoTask) {
        task.bins.forEach(b => this.binCounts.set(b, 0))

        const totalBins = task.bins.length * SOLTO.binW + (task.bins.length - 1) * SOLTO.binGap
        const binStart = SOLTO.cx - totalBins / 2 + SOLTO.binW / 2

        task.bins.forEach((kind, i) => {
            const x = binStart + i * (SOLTO.binW + SOLTO.binGap)
            const cont = this.add.container(x, SOLTO.binY + SOLTO.binH / 2)
            const g = this.add.graphics()
            const paint = (line: number, width: number, fill: number) => {
                g.clear()
                g.fillStyle(C.shadow, A.shadow)
                g.fillRoundedRect(-SOLTO.binW / 2 + 3, -SOLTO.binH / 2 + 8, SOLTO.binW, SOLTO.binH, 20)
                g.fillStyle(fill, 1)
                g.fillRoundedRect(-SOLTO.binW / 2, -SOLTO.binH / 2, SOLTO.binW, SOLTO.binH, 20)
                g.lineStyle(width, line, 1)
                g.strokeRoundedRect(-SOLTO.binW / 2, -SOLTO.binH / 2, SOLTO.binW, SOLTO.binH, 20)
                g.fillStyle(C.white, 0.5)
                g.fillRoundedRect(-SOLTO.binW / 2 + 12, -SOLTO.binH / 2 + 10, SOLTO.binW - 24, 14, 7)
            }
            paint(C.stroke, 3, C.panelSoft)

            const label = this.add.text(0, -SOLTO.binH / 2 + 46, BIN_LABEL[kind], {
                fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '21px', color: hex(C.ink),
            }).setOrigin(0.5).setResolution(2)

            const count = this.add.text(0, 26, '0', {
                fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '30px', color: hex(C.stroke),
            }).setOrigin(0.5).setResolution(2)

            const hit = this.add.rectangle(0, 0, SOLTO.binW, SOLTO.binH, C.white, 0.001)
            hit.setInteractive({ useHandCursor: true })
            hit.on('pointerdown', () => this.onBinTap(task, kind, cont, paint, count))

            cont.add([g, label, count, hit])
            this.roomLayer!.add(cont)
        })

        const perRow = 3
        task.tokens.forEach((tok, i) => {
            const row = Math.floor(i / perRow)
            const col = i % perRow
            const rowCount = Math.min(perRow, task.tokens.length - row * perRow)
            const totalW = rowCount * SOLTO.tokenW + (rowCount - 1) * SOLTO.tokenGap
            const x = SOLTO.cx - totalW / 2 + SOLTO.tokenW / 2 + col * (SOLTO.tokenW + SOLTO.tokenGap)
            const y = SOLTO.rowY + row * (SOLTO.tokenH + SOLTO.rowGapY)

            const cont = this.add.container(x, y)
            const g = this.add.graphics()
            const paint = (on: boolean) => {
                g.clear()
                g.fillStyle(C.shadow, A.shadow)
                g.fillRoundedRect(-SOLTO.tokenW / 2 + 3, -SOLTO.tokenH / 2 + 7, SOLTO.tokenW, SOLTO.tokenH, 16)
                g.fillStyle(on ? C.butter : C.panel, 1)
                g.fillRoundedRect(-SOLTO.tokenW / 2, -SOLTO.tokenH / 2, SOLTO.tokenW, SOLTO.tokenH, 16)
                g.lineStyle(on ? 5 : 3, on ? C.stroke : C.border, 1)
                g.strokeRoundedRect(-SOLTO.tokenW / 2, -SOLTO.tokenH / 2, SOLTO.tokenW, SOLTO.tokenH, 16)
            }
            paint(false)

            const t = this.add.text(0, 0, tok.text, {
                fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '26px', color: hex(C.ink),
            }).setOrigin(0.5).setResolution(2)

            const hit = this.add.rectangle(0, 0, SOLTO.tokenW, SOLTO.tokenH, C.white, 0.001)
            hit.setInteractive({ useHandCursor: true })
            hit.on('pointerdown', () => {
                if (this.isInputBlocked() || this.taskLocked) return
                this.tokenViews.forEach((v, key) => {
                    const p = v.getData('paint') as (on: boolean) => void
                    p(key === tok.id && this.selectedToken !== tok.id)
                })
                this.selectedToken = this.selectedToken === tok.id ? null : tok.id
                if (this.selectedToken) this.speak('apontando', 'Agora toque na caixa certa.')
            })

            cont.add([g, t, hit])
            cont.setData('paint', paint)
            cont.setData('kind', tok.kind)
            cont.setAlpha(0).setScale(0.8)
            this.tweens.add({ targets: cont, alpha: 1, scale: 1, duration: 340, delay: 70 * i, ease: 'Back.easeOut' })
            this.roomLayer!.add(cont)
            this.tokenViews.set(tok.id, cont)
        })
    }

    private onBinTap(
        task: SoltoTask,
        kind: TokenKind,
        bin: Phaser.GameObjects.Container,
        paint: (l: number, w: number, f: number) => void,
        count: Phaser.GameObjects.Text,
    ) {
        if (this.isInputBlocked() || this.taskLocked) return
        if (!this.selectedToken) {
            this.speak('duvida', 'Toque primeiro em uma peça lá de cima.')
            return
        }

        const view = this.tokenViews.get(this.selectedToken)
        if (!view) return
        const tokenKind = view.getData('kind') as TokenKind

        if (tokenKind !== kind) {
            this.wrongCount++
            paint(C.warn, 5, C.warnSoft)
            this.tweens.add({ targets: bin, x: bin.x + 8, duration: 60, yoyo: true, repeat: 2 })
            this.time.delayedCall(520, () => paint(C.stroke, 3, C.panelSoft))
            this.speak('duvida', task.hint)
            return
        }

        const id = this.selectedToken
        this.selectedToken = null
        this.tokenViews.delete(id)

        const n = (this.binCounts.get(kind) ?? 0) + 1
        this.binCounts.set(kind, n)
        count.setText(`${n}`)
        this.tweens.add({ targets: count, scale: 1.3, duration: 140, yoyo: true })
        paint(C.good, 5, C.goodSoft)
        this.time.delayedCall(420, () => paint(C.stroke, 3, C.panelSoft))

        this.tweens.add({
            targets: view,
            x: bin.x,
            y: bin.y,
            scale: 0.4,
            alpha: 0,
            duration: 420,
            ease: 'Back.easeIn',
            onComplete: () => {
                view.destroy()
                if (this.tokenViews.size > 0) return
                this.taskLocked = true
                this.time.delayedCall(360, () => this.finishTask(task))
            },
        })
    }

    private finishTask(task: TaskConfig) {
        const clean = this.wrongCount === 0
        const entry = this.report[task.structure]
        entry.tries++
        if (clean) entry.hits++

        const earned = clean ? 10 : 5
        this.points += earned

        runtimeGameBridge.emit({
            type: clean ? 'CORRECT_ANSWER' : 'WRONG_ANSWER',
            gameId: GAME_ID,
            pointsEarned: earned,
            stage: this.level.level,
        })
        // só o erro custa vida: o mesmo emit serve para acerto
        if (!(clean)) { this.lives.lose(); this.livesLeft = this.lives.remaining }

        this.speak('feliz', 'Conseguiu!')

        const p = this.phase

        if (p.kind === 'vitrine') {
            const chosen = ROOM_ORDER[this.stepIdx]
            const good = chosen === p.best
            const message = good ? p.whyBest : `${p.whyOther} A sala do ${ROOMS[p.best].kidName} guardava melhor.`
            this.time.delayedCall(700, () => this.showFeedback(good, message, earned, () => this.completePhase()))
            return
        }

        if (p.kind === 'livre' && this.stepIdx + 1 < p.steps.length) {
            this.time.delayedCall(700, () => {
                this.showFeedback(clean, task.explain, earned, () => {
                    this.stepIdx++
                    this.wrongCount = 0
                    this.paintStepText()
                    this.locked = true
                    EventBus.emit('curtain', () => {
                        this.roomLayer?.destroy()
                        this.roomLayer = undefined
                        this.resetTaskState()
                        this.buildHub()
                        this.locked = false
                    })
                })
            })
            return
        }

        this.time.delayedCall(700, () => this.showFeedback(clean, task.explain, earned, () => this.completePhase()))
    }

    private resetTaskState() {
        this.trayCards = new Map()
        this.listaHome = new Map()
        this.tokenViews = new Map()
        this.nodePos = new Map()
        this.binCounts = new Map()
        this.edges = new Set()
        this.placed = []
        this.selectedNode = null
        this.selectedToken = null
        this.edgeLayer = undefined
        this.slotLayer = undefined
        this.taskLocked = true
        this.tino = undefined
        this.balloonText = undefined
    }

    private onTimeUp = () => {
        if (this.ended || this.locked) return
        this.locked = true
        this.taskLocked = true
        this.showFeedback(false, 'O tempo do museu acabou. Vamos ver a próxima sala.', 0, () => this.completePhase())
    }

    private completePhase() {
        const isLastPhase = this.phaseIdx + 1 >= this.level.phases.length
        const isLastLevel = this.levelIdx + 1 >= LEVELS.length

        if (!isLastPhase) {
            this.sweepOut(() => this.scene.restart({ lives: this.livesLeft, 
                level: this.level.level,
                phase: this.phaseIdx + 1,
                points: this.points,
                report: this.report,
            }))
            return
        }

        if (!isLastLevel) {
            runtimeGameBridge.emit({ type: 'GAME_COMPLETED', gameId: GAME_ID, stage: this.level.level, totalStages: LEVELS.length })
            showLevelComplete(this, {
                subtitle: `Nível ${this.level.level} completo`,
                message: LEVELS[this.levelIdx + 1].objective,
                accent: C.lilac,
                overlayColor: C.stroke,
                titleColor: hex(C.ink),
                subtitleColor: hex(C.stroke),
                progress: { total: LEVELS.length, current: this.level.level },
                autoAdvance: {
                    delay: 2400,
                    onComplete: () => this.scene.restart({ lives: this.livesLeft, 
                        level: this.level.level + 1,
                        phase: 0,
                        points: this.points,
                        report: this.report,
                    }),
                },
            })
            return
        }

        this.ended = true
        runtimeGameBridge.emit({ type: 'GAME_COMPLETED', gameId: GAME_ID, stage: this.level.level, totalStages: LEVELS.length })
        this.showReport()
    }

    private sweepOut(onDone: () => void) {
        const veil = this.add.rectangle(W / 2, H / 2, W, H, C.lilac, 0).setDepth(880)
        this.tweens.add({ targets: veil, alpha: 1, duration: 260, ease: 'Sine.easeIn', onComplete: onDone })
    }

    private showReport() {
        EventBus.emit('timer-stop')

        const overlay = this.add.rectangle(W / 2, H / 2, W, H, C.stroke, A.overlay).setDepth(600).setInteractive()
        const modal = this.add.container(W / 2, H / 2).setDepth(601)

        const PW = 820
        const PH = 552
        const top = -PH / 2

        const bg = this.add.graphics()
        bg.fillStyle(C.shadow, 0.22)
        bg.fillRoundedRect(-PW / 2 + 4, top + 12, PW, PH, 30)
        bg.fillStyle(C.panel, 1)
        bg.fillRoundedRect(-PW / 2, top, PW, PH, 30)
        bg.lineStyle(4, C.lilac, 1)
        bg.strokeRoundedRect(-PW / 2, top, PW, PH, 30)
        bg.fillStyle(C.butter, 1)
        bg.fillRoundedRect(-170, top - 13, 340, 24, 12)

        const title = this.add.text(0, top + 52, 'Crachá de Curador', {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '36px', color: hex(C.ink),
        }).setOrigin(0.5).setResolution(2)

        const sub = this.add.text(0, top + 94, `${this.points} pontos no museu`, {
            fontFamily: 'DynaPuff, Arial, sans-serif', fontStyle: 'bold', fontSize: '22px', color: hex(C.stroke),
        }).setOrigin(0.5).setResolution(2)

        const parts: Phaser.GameObjects.GameObject[] = [bg, title, sub]
        let best: StructureId = 'lista'
        let worst: StructureId = 'lista'
        let bestScore = -1
        let worstScore = 2

        ROOM_ORDER.forEach((id, i) => {
            const e = this.report[id]
            const ratio = e.tries > 0 ? e.hits / e.tries : 0
            if (e.tries > 0 && ratio > bestScore) { bestScore = ratio; best = id }
            if (e.tries > 0 && ratio < worstScore) { worstScore = ratio; worst = id }

            const y = top + 148 + i * 62
            const icon = this.add.graphics()
            this.drawRoomIcon(icon, id, -PW / 2 + 60, y, 22, C.stroke)

            const name = this.add.text(-PW / 2 + 96, y, `${ROOMS[id].kidName}`, {
                fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '19px', color: hex(C.ink),
            }).setOrigin(0, 0.5).setResolution(2)

            const tech = this.add.text(-PW / 2 + 96, y + 20, ROOMS[id].techName, {
                fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '13px', color: hex(C.stroke),
            }).setOrigin(0, 0.5).setResolution(2)

            const trackX = 100
            const trackW = 260
            const bar = this.add.graphics()
            bar.fillStyle(C.greySoft, 1)
            bar.fillRoundedRect(trackX, y - 15, trackW, 30, 15)
            const w = Math.max(30, trackW * ratio)
            bar.fillStyle(e.tries > 0 ? C.good : C.grey, 1)
            bar.fillRoundedRect(trackX, y - 15, w, 30, 15)
            bar.fillStyle(C.white, A.gloss)
            bar.fillRoundedRect(trackX + 6, y - 11, Math.max(10, w - 12), 8, 4)

            const label = this.add.text(trackX + trackW + 22, y, e.tries > 0 ? `${e.hits} de ${e.tries}` : 'não visitou', {
                fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '18px', color: hex(C.inkSoft),
            }).setOrigin(0, 0.5).setResolution(2)

            parts.push(icon, name, tech, bar, label)
        })

        const verdict = bestScore < 0
            ? 'Você passeou pelo museu. Volte para conhecer todas as salas.'
            : `Você foi muito bem em ${ROOMS[best].kidName}. Vale treinar mais em ${ROOMS[worst].kidName}.`

        const note = this.add.text(0, top + PH - 108, verdict, {
            fontFamily: 'DynaPuff, Arial, sans-serif', fontStyle: 'bold', fontSize: '20px', color: hex(C.ink),
            align: 'center', wordWrap: { width: PW - 90 },
        }).setOrigin(0.5).setResolution(2)

        const btn = this.button(0, top + PH - 48, 320, 68, 'Fechar o museu', C.lilac, () => {
            this.closeModalSafely(overlay, modal, () => {
                showLevelComplete(this, {
                    title: 'Museu fechado!',
                    subtitle: `${this.points} pontos`,
                    message: 'Cada informação tem um jeito certo de ser guardada.',
                    accent: C.good,
                    overlayColor: C.stroke,
                    titleColor: hex(C.ink),
                    subtitleColor: hex(C.good),
                    progress: { total: LEVELS.length, current: LEVELS.length },
                })
            })
        }, '22px', true)

        parts.push(note, btn)
        modal.add(parts)
        modal.setScale(0.92).setAlpha(0)
        this.tweens.add({ targets: modal, alpha: 1, scale: 1, duration: 280, ease: 'Back.easeOut' })
    }

    private showFeedback(correct: boolean, message: string, earned: number, onDone: () => void) {
        EventBus.emit('timer-stop')

        const overlay = this.add.rectangle(W / 2, H / 2, W, H, C.stroke, A.overlay).setDepth(400).setInteractive()
        const modal = this.add.container(W / 2, H / 2).setDepth(401)

        const body = this.add.text(0, 0, message, {
            fontFamily: 'DynaPuff, Arial, sans-serif', fontStyle: 'bold', fontSize: '25px', color: hex(C.ink),
            align: 'center', wordWrap: { width: 600 },
        }).setOrigin(0.5).setResolution(2)

        const PH = body.height + 316
        const top = -PH / 2
        const tone = correct ? C.good : C.warn

        const bg = this.add.graphics()
        bg.fillStyle(C.shadow, 0.22)
        bg.fillRoundedRect(-360 + 4, top + 12, 720, PH, 30)
        bg.fillStyle(C.panel, 1)
        bg.fillRoundedRect(-360, top, 720, PH, 30)
        bg.lineStyle(4, tone, 1)
        bg.strokeRoundedRect(-360, top, 720, PH, 30)
        bg.fillStyle(tone, 1)
        bg.fillRoundedRect(-160, top - 13, 320, 24, 12)

        const markBg = this.add.graphics()
        markBg.fillStyle(tone, 1)
        markBg.fillCircle(0, top + 62, 36)
        markBg.fillStyle(C.white, A.gloss)
        markBg.fillEllipse(0, top + 50, 40, 16)

        const mark = this.add.graphics()
        mark.lineStyle(8, C.white, 1)
        if (correct) {
            mark.lineBetween(-14, top + 62, -4, top + 74)
            mark.lineBetween(-4, top + 74, 16, top + 48)
        } else {
            mark.lineBetween(0, top + 44, 0, top + 68)
            mark.fillStyle(C.white, 1)
            mark.fillCircle(0, top + 80, 5)
        }

        const title = this.add.text(0, top + 128, correct ? 'Muito bem!' : 'Quase!', {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '36px', color: hex(C.ink),
        }).setOrigin(0.5).setResolution(2)

        body.setY(top + 172 + body.height / 2)

        const pointsText = this.add.text(0, top + 182 + body.height + 16, '', {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '22px', color: hex(C.stroke),
        }).setOrigin(0.5).setResolution(2)

        let counterTween: Phaser.Tweens.Tween | undefined
        if (earned > 0) {
            const counter = { v: 0 }
            counterTween = this.tweens.add({
                targets: counter, v: earned, duration: 600, delay: 300,
                onUpdate: () => {
                    if (!pointsText.active) return
                    pointsText.setText(`+${Math.round(counter.v)} pontos`)
                },
            })
        }

        const btn = this.button(0, PH / 2 - 58, 320, 72, 'Continuar', C.lilac, () => {
            counterTween?.remove()
            pointsText.setText(earned > 0 ? `+${earned} pontos` : '')
            this.closeModalSafely(overlay, modal, onDone)
        }, '23px', true)

        modal.add([bg, markBg, mark, title, body, pointsText, btn])
        modal.setScale(0.9).setAlpha(0)
        this.tweens.add({ targets: modal, alpha: 1, scale: 1, duration: 260, ease: 'Back.easeOut' })
    }

    private showLevelIntro(onStart: () => void) {
        this.locked = true

        const overlay = this.add.rectangle(W / 2, H / 2, W, H, C.stroke, A.overlay).setDepth(500).setInteractive()
        const panel = this.add.container(W / 2, H / 2).setDepth(501)

        const objective = this.add.text(0, 0, this.level.objective, {
            fontFamily: 'DynaPuff, Arial, sans-serif', fontStyle: 'bold', fontSize: '25px', color: hex(C.ink),
            align: 'center', wordWrap: { width: 580 },
        }).setOrigin(0.5).setResolution(2)

        const PH = objective.height + 314
        const top = -PH / 2

        const bg = this.add.graphics()
        bg.fillStyle(C.shadow, 0.22)
        bg.fillRoundedRect(-346, top + 12, 692, PH, 30)
        bg.fillStyle(C.panel, 1)
        bg.fillRoundedRect(-350, top, 700, PH, 30)
        bg.lineStyle(4, C.lilac, 1)
        bg.strokeRoundedRect(-350, top, 700, PH, 30)
        bg.fillStyle(C.butter, 1)
        bg.fillRoundedRect(-160, top - 13, 320, 24, 12)

        const badge = this.add.text(0, top + 56, `NÍVEL ${this.level.level}`, {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '23px', color: hex(C.stroke),
        }).setOrigin(0.5).setResolution(2)

        const title = this.add.text(0, top + 110, this.level.title, {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '38px', color: hex(C.ink),
            align: 'center', wordWrap: { width: 600 },
        }).setOrigin(0.5).setResolution(2)

        objective.setY(top + 166 + objective.height / 2)

        const btn = this.button(0, PH / 2 - 58, 320, 72, 'Entrar no museu', C.lilac, () => {
            this.closeModalSafely(overlay, panel, onStart)
        }, '23px', true)

        panel.add([bg, badge, title, objective, btn])
        panel.setScale(0.9).setAlpha(0)
        this.tweens.add({ targets: panel, alpha: 1, scale: 1, duration: 280, ease: 'Back.easeOut' })
    }

    private runTutorial() {
        if (this.phaseIdx !== 0) {
            this.helpBtn?.setVisible(true)
            this.startPhase()
            return
        }
        this.playTutorial(true, () => this.startPhase())
    }

    private replayTutorial() {
        const wasLocked = this.locked
        this.locked = true
        this.playTutorial(false, () => { this.locked = wasLocked })
    }

    private playTutorial(once: boolean, onDone: () => void) {
        createTutorial(this, {
            key: `museu-l${this.level.level}`,
            once,
            accent: C.lilac,
            safeTop: 100,
            steps: this.tutorialSteps(),
            onFinish: () => {
                this.helpBtn?.setVisible(true)
                onDone()
            },
        })
    }

    private roomTutorialSteps(id: StructureId): TutorialStep[] {
        const stage = { shape: 'rect' as const, x: 796, y: 300, w: 900, h: 400, balloonY: 500 }

        if (id === 'lista') {
            return [
                { text: 'Veja essas peças! Elas estão fora de ordem...', ...stage },
                { text: 'Toque numa peça para colocar na fila. Tocou nela de novo, ela volta.', ...stage },
            ]
        }
        if (id === 'matriz') {
            return [
                { text: 'Olhe a coluna de cima e a linha da esquerda.', ...stage },
                { text: 'Ande pela linha até chegar na coluna. Toque no quadradinho.', ...stage },
            ]
        }
        if (id === 'registro') {
            return [
                { text: 'Isto é uma ficha. Cada linha tem um nome e um valor.', ...stage },
                { text: 'Toque na linha que responde a pergunta.', ...stage },
            ]
        }
        if (id === 'grafo') {
            return [
                { text: 'Leia as frases lá em cima. Elas dizem quem liga com quem.', shape: 'rect', x: 796, y: 148, w: 820, h: 100, balloonY: 480 },
                { text: 'Toque em uma bolinha, depois na outra. O fio aparece.', ...stage },
            ]
        }
        return [
            { text: 'Estas peças estão soltas. Cada uma é de um tipo.', shape: 'rect', x: 796, y: 200, w: 520, h: 200, balloonY: 620 },
            { text: 'Toque numa peça, depois toque na caixa certa.', shape: 'rect', x: 796, y: 460, w: 880, h: 200, balloonY: 200 },
        ]
    }

    private runRoomTutorial(id: StructureId, onDone: () => void) {
        if (this.roomTutorialDone.has(id)) {
            onDone()
            return
        }
        this.roomTutorialDone.add(id)
        this.taskLocked = true
        createTutorial(this, {
            key: `museu-sala-${id}`,
            once: false,
            accent: C.lilac,
            safeTop: 100,
            steps: this.roomTutorialSteps(id),
            onFinish: () => {
                this.taskLocked = false
                onDone()
            },
        })
    }

    private tutorialSteps(): TutorialStep[] {
        const doorsRect = { x: W / 2, y: HUB.doorY + 40, w: 1160, h: 460 }
        const tinoRect = {
            x: HUB.balloonX + HUB.balloonW / 2,
            y: HUB.balloonY + HUB.balloonH / 2,
            w: HUB.balloonW + 20,
            h: HUB.balloonH + 20,
        }

        if (this.level.level === 1) {
            return [
                { text: 'Oi! Eu sou o Tino. Eu falo aqui embaixo o que fazer.', shape: 'rect', ...tinoRect },
                { text: 'Toque na porta para entrar na sala.', shape: 'rect', ...doorsRect, balloonY: 593 },
            ]
        }

        if (this.level.level === 2) {
            return [
                { text: 'Agora são duas portas. As duas servem, mas uma é melhor.', shape: 'rect', ...doorsRect, balloonY: 620 },
                { text: 'Escolha uma. Depois eu mostro como ficaria na outra.', shape: 'rect', ...tinoRect },
            ]
        }

        return [
            { text: 'Todas as portas abertas. Você escolhe sozinho.', shape: 'rect', ...doorsRect, balloonY: 620 },
            { text: 'Eu digo aqui o que precisa ser guardado agora.', shape: 'rect', ...tinoRect },
        ]
    }

    private drawRoomIcon(g: Phaser.GameObjects.Graphics, id: StructureId, cx: number, cy: number, s: number, color: number) {
        g.fillStyle(color, 1)
        g.lineStyle(3, color, 1)

        if (id === 'lista') {
            for (let i = -1; i <= 1; i++) g.fillCircle(cx + i * s * 0.55, cy, s * 0.19)
            return
        }

        if (id === 'matriz') {
            const c = s * 0.28
            for (let r = -1; r <= 1; r++) {
                for (let k = -1; k <= 1; k++) {
                    g.fillRoundedRect(cx + k * (c + 3) - c / 2, cy + r * (c + 3) - c / 2, c, c, 3)
                }
            }
            return
        }

        if (id === 'registro') {
            g.strokeRoundedRect(cx - s * 0.6, cy - s * 0.48, s * 1.2, s * 0.96, 6)
            for (let i = 0; i < 3; i++) {
                g.fillRect(cx - s * 0.42, cy - s * 0.26 + i * s * 0.27, s * 0.84, s * 0.1)
            }
            return
        }

        if (id === 'grafo') {
            const pts = [
                { x: cx - s * 0.52, y: cy + s * 0.34 },
                { x: cx, y: cy - s * 0.46 },
                { x: cx + s * 0.52, y: cy + s * 0.34 },
            ]
            g.lineBetween(pts[0].x, pts[0].y, pts[1].x, pts[1].y)
            g.lineBetween(pts[1].x, pts[1].y, pts[2].x, pts[2].y)
            g.lineBetween(pts[0].x, pts[0].y, pts[2].x, pts[2].y)
            pts.forEach(p => g.fillCircle(p.x, p.y, s * 0.17))
            return
        }

        this.drawShape(g, 'circulo', cx - s * 0.42, cy - s * 0.2, s * 0.2, color)
        this.drawShape(g, 'quadrado', cx + s * 0.36, cy - s * 0.34, s * 0.18, color)
        this.drawShape(g, 'triangulo', cx + s * 0.04, cy + s * 0.34, s * 0.22, color)
    }

    private drawShape(g: Phaser.GameObjects.Graphics, kind: ShapeKind, cx: number, cy: number, r: number, color: number) {
        g.fillStyle(color, 1)

        if (kind === 'circulo') {
            g.fillCircle(cx, cy, r)
            return
        }
        if (kind === 'quadrado') {
            g.fillRoundedRect(cx - r, cy - r, r * 2, r * 2, Math.max(3, r * 0.2))
            return
        }
        if (kind === 'triangulo') {
            g.fillTriangle(cx, cy - r, cx + r, cy + r * 0.82, cx - r, cy + r * 0.82)
            return
        }
        if (kind === 'losango') {
            g.fillPoints([
                new Phaser.Geom.Point(cx, cy - r),
                new Phaser.Geom.Point(cx + r * 0.8, cy),
                new Phaser.Geom.Point(cx, cy + r),
                new Phaser.Geom.Point(cx - r * 0.8, cy),
            ], true)
            return
        }

        const pts: Phaser.Geom.Point[] = []
        for (let i = 0; i < 10; i++) {
            const ang = -Math.PI / 2 + (i * Math.PI) / 5
            const rad = i % 2 === 0 ? r : r * 0.46
            pts.push(new Phaser.Geom.Point(cx + Math.cos(ang) * rad, cy + Math.sin(ang) * rad))
        }
        g.fillPoints(pts, true)
    }

    private emitCheckpoint() {
        let done = 0
        for (let i = 0; i < this.levelIdx; i++) done += LEVELS[i].phases.length
        done += this.phaseIdx
        const total = LEVELS.reduce((acc, l) => acc + l.phases.length, 0)
        runtimeGameBridge.emit({
            type: 'CHECKPOINT',
            gameId: GAME_ID,
            stage: this.level.level,
            progress: Math.round((done / total) * 100),
            score: this.points,
        })
    }

    private isInputBlocked() {
        return this.time.now < this.inputBlockedUntil
    }

    private blockInput(ms = 320) {
        this.inputBlockedUntil = Math.max(this.inputBlockedUntil, this.time.now + ms)

        if (!this.inputBlocker?.active) {
            this.inputBlocker = this.add.rectangle(W / 2, H / 2, W, H, C.shadow, 0.001)
                .setDepth(9999)
                .setInteractive()
            this.inputBlocker.on('pointerdown', (_p: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => event.stopPropagation())
            this.inputBlocker.on('pointerup', (_p: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => event.stopPropagation())
        }

        this.unblockTimer?.remove()
        this.unblockTimer = this.time.delayedCall(ms + 40, () => {
            this.unblockTimer = undefined
            this.inputBlockedUntil = 0
            this.inputBlocker?.destroy()
            this.inputBlocker = undefined
        })
    }

    private closeModalSafely(
        overlay: Phaser.GameObjects.Rectangle,
        modal: Phaser.GameObjects.Container,
        onClosed?: () => void,
    ) {
        this.blockInput()
        overlay.disableInteractive()
        modal.each((child: Phaser.GameObjects.GameObject) => {
            if ('disableInteractive' in child) (child as Phaser.GameObjects.Container).disableInteractive()
        })

        this.tweens.add({ targets: modal, alpha: 0, scale: 0.94, duration: 180, ease: 'Sine.easeIn' })
        this.tweens.add({ targets: overlay, alpha: 0, duration: 180 })
        this.time.delayedCall(190, () => {
            overlay.destroy()
            modal.destroy()
            onClosed?.()
        })
    }

    private button(
        x: number,
        y: number,
        w: number,
        h: number,
        label: string,
        color: number,
        onClick: () => void,
        fontSize = '20px',
        ignoreLock = false,
    ) {
        const btn = this.add.container(x, y)
        const g = this.add.graphics()

        const paint = (c: number) => {
            g.clear()
            g.fillStyle(C.shadow, 0.22)
            g.fillRoundedRect(-w / 2, -h / 2 + 6, w, h, h / 2)
            g.fillStyle(c, 1)
            g.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
            g.fillStyle(C.white, A.gloss)
            g.fillRoundedRect(-w / 2 + 8, -h / 2 + 7, w - 16, h * 0.32, h / 4)
        }
        paint(color)

        const t = this.add.text(0, 0, label, {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize, color: hex(C.ink),
            align: 'center', wordWrap: { width: w - 26 },
        }).setOrigin(0.5).setResolution(2)

        btn.add([g, t])
        btn.setSize(w, h)
        btn.setInteractive({ useHandCursor: true })
        btn.on('pointerover', () => this.tweens.add({ targets: btn, scale: 1.03, duration: 120 }))
        btn.on('pointerout', () => this.tweens.add({ targets: btn, scale: 1, duration: 120 }))
        btn.on('pointerdown', (_p: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
            event.stopPropagation()
            if (this.isInputBlocked() || (!ignoreLock && this.locked)) return
            this.tweens.add({ targets: btn, scale: 0.95, duration: 70, yoyo: true })
            onClick()
        })

        return btn
    }
}