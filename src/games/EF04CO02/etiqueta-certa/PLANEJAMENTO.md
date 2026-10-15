# Etiqueta Certa — planejamento

Jogo **114** · EF04CO02 · 4º ano · Pensamento Computacional · 3ª rodada.
Documento irmão: [TEXTURAS.md](./TEXTURAS.md). Ficha: `docs/rodada-3/EF04CO02.md` (balcão dos Correios).

**Mudanças pedidas pelo usuário:**
- 09/10/2026: esteira de fábrica;
- 13/10/2026: **pátio de trens com alavancas**. Cada trem leva uma etiqueta, e a criança vira a alavanca da chave para mandá-lo ao galpão certo (o histórico está no fim).

**Réguas, nesta ordem:**
1. **O mais fácil possível, com o objetivo claro.**
2. **A resposta sai do NOME do campo, nunca da posição, da cor ou do tipo do valor.**
3. **Mostrar antes de pedir:** demonstração animada, com balões de 2–5 palavras.
4. **Um nível, um assunto.** O trilho fica mais comprido e ganha chaves, mas a dificuldade de cada nível vem da etiqueta.

**Regras fixas da rodada:**
- **1 erro encerra** (`WRONG_ANSWER` + `lose()`, com a cena do erro antes);
- `createTutorial` com balões curtos e recorte, sem mãozinha;
- sem quadro de resumo no fim;
- "faça o jogo" = **só o N1**.

---

## 1. O jogo em uma frase

Num **pátio de cargas**, os trens chegam um de cada vez e param no sinal vermelho. Cada trem leva no vagão um caixote com uma **etiqueta de campos com nome**: NOME, PARA, DE (e PESO). A placa diz *"Separe pelo PARA"*. A criança lê o campo **PARA**, vira a **alavanca** da chave para o trilho que leva ao galpão daquela cidade e aperta **PARTIR**. O trem segue o trilho e entra no galpão.

## 2. A habilidade

> **(EF04CO02)** Reconhecer objetos do mundo real e/ou digital que podem ser representados através de registros que estabelecem uma organização na qual cada componente é identificado por um nome, fazendo manipulações sobre estas representações.

| O que a BNCC pede | Onde acontece |
|---|---|
| **objeto do mundo real representado por registro** | a etiqueta da carga. Toda etiqueta tem os mesmos campos, com valores diferentes |
| **cada componente identificado por um nome** (N1) | a placa manda separar por um campo, pelo **nome**. A ordem dos campos muda de um trem para outro, e a etiqueta tem **duas cidades** (PARA e DE). Só quem lê o nome do campo acerta |
| **o nome decide qual informação vale** (N2) | a placa vira de PARA para **DE** (trem de devolução). A resposta muda porque mudou o nome do campo pedido |
| **manipulações sobre os registros** (N3) | uma **estação de carimbo** no caminho troca o valor de um campo. A criança carimba o campo pelo nome e só depois arma as chaves |

O exemplo da BNCC, *"separar os documentos cujas pessoas tenham nascido em uma determinada cidade"*, é o que o pátio faz, com etiquetas no lugar dos documentos.

**O teste da bolinha:**
- com uma cidade só na etiqueta, bastaria casar a palavra com a placa do galpão, sem ler o campo;
- com o PARA sempre na mesma linha, bastaria olhar a posição;
- por isso **toda etiqueta tem PARA e DE, as duas são cidades de galpões da fase, e a ordem dos campos muda**.

**Os irmãos (mesma habilidade):**

| Jogo | O que a criança faz |
|---|---|
| *Arquivo dos Registros* (024) | lê fichas paradas e toca nas que respondem a uma pergunta |
| *O Cofre dos Registros* (069) | põe cada valor no campo com o nome certo |
| **Etiqueta Certa** (este) | **despacha trens** pelo campo que a placa manda, troca de campo quando a placa vira e carimba etiquetas |

**Cuidado com o *Trem Peça & Programa* (EF02CO04).** Ele já tem trens de passageiros, uma cidade e o botão PARTIR, e a criança arrasta trilhos para montar a rede. Este jogo se separa dele em três pontos:
- é um **pátio de cargas**, com locomotiva, vagão-plataforma e galpões, sem passageiros e sem cidade;
- **os trilhos já estão prontos**, e a criança só vira alavancas;
- a pergunta mora na **etiqueta**.

## 3. O que mudou, e por quê

| Antes | Agora | Motivo |
|---|---|---|
| ficha: balcão, preencher o campo destacado | etiqueta pronta, decidir pelo campo pedido | preencher é o que o Cofre 069 já faz |
| esteira de fábrica: tocar no caminhão | **trem que para no sinal + alavanca da chave + PARTIR** | pedido do usuário (13/10/2026). Virar a alavanca e ver o trem seguir o trilho é uma ação de verdade, e o erro aparece sozinho: o trem entra no galpão errado |
| controle de parar e vir | **o trem para sozinho no sinal** e só sai no PARTIR | com o trem andando, quem leu certo poderia perder por virar a alavanca tarde. Seria erro de tempo, não de leitura (*errar a mira nunca conta*) |
| mapa que se arrasta já no N1 | **N1 numa tela só**; o mapa largo, com arrastar, entra no N2 | se o galpão estiver fora da tela, a criança vira a alavanca sem ver aonde o trilho leva |
| trilhos cada vez mais aninhados | **no máximo 3 alavancas e 4 galpões**; a dificuldade de cada nível vem da etiqueta | seguir um labirinto de trilhos é outra habilidade. Um nível, um assunto |

## 4. O laço

```
a placa diz "Separe pelo [PARA]"               (N2: pode virar para [DE])
um trem entra pela esquerda e para no sinal vermelho ("piuí")
a etiqueta do caixote salta grande para o quadro: NOME · PARA · DE (· PESO), numa ordem nova
        │
        ▼
a criança lê o campo pedido, vira a alavanca (o trilho escolhido acende até o galpão)
e aperta PARTIR (o sinal fica verde)
        │
        ▼
o trem segue o trilho e para na porta do galpão
  ┌──────────────────────────────┬──────────────────────────────────────────────┐
galpão certo                       galpão errado
estrelinha, o trem entra           o galpão treme, o trem fica na porta; no quadro, o campo
no galpão; CORRECT_ANSWER          pedido acende e o DE treme; uma linha vai do valor até o
                                   galpão certo
                                   "Esse é o DE: de onde veio. Quem manda é o PARA."
                                   WRONG_ANSWER + lose()
        │
        ▼
3 trens → as portas fecham, as plaquinhas viram para as cidades novas → próxima fase
3 fases → confete → showLevelComplete
```

- **O trem espera.** Não há relógio. A alavanca pode ser virada quantas vezes a criança quiser; só o PARTIR conta como resposta.
- **A alavanca fica onde o último trem a deixou.** Às vezes ela já está certa, e então basta apertar PARTIR. Por isso a criança precisa conferir o trilho em todo trem, em vez de virar sempre.

## 5. Fácil e claro

- **Um trem por vez.** O próximo só entra quando o anterior está no galpão.
- **O trilho escolhido acende** do sinal até a porta do galpão. A criança vê aonde o trem vai antes de apertar. Isso é o estado da alavanca, não uma pista: as duas rotas acendem do mesmo jeito.
- **A placa da regra fica sempre acesa no alto**, com o nome do campo numa pílula igual às da etiqueta.
- **2 alvos no N1:** a alavanca e o PARTIR. A etiqueta e os galpões não aceitam toque.
- **As pílulas de nome de campo são todas iguais**: mesma cor, sem ícone.
- **A cor da locomotiva não tem relação com a cidade.** Os galpões são iguais, e só a plaquinha muda.

## 6. A tela do N1 (1280 × 720, uma tela só)

Vista de cima (top-down). O trilho principal entra pela esquerda e se divide na chave. O ramo de baixo segue reto, e o de cima sobe numa curva. Cada ramo termina num galpão, na direita.

| Região | Caixa / centro | O quê |
|---|---|---|
| HUD | bolinhas em (194, 44), `?` em (1220, 56) | bolinhas = as 3 fases |
| **placa da regra** | (640, 54), 470 × 84 | *"Separe pelo"* + pílula **PARA** |
| **quadro da etiqueta** | centro (300, 268), 470 × 314 | a etiqueta do trem parado: pílula à esquerda, valor à direita |
| **trilho principal** | y 570, de x −520 até a chave em x 700 | o trem para com a frente em x 640 |
| **sinal** | (668, 492) | vermelho enquanto espera, verde no PARTIR |
| **alavanca** | base em (760, 695), embaixo do trilho, junto da chave | o cabo inclina para um lado ou para o outro; área de toque ≈ 150 × 170 |
| **PARTIR** | (430, 676), 220 × 72 | botão verde grande |
| **ramo de cima** | curva de (700, 570) até (1020, 280), depois reto | galpão de cima em (1150, 280) |
| **ramo de baixo** | reto em y 570 | galpão de baixo em (1150, 570) |
| **faixa do erro** e balões da alavanca | centro (320, 480), 620 de largura | na faixa livre entre a etiqueta e o trilho: não cobre o trem nem os galpões |
| **galpões** | ≈ 240 × 240, com a plaquinha da cidade em cima | o trem entra pela porta da esquerda e some debaixo do telhado |

**PC:** o mouse basta. As teclas W/S (setas ↑/↓) viram a alavanca para cima e para baixo, e Enter/Espaço apertam o PARTIR. Nada de etiqueta de tecla na tela.

## 7. A etiqueta

| Campo | Valor | Por que está ali |
|---|---|---|
| **NOME** | Luna, Davi, Bia, Nina, Caio… | quem recebe a carga. No N3, é por ele que se acha o caixote do recado |
| **PARA** | uma cidade dos galpões da fase | para onde vai: o campo que manda no N1 e no N3 |
| **DE** | outra cidade dos galpões da fase | de onde veio: a **isca** do N1, e o campo que manda no N2 |
| **PESO** | 2 kg, 5 kg… | só no N2 e no N3 |

- **PARA ≠ DE sempre**, e as duas são cidades de galpões da fase. No N1, com 2 galpões, o DE é sempre a cidade do outro galpão: ler o campo errado leva sempre ao galpão errado.
- **A ordem dos campos vem do `levels.ts`** e muda de um trem para o seguinte.

## 8. Tutorial do N1 (uma vez)

1. [Ver] O 1º trem chega e para no sinal. A etiqueta salta do caixote para o quadro. Balão: *"Cada trem tem etiqueta."*
2. As pílulas NOME, PARA e DE acendem uma por uma. Balão: *"Cada informação tem um nome."* (em minúsculas: NOME em maiúsculas é sempre o campo)
3. Uma linha de pontinhos vai da pílula **PARA** da placa até a pílula **PARA** da etiqueta, e outra vai do valor *Natal* até a plaquinha do galpão de Natal. Balão: *"PARA: Natal!"*
4. A alavanca vira sozinha, e o trilho até Natal acende. Balão: *"Vire a alavanca."*
5. O botão PARTIR afunda e o sinal fica verde. O trem vai até Natal e entra. Balão (antes): *"Aperte PARTIR!"*
6. O 2º trem chega, com o PARA em outra linha. A linha da placa procura e acha o PARA no lugar novo, e o DE treme. Balão: *"Mudou de lugar. Leia o nome!"* O jogo vira a alavanca e manda o trem.
7. No 3º trem (o 1º da criança), aparece *"Sua vez!"* e só a linha da placa até o PARA da etiqueta. A alavanca e o PARTIR são da criança.

O `?` mostra a ajuda em três passos: a placa, a etiqueta (*"Ache o PARA na etiqueta."*, com o campo da vez), e a alavanca com o PARTIR.

**NOME é um campo.** Em todo texto, NOME em maiúsculas quer dizer o campo NOME. O conceito ("cada informação tem um nome") vai em minúsculas, e a ajuda cita o campo da vez pelo nome dele, nunca *"ache esse NOME"*.

## 9. Níveis (`data/levels.ts`)

```ts
type Train = { name: string; to: City; from: City; weight?: number; order: Field[]; crate: number; color: number }
type Phase = { stations: City[]; start: number[]; rule: Rule; flipAt?: number; note?: Note; trains: Train[] }
// stations: a cidade de cada galpão (ordem de MAPS[n].sheds); start: a posição de cada alavanca no começo da fase
```

| Nível | Assunto | Mapa | Fases |
|---|---|---|---|
| **1, achar o campo pelo nome** | separar pelo PARA, com o DE de isca | 1 tela, 1 alavanca, 2 galpões | 3 fases × 3 trens; cidades novas a cada fase (Natal/Recife · Belém/Manaus · Salvador/Maceió) |
| **2, o campo que manda muda** | a placa vira para o DE (devolução) | mapa largo (2 telas, chão repetido), que se arrasta, e a câmera segue o trem; 2 alavancas, 3 galpões; + PESO; 4 trens por fase | fase 1 pelo PARA · fase 2 pelo DE · fase 3 vira do PARA para o DE no 3º trem (§14) |
| **3, mudar o valor de um campo** | carimbar a etiqueta antes de armar as chaves | mapa largo (2,5 telas), 3 alavancas, 4 galpões, posto do carimbo perto do sinal | 1 recado por fase: muda o PARA, depois o DE (com a placa no DE), depois o DE com a placa no PARA (§14) |

**`validateLevels` (N1):**
- 3 fases × 3 trens; NOME único no nível;
- PARA ≠ DE, e as duas estão entre as cidades dos galpões da fase;
- todo galpão recebe pelo menos 1 trem por fase; nenhum recebe 3 seguidos;
- a ordem dos campos nunca se repete em dois trens seguidos, e em cada fase o campo que manda aparece em pelo menos 2 linhas diferentes;
- o 1º trem de cada fase pede virar a alavanca (a fase começa com ela no ramo errado), e o nível tem pelo menos 1 trem em que ela já está certa.

## 10. Erros (a cena antes do `lose()`)

| Erro | O que se vê | Faixa grande |
|---|---|---|
| galpão do DE (o clássico) | o trem para na porta e o galpão treme. No quadro, a pílula **DE** treme e a **PARA** acende; uma linha vai da placa ao PARA e do valor até o galpão certo | *"Esse é o DE: de onde veio. Quem manda é o PARA."* |
| (N2) galpão errado no modo DE | o mesmo, com a pílula **DE** acesa | *"É devolução! Quem manda é o DE."* |

Virar a alavanca não é resposta, quantas vezes for. Os erros fazem um "blom" fofo, nunca um som áspero.

## 11. O fim de cada fase e de cada nível

- **Fim de fase:** as portas dos galpões descem, as plaquinhas giram para as cidades novas e as portas sobem. A alavanca volta para o ramo de início da fase, e uma bolinha do HUD acende.
- **Fim de nível:** o último trem apita, depois vêm o confete e o `showLevelComplete`.

## 12. Arquivos

**Código** (`src/games/EF04CO02/etiqueta-certa/`):
- `types.ts`, `index.ts`;
- `data/{levels,words,layout,theme,files}.ts`;
- `scenes/` com BootScene e GameScene, mais:
  - `rails` (trilhos assados numa RenderTexture e as rotas com `at(s)`);
  - `train` (locomotiva, vagão e caixote seguindo a rota);
  - `lever`, `go` (PARTIR + sinal), `sheds`;
  - `board`, `sign`, `link` e `banner`;
  - `hud`, `guide`, `audio`, `art` e `fallback`.

**Os trilhos são assados uma vez** (leito de brita + dormentes da folha + dois trilhos) numa RenderTexture: nada de `Graphics` redesenhado a cada quadro. O acendimento de cada rota é outra textura assada, que só muda de alfa. O desenho do trilho que entra num galpão acaba no meio dele, debaixo do telhado; a rota do trem continua além.

**O cenário fica atrás, as peças na frente** (13/10/2026: *"todo cenário parece ser destacado"*):
- um **véu** cor de areia (`C.wash`, 55 %) cobre o chão: cerca, flores e pedras perdem contraste e o pátio continua claro;
- o trilho ganha um **leito de brita** cinza-quente (`C.ballast`), e a rede se lê como caminho;
- trem, galpões, plaquinhas, sinal, alavanca, posto, placa, etiqueta, recado e botões têm **sombra parada** no chão (`shadowOf`, `SHADOW`);
- os controles principais (alavanca, PARTIR, CARIMBAR) têm **contorno branco parado** (`fitRimmed`, `RIM`), assado uma vez numa textura. Contorno parado pode; pulsar, não.

**Texturas** (prompts no [TEXTURAS.md](./TEXTURAS.md), sempre com a `references/35-chibi-voador.webp` anexada):

| Arquivo | Grade | Conteúdo |
|---|---|---|
| `bg-patio.png` | 1672 × 941 | o pátio de cargas visto de cima, chão livre (o código desenha os trilhos) |
| `trilhos.png` | 4 × 2 | dormente, base da alavanca, cabo, sinal vermelho, sinal verde, botão, estrela, fumaça |
| `trens.png` | 4 × 2 | 3 locomotivas (coral, céu, menta), vagão-plataforma, 4 caixotes |
| `galpoes.png` | 2 × 1 | galpão de porta aberta, galpão de porta fechada |
| `ui.png` | 2 × 2 | etiqueta grande, placa da regra, recado, plaquinha |
| `cover-etiqueta-certa.png` | 1672 × 941 | capa **com o título** |

**Registro:** id 114, slug `etiqueta-certa`, ordem 246 (já cadastrado; o texto foi atualizado para trens).

## 13. Travas para quem mexer depois

- **Toda etiqueta tem PARA e DE**, as duas são cidades de galpões da fase, e a ordem dos campos muda.
- **As pílulas de nome são todas iguais**, os galpões são iguais, e a cor da locomotiva não tem relação com a cidade.
- **O trem para sozinho e espera.** Nada acontece por relógio, e só o PARTIR é resposta.
- **O trilho aceso mostra a rota da alavanca**, as duas rotas do mesmo jeito. Nunca acender a rota *certa*.
- **No máximo 3 alavancas e 4 galpões.** A dificuldade vem da etiqueta, não do labirinto.

## 14. N2 e N3: o pátio largo (13/10/2026)

Pedido do usuário: *"n2 deve ter mapa grande horizontal repetitivo, com mais trilhos interconectados. faça n2 e n3"*.

### O pátio largo

- **O mundo é mais largo que a tela:** 2 telas no N2 (2560) e 2,5 no N3 (3200).
- **O chão é a `bg-patio` repetida**, espelhada uma sim, outra não, para as emendas casarem: o pátio "repete" de verdade.
- **Três pistas** (y 330, 450 e 570). O trem entra pela de baixo e para no sinal, e as chaves desviam para as outras pistas. Cada chave tem uma alavanca ao lado.
- **Arrastar:** o dedo (ou o mouse) leva o mapa para o lado. Um toque que virou arrasto nunca vira alavanca. No PC também funcionam A/D (←/→) para andar e W/S para a alavanca mais perto do meio da tela.
- **A câmera segue o trem** no PARTIR. No começo de cada fase ela vai até os galpões, mostra as plaquinhas virando e volta para o sinal.
- **O trilho aceso continua sendo o estado das alavancas:** do sinal até o galpão aonde elas levam, em todas as rotas do mesmo jeito.
- **A etiqueta vira uma faixa comprida no alto, fixa na tela**, com os 4 campos lado a lado (NOME, PARA, DE, PESO) numa ordem que muda. O mapa fica com a tela toda embaixo.
- **Fixos na tela:** HUD, placa, faixa, PARTIR (e CARIMBAR no N3) e a faixa do erro. **Andam com o mapa:** trilhos, alavancas, sinal, galpões e o posto do carimbo.
- **Arrastando, a UI sai da frente** (pedido do usuário, 14/10/2026): enquanto o dedo arrasta (ou A/D anda), o HUD, a placa, a faixa, a linha de pontinhos, o PARTIR e o CARIMBAR somem e param de pegar toque. Voltam 200 ms depois de o pátio parar, embalo incluído. O recado do N3 fica, porque é do mundo. Um toque que não virou arrasto não esconde nada.

| | N2 | N3 |
|---|---|---|
| largura | 2560 | 3200 |
| alavancas | 2 (a 2ª está na pista de cima) | 3 (a 2ª na pista do meio, a 3ª na de baixo) |
| galpões | 3: fim da pista de cima, meio do mapa na pista do meio, fim da de baixo | 4: dois na pista do meio, em lugares diferentes, e um no fim de cada outra pista |
| trens por fase | 4 | 4 |
| campos | NOME, PARA, DE, PESO | NOME, PARA, DE, PESO |

As coordenadas estão em `data/maps.ts`. Um trilho termina numa chave (com dois trilhos de saída, o de cima primeiro) ou num galpão. `follow(map, alavancas)` diz o galpão e o caminho.

### N2: quem manda muda

| Fase | Placa | Cidades |
|---|---|---|
| 1 | PARA | Palmas, Cuiabá, Vitória |
| 2 | **DE** (devolução) | Aracaju, Macapá, Goiânia |
| 3 | PARA, e **vira para DE no 3º trem** (`flipAt: 2`) | Natal, Recife, Belém |

- **Quando a placa vira:** ela balança, a pílula gira e o trem apita antes de entrar.
- **Na fase 3 a placa vira sem balão.** Perceber a troca é a habilidade do nível.
- **No erro de devolução** (mandou pelo PARA): *"Esse é o PARA. Na devolução, quem manda é o DE."*
- **Tutorial (uma vez):**
  1. *"O pátio é grande!"*: a câmera vai até a última alavanca, que vira e desvira, e o trilho aceso muda junto.
  2. *"Cada alavanca muda um trilho."*
  3. A câmera volta: *"Arraste para ver."*
  4. *"Sua vez!"*
  5. No começo da fase 2: *"Devolução! Agora manda o DE."*

### N3: carimbe o recado

- **O posto e o recado:** perto do sinal fica o posto do carimbo, com um recado preso. Exemplo: *Caio* · `PARA` → Recife.
- **De quem é o recado:** de **um** trem da fase, achado pelo NOME (nunca o 1º).
- **Como carimbar:**
  1. a criança aperta **CARIMBAR** (botão lilás, ao lado do PARTIR; tecla C), e os campos da faixa passam a aceitar toque;
  2. ela toca no campo que o recado manda mudar;
  3. a borracha desce, a tinta fica, e o valor novo entra.
- **Só depois do carimbo** ela arma as alavancas pela etiqueta nova.
- **Apertar CARIMBAR de novo cancela.** Escolher o campo é a resposta.

| Fase | Placa | Recado | O que testa |
|---|---|---|---|
| 1 | PARA | Caio: PARA → Recife | o carimbo muda o caminho |
| 2 | DE | Bia: DE → Vitória | o mesmo, no campo DE |
| 3 | PARA | Rafa: **DE** → Goiânia | carimbar o campo **pelo nome do recado**, mesmo que ele não mude o caminho |

**Erros do N3** (o trem nem sai do sinal):

| Erro | Faixa |
|---|---|
| PARTIR no trem do recado sem carimbo | *"Faltou carimbar o recado de Caio!"* |
| carimbou o trem errado | *"O recado é só de Caio."* |
| carimbou o campo errado | *"O recado muda o PARA."* |

**Tutorial (uma vez):**
1. A fase abre com o recado da Íris (PARA → Belém): *"Um recado!"*
2. Chega um trem de mostra que **não** é o dela (Noah). O NOME acende: *"Não é Íris."* O jogo manda o trem sem carimbo.
3. Chega a Íris. O NOME acende: *"Achou: Íris!"*
4. O CARIMBAR afunda e a borracha desce no PARA: *"Carimbe o campo do recado."*
5. O jogo vira as alavancas pelo valor novo e manda o trem.
6. Depois começa a fase de verdade, com o recado da fase: *"Sua vez!"*

O passo 2 existe porque o 1º trem de toda fase nunca é o do recado. Sem ele, a demonstração ensinava "trem chegou, carimba", e quem repetisse o que viu perdia no primeiro trem.

### `validateLevels` (N2/N3, além das regras do N1)

- uma cidade por galpão, sem repetir; uma posição por alavanca no `start`;
- 4 campos com PESO;
- o 1º trem da fase pede mudar as alavancas;
- a resposta é calculada **depois do recado** e da placa virada;
- o recado é de 1 trem só (não o 1º), muda de verdade o valor, não deixa PARA = DE e aponta para uma cidade dos galpões;
- todo galpão do mapa tem caminho;
- o "já está certo" só é exigido quando a fase tem mais trens que galpões.

## Histórico

- **09/10/2026** — plano a partir da ficha, com o estilo esteira de fábrica (a ficha repetia o Cofre 069). Os campos viraram NOME, PARA, DE e PESO, com duas cidades em toda etiqueta. O N1 foi feito com arte de reserva e aprovado pela Lupa.
- **13/10/2026** — **migrado para trens**, a pedido do usuário: trilhos, alavanca de chave, trem que vem um por um, mapa largo com arrastar, controle de parar e vir, N1 com 3 trens, N2 mais trens e caminho mais longo, N3 mais alavancas. Adaptações (o usuário disse *"faça como quiser, mas adapte bem a ideia"*):
  - o parar e vir virou trem que para sozinho no sinal + PARTIR;
  - o mapa largo começa no N2;
  - as alavancas ficam em no máximo 3, com a dificuldade dos níveis vindo da etiqueta;
  - pátio de cargas, para não repetir o Trem Peça & Programa.

  A arte da esteira nunca foi gerada, então nada se perdeu.
- **13/10/2026 (tarde)** — **N2 e N3** (§14). O pedido: *"n2 deve ter mapa grande horizontal repetitivo, com mais trilhos interconectados"*. Os trilhos viraram uma rede genérica (`data/maps.ts`), e o N1 é a mesma rede, com 1 chave. Saíram duas folhas novas, `etiqueta-longa` e `carimbo` (TEXTURAS §10). O recado do N3 mudou de PESO para "DE com a placa no PARA", porque mudar o PESO não mostrava consequência nenhuma.
- **13/10/2026 (revisão)** — os textos usavam "NOME" (o campo) também para "o nome do campo" (*"Ache esse NOME na etiqueta"*); agora o conceito vai em minúsculas e a ajuda cita o campo da vez. O tutorial do N3 ganhou o trem que não é do recado. O cenário recuou (véu, brita, sombras, contorno branco nos controles).
