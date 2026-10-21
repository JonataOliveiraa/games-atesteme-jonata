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
| **vento** (`MIN`) | 12 % da fruta da fase | pedaço menor que isso voa |
| **farelo** | 4 % da fruta | corte que deixaria um pedaço menor não acontece |
| **peso** (`LIFT`, N2) | a definir no N2 | pedaço maior não sai do chão |

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

## 11. N2 e N3 (planejados; só entram quando o usuário pedir)

### N2 — CORTA DE NOVO (a folha em 3, cada parte em 2)

Uma **folha grande** presa ao pé de uma planta. Entra o **peso** (`LIFT`): a formiga não levanta pedaço maior que isso. A folha inteira não sai do chão; um terço sai, mas não passa na fresta; a metade de um terço passa.

- A folha é desenhada para que o caminho natural seja **3 partes, e cada parte em 2**: área da folha ≈ 5,6 × `CAP`, `LIFT` ≈ 2,2 × `CAP`. A metade da folha não levanta, o terço levanta e entala, o sexto passa.
- **O cartão do pedido vira uma árvore:** a folha se parte em 3 cartões, e cada cartão se parte em 2 casinhas quando aquela parte é cortada. É a decomposição em dois níveis, desenhada.
- Cortar tudo em 6 já na planta também vale: o jogo aceita qualquer divisão em que todo pedaço levante, passe e não voe. Quem corta só em 3 aprende na fresta.
- O vento continua (o farelo ainda voa), e a fresta fica no mesmo lugar do N1. O único eixo novo é "corta de novo".
- Fases: 2 folhas (a segunda com a fresta mais estreita, pedindo 3 × 3).

### N3 — PARTES DIFERENTES (a folha gigante)

Uma **folha gigante**, suja (gotas de orvalho e grãos de terra por cima) e pesada demais até para cortada. O cartão do pedido se parte em **três tarefas diferentes**, com ícone: 💧 limpar, 🐜 chamar as amigas, 🍃 levar.

| Tarefa | Como se faz |
|---|---|
| **limpar** | a câmera aproxima e a criança **esfrega** a folha; a sujeira apaga por onde o dedo passa (raspadinha) |
| **chamar as amigas** | andar com o joystick até as formigas que cochilam pelo jardim e encostar nelas; cada uma acorda e entra na fila atrás da formiga |
| **levar** | com a folha limpa e as amigas juntas, a formiga encosta na folha e todas carregam juntas, pelo **caminho largo** (a folha não passa na fresta) |

- **Limpar e chamar podem ser feitos em qualquer ordem, e intercalados** (a BNCC diz que dá para intercalar os passos). Só **levar** depende das outras duas, porque não tem como carregar sem as amigas. A dependência vem do mundo: sozinha, a formiga empurra e a folha não se mexe (*PESADA!*), sem erro.
- **Erro:** entregar a folha **suja**. A rainha recusa (*"Folha suja!"*), e aí vêm `WRONG_ANSWER` e `lose()`. Quem esqueceu uma parte do problema não resolveu o problema.
- O único eixo novo é "partes diferentes": a fresta e o vento continuam no jardim, e o corte não entra no N3.
- Fases: 2 folhas (a segunda com mais sujeira espalhada e 3 amigas em vez de 2).

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
```

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
