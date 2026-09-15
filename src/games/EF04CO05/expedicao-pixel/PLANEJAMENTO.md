# Expedição Pixel — planejamento

Documento irmão: [TEXTURAS.md](./TEXTURAS.md)

**EF04CO05 · 4º ano · Mundo Digital · Codificação da informação**

> **Replanejado do zero (15/09/2026).** As quatro versões anteriores deste jogo
> foram reprovadas sempre pelo mesmo motivo: **a mecânica era boa e a ficção era
> inventada.** Ruína, guardião, porta, caderno de campo — nada daquilo explicava
> por que separar cores faria alguma coisa acontecer, e criança sente isso na
> hora.
>
> O que sobreviveu foi só o núcleo: **três luzes que somam uma cor**. O resto é
> novo — contexto, arte, ritmo e recompensa — e a regra que escolheu o contexto
> é uma só: **a criança já tem que conhecer a situação, e a ação do jogo tem que
> ser a ação natural daquela situação.** Ninguém precisa explicar o que é uma
> festa com fogos, nem o que faz quem solta os fogos.
>
> **O nome.** A pasta e o slug continuam `expedicao-pixel`; o título que aparece
> na tela é decisão aberta — ver §17.

---

## 1. O jogo em três frases

1. **É noite de festa na praça, e você é quem solta os fogos.**
2. **A cor do fogo é feita de três luzes: vermelha, verde e azul — você abre as
   torneiras e o foguete vai ficando daquela cor.**
3. **Quando a cor bater com o que a festa pediu, aperte LANÇAR.**

Não há mais nada para aprender. O que muda de um nível para o outro é a cor que
a festa pede, nunca como se joga.

---

## 2. A descoberta, e por que ela é um "uau" de verdade

**Luz vermelha + luz verde = AMARELO.**

Com tinta isso não acontece — todo mundo já misturou tinta vermelha com verde e
obteve marrom. Com **luz**, dá amarelo, e é assim que funciona cada pontinho da
tela que a criança está olhando naquele instante. Descobrir isso soltando fogos é
melhor do que ouvir isso numa aula, e é o coração do nível 2.

~~~text
1 0 0   → só a torneira vermelha    → fogo VERMELHO
0 1 0   → só a verde                → fogo VERDE
1 1 0   → vermelha + verde          → fogo AMARELO   ← a descoberta
1 0 1   → vermelha + azul           → fogo ROSA
0 1 1   → verde + azul              → fogo CIANO
1 1 1   → as três                   → fogo BRANCO
~~~

---

## 3. Por que isso é EF04CO05

> **(EF04CO05) Codificar diferentes informações para representação em
> computador (binária, ASCII, atributos de pixel, como RGB etc.).**

| O que a habilidade diz | Onde está no jogo |
|---|---|
| **codificar** (verbo ativo) | a criança **fabrica** a cor abrindo as torneiras; nunca escolhe numa lista de cores prontas |
| **atributos de pixel, como RGB** | a cor do fogo **é** três quantidades de luz — não é metáfora de RGB, é RGB |
| **binária** | o estado das três torneiras é um código `1 0 1`, escrito em números grandes na mesa de comando |
| **diferentes informações** | uma cor pura (N1), uma mistura (N2) e uma quantidade (N3) |
| **ASCII** | fora de propósito — ver §4 |

O fechamento do jogo diz a frase que amarra tudo: **"Cada pontinho da tela do seu
celular faz o mesmo que você fez: acende três luzinhas e soma."** E o último
balão acrescenta que no computador de verdade cada torneira vai de 0 a 255.

**Teste da bolinha.** Troque as cores por bolinhas numeradas e não existe jogo:
sem a relação *quanto de cada luz ↔ a cor que aparece*, não há como decidir o que
abrir. Não existe caminho que dispense codificar.

---

## 4. Diferença para os jogos irmãos

| | O que já faz | O que este faz |
|---|---|---|
| **Ateliê de Códigos Digitais** (EF04CO05) | grade + legenda: a imagem célula por célula. A cor é uma **paleta de cinco fichas prontas** | nenhuma grade. A cor é **misturada** canal por canal |
| **Tradutor da Máquina** (EF04CO04) | letra → número ASCII → chaves 64/32/…/1 | nenhuma letra e nenhuma tabela de caracteres |
| **Pista Binária** (EF04CO04) | quadrinho da imagem → bit, em corrida | nenhuma imagem em matriz, nenhum relógio |

Restrições que caem daí: **nada de grade de pixels**, **nada de tabela
letra↔código**, **a cor nunca vem pronta numa paleta**.

**Sobre o ASCII.** Fica de fora de propósito: o EF04CO05 já tem jogo publicado
que usa a tabela ASCII real, e o EF04CO04 faz letra → número → bits. Uma terceira
visita à mesma tabela seria a terceira vez que a mesma criança encontra a mesma
coisa.

---

## 5. A tela

~~~text
┌──────────────────────────────────────────────────────────────┐
│ NÍVEL 1  ●○○                                    ♥♥♥      ?   │
├──────────────────────────────────────────────────────────────┤
│  ┌────────────┐                                              │
│  │ A FESTA    │              ✦                               │
│  │   PEDE     │                    ★  ← o fogo estoura aqui  │
│  │   ▉▉▉▉     │                                              │
│  │  AMARELO   │         ✦                                    │
│  └────────────┘                                              │
│ ▂▃▅▂▃▅▂▃▅▂▃▅▂▃  a multidão  ▂▃▅▂▃▅▂▃▅▂▃▅▂▃▅▂▃▅▂▃▅▂▃▅▂▃▅▂▃  │
├──────────────────────────────────────────────────────────────┤
│  ( ) VERMELHO   ( ) VERDE   ( ) AZUL    🚀        ( LANÇAR )  │
│       1              1           0                           │
└──────────────────────────────────────────────────────────────┘
~~~

Cinco coisas, e elas não trocam de lugar em nenhuma das nove rodadas:

- **A placa da festa**, no alto à esquerda: um círculo grande na cor pedida e o
  nome dela escrito embaixo.
- **O céu**, vazio e escuro: é onde o fogo estoura, e é onde ficam os fogos que
  já deram certo.
- **As três torneiras de luz**, na mesa de comando, com o código escrito embaixo.
- **O foguete na rampa**, ao lado do botão: ele brilha **na cor que está sendo
  misturada agora**. É a prévia, e fica grudada no gesto que a produz.
- **O botão LANÇAR**, o único que compromete, no canto direito.

Ajuste à esquerda, ação à direita — no celular deitado, um polegar em cada canto.

### Medidas (1280 × 720)

| Faixa | y | Conteúdo |
|---|---:|---|
| cabeçalho | 0–82 | nível, bolinhas das rodadas, vidas, `?` |
| placa da festa | 100–300, x 30–330 | círculo da cor pedida (Ø 120) + nome (34 px) |
| céu | 82–460 | estouro em torno de (830, 250); os fogos guardados sobem para o alto |
| multidão | 440–510 | silhueta do fundo; nada clicável |
| mesa de comando | 516–716 | torneiras em cx 150 / 370 / 590 (toque 210 × 190); foguete em cx 840; LANÇAR em cx 1130 (toque 220 × 200) |

Medidas que não se negociam:

- **O nome do canal é texto** (`VERMELHO`, `VERDE`, `AZUL`, 30 px) e o **número
  de cada luz** aparece embaixo (42 px). Este é um jogo sobre cor, e ele precisa
  ser jogável por uma criança daltônica: nome, número e posição dizem a mesma
  coisa três vezes, e a dica de erro fala em palavras ("faltou VERMELHO").
- **A placa escreve o nome da cor pedida.** O círculo sozinho não basta.
- **O foguete é a prévia** e fica a menos de 300 px do botão: olhar a cor e
  apertar são o mesmo movimento de olho.
- Nada clicável no céu, na placa, na multidão nem na faixa do `?`.
- Os números finais saem do fundo entregue, não deste documento — a lição que já
  custou caro duas vezes.

---

## 6. O laço

~~~text
A RODADA COMEÇA
→ a placa acende com a cor pedida e o nome dela
→ o foguete na rampa está apagado, as três torneiras fechadas

A CRIANÇA TOCA AS TORNEIRAS
→ o foguete muda de cor NA HORA
→ mexer é de graça: não conta tentativa, não tira vida, não emite nada

ELA APERTA LANÇAR
→ o foguete sobe assobiando e ESTOURA no céu, na cor que ela fez
→ certo : a multidão vibra, o fogo vira uma estrela que fica no céu
→ errado: o estouro acontece do mesmo jeito, ao lado da cor pedida,
          e dá para ver que não bate. TRAVA no botão até ela mexer numa luz.
~~~

**Mexer e lançar são coisas separadas, e essa é a única regra fina do jogo.** Se
cada toque numa torneira fosse uma tentativa, experimentar a cor — que é
exatamente o que ensina — custaria vidas, e a criança pararia de experimentar.

**O erro é festivo, e é o melhor professor do jogo.** O foguete errado sobe e
estoura igual: a criança vê a cor dela **do lado da cor pedida**, no céu, e
descobre sozinha o que falta. Nada de "você errou"; o que aparece é a comparação.

---

## 7. Controle — três torneiras, um toque

**Tocar numa torneira muda o estado dela.** Só isso, do primeiro ao último nível.

| Nível | O que o toque faz | O código embaixo |
|---|---|---|
| 1 e 2 | alterna **fechada / aberta** | `1 0 1` |
| 3 | percorre **0 → 1 → 2 → 3 → 0** (quanto de luz) | `3 2 0` |

É o mesmo controle e o mesmo gesto; no nível 3 ele só ganha mais paradas. Não
existe segunda interface no jogo — nem barra, nem cursor, nem soma, nem arraste.

| Alvo | Tamanho lógico | No celular |
|---|---:|---:|
| torneira | 210 × 190 | ~63 × 57 px |
| LANÇAR | 220 × 200 | ~66 × 60 px |

No computador: **1 / 2 / 3** mexem em cada luz e a **barra de espaço** lança.

**Errar o toque numa torneira não custa nada**, porque mexer é de graça — e é por
isso que elas podem ficar coladas. Quem precisa de folga é o **LANÇAR**, e ele é
o maior alvo da tela, no canto, longe das três.

---

## 8. Três níveis, uma ideia nova em cada

### Nível 1 — **cada torneira é uma cor**

| Rodada | A festa pede | Código |
|---|---|---|
| 1.1 | **VERMELHO** | `1 0 0` |
| 1.2 | **AZUL** | `0 0 1` |
| 1.3 | **VERDE** | `0 1 0` |

Três rodadas rápidas, para a mão aprender o gesto e o olho aprender qual torneira
é qual. A 1.1 começa com o tutorial.

### Nível 2 — **as luzes se somam**

| Rodada | A festa pede | Código | O que ela descobre |
|---|---|---|---|
| 2.1 | **AMARELO** | `1 1 0` | vermelho + verde dá amarelo |
| 2.2 | **ROSA** | `1 0 1` | vermelho + azul dá rosa |
| 2.3 | **BRANCO** | `1 1 1` | as três juntas dão branco |

É o nível do "uau". A 2.3 fecha com o balão do Mestre: *"As três juntas dão
branco. É por isso que a luz do dia parece branca: ela tem todas as cores."*

### Nível 3 — **não é só acesa: é quanto**

As torneiras ganham quatro paradas. Mesmo gesto, mais posições.

| Rodada | A festa pede | Código |
|---|---|---|
| 3.1 | **LARANJA** | `3 2 0` |
| 3.2 | **VERDE-ÁGUA** | `0 3 2` |
| 3.3 | **ROXO** | `2 0 3` |

Fechamento do jogo, com o céu cheio das nove cores que ela fez:

> **"Cada pontinho da tela do seu celular faz o mesmo que você acabou de fazer:
> acende três luzinhas e soma. Lá, cada uma vai de 0 a 255."**

---

## 9. A regra é função, não gabarito

~~~ts
type Step = 0 | 1 | 2 | 3
interface Mix { r: Step; g: Step; b: Step }

/** O passo vira luz. É o ÚNICO lugar onde 0–3 vira 0–255. */
const toRgb = (m: Mix) => ({ r: m.r * 85, g: m.g * 85, b: m.b * 85 })

/** A cor que o foguete brilha e que o estouro pinta. */
const toColor = (m: Mix) => (m.r * 85 << 16) | (m.g * 85 << 8) | (m.b * 85)

const matches = (a: Mix, b: Mix) => a.r === b.r && a.g === b.g && a.b === b.b

/** Direção da diferença, canal por canal: −1 falta, +1 passou, 0 bate. */
const gap = (made: Mix, target: Mix) => ...

/** Quantas paradas a torneira tem neste nível: 2 ou 4. */
const steps = (level: number) => (level < 3 ? 2 : 4)
~~~

**A cor pedida nunca é guardada como hexadecimal.** Em `data/levels.ts` a rodada
guarda um `Mix` de três números e o **nome** que a placa escreve; o que a tela
pinta sai de `toColor`. Se a cor fosse `0xffaa00` nos dados, o jogo saberia a
resposta sem saber do que ela é feita — e no dia em que alguém mexesse nos
números, a placa e o foguete discordariam.

**O foguete, o estouro e a placa leem a MESMA função.** Uma fonte de cor só.

Validação ao carregar: nove rodadas, três por nível; todo `Step` entre 0 e 3; nos
níveis 1 e 2 só 0 ou 3; nenhuma rodada com os três canais iguais (preto não
estoura e branco só no lugar certo); toda rodada com nome escrito.

---

## 10. Erro, TRAVA e vidas

Lançar com a cor errada:

1. O foguete sobe e **estoura mesmo assim** — o erro não tira o espetáculo.
2. O estouro fica um instante no céu **ao lado do círculo da cor pedida**.
3. A multidão faz um "ohhh" curto; nada de buzina, nada de vermelho de erro.
4. O botão LANÇAR ganha um cadeado: não dá para lançar de novo sem mudar nada.
5. O balão do Mestre diz a **direção**, nunca o valor: **"Faltou VERMELHO."** /
   **"Passou: tem AZUL demais."**
6. Depois do **segundo** lançamento errado na mesma rodada, a torneira do canal
   mais distante pulsa. O valor certo continua não aparecendo.
7. Mexer em qualquer torneira destrava — porque mexer é o único jeito de
   corrigir.

Contabilidade:

- **`WRONG_ANSWER` + `lives.lose()` uma vez por rodada**, no primeiro erro. Os
  seguintes na mesma rodada não custam outra vida.
- **Não são erro:** mexer nas torneiras, abrir o `?`, demorar.
- **`CORRECT_ANSWER` uma vez por rodada.** +10 de primeira, +5 depois de travar.
  Nove rodadas somam 90; estrelas no padrão 90/70 do catálogo.
- `createLives` decide o `GAME_OVER` no zero. O jogo não o emite.
- **Nenhum ponto, porcentagem ou contagem em texto na tela.** O placar é o céu:
  cada acerto deixa uma estrela colorida lá em cima.

**Não há relógio.** O tempo seria contado justamente enquanto a criança compara
duas cores, que é o momento em que ela aprende.

---

## 11. Feedback audiovisual

| Momento | Visual | Som |
|---|---|---|
| toque na torneira | a válvula gira, o vidro acende, o foguete muda de cor na hora | nota que **sobe com o valor** |
| LANÇAR | o botão afunda, faísca no pavio | estalo curto |
| subida | o foguete risca o céu deixando rastro | assobio que sobe |
| estouro | a explosão abre em pétalas na cor da mistura, com faíscas caindo | estouro (ruído) + acorde |
| acerto | a multidão vibra, o fogo vira uma **estrela que fica no céu** | multidão + fanfarra curta |
| erro | o estouro fica ao lado do círculo pedido e some; cadeado no botão | "ohhh" curto, grave, **não alarme** |
| fim de nível | as três estrelas do nível brilham juntas | fanfarra `[523, 659, 784, 1047]` |

Os tons carregam informação: a torneira soa mais aguda quanto mais aberta. Tudo
sintetizado com WebAudio, respeitando `mute-audio`, tudo com equivalente visual.
Sem narração.

**O estouro é `Graphics`, nunca textura**: a cor dele é a resposta, e tem que
nascer da mesma função que pinta o foguete.

---

## 12. Tutorial e `?`

Quatro passos na rodada 1.1, com a cena já montada:

1. "A festa pediu esta cor." — recorte na placa.
2. "A cor do fogo é feita de três luzes." — recorte nas três torneiras.
3. "Abra uma torneira e olhe o foguete." — dedo bate na vermelha (`tap: true`);
   o foguete acende junto.
4. "Quando a cor bater, aperte LANÇAR." — recorte no botão.

Um passo por nível (`key: 'ef04co05ep-lN'`), `safeTop` abaixo do cabeçalho, com
as coordenadas tiradas dos objetos de verdade para o `?` repetir certo. No N2 o
balão avisa que agora dá para abrir mais de uma; no N3, que a torneira tem quatro
posições.

---

## 13. Arquitetura

~~~text
src/games/EF04CO05/expedicao-pixel/
├── PLANEJAMENTO.md
├── TEXTURAS.md
├── index.ts          1280 × 720, Scale.FIT + CENTER_BOTH, [BootScene, GameScene]
├── types.ts
├── data/
│   ├── layout.ts     as coordenadas do §5
│   ├── theme.ts      cores, alfas, fontes
│   └── levels.ts     LEVELS + a lógica pura do §9
└── scenes/
    ├── BootScene.ts  import.meta.glob + createLoadingScreen + faseInicial
    ├── GameScene.ts  orquestra e não desenha nada
    ├── sky.ts        o céu, o voo, o estouro e as estrelas guardadas
    ├── console.ts    as três torneiras, o foguete na rampa e o LANÇAR
    ├── board.ts      a placa da festa e o balão do Mestre
    ├── effects.ts    cenário, multidão, painters puros
    └── audio.ts      WebAudio direto
~~~

A `GameScene` não desenha: todo `createX` devolve `{ container, ...métodos,
destroy() }`. `gen` protege todo `await`; `tries`/`stalled` zeram em toda rodada;
`setEnabled` repinta sempre.

Um estado só governa toque, animação e pausa:

~~~ts
type Phase = 'misturando' | 'voando' | 'travado' | 'pausado' | 'fim'
~~~

As zonas de toque das torneiras e do LANÇAR são **zonas soltas de cena**, criadas
na posição definitiva — os controles mudam de escala no gesto, e uma zona dentro
de um container que anima seria comida pela animação. Céu, placa e foguete **não
têm zona**. `zones[]` é destruída na mão no `destroy()`.

O foguete é repintado por mudança, não por frame: só muda quando uma torneira
muda. O estouro é um punhado de `Graphics` com vida curta, destruídos no fim da
animação e no `shutdown`.

Reusar sem reimplementar: `createLoadingScreen`, `faseInicial`, `vidasIniciais`,
`createLives`, `createTutorial`, `showLevelComplete`, `FX`, `runtimeGameBridge`.
`LEVELS` mora só em `data/levels.ts`.

Eventos: `GAME_READY`; `CORRECT_ANSWER` a cada rodada certa; `WRONG_ANSWER` no
primeiro erro da rodada; `CHECKPOINT` no avanço; `GAME_COMPLETED` ao fim **de
cada nível**, com `stage: this.level.level` e `totalStages: LEVELS.length`. Nunca
escrever `isFinalStage`, nunca emitir `GAME_OVER` à mão. O saldo de vidas
atravessa o `scene.restart`.

Registro: `src/data/catalog.ts` com slug `expedicao-pixel`, module
`EF04CO05/expedicao-pixel`, skill `EF04CO05`, ano 4, tags
`["rgb", "cor", "binário", "pixel"]`; e `src/data/gameInstructions.ts`. Não mexer
no publicado `atelier-codigos-digitais`.

---

## 14. Produção em etapas

**Primeiro corte — só o nível 1**, com desenho de reserva em `Graphics`: céu,
multidão, mesa, três torneiras, foguete, LANÇAR, voo, estouro, TRAVA, tutorial,
vidas e `?`. Entregar para teste real antes de pedir arte.

Depois: arte (§ [TEXTURAS.md](./TEXTURAS.md)), nível 2, nível 3, capa.

Conferir no fim: TypeScript, ESLint, uma rodada certa de primeira, uma com TRAVA,
o `?` no meio da mistura, mudo, retomada por `?stage=2` e os eventos no console
em `?embed=1&inline=1&stage=1&points=0&lives=3`.

---

## 15. Critérios de aceite

### O contexto se explica sozinho

- [ ] uma criança que abre o jogo sem ler nada entende que é uma festa e que ela
      solta os fogos;
- [ ] a placa diz o que a festa quer, com cor **e** nome;
- [ ] o foguete mostra a cor antes de lançar, ao lado do botão;
- [ ] nada na tela precisa de uma história para fazer sentido.

### BNCC

- [ ] a cor é montada torneira por torneira, nunca escolhida numa paleta;
- [ ] o código `1 0 1` aparece escrito embaixo das torneiras;
- [ ] o nível 2 mostra que as luzes se somam (vermelho + verde = amarelo);
- [ ] o nível 3 mostra que não é só aberta, é **quanto**;
- [ ] o fecho liga o fogo ao pixel da tela do celular e ao 0–255;
- [ ] a cor pedida é guardada como três quantidades, nunca como hexadecimal.

### É justo e é divertido

- [ ] mexer nas torneiras é ilimitado e grátis; só LANÇAR compromete;
- [ ] o fogo errado **estoura do mesmo jeito** e aparece ao lado da cor pedida;
- [ ] a dica diz a direção, nunca o valor;
- [ ] depois do segundo erro, a torneira do canal errado pulsa;
- [ ] cada acerto deixa uma estrela colorida no céu, e o céu é o placar;
- [ ] nenhum ponto, porcentagem ou contagem em texto;
- [ ] três níveis planejados, só o nível 1 implementado antes do teste;
- [ ] o jogo roda inteiro sem nenhum PNG carregado.

---

## 16. Decisão

**Uma festa, três torneiras de luz e um botão.** A criança abre a vermelha e a
verde porque a placa pediu amarelo, vê o foguete ficar amarelo na mão dela, e
solta — e o céu estoura amarelo em cima da praça. É a habilidade inteira, com um
contexto que não precisa de uma linha de explicação, e um motivo para querer
acertar que não é uma porta inventada: **é o céu ficando bonito.**

---

## 17. O nome, que ficou pendente

A pasta, o slug e o registro no catálogo continuam **`expedicao-pixel`**: trocar
slug quebraria link salvo e daria trabalho sem ganho.

O **título na tela** é outra coisa, e hoje ele não combina com o jogo: não há
expedição nenhuma, há uma festa. Três saídas, em ordem de preferência:

1. **"Mestre dos Fogos"** — diz o que a criança faz, e é o nome que o jogo pede;
2. **"Festival de Luzes"** — mais suave, mesma ideia;
3. **"Expedição Pixel"** — fica como está, e o título vira só um rótulo.

O slug não muda em nenhuma das três: é uma linha no `catalog.ts` e uma no
cabeçalho do jogo.
