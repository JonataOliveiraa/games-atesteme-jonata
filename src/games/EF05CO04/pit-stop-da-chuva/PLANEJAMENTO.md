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
| **linguagem pictográfica e escrita** | cada linha tem palavra e desenho: a nuvem de chuva, a poça de lama, a moto, o pneu de cada ramo |
| **repetição** | a corrida é um laço de voltas, e a mesma regra é lida de novo a cada parada |
| **sequência** | o tempo e o chão mudam um depois do outro, e cada mudança pede uma parada |
| **resolver problema** | quem para na hora certa com o pneu certo ganha a corrida |
| o SENÃO é "todo o resto" | o nublado cai no SENÃO: tem nuvem, mas não está chovendo |
| a ordem da cadeia importa (N2) | lama **com** chuva dá CRAVOS: a primeira condição verdadeira vence |
| regra dentro de regra (N3) | primeiro *"é moto?"*, depois *"está chovendo?"* |

### O teste da bolinha

> Troque cada pneu por uma bolinha colorida sem significado. O jogo muda?

- **No N1 a desaceleração quase entrega a resposta:** com 2 pneus, *"está lento → pegue o outro"* funciona. Duas coisas impedem que isso baste:
  - **toda mudança de tempo dá um tranco em todos os carros** (a rajada). Quem para no box só porque o carro freou precisa ler a regra;
  - **o nublado é a armadilha:** sol → nublado não pede troca, e quem trocar põe CHUVA sem chuva e erra.
- **No N2** há 3 pneus. Saber que o atual está errado não diz qual dos outros dois é o certo: só a regra diz, e na ordem.
- **No N3** o veículo corta os pneus pela metade, mas o **revezamento** traz um veículo sem pneu nenhum. Aí a criança precisa da regra inteira.

## 3. O laço

1. **Largada:** três luzes e *"JÁ!"*. A Kika larga em 3º, atrás dos dois rivais.
2. **Pilotar:** segurar **ACELERAR** leva o carro até a velocidade máxima, e **FREIO** para rápido. Sem nenhum dos dois, o carro perde velocidade devagar.
3. **O tempo muda** em pontos fixos da corrida (as nuvens chegam, começa a chover, a chuva para) e, no N2, **o chão muda** (o asfalto vira lama). Toda mudança de tempo dá **um tranco** em todos: os carros perdem um pouco de velocidade e o vento passa.
4. **Se o pneu não serve mais para a situação**, o carro **não volta a correr**: fica preso em menos da metade da velocidade. Na chuva ele derrapa, na lama ele patina e joga barro, e no seco com pneu de chuva ele solta fumaça.
5. **TROCAR PNEU:** o carro muda para a **faixa do box** (atrás da pista), e a tenda da equipe mais próxima acende com o **retângulo de parada**. A Lua e o Davi saem da tenda e esperam. Tocar no botão de novo desiste e volta para a pista.
6. **Parar no box:** é a criança quem freia. Chegou ao retângulo devagar (o FREIO pisca quando o carro vem rápido demais), e o carro estaciona sozinho. Passou rápido: *"Passou do box!"*, e a próxima tenda acende. Isso não custa nada além de tempo.
7. **Escolher:** os botões de dirigir saem e sobe a bandeja com os carrinhos de pneu. **Os rivais continuam correndo**: eles passam na pista, na frente da tenda, e a posição no alto muda.
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
| carrinhos de pneu | bandeja embaixo, só parado no box | escolhe o pneu | 1, 2, 3, 4 |

Os pedais aceitam toque múltiplo. Com o mouse, ACELERAR fica apertado enquanto o botão estiver pressionado.

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

### N2 — SE / SENÃO SE / SENÃO (lama e asfalto, 2 voltas de 18 000)

```
SE        🟫 pista de lama → 🛞 CRAVOS
SENÃO SE  🌧 chovendo      → 🛞 CHUVA
SENÃO                      → 🛞 LISO
```

A **lama** vai de 7 000 a 13 000 de cada volta. As tendas ficam em 2 500 e 15 000 (asfalto) e em 8 500 (lama).

| Onde | O que muda | Pede |
|---|---|---|
| 1 200 | ☁ nublado | nada (armadilha) |
| 7 000 | entra na lama | CRAVOS |
| 13 000 | volta ao asfalto (nublado) | LISO |
| 19 500 | 🌧 chuva | CHUVA |
| 25 000 | entra na lama, **ainda chovendo** | **CRAVOS** (a lama vem primeiro na regra) |
| 31 000 | asfalto, chovendo | CHUVA |

São 5 trocas.

### N3 — regra aninhada (carro e depois moto, 2 voltas de 16 000)

```
SE 🏍 for moto
    SE 🌧 chovendo → 🛞 moto CHUVA
    SENÃO          → 🛞 moto LISO
SENÃO
    SE 🌧 chovendo → 🛞 CHUVA
    SENÃO          → 🛞 LISO
```

O usuário achou a primeira versão *"super complexa e difícil"* (3 voltas, 2 revezamentos, 5 trocas). Ela ficou assim:
- **2 voltas:** a 1ª de carro e a 2ª de moto, com **um revezamento só**.
- **O revezamento é automático:** perto do fim da volta 1 aparece *"REVEZAMENTO!"* e o carro **entra no box e estaciona sozinho** (não precisa frear). Lá, o carro entra na tenda e a moto sai **sem pneus**, e a escolha é obrigatória.
- **A bandeja vem em dois grupos:** os pneus de moto à esquerda e os de carro à direita, cada carrinho com o desenho do veículo.

| Onde | O que muda | Pede |
|---|---|---|
| 3 500 | 🌧 chuva (carro) | CHUVA |
| 16 000 | revezamento → **moto**, chovendo | moto CHUVA |
| 22 000 | ☀ sol | moto LISO |
| 29 500 | ☁ nublado | nada (armadilha) |

São 3 trocas, contando o revezamento. As tendas ficam em 1 200 (a do revezamento), 6 000 e 11 000.

**Validação** (`validateLevels`, DEV):
- cada pneu da regra tem o seu carrinho;
- toda mudança que pede troca tem uma tenda depois dela, com o respiro do `GAP` até a próxima;
- a armadilha (mudança sem troca) aparece em todo nível;
- no N2, lama com chuva acontece pelo menos uma vez;
- no N3, os dois veículos aparecem e o revezamento só acontece na virada da volta.

## 7. Os rivais (a corrida não para)

São dois rivais, o **lilás** e a **coral**, com velocidade máxima de 90 % e 84 % da da Kika. A equipe deles **segue a mesma regra**: quando o pneu deles deixa de servir, eles demoram um pouco para perceber, entram na faixa do box, param na **vaga deles** e voltam com o pneu certo. A parada leva cerca de 4,5 s, e as vagas ficam 700 e 950 depois de cada tenda da Kika, para os carros não se encavalarem. No N3 eles também revezam.

Assim, quem para logo e escolhe certo passa os dois, e quem demora ou passa do box fica para trás. **A posição não reprova:** ela só vira as estrelas do fim (1º = 3, 2º = 2, 3º = 1).

## 8. Acerto e erro

| Situação | O que acontece | Emite |
|---|---|---|
| troca necessária, pneu certo | a linha acende, *zzzt*, o carro volta e acelera | `CORRECT_ANSWER` (+5) e `CHECKPOINT` |
| parou sem precisar, pneu certo | *"Já estava certo!"* | nada |
| **pneu errado** | a cena do erro (abaixo) e o bloco certo da regra treme. Depois de ~2,4 s vem a faixa do porquê | `WRONG_ANSWER` (−5) e `lose()` |
| passou do box, freou tarde, demorou para trocar | perde tempo e posição | nada |

As cenas do erro mostram o estrago na pista:

| Faltava | O que acontece | Faixa |
|---|---|---|
| pneu de CHUVA (chovendo) | aquaplana: rodopia duas vezes e para no fardo de feno, e a Kika fica tonta | *"Está chovendo: pneu de CHUVA!"* |
| pneu LISO (seco) | o pneu esquenta: sai fumaça, e ele murcha | *"Sem chuva: pneu LISO!"* (N2: *"Sem lama e sem chuva: LISO!"*) |
| pneu de CRAVOS (lama) | atola: as rodas giram no lugar, o barro voa e o carro afunda | *"Pista de lama: pneu de CRAVOS!"* (com chuva: *"A lama vem primeiro: CRAVOS!"*) |
| pneu do outro veículo (N3) | o pneu não encaixa, quica e sai rolando | *"Moto usa pneu de MOTO!"* / *"Carro usa pneu de CARRO!"* |

## 9. Tutorial (visual, quase sem texto)

Segue o que o usuário cobrou no Cabo Certo: menos texto, mais animação, zoom e uma **mãozinha** mostrando o gesto. As legendas têm de uma a três palavras.

**N1 (uma vez):** uma volta de aquecimento, sem rivais, que o jogo pilota sozinho.
1. **A regra cresce no meio da tela** e cada linha pisca uma vez. A legenda diz *"A REGRA"*, e a regra encolhe para o canto.
2. A mão segura **ACELERAR**, e o carro arranca (*"ACELERAR"*). Depois aperta **FREIO**, e o carro freia (*"FREAR"*).
3. Começa a chover, o carro escorrega e perde força. A câmera chega perto (*"CHOVEU!"*).
4. A mão toca **TROCAR PNEU**, o carro vai para a faixa do box e a tenda acende (*"BOX"*). Perto dela, a mão aperta **FREIO**, e o carro estaciona (*"PARE"*).
5. A bandeja sobe e a linha do SE pisca. A mão toca o carrinho de CHUVA, e a troca acontece (*"CHOVE → CHUVA"*).
6. O carro volta para a largada, os rivais entram no grid e a legenda diz *"SUA VEZ!"*. Seguem as luzes, e a corrida começa.

- **N2 (uma vez):** a regra cresce, e as linhas acendem na ordem, de cima para baixo (*"DE CIMA PARA BAIXO"*). Na primeira lama da corrida aparece *"LAMA!"*.
- **N3 (uma vez):** a regra cresce, acendem as duas linhas de fora (*"MOTO OU CARRO?"*) e depois as de dentro (*"DEPOIS, O CÉU"*). No primeiro revezamento aparece *"REVEZAMENTO!"*.

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
  - as **linhas** que o painel desenha: a cadeia vira `SENÃO SE`, e o aninhado vira linhas recuadas;
  - o **caminho** que acende para cada pneu.
- **`track.ts`** é o mundo que corre: a faixa do autódromo, a lama, as tendas, as poças, a linha de chegada e o Tio Beto. Ele desenha tudo em função da distância da Kika (`d`), e cada objeto da volta se repete a cada `lap`.
- **`racers.ts`** guarda os rivais: a física deles, o box e o revezamento.
- **`car.ts`** desenha um carro ou uma moto com as rodas soltas (é o pneu que muda).

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
