# Operação Formiga — planejamento

Documento irmão: [TEXTURAS.md](./TEXTURAS.md)

**EF15CO04 · 1º ao 5º ano · Pensamento Computacional · Decomposição** · pasta `src/games/EF15CO04/operacao-formiga/`

> **(EF15CO04)** Aplicar a estratégia de decomposição para resolver problemas complexos, dividindo esse problema em partes menores, resolvendo-as e combinando suas soluções.

Pedido do usuário (21/10/2026): colou a ficha *Operação Formiga* (folha gigante, tocar nas linhas pontilhadas, formigas atravessando sozinhas). Apontei três problemas: as partes eram todas iguais (atravessar o túnel), a combinação era automática e a ordem obrigatória do N3 contrariava o "pode intercalar" da BNCC. Ele refez a ideia: **você é a formiga**, anda pelo jardim com joystick e **corta com o dedo** o que a rainha pede. Os três níveis ficaram assim: frutinha cortada uma vez; folha cortada em 3 e cada parte em 2; folha gigante dividida em tarefas diferentes (limpar, chamar amigas, levar). Pediu os obstáculos **fresta** e **vento**, e terminou com *"já planeje o jogo com sua textura e já faz o n1 usando Graphics. a textura eu adicionarei em breve"*.

---

## 0. Os irmãos, e o que este faz de diferente

| Irmão | O que a criança faz |
|---|---|
| Arquiteto das Missões (045) | parte um pedido em cartas, resolve cada carta, junta no plano |
| Canteiro de Obras (086) | toca na tesoura, o terreno se parte, monta cada pedaço com as peças dele |
| **Operação Formiga** | **ela é a formiga**: decide **onde e quanto** cortar, carrega cada pedaço pelo jardim e vê a fruta remontada no prato da rainha |

Nos dois irmãos o corte vem pronto (a tesoura e as linhas são do jogo). Aqui **o tamanho das partes é decisão da criança**, e o mundo devolve a consequência: pedaço grande demais entala na fresta, pedaço pequeno demais o vento leva. Decompor "no tamanho certo" vira coisa que se sente, e não regra que se lê.

## 1. O jogo em uma frase

**A rainha quer a frutinha, mas ela não passa na fresta: corte com o dedo, leve um pedaço de cada vez, e veja a fruta inteira de novo no prato da rainha.**

## 2. A habilidade na tela

| A habilidade pede | Onde está |
|---|---|
| **problema complexo** | a fruta inteira diante da fresta: grande demais para passar |
| **dividir em partes menores** | a criança corta com o dedo, quantas vezes e onde quiser |
| **resolver as partes** | cada pedaço é uma viagem: pegar, atravessar a fresta (e o vento), entregar |
| **combinar as soluções** | no prato da rainha, cada pedaço se encaixa no lugar de onde saiu, e a fruta volta inteira |
| decompor de novo quando a parte ainda é grande | o pedaço que entala é cortado ali mesmo (N1), e no N2 isso vira o assunto do nível |

O cartão do pedido, no meio do cabeçalho, mostra o ciclo inteiro sem palavra: a fruta **se parte** em casinhas quando a criança termina de cortar, cada casinha **acende** quando o pedaço chega, e no fim as casinhas **se juntam** de novo na fruta com o selo da rainha.

**Teste da bolinha:** se a fresta aceitasse qualquer pedaço, cortar seria enfeite. É o tamanho da fresta (e, a partir da fase 3, o do vento) que faz o corte ser a resposta.

## 3. O laço (uma fase)

1. **O pedido.** A rainha, ao lado do formigueiro, mostra num balão o desenho da fruta (sem texto). O cartão do cabeçalho mostra a mesma fruta. No prato da rainha aparece o **contorno tracejado** da fruta, esperando.
2. **Andar.** A criança leva a formiga com o joystick até a fruta, que está do outro lado do muro de pedras.
3. **Cortar.** Encostou na fruta, a câmera se aproxima e o joystick some. A criança passa o dedo de um lado ao outro da fruta: o corte sai **reto**, do ponto onde o dedo entrou ao ponto onde saiu, e corta tudo o que atravessou de ponta a ponta. Ao lado fica o **medidor**: um círculo tracejado entre duas pedrinhas, do tamanho da fresta. Corta quantas vezes quiser e aperta o **✓** grande.
4. **Carregar.** A câmera se afasta, os pedaços se espalham um pouco e o cartão do pedido se parte em uma casinha por pedaço. A formiga pega um pedaço ao passar por cima (um de cada vez) e o leva no alto da cabeça.
5. **A fresta.** O muro de pedras tem uma passagem só. Pedaço que cabe passa. Pedaço grande demais **entala**: a formiga empurra, treme, e a legenda diz *GRANDE DEMAIS!*. O pedaço fica no chão diante da fresta, a câmera se aproxima e a criança o corta ali mesmo (uma linha tracejada pisca sugerindo onde). Entalar **não é erro de partida**: é a trava da ficha, e custa estrela.
6. **O vento** (da fase 3 em diante). Uma faixa do jardim tem vento soprando. Pedaço pequeno demais **voa** da cabeça da formiga. Isso é erro (§8).
7. **Entregar.** Chegando ao buraco do formigueiro, o pedaço voa para o prato e se encaixa no lugar de onde saiu, com um clique. A casinha dele acende no cartão.
8. **Juntar.** Com o último pedaço no prato, os pedaços se fecham, a fruta brilha inteira, a rainha comemora e a bolinha da fase acende.

Não há relógio. A formiga anda à vontade, e o vento não empurra ninguém: ele só leva o pedaço pequeno demais.

## 4. Controle

| Onde | O quê |
|---|---|
| **joystick** (canto de baixo à esquerda) | arrastar = a formiga anda para qualquer lado (no computador, também setas ou WASD) |
| **a fruta e os pedaços**, no modo de corte | arrastar de um lado ao outro = cortar em linha reta |
| **✓** (canto de baixo à direita, só no modo de corte) | tocar = terminei de cortar |
| `?` | as instruções |

Pegar e entregar não têm botão: a formiga pega o pedaço ao passar por cima e entrega ao chegar no buraco do formigueiro.

**O joystick e o corte com o dedo são pedido do usuário** e deixam o padrão "gesto único, nada de arrastar" da ficha, como na Nave Multiuso (EF02CO03). Os dois arrastos **nunca valem ao mesmo tempo**: andar e cortar são dois modos, e a câmera marca a troca (afasta = andar, aproxima = cortar). No modo de corte o joystick some.

**Regras do corte:**
- o traço tem de atravessar o pedaço **de ponta a ponta** (começar e terminar fora dele). Traço que não atravessa nada não faz nada;
- um traço corta **todos** os pedaços que atravessa;
- corte que deixaria um farelo (menos de 4 % da fruta) não acontece: a lâmina quica e nada muda;
- no máximo 8 pedaços por fruta;
- na fresta, o ✓ só acende depois de pelo menos um corte no pedaço entalado (senão ele entalaria de novo).

## 5. A tela (1280 × 720), jardim visto de cima (3/4)

```
┌──────────────────────────────────────────────────────────────────────┐
│ [Nível 1] ●○○ │        [ 🍓 ]  ← o pedido (vira casinhas)     │  (?) │  faixa 96
├──────────────────────────────────────────────────────────────────────┤
│                                  🪨                 ( prato )         │
│        🌿                         🪨           ≋≋   ( contorno )       │
│       ( 🍓 )                      🪨           ≋≋              👑     │
│                                    ← fresta → ≋≋  vento    rainha     │
│                                   🪨           ≋≋                     │
│   (joystick)                      🪨           ≋≋        ⛰ formigueiro│
│     ◯                             🪨                                  │
└──────────────────────────────────────────────────────────────────────┘
```

| Coisa | Onde (mundo 1280 × 720) |
|---|---|
| a fruta | (280, 330), sob um arbusto |
| o muro de pedras | x 706–774, de cima a baixo, com **uma** fresta entre y 390 e 490 (abertura de 100 px) |
| o vento (fase 3) | faixa x 840–950, de cima a baixo |
| o prato da rainha | (1050, 230), raio 92 |
| a rainha | (1190, 360), virada para a esquerda |
| o formigueiro | montinho em (1090, 560); o buraco em (1090, 535); entrega a até 85 px do buraco |
| o joystick | (150, 610); pega o toque em x < 430 e y > 440 |
| o ✓ do corte | (1150, 630), raio 62 |

- **Escala:** a fruta é desenhada em "px de arte" (célula de 512) e aparece no jardim a **0,30**. O prato usa a mesma escala, então o pedaço entregue cai exatamente no lugar de onde saiu.
- **Modo de corte:** a câmera aproxima a **2,6×**, com a fruta em (520, 420) da tela e o medidor à direita, a (962, 420). A fruta fica com raio de ~180 px na tela.
- A formiga tem ~80 px no jardim e colide como um círculo de raio 18. O muro bloqueia, a fresta deixa passar; com pedaço grande demais, a fresta também bloqueia (e aí entala).

## 6. As medidas (o coração do jogo)

Tudo é medido em **área**, em px² de arte. Área é o que a criança vê como "tamanho" de um pedaço, e não depende do formato (uma fatia comprida e um gomo podem ter o mesmo tamanho).

| Medida | Valor | Quem usa |
|---|---|---|
| **fresta** (`CAP`) | 50 000 px² de arte (um círculo de raio ~126) | pedaço maior que isso entala |
| **vento** (`WIND_AREA`) | 15 000 px² de arte (12 % da maçã do N1) | pedaço menor que isso voa |
| **farelo** | 4 % da fruta | corte que deixaria um pedaço menor não acontece |
| **peso** (`LIFT`, N2) | 110 000 px² de arte (2,2 × `CAP`) | pedaço maior não sai do chão |

O medidor do modo de corte desenha a fresta como um círculo tracejado com área = `CAP`, e nas fases com vento, um circulozinho cheio com área = `MIN`, com o redemoinho.

**As frutas do N1** (silhuetas convexas, para cada corte dar exatamente dois pedaços):

| Fase | Fruta | Forma (px de arte) | Área | Fresta ÷ área | Pedaços no mínimo |
|---|---|---|---|---|---|
| 1 | morango | ovo de ponta para baixo, a 185 · b 205 · e 0,22 | ~119 000 | 0,42 | **3** (metades: 0,50 entalam) |
| 2 | laranja | círculo de raio 230 | ~166 000 | 0,30 | **4** (terços: 0,33 entalam) |
| 3 | maçã verde + vento | ovo suave, a 205 · b 194 · e 0,08 | ~125 000 | 0,40 | **3** (e nenhum menor que 0,12) |

A fruta maior pede mais pedaços com a **mesma** fresta: é a fase 2 que ensina que o número de partes depende do tamanho do problema.

## 7. O N1 — CORTAR NO TAMANHO CERTO

Assunto único: **dividir a fruta em pedaços que passem**. A fase 3 acrescenta o limite de baixo (o vento), que é o mesmo assunto visto do outro lado: nem grande, nem pequeno demais.

| Fase | Fruta | Vento | O que é novo |
|---|---|---|---|
| 1 | morango | — | tudo: a demonstração corta em 3 e entrega um pedaço; a criança leva os outros dois |
| 2 | laranja | — | a criança corta sozinha, e a fruta maior pede 4 |
| 3 | maçã verde | sim | pedaço pequenininho voa |

**Validação** (`validateLevels`, só em DEV):
- a fresta dividida pela área de cada fruta fica entre 0,25 e 0,45, e o mínimo de pedaços fica entre 2 e 5;
- o mínimo de pedaços da fase 2 é diferente do da fase 1;
- a fase 1 não tem vento, e o vento estreia com demonstração;
- os cortes da demonstração dão exatamente o mínimo de pedaços, todos passando na fresta (e acima do vento, se houver);
- nas fases com vento, dividir a fruta em partes iguais no mínimo de pedaços deixa folga de pelo menos 1,5× sobre o vento;
- a abertura da fresta passa a formiga com folga (2 × raio + 20 px) e é visualmente maior que o círculo do medidor no jardim;
- duas fases seguidas não repetem fruta.

## 8. Erro (a cena antes do `lose()`)

**O vento é o único erro de partida.** A formiga entra na faixa do vento com um pedaço menor que `MIN`: o pedaço sai rodopiando da cabeça dela e some pela borda de baixo, a formiga faz cara de "ops", a faixa diz *"Pequeno demais! O vento levou."*, e depois de ~2,4 s vêm `WRONG_ANSWER` e `lose()`, uma vez. Sem aquele pedaço, a fruta da rainha não fica inteira.

**Entalar não é erro de partida.** É a trava da ficha: o pedaço fica diante da fresta e a criança o corta ali mesmo. Cada entalo é contado e tira estrela (§10). Tratar o entalo como erro reprovaria justamente quem está aprendendo a lição do N2 (corta de novo quando ainda é grande).

## 9. Abertura e tutorial do N1 (uma vez)

Visual, com **mãozinha + legenda curta + zoom**. O balão do tutorial compartilhado fica só no `?`.

1. **Abertura** (`OPENING_KEY`): cabeçalho escondido, zoom na rainha. Ela levanta a patinha e o balão dela mostra o morango. Legenda: *TRAGA O MORANGO!*
2. A câmera vai até a fresta. Legenda: *SÓ PASSA PEDAÇO PEQUENO.* A câmera abre e o cabeçalho volta.
3. **Demonstração da fase 1** (sem balão): a mãozinha aperta o joystick na direção da fruta e a formiga anda sozinha até ela (*ANDE!*). A câmera aproxima, e a mãozinha passa o dedo duas vezes, de cima a baixo, dividindo o morango em três fatias (*CORTE!*). A mãozinha toca no ✓. A formiga pega uma fatia, atravessa a fresta e entrega (*LEVE PARA A RAINHA!*): a fatia se encaixa no contorno do prato.
4. *SUA VEZ!*: o joystick acende e a criança leva as outras duas fatias. **O que a demonstração fez conta.**
5. **Fase 2:** *AGORA VOCÊ CORTA!* Na primeira vez que o modo de corte abre, o medidor pulsa e a legenda diz *DESTE TAMANHO PASSA.*
6. **O primeiro entalo** (qualquer fase): *GRANDE DEMAIS!*, e no modo de corte da fresta a mãozinha percorre a linha tracejada sugerida, sem cortar.
7. **Fase 3, estreia do vento:** zoom na faixa do vento. Um farelinho da maçã sai rodopiando. Legenda: *PEQUENO DEMAIS VOA!* No modo de corte, o medidor ganha o circulozinho do vento.

Numa partida repetida, a abertura e as demonstrações não aparecem.

O `?` (em jogo) abre o balão com recorte: o joystick (*"Ande com o joystick."*), a fruta (*"Passe o dedo de um lado ao outro para cortar."*), a fresta (*"Pedaço grande não passa aqui."*), o vento quando houver (*"Pedaço pequenininho o vento leva."*) e a rainha (*"Leve todos os pedaços para a rainha."*).

## 10. Fim de fase e de nível

Acerto: o último pedaço se encaixa, os pedaços se fecham num brilho, a fruta inteira pula no prato, a rainha faz cara de feliz e o selo dela carimba o cartão do pedido (`CORRECT_ANSWER`, 10 pontos por fase). A fruta da próxima fase cai sob o arbusto, o prato troca de contorno e a rainha faz o novo pedido.

Na última fase: confete, `GAME_COMPLETED` (com `stage` = nível e `totalStages: LEVELS.length`) e `showLevelComplete`. **Estrelas pelos entalos do nível:** nenhum = 3, um ou dois = 2, três ou mais = 1. Enquanto o jogo tem só o N1, o painel traz JOGAR DE NOVO.

**Telemetria:** `CHECKPOINT` com `hits` = pedaços entregues e `errors` = pedaços levados pelo vento. Os entalos ficam nas estrelas.

## 11. N2 e N3 (pedidos em 21/10/2026)

O que vale para os dois níveis:

- **O vento vira medida fixa:** `WIND_AREA = 15 000` px² de arte, o que no N1 dá os mesmos 12 % da maçã. Uma folha grande não pode ter "12 % da folha" como farelo: o sexto da folha (47 mil) ficaria colado no vento (34 mil). `blows(a)` passa a comparar com `WIND_AREA`, sem a fruta inteira.
- **O prato tem escala própria por item:** `plateScale = min(0,30, 2 × PLATE.r × 0,9 ÷ maior diâmetro da silhueta)`. A fruta do N1 continua a 0,30, e a folha encolhe para caber no prato. O pedaço entregue cai no lugar de onde saiu, só que menor.
- **No modo de corte, o zoom se ajusta ao tamanho:** `zoom = min(CUT.zoom, 640 ÷ largura do item no mundo)`. A folha cabe na tela com o medidor à direita.
- **Estrelas:** no N2 o entalo é o caminho natural, então não custa estrela. No N2 e no N3, quem completa ganha 3 estrelas: o único erro é de partida, e ele leva ao `lose()`.
- `LEVELS = [N1, N2, N3]`. O fim do N1 e o do N2 passam sozinhos (`autoAdvance`), e o do N3 traz JOGAR DE NOVO.

### N2 — CORTA DE NOVO (a parte ainda é grande)

Uma **folha grande** caída ao pé do arbusto, no lugar da fruta. Entra o **peso** (`LIFT = 2,2 × CAP = 110 000`): a formiga não levanta pedaço maior que isso.

**As folhas** (convexas, vistas bem de cima, com o cabinho à esquerda e a ponta à direita, desenhadas no mesmo laço das frutas):
`x = −a·cos t`, `y = b·sen t·(1 + e·cos t)`, com `e = 0,12`. A base fica mais larga à esquerda, e a área é exatamente π·a·b.

| Fase | Folha | a × b (px de arte) | Área | ÷ 2 | ÷ 3 | ÷ 4 | ÷ 6 | ÷ 8 | Caminho natural |
|---|---|---|---|---|---|---|---|---|---|
| 1 | folha verde | 400 × 223 | 280 mil (5,6 CAP) | não levanta | levanta, entala | levanta, entala | **passa** | passa | **3, e cada parte em 2** |
| 2 | folha grande | 440 × 260 | 359 mil (7,2 CAP) | não levanta | **não levanta** | levanta, entala | entala | **passa** | **4, e cada parte em 2** |

A folha maior pede mais partes no primeiro corte e mais pedaços no fim. É o mesmo "o tamanho do problema decide" do N1, agora em dois andares.

**O laço** (o mesmo do N1, com três diferenças):
1. **PESADA!** A formiga encosta num pedaço maior que `LIFT` (inclusive a folha inteira, depois do primeiro ✓): ela empurra, treme (pose `push`) e a legenda diz *PESADA!*. Logo depois abre o modo de corte **ali mesmo**, só com aquele pedaço, com a linha tracejada sugerida e o ✓ apagado até o primeiro corte (igual ao entalo). Não é erro.
2. **O entalo** continua igual ao N1 (corta na fresta). No N2 ele é o caminho esperado, então não custa estrela.
3. **O cartão vira árvore.** Depois do primeiro ✓, o cartão mostra uma casinha por pedaço (1º andar). Quando um pedaço é cortado de novo (PESADA ou fresta), a casinha dele **se abre em duas** (ou mais), menores e penduradas por um tracinho embaixo da casinha-mãe (2º andar). Entregou, a casinha acende. Quando todas as filhas de uma mãe acendem, a mãe acende também, e no fim tudo se junta na folha. É a decomposição em dois níveis desenhada, e `header.replace(id, kids)` já faz quase tudo isso: falta desenhar o 2º andar.
- `MAX_PIECES` passa a 12 (o cartão comporta 12 casinhas em 868 px).
- **Medidor:** o círculo tracejado da fresta, o pontinho do vento e, só no N2, um **círculo maior em linha cheia com uma formiguinha dentro** = `LIFT` ("até aqui ela levanta").
- **Vento:** ligado nas duas fases (o farelo ainda voa; com `WIND_AREA` o sexto e o oitavo ficam longe dele).

**Abertura do N2 (uma vez, `guideKey(2)`)**, visual, com a mãozinha e legendas:
1. A rainha pede a folha (*TRAGA A FOLHA!*). O cartão mostra a folha.
2. **Demonstração:** a formiga anda até a folha, abre o corte, e a mãozinha faz 2 cortes **de cima a baixo** (terços, *CORTE!*), depois aperta o ✓. O cartão se parte em 3.
3. A formiga pega o terço da direita (levanta: é menor que `LIFT`), anda até a fresta e **entala** (*GRANDE DEMAIS!*). O pedaço vai ao chão e o corte abre, a mãozinha corta o terço ao meio na horizontal (*CORTE DE NOVO!*) e aperta ✓. A casinha do terço se abre em duas.
4. A formiga leva uma das metades pela fresta e entrega. *SUA VEZ!*, e o que a demonstração fez conta.
5. **PESADA** não tem demonstração: a criança descobre se tentar levar uma metade inteira (a legenda e o empurrão explicam).

**Validação (N2):** em cada folha, `÷2` não levanta; na folha 1, `÷3` levanta com folga de 10 % e entala, e `÷6` passa com folga de 5 %; na folha 2, `÷3` não levanta e `÷4` levanta com folga de 10 %, `÷8` passa; nenhum `÷8` voa; os cortes da demonstração dão 3 terços que levantam e entalam, e o corte do terço dá 2 metades que passam; o mínimo de pedaços da fase 2 é maior que o da fase 1.

**`?` no N2:** joystick, folha (*"Passe o dedo para cortar."*), formiguinha do medidor (*"Pedaço pesado: corte de novo."*), fresta, vento e rainha.

### N3 — PARTES DIFERENTES (a folha gigante)

Uma **folha gigante**, suja (gotas de orvalho, grãos de terra, raminhos e pétalas murchas por cima), pesada demais até para cortar, e o corte **não entra** no N3. O cartão do pedido se parte em **três tarefas diferentes**, desenhadas pelo código: 💧 **limpar** (uma gota), 🐜 **chamar as amigas** (uma casinha por amiga) e 🍃 **levar** (a folhinha).

| Tarefa | Como se faz | No cartão |
|---|---|---|
| **limpar** | a formiga encosta na folha: a câmera aproxima (modo **esfregar**, sem joystick), e a criança **esfrega** com o dedo. Cada sujeira apaga aos poucos (raspadinha: o dedo precisa passar ~70 px de tela por cima dela). Some a última, a folha brilha e a câmera volta sozinha. Tem ✓ para sair antes. | a gota acende quando a folha fica limpa |
| **chamar as amigas** | as amigas cochilam pelo jardim (zzz do código). A formiga encosta numa, ela acorda (pulinho), entra na fila e segue o rastro da formiga, uma atrás da outra, como os pontinhos de feromônio. | cada casinha de formiga acende quando aquela amiga acorda |
| **levar** | com **todas** as amigas na fila, a formiga encosta na folha: todas se espalham em volta dela, a folha sobe e o grupo anda junto, mais devagar (`carrySpeed × 0,7`). A folha não passa na fresta (ela é a fresta do N3): no muro, o grupo para (*NÃO PASSA!*) e uma fileira de pontinhos acende o **caminho largo**, no alto do muro. Chegando ao formigueiro, a folha vai ao prato. | a folhinha acende na entrega |

- **O caminho largo:** no N3 o muro não tem as duas pedras de cima (y 168 e 250). Fica uma passagem de y `MAP.top` até ~300, por onde a formiga também pode andar à vontade. A fresta continua no mesmo lugar.
- **Ordem livre:** limpar e chamar podem ser feitos em qualquer ordem, e intercalados (esfregar um pouco, sair pelo ✓, acordar uma amiga, voltar e esfregar mais). Só **levar** depende das duas, e a dependência vem do mundo:
  - encostar na folha **suja** abre **sempre** o esfregar, com ou sem amigas (quem acordou todas antes de limpar ainda limpa: a ordem é livre de verdade);
  - no esfregar, o ✓ com a folha ainda suja: faltando amiga, só fecha; **com todas as amigas**, o grupo ergue a folha suja ali mesmo (a criança disse "pronto" sem terminar);
  - encostar na folha **limpa** faltando amiga: a formiga empurra e a folha não se mexe (*PESADA!*), e as casinhas das amigas que faltam piscam uma vez. Não é erro. Com todas, o grupo ergue a folha.
- **Erro:** entregar a folha **suja**. A folha vai ao prato, a rainha faz cara de nojo (pose `calm` com tremidinha), a sujeira aparece grande, a faixa diz *"Folha suja! A rainha não quer."*, e depois vêm `WRONG_ANSWER` e `lose()`. Quem esqueceu uma parte do problema não resolveu o problema. Não há vento no N3 (sem pedaços, ele não teria função).
- **Fim da fase:** a folha limpa cai no prato, as três tarefas brilham e se juntam no cartão, e a rainha e as amigas comemoram (pose feliz). As amigas voltam a cochilar fora da tela antes da próxima fase.

| Fase | Sujeiras na folha | Amigas | Onde elas cochilam |
|---|---|---|---|
| 1 | 5 | 2 | as duas do lado da folha (esquerda do muro) |
| 2 | 9 | 3 | duas à esquerda e uma do outro lado do muro, perto do vento (a formiga atravessa a fresta sozinha para buscar) |

**Abertura do N3 (uma vez, `guideKey(3)`):**
1. A rainha pede a folha gigante (*TRAGA A FOLHA GIGANTE!*). O cartão mostra a folha e **se parte em 3 tarefas** com um estalo, e cada uma pulsa enquanto a câmera vai até ela:
2. zoom na sujeira da folha: *LIMPE!*; a mãozinha esfrega uma sujeira, que apaga (conta).
3. zoom numa amiga dormindo: *ACORDE AS AMIGAS!*;
4. zoom no caminho largo: *LEVEM JUNTAS!*. A câmera abre e vem o *SUA VEZ!*.

**Validação (N3):** amigas entre 2 e 3, sujeiras entre 4 e 10, todas as sujeiras dentro da silhueta da folha; as amigas não nascem dentro do muro, do vento, da folha nem do formigueiro; o caminho largo deixa passar o grupo com a folha (a altura da passagem é maior que a altura da folha no mundo + 20 px).

**`?` no N3:** joystick, folha (*"Esfregue para limpar."*), uma amiga (*"Encoste para acordar."*), caminho largo (*"A folha gigante passa por aqui."*) e rainha (*"Leve a folha limpa, com as amigas."*).

### Telemetria (N2/N3)

`CHECKPOINT` com `hits` = pedaços entregues (N2) ou tarefas concluídas (N3), e `errors` = pedaços levados pelo vento ou folha suja entregue.

## 12. O que mudou da ficha, e por quê

| Ficha | Aqui | Motivo |
|---|---|---|
| tocar nas linhas pontilhadas para dividir | cortar com o dedo, em linha reta, onde quiser | pedido do usuário; o tamanho das partes passa a ser decisão da criança |
| tocar na formiga e ela atravessa sozinha | a criança é a formiga e anda com joystick | pedido do usuário; resolver cada parte vira uma viagem de verdade |
| túnel em corte lateral | jardim visto de cima (3/4) | dá para ver o caminho inteiro, a fresta e o vento numa tela só |
| folha-coração, folha-vitral, pétala | N1 frutas, N2 folha 3 × 2, N3 folha gigante com tarefas | o N3 da ficha punia uma ordem de combinar; aqui a ordem é livre e só "levar" depende do resto |
| miolo antes das bordas (ordem forçada) | limpar e chamar em qualquer ordem | a BNCC aceita intercalar |
| formiguinha pequena que só carrega pedaço pequeno | o vento (pedaço pequeno demais voa) | a formiguinha pequena empurrava para cortar menor; o vento dá **custo a cortar demais**, e sem ele cortar em farelo sempre ganhava |
| relógio da fila e pedaço menor mais rápido | sem relógio | toda fase sem tempo; cortar menor não pode ser sempre melhor |
| TRAVA com cadeado em todo erro | entalo = trava (custa estrela); vento = `lose()` | errou, perdeu, só onde a criança tinha como saber antes (o vento tem demonstração e medidor) |
| +10 por pedaço, +5 após trava | 10 por fase, estrelas pelos entalos | padrão da plataforma |
| TÍTULO → exemplo 5 s → JOGO → RESULTADO | abertura com zoom, demonstração e `?` | fluxo da plataforma |

## 13. Dados e arquivos

```
index.ts  types.ts
data/   files.ts layout.ts theme.ts timing.ts fruits.ts geometry.ts levels.ts words.ts
scenes/ BootScene.ts GameScene.ts fallback.ts art.ts audio.ts view.ts
        garden.ts ant.ts queen.ts pieces.ts cutter.ts joystick.ts
        header.ts hand.ts caption.ts banner.ts guide.ts
        giant.ts friends.ts            (N3)
```

- `fruits.ts` guarda todos os itens cortáveis (`ITEMS`: as frutas e as duas folhas), as medidas `CAP`, `WIND_AREA`, `LIFT`, `plateScale` e a silhueta da folha gigante. `cutting.ts` tem `fits`, `lifts`, `blows` e `hintLine` (a linha sugerida, a mesma que a validação usa).
- `giant.ts` é a folha gigante com a sujeira num container só (erguida ou no prato, vão juntas) e o esfregar em raspadinha. `friends.ts` são as amigas: cochilo com zzz, fila pelo rastro e a roda em volta da formiga carregando.
- O cartão do cabeçalho tem três jeitos: fila de casinhas (N1), árvore com a mãe em cima e as filhas penduradas (N2) e as três tarefas (N3).

- `geometry.ts` corta polígono convexo por reta, mede área e centro, e testa se o traço atravessa o pedaço de ponta a ponta.
- Cada pedaço guarda o polígono **nas coordenadas da fruta inteira** (é o que faz ele cair no lugar certo do prato) e vira uma textura própria: a arte da fruta recortada pelo polígono, com a polpa desenhada só nas bordas de corte.
- **Arte:** o N1 roda inteiro com a **arte de reserva** em Graphics, assada nas mesmas folhas, grades e ordem de células do TEXTURAS (`scenes/fallback.ts`). Um PNG com o mesmo nome em `src/assets/games/EF15CO04/operacao-formiga/` substitui a reserva sem mudar código. O cabeçalho, o cartão do pedido, o joystick, o ✓, o medidor, o traço do corte, a polpa, o contorno tracejado, o vento, o feromônio, as legendas e a mãozinha são sempre do código.

## 14. Dúvidas

1. **Linha de arte.** O TEXTURAS usa a mesma linha da Ventania na Floresta (`references/35-chibi-voador.webp`), porque os dois jogos têm formigas, jardim e vento. Se for outra, os prompts trocam só o bloco STYLE e o negativo.
2. **O medidor.** Comparar uma fatia com um círculo é aproximado. Se a criança não usar o medidor, a troca é marcar com ✓ verde, depois de cada corte, os pedaços que já passam (isso deixa o N1 mais fácil e tira quase todo entalo).
3. **Entalo sem perder.** A partida só acaba no vento. Se o N1 ficar fácil demais, o entalo pode virar erro a partir do N2, quando a fresta já é conhecida.

## Histórico

- 21/10/2026: plano, TEXTURAS e N1 em Graphics. Id 135 no catálogo (order 457), `NEXT_FREE_ID` = 136. Servidor `jogos-dev-formiga` (porta 5335). `LEVELS = [N1]` por enquanto, então o painel final traz JOGAR DE NOVO.
- Conferido no navegador embutido, com o painel escondido (o laço do Phaser foi tocado à mão pelo console, em tempo simulado): abertura, demonstração inteira (andar, cortar em 3, entregar), as duas fatias restantes levadas pelas setas, fruta remontada no prato e cartão se juntando; laranja cortada em 4 com o dedo, pedaço de 56 mil px² entalando na fresta, corte pela linha sugerida e o cartão indo a 5 casinhas; maçã com casquinha de 9 % voando no vento (`WRONG_ANSWER` e `GAME_OVER` saem); `?` e painel final (2 estrelas com 1 entalo). `tsc` sem erro novo, `eslint` limpo nos arquivos do jogo.
- Ajustes depois do teste: o corte vale assim que a câmera chega (o medidor pulsando e a mãozinha da fresta corriam antes e prendiam o dedo por ~1,5 s); o medidor subiu para não ficar atrás da formiga; a formiga pega o pedaço pelo meio do corpo, não pelo pé; o arbusto foi para o chão (os pedaços que se espalham para cima sumiam atrás dele); as listras do vento acendem de verdade e os dentes-de-leão ficam dentro da faixa.
- 21/10/2026 (Ferro): N2 e N3 em código, como no §11, com arte de reserva para `folhas`, `folha-gigante`, `sujeira` e `amigas` (a amiga é a formiga da reserva em verde-oliva, com laço, cochilo e bocejo). `LEVELS = [N1, N2, N3]`. O N1 só mudou no que o §11 manda (vento fixo de 15 mil, prato e zoom por item) e continua igual na tela. Demonstração do N2: cortes em x −120 e +100 (px de arte), terços de 93, 94 e 89 mil. O corte do terço é a própria linha sugerida (`hintLine`).
- Jogado no Chrome headless pelo CDP, com joystick e dedo de verdade (eventos de mouse), no servidor da 5173:
  - **N2:** a demonstração inteira e as duas fases. Na fase 1, os terços entalando e cortados na fresta, e o cartão em árvore com a mãe acendendo junto das filhas. Na fase 2, o ✓ sem corte e a folha inteira dando PESADA!; o corte ali mesmo em 4, cada quarto entalando e cortado em 2, e 8 pedaços entregues. O N2 passa sozinho para o N3.
  - **N3, fase 1:** a abertura, acordar uma amiga, esfregar um pouco e sair pelo ✓, voltar e limpar tudo (a câmera volta sozinha), PESADA! com uma amiga faltando, acordar a outra, erguer, NÃO PASSA! na fresta com os pontinhos acesos e o caminho largo até a rainha.
  - **N3, fase 2:** limpar tudo primeiro e depois acordar as três (uma do outro lado do muro), até o "Nível 3 completo!" com 3 estrelas e JOGAR DE NOVO.
  - **Um erro de cada:** o vento no N2 e a folha suja no N3, cada um com um `WRONG_ANSWER` e um `GAME_OVER`. Também o `?` do N2 e do N3, e a abertura, a demonstração e a fase 1 do N1.
  - `tsc` sem erro no jogo e `eslint` limpo.
- Ajustes vistos na tela:
  - No corte da folha, a formiga vai para baixo dela, porque ficava em cima da ponta; o mesmo vale para o recuo depois do entalo no N2.
  - A folha gigante erguida subiu (`GIANT.lift` 112), porque escondia as carregadoras.
  - A faixa da folha suja desceu (`BANNER.lowY`) para a sujeira grande aparecer no prato.
  - O joystick some durante a abertura do N3.
- Furo da ordem livre corrigido pela regra nova do §11: folha suja sempre abre o esfregar. No ✓ com sujeira, faltando amiga só fecha; com todas, o grupo ergue a folha suja ali mesmo. Folha limpa sem todas = PESADA!; limpa com todas = ergue. Testado no headless: (1) acordar as 2 amigas, encostar (abre o esfregar), limpar até o fim, encostar de novo, levar = `CORRECT_ANSWER`; (2) acordar as 3, encostar, ✓ com 9 sujeiras, o grupo ergue e entrega = um `WRONG_ANSWER` e um `GAME_OVER`. `tsc` e `eslint` limpos.
- Com a arte final: no N2, o pedaço na cabeça encolhe até 70 px no maior lado (`ANT.carryMax`) e sobe até a base dele ficar nas mãos, então a formiga aparece. No chão e no prato, o pedaço volta à escala real. O tracejado da folha no prato era verde-claro sobre o prato verde e passou a verde-escuro. No N3, a sujeira foi para 54 px de célula (`GIANT.dirtW`), uns 38 px de desenho, e o dedo pega num raio de 26. As células reais do MANIFEST batem com o código: palmas em (110, 40), nada acima de y 28 e o pedaço em (110, 34), na formiga e nas amigas. Conferido no headless com os PNGs: o terço na cabeça (54 × 73 px), o entalo devolvendo a escala 0,30, o tracejado no prato, a sujeira visível de longe e as amigas carregando a folha.
