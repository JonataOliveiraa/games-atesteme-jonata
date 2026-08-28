/**
 * ══════════════════════════════════════════════════════════════════════════
 *  APOSENTADO — o nível 2 voltou para dentro da `GameScene`
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Esta cena existia porque o tabuleiro do nível 2 é mesmo outro: no 1 há
 * bancada, trilha de cartas e prateleira; no 2 há um caminho que a Lia
 * percorre. O que a separação não pagou foi o RESTO — som, checkpoint,
 * tutorial, mudo, desmonte e o ciclo de vitória/derrota eram os mesmos,
 * copiados linha a linha. Duas cópias de um laço de execução é onde um
 * conserto entra num lado só e o bug continua vivo no outro.
 *
 * Agora a `GameScene` monta um tabuleiro ou o outro (`buildBenchBoard` /
 * `buildTrailBoard`) e executa de um jeito ou do outro (`runBench` /
 * `runTrail`). Tudo o mais é comum, escrito uma vez.
 *
 * O arquivo fica aqui vazio para o usuário apagar à mão — a sessão que o
 * aposentou não tem permissão de remover arquivos no disco dele.
 */
export {}
