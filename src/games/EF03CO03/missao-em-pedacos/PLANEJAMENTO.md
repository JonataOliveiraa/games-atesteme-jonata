# Missão em Pedaços - EF03CO03

Documento irmão: [TEXTURAS.md](./TEXTURAS.md)

**Jogo de plataforma.** O jogo dá uma **tarefa**. A criança **corta a tarefa no
meio**: ela vira duas tarefas menores, uma em cada painel. Cada metade é uma
**fase de parkour** — correr, pular, buscar os objetos daquela metade. E quando
as duas voltam, entra a **fase final**: fazer a tarefa, de verdade, com o que
foi trazido.

O corte não é uma tela antes do jogo: **o corte É o jogo**. O que vai em cada
metade é o que decide as duas fases seguintes.

---

## 0. O que mudou, e por quê

A pasta de arte foi esvaziada de propósito: sobraram `heroi.png`, `chao.png`,
`fundo-n1.png` e `bancada.png` — o que não depende de qual tarefa está em jogo.
Tudo o mais volta pelo [TEXTURAS.md](./TEXTURAS.md).

| Versão anterior | Agora |
|---|---|
| a missão tinha 4 itens e painel de 2 | a tarefa tem **8 itens** e painel de **4** |
| dois níveis com 2 e 3 painéis | **sempre 2 painéis**: a tarefa é cortada **no meio** |
| a viagem terminava na bancada e o pedaço "ficava pronto" sozinho | volta da segunda viagem, entra a **FASE FINAL**: a criança executa a tarefa |
| a cena da missão era um quadro velado com `?` | não existe mais: o prêmio é a tarefa acontecendo |
| 6 folhas `cena-*.png` | 9 folhas novas de item e resultado, 2 fundos novos |
| toda tarefa terminava na bancada | metade delas termina nas **estações**, e a receita acontece no mapa |

O que **não** mudou: a habilidade, a física do pulo, a separação entre erro de
cabeça e erro de dedo, e a trava do catálogo.

---

## 1. A habilidade, e o teste que ela precisa passar

> **(EF03CO03)** Aplicar a estratégia de decomposição para resolver problemas
> complexos, dividindo esse problema em partes menores, resolvendo-as e
> combinando suas soluções.

Objeto: **Decomposição**.

O texto oficial da habilidade fala de café da manhã: uma receita grande que se
divide em duas — o café e o sanduíche —, resolvidas separadamente e depois
combinadas, seja uma inteira depois da outra, seja intercalando os passos. **É
literalmente o nível 2 deste jogo.**

| Verbo | Onde acontece |
|---|---|
| dividir | o corte: quais dos 8 objetos vão em cada painel |
| resolver | a fase: buscar os 4 objetos daquele painel e chegar na bancada |
| combinar | a fase final: os 8 objetos viram a tarefa pronta, na ordem que funciona |

### O teste da bolinha

> **Troque os itens por bolinhas coloridas. O jogo muda?**

O corte viraria "junte as iguais" e a fase viraria "pegue as da minha cor" —
casamento de cor, zero decomposição. Três coisas impedem isso:

1. **Nada é colorido por parte.** O que diz que a tigela e o ovo andam juntos é
   que **os dois fazem a massa**. Está no [TEXTURAS.md](./TEXTURAS.md) como
   regra 1 da arte, e ela é conferida na folha inteira, não item por item.
2. **A fase final cobra a ordem.** Bolinha nenhuma esquenta água antes de passar
   o café. É ali que a divisão vira solução.

**Os OBJETOS têm nome.** Cada objeto na mesa carrega uma etiqueta — `Colher de
misturar`, `Espátula de espalhar` — porque reconhecer um desenho de utensílio
não é a habilidade avaliada aqui, e sem a etiqueta a criança errava a leitura,
não a decomposição.

### E os PAINÉIS também passaram a ter nome

Cada painel diz de saída qual metade guarda: `MASSA DO BOLO` e `COBERTURA`.
**Isto é uma escolha de produto, e ela custa alguma coisa** — vale estar escrito.

Antes o painel era um espaço anônimo que a criança batizava pelo conteúdo: ela
olhava os oito objetos, decidia sozinha que a tigela e o ovo faziam a mesma
coisa, e a parte nascia disso. Com o nome na tarja, o trabalho muda de
**decidir quais são os grupos** para **reconhecer a que grupo cada coisa
pertence** — de decompor para classificar, que é o que o *Chef dos
Subproblemas* já faz.

O que a decomposição ainda cobra, e cobra sozinha:

| Onde | O que continua sendo dela |
|---|---|
| corte | ninguém diz que a colher é de misturar E que misturar é da massa — a ligação é dela |
| escolha | por qual metade começar |
| fase final | juntar as duas metades numa ordem que funcione |

Se um dia a decisão precisar voltar a ser inteira, o caminho é um só: mostrar a
tarja **vazia** enquanto o painel estiver vazio e escrever o nome do grupo
quando o primeiro objeto cair dentro. É uma linha em `paintTitle`.

### E o que a plataforma acrescenta

**O espaço do painel.** Ele tem 4 lugares e a tarefa tem 8 objetos: não dá
para levar tudo de uma vez. "Dividir o problema em partes menores" deixa de ser
uma instrução e vira uma **necessidade física**.

**A fase é a parte.** Quando a criança joga a fase do painel da massa, o mundo
inteiro daquela viagem é sobre a massa: só os quatro objetos dela nascem no
mapa. O que ocupa o resto do caminho é LIXO — meia fedida, barata, peixe morto.

Até aqui as vagas soltas recebiam os objetos da OUTRA metade, e apanhar um deles
era o erro conceitual no meio da corrida. Trocar aquilo por lixo tirou o erro de
cabeça de dentro da viagem: **a divisão passou a ser decidida no corte e
conferida na fase final**, e a viagem virou execução — correr, pular, buscar. O
lixo, esse sim, custa vida — ver §8.

---

## 2. Como isso não vira os dois irmãos

| | Chef dos Subproblemas (EF03CO03) | Arquiteto das Missões (EF15CO04) | **Missão em Pedaços** |
|---|---|---|---|
| Corpo do jogo | arrastar cartas para pratos | tocar cartas numa bandeja | **plataforma 2D: andar, pular, coletar** |
| Quem cria as partes | o jogo (os pratos existem) | o jogo (as cartas existem) | **a criança**, cortando a tarefa no meio |
| O que prova que a parte está certa | conferir a carta no prato | conferir a carta no pedido | **voltar com os 4 objetos e a fase final andar** |
| O que limita | nada | nada | **os 4 espaços do painel e o caminho** |
| O erro | carta no prato errado | carta que não é do pedido | **pôr no mesmo painel duas coisas que fazem trabalhos diferentes** |
| O fim | linha do tempo montada | mesa posta | **a tarefa sendo feita**: o café passando, a barraca subindo |

Uma frase: **nos irmãos a criança PENSA a divisão; aqui ela VIVE a divisão** —
faz a viagem, carrega o peso, arrisca o buraco e depois executa a tarefa com o
que trouxe.

É o mesmo par que já existe em EF03CO02 neste projeto: *Labirinto do Enquanto*
(simulação mental) e *Corra Enquanto...* (execução).

---

## 3. O laço

```
A TAREFA ENTRA
→ o CARTÃO DA TAREFA abre: o nome, os 8 objetos e o que fazer (4 s ou um toque)
→ CORTE                                                       ← DIVIDIR
   ↳ o quintal, a mesa com os 8 objetos e os dois painéis vazios no gramado
   ↳ toque num objeto: ele voa para o painel escolhido
   ↳ toque num objeto dentro do painel: ele volta para a mesa
   ↳ objeto que não combina com o que já está lá: TRAVA (§8)
   ↳ os dois painéis cheios (4 + 4) → botão VAMOS!
→ ESCOLHA — o quintal escurece e os dois painéis vêm para a frente
   ↳ "Qual você vai fazer primeiro?" — a ordem é dela
→ FASE — uma por painel, na ordem que ela escolheu             ← RESOLVER
   ↳ o mundo abre; o herói entra correndo
   ↳ ← → andam, PULAR pula; a câmera segue
   ↳ os 4 objetos DESTA VIAGEM estão pelo caminho — e só eles
   ↳ pegou um: entra no espaço da viagem, com brilho e som
   ↳ o caminho tem LIXO: encostar custa UMA VIDA e derruba tudo
   ↳ buraco: derruba um objeto e volta ao ponto — sem custar vida
   ↳ os quatro na mão → a bancada, no fim de uma reta limpa, acende
   ↳ chegou: cada objeto sobe num arco e pousa no tampo; a bancada acende
   ↳ a CORTINA fecha com o nome do que vem, e abre no cenário seguinte
→ FASE FINAL — FAZER A TAREFA                                  ← COMBINAR
   ↳ a bancada com os 8 objetos em volta e a estação no meio
   ↳ toque num objeto: ele executa o passo dele
   ↳ passo fora de hora: o objeto volta e a plaquinha diz o porquê
   ↳ cada passo certo avança a arte do resultado (final-nN)
→ TAREFA PRONTA
   ↳ confete e o cartão PRONTO!, e a tarefa seguinte começa
```

Controles na fase: **três botões grandes** — ← , → e PULAR. Nada mais. No
computador, setas/A-D e espaço fazem o mesmo. No corte e na fase final é só
toque.

---

## 4. Clareza para criança

| Conceito | Como a tela mostra |
|---|---|
| esta é a tarefa | o cartão de abertura, e a instrução fixa no topo |
| corte no meio | dois painéis de borda pontilhada, cada um com o NOME do grupo na tarja |
| qual metade primeiro | a tela escurece e os dois painéis vêm para a frente, com a pergunta |
| esta metade já tem coisa | os objetos aparecem dentro do painel, em tamanho grande |
| estes não combinam | o painel balança e devolve o objeto, com a frase dizendo o porquê |
| o que eu vim buscar | os quatro espaços no alto da tela, com a silhueta do que falta |
| peguei | o objeto voa para o espaço e o espaço acende |
| pisei no lixo | "eca", a tela pisca e a viagem volta ao começo — custa uma vida |
| a metade voltou | os objetos saltam para a bancada e o painel ganha selo verde |
| agora faça a tarefa | a estação no meio da bancada e a instrução: `Toque no que vem agora.` |
| deu certo | a arte do resultado avança um estado |
| a tarefa acabou | confete e o cartão PRONTO! com o resultado no meio |

**A silhueta no alto da tela é de propósito.** A decisão de cortar já foi tomada;
dentro da fase o trabalho é executar. Sem a silhueta, esquecer o que ela mesma
escolheu 20 segundos antes viraria erro de memória — e memória não é a
habilidade deste jogo.

---

## 5. A grade: o mundo inteiro, os botões por cima

Tela fixa de **1280 x 720** com `Phaser.Scale.FIT`. A coluna "No celular" usa
fator 0,30 (aparelho de 390 px de largura).

### Na tela do corte

O corte **não é uma página de interface**: é o quintal, o mesmo da corrida. A
criança separa a tarefa no gramado e sai correndo dali — por isso as duas
telas usam o mesmo fundo.

| Faixa | y | Conteúdo | Tamanho | No celular |
|---|---|---|---|---|
| Header | 0 - 82 | nível, vidas, **a instrução do momento**, `?` | `?` toque 116 x 116 | 35 x 35 |
| Mesa | tampo em 250 | **os 8 objetos**, numa fileira só, apoiados no tampo | item 100, passo 118 | 30 / 35 |
| Etiquetas | 316 (centro) | **o nome de cada objeto**, na beirada da mesa | 104 x 42, fonte 14 | 31 x 13 |
| Painéis | 566 (centro) | 2 painéis de 440 x 168 no gramado, 4 lugares de 96 em fila | toque 440 x 208 | 132 x 62 |
| Herói | pés em 700, x 1096 | de pé à direita, esperando | 208 de altura | 62 |
| VAMOS! | 424 (centro), x 1096 | balão de fala saindo do herói | 276 x 100 | 83 x 30 |

### Na escolha da viagem

| Faixa | y | Conteúdo | Tamanho |
|---|---|---|---|
| Véu | tela toda | o quintal escurece em 66% de tinta | 1280 x 720 |
| Pergunta | 216 | `Qual você vai fazer primeiro?` | 42 px, branco com contorno |
| Painéis | 402 | os dois lado a lado, 14% maiores | 502 x 192 cada |

Os painéis **viajam** da posição do gramado até o centro em 340 ms, e o véu
entra junto. O painel já feito fica verde, com selo e 55% de opacidade; só o que
falta aceita toque.

**Os 8 objetos ficam numa fileira só, não em duas.** Duas fileiras pediriam uma
estante e dariam pesos diferentes a quem está em cima e a quem está embaixo — e
o trabalho da criança aqui é justamente **comparar os oito entre si**. Em
fileira única todos valem o mesmo. Cada um tem zona de toque de 118 x 170, que
dá 35 x 51 px reais no celular.

### O painel, e a etiqueta

**Cada metade mora num PAINEL de borda pontilhada**, com quatro lugares em
fila. Ele passou por três formas até chegar aqui:

| Forma | Por que saiu |
|---|---|
| mochila em `Graphics` | corpo, aba, duas alças e fivela: uma pilha de retângulo arredondado que nunca ia parecer mochila, e parecia maleta |
| caixote de `chao.png` | textura de verdade, mas os quatro lugares tinham que ser vazados escuros por cima das tábuas e do travessão em diagonal, e brigavam com o desenho |
| **painel pontilhado** | não finge ser objeto nenhum: é uma superfície onde as coisas são postas, e os quatro lugares se leem de relance |

**Cada objeto na mesa tem uma ETIQUETA com o nome.** Uma colher de pau e uma
espátula são, no traço, dois cabos com uma ponta chata: a criança errava por não
reconhecer o desenho, e reconhecer desenho não é a habilidade que este jogo
avalia. As etiquetas dizem **o que o objeto é** e, quando o desenho não basta, **o
que ele faz** — `Colher de misturar` contra `Espátula de espalhar`.

> **O que a etiqueta NUNCA diz é de que metade o objeto é.** Nenhuma delas
> carrega a palavra "massa" ou "cobertura". A criança ainda precisa saber que
> misturar vem antes de assar e espalhar vem depois — e essa inferência é a
> decomposição. O teste da bolinha continua de pé: troque os objetos por
> bolinhas e as etiquetas somem junto, porque elas nomeiam o objeto, não a parte.

As etiquetas ficam na **beirada** da mesa, não em cima do tampo. Em cima, as
oito juntas viravam uma barra branca atravessando a tela: a mesa sumia e aquilo
parecia menu. Na beirada, com folga entre uma e outra, cada uma pertence ao
objeto que está logo acima — como etiqueta de prateleira de mercado.

**São DOIS toques, e a escolha é explícita:**

| Toque | O que acontece |
|---|---|
| 1 — no objeto | ele sobe um pouco e a ETIQUETA dele fica dourada; uma setinha aparece em cima de cada painel que ainda tem lugar |
| 2 — no painel | o objeto voa para o primeiro lugar vazio dele |
| no objeto de novo | desfaz a escolha |
| num objeto DENTRO do painel | ele volta para o lugar dele na mesa |

A primeira versão tinha um "painel selecionado" invisível: a criança tocava
num objeto e ele ia direto para um painel que ela não tinha escolhido. Com
dois toques, o corte é uma decisão declarada — que é exatamente a habilidade.

**NADA PULSA.** O objeto na mão e os painéis já ganharam, juntos, um anel
amarelo piscando: era como dizer "olhe para os dois ao mesmo tempo", o oposto de
indicar para onde ir. Agora o objeto na mão fica levantado com a etiqueta
dourada — isto é o que você tem — e a setinha estática em cima de cada painel
diz onde ele pode ser posto. Indicador, não pulso.

**O lugar de cada objeto na mesa é fixo.** Sai de um painel, volta para o
mesmo ponto, e o buraco que ele deixa fica lá enquanto ele estiver guardado: a
mesa vira um mapa do que já foi decidido.

**A instrução do topo muda com o momento:**

| Momento | O que o topo diz |
|---|---|
| nada escolhido | Toque numa coisa da mesa. |
| objeto na mão | Agora toque no painel que leva isso. |
| tudo guardado | Tudo guardado! Toque em VAMOS! |
| escolher a viagem | Toque no painel que você vai levar agora. |
| correndo | Pegue só o que é desta viagem! |
| viagem completa | Leve tudo até a bancada! |
| fase final | Agora faça a tarefa: toque no que vem agora. |
| passo feito | a frase do passo: `Mexe, mexe: a massa ficou pronta.` |

### Na fase

| Faixa | y | Conteúdo | Tamanho | No celular |
|---|---|---|---|---|
| Header | 0 - 82 | nível, vidas, **os 4 espaços da viagem**, `?` | espaço 58 x 58 | 17 x 17 |
| Mundo | 82 - 720 | a câmera, seguindo o herói | mapa 4140 x 720 | — |
| — chão | topo em 500 | **duas fileiras** de blocos QUADRADOS de 180 | herói 176 de altura | 53 |
| — plataformas | 330 e 240 | 170 do chão; 240 só de outra plataforma | — | — |
| — pedras | no chão | topo 110 px acima do chão, 108 de largura sólida | 148 na tela | 44 |
| — lixo | no chão e nas plataformas | meia, barata, peixe morto | 116 na tela | 35 |
| Botão ← | centro (120, 606) | flutua sobre o mundo | 156 de diâmetro | 47 |
| Botão → | centro (296, 606) | | 156 | 47 |
| Botão PULAR | centro (1150, 596) | do lado oposto, para os dois polegares | 184 | 55 |

Os quatro espaços do painel cabem no canto direito do header: 4 x 58 + 3 x 10
= 262 px, terminando em x 1180, antes do `?`.

**O bloco é QUADRADO e nunca é esticado.** Duas fileiras de 180 px: a de cima é
o bloco com grama, a de baixo é terra pura e passa da borda da tela — quem corta
é a tela. São 220 px de chão visível.

A versão anterior tentou engordar a faixa de grama recortando o quadro e
espremendo o recorte na fileira: 296 px de largura viravam 121, e 156 de altura
viravam 121 também. Quase 2,5 vezes de deformação horizontal — borrado e mal
desenhado. **A proporção da grama é a que a arte tem (22% do bloco); querer mais
verde é pedir outra arte, não espremer esta.** Bloco maior resolve o resto: com
180 px a faixa verde tem 40, contra 28 que sobravam antes.

**A pedra é o único obstáculo que empurra.** As plataformas são atravessáveis de
baixo para cima e só param quem cai em cima delas; a pedra bloqueia de lado.
É ela que transforma "andar para a direita" em "pular" sem custar vida nenhuma:
quem não pula fica parado, e a criança entende o botão sozinha.

**A física sai desses números, não o contrário:**

| Grandeza | Valor | Vem de |
|---|---|---|
| gravidade | 2400 px/s² | queda que não parece lua |
| impulso do pulo | 1000 px/s | altura de 208 px — passa a plataforma de 176 |
| velocidade | 360 px/s | alcance de 300 px no ar |
| **buraco** | 200 px de vão | 67% do alcance: dá para errar e ainda passar |
| **pedra** | 96 px de topo | 46% da altura do pulo: passa em qualquer salto |

Nenhum salto do jogo pode exigir mais do que 80% do alcance máximo. Um pulo
perfeito obrigatório é o tipo de coisa que faz criança de 8 anos largar o jogo.

### Na fase final

| Faixa | y | Conteúdo | Tamanho | No celular |
|---|---|---|---|---|
| Header | 0 - 82 | nível, vidas, a frase do passo, `?` | — | — |
| Resultado | apoiado no tampo | o quadro de `final-nN` que está valendo | 260 | 78 |
| Bancada | pés em 520 | a `bancada.png`, no meio do quintal | 430 de largura | — |
| Bandeja | 596 (centro) | os 8 objetos trazidos, em fila | item 118, passo 148 | 35 / 44 |
| Etiquetas | 679 (centro) | o nome de cada objeto da bandeja | 104 x 42 | 31 x 13 |

A mesa do corte e o herói **saem de cena** na fase final: o palco é a bancada
com o resultado em cima e os oito objetos embaixo, e mais nada disputando o
olho. O que já pode ser usado ganha anel dourado e flutua.

**Sem `final-nN.png`, os objetos usados FICAM na bancada**, em duas fileiras de
quatro: a pilha que cresce faz o papel do desenho do resultado. Com a folha, o
objeto desaparece dentro do resultado e é o resultado que muda de quadro.

---

## 6. Níveis, tarefas e fases

**Fase = uma viagem = um painel.** Tarefa = corte + duas viagens + o resultado.

O resultado acontece de dois jeitos, e a escolha é por tarefa:

- **Na bancada.** A viagem termina na bancada, a criança volta com os quatro
  objetos e a tarefa acontece depois, numa tela à parte — é a **fase final**.
- **No mapa.** A viagem termina nas **estações**: pontos fixos do fim do mapa
  onde cada PAR de objetos é usado onde ele serve. A tarefa acontece durante a
  corrida, e não há fase final.

| Nível | Tarefas | Mapa | Objetos | Painéis | Viagens | Fases finais | Estações |
|---|---|---|---|---|---|---|---|
| 1 | Bolo, Piquenique | 5.400 px | 8 | 2 | 4 | 2 | — |
| 2 | Sanduíche, Café | 6.480 px | 8 | 2 | 4 | 1 | 4 (só o café) |
| 3 | Fogueira, Barraca | 6.840 px | 8 | 2 | 4 | — | 8 |

Seis tarefas, doze viagens, três fases finais e doze estações.

### Nível 1 — a festa no quintal (`fundo-n1`)

| Tarefa | Painel A | Painel B | Fase final |
|---|---|---|---|
| **Fazer o bolo** | **massa do bolo**: tigela, ovo, farinha, colher | **cobertura**: calda, confeitos, espátula, velinha | forma → massa → assado → decorado |
| **Arrumar o piquenique** | **comida**: sanduíche, suco, maçã, uvas | **brincadeira**: bola, bambolê, pipa, corda | toalha dobrada → estendida → cesta → posto |

Entra: andar, pular, um buraco, uma escada de duas plataformas, o lixo do
caminho. O bolo abre com a escada e guarda o vão para o meio; o piquenique faz o
contrário. **5.400 px**, com a bancada em 5.040.

### Nível 2 — o café da manhã na varanda (`fundo-n2`)

| Tarefa | Painel A | Painel B | Resultado |
|---|---|---|---|
| **Fazer o sanduíche** | **o pão**: pão, faca, tábua, manteiga | **o recheio**: queijo, presunto, tomate, alface | fase final: pão na tábua → cortado → com manteiga → montado |
| **Passar o café** | **esquentar a água**: chaleira, jarra, fósforos, luva | **passar o café**: coador, pó, xícara, açúcar | estações no mapa |

Entra o segundo vão e o mapa cresce para **6.480 px**. O sanduíche tem dois vãos
com a escada entre eles e termina na bancada, em 6.120; o café sobe duas vezes e
termina nas estações, em 5.760 e 6.120.

As estações do café, na ordem em que a criança as atende:

| Viagem | Estação 1 | Estação 2 |
|---|---|---|
| Esquentar a água | chaleira + jarra → chaleira cheia no fogareiro | fósforos + luva → o fogo aceso |
| Passar o café | coador + pó → a água quente passando | xícara + açúcar → o café servido |

**Este nível é o exemplo oficial da habilidade, inteiro** — "esquentar a água,
pegar o pó, passar, servir". As duas tarefas juntas são o café da manhã, e a
ordem entre elas é livre: fazer o sanduíche todo e depois o café, ou o
contrário. É exatamente disso que o texto da BNCC fala.

### Nível 3 — acampar no quintal, à noite (`fundo-n3`)

As duas tarefas do nível 3 acontecem no mapa, e as duas têm **cadeado entre as
metades**: o painel B só abre depois que o A voltou. É o mapa mais longo,
**6.840 px**, com as estações em 6.120 e 6.480 — a fogueira tem duas pedras
seguidas, como um portão, e a barraca alterna vão, escada, vão, escada.

| Tarefa | Painel A | Painel B | Cadeado |
|---|---|---|---|
| **A fogueira e o lanche** | **a fogueira**: gravetos, tora, fósforos, pedra | **o lanche**: marshmallow, espeto, biscoito, chocolate | o lanche só depois da fogueira |
| **Montar a barraca** | **armar a barraca**: lona, vareta, estaca, martelo | **fazer a cama**: saco, travesseiro, colchonete, lanterna | a cama só depois da barraca |

| Viagem | Estação 1 | Estação 2 |
|---|---|---|
| A fogueira | pedra + gravetos → a roda de pedras montada | tora + fósforos → o fogo aceso |
| O lanche | marshmallow + espeto → tostando no fogo | biscoito + chocolate → o lanche montado |
| Armar a barraca | lona + estaca → a lona estendida | vareta + martelo → a barraca em pé |
| Fazer a cama | colchonete + saco → a barraca aberta, o colchonete dentro | travesseiro + lanterna → a cama feita |

O nível 3 é o que fecha a ideia: **as duas metades não são independentes**.
Escolher o painel trancado não custa vida — o topo diz `Antes disso: A
fogueira.` e devolve a escolha, porque a ordem é o que ele veio ensinar. Nos
níveis 1 e 2 a ordem das viagens é livre, de propósito.

### Por que a estação não pediu folha nova

Cada estação mostra, **escurecida**, a arte do estado que ela vai virar — e essa
arte é um quadro do `final-nN`, a mesma folha que a fase final usa. Quando a
criança chega com o par certo, o desenho **acende**.

A silhueta é o que faz a mecânica funcionar: ela diz "aqui vai a chaleira no
fogo" ANTES da chaleira chegar. Sem ela a estação seria um ponto invisível do
mapa, e carregar quatro objetos por 4.500 pixels viraria adivinhação.

O estado que antes só existia na tela final passou a existir no mundo, onde a
criança está — e por isso a tarefa com estação **não tem** fase final: seria
contar a mesma história duas vezes.

---

## 7. As regras, em código

A parte **não existe nos dados**: ela é o conteúdo de um painel.

```ts
export interface Item {
    id: string
    name: string                   // a etiqueta: "Colher de misturar"
    label: string                  // o mesmo, dentro de uma frase: "a colher"
    frame: number
    jobId: string
}

export interface Job {
    id: string
    name: string                   // a tarja do painel: "Massa do bolo", "Comida"
    partOf: string                 // "da massa", "da cobertura" — para a frase da trava
    requires?: string              // a metade que vem antes. Só o nível 3.
    stations?: Station[]           // quando existem, a viagem acaba AQUI, e não na bancada
}

/** Um lugar do mapa onde a tarefa acontece de verdade. */
export interface Station {
    id: string
    x: number
    needs: string[]                // os itens que ela consome, todos de uma vez
    after?: string[]               // as estações que precisam estar prontas antes
    frame: number                  // o quadro de final-nN que ela vira ao acender
    line: string                   // a frase quando ela acontece
    hint: string                   // a frase quando a criança chega sem o que falta
}

/** Um passo da FASE FINAL: tocar num item, quando ele já pode ser tocado. */
export interface Step {
    itemId: string
    after?: string[]               // ids de passos que precisam ter acontecido
    line: string                   // a frase quando o passo acontece
    hint: string                   // a frase quando ela toca fora de hora
}

export interface Task {
    id: string
    name: string
    sheetKey: string               // itens-nN-a | itens-nN-b
    finalKey: string               // final-nN
    brief: string                  // o que o cartão de abertura diz
    items: Item[]                  // 8
    jobs: [Job, Job]               // sempre dois: a tarefa é cortada no MEIO
    steps: Step[]
    /** O quadro de final-nN por QUANTIDADE de passos: states[n], n de 0 a 8. */
    states: number[]
    finalLine: string
    map: RunMap
}

export const TRIP_SLOTS = 4

/** Uma viagem é só uma lista de itens: a metade que foi num painel. */
export type Trip = Item[]

/**
 * O ÚNICO erro do corte: pôr num painel algo da outra metade.
 *
 * O painel tem dono desde o começo, porque leva o nome do grupo na tarja.
 */
export const fits = (task: Task, tripIndex: number, item: Item) =>
    task.jobs[tripIndex]?.id === item.jobId

/** Guarda: o item apanhado tem que ser um dos quatro desta viagem. */
export const belongsToRun = (trip: Trip, item: Item) =>
    trip.some(other => other.id === item.id)

export const tripFull = (trip: Trip) => trip.length >= TRIP_SLOTS

export const runLocked = (trip: Trip, task: Task, doneJobs: Set<string>) => {
    const job = task.jobs.find(other => other.id === tripJob(trip))
    return !!job?.requires && !doneJobs.has(job.requires)
}

/** Uma estação só abre depois das que ela exige... */
export const stationReady = (station: Station, done: Set<string>) =>
    (station.after ?? []).every(id => done.has(id))

/** ...e só é atendida com TODOS os itens dela na mão. */
export const stationFed = (station: Station, carried: Item[]) =>
    station.needs.every(id => carried.some(item => item.id === id))

/** A tarefa com estação não tem fase final: a receita acontece na viagem. */
export const hasStations = (task: Task) => task.jobs.some(job => !!job.stations?.length)

/** Na fase final, um passo só pode acontecer depois dos que ele exige. */
export const stepReady = (step: Step, done: Set<string>) =>
    (step.after ?? []).every(id => done.has(id))
```

**A tarefa com estação tem `steps` e `states` vazios.** Não é esquecimento: a
sequência dela mora nas estações, e uma tarefa não pode contar a mesma história
duas vezes. O jogo decide o caminho por `hasStations(task)`.

**`states` é por CONTAGEM, e não por passo.** No piquenique a ordem é livre: se
a arte estivesse presa a um item, tocar na corda primeiro pularia direto para o
piquenique posto. Por contagem, o desenho anda junto com o quanto foi feito, não
com o quê.

### O mapa, e por que cada tarefa tem o seu

```ts
export interface RunMap {
    length: number                          // 5400 no N1, 6480 no N2, 6840 no N3
    gaps: { x: number; w: number }[]        // os buracos no chão
    platforms: { x: number; y: number; w: number }[]
    rocks: { x: number }[]                  // o obstáculo que empurra de lado
    tripSpots: { x: number; y: number }[]   // onde nascem os 4 itens da viagem
    trash: { x: number; y: number }[]       // o lixo do caminho
    checkpoints: number[]
    benchX: number
}
```

O mapa não sabe quais itens carrega: o jogo põe nas `tripSpots` os quatro itens
do painel da vez, e o `trash` é fixo. **É o mesmo mapa nas duas viagens da mesma
tarefa** — e isso é bom: a segunda viagem é a mesma casa, outro objetivo, e a
criança já sabe onde ficam os buracos. O que muda é o que ela veio buscar.

**Mas são seis mapas, um por tarefa, e eles crescem com o nível:**

| Nível | Tarefa | Comprimento | Vãos | Pedras | Lixo | Fim |
|---|---|---|---|---|---|---|
| 1 | bolo | 5.400 | 1 | 2 | 2 | bancada em 5.040 |
| 1 | piquenique | 5.400 | 1 | 2 | 2 | bancada em 5.040 |
| 2 | sanduíche | 6.480 | 2 | 2 | 2 | bancada em 6.120 |
| 2 | café | 6.480 | 1 | 2 | 2 | estações em 5.760 e 6.120 |
| 3 | fogueira | 6.840 | 2 | 3 | 2 | estações em 6.120 e 6.480 |
| 3 | barraca | 6.840 | 2 | 2 | 2 | estações em 6.120 e 6.480 |

Antes eram dois esqueletos repetidos seis vezes — e o nível 3 corria exatamente
o mapa do nível 2. Agora o que muda de tarefa para tarefa é o RITMO, não só o
comprimento: o bolo abre com a escada e guarda o vão para o meio; o piquenique
põe o vão logo no começo e a escada no fim; o sanduíche tem dois vãos com a
escada entre eles; o café sobe duas vezes; a fogueira tem duas pedras seguidas,
como um portão; a barraca alterna vão, escada, vão, escada.

O `benchX` do mapa com estação não é usado: as estações ficam nos últimos 720 px,
depois do quarto item. É de propósito que venham DEPOIS de tudo — a criança chega
ali com as mãos cheias, e a decisão de qual par entregar primeiro é a última
coisa que a viagem cobra dela.

**O fundo acompanha sem emendar.** O parallax não é fixo: é `min(0,35, folga /
rolagem)`, e a folga é o quanto o fundo passa da tela — 640 px. Num mapa de
6.840 isso dá 0,115, e o fundo anda 640 px ao longo da fase inteira. Mapa mais
longo deixa o fundo mais lento, que é exatamente o que "longe" quer dizer.

Pontuação interna:

| Situação | Evento | Pontos |
|---|---|---|
| viagem concluída (na bancada ou na última estação) | `CORRECT_ANSWER` | +10 |
| tarefa concluída (com ou sem fase final) | `CORRECT_ANSWER` | +10 |
| escolher o painel trancado do nível 3 | nada — o topo diz qual vem antes | 0 |
| chegar na estação sem o par, ou fora de ordem | nada — ela balança e diz o que falta | 0 |
| misturar as metades no corte | `WRONG_ANSWER` + `lives.lose()` | 0 |
| passo fora de hora na fase final | nada | 0 |
| encostar no lixo | `lives.lose()`, derruba tudo, volta ao ponto | 0 |
| buraco, pedra | nada | 0 |

Um nível completo = 2 tarefas x (2 x 10 + 10) = **60**. Nenhum desses números
aparece na tela.

---

## 8. O erro: um de cabeça, três de dedo

**Erro de cabeça — e ele é um só, num lugar só: pôr um objeto no painel do grupo
errado.**

| Onde | O que a criança fez | A trava |
|---|---|---|
| corte | pôs a calda no painel da MASSA DO BOLO | o painel balança, o mundo escurece e a plaquinha diz `A calda não é da massa — vai no outro.` |

Custa uma vida (`WRONG_ANSWER` + `lives.lose()`), destrava sozinha depois de
1,7 s e devolve a criança exatamente onde ela estava.

**A VIAGEM não tem mais erro de cabeça.** Ela tinha: os objetos da outra metade
nasciam espalhados pelo caminho, e apanhar um deles travava o mundo e custava
vida. No lugar deles entrou o LIXO, que é obstáculo e não pegadinha. A conta é
esta: a divisão é decidida uma vez, no corte, e conferida uma vez, na fase final
— pedir a mesma decisão de novo no meio de um pulo cobrava, na prática, o dedo.

**Mas o LIXO É FATAL.** Encostar numa meia fedida, numa barata ou num peixe morto
custa uma vida, derruba TUDO o que a criança já tinha juntado e devolve ela ao
último ponto. Na terceira vez, `createLives` chega a zero e o jogo acaba.

Um hazard que mata muda o mapa inteiro, e por isso o mapa foi refeito em volta
dele:

| Regra | Por quê |
|---|---|
| **dois lixos por mapa**, não quatro | um obstáculo que mata não precisa de repetição para pesar |
| **pista aberta**, com 400 px de aproximação | tem que dar para ver de longe e decidir se pula |
| **nada por cima** do lixo | quem desce de uma plataforma não pode cair em cima dele |
| **nunca na zona de pouso** de um buraco ou de uma pedra | o pulo que a criança já fez não pode virar armadilha |
| **900 px limpos antes da bancada** | ninguém deve perder a viagem inteira a um passo de entregar |

**A fase final NÃO tem erro de cabeça, e não custa vida.** Tocar num passo fora
de hora faz o objeto balançar e a instrução do topo explicar por quê — `A massa
ainda não foi misturada.` — e nada mais. A decisão que a habilidade cobra já foi
tomada no corte; a fase final é onde a criança **vê** a divisão dela virar a
tarefa pronta, e cobrar vida ali punia curiosidade, não erro. Por isso, também,
tudo que já pode ser usado fica aceso o tempo todo: ela nunca precisa adivinhar.

**Erros de dedo — e eles NÃO custam vida:**

| Situação | O que acontece |
|---|---|
| cair no buraco | o herói reaparece no último ponto e **derruba 1 objeto**, que volta para a vaga dele |
| bater na pedra | para de andar; o pulo passa por cima |
| pular e não alcançar | nada: cai no chão e tenta de novo |

Essa separação é a regra que mais custou caro neste projeto: **punir dedo lento
pune a coisa errada.** O buraco existe para dar sabor de plataforma, não para
reprovar na BNCC.

**Nenhum estado sem saída.** Objeto derrubado volta para a vaga original e pode
ser pego de novo; a bancada só aceita painel completo e, enquanto faltar coisa,
uma setinha aponta o caminho de volta. Na fase final sempre existe pelo menos um
passo pronto para ser feito. Não existe fase impossível de terminar.

---

## 9. Feedback

| Momento | Visual | Som |
|---|---|---|
| tarefa entra | o cartão desce com os 8 objetos, os painéis sobem | acorde curto |
| objeto vai para o painel | voa em arco e ocupa o lugar | plim subindo |
| os dois cheios | o quintal escurece, os painéis vêm para a frente | fanfarra curtinha |
| objeto volta para a mesa | cai de volta, sem drama | click curto |
| painel recusa | tremida, objeto devolvido, plaquinha | acorde descendo |
| VAMOS! | a tela fecha em cortina e o mundo abre | fanfarra curtinha |
| correndo | poeirinha nos pés | passos alternados |
| pulo | esticada no ar, sombra no chão marcando onde vai cair | "hop" |
| pegou o certo | o objeto voa para o espaço, faísca dourada | plim, meio tom acima a cada objeto |
| encostar no lixo | faísca verde, "eca", a tela pisca e tudo cai | ploc + acorde descendo |
| buraco | a tela pisca e ele volta ao ponto | ruído grave |
| chegou na bancada | cada objeto sobe num arco alto, POUSA no tampo e pisca; no fim a bancada inteira acende | carimbada por objeto |
| troca de momento | uma CORTINA fecha em duas metades, com o nome do que vem, e abre no cenário novo | — |
| passo da fase final | o objeto voa para a estação e o resultado troca de quadro | acorde de três notas subindo |
| passo fora de hora | o objeto volta para a fila, plaquinha | acorde descendo |
| tarefa pronta | o resultado cresce um pouco, confete e estrelas | fanfarra `[523, 659, 784, 1047]` |

O efeito que carrega o jogo é **o resultado trocando de quadro**: é ali que a
criança vê que as dois painéis que ela encheu viraram a tarefa feita.

**A sombra do herói no chão** não é enfeite: é ela que diz onde ele vai cair, e
é o que torna o buraco justo num jogo que roda em tela pequena.

---

## 10. Tutorial: cinco passos, um por momento

`shared/tutorial/createTutorial`, `key: 'ef03co03-<momento>-lN'`, `once: !force`,
`pointer.tap: true`. São três chamadas — `plan`, `run` e `finale` — e cada uma
abre no primeiro momento do tipo dela.

| Chamada | Passo | O dedo bate em | A frase |
|---|---|---|---|
| `plan` | 1 | um objeto da mesa | `Toque numa coisa da mesa.` |
| `plan` | 2 | o primeiro painel | `Agora toque no painel que leva isso. Cada painel é uma metade da tarefa.` |
| `run` | 1 | o botão PULAR | `Use os botões para andar e pular.` |
| `run` | 2 | o primeiro item do caminho | `Pegue só o que é desta viagem e leve até a bancada.` |
| `finale` | 1 | o primeiro passo pronto | `Agora faça a tarefa: toque no que vem agora.` |

Os dois passos de `run` aparecem na primeira viagem, com o mundo parado. As
coordenadas saem dos objetos de verdade (`plan.shelfPos()`, `plan.bagPos()`,
`pad.jumpBounds()`, `pickups.position()`, `finale.trayBounds()`), nunca de
números fixos. O `?` do header repete o tutorial do momento em que a criança
está.

---

## 11. Textura e Graphics

**Texturas:** `heroi`, `chao`, `fundo-n1`, `bancada`, `itens-n1-a`, `itens-n1-b`,
`final-n1` e `lixo` — tudo entregue. Faltam as folhas dos níveis 2 e 3, os dois
fundos, `mesa` e a capa: estão no [TEXTURAS.md](./TEXTURAS.md).

**`lixo.png` aposentou o `perigos.png`.** A folha tem três quadros de 256 — meia
fedida, barata, peixe morto — e cobre sozinha tudo o que o caminho precisa. Ela
veio da pasta do `corrida-do-cotidiano` e foi COPIADA para cá: cada jogo é dono
dos assets que carrega, e o `import.meta.glob` do `BootScene` só enxerga a pasta
do próprio jogo.

**É Graphics:** header, pílula de nível, vidas, o painel com sua borda
pontilhada e os quatro lugares, a etiqueta com o nome do objeto, a setinha que
indica onde guardar, o véu da escolha, plaquinha da trava, cadeado, corrente, botões ← → PULAR, sombra do herói,
poeira, faísca, moldura de acerto e erro, confete e painel de fim de nível.

Os botões de controle são `Graphics` de propósito: eles têm quatro estados
(solto, apertado, desligado, destacado pelo tutorial) e ficam por cima de um
mundo que se move — um PNG teria que ser redesenhado quatro vezes e ainda assim
não acompanharia o estado.

A sombra do herói também: ela **encolhe e escurece conforme a altura**, e isso é
uma conta a cada quadro.

---

## 12. Registro

```
src/games/EF03CO03/missao-em-pedacos/
src/assets/games/EF03CO03/missao-em-pedacos/
```

| Campo | Valor |
|---|---|
| `id` | `061` |
| `slug` | `missao-em-pedacos` |
| `module` | `EF03CO03/missao-em-pedacos` |
| `skill` | `EF03CO03` |
| `years` | `[3]` |
| `tags` | `["decomposição", "plataforma", "pulo", "partes"]` |
| `order` | `165` |
| `points` | `60` por nível |
| `icon` | `🎒` |

Também em `src/data/gameInstructions.ts` e no conjunto
`GAMES_WITH_IN_GAME_COMPLETION_SCREEN`, em `src/pages/GameDetailsPage.tsx`.

Plataforma, via `runtimeGameBridge` (nunca `gameBridge`):

| Evento | Quando |
|---|---|
| `GAME_READY` | uma vez, com o primeiro corte na tela |
| `CORRECT_ANSWER` | a cada viagem concluída e a cada fase final |
| `WRONG_ANSWER` | mistura de metades e passo fora de hora — e aí `lives.lose()` |
| `CHECKPOINT` | a cada viagem, `progress` sobre as 4 viagens do nível |
| `GAME_COMPLETED` | ao fim de **cada** nível, `totalStages: LEVELS.length` |
| `GAME_OVER` | nunca daqui: sai de `createLives`, no zero |

Sem relógio: este é jogo de pensar antes e executar depois, e pressa só
atrapalharia o pulo.

---

## 13. Arquivos

```
types.ts                Item, Job, Station, Step, Task, Trip, RunMap, Rock, Spot, Mode
data/theme.ts           cores, fontes
data/layout.ts          a grade, os botões, os quadros de chao.png e a FÍSICA
data/rules.ts           fits(), tripFull(), belongsToRun(), runLocked(), stepReady(),
                        stationReady(), stationFed(), hasStations()
data/levels.ts          LEVELS: as tarefas, os passos, os estados e os mapas
scenes/BootScene.ts     glob das texturas + createLoadingScreen + faseInicial
scenes/GameScene.ts     orquestra corte → fase → fase final. Não desenha nada.
scenes/room.ts          o quintal: fundo, mesa e o herói parado
scenes/intro.ts         o cartão de abertura, com os 8 objetos
scenes/plan.ts          mesa, etiquetas, painéis, escolha da viagem e o VAMOS
scenes/world.ts         fundo com parallax, chão de duas fileiras, plataformas, pedras
scenes/hero.ts          o herói: física, bloqueio nas pedras, estados e animação
scenes/pickups.ts       os objetos no mundo e a coleta
scenes/hazards.ts       o lixo do caminho: meia, barata, peixe morto
scenes/bench.ts         a bancada do fim da trilha e a descarga do painel
scenes/stations.ts      AS ESTAÇÕES: a silhueta do resultado no mapa, e o acender
scenes/finale.ts        A FASE FINAL: a bancada, a bandeja, os passos e final-nN
scenes/pad.ts           ← → PULAR, e o teclado
scenes/hud.ts           header, os 4 espaços do painel
scenes/lock.ts          a trava: véu, cadeado e plaquinha
scenes/audio.ts         WebAudio, sem arquivo
```

**A GameScene não desenha.** Se ela precisar de um `fillRoundedRect`, falta um
painter em `scenes/`.

**A física é própria, não Arcade.** São poucos retângulos sólidos por mapa e um
único corpo móvel: um teste de travessia de topo resolve tudo em vinte linhas, e
a plataforma fica atravessável de baixo para cima de graça. As pedras entram
numa segunda lista, `blocks()`, e são as únicas que também empurram de lado.

---

## 14. Antes da arte existir

Toda textura entra por `import.meta.glob` e é consumida com `textures.exists()`:
o jogo abre e é jogável com zero PNG na pasta. A tabela de reservas está no §19
do [TEXTURAS.md](./TEXTURAS.md).

---

## 15. Ordem de produção

1. ✔ **O nível 1 inteiro**, jogável de ponta a ponta com a arte entregue.
2. `fundo-n2.png` e as três folhas do nível 2 → **os dados do nível 2**.
3. `fundo-n3.png` e as três folhas do nível 3 → **os dados do nível 3**, com o
   cadeado entre as metades (`Job.requires`, já implementado em `runLocked`).
4. `mesa.png` — a última reserva de `Graphics` que ainda está no lugar da arte.
5. Capa.

---

## 16. Antes de considerar pronto

Marcado é o que já foi verificado — o nível 1 inteiro, e os níveis 2 e 3
depois que a mecânica de estação entrou.

- [x] `npx tsc --noEmit` limpo para os arquivos do jogo
- [x] `npx eslint src/games/EF03CO03/missao-em-pedacos` limpo
- [x] jogou as duas tarefas inteiras: corte, duas viagens e a fase final
- [x] viu a trava do corte acontecer (a da fase não existe mais)
- [x] tocou num passo fora de hora e NÃO perdeu vida
- [x] caiu num buraco de propósito e voltou sem perder vida
- [x] encostou no lixo: perdeu vida, derrubou tudo e voltou ao ponto
- [x] três lixos seguidos: GAME_OVER pela contagem de vidas
- [x] a pedra barra quem anda e passa em qualquer pulo
- [x] nenhuma plataforma termina em cima de um buraco
- [x] os seis mapas são diferentes entre si, e crescem 5.400 → 6.480 → 6.840
- [x] nenhum lixo em zona de pouso, embaixo de plataforma ou nos 900 px finais
- [x] o fundo corre o mapa inteiro sem mostrar emenda
- [x] a tela de escolha escurece, traz os dois painéis e aceita só o que falta
- [x] a setinha aparece em cima dos painéis com o objeto na mão, e nada pulsa
- [x] o chão de 220 px com bloco QUADRADO de 180, sem esticar a arte
- [x] item e lixo com pelo menos 320 px entre si na mesma superfície
- [x] a beirada do buraco desenha UMA textura só
- [x] a bancada no fim de 900 px limpos, e a entrega dura alguns segundos
- [x] a cortina fecha e abre entre corte, viagem, fase final e tarefa seguinte
- [x] fechada, a cortina cobre a TELA INTEIRA, e as duas folhas se encontram no meio
- [x] os painéis mostram MASSA DO BOLO e COBERTURA
- [x] a fase final tem ícone grande e nenhuma legenda
- [x] o lixo pousa na tábua e no chão, sem boiar
- [x] o botão PULAR pula a cada toque — e segurando, pula de novo a cada pouso
- [x] os 8 objetos na mesa do corte cabem e são tocáveis no celular
- [x] `GAME_COMPLETED` no fim do nível, e o painel final aparece
- [x] nenhum gancho de depuração (`window.__algo`) sobrou
- [x] o cadeado do nível 3 recusa o painel trancado e diz qual metade vem antes
- [x] as quatro estações do café acendem na ordem, e recusam fora dela
- [x] as oito estações do nível 3 acendem na ordem, e recusam fora dela
- [x] a tarefa com estação NÃO abre fase final, e ainda assim fecha o nível
- [x] a fase final do sanduíche aceita a ordem certa e recusa a errada
- [x] o quadro do `final-nN` não mostra fatia do vizinho na borda
- [ ] `?` pausa e repete o tutorial; mudo funciona

---

## 17. O que já foi aprendido aqui

**A BEIRADA DO BURACO DESENHAVA DUAS TEXTURAS.** O quadro da ponta entrava POR
CIMA do bloco comum: as duas bordas apareciam juntas e sobrava um gancho escuro
pendurado no vão. Agora a ponta SUBSTITUI o último bloco do pedaço — o que só é
possível porque os buracos caem na grade de 180.

**O LIXO VIROU FATAL, e o mapa teve de ser refeito em volta disso.** Um obstáculo
que tira vida não pode ser denso: são dois por mapa, os dois em pista aberta com
400 px de aproximação, nada por cima, longe de qualquer zona de pouso, e a
bancada com 900 px limpos antes dela.

**A BANCADA FICOU LONGE, E A ENTREGA GANHOU TEMPO.** Ela estava logo depois do
último obstáculo e a entrega eram quatro arcos rápidos e iguais: a viagem
terminava sem que nada parecesse ter acontecido. Agora cada objeto sobe num arco
alto, pousa no tampo com um baque, e o último acende a bancada inteira.

**AS TROCAS DE MOMENTO GANHARAM CORTINA.** Sair da corrida e cair na fase final
era um corte seco. A cortina fecha em duas metades com o nome do que vem, o jogo
troca de cenário atrás dela, e ela abre.

**A FASE FINAL PERDEU AS LEGENDAS.** Ali a criança já cortou a tarefa e já foi
buscar cada objeto: o nome embaixo de cada um só apertava o desenho. Os ícones
cresceram de 118 para 148.

**O MUNDO ESTAVA ENCOLHIDO — e a primeira tentativa de consertar ESTICOU a
arte.** Bloco de 96 e 124 px de chão viraram bloco de 120 com a grama recortada e
espremida na fileira: 296 px de largura desenhados em 121, quase 2,5 vezes de
deformação horizontal. Ficou borrado.

A regra que ficou: **bloco QUADRADO, sempre, no aspecto da arte.** O tamanho é
180, o chão tem duas fileiras, e a de baixo passa da borda da tela em vez de ser
espremida. Se a faixa de grama parecer fina, o remédio é bloco maior ou arte
nova — nunca esticar.

**A "risca do tile" não era emenda de bloco.** Medido no canvas, as riscas
periódicas do chão são os torrões escuros da própria textura repetindo a cada
bloco. A emenda de verdade existia no CÉU e era outra coisa: o `TileSprite` do
fundo. O que sobrou de precaução foi recortar 2 px da borda de origem dos
quadros do chão, para o filtro bilinear não puxar o quadro vizinho da folha.

**O BOTÃO DE PULAR SÓ PULAVA UMA VEZ POR APERTO.** O pulo existia só no instante
do toque, guardado por 140 ms; criança que segura o botão — e criança segura —
dava um pulo e depois nada, e o botão parecia quebrado. Agora, enquanto o dedo
estiver no PULAR, o herói pula de novo toda vez que encosta no chão.

**LIXO E ITEM ESTAVAM A 120 PX UM DO OUTRO.** Uma meia e um ingrediente lado a
lado na mesma tábua: as caixas de colisão se tocavam e pegar o certo virava
sorte. A regra agora é 320 px na mesma superfície, ou superfícies diferentes.

**O LIXO BOIAVA ACIMA DA TÁBUA.** O desenho acaba em 77,7% da altura do quadro —
o resto é o espaço das ondinhas de fedor. Centrado 46 px acima da superfície ele
ficava no ar; medido, o certo é 32.

**O LIXO ENTROU NO LUGAR DOS ITENS DA OUTRA METADE.** Ver §8: a viagem deixou de
ter erro de cabeça e virou execução.

**A ESCOLHA DA VIAGEM GANHOU TELA PRÓPRIA.** Antes ela acontecia no meio do
quintal, com os dois painéis do mesmo tamanho de sempre e uma frase no topo —
não parecia uma decisão, parecia continuar mexendo. Agora o quintal escurece, os
dois painéis vêm para a frente e a pergunta aparece: `Qual você vai fazer
primeiro?`. É o mesmo estado de antes; o que mudou é que ele **parece** o que é.

**O PULSO AMARELO SAIU.** O objeto na mão e os dois painéis piscavam juntos, com
anel amarelo, ao mesmo tempo: era pedir para olhar para os dois lados. Ficou:
etiqueta dourada no objeto que está na mão, setinha estática em cima de cada
painel que aceita. Indicador, não pulso.

**A MOCHILA VIROU CAIXOTE E DEPOIS PAINEL, e o desenho saiu do código.** A
mochila era
`Graphics`: corpo, aba, duas alças, fivela, uma pilha de retângulo arredondado
que nunca ia parecer uma mochila — parecia uma maleta. O painel é o quadro 3 do
`chao.png`, que já estava na pasta sem uso. **Quando existe um objeto do jogo
que serve, ele é melhor que um desenho de interface fingindo ser objeto** — e de
quebra some uma textura da lista de pendências.

**Os objetos ganharam ETIQUETA com o nome.** Uma colher de pau e uma espátula
são, no traço, dois cabos com uma ponta chata: a criança não sabia se aquilo era
da massa ou da cobertura, e errava por não reconhecer o desenho. A etiqueta diz
o que o objeto é e, onde o desenho não basta, o que ele faz — `Colher de
misturar` contra `Espátula de espalhar`. **Nunca diz de que metade ele é**: essa
continua sendo a decisão da criança, e é a habilidade.

**As etiquetas desceram para a beirada da mesa.** Em cima do tampo, as oito
juntas viravam uma barra branca atravessando a tela: a mesa sumia atrás delas e
aquilo parecia menu, não etiqueta.

**O "painel selecionado" invisível saiu.** A criança tocava num objeto e ele
voava para um painel que ela não tinha escolhido — a decisão que É a habilidade
acontecia sozinha. Agora são dois toques: o objeto, e depois o painel.

**A primeira vaga do mapa nascia em cima do herói.** Ela ficava a 40 px do ponto
de partida e o item entrava no painel no primeiro quadro do jogo, sem a criança
tocar em nada. Toda vaga agora fica depois da primeira pedra.

**Uma plataforma terminava exatamente na beirada de um buraco.** Sair andando
dela era cair. Plataforma é prêmio para quem sobe, não armadilha para quem não
olhou: nenhuma delas acaba sobre um vão.

**O fundo do mundo não pode ser `TileSprite`.** O `fundo-nN.png` tem 768 px de
altura — não é potência de dois, o WebGL não repete a textura e sobra uma risca
de um pixel atravessando o céu. Pior: a arte entregue **não emenda consigo
mesma**, e a cópia repetida cortava a árvore ao meio. A saída foi aritmética —
o fundo tem 1920 px na tela, a tela mostra 1280, e o parallax é calculado para
gastar essa folga exatamente ao longo do mapa (0,30 em vez de 0,35). Uma cópia
só, emenda nenhuma.

**A sombra do objeto sumia dentro do brilho da mesa.** Ela caía em cima da faixa
clara do tampo e virava um buraco no verniz. Desceu 8 px, para debaixo dela.

**A fase final deixou de custar vida.** Ver a explicação em §8.

**A arte veio em outra grade, e o layout foi ancorado na medida real.** O herói
saiu em 1500 x 900 (quadro de 300 x 450, pés em 91,2% da altura do quadro) e o
`chao.png` em 1200 x 300 com QUATRO quadros, não cinco: não veio a ponta direita
do chão. Ela é o quadro 1 espelhado (`setFlipX`), o que funciona porque a peça é
simétrica. Os números estão em `HERO_ART` e `PLATFORM_ART`, e saíram de uma
medição de caixa alfa, não de chute.

**O item da outra metade só nasce em vaga ALTA.** Na primeira versão ele podia
cair numa vaga de chão, e aí bastava ANDAR para pegá-lo: a trava punia quem não
fez escolha nenhuma. `looseSpots` aponta só para vagas em cima de plataforma —
quem sobe escolheu subir. É a regra que separa erro de cabeça de erro de dedo,
aplicada ao mapa.

**A meia fedida saiu de onde se pousa.** Ela estava em x 1180, que é exatamente
onde o pulo do primeiro buraco termina: passar o buraco custava um item. Foi
para 1950, em chão livre.

**O buraco caiu de 240 para 200 px.** O alcance do pulo é 300; 240 obrigava a
saltar quase na beirada. Com 200 sobra um terço.

**O herói começa em x = 480, não em 140.** Com a câmera grudada em zero no
início do mapa, ele nascia em cima do botão ESQUERDA. Os 480 primeiros pixels do
mapa viraram cenário.

**As vidas não aparecem, e isso é do projeto.** `shared/hud/createLives` tem
`VIDAS_VISIVEIS = false` para os 49 jogos: o componente conta, perde e emite
`GAME_OVER` igual, só não desenha. Não procure o bug.

**A tela do plano já foi reprovada uma vez.** A primeira versão era uma página
bege com um quadro escuro no topo (a cena da missão velada, com um `?`), uma
prateleira de círculos vazios e dois retângulos laranja: elementos soltos, sem
lugar e sem introdução. O que ficou: o **quintal** como palco, uma **mesa** com
os objetos, as painéis no gramado, o **herói presente**, o **cartão da tarefa**
na abertura e a **instrução viva** no topo.

**O quadro velado com `?` saiu, e com ele as seis `cena-*.png`.** Ele existia
para esconder o resultado; escondendo, não dizia nada. O prêmio agora é a
**fase final**: a criança vê a tarefa acontecer, passo a passo, com o que ela
mesma foi buscar.

**A FOLHA DE RESULTADO CHEGOU FORA DA GRADE, E O CARREGADOR CEDEU.** O
`final-n2.png` veio em 1774 x 887 — quadro de 443,5 — e um `spritesheet` de
quadro fixo escorregava um pouco a cada coluna. As folhas `final-*` passaram a
entrar como IMAGEM e a ser cortadas em `create`, pela medida real do arquivo,
com 1 px de margem por quadro: sem essa margem, o 443,5 deixava uma fatia do
vizinho aparecendo na borda direita do resultado. Pedir a folha de novo teria
custado um dia; ler o arquivo custou vinte linhas.

**METADE DAS TAREFAS DEIXOU DE TERMINAR NA BANCADA.** Buscar quatro objetos e
ver a tarefa acontecer numa tela à parte é uma coisa; carregar a chaleira até o
fogareiro é outra. Nas tarefas com ESTAÇÃO a receita acontece no mapa: cada PAR
de objetos é usado no ponto onde ele serve, e a estação mostra escurecida a arte
do que vai virar — a mesma arte da fase final. Foi o que permitiu três mecânicas
novas sem uma folha nova sequer, e é por isso que essas tarefas não têm fase
final: seria contar a mesma história duas vezes.

**A SILHUETA É A MECÂNICA.** Sem ela a estação seria um ponto invisível do mapa
e carregar quatro objetos por 4.500 px viraria adivinhação. Escurecida, ela diz
"aqui vai a chaleira no fogo" ANTES de a chaleira chegar — e acender é a
recompensa.

**O CADEADO DO NÍVEL 3 EXISTIA NOS DADOS E NÃO NA TELA.** `runLocked` estava
escrito em `rules.ts` desde o começo e ninguém o chamava: escolher a metade
trancada simplesmente começava a viagem. Agora a escolha é recusada, sem custar
vida, com o topo dizendo qual metade vem antes — porque a ordem é o que o nível
veio ensinar, e o erro ali é a pergunta certa feita cedo demais.

**SEIS TAREFAS RODAVAM EM DOIS MAPAS.** O nível 3 corria exatamente o mapa do
nível 2, e o sanduíche corria o do bolo: mudavam os itens e a arte do fim, mas o
chão embaixo dos pés era o mesmo. Agora cada tarefa tem o seu, e eles crescem —
5.400, 6.480, 6.840 — mas o que separa um do outro é o RITMO, não o comprimento:
onde entra o vão, onde entra a escada, quantas pedras seguidas.

**AS REGRAS DO MAPA VIRARAM UM TESTE, E NÃO UM PARÁGRAFO.** Escrever "o lixo não
fica em zona de pouso" no documento não impede o lixo de acabar lá. As seis
regras foram passadas por um verificador que lê o `LEVELS` e reclama por
coordenada — e ele pegou três erros nos mapas novos que o olho não pegou: dois
lixos a 180 px da beirada de uma plataforma e um ponto de volta caindo dentro de
um buraco.

**A CORTINA NUNCA FECHOU DE VERDADE.** As duas folhas eram desenhadas do mesmo
jeito — um retângulo de meia tela ACIMA do próprio ponto — e só a conta de
posição tentava separá-las. Fechada, a de baixo caía exatamente em cima da de
cima: as duas empilhadas na metade de cima da tela, e a metade de baixo do jogo
continuando à vista, com a troca de cenário acontecendo na frente da criança.
Agora cada folha cresce a partir da beirada que encosta no meio — a de cima para
cima, a de baixo para baixo — e as duas se encontram no centro com a mesma
conta.

**E um `await` cancelado travava a cena.** Fechar enquanto uma abertura ainda
corria deixava duas contas brigando pela posição das folhas, e matar um tween no
meio deixava o `await curtain.close()` pendurado para sempre, esperando um
`onComplete` que não vinha mais. O movimento agora é um só de cada vez, e quem
mata o anterior RESOLVE a promessa dele antes de começar o seu.

## A meia não mata, e cada grupo só leva o que é dele (23/09/2026)

### A meia fede

Encostar na meia custava uma vida, derrubava tudo o que a criança carregava e a
mandava de volta ao último ponto. Agora (`onSock`):

- **não tira vida, não derruba nada, não volta**;
- o herói fica **lento por 3 s** (`STINK`), com o desenho **alternando o tempo
  todo com o quadro "eca"** (quadro 8 da `heroi.png`, tapando o nariz) e
  ondinhas verdes subindo da cabeça; o topo diz "Eca, meia fedida! Você ficou
  lento." e volta à instrução quando o fedor passa;
- pisar de novo enquanto fede só renova o fedor.

**A lentidão vale só no chão.** O pulo cobre 300 px e os buracos têm 180; lento
no ar ele cobriria 160 e cairia. No sanduíche e na fogueira a meia fica a
360–540 px de um buraco.

A **barata** e o **peixe** continuam custando uma vida (o peixe nem aparece:
cada mapa tem dois lixos, e eles são sempre a meia e a barata).

### Só o que pertence ao grupo

O painel diz o nome do grupo, e o que está dentro dele passa a ser lido como
PARTE daquilo. Com "Cobertura" e uma vela dentro, a criança podia achar que a
vela ia misturada na calda; com "Massa do bolo", que a colher era ingrediente.

- **Bolo:** saíram a tigela, a colher de pau, a espátula e a velinha, **sem
  nada no lugar** (decisão do usuário). Massa: farinha e ovo. Cobertura: calda e
  confeitos. Cada painel tem agora **dois lugares** — o número vem da tarefa
  (`tripSlots`), não mais de uma constante de 4. Na fase final a massa vai ao
  forno sozinha no segundo ingrediente. Os quadros 0, 3, 6 e 7 de
  `itens-n1-a.png` ficaram sem uso; a velinha segue no desenho do bolo pronto.
- **Nas outras tarefas o grupo passou a dizer a AÇÃO**, e a ferramenta passa a
  pertencer a ela: "O pão" → **Preparar o pão** (faca e tábua), "A fogueira" →
  **Acender a fogueira** (fósforos), "O lanche" → **Fazer o lanche** (espeto),
  "Fazer a cama" → **Hora de dormir** (lanterna).
