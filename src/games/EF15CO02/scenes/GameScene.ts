import Phaser from 'phaser'
import { runtimeGameBridge } from '../../../shared/bridge/runtimeGameBridge'
import { EventBus } from '../../../shared/EventBus'
import { showLevelComplete } from '../../../shared/level/showLevelComplete'
import { createTutorial, type TutorialStep } from '../../../shared/tutorial/createTutorial'
import { LEVELS } from '../data/levels'
import { MISSION_BY_ID } from '../data/missions'
import { TRACKS, TRACK_ORDER } from '../data/tracks'
import { CHARACTERS } from '../data/characters'
import { C, A, F, hex } from '../data/theme'
import { W, H, BRIEF, STRIP, SCRIPT, PALETTE, RUN, STAGE, TINO, HUB, MODAL, REPORT } from '../data/layout'
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

type Mode = 'hub' | 'brief' | 'build' | 'run'
type Pose = 'normal' | 'feliz' | 'pensando'

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

interface SlotView {
    container: Phaser.GameObjects.Container
    highlight: (tone: number | null) => void
    y: number
    h: number
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
    private seenTutorial = false

    private mode: Mode = 'hub'
    private locked = true
    private ended = false
    private running = false

    private blocks: AlgorithmBlock[] = []
    private versions: VersionRecord[] = []
    private successRuns = 0

    private hubLayer?: Phaser.GameObjects.Container
    private briefLayer?: Phaser.GameObjects.Container
    private buildLayer?: Phaser.GameObjects.Container
    private stageLayer?: Phaser.GameObjects.Container
    private scriptLayer?: Phaser.GameObjects.Container
    private paletteLayer?: Phaser.GameObjects.Container

    private slotViews: SlotView[] = []
    private chipViews: Phaser.GameObjects.Container[] = []
    private runBtn?: Phaser.GameObjects.Container
    private runPulse?: Phaser.Tweens.Tween

    private tino?: Phaser.GameObjects.Image
    private tinoBubble?: Phaser.GameObjects.Container
    private tinoText?: Phaser.GameObjects.Text
    private typeTimer?: Phaser.Time.TimerEvent

    private stageCaption?: Phaser.GameObjects.Text
    private stageActor?: Phaser.GameObjects.Image
    private stageProp?: Phaser.GameObjects.Image

    private timerEvent?: Phaser.Time.TimerEvent
    private timeLeft = 0
    private timeTotal = 0

    private inputBlocker?: Phaser.GameObjects.Rectangle
    private unblockTimer?: Phaser.Time.TimerEvent
    private inputBlockedUntil = 0

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; phase?: number; points?: number; stats?: RunStats; seenTutorial?: boolean }) {
        this.levelIdx = (data.level ?? 1) - 1
        this.phaseIdx = data.phase ?? 0
        this.points = data.points ?? 0
        this.stats = data.stats ?? emptyStats()
        this.seenTutorial = data.seenTutorial ?? false

        this.mode = 'hub'
        this.locked = true
        this.ended = false
        this.running = false
        this.blocks = []
        this.versions = []
        this.successRuns = 0

        this.hubLayer = undefined
        this.briefLayer = undefined
        this.buildLayer = undefined
        this.stageLayer = undefined
        this.scriptLayer = undefined
        this.paletteLayer = undefined
        this.slotViews = []
        this.chipViews = []
        this.runBtn = undefined
        this.runPulse = undefined
        this.tino = undefined
        this.tinoBubble = undefined
        this.tinoText = undefined
        this.stageCaption = undefined
        this.stageActor = undefined
        this.stageProp = undefined

        this.typeTimer?.remove()
        this.typeTimer = undefined
        this.timerEvent?.remove()
        this.timerEvent = undefined
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

    private get tint(): number {
        return TRACKS[this.mission.track].color
    }

    create() {
        this.add.rectangle(W / 2, H / 2, W, H, C.bg).setDepth(-6)
        this.showHub()
        this.veilIn()

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()
        this.emitUi()

        EventBus.on('show-tutorial', this.replayTutorial, this)
        this.events.once('shutdown', () => {
            EventBus.off('show-tutorial', this.replayTutorial, this)
            EventBus.emit('algorithm-timer-stop')
        })

        if (this.phaseIdx === 0) this.showLevelIntro(() => this.afterLevelIntro())
        else this.afterLevelIntro()
    }

    private afterLevelIntro() {
        if (this.level.level === 1 && this.phaseIdx === 0 && !this.seenTutorial) {
            this.seenTutorial = true
            this.time.delayedCall(180, () => this.runHubTutorial(() => { this.locked = false }))
            return
        }

        this.locked = false
    }

    private veilIn() {
        const veil = this.add.rectangle(W / 2, H / 2, W, H, C.bgDeep, 1).setDepth(900)
        this.tweens.add({ targets: veil, alpha: 0, duration: 320, onComplete: () => veil.destroy() })
    }

    private swap(onMid: () => void) {
        this.locked = true
        this.blockInput(560)
        const veil = this.add.rectangle(W / 2, H / 2, W, H, C.bgDeep, 0).setDepth(900)
        this.tweens.add({
            targets: veil,
            alpha: 1,
            duration: 220,
            ease: 'Sine.easeIn',
            onComplete: () => {
                onMid()
                this.tweens.add({
                    targets: veil,
                    alpha: 0,
                    duration: 280,
                    delay: 60,
                    ease: 'Sine.easeOut',
                    onComplete: () => {
                        veil.destroy()
                        this.locked = false
                    },
                })
            },
        })
    }

    private emitUi() {
        const m = this.mission
        const track = TRACKS[m.track]
        EventBus.emit('algorithm-ui-update', {
            level: this.level.level,
            phaseIndex: this.phaseIdx,
            totalPhases: this.level.phases.length,
            title: this.mode === 'hub' ? this.level.title : m.title,
            instruction: this.headerInstruction(),
            track: m.track,
            trackLabel: track.label,
            trackColor: track.color,
            blockCount: this.mode === 'build' || this.mode === 'run' ? this.countBlocks(this.blocks) : undefined,
            versions: this.versions.length,
        })
    }


    private headerInstruction() {
        if (this.mode === 'hub') return 'Toque na trilha brilhando.'
        if (this.mode === 'brief') return 'Leia a missao e toque em Vamos.'
        if (this.mode === 'build') return 'Toque nos blocos embaixo e depois em RODAR.'
        return 'Observe a simulacao do seu algoritmo.'
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

    private showHub() {
        this.mode = 'hub'
        this.hubLayer = this.add.container(0, 0).setDepth(5)

        const bg = this.add.image(W / 2, H / 2, 'bg-academia-hub')
        bg.setScale(Math.max(W / bg.width, H / bg.height))
        const veil = this.add.graphics()
        veil.fillStyle(C.bgDeep, 0.5)
        veil.fillRect(0, 0, W, H)
        this.hubLayer.add([bg, veil])

        const title = this.add.text(W / 2, HUB.titleY, this.level.title, {
            fontFamily: 'Arial Black, Arial',
            fontSize: F.title,
            color: hex(C.white),
            stroke: hex(C.shadow),
            strokeThickness: 7,
        }).setOrigin(0.5).setResolution(2)

        const sub = this.add.text(W / 2, HUB.subtitleY, this.mission.title, {
            fontFamily: 'Arial Black, Arial',
            fontSize: F.body,
            color: hex(C.accent),
            stroke: hex(C.shadow),
            strokeThickness: 5,
        }).setOrigin(0.5).setResolution(2)

        this.hubLayer.add([title, sub])

        const active = this.mission.track
        const total = TRACK_ORDER.length * HUB.cardW + (TRACK_ORDER.length - 1) * HUB.gap
        const startX = W / 2 - total / 2 + HUB.cardW / 2

        TRACK_ORDER.forEach((id, i) => {
            const x = startX + i * (HUB.cardW + HUB.gap)
            const card = this.buildTrackCard(id, x, id === active)
            this.hubLayer!.add(card)
            card.setAlpha(0).setY(HUB.cardY + 40)
            this.tweens.add({
                targets: card,
                alpha: 1,
                y: HUB.cardY,
                duration: 460,
                delay: 90 * i,
                ease: 'Back.easeOut',
            })
        })

        this.buildTino(this.hubLayer, HUB.tinoX, HUB.tinoY, TINO.h, HUB.bubbleX, HUB.bubbleY, HUB.bubbleW, HUB.bubbleH, false)
        this.say('normal', TRACKS[active].tinoLine)
    }

    private buildTrackCard(id: TrackId, x: number, active: boolean) {
        const def = TRACKS[id]
        const c = this.add.container(x, HUB.cardY)
        const w = HUB.cardW
        const h = HUB.cardH

        const g = this.add.graphics()
        g.fillStyle(C.shadow, A.shadow)
        g.fillRoundedRect(-w / 2 + 4, -h / 2 + 12, w, h, 26)
        g.fillStyle(active ? C.panel : C.bgSoft, 1)
        g.fillRoundedRect(-w / 2, -h / 2, w, h, 26)
        g.fillStyle(def.color, 1)
        g.fillRoundedRect(-w / 2, -h / 2, w, 54, { tl: 26, tr: 26, bl: 0, br: 0 })
        g.fillStyle(C.white, A.gloss)
        g.fillRoundedRect(-w / 2 + 12, -h / 2 + 10, w - 24, 14, 7)
        g.lineStyle(active ? 6 : 3, active ? def.color : C.muted, active ? 1 : 0.4)
        g.strokeRoundedRect(-w / 2, -h / 2, w, h, 26)

        const label = this.add.text(0, -h / 2 + 27, def.label, {
            fontFamily: 'Arial Black, Arial',
            fontSize: F.body,
            color: hex(C.white),
            stroke: hex(C.shadow),
            strokeThickness: 5,
        }).setOrigin(0.5).setResolution(2)

        const icon = this.add.graphics()
        this.drawTrackIcon(icon, def.icon, 0, 24, 46, active ? def.color : C.muted)

        c.add([g, label, icon])

        if (!active) {
            const lock = this.add.graphics()
            lock.fillStyle(C.bgDeep, 0.42)
            lock.fillRoundedRect(-w / 2, -h / 2, w, h, 26)
            c.add(lock)
            c.setAlpha(A.disabled + 0.24)
            return c
        }

        c.setScale(HUB.activeScale)

        const halo = this.add.graphics()
        halo.lineStyle(7, C.accent, 1)
        halo.strokeRoundedRect(-w / 2 - 9, -h / 2 - 9, w + 18, h + 18, 32)
        c.addAt(halo, 0)
        this.tweens.add({ targets: halo, alpha: 0.25, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
        this.tweens.add({ targets: c, y: HUB.cardY - 12, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })

        const hit = this.add.rectangle(0, 0, w + 20, h + 20, C.white, 0.001)
        hit.setInteractive({ useHandCursor: true })
        hit.on('pointerdown', () => {
            if (this.isInputBlocked() || this.locked || this.ended) return
            this.tweens.add({ targets: c, scale: HUB.activeScale * 0.94, duration: 90, yoyo: true })
            this.time.delayedCall(140, () => this.enterBrief())
        })
        c.add(hit)

        return c
    }

    private enterBrief() {
        this.swap(() => {
            this.hubLayer?.destroy()
            this.hubLayer = undefined
            this.buildBrief()
        })
    }

    private buildBrief() {
        this.mode = 'brief'
        this.briefLayer = this.add.container(0, 0).setDepth(5)
        const m = this.mission

        const bg = this.add.image(W / 2, H / 2, 'bg-sala-treino')
        bg.setScale(Math.max(W / bg.width, H / bg.height))
        const veil = this.add.graphics()
        veil.fillStyle(C.bgDeep, 0.56)
        veil.fillRect(0, 0, W, H)
        this.briefLayer.add([bg, veil])

        const card = this.add.graphics()
        card.fillStyle(C.shadow, A.shadow)
        card.fillRoundedRect(BRIEF.cardX + 5, BRIEF.cardY + 13, BRIEF.cardW, BRIEF.cardH, 34)
        card.fillStyle(C.panel, A.panel)
        card.fillRoundedRect(BRIEF.cardX, BRIEF.cardY, BRIEF.cardW, BRIEF.cardH, 34)
        card.fillStyle(this.tint, 1)
        card.fillRoundedRect(BRIEF.cardX, BRIEF.cardY, BRIEF.cardW, 76, { tl: 34, tr: 34, bl: 0, br: 0 })
        card.fillStyle(C.white, A.gloss)
        card.fillRoundedRect(BRIEF.cardX + 18, BRIEF.cardY + 14, BRIEF.cardW - 36, 18, 9)
        card.lineStyle(5, this.tint, 1)
        card.strokeRoundedRect(BRIEF.cardX, BRIEF.cardY, BRIEF.cardW, BRIEF.cardH, 34)

        const title = this.add.text(BRIEF.cardX + BRIEF.cardW / 2, BRIEF.cardY + 38, m.title, {
            fontFamily: 'Arial Black, Arial',
            fontSize: F.title,
            color: hex(C.white),
            stroke: hex(C.shadow),
            strokeThickness: 6,
        }).setOrigin(0.5).setResolution(2)

        const problem = this.add.text(BRIEF.cardX + BRIEF.cardW / 2, BRIEF.textY, m.problem, {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: F.body,
            color: hex(C.ink),
            align: 'center',
            wordWrap: { width: BRIEF.cardW - 92 },
        }).setOrigin(0.5, 0).setResolution(2)

        this.briefLayer.add([card, title, problem])

        const artKey = m.simulation.find((s) => s.texture && this.textures.exists(s.texture))?.texture
        if (artKey) {
            const glow = this.add.image(BRIEF.artX, BRIEF.artY + 70, 'algoritmos-fx-glow').setAlpha(0.45)
            glow.setDisplaySize(BRIEF.artBox * 1.9, BRIEF.artBox * 1.9)
            const art = this.add.image(BRIEF.artX, BRIEF.artY + 70, artKey)
            art.setScale(Math.min(BRIEF.artBox / art.width, BRIEF.artBox / art.height))
            this.briefLayer.add([glow, art])
            art.setScale(art.scale * 0.7).setAlpha(0)
            this.tweens.add({ targets: art, alpha: 1, scale: art.scale / 0.7, duration: 520, delay: 240, ease: 'Back.easeOut' })
            this.tweens.add({ targets: art, y: BRIEF.artY + 54, duration: 1600, yoyo: true, repeat: -1, delay: 760, ease: 'Sine.easeInOut' })
            this.tweens.add({ targets: glow, alpha: 0.22, duration: 1400, yoyo: true, repeat: -1 })
        }

        this.buildTino(this.briefLayer, BRIEF.tinoX, BRIEF.tinoY, BRIEF.tinoH, BRIEF.bubbleX, BRIEF.bubbleY, BRIEF.bubbleW, BRIEF.bubbleH, false)
        if (this.tino) {
            this.tino.setX(BRIEF.tinoX - 260)
            this.tweens.add({ targets: this.tino, x: BRIEF.tinoX, duration: 560, ease: 'Back.easeOut' })
        }
        this.tinoBubble?.setAlpha(0)
        this.time.delayedCall(420, () => {
            this.tweens.add({ targets: this.tinoBubble, alpha: 1, duration: 240 })
            this.say('normal', m.tinoLine)
        })

        const go = this.bigButton(BRIEF.goX, BRIEF.goY, BRIEF.goW, BRIEF.goH, 'VAMOS', C.success, () => this.enterBuild())
        go.setAlpha(0).setScale(0.8)
        this.briefLayer.add(go)
        this.tweens.add({
            targets: go,
            alpha: 1,
            scale: 1,
            duration: 420,
            delay: 900,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.tweens.add({ targets: go, scale: 1.05, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
            },
        })

        this.emitUi()
    }

    private enterBuild() {
        this.swap(() => {
            this.briefLayer?.destroy()
            this.briefLayer = undefined
            this.buildBuild()
        })
        this.time.delayedCall(700, () => {
            this.startTimer()
            this.runBuildTutorial(() => EventBus.emit('tutorial-ready'), true)
        })
    }

    private buildBuild() {
        this.mode = 'build'
        this.buildLayer = this.add.container(0, 0).setDepth(5)

        const bg = this.add.image(W / 2, H / 2, 'bg-sala-treino')
        bg.setScale(Math.max(W / bg.width, H / bg.height))
        const veil = this.add.graphics()
        veil.fillStyle(C.bgDeep, 0.6)
        veil.fillRect(0, 0, W, H)
        this.buildLayer.add([bg, veil])

        const strip = this.add.graphics()
        strip.fillStyle(C.panel, 0.96)
        strip.fillRoundedRect(STRIP.x, STRIP.y, STRIP.w, STRIP.h, 26)
        strip.fillStyle(this.tint, 1)
        strip.fillRoundedRect(STRIP.x + 12, STRIP.y + 11, 8, STRIP.h - 22, 4)

        const stripText = this.add.text(STRIP.textX, STRIP.y + STRIP.h / 2, this.mission.instruction, {
            fontFamily: 'Arial Black, Arial',
            fontSize: F.small,
            color: hex(C.ink),
            wordWrap: { width: STRIP.w - 78 },
        }).setOrigin(0, 0.5).setResolution(2)

        this.buildLayer.add([strip, stripText])

        this.scriptLayer = this.add.container(SCRIPT.cx, SCRIPT.top)
        this.paletteLayer = this.add.container(0, 0)
        this.buildLayer.add([this.scriptLayer, this.paletteLayer])

        this.buildPalette()
        this.buildRunButton()
        this.buildTino(this.buildLayer, TINO.x, TINO.y, TINO.small, TINO.bubbleX, TINO.bubbleY, TINO.bubbleW, TINO.bubbleH, true)
        if (this.tino) {
            this.tino.setX(TINO.x - 240)
            this.tweens.add({ targets: this.tino, x: TINO.x, duration: 520, ease: 'Back.easeOut' })
        }
        this.renderScript()
        this.emitUi()
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
        const opts = this.paletteOptions()
        const shelf = this.add.graphics()
        shelf.fillStyle(C.bgDeep, 0.72)
        shelf.fillRoundedRect(24, PALETTE.y - PALETTE.h / 2 - 12, 1092, PALETTE.h + 24, 30)
        shelf.lineStyle(3, C.bgSoft, 1)
        shelf.strokeRoundedRect(24, PALETTE.y - PALETTE.h / 2 - 12, 1092, PALETTE.h + 24, 30)
        this.paletteLayer!.add(shelf)

        const n = opts.length
        const totalW = n * PALETTE.chipW + (n - 1) * PALETTE.gap
        const startX = PALETTE.cx - totalW / 2 + PALETTE.chipW / 2

        opts.forEach((opt, i) => {
            const x = startX + i * (PALETTE.chipW + PALETTE.gap)
            const chip = this.buildChip(opt.block, x, PALETTE.y)
            this.paletteLayer!.add(chip)
            this.chipViews.push(chip)

            chip.setAlpha(0).setY(PALETTE.y + 46)
            this.tweens.add({
                targets: chip,
                alpha: 1,
                y: PALETTE.y,
                duration: 400,
                delay: 90 * i,
                ease: 'Back.easeOut',
            })
        })
    }

    private buildChip(block: AlgorithmBlock, x: number, y: number) {
        const c = this.add.container(x, y)
        const w = PALETTE.chipW
        const h = PALETTE.chipH
        const tint = this.blockColor(block)

        const g = this.add.graphics()
        g.fillStyle(C.shadow, 0.3)
        g.fillRoundedRect(-w / 2 + 3, -h / 2 + 8, w, h, 20)
        g.fillStyle(tint, 1)
        g.fillRoundedRect(-w / 2, -h / 2, w, h, 20)
        g.fillStyle(C.white, A.gloss)
        g.fillRoundedRect(-w / 2 + 10, -h / 2 + 8, w - 20, 18, 9)

        const icon = this.add.graphics()
        this.drawBlockIcon(icon, block, -w / 2 + 30, 0, 18)

        const label = this.add.text(-w / 2 + 52, 0, this.blockTitle(block), {
            fontFamily: 'Arial Black, Arial',
            fontSize: F.small,
            color: hex(C.white),
            stroke: hex(C.shadow),
            strokeThickness: 3,
            wordWrap: { width: w - 72 },
        }).setOrigin(0, 0.5).setResolution(2)

        const hit = this.add.rectangle(0, 0, w + 8, h + 8, C.white, 0.001)
        hit.setInteractive({ useHandCursor: true })
        hit.on('pointerover', () => this.tweens.add({ targets: c, scale: 1.06, duration: 120 }))
        hit.on('pointerout', () => this.tweens.add({ targets: c, scale: 1, duration: 120 }))
        hit.on('pointerdown', () => this.addBlock(block, c))

        c.add([g, icon, label, hit])
        c.setData('block', block)
        return c
    }

    private addBlock(block: AlgorithmBlock, chip: Phaser.GameObjects.Container) {
        if (this.isInputBlocked() || this.locked || this.running || this.mode !== 'build') return

        const max = this.maxBlocks()
        if (this.blocks.length >= max) {
            this.tweens.add({ targets: chip, x: chip.x + 10, duration: 60, yoyo: true, repeat: 2 })
            this.say('pensando', `Este desafio cabe em ${max} blocos. Tire um antes.`)
            return
        }

        this.tweens.add({ targets: chip, scaleY: 0.86, scaleX: 1.1, duration: 90, yoyo: true, ease: 'Sine.easeOut' })
        this.blocks.push(this.cloneBlock(block, `u${Date.now()}-${this.blocks.length}`))
        this.flyToScript(block, chip.x, chip.y, () => this.renderScript())
        this.emitUi()
    }

    private flyToScript(block: AlgorithmBlock, fromX: number, fromY: number, onLand: () => void) {
        const ghost = this.add.container(fromX, fromY).setDepth(60)
        const w = PALETTE.chipW
        const h = PALETTE.chipH
        const tint = this.blockColor(block)

        const g = this.add.graphics()
        g.fillStyle(tint, 1)
        g.fillRoundedRect(-w / 2, -h / 2, w, h, 20)
        g.fillStyle(C.white, A.gloss)
        g.fillRoundedRect(-w / 2 + 10, -h / 2 + 8, w - 20, 18, 9)

        const t = this.add.text(0, 0, this.blockTitle(block), {
            fontFamily: 'Arial Black, Arial',
            fontSize: F.tiny,
            color: hex(C.white),
            stroke: hex(C.shadow),
            strokeThickness: 3,
            align: 'center',
            wordWrap: { width: w - 24 },
        }).setOrigin(0.5).setResolution(2)

        ghost.add([g, t])

        const targetY = SCRIPT.top + this.scriptOffsetFor(this.blocks.length - 1)
        const midX = (fromX + SCRIPT.cx) / 2
        const midY = Math.min(fromY, targetY) - 120

        const path = { t: 0 }
        this.tweens.add({
            targets: path,
            t: 1,
            duration: 420,
            ease: 'Sine.easeInOut',
            onUpdate: () => {
                const k = path.t
                const inv = 1 - k
                ghost.x = inv * inv * fromX + 2 * inv * k * midX + k * k * SCRIPT.cx
                ghost.y = inv * inv * fromY + 2 * inv * k * midY + k * k * targetY
                ghost.setScale(1 - k * 0.2)
            },
            onComplete: () => {
                ghost.destroy()
                onLand()
                const last = this.slotViews[this.slotViews.length - 1]
                if (!last) return
                last.container.setScale(1.14, 0.82)
                this.tweens.add({ targets: last.container, scaleX: 1, scaleY: 1, duration: 260, ease: 'Back.easeOut' })
            },
        })
    }

    private scriptOffsetFor(index: number) {
        let y = 0
        for (let i = 0; i < index; i += 1) {
            y += this.blockHeight(this.blocks[i]) + SCRIPT.slotGap
        }
        return y + this.blockHeight(this.blocks[index] ?? this.blocks[0]) / 2
    }

    private renderScript() {
        if (!this.scriptLayer) return
        this.scriptLayer.removeAll(true)
        this.slotViews = []

        const wide = this.mode === 'run'
        const w = wide ? SCRIPT.wRun : SCRIPT.w
        let y = 0

        this.blocks.forEach((block, index) => {
            const h = this.blockHeight(block)
            const view = this.buildSlot(block, index, w, y + h / 2, h)
            this.scriptLayer!.add(view.container)
            this.slotViews.push(view)
            y += h + SCRIPT.slotGap
        })

        const max = this.maxBlocks()
        if (this.blocks.length < max) {
            const gh = this.add.graphics()
            gh.lineStyle(5, C.accent, 0.55)
            gh.strokeRoundedRect(-w / 2, y, w, SCRIPT.slotH, 22)
            const hint = this.add.text(0, y + SCRIPT.slotH / 2, this.blocks.length === 0 ? 'toque num bloco abaixo' : '+', {
                fontFamily: 'Arial Black, Arial',
                fontSize: this.blocks.length === 0 ? F.small : F.strong,
                color: hex(C.accent),
            }).setOrigin(0.5).setResolution(2)
            this.scriptLayer.add([gh, hint])
            this.tweens.add({ targets: [gh, hint], alpha: 0.4, duration: 900, yoyo: true, repeat: -1 })
            y += SCRIPT.slotH
        }

        const avail = (wide ? STAGE.y + STAGE.h : PALETTE.y - PALETTE.h / 2 - 28) - SCRIPT.top
        const s = Math.min(1, avail / Math.max(1, y))
        this.scriptLayer.setScale(s)

        this.paintRunButton()
    }

    private buildSlot(block: AlgorithmBlock, index: number, w: number, cy: number, h: number): SlotView {
        const c = this.add.container(0, cy)
        const tint = this.blockColor(block)

        const g = this.add.graphics()
        const paint = (line: number, width: number, fill: number) => {
            g.clear()
            g.fillStyle(C.shadow, 0.28)
            g.fillRoundedRect(-w / 2 + 3, -h / 2 + 8, w, h, 22)
            g.fillStyle(fill, 1)
            g.fillRoundedRect(-w / 2, -h / 2, w, h, 22)
            g.fillStyle(C.white, 0.5)
            g.fillRoundedRect(-w / 2 + 12, -h / 2 + 9, w - 24, 14, 7)
            g.lineStyle(width, line, 1)
            g.strokeRoundedRect(-w / 2, -h / 2, w, h, 22)
            g.fillStyle(tint, 1)
            g.fillRoundedRect(-w / 2, -h / 2, 14, h, { tl: 22, bl: 22, tr: 0, br: 0 })
        }
        paint(tint, 4, C.panel)

        const badge = this.add.graphics()
        badge.fillStyle(tint, 1)
        badge.fillCircle(SCRIPT.numDX + w / 2 - SCRIPT.w / 2, -h / 2 + 30, 20)

        const num = this.add.text(SCRIPT.numDX + w / 2 - SCRIPT.w / 2, -h / 2 + 30, `${index + 1}`, {
            fontFamily: 'Arial Black, Arial',
            fontSize: F.small,
            color: hex(C.white),
        }).setOrigin(0.5).setResolution(2)

        const label = this.add.text(SCRIPT.labelDX + w / 2 - SCRIPT.w / 2, -h / 2 + 30, this.blockTitle(block), {
            fontFamily: 'Arial Black, Arial',
            fontSize: F.small,
            color: hex(C.ink),
            wordWrap: { width: w - 130 },
        }).setOrigin(0, 0.5).setResolution(2)

        c.add([g, badge, num, label])

        this.blockChildren(block).forEach((line, i) => {
            const ly = -h / 2 + SCRIPT.slotH - 6 + i * SCRIPT.childH + SCRIPT.childH / 2
            const chip = this.add.graphics()
            chip.fillStyle(tint, 0.16)
            chip.fillRoundedRect(-w / 2 + 44, ly - 13, w - 66, 26, 13)
            const t = this.add.text(-w / 2 + 58, ly, line, {
                fontFamily: 'Arial',
                fontStyle: 'bold',
                fontSize: F.tiny,
                color: hex(C.ink),
                wordWrap: { width: w - 96 },
            }).setOrigin(0, 0.5).setResolution(2)
            c.add([chip, t])
        })

        if (this.mode === 'build') {
            const del = this.add.graphics()
            del.fillStyle(C.errorSoft, 1)
            del.fillCircle(w / 2 - 32, -h / 2 + 30, 20)
            const x = this.add.text(w / 2 - 32, -h / 2 + 30, 'x', {
                fontFamily: 'Arial Black, Arial',
                fontSize: F.small,
                color: hex(C.error),
            }).setOrigin(0.5).setResolution(2)
            const hit = this.add.rectangle(w / 2 - 32, -h / 2 + 30, 52, 52, C.white, 0.001)
            hit.setInteractive({ useHandCursor: true })
            hit.on('pointerdown', () => this.removeBlock(index, c))
            c.add([del, x, hit])
        }

        return {
            container: c,
            y: cy,
            h,
            highlight: (tone) => {
                if (tone === null) {
                    paint(tint, 4, C.panel)
                    return
                }
                paint(tone, 7, tone === C.error ? C.errorSoft : C.successSoft)
            },
        }
    }

    private removeBlock(index: number, view: Phaser.GameObjects.Container) {
        if (this.isInputBlocked() || this.locked || this.running) return
        this.tweens.add({
            targets: view,
            alpha: 0,
            scaleX: 0.7,
            scaleY: 0.5,
            duration: 180,
            ease: 'Back.easeIn',
            onComplete: () => {
                this.blocks.splice(index, 1)
                this.renderScript()
                this.emitUi()
            },
        })
    }

    private buildRunButton() {
        this.runBtn = this.add.container(RUN.x, RUN.y)

        const g = this.add.graphics()
        const tri = this.add.graphics()
        const label = this.add.text(0, RUN.labelDY, 'RODAR', {
            fontFamily: 'Arial Black, Arial',
            fontSize: F.small,
            color: hex(C.white),
            stroke: hex(C.shadow),
            strokeThickness: 5,
        }).setOrigin(0.5).setResolution(2)

        this.runBtn.add([g, tri, label])
        this.runBtn.setData('g', g)
        this.runBtn.setData('tri', tri)
        this.runBtn.setSize(RUN.r * 2, RUN.r * 2)
        this.runBtn.setInteractive({ useHandCursor: true })
        this.runBtn.on('pointerdown', () => this.runAlgorithm())

        this.buildLayer!.add(this.runBtn)
        this.paintRunButton()
    }

    private paintRunButton() {
        if (!this.runBtn) return
        const g = this.runBtn.getData('g') as Phaser.GameObjects.Graphics
        const tri = this.runBtn.getData('tri') as Phaser.GameObjects.Graphics
        const on = this.blocks.length > 0 && !this.running

        g.clear()
        g.fillStyle(C.shadow, 0.34)
        g.fillCircle(0, 8, RUN.r)
        g.fillStyle(on ? C.success : C.muted, 1)
        g.fillCircle(0, 0, RUN.r)
        g.fillStyle(C.white, A.gloss)
        g.fillEllipse(0, -20, RUN.r * 1.1, RUN.r * 0.5)

        tri.clear()
        tri.fillStyle(C.white, 1)
        tri.fillTriangle(-14, -20, -14, 20, 22, 0)

        this.runPulse?.remove()
        this.runPulse = undefined
        this.runBtn.setScale(1)
        if (!on) return
        this.runPulse = this.tweens.add({
            targets: this.runBtn,
            scale: 1.08,
            duration: 720,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        })
    }

    private runAlgorithm() {
        if (this.isInputBlocked() || this.locked || this.running) return
        if (this.blocks.length === 0) {
            this.say('pensando', 'Escolha pelo menos um bloco antes de rodar.')
            return
        }

        this.running = true
        this.runPulse?.remove()
        this.runPulse = undefined
        this.paintRunButton()
        this.stopTimer()

        const trace = this.buildTrace()

        this.tweens.add({ targets: this.paletteLayer, alpha: 0, y: 90, duration: 280, ease: 'Sine.easeIn' })
        this.tweens.add({ targets: this.runBtn, alpha: 0, scale: 0.7, duration: 220 })

        this.mode = 'run'
        this.renderScript()
        this.tweens.add({
            targets: this.scriptLayer,
            x: SCRIPT.cxRun,
            duration: 420,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.buildStage()
                this.time.delayedCall(320, () => this.playTrace(trace, 0))
            },
        })
    }

    private buildStage() {
        this.stageLayer = this.add.container(0, 0).setDepth(8)

        const g = this.add.graphics()
        g.fillStyle(C.shadow, 0.3)
        g.fillRoundedRect(STAGE.x + 5, STAGE.y + 12, STAGE.w, STAGE.h, 32)
        g.fillStyle(C.panel, A.panel)
        g.fillRoundedRect(STAGE.x, STAGE.y, STAGE.w, STAGE.h, 32)
        g.lineStyle(5, this.tint, 1)
        g.strokeRoundedRect(STAGE.x, STAGE.y, STAGE.w, STAGE.h, 32)
        g.fillStyle(C.panelSoft, 1)
        g.fillRoundedRect(STAGE.x + 20, STAGE.y + STAGE.h - 132, STAGE.w - 40, 112, 26)

        this.stageLayer.add(g)

        const shadow = this.add.image(STAGE.actorX, STAGE.actorY + 8, 'algoritmos-fx-shadow')
        shadow.setDisplaySize(200, 66).setAlpha(0.5)

        this.stageActor = this.add.image(STAGE.actorX, STAGE.actorY, 'avatar-crianca').setOrigin(0.5, 1)
        this.stageActor.setDisplaySize(STAGE.actorW, STAGE.actorH)

        this.stageCaption = this.add.text(STAGE.cx, STAGE.captionY, '', {
            fontFamily: 'Arial Black, Arial',
            fontSize: F.body,
            color: hex(C.ink),
            align: 'center',
            wordWrap: { width: STAGE.w - 90 },
        }).setOrigin(0.5).setResolution(2)

        this.stageLayer.add([shadow, this.stageActor, this.stageCaption])

        this.stageLayer.setAlpha(0).setScale(0.94)
        this.tweens.add({ targets: this.stageLayer, alpha: 1, scale: 1, duration: 300, ease: 'Back.easeOut' })
        this.tweens.add({
            targets: this.stageActor,
            y: STAGE.actorY - 10,
            duration: 1200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        })
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

    private playTrace(trace: Trace, index: number) {
        if (index >= trace.shown) {
            this.time.delayedCall(520, () => this.finishRun(trace))
            return
        }

        const step = this.mission.simulation[index]
        const isLast = index === trace.shown - 1
        const bad = !trace.ok && isLast
        const slotIdx = Math.min(index, this.slotViews.length - 1)

        this.slotViews.forEach((s, i) => s.highlight(i === slotIdx ? (bad ? C.error : C.success) : null))
        const slot = this.slotViews[slotIdx]
        if (slot) {
            this.tweens.add({ targets: slot.container, scale: 1.06, duration: 180, yoyo: true, ease: 'Sine.easeOut' })
        }

        this.stageProp?.destroy()
        this.stageProp = undefined

        if (step.texture && this.textures.exists(step.texture)) {
            this.stageProp = this.add.image(STAGE.propX, STAGE.propY, step.texture)
            const s = Math.min(STAGE.propBox / this.stageProp.width, STAGE.propBox / this.stageProp.height)
            this.stageProp.setScale(s * 0.5).setAlpha(0)
            this.stageLayer!.add(this.stageProp)
            this.tweens.add({ targets: this.stageProp, alpha: 1, scale: s, duration: 340, ease: 'Back.easeOut' })
        }

        this.typeCaption(bad ? step.failLine : step.successLine)

        if (bad) {
            this.tweens.add({ targets: this.stageLayer, x: 12, duration: 60, yoyo: true, repeat: 4 })
            this.stampMark(false)
        } else {
            this.tweens.add({ targets: this.stageActor, scaleY: this.stageActor!.scaleY * 0.92, duration: 130, yoyo: true })
            this.stampMark(true)
        }

        this.time.delayedCall(1150, () => this.playTrace(trace, index + 1))
    }

    private stampMark(ok: boolean) {
        const key = ok ? 'algoritmos-check' : 'algoritmos-error'
        if (!this.textures.exists(key) || !this.stageLayer) return
        const mark = this.add.image(STAGE.cx + 240, STAGE.y + 72, key)
        mark.setScale(2.2).setAlpha(0)
        this.stageLayer.add(mark)
        this.tweens.add({ targets: mark, alpha: 1, scale: 1.3, duration: 260, ease: 'Back.easeOut' })
        this.tweens.add({
            targets: mark,
            alpha: 0,
            scale: 1.7,
            duration: 320,
            delay: 620,
            onComplete: () => mark.destroy(),
        })
    }

    private typeCaption(text: string) {
        if (!this.stageCaption) return
        this.typeTimer?.remove()
        const target = this.stageCaption
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

    private finishRun(trace: Trace) {
        const blockCount = this.countBlocks(this.blocks)
        const concepts = this.conceptsUsed()

        this.versions.push({
            id: `v${this.versions.length + 1}`,
            label: `Versao ${this.versions.length + 1}`,
            blocks: this.blocks.map((b) => this.cloneBlock(b, b.id)),
            blockCount,
            success: trace.ok,
            failedAtStep: trace.ok ? undefined : trace.failAt,
            concepts,
            feedback: trace.ok ? this.mission.successMessage : this.mission.debugHint,
        })

        EventBus.emit('algorithm-version', { versions: this.versions.length, blockCount, success: trace.ok })
        this.emitUi()

        if (!trace.ok) {
            this.stats.debugged = true
            runtimeGameBridge.emit({ type: 'WRONG_ANSWER', gameId: GAME_ID, pointsEarned: 0, stage: this.level.level })
            this.say('pensando', this.mission.debugHint)
            this.showFeedback(false, this.mission.debugHint, 0, () => this.backToBuild(trace.failAt))
            return
        }

        this.successRuns += 1
        if (concepts.includes('repeticao')) this.stats.usedRepeat = true
        if (concepts.includes('condicao')) this.stats.usedCondition = true

        const firstTry = this.versions.length === 1
        const earned = firstTry ? 25 : 15
        this.points += earned
        if (firstTry) this.stats.firstTry += 1

        runtimeGameBridge.emit({ type: 'CORRECT_ANSWER', gameId: GAME_ID, pointsEarned: earned, stage: this.level.level })

        this.slotViews.forEach((s, i) => {
            this.time.delayedCall(90 * i, () => {
                s.highlight(C.success)
                this.tweens.add({ targets: s.container, scale: 1.08, duration: 160, yoyo: true })
            })
        })
        this.celebrate()
        this.say('feliz', this.mission.successMessage)

        this.time.delayedCall(900, () => {
            this.showFeedback(true, this.mission.successMessage, earned, () => this.afterSuccess())
        })
    }

    private celebrate() {
        if (this.stageActor) {
            this.tweens.add({ targets: this.stageActor, angle: 6, duration: 130, yoyo: true, repeat: 5 })
        }
        for (let i = 0; i < 22; i += 1) {
            const x = Phaser.Math.Between(STAGE.x + 40, STAGE.x + STAGE.w - 40)
            const tone = [C.accent, C.success, C.sequence, C.repeat][i % 4]
            const bit = this.add.rectangle(x, STAGE.y + 30, 12, 18, tone).setDepth(60)
            this.tweens.add({
                targets: bit,
                y: STAGE.y + STAGE.h - 40,
                angle: Phaser.Math.Between(-220, 220),
                alpha: 0,
                duration: Phaser.Math.Between(700, 1300),
                delay: i * 26,
                ease: 'Sine.easeIn',
                onComplete: () => bit.destroy(),
            })
        }
    }

    private backToBuild(failAt: number) {
        this.mode = 'build'
        this.stageLayer?.destroy()
        this.stageLayer = undefined
        this.running = false

        this.renderScript()
        const bad = this.slotViews[Math.min(failAt, this.slotViews.length - 1)]
        if (bad) {
            bad.highlight(C.error)
            this.tweens.add({ targets: bad.container, x: 10, duration: 60, yoyo: true, repeat: 3 })
        }

        this.tweens.add({ targets: this.scriptLayer, x: SCRIPT.cx, duration: 380, ease: 'Back.easeOut' })
        this.tweens.add({ targets: this.paletteLayer, alpha: 1, y: 0, duration: 300, delay: 120 })
        this.tweens.add({ targets: this.runBtn, alpha: 1, scale: 1, duration: 260, delay: 200, onComplete: () => this.paintRunButton() })
        this.startTimer()
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
                this.say('pensando', 'Boa! Agora tente montar de outro jeito.')
                this.backToBuild(-1)
                return
            }
            if (m.collaborator) {
                this.showCompare(m.collaborator, [], () => this.completePhase())
                return
            }
        }

        this.completePhase()
    }

    private showCompare(collab: CollaboratorSolution, questions: CompareQuestion[], onDone: () => void) {
        this.stopTimer()
        const char = CHARACTERS[collab.character]

        const overlay = this.add.rectangle(W / 2, H / 2, W, H, C.bgDeep, A.veil).setDepth(600).setInteractive()
        const modal = this.add.container(W / 2, H / 2).setDepth(601)

        const PW = 900
        const PH = 520
        const top = -PH / 2

        const bg = this.add.graphics()
        bg.fillStyle(C.shadow, 0.3)
        bg.fillRoundedRect(-PW / 2 + 5, top + 14, PW, PH, MODAL.radius)
        bg.fillStyle(C.panel, 1)
        bg.fillRoundedRect(-PW / 2, top, PW, PH, MODAL.radius)
        bg.lineStyle(6, C.accent, 1)
        bg.strokeRoundedRect(-PW / 2, top, PW, PH, MODAL.radius)

        const title = this.add.text(0, top + 46, 'As duas funcionam!', {
            fontFamily: 'Arial Black, Arial',
            fontSize: F.title,
            color: hex(C.ink),
        }).setOrigin(0.5).setResolution(2)

        const mine = this.solutionCard('Voce', this.blocks, -222, top + 96, C.accent)
        const theirs = this.solutionCard(char.name, collab.blocks, 222, top + 96, C.repeat)

        const note = this.add.text(0, top + PH - 116, `"${collab.explanation}"`, {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: F.small,
            color: hex(C.inkSoft),
            align: 'center',
            wordWrap: { width: PW - 100 },
        }).setOrigin(0.5).setResolution(2)

        modal.add([bg, title, mine, theirs, note])

        const btn = this.bigButton(0, top + PH - 52, MODAL.btnW, 72, questions.length ? 'RESPONDER' : 'CONTINUAR', C.success, () => {
            this.closeModal(overlay, modal, () => {
                if (questions.length === 0) {
                    onDone()
                    return
                }
                this.askQuestion(questions, 0, onDone)
            })
        })
        modal.add(btn)

        modal.setScale(0.9).setAlpha(0)
        this.tweens.add({ targets: modal, alpha: 1, scale: 1, duration: 280, ease: 'Back.easeOut' })
        mine.setAlpha(0).setX(-322)
        theirs.setAlpha(0).setX(322)
        this.tweens.add({ targets: mine, alpha: 1, x: -222, duration: 380, delay: 200, ease: 'Back.easeOut' })
        this.tweens.add({ targets: theirs, alpha: 1, x: 222, duration: 380, delay: 320, ease: 'Back.easeOut' })
    }

    private solutionCard(title: string, blocks: AlgorithmBlock[], x: number, y: number, tint: number) {
        const c = this.add.container(x, y)
        const w = 400
        const h = 280

        const g = this.add.graphics()
        g.fillStyle(C.panelSoft, 1)
        g.fillRoundedRect(-w / 2, 0, w, h, 22)
        g.lineStyle(5, tint, 1)
        g.strokeRoundedRect(-w / 2, 0, w, h, 22)
        g.fillStyle(tint, 1)
        g.fillRoundedRect(-w / 2, 0, w, 46, { tl: 22, tr: 22, bl: 0, br: 0 })

        const head = this.add.text(0, 23, title, {
            fontFamily: 'Arial Black, Arial',
            fontSize: F.small,
            color: hex(C.white),
            stroke: hex(C.shadow),
            strokeThickness: 4,
        }).setOrigin(0.5).setResolution(2)

        c.add([g, head])

        const lines: string[] = []
        blocks.forEach((b) => {
            lines.push(this.blockTitle(b))
            this.blockChildren(b).forEach((child) => lines.push(`   ${child}`))
        })

        lines.slice(0, 7).forEach((line, i) => {
            const t = this.add.text(-w / 2 + 24, 74 + i * 26, line, {
                fontFamily: 'Arial',
                fontStyle: 'bold',
                fontSize: F.tiny,
                color: hex(C.ink),
                wordWrap: { width: w - 48 },
            }).setOrigin(0, 0.5).setResolution(2)
            c.add(t)
        })

        const count = this.add.text(0, h - 24, `${this.countBlocks(blocks)} instrucoes`, {
            fontFamily: 'Arial Black, Arial',
            fontSize: F.small,
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

        const PW = MODAL.w
        const PH = 190 + q.options.length * 96
        const top = -PH / 2

        const bg = this.add.graphics()
        bg.fillStyle(C.shadow, 0.3)
        bg.fillRoundedRect(-PW / 2 + 5, top + 14, PW, PH, MODAL.radius)
        bg.fillStyle(C.panel, 1)
        bg.fillRoundedRect(-PW / 2, top, PW, PH, MODAL.radius)
        bg.lineStyle(6, C.condition, 1)
        bg.strokeRoundedRect(-PW / 2, top, PW, PH, MODAL.radius)

        const title = this.add.text(0, top + 66, q.prompt, {
            fontFamily: 'Arial Black, Arial',
            fontSize: F.strong,
            color: hex(C.ink),
            align: 'center',
            wordWrap: { width: PW - 100 },
        }).setOrigin(0.5).setResolution(2)

        modal.add([bg, title])

        q.options.forEach((opt, i) => {
            const y = top + 148 + i * 96
            const btn = this.bigButton(0, y, PW - 140, 76, opt, C.sequence, () => {
                const right = opt === q.answer
                if (right) this.points += 10
                this.closeModal(overlay, modal, () => {
                    this.showFeedback(right, right ? q.feedback : `Quase. ${q.feedback}`, right ? 10 : 0, () => {
                        this.askQuestion(questions, index + 1, onDone)
                    })
                })
            })
            btn.setAlpha(0)
            modal.add(btn)
            this.tweens.add({ targets: btn, alpha: 1, duration: 240, delay: 160 + i * 90 })
        })

        modal.setScale(0.9).setAlpha(0)
        this.tweens.add({ targets: modal, alpha: 1, scale: 1, duration: 260, ease: 'Back.easeOut' })
    }

    private startTimer() {
        if (!this.phase.timeLimit) return
        this.stopTimer()
        this.timeTotal = this.phase.timeLimit
        if (this.timeLeft <= 0) this.timeLeft = this.phase.timeLimit
        this.timerEvent = this.time.addEvent({
            delay: 100,
            loop: true,
            callback: () => {
                if (this.running || this.locked) return
                this.timeLeft = Math.max(0, this.timeLeft - 0.1)
                EventBus.emit('algorithm-timer', { remaining: this.timeLeft, total: this.timeTotal })
                if (this.timeLeft > 0) return
                this.stopTimer()
                this.onTimeUp()
            },
        })
    }

    private stopTimer() {
        this.timerEvent?.remove()
        this.timerEvent = undefined
    }

    private onTimeUp() {
        if (this.ended || this.running) return
        this.locked = true
        EventBus.emit('algorithm-timer-stop')
        this.showFeedback(false, 'O tempo acabou. Vamos para o proximo treino.', 0, () => this.completePhase())
    }

    private completePhase() {
        this.stopTimer()
        EventBus.emit('algorithm-timer-stop')

        this.stats.missions += 1
        const best = this.versions.filter((v) => v.success).reduce((acc, v) => Math.min(acc, v.blockCount), 99)
        if (best < 99) this.stats.bestBlocks = this.stats.bestBlocks === 0 ? best : Math.min(this.stats.bestBlocks, best)

        const isLastPhase = this.phaseIdx + 1 >= this.level.phases.length
        const isLastLevel = this.levelIdx + 1 >= LEVELS.length
        const payload = { points: this.points, stats: this.stats, seenTutorial: this.seenTutorial }

        if (!isLastPhase) {
            this.sweepOut(() => this.scene.restart({ level: this.level.level, phase: this.phaseIdx + 1, ...payload }))
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

    private sweepOut(onDone: () => void) {
        const veil = this.add.rectangle(W / 2, H / 2, W, H, C.bgDeep, 0).setDepth(900)
        this.tweens.add({ targets: veil, alpha: 1, duration: 260, ease: 'Sine.easeIn', onComplete: onDone })
    }

    private showReport() {
        const overlay = this.add.rectangle(W / 2, H / 2, W, H, C.bgDeep, 0.76).setDepth(700).setInteractive()
        const modal = this.add.container(W / 2, H / 2).setDepth(701)

        const PW = REPORT.w
        const PH = REPORT.h
        const top = -PH / 2

        const bg = this.add.graphics()
        bg.fillStyle(C.shadow, 0.32)
        bg.fillRoundedRect(-PW / 2 + 5, top + 14, PW, PH, MODAL.radius)
        bg.fillStyle(C.panel, 1)
        bg.fillRoundedRect(-PW / 2, top, PW, PH, MODAL.radius)
        bg.lineStyle(6, C.accent, 1)
        bg.strokeRoundedRect(-PW / 2, top, PW, PH, MODAL.radius)

        const title = this.add.text(0, top + 52, 'Ficha do Programador', {
            fontFamily: 'Arial Black, Arial',
            fontSize: F.title,
            color: hex(C.ink),
        }).setOrigin(0.5).setResolution(2)

        const sub = this.add.text(0, top + 96, `${this.points} pontos`, {
            fontFamily: 'Arial Black, Arial',
            fontSize: F.body,
            color: hex(C.condition),
        }).setOrigin(0.5).setResolution(2)

        const rows: Array<[string, string, boolean]> = [
            ['Missoes concluidas', `${this.stats.missions}`, this.stats.missions > 0],
            ['Acertou de primeira', `${this.stats.firstTry}`, this.stats.firstTry > 0],
            ['Usou repeticao', this.stats.usedRepeat ? 'sim' : 'ainda nao', this.stats.usedRepeat],
            ['Usou condicao', this.stats.usedCondition ? 'sim' : 'ainda nao', this.stats.usedCondition],
            ['Corrigiu e testou', this.stats.debugged ? 'sim' : 'nao precisou', true],
            ['Melhor solucao', this.stats.bestBlocks > 0 ? `${this.stats.bestBlocks} passos` : '-', this.stats.bestBlocks > 0],
        ]

        const parts: Phaser.GameObjects.GameObject[] = [bg, title, sub]

        rows.forEach(([label, value, good], i) => {
            const y = top + 150 + i * REPORT.rowH
            const g = this.add.graphics()
            g.fillStyle(good ? C.success : C.muted, 0.14)
            g.fillRoundedRect(-PW / 2 + 60, y - 20, PW - 120, 40, 20)

            const l = this.add.text(-PW / 2 + 88, y, label, {
                fontFamily: 'Arial Black, Arial',
                fontSize: F.small,
                color: hex(C.ink),
            }).setOrigin(0, 0.5).setResolution(2)

            const v = this.add.text(PW / 2 - 88, y, value, {
                fontFamily: 'Arial Black, Arial',
                fontSize: F.small,
                color: hex(good ? C.success : C.muted),
            }).setOrigin(1, 0.5).setResolution(2)

            const row = [g, l, v]
            row.forEach((o) => (o as Phaser.GameObjects.Graphics).setAlpha(0))
            this.tweens.add({ targets: row, alpha: 1, duration: 260, delay: 200 + i * 110 })
            parts.push(...row)
        })

        const btn = this.bigButton(0, top + PH - 54, MODAL.btnW, 76, 'FECHAR', C.accent, () => {
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
        })

        parts.push(btn)
        modal.add(parts)
        modal.setScale(0.9).setAlpha(0)
        this.tweens.add({ targets: modal, alpha: 1, scale: 1, duration: 300, ease: 'Back.easeOut' })
    }

    private showFeedback(ok: boolean, message: string, earned: number, onDone: () => void) {
        const overlay = this.add.rectangle(W / 2, H / 2, W, H, C.bgDeep, A.veil).setDepth(500).setInteractive()
        const modal = this.add.container(W / 2, H / 2).setDepth(501)

        const body = this.add.text(0, 0, message, {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: F.body,
            color: hex(C.ink),
            align: 'center',
            wordWrap: { width: MODAL.w - 140 },
        }).setOrigin(0.5).setResolution(2)

        const PH = body.height + 320
        const top = -PH / 2
        const tone = ok ? C.success : C.warning

        const bg = this.add.graphics()
        bg.fillStyle(C.shadow, 0.3)
        bg.fillRoundedRect(-MODAL.w / 2 + 5, top + 14, MODAL.w, PH, MODAL.radius)
        bg.fillStyle(C.panel, 1)
        bg.fillRoundedRect(-MODAL.w / 2, top, MODAL.w, PH, MODAL.radius)
        bg.lineStyle(6, tone, 1)
        bg.strokeRoundedRect(-MODAL.w / 2, top, MODAL.w, PH, MODAL.radius)

        const disc = this.add.graphics()
        disc.fillStyle(tone, 1)
        disc.fillCircle(0, top + 64, 40)

        const mark = this.add.graphics()
        mark.lineStyle(9, C.white, 1)
        if (ok) {
            mark.lineBetween(-16, top + 64, -5, top + 77)
            mark.lineBetween(-5, top + 77, 18, top + 49)
        } else {
            mark.lineBetween(0, top + 46, 0, top + 71)
            mark.fillStyle(C.white, 1)
            mark.fillCircle(0, top + 83, 6)
        }

        const title = this.add.text(0, top + 134, ok ? 'Funcionou!' : 'Vamos ajustar', {
            fontFamily: 'Arial Black, Arial',
            fontSize: F.title,
            color: hex(C.ink),
        }).setOrigin(0.5).setResolution(2)

        body.setY(top + 178 + body.height / 2)

        const pts = this.add.text(0, top + 190 + body.height + 16, earned > 0 ? `+${earned} pontos` : '', {
            fontFamily: 'Arial Black, Arial',
            fontSize: F.small,
            color: hex(C.condition),
        }).setOrigin(0.5).setResolution(2)

        const btn = this.bigButton(0, PH / 2 - 56, MODAL.btnW, 76, ok ? 'CONTINUAR' : 'TENTAR DE NOVO', tone, () => {
            this.closeModal(overlay, modal, onDone)
        })

        modal.add([bg, disc, mark, title, body, pts, btn])
        modal.setScale(0.88).setAlpha(0)
        this.tweens.add({ targets: modal, alpha: 1, scale: 1, duration: 280, ease: 'Back.easeOut' })
        this.tweens.add({ targets: disc, scale: 1.12, duration: 220, delay: 220, yoyo: true })
    }

    private showLevelIntro(onStart: () => void) {
        this.locked = true

        const overlay = this.add.rectangle(W / 2, H / 2, W, H, C.bgDeep, 0.74).setDepth(520).setInteractive()
        const panel = this.add.container(W / 2, H / 2).setDepth(521)

        const objective = this.add.text(0, 0, this.level.objective, {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: F.body,
            color: hex(C.ink),
            align: 'center',
            wordWrap: { width: MODAL.w - 150 },
        }).setOrigin(0.5).setResolution(2)

        const PH = objective.height + 330
        const top = -PH / 2

        const bg = this.add.graphics()
        bg.fillStyle(C.shadow, 0.3)
        bg.fillRoundedRect(-MODAL.w / 2 + 5, top + 14, MODAL.w, PH, MODAL.radius)
        bg.fillStyle(C.panel, 1)
        bg.fillRoundedRect(-MODAL.w / 2, top, MODAL.w, PH, MODAL.radius)
        bg.lineStyle(6, C.accent, 1)
        bg.strokeRoundedRect(-MODAL.w / 2, top, MODAL.w, PH, MODAL.radius)

        const badge = this.add.text(0, top + 58, `NIVEL ${this.level.level}`, {
            fontFamily: 'Arial Black, Arial',
            fontSize: F.small,
            color: hex(C.condition),
        }).setOrigin(0.5).setResolution(2)

        const title = this.add.text(0, top + 116, this.level.title, {
            fontFamily: 'Arial Black, Arial',
            fontSize: F.huge,
            color: hex(C.ink),
            align: 'center',
            wordWrap: { width: MODAL.w - 90 },
        }).setOrigin(0.5).setResolution(2)

        objective.setY(top + 176 + objective.height / 2)

        const btn = this.bigButton(0, PH / 2 - 56, MODAL.btnW, 78, 'COMECAR', C.accent, () => {
            this.closeModal(overlay, panel, onStart)
        })

        panel.add([bg, badge, title, objective, btn])
        panel.setScale(0.88).setAlpha(0)
        this.tweens.add({ targets: panel, alpha: 1, scale: 1, duration: 290, ease: 'Back.easeOut' })
    }


    private replayTutorial = () => {
        if (this.mode === 'hub') {
            this.runHubTutorial(() => undefined, false)
            return
        }
        if (this.mode !== 'build' || this.running) return
        this.runBuildTutorial(() => undefined, false)
    }

    private runHubTutorial(onDone: () => void, once = true) {
        EventBus.emit('tutorial-start')
        this.locked = true

        const activeIndex = TRACK_ORDER.indexOf(this.mission.track)
        const totalW = TRACK_ORDER.length * HUB.cardW + (TRACK_ORDER.length - 1) * HUB.gap
        const activeX = W / 2 - totalW / 2 + HUB.cardW / 2 + activeIndex * (HUB.cardW + HUB.gap)
        const activeW = HUB.cardW * HUB.activeScale + 42
        const activeH = HUB.cardH * HUB.activeScale + 42

        const steps: TutorialStep[] = [
            {
                text: 'Toque na trilha brilhando para abrir a primeira missao.',
                shape: 'rect',
                x: activeX,
                y: HUB.cardY,
                w: activeW,
                h: activeH,
                balloonX: W / 2,
                balloonY: 198,
                buttonLabel: 'Entendi',
                pointer: {
                    fromX: activeX,
                    fromY: HUB.cardY + 150,
                    toX: activeX,
                    toY: HUB.cardY + 18,
                },
            },
            {
                text: 'Depois leia o problema, escolha os blocos e rode o algoritmo para testar.',
                shape: 'none',
                balloonX: W / 2,
                balloonY: 302,
                buttonLabel: 'Vamos comecar!',
            },
        ]

        createTutorial(this, {
            key: 'ef15co02-hub-intro',
            steps,
            accent: this.tint,
            once,
            safeTop: 104,
            onFinish: () => {
                this.locked = false
                EventBus.emit('tutorial-end')
                onDone()
            },
        })
    }

    private runBuildTutorial(onDone: () => void, once = true) {
        EventBus.emit('tutorial-start')
        this.locked = true

        const firstChip = this.chipViews[0]
        const chipX = firstChip ? firstChip.x : PALETTE.cx
        const steps: TutorialStep[] = [
            {
                text: 'Toque nos blocos grandes aqui embaixo para montar sua sequencia.',
                shape: 'rect',
                x: chipX,
                y: PALETTE.y,
                w: PALETTE.chipW + 38,
                h: PALETTE.chipH + 34,
                balloonX: W / 2,
                balloonY: 286,
                pointer: {
                    fromX: chipX,
                    fromY: PALETTE.y + 130,
                    toX: chipX,
                    toY: PALETTE.y,
                },
            },
            {
                text: 'Os blocos entram nesta lista. A ordem importa: o jogo executa de cima para baixo.',
                shape: 'rect',
                x: SCRIPT.cx,
                y: SCRIPT.top + SCRIPT.slotH / 2,
                w: SCRIPT.w + 54,
                h: SCRIPT.slotH + 42,
                balloonX: 902,
                balloonY: 298,
            },
            {
                text: 'Quando terminar, toque em RODAR para ver se o algoritmo resolve o problema.',
                shape: 'circle',
                x: RUN.x,
                y: RUN.y,
                w: RUN.r * 2 + 44,
                h: RUN.r * 2 + 44,
                balloonX: 846,
                balloonY: 430,
                buttonLabel: 'Agora eu tento!',
                pointer: {
                    fromX: RUN.x - 130,
                    fromY: RUN.y - 92,
                    toX: RUN.x,
                    toY: RUN.y,
                },
            },
        ]

        createTutorial(this, {
            key: 'ef15co02-build-intro',
            steps,
            accent: this.tint,
            once,
            safeTop: 104,
            onFinish: () => {
                this.locked = false
                EventBus.emit('tutorial-end')
                onDone()
            },
        })
    }

    private buildTino(
        layer: Phaser.GameObjects.Container,
        x: number,
        y: number,
        size: number,
        bx: number,
        by: number,
        bw: number,
        bh: number,
        quiet: boolean,
    ) {
        const bubble = this.add.container(0, 0)
        const g = this.add.graphics()
        const tailY = by + bh / 2
        const trainerLeft = x < bx
        const tailInset = 22
        const tailTip = trainerLeft ? bx - 28 : bx + bw + 28
        const tailBaseX = trainerLeft ? bx : bx + bw

        g.fillStyle(C.shadow, 0.28)
        g.fillRoundedRect(bx + 5, by + 10, bw, bh, 28)
        g.fillStyle(C.panel, A.panel)
        g.fillRoundedRect(bx, by, bw, bh, 28)
        g.fillTriangle(tailBaseX, tailY - tailInset, tailBaseX, tailY + tailInset, tailTip, tailY)
        g.lineStyle(5, C.accent, 1)
        g.strokeRoundedRect(bx, by, bw, bh, 28)

        this.tinoText = this.add.text(bx + bw / 2, by + bh / 2, '', {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: Math.min(F.body, 22),
            color: hex(C.ink),
            align: 'center',
            wordWrap: { width: bw - 64 },
        }).setOrigin(0.5).setResolution(2)

        bubble.add([g, this.tinoText])
        this.tinoBubble = bubble

        this.tino = this.add.image(x, y, 'treinador-normal').setOrigin(0.5, 1)
        this.tino.setDisplaySize(size * (220 / 260), size)

        layer.add([bubble, this.tino])
        this.tweens.add({ targets: this.tino, y: y - 10, duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })

        if (quiet) bubble.setAlpha(0)
    }
    private say(pose: Pose, text: string) {
        if (!this.tino || !this.tinoText || !this.tino.active) return

        const h = this.tino.displayHeight
        this.tino.setTexture(`treinador-${pose}`)
        this.tino.setDisplaySize(h * (220 / 260), h)
        this.tweens.add({ targets: this.tino, scaleX: this.tino.scaleX * 1.07, duration: 140, yoyo: true })

        if (this.tinoBubble && this.tinoBubble.alpha < 1) {
            this.tweens.add({ targets: this.tinoBubble, alpha: 1, duration: 220 })
        }

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
        if (block.kind === 'repetir') return `r:${block.times}:${block.blocks.map((b) => this.signature(b)).join(',')}`
        if (block.kind === 'condicao') {
            const t = block.ifTrue.blocks.map((b) => this.signature(b)).join(',')
            const f = (block.ifFalse?.blocks ?? []).map((b) => this.signature(b)).join(',')
            return `c:${block.condition}:${t}|${f}`
        }
        return `k:${block.kind}`
    }

    private maxBlocks() {
        const m = this.mission
        if (m.kind === 'livre') return m.target?.maxBlocks ?? m.expected.length
        if (m.kind === 'comparar') return m.expected.length
        return m.maxBlocks ?? m.expected.length
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
        return SCRIPT.slotH + this.blockChildren(block).length * SCRIPT.childH
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

    private drawBlockIcon(g: Phaser.GameObjects.Graphics, block: AlgorithmBlock, cx: number, cy: number, s: number) {
        g.fillStyle(C.white, 0.92)
        g.lineStyle(4, C.white, 0.92)

        if (block.kind === 'repetir') {
            g.beginPath()
            g.arc(cx, cy, s * 0.7, Phaser.Math.DegToRad(40), Phaser.Math.DegToRad(320))
            g.strokePath()
            g.fillTriangle(cx + s * 0.72, cy - s * 0.6, cx + s * 0.2, cy - s * 0.72, cx + s * 0.68, cy - s * 0.1)
            return
        }
        if (block.kind === 'condicao') {
            g.lineBetween(cx, cy + s * 0.7, cx, cy)
            g.lineBetween(cx, cy, cx - s * 0.66, cy - s * 0.62)
            g.lineBetween(cx, cy, cx + s * 0.66, cy - s * 0.62)
            return
        }
        g.fillRoundedRect(cx - s * 0.7, cy - s * 0.42, s * 1.4, s * 0.84, s * 0.22)
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
        g.lineStyle(6, color, 1)

        if (icon === 'setas') {
            for (let i = -1; i <= 1; i += 1) {
                const x = cx + i * s * 0.6
                g.fillTriangle(x + s * 0.22, cy, x - s * 0.16, cy - s * 0.3, x - s * 0.16, cy + s * 0.3)
            }
            return
        }

        if (icon === 'loop') {
            g.beginPath()
            g.arc(cx, cy, s * 0.54, Phaser.Math.DegToRad(40), Phaser.Math.DegToRad(330))
            g.strokePath()
            g.fillTriangle(cx + s * 0.54, cy - s * 0.44, cx + s * 0.18, cy - s * 0.52, cx + s * 0.52, cy - s * 0.06)
            return
        }

        if (icon === 'bifurcacao') {
            g.lineBetween(cx, cy + s * 0.5, cx, cy)
            g.lineBetween(cx, cy, cx - s * 0.5, cy - s * 0.46)
            g.lineBetween(cx, cy, cx + s * 0.5, cy - s * 0.46)
            g.fillCircle(cx - s * 0.5, cy - s * 0.46, s * 0.17)
            g.fillCircle(cx + s * 0.5, cy - s * 0.46, s * 0.17)
            return
        }

        if (icon === 'ferramenta') {
            g.fillRoundedRect(cx - s * 0.11, cy - s * 0.14, s * 0.22, s * 0.64, s * 0.09)
            g.fillCircle(cx, cy - s * 0.28, s * 0.3)
            g.fillStyle(C.panel, 1)
            g.fillCircle(cx, cy - s * 0.32, s * 0.13)
            return
        }

        g.fillRoundedRect(cx - s * 0.36, cy - s * 0.48, s * 0.72, s * 0.52, s * 0.11)
        g.fillRect(cx - s * 0.1, cy + s * 0.04, s * 0.2, s * 0.3)
        g.fillRoundedRect(cx - s * 0.34, cy + s * 0.32, s * 0.68, s * 0.17, s * 0.07)
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
            this.inputBlocker.on('pointerdown', (_p: Phaser.Input.Pointer, _x: number, _y: number, e: Phaser.Types.Input.EventData) => e.stopPropagation())
            this.inputBlocker.on('pointerup', (_p: Phaser.Input.Pointer, _x: number, _y: number, e: Phaser.Types.Input.EventData) => e.stopPropagation())
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

    private bigButton(
        x: number,
        y: number,
        w: number,
        h: number,
        label: string,
        color: number,
        onClick: () => void,
    ) {
        const btn = this.add.container(x, y)
        const g = this.add.graphics()

        g.fillStyle(C.shadow, 0.3)
        g.fillRoundedRect(-w / 2, -h / 2 + 8, w, h, h / 2)
        g.fillStyle(color, 1)
        g.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
        g.fillStyle(C.white, A.gloss)
        g.fillRoundedRect(-w / 2 + 10, -h / 2 + 8, w - 20, h * 0.32, h / 4)

        const t = this.add.text(0, 0, label, {
            fontFamily: 'Arial Black, Arial',
            fontSize: F.body,
            color: hex(C.white),
            stroke: hex(C.shadow),
            strokeThickness: 5,
            align: 'center',
            wordWrap: { width: w - 30 },
        }).setOrigin(0.5).setResolution(2)

        btn.add([g, t])
        btn.setSize(w, h)
        btn.setInteractive({ useHandCursor: true })
        btn.on('pointerover', () => this.tweens.add({ targets: btn, scale: 1.05, duration: 120 }))
        btn.on('pointerout', () => this.tweens.add({ targets: btn, scale: 1, duration: 120 }))
        btn.on('pointerdown', (_p: Phaser.Input.Pointer, _x: number, _y: number, e: Phaser.Types.Input.EventData) => {
            e.stopPropagation()
            if (this.isInputBlocked()) return
            this.tweens.add({ targets: btn, scale: 0.95, duration: 70, yoyo: true })
            onClick()
        })

        return btn
    }
}









