import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { SAFE_BODY, SAFE_DOOR, SAFE_FRAME, SAFE_SHEET, SHEET, safeOrigin, safeScale } from '../data/art'
import { DEPTH, VAULT } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  A CÁPSULA-COFRE
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Os três ferrolhos são Graphics por cima da porta, e não parte do PNG: cada
 * um abre no fim de uma ficha, e um desenho impresso não teria como abrir
 * sozinho. O §5 do TEXTURAS.md pediu a porta limpa exatamente por isso.
 *
 * A cápsula não é cronômetro nem placar. Ela abre porque três registros
 * ficaram corretos — se abrisse por tempo, a criança aprenderia a correr em
 * vez de a ler o nome do campo.
 */

export interface ArchiveCard {
    title: string
    lines: Array<[string, string]>
}

const SCALE = safeScale(VAULT.w)

/** O centro da porta, em coordenadas de tela, derivado da folha medida. */
const DOOR = {
    x: VAULT.x + (SAFE_DOOR.x - SAFE_SHEET.frameWidth / 2) * SCALE,
    y: VAULT.baseY - (SAFE_BODY.base - SAFE_DOOR.y) * SCALE,
}

const BOLT = { r: 12, gap: 34, dy: 42 }

/**
 * Os cartões do arquivo crescem com o número de campos.
 *
 * Três campos no nível 1, quatro nos níveis 2 e 3. Com altura fixa, a quarta
 * linha caía para fora do papel exatamente no nível em que a SITUAÇÃO é o
 * campo que mais importa — foi o que aconteceu no primeiro teste do nível 3.
 */
const CARD = { w: 268, y: 316, xs: [326, 640, 954], top: 88, row: 62, pad: 26 }

const cardHeight = (lines: number) => CARD.top + lines * CARD.row + CARD.pad

function paintBolts(g: Phaser.GameObjects.Graphics, open: number) {
    g.clear()
    for (let i = 0; i < 3; i++) {
        const x = (i - 1) * BOLT.gap
        const y = BOLT.dy
        g.fillStyle(C.ink, 0.5)
        g.fillCircle(x, y + 2, BOLT.r + 3)
        g.fillStyle(i < open ? C.green : C.hullDeep, 1)
        g.fillCircle(x, y, BOLT.r + 2)
        g.fillStyle(i < open ? C.greenDeep : C.hull, 1)
        g.fillCircle(x, y, BOLT.r - 2)
        if (i >= open) continue
        g.lineStyle(3, C.white, 1)
        g.beginPath()
        g.moveTo(x - 5, y)
        g.lineTo(x - 1, y + 4)
        g.lineTo(x + 6, y - 5)
        g.strokePath()
    }
}

/** Reserva geométrica: cápsula com porta redonda, sem textura nenhuma. */
function paintStandIn(g: Phaser.GameObjects.Graphics, open: boolean) {
    const w = VAULT.w
    const h = w * 0.82
    g.clear()
    g.fillStyle(C.ink, 0.4)
    g.fillRoundedRect(-w / 2 + 6, -h + 12, w, h, 26)
    g.fillStyle(C.hullDeep, 1)
    g.fillRoundedRect(-w / 2 - 5, -h - 5, w + 10, h + 10, 30)
    g.fillStyle(C.hull, 1)
    g.fillRoundedRect(-w / 2, -h, w, h, 26)
    const cy = -h * 0.54
    g.fillStyle(C.hullDeep, 1)
    g.fillCircle(0, cy, h * 0.36)
    g.fillStyle(open ? C.lamp : C.hull, 1)
    g.fillCircle(0, cy, h * 0.31)
    if (open) return
    g.lineStyle(7, C.hullDeep, 1)
    g.strokeCircle(0, cy, h * 0.16)
}

function paintCard(g: Phaser.GameObjects.Graphics, h: number) {
    const { w } = CARD
    g.clear()
    g.fillStyle(C.ink, 0.36)
    g.fillRoundedRect(-w / 2 + 6, -h / 2 + 10, w, h, 18)
    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(-w / 2 - 4, -h / 2 - 4, w + 8, h + 8, 22)
    g.fillStyle(C.paperDeep, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 18)
    g.fillStyle(C.paper, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h - 8, 18)
    g.fillStyle(C.green, 1)
    g.fillRoundedRect(-w / 2 + 14, -h / 2 + 12, w - 28, 42, 12)
}

export function createVault(scene: Phaser.Scene) {
    const parts: Phaser.GameObjects.GameObject[] = []
    let body: Phaser.GameObjects.Sprite | Phaser.GameObjects.Graphics

    if (scene.textures.exists(SHEET.safe)) {
        const origin = safeOrigin()
        body = scene.add
            .sprite(VAULT.x, VAULT.baseY, SHEET.safe, SAFE_FRAME.closed)
            .setOrigin(origin.x, origin.y)
            .setScale(SCALE)
            .setDepth(DEPTH.vault)
    } else {
        const g = scene.add.graphics().setPosition(VAULT.x, VAULT.baseY).setDepth(DEPTH.vault)
        paintStandIn(g, false)
        body = g
    }
    parts.push(body)

    const bolts = scene.add.graphics().setPosition(DOOR.x, DOOR.y).setDepth(DEPTH.vaultFx)
    paintBolts(bolts, 0)
    parts.push(bolts)

    let open = 0
    let cards: Phaser.GameObjects.Container[] = []

    return {
        /** Onde a ficha pronta entra. */
        mouth() {
            return { x: DOOR.x, y: DOOR.y }
        },

        /** Um ferrolho gira. É o único progresso que a criança vê da cápsula. */
        async closeBolt() {
            open = Math.min(3, open + 1)
            paintBolts(bolts, open)
            await FX.all(
                FX.impact(scene, bolts, 0.22),
                FX.ping(scene, DOOR.x + (open - 2) * BOLT.gap, DOOR.y + BOLT.dy, C.green, {
                    radius: 40,
                    depth: DEPTH.vaultFx + 1,
                }),
            )
        },

        boltsClosed() {
            return open
        },

        /** A porta redonda abre. Só depois das três fichas. */
        async openDoor() {
            if (body instanceof Phaser.GameObjects.Sprite) {
                await FX.to(scene, body, { scaleX: SCALE * 0.94 }, { duration: 140, yoyo: true })
                body.setFrame(SAFE_FRAME.open)
            } else {
                paintStandIn(body, true)
            }
            await FX.all(
                FX.impact(scene, body, 0.16),
                FX.ping(scene, DOOR.x, DOOR.y, C.lamp, { radius: 130, depth: DEPTH.vaultFx }),
            )
            bolts.setAlpha(0)
        },

        /**
         * As três fichas prontas saem da cápsula e ficam lado a lado.
         *
         * É a leitura final do §11: a criança vê os registros que ELA montou,
         * campo por campo, e não um placar. Nenhum número aparece aqui.
         */
        async showArchive(list: ArchiveCard[]) {
            cards = list.slice(0, 3).map(card => {
                const holder = scene.add.container(DOOR.x, DOOR.y).setDepth(DEPTH.fly)
                const h = cardHeight(card.lines.length)
                const g = scene.add.graphics()
                paintCard(g, h)
                holder.add(g)

                const title = scene.add
                    .text(0, -h / 2 + 33, card.title.toUpperCase(), {
                        fontFamily: FONT.black,
                        fontSize: '22px',
                        color: CSS.white,
                        align: 'center',
                    })
                    .setOrigin(0.5)
                    .setResolution(2)
                title.setStroke(CSS.ink, 4)
                // FICHA DO CARANGUEJO passa da tarja verde: o título mede a si
                // mesmo, como as etiquetas, em vez de confiar num corpo fixo
                const band = CARD.w - 46
                if (title.width > band) title.setScale(band / title.width)
                holder.add(title)

                card.lines.forEach(([name, value], row) => {
                    const y = -h / 2 + CARD.top + row * CARD.row
                    const label = scene.add
                        .text(-CARD.w / 2 + 20, y, name, {
                            fontFamily: FONT.body,
                            fontSize: '20px',
                            color: CSS.inkSoft,
                        })
                        .setOrigin(0, 0.5)
                        .setResolution(2)
                    const text = scene.add
                        .text(-CARD.w / 2 + 20, y + 26, value, {
                            fontFamily: FONT.black,
                            fontSize: '30px',
                            color: CSS.ink,
                        })
                        .setOrigin(0, 0.5)
                        .setResolution(2)
                    const room = CARD.w - 40
                    if (text.width > room) text.setScale(room / text.width)
                    holder.add(label)
                    holder.add(text)
                })

                holder.setScale(0.1).setAlpha(0)
                parts.push(holder)
                return holder
            })

            await FX.all(
                ...cards.map((holder, i) =>
                    FX.wait(scene, i * 180).then(() =>
                        FX.all(
                            FX.to(scene, holder, { alpha: 1 }, { duration: 200 }),
                            FX.arcTo(
                                scene,
                                holder,
                                { x: CARD.xs[i], y: CARD.y },
                                { height: 150, duration: 620 },
                            ),
                            FX.to(scene, holder, { scale: 1 }, { duration: 620, ease: 'Back.easeOut' }),
                        ),
                    ),
                ),
            )
        },

        bounds() {
            return { x: VAULT.x, y: VAULT.baseY - VAULT.w * 0.41, w: VAULT.w + 40, h: VAULT.w * 0.9 }
        },

        destroy() {
            parts.forEach(p => {
                scene.tweens.killTweensOf(p)
                p.destroy()
            })
            cards = []
        },
    }
}

export type Vault = ReturnType<typeof createVault>
