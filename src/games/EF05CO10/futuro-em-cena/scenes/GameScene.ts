import Phaser from 'phaser'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { LEVELS, SCORE_LABEL } from '../data/levels'
import { CHARACTERS, CRITERIA, SCENERIES, THEMES } from '../data/story'
import { C, A, CRITERION_COLOR, hex } from '../data/theme'
import { W, H, HEADER, STRIP, PANEL, MESSAGE_LIST, BALLOON, CHAR, MASCOTE, stageBox } from '../data/layout'
import type {
    CharId,
    CriterionId,
    Frame,
    LevelConfig,
    LineOption,
    MessageOption,
    PhaseConfig,
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

type SceneryId = keyof typeof SCENERIES

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

    private headerLayer!: Phaser.GameObjects.Container
    private stageLayer!: Phaser.GameObjects.Container
    private stripLayer!: Phaser.GameObjects.Container
    private panelLayer!: Phaser.GameObjects.Container
    private stageMask!: Phaser.Display.Masks.GeometryMask

    private helpBtn!: Phaser.GameObjects.Container

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

    private get hasStrip() {
        return this.slots.length > 1
    }

    private get stage() {
        return stageBox(this.hasStrip)
    }

    private get themeId(): ThemeId {
        const p = this.phase
        if (p.kind !== 'cena') return p.theme
        return this.draft.themeId ?? this.frames[this.slotIdx]?.themeId ?? p.themeOptions[0]
    }

    create() {
        this.drawBackground()
        this.buildStageFrame()

        this.headerLayer = this.add.container(0, 0).setDepth(60)
        this.stageLayer = this.add.container(0, 0).setDepth(10)
        this.stripLayer = this.add.container(0, 0).setDepth(20)
        this.panelLayer = this.add.container(0, 0).setDepth(30)

        this.frames = this.slots.map(() => undefined)
        this.resetDraft()

        this.renderHeader()
        this.renderStage()
        this.renderStrip()
        this.renderPanel()
        this.buildHelpButton()

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })

        if (this.phaseIdx === 0) this.showLevelIntro(() => this.runTutorial())
        else this.runTutorial()
    }

    /*
     * O REVER TUTORIAL MORAVA NUMA UISCENE.
     *
     * Cena por cima de cena nao conhece depth: o botao ficava aceso acima do
     * veu do proprio tutorial, do relatorio e da intro de nivel — e dava para
     * abrir um tutorial por cima do outro. Aqui ele e um objeto da GameScene,
     * num depth que passa por baixo de qualquer painel, e quem o desliga
     * enquanto o tutorial roda e a propria cena.
     */
    private buildHelpButton() {
        const btn = this.add.container(1218, 50).setDepth(70)
        const g = this.add.graphics()
        g.fillStyle(C.shadow, 0.22)
        g.fillCircle(0, 6, 27)
        g.fillStyle(C.violet, 1)
        g.fillCircle(0, 0, 27)
        g.fillStyle(C.white, A.gloss)
        g.fillEllipse(0, -11, 36, 16)
        const t = this.add.text(0, 0, '?', {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
            fontSize: '29px',
            color: '#ffffff',
        }).setOrigin(0.5).setResolution(2)
        btn.add([g, t])
        btn.setSize(62, 62)
        btn.setVisible(false)
        btn.on('pointerdown', () => {
            this.tweens.add({ targets: btn, scale: 0.9, duration: 80, yoyo: true })
            this.replayTutorial()
        })
        this.helpBtn = btn
    }

    private setHelpEnabled(on: boolean) {
        this.helpBtn.setAlpha(on ? 1 : 0.45)
        if (on) this.helpBtn.setInteractive({ useHandCursor: true })
        else this.helpBtn.disableInteractive()
    }

    private drawBackground() {
        const bg = this.add.image(W / 2, H / 2, 'bg-studio').setDepth(-3)
        bg.setScale(Math.max(W / bg.width, H / bg.height))
        this.tweens.add({
            targets: bg,
            x: W / 2 + 14,
            y: H / 2 + 8,
            duration: 5200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        })

        const veil = this.add.graphics().setDepth(-2)
        veil.fillStyle(C.sky, A.veil)
        veil.fillRect(0, 0, W, H)
    }

    private buildStageFrame() {
        const box = this.stage
        const g = this.add.graphics().setDepth(-1)
        g.fillStyle(C.shadow, A.shadow)
        g.fillRoundedRect(box.x + 5, box.y + 12, box.w, box.h, 0)
        g.fillStyle(C.stage, 1)
        g.fillRoundedRect(box.x - 12, box.y - 12, box.w + 24, box.h + 24, 0)
        g.fillStyle(C.stageEdge, 1)
        g.fillRoundedRect(box.x - 5, box.y - 5, box.w + 10, box.h + 10, 0)
        g.fillStyle(C.greySoft, 1)
        g.fillRoundedRect(box.x, box.y, box.w, box.h, 0)

        const shape = this.make.graphics({}, false)
        shape.fillStyle(0xffffff)
        shape.fillRoundedRect(box.x, box.y, box.w, box.h, 0)
        this.stageMask = shape.createGeometryMask()

        if (!this.hasStrip) return

        const film = this.add.graphics().setDepth(-1)
        film.fillStyle(C.film, 1)
        film.fillRoundedRect(box.x - 12, STRIP.cy - STRIP.h / 2 - 18, box.w + 24, STRIP.h + 36, 0)
        film.fillStyle(C.filmHole, 0.45)
        for (let x = box.x + 6; x < box.x + box.w - 10; x += 36) {
            film.fillRoundedRect(x, STRIP.cy - STRIP.h / 2 - 12, 20, 10, 0)
            film.fillRoundedRect(x, STRIP.cy + STRIP.h / 2 + 2, 20, 10, 0)
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
        const box = this.stage
        const n = this.slots.length
        return box.x + box.w / 2 + (i - (n - 1) / 2) * STRIP.gapX
    }

    private renderHeader() {
        this.headerLayer.removeAll(true)

        const g = this.add.graphics()
        g.fillStyle(C.shadow, 0.2)
        g.fillRoundedRect(HEADER.chipX + 3, 26, HEADER.chipW, HEADER.chipH, 0)
        g.fillStyle(C.stage, 1)
        g.fillRoundedRect(HEADER.chipX, 20, HEADER.chipW, HEADER.chipH, 0)
        g.fillStyle(C.white, 0.12)
        g.fillRoundedRect(HEADER.chipX + 10, 28, HEADER.chipW - 20, 16, 0)
        g.fillStyle(C.amber, 1)
        g.fillCircle(HEADER.chipX + 30, 51, 8)

        const level = this.add.text(HEADER.chipX + 50, 40, `NÍVEL ${this.level.level}`, {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
            fontSize: '19px',
            color: hex(C.white),
        }).setOrigin(0, 0.5).setResolution(2)

        const phase = this.add.text(HEADER.chipX + 50, 64, `Cena ${this.phaseIdx + 1} de ${this.level.phases.length}`, {
            fontFamily: 'DynaPuff, Arial, sans-serif',
            fontStyle: 'bold',
            fontSize: '15px',
            color: hex(C.grey),
        }).setOrigin(0, 0.5).setResolution(2)

        /*
         * O cabeçalho tinha título E subtítulo, e o subtítulo repetia a dica
         * que o painel da direita já dá no passo atual. Duas frases longas no
         * alto, mais a dica, mais o rodapé: a mesma coisa lida quatro vezes.
         * Ficou uma linha só — o que fazer nesta cena.
         */
        const title = this.add.text(HEADER.textX, HEADER.titleY + 16, this.phase.instruction, {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
            fontSize: '28px',
            color: hex(C.violetDark),
            stroke: '#ffffff',
            strokeThickness: 7,
            wordWrap: { width: 860 },
        }).setOrigin(0, 0.5).setResolution(2)

        this.headerLayer.add([g, level, phase, title])
    }

    private renderStage() {
        this.stageLayer.removeAll(true)

        const box = this.stage
        const frame = this.frames[this.slotIdx]
        const sceneryId = this.draft.sceneryId ?? frame?.sceneryId
        const charId = this.draft.charId ?? frame?.charId
        const line = this.draft.line ?? frame?.line
        const themeChosen = this.phase.kind !== 'cena' || this.draft.themeId !== undefined || frame !== undefined

        if (sceneryId) {
            const img = this.add.image(box.x + box.w / 2, box.y + box.h / 2, SCENERIES[sceneryId].texture)
            img.setScale(Math.max(box.w / img.width, box.h / img.height) * 1.02)
            img.setMask(this.stageMask)
            this.tweens.add({ targets: img, x: img.x + 10, duration: 2600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
            const veil = this.add.graphics()
            veil.fillStyle(C.stage, A.stageVeil * 0.35)
            veil.fillRoundedRect(box.x, box.y, box.w, box.h, 0)
            this.stageLayer.add([img, veil])
        } else {
            const empty = this.add.graphics()
            empty.lineStyle(5, C.border, 1)
            empty.strokeRoundedRect(box.x + 28, box.y + 28, box.w - 56, box.h - 56, 0)
            const hint = this.add.text(box.x + box.w / 2, box.y + box.h / 2, 'A sua cena aparece aqui', {
                fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
                fontSize: '24px',
                color: hex(C.grey),
                align: 'center',
                lineSpacing: 8,
            }).setOrigin(0.5).setResolution(2)
            this.stageLayer.add([empty, hint])
        }


        const beam = this.add.graphics()
        beam.fillStyle(C.spotlight, 0.13)
        beam.fillTriangle(box.x + box.w * 0.2, box.y, box.x + box.w * 0.56, box.y, box.x + box.w * 0.38, box.y + box.h)
        beam.fillTriangle(box.x + box.w * 0.72, box.y, box.x + box.w * 0.96, box.y, box.x + box.w * 0.84, box.y + box.h)
        beam.setMask(this.stageMask)
        this.tweens.add({ targets: beam, alpha: 0.35, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
        this.stageLayer.add(beam)

        const headX = box.x + box.w / 2 + CHAR.dx
        let headY = box.y + box.h * 0.4

        if (charId) {
            const baseY = box.y + box.h - CHAR.footPad
            const char = this.add.image(headX, baseY, CHARACTERS[charId].texture)
            const maxH = box.h * (this.hasStrip ? CHAR.ratioWithStrip : CHAR.ratioFull)
            const s = Math.min(maxH / char.height, CHAR.maxW / char.width)
            const shadow = this.add.graphics()
            shadow.fillStyle(C.shadow, 0.2)
            shadow.fillEllipse(headX, baseY - 4, Math.min(132, char.width * s * 0.62), 24)
            shadow.setMask(this.stageMask)
            char.setOrigin(0.5, 1).setScale(s)
            char.setMask(this.stageMask)
            char.setAlpha(0)
            char.x = headX - 46
            headY = box.y + box.h - CHAR.footPad - char.height * s + 22
            this.stageLayer.add([shadow, char])
            this.tweens.add({ targets: char, x: headX, alpha: 1, duration: 360, ease: 'Back.easeOut' })
            this.tweens.add({ targets: char, y: baseY - 7, duration: 760, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
        }

        if (themeChosen) {
            const th = THEMES[this.themeId]
            const label = this.add.text(0, 0, th.techLabel, {
                fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
                fontSize: '17px',
                color: hex(C.violetDark),
            }).setOrigin(0, 0.5).setResolution(2)

            const pw = label.width + 84
            const px = box.x + 18
            const py = box.y + box.h - 40
            const pill = this.add.graphics()
            pill.fillStyle(C.white, 0.94)
            pill.fillRoundedRect(px, py - 24, pw, 48, 0)
            pill.lineStyle(3, C.violet, 1)
            pill.strokeRoundedRect(px, py - 24, pw, 48, 0)

            const icon = this.add.graphics()
            this.drawTechIcon(icon, th.tech, px + 32, py, 17, C.violet)
            label.setPosition(px + 58, py)

            this.stageLayer.add([pill, icon, label])
        }

        if (line) this.stageLayer.add(this.buildBalloon(line.text, headX, headY, box))
    }

    private buildBalloon(text: string, headX: number, headY: number, box: { x: number; y: number; w: number; h: number }) {
        const layer = this.add.container(0, 0)
        const bw = BALLOON.w
        const cx = box.x + box.w - bw / 2 - BALLOON.pad

        const t = this.add.text(cx, 0, text, {
            fontFamily: 'DynaPuff, Arial, sans-serif',
            fontStyle: 'bold',
            fontSize: '20px',
            color: hex(C.ink),
            align: 'center',
            lineSpacing: 4,
            wordWrap: { width: bw - 58 },
        }).setOrigin(0.5).setResolution(2)

        const fullText = text
        t.setText('')
        const bh = Math.max(102, t.height + 92)
        t.setText(fullText)
        const measuredH = t.height + 54
        const finalH = Math.max(bh, measuredH)
        const cy = Phaser.Math.Clamp(headY - 10, box.y + BALLOON.minTop + finalH / 2, box.y + box.h - finalH / 2 - 58)
        t.setY(cy)
        t.setText('')

        const left = cx - bw / 2
        const top = cy - finalH / 2
        const anchorY = Phaser.Math.Clamp(headY, top + 28, top + finalH - 28)

        const g = this.add.graphics()
        g.fillStyle(C.shadow, 0.24)
        g.fillRoundedRect(left + 5, top + 10, bw, finalH, 0)
        g.fillStyle(C.balloon, 1)
        g.fillTriangle(left + 10, anchorY - 20, left + 10, anchorY + 20, headX + 34, headY)
        g.fillRoundedRect(left, top, bw, finalH, 0)
        g.fillStyle(C.violetSoft, 1)
        g.fillRoundedRect(left + 14, top + 12, bw - 28, 18, 0)
        g.fillStyle(C.white, A.gloss)
        g.fillRoundedRect(left + 24, top + 15, bw - 48, 7, 0)
        g.lineStyle(4, C.balloonEdge, 1)
        g.strokeRoundedRect(left, top, bw, finalH, 0)
        g.lineBetween(left + 8, anchorY - 19, headX + 34, headY)
        g.lineBetween(left + 8, anchorY + 19, headX + 34, headY)
        g.fillStyle(C.balloon, 1)
        g.fillRect(left + 1, anchorY - 18, 12, 36)
        g.fillStyle(C.violet, 1)
        for (let i = 0; i < 3; i++) g.fillCircle(left + 28 + i * 18, top + finalH - 20, 4)

        layer.add([g, t])
        layer.setScale(0.86).setAlpha(0)
        this.tweens.add({ targets: layer, alpha: 1, scale: 1, duration: 240, ease: 'Back.easeOut' })

        let n = 0
        this.time.addEvent({
            delay: 16,
            repeat: fullText.length - 1,
            callback: () => {
                if (!t.active) return
                n++
                t.setText(fullText.slice(0, n))
            },
        })

        return layer
    }

    private renderStrip() {
        this.stripLayer.removeAll(true)
        if (!this.hasStrip) return

        this.slots.forEach((slot, i) => {
            const x = this.slotX(i)
            const filled = this.frames[i]
            const active = i === this.slotIdx
            const w = STRIP.slotW
            const h = STRIP.slotH

            const g = this.add.graphics()
            g.fillStyle(filled ? C.white : C.stageEdge, 1)
            g.fillRoundedRect(x - w / 2, STRIP.cy - h / 2, w, h, 0)
            g.lineStyle(active ? 6 : 3, active ? C.amber : filled ? C.violet : C.grey, 1)
            g.strokeRoundedRect(x - w / 2, STRIP.cy - h / 2, w, h, 0)

            const num = this.add.graphics()
            num.fillStyle(filled ? C.violet : C.grey, 1)
            num.fillCircle(x - w / 2 + 24, STRIP.cy - h / 2 + 24, 15)
            const numText = this.add.text(x - w / 2 + 24, STRIP.cy - h / 2 + 24, String(i + 1), {
                fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
                fontSize: '16px',
                color: '#ffffff',
            }).setOrigin(0.5).setResolution(2)

            const label = this.add.text(x + 12, STRIP.cy - h / 2 + 24, slot.label, {
                fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
                fontSize: '16px',
                color: hex(filled ? C.violetDark : C.grey),
                align: 'center',
                wordWrap: { width: w - 62 },
            }).setOrigin(0.5).setResolution(2)

            this.stripLayer.add([g, num, numText, label])

            if (filled) {
                const chip = this.add.text(x, STRIP.cy + 26, filled.line.chip, {
                    fontFamily: 'DynaPuff, Arial, sans-serif',
                    fontStyle: 'bold',
                    fontSize: '16px',
                    color: hex(C.ink),
                    align: 'center',
                    wordWrap: { width: w - 26 },
                }).setOrigin(0.5).setResolution(2)
                this.stripLayer.add(chip)
            } else {
                const plus = this.add.graphics()
                plus.lineStyle(6, C.grey, 1)
                plus.lineBetween(x - 16, STRIP.cy + 24, x + 16, STRIP.cy + 24)
                plus.lineBetween(x, STRIP.cy + 8, x, STRIP.cy + 40)
                const tap = this.add.text(x, STRIP.cy + 54, 'toque', {
                    fontFamily: 'DynaPuff, Arial, sans-serif',
                    fontStyle: 'bold',
                    fontSize: '13px',
                    color: hex(C.grey),
                }).setOrigin(0.5).setResolution(2)
                this.stripLayer.add([plus, tap])
            }

            const zone = this.add.zone(x, STRIP.cy, w, h).setInteractive({ useHandCursor: true })
            zone.on('pointerdown', () => {
                if (this.locked || i === this.slotIdx) return
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
        this.panelLayer.removeAll(true)

        const g = this.add.graphics()
        g.fillStyle(C.shadow, A.shadow)
        g.fillRoundedRect(PANEL.x + 5, PANEL.y + 12, PANEL.w, PANEL.h, 0)
        g.fillStyle(C.panel, 1)
        g.fillRoundedRect(PANEL.x, PANEL.y, PANEL.w, PANEL.h, 0)
        g.lineStyle(4, C.border, 1)
        g.strokeRoundedRect(PANEL.x, PANEL.y, PANEL.w, PANEL.h, 0)
        this.panelLayer.add(g)

        if (this.mode === 'ready') return this.renderReadyPanel()
        if (this.mode === 'message') return this.renderMessagePanel()
        this.renderStepPanel()
    }

    private stepPill(text: string, tone = C.violet) {
        const t = this.add.text(PANEL.cx, PANEL.stepPillY, text, {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
            fontSize: '16px',
            color: hex(C.white),
        }).setOrigin(0.5).setResolution(2)

        const pw = t.width + 52
        const g = this.add.graphics()
        g.fillStyle(tone, 1)
        g.fillRoundedRect(PANEL.cx - pw / 2, PANEL.stepPillY - 19, pw, 38, 0)
        g.fillStyle(C.white, A.gloss)
        g.fillRoundedRect(PANEL.cx - pw / 2 + 8, PANEL.stepPillY - 14, pw - 16, 12, 0)

        this.panelLayer.add([g, t])
    }

    private panelHeader(title: string, hint: string) {
        const t = this.add.text(PANEL.cx, PANEL.titleY, title, {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
            fontSize: '27px',
            color: hex(C.violetDark),
            align: 'center',
            wordWrap: { width: PANEL.w - 70 },
        }).setOrigin(0.5).setResolution(2)

        const hintW = PANEL.w - 72
        const hintH = 58
        const hb = this.add.graphics()
        hb.fillStyle(C.amberSoft, 1)
        hb.fillRoundedRect(PANEL.cx - hintW / 2, PANEL.hintY - hintH / 2, hintW, hintH, 0)
        hb.lineStyle(3, C.amber, 0.85)
        hb.strokeRoundedRect(PANEL.cx - hintW / 2, PANEL.hintY - hintH / 2, hintW, hintH, 0)
        hb.fillStyle(C.amber, 1)
        hb.fillCircle(PANEL.cx - hintW / 2 + 31, PANEL.hintY, 15)
        hb.fillStyle(C.white, A.gloss)
        hb.fillCircle(PANEL.cx - hintW / 2 + 26, PANEL.hintY - 5, 5)

        const mark = this.add.text(PANEL.cx - hintW / 2 + 31, PANEL.hintY - 1, '!', {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
            fontSize: '21px',
            color: '#ffffff',
        }).setOrigin(0.5).setResolution(2)

        const h = this.add.text(PANEL.cx - hintW / 2 + 58, PANEL.hintY, hint, {
            fontFamily: 'DynaPuff, Arial, sans-serif',
            fontStyle: 'bold',
            fontSize: '17px',
            color: hex(C.ink),
            wordWrap: { width: hintW - 82 },
        }).setOrigin(0, 0.5).setResolution(2)

        this.panelLayer.add([t, hb, mark, h])
    }

    private backButton() {
        const canGoBack = this.stepIdx > 0
        const btn = this.button(PANEL.backX, PANEL.backY, 218, 54, 'Voltar', canGoBack ? C.violet : C.grey, () => {
            if (!canGoBack) return
            this.stepIdx--
            const step = this.steps[this.stepIdx]
            if (step === 'tema') this.draft.themeId = undefined
            if (step === 'personagem') this.draft.charId = undefined
            if (step === 'cenario') this.draft.sceneryId = undefined
            this.draft.line = undefined
            this.renderStage()
            this.renderPanel()
        }, '18px')
        btn.setAlpha(canGoBack ? 1 : 0.55)
        this.panelLayer.add(btn)
    }

    private renderStepPanel() {
        const step = this.steps[this.stepIdx]
        const p = this.phase
        this.stepPill(`PASSO ${this.stepIdx + 1} DE ${this.steps.length}`)

        if (step === 'tema' && p.kind === 'cena') {
            this.panelHeader('Qual é o tema?', 'Escolha a mudança que você quer mostrar.')
            p.themeOptions.slice(0, 3).forEach((id, i) => {
                const th = THEMES[id]
                this.addOption(i, th.label, th.headline, () => {
                    this.draft.themeId = id
                    this.renderStage()
                    this.advanceStep()
                }, icon => this.drawTechIcon(icon, th.tech, 0, 0, 20, C.violet))
            })
            this.backButton()
            return
        }

        if (step === 'personagem') {
            this.panelHeader('Quem aparece na cena?', 'Quem vive essa mudança?')
            this.availableCharacters().forEach((id, i) => {
                const ch = CHARACTERS[id]
                this.addOption(i, ch.voice, ch.label, () => {
                    this.draft.charId = id
                    this.renderStage()
                    this.advanceStep()
                })
            })
            this.backButton()
            return
        }

        if (step === 'cenario') {
            this.panelHeader('Onde a cena acontece?', 'O lugar também conta a história.')
            this.phase.sceneryOptions.slice(0, 3).forEach((id, i) => {
                this.addOption(i, SCENERIES[id].label, '', () => {
                    this.draft.sceneryId = id
                    this.renderStage()
                    this.advanceStep()
                })
            })
            this.backButton()
            return
        }

        this.panelHeader('O que essa pessoa diz?', 'A fala precisa dizer o que mudou.')
        this.availableLines().forEach((line, i) => {
            this.addOption(i, line.chip, line.text, () => {
                this.draft.line = line
                this.renderStage()
                this.saveFrame()
            })
        })
        this.backButton()
    }

    private renderMessagePanel() {
        this.stepPill('ÚLTIMO PASSO', C.amber)
        this.panelHeader('Qual é a sua mensagem?', 'Diga o que você acha dessa mudança.')

        const options = THEMES[this.themeId].messages ?? []
        options.forEach((option, i) => {
            this.addOption(i, option.chip, option.text, () => {
                this.message = option
                this.mode = 'ready'
                this.renderPanel()
            }, undefined, MESSAGE_LIST)
        })
        const back = this.button(PANEL.backX, PANEL.backY, 218, 54, 'Voltar', C.violet, () => {
            this.backFromReady()
        }, '18px')
        this.panelLayer.add(back)
    }

    private renderReadyPanel() {

        this.stepPill('TUDO PRONTO', C.green)
        this.panelHeader('Confira a sua história', this.hasStrip
            ? 'Toque num quadro para refazer.'
            : 'Gostou? Então publique.')

        const y = PANEL.optionFirstY - 16

        if (this.message) {
            const msg = this.add.text(PANEL.cx, y + 40, this.message.text, {
                fontFamily: 'DynaPuff, Arial, sans-serif',
                fontStyle: 'bold',
                fontSize: '21px',
                color: hex(C.ink),
                align: 'center',
                wordWrap: { width: PANEL.optionW - 64 },
            }).setOrigin(0.5).setResolution(2)

            const bh = msg.height + 60
            msg.setY(y + bh / 2)
            const box = this.add.graphics()
            box.fillStyle(C.amberSoft, 1)
            box.fillRoundedRect(PANEL.cx - PANEL.optionW / 2, y, PANEL.optionW, bh, 0)
            box.lineStyle(4, C.amber, 1)
            box.strokeRoundedRect(PANEL.cx - PANEL.optionW / 2, y, PANEL.optionW, bh, 0)
            this.panelLayer.add([box, msg])

            const redo = this.button(PANEL.cx, y + bh + 52, 280, 58, 'Trocar mensagem', C.grey, () => {
                this.message = undefined
                this.mode = 'message'
                this.renderPanel()
            }, '18px')
            this.panelLayer.add(redo)
        } else {
            this.frames.forEach((f, i) => {
                const rowY = y + 24 + i * 62
                const dot = this.add.graphics()
                dot.fillStyle(C.violet, 1)
                dot.fillCircle(PANEL.cx - PANEL.optionW / 2 + 26, rowY, 14)
                const num = this.add.text(PANEL.cx - PANEL.optionW / 2 + 26, rowY, String(i + 1), {
                    fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
                    fontSize: '15px',
                    color: '#ffffff',
                }).setOrigin(0.5).setResolution(2)
                const label = this.add.text(PANEL.cx - PANEL.optionW / 2 + 54, rowY - 11, this.slots[i].label, {
                    fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
                    fontSize: '16px',
                    color: hex(C.violetDark),
                }).setOrigin(0, 0.5).setResolution(2)
                const chip = this.add.text(PANEL.cx - PANEL.optionW / 2 + 54, rowY + 12, f ? f.line.chip : '-', {
                    fontFamily: 'DynaPuff, Arial, sans-serif',
                    fontStyle: 'bold',
                    fontSize: '17px',
                    color: hex(C.inkSoft),
                    wordWrap: { width: PANEL.optionW - 90 },
                }).setOrigin(0, 0.5).setResolution(2)
                this.panelLayer.add([dot, num, label, chip])
            })
        }

        const back = this.button(820, PANEL.actionY, 218, 58, 'Voltar', C.violet, () => {
            this.backFromReady()
        }, '18px')
        const publish = this.button(1086, PANEL.actionY, 306, 58, 'PUBLICAR', C.green, () => {
            this.locked = true
            this.playStory(() => this.showReport())
        }, '21px')
        this.panelLayer.add([back, publish])
    }

    private backFromReady() {
        if (this.locked) return

        if (this.message) {
            this.message = undefined
            this.mode = 'message'
            this.renderPanel()
            return
        }

        const last = Math.max(0, this.frames.map(f => f !== undefined).lastIndexOf(true))
        this.slotIdx = last
        this.frames[this.slotIdx] = undefined
        this.resetDraft()
        this.renderStage()
        this.renderStrip()
        this.renderPanel()
    }
    private addOption(
        index: number,
        title: string,
        subtitle: string,
        onClick: () => void,
        drawIcon?: (g: Phaser.GameObjects.Graphics) => void,
        geo: { optionH: number; optionGap: number; optionFirstY: number } = PANEL,
    ) {
        const y = geo.optionFirstY + index * geo.optionGap
        const w = PANEL.optionW
        const h = geo.optionH
        const row = this.add.container(PANEL.cx, y)

        const g = this.add.graphics()
        g.fillStyle(C.panelSoft, 1)
        g.fillRoundedRect(-w / 2, -h / 2, w, h, 14)
        g.lineStyle(3, C.border, 1)
        g.strokeRoundedRect(-w / 2, -h / 2, w, h, 0)
        g.fillStyle(C.violet, 1)
        g.fillRoundedRect(-w / 2 + 16, -h / 2 + 16, 10, h - 32, 0)

        const objects: Phaser.GameObjects.GameObject[] = [g]
        const textX = drawIcon ? -w / 2 + 92 : -w / 2 + 48

        if (drawIcon) {
            const badge = this.add.graphics()
            badge.fillStyle(C.violetSoft, 1)
            badge.fillCircle(-w / 2 + 60, 0, 25)
            const icon = this.add.graphics()
            icon.setPosition(-w / 2 + 60, 0)
            drawIcon(icon)
            objects.push(badge, icon)
        }

        const wrap = w / 2 - textX - 28
        const t = this.add.text(textX, subtitle ? -h / 2 + 26 : 0, title, {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
            fontSize: '21px',
            color: hex(C.ink),
            wordWrap: { width: wrap },
        }).setOrigin(0, subtitle ? 0.5 : 0.5).setResolution(2)
        objects.push(t)

        if (subtitle) {
            const compactSubtitle = subtitle.length > 76 ? `${subtitle.slice(0, 73)}...` : subtitle
            const s = this.add.text(textX, -h / 2 + 26 + t.height / 2 + 12, compactSubtitle, {
                fontFamily: 'DynaPuff, Arial, sans-serif',
                fontStyle: 'bold',
                fontSize: '16px',
                color: hex(C.inkSoft),
                lineSpacing: 0,
                wordWrap: { width: wrap },
            }).setOrigin(0, 0).setResolution(2)
            objects.push(s)
        }

        row.add(objects)
        row.setSize(w, h)
        row.setAlpha(0)
        row.x = PANEL.cx + 22
        row.setInteractive({ useHandCursor: true })
        row.on('pointerover', () => {
            if (this.locked) return
            this.tweens.add({ targets: row, scale: 1.025, duration: 120, ease: 'Sine.easeOut' })
        })
        row.on('pointerout', () => {
            this.tweens.add({ targets: row, scale: 1, duration: 120, ease: 'Sine.easeOut' })
        })
        row.on('pointerdown', () => {
            if (this.locked) return
            this.tweens.add({ targets: row, scale: 0.97, duration: 70, yoyo: true })
            onClick()
        })

        this.panelLayer.add(row)
        this.tweens.add({ targets: row, x: PANEL.cx, alpha: 1, duration: 220, delay: index * 45, ease: 'Back.easeOut' })
    }

    private availableCharacters(): CharId[] {
        const slot = this.slots[this.slotIdx]
        const used = this.frames
            .filter((f, i) => f && this.slots[i].speaker && this.slots[i].speaker !== slot.speaker)
            .map(f => f!.charId)
        const list = this.phase.characterOptions.filter(id => !used.includes(id))
        return (list.length >= 2 ? list : this.phase.characterOptions).slice(0, 3)
    }

    private availableLines(): LineOption[] {
        const slot = this.slots[this.slotIdx]
        const pool = THEMES[this.themeId].lines[slot.moment] ?? []
        const used = this.frames.filter((f, i) => f && i !== this.slotIdx).map(f => f!.line.id)
        const list = pool.filter(l => !used.includes(l.id))
        return (list.length >= 3 ? list : pool).slice(0, 3)
    }

    private advanceStep() {
        this.stepIdx++
        this.renderPanel()
    }

    private saveFrame() {
        const slot = this.slots[this.slotIdx]
        this.frames[this.slotIdx] = {
            moment: slot.moment,
            themeId: this.themeId,
            charId: this.draft.charId!,
            sceneryId: this.draft.sceneryId!,
            line: this.draft.line!,
            speaker: slot.speaker,
        }

        this.renderStrip()
        this.flashSlot(this.slotIdx)

        const next = this.frames.findIndex(f => f === undefined)
        this.time.delayedCall(420, () => {
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
        if (!this.hasStrip) return
        const flash = this.add.graphics().setDepth(120)
        const x = this.slotX(i)
        flash.fillStyle(C.spotlight, 0.75)
        flash.fillRoundedRect(x - STRIP.slotW / 2, STRIP.cy - STRIP.slotH / 2, STRIP.slotW, STRIP.slotH, 0)
        this.tweens.add({ targets: flash, alpha: 0, duration: 460, onComplete: () => flash.destroy() })
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

        if (this.hasStrip) {
            const moments = new Set(this.frames.filter(Boolean).map(f => f!.moment))
            const weak = this.frames.some(f => f && f.line.score.mudanca === 0)
            if (moments.size < 2 || weak) score.mudanca = Math.min(score.mudanca, 1)
        }

        return score
    }

    private playStory(onDone: () => void) {
        const original = this.slotIdx
        const box = this.stage
        const cam = this.cameras.main
        const hiddenLayers = [this.headerLayer, this.panelLayer, this.stripLayer]
        const wide = W * 4
        const tall = H * 4

        const veil = this.add.rectangle(W / 2, H / 2, wide, tall, C.night, 0.84).setDepth(200).setInteractive()
        const bars = this.add.graphics().setDepth(201)
        bars.fillStyle(0x000000, 0.82)
        bars.fillRect(-W * 2, -H * 2, W * 5, H * 2 + 92)
        bars.fillRect(-W * 2, H - 92, W * 5, H * 3)
        bars.fillRect(-W * 2, -H * 2, W * 2 + box.x - 16, H * 5)
        bars.fillRect(box.x + box.w + 16, -H * 2, W * 3, H * 5)
        bars.lineStyle(4, C.green, 0.9)
        bars.strokeRect(box.x - 14, box.y - 14, box.w + 28, box.h + 28)
        bars.lineStyle(5, C.spotlight, 0.92)
        const corner = 58
        bars.lineBetween(box.x + 10, box.y + 10, box.x + 10 + corner, box.y + 10)
        bars.lineBetween(box.x + 10, box.y + 10, box.x + 10, box.y + 10 + corner)
        bars.lineBetween(box.x + box.w - 10, box.y + 10, box.x + box.w - 10 - corner, box.y + 10)
        bars.lineBetween(box.x + box.w - 10, box.y + 10, box.x + box.w - 10, box.y + 10 + corner)
        bars.lineBetween(box.x + 10, box.y + box.h - 10, box.x + 10 + corner, box.y + box.h - 10)
        bars.lineBetween(box.x + 10, box.y + box.h - 10, box.x + 10, box.y + box.h - 10 - corner)
        bars.lineBetween(box.x + box.w - 10, box.y + box.h - 10, box.x + box.w - 10 - corner, box.y + box.h - 10)
        bars.lineBetween(box.x + box.w - 10, box.y + box.h - 10, box.x + box.w - 10, box.y + box.h - 10 - corner)

        const rec = this.add.container(box.x + box.w - 142, box.y + 30).setDepth(240)
        const recG = this.add.graphics()
        recG.fillStyle(C.red, 1)
        recG.fillCircle(-34, 0, 11)
        const recText = this.add.text(-14, 0, 'REC  HISTÓRIA', {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
            fontSize: '17px',
            color: hex(C.spotlight),
        }).setOrigin(0, 0.5).setResolution(2)
        rec.add([recG, recText])
        this.tweens.add({ targets: recG, alpha: 0.18, duration: 420, yoyo: true, repeat: -1 })

        const mascot = this.add.image(box.x + box.w + 74, box.y + box.h - 8, 'mascote-reacao')
            .setDisplaySize(118, 166)
            .setOrigin(0.5, 1)
            .setDepth(238)
            .setAlpha(0)
        const mascotShadow = this.add.graphics().setDepth(237)
        mascotShadow.fillStyle(C.shadow, 0.22)
        mascotShadow.fillEllipse(box.x + box.w + 74, box.y + box.h - 4, 92, 20)
        mascotShadow.setAlpha(0)
        this.tweens.add({ targets: [mascot, mascotShadow], alpha: 1, duration: 420, ease: 'Sine.easeOut' })
        this.tweens.add({ targets: mascot, y: mascot.y - 10, angle: 3, duration: 820, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })

        this.stageLayer.setDepth(230)
        this.tweens.add({ targets: hiddenLayers, alpha: 0, duration: 320, ease: 'Sine.easeOut' })
        cam.pan(box.x + box.w / 2 + 34, box.y + box.h / 2, 700, 'Sine.easeInOut')
        cam.zoomTo(1.26, 700, 'Sine.easeInOut')

        let i = 0
        const step = () => {
            if (i >= this.frames.length) {
                this.slotIdx = original
                this.time.delayedCall(820, () => {
                    cam.pan(W / 2, H / 2, 560, 'Sine.easeInOut')
                    cam.zoomTo(1, 560, 'Sine.easeInOut')
                    this.tweens.add({ targets: [veil, bars, rec, mascot, mascotShadow], alpha: 0, duration: 460 })
                    this.tweens.add({ targets: hiddenLayers, alpha: 1, duration: 460, ease: 'Sine.easeOut' })
                    this.time.delayedCall(520, () => {
                        veil.destroy()
                        bars.destroy()
                        rec.destroy()
                        mascot.destroy()
                        mascotShadow.destroy()
                        this.stageLayer.setDepth(10)
                        this.stripLayer.setDepth(20)
                        this.renderStage()
                        this.renderStrip()
                        onDone()
                    })
                })
                return
            }

            this.slotIdx = i
            this.renderStage()
            this.stageLayer.setDepth(230)
            this.stageLayer.setAlpha(0)
            this.tweens.add({ targets: this.stageLayer, alpha: 1, duration: 520, ease: 'Sine.easeOut' })
            this.tweens.add({ targets: cam, scrollX: cam.scrollX + 10, duration: 800, yoyo: true, ease: 'Sine.easeInOut' })
            i++
            this.time.delayedCall(2900, step)
        }

        this.time.delayedCall(780, step)
    }

    private showReport() {
        const score = this.computeScore()
        const total = score.clareza + score.mudanca + score.reflexao
        const earned = total * 5
        this.points += earned
        const strong = total >= 5

        runtimeGameBridge.emit({
            type: strong ? 'CORRECT_ANSWER' : 'WRONG_ANSWER',
            gameId: GAME_ID,
            pointsEarned: earned,
            stage: this.level.level,
        })

        const overlay = this.add.rectangle(W / 2, H / 2, W, H, C.shadow, 0.58)
            .setDepth(700).setInteractive()
        const modal = this.add.container(W / 2, H / 2).setDepth(701)

        const tone = strong ? C.green : C.amber
        const titleText = strong ? 'História publicada' : 'História registrada'
        const subText = strong ? `${earned} pontos nesta cena` : `${earned} pontos - dá para melhorar`
        const PH = 438
        const top = -PH / 2

        const bg = this.add.graphics()
        bg.fillStyle(C.panel, 1)
        bg.fillRoundedRect(-320, top, 640, PH, 0)
        bg.lineStyle(5, tone, 1)
        bg.strokeRoundedRect(-320, top, 640, PH, 0)
        bg.fillStyle(tone, 1)
        bg.fillRect(-320, top, 640, 14)

        const title = this.add.text(0, top + 58, titleText, {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
            fontSize: '31px',
            color: hex(C.violetDark),
            align: 'center',
        }).setOrigin(0.5).setResolution(2)

        const sub = this.add.text(0, top + 94, subText, {
            fontFamily: 'DynaPuff, Arial, sans-serif',
            fontStyle: 'bold',
            fontSize: '18px',
            color: hex(C.inkSoft),
            align: 'center',
        }).setOrigin(0.5).setResolution(2)

        const rows: Phaser.GameObjects.GameObject[] = []
        CRITERIA.forEach((def, i) => {
            const y = top + 148 + i * 54
            const value = score[def.id]
            const rowTone = value >= 2 ? CRITERION_COLOR[def.id] : value === 1 ? C.amber : C.grey
            const g = this.add.graphics()
            g.fillStyle(C.panelSoft, 1)
            g.fillRoundedRect(-268, y - 22, 536, 44, 0)
            g.fillStyle(rowTone, 1)
            g.fillRect(-268, y - 22, 8, 44)
            g.fillCircle(-234, y, 14)

            const icon = this.add.graphics()
            this.drawSealIcon(icon, def.id, -234, y, 12, C.white)

            const name = this.add.text(-206, y, def.name, {
                fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
                fontSize: '18px',
                color: hex(C.ink),
            }).setOrigin(0, 0.5).setResolution(2)

            const tag = this.add.text(242, y, SCORE_LABEL(value), {
                fontFamily: 'DynaPuff, Arial, sans-serif',
                fontStyle: 'bold',
                fontSize: '14px',
                color: hex(rowTone),
            }).setOrigin(1, 0.5).setResolution(2)

            rows.push(g, icon, name, tag)
        })

        const note = this.add.text(0, top + 328, this.pickFeedback(score), {
            fontFamily: 'DynaPuff, Arial, sans-serif',
            fontStyle: 'bold',
            fontSize: '18px',
            color: hex(C.ink),
            align: 'center',
            wordWrap: { width: 540 },
        }).setOrigin(0.5).setResolution(2)

        const finish = (redo: boolean) => {
            overlay.destroy()
            modal.destroy()
            if (redo) {
                this.points -= earned
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

        const buttons = strong
            ? [this.button(0, PH / 2 - 46, 320, 62, 'Continuar', C.green, () => finish(false), '21px', true)]
            : [
                this.button(-152, PH / 2 - 46, 288, 62, 'Refazer', C.violet, () => finish(true), '20px', true),
                this.button(152, PH / 2 - 46, 288, 62, 'Continuar', C.grey, () => finish(false), '20px', true),
            ]

        modal.add([bg, title, sub, ...rows, note, ...buttons])
        modal.setScale(0.96).setAlpha(0)
        this.tweens.add({ targets: modal, alpha: 1, scale: 1, duration: 220, ease: 'Sine.easeOut' })
    }

    private pickFeedback(score: Score) {
        const weakest = CRITERIA.reduce((a, b) => (score[a.id] <= score[b.id] ? a : b))
        if (score.clareza + score.mudanca + score.reflexao >= 5) {
            return this.message?.why ?? this.frames.filter(Boolean).map(f => f!.line.why)[0] ?? ''
        }
        if (weakest.id === 'clareza') return 'Falta dizer qual tecnologia aparece na cena.'
        if (weakest.id === 'mudanca') return 'Falta mostrar o que ficou diferente.'
        return 'Toda mudança tem um lado bom e um cuidado. Mostre os dois.'
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

        showLevelComplete(this, {
            title: 'Estreia no estúdio!',
            subtitle: `${this.points} pontos`,
            message: 'Toda tecnologia muda o jeito de viver. Agora você sabe contar isso do seu jeito.',
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
            fontFamily: 'DynaPuff, Arial, sans-serif',
            fontStyle: 'bold',
            fontSize: '23px',
            color: hex(C.ink),
            align: 'center',
            wordWrap: { width: 550 },
        }).setOrigin(0.5).setResolution(2)

        const PH = objective.height + 300
        const top = -PH / 2

        const bg = this.add.graphics()
        bg.fillStyle(C.shadow, 0.22)
        bg.fillRoundedRect(-320, top + 12, 640, PH, 0)
        bg.fillStyle(C.panel, 1)
        bg.fillRoundedRect(-320, top, 640, PH, 0)
        bg.lineStyle(5, C.violet, 1)
        bg.strokeRoundedRect(-320, top, 640, PH, 0)
        bg.fillStyle(C.violet, 1)
        bg.fillRoundedRect(-150, top - 15, 300, 28, 0)

        const badge = this.add.text(0, top + 56, `NÍVEL ${this.level.level}`, {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
            fontSize: '20px',
            color: hex(C.violet),
        }).setOrigin(0.5).setResolution(2)

        const title = this.add.text(0, top + 106, this.level.title, {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
            fontSize: '36px',
            color: hex(C.violetDark),
            align: 'center',
            wordWrap: { width: 550 },
        }).setOrigin(0.5).setResolution(2)

        objective.setY(top + 160 + objective.height / 2)

        const btn = this.button(0, PH / 2 - 58, 300, 70, 'Ação!', C.green, () => {
            overlay.destroy()
            panel.destroy()
            mascote.destroy()
            onStart()
        }, '23px', true)

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
        this.helpBtn.setVisible(true)
        this.setHelpEnabled(true)

        if (this.phaseIdx !== 0 || !this.tutorialSteps.length) {
            this.startPhase()
            return
        }

        this.setHelpEnabled(false)
        createTutorial(this, {
            key: this.tutorialKey,
            accent: C.violet,
            safeTop: 118,
            steps: this.tutorialSteps,
            onFinish: () => {
                this.setHelpEnabled(true)
                this.startPhase()
            },
        })
    }

    private replayTutorial = () => {
        if (this.ended || !this.tutorialSteps.length) return
        const wasLocked = this.locked
        this.locked = true
        this.setHelpEnabled(false)
        createTutorial(this, {
            key: this.tutorialKey,
            once: false,
            accent: C.violet,
            safeTop: 118,
            steps: this.tutorialSteps,
            onFinish: () => {
                this.locked = wasLocked
                this.setHelpEnabled(true)
            },
        })
    }

    private buildTutorialSteps(): TutorialStep[] {
        const box = this.stage

        /*
         * TRES PASSOS, NUNCA MAIS.
         *
         * Eram seis no nivel 1, e os tres ultimos explicavam coisas que a
         * propria tela ja diz (o botao Voltar, o cabecalho, o que e uma boa
         * fala). Tutorial que descreve a interface inteira antes de deixar
         * tocar vira texto que a crianca pula. Ficou o que ela nao descobre
         * sozinha: o que ela e, onde a cena aparece e onde se escolhe.
         */
        if (this.level.level === 1) {
            return [
                {
                    text: 'Você é o diretor! Monte uma cena que mostre o que a tecnologia mudou.',
                    shape: 'none', balloonY: 380,
                },
                {
                    text: 'A sua cena aparece aqui no palco.',
                    shape: 'rect', x: box.x + box.w / 2, y: box.y + box.h / 2, w: box.w + 34, h: box.h + 34,
                },
                {
                    text: 'Aqui vem um passo por vez. Toque na opção que você quiser.',
                    shape: 'rect', x: PANEL.cx, y: PANEL.y + PANEL.h / 2, w: PANEL.w + 26, h: PANEL.h + 26,
                },
            ]
        }

        if (this.level.level === 2) {
            return [
                {
                    text: 'Agora a história tem 3 quadros: antes, depois e o que mudou.',
                    shape: 'rect', x: box.x + box.w / 2, y: STRIP.cy, w: box.w + 34, h: STRIP.h + 44,
                },
                {
                    text: 'O quadro de borda amarela é o que você monta agora. Toque em outro para trocar.',
                    shape: 'rect', x: this.slotX(0), y: STRIP.cy, w: STRIP.slotW + 26, h: STRIP.slotH + 26,
                },
            ]
        }

        return [
            {
                text: 'Aqui duas pessoas pensam diferente sobre a mesma tecnologia.',
                shape: 'rect', x: box.x + box.w / 2, y: STRIP.cy, w: box.w + 34, h: STRIP.h + 44,
            },
            {
                text: 'No fim você escolhe a mensagem: o que VOCÊ acha dessa mudança.',
                shape: 'rect', x: PANEL.cx, y: PANEL.y + PANEL.h / 2, w: PANEL.w + 26, h: PANEL.h + 26,
            },
        ]
    }

    private drawTechIcon(g: Phaser.GameObjects.Graphics, id: TechId, cx: number, cy: number, s: number, color: number) {
        g.fillStyle(color, 1)
        g.lineStyle(3, color, 1)

        if (id === 'celular') {
            g.strokeRoundedRect(cx - s * 0.42, cy - s * 0.78, s * 0.84, s * 1.56, 0)
            g.fillRoundedRect(cx - s * 0.3, cy - s * 0.6, s * 0.6, s * 1.02, 0)
            g.fillCircle(cx, cy + s * 0.6, s * 0.1)
            return
        }

        if (id === 'computador') {
            g.strokeRoundedRect(cx - s * 0.82, cy - s * 0.72, s * 1.64, s * 1.1, 0)
            g.fillRoundedRect(cx - s * 0.66, cy - s * 0.56, s * 1.32, s * 0.78, 0)
            g.fillRoundedRect(cx - s * 0.9, cy + s * 0.5, s * 1.8, s * 0.2, 0)
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
            g.fillRoundedRect(cx - s * 0.82, cy - s * 0.46, s * 1.2, s * 0.92, 0)
            g.fillTriangle(cx + s * 0.44, cy - s * 0.02, cx + s * 0.9, cy - s * 0.44, cx + s * 0.9, cy + s * 0.4)
            return
        }

        g.strokeRoundedRect(cx - s * 0.46, cy - s * 0.46, s * 0.92, s * 0.92, 0)
        g.fillRoundedRect(cx - s * 0.18, cy - s * 0.18, s * 0.36, s * 0.36, 0)
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
        g.fillRoundedRect(cx - s * 0.24, cy + s * 0.3, s * 0.48, s * 0.34, 0)
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
            g.fillRoundedRect(-w / 2, -h / 2 + 7, w, h, 14)
            g.fillStyle(c, 1)
            g.fillRoundedRect(-w / 2, -h / 2, w, h, 14)
            g.fillStyle(C.white, A.gloss)
            g.fillRoundedRect(-w / 2 + 9, -h / 2 + 8, w - 18, h * 0.32, 8)
        }

        paint(color)

        const t = this.add.text(0, 0, label, {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
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
