# Robô em Pedaços — planejamento

_EF03CO03 · 3º ano · Pensamento Computacional · slug `robo-em-pedacos`_
Documento irmão: [TEXTURAS.md](./TEXTURAS.md) · Ficha: `docs/rodada-3/EF03CO03.md`

## 0. O que muda em relação à ficha, e por quê

O usuário escolheu **"ficha com ajustes"** (05/10/2026). A ficha tem a casca certa (o robô
grande demais vira módulos, cada módulo ganha um conserto, e no fim tudo se junta), mas no N1
a criança não tomava nenhuma decisão da habilidade.

| Ficha | Aqui | Por quê |
|---|---|---|
| no close, os 3 pontos soltos **piscam** | **nada pisca**: o close tem pontos **soltos e firmes**, e a criança aperta só os soltos | o piscar entregava a resposta ([[decisao-sem-pista-que-entrega]]) |
| o religar é **tocar a tomada** | o religar é **montar o robô**: a criança põe os módulos consertados no elevador **na ordem que se sustenta**, e só então liga a tomada | "combinar as soluções" vira uma decisão |
| a dependência é de **conserto** ("as pernas só abrem depois do corpo") | a dependência é de **montagem** (a cabeça precisa do corpo para se apoiar) | no conserto a ordem não tem motivo visível; na montagem a criança **vê** o motivo |
| cadeado com setinha mostra a ordem | **nenhum** cadeado ou setinha: a pista é o próprio corpo do robô | a setinha respondia por ela |
| TRAVA no erro, 15 s por reparo | **errou, perdeu**, sem relógio | padrão da rodada ([[errou-bloqueia]]); régua "simples e claro" |
| variações Foguete e Casa da Árvore | só o robô | uma arte serve aos três níveis |

A **divisão** continua sendo mostrada pelo jogo (o robô se desmonta em módulos com etiqueta),
como na ficha. O que a criança decide é **o que consertar** em cada parte e **como juntar**.

## 1. A habilidade

> **(EF03CO03)** Aplicar a estratégia de decomposição para resolver problemas complexos,
> dividindo esse problema em partes menores, resolvendo-as e combinando suas soluções.

| Verbo | Onde acontece |
|---|---|
| dividir | o robô inteiro não dá para consertar de uma vez; ele se desmonta em módulos com etiqueta, cada um num estrado |
| resolver | cada módulo abre num close (subproblema): achar e apertar os pontos soltos, deixar os firmes |
| combinar | montar os módulos consertados no elevador, na ordem que se sustenta, e ligar |

**Teste da bolinha** (troque os módulos por bolinhas: o jogo morre?):
- no conserto, a decisão é o **estado** de cada ponto (parafuso pra fora × rente), e não uma cor;
- na montagem, a decisão é **o que segura o quê**. Bolinha não tem "em cima" nem "embaixo", e a
  cabeça tem;
- a etiqueta do módulo é nome, não pista. Todos os estrados são iguais.

## 2. Os irmãos

| Jogo | Decisão |
|---|---|
| Chef dos Subproblemas (016) | separar ações em partes e pôr na linha do tempo |
| Missão em Pedaços (061) | cortar a tarefa no meio e buscar cada metade |
| **Robô em Pedaços** | consertar cada parte (achar o que está solto) e **combinar na ordem que funciona** |

Nenhum dos dois irmãos tem o "combinar" como montagem física com dependência. A ênfase aqui é
o terceiro verbo.

## 3. O jogo em 1 frase

O robô gigante quebrou: ele se desmonta em partes, você conserta uma por vez apertando só o que
está solto, monta de novo na ordem que fica de pé e liga. Ele anda e acena!

## 4. Como joga (uma fase = um robô)

1. **Quebrou** (cena, ~3 s). O Gigante tenta andar, solta faíscas, treme e trava. A Nina diz:
   *"É conserto demais de uma vez. Vamos por partes!"*. O robô se **desmonta**: cada módulo voa
   para um estrado à direita, com a etiqueta (CABEÇA, CORPO, PERNAS…) e **apagado**.
2. **Consertar** (em qualquer ordem). Tocar num módulo apagado abre o **close**: a bancada sobe,
   o módulo aparece grande e os pontos ficam nele, cada um **solto** ou **firme**. Tocar num
   ponto solto faz a ferramenta aparecer e consertar (parafuso gira, fio encaixa, mola volta),
   com um "nhec" e uma faísca feliz. Quando o último solto fecha, o módulo **acende**, ganha ✓ e
   volta para o estrado.
3. **Montar.** Com todos os ✓, a Nina diz *"Tudo consertado! Agora monte o robô."* e o
   **molde** do robô aparece no elevador (a sombra de todas as partes, todas iguais). Tocar num
   módulo consertado faz ele voar para o lugar dele no robô:
   - se o que o sustenta **já está lá**, ele encaixa (clac) e o pedaço do molde some;
   - se **não está**, ele chega, não tem onde se apoiar e **cai** (é o erro).
4. **Ligar.** Com o robô inteiro, a **tomada** do elevador acende. Tocar nela liga o robô, que
   anda pelo elevador e acena. A bolinha da fase acende.

## 5. Erro

**Errou, perdeu** (`WRONG_ANSWER` + `lives.lose()`, uma vez), em dois lugares:

| Erro | O que a criança vê | Balão |
|---|---|---|
| tocar num ponto **firme** | a ferramenta escorrega, o ponto firme pula pra fora e solta faísca | "Esse já estava firme!" |
| montar fora de ordem | o módulo chega, balança e cai do elevador com um clanque | "A cabeça precisa do corpo!" |

A cena do erro toca **antes** do `lose()`. Tocar fora dos pontos e fora dos módulos não faz
nada (errar a mira não conta, [[gesto-fisico-precisa-de-trava]]). O guia nunca encerra a partida.

## 6. Níveis

Um nível, um assunto ([[um-nivel-um-assunto]]); no máximo dois conceitos novos por nível.

| Nível | Módulos | Pontos por módulo | Ordem de montagem | O que estreia |
|---|---|---|---|---|
| **N1 — Por partes** | pernas, corpo, cabeça | 3 (2 soltos, 1 firme) | pernas → corpo → cabeça | o ciclo inteiro: desmontar, consertar, montar |
| **N2 — Braços e ordem livre** | pernas, corpo, braços, cabeça | 4 (2 soltos, 2 firmes) | pernas → corpo → {braços, cabeça} em qualquer ordem | um 4º módulo e o "tanto faz" (braços e cabeça só dependem do corpo) |
| **N3 — Sapatos-foguete** | sapatos-foguete, pernas, corpo, cabeça | 4 (3 soltos, 1 firme) | sapatos → pernas → corpo → cabeça | corrente de 4 (cada parte depende da anterior) |

Cada nível tem **3 fases** (3 robôs quebrados). Mudam de fase para fase:
- **quais pontos** estão soltos;
- a **posição dos módulos** nos estrados (embaralhada, para a ordem não sair da posição na tela).

**Pontos por módulo** (`data/levels.ts`; cada um com estado solto/firme):

| Módulo | Pontos (N1 usa os 3 primeiros) |
|---|---|
| cabeça | antena, olho, lâmpada, parafuso |
| corpo | parafuso, fio, botão, mola |
| braços | parafuso, engrenagem, fio, mola |
| pernas | mola, engrenagem, parafuso, fio |
| sapatos-foguete | fio, lâmpada, parafuso, engrenagem |

**Validação** (`validateLevels`):
- ≤ 4 módulos e ≤ 4 pontos por módulo ([[densidade-de-alvos-no-celular]]);
- todo módulo tem ≥ 1 ponto solto e, a partir do N1, ≥ 1 firme;
- o mesmo módulo não repete o mesmo padrão de soltos em duas fases seguidas;
- os estrados nunca ficam na ordem de montagem (de cima para baixo ou da esquerda para a
  direita);
- a ordem de montagem é um grafo sem ciclo, e todo módulo é alcançável a partir da base.

## 7. Tela (1280 × 720)

```
┌──────────────────────────────────────────────── HUD ─┐
│ [Nível 1 ● ○ ○]                                  (?) │
│                                                       │
│  Nina        ┌ molde / robô ┐        ┌estrado┐┌estrado┐│
│  (balão)     │   cabeça     │        │ CABEÇA││ CORPO ││
│              │   corpo      │        └───────┘└───────┘│
│              │   pernas     │        ┌estrado┐┌estrado┐│
│        ══════╧══ elevador ══╧══ [⏻]  │PERNAS ││       ││
│                                      └───────┘└───────┘│
└───────────────────────────────────────────────────────┘
```

- **Elevador** à esquerda do centro: o robô montado tem ~470 px de altura.
- **Estrados** à direita, numa grade 2 × 2 (até 4 módulos), todos iguais, com etiqueta.
- **Tomada** (⏻) na base do elevador. Fica apagada até o robô estar inteiro.
- **Close**: véu escuro + bancada grande (900 × 520) no centro, com o módulo grande (~380 px),
  a etiqueta em cima e os pontos nele. Fecha sozinho quando o módulo acende.
- **Nina** no canto de baixo à esquerda, só reagindo, com balão curto.

## 8. Tutorial (createTutorial, uma frase por balão)

**N1** (primeira vez):
1. *(recorte: robô)* "O robô quebrou. É conserto demais de uma vez!" — **Ver** → o robô se
   desmonta nos estrados.
2. *(recorte: estrados)* "Vamos por partes. Toque numa parte para consertar." → **treino**: só
   as PERNAS respondem.
3. *(close; recorte: um ponto solto; dedo)* "Aperte o que está solto." → treino nesse ponto.
4. *(recorte: o ponto firme)* "Este já está firme. Deixe assim." — Ok → a criança aperta o
   outro solto sozinha.
5. *(recorte: estrados)* "Agora conserte as outras partes." — Vamos lá!
6. Quando todas acendem: *(recorte: molde)* "Tudo consertado! Agora monte o robô." →
   *(recorte: molde inteiro)* "Comece pelo que fica embaixo." — Ok.
7. Quando monta: *(recorte: tomada; dedo)* "Ligue o robô!"

**N2:** "Chegaram os braços!" (recorte: estrado dos braços) → "Tem parafuso firme no meio.
Aperte só os soltos."

**N3:** "Sapatos-foguete!" (recorte: estrado dos sapatos) → "Cada parte segura a de cima."

O `?` repete: "Toque numa parte para consertar." → "Aperte só o que está solto." → "Monte de
baixo para cima e ligue." (`Continuar`).

## 9. Fim do nível

O robô anda até a borda do elevador e acena (no N1, sem braços, ele pula). Desce o **painel**
**dividiu → consertou → juntou**, em três colunas:
- dividiu: os módulos soltos, como saíram;
- consertou: os mesmos com ✓;
- juntou: o robô montado, com os módulos na ordem em que a criança encaixou.

Depois, `showLevelComplete` (autoAdvance no N1 e N2; JOGAR DE NOVO no N3).

## 10. Textos (`data/words.ts`)

| Onde | Texto |
|---|---|
| quebrou | É conserto demais de uma vez. Vamos por partes! |
| montar | Tudo consertado! Agora monte o robô. |
| ligar | Ligue o robô! |
| fase completa | Ele anda de novo! |
| erro: firme | Esse já estava firme! |
| erro: ordem | A cabeça precisa do corpo! · O corpo precisa das pernas! · Os braços precisam do corpo! · As pernas precisam dos sapatos! |
| etiquetas | CABEÇA · CORPO · BRAÇOS · PERNAS · SAPATOS-FOGUETE |
| painel | Dividiu · Consertou · Juntou! |

## 11. Arte

Linha **livro ilustrado** (ref `34`, em toda geração). Trocada pelo usuário em 05/10/2026, no
lugar do vetor geométrico, antes de qualquer arte ser gerada. Cinco arquivos (TEXTURAS). Até chegarem, tudo roda com reserva em `Graphics`.

| PNG | `Graphics` |
|---|---|
| fundo da oficina, 5 módulos × 2 estados, tomada × 2, 8 tipos de ponto × 2 estados, Nina × 4 poses, capa | estrados, etiquetas, bancada do close, véu, molde (o próprio módulo tingido escuro), ferramenta do conserto, faíscas, balões, HUD, painel final |

O **molde** é o sprite do módulo com `tint` escuro e alfa baixo. Assim ele tem exatamente a
forma da arte, sem desenho a mais.

## 12. Plataforma

`GAME_READY` → `CHECKPOINT` (fases / 3) → fase montada e ligada = `CORRECT_ANSWER` (+10) →
erro = `WRONG_ANSWER` (−5) + `lives.lose()` → fim = `GAME_COMPLETED` + tela própria
(`GAMES_WITH_IN_GAME_COMPLETION_SCREEN`). Telemetria da ficha: consertos de primeira (todos),
ordem de montagem usada, erros por tipo.

## 13. Arquivos

```
types.ts · index.ts
data/  files.ts layout.ts levels.ts theme.ts words.ts
scenes/ BootScene.ts GameScene.ts fallback.ts robot.ts (molde, montagem, andar)
        bench.ts (close e pontos) pallets.ts nina.ts hud.ts guide.ts audio.ts ui.ts finale.ts
```

## 14. Decisões (régua "simples e claro") e dúvidas

**Decididas:**
- sem relógio de 15 s: o conserto não é de velocidade;
- conserto em qualquer ordem, em todos os níveis: a ordem mora na montagem;
- o molde mostra todas as peças iguais (sem número, sem seta); quem diz a ordem é o corpo do
  robô;
- só o robô, sem Foguete nem Casa da Árvore.

**Dúvidas (não seguram o TEXTURAS):**
1. **Quantos níveis fazer agora?** Os pilotos da rodada saíram só com o N1; o plano já tem os
   três.
2. **A Nina fica?** Ela só fala nos balões e reage. Sem ela, a folha `nina.png` sai da lista e
   os balões ficam soltos na tela.

## 15. Histórico

- 05/10/2026 — planejado a partir da ficha, com os ajustes escolhidos pelo usuário ("ficha com
  ajustes") e arte em vetor geométrico (depois trocada, ver abaixo).
- 05/10/2026 — N1 feito (id 106), com toda a arte em `Graphics` nas mesmas chaves e grades do
  TEXTURAS (`scenes/fallback.ts`); a Nina ficou. Testado no navegador: tutorial com treino no
  estrado e no ponto solto, conserto dos 3 módulos, montagem, tomada, caminhada, erro do ponto
  firme, erro de ordem (a cabeça cai) e painel final.
- 05/10/2026 — linha de arte trocada para **livro ilustrado** (`references/34-livro-ilustrado.jpg`);
  todos os prompts do TEXTURAS reescritos. Arquivos, grades e células não mudaram.
- 05/10/2026 — chegaram fundo, módulos, pontos e Nina (falta a capa); folhas reempacotadas para as
  grades do contrato (ver `src/assets/games/EF03CO03/robo-em-pedacos/MANIFEST.md`). O layout mudou
  pela arte: elevador mais alto (tampo em 492), estrados numa fileira no chão à direita, tomada na
  parede. Falas da Nina encurtadas ("Vamos por partes!", "Agora monte o robô!").
- 05/10/2026 — revisão dos encaixes: sobreposição por junta (cintura 46, pescoço 38, em pixels da
  célula), peças acesas alinhadas pelo pé às apagadas, painel final empilhando com a mesma conta.
