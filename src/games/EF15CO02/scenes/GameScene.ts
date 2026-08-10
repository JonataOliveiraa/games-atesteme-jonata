import Phaser from 'phaser'
import { runtimeGameBridge } from '../../../shared/bridge/runtimeGameBridge'
import { EventBus } from '../../../shared/EventBus'
import { createTutorial, type TutorialStep } from '../../../shared/tutorial/createTutorial'
import { showLevelComplete } from '../../../shared/level/showLevelComplete'
import { LEVELS } from '../data/levels'
import { MISSION_BY_ID } from '../data/missions'
import { TRACKS, TRACK_ORDER } from '../data/tracks'
import { CHARACTERS } from '../data/characters'
import { C, A, hex } from '../data/theme'
import { W, H, TOPBAR, HUB, MISSION } from '../data/layout'
import type {
    ActionOption,
    AlgorithmBlock,
    CollaboratorSolution,
    CompareQuestion,
    LevelConfig,
    LevelNumber,
    MissionConfig,
    PhaseConfig,
    TrackId,
    VersionRecord,
} from '../types'

const GAME_ID = 'academia-dos-algoritmos'

const BLOCK_H = 56
const CHILD_H = 26
const SLOT_GAP = 10
const PAL_W = 288
const WS_W = 342

interface Trace {
    ok: boolean
    failAt: number
    shown: number
}

interface RunStats {
    missions: number
    firstTry: number
    bestBlocks: number
    usedRepeat: boolean
    usedCondition: boolean
    debugged: boolean
}

const emptyStats = (): RunStats => ({
    missions: 0,
    firstTry: 0,
    bestBlocks: 0,
    usedRepeat: false,
    usedCondition: false,
    debugged: false,
})

export class GameScene extends Phaser.Scene {
    private levelIdx = 0
    private phaseIdx = 0
    private points = 0
    private stats: RunStats = emptyStats()
    private seenTracks = new Set<TrackId>()

    private mode: 'hub' | 'missao' = 'hub'
    private locked = true
    private ended = false

    private hubLayer?: Phaser.GameObjects.Container
    private missionLayer?: Phaser.GameObjects.Container

    private blocks: AlgorithmBlock[] = []
    private versions: VersionRecord[] = []
    private successRuns = 0
    private running = false

    private wsLayer?: Phaser.GameObjects.Container
    private simLayer?: Phaser.GameObjects.Container
    private runBtn?: Phaser.GameObjects.Container
    private tinoImg?: Phaser.GameObjects.Image
    private tinoText?: Phaser.GameObjects.Text
    private countText?: Phaser.GameObjects.Text

    private timerEvent?: Phaser.Time.TimerEvent
    private timeLeft = 0
    private timeTotal = 0

    private inputBlocker?: Phaser.GameObjects.Rectangle
    private unblockTimer?: Phaser.Time.TimerEvent
    private inputBlockedUntil = 0
    private typeTimer?: Phaser.Time.TimerEvent

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: {
        level?: number
        phase?: number
        points?: number
        stats?: RunStats
        seenTracks?: TrackId[]
    }) {
        this.levelIdx = (data.level ?? 1) - 1
        this.phaseIdx = data.phase ?? 0
        this.points = data.points ?? 0
        this.stats = data.stats ?? emptyStats()
        this.seenTracks = new Set(data.seenTracks ?? [])

        this.mode = 'hub'
        this.locked = true
        this.ended = false
        this.blocks = []
        this.versions = []
        this.successRuns = 0
        this.running = false

        this.hubLayer = undefined
        this.missionLayer = undefined
        this.wsLayer = undefined
        this.simLayer = undefined
        this.runBtn = undefined
        this.tinoImg = undefined
        this.tinoText = undefined
        this.countText = undefined

        this.timerEvent?.remove()
        this.timerEvent = undefined
        this.typeTimer?.remove()
        this.typeTimer = undefined
        this.unblockTimer?.remove()
        this.unblockTimer = undefined
        this.inputBlocker?.destroy()
        this.inputBlocker = undefined
        this.inputBlockedUntil = 0
    }

    private get level(): LevelConfig {
        return LEVELS[this.levelIdx]
    }

    private get phase(): PhaseConfig {
        return this.level.phases[this.phaseIdx]
    }

    private get mission(): MissionConfig {
        return MISSION_BY_ID[this.phase.missionId]
    }

    create() {
        this.drawBackdrop()
        this.buildHub()
        this.fadeIn()

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()
        this.emitUi()

        EventBus.on('show-tutorial', this.replayTutorial, this)
        this.events.once('shutdown', () => {
            EventBus.off('show-tutorial', this.replayTutorial, this)
            EventBus.emit('algorithm-timer-stop')
        })

        if (this.phaseIdx === 0) this.showLevelIntro(() => this.runTutorial())
        else this.runTutorial()
    }

    private fadeIn() {
        const veil = this.add.rectangle(W / 2, H / 2, W, H, C.bgDeep, 1).setDepth(880)
        this.tweens.add({ targets: veil, alpha: 0, duration: 300, onComplete: () => veil.destroy() })
    }

    private drawBackdrop() {
        const g = this.add.graphics().setDepth(-4)
        g.fillStyle(C.bg, 1)
        g.fillRect(0, 0, W, H)
    }

    private emitUi() {
        const m = this.mission
        const track = TRACKS[m.track]
        EventBus.emit('algorithm-ui-update', {
            level: this.level.level,
            phaseIndex: this.phaseIdx,
            totalPhases: this.level.phases.length,
            title: this.mode === 'hub' ? this.level.title : m.title,
            instruction: this.mode === 'hub' ? 'Escolha a trilha acesa.' : m.instruction,
            track: m.track,
            trackLabel: track.label,
            trackColor: track.color,
            blockCount: this.mode === 'hub' ? undefined : this.countBlocks(this.blocks),
            versions: this.versions.length,
        })
    }

    private emitCheckpoint() {
        let done = 0
        for (let i = 0; i < this.levelIdx; i += 1) done += LEVELS[i].phases.length
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

    private buildHub() {
        this.missionLayer?.destroy()
        this.missionLayer = undefined
        this.mode = 'hub'
        this.hubLayer = this.add.container(0, 0).setDepth(5)

        const bg = this.add.image(W / 2, H / 2, 'bg-academia-hub')
        bg.setScale(Math.max(W / bg.width, H / bg.height))
        const veil = this.add.graphics()
        veil.fillStyle(C.bgDeep, 0.44)
        veil.fillRect(0, 0, W, H)
        this.hubLayer.add([bg, veil])

        const active = this.mission.track
        const unlocked = new Set(this.phase.unlockedTracks)

        HUB.trackCards.forEach((slot, i) => {
            const id = slot.id as TrackId
            const card = this.buildTrackCard(id, slot, id === active, unlocked.has(id))
            this.hubLayer!.add(card)
            card.setAlpha(0).setY(card.y + 30).setScale(0.9)
            this.tweens.add({
                targets: card,
                alpha: 1,
                y: slot.y + slot.h / 2,
                scale: 1,
                duration: 440,
                delay: 90 * i,
                ease: 'Back.easeOut',
            })
        })

        this.buildTino('hub', TRACKS[active].tinoLine)
    }

    private buildTrackCard(
        id: TrackId,
        slot: { x: number; y: number; w: number; h: number },
        active: boolean,
        unlocked: boolean,
    ) {
        const def = TRACKS[id]
        const c = this.add.container(slot.x + slot.w / 2, slot.y + slot.h / 2)
        const w = slot.w
        const h = slot.h

        const g = this.add.graphics()
        g.fillStyle(C.shadow, A.shadow)
        g.fillRoundedRect(-w / 2 + 4, -h / 2 + 10, w, h, 22)
        g.fillStyle(active ? C.panel : C.bgDeep, active ? 1 : 0.82)
        g.fillRoundedRect(-w / 2, -h / 2, w, h, 22)
        g.lineStyle(active ? 6 : 3, active ? def.color : C.muted, active ? 1 : 0.5)
        g.strokeRoundedRect(-w / 2, -h / 2, w, h, 22)
        g.fillStyle(def.color, active ? 1 : 0.35)
        g.fillRoundedRect(-w / 2, -h / 2, w, 46, { tl: 22, tr: 22, bl: 0, br: 0 })

        const label = this.add.text(0, -h / 2 + 23, def.label, {
            fontFamily: 'Arial Black, Arial',
            fontSize: '21px',
            color: hex(C.white),
            stroke: hex(C.shadow),
            strokeThickness: 4,
        }).setOrigin(0.5).setResolution(2)

        const icon = this.add.graphics()
        this.drawTrackIcon(icon, def.icon, 0, 12, 34, active ? def.color : C.muted)

        const tech = this.add.text(0, h / 2 - 26, def.technicalLabel, {
            fontFamily: 'Arial Black, Arial',
            fontSize: '13px',
            color: hex(active ? C.ink : C.muted),
        }).setOrigin(0.5).setResolution(2)

        c.add([g, label, icon, tech])

        if (!active) {
            c.setAlpha(unlocked ? 0.72 : A.disabled)
            return c
        }

        const halo = this.add.graphics()
        halo.lineStyle(6, C.accent, 0.9)
        halo.strokeRoundedRect(-w / 2 - 7, -h / 2 - 7, w + 14, h + 14, 26)
        c.addAt(halo, 0)
        this.tweens.add({ targets: halo, alpha: 0.3, duration: 950, yoyo: true, repeat: -1 })
        this.tweens.add({ targets: c, y: c.y - 8, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })

        const hit = this.add.rectangle(0, 0, w + 16, h + 16, C.white, 0.001)
        hit.setInteractive({ useHandCursor: true })
        hit.on('pointerover', () => this.tweens.add({ targets: c, scale: 1.05, duration: 150 }))
        hit.on('pointerout', () => this.tweens.add({ targets: c, scale: 1, duration: 150 }))
        hit.on('pointerdown', () => this.enterMission())
        c.add(hit)

        return c
    }

    private enterMission() {
        if (this.isInputBlocked() || this.locked || this.ended) return
        this.locked = true
        this.blockInput(400)

        const veil = this.add.rectangle(W / 2, H / 2, W, H, C.bgDeep, 0).setDepth(900)
        this.tweens.add({
            targets: veil,
            alpha: 1,
            duration: 240,
            onComplete: () => {
                this.hubLayer?.destroy()
                this.hubLayer = undefined
                this.buildMission()
                this.tweens.add({
                    targets: veil,
                    alpha: 0,
                    duration: 260,
                    delay: 60,
                    onComplete: () => {
                        veil.destroy()
                        this.startMission()
                    },
                })
            },
        })
    }

    private startMission() {
        this.locked = false
        if (!this.phase.timeLimit) return
        this.timeTotal = this.phase.timeLimit
        this.timeLeft = this.phase.timeLimit
        this.timerEvent = this.time.addEvent({
            delay: 100,
            loop: true,
            callback: () => {
                if (this.running || this.locked) return
                this.timeLeft = Math.max(0, this.timeLeft - 0.1)
                EventBus.emit('algorithm-timer', { remaining: this.timeLeft, total: this.timeTotal })
                if (this.timeLeft > 0) return
                this.timerEvent?.remove()
                this.timerEvent = undefined
                this.onTimeUp()
            },
        })
    }

    private buildMission() {
        this.mode = 'missao'
        this.missionLayer = this.add.container(0, 0).setDepth(5)
        const m = this.mission

        const bg = this.add.image(W / 2, H / 2, 'bg-sala-treino')
        bg.setScale(Math.max(W / bg.width, H / bg.height))
        const veil = this.add.graphics()
        veil.fillStyle(C.bgDeep, 0.5)
        veil.fillRect(0, 0, W, H)
        this.missionLayer.add([bg, veil])

        this.buildProblemPanel()
        this.buildPalette()
        this.buildWorkspace()
        this.buildSimPanel()
        this.buildRunButton()
        this.buildTino('missao', m.tinoLine)

        this.renderWorkspace()
        this.emitUi()
    }

    private panel(x: number, y: number, w: number, h: number, tint: number, title: string) {
        const g = this.add.graphics()
        g.fillStyle(C.shadow, A.shadow)
        g.fillRoundedRect(x + 4, y + 9, w, h, 20)
        g.fillStyle(C.panel, A.panel)
        g.fillRoundedRect(x, y, w, h, 20)
        g.lineStyle(4, tint, 1)
        g.strokeRoundedRect(x, y, w, h, 20)
        g.fillStyle(tint, 1)
        g.fillRoundedRect(x, y, w, 40, { tl: 20, tr: 20, bl: 0, br: 0 })

        const t = this.add.text(x + w / 2, y + 20, title, {
            fontFamily: 'Arial Black, Arial',
            fontSize: '17px',
            color: hex(C.white),
            stroke: hex(C.shadow),
            strokeThickness: 3,
        }).setOrigin(0.5).setResolution(2)

        this.missionLayer!.add([g, t])
        return g
    }

    private buildProblemPanel() {
        const p = MISSION.problemPanel
        const m = this.mission
        this.panel(p.x, p.y, p.w, p.h, TRACKS[m.track].color, 'O PROBLEMA')

        const text = this.add.text(p.x + p.w / 2, p.y + 58, m.problem, {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: '19px',
            color: hex(C.ink),
            align: 'center',
            wordWrap: { width: p.w - 44 },
        }).setOrigin(0.5, 0).setResolution(2)

        const tag = this.add.graphics()
        tag.fillStyle(C.accent, 1)
        tag.fillRoundedRect(p.x + 22, p.y + p.h - 54, p.w - 44, 36, 18)

        const goal = this.add.text(p.x + p.w / 2, p.y + p.h - 36, m.instruction, {
            fontFamily: 'Arial Black, Arial',
            fontSize: '15px',
            color: hex(C.ink),
            align: 'center',
            wordWrap: { width: p.w - 60 },
        }).setOrigin(0.5).setResolution(2)

        this.missionLayer!.add([text, tag, goal])
    }

    private paletteOptions(): ActionOption[] {
        const m = this.mission
        const specials: ActionOption[] = []
        m.expected.forEach((b) => {
            if (b.kind === 'repetir' || b.kind === 'condicao') specials.push({ id: b.id, block: b })
        })
        return [...specials, ...m.availableBlocks]
    }

    private buildPalette() {
        const p = MISSION.blocksPanel
        this.panel(p.x, p.y, p.w, p.h, C.sequence, 'BLOCOS')

        const opts = this.paletteOptions()
        const top = p.y + 54
        const avail = p.h - 66
        const pitch = Math.min(72, avail / Math.max(1, opts.length))
        const cx = p.x + p.w / 2

        opts.forEach((opt, i) => {
            const y = top + pitch * i + pitch / 2
            const chip = this.buildPaletteChip(opt.block, cx, y, Math.min(BLOCK_H, pitch - 8))
            this.missionLayer!.add(chip)
            chip.setAlpha(0).setX(cx - 26)
            this.tweens.add({ targets: chip, alpha: 1, x: cx, duration: 300, delay: 70 * i, ease: 'Back.easeOut' })
        })
    }

    private buildPaletteChip(block: AlgorithmBlock, x: number, y: number, h: number) {
        const c = this.add.container(x, y)
        const w = PAL_W
        const tint = this.blockColor(block)

        const g = this.add.graphics()
        g.fillStyle(C.shadow, 0.2)
        g.fillRoundedRect(-w / 2 + 3, -h / 2 + 6, w, h, 14)
        g.fillStyle(tint, 1)
        g.fillRoundedRect(-w / 2, -h / 2, w, h, 14)

        const label = this.add.text(-w / 2 + 18, 0, this.blockTitle(block), {
            fontFamily: 'Arial Black, Arial',
            fontSize: '17px',
            color: hex(C.white),
            stroke: hex(C.shadow),
            strokeThickness: 3,
            wordWrap: { width: w - 62 },
        }).setOrigin(0, 0.5).setResolution(2)

        const plus = this.add.text(w / 2 - 20, 0, '+', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '26px',
            color: hex(C.white),
        }).setOrigin(0.5).setResolution(2)

        const hit = this.add.rectangle(0, 0, w, h, C.white, 0.001)
        hit.setInteractive({ useHandCursor: true })
        hit.on('pointerover', () => this.tweens.add({ targets: c, scale: 1.04, duration: 110 }))
        hit.on('pointerout', () => this.tweens.add({ targets: c, scale: 1, duration: 110 }))
        hit.on('pointerdown', () => this.addBlock(block, c))

        c.add([g, label, plus, hit])
        return c
    }

    private addBlock(block: AlgorithmBlock, chip: Phaser.GameObjects.Container) {
        if (this.isInputBlocked() || this.locked || this.running) return

        const max = this.maxBlocks()
        if (max > 0 && this.blocks.length >= max) {
            this.tweens.add({ targets: chip, x: chip.x + 10, duration: 60, yoyo: true, repeat: 2 })
            this.say('pensando', `Este desafio cabe em ${max} blocos. Tire um antes.`)
            return
        }

        this.tweens.add({ targets: chip, scale: 0.94, duration: 80, yoyo: true })
        this.blocks.push(this.cloneBlock(block, `u${this.blocks.length}-${Date.now()}`))
        this.renderWorkspace()
        this.emitUi()
    }

    private maxBlocks() {
        const m = this.mission
        if (m.kind === 'livre') return m.target?.maxBlocks ?? 0
        if (m.kind === 'comparar') return 0
        return m.maxBlocks ?? 0
    }

    private cloneBlock(block: AlgorithmBlock, id: string): AlgorithmBlock {
        if (block.kind === 'repetir') {
            return { ...block, id, blocks: block.blocks.map((b, i) => this.cloneBlock(b, `${id}-${i}`)) }
        }
        if (block.kind === 'condicao') {
            return {
                ...block,
                id,
                ifTrue: { ...block.ifTrue, blocks: block.ifTrue.blocks.map((b, i) => this.cloneBlock(b, `${id}-t${i}`)) },
                ifFalse: block.ifFalse
                    ? { ...block.ifFalse, blocks: block.ifFalse.blocks.map((b, i) => this.cloneBlock(b, `${id}-f${i}`)) }
                    : undefined,
            }
        }
        return { ...block, id }
    }

    private buildWorkspace() {
        const p = MISSION.workspace
        this.panel(p.x, p.y, p.w, p.h, C.accent, 'MEU ALGORITMO')

        this.countText = this.add.text(p.x + p.w / 2, p.y + p.h - 22, '', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '15px',
            color: hex(C.muted),
        }).setOrigin(0.5).setResolution(2)

        this.wsLayer = this.add.container(0, 0)
        this.missionLayer!.add([this.countText, this.wsLayer])
    }

    private renderWorkspace() {
        if (!this.wsLayer) return
        this.wsLayer.removeAll(true)

        const p = MISSION.workspace
        const cx = p.x + p.w / 2
        let y = p.y + 56

        this.blocks.forEach((block, index) => {
            const h = this.blockHeight(block)
            const view = this.buildWorkspaceBlock(block, index, cx, y + h / 2, h)
            this.wsLayer!.add(view)
            y += h + SLOT_GAP
        })

        if (y + 58 < p.y + p.h - 44) {
            const ghost = this.add.graphics()
            ghost.lineStyle(4, C.muted, 0.5)
            ghost.strokeRoundedRect(cx - WS_W / 2, y, WS_W, 52, 16)
            const hint = this.add.text(cx, y + 26, this.blocks.length === 0 ? 'Toque num bloco ao lado' : 'proximo passo', {
                fontFamily: 'Arial',
                fontStyle: 'bold',
                fontSize: '15px',
                color: hex(C.muted),
            }).setOrigin(0.5).setResolution(2)
            this.wsLayer.add([ghost, hint])
        }

        const total = this.countBlocks(this.blocks)
        const max = this.maxBlocks()
        this.countText?.setText(max > 0 ? `${this.blocks.length} de ${max} blocos` : `${total} instrucoes`)
        this.paintRunButton()
    }

    private buildWorkspaceBlock(block: AlgorithmBlock, index: number, x: number, y: number, h: number) {
        const c = this.add.container(x, y)
        const w = WS_W
        const tint = this.blockColor(block)

        const g = this.add.graphics()
        g.fillStyle(C.shadow, 0.22)
        g.fillRoundedRect(-w / 2 + 3, -h / 2 + 7, w, h, 16)
        g.fillStyle(C.white, 1)
        g.fillRoundedRect(-w / 2, -h / 2, w, h, 16)
        g.lineStyle(4, tint, 1)
        g.strokeRoundedRect(-w / 2, -h / 2, w, h, 16)
        g.fillStyle(tint, 1)
        g.fillRoundedRect(-w / 2, -h / 2, 12, h, { tl: 16, bl: 16, tr: 0, br: 0 })

        const order = this.add.text(-w / 2 + 34, -h / 2 + 26, `${index + 1}`, {
            fontFamily: 'Arial Black, Arial',
            fontSize: '18px',
            color: hex(tint),
        }).setOrigin(0.5).setResolution(2)

        const label = this.add.text(-w / 2 + 56, -h / 2 + 26, this.blockTitle(block), {
            fontFamily: 'Arial Black, Arial',
            fontSize: '17px',
            color: hex(C.ink),
            wordWrap: { width: w - 110 },
        }).setOrigin(0, 0.5).setResolution(2)

        c.add([g, order, label])

        this.blockChildren(block).forEach((line, i) => {
            const ly = -h / 2 + 52 + i * CHILD_H + CHILD_H / 2
            const chip = this.add.graphics()
            chip.fillStyle(tint, 0.14)
            chip.fillRoundedRect(-w / 2 + 40, ly - 11, w - 62, 22, 11)
            const t = this.add.text(-w / 2 + 52, ly, line, {
                fontFamily: 'Arial',
                fontStyle: 'bold',
                fontSize: '14px',
                color: hex(C.ink),
            }).setOrigin(0, 0.5).setResolution(2)
            c.add([chip, t])
        })

        const del = this.add.text(w / 2 - 22, -h / 2 + 26, 'x', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '20px',
            color: hex(C.error),
        }).setOrigin(0.5).setResolution(2)

        const delHit = this.add.rectangle(w / 2 - 22, -h / 2 + 26, 44, 44, C.white, 0.001)
        delHit.setInteractive({ useHandCursor: true })
        delHit.on('pointerdown', () => this.removeBlock(index))

        c.add([del, delHit])
        c.setData('index', index)

        c.setAlpha(0).setScale(0.94)
        this.tweens.add({ targets: c, alpha: 1, scale: 1, duration: 220, ease: 'Back.easeOut' })
        return c
    }

    private removeBlock(index: number) {
        if (this.isInputBlocked() || this.locked || this.running) return
        this.blocks.splice(index, 1)
        this.renderWorkspace()
        this.emitUi()
    }

    private buildSimPanel() {
        const p = MISSION.simulation
        this.panel(p.x, p.y, p.w, p.h, C.final, 'SIMULACAO')
        this.simLayer = this.add.container(0, 0)
        this.missionLayer!.add(this.simLayer)
        this.renderSim(-1, false)
    }

    private renderSim(revealed: number, failedLast: boolean) {
        if (!this.simLayer) return
        this.simLayer.removeAll(true)

        const p = MISSION.simulation
        const steps = this.mission.simulation
        const top = p.y + 58
        const pitch = Math.min(104, (p.h - 76) / Math.max(1, steps.length))

        steps.forEach((step, i) => {
            const y = top + pitch * i + pitch / 2
            const on = i <= revealed
            const bad = failedLast && i === revealed
            const tone = bad ? C.error : on ? C.success : C.muted

            const g = this.add.graphics()
            g.fillStyle(on ? (bad ? C.error : C.success) : C.muted, on ? 0.12 : 0.08)
            g.fillRoundedRect(p.x + 16, y - pitch / 2 + 6, p.w - 32, pitch - 12, 14)
            g.lineStyle(3, tone, on ? 1 : 0.35)
            g.strokeRoundedRect(p.x + 16, y - pitch / 2 + 6, p.w - 32, pitch - 12, 14)

            const box = this.add.graphics()
            box.fillStyle(C.white, on ? 1 : 0.4)
            box.fillRoundedRect(p.x + 28, y - 26, 52, 52, 12)
            this.simLayer!.add([g, box])

            if (step.texture && this.textures.exists(step.texture)) {
                const img = this.add.image(p.x + 54, y, step.texture)
                img.setScale(Math.min(40 / img.width, 40 / img.height)).setAlpha(on ? 1 : 0.4)
                this.simLayer!.add(img)
            } else {
                const dot = this.add.graphics()
                dot.fillStyle(tone, on ? 1 : 0.4)
                dot.fillCircle(p.x + 54, y, 13)
                this.simLayer!.add(dot)
            }

            const title = this.add.text(p.x + 96, y - 12, step.label, {
                fontFamily: 'Arial Black, Arial',
                fontSize: '16px',
                color: hex(on ? C.ink : C.muted),
                wordWrap: { width: p.w - 130 },
            }).setOrigin(0, 0.5).setResolution(2)

            const line = this.add.text(p.x + 96, y + 12, on ? (bad ? step.failLine : step.successLine) : '...', {
                fontFamily: 'Arial',
                fontStyle: 'bold',
                fontSize: '14px',
                color: hex(bad ? C.error : on ? C.success : C.muted),
                wordWrap: { width: p.w - 130 },
            }).setOrigin(0, 0.5).setResolution(2)

            this.simLayer!.add([title, line])

            if (!on) return
            const flash = this.add.graphics()
            flash.fillStyle(C.white, 0.4)
            flash.fillRoundedRect(p.x + 16, y - pitch / 2 + 6, p.w - 32, pitch - 12, 14)
            this.simLayer!.add(flash)
            this.tweens.add({ targets: flash, alpha: 0, duration: 380, onComplete: () => flash.destroy() })
        })
    }

    private buildRunButton() {
        const r = MISSION.runButton
        this.runBtn = this.add.container(r.x + r.w / 2, r.y + r.h / 2)

        const g = this.add.graphics()
        const label = this.add.text(0, 0, 'EXECUTAR', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '22px',
            color: hex(C.white),
            stroke: hex(C.shadow),
            strokeThickness: 4,
        }).setOrigin(0.5).setResolution(2)

        this.runBtn.add([g, label])
        this.runBtn.setData('g', g)
        this.runBtn.setSize(r.w, r.h)
        this.runBtn.setInteractive({ useHandCursor: true })
        this.runBtn.on('pointerover', () => this.tweens.add({ targets: this.runBtn, scale: 1.05, duration: 120 }))
        this.runBtn.on('pointerout', () => this.tweens.add({ targets: this.runBtn, scale: 1, duration: 120 }))
        this.runBtn.on('pointerdown', () => this.runAlgorithm())

        this.missionLayer!.add(this.runBtn)
        this.paintRunButton()
    }

    private paintRunButton() {
        if (!this.runBtn) return
        const r = MISSION.runButton
        const g = this.runBtn.getData('g') as Phaser.GameObjects.Graphics
        const on = this.blocks.length > 0 && !this.running

        g.clear()
        g.fillStyle(C.shadow, 0.24)
        g.fillRoundedRect(-r.w / 2, -r.h / 2 + 6, r.w, r.h, r.h / 2)
        g.fillStyle(on ? C.success : C.muted, 1)
        g.fillRoundedRect(-r.w / 2, -r.h / 2, r.w, r.h, r.h / 2)
        g.fillStyle(C.white, 0.26)
        g.fillRoundedRect(-r.w / 2 + 8, -r.h / 2 + 6, r.w - 16, r.h * 0.32, r.h / 4)
        this.runBtn.setAlpha(on ? 1 : 0.6)
    }

    private buildTino(mode: 'hub' | 'missao', line: string) {
        const layer = mode === 'hub' ? this.hubLayer! : this.missionLayer!

        if (mode === 'hub') {
            const bx = 470
            const by = 500
            const bw = 640
            const bh = 118

            const g = this.add.graphics()
            g.fillStyle(C.shadow, 0.24)
            g.fillRoundedRect(bx + 4, by + 8, bw, bh, 24)
            g.fillStyle(C.panel, A.panel)
            g.fillRoundedRect(bx, by, bw, bh, 24)
            g.fillTriangle(bx + bw, by + 46, bx + bw, by + 90, bx + bw + 30, by + 68)
            g.lineStyle(4, C.accent, 1)
            g.strokeRoundedRect(bx, by, bw, bh, 24)

            this.tinoText = this.add.text(bx + bw / 2, by + bh / 2, '', {
                fontFamily: 'Arial',
                fontStyle: 'bold',
                fontSize: '21px',
                color: hex(C.ink),
                align: 'center',
                wordWrap: { width: bw - 52 },
            }).setOrigin(0.5).setResolution(2)

            this.tinoImg = this.add.image(1152, H - 12, 'treinador-normal').setOrigin(0.5, 1)
            this.tinoImg.setDisplaySize(228 * (220 / 260), 228)

            layer.add([g, this.tinoText, this.tinoImg])
            this.tweens.add({ targets: this.tinoImg, y: H - 22, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
            this.say('normal', line)
            return
        }

        const p = MISSION.feedback
        const g = this.add.graphics()
        g.fillStyle(C.shadow, A.shadow)
        g.fillRoundedRect(p.x + 4, p.y + 9, p.w, p.h, 20)
        g.fillStyle(C.panel, A.panel)
        g.fillRoundedRect(p.x, p.y, p.w, p.h, 20)
        g.lineStyle(4, C.accent, 1)
        g.strokeRoundedRect(p.x, p.y, p.w, p.h, 20)

        this.tinoImg = this.add.image(p.x + 62, p.y + p.h - 6, 'treinador-normal').setOrigin(0.5, 1)
        this.tinoImg.setDisplaySize(112 * (220 / 260), 112)

        this.tinoText = this.add.text(p.x + 126, p.y + p.h / 2, '', {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: '16px',
            color: hex(C.ink),
            wordWrap: { width: p.w - 148 },
        }).setOrigin(0, 0.5).setResolution(2)

        layer.add([g, this.tinoImg, this.tinoText])
        this.say('normal', line)
    }

    private say(pose: 'normal' | 'feliz' | 'pensando', text: string) {
        if (!this.tinoImg || !this.tinoText || !this.tinoImg.active) return

        const size = this.tinoImg.displayHeight
        this.tinoImg.setTexture(`treinador-${pose}`)
        this.tinoImg.setDisplaySize(size * (220 / 260), size)
        this.tweens.add({ targets: this.tinoImg, scaleX: this.tinoImg.scaleX * 1.06, duration: 140, yoyo: true })

        this.typeTimer?.remove()
        const target = this.tinoText
        target.setText('')
        let i = 0
        this.typeTimer = this.time.addEvent({
            delay: 16,
            repeat: text.length - 1,
            callback: () => {
                if (!target.active) return
                i += 1
                target.setText(text.slice(0, i))
            },
        })
    }

    private signature(block: AlgorithmBlock): string {
        if (block.kind === 'acao') return `a:${block.action}`
        if (block.kind === 'repetir') {
            return `r:${block.times}:${block.blocks.map((b) => this.signature(b)).join(',')}`
        }
        if (block.kind === 'condicao') {
            const t = block.ifTrue.blocks.map((b) => this.signature(b)).join(',')
            const f = (block.ifFalse?.blocks ?? []).map((b) => this.signature(b)).join(',')
            return `c:${block.condition}:${t}|${f}`
        }
        return `k:${block.kind}`
    }

    private buildTrace(): Trace {
        const exp = this.mission.expected.map((b) => this.signature(b))
        const got = this.blocks.map((b) => this.signature(b))
        const n = Math.max(exp.length, got.length)

        let failAt = -1
        for (let i = 0; i < n; i += 1) {
            if (exp[i] !== got[i]) {
                failAt = i
                break
            }
        }

        const total = this.mission.simulation.length
        const shown = failAt === -1 ? total : Math.max(1, Math.min(failAt + 1, total))
        return { ok: failAt === -1, failAt, shown }
    }

    private runAlgorithm() {
        if (this.isInputBlocked() || this.locked || this.running) return
        if (this.blocks.length === 0) {
            this.say('pensando', 'Escolha pelo menos um bloco antes de executar.')
            return
        }

        this.running = true
        this.paintRunButton()
        this.say('pensando', 'Executando o seu algoritmo...')

        const trace = this.buildTrace()
        this.playTrace(trace, 0)
    }

    private playTrace(trace: Trace, index: number) {
        if (index >= trace.shown) {
            this.time.delayedCall(420, () => this.finishRun(trace))
            return
        }

        const isLast = index === trace.shown - 1
        this.renderSim(index, !trace.ok && isLast)
        this.time.delayedCall(760, () => this.playTrace(trace, index + 1))
    }

    private finishRun(trace: Trace) {
        this.running = false
        this.paintRunButton()

        const blockCount = this.countBlocks(this.blocks)
        const concepts = this.conceptsUsed()
        const record: VersionRecord = {
            id: `v${this.versions.length + 1}`,
            label: `Versao ${this.versions.length + 1}`,
            blocks: this.blocks.map((b) => this.cloneBlock(b, b.id)),
            blockCount,
            success: trace.ok,
            failedAtStep: trace.ok ? undefined : trace.failAt,
            concepts,
            feedback: trace.ok ? this.mission.successMessage : this.mission.debugHint,
        }
        this.versions.push(record)
        EventBus.emit('algorithm-version', { versions: this.versions.length, blockCount, success: trace.ok })
        this.emitUi()

        if (!trace.ok) {
            this.stats.debugged = true
            runtimeGameBridge.emit({
                type: 'WRONG_ANSWER',
                gameId: GAME_ID,
                pointsEarned: 0,
                stage: this.level.level,
            })
            this.say('pensando', this.mission.debugHint)
            this.time.delayedCall(500, () => {
                this.showFeedback(false, this.mission.debugHint, 0, () => {
                    this.renderSim(-1, false)
                })
            })
            return
        }

        this.successRuns += 1
        if (concepts.includes('repeticao')) this.stats.usedRepeat = true
        if (concepts.includes('condicao')) this.stats.usedCondition = true

        const firstTry = this.versions.length === 1
        const earned = firstTry ? 25 : 15
        this.points += earned
        if (firstTry) this.stats.firstTry += 1

        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER',
            gameId: GAME_ID,
            pointsEarned: earned,
            stage: this.level.level,
        })

        this.say('feliz', this.mission.successMessage)
        this.time.delayedCall(520, () => {
            this.showFeedback(true, this.mission.successMessage, earned, () => this.afterSuccess())
        })
    }

    private afterSuccess() {
        const m = this.mission

        if (m.kind === 'comparar') {
            this.showCompare(m.collaborator, m.questions, () => this.completePhase())
            return
        }

        if (m.kind === 'livre') {
            const need = m.target?.minSuccessfulVersions ?? 1
            if (this.successRuns < need) {
                this.say('pensando', `Boa! Agora tente outra versao. Faltam ${need - this.successRuns}.`)
                this.renderSim(-1, false)
                return
            }
            if (m.collaborator) {
                this.showCompare(m.collaborator, [], () => this.completePhase())
                return
            }
        }

        this.completePhase()
    }

    private showCompare(
        collab: CollaboratorSolution,
        questions: CompareQuestion[],
        onDone: () => void,
    ) {
        EventBus.emit('algorithm-timer-stop')
        const char = CHARACTERS[collab.character]

        const overlay = this.add.rectangle(W / 2, H / 2, W, H, C.bgDeep, A.veil).setDepth(600).setInteractive()
        const modal = this.add.container(W / 2, H / 2).setDepth(601)

        const PW = 860
        const PH = 500
        const top = -PH / 2

        const bg = this.add.graphics()
        bg.fillStyle(C.shadow, 0.26)
        bg.fillRoundedRect(-PW / 2 + 4, top + 12, PW, PH, 28)
        bg.fillStyle(C.panel, 1)
        bg.fillRoundedRect(-PW / 2, top, PW, PH, 28)
        bg.lineStyle(5, C.accent, 1)
        bg.strokeRoundedRect(-PW / 2, top, PW, PH, 28)

        const title = this.add.text(0, top + 42, 'Duas solucoes que funcionam', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '28px',
            color: hex(C.ink),
        }).setOrigin(0.5).setResolution(2)

        const mine = this.buildSolutionCard('Sua versao', this.blocks, -212, top + 96, C.accent)
        const theirs = this.buildSolutionCard(`${char.name}: ${collab.title}`, collab.blocks, 212, top + 96, C.repeat)

        const note = this.add.text(0, top + PH - 118, `${char.name}: "${collab.explanation}"`, {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: '18px',
            color: hex(C.muted),
            align: 'center',
            wordWrap: { width: PW - 90 },
        }).setOrigin(0.5).setResolution(2)

        modal.add([bg, title, mine, theirs, note])
        modal.setScale(0.92).setAlpha(0)
        this.tweens.add({ targets: modal, alpha: 1, scale: 1, duration: 260, ease: 'Back.easeOut' })

        const close = () => this.closeModal(overlay, modal, () => {
            if (questions.length === 0) {
                onDone()
                return
            }
            this.askQuestion(questions, 0, onDone)
        })

        const btn = this.button(0, top + PH - 48, 300, 64, questions.length ? 'Responder' : 'Continuar', C.success, close, '20px')
        modal.add(btn)
    }

    private buildSolutionCard(title: string, blocks: AlgorithmBlock[], x: number, y: number, tint: number) {
        const c = this.add.container(x, y)
        const w = 400
        const h = 268

        const g = this.add.graphics()
        g.fillStyle(C.panelSoft, 1)
        g.fillRoundedRect(-w / 2, 0, w, h, 18)
        g.lineStyle(4, tint, 1)
        g.strokeRoundedRect(-w / 2, 0, w, h, 18)
        g.fillStyle(tint, 1)
        g.fillRoundedRect(-w / 2, 0, w, 38, { tl: 18, tr: 18, bl: 0, br: 0 })

        const head = this.add.text(0, 19, title, {
            fontFamily: 'Arial Black, Arial',
            fontSize: '16px',
            color: hex(C.white),
            stroke: hex(C.shadow),
            strokeThickness: 3,
            wordWrap: { width: w - 24 },
        }).setOrigin(0.5).setResolution(2)

        c.add([g, head])

        const lines: string[] = []
        blocks.forEach((b) => {
            lines.push(this.blockTitle(b))
            this.blockChildren(b).forEach((child) => lines.push(`   ${child}`))
        })

        lines.slice(0, 8).forEach((line, i) => {
            const t = this.add.text(-w / 2 + 20, 56 + i * 24, line, {
                fontFamily: 'Arial',
                fontStyle: 'bold',
                fontSize: '15px',
                color: hex(C.ink),
                wordWrap: { width: w - 40 },
            }).setOrigin(0, 0.5).setResolution(2)
            c.add(t)
        })

        const count = this.add.text(0, h - 20, `${this.countBlocks(blocks)} instrucoes`, {
            fontFamily: 'Arial Black, Arial',
            fontSize: '15px',
            color: hex(tint),
        }).setOrigin(0.5).setResolution(2)

        c.add(count)
        return c
    }

    private askQuestion(questions: CompareQuestion[], index: number, onDone: () => void) {
        if (index >= questions.length) {
            onDone()
            return
        }

        const q = questions[index]
        const overlay = this.add.rectangle(W / 2, H / 2, W, H, C.bgDeep, A.veil).setDepth(620).setInteractive()
        const modal = this.add.container(W / 2, H / 2).setDepth(621)

        const PW = 720
        const PH = 180 + q.options.length * 82
        const top = -PH / 2

        const bg = this.add.graphics()
        bg.fillStyle(C.shadow, 0.26)
        bg.fillRoundedRect(-PW / 2 + 4, top + 12, PW, PH, 28)
        bg.fillStyle(C.panel, 1)
        bg.fillRoundedRect(-PW / 2, top, PW, PH, 28)
        bg.lineStyle(5, C.condition, 1)
        bg.strokeRoundedRect(-PW / 2, top, PW, PH, 28)

        const title = this.add.text(0, top + 62, q.prompt, {
            fontFamily: 'Arial Black, Arial',
            fontSize: '25px',
            color: hex(C.ink),
            align: 'center',
            wordWrap: { width: PW - 90 },
        }).setOrigin(0.5).setResolution(2)

        modal.add([bg, title])

        q.options.forEach((opt, i) => {
            const y = top + 132 + i * 82
            const btn = this.button(0, y, 560, 66, opt, C.sequence, () => {
                const right = opt === q.answer
                if (right) this.points += 10
                this.closeModal(overlay, modal, () => {
                    this.showFeedback(right, right ? q.feedback : `Quase. ${q.feedback}`, right ? 10 : 0, () => {
                        this.askQuestion(questions, index + 1, onDone)
                    })
                })
            }, '19px', true)
            modal.add(btn)
        })

        modal.setScale(0.92).setAlpha(0)
        this.tweens.add({ targets: modal, alpha: 1, scale: 1, duration: 240, ease: 'Back.easeOut' })
    }

    private onTimeUp() {
        if (this.ended || this.running) return
        this.locked = true
        EventBus.emit('algorithm-timer-stop')
        this.showFeedback(false, 'O tempo acabou. Vamos para o proximo desafio.', 0, () => this.completePhase())
    }

    private completePhase() {
        this.timerEvent?.remove()
        this.timerEvent = undefined
        EventBus.emit('algorithm-timer-stop')

        this.stats.missions += 1
        const best = this.versions.filter((v) => v.success).reduce((acc, v) => Math.min(acc, v.blockCount), 99)
        if (best < 99) this.stats.bestBlocks = this.stats.bestBlocks === 0 ? best : Math.min(this.stats.bestBlocks, best)
        this.seenTracks.add(this.mission.track)

        const isLastPhase = this.phaseIdx + 1 >= this.level.phases.length
        const isLastLevel = this.levelIdx + 1 >= LEVELS.length

        const payload = {
            points: this.points,
            stats: this.stats,
            seenTracks: [...this.seenTracks],
        }

        if (!isLastPhase) {
            this.sweepOut(() => this.scene.restart({
                level: this.level.level,
                phase: this.phaseIdx + 1,
                ...payload,
            }))
            return
        }

        if (!isLastLevel) {
            showLevelComplete(this, {
                subtitle: `Nivel ${this.level.level} completo`,
                message: LEVELS[this.levelIdx + 1].objective,
                accent: C.accent,
                overlayColor: C.bgDeep,
                titleColor: hex(C.panel),
                subtitleColor: hex(C.accent),
                progress: { total: LEVELS.length, current: this.level.level },
                autoAdvance: {
                    delay: 2400,
                    onComplete: () => this.scene.restart({
                        level: (this.level.level + 1) as LevelNumber,
                        phase: 0,
                        ...payload,
                    }),
                },
            })
            return
        }

        this.ended = true
        runtimeGameBridge.emit({ type: 'GAME_COMPLETED', gameId: GAME_ID, stage: this.level.level })
        this.showReport()
    }

    private showReport() {
        const overlay = this.add.rectangle(W / 2, H / 2, W, H, C.bgDeep, 0.72).setDepth(700).setInteractive()
        const modal = this.add.container(W / 2, H / 2).setDepth(701)

        const PW = 800
        const PH = 470
        const top = -PH / 2

        const bg = this.add.graphics()
        bg.fillStyle(C.shadow, 0.28)
        bg.fillRoundedRect(-PW / 2 + 4, top + 12, PW, PH, 30)
        bg.fillStyle(C.panel, 1)
        bg.fillRoundedRect(-PW / 2, top, PW, PH, 30)
        bg.lineStyle(5, C.accent, 1)
        bg.strokeRoundedRect(-PW / 2, top, PW, PH, 30)

        const title = this.add.text(0, top + 50, 'Ficha do Programador', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '34px',
            color: hex(C.ink),
        }).setOrigin(0.5).setResolution(2)

        const sub = this.add.text(0, top + 92, `${this.points} pontos na academia`, {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: '21px',
            color: hex(C.condition),
        }).setOrigin(0.5).setResolution(2)

        const rows: Array<[string, string, boolean]> = [
            ['Missoes concluidas', `${this.stats.missions}`, this.stats.missions > 0],
            ['Acertou de primeira', `${this.stats.firstTry} vez(es)`, this.stats.firstTry > 0],
            ['Usou repeticao', this.stats.usedRepeat ? 'sim' : 'ainda nao', this.stats.usedRepeat],
            ['Usou condicao', this.stats.usedCondition ? 'sim' : 'ainda nao', this.stats.usedCondition],
            ['Corrigiu e testou de novo', this.stats.debugged ? 'sim' : 'nao precisou', true],
            ['Melhor solucao', this.stats.bestBlocks > 0 ? `${this.stats.bestBlocks} instrucoes` : '-', this.stats.bestBlocks > 0],
        ]

        const parts: Phaser.GameObjects.GameObject[] = [bg, title, sub]

        rows.forEach(([label, value, good], i) => {
            const y = top + 142 + i * 44
            const g = this.add.graphics()
            g.fillStyle(good ? C.success : C.muted, 0.12)
            g.fillRoundedRect(-PW / 2 + 60, y - 17, PW - 120, 34, 17)

            const l = this.add.text(-PW / 2 + 84, y, label, {
                fontFamily: 'Arial Black, Arial',
                fontSize: '17px',
                color: hex(C.ink),
            }).setOrigin(0, 0.5).setResolution(2)

            const v = this.add.text(PW / 2 - 84, y, value, {
                fontFamily: 'Arial Black, Arial',
                fontSize: '17px',
                color: hex(good ? C.success : C.muted),
            }).setOrigin(1, 0.5).setResolution(2)

            parts.push(g, l, v)
        })

        const btn = this.button(0, top + PH - 46, 320, 64, 'Fechar academia', C.accent, () => {
            this.closeModal(overlay, modal, () => {
                showLevelComplete(this, {
                    title: 'Treino completo!',
                    subtitle: `${this.points} pontos`,
                    message: 'Um algoritmo bom nasce testando, errando e melhorando.',
                    accent: C.success,
                    overlayColor: C.bgDeep,
                    titleColor: hex(C.panel),
                    subtitleColor: hex(C.success),
                    progress: { total: LEVELS.length, current: LEVELS.length },
                })
            })
        }, '21px', true)

        parts.push(btn)
        modal.add(parts)
        modal.setScale(0.92).setAlpha(0)
        this.tweens.add({ targets: modal, alpha: 1, scale: 1, duration: 280, ease: 'Back.easeOut' })
    }

    private sweepOut(onDone: () => void) {
        const veil = this.add.rectangle(W / 2, H / 2, W, H, C.bgDeep, 0).setDepth(880)
        this.tweens.add({ targets: veil, alpha: 1, duration: 260, ease: 'Sine.easeIn', onComplete: onDone })
    }

    private showFeedback(ok: boolean, message: string, earned: number, onDone: () => void) {
        const overlay = this.add.rectangle(W / 2, H / 2, W, H, C.bgDeep, A.veil).setDepth(500).setInteractive()
        const modal = this.add.container(W / 2, H / 2).setDepth(501)

        const body = this.add.text(0, 0, message, {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: '23px',
            color: hex(C.ink),
            align: 'center',
            wordWrap: { width: 560 },
        }).setOrigin(0.5).setResolution(2)

        const PH = body.height + 290
        const top = -PH / 2
        const tone = ok ? C.success : C.warning

        const bg = this.add.graphics()
        bg.fillStyle(C.shadow, 0.26)
        bg.fillRoundedRect(-336, top + 12, 672, PH, 28)
        bg.fillStyle(C.panel, 1)
        bg.fillRoundedRect(-340, top, 680, PH, 28)
        bg.lineStyle(5, tone, 1)
        bg.strokeRoundedRect(-340, top, 680, PH, 28)

        const markBg = this.add.graphics()
        markBg.fillStyle(tone, 1)
        markBg.fillCircle(0, top + 60, 34)

        const mark = this.add.graphics()
        mark.lineStyle(8, C.white, 1)
        if (ok) {
            mark.lineBetween(-13, top + 60, -4, top + 71)
            mark.lineBetween(-4, top + 71, 15, top + 47)
        } else {
            mark.lineBetween(0, top + 44, 0, top + 66)
            mark.fillStyle(C.white, 1)
            mark.fillCircle(0, top + 77, 5)
        }

        const title = this.add.text(0, top + 122, ok ? 'Funcionou!' : 'Vamos ajustar', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '32px',
            color: hex(C.ink),
        }).setOrigin(0.5).setResolution(2)

        body.setY(top + 162 + body.height / 2)

        const pts = this.add.text(0, top + 172 + body.height + 14, earned > 0 ? `+${earned} pontos` : '', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '20px',
            color: hex(C.condition),
        }).setOrigin(0.5).setResolution(2)

        const btn = this.button(0, PH / 2 - 52, 300, 64, ok ? 'Continuar' : 'Tentar de novo', tone, () => {
            this.closeModal(overlay, modal, onDone)
        }, '20px', true)

        modal.add([bg, markBg, mark, title, body, pts, btn])
        modal.setScale(0.9).setAlpha(0)
        this.tweens.add({ targets: modal, alpha: 1, scale: 1, duration: 250, ease: 'Back.easeOut' })
    }

    private showLevelIntro(onStart: () => void) {
        this.locked = true

        const overlay = this.add.rectangle(W / 2, H / 2, W, H, C.bgDeep, 0.7).setDepth(520).setInteractive()
        const panel = this.add.container(W / 2, H / 2).setDepth(521)

        const objective = this.add.text(0, 0, this.level.objective, {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: '23px',
            color: hex(C.ink),
            align: 'center',
            wordWrap: { width: 560 },
        }).setOrigin(0.5).setResolution(2)

        const PH = objective.height + 300
        const top = -PH / 2

        const bg = this.add.graphics()
        bg.fillStyle(C.shadow, 0.26)
        bg.fillRoundedRect(-336, top + 12, 672, PH, 28)
        bg.fillStyle(C.panel, 1)
        bg.fillRoundedRect(-340, top, 680, PH, 28)
        bg.lineStyle(5, C.accent, 1)
        bg.strokeRoundedRect(-340, top, 680, PH, 28)

        const badge = this.add.text(0, top + 52, `NIVEL ${this.level.level}`, {
            fontFamily: 'Arial Black, Arial',
            fontSize: '21px',
            color: hex(C.condition),
        }).setOrigin(0.5).setResolution(2)

        const title = this.add.text(0, top + 104, this.level.title, {
            fontFamily: 'Arial Black, Arial',
            fontSize: '36px',
            color: hex(C.ink),
            align: 'center',
            wordWrap: { width: 580 },
        }).setOrigin(0.5).setResolution(2)

        objective.setY(top + 158 + objective.height / 2)

        const btn = this.button(0, PH / 2 - 52, 320, 66, 'Comecar treino', C.accent, () => {
            this.closeModal(overlay, panel, onStart)
        }, '21px', true)

        panel.add([bg, badge, title, objective, btn])
        panel.setScale(0.9).setAlpha(0)
        this.tweens.add({ targets: panel, alpha: 1, scale: 1, duration: 270, ease: 'Back.easeOut' })
    }

    private runTutorial() {
        if (this.phaseIdx !== 0) {
            EventBus.emit('tutorial-ready')
            this.locked = false
            return
        }
        this.playTutorial(true, () => { this.locked = false })
    }

    private replayTutorial = () => {
        const was = this.locked
        this.locked = true
        this.playTutorial(false, () => { this.locked = was })
    }

    private playTutorial(once: boolean, onDone: () => void) {
        EventBus.emit('tutorial-start')
        createTutorial(this, {
            key: `algoritmos-l${this.level.level}-${this.mode}`,
            once,
            accent: C.accent,
            safeTop: TOPBAR.h + 16,
            steps: this.tutorialSteps(),
            onFinish: () => {
                EventBus.emit('tutorial-end')
                EventBus.emit('tutorial-ready')
                onDone()
            },
        })
    }

    private tutorialSteps(): TutorialStep[] {
        if (this.mode === 'hub') {
            const cards = { shape: 'rect' as const, x: W / 2, y: 351, w: 1160, h: 250, balloonY: 600 }
            if (this.level.level === 1) {
                return [
                    { text: 'Eu sou o Tino, seu treinador. Vou te ajudar em cada missao.', shape: 'none', balloonY: 300 },
                    { text: 'Toque na trilha acesa para comecar o treino.', ...cards },
                ]
            }
            if (this.level.level === 2) {
                return [
                    { text: 'Agora voce ganha blocos novos: REPITA e SE.', ...cards },
                    { text: 'Toque na trilha acesa para ver o novo desafio.', ...cards },
                ]
            }
            return [
                { text: 'Aqui a solucao e sua. Monte, teste e melhore.', ...cards },
                { text: 'Toque na trilha do desafio final.', ...cards },
            ]
        }

        const pal = MISSION.blocksPanel
        const ws = MISSION.workspace
        const sim = MISSION.simulation
        const run = MISSION.runButton

        return [
            { text: 'Aqui esta o problema para resolver.', shape: 'rect', x: MISSION.problemPanel.x + MISSION.problemPanel.w / 2, y: MISSION.problemPanel.y + MISSION.problemPanel.h / 2, w: MISSION.problemPanel.w + 16, h: MISSION.problemPanel.h + 16, balloonY: 420 },
            { text: 'Estes sao os blocos. Toque num deles para usar.', shape: 'rect', x: pal.x + pal.w / 2, y: pal.y + pal.h / 2, w: pal.w + 16, h: pal.h + 16, balloonY: 200 },
            { text: 'O bloco entra aqui, na ordem. Toque no x para tirar.', shape: 'rect', x: ws.x + ws.w / 2, y: ws.y + ws.h / 2, w: ws.w + 16, h: ws.h + 16, balloonY: 200 },
            { text: 'Aperte EXECUTAR para ver o algoritmo rodar.', shape: 'rect', x: run.x + run.w / 2, y: run.y + run.h / 2, w: run.w + 40, h: run.h + 40, balloonY: 300 },
            { text: 'A simulacao mostra onde funcionou e onde parou.', shape: 'rect', x: sim.x + sim.w / 2, y: sim.y + sim.h / 2, w: sim.w + 16, h: sim.h + 16, balloonY: 600 },
        ]
    }

    private blockColor(block: AlgorithmBlock) {
        if (block.kind === 'repetir') return C.repeat
        if (block.kind === 'condicao') return C.condition
        if (block.kind === 'comentario') return C.final
        return C.sequence
    }

    private blockTitle(block: AlgorithmBlock) {
        if (block.kind === 'repetir') return `Repita ${block.times}x`
        return block.label
    }

    private blockChildren(block: AlgorithmBlock): string[] {
        if (block.kind === 'repetir') return block.blocks.map((b) => this.blockTitle(b))
        if (block.kind === 'condicao') {
            const out = [`SIM: ${block.ifTrue.blocks.map((b) => this.blockTitle(b)).join(', ')}`]
            if (block.ifFalse && block.ifFalse.blocks.length) {
                out.push(`NAO: ${block.ifFalse.blocks.map((b) => this.blockTitle(b)).join(', ')}`)
            }
            return out
        }
        return []
    }

    private blockHeight(block: AlgorithmBlock) {
        return BLOCK_H + this.blockChildren(block).length * CHILD_H
    }

    private countBlocks(blocks: AlgorithmBlock[]): number {
        return blocks.reduce((acc, b) => {
            if (b.kind === 'repetir') return acc + 1 + this.countBlocks(b.blocks)
            if (b.kind === 'condicao') {
                return acc + 1 + this.countBlocks(b.ifTrue.blocks) + this.countBlocks(b.ifFalse?.blocks ?? [])
            }
            return acc + 1
        }, 0)
    }

    private conceptsUsed(): TrackId[] {
        const out: TrackId[] = ['sequencia']
        if (this.blocks.some((b) => b.kind === 'repetir')) out.push('repeticao')
        if (this.blocks.some((b) => b.kind === 'condicao')) out.push('condicao')
        if (this.versions.length > 0) out.push('depuracao')
        return out
    }

    private drawTrackIcon(
        g: Phaser.GameObjects.Graphics,
        icon: 'setas' | 'loop' | 'bifurcacao' | 'ferramenta' | 'trofeu',
        cx: number,
        cy: number,
        s: number,
        color: number,
    ) {
        g.fillStyle(color, 1)
        g.lineStyle(5, color, 1)

        if (icon === 'setas') {
            for (let i = -1; i <= 1; i += 1) {
                const x = cx + i * s * 0.58
                g.fillTriangle(x + s * 0.2, cy, x - s * 0.14, cy - s * 0.28, x - s * 0.14, cy + s * 0.28)
            }
            return
        }

        if (icon === 'loop') {
            g.beginPath()
            g.arc(cx, cy, s * 0.52, Phaser.Math.DegToRad(40), Phaser.Math.DegToRad(330))
            g.strokePath()
            g.fillTriangle(cx + s * 0.52, cy - s * 0.42, cx + s * 0.18, cy - s * 0.5, cx + s * 0.5, cy - s * 0.06)
            return
        }

        if (icon === 'bifurcacao') {
            g.lineBetween(cx, cy + s * 0.48, cx, cy)
            g.lineBetween(cx, cy, cx - s * 0.48, cy - s * 0.44)
            g.lineBetween(cx, cy, cx + s * 0.48, cy - s * 0.44)
            g.fillCircle(cx - s * 0.48, cy - s * 0.44, s * 0.16)
            g.fillCircle(cx + s * 0.48, cy - s * 0.44, s * 0.16)
            return
        }

        if (icon === 'ferramenta') {
            g.fillRoundedRect(cx - s * 0.1, cy - s * 0.12, s * 0.2, s * 0.62, s * 0.08)
            g.fillCircle(cx, cy - s * 0.26, s * 0.28)
            g.fillStyle(C.panel, 1)
            g.fillCircle(cx, cy - s * 0.3, s * 0.12)
            return
        }

        g.fillRoundedRect(cx - s * 0.34, cy - s * 0.46, s * 0.68, s * 0.5, s * 0.1)
        g.fillRect(cx - s * 0.09, cy + s * 0.02, s * 0.18, s * 0.28)
        g.fillRoundedRect(cx - s * 0.32, cy + s * 0.3, s * 0.64, s * 0.16, s * 0.06)
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

    private closeModal(
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

        g.fillStyle(C.shadow, 0.24)
        g.fillRoundedRect(-w / 2, -h / 2 + 6, w, h, h / 2)
        g.fillStyle(color, 1)
        g.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
        g.fillStyle(C.white, 0.26)
        g.fillRoundedRect(-w / 2 + 8, -h / 2 + 7, w - 16, h * 0.32, h / 4)

        const t = this.add.text(0, 0, label, {
            fontFamily: 'Arial Black, Arial',
            fontSize,
            color: hex(C.white),
            stroke: hex(C.shadow),
            strokeThickness: 4,
            align: 'center',
            wordWrap: { width: w - 26 },
        }).setOrigin(0.5).setResolution(2)

        btn.add([g, t])
        btn.setSize(w, h)
        btn.setInteractive({ useHandCursor: true })
        btn.on('pointerover', () => this.tweens.add({ targets: btn, scale: 1.04, duration: 120 }))
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
