import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { FX } from '../../../../shared/effects/FX'

import { LEVELS, POINTS, TUTORIAL, guideKey, isRight } from '../data/levels'
import { beatMs, endMs, notesOf } from '../data/song'
import { C, CSS } from '../data/theme'
import { TIMING } from '../data/timing'
import { HELP, LABEL, TEACH, TEACH2, TEACH3 } from '../data/words'
import type { Cd, ChartNote, Grade, Lane, LevelDef, PhaseDef, State } from '../types'

import { createAudio, type Audio } from './audio'
import { createBanner, type Banner } from './banner'
import { createBubble, type Bubble } from './bubble'
import { createCrate, type Crate } from './crate'
import { createCutin, type Cutin } from './cutin'
import { createDisc, type Disc } from './disc'
import { spot, teach } from './guide'
import { createHeader, type Header } from './header'
import { createHighway, type Highway } from './highway'
import { createJudge, type Judge } from './judge'
import { createLive, type Live } from './live'
import { createStage, type Stage } from './stage'

const GAME_ID = 'radio-da-escola'

type SongEnd = 'end' | 'refuse'

export class GameScene extends Phaser.Scene {
    private livesTotal = 1
    private livesLeft = 1

    private level!: LevelDef
    private phaseIndex = 0
    private state: State = 'intro'
    private gen = 0
    private introduce = false
    private taught = false

    private cd: Cd | null = null
    private songMs = 0
    private half = 0
    private endAt = 0
    private refuseAt = Infinity
    private songNotes = 0
    private songHits = 0
    private combo = 0
    private cheering = false
    private songDone: ((result: SongEnd) => void) | null = null
    private melodyNotes: ChartNote[] = []
    private melodyIndex = 0
    private right = false

    private score = 0
    private hits = 0
    private errors = 0
    private done = 0
    private notesTotal = 0
    private notesHit = 0

    private audio!: Audio
    private stage!: Stage
    private highway!: Highway
    private disc!: Disc
    private judge!: Judge
    private live!: Live
    private cutin!: Cutin
    private crate!: Crate
    private header!: Header
    private bubble!: Bubble
    private banner!: Banner

    private unsubPlatform?: () => void

    private get phase(): PhaseDef {
        return this.level.phases[this.phaseIndex]
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
        this.state = 'intro'
        this.introduce = false
        this.taught = false
        this.cd = null
        this.songMs = 0
        this.half = 0
        this.endAt = 0
        this.refuseAt = Infinity
        this.songNotes = 0
        this.songHits = 0
        this.combo = 0
        this.cheering = false
        this.songDone = null
        this.melodyNotes = []
        this.melodyIndex = 0
        this.right = false
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.done = 0
        this.notesTotal = 0
        this.notesHit = 0
        this.unsubPlatform = undefined
    }

    create() {
        this.input.topOnly = true
        this.audio = createAudio()
        this.stage = createStage(this)
        this.highway = createHighway(this)
        this.disc = createDisc(this)
        this.judge = createJudge(this)
        this.live = createLive(this)
        this.cutin = createCutin(this)
        this.crate = createCrate(this)
        this.header = createHeader(this, {
            level: this.level.level,
            phases: this.level.phases.length,
            livesTotal: this.livesTotal,
            livesLeft: this.livesLeft,
            gameId: GAME_ID,
            stage: () => this.level.level,
            onHelp: () => void this.explain(),
        })
        this.bubble = createBubble(this)
        this.banner = createBanner(this)
        this.highway.onLane(lane => this.onLane(lane))

        this.game.canvas.addEventListener('pointerdown', this.focusGame)
        this.focusGame()
        this.bindPlatform()
        EventBus.on('mute-audio', this.onMute, this)
        EventBus.on('show-tutorial', this.onShowTutorial, this)
        this.events.once('shutdown', this.shutdownScene, this)

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        const key = guideKey(this.level.level)
        this.introduce = !this.registry.get(key)
        this.registry.set(key, true)
        void this.openLevel()
    }

    private focusGame = () => window.focus()

    private shutdownScene() {
        this.gen++
        this.songDone = null
        this.game.canvas?.removeEventListener('pointerdown', this.focusGame)
        this.banner?.destroy()
        this.bubble?.destroy()
        this.header?.destroy()
        this.crate?.destroy()
        this.cutin?.destroy()
        this.live?.destroy()
        this.judge?.destroy()
        this.disc?.destroy()
        this.highway?.destroy()
        this.stage?.destroy()
        this.audio?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.onShowTutorial, this)
        this.unsubPlatform?.()
    }

    // ───────────────────────────────────────────── a música, quadro a quadro

    update(_time: number, deltaMs: number) {
        if (this.state !== 'air' && this.state !== 'demo') return
        const cd = this.cd
        if (!cd) return
        this.songMs += Math.min(deltaMs, 50)
        const half = beatMs(cd.song) / 2
        while (this.half * half <= this.songMs) {
            this.backing(this.half, cd)
            this.half += 1
        }
        while (this.melodyIndex < this.melodyNotes.length && this.melodyNotes[this.melodyIndex].t <= this.songMs) {
            this.audio.melody(cd.song.scale[this.melodyNotes[this.melodyIndex].lane])
            this.melodyIndex += 1
        }
        if (this.state === 'demo') this.highway.due(this.songMs).forEach(lane => this.onNote(lane, cd, 'perfect'))
        if (this.highway.update(this.songMs) > 0) {
            this.combo = 0
            this.judge.combo(0)
        }
        if (this.songMs >= this.refuseAt) this.finishSong('refuse')
        else if (this.songMs >= this.endAt) this.finishSong('end')
    }

    private backing(step: number, cd: Cd) {
        if (step * (beatMs(cd.song) / 2) > this.endAt - beatMs(cd.song)) return
        if (step % 2) {
            this.audio.hat()
            return
        }
        this.audio.kick()
        if (step % 8 === 0) this.audio.bass(cd.song.root)
        if (step % 8 === 4) this.audio.bass(cd.song.root + 7)
    }

    private finishSong(result: SongEnd) {
        this.state = 'intro'
        this.highway.setInput(false)
        const done = this.songDone
        this.songDone = null
        done?.(result)
    }

    private playSong(cd: Cd, approach: number, mode: 'air' | 'demo'): Promise<SongEnd> {
        const remix = this.level.mode === 'remix' && mode === 'air'
        const notes = notesOf(remix ? { ...cd.song, chart: cd.song.beats ?? cd.song.chart } : cd.song)
        this.melodyNotes = remix ? notesOf(cd.song) : []
        this.melodyIndex = 0
        this.right = mode === 'demo' || isRight(this.level, cd)
        this.cd = cd
        this.songMs = 0
        this.half = 0
        this.songNotes = notes.length
        this.songHits = 0
        this.combo = 0
        this.endAt = endMs(cd.song)
        this.refuseAt = this.right ? Infinity : TIMING.refuse
        this.highway.load(notes, approach)
        this.highway.setInput(mode === 'air' && this.right)
        return new Promise(resolve => {
            this.songDone = resolve
            this.state = mode
        })
    }

    private onLane(lane: Lane) {
        const cd = this.cd
        if (this.state !== 'air' || !cd || !this.right) return
        const grade = this.highway.hit(lane, this.songMs)
        if (!grade) {
            this.audio.tick()
            return
        }
        this.notesHit += 1
        this.onNote(lane, cd, grade)
    }

    private onNote(lane: Lane, cd: Cd, grade: Grade) {
        if (this.melodyNotes.length) this.audio.drum(lane)
        else this.audio.melody(cd.song.scale[lane])
        this.songHits += 1
        this.combo += 1
        this.judge.show(grade)
        this.judge.combo(this.combo)
        this.stage.flash()
        this.stage.hearts(1)
        if (this.state === 'demo' && this.songHits === 1) {
            this.live.expr('happy')
            this.live.dance(true)
        }
        if (this.state === 'air' && this.combo % TIMING.combo === 0) void this.cheer(this.gen, cd)
    }

    private async cheer(gen: number, cd: Cd) {
        if (this.cheering) return
        this.cheering = true
        await this.live.show(cd.owner, 'happy')
        this.live.dance(true)
        await FX.wait(this, 1600)
        this.cheering = false
        if (gen !== this.gen || this.state !== 'air') return
        await this.live.hide()
    }

    private async peek(gen: number) {
        await FX.wait(this, TIMING.live)
        if (gen !== this.gen || this.state !== 'air' || this.cheering) return
        await this.live.hide()
    }

    // ───────────────────────────────────────────── falas

    private dudaSays(text: string, button?: string) {
        const head = this.cutin.head()
        return this.bubble.say(text, { x: head.x + 330, y: head.y + 60 }, button)
    }

    private ownerSays(text: string, button?: string) {
        return this.bubble.say(text, this.live.anchor(), button)
    }

    // ───────────────────────────────────────────── nível e fases

    private async openLevel() {
        const gen = ++this.gen
        this.state = 'intro'
        this.header.setPhase(0)
        this.header.setHelpEnabled(false)
        if (this.introduce) {
            if (this.level.level === 1) await this.intro(gen)
            else await this.dudaIntro(gen, this.level.level === 2 ? [TEACH2.remix, TEACH2.beat] : [TEACH3.six])
            if (gen !== this.gen) return
            this.taught = true
        }
        await this.startPhase(gen, true)
    }

    private async intro(gen: number) {
        const key = guideKey(this.level.level)
        await FX.wait(this, 300)
        if (gen !== this.gen) return
        await this.cutin.enter('talk')
        if (gen !== this.gen) return
        await this.dudaSays(TEACH.hello, 'Próximo')
        if (gen !== this.gen) return
        await this.dudaSays(TEACH.today, 'Próximo')
        if (gen !== this.gen) return
        this.cutin.pose('cheer')
        await FX.wait(this, 300)
        await this.cutin.leave()
        if (gen !== this.gen) return

        await this.crate.show(TUTORIAL.cds, 'row')
        if (gen !== this.gen) return
        await teach(this, key, [
            { text: TEACH.owner, ...spot(this.crate.casesRect()), balloonY: 560, buttonLabel: 'Próximo' },
            { text: TEACH.note, ...spot(this.crate.notesRect()), balloonY: 300, buttonLabel: 'Ver' },
        ])
        if (gen !== this.gen) return

        const index = TUTORIAL.cds.findIndex(cd => cd.plays)
        const cd = TUTORIAL.cds[index]
        await FX.wait(this, 400)
        if (gen !== this.gen) return
        await this.crate.press(index)
        if (gen !== this.gen) return
        await this.insert(gen, cd, index)
        if (gen !== this.gen) return
        await this.onAir(gen, cd, false)
        if (gen !== this.gen) return
        await teach(this, key, [
            { text: TEACH.credit, ...spot(this.header.centerRect()), balloonY: 200, buttonLabel: 'Próximo' },
            { text: TEACH.live, ...spot(this.live.rect()), balloonX: 700, balloonY: 330, buttonLabel: 'Ver' },
        ])
        if (gen !== this.gen) return

        await this.playSong(cd, TUTORIAL.approach, 'demo')
        if (gen !== this.gen) return
        this.live.dance(false)
        await teach(this, key, [{ text: TEACH.go, buttonLabel: 'Vamos!' }])
        if (gen !== this.gen) return
        await this.offAir(gen)
    }

    private async dudaIntro(gen: number, lines: string[]) {
        await FX.wait(this, 300)
        if (gen !== this.gen) return
        await this.cutin.enter('talk')
        if (gen !== this.gen) return
        for (const line of lines) {
            await this.dudaSays(line, 'Próximo')
            if (gen !== this.gen) return
            this.cutin.pose('sing')
        }
        this.cutin.pose('cheer')
        await FX.wait(this, 300)
        await this.cutin.leave()
    }

    private whichText() {
        return this.level.level === 1 ? HELP.which : this.level.level === 2 ? TEACH2.only : HELP.which3
    }

    private async showCard(gen: number) {
        const key = guideKey(this.level.level)
        await teach(this, `${key}-open`, [{ text: TEACH3.open, ...spot(this.crate.casesRect()), balloonY: 600, buttonLabel: 'Ver' }])
        if (gen !== this.gen) return
        await this.crate.open(0)
        if (gen !== this.gen) return
        await teach(this, `${key}-read`, [{ text: TEACH3.read, ...spot(this.crate.cardRect()), balloonY: 640, buttonLabel: 'Próximo' }])
        if (gen !== this.gen) return
        await this.crate.close()
    }

    private async startPhase(gen: number, first: boolean) {
        this.state = 'intro'
        this.header.setHelpEnabled(false)
        this.header.ask(this.level.ask)
        await FX.wait(this, TIMING.beat)
        if (gen !== this.gen) return
        await this.crate.show(this.phase.cds, this.level.layout)
        if (gen !== this.gen) return
        if (first && this.level.layout === 'grid' && this.taught) {
            await this.showCard(gen)
            if (gen !== this.gen) return
        }
        if (first && (this.level.level > 1 || !this.taught)) {
            const target = this.level.layout === 'grid' ? this.crate.casesRect() : this.crate.notesRect()
            await teach(this, `${guideKey(this.level.level)}-which`, [
                { text: this.whichText(), ...spot(target), balloonY: this.level.level > 1 ? 640 : 300, buttonLabel: 'Ok' },
            ])
            if (gen !== this.gen) return
        }
        this.choose(gen)
    }

    private choose(gen: number) {
        this.state = 'choose'
        this.header.setHelpEnabled(true)
        this.crate.enable(index => void this.pick(gen, index))
    }

    private async insert(gen: number, cd: Cd, index: number) {
        this.audio.pop()
        const from = this.crate.take(index)
        this.header.ask(null)
        this.audio.whoosh()
        await this.disc.fly(cd.cover, from, from.size)
        if (gen !== this.gen) return
        this.audio.clack()
        this.crate.clear()
    }

    private async onAir(gen: number, cd: Cd, duda: boolean) {
        this.audio.jingle()
        this.disc.spin(true)
        this.header.onAir(this.level.mode === 'remix' ? LABEL.remix(cd) : LABEL.credit(cd))
        this.highway.setLaneIcons(this.level.mode === 'remix')
        this.stage.flash()
        this.judge.reset()
        if (duda) void this.cutin.flash('sing')
        await this.live.show(cd.owner, 'listen')
        if (gen !== this.gen) return
        await FX.wait(this, 250)
    }

    private async offAir(gen: number) {
        this.live.dance(false)
        this.header.offAir()
        this.highway.setLaneIcons(false)
        this.judge.reset()
        await FX.all(this.disc.eject(), this.live.hide())
        if (gen !== this.gen) return
        this.highway.clear()
        this.cd = null
    }

    private async pick(gen: number, index: number) {
        if (this.state !== 'choose') return
        this.state = 'intro'
        this.header.setHelpEnabled(false)
        const cd = this.phase.cds[index]
        await this.insert(gen, cd, index)
        if (gen !== this.gen) return
        const right = isRight(this.level, cd)
        if (right) {
            this.score += POINTS
            this.hits += 1
            runtimeGameBridge.emit({ type: 'CORRECT_ANSWER', gameId: GAME_ID, pointsEarned: POINTS, stage: this.level.level })
            this.emitCheckpoint()
        }
        await this.onAir(gen, cd, true)
        if (gen !== this.gen) return
        if (right && this.level.mode === 'remix' && this.taught && this.phaseIndex === 0) {
            await teach(this, `${guideKey(this.level.level)}-lanes`, [{ text: TEACH2.lanes, ...spot(this.highway.rect()), balloonY: 300, buttonLabel: 'Vamos!' }])
            if (gen !== this.gen) return
        }
        const song = this.playSong(cd, this.phase.approach, 'air')
        void this.peek(gen)
        const result = await song
        if (gen !== this.gen) return
        if (result === 'refuse') {
            await this.refuse(gen, cd)
            return
        }
        await this.songEnd(gen, cd)
    }

    private async songEnd(gen: number, cd: Cd) {
        this.notesTotal += this.songNotes
        this.audio.good()
        this.stage.hearts(6)
        await this.live.show(cd.owner, 'happy')
        if (gen !== this.gen) return
        this.live.dance(true)
        await this.ownerSays(cd.thanks ?? '', 'Próximo')
        if (gen !== this.gen) return
        this.done += 1
        this.emitCheckpoint()
        this.audio.pop()
        await this.header.celebrate(this.phaseIndex)
        if (gen !== this.gen) return
        await this.offAir(gen)
        if (gen !== this.gen) return
        this.phaseIndex += 1
        if (this.phaseIndex >= this.level.phases.length) {
            void this.endLevel()
            return
        }
        this.header.setPhase(this.phaseIndex)
        await this.startPhase(gen, false)
    }

    // ───────────────────────────────────────────── erro

    private async refuse(gen: number, cd: Cd) {
        this.state = 'error'
        this.highway.setInput(false)
        this.audio.scratch()
        void this.disc.jam()
        void this.header.flicker()
        this.highway.drop()
        this.judge.reset()
        void this.cutin.flash('startled')
        await this.live.show(cd.owner, 'upset')
        if (gen !== this.gen) return
        this.live.expr('upset')
        if (cd.complaint) void this.ownerSays(cd.complaint)
        await FX.wait(this, 900)
        if (gen !== this.gen) return
        this.banner.say(cd.refusal ?? '')
        await FX.wait(this, TIMING.error)
        if (gen !== this.gen) return
        this.lose()
    }

    private lose() {
        this.gen++
        this.state = 'done'
        this.highway.setInput(false)
        this.crate.disable()
        this.header.setHelpEnabled(false)
        this.audio.lose()
        this.errors += 1
        runtimeGameBridge.emit({ type: 'WRONG_ANSWER', gameId: GAME_ID, pointsEarned: -5, stage: this.level.level })
        this.header.lives.lose()
        this.livesLeft = this.header.lives.remaining
    }

    // ───────────────────────────────────────────── ajuda

    private async explain() {
        if (this.state !== 'choose') return
        const gen = this.gen
        this.state = 'help'
        this.crate.disable()
        this.header.setHelpEnabled(false)
        await teach(this, `${guideKey(this.level.level)}-help`, [
            {
                text: this.level.level === 1 ? HELP.read : this.level.level === 2 ? HELP.read2 : HELP.read3,
                ...spot(this.level.layout === 'grid' ? this.crate.casesRect() : this.crate.notesRect()),
                balloonY: this.level.level > 1 ? 640 : 300,
                buttonLabel: 'Continuar',
            },
        ])
        if (gen !== this.gen) return
        this.choose(gen)
    }

    private onShowTutorial() {
        void this.explain()
    }

    // ───────────────────────────────────────────── fim

    private stars() {
        const ratio = this.notesTotal ? this.notesHit / this.notesTotal : 1
        return ratio >= 0.9 ? 3 : ratio >= 0.7 ? 2 : 1
    }

    private async endLevel() {
        const gen = ++this.gen
        this.state = 'finale'
        this.header.setHelpEnabled(false)
        this.audio.win()
        void this.cutin.enter('cheer')
        void FX.confetti(this, { colors: [C.pink, C.cyan, C.lemon, C.mint, C.violet] })
        await FX.wait(this, TIMING.finale)
        if (gen !== this.gen) return

        runtimeGameBridge.emit({
            type: 'GAME_COMPLETED',
            gameId: GAME_ID,
            stage: this.level.level,
            totalStages: LEVELS.length,
            score: Math.max(0, Math.round(this.score)),
            errors: this.errors,
        })
        this.emitCheckpoint()
        this.state = 'done'
        const last = this.level.level >= LEVELS.length
        showLevelComplete(this, {
            accent: C.accent,
            panelColor: C.paper,
            overlayColor: C.shadow,
            titleColor: CSS.ink,
            subtitleColor: CSS.accent,
            messageColor: CSS.inkSoft,
            title: `Nível ${this.level.level} completo!`,
            subtitle: this.level.title,
            message: this.level.message,
            stars: this.stars(),
            progress: { total: this.level.phases.length, current: this.level.phases.length },
            ...(!last
                ? {
                      autoAdvance: {
                          delay: 2600,
                          onComplete: () => this.scene.restart({ level: this.level.level + 1, points: this.score, lives: this.livesLeft }),
                      },
                  }
                : {
                      buttons: [
                          {
                              label: 'JOGAR DE NOVO',
                              color: C.accent,
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
            progress: Math.min(100, Math.round((this.done / this.level.phases.length) * 100)),
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
