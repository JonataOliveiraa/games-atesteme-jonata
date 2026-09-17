# Raio-X da Máquina — planejamento

Documento irmão: [TEXTURAS.md](./TEXTURAS.md)

**EF05CO05 · 5º ano · Mundo Digital · Arquitetura de computadores**

> **De onde veio este jogo.** O briefing "Dentro da Máquina" levava tarefas a
> cinco estações de um gabinete. Ele repetia o miolo do jogo já publicado nesta
> mesma habilidade — em ambos a pergunta é *qual peça faz isto?* e o cenário é o
> computador de mesa. A troca aceita: **a máquina chega fechada e o raio-X mostra
> o que tem dentro**. A criança não monta nem entrega tarefa; ela **reconhece**.

> **A correção que veio da avaliação (17/09/2026): cinco peças de uma vez é
> demais para celular.** Não é o tamanho do alvo — é a tela cheia. Este plano
> nasce com um teto escrito: **quatro baias nos níveis 1 e 2, seis no nível 3, e
> nunca mais do que isso**. Saíram a ficha lateral de cinco linhas, a legenda
> permanente das silhuetas e o relógio. O §5 é essa conta, feita.

> **A Lia não entra (17/09/2026).** Não há NPC neste jogo. **Quem fala é a
> máquina** — ela tem cara nos dois quadros de `maquina.png`, e o balão do pedido
> sai dela. Uma figura a menos na tela, uma textura a menos para gerar, e o
> objeto que pede é o mesmo que a criança está consertando.

---

## 1. O jogo em três regras

1. **Cada máquina chega para revisão. O raio-X mostra as peças de dentro, cada uma na sua baia.**
2. **A máquina faz um pedido. Toque na baia da peça que faz aquilo.**
3. **Acertou, a peça ganha o nome — e você testa ela num desafio rápido.**

No fim, com as peças conferidas e a energia ligada, a máquina é liberada. Não
existe mais nada para aprender, do primeiro ao último nível.

~~~text
┌──────────────────────────────────────────────────────────────────────┐
│ NÍVEL 1  ●○○      Diga quem faz o quê       ♥♥♥                 ?    │
├──────────────────────────────────────────────────────────────────────┤
│ ╭──────────────────────────────────────────╮▷ ┌──────────────────┐  │
│ │ Quem guarda o meu desenho para amanhã?   │   │  ▄▄▄▄▄   ● ○ ○   │  │
│ ╰──────────────────────────────────────────╯   └──────────────────┘  │
├──────────────────────────────────────────────────────────────────────┤
│ ░░░░░░░░░░░░░░░░░░░ TELA DO RAIO-X ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░ ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐          ░ │
│ ░ │          │  │          │  │          │  │          │          ░ │
│ ░ │   chip   │  │  disco   │  │   tela   │  │  hélice  │          ░ │
│ ░ │          │  │          │  │          │  │          │          ░ │
│ ░ └──────────┘  └──────────┘  └──────────┘  └──────────┘          ░ │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
└──────────────────────────────────────────────────────────────────────┘
~~~

Três coisas na tela: **o pedido** (o balão, com a máquina que o diz à direita),
**a tela do raio-X** (que é onde se toca) e o cabeçalho. Mais nada.

---

## 2. A habilidade, e o teste que ela precisa passar

> **(EF05CO05)** Identificar os componentes principais de um computador
> (dispositivos de **entrada/saída**, **processadores** e **armazenamento**).
>
> Objeto: **Arquitetura de computadores**. Exemplo oficial: explicar os
> componentes básicos e suas funções — **processador, memória**, e exemplos de
> **diferentes dispositivos de entrada e saída**.

O verbo oficial é **identificar**, e o exemplo pede **memória** ao lado do
processador e **diferentes** dispositivos de entrada e saída, no plural. As três
exigências viraram três níveis.

| O que o texto oficial pede | Onde ele está na mecânica |
|---|---|
| **identificar** componentes | o gesto inteiro: reconhecer a peça pela silhueta e pela função pedida |
| **processador** | o chip, que aparece em todos os níveis e nunca é dono de nada que se guarde |
| **memória** | o pente de RAM, sempre no mesmo raio-X que o disco — o par que o ano inteiro confunde |
| **armazenamento** | disco, pendrive e cartão: **três corpos para a mesma função**, para o nome não colar num desenho só |
| **entrada/saída**, no plural | o nível 3 pede a categoria inteira, e a resposta tem mais de uma peça |

### O teste da bolinha

> Troque as peças por bolinhas coloridas sem significado. O jogo muda?

**Acaba.** O pedido diz uma função em palavras de criança — *segura só enquanto
eu pinto*, *guarda para amanhã* — e a resposta sai de reconhecer **o que aquele
desenho é**. Bolinha não é chip nem disco: sobram quatro retângulos iguais e um
chute de um em quatro.

**O briefing falhava por outro lado.** Nele as cinco estações eram fixas, com
nome escrito, e a criança acertava por endereço: *a terceira da esquerda é a
memória*. A correção está em duas decisões dos dados:

- **a mesma categoria aparece com corpos diferentes** — armazenamento é disco na
  1.1, pendrive na 3.2 e cartão na 3.3;
- **a mesma peça aparece em baias diferentes de fase para fase** — decorar
  posição não ajuda, e decorar um desenho não basta.

### O que mudou em relação ao briefing

| Briefing "Dentro da Máquina" | Aqui | Por quê |
|---|---|---|
| 5 estações fixas com nome na placa | 4 baias por fase, conteúdo trocado | cinco alvos com nome escrito é o jogo respondendo sozinho, e é a tela que a avaliação reprovou no celular |
| a faísca viaja pelo circuito | nada viaja | animação de trajeto entre nove pedidos vira espera |
| mini-desafio de 3 toques no processador | não existe | quebra de ritmo por reflexo não tem nada a ver com identificar componente |
| quiz-relâmpago de 3 perguntas no fim | não existe | o nível 3 já é o quiz, jogado |
| plaquinhas se fixam no mapa ao usar | o carimbo cai na peça, dentro da baia | mesma ideia, sem painel novo na tela |
| mapa completo nomeado no fim | o álbum do raio-X no fim do nível | igual, e só aparece quando o nível acaba |

---

## 3. Como isso não vira o jogo irmão

`EF05CO05` já tem jogo publicado: **Monte seu Computador** (id `035`). E o
`EF03CO06` tem dois jogos de entrada e saída, que é metade desta habilidade.

| | Monte seu Computador | Fase de Entrada e Saída (3º ano) | **Raio-X da Máquina** |
|---|---|---|---|
| **estado da máquina** | desmontada, peças na bancada | não há máquina | **fechada, e o raio-X abre** |
| **gesto** | levar a peça ao encaixe | tocar o cartão do aparelho | tocar a baia da peça |
| **o que a criança faz** | **monta** | escolhe o aparelho certo | **reconhece o que já está lá** |
| **onde está a resposta** | na silhueta do encaixe vazio | no cartão, com o nome escrito | na silhueta da peça e na função pedida |
| **o par memória × armazenamento** | uma pergunta de quiz | não existe | é a espinha dos três níveis |
| **entrada e saída** | quatro periféricos na mesa | o aparelho inteiro é a resposta | categoria com **mais de uma** resposta |

Restrições para a distância não encolher durante a construção: **nenhuma peça é
arrastada**, **nenhum encaixe vazio aparece na tela**, e **nenhum nome de peça
fica escrito antes de a criança acertar** — nos níveis 2 e 3 o nome que aparece
antes está justamente errado, ou é a armadilha.

---

## 4. O laço

~~~text
a máquina entra no raio-X
→ as baias acendem, uma peça em cada
→ a máquina faz um pedido
→ a criança toca uma baia
→ o veredito sai da CATEGORIA da peça contra o que o pedido quer
→ acerto: o carimbo com o nome cai na peça e ela sai da disputa
→ erro: a peça tocada mostra o que ela faz de verdade, e a tela trava até o toque certo
→ acabaram os pedidos: a máquina liga e sai
→ três máquinas: o álbum do raio-X, e o próximo nível
~~~

O gesto é sempre um toque numa baia. No nível 3 o toque marca e desmarca, e um
segundo objeto — o botão **LIBERAR** — fecha a resposta.

---

## 5. A resposta à tela cheia: a conta das baias

A avaliação apontou que cinco peças ao mesmo tempo ficam complexas no celular.
Não é o dedo que não alcança; é o olho que não separa. As decisões:

| Decisão | Número |
|---|---|
| alvos simultâneos nos níveis 1 e 2 | **4** |
| alvos simultâneos no nível 3 | **6** |
| menor alvo real num celular de 390 px | **111 × 41 px** (baia do nível 3) |
| maior alvo real | **82 × 120 px** (baia dos níveis 1 e 2) |
| regiões tocáveis na tela inteira | **duas**: a tela do raio-X e o `?`. No nível 3, mais o LIBERAR |

E o que foi cortado para chegar nesses números:

- **a ficha lateral de cinco linhas** — era uma segunda leitura ao lado da
  primeira, e em 390 px cada linha teria 7 px de letra;
- **a legenda permanente das silhuetas** — quem ensina a silhueta é o carimbo que
  cai na peça no momento do acerto, e o tutorial;
- **o relógio** — o jogo é olhar e reconhecer; contar o tempo enquanto a criança
  procura cobra a coisa errada;
- **a placa-mãe realista** — as peças não ficam espalhadas num desenho de
  circuito. Cada uma mora numa **baia**, um retângulo isolado com respiro de
  24 px. É uma prateleira de raio-X, não uma fotografia de dentro do gabinete.

**A regra que não se negocia:** nenhuma peça nova entra na tela sem que outra
saia. Se algum nível precisar de uma sétima baia, ele perde uma antes.

---

## 6. A grade: 1280 × 720

`Phaser.Scale.FIT`, coordenada absoluta em `data/layout.ts`. A última coluna é o
tamanho real num celular de 390 px (fator **0,30**).

### Layout A — níveis 1 e 2

| Faixa | y | x | Conteúdo | Tamanho | No celular |
|---|---:|---|---|---:|---:|
| cabeçalho | 0–82 | 0–1280 | pílula do nível (20), bolinhas das fases (188+), "Diga quem faz o quê" (meio), vidas (1020), `?` (1206) | alvo do `?` 136 × 136 | 41 × 41 |
| **o balão do pedido** | 96–226 | 40–920 | uma frase, no máximo duas linhas de 34 px, com o rabicho apontando para a máquina | 880 × 130 | 264 × 39 |
| a máquina | 90–232 | 950–1240 | a máquina da fase, com 3 luzinhas de progresso | 290 × 142 | 87 × 43 |
| **a tela do raio-X** | 244–706 | 40–1240 | a moldura escura, onde tudo acontece | 1200 × 462 | 360 × 139 |
| — **baia** | 275–675 | cx 176 / 472 / 768 / 1064 | **zona de toque** | **272 × 400** | **82 × 120** |
| — a peça | dentro | — | a arte, centrada na baia | até 220 × 240 | 66 × 72 |
| — o carimbo | rodapé da baia | — | o nome, depois do acerto | 200 × 54, letra 30 | 60 × 16 |

### Layout B — nível 3

| Faixa | y | x | Conteúdo | Tamanho | No celular |
|---|---:|---|---|---:|---:|
| cabeçalho, balão do pedido, máquina | 0–232 | — | igual ao layout A | — | — |
| **a tela do raio-X** | 244–566 | 40–1240 | duas fileiras de três | 1200 × 322 | 360 × 97 |
| — **baia** | 262–400 e 414–552 | cx 245 / 640 / 1035 | **zona de toque** | **370 × 138** | **111 × 41** |
| — a marca | canto da baia | — | o visto que a criança põe e tira | ø 56 | 17 |
| **LIBERAR** | 586–706 | 380–900 | o único botão que compromete | 520 × 120 | **156 × 36** |

Medidas que não se negociam:

- **A tela do raio-X é a única região tocável.** O cabeçalho, o balão do pedido e
  a máquina não recebem toque — exceto o `?`. É isso que permite escurecer a tela
  do raio-X inteira na TRAVA sem apagar o pedido.
- **Duas baias nunca ficam a menos de 24 px uma da outra**, e a zona de toque para
  na borda da baia: alvo colado em alvo faz o dedo cobrir o vizinho, e aqui
  vizinho é resposta errada.
- **O balão do pedido tem largura própria** (880 px, até a máquina) e nunca "a
  tela toda": foi a linha que quebrou por baixo do relógio na EF05CO02.
- **O carimbo mora dentro da baia.** Ele não cresce para fora nem encosta no
  vizinho.

---

## 7. Níveis e fases — o que a máquina entrega de graça

**Fase = uma máquina no raio-X.** Cada nível tem três, sempre com **4 baias**. O
que muda de nível para nível é **quanta ajuda a máquina dá**:

| Nível | Modo | O que a máquina diz | A etiqueta da baia | Desafio da peça |
|---|---|---|---|---|
| **1** | `nome` | **o NOME da peça** e o que ela faz: *"Preciso do PROCESSADOR. É ele que faz as contas."* | **legível** | não tem |
| **2** | `funcao` | só a **função**, sem o nome: *"Preciso fazer a conta 7 + 8. Quem faz isso?"* | **legível** | **depois** do acerto, para ver a peça trabalhando |
| **3** | `mudo` | nada. O **desafio roda primeiro** e depois ela pergunta: *"Qual peça acabou de fazer isso?"* | **embaçada** | **antes**, e é ele a pergunta |

**A etiqueta traz o NOME da peça, não a categoria.** O teclado se chama TECLADO;
"entrada" é o **grupo** a que ele pertence, e grupo não é nome. Na baia lê-se
`TECLADO`, `PROCESSADOR`, `MEMÓRIA RAM`, `DISCO RÍGIDO`, `MONITOR`,
`ALTO-FALANTE`, `PENDRIVE`, `CÂMERA`, `COOLER`, `FONTE`, `CABO`.

**Quem ensina o grupo é a máquina, no acerto.** Cada peça tem uma frase pronta
que liga as duas coisas: *"Isso! O disco rígido é ARMAZENAMENTO: ele guarda mesmo
desligado."* São nove por nível, uma por acerto — e é ali que as cinco palavras
da BNCC entram, sempre presas a uma peça de verdade.

**A etiqueta existe desde que a baia acende, nos três níveis.** É ela que carrega
o andaime: no nível 1 a criança lê o mesmo nome no balão e na baia e só precisa
parear; no nível 2 o nome está lá e ela precisa ligar a função ao objeto; no
nível 3 dá para ver que há um nome escrito e não dá para lê-lo. Acertar
**acende** a etiqueta — ela ganha a cor do grupo e a moldura sólida — e, no
nível 3, **tira o borrão**.

**O intruso também tem etiqueta**, e por necessidade: uma baia sem nome
denunciaria qual é o intruso. `COOLER`, `FONTE` e `CABO` são os nomes de verdade
deles, e a frase de acerto que eles nunca chegam a ouvir diria justamente que não
são entrada, saída, memória nem nada disso.

**O álbum do fim do nível é o único lugar onde as cinco palavras aparecem
sozinhas**, sem peça nenhuma junto — e é de propósito: até ali elas só existiram
coladas a um objeto.

A tela nunca muda: são as mesmas quatro baias, o mesmo balão, o mesmo gesto. O
que é retirado é o **andaime**. No nível 1 a criança só precisa ligar uma palavra
a um desenho; no 2 precisa traduzir uma função em peça; no 3 precisa reconhecer a
função tendo apenas **visto** ela acontecer.

**No nível 3 nada pode entregar a peça.** Os desafios recebem `quiet: true`, e os
dois únicos que mostram a própria peça — o chip e o pendrive — trocam o desenho
por uma forma neutra. Os outros sete já mostram a **ação**, nunca o objeto.

**O desafio da energia só existe nos níveis 2 e 3.** No nível 1 a máquina liga
sozinha: ali o assunto é o nome, e nada mais.

### O nível 1, fase por fase

**Quatro baias: três peças de categorias diferentes e um intruso.** O intruso
(cooler, fonte, cabo) nunca é resposta de pedido nenhum. Ele existe por dois
motivos: é a peça que ensina que **nem tudo dentro do computador é entrada,
saída, cérebro ou memória**, e é o que impede o acerto por eliminação — quem
responde os dois primeiros e chuta o terceiro cai nele.

| Fase | As quatro baias | Os três pedidos | O que estreia |
|---|---|---|---|
| **1.1** | chip · disco · tela · **cabo** | "Quem faz a conta 7 + 8?" · "Quem guarda o desenho para amanhã?" · "Quem mostra o desenho para a turma?" | o gesto, e as três funções mais fáceis de separar |
| **1.2** | teclado · alto-falante · pente · **fonte** | "Por onde entra o que eu digito?" · "Quem toca a música para fora?" · "Quem segura o desenho só enquanto eu pinto?" | entrada e saída, e a memória aparecendo sozinha |
| **1.3** | câmera · pente · pendrive · **cooler** | "Por onde entra a foto?" · "Quem segura a foto só enquanto eu ajusto as cores?" · "Quem guarda a foto para o ano que vem?" | **o par-chave**: pente e pendrive na mesma tela, e armazenamento com outro corpo |

**O intruso de cada fase é escolhido pela cor, não pelo sorteio.** Na arte
entregue, o disco rígido é **cinza**, igual ao cooler e à fonte. Então disco e
cooler nunca aparecem juntos: a 1.1 leva o **cabo** (duas argolas de fio, sem
confusão possível com uma caixa), e a 1.3 troca o disco pelo **pendrive**, que é
verde. É o §2 do [TEXTURAS.md](./TEXTURAS.md) mandando nos dados.

**A 1.1 não tem memória.** Fase de estreia é para aprender o gesto, e o par
memória × armazenamento é o conteúdo mais difícil do ano — pôr os dois no
primeiro pedido ensina a confusão, não a diferença.

**A 1.3 é o degrau.** Os três pedidos são sobre a **mesma foto**, e o que muda é
só o verbo: entra, segura enquanto, guarda para depois. É a fase em que a criança
descobre que a diferença não está no que a peça parece, e sim em **por quanto
tempo ela fica com a coisa**.

### O nível 2, fase por fase

As quatro baias chegam **já carimbadas**. Em cada rodada, **dois carimbos estão
trocados entre si**. A criança toca a baia que está com o carimbo errado e depois
a baia de quem aquele carimbo é. Os dois carimbos trocam de lugar com animação —
é a correção sendo vista, não contada.

| Fase | As quatro baias | As três trocas |
|---|---|---|
| **2.1** | teclado · chip · tela · disco | teclado ↔ tela · chip ↔ disco · teclado ↔ disco |
| **2.2** | microfone · pente · disco · alto-falante | **pente ↔ disco** · microfone ↔ alto-falante · pente ↔ alto-falante |
| **2.3** | câmera · chip · pendrive · impressora | câmera ↔ impressora · chip ↔ pendrive · câmera ↔ chip |

**A primeira rodada da 2.2 é o par-chave outra vez**, agora do avesso: em vez de
perguntar quem segura e quem guarda, o jogo **afirma errado** e a criança tem de
negar. Afirmação errada é mais difícil de derrubar do que pergunta aberta, e é
por isso que ela abre a fase do meio, não a primeira do nível.

**Não há intruso no nível 2**: as quatro baias precisam de carimbo, e carimbo de
categoria não existe para cooler nem para fonte.

**Os dois toques são de tipos diferentes, e o jogo mostra isso.** O primeiro
levanta o carimbo (ele sai da baia e fica pairando, seguindo o pedido); o segundo
o assenta. Enquanto um carimbo está levantado, a baia de origem fica com o lugar
vazio piscando — assim ninguém fica sem saber em que etapa está.

### O nível 3, fase por fase

Seis baias, duas rodadas. O pedido é uma **categoria**, e a resposta pode ter uma
ou duas peças. Um toque marca, outro desmarca, e o **LIBERAR** fecha.

| Fase | As seis baias | Os dois pedidos | A armadilha |
|---|---|---|---|
| **3.1** | teclado · mouse · chip · tela · disco · **cooler** | "Marque tudo por onde a informação ENTRA" → teclado, mouse · "Marque tudo que MOSTRA para fora" → tela | a categoria com **duas** respostas estreia aqui, e a segunda rodada tem **uma só** — para "marque tudo" não virar "marque dois" |
| **3.2** | microfone · pente · disco · pendrive · alto-falante · chip | "Marque tudo que GUARDA mesmo depois de desligar" → disco, pendrive · "Marque tudo que TOCA ou MOSTRA para fora" → alto-falante | **o pente está lá e não entra** — o par-chave pela terceira vez, agora com dois corpos do lado certo |
| **3.3** | teclado · microfone · impressora · tela · cartão · **cooler** | "Marque tudo por onde a informação ENTRA" → teclado, microfone · "Marque tudo que MOSTRA ou entrega para fora" → impressora, tela | duas entradas e duas saídas na mesma tela, que é literalmente o "diferentes dispositivos de entrada e saída" do exemplo oficial |

### Pontuação

Nove fases, **dez pontos cada**, fechando os **90** da ficha. O valor por fase
sai de `30 / fases.length`, nunca escrito na mão. Estrelas 90 / 70. Nenhum número
aparece na tela.

### O cabeçalho, no padrão da família

~~~text
[NÍVEL 1]  ●○○     Diga quem faz o quê     ♥♥♥      ( ? )
~~~

Pílula do nível, uma bolinha por fase, o que fazer no meio, vidas e `?` — a mesma
ordem do Guardião Ético, do Robô Sorrateiro e da Pista Binária. **A bolinha é o
álbum:** ao liberar a máquina, ela voa para a bolinha da fase e a bolinha acende
com a máquina dentro. No fim do nível, as três saem de lá.

---

## 7½. O desafio da peça — acertar o nome não basta

**Acertar o nome é a metade. A outra metade é ver a peça trabalhando.** Assim
que o carimbo assenta, a tela do raio-X vira bancada de teste e a criança **usa**
a peça que acabou de nomear. O desafio dura de 5 a 10 segundos, é sempre um
toque, e **errar nele não custa nada** — não tem vida, não tem ponto, não tem
TRAVA. Quem cobra é o pedido; o desafio é a prova.

| Peça | O desafio | O que ele prova |
|---|---|---|
| **teclado** | digitar **SOL** em cinco teclas, na ordem; as letras voam para dentro da máquina | o que você faz do lado de fora **entra** |
| **câmera** | um rosto passeia; apertar **FOTO** quando ele está na moldura, duas vezes | a imagem **entra** pela peça, e enquadrar é parte do trabalho |
| **chip** | três toques no chip enchem o anel, e a conta `7 + 8` devolve `15` | o processador **trabalha**: a resposta não estava lá |
| **pente** | a memória está cheia; fechar uma coisa para a nova entrar — e então a máquina desliga e **tudo some** | memória **segura enquanto usa** e **esquece ao desligar** |
| **disco** | soltar três arquivos bem em cima do baú; depois a máquina desliga e eles **continuam lá** | armazenamento **guarda mesmo desligado** — o contrário do pente |
| **pendrive** | copiar três arquivos e ver o pendrive sair andando com eles | guarda **e vai junto** |
| **tela** | revelar o desenho faixa por faixa, de cima para baixo; a turma aparece olhando | a saída é o que faz **os outros verem** |
| **alto-falante** | soltar **cinco notas** no anel, cada uma mais rápida que a anterior; no fim a melodia inteira sai de uma vez | a saída também é **som**, não só imagem |
| **o cabo** | no fim de cada máquina: **arrastar** três cabos até os buracos da mesma cor | **energia não é informação** — é a única vez que o intruso trabalha |

**O desafio toma a tela inteira.** Ao abrir, o palco cobre os 1280 × 720, com o
pedido virando título no topo e uma linha de apoio embaixo dele. É a única tela
do jogo que não obedece à grade do §6, e é de propósito: ali não há baia para
proteger, e o espaço todo vira o brinquedo.

**O cabo é o único gesto de arrastar do jogo.** O catálogo proíbe arrastar por
padrão, e aqui a exceção se paga: ligar um cabo é puxar e encaixar, não apontar.
O cabo é uma curva com barriga que acompanha o dedo, e soltar fora de um buraco
devolve o plugue ao lugar sem custo nenhum.

Três decisões que seguram isso no lugar:

- **Um desafio por peça, e não por categoria.** Guardar no baú e levar no bolso
  são a mesma função com gestos diferentes, e é a diferença que fixa o nome. O
  mesmo vale para teclado × câmera e tela × alto-falante.
- **O par memória × armazenamento é o mesmo desafio com o final trocado.** Nos
  dois a máquina desliga no fim; num tudo some, no outro tudo fica. É a única
  forma de a criança **ver** a diferença em vez de a ler.
- **O intruso ganha um lugar honesto.** Cabo, fonte e cooler nunca são resposta
  de pedido nenhum, e por isso o desafio da energia acontece **fora** da rodada
  de nomear, no fecho de cada máquina. A máquina não liga sem ele — e ainda
  assim ele não é entrada, saída, cérebro nem memória.

O desafio mora **dentro da tela do raio-X**, sobre um fundo quase opaco: nenhuma
região nova entra na grade do §6, e as baias continuam onde estavam quando ele
sai. O balão da máquina segue por cima, dizendo o que fazer.

---

## 8. As regras, em código

Nenhuma rodada guarda qual baia é a resposta. Cada peça tem uma **categoria**, e
o veredito é a comparação dela com o que a rodada pede, no instante do toque.

~~~ts
type Categoria =
  | 'entrada' | 'processador' | 'memoria' | 'armazenamento' | 'saida'
  | 'nenhuma'   // cooler, fonte, cabo: está dentro da máquina e não é componente principal

function veredito(toque: Toque, rodada: Rodada, baias: Baia[]): Veredito {
  const baia = baias[toque.baia]

  if (rodada.kind === 'funcao') {
    if (baia.peca.categoria === rodada.pede) return { kind: 'acerto' }
    if (baia.peca.categoria === 'nenhuma')   return { kind: 'erro', motivo: 'intruso' }
    return { kind: 'erro', motivo: 'outraFuncao', dona: baia.peca.categoria }
  }

  if (rodada.kind === 'carimbo') {
    if (toque.etapa === 'levantar') {
      return baia.carimbo === baia.peca.categoria
        ? { kind: 'erro', motivo: 'carimboCerto', dona: baia.peca.categoria }
        : { kind: 'acerto', levanta: baia.carimbo }
    }
    return baia.peca.categoria === toque.levantado
      ? { kind: 'acerto', troca: [toque.origem, toque.baia] }
      : { kind: 'erro', motivo: 'donoErrado', dona: baia.peca.categoria }
  }

  return { kind: 'marcar' }   // 'categoria': o toque só marca; quem julga é o LIBERAR
}

function vereditoDoLiberar(marcadas: Set<number>, rodada: Rodada, baias: Baia[]): Veredito {
  const certas = new Set(
    baias.flatMap((b, i) => (b.peca.categoria === rodada.pede ? [i] : [])),
  )
  const sobrou = [...marcadas].filter(i => !certas.has(i))
  const faltou = [...certas].filter(i => !marcadas.has(i))

  if (sobrou.length) return { kind: 'erro', motivo: 'naoEDaCategoria', baia: sobrou[0] }
  if (faltou.length) return { kind: 'erro', motivo: 'faltouUma' }
  return { kind: 'acerto' }
}
~~~

Erros reais são três: tocar na peça errada; apontar o dono errado do carimbo;
liberar com marcação incompleta ou com peça a mais. **Não são erro:** marcar e
desmarcar no nível 3, demorar, abrir o `?`.

### Validação ao carregar

`levels.ts` valida a si mesmo no `import`, e quebra alto em desenvolvimento:

- toda rodada de função tem **exatamente uma** baia da categoria pedida;
- toda rodada de carimbo tem **exatamente duas** baias com carimbo diferente da
  própria categoria, e elas são **uma o carimbo da outra**;
- toda rodada de categoria tem **pelo menos uma** baia certa e **pelo menos duas**
  erradas;
- nenhuma fase dos níveis 1 e 2 tem mais de 4 baias, e nenhuma do nível 3 tem mais
  de 6. É o teto do §5, escrito onde ele não pode ser esquecido.

---

## 9. O erro, a TRAVA e as vidas

Errar não empurra a fase para a frente: volta para a mesma decisão, com a tela
limpa.

1. **A tela do raio-X escurece** e a baia tocada fica acesa sozinha. O pedido, a
   a máquina continuam iluminados — é lá que está a informação que faltou.
2. **A peça tocada mostra uma plaquinha**, uma linha, dizendo o que ela faz de
   verdade. É a dica, e ela nunca diz qual é a certa:

   | Motivo | A plaquinha |
   |---|---|
   | `outraFuncao` (pente, num pedido de guardar) | *"Eu esqueço tudo quando desliga."* |
   | `outraFuncao` (disco, num pedido de segurar enquanto usa) | *"Eu sou devagar. Eu só guardo."* |
   | `outraFuncao` (chip, num pedido de mostrar) | *"Eu penso, mas não mostro nada."* |
   | `intruso` (cooler, fonte, cabo) | *"Eu só cuido da energia. Não entro, não saio, não penso."* |
   | `carimboCerto` | *"Esse aqui está no lugar. Eu sou memória mesmo."* |
   | `donoErrado` | *"Esse carimbo não é meu."* |
   | `naoEDaCategoria` | *"Uma das marcadas não é por onde entra."* |
   | `faltouUma` | *"Ainda falta uma peça por onde a informação entra."* |

3. **A tela só destrava com o toque certo.** Nada é desfeito: os carimbos já
   ganhos ficam, as marcas do nível 3 ficam.
4. **No segundo erro da mesma rodada**, a baia certa **pulsa** — mostra onde
   olhar, não o que fazer. No nível 3 pulsa a baia que está sobrando ou faltando.

O que a TRAVA não pode ser:

- **nunca vermelho de bronca**: a plaquinha é âmbar, como no resto do catálogo.
  Aqui não há exceção — verde é acerto, âmbar é dica, e ponto;
- **nunca a resposta**: a plaquinha fala da peça **tocada**, nunca da certa;
- **nenhum estado sem saída**: toda marca sai com um toque, e nenhum carimbo se
  perde;
- **demorar não trava.** Não há relógio.

Contabilidade:

- **`WRONG_ANSWER` + `lives.lose()` uma vez por fase**, no primeiro erro. Os
  seguintes na mesma fase não custam outra vida, e o contador **zera em toda
  fase**.
- **`CORRECT_ANSWER` uma vez por fase:** **+10** de primeira, **+5** depois de
  travar.
- `createLives` decide o `GAME_OVER` no zero. O jogo não o emite nunca.
- **Nenhum ponto, porcentagem ou contagem em texto na tela.**

---

## 10. Feedback

| Momento | Visual | Som |
|---|---|---|
| a máquina entra | desliza da direita e para com um repique | rodinha e trava |
| o raio-X liga | uma faixa de luz varre a tela de cima a baixo e as baias acendem atrás dela, uma a uma | zumbido curto subindo |
| o pedido chega | o balão cresce a partir da máquina e a frase é escrita com `FX.type` | teclado leve |
| **acerto** | a baia acende verde, a peça dá um pulinho, **o carimbo com o nome desce e bate** no rodapé da baia | "toc" grave e um "tin" claro |
| depois do acerto | a peça carimbada fica acesa, mais fraca, e sai da disputa | — |
| **erro** | a tela escurece, a baia tocada fica acesa, a plaquinha âmbar sobe dela | "hm?" grave, **nunca alarme** |
| segundo erro | a baia certa pulsa devagar | sopro curto |
| **carimbo levantado** (N2) | o carimbo sai da baia e paira ao lado do pedido; o lugar vazio pisca na baia de origem | "tec" curto |
| **a troca** (N2) | os dois carimbos atravessam a tela e se cruzam no meio do caminho | dois "toc", o segundo mais agudo |
| marcar / desmarcar (N3) | um visto entra ou sai do canto da baia, com a borda acendendo junto | clique seco / clique invertido |
| **LIBERAR certo** (N3) | as marcadas acendem em sequência, da esquerda para a direita | arpejo curto |
| **a máquina liga** | as três luzinhas acendem, o raio-X apaga, a máquina fecha e a **tela dela acende** | fanfarra curta |
| a máquina sai | voa para a bolinha da fase, e a bolinha acende com ela dentro | gole |
| **fim do nível** | **o álbum do raio-X**: as peças nomeadas das três máquinas sobem lado a lado, agrupadas por função | fanfarra `[523, 659, 784, 1047]` e confete |
| painel | `showLevelComplete`, título curto, bolinhas de nível | fanfarra |

O "uau" é o penúltimo: **o álbum**, com as peças que a criança nomeou arrumadas
em cinco colunas — e é ali, e só ali, que as cinco funções aparecem juntas. Elas
nunca dividem a tela durante o jogo; elas se juntam quando a criança já sabe.

Tudo sintetizado em WebAudio, sem arquivo, respeitando `mute-audio` do
`EventBus`. Sem narração.

---

## 11. Tutorial e `?`

**Quatro passos**, na fase 1.1, com a cena já montada — a máquina entra e o
raio-X acende **antes** do tutorial, senão o recorte ilumina tela vazia. Cada
fala diz o que FAZER:

1. *"Esta máquina quer ir para casa."* — recorte na máquina, à direita do pedido.
2. *"O raio-X mostra o que tem dentro dela."* — recorte na tela do raio-X inteira.
3. *"Leia o pedido e toque na peça que faz aquilo."* — recorte na placa do pedido,
   depois na primeira baia, com o dedo **batendo** (`tap: true`).
4. *"Acertou? A peça ganha o nome dela."* — recorte na baia, mostrando o carimbo.

Um passo por nível (`key: 'ef05co05rx-lN'`), com uma frase só:

- **N2:** *"O estagiário carimbou errado. Ache o carimbo trocado e diga de quem ele é."*
- **N3:** *"Agora pode ser mais de uma peça. Marque todas e toque em LIBERAR."*

As coordenadas do dedo saem do objeto de verdade (`posDaBaia(i)`), nunca de
números fixos, para o tutorial funcionar também no replay pelo `?`.

O `?` fica sempre visível no cabeçalho com alvo de 136 px, pausa por flag (nunca
`scene.pause()`, que mataria tween e toque) e reabre o painel.

---

## 12. Antes da arte existir

**O jogo tem de ser jogável e vencível com zero textura carregada.**

São `Graphics`, sempre: a tela do raio-X e a faixa de varredura, as baias e a
borda que acende, o carimbo e a letra dele, o visto do nível 3, a plaquinha
âmbar, a placa do pedido, o botão LIBERAR, o cabeçalho, as vidas, as bolinhas, o
`?`, as estrelas, o confete e a moldura da tela.

São textura: **as peças**, **a máquina** e **o fundo da oficina** — as três já
entregues (17/09/2026). A reserva, para o caso de uma faltar:

- a peça vira um retângulo arredondado com o nome dela escrito grande no meio;
- a máquina vira uma caixa com uma tela e três pontinhos;
- o fundo vira um degradê escuro com uma faixa de bancada.

As texturas entram por `import.meta.glob` + `textures.exists()`, **nunca por
`import` estático**.

### Ordem de produção

1. **Só o nível 1**, com reserva em `Graphics`, jogado de ponta a ponta — é o que
   o `INSTRUCOES.md` manda e é o que o usuário avalia antes de existir arte.
2. A TRAVA vista acontecendo, e uma baia tocada com o polegar num celular.
3. As texturas do [TEXTURAS.md](./TEXTURAS.md), medidas pela caixa alfa.
4. Níveis 2 e 3, que não acrescentam desenho novo: só carimbos, marcas e o botão.

---

## 13. Arquitetura

~~~text
src/games/EF05CO05/raio-x-da-maquina/
├── PLANEJAMENTO.md · TEXTURAS.md
├── index.ts          1280 × 720, Scale.FIT + CENTER_BOTH, [BootScene, GameScene]
├── types.ts          Categoria, Peca, Baia, Rodada, Fase, Level
├── data/
│   ├── layout.ts     as coordenadas do §6, os dois layouts, com o porquê dos números
│   ├── theme.ts      cores, fontes, tamanhos
│   ├── pecas.ts      o catálogo de peças: categoria, quadro na folha, plaquinha
│   └── levels.ts     LEVELS + as funções puras do §8 + a validação
└── scenes/
    ├── BootScene.ts  import.meta.glob + createLoadingScreen + faseInicial
    ├── GameScene.ts  orquestração e estado — não desenha nada
    ├── raioX.ts      a tela, a varredura, as baias, o carimbo, o visto
    ├── pedido.ts     o balão, a máquina e as luzinhas
    ├── sign.ts       a plaquinha âmbar e a TRAVA
    ├── audio.ts      WebAudio sintetizado
    ├── hud.ts        o cabeçalho de ponta a ponta
    └── trials/       os desafios do §7½
        ├── index.ts   o registro peça → desafio
        ├── stage.ts   o palco: fundo, zonas, botão, item
        ├── input.ts   teclado e câmera
        ├── process.ts chip e pente
        ├── store.ts   disco e pendrive
        ├── output.ts  tela e alto-falante
        └── power.ts   o cabo, no fecho da máquina
~~~

Todo desafio recebe um `TrialCtx` e devolve uma `Promise` — ele não conhece a
`GameScene`, não emite evento de plataforma e não mexe em vida nem em ponto. O
`alive()` do contexto carrega o `gen` da cena: trocar de fase no meio de um
desafio o encerra sem escrever nada.

**A GameScene não desenha nada.** Se ela precisar de um `fillRoundedRect`, falta
um painter em `scenes/`.

`gen` (geração) em toda rodada: `const gen = ++this.gen`, e todo `await` é
seguido de `if (gen !== this.gen) return`.

**A zona de toque é solta**, criada nas coordenadas absolutas da baia, e
destruída na mão a cada troca de fase. O interruptor é `zona.input.enabled`,
**nunca** `setVisible(false)` — zona invisível não recebe toque.

### A conversa com a plataforma

`runtimeGameBridge`, nunca `gameBridge`. `GAME_READY` uma vez; `CORRECT_ANSWER` e
`WRONG_ANSWER` uma vez por fase; `CHECKPOINT` a cada fase com o progresso sobre
`TOTAL_FASES`; `GAME_COMPLETED` ao concluir **cada** nível, com
`totalStages: LEVELS.length`. `GAME_OVER` sai de `createLives`, nunca do jogo.
`stage` é o número do **nível**, de 1 a 3.

---

## 14. Registro

| Item | Valor |
|---|---|
| Pasta | `src/games/EF05CO05/raio-x-da-maquina` |
| Assets | `src/assets/games/EF05CO05/raio-x-da-maquina` |
| Slug | `raio-x-da-maquina` |
| Título | `Raio-X da Máquina` |
| Ícone | `🩻` (livre no catálogo; o vizinho `🩺` já está em uso) |
| Habilidade | `EF05CO05` · `years: [5]` · `order: 355` |
| Categoria | `Pensamento Computacional` · `points: 90` |
| Catálogo | `src/data/catalog.ts` |
| Instruções | `src/data/gameInstructions.ts` |
| Tela de fim interna | `src/pages/GameDetailsPage.tsx` |

As três linhas de `gameInstructions.ts`:

~~~text
Uma máquina entra no raio-X e você vê as peças de dentro.
Leia o pedido da máquina e toque na peça que faz aquilo.
Se errar, a peça diz o que ela faz de verdade. Tente a outra.
~~~

---

## 15. Critérios de aceite

### A criança entende sozinha

- [ ] ao abrir, dá para dizer em três segundos onde se toca;
- [ ] a diferença entre o pente e o disco é dita por uma frase de uma linha, e
      essa frase aparece no momento do erro, não antes;
- [ ] nenhuma fase tem mais de 4 baias (6 no nível 3);
- [ ] o carimbo é lido a 60 × 16 px reais;
- [ ] nenhum texto na tela explica o que é entrada, saída, memória ou
      armazenamento fora de um pedido ou de uma plaquinha.

### É justo

- [ ] o acerto por eliminação leva ao intruso nos níveis 1 e 2;
- [ ] a mesma categoria aparece com corpos diferentes ao longo do jogo;
- [ ] a mesma peça não fica na mesma baia em duas fases seguidas;
- [ ] errar volta para a mesma decisão, sem perder o que já foi ganho;
- [ ] uma vida por fase, no máximo.

### BNCC

- [ ] as cinco categorias aparecem nos três níveis;
- [ ] entrada e saída aparecem com **mais de um corpo** cada (teclado, mouse,
      microfone, câmera; tela, alto-falante, impressora);
- [ ] o par memória × armazenamento é exercitado uma vez por nível, de três
      ângulos diferentes: pergunta, afirmação errada e categoria.

### Antes de dizer que está pronto

- [ ] `npx tsc --noEmit` limpo;
- [ ] `npx eslint src/games/EF05CO05/raio-x-da-maquina --ext .ts` limpo;
- [ ] uma fase inteira jogada no navegador, e a TRAVA vista acontecendo;
- [ ] mudo funciona; `?` pausa e reabre o tutorial; retomada sem salto;
- [ ] jogado com `?embed=1&inline=1&stage=1&points=0&lives=3`;
- [ ] nenhum gancho de depuração sobrou (`window.__algo`).

---

## 16. O que ficou para decidir

- **O intruso do nível 3.** Ele está na 3.1 e na 3.3 e não na 3.2. Se a 3.2 ficar
  fácil demais no teste, o cooler entra no lugar do chip — que já está lá e nunca
  é resposta de entrada nem de saída.
- **A varredura do raio-X.** Ela é bonita e custa um segundo por fase. Se, no
  teste, esperar incomodar, ela passa a acontecer só na primeira fase de cada
  nível.
- **O nome "baia".** No código ele é `bay`. Na tela não aparece nome nenhum — é só
  um retângulo — mas se o tutorial precisar chamá-lo de alguma coisa, a palavra
  para a criança é **"janelinha"**, não "baia".

---

## 17. O que mudou na construção — o nível 1 (17/09/2026)

**Só o nível 1 existe em `levels.ts`.** É o que o `INSTRUCOES.md` manda para
avaliação. Os níveis 2 e 3 estão escritos no §7 e não foram codificados: quando
entrarem, `LEVELS.length` vira 3 sozinho e o `totalStages` da plataforma
acompanha, porque ele é derivado.

O que saiu diferente do plano, jogando:

| Decisão | Por quê |
|---|---|
| **A Lia não existe.** Quem fala é a máquina | o usuário cortou o NPC; a arte da máquina tem cara nos dois quadros, então o balão sai dela e a tela perdeu uma figura |
| **O intruso da 1.1 virou o cabo, e a 1.3 troca o disco pelo pendrive** | na arte entregue o disco rígido é **cinza**, igual ao cooler e à fonte. Duas peças cinza na mesma tela seria erro de vista, não de conteúdo |
| **A plaquinha do erro sai da peça tocada**, e não do centro da tela | centrada, ela não dizia QUEM estava falando. Agora nasce sob a baia tocada, grudada na borda quando a baia é a primeira ou a última |
| **A peça tocada por engano sobe acima do véu** | com tudo escurecido por igual, não dava para ver que era ela que falava |
| **Toda baia sem nome mostra uma etiqueta tracejada vazia** | os primeiros testes tinham 150 px de baia vazia embaixo da peça, e a tela parecia inacabada. O tracejado diz "o nome vem aqui" |
| **O cutucão de inatividade virou um pulso**, e não uma reescrita da frase | reescrever a frase a cada 13 s com a máquina de escrever deixava a tela inquieta, e a criança podia responder no meio da digitação |
| **O álbum do fim de nível é um empilhado de cinco etiquetas**, sem peça nenhuma | é o único momento em que as cinco funções aparecem juntas, e ele tem de caber na tela do raio-X sem virar mais uma grade |
| **O balão some junto com a máquina** | ele ficava vazio e branco depois que ela saía, o que lia como defeito |

**Sobre testar no navegador:** o painel só desenha quadro quando alguém tira
print, então o laço do Phaser fica congelado entre capturas — e uma plaquinha que
não aparecia parecia bug, mas era o laço parado. O jeito é expor a cena e bombear
(`game.loop.step`), alternando com `await new Promise(r => setTimeout(r, 0))`
para as promessas resolverem. **O gancho foi removido no fim.**

Pendências abertas:

- [x] gerar `cover-raio-x-da-maquina.png` e ligar o `thumbnail` no catálogo
      (17/09/2026);
- [ ] trocar `status: "draft"` por `"published"` depois de uma partida completa
      jogada por uma criança.

### Revisão 3 — os três andaimes, e a tela cheia (17/09/2026)

**A revisão substituiu "quer ir para casa".** Um computador não vai para casa;
ele passa por uma revisão. A ficção nova explica de uma vez o nomear, o testar, o
ligar a energia e o liberar.

**Os três níveis deixaram de crescer por quantidade e passaram a crescer por
andaime** (§7). O que era o nível 1 virou o nível 2; o nível 1 novo mostra o nome
da peça e não tem desafio; o nível 3 inverte a ordem e usa o desafio como
pergunta. Saíram do plano antigo os carimbos trocados e as seis baias com
multisseleção: eram outra mecânica, e não outro grau da mesma.

**O desafio virou tela cheia**, com título e linha de apoio próprios. O balão da
máquina deixa de aparecer durante ele — quem fala é o palco.

**As texturas `coisas.png` e `rostos.png` entraram**, e com elas os desafios
deixaram de manipular retângulos coloridos: o arquivo que cai no baú é um desenho
de criança, o que a tela revela é o mesmo desenho, e o rosto que a câmera
enquadra é uma criança de verdade. A reserva em `Graphics` continua lá para o
caso de uma folha faltar.

**O `Graphics` dos desafios foi refeito** com a área maior: teclado com base
azul, visor de câmera com linhas de guia e ponto de gravação, painel de
calculadora e soquete com contatos dourados, pentes de memória com contatos,
baú com tampa que abre, monitor com moldura e pé, caixa de som com dois cones, e
os cabos como curvas grossas com barriga.

**O áudio foi refeito.** Saíram os bips: agora há um barramento com eco curto,
vozes duplas levemente desafinadas nos acordes, ruído filtrado para o que é
atrito e clique, e sons próprios para tecla, obturador, pensar, soltar, esquecer
e encaixar.

### Revisão 4 — o plugue e a melodia (17/09/2026)

**O plugue passou a TAMPAR a tomada.** Ele encostava de lado e deixava a boca do
buraco à mostra, o que lia como "quase encaixou". Agora o corpo do plugue é um
tico maior que a boca (156 × 120 contra 148 × 112), ele pousa no **centro** do
buraco, e os dois pinos somem quando a tomada é ocupada — quem fica à vista é só
o aro colorido em volta. O pescoço do cabo saiu para a esquerda do corpo, então a
curva entra no plugue em vez de nascer do meio dele.

**O alto-falante virou uma melodia.** Eram três notas iguais subindo no mesmo
tempo; agora são **cinco**, cada uma de uma cor, cada uma um pouco mais rápida
que a anterior, e o que a criança preenche é uma **pauta** no alto da tela onde
os pontos sobem degrau a degrau. Cada nota lançada faz a caixa pulsar e soltar
duas ondas concêntricas. No fim, a melodia inteira toca de uma vez com uma onda
por nota — é o prêmio, e é a coisa mais "saída" que o jogo faz.

A caixa de som também foi refeita: estava 4 px fora do centro e tinha um cone
chapado. Agora é um gabinete com brilho no topo, cone grande com anel interno e
reflexo, e um tweeter embaixo.

### Revisão 5 — a etiqueta é o andaime (17/09/2026)

**O nome da peça deixou de ser prêmio e virou apoio.** Ele aparecia só depois do
acerto, voando da tela para a baia; agora ele **está lá desde o começo**, apagado,
nos níveis 1 e 2, e **embaçado** no nível 3 (§7).

Três consequências no código:

- o carimbo não voa mais. O que acontece no acerto é a etiqueta **acender**:
  ganha a cor da categoria, a moldura fica sólida e ela dá um salto de escala.
  Some o `STAMP.riseCy` e o `STAMP.big` do layout;
- o borrão do nível 3 é `preFX.addBlur`, e ele pede **corpo**: com a letra
  apagada o borrão sumia e a baia parecia sem etiqueta. A letra borrada é creme e
  opaca. Sem WebGL não há `preFX`, e o `?.` cai num alfa baixo — degrada para
  "fraco" em vez de quebrar;
- **os intrusos ganharam nome**, porque uma baia vazia entregaria qual deles é o
  intruso.

### Revisão 6 — nome é nome, grupo é grupo (17/09/2026)

A etiqueta trazia `ENTRADA` embaixo do teclado e `SAÍDA` embaixo do monitor, e
isso está errado: **entrada e saída são classificações, não nomes**. Um teclado
não se chama "entrada".

O conserto separou as duas coisas, e de quebra melhorou o ensino:

- **a etiqueta virou o nome real** da peça (`TECLADO`, `DISCO RÍGIDO`,
  `MEMÓRIA RAM`, `MONITOR`, `ALTO-FALANTE`…). Cada peça de `data/parts.ts` ganhou
  um campo `name`;
- **o grupo passou a ser dito pela máquina no acerto**, numa frase que amarra os
  dois: *"Isso! O alto-falante é uma SAÍDA: por ele o som sai de mim."* É o campo
  `confirm`, também por peça;
- **os pedidos do nível 1 passaram a citar o nome real** — antes pediam
  "a ENTRADA", agora pedem "o TECLADO". No nível 1 a criança lê a mesma palavra
  no balão e na baia, que era todo o propósito daquele nível;
- **a cor da etiqueta acesa continua sendo a do grupo**, então o grupo ganha um
  segundo canal, visual, sem gastar texto.

O nível 2 não mudou: ele já perguntava pela função, e agora a resposta é um nome
de verdade em vez de uma categoria.

### Revisão 2 — a revisão, e os desafios (17/09/2026)

Duas correções vindas da avaliação:

**"Quer ir para casa" não fazia sentido para um computador.** A ficção agora é
uma **revisão**: cada máquina chega à oficina, o raio-X abre, a criança nomeia
cada peça, testa, liga a energia e libera. Os pedidos passaram a ser em primeira
pessoa e explicam o desafio que vem a seguir — *"Preciso fazer a conta 7 + 8.
Quem faz isso aqui dentro?"* em vez de *"Quanto é 7 + 8?"*.

**Cada peça ganhou o seu desafio** (§7½). O laço do §4 cresceu um passo:

~~~text
→ acerto: o carimbo com o nome cai na peça
→ a tela do raio-X vira bancada e a criança USA a peça
→ próximo pedido
...
→ acabaram os pedidos: o desafio da ENERGIA, e só então a máquina liga
~~~

Uma máquina passou de três toques para cerca de doze, e de ~30 s para ~90 s. O
nível 1 fica em torno de 4 a 5 minutos, que é o teto do catálogo.

O que os desafios **não** podem virar, e está travado no código:

- **não cobram vida nem ponto.** `chargeOnce` e `CORRECT_ANSWER` continuam
  amarrados só ao pedido. Errar a mira, perder a nota ou plugar na cor errada
  custa zero;
- **não abrem região nova.** Tudo acontece dentro do retângulo do raio-X, sobre
  um fundo a 98% de opacidade. O teto de alvos do §5 vale lá dentro também;
- **não têm texto longo.** Uma linha de 32 px no topo do palco, trocada conforme
  o desafio anda, e o balão da máquina por cima dizendo o que fazer.
