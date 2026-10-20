# Brief do Ferro — Ventania na Floresta, N2 e N3

Pedido do usuário (20/10/2026): *"faça n2 e n3, e faça as texturas"*. O N1 (FILA e GRADE) está pronto e jogado. O desenho do N2 (FICHA e TEIA) e do N3 (REDEMOINHO) está em **PLANEJAMENTO.md §11**; as folhas novas, com o contrato de células, em **TEXTURAS.md §11**. Leia os dois inteiros antes de começar, e o §3 a §10 do PLANEJAMENTO para o laço e o tom do N1, que o N2 e o N3 repetem.

A Aquarela está gerando as texturas do N1 e depois as do N2/N3; a Tesoura publica. **Você não espera a arte:** como no N1, cada folha nova tem a **arte de reserva** em `scenes/fallback.ts`, assada nas mesmas folhas, grades e ordem de células do TEXTURAS §11, e um PNG com o mesmo nome em `src/assets/games/EF15CO01/ventania-na-floresta/` substitui sem mudar código (siga o jeito que `files.ts`/`BootScene.ts`/`fallback.ts` já fazem).

## O que fazer

1. **types.ts / data:** `FichaPhase` (`type: 'ficha'`, `fields: ('pena'|'bico'|'topete')[]`, `nests: Bird[]`, `bring: Bird[]`, `teach?`), `TeiaPhase` (`type: 'teia'`, `bugs: Bug[]`, `before: Vec-slot[]`, `after: slot[]`, `edges: [Bug, Bug][]` na ordem em que a Tecê pede, `teach?`), `RedemoinhoPhase` (`type: 'redemoinho'`, `homes: Home[]` ≤ 4, `pieces: Piece[]`, `teach?`). `Bird = { pena: Cor, bico: Cor, topete?: boolean }`, `Cor = 'laranja'|'verde'|'roxo'`; `Bug = 'joaninha'|'borboleta'|'grilo'|'caracol'`; `Home = 'fila'|'grade'|'ficha'|'teia'|'solto'`; `Piece` = os 11 pedaços da tabela do §11 (ids em inglês ou curtos, cada um com a casa certa em `logic.ts`, **não** nos dados da fase).
2. **levels.ts:** `N2` e `N3` com as fases das tabelas do §11 (você escolhe ninhos, filhotes, posições e pares respeitando a validação do §11), `LEVELS = [N1, N2, N3]`, e `validateLevels` estendida com as regras do §11 (ficha: exatamente um ninho por filhote, um par de ninhos com pena↔bico trocados por fase, 1º filhote fora da ponta esquerda, ordem ≠ ordem dos ninhos; teia: triângulo de 3 ou 4 fios em 4 bichos, sem par repetido, posição nova ≠ antiga, a ponta da Tecê não repete o mesmo bicho seguido; redemoinho: ≤ 4 casas, toda casa recebe pedaço, todo pedaço tem casa na fase, 1º pedaço fora da ponta esquerda, nenhuma casa duas vezes seguidas). O N1 tem de continuar passando sem mudança.
3. **logic.ts:** `nestFits(nest, bird, fields)`, `firstMismatch(nest, bird, fields)` (pena, bico, topete, nessa ordem), `edgeFits`, `homeOfPiece(piece)`.
4. **words.ts:** pílulas FICHA, TEIA e o rótulo do N3 (sugestão: a pílula mostra o nome da casa só quando acende; o pedido do N3 é *"Onde mora?"* com o desenho do pedaço da vez); `RULE.ficha` *"leia o nome de cada linha"*, `RULE.teia` *"o fio liga os dois"*; as falas do tutorial e as faixas de erro exatamente como no §11.
5. **Cenas novas** (um arquivo por estrutura, no molde de `line.ts`/`garden.ts`, com `build/hide/scatter/activate/deactivate/celebrate/destroy` e o que mais o GameScene precisar):
   - `nests.ts` (FICHA): galho, ninhos (`objetos2` 0), fichas (`objetos2` 1) com as linhas desenhadas pelo código (ícone de rótulo `objetos2` 4/5/6 num círculo + valor: bolinha de cor para pena/bico, topete pintado ou um traço "sem" para topete) e assadas em textura; filhotes (`filhotes` célula `pena*3+bico`, topete `objetos2` 3 por cima, pintado com a cor da pena); a Pipa segura o filhote da vez (use a Pipa do N1 e a pose que fizer sentido); montinho de folhas (`objetos2` 7). Erro: a linha que não bate treme e a parte do filhote pisca.
   - `web.ts` (TEIA): galhinhos (`objetos2` 2), bichos (`bichos` 0–3, assustado 4–7), Tecê (`tece`), fios brancos assados (Graphics só na hora de assar, nunca redesenhados por quadro), a ventania troca os bichos de galhinho com tween; o cartão do par no cabeçalho (os dois bichos pequenos + fio).
   - `whirl.ts` (N3): o redemoinho (espiral de riscos de vento + folhinhas `objetos` 4, girando, **barato**: poucos sprites, nada de Graphics por quadro), as casas (`casas` 0–4) em fila na beira de baixo com a pílula do nome, o pedaço da vez (`pedacos` 0–10) girando devagar no ar; número/palavra escritos pelo código nos pedaços 5, 8 e 9 (6, 7, OI).
6. **GameScene:** os novos tipos no `startPhase`/`play`/`explain`/`helpSteps`; fundos por estrutura (`bg-ninhos`, `bg-teia`, `bg-redemoinho`); tutoriais do §11 com `teach`/`spot` como no N1 (balões de 2–5 palavras, demonstração do próprio jogo antes do *Sua vez!*, bolinha de toque `touch.tap`, nada de mãozinha); erro mostra o estrago + faixa + `lose()` uma vez; acerto por fase = `CORRECT_ANSWER`. A abertura da Pipa é só do N1. O fim do N1 e do N2 avança sozinho (já é assim quando não é o último).
7. **header.ts:** pílula + desenho da regra para FICHA, TEIA e N3 (o cartão do par da teia mora aqui).
8. **audio.ts:** sons sintetizados no estilo dos que já existem (piado, fio esticando, fio arrebentando, redemoinho, "não cabe" quicando).
9. **PLANEJAMENTO:** atualize §13 (arquivos) e o Histórico.

## Regras do projeto (não negociáveis)

- Código em inglês, quase sem comentário; só o texto que a criança lê em português.
- `gen` em todo `await`; `killTweensOf` não chama `onStop` (guarde o resolve).
- No máximo 4 alvos por vez; tocar fora não faz nada; errar a mira nunca conta como erro.
- Graphics só para assar textura; nada vetorial redesenhado por quadro.
- Nada pulsa entregando a resposta: o destaque de alvo é igual para todos os alvos da vez (como no N1).
- Não mexa em outros jogos.

## Teste

`npx tsc --noEmit -p .` na raiz (filtre `ventania`) e `npx eslint src/games/EF15CO01/ventania-na-floresta`. Jogue no navegador: servidor `jogos-dev-ventania` (porta 5313); se o painel travar, Chrome headless pelo CDP com cliques reais. Jogue o N2 e o N3 inteiros, um erro de cada tipo (ficha, teia, redemoinho) e o `?` em cada estrutura.

Ao terminar: `maestri ask "Claude Code #4" "<resultado: o que fez, o que testou, o que não conseguiu>"`.
