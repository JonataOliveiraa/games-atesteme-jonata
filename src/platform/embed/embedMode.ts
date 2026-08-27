/**
 * ══════════════════════════════════════════════════════════════════════════
 *  O MODO EMBED
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Ligado por `?embed=1` na URL, e só por isso. Duas partes distantes da árvore
 * precisam concordar sobre ele — o `Layout`, que decide se desenha cabeçalho, e
 * a rota do jogo, que decide se desenha a página inteira ou só o jogo.
 *
 * Este módulo existe para as duas lerem a mesma coisa do mesmo jeito, sem que
 * uma precise passar o valor para a outra por props ou contexto.
 *
 * Houve aqui um atalho de teclado que desligava o modo embed durante o
 * desenvolvimento. Saiu a pedido: alternar o modo pela tecla criava um segundo
 * jeito de a tela estar, e "está assim porque alguém apertou uma tecla" é o
 * tipo de estado que ninguém lembra na hora de investigar um problema. Para
 * ver a página normal, é só tirar o `embed=1` da URL.
 */

/**
 * `true` quando a tela deve ser só o jogo.
 *
 * `queryPedeEmbed` vem de quem já leu a URL, para este módulo não precisar
 * conhecer o router nem ser chamado de dentro de uma rota.
 */
export function useEmbedAtivo(queryPedeEmbed: boolean): boolean {
  return queryPedeEmbed;
}
