import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { FX } from '../../../../shared/effects/FX'
import { LEVELS, iconOrder } from '../data/levels'
import {
    DEPTH,
    GOAL,
    LANE,
    PICK,
    RAIL,
    RUN,
    SLOT,
    SPLIT_HINT,
    STEP,
    TAG,
    TASK,
    TRAY,
    W,
    slotCard,
    slotX,
    stepCard,
    stepX,
    trayCard,
    trayX,
} from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import type {
    IconId, LevelDef, LevelNumber, MissionDef, PartDef, Phase, StepDef,
} from '../types'
import { createAudio } from './audio'
import { createPillButton } from './button'
import { createCard, applySheet, type Card } from './cards'
import { createHud } from './hud'
import { createPrompt } from './prompt'
import { createShelf } from './shelf'
import { createStage } from './stage'

interface Pick {
    card: Card
    step: StepDef
    home: number
    taken: boolean
}

const GAME_ID = 'arquiteto-das-missoes'

export class GameScene extends Phaser.Scene {
    private lives!: Lives
    private livesTotal = 3
    private livesLeft = 3

    private level!: LevelDef
    private missionIndex = 0
    private phase: Phase = 'intro'
    private gen = 0
    private busy = false

    private score = 0
    private hits = 0
    private errors = 0
    private phaseErrors = 0
    private phaseIndex = 0
    private solveIndex = 0

    private stage!: ReturnType<typeof createStage>
    private hud!: ReturnType<typeof createHud>
    private shelf!: ReturnType<typeof createShelf>
    private audio!: ReturnType<typeof createAudio>

    private work: Phaser.GameObjects.GameObject[] = []
    private slots: Card[] = []
    private solveCards: Card[] = []
    private pending: Pick | null = null
    private current = 0
    private ring: Phaser.GameObjects.Container | null = null
    private prompt: ReturnType<typeof createPrompt> | null = null
    private runner: ReturnType<typeof createPillButton> | null = null
    private taskBar: Phaser.GameObjects.Container | null = null
    private filled: string[] = []
    private laneOrder: string[] = []
    private laneCards: Card[] = []
    private landScale = 1

    private unsubPlatform?: () => void

    private get mission() {
        return this.level.missions[this.missionIndex]
    }

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this, 3)
        this.livesLeft = data?.lives ?? this.livesTotal

        const number = Phaser.Math.Clamp(data?.level ?? 1, 1, LEVELS.length) as LevelNumber
        this.level = LEVELS[number - 1]

        this.missionIndex = 0
        this.phase = 'intro'
        this.busy = false
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.phaseErrors = 0
        this.phaseIndex = 0
        this.solveIndex = 0
        this.filled = []
        this.laneOrder = []
    }

    create() {
        this.input.topOnly = true

        this.audio = createAudio(this)
        applySheet(this.mission.sheet, iconOrder(this.mission))
        this.stage = createStage(this, this.mission)
        this.shelf = createShelf(this, this.mission.parts)
        this.hud = createHud(this, () => this.replayTutorial())
        this.hud.setLevel(this.level.level, LEVELS.length)
        this.hud.setPhases(2 + this.mission.parts.length)
        this.hud.setPhase(0)

        this.bindPlatform()
        EventBus.on('mute-audio', this.onMute, this)
        EventBus.on('show-tutorial', this.replayTutorial, this)
        this.events.once('shutdown', this.shutdownScene, this)

        this.lives = createLives(this, {
            total: this.livesTotal,
            remaining: this.livesLeft,
            gameId: GAME_ID,
            x: 24,
            y: 44,
            size: 30,
            stage: () => this.level.level,
        })
        this.events.once('shutdown', () => this.lives.destroy())

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        void this.startSplit()
    }

    private shutdownScene() {
        this.gen++
        this.clearWork()
        this.stage?.destroy()
        this.shelf?.destroy()
        this.hud?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.replayTutorial, this)
        this.unsubPlatform?.()
    }

    private clearWork() {
        this.prompt?.destroy()
        this.prompt = null
        this.runner?.destroy()
        this.runner = null
        this.work.forEach(o => o.destroy())
        this.work = []
        this.slots = []
        this.solveCards = []
        this.pending = null
        this.ring = null
        this.taskBar = null
    }

    /**
     * A faixa que diz, com todas as letras, o que fazer agora. Sem ela a
     * criança vê três cartas soltas e não sabe que está fazendo um bolo.
     */
    private showTask(text: string, icon?: IconId, y = TASK.cy) {
        const label = this.add.text(0, 1, text, {
            fontFamily: FONT.black,
            fontSize: '30px',
            color: CSS.ink,
        }).setOrigin(0.5).setResolution(2)

        const head = icon ? TASK.badge + 12 : TASK.pad
        const width = head + label.width + TASK.pad
        const left = -width / 2
        label.x = left + head + label.width / 2

        const g = this.add.graphics()
        g.fillStyle(C.ink, 0.3)
        g.fillRoundedRect(left, -TASK.h / 2 + 9, width, TASK.h, TASK.h / 2)
        g.fillStyle(C.woodDark, 1)
        g.fillRoundedRect(left, -TASK.h / 2, width, TASK.h, TASK.h / 2)
        g.fillStyle(C.cream, 1)
        g.fillRoundedRect(left + 6, -TASK.h / 2 + 6, width - 12, TASK.h - 16, TASK.h / 2 - 6)
        g.fillStyle(C.white, 0.7)
        g.fillRoundedRect(left + 24, -TASK.h / 2 + 13, width - 48, 13, 7)

        const root = this.add.container(W / 2, y, [g, label]).setDepth(DEPTH.card)

        if (icon) {
            const badge = createCard(this, {
                icon,
                w: TASK.badge,
                h: TASK.badge,
                iconScale: 0.78,
            })
            badge.root.setPosition(left + TASK.badge / 2 + 2, 0)
            root.add(badge.root)
        }

        this.keep(root)
        this.taskBar = root
        FX.popIn(this, root, { from: 0.72, duration: 340 })
        return root
    }

    private keep<T extends Phaser.GameObjects.GameObject>(o: T): T {
        this.work.push(o)
        return o
    }

    private tapZone(x: number, y: number, w: number, h: number, onTap: () => void) {
        const zone = this.add.zone(x, y, w, h)
            .setOrigin(0.5)
            .setDepth(DEPTH.card + 1)
            .setInteractive({ useHandCursor: true })
        zone.on('pointerdown', onTap)
        return this.keep(zone)
    }

    /**
     * As distratoras entram espalhadas entre as partes, e o espalhamento muda
     * com o tamanho da bandeja — senão a criança aprende a posição em vez do
     * pedido.
     */
    private buildTray(mission: MissionDef) {
        const parts = mission.parts.map(p => ({
            id: p.id, label: p.label, icon: p.icon, fits: true,
        }))
        const decoys = mission.decoys.map(d => ({
            id: d.id, label: d.label, icon: d.icon, fits: false,
        }))

        const total = parts.length + decoys.length
        const tray: Array<typeof parts[number]> = new Array(total)

        parts.forEach((part, i) => {
            let at = Math.min(total - 1, Math.round(((i + 0.5) * total) / parts.length))
            while (tray[at]) at = (at + 1) % total
            tray[at] = part
        })

        let cursor = 0
        decoys.forEach(decoy => {
            while (tray[cursor]) cursor++
            tray[cursor] = decoy
        })

        return tray
    }

    /** Etiqueta acima do pedido: sem ela o cartão do topo é só mais um cartão. */
    private showTag(text: string) {
        const label = this.add.text(0, 0, text, {
            fontFamily: FONT.black,
            fontSize: '23px',
            color: CSS.cream,
        }).setOrigin(0.5).setResolution(2)

        const width = label.width + 56
        const g = this.add.graphics()
        g.fillStyle(C.ink, 1)
        g.fillRoundedRect(-width / 2, -TAG.h / 2, width, TAG.h, TAG.h / 2)
        g.fillStyle(C.tealDark, 1)
        g.fillRoundedRect(-width / 2 + 4, -TAG.h / 2 + 4, width - 8, TAG.h - 8, TAG.h / 2 - 4)
        g.fillStyle(C.teal, 1)
        g.fillRoundedRect(-width / 2 + 4, -TAG.h / 2 + 4, width - 8, TAG.h - 14, TAG.h / 2 - 4)

        const root = this.add.container(W / 2, TAG.cy, [g, label]).setDepth(DEPTH.card)
        this.keep(root)
        FX.popIn(this, root, { from: 0.7, duration: 320 })
    }

    // ─────────────────────────────────────────────── fase 1: dividir

    private async startSplit() {
        const gen = this.gen
        this.phase = 'split'
        this.phaseIndex = 0
        this.phaseErrors = 0
        this.filled = []
        this.hud.setPhase(0)
        this.clearWork()
        this.stage.dim(0.58)

        const mission = this.mission
        const goal = createCard(this, {
            icon: mission.goalIcon,
            label: mission.goalLabel,
            w: GOAL.w,
            h: GOAL.h,
        })
        goal.root.setPosition(GOAL.cx, GOAL.cy).setDepth(DEPTH.card)
        this.keep(goal.root)
        FX.popIn(this, goal.root, { from: 0.7, duration: 360 })

        await FX.wait(this, 620)
        if (gen !== this.gen) return

        this.audio.split()
        await FX.shake(this, goal.root, { amount: 14, times: 3 })
        if (gen !== this.gen) return

        const n = mission.parts.length
        await new Promise<void>(resolve => {
            this.tweens.add({
                targets: goal.root,
                y: GOAL.top,
                duration: FX.ms(this, 420),
                ease: 'Back.easeInOut',
                onComplete: () => resolve(),
            })
        })
        if (gen !== this.gen) return

        this.showTag('O PEDIDO')
        this.showTask('Toque no que faz parte', undefined, SPLIT_HINT.cy)

        const slotSize = slotCard(n)
        this.slots = mission.parts.map((_, i) => {
            const ghost = createCard(this, { icon: 'vazio', w: slotSize.w, h: slotSize.h })
            ghost.setTone('ghost')
            ghost.root.setPosition(slotX(i, n), SLOT.cy).setDepth(DEPTH.panel)
            this.keep(ghost.root)
            FX.popIn(this, ghost.root, { from: 0.6, delay: i * 110, duration: 320 })
            return ghost
        })

        const tray = this.buildTray(mission)
        const traySize = trayCard(tray.length)
        this.landScale = slotSize.w / traySize.w

        tray.forEach((entry, i) => {
            const card = createCard(this, {
                icon: entry.icon,
                label: entry.label,
                w: traySize.w,
                h: traySize.h,
            })
            const x = trayX(i, tray.length)
            card.root.setPosition(x, TRAY.cy).setDepth(DEPTH.card)
            this.keep(card.root)
            FX.popIn(this, card.root, { from: 0.6, delay: 260 + i * 90, duration: 320 })

            const zone = this.tapZone(x, TRAY.cy, traySize.w, traySize.h, () => {
                if (this.phase !== 'split' || this.busy) return
                void this.onSplitPick(entry, card, zone)
            })
        })

        await FX.wait(this, 500)
        if (gen !== this.gen) return

        this.phase = 'tutorial'
        await this.runTutorial(true)
        if (gen !== this.gen) return
        this.phase = 'split'
    }

    private async onSplitPick(
        entry: { id: string; label: string; icon: string; fits: boolean },
        card: Card,
        zone: Phaser.GameObjects.Zone,
    ) {
        const gen = this.gen

        if (!entry.fits) {
            this.reject(card)
            zone.destroy()
            return
        }

        this.busy = true
        zone.destroy()
        this.audio.place()

        const index = this.mission.parts.findIndex(p => p.id === entry.id)
        const slot = this.slots[index]

        await new Promise<void>(resolve => {
            this.tweens.add({
                targets: card.root,
                x: slot.root.x,
                y: slot.root.y,
                scale: this.landScale,
                duration: FX.ms(this, 360),
                ease: 'Back.easeOut',
                onComplete: () => resolve(),
            })
        })
        if (gen !== this.gen) return

        slot.root.setVisible(false)
        card.setTone('ok')
        card.setBadge('check')
        FX.popIn(this, card.root, { from: 1.14, duration: 300 })
        this.filled.push(entry.id)
        this.busy = false

        if (this.filled.length < this.mission.parts.length) return

        this.audio.solved()
        this.hud.flash(C.ok)
        this.awardPhase()
        await FX.wait(this, 900)
        if (gen !== this.gen) return
        await this.startSolve(0)
    }

    // ─────────────────────────────────────────────── fase 2: resolver

    private async startSolve(index: number) {
        const gen = this.gen
        this.phase = 'solve'
        this.solveIndex = index
        this.phaseErrors = 0
        this.phaseIndex = 1 + index
        this.hud.setPhase(this.phaseIndex)
        this.clearWork()

        const part = this.mission.parts[index]

        this.showTask(part.task, part.icon)
        this.shelf.show()

        const n = part.steps.length
        const stepSize = stepCard(n)
        this.landScale = 1
        this.slots = part.steps.map((_, i) => {
            const ghost = createCard(this, { icon: 'vazio', w: stepSize.w, h: stepSize.h })
            ghost.setTone('ghost')
            ghost.setBadge('number', i + 1)
            ghost.root.setPosition(stepX(i, n), STEP.cy).setDepth(DEPTH.panel)
            this.keep(ghost.root)
            FX.popIn(this, ghost.root, { from: 0.6, delay: i * 100, duration: 320 })
            return ghost
        })

        const shuffled = [part.steps[2], part.steps[0], part.steps[1]]
        this.solveCards = []
        this.pending = null
        this.current = 0

        shuffled.forEach((step, i) => {
            const card = createCard(this, { icon: step.icon, w: stepSize.w, h: stepSize.h })
            const x = stepX(i, shuffled.length)
            card.root.setPosition(x, PICK.cy).setDepth(DEPTH.card)
            this.keep(card.root)
            FX.popIn(this, card.root, { from: 0.6, delay: 220 + i * 90, duration: 320 })

            const entry: Pick = { card, step, home: x, taken: false }
            this.tapZone(x, PICK.cy, stepSize.w, stepSize.h, () => {
                if (this.phase !== 'solve' || this.busy) return
                void this.choose(entry)
            })
        })

        this.aimAt(0, n)
        this.prompt = createPrompt(this, () => this.confirmStep())
        this.prompt.set(1, part.steps[0].label)

        await FX.wait(this, 400)
        if (gen !== this.gen) return
    }

    /** O anel que diz "é este espaço agora". Anda junto com o passo atual. */
    private aimAt(index: number, n: number) {
        const size = stepCard(n)
        const x = stepX(index, n)

        if (!this.ring) {
            const g = this.add.graphics()
            g.lineStyle(10, C.warnDark, 1)
            g.strokeRoundedRect(-size.w / 2 - 13, -size.h / 2 - 13, size.w + 26, size.h + 26, 36)
            g.lineStyle(5, C.warn, 1)
            g.strokeRoundedRect(-size.w / 2 - 13, -size.h / 2 - 13, size.w + 26, size.h + 26, 36)
            this.ring = this.keep(
                this.add.container(x, STEP.cy, [g]).setDepth(DEPTH.glyph),
            )
            this.tweens.add({
                targets: this.ring,
                scale: 1.045,
                duration: FX.ms(this, 720),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
            })
            return
        }

        this.tweens.add({
            targets: this.ring,
            x,
            duration: FX.ms(this, 300),
            ease: 'Back.easeOut',
        })
    }

    private move(card: Card, x: number, y: number, ms = 320) {
        return new Promise<void>(resolve => {
            this.tweens.add({
                targets: card.root,
                x,
                y,
                duration: FX.ms(this, ms),
                ease: 'Back.easeOut',
                onComplete: () => resolve(),
            })
        })
    }

    /** Escolher é só pôr no espaço; quem julga é o CONFIRMAR. */
    private async choose(entry: Pick) {
        if (entry.taken || this.pending === entry) return

        const gen = this.gen
        this.busy = true
        const leaving = this.pending
        this.pending = entry
        this.audio.place()

        const n = this.mission.parts[this.solveIndex].steps.length
        const jobs = [this.move(entry.card, stepX(this.current, n), STEP.cy)]
        if (leaving) jobs.push(this.move(leaving.card, leaving.home, PICK.cy))

        await Promise.race([Promise.all(jobs), FX.wait(this, 700)])
        if (gen !== this.gen) return

        leaving?.card.setTone('idle')
        this.slots[this.current].root.setVisible(false)
        entry.card.setTone('hot')
        this.prompt?.setReady(true)
        this.busy = false
    }

    private confirmStep() {
        if (this.phase !== 'solve' || this.busy || !this.pending) return

        const part = this.mission.parts[this.solveIndex]
        const entry = this.pending
        this.pending = null
        this.prompt?.setReady(false)

        if (entry.step.id !== part.steps[this.current].id) {
            void this.refuse(entry)
            return
        }

        const at = this.current
        entry.taken = true
        entry.card.setTone('ok')
        entry.card.setBadge('number', at + 1)
        FX.popIn(this, entry.card.root, { from: 1.14, duration: 280 })
        this.audio.step(at)
        this.solveCards[at] = entry.card
        this.current = at + 1

        if (this.current < part.steps.length) {
            this.aimAt(this.current, part.steps.length)
            this.prompt?.set(this.current + 1, part.steps[this.current].label)
            return
        }

        this.ring?.setVisible(false)
        void this.finishSolve(part)
    }

    private async refuse(entry: Pick) {
        const gen = this.gen
        this.busy = true
        this.slots[this.current].root.setVisible(true)
        this.reject(entry.card, false)

        await FX.wait(this, 640)
        if (gen !== this.gen) return
    }

    private async finishSolve(part: PartDef) {
        const gen = this.gen
        const index = this.solveIndex
        this.audio.solved()
        this.hud.flash(C.ok)
        this.awardPhase()

        void FX.popText(this, W / 2, PICK.cy, part.done, {
            color: CSS.cream, size: '40px', rise: 46, duration: 620,
        })

        await FX.wait(this, 620)
        if (gen !== this.gen) return

        await this.gatherSteps(index)
        if (gen !== this.gen) return

        await this.shelf.fill(index)
        if (gen !== this.gen) return

        await FX.wait(this, 520)
        if (gen !== this.gen) return

        const next = index + 1
        if (next < this.mission.parts.length) {
            await this.startSolve(next)
            return
        }
        await this.startCombine()
    }

    /**
     * Os três passos viram uma coisa só e descem para a prateleira. É o
     * momento em que "fiz o café" deixa de ser uma frase e vira um objeto.
     */
    private async gatherSteps(index: number) {
        const target = this.shelf.slotAt(index)
        const cards = this.solveCards.filter(Boolean)

        this.prompt?.dismiss()
        if (this.ring) {
            this.tweens.add({
                targets: this.ring,
                alpha: 0,
                duration: FX.ms(this, 240),
            })
        }

        if (this.taskBar) {
            this.tweens.add({
                targets: this.taskBar,
                alpha: 0,
                y: TASK.cy - 24,
                duration: FX.ms(this, 320),
            })
        }

        const jobs = cards.map((card, i) => new Promise<void>(resolve => {
            this.tweens.add({
                targets: card.root,
                x: target.x,
                y: target.y,
                scale: RAIL.cardW / STEP.w,
                alpha: 0.15,
                delay: FX.ms(this, i * 90),
                duration: FX.ms(this, 460),
                ease: 'Back.easeIn',
                onComplete: () => resolve(),
            })
        }))

        await Promise.race([Promise.all(jobs), FX.wait(this, 1000)])
    }

    // ─────────────────────────────────────────────── fase 3: combinar

    private async startCombine() {
        const gen = this.gen
        this.phase = 'combine'
        this.phaseErrors = 0
        this.phaseIndex = 1 + this.mission.parts.length
        this.hud.setPhase(this.phaseIndex)
        this.clearWork()
        this.laneOrder = []

        const parts = this.mission.parts
        const n = parts.length

        this.showTask('Junte as partes no plano')

        const lane = this.keep(this.add.graphics().setDepth(DEPTH.panel - 1))
        const laneW = n * (slotCard(n).w + SLOT.gap) + LANE.pad * 2
        lane.fillStyle(C.ink, 0.3)
        lane.fillRoundedRect(LANE.cx - laneW / 2, LANE.cy - LANE.h / 2 + 8, laneW, LANE.h, 34)
        lane.fillStyle(C.cream, 0.94)
        lane.fillRoundedRect(LANE.cx - laneW / 2, LANE.cy - LANE.h / 2, laneW, LANE.h, 34)
        lane.lineStyle(7, C.woodDark, 1)
        lane.strokeRoundedRect(LANE.cx - laneW / 2, LANE.cy - LANE.h / 2, laneW, LANE.h, 34)

        const combSize = trayCard(n)
        const holdW = combSize.w * LANE.scale + 14
        const holdH = combSize.h * LANE.scale + 14
        const holders: Phaser.GameObjects.Graphics[] = []
        for (let i = 0; i < n; i++) {
            const g = this.keep(this.add.graphics().setDepth(DEPTH.panel))
            const x = slotX(i, n)
            g.lineStyle(6, C.creamEdge, 1)
            g.strokeRoundedRect(x - holdW / 2, LANE.cy - holdH / 2, holdW, holdH, 24)
            holders.push(g)
        }

        this.laneCards = []

        this.shelf.dismiss()

        parts.forEach((part, i) => {
            const card = createCard(this, {
                icon: part.icon,
                label: part.label,
                w: combSize.w,
                h: combSize.h,
            })
            card.setBadge('check')
            const x = trayX(i, n)
            const from = this.shelf.slotAt(i)
            card.root.setPosition(from.x, from.y)
                .setScale(RAIL.cardW / combSize.w)
                .setDepth(DEPTH.card)
            this.keep(card.root)
            this.tweens.add({
                targets: card.root,
                x,
                y: TRAY.cy,
                scale: 1,
                delay: FX.ms(this, i * 120),
                duration: FX.ms(this, 440),
                ease: 'Back.easeOut',
            })

            const zone = this.tapZone(x, TRAY.cy, combSize.w, combSize.h, () => {
                if (this.phase !== 'combine' || this.busy) return
                zone.destroy()
                this.audio.place()
                const target = this.laneOrder.length
                this.laneOrder.push(part.id)
                this.laneCards.push(card)

                this.tweens.add({
                    targets: card.root,
                    x: slotX(target, n),
                    y: LANE.cy,
                    scale: LANE.scale,
                    duration: FX.ms(this, 340),
                    ease: 'Back.easeOut',
                })
                holders[target]?.setAlpha(0)

                if (this.laneOrder.length === n) this.showRun()
            })
        })

        await FX.wait(this, 400)
        if (gen !== this.gen) return
    }

    private showRun() {
        this.runner = createPillButton(this, {
            x: RUN.x,
            y: RUN.y,
            w: RUN.w,
            h: RUN.h,
            label: 'VAI!',
            arrow: true,
            onTap: () => {
                if (this.phase !== 'combine' || this.busy) return
                void this.runPlan()
            },
        })
        this.runner.setEnabled(true)
    }

    private async runPlan() {
        const gen = this.gen
        this.phase = 'running'
        this.busy = true
        this.hud.setPhase(2 + this.mission.parts.length)
        this.clearPrompts()

        for (let i = 0; i < this.laneCards.length; i++) {
            const card = this.laneCards[i]
            this.audio.run(i)
            card.setTone('hot')
            FX.popIn(this, card.root, { from: 1.16, duration: 300 })
            await FX.wait(this, 300)
            if (gen !== this.gen) return
            card.setTone('ok')
            await FX.wait(this, 220)
            if (gen !== this.gen) return
        }

        this.awardPhase()
        this.hud.flash(C.ok)

        await this.mergeIntoGoal()
        if (gen !== this.gen) return

        this.hud.fade(0, 320)

        await FX.wait(this, 320)
        if (gen !== this.gen) return

        this.clearWork()
        await this.stage.reveal()
        if (gen !== this.gen) return

        await FX.wait(this, 1800)
        if (gen !== this.gen) return

        if (this.missionIndex + 1 < this.level.missions.length) {
            await this.nextMission()
            return
        }
        this.endLevel()
    }

    /** Faixa e botão saem de cena antes do plano rodar: agora é só o plano. */
    private clearPrompts() {
        this.runner?.destroy()
        this.runner = null
        if (!this.taskBar) return
        this.tweens.killTweensOf(this.taskBar)
        this.tweens.add({
            targets: this.taskBar,
            alpha: 0,
            scale: 0.8,
            duration: FX.ms(this, 260),
            ease: 'Back.easeIn',
        })
        this.taskBar = null
    }

    /**
     * O fecho do nível: as partes prontas convergem para o meio e viram de
     * novo o pedido inteiro que foi partido lá no começo.
     */
    private async mergeIntoGoal() {
        const gen = this.gen
        const jobs = this.laneCards.map((card, i) => new Promise<void>(resolve => {
            this.tweens.add({
                targets: card.root,
                x: LANE.cx,
                y: LANE.cy,
                scale: 0.22,
                alpha: 0,
                delay: FX.ms(this, i * 120),
                duration: FX.ms(this, 520),
                ease: 'Back.easeIn',
                onComplete: () => resolve(),
            })
        }))

        await Promise.race([Promise.all(jobs), FX.wait(this, 1500)])
        if (gen !== this.gen) return

        this.audio.fanfare()
        void FX.sparks(this, LANE.cx, LANE.cy, {
            color: C.warn, count: 26, spread: 230, depth: DEPTH.fx,
        })
        void FX.ping(this, LANE.cx, LANE.cy, C.teal, {
            radius: 170, duration: 640, depth: DEPTH.fx,
        })

        const goal = createCard(this, {
            icon: this.mission.goalIcon,
            label: this.mission.goalLabel,
            w: GOAL.w,
            h: GOAL.h,
        })
        goal.root.setPosition(LANE.cx, LANE.cy).setDepth(DEPTH.card + 1)
        goal.setTone('ok')
        goal.setBadge('check')
        this.keep(goal.root)
        FX.popIn(this, goal.root, { from: 0.24, duration: 460 })

        await FX.wait(this, 1200)
    }

    private async nextMission() {
        const gen = this.gen
        this.missionIndex++
        this.hud.setPhases(2 + this.mission.parts.length)

        this.clearWork()
        this.stage.destroy()
        this.shelf.destroy()
        applySheet(this.mission.sheet, iconOrder(this.mission))
        this.stage = createStage(this, this.mission)
        this.shelf = createShelf(this, this.mission.parts)
        this.hud.fade(1, 320)

        await FX.wait(this, 420)
        if (gen !== this.gen) return
        await this.startSplit()
    }

    // ─────────────────────────────────────────────── erro e pontos

    private reject(card: Card, removeCard = true) {
        this.errors++
        this.phaseErrors++

        runtimeGameBridge.emit({
            type: 'WRONG_ANSWER',
            gameId: GAME_ID,
            pointsEarned: 0,
            stage: this.level.level,
        })
        this.lives.lose()
        this.livesLeft = this.lives.remaining

        this.audio.wrong()
        this.hud.flash(C.bad)
        card.setTone('wrong')
        FX.shake(this, card.root, { amount: 13, times: 3 })

        if (removeCard) {
            this.tweens.add({
                targets: card.root,
                alpha: 0.28,
                scale: 0.92,
                delay: FX.ms(this, 260),
                duration: FX.ms(this, 300),
            })
        } else {
            this.time.delayedCall(FX.ms(this, 700), () => card.setTone('idle'))
        }

        this.emitCheckpoint()
    }

    private awardPhase() {
        this.hits++
        const earned = this.phaseErrors === 0 ? 10 : 5
        this.score += earned
        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER',
            gameId: GAME_ID,
            pointsEarned: earned,
            stage: this.level.level,
        })
        this.emitCheckpoint()
    }

    private endLevel() {
        const gen = ++this.gen
        this.phase = 'done'
        void gen

        runtimeGameBridge.emit({
            type: 'GAME_COMPLETED',
            gameId: GAME_ID,
            stage: this.level.level,
            totalStages: LEVELS.length,
            score: Math.max(0, this.score),
            errors: this.errors,
        })
        this.emitCheckpoint(true)

        const done = this.level.level

        if (done < LEVELS.length) {
            showLevelComplete(this, {
                title: `${this.level.name} pronto!`,
                subtitle: 'Você partiu o pedido, resolveu cada parte e juntou tudo.',
                accent: C.teal,
                panelColor: C.cream,
                overlayColor: C.ink,
                progress: { total: LEVELS.length, current: done, size: 7 },
                autoAdvance: {
                    delay: 2600,
                    label: 'Chegou um pedido novo...',
                    onComplete: () => this.scene.restart({
                        lives: this.livesLeft,
                        level: (done + 1) as LevelNumber,
                        points: this.score,
                    }),
                },
            })
            return
        }

        showLevelComplete(this, {
            title: 'Arquiteto formado!',
            subtitle: 'Todo pedido grande cabe em partes pequenas.',
            accent: C.teal,
            panelColor: C.cream,
            overlayColor: C.ink,
            progress: { total: LEVELS.length, current: LEVELS.length, size: 7 },
            buttons: [
                {
                    label: 'Jogar de novo',
                    color: C.ok,
                    onClick: () => this.scene.restart({
                        lives: this.livesTotal,
                        level: 1,
                        points: 0,
                    }),
                },
                {
                    label: 'Escolher jogo',
                    color: C.cyan,
                    onClick: () => EventBus.emit('exit-game'),
                },
            ],
        })
    }

    // ─────────────────────────────────────────────── tutorial

    private tutorialSteps(): TutorialStep[] {
        const n = this.mission.parts.length
        return [
            {
                text: 'Este pedido é grande demais.',
                shape: 'rect',
                x: GOAL.cx, y: GOAL.top,
                w: GOAL.w + 30, h: GOAL.h + 30,
                balloonX: W / 2, balloonY: 452,
            },
            {
                text: 'Toque nas partes que ele tem dentro.',
                shape: 'rect',
                x: W / 2, y: TRAY.cy,
                w: (TRAY.w + TRAY.gap) * (n + 2), h: TRAY.h + 26,
                balloonX: W / 2, balloonY: 330,
                pointer: {
                    fromX: W / 2, fromY: TRAY.cy,
                    toX: trayX(0, n + 2), toY: TRAY.cy,
                    tap: true,
                },
                buttonLabel: 'Vamos lá!',
            },
        ]
    }

    private runTutorial(once: boolean) {
        return new Promise<void>(resolve => {
            createTutorial(this, {
                key: 'ef15co04-arquiteto',
                once,
                accent: C.warn,
                safeTop: 12,
                steps: this.tutorialSteps(),
                onFinish: () => resolve(),
            })
        })
    }

    private replayTutorial() {
        if (this.phase !== 'split' || this.busy) return
        const gen = this.gen
        this.phase = 'tutorial'
        this.hud.setEnabled(false)

        void this.runTutorial(false).then(() => {
            if (gen !== this.gen) return
            this.phase = 'split'
            this.hud.setEnabled(true)
        })
    }

    // ─────────────────────────────────────────────── plataforma

    private emitCheckpoint(complete = false) {
        const perMission = 2 + this.mission.parts.length
        const total = this.level.missions.length * perMission
        const done = complete
            ? total
            : this.missionIndex * perMission + this.phaseIndex
        runtimeGameBridge.emit({
            type: 'CHECKPOINT',
            gameId: GAME_ID,
            progress: Math.round((done / total) * 100),
            score: Math.max(0, this.score),
            stage: this.level.level,
            hits: this.hits,
            errors: this.errors,
        })
    }

    private bindPlatform() {
        this.unsubPlatform = runtimeGameBridge.onCommand((command: PlatformCommand) => {
            if (command.type === 'START_GAME') {
                this.score = command.points ?? this.score
                if (command.stage && command.stage !== this.level.level) {
                    this.scene.restart({
                        lives: this.livesLeft,
                        level: command.stage,
                        points: this.score,
                    })
                    return
                }
            }
            if (command.type === 'PAUSE_GAME') this.scene.pause()
            if (command.type === 'RESUME_GAME') this.scene.resume()
        })
    }

    private onMute(muted: boolean) {
        this.audio.setMuted(muted)
    }
}
