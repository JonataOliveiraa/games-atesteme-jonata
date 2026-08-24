# Detetives da Busca — Documento mecânico

Documentos irmãos: [PLANEJAMENTO.md](./PLANEJAMENTO.md) · [VISUAL.md](./VISUAL.md) · [TEXTURAS.md](./TEXTURAS.md)

---

## 1. Máquina de estados

Um caso passa por estes estados, sempre nesta ordem:

```
    briefing ──▶ searching ⇄ refreshing
    (o pedido)   (a criança      (o mural
                  toca)          troca)
                     │
                     ▼
                  reading ──── fechou ────▶ searching
                  (lupa)
                     │
                  É ESSA!
                     │
              ┌──────┴──────┐
              ▼             ▼
           solved        searching
          (acertou)      (errou, −5)
```

| Estado | Interação liberada |
|---|---|
| `briefing` | nenhuma; o pedido está sendo escrito |
| `searching` | tocar palavra, filtro ou cartão |
| `refreshing` | nenhuma; o mural está trocando de conteúdo |
| `reading` | tocar **É ESSA!** ou tocar fora para fechar |
| `solved` | nenhuma; celebração e avanço |

**`refreshing` é um estado de verdade, não um detalhe.** Enquanto os cartões saem e entram, todo toque é ignorado. Sem isso, a criança toca em duas palavras seguidas e dois murais diferentes animam ao mesmo tempo — cartões da busca antiga caindo no meio dos da busca nova.

## 2. Modelo de dados

```ts
export type ResultType = 'site' | 'imagem' | 'video'
export type FilterId = 'all' | ResultType

export interface Result {
  id: string
  /** Título curto, no máximo duas linhas no cartão. */
  title: string
  /** De onde veio: 'Enciclopédia Infantil'. Dá contexto sem exigir leitura longa. */
  source: string
  /**
   * O trecho, no máximo duas linhas.
   *
   * As palavras entre asteriscos são pintadas em destaque quando a lupa abre:
   * 'Animal que vive no *gelo* e nada muito bem.'
   */
  snippet: string
  type: ResultType
  /** As palavras que fazem este resultado aparecer. É só isto que a busca casa. */
  tags: string[]
  /** O que o navegador diz quando a criança escolhe este resultado. */
  verdict: string
}

export interface Word {
  id: string
  label: string
}

export interface Case {
  id: string
  /** O pedido, em português normal. */
  question: string
  /** Etiqueta do critério, só no Nível 3: 'APRENDER A FAZER'. */
  criterion?: string
  /** Qual resultado responde ao pedido. */
  answerId: string
  /** Palavras já na barra quando o caso abre. Vazio no N1. */
  baseWords: string[]
  /** Palavras oferecidas na bandeja. Vazio no N3. */
  tray: Word[]
  /** Quantas palavras a barra comporta. 1 no N1, 2 no N2, 0 no N3. */
  slots: 0 | 1 | 2
  /** Vazio = a faixa de filtros não existe neste caso. */
  filters: FilterId[]
  results: Result[]
  hint: string
}

export interface Level {
  level: 1 | 2 | 3
  title: string
  objective: string
  tip: string
  cases: Case[]
}
```

### 2.1 O que NÃO existe neste modelo, e por quê

Não há `correctKeywordId` nem `correctFilterId`. O arquivo de dados do jogo antigo marcava as três respostas certas, e era exatamente isso que o transformava num quiz: a criança não descobria nada, ela adivinhava qual das três opções o arquivo tinha marcado.

Aqui o dado declara só **fatos** — que palavras cada resultado carrega, de que tipo ele é, qual deles responde ao pedido. **Se uma palavra é boa ou não, o jogo calcula** (§4.2). Uma palavra passa a ser boa porque de fato reduz o conjunto sem perder a resposta, não porque alguém escreveu isso num campo.

O ganho prático é grande: dá para trocar o conteúdo de um caso sem reescrever nenhuma regra, e é impossível o dado ficar inconsistente com a mecânica.

## 3. A busca

A regra inteira cabe em cinco linhas, e é honesta com o que um buscador faz:

```ts
function matches(result: Result, query: Query): boolean {
  const wordsOk = query.words.every(w => result.tags.includes(w))
  const typeOk = query.filter === 'all' || result.type === query.filter
  return wordsOk && typeOk
}
```

**As palavras se somam com E, nunca com OU.** Acrescentar palavra só pode tirar resultado, nunca trazer. Isso não é uma simplificação: é a lição do Nível 2 escrita como regra. Se somar palavra pudesse trazer coisa nova, o percurso `5 → 3 → 1` deixaria de significar alguma coisa e a criança não teria como formar a intuição de que refinar é cortar.

### 3.1 Os slots da barra

| Nível | `slots` | Como a bandeja escreve |
|---|---|---|
| 1 | 1 | tocar numa palavra **substitui** a que estava lá |
| 2 | 2 | o slot 0 é fixo (a palavra larga); a bandeja escreve no slot 1, e tocar de novo na mesma palavra a **desliga** |
| 3 | 0 | não há bandeja; a busca já está pronta e só é exibida |

Uma regra só: *a bandeja escreve sempre no último slot*. Os três níveis saem dela sem nenhum caso especial.

## 4. O mural reage

`applyQuery()` é o coração do jogo. Todo toque em palavra ou filtro chama isto.

```ts
async function applyQuery(query: Query) {
  const gen = ++this.gen
  this.state = 'refreshing'

  const before = this.shown            // ids na parede agora
  const after  = results.filter(r => matches(r, query)).map(r => r.id)

  const leaving  = before.filter(id => !after.includes(id))
  const arriving = after.filter(id => !before.includes(id))

  await this.mural.drop(leaving)       // saem primeiro
  if (gen !== this.gen) return
  await this.mural.arrive(arriving)    // entram depois
  if (gen !== this.gen) return

  this.shown = after
  this.counter.set(after.length)
  this.state = 'searching'
}
```

**A saída vem antes da entrada, e nunca ao mesmo tempo.** Cinco cartões chegando enquanto dois caem é uma bagunça em que nada se lê — e é justamente o instante em que a criança precisa ver *quais* saíram. Cada fase usa `FX.stagger` de 60 ms, então o mural inteiro se resolve em pouco mais de meio segundo.

**O contador só muda quando o último cartão parou.** Mudar no começo entregaria o resultado antes de a criança ver a causa.

### 4.1 O que o navegador diz

Uma frase por situação, no mesmo registro do leitor do Formato Certo: **relata, não julga**.

| Situação | Frase |
|---|---|
| Saíram cartões | *"{n} resultados saíram."* |
| Ninguém saiu | *"Ninguém saiu. Essa palavra é muito larga."* |
| Sobrou zero | *"Nenhum resultado. Essa palavra é específica demais."* |
| Filtro aplicado | *"Só {tipo} agora."* |
| Cartão fora do assunto | o `verdict` do próprio resultado |

Nenhuma delas contém "errado", "incorreto" ou "tente de novo".

### 4.2 Mural zerado

Ligar uma palavra específica demais deixa a parede vazia. Isso **não é um erro** — é o conteúdo do Nível 2. A sequência:

1. os cartões caem, a parede fica vazia
2. o desenho `mural-vazio` entra com `popIn` no centro
3. o toast diz *"Nenhum resultado. Essa palavra é específica demais."*
4. depois de 1400 ms a palavra **se desliga sozinha** e o mural volta ao que era

Custa zero pontos. A criança viu a consequência sem pagar por ela.

### 4.3 Quando uma palavra vale ponto

```ts
const melhorou = after.length < before.length && after.includes(caso.answerId)
```

Cortou resultado **e** manteve a resposta dentro. Só isso, calculado na hora. Mesma conta para o filtro. Vale **+10**, uma vez por palavra — repetir o toque não farma ponto.

## 5. A lupa

Tocar num cartão abre. Abrir é grátis e pode ser feito quantas vezes a criança quiser.

```
toque no cartão
  └─ se locked, refreshing ou já há um cartão aberto → ignora
  └─ lupa voa em arco da posição de repouso até o cartão      (FX.arcTo, 420 ms)
  └─ o cartão cresce e vai para o centro                       (FX.to, 280 ms)
  └─ o resto da tela escurece                                  (véu A.dim)
  └─ o trecho sai palavra a palavra, com as da busca já acesas
  └─ o botão É ESSA! entra                                     (popIn)
```

Fechar: tocar em qualquer lugar fora do cartão. O cartão volta para o lugar dele no mural e guarda uma **marca de canto** de "já li" — no Nível 3, com duas pistas para comparar, é o que diz à criança onde ela parou.

### 5.1 Por que a resposta é um botão e não o toque no cartão

Se tocar no cartão já respondesse, ler teria preço. A criança que abre para entender pagaria o mesmo que a que chuta, e o jogo ensinaria a não olhar. Com o botão dentro do cartão aberto, **explorar é grátis e responder é deliberado** — que é o comportamento que a habilidade pede.

### 5.2 O porquê fica dentro do trecho

Uma coisa só mostra por que o resultado apareceu: as palavras da busca **acesas dentro do trecho**, marcadas com asteriscos no `snippet` de `casos.ts`.

Existiu aqui uma segunda linha — *"Apareceu por: ⟨pinguim⟩"* — que repetia a mesma informação em forma de fichas. Saiu: eram dois textos dizendo a mesma coisa embaixo um do outro, num cartão que já tem título, fonte e trecho, e o cartão é o único momento do jogo em que a criança precisa parar e ler. Menos linha, mais leitura.

A troca tem um custo honesto: quando o resultado aparece por uma tag que não está escrita na frase visível, nada acende. É o preço de manter o cartão limpo, e `casos.ts` compensa escrevendo os trechos de modo que a palavra procurada quase sempre apareça neles.

**A coluna de texto é uma só.** Título, fonte e trecho começam todos em `OPEN.textX`. O trecho já começou à esquerda disso e passava por cima do selo do tipo — além de feio, escondia justamente o desenho que diz se aquilo é site, imagem ou vídeo.

## 6. Escolher a pista

```ts
function answer(id: string) {
  if (id === caso.answerId) {
    // +20, marca-serve, sparks, stars, o verdict, avança em 2200 ms
  } else {
    // −5, marca-fora, shake, o verdict, o cartão volta ao mural
  }
}
```

Errar não trava nem repete o caso: o cartão volta para a parede, a lupa fecha e a criança continua de onde estava. O `verdict` do resultado errado é sempre uma frase que **explica a diferença**, nunca uma reprovação — *"Esse tem pinguim, mas fala de desenho. A pergunta é sobre o animal."*

## 7. Geração — o guarda dos callbacks

Mesma solução do Chef, do Formato Certo e da Central, e não é opcional.

```ts
private gen = 0

private async applyQuery(query: Query) {
  const gen = ++this.gen
  await this.mural.drop(leaving)
  if (gen !== this.gen) return    // a busca mudou; nada a fazer
  ...
}
```

Incrementa em: nova busca, novo caso, fim de nível e `shutdown`.

Aqui ele importa mais do que nos outros jogos, porque a criança **pode** tocar numa palavra enquanto a anterior ainda anima — é o gesto natural de quem está experimentando. O `refreshing` bloqueia o toque, mas o `gen` é a rede que segura o que escapar por uma borda do fluxo.

## 8. Pontos

| Evento | Pontos |
|---|---|
| Palavra que melhora a busca | **+10** (uma vez por palavra) |
| Filtro que melhora a busca | **+10** |
| Pista certa | **+20** |
| Pista errada | −5 |
| Palavra que zera o mural | 0 |

Sem cronômetro e sem game over. O placar exibido é `Math.max(0, pontos)`.

## 9. Tutorial

`createTutorial` compartilhado, com `balloonY` **fixo em toda etapa** e `safeTop = HUD.y + HUD.h + 12`. A heurística automática mede a altura do texto e escolhe acima/abaixo; com o holofote na bandeja, que é baixa, a conta cai em cima do mural.

| Nível | Etapas |
|---|---|
| 1 | 1. "Este é o caso" (cartão) · 2. "Toque numa palavra e veja o que volta" (bandeja) · 3. "Toque num cartão para ler com a lupa" (mural) |
| 2 | 1. "Some uma segunda palavra para tirar o que não serve" (bandeja) · 2. "E escolha o tipo de resultado" (filtros) |
| 3 | 1. "Duas pistas, as duas sobre o assunto" (mural) · 2. "Leia as duas e toque em É ESSA! na que serve" (cartão aberto) |

O botão **?** no HUD reexibe o tutorial do nível atual.

## 10. Áudio

Sintetizado com `AudioContext`, sem arquivo, respeitando `EventBus('mute-audio')`. Mesmo padrão dos outros jogos.

| Som | Tom |
|---|---|
| tocar palavra / filtro | 480 Hz, 45 ms, triangle |
| busca rodando | dois bipes 700 / 900 Hz |
| cartão chegando | 560 Hz, 50 ms, triangle — um por cartão, escalonado |
| cartão caindo | 320 Hz, 60 ms, sine |
| lupa abrindo | 620 Hz, 70 ms, sine |
| pista certa | 620 → 820 Hz |
| pista errada | 210 Hz, 180 ms, square |
| fim de nível | 523 · 659 · 784 · 1047 |

O som do cartão chegando é **por cartão e em volume baixo**: cinco cartões viram cinco notinhas em cascata, e é o que faz a busca soar como uma coisa que aconteceu.

## 11. Casos de borda

| Situação | Comportamento |
|---|---|
| Toca em duas palavras seguidas, rápido | o segundo toque cai em `refreshing` e é ignorado |
| Toca numa palavra com a lupa aberta | ignorado; a lupa é modal |
| Toca no cartão que já está aberto | ignorado (o botão É ESSA! é o alvo) |
| Toca na mesma palavra que já está ligada (N2) | desliga; os cartões voltam |
| Filtro zera o mural | mesma sequência do §4.2, e o filtro volta para `Tudo` |
| Escolhe a pista errada duas vezes | −5 de cada vez, sem trava e sem repetir o caso |
| Pista certa escolhida com a busca ainda larga | vale; a criança achou pelo caminho longo, e isso não é erro |
| `scene.restart` no meio de uma animação | `gen` incrementa no `shutdown`; nenhum callback sobrevive |
| Textura faltando | `textures.exists()` cai no painter em `Graphics` |
| Caso sem `filters` | a faixa não existe e o mural sobe 40 px (VISUAL §3) |

## 12. Ordem de implementação sugerida

1. `theme.ts` e `layout.ts` — nenhum número mágico depois disso
2. `types.ts` e `casos.ts` com **um** caso do Nível 1, para ter o que rodar
3. `effects.ts`: `paintCorkBoard`, `paintResultCard`, `paintWordChip`, `paintSearchBar`
4. `mural.ts`: `applyQuery`, `drop` e `arrive`
5. `GameScene`: `briefing → searching → solved`, sem lupa
6. A lupa e o cartão aberto, com o botão É ESSA!
7. A bandeja e a troca de palavra — **o Nível 1 fecha aqui**
8. Segundo slot e a faixa de filtros (Nível 2)
9. Duas pistas grandes e a etiqueta de critério (Nível 3)
10. Tutorial, HUD, `showLevelComplete`, eventos de plataforma
11. Os nove casos completos em `casos.ts`

Os passos 1–7 já dão um jogo jogável de um nível. Cada passo seguinte acrescenta uma coisa e nenhum pede reescrever o anterior.
