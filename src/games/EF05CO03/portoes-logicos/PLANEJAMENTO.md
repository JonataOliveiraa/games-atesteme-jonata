# Planejamento — Portões Lógicos

Tower defense · 5º ano · Pensamento Computacional · `EF05CO03`
Documento irmão: [TEXTURAS.md](./TEXTURAS.md)

## 1. A habilidade

**Habilidade:** (EF05CO03) Realizar operações de negação, conjunção e disjunção sobre sentenças lógicas e valores `verdadeiro` e `falso`.
**Objeto:** Lógica computacional.

**O jogo em uma frase:** cada criaturinha marcha até uma bifurcação com dois portões de regra — toque no portão cuja frase é VERDADEIRA para ela.

**O vínculo:** escolher o portão exige aplicar negação, conjunção e disjunção a sentenças sobre a criaturinha que está na trilha (`é azul`, `tem chapéu`, `é pequena`, `tem óculos`) e decidir o valor verdade. É a habilidade em cada toque, e a avaliação termo a termo na placa ensina o porquê de cada resultado.

**Teste da bolinha:** se as criaturinhas virassem bolinhas iguais, não sobra sentença para avaliar. Os atributos visíveis **são** os termos. A habilidade está na mecânica, não na arte.

## 2. Controle — gesto único

Um toque: tocar no portão certo antes de a criaturinha chegar à bifurcação. Nada de configurar, nada de arrastar.

Tocar cedo é permitido e é o caminho de quem já entendeu: a criaturinha acelera e entra. A marcha de 6 s é o teto do tempo de pensar, não o ritmo obrigatório.

## 3. Fluxo

```text
TÍTULO
→ exemplo animado de 5 s, pulável a qualquer toque
→ JOGO
→ RESULTADO
```

O **exemplo animado** é uma corrida de demonstração: uma criaturinha marcha, o portão certo abre sozinho, a placa acende termo a termo e ela entra no curral. Roda uma vez no começo de cada nível, porque em cada nível a placa muda de forma.

Botão `?` sempre visível no canto superior direito: **pausa o jogo** e abre o painel ilustrado de como jogar. Despausa onde parou, com a criaturinha no mesmo ponto da trilha.

As três falas do tutorial acontecem **durante** o exemplo animado, nunca sobre tela parada:

| Nível | Falas |
|---|---|
| 1 | “Esta criaturinha precisa passar por um portão.” → “Toque no portão cuja frase for verdadeira para ela.” → “Errou? A placa mostra o porquê e ela volta.” |
| 2 | “Agora a placa tem duas partes.” → “O E exige as duas; ao OU basta uma.” → “Olhe a placa acender parte por parte.” |
| 3 | “Um NÃO pode estar dentro da frase.” → “E a faixa vermelha vira a frase inteira do avesso.” → “Leia a placa toda antes de tocar.” |

## 4. A grade

Grade fixa `1280 × 720`, `Phaser.Scale.FIT`. Header de ponta a ponta, sem cantos redondos.

| Faixa | Região | Conteúdo | Tamanho | No celular (≈ 0,30) |
|---|---|---|---:|---:|
| Header | `0–82`, largura toda | nível + 3 bolinhas de onda, enunciado, `?` | `?` 60 px, enunciado 32 px | `?` 18 px, 10 px |
| Trilha | `x 40→520`, `y 330` | a criaturinha da vez marchando | criaturinha 140 px de altura | 42 px |
| Marco de altura | `x 500`, `y 250–360` | poste listrado com um traço na altura-limite | 24 × 110 px | 7 × 33 px |
| Placa de cima | `x 560–920`, `y 120–252` | a regra do portão de cima | 360 × 132 px | 108 × 40 px |
| Placa de baixo | `x 560–920`, `y 392–524` | a regra do portão de baixo | 360 × 132 px | 108 × 40 px |
| Portão de cima | `x 930–1010`, `y 130–290` | o vão e a folha do portão | 80 × 160 px | 24 × 48 px |
| Portão de baixo | `x 930–1010`, `y 400–560` | idem | 80 × 160 px | 24 × 48 px |
| Curral de cima | `x 1020–1260`, `y 110–300` | quem passou pelo portão de cima | 240 × 190 px | 72 × 57 px |
| Curral de baixo | `x 1020–1260`, `y 380–570` | quem passou pelo portão de baixo | 240 × 190 px | 72 × 57 px |
| Fila da onda | `x 40–520`, `y 600–700` | as próximas criaturinhas, pequenas | 56 px de altura cada | 17 px |

A placa é o objeto mais importante da tela e tem `360 × 132` — **maior que o portão**. Quem decide é a frase, não a porta.

O **marco de altura** fica na bifurcação, como o de brinquedo de parque: é ele que transforma `é pequena` numa sentença julgável. Sem um padrão físico ao lado, “pequena” depende de comparar com uma criaturinha que não está mais na tela.

## 5. Regras — passo a passo

1. Onda = 8 criaturinhas, uma por vez (10 no nível 3).
2. Tocar num portão o abre; a criaturinha entra por ele.
3. Regra VERDADEIRA para ela: entra no curral com festinha. `+10`.
4. Regra FALSA: ela para na porta, a placa mostra a avaliação termo a termo (`azul ✓ E chapéu ✗ = FALSO`) e ela volta calma ao início da trilha. **TRAVA**: cadeado no portão errado, dica de uma linha, e o jogo só destrava com o toque no portão certo. Acerto depois da trava vale `+5`. Depois de 2 erros na mesma criaturinha, o portão certo pisca.
5. Não tocar a tempo: a criaturinha espera na bifurcação, boceja e senta. Sem punição, sem relógio no header — quem marca o tempo é ela.
6. Fim da onda: os dois currais mostram as turmas separadas, e a placa de cada curral fica acesa por cima delas.

Só existe **um** erro no jogo inteiro: tocar no portão cuja regra é falsa para a criaturinha da vez. Esperar, olhar, deixar ela sentar — nada disso custa.

## 6. Os pares de portões, e o conserto de um problema do briefing

### O problema

O par `azul E chapéu` × `azul OU chapéu` **não pode** ser decidido por “toque no portão verdadeiro”:

- criaturinha azul **com** chapéu → `E` é verdadeiro e `OU` também. Dois portões certos.
- criaturinha nem azul nem de chapéu → os dois são falsos. Nenhum portão certo.

Não é um caso a evitar na escolha das criaturinhas: `X E Y` implica `X OU Y` **sempre**, então esse par nunca dá exatamente um portão verdadeiro. Vale para qualquer dupla de termos.

### A regra que conserta

**Os dois portões de uma onda são sempre uma frase e a negação dela.** O portão de baixo mostra a **mesma placa** do de cima, atravessada por uma faixa vermelha com a palavra `NÃO` e com a placa dessaturada. Assim, para qualquer criaturinha e qualquer frase, exatamente um portão é verdadeiro — nunca dois, nunca nenhum.

É literalmente o par do nível 1 do briefing (`é azul` × `NÃO é azul`), estendido aos níveis 2 e 3.

### Onde foi parar o par mais pedagógico

Ele ficou melhor. O par `E` × `OU` passa a acontecer **entre duas ondas seguidas, com a mesma turma de criaturinhas**:

- onda 1 do nível 2: placa `azul E chapéu`, e o seu `NÃO`;
- onda 2 do nível 2: placa `azul OU chapéu`, e o seu `NÃO`, **com as mesmas 8 criaturinhas**.

Mesmos termos, mesma turma, um operador trocado — e os currais enchem completamente diferente. No fim do nível, as duas fotos dos currais aparecem lado a lado. A criança não ouve que o `E` exige os dois: ela vê o curral de cima ter duas criaturinhas na primeira onda e cinco na segunda.

### As ondas

| Nível | Onda | Placa de cima | Placa de baixo | Turma |
|---|---:|---|---|---|
| 1 | 1 | `é azul` | `NÃO é azul` | A |
| 1 | 2 | `tem chapéu` | `NÃO tem chapéu` | B |
| 1 | 3 | `é pequena` | `NÃO é pequena` | A |
| 2 | 1 | `azul E chapéu` | `NÃO (azul E chapéu)` | C |
| 2 | 2 | `azul OU chapéu` | `NÃO (azul OU chapéu)` | **C, a mesma** |
| 2 | 3 | `pequena E óculos` | `NÃO (pequena E óculos)` | D |
| 3 | 1 | `NÃO verde E tem chapéu` | o `NÃO` disso | E |
| 3 | 2 | `é verde OU NÃO tem chapéu` | o `NÃO` disso | **E, a mesma** |
| 3 | 3 | `NÃO vermelha E tem óculos` | o `NÃO` disso | F |

As ondas 1 e 2 do nível 3 são uma a negação da outra sem que ninguém diga isso: os currais simplesmente **trocam de conteúdo**. O painel de fim de nível mostra as duas fotos e uma linha: “as mesmas criaturinhas, os currais trocados”.

### Os dois NÃO

Existem dois níveis de negação e eles são visualmente diferentes de propósito:

- **NÃO de termo** — uma tarja pequena sobre o ícone de um termo dentro da placa (`NÃO verde E tem chapéu`);
- **NÃO da frase** — a faixa vermelha atravessando a placa inteira, que é o portão de baixo.

O nível 3 é onde os dois aparecem juntos, e é por isso que ele é o nível 3.

## 7. As regras, em código

A resposta certa **não fica nos dados**. Os dados guardam a turma da onda e a frase da placa de cima; o portão certo é derivado no instante do toque.

```ts
type Atributo = 'azul' | 'verde' | 'vermelha' | 'chapeu' | 'pequena' | 'oculos'
type Operador = 'e' | 'ou'

interface Termo {
  atributo: Atributo
  negado: boolean   // a tarja pequena sobre o ícone
}

interface Frase {
  left: Termo
  op?: Operador     // ausente = frase de um termo só (nível 1)
  right?: Termo
}

const valeTermo = (t: Termo, c: Criatura) =>
  t.negado ? !tem(c, t.atributo) : tem(c, t.atributo)

function avaliar(f: Frase, c: Criatura): boolean {
  const l = valeTermo(f.left, c)
  if (!f.op || !f.right) return l
  const r = valeTermo(f.right, c)
  return f.op === 'e' ? l && r : l || r
}

// O portão de baixo é sempre a negação do de cima.
const portaoCerto = (onda: Onda, c: Criatura) =>
  avaliar(onda.frase, c) ? 'cima' : 'baixo'
```

`portaoCerto` é total: para qualquer criaturinha e qualquer frase existe exatamente um portão certo. É o que a regra do §6 comprou, e é o motivo de não haver tabela de gabarito nos dados — gabarito congelado envelhece na primeira vez que alguém mexe numa criaturinha.

**Teste obrigatório:** para as 9 ondas, percorrer todas as criaturinhas da turma e afirmar que `avaliar` dá `true` para pelo menos uma e `false` para pelo menos uma. Onda em que todas vão para o mesmo curral existe, é chata e não ensina — o teste a denuncia antes de alguém jogar.

## 8. Conteúdo pedagógico

**Atributos:** cor (`azul` / `verde` / `vermelha`), chapéu (sim/não), tamanho (`pequena` / `grande`), óculos (sim/não).

**As oito criaturinhas.** Combinação fixa por criaturinha — uma criaturinha que muda de atributo entre ondas destrói a comparação entre a onda do `E` e a do `OU`.

| # | Nome | Cor | Chapéu | Tamanho | Óculos |
|---:|---|---|:---:|---|:---:|
| 0 | Bibi | azul | sim | grande | não |
| 1 | Tuto | azul | não | pequena | sim |
| 2 | Zeca | azul | sim | pequena | sim |
| 3 | Mila | verde | não | grande | não |
| 4 | Nino | verde | sim | pequena | não |
| 5 | Pipa | vermelha | não | grande | sim |
| 6 | Lelê | vermelha | sim | pequena | não |
| 7 | Dudu | verde | não | grande | sim |

**Conferência da turma C** (a do par `E` × `OU`), com as oito na onda:

- `azul E chapéu` → **Bibi, Zeca**. Dois no curral de cima, seis no de baixo.
- `azul OU chapéu` → **Bibi, Tuto, Zeca, Nino, Lelê**. Cinco em cima, três embaixo.

Dois viram cinco com uma palavra trocada, e a foto dos currais prova.

**Frase-síntese**, na tela final: *“O E exige os dois; o OU se contenta com um; o NÃO vira tudo do avesso!”*

## 9. Feedback audiovisual

| Momento | O que acontece |
|---|---|
| Marcha | passinho com squash, poeirinha, marchinha curta em loop discreto |
| Espera na bifurcação | boceja, senta, olha para os dois lados — sem relógio e sem bronca |
| Toque num portão | a folha do portão sobe; som de portão |
| Avaliação | a placa acende termo a termo, da esquerda para a direita: ícone ✓ agudo, ícone ✗ grave; depois o carimbo `VERDADEIRO` ou `FALSO` |
| Faixa `NÃO` | quando a frase resolve, a faixa gira sobre a placa e o carimbo **vira** na frente da criança |
| Acerto | portão abre de vez, fanfarra `[523, 659, 784, 1047]` a cada 110 ms, festinha no curral |
| Erro | a criaturinha para na soleira, a placa mostra o `FALSO` termo a termo, cadeado no portão errado, balão de uma linha, e ela volta andando calma |
| 2 erros na mesma criaturinha | o portão certo pisca |
| Fim da onda | a câmera fecha nos dois currais, as placas acendem por cima deles: a foto |
| Fim do nível | as fotos das ondas lado a lado, taxa por operador em linguagem de criança (“você é craque no OU!”), estrelas 90 / 70 |

**Sem narração de áudio.** Tudo por balão e pictograma. Os sons são `playTone` com WebAudio, respeitando o mudo — sem arquivo de som.

O balão de erro tem **uma linha e menos de 35 caracteres**, e ele diz a causa, não a solução:

| Situação | Balão |
|---|---|
| Frase falsa, faltou um termo do `E` | “Falta o chapéu dela.” |
| Frase falsa, nenhum termo do `OU` | “Ela não tem nenhum dos dois.” |
| Frase falsa por causa do `NÃO` | “O NÃO inverte: dá o contrário.” |

## 10. Avaliação e telemetria

Registrar por criaturinha: portão tocado, portão certo, acerto de primeira, número de erros, **tempo entre a criaturinha entrar na trilha e o primeiro toque**.

Agregar por operador (`NÃO`, `E`, `OU`) e destacar o par `E` × `OU`, que é onde o erro é informativo. Estrelas padrão: 90 % e 70 % de acerto de primeira.

Ponte com a plataforma: `GAME_READY`, `CHECKPOINT` (progresso sobre o total de criaturinhas), `CORRECT_ANSWER` / `WRONG_ANSWER` com `pointsEarned`, `GAME_COMPLETED`. Esperar, bocejar e sentar **não** emitem nada.

## 11. Padrões do catálogo

TRAVA no erro (pausa + cadeado + dica; destrava só com a ação correta; depois de 2 erros a opção certa pisca) · botão `?` sempre visível, com painel ilustrado · sem narração de áudio · `+10` de primeira, `+5` após a trava · estrelas 90 / 70 · HTML5 responsivo para computador e celular · sem multiplayer, compras ou cadastro.

## 12. Antes da arte existir

O jogo tem de rodar sem um PNG sequer:

- criaturinha vira um corpo arredondado na cor do atributo, com chapéu e óculos em blocos e o tamanho pela escala;
- portão vira moldura com duas folhas;
- curral vira cerca de postes;
- cenário vira degradê de campo com morros em blocos.

Já são `Graphics` na versão final, e não mudam quando a arte chegar: **a trilha inteira** (é onde o tween anda; um caminho pintado no fundo nunca bate no pixel), o marco de altura, a placa e tudo dentro dela, a faixa `NÃO`, os carimbos, o cadeado, a poeira, o confete e a UI de plataforma.

**O `Graphics` fala a mesma língua da arte.** O estilo deste jogo é chibi chapado com contorno colorido (ver [TEXTURAS.md](./TEXTURAS.md)), então trilha, placa, marco e carimbos são cor chapada com um contorno num tom mais escuro da própria cor — nunca preto, nunca degradê, nunca sombra difusa. É o que faz a metade desenhada em código pertencer à mesma tela da metade desenhada em PNG.

Carregamento por `import.meta.glob` com `WANTED` no `BootScene`. Arte ausente não pode quebrar `vite build`.

## 13. Registro

| Item | Valor |
|---|---|
| Pasta | `src/games/EF05CO03/portoes-logicos` |
| Assets | `src/assets/games/EF05CO03/portoes-logicos` |
| Slug | `portoes-logicos` |
| Título | `Portões Lógicos` |
| Gênero | Tower defense |
| Ícone | `🚪` |
| Habilidade | `EF05CO03` · 5º ano · Pensamento Computacional |

Antes de considerar pronto:

- [ ] teste das 9 ondas: nenhuma manda a turma inteira para o mesmo curral;
- [ ] jogar as 9 ondas com o mouse, do zero, sem chamar função por dentro;
- [ ] conferir que esperar, bocejar e sentar não emitem `WRONG_ANSWER`;
- [ ] conferir que tocar cedo acelera a criaturinha e não é penalizado;
- [ ] `?` pausa e devolve a criaturinha no mesmo ponto da trilha;
- [ ] exemplo animado pulável em qualquer instante dos 5 s;
- [ ] entrada em `src/data/catalog.ts` e em `src/data/gameInstructions.ts`;
- [ ] slug em `GAMES_WITH_IN_GAME_COMPLETION_SCREEN`, em `src/pages/GameDetailsPage.tsx`;
- [ ] `runtimeGameBridge` conferido em console nos três níveis;
- [ ] jogar com `?embed=1&inline=1&stage=1&points=0&lives=3`;
- [ ] mudo, `?`, tutorial e retomada sem salto;
- [ ] `npx tsc --noEmit` e `npx eslint src/games/EF05CO03/portoes-logicos --ext .ts`.

## 14. Estado da implementação (17/09/2026)

**O jogo está completo: três níveis, três ondas cada, 72 criaturinhas.**

| Nível | Ondas | O que a placa estreia |
|---|---|---|
| 1 | `é azul` · `tem boné` · `é pequena` (com marco) | um termo, e o `NÃO` da frase inteira numa ficha vermelha acima |
| 2 | `azul E boné` · `azul OU boné` (mesma turma, mesma ordem) · `pequena E óculos` (com marco) | dois termos e a ficha do operador, que acende verde ou vermelha depois dos dois |
| 3 | `NÃO verde E boné` · `verde OU NÃO boné` (mesma turma, mesma ordem) · `NÃO azul E óculos` | o `NÃO` de TERMO: traço vermelho riscando aquele ícone e a palavra em vermelho |

Os três jogados do começo ao fim com o mouse: trava, destrava, exemplo animado,
`?`, as duas passagens de nível e a tela de fim.

**As duas primeiras ondas de cada nível composto são o jogo inteiro.** Mesma
turma, mesma ordem, uma peça trocada:

- nível 2, `E` → `OU`: o curral de cima sai de **2** para **5**;
- nível 3, `NÃO verde E boné` → `verde OU NÃO boné`: os currais **trocam de
  conteúdo**, 3/5 vira 5/3. É De Morgan, e ninguém diz o nome dele.

Ajustes que a tela pediu e que o plano não previa:

- **a criaturinha andava escondida atrás da placa.** O braço da raia cruza a
  tábua, e com a criaturinha desenhada por baixo dela sumia justo o trecho que a
  criança precisa ver — a entrada no portão que ela escolheu. Ela subiu para
  cima da placa, e a soleira foi de `0,82` para `0,93`: em `0,82` ela parava EM
  CIMA da tábua e tapava o segundo termo no instante do julgamento;
- **o `NÃO` de termo fala por dois canais.** O traço vermelho riscando o ícone
  lê em qualquer tamanho; a palavra vem com `NÃO` na frente e em vermelho porque
  símbolo sozinho é vocabulário que a criança ainda não tem. A primeira versão
  tinha uma tarja com "NÃO" escrito em 13 px — 4 px reais no celular, ou seja,
  nada;
- o nível 3 usa `NÃO azul E óculos` onde o plano dizia `NÃO vermelha`:
  `NÃO VERMELHA` obrigaria a fileira a encolher para 80% e derrubaria a palavra
  abaixo do que se lê num telefone;

- **a fileira da placa é montada por largura MEDIDA e encolhe para caber.**
  `PEQUENA E ÓCULOS` é bem mais larga que `AZUL E BONÉ`, e numa tábua de tamanho
  fixo a palavra escorria para fora. A diferença de corpo entre uma placa e
  outra não se nota; a palavra cortada se notaria na hora;
- a bifurcação recuou de `x=360` para `330`, e o portão e o curral andaram para
  a direita, porque a placa de dois termos passou a encostar nos dois;
- **`andarNoBraco` tem de lembrar onde a criaturinha está.** A passagem pelo
  portão são dois trechos — até a soleira, a placa julga, e só então o resto — e
  a versão que partia sempre de zero teleportava a criaturinha de volta para a
  bifurcação antes de dispará-la até o curral. O tempo também virou o do braço
  INTEIRO, com cada trecho levando a fração dele, senão o pedaço curto anda cinco
  vezes mais rápido que o longo;

- a criaturinha nascia em `x = 16` e ficava metade fora do canvas. Agora nasce em
  `92`, e quem sai pela borda é a fita (`TRACK.ribbonX`), que é o que faz parecer
  que elas vêm de algum lugar;
- o carimbo `VERDADEIRO`/`FALSO` estava no meio da tábua e **tapava a frase que
  estava julgando**. Foi para baixo dela: quem lê `FALSO` sem conseguir reler
  `É AZUL` perdeu a metade que ensina;
- o recorte do tutorial no passo 1 saía de um número fixo, e no replay pelo `?`
  iluminava grama vazia. Agora sai de `ator.bounds()`;
- os corações de vida não aparecem — `VIDAS_VISIVEIS` está `false` no
  `shared/hud/createLives`, para os 49 jogos. Não é deste jogo, e a posição já
  está passada certa para quando a chave virar.

Falta a capa (`cover-portoes-logicos.png`); a entrada do catálogo está sem
`thumbnail` até ela existir.

## 15. O que foi mudado do briefing, e por quê

Três desvios, todos anotados para ninguém “consertar” de volta sem ler:

1. **O portão de baixo é sempre a negação do de cima** (§6). O par `E` × `OU` como dois portões concorrentes é insolúvel: `X E Y` implica `X OU Y`. O par sobrevive entre ondas seguidas, e o ganho é a foto dos currais.
2. **Não há gabarito nos dados** (§7). Com `portaoCerto` derivado, a tabela criatura × portão seria uma cópia que envelhece. O que o dev ganha em troca é que mexer numa criaturinha não exige refazer tabela nenhuma.
3. **Não há barra de tempo no header** (§5). O briefing pede timer suave a partir do nível 2, só como ritmo — então o relógio é a própria criaturinha bocejando e sentando. Uma barra no topo que nunca causa nada ensina a criança a ignorar barras.

Um parâmetro que talvez precise de ajuste depois de jogar: são 8 criaturinhas por onda (10 no nível 3), 9 ondas, **78 decisões**. Fica em `CRIATURAS_POR_ONDA`, por nível. Se o teste de jogo mostrar cansaço, o corte é na onda — nunca no número de ondas, porque é a onda inteira que produz a foto dos currais, e são as fotos que ensinam.
