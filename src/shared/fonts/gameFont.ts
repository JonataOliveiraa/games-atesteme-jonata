import dynaPuffUrl from '../../assets/fonts/DynaPuff.ttf?url'

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  A FONTE DOS JOGOS
 * ══════════════════════════════════════════════════════════════════════════
 *
 * ── POR QUE ISTO NÃO É UM `@font-face` NO CSS ────────────────────────────
 *
 * O Phaser desenha texto no CANVAS, e canvas não pede fonte para o navegador.
 * Um `@font-face` no CSS só é baixado quando algum elemento do DOM pede aquela
 * família — e nenhum elemento pede, porque o jogo inteiro é uma tag `<canvas>`.
 *
 * O resultado desse caminho é o pior tipo de bug: em desenvolvimento funciona
 * (a fonte já está no cache do navegador de tanto recarregar), e na máquina de
 * quem abre o site pela primeira vez o jogo aparece em Arial. Sem erro no
 * console, sem nada quebrado. E como o Phaser mede o texto no instante em que
 * cria o objeto, uma fonte que chega depois NÃO redesenha nada: o `Text` fica
 * com a largura da Arial para sempre.
 *
 * Por isso a fonte é carregada pela API `FontFace`, que devolve uma PROMESSA —
 * dá para esperar por ela antes de o Phaser existir. Quem espera é o
 * `PhaserCanvas`, e é a única coisa que ele precisa saber sobre fontes.
 *
 * ── DUAS FAMÍLIAS, UM ARQUIVO SÓ ─────────────────────────────────────────
 *
 * `DynaPuff` é uma fonte VARIÁVEL: um arquivo com o eixo `wght` indo de 400 a
 * 700 (e `wdth` de 75 a 100, que não usamos). Os jogos, porém, pedem fonte pelo
 * NOME da família — `fontFamily: FONT.black` — e não por peso, porque é assim
 * que o `Phaser.GameObjects.Text` funciona em todos os 45 jogos.
 *
 * A saída é registrar o MESMO arquivo duas vezes, com nomes diferentes e o
 * descritor de peso fixado em cada um. Quando uma família tem uma única face, o
 * navegador usa essa face para qualquer peso pedido — e, sendo variável, ela é
 * instanciada no peso do descritor. Assim `"DynaPuff Black"` sai em 700 sem
 * ninguém precisar passar `fontStyle: 'bold'` em lugar nenhum.
 *
 * Repare que 700 é o MÁXIMO desta fonte, enquanto a `Arial Black` que ela
 * substitui é ~900. O texto fica um tico menos pesado — e mais largo, porque
 * DynaPuff é uma display arredondada. Quem tem teto de largura (a frase do
 * pedido, o nome das peças) já encolhe sozinho; quem não tem precisa ser olhado
 * rodando.
 *
 * ── SE A FONTE NÃO CARREGAR ──────────────────────────────────────────────
 *
 * O jogo abre do mesmo jeito, em Arial. Fonte é acabamento: ela nunca pode ser
 * o motivo de uma criança ficar olhando para uma tela preta.
 */

/**
 * O que os `theme.ts` dos jogos apontam.
 *
 * A pilha continua terminando em Arial de propósito: é o que aparece enquanto a
 * fonte não chega, e é o que fica se ela falhar.
 */
export const FONT_JOGO = {
    /** Títulos, botões, rótulos — o que era `Arial Black`. */
    black: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
    /** Texto corrido — o que era `Arial`. */
    body: 'DynaPuff, Arial, sans-serif',
}

/** O mesmo arquivo, com o eixo `wght` fixado em cada registro. */
const FACES: Array<{ family: string; weight: string }> = [
    /*
     * FAIXA, e não peso fixo.
     *
     * Boa parte dos jogos escreve `fontFamily: 'Arial'` junto com
     * `fontStyle: 'bold'` — ou seja, pede peso 700 da família normal. Com uma
     * face de peso 400 só, o navegador ENGROSSARIA a letra por conta própria
     * (negrito sintético), que numa display arredondada fica borrado. Com a
     * faixa 400–700 declarada, o pedido de negrito instancia o eixo `wght` da
     * fonte variável no 700 de verdade.
     */
    { family: 'DynaPuff', weight: '400 700' },
    /* Peso travado: é a família que os `FONT.black` pedem pelo nome. */
    { family: 'DynaPuff Black', weight: '700' },
]

/**
 * Uma promessa só, guardada.
 *
 * `PhaserCanvas` chama isto toda vez que monta um jogo, e trocar de jogo não
 * pode rebaixar 200KB de fonte de novo.
 */
let carregando: Promise<void> | null = null

const jaRegistrada = (family: string): boolean => {
    let achou = false
    document.fonts.forEach(f => { if (f.family === family) achou = true })
    return achou
}

export function carregarFonteDoJogo(): Promise<void> {
    if (carregando) return carregando

    carregando = (async () => {
        if (typeof document === 'undefined' || !document.fonts || typeof FontFace === 'undefined') return

        await Promise.all(FACES.map(async ({ family, weight }) => {
            // o recarregamento a quente do Vite roda este módulo de novo com as
            // faces já no documento; registrar duas vezes não quebra, mas suja
            if (jaRegistrada(family)) return
            try {
                const face = new FontFace(
                    family,
                    `url(${dynaPuffUrl}) format('truetype')`,
                    { weight, style: 'normal' },
                )
                await face.load()
                document.fonts.add(face)
            } catch (erro) {
                // sem drama: os jogos caem na Arial da pilha e continuam jogáveis
                console.warn(`[fonte] não deu para carregar "${family}":`, erro)
            }
        }))
    })()

    return carregando
}
