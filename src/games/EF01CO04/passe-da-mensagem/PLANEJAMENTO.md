# Passe da Mensagem — EF01CO04

> (EF01CO04) Reconhecer o que é a informação, que ela pode ser **armazenada**,
> **transmitida como mensagem por diversos meios** e **descrita em várias
> linguagens**.

O recado atravessa a quadra em dois passes, desviando do robô, e chega em quem
está esperando do outro lado. A cada passe ele troca de meio — voz, carta,
celular — e o desenho lá dentro continua exatamente o mesmo.

---

## 1. O que a criança decide, e o que ela aprende

São duas coisas separadas, e essa separação é a lição desta versão:

| | |
|---|---|
| **O que ela DECIDE** | por qual caminho passar (o que o robô não está cobrindo) e para quem entregar |
| **O que ela APRENDE** | o recado muda de casca a cada parada e continua dizendo a mesma coisa |

A versão anterior pedia as duas coisas na mesma jogada: a criança tinha que
*comparar linguagens para escolher o alvo*. Era um teste de equivalência
abstrata, com três a seis cartões na tela, para quem tem 6 anos — e por isso
ficou confuso. Aqui a escolha é **espacial e visível**, e a lição acontece
sozinha, na frente dela, como consequência de ter acertado.

---

## 2. O laço

1. O recado está com um colega. A bola-mensagem flutua ao lado da cabeça dele.
2. Dele saem **caminhos até cada alvo**: verde com seta, ou vermelho tracejado
   com ✕ onde o robô está.
3. Um toque no colega escolhido: a bola voa por 0,5 s.
4. Ao chegar, ela **vira outro meio** e um balão mostra `antes = depois`.
5. Segundo toque: a entrega no destinatário. O recado vira o terceiro meio e
   some dentro da caixa.
6. A travessia entregue é guardada no **mural**, no alto à esquerda, com os
   três carimbos dos meios por onde ela passou.
7. Três travessias e o nível acaba.

**Dois toques por travessia, seis por nível.** Três meios aparecem em cada
travessia, sem nenhuma tela de leitura no meio do caminho.

---

## 3. Os caminhos — o coração do jogo

É o único desenho que a criança precisa entender, e ele responde a pergunta
**antes do toque**:

| | |
|---|---|
| **verde, com seta** | dá para passar |
| **vermelho tracejado, com ✕** | o robô está aí |

Como o robô anda, os caminhos mudam de cor sozinhos. Quando **todos** os alvos
válidos estão fechados, a faixa de instrução troca para *"Espere o robô sair do
caminho!"* — esperar vira uma jogada legítima, e não um travamento.

### Os dois raios, e por que são dois

`BLOCK.show = 82` pinta de vermelho. `BLOCK.hit = 60` intercepta de verdade.

A folga é de propósito: quem tocou um instante depois de o caminho fechar ainda
passa. Punir reflexo lento não ensina nada sobre mensagem, e um erro que a
criança não teria como evitar destrói a confiança no desenho verde/vermelho —
que é justamente o que o jogo inteiro pede que ela leia.

---

## 4. Os três meios

| Meio | Como aparece | Cor |
|---|---|---|
| **Voz** | balão redondo com ondinhas de som | ciano |
| **Carta** | envelope com a aba aberta | laranja |
| **Celular** | telefone com tela | roxo |

O desenho de dentro tem **sempre o mesmo tamanho e a mesma posição** nos três.
É essa igualdade que a criança precisa notar; se ele encolhesse dentro do
envelope, a casca passaria a mudar o conteúdo — o contrário do que a habilidade
diz. Por isso um módulo só (`scenes/message.ts`) desenha as três formas, e a
bola em quadra, o mural e os dois lados do balão de comparação saem todos dele.

A roda é fixa — voz → carta → celular → voz — e cada travessia começa uma casa
adiante. Assim a criança consegue prever o próximo meio, e o mural do fim do
nível fica com os três carimbos em ordens diferentes.

---

## 5. A grade

Tela fixa de **1280 × 720** com `Phaser.Scale.FIT`.

| Faixa | y | Conteúdo |
|---|---|---|
| Painel | 10 – 150 | `NÍVEL x/3` e o **mural** à esquerda; o recado (desenho + frase) no centro; `PARA:` e o retrato do destinatário; `?` na ponta |
| Faixa de instrução | 153 – 199 | uma frase curta, que muda conforme a etapa |
| Quadra | 206 – 714 | colegas fixos, robô, destinatários na borda direita |

Posições (x, y do pé):

| Quem | Onde |
|---|---|
| Colegas | (250, 430) · (250, 690) · (640, 430) · (640, 690) |
| Destinatário único | (1105, 515) |
| Dois destinatários | (1105, 375) · (1105, 655) |
| Robô, nível 1 | parado em (498, 416) |
| Robô, níveis 2 e 3 | vai e volta entre (880, 350) e (880, 630) |

A bola fica em `(x + 92, y − 118)` — ao lado da cabeça, não no pé. Os caminhos
saem e entram por aí: passe que sai do pé parece chute, e o que este jogo faz é
**entregar**.

O robô do nível 1 está exatamente sobre a diagonal do primeiro colega até o
colega de baixo-meio, e a mais de 100 px das outras duas linhas. Ou seja:
**uma linha fechada, duas abertas**, sempre. Não é acaso — foi medido.

---

## 6. Níveis

| Nível | Robô | Destinatários | O que se aprende |
|---|---|---|---|
| 1 — Caminho livre | parado, cobrindo uma linha | 1 | olhar o caminho antes de tocar |
| 2 — Robô andando | vai e volta, 2,4 s por trecho | 1 | esperar o caminho abrir |
| 3 — Para quem é? | vai e volta, 1,5 s por trecho | 2 | conferir para quem é o recado |

A mecânica é a mesma nos três. O nível 1 repete o mesmo recado nas três
travessias, para a criança ver a roda dos meios inteira com uma coisa só na
cabeça.

Os seis quadros da folha de personagens são divididos assim: **0–3 em quadra,
4 e 5 esperando**. Ninguém aparece duas vezes — dois rostos iguais na tela
quebrariam justamente a pergunta do nível 3.

---

## 7. O erro

TRAVA no padrão do catálogo, e são dois erros possíveis, cada um com o seu
motivo dito em uma frase:

| Erro | O que acontece |
|---|---|
| Passar pelo robô | ✕ vermelho em quem foi tocado, o robô ergue a bola com cara boba e devolve — *"O robô estava nesse caminho!"* |
| Entregar para o outro | ✕ vermelho no destinatário errado — *"Esse recado não é para ele!"* |

Depois de **dois erros na mesma parada**, um alvo válido e aberto acena.

Não existe trava permanente em caminho nenhum: o vermelho já diz tudo, e um
bloqueio invisível por cima contradiria o desenho. Uma regra só, e ela está
na tela.

Pontos: **+10** de primeira, **+5** depois de erro, pelo `runtimeGameBridge`.
**Nenhum número na tela**, conforme a seção Pontuação do
[INSTRUCOES.md](../../INSTRUCOES.md).

---

## 8. O mural

Fica dentro do painel do topo, à esquerda: três vagas vazias no começo do
nível. Cada travessia entregue vira uma cartinha ali, com o desenho do recado e
os três carimbos dos meios embaixo.

Ele é **progresso e lição ao mesmo tempo** — mostra quantas travessias faltam e
mostra a informação **armazenada**, que é a terceira afirmação da habilidade. É
por isso que não existem bolinhas de fase separadas: seriam duas coisas
ocupando espaço para dizer a mesma.

---

## 9. Feedback

| Momento | O que acontece |
|---|---|
| Parado | a bola pulsa; holofote no chão de quem a tem; o robô do nível 1 flutua de leve |
| Mouse em cima | o colega cresce 5 % |
| Toque | ele afunda e volta |
| Passe voando | 0,5 s, e os caminhos somem |
| Chegou | quem recebeu pula, faíscas verdes, a bola gira e vira outro meio |
| A troca | balão `antes = depois` com o mesmo desenho dos dois lados |
| Intercepção | robô com cara boba, moldura vermelha, câmera treme |
| Entrega | terceira troca de meio, a bola some na caixa, confete, torcida, o mural ganha uma cartinha |
| Fim do nível | fanfarra e o painel com a frase-chave |

A frase *"É a mesma coisa!"* aparece **uma vez por nível**, na primeira troca.
Repetir a cada passe transformaria a prova em leitura obrigatória.

Áudio sintetizado em WebAudio, como nos jogos irmãos. Respeita `mute-audio`.

---

## 10. Antes da arte existir

`createMessage` cai para o nome do recado escrito quando a textura do desenho
não existe, `createCourt` desenha um boneco em Graphics sem a folha
`personagens`, e `createPortrait` mostra só a moldura. Um arquivo faltando não
derruba o `vite build` nem trava a fase.

---

## 11. O que mudou, e por quê

A primeira versão pedia comparação de linguagens como decisão de jogo: "toque
em quem diz a MESMA coisa de outro jeito", com até seis plaquinhas na quadra.
Duas rodadas de correção — etiquetas, veredito `=`/`≠`, trilho, caixa de
correio — melhoraram a leitura de cada peça e não resolveram o problema de
fundo, porque o problema era **a natureza da tarefa**, e não a apresentação
dela.

O briefing já descrevia um jogo mais simples, e é o que está aqui: *"toque no
colega livre para a bola-mensagem chegar ao destino sem o robô interceptar"*.
A decisão virou espacial; a lição virou consequência.

| Saiu | Entrou |
|---|---|
| plaquinhas com assunto + linguagem em cada colega | caminhos verdes e vermelhos saindo de quem tem a bola |
| comparar equivalências para escolher o alvo | desviar do robô, e esperar quando ele fecha tudo |
| a bola era uma bola qualquer | a bola **é** o recado, e troca de casca a cada parada |
| trilho lateral de linguagens | mural dentro do painel, que também é o progresso |
| destino como quadrado amarelo | destinatário com **rosto**, e a pergunta "para quem é?" no nível 3 |

---

## 12. Registro

- pasta: `src/games/EF01CO04/passe-da-mensagem/`
- assets: `src/assets/games/EF01CO04/passe-da-mensagem/`
- slug `passe-da-mensagem`, módulo `EF01CO04/passe-da-mensagem`, ícone ⚽
- entra em `catalog.ts`, `gameInstructions.ts` e no conjunto
  `GAMES_WITH_IN_GAME_COMPLETION_SCREEN` de `GameDetailsPage.tsx`

Arquivos, e o que cada um sabe:

| Arquivo | Responsabilidade |
|---|---|
| `data/levels.ts` | os 3 níveis, os recados, a roda dos meios, o elenco |
| `data/layout.ts` | toda coordenada, na grade de 1280 × 720 |
| `scenes/lines.ts` | a geometria do bloqueio e o desenho dos caminhos |
| `scenes/message.ts` | as três formas do recado, os carimbos e os retratos |
| `scenes/court.ts` | campo, colegas, destinatários e as zonas de toque |
| `scenes/robot.ts` | o vaivém e a cara boba |
| `scenes/ball.ts` | a bola-mensagem e o balão `antes = depois` |
| `scenes/header.ts` | o painel do topo e o mural |
| `scenes/GameScene.ts` | o laço, os erros e a conversa com a plataforma |
