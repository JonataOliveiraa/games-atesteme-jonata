import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { FX } from '../../../../shared/effects/FX'
import { LEVELS, canStamp, needsCover, pending, pointsFor, validateLevels } from '../data/levels'
import { COVERED_NOTE, LEAK_NOTE, PEOPLE } from '../data/elenco'
import { DEPTH, H, HUD, LENS, PAPER, PLATE, STAMP, TOOLS, VISITOR, W } from '../data/layout'
import { C } from '../data/theme'
import type { Item, LevelDef, Mode, Sheet, ToolId } from '../types'
import { createDesk, type Desk } from './desk'
import { createSheet, type SheetView } from './sheet'
import { createLens, type Lens } from './lens'
import { createStamp, type Stamp } from './stamp'
import { createToolbar, type Toolbar } from './toolbar'
import { createVisitor, type Visitor } from './visitor'
import { createHud, type Hud } from './hud'
import { createAudio, type Audio } from './audio'

const GAME_ID = 'guardiao-etico'

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  O QUE CUSTA VIDA, E O QUE NÃO CUSTA
 * ══════════════════════════════════════════════════════════════════════════
 *
 *   arrastar a lupa, achar   →  de graça. A lupa só OLHA; procurar é o jogo.
 *   trocar de ferramenta     →  de graça.
 *   marcador e borracha      →  de graça, sem limite.
 *   CARIMBAR com pendência   →  TRAVA. Uma vida, uma vez por fase; o bilhete
 *                               diz o TIPO, e só o segundo erro mostra a região.
 */
export class GameScene extends Phaser.Scene {
    private lives!: Lives
    private livesTotal = 3
    private livesLeft = 3

    private level!: LevelDef
    private sheetIndex = 0
    private mode: Mode = 'entrando'
    private gen = 0

    private locked = false
    private errorsInSheet = 0
    private score = 0
    private hits = 0
    private errors = 0
    private tutorialOpen = false

    private desk!: Desk
    private sheet!: SheetView
    private lens!: Lens
    private stamp!: Stamp
    private toolbar!: Toolbar
    private visitor!: Visitor
    private hud!: Hud
    private audio!: Audio
    private frame!: Phaser.GameObjects.Graphics

    private unsubPlatform?: () => void

    private get paper(): Sheet {
        return this.level.sheets[this.sheetIndex]
    }

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this, 3)
        this.livesLeft = data?.lives ?? this.livesTotal

        const number = Phaser.Math.Clamp(data?.level ?? 1, 1, LEVELS.length)
        this.level = LEVELS[number - 1]

        this.sheetIndex = 0
        this.mode = 'entrando'
        this.locked = false
        this.errorsInSheet = 0
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.tutorialOpen = false
    }

    create() {
        this.input.topOnly = true

        const problems = validateLevels(LEVELS)
        if (problems.length) console.error(`[${GAME_ID}]`, problems)

        this.desk = createDesk(this)
        this.sheet = createSheet(this, {
            onItemTap: item => this.useTool(item),
            onPaperTap: (x, y) => {
                // marcar o que ainda não foi achado não faz nada, e nada é uma
                // resposta ruim: o jogo aponta para a ferramenta que resolve
                if (this.toolbar.current() === 'lupa') this.lens.glide(x, y)
                else void this.toolbar.hint('lupa')
            },
        })
        this.lens = createLens(this, this.sheet.snapshotKey, {
            onMove: () => this.lookAround(),
            onTap: (x, y) => this.tapThroughGlass(x, y),
        })
        this.visitor = createVisitor(this, this.level.destination)
        this.audio = createAudio(this)
        this.stamp = createStamp(this, { onPress: () => void this.publish() })
        this.toolbar = createToolbar(this, { onSelect: tool => this.pickTool(tool) })
        this.hud = createHud(this, {
            level: this.level.level,
            goal: this.level.goal,
            sheets: this.level.sheets.length,
            onHelp: () => this.replayTutorial(),
        })

        this.frame = this.add.graphics().setDepth(DEPTH.frame).setAlpha(0)

        this.bindPlatform()
        EventBus.on('mute-audio', this.onMute, this)
        EventBus.on('show-tutorial', this.replayTutorial, this)
        this.events.once('shutdown', this.shutdownScene, this)

        this.lives = createLives(this, {
            total: this.livesTotal,
            remaining: this.livesLeft,
            gameId: GAME_ID,
            x: HUD.livesX,
            y: HUD.cy,
            size: 28,
            tint: C.amber,
            depth: DEPTH.hud + 1,
            stage: () => this.level.level,
        })
        this.events.once('shutdown', () => this.lives.destroy())

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        void this.startSheet(0)
    }

    private shutdownScene() {
        this.gen++
        this.hud?.destroy()
        this.toolbar?.destroy()
        this.stamp?.destroy()
        this.visitor?.destroy()
        this.lens?.destroy()
        this.sheet?.destroy()
        this.desk?.destroy()
        this.audio?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.replayTutorial, this)
        this.unsubPlatform?.()
    }

    /* ────────────────────────────────── a fase ────────────────────────── */

    private async startSheet(index: number) {
        const gen = ++this.gen
        this.sheetIndex = index
        this.locked = false
        this.errorsInSheet = 0
        this.mode = 'entrando'

        this.sheet.render(this.paper)
        this.stamp.clearSeal()
        this.stamp.setLocked(false)
        this.toolbar.select('lupa')
        this.sheet.setTool('lupa')
        this.visitor.setWho(this.paper.who)
        this.lens.park()
        void this.lens.show(true)
        this.applyInput()

        this.audio.drop()
        await this.sheet.drop()
        if (gen !== this.gen) return

        this.mode = 'procurando'
        this.applyInput()

        void this.visitor.say(this.paper.ask)
        if (index === 0) this.runTutorial()
        else void this.lens.nudge()
    }

    /* ──────────────────────────── lupa e ferramentas ──────────────────── */

    /** A lupa andou: o que entrou no vidro passa a existir. */
    private lookAround() {
        if (this.mode !== 'procurando' && this.mode !== 'travado') return
        if (this.toolbar.current() !== 'lupa') return

        const local = this.lens.local()
        const fresh = this.sheet.findUnder(local.x, local.y, this.lens.radius())
        if (!fresh.length) return

        this.audio.find()
        void this.lens.pulse()
        this.unlockStamp()
    }

    /** O vidro é o cursor: o que está debaixo dele recebe a ferramenta. */
    private tapThroughGlass(x: number, y: number) {
        const item = this.sheet.itemAt(x - PAPER.x, y - PAPER.y)
        if (item) this.useTool(item)
    }

    /**
     * A lupa sai da mesa quando a ferramenta é outra.
     *
     * Ela é grande e fica POR CIMA do papel: parada ali enquanto a criança
     * marca, esconde justamente o que ela precisa ver para decidir.
     */
    private pickTool(tool: ToolId) {
        this.sheet.setTool(tool)
        this.audio.cover(tool !== 'borracha')
        void this.lens.show(tool === 'lupa')
    }

    /**
     * O toque num achado. Quem decide o que acontece é a ferramenta:
     * a lupa chama a lente até lá, o marcador tapa, a borracha destapa.
     */
    private useTool(item: Item) {
        if (this.tutorialOpen) return
        if (this.mode !== 'procurando' && this.mode !== 'travado') return

        const tool = this.toolbar.current()
        const world = this.sheet.worldOf(item)

        if (tool === 'lupa') {
            this.lens.glide(world.x, world.y)
            return
        }

        const marking = tool === 'marcador'
        if (this.sheet.isCovered(item.id) === marking) return

        this.audio.cover(marking)
        void this.applyStroke(item, marking)
        this.unlockStamp()
    }

    private async applyStroke(item: Item, marking: boolean) {
        const gen = this.gen
        if (marking) await this.sheet.sweepIn(item)
        if (gen !== this.gen) return
        this.sheet.setCover(item, marking)
        if (!marking) void this.sheet.rubOut(item)
    }

    /** O cadeado só sai quando algo MUDA no papel: mexer a lupa não é mudança. */
    private unlockStamp() {
        if (this.mode !== 'travado') return
        this.mode = 'procurando'
        this.stamp.setLocked(false)
        void this.visitor.say(this.paper.ask)
        this.applyInput()
    }

    /* ──────────────────────────────── o carimbo ───────────────────────── */

    private async publish() {
        if (this.tutorialOpen || this.mode !== 'procurando') return
        const gen = this.gen

        this.mode = 'carimbando'
        this.applyInput()

        const ok = canStamp(this.paper, this.sheet.covered(), this.level)
        this.audio.stamp()
        await this.stamp.press(ok)
        if (gen !== this.gen) return

        if (ok) {
            await this.approve()
            return
        }

        const faltas = pending(this.paper, this.sheet.covered(), this.level)
        const first = faltas[0]
        const leaked = needsCover(first, this.level)

        this.audio.hmm()
        void this.sheet.shake()
        void this.flashFrame(C.amber)
        void this.visitor.sulk()
        void this.visitor.note(leaked ? LEAK_NOTE[first.kind] : COVERED_NOTE[first.kind])

        this.audio.lock()
        this.stamp.setLocked(true)
        this.mode = 'travado'
        this.applyInput()

        this.loseOnce()
        this.errorsInSheet += 1

        if (this.errorsInSheet >= 2) {
            const spot = this.sheet.worldOf(first)
            this.audio.ghost()
            void this.lens.ghost(spot.x, spot.y)
        }
    }

    private async approve() {
        const gen = this.gen

        const points = pointsFor(this.locked)
        this.score += points
        this.hits += 1

        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER',
            gameId: GAME_ID,
            pointsEarned: points,
            stage: this.level.level,
        })
        this.emitCheckpoint()

        this.audio.approve()
        void this.flashFrame(C.green)
        this.lens.setVisible(false)

        // o que ela tapou não foi publicado — e isso se vê: o texto some e a
        // tarja é levantada, deixando papel em branco
        this.audio.cover(false)
        await this.sheet.eraseCovered()
        if (gen !== this.gen) return

        await this.visitor.cheer()
        if (gen !== this.gen) return

        void this.visitor.say(this.paper.praise)

        const dot = this.hud.dotPoint(this.sheetIndex)
        await this.sheet.flyTo(dot.x, dot.y)
        if (gen !== this.gen) return

        await this.hud.celebrate(this.sheetIndex)
        if (gen !== this.gen) return

        const next = this.sheetIndex + 1
        if (next < this.level.sheets.length) {
            void this.startSheet(next)
            return
        }
        void this.finishLevel()
    }

    /** Uma vida por FASE, no primeiro erro dela. Os seguintes, não. */
    private loseOnce() {
        if (this.locked) return
        this.locked = true
        this.errors += 1
        runtimeGameBridge.emit({
            type: 'WRONG_ANSWER',
            gameId: GAME_ID,
            pointsEarned: 0,
            stage: this.level.level,
        })
        this.lives.lose()
        this.livesLeft = this.lives.remaining
    }

    private async flashFrame(color: number) {
        this.frame.clear()
        this.frame.lineStyle(16, color, 1)
        this.frame.strokeRect(8, 8, W - 16, H - 16)
        this.frame.setAlpha(0)
        await FX.to(this, this.frame, { alpha: 1 }, { duration: 80 })
        await FX.to(this, this.frame, { alpha: 0 }, { duration: 380 })
    }

    /* ───────────────────────────── fim do nível ───────────────────────── */

    private async finishLevel() {
        const gen = ++this.gen
        this.mode = 'fim'
        this.applyInput()

        const last = this.level.level >= LEVELS.length

        runtimeGameBridge.emit({
            type: 'GAME_COMPLETED',
            gameId: GAME_ID,
            stage: this.level.level,
            totalStages: LEVELS.length,
            score: Math.max(0, Math.round(this.score)),
            errors: this.errors,
        })
        this.emitCheckpoint(true)

        await FX.all(this.stamp.hide(), this.toolbar.hide())
        if (gen !== this.gen) return

        this.audio.fanfare()
        void FX.confetti(this, { colors: [C.amber, C.green, C.paper, C.blue] })

        showLevelComplete(this, {
            accent: C.amber,
            panelColor: C.paper,
            overlayColor: C.ink,
            depth: 5000,
            title: this.level.title,
            message: this.level.closing,
            progress: { total: LEVELS.length, current: this.level.level, size: 9 },
            ...(last
                ? {
                      buttons: [
                          {
                              label: 'Jogar de novo',
                              color: C.green,
                              onClick: () =>
                                  this.scene.restart({ lives: this.livesTotal, level: 1, points: 0 }),
                          },
                          {
                              label: 'Escolher jogo',
                              color: C.amber,
                              onClick: () => EventBus.emit('exit-game'),
                          },
                      ],
                  }
                : {
                      autoAdvance: {
                          delay: 2200,
                          onComplete: () =>
                              this.scene.restart({
                                  lives: this.livesLeft,
                                  level: this.level.level + 1,
                                  points: this.score,
                              }),
                      },
                  }),
        })
    }

    /* ──────────────────────────────── resto ───────────────────────────── */

    private applyInput() {
        const free = !this.tutorialOpen && (this.mode === 'procurando' || this.mode === 'travado')
        this.sheet.setEnabled(free)
        this.lens.setEnabled(free)
        this.toolbar.setEnabled(free)
        this.stamp.setEnabled(!this.tutorialOpen && this.mode === 'procurando')
        this.hud.setEnabled(!this.tutorialOpen && this.mode !== 'fim')
    }

    private runTutorial(once = true) {
        this.tutorialOpen = true
        this.applyInput()

        createTutorial(this, {
            key: `ef04co07ge-l${this.level.level}`,
            once,
            accent: C.amber,
            safeTop: HUD.h + 10,
            steps: this.tutorialSteps(),
            onFinish: () => {
                this.tutorialOpen = false
                this.applyInput()
                void this.lens.nudge()
            },
        })
    }

    private tutorialSteps(): TutorialStep[] {
        const name = PEOPLE[this.paper.who].name
        const lens = this.lens.center()
        const marker = this.toolbar.pos('marcador')
        const rubber = this.toolbar.pos('borracha')

        return [
            {
                text: `${name} quer o convite no mural da sala.`,
                shape: 'rect',
                x: PLATE.x + PLATE.w / 2,
                y: (PLATE.y + VISITOR.y + VISITOR.h) / 2,
                w: PLATE.w + 30,
                h: VISITOR.y + VISITOR.h - PLATE.y + 40,
                balloonX: 430,
                balloonY: 300,
            },
            {
                text: 'Arraste a lupa pelo papel.',
                shape: 'circle',
                x: lens.x,
                y: lens.y,
                w: (LENS.r + LENS.rim) * 2 + 30,
                h: (LENS.r + LENS.rim) * 2 + 30,
                balloonX: 700,
                balloonY: 400,
                pointer: {
                    fromX: lens.x,
                    fromY: lens.y,
                    toX: lens.x + 300,
                    toY: lens.y + 150,
                },
            },
            {
                text: 'Achou algo de outra pessoa? Pegue o MARCADOR e toque nela.',
                shape: 'rect',
                x: marker.x,
                y: marker.y,
                w: TOOLS.w + 30,
                h: TOOLS.h + 40,
                balloonX: 700,
                balloonY: 300,
                pointer: { fromX: marker.x, fromY: marker.y, toX: marker.x, toY: marker.y, tap: true },
            },
            {
                text: 'A BORRACHA tira a tarja.',
                shape: 'rect',
                x: rubber.x,
                y: rubber.y,
                w: TOOLS.w + 30,
                h: TOOLS.h + 40,
                balloonX: 700,
                balloonY: 300,
                pointer: { fromX: rubber.x, fromY: rubber.y, toX: rubber.x, toY: rubber.y, tap: true },
            },
            {
                text: 'Quando estiver tudo certo, é só APROVAR.',
                shape: 'rect',
                x: STAMP.cx,
                y: STAMP.cy,
                w: STAMP.w + 36,
                h: STAMP.h + 36,
                balloonX: 430,
                balloonY: 300,
                pointer: { fromX: STAMP.cx, fromY: STAMP.cy, toX: STAMP.cx, toY: STAMP.cy, tap: true },
            },
        ]
    }

    private replayTutorial() {
        if (this.tutorialOpen) return
        if (this.mode !== 'procurando' && this.mode !== 'travado') return
        this.runTutorial(false)
    }

    private emitCheckpoint(complete = false) {
        const total = this.level.sheets.length
        const done = complete ? total : this.hits
        runtimeGameBridge.emit({
            type: 'CHECKPOINT',
            gameId: GAME_ID,
            progress: Math.round((Math.min(done, total) / total) * 100),
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
