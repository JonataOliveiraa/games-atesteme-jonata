# Manobrista da Matriz — planejamento

Jogo **113** (`NEXT_FREE_ID`) · EF04CO01 · 4º ano · Pensamento Computacional · 3ª rodada.
Documento irmão: [TEXTURAS.md](./TEXTURAS.md). Ficha: `docs/rodada-3/EF04CO01.md`, a mesma colada no chat em 08/10/2026, com a mudança pedida pelo usuário: **a criança dirige o carro**.

**Réguas, nesta ordem:**
1. **O mais fácil possível, com o objetivo claro.**
2. **Dirigir é o gesto; a coordenada é a decisão.** Só conta erro escolher a vaga, o tíquete ou o carro errado. Bater e manobrar mal nunca contam.
3. **Mostrar antes de pedir:** demonstração animada, com explicação curta.
4. **Um nível, um assunto.**

Regras fixas da rodada:
- **1 erro encerra** (`WRONG_ANSWER` + `lose()`, com a cena do erro antes);
- `createTutorial`, com balões curtos;
- sem quadro de resumo no fim;
- "faça o jogo" = **só o N1**.

---

## 1. O jogo em uma frase

O pátio do estacionamento é uma **matriz**: vagas em LINHAS e COLUNAS, com os números pintados no chão. O painel pede *"Estacione em L2, C3"*. A criança **dirige o carro**, girando o volante e apertando ACELERAR ou RÉ, até a vaga onde a linha 2 cruza a coluna 3, e toca em ESTACIONAR.

## 2. A habilidade

> **(EF04CO01)** Reconhecer objetos do mundo real e/ou digital que podem ser representados através de matrizes que estabelecem uma organização na qual cada componente está em uma posição definida por coordenadas, fazendo manipulações simples sobre estas representações.

| O que a BNCC pede | Onde acontece |
|---|---|
| **objeto do mundo real representado por matriz** | o estacionamento, que a criança conhece da rua e do mercado, organizado em fileiras e colunas de vagas |
| **cada componente numa posição definida por coordenadas** | toda vaga tem endereço: **L2, C3**. A convenção é fixa e aparece ao lado do pátio: *"primeiro a LINHA, depois a COLUNA"* |
| **localizar pela coordenada** (N1) | o pedido dá a coordenada, e a criança acha a vaga e leva o carro até lá |
| **ler a coordenada de um componente** (N2) | um cone marca uma vaga; a criança estaciona e escolhe o tíquete com a coordenada certa entre 3 (um troca L por C) |
| **manipulações simples** (N3) | *"Leve o carro de L1, C2 para L3, C4"*: a criança escolhe o carro pela coordenada e o muda de lugar na matriz. No fim, os carros formam um desenho visto de cima: a matriz vira imagem, como os pixels de uma tela |

**O teste da bolinha.** Se as vagas não tivessem números, ou se o pedido dissesse "a vaga azul", o jogo não teria solução pela habilidade. A resposta só sai de **cruzar a linha com a coluna**.

**Por que dirigir não estraga a habilidade:**
- não há relógio;
- bater faz "pof" e para, sem contar erro;
- **o carro se encaixa sozinho** quando para mais ou menos dentro de uma vaga;
- o botão ESTACIONAR só aparece com o carro parado dentro de uma vaga, e só ele confirma;
- parar perto e confirmar sem querer não acontece: confirmar é um toque separado.

**Os irmãos (mesma habilidade):**

| Jogo | O que a criança faz |
|---|---|
| *Batalha das Coordenadas* (023) | cava a coordenada no mapa do tesouro, cruza pistas e descarta baús |
| *Canhão das Coordenadas* (068) | toca a janela da coordenada, lê a posição de uma janela e move ou copia pinturas |
| **Manobrista da Matriz** (este) | **leva o carro dirigindo** até a coordenada, lê o tíquete da vaga e muda carros de lugar |

A ficha original (tocar a vaga, escolher a placa, trocar carros) repetia o Canhão nível por nível. Dirigir, ideia do usuário, é o que separa os dois: aqui a criança **percorre** a matriz, seguindo uma linha e depois uma coluna com o próprio carro.

## 3. O que mudou da ficha, e por quê

| Ficha | Aqui | Motivo |
|---|---|---|
| tocar a vaga e o carrinho estaciona sozinho | **a criança dirige**: volante giratório à esquerda, pedais ACELERAR e RÉ à direita, e ESTACIONAR para confirmar | pedido do usuário: *"a criança dirige o carro e precisa estacionar. ele pode dar ré, acelerar, rodar o volante"*. Além disso, é o que diferencia o jogo do Canhão 068 |
| TRAVA (cadeado, guias acendem, +5 após trava) | **1 erro encerra**, com a cena: o carro estacionado na vaga errada e as guias da linha e da coluna pedidas se cruzando na vaga certa | regra da rodada |
| grade 4×4, 5×5 e 6×6 | **3×3, 3×4 e 4×4** | entre as fileiras precisa haver corredor para o carro andar. Uma 6×6 com corredores não cabe em 1280 × 720 com o carro num tamanho que dê para dirigir no celular |
| segurar 0,3 s para ver a coordenada | sai; quem confirma é o ESTACIONAR | gesto extra. E mostrar a coordenada de onde o carro está viraria "dirigir até o balão bater com o pedido", sem cruzar linha e coluna |
| 10–12 pedidos por rodada | **4 por nível** | dirigir leva mais tempo que tocar; 4 viagens já cansam o bastante |
| N2 alterna direto e inverso (6+6) | N2 é **só ler** (cone → tíquete) | um nível, um assunto |
| N3: trocar, esvaziar linha, encher coluna | N3: **mover** um carro de uma coordenada para outra, 4 vezes, e os carros formam o desenho | trocar dois carros e esvaziar uma linha pedem várias viagens por pedido. Mover é uma manipulação clara, uma viagem por pedido |
| desenho-surpresa (coração, estrela, seta, carinha) | **N3 termina no desenho**: as 4 mudanças completam uma SETA vista de cima | a matriz como imagem, sem quadro de resumo |
| telemetria (L↔C, grade) | `CORRECT_ANSWER` por pedido e `WRONG_ANSWER` no erro | a bridge não tem esses campos |

## 4. O laço

```
o painel acende: "Estacione em L2, C3"   (N2: um cone marca a vaga; N3: "Leve o carro de L1,C2 para L3,C4")
um carro entra pelo portão (N3: a criança toca no carro de L1,C2, que acende)
        │
        ▼
a criança dirige: gira o volante, aperta ACELERAR ou RÉ
  - bateu? "pof", o carro para, nada de erro
  - parou dentro de uma vaga? aparece o botão ESTACIONAR
        │
        ▼
toca ESTACIONAR: o carro se ajeita sozinho na vaga ("nhec")
  ┌─────────────────────────────┬─────────────────────────────────────────┐
vaga certa                     vaga errada
o motorista desce feliz;       o carro fica na vaga errada; as guias da LINHA 2 e da
estrelinha na vaga;            COLUNA 3 acendem e se cruzam na vaga certa, que pisca
CORRECT_ANSWER                 "Você parou em L3, C2. O pedido era L2, C3."
                               WRONG_ANSWER + lose()
        │
        ▼
4 pedidos → o pátio inteiro (N3: zoom no desenho dos carros) → showLevelComplete
```

**N2, depois do ESTACIONAR na vaga do cone:** sobem 3 tíquetes grandes (*L2, C3* · *L3, C2* · *L2, C4*). O certo leva ao acerto; o errado leva à cena do erro com *"Essa vaga é L2, C3. Primeiro a LINHA!"*.

**N3, a escolha do carro:** o pedido diz de onde sai o carro. A criança **toca no carro** da coordenada, que acende, dá ré sozinho para o corredor e passa a ser dirigido. Tocar no carro errado é erro (*"Esse carro está em L2, C1. O pedido era L1, C2."*). Tocar no chão não faz nada.

## 5. Fácil e claro

- **Um pedido por vez, sem relógio.** O painel com o pedido fica sempre aceso no alto.
- **A matriz é grande e numerada:** os números das LINHAS ficam pintados à esquerda de cada fileira e os das COLUNAS no alto de cada coluna, em placas grandes. A convenção não tem plaquinha na tela (o usuário mandou tirar em 09/10/2026): ela vem das placas L1–L3 e C1–C3 e do tutorial animado.
- **Controles grandes e fixos nos cantos:**
  - o volante à esquerda (Ø ≈ 200);
  - os pedais à direita, RÉ e ACELERAR, cada um com ≈ 110 × 150;
  - o ESTACIONAR no meio de baixo, só quando vale.

  São no máximo 4 alvos.
- **Dirigir perdoa:**
  - velocidade baixa e limitada;
  - o carro para ao soltar o pedal;
  - o volante volta ao centro devagar quando se solta o dedo;
  - bater só faz parar;
  - o encaixe na vaga é automático.
- **Dá para usar dois dedos ao mesmo tempo** (volante e pedal), mas também dá com um só: virar o volante, soltar e apertar o pedal, porque a direção fica onde estava até voltar ao centro.

## 6. A tela (1280 × 720)

| Região | Caixa / centro | O quê |
|---|---|---|
| HUD | (194, 44), `?` em (1220, 56) | bolinhas = os pedidos do nível |
| **painel** | (640, 48), 520 × 70 | *"Estacione em L2, C3"*, com L e C em cores fixas (L lilás, C menta) |
| **pátio** | x 250–1050, y 100–700 | asfalto com as vagas, os corredores e o anel de circulação à direita |
| números das linhas | x ≈ 265, um por fileira | placas lilás *1, 2, 3* |
| números das colunas | y ≈ 112, um por coluna | placas menta *1, 2, 3, 4* |
| **portão** | canto de baixo à direita (≈ 1000, 700) | por onde os carros entram |
| **volante** | (130, 600), Ø 200 | gira arrastando o dedo |
| **pedais** | RÉ (1100, 610) · ACELERAR (1210, 600) | seguram enquanto o dedo está em cima |
| **ESTACIONAR** | (640, 660), 260 × 80 | aparece com o carro parado dentro de uma vaga |

**A geometria do pátio** (`data/layout.ts`, ajustada à arte medida):
- **Cada fileira** é uma faixa de vagas (≈ 120 de largura × 110 de altura) com a frente aberta para o **corredor logo abaixo** (≈ 90 de altura).
- **Um corredor vertical à direita** liga todos os corredores ao portão.
- **O carro** tem ≈ 56 × 96, com o nariz para cima, e cabe com folga na vaga.
- **N1 (3×3):** 3 fileiras × (110 + 90) = 600 de altura, cabe em y 100–700.
- **N3 (4×4):** não cabe em 720. O mundo cresce e o container do pátio usa zoom de ≈ 0,85, a mesma técnica do Quem Bate à Porta. Os controles ficam fora do zoom.

**Câmera** (mudou em 09/10/2026, ver o Histórico): cada pedido abre no pátio inteiro; ao dirigir, a câmera chega a 1,5× e segue o carro. As placas de linha e coluna ficam grudadas na borda, como o cabeçalho de uma planilha, então a coordenada continua visível. No acerto, no erro e no fim de nível, a câmera volta ao pátio inteiro.

**Teclado (PC):** **W** ACELERAR, **S** RÉ, **A**/**D** volante, **ESPAÇO**/Enter ESTACIONAR. As setas também valem. No desktop, cada controle mostra a sua tecla, e os balões do tutorial e da ajuda citam as teclas. Com mouse, o volante fica onde foi largado, para dar tempo de ir ao pedal.

## 7. A direção (`scenes/car.ts`)

Física própria, simples, sem Matter:
- **Estado:** posição, rumo e velocidade.
- **ACELERAR / RÉ:** a velocidade vai até `±VMAX` (≈ 170 px/s para frente, 110 de ré) com aceleração suave (≈ 0,75 s até a máxima). **Ao soltar, o carro segue deslizando e perde velocidade aos poucos** (≈ 1,3 s e ≈ 110 px a partir da máxima). O pedal do outro sentido freia firme.
- **Volante:** o ângulo do volante (−135°…+135°) vira `steer` (−1…1). O carro gira com `ω = v · tan(steer · 35°) / entre-eixos`, então **só vira enquanto anda**, como um carro de verdade.
- **Colisão:**
  - o carro é 3 círculos ao longo do comprimento;
  - os obstáculos são retângulos: os carros parados, as muretas do pátio e as ilhas;
  - ao tocar um obstáculo, o passo é desfeito, a velocidade vai a 0 e soa um "pof" fofo;
  - **as linhas pintadas das vagas não colidem.**
- **Dentro da vaga:** com o centro do carro dentro do retângulo da vaga, o rumo a menos de 40° do eixo e a velocidade em 0, o ESTACIONAR sobe.
- **O encaixe:** ao tocar ESTACIONAR, o carro desliza ≈ 300 ms (ease in-out) até o centro da vaga, com o rumo certinho.

**O volante (`scenes/wheel.ts`):**
- o dedo arrasta em volta do centro e o volante gira junto, acompanhando a mudança de ângulo;
- o giro é limitado a ±135°;
- ao soltar, ele volta ao centro em ≈ 0,6 s;
- vale para mouse e toque (`activePointers: 3`).

**Verificar no celular (critério de aceite):**
- dá para ir do portão a qualquer vaga do N1 em menos de 30 s sem bater mais de 2 vezes;
- o ESTACIONAR aparece mesmo com o carro um pouco torto.

## 8. Tutorial (por nível, uma vez)

**N1:**
1. Balão: *"O estacionamento é uma matriz: LINHAS deitadas e COLUNAS em pé."* As faixas das linhas acendem uma por uma, e depois as das colunas.
2. Balão: *"Primeiro a LINHA, depois a COLUNA. L2, C3 é aqui!"* A linha 2 acende, a coluna 3 acende, e a vaga do cruzamento pisca.
3. **Demonstração dos controles, jogada pelo próprio jogo e com um balão curto em cada parte:**
   - *"Gire o volante para virar."* O volante gira sozinho, com a seta de pontinhos;
   - *"ACELERAR anda para frente. RÉ anda para trás."* O pedal afunda e o carro anda até a vaga L2, C3;
   - *"Parou na vaga? Toque em ESTACIONAR."* O botão é tocado e o carro se encaixa.
4. *"Sua vez!"* O 1º pedido repete L2, C3, com as guias da linha e da coluna acesas até o carro chegar, só nesse pedido.

**N2:**
1. *"Agora é o contrário: o cone mostra a vaga, e você descobre a coordenada."*
2. Demonstração: o carro vai até o cone e estaciona. Sobem 3 tíquetes, com estes balões:
   - *"Qual é a LINHA? Siga para a esquerda."* (o número da linha acende);
   - *"Qual é a COLUNA? Siga para cima."* (o número da coluna acende);
   - *"L3, C2!"* (o tíquete certo é tocado).

**N3:**
1. *"Agora você muda carros de lugar. Primeiro toque no carro da coordenada."*
2. Demonstração: o carro de L1, C2 é tocado e dá ré sozinho; o jogo o leva até L3, C4.
3. *"Quando todos estiverem no lugar, vai aparecer um desenho!"*

## 9. Pedidos e níveis (`data/levels.ts`)

`{ kind: 'park' | 'read' | 'move', to: [l, c], from?: [l, c], ticket?: [[l,c],[l,c],[l,c]], guided? }` + `parked: [l, c, cor][]` (os carros que já estão no pátio).

| Nível | Grade | Pedidos | Já estacionados |
|---|---|---|---|
| **1, localizar** | 3×3 | *park* L2,C3 *(guias)* · L1,C2 · L3,C2 · L1,C3 | nenhum no começo; cada carro estacionado fica, e o pátio vai enchendo |
| **2, ler** | 3×4 | *read* com cone em L3,C2 · L1,C4 · L2,C1 · L3,C4 | 4 carros espalhados (fazem o caminho dar voltas sem bloquear) |
| **3, manipular** | 4×4 | *move* L1,C1→L2,C3 · L4,C4→L1,C2 · L4,C1→L2,C2 · L1,C4→L1,C3 | 10 carros: 6 já no lugar da seta (L2,C1 · L2,C4 · L3,C2 · L3,C3 · L4,C2 · L4,C3) e 4 nos cantos. Depois das 4 mudanças eles formam uma **SETA** apontando para cima (ver abaixo) |

**A figura do N3** (`ARROW`, X = carro):

```
      C1 C2 C3 C4
L1    ·  X  X  ·
L2    X  X  X  X
L3    ·  X  X  ·
L4    ·  X  X  ·
```

**Os tíquetes do N2:** sempre 3. Um é o certo, um troca linha e coluna (**L↔C**), e o terceiro erra a coluna por 1. A ordem dos três é sorteada.

**`validateLevels`:**
- 4 pedidos por nível;
- toda coordenada cabe na grade do nível;
- a vaga do pedido está livre e tem caminho do portão até ela (busca em largura na grade de corredores);
- no N2, o tíquete L↔C é diferente do certo (nunca uma vaga com linha igual à coluna, como L2, C2);
- no N3, o `from` tem carro, o `to` está livre na hora do pedido, e o resultado final bate com a figura `ARROW` do `levels.ts`;
- no N1, nenhum pedido usa linha = coluna, para não esconder a confusão L↔C.

## 10. Erros (a cena antes do `lose()`)

| Erro | O que se vê | Faixa grande |
|---|---|---|
| estacionar na vaga errada (N1, N3) | o carro fica na vaga errada; acende a faixa lilás da LINHA pedida, depois a faixa menta da COLUNA pedida; a vaga do cruzamento pisca com um contorno amarelo | *"Você parou em L3, C2. O pedido era L2, C3."* |
| tíquete errado (N2) | o tíquete escolhido treme; as faixas da linha e da coluna da vaga do cone acendem até os números | *"Essa vaga é L3, C2. Primeiro a LINHA!"* |
| tocar no carro errado (N3) | o carro tocado buzina baixinho; as guias do `from` acendem | *"Esse carro está em L2, C1. O pedido era L1, C2."* |

Sem sons ásperos: uma buzininha fofa e um "blom". **Bater nunca é erro.**

## 11. O fim de cada nível

- **N1 e N2:** a câmera se afasta para o pátio inteiro. Cada carro estacionado dá um "bip-bip" com o farol piscando, um por vez. Depois vêm o confete e o `showLevelComplete`.
- **N3:** o mesmo, e em seguida um zoom-out mais alto ("vista do drone"). As vagas viram quadradinhos, e os carros, pixels coloridos: *"Os carros formaram uma SETA!"*. Depois o confete e o `showLevelComplete`.

Não há quadro de resumo.

## 12. Arquivos e registro

**Código** (`src/games/EF04CO01/manobrista-da-matriz/`), no esqueleto do Quem Bate à Porta:
- `types.ts`, `index.ts` (com `input.activePointers: 3`);
- `data/{levels,words,layout,theme,files}.ts`;
- `scenes/{BootScene,GameScene,yard,car,wheel,pedals,park,panel,tickets,hint,banner,hud,guide,audio,art,fallback}.ts`.

Reaproveita do Quem Bate à Porta: `hud`, `guide`, `hint`, `banner`, `audio`, `art` e o container com zoom (`hall` vira `yard`). O jogo roda antes da arte, com reserva em `Graphics` nas mesmas folhas.

**Texturas** (prompts completos no [TEXTURAS.md](./TEXTURAS.md), sem imagem de referência):

| Arquivo | Grade | Conteúdo |
|---|---|---|
| `bg-patio.png` | 1280 × 720 | o entorno (grama, calçada, árvores, portão) com o asfalto liso no meio; as vagas e os números são do código |
| `carros.png` | 3 × 2 | 6 carrinhos vistos de cima, nariz para cima, cores diferentes |
| `controles.png` | 3 × 2 | volante, pedal ACELERAR, pedal RÉ, botão ESTACIONAR, ACELERAR apertado, RÉ apertado |
| `pecas.png` | 4 × 2 | cone, tíquete em branco, "pof", estrela, buzininha, farol aceso, motorista feliz, seta de pista |
| `cover-manobrista-da-matriz.png` | 1672 × 941 | capa **com o título** |

**Registro (quando o N1 for feito):**
- id **113**, que leva o `NEXT_FREE_ID` para 114;
- slug `manobrista-da-matriz`, Pensamento Computacional, logo depois do Canhão 068 na ordem;
- `gameInstructions` e `GameDetailsPage`.

## 13. Travas para quem mexer depois

- **Dirigir nunca dá erro.** Só contam escolher a vaga (ESTACIONAR), o tíquete ou o carro.
- O ESTACIONAR só aparece com o carro parado dentro de uma vaga; o encaixe é automático.
- A câmera mostra o pátio inteiro enquanto se dirige: a matriz toda à vista.
- Os números das linhas e das colunas ficam sempre visíveis, com cores fixas (L lilás, C menta).
- Nunca mostrar a coordenada de onde o carro está antes do ESTACIONAR, porque isso entregaria a resposta.
- Toda vaga de pedido tem caminho livre desde o portão (`validateLevels`).

## 14. Dúvidas

1. **Linha de arte.** Proponho a **chibi voador**, a mesma do 3º ano, com carrinhos de brinquedo fofos vistos de cima. Se o 4º ano for ganhar uma linha própria, mudam só os blocos STYLE.
2. **Volante com um dedo só.** Quem tiver dificuldade com dois dedos ao mesmo tempo usa a regra do §5: o volante fica onde foi deixado até voltar ao centro. Se no teste do celular isso não bastar, a saída é o volante não voltar sozinho.

## Histórico

- **08/10/2026** — plano a partir da ficha, com a mudança do usuário: **a criança dirige**, com volante giratório à esquerda e dois pedais à direita (escolha dele entre três controles).
  - Motivo: a ficha repetia o Canhão 068.
  - A TRAVA virou 1 erro com a cena.
  - As grades viraram 3×3, 3×4 e 4×4, porque os corredores precisam de espaço.
  - A ficha tinha 10–12 pedidos por rodada; ficaram 4 por nível.
  - O N2 virou só ler.
  - O N3 virou mover, terminando na seta (num 4×4 não cabe um coração legível).
- **09/10/2026** — **N1 feito em `Graphics`** (*"faça o jogo, por hora use só Graphics. com apenas n1"*):
  - id 113 no catálogo (`NEXT_FREE_ID` → 114), ordem 236 (logo depois do Canhão), com `gameInstructions` e `GameDetailsPage`;
  - o 2º pedido virou **L1, C2**: o L1, C1 do §9 tinha linha igual à coluna, o que a própria validação proíbe;
  - **direção** (`scenes/car.ts`): o carro só vira andando, a colisão usa 3 círculos contra retângulos, e bater desfaz o passo e solta um "pof";
  - **controles** (`scenes/controls.ts`): o volante segue o dedo e volta ao centro em 0,6 s; cada pedal segue o próprio dedo; o ESTACIONAR (P em cima, palavra embaixo) fica à direita, acima dos pedais; teclado com setas e Espaço/Enter;
  - **tutorial:**
    - as linhas acendem uma por uma, depois as colunas, e depois o cruzamento L2, C3;
    - os balões dessa parte são estreitos e ficam à direita, para não cobrir a matriz;
    - o volante gira sozinho; o carro de demonstração dirige do portão até L2, C3, com o pedal afundado e o volante acompanhando a curva;
    - o ESTACIONAR é tocado e o motorista desce feliz;
  - **erro:** a faixa fica embaixo, porque no alto ficava atrás do HUD.

  Conferido no navegador:
  - o tutorial inteiro;
  - a física: acelerar, bater no muro sem erro e dar ré;
  - um piloto automático pelo volante e pelos pedais leva o carro até L2, C3, o ESTACIONAR aparece e o clique de verdade dá o acerto;
  - o erro clássico L2, C1 × L1, C2 (*"Você parou em L2, C1. O pedido era L1, C2."*), com a linha e a coluna pedidas acendendo;
  - o nível inteiro até "Nível 1 completo!".
- **09/10/2026** — **suporte ao PC** (*"deixe o suporte pra qm jogar no pc tbm"*, *"eu quero wasd"*):
  - teclas WASD, com as setas valendo também;
  - etiquetas de tecla no volante (A D), nos pedais (W, S) e no ESTACIONAR (ESPAÇO), só no desktop;
  - os balões do tutorial e da ajuda citam as teclas;
  - com o mouse, o volante não volta sozinho ao centro.

  Conferido no navegador: W, A e S movem o carro, e girar o volante arrastando com o mouse o deixa parado no lugar ao soltar.
- **09/10/2026** — **som de motor e direção mais natural** (*"adicionei 3 som de carro em loop"*, *"parou de acelerar mas ta rapido? ele continua andando desacelerando aos poucos"*):
  - **motor:** car1 (marcha lenta), car3 (devagar e ré) e car2 (acelerando) tocam juntos em loop, com o volume e o tom seguindo a velocidade. O motor liga quando o carro entra pelo portão e desliga ao estacionar. Saiu o "vrum" sintetizado;
  - **direção:** ao soltar o pedal, o carro desliza e desacelera aos poucos (`DRIVE.coast` = 130), em vez de parar quase na hora; a aceleração ficou mais suave (230) e o pedal contrário freia (650).

  Conferido no navegador: os 3 loops começam, o tom vai de 0,9× parado a 1,09× de ré na máxima e volta, e o carro solto a 170 px/s desliza 109 px em 1,3 s.
- **09/10/2026** — correção do usuário: *"car1, car2, car3 na vdd é pra variar o som dos carros. um carro usa só um carx.mp3"*. Antes as três tocavam juntas, misturadas pela velocidade. Agora cada carro usa uma, em rodízio por pedido, e o tom e o volume seguem a velocidade. Conferido: cada carro novo abre um só loop, com outra gravação.
- **09/10/2026** — **texturas entregues** (menos a capa) e **enquadramento refeito pela arte** (*"implemente-as e ajuste o enquadramento. remova aqueles icone W A S D"*):
  - o asfalto medido vai de x 200 a 1081 e de y 103 a 651. A grade virou vagas de 130 × 96 com corredor de 82 e foi centralizada (x 395); o carro tem 84 de comprimento;
  - o volante e a plaquinha da convenção ficam na grama à esquerda; o ESTACIONAR e os pedais, na grama à direita; o painel ficou um pouco menor;
  - **saíram as etiquetas de tecla** (W, A, S, D, ESPAÇO). O teclado continua funcionando, e os balões do tutorial ainda citam as teclas;
  - o farol da arte aponta para a direita, e o código gira −90°.

  Conferido no navegador: o enquadramento, a demonstração chegando em L2, C3 e o fim do nível com os faróis.
- **09/10/2026** — **dois consertos e o tutorial visual:**
  - *"botao W e S nao acelera"*: na página da plataforma o jogo roda num iframe, e o clique não levava o foco do teclado para dentro (o Phaser cancela o mousedown). Agora o canvas chama `window.focus()` no pointerdown;
  - *"o volante so gira, mas n consigo acelerar"*: com o enquadramento novo, o carro nascia no portão com a traseira 1 px dentro do muro de baixo e ficava preso. Ele agora para em y 582, e a física deixa sair um carro que já esteja encostado;
  - *"reduza os textos do tutorial. eu queria algo mais visual"*:
    1. o painel acende com L2, C3;
    2. uma seta sai do chip L2 até a placa L2, e a faixa da linha se pinta da esquerda para a direita;
    3. o mesmo acontece com a C3, de cima para baixo;
    4. uma estrela aparece no cruzamento, com o único balão: *"L2 + C3 = aqui!"*;
    5. o carro de demonstração dirige até a vaga com o volante e o ACELERAR brilhando, a seta aponta o ESTACIONAR e o toque acontece;
    6. fecha com *"Sua vez!"*.
    Saíram os balões de matriz, volante, pedais e ESTACIONAR.

  Conferido no navegador:
  - o tutorial inteiro até o drive;
  - o carro anda pelo pedal e dá ré pelo S;
  - pela página com iframe, um clique de verdade no jogo deixa o foco no iframe e as teclas chegam ao jogo.
- **09/10/2026** — *"os botoes de ré e acelerar ta mt colado, e tão na borda da tela"*: os pedais ficaram um pouco mais estreitos (84) e se afastaram: RÉ em x 1111 e ACELERAR em x 1213, com 16 px de vão entre eles e 25 px da borda direita. O ESTACIONAR foi para x 1163, alinhado a eles.
- **09/10/2026** — *"remova esse painel"*: saiu a plaquinha da convenção (*L = LINHA, deitada · C = COLUNA, em pé*) da grama à esquerda; `createConvention` e os textos dela foram apagados. A convenção fica nas placas L/C e no tutorial.
- **09/10/2026** — **N2 e N3 feitos** (*"no n2, deixe carros ja estacionados, e no n3 peça carros de costas/de frente … e tambem mude a numeraçao das linhas e colunas"*, *"é pra em cada fase do n3, por representaçao diferente"*). Isso substitui o N2 (tíquete) e o N3 (mover carros até a seta) do §9:
  - **N2, pátio cheio (3×4):** 5 carros já estacionados, que aparecem um a um ao abrir. Pedidos: L2, C3 · L1, C2 · L3, C4 · L2, C1. As duas trocas clássicas (L3, C2 e L2, C1) ficam livres de propósito;
  - **N3, cada pedido numa representação (3×4, com 4 carros parados):**
    1. **L1, C4**, de frente;
    2. **2C**, com as colunas em letras, de ré;
    3. **C2**, com as linhas em letras, de frente;
    4. **mapinha:** uma miniatura da matriz no painel, com a vaga acesa (L1, C1), de ré;
  - as placas **viram** com animação quando a numeração muda (`yard.relabel`);
  - o painel ganhou o selo **DE FRENTE / DE RÉ**, com um carrinho apontando o nariz;
  - o carro que entra virado ao contrário é erro, com a vaga marcada e *"O carro ficou DE FRENTE. O pedido era DE RÉ."*. Na estreia do N3 há um só balão: *"DE FRENTE ou DE RÉ?"*;
  - com 4 colunas, a grade começa em x 335 (`setGridCols`).

  Conferido no navegador:
  - N2 dirigindo pela física até L2, C3 (o ESTACIONAR aparece);
  - N3 com os 4 pedidos, os dois de ré entrando de nariz para baixo, até "Nível 3 completo!";
  - as placas virando para 1-2-3/A-B-C-D e o painel de cada representação;
  - o erro de frente/ré.
- **09/10/2026** — **câmera seguindo o carro e controles maiores** (*"o volante, ré, e acelerar ta mt ruim … dê mais zoom no carro e deixe melhor a posiçao dos botoes, dai qnd o carro se move a camera segue"*):
  - **câmera** (`yard.chase`): ao dirigir, zoom de 1,5× seguindo o carro com suavidade, sem sair do fundo. Cada pedido abre no pátio inteiro e aproxima no carro quando ele entra pelo portão. Depois do ESTACIONAR, a comemoração acontece de perto, e a câmera volta ao pátio inteiro no acerto e no erro de vaga. No erro de frente/ré, ela fica de perto;
  - **placas como cabeçalho de planilha:** saíram do zoom. Seguem a fileira ou a coluna e grudam na borda esquerda ou no alto quando elas saem da tela. Na altura do volante, a placa da linha desvia para a direita dele;
  - **controles:** volante com raio 112 em (150, 584); RÉ e ACELERAR com 104 de largura em x 1040 e 1168 (vão de 24 px, 64 px da borda); ESTACIONAR em (1104, 400);
  - o tutorial do N1 também aproxima no carro de demonstração.

  Conferido no navegador: o N2 com a câmera seguindo, os cabeçalhos grudados e desviando do volante, o ESTACIONAR com zoom, a comemoração de perto, a volta ao pátio inteiro e o zoom no próximo carro, e o tutorial do N1 até o drive.
- **09/10/2026** — **capa registrada.** `cover-manobrista-da-matriz.png` virou o `thumbnail` do id 113, e `public/og/manobrista-da-matriz.jpg` (163 KB) foi gerado só para este jogo, com os parâmetros do `gerar-og.mjs`. Conferido: a capa aparece na página `/iframe/manobrista-da-matriz`.
