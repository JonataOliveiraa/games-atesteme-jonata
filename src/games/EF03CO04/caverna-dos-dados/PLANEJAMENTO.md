# Caverna dos Dados - EF03CO04

Documento irmão: [TEXTURAS.md](./TEXTURAS.md)

A criança atravessa uma caverna, recolhe dados brilhantes e chega a um altar.
Ali, ela escolhe quais dados se relacionam; quando o conjunto ganha sentido, as
fichas viram uma **informação única** e abrem a porta de pedra.

> **O briefing precisava de dois ajustes para ensinar a habilidade.** Se todos
> os dados do nível 1 fossem necessários, tocar em tudo venceria sem relacionar
> nada; por isso só a primeira galeria é guiada e as duas seguintes já têm um
> intruso claro. E o altar não mostra campos como `dia`, `hora` e `lugar`, pois
> isso repetiria o Montador de Informações e entregaria a relação antes da
> criança descobri-la.

---

## 1. A habilidade, e o teste que ela precisa passar

> **(EF03CO04)** Relacionar o conceito de informação com o de dado.

Objeto: **Codificação da informação**.

> Pode-se mostrar exemplos de dados que individualmente não possuem significado
> relevante, mas que, em conjunto, definem alguma informação. Por exemplo, cada
> um dos dados de um endereço (tipo e nome do logradouro, CEP, município etc.),
> em conjunto, definem a informação de um endereço específico, os dados de dia,
> mês e ano definem uma data específica, as cores de cada pixel, juntas,
> definem uma imagem etc.

| Elemento da habilidade | Onde está no jogo |
|---|---|
| dado | cada ficha isolada: `quarta`, `14h`, `festa azul` |
| relacionar | escolher quais fichas pertencem ao mesmo acontecimento |
| informação | a faixa legível que nasce do conjunto selecionado |
| prova | a faixa entra na porta e produz uma consequência física: ela abre |

### O teste da bolinha

> **Troque as palavras e os pictogramas por bolinhas sem significado. O jogo
> ainda pode ser resolvido?**

Não. As fichas têm a mesma moldura, o mesmo brilho e posições embaralhadas. A
relação não é indicada por cor, forma, ordem de coleta ou encaixe físico. Sem
saber que `sábado`, `praça` e `piquenique` podem contar um mesmo acontecimento,
não há como separá-los de `sapato`.

A primeira galeria, sozinha, não passaria: os três dados são necessários e
tocar em tudo funciona. Ela é uma demonstração causal curta. A habilidade vira
decisão ainda no nível 1, nas galerias 2 e 3, quando aparece um dado que não
participa da informação.

### O altar não completa frases

Os encaixes mostram apenas **quantos dados** a porta precisa. Não têm rótulos,
não possuem silhueta de resposta e não formam uma frase com lacunas. A criança
seleciona um conjunto sem ordenar palavras.

O centro do altar é um objeto grande com o símbolo de duas peças se unindo e a
palavra **JUNTAR**. Tocar nele afirma: “estes dados juntos já contam a
informação”. A seleção continua editável até esse toque; mudar de ideia não é
erro.

---

## 2. Como isso não vira o jogo irmão

`EF03CO04` já tem o **Montador de Informações** (id 017) publicado.

| | Montador de Informações | Caverna dos Dados |
|---|---|---|
| O que aparece | formulário com campos nomeados | dados soltos e encaixes sem nome |
| O que a criança descobre | em qual campo cada dado entra | quais dados pertencem ao mesmo sentido |
| Gesto | arrastar ficha para um campo | tocar para incluir ou retirar do conjunto |
| Regra espacial | cada dado tem uma posição correta | a posição e a ordem das fichas não importam |
| Validação | confere campo por campo | confere a relação do conjunto inteiro |
| Resultado | formulário, endereço ou ficha preenchida | os fragmentos viram uma faixa e agem sobre o mundo |

Uma frase para a diferença: **o irmão organiza dados dentro de uma estrutura
que já existe; a Caverna pede que a criança descubra a estrutura comum que faz
os dados virarem informação.**

Explorar não é uma troca de tema. A porta só reage à informação completa: uma
ficha isolada ilumina um pedaço da faixa, mas não produz sentido suficiente
para mover a pedra.

---

## 3. O laço

```text
A GALERIA ENTRA
→ pedras fechadas brilham na trilha; o vão da caverna está escuro, sem porta
→ a criança toca numa pedra
   ↳ o explorador anda até ela e bate duas vezes com a picareta
   ↳ a pedra racha e SOLTA UMA PALAVRA, que fica um instante no ar e vai
     para a bolsa; minerar não é resposta e nunca tira vida
→ todas as pedras abertas: o explorador recua e o altar sobe
→ a bolsa abre e as palavras saem dela, uma a uma, em posições embaralhadas
→ a criança toca nas que acredita pertencerem à mesma informação
   ↳ toque põe no encaixe; novo toque devolve à bolsa
→ toca em JUNTAR
   ↳ uma ficha só ou encaixe vazio: a faixa continua incompleta, sem erro
   ↳ conjunto completo com intruso: fumaça, TRAVA e uma vida a menos
   ↳ conjunto correto: as fichas se fundem e a frase nasce na faixa
      → o altar sai de cena e A PORTA APARECE no vão escuro
      → a faixa entra no selo, a pedra desliza e a luz sai
      → o explorador atravessa a pé
→ a faixa formada vai para o Diário do Explorador
→ cortina, e a próxima galeria monta atrás dela
→ três galerias: diário abre com as três informações e fecha o nível
```

Controle: **um toque**. Coletar, selecionar, devolver, juntar, revelar e voltar
a explorar usam o mesmo gesto. Não há arrasto, gesto de precisão, hover ou
controle obrigatório de teclado.

O personagem anda sozinho porque direção e plataforma não fazem parte da
habilidade. A exploração dá ritmo e transforma cada dado em descoberta; a
decisão curricular acontece no altar.

---

## 4. Clareza para criança

| Conceito | Como a tela mostra |
|---|---|
| aqui tem um dado | pedra fechada que brilha e pede picareta |
| minerei | a pedra racha, a palavra sai de dentro e vai para a bolsa |
| escolhi este | a ficha sobe para um anel do altar |
| ainda está separado | cada ficha mantém sua borda; a faixa segue rachada |
| estes dados têm relação | fios de luz passam entre os anéis ocupados |
| ainda falta | anel vazio respira em azul, sem vermelho e sem punição |
| virou informação | bordas somem e nasce uma faixa com uma frase única |
| a informação funcionou | a faixa entra no selo e a porta abre |
| este dado não pertence | o intruso treme, ganha cadeado e recebe uma frase curta |
| progresso | uma página do diário acende por porta aberta |

A placa do altar aparece antes da primeira escolha:

> **Dados são pedacinhos. Juntos, viram informação!**

Depois disso, a mecânica fala sozinha. O nome do nível e as frases finais são
os únicos textos longos; cada rótulo de dado tem no máximo três palavras.

---

## 5. A grade: exploração e altar ocupam a tela inteira em momentos diferentes

Tela fixa de **1280 x 720** com `Phaser.Scale.FIT`. A coluna “No celular” usa
fator 0,30, para uma tela de 390 px de largura.

### Exploração

| Faixa | y | Conteúdo | Tamanho | No celular |
|---|---|---|---|---|
| Header | 0 - 78 | nível, páginas do diário, vidas e `?` | `?` toque 140 x 140 | 42 x 42 |
| Caverna | 78 - 596 | trilha, explorador, dados e porta ao fundo | dado 154 · toque 184 | 46 · **55** |
| Bolsa | 596 - 720 | bolsa e miniaturas coletadas | faixa 124 · miniatura 92 | 37 · 28 |

Os dados ficam com centros entre `x = 120` e `x = 1160`, e entre `y = 210` e
`y = 500`. Nenhum alvo encosta no header ou nas bordas. O personagem para a
pelo menos 170 px do cristal ativo, para não cobri-lo.

### Altar

| Faixa | y | Conteúdo | Tamanho | No celular |
|---|---|---|---|---|
| Header | 0 - 78 | o mesmo header; `?` continua visível | `?` toque 140 | 42 |
| Porta e faixa | 78 - 266 | porta, faixa quebrada e frase formada | faixa 820 x 94 · fonte 38 | 246 x 28 · fonte 11 |
| Altar | 266 - 468 | 2 a 4 anéis e o centro JUNTAR | anel 118 · JUNTAR 220 x 118 | 35 · **66 x 35** |
| Bolsa aberta | 468 - 720 | até 6 fichas em duas linhas | ficha 184 x 112 · toque 200 x 136 | 55 x 34 · **60 x 41** |

A ficha visual tem 34 px reais de altura, mas a zona chega a 41. Entre duas
zonas há 18 px na grade. A ficha selecionada sai da bolsa; nunca existem duas
cópias tocáveis do mesmo dado.

**Nada cobre a decisão.** A explicação da trava ocupa a faixa da porta, acima
do altar. O intruso e sua zona continuam livres na bolsa ou no anel. Não entra
modal por cima das fichas.

---

## 6. Níveis e galerias

**Fase = uma galeria**, da primeira coleta até a porta abrir. Três galerias por
nível. O laço e o controle não mudam; crescem a quantidade, a proximidade
semântica dos intrusos e a necessidade de buscar um dado ausente.

| Nível | Dados por galeria | Encaixes | Intrusos | O que entra |
|---|---|---|---|---|
| 1 | 3, 4 e 4 | 3 | nenhum na primeira; 1 óbvio nas demais | dado isolado versus conjunto |
| 2 | 5 | 4 | 1 relacionado ao tema, mas fora do recado | contexto |
| 3 | 6 | 4 | 2 plausíveis | dado escondido e comparação fina |

### Nível 1 — o conjunto ganha sentido

| Galeria | Dados | Informação |
|---|---|---|
| Festa azul | `quarta`, `14h`, `festa azul` | **Quarta, às 14h, tem festa azul!** |
| Café da manhã | `7h`, `cozinha`, `café da manhã` + `sapato` | **Às 7h tem café da manhã na cozinha.** |
| Recreio | `10h`, `pátio`, `recreio` + `travesseiro` | **Às 10h tem recreio no pátio.** |

A primeira galeria é guiada sem ser automática: o tutorial coleta e seleciona
apenas `quarta`; a criança precisa completar o conjunto e tocar em JUNTAR.

### Nível 2 — o intruso pertence ao assunto, mas não à informação

| Galeria | Dados | Informação |
|---|---|---|
| Piquenique | `sábado`, `10h`, `praça`, `piquenique` + `bola` | **Sábado, às 10h, tem piquenique na praça!** |
| Aniversário | `dia 12`, `abril`, `casa`, `aniversário` + `presente` | **Dia 12 de abril tem aniversário em casa.** |
| Ônibus escolar | `8h`, `ônibus`, `portão`, `escola` + `recreio` | **Às 8h, o ônibus chega ao portão da escola.** |

`Bola`, `presente` e `recreio` cabem no assunto geral, mas não completam o
recado específico. A arte não os marca como suspeitos.

### Nível 3 — duas alternativas plausíveis e um dado escondido

| Galeria | Dados | Informação | Escondido |
|---|---|---|---|
| Acordar | `segunda`, `7`, `horas`, `acordar`, `8`, `dormir` | **Na segunda, acordar às 7 horas.** | `segunda` |
| Treino | `sexta`, `16h`, `quadra`, `treino`, `terça`, `campo` | **Sexta, às 16h, tem treino na quadra.** | `quadra` |
| Almoço | `domingo`, `12h`, `casa da vó`, `almoço`, `sábado`, `casa da tia` | **Domingo, às 12h, tem almoço na casa da vó.** | `casa da vó` |

Na primeira passagem, o dado escondido não entra na bolsa. Um cristal grande
mostra um brilho interno, mas o explorador segue. No altar sobra um anel vazio
e aparece **VOLTAR** junto da bolsa. Tocar volta ao cristal; tocar na pedra
revela o dado; tocar no dado coleta. Nenhuma dessas ações é erro.

Os intrusos do briefing `peixe` e `verde` saem do nível 3. São distantes demais
e transformariam a decisão mais difícil na mais óbvia. Entram outra hora,
outro dia, outro lugar ou uma ação relacionada.

---

## 7. As regras, em código

Tudo que varia por conteúdo mora em `data/levels.ts`. Não existe outro arquivo
exportando `LEVELS`.

```ts
export interface Datum {
    id: DatumId
    label: string
    frame: number
}

export interface Gallery {
    id: string
    name: string
    data: Datum[]
    information: {
        datumIds: DatumId[]
        sentence: string
    }
    hiddenDatumId?: DatumId
}

const sameSet = (a: Iterable<string>, b: Iterable<string>) => {
    const left = [...a].sort()
    const right = [...b].sort()
    return left.length === right.length && left.every((id, i) => id === right[i])
}

export const formsInformation = (gallery: Gallery, selected: Set<DatumId>) =>
    sameSet(selected, gallery.information.datumIds)

export const intrudersIn = (gallery: Gallery, selected: Set<DatumId>) =>
    [...selected].filter(id => !gallery.information.datumIds.includes(id))
```

O dado não guarda `correct: true`. O veredito nasce da **relação entre o
conjunto selecionado e a informação da galeria** no instante de JUNTAR. A
ordem dos toques não importa.

| Situação | Evento | Pontos | Vida |
|---|---|---|---|
| informação formada de primeira | `CORRECT_ANSWER` | +10 | — |
| informação formada depois de trava | `CORRECT_ANSWER` | +5 | — |
| conjunto completo com intruso | `WRONG_ANSWER` | 0 | -1 por `lives.lose()` |
| seleção incompleta | nenhum | 0 | — |
| voltou para explorar | nenhum | 0 | — |

Nenhum número de ponto, acerto, erro, tempo ou porcentagem aparece na tela.

---

## 8. O erro, e o que ele NÃO é

**Existe um erro só: tocar em JUNTAR afirmando que um conjunto completo com
dado alheio já forma a informação.** Selecionar continua sendo edição.

A trava:

1. o centro JUNTAR fecha e o restante da tela escurece;
2. a primeira ficha intrusa treme e ganha cadeado âmbar;
3. a faixa tenta nascer, quebra naquele dado e vira fumaça curta;
4. uma frase explica qual relação falhou: `Sapato não conta o café da manhã.`;
5. só a ficha intrusa aceita toque;
6. tocá-la devolve a ficha à bolsa, preserva as úteis e destrava o altar;
7. depois de dois erros na mesma galeria, as fichas necessárias que ainda
   estão na bolsa pulsam com contorno azul.

O contador da dica zera no começo de cada galeria e depois de cobrar. O jogo
emite `WRONG_ANSWER` antes de `lives.lose()`.

O que **não** é erro:

| Situação | Motivo |
|---|---|
| coletar qualquer dado | coleta ainda não afirma relação |
| selecionar e retirar | mudar de ideia é pensar |
| JUNTAR com menos fichas que encaixes | informação incompleta não é relação falsa |
| demorar | a habilidade é de raciocínio, não reflexo |
| tocar fora | erro de dedo não é erro conceitual |
| voltar para buscar o escondido | é a solução prevista do nível 3 |

Nenhum estado sem saída: a ficha que destrava fica livre, o dado escondido
pode ser buscado sempre e a porta nunca fecha por tempo.

---

## 9. Feedback

| Momento | Visual | Som |
|---|---|---|
| galeria entra | cristais acendem em sequência; porta solta poeira | acorde cavernoso curto |
| explorador anda | caminhada leve e balanço da bolsa | passos macios alternados |
| dado disponível | contorno ciano pulsa sem cobrir ícone e rótulo | brilho de cristal |
| coleta | cristal faz arco até a bolsa e deixa rastro curto | plim ascendente |
| ficha selecionada | sobe ao anel e nasce um fio de luz | nota curta por ficha |
| ficha devolvida | fio recolhe e ficha volta | nota descendente |
| seleção incompleta | anel vazio respira; nada fica vermelho | duas batidas neutras |
| informação formada | fios convergem, bordas somem, frase nasce | acorde crescente |
| porta abre | pedra desliza e a luz recorta o explorador | rangido + fanfarra curta |
| intruso | faixa quebra nele, fumaça e borda âmbar | baque abafado |
| dado escondido | cristal racha e ilumina o chão | estalo cristalino |
| fim do nível | três páginas do diário abrem juntas | acorde completo |

O efeito principal é a **fusão**: as fichas deixam de parecer objetos separados
e viram uma única faixa legível. Sem essa passagem visual, o jogo seria apenas
seleção de cartões com uma porta decorativa.

Áudio sintetizado em WebAudio, em `scenes/audio.ts`, respeitando `mute-audio`
do `EventBus`. Sem narração.

---

## 10. Tutorial: uma relação começa, a criança termina

Tutorial visual de até cinco segundos, sem tela separada. Usa
`shared/tutorial/createTutorial`, `pointer.tap: true`, e pode combinar o
holofote com animação automática.

| Passo | A mão toca | O que acontece |
|---|---|---|
| 1 | o cristal `quarta` | ele voa para a bolsa |
| 2 | a ficha `quarta` | ela sobe ao primeiro anel; os outros dois respiram |
| 3 | — | a mão some e o controle volta à criança |

O tutorial não seleciona os três dados e não abre a porta. Ele ensina o toque e
mostra que uma ficha isolada ainda não forma a informação. O `?` pausa o mundo,
repete o tutorial e retoma sem salto.

---

## 11. Conteúdo pronto — nível 1

| Galeria | Dados corretos | Intruso | Frase da trava |
|---|---|---|---|
| Festa azul | `quarta`, `14h`, `festa azul` | — | — |
| Café da manhã | `7h`, `cozinha`, `café da manhã` | `sapato` | `Sapato não conta o café da manhã.` |
| Recreio | `10h`, `pátio`, `recreio` | `travesseiro` | `Travesseiro não conta o recreio.` |

Frases formadas:

1. **Quarta, às 14h, tem festa azul!**
2. **Às 7h tem café da manhã na cozinha.**
3. **Às 10h tem recreio no pátio.**

Regra de conteúdo: toda informação final é concreta, curta e reconhecível por
uma criança de oito anos. Nenhum intruso depende de exceção, marca comercial ou
conhecimento regional.

---

## 12. O que é textura, e o que é Graphics

**Textura:** fundo da caverna, explorador, porta, bolsa, cristal especial e os
pictogramas dos dados. Estão no [TEXTURAS.md](./TEXTURAS.md).

**Graphics:** cristal-base dos dados, ficha, rótulo, altar, encaixes, centro
JUNTAR, fios de relação, faixa da informação, texto, cadeado, VOLTAR, header,
páginas do diário, tutorial, fumaça, poeira, partículas e painel de conclusão.

O texto nunca entra no PNG. `quarta`, `14h`, `JUNTAR` e a informação formada
são `Phaser.Text`, nítidos e editáveis.

---

## 13. Registro

```text
src/games/EF03CO04/caverna-dos-dados/
src/assets/games/EF03CO04/caverna-dos-dados/
```

| Campo | Valor |
|---|---|
| `slug` | `caverna-dos-dados` |
| `module` | `EF03CO04/caverna-dos-dados` |
| `skill` | `EF03CO04` |
| `years` | `[3]` |
| `tags` | `["dados", "informação", "relação", "exploração", "toque"]` |
| `order` | `175` (entre o Montador, 170, e o Formato Certo, 180) |
| `points` | `90` (9 galerias x 10; menor depois de trava) |
| `icon` | `💎` |
| `status` | `published`, somente quando jogável |

O `id` será escolhido no registro, conferindo o catálogo e os jogos que
entrarem em paralelo. Não reservar número no planejamento.

Também registrar em `src/data/gameInstructions.ts` e no conjunto
`GAMES_WITH_IN_GAME_COMPLETION_SCREEN` de `GameDetailsPage.tsx`.

Plataforma, sempre por `runtimeGameBridge`:

| Evento | Quando |
|---|---|
| `GAME_READY` | uma vez, quando a primeira galeria aceita toque |
| `CORRECT_ANSWER` | a cada porta aberta |
| `WRONG_ANSWER` | somente ao confirmar conjunto completo com intruso |
| `CHECKPOINT` | a cada porta, progresso em 0–100 |
| `GAME_COMPLETED` | fim de cada nível, `stage: this.level.level`, `totalStages: LEVELS.length` |
| `GAME_OVER` | nunca daqui; sai de `createLives` no zero |

Não há relógio de derrota. `altarDurationMs`, `wrongCombinations` e
`returnedToExplore` podem existir no estado, mas o contrato atual não possui
campos para enviá-los. Não inventar propriedades no evento; ampliar o contrato
compartilhado em tarefa separada se essa telemetria for necessária.

---

## 14. Arquivos

```text
types.ts                Datum, Gallery, LevelDef, Phase
data/theme.ts           cores e fontes
data/layout.ts          as duas grades, ficha, anéis e hitboxes
data/levels.ts          LEVELS: níveis, galerias, dados e informações
data/rules.ts           formsInformation(), intrudersIn()
scenes/BootScene.ts     glob + loading + faseInicial + preloadLives
scenes/GameScene.ts     estado e orquestração; não desenha
scenes/cave.ts          fundo, trilha, cristais e retorno
scenes/explorer.ts      caminhada, coleta e travessia
scenes/bag.ts           bolsa fechada, aberta e fichas disponíveis
scenes/altar.ts         anéis, fios, seleção e fusão
scenes/door.ts          faixa quebrada, informação e abertura
scenes/lock.ts          intruso, explicação e destrave
scenes/hud.ts           header, diário e ?
scenes/audio.ts         WebAudio, sem arquivo
```

**A GameScene não desenha.** Se ela precisar de `fillRoundedRect`, falta um
painter em `scenes/`. Cada módulo devolve métodos de estado e `destroy()`.

Kit compartilhado: `createLoadingScreen`, `faseInicial`, `vidasIniciais`,
`createLives`, `createTutorial`, `showLevelComplete`, `FX` e
`runtimeGameBridge`. `createTimeBar` fica fora de propósito.

---

## 15. Antes da arte existir

Toda textura entra por `import.meta.glob` e é usada apenas quando
`textures.exists(key)`. O nível 1 abre com zero PNG.

| Faltando | Reserva em código |
|---|---|
| `bg-caverna.png` | fundo azul-acinzentado, pedras e caminho simples |
| `explorador.png` | boneco de círculos e cápsulas com mochila |
| `objetos-caverna.png` | bolsa, porta e cristal em formas geométricas |
| `dados-n1.png` | pictograma simples + rótulo no tamanho final |

A reserva é para ajustar e jogar antes da arte, não para entrega final.

---

## 16. Ordem de produção

1. **Nível 1 sozinho**, três galerias e reservas — primeira avaliação do
   usuário, como manda o documento de instruções.
2. Corrigir clareza, tamanho de toque, seleção, trava e tempo das animações.
3. Gerar `bg-caverna`, `explorador`, `objetos-caverna` e `dados-n1` pelos
   prompts exatos do TEXTURAS.
4. Apresentar o nível 1 novamente.
5. Implementar níveis 2 e 3 ainda com reservas.
6. Gerar `dados-n2`, `dados-n3` e a capa.
7. Registrar no catálogo somente depois da experiência jogável.

---

## 17. Antes de considerar pronto

- [x] primeira entrega contém apenas o nível 1;
- [x] níveis 2 e 3 entram depois do nível 1 aprovado;
- [x] nível 1 tem três galerias e decisão real nas duas últimas;
- [x] bolinhas sem significado não resolvem o jogo;
- [x] não há campos nomeados entregando a relação;
- [x] uma ficha isolada nunca abre a porta;
- [x] seleção pode ser editada sem punição;
- [x] só JUNTAR um conjunto completo com intruso tira vida;
- [x] trava libera apenas ao retirar o intruso;
- [x] dica zera por galeria e depois de cobrar;
- [x] alvos principais têm pelo menos 40 px reais no celular;
- [x] `?` pausa, repete o tutorial e retoma sem salto;
- [x] áudio e animações respeitam mudo e pausa;
- [x] nenhum ponto, erro, porcentagem ou tempo aparece;
- [x] vidas atravessam `scene.restart` entre níveis;
- [x] `faseInicial` abre o nível solicitado;
- [x] `GAME_COMPLETED` sai ao fim de cada nível;
- [x] `stage` vem do nível e `totalStages` de `LEVELS.length`;
- [x] o jogo não escreve `isFinalStage`;
- [x] `shutdown` remove listeners, timers e componentes;
- [x] `npx tsc --noEmit` limpo;
- [x] ESLint da pasta limpo;
- [x] nenhum gancho de depuração sobrou;
- [x] nível 1 jogado e aprovado pelo usuário (rodada 2);
- [ ] níveis 2 e 3 jogados e avaliados pelo usuário.

---

## 18. O que mudou na construção

### Rodada 1 — nível 1 jogável (set/2026)

| Mudança | Motivo |
|---|---|
| O tutorial não coleta nem seleciona sozinho | O plano queria que ele guardasse `quarta` e a pusesse no anel. Virou dedo que bate no alvo e espera: a criança faz o gesto de verdade, nas duas telas. São dois momentos, `explorar` e `altar`, e o `?` repete o que couber no modo atual. |
| Encaixe do tamanho da ficha (202 x 118), e não anel de 118 | Se a ficha encolhesse no encaixe, a zona de toque encolheria junto — e é exatamente na ficha do encaixe que a criança precisa tocar para destravar. Ela sobe sem mudar de tamanho, e a zona nunca fica menor que na bolsa. |
| Zona da ficha com duas alturas (122 e 136) | 122 px viram 37 px reais no celular, abaixo do mínimo do plano. Com uma linha de fichas sobra espaço para 136 (41 px reais); com duas linhas, 122 é o que cabe sem uma zona comer a outra. |
| O pictograma entra numa elipse creme dentro da gema | A gema de `objetos-caverna` veio opaca, sem o centro vazio que o prompt pedia. A elipse devolve o fundo claro sem esconder o cristal, e o ícone volta a ser lido de longe. |
| A faixa quebra em âmbar no pedaço do intruso | O plano dizia que a faixa "quebra naquele dado". Sem marcar o pedaço, ela continuava toda acesa durante a trava e a explicação ficava só no texto. |
| Balão do tutorial do altar fixado em `y = 175` | Na tela do altar, encaixes, JUNTAR e fichas ocupam de 260 a 700. O botão "Próximo" nasce 150 px abaixo do balão: em qualquer outra altura ele cai em cima do que o passo está explicando. |
| Bolsa no canto DIREITO durante a exploração | O canto esquerdo é onde o explorador começa a andar; a bolsa ali ficava embaixo dele já no primeiro passo. |
| Bolsa mostra miniaturas, nunca um número | "Nenhum número aparece na tela" vale também para a contagem de coletados. |
| `points: 30` no catálogo, e sem capa | Três galerias x 10. Sobe para 90 quando os níveis 2 e 3 entrarem; a capa é o último asset, como manda o TEXTURAS. |

Diferenças que a arte trouxe: `explorador.png` chegou em 1400 x 1000 e
`objetos-caverna.png` em 1600 x 800. As grades continuaram 4 x 2 e a ordem dos
quadros bateu com o contrato; só o lado da célula mudou (350 x 500 e 400 x 400),
e ele está no `SHEETS` do `BootScene`.

O que foi jogado nesta rodada, com o loop bombeado no Browser pane: as três
galerias inteiras, a seleção editável, JUNTAR incompleto, a trava com intruso
(vida a menos, cadeado, faixa quebrada), a destrava, a dica depois do segundo
erro, a porta abrindo e o diário final.

### Rodada 2 — a picareta, a porta que nasce e o corte de texto (10/09/2026)

O usuário desenhou dois quadros novos no `explorador.png` (terceira linha:
picareta erguida e picareta batendo) e pediu três coisas: minerar cada cristal,
a porta visível só no acerto, e menos texto na tela.

| Mudança | O que virou |
|---|---|
| **Minerar, e não recolher** | A pedra entra FECHADA (quadro 3 de `objetos-caverna`). Um toque manda o explorador até ela; ele bate duas vezes — a primeira treme e solta lascas, a segunda racha (quadro 4). A palavra sai de dentro, sobe, fica quase meio segundo no ar para ser lida e só então entra na bolsa. |
| **O dado não tem rótulo antes da picareta** | Some do cenário o rótulo grande que cada cristal carregava. O que a criança lê na caverna é o que ela MINEROU — e isso tirou quatro blocos de texto da tela sem tirar informação nenhuma. |
| **A porta não existe até a informação nascer** | O vão do fundo fica coberto por uma sombra em arco. A porta só aparece — com poeira e um pulinho de escala — depois que a faixa vira uma frase. Aí ela engole a faixa no selo, desliza (quadros 5→6→7) e o explorador atravessa **a pé**, andando até lá. Antes ela ficava parada no canto desde o primeiro quadro, o que dizia "a saída já estava aí" em vez de "a informação abriu a saída". |
| **O explorador anda em profundidade** | Ele para a 122 px do cristal, com os pés 132 px abaixo do centro dela, e a escala acompanha a altura na trilha (0,40 ao fundo, 0,47 à frente). A ponta da picareta encosta na pedra. |
| **Menos texto** | O header perdeu a frase — sobraram pílula do nível, páginas do diário, vidas e `?`. O tutorial caiu para 3 a 5 palavras por passo ("Toque na pedra para minerar.", "Toque nas que combinam.", "Depois, JUNTAR."), com o recorte fazendo o trabalho de apontar. A placa do altar é dita **uma vez por nível**, e nunca embaixo do tutorial: ela espera o `onFinish`. As frases de trava e de seleção incompleta encolheram. |
| **Transições** | Cortina entre galerias (a montagem acontece com a tela apagada); as palavras SAEM DA BOLSA em arco quando o altar sobe; altar e bolsa saem de cena antes da porta; o explorador caminha até a porta aberta. |
| **Painter compartilhado** | `scenes/word.ts` desenha a palavra uma vez só. É a MESMA peça na caverna e no altar — o dado que caiu da pedra é o dado que vai ser relacionado, e trocar de desenho no meio quebraria a continuidade. |

`explorador.png` agora é 1400 x 1500, grade 4 x 3: os oito quadros originais e
mais dois, 8 (picareta em cima) e 9 (picareta batendo). A caixa alfa foi medida
nos dez: a sola fica em y≈475 de 500 em todos, então a origem 0,95 serve para a
folha inteira e a troca de quadro não pula.

### Rodada 3 — níveis 2 e 3, e o vão sem tapume (10/09/2026)

O retângulo escuro que cobria o vão da caverna saiu. Ele existia para a porta
não aparecer antes da hora, mas lia como um remendo por cima do fundo. Sem ele,
o arco iluminado do `bg-caverna` volta a ser cenário — e a porta continua
nascendo só quando a informação nasce, agora por cima de um vão que sempre
esteve ali.

**Nível 2** entrou como planejado: 5 dados, 4 encaixes, 1 intruso que pertence
ao assunto e não ao recado (`bola`, `presente`, `recreio`).

**Nível 3** trouxe o dado escondido, e ele mudou de forma por causa da picareta:

| Decisão | Por quê |
|---|---|
| A pedra escondida **não nasce** com as outras | A última posição embaralhada da galeria fica reservada para ela. A criança chega ao altar com 5 palavras e 4 encaixes. |
| O botão **VOLTAR** aparece no altar, ao lado da bolsa | Só existe enquanto há dado esperando lá fora. Tocar nele recolhe a bancada, devolve a bolsa para a trilha e acende a pedra que faltava, com estalo e luz. |
| O altar **avisa** que falta dado antes da primeira escolha | Sem o aviso, qualquer conjunto completo que ela montasse teria intruso — os 4 corretos não estavam todos na mão — e ela perderia uma vida por uma situação armada pelo jogo. O aviso não diz QUAL dado nem QUAIS se relacionam: a decisão continua inteira. |
| O `subject` da frase de trava não nomeia o dado escondido | "Campo não conta o treino", e não "o treino na quadra". A frase que explica o erro não pode entregar a resposta que ainda está enterrada. |

Ajustes que os níveis novos exigiram:

- as posições de 5 e 6 pedras abriram para duas fileiras mais separadas, e a
  **profundidade de cada pedra virou a altura dela na trilha** (`depth = y/100`)
  — assim a da frente cobre a de trás e também ganha o toque quando as zonas
  se encostam;
- sem a folha do nível, a ficha centraliza o rótulo e aumenta a fonte em 25% em
  vez de deixar o buraco onde o pictograma entraria. É o que permite jogar os
  níveis 2 e 3 antes de `dados-n2.png` e `dados-n3.png` existirem;
- a bolsa aprendeu a **voltar** (`toExplore`): guarda a lista do que já foi
  minerado e redesenha as miniaturas quando a criança retorna à caverna;
- `points` do catálogo subiu de 30 para 90 — nove galerias a dez.

### As folhas chegaram (10/09/2026)

`dados-n2.png`, `dados-n3.png` e a capa entraram no tamanho pedido e com a
ordem dos quadros idêntica às tabelas §9 e §10 do TEXTURAS. Conferi galeria por
galeria dentro do jogo — piquenique, aniversário, ônibus, acordar, treino e
almoço — e cada pictograma caiu no rótulo certo. A capa foi registrada como
`thumbnail` do catálogo.

Da folha do nível 3 saiu a melhor solução da rodada: `7` e `8` viraram
**contagens de pedrinhas**. O negativo dos prompts proíbe algarismos, e contar
pedra é justamente o que um dado numérico solto significa antes de alguém dizer
a que ele se refere.

As nove galerias estão jogáveis com arte final. O que falta é a criança.
