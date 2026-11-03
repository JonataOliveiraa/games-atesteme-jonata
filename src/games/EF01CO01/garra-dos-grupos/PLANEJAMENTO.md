# Garra dos Grupos — planejamento

Jogo **091** · EF01CO01 · 1º ano · 3ª rodada (piloto, **só o N1**).
Documento irmão: [TEXTURAS.md](./TEXTURAS.md). Ficha: `docs/rodada-3/EF01CO01.md`.
Padrão: `docs/rodada-3/PADRAO-R3.md`. A ficha é a fonte; só muda o que o padrão obriga (§3).

---

## 1. O jogo em uma frase

Uma máquina de garra de fliperama. O visor mostra uma cor. A garra vai e volta
sozinha, a bandeja gira embaixo, e a criança **toca** para a garra descer e
pegar um item da cor pedida. Cinco itens enchem a caixinha, e o painel mostra
**IGUAIS** aqui dentro e **DIFERENTES** ali fora.

Um gesto só: tocar. Não há mira nem arrasto.

## 2. A habilidade e os irmãos

> **(EF01CO01)** Organizar objetos físicos ou digitais considerando diferentes
> características para esta organização, explicitando semelhanças (padrões) e diferenças.

| O que a BNCC pede | Onde acontece |
|---|---|
| organizar por uma característica | cada agarre compara o item com a cor do visor |
| semelhanças (padrão) | a caixinha cheia: 5 itens de tipos diferentes e a mesma cor |
| diferenças | o painel do fim da caixinha: o que ficou na bandeja, cada um com a sua cor |

**O teste da bolinha:** troque os itens por bolinhas da mesma cor e o jogo
morre, porque não sobra nada para comparar. Por isso a regra vive no par
item × visor, e a validação (§6) exige que o **tipo** do item não entregue a cor.

**Irmãos:** a *Base dos Classificadores* põe as pedras no cesto sem tempo, e a
*Corrida dos Parecidos* escolhe a faixa com o carro andando. A Garra é a única
em que o grupo **se forma na frente da criança** e o que sobra vira a lição das
diferenças. Da Base herdamos uma regra: **a caixinha é neutra** (transparente,
sem cor) e quem diz a regra é só o visor.

## 3. O que mudou da ficha, e por quê

| Ficha | Aqui | Motivo |
|---|---|---|
| TÍTULO → exemplo 5 s → JOGO → RESULTADO | sem título; o exemplo virou o guia visual (§9); o resultado é o `showLevelComplete` | PADRAO-R3 §2 |
| layout responsivo, paisagem e retrato | 1280 × 720 fixo, `Scale.FIT` | PADRAO-R3 §1 |
| `?` abre um painel ilustrado | `?` pausa e repete o guia visual | PADRAO-R3, diretrizes |
| contador do grupo "1/5" | 5 vagas na frente da caixinha, preenchidas uma a uma | INSTRUCOES: número de acerto não vai para a tela |
| estrelas e jogar de novo no fim da **rodada** | o fim da caixinha mostra só IGUAIS/DIFERENTES; estrelas e jogar de novo só no fim do **nível** | PADRAO-R3 §2 (`showLevelComplete`) |
| 3 níveis | 3 níveis × 3 fases (§6). O N1 era só o piloto; o N1·1 tem 4 frutas e caixinha de 2 | pedido do usuário (28/09/2026) |
| N2 "1ª caixinha por cor, 2ª por tamanho" | cor → tamanho → cor nas 3 fases | o nível tem 3 fases; a troca continua a cada caixinha |
| N3 "NÃO é redondo" / "NÃO é grande" | "NÃO REDONDOS" só nas formas; "NÃO GRANDES" em frutas e formas | redondo só tem leitura segura nas formas |
| 20 itens (4 bandejas × 5) | 2 bandejas (frutas, formas); formas em 5 cores por tint; tamanho por escala | sem arte nova; animais e bonecos ficam de fora |
| sons de trilho, clac, plim, trava | os mesmos, sintetizados em WebAudio | PADRAO-R3: sem narração, sem arquivo de áudio |
| TRAVA no erro (garra congela, cadeado, devolver); brilho após 2 travas; +5 depois de trava | **todo item agarrado é arremessado** na caixinha, com balanço, zoom e voo. Certo: festa. Errado: o item cai, animação de erro, e **a partida acaba** (`WRONG_ANSWER` + `lives.loseAll()`). Não existe mais trava, devolução, brilho por sequência nem +5 | decisão do usuário (28/09/2026); ela antecipa o "1 erro = perdeu" do PADRAO-R3 §3 |
| telemetria de travas por característica e tempo de decisão | só `CORRECT_ANSWER`/`WRONG_ANSWER` por item | a bridge não tem esses campos; fica como pendência |

**Fica em aberto: o brilho desde o início** (a ficha pede no N1; ver §8 e *Dúvidas*).

**Leituras da ficha** (a ficha não diz, e eu li assim):
- *"agarrar o item logo abaixo"*: vale o item que está sob a garra **no
  instante do toque**. A bandeja para enquanto a garra desce e sobe, para o item
  não sair de baixo dela. Ver *Dúvidas*.
- *"8 itens"*: 5 da cor e 3 de fora, **sem reposição**. Os 3 que sobram são
  exatamente os DIFERENTES do painel.
- *"rodada só segue após devolver"*: ter o item travado na garra é um estado.
  Nele o único toque que vale é o que devolve.

## 4. O laço

```
visor acende a cor ─► garra varre (2,5 s por travessia) + bandeja gira (12 s por volta)
        ▲                          │ toque
        │                          ▼
        │            bandeja para · garra desce · fecha
        │          ┌───────────────┼──────────────────┐
        │       vazio             certo              errado
        │   sobe vazia,       clac, sobe,        TRAVA: garra congela,
        │   não conta         item cai na        cadeado e visor piscam,
        │        │            caixinha (plim)    balão ≠ · WRONG_ANSWER (1× por vaga)
        │        │                 │                  │ toque
        └────────┴─────────────────┤          devolve o item, destrava ──┐
                                   ▼                                     │
                      5 vagas cheias? ── não ─────────────────────────────┘ (volta a varrer)
                                   │ sim
                    laço na caixinha · painel IGUAIS / DIFERENTES · ▶
                                   │
                    próxima caixinha, ou fim do nível → showLevelComplete
```

## 5. A tela (1280 × 720)

As chaves ficam no `data/layout.ts`, que é da Brasa. Estes números são o contrato.

| Região | Caixa (x, y, w, h) | O quê |
|---|---|---|
| HUD | 0, 0, 1280, 82 | vidas (40, 40); 3 bolinhas das caixinhas no centro; `?` em (1220, 44) |
| visor | 300, 92, 340, 92 | gota da cor pintada + a palavra (`VERMELHOS`), centrado sobre a vitrine |
| trilho | x 150 → 790, y 214 | a garra varre esse trecho; o cabo desce dali |
| vitrine | 40, 200, 860, 500 | vidro do gabinete; **toda ela aceita o toque** |
| bandeja | centro (470, 560), elipse 720 × 220 | 8 itens na borda; os da metade de trás ficam menores e não são alcançáveis |
| caixinha | centro (1080, 480), 280 × 300 | fundo + itens + frente; 5 vagas na frente |
| painel do fim | IGUAIS em (1080, 300); DIFERENTES em (470, 400); ▶ em (1180, 640), 110 × 110 | só no fim da caixinha |

**Densidade.** Há **1 região tocável** durante o jogo, a vitrine, mais o `?`. No
fim da caixinha o ▶ entra e a vitrine sai. Dos 8 itens, só **3 a 4** ficam no
arco da frente, ao alcance, e os de trás aparecem menores. Nenhum item é um
alvo de toque: quem mira é o tempo. O teto de 4 alvos está respeitado.

**Agarre.** Alcançáveis são os itens do arco da frente (`sin θ > 0,25`). Vale o
mais próximo da garra em x, desde que a distância seja ≤ 75 px. Com 8 itens, a
distância entre vizinhos da frente é de ≥ 200 px, então nunca há dois
candidatos. O facho sob a garra tem a **mesma cor neutra (ciano)** para
qualquer item: ele fecha e acende sobre um item e fica aberto e apagado no vazio.
Ele avisa a mira, não a resposta.

## 6. Níveis, fases e a regra (`data/levels.ts`)

São **3 níveis com 3 fases (caixinhas) cada**, na mesma mecânica. Mudam a
característica, a quantidade de itens e a velocidade (PADRAO-R3). Um nível,
um assunto:

- **N1, organizar por COR:** 12 s, brilho desde o início.
- **N2, a característica troca (cor → tamanho → cor):** 9 s, sem brilho.
- **N3, pela negação (NÃO):** 7 s, sem brilho, com um item "quase igual".

| Fase | Bandeja | Visor (regra) | Itens | Na caixinha | Observação |
|---|---|---|---|---|---|
| N1·1 | frutas | VERMELHOS | **4** | **2** | maçã e morango vermelhos; de fora, maçã verde e banana |
| N1·2 | formas | AZUIS | 8 | 5 | círculos, quadrado e triângulos azuis; de fora, 3 formas de outras cores |
| N1·3 | frutas | AMARELOS | 8 | 5 | bananas, maçã e peras amarelas; de fora, maçã vermelha, pera e uva verdes |
| N2·1 | frutas | VERMELHOS | 10 | 5 | tamanhos misturados dos dois lados: o tamanho é ruído |
| N2·2 | formas | GRANDES | 10 | 5 | cores e formas misturadas; o círculo azul aparece grande (entra) e pequeno (fica) |
| N2·3 | frutas | VERDES | 10 | 5 | maçã, pera e uva verdes em dois tamanhos; de fora, 5 de outras cores |
| N3·1 | formas | NÃO REDONDOS | 10 | 5 | quadrados e triângulos entram; círculos ficam, e o azul existe dos dois lados |
| N3·2 | frutas | NÃO GRANDES | 10 | 5 | **quase igual:** maçã vermelha pequena entra, a grande fica (a banana também) |
| N3·3 | formas | NÃO GRANDES | 10 | 5 | **quase igual:** triângulo rosa pequeno entra, o grande fica |

**Por que o N1·1 tem 4 frutas e caixinha de 2.** O pedido é "apenas 4
frutas". Com 2 da cor e 2 de fora:
- sobram **DIFERENTES** de 2 cores para o painel;
- a maçã aparece dos dois lados, então o tipo não entrega a cor;
- é a fase mais curta do jogo, com 2 agarres.

Com 3 + 1, o painel mostraria um DIFERENTE só, e a fase ensinaria menos a
diferença. Como 1 erro já perde a partida, o brilho do N1 segura essa estreia.

**Tamanho.** É só a escala do sprite: `SIZE_SCALE = { big: 1, small: 0.6 }`
em `data/items.ts`, que dá 120 px contra 72 px na frente da bandeja. O N1 é
todo `big`, o tamanho de sempre.

**Forma.** Existe só nas formas: `ItemDef.shape` vale `round`, `square` ou
`triangle`. Fruta não tem forma no dado, porque "maçã é redonda?" é ambíguo
no 1º ano. As formas em 5 cores vêm por `tint` das mesmas 3 células, sem arte
nova.

```ts
type Rule = { feature: 'color'; color; not? } | { feature: 'size'; size; not? } | { feature: 'shape'; shape; not? }
interface BoxDef { tray; rule: Rule; perBox: number; items: { id; size }[] }
interface LevelDef { level; crossMs; spinMs; glowFromStart; boxes }
matches(piece, rule)  // o veredito; `not` inverte
```

**`validateLevels` no import.** Todos os problemas saem num `console.error` em
dev; hoje a lista está vazia.

- **Toda fase:**
  - os itens existem e são da bandeja da fase;
  - entram exatamente `perBox` itens;
  - os de fora variam (≥ 2 itens diferentes);
  - regra de forma só aparece nas formas;
  - duas fases seguidas nunca repetem bandeja + característica (a regra de
    sorteio da ficha).
- **A regra não vaza por outro atributo:**
  - na cor, um tipo aparece dentro e fora;
  - no tamanho, o mesmo item aparece nos dois tamanhos;
  - na forma, uma cor aparece dentro e fora.
- **N1:** só cor, sem `not`, tudo `big`, 12 s, com brilho. A fase 1 é de
  frutas e tem **4 itens**, as outras têm 8.
- **N2:** 10 itens por fase com os tamanhos misturados, 9 s, sem brilho, sem
  `not`. Tem cor e tamanho, e a característica troca de uma fase para a seguinte.
- **N3:** 10 itens, 7 s, sem brilho, todas as fases com `not`, e pelo menos uma
  fase com o **quase igual** (mesmo item em dois tamanhos, um de cada lado da regra).

**Entre níveis:** o `showLevelComplete` com `autoAdvance` faz
`restart({level + 1, points, lives: livesLeft})`. No N3, JOGAR DE NOVO
recomeça do N1 com as vidas cheias. Concluir o N3 aprova.


## 7. O erro e a TRAVA

> **Substituída em 28/09/2026:** o erro agora é arremesso + derrota (§3 e
> Histórico). O texto abaixo fica só como registro do plano original.

- A garra fecha num item de outra cor e **congela no alto**, segurando o item.
  O cadeado pisca sobre ela e o visor pisca junto. Um balão sai da garra com a
  **gota da cor do item ≠ gota do visor** e a legenda `NÃO É VERMELHO!`
  (3 palavras, dentro do teto de 4). É a dica pelo conteúdo, nunca "tente de novo".
- O jogo emite `WRONG_ANSWER` e chama `lives.lose()` **uma vez por vaga**
  (`chargeOnce`). Uma segunda trava na mesma vaga não cobra de novo.
- **O próximo toque devolve** o item à bandeja no mesmo lugar, a garra destrava
  e a varredura recomeça. A criança volta à mesma decisão, com a mesma vaga.
- Com **2 travas seguidas**, os itens da cor ganham um brilho sutil até o
  próximo acerto. O acerto zera o contador (INSTRUCOES: contador de tolerância zera).
- Sem vermelho de punição: o cadeado e o piscar são amarelo/laranja.

**Não é erro:** a garra descer no vazio (sobe vazia, nada é emitido); tocar
durante a descida, a subida ou a queda na caixinha (o toque é ignorado); e o
toque do `?`.

**Pontos:** +10 por vaga preenchida sem trava e +5 depois de trava.
`CORRECT_ANSWER` sai quando o item cai na caixinha. Estrelas: 3 com ≥ 90% das
vagas de primeira, 2 com ≥ 70% e 1 ao concluir.

## 8. O brilho do N1 (ponto aberto)

A ficha diz *"brilho de ajuda ativo desde o início"* no N1. No código isso é um
dado, `glowFromStart`, e a troca não custa lógica.

- **A. Literal (`glowFromStart: true`).** Os 5 itens da cor brilham desde a 1ª
  caixinha. O problema é que o brilho **marca o certo**: a criança pode caçar o
  que brilha sem olhar o visor, e é o caso exato de *decisão sem pista que
  entrega*.
- **B. Alternativa (`glowFromStart: false`).** Não há brilho no começo, e vale
  a regra 5 da ficha: 2 travas seguidas acendem o brilho até o próximo acerto.
  A ajuda do N1 fica na bandeja lenta (12 s), na garra lenta e no guia visual,
  que faz um agarre certo na frente da criança.

A decisão é do usuário. Enquanto ela não vem, o código nasce com o valor que o
Orquestrador indicar.

## 9. Guia visual (1º ano, sem texto)

É o `shared/guide/createVisualGuide`, com véu, dedo e espera pelo gesto real.
Nenhuma frase aparece: a palavra do visor já está na tela.

1. **Visor.** O véu escurece tudo e deixa só o visor aceso. A gota pulsa duas vezes.
2. **Demonstração (`demo`).** O véu passa para a vitrine. Quando a garra está
   sobre um item da cor, o dedo toca e o agarre é **real**: a garra desce,
   pega o item e o leva para a caixinha, e a 1ª vaga acende. Essa vaga conta
   no progresso, mas não dá pontos nem entra nas estrelas.
3. **A vez da criança (`waitFor`).** O dedo pulsa sobre a vitrine e o véu
   continua aberto. O guia sai no primeiro agarre da criança, dê o que der.

O `?` pausa, repete os passos 1 e 2 com um agarre encenado (o item volta para a
bandeja) e retoma. A chave de "já visto" fica no `registry`, então jogar de
novo não repete o guia.

**Só no N1.** O guia roda uma vez, no N1·1 (`BoxDef.guide = ef01co01-l1`, e o
`validateLevels` só aceita guia no N1). O N2 e o N3 entram sem demonstração,
por decisão do usuário. O `?` repete o guia da regra atual em qualquer nível.
No passo 1 o visor roda `visor.explain()`: o ursinho cresce no TAMANHO e o X se
desenha no NÃO.

## 10. Feedback e áudio (WebAudio)

| Momento | Visual | Som |
|---|---|---|
| varredura | a garra balança de leve nas pontas | zumbido baixo do trilho |
| acerto | clac, a garra sobe, o item cai e a vaga acende com estrelinha | clac + plim |
| trava | garra congelada, cadeado + visor piscando, balão ≠ | travamento suave (dois tons descendo, sem buzina) |
| destrava | o item volta à bandeja e o cadeado some | clique |
| fim da caixinha | laço na caixinha; os 3 de fora pulam, cada um com a própria gota em cima; IGUAIS / DIFERENTES | fanfarrinha curta |

## 11. Ciclo da cena (`GameScene`, que não desenha nada)

Há um estado único, `mode`, com os valores `guide · sweep · drop · stuck ·
carry · boxDone · levelDone`. O toque na vitrine só vale em `sweep` (desce) e
em `stuck` (devolve). `startBox` faz `++gen`, e todo `await` é seguido de
`if (gen !== this.gen) return`. O tabuleiro entra antes do guia.

A bridge segue o padrão: `GAME_READY` e `CHECKPOINT` no `create`,
`CORRECT_ANSWER`/`WRONG_ANSWER` por vaga, `CHECKPOINT` com
`progress = round(caixinhasFeitas / boxes.length × 100)` no nível,
`GAME_COMPLETED {stage: this.level.level, totalStages: LEVELS.length}` e o
`onCommand` de START/PAUSE/RESUME. O jogo nunca emite `GAME_OVER` e nunca
escreve `isFinalStage`. As vidas vêm do `createLives`, e o saldo atravessa o
`restart`.

## 12. Arquivos e quem mexe

| Ferro | Brasa |
|---|---|
| `types.ts`, `data/levels.ts`, `data/items.ts`, `data/files.ts`, `index.ts`, `scenes/BootScene.ts`, `scenes/GameScene.ts` | `data/layout.ts`, `data/theme.ts`, `scenes/claw.ts`, `tray.ts`, `box.ts`, `visor.ts`, `hud.ts`, `audio.ts`, o guia e o `handTexture` no shared, o catálogo e `gameInstructions` |

Os módulos da Brasa devolvem `{ container, …, destroy() }`, e a GameScene os liga.

**O que é textura e o que é código:** tudo o que se move é PNG (garra, cabo,
itens, bandeja, caixinha, laço, cadeado, dedo). É código: o facho da mira, as
vagas tracejadas, as bolinhas do HUD, o `?`, o balão, o brilho e as estrelinhas.
**Antes da arte:** retângulos com o id do item e a cor em `tint`, só para testar.
Nunca é entrega.

## 13. Travas para quem mexer depois

- A cor mora **no dado do item**, não no desenho. Se a Aquarela trocar uma
  célula, o `data/items.ts` muda junto (o pior defeito deste jogo é o visor
  pedir uma cor e a criança ver outra).
- As formas são neutras e pintadas por `tint`. As cores do tint ficam em
  `theme.ts`, e as do visor são **as mesmas constantes**.
- A caixinha nunca ganha cor.
- `glowFromStart` e `glowAfterStreak` são dados do nível, não `if` na cena.

## Dúvidas para o Orquestrador

1. **Brilho do N1:** A (literal) ou B (alternativa)? Ver §8.
2. **A bandeja para no toque** enquanto a garra desce e sobe. Sem isso o item
   "logo abaixo" sai de baixo da garra (~90 px de deriva). Confirma?
3. **Balão da trava:** a Brasa sugere tirar a palavra (`Não é esta!` + gota
   riscada), porque o 1º ano pode não ler "vermelho". Eu mantive a legenda da
   ficha + o pictograma ≠. Qual das duas?
4. **Telemetria extra** da ficha (travas por característica, tempo de decisão):
   fica para quando a bridge tiver os campos?

## Histórico

- **28/09/2026.** Primeiro planejamento (Ferro), só o N1. Folhas combinadas com a
  Brasa: `guide-hand` numa célula da `itens.png`, HUD em código, e o
  `data/layout.ts` fica com ela.
- **28/09/2026, respostas do Orquestrador.** (1) O brilho começa **literal**:
  `glowFromStart: true`, e a decisão final do usuário muda só o dado. (2) A bandeja
  para no toque: aprovado. (3) O balão fica com a legenda da ficha
  `NÃO É VERMELHO!` + gota do item ≠ gota do visor. (4) A telemetria extra
  continua pendente (§3).
- **28/09/2026, contrato com a Brasa.** O `types.ts` guarda só dados, e cada
  peça exporta a própria interface. Arquivos extras dela: `cabinet.ts` (fundo),
  `ending.ts` (IGUAIS/DIFERENTES + ▶) e `guide.ts`
  (`createClawGuide(scene, {visor, claw, tray})`, com `play` e `replay`). A
  vitrine vira zona de toque no `hud.ts`, e as vidas também moram nele
  (`hud.lives`). A chave "já visto" (`ef01co01-l1`, no `registry`) é da
  GameScene. O `pickUnder` (≤ 75 px) fica no `levels.ts`, e o
  `data/items.ts` é o catálogo dos 15 itens.
- **28/09/2026, arremesso e derrota (pedido do usuário).** *"quando a garra
  pegar, ela deve balançar e jogar a fruta/formato/etc. na caixinha. se for o
  certo, animação boa, se for o errado, perde o jogo."* A ficha pedia a TRAVA,
  e o usuário a trocou. O caminho agora é: agarre → `claw.rise` →
  `claw.swing` → `claw.give` → `box.catch(view, slot, ok, cor do visor)`.
  - No certo, a vaga conta como antes (+10, `CORRECT_ANSWER`).
  - No errado: `claw.setSad(true)`, `WRONG_ANSWER` e `hud.lives.loseAll()`, que
    fica no shared, zera as vidas e emite o `GAME_OVER` uma vez. A cena vira
    `done` e nenhum toque vale mais.
  - A demo do guia também arremessa, sempre um item certo.
  - Saíram o modo `stuck`, `release`, `chargeOnce`, `pointsFor`, `starsFor` e
    `glowAfterStreak`. As estrelas são 3, porque concluir já significa zero erros.
- **28/09/2026, N2 e N3 (pedido do usuário).** *"faça n2 e n3. cada level agora
  deve ter 3 niveis. no nivel 1, coloque na fase 1 apenas 4 fruta. o resto faça
  como quiser."* Leitura: 3 níveis × 3 fases (§6).
  - O `BoxDef` ganhou `rule: Rule` (cor, tamanho ou forma, com `not`), `perBox`
    por fase e `items: { id, size }[]`.
  - O `ItemDef` ganhou `shape`, só nas formas. As formas passaram a existir em
    5 cores por `tint`, e o tamanho vem de `SIZE_SCALE`.
  - O `validateLevels` agora cobra regras por nível (§6), e as 9 fases passam
    com a lista vazia.
  - A GameScene passa a regra para o visor, a caixinha e o painel, chama
    `box.reset(perBox)` a cada fase e avança de nível com `autoAdvance`.
  - Não precisou de arte nova: os pictogramas do visor são ícones de UI da Brasa.
- **28/09/2026, guia de regra nova.** A pedido do Orquestrador, porque com 1 erro = perde uma
  regra nova sem demonstração derruba a criança. O guia roda também no N2·2
  (tamanho) e no N3·1 (NÃO). O `BoxDef.guide` carrega a chave, o
  `validateLevels` exige um guia por nível, e a GameScene passa `drawNot` ao
  `guide.play` e ao `replay` (roteiro no `guide.ts` da Brasa, §9).
- **28/09/2026, guias do N2·2 e do N3·1 removidos (pedido do usuário).** *"o tutorial
  só deve vir no N1, na fase como agora"*. O Orquestrador tirou as chaves
  `ef01co01-l2`/`-l3` do `levels.ts` e trocou a validação para "guia só no N1".
  O `?` continua repetindo o guia da regra atual (§9).
- **22/10/2026, ícone do tamanho (pedido do usuário).** *"essa icone nao explica
  exatamente oq é, fazendo jogadores ficarem confusos"*. O ícone antigo era um
  quadrado dourado grande e um quadradinho vazado. Ele falava a língua das outras
  regras: amarelo é cor e quadrado é forma, e parecia caixa de marcar. Agora são
  **dois ursinhos de pelúcia** (o prêmio da máquina), um ao lado do outro, sobre
  a mesma linha de chão e na proporção 2 : 1. O do tamanho pedido vem marrom, com
  carinha e contorno, e o outro é só uma sombra lilás. Ursinho não tem nenhuma
  cor de resposta, nenhuma forma da bandeja e não está na bandeja.
  - Quando a regra aparece, os dois ursinhos entram do mesmo tamanho e o aceso
    **cresce** (em PEQUENOS, encolheria). No NÃO GRANDES, depois de crescer, o X
    se desenha por cima do ursinho grande, não do par inteiro. O visor espera
    essa animação antes de a bandeja girar.
  - O mesmo par aparece no cartão ≠ da caixinha e nas etiquetas do fim.
  - O `drawNot` saiu do guia e da GameScene; o visor decide sozinho pelo
    `explain()`. `VISOR.dropX`/`wordX`/`wordRoom` foram para 366/545/262, para a
    palavra não encostar no ursinho-sombra.
  - O ursinho está em `Graphics` como reserva. O PNG está pedido em
    `TEXTURAS.md` §7 (`ursinho.png`) e entra sozinho quando o arquivo chegar.
