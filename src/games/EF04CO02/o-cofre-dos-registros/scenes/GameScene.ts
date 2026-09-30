import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { createTutorial } from '../../../../shared/tutorial/createTutorial'
import { FX } from '../../../../shared/effects/FX'
import {
    CLOSING,
    FIELD_LABEL,
    LEVELS,
    POINTS_AFTER_STALL,
    POINTS_CLEAN,
    SHEET_NAME,
} from '../data/levels'
import {
    applyValue,
    canPlace,
    changedField,
    creatureOf,
    fieldOf,
    mismatchedFields,
    missText,
    openingOf,
    shuffled,
    trayFor,
    validateLevels,
} from '../data/rules'
import { DEPTH, HUD } from '../data/layout'
import { C } from '../data/theme'
import type {
    Change,
    FieldId,
    LevelDef,
    LevelNumber,
    Mode,
    PartialSighting,
    Phase,
    SightingRecord,
} from '../types'
import { createRoom, type Room } from './drawRoom'
import { createSighting, type Sighting } from './drawSighting'
import { createRecord, type RecordSheet } from './drawRecord'
import { createTray, type Tray } from './drawValueTray'
import { createVault, type ArchiveCard, type Vault } from './drawVault'
import { createHint, type Hint } from './drawHint'
import { createHud, type Hud } from './hud'
import { createAudio, type Audio } from './audio'

const GAME_ID = 'o-cofre-dos-registros'

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  OS DOIS GESTOS, E POR QUE SÃO DOIS
 * ══════════════════════════════════════════════════════════════════════════
 *
 * O gesto é sempre o mesmo — dois toques —, mas a ORDEM se inverte com o
 * verbo, e isso não é detalhe de interface: é o raciocínio mudando.
 *
 *   montar    (N1)  valor → campo    "onde é que isto mora?"
 *   corrigir  (N2)  campo → valor    "qual destes não bate?"
 *   atualizar (N3)  campo → valor    "qual destes a nota mudou?"
 *
 * No nível 1 a criança tem um valor na mão e procura a casa dele. Nos níveis
 * 2 e 3 ela tem uma ficha inteira na frente e precisa ACHAR o campo em
 * questão antes de pensar em valor nenhum — por isso a bandeja nem existe até
 * o campo estar escolhido. Mostrar as opções antes transformaria "qual campo
 * está errado?" em "qual destas três palavras parece certa?".
 */
type Flow = 'tag-first' | 'field-first'

export class GameScene extends Phaser.Scene {
    private lives!: Lives
    private livesTotal = 3
    private livesLeft = 3

    private level!: LevelDef
    private phaseIndex = 0
    private changeIndex = 0
    private shown: PartialSighting = {}
    private mode: Mode = 'intro'
    private gen = 0

    private tries = 0
    private stalled = false
    /**
     * A TRAVA do §10.
     *
     * Depois de uma escolha recusada, o jogo não anda: no nível 1 a etiqueta
     * continua na mão e só o campo certo libera; nos níveis 2 e 3 a ficha
     * espera pelo campo certo. Trocar de peça no meio faria a criança
     * recomeçar a decisão em vez de terminar a que ela começou — que é
     * justamente a decisão que o jogo mede.
     */
    private trava = false

    private score = 0
    private hits = 0
    private errors = 0
    private done = 0
    private archive: ArchiveCard[] = []

    private tutorialOpen = false
    private pendingTutorial = true

    private room!: Room
    private sighting!: Sighting
    private record!: RecordSheet
    private tray!: Tray
    private vault!: Vault
    private hint!: Hint
    private hud!: Hud
    private audio!: Audio

    private unsubPlatform?: () => void

    private get phase(): Phase {
        return this.level.phases[this.phaseIndex]
    }

    private get fieldIds(): FieldId[] {
        return this.phase.task.fieldIds
    }

    private get flow(): Flow {
        return this.phase.task.kind === 'fill' ? 'tag-first' : 'field-first'
    }

    /** A novidade que está na placa agora. Só existe no nível 3. */
    private get change(): Change | undefined {
        const task = this.phase.task
        return task.kind === 'update' ? task.changes[this.changeIndex] : undefined
    }

    /**
     * O registro ANTES da novidade atual.
     *
     * Derivado da cadeia de notas, e não guardado num campo: com estado
     * próprio, um `scene.restart` no meio da segunda nota deixaria o jogo
     * comparando a ficha nova com um "anterior" de outra partida.
     */
    private get before(): SightingRecord {
        const task = this.phase.task
        if (task.kind !== 'update') return task.clue.truth
        return this.changeIndex === 0 ? task.initial : task.changes[this.changeIndex - 1].next
    }

    /** Qual campo a criança precisa tocar agora. Sempre derivado, nunca lido. */
    private get targetField(): FieldId | undefined {
        const task = this.phase.task
        if (task.kind === 'correct') return mismatchedFields(this.shown, task.clue.truth)[0]
        if (task.kind === 'update') return changedField(this.before, this.change!.next)
        return undefined
    }

    /** Qual valor aquele campo precisa receber. */
    private targetValue(field: FieldId): string {
        const task = this.phase.task
        if (task.kind === 'update') return this.change!.next[field]
        if (task.kind === 'correct') return task.clue.truth[field]
        return ''
    }

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this, 3)
        this.livesLeft = data?.lives ?? this.livesTotal

        const number = Phaser.Math.Clamp(data?.level ?? 1, 1, LEVELS.length) as LevelNumber
        this.level = LEVELS[number - 1]

        this.phaseIndex = 0
        this.changeIndex = 0
        this.shown = {}
        this.mode = 'intro'
        this.tries = 0
        this.stalled = false
        this.trava = false
        this.tutorialOpen = false
        this.pendingTutorial = true
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.done = 0
        this.archive = []
    }

    create() {
        this.input.topOnly = true

        const problems = validateLevels([this.level])
        if (problems.length) console.error(`[${GAME_ID}]`, problems)

        this.room = createRoom(this)
        this.audio = createAudio(this)
        this.vault = createVault(this)
        this.sighting = createSighting(this)
        this.record = createRecord(this, { onPick: field => void this.pickField(field) })
        this.tray = createTray(this, { onPick: index => void this.pickTag(index) })
        this.hint = createHint(this)
        this.hud = createHud(this, {
            level: this.level.level,
            phases: this.level.phases.length,
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
            tint: C.amber,
            depth: DEPTH.hud + 1,
            stage: () => this.level.level,
        })
        this.events.once('shutdown', () => this.lives.destroy())

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        void this.playPhase(0)
    }

    private shutdownScene() {
        this.gen++
        this.hud?.destroy()
        this.hint?.destroy()
        this.tray?.destroy()
        this.record?.destroy()
        this.sighting?.destroy()
        this.vault?.destroy()
        this.room?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.replayTutorial, this)
        this.unsubPlatform?.()
    }

    /* ──────────────────────────── ciclo da fase ───────────────────────── */

    private async playPhase(index: number) {
        const gen = ++this.gen
        this.phaseIndex = index
        this.changeIndex = 0
        this.mode = 'intro'
        this.tries = 0
        this.stalled = false
        this.trava = false
        this.applyInput()

        const task = this.phase.task
        this.shown = { ...task.initial }
        this.hint.hush()
        this.hud.setTitle(this.phase.title)
        this.hud.setDone(this.done)

        this.audio.arrive()
        await this.sighting.show(
            creatureOf(task),
            openingOf(task),
            task.kind === 'update' ? 'note' : 'clue',
        )
        if (gen !== this.gen) return

        await this.record.show(this.fieldIds, task.initial)
        if (gen !== this.gen) return

        if (this.flow === 'tag-first') {
            // a ordem da bandeja é sorteada: o valor do primeiro campo não
            // pode morar sempre na primeira etiqueta
            await this.tray.show(shuffled(trayFor(task)))
            if (gen !== this.gen) return
        }

        this.mode = 'asking'
        this.applyInput()

        if (this.pendingTutorial && index === 0) {
            this.pendingTutorial = false
            this.runTutorial(true)
        }
    }

    /* ────────────────────────── toque na etiqueta ─────────────────────── */

    private async pickTag(index: number) {
        if (this.mode !== 'asking' || this.tutorialOpen) return
        if (this.flow === 'field-first') {
            await this.useValue(index)
            return
        }

        const picked = this.tray.picked()

        if (this.trava && index !== picked) {
            // a TRAVA não deixa trocar de etiqueta no meio da decisão
            this.audio.refuse()
            this.tray.pulse(picked)
            void this.hint.say(
                `Primeiro coloque ${this.tray.valueAt(picked)} no campo certo.`,
                'warn',
            )
            return
        }

        if (index === picked) {
            if (this.trava) return
            this.audio.drop()
            await this.tray.deselect()
            return
        }

        this.audio.pick()
        if (!this.trava) this.hint.hush()
        await this.tray.select(index)
    }

    /* ─────────────────────────── toque no campo ───────────────────────── */

    private async pickField(field: FieldId) {
        if (this.mode !== 'asking' || this.tutorialOpen) return
        if (this.flow === 'field-first') {
            await this.chooseField(field)
            return
        }

        const index = this.tray.picked()

        /*
         * TOCAR NO CAMPO SEM ETIQUETA NÃO É ERRO.
         *
         * O §6 é explícito: a bandeja pulsa e o jogo pede a etiqueta. Cobrar
         * vida aqui puniria quem entendeu o registro e ainda não entendeu a
         * ordem dos dois toques — que são coisas diferentes.
         */
        if (index < 0) {
            this.mode = 'placing'
            this.applyInput()
            this.audio.nudge()
            void this.hint.say('Escolha uma etiqueta primeiro.', 'calm')
            await this.tray.askFirst()
            this.mode = 'asking'
            this.applyInput()
            return
        }

        const gen = this.gen
        const value = this.tray.valueAt(index)
        const truth = this.phase.task.kind === 'fill' ? this.phase.task.clue.truth : null
        if (!truth) return

        this.mode = 'placing'
        this.applyInput()

        if (canPlace(value, field, truth)) await this.accept(field, value, index)
        else await this.reject(field, value, index)

        if (gen !== this.gen) return
    }

    /* ───────────────────────── nível 1: montar ────────────────────────── */

    private async accept(field: FieldId, value: string, index: number) {
        const gen = this.gen

        this.audio.snap()
        this.hint.hush()
        this.trava = false
        this.tries = 0
        this.tray.clearPulses()
        this.record.clearPulses()

        await this.tray.flyTo(index, this.record.slotWorld(field))
        if (gen !== this.gen) return
        await this.record.place(field, value)
        if (gen !== this.gen) return

        this.shown = applyValue(this.shown, field, value)

        if (this.record.complete()) {
            await this.finishPhase()
            return
        }

        this.mode = 'asking'
        this.applyInput()
    }

    /**
     * O encaixe recusado.
     *
     * Só o PRIMEIRO erro conceitual da fase custa vida, como manda o §10:
     * insistir na mesma dúvida não pode ir somando castigo, senão a criança
     * que não entendeu perde tudo justamente enquanto tenta entender. Os
     * seguintes só aumentam a ajuda.
     */
    private async reject(field: FieldId, value: string, index: number) {
        const gen = this.gen
        const task = this.phase.task
        if (task.kind !== 'fill') return
        this.tries += 1
        this.trava = true

        this.audio.refuse()
        await FX.all(this.record.refuse(field), this.tray.bounce(index))
        if (gen !== this.gen) return

        const right = fieldOf(value, task.clue.truth, this.fieldIds)
        void this.hint.say(
            this.tries === 1 || !right
                ? missText(value, field, right ?? field)
                : `Procure o campo ${FIELD_LABEL[right]}.`,
            'warn',
        )

        this.loseOnce()
    }

    /* ─────────────────── níveis 2 e 3: campo, depois valor ────────────── */

    private async chooseField(field: FieldId) {
        const gen = this.gen

        // tocar de novo no campo escolhido cancela, como manda o §6
        if (this.record.chosen() === field) {
            this.audio.drop()
            this.record.choose(null)
            await this.tray.hide()
            if (gen !== this.gen) return
            this.applyInput()
            return
        }

        const right = this.targetField
        if (field === right) {
            this.audio.pick()
            this.hint.hush()
            this.trava = false
            this.tries = 0
            this.record.clearPulses()
            this.record.choose(field)
            this.mode = 'placing'
            this.applyInput()
            await this.tray.show(shuffled(trayFor(this.phase.task, this.changeIndex)))
            if (gen !== this.gen) return
            this.mode = 'asking'
            this.applyInput()
            return
        }

        this.tries += 1
        this.trava = true
        this.mode = 'placing'
        this.applyInput()

        this.audio.refuse()
        await this.record.refuse(field)
        if (gen !== this.gen) return

        void this.hint.say(this.wrongFieldText(field, right), 'warn')
        this.loseOnce()
    }

    /**
     * Por que ESTE campo não é o campo.
     *
     * A primeira dica manda comparar e não diz qual é o certo: dizer já na
     * primeira tentativa resolveria a fase no lugar da criança. A segunda
     * nomeia o campo, porque a essa altura a ajuda precisa crescer.
     */
    private wrongFieldText(field: FieldId, right?: FieldId): string {
        const task = this.phase.task
        const valor = this.record.valueAt(field).toLowerCase()

        if (task.kind === 'update') {
            if (this.tries >= 2 && right) return `A nota fala do campo ${FIELD_LABEL[right]}.`
            return 'A nota não fala deste campo. Leia ela de novo.'
        }
        if (this.tries >= 2 && right) return `Confira o campo ${FIELD_LABEL[right]}.`
        return `A pista também diz ${valor}. Compare os outros campos.`
    }

    private async useValue(index: number) {
        const field = this.record.chosen()
        if (!field) return

        const gen = this.gen
        const value = this.tray.valueAt(index)
        const right = this.targetValue(field)

        this.mode = 'placing'
        this.applyInput()

        if (value !== right) {
            this.tries += 1
            this.trava = true
            this.audio.refuse()
            await this.tray.bounce(index)
            if (gen !== this.gen) return

            void this.hint.say(this.wrongValueText(value), 'warn')
            this.loseOnce()
            return
        }

        this.audio.swap()
        this.hint.hush()
        this.trava = false
        this.tries = 0
        this.tray.clearPulses()

        await this.tray.flyTo(index, this.record.slotWorld(field))
        if (gen !== this.gen) return

        /*
         * A frase vem ANTES da espera, não depois.
         *
         * A troca do §12 segura o antes e o depois por 1,5 s. Dizer "COR agora
         * é laranja" só ao fim disso deixaria a frase na tela por um piscar,
         * justamente enquanto a criança olha para o campo que mudou.
         */
        this.shown = applyValue(this.shown, field, value)
        void this.hint.say(`${FIELD_LABEL[field]} agora é ${value.toLowerCase()}.`, 'good')

        await FX.all(this.record.replace(field, value), this.tray.hide())
        if (gen !== this.gen) return

        const task = this.phase.task
        const next = this.changeIndex + 1
        if (task.kind === 'update' && next < task.changes.length) {
            await this.nextNote(next)
            return
        }

        await FX.wait(this, 700)
        if (gen !== this.gen) return
        await this.finishPhase()
    }

    private wrongValueText(value: string): string {
        const task = this.phase.task
        const dito = value.toLowerCase()
        if (task.kind === 'update') {
            return this.tries >= 2
                ? 'O valor que a nota diz está piscando.'
                : `A nota não diz ${dito}. Leia ela outra vez.`
        }
        return this.tries >= 2
            ? 'O valor que a pista diz está piscando.'
            : `A pista não diz ${dito}. Confira nela.`
    }

    /**
     * A segunda novidade da mesma ficha.
     *
     * A criatura NÃO volta a entrar no aro: é a mesma ficha recebendo outra
     * notícia, e reanimar a chegada faria parecer que começou outra fase. O
     * que troca é só o texto da placa.
     */
    private async nextNote(index: number) {
        const gen = this.gen
        this.mode = 'intro'
        this.applyInput()
        this.changeIndex = index
        this.tries = 0
        this.trava = false

        await FX.wait(this, 900)
        if (gen !== this.gen) return
        this.hint.hush()
        this.audio.arrive()
        await this.sighting.setNote(this.change!.note)
        if (gen !== this.gen) return

        this.mode = 'asking'
        this.applyInput()
    }

    /** Uma vida por fase, no primeiro erro conceitual. Os seguintes, não. */
    private loseOnce() {
        if (this.stalled) return
        this.stalled = true
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

    /* ──────────────────────────── fim da ficha ────────────────────────── */

    private async finishPhase() {
        const gen = this.gen
        this.mode = 'reveal'
        this.applyInput()
        this.done += 1

        const points = this.stalled ? POINTS_AFTER_STALL : POINTS_CLEAN
        this.score += points
        this.hits += 1

        /*
         * A RESPOSTA É A FICHA, NÃO CADA ENCAIXE.
         *
         * O §15 pede `CORRECT_ANSWER` ao concluir a ficha; os encaixes
         * intermediários são passos dela. Emitir um evento por campo
         * multiplicaria por três o que a plataforma conta como resposta.
         */
        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER',
            gameId: GAME_ID,
            pointsEarned: points,
            stage: this.level.level,
        })
        this.emitCheckpoint()

        // o arquivo guarda o que está NA FICHA no fim, e não a pista: no
        // nível 3 os dois são diferentes, e quem vale é o registro
        this.archive.push({
            title: SHEET_NAME[creatureOf(this.phase.task)],
            lines: this.fieldIds.map(id => [FIELD_LABEL[id], this.shown[id] ?? ''] as [string, string]),
        })

        this.hint.hush()
        await this.sighting.blink()
        if (gen !== this.gen) return

        await FX.all(this.sighting.farewell(), this.sighting.hideClue(), this.tray.hide())
        if (gen !== this.gen) return

        await this.record.deliver(this.vault.mouth())
        if (gen !== this.gen) return

        this.audio.bolt()
        await this.vault.closeBolt()
        if (gen !== this.gen) return
        await this.hud.celebrate(this.done - 1)
        if (gen !== this.gen) return

        await FX.wait(this, 420)
        if (gen !== this.gen) return

        const next = this.phaseIndex + 1
        if (next < this.level.phases.length) void this.playPhase(next)
        else void this.endLevel()
    }

    private async endLevel() {
        const gen = ++this.gen
        this.mode = 'done'
        this.applyInput()
        this.hud.setEnabled(false)

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

        this.audio.door()
        await this.vault.openDoor()
        if (gen !== this.gen) return

        await this.vault.showArchive(this.archive)
        if (gen !== this.gen) return

        this.audio.fanfare()
        if (last) void FX.confetti(this, { colors: [C.aim, C.green, C.lamp, C.octopus] })

        // uma pausa longa de propósito: é aqui que a criança lê os três
        // registros que ela montou, e o painel de conclusão cobre a mesa
        await FX.wait(this, 2600)
        if (gen !== this.gen) return

        showLevelComplete(this, {
            accent: C.aim,
            panelColor: C.paper,
            overlayColor: C.deep,
            depth: 5000,
            title: this.closingTitle(),
            message: CLOSING,
            progress: { total: LEVELS.length, current: this.level.level, size: 9 },
            ...(last
                ? {
                      buttons: [
                          {
                              label: 'Jogar de novo',
                              color: C.green,
                              onClick: () => this.scene.restart({ lives: this.livesTotal, level: 1, points: 0 }),
                          },
                          {
                              label: 'Escolher jogo',
                              color: C.aim,
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

    /** O título do fim nomeia o verbo daquele nível, não "parabéns". */
    private closingTitle(): string {
        const kind = this.level.phases[0].task.kind
        if (kind === 'correct') return 'Fichas consertadas!'
        if (kind === 'update') return 'Fichas em dia!'
        return 'Cápsula aberta!'
    }

    /* ──────────────────────────────── resto ───────────────────────────── */

    private applyInput() {
        const free = !this.tutorialOpen && this.mode === 'asking'
        this.hud.setEnabled(!this.tutorialOpen && this.mode !== 'done')

        if (!free) {
            this.record.setReach('none')
            this.tray.setEnabled(false)
            return
        }

        if (this.flow === 'tag-first') {
            this.record.setReach('empty')
            this.tray.setEnabled(true)
            return
        }

        /*
         * Com o campo já escolhido, só ELE continua tocável.
         *
         * Não para prender a criança: tocar nele de novo cancela, que é o
         * caminho de volta do §6. O que isso evita é ela tocar num campo
         * vizinho por curiosidade e levar um erro conceitual por uma
         * decisão que ela já tinha tomado certo.
         */
        const chosen = this.record.chosen()
        this.record.setReach(chosen ? 'chosen' : 'all')
        this.tray.setEnabled(!!chosen)
    }

    /**
     * ─────────────────────────────────────────────────────────────────────
     *  O TUTORIAL MOSTRA SÓ O VERBO NOVO
     * ─────────────────────────────────────────────────────────────────────
     *
     * O §13 é explícito: os níveis 2 e 3 não repetem os quatro passos do
     * nível 1. Quem chega ao nível 3 já sabe que cada informação tem um campo
     * com nome; o que ela ainda não viu é uma ficha CERTA ficar velha.
     *
     * E nenhum passo aponta a resposta: o holofote cobre a ficha inteira, e
     * não o campo que precisa mudar.
     */
    private tutorialSteps(full: boolean) {
        const kind = this.phase.task.kind

        if (kind === 'correct') {
            return [
                {
                    text: 'Esta ficha já veio preenchida, mas um valor não bate com a pista.',
                    shape: 'rect' as const,
                    ...this.sighting.clueBounds(),
                    balloonX: 830,
                    balloonY: 250,
                },
                {
                    text: 'Toque no campo errado e depois escolha o valor certo.',
                    shape: 'rect' as const,
                    ...this.record.bounds(),
                    balloonX: 420,
                    balloonY: 620,
                    buttonLabel: 'Vamos!',
                },
            ]
        }

        if (kind === 'update') {
            return [
                {
                    text: 'A ficha está certa, mas chegou uma novidade.',
                    shape: 'rect' as const,
                    ...this.sighting.clueBounds(),
                    balloonX: 830,
                    balloonY: 250,
                },
                {
                    text: 'Toque no campo que mudou e escolha o valor novo. Os outros ficam.',
                    shape: 'rect' as const,
                    ...this.record.bounds(),
                    balloonX: 420,
                    balloonY: 620,
                    buttonLabel: 'Vamos!',
                },
            ]
        }

        const steps = [
            {
                text: 'Veja quem passou pela escotilha.',
                shape: 'circle' as const,
                ...this.sighting.ringBounds(),
                balloonX: 830,
                balloonY: 250,
            },
            {
                text: 'Cada informação tem um campo com nome.',
                shape: 'rect' as const,
                ...this.record.bounds(),
                balloonX: 420,
                balloonY: 620,
            },
            {
                text: 'Toque no valor que você encontrou.',
                shape: 'rect' as const,
                ...this.tray.bounds(),
                balloonX: 640,
                balloonY: 300,
            },
            {
                text: 'Agora toque no campo onde ele pertence.',
                shape: 'rect' as const,
                ...this.record.bounds(),
                balloonX: 420,
                balloonY: 620,
                buttonLabel: 'Vamos!',
            },
        ]
        return full ? steps : steps.slice(1)
    }

    private runTutorial(once: boolean, full = true) {
        this.tutorialOpen = true
        this.applyInput()
        createTutorial(this, {
            key: `ef04co02-o-cofre-dos-registros-l${this.level.level}`,
            once,
            accent: C.aim,
            safeTop: HUD.h + 14,
            steps: this.tutorialSteps(full),
            onFinish: () => {
                this.tutorialOpen = false
                this.applyInput()
            },
        })
    }

    private replayTutorial() {
        if (this.tutorialOpen || this.mode !== 'asking') return
        this.runTutorial(false)
    }

    private emitCheckpoint(complete = false) {
        const total = this.level.phases.length
        const feitas = complete ? total : this.hits
        runtimeGameBridge.emit({
            type: 'CHECKPOINT',
            gameId: GAME_ID,
            progress: Math.round((Math.min(feitas, total) / total) * 100),
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
