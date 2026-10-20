import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { FX } from '../../../../shared/effects/FX'

import { SKY } from '../data/files'
import { CAMERA, CATAPULT, DEPTH, HEADER, MINIMAP, W } from '../data/layout'
import { KIND, LEVELS, POINTS, deviceAt, guideKey, rightTargets, targetsOf } from '../data/levels'
import { C, CSS } from '../data/theme'
import { SAY, TEACH } from '../data/words'
import type { LevelDef, Mode, Round, TargetId } from '../types'

import { createAudio, type Audio } from './audio'
import { launch, preview, step, type BallState } from './ball'
import { showBanner } from './banner'
import { createCatapult, type Catapult } from './catapult'
import { spot, teach, union } from './guide'
import { createHud, type Hud } from './hud'
import { createMinimap, type Minimap } from './minimap'
import { createOrder, type Order } from './order'
import { createStage, type Stage } from './stage'
import { createTargets, type Rect, type Targets } from './targets'
import { createWorld, type World } from './world'

const GAME_ID = 'catapulta-do-arquivo'
const ERROR_MS = 1700
const FINALE_MS = 1600
const MIN_PULL = 28
/** a física anda em passos fixos: o mesmo puxão cai no mesmo lugar em qualquer aparelho */
const FIXED_DT = 1 / 180
const MAX_FRAME = 0.05
const BALLOON_HALF = 300

type Step = Parameters<typeof teach>[2][number]

export class GameScene extends Phaser.Scene {
    private livesTotal = 1
    private livesLeft = 1

    private level!: LevelDef
    private round!: Round
    private roundIndex = 0
    private mode: Mode = 'intro'
    private gen = 0
    private introduce = false

    private score = 0
    private hits = 0
    private errors = 0
    private done = 0

    private audio!: Audio
    private catapult!: Catapult
    private order!: Order
    private hud!: Hud
    private world?: World
    private stage?: Stage
    private targets?: Targets
    private minimap?: Minimap
    private banner?: Phaser.GameObjects.Container
    private flight?: BallState
    private acc = 0
    private down?: { x: number; y: number }
    private drag?: { kind: 'screen' | 'minimap'; x: number; scroll: number }

    private unsubPlatform?: () => void

    constructor() {
        super({ key: 'GameScene' })
    }

    private get cam() {
        return this.cameras.main
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this)
        this.livesLeft = data?.lives ?? this.livesTotal
        const number = Phaser.Math.Clamp(data?.level ?? faseInicial(this, 1), 1, LEVELS.length)
        this.level = LEVELS[number - 1]
        this.round = this.level.rounds[0]
        this.roundIndex = 0
        this.mode = 'intro'
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.done = 0
        this.world = undefined
        this.stage = undefined
        this.targets = undefined
        this.minimap = undefined
        this.banner = undefined
        this.flight = undefined
        this.down = undefined
        this.drag = undefined
        this.unsubPlatform = undefined
    }

    create() {
        this.input.topOnly = true
        this.add.image(0, 0, SKY).setOrigin(0).setDisplaySize(1280, 720).setDepth(DEPTH.sky).setScrollFactor(0)
        this.audio = createAudio()
        this.catapult = createCatapult(this)
        this.catapult.ball.setVisible(false)
        this.order = createOrder(this)
        this.hud = createHud(this, {
            rounds: this.level.rounds.length,
            level: this.level.level,
            livesTotal: this.livesTotal,
            livesLeft: this.livesLeft,
            gameId: GAME_ID,
            stage: () => this.level.level,
            onHelp: () => void this.explain(),
        })
        this.hud.setHelpEnabled(false)

        this.input.on('pointerdown', this.onDown, this)
        this.input.on('pointermove', this.onMove, this)
        this.input.on('pointerup', this.onUp, this)
        this.input.on('pointerupoutside', this.onUp, this)

        this.bindPlatform()
        EventBus.on('mute-audio', this.onMute, this)
        EventBus.on('show-tutorial', this.onShowTutorial, this)
        this.events.once('shutdown', this.shutdownScene, this)

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        const key = guideKey(this.level.level)
        this.introduce = !this.registry.get(key)
        this.registry.set(key, true)
        void this.startRound(0)
    }

    private shutdownScene() {
        this.gen++
        this.input.off('pointerdown', this.onDown, this)
        this.input.off('pointermove', this.onMove, this)
        this.input.off('pointerup', this.onUp, this)
        this.input.off('pointerupoutside', this.onUp, this)
        this.clearMap()
        this.banner?.destroy()
        this.hud?.destroy()
        this.order?.destroy()
        this.catapult?.destroy()
        this.audio?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.onShowTutorial, this)
        this.unsubPlatform?.()
    }

    update(time: number, deltaMs: number) {
        if (!this.targets || !this.world) return
        this.targets.update(time)
        this.minimap?.update(this.cam.scrollX)
        if (this.mode !== 'flight' || !this.flight) return
        this.acc += Math.min(deltaMs / 1000, MAX_FRAME)
        while (this.acc >= FIXED_DT) {
            this.acc -= FIXED_DT
            const event = step(this.flight, FIXED_DT, this.world, this.targets.clouds())
            this.catapult.ball.setPosition(this.flight.x, this.flight.y).setRotation(this.flight.spin)
            if (event.type === 'bounce') this.audio.thud()
            if (event.type === 'spring') {
                this.audio.spring()
                this.stage?.bounce(event.spring)
            }
            if (event.type === 'hole') return void this.capture(`h${event.hole}`)
            if (event.type === 'cloud') return void this.capture(`c${event.cloud}`)
            if (event.type === 'miss') return void this.miss()
        }
    }

    // ───────────────────────────────────────────── câmera

    private maxScroll() {
        return Math.max(0, this.round.map.width - W)
    }

    private panTo(scrollX: number, ms: number): Promise<void> {
        const target = Phaser.Math.Clamp(scrollX, 0, this.maxScroll())
        this.tweens.killTweensOf(this.cam)
        if (ms <= 0 || Math.abs(target - this.cam.scrollX) < 2) {
            this.cam.setScroll(target, 0)
            return Promise.resolve()
        }
        return new Promise(resolve => {
            this.tweens.add({
                targets: this.cam,
                scrollX: target,
                duration: FX.ms(this, ms),
                ease: 'Sine.easeInOut',
                onComplete: () => resolve(),
                onStop: () => resolve(),
            })
        })
    }

    private lookAt(x: number, ms = 600) {
        return this.panTo(x - W / 2, ms)
    }

    private onScreen(r: Rect): Rect {
        return { ...r, x: r.x - this.cam.scrollX }
    }

    // ───────────────────────────────────────────── rodada

    private clearMap() {
        this.stage?.destroy()
        this.targets?.destroy()
        this.minimap?.destroy()
        this.stage = undefined
        this.targets = undefined
        this.minimap = undefined
    }

    private async startRound(index: number) {
        const gen = ++this.gen
        this.mode = 'intro'
        this.roundIndex = index
        this.round = this.level.rounds[index]
        this.hud.setRound(index)
        this.hud.setHelpEnabled(false)
        this.cam.stopFollow()

        this.clearMap()
        const world = createWorld(this.round.map)
        this.world = world
        this.cam.setBounds(0, 0, this.round.map.width, 720)
        this.cam.setScroll(this.maxScroll(), 0)
        this.stage = createStage(this, this.round.map, world)
        this.targets = createTargets(this, this.round, world)
        this.minimap = createMinimap(this, this.round, world)
        this.catapult.ball.setVisible(false)

        this.mode = 'tour'
        await this.order.set(this.round.file, this.round.want)
        if (gen !== this.gen) return
        await FX.wait(this, 500)
        if (gen !== this.gen) return
        await this.panTo(0, CAMERA.tourMs)
        if (gen !== this.gen) return
        await this.catapult.load(this.round.file)
        if (gen !== this.gen) return
        this.emitCheckpoint()

        if (this.introduce) {
            this.introduce = false
            await this.lessons(gen, guideKey(this.level.level), true)
            if (gen !== this.gen) return
        }
        this.aim()
    }

    private aim() {
        this.mode = 'aim'
        this.hud.setHelpEnabled(true)
        this.order.pulse()
    }

    /** os balões da primeira vez e do `?`, levando a câmera até cada coisa que eles mostram */
    private async lessons(gen: number, key: string, first: boolean) {
        const holes = targetsOf(this.round).filter(t => t.startsWith('h'))
        const local = holes.find(t => KIND[deviceAt(this.round, t)] === 'local')
        const remote = holes.find(t => KIND[deviceAt(this.round, t)] === 'remoto')
        const cloud = targetsOf(this.round).find(t => t.startsWith('c'))
        const targets = this.targets
        if (!targets) return

        const one = async (s: Step) => {
            this.mode = 'guide'
            await teach(this, key, [s])
        }
        const side = (r: Rect) =>
            Phaser.Math.Clamp(r.x > W / 2 ? r.x - r.w / 2 - BALLOON_HALF : r.x + r.w / 2 + BALLOON_HALF, BALLOON_HALF, W - BALLOON_HALF)

        await one({ text: TEACH.order(this.round.file, this.round.want), ...spot(this.order.rect()), balloonX: 640, balloonY: 330, buttonLabel: 'Próximo' })
        if (gen !== this.gen) return
        if (local) {
            await this.lookAt(targets.pos(local).x)
            if (gen !== this.gen) return
            const r = this.onScreen(targets.rect(local))
            await one({ text: TEACH.local, ...spot(r), balloonX: side(r), balloonY: 260, buttonLabel: 'Próximo' })
            if (gen !== this.gen) return
        }
        if (remote) {
            const both = cloud ? union(targets.rect(remote), targets.rect(cloud)) : targets.rect(remote)
            await this.lookAt(both.x)
            if (gen !== this.gen) return
            const r = this.onScreen(both)
            await one({ text: TEACH.remote(deviceAt(this.round, remote)), ...spot(r), balloonX: side(r), balloonY: 330, buttonLabel: 'Próximo' })
            if (gen !== this.gen) return
        }
        await one({
            text: TEACH.pan,
            ...spot({ x: MINIMAP.x + MINIMAP.w / 2, y: MINIMAP.y + MINIMAP.h / 2, w: MINIMAP.w + 20, h: MINIMAP.h + 20 }),
            balloonX: 560,
            balloonY: 380,
            buttonLabel: 'Próximo',
            pointer: { fromX: 900, fromY: 520, toX: 380, toY: 520 },
        })
        if (gen !== this.gen) return
        await this.panTo(0, 700)
        if (gen !== this.gen) return
        await one({
            text: TEACH.shoot,
            ...spot(this.catapult.rect()),
            balloonX: 700,
            balloonY: 300,
            buttonLabel: first ? 'Vamos!' : 'Continuar',
            pointer: { fromX: CATAPULT.rest.x, fromY: CATAPULT.rest.y, toX: CATAPULT.rest.x - 120, toY: CATAPULT.rest.y + 80 },
        })
    }

    // ───────────────────────────────────────────── mirar, soltar e arrastar o mapa

    private onDown(pointer: Phaser.Input.Pointer) {
        if (this.mode !== 'aim') return
        if (this.minimap?.contains(pointer.x, pointer.y)) {
            this.mode = 'pan'
            this.drag = { kind: 'minimap', x: pointer.x, scroll: this.cam.scrollX }
            this.tweens.killTweensOf(this.cam)
            this.cam.setScroll(this.minimap.scrollFor(pointer.x), 0)
            return
        }
        if (pointer.y < HEADER.height) return
        const ball = this.catapult.ball
        if (Phaser.Math.Distance.Between(pointer.worldX, pointer.worldY, ball.x, ball.y) <= CATAPULT.grab) {
            this.mode = 'pull'
            this.down = { x: pointer.worldX, y: pointer.worldY }
            this.hud.setHelpEnabled(false)
            return
        }
        this.mode = 'pan'
        this.tweens.killTweensOf(this.cam)
        this.drag = { kind: 'screen', x: pointer.x, scroll: this.cam.scrollX }
    }

    private onMove(pointer: Phaser.Input.Pointer) {
        if (!pointer.isDown) return
        if (this.mode === 'pan' && this.drag) {
            const scroll =
                this.drag.kind === 'minimap'
                    ? (this.minimap?.scrollFor(pointer.x) ?? 0)
                    : this.drag.scroll - (pointer.x - this.drag.x) * CAMERA.panDrag
            this.cam.setScroll(Phaser.Math.Clamp(scroll, 0, this.maxScroll()), 0)
            return
        }
        if (this.mode !== 'pull' || !this.down || !this.world) return
        const at = this.catapult.pull(pointer.worldX - this.down.x, pointer.worldY - this.down.y)
        const v = this.catapult.velocity()
        this.catapult.drawPreview(this.catapult.pullLength() >= MIN_PULL ? preview(this.world, at.x, at.y, v.vx, v.vy) : [])
        this.audio.stretch(this.catapult.pullLength() / CATAPULT.maxPull)
    }

    private onUp() {
        if (this.mode === 'pan') {
            this.drag = undefined
            this.mode = 'aim'
            return
        }
        if (this.mode !== 'pull') return
        this.down = undefined
        if (this.catapult.pullLength() < MIN_PULL) {
            this.catapult.drawPreview([])
            this.catapult.rest()
            this.aim()
            return
        }
        const ball = this.catapult.ball
        const v = this.catapult.velocity()
        this.flight = launch(ball.x, ball.y, v.vx, v.vy)
        this.acc = 0
        this.catapult.fire()
        this.audio.twang()
        this.mode = 'flight'
        this.cam.startFollow(ball, true, CAMERA.followLerp, 1)
    }

    // ───────────────────────────────────────────── onde caiu

    private async capture(where: TargetId) {
        const gen = ++this.gen
        this.mode = 'judge'
        this.flight = undefined
        this.cam.stopFollow()
        this.hud.setHelpEnabled(false)
        const ball = this.catapult.ball
        const p = this.targets?.pos(where) ?? { x: ball.x, y: ball.y }
        if (where.startsWith('c')) {
            this.audio.ploc()
            await FX.to(this, ball, { x: p.x, y: p.y, scale: 0.2, alpha: 0 }, { duration: 300, ease: 'Quad.easeIn' })
        } else {
            const mouth = this.world?.holeCenter(Number(where.slice(1))) ?? p
            this.audio.plop()
            await FX.to(this, ball, { x: mouth.x, y: mouth.y + 10 }, { duration: 120 })
            await FX.to(this, ball, { y: p.y, scale: 0.4, alpha: 0 }, { duration: 320, ease: 'Quad.easeIn' })
        }
        if (gen !== this.gen) return
        ball.setVisible(false)
        if (KIND[deviceAt(this.round, where)] === this.round.want) return this.success(where, gen)
        return this.wrong(where, gen)
    }

    private async success(where: TargetId, gen: number) {
        const id = deviceAt(this.round, where)
        this.score += POINTS
        this.hits += 1
        this.done += 1
        runtimeGameBridge.emit({ type: 'CORRECT_ANSWER', gameId: GAME_ID, pointsEarned: POINTS, stage: this.level.level })
        this.audio.cheer()
        this.targets?.glow(where, C.yes)
        const p = this.targets?.pos(where)
        if (p) void FX.sparks(this, p.x, p.y, { color: C.star, count: 18, spread: 130, depth: DEPTH.fx })
        this.targets?.tag(where, SAY.is(id, KIND[id]), CSS.yes)
        await this.hud.celebrate(this.roundIndex)
        if (gen !== this.gen) return
        await FX.wait(this, 1000)
        if (gen !== this.gen) return
        if (this.roundIndex + 1 < this.level.rounds.length) {
            void this.startRound(this.roundIndex + 1)
            return
        }
        void this.endLevel()
    }

    private async wrong(where: TargetId, gen: number) {
        const id = deviceAt(this.round, where)
        this.mode = 'error'
        this.audio.fail()
        this.targets?.tag(where, SAY.is(id, KIND[id]), CSS.no)
        await this.targets?.shake(where)
        if (gen !== this.gen) return
        this.banner = showBanner(this, SAY.wanted(this.round.want), 0xffe1dc)
        rightTargets(this.round).forEach(t => this.targets?.glow(t, C.yes))
        await FX.wait(this, ERROR_MS)
        if (gen !== this.gen) return
        this.lose()
    }

    /** não caiu em lugar nenhum: é mira, não é erro */
    private async miss() {
        const gen = ++this.gen
        this.mode = 'judge'
        this.flight = undefined
        this.cam.stopFollow()
        const ball = this.catapult.ball
        this.audio.poof()
        void FX.sparks(this, ball.x, ball.y, { color: C.white, count: 12, spread: 70, depth: DEPTH.fx })
        void FX.popText(this, ball.x, Math.min(ball.y, 520) - 40, SAY.miss, { color: CSS.white, size: '34px' })
        await FX.to(this, ball, { alpha: 0, scale: 0.5 }, { duration: 220 })
        if (gen !== this.gen) return
        await FX.wait(this, 400)
        if (gen !== this.gen) return
        await this.panTo(0, 800)
        if (gen !== this.gen) return
        await this.catapult.load(this.round.file)
        if (gen !== this.gen) return
        this.aim()
    }

    private lose() {
        this.gen++
        this.mode = 'done'
        this.hud.setHelpEnabled(false)
        this.audio.lose()
        this.errors += 1
        runtimeGameBridge.emit({ type: 'WRONG_ANSWER', gameId: GAME_ID, pointsEarned: -5, stage: this.level.level })
        this.hud.lives.lose()
        this.livesLeft = this.hud.lives.remaining
    }

    // ───────────────────────────────────────────── ajuda

    private async explain() {
        if (this.mode !== 'aim') return
        const gen = this.gen
        this.mode = 'help'
        this.hud.setHelpEnabled(false)
        await this.lessons(gen, `${guideKey(this.level.level)}-help`, false)
        if (gen !== this.gen) return
        this.aim()
    }

    private onShowTutorial() {
        void this.explain()
    }

    // ───────────────────────────────────────────── fim do nível

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
        this.audio.win()
        await this.panTo(0, 600)
        if (gen !== this.gen) return
        void FX.confetti(this, { colors: [C.star, C.remote, C.local, C.mint, C.lilac] })
        await FX.wait(this, FINALE_MS)
        if (gen !== this.gen) return

        this.mode = 'done'
        const last = this.level.level >= LEVELS.length
        showLevelComplete(this, {
            accent: C.accent,
            panelColor: C.cream,
            overlayColor: C.shadow,
            titleColor: CSS.ink,
            subtitleColor: CSS.inkSoft,
            messageColor: CSS.inkSoft,
            title: `Nível ${this.level.level} completo!`,
            subtitle: this.level.title,
            message: this.level.message,
            stars: 3,
            progress: { total: this.level.rounds.length, current: this.level.rounds.length },
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
            progress: Math.min(100, Math.round((this.done / this.level.rounds.length) * 100)),
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
