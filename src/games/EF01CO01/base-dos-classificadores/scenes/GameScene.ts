import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { FX, Ease } from '../../../../shared/effects/FX'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { createTimeBar, type TimeBar } from '../../../../shared/hud/createTimeBar'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import {
    LEVELS, RULE_WORD, SHAPE_FRAME, SIZE_SCALE, matches, ruleExamples, ruleLabel,
} from '../data/levels'
import { C, FONT, SIZE, STONE_TINT, hex } from '../data/theme'
import {
    W, H, HUD, STRIP, STONE, BASKET, SIGN, VINE, SLOTS, STONE_SLOTS,
} from '../data/layout'
import {
    paintHeaderBar, paintPill, paintPanel, paintDots, paintLog, paintSign,
    paintDropGlow, paintHelp,
} from './effects'
import { runVisualDemo } from './demo'
import type { BasketView, LevelConfig, PhaseDef, StoneView } from '../types'

const GAME_ID = 'base-dos-classificadores'

const MS_PER_STONE = 12000

const DEMO_KEY = '__classificadoresDemo'

export class GameScene extends Phaser.Scene {
    private lives!: Lives
    private livesTotal = 3
    private livesLeft = 3

    private levelIdx = 0
    private phaseIdx = 0
    private points = 0
    private hits = 0
    private errors = 0
    private locked = true
    private ended = false
    private isMuted = false
    private gen = 0

    private stones: StoneView[] = []
    private baskets: BasketView[] = []
    private hover?: BasketView
    private dragging?: StoneView

    private timeBar!: TimeBar
    private dotsG!: Phaser.GameObjects.Graphics
    private stripG!: Phaser.GameObjects.Graphics
    private stripText!: Phaser.GameObjects.Text
    private stripTimer?: Phaser.Time.TimerEvent
    private unsubPlatform?: () => void

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this, 3)
        this.livesLeft = data?.lives ?? this.livesTotal
        this.levelIdx = Phaser.Math.Clamp(data?.level ?? 1, 1, LEVELS.length) - 1
        this.phaseIdx = 0
        this.points = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.locked = true
        this.ended = false
        this.gen = 0
        this.stones = []
        this.baskets = []
        this.hover = undefined
        this.dragging = undefined
    }

    create() {
        this.buildScenery()
        this.buildHud()
        this.buildStrip()
        this.buildDragInput()
        this.registerPlatformCommands()

        EventBus.on('mute-audio', this.onMuteAudio, this)
        EventBus.on('show-tutorial', this.replayDemo, this)
        this.events.once('shutdown', this.shutdownScene, this)

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        this.lives = createLives(this, {
            total: this.livesTotal,
            remaining: this.livesLeft,
            gameId: GAME_ID,
            x: HUD.livesX,
            y: HUD.cy,
            size: 28,
            depth: 63,
            tint: C.red,
            stage: () => this.level.level,
        })
        this.events.once('shutdown', () => this.lives.destroy())

        this.startPhase()
    }

    update(_time: number, delta: number) {
        this.timeBar?.tick(delta)
    }

    private get level(): LevelConfig { return LEVELS[this.levelIdx] }
    private get phase(): PhaseDef { return this.level.phases[this.phaseIdx] }

    private shutdownScene() {
        this.gen += 1
        this.stripTimer?.remove()
        this.timeBar?.destroy()
        EventBus.off('mute-audio', this.onMuteAudio, this)
        EventBus.off('show-tutorial', this.replayDemo, this)
        this.unsubPlatform?.()
        this.unsubPlatform = undefined
    }

    private onMuteAudio(muted: boolean) {
        this.isMuted = muted
    }

    private registerPlatformCommands() {
        this.unsubPlatform = runtimeGameBridge.onCommand((cmd: PlatformCommand) => {
            if (cmd.type === 'START_GAME') this.points = cmd.points ?? this.points
        })
    }

    private buildScenery() {
        if (this.textures.exists('bg-clareira')) {
            const bg = this.add.image(W / 2, H / 2, 'bg-clareira').setDepth(-40)
            bg.setScale(Math.max(W / bg.width, H / bg.height))
        }

        if (this.textures.exists('vinhas')) {
            VINE.xs.forEach((x, i) => {
                const vine = this.add.sprite(x, HUD.h - 8, 'vinhas', i === 0 ? 0 : 2)
                    .setOrigin(0.5, 0)
                    .setDepth(-30)
                    .setScale(VINE.height / VINE.frameH)
                if (i === 1) vine.setFlipX(true)
                this.tweens.add({
                    targets: vine, angle: i === 0 ? 3.2 : -3.2,
                    duration: 2600 + i * 400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
                })
            })
        }

        const log = this.add.graphics().setDepth(4)
        paintLog(log)
    }

    private buildHud() {
        const bar = this.add.graphics().setDepth(60)
        paintHeaderBar(bar)

        const pill = this.add.graphics().setDepth(61)
        paintPill(pill, HUD.levelX, HUD.levelY, HUD.levelW, HUD.levelH, C.cream, C.leafLight)
        this.add.text(
            HUD.levelX + HUD.levelW / 2, HUD.cy, `NÍVEL ${this.level.level}`,
            { fontFamily: FONT.black, fontSize: SIZE.hudLevel, color: hex(C.ink) },
        ).setOrigin(0.5).setDepth(62).setResolution(2)

        this.dotsG = this.add.graphics().setDepth(62)

        this.timeBar = createTimeBar(this, {
            cx: HUD.timeCx, cy: HUD.cy, w: HUD.timeW, h: HUD.timeH,
            duration: MS_PER_STONE * 6,
            depth: 62,
            warnAt: 0.4,
            dangerAt: 0.2,
            theme: {
                track: C.trunkDark, trackAlpha: 0.55,
                border: C.white, borderAlpha: 0.4,
                fill: C.cream, warn: C.amber, danger: C.red, idle: C.creamEdge,
                icon: C.cream,
            },
            onEmpty: () => this.timeOut(),
        })
        this.timeBar.setRunning(false)

        const help = this.add.graphics().setPosition(HUD.helpCx, HUD.cy).setDepth(62)
        paintHelp(help)
        this.add.text(HUD.helpCx, HUD.cy + 1, '?', {
            fontFamily: FONT.black, fontSize: SIZE.help, color: hex(C.leaf),
        }).setOrigin(0.5).setDepth(63).setResolution(2)

        this.add.zone(HUD.helpCx, HUD.cy, HUD.helpR * 2.4, HUD.helpR * 2.4)
            .setDepth(64)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                FX.press(this, help)
                this.replayDemo()
            })
    }

    private buildStrip() {
        this.stripG = this.add.graphics().setPosition(STRIP.cx, STRIP.cy).setDepth(58)
        paintPanel(this.stripG, STRIP.w, STRIP.h, STRIP.r, C.cream, C.leafLight, 5)
        this.stripText = this.add.text(STRIP.cx, STRIP.cy, '', {
            fontFamily: FONT.body, fontStyle: 'bold', fontSize: SIZE.strip, color: hex(C.ink),
        }).setOrigin(0.5).setDepth(59).setResolution(2)
        this.sayIdle()
    }

    private sayIdle() {
        this.stripTimer?.remove()
        this.stripTimer = undefined
        paintPanel(this.stripG, STRIP.w, STRIP.h, STRIP.r, C.cream, C.leafLight, 5)
        this.stripText.setText('Leve cada pedra até o cesto certo').setColor(hex(C.ink))
    }

    private sayRule(text: string) {
        this.stripTimer?.remove()
        paintPanel(this.stripG, STRIP.w, STRIP.h, STRIP.r, C.okLight, C.leaf, 6)
        this.stripText.setText(text).setColor(hex(C.ink))
        FX.impact(this, this.stripText, 0.18)
        this.stripTimer = this.time.delayedCall(2800, () => this.sayIdle())
    }

    private sayWarning(text: string) {
        this.stripTimer?.remove()
        paintPanel(this.stripG, STRIP.w, STRIP.h, STRIP.r, C.sun, C.amberDark, 6)
        this.stripText.setText(text).setColor(hex(C.ink))
        FX.impact(this, this.stripText, 0.16)
        this.stripTimer = this.time.delayedCall(2400, () => this.sayIdle())
    }

    /* ─────────────────────────────────────────────────────────── fases */

    private startPhase() {
        const gen = ++this.gen
        this.locked = true
        this.clearBoard()

        paintDots(this.dotsG, this.level.phases.length, this.phaseIdx, HUD.dotsX, HUD.cy)
        this.sayIdle()
        this.emitCheckpoint()

        this.buildBaskets()
        this.buildStones()

        this.timeBar.reset(MS_PER_STONE * this.phase.stones.length)
        this.timeBar.setRunning(false)

        const first = this.phaseIdx === 0 && !this.demoSeen()
        const previous = this.phaseIdx > 0 ? this.level.phases[this.phaseIdx - 1] : undefined
        const ruleChanged = !!previous && previous.rule !== this.phase.rule

        void this.enterBoard().then(() => {
            if (gen !== this.gen) return
            if (first) {
                this.markDemoSeen()
                void this.playDemo(gen)
                return
            }
            if (ruleChanged) {
                void this.announceRule(gen)
                return
            }
            this.unlock()
        })
    }

    private unlock() {
        this.locked = false
        this.timeBar.setRunning(true)
    }

    private clearBoard() {
        this.stones.forEach(v => v.sprite.destroy())
        this.baskets.forEach(b => {
            b.sprite.destroy()
            b.glow.destroy()
            b.sign.destroy()
        })
        this.stones = []
        this.baskets = []
        this.hover = undefined
        this.dragging = undefined
    }

    private async announceRule(gen: number) {
        this.sayRule(`A regra mudou: olhe a ${RULE_WORD[this.phase.rule]}!`)
        this.playRuleChange()

        await FX.all(...this.baskets.map((b, i) => FX.wait(this, i * 130).then(async () => {
            paintSign(b.plaque, true)
            FX.ping(this, b.sign.x, b.sign.y, C.amber, { radius: 120 })
            await FX.impact(this, b.sign, 0.16)
            paintSign(b.plaque, false)
        })))
        if (gen !== this.gen) return
        this.unlock()
    }

    private buildBaskets() {
        const xs = SLOTS[this.phase.baskets.length] ?? SLOTS[3]
        const many = this.phase.baskets.length >= 4
        this.phase.baskets.forEach((value, i) => {
            const x = xs[i]

            const glow = this.add.graphics()
                .setPosition(x, BASKET.y + BASKET.shadowDY)
                .setDepth(8)
            paintDropGlow(glow, false, C.okLight)

            const sprite = this.add.sprite(x, BASKET.y, 'cesta', 0)
                .setDepth(10)
                .setScale((BASKET.display / BASKET.frame) * (many ? BASKET.compact : 1))

            const sign = this.add.container(x, SIGN.y).setDepth(9).setScale(many ? SIGN.compact : 1)
            const plaque = this.add.graphics()
            paintSign(plaque, false)
            sign.add(plaque)

            ruleExamples(this.phase.rule, value).forEach((stone, k) => {
                const img = this.add.image(
                    (k - 1) * SIGN.exampleGap, 4, 'formas', SHAPE_FRAME[stone.shape],
                )
                img.setTint(STONE_TINT[stone.color])
                img.setScale((SIGN.exampleSize / STONE.frame) * SIZE_SCALE[stone.size])
                sign.add(img)
            })

            this.baskets.push({ sprite, glow, sign, plaque, value, x })
        })
    }

    private buildStones() {
        const list = Phaser.Utils.Array.Shuffle([...this.phase.stones])
        const xs = STONE_SLOTS[list.length] ?? STONE_SLOTS[6]

        list.forEach((stone, i) => {
            const sprite = this.add.sprite(xs[i], STONE.y, 'formas', SHAPE_FRAME[stone.shape])
                .setDepth(20)
                .setScale(SIZE_SCALE[stone.size])
            sprite.setTint(STONE_TINT[stone.color])

            const pad = (STONE.hit / SIZE_SCALE[stone.size] - STONE.frame) / 2
            sprite.setInteractive(
                new Phaser.Geom.Rectangle(-pad, -pad, STONE.frame + pad * 2, STONE.frame + pad * 2),
                Phaser.Geom.Rectangle.Contains,
            )
            this.input.setDraggable(sprite)

            const view: StoneView = {
                sprite, stone, homeX: xs[i], homeY: STONE.y, placed: false,
            }
            sprite.setData('view', view)
            this.stones.push(view)
        })
    }

    private async enterBoard() {
        await FX.all(
            ...this.baskets.map((b, i) => FX.wait(this, i * 110).then(() => FX.all(
                FX.popIn(this, b.sprite, { from: 0.5, duration: 520 }),
                FX.popIn(this, b.sign, { from: 0.6, duration: 420 }),
            ))),
        )
        await FX.all(
            ...this.stones.map((v, i) =>
                FX.wait(this, i * 80).then(() => FX.popIn(this, v.sprite, { from: 0, duration: 360 }))),
        )
    }

    /* ──────────────────────────────────────────────────────── tutorial */

    private demoSeen(): boolean {
        const seen = this.registry.get(DEMO_KEY) as Set<string> | undefined
        return !!seen?.has(`l${this.level.level}`)
    }

    private markDemoSeen() {
        let seen = this.registry.get(DEMO_KEY) as Set<string> | undefined
        if (!seen) {
            seen = new Set<string>()
            this.registry.set(DEMO_KEY, seen)
        }
        seen.add(`l${this.level.level}`)
    }

    private replayDemo() {
        if (this.ended || this.locked) return
        const gen = this.gen
        this.locked = true
        this.timeBar.setRunning(false)
        void this.playDemo(gen)
    }

    private async playDemo(gen: number) {
        const stone = this.stones.find(v => !v.placed)
        const basket = stone && this.baskets.find(
            b => matches(stone.stone, this.phase.rule, b.value),
        )
        if (!stone || !basket) {
            if (gen === this.gen) this.unlock()
            return
        }

        paintSign(basket.plaque, true)
        await runVisualDemo(this, {
            stone: stone.sprite,
            basket: basket.sprite,
            sign: basket.sign,
            tone: STONE_TINT[stone.stone.color],
            onPick: () => this.playPick(),
            onDrop: () => this.playAccept(),
            onSkip: () => this.playPick(),
        })
        paintSign(basket.plaque, false)

        if (gen !== this.gen) return
        this.unlock()
    }

    /* ─────────────────────────────────────────────────────── arrastar */

    private buildDragInput() {
        this.input.on('dragstart', (_p: Phaser.Input.Pointer, obj: Phaser.GameObjects.Sprite) => {
            const view = obj.getData('view') as StoneView | undefined
            if (!view || this.locked || view.placed) return
            this.dragging = view
            obj.setDepth(50)
            FX.to(this, obj, { scale: SIZE_SCALE[view.stone.size] * STONE.lift }, { duration: 140 })
            this.playPick()
        })

        this.input.on('drag', (p: Phaser.Input.Pointer, obj: Phaser.GameObjects.Sprite, x: number, y: number) => {
            const view = obj.getData('view') as StoneView | undefined
            if (!view || this.dragging !== view) return
            obj.setPosition(x, y)
            this.setHover(this.basketAt(p.x, p.y))
        })

        this.input.on('dragend', (p: Phaser.Input.Pointer, obj: Phaser.GameObjects.Sprite) => {
            const view = obj.getData('view') as StoneView | undefined
            if (!view || this.dragging !== view) return
            this.dragging = undefined
            const target = this.basketAt(p.x, p.y)
            this.setHover(undefined)
            if (!target) {
                void this.sendHome(view)
                return
            }
            void this.dropOn(view, target)
        })
    }

    private basketAt(x: number, y: number): BasketView | undefined {
        return this.baskets.find(b =>
            Math.abs(x - b.x) <= BASKET.dropW / 2
            && y >= BASKET.y - BASKET.dropH / 2
            && y <= BASKET.y + BASKET.dropH / 2)
    }

    private setHover(next?: BasketView) {
        if (this.hover === next) return
        if (this.hover) {
            this.hover.sprite.setFrame(0)
            paintDropGlow(this.hover.glow, false, C.okLight)
            paintSign(this.hover.plaque, false)
        }
        this.hover = next
        if (next) {
            next.sprite.setFrame(1)
            paintDropGlow(next.glow, true, C.okLight)
            paintSign(next.plaque, true)
        }
    }

    private async sendHome(view: StoneView) {
        await FX.to(this, view.sprite, {
            x: view.homeX, y: view.homeY, scale: SIZE_SCALE[view.stone.size],
        }, { duration: 260, ease: Ease.smooth })
        view.sprite.setDepth(20)
    }

    private async dropOn(view: StoneView, basket: BasketView) {
        const gen = this.gen
        if (matches(view.stone, this.phase.rule, basket.value)) {
            await this.accept(view, basket, gen)
            return
        }
        this.refuse(basket)
    }

    private async accept(view: StoneView, basket: BasketView, gen: number) {
        view.placed = true
        view.sprite.disableInteractive()
        this.hits += 1
        this.points += 10

        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER', gameId: GAME_ID, pointsEarned: 10, stage: this.level.level,
        })

        basket.sprite.setFrame(2)
        paintSign(basket.plaque, true)
        this.playAccept()

        await FX.arcTo(this, view.sprite, { x: basket.x, y: BASKET.y - 34 }, {
            height: 110, duration: 380,
        })
        if (gen !== this.gen) return

        await FX.to(this, view.sprite, { scale: 0.18, alpha: 0 }, { duration: 220 })
        view.sprite.setVisible(false)

        FX.sparks(this, basket.x, BASKET.y - 34, {
            color: STONE_TINT[view.stone.color], count: 16, spread: 140,
        })
        FX.impact(this, basket.sprite, 0.2)
        await FX.wait(this, 220)
        if (gen !== this.gen) return

        basket.sprite.setFrame(0)
        paintSign(basket.plaque, false)

        if (this.stones.every(v => v.placed)) void this.finishPhase(gen)
    }

    private refuse(basket: BasketView) {
        this.errors += 1
        runtimeGameBridge.emit({
            type: 'WRONG_ANSWER', gameId: GAME_ID, pointsEarned: 0, stage: this.level.level,
        })
        this.lives.lose()
        this.livesLeft = this.lives.remaining

        basket.sprite.setFrame(3)
        this.playRefuse()
        FX.shake(this, basket.sprite, { amount: 9, times: 3 })
        paintSign(basket.plaque, true)
        FX.ping(this, basket.sign.x, basket.sign.y, C.amber, { radius: 130 })

        this.sayWarning(`Este cesto só leva pedra ${ruleLabel(this.phase.rule, basket.value)}.`)
    }

    private async finishPhase(gen: number) {
        this.locked = true
        this.timeBar.setRunning(false)
        this.playPhaseDone()

        await FX.all(
            ...this.baskets.map((b, i) => FX.wait(this, i * 90).then(() => FX.impact(this, b.sprite, 0.24))),
        )
        FX.stars(this, W / 2, BASKET.y - 120, { color: C.sun, count: 12 })
        if (gen !== this.gen) return

        this.phaseIdx += 1
        this.emitCheckpoint()
        await FX.wait(this, 620)
        if (gen !== this.gen) return

        if (this.phaseIdx >= this.level.phases.length) {
            void this.endLevel()
            return
        }
        this.startPhase()
    }

    private timeOut() {
        if (this.locked || this.ended) return
        this.locked = true
        this.timeBar.setRunning(false)
        this.errors += 1
        runtimeGameBridge.emit({
            type: 'WRONG_ANSWER', gameId: GAME_ID, pointsEarned: 0, stage: this.level.level,
        })
        this.lives.lose()
        this.livesLeft = this.lives.remaining
        this.playRefuse()
        this.sayWarning('O tempo acabou!')
        this.time.delayedCall(1500, () => {
            if (this.ended) return
            this.startPhase()
        })
    }

    /* ─────────────────────────────────────────────────── fim de nível */

    private async endLevel() {
        this.ended = true
        this.locked = true
        this.timeBar.setRunning(false)

        runtimeGameBridge.emit({
            type: 'GAME_COMPLETED',
            gameId: GAME_ID,
            stage: this.level.level,
            totalStages: LEVELS.length,
        })
        this.emitCheckpoint(true)

        this.playFanfare()
        FX.confetti(this, { colors: [C.leafLight, C.sun, C.blue, C.cream] })
        await FX.wait(this, 700)

        const next = this.level.level < LEVELS.length ? this.level.level + 1 : null
        if (next) {
            showLevelComplete(this, {
                title: `Nível ${this.level.level} completo`,
                subtitle: this.level.title,
                message: this.level.message,
                accent: C.leaf,
                panelColor: C.cream,
                overlayColor: C.ink,
                progress: { total: LEVELS.length, current: this.level.level },
                autoAdvance: {
                    delay: 1800,
                    label: `Preparando nível ${next}...`,
                    onComplete: () => this.scene.restart({
                        level: next, points: this.points, lives: this.livesLeft,
                    }),
                },
            })
            return
        }

        showLevelComplete(this, {
            title: 'Tudo guardado!',
            subtitle: this.level.title,
            message: this.level.message,
            accent: C.leaf,
            panelColor: C.cream,
            overlayColor: C.ink,
            progress: { total: LEVELS.length, current: this.level.level },
            buttons: [
                {
                    label: 'Jogar de novo',
                    color: C.leaf,
                    onClick: () => this.scene.restart({ level: 1, points: 0, lives: this.livesTotal }),
                },
                { label: 'Escolher jogo', color: C.amber, onClick: () => EventBus.emit('exit-game') },
            ],
        })
    }

    private emitCheckpoint(complete = false) {
        const total = this.level.phases.length
        const done = complete ? total : this.phaseIdx
        runtimeGameBridge.emit({
            type: 'CHECKPOINT',
            gameId: GAME_ID,
            progress: Math.round((done / total) * 100),
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

    private playSequence(freqs: number[], gap: number, dur: number, type: OscillatorType = 'sine', gain = 0.1) {
        freqs.forEach((f, i) => this.time.delayedCall(i * gap, () => this.playTone(f, dur, type, gain)))
    }

    private playPick() { this.playTone(720, 0.06, 'triangle', 0.08) }
    private playAccept() { this.playSequence([523, 784], 90, 0.16, 'triangle', 0.11) }
    private playRefuse() { this.playTone(190, 0.18, 'sine', 0.11) }
    private playRuleChange() { this.playSequence([440, 587, 740], 90, 0.16, 'triangle', 0.1) }
    private playPhaseDone() { this.playSequence([523, 659, 784], 100, 0.18, 'triangle', 0.1) }
    private playFanfare() { this.playSequence([523, 659, 784, 1047], 110, 0.24, 'triangle', 0.11) }
}
