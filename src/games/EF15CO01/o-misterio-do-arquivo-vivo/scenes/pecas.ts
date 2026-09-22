import Phaser from 'phaser'
import { C, COLUNAS, LINHAS } from '../data/theme'
import { SHEETS, has } from '../data/files'
import type { TipoCampo } from '../types'

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  AS DUAS PEÇAS
 * ══════════════════════════════════════════════════════════════════════════
 *
 * **Da fila**: a coisa de `coisas.png`, no tamanho da posição dela. O tamanho é
 * a informação — é o que a criança compara para saber a ordem.
 *
 * **Da grade**: uma fichinha desenhada em `Graphics`, com o contorno na FORMA e
 * na COR da coluna e o bichinho da linha no meio. Ela carrega o endereço dela
 * na cara: casar com a borda da grade é casar figura com figura.
 */

export function criarCoisa(
    scene: Phaser.Scene,
    objeto: number,
    tamanho: number,
): Phaser.GameObjects.Container {
    const c = scene.add.container(0, 0)
    const img = has(scene, SHEETS.coisas.key)
        ? scene.add.image(0, 0, SHEETS.coisas.key, objeto).setDisplaySize(tamanho, tamanho)
        : scene.add.rectangle(0, 0, tamanho * 0.8, tamanho * 0.8, C.madeira)
    c.add(img as Phaser.GameObjects.GameObject)
    c.setSize(tamanho, tamanho)
    return c
}

export function criarFichinha(
    scene: Phaser.Scene,
    linha: number,
    coluna: number,
    tamanho: number,
): Phaser.GameObjects.Container {
    const c = scene.add.container(0, 0)
    const g = scene.add.graphics()
    const col = COLUNAS[coluna]
    const r = tamanho / 2

    g.fillStyle(col.cor, 1)
    g.lineStyle(7, C.tinta, 1)
    desenharForma(g, col.forma, 0, 0, r, true)
    c.add(g)

    if (has(scene, SHEETS.bichinhos.key)) {
        /* O bichinho fica um pouco menor que a forma, e o triângulo pede mais
           folga ainda: no triângulo a área útil é o terço de baixo. */
        const dentro = col.forma === 'triangulo' ? tamanho * 0.5 : tamanho * 0.62
        const dy = col.forma === 'triangulo' ? r * 0.28 : 0
        const b = scene.add.image(0, dy, SHEETS.bichinhos.key, LINHAS[linha].frame)
        b.setDisplaySize(dentro, dentro)
        c.add(b)
    }

    c.setSize(tamanho, tamanho)
    return c
}

/**
 * O VALOR DE UM CAMPO DA FICHA.
 *
 * Três tipos, e cada um se lê sem uma palavra: um bichinho, uma mancha de cor,
 * ou três círculos crescendo. O rótulo do campo, na prateleira, mostra o mesmo
 * pictograma — casar valor com rótulo é casar desenho com desenho.
 */
export function criarValorCampo(
    scene: Phaser.Scene,
    tipo: TipoCampo,
    valor: number,
    tamanho: number,
): Phaser.GameObjects.Container {
    const c = scene.add.container(0, 0)
    const g = scene.add.graphics()
    const r = tamanho / 2

    g.fillStyle(C.creme, 1)
    g.lineStyle(6, C.tinta, 1)
    g.fillRoundedRect(-r, -r, tamanho, tamanho, tamanho * 0.22)
    g.strokeRoundedRect(-r, -r, tamanho, tamanho, tamanho * 0.22)
    c.add(g)

    if (tipo === 'bicho') {
        if (has(scene, SHEETS.bichinhos.key)) {
            const b = scene.add.image(0, 0, SHEETS.bichinhos.key, LINHAS[valor].frame)
            b.setDisplaySize(tamanho * 0.78, tamanho * 0.78)
            c.add(b)
        }
    } else if (tipo === 'cor') {
        const col = COLUNAS[valor]
        g.fillStyle(col.cor, 1)
        g.lineStyle(5, C.tinta, 1)
        desenharForma(g, col.forma, 0, 0, r * 0.6, true)
    } else {
        desenharTamanho(g, valor, r)
    }

    c.setSize(tamanho, tamanho)
    return c
}

/** O rótulo do campo: o mesmo pictograma do valor, em cinza, dentro do campo. */
export function desenharRotuloCampo(
    g: Phaser.GameObjects.Graphics,
    tipo: TipoCampo,
    x: number,
    y: number,
    r: number,
) {
    g.fillStyle(C.tinta, 0.34)
    if (tipo === 'bicho') {
        /* Uma patinha: a almofada e três dedos. Lê-se como "qual bicho". */
        g.fillEllipse(x, y + r * 0.28, r * 1.05, r * 0.82)
        g.fillCircle(x - r * 0.52, y - r * 0.4, r * 0.24)
        g.fillCircle(x, y - r * 0.58, r * 0.25)
        g.fillCircle(x + r * 0.52, y - r * 0.4, r * 0.24)
        return
    }
    if (tipo === 'cor') {
        /* Três manchas sobrepostas: "que cor". */
        COLUNAS.forEach((col, i) => {
            g.fillStyle(col.cor, 0.85)
            g.fillCircle(x + (i - 1) * r * 0.48, y + (i === 1 ? -r * 0.28 : 0), r * 0.42)
        })
        return
    }
    desenharTamanho(g, -1, r)
}

/** Três círculos crescendo. Com `valor` de 0 a 2, o escolhido fica cheio. */
function desenharTamanho(
    g: Phaser.GameObjects.Graphics,
    valor: number,
    r: number,
) {
    const raios = [r * 0.22, r * 0.38, r * 0.56]
    raios.forEach((rr, i) => {
        const x = (i - 1) * r * 0.62
        if (valor < 0 || valor === i) {
            g.fillStyle(valor < 0 ? C.tinta : C.madeiraEscura, valor < 0 ? 0.34 : 1)
            g.fillCircle(x, 0, rr)
        } else {
            g.lineStyle(4, C.tinta, 0.3)
            g.strokeCircle(x, 0, rr)
        }
    })
}

/**
 * O FIO DA TEIA: um cartãozinho com as duas pontas lado a lado.
 *
 * Ele mostra QUEM se liga a QUEM, e o buraco fica no meio do fio pontilhado
 * entre esses dois pontos. A criança casa o par do cartão com o par da moldura.
 */
export function criarFio(
    scene: Phaser.Scene,
    de: { frame: number; coisa?: boolean },
    para: { frame: number; coisa?: boolean },
    tamanho: number,
): Phaser.GameObjects.Container {
    const c = scene.add.container(0, 0)
    const larg = tamanho * 1.62
    const g = scene.add.graphics()

    g.fillStyle(C.creme, 1)
    g.lineStyle(6, C.tinta, 1)
    g.fillRoundedRect(-larg / 2, -tamanho / 2, larg, tamanho, tamanho * 0.28)
    g.strokeRoundedRect(-larg / 2, -tamanho / 2, larg, tamanho, tamanho * 0.28)
    /* O traço entre as duas pontas: é ele que diz "isto é uma ligação". */
    g.lineStyle(7, C.tinta, 0.8)
    g.lineBetween(-larg * 0.13, 0, larg * 0.13, 0)
    c.add(g)

    const dx = larg * 0.29
    ;[{ n: de, x: -dx }, { n: para, x: dx }].forEach(({ n, x }) => {
        const key = n.coisa ? SHEETS.coisas.key : SHEETS.bichinhos.key
        if (has(scene, key)) {
            const img = scene.add.image(x, 0, key, n.frame)
            img.setDisplaySize(tamanho * 0.62, tamanho * 0.62)
            c.add(img)
        } else {
            g.fillStyle(C.madeiraEscura, 1)
            g.fillCircle(x, 0, tamanho * 0.3)
        }
    })

    c.setSize(larg, tamanho)
    return c
}

/** A mesma forma, vazia: é o cabeçalho da coluna na borda da grade. */
export function desenharRotuloColuna(
    g: Phaser.GameObjects.Graphics,
    coluna: number,
    x: number,
    y: number,
    r: number,
) {
    const col = COLUNAS[coluna]
    g.fillStyle(col.cor, 1)
    g.lineStyle(6, C.tinta, 1)
    desenharForma(g, col.forma, x, y, r, true)
}

function desenharForma(
    g: Phaser.GameObjects.Graphics,
    forma: 'circulo' | 'triangulo' | 'quadrado',
    x: number,
    y: number,
    r: number,
    contornar: boolean,
) {
    if (forma === 'circulo') {
        g.fillCircle(x, y, r)
        if (contornar) g.strokeCircle(x, y, r)
        return
    }
    if (forma === 'quadrado') {
        g.fillRoundedRect(x - r, y - r, r * 2, r * 2, r * 0.22)
        if (contornar) g.strokeRoundedRect(x - r, y - r, r * 2, r * 2, r * 0.22)
        return
    }
    const tri = new Phaser.Geom.Triangle(
        x, y - r * 1.06,
        x - r * 1.06, y + r * 0.82,
        x + r * 1.06, y + r * 0.82,
    )
    g.fillTriangleShape(tri)
    if (contornar) g.strokeTriangleShape(tri)
}
