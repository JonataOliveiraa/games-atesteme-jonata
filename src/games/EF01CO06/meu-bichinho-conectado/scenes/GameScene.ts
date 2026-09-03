import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { FX, Ease } from '../../../../shared/effects/FX'
import { createTutorial } from '../../../../shared/tutorial/createTutorial'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { LEVELS, solves } from '../data/levels'
import { ARTIFACTS, NEEDS } from '../data/items'
import { C, FONT, SIZE, hex } from '../data/theme'
import {
    W, H, HUD, ASK, PET, FRIENDS, STAGE, SHELF, ALBUM,
    shelfArrangement, type ShelfArrangement,
} from '../data/layout'
import {
    paintPanel, paintAsk, paintShelf, paintNiche, paintStamp,
    screenGlow, showToast, heartBurst, deviceWaves,
} from './effects'
import type { Artifact, LevelConfig, NicheView, RequestDef } from '../types'

const GAME_ID = 'meu-bichinho-conectado'

const PET_FRAME = { idle: 0, asking: 1, happy: 2, confused: 3, cheering: 4 }

interface FriendView {
    sprite: Phaser.GameObjects.Sprite
    /** O y de repouso. Cada amiguinho tem o seu, porque o grupo tem profundidade. */
    baseY: number
    float?: Phaser.Tweens.Tween
}

export class GameScene extends Phaser.Scene {
    private lives!: Lives
    private livesTotal = 3
    private livesLeft = 3

    private levelIdx = 0
    private requestIdx = 0
    private points = 0
    private hits = 0
    private errors = 0
    private missesOnRequest = 0
    private locked = true
    private ended = false
    private isMuted = false

    private pet!: Phaser.GameObjects.Sprite
    private askBox!: Phaser.GameObjects.Container
    private askIcon!: Phaser.GameObjects.Image
    private askLabel!: Phaser.GameObjects.Text
    private askPhrase!: Phaser.GameObjects.Text
    private phaseText!: Phaser.GameObjects.Text
    private phasePulse?: Phaser.Tweens.Tween
    private petFloat?: Phaser.Tweens.Tween
    private friends: FriendView[] = []
    private shelfBack!: Phaser.GameObjects.Graphics
    /** Coluna ou grade, conforme quantos aparelhos o pedido mostra. */
    private shelfArr: ShelfArrangement = shelfArrangement(2)
    private stamps: Array<{ ring: Phaser.GameObjects.Graphics; icon?: Phaser.GameObjects.Image }> = []
    private niches: NicheView[] = []
    private hintTween?: Phaser.Tweens.Tween

    /** Qual artefato resolveu cada pedido — o álbum do fim de nível lê daqui. */
    private used: Artifact[] = []

    /**
     * Geração da rodada. Callback atrasado compara com o valor que capturou e
     * desiste se o pedido já trocou; sem isso um `await` da rodada anterior
     * mexe em cartão destruído.
     */
    private roundGen = 0
    private unsubPlatform?: () => void

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this, 3)
        this.livesLeft = data?.lives ?? this.livesTotal
        this.levelIdx = Phaser.Math.Clamp(data?.level ?? 1, 1, LEVELS.length) - 1
        this.requestIdx = 0
        this.points = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.missesOnRequest = 0
        this.locked = true
        this.ended = false
        this.used = []
        this.niches = []
        this.stamps = []
        this.friends = []
        this.roundGen = 0
    }

    create() {
        this.drawRoom()
        this.buildHud()
        this.buildShelf()
        this.buildPet()
        this.buildAsk()
        this.registerPlatformCommands()

        EventBus.on('mute-audio', this.onMuteAudio, this)
        EventBus.on('show-tutorial', this.replayTutorial, this)
        this.events.once('shutdown', this.shutdownScene, this)

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        this.startRequest()
        this.runTutorial(false)

        /* AJUSTE A POSIÇÃO COM A TECLA M (dev). Ver shared/hud/createLives.ts */
        this.lives = createLives(this, {
            total: this.livesTotal,
            remaining: this.livesLeft,
            gameId: GAME_ID,
            x: HUD.livesX,
            y: HUD.cy,
            size: 30,
            tint: C.heart,
            stage: () => this.level.level,
        })
        this.events.once('shutdown', () => this.lives.destroy())
    }

    private get level(): LevelConfig { return LEVELS[this.levelIdx] }
    private get request(): RequestDef { return this.level.requests[this.requestIdx] }

    private shutdownScene() {
        this.hintTween?.remove()
        EventBus.off('mute-audio', this.onMuteAudio, this)
        EventBus.off('show-tutorial', this.replayTutorial, this)
        this.unsubPlatform?.()
        this.unsubPlatform = undefined
    }

    private onMuteAudio(muted: boolean) {
        this.isMuted = muted
    }

    private registerPlatformCommands() {
        this.unsubPlatform = runtimeGameBridge.onCommand((cmd: PlatformCommand) => {
            if (cmd.type === 'START_GAME') this.points = cmd.points ?? this.points
        })
    }

    /* ─────────────────────────────────────────────────────────── cenário */

    private drawRoom() {
        const bg = this.add.image(W / 2, H / 2, 'bg-quarto').setDepth(-20)
        bg.setScale(Math.max(W / bg.width, H / bg.height))

        // Clareia o quarto atrás dos painéis: o fundo é bonito e disputa
        // atenção com o pedido, que é a informação mais importante da tela.
        const veil = this.add.graphics().setDepth(-19)
        veil.fillStyle(C.white, 0.18)
        veil.fillRect(0, 0, W, H)
    }

    private buildHud() {
        this.buildPill(HUD.levelX, HUD.levelW, C.amber, C.amberDark)
        this.add.text(HUD.levelX + HUD.levelW / 2, HUD.cy, `NÍVEL ${this.level.level}`, {
            fontFamily: FONT.black, fontSize: SIZE.hudLevel, color: hex(C.ink),
        }).setOrigin(0.5).setDepth(61).setResolution(2)

        this.buildPill(HUD.phaseX, HUD.phaseW, C.cream, C.amber)
        this.phaseText = this.add.text(HUD.phaseX + HUD.phaseW / 2, HUD.cy, '', {
            fontFamily: FONT.body, fontStyle: 'bold', fontSize: SIZE.hudPhase, color: hex(C.ink),
        }).setOrigin(0.5).setDepth(61).setResolution(2)

        this.buildStamps()
        this.buildHelpButton()
    }

    private buildPill(x: number, w: number, fill: number, stroke: number) {
        const g = this.add.graphics().setDepth(60)
        g.fillStyle(C.shadow, 0.16)
        g.fillRoundedRect(x + 4, HUD.y + 6, w, HUD.h, 26)
        g.fillStyle(fill, 0.97)
        g.fillRoundedRect(x, HUD.y, w, HUD.h, 26)
        g.fillStyle(C.white, 0.28)
        g.fillRoundedRect(x + 12, HUD.y + 8, w - 24, 14, 7)
        g.lineStyle(5, stroke, 1)
        g.strokeRoundedRect(x, HUD.y, w, HUD.h, 26)
        return g
    }

    /** Um selo por fase do nível. Enche com o pictograma quando ela é atendida. */
    private buildStamps() {
        const total = this.level.requests.length

        for (let i = 0; i < total; i += 1) {
            const ring = this.add.graphics()
                .setPosition(this.stampX(i), HUD.cy)
                .setDepth(61)
            paintStamp(ring, HUD.stampSize, 'empty')
            this.stamps.push({ ring })
        }
    }

    private stampX(index: number) {
        return HUD.stampX + HUD.stampSize / 2 + index * (HUD.stampSize + HUD.stampGap)
    }

    /**
     * Marca a fase da vez, na pílula e nos selos.
     *
     * O selo atual pulsa: é o que responde "onde eu estou?" sem depender de
     * ler o "Fase 2 de 3" ao lado.
     */
    private refreshPhase() {
        const total = this.level.requests.length
        this.phaseText.setText(`Fase ${this.requestIdx + 1} de ${total}`)

        this.phasePulse?.remove()
        this.phasePulse = undefined

        this.stamps.forEach((slot, i) => {
            if (slot.icon) return
            const current = i === this.requestIdx
            FX.kill(this, slot.ring)
            slot.ring.setScale(1)
            paintStamp(slot.ring, HUD.stampSize, current ? 'current' : 'empty')
            if (current) {
                this.phasePulse = FX.breathe(this, slot.ring, { grow: 1.1, duration: 1100 })
            }
        })
    }

    private fillStamp(index: number, needFrame: number) {
        const slot = this.stamps[index]
        if (!slot || slot.icon) return

        this.phasePulse?.remove()
        this.phasePulse = undefined
        FX.kill(this, slot.ring)
        slot.ring.setScale(1)
        paintStamp(slot.ring, HUD.stampSize, 'done')

        const icon = this.add.image(this.stampX(index), HUD.cy, 'pedidos', needFrame).setDepth(62)
        this.fit(icon, HUD.stampSize - 22, HUD.stampSize - 22)
        slot.icon = icon

        FX.popIn(this, icon, { from: 0.4, duration: 420 })
        FX.impact(this, slot.ring, 0.2)
    }

    private buildHelpButton() {
        const { helpX, cy, helpR } = HUD
        const g = this.add.graphics().setDepth(61)
        g.fillStyle(C.cream, 0.95)
        g.fillCircle(helpX, cy, helpR)
        g.lineStyle(5, C.amber, 1)
        g.strokeCircle(helpX, cy, helpR)

        const label = this.add.text(helpX, cy - 1, '?', {
            fontFamily: FONT.black, fontSize: '30px', color: hex(C.ink),
        }).setOrigin(0.5).setDepth(62).setResolution(2)

        const hit = this.add.zone(helpX, cy, 96, 96).setDepth(63)
            .setInteractive({ useHandCursor: true })
        hit.on('pointerup', () => {
            FX.press(this, label)
            this.playTap()
            this.replayTutorial()
        })
    }

    private buildShelf() {
        this.shelfBack = this.add.graphics().setDepth(10)
        this.shelfArr = shelfArrangement(this.request.shelf.length)
        paintShelf(this.shelfBack, this.shelfArr)
    }

    private buildPet() {
        this.pet = this.add.sprite(PET.x, PET.y, 'bichinho', PET_FRAME.idle).setDepth(20)
        this.fit(this.pet, PET.size, PET.size)
        this.startPetFloat()
    }

    private startPetFloat() {
        this.pet.setPosition(PET.x, PET.y)
        this.petFloat = FX.float(this, this.pet, { amount: 9, duration: 2400 })
    }

    private buildAsk() {
        this.askBox = this.add.container(ASK.cx, ASK.cy).setDepth(70)

        const bg = this.add.graphics()
        paintAsk(bg)

        this.askIcon = this.add.image(ASK.iconX, 0, 'pedidos', 0)
        this.fit(this.askIcon, ASK.iconSize, ASK.iconSize)

        this.askLabel = this.add.text(ASK.labelX, ASK.labelDY, '', {
            fontFamily: FONT.black, fontSize: SIZE.askLabel, color: hex(C.ink),
        }).setOrigin(0, 0.5).setResolution(2)

        this.askPhrase = this.add.text(ASK.labelX, ASK.phraseDY, '', {
            fontFamily: FONT.body, fontStyle: 'bold', fontSize: SIZE.askPhrase, color: hex(C.inkSoft),
            wordWrap: { width: ASK.w / 2 + ASK.labelX * -1 - 40 },
        }).setOrigin(0, 0.5).setResolution(2)

        this.askBox.add([bg, this.askIcon, this.askLabel, this.askPhrase])
        this.askBox.setAlpha(0)
    }

    /* ─────────────────────────────────────────────────────────── rodada */

    private startRequest() {
        this.roundGen += 1
        this.missesOnRequest = 0
        this.clearNiches()

        const need = NEEDS[this.request.need]
        this.askIcon.setFrame(need.frame).setAlpha(1)
        this.askLabel.setText(need.label)
        this.askPhrase.setText(need.ask)
        this.pet.setFrame(PET_FRAME.asking)

        this.askBox.setAlpha(0).setScale(0.9)
        FX.to(this, this.askBox, { alpha: 1, scale: 1 }, { duration: 320, ease: Ease.back(1.8) })
        FX.impact(this, this.askIcon, 0.22)
        FX.impact(this, this.pet, 0.12)
        this.playAsk()

        if (this.request.collective) this.bringFriends()
        else this.clearFriends()

        this.refreshPhase()

        this.buildNiches(this.request.shelf)
        this.locked = false
        this.emitCheckpoint()
    }

    /* ────────────────────────────────────────────── pedido coletivo */

    /**
     * Os amiguinhos chegam ao tapete, um depois do outro, e o pictograma do
     * pedido pulsa duas vezes.
     *
     * É a microdemonstração do pedido coletivo, e ela é toda visual: três
     * bichinhos olhando o mesmo pictograma dizem "isto é de todos nós" sem
     * precisar de um painel de texto novo no meio do jogo.
     */
    private bringFriends() {
        if (this.friends.length) return

        FRIENDS.forEach((def, i) => {
            const sprite = this.add.sprite(def.x, def.y, 'bichinhos-amigos', def.frame)
                .setDepth(def.depth)
            this.fit(sprite, def.size, def.size)

            const entry: FriendView = { sprite, baseY: def.y }
            this.friends.push(entry)

            FX.popIn(this, sprite, { from: 0.6, delay: 160 + i * 190, duration: 440 })
                .then(() => {
                    if (!sprite.active) return
                    entry.float = FX.float(this, sprite, { amount: 7, duration: 2200 + i * 240 })
                })
        })

        this.time.delayedCall(620, () => {
            if (!this.askIcon.active) return
            FX.to(this, this.askIcon, { scale: this.askIcon.scale * 1.14 },
                { duration: 240, yoyo: true, repeat: 1, ease: Ease.back(2) })
        })
    }

    private clearFriends() {
        this.friends.forEach(f => {
            f.float?.remove()
            FX.kill(this, f.sprite)
            f.sprite.destroy()
        })
        this.friends = []
    }

    /** Os amiguinhos pulam junto, em cascata, para o grupo comemorar inteiro. */
    private cheerFriends() {
        this.friends.forEach((f, i) => {
            f.float?.remove()
            f.float = undefined
            void this.hopSprite(f.sprite, f.baseY, 2, 40, 110 + i * 120).then(() => {
                if (!f.sprite.active) return
                f.float = FX.float(this, f.sprite, { amount: 7, duration: 2200 + i * 240 })
            })
            heartBurst(this, f.sprite.x, f.baseY - 92)
        })
    }

    private clearNiches() {
        this.hintTween?.remove()
        this.hintTween = undefined
        this.niches.forEach(n => n.card.destroy())
        this.niches = []
    }

    private buildNiches(list: Artifact[]) {
        const shelf = Phaser.Utils.Array.Shuffle([...list])
        const arr = shelfArrangement(shelf.length)
        this.shelfArr = arr
        paintShelf(this.shelfBack, arr)

        shelf.forEach((id, i) => {
            const def = ARTIFACTS[id]
            const { x, y } = arr.slots[i]

            const card = this.add.container(x, y).setDepth(30)
            const bg = this.add.graphics()
            paintNiche(bg, arr.nicheW, arr.nicheH, 'idle')

            const icon = this.add.image(0, arr.iconDY, 'artefato-repouso', def.frame)
            this.fit(icon, arr.iconSize, arr.iconSize)

            const label = this.add.text(0, arr.labelDY, def.label, {
                fontFamily: FONT.black, fontSize: SIZE.nicheLabel, color: hex(C.ink),
            }).setOrigin(0.5).setResolution(2)

            const hit = this.add.zone(0, 0, arr.nicheW, arr.nicheH)
                .setOrigin(0.5).setInteractive({ useHandCursor: true })

            card.add([bg, icon, label, hit])
            card.setSize(arr.nicheW, arr.nicheH)

            const view: NicheView = {
                def, x, y, w: arr.nicheW, h: arr.nicheH,
                iconSize: arr.iconSize, card, bg, icon, label, state: 'idle',
            }

            hit.on('pointerover', () => {
                if (this.locked || view.state === 'hint') return
                this.setNicheState(view, 'hover')
                FX.to(this, card, { scale: 1.05 }, { duration: 120 })
            })
            hit.on('pointerout', () => {
                if (this.locked || view.state === 'hint') return
                this.setNicheState(view, 'idle')
                FX.to(this, card, { scale: 1 }, { duration: 120 })
            })
            hit.on('pointerdown', () => this.onNicheTap(view))

            this.niches.push(view)
            FX.popIn(this, card, { from: 0.75, delay: 140 + i * 110, duration: 420 })
        })
    }

    private setNicheState(view: NicheView, state: NicheView['state']) {
        view.state = state
        paintNiche(view.bg, view.w, view.h, state)
    }

    private onNicheTap(view: NicheView) {
        if (this.locked || this.ended) return
        this.locked = true
        this.playTap()
        FX.press(this, view.card, 0.93)
        void this.useArtifact(view)
    }

    /* ──────────────────────────────────────────────── uso do artefato */

    private async useArtifact(view: NicheView) {
        const gen = this.roundGen
        const need = this.request.need

        this.hintTween?.remove()
        this.hintTween = undefined
        this.setNicheState(view, 'idle')

        view.card.setDepth(120)
        FX.to(this, [view.bg, view.label], { alpha: 0 }, { duration: 160 })
        FX.to(this, view.card, { scale: STAGE.size / view.iconSize }, { duration: 340, ease: Ease.smooth })
        await FX.arcTo(this, view.card, { x: STAGE.x, y: STAGE.y }, { height: 120, duration: 360 })

        if (gen !== this.roundGen) return

        if (solves(need, view.def.id)) await this.succeed(view)
        else await this.fail(view)
    }

    /**
     * A cena de acerto, em cinco tempos:
     *
     *   1. o aparelho LIGA      — troca para o quadro em uso, pulsa, solta anéis
     *   2. o pedido POUSA nele  — o pictograma sai do balão e assenta no aparelho
     *   3. o bichinho COMEMORA  — dois pulinhos, estrelas e corações
     *   4. o pedido vira SELO   — o mesmo pictograma segue do aparelho ao selo
     *   5. o selo FECHA         — enche de verde e o balão se despede
     *
     * A ordem é o que ensina: primeiro a função acontece, depois o progresso
     * aparece, e a criança vê de onde ele veio.
     */
    private async succeed(view: NicheView) {
        const gen = this.roundGen
        const need = NEEDS[this.request.need]

        this.used[this.requestIdx] = view.def.id
        this.hits += 1
        this.points += this.missesOnRequest === 0 ? 10 : 5
        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER',
            gameId: GAME_ID,
            pointsEarned: this.missesOnRequest === 0 ? 10 : 5,
            stage: this.level.level,
        })
        this.emitCheckpoint()

        // ── 1. o aparelho liga ──────────────────────────────────────────
        view.icon.setTexture('artefato-uso', view.def.frame)
        screenGlow(this, C.green, { life: 1100, peak: 0.9 })
        FX.flash(this, C.white, { duration: 260, peak: 0.16 })
        this.playDevice(view.def.id)

        deviceWaves(this, STAGE.x, STAGE.y, view.def.color)
        await FX.to(this, view.card, { scale: view.card.scale * 1.18 },
            { duration: 190, yoyo: true, repeat: 1, ease: Ease.back(2.2) })
        if (gen !== this.roundGen) return

        // ── 2. o pedido pousa no aparelho ───────────────────────────────
        const flyer = await this.flyNeedToDevice(need.frame)
        if (gen !== this.roundGen) { flyer.destroy(); return }

        // ── 3. o bichinho comemora ──────────────────────────────────────
        this.pet.setFrame(PET_FRAME.cheering)
        this.playCorrect()
        FX.sparks(this, STAGE.x, STAGE.y, { color: view.def.color, count: 22, spread: 190 })
        FX.stars(this, PET.x, PET.y - 40, { color: C.amber, count: 12 })
        heartBurst(this, PET.x, PET.y - 110)
        this.cheerFriends()
        await this.hopPet()
        if (gen !== this.roundGen) { flyer.destroy(); return }

        // ── 4. o pedido vira selo ───────────────────────────────────────
        await this.flyNeedToStamp(flyer, this.requestIdx)
        if (gen !== this.roundGen) return

        // ── 5. o selo fecha ─────────────────────────────────────────────
        this.fillStamp(this.requestIdx, need.frame)
        FX.to(this, this.askBox, { alpha: 0, scale: 0.92 }, { duration: 240 })
        FX.to(this, view.card, { alpha: 0, scale: view.card.scale * 0.9 }, { duration: 280 })

        await FX.wait(this, 620)
        if (gen !== this.roundGen) return

        this.requestIdx += 1
        if (this.requestIdx >= this.level.requests.length) {
            void this.endLevel()
            return
        }
        this.pet.setFrame(PET_FRAME.idle)
        this.startRequest()
    }

    /** Dois pulinhos. Precisa parar o balanço idle, que também mexe no y. */
    private async hopPet(times = 2) {
        this.petFloat?.remove()
        this.petFloat = undefined
        await this.hopSprite(this.pet, PET.y, times, 52)
        this.startPetFloat()
    }

    private async hopSprite(
        sprite: Phaser.GameObjects.Sprite,
        baseY: number,
        times = 2,
        height = 52,
        delay = 0,
    ) {
        FX.kill(this, sprite)
        sprite.setY(baseY)
        await FX.to(this, sprite, { y: baseY - height },
            { duration: 230, delay, yoyo: true, repeat: times - 1, ease: Ease.back(2.4) })
        if (sprite.active) sprite.setY(baseY)
    }

    /**
     * O pictograma sai do balão e voa até o selo.
     *
     * É o elo entre o pedido e o progresso: sem ele o selo simplesmente
     * aparecia lá em cima, e a criança não tinha como saber o que ele conta.
     */
    /**
     * O pictograma sai do balão e pousa NO APARELHO ESCOLHIDO.
     *
     * É o que faz a cena responder qualquer escolha válida. Quando dois
     * aparelhos servem, o tablet ligado sozinho mostra fotos e sol — não a
     * hora. Com o pictograma do lanche pousado nele, a tela passa a dizer o
     * que a criança pediu, seja o relógio ou o tablet que ela tocou.
     */
    private async flyNeedToDevice(needFrame: number) {
        const flyer = this.add
            .image(ASK.cx + ASK.iconX, ASK.cy, 'pedidos', needFrame)
            .setDepth(210)
        this.fit(flyer, ASK.iconSize, ASK.iconSize)
        this.askIcon.setAlpha(0)

        FX.to(this, flyer, { scale: flyer.scale * 0.6 }, { duration: 420, ease: Ease.smooth })
        await FX.arcTo(this, flyer,
            { x: STAGE.x + 58, y: STAGE.y - 60 },
            { height: 90, duration: 420 })

        FX.impact(this, flyer, 0.26)
        return flyer
    }

    /** E do aparelho o pictograma segue para o selo do pedido atendido. */
    private async flyNeedToStamp(flyer: Phaser.GameObjects.Image, index: number) {
        const to = {
            x: HUD.stampX + HUD.stampSize / 2 + index * (HUD.stampSize + HUD.stampGap),
            y: HUD.cy,
        }

        FX.to(this, flyer, { scale: flyer.scale * 0.76 }, { duration: 440, ease: Ease.smooth })
        await FX.arcTo(this, flyer, to, { height: 120, duration: 440 })

        FX.ping(this, to.x, to.y, C.greenLight, { radius: 62, duration: 420 })
        flyer.destroy()
    }

    private async fail(view: NicheView) {
        const gen = this.roundGen

        this.errors += 1
        this.missesOnRequest += 1
        runtimeGameBridge.emit({
            type: 'WRONG_ANSWER', gameId: GAME_ID, pointsEarned: 0, stage: this.level.level,
        })
        this.lives.lose()
        this.livesLeft = this.lives.remaining
        this.emitCheckpoint()

        // O aparelho tenta ajudar do jeito dele, e o jeito dele não serve:
        // é a comparação que ensina, não a palavra "errado".
        view.icon.setTexture('artefato-uso', view.def.frame)
        this.pet.setFrame(PET_FRAME.confused)
        screenGlow(this, C.red, { peak: 0.7, life: 520 })
        FX.shakeCam(this, 'leve')
        this.playDevice(view.def.id, true)
        this.playError()
        FX.to(this, this.askBox, { scale: 1.06 }, { duration: 220, yoyo: true, ease: Ease.back(2) })
        showToast(this, this.request.hints[view.def.id] ?? 'Esse aparelho não ajuda agora.', C.red)
        await FX.shake(this, view.card, { amount: 14, times: 4 })

        if (gen !== this.roundGen) return
        await FX.wait(this, 620)
        if (gen !== this.roundGen) return

        view.icon.setTexture('artefato-repouso', view.def.frame)
        FX.to(this, [view.bg, view.label], { alpha: 1 }, { duration: 200 })
        FX.to(this, view.card, { scale: 1 }, { duration: 320, ease: Ease.smooth })
        await FX.arcTo(this, view.card, { x: view.x, y: view.y }, { height: 100, duration: 340 })

        if (gen !== this.roundGen) return
        view.card.setDepth(30)
        this.pet.setFrame(PET_FRAME.asking)

        if (this.missesOnRequest >= 2) this.showHint()
        this.locked = false
    }

    /** Depois de dois erros no mesmo pedido, o nicho certo passa a piscar. */
    private showHint() {
        const target = this.niches.find(n => solves(this.request.need, n.def.id))
        if (!target || this.hintTween) return

        this.setNicheState(target, 'hint')
        FX.ping(this, target.x, target.y, C.amber, { radius: 120 })
        this.hintTween = FX.breathe(this, target.card, { grow: 1.06, duration: 900 })
    }

    /* ───────────────────────────────────────────────────── fim de nível */

    private async endLevel() {
        this.ended = true
        this.locked = true
        this.clearNiches()
        this.pet.setFrame(PET_FRAME.happy)

        runtimeGameBridge.emit({
            type: 'GAME_COMPLETED',
            gameId: GAME_ID,
            stage: this.level.level,
            totalStages: LEVELS.length,
        })
        this.emitCheckpoint(true)

        this.playFanfare()
        FX.confetti(this, { colors: [C.amber, C.greenLight, C.phone, C.blue] })

        await this.showAlbum()

        const next = this.level.level < LEVELS.length ? this.level.level + 1 : null
        if (next) {
            showLevelComplete(this, {
                title: `Nível ${this.level.level} completo`,
                subtitle: this.level.title,
                message: this.level.message,
                accent: C.amber,
                panelColor: C.cream,
                overlayColor: C.ink,
                progress: { total: LEVELS.length, current: this.level.level },
                autoAdvance: {
                    delay: 1800,
                    label: `Preparando nível ${next}...`,
                    onComplete: () => this.scene.restart({
                        level: next, points: this.points, lives: this.livesLeft,
                    }),
                },
            })
            return
        }

        showLevelComplete(this, {
            title: 'Bichinho feliz!',
            subtitle: 'Todos os pedidos atendidos',
            message: this.level.message,
            accent: C.green,
            panelColor: C.cream,
            overlayColor: C.ink,
            progress: { total: LEVELS.length, current: this.level.level },
            buttons: [
                {
                    label: 'Jogar de novo',
                    color: C.green,
                    onClick: () => this.scene.restart({ level: 1, points: 0, lives: this.livesTotal }),
                },
                { label: 'Escolher jogo', color: C.amber, onClick: () => EventBus.emit('exit-game') },
            ],
        })
    }

    /**
     * O álbum do dia: cada pedido ao lado do aparelho que o resolveu. É o
     * fechamento visual da habilidade — a criança revê as três duplas antes
     * de qualquer painel de texto.
     */
    private async showAlbum() {
        const overlay = this.add.rectangle(W / 2, H / 2, W, H, C.ink, 0.6).setDepth(300).setInteractive()
        const panel = this.add.container(ALBUM.cx, ALBUM.cy).setDepth(301)

        const bg = this.add.graphics()
        paintPanel(bg, ALBUM.w, ALBUM.h, ALBUM.r, C.cream, C.amber, 7)

        const title = this.add.text(0, -ALBUM.h / 2 + 52, this.level.message, {
            fontFamily: FONT.black, fontSize: SIZE.albumTitle, color: hex(C.ink),
            align: 'center', wordWrap: { width: ALBUM.w - 90 },
        }).setOrigin(0.5).setResolution(2)

        panel.add([bg, title])

        const requests = this.level.requests
        const total = requests.length * ALBUM.cardW + (requests.length - 1) * ALBUM.gap
        const start = -total / 2 + ALBUM.cardW / 2

        const cards = requests.map((req, i) => {
            const card = this.add.container(start + i * (ALBUM.cardW + ALBUM.gap), 42)
            const cardBg = this.add.graphics()
            paintPanel(cardBg, ALBUM.cardW, ALBUM.cardH, 24, C.white, C.creamEdge, 4)

            const needIcon = this.add.image(0, -46, 'pedidos', NEEDS[req.need].frame)
            this.fit(needIcon, 78, 78)

            const arrow = this.add.graphics()
            arrow.fillStyle(C.amber, 1)
            arrow.fillTriangle(-14, -4, 14, -4, 0, 12)

            const artifact = ARTIFACTS[this.used[i] ?? req.shelf[0]]
            const deviceIcon = this.add.image(0, 54, 'artefato-uso', artifact.frame)
            this.fit(deviceIcon, 74, 74)

            card.add([cardBg, needIcon, arrow, deviceIcon])
            panel.add(card)
            return card
        })

        panel.setScale(0.9).setAlpha(0)
        await FX.to(this, panel, { scale: 1, alpha: 1 }, { duration: 320, ease: Ease.back(1.7) })
        await FX.stagger(this, cards, card => FX.popIn(this, card, { from: 0.7, duration: 360 }), 180)
        await FX.wait(this, 1600)
        await FX.to(this, [panel, overlay], { alpha: 0 }, { duration: 260 })

        panel.destroy()
        overlay.destroy()
    }

    /* ───────────────────────────────────────────────────────── tutorial */

    private runTutorial(force: boolean) {
        this.locked = true
        createTutorial(this, {
            key: 'bichinho-n1',
            once: !force,
            accent: C.amber,
            safeTop: HUD.y + HUD.h + 12,
            steps: [
                {
                    text: 'Olhe o pedido do bichinho.',
                    shape: 'rect', x: ASK.cx, y: ASK.cy, w: ASK.w + 30, h: ASK.h + 30,
                    balloonY: 470,
                },
                {
                    // A estante INTEIRA, e não a altura de dois nichos: com três
                    // aparelhos na prateleira, uma janela medida para dois deixa
                    // o primeiro e o último no escuro.
                    text: 'Toque no aparelho que ajuda.',
                    shape: 'rect',
                    x: this.shelfArr.cx, y: SHELF.cy,
                    w: this.shelfArr.w + 24, h: SHELF.h + 24,
                    balloonX: 440, balloonY: 396,
                    pointer: {
                        fromX: this.shelfArr.cx, fromY: SHELF.cy,
                        toX: this.shelfArr.cx, toY: SHELF.cy, tap: true,
                    },
                },
                {
                    // Holofote redondo e mais alto que o bichinho inteiro: com o
                    // balão embaixo, o passo não cobre o pedido, que é justamente
                    // o que o passo 1 acabou de ensinar a olhar.
                    text: 'Ele usa o aparelho e fica feliz!',
                    shape: 'circle', x: PET.x, y: 396, w: 260, h: 260,
                    balloonY: 600,
                },
            ],
            onFinish: () => { this.locked = this.ended },
        })
    }

    /**
     * O `?` só reabre o tutorial entre uma decisão e outra. Chamado no meio de
     * uma animação, o `onFinish` destravaria a cena com o artefato ainda no ar.
     */
    private replayTutorial() {
        if (this.ended || this.locked) return
        this.runTutorial(true)
    }

    /* ───────────────────────────────────────────────────────── suporte */

    private fit(image: Phaser.GameObjects.Image | Phaser.GameObjects.Sprite, maxW: number, maxH: number) {
        image.setScale(Math.min(maxW / image.width, maxH / image.height))
    }

    private emitCheckpoint(complete = false) {
        const total = this.level.requests.length
        const done = complete ? total : this.requestIdx
        runtimeGameBridge.emit({
            type: 'CHECKPOINT',
            gameId: GAME_ID,
            progress: Math.round((done / total) * 100),
            score: this.points,
            stage: this.level.level,
            hits: this.hits,
            errors: this.errors,
        })
    }

    /* ─────────────────────────────────────────────────────────── áudio */

    private getAudioCtx(): AudioContext | null {
        if (this.isMuted) return null
        try { return (this.sound as Phaser.Sound.WebAudioSoundManager).context } catch { return null }
    }

    private playTone(freq: number, dur: number, type: OscillatorType = 'sine', gain = 0.12) {
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

    private playSequence(notes: number[], step: number, dur: number, type: OscillatorType, gain: number) {
        notes.forEach((f, i) => this.time.delayedCall(i * step, () => this.playTone(f, dur, type, gain)))
    }

    private playTap() { this.playTone(430, 0.05, 'sine', 0.08) }
    private playAsk() { this.playSequence([880, 1170], 90, 0.09, 'sine', 0.1) }
    private playCorrect() { this.playSequence([523, 659, 784], 95, 0.16, 'sine', 0.14) }
    private playError() { this.playSequence([200, 150], 130, 0.2, 'square', 0.1) }
    private playFanfare() { this.playSequence([523, 659, 784, 1047], 120, 0.22, 'sine', 0.16) }

    /** Cada aparelho tem a própria voz: é parte de reconhecer o que ele faz. */
    private playDevice(id: Artifact, weak = false) {
        const gain = weak ? 0.05 : 0.13
        if (id === 'speaker') this.playSequence([660, 830, 990], 110, 0.16, 'sine', gain)
        else if (id === 'tablet') this.playSequence([700, 900, 1100, 1300], 70, 0.09, 'triangle', gain)
        else if (id === 'phone') this.playSequence([480, 480], 260, 0.14, 'sine', gain)
        else this.playSequence([1200, 1200], 200, 0.03, 'square', gain)
    }
}
