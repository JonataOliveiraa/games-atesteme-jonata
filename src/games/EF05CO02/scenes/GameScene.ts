import Phaser from 'phaser'
import { runtimeGameBridge } from '../../../shared/bridge/runtimeGameBridge'
import { EventBus } from '../../../shared/EventBus'
import { createTutorial, type TutorialStep } from '../../../shared/tutorial/createTutorial'
import { showLevelComplete } from '../../../shared/level/showLevelComplete'
import { LEVELS } from '../data/levels'
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

const GAME_ID = 'mapas-em-rede'

const W = 1280
const H = 720
const NODE_R = 42
const LABEL_DY = 64
const HIT_R = 54

const TASK_Y = 132
const BAR_Y = 664
const BAR_TOP = 618

const C = {
    blue: 0x3b82f6,
    blueDark: 0x1e3a8a,
    purple: 0x8b5cf6,
    white: 0xffffff,
    ink: 0x0f172a,
    green: 0x22c55e,
    red: 0xef4444,
    amber: 0xf59e0b,
    slate: 0x94a3b8,
}

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
    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; phase?: number; points?: number }) {
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
        this.buildPhase()
        this.registerPointerHandlers()
        this.publishHud()

        EventBus.on('timer-end', () => this.onTimeUp(), this)
        EventBus.on('show-tutorial', () => this.runTutorials(() => { }, true), this)

        this.events.once('shutdown', () => {
            EventBus.off('timer-end', undefined, this)
            EventBus.off('show-tutorial', undefined, this)
            EventBus.emit('timer-stop')
        })

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID, stage: this.level.level })
        this.emitCheckpoint()

        if (this.phaseIdx > 0) EventBus.emit('tutorial-ready')

        if (this.phaseIdx === 0) {
            this.showLevelIntro(() => this.runTutorials(() => this.startPhase()))
        } else {
            this.runTutorials(() => this.startPhase())
        }
    }

    private startPhase() {
        this.locked = false
        if (this.level.timeLimit) this.startTimer()
    }

    private drawBackground() {
        const key = this.phase.context === 'mapa' ? 'bg-bairro' : 'bg-rede'
        this.add.image(W / 2, H / 2, key).setDisplaySize(W, H).setDepth(-2)

        const veil = this.add.graphics().setDepth(-1)
        veil.fillStyle(0x0f2547, this.phase.context === 'mapa' ? 0.05 : 0.28)
        veil.fillRect(0, 0, W, H)

        const bar = this.add.graphics().setDepth(1)
        bar.fillStyle(C.ink, 0.82)
        bar.fillRect(0, BAR_TOP, W, H - BAR_TOP)
        bar.fillStyle(C.blue, 0.9)
        bar.fillRect(0, BAR_TOP, W, 4)

        this.edgeLayer = this.add.graphics().setDepth(8)
        this.elasticLayer = this.add.graphics().setDepth(9)
        this.markerLayer = this.add.container(0, 0).setDepth(16)
        this.taskLayer = this.add.container(0, 0).setDepth(18)
    }

    private buildChecklist() {
        const p = this.phase
        if (p.kind !== 'representar') return

        const pairs = p.edges
        const chipH = 40
        const gap = 10
        const pad = 18

        const widths = pairs.map(e => {
            const t = `${this.labelOf(e.a)} — ${this.labelOf(e.b)}`
            return Math.max(150, t.length * 9.5 + 62)
        })

        const rows: number[][] = [[]]
        let acc = 0
        widths.forEach((w, i) => {
            if (acc + w + gap > W - 80 && rows[rows.length - 1].length) {
                rows.push([])
                acc = 0
            }
            rows[rows.length - 1].push(i)
            acc += w + gap
        })

        this.taskLayer.add(
            this.add.text(W / 2, TASK_Y - 20, 'LIGUE ESTES PARES', {
                fontFamily: 'Arial Black, Arial', fontSize: '20px',
                color: '#93c5fd', stroke: '#0f2547', strokeThickness: 4,
            }).setOrigin(0.5).setResolution(2),
        )

        rows.forEach((row, ri) => {
            const total = row.reduce((s, i) => s + widths[i], 0) + (row.length - 1) * gap
            let x = W / 2 - total / 2
            const y = TASK_Y + ri * (chipH + gap)

            row.forEach(i => {
                const e = pairs[i]
                const w = widths[i]

                const g = this.add.graphics()
                const check = this.add.graphics()

                const label = this.add.text(
                    x + pad + 26, y + chipH / 2,
                    `${this.labelOf(e.a)} — ${this.labelOf(e.b)}`, {
                    fontFamily: 'Arial Black, Arial', fontSize: '16px',
                    color: '#ffffff', stroke: '#0f2547', strokeThickness: 4,
                }).setOrigin(0, 0.5).setResolution(2)

                g.setData('rect', { x, y, w, h: chipH })
                check.setData('cx', x + pad + 6)
                check.setData('cy', y + chipH / 2)

                this.taskLayer.add([g, check, label])
                this.taskChips.push({ key: edgeKey(e.a, e.b), g, check })

                x += w + gap
            })
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

            chip.g.clear()
            chip.g.fillStyle(C.ink, 0.7)
            chip.g.fillRoundedRect(r.x, r.y, r.w, r.h, r.h / 2)
            chip.g.lineStyle(3, done ? C.green : C.slate, done ? 1 : 0.7)
            chip.g.strokeRoundedRect(r.x, r.y, r.w, r.h, r.h / 2)

            const cx = chip.check.getData('cx') as number
            const cy = chip.check.getData('cy') as number

            chip.check.clear()
            chip.check.fillStyle(done ? C.green : C.slate, done ? 1 : 0.35)
            chip.check.fillCircle(cx, cy, 11)
            if (done) {
                chip.check.lineStyle(4, C.white, 1)
                chip.check.beginPath()
                chip.check.moveTo(cx - 5, cy)
                chip.check.lineTo(cx - 1, cy + 4)
                chip.check.lineTo(cx + 6, cy - 5)
                chip.check.strokePath()
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
            this.hudSub = (
                p.mustPass?.length
                    ? `Comece em ${this.labelOf(p.startId)}, passe em ${p.mustPass.map(id => this.labelOf(id)).join(', ')} e termine em ${this.labelOf(p.endId)}.`
                    : `Comece em ${this.labelOf(p.startId)} e termine em ${this.labelOf(p.endId)}.`
            )
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
        this.add.text(500, 670, 'Toque na bolinha do meio de uma linha para apagá-la', {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: '18px',
            color: '#cbd5e1',
        }).setOrigin(0.5).setDepth(12).setResolution(2)
    }

    private buildNodes(defs: GraphNode[], side: 'main' | 'alt') {
        defs.forEach(def => {
            const container = this.add.container(def.x, def.y).setDepth(14)

            const ring = this.add.graphics()
            this.paintNode(ring, 'idle')

            const icon = this.add.image(0, 0, def.textureKey).setDisplaySize(120, 120)

            const label = this.add.text(0, LABEL_DY, def.label, {
                fontFamily: 'Arial Black, Arial',
                fontSize: '16px',
                color: '#ffffff',
                stroke: '#0f2547',
                strokeThickness: 5,
            }).setOrigin(0.5).setResolution(2)

            const hit = this.add.rectangle(0, 0, HIT_R * 2, HIT_R * 2, 0xffffff, 0.01)
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

        const color = state === 'active' ? C.amber : state === 'route' ? C.purple : C.red
        g.fillStyle(color, 0.24)
        g.fillCircle(0, 0, NODE_R + 6)
        g.lineStyle(6, color, 1)
        g.strokeCircle(0, 0, NODE_R + 6)
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
            let color = C.blue
            if (this.reviewMode && p.kind === 'representar') {
                color = expectedKeys.has(edgeKey(e.a, e.b)) ? C.green : C.red
            }
            if (this.isEdgeInRoute(e)) color = C.purple
            this.strokeEdge(e, 'main', color, this.isEdgeInRoute(e) ? 11 : 8, 1)
            this.buildEdgeMarker(e)
        })

        if (p.kind === 'isomorfismo') {
            p.altEdges.forEach(e => this.strokeEdge(e, 'alt', C.blue, 8, 1))
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
        bg.lineStyle(3, C.blueDark, 1)
        bg.strokeCircle(0, 0, r)
        marker.add(bg)

        if (e.weight !== undefined) {
            marker.add(this.add.text(0, 0, String(e.weight), {
                fontFamily: 'Arial Black, Arial',
                fontSize: '17px',
                color: '#1e3a8a',
            }).setOrigin(0.5).setResolution(2))
        }

        if (this.phase.kind === 'representar' && !this.reviewMode) {
            const touch = Math.max(r + 12, 26)
            const hit = this.add.rectangle(0, 0, touch * 2, touch * 2, 0xffffff, 0.01)
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
                this.flashNode(view, C.red)
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
                this.flashNode(view, C.red)
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

        const size = 72
        const y = view.y - 88

        const glow = this.add.image(view.x, y, key)
            .setDisplaySize(size * 1.32, size * 1.32)
            .setTint(C.white)
            .setAlpha(0.55)
            .setDepth(15)

        const icon = this.add.image(view.x, y, key)
            .setDisplaySize(size, size)
            .setDepth(16)

        const tag = this.add.text(view.x, y - size / 2 - 12, label, {
            fontFamily: 'Arial Black, Arial', fontSize: '14px',
            color: '#ffffff', stroke: '#0f2547', strokeThickness: 5,
        }).setOrigin(0.5).setDepth(16).setResolution(2)

        this.tweens.add({
            targets: [glow, icon, tag],
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

        const CHIP_W = 176
        const CHIP_H = 38
        const ARROW_W = 40
        const LABEL_W = 106
        const STRIP_PAD = 12
        const STRIP_Y = TASK_Y - 12
        const STRIP_H = CHIP_H + 8

        const roleColor: Record<string, number> = { start: 0x16a34a, pass: 0xd97706, end: 0xdc2626 }
        const roleIcon:  Record<string, string>  = { start: '🚩', pass: '📍', end: '🏁' }

        const innerW = LABEL_W + stops.length * CHIP_W + (stops.length - 1) * ARROW_W
        const stripX = W / 2 - (innerW + STRIP_PAD * 2) / 2

        // Background strip
        const bg = this.add.graphics().setDepth(12)
        bg.fillStyle(C.ink, 0.88)
        bg.fillRoundedRect(stripX, STRIP_Y, innerW + STRIP_PAD * 2, STRIP_H, STRIP_H / 2)
        bg.lineStyle(3, C.blue, 0.72)
        bg.strokeRoundedRect(stripX, STRIP_Y, innerW + STRIP_PAD * 2, STRIP_H, STRIP_H / 2)

        // "PERCURSO:" label on the left
        this.add.text(stripX + STRIP_PAD, STRIP_Y + STRIP_H / 2, 'PERCURSO:', {
            fontFamily: 'Arial Black, Arial', fontSize: '14px',
            color: '#93c5fd', stroke: '#0f2547', strokeThickness: 3,
        }).setOrigin(0, 0.5).setDepth(13).setResolution(2)

        // Chips and arrows
        let cx = stripX + STRIP_PAD + LABEL_W

        stops.forEach((stop, i) => {
            const color = roleColor[stop.role]

            const chipBg = this.add.graphics().setDepth(13)
            chipBg.fillStyle(color, 0.86)
            chipBg.fillRoundedRect(cx, STRIP_Y + 4, CHIP_W, CHIP_H, CHIP_H / 2)
            chipBg.lineStyle(2, 0xffffff, 0.82)
            chipBg.strokeRoundedRect(cx, STRIP_Y + 4, CHIP_W, CHIP_H, CHIP_H / 2)

            this.add.text(cx + CHIP_W / 2, STRIP_Y + STRIP_H / 2,
                `${roleIcon[stop.role]} ${this.labelOf(stop.id)}`, {
                fontFamily: 'Arial Black, Arial', fontSize: '15px',
                color: '#ffffff', stroke: '#0f2547', strokeThickness: 4,
            }).setOrigin(0.5).setDepth(14).setResolution(2)

            cx += CHIP_W

            if (i < stops.length - 1) {
                this.add.text(cx + ARROW_W / 2, STRIP_Y + STRIP_H / 2, '→', {
                    fontFamily: 'Arial Black, Arial', fontSize: '20px',
                    color: '#94a3b8', stroke: '#0f2547', strokeThickness: 4,
                }).setOrigin(0.5).setDepth(13).setResolution(2)
                cx += ARROW_W
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
            ring.strokeCircle(0, 0, NODE_R + 12)
            this.tweens.add({
                targets: ring, alpha: { from: 0.4, to: 1 },
                duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
            })

            // Badge above the node
            this.add.text(view.x, view.y - 92, '📍 PARADA', {
                fontFamily: 'Arial Black, Arial', fontSize: '13px',
                color: '#fbbf24', stroke: '#0f2547', strokeThickness: 4,
            }).setOrigin(0.5).setDepth(16).setResolution(2)
        })
    }

    private buildRouteHud() {
        this.costText = this.add.text(220, 668, '0 quadras', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '24px',
            color: '#ffffff',
            stroke: '#0f2547',
            strokeThickness: 5,
        }).setOrigin(0.5).setDepth(12).setResolution(2)

        this.makeButton(450, 668, 190, 50, 'Apagar rota', C.slate, () => {
            if (this.locked) return
            this.routePath = []
            this.playTone(300, 0.06, 'square', 0.1)
            this.refreshRoute()
        })
    }

    private buildOptions(p: QueryPhase) {
        const gap = 18
        const bw = 196
        const total = p.options.length * bw + (p.options.length - 1) * gap
        const startX = W / 2 - total / 2 + bw / 2

        p.options.forEach((opt, i) => {
            const btn = this.makeButton(startX + i * (bw + gap), 660, bw, 54, opt, C.blueDark, () => {
                if (this.locked) return
                this.selectedOption = i
                this.playTone(620, 0.05, 'sine', 0.1)
                this.optionButtons.forEach((b, bi) => {
                    const g = b.getData('bg') as Phaser.GameObjects.Graphics
                    this.paintButton(g, bw, 54, bi === i ? C.amber : C.blueDark)
                })
                this.confirmBtn?.setAlpha(1)
            })
            this.optionButtons.push(btn)
        })
    }

    private buildIsoLabels() {
        const divider = this.add.graphics().setDepth(3)
        divider.lineStyle(3, C.white, 0.25)
        divider.lineBetween(W / 2, 150, W / 2, 620)

        this.add.text(370, 150, 'DESENHO A', {
            fontFamily: 'Arial Black, Arial', fontSize: '17px', color: '#93c5fd',
        }).setOrigin(0.5).setDepth(6).setResolution(2)

        this.add.text(930, 150, 'DESENHO B', {
            fontFamily: 'Arial Black, Arial', fontSize: '17px', color: '#c4b5fd',
        }).setOrigin(0.5).setDepth(6).setResolution(2)
    }

    private buildIsoButtons(p: IsomorphismPhase) {
        this.makeButton(440, 668, 300, 56, 'São o mesmo grafo', C.blue, () => {
            if (this.locked) return
            this.resolveIsomorphism(p, true)
        })
        this.makeButton(840, 668, 300, 56, 'São diferentes', C.purple, () => {
            if (this.locked) return
            this.resolveIsomorphism(p, false)
        })
    }

    private buildConfirm(label: string, onClick: () => void) {
        this.confirmBtn = this.makeButton(1060, 668, 260, 54, label, C.green, () => {
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
        }

        this.emitCheckpoint()
        this.showFeedback(correct, message)
    }

    private showFeedback(correct: boolean, message: string) {
        const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x0f2547, 0.7)
            .setDepth(300).setInteractive()
        const panel = this.add.container(W / 2, H / 2).setDepth(301)

        const text = this.add.text(0, 0, message, {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: '19px',
            color: '#1e293b',
            align: 'center',
            wordWrap: { width: 520 },
        }).setOrigin(0.5).setResolution(2)

        const title = this.add.text(0, 0, correct ? 'Muito bem!' : 'Quase lá!', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '32px',
            color: correct ? '#15803d' : '#b91c1c',
        }).setOrigin(0.5).setResolution(2)

        const PH = 200 + text.height
        title.setY(-PH / 2 + 58)
        text.setY(-PH / 2 + 58 + 34 + text.height / 2)

        const bg = this.add.graphics()
        bg.fillStyle(0x000000, 0.22)
        bg.fillRoundedRect(-286, -PH / 2 + 8, 572, PH, 26)
        bg.fillStyle(0xf8fafc, 0.99)
        bg.fillRoundedRect(-292, -PH / 2, 572, PH, 26)
        bg.fillStyle(correct ? C.green : C.red, 1)
        bg.fillRoundedRect(-292, -PH / 2, 572, 12, { tl: 26, tr: 26, bl: 0, br: 0 })

        const btn = this.makeButton(0, PH / 2 - 48, 260, 52,
            correct ? 'Continuar' : 'Tentar de novo',
            correct ? C.green : C.blue,
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
        this.scene.restart({ level: this.level.level, phase: this.phaseIdx, points: this.points })
    }

    private completePhase() {
        const isLastPhase = this.phaseIdx + 1 >= this.level.phases.length
        const isLastLevel = this.levelIdx + 1 >= LEVELS.length

        if (!isLastPhase) {
            this.scene.restart({ level: this.level.level, phase: this.phaseIdx + 1, points: this.points })
            return
        }

        if (!isLastLevel) {
            showLevelComplete(this, {
                subtitle: `Nível ${this.level.level} concluído`,
                message: LEVELS[this.levelIdx + 1].objective,
                accent: C.blue,
                overlayColor: 0x0f2547,
                titleColor: '#1e3a8a',
                subtitleColor: '#3b82f6',
                progress: { total: LEVELS.length, current: this.level.level },
                autoAdvance: {
                    delay: 2300,
                    onComplete: () => this.scene.restart({
                        level: this.level.level + 1,
                        phase: 0,
                        points: this.points,
                    }),
                },
            })
            return
        }

        this.ended = true
        runtimeGameBridge.emit({ type: 'GAME_COMPLETED', gameId: GAME_ID, stage: this.level.level })
        runtimeGameBridge.emit({ type: 'FINISH_GAME', gameId: GAME_ID, stage: this.level.level })

        showLevelComplete(this, {
            title: 'Jogo concluído!',
            subtitle: 'Você já sabe ler e montar grafos',
            accent: C.blue,
            overlayColor: 0x0f2547,
            titleColor: '#1e3a8a',
            subtitleColor: '#3b82f6',
            progress: { total: LEVELS.length, current: LEVELS.length },
            buttons: [
                { label: 'Jogar novamente', color: C.green, onClick: () => this.scene.restart({ level: 1, phase: 0, points: 0 }) },
                { label: 'Outros jogos', color: C.purple, onClick: () => EventBus.emit('exit-game') },
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
        const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x0f2547, 0.86)
            .setDepth(500).setInteractive()
        const panel = this.add.container(W / 2, H / 2).setDepth(501)

        const PW = 640
        const PH = 400

        const bg = this.add.graphics()
        bg.fillStyle(0x000000, 0.25)
        bg.fillRoundedRect(-PW / 2 + 6, -PH / 2 + 8, PW, PH, 28)
        bg.fillStyle(0xf8fafc, 0.99)
        bg.fillRoundedRect(-PW / 2, -PH / 2, PW, PH, 28)
        bg.fillStyle(C.blue, 1)
        bg.fillRoundedRect(-PW / 2, -PH / 2, PW, 72, { tl: 28, tr: 28, bl: 0, br: 0 })

        const badge = this.add.text(0, -PH / 2 + 36, `NÍVEL ${this.level.level} DE ${LEVELS.length}`, {
            fontFamily: 'Arial Black, Arial', fontSize: '23px', color: '#ffffff',
        }).setOrigin(0.5).setResolution(2)

        const title = this.add.text(0, -PH / 2 + 120, this.level.title, {
            fontFamily: 'Arial Black, Arial', fontSize: '31px', color: '#0f172a',
            align: 'center', wordWrap: { width: PW - 90 },
        }).setOrigin(0.5).setResolution(2)

        const objective = this.add.text(0, -PH / 2 + 190, this.level.objective, {
            fontFamily: 'Arial', fontStyle: 'bold', fontSize: '19px', color: '#334155',
            align: 'center', wordWrap: { width: PW - 110 },
        }).setOrigin(0.5).setResolution(2)

        const phaseLabel = this.add.text(0, 56, `${this.level.phases.length} fases neste nível`, {
            fontFamily: 'Arial', fontStyle: 'bold', fontSize: '15px', color: '#64748b',
        }).setOrigin(0.5).setResolution(2)

        const dots = this.add.graphics()
        const gap = 30
        const startX = -((this.level.phases.length - 1) * gap) / 2
        this.level.phases.forEach((_, i) => {
            dots.fillStyle(i === 0 ? C.blue : 0xcbd5e1, 1)
            dots.fillCircle(startX + i * gap, 90, 9)
        })

        const btn = this.makeButton(0, 152, 280, 56, 'Começar', C.blue, () => {
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
                        shape: 'rect', x: W / 2, y: TASK_Y + 20, w: 1120, h: 130, balloonY: 430,
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
                        shape: 'rect', x: W / 2, y: TASK_Y + 20, w: 1120, h: 130, balloonY: 430,
                    },
                    {
                        text: 'Desenhou errado? Toque na bolinha branca no meio da linha para apagá-la.',
                        shape: 'none', balloonY: 400,
                    },
                    {
                        text: 'Com a lista toda marcada, toque em Confirmar ligações.',
                        shape: 'rect', x: 1060, y: BAR_Y, w: 320, h: 100,
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
                        shape: 'rect', x: W / 2, y: 62, w: 1160, h: 110, balloonY: 400,
                    },
                    {
                        text: 'Às vezes o desenho é um bairro, às vezes são amizades. O jeito de ler é o mesmo: quem liga com quem.',
                        shape: 'none', balloonY: 400,
                    },
                    {
                        text: 'E agora tem tempo. A barra esvazia de verde para vermelho: quando acabar, a fase reinicia.',
                        shape: 'rect', x: W - 186, y: 44, w: 360, h: 70, balloonY: 400,
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
                    EventBus.emit('tutorial-ready')
                }
                onDone()
                return
            }
            createTutorial(this, {
                key: queue[i].key,
                accent: C.blue,
                safeTop: 130,
                once: false,
                onFinish: () => next(i + 1),
                steps: queue[i].steps,
            })
        }

        next(0)
    }

    private paintButton(g: Phaser.GameObjects.Graphics, w: number, h: number, color: number) {
        g.clear()
        g.fillStyle(color, 1)
        g.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
        g.fillStyle(C.white, 0.18)
        g.fillRoundedRect(-w / 2 + 6, -h / 2 + 6, w - 12, h * 0.3, h / 4)
        g.lineStyle(3, C.white, 0.9)
        g.strokeRoundedRect(-w / 2, -h / 2, w, h, h / 2)
    }

    private publishHud() {
        this.registry.set('hud', {
            instruction: this.phase.instruction,
            sub: this.hudSub,
            level: this.level.level,
            phase: this.phaseIdx + 1,
            totalPhases: this.level.phases.length,
        })
    }

    private startTimer() {
        EventBus.emit('timer-start', this.level.timeLimit)
    }

    private stopTimer() {
        EventBus.emit('timer-stop')
    }

    private makeButton(
        x: number, y: number, w: number, h: number,
        label: string, color: number, onClick: () => void,
    ) {
        const btn = this.add.container(x, y).setDepth(20)
        const g = this.add.graphics()
        this.paintButton(g, w, h, color)

        const text = this.add.text(0, 0, label, {
            fontFamily: 'Arial Black, Arial',
            fontSize: '18px',
            color: '#ffffff',
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