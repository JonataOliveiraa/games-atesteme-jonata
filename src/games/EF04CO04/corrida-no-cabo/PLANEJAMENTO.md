# Corrida no Cabo — planejamento

Jogo **116** (o 115 foi para a Fábrica de Estampas, de outra sessão) · EF04CO04 · 4º ano · Mundo Digital · 3ª rodada.
Documento irmão: [TEXTURAS.md](./TEXTURAS.md). Ficha: `docs/rodada-3/EF04CO04.md` (*Escalada Binária*), com a mudança pedida pelo usuário em 13/10/2026: **o gênero é corrida**.

**Réguas, nesta ordem:**
1. **O mais fácil possível, com o objetivo claro.**
2. **O mundo em escala real:** dois computadores normais ligados por um fio **fino**. O jogo entra no fio por zoom.
3. **Cada número é um toque.** 1 ou 0, nunca "não fazer nada".
4. **O código sai do combinado e fica à vista no visor** (pedido do usuário): em todo envio o cartão pula, os números voam para o notebook e aparecem esmaecidos nas caixinhas. A criança segue a sequência.
5. **Rápido e simples:** tutorial de 2 balões, sem linha de pontinhos, sem personagem, sem cenário.
6. **Um nível, um assunto.**

Regras fixas da rodada:
- **1 erro encerra** (`WRONG_ANSWER` + `lose()`, com a cena do erro antes);
- `createTutorial`, com balões curtos e recorte, sem mãozinha;
- sem quadro de resumo no fim;
- "faça o jogo" = **só o N1**;
- PC com teclado, sem etiqueta de tecla na tela.

---

## 1. O jogo em uma frase

Na mesa, um notebook e um computador estão ligados por um fio fino, que cede entre as duas mesas. No alto, a ordem: *"Mande ⭐"*. A criança acha a ⭐ no **combinado** (⭐ = 1011). Um sinal sai do notebook, e a câmera **mergulha no fio** até ele virar um tubo grande. Dentro dele o carrinho corre, e cada **portal** tem uma janela **1** em cima e uma janela **0** embaixo: passar por uma janela escreve aquele número. No fim do fio a câmera sai, e o computador da direita guarda os números, procura no mesmo combinado e mostra a estrela.

## 2. A habilidade

> **(EF04CO04)** Entender que para guardar, manipular e transmitir dados deve-se codificá-los de alguma forma que seja compreendida pela máquina (formato digital).

| O que a BNCC pede | Onde acontece |
|---|---|
| **codificar** para a máquina (formato digital) | a figurinha não viaja; quem viaja são os números. A criança transforma a ⭐ em 1011 passando por quatro janelas |
| **transmitir** | o código vai pelo fio, de um computador ao outro (o mergulho mostra o que acontece dentro dele) |
| **guardar** | na chegada, os números entram na memória do computador e acendem um por um |
| **manipular** e "compreendida pela máquina" | o computador procura os números no **mesmo combinado**, cartão por cartão, e desenha a figura. Se o código não está no combinado, a tela chia com um "?": a máquina não entende |
| exemplo oficial (ASCII) | o N2 usa os 5 últimos números do ASCII de cada letra; o N3 usa o código ASCII inteiro, de 8 números (A = 01000001, que é o 65 do exemplo) |

**O teste da bolinha:** se as figurinhas e o combinado virassem bolinhas sem significado, não haveria código a escrever, porque é a tabela que liga cada figura aos seus números. E sem o combinado o outro computador não entenderia nada. Essa é a lição.

**Os irmãos (mesma habilidade):**

| Jogo | O que a criança faz |
|---|---|
| *Tradutor da Máquina* (026) | traduz letras em números (ASCII) somando chaves |
| *Pista Binária* (071) | atira 1 no quadradinho cheio e 0 no vazio, e o desenho se forma pixel a pixel |
| **Corrida no Cabo** (este) | **manda** uma figura pelo fio, escrevendo o código com o carrinho, e vê a outra máquina ler com o mesmo combinado |

**Outras corridas do catálogo:** a *Corrida dos Parecidos* (EF01CO01) e a *Corrida do Cotidiano* (EF02CO05) usam a faixa para responder uma pergunta. Aqui a faixa **é** o número, e a fila de faixas é o código.

## 3. O que mudou da ficha, e por quê

| Ficha | Aqui | Motivo |
|---|---|---|
| escalada: agarra da esquerda = 0, da direita = 1 | **corrida dentro do fio**: janela de cima = 1, de baixo = 0 | pedido do usuário (gênero corrida). Em cima/embaixo desenha o próprio sinal |
| a fita mostra o código pronto, com o dígito da vez destacado (e seta no N1) | a ordem mostra só a **figura**; o código está no **combinado**, à vista e sem destaque | com a fita pronta, a criança copia sem codificar nada |
| a bandeira decodifica no topo ("1011 = ESTRELA") | o outro computador guarda, procura no combinado e desenha | com códigos arbitrários e sem tabela, a decodificação parecia mágica. O combinado à vista é o motivo |
| códigos de 4, 6 e 8 dígitos; foguete 10110, sol 011010 | N1 com 4 números, N2 com 5 (letras), N3 com 8 (ASCII de verdade) | a tabela da ficha não batia com os níveis. 8 números = 1 byte = o exemplo da BNCC |
| tabela de letras A=0001, E=0101, I=1001 | letras com o código ASCII | a tabela da ficha não era ASCII, que é o exemplo oficial |
| N2: escolher entre 2 fitas; N3: neblina para memorizar | N2: letras e palavras; N3: o código de verdade | escolher fita repete a decisão do N1, e a neblina mede memória, que é outro assunto |
| TRAVA com cadeado, +5, a agarra certa acende depois de 2 travas | **1 erro encerra**, com a cena do computador lendo errado | regra da rodada |
| exemplo animado de 5 s, tela de título, álbum, estrelas | tutorial de 2 balões com demonstração; `showLevelComplete` | fluxo da plataforma; sem quadro de resumo |
| som grave = 0, agudo = 1 | mantido | a ficha acertou: o som também é o número |

## 4. O laço

```
MESA (vista geral, escala real)
  ordem no alto: "Mande ⭐ = [ ][ ][ ][ ]"; o notebook mostra a ⭐
  um sinal sai da porta do notebook e corre pelo fio fino
  a câmera mergulha no fio (zoom ~21×, girando junto com o fio) → o fio vira o tubo
DENTRO DO FIO
  o painel 1/0 aparece à esquerda
  um portal vem vindo: janela 1 em cima, janela 0 embaixo, divisória no meio
  a criança lê o próximo número no combinado e toca 1 ou 0
    ├─ tocou antes → o carrinho muda de faixa e passa embalado (chaminha)
    └─ não tocou → o carrinho freia antes do portal e ESPERA (sem relógio)
  passou pela janela → ela acende (1 amarela, 0 azul), bip agudo ou grave,
  o número entra no visor do alto, e o carrinho volta para o meio
  depois do último portal o carrinho entra no conector
MESA de novo (a câmera sai do fio no computador da direita)
  os números entram na memória do computador, um por um        → guardar
  os cartões do combinado acendem um por um até achar o código   → ler
  a figura voa do cartão para a tela do computador               → aparece
    ┌──────────────────────────┬──────────────────────────────────────────┐
  igual à ordem               diferente
  brilho; CORRECT_ANSWER      a tela mostra o que chegou (outra figura, ou "?" chiando);
                              faixa grande; WRONG_ANSWER + lose()
  3 envios → bolinha acende → o fio se torce noutra forma → próxima fase
  3 fases → confete → showLevelComplete
```

**O carrinho espera.** Se chega perto do portal sem escolha, ele freia e fica parado. Não há relógio, batida nem queda.

**Cada número é um toque.** Depois de cada portal o carrinho volta para o meio, e a divisória não deixa passar sem escolher. Assim "1 1" são dois toques, e "não tocar" nunca vira número (lição da Pista Binária).

**Dá para trocar antes da trava.** Até perto do portal, tocar de novo troca a faixa. O visor mostra o número em cinza e ele fica firme quando o carrinho passa. Um toque dado na travessia vale para o portal seguinte.

## 5. A tela (1280 × 720)

| Região | Onde | O quê |
|---|---|---|
| **cabeçalho, faixa 1** (y 0–82) | nível + bolinhas à esquerda, a ordem no meio exato (640), `?` à direita | bolinhas = as 3 fases; ordem = *"Mande"* + a figura + "=" + as caixinhas do visor |
| **cabeçalho, faixa 2** (y 82–164) | rótulo "Combinado" à esquerda, os 4 cartões espalhados por igual no resto | o combinado: figura + código |
| **mesa** (vista geral) | do y 180 ao chão (690) | parede e chão lisos; notebook na mesinha da esquerda, computador na da direita; o fio fino entre eles |
| **dentro do fio** | fundo liso da cor da parede | o tubo, os portais com o 1 e o 0, o carrinho; o conector no fim. **Nada mais** |
| **painel 1/0** | x 14–170, y 352–688 | só aparece dentro do fio; 1 em cima, 0 embaixo, como as janelas |

Só os botões 1 e 0 aceitam toque, e só dentro do fio. **PC:** teclas 1/0, W/S e ↑/↓; `window.focus()` no `pointerdown` do canvas.

## 6. O fio e o mergulho

- **A mesa está em escala real:** os computadores têm o tamanho normal deles, e o fio tem 7 px de espessura.
- **O fio da mesa é o próprio tubo encolhido**: a mesma textura, na escala 7/150. Por isso, no mergulho, ele vira o tubo da corrida sem troca de desenho. O zoom vai até 150/7 ≈ 21×, a câmera gira para o fio ficar deitado, e nos últimos 45 % o tubo da corrida aparece por cima.
- **O fio da corrida tem a forma do fio da mesa:** o comprimento do fio (a partir de 30 %) vira o x, e a altura dele vira a altura do tubo (y 330–520). Cada fase tem um fio diferente:

| Fase | Fio na mesa | Dentro do fio |
|---|---|---|
| 1 | cai numa barriga só entre as mesas | uma descida longa e uma subida |
| 2 | sobe um pouco, faz uma curva e cai fundo | uma lombada e depois um vale |
| 3 | em ondas | sobe e desce várias vezes |

- Na troca de fase o fio da mesa se desfaz e reaparece com a forma nova, antes do próximo mergulho.
- **`validateLevels` confere cada fio:** não pode encostar no chão; a curva mais fechada da corrida tem de ter raio ≥ 90 px (para o tubo não dobrar); e o fio da corrida tem de caber os 4 portais com folga.

## 7. O combinado

**N1: figurinhas, 4 números**

| Figura | Código | Por quê |
|---|---|---|
| ⭐ estrela | 1011 | da ficha |
| ❤️ coração | 0110 | da ficha |
| ☀️ sol | 1111 | difere da estrela em 1 número: um número trocado vira outra figura |
| 🚀 foguete | 0100 | difere do coração em 1 número |

**N2: letras, 5 números** (os 5 últimos do ASCII): A 00001 · I 01001 · L 01100 · O 01111 · S 10011 · U 10101. Palavras: OI · SOL · LUA.

**N3: o ASCII de verdade, 8 números**: A 01000001 · I 01001001 · L 01001100 · O 01001111 · S 01010011 · U 01010101. Palavras: OI · ASA · LUA. Todos começam com **010**.

## 8. Introdução (só no N1, uma vez) e as ajudas fixas

Cada passo é uma **animação com um balão curto**, que espera o botão. A história tem de ficar clara: a figura não passa no fio, só passa o código dela.

1. **Mesa inteira acesa:** *"O fio liga os computadores."* [Próximo]
2. **A estrela sai da tela do notebook**, vai até a entrada do fio, bate e volta. Balão com o recorte no notebook: *"A estrela não passa no fio."* [Próximo]
3. **O cartão da ⭐ pula**, e os números 1, 0, 1, 1 voam dele até a tela do notebook, onde a estrela vira **1011**. Balão com o recorte no cartão e no notebook: *"Só passa o código da estrela: 1 e 0."* [Ver]
4. **O sinal sai e a câmera mergulha.** O sinal vira o carrinho. Balão com o recorte nele: *"O carrinho leva o código pelo fio."* [Próximo] Depois o carrinho para no 1º portal com o balãozinho "1 ou 0?". Balão com o recorte nos botões e no portal: *"Em cada portal, toque 1 ou 0."* [Ver] Depois o jogo toca 1, 0, 1, 1 (um anel em cada botão).
5. **A câmera sai no computador**, que guarda 1011, procura no combinado e mostra a estrela. Balão com o recorte na tela: *"O outro computador leu o código!"* [Próximo] Esse envio conta.
6. **No envio seguinte, depois do mergulho:** *"Sua vez! Teclado: 1 e 0."* [Vamos começar!]

**Em todo envio (não só no tutorial):** o cartão da figura pula, os números voam dele para o notebook (a figura vira o código) e aparecem esmaecidos nas caixinhas do visor. Quando o carrinho passa por uma janela, a caixinha fica com o número colorido.

**Ajudas fixas:**
- **"1 ou 0?"**: um balãozinho em cima do carrinho enquanto ele espera num portal; some quando ela toca.
- **A caixinha da vez no visor** fica contornada de branco, para mostrar em que número do código ela está.

**Sem linha de pontinhos.** O `?` pausa a corrida e mostra 2 balões: *"Siga o código, número por número."* e *"Toque 1 ou 0 em cada portal."*

## 9. Níveis (`data/levels.ts`)

```ts
type Entry = { id: string; code: string; frame: number }
type Level = { bits; table: Entry[]; phases: string[][]; shapes: number[]; gap; cruise }
const SHAPES: Point[][]                     // os pontos do fio de cada fase, na mesa
const decode = (sent, table) => Entry | null
```

| Nível | Assunto | Combinado | Fases |
|---|---|---|---|
| **1, a figurinha vira código** | mandar uma figura escrevendo o código dela | 4 figuras × 4 números | ⭐ ❤️ ☀️ · 🚀 ⭐ ❤️ · ☀️ 🚀 ⭐ (portal a cada 500 px, 260 px/s) |
| **2, o texto também vira código** | a palavra vai letra por letra, e cada letra é um envio | 6 letras × 5 números | OI · SOL · LUA |
| **3, o código de verdade** | as mesmas letras, no código que todo computador usa | 6 letras × 8 números (ASCII) | OI · ASA · LUA |

**`validateLevels`:** códigos de `bits` números, sem repetir; um par a 1 número de distância; cada figura ≥ 2 vezes e nunca duas seguidas; a 1ª é a ⭐; um fio por fase, e cada fio passa nas três checagens do §6. (N2/N3, quando entrarem: código das letras calculado do ASCII, e no N3 todos começam com 010.)

**N2 e N3, como ficaram (13/10/2026):**
- **cada fase é uma palavra, e cada letra é um envio** (uma corrida). A ordem mostra a palavra: a letra que já foi fica verde, a da vez fica sublinhada e as próximas ficam apagadas;
- **o combinado da fase traz só as letras da palavra** (2 ou 3 cartões largos, em ordem alfabética), para os 8 números caberem legíveis. O computador procura nesse combinado;
- **o computador monta a palavra:** as letras recebidas ficam na tela dele (O → OI);
- **introdução curta:** no N2, *"Agora, uma palavra: OI!"* e, depois que o O vira código, *"Cada letra tem seu código."*; no N3, o 010 de todos os cartões acende, com *"Agora, o código de verdade!"* e *"Todo computador usa este código."*;
- o fio de cada fase continua com uma forma própria: N2 usa os fios 2, 3 e 1; N3 usa os fios 3, 1 e 2;
- validação: o código de cada letra é calculado do ASCII, todos os do N3 começam com 010, as palavras têm 2 ou 3 letras e usam todas as letras do nível.

## 10. Erros (a cena antes do `lose()`)

| Erro | O que se vê | Faixa grande |
|---|---|---|
| código fora do combinado | os cartões acendem um por um e nenhum serve; todos tremem; a tela do computador chia com um "?" grande | *"1110 não está no combinado. O computador não entende!"* |
| código de outra figura | o cartão do sol acende e o sol voa para a tela; no visor e na memória o número trocado treme, e no cartão pedido o número certo acende | *"Um número trocado, e a estrela virou sol!"* |

Sem som áspero, só um "blom". A cena dura ~2,6 s antes do `lose()`.

## 11. Fim de envio, fase e nível

- **Fim de envio:** brilho na tela do computador; a ordem seguinte aparece na mesa.
- **Fim de fase:** a figura pula, uma bolinha do HUD acende, e o fio da mesa se torce na forma da próxima fase.
- **Fim de nível:** confete e `showLevelComplete`. Sem quadro de resumo.

## 12. Arquivos e registro

**Código** (`src/games/EF04CO04/corrida-no-cabo/`):
- `types.ts`, `index.ts`;
- `data/{levels,path,words,layout,theme,files}.ts`: `path` é a geometria pura dos dois fios (Catmull-Rom e reamostragem por comprimento);
- `scenes/{BootScene,GameScene,desk,tube,race,car,controls,table,order,banner,hud,guide,audio,art,fallback}.ts`:
  - `desk` é a mesa e o fio fino, com as telas dos dois computadores;
  - `tube` é a corrida dentro do fio (`Rope` com a textura do tubo, portais e conector);
  - `race` é a regra da corrida.

O jogo roda antes da arte, com reserva em `Graphics` nas mesmas folhas. O motor usa o `car1.mp3` do Manobrista (copiado para a pasta). Os bips são WebAudio. O `Rope` só desenha em WebGL, que é o modo do `Phaser.AUTO` nos aparelhos da escola.

**Texturas** (prompts no [TEXTURAS.md](./TEXTURAS.md)): `pista` (tubo, conector, portal, brilhos, sinal), `aparelhos` (notebook e computador nas mesinhas), `pecas` (carrinho de lado, figurinhas), `ui` (quadro, cartão, caixinha, botões, painel) e a capa. Não há fundo nem personagem.

**Registro:** id **116** (o `NEXT_FREE_ID` foi para 117), slug `corrida-no-cabo`, Mundo Digital, ordem 267, `gameInstructions` e `GAMES_WITH_IN_GAME_COMPLETION_SCREEN`. Capa (`thumbnail`) e `public/og/corrida-no-cabo.jpg` registrados em 13/10/2026.

## 13. Travas para quem mexer depois

- **Escala real na mesa:** fio fino entre computadores de tamanho normal. O tamanho de jogo só existe dentro do fio, depois do zoom.
- **O fio da mesa usa a textura do tubo**, na escala `DESK.cable / PLAY.tube`. Se trocar uma, troque a outra junto, senão o mergulho dá um pulo.
- **Nada de cenário** na mesa nem dentro do fio, e nada de personagem.
- **O código a seguir aparece esmaecido no visor** em todo envio (decisão do usuário). Ele sempre sai do cartão do combinado com a animação, nunca do nada. Nada de linha de pontinhos.
- **Cada número é um toque**, e o carrinho espera antes do portal.
- **As cores são do número, não da resposta:** 1 é amarelo e 0 é azul em todo lugar.
- **O veredito é o `decode` na chegada**, comparado à ordem.

## 14. Dúvidas

1. **Linha de arte.** Os prompts estão na **chibi voador, com a `35` anexada**, como na Etiqueta Certa. A alternativa é a **Muse Dash** (neon doce). Se trocar, mudam só os blocos STYLE e o negativo.
2. **N2 e N3.** Planejei letras com o ASCII, porque é o exemplo oficial e mantém um gesto só. A alternativa para o N3 é **a volta**: o outro computador responde em código, e a criança decifra.

## Histórico

- **13/10/2026:** plano a partir da ficha *Escalada Binária*, no gênero escolhido pelo usuário: **corrida** (entre corrida no cabo e o farol dos espiões).
  - Motivo: a ficha repetia o *Tradutor da Máquina* (026) e a *Pista Binária* (071), e a criança só copiava um código pronto.
- **13/10/2026:** N1 feito em Graphics, com uma pista reta vista de cima, a Duda numa videochamada e linhas de pontinhos no tutorial.
- **13/10/2026, refeito a pedido do usuário** (*"a ui toda bagunçada"*):
  - **a pista virou um fio fino de verdade**, cedendo entre dois computadores normais, e o jogo entra nele por zoom (*"o cabo deve ser pequeno conectando um pc com outro normalmente… daria zoom no cabo até parecer visivelmente grande"*);
  - **cada fase tem o fio torcido de um jeito**;
  - **sem cenário** (*"não coloque árvores e nem nada no ambiente"*);
  - **sem personagem** (a Duda saiu);
  - **tutorial de 2 balões, sem a "cobrinha de bolinhas"**;
  - **os botões ganharam um painel próprio**, que só aparece dentro do fio.
- **13/10/2026, texturas entregues e encaixadas** (medidas no `MANIFEST.md`):
  - o tubo passou a 190 px, com as faixas a ±34, para o carrinho correr no miolo claro e passar no meio das janelas do portal;
  - o portal escala pela distância entre as janelas, e o carrinho entra no conector, não na ponta;
  - a `ui` veio em duas folhas (`ui1`, `ui2`).
- **13/10/2026, cabeçalho reorganizado** (*"ui no header ta mt desorganizada"*): no lugar das caixas soltas (ordem e combinado com larguras e centros diferentes, rótulo pendurado), um cabeçalho de ponta a ponta em duas faixas com as cores da arte. Na faixa 1 ficam o nível, a ordem centralizada e o `?`; na faixa 2, o rótulo e os cartões em espaçamento igual.
- **13/10/2026, introdução refeita** (*"falta clareza no jogo e introduções melhores, o jogador não sabe bem o que tá acontecendo"*): a introdução virou uma história de 5 passos, cada um com animação: o fio liga os computadores; a estrela não passa; o código sai do combinado e vira 1011 no notebook; em cada portal, 1 ou 0; o outro computador leu o código. Entraram também as duas ajudas fixas, o balãozinho "1 ou 0?" e a caixinha da vez contornada.
- **13/10/2026, o carrinho e o código a seguir** (*"falta introdução pro carro. e toda fase deveria indicar qual código devemos seguir a sequência"*):
  - no tutorial, o sinal vira o carrinho e entra o balão "O carrinho leva o código pelo fio.";
  - em todo envio, o código da figura sai do cartão, vira o código no notebook e fica esmaecido no visor (caixinhas maiores, 56 px);
  - a criança deixou de procurar o código sozinha: a escolha foi pela clareza.
- **13/10/2026, N2 e N3 feitos, e a capa registrada:**
  - letras com o código ASCII, 5 números no N2 e 8 no N3;
  - o combinado de cada fase só com as letras da palavra, e a palavra montada no computador;
  - erro com letra: *"Chegou a letra O! A letra I é 01001001."*
