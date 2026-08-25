/**
 * ═══════════════════════════════════════════════════════════════════════
 *  APOSENTADA — todo o desenho passou para a GameScene
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Esta cena existia para desenhar o topo: a faixa, a pílula do nível, o
 * enunciado, o subtítulo e o relógio. Para isso ela precisava de três canais
 * de mensagem com a cena de jogo — `registry.set('hud', ...)`, e os eventos
 * `timer-start`, `timer-stop` e `timer-end` do `EventBus` — só para mover
 * números entre duas cenas que sempre viveram juntas.
 *
 * O custo apareceu quando o topo quebrou: entender uma tela exigia abrir dois
 * arquivos, e o enunciado não tinha como saber onde o relógio estava. Com tudo
 * numa cena só, o HUD é um container e as coordenadas conversam.
 *
 * O arquivo continua aqui só porque esta sessão não consegue apagar arquivos
 * no computador. **Pode ser deletado** — nada o importa: `index.ts` registra
 * apenas `[BootScene, GameScene]`.
 */
export {}
