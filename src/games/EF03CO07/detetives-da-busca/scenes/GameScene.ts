import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { showLevelComplete, type LevelCompleteHandle } from '../../../../shared/level/showLevelComplete'
import { FX, Ease } from '../../../../shared/effects/FX'

import { LEVELS, TOTAL_CASES, search, labelOf } from '../data/levels'
import { C, FONT, SIZE, hex, typePhrase, LONG_WORD } from '../data/theme'
import { HUD, CASE, SEARCH, FILTERS, MURAL, TRAY } from '../data/layout'
import type { Case, CaseState, FilterId, Level, Query, Result } from '../types'

import {
    createHud, createCaseCard, createSearchBar, createFilterRow, createTray,
    createLens, createOpenCard, createScene, showToast, paintWordChip,
    type Hud, type CaseCard, type SearchBar, type FilterRow, type Tray,
    type Lens, type OpenCard,
} from './effects'
import { createMural, type Mural } from './mural'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'

const GAME_ID = 'detetives-da-busca'

/** Ver PLANEJAMENTO.md §4. */
const POINTS = {
    word: 10,
    filter: 10,
    pick: 20,
    miss: -5,
} as const

export class GameScene extends Phaser.Scene {
    private lives!: Lives
    private livesTotal = 3
    private livesLeft = 3

    /* ── partida ───────────────────────────────────────────────────── */

    private levelIdx = 0
    private caseIdx = 0
    private points = 0
    private hits = 0
    private errors = 0
    private isMuted = false
    private state: CaseState = 'briefing'
    private locked = false
    private ended = false

    /**
     * Geração do caso. Todo callback atrasado captura este valor e desiste se
     * ele mudou.
     *
     * Aqui ele importa mais do que nos outros jogos, porque a criança PODE tocar
     * numa palavra enquanto a anterior ainda anima — é o gesto natural de quem
     * está experimentando. O `refreshing` bloqueia o toque, mas o `gen` é a rede
     * que segura o que escapar por uma borda do fluxo.
     */
    private gen = 0

    /* ── interface fixa ────────────────────────────────────────────── */

    private hud!: Hud
    private caseCard!: CaseCard
    private lens!: Lens
    private openCard!: OpenCard
    private modal?: LevelCompleteHandle

    /* ── tabuleiro do caso ─────────────────────────────────────────── */

    private searchBar?: SearchBar
    private filterRow?: FilterRow
    private tray?: Tray
    private mural?: Mural

    private query: Query = { words: [], filter: 'all' }
    private openId: string | null = null

    /** Palavras que já pagaram ponto. Repetir o toque não farma. */
    private paidWords = new Set<string>()
    private paidFilter = false

    private unsubPlatform?: () => void

    constructor() {
        super({ key: 'GameScene' })
    }

    /**
     * `level` é 1-based e `phase` é 0-based, para bater com o resto da
     * plataforma. Os dois são grampeados ao que existe de verdade: um
     * `phase: 7` num nível de três casos faria `this.caso` devolver `undefined`,
     * e o estouro apareceria três telas adiante sem nenhuma pista de que veio
     * daqui.
     */
    init(data: { level?: number; phase?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this, 3)
        this.livesLeft = data?.lives ?? this.livesTotal
        this.levelIdx = Phaser.Math.Clamp(data?.level ?? 1, 1, LEVELS.length) - 1
        this.caseIdx = Phaser.Math.Clamp(
            data?.phase ?? 0, 0, LEVELS[this.levelIdx].cases.length - 1,
        )
        this.points = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.isMuted = false
        this.state = 'briefing'
        this.locked = false
        this.ended = false
        this.gen = 0

        this.query = { words: [], filter: 'all' }
        this.openId = null
        this.paidWords = new Set()
        this.paidFilter = false
        this.modal = undefined
    }

    create() {
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdownScene, this)

        createScene(this)

        this.hud = createHud(this, { onHelp: () => this.replayTutorial() })
        this.hud.setLevel(this.level.level)
        this.hud.setTitle(this.level.title)

        this.caseCard = createCaseCard(this)
        this.lens = createLens(this)
        this.openCard = createOpenCard(this, {
            onPick: () => void this.onPick(),
            onClose: () => void this.closeCard(),
        })

        EventBus.on('mute-audio', this.onMuteAudio, this)
        EventBus.on('show-tutorial', this.replayTutorial, this)
        this.registerPlatformCommands()

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        // O tutorial é a abertura do NÍVEL, não de um caso qualquer: quem entra
        // direto na fase 3 para testar não quer ser apresentado ao jogo.
        void this.playCase(this.caseIdx === 0)

        /* AJUSTE A POSIÇÃO COM A TECLA M (dev). Ver shared/hud/createLives.ts */
        this.lives = createLives(this, {
            total: this.livesTotal,
            remaining: this.livesLeft,
            gameId: GAME_ID,
            x: 40,
            y: 40,
            size: 30,
            stage: () => this.level.level,
        })
        this.events.once('shutdown', () => this.lives.destroy())
    }

    private shutdownScene() {
        this.gen += 1
        EventBus.off('mute-audio', this.onMuteAudio, this)
        EventBus.off('show-tutorial', this.replayTutorial, this)
        this.unsubPlatform?.()
        this.unsubPlatform = undefined
        this.input.setDefaultCursor('default')
    }

    /* ═══════════════════════════════════════════════ atalhos de estado */

    private get level(): Level { return LEVELS[this.levelIdx] }
    private get caso(): Case { return this.level.cases[this.caseIdx] }

    private resultOf(id: string): Result | undefined {
        return this.caso.results.find(r => r.id === id)
    }

    /* ═══════════════════════════════════════════════════ ciclo do caso */

    private clearBoard() {
        this.searchBar?.destroy()
        this.filterRow?.destroy()
        this.tray?.destroy()
        this.mural?.destroy()
        this.searchBar = undefined
        this.filterRow = undefined
        this.tray = undefined
        this.mural = undefined
    }

    private async playCase(withTutorial: boolean) {
        const gen = ++this.gen
        const caso = this.caso

        this.state = 'briefing'
        /*
         * `locked` é estado de MOMENTO, não de caso, e precisa zerar aqui junto
         * com o resto. Sem esta linha, o caso que termina bem deixa a trava
         * ligada e o caso seguinte monta a tela inteira sem aceitar um toque.
         */
        this.locked = false
        this.openId = null
        this.paidWords = new Set()
        this.paidFilter = false
        this.query = { words: [...caso.baseWords], filter: 'all' }

        this.clearBoard()

        this.hud.setProgress(this.caseIdx, this.level.cases.length)
        this.hud.setHint(caso.hint)
        this.emitCheckpoint()

        this.buildBoard()

        await this.caseCard.show(caso.question, caso.criterion)
        if (gen !== this.gen) return

        // A busca de abertura. No N1 não há palavra nenhuma ainda, então a
        // parede fica vazia com um convite em vez de um resultado que ninguém
        // pediu (ver `search` em casos.ts).
        if (this.query.words.length === 0) {
            this.mural?.showPrompt('Toque numa palavra para começar a busca.')
            void this.searchBar?.setCount(0)
        } else {
            await this.runQuery('inicio', false)
            if (gen !== this.gen) return
        }

        if (withTutorial) {
            const steps = this.buildTutorialSteps()
            if (steps.length) {
                this.runTutorial(steps, false, () => {
                    if (gen !== this.gen) return
                    this.state = 'searching'
                })
                return
            }
        }

        this.state = 'searching'
    }

    private buildBoard() {
        const caso = this.caso

        this.searchBar = createSearchBar(this, Math.max(caso.slots, caso.baseWords.length))
        this.searchBar.setWords(this.query.words.map(id => labelOf(id, caso)))

        if (caso.filters.length) {
            this.filterRow = createFilterRow(this, caso.filters, id => this.onFilter(id))
            this.filterRow.setActive('all')
        }

        if (caso.tray.length) {
            this.tray = createTray(this, caso.tray, id => this.onWord(id))
            this.tray.setOn([])
        }

        this.mural = createMural(this, caso.results, id => this.onCardTap(id))
        this.mural.setLayout(
            caso.slots === 0 ? MURAL.big
                : caso.filters.length ? MURAL.withFilters
                    : MURAL.withoutFilters,
            caso.slots === 0,
        )
    }

    /* ═════════════════════════════════════════════════ tocar palavra */

    private onWord(id: string) {
        if (this.state !== 'searching' || this.locked || this.ended) return

        const caso = this.caso
        const words = [...this.query.words]

        if (caso.slots === 1) {
            if (words[0] === id) return
            words[0] = id
        } else {
            // slot 0 é a palavra fixa do nível; a bandeja escreve no último
            if (words[1] === id) words.splice(1, 1)
            else words[1] = id
        }

        this.query = { ...this.query, words }
        this.playClick()

        const extra = caso.slots === 1 ? words : words.slice(1)
        this.tray?.setOn(extra)
        this.searchBar?.setWords(words.map(w => labelOf(w, caso)))

        // a ficha voa da bandeja até o slot
        const from = this.tray?.posOf(id)
        const to = this.searchBar?.slotPos(caso.slots === 1 ? 0 : 1)
        if (from && to && words.includes(id)) this.flyChip(labelOf(id, caso), from, to)

        void this.runQuery('palavra')
    }

    /** Cópia da ficha voando até a barra. Some ao chegar. */
    private flyChip(label: string, from: { x: number; y: number }, to: { x: number; y: number }) {
        const node = this.add.container(from.x, from.y).setDepth(200)
        const g = this.add.graphics()
        paintWordChip(g, TRAY.chipW, TRAY.chipH, TRAY.chipR, { on: true })
        const text = this.add.text(0, 0, label, {
            fontFamily: FONT.black,
            fontSize: label.length > LONG_WORD ? SIZE.wordSmall : SIZE.word,
            color: hex(C.searchDark),
        }).setOrigin(0.5).setResolution(2)
        node.add([g, text])

        FX.to(this, node, { scale: 0.9 }, { duration: 340, ease: Ease.smooth })
        FX.arcTo(this, node, to, { height: 110, duration: 340 })
            .then(() => FX.to(this, node, { alpha: 0, scale: 0.7 }, { duration: 140 }))
            .then(() => node.destroy())
    }

    /* ═════════════════════════════════════════════════ tocar filtro */

    private onFilter(id: FilterId) {
        if (this.state !== 'searching' || this.locked || this.ended) return
        if (this.query.filter === id) return

        this.query = { ...this.query, filter: id }
        this.filterRow?.setActive(id)
        this.playClick()
        void this.runQuery('filtro')
    }

    /* ═══════════════════════════════════════════════════════ a busca */

    /**
     * Todo toque em palavra ou filtro passa por aqui. É o coração do jogo.
     *
     * A saída vem antes da entrada, e o contador só muda quando o último cartão
     * parou — mudar no começo entregaria o resultado antes de a criança ver a
     * causa (MECANICA.md §4).
     */
    private async runQuery(how: 'palavra' | 'filtro' | 'inicio', announce = true) {
        const gen = this.gen
        const caso = this.caso

        this.state = 'refreshing'
        this.locked = true
        this.tray?.setEnabled(false)
        this.filterRow?.setEnabled(false)

        const before = this.mural?.shown() ?? []
        const next = search(caso.results, this.query)

        if (how !== 'inicio') {
            this.playSearch()
            await this.searchBar?.sweep()
            if (gen !== this.gen) return
        }

        await this.mural?.apply(next, how)
        if (gen !== this.gen) return

        await this.searchBar?.setCount(next.length)
        if (gen !== this.gen) return

        const left = before.filter(id => !next.includes(id)).length

        /*
         * MURAL ZERADO — lição, não erro.
         *
         * A trava continua ligada durante os 1400 ms do aviso e por todo o
         * desfazer. Destravar antes deixaria a criança tocar noutra palavra no
         * meio da volta, e o `undoLast` reescreveria a busca por cima da que ela
         * acabou de pedir.
         */
        if (announce && how !== 'inicio' && next.length === 0) {
            this.playEmpty()
            showToast(this, how === 'filtro'
                ? 'Nenhum resultado desse tipo.'
                : 'Nenhum resultado. Essa palavra é específica demais.', C.warn, 2000)
            await FX.wait(this, 1400)
            if (gen !== this.gen) return
            await this.undoLast(how)
            return
        }

        this.state = 'searching'
        this.locked = false
        this.tray?.setEnabled(true)
        this.filterRow?.setEnabled(true)

        if (!announce || how === 'inicio') return

        // ── pontuação: a palavra é boa porque FUNCIONA ──────────────────
        const better = left > 0 && next.includes(caso.answerId)

        if (how === 'palavra') {
            const last = this.query.words[this.query.words.length - 1]
            if (better && last && !this.paidWords.has(last)) {
                this.paidWords.add(last)
                this.award(POINTS.word)
            }
            showToast(this, left > 0
                ? `${left} ${left === 1 ? 'resultado saiu' : 'resultados saíram'}.`
                : 'Ninguém saiu. Essa palavra é muito larga.',
                left > 0 ? C.search : C.warn, 2000)
            return
        }

        if (this.query.filter !== 'all') {
            if (better && !this.paidFilter) {
                this.paidFilter = true
                this.award(POINTS.filter)
            }
            showToast(this, `Só ${typePhrase[this.query.filter]} agora.`, C.search, 1800)
        }
    }

    /** Desfaz a última mudança que zerou o mural, sem cobrar nada por ela. */
    private async undoLast(how: 'palavra' | 'filtro') {
        const caso = this.caso

        if (how === 'filtro') {
            this.query = { ...this.query, filter: 'all' }
            this.filterRow?.setActive('all')
        } else if (caso.slots === 2) {
            this.query = { ...this.query, words: this.query.words.slice(0, 1) }
            this.tray?.setOn([])
        } else {
            this.query = { ...this.query, words: [] }
            this.tray?.setOn([])
        }

        this.searchBar?.setWords(this.query.words.map(w => labelOf(w, caso)))

        if (this.query.words.length === 0) {
            this.mural?.showPrompt('Toque numa palavra para começar a busca.')
            await this.searchBar?.setCount(0)
            this.state = 'searching'
            this.locked = false
            this.tray?.setEnabled(true)
            this.filterRow?.setEnabled(true)
            return
        }

        await this.runQuery(how, false)
    }

    /* ═══════════════════════════════════════════════════════ a lupa */

    private async onCardTap(id: string) {
        if (this.state !== 'searching' || this.locked || this.ended) return
        if (this.openCard.isOpen()) return

        const result = this.resultOf(id)
        const pos = this.mural?.posOf(id)
        if (!result || !pos) return

        const gen = this.gen
        this.state = 'reading'
        this.locked = true
        this.openId = id
        this.mural?.setState(id, 'open')
        this.playLens()

        await this.lens.flyTo(pos.x + 120, pos.y - 40)
        if (gen !== this.gen) return

        await this.openCard.open(result)
    }

    private async closeCard() {
        if (this.state !== 'reading' || !this.openId) return

        const gen = this.gen
        const id = this.openId
        this.openId = null

        await this.openCard.close()
        if (gen !== this.gen) return

        this.mural?.setState(id, 'idle')
        this.mural?.markRead(id)
        void this.lens.rest()

        this.state = 'searching'
        this.locked = false
    }

    /* ═══════════════════════════════════════════════ escolher a pista */

    private async onPick() {
        if (this.state !== 'reading' || !this.openId) return

        const gen = this.gen
        const id = this.openId
        const result = this.resultOf(id)
        if (!result) return

        const right = id === this.caso.answerId

        if (right) {
            this.hits += 1
            this.points += POINTS.pick
            this.playSolved()
            runtimeGameBridge.emit({
                type: 'CORRECT_ANSWER', gameId: GAME_ID,
                pointsEarned: POINTS.pick, stage: this.level.level,
            })
            this.emitCheckpoint()

            this.state = 'solved'
            this.mural?.setState(id, 'serve')
            void FX.sparks(this, 640, 430, { color: C.ok, count: 22, spread: 200 })
            void FX.stars(this, 640, 430, { color: C.ok, count: 12, rise: 150 })
            void FX.flash(this, C.white, { duration: 300, peak: 0.28 })

            await this.openCard.verdict('serve', result.verdict)
            if (gen !== this.gen) return

            this.openId = null
            await this.openCard.close()
            if (gen !== this.gen) return
            void this.lens.rest()

            await FX.wait(this, 400)
            if (gen !== this.gen) return
            this.advance()
            return
        }

        this.errors += 1
        this.points += POINTS.miss
        this.playError()
        FX.shakeCam(this, 'leve')
        runtimeGameBridge.emit({
            type: 'WRONG_ANSWER', gameId: GAME_ID,
            pointsEarned: POINTS.miss, stage: this.level.level,
        })
            this.lives.lose(); this.livesLeft = this.lives.remaining
        this.emitCheckpoint()

        this.mural?.setState(id, 'fora')
        await this.openCard.verdict('fora', result.verdict)
        if (gen !== this.gen) return

        // errar não trava nem repete o caso: o cartão volta para a parede e a
        // criança continua de onde estava
        this.openId = null
        await this.openCard.close()
        if (gen !== this.gen) return

        this.mural?.setState(id, 'idle')
        this.mural?.markRead(id)
        void this.lens.rest()

        this.state = 'searching'
        this.locked = false
    }

    private award(value: number) {
        this.points += value
        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER', gameId: GAME_ID,
            pointsEarned: value, stage: this.level.level,
        })
        this.emitCheckpoint()
        this.playPoint()
        FX.popText(this, SEARCH.counterX, SEARCH.counterY - 40, `+${value}`, {
            color: hex(C.ok), size: '32px',
        })
    }

    /* ═══════════════════════════════════════════════ avanço de nível */

    private advance() {
        this.caseIdx += 1
        if (this.caseIdx >= this.level.cases.length) {
            this.endLevel()
            return
        }
        void this.playCase(false)
    }

    private endLevel() {
        this.ended = true
        this.locked = true
        this.gen += 1
        this.hud.setProgress(this.level.cases.length, this.level.cases.length)
        this.hud.setHelpEnabled(false)

        runtimeGameBridge.emit({
            type: 'GAME_COMPLETED', gameId: GAME_ID, stage: this.level.level, totalStages: LEVELS.length,
        })
        this.emitCheckpoint(true)

        const lvl = this.level.level
        const next = lvl < 3 ? (lvl + 1) as 2 | 3 : null

        if (next) {
            this.modal = showLevelComplete(this, {
                title: 'Muito bem, detetive!',
                subtitle: `Nível ${lvl} concluído`,
                message: this.level.objective,
                accent: C.search,
                panelColor: C.paper,
                overlayColor: C.ink,
                progress: { total: 3, current: lvl },
                autoAdvance: {
                    delay: 2300,
                    label: 'Preparando o próximo nível...',
                    onComplete: () => this.scene.restart({ lives: this.livesLeft, level: next, points: this.points }),
                },
            })
            return
        }

        FX.confetti(this, { colors: [C.search, C.ok, C.warn, C.paper] })
        this.modal = showLevelComplete(this, {
            title: 'Caso encerrado!',
            subtitle: 'Você aprendeu a procurar de verdade',
            message: `Acertos: ${this.hits}  ·  Erros: ${this.errors}  ·  Pontos: ${Math.max(0, this.points)}`,
            accent: C.ok,
            panelColor: C.paper,
            overlayColor: C.ink,
            progress: { total: 3, current: 3 },
            buttons: [
                {
                    label: 'Jogar de novo',
                    color: C.ok,
                    onClick: () => this.scene.restart({ lives: this.livesTotal, level: 1, points: 0 }),
                },
                {
                    label: 'Escolher jogo',
                    color: C.search,
                    onClick: () => EventBus.emit('exit-game'),
                },
            ],
        })
    }

    /* ═══════════════════════════════════════════════════════ tutorial */

    private spots() {
        const caso = this.caso
        const band = caso.slots === 0 ? MURAL.big
            : caso.filters.length ? MURAL.withFilters
                : MURAL.withoutFilters

        return {
            caso: { x: CASE.cx, y: CASE.cy, w: CASE.w + 28, h: CASE.h + 28 },
            tray: { x: TRAY.cx, y: TRAY.y + TRAY.h / 2, w: TRAY.w + 20, h: TRAY.h + 20 },
            filters: { x: 640, y: FILTERS.cy, w: 940, h: FILTERS.h + 28 },
            mural: { x: 640, y: band.y + band.h / 2, w: MURAL.w + 20, h: band.h + 20 },
        }
    }

    /**
     * Todo passo fixa `balloonY`. A heurística automática do `createTutorial`
     * mede a altura do texto e escolhe acima/abaixo; com o holofote na bandeja,
     * que é baixa, a conta cai em cima do mural.
     */
    private buildTutorialSteps(): TutorialStep[] {
        const spot = this.spots()
        const OVER_MURAL = 470
        const OVER_TRAY = 556

        if (this.level.level === 2) {
            return [
                {
                    text: 'Some uma segunda palavra para tirar o que não serve.',
                    shape: 'rect', ...spot.tray, balloonY: OVER_MURAL,
                },
                {
                    text: 'E escolha o tipo de resultado que o pedido pede.',
                    shape: 'rect', ...spot.filters, balloonY: OVER_TRAY,
                },
            ]
        }

        if (this.level.level === 3) {
            return [
                {
                    text: 'Duas pistas, e as duas são sobre o assunto certo.',
                    shape: 'rect', ...spot.mural, balloonY: 200,
                },
                {
                    text: 'Leia as duas com a lupa e toque em É ESSA! na que serve.',
                    shape: 'rect', ...spot.caso, balloonY: OVER_MURAL,
                },
            ]
        }

        return [
            {
                text: 'Este é o caso que você precisa resolver.',
                shape: 'rect', ...spot.caso, balloonY: OVER_MURAL,
            },
            {
                text: 'Toque numa palavra e veja o que o buscador traz.',
                shape: 'rect', ...spot.tray, balloonY: OVER_MURAL,
            },
            {
                text: 'Depois toque num cartão para ler com a lupa.',
                shape: 'rect', ...spot.mural, balloonY: OVER_TRAY,
            },
        ]
    }

    private runTutorial(steps: TutorialStep[], force: boolean, onFinish: () => void) {
        this.locked = true
        this.hud.setHelpEnabled(false)

        createTutorial(this, {
            key: `ef03co07-l${this.level.level}`,
            once: !force,
            accent: C.search,
            safeTop: HUD.y + HUD.h + 12,
            steps,
            onFinish: () => {
                this.locked = false
                this.hud.setHelpEnabled(true)
                onFinish()
            },
        })
    }

    private replayTutorial = () => {
        if (this.ended || this.locked) return
        if (this.state !== 'searching') return

        const gen = this.gen
        const steps = this.buildTutorialSteps()
        if (!steps.length) return

        this.runTutorial(steps, true, () => {
            if (gen !== this.gen || this.ended) return
            this.state = 'searching'
        })
    }

    /* ═══════════════════════════════════════════════════════ plataforma */

    private emitCheckpoint(forceComplete = false) {
        const before = LEVELS.slice(0, this.levelIdx).reduce((s, l) => s + l.cases.length, 0)
        const done = before + this.caseIdx + (forceComplete ? 1 : 0)

        runtimeGameBridge.emit({
            type: 'CHECKPOINT',
            gameId: GAME_ID,
            progress: Math.round((done / TOTAL_CASES) * 100),
            score: Math.max(0, this.points),
            stage: this.level.level,
            hits: this.hits,
            errors: this.errors,
        })
    }

    private registerPlatformCommands() {
        this.unsubPlatform = runtimeGameBridge.onCommand((cmd: PlatformCommand) => {
            if (cmd.type !== 'START_GAME') return
            this.points = cmd.points ?? this.points
        })
    }

    private onMuteAudio = (muted: boolean) => { this.isMuted = muted }

    /* ═══════════════════════════════════════════════════════════ áudio */

    private getAudioCtx(): AudioContext | null {
        if (this.isMuted) return null
        try {
            return (this.sound as Phaser.Sound.WebAudioSoundManager).context
        } catch {
            return null
        }
    }

    private playTone(freq: number, dur: number, type: OscillatorType = 'sine', gain = 0.1) {
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

    private playClick() { this.playTone(480, 0.045, 'triangle', 0.07) }
    private playLens() { this.playTone(620, 0.07, 'sine', 0.08) }
    private playError() { this.playTone(210, 0.18, 'square', 0.1) }
    private playEmpty() { this.playTone(300, 0.14, 'sine', 0.07) }
    private playPoint() { this.playTone(880, 0.09, 'sine', 0.08) }
    private playSearch() {
        this.playTone(700, 0.05, 'sine', 0.05)
        this.time.delayedCall(200, () => this.playTone(900, 0.05, 'sine', 0.05))
    }
    private playSolved() {
        [523, 659, 784, 1047].forEach((f, i) =>
            this.time.delayedCall(i * 110, () => this.playTone(f, 0.18, 'sine', 0.13)))
    }
}
