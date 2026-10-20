# Pit Stop da Chuva — planejamento

Documento irmão: [TEXTURAS.md](./TEXTURAS.md)

**EF05CO04 · 5º ano · Pensamento Computacional · Algoritmos com seleção condicional** · id **123** · pasta `src/games/EF05CO04/pit-stop-da-chuva/`

> **(EF05CO04)** Criar e simular algoritmos representados em linguagem oral, escrita ou pictográfica, que incluam sequências, repetições e seleções condicionais para resolver problemas de forma independente e em colaboração.

Pedido do usuário (15/10/2026): a ficha *Faroleiro Esperto* repetia a Cidade das Decisões (034) e o Robô Sorrateiro (079). Ele escolheu o Pit Stop e mandou fazer o N1 em Graphics.

**Redesenho (20/10/2026).** Depois de ler a primeira versão (a criança só tocava o carrinho a cada parada), o usuário pediu:

> *"o jogador deve dirigir o carro, tendo botão de acelerar e frear, e botão de trocar pneu. o clima deve trocar ocasionalmente, o que faz o carro desacelerar. o jogador deve clicar em trocar pneu e então ele dirige até o local e escolhe o pneu. enquanto isso, a corrida deve continuar acontecendo. crie N2 sendo mapa de lama e asfalto, e N3 sendo moto e carro, e com troca de pneu."*

Ele também fechou três escolhas:
- **N2:** a cadeia `SE / SENÃO SE / SENÃO`.
- **N3:** revezamento entre moto e carro, com a regra **aninhada**.

**Pista estreita (20/10/2026).** Ele achou o N3 *"extremamente poluído, muitos botões"* e a moto *"meio jogada, sem propósito"*. Decidiu:
- a **pista estreita** dá motivo à moto: no trecho estreito só a moto passa;
- **N2:** um trecho estreito na última volta. O jogo pergunta o veículo, e o carro errado só bate e volta (sem erro);
- **N3:** começa na trilha, de moto, e a pista alarga no meio da volta 2. Aqui o veículo está na regra, e escolher errado é erro;
- **o box em duas etapas:** primeiro só MOTO e CARRO, depois só os pneus daquele veículo.
- **Erro:** só o pneu errado no box encerra a partida.

O estilo de arte continua o **moda chapada** (as duas imagens que ele mandou são as referências `40` e `41`); os prompts foram reforçados no TEXTURAS.

---

## 0. Por que não é a ficha, e o que ela deixou

| Irmão | O que a criança faz | O que o Pit Stop faz diferente |
|---|---|---|
| **Cidade das Decisões (034)** | prevê o ramo (N1), escolhe a condição (N2) e monta o programa em blocos (N3) | a criança **pilota** e **executa** a regra no meio de uma corrida que não para |
| **Robô Sorrateiro (079)** | arma uma carta-regra e assiste à regra decidir | aqui é a criança quem decide quando parar e qual linha da regra vale agora |

Do Faroleiro ficaram:
- a criança faz o papel do computador;
- o **SENÃO cobre mais de um caso** (sol e nublado dão pneu liso);
- a cadeia **SE / SENÃO SE / SENÃO**, que agora é o N2.

## 1. O jogo em uma frase

**A Kika corre e você pilota: acelere, freie e, quando o tempo ou a pista mudarem, chame o box, pare na tenda da equipe e ponha o pneu que a regra manda — enquanto os rivais continuam correndo.**

## 2. A habilidade na tela

| A habilidade pede | Onde está |
|---|---|
| **seleção condicional** | a regra da equipe, sempre no canto de cima, em linhas: `SE … → pneu` · `SENÃO SE …` · `SENÃO …` |
| **simular** | a criança executa a regra com a mão. A linha que ela usou **acende** quando ela toca o carrinho |
| **linguagem pictográfica e escrita** | cada linha tem palavra e desenho: a nuvem de chuva, a poça de lama, a placa de pista estreita, o pneu de cada ramo |
| **repetição** | a corrida é um laço de voltas, e a mesma regra é lida de novo a cada parada |
| **sequência** | o tempo e o chão mudam um depois do outro, e cada mudança pede uma parada |
| **resolver problema** | quem para na hora certa com o pneu certo ganha a corrida |
| o SENÃO é "todo o resto" | o nublado cai no SENÃO: tem nuvem, mas não está chovendo |
| a ordem da cadeia importa (N2) | lama **com** chuva dá CRAVOS: a primeira condição verdadeira vence |
| regra dentro de regra (N3) | primeiro *"a pista é estreita?"* (moto ou carro), depois *"está chovendo?"* |

### O teste da bolinha

> Troque cada pneu por uma bolinha colorida sem significado. O jogo muda?

- **No N1 a desaceleração quase entrega a resposta:** com 2 pneus, *"está lento → pegue o outro"* funciona. Duas coisas impedem que isso baste:
  - **toda mudança de tempo dá um tranco em todos os carros** (a rajada). Quem para no box só porque o carro freou precisa ler a regra;
  - **o nublado é a armadilha:** sol → nublado não pede troca, e quem trocar põe CHUVA sem chuva e erra.
- **No N2** há 3 pneus. Saber que o atual está errado não diz qual dos outros dois é o certo: só a regra diz, e na ordem.
- **No N3** a parada tem duas etapas, e cada uma tem só 2 botões. Nenhuma entrega a outra:
  - **a etapa 1 (MOTO ou CARRO)** é o teste de fora. Os dois botões são iguais, e os 4 pneus continuam no nível, na etapa 2. Trocar de veículo na hora certa só sai da pergunta *"a pista é estreita?"*. Quem fica no mesmo veículo por hábito erra quando a pista alarga;
  - **a etapa 2 (os 2 pneus do veículo)** é o teste de dentro, o céu. A troca de veículo traz o novo **sem pneu**, então ali sempre é preciso ler o céu.

## 3. O laço

1. **Largada:** três luzes e *"JÁ!"*. A Kika larga em 3º, atrás dos dois rivais.
2. **Pilotar:** segurar **ACELERAR** leva o carro até a velocidade máxima, e **FREIO** para rápido. Sem nenhum dos dois, o carro perde velocidade devagar.
3. **O tempo muda** em pontos fixos da corrida (as nuvens chegam, começa a chover, a chuva para) e, no N2, **o chão muda** (o asfalto vira lama). No N2 e no N3, **a pista muda**: ela vira uma trilha estreita entre pedras, ou alarga de novo. Toda mudança de tempo dá **um tranco** em todos: os carros perdem um pouco de velocidade e o vento passa.
4. **Se o pneu não serve mais para a situação**, o carro **não volta a correr**: fica preso em menos da metade da velocidade. Na chuva ele derrapa, na lama ele patina e joga barro, e no seco com pneu de chuva ele solta fumaça.
5. **TROCAR PNEU:** o carro muda para a **faixa do box** (atrás da pista), e a tenda da equipe mais próxima acende com o **retângulo de parada**. A Lua e o Davi saem da tenda e esperam. Tocar no botão de novo desiste e volta para a pista.
6. **Parar no box:** é a criança quem freia. Chegou ao retângulo devagar (o FREIO pisca quando o carro vem rápido demais), e o carro estaciona sozinho. Passou rápido: *"Passou do box!"*, e a próxima tenda acende. Isso não custa nada além de tempo.
7. **Escolher:** os botões de dirigir saem e sobe a bandeja. **Os rivais continuam correndo**: eles passam na pista, na frente da tenda, e a posição no alto muda.
   - **Parada só de pneu** (N1 e as do N2): os carrinhos de pneu do carro.
   - **Parada que pede veículo** (todas as do N3, e a da pista estreita no N2): primeiro só **MOTO** e **CARRO**. Depois, no N3, só os 2 pneus daquele veículo. No N2 a regra não fala de moto, então a equipe põe sozinha o pneu de moto que a regra pede para o céu.
   - **A troca de pista é automática:** uns 900 antes da boca aparece *"PISTA ESTREITA!"* (ou *"A PISTA ALARGOU!"*), e o carro entra no box e estaciona sozinho na tenda da troca. Lá dentro, o veículo velho entra e o novo sai **sem pneus**.
8. **A troca:** a linha da regra que a criança usou acende, os mecânicos fazem *zzzt-zzzt* e os pneus velhos saltam.
   - **Pneu certo:** o carro volta para a pista e acelera.
   - **Já estava certo** (parou sem precisar): o carro volta para a pista e aparece *"Já estava certo!"*, sem ponto e sem erro.
   - **Pneu errado:** começa a cena do erro (§8).
9. A cada volta, a bolinha do alto acende e o Tio Beto acena na linha de chegada. Na última, ele agita a **bandeira quadriculada**.

## 4. Controles

| Botão | Onde | O quê | Teclado (em silêncio) |
|---|---|---|---|
| **FREIO** | canto inferior esquerdo | segurar freia | ← A ↓ S |
| **ACELERAR** | canto inferior direito | segurar acelera | → D ↑ W |
| **TROCAR PNEU** | embaixo, à direita do meio | chama o box (de novo = desiste) | Espaço, P |
| MOTO / CARRO | bandeja embaixo, etapa 1 da parada que pede veículo | escolhe o veículo | 1, 2 |
| carrinhos de pneu | bandeja embaixo, só parado no box | escolhe o pneu (2 ou 3 por vez) | 1, 2, 3 |

Os pedais aceitam toque múltiplo. Com o mouse, ACELERAR fica apertado enquanto o botão estiver pressionado. Na bandeja nunca há mais de 3 alvos: 2 veículos, ou 2 pneus (3 no N2, que tem 3 pneus de carro). Na troca automática de pista, o botão do box mostra *"TROCAR VEÍCULO"*.

## 5. A tela (1280 × 720, sem rolagem)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [Nível 1] ●○○ │  ─●──●─────◆──────────────────🏁   3º  │          (?)  │ faixa 96
├──────────────────────────────────────────────────────────────────────────┤
│ ┌ REGRA ─────────────────────┐        ☀ / ☁ / 🌧                          │
│ │ SE 🌧 chovendo → 🛞 CHUVA   │                                           │
│ │ SENÃO → 🛞 LISO             │   ▓▓▓▓ arquibancada ▓▓▓▓ ⛺ tenda ▓▓▓▓▓▓▓  │
│ └────────────────────────────┘                                           │
│ ═══════════ faixa do box ══════════════════[ PARE ]══════════════════════│ y 436–490
│ ─────────────────────────────── rival ──────────────────────────────────│ pista de trás, y 556
│        🏎 Kika (x 400)                                                   │ pista da frente, y 622
│ [FREIO]                              [TROCAR PNEU]           [ACELERAR]  │ grama
└──────────────────────────────────────────────────────────────────────────┘
```

- **A faixa do alto:**
  - à esquerda, o nível e uma bolinha por volta;
  - no meio, o **mapa da corrida**: uma linha com a bandeira no fim e um pontinho para a Kika e um para cada rival;
  - à direita, a **posição** (1º, 2º, 3º) e o `?`.
- **A regra** fica no canto de cima, à esquerda: uma linha por ramo, e as linhas de dentro recuadas no N3.
- **O autódromo** é uma faixa que se repete: arquibancada, faixa do box, pista com duas faixas e grama. Ele anda conforme a velocidade da Kika.
  - **As tendas** são da equipe e ficam em pontos fixos da volta, na frente da arquibancada.
  - **A lama** (N2) cobre a faixa do box e a pista nos trechos de lama.
  - **A trilha** (`trilha.png`, a mesma geometria da lama) cobre a pista nos trechos estreitos: pedras e arbustos em cima e embaixo, e no meio uma faixa estreita de terra, onde a moto roda (`MOTO_LANES`). Uns 800 antes da boca fica a **placa de pista estreita**, e na boca, **três cones** fecham a parte larga. A boca fica 1 200 depois da tenda da troca, além das vagas dos rivais.
- **A Kika** fica sempre em x 400, para a criança ver o que vem pela frente. Os rivais aparecem pela distância real deles: quem está na frente aparece à direita, e quem ficou para trás sai pela esquerda.

## 6. Os níveis

O veredito é sempre uma função do estado: `tireFor(regra, situação)`, com situação = `{ tempo, chão, veículo }`. Os dados não guardam a resposta.

**O respiro.** Depois de jogar a primeira versão, o usuário disse: *"estenda mais o tamanho de percorrer. eu mal troco de pneu e o jogo já troca pra chuva/lama"*. As voltas ficaram bem mais longas, e a validação cobra o respiro (`GAP` em `data/levels.ts`):
- a tenda usada fica pelo menos 800 depois da mudança;
- a próxima mudança que pede troca vem pelo menos 3 500 depois dessa tenda (uns 6 s de pista em velocidade máxima).

### N1 — SE / SENÃO (asfalto, 3 voltas de 12 000)

```
SE  🌧 chovendo → 🛞 CHUVA
SENÃO           → 🛞 LISO
```

| Onde (distância) | O tempo | Pede troca? |
|---|---|---|
| largada | ☀ sol (pneu LISO) | — |
| 2 400 | ☁ nublado | **não** (a armadilha do SENÃO) |
| 6 800 | 🌧 chuva | CHUVA |
| 17 000 | ☁ nublado | LISO (a nuvem ficou, mas a chuva parou) |
| 26 600 | 🌧 chuva | CHUVA |

São 3 trocas e uma armadilha. As tendas ficam em 2 000, 6 000 e 10 000 de cada volta.

### N2 — SE / SENÃO SE / SENÃO (lama, asfalto e pista estreita, 2 voltas de 18 000)

```
SE        🟫 pista de lama → 🛞 CRAVOS
SENÃO SE  🌧 chovendo      → 🛞 CHUVA
SENÃO                      → 🛞 LISO
```

A lama e a pista estreita agora são **trechos da corrida**, em distância absoluta, e não se repetem a cada volta. Se a lama se repetisse, a da volta 2 cairia dentro da pista estreita.
- **A lama** vai de 4 000 a 10 000 (só na volta 1).
- **A pista estreita** vai de 23 000 até a chegada (36 000). Ela começa na tenda da troca, com a boca em 24 200.
- **As tendas** ficam em 5 000, 11 000 e 17 000 de cada volta.

| Onde | O que muda | Pede | Tenda |
|---|---|---|---|
| 1 200 | ☁ nublado | nada (armadilha do SENÃO) | — |
| 4 000 | entra na lama | CRAVOS | 5 000 |
| 8 000 | 🌧 chove **dentro da lama** | nada: a lama vem primeiro na regra (armadilha da ordem) | — |
| 10 000 | sai da lama, chovendo | CHUVA | 11 000 |
| 14 500 | ☀ sol | LISO | 17 000 |
| 23 000 | **pista estreita** (sol) | MOTO, e a equipe põe o moto LISO | 23 000 (a troca automática) |

São 4 trocas, contando a da pista estreita. Dentro dela o céu não muda e não há lama.

**A pista estreita no N2 só apresenta a moto**, porque a regra do N2 não fala de veículo. Na tenda aparece *"MOTO OU CARRO?"* com os dois botões:
- **MOTO:** a moto sai, a equipe põe o pneu e dá ponto (+5), como uma troca certa;
- **CARRO:** o carro sai, bate nos cones da boca (os cones balançam, *tum*), aparece *"Só a MOTO passa!"* e ele volta para a tenda. A etapa 1 reabre, **sem erro**.

Se a criança chamar o box já de moto, dentro da trilha, a equipe confere o pneu sozinha (*"Já estava certo!"*).

### N3 — regra aninhada (moto na trilha e depois carro, 2 voltas de 12 000)

```
SE 🚧 pista estreita
    SE 🌧 chovendo → 🛞 moto CHUVA
    SENÃO          → 🛞 moto LISO
SENÃO
    SE 🌧 chovendo → 🛞 CHUVA
    SENÃO          → 🛞 LISO
```

O usuário achou a primeira versão *"super complexa e difícil"* (3 voltas, 2 revezamentos, 5 trocas). Depois achou a bandeja de 4 carrinhos *"extremamente poluída"* e a moto *"sem propósito"*. Hoje:
- **A moto tem motivo:** a corrida **começa na trilha estreita, de moto**, e no meio da volta 2 a pista **alarga** e volta o carro.
- **A troca de pista é automática:** perto da saída aparece *"A PISTA ALARGOU!"* e a moto entra no box e estaciona sozinha na tenda da troca.
- **Toda parada tem duas etapas:**
  - **etapa 1:** só **MOTO** e **CARRO**, e a linha de fora acende no toque (`SE pista estreita` ou o `SENÃO` dela);
  - **etapa 2:** só os **2 pneus daquele veículo**, e a linha de dentro acende.
  Os 4 pneus continuam no nível, mas nunca aparecem juntos.

Em 20/10/2026 o usuário também pediu *"melhore um pouco o n3 deixando mais fácil de jogar"*. O que mudou:
- **corrida mais curta:** voltas de 16 000 → 12 000;
- **box mais tolerante:** o retângulo de parada vai a ±240 (nos outros níveis, ±170), e o carro estaciona entrando nele a até 270 px/s (nos outros, 200). O 270 fica logo abaixo da velocidade com pneu errado (620 × 0,45 ≈ 279), para o freio ainda contar;
- **aviso mais cedo:** o TROCAR PNEU começa a chamar com 1,2 s de pneu errado (nos outros, 2,5 s);
- **mais respiro:** a mudança seguinte vem pelo menos 4 500 depois da tenda (nos outros, 3 500).

Esses valores são campos opcionais do nível (`pitZone`, `parkV`, `nudgeMs`, `calm` em `LevelDef`), e o que falta vem do `PIT` e do `GAP`.

A pista estreita vai de 0 a 18 000 (a trilha visível termina em 16 800, e a tenda da troca é a de 18 000).

| Onde | O que muda | Pede | Tenda |
|---|---|---|---|
| largada | trilha, ☀ sol | MOTO + moto LISO | — |
| 2 500 | 🌧 chuva, na trilha | MOTO → moto CHUVA | 6 000 (folga de 4 600) |
| 10 600 | ☀ sol, na trilha | MOTO → moto LISO | 13 200 (folga de 4 800 até a saída) |
| 18 000 | **a pista alarga** (sol) | **CARRO** → LISO | 18 000, a troca automática (folga de 6 000 até a chegada) |
| 21 500 | ☁ nublado | nada (armadilha) | — |

São 3 paradas e 3 trocas. As tendas ficam em 1 200, 6 000 e 9 000 de cada volta, e a chegada é em 24 000.

**Validação** (`validateLevels`, DEV):
- cada pneu da regra tem o seu carrinho;
- toda mudança que pede troca tem uma tenda depois dela, com o respiro do `GAP` até a próxima;
- a armadilha (mudança sem troca) aparece em todo nível;
- no N2, lama com chuva acontece pelo menos uma vez;
- cada borda de pista estreita é uma tenda, e nenhuma outra tenda fica a menos de 900 antes dela (a troca automática acha a tenda certa);
- não há lama dentro da pista estreita;
- quando a regra não fala de veículo (N2), o céu não muda dentro da pista estreita e o pneu pedido tem versão de moto;
- quando fala (N3), os dois veículos aparecem.

## 7. Os rivais (a corrida não para)

São dois rivais, o **lilás** e a **coral**, com velocidade máxima de 90 % e 84 % da da Kika. A equipe deles **segue a mesma regra**, mas é desatenta (pedido de 20/10/2026: *"deixar os competidores da corrida mais burros, fazendo eles demorarem pra trocar mais os pneus e às vezes nem trocar"*). A cada mudança que pede pneu novo, cada rival sorteia por conta própria (`RIVAL_AI` em `data/physics.ts`):
- **quanto demora para perceber:** de 3,5 s a 6 s;
- **se vai ignorar:** 35 % de chance. Aí ele segue com o pneu errado (a 45 % da velocidade) até a próxima mudança, quando sorteia de novo.

Depois disso, entra na faixa do box, para na **vaga dele** e volta com o pneu certo. A parada leva 6 s, e as vagas ficam 700 e 950 depois de cada tenda da Kika, para os carros não se encavalarem. Na pista estreita eles também trocam de veículo: essa troca eles **nunca ignoram** (o veículo novo sai sem pneu), e a parada leva 7 s. A troca deles é na vaga, antes da boca da trilha.

Assim, quem para logo e escolhe certo passa os dois, e quem demora ou passa do box fica para trás. **A posição não reprova:** ela só vira as estrelas do fim (1º = 3, 2º = 2, 3º = 1).

## 8. Acerto e erro

| Situação | O que acontece | Emite |
|---|---|---|
| troca necessária, pneu certo | a linha acende, *zzzt*, o carro volta e acelera | `CORRECT_ANSWER` (+5) e `CHECKPOINT` |
| parou sem precisar, pneu certo | *"Já estava certo!"* | nada |
| **pneu errado** | a cena do erro (abaixo) e o bloco certo da regra treme. Depois de ~2,4 s vem a faixa do porquê | `WRONG_ANSWER` (−5) e `lose()` |
| **veículo errado no N3** | a cena do erro (abaixo) e treme a linha de fora certa | `WRONG_ANSWER` (−5) e `lose()` |
| carro na pista estreita do N2 | bate nos cones, *"Só a MOTO passa!"*, volta à tenda e a etapa 1 reabre | nada |
| passou do box, freou tarde, demorou para trocar | perde tempo e posição | nada |

As cenas do erro mostram o estrago na pista:

| Faltava | O que acontece | Faixa |
|---|---|---|
| pneu de CHUVA (chovendo) | aquaplana: rodopia duas vezes e para no fardo de feno, e a Kika fica tonta | *"Está chovendo: pneu de CHUVA!"* |
| pneu LISO (seco) | o pneu esquenta: sai fumaça, e ele murcha | *"Sem chuva: pneu LISO!"* (N2: *"Sem lama e sem chuva: LISO!"*) |
| pneu de CRAVOS (lama) | atola: as rodas giram no lugar, o barro voa e o carro afunda | *"Pista de lama: pneu de CRAVOS!"* (com chuva: *"A lama vem primeiro: CRAVOS!"*) |
| a MOTO (N3, pista estreita, escolheu CARRO) | o carro sai da tenda, bate nos cones na frente da trilha e fica tonto | *"Pista estreita: só a MOTO passa!"* |
| o CARRO (N3, a pista alargou, escolheu MOTO) | a moto sai para a pista larga, treme de um lado para o outro e perde força | *"Pista larga: volte para o CARRO!"* |

O pneu de moto no carro (e o contrário) não acontece mais: a etapa 2 só mostra os pneus do veículo.

## 9. Tutorial (visual, quase sem texto)

Segue o que o usuário cobrou no Cabo Certo: menos texto, mais animação, zoom e uma **mãozinha** mostrando o gesto. As legendas têm de uma a três palavras.

**N1 (uma vez):** uma volta de aquecimento, sem rivais, que o jogo pilota sozinho.
1. **A regra cresce no meio da tela** e cada linha pisca uma vez. A legenda diz *"A REGRA"*, e a regra encolhe para o canto.
2. A mão segura **ACELERAR**, e o carro arranca (*"ACELERAR"*). Depois aperta **FREIO**, e o carro freia (*"FREAR"*).
3. Começa a chover, o carro escorrega e perde força. A câmera chega perto (*"CHOVEU!"*).
4. A mão toca **TROCAR PNEU**, o carro vai para a faixa do box e a tenda acende (*"BOX"*). Perto dela, a mão aperta **FREIO**, e o carro estaciona (*"PARE"*).
5. A bandeja sobe e a linha do SE pisca. A mão toca o carrinho de CHUVA, e a troca acontece (*"CHOVE → CHUVA"*).
6. O carro volta para a largada, os rivais entram no grid e a legenda diz *"SUA VEZ!"*. Seguem as luzes, e a corrida começa.

- **N2 (uma vez):** a regra cresce, e as linhas acendem na ordem, de cima para baixo (*"DE CIMA PARA BAIXO"*). Na primeira lama da corrida aparece *"LAMA!"*. Na pista estreita aparece *"PISTA ESTREITA!"*, e na etapa 1 do box, *"MOTO OU CARRO?"*.
- **N3 (uma vez):** a regra cresce, acendem as duas linhas de fora (*"PISTA ESTREITA?"*) e depois as de dentro (*"DEPOIS, O CÉU"*). Na saída da trilha aparece *"A PISTA ALARGOU!"*.

**O `?`** pausa a corrida e mostra um balão com recorte na regra (*"Olhe o céu e siga a regra."*, e no N2 e no N3 a frase do nível) [Continuar].

## 10. Fim de corrida e fim do nível

A última volta termina com a bandeira quadriculada. A Kika comemora e aparece a posição (*"1º lugar!"*). Depois:
- confete;
- `GAME_COMPLETED`;
- `showLevelComplete` com as estrelas da posição. Os níveis 1 e 2 avançam sozinhos, e o 3 tem **JOGAR DE NOVO**.

## 11. Dados e arquivos

```
index.ts  types.ts
data/   files.ts layout.ts theme.ts timing.ts physics.ts rules.ts levels.ts words.ts
scenes/ BootScene.ts GameScene.ts fallback.ts art.ts audio.ts view.ts guide.ts hand.ts caption.ts
        header.ts rule.ts track.ts sky.ts car.ts racers.ts crew.ts carts.ts controls.ts effects.ts banner.ts
```

- **`rules.ts`** guarda a regra como **árvore** (`if / then / otherwise`, com folhas de pneu). Dela saem:
  - `tireFor`, o veredito;
  - `vehicleRow`, a linha de fora que acende na etapa 1;
  - as **linhas** que o painel desenha: a cadeia vira `SENÃO SE`, e o aninhado vira linhas recuadas;
  - o **caminho** que acende para cada pneu.
- **`levels.ts`** guarda os níveis: `mud` e `narrow` são trechos em distância absoluta. Dele saem:
  - `vehicleAt`: moto dentro da pista estreita, carro fora;
  - `asksVehicle`: a regra testa `estreita`? (N3);
  - `needOf`: o pneu que serve. Na moto do N2, é a versão de moto do pneu da regra.
- **`track.ts`** é o mundo que corre: a faixa do autódromo, a lama, a trilha com a placa e os cones, as tendas, as poças, a linha de chegada e o Tio Beto. Ele desenha tudo em função da distância da Kika (`d`). As tendas, as poças e a chegada se repetem a cada `lap`; a lama e a trilha, não.
- **`carts.ts`** é a bandeja: `open(ids)` mostra só os botões pedidos (MOTO/CARRO ou os pneus de um veículo), centralizados.
- **`racers.ts`** guarda os rivais: a física deles, o box e o revezamento.
- **`car.ts`** desenha um carro ou uma moto com as rodas soltas (é o pneu que muda). O `vehicleIcon` é o mesmo veículo vazio, em tamanho de botão.

A reserva da `trilha.png` e da `trilha-pecas.png` (placa e cone) está em `fallback.ts`.

**Arte:** o jogo roda inteiro com a **arte de reserva** em Graphics (`scenes/fallback.ts`), nas mesmas folhas e grades do TEXTURAS. Um PNG com o mesmo nome em `src/assets/games/EF05CO04/pit-stop-da-chuva/` substitui a reserva sem mudar código.

Ficam no código para sempre: o céu, a chuva, as gotas, os respingos de água e barro, a fumaça, as estrelinhas, as linhas de velocidade, o retângulo de parada, a linha de chegada e os botões (o desenho dos pedais e da chave vem da folha).

## 12. Dúvidas

1. **A rajada** (o tranco de toda mudança de tempo) existe para o N1 não virar *"está lento → pegue o outro"*. Se no teste ela parecer castigo, ela pode ficar mais fraca, mas sem ela o N1 dispensa a regra.
2. **O auxílio de freio:** o carro estaciona se entra no retângulo abaixo de 320 px/s. Se a criança passar do box toda hora, o limite sobe ou o retângulo cresce (`PIT` em `data/physics.ts`).

## Histórico

- 15/10/2026: plano, TEXTURAS e N1 em Graphics (paradas fixas, a criança só tocava o carrinho). Id 123 no catálogo, order 347.
- 20/10/2026: **redesenho para corrida dirigível**, a pedido do usuário. Entraram os pedais, o TROCAR PNEU, a faixa do box, os rivais em tempo real, o N2 (lama e asfalto, SENÃO SE) e o N3 (revezamento moto e carro, SE aninhado). O tutorial virou mão + legenda. O TEXTURAS foi refeito com as folhas novas (`motos`, `controles`, `lama`, `tenda`, `mao`), e o `box.png` saiu. No catálogo: 55 pontos (11 trocas × 5).
- 20/10/2026, depois de jogar: voltas bem mais longas e o respiro validado (`GAP`). O N3 ficou com 2 voltas, um revezamento só e automático, e a bandeja em dois grupos. Os rivais ganharam vagas próprias no box. Testado no navegador:
  - a demonstração do N1;
  - a troca certa (+5) e o *"Já estava certo!"*;
  - o fim do nível com as estrelas da posição;
  - a lama do N2;
  - o revezamento automático do N3 e o erro *"Moto usa pneu de MOTO!"*.
- 20/10/2026, a pedido do usuário: o N3 ficou mais fácil (voltas de 12 000, parada ±240 a até 270 px/s, aviso do TROCAR PNEU em 1,2 s, respiro de 4 500) e os rivais, mais bobos (percebem em 3,5–6 s, ignoram 35 % das trocas, parada de 6 s e revezamento de 7 s).
- 20/10/2026, **pista estreita**:
  - o veículo passou a sair da pista (`narrow`, trechos absolutos), e não mais da volta. O teste `moto` virou `estreita`;
  - o box ganhou as duas etapas, e a bandeja nunca passa de 3 alvos;
  - o N2 ganhou a lama absoluta (4 000–10 000), a chuva dentro da lama como armadilha e a pista estreita de 23 000 à chegada, com o carro que bate e volta sem erro;
  - o N3 começa de moto na trilha e alarga em 18 000;
  - entraram a reserva da `trilha` e da `trilha-pecas` (placa e cone);
  - o caminho do pneu de outro veículo saiu;
  - no catálogo: 50 pontos (10 trocas × 5).
