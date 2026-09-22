import Phaser from 'phaser'
import { CASAS, NO_POR_ID, POUSOS, TRECHOS } from '../data/layout'
import { pontoDePlanta } from '../data/levels'
import { boxOf, cutSheet, type Sheet } from './sheet'
import type { Ferramenta } from '../types'

export interface Opcao {
    chave: string
    x: number
    y: number
    rotulo: string
}

export interface CorridaHooks {
    /** Uma casa entrou no círculo. O índice é a ordem, e é o que vira melodia. */
    onAcende(id: string, indice: number): void
    onSol(restante: number, total: number): void
    /** Onde a ferramenta está agora. Quem desenha o círculo e o rastro é a vila. */
    onPos(x: number, y: number, raio: number): void
    /** A ferramenta parou e espera. Ela espera o tempo que for. */
    pedirRumo(opcoes: Opcao[]): Promise<string>
    onAndando(f: Ferramenta, andando: boolean): void
}

export interface Corrida {
    rodar(f: Ferramenta, marcadas: string[], hooks: CorridaHooks): Promise<Set<string>>
    pos(): { x: number; y: number } | null
    limpar(): void
    destroy(): void
}

const dist = (ax: number, ay: number, bx: number, by: number) => Math.hypot(ax - bx, ay - by)

export function createCorrida(scene: Phaser.Scene): Corrida {
    const sheetF: Sheet | null = cutSheet(scene, 'ferramentas', 4, 3)

    const token = scene.add.image(0, 0, 'ferramentas', '0').setOrigin(0.5).setDepth(20).setVisible(false)
    const sombra = scene.add.graphics().setDepth(19).setVisible(false)

    let cancelado = false
    let andando = false

    const porFerramenta = (f: Ferramenta) => {
        if (!scene.textures.exists('ferramentas') || !sheetF) return
        const box = boxOf(sheetF, f.frame)
        const escala = Math.min(
            84 / (box.width * sheetF.frameW),
            70 / (box.height * sheetF.frameH),
        )
        /* A viagem sempre começa indo para a direita, saindo da praça. */
        const jaVirado = f.andar !== 'planta' && f.frente === 'esquerda'
        token.setFrame(String(f.frame)).setScale(escala).setVisible(true).setFlipX(jaVirado)
    }

    /**
     * O DESENHO VIRA PARA O RUMO DA VIAGEM.
     *
     * O carro de som está desenhado olhando para a esquerda, e a vila anda da
     * esquerda para a direita: sem isto ele atravessa os 3600 px de ré. Cada
     * ferramenta que se mexe diz em `frente` para que lado ela olha parada, e
     * quem não diz nada (a porta, que é uma porta) nunca vira.
     */
    let ultimoX: number | null = null

    const virar = (f: Ferramenta, x: number) => {
        if (!f.frente) return
        if (ultimoX !== null && Math.abs(x - ultimoX) > 0.6) {
            const paraDireita = x > ultimoX
            token.setFlipX(f.frente === 'esquerda' ? paraDireita : !paraDireita)
        }
        ultimoX = x
    }

    /** Um gingado de 3 graus enquanto anda: o token deixa de ser um adesivo. */
    const balancar = (on: boolean) => {
        if (on === andando) return
        andando = on
        scene.tweens.killTweensOf(token)
        if (!on) {
            scene.tweens.add({ targets: token, angle: 0, duration: 160 })
            return
        }
        scene.tweens.add({
            targets: token,
            angle: { from: -3, to: 3 },
            duration: 260,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        })
    }

    const rodar = async (
        f: Ferramenta,
        marcadas: string[],
        hooks: CorridaHooks,
    ): Promise<Set<string>> => {
        cancelado = false
        ultimoX = null
        const acesas = new Set<string>()
        let ordem = 0

        const conferir = (x: number, y: number) => {
            for (const casa of CASAS) {
                if (acesas.has(casa.id)) continue
                if (!marcadas.includes(casa.id)) continue
                if (dist(casa.x, casa.y, x, y) > f.raio) continue
                if (f.so === 'uma-casa' && acesas.size >= 1) continue
                acesas.add(casa.id)
                hooks.onAcende(casa.id, ordem++)
            }
        }

        const posicionar = (x: number, y: number) => {
            virar(f, x)
            token.setPosition(x, y)
            sombra.clear()
            sombra.fillStyle(0x000000, 0.18)
            sombra.fillEllipse(x, y + 26, 54, 15)
            hooks.onPos(x, y, f.raio)
            conferir(x, y)
        }

        porFerramenta(f)
        sombra.setVisible(true)

        // ── as que não saem do lugar ──────────────────────────────────────
        if (f.andar === 'planta') {
            const p = pontoDePlanta(f)
            token.setPosition(p.x, p.y - 60).setAlpha(0)
            await new Promise<void>(resolve => {
                scene.tweens.add({
                    targets: token,
                    y: p.y,
                    alpha: 1,
                    duration: 320,
                    ease: 'Bounce.easeOut',
                    onComplete: () => resolve(),
                })
            })
            if (cancelado) return acesas
            await new Promise<void>(resolve => {
                const estado = { r: 0 }
                scene.tweens.add({
                    targets: estado,
                    r: f.raio,
                    duration: 560,
                    ease: 'Cubic.easeOut',
                    onUpdate: () => {
                        hooks.onPos(p.x, p.y, estado.r)
                        conferir(p.x, p.y)
                    },
                    onComplete: () => resolve(),
                })
            })
            return acesas
        }

        // ── o drone: escolhe onde pousar, e voa reto ──────────────────────
        if (f.andar === 'voo') {
            let voos = f.sol
            hooks.onSol(voos, f.sol)
            const usados = new Set<string>()
            posicionar(NO_POR_ID.p.x, NO_POR_ID.p.y)

            while (voos > 0 && !marcadas.every(id => acesas.has(id))) {
                const opcoes: Opcao[] = POUSOS.filter(p => !usados.has(p.nome)).map(p => ({
                    chave: p.nome,
                    x: p.x,
                    y: p.y,
                    rotulo: p.nome,
                }))
                if (!opcoes.length) break

                const chave = await hooks.pedirRumo(opcoes)
                if (cancelado) return acesas
                const alvo = POUSOS.find(p => p.nome === chave)
                if (!alvo) break
                usados.add(chave)

                hooks.onAndando(f, true)
                await new Promise<void>(resolve => {
                    const de = { x: token.x, y: token.y }
                    const estado = { t: 0 }
                    scene.tweens.add({
                        targets: estado,
                        t: 1,
                        duration: 700,
                        ease: 'Sine.easeInOut',
                        onUpdate: () => {
                            const x = Phaser.Math.Linear(de.x, alvo.x, estado.t)
                            const y = Phaser.Math.Linear(de.y, alvo.y, estado.t)
                            posicionar(x, y)
                        },
                        onComplete: () => resolve(),
                    })
                })
                hooks.onAndando(f, false)
                if (cancelado) return acesas

                voos--
                hooks.onSol(voos, f.sol)
            }
            return acesas
        }

        // ── as que andam pela estrada ─────────────────────────────────────
        let no = 'p'
        const visitados = new Set<string>(['p'])
        let sol = f.sol
        hooks.onSol(sol, f.sol)
        posicionar(NO_POR_ID.p.x, NO_POR_ID.p.y)

        while (sol > 0 && !marcadas.every(id => acesas.has(id))) {
            const saidas = TRECHOS.filter(t => t.de === no && !visitados.has(t.para))
            if (!saidas.length) break

            let escolhido = saidas[0]
            if (saidas.length > 1) {
                const opcoes: Opcao[] = saidas.map(t => ({
                    chave: t.para,
                    x: NO_POR_ID[t.para].x,
                    y: NO_POR_ID[t.para].y,
                    rotulo: t.ramo,
                }))
                const chave = await hooks.pedirRumo(opcoes)
                if (cancelado) return acesas
                escolhido = saidas.find(t => t.para === chave) ?? saidas[0]
            }

            const de = NO_POR_ID[escolhido.de]
            const para = NO_POR_ID[escolhido.para]

            hooks.onAndando(f, true)
            balancar(true)
            await new Promise<void>(resolve => {
                const estado = { t: 0 }
                scene.tweens.add({
                    targets: estado,
                    t: 1,
                    duration: Math.max(560, dist(de.x, de.y, para.x, para.y) * 2.2),
                    ease: 'Sine.easeInOut',
                    onUpdate: () => {
                        posicionar(
                            Phaser.Math.Linear(de.x, para.x, estado.t),
                            Phaser.Math.Linear(de.y, para.y, estado.t),
                        )
                    },
                    onComplete: () => resolve(),
                })
            })
            hooks.onAndando(f, false)
            balancar(false)
            if (cancelado) return acesas

            no = escolhido.para
            visitados.add(no)
            sol--
            hooks.onSol(sol, f.sol)
        }

        return acesas
    }

    return {
        rodar,
        pos: () => (token.visible ? { x: token.x, y: token.y } : null),
        limpar: () => {
            cancelado = true
            andando = false
            scene.tweens.killTweensOf(token)
            token.setVisible(false).setAlpha(1).setAngle(0).setFlipX(false)
            ultimoX = null
            sombra.clear().setVisible(false)
        },
        destroy: () => {
            cancelado = true
            token.destroy()
            sombra.destroy()
        },
    }
}
