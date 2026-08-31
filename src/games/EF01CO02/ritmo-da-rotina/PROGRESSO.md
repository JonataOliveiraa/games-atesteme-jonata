# Ritmo da Rotina — progresso

Cada item é fechado por um subagente construtor e depois julgado por um
subagente revisor, que joga o jogo com olhos de criança de 6 anos. Um item só
vira `feito` quando o revisor aprova.

**Regras que valem para todo item**

- criança de 1º ano: pouco texto, alvo grande, resposta imediata a cada toque;
- tela fixa de 1280×720, `Scale.FIT`, coordenada absoluta — sem layout relativo;
- identificadores em inglês, poucos comentários, só onde a intenção não é óbvia;
- nenhum número de ponto, acerto ou erro na tela;
- todo desenho novo mora nos módulos de `scenes/`, nunca dentro da `GameScene`;
- `npx tsc --noEmit` limpo para os arquivos do jogo ao fim de cada item.

| # | Item | Arquivo dono | Estado |
|---|---|---|---|
| 1 | Caminho e alvo: deixar óbvio o instante de bater | `scenes/stage.ts` | feito |
| 2 | Dois botões: tambor "é esse" e o redondo "agora não" | `scenes/controls.ts` | feito |
| 3 | Partitura: painel com moldura, fita do nome, miniaturas | `scenes/sequence.ts` | feito |
| 4 | Acerto e erro: explosão, voo até a partitura, moldura piscando | `scenes/GameScene.ts` | feito |
| 5 | Áudio: tique-taque, tambor, mão, sequência de acertos | `scenes/audio.ts` | feito |
| 6 | Abertura e tutorial: o propósito do jogo em 5 segundos | `scenes/GameScene.ts` | pendente |
| 7 | Reprise da rotina no fim de cada fase | `scenes/recap.ts` | feito |
| 8 | Três fases por nível, distratores e passos fora de hora | `data/routines.ts` | feito |
| 9 | Passe final: celular, mudo, pausa, desempenho | — | pendente |

## Anotações do revisor

**Passe visual de 31/08** — pedido do usuário, feito de uma vez porque era uma
só linguagem visual:

- o tambor saía pela borda de baixo e ocupava meia tela: 306 px e mais alto;
- as zonas invisíveis do aro viraram um botão redondo vermelho, visível;
- o piso escuro com marcas de compasso e trilhos saiu — era ele que fazia o
  jogo parecer duas coisas grudadas, um quarto de brinquedo em cima de um jogo
  de ritmo. No lugar entrou o CAMINHO DO DIA, claro, com o mesmo acabamento
  dos móveis do desenho;
- o metrônomo de bateria virou tique-taque de relógio, que combina com rotina
  e não disputa o primeiro plano;
- o nome da rotina ganhou fita dentro do painel, e encolhe até caber;
- a janela de acerto passou a ser medida em PIXELS e vale exatamente o anel:
  "figura dentro do círculo" agora quer dizer "pode bater", sem margem
  invisível.

**Passe de 31/08, segunda rodada**

- painel do topo mais baixo: o anel do alvo cabe INTEIRO abaixo dele. Antes o
  painel cortava o anel pela metade e parecia defeito de desenho;
- tambor na ESQUERDA, embaixo do alvo — o que entra no círculo desce direto
  para a mão que bate; a mãozinha vermelha foi para a ponta oposta;
- o X virou mão aberta: X é símbolo de escola, mão é gesto;
- o brilho amarelo que tomava a tela ao armar virou contorno em volta do couro
  e um anel que pulsa. A figura a julgar voltou a ser a coisa mais visível;
- plaquinha com o nome da tarefa presa embaixo de cada figura;
- TRÊS FASES por nível, com a rotina crescendo dentro do nível (3, 4 e 5
  passos), e bolinhas no painel dizendo em qual fase se está;
- reprise no fim de CADA fase: cada passo estala no meio e se encaixa numa
  fileira, como um filme curto do dia;
- explosão maior a cada três acertos seguidos, com arpejo próprio;
- moldura da tela pisca verde no acerto e vermelha no erro.

**Um travamento consertado no caminho**

Um passo da rotina recusado por chegar cedo era descartado para sempre. Bastava
a criança perder um passo no tempo para os seguintes chegarem fora de ordem,
serem corretamente recusados e sumirem — e a fase ficava sem como terminar.
Agora "agora não" quer dizer DEPOIS: o passo volta para o fim da fila, e só
distrator e passo já feito somem de vez. Tem ainda uma rede de segurança
(`refillIfDry`) que repõe o que falta se a fila secar.

**Passe de 31/08, terceira rodada**

- a fila deixou de ser horário fixo: sempre que ela muda, o passo que a rotina
  espera é trazido para no máximo uma figura de distância e os horários são
  recarimbados a partir de agora. Distrair-se no primeiro passo não custa mais
  o dia inteiro de espera (`reschedule`);
- deixar passar quem devia ser recusado agora conta como erro, com aviso
  subindo DO BOTÃO da mãozinha — balão no meio do caminho taparia a próxima
  figura. Escapar de quem devia ser pego continua sem penalidade: erro de dedo
  não é erro de cabeça;
- trava de repique de 130 ms nos toques. Cada toque criava um anel que crescia
  por meio segundo; batendo rápido eles se empilhavam e pareciam um anel só
  inflando sem parar. Os anéis também ficaram menores e mais curtos;
- a mão do botão de recusa passou a ser `mao-silhueta.png`.

**Ainda em aberto**

- o anel parado é pálido demais: pede um pictograma dentro (pegada, relógio);
- figura que passa sem toque não avisa nada — falta um sinal de "deixei passar";
- itens 4 a 9 do quadro continuam pendentes.
