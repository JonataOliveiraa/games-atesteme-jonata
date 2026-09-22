import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { markTutorialSeen, wasTutorialSeen } from '../../../../shared/tutorial/tutorialStorage'
import { FX, type FxTarget } from '../../../../shared/effects/FX'

import {
    LEVELS,
    TOTAL_SITES,
    belongsTo,
    chunkOfPiece,
    groundFor,
    piecesOf,
    pointsFor,
} from '../data/levels'
import { BG, POSE, type Pose } from '../data/files'
import { DEPTH, H, TERR, W } from '../data/layout'
import { C, CSS } from '../data/theme'
import type { LevelDef, Phase, PieceDef, SiteDef } from '../types'

import { createAudio, type Audio } from './audio'
import { createGround, type Ground } from './ground'
import { createHint, type Hint } from './hint'
import { createHud, type Hud } from './hud'
import { createTerrain, type Terrain } from './terrain'
import { createTuca, type Tuca } from './tuca'
import { createVeil, type Veil } from './veil'

const GAME_ID = 'canteiro-de-obras'
const OPENING_KEY = 'ef15co04cdo-abertura'
const GUIDE_KEY = 'ef15co04cdo-l1'

const fx = (o: unknown) => o as unknown as FxTarget

const HELP: Record<string, string> = {
    cutting: 'Toque na tesoura para cortar o terreno.',
    choosing: 'Toque num pedaço para trabalhar nele.',
    working: 'Toque nas peças que são deste pedaço.',
}

export class GameScene extends Phaser.Scene {
    private lives!: Lives
    private livesTotal = 3
    private livesLeft = 3

    private level!: LevelDef
    private siteIndex = 0
    private phase: Phase = 'intro'
    private gen = 0

    private placed = new Set<string>()
    private builtCount = 0
    private openIndex = -1
    private missedHere = false
    private wrongHere = 0
    private guiding = false
    private waiters = new Map<string, () => void>()
    private marks = new Set<string>()

    private score = 0
    private hits = 0
    private errors = 0
    private sitesDone = 0

    private audio!: Audio
    private terrain!: Terrain
    private ground!: Ground
    private tuca!: Tuca
    private hud!: Hud
    private hint!: Hint
    private veil!: Veil
    private banner?: Phaser.GameObjects.Container

    private unsubPlatform?: () => void

    private get site(): SiteDef {
        return this.level.sites[this.siteIndex]
    }

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this, 3)
        this.livesLeft = data?.lives ?? this.livesTotal

        const number = Phaser.Math.Clamp(data?.level ?? faseInicial(this, 1), 1, LEVELS.length)
        this.level = LEVELS[number - 1]

        this.siteIndex = 0
        this.phase = 'intro'
        this.placed = new Set()
        this.builtCount = 0
        this.openIndex = -1
        this.missedHere = false
        this.wrongHere = 0
        this.guiding = false
        this.waiters = new Map()
        this.marks = new Set()
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.sitesDone = 0
    }

    create() {
        this.input.topOnly = true
        this.buildBackground()

        this.audio = createAudio()
        this.terrain = createTerrain(this, {
            onCut: lotId => void this.cut(lotId),
            onChunk: index => void this.openChunk(index),
        })
        this.ground = createGround(this, id => void this.pick(id))
        this.tuca = createTuca(this)
        this.hint = createHint(this)
        this.veil = createVeil(this, { depth: DEPTH.veil })
        this.hud = createHud(this, {
            sites: this.level.sites.length,
            onHelp: () => void this.explain(),
        })

        this.input.on('pointerdown', () => this.hint.poke())

        this.bindPlatform()
        EventBus.on('mute-audio', this.onMute, this)
        EventBus.on('show-tutorial', this.onShowTutorial, this)
        this.events.once('shutdown', this.shutdownScene, this)

        this.lives = createLives(this, {
            total: this.livesTotal,
            remaining: this.livesLeft,
            gameId: GAME_ID,
            x: 40,
            y: 40,
            size: 30,
            tint: C.amber,
            color: CSS.white,
            stroke: CSS.ink,
            strokeThickness: 6,
            depth: DEPTH.hud + 1,
            stage: () => this.level.level,
        })
        this.events.once('shutdown', () => this.lives.destroy())

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        void this.startSite(0)
    }

    private buildBackground() {
        if (this.textures.exists(BG)) {
            this.add.image(W / 2, H / 2, BG).setDisplaySize(W, H).setDepth(DEPTH.bg)
            return
        }
        const g = this.add.graphics().setDepth(DEPTH.bg)
        g.fillGradientStyle(C.sky, C.sky, C.dirtLight, C.dirtLight, 1)
        g.fillRect(0, 0, W, H)
        g.fillStyle(C.dirt, 1)
        g.fillRect(0, 250, W, H - 250)
    }

    private shutdownScene() {
        this.gen++
        this.waiters.forEach(resolve => resolve())
        this.waiters.clear()
        this.banner?.destroy()
        this.veil?.destroy()
        this.hint?.destroy()
        this.tuca?.destroy()
        this.ground?.destroy()
        this.terrain?.destroy()
        this.hud?.destroy()
        this.audio?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.onShowTutorial, this)
        this.unsubPlatform?.()
    }

    /* ─────────────────────── o que é para tocar respira ─────────────────── */

    private setPhase(next: Phase) {
        this.phase = next

        const cutting = next === 'cutting'
        const choosing = next === 'choosing'
        const working = next === 'working'

        this.terrain.setCutsEnabled(cutting)
        this.terrain.setChunksEnabled(choosing || cutting)
        this.ground.setEnabled(working)
        this.hud.setHelpEnabled(!this.guiding && (cutting || choosing || working))

        if (cutting) {
            this.ground.calm()
            this.terrain.pulseCuts()
            this.hint.arm(() =>
                this.terrain
                    .pendingCuts()
                    .map(id => this.terrain.cutBox(id))
                    .filter((b): b is NonNullable<typeof b> => !!b),
            )
            return
        }

        if (choosing) {
            this.ground.calm()
            this.terrain.pulseChunks()
            this.hint.arm(() => this.terrain.chunks().map((_, i) => this.terrain.chunkBox(i)))
            return
        }

        if (working) {
            this.terrain.calm()
            this.ground.pulse()
            this.hint.arm(() => {
                const chunk = this.terrain.chunks()[this.openIndex]
                if (!chunk) return []
                return piecesOf(chunk)
                    .filter(p => !this.placed.has(p.id))
                    .map(p => this.ground.boxOf(p.id))
            })
            return
        }

        this.terrain.calm()
        this.ground.calm()
        this.hint.stop()
    }

    /** Fala com a cena parada, e devolve a fase de antes. */
    private async speak(text: string, pose: Pose = POSE.talk) {
        const back = this.phase
        this.setPhase('busy')
        await this.tuca.say(text, pose)
        this.tuca.hideBalloon()
        if (this.phase === 'busy') this.setPhase(back)
    }

    private wait(key: string): Promise<void> {
        if (this.marks.has(key)) return Promise.resolve()
        return new Promise(resolve => this.waiters.set(key, resolve))
    }

    private mark(key: string) {
        this.marks.add(key)
        const resolve = this.waiters.get(key)
        this.waiters.delete(key)
        resolve?.()
    }

    /* ───────────────────────────── o canteiro ──────────────────────────── */

    private async startSite(index: number) {
        const gen = ++this.gen
        this.siteIndex = index
        this.placed.clear()
        this.builtCount = 0
        this.openIndex = -1
        this.wrongHere = 0
        this.missedHere = false
        this.marks.clear()
        this.setPhase('busy')

        this.banner?.destroy()
        this.banner = undefined

        this.terrain.build(this.site)

        if (index === 0 && !wasTutorialSeen(OPENING_KEY)) {
            await this.runOpening()
            markTutorialSeen(OPENING_KEY)
        } else {
            await this.terrain.showProject()
            if (gen !== this.gen) return
            await this.terrain.showCuts()
            if (gen !== this.gen) return
            await this.tuca.beat(this.site.line)
        }
        if (gen !== this.gen) return

        if (index === 0 && !wasTutorialSeen(GUIDE_KEY)) {
            void this.runGuide()
            return
        }

        this.setPhase('cutting')
    }

    /** A abertura: o contexto em imagem, com duas falas. Uma vez só. */
    private async runOpening() {
        const gen = this.gen
        this.setPhase('busy')

        await this.veil.open()
        if (gen !== this.gen) return
        await this.tuca.show(POSE.talk)
        if (gen !== this.gen) return

        await this.veil.focus({ x: TERR.cx, y: TERR.cy, w: TERR.w, h: TERR.h })
        if (gen !== this.gen) return

        await this.terrain.showProject()
        if (gen !== this.gen) return

        await this.tuca.say('Olha o que a gente vai construir aqui!')
        this.tuca.hideBalloon()
        if (gen !== this.gen) return

        await FX.wait(this, 240)
        await this.tuca.say('Tudo de uma vez é demais. Vamos cortar em pedaços.', POSE.point)
        this.tuca.hideBalloon()
        if (gen !== this.gen) return

        this.audio.tick()
        await this.terrain.showCuts()
        if (gen !== this.gen) return

        await this.veil.close()
        await this.tuca.exit()
    }

    /** O guia da 1.1: cada instrução PARA até o gesto de verdade acontecer. */
    private async runGuide() {
        const gen = this.gen
        this.guiding = true

        await this.veil.open()
        if (gen !== this.gen) return

        await this.speak('Toque na tesoura para cortar.')
        if (gen !== this.gen) return

        const first = this.site.cuts[0]
        const box = first ? this.terrain.cutBox(first.afterLot) : undefined
        if (box) await this.veil.focus(box)
        this.setPhase('cutting')
        await this.wait('cut')
        if (gen !== this.gen) return

        await this.veil.focus(this.terrain.chunkBox(0))
        await this.speak('Agora são dois pedaços. Toque num.')
        if (gen !== this.gen) return

        await this.wait('chunk')
        if (gen !== this.gen) return

        await this.veil.focus(this.ground.rowBox())
        await this.speak('Estas peças são deste pedaço — menos uma!')
        if (gen !== this.gen) return

        await this.wait('piece')
        if (gen !== this.gen) return

        this.guiding = false
        markTutorialSeen(GUIDE_KEY)
        await this.veil.close()
        await this.tuca.exit()
        if (this.phase !== 'busy' && this.phase !== 'done') this.setPhase(this.phase)
        this.hud.setHelpEnabled(true)
    }

    /* ──────────────────────────────── o corte ──────────────────────────── */

    private async cut(lotId: string) {
        if (this.phase !== 'cutting') return
        const gen = this.gen
        this.setPhase('busy')
        this.audio.saw()

        await this.terrain.cutAt(lotId)
        if (gen !== this.gen) return

        if (this.terrain.pendingCuts().length) this.setPhase('cutting')
        else this.setPhase('choosing')

        this.mark('cut')
    }

    private async openChunk(index: number) {
        /* tocar no terreno antes de cortar não é erro: as linhas é que pulsam */
        if (this.phase === 'cutting') {
            this.audio.tap()
            void this.terrain.nudgeCuts()
            return
        }
        if (this.phase !== 'choosing') return
        const gen = this.gen
        const chunks = this.terrain.chunks()
        const chunk = chunks[index]
        if (!chunk) return

        this.setPhase('busy')
        this.audio.tap()
        this.audio.whoosh(true)
        this.openIndex = index
        this.wrongHere = 0

        await this.terrain.zoomTo(index)
        if (gen !== this.gen) return

        const others = chunks.filter((_, i) => i !== index)
        const pieces = groundFor(chunk, others, this.placed)
        await this.ground.deal(pieces, this.site.sheet)
        if (gen !== this.gen) return

        this.setPhase('working')
        this.mark('chunk')
    }

    private pieceById(id: string): PieceDef | undefined {
        return this.site.lots.flatMap(lot => lot.pieces).find(p => p.id === id)
    }

    private async pick(id: string) {
        if (this.phase !== 'working') return
        const gen = this.gen
        const chunks = this.terrain.chunks()
        const chunk = chunks[this.openIndex]
        const piece = this.pieceById(id)
        if (!chunk || !piece) return

        this.setPhase('busy')
        this.audio.tap()

        if (belongsTo(piece, chunk)) {
            const target = this.terrain.ghostAt(id)
            await this.ground.flyTo(id, target, this.terrain.ghostScale())
            if (gen !== this.gen) return

            this.placed.add(id)
            this.hits += 1
            const step = piecesOf(chunk).filter(p => this.placed.has(p.id)).length - 1
            this.audio.toc(step)
            await this.terrain.place(id, step)
            if (gen !== this.gen) return

            this.mark('piece')

            if (piecesOf(chunk).every(p => this.placed.has(p.id))) {
                await this.finishChunk(gen)
                return
            }

            this.setPhase('working')
            return
        }

        await this.ground.lift(id)
        if (gen !== this.gen) return
        this.audio.wrong()

        const owner = chunkOfPiece(chunks, id)
        this.audio.whoosh(false)
        await this.terrain.zoomOut()
        if (gen !== this.gen) return
        if (owner >= 0) await this.terrain.blink(owner)
        if (gen !== this.gen) return

        this.audio.whoosh(true)
        await this.terrain.zoomTo(this.openIndex)
        if (gen !== this.gen) return
        await this.ground.settle(id)
        if (gen !== this.gen) return

        this.chargeOnce()
        this.wrongHere += 1

        if (this.wrongHere >= 2) {
            const help = piecesOf(chunk).find(p => !this.placed.has(p.id))
            await this.tuca.beat('Essa é do outro pedaço.', POSE.point)
            if (gen !== this.gen) return
            if (help) this.ground.glow(help.id)
        }

        this.setPhase('working')
    }

    private async finishChunk(gen: number) {
        this.setPhase('busy')
        this.audio.chunkDone()
        this.terrain.markBuilt(this.openIndex)
        this.builtCount += 1

        await this.ground.clear()
        if (gen !== this.gen) return

        this.audio.whoosh(false)
        await this.terrain.zoomOut()
        if (gen !== this.gen) return

        this.emitCheckpoint()

        if (this.builtCount >= this.terrain.chunks().length) {
            await this.inaugurate(gen)
            return
        }

        this.setPhase('choosing')
    }

    /* ───────────────────────────── a inauguração ───────────────────────── */

    private dropBanner(): Promise<void> {
        const w = TERR.w - 120
        const g = this.add.graphics()
        g.fillStyle(C.amberDark, 1)
        g.fillRoundedRect(-w / 2, -30, w, 60, 14)
        g.fillStyle(C.amber, 1)
        g.fillRoundedRect(-w / 2, -34, w, 60, 14)
        g.lineStyle(5, C.woodDark, 1)
        g.strokeRoundedRect(-w / 2, -34, w, 60, 14)
        g.fillStyle(C.white, 0.9)
        for (let i = -w / 2 + 40; i < w / 2 - 20; i += 76) g.fillCircle(i, -4, 9)

        this.banner?.destroy()
        this.banner = this.add.container(TERR.cx, -60, [g]).setDepth(DEPTH.banner)
        return FX.to(this, fx(this.banner), { y: TERR.y - 46 }, { duration: 520, ease: 'Back.easeOut' })
    }

    private async inaugurate(gen: number) {
        this.setPhase('busy')

        await this.terrain.join()
        if (gen !== this.gen) return

        this.audio.fanfare()
        await this.dropBanner()
        if (gen !== this.gen) return

        void FX.confetti(this, { colors: [C.amber, C.green, C.gold, C.white] })
        await this.terrain.sweep()
        if (gen !== this.gen) return

        const points = pointsFor(this.missedHere)
        this.score += points
        this.sitesDone += 1
        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER',
            gameId: GAME_ID,
            pointsEarned: points,
            stage: this.level.level,
        })
        this.emitCheckpoint()

        await this.hud.celebrate(this.siteIndex)
        if (gen !== this.gen) return

        await this.tuca.beat(this.site.cheer, POSE.cheer)
        if (gen !== this.gen) return

        const next = this.siteIndex + 1
        if (next < this.level.sites.length) void this.startSite(next)
        else void this.endLevel()
    }

    private async endLevel() {
        const gen = ++this.gen
        this.setPhase('done')
        this.hud.setHelpEnabled(false)

        runtimeGameBridge.emit({
            type: 'GAME_COMPLETED',
            gameId: GAME_ID,
            stage: this.level.level,
            totalStages: LEVELS.length,
            score: Math.max(0, Math.round(this.score)),
            errors: this.errors,
        })
        this.emitCheckpoint(true)

        void FX.confetti(this, { colors: [C.amber, C.green, C.gold, C.white] })
        await FX.wait(this, 700)
        if (gen !== this.gen) return

        showLevelComplete(this, {
            accent: C.amber,
            panelColor: 0xfff4e2,
            overlayColor: 0x2b1d12,
            titleColor: CSS.ink,
            subtitleColor: CSS.amber,
            messageColor: CSS.inkSoft,
            title: this.errors === 0 ? 'Nenhum pedaço errado!' : 'Tudo inaugurado!',
            subtitle: 'Você cortou, fez um de cada vez e juntou tudo.',
            message: 'Coisa grande fica fácil quando vira pedacinhos.',
            progress: { total: this.level.sites.length, current: this.level.sites.length },
            buttons: [
                {
                    label: 'JOGAR DE NOVO',
                    color: C.amber,
                    onClick: () => this.scene.restart({ level: 1, points: 0, lives: this.livesTotal }),
                },
            ],
        })
    }

    /* ──────────────────────────── erro e ajuda ─────────────────────────── */

    private chargeOnce() {
        this.errors += 1
        if (this.missedHere) return
        this.missedHere = true
        runtimeGameBridge.emit({
            type: 'WRONG_ANSWER',
            gameId: GAME_ID,
            pointsEarned: 0,
            stage: this.level.level,
        })
        this.lives.lose()
        this.livesLeft = this.lives.remaining
    }

    private async explain() {
        if (this.guiding) return
        if (this.phase !== 'cutting' && this.phase !== 'choosing' && this.phase !== 'working') return

        const back = this.phase
        const text = HELP[back] ?? HELP.cutting
        this.setPhase('busy')

        const box =
            back === 'cutting'
                ? this.terrain.cutBox(this.terrain.pendingCuts()[0] ?? '') ?? {
                      x: TERR.cx,
                      y: TERR.cy,
                      w: TERR.w,
                      h: TERR.h,
                  }
                : back === 'choosing'
                  ? { x: TERR.cx, y: TERR.cy, w: TERR.w, h: TERR.h }
                  : this.ground.rowBox()

        await this.veil.open(box)
        await this.tuca.say(text, POSE.talk, 'Entendi')
        this.tuca.hideBalloon()
        await this.veil.close()
        await this.tuca.exit()
        this.setPhase(back)
    }

    private onShowTutorial() {
        void this.explain()
    }

    /* ────────────────────────────── plataforma ─────────────────────────── */

    private emitCheckpoint(final = false) {
        const done = final ? this.level.sites.length : this.sitesDone
        runtimeGameBridge.emit({
            type: 'CHECKPOINT',
            gameId: GAME_ID,
            progress: Math.round((done / TOTAL_SITES) * 100),
            score: Math.max(0, Math.round(this.score)),
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
                    this.scene.restart({ lives: this.livesLeft, level: command.stage, points: this.score })
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
