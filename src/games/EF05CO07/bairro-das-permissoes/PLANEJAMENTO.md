# Bairro das Permissões — planejamento

Documento irmão: [TEXTURAS.md](./TEXTURAS.md)

**EF05CO07 · 5º ano · Mundo Digital · Sistema operacional** · id **128** · pasta `src/games/EF05CO07/bairro-das-permissoes/`

> **(EF05CO07)** Reconhecer a necessidade de um sistema operacional para a execução de programas e gerenciamento do hardware.
>
> Exemplo oficial: os dispositivos físicos que compõem um computador não funcionam sozinhos. É preciso mostrar que a operação desses dispositivos é controlada por um software que denominamos Sistema Operacional (gerenciamento da memória, de sistemas de arquivos, de dispositivos de entrada e saída…).

**De onde veio (20/10/2026).** A ficha *Torre de Comando* repetia o Maestro do Sistema (082): programas pedindo recurso, fila, travado, botão de caos. O usuário escolheu, de uma lista de sete ideias, o *Porteiro das Permissões*, e mudou a forma: *"o jogador [...] está num bairro de componentes, e ele precisa ir nas casas que chamarem"*. Depois trocou a moto por *"uma criança mesmo correndo, e ela desliza um pouco enquanto corre, pra dificultar um pouco, mas ela deve ir andando até as casas, o bairro poderia ser maior, permitindo que a criança ande e explore mais e tenha mais casas (mas não deixe as casas uma perto da outra)"*. E mandou: *"faça o jogo só com N1, usando Graphics, as texturas eu adicionarei em breve"*.

**A mochila (20/10/2026).** Depois de ver o N1: *"o jogador deveria ter uma mochila com 3 espaço pra guardar os componentes (camera, microfone, alto falante, etc.), indo na casa de um ele guarda na mochila. com isso, as casas que pedem o uso de camera, mic, etc. o jogador deve dar acesso caso tenha na mochila. e tbm, ao andar, ao correr, o header deveria ser ocultado"*. O texto de quem chama ficou a critério nosso (§6.1).

---

## 0. Por que não é nenhum dos irmãos

| Irmão | O que a criança faz | O que o Bairro faz diferente |
|---|---|---|
| **Maestro do Sistema (082)** | dá a vez a programas que disputam uma peça só | ninguém disputa nada: a questão é **quem pode chegar perto da peça**, e a peça mora longe |
| **Sistema Operacional (037)** | toca na peça que atende o pedido, olhando o estado dela | o pedido já diz a peça. O que se julga é **se o programa precisa dela**, e quem atende é o corpo da criança indo até lá |
| **Um Dia no Celular (EF04CO07)** | no N3, uma janela de *Permitir / Não permitir* dentro de um celular simulado, como **dona** dos dados | aqui a criança **é o sistema**, não a dona. A permissão é o pedaço visível de uma coisa maior: os programas **não alcançam** as peças sem ela. No N2/N3 o NÃO também vem do estado da peça (ocupada, desligada pelo dono), que é gerenciamento de hardware e não ética de dados |
| **Kit do Solucionador (EF05CO11)** | anda pela vila com um raio de alcance | lá o verbo é cobrir casas; aqui é **levar ou recusar um pedido**, uma casa de cada vez |

---

## 1. O jogo em uma frase

**O bairro é o computador: os programas moram de um lado, as peças do outro, e só você, o SISTEMA, pode andar entre eles. Corra até a casa que chama e decida: PODE ou NÃO PODE?**

## 2. A habilidade na tela

| A habilidade pede | Onde está |
|---|---|
| **a necessidade** do SO | a abertura mostra o bairro **sem a criança**: os programas pedem das janelas, as oficinas das peças ficam de portão fechado, e nada acontece. Sem o sistema, ninguém se fala |
| o SO **executa programas** | o programa só funciona quando a peça chega: as Fotos tiram a foto, a Música toca |
| o SO **gerencia o hardware** | a peça mora numa oficina de portão fechado, e só o sistema abre. Quem decide quem usa a câmera é ele |
| dispositivos de entrada e saída | câmera e microfone (entram), alto-falante (sai) |
| sistema de arquivos | os CONTATOS moram numa casa de guardados: o sistema também cuida do que está salvo |

## 3. As quatro regras

1. **A casa que chama solta fumaça e tem uma seta em cima.** Corra até a porta dela.
2. **Na porta, o programa diz o que quer.** Se ele **precisa** daquilo para fazer o que faz, **PODE**. Se não precisa, **NÃO PODE**.
3. **PODE: a peça sai da sua mochila e vai para o programa**, e ele funciona. Se a peça não está na mochila, busque na oficina dela e volte.
4. **A mochila tem 3 lugares.** Passou pela porta de uma oficina, o portão abre e a peça entra na mochila. Cheia, o portão só balança.

## 4. O corpo: correr e deslizar

O pedido do usuário foi um corpo no bairro, com um pouco de dificuldade de controle. Esse controle é **diversão e caminho**, nunca a prova: o catálogo encerra a partida em um erro, e **erro de dedo não pode encerrar** ([INSTRUCOES](../../INSTRUCOES.md#o-que-é-erro-e-o-que-não-é)).

| Plataforma | Gesto |
|---|---|
| **celular** | **segure o dedo** em qualquer ponto do bairro: a criança corre naquela direção. **Solte**, e ela desliza um pouco até parar |
| **computador** | o mesmo com o mouse, **ou** setas / WASD |

- **O deslize** é inércia: a criança acelera, tem velocidade máxima e, sem comando, perde velocidade aos poucos (uns 2 metros de tela). Na curva ela derrapa: a velocidade antiga demora a virar. Os números ficam em `RUN`, em `data/layout.ts`, para afinar jogando.
- **Bater** numa casa, árvore ou cerca só empurra de volta, com *boing* e um amassadinho. Nunca custa nada.
- **Chegar na porta freia sozinho.** A porta tem um raio largo; entrou nele, a criança para com uma derrapadinha. Assim o deslize não passa direto pela casa.
- **Entrar numa casa nunca é resposta.** A resposta é um botão (§6), e os botões só ligam meio segundo depois de o painel abrir: um dedo que vinha segurando para correr não aperta nada sem querer.
- **Sem cronômetro.** Com deslize e mapa grande, relógio vira prova de coordenação, e tempo esgotado encerra. A pressa é só de enfeite: a fumaça da casa que chama.
- **O cabeçalho some enquanto ela corre.** Andou mais de 140 ms, a faixa (nível, bolinhas, `?`) sobe e desbota; parou por 380 ms, ela volta. O recado do momento fica no alto com fundo próprio (§6.1). A câmera agora ocupa a tela inteira, e o cabeçalho passa **por cima** do bairro: escondido, mostra o mapa de verdade. Os enquadramentos (porta, casa, bairro inteiro) descontam os 96 px do cabeçalho para nada ficar embaixo dele. Números em `HEADER`, `data/layout.ts`.

## 5. O bairro

**Mapa de 3000 × 1900**, cerca de três telas de largura. A câmera segue a criança.

~~~text
┌──────────────────────────────────────────────────────────────────────┐
│   FOTOS          CÂMERA          CONTATOS         LANTERNA           │
│   (app)          (peça)          (guardado)       (app)              │
│ ═════════════════ rua de cima ═════════════════════════════════════  │
│  ║        🌳          🌳     ║     🌳         🌳           ║          │
│ ═╬══════════════ avenida ═══( ⛲ praça )════════════════════╬═════  │
│  ║    🌳           🌳        ║  ☺ começa aqui    🌳          ║          │
│ ═════════════════ rua de baixo ════════════════════════════════════  │
│   MÚSICA        ALTO-FALANTE      MICROFONE      CALCULADORA         │
│   (app)          (peça)           (peça)          (app)              │
└──────────────────────────────────────────────────────────────────────┘
~~~

- **Duas famílias de casa, que não se confundem.** **Casa de programa**: casinha colorida com telhado, porta redonda e uma **placa** no telhado com o desenho do que o programa faz. **Oficina de peça**: galpão cinza-azulado com **portão de enrolar** e a placa da peça. O nome de cada uma vai logo abaixo da placa, no beiral, escrito pelo código.
- **Casas longe umas das outras**, como pediu o usuário: no mínimo **650** de distância entre centros (a validação de `data/levels.ts` reclama em dev se ficar menos).
- **As ruas são do código**, e não da arte, porque dependem de onde as casas estão. A criança pode correr na grama também: rua é para se orientar, não é trilho.
- **Achar quem chama:** a casa que chama solta **fumacinha** e tem uma **seta que pula** em cima. Fora da vista, uma **setinha na borda da tela** aponta para ela (o mesmo módulo do Cabo Certo).

## 6. O laço de um chamado

1. **Uma casa de programa chama.** Fumaça, seta em cima, setinha na borda com o ícone dela, e o recado do alto diz **[ícone] "As FOTOS estão chamando!"**. Se a casa está fora da tela, a câmera vai até ela e volta.
2. **A criança corre até a porta.** Ao chegar, freia, e abre o **painel da porta**: o desenho do programa, uma seta e o desenho da peça; a frase *"O app de FOTOS quer a CÂMERA."*; e dois botões grandes e afastados, **PODE** (verde, ✔) e **NÃO PODE** (vermelho, ✖). O recado do alto vira **"Pode ou não pode?"**.
3. **PODE (e podia), com a peça na mochila:** `CORRECT_ANSWER`. A peça sai do bolso da mochila, voa até a placa do programa, e ele **funciona**: flash nas Fotos, notas na Música. Legenda **PODE!** O bolso fica vazio.
4. **PODE (e podia), sem a peça:** `CORRECT_ANSWER` na hora do toque (a decisão já foi certa). A oficina ganha a seta e o anel, a câmera mostra onde ela fica, e o recado diz **[ícone da peça] "Busque a CÂMERA!"**. Na porta da oficina a criança freia, o portão **abre** e a peça voa para a mochila. Então o recado diz **[ícone do programa] "Leve a CÂMERA para as FOTOS!"**, e na porta do programa a entrega acontece como no passo 3, sem painel.
5. **Mochila cheia na oficina que ela foi buscar:** abre o **cartão de troca**. O recado diz **"Falta lugar para a CÂMERA!"** e o cartão pergunta **"Qual peça sai da mochila?"**, com as três peças grandes e com nome. A escolhida volta voando para casa, e a nova entra no lugar dela. Trocar nunca custa nada.
6. **NÃO PODE (e não podia):** `CORRECT_ANSWER`. Um **carimbo NÃO** bate no desenho da peça, o programa murcha e a legenda diz **PROTEGIDO!**. Se a peça estava na mochila, ela fica lá.
7. **Chamado cumprido:** a bolinha do cabeçalho fica verde, e outra casa começa a chamar.
8. **Parou 7 segundos sem correr:** a bolinha de toque aparece, pulsando com ondinhas, na direção do alvo do momento (a casa, ou a oficina quando é para buscar).

### 6.1 A mochila e o recado

- **A mochila mora na borda esquerda**, entre o cabeçalho e a faixa de erro: o desenho da mochila em cima e **três bolsos redondos** embaixo, vazios em creme, cheios em branco com o ícone. Ela não some ao correr, porque a peça pega no caminho voa até ela. A criança também usa a mochila: alças na frente, a mochila laranja nas costas e de lado.
- **Pegar no caminho não para a criança.** Passou pela porta de uma oficina com lugar sobrando, o portão abre por 0,9 s, a peça pula para a mochila e ela segue correndo. Na primeira vez a legenda diz **NA MOCHILA!**. Com a mochila cheia, o portão balança, a mochila treme e, na primeira vez, a legenda diz **MOCHILA CHEIA!**. Só a oficina que ela **foi buscar** freia e, se precisar, abre a troca.
- **Peça entregue sai da mochila**: o programa fica com ela enquanto usa. Isso libera lugar sozinho, e a troca só aparece quando a criança encheu a mochila de peças que ninguém pediu.
- **Por que o PODE vale mesmo sem a peça na mochila:** a decisão (precisa ou não precisa) é a habilidade, e ela é julgada no toque. A mochila é logística: decide se a entrega é na hora ou depois de uma corrida.
- **O recado do momento** (quem chama, o que buscar, para onde levar) é uma pílula no meio do cabeçalho: **ícone do alvo** + frase. Ao correr, a faixa sobe e a pílula fica no alto com fundo próprio, um pouco menor. O ícone do recado é sempre **a placa que a criança tem de alcançar**, e é o mesmo da setinha da borda, que agora traz o ícone dentro e uma ponta girando para o alvo.
- **Por que não balão da casa:** fala de personagem espera o botão Próximo e travaria o laço; o recado é do sistema, como a legenda.
- A setinha também aparece quando o alvo está **atrás da mochila**: ela fica ao lado da coluna, apontando para lá.

## 7. O N1

(O N2 e o N3 estão no §11.)

| Chamado | Casa que chama | Quer | Resposta | Por quê, em palavra de criança |
|---|---|---|---|---|
| 1 | FOTOS (alto, esq.) | CÂMERA (alto, ao lado) | **PODE** | para tirar foto, precisa da câmera |
| 2 | LANTERNA (alto, dir.) | CONTATOS | **NÃO PODE** | a lanterna só ilumina: não precisa saber quem são seus amigos |
| 3 | CALCULADORA (baixo, dir.) | MICROFONE | **NÃO PODE** | a calculadora faz conta: não precisa ouvir você |
| 4 | MÚSICA (baixo, esq.) | ALTO-FALANTE (baixo, ao lado) | **PODE** | para tocar música, precisa do alto-falante |

- **Começa com PODE, perto de casa:** o primeiro chamado ensina o caminho inteiro (porta, botão, buscar a peça, o programa funcionando), e a oficina fica ao lado.
- **Os dois NÃO vêm no meio**, e são de peças diferentes (um guardado e um aparelho de entrada). Dizer "sempre PODE" ou "sempre NÃO" erra no N1.
- **O último PODE é o mais longe da criança** (ela atravessa o bairro inteiro): é a corrida mais gostosa, e vem quando ela já entendeu tudo.
- As outras casas do bairro existem, mas **não chamam** no N1. Elas são cenário e obstáculo, e mostram que o bairro é grande.

## 8. Acerto e erro

| Situação | O que acontece | Cobra? |
|---|---|---|
| PODE num pedido que precisa | a peça sai da mochila (ou é buscada e trazida), o programa funciona | acerto (+10), no toque |
| NÃO PODE num pedido que não precisa | carimbo NÃO, PROTEGIDO! | acerto (+10) |
| **PODE num pedido que não precisa** | a peça voa até o programa (da mochila, se estava lá; senão, da oficina), a casa dele treme contente e a faixa explica: *"A LANTERNA só ilumina. Ela não precisa dos seus CONTATOS!"* **A partida acaba** | `WRONG_ANSWER` + `lose()` |
| **NÃO PODE num pedido que precisa** | carimbo NÃO, a casa do programa apaga e a faixa explica: *"As FOTOS precisam da CÂMERA para tirar foto!"* **A partida acaba** | `WRONG_ANSWER` + `lose()` |
| bateu numa casa, árvore ou cerca | *boing*, volta um pouco | não |
| entrou na porta de uma casa que não chama | nada: a casa não abre | não |
| passou por uma oficina com lugar na mochila | a peça entra na mochila, sem parar | não |
| passou por uma oficina com a mochila cheia | o portão balança, a mochila treme | não |
| escolheu qualquer peça no cartão de troca | ela volta para casa, a nova entra | não |

A cena do erro **mostra antes e perde depois** (o padrão da 3ª rodada): a faixa fica 2,4 s na tela e só então sai o `lose()`.

## 9. A demonstração

Abre na primeira vez do nível e no **?** (ou tecla H). **Um toque no bairro pula.** O texto é uma legenda de poucas palavras no alto.

| Passo | Câmera | O que se vê | Legenda |
|---|---|---|---|
| 1 | recua para mostrar o bairro | os programas pedem com balões que tremem; os portões das oficinas ficam fechados com cadeado | **SEM O SISTEMA…** |
| 2 | — | os balões tremem mais, nada acontece | **NINGUÉM SE FALA!** |
| 3 | volta para a praça | a criança cai na praça com um pulinho | **VOCÊ É O SISTEMA!** |
| 4 | — | a bolinha de toque aparece ao lado da criança, pulsando com ondinhas; ela corre até lá; a bolinha some e ela desliza | **SEGURE PARA CORRER** |
| 5 | — | — | **SUA VEZ!** (verde) |

O painel PODE / NÃO PODE não precisa de demonstração: ele mesmo é a pergunta, com os dois botões.

## 10. Telemetria e pontos

- `CORRECT_ANSWER` (+10) em cada decisão certa, na hora do toque.
- `WRONG_ANSWER` (−5) + `lose()` na decisão errada.
- `CHECKPOINT` a cada chamado cumprido, com o progresso em chamados.
- `GAME_COMPLETED` no fim do nível, com `totalStages: LEVELS.length` e 3 estrelas (quem chega ao fim não errou).

## 11. O N2 e o N3 (20/10/2026)

O pedido: *"faça n2 e n3 desse jogo (sendo n2 com mapa maior, e n3 com mapa maior ainda), e melhore um pouco ele, se puder deixe mais alinhado com a habilidade bncc dele"*.

### 11.1 O que aproximou o jogo da habilidade (vale para os três níveis)

O N1 ensinava **permissão**: o sistema diz quem pode chegar perto da peça. Isso é um pedaço do que a BNCC chama de *gerenciamento do hardware*, mas faltavam duas coisas que um sistema operacional faz o tempo todo, e que agora aparecem na tela:

| Faltava | Agora | Onde |
|---|---|---|
| o sistema **guarda a peça de volta** quando o programa termina | depois de funcionar, a peça **voa de volta para a oficina**, o portão abre, recebe e fecha. Na primeira vez a câmera mostra o caminho e a legenda diz **DE VOLTA PARA CASA!** | N1–N3 |
| um programa pode precisar de **mais de uma peça** | a VIDEOCHAMADA pede CÂMERA **e** MICROFONE; a criança busca as duas, e a mochila de 3 lugares (a memória do sistema) passa a ser planejada | N2, N3 |
| uma peça atende **um programa de cada vez** | peça **em uso** fica na casa de quem está usando (selo EM USO girando sobre o telhado), a oficina fica de portão aberto e vazia, e o painel ganha o botão **ESPERAR** | N3 |

O terceiro ponto é o mais próprio da habilidade: o sistema não só autoriza, ele **organiza quem usa a peça agora**. É o mesmo problema da impressora do 082 visto do outro lado, e por isso o N3 não tem fila nem disputa simultânea: um pedido por vez, e a pergunta é se a peça está livre.

### 11.2 O N2 — o bairro cresce, e às vezes são duas peças

**Mapa de 3900 × 2500**, três fileiras de casas, 12 casas (7 programas e 5 oficinas), praça no meio da avenida e o canto do parquinho e do laguinho (enfeites de `enfeites2.png`) para a criança se orientar pelo que vê.

| Chamado | Casa | Quer | Resposta | Por quê |
|---|---|---|---|---|
| 1 | MAPA (alto, meio) | LOCALIZAÇÃO (ao lado) | **PODE** | o mapa mostra onde você está |
| 2 | JOGUINHO (alto, dir.) | CONTATOS | **NÃO PODE** | jogo é para brincar |
| 3 | VIDEOCHAMADA (meio, dir.) | CÂMERA **e** MICROFONE | **PODE** | precisa ver e ouvir |
| 4 | LANTERNA (meio, dir.) | LOCALIZAÇÃO | **NÃO PODE** | lanterna só ilumina |
| 5 | JOGUINHO | ALTO-FALANTE (baixo, esq.) | **PODE** | o jogo faz sons |

- **O mesmo programa ouve SIM e NÃO** (JOGUINHO: contatos não, alto-falante sim): a resposta depende do que ele pede, não de quem pede.
- **Duas peças no painel**: os dois ícones lado a lado depois da seta. PODE busca **cada** peça que não está na mochila, uma de cada vez, e só então manda levar.
- O último PODE é o mais longe (atravessa o bairro em diagonal).
- **Demonstração** (primeira vez no N2): o bairro inteiro com **O BAIRRO CRESCEU!**, os balões dos pedidos com **ÀS VEZES SÃO DUAS PEÇAS!**, a criança cai na praça e o dedo ensina a correr.

### 11.3 O N3 — uma de cada vez

**Mapa de 4600 × 2900**, as mesmas 12 casas espalhadas em cinco colunas. O painel tem **três botões em todos os chamados**: PODE (verde ✔), **ESPERAR** (âmbar, ampulheta) e NÃO PODE (vermelho ✖). O botão ESPERAR aparece em todos para não virar pista.

**Peça em uso:** o JOGUINHO já começa com o ALTO-FALANTE. Uma peça entregue com `keep` fica com o programa. Em uso, ela aparece **num selo girando em cima da casa de quem usa**, e a oficina dela fica aberta e escura. No painel, a peça ocupada ganha o **ícone de quem está com ela e a tarja EM USO**, em qualquer resposta, inclusive num NÃO PODE: o selo informa, não responde.

| Chamado | Casa | Quer | Situação | Resposta |
|---|---|---|---|---|
| 1 | FOTOS | CÂMERA | livre | **PODE**, e as FOTOS **ficam usando** (legenda PEÇA EM USO...) |
| 2 | VIDEOCHAMADA | CÂMERA e MICROFONE | a câmera está com as FOTOS | **ESPERAR** |
| 3 | JOGUINHO | CÂMERA | está com a VIDEOCHAMADA | **NÃO PODE** (nem livre ele precisaria) |
| 4 | MÚSICA | ALTO-FALANTE | está com o JOGUINHO desde o começo | **ESPERAR** |
| 5 | MAPA | LOCALIZAÇÃO | livre | **PODE** |

**ESPERAR certo:** a ampulheta gira sobre a peça ocupada, legenda **ESPERE A VEZ!**, a câmera vai até quem está usando, o programa termina (foto, música…), a legenda diz **A CÂMERA ficou livre!** e a peça volta para a oficina. Daí em diante é um PODE: buscar o que falta e levar. `CORRECT_ANSWER` no toque.

**Os erros do N3** (todos encerram, como no resto do catálogo):

| Toque | Verdade | O que se vê | Faixa |
|---|---|---|---|
| PODE | ESPERAR | a peça é **arrancada** do programa que usava: voa do selo para quem pediu, a casa de quem usava apaga e treme | *"Ops! A CÂMERA está com as FOTOS. Uma de cada vez: espere a vez!"* |
| ESPERAR | PODE | a ampulheta gira à toa e o programa apaga | *"Ops! A CÂMERA estava livre! As FOTOS precisam…"* |
| ESPERAR ou PODE | NÃO PODE | o mesmo de antes (apaga ou recebe o que não precisava) | o porquê do chamado |

**Demonstração** (primeira vez no N3): o bairro, a câmera aproxima o JOGUINHO com o selo do alto-falante (**PEÇA EM USO...**), **UMA DE CADA VEZ!**, depois o dedo ensina a correr.

### 11.4 Dados e validação

`data/levels.ts` traz os três níveis. `CallDef.wants` é uma lista (1 ou 2 peças), `answer` é `pode | nao | espera`, `keep` diz se o programa fica com a peça, e `LevelDef.using` é quem já começa usando o quê. A validação em dev, além das distâncias, **simula o nível**: reclama de PODE com peça ocupada, de ESPERAR sem peça ocupada, de NÃO PODE com `keep`, de enfeite em cima de casa e de ESPERAR fora do nível que tem chamado de espera.

## 12. Arquivos

| Arquivo | O quê |
|---|---|
| `data/places.ts` | as casas: família (programa ou peça), nome, ícone, cor |
| `data/levels.ts` | o N1: tamanho do bairro, onde fica cada casa, ruas, árvores, os 4 chamados e a validação em dev |
| `data/layout.ts` | a grade da tela, a física da corrida (`RUN`), tamanhos das casas e do painel |
| `scenes/town.ts` | o chão, as ruas, as casas, as árvores, a fumaça, o portão, a bolinha de luz e as colisões |
| `scenes/runner.ts` | a criança: física, deslize, batida e animação |
| `scenes/bag.ts` | a mochila da borda: os 3 bolsos, a peça voando para dentro e para fora, o tremor de cheia |
| `scenes/swap.ts` | o cartão de troca: "Qual peça sai da mochila?" e as três peças |
| `scenes/header.ts` | a faixa (nível, bolinhas, `?`) que sobe ao correr, e o recado com ícone que fica |
| `scenes/door.ts` | o painel da porta: os dois desenhos, a frase, PODE e NÃO PODE, e o carimbo |
| `scenes/view.ts` | a câmera do bairro (tela inteira, por baixo do cabeçalho): seguir a criança, recuar para mostrar o bairro |
| `scenes/markers.ts` | a setinha da borda com o ícone do alvo, desviando da mochila |
| `scenes/hand.ts` | a bolinha de toque com ondinhas (tutorial e dica), no lugar da mãozinha desde 20/10/2026 |
| `scenes/fallback.ts` | a arte de reserva em Graphics, nas mesmas chaves do [TEXTURAS.md](./TEXTURAS.md) |
