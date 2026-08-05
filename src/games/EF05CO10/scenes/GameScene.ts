import Phaser from 'phaser'
import { runtimeGameBridge } from '../../../shared/bridge/runtimeGameBridge'
import { EventBus } from '../../../shared/EventBus'
import { createTutorial, type TutorialStep } from '../../../shared/tutorial/createTutorial'
import { showLevelComplete } from '../../../shared/level/showLevelComplete'
import { LEVELS, MAX_SCORE, SCORE_LABEL } from '../data/levels'
import { CHARACTERS, CRITERIA, MOMENT_LABEL, SCENERIES, THEMES } from '../data/story'
import { C, A, CRITERION_COLOR, hex } from '../data/theme'
import { W, H, STAGE, STRIP, CHOICE, MASCOTE } from '../data/layout'
import type {
    CharId,
    CriterionId,
    Frame,
    LevelConfig,
    LineOption,
    MessageOption,
    PhaseConfig,
    SceneryId,
    Score,
    SlotConfig,
    TechId,
    ThemeId,
} from '../types'

const GAME_ID = 'futuro-em-cena'

type StepId = 'tema' | 'personagem' | 'cenario' | 'fala'
type PanelMode = 'edit' | 'message' | 'ready'

interface Draft {
    themeId?: ThemeId
    charId?: CharId
    sceneryId?: SceneryId
    line?: LineOption
}

export class GameScene extends Phaser.Scene {
    private levelIdx = 0
    private phaseIdx = 0
    private points = 0
    private locked = true
    private ended = false

    private frames: Array<Frame | undefined> = []
    private draft: Draft = {}
    private slotIdx = 0
    private stepIdx = 0
    private steps: StepId[] = []
    private mode: PanelMode = 'edit'
    private message?: MessageOption

    private stageLayer!: Phaser.GameObjects.Container
    private stageMask!: Phaser.Display.Masks.GeometryMask
    private stripLayer!: Phaser.GameObjects.Container
    private choiceLayer!: Phaser.GameObjects.Container

    private tutorialKey = ''
    private tutorialSteps: TutorialStep[] = []

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; phase?: number; points?: number }) {
        this.levelIdx = (data.level ?? 1) - 1
        this.phaseIdx = data.phase ?? 0
        this.points = data.points ?? 0
        this.locked = true
        this.ended = false
        this.frames = []
        this.draft = {}
        this.slotIdx = 0
        this.stepIdx = 0
        this.steps = []
        this.mode = 'edit'
        this.message = undefined
        this.tutorialSteps = []
    }

    private get level(): LevelConfig {
        return LEVELS[this.levelIdx]
    }

    private get phase(): PhaseConfig {
        return this.level.phases[this.phaseIdx]
    }

    private get slots(): SlotConfig[] {
        const p = this.phase
        if (p.kind === 'cena') return [{ moment: p.moment, label: 'Sua cena' }]
        return p.slots
    }

    private get themeId(): ThemeId {
        const p = this.phase
        if (p.kind !== 'cena') return p.theme
        return this.draft.themeId ?? p.themeOptions[0]
    }

    create() {
        this.drawBackground()
        this.buildStageFrame()

        this.stageLayer = this.add.container(0, 0)
        this.stripLayer = this.add.container(0, 0)
        this.choiceLayer = this.add.container(0, 0)

        this.frames = this.slots.map(() => undefined)
        this.resetDraft()

        this.renderStage()
        this.renderStrip()
        this.renderPanel()

        this.publishHud()
        this.time.delayedCall(0, () => this.publishHud())
        EventBus.once('ui-ready', () => this.publishHud())
        EventBus.emit('seals-hide')
        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID, stage: this.level.level })

        EventBus.on('show-tutorial', this.replayTutorial, this)
        this.events.once('shutdown', () => {
            EventBus.off('show-tutorial', this.replayTutorial, this)
        })

        if (this.phaseIdx === 0) this.showLevelIntro(() => this.runTutorial())
        else this.runTutorial()
    }

    private drawBackground() {
        const bg = this.add.image(W / 2, H / 2, 'bg-studio').setDepth(-3)
        bg.setScale(Math.max(W / bg.width, H / bg.height))

        const veil = this.add.graphics().setDepth(-2)
        veil.fillStyle(C.sky, A.veil)
        veil.fillRect(0, 0, W, H)
    }

    private buildStageFrame() {
        const g = this.add.graphics().setDepth(-1)
        g.fillStyle(C.shadow, A.shadow)
        g.fillRoundedRect(STAGE.x + 4, STAGE.y + 10, STAGE.w, STAGE.h, 26)
        g.fillStyle(C.stage, 1)
        g.fillRoundedRect(STAGE.x - 10, STAGE.y - 10, STAGE.w + 20, STAGE.h + 20, 30)
        g.fillStyle(C.stageEdge, 1)
        g.fillRoundedRect(STAGE.x - 4, STAGE.y - 4, STAGE.w + 8, STAGE.h + 8, 26)
        g.fillStyle(C.greySoft, 1)
        g.fillRoundedRect(STAGE.x, STAGE.y, STAGE.w, STAGE.h, 22)

        const shape = this.make.graphics({}, false)
        shape.fillStyle(0xffffff)
        shape.fillRoundedRect(STAGE.x, STAGE.y, STAGE.w, STAGE.h, 22)
        this.stageMask = shape.createGeometryMask()

        const filmG = this.add.graphics().setDepth(-1)
        filmG.fillStyle(C.film, 1)
        filmG.fillRoundedRect(STAGE.x - 10, STRIP.y - 12, STAGE.w + 20, STRIP.h + 24, 18)
        filmG.fillStyle(C.filmHole, 0.5)
        for (let x = STAGE.x + 4; x < STAGE.x + STAGE.w; x += 34) {
            filmG.fillRoundedRect(x, STRIP.y - 6, 18, 10, 4)
            filmG.fillRoundedRect(x, STRIP.y + STRIP.h + 2, 18, 10, 4)
        }
    }

    private resetDraft() {
        const p = this.phase
        this.draft = {}
        this.steps = p.kind === 'cena' && p.themeOptions.length > 1
            ? ['tema', 'personagem', 'cenario', 'fala']
            : ['personagem', 'cenario', 'fala']
        this.stepIdx = 0
        this.mode = 'edit'
    }

    private slotX(i: number) {
        const n = this.slots.length
        return STAGE.cx + (i - (n - 1) / 2) * STRIP.gapX
    }

    private renderStage() {
        this.stageLayer.removeAll(true)

        const frame = this.frames[this.slotIdx]
        const sceneryId = this.draft.sceneryId ?? frame?.sceneryId
        const charId = this.draft.charId ?? frame?.charId
        const line = this.draft.line ?? frame?.line
        const slot = this.slots[this.slotIdx]

        if (sceneryId) {
            const img = this.add.image(STAGE.cx, STAGE.cy, SCENERIES[sceneryId].texture)
            img.setScale(Math.max(STAGE.w / img.width, STAGE.h / img.height))
            img.setMask(this.stageMask)
            this.stageLayer.add(img)

            const veil = this.add.graphics()
            veil.fillStyle(C.stage, A.stageVeil * 0.4)
            veil.fillRoundedRect(STAGE.x, STAGE.y, STAGE.w, STAGE.h, 22)
            this.stageLayer.add(veil)
        } else {
            const empty = this.add.graphics()
            empty.lineStyle(4, C.border, 1)
            empty.strokeRoundedRect(STAGE.x + 26, STAGE.y + 26, STAGE.w - 52, STAGE.h - 52, 18)
            const hint = this.add.text(STAGE.cx, STAGE.cy, 'Sua cena aparece aqui', {
                fontFamily: 'Arial Black, Arial',
                fontSize: '22px',
                color: hex(C.grey),
            }).setOrigin(0.5).setResolution(2)
            this.stageLayer.add([empty, hint])
        }

        const badge = this.add.graphics()
        const bw = 168
        badge.fillStyle(C.stage, 0.9)
        badge.fillRoundedRect(STAGE.x + 16, STAGE.y + 16, bw, 38, 19)
        this.stageLayer.add(badge)
        this.stageLayer.add(this.add.text(STAGE.x + 16 + bw / 2, STAGE.y + 35, MOMENT_LABEL[slot.moment], {
            fontFamily: 'Arial Black, Arial',
            fontSize: '17px',
            color: hex(C.spotlight),
        }).setOrigin(0.5).setResolution(2))

        if (charId) {
            const char = this.add.image(STAGE.cx + STAGE.charDx, STAGE.cy + STAGE.charDy, CHARACTERS[charId].texture)
            const tall = char.height / char.width > 1.6
            char.setOrigin(0.5, 1)
            char.setScale((tall ? STAGE.charTallH : STAGE.charH) / char.height)
            char.setMask(this.stageMask)
            this.stageLayer.add(char)
        }

        if (this.draft.themeId || this.phase.kind !== 'cena' || frame) {
            const tech = THEMES[this.themeId].tech
            const tx = STAGE.cx + STAGE.techDx
            const ty = STAGE.cy + STAGE.techDy
            const halo = this.add.graphics()
            halo.fillStyle(C.spotlight, 0.28)
            halo.fillCircle(tx, ty, 46)
            halo.fillStyle(C.white, 1)
            halo.fillCircle(tx, ty, 34)
            halo.lineStyle(4, C.violet, 1)
            halo.strokeCircle(tx, ty, 34)
            const icon = this.add.graphics()
            this.drawTechIcon(icon, tech, tx, ty, 24, C.violet)
            this.stageLayer.add([halo, icon])
        }

        if (line) {
            this.stageLayer.add(this.buildBalloon(line.text, STAGE.cx + 40, STAGE.y + STAGE.balloonY - STAGE.y))
        }
    }

    private buildBalloon(text: string, cx: number, cy: number) {
        const layer = this.add.container(0, 0)
        const t = this.add.text(cx, cy, text, {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: '19px',
            color: hex(C.ink),
            align: 'center',
            wordWrap: { width: STAGE.balloonW - 56 },
        }).setOrigin(0.5).setResolution(2)

        const bw = STAGE.balloonW
        const bh = t.height + 44
        const g = this.add.graphics()
        g.fillStyle(C.shadow, 0.2)
        g.fillRoundedRect(cx - bw / 2 + 3, cy - bh / 2 + 8, bw, bh, 22)
        g.fillStyle(C.balloon, 1)
        g.fillRoundedRect(cx - bw / 2, cy - bh / 2, bw, bh, 22)
        g.lineStyle(4, C.balloonEdge, 1)
        g.strokeRoundedRect(cx - bw / 2, cy - bh / 2, bw, bh, 22)
        g.fillStyle(C.balloon, 1)
        g.fillTriangle(cx - bw / 2 + 46, cy + bh / 2 - 4, cx - bw / 2 + 106, cy + bh / 2 - 4, cx - bw / 2 + 34, cy + bh / 2 + 34)
        g.lineStyle(4, C.balloonEdge, 1)
        g.lineBetween(cx - bw / 2 + 46, cy + bh / 2 - 2, cx - bw / 2 + 34, cy + bh / 2 + 34)
        g.lineBetween(cx - bw / 2 + 34, cy + bh / 2 + 34, cx - bw / 2 + 104, cy + bh / 2 - 2)

        layer.add([g, t])
        return layer
    }

    private renderStrip() {
        this.stripLayer.removeAll(true)

        this.slots.forEach((slot, i) => {
            const x = this.slotX(i)
            const filled = this.frames[i]
            const active = i === this.slotIdx
            const w = STRIP.slotW
            const h = STRIP.slotH

            const g = this.add.graphics()
            g.fillStyle(filled ? C.white : C.stageEdge, 1)
            g.fillRoundedRect(x - w / 2, STRIP.cy - h / 2, w, h, 14)
            g.lineStyle(active ? 5 : 3, active ? C.amber : filled ? C.violet : C.grey, 1)
            g.strokeRoundedRect(x - w / 2, STRIP.cy - h / 2, w, h, 14)

            const label = this.add.text(x, STRIP.cy - h / 2 + 20, slot.label, {
                fontFamily: 'Arial Black, Arial',
                fontSize: '14px',
                color: hex(filled ? C.violetDark : C.grey),
                align: 'center',
                wordWrap: { width: w - 20 },
            }).setOrigin(0.5, 0).setResolution(2)

            this.stripLayer.add([g, label])

            if (filled) {
                const chip = this.add.text(x, STRIP.cy + 22, filled.line.chip, {
                    fontFamily: 'Arial',
                    fontStyle: 'bold',
                    fontSize: '15px',
                    color: hex(C.ink),
                    align: 'center',
                    wordWrap: { width: w - 22 },
                }).setOrigin(0.5).setResolution(2)
                const mark = this.add.graphics()
                mark.fillStyle(C.violet, 1)
                mark.fillCircle(x + w / 2 - 18, STRIP.cy - h / 2 + 16, 11)
                mark.lineStyle(3, C.white, 1)
                mark.beginPath()
                mark.moveTo(x + w / 2 - 23, STRIP.cy - h / 2 + 16)
                mark.lineTo(x + w / 2 - 19, STRIP.cy - h / 2 + 21)
                mark.lineTo(x + w / 2 - 12, STRIP.cy - h / 2 + 11)
                mark.strokePath()
                this.stripLayer.add([chip, mark])
            } else {
                const plus = this.add.graphics()
                plus.lineStyle(5, C.grey, 1)
                plus.lineBetween(x - 14, STRIP.cy + 16, x + 14, STRIP.cy + 16)
                plus.lineBetween(x, STRIP.cy + 2, x, STRIP.cy + 30)
                this.stripLayer.add(plus)
            }

            const zone = this.add.zone(x, STRIP.cy, w, h).setInteractive({ useHandCursor: true })
            zone.on('pointerdown', () => {
                if (this.locked || this.slots.length === 1) return
                this.slotIdx = i
                this.resetDraft()
                this.renderStage()
                this.renderStrip()
                this.renderPanel()
            })
            this.stripLayer.add(zone)
        })
    }

    private renderPanel() {
        this.choiceLayer.removeAll(true)

        const g = this.add.graphics()
        g.fillStyle(C.shadow, A.shadow)
        g.fillRoundedRect(CHOICE.x + 4, CHOICE.y + 10, CHOICE.w, CHOICE.h, 26)
        g.fillStyle(C.panel, 1)
        g.fillRoundedRect(CHOICE.x, CHOICE.y, CHOICE.w, CHOICE.h, 26)
        g.lineStyle(3, C.border, 1)
        g.strokeRoundedRect(CHOICE.x, CHOICE.y, CHOICE.w, CHOICE.h, 26)
        this.choiceLayer.add(g)

        if (this.mode === 'ready') return this.renderReadyPanel()
        if (this.mode === 'message') return this.renderMessagePanel()
        this.renderStepPanel()
    }

    private panelHeader(title: string, hint: string) {
        const t = this.add.text(CHOICE.cx, CHOICE.headerY, title, {
            fontFamily: 'Arial Black, Arial',
            fontSize: '26px',
            color: hex(C.violetDark),
            align: 'center',
            wordWrap: { width: CHOICE.w - 70 },
        }).setOrigin(0.5).setResolution(2)

        const h = this.add.text(CHOICE.cx, CHOICE.hintY, hint, {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: '18px',
            color: hex(C.inkSoft),
            align: 'center',
            wordWrap: { width: CHOICE.w - 80 },
        }).setOrigin(0.5).setResolution(2)

        this.choiceLayer.add([t, h])
    }

    private stepDots() {
        const total = this.steps.length
        const g = this.add.graphics()
        const firstX = CHOICE.cx - ((total - 1) * 26) / 2
        for (let i = 0; i < total; i++) {
            const done = i < this.stepIdx
            const active = i === this.stepIdx
            g.fillStyle(active ? C.amber : done ? C.violet : C.greySoft, 1)
            g.fillCircle(firstX + i * 26, CHOICE.y + 34, active ? 9 : 7)
        }
        this.choiceLayer.add(g)
    }

    private renderStepPanel() {
        this.stepDots()
        const step = this.steps[this.stepIdx]
        const p = this.phase

        if (step === 'tema' && p.kind === 'cena') {
            this.panelHeader('Qual é o tema?', 'Escolha a mudança que a sua cena vai mostrar.')
            p.themeOptions.forEach((id, i) => {
                const th = THEMES[id]
                this.addOption(i, th.label, th.headline, () => {
                    this.draft.themeId = id
                    this.advanceStep()
                }, icon => this.drawTechIcon(icon, th.tech, 0, 0, 20, C.violet))
            })
            return
        }

        if (step === 'personagem') {
            this.panelHeader('Quem aparece na cena?', 'Pense em quem vive essa mudança de perto.')
            this.availableCharacters().forEach((id, i) => {
                const ch = CHARACTERS[id]
                this.addOption(i, ch.voice, ch.label, () => {
                    this.draft.charId = id
                    this.renderStage()
                    this.advanceStep()
                })
            })
            return
        }

        if (step === 'cenario') {
            this.panelHeader('Onde a cena acontece?', 'O lugar ajuda a contar a história.')
            this.phase.sceneryOptions.slice(0, 4).forEach((id, i) => {
                this.addOption(i, SCENERIES[id].label, '', () => {
                    this.draft.sceneryId = id
                    this.renderStage()
                    this.advanceStep()
                })
            })
            return
        }

        this.panelHeader('O que essa pessoa diz?', 'A fala precisa mostrar o que a tecnologia mudou.')
        this.availableLines().forEach((line, i) => {
            this.addOption(i, line.chip, line.text, () => {
                this.draft.line = line
                this.renderStage()
                this.saveFrame()
            })
        })
    }

    private renderMessagePanel() {
        this.panelHeader('Qual é a sua mensagem final?', 'Junte os dois pontos de vista em uma opinião sua.')
        const options = THEMES[this.themeId].messages ?? []
        options.forEach((option, i) => {
            this.addOption(i, option.chip, option.text, () => {
                this.message = option
                this.mode = 'ready'
                this.renderPanel()
            })
        })
    }

    private renderReadyPanel() {
        const p = this.phase
        this.panelHeader('História pronta', p.kind === 'cena'
            ? 'Confira a cena ao lado e publique quando gostar dela.'
            : 'Toque em um quadro do storyboard para refazer, ou publique.')

        if (this.message) {
            const box = this.add.graphics()
            const msg = this.add.text(CHOICE.cx, CHOICE.optionFirstY + 20, this.message.text, {
                fontFamily: 'Arial',
                fontStyle: 'bold',
                fontSize: '20px',
                color: hex(C.ink),
                align: 'center',
                wordWrap: { width: CHOICE.optionW - 60 },
            }).setOrigin(0.5).setResolution(2)
            const bh = msg.height + 56
            box.fillStyle(C.amberSoft, 1)
            box.fillRoundedRect(CHOICE.cx - CHOICE.optionW / 2, msg.y - bh / 2, CHOICE.optionW, bh, 20)
            box.lineStyle(3, C.amber, 1)
            box.strokeRoundedRect(CHOICE.cx - CHOICE.optionW / 2, msg.y - bh / 2, CHOICE.optionW, bh, 20)
            this.choiceLayer.add([box, msg])

            const redo = this.button(CHOICE.cx, msg.y + bh / 2 + 52, 300, 58, 'Trocar mensagem', C.grey, () => {
                this.message = undefined
                this.mode = 'message'
                this.renderPanel()
            }, '19px')
            this.choiceLayer.add(redo)
        } else {
            const preview = this.add.text(CHOICE.cx, CHOICE.optionFirstY + 60, this.frames
                .map((f, i) => `${this.slots[i].label}: ${f ? f.line.chip : '—'}`)
                .join('\n'), {
                fontFamily: 'Arial',
                fontStyle: 'bold',
                fontSize: '20px',
                color: hex(C.inkSoft),
                align: 'center',
                lineSpacing: 14,
            }).setOrigin(0.5).setResolution(2)
            this.choiceLayer.add(preview)
        }

        const publish = this.button(CHOICE.cx, CHOICE.actionY, CHOICE.actionW, CHOICE.actionH, 'PUBLICAR HISTÓRIA', C.green, () => {
            this.locked = true
            this.playStory(() => this.showReport())
        }, '23px')
        this.choiceLayer.add(publish)
    }

    private addOption(
        index: number,
        title: string,
        subtitle: string,
        onClick: () => void,
        drawIcon?: (g: Phaser.GameObjects.Graphics) => void,
    ) {
        const y = CHOICE.optionFirstY + index * CHOICE.optionGap
        const w = CHOICE.optionW
        const h = CHOICE.optionH
        const row = this.add.container(CHOICE.cx, y)

        const g = this.add.graphics()
        g.fillStyle(C.panelSoft, 1)
        g.fillRoundedRect(-w / 2, -h / 2, w, h, 20)
        g.lineStyle(3, C.border, 1)
        g.strokeRoundedRect(-w / 2, -h / 2, w, h, 20)
        g.fillStyle(C.violet, 1)
        g.fillRoundedRect(-w / 2 + 14, -h / 2 + 14, 10, h - 28, 5)

        const textX = drawIcon ? -w / 2 + 82 : -w / 2 + 44
        const objects: Phaser.GameObjects.GameObject[] = [g]

        if (drawIcon) {
            const badge = this.add.graphics()
            badge.fillStyle(C.violetSoft, 1)
            badge.fillCircle(-w / 2 + 54, 0, 22)
            const icon = this.add.graphics()
            icon.setPosition(-w / 2 + 54, 0)
            drawIcon(icon)
            objects.push(badge, icon)
        }

        const t = this.add.text(textX, subtitle ? -12 : 0, title, {
            fontFamily: 'Arial Black, Arial',
            fontSize: '20px',
            color: hex(C.ink),
            wordWrap: { width: w - (textX + w / 2) - 26 },
        }).setOrigin(0, 0.5).setResolution(2)
        objects.push(t)

        if (subtitle) {
            const s = this.add.text(textX, 15, subtitle, {
                fontFamily: 'Arial',
                fontStyle: 'bold',
                fontSize: '16px',
                color: hex(C.inkSoft),
                wordWrap: { width: w - (textX + w / 2) - 26 },
            }).setOrigin(0, 0.5).setResolution(2)
            objects.push(s)
        }

        row.add(objects)
        row.setSize(w, h)
        row.setInteractive({ useHandCursor: true })
        row.on('pointerdown', () => {
            if (this.locked) return
            this.tweens.add({ targets: row, scale: 0.97, duration: 70, yoyo: true })
            onClick()
        })

        this.choiceLayer.add(row)
    }

    private availableCharacters(): CharId[] {
        const slot = this.slots[this.slotIdx]
        const used = this.frames
            .filter((f, i) => f && this.slots[i].speaker && this.slots[i].speaker !== slot.speaker)
            .map(f => f!.charId)
        const list = this.phase.characterOptions.filter(id => !used.includes(id))
        return list.slice(0, 4)
    }

    private availableLines(): LineOption[] {
        const slot = this.slots[this.slotIdx]
        const pool = THEMES[this.themeId].lines[slot.moment] ?? []
        const used = this.frames.filter((f, i) => f && i !== this.slotIdx).map(f => f!.line.id)
        const list = pool.filter(l => !used.includes(l.id))
        return list.length >= 3 ? list.slice(0, 4) : pool.slice(0, 4)
    }

    private advanceStep() {
        this.stepIdx++
        this.renderPanel()
    }

    private saveFrame() {
        const slot = this.slots[this.slotIdx]
        this.frames[this.slotIdx] = {
            moment: slot.moment,
            charId: this.draft.charId!,
            sceneryId: this.draft.sceneryId!,
            line: this.draft.line!,
            speaker: slot.speaker,
        }

        this.renderStrip()
        this.flashSlot(this.slotIdx)

        const next = this.frames.findIndex(f => f === undefined)
        this.time.delayedCall(340, () => {
            if (next >= 0) {
                this.slotIdx = next
                this.resetDraft()
                this.renderStage()
                this.renderStrip()
                this.renderPanel()
                return
            }
            this.draft = {}
            this.mode = this.phase.kind === 'narrativa' && !this.message ? 'message' : 'ready'
            this.renderPanel()
        })
    }

    private flashSlot(i: number) {
        const flash = this.add.graphics().setDepth(120)
        const x = this.slotX(i)
        flash.fillStyle(C.spotlight, 0.8)
        flash.fillRoundedRect(x - STRIP.slotW / 2, STRIP.cy - STRIP.slotH / 2, STRIP.slotW, STRIP.slotH, 14)
        this.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 420,
            onComplete: () => flash.destroy(),
        })
    }

    private computeScore(): Score {
        const score: Score = { clareza: 0, mudanca: 0, reflexao: 0 }
        const sources = [
            ...this.frames.filter(Boolean).map(f => f!.line.score),
            ...(this.message ? [this.message.score] : []),
        ]
        CRITERIA.forEach(def => {
            sources.forEach(s => {
                if (s[def.id] > score[def.id]) score[def.id] = s[def.id]
            })
        })

        if (this.slots.length > 1) {
            const moments = new Set(this.frames.filter(Boolean).map(f => f!.moment))
            const weak = this.frames.some(f => f && f.line.score.mudanca === 0)
            if (moments.size < 2 || weak) score.mudanca = Math.min(score.mudanca, 1)
        }

        return score
    }

    private playStory(onDone: () => void) {
        const veil = this.add.rectangle(W / 2, H / 2, W, H, C.stage, 0.55).setDepth(300).setInteractive()
        const board = this.add.container(0, 0).setDepth(301)

        const original = this.slotIdx
        let i = 0

        const step = () => {
            if (i >= this.frames.length) {
                this.slotIdx = original
                this.time.delayedCall(500, () => {
                    veil.destroy()
                    board.destroy()
                    this.renderStage()
                    onDone()
                })
                return
            }
            this.slotIdx = i
            this.renderStage()
            this.stageLayer.setAlpha(0)
            this.tweens.add({ targets: this.stageLayer, alpha: 1, duration: 260 })
            this.flashSlot(i)
            i++
            this.time.delayedCall(1150, step)
        }

        const light = this.add.graphics().setDepth(302)
        light.fillStyle(C.spotlight, 0.22)
        light.fillTriangle(STAGE.cx, STAGE.y - 40, STAGE.x - 20, STAGE.y + STAGE.h, STAGE.x + STAGE.w + 20, STAGE.y + STAGE.h)
        this.tweens.add({ targets: light, alpha: 0, duration: 1600, delay: 400, onComplete: () => light.destroy() })

        board.add(this.add.text(STAGE.cx, STRIP.cy, 'GRAVANDO...', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '26px',
            color: hex(C.spotlight),
        }).setOrigin(0.5).setResolution(2))

        step()
    }

    private showReport() {
        const score = this.computeScore()
        const total = score.clareza + score.mudanca + score.reflexao
        const earned = total * 5
        this.points += earned
        const strong = total >= 5

        EventBus.emit('seals-update', score)
        runtimeGameBridge.emit({
            type: strong ? 'CORRECT_ANSWER' : 'WRONG_ANSWER',
            gameId: GAME_ID,
            pointsEarned: earned,
            stage: this.level.level,
        })

        const overlay = this.add.rectangle(W / 2, H / 2, W, H, C.shadow, A.overlay)
            .setDepth(700).setInteractive()
        const modal = this.add.container(W / 2, H / 2).setDepth(701)

        const rows: Phaser.GameObjects.GameObject[] = []
        let cursor = 128

        CRITERIA.forEach(def => {
            const value = score[def.id]
            const tone = value >= 2 ? CRITERION_COLOR[def.id] : value === 1 ? C.amber : C.grey

            const bar = this.add.graphics()
            bar.fillStyle(C.greySoft, 1)
            bar.fillRoundedRect(-296, cursor + 6, 592, 60, 18)
            bar.fillStyle(tone, value === 0 ? 0.18 : 0.22)
            bar.fillRoundedRect(-296, cursor + 6, 592 * ((value + 1) / 3), 60, 18)
            bar.fillStyle(tone, 1)
            bar.fillCircle(-262, cursor + 36, 20)

            const icon = this.add.graphics()
            this.drawSealIcon(icon, def.id, -262, cursor + 36, 13, C.white)

            const name = this.add.text(-226, cursor + 22, def.name, {
                fontFamily: 'Arial Black, Arial',
                fontSize: '20px',
                color: hex(tone),
            }).setOrigin(0, 0.5).setResolution(2)

            const hint = this.add.text(-226, cursor + 48, def.question, {
                fontFamily: 'Arial',
                fontStyle: 'bold',
                fontSize: '15px',
                color: hex(C.inkSoft),
                wordWrap: { width: 380 },
            }).setOrigin(0, 0.5).setResolution(2)

            const tag = this.add.text(268, cursor + 36, SCORE_LABEL(value * 2), {
                fontFamily: 'Arial Black, Arial',
                fontSize: '13px',
                color: hex(tone),
            }).setOrigin(1, 0.5).setResolution(2)

            rows.push(bar, icon, name, hint, tag)
            cursor += 76
        })

        const weakest = CRITERIA.reduce((a, b) => (score[a.id] <= score[b.id] ? a : b))
        const feedbackSource = this.pickFeedback(score, weakest.id)

        const note = this.add.text(0, 0, feedbackSource, {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: '19px',
            color: hex(C.ink),
            align: 'center',
            wordWrap: { width: 580 },
        }).setOrigin(0.5).setResolution(2)

        cursor += 20
        note.setY(cursor + note.height / 2)
        cursor += note.height + 40

        const PH = cursor + 100
        const top = -PH / 2
        const tone = strong ? C.green : C.amber

        const bg = this.add.graphics()
        bg.fillStyle(C.shadow, 0.22)
        bg.fillRoundedRect(-340, top + 12, 680, PH, 28)
        bg.fillStyle(C.panel, 1)
        bg.fillRoundedRect(-340, top, 680, PH, 28)
        bg.lineStyle(5, tone, 1)
        bg.strokeRoundedRect(-340, top, 680, PH, 28)
        bg.fillStyle(tone, 1)
        bg.fillRoundedRect(-170, top - 15, 340, 28, 14)

        const title = this.add.text(0, top + 58, strong ? 'História publicada!' : 'Publicada, mas dá para ir além', {
            fontFamily: 'Arial Black, Arial',
            fontSize: strong ? '32px' : '26px',
            color: hex(C.violetDark),
            align: 'center',
            wordWrap: { width: 580 },
        }).setOrigin(0.5).setResolution(2);

        [...rows, note].forEach(o => {
            const obj = o as Phaser.GameObjects.Text
            obj.setY(obj.y + top)
        })

        const canRedo = !strong && this.slots.length > 1
        const buttons: Phaser.GameObjects.Container[] = []

        const finish = (redo: boolean) => {
            overlay.destroy()
            modal.destroy()
            mascote.destroy()
            if (redo) {
                this.points -= earned
                EventBus.emit('seals-hide')
                this.slotIdx = 0
                this.frames = this.slots.map(() => undefined)
                this.message = undefined
                this.resetDraft()
                this.renderStage()
                this.renderStrip()
                this.renderPanel()
                this.locked = false
                return
            }
            this.completePhase()
        }

        if (canRedo) {
            buttons.push(this.button(-158, PH / 2 - 54, 292, 64, 'Refazer a história', C.violet, () => finish(true), '20px', true))
            buttons.push(this.button(158, PH / 2 - 54, 292, 64, 'Continuar assim', C.grey, () => finish(false), '20px', true))
        } else {
            buttons.push(this.button(0, PH / 2 - 54, 300, 64, 'Continuar', C.green, () => finish(false), '21px', true))
        }

        const mascote = this.add.image(W / 2 - 330, H / 2 + top + MASCOTE.h / 2 - 26, strong ? 'mascote-reacao' : 'mascote-normal')
            .setDisplaySize(MASCOTE.w, MASCOTE.h).setDepth(702)

        modal.add([bg, title, ...rows, note, ...buttons])
        modal.setScale(0.92).setAlpha(0)
        mascote.setAlpha(0)
        this.tweens.add({ targets: modal, alpha: 1, scale: 1, duration: 240, ease: 'Back.easeOut' })
        this.tweens.add({ targets: mascote, alpha: 1, duration: 240 })
    }

    private pickFeedback(score: Score, weakest: CriterionId) {
        if (score.clareza + score.mudanca + score.reflexao >= MAX_SCORE - 1) {
            return this.message
                ? this.message.why
                : this.frames.filter(Boolean).map(f => f!.line.why)[0] ?? ''
        }
        if (weakest === 'clareza') return 'Falta dizer qual tecnologia está em cena. Uma fala que cita o aparelho deixa isso claro.'
        if (weakest === 'mudanca') return 'A história ainda não mostra o que ficou diferente. Compare como era antes e como é agora.'
        return 'Toda mudança tem um ganho e um cuidado. Uma fala que mostra os dois lados vira opinião crítica.'
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
                accent: C.violet,
                overlayColor: C.shadow,
                titleColor: hex(C.violetDark),
                subtitleColor: hex(C.violet),
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
            title: 'Estreia no estúdio!',
            subtitle: `${this.points} pontos`,
            message: 'Toda tecnologia muda o jeito de viver e de trabalhar. Agora você sabe contar isso com opinião própria.',
            accent: C.green,
            overlayColor: C.shadow,
            titleColor: hex(C.violetDark),
            subtitleColor: hex(C.green),
            progress: { total: LEVELS.length, current: LEVELS.length },
        })
    }

    private showLevelIntro(onStart: () => void) {
        this.locked = true

        const overlay = this.add.rectangle(W / 2, H / 2, W, H, C.shadow, A.overlay)
            .setDepth(800).setInteractive()
        const panel = this.add.container(W / 2, H / 2).setDepth(801)

        const objective = this.add.text(0, 0, this.level.objective, {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: '23px',
            color: hex(C.ink),
            align: 'center',
            wordWrap: { width: 550 },
        }).setOrigin(0.5).setResolution(2)

        const PH = objective.height + 296
        const top = -PH / 2

        const bg = this.add.graphics()
        bg.fillStyle(C.shadow, 0.22)
        bg.fillRoundedRect(-320, top + 12, 640, PH, 28)
        bg.fillStyle(C.panel, 1)
        bg.fillRoundedRect(-320, top, 640, PH, 28)
        bg.lineStyle(5, C.violet, 1)
        bg.strokeRoundedRect(-320, top, 640, PH, 28)
        bg.fillStyle(C.violet, 1)
        bg.fillRoundedRect(-150, top - 15, 300, 28, 14)

        const badge = this.add.text(0, top + 54, `NÍVEL ${this.level.level}`, {
            fontFamily: 'Arial Black, Arial',
            fontSize: '20px',
            color: hex(C.violet),
        }).setOrigin(0.5).setResolution(2)

        const title = this.add.text(0, top + 102, this.level.title, {
            fontFamily: 'Arial Black, Arial',
            fontSize: '36px',
            color: hex(C.violetDark),
            align: 'center',
            wordWrap: { width: 550 },
        }).setOrigin(0.5).setResolution(2)

        objective.setY(top + 156 + objective.height / 2)

        const btn = this.button(0, PH / 2 - 56, 300, 68, 'Ação!', C.green, () => {
            overlay.destroy()
            panel.destroy()
            mascote.destroy()
            onStart()
        }, '22px', true)

        const mascote = this.add.image(W / 2 - 326, H / 2 + top + MASCOTE.h / 2 - 26, 'mascote-normal')
            .setDisplaySize(MASCOTE.w, MASCOTE.h).setDepth(802)

        panel.add([bg, badge, title, objective, btn])
        panel.setScale(0.92).setAlpha(0)
        mascote.setAlpha(0)
        this.tweens.add({ targets: panel, alpha: 1, scale: 1, duration: 260, ease: 'Back.easeOut' })
        this.tweens.add({ targets: mascote, alpha: 1, duration: 260 })
    }

    private startPhase() {
        this.locked = false
    }

    private runTutorial() {
        this.tutorialSteps = this.buildTutorialSteps()
        this.tutorialKey = `futuro-l${this.level.level}`
        EventBus.emit('tutorial-ready')

        if (this.phaseIdx !== 0 || !this.tutorialSteps.length) {
            this.startPhase()
            return
        }

        createTutorial(this, {
            key: this.tutorialKey,
            accent: C.violet,
            safeTop: 130,
            steps: this.tutorialSteps,
            onFinish: () => this.startPhase(),
        })
    }

    private replayTutorial = () => {
        if (this.ended || !this.tutorialSteps.length) return
        const wasLocked = this.locked
        this.locked = true
        createTutorial(this, {
            key: this.tutorialKey,
            once: false,
            accent: C.violet,
            safeTop: 130,
            steps: this.tutorialSteps,
            onFinish: () => { this.locked = wasLocked },
        })
    }

    private buildTutorialSteps(): TutorialStep[] {
        if (this.level.level === 1) {
            return [
                {
                    text: 'Este é o palco. A sua cena vai aparecendo aqui a cada escolha.',
                    shape: 'rect', x: STAGE.cx, y: STAGE.cy, w: STAGE.w + 30, h: STAGE.h + 30,
                },
                {
                    text: 'À direita você escolhe uma coisa por vez: quem aparece, onde acontece e o que a pessoa diz.',
                    shape: 'rect', x: CHOICE.cx, y: CHOICE.y + CHOICE.h / 2, w: CHOICE.w + 24, h: CHOICE.h + 24,
                },
                {
                    text: 'A fala é o mais importante: ela precisa mostrar o que a tecnologia mudou.',
                    shape: 'rect', x: CHOICE.cx, y: CHOICE.optionFirstY + CHOICE.optionGap, w: CHOICE.optionW + 40, h: 260,
                },
            ]
        }

        if (this.level.level === 2) {
            return [
                {
                    text: 'Agora a história tem três quadros: como era antes, como ficou depois e o que isso mudou.',
                    shape: 'rect', x: STAGE.cx, y: STRIP.cy, w: STAGE.w + 30, h: STRIP.h + 40,
                },
                {
                    text: 'Toque em um quadro para montá-lo. Dá para voltar e refazer qualquer um.',
                    shape: 'rect', x: this.slotX(0), y: STRIP.cy, w: STRIP.slotW + 24, h: STRIP.slotH + 24,
                },
                {
                    text: 'Se os quadros contarem a mesma coisa, o selo de mudança não acende.',
                    shape: 'none', balloonY: 400,
                },
            ]
        }

        return [
            {
                text: 'Nesta história duas pessoas pensam diferente sobre a mesma tecnologia.',
                shape: 'rect', x: STAGE.cx, y: STRIP.cy, w: STAGE.w + 30, h: STRIP.h + 40,
            },
            {
                text: 'Depois dos três quadros você escolhe a mensagem final: a sua opinião sobre a mudança.',
                shape: 'rect', x: CHOICE.cx, y: CHOICE.y + CHOICE.h / 2, w: CHOICE.w + 24, h: CHOICE.h + 24,
            },
            {
                text: 'Os três selos avaliam clareza, mudança e reflexão. Publique quando a história disser o que você pensa.',
                shape: 'none', balloonY: 400,
            },
        ]
    }

    private publishHud() {
        this.registry.remove('hud')
        this.registry.set('hud', {
            instruction: this.phase.instruction,
            sub: this.phase.sub,
            level: this.level.level,
            phase: this.phaseIdx + 1,
            totalPhases: this.level.phases.length,
        })
    }

    private drawTechIcon(g: Phaser.GameObjects.Graphics, id: TechId, cx: number, cy: number, s: number, color: number) {
        g.fillStyle(color, 1)
        g.lineStyle(3, color, 1)

        if (id === 'celular') {
            g.strokeRoundedRect(cx - s * 0.42, cy - s * 0.78, s * 0.84, s * 1.56, 5)
            g.fillRoundedRect(cx - s * 0.3, cy - s * 0.6, s * 0.6, s * 1.02, 3)
            g.fillCircle(cx, cy + s * 0.6, s * 0.1)
            return
        }

        if (id === 'computador') {
            g.strokeRoundedRect(cx - s * 0.82, cy - s * 0.72, s * 1.64, s * 1.1, 5)
            g.fillRoundedRect(cx - s * 0.66, cy - s * 0.56, s * 1.32, s * 0.78, 3)
            g.fillRoundedRect(cx - s * 0.9, cy + s * 0.5, s * 1.8, s * 0.2, 4)
            return
        }

        if (id === 'gps') {
            g.beginPath()
            g.arc(cx, cy - s * 0.24, s * 0.52, Math.PI, 0)
            g.strokePath()
            g.fillTriangle(cx - s * 0.52, cy - s * 0.24, cx + s * 0.52, cy - s * 0.24, cx, cy + s * 0.82)
            g.fillStyle(C.white, 1)
            g.fillCircle(cx, cy - s * 0.26, s * 0.2)
            return
        }

        if (id === 'videochamada') {
            g.fillRoundedRect(cx - s * 0.82, cy - s * 0.46, s * 1.2, s * 0.92, 5)
            g.fillTriangle(cx + s * 0.44, cy - s * 0.02, cx + s * 0.9, cy - s * 0.44, cx + s * 0.9, cy + s * 0.4)
            return
        }

        g.strokeRoundedRect(cx - s * 0.46, cy - s * 0.46, s * 0.92, s * 0.92, 5)
        g.fillRoundedRect(cx - s * 0.18, cy - s * 0.18, s * 0.36, s * 0.36, 3)
        for (let k = 0; k < 4; k++) {
            const o = -s * 0.24 + k * s * 0.16
            g.lineBetween(cx + o, cy - s * 0.76, cx + o, cy - s * 0.46)
            g.lineBetween(cx + o, cy + s * 0.46, cx + o, cy + s * 0.76)
            g.lineBetween(cx - s * 0.76, cy + o, cx - s * 0.46, cy + o)
            g.lineBetween(cx + s * 0.46, cy + o, cx + s * 0.76, cy + o)
        }
    }

    private drawSealIcon(g: Phaser.GameObjects.Graphics, id: CriterionId, cx: number, cy: number, s: number, color: number) {
        g.fillStyle(color, 1)
        g.lineStyle(3, color, 1)

        if (id === 'clareza') {
            g.strokeCircle(cx, cy, s * 0.42)
            for (let k = 0; k < 8; k++) {
                const a = (Math.PI * 2 * k) / 8
                g.lineBetween(cx + Math.cos(a) * s * 0.62, cy + Math.sin(a) * s * 0.62, cx + Math.cos(a) * s * 0.92, cy + Math.sin(a) * s * 0.92)
            }
            return
        }

        if (id === 'mudanca') {
            g.lineBetween(cx - s * 0.7, cy - s * 0.3, cx + s * 0.5, cy - s * 0.3)
            g.fillTriangle(cx + s * 0.4, cy - s * 0.66, cx + s * 0.4, cy + s * 0.06, cx + s * 0.9, cy - s * 0.3)
            g.lineBetween(cx + s * 0.7, cy + s * 0.42, cx - s * 0.5, cy + s * 0.42)
            g.fillTriangle(cx - s * 0.4, cy + s * 0.06, cx - s * 0.4, cy + s * 0.78, cx - s * 0.9, cy + s * 0.42)
            return
        }

        g.beginPath()
        g.arc(cx, cy - s * 0.18, s * 0.5, Math.PI * 0.9, Math.PI * 0.1)
        g.strokePath()
        g.fillCircle(cx, cy - s * 0.18, s * 0.34)
        g.fillRoundedRect(cx - s * 0.24, cy + s * 0.3, s * 0.48, s * 0.34, 3)
    }

    private button(
        x: number,
        y: number,
        w: number,
        h: number,
        label: string,
        color: number,
        onClick: () => void,
        fontSize = '20px',
        ignoreLock = false,
    ) {
        const btn = this.add.container(x, y)
        const g = this.add.graphics()

        const paint = (c: number) => {
            g.clear()
            g.fillStyle(C.shadow, 0.24)
            g.fillRoundedRect(-w / 2, -h / 2 + 7, w, h, h / 2)
            g.fillStyle(c, 1)
            g.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
            g.fillStyle(C.white, A.gloss)
            g.fillRoundedRect(-w / 2 + 9, -h / 2 + 8, w - 18, h * 0.32, h / 4)
        }

        paint(color)

        const t = this.add.text(0, 0, label, {
            fontFamily: 'Arial Black, Arial',
            fontSize,
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: w - 26 },
        }).setOrigin(0.5).setResolution(2)

        btn.add([g, t])
        btn.setData('paint', paint)
        btn.setSize(w, h)
        btn.setInteractive({ useHandCursor: true })
        btn.on('pointerdown', () => {
            if (!ignoreLock && this.locked) return
            this.tweens.add({ targets: btn, scale: 0.95, duration: 70, yoyo: true })
            onClick()
        })

        return btn
    }
}