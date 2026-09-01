import Phaser from 'phaser'
import { runtimeGameBridge } from '../bridge/runtimeGameBridge'
import hpIconUrl from '../../assets/global/hp-icon.png'

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  AS VIDAS DA PARTIDA
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Um ícone e o número ao lado. Guarda a REGRA junto com o desenho: quando o
 * número chega a zero, sai o `GAME_OVER`.
 *
 * A regra mora aqui, e não em cada jogo, de propósito. São 49 jogos; 49
 * contadores escritos à mão seriam 49 chances de errar o mesmo detalhe — e um
 * contador que esquece de zerar reprova criança que não errou.
 *
 * ── ÍCONE E NÚMERO, NÃO UM ÍCONE POR VIDA ────────────────────────────────
 *
 * A fileira de corações cresce com o total, e a plataforma pode mandar
 * `lives=5` num jogo cujo header foi desenhado para três. Ícone + número ocupa
 * a mesma largura com qualquer quantidade.
 *
 * ── O JOGO CONTINUA EMITINDO O `WRONG_ANSWER` ────────────────────────────
 *
 * Este componente não emite acerto nem erro: cada jogo já sabe quanto vale
 * cada erro seu (`pointsEarned` varia). O contrato é:
 *
 *     runtimeGameBridge.emit({ type: 'WRONG_ANSWER', ... })   // o jogo
 *     lives.lose()                                            // e depois isto
 *
 * ── O ÍCONE É BRANCO ─────────────────────────────────────────────────────
 *
 * `hp-icon.png` vem branco justamente para ser tingido. Cada jogo passa o
 * `tint` que combina com a paleta dele.
 */

/** A textura compartilhada. Carregada por `preloadLives`. */
export const LIVES_TEXTURE = 'shared-hp-icon'

/** Chame no `preload()` do BootScene, antes de `createLives`. */
export function preloadLives(scene: Phaser.Scene): void {
    if (scene.textures.exists(LIVES_TEXTURE)) return
    scene.load.image(LIVES_TEXTURE, hpIconUrl)
}

export interface LivesOptions {
    /** O teto da partida. Serve para o `set` não estourar. */
    total: number
    /** Quantas ainda restam. Omitido, começa cheio. */
    remaining?: number
    /** O slug do jogo, para o `GAME_OVER`. */
    gameId: string
    /** Canto ESQUERDO do ícone, e o centro vertical da linha. */
    x: number
    y: number
    /** O nível atual. Função porque ele muda entre os níveis. */
    stage: () => number
    /** Lado do ícone, em px. */
    size?: number
    /** Espaço entre o ícone e o número. */
    gap?: number
    /** Cor do ícone. O PNG é branco. */
    tint?: number
    /** Aparência do número. */
    color?: string
    fontFamily?: string
    fontSize?: string
    stroke?: string
    strokeThickness?: number
    /**
     * Onde na pilha. O padrão fica acima do conteúdo do jogo e ABAIXO de
     * qualquer overlay — tutorial (9000+), intro de nível e fim de nível
     * (180+). Os corações são parte do header, não flutuam por cima dele.
     */
    depth?: number
}

export interface Lives {
    /** Quantas restam. Passe no `scene.restart` para o próximo nível. */
    readonly remaining: number
    /** Uma vida a menos. No zero, emite `GAME_OVER` — uma vez só. */
    lose(): void
    /** Repõe o saldo sem animação (para reconstruir o HUD após um restart). */
    set(n: number): void
    /** O container, se o jogo precisar reposicionar ou esconder. */
    readonly container: Phaser.GameObjects.Container
    destroy(): void
}

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  O MODO DE AJUSTE (só no dev server)
 * ══════════════════════════════════════════════════════════════════════════
 *
 * `M` liga: aparece uma moldura em volta do par ícone+número e as setas ou
 * WASD movem de 1 em 1 px. Com Shift, de 10 em 10. `M` de novo desliga e
 * grava a posição em `lives-positions.json`, na raiz do projeto.
 *
 * A moldura existe para o ajuste não ser no olho: ela mostra a caixa real que
 * o componente ocupa, e é assim que dá para ver se está encostando em outra
 * coisa do header.
 */
function ligarAjuste(
  scene: Phaser.Scene,
  gameId: string,
  container: Phaser.GameObjects.Container,
  medir: () => { x: number; y: number; w: number; h: number },
  aplicar: (dx: number, dy: number) => void,
  posicao: () => { x: number; y: number; size: number }
) {
  const teclado = scene.input.keyboard
  if (!teclado) return () => {}

  let editando = false
  let moldura: Phaser.GameObjects.Graphics | undefined
  let aviso: Phaser.GameObjects.Text | undefined

  const desenharMoldura = () => {
    const { x, y, w, h } = medir()
    moldura?.clear()
    moldura?.lineStyle(2, 0x00ff88, 1)
    moldura?.strokeRect(x - 4, y - 4, w + 8, h + 8)
    aviso?.setText(`x:${Math.round(posicao().x)}  y:${Math.round(posicao().y)}   WASD/setas · Shift=10px · M=salvar`)

    // encostado na direita, o rótulo alinha pela direita para não sair da tela
    const perto = x + w > Number(scene.game.config.width) / 2
    aviso?.setOrigin(perto ? 1 : 0, 1)
    aviso?.setPosition(perto ? x + w : x, y - 14)
  }

  const aoTeclar = (evento: KeyboardEvent) => {
    const tecla = evento.key.toLowerCase()

    if (tecla === 'm') {
      editando = !editando
      if (editando) {
        moldura = scene.add.graphics().setDepth(9998)
        aviso = scene.add
          .text(0, 0, '', { fontFamily: 'monospace', fontSize: '13px', color: '#00ff88' })
          .setOrigin(0, 1)
          .setDepth(9999)
        container.add([moldura, aviso])
        desenharMoldura()
      } else {
        moldura?.destroy()
        aviso?.destroy()
        moldura = undefined
        aviso = undefined
        void fetch('/__lives', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ gameId, ...posicao() }),
        })
          .then((r) => r.json())
          .then((r) => console.log(`[vidas] ${gameId} salvo (${r.total} jogos no arquivo)`))
          .catch((e) => console.warn('[vidas] não salvou:', e))
      }
      return
    }

    if (!editando) return

    const passo = evento.shiftKey ? 10 : 1
    const movimentos: Record<string, [number, number]> = {
      a: [-passo, 0], arrowleft: [-passo, 0],
      d: [passo, 0], arrowright: [passo, 0],
      w: [0, -passo], arrowup: [0, -passo],
      s: [0, passo], arrowdown: [0, passo],
    }

    const mover = movimentos[tecla]
    if (!mover) return

    evento.preventDefault()
    aplicar(mover[0], mover[1])
    desenharMoldura()
  }

  teclado.on('keydown', aoTeclar)
  return () => teclado.off('keydown', aoTeclar)
}

export function createLives(scene: Phaser.Scene, options: LivesOptions): Lives {
    const {
        total,
        gameId,
        x,
        y,
        stage,
        size = 34,
        gap = 8,
        tint = 0xffffff,
        color = '#ffffff',
        fontFamily = '"DynaPuff Black", "Arial Black", Arial, sans-serif',
        fontSize = '24px',
        stroke,
        strokeThickness = 0,
        depth = 50,
    } = options

    let remaining = Math.max(0, Math.min(total, options.remaining ?? total))
    let acabou = remaining <= 0

    const container = scene.add.container(0, 0).setDepth(depth)

    const icone = scene.add
        .image(x + size / 2, y, LIVES_TEXTURE)
        .setDisplaySize(size, size)
        .setTint(tint)

    const numero = scene.add
        .text(x + size + gap, y, String(remaining), {
            fontFamily,
            fontSize,
            color,
            ...(stroke ? { stroke, strokeThickness } : {}),
        })
        .setOrigin(0, 0.5)
        .setResolution(2)

    container.add([icone, numero])

    let px = x
    let py = y

    const desligarAjuste = import.meta.env.DEV
        ? ligarAjuste(
              scene,
              gameId,
              container,
              () => ({
                  x: px,
                  y: py - size / 2,
                  w: size + gap + numero.width,
                  h: Math.max(size, numero.height),
              }),
              (dx, dy) => {
                  px += dx
                  py += dy
                  icone.setPosition(px + size / 2, py)
                  numero.setPosition(px + size + gap, py)
              },
              () => ({ x: px, y: py, size })
          )
        : () => {}

    const pintar = () => {
        numero.setText(String(remaining))

        // no zero o par inteiro apaga: a criança vê que não sobrou nada
        const vazio = remaining <= 0
        icone.setAlpha(vazio ? 0.3 : 1)
        numero.setAlpha(vazio ? 0.3 : 1)
    }

    pintar()

    return {
        get remaining() {
            return remaining
        },

        get container() {
            return container
        },

        lose() {
            if (acabou || remaining <= 0) return

            remaining -= 1
            pintar()

            /*
             * A criança precisa VER a vida sair. Sem isto o número troca num
             * frame, longe de onde ela está olhando — que é o lugar do erro.
             */
            scene.tweens.add({
                targets: [icone, numero],
                scaleX: '*=1.35',
                scaleY: '*=1.35',
                duration: 130,
                yoyo: true,
                ease: 'Quad.easeOut',
            })

            if (remaining > 0) return

            acabou = true
            runtimeGameBridge.emit({
                type: 'GAME_OVER',
                gameId,
                stage: stage(),
            })
        },

        set(n: number) {
            remaining = Math.max(0, Math.min(total, n))
            acabou = remaining <= 0
            pintar()
        },

        destroy() {
            desligarAjuste()
            container.destroy(true)
        },
    }
}
