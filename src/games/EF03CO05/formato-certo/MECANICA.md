# Formato Certo — Documento mecânico

Documentos irmãos: [PLANEJAMENTO.md](./PLANEJAMENTO.md) · [VISUAL.md](./VISUAL.md)

---

## 1. Máquina de estados

Uma missão passa por estes estados, sempre nesta ordem:

```
        ┌──────────────────────────────────────────┐
        ▼                                          │
    briefing ──▶ choosing ──▶ filling ──▶ reading ─┤
    (fala do    (só N1)      (arrastar)  (LER)     │
     pedido)                                       │
        ▲            │            ▲                │
        │            └── errou ───┘                │
        │                                          │
        └──────── timeout ◀────────────────────────┘
                                                   │
                                              solved ──▶ próxima missão
```

| Estado | Interação liberada | Cronômetro |
|---|---|---|
| `briefing` | nenhuma; o pedido é escrito na tela | parado |
| `choosing` | tocar numa das 3 caixas (só N1) | **rodando** |
| `filling` | arrastar peças; botão LER ativo quando tudo cheio | **rodando** |
| `reading` | nenhuma; o leitor está varrendo | parado |
| `solved` | nenhuma; celebração e avanço | parado |
| `timeout` | nenhuma; peças voltam, volta para `filling` | reinicia |

**`choosing` só existe no Nível 1.** Nos níveis 2 e 3 a caixa já vem escolhida e a missão entra direto em `filling`.

## 2. Modelo de dados

```ts
export type FormatId = 'date' | 'pixels' | 'text'
export type FieldKind = 'slot' | 'pixel'
export type PieceKind = 'numero' | 'mes' | 'cor' | 'palavra' | 'intrusa'

/** Uma peça arrastável. `format` é null nas intrusas — elas não pertencem a nada. */
export interface Piece {
  id: string
  kind: PieceKind
  /** O que aparece na peça. */
  label: string
  /** O que o leitor escreve quando lê esta peça. Quase sempre igual a `label`. */
  reads: string
  /** Cor do ponto, só em kind 'cor'. */
  tone?: number
  format: FormatId | null
}

/** Um campo dentro de uma caixa. */
export interface Field {
  id: string
  /** Rótulo acima do poço: 'Dia', 'Mês', 'Ano', '1º', 'Ponto 1'. */
  label: string
  kind: FieldKind
  /** Qual peça este campo espera. A ordem dos campos é a ordem da leitura. */
  accepts: string
}

export interface FormatBoxSpec {
  id: string
  format: FormatId
  title: string        // 'Data'
  subtitle: string     // 'dia, mês e ano'
  fields: Field[]
  /** N3: estado inicial defeituoso. fieldId → pieceId */
  preset?: Record<string, string>
}

export interface Mission {
  id: string
  /** O pedido, em português normal. */
  request: string
  requestIcon: FormatId
  /** N1: as três caixas oferecidas. A correta é a que tem `fields`. */
  offer?: FormatId[]
  /** As caixas a preencher. Uma no N1 e N3, duas no N2. */
  boxes: FormatBoxSpec[]
  pieces: Piece[]
  /** Segundos. Herda do nível se ausente. */
  time?: number
  /** N3: que defeito a missão apresenta. Só documenta; a lógica lê o preset. */
  defect?: 'ordem' | 'campo' | 'intrusa'
  successLine: string
  hint: string
}

export interface Level {
  level: 1 | 2 | 3
  title: string
  objective: string
  tip: string
  time: number
  missions: Mission[]
}
```

**`reads` separado de `label` é o que faz o leitor funcionar.** A peça mostra `junho` e lê `junho`; a peça `06` mostra `06` e lê `06`. Mas a peça de cor mostra uma gota e lê `vermelho`. Sem esse campo, o leitor teria que adivinhar como escrever cada tipo — e é exatamente esse acoplamento que deixou a versão atual com `drawPieceSymbol` de 35 linhas cheia de `if`.

**A ordem de `fields` é a ordem de leitura.** Não existe índice separado. Trocar duas peças de campo muda o que o leitor escreve, e é assim que o Nível 3 funciona sem nenhuma regra extra.

## 3. Arrastar e soltar

Herdado do Chef, incluindo as três correções que custaram caro lá.

```
pointerdown na peça
  └─ se locked, ou já há um arraste, ou a peça não está mais na bandeja → ignora
  └─ drag = { pieceId, node }; node.setDepth(140); scale 1.14, angle -3

pointermove
  └─ node segue o ponteiro
  └─ findField(x, y) → repinta 'hover' se canDrop

pointerup
  └─ sem campo válido sob o ponteiro → returnHome (Ease.settle)
  └─ com campo válido → place()
```

### `place(pieceId, field)`

```
1. reserva:  placed.set(pieceId, field.id)
             flying.add(pieceId)          ← já ocupa a vaga, mas ainda não é ficha
2. se o campo já tinha peça → aquela volta para a bandeja
3. await flyToPlate(...)                  ← arco, 320 ms
4. flying.delete(pieceId)
5. se a geração mudou no meio do voo → destrói e sai
6. monta a ficha no campo, repinta, syncReadButton()
```

**Por que o `flying`.** Sem ele, a criança larga a segunda peça enquanto a primeira ainda voa: a checagem de capacidade não vê a primeira, aceita a segunda no mesmo campo, e as duas aterrissam empilhadas. Com ele, a vaga é reservada na hora e a ficha só nasce quando o voo acaba.

**Por que um arraste por vez.** Dois `pointerdown` no mesmo frame (tablet, dois dedos) criavam dois arrastes do mesmo id e a peça se duplicava no encaixe.

### `canDrop`

O campo aceita **qualquer** peça cujo `format` bata com o da caixa. Não checa se é a peça *certa* — isso é trabalho do leitor.

| Situação | Resultado |
|---|---|
| peça de data → campo de data | aceita, mesmo no campo errado |
| peça de cor → campo de data | recusa, volta para casa |
| peça intrusa (`format: null`) | recusa em toda caixa |
| campo já ocupado | aceita; a peça anterior volta para a bandeja |

Essa é a decisão de design mais importante da mecânica. **A caixa aceita o dado errado no campo certo.** Se o encaixe recusasse `2026` no campo Dia, o jogo daria a resposta de graça e o Nível 3 inteiro deixaria de existir. O erro precisa entrar para o leitor poder mostrá-lo.

O que a caixa recusa é o dado de *outro tipo* — cor não entra em campo de data. Isso não é a resposta, é a definição do formato, e é o que a criança precisa aprender no Nível 1.

### Tirar uma peça

Toque na ficha já colocada devolve ela para a bandeja. Guardas: ignora se está voando, se a cena está travada ou se o estado não é `filling`.

## 4. Validação

Só roda quando a criança aperta **LER**. Nunca automaticamente.

```ts
function readBox(box, placed, pieces) {
  const cells = box.fields.map(f => {
    const pieceId = placed[f.id]
    return {
      field: f,
      piece: pieceId ? pieces[pieceId] : null,
      ok: pieceId === f.accepts,
    }
  })
  return { cells, ok: cells.every(c => c.ok) }
}
```

A missão só é resolvida quando **todas** as caixas leem `ok`. No Nível 2, com duas caixas, o LER só habilita quando as duas estão cheias — mas ele lê e falha nas duas se precisar, mostrando as duas leituras.

### Botão LER — fonte única

```ts
private syncReadButton() {
  const cheias = this.boxes.every(b => b.isFull())
  const pronto = cheias && this.flying.size === 0 && this.state === 'filling'
  this.readButton.setEnabled(pronto && !this.locked)
}
```

Chamado de todo ponto que muda o preenchimento. **Nenhum outro lugar decide o estado do botão.** No Chef, cada ponto de mutação decidia sozinho e bastava um ficar para trás numa borda do fluxo para o botão nunca acender — a criança ficava com a caixa cheia e nada para apertar.

## 5. O leitor

O componente central. `scenes/reader.ts`.

```ts
export interface Reader {
  /** Varre e mostra o resultado. Resolve quando o texto terminou de sair. */
  read(results: BoxReading[]): Promise<void>
  /** Volta ao estado apagado. */
  reset(): void
  /** Falha sem leitura: tempo esgotado, caixa errada. */
  refuse(reason: string): Promise<void>
  destroy(): void
}
```

### 5.1 Sequência

1. `scanning` — linha varrendo o visor, 2 passadas, ~600 ms
2. resultado por caixa, uma de cada vez (150 ms entre elas)
3. se alguma falhou: chuvisco → leitura literal → a frase honesta
4. se todas passaram: visor clareia → informação recuperada → faíscas

Total: **~1,2 s no sucesso, ~1,4 s na falha.** Curto de propósito. Animação longa faz a criança apertar LER e olhar para o lado, e aí o feedback que é o coração do jogo passa despercebido.

### 5.2 Como cada formato se lê

```ts
// date
cells → 'dia 18 · mês junho · ano 2026'  →  '18 de junho de 2026'
// falha: 'dia 2026 · mês junho · ano 18'  →  'não existe dia 2026'

// text
cells → concatena os `reads` na ordem dos campos  →  'A-12'
// falha: '1A-2'  (do mesmo tamanho, para comparar de bater o olho)

// pixels
cells → desenha os pontos na ordem dos campos
// falha: campo vazio ou com peça não-cor vira xadrez cinza
```

### 5.3 As frases

Uma frase-modelo por tipo de falha, mudando só o dado. Repetição é a favor de quem está aprendendo a ler.

| Falha | Frase |
|---|---|
| Caixa errada (N1) | *"Esta caixa guarda **{o que a caixa guarda}**. Você me deu **{o que veio}**."* |
| Ordem trocada | *"Li: **{leitura literal}**. O pedido era **{esperado}**."* |
| Campo errado (data) | *"Dia **{valor}**? Não existe dia **{valor}**."* |
| Campo vazio | *"Faltou o **{rótulo do campo}**."* |
| Peça intrusa (pixels) | *"O ponto **{n}** não é uma cor. Ficou buraco."* |
| Tempo esgotado | *"Acabou o tempo. Vamos de novo."* |

**O leitor nunca escreve "errado", "incorreto" ou "tente de novo".** Ele relata. A criança compara o que saiu com o pedido no alto da tela e decide sozinha o que mexer — que é a diferença entre corrigir e entender.

## 6. Cronômetro

Por missão. Termina em ponto, não em derrota.

```ts
private startTimer() {
  const gen = this.gen
  this.timerTween?.stop()
  this.timerState.progress = 1
  this.timerRunning = true

  this.timerTween = this.tweens.add({
    targets: this.timerState,
    progress: 0,
    duration: this.missionTime * 1000,
    ease: 'Linear',
    onUpdate: () => this.timerBar?.set(this.timerState.progress),
    onComplete: () => {
      if (!this.timerRunning || gen !== this.gen) return
      this.timerRunning = false
      void this.onTimeout()
    },
  })
}
```

Pausa (`timerTween.pause()`) durante tutorial, modais e a leitura; retoma depois. Mede o tempo em que a criança de fato pode agir.

**A barra pulsa só na faixa vermelha, e o pulso é instalado uma vez.** Reinstalar o tween a cada `onUpdate` criava dezenas de tweens no mesmo alvo — o bug que travou a barra do Tribunal antes da correção.

### `onTimeout()`

1. leitor faz `refuse('Acabou o tempo. Vamos de novo.')`
2. `−10` pontos, emite `WRONG_ANSWER`
3. peças voltam para a bandeja em cascata (`FX.stagger`, 60 ms)
4. no Nível 3, o preset defeituoso é **restaurado** — a missão volta ao ponto de partida, não a uma caixa vazia
5. estado volta para `filling`, cronômetro reinicia

## 7. Geração — o guarda dos callbacks

Mesma solução do Chef e do Tribunal, e não é opcional.

```ts
private gen = 0

private async playMission() {
  const gen = ++this.gen
  ...
  await FX.wait(this, 900)
  if (gen !== this.gen) return   // a tela trocou; nada a fazer
  ...
}
```

Incrementa em: nova missão, timeout, fim de nível, `shutdown`.

Sem isso, um `await` pendente da missão anterior volta a mexer em caixa, peça e leitor que a troca de tela já destruiu. É a classe de bug mais cara de reproduzir porque só aparece quando a criança age perto do limite do tempo — exatamente o caso que a barra nova torna comum.

## 8. Tutorial

`createTutorial` compartilhado, com `balloonY` **fixo em toda etapa**. A heurística automática mede a altura do texto e escolhe acima/abaixo; com o holofote na bandeja, que é baixa, a conta cai em cima da caixa e o botão "Próximo" pousa sobre o campo que a etapa anterior mandou olhar.

| Nível | Etapas |
|---|---|
| 1 | 1. "Aqui está o que você precisa guardar" (pedido) · 2. "Escolha a caixa certa" (3 caixas) · 3. "Arraste os dados para os campos" (bandeja) · 4. "E aperte LER para ver se funcionou" (botão) |
| 2 | 1. "Agora são duas caixas, e a informação é a mesma" (caixas) · 2. "A segunda abre quando a primeira estiver cheia" |
| 3 | 1. "Esta caixa chegou com defeito" (caixa `broken`) · 2. "Leia primeiro para ver o que saiu errado" (botão LER) |

Botão **?** no HUD reexibe o tutorial do nível atual, pausando o cronômetro.

## 9. Áudio

Sintetizado com `AudioContext`, sem arquivo, no mesmo padrão dos outros jogos. Respeita `EventBus('mute-audio')`.

| Som | Tom |
|---|---|
| pegar peça | 420 Hz, 45 ms, sine |
| encaixar | 560 Hz, 60 ms, triangle |
| tirar do campo | 380 Hz, 50 ms, sine |
| scanning | dois bipes 700/900 Hz durante a varredura |
| leitura ok | 620 → 820 Hz |
| leitura falha | 210 Hz, 180 ms, square |
| fim de nível | 523 · 659 · 784 · 1047 |

## 10. Casos de borda

| Situação | Comportamento |
|---|---|
| Criança aperta LER com campo vazio | botão está desabilitado; não acontece nada |
| Duas peças no mesmo campo (dois dedos) | impedido pelo `flying` + um arraste por vez |
| Peça arrastada para fora da tela | volta para casa; `pointerup` global cobre |
| Tempo acaba durante o voo de uma peça | `gen` muda; a peça se destrói ao aterrissar |
| Tempo acaba durante a leitura | impossível: o cronômetro pausa em `reading` |
| N1, escolhe a caixa errada e preenche | a caixa aceita só o que for do tipo dela; se ficar cheia, LER falha explicando a incompatibilidade e a caixa volta a fechar |
| N2, primeira caixa completa e depois esvaziada | a segunda caixa tranca de novo e as peças dela voltam |
| N3, criança tira todas as peças | permitido; a missão vira um preenchimento normal |
| `scene.restart` no meio de qualquer animação | `gen` incrementa no `shutdown`; nenhum callback sobrevive |
| Peça sem textura / rótulo faltando | painters são vetoriais, não há textura para faltar |

## 11. Ordem de implementação sugerida

1. `theme.ts` e `layout.ts` — nenhum número mágico depois disso
2. `types.ts` e `missions.ts` com **uma** missão do Nível 1, para ter o que rodar
3. `effects.ts`: `paintWorkbench`, `paintFormatBox`, `paintField`, `paintPiece`
4. `reader.ts` com os três renderizadores de leitura
5. `GameScene`: estados `briefing → filling → reading → solved`, sem tempo e sem escolha
6. Arrastar e soltar com `flying` e `gen`
7. Cronômetro e `onTimeout`
8. `choosing` (Nível 1)
9. Duas caixas (Nível 2)
10. Presets defeituosos (Nível 3)
11. Tutorial, HUD, `showLevelComplete`, eventos de plataforma
12. As nove missões completas em `missions.ts`

Os passos 1–7 já dão um jogo jogável de um nível. Cada passo seguinte acrescenta uma coisa e nenhum pede reescrever o anterior.
