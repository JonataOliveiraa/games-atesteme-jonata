import Phaser from 'phaser'
import { FX, Ease } from '../../../../shared/effects/FX'
import { A, C, FONT, LETRA, RITMO, SIZE, hex } from '../data/theme'
import { AVISO, BANCADA, CENA, COLUNA, HUD, PRATELEIRA, TRILHA } from '../data/layout'
import { ACOES, CONDICOES, estadoDoObjeto } from '../data/casos'
import type { Mundo, Nivel, Peca } from '../types'

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  TUDO QUE DESENHA
 * ══════════════════════════════════════════════════════════════════════════
 *
 * A `GameScene` não desenha nada: se ela precisar de um `fillRoundedRect`,
 * falta um painter aqui. Todo `createX` devolve `{ container, ...métodos,
 * destroy() }` e ninguém de fora mexe nos filhos.
 *
 * ── A ARMADILHA DAS ZONAS DE TOQUE ───────────────────────────────────────
 *
 * A zona é um objeto de CENA solto, criado nas coordenadas absolutas passadas,
 * e ela NÃO acompanha tween nenhum. Isso é de propósito: um container que
 * cresce no toque comeria o clique na margem.
 *
 * Daí: nunca animar um container para longe da sua zona; nunca usar
 * `setVisible(false)` para desligar (o Phaser pula o teste de toque de todo
 * objeto que não renderiza — o interruptor é `zona.input.enabled`); e destruir
 * a lista de zonas na mão, senão as zonas do caso anterior comem os toques do
 * seguinte, invisíveis.
 */

export const temTex = (scene: Phaser.Scene, key: string) => scene.textures.exists(key)

/** Põe uma imagem cabendo numa caixa, sem deformar. `null` se a arte faltar. */
function posta(
  scene: Phaser.Scene,
  key: string,
  cx: number,
  cy: number,
  maxAlt: number,
  maxLarg = Number.POSITIVE_INFINITY
): Phaser.GameObjects.Image | null {
  if (!temTex(scene, key)) return null
  const img = scene.add.image(cx, cy, key)
  img.setScale(Math.min(maxAlt / img.height, maxLarg / img.width, 1))
  return img
}

/**
 * TODA letra do jogo passa por aqui: branca, contorno preto grosso.
 *
 * Não existe parâmetro de cor de propósito. A versão anterior escolhia a cor
 * pelo fundo e produziu um EXECUTAR preto sobre âmbar, ilegível. Ver `LETRA`
 * em `theme.ts`.
 */
function texto(
  scene: Phaser.Scene,
  x: number,
  y: number,
  txt: string,
  size: string,
  extra: Partial<Phaser.Types.GameObjects.Text.TextStyle> = {}
) {
  return scene.add
    .text(x, y, txt, {
      fontFamily: FONT.black,
      fontSize: size,
      color: hex(LETRA.cor),
      stroke: hex(LETRA.contorno),
      strokeThickness: LETRA.grossura,
      align: 'center',
      ...extra,
    })
    .setOrigin(0.5)
    .setResolution(2)
}

/** Placa ELEVADA: sombra embaixo, corpo, borda clara. Lê como "dá para pegar". */
function elevada(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  w: number,
  h: number,
  raio: number,
  cor: number,
  borda: number
) {
  g.fillStyle(C.sombra, A.sombra)
  g.fillRoundedRect(x + 4, y + 7, w, h, raio)
  g.fillStyle(cor, 1)
  g.fillRoundedRect(x, y, w, h, raio)
  g.lineStyle(3, borda, 0.95)
  g.strokeRoundedRect(x, y, w, h, raio)
}

/**
 * Buraco ESCAVADO: escuro por dentro, com um brilho na borda de baixo.
 *
 * É o oposto visual da placa elevada, e é o que separa a trilha da prateleira
 * sem precisar de um rótulo dizendo qual é qual.
 */
function escavado(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  w: number,
  h: number,
  raio: number,
  cor: number,
  alfa: number,
  borda: number
) {
  g.fillStyle(cor, alfa)
  g.fillRoundedRect(x, y, w, h, raio)
  /* a luz que bate na beirada de baixo do buraco */
  g.lineStyle(3, borda, 0.9)
  g.strokeRoundedRect(x, y, w, h, raio)
  g.lineStyle(2, C.branco, 0.12)
  g.lineBetween(x + raio, y + h - 2, x + w - raio, y + h - 2)
}

/** Como um bloco se lê. Duas linhas no máximo. */
export function rotuloDaPeca(p: Peca): string {
  if (p.tipo === 'acao') return ACOES[p.acao]?.rotulo ?? p.acao
  if (p.tipo === 'repetir') return `repetir ${p.vezes}x\n${ACOES[p.acao]?.rotulo ?? p.acao}`
  const cond = CONDICOES[p.condicao]?.rotulo ?? p.condicao
  return `se ${cond}\n${ACOES[p.entao]?.rotulo ?? p.entao}`
}

export function texturaDaPeca(p: Peca): string {
  if (p.tipo === 'acao') return ACOES[p.acao]?.textura ?? ''
  if (p.tipo === 'repetir') return ACOES[p.acao]?.textura ?? ''
  return ACOES[p.entao]?.textura ?? ''
}

/** A cor do bloco diz o TIPO dele antes de qualquer leitura. */
function tomDaPeca(p: Peca): number {
  if (p.tipo === 'acao') return C.madeira
  if (p.tipo === 'repetir') return C.latao
  return C.verde
}

/* ══════════════════════════════════════════════════════════════════════════
   O HUD — só o nível e o progresso
   ══════════════════════════════════════════════════════════════════════════ */

export interface Hud {
  container: Phaser.GameObjects.Container
  setNivel(numero: number, ideia: string): void
  setProgresso(feitos: number, total: number): void
  destroy(): void
}

export function createHud(scene: Phaser.Scene, aoTocarAjuda: () => void): Hud {
  const container = scene.add.container(0, 0).setDepth(40)
  const g = scene.add.graphics()
  container.add(g)

  g.fillStyle(C.madeiraEscura, 1)
  g.fillRect(HUD.x, HUD.y, HUD.w, HUD.h)
  g.fillStyle(C.latao, 1)
  g.fillRect(HUD.x, HUD.y + HUD.h - HUD.acento, HUD.w, HUD.acento)
  g.fillStyle(C.sombra, A.sombra)
  g.fillRect(HUD.x, HUD.y + HUD.h, HUD.w, 8)

  const rotuloNivel = texto(scene, HUD.nivel.x, HUD.nivel.cy, '', '24px').setOrigin(0, 0.5)
  container.add(rotuloNivel)

  const bolinhas = scene.add.graphics()
  container.add(bolinhas)

  const ajudaG = scene.add.graphics()
  elevada(
    ajudaG,
    HUD.ajuda.cx - HUD.ajuda.r,
    HUD.ajuda.cy - HUD.ajuda.r,
    HUD.ajuda.r * 2,
    HUD.ajuda.r * 2,
    HUD.ajuda.r,
    C.latao,
    C.creme
  )
  container.add(ajudaG)
  container.add(texto(scene, HUD.ajuda.cx, HUD.ajuda.cy, '?', SIZE.ajuda))

  const zonaAjuda = scene.add
    .zone(HUD.ajuda.cx, HUD.ajuda.cy, HUD.ajuda.r * 2, HUD.ajuda.r * 2)
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true })
    .setDepth(60)
  zonaAjuda.on('pointerdown', aoTocarAjuda)

  return {
    container,

    setNivel(numero, ideia) {
      rotuloNivel.setText(`NÍVEL ${numero} · ${ideia.toUpperCase()}`)
    },

    setProgresso(feitos, total) {
      bolinhas.clear()
      for (let i = 0; i < total; i++) {
        const aceso = i < feitos
        bolinhas.fillStyle(C.preto, 0.5)
        bolinhas.fillCircle(HUD.bolinha.x + i * HUD.bolinha.gap, HUD.bolinha.y + 1, HUD.bolinha.r + 2)
        bolinhas.fillStyle(aceso ? C.latao : C.fosco, 1)
        bolinhas.fillCircle(HUD.bolinha.x + i * HUD.bolinha.gap, HUD.bolinha.y, HUD.bolinha.r)
      }
    },

    destroy() {
      zonaAjuda.destroy()
      container.destroy(true)
    },
  }
}

/* ══════════════════════════════════════════════════════════════════════════
   A BANCADA — a placa onde tudo que é jogável vive
   ══════════════════════════════════════════════════════════════════════════ */

export function createBancada(scene: Phaser.Scene): Phaser.GameObjects.Container {
  const container = scene.add.container(0, 0).setDepth(5)
  const g = scene.add.graphics()
  container.add(g)
  elevada(g, BANCADA.x, BANCADA.y, BANCADA.w, BANCADA.h, BANCADA.raio, C.madeiraEscura, C.madeira)
  return container
}

/* ══════════════════════════════════════════════════════════════════════════
   A CENA — os objetos do problema, e o ESTADO de cada um
   ══════════════════════════════════════════════════════════════════════════ */

export interface Cena {
  container: Phaser.GameObjects.Container
  vestir(nivel: Nivel): void
  montar(objetos: string[], mundo: Mundo): void
  atualizar(mundo: Mundo): void
  /** O objeto age: sobe, faz, volta. Verde quando deu, coral quando recusou. */
  encenar(textura: string, ok: boolean): Promise<void>
  festejar(): Promise<void>
  destroy(): void
}

export function createCena(scene: Phaser.Scene): Cena {
  const container = scene.add.container(0, 0).setDepth(10)

  const moldura = scene.add.graphics()
  container.add(moldura)

  let imgFundo: Phaser.GameObjects.Image | null = null
  let veu: Phaser.GameObjects.Graphics | null = null

  type Objeto = {
    textura: string
    img: Phaser.GameObjects.Image
    faixa: Phaser.GameObjects.Graphics
    rotulo: Phaser.GameObjects.Text
    cyBase: number
  }
  let objetos: Objeto[] = []

  const desenharMoldura = () => {
    moldura.clear()
    escavado(moldura, CENA.x, CENA.y, CENA.w, CENA.h, CENA.raio, C.ink, 0.5, C.latao)
  }
  desenharMoldura()

  const limpar = () => {
    objetos.forEach((o) => {
      FX.kill(scene, o.img)
      o.img.destroy()
      o.faixa.destroy()
      o.rotulo.destroy()
    })
    objetos = []
  }

  const pintarFaixa = (o: Objeto, txt: string) => {
    const y = o.cyBase + CENA.estado.dy
    o.faixa.clear()
    elevada(
      o.faixa,
      o.img.x - CENA.estado.w / 2,
      y - CENA.estado.h / 2,
      CENA.estado.w,
      CENA.estado.h,
      CENA.estado.raio,
      C.madeiraEscura,
      C.latao
    )
    o.rotulo.setText(txt).setPosition(o.img.x, y)
  }

  return {
    container,

    vestir(nivel) {
      imgFundo?.destroy()
      veu?.destroy()

      const chave = nivel.palco === 'sala' ? 'bg-sala-treino' : 'bg-academia-hub'
      imgFundo = posta(scene, chave, CENA.x + CENA.w / 2, CENA.y + CENA.h / 2, 4000, 4000)

      if (imgFundo) {
        imgFundo.setScale(Math.max(CENA.w / imgFundo.width, CENA.h / imgFundo.height))
        /* `preFX` só existe no WebGL; o `?.` cobre o Canvas. Blur fraco de
           propósito: blur forte lê como defeito de arte. */
        imgFundo.preFX?.addBlur(1, 2, 2, 0.4)
        container.addAt(imgFundo, 0)

        veu = scene.add.graphics()
        veu.fillStyle(C.ink, A.veu)
        veu.fillRoundedRect(CENA.x, CENA.y, CENA.w, CENA.h, CENA.raio)
        container.addAt(veu, 1)
      }

      desenharMoldura()
    },

    montar(ids, mundo) {
      limpar()

      const n = ids.length
      const largura = n * CENA.objeto.tamanho + (n - 1) * CENA.objeto.gap
      const x0 = CENA.x + (CENA.w - largura) / 2 + CENA.objeto.tamanho / 2

      ids.forEach((tex, i) => {
        const cx = x0 + i * (CENA.objeto.tamanho + CENA.objeto.gap)
        const img = posta(scene, tex, cx, CENA.objeto.cy, CENA.objeto.tamanho, CENA.objeto.tamanho)
        if (!img) return

        const faixa = scene.add.graphics()
        const rotulo = texto(scene, cx, CENA.objeto.cy + CENA.estado.dy, '', SIZE.estado)

        container.add(faixa)
        container.add(img)
        container.add(rotulo)

        const o: Objeto = { textura: tex, img, faixa, rotulo, cyBase: CENA.objeto.cy }
        objetos.push(o)

        pintarFaixa(o, estadoDoObjeto(tex, mundo) ?? '')
        void FX.popIn(scene, img, { delay: i * 90 })
      })
    },

    atualizar(mundo) {
      objetos.forEach((o) => pintarFaixa(o, estadoDoObjeto(o.textura, mundo) ?? ''))
    },

    /**
     * A BATIDA ENCENADA.
     *
     * O objeto da vez SOBE, faz o que tem que fazer, e volta. O olho segue
     * quem se mexeu, e quem se mexeu é exatamente o passo que está rodando —
     * é o que amarra a trilha lá embaixo ao que acontece aqui em cima.
     */
    async encenar(textura, ok) {
      const o = objetos.find((x) => x.textura === textura)
      if (!o) {
        await FX.wait(scene, RITMO.batida * 0.4)
        return
      }

      const alvoY = o.cyBase + CENA.foco.dy
      await FX.to(scene, o.img, { y: alvoY }, { duration: 190, ease: Ease.back(2) })

      if (ok) {
        await FX.all(
          FX.impact(scene, o.img, 0.2),
          FX.ping(scene, o.img.x, alvoY, C.verde, { radius: 62 })
        )
      } else {
        await FX.nope(scene, o.img)
      }

      await FX.to(scene, o.img, { y: o.cyBase }, { duration: 190, ease: Ease.smooth })
    },

    async festejar() {
      await FX.all(
        FX.confetti(scene, { colors: [C.latao, C.verde, C.creme, C.madeira] }),
        ...objetos.map((o, i) =>
          FX.wait(scene, i * 100).then(() => FX.impact(scene, o.img, 0.24))
        )
      )
    },

    destroy() {
      limpar()
      imgFundo?.destroy()
      veu?.destroy()
      container.destroy(true)
    },
  }
}

/* ══════════════════════════════════════════════════════════════════════════
   O AVISO — a frase do que travou, em linha própria
   ══════════════════════════════════════════════════════════════════════════ */

export interface Aviso {
  container: Phaser.GameObjects.Container
  mostrar(frase: string, tom: 'erro' | 'certo'): Promise<void>
  esvaziar(): void
  destroy(): void
}

/**
 * MÓVEL FIXO, CONTEÚDO TROCÁVEL.
 *
 * A moldura nasce na `create()` e nunca sai: aparecer e sumir a cada erro
 * deixa a tela inquieta e tira o endereço fixo da mensagem. Ela só esvazia.
 */
export function createAviso(scene: Phaser.Scene): Aviso {
  const container = scene.add.container(0, 0).setDepth(35).setAlpha(0)
  const g = scene.add.graphics()
  container.add(g)

  const frase = texto(scene, AVISO.cx, AVISO.cy, '', SIZE.aviso, {
    wordWrap: { width: AVISO.w - 44 },
  })
  container.add(frase)

  return {
    container,

    async mostrar(txt, tom) {
      const cor = tom === 'erro' ? C.coral : C.verde
      g.clear()
      elevada(
        g,
        AVISO.cx - AVISO.w / 2,
        AVISO.cy - AVISO.h / 2,
        AVISO.w,
        AVISO.h,
        AVISO.raio,
        C.ink,
        cor
      )
      frase.setText(txt)
      await FX.to(scene, container, { alpha: 1 }, { duration: 200 })
    },

    esvaziar() {
      container.setAlpha(0)
      frase.setText('')
      g.clear()
    },

    destroy() {
      container.destroy(true)
    },
  }
}

/* ══════════════════════════════════════════════════════════════════════════
   A TRILHA — espaços ESCAVADOS ligados por setas
   ══════════════════════════════════════════════════════════════════════════ */

export interface Trilha {
  container: Phaser.GameObjects.Container
  montar(espacos: number): void
  por(indice: number, peca: Peca): void
  tirar(indice: number): Peca | null
  primeiroVazio(): number
  pecas(): (Peca | null)[]
  posDoEspaco(indice: number): { x: number; y: number }
  setAtiva(on: boolean): void
  acender(indice: number, volta?: { atual: number; de: number }): Promise<void>
  travar(indice: number): Promise<void>
  /** A onda de luz que percorre a trilha quando o algoritmo fecha. */
  celebrar(): Promise<void>
  apagar(): void
  destroy(): void
}

export function createTrilha(
  scene: Phaser.Scene,
  aoTocarEspaco: (indice: number) => void
): Trilha {
  const container = scene.add.container(0, 0).setDepth(20)
  const g = scene.add.graphics()
  container.add(g)

  let espacos = 0
  let conteudo: (Peca | null)[] = []
  let aceso = -1
  let culpado = -1
  let ativa = true

  const filhos: Phaser.GameObjects.GameObject[] = []
  const zonas: Phaser.GameObjects.Zone[] = []

  const cabeca = scene.add.graphics().setDepth(30)
  container.add(cabeca)

  const xDe = (i: number) => {
    const total = espacos * TRILHA.larguraEspaco + (espacos - 1) * TRILHA.gap
    const x0 = BANCADA.x + (BANCADA.w - total) / 2 + TRILHA.larguraEspaco / 2
    return x0 + i * (TRILHA.larguraEspaco + TRILHA.gap)
  }

  /**
   * Repintar `Graphics` é barato; recriar `Image` e `Text` não é.
   *
   * A moldura é redesenhada sempre e os filhos só quando a ASSINATURA do que
   * está desenhado muda. Sem isso, uma trilha de quatro espaços recria oito
   * objetos a cada quadro da execução.
   */
  let assinatura = ''

  const pintar = () => {
    g.clear()

    for (let i = 0; i < espacos; i++) {
      const cx = xDe(i)
      const peca = conteudo[i]
      const x = cx - TRILHA.larguraEspaco / 2
      const y = TRILHA.cy - TRILHA.alturaEspaco / 2

      if (!peca) {
        /* buraco vazio: escuro e afundado, convidando a encaixar */
        escavado(g, x, y, TRILHA.larguraEspaco, TRILHA.alturaEspaco, TRILHA.raio, C.ink, A.vazio, C.madeira)
      } else {
        const tom = i === culpado ? C.coral : i === aceso ? C.latao : tomDaPeca(peca)
        elevada(g, x, y, TRILHA.larguraEspaco, TRILHA.alturaEspaco, TRILHA.raio, tom, C.creme)
      }

      /*
       * A SETA ENTRE UM PASSO E O SEGUINTE.
       *
       * É o que faz a fila de caixas ler como SEQUÊNCIA. Sem ela, a trilha e a
       * prateleira eram duas fileiras iguais de caixas marrons e nada dizia
       * qual era qual.
       */
      if (i < espacos - 1) {
        const meio = cx + TRILHA.larguraEspaco / 2 + TRILHA.gap / 2
        g.fillStyle(C.latao, 0.9)
        g.fillTriangle(
          meio - TRILHA.seta.largura / 2, TRILHA.cy - TRILHA.seta.altura / 2,
          meio - TRILHA.seta.largura / 2, TRILHA.cy + TRILHA.seta.altura / 2,
          meio + TRILHA.seta.largura / 2, TRILHA.cy
        )
      }

      /* o número do passo, numa moeda na quina */
      const nx = cx + TRILHA.numero.dx
      const ny = TRILHA.cy + TRILHA.numero.dy
      g.fillStyle(C.preto, 0.55)
      g.fillCircle(nx, ny + 2, TRILHA.numero.r + 2)
      g.fillStyle(peca ? C.latao : C.fosco, 1)
      g.fillCircle(nx, ny, TRILHA.numero.r)
    }
  }

  const refazerFilhos = () => {
    const nova = conteudo.map((p) => (p ? rotuloDaPeca(p) : '.')).join('|') + '#' + espacos
    if (nova === assinatura) return
    assinatura = nova

    filhos.forEach((f) => f.destroy())
    filhos.length = 0

    for (let i = 0; i < espacos; i++) {
      const cx = xDe(i)

      const numero = texto(
        scene,
        cx + TRILHA.numero.dx,
        TRILHA.cy + TRILHA.numero.dy,
        String(i + 1),
        SIZE.numero
      )
      filhos.push(numero)
      container.add(numero)

      const peca = conteudo[i]
      if (!peca) continue

      const img = posta(scene, texturaDaPeca(peca), cx, TRILHA.cy - 16, 46, 46)
      if (img) {
        filhos.push(img)
        container.add(img)
      }

      const rot = texto(scene, cx, TRILHA.cy + 28, rotuloDaPeca(peca), SIZE.bloco, {
        wordWrap: { width: TRILHA.larguraEspaco - 20 },
      })
      filhos.push(rot)
      container.add(rot)
    }
  }

  return {
    container,

    montar(n) {
      espacos = n
      conteudo = new Array(n).fill(null)
      aceso = -1
      culpado = -1
      assinatura = ''

      zonas.forEach((z) => z.destroy())
      zonas.length = 0

      for (let i = 0; i < n; i++) {
        const z = scene.add
          .zone(xDe(i), TRILHA.cy, TRILHA.larguraEspaco, TRILHA.alturaEspaco)
          .setOrigin(0.5)
          .setInteractive({ useHandCursor: true })
          .setDepth(60)
        z.on('pointerdown', () => {
          if (ativa) aoTocarEspaco(i)
        })
        zonas.push(z)
      }

      pintar()
      refazerFilhos()
      cabeca.clear()
    },

    por(i, peca) {
      conteudo[i] = peca
      pintar()
      refazerFilhos()
    },

    tirar(i) {
      const p = conteudo[i]
      conteudo[i] = null
      pintar()
      refazerFilhos()
      return p
    },

    primeiroVazio: () => conteudo.findIndex((p) => p === null),
    pecas: () => [...conteudo],
    posDoEspaco: (i) => ({ x: xDe(i), y: TRILHA.cy }),

    /*
     * O interruptor é `input.enabled`, NUNCA `setVisible(false)`.
     *
     * Uma `Zone` não desenha nada, então esconder parece inofensivo — e o
     * teste de toque do Phaser pula todo objeto cujo `willRender` é falso. A
     * zona some para sempre e ninguém entende por quê.
     */
    setAtiva(on) {
      ativa = on
      zonas.forEach((z) => {
        if (z.input) z.input.enabled = on
      })
    },

    async acender(i, volta) {
      aceso = i
      culpado = -1
      pintar()

      const cx = xDe(i)
      const cy = TRILHA.cy + TRILHA.cabeca.dy

      cabeca.clear()
      cabeca.fillStyle(C.preto, 0.5)
      cabeca.fillCircle(cx, cy + 2, TRILHA.cabeca.r + 6)
      cabeca.fillStyle(C.latao, 1)
      cabeca.fillCircle(cx, cy, TRILHA.cabeca.r)
      cabeca.lineStyle(3, C.branco, 0.95)
      cabeca.strokeCircle(cx, cy, TRILHA.cabeca.r + 6)

      if (volta) {
        await FX.popText(scene, cx, cy - 36, `${volta.atual}/${volta.de}`, {
          color: hex(C.branco),
          size: SIZE.numero,
        })
        return
      }

      await FX.wait(scene, RITMO.batida * 0.3)
    },

    async travar(i) {
      culpado = i
      aceso = -1
      pintar()
      await FX.all(
        FX.ping(scene, xDe(i), TRILHA.cy, C.coral, { radius: 96 }),
        FX.wait(scene, RITMO.travou)
      )
    },

    /** Uma onda de luz da esquerda para a direita: o algoritmo fechou. */
    async celebrar() {
      cabeca.clear()
      aceso = -1
      culpado = -1
      pintar()

      for (let i = 0; i < espacos; i++) {
        if (!conteudo[i]) continue
        void FX.ping(scene, xDe(i), TRILHA.cy, C.verde, { radius: 80 })
        await FX.wait(scene, 130)
      }
    },

    apagar() {
      aceso = -1
      culpado = -1
      cabeca.clear()
      pintar()
    },

    destroy() {
      zonas.forEach((z) => z.destroy())
      zonas.length = 0
      container.destroy(true)
    },
  }
}

/* ══════════════════════════════════════════════════════════════════════════
   A PRATELEIRA — cartões ELEVADOS sobre uma tábua
   ══════════════════════════════════════════════════════════════════════════ */

export interface Prateleira {
  container: Phaser.GameObjects.Container
  montar(pecas: Peca[]): void
  posDoCartao(indice: number): { x: number; y: number }
  setAtiva(on: boolean): void
  destroy(): void
}

export function createPrateleira(
  scene: Phaser.Scene,
  aoTocarBloco: (peca: Peca, indice: number) => void
): Prateleira {
  const container = scene.add.container(0, 0).setDepth(20)
  const g = scene.add.graphics()
  container.add(g)

  let pecas: Peca[] = []
  let ativa = true
  const filhos: Phaser.GameObjects.GameObject[] = []
  const zonas: Phaser.GameObjects.Zone[] = []

  const xDe = (i: number) => {
    const total = pecas.length * PRATELEIRA.largura + (pecas.length - 1) * PRATELEIRA.gap
    const x0 = BANCADA.x + (BANCADA.w - total) / 2 + PRATELEIRA.largura / 2
    return x0 + i * (PRATELEIRA.largura + PRATELEIRA.gap)
  }

  const pintar = () => {
    g.clear()

    /* a tábua: é ela que faz os cartões lerem como "coisas em cima de algo" */
    g.fillStyle(C.madeira, 0.85)
    g.fillRoundedRect(
      BANCADA.x + BANCADA.pad,
      PRATELEIRA.tabua.y,
      BANCADA.w - BANCADA.pad * 2,
      PRATELEIRA.tabua.h,
      PRATELEIRA.tabua.h / 2
    )

    pecas.forEach((p, i) => {
      const cx = xDe(i)
      elevada(
        g,
        cx - PRATELEIRA.largura / 2,
        PRATELEIRA.cy - PRATELEIRA.altura / 2,
        PRATELEIRA.largura,
        PRATELEIRA.altura,
        PRATELEIRA.raio,
        ativa ? tomDaPeca(p) : C.fosco,
        ativa ? C.creme : C.madeiraEscura
      )
    })
  }

  return {
    container,

    montar(novas) {
      pecas = novas
      filhos.forEach((f) => f.destroy())
      filhos.length = 0
      zonas.forEach((z) => z.destroy())
      zonas.length = 0

      pintar()

      pecas.forEach((p, i) => {
        const cx = xDe(i)

        const img = posta(
          scene,
          texturaDaPeca(p),
          cx,
          PRATELEIRA.cy + PRATELEIRA.icone.dy,
          PRATELEIRA.icone.tamanho,
          PRATELEIRA.icone.tamanho
        )
        if (img) {
          filhos.push(img)
          container.add(img)
        }

        const rot = texto(
          scene,
          cx,
          PRATELEIRA.cy + PRATELEIRA.rotulo.dy,
          rotuloDaPeca(p),
          SIZE.bloco,
          { wordWrap: { width: PRATELEIRA.largura - 20 } }
        )
        filhos.push(rot)
        container.add(rot)

        /*
         * Zona SOLTA, criada no lugar definitivo.
         *
         * O cartão encolhe no toque, e um container que muda de escala comeria
         * o clique na margem se a zona fosse filha dele.
         */
        const z = scene.add
          .zone(cx, PRATELEIRA.cy, PRATELEIRA.largura, PRATELEIRA.altura)
          .setOrigin(0.5)
          .setInteractive({ useHandCursor: true })
          .setDepth(60)
        z.on('pointerdown', () => {
          if (!ativa) return
          if (img) void FX.press(scene, img)
          aoTocarBloco(p, i)
        })
        zonas.push(z)

        void FX.popIn(scene, rot, { delay: i * 70 })
      })
    },

    posDoCartao: (i) => ({ x: xDe(i), y: PRATELEIRA.cy }),

    setAtiva(on) {
      ativa = on
      pintar()
      zonas.forEach((z) => {
        if (z.input) z.input.enabled = on
      })
    },

    destroy() {
      zonas.forEach((z) => z.destroy())
      zonas.length = 0
      container.destroy(true)
    },
  }
}

/**
 * O BLOCO VOANDO DA PRATELEIRA ATÉ A TRILHA.
 *
 * Um fantasma do cartão sai de onde a criança tocou e pousa no espaço. É
 * pouco código e resolve uma coisa importante: sem ele, o bloco simplesmente
 * APARECE na trilha, e quem tocou não tem certeza de que foi o toque dela que
 * fez aquilo — ainda mais numa tela com dois lugares parecidos.
 */
export async function voarAteATrilha(
  scene: Phaser.Scene,
  peca: Peca,
  de: { x: number; y: number },
  para: { x: number; y: number }
): Promise<void> {
  const img = posta(scene, texturaDaPeca(peca), de.x, de.y, 56, 56)
  if (!img) return

  img.setDepth(70)
  await FX.arcTo(scene, img, { x: para.x, y: para.y }, { duration: RITMO.voo, height: 90 })
  img.destroy()
}

/* ══════════════════════════════════════════════════════════════════════════
   A COLUNA DO TREINADOR — fala, botão e personagem
   ══════════════════════════════════════════════════════════════════════════ */

export interface Coluna {
  container: Phaser.GameObjects.Container
  setPedido(frase: string): void
  setHumor(humor: 'normal' | 'feliz' | 'pensando'): void
  setBotao(ligado: boolean, rotulo?: string): void
  destroy(): void
}

export function createColuna(scene: Phaser.Scene, aoExecutar: () => void): Coluna {
  const container = scene.add.container(0, 0).setDepth(20)

  let imgTreinador: Phaser.GameObjects.Image | null = null
  let ligado = false

  /* ── o balão ─────────────────────────────────────────────────── */

  const balao = scene.add.graphics()
  container.add(balao)

  const pedido = scene.add
    .text(COLUNA.cx, COLUNA.balao.cy, '', {
      fontFamily: FONT.black,
      fontSize: `${SIZE.pedido}px`,
      color: hex(LETRA.cor),
      stroke: hex(LETRA.contorno),
      strokeThickness: LETRA.grossura,
      align: 'center',
      wordWrap: { width: COLUNA.balao.w - 48 },
    })
    .setOrigin(0.5)
    .setResolution(2)
  container.add(pedido)

  const pintarBalao = () => {
    const h = Phaser.Math.Clamp(pedido.getBounds().height + 48, COLUNA.balao.hMin, COLUNA.balao.hMax)
    const y = COLUNA.balao.cy - h / 2
    balao.clear()
    elevada(balao, COLUNA.cx - COLUNA.balao.w / 2, y, COLUNA.balao.w, h, COLUNA.balao.raio, C.madeiraEscura, C.latao)
    /* o rabicho, apontando para o treinador embaixo */
    balao.fillStyle(C.madeiraEscura, 1)
    balao.fillTriangle(COLUNA.cx - 18, y + h - 2, COLUNA.cx + 18, y + h - 2, COLUNA.cx, y + h + 22)
  }

  /* ── o botão ─────────────────────────────────────────────────── */

  const botaoG = scene.add.graphics()
  container.add(botaoG)
  const botaoTxt = texto(scene, COLUNA.cx, COLUNA.botao.cy, 'EXECUTAR', SIZE.botao)
  container.add(botaoTxt)

  /**
   * Repinta SEMPRE, mesmo sem mudança.
   *
   * A cor da LETRA não entra nesta conta: ela é branca com contorno preto em
   * qualquer estado. Era justamente o cálculo "letra escura sobre botão claro"
   * que produziu o EXECUTAR ilegível da versão anterior.
   */
  const pintarBotao = () => {
    botaoG.clear()
    elevada(
      botaoG,
      COLUNA.cx - COLUNA.botao.w / 2,
      COLUNA.botao.cy - COLUNA.botao.h / 2,
      COLUNA.botao.w,
      COLUNA.botao.h,
      COLUNA.botao.raio,
      ligado ? C.latao : C.fosco,
      ligado ? C.branco : C.madeiraEscura
    )
    botaoTxt.setAlpha(ligado ? 1 : 0.45)
  }
  pintarBotao()

  const zona = scene.add
    .zone(COLUNA.cx, COLUNA.botao.cy, COLUNA.botao.w, COLUNA.botao.h)
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true })
    .setDepth(60)
  zona.on('pointerdown', () => {
    if (!ligado) return
    void FX.press(scene, botaoTxt)
    aoExecutar()
  })

  return {
    container,

    setPedido(frase) {
      pedido.setText(frase)
      let tamanho = SIZE.pedido
      pedido.setFontSize(tamanho)
      while (pedido.getBounds().height > COLUNA.balao.hMax - 48 && tamanho > SIZE.pedidoMin) {
        tamanho -= 2
        pedido.setFontSize(tamanho)
      }
      pintarBalao()
    },

    setHumor(humor) {
      imgTreinador?.destroy()
      imgTreinador = posta(
        scene,
        `treinador-${humor}`,
        COLUNA.cx,
        COLUNA.treinador.cy,
        COLUNA.treinador.h,
        COLUNA.treinador.w
      )
      if (imgTreinador) {
        container.add(imgTreinador)
        void FX.popIn(scene, imgTreinador, { from: 0.95, duration: 220 })
      }
    },

    setBotao(on, rotulo) {
      ligado = on
      if (rotulo) botaoTxt.setText(rotulo)
      pintarBotao()
      if (zona.input) zona.input.enabled = on
    },

    destroy() {
      zona.destroy()
      imgTreinador?.destroy()
      container.destroy(true)
    },
  }
}
