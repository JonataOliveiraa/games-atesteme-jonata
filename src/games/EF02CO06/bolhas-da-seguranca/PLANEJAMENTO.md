# Bolhas da Segurança - EF02CO06

Documento irmão: [TEXTURAS.md](./TEXTURAS.md)

A criança olha para um **tablet gigante** e decide, item a item, o que ameaça o
aparelho. Tocar num perigo o envolve numa bolha e o tira dali, com um selinho
dizendo o cuidado. Tocar no que é seguro estoura a bolha à toa.

> **O briefing passou nos dois testes.** Três coisas mudaram, e estão marcadas
> no texto com **[MUDOU]**: o cronômetro de 75 s virou relógio que conta para
> cima, o contador de proteção do canto virou uma fila de bolhas, e tocar num
> item seguro passou a custar uma vida. As três saem de regra do projeto, não de
> gosto.

---

## 1. A habilidade, e os dois testes

> **(EF02CO06)** Reconhecer os cuidados com a segurança no uso de dispositivos
> computacionais.

Objeto: **Segurança e responsabilidade no uso de tecnologia computacional.**
Exemplo oficial: *"O professor poderá criar um portfólio com alguns cuidados ao
jogar nos dispositivos como celular, tablets."*

### O teste da bolinha

> **Troque as situações por bolinhas coloridas sem significado. O jogo muda?**

Muda, e o jogo acaba. Sem enxergar o que é a coisa, não há como decidir se ela
se toca: o gesto é um só, e a única informação que o separa de errar é o que
está desenhado. **A decisão É o conteúdo.** Passa.

Mas passa por um fio, e o fio é a arte. Se o desenho denunciar o perigo pelo
clima — vermelho, escuro, cara feia — a criança para de ler a situação e passa a
tocar no feio. Aí o jogo vira bolinha colorida com etapa extra, e a habilidade
volta para a decoração. Por isso o [TEXTURAS.md](./TEXTURAS.md) trata "risco e
seguro no MESMO estilo" como requisito de mecânica, e não de estilo.

### O teste do irmão

`EF02CO06` já tem jogo publicado: **Checklist do Jogador Seguro** (id 013).

| Jogo | O que a criança faz | A metade da habilidade |
|---|---|---|
| Checklist do Jogador Seguro | liga e desliga configurações numa lista parada | conta, privacidade, permissões |
| Bolhas da Segurança | julga situações que aparecem na frente dela, uma a uma | cuidado físico com o aparelho e hábito de uso |

O texto oficial tem as duas metades, e o exemplo oficial fala da segunda:
*cuidados ao jogar nos dispositivos*. O irmão nunca mostra um copo d'água perto
do carregador; este nunca abre um menu de configuração.

---

## 2. O laço

```
o tablet gigante ocupa a tela; situações entram por uma das três faixas
→ 2 a 3 visíveis por vez, atravessando devagar
→ a criança toca no que julga perigoso
   ↳ era perigo   → bolha envolve, sobe e sai, com o selinho do cuidado (+10)
   ↳ era seguro   → a bolha estoura à toa, TRAVA, selo SEGURO! com o porquê
→ perigo que chega na borda NÃO sai: trava ali com cadeado, e tudo para
   ↳ só destrava quando for bolhado (+5)
→ a fila de bolhas embaixo enche
→ fila cheia: rodada concluída
```

Controle: **um toque, direto sobre o item.** A bolha sai sozinha até ele. Sem
mira, sem arrasto, sem botão.

---

## 3. Clareza para criança

| Conceito | Como a tela mostra |
|---|---|
| "isto aqui é perigoso" | a situação desenhada, sem sinal de alarme por cima |
| "protegi" | a bolha envolve, sobe e leva embora, com selinho |
| "isto era seguro" | a bolha estoura e o item ganha selo SEGURO! com uma linha |
| "esqueci deste" | ele trava na borda com cadeado piscando e o mundo para |
| progresso | a fila de bolhas na base do tablet enchendo |
| sequência de acertos | a bolha sai maior e mais brilhante a cada acerto seguido |

O selinho diz o **cuidado**, em forma de ação — `Bebida longe do aparelho.` —
nunca a bronca. A criança leva embora o que fazer, não o que não fazer.

---

## 4. A grade: 1280 × 720

Coluna "No celular" = grade × 0,30 (aparelho de 390 px).

| Faixa | y | Conteúdo | Tamanho | No celular |
|---|---|---|---|---|
| Header | 0 – 72 | pílula do nível, recado, `?` em (1218, 36), vidas | `?` toque 122 | 37 |
| Moldura do tablet | 84 – 700 | a borda do aparelho, 1200 × 616 | borda 20 | 6 |
| Faixa 1 | 150 – 300 | situações | item 150 · toque 190 | 45 · **57** |
| Faixa 2 | 300 – 450 | situações | item 150 · toque 190 | 45 · **57** |
| Faixa 3 | 450 – 600 | situações | item 150 · toque 190 | 45 · **57** |
| Fila de bolhas | 620 – 660 | uma bolha por item da rodada | bolha 34 · vão 16 | 10 |

Entrada em `x = 130`, trava de borda em `x = 1150` — o cadeado cabe inteiro
dentro da moldura, sem encostar nela.

**O que não pode acontecer aqui:** a fila de bolhas é a única coisa abaixo da
faixa 3, e ela vive dentro do tablet. Nenhum painel entra na área de voo — foi
painel cobrindo área de jogo que estragou duas telas deste projeto.

---

## 5. Níveis e rodadas

Três níveis, **três rodadas cada**, seis situações por rodada. A rodada acaba
quando a fila de bolhas enche.

| Nível | Itens por rodada | O que entra | Travessia |
|---|---|---|---|
| 1 | 4 riscos + 2 seguros | riscos **físicos** bem visíveis, seguros óbvios | 8 s |
| 2 | 4 riscos + 3 seguros | entram riscos de **uso** (aviso estranho, tela no rosto, som no máximo, escuro) | 7 s |
| 3 | 4 riscos + 4 seguros | entram as **pegadinhas seguras** (atualização com adulto, pausa para alongar) | 5 s |

O 3 também é o mais movimentado: **4 situações na tela** em vez de 3, e o dobro
de bolhas subindo no fundo, mais rápidas. A pressa não reprova ninguém — quem
chega na borda trava e espera —, mas a tela cheia obriga a escolher onde olhar,
que é o que a habilidade pede quando o aparelho está no meio da bagunça de casa.

A escada tem um degrau claro por nível:

| Nível | O que decide a resposta | O que deixa de bastar |
|---|---|---|
| 1 | ver o objeto fora do lugar | — |
| 2 | entender o **hábito**, não só o objeto | procurar coisa quebrada |
| 3 | separar o aviso legítimo do aviso estranho | achar que tudo que pisca é perigo |

A pegadinha do nível 3 é a lição inteira: **segurança é discernimento, não
medo.** Uma atualização com um adulto ao lado é a mesma tela de aviso do
`CLIQUE AQUI, GANHOU!` — o que muda é a companhia.

### A bolha muda de cor com o nível

No 1 a bolha é sempre a mesma, azul de sabão: a criança está aprendendo o gesto,
e uma cor só mantém a leitura limpa. No 2 entra a paleta inteira — cada perigo
protegido sai numa cor diferente, a fila embaixo guarda a cor de cada um, e as
bolhas do fundo acompanham. A recompensa fica mais vistosa quando a decisão
fica mais difícil.

> Construídos: **os três níveis**.

---

## 6. As regras, em código

```ts
export type SituationKind = 'risk' | 'safe'

export interface Situation {
    id: string
    kind: SituationKind
    frame: number
    seal: string
}

export const shouldBubble = (s: Situation) => s.kind === 'risk'

export function outcomeOf(s: Situation, locked: boolean): Outcome {
    if (s.kind === 'safe') return 'safe-touched'
    return locked ? 'late' : 'protected'
}
```

O veredito é **função do estado no instante do toque**: o mesmo perigo vale
`protected` enquanto voa e `late` depois de travar na borda. Não existe campo
`correto` guardado no item.

Pontuação interna — nada disso vira texto na tela:

| Situação | Evento | Pontos | Vida |
|---|---|---|---|
| perigo bolhado em voo | `CORRECT_ANSWER` | +10 | — |
| perigo bolhado depois de travar | `CORRECT_ANSWER` | +5 | — |
| três perigos seguidos | (soma no acerto) | +5 | — |
| tocou num item seguro | `WRONG_ANSWER` | 0 | **−1** |

**[MUDOU]** O briefing dizia "sem perder pontos" ao tocar num seguro. No projeto,
`WRONG_ANSWER` não é telemetria: cada um custa uma vida, e quem reprova é o
`createLives` no zero. Tocar num seguro é erro de julgamento, então cobra. Erro
de dedo não existe aqui — nada é perdido por lentidão.

---

## 7. O erro

Dois erros, e cada um ensina uma coisa diferente.

**Estourou à toa.** A criança tocou num item seguro. A bolha estoura sem
envolver nada, o mundo para, o item ganha um selo `SEGURO!` com uma linha
dizendo por quê — `Sentado e com luz: pode jogar!` — e o voo volta depois de
1,5 s. A sequência de acertos zera. Depois de **dois** desses na mesma rodada,
os perigos em tela ganham um pulso leve: é a "opção certa pisca" do catálogo.

**Ficou para trás.** Um perigo chegou na borda. Ele **não sai da tela**: trava
ali com um cadeado piscando, e todos os outros param. A rodada só anda quando
ele for bolhado. Isso resolve o "ignorar não é responder" sem cobrar vida:
**não fazer nada deixa de ser uma saída**, porque o jogo para e espera.

O erro não pode ser:

| Não fazer | Motivo |
|---|---|
| perder o item por dedo lento | erro de dedo não é erro de cabeça, e 7 anos erra o dedo |
| som de buzina e "tente de novo" | não diz qual, nem por quê |
| item seguro desenhado com cara de errado | mata a decisão: vira "toque no feio" |
| relógio que reprova | pressa não ajuda a reconhecer cuidado |

---

## 8. Feedback

| Momento | Visual | Som |
|---|---|---|
| toque num perigo | a bolha nasce no dedo, envolve e sobe levando o item | sabão, subindo |
| selinho | carimbo entra com `back` ease ao lado da bolha que sobe | plim curto |
| sequência de 3 | a bolha sai maior, com brilho e três faíscas | plim mais agudo |
| toque num seguro | a bolha estoura no lugar, sem envolver; moldura pisca | estouro neutro, seco |
| selo SEGURO! | selo entra sobre o item, mundo parado | plim grave |
| trava na borda | cadeado piscando, os outros itens desaceleram até parar | toque grave, curto |
| destravou | o cadeado se abre e some, o voo volta | clique de abrir |
| fila enchendo | a bolha nova entra na fila com um salto | plim baixinho |
| fim do nível | as bolhas da fila sobem juntas e estouram em confete | fanfarra |

**[MUDOU]** O contador de proteção no canto virou a **fila de bolhas** na base
do tablet. A seção Pontuação do INSTRUCOES proíbe número na tela, e a fila conta
melhor: mostra quantas faltam e o que já foi protegido.

---

## 9. Tempo

**[MUDOU]** O briefing pedia rodada de 75 s. O relógio some do jogo, por um
motivo que está na própria regra da trava: se o perigo trava na borda e espera,
um cronômetro regressivo não muda nada — só apressa a criança numa decisão que
pede o contrário.

Fica um relógio que **conta para cima**, invisível durante o jogo, no subtítulo
do painel de fim de nível (`formatTime` de `shared/hud/createTimeBar`). Ele mede
sem empurrar. A velocidade de travessia continua sendo o que dá ritmo.

---

## 10. Tutorial

**Dois passos no nível 1, um em cada um dos outros.** Quatro falas no jogo
inteiro, nenhuma com mais de seis palavras.

O tutorial não fala sobre o jogo: ele acontece **dentro** dele. Antes de cada
nível começar, as duas primeiras situações da rodada já entram em cena, paradas,
e é nelas que o holofote acende — a criança aprende olhando as coisas de
verdade, não um desenho de exemplo.

| Nível | Frase | O que o holofote acende |
|---|---|---|
| 1 | `Toque no perigo.` | o risco em voo, com o dedo batendo nele |
| 1 | `No seguro, não toque.` | o item seguro em voo, sem dedo nenhum |
| 2 | `Agora o perigo é o jeito de usar.` | o risco de uso, com o dedo |
| 3 | `Nem todo aviso é perigo.` | **os dois parecidos lado a lado** |

O passo do nível 3 é o mais visual de todos e não precisa de mais palavra
nenhuma: o aviso do presente e a atualização com o adulto ficam na mesma caixa
de luz, e a comparação diz o resto.

O passo da fila de bolhas saiu: ela enche sozinha na primeira captura, à vista
da criança, e ensinar isso com texto era gastar uma tela com o que o próprio
jogo mostra em meio segundo.

O `?` reabre e pausa. Sem narração.

---

## 11. Conteúdo pronto

### Riscos físicos (nível 1)

| Situação | Selinho |
|---|---|
| copo d'água perto do carregador | `Bebida longe do aparelho.` |
| aparelho no sol forte | `Aparelho gosta de sombra.` |
| dedos melados na tela | `Mão limpa antes de tocar.` |
| tablet na beirada da mesa | `Longe da beirada.` |

### Riscos de uso (nível 2)

| Situação | Selinho |
|---|---|
| aviso desconhecido "ganhou, clique aqui" | `Aviso estranho? Não toque.` |
| tela colada no rosto | `Tela longe dos olhos.` |
| volume no máximo no fone | `Som baixinho protege o ouvido.` |
| jogar no escuro | `Acenda a luz para jogar.` |

### Seguros

| Situação | Balão do porquê | Entra no |
|---|---|---|
| criança sentada, com luz acesa | `Sentado e com luz: pode jogar!` | 1 |
| capa protetora no tablet | `A capa protege das quedas.` | 1 |
| pausa para alongar | `Parar um pouco faz bem.` | 2 |
| adulto ajudando na atualização | `Com um adulto, pode atualizar.` | 3 |

As duas últimas são as **pegadinhas**: no nível 3 elas aparecem junto dos riscos
de uso que se parecem com elas.

---

## 12. Antes da arte existir

Cada situação sem textura vira um **cartão de reserva em Graphics**, no tamanho
final de 150: moldura arredondada, um pictograma simples e o rótulo curto. O
jogo é jogável e ajustável antes do primeiro PNG, e um arquivo faltando não
derruba o `vite build` — as texturas entram por `import.meta.glob`, nunca por
`import` estático.

Ordem de produção:

1. o esqueleto jogável com cartões de reserva e o nível 1;
2. `situacoes.png`, a folha das 12 situações;
3. o ajuste de posição com o arquivo medido, não no olho.

---

## 13. O que é código, e o que é textura

**Textura:** só as 12 situações, numa folha em grade. Nada mais.

**Código (Graphics):** a moldura do tablet, a bolha, o estouro, o cadeado, o
selinho, o selo SEGURO!, a fila de bolhas, o balão, a moldura que pisca, o
confete. Todos mudam de cor, tamanho ou estado a cada momento, e PNG não muda.

---

## 14. Registro

```
src/games/EF02CO06/bolhas-da-seguranca/
src/assets/games/EF02CO06/bolhas-da-seguranca/
```

| Campo | Valor |
|---|---|
| `id` | `058` |
| `slug` | `bolhas-da-seguranca` |
| `module` | `EF02CO06/bolhas-da-seguranca` |
| `skill` | `EF02CO06` |
| `years` | `[2]` |
| `tags` | `["segurança", "cuidado", "tablet", "toque"]` |
| `order` | `135` |
| `points` | `60` |
| `icon` | `🫧` |

Também em `src/data/gameInstructions.ts` e no conjunto
`GAMES_WITH_IN_GAME_COMPLETION_SCREEN`, em `src/pages/GameDetailsPage.tsx`.

---

## 15. Arquivos

```
types.ts            Situation, SituationKind, Outcome, LevelDef
data/theme.ts       cores, fontes
data/layout.ts      W/H, moldura, faixas de voo, fila de bolhas
data/situations.ts  as 12 situações, os selinhos, shouldBubble(), outcomeOf()
data/levels.ts      LEVELS: as rodadas
scenes/BootScene.ts glob + corte da folha + createLoadingScreen
scenes/GameScene.ts orquestração. Não desenha nada.
scenes/tablet.ts    a moldura do tablet e as faixas
scenes/floater.ts   uma situação em voo: entrada, deriva, trava na borda
scenes/bubble.ts    a bolha: envolver, subir, estourar
scenes/seal.ts      selinho do cuidado e selo SEGURO!
scenes/queue.ts     a fila de bolhas da rodada
scenes/hud.ts       a barra fina do topo
scenes/audio.ts     WebAudio, sem arquivo
```

A `GameScene` não desenha: se ela precisar de um `fillRoundedRect`, falta um
módulo em `scenes/`.

## O recado do cuidado fica parado (23/09/2026)

Ao tocar num perigo, a faixa dourada com o cuidado ("Bebida longe do
aparelho.") nascia colada embaixo dele e **subia junto com a bolha** por um
segundo: a criança tentava ler uma frase que andava e sumia. O usuário apontou
que, nesse meio tempo, ficava difícil ler.

Agora (`showCareRibbon`, em `seal.ts`):

- a faixa aparece **parada no lugar de onde o perigo saiu** — é ali que o olho
  já está —, 200 ms depois de a bolha começar a subir, para o perigo e a bolha
  não passarem por cima da frase;
- fica **2 s** parada e só então esmaece; a bolha sobe sozinha;
- mora **abaixo dos perigos** (`DEPTH.care`): o jogo não para, e um perigo da
  mesma faixa que passar por ali continua à vista e tocável;
- fica **dentro do vidro do tablet**: o perigo preso na beirada está em x 1150,
  e a faixa centrada ali invadia a moldura.
