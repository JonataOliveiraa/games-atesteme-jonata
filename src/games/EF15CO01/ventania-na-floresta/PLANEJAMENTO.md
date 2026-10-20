# Ventania na Floresta — planejamento

Documento irmão: [TEXTURAS.md](./TEXTURAS.md)

**EF15CO01 · 1º ao 5º ano · Pensamento Computacional · Organização e representação da informação** · id **131** · pasta `src/games/EF15CO01/ventania-na-floresta/`

> **(EF15CO01)** Identificar as principais formas de organizar e representar a informação de maneira estruturada (matrizes, registros, listas e grafos) ou não estruturada (números, palavras, valores verdade).

Pedido do usuário (20/10/2026): colou a ficha *Caminhão da Mudança*. Avisei que ela repetia o Museu das Estruturas (042) e a versão "Estantes" que matou a 1ª tentativa d'O Mistério do Arquivo Vivo (089). Ele recusou três ideias por serem *"muito entediantes e não voltadas para coisas da natureza"*, escolheu a **Ventania na Floresta** entre três novas e pediu *"planeje o jogo, e faça só com n1, usando Graphics. as texturas eu adicionarei em breve"*.

---

## 0. Por que não é a ficha, e o que ficou dela

| Irmão | O que a criança faz |
|---|---|
| Museu das Estruturas (042) | entra numa sala por estrutura e cumpre uma tarefa de toque; no N2 escolhe entre duas portas qual guarda melhor um conjunto |
| O Mistério do Arquivo Vivo (089) | encaixa coisas soltas nos buracos de uma prateleira (fila, grade, ficha, teia) |
| Caminhão da Mudança (a ficha) | toca no caixote da estrutura certa para cada cartão (é o N2 do Museu outra vez) |

Aqui a estrutura é **uma organização da própria natureza que o vento desmontou**: a fila das formigas, o canteiro das abelhas, a teia da aranha, a ficha do passarinho. A criança conserta a estrutura **seguindo a regra dela**, e o que dá errado aparece no bicho: a formiga fora da ordem tropeça e derruba a folha; a flor no lugar errado murcha.

Da ficha ficaram a escada dos níveis (N1 fila × grade, N2 ficha e teia, N3 a coisa solta e as pegadinhas), o "não cabe" que explica o erro e o nome curto de cada estrutura (FILA, GRADE, FICHA, TEIA).

## 1. O jogo em uma frase

**Uma ventania bagunçou a floresta. Ponha cada bicho de volta no seu jeito de se organizar: as formigas na fila, da maior para a menor, e cada flor no canteiro, na linha da flor e na coluna da cor.**

## 2. A habilidade na tela

| A habilidade pede | Onde está |
|---|---|
| **lista** | a fila das formigas: uma depois da outra, e a ordem é a informação (N1) |
| **matriz** | o canteiro das abelhas: cada flor mora no cruzamento de uma linha (o tipo) com uma coluna (a cor) (N1) |
| **registro** | a ficha do filhote de passarinho: cada valor tem um rótulo ao lado (N2) |
| **grafo** | a teia da aranha: o fio diz quem se liga com quem (N2) |
| **não estruturada** | a coisa solta que o vento trouxe sozinha (um número, uma palavra, um sim) (N3) |
| **identificar** | o redemoinho do N3 mistura as peças; cada uma volta para o bicho cuja forma combina com ela |

O exemplo oficial da BNCC (*"organizar personagens por tamanho…, figuras por cor, por tipo"*) é literalmente o N1: formigas por **tamanho** e flores por **tipo e cor**.

## 3. O laço do N1

1. **A estrutura aparece inteira.** A fila das formigas marchando para o formigueiro, ou o canteiro florido. O cabeçalho mostra o nome (FILA ou GRADE) e a regra em desenho.
2. **Vem a ventania.** Riscos de vento e folhas cruzam a tela, as formigas saem rolando e caem espalhadas; as flores voam do canteiro e caem num montinho ao lado.
3. **A criança conserta, uma peça por vez.**
   - **Fila:** o lugar da vez na trilha é sempre o próximo. A criança **toca na formiga** que vem agora (a maior que sobrou); ela corre para a fila.
   - **Grade:** a abelha Zuzu pega a próxima flor do montinho e fica esperando no ar. A criança **toca na casinha** do canteiro onde ela mora; a Zuzu voa e planta.
4. **Errou:** a cena mostra o estrago (a formiga tropeça e a folha cai; a flor murcha), a faixa diz o motivo, e a partida acaba (`WRONG_ANSWER` + `lose()`).
5. **Estrutura completa:** ela ganha vida. As formigas marcham para dentro do formigueiro; o canteiro balança e a Zuzu dá uma voltinha. A bolinha da fase acende e vem a próxima.

Sem relógio. Tocar fora dos alvos não faz nada.

## 4. Controle

| Fase | Alvos tocáveis | O gesto |
|---|---|---|
| fila | as formigas que ainda estão espalhadas (até 4) | tocar = esta vem agora |
| grade | as casinhas vazias do canteiro (até 6, grade limpa) | tocar = a flor mora aqui |

Um toque por decisão. Na fila a criança decide **qual** (o lugar é sempre o próximo); na grade decide **onde** (a peça já está escolhida). É a diferença entre as duas estruturas: na lista a posição é a ordem; na matriz a posição é o cruzamento.

Os alvos da vez ganham a mesma borda amarela pulsante, todos por igual (regra de 14/10/2026); no computador, o mouse basta. A ajuda `?` fica no canto direito do cabeçalho.

**Teto de alvos:** 4 formigas soltas, ou 6 casinhas numa grade de 2 × 3. Regiões tocáveis da tela: 2 (a área da vez e o `?`).

## 5. A tela (1280 × 720)

```
┌───────────────────────────────────────────────────────────────────────┐
│ [Nível 1] ●○○○ │  [FILA]  🐜 › 🐜 › 🐜  da maior para a menor  │  (?) │  faixa 96
├───────────────────────────────────────────────────────────────────────┤
│        🐜            🐜                  🐜           🐜              │  formigas
│                                                                       │  espalhadas
│  ⛰                                                                   │
│ formi-  ○ · · · · · · · · · · · · · · · · · · · · · · · · · · · · ·   │  trilha
│ gueiro  ↑ o lugar da vez                                              │
└───────────────────────────────────────────────────────────────────────┘
```

- **Fila.** O formigueiro fica à **esquerda** (x ≈ 140) e a trilha corre para a direita. A formiga da frente fica junto do formigueiro, e as outras vêm atrás, para a direita; assim a fila se lê da esquerda para a direita **na mesma ordem da regra** (maior, depois menor). Lugares da fila em x 330, 490, 650, 810 (pés em y 584). As formigas espalhadas ficam na faixa de cima (pés entre y 296 e 360), tombadas e viradas para lados diferentes. Tamanhos: 1,00 · 0,77 · 0,58 · 0,44 (a maior com ~170 px); a zona de toque tem no mínimo 150 px.
- **Grade.** O canteiro fica no meio (x 640, y 450), casinhas de 150 px com 18 px de vão. As **estacas das linhas** ficam à esquerda (uma placa com a silhueta da flor, em cinza, sem cor) e as **estacas das colunas** no alto (uma fita com a cor). A Zuzu espera com a flor em x 1060, y 330; o montinho de flores caídas fica embaixo à direita.
- **Cabeçalho em faixas**, de ponta a ponta: nível e bolinhas (uma por fase) | o pedido no meio (o nome da estrutura numa pílula + a regra em desenho + uma frase curta) | `?`.

| Estrutura | Pílula | Desenho | Frase |
|---|---|---|---|
| fila | **FILA** | três formigas, da maior para a menor, com setinhas | *da maior para a menor* |
| grade | **GRADE** | uma gradinha 2 × 2 com uma flor na linha e uma cor na coluna | *linha da flor, coluna da cor* |

## 6. Os bichos e as coisas

| Peça | Como é | Atributo que importa |
|---|---|---|
| formiga | chibi vermelho-tijolo, cabeça grande, olhos grandes, antenas, segura uma folha verde no alto | **tamanho** (4 tamanhos bem diferentes) |
| flor | caule e folhinha; a cabeça é **margarida** (pétalas redondas em volta), **tulipa** (copinho de três pontas) ou **estrela** (cinco pétalas pontudas) | **tipo** (forma) e **cor**: amarela, azul ou rosa |
| Zuzu | abelha chibi, listras, asinhas, segura a flor com as patinhas | — (é quem carrega) |
| Pipa | esquilinha chibi laranja com rabo enorme, guardiã da floresta | — (só fala na abertura) |

No N1 só entram margarida e tulipa; a estrela fica para o N3.

## 7. O N1 — A FILA E A GRADE

Assunto: **quando a organização é pela posição, o lugar diz alguma coisa** — na fila, a ordem; na grade, o cruzamento. Uma estrutura por fase, nunca as duas na mesma tela.

| Fase | Estrutura | Conteúdo | Ensina |
|---|---|---|---|
| 1 | FILA de 3 | três formigas | a fila (demonstração) |
| 2 | FILA de 4 | quatro formigas | — |
| 3 | GRADE 2 × 2 | margarida e tulipa × amarela e azul | a grade (demonstração) |
| 4 | GRADE 2 × 3 | margarida e tulipa × amarela, azul e rosa | — |

**Formigas espalhadas** (posição da esquerda para a direita → tamanho, 0 = a maior):

| Fase | Espalhadas |
|---|---|
| 1 | 1 · 0 · 2 |
| 2 | 2 · 0 · 3 · 1 |

**Ordem em que a Zuzu traz as flores:**

| Fase | Ordem |
|---|---|
| 3 | tulipa amarela · margarida azul · tulipa azul · margarida amarela |
| 4 | margarida rosa · tulipa amarela · margarida azul · tulipa rosa · margarida amarela · tulipa azul |

**Validação** (`validateLevels`, só em DEV):
- fila: os tamanhos são 0..n-1 sem repetir, com 3 ou 4 formigas; a maior nunca está na ponta esquerda; a ordem espalhada não é a ordem certa nem a inversa;
- grade: as flores trazidas cobrem cada casinha uma vez só; duas flores seguidas nunca dividem a linha **e** a coluna com a anterior de um jeito que repita a mesma casinha; a 1ª flor não vai na casinha do canto de cima à esquerda (para a demonstração não parecer "começa pelo começo"); a ordem não é a de leitura;
- N1: só FILA e GRADE; as fases que ensinam são a 1ª de cada estrutura;
- a resposta certa não fica nos dados: `nextAnt` (a maior que sobrou) e `fits(cell, flor)` (`data/logic.ts`) decidem no instante do toque.

## 8. Erro (a cena antes do `lose()`)

| Onde | O que a criança vê | Faixa |
|---|---|---|
| fila | a formiga escolhida corre para o lugar; a maior que sobrou dá um pulinho de susto; a escolhida tropeça, a folha dela cai e rola | *"Tem uma formiga maior!"* |
| grade, linha errada | a Zuzu planta; a flor murcha (encolhe, tomba, perde a cor); a estaca da linha treme; a casinha certa acende de leve | *"Aqui é lugar de tulipa!"* (o tipo da linha tocada) |
| grade, coluna errada | igual, tremendo a estaca da coluna | *"Aqui é lugar de flor azul!"* (a cor da coluna tocada) |

Se linha e coluna estão erradas, vale a frase da linha. Depois de ~2 s vêm `WRONG_ANSWER` e `lose()`, uma vez.

## 9. Abertura e tutorial do N1 (uma vez por sessão)

1. **Abertura** (`OPENING_KEY`): a fila das formigas marcha na trilha. A Pipa entra pulando: *"Oi! Eu cuido da floresta."* [Próximo]. **Ventania:** as formigas saem rolando. Pipa: *"Que ventania! Bagunçou tudo!"* [Próximo] → *"Vamos pôr tudo no lugar!"* [Vamos!]. A Pipa sai.
2. **Fila (fase 1):** guia com recorte no pedido do cabeçalho: *"Da maior para a menor!"* [Ver]. **Demonstração sem balão:** a bolinha de toque afunda na maior formiga e solta ondinha; ela corre para o 1º lugar. Guia com recorte nas formigas que sobraram: *"Sua vez!"* [Vamos!].
3. **Grade (fase 3):** a ventania leva as flores. Guia com recorte nas estacas das linhas: *"A linha diz a flor."* [Próximo]; nas estacas das colunas: *"A coluna diz a cor."* [Ver]. **Demonstração:** a Zuzu traz a 1ª flor; a estaca da linha dela e a da coluna dela pulam juntas, e a casinha do cruzamento acende; a bolinha toca nela e a Zuzu planta. Guia com recorte no canteiro: *"Sua vez!"* [Vamos!].

O que a demonstração fez conta: a criança continua dali. Numa partida repetida, a abertura e as demonstrações não aparecem.

O `?` (em jogo) repete a regra da estrutura da tela: *"Da maior para a menor!"*, ou os dois balões da grade, com o botão *Continuar*.

## 10. Fim de fase e de nível

- **Fila completa:** a fila marcha para dentro do formigueiro, uma formiga depois da outra, com poeirinha; a pílula FILA pula; faíscas.
- **Grade completa:** as flores balançam juntas, a Zuzu dá uma volta sobre o canteiro; a pílula GRADE pula; faíscas.
- `CORRECT_ANSWER` (10 pontos) por fase, a bolinha acende, e a tela escurece para a próxima.
- Na 4ª fase: confete, `GAME_COMPLETED` (`stage` = nível, `totalStages: LEVELS.length`) e `showLevelComplete`. Sem quadro de resumo.

## 11. N2 e N3

Pedido do usuário (20/10/2026): *"faça n2 e n3, e faça as texturas"*. Mesmo laço do N1: a organização aparece inteira, a ventania desmonta, a criança conserta **com um toque por decisão**, errou mostra o estrago e perde (`WRONG_ANSWER` + `lose()`), sem relógio, no máximo 4 alvos.

### N2 — A FICHA E A TEIA

Assunto: **quando a organização não é pela posição**. Na ficha, cada valor tem um **nome** (rótulo) ao lado; na teia, só importa **quem se liga com quem**.

| Fase | Estrutura | Conteúdo | Ensina |
|---|---|---|---|
| 1 | FICHA de 2 campos | 3 ninhos, 3 filhotes | a ficha (demonstração) |
| 2 | FICHA de 3 campos | 4 ninhos, 4 filhotes | — |
| 3 | TEIA de 3 bichos | 3 fios | a teia (demonstração) |
| 4 | TEIA de 4 bichos | 4 fios | — |

#### FICHA (registro)

- **A cena** (`bg-ninhos`): um galho grosso atravessa a tela; em cima dele, 3 ou 4 **ninhos**, cada um com a sua **ficha** pendurada embaixo por um barbante. A ficha é um cartãozinho com uma linha por campo: à esquerda o **rótulo** (um ícone cinza dentro de um círculo: 🪶 PENA, bico BICO, tufo TOPETE) e à direita o **valor** (a cor pintada, ou o tufo/sem tufo).
- **Os campos:** `pena` e `bico` são **cores** do mesmo conjunto (`laranja` `#F08A3C`, `verde` `#5DBB63`, `roxo` `#9B7BD8`), e é isso que torna o rótulo indispensável: *pena laranja + bico verde* é outro filhote que *pena verde + bico laranja*. O 3º campo, `topete`, é `sim`/`nao` (um valor verdade dentro do registro).
- **Abertura da fase:** os filhotes estão nos ninhos; a ventania sopra e eles caem rolando num montinho de folhas embaixo do galho, tontos. As fichas ficam.
- **O laço:** a Pipa pega o próximo filhote do montinho e o segura no alto (como a Zuzu com a flor). A criança **toca no ninho** cuja ficha descreve aquele filhote. O filhote voa (pulinhos de asa) até o ninho.
- **Certo:** o filhote se aninha, pia, e a ficha balança. **Errado:** ele pousa no ninho errado e estranha; na ficha desse ninho, a linha que não bate **treme** e o valor do filhote naquele campo acende nele (a pena ou o bico pisca); faixa: *"Nessa ficha, a PENA é verde!"* (rótulo + valor da linha que não bate; a 1ª que não bate, na ordem pena, bico, topete).
- **Dados que garantem a leitura** (validação): cada filhote combina com **exatamente um** ninho; em toda fase existe um par de ninhos com as **duas cores trocadas** (pena ↔ bico); nenhum ninho é igual a outro; o 1º filhote não vai no ninho da ponta esquerda; a ordem dos filhotes não é a dos ninhos.
- `fits(nest, chick)` = todos os campos da ficha iguais aos do filhote (`data/logic.ts`).

#### TEIA (grafo)

- **A cena** (`bg-teia`): o canto entre dois galhos, com galhinhos espetados em volta. Em cada galhinho, um **bichinho** (joaninha, borboleta, grilo, caracol). A **teia** liga alguns pares com um fio (desenhado pelo código, assado em textura). A aranha **Tecê** fica no meio.
- **A ventania** arrebenta os fios **e troca os bichos de galhinho** (cada um voa para outro lugar). Os fios somem.
- **O lembrete:** a Tecê guarda a teia como uma lista de pares. Ela mostra **um par por vez** num cartãozinho no pedido do cabeçalho: os dois bichos com um fio entre eles. A Tecê vai até o **primeiro** bicho do par e segura a ponta do fio; a criança **toca no outro**. A Tecê estica o fio até ele.
- **O que ensina:** depois da ventania os bichos estão em **outros lugares**, e a teia fica certa do mesmo jeito: no grafo, o lugar não importa, só a ligação. No fim, a mesma teia (os mesmos pares) aparece com outro desenho.
- **Certo:** o fio estica e brilha; o bicho dá um pulinho. **Errado:** o fio vai ao bicho errado, arrebenta e a Tecê despenca pendurada no fio; o bicho do par pula de susto; faixa: *"O fio liga a joaninha ao grilo!"*.
- **Dados** (validação): 3 bichos com 3 fios (triângulo) ou 4 bichos com 4 fios; nenhum par repetido; a nova posição de cada bicho é diferente da antiga; o par da vez nunca é o mesmo bicho de ponta seguida.

#### Ajuda e tutorial do N2

- **Ficha (fase 1):** recorte numa ficha: *"A ficha diz como é."* [Próximo]; recorte nos rótulos dessa ficha: *"Olhe o nome de cada linha."* [Ver]. **Demonstração:** a Pipa segura o 1º filhote; as linhas da ficha certa acendem uma por vez junto da parte do filhote (pena, bico); a bolinha toca no ninho. *"Sua vez!"*
- **Teia (fase 3):** recorte no cartão do par: *"O fio liga os dois."* [Ver]. **Demonstração:** a Tecê vai ao 1º bicho; a bolinha toca no 2º; o fio estica. *"Sua vez!"*
- `?`: repete a fala da estrutura da tela.

### N3 — O REDEMOINHO

Assunto: **identificar**. O redemoinho misturou pedaços das organizações e trouxe também **coisas soltas** (não estruturadas). Cada pedaço cai no meio da tela, e a criança toca na **casa** para onde ele vai.

- **As casas** (`casas.png`), na beira de baixo, em fila: **formigueiro** (FILA), **canteiro** (GRADE), **ninho com ficha** (FICHA), **teia** (TEIA) e **cesta da Pipa** (SOLTO). Cada casa tem o nome numa pílula embaixo (as palavras que o jogo já ensinou), e no máximo **4 casas por fase**.
- **Os pedaços** (`pedacos.png`) se entregam pela **forma**, sem legenda:

| Pedaço | Forma | Casa |
|---|---|---|
| 3 pedrinhas da maior para a menor, em fila | ordem | FILA |
| a lista de coisas da Pipa (folha com noz, bolota, semente uma embaixo da outra, com setinhas) | ordem | FILA (pegadinha: parece ficha) |
| uma gradinha 2 × 2 com flores | cruzamento | GRADE |
| o tempo da semana (tabelinha: 3 dias × sol/chuva, marquinhas nos cruzamentos) | cruzamento | GRADE (pegadinha: parece lista) |
| um cartãozinho com 2 linhas de ícone + valor (como a ficha dos filhotes) | rótulo + valor | FICHA |
| o crachá do grilo (ícone de pata = 6, ícone de cor = verde) | rótulo + valor | FICHA |
| dois bichinhos ligados por um fio | ligação | TEIA |
| um mapinha de 4 pedrinhas ligadas por trilhas | ligação | TEIA |
| uma pedrinha com **um número** sozinho (o 7) | solto | SOLTO |
| um balão de fala com **uma palavra** sozinha (OI) | solto | SOLTO |
| um **sim** sozinho (um sol nascendo com um ✓) | solto | SOLTO |

- **Fases:**

| Fase | Casas | Pedaços (ordem) | Ensina |
|---|---|---|---|
| 1 | FILA · GRADE · SOLTO | pedrinhas · número · gradinha | o redemoinho (demonstração) |
| 2 | FICHA · TEIA · SOLTO | dois bichos · cartãozinho · palavra · mapinha | — |
| 3 | FILA · GRADE · FICHA · TEIA | lista da Pipa · crachá · tempo da semana · dois bichos | — |
| 4 | FILA · FICHA · TEIA · SOLTO | o sim · mapinha · cartãozinho · pedrinhas | — |

- **O laço:** o redemoinho gira no meio (riscos de vento em espiral, folhinhas); ele **cospe um pedaço**, que fica girando devagar no ar acima das casas. A criança toca numa casa; o pedaço voa até ela.
- **Certo:** a casa reage do jeito dela (o formigueiro solta uma formiguinha que dá tchau, o canteiro brota, o ninho pia, a teia brilha, a cesta balança) e o pedaço entra. **Errado:** o pedaço **não cabe**: bate na casa e quica para fora, a casa treme, e a casa certa acende de leve; faixa com o porquê: *"Isso tem ordem: é uma FILA!"* · *"Isso tem linha e coluna: é uma GRADE!"* · *"Cada valor tem um nome: é uma FICHA!"* · *"Isso liga um ao outro: é uma TEIA!"* · *"Isso está sozinho: é SOLTO!"*.
- **Tutorial (fase 1):** recorte nas casas: *"Cada coisa tem sua casa."* [Ver]. **Demonstração:** o redemoinho cospe as pedrinhas; a fila do pedaço e a casa FILA piscam juntas; a bolinha toca na casa. *"Sua vez!"*
- **Dados** (validação): até 4 casas por fase, todas com pedaço que vai para elas; cada pedaço vai para uma casa que está na fase; o 1º pedaço não vai na casa da ponta esquerda; nenhuma casa recebe dois pedaços seguidos.

### O que mudou do rascunho anterior

| Rascunho | Agora | Por quê |
|---|---|---|
| ficha: tocar no campo de cada valor solto | ler a ficha e levar o filhote ao ninho certo | encaixar valor no campo do mesmo desenho é só casar figuras; com duas cores (pena e bico) é o **rótulo** que decide |
| teia: tocar nos dois pontos do par | a Tecê já está no 1º; a criança toca só no 2º | um toque por decisão, como no N1 |
| redemoinho com 5 bichos ao mesmo tempo | no máximo 4 casas por fase | teto de alvos no celular |

## 12. O que mudou da ficha, e por quê

| Ficha | Aqui | Motivo |
|---|---|---|
| quintal de mudança, caminhão, caixotes | floresta, bichos e a ventania | o usuário pediu natureza e gameplay divertido |
| tocar no caixote certo para cada cartão | consertar a estrutura seguindo a regra dela | escolher o caixote é o N2 do Museu (042) |
| 4 cartões no varal + 5 caixotes | uma estrutura por fase, até 4 alvos (6 em grade) | teto de alvos no celular |
| TRAVA com cadeado, +15/+5, a certa balança depois de 2 travas | o estrago acontece e a partida acaba (`WRONG_ANSWER` + `lose()`) | errou, perdeu; nada pulsa entregando a resposta |
| inventário e álbum no fim | as formigas entram no formigueiro, o canteiro balança | sem quadro de resumo |
| TÍTULO → exemplo 5 s → JOGO → RESULTADO | abertura com a Pipa, demonstração e `?` | fluxo da plataforma |
| CAIXA LIVRE no N3 | a cesta da Pipa no N3 | a ficha manda; o N1 não tem coisa solta |

## 13. Dados e arquivos

```
index.ts  types.ts
data/   files.ts layout.ts theme.ts timing.ts logic.ts levels.ts words.ts
scenes/ BootScene.ts GameScene.ts fallback.ts art.ts audio.ts header.ts
        line.ts garden.ts nests.ts web.ts whirl.ts
        wind.ts pipa.ts touch.ts guide.ts bubble.ts banner.ts
```

| Arquivo | O que tem |
|---|---|
| `line.ts` | FILA: formigas, trilha, marcha |
| `garden.ts` | GRADE: canteiro, estacas, Zuzu |
| `nests.ts` | FICHA: galho, ninhos, fichas (linhas montadas com ícone + valor), filhotes, montinho, a Pipa segurando o filhote |
| `web.ts` | TEIA: galhinhos, bichos, a Tecê, fios (uma textura de fio assada, esticada por escala) |
| `whirl.ts` | N3: redemoinho (espiral assada girando por tween + 6 folhinhas), casas com a pílula, o pedaço da vez |
| `data/logic.ts` | `nextRank`/`fits` (N1), `nestFits`/`firstMismatch` (FICHA), `edgeFits` (TEIA), `homeOfPiece` (N3): a resposta certa sai daqui no toque, nunca dos dados da fase |

**Arte:** os três níveis rodam inteiros com a **arte de reserva** em Graphics, assada nas mesmas folhas, grades e ordem de células do TEXTURAS (`scenes/fallback.ts`, incluindo as folhas do §11). Um PNG com o mesmo nome em `src/assets/games/EF15CO01/ventania-na-floresta/` substitui a reserva sem mudar código. Posições que dependem do desenho e se ajustam ao PNG: `NEST.beak`/`NEST.crest` (onde pisca o bico e onde vai o topete, em fração do filhote) e `PIECE_TEXT_AT` (onde o código escreve 6, 7 e OI nos pedaços).

## 14. Dúvidas

1. **Linha de arte.** Usei a padrão da rodada, **chibi de figurinha** (`references/19-chibi-figurinhas.jpg`), nos prompts do TEXTURAS. Se quiser outra (a floresta chapada `36`, o doodle `39`…), troco os blocos de estilo.
2. **"Da maior para a menor" nas duas filas do N1.** Mantive a mesma direção para não somar regra. O N2 pode virar a direção (*da menor para a maior*) se o N1 ficar fácil demais.
3. **A ordem das flores é do jogo.** A Zuzu escolhe qual flor vem; a criança só escolhe o lugar. Se ficar fácil no fim (a última casinha é óbvia), a última flor pode ser plantada sozinha.

## Histórico

- 20/10/2026: N2 e N3 em código (Ferro), `LEVELS = [N1, N2, N3]`, com a arte de reserva das folhas do §11. Dados escolhidos: FICHA 1 com ninhos laranja/verde · verde/laranja · roxo/laranja; FICHA 2 com 4 ninhos (roxo/verde com e sem topete, verde/roxo, laranja/roxo); TEIA 1 triângulo joaninha–grilo–borboleta; TEIA 2 o ciclo de 4; as casas do N3 nem sempre na mesma ordem, para o 1º pedaço não ir na ponta esquerda. A abertura da Pipa ficou só no N1. Jogado com cliques reais (Chrome headless pelo CDP): N2 inteiro (tutorial e demonstração da ficha e da teia, as quatro fases, `?` na teia, o fim do N2 passando sozinho para o N3), N3 inteiro até "Nível 3 completo!" (`GAME_COMPLETED`, JOGAR DE NOVO), `?` no N3, e um erro de cada tipo, cada um com um `WRONG_ANSWER` + `GAME_OVER` só: ficha (*"Nessa ficha, a PENA é roxa!"*), teia (*"O fio liga o grilo à borboleta!"*) e redemoinho (*"Isso tem linha e coluna: é uma GRADE!"*). A abertura do N1 continua igual.
- 20/10/2026: N2 (ficha + teia) e N3 (redemoinho) planejados no §11 e despachados ao time, junto com as texturas (pedido do usuário).
- 20/10/2026: plano e N1 em Graphics. Id 131 no catálogo (order 422), `NEXT_FREE_ID` = 132 (o 130 foi para a Tartaruga do Tempo, de outra sessão). Servidor `jogos-dev-ventania` (porta 5313). `LEVELS = [N1]` (só para teste): o fim do N1 mostra JOGAR DE NOVO.
- Jogado com cliques reais (Chrome headless pelo CDP, porque o painel do navegador travou): a abertura com a Pipa e a ventania, o tutorial e a demonstração da fila, a fase 1 inteira, o erro da fila (*"Tem uma formiga maior!"*), o `?`, o tutorial e a demonstração da grade, o erro da grade (*"Aqui é lugar de tulipa!"*, `WRONG_ANSWER:1` + `GAME_OVER:1`) e a fase 4 até "Nível 1 completo!" (`CORRECT_ANSWER`, `GAME_COMPLETED` 1/1).
- Ajustes depois de ver: a fala da Pipa sai acima dela antes da ventania e à esquerda depois (sobre a trilha vazia), para não tapar as formigas; a faixa do erro fica entre as formigas e a trilha na fila (y 446) e embaixo do canteiro na grade (y 664); os balões da grade ficaram estreitos (420 px) e encostados à direita; o brilho da casinha certa apaga depois da demonstração; a abelha sai da frente da casinha certa no erro; os tamanhos das formigas abriram para 1 · 0,77 · 0,58 · 0,44.
