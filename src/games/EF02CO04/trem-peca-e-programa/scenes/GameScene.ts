import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { FX } from '../../../../shared/effects/FX'

import { ITEMS, TRAINING, isRight } from '../data/items'
import { LEVELS, POINTS, guideKey, shuffleItems } from '../data/levels'
import { BALLOON, DEPTH, ITEM, SWITCH, W } from '../data/layout'
import { APP, C, CSS, FONT, SIZE } from '../data/theme'
import { HINT, TEACH } from '../data/words'
import type { ItemId, LevelDef, Mode, PhaseDef, Side } from '../types'

import { createAudio, type Audio } from './audio'
import { createFinale, type Finale } from './finale'
import { spot, teach, union } from './guide'
import { createHud, type Hud } from './hud'
import { createItem, createPlate, type ItemView, type Plate } from './item'
import { createSwitch, type Switch } from './switch'
import { createTrain, type Train } from './train'
import { createYard, type Yard } from './yard'

const GAME_ID = 'trem-peca-e-programa'
const SHOW_ERROR_MS = 900
const FINALE_MS = 2200
const STAGE = { x: ITEM.waitX, y: ITEM.waitY + 30, w: 320, h: 260 }

export class GameScene extends Phaser.Scene {
    private livesTotal = 1
    private livesLeft = 1

    private level!: LevelDef
    private phaseIndex = 0
    private queue: ItemId[] = []
    private itemIndex = 0
    private current?: ItemView
    private mode: Mode = 'intro'
    private gen = 0
    private guiding = false

    private score = 0
    private hits = 0
    private errors = 0
    private sorted = 0

    private audio!: Audio
    private yard!: Yard
    private train!: Train
    private switcher!: Switch
    private plate!: Plate
    private hud!: Hud
    private finale!: Finale
    private balloon?: Phaser.GameObjects.Container

    private unsubPlatform?: () => void

    private get phase(): PhaseDef {
        return this.level.phases[this.phaseIndex]
    }

    private get total() {
        return this.level.phases.reduce((sum, phase) => sum + phase.items.length, 0)
    }

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this)
        this.livesLeft = data?.lives ?? this.livesTotal
        const number = Phaser.Math.Clamp(data?.level ?? faseInicial(this, 1), 1, LEVELS.length)
        this.level = LEVELS[number - 1]

        this.phaseIndex = 0
        this.queue = []
        this.itemIndex = 0
        this.current = undefined
        this.mode = 'intro'
        this.guiding = false
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.sorted = 0
        this.balloon = undefined
        this.unsubPlatform = undefined
    }

    create() {
        this.input.topOnly = true

        this.audio = createAudio()
        this.yard = createYard(this)
        this.switcher = createSwitch(this)
        this.train = createTrain(this)
        this.plate = createPlate(this)
        this.finale = createFinale(this)
        this.hud = createHud(this, {
            phases: this.level.phases.length,
            level: this.level.level,
            livesTotal: this.livesTotal,
            livesLeft: this.livesLeft,
            gameId: GAME_ID,
            stage: () => this.level.level,
            onHelp: () => void this.explain(),
        })

        this.bindInput()
        this.bindPlatform()
        EventBus.on('mute-audio', this.onMute, this)
        EventBus.on('show-tutorial', this.onShowTutorial, this)
        this.events.once('shutdown', this.shutdownScene, this)

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        const key = guideKey(this.level.level)
        if (this.registry.get(key)) void this.startPhase(0, true)
        else {
            this.registry.set(key, true)
            void this.runGuide()
        }
    }

    private shutdownScene() {
        this.gen++
        this.input.keyboard?.off('keydown', this.onKeyDown, this)
        this.hud?.destroy()
        this.finale?.destroy()
        this.balloon?.destroy()
        this.current?.destroy()
        this.plate?.destroy()
        this.train?.destroy()
        this.switcher?.destroy()
        this.yard?.destroy()
        this.audio?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.onShowTutorial, this)
        this.unsubPlatform?.()
    }

    private bindInput() {
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer, over: Phaser.GameObjects.GameObject[]) => {
            if (over.length || pointer.y < 100) return
            this.choose(pointer.x < W / 2 ? 'left' : 'right')
        })
        this.input.keyboard?.on('keydown', this.onKeyDown, this)
    }

    private onKeyDown(event: KeyboardEvent) {
        if (event.code === 'ArrowLeft') this.choose('left')
        else if (event.code === 'ArrowRight') this.choose('right')
    }

    private async startPhase(index: number, enter: boolean) {
        const gen = ++this.gen
        this.phaseIndex = index
        this.mode = 'intro'
        this.hud.setPhase(index)
        this.hud.setHelpEnabled(false)
        this.train.reset()
        if (enter) {
            await this.train.enter()
            if (gen !== this.gen) return
        }
        this.queue = shuffleItems(this.phase, index === 0)
        this.itemIndex = 0
        await this.nextItem(gen)
    }

    private async dropItem(id: ItemId) {
        const view = createItem(this, id)
        const box = view.container
        box.setScale(0.2)
        this.yard.shakeFunnel()
        this.audio.drop()
        await FX.to(this, box, { y: ITEM.waitY, scale: 1 }, { duration: ITEM.dropMs, ease: 'Bounce.easeOut' })
        this.audio.land()
        this.plate.show(id)
        return view
    }

    private async nextItem(gen: number) {
        this.mode = 'drop'
        const view = await this.dropItem(this.queue[this.itemIndex])
        if (gen !== this.gen) {
            view.destroy()
            return
        }
        this.current = view
        this.mode = 'choose'
        this.switcher.setInviting(true)
        this.hud.setHelpEnabled(true)
    }

    private choose(side: Side) {
        if (this.mode !== 'choose' || !this.current) return
        this.mode = 'slide'
        this.hud.setHelpEnabled(false)
        void this.resolve(this.current, side)
    }

    private async slide(view: ItemView, side: Side) {
        this.plate.hide()
        this.switcher.setInviting(false)
        this.audio.turn()
        await this.switcher.turn(side)
        const box = view.container
        await FX.to(this, box, { x: SWITCH.x, y: SWITCH.y - 10, scale: 0.7 }, { duration: 200, ease: 'Quad.easeIn' })
        const mouth = this.train.mouth(side)
        await FX.to(this, box, { x: mouth.x, y: mouth.y, scale: ITEM.cargoScale }, { duration: ITEM.slideMs, ease: 'Quad.easeIn' })
    }

    private async loadItem(view: ItemView, side: Side) {
        this.audio.thump()
        await this.train.load(side, view.container)
        this.audio.toot()
        this.train.whistle()
        this.switcher.center()
    }

    private async resolve(view: ItemView, side: Side) {
        const gen = this.gen
        await this.slide(view, side)
        if (gen !== this.gen) return

        if (!isRight(view.id, side)) {
            await this.reject(gen, view, side)
            return
        }

        this.current = undefined
        await this.loadItem(view, side)
        if (gen !== this.gen) return

        this.score += POINTS
        this.hits += 1
        this.sorted += 1
        runtimeGameBridge.emit({ type: 'CORRECT_ANSWER', gameId: GAME_ID, pointsEarned: POINTS, stage: this.level.level })
        this.emitCheckpoint()

        if (this.itemIndex + 1 < this.queue.length) {
            this.itemIndex += 1
            await this.nextItem(gen)
            return
        }
        await this.depart(gen)
    }

    private async reject(gen: number, view: ItemView, side: Side) {
        const box = view.container
        const mouth = this.train.mouth(side)
        this.audio.boing()
        await Promise.all([
            this.train.reject(side),
            FX.to(this, box, { y: mouth.y + 30 }, { duration: 140, ease: 'Quad.easeIn' }),
        ])
        if (gen !== this.gen) return
        await FX.to(this, box, { y: mouth.y - 90, scale: 0.6 }, { duration: 320, ease: 'Back.easeOut' })
        this.tweens.add({ targets: box, angle: { from: -8, to: 8 }, duration: 600, yoyo: true, repeat: -1 })
        this.say(mouth.x, mouth.y - 90 + BALLOON.dy + 40, HINT[ITEMS[view.id].kind])
        this.audio.fail()
        await FX.wait(this, SHOW_ERROR_MS)
        if (gen !== this.gen) return
        this.lose()
    }

    private say(x: number, y: number, text: string) {
        this.balloon?.destroy()
        const label = this.add
            .text(0, 0, text, { fontFamily: FONT.black, fontSize: `${SIZE.balloon}px`, color: CSS.ink })
            .setOrigin(0.5)
            .setResolution(2)
        const w = Math.max(BALLOON.minW, label.width + 44)
        const h = BALLOON.h
        const bg = this.add.graphics()
        bg.fillStyle(C.shadow, 0.16)
        bg.fillRoundedRect(-w / 2 + 3, -h / 2 + 5, w, h, h / 2)
        bg.fillStyle(C.white, 1)
        bg.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
        bg.fillTriangle(-12, h / 2 - 2, 12, h / 2 - 2, 0, h / 2 + 18)
        bg.lineStyle(4, C.ink, 1)
        bg.strokeRoundedRect(-w / 2, -h / 2, w, h, h / 2)
        const cx = Phaser.Math.Clamp(x, w / 2 + 12, W - w / 2 - 12)
        this.balloon = this.add.container(cx, y, [bg, label]).setDepth(DEPTH.balloon).setScale(0.8).setAlpha(0)
        void FX.to(this, this.balloon, { alpha: 1, scale: 1 }, { duration: 220, ease: 'Back.easeOut' })
    }

    private lose() {
        this.gen++
        this.mode = 'done'
        this.switcher.setInviting(false)
        this.hud.setHelpEnabled(false)
        this.audio.lose()

        this.errors += 1
        runtimeGameBridge.emit({ type: 'WRONG_ANSWER', gameId: GAME_ID, pointsEarned: -5, stage: this.level.level })
        this.hud.lives.lose()
        this.livesLeft = this.hud.lives.remaining
    }

    private async depart(gen: number) {
        this.mode = 'depart'
        this.audio.depart()
        void this.hud.celebrate(this.phaseIndex)
        await this.train.leave()
        if (gen !== this.gen) return

        const next = this.phaseIndex + 1
        if (next < this.level.phases.length) {
            void this.startPhase(next, true)
            return
        }
        void this.endLevel()
    }

    private async runGuide() {
        const gen = ++this.gen
        this.mode = 'guide'
        this.guiding = true
        this.hud.setHelpEnabled(false)
        this.train.reset()
        await this.train.enter()
        if (gen !== this.gen) return

        const key = guideKey(this.level.level)
        const wagons = this.wagonSteps()
        await teach(this, key, [wagons[0], { ...wagons[1], buttonLabel: 'Próximo' }])
        if (gen !== this.gen) return

        const demos: [ItemId, Side, string][] = [
            [TRAINING[0], 'left', TEACH.part],
            [TRAINING[1], 'right', TEACH.program],
        ]
        for (const [id, side, text] of demos) {
            const view = await this.dropItem(id)
            if (gen !== this.gen) {
                view.destroy()
                return
            }
            this.switcher.setInviting(true)
            const wagon = this.train.rect(side)
            await teach(this, key, [
                {
                    text,
                    ...spot(union(STAGE, wagon)),
                    pointer: { fromX: wagon.x, fromY: wagon.y, toX: wagon.x, toY: wagon.y, tap: true },
                    buttonLabel: 'Ver',
                },
            ])
            if (gen !== this.gen) return
            await this.slide(view, side)
            await this.loadItem(view, side)
            if (gen !== this.gen) return
        }

        this.switcher.setInviting(false)
        await FX.wait(this, 400)
        if (gen !== this.gen) return
        this.guiding = false
        void this.startPhase(0, false)
    }

    private wagonSteps() {
        return [
            { text: TEACH.partWagon, ...spot(this.train.rect('left')) },
            { text: TEACH.programWagon, ...spot(this.train.rect('right')) },
        ]
    }

    private async explain() {
        if (this.mode !== 'choose' || this.guiding) return
        const gen = this.gen
        this.mode = 'panel'
        this.guiding = true
        this.switcher.setInviting(false)
        this.hud.setHelpEnabled(false)

        await teach(this, `${guideKey(this.level.level)}-help`, [
            ...this.wagonSteps(),
            { text: TEACH.help, ...spot(STAGE), buttonLabel: 'Continuar' },
        ])
        this.guiding = false
        if (gen !== this.gen) return
        this.mode = 'choose'
        this.switcher.setInviting(true)
        this.hud.setHelpEnabled(true)
    }

    private onShowTutorial() {
        void this.explain()
    }

    private async endLevel() {
        const gen = ++this.gen
        this.mode = 'finale'
        this.hud.setHelpEnabled(false)

        runtimeGameBridge.emit({
            type: 'GAME_COMPLETED',
            gameId: GAME_ID,
            stage: this.level.level,
            totalStages: LEVELS.length,
            score: Math.max(0, Math.round(this.score)),
            errors: this.errors,
        })
        this.emitCheckpoint()

        const all = this.level.phases.flatMap(phase => phase.items)
        await this.finale.order(this.level.order[0], this.level.order[1], i => this.audio.note(i))
        if (gen !== this.gen) return
        await this.finale.board(
            all.filter(id => ITEMS[id].kind === 'part'),
            all.filter(id => ITEMS[id].kind === 'program'),
        )
        if (gen !== this.gen) return
        this.audio.win()
        void FX.confetti(this, { colors: [APP.music, APP.game, APP.alarm, C.mint, C.lilac] })
        await FX.wait(this, FINALE_MS)
        if (gen !== this.gen) return

        this.mode = 'done'
        showLevelComplete(this, {
            accent: C.mint,
            panelColor: C.cream,
            overlayColor: C.shadow,
            titleColor: CSS.ink,
            subtitleColor: CSS.inkSoft,
            messageColor: CSS.inkSoft,
            title: this.level.level < LEVELS.length ? `Nível ${this.level.level} completo!` : 'Trem completo!',
            subtitle: this.level.title,
            message: this.level.message,
            stars: 3,
            progress: { total: this.level.phases.length, current: this.level.phases.length },
            ...(this.level.level < LEVELS.length
                ? {
                      autoAdvance: {
                          delay: 2600,
                          onComplete: () =>
                              this.scene.restart({ level: this.level.level + 1, points: this.score, lives: this.livesLeft }),
                      },
                  }
                : {
                      buttons: [
                          {
                              label: 'JOGAR DE NOVO',
                              color: C.mint,
                              onClick: () => this.scene.restart({ level: 1, points: 0, lives: this.livesTotal }),
                          },
                      ],
                  }),
        })
    }

    private emitCheckpoint() {
        runtimeGameBridge.emit({
            type: 'CHECKPOINT',
            gameId: GAME_ID,
            progress: Math.round((this.sorted / this.total) * 100),
            score: Math.max(0, Math.round(this.score)),
            stage: this.level.level,
            hits: this.hits,
            errors: this.errors,
        })
    }

    private bindPlatform() {
        this.unsubPlatform = runtimeGameBridge.onCommand((command: PlatformCommand) => {
            if (command.type === 'START_GAME') this.score = command.points ?? this.score
        })
    }

    private onMute(muted: boolean) {
        this.audio.setMuted(muted)
    }
}
