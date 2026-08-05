import Phaser from 'phaser'
import { runtimeGameBridge } from '../../../shared/bridge/runtimeGameBridge'
import { EventBus } from '../../../shared/EventBus'
import { createTutorial, type TutorialStep } from '../../../shared/tutorial/createTutorial'
import { showLevelComplete } from '../../../shared/level/showLevelComplete'
import { LEVELS } from '../data/levels'
import { CRITERIA, TRUST_LABEL, TRUST_COLOR_KEY } from '../data/news'
import { C, A, hex } from '../data/theme'
import { W, H, PANEL, COMPARE, NEWSCARD, RADAR, CASEBOARD, MASCOTE } from '../data/layout'
import type {
    CasePhase,
    ComparePhase,
    CriterionId,
    InspectPhase,
    LevelConfig,
    NewsItem,
    PhaseConfig,
    TrustLevel,
} from '../types'

const GAME_ID = 'radar-de-confiabilidade'

const TRUST_FILL: Record<'green' | 'amber' | 'red', number> = {
    green: C.green,
    amber: C.amber,
    red: C.red,
}

export class GameScene extends Phaser.Scene {
    private levelIdx = 0
    private phaseIdx = 0
    private points = 0
    private locked = true
    private ended = false


    private marks: Partial<Record<CriterionId, boolean>> = {}
    private criterionScore = 0
    private counterText?: Phaser.GameObjects.Text
    private seloPaints: Array<() => void> = []
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
        this.marks = {}
        this.criterionScore = 0
        this.counterText = undefined
        this.seloPaints = []
        this.tutorialSteps = []
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
        this.publishHud()

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID, stage: this.level.level })

        EventBus.on('timer-end', this.onTimeUp, this)
        EventBus.on('show-tutorial', this.replayTutorial, this)
        this.events.once('shutdown', () => {
            EventBus.off('timer-end', this.onTimeUp, this)
            EventBus.off('show-tutorial', this.replayTutorial, this)
        })

        if (this.phaseIdx === 0) this.showLevelIntro(() => this.runTutorial())
        else this.runTutorial()
    }

    private drawBackground() {
        const bg = this.add.image(W / 2, H / 2, 'bg-feed').setDepth(-3)
        bg.setScale(Math.max(W / bg.width, H / bg.height))

        const veil = this.add.graphics().setDepth(-2)
        veil.fillStyle(C.sky, A.veil)
        veil.fillRect(0, 0, W, H)
    }

    private buildPhase() {
        this.card(PANEL.x, PANEL.y, PANEL.w, PANEL.h, 28, C.panelSoft)

        const p = this.phase
        if (p.kind === 'comparar') this.buildCompare(p)
        if (p.kind === 'inspecionar') this.buildInspect(p)
        if (p.kind === 'caso') this.buildCase(p)
    }

    private startPhase() {
        this.locked = false
        if (this.level.timeLimit) EventBus.emit('timer-start', this.level.timeLimit)
    }

    private buildCompare(p: ComparePhase) {
        const views = p.options.map(item => this.buildCompareView(item))
        const tabPaints: Array<(c: number) => void> = []
        let current = 0

        const show = (i: number) => {
            current = i
            views.forEach((v, j) => v.container.setVisible(j === i))
            tabPaints.forEach((paint, j) => paint(j === i ? C.blue : C.grey))
        }

        p.options.forEach((item, i) => {
            const x = i === 0 ? COMPARE.tabLeftX : COMPARE.tabRightX
            const btn = this.button(x, COMPARE.tabY, COMPARE.tabW, COMPARE.tabH, item.source, C.grey, () => show(i), '21px')
            tabPaints.push(btn.getData('paint') as (c: number) => void)
        })

        this.button(W / 2, COMPARE.confirmY + 5, 480, 55, 'Escolher esta notícia', C.green, () => {
            this.locked = true
            views[current].reveal()
            this.time.delayedCall(1100, () =>
                this.resolvePhase(p.options[current].id === p.correctId, p.explanation))
        }, '23px')

        show(0)
    }

    private buildCompareView(item: NewsItem) {
        const container = this.add.container(0, 0)
        const box = COMPARE.thumbBox

        const frame = this.add.graphics()
        frame.fillStyle(C.panel, 1)
        frame.fillRoundedRect(COMPARE.thumbX - box / 2, COMPARE.thumbY - box / 2, box, box, 18)
        frame.lineStyle(3, C.border, 1)
        frame.strokeRoundedRect(COMPARE.thumbX - box / 2, COMPARE.thumbY - box / 2, box, box, 18)

        const thumb = this.fitImage(item.thumb, COMPARE.thumbX, COMPARE.thumbY, box - 20, box - 20)

        const title = this.add.text(COMPARE.titleX, COMPARE.titleY, item.title, {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: '31px',
            color: hex(C.ink),
            align: 'center',
            wordWrap: { width: COMPARE.titleWrap },
        }).setOrigin(0.5).setResolution(2)

        const chips = CRITERIA.map((def, i) => {
            const x = i % 2 === 0 ? COMPARE.chipLeftX : COMPARE.chipRightX
            const y = i < 2 ? COMPARE.chipRow1 : COMPARE.chipRow2
            return this.signalChip(x, y, COMPARE.chipW, COMPARE.chipH, def.id, item.signals[def.id].chip)
        })

        container.add([frame, thumb, title, ...chips.map(c => c.container)])

        const reveal = () => {
            chips.forEach((chip, i) => chip.setState(item.signals[CRITERIA[i].id].good ? 'good' : 'bad'))
        }

        return { container, reveal }
    }

    private buildInspect(p: InspectPhase) {
        this.buildNewsCard(p.item)
        this.card(RADAR.x, RADAR.y, RADAR.w, RADAR.h, 24, C.panel)

        this.add.text(RADAR.cx, RADAR.headerY, 'RADAR DE CONFIANÇA', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '25px',
            color: hex(C.blueDark),
        }).setOrigin(0.5).setResolution(2)

        this.counterText = this.add.text(RADAR.cx, RADAR.counterY, '', {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: '19px',
            color: hex(C.inkSoft),
        }).setOrigin(0.5).setResolution(2)
        this.updateCounter()

        CRITERIA.forEach((def, i) => this.buildCriterionRow(p.item, def.id, i))

        this.add.text(RADAR.cx, RADAR.seloLabelY, 'Que selo você dá para esta notícia?', {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: '21px',
            color: hex(C.inkSoft),
        }).setOrigin(0.5).setResolution(2)

        const xs = [RADAR.cx - 132, RADAR.cx + 132]
        p.options.forEach((trust, i) => {
            const btn = this.button(xs[i], RADAR.seloY, 250, 58, TRUST_LABEL[trust], C.grey, () => {
                if (Object.keys(this.marks).length < CRITERIA.length) return
                this.locked = true
                this.resolvePhase(trust === p.answer, p.explanation)
            }, '22px')

            const paint = btn.getData('paint') as (c: number) => void
            this.seloPaints.push(() => {
                const ready = Object.keys(this.marks).length >= CRITERIA.length
                paint(ready ? TRUST_FILL[TRUST_COLOR_KEY[trust]] : C.grey)
            })
        })
    }

    private buildCriterionRow(item: NewsItem, id: CriterionId, index: number) {
        const def = CRITERIA[index]
        const y = RADAR.rowFirstY + index * RADAR.rowGap
        const w = RADAR.rowW
        const h = RADAR.rowH

        const row = this.add.container(RADAR.cx, y)
        const g = this.add.graphics()
        const icon = this.add.graphics()

        const name = this.add.text(-w / 2 + 86, -13, def.name, {
            fontFamily: 'Arial Black, Arial',
            fontSize: '22px',
            color: hex(C.ink),
        }).setOrigin(0, 0.5).setResolution(2)

        const hint = this.add.text(-w / 2 + 86, 14, 'Toque para investigar', {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: '18px',
            color: hex(C.inkSoft),
            wordWrap: { width: w - 210 },
        }).setOrigin(0, 0.5).setResolution(2)

        const badgeBg = this.add.graphics()
        const badge = this.add.text(w / 2 - 26, 0, '', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '17px',
            color: '#ffffff',
        }).setOrigin(1, 0.5).setResolution(2).setDepth(1)

        const paint = () => {
            const mark = this.marks[id]
            const done = mark !== undefined
            const tone = !done ? C.grey : mark ? C.green : C.red
            const fill = !done ? C.greySoft : mark ? C.greenSoft : C.redSoft

            g.clear()
            g.fillStyle(fill, 1)
            g.fillRoundedRect(-w / 2, -h / 2, w, h, 18)
            g.lineStyle(3, done ? tone : C.border, 1)
            g.strokeRoundedRect(-w / 2, -h / 2, w, h, 18)
            g.fillStyle(C.white, 1)
            g.fillCircle(-w / 2 + 48, 0, 25)
            g.lineStyle(3, tone, 1)
            g.strokeCircle(-w / 2 + 48, 0, 25)

            icon.clear()
            this.drawIcon(icon, id, -w / 2 + 48, 0, 21, tone)

            if (done) {
                badge.setText(mark ? 'BOM' : 'RUIM')
                hint.setText(item.signals[id].chip)
                hint.setColor(hex(tone))
            } else {
                badge.setText('VER')
            }

            badgeBg.clear()
            badgeBg.fillStyle(done ? tone : C.blue, 1)
            badgeBg.fillRoundedRect(w / 2 - 26 - badge.width - 24, -19, badge.width + 36, 38, 19)
        }

        row.add([g, icon, name, hint, badgeBg, badge])
        paint()
        row.setSize(w, h)
        row.setInteractive({ useHandCursor: true })
        row.on('pointerdown', () => {
            if (this.locked || this.marks[id] !== undefined) return
            this.tweens.add({ targets: row, scale: 0.98, duration: 70, yoyo: true })
            this.openCriterion(item, id, () => {
                paint()
                this.updateCounter()
                this.seloPaints.forEach(fn => fn())
            })
        })
    }

    private buildCase(p: CasePhase) {
        this.buildNewsCard(p.item)
        this.card(RADAR.x, RADAR.y, RADAR.w, RADAR.h, 24, C.panel)

        this.add.text(RADAR.cx, CASEBOARD.headerY, 'SINAIS DA PUBLICAÇÃO', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '25px',
            color: hex(C.blueDark),
        }).setOrigin(0.5).setResolution(2)

        CRITERIA.forEach((def, i) => {
            const y = CASEBOARD.rowFirstY + i * CASEBOARD.rowGap
            const w = CASEBOARD.rowW
            const h = CASEBOARD.rowH
            const row = this.add.container(RADAR.cx, y)

            const g = this.add.graphics()
            g.fillStyle(C.panelSoft, 1)
            g.fillRoundedRect(-w / 2, -h / 2, w, h, 18)
            g.lineStyle(2, C.border, 1)
            g.strokeRoundedRect(-w / 2, -h / 2, w, h, 18)
            g.fillStyle(C.white, 1)
            g.fillCircle(-w / 2 + 46, 0, 24)
            g.lineStyle(3, C.blue, 1)
            g.strokeCircle(-w / 2 + 46, 0, 24)

            const icon = this.add.graphics()
            this.drawIcon(icon, def.id, -w / 2 + 46, 0, 20, C.blue)

            const label = this.add.text(-w / 2 + 84, -15, def.name, {
                fontFamily: 'Arial Black, Arial',
                fontSize: '20px',
                color: hex(C.blueDark),
            }).setOrigin(0, 0.5).setResolution(2)

            const chip = this.add.text(-w / 2 + 84, 13, p.item.signals[def.id].chip, {
                fontFamily: 'Arial',
                fontStyle: 'bold',
                fontSize: '18px',
                color: hex(C.ink),
                wordWrap: { width: w - 120 },
            }).setOrigin(0, 0.5).setResolution(2)

            row.add([g, icon, label, chip])
        })

        this.add.text(RADAR.cx, CASEBOARD.seloLabelY, 'Escolha o selo desta publicação', {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: '21px',
            color: hex(C.inkSoft),
        }).setOrigin(0.5).setResolution(2)

        const xs = [RADAR.cx - 190, RADAR.cx, RADAR.cx + 190]
        p.options.forEach((trust, i) => {
            this.button(xs[i], CASEBOARD.seloY, 180, 58, TRUST_LABEL[trust], TRUST_FILL[TRUST_COLOR_KEY[trust]], () => {
                this.locked = true
                this.openJustify(p, trust)
            }, '19px')
        })
    }

    private openCriterion(item: NewsItem, id: CriterionId, onDone: () => void) {
        const def = CRITERIA.find(c => c.id === id)!
        const sig = item.signals[id]

        const overlay = this.add.rectangle(W / 2, H / 2, W, H, C.shadow, A.overlay)
            .setDepth(300).setInteractive()
        const modal = this.add.container(W / 2, H / 2).setDepth(301)

        const detail = this.add.text(0, 0, sig.detail, {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: '24px',
            color: hex(C.ink),
            align: 'center',
            wordWrap: { width: 560 },
        }).setOrigin(0.5).setResolution(2)

        const PH = detail.height + 386
        const top = -PH / 2

        const bg = this.add.graphics()
        bg.fillStyle(C.shadow, 0.22)
        bg.fillRoundedRect(-340, top + 12, 680, PH, 28)
        bg.fillStyle(C.panel, 1)
        bg.fillRoundedRect(-340, top, 680, PH, 28)
        bg.lineStyle(4, C.blue, 1)
        bg.strokeRoundedRect(-340, top, 680, PH, 28)

        const iconBg = this.add.graphics()
        iconBg.fillStyle(C.greySoft, 1)
        iconBg.fillCircle(0, top + 62, 38)
        iconBg.lineStyle(3, C.blue, 1)
        iconBg.strokeCircle(0, top + 62, 38)
        const icon = this.add.graphics()
        this.drawIcon(icon, id, 0, top + 62, 30, C.blue)

        const name = this.add.text(0, top + 134, def.name, {
            fontFamily: 'Arial Black, Arial',
            fontSize: '30px',
            color: hex(C.blueDark),
        }).setOrigin(0.5).setResolution(2)

        const question = this.add.text(0, top + 176, def.question, {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: '20px',
            color: hex(C.inkSoft),
            align: 'center',
            wordWrap: { width: 560 },
        }).setOrigin(0.5).setResolution(2)

        const box = this.add.graphics()
        box.fillStyle(C.panelSoft, 1)
        box.fillRoundedRect(-302, top + 208, 604, detail.height + 52, 20)
        box.lineStyle(2, C.border, 1)
        box.strokeRoundedRect(-302, top + 208, 604, detail.height + 52, 20)
        detail.setY(top + 208 + (detail.height + 52) / 2)

        const answer = (good: boolean) => {
            this.marks[id] = good
            if (good === sig.good) this.criterionScore += 5
            overlay.destroy()
            modal.destroy()
            onDone()
        }

        const btnY = PH / 2 - 58
        const okBtn = this.button(-152, btnY, 290, 70, 'Parece bom', C.green, () => answer(true), '23px', true)
        const noBtn = this.button(152, btnY, 290, 70, 'Não parece bom', C.red, () => answer(false), '23px', true)

        modal.add([bg, iconBg, icon, name, question, box, detail, okBtn, noBtn])
        modal.setScale(0.92).setAlpha(0)
        this.tweens.add({ targets: modal, alpha: 1, scale: 1, duration: 220, ease: 'Back.easeOut' })
    }

    private openJustify(p: CasePhase, trust: TrustLevel) {
        EventBus.emit('timer-stop')

        const overlay = this.add.rectangle(W / 2, H / 2, W, H, C.shadow, A.overlay)
            .setDepth(300).setInteractive()
        const modal = this.add.container(W / 2, H / 2).setDepth(301)

        const PH = 320
        const top = -PH / 2

        const bg = this.add.graphics()
        bg.fillStyle(C.shadow, 0.22)
        bg.fillRoundedRect(-320, top + 12, 640, PH, 28)
        bg.fillStyle(C.panel, 1)
        bg.fillRoundedRect(-320, top, 640, PH, 28)
        bg.lineStyle(4, C.blue, 1)
        bg.strokeRoundedRect(-320, top, 640, PH, 28)

        const title = this.add.text(0, top + 54, 'Qual sinal pesou mais na sua escolha?', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '23px',
            color: hex(C.blueDark),
            align: 'center',
            wordWrap: { width: 540 },
        }).setOrigin(0.5).setResolution(2)

        const buttons = CRITERIA.map((def, i) => {
            const x = i % 2 === 0 ? -146 : 146
            const y = top + (i < 2 ? 134 : 210)
            return this.button(x, y, 272, 66, def.name, C.blue, () => {
                const correct = trust === p.answer && def.id === p.justify
                if (trust === p.answer && def.id !== p.justify) this.criterionScore += 5
                overlay.destroy()
                modal.destroy()
                this.resolvePhase(trust === p.answer, correct
                    ? p.explanation
                    : `${p.explanation} O sinal que mais pesou aqui foi: ${CRITERIA.find(c => c.id === p.justify)!.name}.`)
            }, '18px', true)
        })

        modal.add([bg, title, ...buttons])
        modal.setScale(0.92).setAlpha(0)
        this.tweens.add({ targets: modal, alpha: 1, scale: 1, duration: 220, ease: 'Back.easeOut' })
    }

    private buildNewsCard(item: NewsItem) {
        this.card(NEWSCARD.x, NEWSCARD.y, NEWSCARD.w, NEWSCARD.h, 24, C.panel)

        const frame = this.add.graphics()
        frame.fillStyle(C.greySoft, 1)
        frame.fillRoundedRect(
            NEWSCARD.cx - NEWSCARD.thumbW / 2,
            NEWSCARD.thumbY - NEWSCARD.thumbH / 2,
            NEWSCARD.thumbW, NEWSCARD.thumbH, 18,
        )

        this.fitImage(item.thumb, NEWSCARD.cx, NEWSCARD.thumbY, NEWSCARD.thumbW - 18, NEWSCARD.thumbH - 18)

        this.add.text(NEWSCARD.cx, NEWSCARD.titleY, item.title, {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: '27px',
            color: hex(C.ink),
            align: 'center',
            wordWrap: { width: 396 },
        }).setOrigin(0.5).setResolution(2)

        const source = this.add.text(NEWSCARD.cx + 20, NEWSCARD.sourceY, item.source, {
            fontFamily: 'Arial Black, Arial',
            fontSize: '21px',
            color: hex(C.blue),
            align: 'center',
            wordWrap: { width: 320 },
        }).setOrigin(0.5).setResolution(2).setDepth(1)

        const pill = this.add.graphics()
        const pw = source.width + 96
        pill.fillStyle(C.panelSoft, 1)
        pill.fillRoundedRect(NEWSCARD.cx - pw / 2, NEWSCARD.sourceY - source.height / 2 - 16, pw, source.height + 32, 22)
        pill.lineStyle(2, C.border, 1)
        pill.strokeRoundedRect(NEWSCARD.cx - pw / 2, NEWSCARD.sourceY - source.height / 2 - 16, pw, source.height + 32, 22)

        const icon = this.add.graphics().setDepth(1)
        this.drawIcon(icon, 'fonte', NEWSCARD.cx - pw / 2 + 36, NEWSCARD.sourceY, 20, C.blue)
    }

    private updateCounter() {
        if (!this.counterText) return
        const done = Object.keys(this.marks).length
        this.counterText.setColor(hex(done >= CRITERIA.length ? C.green : C.inkSoft))
    }

    private resolvePhase(correct: boolean, message: string) {
        this.locked = true
        EventBus.emit('timer-stop')

        const earned = (correct ? 10 : 0) + this.criterionScore
        this.points += earned

        runtimeGameBridge.emit({
            type: correct ? 'CORRECT_ANSWER' : 'WRONG_ANSWER',
            gameId: GAME_ID,
            pointsEarned: earned,
            stage: this.level.level,
        })

        this.showFeedback(correct, message, () => this.completePhase())
    }

    private onTimeUp = () => {
        if (this.ended || this.locked) return
        this.locked = true
        this.resolvePhase(false, `O tempo acabou. ${this.phase.explanation}`)
    }

    private showFeedback(correct: boolean, message: string, onDone: () => void) {
        const overlay = this.add.rectangle(W / 2, H / 2, W, H, C.shadow, A.overlay)
            .setDepth(400).setInteractive()
        const modal = this.add.container(W / 2, H / 2 + 26).setDepth(401)

        const body = this.add.text(0, 0, message, {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: '24px',
            color: hex(C.ink),
            align: 'center',
            wordWrap: { width: 600 },
        }).setOrigin(0.5).setResolution(2)

        const PH = body.height + 254
        const top = -PH / 2
        const tone = correct ? C.green : C.amber

        const bg = this.add.graphics()
        bg.fillStyle(C.shadow, 0.22)
        bg.fillRoundedRect(-350, top + 12, 700, PH, 28)
        bg.fillStyle(C.panel, 1)
        bg.fillRoundedRect(-350, top, 700, PH, 28)
        bg.lineStyle(4, tone, 1)
        bg.strokeRoundedRect(-350, top, 700, PH, 28)
        bg.fillStyle(tone, 1)
        bg.fillRoundedRect(-160, top - 14, 320, 26, 13)

        const title = this.add.text(0, top + 54, correct ? 'Radar certeiro!' : 'Vamos olhar de novo', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '34px',
            color: hex(correct ? C.green : C.blueDark),
        }).setOrigin(0.5).setResolution(2)

        body.setY(top + 106 + body.height / 2)

        const btn = this.button(0, PH / 2 - 58, 300, 70, 'Continuar', C.blue, () => {
            overlay.destroy()
            modal.destroy()
            mascote.destroy()
            onDone()
        }, '20px', true)

        const mascote = this.add.image(W / 2 - 312, H / 2 + 26 + top - 20, correct ? 'mascote-reacao' : 'mascote-normal')
            .setDisplaySize(MASCOTE, MASCOTE).setDepth(402)

        modal.add([bg, title, body, btn])
        modal.setScale(0.92).setAlpha(0)
        mascote.setAlpha(0)
        this.tweens.add({ targets: modal, alpha: 1, scale: 1, duration: 240, ease: 'Back.easeOut' })
        this.tweens.add({ targets: mascote, alpha: 1, duration: 240 })
    }

    private showLevelIntro(onStart: () => void) {
        this.locked = true

        const overlay = this.add.rectangle(W / 2, H / 2, W, H, C.shadow, A.overlay)
            .setDepth(500).setInteractive()
        const panel = this.add.container(W / 2, H / 2).setDepth(501)

        const objective = this.add.text(0, 0, this.level.objective, {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: '24px',
            color: hex(C.ink),
            align: 'center',
            wordWrap: { width: 560 },
        }).setOrigin(0.5).setResolution(2)

        const PH = objective.height + 296
        const top = -PH / 2

        const bg = this.add.graphics()
        bg.fillStyle(C.shadow, 0.22)
        bg.fillRoundedRect(-320, top + 12, 640, PH, 28)
        bg.fillStyle(C.panel, 1)
        bg.fillRoundedRect(-320, top, 640, PH, 28)
        bg.lineStyle(4, C.blue, 1)
        bg.strokeRoundedRect(-320, top, 640, PH, 28)
        bg.fillStyle(C.blue, 1)
        bg.fillRoundedRect(-150, top - 14, 300, 26, 13)

        const badge = this.add.text(0, top + 52, `NÍVEL ${this.level.level}`, {
            fontFamily: 'Arial Black, Arial',
            fontSize: '21px',
            color: hex(C.blue),
        }).setOrigin(0.5).setResolution(2)

        const title = this.add.text(0, top + 100, this.level.title, {
            fontFamily: 'Arial Black, Arial',
            fontSize: '36px',
            color: hex(C.blueDark),
            align: 'center',
            wordWrap: { width: 560 },
        }).setOrigin(0.5).setResolution(2)

        objective.setY(top + 154 + objective.height / 2)

        const btn = this.button(0, PH / 2 - 58, 300, 70, 'Começar', C.blue, () => {
            overlay.destroy()
            panel.destroy()
            mascote.destroy()
            onStart()
        }, '20px', true)

        const mascote = this.add.image(W / 2 - 302, H / 2 + top - 20, 'mascote-normal')
            .setDisplaySize(MASCOTE, MASCOTE).setDepth(502)

        panel.add([bg, badge, title, objective, btn])
        panel.setScale(0.92).setAlpha(0)
        mascote.setAlpha(0)
        this.tweens.add({ targets: panel, alpha: 1, scale: 1, duration: 260, ease: 'Back.easeOut' })
        this.tweens.add({ targets: mascote, alpha: 1, duration: 260 })
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
                overlayColor: C.shadow,
                titleColor: hex(C.blueDark),
                subtitleColor: hex(C.blue),
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
            title: 'Radar completo!',
            subtitle: `${this.points} pontos`,
            message: 'Agora você sabe olhar a fonte, a autoria, a data e as provas antes de acreditar.',
            accent: C.green,
            overlayColor: C.shadow,
            titleColor: hex(C.blueDark),
            subtitleColor: hex(C.green),
            progress: { total: LEVELS.length, current: LEVELS.length },
        })
    }

    private runTutorial() {
        this.tutorialSteps = this.buildTutorialSteps()
        this.tutorialKey = `radar-l${this.level.level}`
        EventBus.emit('tutorial-ready')

        if (this.phaseIdx !== 0 || !this.tutorialSteps.length) {
            this.startPhase()
            return
        }

        createTutorial(this, {
            key: this.tutorialKey,
            accent: C.blue,
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
            accent: C.blue,
            safeTop: 130,
            steps: this.tutorialSteps,
            onFinish: () => { this.locked = wasLocked },
        })
    }

    private buildTutorialSteps(): TutorialStep[] {
        if (this.level.level === 1) {
            return [
                {
                    text: 'As duas notícias falam do mesmo assunto. Toque nas abas para ver uma de cada vez.',
                    shape: 'rect', x: W / 2, y: COMPARE.tabY, w: 1060, h: 100, balloonY: 420,
                },
                {
                    text: 'Nas etiquetas você vê quem publicou, quem assinou, a data e se a notícia mostra provas.',
                    shape: 'rect', x: W / 2, y: (COMPARE.chipRow1 + COMPARE.chipRow2) / 2, w: 1100, h: 190,
                },
                {
                    text: 'Quando estiver vendo a notícia que você acha confiável, toque em Escolher esta notícia.',
                    shape: 'rect', x: W / 2, y: COMPARE.confirmY, w: 520, h: 110,
                },
            ]
        }

        if (this.level.level === 2) {
            return [
                {
                    text: 'Aqui está a publicação para você investigar.',
                    shape: 'rect', x: NEWSCARD.cx, y: NEWSCARD.y + NEWSCARD.h / 2, w: NEWSCARD.w + 24, h: NEWSCARD.h + 24,
                },
                {
                    text: 'Toque em cada sinal do radar para descobrir o que ele revela e marque se parece bom ou ruim.',
                    shape: 'rect', x: RADAR.cx, y: 384, w: RADAR.rowW + 40, h: 300,
                },
                {
                    text: 'Depois de checar os quatro sinais, os selos ficam coloridos e você escolhe um.',
                    shape: 'rect', x: RADAR.cx, y: RADAR.seloY, w: RADAR.rowW + 40, h: 90,
                },
            ]
        }

        return [
            {
                text: 'Agora os quatro sinais já vêm abertos, mas eles estão misturados: alguns bons, outros ruins.',
                shape: 'rect', x: RADAR.cx, y: 330, w: RADAR.rowW + 40, h: 250,
            },
            {
                text: 'Existe um selo do meio: Cuidado. Use quando a publicação não é mentira, mas também não é notícia.',
                shape: 'rect', x: RADAR.cx, y: CASEBOARD.seloY, w: RADAR.rowW + 40, h: 90,
            },
            {
                text: 'Você tem tempo contado. Escolha o selo e depois diga qual sinal pesou mais.',
                shape: 'none', balloonY: 400,
            },
        ]
    }

    private publishHud() {
        this.registry.set('hud', {
            instruction: this.phase.instruction,
            sub: this.phase.sub,
            level: this.level.level,
            phase: this.phaseIdx + 1,
            totalPhases: this.level.phases.length,
        })
    }

    private card(x: number, y: number, w: number, h: number, r = 24, fill = C.panel) {
        const g = this.add.graphics()
        g.fillStyle(C.shadow, A.shadow)
        g.fillRoundedRect(x + 4, y + 10, w, h, r)
        g.fillStyle(fill, 1)
        g.fillRoundedRect(x, y, w, h, r)
        g.lineStyle(3, C.border, 1)
        g.strokeRoundedRect(x, y, w, h, r)
        return g
    }

    private fitImage(key: string, x: number, y: number, boxW: number, boxH: number) {
        const img = this.add.image(x, y, key)
        img.setScale(Math.min(boxW / img.width, boxH / img.height))
        return img
    }

    private signalChip(x: number, y: number, w: number, h: number, id: CriterionId, text: string) {
        const container = this.add.container(x, y)
        const g = this.add.graphics()
        const icon = this.add.graphics()
        const t = this.add.text(-w / 2 + 68, 0, text, {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: '20px',
            color: hex(C.ink),
            wordWrap: { width: w - 90 },
        }).setOrigin(0, 0.5).setResolution(2)

        const setState = (state: 'neutral' | 'good' | 'bad') => {
            const tone = state === 'good' ? C.green : state === 'bad' ? C.red : C.inkSoft
            const fill = state === 'good' ? C.greenSoft : state === 'bad' ? C.redSoft : C.greySoft
            const line = state === 'neutral' ? C.border : tone

            g.clear()
            g.fillStyle(fill, 1)
            g.fillRoundedRect(-w / 2, -h / 2, w, h, 16)
            g.lineStyle(2, line, 1)
            g.strokeRoundedRect(-w / 2, -h / 2, w, h, 16)

            icon.clear()
            this.drawIcon(icon, id, -w / 2 + 36, 0, 20, tone)
            t.setColor(hex(state === 'neutral' ? C.ink : tone))
        }

        setState('neutral')
        container.add([g, icon, t])
        return { container, setState }
    }

    private drawIcon(g: Phaser.GameObjects.Graphics, id: CriterionId, cx: number, cy: number, s: number, color: number) {
        g.fillStyle(color, 1)
        g.lineStyle(3, color, 1)

        if (id === 'fonte') {
            g.fillRoundedRect(cx - s * 0.6, cy - s * 0.25, s * 1.2, s * 0.95, 3)
            g.fillTriangle(cx - s * 0.78, cy - s * 0.25, cx + s * 0.78, cy - s * 0.25, cx, cy - s * 0.95)
            return
        }

        if (id === 'autoria') {
            g.fillCircle(cx, cy - s * 0.38, s * 0.34)
            g.fillRoundedRect(cx - s * 0.55, cy + s * 0.08, s * 1.1, s * 0.62, s * 0.31)
            return
        }

        if (id === 'data') {
            g.fillRoundedRect(cx - s * 0.62, cy - s * 0.5, s * 1.24, s * 1.12, 4)
            g.fillRect(cx - s * 0.36, cy - s * 0.86, s * 0.16, s * 0.4)
            g.fillRect(cx + s * 0.2, cy - s * 0.86, s * 0.16, s * 0.4)
            return
        }

        g.strokeCircle(cx - s * 0.14, cy - s * 0.16, s * 0.46)
        g.lineBetween(cx + s * 0.18, cy + s * 0.18, cx + s * 0.62, cy + s * 0.62)
    }

    private button(
        x: number,
        y: number,
        w: number,
        h: number,
        label: string,
        color: number,
        onClick: () => void,
        fontSize = '18px',
        ignoreLock = false,
    ) {
        const btn = this.add.container(x, y)
        const g = this.add.graphics()

        const paint = (c: number) => {
            g.clear()
            g.fillStyle(C.shadow, 0.2)
            g.fillRoundedRect(-w / 2, -h / 2 + 6, w, h, h / 2)
            g.fillStyle(c, 1)
            g.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
            g.fillStyle(C.white, A.gloss)
            g.fillRoundedRect(-w / 2 + 8, -h / 2 + 7, w - 16, h * 0.32, h / 4)
        }

        paint(color)

        const t = this.add.text(0, 0, label, {
            fontFamily: 'Arial Black, Arial',
            fontSize,
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: w - 24 },
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