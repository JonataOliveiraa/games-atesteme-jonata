import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { FX, Ease } from '../../../../shared/effects/FX'
import { createTutorial } from '../../../../shared/tutorial/createTutorial'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { CARDS, INTRO_MISSION, LEVELS, PEOPLE, canShareWith, validateLevels } from '../data/levels'
import { C, FONT, SIZE, hex } from '../data/theme'
import {
    W, H, HUD, CUE, PARK, WATCHER, HIDEOUT, RUNNER, GATE, ALBUM, INTERCEPT,
    bushFor, stopsFor, watcherSpots, type BushSize, type WatcherSpot,
} from '../data/layout'
import {
    paintPanel, paintPill, paintCard, fillShieldSlot, dataIcon, dataCard, symbolIcon, setSymbol,
    drawGoIcon, SHIELD_ICON_DY,
    paintPark, paintHideout, paintHideoutGlow, paintHideoutArrow, drawSafeBeam,
    paintWatcher, paintCone, paintSafe, paintPerson,
    screenGlow, showToast, speechBubble, type BubbleIcon, type Icon,
} from './effects'
import { createTalk } from './talk'
import type {
    DataKind, GateView, HideoutState, HideoutView, LevelConfig, PersonId, PhaseDef,
} from '../types'

const GAME_ID = 'esconde-dados'

const KID = { idle: 0, run: 1, hidden: 2, refuse: 3 }

const RUN_MS = 880

export class GameScene extends Phaser.Scene {
    private lives!: Lives
    private livesTotal = 3
    private livesLeft = 3

    private levelIdx = 0
    private phaseIdx = 0
    private points = 0
    private hits = 0
    private errors = 0
    private missesOnGate = 0
    private locked = true
    private ended = false
    private isMuted = false

    /** Em que parada a criança está. 0 é a entrada. */
    private stopIdx = 0
    private lit = false
    private running = false
    private runTween?: Phaser.Tweens.Tween
    private cycleEvent?: Phaser.Time.TimerEvent
    private sweep = { t: 0 }
    private sweepTween?: Phaser.Tweens.Tween

    private parkG!: Phaser.GameObjects.Graphics
    private coneG!: Phaser.GameObjects.Graphics
    /**
     * Os curiosos. `watchers[0]` é o do nível 1 e 2; o nível 3 tem dois, e
     * `aceso` diz de quem é a vez — só um acende por janela de luz.
     */
    private watchers: Array<{
        spot: WatcherSpot
        body: Phaser.GameObjects.Image | Phaser.GameObjects.Graphics
        g?: Phaser.GameObjects.Graphics
    }> = []
    private lightIdx = 0
    private hideouts: HideoutView[] = []
    private runner!: Phaser.GameObjects.Container
    private runnerSprite?: Phaser.GameObjects.Sprite

    private phaseText!: Phaser.GameObjects.Text
    private phasePulse?: Phaser.Tweens.Tween
    private shields: Array<{ slot: Phaser.GameObjects.Container; icon?: Icon }> = []
    /*
     * Porta-ícones: o container fica parado no lugar e só o ícone de dentro
     * troca (`showIcon`). O da pílula alterna entre olho, "pode ir" e o dado.
     */
    private cardIcon!: Phaser.GameObjects.Container
    private cardLabel!: Phaser.GameObjects.Text
    private cueBg!: Phaser.GameObjects.Graphics
    private cueIcon!: Phaser.GameObjects.Container
    private cueText!: Phaser.GameObjects.Text

    private gateLayer?: Phaser.GameObjects.Container
    /** O cartão nas mãos da criança, enquanto ela decide para quem mostrar. */
    private heldCard?: Phaser.GameObjects.Container
    private gatePeople: GateView[] = []
    /*
     * O cofre é sprite quando `cofre.png` existe e Graphics quando não —
     * daí o tipo em união. `safeSlot` é onde fica o vão de guardar, que
     * muda entre os dois.
     */
    private safe?: Phaser.GameObjects.Graphics | Phaser.GameObjects.Sprite
    private safeSlot = { dx: 0, dy: 0 }
    private safeBeam?: Phaser.GameObjects.Graphics
    private safeShadow?: Phaser.GameObjects.Graphics
    private safeState = { open: 0 }
    private hintTween?: Phaser.Tweens.Tween

    /** O avatar que para o caminho no nível 3, e as coisas que morrem com ele. */
    private interceptLayer?: Phaser.GameObjects.Container
    private interceptHits: Phaser.GameObjects.Zone[] = []
    private missesOnPath = 0

    /** Qual dado já foi protegido, para o álbum do fim de nível. */
    private saved: DataKind[] = []

    /**
     * Geração da fase. Callback atrasado compara com o valor que capturou e
     * desiste se a fase já trocou — sem isso um `await` da fase anterior mexe
     * em objeto destruído.
     */
    private roundGen = 0
    /** O tutorial espera a abertura da primeira fase terminar. */
    private pendingTutorial = true
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
        this.missesOnGate = 0
        this.locked = true
        this.ended = false
        this.stopIdx = 0
        this.lit = false
        this.running = false
        this.hideouts = []
        this.shields = []
        this.gatePeople = []
        this.watchers = []
        this.lightIdx = 0
        this.interceptHits = []
        this.interceptLayer = undefined
        this.missesOnPath = 0
        this.saved = []
        // `roundGen` NÃO volta a zero: a cena é o mesmo objeto depois de um
        // `restart`, e uma abertura pendurada da partida anterior veria o mesmo
        // número de geração, passaria na trava e escreveria em texto destruído.
        this.pendingTutorial = true
        this.safeState.open = 0
    }

    create() {
        const problems = validateLevels(LEVELS)
        if (problems.length) console.warn('[esconde-dados] níveis:', problems)

        this.parkG = this.add.graphics().setDepth(-20)
        paintPark(this.parkG)

        this.buildHud()
        this.buildCue()
        this.buildPath()
        this.buildRunner()
        this.registerPlatformCommands()

        EventBus.on('mute-audio', this.onMuteAudio, this)
        EventBus.on('show-tutorial', this.replayTutorial, this)
        this.events.once('shutdown', this.shutdownScene, this)

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        this.startPhase()

        /* AJUSTE A POSIÇÃO COM A TECLA M (dev). Ver shared/hud/createLives.ts */
        this.lives = createLives(this, {
            total: this.livesTotal,
            remaining: this.livesLeft,
            gameId: GAME_ID,
            x: HUD.livesX,
            y: HUD.cy,
            size: 30,
            tint: C.red,
            stage: () => this.level.level,
        })
        this.events.once('shutdown', () => this.lives.destroy())
    }

    private get level(): LevelConfig { return LEVELS[this.levelIdx] }
    private get phase(): PhaseDef { return this.level.phases[this.phaseIdx] }

    /** Onde as paradas ficam neste nível. A 0 é a entrada. */
    private get stops(): number[] { return stopsFor(this.level.hideouts) }
    /** O tamanho da moita neste nível — quatro paradas pedem moita menor. */
    private get bush(): BushSize { return bushFor(this.level.hideouts) }

    private shutdownScene() {
        // toda espera pendurada desiste ao acordar
        this.roundGen += 1
        this.cycleEvent?.remove()
        this.sweepTween?.remove()
        this.runTween?.remove()
        this.hintTween?.remove()
        this.phasePulse?.remove()
        EventBus.off('mute-audio', this.onMuteAudio, this)
        EventBus.off('show-tutorial', this.replayTutorial, this)
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

    /* ─────────────────────────────────────────────────────────── header */

    private buildHud() {
        const level = this.add.graphics().setDepth(60)
        paintPill(level, HUD.levelX, HUD.y, HUD.levelW, HUD.h, C.safeLight, C.safeGreen)
        this.add.text(HUD.levelX + HUD.levelW / 2, HUD.cy, `NÍVEL ${this.level.level}`, {
            fontFamily: FONT.black, fontSize: SIZE.hudLevel, color: hex(C.ink),
        }).setOrigin(0.5).setDepth(61).setResolution(2)

        const phase = this.add.graphics().setDepth(60)
        paintPill(phase, HUD.phaseX, HUD.y, HUD.phaseW, HUD.h, C.cream, C.safeGreen)
        this.phaseText = this.add.text(HUD.phaseX + HUD.phaseW / 2, HUD.cy, '', {
            fontFamily: FONT.body, fontStyle: 'bold', fontSize: SIZE.hudPhase, color: hex(C.ink),
        }).setOrigin(0.5).setDepth(61).setResolution(2)

        this.buildShields()
        this.buildCardChip()
        this.buildHelpButton()
    }

    /** Um escudo por fase: o dado que já ficou seguro no cofre. */
    private buildShields() {
        for (let i = 0; i < this.level.phases.length; i += 1) {
            const slot = this.add.container(this.shieldX(i), HUD.cy).setDepth(61)
            fillShieldSlot(this, slot, HUD.shieldSize, 'empty')
            this.shields.push({ slot })
        }
    }

    private shieldX(index: number) {
        return HUD.shieldX + HUD.shieldSize / 2 + index * (HUD.shieldSize + HUD.shieldGap)
    }

    /** O cartão que está sendo carregado agora, sempre à vista. */
    /**
     * O chip do cartão, no header.
     *
     * A largura sai do rótulo MAIS COMPRIDO do jogo, medido com a fonte de
     * verdade: com os 214 px fixos de antes, "Onde eu moro" e "Meu telefone"
     * passavam da borda. É um tamanho só para a partida inteira — o chip não
     * encolhe e cresce a cada fase.
     */
    private buildCardChip() {
        const style = { fontFamily: FONT.black, fontSize: SIZE.cardLabel, color: hex(C.ink) }
        const widest = Math.max(...Object.values(CARDS).map(card => {
            const probe = this.add.text(0, 0, card.label, style)
            const width = probe.width
            probe.destroy()
            return width
        }))
        const w = Math.max(HUD.cardW, HUD.cardLabelDX + Math.ceil(widest) + HUD.cardPadR)

        const bg = this.add.graphics().setPosition(HUD.cardX + w / 2, HUD.cy).setDepth(60)
        paintCard(bg, w, HUD.cardH)

        this.cardIcon = this.add.container(HUD.cardX + 40, HUD.cy).setDepth(61)

        this.cardLabel = this.add.text(HUD.cardX + HUD.cardLabelDX, HUD.cy, '', style)
            .setOrigin(0, 0.5).setDepth(61).setResolution(2)
    }

    private buildHelpButton() {
        const { helpX, cy, helpR } = HUD
        const g = this.add.graphics().setDepth(61)
        g.fillStyle(C.cream, 0.95)
        g.fillCircle(helpX, cy, helpR)
        g.lineStyle(5, C.safeGreen, 1)
        g.strokeCircle(helpX, cy, helpR)

        const label = this.add.text(helpX, cy - 1, '?', {
            fontFamily: FONT.black, fontSize: '30px', color: hex(C.ink),
        }).setOrigin(0.5).setDepth(62).setResolution(2)

        this.add.zone(helpX, cy, 144, 144).setDepth(63)
            .setInteractive({ useHandCursor: true })
            .on('pointerup', () => {
                FX.press(this, label)
                this.playTap()
                this.replayTutorial()
            })
    }

    private refreshPhase() {
        const total = this.level.phases.length
        this.phaseText.setText(`Fase ${this.phaseIdx + 1} de ${total}`)

        this.phasePulse?.remove()
        this.phasePulse = undefined

        this.shields.forEach((slot, i) => {
            if (slot.icon) return
            const current = i === this.phaseIdx
            FX.kill(this, slot.slot)
            slot.slot.setScale(1)
            fillShieldSlot(this, slot.slot, HUD.shieldSize, current ? 'current' : 'empty')
            if (current) {
                this.phasePulse = FX.breathe(this, slot.slot, { grow: 1.1, duration: 1100 })
            }
        })

        const card = CARDS[this.phase.card]
        this.showIcon(this.cardIcon, dataIcon(this, card.kind, 48))
        this.cardLabel.setText(card.label)
    }

    /** Troca o ícone de um porta-ícone, sem mexer no porta-ícone. */
    private showIcon(holder: Phaser.GameObjects.Container, icon: Icon) {
        holder.removeAll(true)
        holder.add(icon)
    }

    private fillShield(index: number, kind: DataKind) {
        const slot = this.shields[index]
        if (!slot || slot.icon) return

        this.phasePulse?.remove()
        this.phasePulse = undefined
        FX.kill(this, slot.slot)
        slot.slot.setScale(1)
        fillShieldSlot(this, slot.slot, HUD.shieldSize, 'done')

        const icon = dataIcon(this, kind, HUD.shieldSize * 0.5)
            .setPosition(this.shieldX(index), HUD.cy + HUD.shieldSize * SHIELD_ICON_DY)
            .setDepth(62)
        slot.icon = icon

        FX.popIn(this, icon, { from: 0.4, duration: 420 })
        FX.impact(this, slot.slot, 0.2)
    }

    /* ────────────────────────────────────────────────────── semáforo */

    private buildCue() {
        this.cueBg = this.add.graphics().setDepth(50)
        this.cueIcon = this.add.container(CUE.cx + CUE.iconX, CUE.cy).setDepth(51)
        this.cueText = this.add.text(CUE.cx + 30, CUE.cy, '', {
            fontFamily: FONT.black, fontSize: SIZE.cue, color: hex(C.ink),
        }).setOrigin(0.5).setDepth(51).setResolution(2)
        this.paintCue()
    }

    /**
     * O semáforo é a única fonte de verdade do percurso: verde com seta quer
     * dizer que o toque abre, âmbar com olho quer dizer que a lanterna está
     * varrendo. O cone desenha o porquê; a pílula desenha a regra.
     */
    private paintCue() {
        paintPill(
            this.cueBg,
            CUE.cx - CUE.w / 2, CUE.cy - CUE.h / 2, CUE.w, CUE.h,
            this.lit ? C.amber : C.safeLight,
            this.lit ? C.amberDark : C.safeGreen,
        )

        // O olho é o mesmo da fala de quem quer ver: "alguém está olhando".
        if (this.lit) {
            this.showIcon(this.cueIcon, symbolIcon(this, 'eye', 50))
        } else {
            const go = this.add.graphics()
            drawGoIcon(go)
            this.showIcon(this.cueIcon, go)
        }

        this.cueText.setText(this.lit ? 'Espere' : 'Pode ir!')
    }

    /* ─────────────────────────────────────────────────────── percurso */

    private buildPath() {
        this.buildTrees()

        this.coneG = this.add.graphics().setDepth(8)
        this.buildWatchers()

        const stops = this.stops
        const bush = this.bush

        for (let i = 1; i <= this.level.hideouts; i += 1) {
            const x = stops[i]

            const glow = this.add.graphics().setPosition(x, HIDEOUT.y + 60).setDepth(11)
            paintHideoutGlow(glow, bush.w, false)

            const body = this.makeBush(x, HIDEOUT.y)

            const arrow = this.add.graphics().setPosition(x, HIDEOUT.y - 118).setDepth(13)
            paintHideoutArrow(arrow, false)

            const hit = this.add.zone(x, HIDEOUT.y - 6, bush.hitW, bush.hitH)
                .setDepth(14).setInteractive({ useHandCursor: true })

            const view: HideoutView = { index: i, x, glow, body, arrow, hit, state: 'idle' }
            hit.on('pointerdown', () => this.tryRun(view))
            this.hideouts.push(view)
        }

        // a entrada também é uma moita, para a primeira parada não parecer solta
        this.entryBush = this.makeBush(stops[0], HIDEOUT.y)
    }

    /** A moita da entrada. Guardada para sair de cena junto com as outras no portão. */
    private entryBush?: Phaser.GameObjects.Image | Phaser.GameObjects.Graphics

    /** A escala natural da moita, para o breathe voltar ao lugar certo. */
    private bushScale = 1

    /**
     * Os guardas da pracinha.
     *
     * Com `seguranca.png` ele é uma pessoa de verdade, simpática, fazendo a
     * ronda — e não um vulto. Continua sendo a LANTERNA o obstáculo: ele nunca
     * persegue ninguém.
     *
     * No nível 3 são dois, um de cada lado, e o segundo entra ESPELHADO: a
     * criança tem de reconhecer de qual lado a luz vai nascer, e dois desenhos
     * idênticos olhando para o mesmo lado não dizem isso.
     */
    private buildWatchers() {
        watcherSpots(this.level.watchers).forEach(spot => {
            if (this.textures.exists('seguranca')) {
                const img = this.add.image(spot.x, spot.y, 'seguranca').setDepth(6)
                this.fit(img, WATCHER.size, WATCHER.size)
                if (spot.flip) img.setFlipX(true)
                FX.float(this, img, { amount: 5, duration: 2600 })
                this.watchers.push({ spot, body: img })
                return
            }
            const g = this.add.graphics().setPosition(spot.x, spot.y).setDepth(6)
            paintWatcher(g, WATCHER.size * 0.72, false)
            this.watchers.push({ spot, body: g, g })
        })
    }

    /** De quem é a vez de acender. Com um curioso só, é sempre ele. */
    private get lighting() { return this.watchers[this.lightIdx] ?? this.watchers[0] }

    /** A moita: `moita.png` quando existe, desenho quando não. */
    private makeBush(x: number, y: number) {
        if (this.textures.exists('moita')) {
            const img = this.add.image(x, y, 'moita').setDepth(12)
            this.fit(img, this.bush.w, this.bush.h)
            this.bushScale = img.scale
            return img
        }
        const g = this.add.graphics().setPosition(x, y).setDepth(12)
        paintHideout(g, this.bush.w, this.bush.h, false)
        return g
    }

    private buildTrees() {
        if (!this.textures.exists('arvore')) return
        // Só as duas das pontas. A terceira, pequena, ficava com a base em
        // y 380, acima do horizonte (424): parecia boiando no céu.
        const spots: Array<[number, number, number]> = [
            [92, 322, 268],
            [1192, 312, 292],
        ]
        spots.forEach(([x, y, size]) => {
            const tree = this.add.image(x, y, 'arvore').setDepth(4)
            this.fit(tree, size, size)
        })
    }

    private buildRunner() {
        this.runner = this.add.container(this.stops[0], RUNNER.y).setDepth(20)

        if (this.textures.exists('crianca')) {
            this.runnerSprite = this.add.sprite(0, 0, 'crianca', KID.idle)
            this.fit(this.runnerSprite, RUNNER.size, RUNNER.size)
            this.runner.add(this.runnerSprite)
            return
        }

        const g = this.add.graphics()
        paintPerson(g, RUNNER.size * 0.8, C.shirt)
        this.runner.add(g)
    }

    private setRunnerFrame(frame: number) {
        this.runnerSprite?.setFrame(frame)
    }

    /**
     * A pose no percurso.
     *
     * Escondida, a criança vai para TRÁS da moita e sobe um pouco: o que
     * aparece é a carinha por cima do mato, que é o desenho universal de estar
     * escondido. Correndo, ela volta para a frente e para o chão.
     */
    private poseRunner(frame: number) {
        this.setRunnerFrame(frame)
        const hidden = frame === KID.hidden
        this.runner.setDepth(hidden ? 10 : 20)
        this.runner.setY(hidden ? RUNNER.y - 54 : RUNNER.y)
    }

    /* ──────────────────────────────────────────────────── ciclo da luz */

    /**
     * A vez passa para o outro curioso NO ESCURO, nunca com a luz acesa.
     *
     * Trocar de dono no meio do clarão faria o cone saltar de um lado da tela
     * para o outro, e a criança que já tinha escolhido esperar seria pega por
     * uma luz que não estava ali.
     */
    private startLightCycle(lit = false) {
        this.cycleEvent?.remove()
        if (lit && this.watchers.length > 1) {
            this.lightIdx = (this.lightIdx + 1) % this.watchers.length
        }
        this.setLit(lit)
        this.cycleEvent = this.time.delayedCall(
            lit ? this.level.litMs : this.level.freeMs,
            () => this.startLightCycle(!lit),
        )
    }

    private stopLightCycle() {
        this.cycleEvent?.remove()
        this.cycleEvent = undefined
        this.sweepTween?.remove()
        this.sweepTween = undefined
        this.setLit(false)
    }

    private setLit(lit: boolean) {
        const changed = lit !== this.lit
        this.lit = lit
        this.paintCue()
        // só quem está de vez muda de cara; o outro continua de ronda
        this.watchers.forEach((w, i) => {
            if (w.g) paintWatcher(w.g, WATCHER.size * 0.72, lit && i === this.lightIdx)
        })

        if (lit) {
            this.sweepTween?.remove()
            this.sweep.t = 0
            this.sweepTween = this.tweens.add({
                targets: this.sweep, t: 1,
                duration: this.level.litMs,
                ease: 'Sine.easeInOut',
            })
            if (changed) this.playSweep()
        }

        this.refreshHideouts()

        // pega no meio da corrida: é o único jeito de a luz alcançar alguém
        if (lit && this.running) this.caught()
    }

    update() {
        if (!this.coneG) return
        const lighting = this.lighting
        if (!lighting) return
        const { spot } = lighting
        const aim = Phaser.Math.Linear(spot.aim[0], spot.aim[1], this.sweep.t)
        paintCone(
            this.coneG,
            { x: spot.x + spot.handDX, y: spot.y + spot.handDY },
            aim, 190, this.lit ? 1 : 0,
        )
    }

    /* ──────────────────────────────────────────────────────── corrida */

    private hideoutState(index: number): HideoutState {
        if (index <= this.stopIdx) return 'done'
        if (index !== this.stopIdx + 1) return 'idle'
        return this.lit || this.running || this.locked ? 'blocked' : 'target'
    }

    private refreshHideouts() {
        this.hideouts.forEach(h => {
            const state = this.hideoutState(h.index)
            if (state === h.state) return
            h.state = state

            const target = state === 'target'
            const blocked = state === 'blocked'

            paintHideoutGlow(h.glow, this.bush.w, target)
            paintHideoutArrow(h.arrow, target)

            FX.kill(this, h.body)
            h.body.setScale(this.bushScale)
            if (h.body instanceof Phaser.GameObjects.Image) {
                if (blocked) h.body.setTint(0x86a58a)
                else h.body.clearTint()
            } else {
                paintHideout(h.body, this.bush.w, this.bush.h, blocked)
            }

            if (target) {
                FX.breathe(this, h.body, { grow: 1.05, duration: 900 })
                FX.float(this, h.arrow, { amount: 9, duration: 800 })
            } else {
                FX.kill(this, h.arrow)
            }
        })
    }

    private tryRun(view: HideoutView) {
        if (this.locked || this.ended || this.running) return
        if (view.index !== this.stopIdx + 1) return

        if (this.lit) {
            this.playBlocked()
            FX.shake(this, this.cueBg, { amount: 8, times: 3 })
            FX.impact(this, this.cueIcon, 0.2)
            return
        }

        this.run(view.index)
    }

    private run(index: number) {
        this.running = true
        this.refreshHideouts()
        this.poseRunner(KID.run)
        this.playRun()

        this.runTween = this.tweens.add({
            targets: this.runner,
            x: this.stops[index],
            duration: RUN_MS,
            ease: 'Sine.easeInOut',
            onComplete: () => this.arrive(index),
        })
    }

    /** Ser pega pela luz no meio da corrida encerra a partida. */
    private caught() {
        this.runTween?.remove()
        this.runTween = undefined
        this.running = false
        this.playCaught()

        FX.impact(this, this.lighting.body, 0.22)
        FX.shakeCam(this, 'leve')
        FX.ping(this, this.runner.x, PARK.footY - 40, C.light, { radius: 90 })

        this.tweens.add({
            targets: this.runner,
            x: this.stops[this.stopIdx],
            duration: 420,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.poseRunner(this.stopIdx === 0 ? KID.idle : KID.hidden)
                this.refreshHideouts()
            },
        })

        this.locked = true
        this.errors += 1
        runtimeGameBridge.emit({
            type: 'WRONG_ANSWER', gameId: GAME_ID, pointsEarned: 0, stage: this.level.level,
        })
        this.lives.lose()
        this.livesLeft = this.lives.remaining
        this.emitCheckpoint()
    }

    private arrive(index: number) {
        this.runTween = undefined
        this.running = false
        this.stopIdx = index
        this.poseRunner(KID.hidden)
        this.playHide()
        FX.impact(this, this.runner, 0.14)
        this.refreshHideouts()
        this.emitCheckpoint()

        if (index >= this.level.hideouts) {
            this.locked = true
            const avatar = this.phase.intercept
            if (avatar) {
                this.time.delayedCall(460, () => this.openIntercept(avatar))
                return
            }
            this.time.delayedCall(620, () => this.openGate())
        }
    }

    /* ────────────────────────────────────── o avatar no meio do caminho */

    /**
     * O PEDIDO QUE NÃO TEM ROSTO NA FRENTE.
     *
     * No portão sempre houve alguém certo para tocar. Aqui não há: as duas
     * coisas tocáveis são o avatar, que quer o cartão, e o botão de recusar. A
     * resposta é sair de perto — e é um gesto que a criança ainda não fez.
     *
     * As duas silhuetas são de propósito diferentes: um boneco no chão e uma
     * pílula vermelha na base. Dois retângulos iguais fariam a escolha virar
     * sorteio.
     */
    private openIntercept(id: PersonId) {
        const gen = this.roundGen
        this.stopLightCycle()
        this.missesOnPath = 0

        const def = PEOPLE[id]
        const layer = this.add.container(0, 0).setDepth(52)
        this.interceptLayer = layer

        // o clarão do aparelho no chão: é o que diz que ele não é da pracinha
        const glow = this.add.graphics().setPosition(INTERCEPT.x, INTERCEPT.y + 96)
        glow.fillStyle(C.avatar, 0.22)
        glow.fillEllipse(0, 0, INTERCEPT.size * 1.1, 46)
        layer.add(glow)

        const holder = this.add.container(INTERCEPT.x, INTERCEPT.y)
        if (this.textures.exists('pessoas')) {
            const sprite = this.add.sprite(0, 0, 'pessoas', def.frame)
            this.fit(sprite, INTERCEPT.size, INTERCEPT.size)
            holder.add(sprite)
        } else {
            const g = this.add.graphics()
            paintPerson(g, INTERCEPT.size * 0.8, def.color)
            holder.add(g)
        }
        layer.add(holder)

        // Ela sai de trás da moita para falar: o avatar não conversa com um
        // arbusto, e a pose de escondida é a mesma de "não estou aqui".
        this.poseRunner(KID.idle)
        this.paintInterceptCue()

        FX.popIn(this, holder, { from: 0.5, duration: 420 })
        FX.float(this, holder, { amount: 6, duration: 2200 })
        this.playGate()

        const bubble = speechBubble(
            this, INTERCEPT.x - 40, INTERCEPT.y + INTERCEPT.bubbleDY,
            def.ask ?? '', def.askIcon ?? 'eye', C.redSoft,
        )
        layer.add(bubble)
        FX.popIn(this, bubble, { from: 0.6, duration: 300, delay: 320 })

        const no = this.buildNoButton()
        layer.add(no)
        FX.popIn(this, no, { from: 0.6, duration: 360, delay: 620 })

        // As zonas ficam FORA do container, como as do portão: dentro dele o
        // clique não chega.
        const onAvatar = this.add
            .zone(INTERCEPT.x, INTERCEPT.y + 30, INTERCEPT.hitW, INTERCEPT.hitH)
            .setDepth(55).setInteractive({ useHandCursor: true })
        const onNo = this.add
            .zone(W / 2, INTERCEPT.noY, INTERCEPT.noW, INTERCEPT.noH)
            .setDepth(55).setInteractive({ useHandCursor: true })
        this.interceptHits = [onAvatar, onNo]

        onAvatar.on('pointerdown', () => this.giveToAvatar(holder))
        onNo.on('pointerdown', () => this.refuseAvatar(no))

        this.time.delayedCall(760, () => {
            if (gen !== this.roundGen) return
            this.locked = false
        })
    }

    /** A pílula do topo pergunta o que está em jogo agora. */
    private paintInterceptCue() {
        paintPill(
            this.cueBg,
            CUE.cx - CUE.w / 2, CUE.cy - CUE.h / 2, CUE.w, CUE.h,
            C.cream, C.red,
        )
        this.showIcon(this.cueIcon, dataIcon(this, this.phase.card, 46))
        this.cueText.setText('Ele pode ver?')
        FX.impact(this, this.cueBg, 0.16)
    }

    /** O botão de recusar: pílula vermelha com a mão aberta e uma palavra. */
    private buildNoButton(): Phaser.GameObjects.Container {
        const box = this.add.container(W / 2, INTERCEPT.noY)
        const bg = this.add.graphics()
        paintPill(bg, -INTERCEPT.noW / 2, -INTERCEPT.noH / 2, INTERCEPT.noW, INTERCEPT.noH, C.redSoft, C.red)
        // A mão aberta é a mesma do quadro "recusando" da criança.
        const icon = symbolIcon(this, 'no', 58).setPosition(-INTERCEPT.noW / 2 + 54, 0)
        const label = this.add.text(18, 0, 'NÃO', {
            fontFamily: FONT.black, fontSize: '30px', color: hex(C.ink),
        }).setOrigin(0.5).setResolution(2)
        box.add([bg, icon, label])
        return box
    }

    private clearIntercept() {
        this.interceptHits.forEach(z => z.destroy())
        this.interceptHits = []
        this.interceptLayer?.destroy()
        this.interceptLayer = undefined
    }

    /** Tocar no avatar é entregar o cartão. É o erro que a habilidade julga. */
    private giveToAvatar(holder: Phaser.GameObjects.Container) {
        if (this.locked || this.ended) return
        this.locked = true

        this.errors += 1
        this.missesOnPath += 1
        runtimeGameBridge.emit({
            type: 'WRONG_ANSWER', gameId: GAME_ID, pointsEarned: 0, stage: this.level.level,
        })
        this.lives.lose()
        this.livesLeft = this.lives.remaining
        this.emitCheckpoint()

        screenGlow(this, C.red, { life: 620, peak: 0.7 })
        this.playBlock()
        FX.shake(this, holder, { amount: 10, times: 3 })
        showToast(this, 'Figurinha não paga um dado seu.', C.red)
    }

    /** Recusar e seguir: o avatar se apaga e o portão abre. */
    private async refuseAvatar(no: Phaser.GameObjects.Container) {
        if (this.locked || this.ended) return
        this.locked = true
        const gen = this.roundGen

        const earned = this.missesOnPath === 0 ? 10 : 5
        this.hits += 1
        this.points += earned
        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER', gameId: GAME_ID, pointsEarned: earned, stage: this.level.level,
        })
        this.emitCheckpoint()

        this.playTap()
        FX.press(this, no, 0.94)
        this.setRunnerFrame(KID.refuse)
        screenGlow(this, C.safeGreen, { life: 900, peak: 0.7 })
        FX.ping(this, this.runner.x, this.runner.y - 40, C.safeLight, { radius: 110 })

        const layer = this.interceptLayer
        if (layer) {
            FX.to(this, layer, { alpha: 0, y: layer.y - 30 }, { duration: 420, ease: Ease.smooth })
        }

        await FX.wait(this, 560)
        if (gen !== this.roundGen) return

        this.clearIntercept()
        this.setRunnerFrame(KID.idle)
        this.openGate()
    }

    /* ───────────────────────────────────────────────────────── portão */

    private startPhase() {
        this.roundGen += 1
        this.stopIdx = 0
        this.missesOnGate = 0
        this.missesOnPath = 0
        this.safeState.open = 0

        this.clearIntercept()
        this.clearGate()
        this.hideouts.forEach(h => {
            h.state = 'idle'
            FX.kill(this, h.body)
            FX.kill(this, h.arrow)
            h.body.setScale(this.bushScale).setAlpha(1)
            if (h.body instanceof Phaser.GameObjects.Image) h.body.clearTint()
            else paintHideout(h.body, this.bush.w, this.bush.h, false)
            h.glow.setAlpha(1)
            h.arrow.setAlpha(1)
            paintHideoutGlow(h.glow, this.bush.w, false)
            paintHideoutArrow(h.arrow, false)
            h.hit.setInteractive({ useHandCursor: true })
        })
        this.coneG.setAlpha(1)
        this.entryBush?.setAlpha(1)
        this.watchers.forEach(w => w.body.setAlpha(1))
        this.paintCue()

        this.runner.setPosition(this.stops[0], RUNNER.y).setAlpha(1).setScale(1)
        this.poseRunner(KID.idle)

        this.refreshPhase()
        this.refreshHideouts()
        this.emitCheckpoint()

        const gen = this.roundGen
        void this.introCard().then(() => {
            if (gen !== this.roundGen) return
            this.startLightCycle(false)
            if (this.pendingTutorial) {
                this.pendingTutorial = false
                this.runTutorial(false)
                return
            }
            this.unlockPath()
        })
    }

    /**
     * Destrava o percurso E repinta as moitas.
     *
     * O estado da moita depende de `locked`, mas só é recalculado quando a luz
     * vira. Destravar sem repintar deixava a primeira moita escura e sem seta,
     * com a pílula dizendo "Pode ir!", até a lanterna dar uma volta inteira.
     */
    private unlockPath() {
        this.locked = this.ended
        this.refreshHideouts()
    }

    /**
     * A ABERTURA DA FASE.
     *
     * Sem ela o jogo largava a criança num parque com um "cartão" no header e
     * nenhuma explicação: o que é isso, de quem é, por que esconder, por que
     * um cofre. A cena mostra o cartão grande, diz o que ele tem — SEU nome,
     * SUA foto — e só então o guarda o bolso e libera o caminho.
     *
     * A segunda frase, a da missão, só aparece na primeira fase do nível: da
     * segunda em diante a criança já sabe para onde está indo.
     */
    private async introCard() {
        const gen = this.roundGen
        const card = CARDS[this.phase.card]

        // O véu entra JÁ ESCURO, sem tween: com `add.rectangle` o último
        // parâmetro é o alfa do PREENCHIMENTO, e animar o alfa do objeto por
        // cima disso não escurecia nada. Ele sai no fim, junto com a cena.
        const veil = this.add.rectangle(W / 2, H / 2, W, H, C.ink, 0.68).setDepth(200)
        const stage = dataCard(this, card.kind, 172, 210)
            .setPosition(W / 2, 300)
            .setDepth(202)
        stage.setScale(0.4).setAlpha(0)

        const panelBox = this.add.container(W / 2, 486).setDepth(202)
        const panelBg = this.add.graphics()
        const panelText = this.add.text(0, 0, card.intro, {
            fontFamily: FONT.black, fontSize: '30px', color: hex(C.ink),
            align: 'center', wordWrap: { width: 620 },
        }).setOrigin(0.5).setResolution(2)
        paintPanel(panelBg, 700, 92, 26, C.cream, C.safeGreen, 6)
        panelBox.add([panelBg, panelText])
        panelBox.setAlpha(0)

        this.playAppear()
        await FX.all(
            FX.to(this, stage, { scale: 1, alpha: 1 }, { duration: 400, ease: Ease.back(2) }),
            FX.to(this, panelBox, { alpha: 1 }, { duration: 320, delay: 120 }),
        )
        if (gen !== this.roundGen) { veil.destroy(); stage.destroy(); panelBox.destroy(); return }

        FX.float(this, stage, { amount: 8, duration: 1800 })
        FX.ping(this, W / 2, 300, C.gold, { radius: 150, duration: 700 })

        await FX.wait(this, this.phaseIdx === 0 ? 1500 : 1200)
        if (gen !== this.roundGen) { veil.destroy(); stage.destroy(); panelBox.destroy(); return }

        if (this.phaseIdx === 0) {
            panelText.setText(INTRO_MISSION)
            paintPanel(panelBg, 700, 92, 26, C.cream, C.safeGreen, 6)
            FX.impact(this, panelBox, 0.16)
            this.playAppear()
            await FX.wait(this, 1600)
            if (gen !== this.roundGen) { veil.destroy(); stage.destroy(); panelBox.destroy(); return }
        }

        // o cartão vai para o bolso: é assim que ele "entra" na partida
        FX.kill(this, stage)
        FX.to(this, [veil, panelBox], { alpha: 0 }, { duration: 300 })
        FX.to(this, stage, { scale: 0.18 }, { duration: 460, ease: Ease.smooth })
        await FX.arcTo(this, stage,
            { x: this.runner.x + 16, y: this.runner.y + 4 },
            { height: 90, duration: 460 })

        this.playHide()
        FX.ping(this, this.runner.x, this.runner.y, C.gold, { radius: 70 })
        veil.destroy()
        stage.destroy()
        panelBox.destroy()
    }

    private clearGate() {
        this.hintTween?.remove()
        this.hintTween = undefined
        // A zona e o balão vivem FORA do container do portão (a zona por causa
        // do clique, o balão por causa da profundidade), então morrem à mão.
        this.gatePeople.forEach(p => {
            p.hit.destroy()
            p.bubble?.destroy()
            p.talk?.destroy()
        })
        this.gatePeople = []
        this.heldCard?.destroy()
        this.heldCard = undefined
        this.gateLayer?.destroy()
        this.gateLayer = undefined
        this.safe = undefined
        this.safeBeam = undefined
        this.safeShadow = undefined
    }

    /**
     * O portão.
     *
     * A tela inteira vira a pergunta. O percurso sai de cena de vez — moita
     * meio apagada no fundo era ruído, e a criança precisava adivinhar que o
     * jogo tinha mudado de assunto. Entram, em ordem de leitura:
     *
     *   1. a PERGUNTA, no mesmo lugar onde o semáforo estava
     *   2. o CARTÃO nas mãos da criança, brilhando
     *   3. as duas pessoas, cada uma no seu tapete — o tapete é o botão
     *   4. a CONVERSA: cada uma pede o cartão do seu jeito (`talkAtGate`)
     *
     * O cofre NÃO aparece: ele é montado já escondido e só cai no chão quando
     * quem cuida vai guardar (`revealSafe`). Na hora da escolha ele era mais
     * uma coisa na tela, e atrás do menino parecia ser dele a resposta.
     */
    private openGate() {
        const gen = this.roundGen
        this.stopLightCycle()

        // A moita da entrada sai junto: ficava sozinha atrás de quem estava no
        // tapete da esquerda, e a pessoa parecia estar dentro do mato.
        const scenery = [
            this.coneG, ...this.watchers.map(w => w.body),
            ...(this.entryBush ? [this.entryBush] : []),
            ...this.hideouts.map(h => h.body),
            ...this.hideouts.map(h => h.glow),
            ...this.hideouts.map(h => h.arrow),
        ]
        FX.to(this, scenery, { alpha: 0 }, { duration: 320 })
        this.hideouts.forEach(h => h.hit.disableInteractive())

        this.askAtGate()

        this.gateLayer = this.add.container(0, 0).setDepth(30)

        // sombra do cofre no chão: sem ela ele parecia pendurado no céu
        const safeShadow = this.add.graphics().setPosition(GATE.safeX, GATE.safeShadowY)
        safeShadow.fillStyle(C.shadow, 0.2)
        safeShadow.fillEllipse(0, 0, GATE.safeW * 1.06, 34)
        this.safeShadow = safeShadow

        this.safe = this.buildSafe()
        this.safeBeam = this.add.graphics()
            .setPosition(GATE.safeX + this.safeSlot.dx, GATE.safeY + this.safeSlot.dy)
        this.gateLayer.add([safeShadow, this.safeBeam, this.safe])
        ;[safeShadow, this.safe].forEach(o => o.setAlpha(0))

        const order = Phaser.Utils.Array.Shuffle([...this.phase.gate])
        order.forEach((id, i) => this.buildGatePerson(id, GATE.xs[i]))

        // Na frente do cofre, e acima da camada do portão: no percurso ela
        // estava ATRÁS da moita, e sem trocar a profundidade aqui o cofre
        // engoliria a criança inteira.
        this.runner.setDepth(40)
        this.setRunnerFrame(KID.idle)
        void FX.to(this, this.runner, {
            x: GATE.safeX, y: GATE.runnerY,
            scale: GATE.runnerSize / RUNNER.size,
        }, { duration: 520, ease: Ease.smooth })

        this.playGate()

        this.time.delayedCall(560, () => {
            if (gen !== this.roundGen) return
            this.showHeldCard()
        })

        this.time.delayedCall(900, () => {
            if (gen !== this.roundGen) return
            void this.talkAtGate(gen)
        })
    }

    /**
     * A CONVERSA DO PORTÃO.
     *
     * As duas pessoas pedem o cartão, uma de cada vez, da esquerda para a
     * direita — os lados já foram sorteados, então a ordem não entrega
     * ninguém. Enquanto uma fala, a outra fica um pouco apagada, para o olho
     * saber de quem é o balão.
     *
     * Só depois das duas falas o toque vale: escolher antes de ouvir é chutar.
     * Os balões ficam na tela, para a criança reler na hora de decidir.
     */
    private async talkAtGate(gen: number) {
        const people = [...this.gatePeople].sort((a, b) => a.x - b.x)

        // Fecha as entradas antes de mexer: o tranco da fala guarda a escala
        // do instante, e um `popIn` ainda correndo deixaria a pessoa encolhida
        // para sempre — e brigaria com o apagar pelo `alpha`.
        people.forEach(p => {
            FX.kill(this, [p.sprite, p.mat])
            p.sprite.setScale(1).setAlpha(1)
            p.mat.setScale(1).setAlpha(1)
        })

        for (let i = 0; i < people.length; i += 1) {
            const view = people[i]
            people.forEach(p => {
                FX.to(this, [p.sprite, p.mat], { alpha: p === view ? 1 : 0.55 }, { duration: 200 })
            })
            FX.impact(this, view.sprite, 0.1)
            this.playSpeak()

            view.talk = createTalk(
                this, view.x, GATE.personY + GATE.talkDY, this.phase.talk[view.id] ?? '',
            )
            await view.talk.play(i === people.length - 1 ? 'Entendi' : 'Próximo')
            if (gen !== this.roundGen) return
        }

        FX.to(this, people.flatMap(p => [p.sprite, p.mat]), { alpha: 1 }, { duration: 200 })
        this.locked = false
        this.runGateTutorial(false)
    }

    /** Some com as falas do pedido sem destruí-las: elas voltam depois da fita. */
    private setTalksVisible(on: boolean) {
        this.gatePeople.forEach(p => {
            if (p.talk) FX.to(this, p.talk.root, { alpha: on ? 1 : 0 }, { duration: 220 })
        })
    }

    /** A pílula do topo troca de assunto: de "pode ir?" para "quem pode ver?". */
    private askAtGate() {
        paintPill(
            this.cueBg,
            CUE.cx - CUE.w / 2, CUE.cy - CUE.h / 2, CUE.w, CUE.h,
            C.cream, C.safeGreen,
        )
        this.showIcon(this.cueIcon, dataIcon(this, this.phase.card, 46))
        this.cueText.setText('Quem pode ver?')
        FX.impact(this, this.cueBg, 0.16)
        FX.impact(this, this.cueIcon, 0.22)
    }

    /** O cartão sobe para as mãos da criança e fica brilhando lá. */
    private showHeldCard() {
        this.heldCard?.destroy()

        const card = dataCard(this, this.phase.card, GATE.cardW, GATE.cardH)
            .setPosition(GATE.safeX, GATE.cardY)
            .setDepth(42)
        this.heldCard = card

        FX.popIn(this, card, { from: 0.4, duration: 380 })
        FX.float(this, card, { amount: 7, duration: 1800 })
        FX.ping(this, GATE.safeX, GATE.cardY, C.gold, { radius: 72, duration: 520 })
    }

    private buildGatePerson(id: PersonId, x: number) {
        const def = PEOPLE[id]

        // O tapete fica na LINHA DO CHÃO, sob os pés: ele é a sombra e o alvo
        // ao mesmo tempo. Antes as pessoas pairavam acima dele, como se
        // estivessem penduradas no céu.
        //
        // Os dois tapetes têm a MESMA cor: o verde no tapete de quem cuida
        // entregava a resposta, do mesmo jeito que o escudo. Só o escolhido
        // acende, e só depois do acerto.
        const mat = this.add.graphics().setPosition(x, GATE.matY)
        this.paintMat(mat, C.steel)
        this.gateLayer?.add(mat)

        const holder = this.add.container(x, GATE.personY)

        if (this.textures.exists('pessoas')) {
            const sprite = this.add.sprite(0, 0, 'pessoas', def.frame)
            this.fit(sprite, GATE.personSize, GATE.personSize)
            holder.add(sprite)
        } else {
            const g = this.add.graphics()
            paintPerson(g, GATE.personSize * 0.8, def.color)
            holder.add(g)
        }

        // Nenhum escudo sobre a cabeça: com ele a criança sabia quem era o
        // certo antes de alguém falar. Quem diz é a CONVERSA (`talkAtGate`).

        // A zona de toque fica FORA do container do portão, com profundidade
        // própria. Dentro dele o clique não chegava — as zonas do percurso, que
        // são de nível superior, sempre funcionaram.
        const hit = this.add.zone(x, GATE.personY + 40, GATE.hitW, GATE.hitH)
            .setDepth(45)
            .setInteractive({ useHandCursor: true })

        const view: GateView = { id, def, x, mat, sprite: holder, hit }
        this.gatePeople.push(view)
        hit.on('pointerdown', () => this.tapPerson(view))

        this.gateLayer?.add(holder)
        FX.popIn(this, holder, { from: 0.7, duration: 460, delay: 220 })
        FX.popIn(this, mat, { from: 0.6, duration: 420, delay: 160 })
    }

    /** O tapete sob os pés: sombra no chão e borda da cor do momento. */
    private paintMat(mat: Phaser.GameObjects.Graphics, edge: number) {
        mat.clear()
        mat.fillStyle(C.shadow, 0.16)
        mat.fillEllipse(4, 5, GATE.matW, 42)
        mat.fillStyle(C.cream, 0.9)
        mat.fillEllipse(0, 0, GATE.matW, 38)
        mat.lineStyle(6, edge, 0.9)
        mat.strokeEllipse(0, 0, GATE.matW, 38)
    }

    /** Põe (ou troca) o balão curto de reação. A fala do pedido sai de cena. */
    private say(view: GateView, text: string, icon: BubbleIcon, tone: number = C.cream) {
        view.talk?.destroy()
        view.talk = undefined
        view.bubble?.destroy()
        const bubble = speechBubble(this, view.x, GATE.personY + GATE.bubbleDY, text, icon, tone)
        view.bubble = bubble
        FX.popIn(this, bubble, { from: 0.6, duration: 300 })
        FX.float(this, bubble, { amount: 5, duration: 2200 })
        this.playSpeak()
    }

    /** Cala a pessoa: some com a fala do pedido e com o balão de reação. */
    private hush(view: GateView) {
        const talk = view.talk
        view.talk = undefined
        if (talk) {
            void FX.to(this, talk.root, { alpha: 0 }, { duration: 200 }).then(() => talk.destroy())
        }
        const bubble = view.bubble
        if (!bubble) return
        view.bubble = undefined
        FX.kill(this, bubble)
        void FX.to(this, bubble, { alpha: 0, scale: 0.8 }, { duration: 220 })
            .then(() => bubble.destroy())
    }

    private tapPerson(view: GateView) {
        if (this.locked || this.ended) return
        this.locked = true
        this.playTap()
        FX.press(this, view.sprite, 0.95)

        if (canShareWith(view.def.role)) void this.deliver(view)
        else void this.giveToStranger(view)
    }

    private async deliver(view: GateView) {
        const gen = this.roundGen
        const kind = this.phase.card

        this.hintTween?.remove()
        this.hintTween = undefined
        this.hits += 1
        this.points += this.missesOnGate === 0 ? 10 : 5
        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER',
            gameId: GAME_ID,
            pointsEarned: this.missesOnGate === 0 ? 10 : 5,
            stage: this.level.level,
        })
        this.emitCheckpoint()

        screenGlow(this, C.safeGreen, { life: 1400, peak: 0.9 })

        // ── quem NÃO foi escolhido sai de cena e cala a boca ────────────
        this.gatePeople.filter(p => p !== view).forEach(p => {
            this.hush(p)
            FX.to(this, [p.sprite, p.mat], { alpha: 0.3 }, { duration: 320 })
        })

        // ── quem cuida responde ────────────────────────────────────────
        // O tapete acende só agora: é a confirmação, não a pista.
        this.paintMat(view.mat, C.safeGreen)
        FX.impact(this, view.sprite, 0.22)
        FX.ping(this, view.x, GATE.matY, C.safeLight, { radius: 130 })
        this.say(view, 'Deixa comigo!', 'shield', C.safeLight)

        const card = this.heldCard
        if (!card) return
        this.heldCard = undefined
        FX.kill(this, card)

        await FX.wait(this, 460)
        if (gen !== this.roundGen) { card.destroy(); return }

        // O cartão vai primeiro para a mão de quem cuida, e só então ao cofre.
        // Menor e do lado do cofre: inteiro, no meio do peito, tapava o rosto.
        const towardSafe = view.x < GATE.safeX ? 1 : -1
        void FX.to(this, card, { scale: GATE.stolenScale }, { duration: 420 })
        await FX.arcTo(this, card, {
            x: view.x + towardSafe * GATE.handDX, y: GATE.personY + GATE.handDY,
        }, { height: 80, duration: 420 })
        if (gen !== this.roundGen) { card.destroy(); return }

        this.say(view, 'Vou trancar!', 'lock', C.safeLight)
        await this.revealSafe()
        if (gen !== this.roundGen) { card.destroy(); return }
        await FX.wait(this, 200)
        if (gen !== this.roundGen) { card.destroy(); return }

        await this.openSafe()
        if (gen !== this.roundGen) { card.destroy(); return }

        // Mira no VÃO, não no meio do cofre: o meio é onde a porta aberta está.
        FX.to(this, card, { scale: 0.34 }, { duration: 460, ease: Ease.smooth })
        await FX.arcTo(this, card, {
            x: GATE.safeX + this.safeSlot.dx,
            y: GATE.safeY + this.safeSlot.dy,
        }, { height: 140, duration: 460 })
        if (gen !== this.roundGen) { card.destroy(); return }

        card.destroy()

        // ── o cofre TRANCA ─────────────────────────────────────────────
        // Era aqui que a fase acabava sem nada acontecer. O cadeado é o que
        // diz "guardado": ele fecha na frente da criança, com barulho e tranco.
        await this.closeSafe()
        if (gen !== this.roundGen) return

        this.playSafeShut()
        if (this.safe) FX.shake(this, this.safe, { amount: 11, times: 3 })
        FX.flash(this, C.white, { duration: 220, peak: 0.22 })

        // No CENTRO da porta, não na borda de baixo: ali embaixo ele caía em
        // cima da cabeça do menino, que fica logo à frente do cofre.
        // O cadeado é um ícone só que troca de quadro: aberto → fechado. Os dois
        // quadros são ancorados pelo CORPO, então só a alça se mexe.
        const LOCK_BODY = 60
        const padlock = symbolIcon(this, 'lockOpen', LOCK_BODY)
        const lock = this.add.container(GATE.safeX, GATE.safeY, [padlock]).setDepth(62)
        lock.setScale(0.2)
        await FX.to(this, lock, { scale: 1 }, { duration: 240, ease: Ease.back(2.6) })
        if (gen !== this.roundGen) { lock.destroy(); return }

        setSymbol(padlock, 'lockClosed', LOCK_BODY)
        this.playLock()
        FX.impact(this, lock, 0.3)
        FX.ping(this, GATE.safeX, GATE.safeY, C.gold, { radius: 170, duration: 620 })
        FX.sparks(this, GATE.safeX, GATE.safeY, { color: C.gold, count: 24, spread: 200 })
        this.say(view, 'Guardado!', 'lock', C.safeLight)

        await FX.wait(this, 520)
        if (gen !== this.roundGen) { lock.destroy(); return }

        // ── o selo sobe para o header ──────────────────────────────────
        // Sem essa viagem, o escudo do topo enchia sozinho e a criança não
        // sabia de onde ele tinha vindo nem o que ele contava.
        await this.flyIconToShield(kind)
        if (gen !== this.roundGen) { lock.destroy(); return }

        this.saved.push(kind)
        this.fillShield(this.phaseIdx, kind)

        // ── festa ──────────────────────────────────────────────────────
        this.playFanfare()
        FX.stars(this, GATE.safeX, GATE.safeY - 30, { color: C.gold, count: 14 })
        FX.confetti(this, { colors: [C.safeLight, C.gold, C.shirt], count: 28, duration: 1600 })
        void this.cheerAtGate(view)

        await FX.wait(this, 1000)
        if (gen !== this.roundGen) { lock.destroy(); return }
        FX.to(this, lock, { alpha: 0, y: lock.y + 20 }, { duration: 280 }).then(() => lock.destroy())

        this.phaseIdx += 1
        if (this.phaseIdx >= this.level.phases.length) {
            void this.endLevel()
            return
        }
        this.startPhase()
    }

    /**
     * A PESSOA ERRADA LEVA O CARTÃO E SAI CORRENDO.
     *
     * Antes um escudo fechava por cima e nada acontecia: o erro não tinha
     * consequência que desse para ver. Agora o cartão vai para a mão de quem
     * pediu, ele agradece e FOGE com ele — é isso que "dar para qualquer um"
     * quer dizer. A cena é tensa, não assustadora: vinheta vermelha, coração
     * batendo, poeira, e ele é o mesmo boneco sorridente de antes, só que indo
     * embora. A frase do estrago diz QUAL dado foi junto.
     *
     * Depois a fita VOLTA: ele volta de costas, o cartão volta para as mãos da
     * criança e a decisão reabre com as duas falas à vista. Errar custa uma
     * vida e mostra o estrago, mas não empurra a fase nem obriga a refazer o
     * percurso.
     */
    private async giveToStranger(view: GateView) {
        const gen = this.roundGen

        this.errors += 1
        this.missesOnGate += 1
        runtimeGameBridge.emit({
            type: 'WRONG_ANSWER', gameId: GAME_ID, pointsEarned: 0, stage: this.level.level,
        })
        this.lives.lose()
        this.livesLeft = this.lives.remaining
        this.emitCheckpoint()

        const card = this.heldCard
        if (!card) { this.locked = false; return }
        FX.kill(this, card)
        this.setTalksVisible(false)

        // ── 1. o cartão vai para a mão dele ────────────────────────────
        // Menor e do lado para onde ele vai correr: no tamanho cheio, no
        // meio do peito, o cartão tapava o rosto dele a fuga inteira.
        const away = view.x < W / 2 ? -1 : 1
        void FX.to(this, card, { scale: GATE.stolenScale }, { duration: 380 })
        await FX.arcTo(this, card, {
            x: view.x + away * GATE.handDX, y: GATE.personY + GATE.handDY,
        }, { height: 70, duration: 380 })
        if (gen !== this.roundGen) return

        this.playSting()
        FX.impact(this, view.sprite, 0.16)
        void FX.popText(this, this.runner.x, this.runner.y - 118, '!', {
            color: hex(C.red), size: '64px', rise: 26, duration: 800,
        })
        // balão solto, e não `say`: a fala do pedido tem de sobreviver à fuga
        const quip = speechBubble(this, view.x, GATE.personY + GATE.bubbleDY, 'Valeu! Tchau!', 'eye', C.redSoft)
        FX.popIn(this, quip, { from: 0.6, duration: 260 })
        this.playSpeak()

        await FX.wait(this, 760)
        if (gen !== this.roundGen) { quip.destroy(); return }

        // ── 2. a fuga ──────────────────────────────────────────────────
        void FX.to(this, quip, { alpha: 0 }, { duration: 160 }).then(() => quip.destroy())
        const dropVignette = FX.vignette(this, { color: C.red, strength: 0.45, depth: 300 })
        screenGlow(this, C.red, { life: 900, peak: 0.6 })
        FX.shakeCam(this, 'leve')
        this.playHeartbeat(5)

        await this.dash(view, card, away < 0 ? -GATE.fleeX : W + GATE.fleeX, away, away * 12, 1050)
        if (gen !== this.roundGen) { dropVignette(); return }

        // ── 3. o estrago, com o nome do dado ───────────────────────────
        showToast(this, CARDS[this.phase.card].lost, C.red, 1500)
        await FX.wait(this, 1700)
        dropVignette()
        if (gen !== this.roundGen) return

        // ── 4. a fita volta ────────────────────────────────────────────
        const rewind = this.showRewind()
        this.playRewind()
        await this.dash(view, card, view.x, away < 0 ? 1 : -1, away * 10, 820)
        if (gen !== this.roundGen) { rewind.destroy(); return }
        void FX.to(this, card, { scale: 1 }, { duration: 380 })
        await FX.arcTo(this, card, { x: GATE.safeX, y: GATE.cardY }, { height: 60, duration: 380 })
        if (gen !== this.roundGen) { rewind.destroy(); return }
        await FX.to(this, rewind, { alpha: 0 }, { duration: 260 })
        rewind.destroy()
        if (gen !== this.roundGen) return

        // ── 5. a mesma decisão, com as duas falas à vista ──────────────
        FX.float(this, card, { amount: 7, duration: 1800 })
        this.setTalksVisible(true)
        if (this.missesOnGate >= 2) this.showGateHint()
        this.locked = false
    }

    /**
     * A corrida de quem pegou o cartão: inclinado, quicando, soltando poeira,
     * com o cartão na mão. A fita voltando é a mesma corrida com a inclinação
     * CONTRA o movimento — ele volta de costas, como vídeo rebobinando.
     *
     * `dir` é para onde ele anda; `lean` é o ângulo do corpo.
     */
    private dash(
        view: GateView,
        card: Phaser.GameObjects.Container,
        toX: number,
        dir: number,
        lean: number,
        duration: number,
    ) {
        const body = view.sprite
        const baseY = GATE.personY
        const cardDX = card.x - body.x
        const cardDY = card.y - body.y
        const hop = { y: 0 }

        body.setAngle(lean)
        const hopTween = this.tweens.add({
            targets: hop, y: 18, duration: 110, yoyo: true, repeat: -1, ease: 'Sine.easeOut',
        })
        const dust = this.time.addEvent({
            delay: 110, loop: true,
            callback: () => this.puff(body.x - Math.sign(lean) * 34, PARK.footY),
        })

        return new Promise<void>(resolve => {
            this.tweens.add({
                targets: body,
                x: toX,
                duration,
                ease: dir === Math.sign(lean) ? 'Quad.easeIn' : 'Quad.easeOut',
                onUpdate: () => {
                    body.y = baseY - hop.y
                    card.setPosition(body.x + cardDX, body.y + cardDY)
                },
                onComplete: () => {
                    hopTween.remove()
                    dust.remove()
                    body.setY(baseY).setAngle(0)
                    card.setPosition(body.x + cardDX, body.y + cardDY)
                    resolve()
                },
            })
        })
    }

    /** Uma nuvenzinha de poeira no chão, atrás de quem corre. */
    private puff(x: number, y: number) {
        const g = this.add.graphics().setPosition(x, y).setDepth(29)
        g.fillStyle(C.pathEdge, 0.85)
        g.fillCircle(0, 0, 14)
        g.fillStyle(C.white, 0.5)
        g.fillCircle(-4, -4, 6)
        g.setScale(0.5)
        void FX.to(this, g, { scale: 1.6, alpha: 0, y: y - 16 }, { duration: 420 }).then(() => g.destroy())
    }

    /**
     * A fita voltando: um véu azulado e o ⏪ de todo player de vídeo no meio.
     * É o jeito de dizer "vamos ver de novo" que uma criança de 6 anos já
     * conhece do tablet.
     */
    private showRewind() {
        const box = this.add.container(0, 0).setDepth(290)
        const veil = this.add.rectangle(W / 2, H / 2, W, H, C.inkSoft, 0.32)

        const icon = this.add.graphics().setPosition(W / 2, 250)
        ;[-26, 26].forEach(dx => {
            const tri = [
                new Phaser.Geom.Point(dx - 28, 0),
                new Phaser.Geom.Point(dx + 30, -34),
                new Phaser.Geom.Point(dx + 30, 34),
            ]
            icon.fillStyle(C.white, 1)
            icon.fillPoints(tri, true)
            icon.lineStyle(5, C.outline, 1)
            icon.strokePoints(tri, true, true)
        })

        const label = this.add.text(W / 2, 318, 'Vamos voltar!', {
            fontFamily: FONT.black, fontSize: '32px', color: hex(C.white),
        }).setOrigin(0.5).setResolution(2)
        label.setStroke(hex(C.ink), 6)

        box.add([veil, icon, label])
        box.setAlpha(0)
        void FX.to(this, box, { alpha: 1 }, { duration: 200 })
        FX.breathe(this, icon, { grow: 1.1, duration: 300 })
        return box
    }

    /** O pictograma do dado viaja do cofre até o selo da fase, no header. */
    private async flyIconToShield(kind: DataKind) {
        // Em container pelo mesmo motivo do escudo da trava: escala absoluta.
        const flyer = this.add.container(GATE.safeX, GATE.safeY, [dataIcon(this, kind, 74)])
            .setDepth(70)

        FX.popIn(this, flyer, { from: 0.5, duration: 200 })
        await FX.wait(this, 160)

        FX.to(this, flyer, { scale: 0.5 }, { duration: 520, ease: Ease.smooth })
        await FX.arcTo(this, flyer,
            { x: this.shieldX(this.phaseIdx), y: HUD.cy },
            { height: 150, duration: 520 })

        FX.ping(this, this.shieldX(this.phaseIdx), HUD.cy, C.safeLight, { radius: 70 })
        flyer.destroy()
    }

    /** Todo mundo comemora: a criança pula, quem cuida pula junto. */
    private async cheerAtGate(view: GateView) {
        const base = this.runner.y
        FX.kill(this, this.runner)
        await FX.to(this, this.runner, { y: base - 46 },
            { duration: 220, yoyo: true, repeat: 1, ease: Ease.back(2.4) })
        if (this.runner.active) this.runner.setY(base)

        const personBase = view.sprite.y
        void FX.to(this, view.sprite, { y: personBase - 26 },
            { duration: 200, yoyo: true, repeat: 1, delay: 90, ease: Ease.back(2) })
    }

    /**
     * Depois de dois erros, quem cuida respira e a fala dele dá um tranco:
     * "releia ESTA frase". É a trava do catálogo — a escolha segura pulsa.
     */
    private showGateHint() {
        const safe = this.gatePeople.find(p => canShareWith(p.def.role))
        if (!safe || this.hintTween) return
        this.hintTween = FX.breathe(this, safe.sprite, { grow: 1.06, duration: 900 })
        if (safe.talk) FX.impact(this, safe.talk.root, 0.14)
        FX.ping(this, safe.x, GATE.personY - 40, C.safeLight, { radius: 110 })
    }

    /**
     * O cofre.
     *
     * Com `cofre.png` ele é sprite de quatro quadros — a porta gira de verdade
     * e o vão aparece. Sem a textura, cai no desenho antigo em Graphics, que
     * abre pelo mesmo valor de 0 a 1.
     */
    private buildSafe() {
        if (!this.textures.exists('cofre')) {
            this.safeSlot = { dx: 0, dy: 0 }
            const g = this.add.graphics().setPosition(GATE.safeX, GATE.safeY)
            paintSafe(g, GATE.safeW, GATE.safeH, 0)
            return g
        }
        this.safeSlot = { dx: GATE.slotDX, dy: GATE.slotDY }
        return this.add.sprite(GATE.safeX, GATE.safeY, 'cofre', 0)
            .setScale(GATE.safeW / GATE.safeTexBody)
    }

    /**
     * O cofre chega na hora de guardar: cai do alto e assenta no chão, com
     * poeira dos dois lados. Até aqui ele estava montado, mas transparente.
     */
    private async revealSafe() {
        const safe = this.safe
        if (!safe) return
        if (this.safeShadow) {
            this.safeShadow.setScale(0.4)
            void FX.to(this, this.safeShadow, { alpha: 1, scale: 1 }, { duration: 420 })
        }
        await FX.dropIn(this, safe, { height: 150, duration: 520 })
        this.playSafeShut()
        this.puff(GATE.safeX - GATE.safeW * 0.46, GATE.safeShadowY)
        this.puff(GATE.safeX + GATE.safeW * 0.46, GATE.safeShadowY)
    }

    /** O quadro da porta e os raios de luz, a cada passo da abertura. */
    private paintSafeState() {
        const safe = this.safe
        if (safe instanceof Phaser.GameObjects.Sprite) {
            safe.setFrame(Phaser.Math.Clamp(Math.round(this.safeState.open * 3), 0, 3))
        } else if (safe) {
            paintSafe(safe, GATE.safeW, GATE.safeH, this.safeState.open)
        }
        if (this.safeBeam) drawSafeBeam(this.safeBeam, GATE.safeW, GATE.safeH, this.safeState.open)
    }

    /*
     * Abrir é mais devagar que fechar de propósito: abrir é convite, e a
     * criança precisa ver o vão; fechar é tranco, e tranco é rápido.
     */
    private openSafe() {
        this.playSafeOpen()
        if (this.safe) FX.impact(this, this.safe, 0.12)
        return new Promise<void>(resolve => {
            this.tweens.add({
                targets: this.safeState, open: 1,
                duration: 560, ease: 'Sine.easeOut',
                onUpdate: () => this.paintSafeState(),
                onComplete: () => resolve(),
            })
        })
    }

    private closeSafe() {
        return new Promise<void>(resolve => {
            this.tweens.add({
                targets: this.safeState, open: 0,
                duration: 300, ease: 'Back.easeIn',
                onUpdate: () => this.paintSafeState(),
                onComplete: () => resolve(),
            })
        })
    }

    /* ───────────────────────────────────────────────────── fim de nível */

    private async endLevel() {
        this.ended = true
        this.locked = true
        this.stopLightCycle()

        runtimeGameBridge.emit({
            type: 'GAME_COMPLETED',
            gameId: GAME_ID,
            stage: this.level.level,
            totalStages: LEVELS.length,
        })
        this.emitCheckpoint(true)

        this.playFanfare()
        FX.confetti(this, { colors: [C.safeLight, C.gold, C.shirt, C.cream] })

        await this.showAlbum()

        const next = this.level.level < LEVELS.length ? this.level.level + 1 : null
        if (next) {
            showLevelComplete(this, {
                title: `Nível ${this.level.level} completo`,
                subtitle: this.level.title,
                message: this.level.message,
                accent: C.safeGreen,
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
            title: 'Dados guardados!',
            subtitle: 'Tudo em segurança',
            message: this.level.message,
            accent: C.safeGreen,
            panelColor: C.cream,
            overlayColor: C.ink,
            progress: { total: LEVELS.length, current: this.level.level },
            buttons: [
                {
                    label: 'Jogar de novo',
                    color: C.safeGreen,
                    onClick: () => this.scene.restart({ level: 1, points: 0, lives: this.livesTotal }),
                },
                { label: 'Escolher jogo', color: C.amber, onClick: () => EventBus.emit('exit-game') },
            ],
        })
    }

    /** O álbum: os dados do dia, cada um dentro do seu escudo. */
    private async showAlbum() {
        const overlay = this.add.rectangle(W / 2, H / 2, W, H, C.ink, 0.6).setDepth(300).setInteractive()
        const panel = this.add.container(ALBUM.cx, ALBUM.cy).setDepth(301)

        const bg = this.add.graphics()
        paintPanel(bg, ALBUM.w, ALBUM.h, ALBUM.r, C.cream, C.safeGreen, 7)

        const title = this.add.text(0, -ALBUM.h / 2 + 52, this.level.message, {
            fontFamily: FONT.black, fontSize: SIZE.albumTitle, color: hex(C.ink),
            align: 'center', wordWrap: { width: ALBUM.w - 90 },
        }).setOrigin(0.5).setResolution(2)

        panel.add([bg, title])

        const total = this.saved.length * ALBUM.cardW + (this.saved.length - 1) * ALBUM.gap
        const start = -total / 2 + ALBUM.cardW / 2

        const cards = this.saved.map((kind, i) => {
            const card = this.add.container(start + i * (ALBUM.cardW + ALBUM.gap), 40)

            const shieldSize = ALBUM.cardH * 0.92
            const shield = symbolIcon(this, 'shield', shieldSize)
            const icon = dataIcon(this, kind, 86).setPosition(0, shieldSize * SHIELD_ICON_DY)

            const label = this.add.text(0, ALBUM.cardH * 0.5 + 4, CARDS[kind].label, {
                fontFamily: FONT.black, fontSize: '19px', color: hex(C.ink),
            }).setOrigin(0.5).setResolution(2)

            card.add([shield, icon, label])
            panel.add(card)
            return card
        })

        panel.setScale(0.9).setAlpha(0)
        await FX.to(this, panel, { scale: 1, alpha: 1 }, { duration: 320, ease: Ease.back(1.7) })
        await FX.stagger(this, cards, card => FX.popIn(this, card, { from: 0.7, duration: 360 }), 170)
        await FX.wait(this, 1600)
        await FX.to(this, [panel, overlay], { alpha: 0 }, { duration: 260 })

        panel.destroy()
        overlay.destroy()
    }

    /* ───────────────────────────────────────────────────────── tutorial */

    private runTutorial(force: boolean) {
        this.locked = true
        createTutorial(this, {
            key: 'esconde-percurso',
            once: !force,
            accent: C.safeGreen,
            safeTop: HUD.y + HUD.h + 12,
            // A abertura da fase já apresentou o cartão e a missão. Aqui o
            // tutorial só ensina o GESTO: quando dá para correr, e onde tocar.
            steps: [
                {
                    text: 'Verde é ir. Amarelo é esperar.',
                    shape: 'rect', x: CUE.cx, y: CUE.cy, w: CUE.w + 30, h: CUE.h + 26,
                    balloonY: 380,
                },
                {
                    text: 'Toque na moita e corra!',
                    shape: 'rect',
                    x: this.stops[1], y: 494, w: this.bush.hitW + 30, h: this.bush.hitH + 20,
                    balloonY: 240,
                    pointer: { fromX: this.stops[1], fromY: 494, toX: this.stops[1], toY: 494, tap: true },
                },
            ],
            onFinish: () => this.unlockPath(),
        })
    }

    private runGateTutorial(force: boolean) {
        createTutorial(this, {
            key: 'esconde-portao',
            once: !force,
            accent: C.safeGreen,
            safeTop: HUD.y + HUD.h + 12,
            // Vem DEPOIS das duas falas: o recorte pega as pessoas e os balões,
            // e a frase diz o que fazer com o que ela acabou de ler.
            steps: [
                {
                    text: 'Dê o cartão só para quem cuida de você.',
                    shape: 'rect', x: W / 2, y: 330, w: 1220, h: 500,
                    balloonY: 640,
                },
            ],
            onFinish: () => { this.locked = this.ended },
        })
    }

    private replayTutorial() {
        if (this.ended || this.locked || this.running) return
        if (this.gateLayer) this.runGateTutorial(true)
        else this.runTutorial(true)
    }

    /* ───────────────────────────────────────────────────────── suporte */

    private fit(image: Phaser.GameObjects.Image | Phaser.GameObjects.Sprite, maxW: number, maxH: number) {
        image.setScale(Math.min(maxW / image.width, maxH / image.height))
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

    private playSlide(from: number, to: number, dur: number, type: OscillatorType = 'sine', gain = 0.12) {
        const ctx = this.getAudioCtx()
        if (!ctx) return
        const osc = ctx.createOscillator()
        const g = ctx.createGain()
        osc.connect(g)
        g.connect(ctx.destination)
        osc.type = type
        osc.frequency.setValueAtTime(from, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(Math.max(40, to), ctx.currentTime + dur)
        g.gain.setValueAtTime(gain, ctx.currentTime)
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur)
        osc.start()
        osc.stop(ctx.currentTime + dur)
    }

    private playSequence(notes: number[], step: number, dur: number, type: OscillatorType, gain: number) {
        notes.forEach((f, i) => this.time.delayedCall(i * step, () => this.playTone(f, dur, type, gain)))
    }

    private playTap() { this.playTone(430, 0.05, 'sine', 0.08) }
    private playRun() { this.playSlide(320, 620, 0.3, 'triangle', 0.07) }
    private playHide() { this.playTone(300, 0.12, 'sine', 0.12) }
    private playBlocked() { this.playTone(180, 0.14, 'square', 0.07) }
    private playSweep() { this.playSlide(520, 300, 0.5, 'sine', 0.05) }
    private playGate() { this.playSequence([523, 784], 130, 0.2, 'sine', 0.1) }
    private playSafeOpen() { this.playSequence([392, 523, 659], 90, 0.14, 'triangle', 0.1) }
    private playSafeShut() { this.playTone(220, 0.16, 'sine', 0.12) }
    private playSpeak() { this.playTone(660, 0.05, 'sine', 0.06) }
    private playAppear() { this.playSequence([620, 880], 90, 0.12, 'sine', 0.1) }
    private playLock() {
        this.playTone(900, 0.05, 'square', 0.09)
        this.time.delayedCall(70, () => this.playTone(1400, 0.08, 'triangle', 0.1))
    }
    private playBlock() { this.playSlide(260, 120, 0.28, 'square', 0.1) }

    /** O "tan-tan" de quando o cartão cai na mão errada. */
    private playSting() {
        this.playTone(196, 0.2, 'square', 0.08)
        this.time.delayedCall(190, () => this.playTone(139, 0.36, 'square', 0.08))
    }

    /** Coração acelerado durante a fuga: tum-tum, tum-tum. */
    private playHeartbeat(beats: number) {
        for (let i = 0; i < beats; i += 1) {
            this.time.delayedCall(i * 240, () => {
                this.playTone(70, 0.09, 'sine', 0.28)
                this.time.delayedCall(90, () => this.playTone(58, 0.11, 'sine', 0.22))
            })
        }
    }

    /** A fita voltando: dois assobios subindo. */
    private playRewind() {
        this.playSlide(260, 1100, 0.32, 'sawtooth', 0.035)
        this.time.delayedCall(300, () => this.playSlide(260, 1100, 0.32, 'sawtooth', 0.035))
    }
    private playFanfare() { this.playSequence([523, 659, 784, 1047], 115, 0.22, 'sine', 0.15) }

    /** Visto pela luz: boing curto e uma risadinha boba, sem susto. */
    private playCaught() {
        this.playSlide(600, 240, 0.22, 'sine', 0.1)
        this.time.delayedCall(180, () => this.playSequence([560, 470, 560, 470], 90, 0.07, 'triangle', 0.07))
    }
}
