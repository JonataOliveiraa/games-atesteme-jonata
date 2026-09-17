# Metrô Mirim — planejamento

> **Duas frases antes de tudo.** O briefing, do jeito que está escrito, é o
> **Mapas em Rede** com skin de trem: lá o nível 1 já é "arraste de uma estação
> à outra para criar a ligação" e o nível 2 já é "trace a rota". E o próprio
> briefing mata o pensamento no nível 1 ao dar "trilhos de sobra" — com peça
> sobrando, ligar tudo em fila resolve qualquer mapa e a criança nunca olha
> para a forma da rede.
>
> A troca está feita e o plano abaixo já é o corrigido: **a criança não copia
> uma lista de ligações, ela projeta a rede**. Recebe um punhado contado de
> trilhos e uma lista de quem quer ir aonde, decide QUAIS ligações valem, e
> aperta PARTIR — os trens são a prova. O que muda em relação ao briefing está
> listado em §2.3, para discordar com o documento na mão.

---

## 1. O jogo em três atos

Cada fase é uma pequena história em três tempos, e cada tempo tem uma cara
diferente na tela:

| Ato | O que a criança vê | O que ela faz |
|---|---|---|
| **1 · Conversa** | os passageiros entram andando, um por vez, em tamanho de cena, e dizem para onde precisam ir | ouve, e toca para continuar |
| **2 · Construção** | o mapa da cidade, **maior que a tela** | arrasta o mapa para andar; arrasta peças de trilho da bandeja até as ligações tracejadas |
| **3 · Partida** | **a interface some**; a câmera vai atrás do trem | assiste: cada passageiro entra no trem, viaja e desce no destino |

E as três regras que valem no ato 2:

1. **Arraste uma peça da bandeja até o tracejado: nasce um trilho.** (Tocar numa
   estação e depois na outra faz o mesmo; tocar no dormente devolve a peça.)
2. **Só dá para ligar o que a cidade permite.** As ligações possíveis aparecem
   tracejadas; o resto tem rio, morro ou quarteirão no meio.
3. **PARTIR acende quando a bandeja esvazia** — e apertar PARTIR é a resposta.

```
ATO 2 — a construção
┌────────────────────────────────────────────────────────────────────┐
│ (NÍVEL 1) ● ● ○     Ligue até todo mundo chegar      ♥ ♥ ♥    ( ? ) │  82
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│      ╭───────╮ - - - - - - - - - - -╭────────╮                     │
│   🧒 │ESCOLA │                      │MERCADO │                     │ 514
│      ╰───┬───╯                      ╰────┬───╯                     │
│          ╰═════════╮        ╭════════════╯     o mapa passa da     │
│                  ╭─┴────────┴─╮                borda  ──────>      │
│                  │   PRAÇA    │                                    │
│                  ╰────────────╯                                    │
├────────────────────────────────────────────────────────────────────┤
│  ▭▭ ▭▭ ▭▭  (arraste daqui)                  ┃  P A R T I R  ┃      │ 124
└────────────────────────────────────────────────────────────────────┘
       bandeja de trilhos                          o apito
```

`- - -` é ligação possível ainda sem trilho · `═══` é trilho posto.

**Ninguém digita e ninguém corre contra o relógio.** O jogo inteiro é: ouvir
quem precisa ir aonde, escolher onde gastar as peças, e ver o trem provar.

---

## 2. A habilidade, e o teste que ela precisa passar

### 2.1 O texto oficial

> **(EF05CO02)** Reconhecer objetos do mundo real e digital que podem ser
> representados através de grafos que estabelecem uma organização com uma
> quantidade variável de vértices conectados por arestas, fazendo
> **manipulações simples sobre estas representações**.
>
> **Objeto:** Listas e grafos.

Do exemplo oficial vêm três coisas que este jogo usa inteiras:

| No exemplo da BNCC | No Metrô Mirim |
|---|---|
| mapa do bairro com prédios marcados | o mapa da cidade com as estações |
| "trace linhas ligando esses prédios **sempre que houver caminho**" | as ligações possíveis, tracejadas: nem todo par pode ser ligado |
| "trace rotas passando por determinados prédios, contando quadras" | o passageiro com pressa, que só aguenta um caminho curto |
| "volte ao mapa e trace as rotas nas ruas do bairro" | no fim do nível a cidade some e sobra o diagrama de bolinhas e linhas |

### 2.2 O teste da bolinha

> Troque o conteúdo por bolinhas coloridas sem significado. O jogo muda?

Aqui a resposta certa é **não muda — e é por isso que passa**. Este é o caso
raro em que a habilidade *é* a estrutura: escola, mercado e praça são vértices
com fantasia, e a fantasia pode cair sem tirar nada do que a criança pensa. O
jogo faz esse teste na cara dela no fim de cada nível, quando a cidade
desaparece e sobram bolinhas e linhas.

O risco real está no outro lado, e o briefing caía nele:

| Se… | …a criança resolve sem pensar na rede |
|---|---|
| a bandeja tem peça sobrando | liga tudo com tudo e acerta |
| todo par pode ser ligado | liga em fila, sem olhar o mapa |
| todo passageiro quer o vizinho | nunca precisa de caminho com duas pernas |

As três correções são a mecânica, não a dificuldade:

- **a bandeja tem exatamente as peças de uma rede que liga tudo** (`n − 1`).
  Peça gasta à toa é estação que fica de fora, e passageiro parado;
- **as ligações possíveis são um subconjunto** desenhado no mapa;
- **todo mapa tem pelo menos um passageiro que precisa passar por outra
  estação** para chegar.

### 2.3 O que mudou em relação ao briefing

| Briefing | Aqui | Por quê |
|---|---|---|
| deslizar de estação a estação | **arrastar a PEÇA da bandeja até a ligação** (e o toque-toque continua valendo) | arrastar entre dois alvos pequenos erra no meio do caminho; arrastar um objeto grande até uma linha inteira, não |
| tocar 2× no trilho apaga | **tocar no dormente, ou nas mesmas duas estações, devolve a peça** | toque duplo em celular briga com o zoom do navegador |
| rodada de 2 min, trens andando sozinhos | **monta e aperta PARTIR**; os trens andam então | é jogo de pensar: pressa só atrapalha. O mesmo caminho do Pulo Programado — a lista inteira antes de rodar |
| +10 por entrega, +20 no VIP na tela | **nada de número na tela** | regra de pontuação do projeto. A pressa do passageiro vira **pontinhos** no balão |
| "contador de trilhos disponíveis" | **bandeja com as peças** | peça é objeto: dá para ver quanto falta sem ler número |
| nível 1 com 8 trilhos para 4 estações | **peças contadas desde a primeira fase** | ver §2.2 |
| passageiro espera, pisca depois de 10 s | **a TRAVA do catálogo**, no PARTIR | o jogo não tem tempo real; quem cobra é o veredito da partida |
| estrelas próprias por economia | **`showLevelComplete`** | painel de fim de nível é compartilhado |

E uma coisa do briefing que **fica inteira, porque é a melhor ideia dele**: o
diagrama final. "Olha a sua REDE!" é o momento mais alinhado à habilidade no
documento todo, e custa zero — a tela já é o grafo, a animação só tira a
fantasia.

---

## 3. Como isso não vira o jogo irmão

`EF05CO02` já tem **Mapas em Rede** publicado (id 032, order 320): três níveis
de `representar` (arrastar as arestas que a lista mandou), `rota` (tocar os nós
na ordem), `consulta` (pergunta de múltipla escolha sobre o grafo) e
`isomorfismo` (dois desenhos, é o mesmo grafo?).

| | Mapas em Rede | Metrô Mirim |
|---|---|---|
| **A pergunta** | "quais ligações a lista mandou?" | "que rede atende esses pedidos com este punhado de peças?" |
| **A resposta** | uma só, copiada de uma lista | **várias**: qualquer rede que sirva vence |
| **O gabarito** | `edges` guardado na fase | **não existe**: o veredito é uma busca no grafo que a criança montou |
| **A prova** | o jogo confere as arestas | **o trem anda e chega** — ou para no meio |
| **A manipulação** | desenhar | desenhar, **desfazer** e **reconectar** quando a obra corta |
| **O caminho** | vira pergunta ("quantos passos?") | vira consequência (o passageiro com pressa perde a viagem) |
| **A abstração** | está pronta na tela desde o começo | **acontece no fim**: a cidade vira bolinhas e linhas |

Se um dia alguém não conseguir preencher essa tabela de novo, são o mesmo jogo.
A linha que mais segura a diferença é a terceira: **em Mapas em Rede existe uma
resposta certa guardada; aqui existe um critério.**

---

## 4. O laço

```
        ┌──────────────────────────────────────────────┐
        │  a fase abre: estações, ligações possíveis,  │
        │  a bandeja cheia e quem quer ir aonde        │
        └───────────────────┬──────────────────────────┘
                            v
        ┌──────────────────────────────────────────────┐
        │  toque numa estação  →  ela acende e as      │
        │  ligações possíveis dela piscam tracejadas   │
        └───────────────────┬──────────────────────────┘
                            v
        ┌──────────────────────────────────────────────┐
        │  toque na outra  →  a peça voa da bandeja    │
        │  e o trilho assenta            ("tec")       │
        │  (se já havia trilho, ela volta para lá)     │
        └───────────────────┬──────────────────────────┘
                            v
                   bandeja vazia?  ── não ──> volta a montar
                            │ sim
                            v
        ┌──────────────────────────────────────────────┐
        │  PARTIR acende  →  apito, os trens saem      │
        │  juntos e acendem os trilhos por onde passam │
        └───────────────────┬──────────────────────────┘
                            v
              todo mundo chegou?
              │                       │
             sim                     não
              v                       v
    ┌───────────────────┐   ┌──────────────────────────┐
    │ bolinha da fase   │   │ TRAVA: o mundo para, o   │
    │ acende; próxima   │   │ passageiro parado brilha │
    │ fase (ou a obra,  │   │ e as duas estações dele  │
    │ no nível 3)       │   │ piscam. Mexer na rede    │
    └─────────┬─────────┘   │ destrava.                │
              │             └─────────────┬────────────┘
              │                           │
              │             <─────────────┘
              v
    fim do nível: a cidade some, sobra o diagrama, `showLevelComplete`
```

---

## 5. Controle — arrastar a peça, arrastar o mapa

| Gesto | O que acontece | Custa vida? |
|---|---|---|
| **arrastar uma peça** da bandeja até uma ligação tracejada | a ligação mais perto do dedo acende em azul; soltando, o trilho nasce | não |
| soltar a peça longe de qualquer ligação | nada, com um som fininho | não |
| **arrastar o mapa** (pelo fundo) | a cidade anda por baixo da interface | não |
| toque numa estação | seleciona (sobe 8 px, halo azul); as vizinhas possíveis pulsam | não |
| toque numa vizinha possível **sem** trilho | nasce o trilho | não |
| toque numa vizinha possível **com** trilho | o trilho some, a peça volta | não |
| toque numa estação **sem** ligação possível com a selecionada | fumacinha cinza; a seleção passa para ela | **não** |
| toque no dormente (a alça redonda no meio do trilho) | o trilho some, a peça volta | não |
| toque no vazio | larga a seleção | não |
| toque em PARTIR com peça na bandeja | o botão não afunda, a bandeja pulsa | **não** |
| toque em PARTIR com a bandeja vazia | a partida acontece — **é a resposta** | só se alguém não chegar |

**O arraste é o gesto principal, e ele foi pedido de propósito** (o padrão do
projeto prefere toque). Ele funciona aqui por três motivos: a peça é um objeto
grande e visível, o alvo não é um ponto mas uma LINHA inteira com 240 px de
tolerância, e **o toque continua fazendo tudo** — quem não conseguir arrastar
joga o jogo inteiro tocando.

**Erro de dedo nunca conta.** Só uma coisa neste jogo custa vida: apertar
PARTIR com uma rede que não serve. Isso é decisão, não pontaria.

---

## 6. A grade: 1280 × 720 — e um mundo maior que ela

A tela continua sendo 1280 × 720 com `Scale.FIT`. O que mudou é que a faixa do
mapa virou uma **janela**: cada fase tem um mundo próprio, e a câmera mostra um
pedaço dele.

| Faixa | y | Conteúdo | Tamanho na grade | No celular (×0,30) |
|---|---|---|---|---|
| HUD | 0–82 | pílula do nível, bolinhas de fase, objetivo, vidas, `?` | h 82 | 25 px |
| Janela do mapa | 82–596 | cidade, estações, ligações, passageiros | h 514 | 154 px |
| Bancada | 596–720 | bandeja de trilhos e PARTIR, e mais nada | h 124 | 37 px |

| Fase | Mundo | Quanto cabe na janela |
|---|---|---|
| 1.1 | 1700 × 820 | ~75 % da largura |
| 1.2 | 1980 × 940 | ~65 % |
| 1.3 | 2280 × 1040 | ~56 % |

A câmera é presa ao mundo (`setBounds`), então **nunca há borda vazia**; o mapa
tem ainda uma moldura desenhada para a criança ver onde ele acaba. Tudo que é
interface tem `setScrollFactor(0)`: o mapa anda por baixo, a bancada não.

### Os alvos

| Peça | Tamanho na grade | No celular | Serve? |
|---|---|---|---|
| estação (o prédio, e o chão em volta dele) | alvo de **⌀ 220** | **66 px** | ✔ folgado |
| peça de trilho na bandeja | 78 × 41, zona de 660 × 100 | 23 px (zona: a bandeja inteira) | ✔ pega em qualquer ponto |
| alvo do arraste | a LIGAÇÃO inteira, com 240 px de tolerância | ~72 px de folga | ✔ |
| PARTIR | 312 × 104 | 94 × 31 px | ✔ |
| dormente do trilho (⌀ 88, zona 150) | zona 150 | 45 px | ✔ |
| `?` (desenho ⌀ 56, zona 128) | zona 128 | 38 px | ✔ (padrão do catálogo) |

### As estações, no mundo

Sem tabela de lotes: com mundo próprio por fase, cada estação tem coordenada
escrita em `data/levels.ts`. O que a validação cobra:

- **380 px** de distância mínima entre duas estações (220 de disco + 160 de ar);
- nenhuma ligação passa a menos de **150 px** do centro de uma terceira estação;
- a estação cabe no mundo com folga para o rótulo embaixo e para o passageiro à
  esquerda (220 px).

O rótulo agora tem 30 px e uma plaquinha atrás: sobre um mapa cheio de telhado,
texto sem fundo some.

---

## 7. Níveis e fases — o nível é a pergunta

Três níveis, três fases cada. A fase é **um mapa com uma bandeja**; ela pode ter
duas **ondas** (a cidade muda no meio e a criança monta de novo).

| Nível | A pergunta | Estações | Bandeja | Novidade |
|---|---|---|---|---|
| **1 — Todo mundo chega** | existe caminho? | 3 → 4 → 5 | 2 → 3 → 4 | passar por outra estação |
| **2 — Quem tem pressa** | o caminho é curto? | 5 → 5 → 6 | 4 → 4+1 → 5 | passageiro com pontinhos; chega estação nova |
| **3 — A rede se conserta** | e se cortar? | 6 → 7 → 7 | 5 → 6 → 6 | obra no trilho mais usado |

O que cresce dentro do nível é **o tamanho da rede**, nunca o número de regras.

### Nível 1, fase por fase (o corte de teste)

| Fase | Mapa | Bandeja | Quem quer ir | A lição |
|---|---|---|---|---|
| **1.1** | Escola, Praça, Mercado. Possíveis: Escola–Praça e Praça–Mercado (entre Escola e Mercado passa o rio) | 2 | Téo: Escola → Mercado | dá para chegar **passando por outra** estação |
| **1.2** | Casa, Escola, Mercado e a Praça no meio. Possíveis: as três com a Praça, **e** Casa–Mercado | 3 | Bia: Casa → Escola · Téo: Mercado → Escola | **qual** ligação vale: gastar peça em Casa–Mercado deixa alguém de fora |
| **1.3** | 5 estações, com o Hospital na ponta (uma única ligação possível) | 4 | 3 passageiros, um deles indo ao Hospital | estação esquecida = passageiro parado |

A 1.1 é introdução pura: dois toques, dois toques, PARTIR. Se a criança ligar as
duas únicas ligações possíveis ela vence — e é para vencer mesmo; o que a fase
ensina é o **gesto** e a ideia de caminho com duas pernas.

A 1.2 é a primeira decisão de verdade: quatro ligações possíveis, três peças.
A estrela (tudo na Praça) serve; a corrente Casa–Mercado–Praça–Escola **também**
serve. Duas respostas certas, e nenhuma delas está guardada em lugar nenhum.

### Nível 2 — a pressa

O passageiro com pressa traz **pontinhos** no balão (dois, no nível 2): é o
número de trilhos que ele aguenta. Quando o trem anda, os pontinhos apagam um a
um. Se acabar antes de chegar, ele desce na estação errada e a fase trava.

É aqui que a **forma** da rede começa a importar: com as mesmas 4 peças, a
corrente liga tudo mas o caminho fica com três pernas; a estrela liga tudo com
duas. É o "menor caminho" do exemplo oficial, sem nenhuma conta escrita.

Na fase 2.2 acontece a **segunda onda**: depois da primeira partida bem
sucedida chega um caminhão de obras, a **Biblioteca** aparece num lote vazio
com dois passageiros querendo ir até ela, e a bandeja ganha **uma** peça. A
criança monta de novo e aperta PARTIR de novo. (É o evento "aos 60 s surge a
biblioteca" do briefing, preso ao progresso e não ao relógio.)

### Nível 3 — a obra

Depois da partida bem sucedida, a obra fecha **o trilho por onde passaram mais
trens** — escolhido pela partida que acabou de acontecer, não escrito na fase.
O trilho fica listrado, para de funcionar, e aquela ligação some do mapa de
possíveis. A peça volta para a bandeja, e a rede tem que ser refeita com ela em
outro lugar.

É o degrau que fecha a habilidade: **manipular a representação** quando o mundo
muda. E é onde a criança descobre sozinha que existe trilho cuja queda parte a
rede em duas — a aresta de corte, sem o nome.

---

## 8. As regras, em código

Nada de gabarito. Tudo sai de uma busca em largura sobre a rede que existe no
instante da decisão.

```ts
// data/graph.ts — grafo puro, sem Phaser, testável de fora
export const key = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`)

export const neighbours = (edges: Edge[], id: string): string[] => ...

/** menor número de trilhos entre duas estações, ou null se não há caminho */
export const hops = (edges: Edge[], from: string, to: string): number | null => ...

/** o caminho em si, para o trem andar e para a obra contar tráfego */
export const pathOf = (edges: Edge[], from: string, to: string): string[] | null => ...
```

```ts
// data/levels.ts — o veredito, sempre função
export const served = (rider: Rider, edges: Edge[]) => {
    const d = hops(edges, rider.from, rider.to)
    return d !== null && (rider.rush === undefined || d <= rider.rush)
}

export const stuck = (wave: Wave, edges: Edge[]) =>
    wave.riders.filter(r => !served(r, edges))

export const solved = (wave: Wave, edges: Edge[]) => stuck(wave, edges).length === 0

export const canDepart = (tray: number) => tray === 0

/** o trilho mais usado pelos caminhos da partida — a obra do nível 3 */
export const busiest = (wave: Wave, edges: Edge[]) => ...

/** depois de dois erros: a ligação possível que mais reduz `stuck` */
export const hintLink = (phase: PhaseConfig, wave: Wave, edges: Edge[]) => ...

export const pointsFor = (locked: boolean) => (locked ? 5 : 10)
```

Repare que `hintLink` **calcula** a dica. Uma dica guardada na fase mentiria no
minuto em que a criança montasse uma rede parcial diferente da prevista.

### Os tipos

```ts
export interface Station { id: string; label: string; art: number; x: number; y: number }
export interface Link { a: string; b: string }        // ligação POSSÍVEL
export interface Rider { id: string; art: number; from: string; to: string; rush?: number }
export interface Wave { riders: Rider[]; arrives?: { stations?: Station[]; links?: Link[]; tray?: number } }

export interface PhaseConfig {
    id: string
    stations: Station[]
    links: Link[]
    tray: number
    waves: Wave[]
    works?: boolean          // nível 3: a obra acontece no fim da onda
}

export interface LevelConfig { level: 1 | 2 | 3; title: string; goal: string; phases: PhaseConfig[] }
```

### Validação ao carregar

`validateLevels()` roda uma vez e derruba o jogo no dev se algum destes falhar —
é barato (as fases têm no máximo 12 ligações possíveis) e pega o erro de
planilha antes da criança:

1. **existe pelo menos uma rede que vence** usando exatamente `tray` peças;
2. **existe pelo menos uma que não vence** com o mesmo número de peças — senão
   não há decisão e a fase é enfeite;
3. `tray === stations.length − 1` (o orçamento é uma árvore geradora), salvo
   quando a onda declarar outro;
4. toda estação aparece em pelo menos uma ligação possível;
5. todo par de estações usadas está a ≥ 200 px de distância, e nenhuma ligação
   possível passa a menos de 80 px do centro de uma terceira estação;
6. no máximo 4 passageiros e 6 peças por onda (é o que cabe na bancada);
7. `rush`, quando existir, é ≥ `hops` da melhor rede possível — senão o
   passageiro é impossível de atender.

---

## 9. O erro, a TRAVA e as vidas

### O que é erro

**Um só:** apertar PARTIR e alguém não chegar. É decisão declarada — a bandeja
estava vazia, a criança disse "minha rede está pronta".

Não são erro, e não custam vida: tocar em duas estações sem ligação possível,
cancelar a seleção, apagar e refazer trilho, apertar PARTIR com peça na mão.

### A TRAVA, passo a passo

1. os trens param onde deu; o resto do mundo congela;
2. quem não chegou fica **destacado** com contorno âmbar, e as duas estações
   dele piscam no mesmo ritmo (é literalmente o "pisca as duas estações
   desconectadas" do briefing, só que na hora certa);
3. a frase diz **qual** e **por quê**, nunca a resposta:
   - sem caminho: *"O Téo quer chegar ao mercado, e não há trilho que leve
     até lá."*
   - com pressa: *"A Bia tinha pressa: o caminho dela passou por três trilhos,
     e ela só aguenta dois."*
4. o PARTIR ganha cadeado e **só destrava quando a rede mudar** — pôr ou tirar
   qualquer trilho. Apertar de novo sem mexer em nada não repete o erro nem
   custa outra vida;
5. **depois do segundo erro na mesma onda**, a ligação que resolve (`hintLink`)
   pisca tracejada em verde — a opção certa aparece, como manda o catálogo.

`WRONG_ANSWER` sai uma vez por partida falha, seguido de `lives.lose()`. Quem
reprova é `createLives`, no zero; o jogo nunca emite `GAME_OVER`.

### Nenhum estado sem saída

Como a bandeja devolve tudo e nenhuma ligação possível some (fora a obra, que é
compensada com a peça de volta), **qualquer rede errada é desmontável**. Não
existe fase que fique impossível por causa de uma jogada.

---

## 10. Pontuação e tempo

- 10 por onda vencida de primeira, 5 depois da trava (`pointsFor`);
- **nenhum número na tela**: o que a criança vê é a bolinha da fase acendendo, a
  passageiro descendo no destino e as estrelas do `showLevelComplete`;
- **não há relógio de pressão.** O tempo é medido e aparece só no subtítulo do
  painel de fim de nível (`formatTime`), porque este é jogo de pensar e barra
  que esvazia empurraria a criança a ligar tudo às pressas — exatamente o
  comportamento que o jogo quer desencorajar.

---

## 11. Feedback

| Momento | O que acontece |
|---|---|
| toque numa estação | sobe 6 px com `back.out`, halo azul; as ligações possíveis dela piscam tracejadas; "tin" curto |
| trilho nasce | a peça sai da bandeja e voa até o meio do trilho; ele assenta de fora para dentro com "tec" e uma tremidinha de 2 px |
| trilho volta | a peça salta do dormente e cai na bandeja com "poc" |
| par impossível | fumacinha cinza no meio do caminho, sem som duro |
| bandeja esvazia | PARTIR acende, pulsa uma vez e o apito fica disponível |
| PARTIR | apito; os trens saem **juntos**, cada um acendendo o trilho por onde passa; os pontinhos do apressado apagam um a um |
| chegada | jingle da estação, e o passageiro desce NO destino, no quadro de acenar |
| onda vencida | moldura verde nas bordas, a bolinha da fase acende, o trem dá uma volta de vitória |
| falha | tudo congela, âmbar no passageiro parado, moldura vermelha curta, cadeado no PARTIR |
| obra (nível 3) | martelada, o trilho fica listrado, tremida curta, a peça volta para a bandeja |
| fim de nível | **a cidade some**: os prédios desbotam, as estações viram bolinhas e os trilhos viram linhas — o grafo puro, sozinho na tela por 2 s |

A frase-síntese aparece escrita **uma vez**, junto do primeiro diagrama:
*"Estações são pontos, trilhos são ligações — juntos, são uma REDE."* No fim do
nível 3, e só lá, ela ganha a última linha: *"Uma rede assim tem nome: grafo."*

O brilho da vitória usa a **silhueta do trem**, não um círculo genérico.

---

## 12. Tutorial: o guia que ensina fazendo, e o `?` que relembra

São **dois**, e de propósito: um acompanha quem está jogando pela primeira vez,
o outro responde a quem parou para perguntar.

### O guia (`scenes/coach.ts`) — primeira fase, sem bloquear nada

Nada de painel, nada de botão "Próximo", nada de esperar. Uma frase curta numa
plaquinha no alto do mapa, **um dedo que repete o gesto exatamente onde ele
acontece**, e um anel pulsando no alvo. A criança pode jogar a qualquer momento;
a dica troca sozinha quando ela faz, e some de vez quando a fase começa a
andar.

| Dica | Some quando | O dedo mostra |
|---|---|---|
| *Arraste o mapa para ver a cidade* | ela arrasta o mapa — ou sozinha, em 5 s | um arraste no meio do mapa |
| *Arraste um trilho até o tracejado* | o primeiro trilho nasce | o caminho da bandeja até a ligação, com o anel em volta dela |
| *Falta ligar mais uma* | a bandeja esvazia | o mesmo, na ligação que ainda falta |
| *Bandeja vazia? Toque em PARTIR* | ela aperta PARTIR | um toque no botão |

Duas decisões que valem para qualquer jogo:

- **a dica da câmera tem prazo.** A fase 1.1 é resolvível sem andar no mapa, e
  travar a criança até ela arrastar seria transformar um convite em tarefa;
- **o alvo anda com a câmera.** O dedo e o anel vivem em coordenada de tela, e
  a cena recalcula os dois a cada arraste do mapa — senão a dica aponta para
  onde a ligação estava, não para onde ela está.

### O `?` (`createTutorial`) — cinco passos, sob demanda

O painel compartilhado continua, e agora ele é **recapitulação**: o objetivo
primeiro (com o nome de quem está esperando naquela fase), depois os dois jeitos
de pôr trilho, o mapa que anda e o PARTIR. Ele pausa o jogo, e devolve a rede
montada exatamente como estava.

Ele desenha em coordenada de tela e não conhece a câmera, então **enquanto o `?`
está aberto o mapa fica no canto** (`setScroll(0, 0)`); ao fechar, a câmera
volta a centralizar a fase.

---

## 13. Antes da arte existir

Todo desenho tem placeholder em `Graphics`, e o jogo é **jogável e ajustável com
zero textura**:

| Peça | Sem textura |
|---|---|
| estação | disco colorido com contorno grosso, telhadinho desenhado e o rótulo embaixo (que existe de qualquer jeito) |
| passageiro | cabeça redonda com boné, corpo em cápsula — no mapa e no ato da conversa |
| trem | retângulo arredondado com duas rodas, janelinha e chaminé |
| **peça de trilho** (bandeja e arraste) | dois trilhos claros sobre uma base de madeira, desenhados |
| **trilho posto** | casca escura, leito, dormentes transversais e dois filetes de trilho |
| cidade | quarteirões, praças e o rio em `Graphics`, bem lavados |

As texturas entram por `import.meta.glob` + `textures.exists()`, nunca por
`import` estático — arquivo que ainda não existe derruba o `vite build`.

### Ordem de produção

1. estações (sem elas o mapa não se lê);
2. passageiros;
3. trem;
4. fundo da cidade;
5. capa.

---

## 14. Arquitetura

```
src/games/EF05CO02/metro-mirim/
    PLANEJAMENTO.md
    TEXTURAS.md
    index.ts              Phaser FIT 1280×720, [BootScene, GameScene]
    types.ts              os tipos e o comentário que explica a mecânica
    data/layout.ts        TODA coordenada, com o porquê
    data/theme.ts         cores, fontes
    data/graph.ts         BFS puro: hops, pathOf, neighbours
    data/levels.ts        LEVELS + o veredito como função + validateLevels
    data/art.ts           geometria medida das folhas de sprite
    scenes/BootScene.ts   glob das texturas, createLoadingScreen, faseInicial
    scenes/GameScene.ts   os três atos, a câmera e a ponte — não desenha nada
    scenes/talk.ts        ATO 1: os passageiros entram, falam e mostram o destino
    scenes/coach.ts       o guia: uma dica por vez, com o dedo no lugar da ação
    scenes/city.ts        o fundo, do tamanho do mundo da fase
    scenes/network.ts     as arestas: tracejadas (possíveis) e trilho (postas)
    scenes/station.ts     o disco da estação, halo, plaquinha, seleção
    scenes/rider.ts       o passageiro no mapa, o balão de destino, o bilhete
    scenes/tray.ts        a bancada: as peças arrastáveis e o PARTIR
    scenes/run.ts         ATO 3: um trem por vez, com a câmera atrás dele
    scenes/diagram.ts     o fim do nível: a cidade some e sobra o grafo
    scenes/hud.ts         nível, bolinhas de fase, objetivo e `?`
    scenes/audio.ts       WebAudio sintetizado, respeitando `mute-audio`
```

**A GameScene não desenha.** Se ela precisar de um `fillRoundedRect`, falta um
painter em `scenes/`.

### Os três atos são UMA cena do Phaser

Eles parecem três cenas e poderiam ser — mas vidas, tutorial, pontuação, ponte
com a plataforma e fim de nível são um estado só. Em três `Phaser.Scene` cada
troca de ato viraria uma passagem de bagagem (e `createLives` teria de viver
numa quarta cena, por cima). Então o ato é um MODO da mesma cena, e o que muda
é quem está na tela:

| Ato | `mode` | Quem aparece |
|---|---|---|
| conversa | `conversa` | `talk` por cima de tudo; o mapa fica escurecido atrás |
| construção | `montando` / `travado` | mapa, bancada e HUD |
| partida | `correndo` | só o mundo: HUD e bancada somem (`setCinema`) |

### A câmera

Uma câmera só, com `setBounds` no mundo da fase. Tudo que é interface tem
`setScrollFactor(0)`; tudo que é cidade anda. Na partida os limites mudam para
o mundo inteiro (sem a faixa do HUD), porque aí a tela toda é mapa.

**O tutorial só roda com a câmera no canto** (`setScroll(0, 0)`): ele desenha em
coordenada de tela e não sabe da câmera, então mundo e tela precisam coincidir
enquanto ele está aberto. Ao terminar, a câmera centraliza na fase.

### A conversa com a plataforma

```ts
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
```

| Evento | Quando |
|---|---|
| `GAME_READY` | uma vez, com a primeira fase montada |
| `CORRECT_ANSWER` | a cada onda vencida (10 ou 5) |
| `WRONG_ANSWER` | a cada PARTIR que deixa alguém parado — e só aí |
| `CHECKPOINT` | fim de cada fase, `progress: Math.round(ondasFeitas / ondasDoNível * 100)` |
| `GAME_COMPLETED` | fim de cada nível, `stage: this.level.level`, `totalStages: LEVELS.length` |
| `GAME_OVER` | nunca à mão — é de `createLives` |

Vidas: `preloadLives` no boot, `vidasIniciais(this, 3)` no `init`, `createLives`
fora de container que sofra `removeAll()`, e `scene.restart({ lives: this.livesLeft })`
na troca de nível — o saldo atravessa, senão `lives=1` nunca reprova.

---

## 15. Registro

| Onde | O quê |
|---|---|
| pasta | `src/games/EF05CO02/metro-mirim` |
| assets | `src/assets/games/EF05CO02/metro-mirim` |
| `src/data/catalog.ts` | id **076** (próximo livre), slug `metro-mirim`, module `EF05CO02/metro-mirim`, skill `EF05CO02`, years `[5]`, order **325** (logo depois do Mapas em Rede, 320), status `draft` até jogar inteiro, title "Metrô Mirim", category "Pensamento Computacional", points **80**, icon 🚇, tags `["grafo", "rede", "caminho", "mapa"]` |
| descrição | "Toque em duas estações e o trilho nasce. Leve todo mundo ao destino — e veja a cidade virar uma rede." |
| `src/data/gameInstructions.ts` | as três linhas do painel `?` |
| `src/pages/GameDetailsPage.tsx` | entrar em `GAMES_WITH_IN_GAME_COMPLETION_SCREEN` |

---

## 16. Critérios de aceite

### A criança entende sozinha

- [ ] em 5 segundos de tela parada dá para dizer o que fazer: as estações
      brilham, a bandeja tem peças, o PARTIR está apagado esperando;
- [ ] nenhuma palavra técnica antes do fim do nível 1;
- [ ] tocar em qualquer lugar sempre responde alguma coisa (som, luz ou
      fumacinha) — nunca silêncio.

### É justo

- [ ] erro de dedo nunca custa vida;
- [ ] toda fase tem pelo menos duas redes vencedoras diferentes (menos a 1.1,
      que é introdução e tem uma só);
- [ ] nenhuma rede errada deixa a fase impossível;
- [ ] a dica depois de dois erros é calculada, e serve para a rede que está na
      tela.

### BNCC

- [ ] a criança **cria** ligações, **apaga** ligações e **reconecta** depois de
      um corte — as três manipulações do texto oficial;
- [ ] pelo menos uma fase por nível exige caminho de duas ou mais pernas;
- [ ] o diagrama final mostra o mesmo grafo que ela montou, sem a fantasia.

### Antes de dizer que está pronto

- [ ] `npx tsc --noEmit` limpo nos arquivos do jogo
- [ ] `npx eslint src/games/EF05CO02/metro-mirim` limpo
- [ ] nível inteiro jogado no navegador, com o console aberto
- [ ] a TRAVA vista acontecendo, e a dica do segundo erro também
- [ ] mudo funciona; `?` pausa e devolve a rede intacta
- [ ] nenhum número de ponto na tela
- [ ] nenhum gancho de depuração (`window.__algo`)

---

## 17. O que ficou para decidir

1. **O passageiro fica no mapa, ao lado da estação, ou só no painel de
   chegada?** O plano põe nos dois (mapa = de onde e para onde; painel = quem
   falta). Se o mapa de 7 estações ficar cheio, o passageiro no mapa vira só um
   balãozinho preso ao disco.
2. **A obra escolhe o trilho mais usado ou um sorteado?** O plano diz o mais
   usado (é o do briefing e dói mais), mas isso pode punir quem montou a rede
   mais elegante — a estrela perde sempre o centro. Se na prática frustrar,
   troca para "o mais usado entre os que não isolam nenhuma estação".
3. **Quantos passageiros cabem confortavelmente?** O plano limita a 4; medir no
   celular antes de escrever a fase 3.3.
4. **O nome "REDE" no HUD.** Hoje o objetivo diz "Ligue até todo mundo chegar".
   Se o diagrama final funcionar bem, vale trocar o objetivo do nível 3 para
   "Conserte a rede".
5. **A conversa ainda não tem como pular tudo de uma vez.** Com 3 passageiros
   são 3 toques. Se em sala isso cansar na terceira fase, um "pular" no canto
   resolve — mas ele não pode virar o caminho padrão, porque é ali que a
   criança descobre o que a fase pede.

---

## 18. O que mudou na construção

### O corte de teste (16/09/2026) — o nível 1 inteiro

Construído só o **nível 1**, com as três fases do §7. `LEVELS.length` é 1, então
a plataforma recebe `totalStages: 1` — é o corte de teste que o INSTRUCOES pede,
e o número passa a 3 sozinho quando os níveis 2 e 3 entrarem.

Jogado de ponta a ponta no navegador, com o console aberto:

```
GAME_READY · CHECKPOINT 0
CORRECT_ANSWER 10 · CHECKPOINT 33
WRONG_ANSWER (uma vez, na 1.2) · CORRECT_ANSWER 5 · CHECKPOINT 67
CORRECT_ANSWER 10 · CHECKPOINT 100
GAME_COMPLETED stage 1 · totalStages 1 · score 25 · errors 1
```

Os dois erros seguidos na mesma fase custaram **uma** vida só (3 → 2), e o
segundo fez a ligação que resolve piscar em verde.

### O que saiu diferente do plano, e por quê

**As ondas ficaram para o nível 2.** O §8 previa `waves: Wave[]` em toda fase,
por causa da 2.2 (a Biblioteca que chega no meio). No nível 1 nenhuma fase tem
segunda onda, e escrever o laço de ondas agora seria código que nunca roda —
`PhaseDef` guarda `riders` direto. Quando o nível 2 entrar, `waves` volta, e aí
com um caso de verdade para testar.

**`tray.ts` virou a bancada inteira** — bandeja, carinhas de quem falta chegar
*(que saíram na revisão 4)* e PARTIR. Separar em três módulos daria três arquivos de trinta linhas que só
existem juntos: eles compartilham a mesma faixa de 160 px e o mesmo estado
("tem peça na mão" acende o botão).

**`network.ts` guarda as duas camadas de aresta**, a possível e a construída.
Era para serem dois módulos, mas são o mesmo dado em dois estados: quando o
trilho nasce, o tracejado daquela ligação tem de sumir no mesmo quadro. Em
arquivos separados isso vira sincronização; junto, é um `if`.

**O tracejado precisou de casca escura.** Desenhado só na cor clara, ele sumia
em cima do fundo de telhados e árvores — e ele é a única coisa que diz ONDE cabe
trilho. Agora é traço grosso escuro por baixo e miolo claro por cima; quando a
estação está selecionada, o miolo fica azul.

**O trilho ganhou dormentes.** Sem as marcas transversais a aresta parecia uma
tábua de madeira atravessada no mapa.

**O passageiro embarca e desce no DESTINO.** Na primeira versão ele comemorava
parado na origem enquanto o trem ia sozinho, e isso foi a coisa mais confusa do
teste: a criança leva alguém a algum lugar e esse alguém não sai do lugar. Agora
ele encolhe quando o trem parte e reaparece **do lado direito da estação de
destino**, comemorando; quem desce no mesmo lugar ganha um `slot` para não
empilhar. Quem não chega volta para onde esperava.

**O bilhete da TRAVA e o balão do tutorial escolhem um lugar vazio.** Com
coordenadas fixas, os dois cobriam justamente a estação que estavam explicando —
o balão do "toque na outra" ficava em cima da Praça. `freeSpot()` escolhe, entre
nove posições, a que está a mais de 360 px no x **ou** 150 no y de toda estação
e do que ele explica. O bilhete perdeu o rabicho: quem fala já é o único
passageiro aceso, com os outros apagados.

**`Station.dative`.** "Bia quer chegar **à** Escola" e "Duda quer chegar **ao**
Hospital" saem do dado, não de uma regra de concordância no código.

**As folhas vieram maiores do que o TEXTURAS pediu** (400 × 400 e 350 × 400 em
vez de 256), e a `passageiros.png` chegou com **1399** px de largura — a célula
ficava em 349,75 e o recorte andava de quadro em quadro. Foi normalizada para
1400. Cada quadro teve a caixa alfa medida e ancorada em `data/art.ts`: prédio e
criança são posicionados pela BASE do desenho, então estádio, casinha e cadeira
de rodas pisam todos na mesma linha.

**O `trem.png` ainda não existe** e o jogo não sente falta: o trenzinho sai em
`Graphics`, com o eixo das rodas em cima do trilho e virando de lado sozinho
(`scaleY = -1` quando anda para a esquerda, senão ele andaria de cabeça para
baixo).

---

### Revisão 2 — três atos, e um mapa maior que a tela (16/09/2026)

O corte de teste tinha um problema que nenhuma lista de aceite pegou: **estava
tudo pequeno**. A cidade inteira cabia em 1280 × 720, e para caber, estação,
criança e trilho encolheram até o tamanho de ícone. E a fase inteira acontecia
numa tela só, sem respiro entre "entender o pedido", "resolver" e "ver dar
certo".

O que mudou:

**A tela virou uma janela.** Cada fase tem um mundo próprio (1700 × 820 a
2280 × 1040) e a criança **arrasta o mapa** para andar nele. Com isso a estação
dobrou de tamanho: ⌀ 220 na grade, 66 px reais no celular, contra 42 antes. O
passageiro passou de 112 para 180 px de altura.

**A fase virou três atos.** Ver §1. O que mais mudou de verdade foi o primeiro:
o pedido do passageiro morava num balãozinho de 100 px ao lado da estação e
passava despercebido; agora cada criança entra andando, em 360 px de altura, e
diz o que precisa. O terceiro ato **esconde a interface inteira** e deixa a
câmera atrás do trem — a partida virou cena, não um efeito no canto do mapa.

**Os trens passaram a correr um por vez.** Em paralelo era mais rápido e não se
via nada: três trens minúsculos em cantos diferentes de um mapa que não cabe na
tela. E o passageiro agora **anda até o trem e entra nele** antes da viagem.

**Construir virou arraste** (a pedido). A peça sai da bandeja e vai até a
ligação; o alvo é a linha inteira, com 240 px de tolerância, e a ligação mais
perto do dedo acende em azul enquanto a peça está no ar. **O toque-toque
continua funcionando** — é a rede de segurança de quem não consegue arrastar.

**Nasceu o minimapa** *(e saiu na revisão 4 — ver abaixo)*: com
o mapa maior que a tela, é o único lugar onde a rede inteira aparece de uma vez
— e aparece já abstraída, bolinha e linha, que é exatamente o desenho do fim do
nível. Ele apaga para 30 % enquanto a criança arrasta o mapa, para não tapar
estação, e tocar nele leva a câmera até lá.

**Dois bugs que só apareceram jogando:**

1. **O diagrama final com zoom de câmera.** A ideia óbvia era afastar a câmera
   até o mundo caber. Mas o véu e a legenda são presos à tela
   (`setScrollFactor(0)`) e **encolhem junto com o zoom**: o véu virou um
   retângulo escuro no meio do mapa. A correção foi não mexer na câmera —
   o diagrama calcula a escala e desenha o grafo em coordenada de tela.
2. **A conversa sem cancelamento.** Trocar de fase no meio de uma fala deixava
   um `await` que nunca voltava, e a conversa seguinte dividia o palco com a
   anterior: cada toque resolvia a espera errada. `talk.cancel()` corta a
   anterior antes de abrir a próxima, e é chamado também no `shutdown`.

---

### Revisão 3 — o tutorial saiu do painel (16/09/2026)

O tutorial de quatro painéis com "Próximo" estava certo no conteúdo e errado na
forma: a criança lia tudo **antes** de poder tocar em qualquer coisa, e quando o
painel fechava a fase começava do zero, sem nada do que ela acabou de ler na
frente. E o ponteiro do passo do arraste apontava para a ESTAÇÃO, quando o alvo
do arraste é a LIGAÇÃO.

Virou o guia do §12: uma frase por vez, um dedo repetindo o gesto onde ele
acontece, um anel no alvo — e **nada bloqueado**. A dica troca sozinha quando a
criança faz, então quem já sabe jogar nunca chega a ler. O painel continua
existindo no `?`, agora como recapitulação (e ganhou um passo novo no começo: o
objetivo, com o nome de quem está esperando naquela fase).

O detalhe que quase passou: **o alvo anda com a câmera**. O dedo e o anel são
coordenada de tela, e o mapa se move — sem recalcular os dois a cada arraste, a
dica aponta para onde a ligação estava.

**A arte dos trilhos e do trem chegou** e entrou no lugar dos desenhos:

- `trilho-tile.png` (156 × 67) vira um `TileSprite` girado ao longo de cada
  ligação, com `setTileScale` para a via repetir no tamanho dela — sem isso o
  desenho estica na vertical e os dormentes viram traços;
- `trilho-icone.png` (400 × 400) é a peça da bandeja, do arraste e do voo. O
  desenho é diagonal e ocupa só a faixa do meio do quadro, então ele também é
  ancorado pela caixa alfa medida, como as folhas;
- `trem.png` (500 × 200) montou no trilho: a âncora vertical fica **acima** da
  base medida, porque o trem não pisa na linha, ele monta nela.

**A capa entrou no card do catálogo**, e só ali: uma tela de título com botão
chegou a existir aqui e saiu no mesmo dia. Nenhum dos outros jogos tem uma, e
com razão — quem apertou Iniciar na plataforma já decidiu jogar; qualquer tela
entre isso e o jogo é um clique cobrado duas vezes.

---

### Revisão 4 — a tela ficou com o que o jogo usa (17/09/2026)

Três coisas saíram, e as três pelo mesmo motivo: ocupavam tela sem serem
olhadas.

**O minimapa.** Era a ideia de que eu mais gostei — a rede inteira, já em
bolinha e linha, num canto. Mas ele encostava na estação do alto à direita em
toda fase, e a informação que ele dava (onde estou, como é a rede toda) a
criança consegue arrastando o mapa, que é o gesto que ela já aprendeu no
primeiro minuto. Uma peça bonita que cobre uma peça jogável perde.

**As carinhas de "quem falta chegar".** Elas duplicavam o que o mapa já mostra —
e mostra melhor, desde que o passageiro passou a **descer no destino**: quem
ainda não viajou está lá, parado ao lado da estação dele.

**A tela de título** (ver acima).

Com os três fora, a bancada ficou com a bandeja e o apito, encolheu de 140 para
124 px, e **o mapa ganhou essa altura**: a janela passou de 498 para 514 px. É a
regra do projeto aparecendo de novo — painel que não é usado é área de jogo
desperdiçada.

**E o disco branco atrás das estações saiu.** Ele existia para dar contraste e
para segurar o contorno de estado (selecionada, vizinha possível, piscando na
TRAVA), mas tirava a cidade do lugar: cada estação virava uma moeda colada em
cima do mapa. Agora o prédio pousa no chão e o estado desceu para uma **marca
oval embaixo dele** — que é justamente onde o trilho chega. O alvo de toque não
mudou: continua um círculo de ⌀ 220 em volta do prédio, de propósito maior que o
desenho, porque dedo de criança não mira telhado.
