import Phaser from 'phaser'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import { EventBus } from '../../../../shared/EventBus'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { LEVELS } from '../data/levels'
import { CRITERION } from '../data/criteria'
import { TECH } from '../data/tech'
import { C, A, hex } from '../data/theme'
import { W, H, TOPBAR, HEADER, BRIEF, BOARD, STRIP, BALANCE, PLATE, CHIPS, TEXTS, SIEVE } from '../data/layout'
import type {
    ConstraintPhase,
    CriterionId,
    LevelConfig,
    PhaseConfig,
    TechDef,
    TechId,
} from '../types'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'

const GAME_ID = 'escolha-a-ferramenta-certa'

interface PlateView {
    container: Phaser.GameObjects.Container
    inner: Phaser.GameObjects.Container
    setTotal: (n: number) => void
    setWinner: () => void
    setLoser: () => void
    bump: () => void
    tech: TechDef
}

interface ChipView {
    container: Phaser.GameObjects.Container
    paint: () => void
    setScores: (a: number, b: number) => void
    id: CriterionId
}

interface TutorialSegment {
    key: string
    steps: TutorialStep[]
}

export class GameScene extends Phaser.Scene {
    private lives!: Lives
    private livesTotal = 3
    private livesLeft = 3
    private levelIdx = 0
    private phaseIdx = 0
    private points = 0
    private locked = true
    private ended = false

    private inputBlocker?: Phaser.GameObjects.Rectangle
    private unblockTimer?: Phaser.Time.TimerEvent
    private inputBlockedUntil = 0
    private typeTimer?: Phaser.Time.TimerEvent

    private instructionText?: Phaser.GameObjects.Text
    private subText?: Phaser.GameObjects.Text
    private roundText?: Phaser.GameObjects.Text
    private roundDots?: Phaser.GameObjects.Graphics
    private statusText?: Phaser.GameObjects.Text
    private chipsLabel?: Phaser.GameObjects.Text
    private helpBtn?: Phaser.GameObjects.Container

    private beamLayer?: Phaser.GameObjects.Graphics
    private needleLayer?: Phaser.GameObjects.Graphics
    private leftPlate?: PlateView
    private rightPlate?: PlateView
    private chips: ChipView[] = []
    private active = new Set<CriterionId>()
    private angleState = { v: 0 }
    private angleTween?: Phaser.Tweens.Tween
    private arenaBuilt = false

    private queue: TechId[] = []
    private duelIndex = 0
    private duelTotal = 0
    private pair: [TechId, TechId] = ['celular', 'tablet']
    private duelLocked = true

    private sieveCards = new Map<TechId, Phaser.GameObjects.Container>()
    private sieveLeft = 0
    private sieveScore = 0
    private chipScore = 0

    private tutorialQueue: TutorialSegment[] = []

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; phase?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this, 3)
        this.livesLeft = data?.lives ?? this.livesTotal
        this.levelIdx = (data.level ?? 1) - 1
        this.phaseIdx = data.phase ?? 0
        this.points = data.points ?? 0
        this.locked = true
        this.ended = false

        this.unblockTimer?.remove()
        this.unblockTimer = undefined
        this.inputBlocker?.destroy()
        this.inputBlocker = undefined
        this.inputBlockedUntil = 0
        this.typeTimer?.remove()
        this.typeTimer = undefined

        this.leftPlate = undefined
        this.rightPlate = undefined
        this.beamLayer = undefined
        this.needleLayer = undefined
        this.chips = []
        this.active = new Set()
        this.angleState = { v: 0 }
        this.angleTween = undefined
        this.arenaBuilt = false

        this.queue = []
        this.duelIndex = 0
        this.duelTotal = 0
        this.duelLocked = true

        this.sieveCards = new Map()
        this.sieveLeft = 0
        this.sieveScore = 0
        this.chipScore = 0
        this.tutorialQueue = []
    }

    private get level(): LevelConfig {
        return LEVELS[this.levelIdx]
    }

    /**
     * Progresso por nível concluído. Não afeta a nota: serve para a
     * plataforma mostrar andamento e para diagnosticar partidas.
     */
    private emitCheckpoint() {
        runtimeGameBridge.emit({
            type: 'CHECKPOINT',
            gameId: GAME_ID,
            progress: Math.round(((this.levelIdx + 1) / LEVELS.length) * 100),
            score: Math.max(0, this.points),
            stage: this.level.level,
        })
    }

    private get phase(): PhaseConfig {
        return this.level.phases[this.phaseIdx]
    }

    create() {
        this.drawBackground()
        this.buildHeader()
        this.buildStrip()
        this.buildBrief()

        if (this.phase.kind === 'restricao') this.buildSieve(this.phase)
        else this.beginTournament([...this.phase.options])

        this.fadeIn()

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })

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

    update() {
        if (!this.beamLayer) return
        let a = this.angleState.v
        if (this.active.size === 0 && !this.duelLocked) a += Math.sin(this.time.now / 560) * 0.02
        this.drawBalance(a)
    }

    private fadeIn() {
        const veil = this.add.rectangle(W / 2, H / 2, W, H, C.tealDark, 1).setDepth(900)
        this.tweens.add({
            targets: veil,
            alpha: 0,
            duration: 340,
            ease: 'Sine.easeOut',
            onComplete: () => veil.destroy(),
        })
    }

    private drawBackground() {
        const bg = this.add.image(W / 2, H / 2, 'bg-oficina').setDepth(-3)
        bg.setScale(Math.max(W / bg.width, H / bg.height))

        const veil = this.add.graphics().setDepth(-2)
        veil.fillStyle(C.sky, A.veil)
        veil.fillRect(0, 0, W, H)
    }

    private buildHeader() {
        const bar = this.add.graphics().setDepth(40)
        bar.fillStyle(C.white, 0.96)
        bar.fillRect(0, 0, W, TOPBAR)
        bar.lineStyle(3, C.border, 1)
        bar.lineBetween(0, TOPBAR, W, TOPBAR)

        const pill = this.add.graphics().setDepth(41)
        pill.fillStyle(C.teal, 1)
        pill.fillRoundedRect(HEADER.pillX, HEADER.pillY - HEADER.pillH / 2, HEADER.pillW, HEADER.pillH, HEADER.pillH / 2)
        pill.fillStyle(C.white, A.gloss)
        pill.fillRoundedRect(HEADER.pillX + 7, HEADER.pillY - HEADER.pillH / 2 + 6, HEADER.pillW - 14, 12, 6)

        this.add.text(HEADER.pillX + HEADER.pillW / 2, HEADER.pillY, `NÍVEL ${this.level.level}`, {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
            fontSize: '20px',
            color: '#ffffff',
        }).setOrigin(0.5).setResolution(2).setDepth(42)

        const dots = this.add.graphics().setDepth(41)
        this.level.phases.forEach((_, i) => {
            const x = HEADER.dotsX + i * HEADER.dotGap
            const done = i < this.phaseIdx
            const now = i === this.phaseIdx
            dots.fillStyle(now ? C.teal : done ? C.green : C.grey, now || done ? 1 : 0.45)
            if (now) dots.fillRoundedRect(x - 15, HEADER.dotsY - HEADER.dotR, 30, HEADER.dotR * 2, HEADER.dotR)
            else dots.fillCircle(x, HEADER.dotsY, HEADER.dotR)
        })

        const lastDot = HEADER.dotsX + (this.level.phases.length - 1) * HEADER.dotGap
        this.add.text(lastDot + 30, HEADER.dotsY, `pedido ${this.phaseIdx + 1} de ${this.level.phases.length}`, {
            fontFamily: 'DynaPuff, Arial, sans-serif',
            fontStyle: 'bold',
            fontSize: '17px',
            color: hex(C.inkSoft),
        }).setOrigin(0, 0.5).setResolution(2).setDepth(41)

        this.helpBtn = this.buildHelpButton()
        this.helpBtn.setVisible(false)
    }

    private buildHelpButton() {
        const btn = this.add.container(HEADER.helpX, HEADER.helpY).setDepth(42)
        const g = this.add.graphics()
        g.fillStyle(C.shadow, 0.2)
        g.fillCircle(0, 6, HEADER.helpR)
        g.fillStyle(C.teal, 1)
        g.fillCircle(0, 0, HEADER.helpR)
        g.fillStyle(C.white, A.gloss)
        g.fillEllipse(0, -10, 30, 13)

        const t = this.add.text(0, 0, '?', {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
            fontSize: '27px',
            color: '#ffffff',
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

    private buildStrip() {
        const g = this.add.graphics()
        g.fillStyle(C.white, 0.94)
        g.fillRoundedRect(STRIP.x, STRIP.y, STRIP.w, STRIP.h, 18)
        g.lineStyle(3, C.border, 1)
        g.strokeRoundedRect(STRIP.x, STRIP.y, STRIP.w, STRIP.h, 18)
        g.fillStyle(C.teal, 1)
        g.fillRoundedRect(STRIP.x + 10, STRIP.y + 12, 6, STRIP.h - 24, 3)

        this.instructionText = this.add.text(STRIP.textX + 6, STRIP.y + STRIP.h / 2, this.phase.instruction, {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
            fontSize: '22px',
            color: hex(C.tealDark),
        }).setOrigin(0, 0.5).setResolution(2)

        this.roundDots = this.add.graphics()
        this.roundText = this.add.text(STRIP.roundX, STRIP.y + STRIP.h / 2, '', {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
            fontSize: '18px',
            color: hex(C.inkSoft),
        }).setOrigin(1, 0.5).setResolution(2)

        this.subText = this.add.text(BOARD.cx, TEXTS.subY, this.phase.sub, {
            fontFamily: 'DynaPuff, Arial, sans-serif',
            fontStyle: 'bold',
            fontSize: '18px',
            color: hex(C.inkSoft),
            align: 'center',
            wordWrap: { width: 820 },
        }).setOrigin(0.5).setResolution(2)
    }

    private paintRounds() {
        if (!this.roundDots || !this.roundText) return
        this.roundDots.clear()

        if (this.duelTotal <= 1) {
            this.roundText.setText('')
            return
        }

        this.roundText.setText(`disputa ${this.duelIndex} de ${this.duelTotal}`)
        const right = this.roundText.x - this.roundText.width - 14
        for (let i = 0; i < this.duelTotal; i++) {
            const x = right - (this.duelTotal - 1 - i) * 22
            const done = i + 1 < this.duelIndex
            const now = i + 1 === this.duelIndex
            this.roundDots.fillStyle(now ? C.teal : done ? C.green : C.grey, now || done ? 1 : 0.4)
            this.roundDots.fillCircle(x, STRIP.y + STRIP.h / 2, 7)
        }
    }

    private buildBrief() {
        const p = this.phase
        this.card(BRIEF.x, BRIEF.y, BRIEF.w, BRIEF.h, 26, C.panel)

        const tag = this.add.graphics()
        tag.fillStyle(C.tealSoft, 1)
        tag.fillRoundedRect(BRIEF.cx - 92, BRIEF.tagY - 18, 184, 36, 18)
        this.add.text(BRIEF.cx, BRIEF.tagY, 'PEDIDO DA ESCOLA', {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
            fontSize: '16px',
            color: hex(C.tealDark),
        }).setOrigin(0.5).setResolution(2)

        const frame = this.add.graphics()
        frame.fillStyle(C.greySoft, 1)
        frame.fillRoundedRect(BRIEF.cx - BRIEF.sceneW / 2, BRIEF.sceneY - BRIEF.sceneH / 2, BRIEF.sceneW, BRIEF.sceneH, 20)
        frame.lineStyle(3, C.border, 1)
        frame.strokeRoundedRect(BRIEF.cx - BRIEF.sceneW / 2, BRIEF.sceneY - BRIEF.sceneH / 2, BRIEF.sceneW, BRIEF.sceneH, 20)

        const scene = this.add.image(BRIEF.cx, BRIEF.sceneY, p.brief.scene)
        scene.setScale(Math.min((BRIEF.sceneW - 14) / scene.width, (BRIEF.sceneH - 14) / scene.height))
        const full = scene.scale
        scene.setScale(full * 0.86).setAlpha(0)
        this.tweens.add({ targets: scene, alpha: 1, scale: full, duration: 520, ease: 'Back.easeOut' })

        const caller = this.add.text(BRIEF.cx, BRIEF.callerY, p.brief.caller, {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
            fontSize: '22px',
            color: hex(C.ink),
            align: 'center',
            wordWrap: { width: BRIEF.w - 44 },
        }).setOrigin(0.5).setResolution(2)

        const role = this.add.text(BRIEF.cx, BRIEF.roleY, p.brief.role, {
            fontFamily: 'DynaPuff, Arial, sans-serif',
            fontStyle: 'bold',
            fontSize: '17px',
            color: hex(C.inkSoft),
            align: 'center',
            wordWrap: { width: BRIEF.w - 44 },
        }).setOrigin(0.5).setResolution(2)

        caller.setAlpha(0).setY(BRIEF.callerY + 10)
        role.setAlpha(0).setY(BRIEF.roleY + 10)
        this.tweens.add({ targets: caller, alpha: 1, y: BRIEF.callerY, duration: 320, delay: 240, ease: 'Sine.easeOut' })
        this.tweens.add({ targets: role, alpha: 1, y: BRIEF.roleY, duration: 320, delay: 320, ease: 'Sine.easeOut' })

        const quote = this.add.text(BRIEF.cx, BRIEF.textY, '', {
            fontFamily: 'DynaPuff, Arial, sans-serif',
            fontStyle: 'bold',
            fontSize: '20px',
            color: hex(C.tealDark),
            align: 'center',
            wordWrap: { width: BRIEF.w - 54 },
        }).setOrigin(0.5, 0).setResolution(2)

        const caret = this.add.graphics()
        const drawCaret = (x: number, y: number, h: number) => {
            caret.clear()
            caret.fillStyle(C.teal, 1)
            caret.fillRect(x, y, 3, h)
        }

        this.typeText(quote, `"${p.brief.text}"`, 520, () => {
            drawCaret(quote.x + quote.width / 2 + 4, quote.y + quote.height - 24, 20)
        }, () => caret.destroy())

        if (p.kind !== 'restricao') return

        this.add.text(BRIEF.cx, BRIEF.ruleTitleY, 'REGRAS DESTE PEDIDO', {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
            fontSize: '17px',
            color: hex(C.amber),
        }).setOrigin(0.5).setResolution(2)

        p.restrictions.forEach((rule, i) => {
            const y = BRIEF.ruleFirstY + i * BRIEF.ruleGap
            const g = this.add.graphics()
            g.fillStyle(C.amberSoft, 1)
            g.fillRoundedRect(BRIEF.cx - BRIEF.ruleW / 2, y - BRIEF.ruleH / 2, BRIEF.ruleW, BRIEF.ruleH, 14)
            g.lineStyle(2, C.amber, 1)
            g.strokeRoundedRect(BRIEF.cx - BRIEF.ruleW / 2, y - BRIEF.ruleH / 2, BRIEF.ruleW, BRIEF.ruleH, 14)

            const label = this.add.text(BRIEF.cx, y - 9, rule.label, {
                fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
                fontSize: '17px',
                color: hex(C.ink),
            }).setOrigin(0.5).setResolution(2)

            const detail = this.add.text(BRIEF.cx, y + 11, rule.detail, {
                fontFamily: 'DynaPuff, Arial, sans-serif',
                fontStyle: 'bold',
                fontSize: '14px',
                color: hex(C.inkSoft),
                align: 'center',
                wordWrap: { width: BRIEF.ruleW - 20 },
            }).setOrigin(0.5).setResolution(2)

            const parts = [g, label, detail]
            parts.forEach(o => o.setAlpha(0))
            this.tweens.add({ targets: parts, alpha: 1, duration: 320, delay: 1000 + i * 200 })
        })
    }

    private buildSieve(p: ConstraintPhase) {
        this.sieveLeft = p.blocked.length
        this.statusText = this.add.text(BOARD.cx, SIEVE.statusY, '', {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
            fontSize: '20px',
            color: hex(C.amber),
        }).setOrigin(0.5).setResolution(2)
        this.updateSieveStatus()

        p.options.forEach((id, i) => {
            const col = i % 2
            const row = Math.floor(i / 2)
            const x = SIEVE.cx + (col === 0 ? -1 : 1) * (SIEVE.cardW + SIEVE.gapX) / 2
            const y = SIEVE.cy + (row === 0 ? -1 : 1) * (SIEVE.cardH + SIEVE.gapY) / 2
            const card = this.buildSieveCard(id, x, y)
            this.sieveCards.set(id, card)

            card.setAlpha(0).setScale(0.72).setY(y - 40)
            this.tweens.add({
                targets: card,
                alpha: 1,
                scale: 1,
                y,
                delay: 110 * i,
                duration: 560,
                ease: 'Bounce.easeOut',
            })
        })
    }

    private buildSieveCard(id: TechId, x: number, y: number) {
        const tech = TECH[id]
        const w = SIEVE.cardW
        const h = SIEVE.cardH
        const card = this.add.container(x, y)

        const g = this.add.graphics()
        const paint = (line: number, width: number) => {
            g.clear()
            g.fillStyle(C.shadow, A.shadow)
            g.fillRoundedRect(-w / 2 + 4, -h / 2 + 10, w, h, 22)
            g.fillStyle(C.panel, 1)
            g.fillRoundedRect(-w / 2, -h / 2, w, h, 22)
            g.lineStyle(width, line, 1)
            g.strokeRoundedRect(-w / 2, -h / 2, w, h, 22)
        }
        paint(C.border, 3)

        const img = this.add.image(0, -24, tech.texture)
        img.setScale(Math.min(SIEVE.imgBox / img.width, SIEVE.imgBox / img.height))

        const name = this.add.text(0, 62, tech.name, {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
            fontSize: '21px',
            color: hex(C.ink),
            align: 'center',
            wordWrap: { width: w - 30 },
        }).setOrigin(0.5).setResolution(2)

        const hit = this.add.rectangle(0, 0, w, h, C.white, 0.001)
        hit.setInteractive({ useHandCursor: true })
        hit.on('pointerover', () => paint(C.teal, 4))
        hit.on('pointerout', () => paint(C.border, 3))
        hit.on('pointerdown', () => this.onSievePick(id))

        card.add([g, img, name, hit])
        card.setData('paint', paint)
        return card
    }

    private onSievePick(id: TechId) {
        const p = this.phase
        if (this.isInputBlocked() || this.locked || p.kind !== 'restricao') return

        const card = this.sieveCards.get(id)
        if (!card) return

        const blocked = p.blocked.find(b => b.id === id)
        const paint = card.getData('paint') as (line: number, width: number) => void

        if (!blocked) {
            paint(C.teal, 5)
            this.tweens.add({ targets: card, x: card.x + 10, duration: 60, yoyo: true, repeat: 2 })
            this.time.delayedCall(600, () => paint(C.border, 3))
            this.toast(p.keepReason[id] ?? 'Este pode ficar.', C.teal)
            return
        }

        card.disableInteractive()
        card.list.forEach(child => {
            const target = child as Phaser.GameObjects.Rectangle
            if (target.disableInteractive) target.disableInteractive()
        })

        this.sieveLeft--
        this.sieveScore += 5
        paint(C.green, 6)
        this.toast(blocked.reason, C.green)

        this.tweens.add({
            targets: card,
            y: H + 240,
            angle: 24,
            alpha: 0.15,
            duration: 660,
            ease: 'Back.easeIn',
            onComplete: () => card.destroy(),
        })

        this.updateSieveStatus()
        if (this.sieveLeft > 0) return

        this.time.delayedCall(760, () => {
            this.statusText?.destroy()
            this.sieveCards.forEach((c, key) => {
                if (p.blocked.some(b => b.id === key)) return
                this.tweens.add({ targets: c, alpha: 0, scale: 0.7, duration: 280, onComplete: () => c.destroy() })
            })
            const survivors = p.options.filter(o => !p.blocked.some(b => b.id === o))
            this.time.delayedCall(320, () => {
                this.beginTournament(survivors)
                this.locked = false
            })
        })
    }

    private updateSieveStatus() {
        if (!this.statusText) return
        this.statusText.setText(this.sieveLeft === 1 ? 'Ainda falta tirar 1.' : `Ainda faltam tirar ${this.sieveLeft}.`)
        this.tweens.add({ targets: this.statusText, scale: 1.12, duration: 140, yoyo: true })
    }

    private beginTournament(list: TechId[]) {
        this.queue = list
        this.duelTotal = Math.max(1, list.length - 1)
        this.duelIndex = 0
        this.buildArena()
        this.nextDuel(list[0], list[1])
    }

    private nextDuel(a: TechId, b: TechId) {
        this.duelIndex++
        this.pair = [a, b]
        this.active.clear()
        this.chips.forEach(chip => {
            chip.setScores(TECH[a].scores[chip.id], TECH[b].scores[chip.id])
            chip.paint()
        })

        this.angleTween?.stop()
        this.angleState.v = 0
        this.paintRounds()

        this.leftPlate?.container.destroy()
        this.rightPlate?.container.destroy()
        this.leftPlate = this.buildPlate(TECH[a], -1)
        this.rightPlate = this.buildPlate(TECH[b], 1)
        this.duelLocked = false
    }

    private buildArena() {
        if (this.arenaBuilt) return
        this.arenaBuilt = true

        const stand = this.add.graphics().setDepth(1)
        stand.fillStyle(C.metalDark, 1)
        stand.fillRoundedRect(BALANCE.pivotX - BALANCE.baseW / 2, BALANCE.standBottom, BALANCE.baseW, BALANCE.baseH, 10)
        stand.fillStyle(C.metalDark, 0.5)
        stand.fillEllipse(BALANCE.pivotX, BALANCE.standBottom + BALANCE.baseH + 8, BALANCE.baseW * 1.1, 16)
        stand.fillStyle(C.metal, 1)
        stand.fillRoundedRect(BALANCE.pivotX - BALANCE.standW / 2, BALANCE.pivotY, BALANCE.standW, BALANCE.standBottom - BALANCE.pivotY + 6, 14)
        stand.fillStyle(C.white, A.gloss)
        stand.fillRoundedRect(BALANCE.pivotX - BALANCE.standW / 2 + 6, BALANCE.pivotY + 14, 7, BALANCE.standBottom - BALANCE.pivotY - 28, 4)

        const arc = this.add.graphics().setDepth(2)
        arc.lineStyle(3, C.metal, 0.55)
        arc.beginPath()
        arc.arc(BALANCE.pivotX, BALANCE.pivotY, BALANCE.arcR, Phaser.Math.DegToRad(206), Phaser.Math.DegToRad(334))
        arc.strokePath()
        for (let i = -2; i <= 2; i++) {
            const ang = Phaser.Math.DegToRad(270 + i * 16)
            const x1 = BALANCE.pivotX + Math.cos(ang) * (BALANCE.arcR - 7)
            const y1 = BALANCE.pivotY + Math.sin(ang) * (BALANCE.arcR - 7)
            const x2 = BALANCE.pivotX + Math.cos(ang) * (BALANCE.arcR + 6)
            const y2 = BALANCE.pivotY + Math.sin(ang) * (BALANCE.arcR + 6)
            arc.lineStyle(i === 0 ? 5 : 3, i === 0 ? C.teal : C.metal, i === 0 ? 1 : 0.6)
            arc.lineBetween(x1, y1, x2, y2)
        }

        this.beamLayer = this.add.graphics().setDepth(3)
        this.needleLayer = this.add.graphics().setDepth(7)

        const pivot = this.add.graphics().setDepth(6)
        pivot.fillStyle(C.tealDark, 1)
        pivot.fillCircle(BALANCE.pivotX, BALANCE.pivotY, 21)
        pivot.fillStyle(C.white, A.gloss)
        pivot.fillEllipse(BALANCE.pivotX, BALANCE.pivotY - 8, 24, 10)

        this.chipsLabel?.setVisible(true)
        this.buildChips()
    }

    private buildChips() {
        const ids = this.phase.chips
        const total = ids.length * CHIPS.w + (ids.length - 1) * CHIPS.gap
        const startX = BOARD.cx - total / 2 + CHIPS.w / 2

        this.chips = ids.map((id, i) => {
            const chip = this.buildChip(id, startX + i * (CHIPS.w + CHIPS.gap), CHIPS.rowY)
            chip.container.setAlpha(0).setY(CHIPS.rowY + 46)
            this.tweens.add({
                targets: chip.container,
                alpha: 1,
                y: CHIPS.rowY,
                delay: 180 + i * 110,
                duration: 480,
                ease: 'Back.easeOut',
            })
            return chip
        })
    }

    private buildChip(id: CriterionId, x: number, y: number): ChipView {
        const def = CRITERION[id]
        const w = CHIPS.w
        const h = CHIPS.h
        const container = this.add.container(x, y).setDepth(10)
        const g = this.add.graphics()
        const arrow = this.add.graphics()
        let a = 0
        let b = 0

        const label = this.add.text(0, CHIPS.titleDY, def.label, {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
            fontSize: '19px',
            color: hex(C.ink),
            align: 'center',
            wordWrap: { width: w - 24 },
        }).setOrigin(0.5).setResolution(2)

        const hint = this.add.text(0, CHIPS.valueDY, 'toque para usar', {
            fontFamily: 'DynaPuff, Arial, sans-serif',
            fontStyle: 'bold',
            fontSize: '17px',
            color: hex(C.inkSoft),
        }).setOrigin(0.5).setResolution(2)

        const leftNum = this.add.text(-64, CHIPS.valueDY, '', {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
            fontSize: '25px',
            color: hex(C.ink),
        }).setOrigin(0.5).setResolution(2)

        const rightNum = this.add.text(64, CHIPS.valueDY, '', {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
            fontSize: '25px',
            color: hex(C.ink),
        }).setOrigin(0.5).setResolution(2)

        const paint = () => {
            const on = this.active.has(id)
            g.clear()
            g.fillStyle(C.shadow, 0.18)
            g.fillRoundedRect(-w / 2, -h / 2 + 6, w, h, 20)
            g.fillStyle(on ? C.tealSoft : C.panel, 1)
            g.fillRoundedRect(-w / 2, -h / 2, w, h, 20)
            g.fillStyle(C.white, on ? 0.5 : 0.7)
            g.fillRoundedRect(-w / 2 + 8, -h / 2 + 7, w - 16, 14, 7)
            g.lineStyle(on ? 4 : 3, on ? C.teal : C.border, 1)
            g.strokeRoundedRect(-w / 2, -h / 2, w, h, 20)

            label.setColor(hex(on ? C.tealDark : C.ink))
            hint.setVisible(!on)
            leftNum.setVisible(on)
            rightNum.setVisible(on)
            arrow.clear()

            if (!on) return

            leftNum.setText(`${a}`)
            rightNum.setText(`${b}`)
            leftNum.setColor(hex(a > b ? C.green : a < b ? C.grey : C.inkSoft))
            rightNum.setColor(hex(b > a ? C.green : b < a ? C.grey : C.inkSoft))
            leftNum.setScale(a >= b ? 1.12 : 0.92)
            rightNum.setScale(b >= a ? 1.12 : 0.92)

            const tone = a === b ? C.inkSoft : C.teal
            arrow.fillStyle(tone, 1)
            if (a > b) arrow.fillTriangle(-14, CHIPS.valueDY, 6, CHIPS.valueDY - 11, 6, CHIPS.valueDY + 11)
            else if (b > a) arrow.fillTriangle(14, CHIPS.valueDY, -6, CHIPS.valueDY - 11, -6, CHIPS.valueDY + 11)
            else {
                arrow.fillRoundedRect(-14, CHIPS.valueDY - 4, 28, 4, 2)
                arrow.fillRoundedRect(-14, CHIPS.valueDY + 3, 28, 4, 2)
            }
        }

        const setScores = (na: number, nb: number) => {
            a = na
            b = nb
        }

        const hit = this.add.rectangle(0, 0, w, h, C.white, 0.001)
        hit.setInteractive({ useHandCursor: true })
        hit.on('pointerdown', () => {
            if (this.isInputBlocked() || this.locked || this.duelLocked) return
            this.tweens.add({ targets: container, scale: 0.94, duration: 90, yoyo: true, ease: 'Sine.easeOut' })
            this.toggleChip(id, container.x, container.y)
        })

        container.add([g, label, hint, leftNum, rightNum, arrow, hit])
        paint()

        return { container, paint, setScores, id }
    }

    private toggleChip(id: CriterionId, fromX: number, fromY: number) {
        const on = this.active.has(id)
        if (on) this.active.delete(id)
        else {
            this.active.add(id)
            this.flyWeight(id, fromX, fromY)
        }
        this.chips.forEach(chip => chip.paint())
        this.applyTilt()
    }

    private flyWeight(id: CriterionId, fromX: number, fromY: number) {
        const left = TECH[this.pair[0]].scores[id]
        const right = TECH[this.pair[1]].scores[id]
        if (left === right) return

        const target = left > right ? this.leftPlate : this.rightPlate
        if (!target) return

        const puck = this.add.container(fromX, fromY).setDepth(20)
        const g = this.add.graphics()
        g.fillStyle(C.shadow, 0.25)
        g.fillRoundedRect(-38, -18, 76, 40, 13)
        g.fillStyle(C.teal, 1)
        g.fillRoundedRect(-38, -22, 76, 40, 13)
        g.fillStyle(C.white, A.gloss)
        g.fillRoundedRect(-32, -17, 64, 12, 6)

        const t = this.add.text(0, -2, `${Math.max(left, right)}`, {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
            fontSize: '24px',
            color: '#ffffff',
        }).setOrigin(0.5).setResolution(2)
        puck.add([g, t])

        const tx = target.container.x
        const ty = target.container.y - 60

        this.tweens.add({ targets: puck, x: tx, duration: 480, ease: 'Sine.easeInOut' })
        this.tweens.add({ targets: puck, angle: 360, duration: 480, ease: 'Sine.easeInOut' })
        this.tweens.add({
            targets: puck,
            y: ty,
            duration: 480,
            ease: 'Quad.easeOut',
            onComplete: () => {
                target.bump()
                this.tweens.add({
                    targets: puck,
                    alpha: 0,
                    scale: 1.5,
                    duration: 200,
                    onComplete: () => puck.destroy(),
                })
            },
        })
    }

    private applyTilt() {
        const [a, b] = this.pair
        let left = 0
        let right = 0
        this.active.forEach(id => {
            left += TECH[a].scores[id]
            right += TECH[b].scores[id]
        })

        this.leftPlate?.setTotal(left)
        this.rightPlate?.setTotal(right)

        const span = Math.max(1, this.active.size * 5)
        const ratio = Phaser.Math.Clamp((left - right) / span, -1, 1)
        const target = -ratio * Phaser.Math.DegToRad(BALANCE.maxTilt)

        this.angleTween?.stop()
        this.angleTween = this.tweens.add({
            targets: this.angleState,
            v: target,
            duration: 620,
            ease: 'Back.easeOut',
        })
    }

    private buildPlate(tech: TechDef, side: number): PlateView {
        const container = this.add.container(BALANCE.pivotX + side * BALANCE.beamHalf, BALANCE.pivotY + BALANCE.chainLen).setDepth(4)
        const inner = this.add.container(0, 0)

        const plate = this.add.graphics()
        plate.fillStyle(C.metalDark, 1)
        plate.fillRoundedRect(-BALANCE.plateW / 2, 2, BALANCE.plateW, BALANCE.plateH, 7)
        plate.fillStyle(C.metal, 1)
        plate.fillRoundedRect(-BALANCE.plateW / 2, -BALANCE.plateH / 2, BALANCE.plateW, BALANCE.plateH, 7)
        plate.fillStyle(C.white, A.gloss)
        plate.fillRoundedRect(-BALANCE.plateW / 2 + 10, -BALANCE.plateH / 2 + 3, BALANCE.plateW - 20, 5, 3)

        const cardCy = -PLATE.cardLift - PLATE.cardH / 2
        const cardG = this.add.graphics()
        const paintCard = (line: number, width: number, fill = C.panel) => {
            cardG.clear()
            cardG.fillStyle(C.shadow, A.shadow)
            cardG.fillRoundedRect(-PLATE.cardW / 2 + 4, cardCy - PLATE.cardH / 2 + 8, PLATE.cardW, PLATE.cardH, 22)
            cardG.fillStyle(fill, 1)
            cardG.fillRoundedRect(-PLATE.cardW / 2, cardCy - PLATE.cardH / 2, PLATE.cardW, PLATE.cardH, 22)
            cardG.fillStyle(C.white, 0.5)
            cardG.fillRoundedRect(-PLATE.cardW / 2 + 10, cardCy - PLATE.cardH / 2 + 8, PLATE.cardW - 20, 16, 8)
            cardG.lineStyle(width, line, 1)
            cardG.strokeRoundedRect(-PLATE.cardW / 2, cardCy - PLATE.cardH / 2, PLATE.cardW, PLATE.cardH, 22)
        }
        paintCard(C.border, 3)

        const img = this.add.image(0, cardCy + PLATE.imgDY, tech.texture)
        img.setScale(Math.min(PLATE.imgBox / img.width, PLATE.imgBox / img.height))

        const name = this.add.text(0, cardCy + PLATE.nameDY, tech.name, {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
            fontSize: '20px',
            color: hex(C.ink),
            align: 'center',
            wordWrap: { width: PLATE.cardW - 26 },
        }).setOrigin(0.5).setResolution(2)

        const badgeG = this.add.graphics()
        badgeG.fillStyle(C.shadow, 0.22)
        badgeG.fillCircle(0, 6, PLATE.totalR)
        badgeG.fillStyle(C.tealDark, 1)
        badgeG.fillCircle(0, 0, PLATE.totalR)
        badgeG.fillStyle(C.white, A.gloss)
        badgeG.fillEllipse(0, -10, 28, 11)

        const badge = this.add.text(0, 0, '0', {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
            fontSize: '25px',
            color: '#ffffff',
        }).setOrigin(0.5).setResolution(2)

        const ribbon = this.add.container(0, cardCy - PLATE.cardH / 2 - 4).setAlpha(0)
        const ribbonG = this.add.graphics()
        ribbonG.fillStyle(C.green, 1)
        ribbonG.fillRoundedRect(-78, -17, 156, 34, 17)
        ribbonG.fillStyle(C.white, A.gloss)
        ribbonG.fillRoundedRect(-72, -13, 144, 11, 6)
        const ribbonT = this.add.text(0, 0, 'ESCOLHIDA', {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
            fontSize: '16px',
            color: '#ffffff',
        }).setOrigin(0.5).setResolution(2)
        ribbon.add([ribbonG, ribbonT])

        const hit = this.add.rectangle(0, cardCy, PLATE.cardW, PLATE.cardH + 44, C.white, 0.001)
        hit.setInteractive({ useHandCursor: true })
        hit.on('pointerover', () => { if (!this.duelLocked) paintCard(C.teal, 5) })
        hit.on('pointerout', () => { if (!this.duelLocked) paintCard(C.border, 3) })
        hit.on('pointerdown', () => this.onPlatePick(tech.id))

        inner.add([plate, cardG, img, name, badgeG, badge, ribbon, hit])
        container.add(inner)

        inner.setAlpha(0).setY(-150)
        this.tweens.add({ targets: inner, y: 0, alpha: 1, duration: 680, ease: 'Bounce.easeOut' })

        return {
            container,
            inner,
            tech,
            setTotal: (n: number) => {
                badge.setText(`${n}`)
                this.tweens.add({ targets: badge, scale: 1.3, duration: 130, yoyo: true })
            },
            setWinner: () => {
                paintCard(C.green, 6, C.greenSoft)
                this.tweens.add({ targets: ribbon, alpha: 1, y: ribbon.y - 8, duration: 260, ease: 'Back.easeOut' })
                this.tweens.add({ targets: inner, scale: 1.07, duration: 200, yoyo: true })
            },
            setLoser: () => {
                paintCard(C.border, 3)
                this.tweens.add({ targets: inner, alpha: 0.42, scale: 0.94, duration: 260 })
            },
            bump: () => {
                this.tweens.add({ targets: inner, scaleY: 0.94, scaleX: 1.05, duration: 110, yoyo: true, ease: 'Sine.easeOut' })
            },
        }
    }

    private onPlatePick(id: TechId) {
        if (this.isInputBlocked() || this.locked || this.duelLocked) return
        this.duelLocked = true

        const winner = this.leftPlate?.tech.id === id ? this.leftPlate : this.rightPlate
        const loser = this.leftPlate?.tech.id === id ? this.rightPlate : this.leftPlate
        winner?.setWinner()
        loser?.setLoser()

        const isLast = this.duelIndex >= this.duelTotal
        this.time.delayedCall(900, () => {
            if (isLast) this.openJustify(id)
            else this.nextDuel(id, this.queue[this.duelIndex + 1])
        })
    }

    private drawBalance(angle: number) {
        const g = this.beamLayer!
        const cos = Math.cos(angle)
        const sin = Math.sin(angle)
        const lx = BALANCE.pivotX - BALANCE.beamHalf * cos
        const ly = BALANCE.pivotY - BALANCE.beamHalf * sin
        const rx = BALANCE.pivotX + BALANCE.beamHalf * cos
        const ry = BALANCE.pivotY + BALANCE.beamHalf * sin

        g.clear()
        g.lineStyle(BALANCE.beamH, C.metalDark, 1)
        g.lineBetween(lx, ly + 4, rx, ry + 4)
        g.lineStyle(BALANCE.beamH - 6, C.metal, 1)
        g.lineBetween(lx, ly, rx, ry)

        const rope = (hx: number, hy: number) => {
            const py = hy + BALANCE.chainLen
            g.lineStyle(3, C.metalDark, 0.9)
            g.lineBetween(hx, hy, hx - BALANCE.plateW / 2 + 16, py)
            g.lineBetween(hx, hy, hx + BALANCE.plateW / 2 - 16, py)
            g.fillStyle(C.metalDark, 1)
            g.fillCircle(hx, hy, 8)
        }
        rope(lx, ly)
        rope(rx, ry)

        this.leftPlate?.container.setPosition(lx, ly + BALANCE.chainLen)
        this.rightPlate?.container.setPosition(rx, ry + BALANCE.chainLen)

        const n = this.needleLayer!
        const na = angle - Math.PI / 2
        const tipX = BALANCE.pivotX + Math.cos(na) * (BALANCE.arcR - 12)
        const tipY = BALANCE.pivotY + Math.sin(na) * (BALANCE.arcR - 12)
        n.clear()
        n.lineStyle(6, C.tealDark, 1)
        n.lineBetween(BALANCE.pivotX, BALANCE.pivotY, tipX, tipY)
        n.fillStyle(C.teal, 1)
        n.fillCircle(tipX, tipY, 8)
        n.fillStyle(C.white, 1)
        n.fillCircle(BALANCE.pivotX, BALANCE.pivotY, 7)
    }

    private openJustify(chosen: TechId) {
        EventBus.emit('timer-stop')

        const overlay = this.add.rectangle(W / 2, H / 2, W, H, C.shadow, A.overlay).setDepth(300).setInteractive()
        const modal = this.add.container(W / 2, H / 2).setDepth(301)

        const ids = this.phase.chips
        const rows = Math.ceil(ids.length / 2)
        const PH = 210 + rows * 92
        const top = -PH / 2

        const bg = this.add.graphics()
        bg.fillStyle(C.shadow, 0.22)
        bg.fillRoundedRect(-380, top + 12, 760, PH, 30)
        bg.fillStyle(C.panel, 1)
        bg.fillRoundedRect(-380, top, 760, PH, 30)
        bg.lineStyle(4, C.teal, 1)
        bg.strokeRoundedRect(-380, top, 760, PH, 30)
        bg.fillStyle(C.teal, 1)
        bg.fillRoundedRect(-150, top - 13, 300, 24, 12)

        const title = this.add.text(0, top + 58, 'O que mais te fez escolher?', {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
            fontSize: '28px',
            color: hex(C.tealDark),
            align: 'center',
            wordWrap: { width: 660 },
        }).setOrigin(0.5).setResolution(2)

        const pickIcon = this.add.image(-120, top + 106, TECH[chosen].texture)
        pickIcon.setScale(Math.min(44 / pickIcon.width, 44 / pickIcon.height))

        const sub = this.add.text(-88, top + 106, `Você escolheu: ${TECH[chosen].name}`, {
            fontFamily: 'DynaPuff, Arial, sans-serif',
            fontStyle: 'bold',
            fontSize: '20px',
            color: hex(C.inkSoft),
        }).setOrigin(0, 0.5).setResolution(2)

        const buttons = ids.map((id, i) => {
            const col = i % 2
            const row = Math.floor(i / 2)
            const x = ids.length === 1 ? 0 : col === 0 ? -170 : 170
            const y = top + 186 + row * 92
            const btn = this.button(x, y, 316, 76, CRITERION[id].label, C.teal, () => {
                this.closeModalSafely(overlay, modal, () => this.finishPhase(chosen, id))
            }, '21px', true)
            btn.setAlpha(0)
            this.tweens.add({ targets: btn, alpha: 1, duration: 240, delay: 160 + i * 90 })
            return btn
        })

        modal.add([bg, title, pickIcon, sub, ...buttons])
        modal.setScale(0.92).setAlpha(0)
        this.tweens.add({ targets: modal, alpha: 1, scale: 1, duration: 240, ease: 'Back.easeOut' })
    }

    private finishPhase(chosen: TechId, reason: CriterionId) {
        const p = this.phase
        const correct = chosen === p.answer
        if (correct && reason === p.decisive) this.chipScore += 5

        const earned = (correct ? 10 : 0) + this.chipScore + this.sieveScore
        this.points += earned

        runtimeGameBridge.emit({
            type: correct ? 'CORRECT_ANSWER' : 'WRONG_ANSWER',
            gameId: GAME_ID,
            pointsEarned: earned,
            stage: this.level.level,
        })
        // só o erro custa vida: o mesmo emit serve para acerto
        if (!(correct)) { this.lives.lose(); this.livesLeft = this.lives.remaining }

        const extra = correct && reason !== p.decisive
            ? ` O que mais pesou aqui foi: ${CRITERION[p.decisive].label}.`
            : ''

        const message = correct
            ? p.explainRight + extra
            : p.explainWrong[chosen] ?? `A melhor aqui era ${TECH[p.answer].name}.`

        this.showFeedback(correct, message, earned, () => this.completePhase())
    }

    private onTimeUp = () => {
        if (this.ended || this.locked) return
        this.locked = true
        this.duelLocked = true
        this.showFeedback(false, `O tempo acabou. ${this.phase.explainRight}`, this.sieveScore, () => this.completePhase())
    }

    private showFeedback(correct: boolean, message: string, earned: number, onDone: () => void) {
        EventBus.emit('timer-stop')

        const overlay = this.add.rectangle(W / 2, H / 2, W, H, C.shadow, A.overlay).setDepth(400).setInteractive()
        const modal = this.add.container(W / 2, H / 2).setDepth(401)

        const body = this.add.text(0, 0, message, {
            fontFamily: 'DynaPuff, Arial, sans-serif',
            fontStyle: 'bold',
            fontSize: '25px',
            color: hex(C.ink),
            align: 'center',
            wordWrap: { width: 620 },
        }).setOrigin(0.5).setResolution(2)

        const PH = body.height + 316
        const top = -PH / 2
        const tone = correct ? C.green : C.amber

        const bg = this.add.graphics()
        bg.fillStyle(C.shadow, 0.22)
        bg.fillRoundedRect(-370, top + 12, 740, PH, 30)
        bg.fillStyle(C.panel, 1)
        bg.fillRoundedRect(-370, top, 740, PH, 30)
        bg.lineStyle(4, tone, 1)
        bg.strokeRoundedRect(-370, top, 740, PH, 30)
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

        const title = this.add.text(0, top + 128, correct ? 'Boa escolha!' : 'Quase!', {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
            fontSize: '36px',
            color: hex(correct ? C.green : C.tealDark),
        }).setOrigin(0.5).setResolution(2)

        body.setY(top + 172 + body.height / 2)

        const pointsText = this.add.text(0, top + 182 + body.height + 16, '', {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
            fontSize: '22px',
            color: hex(C.teal),
        }).setOrigin(0.5).setResolution(2)

        let counterTween: Phaser.Tweens.Tween | undefined
        if (earned > 0) {
            const counter = { v: 0 }
            counterTween = this.tweens.add({
                targets: counter,
                v: earned,
                duration: 620,
                delay: 320,
                onUpdate: () => {
                    if (!pointsText.active) return
                    pointsText.setText(`+${Math.round(counter.v)} pontos`)
                },
            })
        }

        const btn = this.button(0, PH / 2 - 60, 330, 76, 'Continuar', C.teal, () => {
            counterTween?.remove()
            pointsText.setText(earned > 0 ? `+${earned} pontos` : '')
            this.closeModalSafely(overlay, modal, onDone)
        }, '24px', true)

        modal.add([bg, markBg, mark, title, body, pointsText, btn])
        modal.setScale(0.9).setAlpha(0)
        this.tweens.add({ targets: modal, alpha: 1, scale: 1, duration: 260, ease: 'Back.easeOut' })
    }

    private showLevelIntro(onStart: () => void) {
        this.locked = true

        const overlay = this.add.rectangle(W / 2, H / 2, W, H, C.shadow, A.overlay).setDepth(500).setInteractive()
        const panel = this.add.container(W / 2, H / 2).setDepth(501)

        const objective = this.add.text(0, 0, this.level.objective, {
            fontFamily: 'DynaPuff, Arial, sans-serif',
            fontStyle: 'bold',
            fontSize: '25px',
            color: hex(C.ink),
            align: 'center',
            wordWrap: { width: 600 },
        }).setOrigin(0.5).setResolution(2)

        const PH = objective.height + 314
        const top = -PH / 2

        const bg = this.add.graphics()
        bg.fillStyle(C.shadow, 0.22)
        bg.fillRoundedRect(-350, top + 12, 700, PH, 30)
        bg.fillStyle(C.panel, 1)
        bg.fillRoundedRect(-350, top, 700, PH, 30)
        bg.lineStyle(4, C.teal, 1)
        bg.strokeRoundedRect(-350, top, 700, PH, 30)
        bg.fillStyle(C.teal, 1)
        bg.fillRoundedRect(-160, top - 13, 320, 24, 12)

        const badge = this.add.text(0, top + 56, `NÍVEL ${this.level.level}`, {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
            fontSize: '23px',
            color: hex(C.teal),
        }).setOrigin(0.5).setResolution(2)

        const title = this.add.text(0, top + 110, this.level.title, {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
            fontSize: '38px',
            color: hex(C.tealDark),
            align: 'center',
            wordWrap: { width: 600 },
        }).setOrigin(0.5).setResolution(2)

        objective.setY(top + 166 + objective.height / 2)

        const btn = this.button(0, PH / 2 - 60, 330, 76, 'Começar', C.teal, () => {
            this.closeModalSafely(overlay, panel, onStart)
        }, '24px', true)

        panel.add([bg, badge, title, objective, btn])
        panel.setScale(0.9).setAlpha(0)
        this.tweens.add({ targets: panel, alpha: 1, scale: 1, duration: 280, ease: 'Back.easeOut' })
    }

    private completePhase() {
        const isLastPhase = this.phaseIdx + 1 >= this.level.phases.length
        const isLastLevel = this.levelIdx + 1 >= LEVELS.length

        if (!isLastPhase) {
            this.sweepOut(() => this.scene.restart({ lives: this.livesLeft, 
                level: this.level.level,
                phase: this.phaseIdx + 1,
                points: this.points,
            }))
            return
        }

        if (!isLastLevel) {
            runtimeGameBridge.emit({ type: 'GAME_COMPLETED', gameId: GAME_ID, stage: this.level.level, totalStages: LEVELS.length })
            this.emitCheckpoint()
            showLevelComplete(this, {
                subtitle: `Nível ${this.level.level} completo`,
                message: LEVELS[this.levelIdx + 1].objective,
                accent: C.teal,
                overlayColor: C.shadow,
                titleColor: hex(C.tealDark),
                subtitleColor: hex(C.teal),
                progress: { total: LEVELS.length, current: this.level.level },
                autoAdvance: {
                    delay: 2300,
                    onComplete: () => this.scene.restart({ lives: this.livesLeft, 
                        level: this.level.level + 1,
                        phase: 0,
                        points: this.points,
                    }),
                },
            })
            return
        }

        this.ended = true
        runtimeGameBridge.emit({ type: 'GAME_COMPLETED', gameId: GAME_ID, stage: this.level.level, totalStages: LEVELS.length })
        this.emitCheckpoint()

        showLevelComplete(this, {
            title: 'Oficina fechada!',
            subtitle: `${this.points} pontos`,
            message: 'Não existe tecnologia melhor. Existe a que resolve aquele pedido.',
            accent: C.green,
            overlayColor: C.shadow,
            titleColor: hex(C.tealDark),
            subtitleColor: hex(C.green),
            progress: { total: LEVELS.length, current: LEVELS.length },
        })
    }

    private sweepOut(onDone: () => void) {
        const veil = this.add.rectangle(W / 2, H / 2, W, H, C.tealDark, 0).setDepth(900)
        this.tweens.add({
            targets: veil,
            alpha: 1,
            duration: 260,
            ease: 'Sine.easeIn',
            onComplete: onDone,
        })
    }

    private runTutorial() {
        this.tutorialQueue = this.buildTutorialQueue()

        if (this.phaseIdx !== 0 || !this.tutorialQueue.length) {
            this.helpBtn?.setVisible(true)
            this.startPhase()
            return
        }

        this.playTutorialQueue(true, () => this.startPhase())
    }

    private replayTutorial() {
        if (!this.tutorialQueue.length) return
        const wasLocked = this.locked
        this.locked = true
        this.playTutorialQueue(false, () => { this.locked = wasLocked })
    }

    private playTutorialQueue(once: boolean, onDone: () => void) {
        const next = (i: number) => {
            if (i >= this.tutorialQueue.length) {
                this.helpBtn?.setVisible(true)
                onDone()
                return
            }
            const seg = this.tutorialQueue[i]
            createTutorial(this, {
                key: seg.key,
                once,
                accent: C.teal,
                safeTop: 100,
                steps: seg.steps,
                onFinish: () => next(i + 1),
            })
        }
        next(0)
    }

    private startPhase() {
        this.locked = false
        if (this.level.timeLimit) EventBus.emit('timer-start', this.level.timeLimit)
    }

    private buildTutorialQueue(): TutorialSegment[] {
        const briefRect = { x: BRIEF.x + BRIEF.w / 2, y: BRIEF.y + BRIEF.h / 2, w: BRIEF.w + 20, h: BRIEF.h + 20 }
        const plateRect = { x: BOARD.cx, y: 300, w: 720, h: 300 }
        const chipsW = this.phase.chips.length * CHIPS.w + (this.phase.chips.length - 1) * CHIPS.gap
        const chipsRect = { x: BOARD.cx, y: CHIPS.rowY, w: chipsW + 40, h: CHIPS.h + 30 }

        if (this.level.level === 1) {
            return [{
                key: 'ferramenta-l1',
                steps: [
                    {
                        text: 'Alguém da escola precisa de ajuda. Leia aqui o que a pessoa quer.',
                        shape: 'rect', ...briefRect, balloonY: 470,
                    },
                    {
                        text: 'Estas são as duas coisas que podem resolver. Uma em cada prato.',
                        shape: 'rect', ...plateRect,
                    },
                    {
                        text: 'Aqui embaixo fica o que importa neste pedido. Toque nele.',
                        shape: 'rect', ...chipsRect,
                    },
                    {
                        text: 'A balança desce do lado que é melhor nisso. O número é a nota.',
                        shape: 'none', balloonY: 420,
                    },
                    {
                        text: 'Agora toque no prato que você escolhe.',
                        shape: 'rect', ...plateRect,
                    },
                ],
            }]
        }

        if (this.level.level === 2) {
            return [{
                key: 'ferramenta-l2',
                steps: [
                    {
                        text: 'Agora são três. Elas disputam duas de cada vez.',
                        shape: 'rect', ...plateRect,
                    },
                    {
                        text: 'Toque em dois ou três. Cada um puxa a balança para um lado.',
                        shape: 'rect', ...chipsRect,
                    },
                    {
                        text: 'Tocou sem querer? Toque de novo para tirar o peso.',
                        shape: 'rect', ...chipsRect,
                    },
                    {
                        text: 'Aqui você vê em qual disputa está. Quem ganhar enfrenta a última.',
                        shape: 'rect', x: 1140, y: STRIP.y + STRIP.h / 2, w: 240, h: 70,
                    },
                ],
            }]
        }

        return [{
            key: 'ferramenta-l3',
            steps: [
                {
                    text: 'Este pedido tem regras. Leia as regras aqui do lado.',
                    shape: 'rect', ...briefRect, balloonY: 470,
                },
                {
                    text: 'Antes de disputar, tire as que quebram a regra.',
                    shape: 'rect', x: SIEVE.cx, y: SIEVE.cy, w: 580, h: 500,
                },
                {
                    text: 'Toque só nas que não podem entrar. Depois começam as disputas.',
                    shape: 'none', balloonY: 430,
                },
                {
                    text: 'O tempo está correndo. Pense com calma, mas não pare.',
                    shape: 'none', balloonY: 430,
                },
            ],
        }]
    }

    private typeText(
        target: Phaser.GameObjects.Text,
        full: string,
        delay = 0,
        onStep?: () => void,
        onDone?: () => void,
    ) {
        let i = 0
        this.time.delayedCall(delay, () => {
            this.typeTimer?.remove()
            this.typeTimer = this.time.addEvent({
                delay: 26,
                repeat: full.length - 1,
                callback: () => {
                    i++
                    target.setText(full.slice(0, i))
                    onStep?.()
                    if (i >= full.length) onDone?.()
                },
            })
        })
    }

    private toast(message: string, tone: number) {
        const container = this.add.container(BOARD.cx, SIEVE.statusY - 56).setDepth(60)
        const t = this.add.text(0, 0, message, {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
            fontSize: '20px',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: 560 },
        }).setOrigin(0.5).setResolution(2)

        const w = t.width + 44
        const h = t.height + 26
        const g = this.add.graphics()
        g.fillStyle(C.shadow, 0.22)
        g.fillRoundedRect(-w / 2, -h / 2 + 5, w, h, h / 2)
        g.fillStyle(tone, 1)
        g.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
        g.fillStyle(C.white, A.gloss)
        g.fillRoundedRect(-w / 2 + 10, -h / 2 + 6, w - 20, h * 0.3, h / 4)

        container.add([g, t])
        container.setAlpha(0).setScale(0.9)
        this.tweens.add({ targets: container, alpha: 1, scale: 1, y: container.y - 14, duration: 240, ease: 'Back.easeOut' })
        this.time.delayedCall(2000, () => {
            this.tweens.add({
                targets: container,
                alpha: 0,
                y: container.y - 12,
                duration: 240,
                onComplete: () => container.destroy(),
            })
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

    private card(x: number, y: number, w: number, h: number, r = 24, fill = C.panel) {
        const g = this.add.graphics()
        g.fillStyle(C.shadow, A.shadow)
        g.fillRoundedRect(x + 4, y + 10, w, h, r)
        g.fillStyle(fill, 1)
        g.fillRoundedRect(x, y, w, h, r)
        g.fillStyle(C.white, 0.55)
        g.fillRoundedRect(x + 12, y + 10, w - 24, 18, 9)
        g.lineStyle(3, C.border, 1)
        g.strokeRoundedRect(x, y, w, h, r)
        return g
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
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
            fontSize,
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: w - 26 },
        }).setOrigin(0.5).setResolution(2)

        btn.add([g, t])
        btn.setData('paint', paint)
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