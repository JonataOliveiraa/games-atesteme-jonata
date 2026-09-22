import Phaser from 'phaser'
import {
    ARVORES,
    CASAS,
    CASA_ALTURA,
    CASA_POR_ID,
    HORIZONTE,
    IGREJA,
    MORRO,
    MORROS,
    PRACA,
    RAMO_NOME,
    TERRACOS,
    TRECHOS,
    W,
    WORLD,
    NOS,
    NO_POR_ID,
} from '../data/layout'
import { C, FONT, HEX } from '../data/theme'
import { boxOf, cutSheet, type Sheet } from './sheet'
import type { Ferramenta } from '../types'

export type EstadoCasa = 'escura' | 'marcada' | 'acesa'

/** O mesmo formato que a corrida usa para uma bifurcação e para um pouso. */
export interface Opcao {
    chave: string
    x: number
    y: number
    rotulo: string
}

export interface Vila {
    panZone: Phaser.GameObjects.Zone
    marcar(ids: string[]): void
    /** Marca uma a uma, com pulinho: a entrada do problema é vista, não lida. */
    apresentar(ids: string[], aCada: (i: number) => void): Promise<void>
    /** Uma linha leve no alto. NÃO é painel: não tampa nada e não pede toque. */
    recado(texto: string): void
    limparRecado(): void
    acender(id: string): void
    apagarTudo(): void
    pulsarEscuras(ids: string[]): void
    previewCirculo(
        x: number,
        y: number,
        f: Ferramenta,
        caminho: Array<{ de: string; para: string }>,
    ): void
    limparPreview(): void
    circulo(x: number, y: number, raio: number): void
    esconderCirculo(): void
    somaRastro(x: number, y: number): void
    limparRastro(): void
    congelarRastro(): void
    falar(titulo: string, corpo: string, tom: 'fala' | 'aviso' | 'bom', vizinho: number): void
    calar(): void
    perguntar(opcoes: Opcao[], onPick: (chave: string) => void): void
    fecharPergunta(): void
    pontoDaCasa(id: string): { x: number; y: number }
    atualizarCeu(scrollX: number): void
    destroy(): void
}

const ondular = (x: number) => Math.sin(x * 0.0042) * 9 + Math.sin(x * 0.011) * 4

export function createVila(scene: Phaser.Scene): Vila {
    // ── 1. o céu, parado, com as nuvens andando devagar ───────────────────
    const ceu = scene.add
        .tileSprite(0, 0, W, HORIZONTE + 30, 'ceu')
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setDepth(0)
    if (!scene.textures.exists('ceu')) ceu.setVisible(false)

    const ceuLiso = scene.add.graphics().setScrollFactor(0).setDepth(-1)
    ceuLiso.fillStyle(C.ceu, 1)
    ceuLiso.fillRect(0, 0, W, HORIZONTE + 30)

    // ── 2. os morros do fundo, em paralaxe ────────────────────────────────
    const fundo = scene.add.graphics().setScrollFactor(0.55).setDepth(1)
    const tons = [0x8fa86a, 0x7d975c]
    for (const m of MORROS) {
        fundo.fillStyle(tons[m.tom], 1)
        fundo.beginPath()
        fundo.moveTo(m.x, m.y + m.h)
        fundo.lineTo(m.x + m.w * 0.2, m.y + m.h * 0.28)
        fundo.lineTo(m.x + m.w * 0.42, m.y)
        fundo.lineTo(m.x + m.w * 0.68, m.y + m.h * 0.34)
        fundo.lineTo(m.x + m.w, m.y + m.h)
        fundo.closePath()
        fundo.fillPath()
    }

    // ── 3. o chão, o morro e os terraços ──────────────────────────────────
    const chao = scene.add.graphics().setDepth(2)

    chao.fillStyle(C.terra, 1)
    chao.beginPath()
    chao.moveTo(-120, WORLD.h + 20)
    for (let x = -120; x <= WORLD.w + 120; x += 30) chao.lineTo(x, HORIZONTE + ondular(x))
    chao.lineTo(WORLD.w + 120, WORLD.h + 20)
    chao.closePath()
    chao.fillPath()

    chao.lineStyle(5, C.ink, 0.5)
    chao.beginPath()
    chao.moveTo(-120, HORIZONTE + ondular(-120))
    for (let x = -120; x <= WORLD.w + 120; x += 30) chao.lineTo(x, HORIZONTE + ondular(x))
    chao.strokePath()

    /*
     * O morro: uma massa verde que sobe para a direita, com degraus.
     *
     * O PÉ DELE É UMA RAMPA, e não um corte. Enquanto o polígono começava em
     * (x0, base), o preenchimento descia reto até o fim do mundo e o morro
     * aparecia com uma parede vertical de 250 px na frente — um corte de
     * terreno no meio do caminho plano. Agora ele vem de fora da tela, lá de
     * baixo, e encosta no chão sem costura.
     */
    chao.fillStyle(0x86a05f, 1)
    chao.beginPath()
    chao.moveTo(MORRO.x0 - 320, WORLD.h + 20)
    chao.lineTo(MORRO.x0 - 130, MORRO.base + 58)
    chao.lineTo(MORRO.x0, MORRO.base)
    chao.lineTo(MORRO.x0 + 250, MORRO.base - 90)
    chao.lineTo(MORRO.x0 + 580, MORRO.topo + 130)
    chao.lineTo(MORRO.x0 + 960, MORRO.topo + 38)
    chao.lineTo(MORRO.x0 + 1240, MORRO.topo)
    chao.lineTo(MORRO.x1, MORRO.topo - 10)
    chao.lineTo(MORRO.x1, WORLD.h + 20)
    chao.lineTo(MORRO.x0, WORLD.h + 20)
    chao.closePath()
    chao.fillPath()

    chao.lineStyle(5, C.ink, 0.55)
    chao.beginPath()
    chao.moveTo(MORRO.x0 - 320, WORLD.h + 20)
    chao.lineTo(MORRO.x0 - 130, MORRO.base + 58)
    chao.lineTo(MORRO.x0, MORRO.base)
    chao.lineTo(MORRO.x0 + 250, MORRO.base - 90)
    chao.lineTo(MORRO.x0 + 580, MORRO.topo + 130)
    chao.lineTo(MORRO.x0 + 960, MORRO.topo + 38)
    chao.lineTo(MORRO.x0 + 1240, MORRO.topo)
    chao.lineTo(MORRO.x1, MORRO.topo - 10)
    chao.strokePath()

    for (const t of TERRACOS) {
        chao.fillStyle(0x93ad69, 1)
        chao.fillRect(t.x0, t.y, t.x1 - t.x0, 26)
        chao.lineStyle(4, C.ink, 0.35)
        chao.lineBetween(t.x0, t.y, t.x1, t.y)
    }

    // ── 4. o chão da praça e o poste do sino ──────────────────────────────
    /*
     * NENHUMA CONSTRUÇÃO É DESENHADA AQUI, E NENHUM ENFEITE TAMBÉM.
     *
     * A única casa deste jogo é a de `casas.png`, e prédio desenhado em código
     * ao lado dela vira outro jogo dentro do jogo. Depois saíram também os
     * arbustos e as cercas: eram doze tufos de mato disputando o olho com as
     * doze casas que a criança precisa contar, num chão que já tem morro,
     * terraço, praça e estrada.
     *
     * Ficou só o que é ENDEREÇO: a laje da praça com seus bancos, e o poste do
     * sino. Os dois são pontos de plantio, e cada um é marcado pelo que ele é.
     */
    const vilarejo = scene.add.graphics().setDepth(3)

    /*
     * A LAJE FICA NA FRENTE DA ESTRADA, e não debaixo dela.
     *
     * Ela estava centrada no mesmo y do nó `p`, com a estrada passando pelo
     * meio: de longe virava uma poça pálida no meio do caminho. Descendo 45 px,
     * a estrada raspa a beirada de cima e a praça lê como o que é — o largo na
     * frente das casas, onde o telão e o quadro se plantam. O ponto de plantio
     * (`PRACA`) não se mexe: quem mudou foi só o desenho.
     */
    const lajeY = PRACA.y + 45
    vilarejo.fillStyle(0xe4d6b8, 1)
    vilarejo.fillEllipse(PRACA.x, lajeY, 400, 84)
    vilarejo.lineStyle(5, C.ink, 0.3)
    vilarejo.strokeEllipse(PRACA.x, lajeY, 400, 84)
    vilarejo.fillStyle(0xd6c4a2, 1)
    vilarejo.fillEllipse(PRACA.x, lajeY + 4, 268, 52)

    for (const dx of [-140, 92]) {
        vilarejo.fillStyle(0x6d8a53, 1)
        vilarejo.fillRect(PRACA.x + dx, lajeY + 6, 52, 10)
        vilarejo.fillRect(PRACA.x + dx + 4, lajeY + 16, 8, 14)
        vilarejo.fillRect(PRACA.x + dx + 40, lajeY + 16, 8, 14)
        vilarejo.lineStyle(4, C.ink, 0.7)
        vilarejo.strokeRect(PRACA.x + dx, lajeY + 6, 52, 10)
    }

    /*
     * O POSTE DO SINO FICA ACIMA DA ESTRADA (depth 6), e não junto do chão.
     *
     * Ele estava no mesmo Graphics da laje, no depth 3, e a estrada (depth 5)
     * passava por cima: o sino da vila aparecia enterrado no barro. Laje é
     * chão e se deixa pisar; poste é coisa em pé, e coisa em pé fica na frente.
     */
    const poste = scene.add.graphics().setDepth(6)
    poste.lineStyle(9, 0x8a6a45, 1)
    poste.lineBetween(IGREJA.x, IGREJA.y + 14, IGREJA.x, IGREJA.y - 96)
    poste.lineBetween(IGREJA.x - 30, IGREJA.y - 96, IGREJA.x + 12, IGREJA.y - 96)
    poste.lineStyle(5, C.ink, 0.5)
    poste.lineBetween(IGREJA.x - 22, IGREJA.y + 14, IGREJA.x + 22, IGREJA.y + 14)

    /* o sino pendurado no poste — arte do baralho, não construção nova */
    const sheetFerr: Sheet | null = cutSheet(scene, 'ferramentas', 4, 3)
    let sinoMarco: Phaser.GameObjects.Image | undefined
    if (scene.textures.exists('ferramentas') && sheetFerr) {
        const box = boxOf(sheetFerr, 6)
        const escala = 74 / (box.height * sheetFerr.frameH)
        const dx = (box.left + box.width / 2 - 0.5) * sheetFerr.frameW * escala
        const dy = (box.top + box.height / 2 - 0.5) * sheetFerr.frameH * escala
        sinoMarco = scene.add
            .image(IGREJA.x - 9 - dx, IGREJA.y - 64 - dy, 'ferramentas', '6')
            .setOrigin(0.5)
            .setScale(escala)
            .setDepth(7)
    }

    // ── 5. as árvores ─────────────────────────────────────────────────────
    const arvores: Phaser.GameObjects.Image[] = []
    if (scene.textures.exists('arvore')) {
        for (const a of ARVORES) {
            arvores.push(
                scene.add
                    .image(a.x, a.y, 'arvore')
                    .setOrigin(0.5, 1)
                    .setScale(a.s * 0.62)
                    .setDepth(a.y > 460 ? 12 : 4),
            )
        }
    }

    // ── 6. a estrada ──────────────────────────────────────────────────────
    /*
     * A ESTRADA É O CAMINHO QUE A FERRAMENTA VAI FAZER, e por isso ela precisa
     * ler como UMA coisa, e não como onze riscos emendados.
     *
     * A de antes era um traço grosso com um fio claro 6 px acima, o que dava a
     * cada trecho um contorno duplo e um bico em cada nó. Agora são três
     * passadas pela mesma linha — sombra no chão, leito de terra batida e o
     * miolo claro —, e um círculo cheio em cada nó, que é o que arredonda a
     * emenda. Por cima, as marcas de roda tracejadas: é o tracejado que faz
     * uma faixa parada parecer um caminho que leva a algum lugar.
     */
    const estrada = scene.add.graphics().setDepth(5)

    const CAMADAS = [
        { w: 48, cor: C.ink, alpha: 0.12, dy: 9 },
        { w: 42, cor: C.terraEscura, alpha: 1, dy: 0 },
        { w: 30, cor: C.estrada, alpha: 1, dy: 0 },
    ]
    for (const camada of CAMADAS) {
        estrada.lineStyle(camada.w, camada.cor, camada.alpha)
        for (const t of TRECHOS) {
            const a = NO_POR_ID[t.de]
            const b = NO_POR_ID[t.para]
            estrada.lineBetween(a.x, a.y + camada.dy, b.x, b.y + camada.dy)
        }
        estrada.fillStyle(camada.cor, camada.alpha)
        for (const no of NOS) estrada.fillCircle(no.x, no.y + camada.dy, camada.w / 2)
    }

    estrada.lineStyle(5, C.estradaLuz, 0.4)
    for (const t of TRECHOS) {
        const a = NO_POR_ID[t.de]
        const b = NO_POR_ID[t.para]
        const comp = Math.hypot(b.x - a.x, b.y - a.y)
        const ux = (b.x - a.x) / comp
        const uy = (b.y - a.y) / comp
        for (let d = 26; d < comp - 46; d += 50) {
            estrada.lineBetween(a.x + ux * d, a.y + uy * d, a.x + ux * (d + 24), a.y + uy * (d + 24))
        }
    }

    const rastroAntigo = scene.add.graphics().setDepth(6)
    const rastro = scene.add.graphics().setDepth(7)
    let pontos: Array<{ x: number; y: number }> = []

    const redesenharRastro = () => {
        rastro.clear()
        if (pontos.length < 2) return
        rastro.lineStyle(11, C.rastro, 0.4)
        rastro.beginPath()
        rastro.moveTo(pontos[0].x, pontos[0].y)
        for (let i = 1; i < pontos.length; i++) rastro.lineTo(pontos[i].x, pontos[i].y)
        rastro.strokePath()
    }

    /*
     * ── 7. o círculo: a previsão e o de verdade ────────────────────────────
     *
     * Ele vai POR CIMA das casas (depth 16), e não no chão. No chão ele some
     * atrás do casario justamente onde a criança precisa olhar — e a pergunta
     * que ele responde é "quem está dentro", não "onde ele encosta no barro".
     */
    /* O caminho possivel fica NO CHAO, em cima da estrada e embaixo das casas. */
    const previewVia = scene.add.graphics().setDepth(8).setVisible(false)
    const preview = scene.add.graphics().setDepth(16).setVisible(false)
    const circuloGfx = scene.add.graphics().setDepth(17).setVisible(false)

    /*
     * A previsão mostra A COISA, não só a área.
     *
     * Um círculo sozinho responde "até onde" e não responde "o quê" — e é o
     * "o quê" que a criança precisa para decidir. Então o desenho da ferramenta
     * aparece no ponto de onde ela parte, GRANDE (110 px, contra os 70 que ela
     * tem andando), com o nome numa plaquinha embaixo.
     */
    const previewArte = scene.add.container(0, 0).setDepth(18).setVisible(false)
    const previewImg = scene.add.image(0, 0, 'ferramentas', '0').setOrigin(0.5, 1)
    const previewPlaca = scene.add.graphics()
    const previewNome = scene.add
        .text(0, 16, '', { fontFamily: FONT.black, fontSize: '26px', color: HEX.ink })
        .setOrigin(0.5)
    /* O "não alcança ninguém" fica ACIMA do desenho, senão ele some atrás. */
    const previewNada = scene.add.graphics()
    previewArte.add([previewImg, previewNada, previewPlaca, previewNome])

    // ── 8. as casas ───────────────────────────────────────────────────────
    const sheetCasas: Sheet | null = cutSheet(scene, 'casas', 3, 1)
    const sheetGente: Sheet | null = cutSheet(scene, 'gente', 6, 1)

    interface CasaView {
        img?: Phaser.GameObjects.Image
        fallback?: Phaser.GameObjects.Graphics
        gente?: Phaser.GameObjects.Image
        escalaGente: number
        luz: Phaser.GameObjects.Graphics
        estado: EstadoCasa
    }

    const views: Record<string, CasaView> = {}

    const escalaCasa = () => {
        if (!sheetCasas) return 1
        const box = boxOf(sheetCasas, 0)
        return CASA_ALTURA / (box.height * sheetCasas.frameH)
    }

    for (const casa of CASAS) {
        const luz = scene.add.graphics().setDepth(11)
        const view: CasaView = { luz, estado: 'escura', escalaGente: 1 }

        if (scene.textures.exists('casas') && sheetCasas) {
            const s = escalaCasa()
            const box = boxOf(sheetCasas, 0)
            const dy = (box.top + box.height / 2 - 0.5) * sheetCasas.frameH * s
            view.img = scene.add
                .image(casa.x, casa.y - dy, 'casas', '0')
                .setOrigin(0.5)
                .setScale(s)
                .setDepth(14)
        } else {
            const g = scene.add.graphics().setDepth(14)
            g.fillStyle(C.card, 1)
            g.fillRect(casa.x - 30, casa.y - 24, 60, 48)
            g.fillStyle(C.coral, 1)
            g.fillTriangle(casa.x - 36, casa.y - 24, casa.x + 36, casa.y - 24, casa.x, casa.y - 52)
            g.lineStyle(3, C.ink, 1)
            g.strokeRect(casa.x - 30, casa.y - 24, 60, 48)
            view.fallback = g
        }

        /*
         * O MORADOR É GRANDE.
         *
         * Ele estava a 44 px — 13 px reais num celular, uma mancha. É ele quem
         * diz "esta casa precisa saber" e é ele quem acena quando a casa
         * acende: se não dá para ver, os dois momentos mais importantes do jogo
         * acontecem sem ninguém em cena. Agora vai a 78, ao lado da casa e não
         * colado nela, com os pés na mesma linha da base.
         */
        if (scene.textures.exists('gente') && sheetGente) {
            const box = boxOf(sheetGente, 0)
            const s = 78 / (box.height * sheetGente.frameH)
            view.gente = scene.add
                .image(casa.x + 52, casa.y + 40, 'gente', '0')
                .setOrigin(0.5, 1)
                .setScale(s)
                .setDepth(15)
                .setVisible(false)
            view.escalaGente = s
        }

        views[casa.id] = view
    }

    /*
     * O QUE DIZ "ESTA CASA PRECISA SABER" É A LUZ DA PORTA, não uma moldura.
     *
     * Havia um quadrado amarelo de 108 px em volta de cada casa marcada, e uma
     * seta pulando em cima: com doze delas na tela, a vila virava uma planilha.
     * Nenhum dos dois era necessário — a casa JÁ troca de desenho, e o desenho
     * marcado é a porta aberta com a luz escapando pelo vão. O que faltava era
     * só espalhar essa luz no chão, que é o que uma porta aberta faz de noite.
     *
     * Ela respira devagar (1,1 s), o que chama o olho sem gritar, e é a única
     * coisa da vila que se mexe enquanto a criança pensa. E como é luz de
     * verdade, ela some sozinha quando a casa acende: aí a janela é que brilha.
     */
    const pintarLuz = (id: string) => {
        const v = views[id]
        const casa = CASA_POR_ID[id]
        scene.tweens.killTweensOf(v.luz)
        v.luz.clear().setAlpha(1)
        if (v.estado !== 'marcada') return

        const base = casa.y + CASA_ALTURA / 2
        v.luz.fillStyle(C.luz, 0.2)
        v.luz.fillEllipse(casa.x, base + 16, 200, 58)
        v.luz.fillStyle(C.luz, 0.34)
        v.luz.fillEllipse(casa.x, base + 12, 124, 36)
        v.luz.setAlpha(0.7)
        scene.tweens.add({
            targets: v.luz,
            alpha: 1,
            duration: 1100,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        })
    }

    const setEstado = (id: string, estado: EstadoCasa) => {
        const v = views[id]
        v.estado = estado
        const frame = estado === 'escura' ? '0' : estado === 'marcada' ? '1' : '2'
        v.img?.setFrame(frame)
        v.fallback?.setAlpha(estado === 'acesa' ? 1 : 0.6)
        if (v.gente) {
            v.gente.setVisible(estado !== 'escura')
            v.gente.setFrame(estado === 'acesa' ? '1' : '0')
        }
        pintarLuz(id)
    }

    // ── 9. o balão, preso na tela ─────────────────────────────────────────
    const balao = scene.add
        .container(W / 2, 220)
        .setDepth(300)
        .setScrollFactor(0)
        .setVisible(false)
    const balaoBg = scene.add.graphics()
    balao.add(balaoBg)
    const balaoFala = scene.add
        .text(0, 0, '', {
            fontFamily: FONT.body,
            fontSize: '22px',
            color: HEX.inkSoft,
            align: 'left',
            wordWrap: { width: 620 },
        })
        .setOrigin(0, 0.5)
    balao.add(balaoFala)
    const balaoTexto = scene.add
        .text(0, 0, '', {
            fontFamily: FONT.black,
            fontSize: '30px',
            color: HEX.ink,
            align: 'left',
            wordWrap: { width: 620 },
        })
        .setOrigin(0, 0.5)
    balao.add(balaoTexto)
    const balaoRosto = scene.add.image(0, 0, 'gente', '2').setOrigin(0.5).setVisible(false)
    balao.add(balaoRosto)

    const pintarBalao = (tom: 'fala' | 'aviso' | 'bom', temFala: boolean) => {
        const cor = tom === 'aviso' ? C.warn : tom === 'bom' ? C.okClaro : C.card
        const larguraTexto = Math.max(balaoTexto.width, temFala ? balaoFala.width : 0)
        const w = Math.max(400, larguraTexto + 180)
        const alturaTexto = balaoTexto.height + (temFala ? balaoFala.height + 6 : 0)
        const h = Math.max(100, alturaTexto + 44)

        balaoBg.clear()
        balaoBg.fillStyle(C.ink, 0.25)
        balaoBg.fillRoundedRect(-w / 2 + 6, -h / 2 + 8, w, h, 22)
        balaoBg.fillStyle(cor, 1)
        balaoBg.fillRoundedRect(-w / 2, -h / 2, w, h, 22)
        balaoBg.lineStyle(4, C.ink, 0.8)
        balaoBg.strokeRoundedRect(-w / 2, -h / 2, w, h, 22)

        const esquerda = -w / 2 + 104
        const topo = -alturaTexto / 2
        balaoFala.setPosition(esquerda, topo + balaoFala.height / 2).setVisible(temFala)
        balaoTexto.setPosition(
            esquerda,
            temFala ? topo + balaoFala.height + 6 + balaoTexto.height / 2 : 0,
        )
        balaoRosto.setPosition(-w / 2 + 50, 2)
    }

    /*
     * O RECADO.
     *
     * Era um painel de duas linhas com o rosto do vizinho, e ele parava o jogo
     * para ser lido. Virou uma faixa fina no alto: o que o problema pede está
     * nas casas acesas, e isto aqui é só a notícia em uma linha.
     *
     * Ela saía sozinha em 2,4 s, e não sai mais. Não tampa nada — mora acima da
     * vila e abaixo do kit —, então não há motivo para tirar da frente de quem
     * ainda está lendo. Quem a dispensa é a própria criança, no instante em que
     * toca a primeira carta: aí a pergunta dela já é outra.
     */
    const faixa = scene.add
        .container(W / 2, 136)
        .setDepth(305)
        .setScrollFactor(0)
        .setVisible(false)
    const faixaBg = scene.add.graphics()
    const faixaTexto = scene.add
        .text(0, 0, '', { fontFamily: FONT.black, fontSize: '27px', color: HEX.card })
        .setOrigin(0.5)
    faixa.add([faixaBg, faixaTexto])

    // ── 10. a bifurcação ──────────────────────────────────────────────────
    const pergunta = scene.add.container(0, 0).setDepth(320).setVisible(false)
    let zonas: Phaser.GameObjects.Zone[] = []

    /** Fica embaixo de tudo: só arrasta quem pegou o mapa vazio. */
    const panZone = scene.add
        .zone(-400, -400, WORLD.w + 800, WORLD.h + 800)
        .setOrigin(0, 0)
        .setDepth(-5)
        .setInteractive()

    const api: Vila = {
        panZone,

        marcar: ids => {
            for (const casa of CASAS) setEstado(casa.id, ids.includes(casa.id) ? 'marcada' : 'escura')
        },

        apresentar: (ids, aCada) =>
            new Promise(resolve => {
                for (const casa of CASAS) setEstado(casa.id, 'escura')
                ids.forEach((id, i) => {
                    scene.time.delayedCall(i * 110, () => {
                        setEstado(id, 'marcada')
                        aCada(i)
                        const v = views[id]
                        const alvo = v.img ?? v.fallback
                        if (alvo) {
                            scene.tweens.add({
                                targets: alvo,
                                scaleX: { from: alvo.scaleX * 1.16, to: alvo.scaleX },
                                scaleY: { from: alvo.scaleY * 0.86, to: alvo.scaleY },
                                duration: 340,
                                ease: 'Back.easeOut',
                            })
                        }
                        if (v.gente) {
                            v.gente.setAlpha(0)
                            scene.tweens.add({ targets: v.gente, alpha: 1, duration: 240 })
                        }
                    })
                })
                scene.time.delayedCall(ids.length * 110 + 360, () => resolve())
            }),

        recado: texto => {
            faixaTexto.setScale(1).setText(texto)
            if (faixaTexto.width > 940) faixaTexto.setScale(940 / faixaTexto.width)
            const w = faixaTexto.width * faixaTexto.scaleX + 64
            faixaBg.clear()
            faixaBg.fillStyle(C.ink, 0.82)
            faixaBg.fillRoundedRect(-w / 2, -26, w, 52, 26)
            faixaBg.lineStyle(3, C.warn, 0.8)
            faixaBg.strokeRoundedRect(-w / 2, -26, w, 52, 26)

            scene.tweens.killTweensOf(faixa)
            faixa.setVisible(true).setAlpha(0).setY(112)
            scene.tweens.add({
                targets: faixa,
                alpha: 1,
                y: 136,
                duration: 320,
                ease: 'Back.easeOut',
            })
        },

        limparRecado: () => {
            if (!faixa.visible) return
            scene.tweens.killTweensOf(faixa)
            scene.tweens.add({
                targets: faixa,
                alpha: 0,
                y: 116,
                duration: 260,
                onComplete: () => faixa.setVisible(false),
            })
        },

        acender: id => {
            setEstado(id, 'acesa')
            const v = views[id]
            const casa = CASA_POR_ID[id]
            const alvo = v.img ?? v.fallback
            if (alvo) {
                scene.tweens.add({
                    targets: alvo,
                    scaleX: { from: alvo.scaleX * 1.12, to: alvo.scaleX },
                    scaleY: { from: alvo.scaleY * 0.9, to: alvo.scaleY },
                    duration: 320,
                    ease: 'Back.easeOut',
                })
            }
            /* O morador pula e cresce: é o instante que a criança veio ver. */
            if (v.gente) {
                v.gente.setScale(v.escalaGente * 1.3)
                scene.tweens.add({
                    targets: v.gente,
                    scale: v.escalaGente,
                    duration: 380,
                    ease: 'Back.easeOut',
                })
                scene.tweens.add({
                    targets: v.gente,
                    y: { from: casa.y + 40, to: casa.y + 18 },
                    duration: 200,
                    yoyo: true,
                    repeat: 1,
                    ease: 'Sine.easeOut',
                })
            }
        },

        apagarTudo: () => {
            for (const casa of CASAS) setEstado(casa.id, 'escura')
        },

        pulsarEscuras: ids => {
            ids.forEach(id => {
                const v = views[id]
                const alvo = v.img ?? v.fallback
                const casa = CASA_POR_ID[id]
                if (alvo) {
                    scene.tweens.add({
                        targets: alvo,
                        alpha: { from: 1, to: 0.25 },
                        duration: 200,
                        yoyo: true,
                        repeat: 3,
                    })
                }
                scene.tweens.killTweensOf(v.luz)
                v.luz.clear().setAlpha(1)
                v.luz.fillStyle(C.coral, 0.34)
                v.luz.fillEllipse(casa.x, casa.y + CASA_ALTURA / 2 + 14, 200, 58)
                scene.tweens.add({
                    targets: v.luz,
                    alpha: 0.15,
                    duration: 200,
                    yoyo: true,
                    repeat: 3,
                })
            })
        },

        previewCirculo: (x, y, f, caminho) => {
            preview.clear().setVisible(true).setAlpha(1)
            previewVia.clear().setVisible(false).setAlpha(1)
            scene.tweens.killTweensOf([preview, previewVia])

            previewNada.clear()
            if (f.raio <= 0) {
                /*
                 * Não alcança ninguém, e isso é um fato de ALCANCE, não um
                 * veredito: a criança continua podendo mandar. O que ela não
                 * fica é sem saber que aquilo não tem círculo nenhum.
                 */
                previewNada.lineStyle(9, C.coral, 0.95)
                previewNada.strokeCircle(0, -56, 52)
                previewNada.lineBetween(-37, -93, 37, -19)
            } else {
                /*
                 * O CÍRCULO É UMA PROMESSA, E NÃO UMA COISA CONSTRUÍDA NO CHÃO.
                 *
                 * Ele tinha preenchimento a 0,2, um anel de 7 px e mais um fio
                 * branco por dentro: pesava como obra pronta e tapava as casas
                 * que a criança estava justamente conferindo. Agora é um anel
                 * fino que RESPIRA — o piscar diz sozinho que aquilo ainda não
                 * aconteceu, e é por isso que ele pode ser discreto.
                 */
                preview.fillStyle(C.circulo, 0.09)
                preview.fillCircle(x, y, f.raio)
                preview.lineStyle(4, C.warn, 0.6)
                preview.strokeCircle(x, y, f.raio)
            }

            /*
             * O CAMINHO QUE ELA PODE FAZER.
             *
             * Para quem anda, "até onde chega" tem duas medidas, e o círculo só
             * responde uma. A outra é o sol: com 8 passos o carro atravessa a
             * vila e ainda sobe o morro; com 4, o bilhete não passa da praça.
             * Os DOIS lados da bifurcação acendem, porque os dois estão ao
             * alcance — quem escolhe um deles é a criança, depois.
             */
            if (caminho.length) {
                previewVia.setVisible(true)
                previewVia.lineStyle(16, C.luz, 0.34)
                for (const t of caminho) {
                    const a = NO_POR_ID[t.de]
                    const b = NO_POR_ID[t.para]
                    previewVia.lineBetween(a.x, a.y, b.x, b.y)
                }
                const pontas = new Set<string>()
                for (const t of caminho) pontas.add(t.para)
                previewVia.fillStyle(C.luz, 0.5)
                for (const id of pontas) {
                    const no = NO_POR_ID[id]
                    previewVia.fillCircle(no.x, no.y, 9)
                }
            }

            if (scene.textures.exists('ferramentas') && sheetFerr) {
                const box = boxOf(sheetFerr, f.frame)
                const escala = Math.min(
                    150 / (box.width * sheetFerr.frameW),
                    110 / (box.height * sheetFerr.frameH),
                )
                const dx = (box.left + box.width / 2 - 0.5) * sheetFerr.frameW * escala
                /*
                 * O PÉ DO DESENHO ENCOSTA NO CHÃO.
                 *
                 * Com `origin(0.5, 1)` o `y` é a base da CÉLULA, e não a base do
                 * desenho: a conta antiga usava o centro da caixa alfa e deixava
                 * a arte meia célula acima — uns 110 px. O carro de som ficava
                 * pairando no ar em cima da estrada. O que fecha a conta é a
                 * faixa vazia que sobra embaixo do desenho, `1 - box.bottom`.
                 */
                const aoChao = (1 - box.bottom) * sheetFerr.frameH * escala
                previewImg
                    .setFrame(String(f.frame))
                    .setScale(escala)
                    .setPosition(-dx, aoChao)
                    .setFlipX(f.andar !== 'planta' && f.frente === 'esquerda')
            }

            previewNome.setScale(1).setText(f.nome)
            const w = Math.max(140, previewNome.width + 28)
            previewPlaca.clear()
            previewPlaca.fillStyle(C.ink, 0.28)
            previewPlaca.fillRoundedRect(-w / 2 + 3, 4, w, 36, 12)
            previewPlaca.fillStyle(C.card, 1)
            previewPlaca.fillRoundedRect(-w / 2, 0, w, 36, 12)
            previewPlaca.lineStyle(3, C.cardBorda, 1)
            previewPlaca.strokeRoundedRect(-w / 2, 0, w, 36, 12)
            previewArte.bringToTop(previewNome)

            previewArte.setPosition(x, y - 6).setVisible(true).setAlpha(0)
            scene.tweens.killTweensOf([previewArte, previewImg])
            scene.tweens.add({ targets: previewArte, alpha: 1, duration: 200 })

            /* Só o que voa fica no ar. O resto entra com um pulinho e para. */
            const pousado = previewImg.y
            if (f.andar === 'voo') {
                scene.tweens.add({
                    targets: previewImg,
                    y: { from: pousado - 14, to: pousado - 2 },
                    duration: 900,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut',
                })
            } else {
                scene.tweens.add({
                    targets: previewImg,
                    y: { from: pousado - 24, to: pousado },
                    duration: 380,
                    ease: 'Back.easeOut',
                })
            }

            /* O piscar é o que diz "isto é previsão, ainda não aconteceu". */
            scene.tweens.add({
                targets: [preview, previewVia],
                alpha: { from: 1, to: 0.3 },
                duration: 780,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
            })
        },

        limparPreview: () => {
            scene.tweens.killTweensOf([previewArte, previewImg, preview, previewVia])
            preview.clear().setVisible(false).setAlpha(1)
            previewVia.clear().setVisible(false).setAlpha(1)
            previewArte.setVisible(false)
        },

        circulo: (x, y, raio) => {
            circuloGfx.clear().setVisible(true)
            if (raio <= 0) return
            circuloGfx.fillStyle(C.circulo, 0.18)
            circuloGfx.fillCircle(x, y, raio)
            circuloGfx.lineStyle(7, C.luz, 0.95)
            circuloGfx.strokeCircle(x, y, raio)
        },

        esconderCirculo: () => circuloGfx.clear().setVisible(false),

        somaRastro: (x, y) => {
            const ultimo = pontos[pontos.length - 1]
            if (ultimo && Math.hypot(ultimo.x - x, ultimo.y - y) < 6) return
            pontos.push({ x, y })
            redesenharRastro()
        },

        limparRastro: () => {
            pontos = []
            rastro.clear()
            rastroAntigo.clear()
        },

        congelarRastro: () => {
            if (pontos.length > 1) {
                rastroAntigo.lineStyle(11, C.rastro, 0.22)
                rastroAntigo.beginPath()
                rastroAntigo.moveTo(pontos[0].x, pontos[0].y)
                for (let i = 1; i < pontos.length; i++) rastroAntigo.lineTo(pontos[i].x, pontos[i].y)
                rastroAntigo.strokePath()
            }
            pontos = []
            rastro.clear()
        },

        falar: (titulo, corpo, tom, vizinho) => {
            balaoFala.setText(titulo)
            balaoTexto.setText(corpo)
            if (scene.textures.exists('gente') && sheetGente) {
                const box = boxOf(sheetGente, vizinho)
                const s = 72 / (box.height * sheetGente.frameH)
                balaoRosto.setFrame(String(vizinho)).setScale(s).setVisible(true)
            }
            pintarBalao(tom, titulo.length > 0)
            balao.setVisible(true).setAlpha(0).setScale(0.92)
            scene.tweens.add({ targets: balao, alpha: 1, scale: 1, duration: 220, ease: 'Back.easeOut' })
        },

        calar: () => {
            scene.tweens.killTweensOf(balao)
            balao.setVisible(false)
        },

        perguntar: (opcoes, onPick) => {
            api.fecharPergunta()
            pergunta.removeAll(true)
            pergunta.setVisible(true)

            opcoes.forEach((op, i) => {
                const g = scene.add.graphics()
                g.fillStyle(C.ink, 0.3)
                g.fillCircle(op.x + 4, op.y + 7, 46)
                g.fillStyle(C.warn, 0.95)
                g.fillCircle(op.x, op.y, 42)
                g.lineStyle(6, C.white, 1)
                g.strokeCircle(op.x, op.y, 42)
                g.fillStyle(C.ink, 0.85)
                g.fillTriangle(op.x - 12, op.y - 14, op.x - 12, op.y + 14, op.x + 15, op.y)
                pergunta.add(g)

                const rotulo = scene.add
                    .text(op.x, op.y - 66, RAMO_NOME[op.rotulo] ?? op.rotulo, {
                        fontFamily: FONT.black,
                        fontSize: '22px',
                        color: HEX.ink,
                        backgroundColor: HEX.card,
                        padding: { x: 12, y: 6 },
                    })
                    .setOrigin(0.5)
                pergunta.add(rotulo)

                scene.tweens.add({
                    targets: [g, rotulo],
                    alpha: { from: 0.6, to: 1 },
                    duration: 440,
                    yoyo: true,
                    repeat: -1,
                    delay: i * 150,
                })

                const zona = scene.add
                    .zone(op.x, op.y, 170, 170)
                    .setOrigin(0.5)
                    .setDepth(330)
                    .setInteractive({ useHandCursor: true })
                zona.on('pointerdown', () => onPick(op.chave))
                zonas.push(zona)
            })
        },

        fecharPergunta: () => {
            zonas.forEach(z => z.destroy())
            zonas = []
            scene.tweens.killTweensOf(pergunta.list)
            pergunta.removeAll(true)
            pergunta.setVisible(false)
        },

        pontoDaCasa: id => {
            const c = CASA_POR_ID[id]
            return { x: c.x, y: c.y }
        },

        /** Paralaxe do céu na mão: o `tileSprite` está preso na tela. */
        atualizarCeu: scrollX => ceu.setTilePosition(scrollX * 0.22, 0),

        destroy: () => {
            api.fecharPergunta()
            scene.tweens.killTweensOf([balao, faixa])
            faixa.destroy()
            pergunta.destroy()
            balao.destroy()
            Object.values(views).forEach(v => {
                v.img?.destroy()
                v.fallback?.destroy()
                v.gente?.destroy()
                scene.tweens.killTweensOf(v.luz)
                v.luz.destroy()
            })
            arvores.forEach(a => a.destroy())
            poste.destroy()
            sinoMarco?.destroy()
            scene.tweens.killTweensOf([previewArte, previewImg, preview, previewVia])
            previewArte.destroy()
            preview.destroy()
            previewVia.destroy()
            circuloGfx.destroy()
            rastro.destroy()
            rastroAntigo.destroy()
            estrada.destroy()
            vilarejo.destroy()
            chao.destroy()
            fundo.destroy()
            ceu.destroy()
            ceuLiso.destroy()
            panZone.destroy()
        },
    }

    return api
}
