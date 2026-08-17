import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { showLevelComplete as showLevelCompleteModal } from '../../../../shared/level/showLevelComplete'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { LEVELS } from '../data/levels'
import { C, CSS } from '../data/theme'
import { CANVAS, unionBBox } from './BootScene'
import {
    CATEGORY_COLOR,
    CATEGORY_LABEL,
    LAYER_OFFSET,
    MONITOR_ON,
    PARTS,
    VIEW_BASE,
    canInstall,
    dependentsOf,
} from '../data/parts'
import { FLOW_ORDER, bootReady, simulateBoot } from '../data/boot'
import * as L from '../data/layout'
import type {
    BootResult,
    BuildChallenge,
    Category,
    LevelConfig,
    PartId,
    View,
} from '../types'
import { offsetOf } from '../data/parts'

const GAME_ID = 'monte-seu-computador'
const MAX_CONSECUTIVE_ERRORS = 3

type Phase = 'montando' | 'rodando'

interface Mould {
    part: PartId
    rect: L.Rect
}

export class GameScene extends Phaser.Scene {
    private levelConfig!: LevelConfig
    private challengeIndex = 0
    private hits = 0
    private errors = 0
    private consecutiveErrors = 0
    private points = 0
    private phase: Phase = 'montando'

    private installed = new Set<PartId>()
    private hand: PartId | null = null
    private view: View = 'oficina'

    private place!: L.Placement

    private viewLayer!: Phaser.GameObjects.Container
    private baseImg!: Phaser.GameObjects.Image
    private partImgs = new Map<PartId, Phaser.GameObjects.Image[]>()
    private mouldLayer!: Phaser.GameObjects.Container
    private mouldG!: Phaser.GameObjects.Graphics
    private moulds: Mould[] = []

    private handImgs: Phaser.GameObjects.Image[] = []
    private handShadow?: Phaser.GameObjects.Image
    private dragging = false
    private dragDX = 0
    private dragDY = 0

    private calibG?: Phaser.GameObjects.Graphics
    private calibT?: Phaser.GameObjects.Text
    private calib = { x: 0, y: 0, w: 0, h: 0 }
    private calibOn = false

    private uiLayer!: Phaser.GameObjects.Container
    private overlay: Phaser.GameObjects.GameObject[] = []

    private handMain: Phaser.GameObjects.Image[] = []
    private handOutline: Phaser.GameObjects.Image[] = []
    private handDrop: Phaser.GameObjects.Image[] = []
    private handZone?: Phaser.GameObjects.Zone

    private powerBtn?: Phaser.GameObjects.Container
    private viewBtn?: Phaser.GameObjects.Container
    private handLabel?: Phaser.GameObjects.Text
    private handIcon?: Phaser.GameObjects.Image

    private timeLeft = 0
    private timerG?: Phaser.GameObjects.Graphics
    private timerEvent?: Phaser.Time.TimerEvent

    private tutorialOpen = false
    private unsubPlatform?: () => void

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number }) {
        const lvl = (data?.level ?? 1) as 1 | 2 | 3
        this.levelConfig = LEVELS.find(l => l.level === lvl) ?? LEVELS[0]
        this.challengeIndex = 0
        this.hits = 0
        this.errors = 0
        this.consecutiveErrors = 0
        this.points = data?.points ?? 0
        this.phase = 'rodando'
        this.installed = new Set()
        this.hand = null
        this.view = 'oficina'
        this.partImgs = new Map()
        this.handImgs = []
        this.moulds = []
        this.overlay = []
        this.tutorialOpen = false
        this.timeLeft = 0
    }

    private get challenge(): BuildChallenge {
        return this.levelConfig.challenges[this.challengeIndex]
    }

    create() {
        this.place = L.viewPlacement(CANVAS.w, CANVAS.h, this.view)

        this.add.rectangle(L.W / 2, L.H / 2, L.W, L.H, C.preto).setDepth(-1)

        this.viewLayer = this.add.container(0, 0).setDepth(5)
        this.mouldLayer = this.add.container(0, 0).setDepth(20)
        this.mouldG = this.add.graphics().setDepth(21)
        this.uiLayer = this.add.container(0, 0).setDepth(40)

        this.input.topOnly = true

        this.registerPlatformCommands()
        this.registerDrag()
        EventBus.on('show-tutorial', () => this.runTutorial(() => { }), this)

        this.events.once('shutdown', () => {
            this.clearOverlay()
            this.timerEvent?.remove()
            EventBus.off('show-tutorial', undefined, this)
            this.unsubPlatform?.()
            this.unsubPlatform = undefined
        })

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        this.startChallenge(false)
        this.showLevelStart(() => this.runTutorial(() => this.beginPlay()))

        this.input.keyboard?.on('keydown', (e: KeyboardEvent) => {
            const s = e.shiftKey ? 4 : 20
            let dx = 0, dy = 0
            if (e.key === 'ArrowLeft') dx = -s
            else if (e.key === 'ArrowRight') dx = s
            else if (e.key === 'ArrowUp') dy = -s
            else if (e.key === 'ArrowDown') dy = s
            else return

            Object.keys(LAYER_OFFSET).forEach(k => {
                LAYER_OFFSET[k].x += dx
                LAYER_OFFSET[k].y += dy
            })
            console.log(JSON.stringify(LAYER_OFFSET['layer-gabinete']))
            this.buildView()
            this.refreshAll()
        })
    }

    private startChallenge(autoStart = true) {
        const ch = this.challenge

        this.phase = 'rodando'
        this.hand = null
        this.installed = new Set(ch.preInstalled ?? [])
        this.view = ch.startView
        this.timeLeft = ch.timeLimit ?? 0

        this.timerEvent?.remove()
        this.timerEvent = undefined

        this.buildView()
        this.buildBottomBar()
        this.clearHandPiece()
        this.refreshAll()

        if (autoStart) this.beginPlay()
        else this.broadcastMission()
    }

    private beginPlay() {
        this.phase = 'montando'
        this.broadcastMission()
        this.refreshAll()

        if (this.challenge.mode === 'quiz-multipla') {
            this.phase = 'rodando'
            this.runQuizSequence()
            return
        }

        if (this.challenge.mode === 'quiz-classificar') {
            this.phase = 'rodando'
            this.time.delayedCall(400, () => this.runClassifyQuiz())
            return
        }

        if (this.challenge.timeLimit) {
            this.timerEvent = this.time.addEvent({
                delay: 1000,
                loop: true,
                callback: () => this.tickTimer(),
            })
        }
    }

    private tickTimer() {
        if (this.phase !== 'montando') return
        this.timeLeft--
        this.paintTimer()

        if (this.timeLeft <= 0) {
            this.timerEvent?.remove()
            this.timerEvent = undefined
            this.registerError()
            this.showToast('O tempo acabou.', false)
            this.time.delayedCall(2200, () => {
                if (this.consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) this.showGameOver()
                else this.startChallenge()
            })
        }
    }

    private broadcastMission() {
        const ch = this.challenge
        const instruction =
            ch.mode === 'montar' ? 'Arraste cada peça para a sombra que combina com ela'
                : ch.mode === 'montar-quiz' ? 'Encaixe a peça e responda o que ela faz'
                    : ch.mode === 'montar-livre' ? 'Sem sombras e sem dicas: monte tudo de memória'
                        : ch.title

        EventBus.emit('mission-update', {
            level: this.levelConfig.level,
            challengeIndex: this.challengeIndex,
            totalChallenges: this.levelConfig.challenges.length,
            instruction,
        })
    }

    private emitCheckpoint() {
        const progress = Math.round((this.challengeIndex / this.levelConfig.challenges.length) * 100)
        runtimeGameBridge.emit({
            type: 'CHECKPOINT', gameId: GAME_ID,
            progress, score: this.points, stage: this.levelConfig.level,
            hits: this.hits, errors: this.errors,
        })
    }

    private drawCard(
        g: Phaser.GameObjects.Graphics,
        r: L.Rect, fill: number, stroke: number, radius = 18, glossy = true,
    ) {
        g.fillStyle(C.preto, 0.55)
        g.fillRoundedRect(r.x, r.y + 6, r.w, r.h, radius)
        g.fillStyle(fill, 1)
        g.fillRoundedRect(r.x, r.y, r.w, r.h, radius)
        if (glossy) {
            g.fillStyle(0xffffff, 0.14)
            g.fillRoundedRect(r.x + 5, r.y + 4, r.w - 10, r.h * 0.34, radius * 0.6)
        }
        g.lineStyle(4, stroke, 0.95)
        g.strokeRoundedRect(r.x, r.y, r.w, r.h, radius)
    }

    private buildView() {
        this.place = L.viewPlacement(CANVAS.w, CANVAS.h, this.view)

        this.viewLayer.removeAll(true)
        this.partImgs = new Map()

        const p = this.place

        this.baseImg = this.add.image(p.x, p.y, VIEW_BASE[this.view])
            .setOrigin(0, 0)
            .setScale(p.scale)
        this.viewLayer.add(this.baseImg)

        this.installed.forEach(id => {
            if (PARTS[id].view !== this.view) return
            this.addPartImages(id)
        })
    }

    private addPartImages(id: PartId) {
        const p = this.place
        const def = PARTS[id]
        const keys = id === 'monitor' && this.bootDone ? [MONITOR_ON] : def.layers

        const imgs = keys.map(key => {
            const q = this.layerXY(key)
            const img = this.add.image(q.x, q.y, key).setOrigin(0, 0).setScale(p.scale)
            this.viewLayer.add(img)
            return img
        })

        const box = L.toScreen(this.partVisualBBox(id), p)
        const zone = this.add.zone(L.cx(box), L.cy(box), box.w, box.h)
            .setInteractive({ useHandCursor: true })
        zone.on('pointerup', () => this.onInstalledTap(id))
        this.viewLayer.add(zone)

        this.partImgs.set(id, imgs)
    }

    private bootDone = false

    private partScreenRect(id: PartId): L.Rect {
        return L.toScreen(this.partBBox(id), this.place)
    }

    private refreshAll() {
        this.refreshMoulds()
        this.refreshBottomBar()
        this.paintTimer()
    }

    private refreshMoulds() {
        this.mouldLayer.removeAll(true)
        this.mouldG.clear()
        this.moulds = []

        if (this.phase !== 'montando') return

        const ch = this.challenge
        const hint = ch.hint ?? 'silhueta'
        if (ch.mode === 'quiz-classificar' || ch.mode === 'quiz-multipla') return

        const placed: L.Rect[] = []
        const active = hint === 'dica' ? this.activePart() : null

        const list = hint === 'dica'
            ? (active ? [active] : [])
            : ch.available

        list.forEach(id => {
            const def = PARTS[id]
            if (def.view !== this.view) return
            if (this.installed.has(id)) return
            if (!canInstall(id, this.installed)) return

            const rect = this.partVisualScreenRect(id)

            if (id === 'gabinete') {
                rect.w /= 2
                rect.h /= 2

                rect.x += rect.w / 2
                rect.y += rect.h / 2
            }

            this.moulds.push({ part: id, rect })

            const color = CATEGORY_COLOR[def.category]

            if (hint === 'silhueta') {
                def.layers.forEach(key => {
                    const q = this.layerXY(key)
                    const ghost = this.add.image(q.x, q.y, key)
                        .setOrigin(0, 0)
                        .setScale(this.place.scale)
                        .setAlpha(0.22)
                        .setTint(C.creme)
                    this.mouldLayer.add(ghost)
                })
            }

            if (hint === 'silhueta') {
                this.dashedRect(this.mouldG, rect, color)
            } else if (hint === 'dica') {
                const s = Math.min(rect.w, rect.h) * 0.5
                const g = this.mouldG
                g.lineStyle(5, color, 1)
                g.strokeCircle(L.cx(rect), L.cy(rect), Math.max(26, s * 0.5))
                g.fillStyle(color, 0.18)
                g.fillCircle(L.cx(rect), L.cy(rect), Math.max(26, s * 0.5))
            } else {
                this.dashedRect(this.mouldG, rect, color)
            }

            if (hint === 'dica') {
                const bw = 250
                const label = this.add.text(0, 0, def.dica, {
                    fontFamily: 'Arial Black, Arial',
                    fontSize: '16px',
                    color: CSS.creme,
                    stroke: CSS.preto,
                    strokeThickness: 4,
                    align: 'center',
                    wordWrap: { width: bw - 24 },
                }).setOrigin(0.5).setResolution(2)

                const bh = label.height + 20
                let bx = Phaser.Math.Clamp(
                    L.cx(rect), L.VIEW_AREA.x + bw / 2 + 8, L.VIEW_AREA.x + L.VIEW_AREA.w - bw / 2 - 8,
                )
                let by = rect.y + rect.h + bh / 2 + 14

                const hits = (y: number) => placed.some(p =>
                    Math.abs(p.x - bx) < (p.w + bw) / 2 - 4 &&
                    Math.abs(p.y - y) < (p.h + bh) / 2 - 4,
                )

                let guard = 0
                while (hits(by) && guard++ < 12) by += bh + 10

                if (by + bh / 2 > L.VIEW_AREA.y + L.VIEW_AREA.h - 8) {
                    by = rect.y - bh / 2 - 14
                    guard = 0
                    while (hits(by) && guard++ < 12) by -= bh + 10
                }

                placed.push({ x: bx, y: by, w: bw, h: bh })
                label.setPosition(bx, by)

                const bg = this.add.graphics()
                bg.fillStyle(C.preto, 0.86)
                bg.fillRoundedRect(bx - bw / 2, by - bh / 2, bw, bh, 12)
                bg.lineStyle(3, color, 0.9)
                bg.strokeRoundedRect(bx - bw / 2, by - bh / 2, bw, bh, 12)

                const line = this.add.graphics()
                line.lineStyle(3, color, 0.75)
                line.lineBetween(L.cx(rect), L.cy(rect), bx, by)

                this.mouldLayer.add([line, bg, label])
            }
        })

        if (hint === 'dica' && active) {
            const total = ch.available.length
            const done = total - this.pendingParts().length

            const t = this.add.text(
                L.W / 2, L.VIEW_AREA.y + 26, `Peça ${done + 1} de ${total}`, {
                fontFamily: 'Arial Black, Arial', fontSize: '17px', color: CSS.ouro,
                stroke: CSS.preto, strokeThickness: 5,
            }).setOrigin(0.5).setResolution(2)

            this.mouldLayer.add(t)
        }

        const pulse = this.mouldG
        this.tweens.killTweensOf(pulse)

        pulse.setAlpha(1)
        if (this.moulds.length) {
            this.tweens.add({
                targets: pulse, alpha: 0.42, duration: 720, yoyo: true, repeat: -1,
            })
        }
    }

    private askPartQuiz(id: PartId, onDone: () => void) {
        const def = PARTS[id]
        const q = def.quiz
        if (!q) { onDone(); return }
        const color = CATEGORY_COLOR[def.category]

        this.clearOverlay()

        this.keep(
            this.add.rectangle(L.W / 2, L.H / 2, L.W, L.H, C.preto, 0.9)
                .setDepth(300).setInteractive(),
        )
        const panel = this.keep(this.add.container(0, 0).setDepth(301))

        const box = L.QUIZ_PANEL
        const g = this.add.graphics()
        this.drawCard(g, box, C.escuro, color, box.r, false)
        panel.add(g)

        panel.add([
            this.add.image(L.W / 2, box.y + 65, def.icon).setDisplaySize(90, 90),
            this.add.text(L.W / 2, box.y + 134, def.label.toUpperCase(), {
                fontFamily: 'Arial Black, Arial', fontSize: '18px', color: CSS.ouro,
                stroke: CSS.preto, strokeThickness: 4,
            }).setOrigin(0.5).setResolution(2),
            this.add.text(L.W / 2, box.y + 160, q.question, {
                fontFamily: 'Arial Black, Arial', fontSize: '25px', color: CSS.creme,
                stroke: CSS.preto, strokeThickness: 6,
                align: 'center', wordWrap: { width: box.w - 90 },
            }).setOrigin(0.5).setResolution(2),
        ])

        let locked = false

        q.options.forEach((text, i) => {
            const rect = L.quizOption(i)
            const card = this.add.graphics()
            this.drawCard(card, rect, C.medio, C.claro, 18)

            const label = this.add.text(rect.x + 26, L.cy(rect), text, {
                fontFamily: 'Arial Black, Arial', fontSize: '20px', color: CSS.creme,
                stroke: CSS.preto, strokeThickness: 4,
                wordWrap: { width: rect.w - 52 },
            }).setOrigin(0, 0.5).setResolution(2)

            const zone = this.add.zone(L.cx(rect), L.cy(rect), rect.w, rect.h)
                .setInteractive({ useHandCursor: true })

            zone.on('pointerup', () => {
                if (locked) return

                if (i !== q.correctIndex) {
                    card.clear()
                    this.drawCard(card, rect, C.vermelho, C.creme, 18)
                    this.playError()
                    this.registerError()
                    this.cameras.main.shake(140, 0.004)

                    if (this.consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
                        locked = true
                        this.time.delayedCall(1200, () => {
                            this.clearOverlay()
                            this.showGameOver()
                        })
                    }
                    return
                }

                locked = true
                card.clear()
                this.drawCard(card, rect, C.verde, C.creme, 18)
                this.stamp('selo-ok', rect.x + rect.w - 40, L.cy(rect))
                this.playNote(760)
                this.consecutiveErrors = 0
                this.points += 5

                const ex = this.add.text(L.W / 2, box.y + box.h - 52, q.explain, {
                    fontFamily: 'Arial', fontStyle: 'bold', fontSize: '17px', color: CSS.ouro,
                    align: 'center', wordWrap: { width: box.w - 100 },
                }).setOrigin(0.5).setResolution(2)
                panel.add(ex)

                this.time.delayedCall(2400, () => {
                    this.clearOverlay()
                    onDone()
                })
            })

            panel.add([card, label, zone])
        })

        panel.setAlpha(0).setScale(0.95)
        this.tweens.add({ targets: panel, alpha: 1, scale: 1, duration: 220, ease: 'Back.easeOut' })
    }

    private runQuizSequence() {
        const parts = [...(this.challenge.quizParts ?? [])]

        const next = (i: number) => {
            if (i >= parts.length) {
                this.finishChallenge()
                return
            }
            this.askPartQuiz(parts[i], () => next(i + 1))
        }

        this.time.delayedCall(400, () => next(0))
    }

    private runClassifyQuiz() {
        const parts = [...(this.challenge.classifyParts ?? [])]
        const groups = this.challenge.classifyGroups ?? []
        const placed = new Map<PartId, number>()

        this.clearOverlay()

        this.keep(
            this.add.rectangle(L.W / 2, L.H / 2, L.W, L.H, C.preto, 0.9)
                .setDepth(300).setInteractive(),
        )
        const panel = this.keep(this.add.container(0, 0).setDepth(301))

        const box = L.QUIZ_PANEL
        const g = this.add.graphics()
        this.drawCard(g, box, C.escuro, C.ouro, box.r, false)
        panel.add(g)

        panel.add(
            this.add.text(L.W / 2, box.y + 42, 'Toque na peça e depois no grupo certo', {
                fontFamily: 'Arial Black, Arial', fontSize: '22px', color: CSS.creme,
                stroke: CSS.preto, strokeThickness: 5,
                align: 'center', wordWrap: { width: box.w - 80 },
            }).setOrigin(0.5).setResolution(2),
        )

        let selected: PartId | null = null
        const cards = new Map<PartId, Phaser.GameObjects.Graphics>()

        const paintCard = (id: PartId, i: number) => {
            const rect = L.classifyCard(i)
            const done = placed.has(id)
            const on = selected === id
            const cg = cards.get(id)!
            cg.clear()
            this.drawCard(
                cg, rect,
                done ? C.verde : on ? C.ouro : C.medio,
                done ? C.creme : on ? C.creme : C.claro,
                18,
            )
        }

        parts.forEach((id, i) => {
            const rect = L.classifyCard(i)
            const cg = this.add.graphics()
            cards.set(id, cg)

            const icon = this.add.image(L.cx(rect), rect.y + 34, PARTS[id].icon)
                .setDisplaySize(56, 56)
            const name = this.add.text(L.cx(rect), rect.y + 72, PARTS[id].label, {
                fontFamily: 'Arial Black, Arial', fontSize: '14px', color: CSS.creme,
                stroke: CSS.preto, strokeThickness: 3,
                align: 'center', wordWrap: { width: rect.w - 12 },
            }).setOrigin(0.5).setResolution(2)

            const zone = this.add.zone(L.cx(rect), L.cy(rect), rect.w, rect.h)
                .setInteractive({ useHandCursor: true })
            zone.on('pointerup', () => {
                if (placed.has(id)) return
                selected = selected === id ? null : id
                this.playTick()
                parts.forEach((p, k) => paintCard(p, k))
            })

            panel.add([cg, icon, name, zone])
            paintCard(id, i)
        })

        groups.forEach((grp, gi) => {
            const rect = L.classifyGroupRect(gi, groups.length)
            const gg = this.add.graphics()
            gg.lineStyle(4, C.claro, 0.8)
            gg.strokeRoundedRect(rect.x, rect.y, rect.w, rect.h, 22)
            gg.fillStyle(C.preto, 0.4)
            gg.fillRoundedRect(rect.x, rect.y, rect.w, rect.h, 22)

            const title = this.add.text(L.cx(rect), rect.y + 30, grp.label, {
                fontFamily: 'Arial Black, Arial', fontSize: '22px', color: CSS.ouro,
                stroke: CSS.preto, strokeThickness: 5,
            }).setOrigin(0.5).setResolution(2)

            const slotIcons: Phaser.GameObjects.Image[] = []

            const zone = this.add.zone(L.cx(rect), L.cy(rect), rect.w, rect.h)
                .setInteractive({ useHandCursor: true })

            zone.on('pointerup', () => {
                if (!selected) return
                const id = selected
                const ok = grp.accepts.includes(PARTS[id].category)

                if (!ok) {
                    this.playError()
                    this.registerError()
                    this.stamp('selo-x', L.cx(rect), rect.y + 70)
                    if (this.consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
                        this.time.delayedCall(1200, () => {
                            this.clearOverlay()
                            this.showGameOver()
                        })
                    }
                    return
                }

                placed.set(id, gi)
                selected = null
                this.playNote(740)
                this.consecutiveErrors = 0
                this.points += 5

                const icon = this.add.image(
                    rect.x + 40 + slotIcons.length * 52, rect.y + 130, PARTS[id].icon,
                ).setDisplaySize(56, 56)
                slotIcons.push(icon)
                panel.add(icon)

                parts.forEach((p, k) => paintCard(p, k))

                if (placed.size === parts.length) {
                    this.time.delayedCall(900, () => {
                        this.clearOverlay()
                        this.finishChallenge()
                    })
                }
            })

            panel.add([gg, title, zone])
        })

        panel.setAlpha(0).setScale(0.95)
        this.tweens.add({ targets: panel, alpha: 1, scale: 1, duration: 240, ease: 'Back.easeOut' })
    }

    private dashedRect(g: Phaser.GameObjects.Graphics, r: L.Rect, color: number) {
        const dash = 14
        const gap = 9

        g.lineStyle(4, C.preto, 0.7)
        g.strokeRoundedRect(r.x - 3, r.y - 3, r.w + 6, r.h + 6, 12)

        g.lineStyle(4, color, 1)

        const line = (x1: number, y1: number, x2: number, y2: number) => {
            const len = Math.hypot(x2 - x1, y2 - y1)
            const steps = Math.max(1, Math.floor(len / (dash + gap)))
            const ux = (x2 - x1) / len
            const uy = (y2 - y1) / len
            for (let i = 0; i < steps; i++) {
                const s = i * (dash + gap)
                g.lineBetween(x1 + ux * s, y1 + uy * s, x1 + ux * (s + dash), y1 + uy * (s + dash))
            }
        }

        line(r.x, r.y, r.x + r.w, r.y)
        line(r.x + r.w, r.y, r.x + r.w, r.y + r.h)
        line(r.x + r.w, r.y + r.h, r.x, r.y + r.h)
        line(r.x, r.y + r.h, r.x, r.y)
    }

    private buildBottomBar() {
        this.uiLayer.removeAll(true)
        this.powerBtn = undefined
        this.viewBtn = undefined

        const g = this.add.graphics()
        g.fillStyle(C.escuro, 1)
        g.fillRect(L.BOTTOM_BAR.x, L.BOTTOM_BAR.y, L.BOTTOM_BAR.w, L.BOTTOM_BAR.h)
        g.fillStyle(C.ouro, 0.9)
        g.fillRect(L.BOTTOM_BAR.x, L.BOTTOM_BAR.y, L.BOTTOM_BAR.w, 4)
        this.uiLayer.add(g)

        this.makeButton(L.BTN_DRAWER, 'PEÇAS', C.medio, () => this.openDrawer())
        this.viewBtn = this.makeButton(L.BTN_VIEW, '', C.medio, () => this.toggleView())
        this.makeButton(L.BTN_CLEAR, 'LIMPAR', C.medio, () => this.clearBuild())
        this.powerBtn = this.makeButton(L.BTN_POWER, 'LIGAR', C.verde, () => this.runBoot())

        const slot = this.add.graphics()
        slot.fillStyle(C.preto, 0.55)
        slot.fillRoundedRect(L.HAND_SLOT.x, L.HAND_SLOT.y, L.HAND_SLOT.w, L.HAND_SLOT.h, 16)
        slot.lineStyle(3, C.medio, 0.9)
        slot.strokeRoundedRect(L.HAND_SLOT.x, L.HAND_SLOT.y, L.HAND_SLOT.w, L.HAND_SLOT.h, 16)
        this.uiLayer.add(slot)

        this.handIcon = this.add.image(L.HAND_SLOT.x + 32, L.cy(L.HAND_SLOT), 'icone-power')
            .setDisplaySize(34, 34)
            .setVisible(false)

        this.handLabel = this.add.text(L.HAND_SLOT.x + 60, L.cy(L.HAND_SLOT), '', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '16px',
            color: CSS.claro,
            stroke: CSS.preto,
            strokeThickness: 4,
        }).setOrigin(0, 0.5).setResolution(2)

        this.uiLayer.add([this.handIcon, this.handLabel])

        this.timerG = this.add.graphics()
        this.uiLayer.add(this.timerG)
    }

    private refreshBottomBar() {
        if (this.viewBtn) {
            const other: View = this.view === 'oficina' ? 'mesa' : 'oficina'
            const text = this.viewBtn.getData('label') as Phaser.GameObjects.Text
            text.setText(other === 'mesa' ? 'VER A MESA' : 'VER O GABINETE')
        }

        if (this.powerBtn) {
            const ready = this.phase === 'montando'
                && !!this.challenge.bootAnimation
                && bootReady(this.challenge, this.installed)
            this.paintButton(this.powerBtn, ready)
        }

        if (this.handLabel && this.handIcon) {
            if (this.hand) {
                const def = PARTS[this.hand]
                this.handIcon.setTexture(def.icon).setVisible(true)
                this.handLabel.setText(def.label).setColor(CSS.creme).setX(L.HAND_SLOT.x + 60)
            } else {
                this.handIcon.setVisible(false)
                this.handLabel
                    .setText('Nenhuma peça na mão')
                    .setColor(CSS.claro)
                    .setX(L.HAND_SLOT.x + 20)
            }
        }
    }

    private paintTimer() {
        const g = this.timerG
        if (!g) return
        g.clear()
        if (!this.challenge.timeLimit) return

        const total = this.challenge.timeLimit
        const w = 260
        const x = L.W / 2 - w / 2
        const y = L.VIEW_AREA.y + 12
        const t = Phaser.Math.Clamp(this.timeLeft / total, 0, 1)

        g.fillStyle(C.preto, 0.75)
        g.fillRoundedRect(x, y, w, 22, 11)
        g.fillStyle(t > 0.3 ? C.ouro : C.vermelho, 1)
        g.fillRoundedRect(x + 3, y + 3, Math.max(4, (w - 6) * t), 16, 8)
        g.lineStyle(3, C.medio, 1)
        g.strokeRoundedRect(x, y, w, 22, 11)
    }

    private toggleView() {
        if (this.phase !== 'montando') return
        this.view = this.view === 'oficina' ? 'mesa' : 'oficina'
        this.playTick()
        this.buildView()
        this.refreshAll()
        this.repositionHandPiece()
    }

    private switchViewTo(view: View, onDone: () => void) {
        if (this.view === view) {
            onDone()
            return
        }
        this.view = view
        this.tweens.add({
            targets: this.viewLayer, alpha: 0, duration: 200,
            onComplete: () => {
                this.buildView()
                this.viewLayer.setAlpha(0)
                this.tweens.add({
                    targets: this.viewLayer, alpha: 1, duration: 260,
                    onComplete: onDone,
                })
            },
        })
    }

    private openDrawer() {
        if (this.phase !== 'montando') return
        this.clearOverlay()

        const ch = this.challenge
        const options = ch.available.filter(id => !this.installed.has(id))

        const shade = this.keep(
            this.add.rectangle(L.W / 2, L.H / 2, L.W, L.H, C.preto, 0.82)
                .setDepth(300).setInteractive(),
        )
        const panel = this.keep(this.add.container(0, 0).setDepth(301))

        const g = this.add.graphics()
        this.drawCard(g, L.DRAWER_PANEL, C.escuro, C.ouro, L.DRAWER_PANEL.r, false)
        panel.add(g)

        panel.add(
            this.add.text(L.W / 2, L.DRAWER_TITLE_Y, 'CAIXA DE PEÇAS', {
                fontFamily: 'Arial Black, Arial', fontSize: '28px', color: CSS.ouro,
                stroke: CSS.preto, strokeThickness: 6,
            }).setOrigin(0.5).setResolution(2),
        )

        if (!options.length) {
            panel.add(
                this.add.text(L.W / 2, L.H / 2, 'Todas as peças já foram instaladas.', {
                    fontFamily: 'Arial', fontStyle: 'bold', fontSize: '20px', color: CSS.claro,
                }).setOrigin(0.5).setResolution(2),
            )
        }

        const slots = L.drawerGrid(options.length)

        options.forEach((id, i) => {
            const rect = slots[i]
            if (!rect) return

            const def = PARTS[id]
            const color = CATEGORY_COLOR[def.category]
            const locked = !canInstall(id, this.installed)
            const isNext = (ch.hint ?? 'silhueta') === 'dica' && id === this.activePart()

            const card = this.add.graphics()
            this.drawCard(
                card, rect,
                locked ? C.medio : C.escuro,
                locked ? C.apagado : isNext ? C.ouro : color,
                20,
            )

            const icon = this.add.image(L.cx(rect), rect.y + 62, def.icon)
                .setDisplaySize(76, 76)
                .setAlpha(locked ? 0.4 : 1)

            const name = this.add.text(L.cx(rect), rect.y + 118, def.label, {
                fontFamily: 'Arial Black, Arial', fontSize: '17px',
                color: locked ? CSS.apagado : CSS.creme,
                stroke: CSS.preto, strokeThickness: 4,
                align: 'center', wordWrap: { width: rect.w - 16 },
            }).setOrigin(0.5).setResolution(2)

            const cat = this.add.text(L.cx(rect), rect.y + 146,
                locked ? 'instale a base antes' : CATEGORY_LABEL[def.category], {
                fontFamily: 'Arial', fontStyle: 'bold', fontSize: '13px',
                color: locked ? CSS.apagado : CSS.claro,
            }).setOrigin(0.5).setResolution(2)

            panel.add([card, icon, name, cat])

            if (locked) return

            const zone = this.add.zone(L.cx(rect), L.cy(rect), rect.w, rect.h)
                .setInteractive({ useHandCursor: true })
            zone.on('pointerup', () => {
                this.playTick()
                this.clearOverlay()
                this.takeInHand(id)
            })
            panel.add(zone)
        })

        shade.on('pointerup', () => this.clearOverlay())

        panel.setAlpha(0).setScale(0.94)
        this.tweens.add({ targets: panel, alpha: 1, scale: 1, duration: 220, ease: 'Back.easeOut' })
    }

    private takeInHand(id: PartId) {
        this.hand = id
        const def = PARTS[id]

        const finish = () => {
            this.buildHandPiece()
            this.refreshAll()
        }

        if (def.view !== this.view) this.switchViewTo(def.view, finish)
        else finish()
    }

    private paintCalib() {
        const g = this.calibG
        const t = this.calibT
        if (!g || !t) return

        g.clear()
        if (!this.calibOn) {
            t.setText('')
            return
        }

        const p = this.place
        g.lineStyle(2, 0x00ff88, 0.9)
        g.strokeRect(p.x, p.y, CANVAS.w * p.scale, CANVAS.h * p.scale)
        g.lineStyle(2, 0xff0066, 0.9)
        g.strokeRect(L.VIEW_AREA.x + 1, L.VIEW_AREA.y + 1, L.VIEW_AREA.w - 2, L.VIEW_AREA.h - 2)

        const c = this.calib
        t.setText(
            `[${this.view}]  setas=mover  a/d=largura  w/s=altura  shift=fino\n` +
            `{ x: ${c.x}, y: ${c.y}, w: ${c.w}, h: ${c.h} }   scale ${p.scale.toFixed(3)}`,
        )
    }

    private clearHandPiece() {
        this.handMain.forEach(i => i.destroy())
        this.handOutline.forEach(i => i.destroy())
        this.handDrop.forEach(i => i.destroy())
        this.handZone?.destroy()
        this.handMain = []
        this.handOutline = []
        this.handDrop = []
        this.handZone = undefined
        this.handImgs = []
        this.handShadow?.destroy()
        this.handShadow = undefined
        this.dragging = false
    }

    private restDelta(id: PartId): { dx: number; dy: number } {
        const box = this.partScreenRect(id)
        const a = L.VIEW_AREA
        const pad = 16

        const maxW = a.w - pad * 2
        const maxH = a.h - pad * 2

        let cxp = L.cx(L.HAND_SLOT) + 90
        let cyp = a.y + a.h - box.h / 2 - pad

        if (box.w >= maxW) cxp = a.x + a.w / 2
        else cxp = Phaser.Math.Clamp(cxp, a.x + box.w / 2 + pad, a.x + a.w - box.w / 2 - pad)

        if (box.h >= maxH) cyp = a.y + a.h / 2
        else cyp = Phaser.Math.Clamp(cyp, a.y + box.h / 2 + pad, a.y + a.h - box.h / 2 - pad)

        return { dx: cxp - L.cx(box), dy: cyp - L.cy(box) }
    }

    private clampDelta(id: PartId, dx: number, dy: number): { dx: number; dy: number } {
        const box = this.partScreenRect(id)
        const a = L.VIEW_AREA
        const slack = 60

        const minDX = a.x - box.x - slack
        const maxDX = a.x + a.w - (box.x + box.w) + slack
        const minDY = a.y - box.y - slack
        const maxDY = a.y + a.h - (box.y + box.h) + slack

        return {
            dx: minDX > maxDX ? (minDX + maxDX) / 2 : Phaser.Math.Clamp(dx, minDX, maxDX),
            dy: minDY > maxDY ? (minDY + maxDY) / 2 : Phaser.Math.Clamp(dy, minDY, maxDY),
        }
    }

    private buildHandPiece() {
        this.clearHandPiece()
        if (!this.hand) return

        const def = PARTS[this.hand]
        const p = this.place
        const box = this.partScreenRect(this.hand)

        const rest = this.restDelta(this.hand)
        this.dragDX = rest.dx
        this.dragDY = rest.dy

        const px = p.x + this.dragDX
        const py = p.y + this.dragDY

        const OUT = 3
        const offsets = [
            [-OUT, 0], [OUT, 0], [0, -OUT], [0, OUT],
            [-OUT, -OUT], [OUT, -OUT], [-OUT, OUT], [OUT, OUT],
        ]

        def.layers.forEach(key => {
            const drop = this.add.image(px + 16, py + 18, key)
                .setOrigin(0, 0).setScale(p.scale)
                .setTint(C.preto).setAlpha(0.42)
                .setDepth(26)
            this.handDrop.push(drop)
        })

        def.layers.forEach(key => {
            offsets.forEach(([ox, oy]) => {
                const o = this.add.image(px + ox, py + oy, key)
                    .setOrigin(0, 0).setScale(p.scale)
                    .setTint(0xffffff)
                    .setDepth(27)
                this.handOutline.push(o)
            })
        })

        def.layers.forEach(key => {
            const img = this.add.image(px, py, key)
                .setOrigin(0, 0).setScale(p.scale)
                .setDepth(29)
            this.handMain.push(img)
        })

        this.handZone = this.add.zone(
            box.x + this.dragDX + box.w / 2,
            box.y + this.dragDY + box.h / 2,
            box.w, box.h,
        ).setDepth(30).setInteractive({ useHandCursor: true })

        const all = [...this.handDrop, ...this.handOutline, ...this.handMain]
        all.forEach(i => i.setAlpha(i.alpha * 0))
        this.tweens.add({
            targets: this.handMain, alpha: 1, duration: 200,
        })
        this.tweens.add({
            targets: this.handOutline, alpha: 1, duration: 200,
        })
        this.tweens.add({
            targets: this.handDrop, alpha: 0.42, duration: 200,
        })

        this.tweens.add({
            targets: this.handMain,
            y: py - 5,
            duration: 900,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        })

        const big = box.w > L.VIEW_AREA.w * 0.5 || box.h > L.VIEW_AREA.h * 0.5
        if (big) {
            this.handMain.forEach(i => i.setAlpha(0.72))
            this.handDrop.forEach(i => i.setAlpha(0.24))
        }
    }

    private setHandDelta(dx: number, dy: number) {
        this.dragDX = dx
        this.dragDY = dy

        const p = this.place
        const px = p.x + dx
        const py = p.y + dy

        const OUT = 3
        const offsets = [
            [-OUT, 0], [OUT, 0], [0, -OUT], [0, OUT],
            [-OUT, -OUT], [OUT, -OUT], [-OUT, OUT], [OUT, OUT],
        ]

        this.handMain.forEach(i => i.setPosition(px, py))
        this.handDrop.forEach(i => i.setPosition(px + 16, py + 18))
        this.handOutline.forEach((o, k) => {
            const [ox, oy] = offsets[k % offsets.length]
            o.setPosition(px + ox, py + oy)
        })

        const box = this.partScreenRect(this.hand!)
        this.handZone?.setPosition(box.x + dx + box.w / 2, box.y + dy + box.h / 2)
    }

    private moveHandBy(dx: number, dy: number) {
        const c = this.clampDelta(this.hand!, this.dragDX + dx, this.dragDY + dy)
        this.setHandDelta(c.dx, c.dy)
    }

    private repositionHandPiece() {
        if (!this.hand) return
        if (PARTS[this.hand].view !== this.view) {
            this.clearHandPiece()
            return
        }
        this.buildHandPiece()
    }

    private registerDrag() {
        this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
            if (this.phase !== 'montando' || !this.hand) return
            const box = this.handBoxNow()
            if (!box) return
            if (!Phaser.Geom.Rectangle.Contains(
                new Phaser.Geom.Rectangle(box.x, box.y, box.w, box.h), p.x, p.y,
            )) return
            this.tweens.killTweensOf(this.handMain)
            this.setHandDelta(this.dragDX, this.dragDY)
            this.dragging = true
        })

        this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
            if (!this.dragging) return
            this.moveHandBy(p.x - p.prevPosition.x, p.y - p.prevPosition.y)
        })

        this.input.on('pointerup', () => {
            if (!this.dragging) return
            this.dragging = false
            this.dropHand()
        })
    }

    private layerXY(key: string) {
        const o = offsetOf(key)
        return {
            x: this.place.x + o.x * this.place.scale,
            y: this.place.y + o.y * this.place.scale,
        }
    }

    private partBBox(id: PartId) {
        return unionBBox(PARTS[id].layers)
    }

    private partVisualBBox(id: PartId) {
        const b = this.partBBox(id)
        const o = offsetOf(PARTS[id].layers[0])

        return {
            x: b.x + o.x,
            y: b.y + o.y,
            w: b.w,
            h: b.h,
        }
    }

    private handBoxNow(): L.Rect | null {
        if (!this.hand) return null
        const base = this.partScreenRect(this.hand)
        return {
            x: base.x + this.dragDX,
            y: base.y + this.dragDY,
            w: base.w,
            h: base.h,
        }
    }

    private dropHand() {
        const id = this.hand
        const box = this.handBoxNow()
        if (!id || !box) return

        const cxp = box.x + box.w / 2
        const cyp = box.y + box.h / 2

        const target = this.moulds.find(m =>
            cxp >= m.rect.x - 40 && cxp <= m.rect.x + m.rect.w + 40 &&
            cyp >= m.rect.y - 40 && cyp <= m.rect.y + m.rect.h + 40,
        )

        if (!target) {
            this.returnHand()
            return
        }

        if (target.part !== id) {
            this.registerError()
            this.stamp('selo-x', L.cx(target.rect), L.cy(target.rect))
            this.playError()
            this.cameras.main.shake(160, 0.005)
            this.showToast(
                `${PARTS[id].label} não encaixa aí. ${PARTS[target.part].dica}.`,
                false,
            )
            this.returnHand()

            if (this.consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
                this.time.delayedCall(2200, () => this.showGameOver())
            }
            return
        }

        this.install(id)
    }

    private returnHand() {
        const rest = this.restDelta(this.hand!)
        const toDX = rest.dx
        const toDY = rest.dy

        const fromDX = this.dragDX
        const fromDY = this.dragDY

        this.tweens.add({
            targets: { v: 0 },
            v: 1,
            duration: 240,
            ease: 'Sine.easeOut',
            onUpdate: (_t, o: { v: number }) => {
                this.setHandDelta(
                    Phaser.Math.Linear(fromDX, toDX, o.v),
                    Phaser.Math.Linear(fromDY, toDY, o.v),
                )
            },
            onComplete: () => this.buildHandPiece(),
        })
    }

    private install(id: PartId) {
        this.tweens.killTweensOf(this.handMain)
        this.handZone?.destroy()
        this.handZone = undefined
        this.hand = null

        const off = offsetOf(PARTS[id].layers[0])

        const fromDX = this.dragDX
        const fromDY = this.dragDY

        // considere a escala da view
        const targetDX = off.x * this.place.scale
        const targetDY = off.y * this.place.scale

        this.playNote(720)

        this.tweens.add({
            targets: [...this.handOutline, ...this.handDrop],
            alpha: 0,
            duration: 200,
        })

        this.tweens.add({
            targets: { v: 0 },
            v: 1,
            duration: 260,
            ease: 'Back.easeOut',

            onUpdate: (_t, o: { v: number }) => {
                const dx = Phaser.Math.Linear(fromDX, targetDX, o.v)
                const dy = Phaser.Math.Linear(fromDY, targetDY, o.v)

                const px = this.place.x + dx
                const py = this.place.y + dy

                this.handMain.forEach(i => i.setPosition(px, py))
                this.handOutline.forEach(i => i.setPosition(px, py))
                this.handDrop.forEach(i => i.setPosition(px + 16, py + 18))
            },

            onComplete: () => {
                this.clearHandPiece()
                this.installed.add(id)
                this.buildView()
                this.refreshAll()

                const rect = L.toScreen(this.partVisualBBox(id), this.place)
                this.stamp('selo-ok', L.cx(rect), L.cy(rect))
                this.spark(L.cx(rect), L.cy(rect))

                if (this.challenge.mode === 'montar-quiz'
                    && (this.challenge.quizParts ?? []).includes(id)) {
                    this.time.delayedCall(400, () => this.askPartQuiz(id, () => this.afterInstall()))
                    return
                }

                this.showFunctionCard(id)
                this.time.delayedCall(900, () => this.afterInstall())
            },
        })
    }

    private afterInstall() {
        if (this.phase !== 'montando') return

        if (!bootReady(this.challenge, this.installed)) {
            const next = this.activePart()
            if (next && PARTS[next].view !== this.view) {
                this.switchViewTo(PARTS[next].view, () => this.refreshAll())
            }
            return
        }

        if (this.challenge.bootAnimation) {
            this.refreshAll()
            this.showToast('Tudo no lugar! Aperte LIGAR para ver o computador funcionar.', true)
            return
        }

        this.phase = 'rodando'
        this.refreshAll()
        this.time.delayedCall(400, () => this.celebrateAssembly())
    }

    private partVisualScreenRect(id: PartId): L.Rect {
        return L.toScreen(this.partVisualBBox(id), this.place)
    }

    private onInstalledTap(id: PartId) {
        if (this.phase !== 'montando') return
        this.playTick()
        this.showPartInfo(id)
    }

    private showPartInfo(id: PartId) {
        this.clearOverlay()

        const def = PARTS[id]
        const color = CATEGORY_COLOR[def.category]
        const removable =
            !(this.challenge.preInstalled ?? []).includes(id) &&
            this.challenge.available.includes(id)
        const deps = dependentsOf(id, this.installed)

        this.keep(
            this.add.rectangle(L.W / 2, L.H / 2, L.W, L.H, C.preto, 0.84)
                .setDepth(300).setInteractive(),
        )
        const panel = this.keep(this.add.container(L.W / 2, L.H / 2).setDepth(301))

        const pw = 620, ph = 400

        const g = this.add.graphics()
        this.drawCard(g, { x: -pw / 2, y: -ph / 2, w: pw, h: ph }, C.escuro, color, 28, false)

        const tag = this.add.graphics()
        tag.fillStyle(color, 1)
        tag.fillRoundedRect(-96, -ph / 2 + 24, 192, 30, 15)

        panel.add([
            g,
            tag,
            this.add.text(0, -ph / 2 + 39, CATEGORY_LABEL[def.category].toUpperCase(), {
                fontFamily: 'Arial Black, Arial', fontSize: '15px', color: CSS.preto,
            }).setOrigin(0.5).setResolution(2),
            this.add.image(0, -ph / 2 + 118, def.icon).setDisplaySize(92, 92),
            this.add.text(0, -ph / 2 + 194, def.label, {
                fontFamily: 'Arial Black, Arial', fontSize: '30px', color: CSS.creme,
                stroke: CSS.preto, strokeThickness: 6,
            }).setOrigin(0.5).setResolution(2),
            this.add.text(0, -ph / 2 + 262, def.funcao, {
                fontFamily: 'Arial', fontStyle: 'bold', fontSize: '21px', color: CSS.claro,
                align: 'center', wordWrap: { width: pw - 110 },
            }).setOrigin(0.5).setResolution(2),
        ])

        if (removable && !deps.length) {
            panel.add(this.modalButton(-132, ph / 2 - 50, 'Retirar', C.medio, () => {
                this.installed.delete(id)
                this.clearOverlay()
                this.buildView()
                this.refreshAll()
            }))
            panel.add(this.modalButton(132, ph / 2 - 50, 'Fechar', C.verde,
                () => this.clearOverlay()))
        } else {
            if (deps.length) {
                panel.add(
                    this.add.text(0, ph / 2 - 92,
                        `${PARTS[deps[0]].label} depende desta peça.`, {
                        fontFamily: 'Arial', fontStyle: 'bold', fontSize: '15px',
                        color: CSS.ouro,
                    }).setOrigin(0.5).setResolution(2),
                )
            }
            panel.add(this.modalButton(0, ph / 2 - 50, 'Fechar', C.verde,
                () => this.clearOverlay()))
        }

        panel.setAlpha(0).setScale(0.94)
        this.tweens.add({ targets: panel, alpha: 1, scale: 1, duration: 220, ease: 'Back.easeOut' })
    }

    private clearBuild() {
        if (this.phase !== 'montando') return
        const keep = new Set(this.challenge.preInstalled ?? [])
        this.installed = new Set([...this.installed].filter(id => keep.has(id)))
        this.hand = null
        this.clearHandPiece()
        this.playTick()
        this.buildView()
        this.refreshAll()
    }

    private showFunctionCard(id: PartId) {
        const def = PARTS[id]
        const color = CATEGORY_COLOR[def.category]
        const rect = L.CARD_FUNCTION

        const box = this.add.container(0, 0).setDepth(120)

        const g = this.add.graphics()
        this.drawCard(g, rect, C.escuro, color, 22, false)

        const icon = this.add.image(rect.x + 52, L.cy(rect), def.icon).setDisplaySize(54, 54)

        const name = this.add.text(rect.x + 96, rect.y + 32, def.label, {
            fontFamily: 'Arial Black, Arial', fontSize: '20px',
            color: CSS.creme, stroke: CSS.preto, strokeThickness: 4,
        }).setOrigin(0, 0.5).setResolution(2)

        const cat = this.add.text(rect.w + rect.x - 22, rect.y + 32, CATEGORY_LABEL[def.category], {
            fontFamily: 'Arial Black, Arial', fontSize: '15px',
            color: CSS.claro, stroke: CSS.preto, strokeThickness: 3,
        }).setOrigin(1, 0.5).setResolution(2)

        const desc = this.add.text(rect.x + 96, rect.y + 68, def.funcao, {
            fontFamily: 'Arial', fontStyle: 'bold', fontSize: '16px',
            color: CSS.creme, wordWrap: { width: rect.w - 130 },
        }).setOrigin(0, 0.5).setResolution(2)

        box.add([g, icon, name, cat, desc])
        box.setAlpha(0)
        this.tweens.add({ targets: box, alpha: 1, duration: 200 })
        this.tweens.add({
            targets: box, alpha: 0, duration: 300, delay: 2400,
            onComplete: () => box.destroy(),
        })
    }

    private stamp(key: string, x: number, y: number) {
        const s = this.add.image(x, y, key).setDepth(130)
        s.setDisplaySize(44, 44)
        const full = s.scale
        s.setScale(full * 0.5)

        this.tweens.add({
            targets: s, scale: full, duration: 180, ease: 'Back.easeOut',
            onComplete: () => {
                this.tweens.add({
                    targets: s, alpha: 0, y: y - 14, duration: 260, delay: 420,
                    onComplete: () => s.destroy(),
                })
            },
        })
    }

    private spark(x: number, y: number) {
        for (let i = 0; i < 8; i++) {
            const s = this.add.image(x, y, 'fx-faisca')
                .setDisplaySize(10, 10).setDepth(125)
                .setTint(C.ouro)
                .setBlendMode(Phaser.BlendModes.ADD)
            const a = (Math.PI * 2 * i) / 8
            this.tweens.add({
                targets: s, x: x + Math.cos(a) * 38, y: y + Math.sin(a) * 38,
                alpha: 0, duration: 360, ease: 'Cubic.easeOut',
                onComplete: () => s.destroy(),
            })
        }
    }

    private runBoot() {
        if (!bootReady(this.challenge, this.installed)) return

        this.phase = 'rodando'
        this.hand = null
        this.clearHandPiece()
        this.refreshAll()

        const result = simulateBoot(this.challenge, this.installed)
        this.playBoot(result)
    }

    private playBoot(result: BootResult) {
        const bar = this.add.graphics().setDepth(140)
        const caption = this.add.text(L.W / 2, L.BOOT_CAPTION_Y, '', {
            fontFamily: 'Arial Black, Arial', fontSize: '24px', color: CSS.creme,
            stroke: CSS.preto, strokeThickness: 6, align: 'center',
            wordWrap: { width: 700 },
        }).setOrigin(0.5).setDepth(141).setResolution(2)

        const total = Math.max(1, result.steps.length + (result.ok ? 0 : 1))

        const paintBar = (done: number, color: number) => {
            const r = L.BOOT_BAR
            bar.clear()
            bar.fillStyle(C.preto, 0.8)
            bar.fillRoundedRect(r.x, r.y, r.w, r.h, r.h / 2)
            bar.fillStyle(color, 1)
            bar.fillRoundedRect(
                r.x + 5, r.y + 5,
                Math.max(6, (r.w - 10) * (done / total)), r.h - 10, (r.h - 10) / 2,
            )
            bar.lineStyle(4, C.medio, 1)
            bar.strokeRoundedRect(r.x, r.y, r.w, r.h, r.h / 2)
        }

        paintBar(0, C.ouro)

        const cleanup = () => {
            bar.destroy()
            caption.destroy()
        }

        const runStep = (i: number) => {
            if (i >= result.steps.length) {
                if (result.ok) this.bootSuccess(cleanup)
                else this.bootFailure(result, paintBar, caption, cleanup, total)
                return
            }

            const step = result.steps[i]
            this.switchViewTo(step.view, () => {
                paintBar(i + 1, step.color)
                caption.setText(step.caption).setColor(CSS.creme)
                this.flashParts(step.parts, step.color)
                this.playNote(420 + i * 90)
                this.time.delayedCall(1100, () => runStep(i + 1))
            })
        }

        this.time.delayedCall(400, () => runStep(0))
    }

    private celebrateAssembly() {
        this.flashParts(
            [...this.installed].filter(id => PARTS[id].view === 'oficina'),
            C.amarelo
        )

        this.time.delayedCall(500, () => {
            this.flashParts(
                [...this.installed].filter(id => PARTS[id].view === 'mesa'),
                C.ciano
            )
        })

        this.time.delayedCall(1200, () => {
            this.finishChallenge()
        })
    }

    private flashParts(parts: PartId[], color: number) {
        parts.forEach(id => {
            const imgs = this.partImgs.get(id)
            if (!imgs) return
            imgs.forEach(img => {
                img.setTint(color)
                this.tweens.add({
                    targets: img, alpha: 0.55, duration: 260, yoyo: true, repeat: 1,
                    onComplete: () => { img.clearTint(); img.setAlpha(1) },
                })
            })

            const rect = this.partVisualScreenRect(id)
            const glow = this.add.image(L.cx(rect), L.cy(rect), 'fx-brilho')
                .setDisplaySize(rect.w * 2, rect.h * 2)
                .setTint(color)
                .setBlendMode(Phaser.BlendModes.ADD)
                .setDepth(24)
                .setAlpha(0)
            this.tweens.add({
                targets: glow, alpha: 0.6, duration: 300, yoyo: true, repeat: 1,
                onComplete: () => glow.destroy(),
            })
        })
    }

    private bootSuccess(cleanup: () => void) {
        if (!this.installed.has('monitor')) {
            this.playFanfare()
            this.time.delayedCall(900, () => { cleanup(); this.finishChallenge() })
            return
        }

        this.bootDone = true

        this.switchViewTo('mesa', () => {
            this.buildView()
            this.playFanfare()

            const rect = this.partVisualScreenRect('monitor')
            const glow = this.add.image(L.cx(rect), L.cy(rect), 'fx-brilho')
                .setDisplaySize(rect.w * 2.2, rect.h * 2.2)
                .setTint(C.ciano)
                .setBlendMode(Phaser.BlendModes.ADD)
                .setDepth(24)
                .setAlpha(0)

            this.tweens.add({
                targets: glow, alpha: 0.7, duration: 500, yoyo: true,
                onComplete: () => glow.destroy(),
            })

            this.time.delayedCall(1400, () => {
                cleanup()
                this.bootDone = false
                this.finishChallenge()
            })
        })
    }

    private bootFailure(
        result: BootResult,
        paintBar: (done: number, color: number) => void,
        caption: Phaser.GameObjects.Text,
        cleanup: () => void,
        total: number,
    ) {
        paintBar(total, C.vermelho)
        caption.setText(result.message).setColor(CSS.vermelho)
        this.playError()
        this.cameras.main.shake(220, 0.006)

        const focus = result.extra ?? result.missing
        if (focus && this.installed.has(focus)) {
            const rect = this.partVisualScreenRect(focus)
            this.stamp('selo-x', L.cx(rect), L.cy(rect))
        }

        this.registerError()

        this.time.delayedCall(2800, () => {
            cleanup()
            if (this.consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
                this.showGameOver()
                return
            }
            this.phase = 'montando'
            this.refreshAll()
        })
    }

    private finishChallenge() {
        this.timerEvent?.remove()
        this.timerEvent = undefined

        this.hits++
        this.consecutiveErrors = 0
        this.points += 10

        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER', gameId: GAME_ID,
            pointsEarned: 10, stage: this.levelConfig.level,
        })
        this.emitCheckpoint()

        const cats = new Set([...this.installed].map(id => PARTS[id].category))
        const completo = FLOW_ORDER.every(c => cats.has(c))

        if (!completo) {
            this.advance()
            return
        }
        this.showFlowMap(() => this.advance())
    }

    private registerError() {
        this.errors++
        this.consecutiveErrors++
        runtimeGameBridge.emit({
            type: 'WRONG_ANSWER', gameId: GAME_ID,
            pointsEarned: 0, stage: this.levelConfig.level,
        })
        this.emitCheckpoint()
    }

    private advance() {
        this.challengeIndex++
        if (this.challengeIndex >= this.levelConfig.challenges.length) {
            this.endLevel()
            return
        }
        this.startChallenge()
    }

    private endLevel() {
        this.playFanfare()
        runtimeGameBridge.emit({ type: 'GAME_COMPLETED', gameId: GAME_ID, stage: this.levelConfig.level })
        this.emitCheckpoint()

        const next = this.levelConfig.level < 3 ? (this.levelConfig.level + 1) as 2 | 3 : null

        showLevelCompleteModal(this, {
            title: next ? 'Nível concluído!' : 'Jogo concluído!',
            subtitle: next ? this.levelConfig.title : 'Você montou computadores do zero ao boot.',
            message: `${this.points} pontos  ·  ${this.hits} acertos  ·  ${this.errors} erros`,
            accent: C.ouro,
            progress: { total: 3, current: this.levelConfig.level },
            ...(next
                ? {
                    autoAdvance: {
                        delay: 2600,
                        onComplete: () => this.scene.restart({ level: next, points: this.points }),
                    },
                }
                : {
                    buttons: [
                        {
                            label: 'Jogar de novo', color: C.verde,
                            onClick: () => this.scene.restart({ level: 1, points: 0 }),
                        },
                        {
                            label: 'Sair', color: C.medio,
                            onClick: () => EventBus.emit('exit-game'),
                        },
                    ],
                }),
        })
    }

    private showFlowMap(onDone: () => void) {
        this.clearOverlay()

        this.keep(
            this.add.rectangle(L.W / 2, L.H / 2, L.W, L.H, C.preto, 0.88)
                .setDepth(300).setInteractive(),
        )

        const box = L.FLOW_PANEL
        const chrome = this.keep(this.add.container(0, 0).setDepth(301))

        const g = this.add.graphics()
        this.drawCard(g, box, C.escuro, C.ouro, box.r, false)
        chrome.add(g)

        chrome.add(
            this.add.text(L.W / 2, box.y + 46, 'CAMINHO DA INFORMAÇÃO', {
                fontFamily: 'Arial Black, Arial', fontSize: '25px', color: CSS.ouro,
                stroke: CSS.preto, strokeThickness: 6,
            }).setOrigin(0.5).setResolution(2),
        )

        const well = this.add.graphics()
        well.fillStyle(C.preto, 0.45)
        well.fillRoundedRect(L.FLOW_LIST.x, L.FLOW_LIST.y, L.FLOW_LIST.w, L.FLOW_LIST.h, 18)
        chrome.add(well)

        const groups: Array<{ cat: Category; parts: PartId[] }> = FLOW_ORDER
            .map(cat => ({
                cat,
                parts: [...this.installed].filter(id => PARTS[id].category === cat),
            }))
            .filter(row => row.parts.length > 0)

        const list = this.keep(this.add.container(0, 0).setDepth(302))

        const shape = this.make.graphics({ x: 0, y: 0 }, false)
        shape.fillStyle(0xffffff)
        shape.fillRoundedRect(L.FLOW_LIST.x, L.FLOW_LIST.y, L.FLOW_LIST.w, L.FLOW_LIST.h, 18)
        const mask = shape.createGeometryMask()
        list.setMask(mask)

        groups.forEach((row, i) => {
            const rect = L.flowRow(i)
            const color = CATEGORY_COLOR[row.cat]

            const card = this.add.graphics()
            this.drawCard(card, rect, C.medio, color, 16)

            const tag = this.add.text(rect.x + 20, L.cy(rect), CATEGORY_LABEL[row.cat].toUpperCase(), {
                fontFamily: 'Arial Black, Arial', fontSize: '14px',
                color: CSS.creme, stroke: CSS.preto, strokeThickness: 4,
            }).setOrigin(0, 0.5).setResolution(2)

            list.add([card, tag])

            row.parts.forEach((id, k) => {
                const x = rect.x + 230 + k * 120
                list.add([
                    this.add.image(x, L.cy(rect) - 8, PARTS[id].icon).setDisplaySize(34, 34),
                    this.add.text(x, L.cy(rect) + 20, PARTS[id].label, {
                        fontFamily: 'Arial', fontStyle: 'bold', fontSize: '12px',
                        color: CSS.creme, stroke: CSS.preto, strokeThickness: 3,
                    }).setOrigin(0.5).setResolution(2),
                ])
            })

            if (i < groups.length - 1) {
                list.add(
                    this.add.text(rect.x + 84, rect.y + rect.h + L.FLOW_ROW_GAP / 2, '▼', {
                        fontFamily: 'Arial', fontSize: '18px', color: CSS.ouro,
                    }).setOrigin(0.5).setResolution(2),
                )
            }
        })

        const maxScroll = Math.max(0, L.flowContentHeight(groups.length) - L.FLOW_LIST.h)
        let scroll = 0

        const barG = this.add.graphics().setDepth(303)
        chrome.add(barG)

        const paintBar = () => {
            barG.clear()
            if (maxScroll <= 0) return
            const b = L.FLOW_SCROLLBAR
            barG.fillStyle(C.preto, 0.7)
            barG.fillRoundedRect(b.x, b.y, b.w, b.h, b.w / 2)
            const visible = L.FLOW_LIST.h / (L.FLOW_LIST.h + maxScroll)
            const th = Math.max(40, b.h * visible)
            const ty = b.y + (b.h - th) * (scroll / maxScroll)
            barG.fillStyle(C.ouro, 1)
            barG.fillRoundedRect(b.x, ty, b.w, th, b.w / 2)
        }

        const setScroll = (v: number) => {
            scroll = Phaser.Math.Clamp(v, 0, maxScroll)
            list.setY(-scroll)
            paintBar()
        }

        paintBar()

        const inList = (p: Phaser.Input.Pointer) =>
            p.x >= L.FLOW_LIST.x && p.x <= L.FLOW_LIST.x + L.FLOW_LIST.w &&
            p.y >= L.FLOW_LIST.y && p.y <= L.FLOW_LIST.y + L.FLOW_LIST.h

        let dragging = false
        let startY = 0
        let startScroll = 0

        const onDown = (p: Phaser.Input.Pointer) => {
            if (!inList(p) || maxScroll <= 0) return
            dragging = true
            startY = p.y
            startScroll = scroll
        }
        const onMove = (p: Phaser.Input.Pointer) => {
            if (!dragging) return
            setScroll(startScroll - (p.y - startY))
        }
        const onUp = () => { dragging = false }
        const onWheel = (p: Phaser.Input.Pointer, _o: unknown, _dx: number, dy: number) => {
            if (!inList(p)) return
            setScroll(scroll + dy * 0.5)
        }

        this.input.on('pointerdown', onDown)
        this.input.on('pointermove', onMove)
        this.input.on('pointerup', onUp)
        this.input.on('wheel', onWheel)

        chrome.add(
            this.add.text(L.W / 2, box.y + box.h - 96, this.challenge.explanation, {
                fontFamily: 'Arial', fontStyle: 'bold', fontSize: '20px', color: CSS.claro,
                align: 'center', wordWrap: { width: box.w - 90 },
            }).setOrigin(0.5).setResolution(2).setY(510)
        )

        const close = () => {
            this.input.off('pointerdown', onDown)
            this.input.off('pointermove', onMove)
            this.input.off('pointerup', onUp)
            this.input.off('wheel', onWheel)
            list.clearMask()
            mask.destroy()
            shape.destroy()
            this.clearOverlay()
            onDone()
        }

        chrome.add(this.modalButton(L.W / 2, box.y + box.h - 42, 'Continuar', C.verde, close))

        chrome.setAlpha(0)
        list.setAlpha(0)
        this.tweens.add({ targets: [chrome, list], alpha: 1, duration: 240 })
    }

    private pendingParts(): PartId[] {
        return this.challenge.available.filter(id => !this.installed.has(id))
    }

    private activePart(): PartId | null {
        const pending = this.pendingParts()
        const ready = pending.filter(id => canInstall(id, this.installed))
        if (!ready.length) return null

        const inView = ready.filter(id => PARTS[id].view === this.view)
        return (inView.length ? inView : ready)[0]
    }

    private tutorialSteps(): TutorialStep[] {
        const pad = 16
        const around = (r: L.Rect): Partial<TutorialStep> => ({
            shape: 'rect', x: L.cx(r), y: L.cy(r), w: r.w + pad, h: r.h + pad,
        })

        if (this.levelConfig.level === 1) {
            return [
                {
                    text: 'Esta é a bancada. Aqui você monta o computador por dentro.',
                    ...around(L.VIEW_AREA),
                } as TutorialStep,
                {
                    text: 'Toque em PEÇAS para abrir a caixa e escolher o que instalar.',
                    ...around(L.BTN_DRAWER),
                } as TutorialStep,
                {
                    text: 'A peça escolhida aparece aqui. Arraste ela até a sombra piscando.',
                    ...around(L.HAND_SLOT),
                } as TutorialStep,
                {
                    text: 'Este botão troca entre o gabinete e a mesa. Teclado e monitor ficam na mesa.',
                    ...around(L.BTN_VIEW),
                } as TutorialStep,
                {
                    text: 'Quando tudo estiver no lugar, LIGAR acende e o computador liga na sua frente.',
                    ...around(L.BTN_POWER),
                } as TutorialStep,
            ]
        }

        if (this.levelConfig.level === 2) {
            return [
                {
                    text: 'Agora as sombras sumiram. Cada lugar vazio diz o que a peça dele faz.',
                    ...around(L.VIEW_AREA),
                } as TutorialStep,
                {
                    text: 'Leia a frase, escolha a peça na caixa e arraste até lá.',
                    ...around(L.BTN_DRAWER),
                } as TutorialStep,
                {
                    text: 'Errou o lugar? Sem problema: a peça volta para a sua mão.',
                    shape: 'none', balloonY: 360, buttonLabel: 'Entendi!',
                } as TutorialStep,
            ]
        }

        return [
            {
                text: 'Aqui os computadores já vêm com problema. Alguns não ligam, outros perdem arquivos.',
                ...around(L.VIEW_AREA),
            } as TutorialStep,
            {
                text: 'Aperte LIGAR e veja até onde ele consegue chegar. É aí que está a pista.',
                ...around(L.BTN_POWER),
            } as TutorialStep,
            {
                text: 'No fim, você monta um computador inteiro sozinho. Nenhuma sombra, nenhuma dica.',
                shape: 'none', balloonY: 360, buttonLabel: 'Vamos lá!',
            } as TutorialStep,
            {
                text: 'Agora é prova. Primeiro perguntas sobre o que cada peça faz.',
                ...around(L.VIEW_AREA),
            } as TutorialStep,
        ]
    }

    private runTutorial(onDone: () => void) {
        if (this.tutorialOpen) return
        this.tutorialOpen = true

        const wasPhase = this.phase
        this.phase = 'rodando'

        createTutorial(this, {
            key: `computador-l${this.levelConfig.level}`,
            accent: C.ouro,
            safeTop: L.UI_BAR_H,
            once: false,
            steps: this.tutorialSteps(),
            onFinish: () => {
                this.tutorialOpen = false
                this.phase = wasPhase
                onDone()
            },
        })
    }

    private keep<Obj extends Phaser.GameObjects.GameObject>(obj: Obj): Obj {
        this.overlay.push(obj)
        return obj
    }

    private clearOverlay() {
        this.overlay.forEach(o => { if (o.active) o.destroy() })
        this.overlay = []
    }

    private showToast(message: string, good: boolean) {
        const panel = this.add.container(L.W / 2, L.TOAST_Y).setDepth(150)

        const text = this.add.text(0, 0, message, {
            fontFamily: 'Arial Black, Arial', fontSize: '17px', color: CSS.creme,
            stroke: CSS.preto, strokeThickness: 5,
            align: 'center', wordWrap: { width: 620 },
        }).setOrigin(0.5).setResolution(2)

        const w = 700
        const h = Math.max(64, text.height + 32)
        const g = this.add.graphics()
        this.drawCard(g, { x: -w / 2, y: -h / 2, w, h }, C.escuro, good ? C.verde : C.vermelho, 20, false)

        panel.add([g, text])
        panel.setAlpha(0).setScale(0.95)
        this.tweens.add({ targets: panel, alpha: 1, scale: 1, duration: 200, ease: 'Back.easeOut' })
        this.tweens.add({
            targets: panel, alpha: 0, duration: 300, delay: 2400,
            onComplete: () => panel.destroy(),
        })
    }

    private showLevelStart(onStart: () => void) {
        this.clearOverlay()
        this.keep(
            this.add.rectangle(L.W / 2, L.H / 2, L.W, L.H, C.preto, 0.9)
                .setDepth(300).setInteractive(),
        )
        const panel = this.keep(this.add.container(L.W / 2, L.H / 2).setDepth(301))

        const pw = 640, ph = 460

        const g = this.add.graphics()
        this.drawCard(g, { x: -pw / 2, y: -ph / 2, w: pw, h: ph }, C.escuro, C.ouro, 30, false)

        panel.add([
            g,
            this.add.text(0, -ph / 2 + 52, `NÍVEL ${this.levelConfig.level} DE 3`, {
                fontFamily: 'Arial Black, Arial', fontSize: '21px', color: CSS.ouro,
                stroke: CSS.preto, strokeThickness: 5,
            }).setOrigin(0.5).setResolution(2),
            this.add.text(0, -ph / 2 + 122, this.levelConfig.title, {
                fontFamily: 'Arial Black, Arial', fontSize: '32px', color: CSS.creme,
                stroke: CSS.preto, strokeThickness: 6,
                align: 'center', wordWrap: { width: pw - 80 },
            }).setOrigin(0.5).setResolution(2),
            this.add.text(0, -ph / 2 + 218, this.levelConfig.objective, {
                fontFamily: 'Arial', fontStyle: 'bold', fontSize: '25px', color: CSS.claro,
                align: 'center', wordWrap: { width: pw - 100 },
            }).setOrigin(0.5).setResolution(2),
            this.add.text(0, -ph / 2 + 328, this.levelConfig.tip, {
                fontFamily: 'Arial', fontSize: '23px', color: CSS.ouro,
                align: 'center', wordWrap: { width: pw - 110 },
            }).setOrigin(0.5).setResolution(2),
        ])

        panel.add(this.modalButton(0, ph / 2 - 54, 'Começar', C.verde, () => {
            this.clearOverlay()
            onStart()
        }))

        panel.setAlpha(0).setScale(0.92)
        this.tweens.add({ targets: panel, alpha: 1, scale: 1, duration: 260, ease: 'Back.easeOut' })
    }

    private showGameOver() {
        this.clearOverlay()
        this.timerEvent?.remove()
        this.timerEvent = undefined

        showLevelCompleteModal(this, {
            title: 'Quase lá!',
            subtitle: 'Três tentativas seguidas sem acertar.',
            message: this.challenge.explanation,
            accent: C.vermelho,
            buttons: [
                {
                    label: 'Tentar de novo', color: C.verde,
                    onClick: () => this.scene.restart({
                        level: this.levelConfig.level, points: this.points,
                    }),
                },
                {
                    label: 'Sair', color: C.medio,
                    onClick: () => EventBus.emit('exit-game'),
                },
            ],
        })

        runtimeGameBridge.emit({ type: 'GAME_OVER', gameId: GAME_ID, stage: this.levelConfig.level })
    }

    private makeButton(rect: L.Rect, label: string, color: number, onClick: () => void) {
        const container = this.add.container(L.cx(rect), L.cy(rect))
        const g = this.add.graphics()
        const text = this.add.text(0, 0, label, {
            fontFamily: 'Arial Black, Arial', fontSize: '19px', color: CSS.creme,
            stroke: CSS.preto, strokeThickness: 5,
        }).setOrigin(0.5).setResolution(2)

        container.add([g, text])
        container.setData('bg', g)
        container.setData('color', color)
        container.setData('rect', rect)
        container.setData('label', text)
        this.paintButton(container, true)

        const zone = this.add.zone(L.cx(rect), L.cy(rect), rect.w, rect.h)
            .setInteractive({ useHandCursor: true })
        zone.on('pointerup', () => {
            if (container.getData('disabled')) return
            this.tweens.add({ targets: container, scale: 0.96, duration: 70, yoyo: true })
            this.time.delayedCall(40, onClick)
        })

        this.uiLayer.add([container, zone])
        return container
    }

    private paintButton(btn: Phaser.GameObjects.Container, enabled: boolean) {
        const g = btn.getData('bg') as Phaser.GameObjects.Graphics
        const rect = btn.getData('rect') as L.Rect
        const color = btn.getData('color') as number
        btn.setData('disabled', !enabled)

        const r = rect.h / 2
        g.clear()
        g.fillStyle(C.preto, 0.6)
        g.fillRoundedRect(-rect.w / 2, -rect.h / 2 + 6, rect.w, rect.h, r)
        g.fillStyle(enabled ? color : C.apagado, 1)
        g.fillRoundedRect(-rect.w / 2, -rect.h / 2, rect.w, rect.h, r)
        g.fillStyle(0xffffff, enabled ? 0.2 : 0.06)
        g.fillRoundedRect(-rect.w / 2 + 6, -rect.h / 2 + 5, rect.w - 12, rect.h * 0.34, r * 0.7)
        g.lineStyle(4, enabled ? C.ouro : C.medio, enabled ? 0.95 : 0.4)
        g.strokeRoundedRect(-rect.w / 2, -rect.h / 2, rect.w, rect.h, r)
    }

    private modalButton(x: number, y: number, label: string, color: number, onClick: () => void) {
        const w = 240, h = 58
        const container = this.add.container(x, y)

        const g = this.add.graphics()
        g.fillStyle(C.preto, 0.6)
        g.fillRoundedRect(-w / 2, -h / 2 + 6, w, h, h / 2)
        g.fillStyle(color, 1)
        g.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
        g.fillStyle(0xffffff, 0.2)
        g.fillRoundedRect(-w / 2 + 7, -h / 2 + 5, w - 14, h * 0.34, h / 4)
        g.lineStyle(4, C.creme, 1)
        g.strokeRoundedRect(-w / 2, -h / 2, w, h, h / 2)

        const text = this.add.text(0, 0, label, {
            fontFamily: 'Arial Black, Arial', fontSize: '19px', color: CSS.creme,
            stroke: CSS.preto, strokeThickness: 5,
        }).setOrigin(0.5).setResolution(2)

        container.add([g, text])
        container.setSize(w, h)
        container.setInteractive({ useHandCursor: true })

        let armed = false
        container.on('pointerdown', () => {
            armed = true
            this.tweens.add({ targets: container, scale: 0.95, duration: 70, yoyo: true })
        })
        container.on('pointerup', () => {
            if (!armed) return
            armed = false
            this.playTick()
            this.time.delayedCall(60, onClick)
        })
        return container
    }

    private audioCtx(): AudioContext | null {
        try {
            return (this.sound as Phaser.Sound.WebAudioSoundManager).context
        } catch {
            return null
        }
    }

    private playNote(freq: number, type: OscillatorType = 'sine', dur = 0.1, gain = 0.14) {
        const ctx = this.audioCtx()
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

    private playTick() { this.playNote(540, 'sine', 0.04, 0.08) }

    private playError() {
        this.playNote(300, 'square', 0.18, 0.14)
        this.time.delayedCall(140, () => this.playNote(220, 'square', 0.22, 0.12))
    }

    private playFanfare() {
        [523, 659, 784, 1047].forEach((f, i) =>
            this.time.delayedCall(i * 130, () => this.playNote(f, 'sine', 0.22, 0.2)))
    }

    private registerPlatformCommands() {
        this.unsubPlatform = runtimeGameBridge.onCommand((cmd: PlatformCommand) => {
            if (cmd.type !== 'START_GAME') return
            if (cmd.gameId !== GAME_ID) return
            if (cmd.stage === this.levelConfig.level) return
            this.time.delayedCall(100, () => {
                this.scene.restart({ level: cmd.stage as 1 | 2 | 3, points: this.points })
            })
        })
    }
}