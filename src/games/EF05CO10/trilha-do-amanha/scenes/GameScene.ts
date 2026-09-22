import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { createTutorial } from '../../../../shared/tutorial/createTutorial'
import { FX } from '../../../../shared/effects/FX'
import { CAM, GUIDE_IDLE_MS, HERO_FRAME, HUD, PHYS, W, WORLD } from '../data/layout'
import { C } from '../data/theme'
import { LEVELS } from '../data/levels'
import { leitura } from '../data/layout'
import type { Fase, Frase, Item, LevelDef, Modo } from '../types'
import { createMundo, type Mundo } from './mundo'
import { createMensageiro, type Mensageiro } from './mensageiro'
import { createPessoa, type PessoaView } from './pessoa'
import { createControles, type Controles } from './controles'
import { createOficina, type Oficina } from './oficina'
import { createEntrega, type EntregaView } from './entrega'
import { createVisor, type Visor } from './visor'
import { createFrases, type Frases } from './frases'
import { createCartaz, type Cartaz, type CartazItem } from './cartaz'
import { createHud, type Hud } from './hud'
import { createAudio, type Audio } from './audio'

const GAME_ID = 'trilha-do-amanha'

export class GameScene extends Phaser.Scene {
    private lives!: Lives
    private livesTotal = 3
    private livesLeft = 3

    private level!: LevelDef
    private faseIndex = 0
    private modo: Modo = 'abertura'
    private gen = 0

    private carrying: Item | null = null
    private failed = 0
    private lostLife = false
    private wrongSentence = false
    private wasWet = false
    private lastInputAt = 0

    private scroll = 0
    private currentFrases: Frase[] = []
    private escolhas: CartazItem[] = []

    private score = 0
    private hits = 0
    private errors = 0
    private fasesDone = 0
    private tutorialPending = true

    private mundo!: Mundo
    private hero!: Mensageiro
    private pessoa!: PessoaView
    private controles!: Controles
    private oficina!: Oficina
    private entrega!: EntregaView
    private visor!: Visor
    private frases!: Frases
    private cartaz!: Cartaz
    private hud!: Hud
    private audio!: Audio

    private unsubPlatform?: () => void

    private get fase(): Fase {
        return this.level.fases[this.faseIndex]
    }

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this, 3)
        this.livesLeft = data?.lives ?? this.livesTotal

        const number = Phaser.Math.Clamp(data?.level ?? 1, 1, LEVELS.length)
        this.level = LEVELS[number - 1]

        this.faseIndex = 0
        this.modo = 'abertura'
        this.carrying = null
        this.failed = 0
        this.lostLife = false
        this.wrongSentence = false
        this.wasWet = false
        this.scroll = 0
        this.currentFrases = []
        this.escolhas = []
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.fasesDone = 0
        this.tutorialPending = true
    }

    create() {
        this.input.topOnly = true
        this.cameras.main.setBounds(0, 0, WORLD.width, this.scale.height)

        this.audio = createAudio(this)
        this.mundo = createMundo(this)
        this.hero = createMensageiro(this, {
            onStep: () => this.audio.step(),
            onJump: () => this.audio.jump(),
            onLand: () => this.audio.land(),
        })
        this.pessoa = createPessoa(this)
        this.entrega = createEntrega(this)
        this.visor = createVisor(this)
        this.controles = createControles(this, {
            onUse: () => void this.deliver(),
            onEnter: () => void this.openShop(),
        })
        this.oficina = createOficina(this, { onPick: id => void this.onPick(id) })
        this.frases = createFrases(this, { onPick: index => void this.onSentence(index) })
        this.cartaz = createCartaz(this)
        this.hud = createHud(this, {
            level: this.level.level,
            totalLevels: LEVELS.length,
            totalFases: this.level.fases.length,
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
            size: 30,
            tint: C.coral,
            depth: 402,
            stage: () => this.level.level,
        })
        this.events.once('shutdown', () => this.lives.destroy())

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        void this.startFase(0)
    }

    private shutdownScene() {
        this.gen++
        this.cartaz?.destroy()
        this.frases?.destroy()
        this.oficina?.destroy()
        this.controles?.destroy()
        this.visor?.destroy()
        this.entrega?.destroy()
        this.pessoa?.destroy()
        this.hero?.destroy()
        this.mundo?.destroy()
        this.hud?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.replayTutorial, this)
        this.unsubPlatform?.()
    }

    // ─────────────────────────────────────────────── a fase

    private async startFase(index: number) {
        const gen = ++this.gen
        this.faseIndex = index
        this.modo = 'abertura'
        this.carrying = null
        this.failed = 0
        this.lostLife = false
        this.wrongSentence = false
        this.wasWet = false

        const fase = this.fase
        const personX = fase.quem.x

        this.hud.setTitle(fase.titulo)
        this.hud.setProgress(this.fasesDone, index)
        this.hud.setGuide(0)

        this.mundo.build(
            fase.ceu,
            fase.destino === undefined ? undefined : { frame: fase.destino, x: personX - 20 },
            fase.semRio,
        )
        this.pessoa.show(fase.quem)
        this.hero.carry(null)
        this.hero.spawn(WORLD.startX, { min: this.limiteEsquerdo(), max: WORLD.workshopX + 130 })
        this.hero.setVisible(true)
        this.controles.setMode('off')
        this.frases.hide()
        this.oficina.hide()
        this.entrega.clear()

        this.scroll = Phaser.Math.Clamp(
            Math.min(WORLD.startX - W / 2, personX - CAM.openMargin),
            0,
            Math.max(0, WORLD.width - W),
        )
        this.resetCamera()
        this.cameras.main.setScroll(this.scroll, 0)
        this.audio.wind()

        if (index === 0) {
            await this.cenaDeAbertura(gen)
            if (gen !== this.gen) return
        } else if (fase.pergunta) {
            await this.perguntaDaPessoa(gen)
            if (gen !== this.gen) return
        } else {
            await FX.wait(this, 420)
            if (gen !== this.gen) return
        }

        this.hero.faceTo(-1)
        this.hero.setPose(fase.encomenda ? HERO_FRAME.carry : HERO_FRAME.call)
        this.audio.shout()

        if (fase.visao !== undefined) {
            const alvo = this.alvoPonto()
            this.visor.marcarAlvo(alvo.x, alvo.y, fase.visao, fase.alvoOnde ?? 'mao')
            await this.hero.worry()
            if (gen === this.gen) await this.entrega.grito(this.hero.x, fase.abertura)
            this.visor.limparAlvo()
        } else if (fase.encomenda) {
            await this.entrega.toss(
                { x: this.hero.x - 30, y: WORLD.groundY - PHYS.heroH * 0.62 },
                fase.encomenda,
                fase.abertura,
            )
        } else {
            await this.entrega.shout(
                { x: this.hero.x - 30, y: WORLD.groundY - PHYS.heroH * 0.72 },
                this.pessoa.bodyPoint(),
                fase.abertura,
            )
        }
        if (gen !== this.gen) return

        this.hero.setPose(null)
        this.audio.puzzled()
        await this.pessoa.puzzled()
        if (gen !== this.gen) return

        this.modo = 'andando'
        this.controles.setMode('walk')
        this.lastInputAt = this.time.now

        if (this.tutorialPending) {
            this.tutorialPending = false
            this.runTutorial(false)
        }
    }

    private cameraTo(worldX: number, zoom: number, duration: number, ease = 'Sine.easeInOut') {
        const cam = this.cameras.main
        const ms = Math.max(1, FX.ms(this, duration))
        return new Promise<void>(resolve => {
            let left = 2
            const done = () => {
                if (--left === 0) resolve()
            }
            // De perto a câmera mira a altura do peito; aberta, ela volta ao
            // meio do mundo, senão o chão sai da tela no fim do movimento.
            const alvoY = zoom > 1 ? CAM.lookY : this.scale.height / 2
            cam.pan(worldX, alvoY, ms, ease, true, (_c, progress) => {
                if (progress === 1) done()
            })
            cam.zoomTo(zoom, ms, ease, true, (_c, progress) => {
                if (progress === 1) done()
            })
        })
    }

    private resetCamera() {
        const cam = this.cameras.main
        cam.panEffect.reset()
        cam.zoomEffect.reset()
        cam.setZoom(1)
    }

    private releaseCamera() {
        this.resetCamera()
        const cam = this.cameras.main
        this.scroll = Phaser.Math.Clamp(cam.scrollX, 0, Math.max(0, WORLD.width - W))
        cam.setScroll(this.scroll, 0)
    }

    /**
     * A pergunta, sozinha. Da segunda fase do N3 em diante a criança já sabe o
     * tamanho do rio, mas continua precisando saber O QUE estão pedindo dela.
     */
    private async perguntaDaPessoa(gen: number) {
        this.hud.setVisible(false)
        await this.cameraTo(this.pessoa.bodyPoint().x + CAM.replyShift, CAM.nearZoom, 700)
        if (gen !== this.gen) return this.abortDelivery()

        const pergunta = this.fase.pergunta ?? ''
        this.pessoa.say(pergunta, 'dica')
        await FX.wait(this, leitura(pergunta))
        if (gen !== this.gen) return this.abortDelivery()

        this.pessoa.hush()
        await this.cameraTo(this.hero.x, 1, CAM.openBack)
        if (gen !== this.gen) return this.abortDelivery()

        this.releaseCamera()
        this.hud.setVisible(true)
    }

    /**
     * A cena que abre o nível: o menino preocupado, a travessia lenta do rio
     * inteiro e a pessoa esperando do outro lado. Só na primeira fase de cada
     * nível — da segunda em diante a criança já sabe o tamanho do rio.
     */
    private async cenaDeAbertura(gen: number) {
        const alvo = this.pessoa.bodyPoint()
        this.hud.setVisible(false)

        await this.cameraTo(this.hero.x - 40, CAM.nearZoom, 700)
        if (gen !== this.gen) return this.abortDelivery()

        // No N3 o "!" vem depois da pergunta, junto com a fala dele.
        if (!this.fase.pergunta) {
            await this.hero.worry()
            if (gen !== this.gen) return this.abortDelivery()
        }

        await this.cameraTo(alvo.x + CAM.replyShift, 1, CAM.openPan, 'Linear')
        if (gen !== this.gen) return this.abortDelivery()

        if (this.fase.pergunta) {
            this.pessoa.say(this.fase.pergunta, 'dica')
            await FX.wait(this, leitura(this.fase.pergunta))
            this.pessoa.hush()
        } else {
            await this.pessoa.puzzled()
        }
        if (gen !== this.gen) return this.abortDelivery()

        await this.cameraTo(this.hero.x, 1, CAM.openBack)
        if (gen !== this.gen) return this.abortDelivery()

        this.releaseCamera()
        this.hud.setVisible(true)
        await FX.wait(this, 240)
    }

    /**
     * Até onde ele anda para a esquerda. Com rio, é a margem; sem rio, é chegar
     * perto de quem pediu — mas chegar perto não faz ninguém enxergar melhor.
     */
    private limiteEsquerdo() {
        return this.fase.semRio ? this.fase.quem.x + 130 : WORLD.bankX
    }

    /** O ponto do mundo que o N3 pede para olhar. */
    private alvoPonto() {
        const fase = this.fase
        if (fase.alvoOnde === 'longe') {
            return { x: fase.quem.x + 96, y: WORLD.groundY - 236 }
        }
        if (fase.alvoOnde === 'chao') {
            return { x: this.hero.x - 74, y: WORLD.groundY - 6 }
        }
        return { x: this.hero.x - 38, y: WORLD.groundY - PHYS.heroH * 0.54 }
    }

    private wantedScroll(heroX: number) {
        const naMargem = heroX < this.limiteEsquerdo() + WORLD.bankZone
        const olhar = naMargem ? heroX - WORLD.bankLookAhead : heroX
        return Phaser.Math.Clamp(olhar - W / 2, 0, Math.max(0, WORLD.width - W))
    }

    update(_time: number, delta: number) {
        if (this.modo !== 'andando') return
        const dt = Math.min(delta, 50) / 1000

        const input = {
            left: this.controles.left,
            right: this.controles.right,
            jump: this.controles.jumpHeld || this.controles.consumeJump(),
        }
        if (input.left || input.right || input.jump) this.lastInputAt = this.time.now

        this.hero.update(dt, input, this.mundo.solids())

        this.scroll = Phaser.Math.Linear(this.scroll, this.wantedScroll(this.hero.x), CAM.lerp)
        this.cameras.main.setScroll(this.scroll, 0)

        const wet = this.mundo.inPuddle(this.hero.x) && this.hero.onGround
        if (wet && !this.wasWet) {
            this.mundo.splash(this.hero.x)
            this.audio.splash()
        }
        this.wasWet = wet

        const nearShop = Math.abs(this.hero.x - WORLD.workshopX) < WORLD.workshopReach
        const atBank = this.hero.x < this.limiteEsquerdo() + WORLD.bankZone

        if (nearShop) this.controles.setMode('enter')
        else if (atBank && this.carrying) this.controles.setMode(this.fase.visao === undefined ? 'use' : 'look')
        else this.controles.setMode('walk')

        this.updateGuide()
    }

    private updateGuide() {
        if (this.time.now - this.lastInputAt < GUIDE_IDLE_MS) {
            this.hud.setGuide(0)
            return
        }
        this.hud.setGuide(this.carrying ? -1 : 1)
    }

    // ─────────────────────────────────────────────── a oficina

    private async openShop() {
        if (this.modo !== 'andando') return
        const gen = this.gen
        const fase = this.fase
        this.modo = 'oficina'
        this.controles.setMode('off')
        this.hud.setGuide(0)
        this.hero.setFrozen(true)
        this.hero.setPose(null)
        this.audio.shopOpen()

        const hint = this.failed >= 2 ? this.itemQueChega() : null
        const titulo = fase.encomenda
            ? `Leve ${fase.encomenda.nome} para ${fase.quem.nome}.`
            : fase.visao !== undefined
              ? `Pegue algo para ver o que ${fase.quem.nome} pediu.`
              : `Pegue algo para avisar ${fase.quem.nome}.`
        await this.oficina.show(titulo, fase.lembrete, fase.itens, fase.encomenda, hint)
        if (gen !== this.gen) this.oficina.hide()
    }

    private itemQueChega(): string | null {
        const fase = this.fase
        const fit = fase.itens.find(item => fase.julgar(item.id).kind === 'chegou')
        return fit?.id ?? null
    }

    private async onPick(id: string) {
        const gen = this.gen
        const item = this.fase.itens.find(other => other.id === id)
        if (!item) return

        this.audio.take()
        await this.oficina.pickAnimation(id)
        if (gen !== this.gen) return

        this.carrying = item
        this.hero.carry(item)
        this.hero.setFrozen(false)
        this.hero.faceTo(-1)
        this.modo = 'andando'
        this.controles.setMode('enter')
        this.lastInputAt = this.time.now
    }

    // ─────────────────────────────────────────────── a entrega

    private async deliver() {
        if (this.modo !== 'andando' || !this.carrying) return
        const gen = this.gen
        const fase = this.fase
        const item = this.carrying
        const resultado = fase.julgar(item.id)

        this.modo = 'entregando'
        this.controles.setMode('off')
        this.hud.setGuide(0)
        this.hud.setVisible(false)
        this.hero.faceTo(-1)
        this.hero.setPose(HERO_FRAME.call)
        this.hero.useCarried(true)

        await this.cameraTo(this.hero.x - 60, CAM.nearZoom, 620)
        if (gen !== this.gen) return this.abortDelivery()

        this.audio.send()
        await FX.wait(this, 260)
        if (gen !== this.gen) return this.abortDelivery()

        if (fase.visao === undefined) {
            await this.entrega.play(
                item,
                this.hero.handPoint(),
                this.pessoa.bodyPoint(),
                resultado,
                (x, ms) => void this.cameraTo(x, CAM.travelZoom, ms, 'Linear'),
            )
        } else {
            const alvo = this.alvoPonto()
            this.visor.marcarAlvo(alvo.x, alvo.y, fase.visao, fase.alvoOnde ?? 'mao')
            await this.cameraTo(alvo.x, CAM.nearZoom, 760)
            if (gen !== this.gen) return this.abortDelivery()
            await this.visor.show(item, resultado, fase.visao, this.hero.handPoint(), alvo)
            this.visor.limparAlvo()
        }
        if (gen !== this.gen) return this.abortDelivery()

        await this.cameraTo(this.pessoa.bodyPoint().x + CAM.replyShift, CAM.nearZoom, 420)
        if (gen !== this.gen) return this.abortDelivery()

        if (resultado.kind === 'chegou') {
            this.audio.arrived()
            await this.pessoa.wave()
            if (gen !== this.gen) return this.abortDelivery()
            const boa = fase.falaChegou[resultado.quando] ?? ''
            this.pessoa.say(boa, 'boa')

            const earned = this.failed ? 5 : 10
            this.score += earned
            runtimeGameBridge.emit({
                type: 'CORRECT_ANSWER',
                gameId: GAME_ID,
                pointsEarned: earned,
                stage: this.level.level,
            })

            await FX.wait(this, leitura(boa))
            if (gen !== this.gen) return this.abortDelivery()
            this.pessoa.hush()
            this.entrega.clear()
            this.releaseCamera()
            this.hud.setVisible(true)
            await this.askSentence(item)
            return
        }

        this.audio.missed()
        const dica = fase.falaFalhou[resultado.motivo] ?? ''
        this.pessoa.say(dica, 'dica')
        this.failed++

        if (!this.lostLife) {
            this.lostLife = true
            this.errors++
            runtimeGameBridge.emit({
                type: 'WRONG_ANSWER',
                gameId: GAME_ID,
                pointsEarned: 0,
                stage: this.level.level,
            })
            this.lives.lose()
            this.livesLeft = this.lives.remaining
        }

        await FX.wait(this, leitura(dica))
        if (gen !== this.gen) return this.abortDelivery()

        this.pessoa.hush()
        this.pessoa.setEstado(0)
        this.entrega.clear()
        this.hero.useCarried(false)
        this.hero.setPose(null)
        this.hero.faceTo(1)

        await this.cameraTo(this.hero.x, 1, 620)
        if (gen !== this.gen) return this.abortDelivery()

        this.releaseCamera()
        this.hud.setVisible(true)
        this.modo = 'andando'
        this.controles.setMode('walk')
        this.lastInputAt = this.time.now
    }

    private abortDelivery() {
        this.releaseCamera()
        this.hud.setVisible(true)
    }

    // ─────────────────────────────────────────────── a frase

    private async askSentence(item: Item) {
        const gen = this.gen
        const frases = this.fase.frases[item.id]
        if (!frases) {
            await this.finishFase(item)
            return
        }

        this.modo = 'frase'
        this.controles.setMode('off')
        this.wrongSentence = false
        this.currentFrases = Phaser.Utils.Array.Shuffle([...frases])
        await this.frases.show(this.currentFrases)
        if (gen !== this.gen) this.frases.hide()
    }

    private async onSentence(index: number) {
        if (this.modo !== 'frase') return
        const gen = this.gen
        const frase = this.currentFrases[index]

        if (!frase.certa) {
            this.audio.wrong()
            this.wrongSentence = true
            await this.frases.markWrong(index, frase.porque ?? '')
            return
        }

        this.audio.right()
        this.score += this.wrongSentence ? 5 : 10
        await this.frases.markRight(index)
        if (gen !== this.gen) return
        await this.frases.hide()
        if (gen !== this.gen) return

        if (this.carrying) await this.finishFase(this.carrying)
    }

    private async finishFase(item: Item) {
        const gen = this.gen

        this.escolhas.push({
            pessoaSheet: this.fase.quem.sheet,
            pessoaLinha: this.fase.quem.linha,
            pessoaTrocado: this.fase.quem.estadoTrocado,
            itemSheet: item.sheet,
            itemCols: item.cols,
            itemRows: item.rows,
            itemColuna: item.coluna,
        })
        this.fasesDone++
        this.hits++
        this.modo = 'fim'
        this.controles.setMode('off')

        this.audio.phaseDone()
        this.hud.setProgress(this.fasesDone, this.faseIndex + 1)
        this.hud.celebrateDot(this.faseIndex)
        this.pessoa.setEstado(1)
        this.emitCheckpoint()

        await FX.wait(this, 900)
        if (gen !== this.gen) return

        if (this.faseIndex + 1 < this.level.fases.length) {
            await this.startFase(this.faseIndex + 1)
            return
        }
        await this.finishLevel()
    }

    // ─────────────────────────────────────────────── o fim do nível

    private async finishLevel() {
        const gen = this.gen
        this.modo = 'fim'
        this.controles.setMode('off')
        this.hud.setGuide(0)
        this.hud.setEnabled(false)
        this.hud.setTitle('')
        this.releaseCamera()

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
        await this.cartaz.show(
            this.escolhas,
            this.level.level === 1
                ? 'Cada pessoa precisou de um jeito diferente.'
                : this.level.level === 2
                  ? 'O caminho mandava. Agora quem manda é o que a gente inventou.'
                  : 'Inventaram um jeito para cada coisa que o corpo não dá conta.',
        )
        if (gen !== this.gen) return
        await this.cartaz.fadeOut()
        if (gen !== this.gen) return

        const done = this.level.level

        if (done < LEVELS.length) {
            showLevelComplete(this, {
                title: `${this.level.nome}: feito!`,
                subtitle: 'Todo recado chegou.',
                accent: C.warn,
                panelColor: C.card,
                overlayColor: C.ink,
                depth: 5000,
                progress: { total: LEVELS.length, current: done, size: 9 },
                autoAdvance: {
                    delay: 2600,
                    label: `${LEVELS[done].nome}...`,
                    onComplete: () =>
                        this.scene.restart({
                            lives: this.livesLeft,
                            level: done + 1,
                            points: this.score,
                        }),
                },
            })
            return
        }

        showLevelComplete(this, {
            title: 'Recado entregue!',
            subtitle: 'Você achou um jeito para cada pessoa.',
            accent: C.warn,
            panelColor: C.card,
            overlayColor: C.ink,
            depth: 5000,
            progress: { total: LEVELS.length, current: LEVELS.length, size: 9 },
            buttons: [
                {
                    label: 'Jogar de novo',
                    color: C.ok,
                    onClick: () => this.scene.restart({ lives: this.livesTotal, level: 1, points: 0 }),
                },
                {
                    label: 'Escolher jogo',
                    color: C.blue,
                    onClick: () => EventBus.emit('exit-game'),
                },
            ],
        })
    }

    // ─────────────────────────────────────────────── tutorial

    private replayTutorial() {
        if (this.modo === 'abertura' || this.modo === 'entregando' || this.modo === 'fim') return
        if (this.modo === 'pausado') return
        this.runTutorial(true)
    }

    private runTutorial(force: boolean) {
        const back = this.modo
        this.modo = 'pausado'
        this.controles.setFrozen(true)
        this.hero.setFrozen(true)
        this.hud.setGuide(0)

        createTutorial(this, {
            key: `ef05co10ta-l${this.level.level}`,
            once: !force,
            accent: C.warn,
            safeTop: HUD.h + 10,
            textSize: 32,
            steps: this.tutorialSteps(),
            onFinish: () => {
                this.hero.setFrozen(false)
                this.controles.setFrozen(false)
                this.modo = back as Modo
                if (back === 'andando') this.lastInputAt = this.time.now
            },
        })
    }

    private tutorialSteps() {
        const walk = this.controles.walkBounds()

        return [
            {
                text: `${this.fase.titulo} ${
                    this.fase.visao !== undefined
                        ? 'E os seus olhos não dão conta daqui.'
                        : this.fase.encomenda
                          ? 'Você não atravessa o rio com ela.'
                          : 'O seu grito não chegou até lá.'
                }`,
                shape: 'none' as const,
                balloonY: 240,
            },
            {
                text: 'Segure aqui para andar.',
                shape: 'circle' as const,
                x: walk.x,
                y: walk.y,
                w: walk.w,
                h: walk.h,
                balloonX: 720,
                balloonY: 250,
                pointer: { fromX: walk.x, fromY: walk.y, toX: walk.x, toY: walk.y, tap: true },
            },
            {
                text:
                    this.fase.visao !== undefined
                        ? 'No fim da trilha tem uma oficina. Traga algo de ver, e toque em OLHAR.'
                        : this.fase.encomenda
                          ? 'No fim da trilha tem uma oficina. Traga algo que carregue, e use na beira do rio.'
                          : 'No fim da trilha tem uma oficina. Traga uma invenção e use na beira do rio.',
                shape: 'none' as const,
                balloonY: 240,
            },
        ]
    }

    // ─────────────────────────────────────────────── plataforma

    private emitCheckpoint(complete = false) {
        const total = this.level.fases.length
        const done = complete ? total : this.fasesDone
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
