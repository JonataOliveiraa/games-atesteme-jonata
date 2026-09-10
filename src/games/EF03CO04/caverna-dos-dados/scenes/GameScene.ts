import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { createTutorial } from '../../../../shared/tutorial/createTutorial'
import { FX } from '../../../../shared/effects/FX'
import { LEVELS } from '../data/levels'
import {
    datumOf,
    formsInformation,
    intruderLine,
    intrudersIn,
    missingIn,
    shuffledPositions,
    slotsOf,
} from '../data/rules'
import { ALTAR, CAVE, FICHA, HUD, SLOTS_BY_COUNT } from '../data/layout'
import { C } from '../data/theme'
import type { DatumId, Gallery, LevelDef, LevelNumber, Mode } from '../types'
import { createCave, type Cave } from './cave'
import { createExplorer, type Explorer } from './explorer'
import { createBag, type Bag } from './bag'
import { createAltar, type Altar } from './altar'
import { createDoor, type Door } from './door'
import { createLock, type Lock } from './lock'
import { createHud, type Hud } from './hud'
import { createAudio, type Audio } from './audio'

const GAME_ID = 'caverna-dos-dados'

const PLACA = 'Dados são pedacinhos. Juntos, viram informação!'

export class GameScene extends Phaser.Scene {
    private lives!: Lives
    private livesTotal = 3
    private livesLeft = 3

    private level!: LevelDef
    private galleryIndex = 0
    private mode: Mode = 'explore'
    private gen = 0

    private selected: DatumId[] = []
    private mined: DatumId[] = []
    private spots: { x: number; y: number }[] = []
    private revealed = false
    private lockedId: DatumId | null = null
    private travas = 0
    private hinted = false
    private tutorialOpen = false
    private pendingTutorial = false
    private altarTutorialDone = false

    private score = 0
    private hits = 0
    private errors = 0
    private done = 0
    private formed: string[] = []

    private cave!: Cave
    private explorer!: Explorer
    private bag!: Bag
    private altar!: Altar
    private door!: Door
    private lock!: Lock
    private hud!: Hud
    private audio!: Audio

    private unsubPlatform?: () => void

    private get gallery(): Gallery {
        return this.level.galleries[this.galleryIndex]
    }

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this, 3)
        this.livesLeft = data?.lives ?? this.livesTotal

        const number = Phaser.Math.Clamp(data?.level ?? 1, 1, LEVELS.length) as LevelNumber
        this.level = LEVELS[number - 1]

        this.galleryIndex = 0
        this.mode = 'explore'
        this.selected = []
        this.lockedId = null
        this.travas = 0
        this.hinted = false
        this.tutorialOpen = false
        this.pendingTutorial = number === 1
        this.altarTutorialDone = number !== 1
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.done = 0
        this.formed = []
    }

    create() {
        this.input.topOnly = true

        this.audio = createAudio(this)
        this.cave = createCave(this, { onPick: id => void this.pick(id) })
        this.explorer = createExplorer(this, { onStep: () => this.audio.step() })
        this.bag = createBag(this)
        this.door = createDoor(this)
        this.altar = createAltar(this, {
            onFicha: id => void this.touchFicha(id),
            onJoin: () => void this.join(),
            onBack: () => void this.backToCave(),
        })
        this.lock = createLock(this)
        this.hud = createHud(this, {
            level: this.level.level,
            totalLevels: LEVELS.length,
            pages: this.level.galleries.length,
            onHelp: () => this.replayTutorial(),
        })

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
            tint: C.warn,
            stage: () => this.level.level,
        })
        this.events.once('shutdown', () => this.lives.destroy())

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        void this.startGallery(0, false)
    }

    private shutdownScene() {
        this.gen++
        this.lock?.destroy()
        this.altar?.destroy()
        this.door?.destroy()
        this.bag?.destroy()
        this.explorer?.destroy()
        this.cave?.destroy()
        this.hud?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.replayTutorial, this)
        this.unsubPlatform?.()
    }

    // ─────────────────────────────────────────────── a galeria entra

    /** Monta a galeria com a tela apagada: nada de remonte à vista. */
    private mountGallery(index: number) {
        this.galleryIndex = index
        this.mode = 'explore'
        this.selected = []
        this.mined = []
        this.revealed = false
        this.lockedId = null
        this.travas = 0
        this.hinted = false

        const gallery = this.gallery

        this.lock.hide()
        this.altar.clear()
        this.altar.hide()
        this.door.reset(slotsOf(gallery))
        this.bag.reset()
        this.explorer.reset()
        this.hud.setPages(this.done)
        this.applyInput()

        this.cave.setVeil(false)
        this.spots = shuffledPositions(
            gallery,
            SLOTS_BY_COUNT[gallery.data.length] ?? SLOTS_BY_COUNT[4],
        )
        // O dado escondido do nível 3 não nasce com os outros: a última
        // posição embaralhada fica reservada para quando ele for revelado.
        this.cave.setGallery(this.visibleData(), this.spots)
    }

    private visibleData() {
        const hidden = this.gallery.hiddenDatumId
        if (!hidden || this.revealed) return this.gallery.data
        return this.gallery.data.filter(datum => datum.id !== hidden)
    }

    /** Há dado esperando na caverna? Só então o VOLTAR existe. */
    private pendingHidden() {
        return !!this.gallery.hiddenDatumId && !this.revealed
    }

    private async startGallery(index: number, curtain: boolean) {
        const gen = ++this.gen

        if (curtain) await FX.curtain(this, () => this.mountGallery(index), C.shadow)
        else this.mountGallery(index)

        if (gen !== this.gen) return
        this.audio.enter()

        await FX.wait(this, 560)
        if (gen !== this.gen) return
        this.applyInput()

        if (this.pendingTutorial && index === 0) {
            this.pendingTutorial = false
            this.runTutorial(true)
        }
    }

    /**
     * Minerar nunca é resposta. A palavra está DENTRO da pedra: a picareta
     * abre, o dado aparece no ar por um instante e só então entra na bolsa.
     */
    private async pick(id: DatumId) {
        if (this.mode !== 'explore') return
        const gen = this.gen
        const datum = datumOf(this.gallery, id)
        if (!datum) return

        this.mode = 'walking'
        this.applyInput()

        const spot = this.cave.posOf(id)
        await this.explorer.walkTo(spot.x - CAVE.stopGap, spot.y + CAVE.footDrop)
        if (gen !== this.gen) return

        await this.explorer.mine(2, blow => {
            this.audio.pickaxe()
            if (blow === 0) {
                this.cave.hit(id)
                return
            }
            this.cave.crack(id)
            this.audio.crack()
            FX.shakeCam(this, 'leve')
        })
        if (gen !== this.gen) return

        this.explorer.pose('curious')
        await this.cave.dropWord(id, this.level.sheet, this.bag.point())
        if (gen !== this.gen) return

        this.audio.collect()
        this.bag.bounce()
        this.mined.push(id)
        await this.bag.take(datum, this.level.sheet)
        if (gen !== this.gen) return
        this.explorer.pose('idle')

        if (this.cave.remaining() === 0) {
            void this.goToAltar()
            return
        }

        this.mode = 'explore'
        this.applyInput()
    }

    // ─────────────────────────────────────────────── o altar

    private async goToAltar() {
        const gen = this.gen
        this.mode = 'walking'
        this.applyInput()

        await this.explorer.walkTo(CAVE.exitX, CAVE.footMax)
        if (gen !== this.gen) return

        await FX.all(
            this.cave.veil(true),
            this.explorer.toAltar(),
            this.bag.toAltar(),
        )
        if (gen !== this.gen) return
        this.cave.clear()

        const gallery = this.gallery
        const bag = gallery.data.filter(datum => this.mined.includes(datum.id))
        void this.door.showBand()
        await this.altar.enter(bag, this.level.sheet, slotsOf(gallery))
        if (gen !== this.gen) return

        this.mode = 'altar'
        this.altar.showBack(this.pendingHidden())
        this.applyInput()

        // A placa do altar é dita uma vez por nível, antes da primeira escolha
        // — e nunca embaixo do tutorial, que ocupa a mesma faixa da tela.
        if (!this.altarTutorialDone) {
            this.altarTutorialDone = true
            this.runTutorial(true)
            return
        }
        // Avisar que falta dado não entrega a relação, e evita que a criança
        // perca uma vida afirmando um conjunto que não tinha como fechar.
        if (this.pendingHidden()) this.door.say('Falta um dado na caverna.')
        else if (this.galleryIndex === 0) this.door.say(PLACA)
    }

    /** O VOLTAR: a bancada recua e a pedra que faltava acende lá fora. */
    private async backToCave() {
        if (this.mode !== 'altar' || !this.pendingHidden()) return
        const gen = this.gen
        const gallery = this.gallery
        const hidden = datumOf(gallery, gallery.hiddenDatumId!)
        if (!hidden) return

        this.mode = 'walking'
        this.applyInput()
        this.altar.showBack(false)
        this.door.hush()

        this.selected = []
        this.door.setFilled(0)
        this.altar.leave()
        await FX.wait(this, 360)
        if (gen !== this.gen) return
        this.altar.clear()
        this.altar.hide()

        await FX.all(
            this.cave.veil(false),
            this.door.hideBand(),
            this.bag.toExplore(),
            this.explorer.walkTo(CAVE.exitX, CAVE.footMax),
        )
        if (gen !== this.gen) return

        this.revealed = true
        this.audio.crack()
        await this.cave.revealHidden(hidden, this.spots[this.spots.length - 1])
        if (gen !== this.gen) return

        this.mode = 'explore'
        this.applyInput()
    }

    /** Tocar inclui ou retira do conjunto. Mudar de ideia não é erro. */
    private async touchFicha(id: DatumId) {
        if (this.mode === 'locked') {
            if (id !== this.lockedId) return
            await this.unlockFrom(id)
            return
        }
        if (this.mode !== 'altar') return

        if (this.selected.includes(id)) {
            this.selected = this.selected.filter(item => item !== id)
            this.audio.drop()
            this.door.setFilled(this.selected.length)
            this.applyInput()
            await this.altar.take(id)
            return
        }

        if (this.selected.length >= slotsOf(this.gallery)) {
            this.door.say('O altar já está cheio.')
            return
        }

        this.selected.push(id)
        this.audio.pick(this.selected.length - 1)
        this.door.setFilled(this.selected.length)
        this.applyInput()
        await this.altar.put(id)
    }

    private async join() {
        if (this.mode !== 'altar') return
        const gallery = this.gallery
        const slots = slotsOf(gallery)

        if (this.selected.length < slots) {
            this.audio.incomplete()
            this.explorer.pose('curious')
            this.door.say(
                this.selected.length === 1
                    ? 'Um dado sozinho não conta nada.'
                    : 'Ainda falta dado.',
            )
            return
        }

        if (formsInformation(gallery, this.selected)) {
            await this.succeed()
            return
        }
        await this.fail()
    }

    // ─────────────────────────────────────────────── virou informação

    private async succeed() {
        const gen = this.gen
        const gallery = this.gallery
        const points = this.travas === 0 ? 10 : 5

        this.mode = 'done'
        this.applyInput()
        this.door.hush()
        this.audio.fuse()

        await this.altar.fuse(this.door.bandPos())
        if (gen !== this.gen) return
        await this.door.form(gallery.information.sentence)
        if (gen !== this.gen) return

        this.formed.push(gallery.information.sentence)
        this.done += 1
        this.hits += 1
        this.score += points
        this.explorer.pose('cheer')
        this.hud.setPages(this.done)
        void FX.stars(this, this.door.bandPos().x, this.door.bandPos().y, { count: 18 })

        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER',
            gameId: GAME_ID,
            pointsEarned: points,
            stage: this.level.level,
        })
        this.emitCheckpoint()

        await FX.wait(this, 1100)
        if (gen !== this.gen) return

        // A porta só existe agora: nasce no vão escuro, engole a faixa e abre.
        this.altar.leave()
        void this.bag.leave()
        this.audio.door()
        await this.door.open()
        if (gen !== this.gen) return

        // Ele atravessa a pé: a porta abriu porque a informação nasceu, e é
        // essa consequência que a criança precisa ver acontecer com ele.
        const way = this.door.doorPos()
        await this.explorer.walkTo(way.x - 96, CAVE.footMin)
        if (gen !== this.gen) return
        await this.explorer.enterDoor(way)
        if (gen !== this.gen) return

        const next = this.galleryIndex + 1
        if (next < this.level.galleries.length) void this.startGallery(next, true)
        else void this.endLevel()
    }

    /**
     * O ÚNICO erro: afirmar que um conjunto completo com dado alheio já é a
     * informação. A trava não empurra a fase para a frente — ela volta para a
     * mesma decisão, com a ficha intrusa livre para sair.
     */
    private async fail() {
        const gen = this.gen
        const gallery = this.gallery
        const intruder = intrudersIn(gallery, this.selected)[0]
        if (!intruder) return

        this.errors += 1
        this.travas += 1
        this.mode = 'locked'
        this.lockedId = intruder
        this.applyInput()

        const spot = this.altar.fichaPos(intruder)
        this.audio.smoke()
        this.altar.smoke(spot.x, spot.y)
        this.hud.flash(C.warn)
        this.explorer.pose('surprise')
        this.door.crack(this.altar.slotIndexOf(intruder))
        this.door.say(intruderLine(gallery, intruder), 'warn')

        runtimeGameBridge.emit({
            type: 'WRONG_ANSWER',
            gameId: GAME_ID,
            pointsEarned: 0,
            stage: this.level.level,
        })
        this.lives.lose()
        this.livesLeft = this.lives.remaining

        await this.altar.lock(intruder)
        if (gen !== this.gen) return
        this.lock.show(spot.x + FICHA.w / 2 - 6, spot.y - FICHA.h / 2 - 4)

        if (this.travas >= 2 && !this.hinted) {
            this.hinted = true
            this.altar.hint(missingIn(gallery, this.selected))
        }
    }

    private async unlockFrom(id: DatumId) {
        const gen = this.gen
        this.mode = 'walking'
        this.lockedId = null
        this.applyInput()

        this.lock.hide()
        this.altar.unlock()
        this.audio.unlock()
        this.selected = this.selected.filter(item => item !== id)
        this.door.setFilled(this.selected.length)
        this.door.hush()
        this.explorer.pose('idle')

        await this.altar.take(id)
        if (gen !== this.gen) return

        this.mode = 'altar'
        this.applyInput()
    }

    // ─────────────────────────────────────────────── fim do nível

    private async endLevel() {
        const gen = ++this.gen
        this.mode = 'done'
        this.applyInput()
        this.hud.setEnabled(false)

        runtimeGameBridge.emit({
            type: 'GAME_COMPLETED',
            gameId: GAME_ID,
            stage: this.level.level,
            totalStages: LEVELS.length,
            score: Math.max(0, Math.round(this.score)),
            errors: this.errors,
        })
        this.emitCheckpoint(true)

        this.audio.fanfare()
        void FX.confetti(this, { colors: [C.doorLight, C.info, C.crystal, C.warn] })

        await FX.wait(this, 1100)
        if (gen !== this.gen) return

        const done = this.level.level
        const diary = this.formed.join('\n')

        if (done < LEVELS.length) {
            showLevelComplete(this, {
                title: 'Diário do explorador',
                subtitle: PLACA,
                message: diary,
                accent: C.crystal,
                panelColor: C.panel,
                overlayColor: C.shadow,
                depth: 5000,
                progress: { total: LEVELS.length, current: done, size: 8 },
                autoAdvance: {
                    delay: 3200,
                    label: `${LEVELS[done].name}...`,
                    onComplete: () =>
                        this.scene.restart({
                            lives: this.livesLeft,
                            level: (done + 1) as LevelNumber,
                            points: this.score,
                        }),
                },
            })
            return
        }

        showLevelComplete(this, {
            title: 'Diário do explorador',
            subtitle: PLACA,
            message: diary,
            accent: C.crystal,
            panelColor: C.panel,
            overlayColor: C.shadow,
            depth: 5000,
            progress: { total: LEVELS.length, current: LEVELS.length, size: 8 },
            buttons: [
                {
                    label: 'Explorar de novo',
                    color: C.info,
                    onClick: () =>
                        this.scene.restart({ lives: this.livesTotal, level: 1, points: 0 }),
                },
                {
                    label: 'Escolher jogo',
                    color: C.crystal,
                    onClick: () => EventBus.emit('exit-game'),
                },
            ],
        })
    }

    // ─────────────────────────────────────────────── entrada e tutorial

    private applyInput() {
        const free = !this.tutorialOpen

        this.cave.setPickable(free && this.mode === 'explore')
        this.altar.setBackEnabled(free && this.mode === 'altar' && this.pendingHidden())

        if (this.mode === 'locked' && this.lockedId) {
            this.altar.setEnabled(free, [this.lockedId])
            this.altar.setJoinEnabled(false)
            return
        }

        const atAltar = this.mode === 'altar'
        this.altar.setEnabled(free && atAltar)
        this.altar.setJoinEnabled(free && atAltar && this.selected.length > 0)
    }

    private tutorialSteps() {
        if (this.mode === 'altar' || this.mode === 'locked') {
            const first = this.gallery.data[0]
            const home = this.altar.homePos(first.id)
            const join = this.altar.joinPos()
            const row = this.altar.rowBounds()
            // O recorte mostra ONDE tocar; a frase só nomeia o gesto. A única
            // faixa livre do altar é a de cima: embaixo dela moram encaixes,
            // JUNTAR e fichas, e o botão do tutorial nasce 150px abaixo do balão.
            return [
                {
                    text: 'Toque nas que combinam.',
                    shape: 'rect' as const,
                    x: row.x,
                    y: row.y,
                    w: row.w,
                    h: row.h,
                    balloonX: 640,
                    balloonY: 175,
                    pointer: { fromX: home.x, fromY: home.y, toX: home.x, toY: home.y, tap: true },
                },
                {
                    text: 'Depois, JUNTAR.',
                    shape: 'rect' as const,
                    x: join.x,
                    y: join.y,
                    w: ALTAR.joinHitW + 30,
                    h: ALTAR.joinHitH + 20,
                    balloonX: 640,
                    balloonY: 175,
                    buttonLabel: 'Vamos!',
                    pointer: { fromX: join.x, fromY: join.y, toX: join.x, toY: join.y, tap: true },
                },
            ]
        }

        const target = this.gallery.data
            .map(datum => this.cave.posOf(datum.id))
            .reduce((best, spot) => (spot.y < best.y ? spot : best))

        return [
            {
                text: 'Toque na pedra para minerar.',
                shape: 'rect' as const,
                x: target.x,
                y: target.y,
                w: CAVE.hitW + 40,
                h: CAVE.hitH + 20,
                buttonLabel: 'Vamos!',
                pointer: { fromX: target.x, fromY: target.y, toX: target.x, toY: target.y, tap: true },
            },
        ]
    }

    private runTutorial(once: boolean) {
        this.tutorialOpen = true
        this.applyInput()
        this.hud.setEnabled(false)
        createTutorial(this, {
            key: `ef03co04-caverna-${this.mode === 'explore' ? 'explorar' : 'altar'}`,
            once,
            accent: C.crystal,
            safeTop: HUD.h + 14,
            steps: this.tutorialSteps(),
            onFinish: () => {
                this.tutorialOpen = false
                this.hud.setEnabled(true)
                this.applyInput()
                if (this.mode === 'altar' && this.galleryIndex === 0) this.door.say(PLACA)
            },
        })
    }

    private replayTutorial() {
        if (this.tutorialOpen || this.mode === 'done' || this.mode === 'walking') return
        this.runTutorial(false)
    }

    // ─────────────────────────────────────────────── plataforma

    private emitCheckpoint(complete = false) {
        const total = this.level.galleries.length
        const galleries = complete ? total : this.done
        runtimeGameBridge.emit({
            type: 'CHECKPOINT',
            gameId: GAME_ID,
            progress: Math.round((Math.min(galleries, total) / total) * 100),
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
