# Decolagem Passo a Passo — planejamento

Jogo **096** · EF01CO03 · 1º ano · 3ª rodada.
Documento irmão: [TEXTURAS.md](./TEXTURAS.md). Ficha: a **revisão de 28/09/2026**
(pôster de adesivos em camadas), que substitui a de `docs/rodada-3/EF01CO03.md`
e o planejamento anterior desta pasta (cartões na régua).
Padrão: `docs/rodada-3/PADRAO-R3.md`. Modelos: `EF01CO01/garra-dos-grupos` e `EF01CO02/subida-do-dia`.
A ficha é a fonte; só muda o que o padrão obriga (§3). O que é proposta minha está marcado e vai para as *Dúvidas*.

**Escopo e erro seguem o que você decidiu na Garra e na Subida:** só o **N1**
agora, e **errou, perdeu** (sem trava). O N2 e o N3 da ficha estão no §12, prontos
para quando vierem. Se aqui for diferente, é a *Dúvida 1*.

---

## 1. O jogo em uma frase

No centro há um **pôster** de espaço vazio. Ao lado, o **modelo** pronto. Embaixo,
uma **cartela** com 3 adesivos. A criança toca num adesivo e ele voa sozinho para
o lugar dele no pôster, **por cima** do que já estiver lá. Para o pôster ficar
igual ao modelo, **o que aparece na frente tem de ser colado depois**. No alto, a
**fita de passos** guarda a ordem em que ela colou. Com o pôster pronto, o modelo
sai de cena, um **robô-ajudante** que nunca o viu lê a fita e monta um pôster
igual. Aparece o letreiro **SEU ALGORITMO!** e o foguete da base decola.

Um gesto só: tocar num adesivo da cartela. Não há arrasto nem mira.

## 2. A habilidade e os irmãos

> **(EF01CO03)** Reorganizar e criar sequências de passos em meios físicos ou
> digitais, relacionando essas sequências à palavra 'Algoritmos'.

| O que a BNCC pede | Onde acontece |
|---|---|
| **criar** uma sequência | a criança decide a ordem de colar olhando o modelo: quem está atrás vem antes |
| a ordem **decide o resultado** | os mesmos adesivos, em outra ordem, dão outro pôster (o estrago aparece na hora) |
| **reorganizar** | N2 da ficha: descolar e recolar por cima, e o passo vai para o fim da fita (§12, fora do N1) |
| relacionar à palavra **algoritmo** | o robô segue só a fita, sem ver o modelo, e chega ao mesmo pôster: SEU ALGORITMO! |

**O teste da bolinha:** troque os adesivos por quadrados que não se encostam e a
ordem deixa de importar. Por isso a ordem mora na **sobreposição** (quem tapa
quem), e a validação (§6) exige que cada adesivo tape de verdade o anterior.

**Irmãos:** a *Oficina dos Algoritmos* (R1) arrasta cartões para uma ordem
gravada; o *Pulo Programado* (R2) monta o programa inteiro e depois aperta VAI.
Aqui cada passo **deixa marca** no pôster na hora, e a prova de que a sequência
é um algoritmo é **outra pessoa** (o robô) chegar ao mesmo resultado só com ela.
A versão anterior desta ficha (cartões na régua) foi trocada por ficar parecida
com os dois.

## 3. O que mudou da ficha, e por quê

| Ficha | Aqui | Motivo |
|---|---|---|
| TÍTULO → exemplo 5 s → JOGO → RESULTADO | sem título; o exemplo virou o guia visual (§9); o resultado é o `showLevelComplete` | PADRAO-R3 §2 |
| layout responsivo, paisagem e retrato | 1280 × 720 fixo, `Scale.FIT` | PADRAO-R3 §1 |
| `?` abre um painel ilustrado | `?` pausa e repete o guia visual | PADRAO-R3 |
| TRAVA no adesivo cedo demais (cadeado, volta para a cartela, +5, pulsar após 2 travas) | **errou, perdeu**: a mini-cena do estrago acontece, o modelo pisca quem fica na frente, e a partida acaba (`WRONG_ANSWER` + `lives.loseAll()`) | decisão do usuário na Garra e na Subida (*Dúvida 1*) |
| 3 níveis | só o **N1** (`LEVELS.length === 1`); N2/N3 no §12 | idem |
| "contorno tracejado de cada adesivo" no pôster | **silhueta-fantasma**: o próprio adesivo em tom chapado claro e 30% de alfa, todos iguais | o jogo não tem como tracejar o contorno de um PNG; o fantasma mostra o lugar sem dizer a ordem (§7) |
| modelo: arte própria | o modelo é **montado pelo código** com os mesmos PNGs dos adesivos, em escala 0,66 | o modelo nunca pode discordar do pôster |
| adesivo com 3 estados (na cartela, colando, descolando) | **um PNG por adesivo**; colar e descolar são animação (inclinar, achatar, brilho) | 3 × 9 células por uma coisa que o tween faz |
| "o foguete do pôster decola" | o **foguete da base** (fora do pôster) decola no fim de cada pôster | só o 1º pôster tem foguete; a festa vale para os três |
| letreiro 'Uma sequência de passos que resolve algo tem nome: ALGORITMO!' | fica na mensagem do `showLevelComplete`, no fim do nível; no jogo, só **SEU ALGORITMO!** | 1º ano: no máximo 4 palavras por vez na cena |
| 'nomes dos passos' | sem nome escrito; o adesivo e o modelo são a figura grande | a decisão é visual (quem tapa quem); texto seria só mais leitura |
| contagem de adesivos certos e "novo pôster" no fim da rodada | ▶ depois da decolagem; estrelas só no fim do nível | PADRAO-R3 §2 |
| sons | sintetizados em WebAudio | PADRAO-R3 |
| telemetria: camada certa de primeira, qual adesivo cedo demais, recolagens | só `CORRECT_ANSWER`/`WRONG_ANSWER` | a bridge não tem esses campos |
| arte chibi de figurinha (PADRAO-R3) | **vetor de conto** (`references/28-vetor-de-conto-a.jpg`), da imagem que você mandou | pedido do usuário |

**Leituras da ficha:**
- *"Sessão = 3 pôsteres"*: o N1 tem **3 fases**, um pôster por fase.
- O conteúdo só dá **2 pôsteres de N1** (Decolagem e Astronauta). O 3º é a
  **Base Lunar** da ficha (N3) em versão de 3 adesivos: cratera → módulo →
  escada. O astronauta na escada fica para o N3 (*Dúvida 2*).
- *"Pode ser colado"* = todo adesivo que fica **atrás dele e encosta nele** já está
  no pôster. No N1 (cadeia) isso dá uma ordem só.
- *"O adesivo que fica atrás dele chega depois e o TAPA"*: na mini-cena, o
  adesivo que deveria estar atrás (o de trás **mais próximo** dele) voa sozinho e
  cola por cima. É o estrago da ficha, mostrado com as mesmas peças.

## 4. O laço

```
pôster vazio · modelo · cartela com 3 adesivos · fita vazia
        ▲                              │ toque num adesivo
        │                 ┌────────────┴──────────────┐
        │           pode colar agora             cedo demais
        │      voa e cola com 'plec', brilho    cola de leve; o adesivo de trás
        │      na borda; a miniatura entra no   voa sozinho e o TAPA; o pôster
        │      próximo quadradinho da fita      fica diferente; no modelo pisca
        │      (+10, CORRECT_ANSWER)            o adesivo da frente
        │                 │                     WRONG_ANSWER + lives.loseAll()
        └── ainda tem? ◄──┤                     → done
                          │ não
   o modelo sai · o robô entra, lê a fita quadradinho por quadradinho e monta um
   pôster novo no lugar do modelo · os dois iguais lado a lado · SEU ALGORITMO!
   · o foguete da base decola · ▶
                          │
   próximo pôster, ou fim do nível → showLevelComplete (estrelas)
```

## 5. A tela (1280 × 720)

As chaves ficam no `data/layout.ts`, que é da Brasa. Estes números são o contrato.
Tudo o que é fixo (fita, pôster vazio, moldura do modelo, cartela, plataforma
do foguete) vem **pintado no fundo**.

| Região | Caixa / centro | O quê |
|---|---|---|
| HUD | vidas (40, 40, ocultas); 3 bolinhas dos pôsteres em (120, 44); `?` em (1220, 56), 96 × 96 | só bolinhas, nenhum texto de fase |
| fita de passos | faixa pintada de (330, 28) a (950, 112) | 3 quadradinhos de 76 × 76 com o número 1, 2, 3 (código), centros x 520 / 640 / 760, y 70 |
| pôster | de (110, 135) a (610, 545); área de colar 470 × 380, centro (360, 340) | fundo azul de espaço; os adesivos colam aqui |
| modelo | moldura de (660, 150) a (1010, 430); área 310 × 250, centro (835, 290) | o pôster pronto em 0,66; no fim vira o pôster do robô |
| cartela | de (160, 565) a (900, 710) | 3 adesivos em x 330 / 530 / 730, y 638, ~130 px, ordem sorteada |
| foguete da base | plataforma pintada em x 1060–1270, y 380–470; foguete em pé sobre ela | decola no fim de cada pôster e volta pousando |
| robô | entra pela direita, para em (1130, 610), ~170 px | só aparece no fim do pôster |
| letreiro | (560, 470) | **SEU ALGORITMO!** (código, DynaPuff), por cima dos dois pôsteres |
| ▶ | (1180, 640), 110 × 110 | depois da decolagem |

**Densidade.** Durante o jogo há **3 alvos** (os adesivos da cartela) mais o `?`.
O pôster, o modelo e a fita não aceitam toque no N1. No fim, só o ▶. O teto de 4
está respeitado.

**Teclado:** `1` `2` `3` tocam os adesivos da cartela da esquerda para a direita;
`H` repete o guia, como o `?`.

## 6. Pôsteres e adesivos (`data/levels.ts`)

### Os 9 adesivos do N1 (`data/stickers.ts`)

| id | Adesivo | Pôster |
|---|---|---|
| `planet` | planeta redondo cor de terracota, com crateras | Decolagem |
| `rocket` | foguete em pé (o código inclina ~25° no pôster) | Decolagem |
| `smoke` | nuvem gorda de fumaça | Decolagem |
| `moon` | lua grande, cheia de crateras | Astronauta |
| `astronaut` | astronauta criança, braço estendido | Astronauta |
| `flag` | bandeirinha num mastro | Astronauta |
| `crater` | cratera larga, vista de lado | Base Lunar |
| `module` | módulo lunar de pernas | Base Lunar |
| `ladder` | escadinha encostada | Base Lunar |

### Os 3 pôsteres (a ordem certa é de trás para a frente)

| Fase | Pôster | Ordem | Quem tapa quem |
|---|---|---|---|
| 1 | Decolagem | planeta → foguete → fumaça | o foguete tapa metade do planeta; a fumaça tapa o pé do foguete (ficha) |
| 2 | Astronauta | lua → astronauta → bandeira | o astronauta tapa um pedaço da lua; a bandeira tapa a mão dele (ficha) |
| 3 | Base Lunar | cratera → módulo → escada | o módulo senta dentro da cratera; a escada tapa a porta do módulo (ficha N3, versão curta) |

Cada adesivo tem lugar fixo no pôster: `x`, `y`, `scale` e `angle` na área de colar
(470 × 380). Os números saem da Brasa depois da arte (dependem da silhueta medida
no MANIFEST), mas a **sobreposição mínima** é contrato: cada adesivo tapa
**≥ 25% do anterior** (as "sobreposições grandes" da ficha).

```ts
interface StickerDef { id: string; cell: number }
interface Placement { id: string; x: number; y: number; scale: number; angle: number; behind: string[] }
interface PosterDef { id: string; stickers: Placement[] }   // em ordem de profundidade, de trás para a frente
interface LevelDef { level: number; posters: PosterDef[]; modelScale: number; reorder: boolean }

canPlace(sticker, placed) => sticker.behind.every(id => placed.includes(id))
coverFor(sticker, placed) => o adesivo de `behind` mais próximo dele na profundidade que ainda não foi colado
```

Não há gabarito de ordem: a regra é `behind`, e a fita guarda a ordem que a
criança criou. No N1 a cadeia só deixa uma.

**`validateLevels(LEVELS)` no import** (`console.error` em dev):
- `posters.length === 3` (≤ 5) e todo `id` existe em `stickers.ts`;
- N1: 3 adesivos por pôster, em **cadeia**: `behind` de cada um é exatamente o
  anterior (e o 1º não tem ninguém atrás);
- `behind` só aponta para adesivos **mais para trás** na profundidade (sem ciclo);
- as caixas medidas de cada par da cadeia se sobrepõem em **≥ 25%** da menor;
- existe **exatamente uma** ordem válida no N1;
- adesivo não se repete no mesmo pôster, e nenhum adesivo aparece em dois pôsteres seguidos.

## 7. O erro

É **errou, perdeu**, como na Garra e na Subida (`GameScene.lose()`).

1. O adesivo tocado cedo demais voa e **cola de leve** (inclinado, meio
   transparente) no lugar dele.
2. O adesivo que deveria estar atrás (`coverFor`) sai sozinho da cartela, voa e
   **cola por cima**, com um 'plof' abafado. O pôster agora está diferente do modelo.
3. No modelo, o adesivo que devia estar **na frente** pisca duas vezes (a dica
   da ficha: mostrar quem fica na frente). Ao lado do pôster, um `≠` pequeno.
4. `WRONG_ANSWER` + `hud.lives.loseAll()`. A cena vai para `done` e nenhum toque vale.

Sem vermelho de punição e sem som áspero.

**Não é erro:** tocar no pôster, no modelo ou na fita; tocar enquanto um adesivo
voa (ignorado); o `?`.

**Pontos:** +10 por adesivo colado. `CORRECT_ANSWER` sai quando ele assenta.
Estrelas: 3 ao concluir (concluir já é zero erro), pelo `stars` do `showLevelComplete`.

**Pista que entrega (conferido):**
- as silhuetas-fantasma no pôster são **todas iguais** (mesmo tom, mesmo alfa)
  e, onde se sobrepõem, não mostram quem está na frente;
- a cartela sorteia a posição dos adesivos; nenhum brilha, nenhum tem número;
- os números da fita são **posição** (1º, 2º, 3º passo), não dizem qual adesivo vai neles;
- a única fonte da ordem é o **modelo**, que é o conteúdo.

## 8. O fim do pôster: o robô

1. O pôster fica igual ao modelo: brilho corre pela borda dele.
2. O **modelo desliza para fora** pela direita, e a moldura fica vazia.
3. O robô entra andando, para ao lado, e **tapa os olhos** um instante ("não vi
   o modelo").
4. Ele aponta para o quadradinho 1 da fita (o quadradinho acende), e o adesivo
   dali salta para a moldura e cola; depois o 2, depois o 3.
5. Os dois pôsteres ficam **iguais, lado a lado**. O letreiro **SEU ALGORITMO!**
   aparece por cima, o robô comemora.
6. O foguete da base acende a chama e **decola**, com fumaça e estrelinhas, e sai
   pelo alto. O ▶ entra. No próximo pôster o foguete desce pousando.

## 9. Guia visual (1º ano, sem texto)

É o `shared/guide/createVisualGuide`, com véu, dedo e espera pelo gesto real.
Nenhuma frase aparece. Chave `ef01co03-l1` no `registry`.

1. **O modelo.** O véu deixa só o modelo aceso. Os 3 adesivos dele **se
   levantam e se separam** um pouco, de trás para a frente, e voltam: dá para ver
   que são camadas.
2. **Encenação do erro** (`demo`, não emite nada). O véu abre o pôster e a
   cartela. O dedo toca a **fumaça** primeiro: ela cola, o foguete vem e a tapa,
   e a fumaça do modelo pisca. A cena rebobina (os adesivos voltam para a cartela).
3. **Demonstração** (`demo`, real). O dedo toca o **planeta** (entra no
   quadradinho 1) e o **foguete** (quadradinho 2). Esses contam no progresso, mas
   não dão pontos.
4. **A vez da criança** (`waitFor`). O dedo pulsa sobre a cartela, **sem apontar
   a fumaça**. O guia sai no primeiro toque, dê o que der.

O `?` pausa, repete 1 e 2 com o pôster encenado ao lado e retoma.

**Dá para entender o objetivo sem ler?** Sim: o modelo mostra o alvo, o passo 1
mostra que ele é feito de camadas, o passo 2 mostra o que acontece fora de ordem
e o passo 3 mostra a ordem certa enchendo a fita.

## 10. Feedback e áudio (WebAudio)

| Momento | Visual | Som |
|---|---|---|
| toque | o adesivo descola da cartela (curva de papel), voa em arco | "fffp" de descolar |
| cola | assenta com um leve amassado; brilho corre pela borda | 'plec' |
| fita | a miniatura cai no quadradinho | encaixe (toc) |
| estrago | cola de leve, o de trás vem e tapa; o da frente pisca no modelo | 'plof' abafado, duas notas descendo |
| robô | anda, tapa os olhos, aponta, cola | bips simpáticos, 'plec' em cada adesivo |
| letreiro | SEU ALGORITMO! salta | acorde curto |
| decolagem | chama, fumaça, estrelinhas, o foguete sobe | ronco subindo + brilho |

## 11. Ciclo da cena (`GameScene`, que não desenha nada)

Estado único `mode`: `intro · guide · choose · fly · robot · launch · panel · done`.
O toque na cartela só vale em `choose`. `startPoster` faz `++gen`, e todo `await`
é seguido de `if (gen !== this.gen) return`.

A bridge segue o padrão da Garra: `GAME_READY` e `CHECKPOINT` no `create`,
`CORRECT_ANSWER` por adesivo, `WRONG_ANSWER` no erro, `CHECKPOINT` com
`progress = round(pôsteresFeitos / 3 × 100)`,
`GAME_COMPLETED {stage: this.level.level, totalStages: LEVELS.length}` e o
`onCommand` de START/PAUSE/RESUME. O jogo nunca emite `GAME_OVER` (quem emite é
o `loseAll`) e nunca escreve `isFinalStage`.

## 12. Depois do N1 (a ficha, pronta para quando vier)

| Nível | Assunto | O que entra |
|---|---|---|
| 2 | **reorganizar** | o pôster chega montado pela fita de um colega (Esconde-esconde na Lua: alienzinho → pedra → nave → estrela cadente) com **a pedra colada antes do alien**: o alien aparece, "achado na hora". Tocar num adesivo **colado** descola e recola por cima, e o quadradinho dele desliza para o fim da fita. `reorder: true` |
| 3 | **criar maior** | 4 adesivos, um deles na frente de **dois** (mais de uma ordem vale); modelo menor (`modelScale`), reorganizar liberado |

A ficha se contradiz no N3: os níveis falam de "a nave na frente da lua e da
estrela", e o conteúdo dá a Base Lunar (cratera → módulo → escada → astronauta).
Decido quando o N3 entrar.

## 13. Arquivos, texturas e quem mexe

| Ferro | Brasa |
|---|---|
| `types.ts`, `data/levels.ts`, `data/stickers.ts`, `data/files.ts`, `index.ts`, `scenes/BootScene.ts`, `scenes/GameScene.ts` | `data/layout.ts`, `data/theme.ts`, `scenes/poster.ts` (pôster, fantasmas, modelo), `sheet.ts` (cartela, voo, colar), `tape.ts` (fita e miniaturas), `robot.ts`, `launch.ts` (foguete da base), `hud.ts`, `audio.ts`, `guide.ts`, catálogo e `gameInstructions` |

**Textura** (linha **vetor de conto**; prompts no [TEXTURAS.md](./TEXTURAS.md)):

| Arquivo | Grade | Conteúdo |
|---|---|---|
| `bg-base.png` | 1280 × 720 | base espacial simpática com o pôster vazio, a moldura vazia do modelo, a fita, a cartela vazia e a plataforma do foguete |
| `adesivos.png` | 3 × 3, 384 | os 9 adesivos, com a borda branca de adesivo |
| `robo.png` | 3 × 2, 384 | parado, andando, tapando os olhos, apontando, colando, comemorando |
| `pecas.png` | 2 × 2, 320 | foguete da base, chama, dedo do guia, 1 livre |
| `cover-decolagem-passo-a-passo.png` | 1672 × 941 | capa **com o título** |

**Código:** a silhueta-fantasma (o próprio adesivo tingido), o modelo (os
adesivos em escala), os quadradinhos e números da fita, a miniatura (o adesivo
em escala), o `≠`, o letreiro, o brilho da borda, a fumaça e as estrelinhas da
decolagem, as bolinhas, o `?` e o ▶.
**Antes da arte:** retângulos com o id, só para testar. Nunca é entrega.

**Registro:** id `096` (`NEXT_FREE_ID` vai para `097` no mesmo commit), slug
`decolagem-passo-a-passo`, em `GAMES_WITH_IN_GAME_COMPLETION_SCREEN`, 3 frases em
`gameInstructions.ts`, `public/og/decolagem-passo-a-passo.jpg`.

## 14. Travas para quem mexer depois

- A ordem mora **só** em `behind`. Nenhum brilho, número, cor ou posição na
  cartela diz a ordem.
- O modelo, a miniatura e o fantasma são **o mesmo PNG** do adesivo. Nunca
  desenhe um modelo à parte.
- Se a Aquarela refizer um adesivo, o lugar dele no pôster (`x`, `y`, `scale`) é
  medido de novo e a validação dos 25% roda de novo.
- `reorder` e `modelScale` são dados do nível, não `if` na cena.

## Dúvidas para o usuário

1. **Escopo e erro:** segui o que você decidiu na Garra e na Subida, **só N1** e
   **errou, perdeu**. O "reorganizar" da habilidade só entra no N2 (§12). Mantém
   assim?
2. **3º pôster do N1:** a ficha só tem 2 pôsteres para o N1. Usei a Base Lunar
   (N3 da ficha) em 3 adesivos: cratera → módulo → escada. Pode?
3. **Estilo:** a imagem é a referência `28` (vetor de conto), a mesma do Canteiro
   de Obras. Os adesivos ganham **borda branca de adesivo**, que o estilo não usa,
   porque ela é o que faz a peça parecer adesivo. Pode?

## Histórico

- **28/09/2026.** Primeiro planejamento (cartões na régua, id 094), substituído.
- **28/09/2026, ficha revista pelo usuário.** O jogo virou o pôster de adesivos
  em camadas, porque a versão anterior estava parecida com a Oficina dos Algoritmos
  e o Pulo Programado. Arte: vetor de conto. Plano e texturas refeitos do zero.
