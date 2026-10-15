import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { FX } from '../../../../shared/effects/FX'

import { CAR_COLORS, PIECE } from '../data/files'
import { DEMO_CELL, LEVELS, POINTS, guideKey, sameCell } from '../data/levels'
import { CAR, DRIVE, GATE, GRID, SHOT, SIDE, setGridCols, spotCenter, spotRect } from '../data/layout'
import { C, CSS } from '../data/theme'
import { HELP, SAY, TEACH } from '../data/words'
import type { Cell, Facing, LevelDef, Mode, Request, Scheme } from '../types'

import { pieceImage } from './art'
import { ENGINE_VOICES, createAudio, type Audio } from './audio'
import { showBanner } from './banner'
import { createCar, type Car } from './car'
import { createControls, type Controls } from './controls'
import { spot, teach } from './guide'
import { createHint, type Hint } from './hint'
import { createHud, type Hud } from './hud'
import { createPanel } from './panel'
import { createYard, type Yard } from './yard'

const GAME_ID = 'manobrista-da-matriz'
const NEXT_MS = 500
const ERROR_MS = 2200
const FINALE_MS = 1600
const DEMO_DRIVE_MS = 3400
const COLORS = [1, 0, 3, 4, 2, 5]

type Point = { x: number; y: number }

export class GameScene extends Phaser.Scene {
    private livesTotal = 1
    private livesLeft = 1

    private level!: LevelDef
    private index = 0
    private mode: Mode = 'intro'
    private gen = 0
    private guiding = false
    private introduce = false
    private parkable: Cell | null = null
    /** o carro que a câmera segue */
    private tracking?: Car
    /** a numeração que as placas mostram agora */
    private plates: Scheme = 'lc'

    private score = 0
    private hits = 0
    private errors = 0

    private audio!: Audio
    private yard!: Yard
    private car?: Car
    private controls!: Controls
    private panel!: ReturnType<typeof createPanel>
    private hint!: Hint
    private hud!: Hud
    private banner?: Phaser.GameObjects.Container
    private desktop = false
    private keys?: Record<'left' | 'right' | 'up' | 'down', { readonly isDown: boolean }>

    private unsubPlatform?: () => void

    private get request(): Request {
        return this.level.requests[this.index]
    }

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this)
        this.livesLeft = data?.lives ?? this.livesTotal
        const number = Phaser.Math.Clamp(data?.level ?? faseInicial(this, 1), 1, LEVELS.length)
        this.level = LEVELS[number - 1]
        setGridCols(this.level.cols)
        this.plates = 'lc'
        this.index = 0
        this.mode = 'intro'
        this.guiding = false
        this.introduce = false
        this.parkable = null
        this.car = undefined
        this.tracking = undefined
        this.banner = undefined
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.unsubPlatform = undefined
    }

    create() {
        this.input.topOnly = true
        this.audio = createAudio()
        this.yard = createYard(this, this.level.rows, this.level.cols)
        this.level.parked.forEach(p => this.yard.placeParked(p.at, p.color))
        this.panel = createPanel(this)
        this.desktop = this.sys.game.device.os.desktop
        this.controls = createControls(this)
        this.controls.onPark(() => void this.park())
        this.controls.setEnabled(false)
        this.hint = createHint(this)
        this.hud = createHud(this, {
            phases: this.level.requests.length,
            level: this.level.level,
            livesTotal: this.livesTotal,
            livesLeft: this.livesLeft,
            gameId: GAME_ID,
            stage: () => this.level.level,
            onHelp: () => void this.explain(),
        })
        this.hud.setHelpEnabled(false)

        // dentro do iframe da plataforma, o clique não leva o foco do teclado para o jogo
        // (o Phaser cancela o mousedown); sem isso o W/S vai para a página de fora
        this.game.canvas.addEventListener('pointerdown', this.focusGame)
        this.focusGame()

        const kb = this.input.keyboard
        if (kb) {
            const arrows = kb.createCursorKeys()
            const wasd = kb.addKeys('W,A,S,D') as Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>
            const either = (a: Phaser.Input.Keyboard.Key, b: Phaser.Input.Keyboard.Key) => ({
                get isDown() {
                    return a.isDown || b.isDown
                },
            })
            this.keys = {
                left: either(arrows.left, wasd.A),
                right: either(arrows.right, wasd.D),
                up: either(arrows.up, wasd.W),
                down: either(arrows.down, wasd.S),
            }
            kb.on('keydown-SPACE', this.onParkKey, this)
            kb.on('keydown-ENTER', this.onParkKey, this)
        }
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
        this.game.canvas?.removeEventListener('pointerdown', this.focusGame)
        this.input.keyboard?.off('keydown-SPACE', this.onParkKey, this)
        this.input.keyboard?.off('keydown-ENTER', this.onParkKey, this)
        this.hud?.destroy()
        this.hint?.destroy()
        this.banner?.destroy()
        this.controls?.destroy()
        this.panel?.destroy()
        this.yard?.destroy()
        this.audio?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.onShowTutorial, this)
        this.unsubPlatform?.()
    }

    // ───────────────────────────────────────────── direção (todo quadro)

    update(_time: number, deltaMs: number) {
        const dt = Math.min(deltaMs, 50) / 1000
        if (this.tracking) this.yard.chase({ x: this.tracking.x, y: this.tracking.y }, dt)
        if (this.mode !== 'drive' || !this.car || this.guiding) return
        const k = this.keys
        this.controls.keySteer(k ? (k.left.isDown ? -1 : 0) + (k.right.isDown ? 1 : 0) : 0, dt)
        let throttle = this.controls.throttle()
        if (!throttle && k) throttle = k.up.isDown ? 1 : k.down.isDown ? -1 : 0

        const bump = this.car.step(dt, throttle, this.controls.steer())
        if (bump) this.bump(bump)
        this.audio.engineSpeed(Math.abs(this.car.speed) / DRIVE.vmax)

        this.parkable = throttle ? null : this.car.parkCell()
        this.controls.showPark(!!this.parkable)
    }

    private bump(at: Point) {
        this.audio.bump()
        const puff = pieceImage(this, PIECE.puff, 54).setPosition(at.x, at.y)
        this.yard.add(puff)
        this.tweens.add({ targets: puff, alpha: 0, scale: puff.scale * 1.4, duration: FX.ms(this, 420), onComplete: () => puff.destroy() })
    }

    private onParkKey() {
        void this.park()
    }

    // ───────────────────────────────────────────── nível e pedidos

    private async openLevel() {
        const gen = ++this.gen
        this.mode = 'intro'
        await FX.wait(this, 300)
        if (gen !== this.gen) return
        if (this.level.parked.length) {
            await this.yard.popParked(i => this.audio.pop(i))
            await FX.wait(this, 300)
            if (gen !== this.gen) return
        }
        if (this.introduce && this.level.level === 1) {
            await this.tutorial(gen)
            if (gen !== this.gen) return
        }
        void this.startRequest(0)
    }

    private async startRequest(index: number) {
        const gen = ++this.gen
        this.index = index
        this.mode = 'arrive'
        this.parkable = null
        this.hud.setPhase(index)
        this.hud.setHelpEnabled(false)
        this.controls.setEnabled(false)
        this.controls.showPark(false)
        this.emitCheckpoint()

        const r = this.request
        const plates: Scheme = r.scheme && r.scheme !== 'map' ? r.scheme : 'lc'
        if (plates !== this.plates) {
            this.plates = plates
            this.audio.pop(2)
            await this.yard.relabel(plates)
            if (gen !== this.gen) return
        }
        this.panel.set({ cell: r.to, scheme: r.scheme, face: r.face, rows: this.level.rows, cols: this.level.cols })
        if (this.introduce && r.face && index === 0) {
            await this.lesson(gen, [{ text: TEACH.face, ...spot(this.panel.rect()), balloonX: 640, balloonY: 300, buttonLabel: 'Vamos lá!' }])
            if (gen !== this.gen) return
        }
        if (r.guided && this.introduce) {
            void this.yard.showRow(r.to[0], 0.35)
            void this.yard.showCol(r.to[1], 0.35)
        }
        const car = createCar(this, this.yard, COLORS[index % COLORS.length] % CAR_COLORS)
        this.car = car
        this.audio.engineOn(index % ENGINE_VOICES)
        this.audio.engineSpeed(0.35)
        const arriving = car.arrive()
        await this.yard.frame({ x: GATE.x, y: GATE.y, zoom: SHOT.follow }, 700)
        this.tracking = car
        await arriving
        this.audio.engineSpeed(0)
        if (gen !== this.gen) return
        this.controls.setEnabled(true)
        this.hud.setHelpEnabled(true)
        this.mode = 'drive'
    }

    private async lesson(gen: number, steps: Parameters<typeof teach>[2], narrow = false) {
        const before = this.mode
        this.mode = 'guide'
        this.guiding = true
        this.hud.setHelpEnabled(false)
        await teach(this, guideKey(this.level.level), steps, narrow ? SIDE.w : undefined)
        this.guiding = false
        if (gen !== this.gen) return
        this.mode = before
    }

    // ───────────────────────────────────────────── tutorial do N1

    private async tutorial(gen: number) {
        const grid = this.yard.gridRect()
        const side = { balloonX: SIDE.x, balloonY: SIDE.y }
        const [row, col] = DEMO_CELL

        // a coordenada, só com animação: do chip do painel até a placa, e a faixa se pinta
        this.panel.set({ cell: DEMO_CELL, rows: this.level.rows, cols: this.level.cols })
        await FX.wait(this, 700)
        if (gen !== this.gen) return
        this.panel.bump('row')
        const rp = this.yard.rowPlate(row)
        this.hint.show(this.panel.chip('row'), { x: rp.x + 36, y: rp.y })
        await FX.wait(this, 1000)
        this.hint.hide()
        if (gen !== this.gen) return
        void this.yard.bumpRow(row)
        this.audio.pop(0)
        await this.yard.sweepRow(row)
        await FX.wait(this, 300)
        if (gen !== this.gen) return
        this.panel.bump('col')
        const cp = this.yard.colPlate(col)
        this.hint.show(this.panel.chip('col'), { x: cp.x + 34, y: cp.y })
        await FX.wait(this, 1000)
        this.hint.hide()
        if (gen !== this.gen) return
        void this.yard.bumpCol(col)
        this.audio.pop(1)
        await this.yard.sweepCol(col)
        if (gen !== this.gen) return
        this.yard.mark(DEMO_CELL)
        this.audio.cheer()
        const p = spotCenter(DEMO_CELL)
        const star = pieceImage(this, PIECE.star, 60).setPosition(p.x, p.y)
        this.yard.add(star)
        await FX.popIn(this, star, { from: 0.2, duration: 360 })
        await this.lesson(gen, [{ text: TEACH.cross(DEMO_CELL), ...spot(grid), ...side, buttonLabel: 'Ver' }], true)
        star.destroy()
        if (gen !== this.gen) return
        this.yard.hideGuides()

        // os controles, sem balão: cada um acende enquanto o carro de demonstração é dirigido
        const car = createCar(this, this.yard, 2)
        this.audio.engineOn(0)
        this.audio.engineSpeed(0.35)
        await car.arrive()
        this.audio.engineSpeed(0)
        if (gen !== this.gen) return
        this.yard.mark(DEMO_CELL)
        await this.yard.frame({ x: car.x, y: car.y, zoom: SHOT.follow }, 700)
        this.tracking = car
        if (gen !== this.gen) return
        this.controls.glow('wheel', true)
        this.controls.glow('gas', true)
        await this.demoDrive(car, gen)
        this.controls.glow('wheel', false)
        this.controls.glow('gas', false)
        if (gen !== this.gen) return

        this.mode = 'guide'
        this.controls.showPark(true)
        const btn = this.controls.parkRect()
        this.hint.show({ x: btn.x - 170, y: btn.y - 160 }, { x: btn.x - 30, y: btn.y - 52 })
        await FX.wait(this, 1200)
        this.hint.hide()
        if (gen !== this.gen) return
        this.hint.tap({ x: btn.x, y: btn.y })
        this.controls.tapPark()
        this.controls.showPark(false)
        this.yard.hideGuides()
        this.audio.nhec()
        this.audio.engineOn(null)
        await car.snap(DEMO_CELL)
        this.tracking = undefined
        await this.cheer(DEMO_CELL)
        if (gen !== this.gen) return
        await this.yard.frame(SHOT.wide, 600)
        if (gen !== this.gen) return
        await FX.to(this, car.image, { alpha: 0 }, { duration: 300 })
        car.destroy()

        await this.lesson(gen, [{ text: TEACH.yourTurn, ...spot(this.panel.rect()), balloonX: 640, balloonY: 300, buttonLabel: 'Vamos lá!' }])
    }

    /** o próprio jogo dirige do portão até a vaga da demonstração, com o pedal afundado e o volante girando junto */
    private async demoDrive(car: Car, gen: number) {
        const to = spotCenter(DEMO_CELL)
        const rect = spotRect(DEMO_CELL)
        const aisle = rect.y + rect.h + GRID.aisle / 2
        const path = [
            { x: GATE.x, y: GATE.y },
            { x: GATE.x, y: aisle + 70 },
            { x: GATE.x - 50, y: aisle + 4 },
            { x: to.x + 120, y: aisle },
            { x: to.x + 30, y: aisle - 18 },
            { x: to.x + 4, y: rect.y + rect.h - 10 },
            { x: to.x, y: to.y },
        ]
        this.controls.press('gas', true)
        this.audio.engineSpeed(0.6)
        let wheel = 0
        await car.follow(path, DEMO_DRIVE_MS, turn => {
            wheel = Phaser.Math.Linear(wheel, Phaser.Math.Clamp(turn * 2400, -130, 130), 0.2)
            this.controls.setWheel(wheel)
        })
        this.controls.press('gas', false)
        this.controls.center()
        this.audio.engineSpeed(0)
        if (gen !== this.gen) return
        await FX.wait(this, 250)
    }

    // ───────────────────────────────────────────── estacionar

    private async park() {
        if (this.mode !== 'drive' || this.guiding || !this.car || !this.parkable) return
        const gen = this.gen
        const cell = this.parkable
        const car = this.car
        const r = this.request
        this.mode = 'park'
        this.parkable = null
        this.controls.tapPark()
        this.controls.showPark(false)
        this.controls.setEnabled(false)
        this.hud.setHelpEnabled(false)
        this.audio.nhec()
        this.audio.engineOn(null)
        await car.snap(cell)
        this.tracking = undefined
        if (gen !== this.gen) return
        this.yard.park(cell, car.image)
        this.car = undefined

        if (!sameCell(cell, r.to)) {
            await this.jam(cell, r.to)
            return
        }
        const face: Facing = Math.abs(Phaser.Math.Angle.Wrap(car.heading)) < Math.PI / 2 ? 'front' : 'back'
        if (r.face && face !== r.face) {
            await this.jamFace(cell, r.face)
            return
        }
        this.yard.hideGuides()
        await this.cheer(cell)
        if (gen !== this.gen) return
        await this.yard.frame(SHOT.wide, 600)
        if (gen !== this.gen) return
        await this.success(gen)
    }

    /** o motorista desce feliz e uma estrelinha brilha na vaga */
    private async cheer(cell: Cell) {
        const p = spotCenter(cell)
        this.audio.cheer()
        const star = pieceImage(this, PIECE.star, 46).setPosition(p.x, p.y - CAR.len / 2 - 6)
        const driver = pieceImage(this, PIECE.driver, 70).setPosition(p.x - GRID.spotW / 2 + 4, p.y + 10).setAlpha(0)
        this.yard.add(star)
        this.yard.add(driver)
        void FX.popIn(this, star, { from: 0.2, duration: 300 })
        await FX.to(this, driver, { alpha: 1, x: p.x - GRID.spotW / 2 - 18 }, { duration: 260, ease: 'Back.easeOut' })
        await FX.to(this, driver, { y: p.y - 6 }, { duration: 160, yoyo: true, repeat: 1, ease: 'Sine.easeOut' })
        await FX.wait(this, 250)
        void FX.to(this, [driver, star], { alpha: 0 }, { duration: 300 }).then(() => {
            driver.destroy()
            star.destroy()
        })
    }

    private async success(gen: number) {
        this.score += POINTS
        this.hits += 1
        runtimeGameBridge.emit({ type: 'CORRECT_ANSWER', gameId: GAME_ID, pointsEarned: POINTS, stage: this.level.level })
        await this.hud.celebrate(this.index)
        if (gen !== this.gen) return
        await FX.wait(this, NEXT_MS)
        if (gen !== this.gen) return
        if (this.index + 1 < this.level.requests.length) {
            void this.startRequest(this.index + 1)
            return
        }
        this.index += 1
        this.emitCheckpoint()
        void this.endLevel()
    }

    // ───────────────────────────────────────────── erro

    /** o carro fica na vaga errada; a linha e a coluna pedidas acendem e se cruzam na vaga certa */
    private async jam(at: Cell, want: Cell) {
        const gen = ++this.gen
        this.mode = 'jam'
        this.hud.setHelpEnabled(false)
        await this.yard.frame(SHOT.wide, 600)
        if (gen !== this.gen) return
        this.audio.beep()
        this.audio.blom()
        await FX.wait(this, 300)
        if (gen !== this.gen) return
        void this.yard.bumpRow(want[0])
        await this.yard.showRow(want[0], 0.5)
        await FX.wait(this, 350)
        if (gen !== this.gen) return
        void this.yard.bumpCol(want[1])
        await this.yard.showCol(want[1], 0.5)
        this.yard.mark(want)
        this.banner = showBanner(this, SAY.wrongSpot(at, want, this.plates))
        await FX.wait(this, ERROR_MS)
        if (gen !== this.gen) return
        this.audio.fail()
        this.lose()
    }

    /** a vaga certa, mas o carro entrou virado ao contrário do pedido */
    private async jamFace(cell: Cell, want: Facing) {
        const gen = ++this.gen
        this.mode = 'jam'
        this.hud.setHelpEnabled(false)
        this.audio.beep()
        this.audio.blom()
        this.yard.mark(cell)
        this.banner = showBanner(this, SAY.wrongFace(want))
        await FX.wait(this, ERROR_MS)
        if (gen !== this.gen) return
        this.audio.fail()
        this.lose()
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
        if (this.mode !== 'drive' || this.guiding) return
        const gen = this.gen
        this.controls.setEnabled(false)
        const steps: Parameters<typeof teach>[2] = [
            { text: HELP.panel, ...spot(this.panel.rect()), balloonX: 640, balloonY: 300, buttonLabel: 'Próximo' },
            { text: this.desktop ? HELP.controlsKeys : HELP.controls, ...spot(this.controls.pedalRect()), balloonX: 640, balloonY: 470, buttonLabel: 'Continuar' },
        ]
        this.mode = 'panel'
        this.guiding = true
        this.hud.setHelpEnabled(false)
        await teach(this, `${guideKey(this.level.level)}-help`, steps)
        this.guiding = false
        if (gen !== this.gen) return
        this.mode = 'drive'
        this.controls.setEnabled(true)
        this.hud.setHelpEnabled(true)
    }

    private onShowTutorial() {
        void this.explain()
    }

    // ───────────────────────────────────────────── fim do nível

    private async endLevel() {
        const gen = ++this.gen
        this.mode = 'finale'
        this.hud.setHelpEnabled(false)
        this.controls.setEnabled(false)
        runtimeGameBridge.emit({
            type: 'GAME_COMPLETED',
            gameId: GAME_ID,
            stage: this.level.level,
            totalStages: LEVELS.length,
            score: Math.max(0, Math.round(this.score)),
            errors: this.errors,
        })

        await this.yard.frame(SHOT.wide, 400)
        if (gen !== this.gen) return
        await this.yard.blink(() => this.audio.beep())
        if (gen !== this.gen) return
        this.audio.win()
        void FX.confetti(this, { colors: [C.star, C.mint, C.lilac, C.accent, 0xffffff] })
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
            progress: { total: this.level.requests.length, current: this.level.requests.length },
            ...(!last
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
            progress: Math.min(100, Math.round((this.index / this.level.requests.length) * 100)),
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
