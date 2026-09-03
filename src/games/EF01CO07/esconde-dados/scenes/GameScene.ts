import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { FX, Ease } from '../../../../shared/effects/FX'
import { createTutorial } from '../../../../shared/tutorial/createTutorial'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { CARDS, INTRO_MISSION, LEVELS, PEOPLE, canShareWith } from '../data/levels'
import { C, FONT, SIZE, hex } from '../data/theme'
import { W, H, HUD, CUE, PARK, WATCHER, STOPS, HIDEOUT, RUNNER, GATE, ALBUM } from '../data/layout'
import {
    paintPanel, paintPill, paintShieldSlot, drawShield, drawDataIcon, paintCard,
    paintPark, paintHideout, paintHideoutGlow, paintHideoutArrow, drawPadlock, drawSafeBeam,
    paintWatcher, paintCone, paintSafe, paintPerson,
    screenGlow, showToast, speechBubble, type BubbleIcon,
} from './effects'
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
    /** O guarda: a textura quando existe, um desenho quando não. */
    private watcher!: Phaser.GameObjects.Image | Phaser.GameObjects.Graphics
    private watcherG?: Phaser.GameObjects.Graphics
    private hideouts: HideoutView[] = []
    private runner!: Phaser.GameObjects.Container
    private runnerSprite?: Phaser.GameObjects.Sprite

    private phaseText!: Phaser.GameObjects.Text
    private phasePulse?: Phaser.Tweens.Tween
    private shields: Array<{ slot: Phaser.GameObjects.Graphics; icon?: Phaser.GameObjects.Graphics }> = []
    private cardIcon!: Phaser.GameObjects.Graphics
    private cardLabel!: Phaser.GameObjects.Text
    private cueBg!: Phaser.GameObjects.Graphics
    private cueIcon!: Phaser.GameObjects.Graphics
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
    private safeState = { open: 0 }
    private hintTween?: Phaser.Tweens.Tween

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
        this.saved = []
        this.roundGen = 0
        this.pendingTutorial = true
        this.safeState.open = 0
    }

    create() {
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

    private shutdownScene() {
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
            const slot = this.add.graphics()
                .setPosition(this.shieldX(i), HUD.cy)
                .setDepth(61)
            paintShieldSlot(slot, HUD.shieldSize, 'empty')
            this.shields.push({ slot })
        }
    }

    private shieldX(index: number) {
        return HUD.shieldX + HUD.shieldSize / 2 + index * (HUD.shieldSize + HUD.shieldGap)
    }

    /** O cartão que está sendo carregado agora, sempre à vista. */
    private buildCardChip() {
        const cx = HUD.cardX + HUD.cardW / 2
        const bg = this.add.graphics().setPosition(cx, HUD.cy).setDepth(60)
        paintCard(bg, HUD.cardW, HUD.cardH)

        this.cardIcon = this.add.graphics()
            .setPosition(HUD.cardX + 40, HUD.cy)
            .setDepth(61)

        this.cardLabel = this.add.text(HUD.cardX + 74, HUD.cy, '', {
            fontFamily: FONT.black, fontSize: SIZE.cardLabel, color: hex(C.ink),
        }).setOrigin(0, 0.5).setDepth(61).setResolution(2)
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
            paintShieldSlot(slot.slot, HUD.shieldSize, current ? 'current' : 'empty')
            if (current) {
                this.phasePulse = FX.breathe(this, slot.slot, { grow: 1.1, duration: 1100 })
            }
        })

        const card = CARDS[this.phase.card]
        this.cardIcon.clear()
        drawDataIcon(this.cardIcon, card.kind, 44)
        this.cardLabel.setText(card.label)
    }

    private fillShield(index: number, kind: DataKind) {
        const slot = this.shields[index]
        if (!slot || slot.icon) return

        this.phasePulse?.remove()
        this.phasePulse = undefined
        FX.kill(this, slot.slot)
        slot.slot.setScale(1)
        paintShieldSlot(slot.slot, HUD.shieldSize, 'done')

        const icon = this.add.graphics()
            .setPosition(this.shieldX(index), HUD.cy + 2)
            .setDepth(62)
        drawDataIcon(icon, kind, HUD.shieldSize * 0.56)
        slot.icon = icon

        FX.popIn(this, icon, { from: 0.4, duration: 420 })
        FX.impact(this, slot.slot, 0.2)
    }

    /* ────────────────────────────────────────────────────── semáforo */

    private buildCue() {
        this.cueBg = this.add.graphics().setDepth(50)
        this.cueIcon = this.add.graphics()
            .setPosition(CUE.cx + CUE.iconX, CUE.cy)
            .setDepth(51)
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

        const g = this.cueIcon
        g.clear()
        g.fillStyle(C.white, 1)
        g.fillCircle(0, 0, 21)
        if (this.lit) {
            g.fillStyle(C.amberDark, 1)
            g.fillEllipse(0, 0, 30, 18)
            g.fillStyle(C.white, 1)
            g.fillCircle(0, 0, 7)
        } else {
            g.fillStyle(C.safeGreen, 1)
            g.fillTriangle(-7, -11, -7, 11, 12, 0)
        }

        this.cueText.setText(this.lit ? 'Espere' : 'Pode ir!')
    }

    /* ─────────────────────────────────────────────────────── percurso */

    private buildPath() {
        this.buildTrees()

        this.coneG = this.add.graphics().setDepth(8)
        this.buildWatcher()

        for (let i = 1; i <= this.level.hideouts; i += 1) {
            const x = STOPS[i]

            const glow = this.add.graphics().setPosition(x, HIDEOUT.y + 60).setDepth(11)
            paintHideoutGlow(glow, HIDEOUT.w, false)

            const body = this.makeBush(x, HIDEOUT.y)

            const arrow = this.add.graphics().setPosition(x, HIDEOUT.y - 118).setDepth(13)
            paintHideoutArrow(arrow, false)

            const hit = this.add.zone(x, HIDEOUT.y - 6, HIDEOUT.hitW, HIDEOUT.hitH)
                .setDepth(14).setInteractive({ useHandCursor: true })

            const view: HideoutView = { index: i, x, glow, body, arrow, hit, state: 'idle' }
            hit.on('pointerdown', () => this.tryRun(view))
            this.hideouts.push(view)
        }

        // a entrada também é uma moita, para a primeira parada não parecer solta
        this.makeBush(STOPS[0], HIDEOUT.y)
    }

    /** A escala natural da moita, para o breathe voltar ao lugar certo. */
    private bushScale = 1

    /**
     * O guarda da pracinha.
     *
     * Com `seguranca.png` ele é uma pessoa de verdade, simpática, fazendo a
     * ronda — e não um vulto. Continua sendo a LANTERNA o obstáculo: ele nunca
     * persegue ninguém.
     */
    private buildWatcher() {
        if (this.textures.exists('seguranca')) {
            this.watcher = this.add.image(WATCHER.x, WATCHER.y, 'seguranca').setDepth(6)
            this.fit(this.watcher, WATCHER.size, WATCHER.size)
            FX.float(this, this.watcher, { amount: 5, duration: 2600 })
            return
        }
        const g = this.add.graphics().setPosition(WATCHER.x, WATCHER.y).setDepth(6)
        paintWatcher(g, WATCHER.size * 0.72, false)
        this.watcherG = g
        this.watcher = g
    }

    /** A moita: `moita.png` quando existe, desenho quando não. */
    private makeBush(x: number, y: number) {
        if (this.textures.exists('moita')) {
            const img = this.add.image(x, y, 'moita').setDepth(12)
            this.fit(img, HIDEOUT.w, HIDEOUT.h)
            this.bushScale = img.scale
            return img
        }
        const g = this.add.graphics().setPosition(x, y).setDepth(12)
        paintHideout(g, HIDEOUT.w, HIDEOUT.h, false)
        return g
    }

    private buildTrees() {
        if (!this.textures.exists('arvore')) return
        const spots: Array<[number, number, number]> = [
            [92, 322, 268],
            [1192, 312, 292],
            [372, 296, 168],
        ]
        spots.forEach(([x, y, size]) => {
            const tree = this.add.image(x, y, 'arvore').setDepth(4)
            this.fit(tree, size, size)
        })
    }

    private buildRunner() {
        this.runner = this.add.container(STOPS[0], RUNNER.y).setDepth(20)

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

    private startLightCycle(lit = false) {
        this.cycleEvent?.remove()
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
        if (this.watcherG) paintWatcher(this.watcherG, WATCHER.size * 0.72, lit)

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
        const aim = Phaser.Math.Linear(140, 1140, this.sweep.t)
        paintCone(
            this.coneG,
            { x: WATCHER.x + WATCHER.handDX, y: WATCHER.y + WATCHER.handDY },
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

            paintHideoutGlow(h.glow, HIDEOUT.w, target)
            paintHideoutArrow(h.arrow, target)

            FX.kill(this, h.body)
            h.body.setScale(this.bushScale)
            if (h.body instanceof Phaser.GameObjects.Image) {
                if (blocked) h.body.setTint(0x86a58a)
                else h.body.clearTint()
            } else {
                paintHideout(h.body, HIDEOUT.w, HIDEOUT.h, blocked)
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
            x: STOPS[index],
            duration: RUN_MS,
            ease: 'Sine.easeInOut',
            onComplete: () => this.arrive(index),
        })
    }

    /**
     * Ser pega pela luz não é erro de segurança: não emite `WRONG_ANSWER` nem
     * custa vida. Custa a volta ao esconderijo anterior, que é o preço justo
     * de ter saído com a lanterna quase virando.
     */
    private caught() {
        this.runTween?.remove()
        this.runTween = undefined
        this.running = false
        this.playCaught()

        FX.impact(this, this.watcher, 0.22)
        FX.shakeCam(this, 'leve')
        FX.ping(this, this.runner.x, PARK.footY - 40, C.light, { radius: 90 })

        this.tweens.add({
            targets: this.runner,
            x: STOPS[this.stopIdx],
            duration: 420,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.poseRunner(this.stopIdx === 0 ? KID.idle : KID.hidden)
                this.refreshHideouts()
            },
        })

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
            this.time.delayedCall(620, () => this.openGate())
        }
    }

    /* ───────────────────────────────────────────────────────── portão */

    private startPhase() {
        this.roundGen += 1
        this.stopIdx = 0
        this.missesOnGate = 0
        this.safeState.open = 0

        this.clearGate()
        this.hideouts.forEach(h => {
            h.state = 'idle'
            FX.kill(this, h.body)
            FX.kill(this, h.arrow)
            h.body.setScale(this.bushScale).setAlpha(1)
            if (h.body instanceof Phaser.GameObjects.Image) h.body.clearTint()
            else paintHideout(h.body, HIDEOUT.w, HIDEOUT.h, false)
            h.glow.setAlpha(1)
            h.arrow.setAlpha(1)
            paintHideoutGlow(h.glow, HIDEOUT.w, false)
            paintHideoutArrow(h.arrow, false)
            h.hit.setInteractive({ useHandCursor: true })
        })
        this.coneG.setAlpha(1)
        this.watcher.setAlpha(1)
        this.paintCue()

        this.runner.setPosition(STOPS[0], RUNNER.y).setAlpha(1).setScale(1)
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
            this.locked = false
        })
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
        const stage = this.add.container(W / 2, 300).setDepth(202)

        const bg = this.add.graphics()
        paintCard(bg, 172, 210)
        const icon = this.add.graphics()
        drawDataIcon(icon, card.kind, 124)
        stage.add([bg, icon])
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
        })
        this.gatePeople = []
        this.heldCard?.destroy()
        this.heldCard = undefined
        this.gateLayer?.destroy()
        this.gateLayer = undefined
        this.safe = undefined
        this.safeBeam = undefined
    }

    /**
     * O portão substitui o percurso: a lanterna sai de cena e ficam só o
     * cofre e as pessoas. A decisão de segurança merece a tela inteira.
     */
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
     *   4. o escudo verde ACIMA da cabeça de quem cuida
     *
     * O cofre fica atrás, pequeno e fechado: ele é o destino, não a pergunta.
     */
    private openGate() {
        const gen = this.roundGen
        this.stopLightCycle()

        const scenery = [
            this.coneG, this.watcher,
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

        this.safe = this.buildSafe()
        this.safeBeam = this.add.graphics()
            .setPosition(GATE.safeX + this.safeSlot.dx, GATE.safeY + this.safeSlot.dy)
        this.gateLayer.add([safeShadow, this.safeBeam, this.safe])

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
        FX.popIn(this, this.safe, { from: 0.7, duration: 420, delay: 160 })

        this.time.delayedCall(560, () => {
            if (gen !== this.roundGen) return
            this.showHeldCard()
        })

        this.time.delayedCall(900, () => {
            if (gen !== this.roundGen) return
            this.locked = false
            this.runGateTutorial(false)
        })
    }

    /** A pílula do topo troca de assunto: de "pode ir?" para "quem pode ver?". */
    private askAtGate() {
        paintPill(
            this.cueBg,
            CUE.cx - CUE.w / 2, CUE.cy - CUE.h / 2, CUE.w, CUE.h,
            C.cream, C.safeGreen,
        )
        this.cueIcon.clear()
        drawDataIcon(this.cueIcon, this.phase.card, 42)
        this.cueText.setText('Quem pode ver?')
        FX.impact(this, this.cueBg, 0.16)
        FX.impact(this, this.cueIcon, 0.22)
    }

    /** O cartão sobe para as mãos da criança e fica brilhando lá. */
    private showHeldCard() {
        this.heldCard?.destroy()

        const card = this.add.container(GATE.safeX, GATE.cardY).setDepth(42)
        const bg = this.add.graphics()
        paintCard(bg, GATE.cardW, GATE.cardH)
        const icon = this.add.graphics()
        drawDataIcon(icon, this.phase.card, GATE.cardW * 0.62)
        card.add([bg, icon])
        this.heldCard = card

        FX.popIn(this, card, { from: 0.4, duration: 380 })
        FX.float(this, card, { amount: 7, duration: 1800 })
        FX.ping(this, GATE.safeX, GATE.cardY, C.gold, { radius: 72, duration: 520 })
    }

    private buildGatePerson(id: PersonId, x: number) {
        const def = PEOPLE[id]
        const trusted = canShareWith(def.role)

        // O tapete fica na LINHA DO CHÃO, sob os pés: ele é a sombra e o alvo
        // ao mesmo tempo. Antes as pessoas pairavam acima dele, como se
        // estivessem penduradas no céu.
        const mat = this.add.graphics().setPosition(x, GATE.matY)
        mat.fillStyle(C.shadow, 0.16)
        mat.fillEllipse(4, 5, GATE.matW, 42)
        mat.fillStyle(C.cream, 0.9)
        mat.fillEllipse(0, 0, GATE.matW, 38)
        mat.lineStyle(6, trusted ? C.safeGreen : C.steel, 0.9)
        mat.strokeEllipse(0, 0, GATE.matW, 38)
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

        // O escudo verde é o crachá de confiança, e vai ACIMA da cabeça: ao
        // lado do corpo ele parecia enfeite de cenário.
        let badge: Phaser.GameObjects.Graphics | undefined
        if (trusted) {
            badge = this.add.graphics().setPosition(x, GATE.personY + GATE.badgeDY)
            drawShield(badge, GATE.badgeSize, C.safeLight, C.safeGreen, 6)
            this.gateLayer?.add(badge)
            FX.popIn(this, badge, { from: 0.4, duration: 460, delay: 460 })
            FX.float(this, badge, { amount: 8, duration: 1900 })
        }

        // A zona de toque fica FORA do container do portão, com profundidade
        // própria. Dentro dele o clique não chegava — as zonas do percurso, que
        // são de nível superior, sempre funcionaram.
        const hit = this.add.zone(x, GATE.personY + 40, GATE.hitW, GATE.hitH)
            .setDepth(45)
            .setInteractive({ useHandCursor: true })

        const view: GateView = { id, def, x, mat, sprite: holder, badge, hit }
        this.gatePeople.push(view)
        hit.on('pointerdown', () => this.tapPerson(view))

        this.gateLayer?.add(holder)
        FX.popIn(this, holder, { from: 0.7, duration: 460, delay: 220 })
        FX.popIn(this, mat, { from: 0.6, duration: 420, delay: 160 })

        // a fala entra por último: primeiro a criança vê quem está ali
        this.time.delayedCall(720, () => {
            if (!holder.active) return
            this.say(view, def.ask, def.askIcon)
        })
    }

    /** Põe (ou troca) o balão de fala de uma pessoa do portão. */
    private say(view: GateView, text: string, icon: BubbleIcon, tone: number = C.cream) {
        view.bubble?.destroy()
        const bubble = speechBubble(this, view.x, GATE.personY + GATE.bubbleDY, text, icon, tone)
        view.bubble = bubble
        FX.popIn(this, bubble, { from: 0.6, duration: 300 })
        FX.float(this, bubble, { amount: 5, duration: 2200 })
        this.playSpeak()
    }

    private hush(view: GateView) {
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
        else void this.refuse(view)
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
        FX.impact(this, view.sprite, 0.22)
        FX.ping(this, view.x, GATE.matY, C.safeLight, { radius: 130 })
        this.say(view, 'Deixa comigo!', 'shield', C.safeLight)

        const card = this.heldCard
        if (!card) return
        this.heldCard = undefined
        FX.kill(this, card)

        await FX.wait(this, 460)
        if (gen !== this.roundGen) { card.destroy(); return }

        // o cartão vai primeiro para a mão de quem cuida, e só então ao cofre
        await FX.arcTo(this, card, { x: view.x, y: GATE.personY - 20 }, { height: 80, duration: 420 })
        if (gen !== this.roundGen) { card.destroy(); return }

        this.say(view, 'Vou trancar!', 'lock', C.safeLight)
        await FX.wait(this, 380)
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
        const lock = this.add.graphics()
            .setPosition(GATE.safeX, GATE.safeY)
            .setDepth(62)
        drawPadlock(lock, 62, false)
        lock.setScale(0.2)
        await FX.to(this, lock, { scale: 1 }, { duration: 240, ease: Ease.back(2.6) })
        if (gen !== this.roundGen) { lock.destroy(); return }

        drawPadlock(lock, 62, true)
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
     * A TRAVA: o cartão quase sai, e um escudo fecha por cima.
     *
     * Nada de susto nem de perseguição — a pessoa só fica cinza e faz um
     * gesto de curiosidade. O que a criança precisa entender é que o dado
     * não sai, não que alguém é um monstro.
     */
    private async refuse(view: GateView) {
        const gen = this.roundGen

        this.errors += 1
        this.missesOnGate += 1
        runtimeGameBridge.emit({
            type: 'WRONG_ANSWER', gameId: GAME_ID, pointsEarned: 0, stage: this.level.level,
        })
        this.lives.lose()
        this.livesLeft = this.lives.remaining
        this.emitCheckpoint()

        screenGlow(this, C.red, { life: 620, peak: 0.7 })
        this.playBlock()
        this.tintPerson(view, 0x9aa3ad)
        this.hush(view)

        // Quem recusa é a CRIANÇA, e ela diz isso: mão aberta e um "Não!".
        // É a fala mais importante do jogo.
        this.setRunnerFrame(KID.refuse)
        const no = speechBubble(this, this.runner.x + 120, GATE.cardY - 60, 'Não!', 'no', C.redSoft)
        FX.popIn(this, no, { from: 0.5, duration: 240 })

        const card = this.heldCard
        if (!card) { this.locked = false; return }
        FX.kill(this, card)

        // o cartão dá um passo na direção de quem pediu, e para no meio
        const towards = card.x + (view.x - card.x) * 0.28
        await FX.to(this, card, { x: towards, y: card.y - 34 },
            { duration: 240, ease: Ease.back(1.6) })
        if (gen !== this.roundGen) return

        const shield = this.add.graphics().setPosition(card.x, card.y).setDepth(61)
        drawShield(shield, 116, C.safeLight, C.safeGreen, 6)
        shield.setScale(0.3)
        FX.to(this, shield, { scale: 1 }, { duration: 220, ease: Ease.back(2.4) })
        FX.shake(this, view.sprite, { amount: 10, times: 3 })
        showToast(this, 'Dados só com quem cuida.', C.red)

        await FX.wait(this, 900)
        if (gen !== this.roundGen) { shield.destroy(); no.destroy(); return }

        await FX.all(
            FX.to(this, card, { x: GATE.safeX, y: GATE.cardY }, { duration: 300, ease: Ease.settle }),
            FX.to(this, shield, { alpha: 0, scale: 0.6 }, { duration: 280 }),
            FX.to(this, no, { alpha: 0, scale: 0.7 }, { duration: 280 }),
        )
        shield.destroy()
        no.destroy()
        if (gen !== this.roundGen) return

        FX.float(this, card, { amount: 7, duration: 1800 })
        this.setRunnerFrame(KID.idle)
        this.tintPerson(view, null)
        // ela volta a pedir: a decisão continua aberta
        this.say(view, view.def.ask, view.def.askIcon)

        if (this.missesOnGate >= 2) this.showGateHint()
        this.locked = false
    }

    /** O pictograma do dado viaja do cofre até o selo da fase, no header. */
    private async flyIconToShield(kind: DataKind) {
        const flyer = this.add.graphics()
            .setPosition(GATE.safeX, GATE.safeY)
            .setDepth(70)
        drawDataIcon(flyer, kind, 74)

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

    private tintPerson(view: GateView, tint: number | null) {
        view.sprite.list.forEach(child => {
            const target = child as Phaser.GameObjects.Sprite
            if (typeof target.setTint !== 'function') return
            if (tint === null) target.clearTint()
            else target.setTint(tint)
        })
    }

    /** Depois de dois erros, quem cuida ganha contorno verde pulsante. */
    private showGateHint() {
        const safe = this.gatePeople.find(p => canShareWith(p.def.role))
        if (!safe || this.hintTween) return
        this.hintTween = FX.breathe(this, safe.sprite, { grow: 1.06, duration: 900 })
        if (safe.badge) FX.ping(this, safe.badge.x, safe.badge.y, C.safeLight, { radius: 90 })
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

            const shield = this.add.graphics()
            drawShield(shield, ALBUM.cardH * 0.92, C.safeLight, C.safeGreen, 6)

            const icon = this.add.graphics().setPosition(0, -6)
            drawDataIcon(icon, kind, 82)

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
                    x: STOPS[1], y: 494, w: HIDEOUT.hitW + 30, h: HIDEOUT.hitH + 20,
                    balloonY: 240,
                    pointer: { fromX: STOPS[1], fromY: 494, toX: STOPS[1], toY: 494, tap: true },
                },
            ],
            onFinish: () => { this.locked = this.ended },
        })
    }

    private runGateTutorial(force: boolean) {
        createTutorial(this, {
            key: 'esconde-portao',
            once: !force,
            accent: C.safeGreen,
            safeTop: HUD.y + HUD.h + 12,
            steps: [
                {
                    text: 'Mostre só para quem tem o escudo.',
                    shape: 'rect', x: GATE.safeX, y: GATE.personY + 20, w: 900, h: 330,
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
    private playFanfare() { this.playSequence([523, 659, 784, 1047], 115, 0.22, 'sine', 0.15) }

    /** Visto pela luz: boing curto e uma risadinha boba, sem susto. */
    private playCaught() {
        this.playSlide(600, 240, 0.22, 'sine', 0.1)
        this.time.delayedCall(180, () => this.playSequence([560, 470, 560, 470], 90, 0.07, 'triangle', 0.07))
    }
}
