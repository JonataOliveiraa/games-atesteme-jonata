import Phaser from 'phaser'

import { EventBus } from '../../../shared/EventBus'
import { runtimeGameBridge } from '../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../shared/level/showLevelComplete'
import {
    createTutorial,
    type TutorialStep,
} from '../../../shared/tutorial/createTutorial'
import { SystemLayout } from '../components/SystemLayout'
import {
    LEVELS,
    PROGRAMS,
    RESOURCES,
} from '../data'
import * as L from '../data/layout'
import {
    ALPHA,
    C,
    CSS,
    FONT,
    FONT_SIZE,
    FONT_WEIGHT,
    MOTION,
    PROGRAM_COLOR,
    RADIUS,
    RESOURCE_STATE_VISUAL,
    STROKE,
} from '../data/theme'
import type {
    AttendPhase,
    ConflictPhase,
    ConflictRequestDef,
    GameSceneData,
    LevelConfig,
    MemoryPhase,
    PhaseConfig,
    ProgramId,
    ResourceAvailability,
    ResourceId,
    RunningProgramDef,
    SystemsPhase,
} from '../types'

const GAME_ID = 'sistema-operacional'
const POINTS_PER_PHASE = 10
const FEEDBACK_DURATION = 2200
const CONTENT_DEPTH = 10
const OVERLAY_DEPTH = 300

interface FocusTarget {
    activate: () => void
    paintFocus: (focused: boolean) => void
}

interface MemoryProgramView {
    container: Phaser.GameObjects.Container
    paint: () => void
}

interface ConflictCardView {
    paint: () => void
}

/**
 * Cena principal do EF05CO07.
 *
 * A lógica pedagógica fica aqui; a UIScene recebe apenas o estado do HUD.
 * Cada variante de fase é renderizada por um método próprio, mas todas usam
 * o mesmo painel, feedback, estabilidade, progressão e bridge da plataforma.
 */
export class GameScene extends Phaser.Scene {
    private levelIdx = 0
    private phaseIdx = 0
    private score = 0
    private stability = 3
    private hits = 0
    private errors = 0

    private locked = true
    private ended = false
    private gameOverEmitted = false
    private tutorialSeen = false
    private tutorialOpen = false
    private resetTimer = false
    private skipIntro = false
    private skipTutorial = false

    private runningPrograms: RunningProgramDef[] = []
    private selectedOrder: string[] = []
    private memoryBarGraphics?: Phaser.GameObjects.Graphics
    private memoryProgramViews = new Map<ProgramId, MemoryProgramView>()
    private conflictCardViews = new Map<string, ConflictCardView>()
    private queueContent?: Phaser.GameObjects.Container
    private queueMaskSource?: Phaser.GameObjects.Graphics
    private queueScrollGraphics?: Phaser.GameObjects.Graphics
    private queueScrollY = 0
    private queueMinY = 0

    private focusTargets: FocusTarget[] = []
    private focusIndex = -1
    private feedbackObjects: Phaser.GameObjects.GameObject[] = []
    private overlayObjects: Phaser.GameObjects.GameObject[] = []
    private unsubPlatform?: () => void

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: GameSceneData): void {
        const requestedLevel = Phaser.Math.Clamp(data.level ?? 1, 1, LEVELS.length)

        this.levelIdx = requestedLevel - 1
        this.phaseIdx = Phaser.Math.Clamp(
            data.phase ?? 0,
            0,
            LEVELS[this.levelIdx].phases.length - 1,
        )
        this.score = Math.max(0, data.score ?? 0)
        this.stability = Phaser.Math.Clamp(
            data.stability ?? LEVELS[this.levelIdx].stability,
            0,
            LEVELS[this.levelIdx].stability,
        )
        this.hits = Math.max(0, data.hits ?? 0)
        this.errors = Math.max(0, data.errors ?? 0)
        this.resetTimer = data.resetTimer ?? false
        this.skipIntro = data.skipIntro ?? false
        this.skipTutorial = data.skipTutorial ?? false

        this.locked = true
        this.ended = false
        this.gameOverEmitted = false
        this.tutorialSeen = false
        this.tutorialOpen = false
        this.selectedOrder = []
        this.runningPrograms = []
        this.memoryBarGraphics = undefined
        this.memoryProgramViews = new Map()
        this.conflictCardViews = new Map()
        this.queueContent = undefined
        this.queueMaskSource = undefined
        this.queueScrollGraphics = undefined
        this.queueScrollY = 0
        this.queueMinY = 0
        this.focusTargets = []
        this.focusIndex = -1
        this.feedbackObjects = []
        this.overlayObjects = []
    }

    private get level(): LevelConfig {
        return LEVELS[this.levelIdx]
    }

    private get phase(): PhaseConfig {
        return this.level.phases[this.phaseIdx]
    }

    create(): void {
        this.drawBackground()
        this.drawMainStructure()
        this.drawQueue()
        this.buildPhase()
        this.animateSceneEntrance()
        this.registerKeyboard()
        this.registerEvents()
        this.registerPlatformCommands()

        runtimeGameBridge.emit({
            type: 'GAME_READY',
            gameId: GAME_ID,
        })
        this.emitCheckpoint()
        this.broadcastMission()

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this)
        this.events.once(Phaser.Scenes.Events.DESTROY, this.cleanup, this)

        const begin = (): void => {
            if (this.skipTutorial || this.phaseIdx > 0) {
                EventBus.emit('tutorial-ready')
                this.startPhase()
                return
            }

            this.runTutorial(() => this.startPhase())
        }

        if (this.phaseIdx === 0 && !this.skipIntro) {
            this.showLevelIntro(begin)
        } else {
            begin()
        }
    }

    private drawBackground(): void {
        const key = this.phase.kind === 'sistemas' ? 'bg-sistemas' : 'bg-central'
        const background = this.add.image(L.W / 2, L.H / 2, key).setDepth(-3)
        const source = this.textures.get(key).getSourceImage() as HTMLImageElement
        const scale = Math.max(L.W / source.width, L.H / source.height)

        background.setScale(scale)

        const veil = this.add.graphics().setDepth(-2)
        veil.fillStyle(C.background, ALPHA.backgroundVeil)
        veil.fillRect(0, 0, L.W, L.H)

        veil.lineStyle(1, C.cyanDeep, 0.026)
        for (let x = 0; x <= L.W; x += 64) veil.lineBetween(x, 0, x, L.H)
        for (let y = 0; y <= L.H; y += 64) veil.lineBetween(0, y, L.W, y)
    }

    private drawMainStructure(): void {
        const graphics = this.add.graphics().setDepth(0)

        graphics.fillStyle(C.shadow, ALPHA.shadow)
        graphics.fillRoundedRect(
            L.MAIN_PANEL.x,
            L.MAIN_PANEL.y + 10,
            L.MAIN_PANEL.w,
            L.MAIN_PANEL.h,
            RADIUS.panel,
        )
        graphics.lineStyle(12, C.cyan, 0.10)
        graphics.strokeRoundedRect(
            L.MAIN_PANEL.x,
            L.MAIN_PANEL.y,
            L.MAIN_PANEL.w,
            L.MAIN_PANEL.h,
            RADIUS.panel,
        )
        graphics.fillStyle(C.panelDeep, 0.94)
        graphics.fillRoundedRect(
            L.MAIN_PANEL.x,
            L.MAIN_PANEL.y,
            L.MAIN_PANEL.w,
            L.MAIN_PANEL.h,
            RADIUS.panel,
        )
        graphics.lineStyle(2, C.cyanDeep, 0.82)
        graphics.strokeRoundedRect(
            L.MAIN_PANEL.x,
            L.MAIN_PANEL.y,
            L.MAIN_PANEL.w,
            L.MAIN_PANEL.h,
            RADIUS.panel,
        )

        graphics.lineStyle(1, C.borderSoft, 1)
        graphics.strokeRoundedRect(
            L.MAIN_PANEL.x + 6,
            L.MAIN_PANEL.y + 6,
            L.MAIN_PANEL.w - 12,
            L.MAIN_PANEL.h - 12,
            RADIUS.panel - 3,
        )
        this.drawTechnicalCorners(graphics, L.MAIN_PANEL, C.cyanDeep)

        graphics.fillStyle(C.text, 0.055)
        graphics.fillRoundedRect(L.QUEUE.x + L.QUEUE.w + 14, L.DIVIDER.y + 24, 3, L.DIVIDER.h - 48, 2)
        graphics.fillStyle(C.cyan, 0.16)
        graphics.fillRoundedRect(L.QUEUE.x + L.QUEUE.w + 12, L.DIVIDER.y + 74, 7, 148, 4)
    }

    private drawQueue(): void {
        this.add.text(L.cx(L.QUEUE), L.QUEUE.y + 24, 'FILA DE PEDIDOS', {
            fontFamily: FONT.title,
            fontSize: `${FONT_SIZE.panelTitle}px`,
            fontStyle: FONT_WEIGHT.bold,
            color: CSS.text,
        }).setOrigin(0.5, 0).setDepth(CONTENT_DEPTH).setResolution(2)

        const content = this.add.container(0, 0).setDepth(CONTENT_DEPTH)
        const cardStep = L.QUEUE_CARD_HEIGHT + L.QUEUE_CARD_GAP

        this.level.phases.forEach((phase, index) => {
            const rect: L.Rect = {
                x: L.QUEUE_VIEWPORT.x,
                y: L.QUEUE_VIEWPORT.y + index * cardStep,
                w: L.QUEUE_VIEWPORT.w,
                h: L.QUEUE_CARD_HEIGHT,
            }
            const current = index === this.phaseIdx
            const graphics = this.add.graphics()
            const programId = this.firstProgramOf(phase)
            const texture = programId ? PROGRAMS[programId].texture : 'icone-app'
            const name = programId ? PROGRAMS[programId].name : 'Sistemas operacionais'

            this.paintTechFrame(
                graphics,
                rect,
                current ? C.cyan : C.disabled,
                current,
                false,
                current ? C.surface : C.background,
            )

            const icon = this.add.image(rect.x + 58, rect.y + rect.h / 2, texture)
                .setDisplaySize(78, 78)
                .setAlpha(current ? 1 : 0.42)

            if (!current) icon.setTintFill(C.disabled)

            if (current) {
                graphics.fillStyle(C.cyan, 0.9)
                graphics.fillRoundedRect(rect.x, rect.y + 18, 6, rect.h - 36, 4)

                const badge = this.add.text(rect.x + 108, rect.y + 22, 'AGORA', {
                    fontFamily: FONT.body,
                    fontSize: '14px',
                    fontStyle: FONT_WEIGHT.extraBold,
                    color: CSS.cyan,
                    letterSpacing: 1,
                }).setResolution(2)
                content.add(badge)
            }

            const title = this.add.text(rect.x + 108, rect.y + (current ? 58 : 43), name, {
                fontFamily: FONT.body,
                fontSize: '20px',
                fontStyle: FONT_WEIGHT.bold,
                color: current ? CSS.text : CSS.disabled,
                wordWrap: { width: rect.w - 126 },
            }).setResolution(2)

            const phaseLabel = this.add.text(rect.x + 108, rect.y + rect.h - 28, `Fase ${index + 1}`, {
                fontFamily: FONT.body,
                fontSize: '16px',
                fontStyle: FONT_WEIGHT.semibold,
                color: current ? CSS.violet : CSS.disabled,
            }).setOrigin(0, 0.5).setAlpha(current ? 1 : 0.72).setResolution(2)

            content.add([graphics, icon, title, phaseLabel])
        })

        this.add.text(L.cx(L.QUEUE_FOOTER), L.QUEUE_FOOTER.y, 'Arraste para percorrer', {
            fontFamily: FONT.body,
            fontSize: '16px',
            fontStyle: FONT_WEIGHT.semibold,
            color: CSS.textMuted,
        }).setOrigin(0.5, 0).setDepth(CONTENT_DEPTH).setResolution(2)

        const maskSource = this.make.graphics({ x: 0, y: 0 }, false)
        maskSource.fillStyle(0xffffff, 1)
        maskSource.fillRect(
            L.QUEUE_VIEWPORT.x,
            L.QUEUE_VIEWPORT.y,
            L.QUEUE_VIEWPORT.w,
            L.QUEUE_VIEWPORT.h,
        )
        content.setMask(maskSource.createGeometryMask())

        const contentHeight = this.level.phases.length * L.QUEUE_CARD_HEIGHT
            + Math.max(0, this.level.phases.length - 1) * L.QUEUE_CARD_GAP
        this.queueContent = content
        this.queueMaskSource = maskSource
        this.queueMinY = Math.min(0, L.QUEUE_VIEWPORT.h - contentHeight)

        const currentCenter = L.QUEUE_VIEWPORT.y
            + this.phaseIdx * cardStep
            + L.QUEUE_CARD_HEIGHT / 2
        const desiredY = L.cy(L.QUEUE_VIEWPORT) - currentCenter
        this.queueScrollGraphics = this.add.graphics().setDepth(CONTENT_DEPTH + 4)
        this.setQueueScroll(Phaser.Math.Clamp(desiredY, this.queueMinY, 0))

        const dragZone = this.add.zone(
            L.cx(L.QUEUE_VIEWPORT),
            L.cy(L.QUEUE_VIEWPORT),
            L.QUEUE_VIEWPORT.w,
            L.QUEUE_VIEWPORT.h,
        ).setDepth(CONTENT_DEPTH + 5).setInteractive({ useHandCursor: true })

        this.input.setDraggable(dragZone)
        dragZone.on('dragstart', (pointer: Phaser.Input.Pointer) => {
            dragZone.setData('pointer-start-y', pointer.y)
            dragZone.setData('scroll-start-y', this.queueScrollY)
        })
        dragZone.on('drag', (pointer: Phaser.Input.Pointer) => {
            const pointerStart = Number(dragZone.getData('pointer-start-y') ?? pointer.y)
            const scrollStart = Number(dragZone.getData('scroll-start-y') ?? this.queueScrollY)
            this.setQueueScroll(scrollStart + pointer.y - pointerStart)
        })

        this.input.on('wheel', this.onQueueWheel, this)
    }

    private onQueueWheel(
        pointer: Phaser.Input.Pointer,
        _objects: Phaser.GameObjects.GameObject[],
        _deltaX: number,
        deltaY: number,
    ): void {
        const viewport = new Phaser.Geom.Rectangle(
            L.QUEUE_VIEWPORT.x,
            L.QUEUE_VIEWPORT.y,
            L.QUEUE_VIEWPORT.w,
            L.QUEUE_VIEWPORT.h,
        )
        if (!Phaser.Geom.Rectangle.Contains(viewport, pointer.x, pointer.y)) return

        this.setQueueScroll(this.queueScrollY - deltaY * 0.55)
    }

    private setQueueScroll(value: number): void {
        this.queueScrollY = Phaser.Math.Clamp(value, this.queueMinY, 0)
        this.queueContent?.setY(this.queueScrollY)

        const graphics = this.queueScrollGraphics
        if (!graphics) return
        graphics.clear()
        if (this.queueMinY === 0) return

        const trackX = L.QUEUE_VIEWPORT.x + L.QUEUE_VIEWPORT.w - 4
        const trackHeight = L.QUEUE_VIEWPORT.h
        const contentHeight = trackHeight - this.queueMinY
        const thumbHeight = Math.max(54, trackHeight * (trackHeight / contentHeight))
        const progress = this.queueScrollY / this.queueMinY
        const thumbY = L.QUEUE_VIEWPORT.y + (trackHeight - thumbHeight) * progress

        graphics.fillStyle(C.borderSoft, 0.55)
        graphics.fillRoundedRect(trackX, L.QUEUE_VIEWPORT.y, 4, trackHeight, 2)
        graphics.fillStyle(C.cyan, 0.9)
        graphics.fillRoundedRect(trackX, thumbY, 4, thumbHeight, 2)
    }

    private buildPhase(): void {
        switch (this.phase.kind) {
            case 'atender':
                this.buildAttendPhase(this.phase)
                break
            case 'memoria':
                this.buildMemoryPhase(this.phase)
                break
            case 'conflito':
                this.buildConflictPhase(this.phase)
                break
            case 'sistemas':
                this.buildSystemsPhase(this.phase)
                break
        }
    }

    private buildAttendPhase(phase: AttendPhase): void {
        const request = phase.requests[0]
        this.drawCurrentRequest(request.programId, request.text)

        this.add.text(L.RESOURCE_CARD_RECTS[0].x, 282, 'PEÇAS DO COMPUTADOR', {
            fontFamily: FONT.title,
            fontSize: `${FONT_SIZE.panelTitle}px`,
            fontStyle: FONT_WEIGHT.bold,
            color: CSS.textMuted,
        }).setDepth(CONTENT_DEPTH).setResolution(2)

        phase.available.forEach((availability, index) => {
            const rect = L.RESOURCE_CARD_RECTS[index]
            if (!rect) return
            this.buildResourceCard(rect, availability, () => {
                this.answerAttend(availability.id)
            })
        })

        this.makeButton(
            L.DENY_BUTTON,
            'Negar pedido',
            C.surface,
            C.red,
            () => this.answerAttend('negar'),
        )
    }

    private buildResourceCard(
        rect: L.Rect,
        availability: ResourceAvailability,
        onActivate: () => void,
    ): void {
        const resource = RESOURCES[availability.id]
        const state = RESOURCE_STATE_VISUAL[availability.state]
        const graphics = this.add.graphics().setDepth(CONTENT_DEPTH)
        const icon = this.add.image(rect.x + 54, L.cy(rect), resource.texture)
            .setDisplaySize(70, 70)
            .setAlpha(availability.state === 'desligado' ? ALPHA.disabled : 1)
            .setDepth(CONTENT_DEPTH + 1)
        let hovered = false
        let focused = false

        const paint = (): void => {
            graphics.clear()
            this.paintTechFrame(
                graphics,
                rect,
                focused ? C.cyan : state.color,
                focused,
                hovered,
            )

            const badgeX = rect.x + rect.w - 55
            const badgeY = rect.y + 30
            graphics.fillStyle(state.color, 0.16)
            graphics.fillRoundedRect(badgeX - 34, badgeY - 15, 68, 30, 12)
            graphics.lineStyle(1, state.color, 0.8)
            graphics.strokeRoundedRect(badgeX - 34, badgeY - 15, 68, 30, 12)
            this.drawStateShape(graphics, state.shape, rect.x + rect.w - 26, rect.y + 82, state.color)
        }

        paint()

        this.add.text(rect.x + 96, rect.y + 28, resource.name, {
            fontFamily: FONT.body,
            fontSize: '20px',
            fontStyle: FONT_WEIGHT.bold,
            color: CSS.text,
            wordWrap: { width: rect.w - 142 },
        }).setDepth(CONTENT_DEPTH + 1).setResolution(2)

        this.add.text(rect.x + 96, rect.y + 70, state.label, {
            fontFamily: FONT.body,
            fontSize: '17px',
            fontStyle: FONT_WEIGHT.semibold,
            color: state.cssColor,
        }).setDepth(CONTENT_DEPTH + 1).setResolution(2)

        const zone = this.add.zone(L.cx(rect), L.cy(rect), rect.w, rect.h)
            .setDepth(CONTENT_DEPTH + 2)
            .setInteractive({ useHandCursor: true })

        zone.on('pointerover', () => {
            hovered = true
            paint()
        })
        zone.on('pointerout', () => {
            hovered = false
            paint()
        })
        zone.on('pointerdown', () => {
            this.tapPulse(icon)
            onActivate()
        })

        this.addFocusTarget(onActivate, (value) => {
            focused = value
            paint()
        })
    }

    private answerAttend(choice: ResourceId | 'negar'): void {
        if (this.locked || this.phase.kind !== 'atender') return

        const request = this.phase.requests[0]
        const correct = request.answer === choice
        const wrongMessage = choice === 'negar'
            ? `Este pedido podia ser atendido. ${request.reason}`
            : request.answer === 'negar'
                ? `Esta peça não pode atender agora. ${request.reason}`
                : `Essa não é a peça pedida. ${request.reason}`

        this.resolveChoice(correct, correct ? request.reason : wrongMessage)
    }

    private buildMemoryPhase(phase: MemoryPhase): void {
        const request = phase.requests[0]
        this.runningPrograms = phase.running.map((item) => ({ ...item }))
        this.drawCurrentRequest(request.programId, request.text)

        this.add.text(L.MEMORY_BAR.x, L.MEMORY_BAR.y - 29, 'ESPAÇOS DA MEMÓRIA', {
            fontFamily: FONT.title,
            fontSize: `${FONT_SIZE.panelTitle}px`,
            fontStyle: FONT_WEIGHT.bold,
            color: CSS.textMuted,
        }).setDepth(CONTENT_DEPTH).setResolution(2)

        this.memoryBarGraphics = this.add.graphics().setDepth(CONTENT_DEPTH)
        this.paintMemoryBar(phase)

        this.add.text(L.RUNNING_PROGRAMS.x, L.RUNNING_PROGRAMS.y - 28, 'PROGRAMAS ABERTOS', {
            fontFamily: FONT.title,
            fontSize: `${FONT_SIZE.panelTitle}px`,
            fontStyle: FONT_WEIGHT.bold,
            color: CSS.textMuted,
        }).setDepth(CONTENT_DEPTH).setResolution(2)

        phase.running.forEach((running, index) => this.buildMemoryProgramCard(running, index))

        const denyRect: L.Rect = { x: 636, y: 610, w: 246, h: 68 }
        this.makeButton(denyRect, 'Negar pedido', C.surface, C.red, () => this.answerMemory('negar'))
        this.makeButton(L.MEMORY_ACTION, 'Abrir programa', C.cyan, C.text, () => this.answerMemory('abrir'))
    }

    private paintMemoryBar(phase: MemoryPhase): void {
        if (!this.memoryBarGraphics) return

        const graphics = this.memoryBarGraphics
        const usedPrograms = this.runningPrograms.flatMap((running) =>
            Array.from(
                { length: PROGRAMS[running.programId].memoryBlocks },
                () => running.programId,
            ),
        )
        const used = usedPrograms.length
        const gap = 8
        const blockWidth = (L.MEMORY_BAR.w - gap * (phase.totalBlocks - 1)) / phase.totalBlocks

        graphics.clear()
        for (let index = 0; index < phase.totalBlocks; index += 1) {
            const x = L.MEMORY_BAR.x + index * (blockWidth + gap)
            const programId = usedPrograms[index]
            const color = programId ? PROGRAM_COLOR[programId] : C.border
            graphics.lineStyle(7, color, programId ? 0.12 : 0.04)
            graphics.strokeRoundedRect(x, L.MEMORY_BAR.y, blockWidth, 42, 7)
            graphics.fillStyle(programId ? PROGRAM_COLOR[programId] : C.panelDeep, programId ? 0.82 : 1)
            graphics.fillRoundedRect(x, L.MEMORY_BAR.y, blockWidth, 42, 9)
            graphics.lineStyle(2, color, 1)
            graphics.strokeRoundedRect(x, L.MEMORY_BAR.y, blockWidth, 42, 9)
            graphics.fillStyle(C.text, programId ? 0.16 : 0.05)
            graphics.fillRect(x + 7, L.MEMORY_BAR.y + 7, Math.max(0, blockWidth - 14), 3)
        }

        const free = Math.max(0, phase.totalBlocks - used)
        const label = this.children.getByName('memory-free-label') as Phaser.GameObjects.Text | null
        if (label) {
            label.setText(`Livres: ${free} de ${phase.totalBlocks}`)
        } else {
            this.add.text(L.MEMORY_BAR.x + L.MEMORY_BAR.w, L.MEMORY_BAR.y + 57, `Livres: ${free} de ${phase.totalBlocks}`, {
                fontFamily: FONT.body,
                fontSize: '17px',
                fontStyle: FONT_WEIGHT.bold,
                color: CSS.textMuted,
            }).setName('memory-free-label').setOrigin(1, 0.5).setDepth(CONTENT_DEPTH).setResolution(2)
        }
    }

    private buildMemoryProgramCard(running: RunningProgramDef, index: number): void {
        const program = PROGRAMS[running.programId]
        const count = Math.max(1, this.phase.kind === 'memoria' ? this.phase.running.length : 1)
        const gap = 16
        const width = Math.min(256, (L.RUNNING_PROGRAMS.w - gap * (count - 1)) / count)
        const rect: L.Rect = {
            x: L.RUNNING_PROGRAMS.x + index * (width + gap),
            y: L.RUNNING_PROGRAMS.y,
            w: width,
            h: L.RUNNING_PROGRAMS.h,
        }
        const container = this.add.container(0, 0).setDepth(CONTENT_DEPTH)
        const graphics = this.add.graphics()
        const icon = this.add.image(rect.x + 52, rect.y + 66, program.texture).setDisplaySize(70, 70)
        const title = this.add.text(rect.x + 96, rect.y + 38, program.name, {
            fontFamily: FONT.body,
            fontSize: '19px',
            fontStyle: FONT_WEIGHT.bold,
            color: CSS.text,
            wordWrap: { width: rect.w - 108 },
        }).setResolution(2)
        const stateText = this.add.text(rect.x + 96, rect.y + 100, '', {
            fontFamily: FONT.body,
            fontSize: '16px',
            fontStyle: FONT_WEIGHT.bold,
        }).setResolution(2)
        let hovered = false
        let focused = false

        const paint = (): void => {
            const current = this.runningPrograms.find((item) => item.programId === running.programId)
            if (!current) {
                container.setVisible(false)
                return
            }

            const idle = current.state === 'ocioso'
            const color = idle ? C.yellow : C.green
            container.setVisible(true)
            graphics.clear()
            this.paintTechFrame(
                graphics,
                rect,
                focused ? C.cyan : color,
                focused,
                hovered,
            )
            stateText.setText(idle ? 'Ocioso · toque para fechar' : 'Ativo · não pode fechar')
            stateText.setColor(idle ? CSS.yellow : CSS.green)
        }

        const zone = this.add.zone(L.cx(rect), L.cy(rect), rect.w, rect.h)
            .setInteractive({ useHandCursor: true })
        container.add([graphics, icon, title, stateText, zone])
        paint()

        zone.on('pointerover', () => {
            hovered = true
            paint()
        })
        zone.on('pointerout', () => {
            hovered = false
            paint()
        })
        zone.on('pointerdown', () => {
            this.tapPulse(icon)
            this.closeRunningProgram(running.programId)
        })

        this.addFocusTarget(
            () => this.closeRunningProgram(running.programId),
            (value) => {
                focused = value
                paint()
            },
        )
        this.memoryProgramViews.set(running.programId, { container, paint })
    }

    private closeRunningProgram(programId: ProgramId): void {
        if (this.locked || this.phase.kind !== 'memoria') return

        const running = this.runningPrograms.find((item) => item.programId === programId)
        if (!running) return

        if (running.state === 'ativo') {
            this.resolveChoice(
                false,
                `${PROGRAMS[programId].name} está ativo. Feche somente um programa marcado como ocioso.`,
            )
            return
        }

        this.locked = true
        this.runningPrograms = this.runningPrograms.filter((item) => item.programId !== programId)
        this.memoryProgramViews.get(programId)?.paint()
        this.paintMemoryBar(this.phase)
        this.playTone(420, 0.08, 'sine', 0.08)
        this.showFeedback(false, `${PROGRAMS[programId].name} foi fechado. Agora tente abrir o programa pedido.`, () => {
            this.locked = false
        }, C.yellow, 1300)
    }

    private answerMemory(action: 'abrir' | 'negar'): void {
        if (this.locked || this.phase.kind !== 'memoria') return

        const request = this.phase.requests[0]
        const requestedProgram = PROGRAMS[request.programId]
        const alreadyOpen = this.runningPrograms.some((item) => item.programId === request.programId)
        const used = this.runningPrograms.reduce(
            (total, item) => total + PROGRAMS[item.programId].memoryBlocks,
            0,
        )
        const fits = used + requestedProgram.memoryBlocks <= this.phase.totalBlocks

        if (action === 'negar') {
            const correct = request.answer === 'negar'
            this.resolveChoice(
                correct,
                correct ? request.reason : `Ainda é possível abrir este programa. ${request.reason}`,
            )
            return
        }

        const correct = request.answer === 'memoria' && !alreadyOpen && fits
        const message = alreadyOpen
            ? `Este programa já está aberto. ${request.reason}`
            : !fits
                ? 'Não há espaços livres suficientes. Feche um programa ocioso antes de tentar novamente.'
                : request.answer === 'negar'
                    ? request.reason
                    : request.reason

        this.resolveChoice(correct, message)
    }

    private buildConflictPhase(phase: ConflictPhase): void {
        const ruleLabel = phase.rule === 'chegou-primeiro'
            ? 'Regra: quem chegou primeiro'
            : 'Regra: o pedido mais rápido primeiro'
        const resource = RESOURCES[phase.resource]

        this.drawInfoBand(L.CONFLICT_RULE, ruleLabel, phase.sub, C.violet)

        const resourceGraphics = this.add.graphics().setDepth(CONTENT_DEPTH)
        this.paintTechFrame(resourceGraphics, L.CONFLICT_RESOURCE, C.yellow)

        this.add.image(L.CONFLICT_RESOURCE.x + 58, L.cy(L.CONFLICT_RESOURCE), resource.texture)
            .setDisplaySize(76, 76)
            .setDepth(CONTENT_DEPTH + 1)
        this.add.text(L.CONFLICT_RESOURCE.x + 108, L.CONFLICT_RESOURCE.y + 28, resource.name, {
            fontFamily: FONT.title,
            fontSize: '22px',
            fontStyle: FONT_WEIGHT.bold,
            color: CSS.text,
        }).setDepth(CONTENT_DEPTH + 1).setResolution(2)
        this.add.text(L.CONFLICT_RESOURCE.x + 108, L.CONFLICT_RESOURCE.y + 61, 'Ocupado · organize a fila de espera', {
            fontFamily: FONT.body,
            fontSize: '17px',
            fontStyle: FONT_WEIGHT.semibold,
            color: CSS.yellow,
        }).setDepth(CONTENT_DEPTH + 1).setResolution(2)

        phase.requests.forEach((request, index) => this.buildConflictCard(request, index, phase.requests.length))

        this.makeButton(L.UNDO_BUTTON, 'Desfazer', C.surface, C.textMuted, () => this.undoConflict())
        this.makeButton(
            L.CONFIRM_ORDER_BUTTON,
            'Confirmar fila',
            C.cyan,
            C.text,
            () => this.confirmConflict(),
        )
    }

    private buildConflictCard(
        request: ConflictRequestDef,
        index: number,
        count: number,
    ): void {
        const gap = 16
        const width = (L.CONFLICT_ORDER.w - gap * (count - 1)) / count
        const rect: L.Rect = {
            x: L.CONFLICT_ORDER.x + index * (width + gap),
            y: L.CONFLICT_ORDER.y,
            w: width,
            h: L.CONFLICT_ORDER.h,
        }
        const program = PROGRAMS[request.programId]
        const graphics = this.add.graphics().setDepth(CONTENT_DEPTH)
        const badge = this.add.text(rect.x + rect.w - 28, rect.y + 28, '', {
            fontFamily: FONT.title,
            fontSize: '19px',
            fontStyle: FONT_WEIGHT.extraBold,
            color: CSS.background,
            backgroundColor: CSS.cyan,
            padding: { x: 9, y: 4 },
        }).setOrigin(0.5).setDepth(CONTENT_DEPTH + 2).setResolution(2)
        let hovered = false
        let focused = false

        const paint = (): void => {
            const position = this.selectedOrder.indexOf(request.id)
            const selected = position >= 0
            graphics.clear()
            this.paintTechFrame(
                graphics,
                rect,
                focused ? C.cyan : selected ? C.green : C.border,
                focused || selected,
                hovered && !selected,
                selected ? C.elevated : C.panelDeep,
            )
            badge.setVisible(selected).setText(selected ? `${position + 1}º` : '')
        }

        paint()

        this.add.image(rect.x + 48, rect.y + 45, program.texture)
            .setDisplaySize(64, 64)
            .setDepth(CONTENT_DEPTH + 1)
        this.add.text(rect.x + 88, rect.y + 23, program.name, {
            fontFamily: FONT.body,
            fontSize: '18px',
            fontStyle: FONT_WEIGHT.bold,
            color: CSS.text,
            wordWrap: { width: rect.w - 126 },
        }).setDepth(CONTENT_DEPTH + 1).setResolution(2)
        this.add.text(rect.x + 18, rect.y + 86, request.text, {
            fontFamily: FONT.body,
            fontSize: '17px',
            fontStyle: FONT_WEIGHT.semibold,
            color: CSS.textMuted,
            align: 'center',
            wordWrap: { width: rect.w - 36 },
        }).setOrigin(0, 0).setDepth(CONTENT_DEPTH + 1).setResolution(2)
        this.add.text(
            rect.x + rect.w / 2,
            rect.y + rect.h - 28,
            `Chegada ${request.arrivalOrder}º · ${request.estimatedTime}s`,
            {
                fontFamily: FONT.body,
                fontSize: '16px',
                fontStyle: FONT_WEIGHT.bold,
                color: CSS.cyan,
            },
        ).setOrigin(0.5).setDepth(CONTENT_DEPTH + 1).setResolution(2)

        const zone = this.add.zone(L.cx(rect), L.cy(rect), rect.w, rect.h)
            .setDepth(CONTENT_DEPTH + 3)
            .setInteractive({ useHandCursor: true })
        zone.on('pointerover', () => {
            hovered = true
            paint()
        })
        zone.on('pointerout', () => {
            hovered = false
            paint()
        })
        zone.on('pointerdown', () => this.selectConflictRequest(request.id))

        this.addFocusTarget(
            () => this.selectConflictRequest(request.id),
            (value) => {
                focused = value
                paint()
            },
        )
        this.conflictCardViews.set(request.id, { paint })
    }

    private selectConflictRequest(requestId: string): void {
        if (this.locked || this.phase.kind !== 'conflito') return
        if (this.selectedOrder.includes(requestId)) return

        this.selectedOrder.push(requestId)
        this.playTone(560 + this.selectedOrder.length * 60, 0.06, 'sine', 0.08)
        this.paintConflictCards()
    }

    private undoConflict(): void {
        if (this.locked || this.phase.kind !== 'conflito' || !this.selectedOrder.length) return
        this.selectedOrder.pop()
        this.playTone(360, 0.06, 'sine', 0.07)
        this.paintConflictCards()
    }

    private confirmConflict(): void {
        if (this.locked || this.phase.kind !== 'conflito') return
        if (this.selectedOrder.length !== this.phase.requests.length) {
            this.showFeedback(false, 'Escolha todos os pedidos antes de confirmar a fila.', () => {
                this.locked = false
            }, C.yellow, 1500)
            this.locked = true
            return
        }

        const field = this.phase.rule === 'chegou-primeiro' ? 'arrivalOrder' : 'estimatedTime'
        const expected = [...this.phase.requests]
            .sort((a, b) => a[field] - b[field])
            .map((request) => request.id)
        const correct = expected.every((id, index) => this.selectedOrder[index] === id)
        const reason = expected
            .map((id, index) => {
                const request = this.phase.kind === 'conflito'
                    ? this.phase.requests.find((item) => item.id === id)
                    : undefined
                return request ? `${index + 1}º ${PROGRAMS[request.programId].name}` : ''
            })
            .filter(Boolean)
            .join(', ')

        this.resolveChoice(
            correct,
            correct
                ? `Fila correta: ${reason}.`
                : `Confira a regra da fase. A ordem correta é: ${reason}.`,
            () => {
                if (!correct) {
                    this.selectedOrder = []
                    this.paintConflictCards()
                }
            },
        )
    }

    private paintConflictCards(): void {
        this.conflictCardViews.forEach((view) => view.paint())
    }

    private buildSystemsPhase(phase: SystemsPhase): void {
        this.drawInfoBand(L.SYSTEM_QUESTION, 'SISTEMAS DIFERENTES', phase.question, C.cyan)

        phase.options.forEach((option, index) => {
            const rect = L.SYSTEM_OPTION_RECTS[index]
            const graphics = this.add.graphics().setDepth(CONTENT_DEPTH)
            const preview = new SystemLayout({
                scene: this,
                x: L.cx(rect),
                y: rect.y + 122,
                layout: option.layout,
            }).setDepth(CONTENT_DEPTH + 1)
            let hovered = false
            let focused = false

            const paint = (): void => {
                graphics.clear()
                this.paintTechFrame(
                    graphics,
                    rect,
                    focused ? C.cyan : C.border,
                    focused,
                    hovered,
                )
            }
            paint()

            this.add.text(L.cx(rect), rect.y + rect.h - 38, option.label, {
                fontFamily: FONT.title,
                fontSize: '20px',
                fontStyle: FONT_WEIGHT.bold,
                color: CSS.text,
            }).setOrigin(0.5).setDepth(CONTENT_DEPTH + 1).setResolution(2)

            const zone = this.add.zone(L.cx(rect), L.cy(rect), rect.w, rect.h)
                .setDepth(CONTENT_DEPTH + 2)
                .setInteractive({ useHandCursor: true })
            zone.on('pointerover', () => {
                hovered = true
                paint()
            })
            zone.on('pointerout', () => {
                hovered = false
                paint()
            })
            zone.on('pointerdown', () => {
                this.tapPulse(preview)
                this.answerSystem(option.id)
            })

            this.addFocusTarget(
                () => this.answerSystem(option.id),
                (value) => {
                    focused = value
                    paint()
                },
            )
        })
    }

    private answerSystem(optionId: SystemsPhase['answer']): void {
        if (this.locked || this.phase.kind !== 'sistemas') return
        const correct = optionId === this.phase.answer
        this.resolveChoice(
            correct,
            correct ? this.phase.reason : `Observe onde ficam os aplicativos. ${this.phase.reason}`,
        )
    }

    private drawCurrentRequest(programId: ProgramId, requestText: string): void {
        const rect = L.CURRENT_REQUEST
        const program = PROGRAMS[programId]
        const graphics = this.add.graphics().setDepth(CONTENT_DEPTH)

        this.paintTechFrame(graphics, rect, C.cyan, true)

        this.add.image(rect.x + 56, L.cy(rect), program.texture)
            .setDisplaySize(76, 76)
            .setDepth(CONTENT_DEPTH + 1)
        this.add.text(rect.x + 110, rect.y + 27, program.name, {
            fontFamily: FONT.body,
            fontSize: '18px',
            fontStyle: FONT_WEIGHT.bold,
            color: CSS.cyan,
        }).setDepth(CONTENT_DEPTH + 1).setResolution(2)
        this.add.text(rect.x + 110, rect.y + 55, `“${requestText}”`, {
            fontFamily: FONT.title,
            fontSize: `${FONT_SIZE.currentRequest}px`,
            fontStyle: FONT_WEIGHT.bold,
            color: CSS.text,
            wordWrap: { width: rect.w - 138 },
        }).setOrigin(0, 0.5).setDepth(CONTENT_DEPTH + 1).setResolution(2)
    }

    private drawInfoBand(rect: L.Rect, title: string, body: string, color: number): void {
        const graphics = this.add.graphics().setDepth(CONTENT_DEPTH)
        this.paintTechFrame(graphics, rect, color)

        this.add.text(rect.x + 22, rect.y + 20, title, {
            fontFamily: FONT.title,
            fontSize: '20px',
            fontStyle: FONT_WEIGHT.bold,
            color: this.numberToCss(color),
        }).setDepth(CONTENT_DEPTH + 1).setResolution(2)
        this.add.text(rect.x + 22, rect.y + rect.h - 26, body, {
            fontFamily: FONT.body,
            fontSize: '18px',
            fontStyle: FONT_WEIGHT.semibold,
            color: CSS.text,
            wordWrap: { width: rect.w - 44 },
        }).setOrigin(0, 0.5).setDepth(CONTENT_DEPTH + 1).setResolution(2)
    }

    private resolveChoice(
        correct: boolean,
        message: string,
        afterFeedback?: () => void,
    ): void {
        if (this.locked || this.ended) return
        this.locked = true

        if (correct) {
            this.hits += 1
            this.score += POINTS_PER_PHASE
            runtimeGameBridge.emit({
                type: 'CORRECT_ANSWER',
                gameId: GAME_ID,
                pointsEarned: POINTS_PER_PHASE,
                stage: this.level.level,
            })
            this.emitCheckpoint(true)
            this.playFanfare()
            this.spark(L.DECISION.x + L.DECISION.w / 2, 590)
            this.broadcastMission()
            this.showFeedback(true, message, () => {
                afterFeedback?.()
                this.completePhase()
            })
            return
        }

        this.errors += 1
        this.stability = Math.max(0, this.stability - 1)

        runtimeGameBridge.emit({
            type: 'WRONG_ANSWER',
            gameId: GAME_ID,
            pointsEarned: 0,
            stage: this.level.level,
        })

        this.emitCheckpoint()
        this.broadcastMission()
        this.playError()

        if (this.stability <= 0) {
            EventBus.emit('lose-game', message)
            return
        }

        this.showFeedback(false, message, () => {
            afterFeedback?.()
            this.locked = false
        })
    }

    private showFeedback(
        correct: boolean,
        message: string,
        onDone: () => void,
        overrideColor?: number,
        duration = FEEDBACK_DURATION,
    ): void {
        this.clearFeedback()
        if (this.level.timeLimit) EventBus.emit('timer-pause')

        const color = overrideColor ?? (correct ? C.green : C.red)
        const rect: L.Rect = {
            x: L.DECISION.x + 24,
            y: L.DECISION.y + L.DECISION.h - 76,
            w: L.DECISION.w - 48,
            h: 64,
        }
        const graphics = this.add.graphics().setDepth(80)
        this.paintTechFrame(graphics, rect, color, true, false, C.panelDeep)
        graphics.fillStyle(color, 1)
        graphics.fillCircle(rect.x + 32, L.cy(rect), 13)
        graphics.lineStyle(3, C.background, 1)
        if (correct) {
            graphics.lineBetween(rect.x + 25, L.cy(rect), rect.x + 30, L.cy(rect) + 6)
            graphics.lineBetween(rect.x + 30, L.cy(rect) + 6, rect.x + 40, L.cy(rect) - 7)
        } else {
            graphics.lineBetween(rect.x + 27, L.cy(rect) - 6, rect.x + 37, L.cy(rect) + 6)
            graphics.lineBetween(rect.x + 37, L.cy(rect) - 6, rect.x + 27, L.cy(rect) + 6)
        }

        const text = this.add.text(rect.x + 58, L.cy(rect), message, {
            fontFamily: FONT.body,
            fontSize: '18px',
            fontStyle: FONT_WEIGHT.bold,
            color: CSS.text,
            wordWrap: { width: rect.w - 82 },
        }).setOrigin(0, 0.5).setDepth(81).setResolution(2)

        this.feedbackObjects.push(graphics, text)
        graphics.setAlpha(0)
        text.setAlpha(0)
        this.tweens.add({
            targets: [graphics, text],
            alpha: 1,
            duration: MOTION.feedbackPulse,
        })
        this.time.delayedCall(duration, () => {
            this.clearFeedback()
            if (this.level.timeLimit && !this.ended) EventBus.emit('timer-resume')
            onDone()
        })
    }

    private completePhase(): void {
        const lastPhase = this.phaseIdx + 1 >= this.level.phases.length
        const lastLevel = this.levelIdx + 1 >= LEVELS.length

        if (!lastPhase) {
            this.scene.restart({
                level: this.level.level,
                phase: this.phaseIdx + 1,
                score: this.score,
                stability: this.stability,
                hits: this.hits,
                errors: this.errors,
            } satisfies GameSceneData)
            return
        }

        EventBus.emit('timer-stop')
        this.locked = true

        if (!lastLevel) {
            const nextLevel = LEVELS[this.levelIdx + 1]
            showLevelComplete(this, {
                title: 'Nível concluído!',
                subtitle: this.level.title,
                message: nextLevel.objective,
                accent: C.cyan,
                overlayColor: C.background,
                titleColor: CSS.cyan,
                subtitleColor: CSS.text,
                progress: { total: LEVELS.length, current: this.level.level },
                autoAdvance: {
                    delay: 2300,
                    onComplete: () => this.scene.restart({
                        level: nextLevel.level,
                        phase: 0,
                        score: this.score,
                        hits: this.hits,
                        errors: this.errors,
                    } satisfies GameSceneData),
                },
            })
            return
        }

        this.ended = true
        this.locked = true

        runtimeGameBridge.emit({
            type: 'GAME_COMPLETED',
            gameId: GAME_ID,
            stage: this.level.level,
        })

        this.time.delayedCall(0, () => this.showFinalScreen())
        return
    }

    private showFinalScreen(): void {
        showLevelComplete(this, {
            title: 'Central estabilizada!',
            subtitle: 'Você controlou o sistema operacional',
            message: `${this.score} pontos · ${this.hits} acertos · ${this.errors} erros`,
            accent: C.cyan,
            overlayColor: C.background,
            titleColor: CSS.cyan,
            subtitleColor: CSS.text,
            progress: { total: LEVELS.length, current: LEVELS.length },
            buttons: [
                {
                    label: 'Jogar novamente',
                    color: C.cyan,
                    onClick: () => this.scene.restart({ level: 1, phase: 0, score: 0 } satisfies GameSceneData),
                },
                {
                    label: 'Outros jogos',
                    color: C.surface,
                    onClick: () => EventBus.emit('exit-game'),
                },
            ],
        })
    }

    private retryPhase(resetTimer = false): void {
        this.scene.restart({
            level: this.level.level,
            phase: this.phaseIdx,
            score: this.score,
            stability: this.stability,
            hits: this.hits,
            errors: this.errors,
            resetTimer,
            skipIntro: true,
            skipTutorial: true,
        } satisfies GameSceneData)
    }

    private onTimeUp(): void {
        if (this.ended || this.locked || !this.level.timeLimit) return

        this.locked = true
        this.errors += 1
        this.stability = Math.max(0, this.stability - 1)

        runtimeGameBridge.emit({
            type: 'WRONG_ANSWER',
            gameId: GAME_ID,
            pointsEarned: 0,
            stage: this.level.level,
        })

        this.emitCheckpoint()
        this.broadcastMission()
        this.playError()

        if (this.stability <= 0) {
            EventBus.emit('lose-game', 'O tempo acabou.')
            return
        }

        this.showFeedback(
            false,
            'O tempo acabou. A fase atual será reiniciada.',
            () => this.retryPhase(true),
        )
    }

    private emitCheckpoint(completedCurrent = false): void {
        const completedBefore = LEVELS
            .slice(0, this.levelIdx)
            .reduce((total, level) => total + level.phases.length, 0)
        const totalPhases = LEVELS.reduce((total, level) => total + level.phases.length, 0)
        const completed = completedBefore + this.phaseIdx + (completedCurrent ? 1 : 0)

        runtimeGameBridge.emit({
            type: 'CHECKPOINT',
            gameId: GAME_ID,
            stage: this.level.level,
            progress: Math.round((completed / totalPhases) * 100),
            score: this.score,
        })
    }

    private broadcastMission(): void {
        EventBus.emit('mission-update', {
            level: this.level.level,
            phase: this.phaseIdx,
            totalPhases: this.level.phases.length,
            instruction: this.phase.instruction,
            stability: this.stability,
            maxStability: this.level.stability,
            score: this.score,
            timeLimit: this.level.timeLimit,
        })
    }

    private startPhase(): void {
        this.locked = false
        if (this.level.timeLimit && (this.phaseIdx === 0 || this.resetTimer)) {
            EventBus.emit('timer-start', this.level.timeLimit)
        }
    }

    private showLevelIntro(onStart: () => void): void {
        EventBus.emit('timer-pause')
        const blocker = this.keepOverlay(
            this.add.rectangle(L.W / 2, L.H / 2, L.W, L.H, C.background, 0.88)
                .setDepth(OVERLAY_DEPTH)
                .setInteractive(),
        )
        const panel = this.keepOverlay(this.add.container(L.W / 2, L.H / 2).setDepth(OVERLAY_DEPTH + 1))
        const width = 680
        const height = 440
        const graphics = this.add.graphics()
        graphics.fillStyle(C.shadow, ALPHA.shadow)
        graphics.fillRoundedRect(-width / 2, -height / 2 + 10, width, height, 14)
        graphics.lineStyle(12, C.cyan, 0.12)
        graphics.strokeRoundedRect(-width / 2, -height / 2, width, height, 14)
        graphics.fillStyle(C.panelDeep, 1)
        graphics.fillRoundedRect(-width / 2, -height / 2, width, height, 14)
        graphics.lineStyle(3, C.cyan, 1)
        graphics.strokeRoundedRect(-width / 2, -height / 2, width, height, 14)
        graphics.lineStyle(1, C.borderSoft, 1)
        graphics.strokeRoundedRect(-width / 2 + 7, -height / 2 + 7, width - 14, height - 14, 9)
        graphics.fillStyle(C.cyan, 1)
        graphics.fillRect(-width / 2 + 22, -height / 2, 110, 4)
        graphics.fillStyle(C.violet, 0.9)
        graphics.fillRect(width / 2 - 132, height / 2 - 4, 110, 4)

        panel.add([
            graphics,
            this.add.image(0, -height / 2 + 72, 'icone-app').setDisplaySize(84, 84),
            this.add.text(0, -height / 2 + 132, `NÍVEL ${this.level.level} DE ${LEVELS.length}`, {
                fontFamily: FONT.body,
                fontSize: '17px',
                fontStyle: FONT_WEIGHT.bold,
                color: CSS.cyan,
            }).setOrigin(0.5).setResolution(2),
            this.add.text(0, -height / 2 + 182, this.level.title, {
                fontFamily: FONT.title,
                fontSize: '30px',
                fontStyle: FONT_WEIGHT.extraBold,
                color: CSS.text,
                align: 'center',
                wordWrap: { width: width - 90 },
            }).setOrigin(0.5).setResolution(2),
            this.add.text(0, -height / 2 + 252, this.level.objective, {
                fontFamily: FONT.body,
                fontSize: '19px',
                fontStyle: FONT_WEIGHT.semibold,
                color: CSS.text,
                align: 'center',
                wordWrap: { width: width - 110 },
            }).setOrigin(0.5).setResolution(2),
            this.add.text(0, -height / 2 + 324, this.level.tip, {
                fontFamily: FONT.body,
                fontSize: '16px',
                fontStyle: FONT_WEIGHT.semibold,
                color: CSS.yellow,
                align: 'center',
                wordWrap: { width: width - 120 },
            }).setOrigin(0.5).setResolution(2),
        ])

        const buttonRect: L.Rect = { x: -150, y: height / 2 - 78, w: 300, h: 66 }
        panel.add(this.makeLocalButton(buttonRect, 'Começar', () => {
            blocker.disableInteractive()
            this.clearOverlay()
            onStart()
        }))

        panel.setAlpha(0).setScale(0.94)
        this.tweens.add({
            targets: panel,
            alpha: 1,
            scale: 1,
            duration: 260,
            ease: 'Back.easeOut',
        })
    }

    private runTutorial(onDone: () => void, forced = false): void {
        if (this.tutorialOpen || this.ended) return

        const steps = this.tutorialSteps(forced)
        if (!steps.length) {
            onDone()
            return
        }

        const wasLocked = this.locked
        this.tutorialOpen = true
        this.locked = true
        EventBus.emit('timer-pause')

        createTutorial(this, {
            key: `controlador-l${this.level.level}-f${this.phaseIdx}`,
            accent: C.cyan,
            safeTop: 76,
            once: false,
            steps,
            onFinish: () => {
                this.tutorialOpen = false
                this.locked = wasLocked
                if (!this.tutorialSeen) {
                    this.tutorialSeen = true
                    EventBus.emit('tutorial-ready')
                }
                if (forced && this.level.timeLimit) EventBus.emit('timer-resume')
                onDone()
            },
        })
    }

    private tutorialSteps(forced: boolean): TutorialStep[] {
        const around = (rect: L.Rect): Partial<TutorialStep> => ({
            shape: 'rect',
            x: L.cx(rect),
            y: L.cy(rect),
            w: rect.w + 24,
            h: rect.h + 24,
        })

        if (this.level.level === 1 && this.phaseIdx === 0) {
            return [
                {
                    text: 'Aqui você vê o pedido atual e os próximos da fila.',
                    ...around(L.TUTORIAL_RECTS.queue),
                } as TutorialStep,
                {
                    text: 'Leia o que o programa precisa.',
                    ...around(L.TUTORIAL_RECTS.currentRequest),
                } as TutorialStep,
                {
                    text: 'Toque na peça correta. O programa pede e o sistema operacional entrega.',
                    ...around(L.TUTORIAL_RECTS.resources),
                } as TutorialStep,
                {
                    text: 'Uma escolha errada deixa o computador menos estável.',
                    ...around(L.TUTORIAL_RECTS.stability),
                    buttonLabel: 'Entendi!',
                } as TutorialStep,
            ]
        }

        if (this.level.level === 2 && this.phaseIdx === 0) {
            return [
                {
                    text: 'Cada bloco mostra um espaço da memória. Conte os usados e os livres.',
                    ...around(L.TUTORIAL_RECTS.memory),
                } as TutorialStep,
                {
                    text: 'Programas ativos não podem ser fechados. Feche somente os marcados como ociosos.',
                    ...around(L.TUTORIAL_RECTS.runningPrograms),
                    buttonLabel: 'Entendi!',
                } as TutorialStep,
            ]
        }

        if (this.level.level === 3 && this.phaseIdx === 0) {
            return [
                {
                    text: 'A regra diz como os pedidos devem entrar na fila.',
                    ...around(L.TUTORIAL_RECTS.conflictRule),
                } as TutorialStep,
                {
                    text: 'Toque nos pedidos na ordem correta. Use Desfazer se quiser voltar uma posição.',
                    ...around(L.TUTORIAL_RECTS.conflictOrder),
                    buttonLabel: 'Entendi!',
                } as TutorialStep,
            ]
        }

        if (!forced) return []

        const text = this.phase.kind === 'atender'
            ? 'Leia o pedido e toque na peça correta ou em Negar pedido.'
            : this.phase.kind === 'memoria'
                ? 'Observe os espaços livres. Se precisar, feche um programa ocioso antes de abrir outro.'
                : this.phase.kind === 'conflito'
                    ? 'Observe a regra e toque em todos os pedidos na ordem correta.'
                    : 'Compare as três interfaces e toque na que responde à pergunta.'

        return [{ text, shape: 'none', balloonY: 390, buttonLabel: 'Entendi!' } as TutorialStep]
    }

    private makeButton(
        rect: L.Rect,
        label: string,
        fill: number,
        accent: number,
        onClick: () => void,
    ): Phaser.GameObjects.Container {
        const container = this.add.container(L.cx(rect), L.cy(rect)).setDepth(CONTENT_DEPTH + 5)
        const graphics = this.add.graphics()
        const text = this.add.text(0, 0, label, {
            fontFamily: FONT.body,
            fontSize: `${FONT_SIZE.button}px`,
            fontStyle: FONT_WEIGHT.extraBold,
            color: fill === C.cyan ? CSS.background : CSS.text,
        }).setOrigin(0.5).setResolution(2)
        let hovered = false
        let focused = false

        const paint = (): void => {
            graphics.clear()
            const activeAccent = focused ? C.cyan : accent
            const face = hovered
                ? fill === C.cyan ? C.text : C.elevated
                : fill
            this.paintSimpleButton(graphics, rect.w, rect.h, face, activeAccent, focused || hovered)
            text.setColor(fill === C.cyan ? CSS.background : CSS.text)
        }
        paint()

        container.add([graphics, text])
        container.setSize(rect.w, rect.h).setInteractive({ useHandCursor: true })
        container.on('pointerover', () => {
            hovered = true
            paint()
        })
        container.on('pointerout', () => {
            hovered = false
            paint()
        })
        container.on('pointerdown', () => {
            this.tapPulse(container)
            this.time.delayedCall(60, onClick)
        })

        this.addFocusTarget(onClick, (value) => {
            focused = value
            paint()
        })
        return container
    }

    private makeLocalButton(rect: L.Rect, label: string, onClick: () => void): Phaser.GameObjects.Container {
        const container = this.add.container(L.cx(rect), L.cy(rect))
        const graphics = this.add.graphics()
        const text = this.add.text(0, 0, label, {
            fontFamily: FONT.body,
            fontSize: '20px',
            fontStyle: FONT_WEIGHT.extraBold,
            color: CSS.background,
        }).setOrigin(0.5).setResolution(2)
        let hovered = false

        const paint = (): void => {
            graphics.clear()
            this.paintSimpleButton(
                graphics,
                rect.w,
                rect.h,
                hovered ? C.text : C.cyan,
                C.cyan,
                hovered,
            )
        }

        paint()
        container.add([graphics, text])
        container.setSize(rect.w, rect.h).setInteractive({ useHandCursor: true })
        container.on('pointerover', () => {
            hovered = true
            paint()
        })
        container.on('pointerout', () => {
            hovered = false
            paint()
        })
        container.on('pointerdown', () => {
            this.tapPulse(container)
            this.time.delayedCall(60, onClick)
        })
        return container
    }

    private paintTechFrame(
        graphics: Phaser.GameObjects.Graphics,
        rect: L.Rect,
        accent: number,
        active = false,
        hovered = false,
        fill: number = C.panelDeep,
    ): void {
        const radius = RADIUS.card
        const face = hovered ? C.elevated : fill

        graphics.fillStyle(C.shadow, ALPHA.shadow)
        graphics.fillRoundedRect(rect.x + 5, rect.y + 9, rect.w, rect.h, radius)

        if (active || hovered) {
            graphics.lineStyle(STROKE.glow, accent, active ? ALPHA.glow + 0.08 : ALPHA.glow)
            graphics.strokeRoundedRect(rect.x - 1, rect.y - 1, rect.w + 2, rect.h + 2, radius + 1)
        }

        graphics.fillStyle(face, 0.98)
        graphics.fillRoundedRect(rect.x, rect.y, rect.w, rect.h, radius)

        graphics.fillStyle(C.text, hovered ? 0.12 : 0.075)
        graphics.fillRoundedRect(rect.x + 8, rect.y + 7, rect.w - 16, Math.max(20, rect.h * 0.28), radius - 4)

        graphics.fillStyle(C.background, 0.2)
        graphics.fillRoundedRect(rect.x + 8, rect.y + rect.h - Math.max(22, rect.h * 0.24) - 7, rect.w - 16, Math.max(22, rect.h * 0.24), radius - 6)

        graphics.lineStyle(1, C.text, hovered ? 0.16 : 0.09)
        graphics.strokeRoundedRect(rect.x + 6, rect.y + 6, rect.w - 12, rect.h - 12, Math.max(4, radius - 5))

        graphics.lineStyle(active ? STROKE.focus : STROKE.default, accent, active ? 0.95 : 0.72)
        graphics.strokeRoundedRect(rect.x, rect.y, rect.w, rect.h, radius)

        graphics.fillStyle(accent, active ? 0.84 : 0.46)
        graphics.fillRoundedRect(rect.x + 16, rect.y + 1, Math.min(76, rect.w * 0.28), 4, 2)
        graphics.fillStyle(C.text, active ? 0.26 : 0.14)
        graphics.fillRoundedRect(rect.x + rect.w - Math.min(86, rect.w * 0.3) - 16, rect.y + rect.h - 5, Math.min(86, rect.w * 0.3), 3, 2)
    }
    private drawTechnicalCorners(
        graphics: Phaser.GameObjects.Graphics,
        rect: L.Rect,
        color: number,
    ): void {
        const inset = 18
        const length = 36
        graphics.lineStyle(3, color, 0.34)
        graphics.lineBetween(rect.x + inset, rect.y + 1, rect.x + inset + length, rect.y + 1)
        graphics.lineBetween(rect.x + rect.w - inset - length, rect.y + rect.h - 1, rect.x + rect.w - inset, rect.y + rect.h - 1)
        graphics.fillStyle(C.text, 0.075)
        graphics.fillRoundedRect(rect.x + 18, rect.y + 16, rect.w - 36, 44, 16)
    }
    private animateSceneEntrance(): void {
        const targets = this.children.list.filter((object) => {
            if (object instanceof Phaser.GameObjects.Zone) return false
            const depth = 'depth' in object
                ? Number((object as Phaser.GameObjects.GameObject & { depth: number }).depth)
                : -1
            const visible = 'visible' in object
                ? Boolean((object as Phaser.GameObjects.GameObject & { visible: boolean }).visible)
                : false
            return visible && depth >= CONTENT_DEPTH && depth < 80
        }) as Array<Phaser.GameObjects.GameObject & Phaser.GameObjects.Components.Transform & Phaser.GameObjects.Components.Alpha>

        targets.forEach((target, index) => {
            const startY = target.y
            const startScaleX = target.scaleX
            const startScaleY = target.scaleY
            target.setAlpha(0)
            target.y = startY + 24
            target.scaleX = startScaleX * 0.96
            target.scaleY = startScaleY * 0.96
            this.tweens.add({
                targets: target,
                alpha: 1,
                y: startY,
                scaleX: startScaleX,
                scaleY: startScaleY,
                duration: MOTION.entrance,
                delay: 45 + Math.min(index, 14) * MOTION.entranceStagger,
                ease: 'Back.easeOut',
            })
        })
    }

    private paintSimpleButton(
        graphics: Phaser.GameObjects.Graphics,
        width: number,
        height: number,
        fill: number,
        accent: number,
        active: boolean,
    ): void {
        const halfW = width / 2
        const halfH = height / 2
        const radius = RADIUS.button
        const isPrimary = fill === C.cyan || fill === C.text

        graphics.fillStyle(C.shadow, ALPHA.shadow)
        graphics.fillRoundedRect(-halfW + 4, -halfH + 7, width, height, radius)

        if (active) {
            graphics.lineStyle(STROKE.glow, accent, ALPHA.glow + 0.08)
            graphics.strokeRoundedRect(-halfW - 1, -halfH - 1, width + 2, height + 2, radius + 1)
        }

        graphics.fillStyle(fill, 1)
        graphics.fillRoundedRect(-halfW, -halfH, width, height, radius)

        graphics.fillStyle(0xffffff, isPrimary ? 0.42 : 0.18)
        graphics.fillRoundedRect(-halfW + 8, -halfH + 6, width - 16, height * 0.36, radius * 0.72)

        graphics.fillStyle(C.background, isPrimary ? 0.08 : 0.18)
        graphics.fillRoundedRect(-halfW + 10, halfH - height * 0.3 - 5, width - 20, height * 0.24, radius * 0.55)

        graphics.lineStyle(active ? 4 : 3, accent, active ? 1 : 0.86)
        graphics.strokeRoundedRect(-halfW, -halfH, width, height, radius)

        graphics.lineStyle(1, C.text, isPrimary ? 0.28 : 0.16)
        graphics.lineBetween(-halfW + radius, -halfH + 8, halfW - radius, -halfH + 8)
    }
    private addFocusTarget(activate: () => void, paintFocus: (focused: boolean) => void): void {
        this.focusTargets.push({ activate, paintFocus })
    }

    private registerKeyboard(): void {
        const keyboard = this.input.keyboard
        if (!keyboard) return

        keyboard.on('keydown-TAB', this.onTabKey, this)
        keyboard.on('keydown-ENTER', this.onActivateKey, this)
        keyboard.on('keydown-SPACE', this.onActivateKey, this)
        keyboard.on('keydown-ESC', this.onEscapeKey, this)
    }

    private onTabKey(event: KeyboardEvent): void {
        if (this.locked || !this.focusTargets.length) return
        event.preventDefault()
        this.focusTargets[this.focusIndex]?.paintFocus(false)
        const direction = event.shiftKey ? -1 : 1
        this.focusIndex = Phaser.Math.Wrap(this.focusIndex + direction, 0, this.focusTargets.length)
        this.focusTargets[this.focusIndex].paintFocus(true)
    }

    private onActivateKey(event: KeyboardEvent): void {
        if (this.locked || this.focusIndex < 0) return
        event.preventDefault()
        this.focusTargets[this.focusIndex]?.activate()
    }

    private onEscapeKey(event: KeyboardEvent): void {
        if (this.locked || this.phase.kind !== 'conflito') return
        event.preventDefault()
        this.undoConflict()
    }

    private onLoseGame(reason = 'A estabilidade chegou a zero.'): void {
        if (this.ended) return

        this.ended = true
        this.locked = true
        this.stability = 0

        if (!this.gameOverEmitted) {
            this.gameOverEmitted = true
            runtimeGameBridge.emit({
                type: 'GAME_OVER',
                gameId: GAME_ID,
                stage: this.level.level,
            })
        }

        EventBus.emit('timer-stop')
        this.clearFeedback()
        this.broadcastMission()
        this.cameras.main.shake(250, 0.005)

        showLevelComplete(this, {
            title: 'O computador travou',
            subtitle: 'A estabilidade chegou a zero.',
            message: `${reason} A partida terminou com ${this.score} pontos.`,
            accent: C.red,
            overlayColor: C.background,
            titleColor: CSS.red,
            subtitleColor: CSS.text,
            buttons: [
                {
                    label: 'Jogar novamente',
                    color: C.cyan,
                    onClick: () => {
                        this.scene.restart({
                            level: 1,
                            phase: 0,
                            score: 0,
                            stability: LEVELS[0].stability,
                            hits: 0,
                            errors: 0,
                        } satisfies GameSceneData)
                    },
                },
                {
                    label: 'Sair',
                    color: C.surface,
                    onClick: () => EventBus.emit('exit-game'),
                },
            ],
        })
    }

    private registerEvents(): void {
        EventBus.on('timer-end', this.onTimeUp, this)
        EventBus.on('show-tutorial', this.onShowTutorial, this)
        EventBus.on('lose-game', this.onLoseGame, this)
    }

    private onShowTutorial(): void {
        if (this.locked || this.tutorialOpen || this.ended) return
        this.runTutorial(() => undefined, true)
    }

    private registerPlatformCommands(): void {
        this.unsubPlatform = runtimeGameBridge.onCommand((command: PlatformCommand) => {
            if (command.type !== 'START_GAME' || command.gameId !== GAME_ID) return
            const level = Phaser.Math.Clamp(command.stage, 1, LEVELS.length)
            if (level === this.level.level) return

            EventBus.emit('timer-stop')
            this.time.delayedCall(100, () => {
                this.scene.restart({
                    level,
                    phase: 0,
                    score: this.score,
                    hits: this.hits,
                    errors: this.errors,
                })
            })
        })
    }

    private drawStateShape(
        graphics: Phaser.GameObjects.Graphics,
        shape: 'check' | 'clock' | 'slash',
        x: number,
        y: number,
        color: number,
    ): void {
        graphics.lineStyle(3, color, 1)
        if (shape === 'check') {
            graphics.lineBetween(x - 8, y, x - 2, y + 6)
            graphics.lineBetween(x - 2, y + 6, x + 9, y - 7)
        } else if (shape === 'clock') {
            graphics.strokeCircle(x, y, 10)
            graphics.lineBetween(x, y, x, y - 6)
            graphics.lineBetween(x, y, x + 5, y + 3)
        } else {
            graphics.strokeCircle(x, y, 10)
            graphics.lineBetween(x - 7, y + 7, x + 7, y - 7)
        }
    }

    private firstProgramOf(phase: PhaseConfig): ProgramId | undefined {
        return phase.kind === 'sistemas' ? undefined : phase.requests[0]?.programId
    }

    private tapPulse(target: Phaser.GameObjects.GameObject & Phaser.GameObjects.Components.Transform): void {
        this.tweens.add({
            targets: target,
            scaleX: target.scaleX * 0.96,
            scaleY: target.scaleY * 0.96,
            duration: MOTION.tapDown,
            yoyo: true,
        })
        this.playTone(560, 0.04, 'sine', 0.07)
    }

    private spark(x: number, y: number): void {
        for (let index = 0; index < 7; index += 1) {
            const angle = (Math.PI * 2 * index) / 7
            const particle = this.add.image(x, y, 'fx-particula')
                .setDisplaySize(18, 18)
                .setTint(index % 2 ? C.cyan : C.green)
                .setBlendMode(Phaser.BlendModes.ADD)
                .setDepth(90)

            this.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * 58,
                y: y + Math.sin(angle) * 38,
                alpha: 0,
                duration: 440,
                ease: 'Cubic.easeOut',
                onComplete: () => particle.destroy(),
            })
        }
    }

    private playTone(
        frequency: number,
        duration: number,
        type: OscillatorType = 'sine',
        gain = 0.12,
    ): void {
        const manager = this.sound as Phaser.Sound.WebAudioSoundManager
        const context = manager.context
        if (!context) return

        const oscillator = context.createOscillator()
        const volume = context.createGain()
        oscillator.connect(volume)
        volume.connect(context.destination)
        oscillator.type = type
        oscillator.frequency.setValueAtTime(frequency, context.currentTime)
        volume.gain.setValueAtTime(gain, context.currentTime)
        volume.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration)
        oscillator.start()
        oscillator.stop(context.currentTime + duration)
    }

    private playError(): void {
        this.playTone(280, 0.16, 'square', 0.1)
        this.time.delayedCall(120, () => this.playTone(210, 0.2, 'square', 0.08))
    }

    private playFanfare(): void {
        ;[523, 659, 784].forEach((frequency, index) => {
            this.time.delayedCall(index * 110, () => this.playTone(frequency, 0.2, 'sine', 0.11))
        })
    }

    private keepOverlay<T extends Phaser.GameObjects.GameObject>(object: T): T {
        this.overlayObjects.push(object)
        return object
    }

    private clearOverlay(): void {
        this.overlayObjects.forEach((object) => {
            if (object.active) object.destroy()
        })
        this.overlayObjects = []
    }

    private clearFeedback(): void {
        this.feedbackObjects.forEach((object) => {
            if (object.active) object.destroy()
        })
        this.feedbackObjects = []
    }

    private numberToCss(color: number): string {
        return `#${color.toString(16).padStart(6, '0')}`
    }

    private cleanup(): void {
        EventBus.off('timer-end', this.onTimeUp, this)
        EventBus.off('show-tutorial', this.onShowTutorial, this)
        EventBus.off('lose-game', this.onLoseGame, this)
        this.input.off('wheel', this.onQueueWheel, this)
        this.input.keyboard?.off('keydown-TAB', this.onTabKey, this)
        this.input.keyboard?.off('keydown-ENTER', this.onActivateKey, this)
        this.input.keyboard?.off('keydown-SPACE', this.onActivateKey, this)
        this.input.keyboard?.off('keydown-ESC', this.onEscapeKey, this)
        this.unsubPlatform?.()
        this.queueContent?.clearMask(true)
        this.queueMaskSource?.destroy()
        this.clearFeedback()
        this.clearOverlay()
    }
}
