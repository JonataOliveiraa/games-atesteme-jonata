# Fábrica de Estampas — planejamento

Jogo novo da 3ª rodada · EF04CO03 · 4º ano · Pensamento Computacional. O id é o `NEXT_FREE_ID` na hora de cadastrar: hoje é **114**, mas ele fica com a Etiqueta Certa se ela for feita antes (então este vira 115).
Documento irmão: [TEXTURAS.md](./TEXTURAS.md). Ficha: `docs/rodada-3/EF04CO03.md` (a mesma que foi colada no chat em 13/10/2026).

**Decisões do usuário (13/10/2026):**
- arte na linha **chibi voador**, com a `references/35-chibi-voador.webp` anexada em toda geração;
- **o tecido enrola antes da pergunta**: a criança responde lendo a ordem, e o rolo abre no varal para conferir.

**Réguas, nesta ordem:**
1. **O mais fácil possível, com o objetivo claro.**
2. **A ordem mostra o estado do laço, nunca a próxima figura.** Quem decide o que vem agora é a criança.
3. **Mostrar antes de pedir:** demonstração feita pelo próprio jogo, com balões de 2 a 5 palavras.
4. **Um nível, um assunto.**

Regras fixas da rodada:
- **1 erro encerra** (`WRONG_ANSWER` + `lose()`), com a cena do erro antes;
- `createTutorial` com balões curtos e recorte, sem mãozinha;
- sem quadro de resumo no fim;
- "faça o jogo" = **só o N1**.

---

## 1. O jogo em uma frase

Numa estamparia, o **pedido** fica preso no alto, escrito como laço: `3 × [ flor, flor, estrela ]`. O tecido sai do rolo e para, um quadradinho por vez, embaixo da **janela de estampa**. A criança toca no **carimbo** da figura que vem ali (flor, estrela ou coração). Quando o tecido acaba, ele **enrola**, e vem a pergunta: *"Quantas ESTRELAS tem no rolo?"*. Ela responde pelo pedido; o rolo abre no **varal**, e o jogo conta figura por figura.

## 2. A habilidade

> **(EF04CO03)** Criar e simular algoritmos representados em linguagem oral, escrita ou pictográfica, que incluam sequências e repetições simples e aninhadas (iterações definidas e indefinidas), para resolver problemas de forma independente e em colaboração.

| O que a BNCC pede | Onde acontece |
|---|---|
| **simular** um algoritmo | a criança é a máquina: executa o pedido posição por posição, sem nada montado antes |
| **linguagem pictográfica** | o pedido é escrito com as próprias estampas, dentro de molduras de fita com um número (`3×`) |
| **repetição simples** (N1) | `4 × [flor]`: o número diz quantas vezes a figura sai |
| **sequência dentro da repetição** (N2) | `2 × [flor, flor, estrela]`: o laço repete o bloco inteiro, na ordem, e volta ao começo do bloco a cada volta |
| **repetição aninhada** (N3) | `2 × [ 2 × [flor], estrela ]`: o laço de dentro roda inteiro a cada volta do de fora e **recomeça do zero**, como as 20 janelas de cada um dos 10 andares do exemplo oficial |
| **iterações definidas** | todas as ordens têm número. A indefinida fica com os irmãos (ver Dúvida 2) |

**O teste da bolinha:**
- se a ordem acendesse a figura da vez, bastaria copiar o desenho aceso, sem ler laço nenhum. Por isso nada na ordem acende antes da carimbada (§7);
- se o tecido ficasse à vista na pergunta, ela viraria contagem. Por isso ele enrola, e a resposta tem de sair do pedido (`2 × [.., .., estrela]` → 2);
- trocar as estampas por bolinhas coloridas não mudaria o jogo: o que se avalia é a estrutura, não a figura.

**Os irmãos (mesma habilidade):**

| Jogo | O que a criança faz |
|---|---|
| *Prédio dos Laços* (025) | configura os números dos laços (andares × janelas) para o limpador cobrir o prédio |
| *Dança Aninhada* (070) | monta a coreografia com blocos REPITA e aperta DANÇAR para ver o dançarino executar |
| **Fábrica de Estampas** (este) | **executa** o laço com a própria mão, posição por posição, e calcula quantas figuras saíram |

Os dois irmãos são de **criar** (a criança programa, a máquina executa). Este é de **simular** (a criança executa). Nenhum repete o outro.

## 3. O que mudou da ficha, e por quê

| Ficha | Aqui | Motivo |
|---|---|---|
| TÍTULO → exemplo 5 s → JOGO → RESULTADO | sem título; o exemplo é a demonstração do tutorial (um ciclo inteiro com uma ordem de treino); o fim é o `showLevelComplete` | PADRAO-R3 §2 |
| TRAVA (cadeado, +5, o carimbo certo pulsa depois de 2 travas) | **1 erro encerra**: a estampa sai borrada, a figura que vinha ali acende no pedido, faixa curta, `WRONG_ANSWER` + `lose()` | regra da rodada |
| "as molduras acendem mostrando a volta"; N2 "moldura interna piscando por posição" | o pedido mostra só **voltas fechadas**: um botão é costurado na aba a cada volta concluída. Nada acende a figura da vez | a figura acesa seria a resposta (*decisão sem pista que entrega*) |
| pergunta com o tecido à vista | **o tecido enrola**; o pedido continua no alto; depois o rolo abre no varal e o jogo conta | decisão do usuário (13/10/2026): à vista, a pergunta vira contagem |
| esteira lenta (N1), mais rápida (N3) | a esteira **espera** embaixo da janela em todos os níveis | sem relógio: a dificuldade vem só do laço |
| N2 "aninhado de 2 níveis" com `2×[f,f,E]` e `3×[f,E]`; N3 com `2×[2×[f],E]` e `3×[E,C,F]` | **N2 = laço de um bloco** (`2×[f,f,E]`, `3×[f,E]`, `3×[E,C,C]`); **N3 = laço dentro de laço** (`2×[2×[f],E]`, `3×[E,2×[C]]`, `2×[2×[f],2×[E]]`) | um nível, um assunto: `3×[E,C,F]` não tem laço dentro, então é do N2; o N3 precisava de 3 ordens aninhadas |
| moldura azul = laço de fora, **amarela** = bloco de dentro | moldura **azul** = laço de fora; moldura **lilás** = laço de dentro (só no N3); no N2 o bloco fica direto dentro da azul | um idioma só (moldura com aba e número = repita). A estrela é amarela: uma moldura amarela em volta dela confundiria |
| N3 só com pergunta comparativa | 3.1 pergunta **quantas** (o gabarito da ficha: 4 flores); 3.2 e 3.3 **comparativas**, uma delas com resposta IGUAL | ficha (gabarito e nível) |
| varal com a frase *"isso foi 2 × [flor, flor, estrela]!"* | o tecido no varal com o pedido ainda no alto, sem frase | sem quadro de resumo; o pedido já está escrito ali |
| `?` abre painel ilustrado | o `?` repete os balões do nível, terminando em *Continuar* | `createTutorial` |
| +10 / +5 / +20, estrelas 90-70 | `CORRECT_ANSWER` +10 por carimbada e +20 na pergunta; estrelas do `showLevelComplete`; nada escrito na tela | sem pontos na tela; o +5 não existe sem segunda chance |
| telemetria (travas por posição, acerto por tipo de laço) | só os eventos da bridge | a bridge não tem esses campos |
| layout responsivo retrato/paisagem | 1280 × 720 com `Scale.FIT` | PADRAO-R3 §1 |

## 4. O laço

```
o pedido fica no alto: 3 × [ flor, flor, estrela ]    (a aba "3×" com 3 casas de botão vazias)
o tecido sai do rolo e para um quadradinho embaixo da janela de estampa
        │
        ▼
a criança lê o pedido e toca num dos 3 carimbos
        │
        ▼
o carimbo pega tinta, voa até a janela e bate ("tum")
  ┌──────────────────────────────────┬──────────────────────────────────────────────────┐
figura certa                          figura errada
a estampa fica no tecido;             a estampa sai borrada e o quadradinho treme; no pedido,
CORRECT_ANSWER                        a figura que vinha ali acende, com uma linha até ele;
se fechou uma volta: a agulha         faixa: "Agora vinha a ESTRELA."
costura a emenda no tecido e um       WRONG_ANSWER + lose()
botão é costurado na aba
(N3: o laço de dentro tem os
seus botões, e eles saltam fora
quando a volta de fora fecha)
        │
        ▼
o tecido anda um quadradinho … até o último
        │
        ▼
o tecido enrola num rolo; os carimbos descem e sobem 3 etiquetas de resposta
"Quantas ESTRELAS tem no rolo?"        (N3.2–3.3: "Saiu mais FLOR ou mais ESTRELA?")
        │
        ▼
a criança toca numa etiqueta → o varal desce, o rolo abre pendurado,
e o jogo conta figura por figura (1, 2, …)
  ┌──────────────────────────────────┬───────────────────────────────────┐
a contagem bate com a etiqueta        não bate
a etiqueta acende;                    a etiqueta treme; faixa: "Saíram 2 ESTRELAS."
CORRECT_ANSWER                        WRONG_ANSWER + lose()
        │
        ▼
3 pedidos → confete → showLevelComplete
```

**A esteira espera.** O quadradinho para embaixo da janela e fica lá até a criança tocar num carimbo. Não há relógio.

**Tocar no carimbo é a resposta.** Não há botão de confirmar. Os três carimbos são grandes, nunca trocam de lugar, e respondem no soltar, só se o dedo ficou parado. Toques durante o voo do carimbo e o avanço do tecido são ignorados.

## 5. Fácil e claro

- **Um quadradinho por vez, sem relógio.** A janela de estampa marca a posição da vez.
- **O pedido fica à vista o tempo todo**, inclusive na pergunta.
- **O pedido mostra o que já aconteceu e nunca o que vem.** Os botões entram depois da carimbada que fecha a volta. Nenhuma figura do pedido acende, pisca ou ganha seta durante a produção.
- **O tecido mostra as voltas prontas:** a emenda costurada aparece quando a volta fecha, então "em que ponto da volta estou" é contar os quadradinhos desde a última emenda.
- **No máximo 3 alvos na tela:** os 3 carimbos, ou as 3 etiquetas de resposta. Nunca os dois juntos.
- **A primeira vez de cada coisa é guiada:** o ciclo inteiro no N1, o bloco que repete no N2 e o laço de dentro no N3.

## 6. A tela (1280 × 720)

Vista de frente, um pouco de cima, como se a criança estivesse na bancada.

| Região | Caixa / centro | O quê |
|---|---|---|
| HUD | bolinhas em (194, 44), `?` em (1220, 56) | bolinhas = os 3 pedidos |
| **pedido** | papel centrado em x 640, y 87 a 285, com a largura da estrutura (420 a 800) | a estrutura, centrada (§7); estampas de 100 px, aba de 124 × 150 |
| **esteira** | faixa y 328–468, de x −20 a 1300 | `TileSprite` andando só quando o tecido anda |
| **janela de estampa** | **no meio da tela**, centro (640, 388), ≈ 170 × 206 | a moldura de madeira em volta do quadradinho da vez, logo acima do carimbo do meio; some quando o tecido enrola |
| **rolo de tecido liso** | (1150, 384), ≈ 236 × 236 | de onde o tecido sai |
| **tecido** | quadradinhos de 112 px, centro em y 391 | o quadradinho `i` fica em `x = 640 − (atual − i) · 112`; à esquerda fica a volta em curso e as anteriores, à direita o pano liso até o rolo |
| **carimbos** / **respostas** | centros em x 360 · 640 · 920; carimbos em y 580 (alvo 240 × 236), etiquetas de 196 px em y 572 | os carimbos em cima das almofadas de tinta; na pergunta, as 3 etiquetas entram no mesmo lugar |
| **pergunta** | papel de x 78 a 878, y 342 a 454 | por cima da esteira parada, com o rolo em (1000, 398); sai quando o varal desce |
| **varal** | corda em y 298, de x 40 a 1240 | desce só na conferência; o tecido fica pendurado logo abaixo, com quadradinhos de até 120 px (menores se o tecido for comprido) |
| **estampadora** | x 15–240, base em y 720 | reage: acena, pensa, comemora, "ops" |

A tela inteira tem 1 região tocável de cada vez: a fileira de baixo (3 carimbos ou 3 etiquetas).

**PC:** o mouse basta, porque tudo é toque simples. Nada de etiqueta de tecla na tela.

## 7. O pedido

O pedido é a estrutura da ficha, desenhada com as próprias estampas.

- **Laço** = uma moldura de fita com uma **aba** à esquerda. A aba tem o número (`3×`, escrito pelo código, 40 px) e **uma casa de botão por volta**.
- **Moldura azul** = o laço de fora. Dentro dela, as estampas na ordem, da esquerda para a direita (72 px cada).
- **Moldura lilás** = o laço de dentro, só no N3. Fica dentro da azul, com a sua própria aba.
- A largura das molduras é do código (`NineSlice` da fita). O papel do pedido também é `NineSlice`.

| O pedido mostra | O pedido nunca mostra |
|---|---|
| quantas voltas já fecharam: um **botão costurado** na aba, depois da carimbada que fecha a volta | qual figura vem agora |
| no N3, os botões da moldura lilás **saltam fora** quando a volta de fora fecha (o de dentro recomeça) | seta, brilho ou pulsação em figura durante a produção |
| no erro, a figura que vinha ali acende, como explicação | o número da volta escrito ("2/3") |

A figura do pedido só acende em duas horas: no erro (§12) e nos passos do tutorial.

## 8. O tecido e a esteira

- O tecido é uma tira de linho creme dividida em **quadradinhos** (costura pontilhada fininha). Ele sai do rolo à direita e anda para a **esquerda**: o que já foi estampado fica à esquerda da janela, na mesma ordem em que se lê o pedido.
- O tecido tem **exatamente** as posições do pedido expandido (máximo 9).
- **Carimbada:** o carimbo sai da almofada, voa até a janela (0,25 s), bate com um leve achatamento e deixa a estampa; volta à almofada (0,2 s). Depois o tecido anda um quadradinho (0,3 s), com a esteira rolando.
- **Volta fechada:** a agulha corre por baixo do último quadradinho da volta e deixa uma **emenda** (pesponto azul, a cor do laço de fora), e um botão é costurado na aba azul.
- **Laço de dentro (N3):** cada volta dele costura um botão na aba lilás. Quando a volta de fora fecha, esses botões saltam fora e as casas ficam vazias de novo.

## 9. A pergunta e o varal

1. Depois da última carimbada, a ponta do tecido sai do rolo liso e o tecido **enrola** da esquerda para a direita: os quadradinhos somem dentro do rolo, que para ao lado da janela.
2. Os carimbos descem; sobem 3 **etiquetas de resposta** no lugar deles. A pergunta entra num papel por cima da esteira, com o sino.
   - **O fundo escurece** (véu a 72 %). Ficam acesos só o pedido, o papel da pergunta, o rolo e as 3 etiquetas; depois, o varal com o tecido e os numerinhos. O véu sai no acerto, junto com a comemoração. No erro ele fica, com a faixa por cima.
   - **quantas:** *"Quantas ESTRELAS tem no rolo?"* (*"Quantos CORAÇÕES…"*); etiquetas com números, em ordem crescente;
   - **comparativa** (N3): *"Saiu mais FLOR ou mais ESTRELA?"*; etiquetas `[flor] MAIS`, `[estrela] MAIS` e `IGUAL`.
3. A criança toca numa etiqueta. O varal desce, o rolo sobe até a ponta dele e **desenrola pendurado**, com um prendedor em cada emenda.
4. **A conferência:** o jogo conta as figuras perguntadas, da esquerda para a direita, com um numerinho embaixo de cada uma e uma nota subindo. Na comparativa, conta uma figura e depois a outra.
5. A contagem termina e o resultado aparece na etiqueta escolhida: acende se bateu, treme se não bateu (§12).

## 10. Tutorial (por nível, uma vez)

Balões de 2 a 5 palavras, véu com recorte no que a frase cita, sem mãozinha. Quando o jogo "toca" num carimbo na demonstração, aparece um anel nele antes de ele voar. Depois do *"Sua vez!"*, nada aponta o carimbo certo.

**N1** (a primeira abertura do jogo):
1. [Ver] Recorte no pedido e nos carimbos: *"Carimbe o que o pedido manda."*
2. Demonstração com uma **ordem de treino** `2 × [flor]`, que não conta: o jogo carimba duas flores, a agulha costura as emendas e os dois botões entram na aba.
3. Recorte na aba com os 2 botões: *"2 vezes: 2 flores."* [Ver]
4. O tecido enrola, a pergunta *"Quantas FLORES tem no rolo?"* sobe, o jogo toca no **2**, o rolo abre no varal e conta 1, 2. A etiqueta acende.
5. *"Sua vez!"* O papel troca para o pedido 1.1.

**N2** (no pedido 2.1):
1. [Ver] Recorte no pedido: *"O bloco todo repete."*
2. O jogo carimba a 1ª volta (flor, flor, estrela). Uma seta de pontinhos animada corre do fim do bloco até o começo dele, a emenda é costurada e o 1º botão entra.
3. *"Sua vez!"* A criança faz a 2ª volta. O que o jogo carimbou fica, e a fase continua dali.

**N3** (no pedido 3.1):
1. [Ver] Recorte na moldura lilás: *"Um laço dentro do outro."*
2. O jogo carimba flor (1 botão lilás), flor (2 botões lilás), estrela (1 botão azul), e os botões lilás saltam fora.
3. Recorte nas casas lilás vazias: *"O de dentro recomeça."*
4. *"Sua vez!"* A criança faz a 2ª volta.

A pergunta comparativa (3.2) não ganha passo: as três etiquetas se explicam.

O `?` repete os balões do nível com recorte no pedido atual, sem demonstração, terminando em *Continuar*.

## 11. Níveis (`data/levels.ts`)

```ts
type Fig = 'flower' | 'star' | 'heart'
type Loop = { times: number; body: (Fig | Loop)[] }
type Question =
  | { kind: 'count'; fig: Fig; options: [number, number, number] }
  | { kind: 'compare'; a: Fig; b: Fig }
type Order = { loop: Loop; question: Question }
type Level = { level: number; demo?: Loop; orders: Order[] }
```

A regra pura (`expand`, `trace`) mora no `levels.ts`. O `trace` devolve, para cada posição, a figura certa e o que ela fecha (volta de dentro, volta de fora), e é ele que diz à cena quando costurar botão e emenda e qual faixa usar no erro.

| Nível | Assunto | Pedidos | Pergunta (certa em negrito) |
|---|---|---|---|
| **1, o número diz quantas vezes** | laço de uma figura só | `4 × [flor]` · `3 × [estrela]` · `5 × [coração]` | flores 1 · **4** · 5 · estrelas 1 · 2 · **3** · corações 1 · **5** · 6 |
| **2, o laço repete o bloco inteiro** | um bloco de 2–3 figuras, na ordem | `2 × [flor, flor, estrela]` · `3 × [flor, estrela]` · `3 × [estrela, coração, coração]` | estrelas 1 · **2** · 6 · estrelas 1 · **3** · 6 · corações 2 · 3 · **6** |
| **3, um laço dentro do outro** | o de dentro roda inteiro e recomeça a cada volta | `2 × [2 × [flor], estrela]` · `3 × [estrela, 2 × [coração]]` · `2 × [2 × [flor], 2 × [estrela]]` | flores 2 · **4** · 6 · **mais coração** (6 × 3) · **igual** (4 × 4) |

O N1 tem ainda a ordem de treino `demo: 2 × [flor]`.

**Por que essas iscas:** a menor é sempre "um bloco só" (esqueceu a repetição); a maior, quando existe, é "todos os quadradinhos"; no N2.3 o 3 é o número de voltas.

**`validateLevels`:**
- 3 pedidos por nível; tecido de 3 a 9 quadradinhos; laço de fora de 2 a 5 voltas, de dentro de 2 a 3; no máximo 2 molduras de profundidade;
- **N1:** o bloco é 1 figura só, e os 3 pedidos usam figuras diferentes;
- **N2:** bloco de 2–3 figuras, com pelo menos 2 figuras diferentes, sem laço dentro;
- **N3:** todo pedido tem pelo menos 1 laço dentro;
- **quantas:** a figura está no pedido; 3 opções diferentes em ordem crescente; a certa é a contagem do `expand`; no N2 e no N3, uma das iscas é a contagem de uma volta só;
- **comparativa:** `a ≠ b`, as duas no pedido; no nível, uma resposta é "mais" e outra é "igual";
- a etiqueta certa não fica na mesma posição nos 3 pedidos do nível.

## 12. Erros (a cena antes do `lose()`)

| Erro | O que se vê | Faixa grande |
|---|---|---|
| carimbo errado no começo de uma volta nova | a estampa sai **borrada** e o quadradinho treme; no pedido, a 1ª figura do bloco acende, com uma linha de pontinhos até o quadradinho | *"Volta nova: começa pela FLOR!"* |
| carimbo errado na 2ª volta do laço de dentro (N3) | o mesmo, com a figura de dentro acesa e a casa vazia da aba lilás tremendo | *"O laço de dentro ainda não acabou."* |
| carimbo errado logo depois do laço de dentro (N3) | o mesmo, com a figura depois da moldura lilás acesa | *"O de dentro acabou: agora ESTRELA."* |
| carimbo errado nos outros casos | o mesmo | *"Agora vinha a ESTRELA."* (*"o CORAÇÃO"*, com o artigo de cada figura no `words.ts`) |
| resposta errada (quantas) | a contagem para no número certo; a etiqueta escolhida treme | *"Saíram 2 ESTRELAS."* |
| resposta errada (comparativa) | as duas contagens; a etiqueta escolhida treme | *"4 flores e 2 estrelas: mais FLOR!"* / *"4 flores e 4 estrelas: IGUAL!"* |

O erro não tem som áspero, só um "blom" fofo. A cena do carimbo cabe em 1,2 s; a da pergunta é a própria contagem (até 2 s), e por isso o `lose()` sai **depois** dela, junto com a faixa.

## 13. O fim de cada pedido e de cada nível

- **Fim de pedido:** depois da conferência certa, a estampadora comemora, o varal sobe levando o tecido, o papel do pedido sai voando e o próximo entra preso pelos alfinetes. Um tecido novo sai do rolo e os carimbos voltam. Uma bolinha do HUD acende. `CHECKPOINT` com o progresso.
- **Fim de nível:** o último tecido fica no varal, confete, `showLevelComplete` e `GAME_COMPLETED` com `stage: this.level.level` e `totalStages: LEVELS.length`.

Não há quadro de resumo nem frase com o pedido.

## 14. Som (WebAudio)

| Momento | Som |
|---|---|
| tecido andando | ronco macio de esteira, só durante o avanço |
| carimbada | "tum" grave e curto + "plic" de tinta |
| emenda costurada | zíper fininho |
| botão costurado | "plim" |
| botões de dentro saltando fora | três "pop" rápidos |
| tecido enrolando | "fuuup" |
| pergunta | sino |
| contagem | uma nota subindo por figura |
| resposta certa | acorde curto |
| erro | "blom" fofo |
| fim de nível | fanfarra curta |

## 15. Arquivos e registro

**Código** (`src/games/EF04CO03/fabrica-de-estampas/`), no esqueleto do Manobrista:
- `types.ts`, `index.ts`;
- `data/{levels,words,layout,theme,files}.ts`;
- `scenes/{BootScene,GameScene,order,fabric,stamps,answers,clothesline,worker,banner,hud,guide,audio,art,fallback}.ts`.

Reaproveita do Manobrista: `hud`, `guide` (`teach`), `banner`, `audio` e `art`. O jogo roda antes da arte, com reserva em `Graphics` nas mesmas chaves de folha. A esteira e a corda do varal são `TileSprite`; molduras e papéis são `NineSlice`; nada de `Graphics` redesenhado a cada quadro. A estampadora só aparece se a folha dela existir.

**Texturas** (prompts completos no [TEXTURAS.md](./TEXTURAS.md), enviados com a `references/35-chibi-voador.webp` anexada):

| Arquivo | Grade | Conteúdo |
|---|---|---|
| `bg-estamparia.png` | 1672 × 941 | a estamparia de frente: parede com prateleiras nos cantos, o meio vazio para o pedido, o balcão da esteira e a bancada da frente |
| `esteira.png` | 3 × 2 | pedaço de esteira, janela de estampa, rolo de tecido liso, rolo fechado, corda do varal, gancho |
| `estampas.png` | 4 × 3 | 3 estampas, quadradinho de tecido, 3 estampas borradas, barra do tecido, botão, casa do botão, agulha, prendedor |
| `carimbos.png` | 3 × 2 | 3 carimbos de madeira e 3 almofadas de tinta |
| `ui.png` | 3 × 2 | papel do pedido, moldura azul, moldura lilás, aba azul, aba lilás, etiqueta de resposta |
| `estampadora.png` | 2 × 2 | **opcional**: a estampadora em 4 poses |
| `cover-fabrica-de-estampas.png` | 1672 × 941 | capa **com o título** |

Para o N1 bastam o fundo, a esteira, as estampas, os carimbos e a `ui`. A estampadora é acabamento, e a capa vem por último.

**Registro (feito em 13/10/2026):**
- id = `NEXT_FREE_ID` (conferir na hora), que avança um no mesmo commit;
- slug `fabrica-de-estampas`, module `EF04CO03/fabrica-de-estampas`, `years: [4]`, Pensamento Computacional, ordem 256 (logo depois da Dança 255);
- `gameInstructions` com 3–4 frases, `GAMES_WITH_IN_GAME_COMPLETION_SCREEN` e `public/og/fabrica-de-estampas.jpg`.

## 16. Travas para quem mexer depois

- **Nada no pedido acende a figura da vez.** Botão costurado e emenda são consequência da carimbada, nunca aviso do que vem.
- **O tecido enrola antes da pergunta**, e o pedido continua à vista. Sem isso a pergunta vira contagem.
- Os carimbos nunca trocam de lugar nem de cor. As cores das molduras (azul e lilás) não são cor de figura.
- A esteira espera; não existe relógio em nível nenhum.
- O quadradinho só aceita carimbo embaixo da janela; tocar no tecido ou no pedido nunca é resposta.
- A conferência conta no tecido de verdade: a conta que desenha os numerinhos é o mesmo `expand` que julga.

## 17. Dúvidas

1. **Cenário repetido.** A Etiqueta Certa (EF04CO02, também do 4º ano) é esteira de fábrica, e a Fábrica de Carimbos (EF02CO01) tem esteira, carimbo e um nome parecido. Mantive a ficha porque a cena é outra (tecido e carimbo de madeira, vista de frente) e a esteira aqui só leva o pano. Se quiser fugir: o pano fica parado na bancada e a janela de estampa anda sobre ele (a mecânica não muda), e o nome pode virar *Estamparia dos Laços*.
2. **Repetição indefinida.** A ficha não pede, e os irmãos cobrem (*até o topo* no Prédio, *até a luz apagar* na Dança). Se quiser a frase inteira da BNCC aqui, o 3.3 pode virar `REPITA ATÉ O TECIDO ACABAR: [flor, estrela]`, com um tecido de tamanho novo.

## Histórico

- **13/10/2026** — plano a partir da ficha.
  - O usuário escolheu a arte chibi voador com anexo, e que o tecido enrole antes da pergunta.
  - A TRAVA virou 1 erro com a cena.
  - O pedido passou a mostrar só voltas fechadas (botões costurados).
  - Os níveis foram reorganizados em um assunto cada: laço simples, bloco, laço dentro de laço.
- **13/10/2026** — **N1 feito em Graphics** (pedido: *"faça o jogo com apenas n1, use Graphics"*).
  - Id **115**, com `NEXT_FREE_ID` em 116; `READY = 1` no `levels.ts`, que já valida o N2 e o N3.
  - A arte de reserva é assada com as mesmas chaves e grades do TEXTURAS, então os PNGs entram sem mudar código.
  - A estampadora só aparece quando a folha dela existir.
  - A janela de estampa virou uma moldura em volta do quadradinho, porque o arco parecia uma mesinha. Os dois rolos aparecem de ponta (TEXTURAS corrigido).
  - Na conferência, o papel da pergunta sai para o varal aparecer; as etiquetas ficam.
- **13/10/2026** — **enquadramento** (pedido: *"ajuste o enquadramento"*). As peças estavam pequenas, e sobrava parede e bancada vazias. A janela de estampa foi para o meio da tela, em cima do carimbo do meio. O tecido passou a 120 px, as estampas do pedido a 100 px, e os carimbos e as etiquetas cresceram. A janela some quando o tecido enrola, e a faixa do erro desceu para a base.
- **13/10/2026** — **texturas no jogo** (pedido: *"texturas adicionadas. use-as no jogo e ajuste o enquadramento"*).
  - As 6 folhas entraram limpas, sem a franja de alfa baixo; as medidas estão no `MANIFEST.md` dos assets. Falta só a capa.
  - A esteira do PNG tem rolinhos nas pontas: o código repete só o miolo entre dois sulcos.
  - O enquadramento seguiu a arte: a esteira sobre o balcão do fundo, a janela posicionada pelo vão, cada carimbo em pé sobre a tinta da almofada, a estampadora no canto de baixo à esquerda (acena, pensa, comemora, ops). O tecido passou a 112 px.
  - As abas usam NineSlice, com o número na cor da moldura sobre o miolo creme.
- **13/10/2026** — **foco na pergunta** (pedido: *"qnd terminasse de carimbar tudo, e fosse escolher quantos x tem, o jogo deveria focar nos elementos que deve ser destacado. oq nao for, deixa fundo escuro"*). Véu escuro entre o cenário e as peças da pergunta, pela profundidade (`DEPTH.veil`); a estampadora fica atrás dele.
- **13/10/2026** — **N2 e N3 feitos, e a capa no catálogo** (pedido: *"faça n2 e n3. cover adicionado"*).
  - `READY = 3`. Os pedidos e as perguntas são os do §11; a validação já cobria os dois níveis.
  - **Estreia do N2** (pedido 2.1): balão *"O bloco todo repete."*; o jogo carimba a 1ª volta, e quando ela fecha, uma seta de pontinhos corre da última figura do bloco até a primeira. Depois, *"Sua vez!"*, e a criança faz a 2ª volta.
  - **Estreia do N3** (pedido 3.1): balão *"Um laço dentro do outro."* com recorte na moldura lilás. O jogo carimba a 1ª volta (os botões lilás enchem e saltam fora quando a estrela fecha a volta de fora). Depois vêm *"O de dentro recomeça."*, com recorte na aba lilás vazia, e *"Sua vez!"*.
  - O `?` ganhou um passo por nível: *"O laço repete o bloco inteiro, na mesma ordem."* (N2) e *"O de dentro roda inteiro a cada volta."* (N3).
  - Nos tecidos de 9 quadradinhos, as voltas antigas saem pela esquerda durante a carimbada, mas a volta em curso fica sempre à vista; no varal, os 9 cabem.
  - Capa no catálogo; `public/og/fabrica-de-estampas.jpg` gerado à parte, porque o `gerar-og.mjs` para na Corrida no Cabo (116), que está sem capa.
