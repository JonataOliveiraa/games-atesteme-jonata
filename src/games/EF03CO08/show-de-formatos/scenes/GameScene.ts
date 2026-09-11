import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete, type LevelCompleteHandle } from '../../../../shared/level/showLevelComplete'
import { createTutorial } from '../../../../shared/tutorial/createTutorial'
import { FX } from '../../../../shared/effects/FX'
import { LEVELS, POINTS_PER_LAYER, THEME_LABEL, THEME_SCENES } from '../data/levels'
import {
    chosen,
    emptyClip,
    firstEmpty,
    LAYER_ORDER,
    pickedOf,
    setChoice,
    validateThemes,
} from '../data/rules'
import { DEPTH, H, HUD, W } from '../data/layout'
import { C, LAYER_COLOR } from '../data/theme'
import type { ClipScene, LayerId, LevelDef, LevelNumber, Mode, Picked, ScenePlan, ThemeId } from '../types'
import { createStage, type Stage } from './stage'
import { createScreen, type Screen } from './screen'
import { createHost, type Host } from './host'
import { createFilm, type Film } from './film'
import { createTabs, type Tabs } from './tabs'
import { createTray, type Tray, type TrayOption } from './tray'
import { createHud, type Hud } from './hud'
import { createAudio, type Audio } from './audio'
import { createThemePicker, type ThemePicker } from './themes'

const GAME_ID = 'show-de-formatos'
const SHOW_MS = 3600
const CLIP_MS = 3200

/**
 * Sem vidas e sem WRONG_ANSWER, de propósito: aqui toda escolha é autoral e
 * nenhuma é errada. Ver PLANEJAMENTO.md §11.
 */
export class GameScene extends Phaser.Scene {
    private level!: LevelDef
    private index = 0
    private clips: ClipScene[] = []
    private current: LayerId = 'image'
    private mode: Mode = 'intro'
    private gen = 0

    private score = 0
    private earned = 0
    private hits = 0
    private done = 0

    private tutorialOpen = false
    private pendingTutorial = true

    private stage!: Stage
    private screen!: Screen
    private host!: Host
    private film!: Film
    private tabs!: Tabs
    private tray!: Tray
    private hud!: Hud
    private audio!: Audio

    private veil!: Phaser.GameObjects.Rectangle
    private panel: LevelCompleteHandle | null = null
    private picker: ThemePicker | null = null
    private theme: ThemeId | null = null
    private unsubPlatform?: () => void

    private get scenes(): ScenePlan[] {
        return THEME_SCENES[this.theme ?? 'school']
    }

    private get plan(): ScenePlan {
        return this.scenes[this.index]
    }

    private get clip(): ClipScene {
        return this.clips[this.index]
    }

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number }) {
        const number = Phaser.Math.Clamp(data?.level ?? 1, 1, LEVELS.length) as LevelNumber
        this.level = LEVELS[number - 1]
        this.theme = this.level.theme ?? null
        this.index = 0
        this.clips = this.scenes.map(emptyClip)
        this.mode = 'intro'
        this.gen = 0
        this.score = data?.points ?? 0
        this.earned = 0
        this.hits = 0
        this.done = 0
        this.tutorialOpen = false
        this.pendingTutorial = true
    }

    create() {
        this.input.topOnly = true

        const problems = validateThemes()
        if (problems.length) console.error(`[${GAME_ID}]`, problems)

        this.stage = createStage(this)
        this.audio = createAudio(this)
        this.host = createHost(this)
        this.screen = createScreen(this)
        this.film = createFilm(this, index => void this.replayScene(index))
        this.tabs = createTabs(this, layer => void this.reopen(layer))
        this.tray = createTray(
            this,
            index => void this.pick(index),
            () => void this.present(),
        )
        this.hud = createHud(this, { label: this.level.label, onHelp: () => this.replayTutorial() })

        this.veil = this.add
            .rectangle(W / 2, H / 2, W, H, C.ink)
            .setAlpha(0)
            .setDepth(DEPTH.screen - 1)

        this.bindPlatform()
        EventBus.on('mute-audio', this.onMute, this)
        EventBus.on('show-tutorial', this.replayTutorial, this)
        this.events.once('shutdown', this.shutdownScene, this)

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        if (this.level.choose && !this.theme) void this.chooseTheme()
        else void this.startScene(0)
    }

    private async chooseTheme() {
        const gen = ++this.gen
        this.mode = 'intro'
        this.hud.setTitle('Escolha o tema do seu show')
        this.host.pose('presenting')
        this.picker = createThemePicker(this, theme => void this.takeTheme(theme))
        await this.picker.open()
        if (gen !== this.gen) this.picker?.destroy()
    }

    private async takeTheme(theme: ThemeId) {
        const picker = this.picker
        this.picker = null
        this.theme = theme
        this.clips = this.scenes.map(emptyClip)
        this.hud.setLabel(THEME_LABEL[theme])
        this.audio.pick()
        await picker?.close(theme)
        void this.startScene(0)
    }

    private shutdownScene() {
        this.gen++
        this.audio?.stop()
        this.picker?.destroy()
        this.panel?.destroy()
        this.tray?.destroy()
        this.tabs?.destroy()
        this.film?.destroy()
        this.screen?.destroy()
        this.host?.destroy()
        this.stage?.destroy()
        this.hud?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.replayTutorial, this)
        this.unsubPlatform?.()
    }

    private optionsOf(layer: LayerId): TrayOption[] {
        const plan = this.plan
        if (layer === 'image') return plan.images.map(choice => ({ kind: 'image', id: choice.id, frame: choice.frame }))
        if (layer === 'text') return plan.texts.map(choice => ({ kind: 'text', id: choice.id, line: choice.line }))
        return plan.sounds.map(choice => ({ kind: 'sound', id: choice.id, sound: choice.sound }))
    }

    private async startScene(index: number) {
        const gen = ++this.gen
        this.index = index
        this.mode = 'intro'
        this.earned = 0

        this.tabs.reset()
        this.tabs.setEnabled(false)
        this.film.setEnabled(false)
        this.film.highlight(null)
        this.screen.clear()
        this.screen.focus(false)
        this.hud.setTitle(this.plan.title)
        this.host.pose('presenting')

        await FX.wait(this, 460)
        if (gen !== this.gen) return

        await this.openLayer('image')
        if (gen !== this.gen) return

        if (this.pendingTutorial && index === 0 && this.level.level === 1) {
            this.pendingTutorial = false
            this.runTutorial(true)
        }
    }

    private async openLayer(layer: LayerId) {
        const gen = this.gen
        this.current = layer
        this.mode = 'busy'
        this.tabs.highlight(layer)
        this.tabs.set(layer, chosen(this.clip, layer) ? 'filled' : 'open')
        this.screen.focus(true, LAYER_COLOR[layer].fill)
        this.host.pose('idle')

        await this.tray.show(layer, this.optionsOf(layer), chosen(this.clip, layer))
        if (gen !== this.gen) return

        this.mode = 'choosing'
        this.applyInput()
    }

    private async pick(index: number) {
        if (this.mode !== 'choosing' || this.tutorialOpen) return
        const gen = this.gen
        const layer = this.current
        const option = this.optionsOf(layer)[index]
        const wasEmpty = !chosen(this.clip, layer)

        this.mode = 'busy'
        this.applyInput()
        this.audio.pick()
        this.tray.press(index)
        this.tray.mark(index)
        this.clips[this.index] = setChoice(this.clip, layer, option.id)

        if (option.kind === 'image') {
            this.audio.whoosh()
            await this.screen.show(option.frame)
            const line = this.linePicked()
            if (line) await this.screen.say(line)
        }
        if (option.kind === 'text') {
            this.audio.paper()
            await this.screen.say(option.line)
        }
        if (option.kind === 'sound') {
            this.audio.preview(option.sound)
            this.screen.setPlaying(option.sound)
            await this.tray.ripple(index)
            this.screen.setPlaying(null)
        }
        if (gen !== this.gen) return

        this.tabs.set(layer, 'filled')
        if (wasEmpty) {
            this.score += POINTS_PER_LAYER
            this.earned += POINTS_PER_LAYER
        }

        const next = firstEmpty(this.clip)
        if (next) {
            await this.tray.hide()
            if (gen !== this.gen) return
            await this.openLayer(next)
            return
        }
        await this.ready()
    }

    private linePicked() {
        const id = this.clip.textId
        return this.plan.texts.find(choice => choice.id === id)?.line
    }

    private async ready() {
        const gen = this.gen
        this.mode = 'busy'
        this.screen.focus(false)
        this.tabs.highlight(null)
        this.host.pose('presenting')

        await this.tray.hide()
        if (gen !== this.gen) return

        this.tray.showPresent(true, true)
        this.tabs.setEnabled(true)
        this.mode = 'ready'
        this.applyInput()
    }

    private async reopen(layer: LayerId) {
        if (this.mode !== 'ready' && this.mode !== 'choosing') return
        if (this.tutorialOpen) return
        const gen = this.gen
        this.mode = 'busy'
        this.applyInput()
        this.audio.tap()
        this.tabs.setEnabled(false)

        await this.tray.hide()
        if (gen !== this.gen) return
        await this.openLayer(layer)
    }

    private async present() {
        if (this.mode !== 'ready' || this.tutorialOpen) return
        const gen = this.gen
        const picked = pickedOf(this.plan, this.clip)
        if (!picked) return

        this.mode = 'showing'
        this.applyInput()
        this.tabs.setEnabled(false)
        this.hud.setEnabled(false)
        await this.tray.hide()
        if (gen !== this.gen) return

        await this.enterShow(false)
        if (gen !== this.gen) return

        await this.playPicked(picked, SHOW_MS, gen)
        if (gen !== this.gen) return

        await this.exitShow()
        if (gen !== this.gen) return

        await this.host.cheer()
        if (gen !== this.gen) return

        this.audio.store()
        const rect = this.screen.artRect()
        this.screen.clear()
        await this.film.fill(this.index, picked.frame, { x: rect.x, y: rect.y, w: rect.w })
        if (gen !== this.gen) return

        this.done += 1
        this.hits += 1
        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER',
            gameId: GAME_ID,
            pointsEarned: this.earned,
            stage: this.level.level,
        })
        this.emitCheckpoint()
        this.hud.setEnabled(true)

        const next = this.index + 1
        if (next < this.scenes.length) void this.startScene(next)
        else void this.endLevel()
    }

    private async enterShow(keepFilm: boolean) {
        this.screen.focus(false)
        this.film.lift(keepFilm)
        await FX.all(
            this.hud.fade(false),
            this.tabs.fade(false),
            keepFilm ? Promise.resolve() : this.film.fade(false),
            FX.to(this, this.veil, { alpha: 0.82 }, { duration: 380 }),
        )
        await this.screen.cinema(true)
    }

    private async exitShow() {
        this.film.highlight(null)
        await this.screen.cinema(false)
        this.film.lift(false)
        await FX.all(
            this.hud.fade(true),
            this.tabs.fade(true),
            this.film.fade(true),
            FX.to(this, this.veil, { alpha: 0 }, { duration: 380 }),
        )
    }

    private async playPicked(picked: Picked, ms: number, gen: number) {
        this.stage.lights(true, true)
        this.host.pose('dancing')
        this.screen.setPlaying(picked.sound)
        this.audio.play(picked.sound, ms / 1000)
        await FX.wait(this, ms)
        this.audio.stop()
        this.screen.setPlaying(null)
        this.stage.lights(false)
        return gen === this.gen
    }

    private async replayScene(index: number) {
        if (this.mode !== 'ready' || this.tutorialOpen) return
        const gen = this.gen
        const picked = pickedOf(this.scenes[index], this.clips[index])
        if (!picked) return

        this.mode = 'showing'
        this.applyInput()
        this.tabs.setEnabled(false)
        await this.tray.hide()
        if (gen !== this.gen) return

        await this.enterShow(true)
        if (gen !== this.gen) return
        this.film.highlight(index)
        this.screen.clear()
        await this.screen.show(picked.frame)
        if (gen !== this.gen) return
        void this.screen.say(picked.line)
        await this.playPicked(picked, CLIP_MS, gen)
        if (gen !== this.gen) return

        await this.exitShow()
        if (gen !== this.gen) return

        this.screen.clear()
        const own = pickedOf(this.plan, this.clip)
        if (own) {
            await this.screen.show(own.frame)
            await this.screen.say(own.line)
        }
        if (gen !== this.gen) return
        await this.ready()
    }

    private async endLevel() {
        const gen = ++this.gen
        this.mode = 'clip'
        this.applyInput()
        this.tabs.setEnabled(false)
        this.film.setEnabled(false)
        this.hud.setEnabled(false)

        runtimeGameBridge.emit({
            type: 'GAME_COMPLETED',
            gameId: GAME_ID,
            stage: this.level.level,
            totalStages: LEVELS.length,
            score: Math.max(0, Math.round(this.score)),
            errors: 0,
        })
        this.emitCheckpoint(true)

        await this.stage.close()
        if (gen !== this.gen) return
        this.screen.clear()
        await this.stage.open()
        if (gen !== this.gen) return

        await this.playClip(gen)
        if (gen !== this.gen) return
        this.showPanel()
    }

    private async playClip(gen: number) {
        await this.enterShow(true)
        if (gen !== this.gen) return false

        for (let i = 0; i < this.scenes.length; i++) {
            const picked = pickedOf(this.scenes[i], this.clips[i])
            if (!picked) continue
            this.film.highlight(i)
            this.screen.clear()
            await this.screen.show(picked.frame)
            if (gen !== this.gen) return false
            void this.screen.say(picked.line)
            const alive = await this.playPicked(picked, CLIP_MS, gen)
            if (!alive) return false
        }

        this.host.pose('celebrating')
        this.audio.applause()
        await this.exitShow()
        return gen === this.gen
    }

    private showPanel() {
        this.mode = 'done'
        this.applyInput()
        this.film.setEnabled(true)
        this.audio.fanfare()
        void FX.confetti(this, { colors: [C.purple, C.coral, C.yellow, C.blue] })

        const last = this.level.level >= LEVELS.length
        this.panel = showLevelComplete(this, {
            accent: C.purple,
            panelColor: C.cream,
            overlayColor: C.ink,
            depth: 5000,
            title: last ? 'Seu clipe ficou pronto!' : 'Clipe pronto!',
            message: last ? 'Você usou imagem, texto e som para se expressar.' : undefined,
            progress: { total: LEVELS.length, current: this.level.level, size: 9 },
            buttons: [
                {
                    label: 'Assistir de novo',
                    color: C.ok,
                    onClick: () => void this.watchAgain(),
                },
                last
                    ? {
                          label: 'Escolher jogo',
                          color: C.purple,
                          onClick: () => EventBus.emit('exit-game'),
                      }
                    : {
                          label: 'Continuar',
                          color: C.purple,
                          onClick: () =>
                              this.scene.restart({
                                  level: (this.level.level + 1) as LevelNumber,
                                  points: this.score,
                              }),
                      },
            ],
        })
    }

    private async watchAgain() {
        const gen = this.gen
        this.panel?.destroy()
        this.panel = null
        this.mode = 'clip'
        this.applyInput()
        const alive = await this.playClip(gen)
        if (!alive) return
        this.showPanel()
    }

    private applyInput() {
        const free = !this.tutorialOpen && this.mode === 'choosing'
        this.tray.setEnabled(free, !this.tutorialOpen && this.mode !== 'choosing')
        this.film.setEnabled(!this.tutorialOpen && (this.mode === 'ready' || this.mode === 'done'))
    }

    private tutorialSteps() {
        return [
            {
                text: 'Aqui aparece a sua cena.',
                shape: 'rect' as const,
                ...this.screen.bounds(),
                balloonX: 640,
                balloonY: 596,
            },
            {
                text: 'Imagem, frase e som: os três formatos.',
                shape: 'rect' as const,
                ...this.tabs.bounds(),
                balloonX: 640,
                balloonY: 250,
            },
            {
                text: 'Toque no que você quer usar.',
                shape: 'rect' as const,
                ...this.tray.bounds(),
                balloonX: 640,
                balloonY: 300,
                buttonLabel: 'Vamos!',
            },
        ]
    }

    private runTutorial(once: boolean) {
        this.tutorialOpen = true
        this.applyInput()
        this.hud.setEnabled(false)
        createTutorial(this, {
            key: `ef03co08-show-de-formatos-l${this.level.level}`,
            once,
            accent: C.purple,
            safeTop: HUD.h + 14,
            steps: this.tutorialSteps(),
            onFinish: () => {
                this.tutorialOpen = false
                this.hud.setEnabled(true)
                this.applyInput()
            },
        })
    }

    private replayTutorial() {
        if (this.tutorialOpen || this.mode !== 'choosing') return
        this.runTutorial(false)
    }

    private emitCheckpoint(complete = false) {
        const total = this.scenes.length * LAYER_ORDER.length
        const filled = complete
            ? total
            : this.clips.reduce((sum, clip) => sum + LAYER_ORDER.filter(layer => chosen(clip, layer)).length, 0)
        runtimeGameBridge.emit({
            type: 'CHECKPOINT',
            gameId: GAME_ID,
            progress: Math.round((Math.min(filled, total) / total) * 100),
            score: Math.max(0, Math.round(this.score)),
            stage: this.level.level,
            hits: this.hits,
            errors: 0,
        })
    }

    private bindPlatform() {
        this.unsubPlatform = runtimeGameBridge.onCommand((command: PlatformCommand) => {
            if (command.type === 'START_GAME') {
                this.score = command.points ?? this.score
                if (command.stage && command.stage !== this.level.level) {
                    this.scene.restart({ level: command.stage, points: this.score })
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
