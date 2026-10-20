# Cabo Certo — planejamento

Documento irmão: [TEXTURAS.md](./TEXTURAS.md)

**EF05CO05 · 5º ano · Mundo Digital · Arquitetura de computadores** · id **125** · pasta `src/games/EF05CO05/cabo-certo/`

> **(EF05CO05)** Identificar os componentes principais de um computador (dispositivos de entrada/saída, processadores e armazenamento).
>
> Exemplo oficial: explicar os componentes básicos dos computadores e suas funções — processador, memória, e exemplos de diferentes dispositivos de entrada e saída.

Pedido do usuário (19/10/2026): a ficha *Elevador da Máquina* repetia o Raio-X da Máquina (080). Ele propôs *"arrastar cabo da peça pro conector certo"*, com *"mapa maior podendo arrastar, e o computador no meio, o aluno deve conectar e interagir no componente conectado, um componente também poderia levar mais cabos"* (o aninhamento, *"em níveis altos"*), e mandou *"faça o jogo só com N1 usando Graphics, a textura adiciono depois"*.

Três correções vieram depois de jogar as primeiras versões:
- *"Parece muito complexo em aparência, o certo era deixar os elementos mais longe um do outro. Há muita coisa visual na tela que a criança nem sabe onde clicar. N1 deve ser níveis simples."*
- *"Reduza a quantia de textos nos tutoriais e deixe mais visual, com mais animações, deixando claro o fluxo, utilize zooms."*
- *"No F3 do N1, crie uma aninhação."* (o pedido 3 do nível 1 passa a ter o aninhamento; §6)

---

## 0. Por que não é nenhum dos irmãos

| Irmão | O que a criança faz | O que o Cabo Certo faz diferente |
|---|---|---|
| **Monte seu Computador (035)** | leva a peça até o encaixe que tem o formato dela | **todo plugue é igual**: a tomada certa só se descobre pela **função** do aparelho |
| **Raio-X da Máquina (080)** | recebe a função e toca a peça que a faz; arrasta 3 cabos de energia no fim | a pergunta é a inversa: **recebe o aparelho e decide a função**. O cabo leva **informação**, e depois de ligado o aparelho **funciona** na mão da criança |
| **Central de Entrada e Saída (019)** | arrasta o aparelho para a caixa Entrada ou Saída | a informação **viaja pelo cabo** até o processador e volta, e o armazenamento entra como terceira família |

## 1. O jogo em uma frase

**O computador está no meio: puxe o cabo de cada aparelho até a tomada da função dele — ENTRADA, SAÍDA ou ARMAZENAMENTO — e toque no aparelho para ver a informação passar pelo processador.**

## 2. A habilidade na tela

| A habilidade pede | Onde está |
|---|---|
| **identificar** componentes | cada plugue solto é uma pergunta: *o que este aparelho faz?* A tomada responde |
| **entrada** | a tomada verde, à esquerda do computador, com seta para dentro |
| **saída** | a tomada laranja, à direita, com seta para fora |
| **armazenamento** | a tomada roxa, embaixo, com o desenho do baú |
| **memória** (N2) | a tomada turquesa, embaixo ao lado do baú, com um pente de memória: segura **só enquanto** o computador usa |
| **processador** | o chip na janela do gabinete. Toda informação passa por ele e ele **pisca pensando** |
| a **função** de cada um | depois de ligado, o aparelho funciona: o teclado escreve na tela, o microfone grava no pendrive, o pendrive toca a música no alto-falante |

## 3. O N1 é simples de propósito

O que a primeira versão tinha e saiu do N1:

| Saiu | Por quê | Para onde vai |
|---|---|---|
| 4 tomadas de ENTRADA | quatro bolinhas verdes iguais eram ruído | N2 (mais aparelhos por pedido) |
| mouse e câmera como distratores | aparelho na tela que nenhum pedido usa é "onde eu clico?" | N2 |
| mapa que precisa ser andado | a criança perdia os aparelhos fora da vista | N2/N3 (o mapa continua maior que a tela, e arrastar o chão ainda anda) |
| tomada própria de aparelho em todo pedido | era a parte mais difícil, e aparecia antes de a criança entender as 3 tomadas | **só no pedido 3** do N1 (§6); nos pedidos 1 e 2 a tomada do monitor não existe |
| grade do tapete, mesa, estante | concorriam com os cabos | sai de vez: o chão é liso |
| tutorial de 6 balões | texto demais | a demonstração animada (§5) |

Ficou no N1:
- **3 tomadas**, uma de cada cor, cada uma de um lado do computador.
- **2 aparelhos por pedido**, longe do computador e um de cada lado, todos na tela sem andar.
- **Entre um pedido e outro os cabos se soltam** e os aparelhos trocam: cada pedido começa com a mesa limpa.
- **O plugue solto pisca** (um anel amarelo que se abre): é dali que se puxa.

## 4. O laço

1. **O pedido** aparece no alto: *"Quero escrever e ver na tela."* Os dois aparelhos entram na mesa com um pulinho.
2. **A criança puxa o cabo** (pegando o plugue ou o aparelho) até uma tomada. O cabo estica com barriga e segue o dedo. **Pendrive, memória e cartão não têm cabo**, como na vida real: a criança pega o próprio aparelho e leva até a tomada, e ele encaixa com o conector em cima dela (pendrive deitado, ponta na tomada; memória em pé, dentes na tomada; cartão com os contatos na tomada). O nome dele vai para o lado de fora. Arrastar o aparelho encaixado tira ele da tomada. A primeira vez que um deles está na mesa, a bolinha do toque mostra o gesto (**PEGUE E ENCAIXE**, depois **QUAL TOMADA?**).
   Enquanto a criança arrasta (o mapa, um cabo ou um aparelho), **o cabeçalho sai do caminho** e volta um instante depois de ela soltar. Um toque que não virou arraste não esconde nada; as setinhas da borda ficam.
3. **Soltou na tomada certa:** clique, faísca da cor da tomada, a luzinha do aparelho acende e o anel do plugue para.
4. **Com tudo ligado,** o alto diz *"Tudo ligado! Toque no TECLADO."*, o resto da mesa **escurece em volta do aparelho** (o cabeçalho fica, é ele que diz o que tocar) e uma **bolinha amarela de contorno marrom fica tocando nele**: afunda e solta ondinhas. Arrastou alguma coisa, a luz volta enquanto arrasta.
5. **Tocar no aparelho ligado faz ele funcionar:** a bolinha de luz sai dele, corre pelo cabo, passa pelo **processador** (que pisca), sai pela tomada do outro aparelho e chega: as letras aparecem na tela, a voz entra no pendrive, a música toca. Se a bolinha sai da vista, a câmera vai atrás.
6. **Pedido cumprido:** a bolinha do cabeçalho fica verde e o caminho aparece em letras grandes, sem botão: **ENTRA → PROCESSA → MOSTRA**. A mesa troca sozinha.
7. Parou por 7 segundos sem ligar nada: **a bolinha do toque mostra de novo** o gesto de puxar o cabo (ou de levar o aparelho sem cabo).

## 5. A demonstração (sem balão, sem botão)

Abre na primeira vez e toda vez que se toca no **?** (ou na tecla H). **Um toque no mapa pula.** O texto é uma legenda de uma ou duas palavras no alto.

| Passo | Câmera | O que se vê | Legenda |
|---|---|---|---|
| 1 | zoom ×2,1 no chip | o processador acende e pisca | **PROCESSA** |
| 2 | zoom ×1,4 na tomada verde | uma bolinha verde vem de fora e entra até o chip; a tomada pula | **ENTRA** (verde) |
| 3 | zoom ×1,4 na tomada laranja | a bolinha laranja sai do chip para fora | **SAI** (laranja) |
| 4 | zoom ×1,4 na tomada roxa | a bolinha roxa desce do chip para o baú, com *gulp* | **GUARDA** (roxo) |
| 5 | volta ao normal | a bolinha do toque afunda no plugue do primeiro aparelho, com uma ondinha, e o leva até a frente do computador | **PUXE O CABO** |
| 6 | — | as três tomadas pulam uma depois da outra; o plugue **não** encaixa | **QUAL TOMADA?** |
| 7 | — | o plugue volta ao lugar | **SUA VEZ!** (verde) |

A demonstração nunca responde um pedido: a bolinha leva o cabo até a frente do computador e para entre as tomadas.

### O foco das animações

Toda vez que o jogo **mostra** em vez de pedir (a demonstração, as estreias, a bolinha correndo, o aninhamento chegando, o erro), o cabeçalho sobe e sai, o mapa fica com a tela toda e uma **vinheta** escurece tudo menos um círculo macio em volta do que está acontecendo (`scenes/focus.ts`). O círculo anda com a coisa: segue a bolinha pelo cabo, para no processador enquanto ele pensa, abre sobre o computador inteiro no "QUAL TOMADA?" e vira elipse quando precisa pegar dois pontos (a tomada do monitor e o alto-falante). Quando o jogo volta a pedir, o cabeçalho desce e a mesa aparece inteira.

- **A bolinha mostra o que leva** (linhas de texto, ondas de voz, nota de música, foto, setinha do mouse) num disco branco com o aro da cor, sai do aparelho com um pulinho, freia antes de cada parada e é engolida por quem recebe. O cabo por onde ela passou acende atrás dela.
- **Tocar no aparelho ligado:** a câmera chega perto dele (×1,22) e depois vai atrás da bolinha até o destino; no fim volta para onde a criança estava.
- **Pedido cumprido:** o resumo se monta uma palavra por vez, e cada palavra acende a peça que ela nomeia (ENTRA → o aparelho tocado, PROCESSA → o processador, MOSTRA → o destino; MONITOR e HUB acendem o aparelho de mesmo nome). Depois a luz volta, a bolinha do cabeçalho fica verde e a mesa troca.
- **Ligar um cabo:** a luzinha do aparelho acende com um estalo e ele dá um pulinho (também quando acorda por outro cabo, como o alto-falante no monitor).
- **Erro:** o choque na tomada, a câmera chega perto, e a luz volta com o cabo até o aparelho enquanto a faixa explica.

A câmera do mapa desenha a tela toda (o mapa continua por baixo do cabeçalho); a "janela do mapa" é a parte abaixo dele e cresce até o alto quando ele sobe (`view.setTop`).

## 6. O nível 1

| Pedido | O alto diz | Aparelhos (lado) | Toca em | Chega em | Resumo |
|---|---|---|---|---|---|
| 1 | *Quero escrever e ver na tela.* | teclado (esq.) · monitor (dir.) | teclado | as letras no monitor | ENTRA → PROCESSA → MOSTRA |
| 2 | *Quero gravar minha voz e guardar.* | microfone (esq.) · pendrive (dir., embaixo) | microfone | a voz no pendrive | ENTRA → PROCESSA → GUARDA |
| 3 | *Quero ver e ouvir a música do pendrive.* | pendrive (esq., embaixo) · monitor (dir.) · **depois** o alto-falante (dir., embaixo) | pendrive | o som no alto-falante, passando pelo monitor | GUARDADA → PROCESSA → MONITOR → SAI |

O pendrive é **armazenamento nos dois sentidos**: no pedido 2 ele recebe e guarda (ganha o selinho do microfone); no 3 ele devolve o que guardou.

### O pedido 3 é o aninhamento

O computador tem uma SAÍDA só. O pedido 3 começa com o pendrive e o monitor; **o alto-falante ainda não está na mesa**.

1. A criança liga o pendrive no ARMAZENAMENTO e o monitor na SAÍDA.
2. Com os dois ligados, a câmera dá zoom na **tomada própria do monitor** (embaixo, ao lado do pé), ela pula duas vezes e a legenda diz **TOMADA DO MONITOR**.
3. O **alto-falante** entra na mesa com um pulinho e a câmera volta.
4. A única SAÍDA livre é a do monitor. Ligou ali, o alto-falante acende **porque o monitor está ligado**.
5. Toque no pendrive: a música sobe ao processador, desce pelo cabo do monitor, **atravessa o monitor** (que mostra as notas) e desce pelo cabo do alto-falante, que toca.

O alto-falante entra depois por um motivo: se ele estivesse na mesa desde o começo, a criança poderia ocupar a SAÍDA do computador com ele, e o monitor ficaria sem tomada nenhuma.

| Situação no pedido 3 | O que acontece |
|---|---|
| alto-falante na SAÍDA do computador (ocupada) | o plugue volta, a tomada do monitor pula e o processador diz *"Use a tomada do MONITOR!"* Sem custo |
| monitor desligado depois | a tomada dele continua com o cabo, mas o alto-falante apaga: *"O MONITOR não está ligado."* |
| parou sem fazer nada | a bolinha do toque leva o plugue do alto-falante até perto do monitor, sem encaixar |

Posições no mapa de 2400 × 1350, com o computador em (1200, 700): ver `place` em `data/levels.ts`.

## 7. Acerto e erro

| Situação | O que acontece |
|---|---|
| plugue na tomada da função certa | clique, faísca da cor da tomada, o aparelho acende. `CORRECT_ANSWER` na **primeira** ligação de cada aparelho |
| plugue na tomada de **outra função** | faísca, o cabo se solta e a faixa explica: *"O monitor MOSTRA o que SAI do computador."* **A partida acaba** (padrão do catálogo: um erro encerra, as vidas são da plataforma) |
| tomada ocupada | o plugue volta sozinho, sem custo: *"Essa tomada já tem cabo."* |
| soltou longe de tomada | o plugue volta para perto do aparelho (o aparelho sem cabo volta voando para o lugar dele), sem custo |
| tocou num aparelho sem cabo | ele balança: *"Ligue meu cabo primeiro!"* |
| tocou e falta o destino | a bolinha chega no processador, ele pisca e pensa: *"Não tenho onde MOSTRAR!"* (ou GUARDAR, ou TOCAR). Sem custo |

## 8. Telemetria e pontos

- `CORRECT_ANSWER` (+2) na primeira ligação certa de cada aparelho; `WRONG_ANSWER` (−5) no erro.
- `CHECKPOINT` a cada pedido cumprido, com o progresso em pedidos.
- `GAME_COMPLETED` no fim do nível, com 3 estrelas (quem chega ao fim não errou).

## 9. O nível 2 — memória e armazenamento

Mesma mecânica, mais parâmetros: tudo o que saiu do N1 (§3) volta aqui.

- **As tomadas mostram só o ícone** (`plates: false`): seta verde, seta laranja, baú roxo e pente turquesa.
- **3 ENTRADAS** à esquerda do computador, uma SAÍDA à direita, e embaixo a **MEMÓRIA** (turquesa) ao lado do ARMAZENAMENTO.
- **Aparelhos fora da vista**: a setinha da borda aponta o que o pedido precisa (só o que ele precisa; o que só enfeita não ganha setinha). Arrastar o chão anda pelo mapa.
- **Distratores** (`extra`): aparelhos na mesa que o pedido não usa. Ligar um deles na tomada da família dele não custa nada; ligar na tomada errada é erro, como qualquer outro.
- A mesa começa limpa a cada pedido (`reset: true`).

| Pedido | O alto diz | Precisa | Na mesa sem precisar | Fora da vista | Resumo |
|---|---|---|---|---|---|
| 1 | *Quero desenhar e ver na tela.* | mouse · monitor | teclado | o mouse (esq.) | ENTRA → PROCESSA → MOSTRA |
| 2 | *Segure meu texto só enquanto eu edito.* | teclado · **memória** | pendrive | — | ENTRA → PROCESSA → SEGURA |
| 3 | *Guarde minha foto para o ano que vem.* | câmera · **pendrive** | memória | a câmera (em cima) | ENTRA → PROCESSA → GUARDA |
| 4 | *Quero falar e ouvir no alto-falante.* | microfone · alto-falante | mouse · teclado | o microfone (esq.) | ENTRA → PROCESSA → SAI |

**O par memória × armazenamento.** Os pedidos 2 e 3 têm a memória e o pendrive na mesa, e o pedido diz qual dos dois ele quer (*"só enquanto eu edito"* × *"para o ano que vem"*). O erro que encerra é trocar as tomadas: o pente na tomada do baú (*"Ops! A MEMÓRIA só SEGURA enquanto o computador usa."*) ou o pendrive na tomada turquesa (*"Ops! O pendrive GUARDA para depois: é ARMAZENAMENTO."*). Quando a informação chega, a memória mostra um selinho que **some** logo depois; o pendrive fica com o selinho.

A rota só entrega a informação aos aparelhos que o pedido precisa: o pendrive ligado sem precisar não recebe o texto do pedido 2.

**Estreia da memória** (pedido 2, uma vez por sessão, um toque pula): zoom na tomada turquesa, a bolinha sai do processador e entra nela, legenda **SEGURA** e depois **SÓ AGORA**, e a bolinha some; zoom no baú, a bolinha entra, **GUARDA** e **PARA SEMPRE**, e ela fica; **SUA VEZ!**

## 10. O nível 3 — cabo dentro de cabo

- **Uma ENTRADA só** no computador: o **HUB** entra nela e dá mais três (as tomadas dele encostam no corpo, do lado esquerdo).
- A **câmera com cartão**: a câmera tem uma tomada de ARMAZENAMENTO própria (à esquerda dela), onde entra o **CARTÃO**. Como a câmera está no hub, o cartão fica a **dois cabos** do computador.
- **`reset: false`**: os cabos não se soltam, e a mesa vai sendo montada de um pedido para o outro.
- **Pedidos que só dizem o resultado**.

| Pedido | O alto diz | Entra na mesa | Entra depois (estreia) | Resumo |
|---|---|---|---|---|
| 1 | *As letras na tela.* | hub · monitor | teclado, na tomada do hub (**estreia do HUB**) | TECLADO → HUB → PROCESSA → MOSTRA |
| 2 | *A música tocando no alto-falante.* | pendrive (fora da vista) | alto-falante, na tomada do monitor | GUARDADA → PROCESSA → MONITOR → SAI |
| 3 | *A foto guardada no cartão.* | câmera (fora da vista), no hub | cartão, na tomada da câmera (**estreia dos dois cabos**) | CÂMERA → HUB → PROCESSA → CARTÃO |
| 4 | *Minha voz no alto-falante.* | microfone (fora da vista), no hub | — | MICROFONE → HUB → PROCESSA → SAI |

No fim a mesa tem 8 aparelhos: o hub (com teclado, câmera e microfone), a câmera (com o cartão), o monitor (com o alto-falante) e o pendrive.

**Estreia do HUB** (quando o hub e o monitor estão ligados): zoom no hub, as três tomadas dele pulam, legenda **MAIS ENTRADAS** e uma bolinha verde sai da tomada do hub, passa pelo hub e sobe até o processador. Depois o zoom de sempre na tomada (**TOMADA DO HUB**), e o teclado entra com a câmera enquadrando os dois.

**Estreia dos dois cabos** (quando a câmera está ligada no hub): a câmera enquadra o caminho, legenda **HUB → CÂMERA → CARTÃO**, e a bolinha desce do processador pelo cabo do hub, atravessa o hub, desce pelo cabo da câmera e chega à tomada dela. Depois **TOMADA DA CÂMERA** e o cartão entra.

Tomada do computador ocupada continua sem custo: o plugue volta e o processador aponta a tomada livre de um aparelho (*"Use a tomada do HUB!"*, *"Use a tomada da CÂMERA!"*).

### Validação (`validateLevels`, em DEV)

- 1 a 5 pedidos por nível; níveis em ordem.
- Todo aparelho da mesa (`needs` + `extra`) tem lugar no mapa; `extra` não repete `needs`.
- Tomadas suficientes por família, contando as próprias dos aparelhos que estão na mesa. Sem `reset`, a mesa acumula de um pedido para o outro.
- Todo aparelho que entra depois tem uma tomada própria da família dele na mesa.
- O aparelho tocado manda o que o destino recebe.
- Cada novidade (`teach`) estreia uma vez; a da memória tem a memória e o pendrive na mesa; a do hub e a do cartão acontecem quando o aparelho de depois entra.
- Sem `reset`, não há distrator (ele ficaria para sempre na mesa).

## 11. Arquivos

| Arquivo | O quê |
|---|---|
| `data/devices.ts` | os aparelhos: família, o que mandam, o que aceitam, a frase do erro |
| `data/levels.ts` | os 3 níveis: tomadas, pedidos, onde cada aparelho aparece, e a validação em dev |
| `data/route.ts` | a lógica pura: quem está ligado, por onde a informação passa |
| `scenes/board.ts` | o chão, o computador, o processador e as tomadas |
| `scenes/gear.ts` | os aparelhos, os cabos, os plugues (que piscam) e o que cada um faz ao funcionar |
| `scenes/flow.ts` | a bolinha de informação viajando pelos cabos, com o desenho do que leva e o rastro de luz |
| `scenes/focus.ts` | o foco das animações: o cabeçalho sai e a vinheta acende em volta do que acontece |
| `scenes/view.ts` | a câmera do mapa: arrastar, setas, zoom da demonstração |
| `scenes/touch.ts` | o toque mostrado pelo jogo (sem mão): a bolinha que afunda, solta ondinhas e leva o plugue |
| `scenes/caption.ts` | a legenda de uma ou duas palavras |
| `scenes/fallback.ts` | a arte de reserva em Graphics, nas mesmas chaves do [TEXTURAS.md](./TEXTURAS.md) |

## Histórico

- 19/10/2026: N1 em Graphics, com as três correções do usuário (§ topo).
- 20/10/2026, pedido do Maestro: **N2 e N3**. Tipos: família `memoria`, aparelhos `memoria`, `hub` e `cartao`, `extra` e `teach` no pedido, `plates` no nível. As tomadas próprias acompanham o aparelho quando ele muda de lugar (`board.moveOwner`). A rota entrega só aos aparelhos do pedido, e o "não tenho onde..." depende do destino. A demonstração inicial sai uma vez por sessão (`BASICS_KEY`), e cada estreia nova também. Folhas novas combinadas com a Aquarela e a Tesoura: `aparelhos.png` 4 × 3 (7 memória, 8 hub, 9 cartão) e `pecas.png` 4 × 2 (4 tomada de memória, turquesa). Ajustes depois de jogar: tomadas do hub encostadas no corpo dele, tomada do monitor longe do nome, tomada da câmera do lado oposto ao cabo, nomes de baixo dentro da tela, zoom mais aberto nas tomadas de baixo, bolinhas do cabeçalho longe do divisor (divisor em 300, vão 30). Catálogo: descrição com MEMÓRIA e hub, pontos 65.
- Jogado no navegador (porta 5283, arraste por eventos de ponteiro): `?stage=2` inteiro (estreia da memória, setinhas, distratores, 4 pedidos, `GAME_COMPLETED` 2/3, passa ao N3) e o erro do par (memória no baú, `WRONG_ANSWER` + `GAME_OVER`); `?stage=3` inteiro (estreia do hub, alto-falante no monitor, estreia dos dois cabos, `GAME_COMPLETED` 3/3, JOGAR DE NOVO) e o erro do hub na SAÍDA; `?stage=1` abre igual, com placas.
- Mesmo dia, depois do resumo: o anel do plugue solto ficou amarelo-forte com contorno marrom (o amarelo claro sumia no chão creme); o cabeçalho é limpo quando o painel de fim de nível abre. Chegaram as seis texturas na linha **chibi de caderno**: o chip do `computador.png` cai em `PC.chip`, a tela do monitor de `aparelhos.png` recebe o texto no retângulo do contrato, a ponta da `mao.png` é o `HAND_TIP`. Com a `pecas.png`, o ícone fica pequeno dentro da placa da tomada: `SOCKET.size` foi de 74 para 86. Capa ligada no `catalog.ts`.
- 20/10/2026, pedido do usuário: *"melhore a animação, e deixe os elementos mais focados qnd for animar, por exemplo esconder o header deixando uma vinheta focada no tal elemento"*. Entrou o foco das animações (§5): cabeçalho que sobe, vinheta que segue a coisa animada, bolinha com o desenho do que leva e rastro de luz no cabo, câmera seguindo a bolinha, resumo que acende peça por peça, luzinha que estala ao ligar e o erro com a luz voltando até o aparelho. Conferido no navegador: demonstração (processador, ENTRA, SAI, PUXE O CABO, QUAL TOMADA?), o pedido 1 inteiro, a chegada do alto-falante no pedido 3, a passagem para o N2 e o erro do mouse na SAÍDA.
- Mesmo dia, pedido do usuário: *"há componentes, como pendrive, que sequer tem [cabo], e que deveria ser pego e encaixado"* e *"ao estiver movendo o cenario, movendo cabo, etc. o header deve ser escondido"*. Pendrive, memória e cartão perderam o cabo e o plugue (`dock` em `data/devices.ts`, com o conector medido no PNG) e são levados inteiros; a estreia **PEGUE E ENCAIXE** sai uma vez por sessão; o cabeçalho sai do caminho em todo arraste (`focus.aside`). Conferido no navegador: a estreia no pedido 2 do N1, o pendrive encaixado pelo toque de verdade, o arraste do mapa (5 px não esconde; volta ~200 ms depois de soltar), a memória e o pendrive encaixados no N2 e o cartão na câmera do N3, com a foto chegando nele.
- Mesmo dia, pedido do usuário: *"remova aquela maozinha indicando clique. quero so algo no graphics de bolinhas clicando e emitindo ondinha e um foco do jogo deixando bg escuro"*. A mão saiu de vez (`mao.png` não é mais carregada; o desenho de reserva dela também saiu). No lugar, `scenes/touch.ts`: bolinha amarela de contorno marrom (o anel do plugue solto) que afunda e solta duas ondinhas, e que leva o plugue nas demonstrações. Com tudo ligado, a vinheta acende em volta do aparelho a tocar sem tirar o cabeçalho (`focus.glow`, 62 % de escuro) e as setinhas da borda ficam por cima dela. Conferido no navegador: o "Toque no TECLADO" com fundo escuro e ondinha, e o PUXE O CABO com a bolinha levando o plugue.
