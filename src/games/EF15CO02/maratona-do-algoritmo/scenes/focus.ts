import Phaser from 'phaser'
import { FX, type FxTarget } from '../../../../shared/effects/FX'
import { FOCUS, GROUND, W } from '../data/layout'

const fx = (o: unknown) => o as unknown as FxTarget

/**
 * ═══════════════════════════════════════════════════════════════════════
 *  O FOCO DA DESCIDA
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Enquanto a criança monta, a tela inteira é útil: ela precisa ver a paleta e
 * o parque ao mesmo tempo. No instante do VAI isso se inverte — não há mais
 * nada a tocar, e tudo que importa acontece no parque.
 *
 * Então o parque **cresce 8 %** e acompanha o skatista. É a ideia de um close
 * no cinema: o jogo parou de pedir e passou a mostrar.
 *
 * **NÃO HÁ VINHETA.** A primeira versão escurecia as bordas para "destacar" a
 * descida, e o que ela destacava mesmo era a camada escura: a tela apagava
 * justo no momento em que a criança mais queria olhar. O zoom sozinho já diz
 * "agora assista", e diz sem tirar luz de nada.
 *
 * O zoom é feito no CONTAINER do parque, não na câmera. Zoom de câmera
 * levaria os painéis junto e cortaria a paleta; aqui a interface fica
 * exatamente onde estava, e só o mundo se aproxima.
 */
export function createFocus(
    scene: Phaser.Scene,
    root: Phaser.GameObjects.Container,
    worldW: number,
) {
    /** Onde o skatista fica na tela enquanto o foco está ligado. */
    const screenX = W / 2

    let on = false
    let zoom = 1
    let targetX = 0
    let targetY = 0

    /**
     * A ROLAGEM DE MONTAR. O parque é mais largo que a tela, então fora da
     * descida ele fica deslocado de `planX` — e é para esse ponto que o foco
     * volta quando a descida acaba, não para o começo do mapa.
     */
    let planX = 0
    const clampX = (x: number, z: number) => Phaser.Math.Clamp(x, Math.min(0, W - z * worldW), 0)

    /*
     * O foco SÓ ANDA NA HORIZONTAL.
     *
     * Na vertical ele fica ancorado na linha do chão: `GROUND.y × (1 − zoom)`
     * mantém o deck exatamente onde estava e entrega todo o crescimento para
     * cima, que é para onde o skatista voa. Panorâmica vertical seguindo o
     * skatista faria o contrário — subiria a imagem junto com ele e o ollie
     * bateria no teto da máscara.
     *
     * Na horizontal a rolagem para nas bordas: o parque não pode mostrar o
     * vazio fora dele.
     */
    const groundAnchor = () => GROUND.y * (1 - zoom)

    function aim(worldX: number) {
        targetX = clampX(screenX - zoom * worldX, zoom)
        targetY = groundAnchor()
    }

    return {
        get active() {
            return on
        },

        get planX() {
            return planX
        },

        /** O arrasto: o parque vai junto com o dedo, sem tween. */
        drag(x: number) {
            planX = clampX(x, 1)
            if (on) return
            FX.kill(scene, fx(root))
            root.setPosition(planX, 0).setScale(1)
        },

        /** Põe `worldX` no meio da tela (até onde o mapa deixa). */
        async view(worldX: number, ms = 420) {
            planX = clampX(W / 2 - worldX, 1)
            if (on) return
            FX.kill(scene, fx(root))
            if (ms <= 0) {
                root.setPosition(planX, 0).setScale(1)
                return
            }
            await FX.to(scene, fx(root), { x: planX, y: 0, scaleX: 1, scaleY: 1 },
                { duration: ms, ease: 'Sine.easeInOut' })
        },

        async enter(worldX: number) {
            if (on) return
            on = true
            zoom = FOCUS.zoom
            aim(worldX)
            root.setScale(1)
            await FX.to(scene, fx(root),
                { scaleX: zoom, scaleY: zoom, x: targetX, y: targetY },
                { duration: FOCUS.ms, ease: 'Sine.easeInOut' })
        },

        /** O alvo muda; o movimento é suavizado no `update` para não solavancar. */
        follow(worldX: number) {
            if (!on) return
            aim(worldX)
        },

        update(delta: number) {
            if (!on) return
            const t = 1 - Math.pow(0.0025, delta / 1000)
            root.x += (targetX - root.x) * t
            root.y += (targetY - root.y) * t
        },

        async exit() {
            if (!on) return
            on = false
            zoom = 1
            await FX.to(scene, fx(root), { scaleX: 1, scaleY: 1, x: planX, y: 0 },
                { duration: FOCUS.ms, ease: 'Sine.easeInOut' })
            root.setPosition(planX, 0).setScale(1)
        },

        destroy() {
            FX.kill(scene, fx(root))
        },
    }
}
