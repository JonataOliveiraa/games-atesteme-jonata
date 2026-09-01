import Phaser from 'phaser'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import { EventBus } from '../../../../shared/EventBus'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { LEVELS } from '../data/levels'
import { HUD, SUB, BANDA, RODAPE } from '../data/layout'
import { C, BARRA, hex, STROKE } from '../data/theme'
import { createTimeBar, type TimeBar } from '../../../../shared/hud/createTimeBar'
import type {
    GraphEdge,
    GraphNode,
    LevelConfig,
    PhaseConfig,
    RepresentPhase,
    RoutePhase,
    QueryPhase,
    IsomorphismPhase,
} from '../types'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'

const GAME_ID = 'mapas-em-rede'

const W = 1280
const H = 720
/**
 * ── A PEÇA FICA SOLTA NA GRAMA, E O ANEL PASSA POR FORA ──────────────────
 *
 * O defeito original era um só: o ícone era desenhado a 120x120 e o anel de
 * destaque tinha raio 48 — 96 de diâmetro. Ao acender um nó, o anel nascia POR
 * DENTRO da arte e o desenho escapava 12px de cada lado.
 *
 * Eu consertei do jeito errado: pus um disco de madeira atrás de cada peça
 * para "conter" a arte. Isso resolveu o anel e criou outra coisa — uma moldura
 * marrom em volta de casas e pessoas que já são recortadas e já foram feitas
 * para pousar direto no cenário. O usuário devolveu na hora: *"elas devem
 * ficar sem background, pois elas ficam em cima da grama"*.
 *
 * O conserto certo era mexer só no ANEL. `PECA_R` é a metade da arte — a
 * pegada que todo o resto do layout usa para se afastar — e o anel vive em
 * `PECA_R + 8`, sempre por fora. Nenhum fundo, nenhuma moldura.
 */
const ICON_D = 112
const PECA_R = ICON_D / 2
/** O anel de destaque, sempre POR FORA da arte. */
const HALO_R = PECA_R + 8
const LABEL_DY = 76
const HIT_R = 62

const BAR_Y = 664
const BAR_TOP = RODAPE.top

const edgeKey = (a: string, b: string) => [a, b].sort().join('|')

interface NodeView {
    def: GraphNode
    container: Phaser.GameObjects.Container
    ring: Phaser.GameObjects.Graphics
    x: number
    y: number
    side: 'main' | 'alt'
}

export class GameScene extends Phaser.Scene {
    private lives!: Lives
    private livesTotal = 3
    private livesLeft = 3
    private levelIdx = 0
    private phaseIdx = 0
    private points = 0
    private locked = true
    private ended = false

    private nodeViews: NodeView[] = []
    private edges: GraphEdge[] = []
    private altNodeViews: NodeView[] = []

    private edgeLayer!: Phaser.GameObjects.Graphics
    private elasticLayer!: Phaser.GameObjects.Graphics
    private markerLayer!: Phaser.GameObjects.Container
    private reviewMode = false

    private dragFrom: NodeView | null = null
    private draggingNode: NodeView | null = null

    private tutorialOpen = false
    private tutorialSeen = false

    private routePath: string[] = []
    private costText?: Phaser.GameObjects.Text

    private selectedOption = -1
    private optionButtons: Phaser.GameObjects.Container[] = []

    private taskLayer!: Phaser.GameObjects.Container
    private taskChips: Array<{ key: string; g: Phaser.GameObjects.Graphics; check: Phaser.GameObjects.Graphics }> = []

    private confirmBtn?: Phaser.GameObjects.Container
    private hudSub: string | any = ''

    /* ── o HUD, que era da UIScene e agora mora aqui ─────────────────── */
    private hudLayer!: Phaser.GameObjects.Container
    private instructionText!: Phaser.GameObjects.Text
    private subText!: Phaser.GameObjects.Text
    private levelText!: Phaser.GameObjects.Text
    private dots!: Phaser.GameObjects.Graphics
    private tempo!: TimeBar
    private helpBtn?: Phaser.GameObjects.Container
    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; phase?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this, 3)
        this.livesLeft = data?.lives ?? this.livesTotal
        this.levelIdx = (data.level ?? 1) - 1
        this.phaseIdx = data.phase ?? 0
        this.points = data.points ?? 0
        this.locked = true
        this.ended = false
        this.nodeViews = []
        this.altNodeViews = []
        this.edges = []
        this.routePath = []
        this.selectedOption = -1
        this.optionButtons = []
        this.reviewMode = false
        this.dragFrom = null
        this.draggingNode = null
        this.taskChips = []
    }

    private get level(): LevelConfig {
        return LEVELS[this.levelIdx]
    }

    private get phase(): PhaseConfig {
        return this.level.phases[this.phaseIdx]
    }

    create() {
        this.drawBackground()
        this.buildHud()
        this.buildPhase()
        this.registerPointerHandlers()
        this.publishHud()

        // `timer-end` sumiu: a barra é desta cena e avisa direto pelo `onEmpty`
        EventBus.on('show-tutorial', () => this.runTutorials(() => { }, true), this)

        this.events.once('shutdown', () => {
            EventBus.off('show-tutorial', undefined, this)
        })

        // `GAME_READY` não leva `stage` no contrato — leva só o `gameId`
        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        if (this.phaseIdx > 0) this.showHelpButton()

        if (this.phaseIdx === 0) {
            this.showLevelIntro(() => this.runTutorials(() => this.startPhase()))
        } else {
            this.runTutorials(() => this.startPhase())
        }

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

    private startPhase() {
        this.locked = false
        if (this.level.timeLimit) this.startTimer()
    }

    private drawBackground() {
        /*
         * ── UM CENÁRIO SÓ, DO COMEÇO AO FIM ──────────────────────────────
         *
         * O Nível 3 trocava para `bg-rede` — um fundo escuro de "rede" — nas
         * três fases de contexto `rede`. O jogo mudava de mundo no meio: dois
         * níveis num bairro ilustrado e o terceiro num painel abstrato, com a
         * mesma moldura de madeira em volta. O `context` continua nos dados
         * (ele diz se as bolinhas são lugares ou pessoas), mas não escolhe mais
         * a arte: a floresta do Nível 1 vale para os três.
         *
         * `bg-rede` segue carregada na BootScene e sem uso — é o único asset
         * órfão do jogo, e fica de reserva.
         */
        this.add.image(W / 2, H / 2, 'bg-bairro').setDisplaySize(W, H).setDepth(-2)

        const veil = this.add.graphics().setDepth(-1)
        veil.fillStyle(C.ink, 0.08)
        veil.fillRect(0, 0, W, H)

        const bar = this.add.graphics().setDepth(1)
        this.paintTabua(bar, -10, BAR_TOP, W + 20, H - BAR_TOP + 10, { sombra: false })

        this.edgeLayer = this.add.graphics().setDepth(8)
        this.elasticLayer = this.add.graphics().setDepth(9)
        this.markerLayer = this.add.container(0, 0).setDepth(16)
        this.taskLayer = this.add.container(0, 0).setDepth(18)
    }

    /**
     * Onde a faixa de tarefa começa nesta fase.
     *
     * Depende de haver subtítulo: com ele, tudo desce uma linha. É o único
     * número do topo que muda de fase para fase, e ter isso escrito num lugar
     * só é o que impede a lista de aterrissar em cima do mapa.
     */
    private get bandaTop(): number {
        return this.hudSub ? BANDA.comSub : BANDA.semSub
    }

    /** Mede um texto DE VERDADE, em vez de chutar `length * 9.5`. */
    private medir(texto: string, size: number, familia = '"DynaPuff Black", "Arial Black", Arial, sans-serif'): number {
        const t = this.add.text(-9999, -9999, texto, {
            fontFamily: familia, fontSize: `${size}px`,
        }).setResolution(2)
        const w = t.width
        t.destroy()
        return w
    }

    /** Fatia `n` itens em `linhas` blocos contíguos do mesmo tamanho. */
    private fatiar(n: number, linhas: number): number[][] {
        const porLinha = Math.ceil(n / linhas)
        const out: number[][] = []
        for (let i = 0; i < n; i += porLinha) {
            out.push(Array.from({ length: Math.min(porLinha, n - i) }, (_, k) => i + k))
        }
        return out
    }

    /**
     * A LISTA DE RUAS A LIGAR — um trilho vertical na margem esquerda.
     *
     * ── DOIS BUGS, UM DEPOIS DO OUTRO ────────────────────────────────────
     *
     * 1. A largura de cada ficha era um CHUTE (`texto.length * 9.5 + 62`). Na
     *    fase de seis ruas a conta errava, o empacotamento era guloso, e
     *    "Biblioteca — Praça" caía sozinha numa segunda linha em cima do mapa.
     *
     * 2. Consertada a medida, a lista virou uma placa horizontal centrada — e
     *    aí seis pares em duas linhas eram uma tábua de 870x110 atravessando o
     *    meio da tela. Ler passou a funcionar; VER o bairro, não. Crescer para
     *    baixo, no centro, é crescer em cima do jogo.
     *
     * A forma certa é vertical, encostada na margem: uma lista de itens a
     * marcar é uma prancheta, não um letreiro. O sexto par agora deixa o
     * trilho mais ALTO, numa faixa de tela onde não existe mais nada — e o
     * mapa fica inteiro à vista.
     *
     * A letra encolhe (17 → 15) antes de o trilho passar do piso. Se nem assim
     * couber, é bug de dados — uma fase com pares demais — e não de layout.
     */
    private buildChecklist() {
        const p = this.phase
        if (p.kind !== 'representar') return

        const pairs = p.edges
        const top = this.bandaTop
        const x = BANDA.trilhoX
        const w = BANDA.trilhoW
        const pad = BANDA.trilhoPad
        const fichaH = BANDA.fichaListaH
        const gap = BANDA.fichaListaGap

        const alturaTotal = pad * 2 + BANDA.trilhoTituloH
            + pairs.length * fichaH + (pairs.length - 1) * gap

        /* o corpo da letra é o único grau de liberdade: o trilho não pode
           passar do piso, e a coluna de texto é estreita por natureza */
        const textoW = w - BANDA.textoDX - pad
        let size = BANDA.textoSizes[BANDA.textoSizes.length - 1]
        for (const s2 of BANDA.textoSizes) {
            const maior = Math.max(...pairs.flatMap(e =>
                [this.medir(this.labelOf(e.a), s2), this.medir(this.labelOf(e.b), s2)]))
            if (maior <= textoW) { size = s2; break }
        }

        const tabua = this.add.graphics()
        this.paintTabua(tabua, x, top, w, alturaTotal, { r: BANDA.trilhoR })
        this.taskLayer.add(tabua)

        this.taskLayer.add(
            this.add.text(x + w / 2, top + pad + BANDA.trilhoTituloH / 2 - 2, 'RUAS PARA LIGAR', {
                fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: `${BANDA.trilhoTituloSize}px`,
                color: hex(C.latao), stroke: STROKE, strokeThickness: 4,
            }).setOrigin(0.5).setResolution(2),
        )

        pairs.forEach((e, i) => {
            const y = top + pad + BANDA.trilhoTituloH + i * (fichaH + gap)
            const cy = y + fichaH / 2

            const g = this.add.graphics()
            const check = this.add.graphics()

            /*
             * O COLCHETE, e não um travessão.
             *
             * "Biblioteca —" a 17px pede 126px e a coluna tem 114: o traço era
             * exatamente o que estourava. Desenhado, ele custa zero caractere e
             * ainda diz melhor o que quer dizer — estes dois, juntos.
             */
            const colchete = this.add.graphics()
            const bx = x + BANDA.colcheteDX
            colchete.lineStyle(3, C.latao, 0.85)
            colchete.beginPath()
            colchete.moveTo(bx + 5, cy - BANDA.linhaDY)
            colchete.lineTo(bx, cy - BANDA.linhaDY)
            colchete.lineTo(bx, cy + BANDA.linhaDY)
            colchete.lineTo(bx + 5, cy + BANDA.linhaDY)
            colchete.strokePath()

            const linha = (texto: string, dy: number) =>
                this.add.text(x + BANDA.textoDX, cy + dy, texto, {
                    fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: `${size}px`,
                    color: hex(C.creme), stroke: STROKE, strokeThickness: 4,
                }).setOrigin(0, 0.5).setResolution(2)

            g.setData('rect', { x, y, w, h: fichaH })
            check.setData('cx', x + BANDA.marcaDX)
            check.setData('cy', cy)

            this.taskLayer.add([
                g, check, colchete,
                linha(this.labelOf(e.a), -BANDA.linhaDY),
                linha(this.labelOf(e.b), BANDA.linhaDY),
            ])
            this.taskChips.push({ key: edgeKey(e.a, e.b), g, check })
        })

        this.refreshChecklist()
    }

    private refreshChecklist() {
        if (!this.taskChips.length) return
        const current = new Set(this.edges.map(e => edgeKey(e.a, e.b)))

        this.taskChips.forEach(chip => {
            const r = chip.g.getData('rect') as { x: number; y: number; w: number; h: number } | undefined
            if (!r || !chip.g.active) return

            const done = current.has(chip.key)

            const rr = BANDA.fichaListaR
            chip.g.clear()
            chip.g.fillStyle(C.madeiraEscura, 1)
            chip.g.fillRoundedRect(r.x, r.y + 3, r.w, r.h, rr)
            chip.g.fillStyle(done ? C.green : C.madeiraMedia, 1)
            chip.g.fillRoundedRect(r.x, r.y, r.w, r.h, rr)
            chip.g.fillStyle(C.white, 0.15)
            chip.g.fillRoundedRect(r.x + 7, r.y + 5, r.w - 14, r.h * 0.24, rr / 2)
            chip.g.lineStyle(3, done ? C.greenSoft : C.latao, done ? 1 : 0.7)
            chip.g.strokeRoundedRect(r.x, r.y, r.w, r.h, rr)

            const cx = chip.check.getData('cx') as number
            const cy = chip.check.getData('cy') as number
            const mr = BANDA.marcaR

            chip.check.clear()
            chip.check.fillStyle(done ? C.creme : C.ink, done ? 1 : 0.34)
            chip.check.fillCircle(cx, cy, mr)
            if (done) {
                chip.check.lineStyle(4, C.green, 1)
                chip.check.beginPath()
                chip.check.moveTo(cx - 5, cy)
                chip.check.lineTo(cx - 1, cy + 4)
                chip.check.lineTo(cx + 6, cy - 5)
                chip.check.strokePath()
            } else {
                chip.check.lineStyle(2, C.latao, 0.55)
                chip.check.strokeCircle(cx, cy, mr)
            }
        })
    }

    private buildPhase() {
        const p = this.phase

        if (p.kind === 'representar') {
            this.hudSub = (p.rule)
            this.buildNodes(p.nodes, 'main')
            this.edges = []
            this.buildConfirm('Confirmar ligações', () => this.confirmRepresent())
            this.buildChecklist()
            this.hintErase()
        }

        if (p.kind === 'rota') {
            /*
             * Sem subtítulo aqui, de propósito.
             *
             * Ele dizia "Comece em Casa, passe na Praça e termine na Escola" —
             * exatamente o que a faixa PERCURSO logo abaixo mostra em fichas
             * coloridas, com bandeira, alfinete e chegada. Era a mesma
             * informação duas vezes, e era a linha que faltava para a faixa
             * caber acima do mapa.
             */
            this.hudSub = ''
            this.buildNodes(p.nodes, 'main')
            this.edges = p.edges.map(e => ({ ...e }))
            this.buildRouteHud()
            this.buildConfirm('Confirmar rota', () => this.confirmRoute())
            this.markEndpoints(p)
            this.buildRouteMissionStrip(p)
            this.markMustPassNodes(p)
        }

        if (p.kind === 'consulta') {
            this.hudSub = (p.question)
            this.buildNodes(p.nodes, 'main')
            this.edges = p.edges.map(e => ({ ...e }))
            this.buildOptions(p)
            this.buildConfirm('Confirmar resposta', () => this.confirmQuery())
        }

        if (p.kind === 'isomorfismo') {
            this.hudSub = ('Arraste as bolinhas para comparar os dois desenhos.')
            this.buildNodes(p.nodes, 'main')
            this.buildNodes(p.altNodes, 'alt')
            this.edges = p.edges.map(e => ({ ...e }))
            this.buildIsoLabels()
            this.buildIsoButtons(p)
        }

        this.redrawEdges()
    }

    private labelOf(id: string) {
        const all = [...this.phase.nodes]
        return all.find(n => n.id === id)?.label ?? id
    }

    private hintErase() {
        this.add.text(470, RODAPE.cy, 'Toque na bolinha do meio de uma linha para apagá-la', {
            fontFamily: 'DynaPuff, Arial, sans-serif',
            fontStyle: 'bold',
            fontSize: '18px',
            color: hex(C.cremeSoft),
        }).setOrigin(0.5).setDepth(12).setResolution(2)
    }

    private buildNodes(defs: GraphNode[], side: 'main' | 'alt') {
        defs.forEach(def => {
            const container = this.add.container(def.x, def.y).setDepth(14)

            const ring = this.add.graphics()
            this.paintNode(ring, 'idle')

            const icon = this.add.image(0, 0, def.textureKey).setDisplaySize(ICON_D, ICON_D)

            const label = this.add.text(0, LABEL_DY, def.label, {
                fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
                fontSize: '16px',
                color: hex(C.creme),
                stroke: STROKE,
                strokeThickness: 5,
            }).setOrigin(0.5).setResolution(2)

            const hit = this.add.rectangle(0, 0, HIT_R * 2, HIT_R * 2, C.white, 0.01)
                .setInteractive({ useHandCursor: true })

            container.add([ring, icon, label, hit])

            const view: NodeView = { def, container, ring, x: def.x, y: def.y, side }

            hit.on('pointerdown', () => this.onNodeDown(view))
            hit.on('pointerover', () => {
                if (this.locked) return
                this.tweens.add({ targets: container, scale: 1.06, duration: 90 })
            })
            hit.on('pointerout', () => {
                this.tweens.add({ targets: container, scale: 1, duration: 90 })
            })

            if (side === 'main') this.nodeViews.push(view)
            else this.altNodeViews.push(view)
        })
    }

    private paintNode(g: Phaser.GameObjects.Graphics, state: 'idle' | 'active' | 'route' | 'error') {
        g.clear()

        if (state === 'idle') return

        /*
         * POR FORA da arte, e por baixo dela.
         *
         * O anel é o halo que acende, não uma moldura: ele mora em `HALO_R`
         * (oito pixels além da borda do desenho) e entra no container ANTES do
         * ícone, então a casa continua inteira por cima dele.
         */
        const color = state === 'active' ? C.amber : state === 'route' ? C.greenSoft : C.red
        g.fillStyle(color, 0.22)
        g.fillCircle(0, 0, HALO_R)
        g.lineStyle(6, color, 1)
        g.strokeCircle(0, 0, HALO_R)
    }

    private allViews() {
        return [...this.nodeViews, ...this.altNodeViews]
    }

    private viewOf(id: string, side: 'main' | 'alt' = 'main') {
        const pool = side === 'main' ? this.nodeViews : this.altNodeViews
        return pool.find(v => v.def.id === id)
    }

    private redrawEdges() {
        this.edgeLayer.clear()
        this.markerLayer.removeAll(true)

        const p = this.phase
        const expected = p.kind === 'representar' ? p.edges : []
        const expectedKeys = new Set(expected.map(e => edgeKey(e.a, e.b)))
        const currentKeys = new Set(this.edges.map(e => edgeKey(e.a, e.b)))

        if (this.reviewMode && p.kind === 'representar') {
            expected.forEach(e => {
                if (currentKeys.has(edgeKey(e.a, e.b))) return
                this.strokeEdge(e, 'main', C.slate, 5, 0.55)
            })
        }

        this.edges.forEach(e => {
            let color = C.madeira
            if (this.reviewMode && p.kind === 'representar') {
                color = expectedKeys.has(edgeKey(e.a, e.b)) ? C.green : C.red
            }
            if (this.isEdgeInRoute(e)) color = C.madeiraMedia
            this.strokeEdge(e, 'main', color, this.isEdgeInRoute(e) ? 11 : 8, 1)
            this.buildEdgeMarker(e)
        })

        if (p.kind === 'isomorfismo') {
            p.altEdges.forEach(e => this.strokeEdge(e, 'alt', C.madeira, 8, 1))
        }

        this.refreshChecklist()
    }

    private strokeEdge(
        e: GraphEdge,
        side: 'main' | 'alt',
        color: number,
        width: number,
        alpha: number,
    ) {
        const a = this.viewOf(e.a, side)
        const b = this.viewOf(e.b, side)
        if (!a || !b) return
        this.edgeLayer.lineStyle(width, color, alpha)
        this.edgeLayer.lineBetween(a.x, a.y, b.x, b.y)
    }

    private buildEdgeMarker(e: GraphEdge) {
        const a = this.viewOf(e.a)
        const b = this.viewOf(e.b)
        if (!a || !b) return

        const mx = (a.x + b.x) / 2
        const my = (a.y + b.y) / 2
        const r = e.weight === undefined ? 12 : 19

        const marker = this.add.container(mx, my)

        const bg = this.add.graphics()
        bg.fillStyle(C.white, 1)
        bg.fillCircle(0, 0, r)
        bg.lineStyle(3, C.madeiraEscura, 1)
        bg.strokeCircle(0, 0, r)
        marker.add(bg)

        if (e.weight !== undefined) {
            marker.add(this.add.text(0, 0, String(e.weight), {
                fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
                fontSize: '17px',
                color: hex(C.madeiraEscura),
            }).setOrigin(0.5).setResolution(2))
        }

        if (this.phase.kind === 'representar' && !this.reviewMode) {
            const touch = Math.max(r + 12, 26)
            const hit = this.add.rectangle(0, 0, touch * 2, touch * 2, C.white, 0.01)
                .setInteractive({ useHandCursor: true })
            marker.add(hit)

            hit.on('pointerdown', () => {
                if (this.locked) return
                this.edges = this.edges.filter(x => edgeKey(x.a, x.b) !== edgeKey(e.a, e.b))
                this.playTone(300, 0.06, 'square', 0.1)
                this.redrawEdges()
            })
        }

        this.markerLayer.add(marker)
    }

    private isEdgeInRoute(e: GraphEdge) {
        if (this.phase.kind !== 'rota' || this.routePath.length < 2) return false
        for (let i = 0; i < this.routePath.length - 1; i++) {
            if (edgeKey(this.routePath[i], this.routePath[i + 1]) === edgeKey(e.a, e.b)) return true
        }
        return false
    }

    private registerPointerHandlers() {
        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (this.dragFrom) {
                this.elasticLayer.clear()
                this.elasticLayer.lineStyle(7, C.amber, 0.9)
                this.elasticLayer.lineBetween(this.dragFrom.x, this.dragFrom.y, pointer.x, pointer.y)
                return
            }
            if (this.draggingNode) {
                this.moveNode(this.draggingNode, pointer.x, pointer.y)
            }
        })

        this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            if (this.dragFrom) this.finishEdgeDrag(pointer)
            if (this.draggingNode) {
                this.paintNode(this.draggingNode.ring, 'idle')
                this.draggingNode = null
            }
        })
    }

    private onNodeDown(view: NodeView) {
        if (this.locked) return
        const kind = this.phase.kind

        if (kind === 'representar') {
            this.dragFrom = view
            this.paintNode(view.ring, 'active')
            this.playTone(620, 0.04, 'sine', 0.08)
            return
        }

        if (kind === 'rota') {
            this.tapRouteNode(view)
            return
        }

        if (kind === 'isomorfismo') {
            this.draggingNode = view
            this.paintNode(view.ring, 'active')
        }
    }

    private moveNode(view: NodeView, x: number, y: number) {
        view.x = Phaser.Math.Clamp(x, 90, W - 90)
        view.y = Phaser.Math.Clamp(y, 165, H - 110)
        view.container.setPosition(view.x, view.y)
        this.redrawEdges()
    }

    private finishEdgeDrag(pointer: Phaser.Input.Pointer) {
        const from = this.dragFrom!
        this.dragFrom = null
        this.elasticLayer.clear()
        this.paintNode(from.ring, 'idle')

        const target = this.nodeViews.find(v =>
            v !== from && Phaser.Math.Distance.Between(pointer.x, pointer.y, v.x, v.y) <= HIT_R
        )
        if (!target) return

        const key = edgeKey(from.def.id, target.def.id)
        if (this.edges.some(e => edgeKey(e.a, e.b) === key)) return

        this.edges.push({ a: from.def.id, b: target.def.id })
        this.playTone(760, 0.07, 'triangle', 0.14)
        this.redrawEdges()
    }

    private tapRouteNode(view: NodeView) {
        const p = this.phase as RoutePhase
        const id = view.def.id

        if (this.routePath.length === 0) {
            if (id !== p.startId) {
                this.flashNode(view)
                this.playTone(220, 0.1, 'square', 0.1)
                return
            }
            this.routePath.push(id)
        } else if (this.routePath.length >= 2 && this.routePath[this.routePath.length - 2] === id) {
            this.routePath.pop()
            this.playTone(380, 0.05, 'sine', 0.09)
            this.refreshRoute()
            return
        } else {
            const last = this.routePath[this.routePath.length - 1]
            if (!this.areNeighbors(last, id) || this.routePath.includes(id)) {
                this.flashNode(view)
                this.playTone(220, 0.1, 'square', 0.1)
                return
            }
            this.routePath.push(id)
        }

        this.playTone(660, 0.06, 'sine', 0.11)
        this.refreshRoute()
    }

    private refreshRoute() {
        this.nodeViews.forEach(v => {
            const inPath = this.routePath.includes(v.def.id)
            this.paintNode(v.ring, inPath ? 'route' : 'idle')
        })
        this.redrawEdges()
        this.costText?.setText(`${this.routeCost()} quadras`)
    }

    private routeCost() {
        let total = 0
        for (let i = 0; i < this.routePath.length - 1; i++) {
            const e = this.edges.find(
                x => edgeKey(x.a, x.b) === edgeKey(this.routePath[i], this.routePath[i + 1])
            )
            total += e?.weight ?? 0
        }
        return total
    }

    private areNeighbors(a: string, b: string) {
        return this.edges.some(e => edgeKey(e.a, e.b) === edgeKey(a, b))
    }

    private shortestCost(start: string, end: string) {
        const dist = new Map<string, number>()
        this.phase.nodes.forEach(n => dist.set(n.id, Infinity))
        dist.set(start, 0)

        const visited = new Set<string>()
        while (visited.size < dist.size) {
            let cur: string | null = null
            let best = Infinity
            dist.forEach((d, id) => {
                if (!visited.has(id) && d < best) {
                    best = d
                    cur = id
                }
            })
            if (cur === null) break
            visited.add(cur)

            this.edges.forEach(e => {
                const from = e.a === cur ? e.a : e.b === cur ? e.b : null
                if (!from) return
                const to = e.a === cur ? e.b : e.a
                const w = e.weight ?? 1
                if (best + w < (dist.get(to) ?? Infinity)) dist.set(to, best + w)
            })
        }

        return dist.get(end) ?? Infinity
    }

    private flashNode(view: NodeView) {
        this.paintNode(view.ring, 'error')
        this.time.delayedCall(280, () => {
            const inPath = this.routePath.includes(view.def.id)
            this.paintNode(view.ring, inPath ? 'route' : 'idle')
        })
    }

    private markEndpoints(p: RoutePhase) {
        this.placeMarker(this.viewOf(p.startId), 'marcador-partida', 'PARTIDA')
        this.placeMarker(this.viewOf(p.endId), 'marcador-chegada', 'CHEGADA')
    }

    private placeMarker(view: NodeView | undefined, key: string, label: string) {
        if (!view) return

        /*
         * O marcador encostou no nó e PERDEU a legenda.
         *
         * Ele ficava em `y - 88` com 72px e um rótulo por cima, ou seja o
         * conjunto subia até `y - 145`: com a fileira de cima em 310, isso
         * batia na faixa PERCURSO, que termina em 172. E o texto era repetição
         * pura — a mesma faixa já mostra "🚩 Casa" e "🏁 Escola", com estes
         * mesmos ícones.
         */
        const size = 64
        const y = view.y - PECA_R - 34

        const glow = this.add.image(view.x, y, key)
            .setDisplaySize(size * 1.32, size * 1.32)
            .setTint(C.white)
            .setAlpha(0.55)
            .setDepth(15)

        const icon = this.add.image(view.x, y, key)
            .setDisplaySize(size, size)
            .setDepth(16)

        void label

        this.tweens.add({
            targets: [glow, icon],
            y: '-=10',
            duration: 1100,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        })

        this.tweens.add({
            targets: glow,
            alpha: 0.15,
            scaleX: glow.scaleX * 1.12,
            scaleY: glow.scaleY * 1.12,
            duration: 900,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        })
    }

    // ─── Route Mission Strip ──────────────────────────────────────────────────
    // Faixa no topo do canvas mostrando os pontos do percurso em ordem:
    // [🚩 Casa] → [📍 Praça] → [🏁 Escola]

    private buildRouteMissionStrip(p: RoutePhase) {
        const stops: Array<{ id: string; role: 'start' | 'pass' | 'end' }> = [
            { id: p.startId, role: 'start' },
            ...(p.mustPass ?? []).map(id => ({ id, role: 'pass' as const })),
            { id: p.endId, role: 'end' },
        ]

        /*
         * ── A FICHA DE PERCURSO MEDE O PRÓPRIO TEXTO ─────────────────────
         *
         * Antes toda ficha tinha 176px fixos, e a faixa inteira era montada a
         * partir desse número. Com "🏁 Sorveteria" dentro, o texto encostava
         * nas bordas; com "🚩 Casa", sobrava metade da ficha vazia. Agora cada
         * ficha é do tamanho do que ela diz, e a letra encolhe se a faixa toda
         * não couber na tela.
         *
         * O subtítulo destas fases foi desligado de propósito (ver `buildPhase`):
         * ele repetia em texto corrido o que estas fichas já mostram, e era a
         * linha que faltava para tudo caber acima do mapa.
         */
        const roleColor: Record<string, number> = { start: C.green, pass: C.amber, end: C.red }
        const roleIcon: Record<string, string> = { start: '🚩', pass: '📍', end: '🏁' }

        const textos = stops.map(st => `${roleIcon[st.role]} ${this.labelOf(st.id)}`)

        let size = BANDA.stripSizes[BANDA.stripSizes.length - 1]
        let widths = textos.map(t => Math.max(BANDA.fichaMin, this.medir(t, size) + BANDA.fichaPadX * 2))
        let innerW = 0

        for (const s2 of BANDA.stripSizes) {
            const w = textos.map(t => Math.max(BANDA.fichaMin, this.medir(t, s2) + BANDA.fichaPadX * 2))
            const total = BANDA.rotuloColW + w.reduce((a, b) => a + b, 0)
                + (stops.length - 1) * BANDA.setaW
            if (total + BANDA.placaPad * 2 <= BANDA.maxLargura) {
                size = s2; widths = w; innerW = total
                break
            }
            size = s2; widths = w; innerW = total
        }

        const CHIP_H = BANDA.fichaH
        const STRIP_Y = this.bandaTop
        const pad = BANDA.placaPad
        const STRIP_H = CHIP_H + pad * 2
        const stripX = W / 2 - (innerW + pad * 2) / 2

        const bg = this.add.graphics().setDepth(12)
        this.paintTabua(bg, stripX, STRIP_Y, innerW + pad * 2, STRIP_H, { r: BANDA.placaR })

        this.add.text(stripX + pad + 6, STRIP_Y + STRIP_H / 2, 'SEU\nPERCURSO', {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: `${BANDA.rotuloSize}px`,
            color: hex(C.latao), stroke: STROKE, strokeThickness: 4,
            align: 'left', lineSpacing: 2,
        }).setOrigin(0, 0.5).setDepth(13).setResolution(2)

        let cx = stripX + pad + BANDA.rotuloColW

        stops.forEach((stop, i) => {
            const color = roleColor[stop.role]
            const cw = widths[i]

            const chipBg = this.add.graphics().setDepth(13)
            const fundo = Phaser.Display.Color.ValueToColor(color).darken(34).color
            chipBg.fillStyle(fundo, 1)
            chipBg.fillRoundedRect(cx, STRIP_Y + pad + 3, cw, CHIP_H, CHIP_H / 2)
            chipBg.fillStyle(color, 1)
            chipBg.fillRoundedRect(cx, STRIP_Y + pad, cw, CHIP_H, CHIP_H / 2)
            chipBg.fillStyle(C.white, 0.18)
            chipBg.fillRoundedRect(cx + 8, STRIP_Y + pad + 5, cw - 16, CHIP_H * 0.28, CHIP_H / 4)
            chipBg.lineStyle(2, C.creme, 0.85)
            chipBg.strokeRoundedRect(cx, STRIP_Y + pad, cw, CHIP_H, CHIP_H / 2)

            this.add.text(cx + cw / 2, STRIP_Y + STRIP_H / 2, textos[i], {
                fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: `${size}px`,
                color: hex(C.creme), stroke: STROKE, strokeThickness: 4,
            }).setOrigin(0.5).setDepth(14).setResolution(2)

            cx += cw

            if (i < stops.length - 1) {
                this.add.text(cx + BANDA.setaW / 2, STRIP_Y + STRIP_H / 2, '→', {
                    fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '20px',
                    color: hex(C.cremeSoft), stroke: STROKE, strokeThickness: 4,
                }).setOrigin(0.5).setDepth(13).setResolution(2)
                cx += BANDA.setaW
            }
        })
    }

    // ─── Must-Pass Node Markers ───────────────────────────────────────────────

    private markMustPassNodes(p: RoutePhase) {
        (p.mustPass ?? []).forEach(id => {
            const view = this.viewOf(id)
            if (!view) return

            // Pulsing amber ring (separate from view.ring used by paintNode)
            const ring = this.add.graphics().setPosition(view.x, view.y).setDepth(13)
            ring.lineStyle(6, C.amber, 1)
            ring.strokeCircle(0, 0, HALO_R + 6)
            this.tweens.add({
                targets: ring, alpha: { from: 0.4, to: 1 },
                duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
            })

            // sem legenda: a faixa PERCURSO já mostra "📍 Praça" em ficha
            // âmbar, e o anel pulsante aqui é da mesma cor
        })
    }

    private buildRouteHud() {
        this.costText = this.add.text(RODAPE.custoX, RODAPE.cy, '0 quadras', {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
            fontSize: '24px',
            color: hex(C.creme),
            stroke: STROKE,
            strokeThickness: 5,
        }).setOrigin(0.5).setDepth(12).setResolution(2)

        this.makeButton(RODAPE.apagarX, RODAPE.cy, RODAPE.apagarW, 50, 'Apagar rota', C.slate, () => {
            if (this.locked) return
            this.routePath = []
            this.playTone(300, 0.06, 'square', 0.1)
            this.refreshRoute()
        })
    }

    /**
     * As quatro opções da consulta.
     *
     * Elas eram centradas em W/2 com 196px cada: quatro botões ocupavam
     * 221..1059, e o Confirmar começava em 930. Os dois se sobrepunham em
     * 129px — dava para tocar num achando que tocava no outro. Agora as opções
     * se centram no que sobra À ESQUERDA do Confirmar, e os dois blocos têm
     * fronteira.
     */
    private buildOptions(p: QueryPhase) {
        const gap = RODAPE.opcaoGap
        const bw = RODAPE.opcaoW
        const bh = RODAPE.opcaoH
        const total = p.options.length * bw + (p.options.length - 1) * gap
        const startX = RODAPE.opcoesCX - total / 2 + bw / 2

        p.options.forEach((opt, i) => {
            const btn = this.makeButton(startX + i * (bw + gap), RODAPE.cy, bw, bh, opt, C.madeiraEscura, () => {
                if (this.locked) return
                this.selectedOption = i
                this.playTone(620, 0.05, 'sine', 0.1)
                this.optionButtons.forEach((b, bi) => {
                    const g = b.getData('bg') as Phaser.GameObjects.Graphics
                    this.paintButton(g, bw, bh, bi === i ? C.amber : C.madeiraEscura)
                })
                this.confirmBtn?.setAlpha(1)
            })
            this.optionButtons.push(btn)
        })
    }

    private buildIsoLabels() {
        // 130..600, e não 150..620: em 620 a linha entrava na barra de baixo,
        // e em 150 ela nascia dentro do rótulo
        const divider = this.add.graphics().setDepth(3)
        divider.lineStyle(3, C.latao, 0.4)
        divider.lineBetween(W / 2, 130, W / 2, 600)

        this.add.text(370, 145, 'DESENHO A', {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '17px', color: hex(C.latao),
        }).setOrigin(0.5).setDepth(6).setResolution(2)

        this.add.text(930, 145, 'DESENHO B', {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '17px', color: hex(C.cremeSoft),
        }).setOrigin(0.5).setDepth(6).setResolution(2)
    }

    private buildIsoButtons(p: IsomorphismPhase) {
        this.makeButton(400, RODAPE.cy, 300, 56, 'São o mesmo grafo', C.madeira, () => {
            if (this.locked) return
            this.resolveIsomorphism(p, true)
        })
        this.makeButton(760, RODAPE.cy, 300, 56, 'São diferentes', C.madeiraMedia, () => {
            if (this.locked) return
            this.resolveIsomorphism(p, false)
        })
    }

    private buildConfirm(label: string, onClick: () => void) {
        this.confirmBtn = this.makeButton(
            RODAPE.confirmX, RODAPE.cy, RODAPE.confirmW, RODAPE.confirmH,
            label, C.green, () => {
            if (this.locked) return
            onClick()
        })
        if (this.phase.kind === 'consulta') this.confirmBtn.setAlpha(0.4)
    }

    private confirmRepresent() {
        const p = this.phase as RepresentPhase
        const expected = new Set(p.edges.map(e => edgeKey(e.a, e.b)))
        const current = new Set(this.edges.map(e => edgeKey(e.a, e.b)))

        const missing = [...expected].filter(k => !current.has(k)).length
        const extra = [...current].filter(k => !expected.has(k)).length
        const ok = missing === 0 && extra === 0

        if (ok) {
            this.resolve(true, 'Isso mesmo! Todas as ligações estão certas.')
            return
        }

        this.reviewMode = true
        this.redrawEdges()

        const parts: string[] = []
        if (missing) parts.push(`${missing} ligação${missing > 1 ? 'ões' : ''} faltando (em cinza)`)
        if (extra) parts.push(`${extra} ligação${extra > 1 ? 'ões' : ''} a mais (em vermelho)`)

        this.resolve(false, `${parts.join(' e ')}. ${p.rule}`)
    }

    private confirmRoute() {
        const p = this.phase as RoutePhase
        const path = this.routePath

        if (path.length < 2 || path[path.length - 1] !== p.endId) {
            this.resolve(false, `A rota precisa terminar em ${this.labelOf(p.endId)}.`)
            return
        }

        if (p.mustPass?.some(id => !path.includes(id))) {
            this.resolve(false, `Faltou passar em ${p.mustPass.map(id => this.labelOf(id)).join(' e ')}. ${p.explanation}`)
            return
        }

        if (p.requireOptimal) {
            const best = this.shortestCost(p.startId, p.endId)
            const cost = this.routeCost()
            if (cost > best) {
                this.resolve(false, `Sua rota deu ${cost} quadras, mas existe uma com ${best}. ${p.explanation}`)
                return
            }
        }

        this.resolve(true, `Rota completa: ${this.routeCost()} quadras. ${p.explanation}`)
    }

    private confirmQuery() {
        const p = this.phase as QueryPhase
        if (this.selectedOption < 0) return
        const ok = this.selectedOption === p.correctIndex
        this.resolve(ok, ok ? p.explanation : `A resposta certa é ${p.options[p.correctIndex]}. ${p.explanation}`)
    }

    private resolveIsomorphism(p: IsomorphismPhase, answer: boolean) {
        this.resolve(answer === p.sameGraph, p.explanation)
    }

    private resolve(correct: boolean, message: string) {
        this.locked = true
        this.stopTimer()

        if (correct) {
            this.points += 10
            this.playSuccess()
            runtimeGameBridge.emit({
                type: 'CORRECT_ANSWER', gameId: GAME_ID,
                pointsEarned: 10, stage: this.level.level,
            })
        } else {
            this.points = Math.max(0, this.points - 3)
            this.playError()
            this.cameras.main.shake(140, 0.005)
            runtimeGameBridge.emit({
                type: 'WRONG_ANSWER', gameId: GAME_ID,
                pointsEarned: -3, stage: this.level.level,
            })
                this.lives.lose(); this.livesLeft = this.lives.remaining
        }

        this.emitCheckpoint()
        this.showFeedback(correct, message)
    }

    private showFeedback(correct: boolean, message: string) {
        const overlay = this.add.rectangle(W / 2, H / 2, W, H, C.ink, 0.7)
            .setDepth(300).setInteractive()
        const panel = this.add.container(W / 2, H / 2).setDepth(301)

        const text = this.add.text(0, 0, message, {
            fontFamily: 'DynaPuff, Arial, sans-serif',
            fontStyle: 'bold',
            fontSize: '19px',
            color: hex(C.ink),
            align: 'center',
            wordWrap: { width: 520 },
        }).setOrigin(0.5).setResolution(2)

        const title = this.add.text(0, 0, correct ? 'Muito bem!' : 'Quase lá!', {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
            fontSize: '32px',
            color: correct ? hex(C.green) : hex(C.red),
        }).setOrigin(0.5).setResolution(2)

        const PH = 200 + text.height
        title.setY(-PH / 2 + 58)
        text.setY(-PH / 2 + 58 + 34 + text.height / 2)

        const bg = this.add.graphics()
        bg.fillStyle(C.ink, 0.22)
        bg.fillRoundedRect(-286, -PH / 2 + 8, 572, PH, 26)
        bg.fillStyle(C.creme, 0.99)
        bg.fillRoundedRect(-292, -PH / 2, 572, PH, 26)
        bg.fillStyle(correct ? C.green : C.red, 1)
        bg.fillRoundedRect(-292, -PH / 2, 572, 12, { tl: 26, tr: 26, bl: 0, br: 0 })

        const btn = this.makeButton(0, PH / 2 - 48, 260, 52,
            correct ? 'Continuar' : 'Tentar de novo',
            correct ? C.green : C.madeira,
            () => {
                overlay.destroy()
                panel.destroy()
                if (correct) this.completePhase()
                else this.retryPhase()
            })
        btn.setDepth(302)

        panel.add([bg, title, text, btn])
        panel.setScale(0.9).setAlpha(0)
        this.tweens.add({ targets: panel, alpha: 1, scale: 1, duration: 240, ease: 'Back.easeOut' })
    }

    private retryPhase() {
        this.scene.restart({ lives: this.livesLeft, level: this.level.level, phase: this.phaseIdx, points: this.points })
    }

    private completePhase() {
        const isLastPhase = this.phaseIdx + 1 >= this.level.phases.length
        const isLastLevel = this.levelIdx + 1 >= LEVELS.length

        if (!isLastPhase) {
            this.scene.restart({ lives: this.livesLeft, level: this.level.level, phase: this.phaseIdx + 1, points: this.points })
            return
        }

        if (!isLastLevel) {
            runtimeGameBridge.emit({ type: 'GAME_COMPLETED', gameId: GAME_ID, stage: this.level.level, totalStages: LEVELS.length })
            showLevelComplete(this, {
                subtitle: `Nível ${this.level.level} concluído`,
                message: LEVELS[this.levelIdx + 1].objective,
                accent: C.madeira,
                overlayColor: C.ink,
                titleColor: hex(C.madeiraEscura),
                subtitleColor: hex(C.madeira),
                progress: { total: LEVELS.length, current: this.level.level },
                autoAdvance: {
                    delay: 2300,
                    onComplete: () => this.scene.restart({ lives: this.livesLeft, 
                        level: this.level.level + 1,
                        phase: 0,
                        points: this.points,
                    }),
                },
            })
            return
        }

        this.ended = true
        /*
         * `FINISH_GAME` não existe no contrato de eventos: a linha que o
         * emitia era ignorada em silêncio pela plataforma. Quem fecha o jogo é
         * `GAME_COMPLETED`, e ele já está aqui.
         */
        runtimeGameBridge.emit({ type: 'GAME_COMPLETED', gameId: GAME_ID, stage: this.level.level, totalStages: LEVELS.length })

        showLevelComplete(this, {
            title: 'Jogo concluído!',
            subtitle: 'Você já sabe ler e montar grafos',
            accent: C.madeira,
            overlayColor: C.ink,
            titleColor: hex(C.madeiraEscura),
            subtitleColor: hex(C.madeira),
            progress: { total: LEVELS.length, current: LEVELS.length },
            buttons: [
                { label: 'Jogar novamente', color: C.green, onClick: () => this.scene.restart({ lives: this.livesLeft, level: 1, phase: 0, points: 0 }) },
                { label: 'Outros jogos', color: C.madeiraMedia, onClick: () => EventBus.emit('exit-game') },
            ],
        })
    }

    private onTimeUp() {
        if (this.ended || this.locked) return
        this.ended = true
        this.locked = true

        runtimeGameBridge.emit({
            type: 'WRONG_ANSWER', gameId: GAME_ID,
            pointsEarned: -3, stage: this.level.level,
        })
            this.lives.lose(); this.livesLeft = this.lives.remaining
        runtimeGameBridge.emit({ type: 'GAME_OVER', gameId: GAME_ID, stage: this.level.level })

        this.playError()
        this.showFeedback(false, 'O tempo acabou! Vamos tentar esta fase de novo.')
    }

    private emitCheckpoint() {
        const done = this.levelIdx * 4 + this.phaseIdx
        runtimeGameBridge.emit({
            type: 'CHECKPOINT',
            gameId: GAME_ID,
            stage: this.level.level,
            progress: Math.round((done / (LEVELS.length * 4)) * 100),
            score: this.points,
        })
    }

    private showLevelIntro(onStart: () => void) {
        const overlay = this.add.rectangle(W / 2, H / 2, W, H, C.ink, 0.86)
            .setDepth(500).setInteractive()
        const panel = this.add.container(W / 2, H / 2).setDepth(501)

        const PW = 640
        const PH = 400

        const bg = this.add.graphics()
        bg.fillStyle(C.ink, 0.25)
        bg.fillRoundedRect(-PW / 2 + 6, -PH / 2 + 8, PW, PH, 28)
        bg.fillStyle(C.creme, 0.99)
        bg.fillRoundedRect(-PW / 2, -PH / 2, PW, PH, 28)
        bg.fillStyle(C.madeira, 1)
        bg.fillRoundedRect(-PW / 2, -PH / 2, PW, 72, { tl: 28, tr: 28, bl: 0, br: 0 })

        const badge = this.add.text(0, -PH / 2 + 36, `NÍVEL ${this.level.level} DE ${LEVELS.length}`, {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '23px', color: hex(C.creme),
        }).setOrigin(0.5).setResolution(2)

        const title = this.add.text(0, -PH / 2 + 120, this.level.title, {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '31px', color: hex(C.ink),
            align: 'center', wordWrap: { width: PW - 90 },
        }).setOrigin(0.5).setResolution(2)

        const objective = this.add.text(0, -PH / 2 + 190, this.level.objective, {
            fontFamily: 'DynaPuff, Arial, sans-serif', fontStyle: 'bold', fontSize: '19px', color: hex(C.ink),
            align: 'center', wordWrap: { width: PW - 110 },
        }).setOrigin(0.5).setResolution(2)

        const phaseLabel = this.add.text(0, 56, `${this.level.phases.length} fases neste nível`, {
            fontFamily: 'DynaPuff, Arial, sans-serif', fontStyle: 'bold', fontSize: '15px', color: hex(C.dim),
        }).setOrigin(0.5).setResolution(2)

        const dots = this.add.graphics()
        const gap = 30
        const startX = -((this.level.phases.length - 1) * gap) / 2
        this.level.phases.forEach((_, i) => {
            dots.fillStyle(i === 0 ? C.madeira : C.cremeSoft, 1)
            dots.fillCircle(startX + i * gap, 90, 9)
        })

        const btn = this.makeButton(0, 152, 280, 56, 'Começar', C.madeira, () => {
            this.tweens.add({
                targets: [overlay, panel], alpha: 0, duration: 250,
                onComplete: () => { overlay.destroy(); panel.destroy(); onStart() },
            })
        })

        panel.add([bg, badge, title, objective, phaseLabel, dots, btn])
        panel.setScale(0.9).setAlpha(0)
        this.tweens.add({ targets: panel, alpha: 1, scale: 1, duration: 280, ease: 'Back.easeOut' })
    }

    private runTutorials(onDone: () => void, forced = false) {
        if (this.tutorialOpen) { onDone(); return }

        const queue: Array<{ key: string; steps: TutorialStep[] }> = []
        const p = this.phase
        const first = this.nodeViews[0]
        const second = this.nodeViews[1]

        if (this.level.level === 1 && this.phaseIdx === 0) {
            queue.push({
                key: 'mapas-l1',
                steps: [
                    {
                        text: 'Cada bolinha é um lugar do bairro. Esta aqui é a primeira delas.',
                        shape: 'circle', x: first?.x ?? 400, y: first?.y ?? 300, w: 200, h: 200,
                    },
                    {
                        text: 'Esta lista diz quais lugares têm rua direta entre eles. É o seu roteiro.',
                        shape: 'rect',
                        x: BANDA.trilhoX + BANDA.trilhoW / 2, y: BANDA.comSub + 170,
                        w: BANDA.trilhoW + 40, h: 380, balloonX: 640, balloonY: 430,
                    },
                    {
                        text: 'Encoste o dedo numa bolinha e arraste até a outra sem soltar. A linha aparece quando você chega.',
                        shape: 'rect',
                        x: ((first?.x ?? 400) + (second?.x ?? 700)) / 2,
                        y: ((first?.y ?? 300) + (second?.y ?? 480)) / 2,
                        w: Math.abs((second?.x ?? 700) - (first?.x ?? 400)) + 230,
                        h: Math.abs((second?.y ?? 480) - (first?.y ?? 300)) + 230,
                        balloonY: 600,
                        pointer: first && second
                            ? { fromX: first.x, fromY: first.y, toX: second.x, toY: second.y }
                            : undefined,
                    },
                    {
                        text: 'Cada rua desenhada marca um item da lista com um sinal verde.',
                        shape: 'rect',
                        x: BANDA.trilhoX + BANDA.trilhoW / 2, y: BANDA.comSub + 170,
                        w: BANDA.trilhoW + 40, h: 380, balloonX: 640, balloonY: 430,
                    },
                    {
                        text: 'Desenhou errado? Toque na bolinha branca no meio da linha para apagá-la.',
                        shape: 'none', balloonY: 400,
                    },
                    {
                        text: 'Com a lista toda marcada, toque em Confirmar ligações.',
                        shape: 'rect', x: RODAPE.confirmX, y: BAR_Y, w: RODAPE.confirmW + 60, h: 100,
                    },
                ],
            })
        }

        if (this.level.level === 2 && this.phaseIdx === 0) {
            queue.push({
                key: 'mapas-l2',
                steps: [
                    {
                        text: 'Agora as ruas já vêm desenhadas. Seu trabalho é escolher por onde andar.',
                        shape: 'rect', x: W / 2, y: 390, w: 1000, h: 420,
                    },
                    {
                        text: 'O número dentro de cada bolinha branca é quantas quadras aquela rua tem.',
                        shape: 'rect', x: W / 2, y: 390, w: 1000, h: 420, balloonY: 620,
                    },
                    {
                        text: 'Estes dois marcadores mostram onde a rota começa e onde ela precisa terminar.',
                        shape: 'rect', x: W / 2, y: 300, w: 1000, h: 300, balloonY: 620,
                    },
                    {
                        text: 'Toque nas bolinhas em ordem, uma vizinha da outra. Tocar na anterior desfaz o último passo.',
                        shape: 'rect', x: W / 2, y: 390, w: 1000, h: 420,
                    },
                    {
                        text: 'Aqui embaixo aparece o total de quadras da sua rota, somando enquanto você anda.',
                        shape: 'rect', x: 300, y: BAR_Y, w: 460, h: 100,
                    },
                ],
            })
        }

        if (this.level.level === 3 && this.phaseIdx === 0) {
            queue.push({
                key: 'mapas-l3',
                steps: [
                    {
                        text: 'Neste nível cada fase pede uma coisa diferente. Leia a frase do topo antes de começar.',
                        shape: 'rect', x: HUD.instrCX, y: HUD.cy, w: HUD.instrW + 40, h: 76, balloonY: 400,
                    },
                    {
                        text: 'Às vezes o desenho é um bairro, às vezes são amizades. O jeito de ler é o mesmo: quem liga com quem.',
                        shape: 'none', balloonY: 400,
                    },
                    {
                        text: 'Esta barra é o tempo. Quando ela esvaziar, a fase recomeça — sem pressa, dá para tentar quantas vezes quiser.',
                        shape: 'rect',
                        x: HUD.barCX + HUD.barIconDX / 2, y: HUD.cy,
                        w: HUD.barW + 120, h: 60, balloonY: 400,
                    },
                ],
            })
        }

        if (p.kind === 'consulta') {
            queue.push({
                key: 'mapas-consulta',
                steps: [
                    {
                        text: 'Aqui cada bolinha é uma pessoa e cada linha é uma amizade entre duas delas.',
                        shape: 'rect', x: W / 2, y: 390, w: 1000, h: 420,
                    },
                    {
                        text: 'Siga as linhas com o dedo para descobrir quem é amigo de quem. Nada aqui se arrasta.',
                        shape: 'rect', x: W / 2, y: 390, w: 1000, h: 420, balloonY: 620,
                    },
                    {
                        text: 'Toque na resposta que você acha certa e depois em Confirmar.',
                        shape: 'rect', x: W / 2, y: BAR_Y, w: 1180, h: 100,
                    },
                ],
            })
        }

        if (p.kind === 'isomorfismo') {
            queue.push({
                key: 'mapas-isomorfismo',
                steps: [
                    {
                        text: 'São dois desenhos: o A à esquerda e o B à direita.',
                        shape: 'rect', x: W / 2, y: 380, w: 1160, h: 480,
                    },
                    {
                        text: 'Arraste as bolinhas para onde quiser. Mexer uma de lugar não muda com quem ela se liga.',
                        shape: 'rect', x: W / 2, y: 380, w: 1160, h: 480, balloonY: 640,
                    },
                    {
                        text: 'Compare pessoa por pessoa: se cada uma tem os mesmos amigos nos dois lados, é o mesmo grafo.',
                        shape: 'none', balloonY: 400,
                    },
                ],
            })
        }

        if (!queue.length && forced) {
            const resumo =
                p.kind === 'representar'
                    ? 'Arraste de uma bolinha até a outra para criar cada ligação da lista do topo. Toque na bolinha do meio de uma linha para apagá-la.'
                    : p.kind === 'rota'
                        ? 'Toque nas bolinhas em ordem, sempre em uma vizinha da anterior. O total de quadras aparece embaixo.'
                        : p.kind === 'consulta'
                            ? 'Siga as linhas para descobrir quem liga com quem, escolha a resposta e confirme.'
                            : 'Arraste as bolinhas para comparar os dois desenhos. O que importa é com quem cada uma se liga.'

            queue.push({
                key: `mapas-ajuda-l${this.level.level}-f${this.phaseIdx}`,
                steps: [{ text: resumo, shape: 'none', balloonY: 400, buttonLabel: 'Entendi!' }],
            })
        }

        if (!queue.length) { onDone(); return }

        this.tutorialOpen = true
        const wasLocked = this.locked
        this.locked = true

        const next = (i: number) => {
            if (i >= queue.length) {
                this.tutorialOpen = false
                this.locked = wasLocked
                if (!this.tutorialSeen) {
                    this.tutorialSeen = true
                    this.showHelpButton()
                }
                onDone()
                return
            }
            createTutorial(this, {
                key: queue[i].key,
                accent: C.madeira,
                safeTop: 130,
                once: false,
                onFinish: () => next(i + 1),
                steps: queue[i].steps,
            })
        }

        next(0)
    }

    /**
     * A TÁBUA — o único desenho de fundo deste jogo.
     *
     * Header, faixa de tarefa e rodapé são a mesma peça em tamanhos
     * diferentes: madeira escura, veio mais claro em cima, e uma linha de
     * latão fechando por baixo. Ter um painter só é o que faz as três coisas
     * parecerem o mesmo móvel em vez de três caixas que por acaso são marrons.
     */
    private paintTabua(
        g: Phaser.GameObjects.Graphics,
        x: number, y: number, w: number, h: number,
        { r = 0, sombra = true } = {},
    ) {
        if (sombra) {
            g.fillStyle(C.ink, 0.3)
            g.fillRoundedRect(x + 3, y + 5, w, h, r)
        }
        g.fillStyle(C.painel, 0.96)
        g.fillRoundedRect(x, y, w, h, r)
        // o veio de cima: uma tábua tem luz na quina superior
        g.fillStyle(C.madeiraMedia, 0.5)
        g.fillRoundedRect(x + 4, y + 4, w - 8, Math.min(14, h * 0.22), r ? r / 2 : 0)
        g.lineStyle(3, C.latao, 0.8)
        g.strokeRoundedRect(x, y, w, h, r)
    }

    private paintButton(g: Phaser.GameObjects.Graphics, w: number, h: number, color: number) {
        const fundo = Phaser.Display.Color.ValueToColor(color).darken(34).color
        g.clear()
        // a base escura que aparece por baixo dá o volume de peça entalhada
        g.fillStyle(fundo, 1)
        g.fillRoundedRect(-w / 2, -h / 2 + 4, w, h, h / 2)
        g.fillStyle(color, 1)
        g.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
        g.fillStyle(C.white, 0.2)
        g.fillRoundedRect(-w / 2 + 8, -h / 2 + 6, w - 16, h * 0.28, h / 4)
        g.lineStyle(3, C.creme, 0.85)
        g.strokeRoundedRect(-w / 2, -h / 2, w, h, h / 2)
    }

    /* ═══════════════════════════════════════════════════════════ o HUD */

    /**
     * TUDO QUE É INTERFACE DESENHADA MORA AQUI.
     *
     * Havia uma `UIScene` separada só para o topo: ela desenhava a faixa, o
     * nível, o enunciado e o relógio, e conversava com esta cena por
     * `registry.set('hud', ...)` e por três eventos de `EventBus`
     * (`timer-start`, `timer-stop`, `timer-end`). Três canais de mensagem para
     * mover números entre duas cenas que sempre viveram juntas — e um bug de
     * posição no topo obrigava a abrir dois arquivos para entender uma tela.
     *
     * Agora é uma cena só, como nos outros jogos recriados: o HUD é um
     * container desta cena, o relógio é um objeto desta cena, e `publishHud`
     * escreve direto nos textos em vez de despachar um evento.
     */
    private buildHud() {
        this.hudLayer = this.add.container(0, 0).setDepth(60)

        const tabua = this.add.graphics()
        this.paintTabua(tabua, -10, -10, W + 20, HUD.h + 10, { sombra: false })
        this.hudLayer.add(tabua)

        // a pílula do nível: uma plaquinha de madeira clara parafusada na faixa
        const pill = this.add.graphics()
        pill.fillStyle(C.madeiraEscura, 1)
        pill.fillRoundedRect(HUD.pillX, HUD.pillY + 3, HUD.pillW, HUD.pillH, HUD.pillH / 2)
        pill.fillStyle(C.madeira, 1)
        pill.fillRoundedRect(HUD.pillX, HUD.pillY, HUD.pillW, HUD.pillH, HUD.pillH / 2)
        pill.fillStyle(C.white, 0.2)
        pill.fillRoundedRect(HUD.pillX + 9, HUD.pillY + 5, HUD.pillW - 18, 11, 6)
        this.hudLayer.add(pill)

        this.levelText = this.add.text(
            HUD.pillX + HUD.pillW / 2, HUD.pillY + HUD.pillH / 2, '', {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '16px',
            color: hex(C.creme), stroke: STROKE, strokeThickness: 3,
        }).setOrigin(0.5).setResolution(2)
        this.hudLayer.add(this.levelText)

        this.dots = this.add.graphics()
        this.hudLayer.add(this.dots)

        this.instructionText = this.add.text(HUD.instrCX, HUD.cy, '', {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
            fontSize: `${HUD.instrSizes[0]}px`,
            color: hex(C.creme), stroke: STROKE, strokeThickness: 5,
            align: 'center', wordWrap: { width: HUD.instrW },
        }).setOrigin(0.5).setResolution(2)
        this.hudLayer.add(this.instructionText)

        this.subText = this.add.text(W / 2, SUB.y, '', {
            fontFamily: 'DynaPuff, Arial, sans-serif', fontStyle: 'bold',
            fontSize: `${SUB.sizes[0]}px`,
            color: hex(C.creme), stroke: STROKE, strokeThickness: 5,
            align: 'center', wordWrap: { width: SUB.w },
        }).setOrigin(0.5).setDepth(19).setResolution(2)

        /*
         * ── A BARRA DE TEMPO, COM AS TRÊS CORES ──────────────────────────
         *
         * Verde cheia, amarela na metade, vermelha e PISCANDO abaixo de um
         * quarto. As fronteiras (`warnAt: 0.5`, `dangerAt: 0.25`) e as cores
         * vivem em `data/theme.ts`, junto do resto da paleta; o pulso é do
         * próprio componente e liga sozinho ao entrar na faixa vermelha.
         */
        this.tempo = createTimeBar(this, {
            cx: HUD.barCX, cy: HUD.cy, w: HUD.barW, h: HUD.barH,
            duration: 60_000,
            iconDX: HUD.barIconDX,
            iconR: HUD.barIconR,
            warnAt: BARRA.warnAt,
            dangerAt: BARRA.dangerAt,
            theme: BARRA.theme,
            onEmpty: () => this.onTimeUp(),
        })
        this.tempo.setRunning(false)
        this.tempo.container.setVisible(false)
        this.hudLayer.add(this.tempo.container)

        this.helpBtn = this.buildHelpButton(HUD.helpX, HUD.cy)
        this.helpBtn.setVisible(false)
        this.hudLayer.add(this.helpBtn)
    }

    private showHelpButton() {
        if (!this.helpBtn || this.helpBtn.visible) return
        this.helpBtn.setVisible(true).setAlpha(0)
        this.tweens.add({ targets: this.helpBtn, alpha: 1, duration: 260 })
    }

    /** Encolhe o texto até caber em `maxLinhas`, em vez de quebrar linha. */
    private caberEm(
        t: Phaser.GameObjects.Text, str: string,
        sizes: number[], maxLinhas: number,
    ) {
        for (let i = 0; i < sizes.length; i += 1) {
            t.setFontSize(sizes[i])
            t.setText(str)
            if (t.getWrappedText(str).length <= maxLinhas) return
        }
    }

    /**
     * As fases são BOLINHAS, e não "Fase 2 de 4".
     *
     * Quatro pontinhos dizem a mesma coisa que sete palavras e liberam a linha
     * onde o texto do nível ficava espremido contra o enunciado.
     */
    private paintDots(phase: number, total: number) {
        this.dots.clear()
        for (let i = 0; i < total; i += 1) {
            const x = HUD.dotsX + i * HUD.dotGap
            const feito = i < phase - 1
            const atual = i === phase - 1
            if (atual) {
                this.dots.fillStyle(C.latao, 1)
                this.dots.fillRoundedRect(x - 10, HUD.cy - HUD.dotR, 20, HUD.dotR * 2, HUD.dotR)
            } else {
                this.dots.fillStyle(feito ? C.green : C.creme, feito ? 1 : 0.24)
                this.dots.fillCircle(x, HUD.cy, HUD.dotR)
            }
        }
    }

    private buildHelpButton(x: number, y: number) {
        const s = HUD.helpS
        const box = this.add.container(0, 0)
        const g = this.add.graphics()

        const paint = (hover: boolean) => {
            g.clear()
            g.fillStyle(C.madeiraEscura, 1)
            g.fillRoundedRect(x - s / 2, y - s / 2 + 4, s, s, 16)
            g.fillStyle(hover ? C.madeira : C.madeiraMedia, 1)
            g.fillRoundedRect(x - s / 2, y - s / 2, s, s, 16)
            g.fillStyle(C.white, 0.18)
            g.fillRoundedRect(x - s / 2 + 5, y - s / 2 + 4, s - 10, s * 0.3, 9)
            g.lineStyle(3, C.latao, 0.95)
            g.strokeRoundedRect(x - s / 2, y - s / 2, s, s, 16)
        }
        paint(false)

        const text = this.add.text(x, y, '?', {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '26px',
            color: hex(C.creme), stroke: STROKE, strokeThickness: 5,
        }).setOrigin(0.5).setResolution(2)

        const zone = this.add.zone(x, y, s + 10, s + 10)
            .setInteractive({ useHandCursor: true })

        zone.on('pointerover', () => paint(true))
        zone.on('pointerout', () => paint(false))
        zone.on('pointerdown', () => {
            paint(true)
            this.tweens.add({ targets: text, scale: 0.88, duration: 70, yoyo: true })
            this.runTutorials(() => { }, true)
        })
        zone.on('pointerup', () => paint(false))

        box.add([g, text, zone])
        return box
    }

    private publishHud() {
        this.caberEm(this.instructionText, this.phase.instruction,
            HUD.instrSizes, HUD.instrMaxLinhas)
        this.caberEm(this.subText, this.hudSub ?? '', SUB.sizes, SUB.maxLinhas)
        this.levelText.setText(`NÍVEL ${this.level.level}`)
        this.paintDots(this.phaseIdx + 1, this.level.phases.length)
    }

    /** O relógio anda sozinho enquanto a fase está de pé. */
    update(_time: number, delta: number) {
        this.tempo?.tick(delta)
    }

    /**
     * O relógio existe em TODOS os níveis agora.
     *
     * Antes só o Nível 3 declarava `timeLimit`, então nos Níveis 1 e 2 a barra
     * simplesmente não aparecia — o jogo "não tinha contagem de tempo". O
     * desfecho de zerar já existia e continua o mesmo: `onTimeUp` devolve a
     * fase para ser refeita, e não o nível inteiro.
     */
    private startTimer() {
        if (!this.level.timeLimit) return
        this.tempo.container.setVisible(true)
        this.tempo.reset(this.level.timeLimit * 1000)
        this.tempo.setRunning(true)
    }

    private stopTimer() {
        this.tempo?.setRunning(false)
    }

    private makeButton(
        x: number, y: number, w: number, h: number,
        label: string, color: number, onClick: () => void,
    ) {
        const btn = this.add.container(x, y).setDepth(20)
        const g = this.add.graphics()
        this.paintButton(g, w, h, color)

        const text = this.add.text(0, 0, label, {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
            fontSize: '18px',
            color: hex(C.creme),
            align: 'center',
            wordWrap: { width: w - 24 },
        }).setOrigin(0.5).setResolution(2)

        btn.add([g, text])
        btn.setData('bg', g)
        btn.setSize(w, h)
        btn.setInteractive({ useHandCursor: true })
        btn.on('pointerdown', () => {
            this.tweens.add({ targets: btn, scale: 0.95, duration: 70, yoyo: true })
            onClick()
        })
        return btn
    }

    private playTone(freq: number, dur: number, type: OscillatorType = 'sine', gain = 0.2) {
        const ctx = (this.sound as Phaser.Sound.WebAudioSoundManager).context
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

    private playSuccess() {
        this.playTone(523, 0.1, 'sine', 0.2)
        this.time.delayedCall(100, () => this.playTone(659, 0.1, 'sine', 0.2))
        this.time.delayedCall(200, () => this.playTone(784, 0.18, 'sine', 0.22))
    }

    private playError() {
        this.playTone(311, 0.16, 'square', 0.15)
        this.time.delayedCall(140, () => this.playTone(233, 0.24, 'square', 0.13))
    }
}