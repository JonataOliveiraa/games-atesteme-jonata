import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { LEVELS } from '../data/levels'
import { C, CSS, A } from '../data/theme'
import { FILES, KIND_COLOR, KIND_ICON, KIND_LABEL, STORAGES, isRemote } from '../data/items'
import * as L from '../data/layout'
import type {
    DropPhase,
    FileTask,
    LevelConfig,
    PhaseConfig,
    RescuePhase,
    StorageId,
} from '../types'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'

const GAME_ID = 'missao-arquivo-seguro'
const ORDER: StorageId[] = ['disco', 'pendrive', 'nuvem']

interface DestView {
    id: StorageId
    card: Phaser.GameObjects.Graphics
    icon: Phaser.GameObjects.Image
    slotsG: Phaser.GameObjects.Graphics
    stackLayer: Phaser.GameObjects.Container
    badge?: Phaser.GameObjects.Image
    overlay?: Phaser.GameObjects.Image
    selected: boolean
    dead: boolean
    pickG: Phaser.GameObjects.Graphics
    tagText?: Phaser.GameObjects.Text
}

export class GameScene extends Phaser.Scene {
    private lives!: Lives
    private livesTotal = 3
    private livesLeft = 3
    private levelIdx = 0
    private phaseIdx = 0
    private points = 0
    private hits = 0
    private errors = 0
    private consecutiveErrors = 0
    private locked = true
    private ended = false

    private ctxBtn?: Phaser.GameObjects.Container
    private visible: StorageId[] = []

    private hintG!: Phaser.GameObjects.Graphics
    private hintLayer!: Phaser.GameObjects.Container
    private tutorialOpen = false
    private tutorialSeen = false

    private taskIndex = 0
    private used: Record<StorageId, number> = { disco: 0, pendrive: 0, nuvem: 0 }
    private copiesDone: StorageId[] = []

    private dests = new Map<StorageId, DestView>()
    private card?: Phaser.GameObjects.Container
    private cardHome = { x: 0, y: 0 }

    private deadId?: StorageId
    private askBox?: Phaser.GameObjects.Container

    private rescuePicked = new Set<StorageId>()
    private confirmBtn?: Phaser.GameObjects.Container

    private overlayObjs: Phaser.GameObjects.GameObject[] = []
    private unsubPlatform?: () => void

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; phase?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this, 3)
        this.livesLeft = data?.lives ?? this.livesTotal
        this.levelIdx = (data.level ?? 1) - 1
        this.phaseIdx = data.phase ?? 0
        this.points = data.points ?? 0
        this.hits = 0
        this.errors = 0
        this.consecutiveErrors = 0
        this.locked = true
        this.ended = false
        this.taskIndex = 0
        this.used = { disco: 0, pendrive: 0, nuvem: 0 }
        this.copiesDone = []
        this.dests = new Map()
        this.card = undefined
        this.rescuePicked = new Set()
        this.overlayObjs = []
        this.visible = []
        this.deadId = undefined
    }

    private get level(): LevelConfig {
        return LEVELS[this.levelIdx]
    }

    private get phase(): PhaseConfig {
        return this.level.phases[this.phaseIdx]
    }

    private get task(): FileTask {
        return (this.phase as DropPhase).tasks[this.taskIndex]
    }

    create() {
        this.drawBackground()
        this.buildDestinations()
        this.registerDrag()
        this.registerPlatformCommands()

        EventBus.on('timer-end', () => this.onTimeUp(), this)
        EventBus.on('show-tutorial', () => this.runTutorials(() => { }, true), this)

        this.events.once('shutdown', () => {
            this.clearOverlay()
            EventBus.off('timer-end', undefined, this)
            EventBus.off('show-tutorial', undefined, this)
            EventBus.emit('timer-stop')
            this.unsubPlatform?.()
        })

        // GAME_READY não carrega fase: quando ele sai, a partida ainda não começou
        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()
        this.broadcastMission()

        this.prepareBoard()

        if (this.phaseIdx > 0) EventBus.emit('tutorial-ready')

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


    private prepareBoard() {
        if (this.phase.kind === 'recuperar') {
            const p = this.phase as RescuePhase
            const file = FILES[p.file]
            p.savedIn.forEach(id => {
                this.used[id] += file.size
                this.pushToStack(id, file.icon)
                this.paintDest(id)
            })
            return
        }

        this.copiesDone = []
        this.spawnCard()
        this.buildContexto()
    }

    private startPhase() {
        if (this.phase.kind === 'recuperar') {
            this.buildRescue()
            return
        }

        this.locked = false
        if (this.level.timeLimit) EventBus.emit('timer-start', this.level.timeLimit)
    }

    private drawBackground() {
        const key = this.phase.kind === 'recuperar' ? 'bg-sala' : 'bg-mesa'
        this.add.image(L.W / 2, L.H / 2, key).setDisplaySize(L.W, L.H).setDepth(-2)

        const veil = this.add.graphics().setDepth(-1)
        veil.fillStyle(C.fundo, 0.35)
        veil.fillRect(0, 0, L.W, L.H)
    }

    private capacityOf(id: StorageId): number {
        const p = this.phase
        if (p.kind === 'recuperar') return STORAGES[id].slots
        return p.capacity?.[id] ?? STORAGES[id].slots
    }

    private isOffline(): boolean {
        return this.phase.kind !== 'recuperar' && !!(this.phase as DropPhase).offline
    }

    private visibleDests(): StorageId[] {
        if (this.phase.kind === 'recuperar') return ORDER
        return (this.phase as DropPhase).visible ?? ORDER
    }

    private buildDestinations() {
        this.hintG = this.add.graphics().setDepth(3)
        this.hintLayer = this.add.container(0, 0).setDepth(3)
        this.visible = this.visibleDests()

        this.visible.forEach(id => {
            const def = STORAGES[id]
            const rect = L.DEST_RECT[id]

            const card = this.add.graphics().setDepth(4)

            this.add.text(L.cx(rect), rect.y + L.DEST_SLOT.labelY, def.label, {
                fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '21px',
                color: CSS.creme, stroke: CSS.preto, strokeThickness: 5,
            }).setOrigin(0.5).setDepth(6).setResolution(2)

            const kindBadge = this.add.image(
                rect.x + 42, rect.y + L.DEST_SLOT.badgeY, KIND_ICON[def.kind],
            ).setDisplaySize(L.ICON.selo, L.ICON.selo).setDepth(6)

            this.add.text(rect.x + 74, rect.y + L.DEST_SLOT.badgeY, KIND_LABEL[def.kind], {
                fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '18px',
                color: CSS.ouro, stroke: CSS.preto, strokeThickness: 4,
            }).setOrigin(0, 0.5).setDepth(6).setResolution(2)

            const icon = this.add.image(L.cx(rect), rect.y + L.DEST_SLOT.iconY, def.icon)
                .setDisplaySize(L.ICON.destino, L.ICON.destino)
                .setDepth(5)

            const slotsG = this.add.graphics().setDepth(6)
            const stackLayer = this.add.container(0, 0).setDepth(7)
            const pickG = this.add.graphics().setDepth(11)

            const view: DestView = {
                id, card, icon, slotsG, stackLayer, pickG, selected: false, dead: false,
            }

            if (def.needsInternet) {
                view.badge = this.add.image(
                    rect.x + rect.w - 42, rect.y + L.DEST_SLOT.badgeY, 'icone-wifi',
                ).setDisplaySize(L.ICON.selo, L.ICON.selo).setDepth(6)
            }

            const zone = this.add.zone(L.cx(rect), L.cy(rect), rect.w, rect.h)
                .setDepth(8).setInteractive({ useHandCursor: true })
            zone.on('pointerup', () => this.onDestTap(id))

            const kindZone = this.add.zone(
                kindBadge.x, kindBadge.y, L.ICON.selo + 16, L.ICON.selo + 16,
            ).setDepth(10).setInteractive({ useHandCursor: true })
            kindZone.on('pointerup', () => this.showBadgeInfo(id, 'kind'))

            if (view.badge) {
                const wifiZone = this.add.zone(
                    view.badge.x, view.badge.y, L.ICON.selo + 16, L.ICON.selo + 16,
                ).setDepth(10).setInteractive({ useHandCursor: true })
                wifiZone.on('pointerup', () => this.showBadgeInfo(id, 'wifi'))
            }

            this.dests.set(id, view)
            this.paintDest(id)
        })
    }

    private showBadgeInfo(id: StorageId, which: 'kind' | 'wifi') {
        if (this.locked) return
        this.locked = true
        this.clearOverlay()
        this.playTone(560, 0.04, 'sine', 0.08)

        const def = STORAGES[id]
        const box = L.INFO_PANEL

        const icone = which === 'wifi' ? 'icone-wifi' : KIND_ICON[def.kind]
        const titulo = which === 'wifi' ? 'PRECISA DE INTERNET' : KIND_LABEL[def.kind]
        const corpo = which === 'wifi'
            ? 'Este destino fica num computador da internet. Sem conexão, você não alcança seus arquivos.'
            : def.kind === 'local'
                ? `Este selo quer dizer que o arquivo fica dentro do computador. ${def.limite}`
                : `Este selo quer dizer que o arquivo sai deste computador. ${def.vantagem}`

        this.keep(this.add.rectangle(L.W / 2, L.H / 2, L.W, L.H, C.preto, A.veu)
            .setDepth(300).setInteractive())

        const panel = this.keep(this.add.container(0, 0).setDepth(301))
        const g = this.add.graphics()
        this.drawCard(g, box, C.fundo, C.ouro, box.r, 6, false)

        panel.add([
            g,
            this.add.image(L.cx(box), box.y + 96, icone)
                .setDisplaySize(L.ICON.seloGrande, L.ICON.seloGrande),
            this.add.text(L.cx(box), box.y + 172, titulo, {
                fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '26px',
                color: CSS.ouro, stroke: CSS.preto, strokeThickness: 6,
            }).setOrigin(0.5).setResolution(2),
            this.add.text(L.cx(box), box.y + 250, corpo, {
                fontFamily: 'DynaPuff, Arial, sans-serif', fontStyle: 'bold', fontSize: '21px',
                color: CSS.creme, align: 'center', wordWrap: { width: box.w - 80 },
            }).setOrigin(0.5).setResolution(2),
        ])

        panel.add(this.makeButton(L.cx(box), box.y + box.h - 44, 240, 58, 'Entendi', () => {
            this.clearOverlay()
            this.locked = false
        }))

        panel.setAlpha(0).setScale(0.94)
        this.tweens.add({ targets: panel, alpha: 1, scale: 1, duration: 220, ease: 'Back.easeOut' })
    }

    private paintDest(id: StorageId) {
        const view = this.dests.get(id)!
        const def = STORAGES[id]
        const rect = L.DEST_RECT[id]
        const blocked = view.dead || (def.needsInternet && this.isOffline())

        const stroke = view.selected ? C.ouro : KIND_COLOR[def.kind]
        const thick = view.selected ? 9 : def.kind === 'local' ? 5 : 8

        view.card.clear()
        view.card.fillStyle(C.preto, A.sombra)
        view.card.fillRoundedRect(rect.x, rect.y + 7, rect.w, rect.h, 26)
        view.card.fillStyle(C.fundo, 1)
        view.card.fillRoundedRect(rect.x, rect.y, rect.w, rect.h, 26)
        view.card.lineStyle(thick, stroke, 1)
        view.card.strokeRoundedRect(rect.x, rect.y, rect.w, rect.h, 26)

        view.icon.setAlpha(blocked ? A.apagado : 1)
        view.badge?.setAlpha(blocked ? A.apagado : 1)

        const rescue = this.phase.kind === 'recuperar'
        const cap = this.capacityOf(id)
        const usedN = this.used[id]

        view.slotsG.clear()
        if (!rescue) {
            const gap = 22
            const startX = L.cx(rect) - ((cap - 1) * gap) / 2
            const y = rect.y + L.DEST_SLOT.dotsY
            for (let i = 0; i < cap; i++) {
                const x = startX + i * gap
                view.slotsG.fillStyle(C.preto, A.sombra)
                view.slotsG.fillCircle(x, y + 2, 8)
                view.slotsG.fillStyle(C.creme, i < usedN ? 1 : A.apagado)
                view.slotsG.fillCircle(x, y, 7)
            }
        }

        view.pickG.clear()
        if (rescue && view.selected) {
            const cxp = rect.x + rect.w - 34
            const cyp = rect.y + rect.h - 34
            view.pickG.fillStyle(C.preto, A.sombra)
            view.pickG.fillCircle(cxp, cyp + 3, 22)
            view.pickG.fillStyle(C.ouro, 1)
            view.pickG.fillCircle(cxp, cyp, 20)
            view.pickG.lineStyle(4, C.creme, 1)
            view.pickG.strokeCircle(cxp, cyp, 20)
        }

        view.overlay?.destroy()
        view.overlay = undefined

        if (blocked) {
            view.overlay = this.add.image(L.cx(rect), rect.y + L.DEST_SLOT.iconY, 'selo-x')
                .setDisplaySize(L.ICON.seloGrande, L.ICON.seloGrande).setDepth(9)
        } else if (!rescue && usedN >= cap) {
            view.overlay = this.add.image(L.cx(rect), rect.y + L.DEST_SLOT.iconY, 'dest-cheio')
                .setDisplaySize(L.ICON.destino, L.ICON.destino).setDepth(9)
        }
    }

    private drawCard(
        g: Phaser.GameObjects.Graphics,
        r: L.Rect, fill: number, stroke: number,
        radius = 22, thick = 4, glossy = true,
    ) {
        g.fillStyle(C.preto, A.sombra)
        g.fillRoundedRect(r.x, r.y + 7, r.w, r.h, radius)
        g.fillStyle(fill, 1)
        g.fillRoundedRect(r.x, r.y, r.w, r.h, radius)
        if (glossy) {
            g.fillStyle(0xffffff, A.brilho)
            g.fillRoundedRect(r.x + 6, r.y + 5, r.w - 12, r.h * 0.3, radius * 0.6)
        }
        g.lineStyle(thick, stroke, 1)
        g.strokeRoundedRect(r.x, r.y, r.w, r.h, radius)
    }

    private pushToStack(id: StorageId, iconKey: string) {
        const view = this.dests.get(id)
        if (!view) return
        const rect = L.DEST_RECT[id]
        const n = view.stackLayer.length
        const img = this.add.image(
            rect.x + 38 + (n % 4) * 56,
            rect.y + L.DEST_SLOT.stackY,
            iconKey,
        ).setDisplaySize(50, 50)
        view.stackLayer.add(img)
    }

    private nextTask() {
        const p = this.phase as DropPhase

        if (this.taskIndex >= p.tasks.length) {
            this.phaseComplete()
            return
        }

        this.copiesDone = []
        this.spawnCard()
        this.buildContexto()
    }

    private buildContexto() {
        this.ctxBtn?.destroy()
        this.ctxBtn = undefined

        const t = this.task
        if (!t.contexto && !t.situacao) return

        const slot = L.CTX_SLOT
        const box = this.add.container(L.CTX_CX, L.CARD_CY).setDepth(28)

        const g = this.add.graphics()
        this.drawCard(
            g, { x: -slot.w / 2, y: -slot.h / 2, w: slot.w, h: slot.h },
            C.fundo, C.ouro, 22, 5, false,
        )

        const icon = this.add.image(0, -10, 'contexto')
            .setDisplaySize(L.ICON.arquivo, L.ICON.arquivo)

        const name = this.add.text(0, slot.h / 2 - 26, 'A SITUAÇÃO', {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '18px',
            color: CSS.ouro, stroke: CSS.preto, strokeThickness: 5,
        }).setOrigin(0.5).setResolution(2)

        const info = this.add.text(0, slot.h / 2 + 24, 'Toque para ler', {
            fontFamily: 'DynaPuff, Arial, sans-serif', fontStyle: 'bold', fontSize: '18px',
            color: CSS.creme, stroke: CSS.preto, strokeThickness: 4,
        }).setOrigin(0.5).setResolution(2)

        box.add([g, icon, name, info])
        box.setSize(slot.w, slot.h)
        box.setInteractive({ useHandCursor: true })
        box.on('pointerup', () => this.showContexto())

        box.setAlpha(0).setScale(0.9)
        this.tweens.add({ targets: box, alpha: 1, scale: 1, duration: 220, ease: 'Back.easeOut' })
        this.tweens.add({
            targets: box, y: L.CARD_CY - 6,
            duration: 950, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
        })

        this.ctxBtn = box
    }

    private showContexto() {
        this.locked = true
        this.clearOverlay()
        this.playTone(560, 0.04, 'sine', 0.08)

        const t = this.task
        const def = FILES[t.file]
        const box = L.CONTEXT_PANEL

        this.keep(this.add.rectangle(L.W / 2, L.H / 2, L.W, L.H, C.preto, A.veu)
            .setDepth(300).setInteractive())

        const panel = this.keep(this.add.container(0, 0).setDepth(301))
        const g = this.add.graphics()
        this.drawCard(g, box, C.fundo, C.ouro, box.radius, 6, false)

        panel.add([
            g,
            this.add.image(L.cx(box), box.y + 88, def.icon)
                .setDisplaySize(L.ICON.arquivo, L.ICON.arquivo),
            this.add.text(L.cx(box), box.y + 156, def.label, {
                fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '26px',
                color: CSS.ouro, stroke: CSS.preto, strokeThickness: 6,
            }).setOrigin(0.5).setResolution(2),
            this.add.text(L.cx(box), box.y + 244, t.contexto ?? t.situacao ?? '', {
                fontFamily: 'DynaPuff, Arial, sans-serif', fontStyle: 'bold', fontSize: '21px',
                color: CSS.creme, align: 'center', wordWrap: { width: box.w - 80 },
                lineSpacing: 6,
            }).setOrigin(0.5).setResolution(2),
        ])

        panel.add(this.makeButton(L.cx(box), box.y + box.h - 44, 240, 58, 'Entendi', () => {
            this.clearOverlay()
            this.locked = false
        }))

        panel.setAlpha(0).setScale(0.94)
        this.tweens.add({ targets: panel, alpha: 1, scale: 1, duration: 220, ease: 'Back.easeOut' })
    }

    private spawnCard() {
        this.card?.destroy()

        const def = FILES[this.task.file]
        const slot = L.CARD_SLOT
        const need = this.task.copies ?? 1

        const temCtx = !!(this.task.contexto || this.task.situacao)
        this.cardHome = { x: temCtx ? L.CARD_CX_PAIR : L.CARD_CX_SOLO, y: L.CARD_CY }

        const box = this.add.container(this.cardHome.x, this.cardHome.y).setDepth(30)

        const g = this.add.graphics()
        this.drawCard(
            g, { x: -slot.w / 2, y: -slot.h / 2, w: slot.w, h: slot.h },
            C.fundo, C.ouro, 22, 5, false,
        )

        const icon = this.add.image(0, -10, def.icon)
            .setDisplaySize(L.ICON.arquivo, L.ICON.arquivo)

        const name = this.add.text(0, slot.h / 2 - 26, def.label, {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '18px',
            color: CSS.creme, stroke: CSS.preto, strokeThickness: 5,
            align: 'center', wordWrap: { width: slot.w - 12 },
        }).setOrigin(0.5).setResolution(2)

        const info = this.add.text(0, slot.h / 2 + 24,
            need > 1
                ? `${need} cópias  ·  ocupa ${def.size}`
                : `Ocupa ${def.size} espaço${def.size > 1 ? 's' : ''}`, {
            fontFamily: 'DynaPuff, Arial, sans-serif', fontStyle: 'bold', fontSize: '18px',
            color: CSS.ouro, stroke: CSS.preto, strokeThickness: 4,
        }).setOrigin(0.5).setResolution(2)

        box.add([g, icon, name, info])
        box.setSize(slot.w, slot.h)
        box.setInteractive({ useHandCursor: true })
        this.input.setDraggable(box)

        box.setAlpha(0).setScale(0.9)
        this.tweens.add({ targets: box, alpha: 1, scale: 1, duration: 220, ease: 'Back.easeOut' })
        this.tweens.add({
            targets: box, y: this.cardHome.y - 6,
            duration: 950, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
        })

        this.card = box
        this.refreshHints()
    }

    private registerDrag() {
        this.input.on('dragstart', (_p: Phaser.Input.Pointer, obj: Phaser.GameObjects.Container) => {
            if (this.locked || obj !== this.card) return
            this.tweens.killTweensOf(obj)
            obj.setDepth(40).setScale(1.06)
            this.playTone(620, 0.04, 'sine', 0.08)
        })

        this.input.on('drag', (
            _p: Phaser.Input.Pointer,
            obj: Phaser.GameObjects.Container,
            x: number, y: number,
        ) => {
            if (this.locked || obj !== this.card) return
            obj.setPosition(x, y)
            this.highlightHover(x, y)
        })

        this.input.on('dragend', (_p: Phaser.Input.Pointer, obj: Phaser.GameObjects.Container) => {
            if (this.locked || obj !== this.card) return
            obj.setScale(1).setDepth(30)
            const target = this.destAt(obj.x, obj.y)
            this.clearHover()
            if (!target) {
                this.returnCard()
                return
            }
            this.tryDrop(target)
        })
    }

    private destAt(x: number, y: number): StorageId | null {
        return this.visible.find(id => {
            const r = L.DEST_RECT[id]
            return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h
        }) ?? null
    }

    private highlightHover(x: number, y: number) {
        const over = this.destAt(x, y)
        this.visible.forEach(id => {
            const view = this.dests.get(id)!
            const on = id === over
            if (view.selected === on) return
            view.selected = on
            this.paintDest(id)
        })
    }

    private clearHover() {
        this.visible.forEach(id => {
            const view = this.dests.get(id)!
            if (!view.selected) return
            view.selected = false
            this.paintDest(id)
        })
    }

    private returnCard() {
        if (!this.card) return
        this.tweens.add({
            targets: this.card,
            x: this.cardHome.x, y: this.cardHome.y,
            duration: 240, ease: 'Sine.easeOut',
            onComplete: () => {
                if (!this.card) return
                this.tweens.add({
                    targets: this.card, y: this.cardHome.y - 6,
                    duration: 950, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
                })
            },
        })
    }

    private tryDrop(id: StorageId) {
        const def = STORAGES[id]
        const file = FILES[this.task.file]
        const rect = L.DEST_RECT[id]

        if (def.needsInternet && this.isOffline()) {
            this.rejectDrop(`Sem internet a nuvem não abre. ${def.limite}`, rect)
            return
        }

        if (this.copiesDone.includes(id)) {
            this.rejectDrop('Esta cópia já está aqui. Escolha outro destino.', rect)
            return
        }

        if (this.used[id] + file.size > this.capacityOf(id)) {
            this.rejectDrop(`${file.label} não cabe no ${def.label}. ${def.limite}`, rect)
            return
        }

        if (!this.task.accepts.includes(id)) {
            this.registerError()
            this.stamp('selo-x', L.cx(rect), rect.y + 128)
            this.playError()
            this.cameras.main.shake(160, 0.005)
            this.showToast(`${def.label} não resolve aqui. ${def.limite}`)
            this.returnCard()
            if (this.lives.remaining <= 0) {
                this.time.delayedCall(2000, () => this.showGameOver())
            }
            return
        }

        this.acceptDrop(id)
    }

    private rejectDrop(message: string, rect: L.Rect) {
        this.playError()
        this.stamp('selo-x', L.cx(rect), rect.y + 128)
        this.showToast(message)
        this.returnCard()
    }

    private acceptDrop(id: StorageId) {
        const file = FILES[this.task.file]
        const rect = L.DEST_RECT[id]
        const need = this.task.copies ?? 1

        this.used[id] += file.size
        this.copiesDone.push(id)
        this.pushToStack(id, file.icon)
        this.paintDest(id)

        this.playTone(760, 0.09, 'triangle', 0.16)
        this.stamp(isRemote(id) ? 'selo-remoto' : 'selo-local', L.cx(rect), rect.y + 128)
        this.spark(L.cx(rect), rect.y + 128)

        this.card?.destroy()
        this.card = undefined

        if (this.copiesDone.length < need) {
            const falta = need - this.copiesDone.length
            this.showToast(`Cópia guardada. Faltam ${falta} em outro destino.`)
            this.time.delayedCall(700, () => this.spawnCard())
            return
        }

        if (this.task.requireRemote && !this.copiesDone.some(isRemote)) {
            this.registerError()
            this.resolve(false, 'As duas cópias ficaram neste computador. Uma precisa ir para fora dele.')
            return
        }

        this.hits++
        this.consecutiveErrors = 0
        this.points += 10
        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER', gameId: GAME_ID,
            pointsEarned: 10, stage: this.level.level,
        })
        this.emitCheckpoint()

        this.ctxBtn?.destroy()
        this.ctxBtn = undefined

        this.showExplain(this.task.explain, () => {
            this.taskIndex++
            this.nextTask()
        })
    }

    private buildRescue() {
        const p = this.phase as RescuePhase
        const file = FILES[p.file]

        this.locked = true
        this.tagDests(p.savedIn, 'GUARDADO AQUI', C.ouro)
        this.buildAsk(`Você guardou o ${file.label} nestes dois lugares.`, file.icon)

        this.time.delayedCall(1600, () => {
            this.showAccident(p, () => {
                const hit: StorageId = p.accident === 'pendrive-perdido' ? 'pendrive'
                    : p.accident === 'disco-quebrado' ? 'disco' : 'nuvem'

                this.deadId = hit
                const view = this.dests.get(hit)
                if (view) {
                    view.dead = true
                    view.stackLayer.setAlpha(A.apagado)
                    this.paintDest(hit)
                    this.cameras.main.shake(240, 0.006)
                    this.playError()
                }

                this.clearTags()
                this.tagDests([hit], 'PERDIDO', C.creme)
                this.tagDests(p.savedIn.filter(id => id !== hit), 'AINDA TEM?', C.ouro)

                this.time.delayedCall(1000, () => {
                    this.buildAsk(
                        `Onde o ${file.label} ainda existe? Toque no lugar e confirme.`,
                        file.icon,
                    )
                    this.buildConfirm()

                    this.rescueTutorial(hit, () => {
                        this.locked = false
                        if (this.level.timeLimit) EventBus.emit('timer-start', this.level.timeLimit)
                    })
                })
            })
        })
    }

    private rescueTutorial(hit: StorageId, onDone: () => void) {
        if (this.phaseIdx > 1) { onDone(); return }

        this.tutorialOpen = true
        const rect = L.DEST_RECT[hit]

        createTutorial(this, {
            key: `arquivo-resgate-f${this.phaseIdx}`,
            accent: C.ouro,
            safeTop: L.UI_BAR_H,
            once: false,
            steps: [
                {
                    text: 'Este lugar se perdeu. Tudo que estava só aqui acabou.',
                    shape: 'rect', x: L.cx(rect), y: L.cy(rect),
                    w: rect.w + 28, h: rect.h + 28,
                } as TutorialStep,
                {
                    text: 'A etiqueta de cada destino diz o que sobrou depois do acidente.',
                    shape: 'rect', x: L.W / 2,
                    y: L.DEST_RECT.disco.y + L.DEST_SLOT.dotsY,
                    w: L.DEST_RECT.nuvem.x + L.DEST_W - L.DEST_RECT.disco.x + 40, h: 60,
                    balloonY: 560,
                } as TutorialStep,
                {
                    text: 'Toque no destino que ainda tem o arquivo e depois em Confirmar.',
                    shape: 'rect', x: L.cx(L.BTN_CONFIRM), y: L.cy(L.BTN_CONFIRM),
                    w: L.BTN_CONFIRM.w + 28, h: L.BTN_CONFIRM.h + 28,
                    buttonLabel: 'Entendi!',
                } as TutorialStep,
            ],
            onFinish: () => {
                this.tutorialOpen = false
                if (!this.tutorialSeen) {
                    this.tutorialSeen = true
                    EventBus.emit('tutorial-ready')
                }
                onDone()
            },
        })
    }

    private tagDests(ids: StorageId[], label: string, color: number) {
        ids.forEach(id => {
            const view = this.dests.get(id)
            if (!view) return
            view.tagText?.destroy()

            const rect = L.DEST_RECT[id]
            view.tagText = this.add.text(L.cx(rect), rect.y + L.DEST_SLOT.dotsY, label, {
                fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '18px',
                color: color === C.ouro ? CSS.ouro : CSS.creme,
                stroke: CSS.preto, strokeThickness: 5,
            }).setOrigin(0.5).setDepth(11).setResolution(2)

            this.tweens.add({
                targets: view.tagText, alpha: 0.45,
                duration: 700, yoyo: true, repeat: -1,
            })
        })
    }

    private clearTags() {
        this.dests.forEach(v => {
            if (!v.tagText) return
            this.tweens.killTweensOf(v.tagText)
            v.tagText.destroy()
            v.tagText = undefined
        })
    }

    private buildAsk(message: string, iconKey: string) {
        this.askBox?.destroy()

        const r = L.RESCUE_ASK
        const box = this.add.container(0, 0).setDepth(14)

        const g = this.add.graphics()
        this.drawCard(g, r, C.fundo, C.ouro, 22, 5, false)

        const icon = this.add.image(r.x + 58, L.cy(r), iconKey)
            .setDisplaySize(64, 64)

        const text = this.add.text(r.x + 108, L.cy(r), message, {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '21px',
            color: CSS.creme, stroke: CSS.preto, strokeThickness: 5,
            wordWrap: { width: r.w - 140 },
        }).setOrigin(0, 0.5).setResolution(2)

        box.add([g, icon, text])
        box.setAlpha(0)
        this.tweens.add({ targets: box, alpha: 1, duration: 240 })

        this.askBox = box
    }

    private buildConfirm() {
        this.confirmBtn?.destroy()
        const r = L.BTN_CONFIRM
        this.confirmBtn = this.makeButton(
            L.cx(r), L.cy(r), r.w, r.h, 'Confirmar', () => this.confirmRescue(),
        )
        this.confirmBtn.setDepth(14).setAlpha(0.4)
    }

    private onDestTap(id: StorageId) {
        if (this.locked) return
        if (this.phase.kind !== 'recuperar') return

        const view = this.dests.get(id)!
        if (view.dead) {
            this.playError()
            this.showToast('Este lugar se perdeu. O arquivo que estava só aqui acabou.')
            return
        }

        view.selected = !view.selected
        if (view.selected) this.rescuePicked.add(id)
        else this.rescuePicked.delete(id)

        this.playTone(600, 0.05, 'sine', 0.1)
        this.paintDest(id)
        this.confirmBtn?.setAlpha(this.rescuePicked.size ? 1 : 0.4)
    }

    private confirmRescue() {
        const p = this.phase as RescuePhase
        if (!this.rescuePicked.size) return

        const picked = [...this.rescuePicked].sort().join('|')
        const answer = [...p.answer].sort().join('|')
        const ok = picked === answer

        if (ok) {
            this.hits++
            this.consecutiveErrors = 0
            this.points += 10
            runtimeGameBridge.emit({
                type: 'CORRECT_ANSWER', gameId: GAME_ID,
                pointsEarned: 10, stage: this.level.level,
            })
        } else {
            this.registerError()
        }

        this.emitCheckpoint()
        this.clearTags()
        this.askBox?.destroy()
        this.askBox = undefined

        this.resolve(ok, ok
            ? p.explain
            : `O arquivo sobreviveu em ${p.answer.map(id => STORAGES[id].label).join(' e ')}. ${p.explain}`)
    }

    private showAccident(p: RescuePhase, onDone: () => void) {
        this.locked = true
        this.clearOverlay()

        this.keep(this.add.rectangle(L.W / 2, L.H / 2, L.W, L.H, C.preto, A.veu)
            .setDepth(300).setInteractive())

        const panel = this.keep(this.add.container(0, 0).setDepth(301))
        const box = L.ACCIDENT_PANEL

        const g = this.add.graphics()
        this.drawCard(g, box, C.fundo, C.ouro, box.r, 6)

        panel.add([
            g,
            this.add.image(L.cx(box), box.y + 120, `evento-${p.accident}`)
                .setDisplaySize(L.ICON.evento - 30, L.ICON.evento - 30),
            this.add.text(L.cx(box), box.y + 268, p.accidentText, {
                fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '21px',
                color: CSS.creme, stroke: CSS.preto, strokeThickness: 5,
                align: 'center', wordWrap: { width: box.w - 90 },
            }).setOrigin(0.5).setResolution(2),
        ])

        panel.add(this.makeButton(L.cx(box), box.y + box.h - 45, 280, 60, 'Ver o estrago', () => {
            this.clearOverlay()
            onDone()
        }))

        panel.setAlpha(0).setScale(0.94)
        this.tweens.add({ targets: panel, alpha: 1, scale: 1, duration: 260, ease: 'Back.easeOut' })
    }

    private showExplain(message: string, onDone: () => void) {
        this.locked = true
        this.clearOverlay()

        this.keep(this.add.rectangle(L.W / 2, L.H / 2, L.W, L.H, C.preto, A.veu)
            .setDepth(300).setInteractive())

        const panel = this.keep(this.add.container(0, 0).setDepth(301))
        const box = L.PANEL

        const g = this.add.graphics()
        this.drawCard(g, box, C.fundo, C.ouro, box.r, 6)

        panel.add([
            g,
            this.add.image(L.cx(box), box.y + 110, 'selo-ok')
                .setDisplaySize(L.ICON.seloGrande, L.ICON.seloGrande),
            this.add.text(L.cx(box), box.y + 186, 'Boa escolha!', {
                fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '30px',
                color: CSS.ouro, stroke: CSS.preto, strokeThickness: 6,
            }).setOrigin(0.5).setResolution(2),
            this.add.text(L.cx(box), box.y + 272, message, {
                fontFamily: 'DynaPuff, Arial, sans-serif', fontStyle: 'bold', fontSize: '21px',
                color: CSS.creme, align: 'center', wordWrap: { width: box.w - 90 },
            }).setOrigin(0.5).setResolution(2),
        ])

        panel.add(this.makeButton(L.cx(box), box.y + box.h - 46, 260, 60, 'Continuar', () => {
            this.clearOverlay()
            this.locked = false
            onDone()
        }))

        panel.setAlpha(0).setScale(0.94)
        this.tweens.add({ targets: panel, alpha: 1, scale: 1, duration: 240, ease: 'Back.easeOut' })
    }

    private resolve(correct: boolean, message: string) {
        this.locked = true
        EventBus.emit('timer-stop')

        if (correct) this.playFanfare()
        else this.playError()

        this.clearOverlay()

        this.keep(this.add.rectangle(L.W / 2, L.H / 2, L.W, L.H, C.preto, A.veu)
            .setDepth(300).setInteractive())

        const panel = this.keep(this.add.container(0, 0).setDepth(301))
        const box = L.PANEL

        const g = this.add.graphics()
        this.drawCard(g, box, C.fundo, C.ouro, box.r, correct ? 6 : 9)

        panel.add([
            g,
            this.add.image(L.cx(box), box.y + 110, correct ? 'selo-ok' : 'selo-x')
                .setDisplaySize(L.ICON.seloGrande, L.ICON.seloGrande),
            this.add.text(L.cx(box), box.y + 186, correct ? 'Muito bem!' : 'Quase lá!', {
                fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '32px',
                color: CSS.ouro, stroke: CSS.preto, strokeThickness: 6,
            }).setOrigin(0.5).setResolution(2),
            this.add.text(L.cx(box), box.y + 276, message, {
                fontFamily: 'DynaPuff, Arial, sans-serif', fontStyle: 'bold', fontSize: '21px',
                color: CSS.creme, align: 'center', wordWrap: { width: box.w - 90 },
            }).setOrigin(0.5).setResolution(2),
        ])

        panel.add(this.makeButton(
            L.cx(box), box.y + box.h - 46, 280, 60,
            correct ? 'Continuar' : 'Tentar de novo',
            () => {
                this.clearOverlay()
                if (correct) this.completePhase()
                else this.retryPhase()
            },
        ))

        panel.setAlpha(0).setScale(0.94)
        this.tweens.add({ targets: panel, alpha: 1, scale: 1, duration: 240, ease: 'Back.easeOut' })
    }

    private phaseComplete() {
        EventBus.emit('timer-stop')
        this.completePhase()
    }

    private retryPhase() {
        this.scene.restart({ lives: this.livesLeft, 
            level: this.level.level, phase: this.phaseIdx, points: this.points,
        })
    }

    private completePhase() {
        const lastPhase = this.phaseIdx + 1 >= this.level.phases.length
        const lastLevel = this.levelIdx + 1 >= LEVELS.length

        if (!lastPhase) {
            this.scene.restart({ lives: this.livesLeft, 
                level: this.level.level, phase: this.phaseIdx + 1, points: this.points,
            })
            return
        }

        /*
         * Este evento sai a CADA nível concluído, e é `isFinalStage` que separa
         * "acabou o nível 1" de "acabou o jogo". Sem ele, quem está de fora
         * aprovaria o aluno na primeira fase.
         */
        runtimeGameBridge.emit({
            type: 'GAME_COMPLETED',
            gameId: GAME_ID,
            stage: this.level.level,
            totalStages: LEVELS.length,
            isFinalStage: lastLevel,
        })
        this.emitCheckpoint()

        if (!lastLevel) {
            showLevelComplete(this, {
                title: 'Nível concluído!',
                subtitle: this.level.title,
                message: LEVELS[this.levelIdx + 1].objective,
                accent: C.ouro,
                overlayColor: C.preto,
                titleColor: CSS.ouro,
                subtitleColor: CSS.creme,
                progress: { total: LEVELS.length, current: this.level.level },
                autoAdvance: {
                    delay: 2600,
                    onComplete: () => this.scene.restart({ lives: this.livesLeft, 
                        level: this.level.level + 1, phase: 0, points: this.points,
                    }),
                },
            })
            return
        }

        // o GAME_COMPLETED com isFinalStage já saiu acima; `FINISH_GAME` era um
        // tipo que não existe no contrato e ninguém do lado de fora reconhecia
        this.ended = true

        showLevelComplete(this, {
            title: 'Jogo concluído!',
            subtitle: 'Você já sabe onde cada arquivo deve ficar',
            message: `${this.points} pontos  ·  ${this.hits} acertos  ·  ${this.errors} erros`,
            accent: C.ouro,
            overlayColor: C.preto,
            titleColor: CSS.ouro,
            subtitleColor: CSS.ouro,
            progress: { total: LEVELS.length, current: LEVELS.length },
            buttons: [
                {
                    label: 'Jogar de novo', color: C.ouro,
                    onClick: () => this.scene.restart({ lives: this.livesTotal, level: 1, phase: 0, points: 0 }),
                },
                {
                    label: 'Sair', color: C.preto,
                    onClick: () => EventBus.emit('exit-game'),
                },
            ],
        })
    }

    private showGameOver() {
        this.locked = true
        EventBus.emit('timer-stop')
        this.clearOverlay()

        // o GAME_OVER sai do componente de vidas, no zero. Aqui é só a tela.

        showLevelComplete(this, {
            title: 'Quase lá!',
            subtitle: 'Três escolhas seguidas sem acertar.',
            message: this.level.tip,
            accent: C.creme,
            overlayColor: C.preto,
            titleColor: CSS.ouro,
            subtitleColor: CSS.creme,
            buttons: [
                {
                    label: 'Tentar de novo', color: C.ouro,
                    onClick: () => this.retryPhase(),
                },
                {
                    label: 'Sair', color: C.creme,
                    onClick: () => EventBus.emit('exit-game'),
                },
            ],
        })
    }

    private onTimeUp() {
        if (this.ended || this.locked) return
        this.registerError()
        this.resolve(false, 'O tempo acabou. Leia a situação com calma e tente de novo.')
    }

    private registerError() {
        this.errors++
        this.consecutiveErrors++
        this.points = Math.max(0, this.points - 3)
        runtimeGameBridge.emit({
            type: 'WRONG_ANSWER', gameId: GAME_ID,
            pointsEarned: -3, stage: this.level.level,
        })
            this.lives.lose(); this.livesLeft = this.lives.remaining
        this.emitCheckpoint()
    }

    private emitCheckpoint() {
        const done = this.levelIdx * 4 + this.phaseIdx
        runtimeGameBridge.emit({
            type: 'CHECKPOINT', gameId: GAME_ID,
            stage: this.level.level,
            progress: Math.round((done / (LEVELS.length * 4)) * 100),
            score: this.points,
            hits: this.hits, errors: this.errors,
        })
    }

    private broadcastMission() {
        EventBus.emit('mission-update', {
            level: this.level.level,
            phaseIndex: this.phaseIdx,
            totalPhases: this.level.phases.length,
            instruction: this.phase.instruction,
            sub: this.phase.sub,
        })
    }

    private hintTargets(): StorageId[] {
        if (this.phase.kind !== 'classificar') return []
        const file = FILES[this.task.file]

        return this.visible.filter(id => {
            const view = this.dests.get(id)
            if (!view || view.dead) return false
            if (STORAGES[id].needsInternet && this.isOffline()) return false
            if (this.copiesDone.includes(id)) return false
            if (!this.task.accepts.includes(id)) return false
            return this.used[id] + file.size <= this.capacityOf(id)
        })
    }

    private refreshHints() {
        this.clearHints()
        const alvos = this.hintTargets()
        if (!alvos.length) return

        alvos.forEach(id => {
            const r = L.DEST_RECT[id]
            this.dashedRect(this.hintG, { x: r.x - 12, y: r.y - 12, w: r.w + 24, h: r.h + 24 })

            const t = this.add.text(L.cx(r), r.y - 30, 'SOLTE AQUI', {
                fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '18px',
                color: CSS.ouro, stroke: CSS.preto, strokeThickness: 5,
            }).setOrigin(0.5).setResolution(2)
            this.hintLayer.add(t)
        })

        this.tweens.add({
            targets: [this.hintG, this.hintLayer],
            alpha: 0.35, duration: 760, yoyo: true, repeat: -1,
        })
    }

    private clearHints() {
        this.tweens.killTweensOf([this.hintG, this.hintLayer])
        this.hintG.clear().setAlpha(1)
        this.hintLayer.removeAll(true)
        this.hintLayer.setAlpha(1)
    }

    private dashedRect(g: Phaser.GameObjects.Graphics, r: L.Rect) {
        const dash = 16
        const gap = 10
        g.lineStyle(5, C.ouro, 1)

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

    private showLevelIntro(onStart: () => void) {
        this.clearOverlay()

        this.keep(this.add.rectangle(L.W / 2, L.H / 2, L.W, L.H, C.preto, A.veu)
            .setDepth(400).setInteractive())

        const panel = this.keep(this.add.container(L.W / 2, L.H / 2).setDepth(401))
        const pw = 660, ph = 460

        const g = this.add.graphics()
        this.drawCard(g, { x: -pw / 2, y: -ph / 2, w: pw, h: ph }, C.fundo, C.ouro, 30, 6)

        panel.add([
            g,
            this.add.text(0, -ph / 2 + 52, `NÍVEL ${this.level.level} DE ${LEVELS.length}`, {
                fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '21px',
                color: CSS.ouro, stroke: CSS.preto, strokeThickness: 5,
            }).setOrigin(0.5).setResolution(2),
            this.add.text(0, -ph / 2 + 122, this.level.title, {
                fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '32px',
                color: CSS.creme, stroke: CSS.preto, strokeThickness: 6,
                align: 'center', wordWrap: { width: pw - 80 },
            }).setOrigin(0.5).setResolution(2),
            this.add.text(0, -ph / 2 + 216, this.level.objective, {
                fontFamily: 'DynaPuff, Arial, sans-serif', fontStyle: 'bold', fontSize: '21px',
                color: CSS.creme, align: 'center', wordWrap: { width: pw - 110 },
            }).setOrigin(0.5).setResolution(2),
            this.add.text(0, -ph / 2 + 316, this.level.tip, {
                fontFamily: 'DynaPuff, Arial, sans-serif', fontStyle: 'bold', fontSize: '18px',
                color: CSS.ouro, align: 'center', wordWrap: { width: pw - 120 },
            }).setOrigin(0.5).setResolution(2),
        ])

        panel.add(this.makeButton(0, ph / 2 - 54, 280, 60, 'Começar', () => {
            this.clearOverlay()
            onStart()
        }))

        panel.setAlpha(0).setScale(0.92)
        this.tweens.add({ targets: panel, alpha: 1, scale: 1, duration: 280, ease: 'Back.easeOut' })
    }

    private runTutorials(onDone: () => void, forced = false) {
        if (this.tutorialOpen) { onDone(); return }

        const steps: TutorialStep[] = []
        const around = (r: L.Rect): Partial<TutorialStep> => ({
            shape: 'rect', x: L.cx(r), y: L.cy(r), w: r.w + 28, h: r.h + 28,
        })

        const lv = this.level.level
        const ph = this.phaseIdx
        const header = { shape: 'rect', x: L.W / 2, y: 50, w: 780, h: 88 } as Partial<TutorialStep>

        if (lv === 1 && ph === 0) {
            steps.push(
                {
                    text: 'Aqui em cima fica a sua missão. A linha branca diz o que fazer e a dourada explica o porquê.',
                    ...header, balloonY: 200,
                } as TutorialStep,
                {
                    text: 'À direita, cada círculo é uma fase deste nível. O dourado é a fase de agora.',
                    shape: 'rect', x: 1128, y: 46, w: 200, h: 70, balloonY: 200, balloonX: 880,
                } as TutorialStep,
                {
                    text: 'Este é o Disco Local. Ele fica dentro do computador e o arquivo nunca sai daqui.',
                    ...around(L.DEST_RECT.disco),
                } as TutorialStep,
                {
                    text: 'O selo do topo diz se o destino é local ou remoto. Toque nele quando quiser reler.',
                    shape: 'rect',
                    x: L.DEST_RECT.disco.x + 90,
                    y: L.DEST_RECT.disco.y + L.DEST_SLOT.badgeY,
                    w: 190, h: 70, balloonY: 470,
                } as TutorialStep,
                {
                    text: 'Estes círculos são o espaço do destino. Preenchidos estão ocupados, vazios estão livres.',
                    shape: 'rect',
                    x: L.cx(L.DEST_RECT.disco),
                    y: L.DEST_RECT.disco.y + L.DEST_SLOT.dotsY,
                    w: L.DEST_W, h: 56, balloonY: 560,
                } as TutorialStep,
                {
                    text: 'Arraste o documento até a moldura piscando. Arquivo grande gasta mais espaço.',
                    ...around(L.CARD_SLOT), buttonLabel: 'Entendi!',
                } as TutorialStep,
            )
        }

        if (lv === 1 && ph === 1) {
            steps.push(
                {
                    text: 'Chegou o Pen Drive. Você desconecta e leva no bolso, então ele é um destino remoto.',
                    ...around(L.DEST_RECT.pendrive),
                } as TutorialStep,
                {
                    text: 'Repare que ele tem menos espaço que o disco: cabe pouca coisa.',
                    shape: 'rect',
                    x: L.cx(L.DEST_RECT.pendrive),
                    y: L.DEST_RECT.pendrive.y + L.DEST_SLOT.dotsY,
                    w: L.DEST_W, h: 56, balloonY: 560, buttonLabel: 'Entendi!',
                } as TutorialStep,
            )
        }

        if (lv === 1 && ph === 2) {
            steps.push(
                {
                    text: 'Chegou a Nuvem. O arquivo fica num computador da internet, longe deste aqui.',
                    ...around(L.DEST_RECT.nuvem),
                } as TutorialStep,
                {
                    text: 'Este selo avisa que ela depende de internet. Sem conexão, a nuvem não aceita nada.',
                    shape: 'rect',
                    x: L.DEST_RECT.nuvem.x + L.DEST_RECT.nuvem.w - 42,
                    y: L.DEST_RECT.nuvem.y + L.DEST_SLOT.badgeY,
                    w: 90, h: 70, balloonY: 470, buttonLabel: 'Entendi!',
                } as TutorialStep,
            )
        }

        if (lv === 2 && ph === 0) {
            steps.push(
                {
                    text: 'Agora as molduras sumiram: nenhum destino vem marcado. A escolha é toda sua.',
                    shape: 'rect', x: L.W / 2, y: L.cy(L.DEST_RECT.disco),
                    w: L.DEST_RECT.nuvem.x + L.DEST_W - L.DEST_RECT.disco.x + 40,
                    h: L.DEST_H + 28,
                } as TutorialStep,
                {
                    text: 'Este cartão guarda a situação do arquivo. Toque nele e leia antes de arrastar.',
                    ...around(L.CTX_SLOT),
                } as TutorialStep,
                {
                    text: 'A situação sempre tem um detalhe que aponta o destino: internet, tamanho ou quem vai abrir.',
                    shape: 'none', balloonY: 400, buttonLabel: 'Entendi!',
                } as TutorialStep,
            )
        }

        if (!steps.length && forced) {
            steps.push({
                text: this.phase.kind === 'recuperar'
                    ? 'Toque no destino que ainda tem o arquivo depois do acidente e confirme.'
                    : 'Leia a missão no topo, confira o espaço de cada destino e arraste o documento para onde ele deve ficar.',
                shape: 'none', balloonY: 400, buttonLabel: 'Entendi!',
            } as TutorialStep)
        }

        if (lv === 3 && ph === 0 && this.phase.kind !== 'recuperar') {
            steps.push(
                {
                    text: 'Aqui o mesmo arquivo precisa ir para dois destinos diferentes.',
                } as TutorialStep,
                {
                    text: 'Uma das cópias tem que sair deste computador. Isso se chama backup.',
                    shape: 'none', balloonY: 400,
                } as TutorialStep,
                {
                    text: 'Cada cópia ocupa mais memória.',
                    shape: 'rect', x: L.W / 2,
                    y: L.DEST_RECT.disco.y + L.DEST_SLOT.dotsY,
                    w: L.DEST_RECT.nuvem.x + L.DEST_W - L.DEST_RECT.disco.x + 40, h: 56,
                    balloonY: 560,
                } as TutorialStep,
                {
                    text: 'E agora tem tempo: fique de olho na faixa..',
                    shape: 'rect', x: L.W / 2, y: L.UI_BAR_H - 6, w: L.W, h: 44,
                    buttonLabel: 'Vamos lá!',
                } as TutorialStep,
            )
        }

        if (!steps.length && forced) {
            steps.push({
                text: 'Leia a missão no topo, confira o espaço de cada destino e arraste o documento para onde ele deve ficar.',
                shape: 'none', balloonY: 400, buttonLabel: 'Entendi!',
            } as TutorialStep)
        }

        if (!steps.length) { onDone(); return }

        this.tutorialOpen = true
        const wasLocked = this.locked
        this.locked = true

        createTutorial(this, {
            key: `arquivo-l${lv}-f${ph}`,
            accent: C.ouro,
            safeTop: L.UI_BAR_H,
            once: false,
            steps,
            onFinish: () => {
                this.tutorialOpen = false
                this.locked = wasLocked
                if (!this.tutorialSeen) {
                    this.tutorialSeen = true
                    EventBus.emit('tutorial-ready')
                }
                onDone()
            },
        })
    }

    private makeButton(
        x: number, y: number, w: number, h: number,
        label: string, onClick: () => void,
    ) {
        const btn = this.add.container(x, y).setDepth(310)

        const g = this.add.graphics()
        g.fillStyle(C.preto, A.sombra)
        g.fillRoundedRect(-w / 2, -h / 2 + 6, w, h, h / 2)
        g.fillStyle(C.ouro, 1)
        g.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
        g.fillStyle(0xffffff, A.brilho)
        g.fillRoundedRect(-w / 2 + 7, -h / 2 + 5, w - 14, h * 0.32, h / 4)
        g.lineStyle(4, C.creme, 1)
        g.strokeRoundedRect(-w / 2, -h / 2, w, h, h / 2)

        const text = this.add.text(0, 0, label, {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '21px',
            color: CSS.preto,
        }).setOrigin(0.5).setResolution(2)

        btn.add([g, text])
        btn.setSize(w, h)
        btn.setInteractive({ useHandCursor: true })

        let armed = false
        btn.on('pointerdown', () => {
            armed = true
            this.tweens.add({ targets: btn, scale: 0.95, duration: 70, yoyo: true })
        })
        btn.on('pointerup', () => {
            if (!armed) return
            armed = false
            this.playTone(560, 0.04, 'sine', 0.08)
            this.time.delayedCall(60, onClick)
        })
        return btn
    }

    private showToast(message: string) {
        const panel = this.add.container(L.W / 2, L.TOAST_Y).setDepth(200)

        const text = this.add.text(0, 0, message, {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '18px',
            color: CSS.creme, stroke: CSS.preto, strokeThickness: 5,
            align: 'center', wordWrap: { width: 640 },
        }).setOrigin(0.5).setResolution(2)

        const w = 720
        const h = Math.max(66, text.height + 34)
        const g = this.add.graphics()
        this.drawCard(g, { x: -w / 2, y: -h / 2, w, h }, C.fundo, C.ouro, 20, 5)

        panel.add([g, text])
        panel.setAlpha(0).setScale(0.95)
        this.tweens.add({ targets: panel, alpha: 1, scale: 1, duration: 200, ease: 'Back.easeOut' })
        this.tweens.add({
            targets: panel, alpha: 0, duration: 300, delay: 2400,
            onComplete: () => panel.destroy(),
        })
    }

    private stamp(key: string, x: number, y: number) {
        const s = this.add.image(x, y, key).setDepth(210)
        s.setDisplaySize(L.ICON.seloGrande, L.ICON.seloGrande)
        const full = s.scale
        s.setScale(full * 0.5)

        this.tweens.add({
            targets: s, scale: full, duration: 180, ease: 'Back.easeOut',
            onComplete: () => {
                this.tweens.add({
                    targets: s, alpha: 0, y: y - 16, duration: 280, delay: 460,
                    onComplete: () => s.destroy(),
                })
            },
        })
    }

    private spark(x: number, y: number) {
        for (let i = 0; i < 8; i++) {
            const s = this.add.image(x, y, 'fx-faisca')
                .setDisplaySize(12, 12).setDepth(205)
                .setTint(C.ouro)
                .setBlendMode(Phaser.BlendModes.ADD)
            const a = (Math.PI * 2 * i) / 8
            this.tweens.add({
                targets: s, x: x + Math.cos(a) * 44, y: y + Math.sin(a) * 44,
                alpha: 0, duration: 380, ease: 'Cubic.easeOut',
                onComplete: () => s.destroy(),
            })
        }
    }

    private keep<Obj extends Phaser.GameObjects.GameObject>(obj: Obj): Obj {
        this.overlayObjs.push(obj)
        return obj
    }

    private clearOverlay() {
        this.overlayObjs.forEach(o => { if (o.active) o.destroy() })
        this.overlayObjs = []
    }

    private playTone(freq: number, dur: number, type: OscillatorType = 'sine', gain = 0.16) {
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

    private playError() {
        this.playTone(300, 0.18, 'square', 0.14)
        this.time.delayedCall(140, () => this.playTone(220, 0.22, 'square', 0.12))
    }

    private playFanfare() {
        [523, 659, 784, 1047].forEach((f, i) =>
            this.time.delayedCall(i * 130, () => this.playTone(f, 0.22, 'sine', 0.2)))
    }

    private registerPlatformCommands() {
        this.unsubPlatform = runtimeGameBridge.onCommand((cmd: PlatformCommand) => {
            if (cmd.type !== 'START_GAME') return
            if (cmd.gameId !== GAME_ID) return
            if (cmd.stage === this.level.level) return
            this.time.delayedCall(100, () => {
                this.scene.restart({ lives: this.livesLeft, level: cmd.stage, phase: 0, points: this.points })
            })
        })
    }
}