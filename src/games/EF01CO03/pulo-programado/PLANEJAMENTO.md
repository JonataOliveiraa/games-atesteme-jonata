# Pulo Programado — EF01CO03

Documento irmão: [TEXTURAS.md](./TEXTURAS.md)

A criança monta a lista de ações do coelhinho ANTES de ele sair, aperta VAI, e
assiste o programa dela rodar.

---

## 1. Uma mudança em relação ao briefing, e o porquê

> **(EF01CO03)** Reorganizar e criar sequências de passos em meios físicos ou
> digitais, relacionando essas sequências à palavra 'Algoritmos'.

O briefing propõe: o coelhinho para na frente de cada obstáculo e a criança
escolhe uma carta ali mesmo. **Isso não é criar uma sequência.** É responder a
uma pergunta de cada vez, com a resposta desenhada na tela — buraco pede pular,
galho pede abaixar. A barra do topo vira um relatório do que já aconteceu, não
um plano. Troque os obstáculos por figuras abstratas e o jogo continua igual:
sinal de que a sequência está na decoração, não na mecânica.

E a habilidade pede **duas** coisas que esse laço não entrega: *criar* uma
sequência (ela precisa existir antes de rodar) e *reorganizar* (ela precisa
poder ser mexida depois de pronta). O exemplo oficial da BNCC diz isso com
todas as letras: o professor entrega as imagens dos passos e pede que os alunos
**as organizem numa sequência que permita construir o objeto** — organizar
primeiro, verificar depois.

**A troca:** o percurso inteiro fica visível de uma vez, a criança preenche a
trilha de cartas no topo e só então aperta VAI. O coelhinho executa a lista
inteira. Deu errado num passo, ele esbarra ali, aquele quadrado da trilha
acende, ela troca a carta e roda de novo.

Isso não tira nada do briefing — o coelho, os obstáculos, o esbarrão cômico, a
trava, o replay e a palavra ALGORITMO continuam todos. Muda só **quando** ela
escolhe: antes, e não durante.

## 2. E como isso não vira a Oficina dos Algoritmos

`EF01CO03` já tem um jogo publicado, a **Oficina dos Algoritmos**, que é
arrastar cartas para a ordem certa. Se Pulo Programado virasse outro
ordenador de cartas, seriam dois jogos iguais na mesma habilidade.

A diferença que justifica os dois:

| | Oficina dos Algoritmos | Pulo Programado |
|---|---|---|
| O que se ordena | cartas dadas, todas necessárias | cartas de uma paleta, repetíveis |
| Contra o quê | um enunciado escrito | um mundo desenhado, visível |
| O que prova o acerto | conferir a ordem | **o coelho atravessar** |
| O erro | a ordem está errada | o coelho esbarra **no passo errado** |

Aqui o algoritmo é julgado pela execução, e é o mundo que diz onde ele quebrou.
Isso é o que uma fase de plataforma faz e um baralho não faz.

---

## 3. O laço

```
    ver o percurso  ──▶  montar a trilha  ──▶  VAI  ──▶  o coelho executa
          ▲                     ▲                              │
          │                     └──── trocar a carta ◀──── esbarrou
          │                                                    │
          └──────────────── próxima fase ◀──── atravessou ─────┘
```

**Montar** — a paleta tem PULAR, ABAIXAR e ANDAR. Um toque na carta manda ela
para o próximo quadrado vazio da trilha. Um toque num quadrado cheio devolve a
carta para a paleta. Nada de arrastar: um toque põe, um toque tira, e é isso
que dá a "reorganização" sem exigir precisão de dedo.

**Rodar** — VAI só acende com a trilha cheia. O coelho anda e, em cada marco do
chão, executa a carta daquela posição.

**Errar** — ele esbarra fofo no obstáculo, sem queda e sem dano. O mundo
congela, o quadrado culpado ganha cadeado e brilho, e o balão diz o que
aconteceu ali (`Aqui tinha um buraco!`). **Só aquele quadrado destrava**: tocar
nele devolve a carta, e o VAI volta quando a trilha estiver cheia de novo.
Depois de dois erros no mesmo quadrado, a carta certa pisca na paleta.

**Acertar** — o coelho chega ao fim, comemora, e a trilha é reprisada:
cada carta acende em sequência, o coelho refaz os movimentos rapidinho, e o
balão fecha com **"Essa sequência de passos tem um nome: ALGORITMO!"**.

## 4. A grade

Tela fixa de **1280 × 720** com `Phaser.Scale.FIT`, como os outros jogos. Não
existe layout relativo neste projeto: num celular em pé o jogo vira uma faixa
16:9 com tarja preta, ele não recompõe. Todo número é coordenada absoluta.

A coluna da direita é o tamanho físico aproximado num celular de 390 px de
largura (fator ≈ 0,30) — é esse número que decide se está legível e se dá para
tocar, não o da grade.

| Faixa | y | Conteúdo | Tamanho | No celular |
|---|---|---|---|---|
| Trilha | 10 – 150 | Painel com até 5 quadrados (cy 80, lado 104, gap 18) e o `?` em (1208, 80) | 104 | 31 px |
| Percurso | 170 – 470 | Chão em y 430; o percurso INTEIRO cabe na tela, sem rolagem | coelho 150 | 45 px |
| Paleta | 480 – 720 | 3 cartas de 200 × 176 em x 250 / 480 / 710, cy 596; **VAI** em (1070, 596), raio 104 | carta 200 | 60 px |

**O percurso não rola.** Isso é regra, não economia: a criança precisa ver
todos os obstáculos ao mesmo tempo para poder planejar. Câmera que segue o
personagem esconde o que falta e transforma planejar em adivinhar.

Com 5 obstáculos em 1280 px, os marcos ficam em x = 250, 440, 630, 820, 1010, e
o coelho nasce em x = 90 e sai em x = 1200.

**O quadrado da trilha e o marco do chão são o mesmo endereço.** Quando o
coelho está no marco 3, o quadrado 3 acende. É esse par que faz a criança ligar
"esta carta" a "este pedaço do mundo" — sem ele, a trilha volta a ser enfeite.

## 5. Níveis e fases

Três níveis, **três fases cada** — a fase é um percurso inteiro. O limite do
[INSTRUCOES.md](../../INSTRUCOES.md) é 5 fases por nível.

| Nível | Fases | Cartas na paleta | O que entra |
|---|---|---|---|
| 1 — Primeiros pulos | 2, 3 e 3 marcos | PULAR e ANDAR | só buraco e caminho livre |
| 2 — Presta atenção | 3, 4 e 4 marcos | + ABAIXAR | galho, túnel e tronco |
| 3 — Dois caminhos | 4, 5 e 5 marcos | as três | trechos com **duas soluções certas** |

**O nível 3 é o que fecha a habilidade.** Em dois marcos existe uma bifurcação:
dá para ir por cima (PULAR, PULAR) ou por baixo (ABAIXAR, ANDAR). As duas
listas atravessam. Isso ensina, sem uma palavra de explicação, que um algoritmo
é *um* caminho — e não *o* caminho —, e faz a troca de cartas valer a pena por
curiosidade, não só por erro.

Fases prontas, direto do briefing:

- **F1** buraco · caminho livre
- **F2** buraco · galho · caminho livre
- **F3** buraco · caminho livre · tronco
- **F4** buraco · túnel · galho
- **F5** buraco · túnel · galho · caminho livre
- **F6** tronco · galho · buraco · caminho livre
- **F7** buraco · bifurcação · tronco
- **F8** galho · buraco · bifurcação · caminho livre
- **F9** buraco · bifurcação · galho · tronco · caminho livre

## 6. As regras, em código

O veredito nunca é um campo guardado na carta. É uma função do **marco** e da
**carta que caiu naquela posição**:

```
solves(obstacle, card)  →  buraco: PULAR
                           tronco: PULAR
                           galho:  ABAIXAR
                           tunel:  ABAIXAR
                           livre:  ANDAR
                           bifurcacao: PULAR ou ABAIXAR (e a próxima muda junto)
```

A bifurcação é o único marco com duas respostas, e ela **amarra a seguinte**:
quem pula tem que pular de novo; quem abaixa tem que andar. É essa amarra que
transforma a escolha numa decisão de sequência, e não em dois botões que dão no
mesmo.

Nada de estado sem saída: a trilha é sempre editável, o VAI só depende de estar
cheia, e nenhuma combinação de erro pode deixar a fase impossível.

## 7. Erro, e o que ele não pode ser

O catálogo manda travar no erro. Aqui a trava é sobre **um quadrado**, não sobre
a tela inteira:

1. o coelho esbarra no obstáculo, sem queda, sem dano, sem vida perdida;
2. o mundo congela e o quadrado culpado ganha cadeado, brilho e um tremor;
3. o balão diz **o que estava ali** (`Aqui tinha um galho baixo!`), nunca
   "tente de novo" e nunca a resposta;
4. tocar naquele quadrado devolve a carta; a trilha volta a aceitar;
5. depois de dois erros no mesmo quadrado, a carta certa pisca na paleta;
6. o coelho volta ao começo e a rodada recomeça do zero — o programa roda
   inteiro, sempre. É isso que ensina que um algoritmo é uma coisa só.

Pontos pelo `runtimeGameBridge`: **+10** se a fase passa na primeira rodada,
**+5** depois de conserto. **Nenhum número aparece na tela**, conforme a seção
Pontuação do [INSTRUCOES.md](../../INSTRUCOES.md).

## 8. Feedback

| Momento | O que acontece |
|---|---|
| Carta escolhida | ela voa da paleta até o quadrado, com som de encaixe e um "clique" de peça |
| Trilha cheia | o VAI acende e pulsa — é o único convite da tela |
| Executando | o quadrado do momento acende junto com o marco do chão |
| Pulo / abaixada | poeirinha no chão, deformação de mola no coelho |
| Esbarrão | tremor curto da câmera, estrelinhas de desenho animado, moldura da tela pisca vermelha |
| Atravessou | moldura pisca verde, confete, coelho comemora |
| Replay | as cartas acendem em sequência e o coelho refaz tudo em ~2 s, e o balão nomeia o ALGORITMO |

Áudio 100% sintetizado em WebAudio, como nos outros jogos: passo, mola do pulo,
"tuc" da carta encaixando, esbarrão surdo, e a fanfarra do replay. Respeita o
`mute-audio`.

## 9. Antes da arte existir

`createStepCard` — um cartão arredondado com o nome da ação — entra no lugar de
qualquer figura que falte, do mesmo jeito que em Ritmo da Rotina. É o que deixa
a fase inteira jogável e ajustável antes de o primeiro desenho chegar, e o que
impede um arquivo faltando de derrubar o `vite build`.

Ordem de produção:

1. placeholder, percurso desenhado em Graphics, trilha, paleta e VAI — F1
   jogável de ponta a ponta;
2. execução do programa, esbarrão e trava por quadrado;
3. as nove fases, a bifurcação e a paleta crescendo por nível;
4. replay com a palavra ALGORITMO, estrelas e o painel de fim de nível;
5. arte real entrando no lugar dos cartões;
6. conferência: mudo, pausa pelo `?`, retomada sem salto, e a faixa 16:9 num
   celular em pé.

## 10. O que mudou na construção

Três decisões saíram diferentes do que este documento previa, e o motivo de
cada uma:

**A bifurcação saiu.** O plano previa um marco com duas respostas certas — o
tronco erguido em pedras — para ensinar que existe mais de um algoritmo para o
mesmo caminho. Na tela ele ficou confuso: ninguém lia se aquilo era para pular
ou para passar por baixo. Virou uma PEDRA comum, que se pula.

Com isso o nível 3 perde o "dois caminhos" e passa a se diferenciar por
tamanho e mistura (4, 5 e 5 marcos com as três cartas). A parte da habilidade
que fala em REORGANIZAR continua inteira, porque ela mora no toque que devolve
a carta e no conserto depois do esbarrão — não dependia da bifurcação.

**O buraco e a pedra são Graphics, não textura.** Um PNG de terra encostando numa terra
desenhada mostrava a emenda, e era a primeira coisa que o olho achava na tela.
Agora o poço nasce do mesmo traçado do chão: mesma grama, mesma terra, e um
contorno só que desce por uma parede, contorna o fundo e sobe pela outra. O
quadro 0 da folha de obstáculos deixou de ser usado.

**O cronômetro conta para cima.** Uma barra esvaziando cobra pressa, e este
jogo cobra pensar antes de agir; para uma criança de 6 anos as duas coisas
juntas viram só aflição. O relógio mede a partida, aparece no painel de fim de
nível, e não empurra ninguém. Ele para no tutorial e na reprise.

## 11. Registro

- pasta: `src/games/EF01CO03/pulo-programado/`
- assets: `src/assets/games/EF01CO03/pulo-programado/`
- slug `pulo-programado`, módulo `EF01CO03/pulo-programado`, ícone 🐰
- entra em `catalog.ts`, `gameInstructions.ts` e no conjunto
  `GAMES_WITH_IN_GAME_COMPLETION_SCREEN` de `GameDetailsPage.tsx`
