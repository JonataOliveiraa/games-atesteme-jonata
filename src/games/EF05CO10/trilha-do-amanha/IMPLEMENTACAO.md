# Trilha do Amanhã — notas da construção

Documentos irmãos: [PLANEJAMENTO.md](./PLANEJAMENTO.md) · [TEXTURAS.md](./TEXTURAS.md)

O que foi construído, e onde o código se afastou do planejamento — com o motivo.

---

## 1. Os três níveis (20/09/2026)

`LEVELS` tem **três**, e o jogo virou uma frase de três palavras:

| | o problema | a bancada | o limite está |
|---|---|---|---|
| **1 · Leve o recado** | **falar** não chega | megafone · telefone · carta | na pessoa |
| **2 · Leve a encomenda** | **levar** não atravessa | carroça · barco · avião | no caminho |
| **3 · Veja por mim** | **ver** não alcança | luneta · lupa · detector | no que precisa ser visto |

`totalStages` é `LEVELS.length`, e sempre foi.

### O que a chegada do N2 mudou na forma

Os dois níveis têm o mesmo laço e mecânica nenhuma nova, mas dados diferentes. A
saída foi **uma `Fase` só, montada por cada nível**:

- `types.ts` guarda os dados crus dos dois (`Invencao`/`Pessoa` e
  `Veiculo`/`Destino`/`Encomenda`), mais os tipos comuns `Item`, `Quem` e `Fase`;
- `levels.ts` tem **duas contas** — `entregarRecado` e `entregarEncomenda` — e
  dois construtores (`faseRecado`, `faseEncomenda`) que fecham a conta dentro de
  `fase.julgar(itemId)`. Uma conta só com os sete atributos juntos seria o jeito
  mais rápido de a validação parar de pegar erro;
- a `GameScene` não sabe de nível nenhum: ela pede `fase.itens`, `fase.quem`,
  `fase.julgar` e `fase.encomenda`, e desenha o que vier.

A validação do `import` cresceu junto: ela varre `fase.itens` com `fase.julgar`,
exige uma opção que chegue e uma que falhe por fase, um trio de frases por
combinação que chega, **fala para todo motivo que a conta pode produzir**, e pelo
menos três motivos distintos por nível.

## 2. A física é integrada à mão, sem Arcade

O §13 pedia `physics: { default: 'arcade', gravity: { y: 1400 } }`. O jogo usa
integração própria em [`scenes/mensageiro.ts`](./scenes/mensageiro.ts), que é o
que o vizinho `EF03CO03/missao-em-pedacos` já faz — o único outro lado-rolante do
catálogo.

Todos os números do §6½ estão preservados: gravidade 1400, andar 320 px/s, pulo
−620 (137 px de altura), coyote 120 ms, buffer 150 ms, câmera com `lerp` 0,12 e
deadzone de 400.

O ganho é o §11: a pausa do `?` vira uma flag (`setFrozen`), sem corpo de física
para congelar no meio de um pulo, sem `body.moves` e sem velocidade guardada.

## 3. A regra da fase 1.1 mudou (19/09/2026)

O planejamento dava a **distância** como limite da 1.1: megafone falha porque a
mãe está a 300 passos. No teste isso leu errado — a criança vê a mãe na tela,
perto, e megafone é a resposta óbvia dela. Perder uma vida ali parece injusto.

A troca, pedida pelo usuário: **a mãe não tem telefone**. Agora a 1.1 aceita
megafone e carta, e o telefone é que falha.

Para o nível não perder o eixo de alcance, ele **mudou de fase**: quem está
longe demais agora é o seu Ari, na feira, na 1.3. O nível passou a ter quatro
motivos de falha em vez de três, e cada fase continua com um limite próprio:

| Fase | Quem | O limite | O que chega |
|---|---|---|---|
| 1.1 | a mãe, do outro lado do rio | **não tem o aparelho** | megafone e carta |
| 1.2 | o Bento, logo ali | **canal** — ele lê, não escuta | carta |
| 1.3 | o seu Ari, na feira | **alcance e tempo** | telefone |

`Invencao` ganhou `precisaAparelho`, `Pessoa` ganhou `temTelefone`, e
`MotivoFalha` ganhou `semTelefone`. A validação do `import` exige os quatro
motivos no nível.

## 4. O rio: a barreira que faz a distância existir

Sem barreira, a criança simplesmente andava até a pessoa e a comunicação a
distância perdia o sentido. Agora há um **rio** entre as duas margens
(`WORLD.riverX`, `WORLD.riverW`): a voz atravessa, o menino não. Ele para em
`WORLD.bankX`, com as duas tábuas quebradas da ponte na beira para dizer por que.

Quem espera fica sempre na outra margem, a distâncias diferentes:

| Pessoa | x no mundo | Distância da margem |
|---|---:|---:|
| mãe | 380 | 390 px |
| Bento | 440 | 330 px |
| seu Ari | 170 | 600 px |

A câmera abre enquadrando a pessoa (`CAM.openMargin`) e depois **segue o menino
centrado**, sem deadzone.

## 5. O pulo nunca é porteiro: como isso virou código

Todo obstáculo sólido é **parede com degrau automático**: se o topo estiver a até
`PHYS.stepUp` (46 px) dos pés e o menino estiver no chão, ele sobe andando; acima
disso, é barrado na beirada.

- **degrau** de 40 px e **pedra** de 44 px sobem andando;
- **caixa** de 80 px é barrada, e a `TRAIL` põe um degrau **dos dois lados** dela.

`data/levels.ts` valida isso no `import`. O riacho do meio da trilha virou
**poça**: respinga, faz "plof" e não empurra (o §16 já autorizava).

## 6. A oficina agora se entra por botão

Chegar perto não abre mais o painel sozinho: acende um **ENTRAR** (mesmo lugar e
tamanho do USAR, em azul). O painel abre com o nome de quem espera no título e
um lembrete embaixo — *"Ela está do outro lado do rio, e na roça não tem
telefone."* É ali, na hora de escolher, que a informação serve.

Os alvos continuam no teto de 4: perto da oficina são `◀ ▶ ENTRAR ?`; na margem,
com a invenção na mão, `◀ ▶ USAR ?`; o PULAR é que sai de cena nos dois casos.

## 7. As folhas chegaram em tamanhos diferentes do contrato

| Arquivo | Contrato | Entregue | Grade usada |
|---|---|---|---|
| `menino.png` | 1024 × 512 | 1400 × 860 | 4 × 2 de 350 × 430 |
| `pessoas.png` | 512 × 768 | 700 × 1290 | 2 × 3 de 350 × 430 |
| `invencoes.png` | 768 × 512 | 768 × 512 | 3 × 2 de 256 |
| `trilha.png` | 1024 × 256 | 2048 × 512 | 4 × 1 de 512 |
| `ceu.png` | 1920 × 768 | 1920 × 768 | 1 × 3 de 1920 × 256 |
| `chao.png` | 768 × 192 | 760 × 253 | única |
| `morros.png` | 1920 × 256 | 760 × 253 | única |
| `oficina.png` | 512 × 512 | 700 × 700 | única |

Por isso [`scenes/sheet.ts`](./scenes/sheet.ts) **divide o arquivo entregue** pela
grade do contrato em vez de usar um quadro de tamanho fixo, e mede a **caixa alfa
de cada quadro** numa passada só de `getImageData`. É dela que saem a escala do
menino (a maior altura da folha vira os 150 px do §6), o `footPad` que mantém os
pés na mesma linha durante o andar, e a altura real de cada peça da trilha.

**`chao.png` tem o topo BRANCO OPACO, não transparente.** Medido pelo alfa, a
faixa vazia de 27 % contava como desenho e a superfície pisável caía 68 px abaixo
de `groundY`. `cutSheet(..., trimWhite)` trata branco puro como vazio, e
`trimTop` registra um quadro sem essa faixa — sem isso ela apareceria como uma
tarja branca por cima dos morros.

## 8. Os alvos, momento a momento

O teto de 4 do §5 vale, com um ajuste: na entrega, os botões de andar **ficam**.

| Momento | Tocável | Quantos |
|---|---|---:|
| andando | `◀` `▶` `PULAR` `?` | 4 |
| perto da pessoa, com a invenção na mão | `◀` `▶` `USAR` `?` | 4 |
| na oficina | as 3 invenções e o `?` | 4 |
| escolhendo a frase | as 3 frases e o `?` | 4 |
| durante a animação da entrega | `?` | 1 |

O §5 dizia `USAR` + `?` na entrega. Apagar o andar ali prenderia a criança: ela
não conseguiria voltar à oficina para trocar de invenção sem usar a que está na
mão. O `PULAR` é que sai de cena — perto da pessoa ninguém precisa pular.

## 9. A telemetria da habilidade ficou de fora

O §13 pedia **qual invenção** e **qual frase** no `CHECKPOINT`. O evento
`CHECKPOINT` de `shared/contracts/platformEvents.ts` não tem campo livre, e mexer
num contrato compartilhado por 50 jogos por causa de um não se paga. Fica
pendente: ou o contrato ganha um `meta`, ou a evidência sai por outro caminho.

## 10. A capa não existe

`cover-trilha-do-amanha.png` (§10 do `TEXTURAS.md`) não foi gerada, então a
entrada do catálogo está **sem `thumbnail`**. Gerada a capa, basta o `import` e o
campo.

## 11. Ajustes vindos do primeiro teste

- **o grito demora ~3,5 s** (era 1,6) e sai com **seis ondas sonoras** que morrem
  no meio do caminho, antes do balão cair;
- **os personagens cresceram**: o menino de 120 para 150 px, as pessoas de 156
  para 190;
- **o menino já nasce virado para a esquerda**, olhando para quem espera;
- **a invenção na mão espelha junto com ele** (`setFlipX`), e troca para o quadro
  "em uso" da folha no momento da entrega;
- **carregando, ele anda com a animação normal** — o quadro de braço levantado
  ficou só para quando ele está parado;
- **o tutorial congela o toque sem apagar o desenho** (`controles.setFrozen`).
  Antes ele usava `setMode('off')`, que limpava o `Graphics`: o recorte do passo
  2 iluminava um lugar vazio onde o botão deveria estar;
- **a invenção some da mão enquanto ele anda** e volta quando ele para ou usa.
  Solta ao lado do ciclo de caminhada, ela lia como objeto flutuando;
- **a última onda do grito não fica mais parada no ar**: cada arco termina em
  alfa zero e se destrói no fim do próprio tween.

**As pessoas entram espelhadas.** O prompt do `TEXTURAS.md` pediu as seis
células "viradas para a esquerda", e elas ficam na margem esquerda do mundo —
ou seja, de costas para quem chega. Respondendo de costas, o "eu te escutei"
nao se le. `pessoa.ts` e o cartaz desenham com `setFlipX(true)`, e o
deslocamento da caixa alfa inverte de sinal junto.

## 11.5. O tutorial saía deslocado (bug em `shared/tutorial`)

A vinheta cobria só parte da tela e o recorte iluminava um lugar vazio. **Não era
deste jogo:** `createTutorial` criava os objetos dele sem `setScrollFactor(0)`,
então a vinheta, o balão e o recorte andavam junto com a câmera.

Nos outros 47 jogos a câmera nunca sai do zero, e por isso ninguém viu. Este é o
primeiro a abrir o tutorial com a câmera rolada (`scrollX` de 240), e aí a
vinheta ficava desenhada de −240 a 1040 — a faixa clara na borda direita —
enquanto o balão saía 240 px à esquerda do lugar.

A correção é em `src/shared/tutorial/createTutorial.ts`: **todo objeto do kit
agora é fixo na tela**. Para os jogos de tela parada é byte por byte o mesmo
desenho.

Junto com isso, o tutorial daqui passou de quatro para **três passos**, e o
único recorte que sobrou é o do `▶` — coordenada de tela, que não depende de
onde a câmera está.

## 11.6. A camera conta a entrega

A entrega deixou de acontecer num quadro parado. Enquanto ela roda, o cabecalho
e os botoes **somem** (o que e fixo na tela cresceria junto com o zoom), e a
camera faz tres tempos:

1. **aproxima do menino** (`CAM.nearZoom`, 620 ms, suave) — da para ver o que
   ele tem na mao;
2. **acompanha a mensagem ate o destino**, com movimento **linear** e a mesma
   duracao da animacao. Quem manda o alvo e o tempo e a propria animacao, pelo
   `onTravel` que `entrega.play` chama;
3. **fecha em quem recebe**, deslocada para a direita (`CAM.replyShift`) para o
   balao da resposta caber na tela.

No fim, `releaseCamera()` devolve o zoom a 1 e sincroniza o `scroll` do jogo com
o da camera — sem isso o passeio normal continuaria de onde a animacao parou.

### As tres animacoes, uma por invencao

| | O que se ve |
|---|---|
| **megafone** | arcos de som que se abrem saindo da boca. Falhando por alcance, eles morrem no meio e o trecho que faltou fica marcado no chao |
| **telefone** | um **fio de luz** se desenha ate a outra margem e tres pulsos de voz correm por ele. Se nao tem telefone do outro lado, um **X** aparece na chegada |
| **carta** | ela decola, para no meio do caminho, **a noite passa por cima dela** (o ceu escurece, a lua atravessa, as estrelas acendem) e so entao ela termina a viagem e pousa. E o "chega amanha" virando imagem |

## 11.7. O cartaz do fim do nivel

Dois consertos:

- ele **sai de cena antes** do painel de fim de nivel (`cartaz.fadeOut()`). Os
  dois apareciam somados, com o texto do cartaz escapando por tras do painel;
- **saiu o quadro do telefone de hoje** com as tres setinhas ("falar longe",
  "mandar escrito", "chegar na hora"). Ficou so o basico: as tres entregas lado
  a lado e uma frase. O exemplo oficial da BNCC fica para quando os niveis 2 e 3
  existirem e houver o que comparar.

## 12. Pequenos ajustes de legibilidade

- a frase do fim usa cartela de **1000 × 100** e letra **36** (o §6 dizia 920 ×
  110 e 30). Uma frase inteira a 30 px numa tela de 390 dá 9 px reais;
- o menino fica com **120 px** de altura de desenho, como no §6;
- a fala de fecho do cartaz evita a palavra "tecnologia", que o §15 proíbe na
  tela: *"As invenções mudaram o COMO. Levar o recado continua sendo o meu
  trabalho."*

## 14. O nível 2, na prática

O que foi construído além dos dados:

- **a abertura espelha a do N1**: ele **atira a encomenda** por cima do rio e ela
  **cai na água** (`entrega.toss`), no lugar do grito que cai no meio do caminho;
- **três animações de veículo** em `entrega.ts`, todas com o `onTravel` que a
  câmera já sabe seguir: a carroça rola levantando poeira e **atola** quando
  falha; o barco balança e **encalha**; o avião **decola**, ou corre, dá um
  pulinho e **volta a pousar** quando a carga é pesada demais;
- **a outra margem muda por fase**: `mundo.build` desenha o quadro de
  `destinos.png` da fase atrás de quem espera. É o cenário mudando junto com a
  tecnologia;
- **a encomenda aparece na hora de escolher**: o ícone de `encomendas.png` entra
  ao lado do lembrete no painel da oficina, que é onde a informação serve.

### As folhas do N2, e o que veio diferente do contrato

| Arquivo | Contrato | Entregue | Grade usada |
|---|---|---|---|
| `veiculos.png` | 768 × 512 | 1536 × 1024 | 3 × 2 de 512 |
| `pessoas-n2.png` | 512 × 768 | 700 × 1290 | 2 × 3 de 350 × 430 |
| `destinos.png` | 1536 × 512 | 1536 × 512 | 3 × 1 de 512 |
| `encomendas.png` | 768 × 256 | 1536 × 512 | 3 × 1 de 512 |

**`pessoas-n2.png` veio com as COLUNAS TROCADAS**: a primeira coluna é a resposta
e a segunda é a espera, ao contrário da folha do N1. Está resolvido no dado
(`Quem.estadoTrocado`) e não na arte, porque mexer no arquivo quebraria a grade
que o `sheet.ts` mede sozinho. E ela também veio virada para a esquerda, como a
do N1, então `Quem.flip` continua `true` nas duas.

## 14.5. O rio grande, e a cena que o mostra (20/09/2026)

O rio de 180 px não pesava: dava para achar que era uma poça e que o menino
simplesmente não quis pular. Agora ele tem **460 px** (`riverX` 500,
`riverW` 460), e quem espera ficou **bem mais longe da beirada** — de 46 px para
150 a 270 px, com o destino do N2 inteiro cabendo entre a casa e a água.

Isso criou um problema de enquadramento: com a câmera centrada no menino, ele na
margem deixa a outra margem inteira fora da tela. A saída é o
`WORLD.bankLookAhead`: **enquanto ele está na margem, a câmera olha 200 px
adiante**, na direção de quem espera. Fora dali ela volta a centrar nele.

### A cena de abertura

Na **primeira fase de cada nível**, antes de ele tentar, a câmera conta o
problema em quatro tempos:

1. **fecha no menino** (620 ms) e ele solta um **"!"** — o `mensageiro.worry()`,
   a mesma marca que a pessoa usa, do lado de cá;
2. **atravessa o rio inteiro**, devagar e em movimento **linear** (2,6 s). É o
   pan que dá tamanho à água: nada corta, nada acelera;
3. **para em quem espera**, e ela solta o `?` dela;
4. **volta para o menino** (1,3 s) e devolve o comando.

Da segunda fase em diante ela não roda: a criança já sabe o tamanho do rio, e
repetir cinco segundos de câmera seria cobrar de novo o que ela já entendeu.

O cabeçalho e os botões **somem** durante a cena, como na entrega — com zoom, o
que é fixo na tela cresce junto. E o `cameraTo` agora mira **o peito quando está
de perto e o meio do mundo quando está aberto**: mirando sempre o peito, o chão
saía da tela no fim do movimento.

## 14.6. A chegada em mãos

A entrega que dá certo ganhou um tempo próprio (`entregue`), no lugar de o objeto
simplesmente parar em cima da pessoa:

- um **anel verde** se abre no ponto da entrega;
- o que veio (carta, carroça, barco, avião) **sobe um pouco, encolhe e some NA
  pessoa** — e é por isso que o quadro dela segurando a coisa, logo depois, lê
  como "recebi";
- **estrelinhas verdes** sobem do ponto.

Para megafone e telefone, que não levam objeto, sobram o anel e as estrelinhas —
o som chegou, e o corpo dela responde.

## 14.7. O nível 3, na prática

O [NIVEL-3.md](./NIVEL-3.md) saiu quase inteiro como estava planejado. O que a
construção acrescentou:

- **`Item` ganhou `cols`/`rows`.** A folha dos instrumentos tem **quatro**
  colunas, e três lugares chamavam `cutSheet(item.sheet, 3, 2)` com o número na
  mão. Agora a grade viaja com o item;
- **`scenes/visor.ts`**, o único arquivo novo: a vinheta com o buraco redondo
  (pelo mesmo caminho do kit de tutorial — `renderTexture.fill` mais `erase`), as
  quatro molduras em `Graphics` e o que entra dentro;
- **o `OLHAR`** é uma linha na tabela `ACTION` do `controles.ts`. O `PadMode`
  ganhou `'look'` e o teto de 4 alvos continua de pé;
- **a abertura** do N3 é `entrega.grito`: ele solta o `worry()` e a queixa fica
  no ar. Sem balão viajando, porque aqui nada viaja — o problema é o olho.

### O que cabe dentro de um círculo

O quadro de `visoes.png` estourava a borda do visor. O quadrado que cabe **dentro**
de um círculo de raio R tem lado `2R/√2`; com `RAIO * 1.7` o desenho escapava
pelos quatro lados. Ficou `RAIO * 1.32`.

### O texto que a gramática cobrava

O título da oficina monta com o nome de quem espera, e o nome já vem com artigo
("a sua mãe"). `Pegue algo para ver por ${nome}` virava *"por a sua mãe"*. Ficou
**`ver o que ${nome} pediu`**, que fecha com os três sem precisar de gênero.

### A 3.3, e o fecho da habilidade

A bancada troca só nessa fase: a lupa sai, o **celular** entra, e **luneta e
celular chegam os dois**. As duas frases certas separam o que eles são:

> *"A luneta trouxe o galho lá de longe para perto dos meus olhos."*
> *"O celular fez o que a luneta faz, e ainda guardou a foto."*

O exemplo oficial da `EF05CO10` deixou de ser cartaz e virou a última escolha do
jogo. Trocar a bancada não custou código: `fase.itens` é por fase desde o N2.

### As pessoas do N3 são as do N1

Nenhuma folha nova. A mãe, o Bento e o seu Ari voltam — e agora são eles que
precisam dele. O Bento, que lê e não escuta, é quem pede o cano debaixo da terra,
que amarra o que a 1.2 ensinou.

## 14.8. O N3 não se explicava (20/09/2026)

Dois furos que o teste pegou, e os dois eram o mesmo furo: **o nível afirmava em
vez de mostrar**.

### 1. A abertura não tinha enunciado

Ele reclamava de "uma semente miudinha" sem que a criança soubesse que existia
semente, que a mãe tinha pedido alguma coisa, ou o que era para fazer. Nos N1 e
N2 a abertura era **física** — o grito que cai, a caixa que afunda. No N3 tinha
virado um texto solto.

Três consertos, em ordem de importância:

1. **a pessoa pergunta primeiro** (`Fase.pergunta`). A câmera fecha nela e ela
   diz o que precisa: *"Essa semente que eu te dei ainda presta, meu filho?"*. É
   ela que dá o enunciado, e sem ela nada do resto faz sentido. Na primeira fase
   a pergunta entra no fim da cena de abertura, no lugar do `?`; da segunda em
   diante roda a `perguntaDaPessoa`, que é a mesma coisa sem a travessia do rio;
2. **o alvo fica visível** (`visor.marcarAlvo`). O mesmo quadro de `visoes.png`,
   **em miniatura**, aparece onde ele está — a semente na mão dele, o ninho no
   galho lá longe — com um halo âmbar pulsando. No chão da 3.2 só o halo aparece,
   porque o cano está enterrado e não se vê mesmo: o halo é onde cavar;
3. **a fala dele nomeia o problema**: *"Assim eu não vejo nada! É pequenininha
   demais."*

### 2. Escolher errado não explicava nada

O visor mostrava uma mancha abstrata e a pessoa dizia algo vago. A criança
escolhia a luneta, perdia uma vida e não ficava sabendo por quê.

O conserto é a **mesma arte, em dois tamanhos**:

| | O que aparece dentro do círculo |
|---|---|
| **acertou** | o quadro de `visoes.png` **grande**, nítido |
| `pequenoDemais` | o **mesmo** quadro, a 20 % — a luneta não mudou nada, e dá para ver |
| `longeDemais` | o **mesmo** quadro, a 14 % e desbotado — continua um pontinho |
| `escondido` | **só terra**, chapada, com pedrinhas — o cano está debaixo dela |

Mais um **`?`** âmbar grande no canto do visor. A comparação entre o pontinho e
o desenho grande é o que ensina, e ela não precisa de uma palavra.

E as falas passaram a nomear o que faltou, em vez de repreender:

- *"Do mesmo tamanho! Precisa de algo que AUMENTE."*
- *"Continua um pontinho! Precisa TRAZER PARA PERTO."*
- *"Só terra! O cano está DEBAIXO dela."*

## 14.9. Três consertos no N3, depois de jogado

### A bancada diz o que cada coisa faz

Megafone, carta, barco e avião a criança lê no desenho. **Luneta, lupa e
detector, não** — e sem isso a escolha vira chute, que é exatamente o que o
teste mostrou.

Cada cartela ganhou **uma linha**, acima da placa do nome, com o que a coisa
faz e nada mais:

| | |
|---|---|
| **Luneta** | traz o longe para perto |
| **Lupa** | aumenta o que é miudinho |
| **Detector** | acha o que está enterrado |
| **Celular** | traz o longe E aumenta |

É `Item.faz`, opcional, e só o N3 preenche. Não é gabarito: continua sendo a
criança quem casa "aumenta o miudinho" com "a semente cabe na sua unha".

### A semente ganhou motivo

Antes a mãe perguntava se a semente "ainda presta", o que é vocabulário de
adulto e não diz o que procurar. Agora ela diz **por que importa e o que olhar**:

> *"Vou plantar amanhã. Olha se essa semente tem broto ou se secou."*

E o lembrete da oficina fecha a conta: *"O broto fica dentro da semente, e a
semente cabe na sua unha."* Plantar, broto, tamanho — o enunciado inteiro em
duas frases, e a revelação (o broto saindo) responde exatamente à pergunta.

### O rio sai do N3

O rio é o obstáculo do **corpo**, e o N3 é sobre o obstáculo do **olho**. Água
no meio da tela contava uma história que não era a da fase — e pior, sugeria que
o problema era atravessar.

`Fase.semRio` liga isso, e o `limiteEsquerdo()` passa a ser "chegar perto de quem
pediu" em vez de "a margem". Chegar perto não faz ninguém enxergar melhor, então
a lição continua de pé: no N3 o menino pode andar até a mãe e **ainda assim** não
vai ver o broto sem a lupa.

## 14.10. Os balões, o instrumento no ar e a lupa feia

### Os balões sumiam antes de dar para ler

Todo balão tinha tempo fixo — 1,9 s no acerto, 2,4 s no erro — e tempo fixo dá
conta da fala curta e **corta a longa no meio**. A pergunta da mãe no N3 tem 63
letras e sumia antes de a criança chegar ao fim.

Entrou `leitura(texto)` no `layout.ts`, e todo balão passa por ela:

```ts
export const leitura = (texto: string) => Math.max(2400, 900 + texto.length * 62)
```

Piso de 2,4 s, mais 62 ms por letra. A fala de seis palavras fica no piso; a
pergunta da mãe ganha 4,8 s. Vale para as falas de quem espera, para as do
menino, para o porquê da frase errada — tudo que é texto que some sozinho.

### O instrumento não fica mais pendurado no ar

Megafone e carta na mão do menino leem como "ele está segurando". Luneta e
detector pendurados ao lado dele leem como desenho solto — o que eram.

`Item.naMao` (padrão `true`) desliga isso para os instrumentos: eles viajam na
bolsa e **só aparecem no momento de usar**.

### A lupa vai até a semente, e a interface foi refeita

O visor abria do nada. Agora o instrumento **sai da mão dele, voa em arco até o
alvo, procura em cima dele** (um vaivém curto, o "ajuste de foco") e só então o
visor abre. É o `voar()` do `visor.ts`, e ele liga uma coisa à outra.

As quatro molduras foram redesenhadas:

- **lupa** — aro de metal em três camadas (sombra, corpo escovado, fio de luz no
  quadrante de cima), cabo em polígono afunilado com o anel de metal que prende
  no aro, e dois brilhos na diagonal no vidro;
- **luneta** — dois anéis de latão, retículo com marcas de escala e um ponto no
  centro;
- **detector** — anel âmbar com três círculos de varredura por dentro;
- **celular** — moldura grossa com o entalhe da tela em cima e os quatro
  cantinhos de enquadramento.

O `barra()` desenha os polígonos ao longo de um eixo — é o que tira o cabo da
lupa de ser um retângulo torto.

## 15. O que ainda não foi jogado

Compila (`tsc`) e passa no `eslint`. No navegador foram vistos: o carregamento, o
mundo montado nas três camadas, a pessoa e o menino na mesma tela, o grito que sai
da boca e cai, e os eventos `GAME_READY` e `CHECKPOINT` no console.

Falta o teste com o dedo, que é do usuário: a trilha inteira ida e volta, o pulo,
a poça, a oficina, uma entrega que não chega, a frase errada e o cartaz.
