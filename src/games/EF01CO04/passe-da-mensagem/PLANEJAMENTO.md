# Passe da Mensagem — EF01CO04

Documentos irmãos: [TEXTURAS.md](./TEXTURAS.md) ·
[PLANEJAMENTO MODAL.md](../../PLANEJAMENTO%20MODAL.md)

A bola-mensagem só chega no colega que está dizendo **a mesma coisa de outro
jeito**. No fim, tudo o que chegou fica guardado no mural.

---

## 1. A habilidade, e o teste que o briefing não passa

> **(EF01CO04)** Reconhecer o que é a informação, que ela pode ser armazenada,
> transmitida como mensagem por diversos meios e descrita em várias linguagens.

O briefing propõe: tocar no colega **livre**, desviando de um robô que anda
entre eles. Aplique o teste da bolinha — troque a bola-mensagem por uma bola
comum e as plaquinhas por nada. **O jogo continua idêntico**: continua sendo
achar a linha que o robô não está cruzando. É um jogo de tempo e trajetória; a
mensagem viajando por voz, papel e telefone é enfeite por cima.

E a habilidade tem três afirmações. O briefing só encosta numa delas, e por
fora: a mensagem *muda de meio* entre as travessias, mas a criança nunca
decide nada sobre isso — o jogo decide por ela.

**A troca:** o passe só funciona para o colega que está segurando **a mesma
informação escrita em outra linguagem**. Cada jogador em quadra mostra uma
plaquinha — um desenho, uma palavra, um balão de fala. A criança olha a
mensagem que está com ela e toca em quem diz aquilo de outro jeito. Errou, o
robô intercepta.

Agora o teste inverte: troque as plaquinhas por bolinhas e o jogo fica
impossível, porque não sobra nada para comparar.

## 2. Como isso não vira o Correio Multimídia

`EF01CO04` já tem jogo publicado. O **Correio Multimídia** é: escolher o CANAL
(áudio, texto ou desenho) certo para enviar uma mensagem, com contextos que
limitam ("sem som", "sem lápis"). Ou seja, ele já ocupa a parte do
*"transmitida por diversos meios"* — e ocupa bem, inclusive com a restrição de
contexto que o briefing propunha como nível 3 daqui.

Sobra a outra metade do texto oficial, e é dela que este jogo vive:

| | Correio Multimídia | Passe da Mensagem |
|---|---|---|
| A pergunta | por qual **meio** mando isto? | qual destes diz **a mesma coisa**? |
| O que se compara | mensagem × canal | linguagem × linguagem |
| O que limita | o contexto (sem som, sem lápis) | o que os colegas estão segurando |
| Trecho da habilidade | transmitida por diversos meios | **descrita em várias linguagens** |
| O que fica no fim | a mensagem enviada | o **mural**: informação armazenada |

O mural do fim cobre a terceira afirmação — *armazenada* —, que nenhum dos
dois tinha.

## 3. O robô: o que ele deixa de ser

No briefing o robô anda e cria pressa de tempo. Aqui ele **não anda e não
tem relógio**: ele é a consequência do erro. Passe para a plaquinha errada, e
ele corta a bola, levanta com cara boba e devolve.

O motivo é o mesmo que já apareceu em Ritmo da Rotina: pressa e comparação
brigam. Comparar duas linguagens é trabalho de olhar com calma, e um
interceptador andando transforma isso em chute. O robô ganha mais graça sendo
o dono do erro do que sendo um cronômetro com pernas.

---

## 4. O laço

```
    a bola mostra a mensagem  ──▶  achar quem diz o mesmo  ──▶  tocar nele
              ▲                                                     │
              │                                            ┌────────┴────────┐
              │                                       acertou            errou
              │                                            │                 │
              └──── a bola chega, e a mensagem muda ────────┘       o robô corta,
                    de linguagem com ele                            aquela linha
                                                                    fica bloqueada
                    ┌─────────────────────────────┐
    último passe ──▶│ o destino recebe            │──▶ o mural guarda a mensagem
                    │ e a fase acaba              │     com as linguagens por que
                    └─────────────────────────────┘     ela passou
```

**Uma fase são 3 passes.** A bola sai com a mensagem em uma linguagem, passa
por dois colegas trocando de linguagem a cada parada, e o terceiro passe
entrega no destino.

---

## 5. A grade

Tela fixa de **1280 × 720** com `Phaser.Scale.FIT`. Coordenada absoluta; não
existe layout relativo neste projeto. A última coluna é o tamanho físico num
celular de 390 px de largura (× 0,30) — é ela que decide legibilidade e toque.

| Faixa | y | Conteúdo | Tamanho | No celular |
|---|---|---|---|---|
| Painel | 10 – 150 | Pílula `NÍVEL x/3` e bolinhas de fase à esquerda; **a mensagem de agora** no centro, grande; `?` em (1210, 80) | carta 118 | 35 px |
| Quadra | 160 – 720 | Vista de cima, ocupando todo o resto. Jogadores em posições fixas, cada um com sua plaquinha; o destino na borda direita | jogador 150, plaquinha 130 | 45 / 39 px |

**A quadra ocupa tudo o que sobra e não rola.** A criança precisa ver todas as
plaquinhas ao mesmo tempo para poder comparar — é o mesmo motivo pelo qual o
percurso de Pulo Programado não rola.

**Não existe painel embaixo**, porque o controle é tocar no próprio jogador.
Isso libera a metade de baixo da tela para a quadra, que é o que dá ao jogo
cara de esporte.

Posições dos jogadores, por quantidade (x, y em coordenada absoluta):

| Nº | Posições |
|---|---|
| 3 | (250, 300) · (250, 590) · (700, 440) |
| 4 | (250, 300) · (250, 590) · (640, 250) · (640, 620) |
| 5 | (240, 300) · (240, 600) · (600, 230) · (600, 620) · (860, 430) |
| 6 | (230, 290) · (230, 610) · (560, 220) · (560, 630) · (830, 300) · (830, 600) |

O **destino** fica sempre em (1120, 440), e quem começa com a bola é sempre o
primeiro da lista. Nenhuma plaquinha encosta na outra em nenhuma dessas
combinações.

---

## 6. As três linguagens

| Linguagem | Como aparece na plaquinha | Entra no |
|---|---|---|
| **Desenho** | o assunto desenhado (bolo, lápis, relógio, presente) | nível 1 |
| **Fala** | balão de fala com o desenho pequeno dentro, e ondinhas de som | nível 1 |
| **Palavra** | a palavra escrita, com a inicial grande | nível 2 |

A ordem não é estética, é de leitura: criança de 1º ano está aprendendo a ler,
então a palavra escrita entra **depois** que a ideia de "a mesma coisa dita de
outro jeito" já foi entendida com duas linguagens que ela lê de olho.

Assuntos prontos, do briefing:

| Assunto | Desenho | Palavra |
|---|---|---|
| A festa é sábado | bolo com velinha | `FESTA` |
| Traga o lápis amarelo | lápis amarelo | `LÁPIS` |
| O treino mudou de hora | relógio | `TREINO` |
| Feliz aniversário | presente | `PARABÉNS` |

---

## 7. Níveis e fases

Três níveis, **três fases cada**. A fase é uma travessia inteira: três passes
até o destino.

| Nível | Jogadores | Linguagens | O que cresce |
|---|---|---|---|
| 1 — Fala e desenho | 3, 3 e 4 | desenho e fala | a mesma mensagem nos três passes |
| 2 — Entra a palavra | 4, 5 e 5 | as três | mensagens diferentes por fase |
| 3 — Quadra cheia | 5, 6 e 6 | as três | dois colegas com assuntos **parecidos** (bolo × presente) |

O nível 3 aperta pela **semelhança**, não pela velocidade: o distrator deixa de
ser qualquer coisa e passa a ser algo do mesmo mundo (festa e aniversário),
que só se separa olhando direito. É o jeito de subir dificuldade sem pedir
pressa de uma criança que está comparando.

---

## 8. As regras, em código

O veredito é uma função do estado, nunca um campo guardado na plaquinha — a
mesma plaquinha é resposta certa numa fase e distrator na outra:

```
mesmaInformacao(bola, placa)  →  bola.assunto === placa.assunto
                                 && bola.linguagem !== placa.linguagem
```

As duas condições importam. Sem a primeira, qualquer plaquinha serve; **sem a
segunda, a criança poderia passar desenho para desenho** e o jogo viraria
"ache a figura igual" — que é jogo de memória, não de linguagem.

Montagem da fase:

1. sorteia o assunto da mensagem e a linguagem de partida;
2. para cada passe, escolhe a linguagem de chegada (diferente da atual) e
   coloca essa plaquinha em um colega;
3. os outros colegas recebem plaquinhas de **assuntos diferentes**, em
   linguagens variadas — nunca duas certas ao mesmo tempo;
4. o destino recebe a última linguagem da corrente.

Nenhum estado sem saída: sempre existe exatamente um colega certo, e a
plaquinha dele não muda enquanto a criança pensa.

---

## 9. O erro

TRAVA no padrão do catálogo, mas sobre **uma linha de passe**, não sobre a tela:

1. o robô entra na frente, pega a bola e faz cara boba — sem queda, sem dano,
   sem vida perdida;
2. a linha daquele passe fica **tracejada e bloqueada**: aquele colega não
   aceita mais a bola nesta rodada;
3. o balão diz o que não bateu — `Esse colega fala de OUTRA coisa!` —, nunca
   "tente de novo" e nunca qual é o certo;
4. a bola volta para quem estava com ela e o jogo destrava sozinho: a criança
   escolhe de novo entre os que sobraram;
5. depois de **dois erros na mesma parada**, o colega certo acena.

Pontos: **+10** por passe certo de primeira, **+5** depois de erro. Pelo
`runtimeGameBridge`. **Nenhum número na tela**, conforme a seção Pontuação do
[INSTRUCOES.md](../../INSTRUCOES.md).

---

## 10. O mural, e por que ele existe

No fim de cada fase a mensagem entregue **entra no mural**, com a corrente de
linguagens por que ela passou desenhada em fila: desenho → fala → palavra.

Isso não é enfeite de comemoração. É a única parte do jogo que mostra a
terceira afirmação da habilidade — que a informação pode ser **armazenada** —
e é onde a frase-chave do briefing fecha o raciocínio:

> **Olha: a mensagem é a mesma, só mudou o jeito de viajar!**

O mural acumula durante o nível: no fim das três fases ele aparece cheio, com
as três mensagens e seus caminhos, antes do painel de fim de nível.

---

## 11. Feedback

| Momento | O que acontece |
|---|---|
| Bola parada | ela pulsa devagar com quem está; as plaquinhas dos colegas têm um brilho leve |
| Toque num colega | a plaquinha afunda e volta; a linha do passe acende |
| Passe voando | rastro colorido, 0,5 s, e a bola gira |
| Chegou | a plaquinha vira a nova mensagem no painel do topo, com estalo; moldura da tela pisca verde |
| Intercepção | robô entra, moldura pisca vermelha, câmera treme de leve, a linha vira tracejado |
| Entrega no destino | torcida curta, confete, e a mensagem voa para o mural |
| Fim do nível | mural cheio, frase-chave em balão, estrelas |

Áudio sintetizado em WebAudio, como nos jogos irmãos: assobio curto do passe,
"pop" da chegada, buzina boba do robô, torcida no fim. Respeita `mute-audio`.

---

## 12. Antes da arte existir

`createSubjectCard` desenha uma plaquinha com o nome do assunto quando a
textura do desenho não existe — mesmo padrão de Ritmo da Rotina e Pulo
Programado. Com ele a fase inteira é jogável e ajustável antes do primeiro
desenho chegar, e um arquivo faltando não derruba o `vite build`.

Ordem de produção:

1. quadra em Graphics, jogadores em placeholder, uma fase jogável de ponta a
   ponta;
2. as três linguagens e a montagem da fase;
3. robô, trava por linha e a dica depois de dois erros;
4. mural, frase-chave e o painel de fim de nível;
5. arte real entrando no lugar dos cartões;
6. conferência: mudo, pausa pelo `?`, retomada sem salto, e a faixa 16:9 num
   celular em pé.

---

## 13. O que mudou na construção

**A primeira versão ficou ilegível para uma criança**, e o defeito era de
fundo: a tela tinha DUAS cartas ao mesmo tempo — a do topo e a que a bola
carregava — sem nada dizendo qual era qual, e o topo escrevia "em palavra",
que é justamente o que uma criança de 6 anos não consegue ler. As plaquinhas
flutuavam ao lado dos colegas sem dono, e quem estava com a bola só se
distinguia por NÃO ter plaquinha — ausência ninguém vê.

A correção foi dar **três papéis e três aparências**:

| Elemento | Responde | Como ficou |
|---|---|---|
| Painel do topo | o QUE mandar | o desenho grande e a frase por extenso, sem cor de linguagem |
| Bola | ONDE o recado está | uma bola de verdade, sem conteúdo, e um holofote no chão de quem a tem |
| Plaquinhas | COMO cada um falaria | cartão com BICO apontando para o dono |

Mais uma faixa de instrução **sempre na tela** — *"Toque em quem diz a MESMA
coisa"* —, que é o que responde "o que eu faço aqui" sem depender de lembrar
do tutorial.

O efeito colateral bom: a regra que a criança segue virou uma só e visível
("ache quem diz isto"). A lição — a mesma coisa dita de vários jeitos — deixou
de ser um rótulo que ela precisava ler e passou a ser o que ela vê acontecendo
a cada passe.

## 14. Registro

- pasta: `src/games/EF01CO04/passe-da-mensagem/`
- assets: `src/assets/games/EF01CO04/passe-da-mensagem/`
- slug `passe-da-mensagem`, módulo `EF01CO04/passe-da-mensagem`, ícone ⚽
- entra em `catalog.ts`, `gameInstructions.ts` e no conjunto
  `GAMES_WITH_IN_GAME_COMPLETION_SCREEN` de `GameDetailsPage.tsx`
