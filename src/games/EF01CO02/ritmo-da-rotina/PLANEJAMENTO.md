# Ritmo da Rotina — EF01CO02

Documento irmão: [TEXTURAS.md](./TEXTURAS.md)

Jogo de tambor no estilo Taiko: as figuras da rotina deslizam da direita para a
esquerda até um alvo, e a criança responde no tambor **no compasso**.

---

## 1. A habilidade, e o teste que ela precisa passar

> **(EF01CO02)** Identificar e seguir sequências de passos aplicados no dia a dia
> para resolver problemas.

O teste é este: **troque as figuras da rotina por bolinhas coloridas sem
significado. O jogo muda?**

Num jogo de tambor com **um** toque só, não muda nada — a criança bate no tempo
certo e pronto, tanto faz se a figura é "escovar os dentes" ou uma bolinha. A
rotina vira decoração e o que se mede é reflexo.

Por isso o controle tem **dois** toques, como o Taiko tem couro e aro:

| Toque | Quer dizer |
|---|---|
| **Centro** (couro) | "sim, esse é o próximo passo da rotina" |
| **Aro** (borda) | "não, esse não entra agora" |

Agora toda figura cobra duas coisas ao mesmo tempo: **julgar** — olhando a
sequência no topo — e **acertar o compasso**. Com bolinhas no lugar das figuras
o jogo fica impossível, porque não sobra nada para julgar. É assim que a
habilidade sai da decoração e entra na mecânica.

O veredito nunca é um campo guardado na figura. É uma função do **estado da
rotina no instante em que a figura chega ao alvo**:

```
esperado(rotina, passosFeitos)  →  qual passo deveria vir agora
correto(figura)                 →  figura === esperado ? centro : aro
```

A mesma figura pede centro numa hora e aro na outra — é isso que impede
decorar o ritmo em vez de ler a rotina.

---

## 2. Controle

Um objeto só, na base da tela, com duas zonas. Nada de arrastar.

| Zona | Área de toque (x) | Teclado |
|---|---|---|
| Centro | 470 – 810 | `F` `J` `Espaço` |
| Aro | 0 – 470 e 810 – 1280 | `D` `K` `←` `→` |

As duas zonas ocupam a faixa inteira de `y 508 – 720`. O desenho do tambor tem
620 px de largura, mas **a zona do aro vai até a borda da tela** — o aro
desenhado tem só 140 px de cada lado, o que num celular seria apertado demais
para o polegar. O que se vê é honesto; o que se toca é generoso.

---

## 3. A grade

Tela fixa de **1280 × 720** com `Phaser.Scale.FIT`, como os outros 44 jogos.
Não existe layout responsivo neste projeto: num celular em pé o jogo vira uma
faixa 16:9 com tarja preta, ele não recompõe. Todo número abaixo é coordenada
absoluta nessa grade.

A coluna da direita mostra o tamanho físico aproximado num celular de 390 px de
largura (fator ≈ 0,30) — é esse número que decide se está legível, não o da
grade.

| Faixa | y | Conteúdo | Tamanho | No celular |
|---|---|---|---|---|
| Cabeçalho | 0 – 92 | Nome da rotina à esquerda; `?` em (1234, 46), raio 30 | — | — |
| Sequência | 92 – 268 | Até 5 miniaturas, centro em y 180, gap 36, faixa centralizada (x 218 – 1062) | 140 px | 43 px |
| Trilha | 268 – 508 | Figuras deslizando; alvo em x 300, raio 132 | figura 240 px | 73 px |
| Tambor | 508 – 720 | Tambor 620 × 196, centro em (640, 612) | 620 px | 189 px |

A figura nasce em `x = 1400` (fora da tela) e o alvo está em `x = 300`: **1100 px
de corrida**. A travessia dura **4 tempos** sempre — a velocidade da trilha não
muda de nível para nível. O que muda é quantos tempos separam uma figura da
outra, e a largura da janela de acerto.

O cenário (quarto, cozinha) é desenhado em Graphics no fundo, com pouco
contraste, e **não ocupa a faixa central**. Vale a mesma regra de Corrida dos
Parecidos: o mundo é Graphics, a textura é só para o que precisa de identidade.

---

## 4. O compasso

**72 BPM** — um tempo a cada 833 ms. Tudo é contado em tempos, não em segundos:
é isso que mantém áudio e movimento grudados sem ninguém sincronizar nada à mão.

A posição da figura é função do relógio que agenda o áudio. Um relógio só,
acumulado no `update` como o `speed.factor` de Corrida dos Parecidos. Se a
posição vier de um tween e o som de `AudioContext.currentTime`, os dois
descolam em minutos de partida.

| | Intervalo entre figuras | Em segundos | Janela de acerto |
|---|---|---|---|
| Nível 1 | 3 tempos | 2,50 s | ± 500 ms |
| Nível 2 | 2,5 tempos | 2,08 s | ± 400 ms |
| Nível 3 | 2 tempos | 1,67 s | ± 400 ms |

---

## 5. Os níveis

A **fase deste jogo é a rotina** — uma por nível, como o trecho é a fase em
Corrida dos Parecidos. Fica dentro do limite de 5 fases por nível do
[INSTRUCOES.md](../../INSTRUCOES.md), mesmo com 8 figuras passando no nível 3.

| Nível | Rotina | O que entra junto | Figuras | O que a criança aprende |
|---|---|---|---|---|
| 1 | **Manhã** (3): acordar → escovar os dentes → tomar café | nada | 3 | o gesto do centro e o compasso |
| 2 | **Escola** (5): acordar → vestir uniforme → tomar café → pegar mochila → ir à escola | 2 intrusos (sorvete, carrinho) | 7 | o aro: "isso não é da rotina" |
| 3 | **Lanche** (5): lavar as mãos → pegar o pão → passar manteiga → comer → guardar a louça | 1 intruso (televisão) + 2 passos **fora de ordem** | 8 | o aro por **ordem**, não por item |

O nível 3 é o pulo do gato: um passo *da própria rotina* chegando cedo demais.
Não dá para resolver reconhecendo "televisão é coisa errada" — só sabendo em que
ponto da rotina se está. É aí que a habilidade fica exposta de verdade.

**Intruso quer dizer "não faz parte desta sequência"**, nunca "coisa errada".
Sorvete, televisão e brinquedo não são tratados como problema; eles só não são o
próximo passo. Confundir costume de família com erro de aprendizagem seria um
defeito pedagógico, não um detalhe.

Os intrusos entram **entre** os passos e não mexem na ordem deles. E eles têm a
mesma aparência das ações válidas: nada de X, vermelho ou cara de erro no
desenho, senão a resposta vem de graça.

---

## 6. Dois erros diferentes, uma trava só

Um jogo de ritmo que para a cada erro deixa de ser jogo de ritmo. A saída é
separar o erro do dedo do erro da cabeça:

**Erro de tempo** — não tocou, ou tocou fora da janela. A figura escapa pela
esquerda, a música segue, e ela **volta ao fim da fila**. Sem trava, sem
cadeado. Errar o tempo é dificuldade motora; travar aqui puniria o polegar, não
o raciocínio. Não emite `WRONG_ANSWER`.

**Erro de julgamento** — tocou o centro em quem não era o próximo passo, ou o
aro em quem era. **TRAVA**, no padrão do catálogo:

1. a música para e a figura congela dentro do alvo, com cadeado (Graphics);
2. o balão diz **qual** figura e **por quê** — "Falta escovar os dentes antes",
   nunca "tente de novo";
3. destrava com o toque certo, **no mesmo tambor** — não existe segundo alvo na
   tela para acertar;
4. depois de 2 erros na mesma figura, a miniatura certa pisca no topo e a zona
   correta do tambor acende;
5. a música retoma no início do próximo tempo, para não perder o alinhamento.

Emite `WRONG_ANSWER`. Na telemetria os dois erros ficam separados: dificuldade
de tempo não pode ser lida como dificuldade de entender a sequência.

Pontos: **+10** de primeira, **+5** depois de trava — pelo `runtimeGameBridge`,
como nos outros jogos. **Nenhum número aparece na tela**, conforme a seção
Pontuação do [INSTRUCOES.md](../../INSTRUCOES.md).

---

## 7. Feedback

| Momento | O que acontece |
|---|---|
| Figura entra na janela | alvo e tambor acendem juntos — é o convite para tocar |
| Acerto no centro | batida grave, a figura dá um pulo, uma cópia reduzida voa até a miniatura no topo, que ganha o carimbo de feito; a próxima miniatura passa a ter destaque |
| Acerto no aro | clique agudo, a figura sai da trilha empurrada para cima, sem carimbo nenhum |
| Trava | música para, cadeado, câmera treme de leve, balão com a frase |
| Fim do nível | reprise da rotina (§8) |

Áudio 100% sintetizado em WebAudio, como Corrida dos Parecidos — nota com
envelope curto e ruído filtrado. Um metrônomo precisa de contador em
milissegundos, não de `seek` em arquivo, e a retomada exata depois da trava sai
de graça. Base: grave nos tempos 1 e 3, estalo nos 2 e 4. Respeita `mute-audio`.

---

## 8. Fim de nível

Primeiro o conteúdo, depois a navegação — a mesma ordem de Corrida dos
Parecidos:

1. **Reprise**: as figuras da rotina entram grandes, uma a uma, na ordem, com
   entrada suave e faísca. ~4 s. É reprise ilustrada com as mesmas texturas, não
   animação articulada.
2. **Estrelas** 3 / 2 / 1 pelo mesmo critério dos outros jogos (90 % / 70 % de
   acertos de primeira).
3. **`showLevelComplete`** com título e subtítulo, `autoAdvance` nos níveis 1 e
   2 e os dois botões no 3. **Sem o campo `message`** — nada de contagem.

---

## 9. Tutorial

Três passos com `createTutorial`, um alvo por passo, frase curta:

1. "Esta é a sua rotina." — destaque na faixa de miniaturas do topo;
2. "Bata no meio quando o próximo passo chegar no círculo." — destaque no alvo,
   com o dedo apontando para o centro do tambor;
3. "Bata na borda no que não é da rotina." — só a partir do nível 2.

O `?` no cabeçalho pausa e reabre o tutorial, como o `replayTutorial` de Corrida
dos Parecidos.

---

## 10. Antes da arte existir

Este jogo não sobrevive sem as figuras — não dá para desenhar "escovar os
dentes" em `fillRoundedRect`. Isso é o oposto de Corrida dos Parecidos, onde o
mundo inteiro é Graphics e o PNG é bônus.

Então o placeholder vem primeiro: `createStepCard(scene, step)` desenha um
cartão arredondado com o número e o nome do passo, no tamanho final da figura
(240 px). O ícone real substitui o cartão quando a textura existe — mesma
checagem `hasTex` de `createItemIcon`. Assim a rodada inteira fica jogável e
ajustável antes de qualquer desenho chegar, e um arquivo que falte em produção
não derruba o jogo.

Ordem de produção:

1. placeholder + trilha + tambor + compasso — a rodada do nível 1 jogável;
2. julgamento centro/aro e a trava;
3. as duas rotinas de 5 passos, intrusos e passos fora de ordem;
4. reprise, estrelas e o painel de fim de nível;
5. arte real entrando no lugar dos cartões;
6. conferência: mudo, pausa pelo `?`, retomada sem salto, e a faixa 16:9 num
   celular em pé.
