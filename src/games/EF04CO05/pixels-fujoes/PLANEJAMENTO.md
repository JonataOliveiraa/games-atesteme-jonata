# Pixels Fujões — planejamento

Jogo **117** · EF04CO05 · 4º ano · Mundo Digital · 3ª rodada.
Documento irmão: [TEXTURAS.md](./TEXTURAS.md) (a arte é feita no código; lá ficam a paleta e o prompt da capa). Ficha: `docs/rodada-3/EF04CO05.md` (*Mesa de Luz*), trocada a pedido do usuário em 13/10/2026: **o gênero é FPS (sem sangue)** e a arte é **pixel art limpa, feita no próprio código**.

**Réguas, nesta ordem:**
1. **O mais fácil possível, com o objetivo claro.**
2. **Escala real:** um tablet de tamanho normal mostra uma figurinha. O jogo entra na tela dele por zoom, até os pixels virarem quadradões.
3. **Tudo o que a tela guarda é um código de 0 e 1.** Um fujão só volta quando vira código, e quem manda os números é a criança, um por raio.
4. **Os botões são só 0 e 1, e o combinado fica sempre à vista.** A cor (ou a letra) de cada código está no combinado, nunca no botão.
5. **Uma fonte só:** tudo o que o jogo escreve (cabeçalho, combinado, botões, caixinhas, faixa, raio-x) sai da mesma fonte de pixel.
6. **Primeira pessoa de verdade:** a mira anda, os fujões se mexem em profundidade e o codificador fica na mão, embaixo.
7. **Um nível, um assunto:** um código por nível (aceso/apagado, cor RGB, letra ASCII).

Regras fixas da rodada:
- **1 erro encerra** (`WRONG_ANSWER` + `lose()`, com a cena do erro antes);
- `createTutorial`, com balões curtos e recorte, sem mãozinha;
- sem quadro de resumo no fim;
- "faça o jogo" = **só o N1**;
- PC com WASD, sem etiqueta de tecla na tela, e `window.focus()` no `pointerdown` do canvas.

---

## 1. O jogo em uma frase

Um tablet mostra a figurinha de um coração. A câmera dá zoom até ela virar quadradinhos, os **pixels**, e alguns pixels **pulam para fora da tela**, deixando buracos com "?". Em primeira pessoa, com o **codificador** na mão, a criança mira num fujão e manda o código dele, olhando o **combinado** (apagado = 0, aceso = 1). O raio transforma o fujão no código, o código volta para o buraco, e o tablet **lê o código** e pinta a casa com o que ele significa. Quando todos voltam, a figurinha fica inteira de novo.

O código cresce a cada nível, mas os botões continuam sendo 0 e 1: no N2 o pixel colorido pede **3 números** (vermelho, verde e azul), e no N3 as letras de uma mensagem têm **8 números** (o código ASCII): a metade 0100 vem pronta, e a criança manda as outras **4**.

## 2. A habilidade

> **(EF04CO05)** Codificar diferentes informações para representação em computador (binária, ASCII, atributos de pixel, como RGB etc.).
>
> Exemplo oficial: a tabela ASCII, e os formatos de imagem PBM (uma matriz de 0 e 1, branco e preto) e PGM (uma matriz de 0 a 255, tons de cinza).

| O que a BNCC pede | Onde acontece |
|---|---|
| **codificar** (a criança faz a conversão) | a informação do fujão (a luz, a cor ou a letra) está no corpo dele, e o código sai dos dedos dela, número por número. O botão só tem 0 ou 1 |
| **binária** | **N1:** cada pixel é 1 número, aceso (1) ou apagado (0). O raio-x mostra a figurinha virando a matriz de 0 e 1 do PBM |
| **atributos de pixel, como RGB** | **N2:** cada pixel tem 3 luzinhas, vermelha, verde e azul, e cada uma é 1 (acesa) ou 0 (apagada). São 3 números por pixel e 8 cores: apagado 000, vermelho 100, verde 010, azul 001, amarelo 110, ciano 011, rosa 101, branco 111 |
| **ASCII** | **N3:** a mensagem do tablet é feita de letras, e cada letra é o código ASCII de verdade, com 8 números, lidos em duas metades (0100 1111). As palavras só usam letras de A a O, que começam todas com 0100: o jogo já põe essa metade, e a criança manda a outra, 4 números |
| a máquina **lê** o código | o código entra no buraco e o tablet pinta o que ele significa. Código errado mostra outra coisa: outra cor (toda combinação de 3 números é uma cor) ou outra letra (ou um sinal que nem é letra) |

**O teste da bolinha:** se os fujões fossem todos iguais, não haveria o que codificar, porque o código sai do que ele é. E sem o combinado o 0 e o 1 não diriam nada: é ele que liga a cor ou a letra ao código, para a criança e para o tablet.

**Os irmãos (e os primos de pixel):**

| Jogo | O que a criança faz |
|---|---|
| *Ateliê de Códigos Digitais* (027, mesma habilidade) | três oficinas: padrões binários, ASCII e RGB |
| *Expedição Pixel* (072, mesma habilidade) | faz uma cor RGB abrindo três torneiras |
| *Pixel Secreto* (EF01CO05) | pinta a grade a partir dos códigos de cor (decodifica) |
| *Pista Binária* (071, EF04CO04) | atira 1 no quadradinho cheio e 0 no vazio, numa fila que vira código |
| *Corrida no Cabo* (116, EF04CO04) | manda letras ASCII pelo fio, no N2/N3 |
| **Pixels Fujões** (este) | a mesma ação nos três níveis (mirar e mandar números, só 0 e 1) para os três códigos da habilidade: 1 número por pixel, 3 por cor, 8 por letra. E o erro aparece na própria imagem, porque o tablet lê o que chegou |

A diferença para o Ateliê (027): lá cada código é uma oficina com o seu próprio controle. Aqui o gesto é sempre o mesmo, e o que muda é o **tamanho do código**: a criança sente que uma cor gasta 3 números e uma letra gasta 8.

## 3. O que mudou da ficha, e por quê

| Ficha (*Mesa de Luz*) | Aqui | Motivo |
|---|---|---|
| mesa de luz de show: faders RGB, lâmpadas 8-4-2-1, letreiro | FPS dentro da tela de um tablet: pixels fujões e um codificador | pedido do usuário (FPS sem sangue) |
| três assuntos no mesmo jogo, numa tela só | **um código por nível**: N1 aceso/apagado, N2 cor RGB, N3 letra ASCII | um nível, um assunto. Os três vieram a pedido do usuário (14/10/2026), para o jogo variar |
| arrastar faders | o joystick move a mira, e os botões 0 e 1 mandam | o gesto que responde é botão; o joystick só pilota |
| seta "mais AZUL", TRAVA com cadeado, ajuste que pisca depois de 2 erros | **1 erro encerra**, com a cena do erro | regra da rodada. A seta entregaria a resposta |
| painel "como você codificou" e estrelas | o raio-x da figurinha no fim da fase do N1 (a consequência), confete e `showLevelComplete` | sem quadro de resumo |
| tabela inventada do letreiro (S = 01, O = 02) | o **ASCII de verdade**, com a metade 0100 já dada | é o que o computador usa; com a metade dada sobram 4 números por letra |
| teatro com palco | um tablet em escala real, depois a tela dele de perto | escala real e zoom, sem cenário |
| PBM em preto e branco | **aceso (1) e apagado (0)**, como uma tela de LED | o usuário achou o preto feio. É a mesma matriz de 0 e 1 |

## 4. O laço

```
TABLET (escala real, fundo roxo-escuro liso)
  a galeria do tablet mostra a figurinha (ou a mensagem), pequena
  zoom contínuo até ela encher a tela: cada pixel (ou letra) vira um quadradão
  plim: 2 a 4 casas pulam para fora da tela (para perto da câmera) → buracos com "?"
DENTRO DA TELA (primeira pessoa)
  entram o codificador (embaixo, no meio), a mira, o joystick e os botões 0 e 1
  os fujões flutuam na frente da figura, cada um numa distância
  (no N2 e no N3, cada um com uma fileira de caixinhas em cima, uma por número do código)
  a criança move a mira; sobre um fujão a mira fecha e fica ciano
  (com o joystick solto, ela acompanha o fujão)
  toca 0 ou 1 → o raio sai do codificador levando o número
    ├─ mira no vazio → o raio acaba numa faisquinha. Grátis.
    └─ mira num fujão → o número é comparado com o próximo número do código dele
         ├─ certo, e o código ainda não acabou → o número entra na caixinha da vez;
         │    o fujão leva um empurrãozinho e a próxima caixinha acende
         ├─ certo, e era o último → o fujão vira o código inteiro (fonte de pixel)
         │    o código volta para o buraco e o tablet lê: a casa ganha a cor (ou a letra)
         │    → brilho; CORRECT_ANSWER; a casinha do alto ganha a cor (ou a letra)
         └─ errado, em qualquer número → o código fecha com esse número (o resto como devia ser),
              volta, e o tablet lê outra coisa: outra cor, outra letra ou um sinal
              → a casa fica errada, com contorno laranja; faixa; WRONG_ANSWER + lose()
  os outros fujões não param (nada congela)
  todos de volta → N1: raio-x (a figurinha vira 0 e 1, linha por linha, e volta);
                   N2/N3: um brilho → a bolinha acende
  zoom de volta ao tablet, com a figura inteira → a galeria desliza para a próxima
  3 fases → confete → showLevelComplete
```

Dá para mandar um número enquanto outro ainda está voltando. Um fujão que já fechou o código não pode ser mirado de novo. No N2 e no N3 dá para trocar de fujão no meio do código: as caixinhas de cada um guardam o que ele já recebeu.

## 5. A tela (1280 × 720)

| Região | Onde | O quê |
|---|---|---|
| **cabeçalho, faixa 1** (y 0–80) | a placa rosa "NÍVEL 1" e as fases em quadradinhos à esquerda, a ordem no meio da tela (x 640), o cronômetro entre a ordem e o `?` (régua com o meio em x 1094, relógio em x 978), o `?` ciano à direita | a ordem é *"DEVOLVA OS PIXELS"* (N1, N2) ou *"DEVOLVA AS LETRAS"* (N3) + uma casinha por fujão (vazia com "?"; ganha a cor, ou a letra, quando ele volta). O cronômetro está no §9b |
| **cabeçalho, faixa 2** (y 80–164) | só os cartões do combinado, centrados (x 640), debaixo da ordem; cada cartão na largura do seu conteúdo | N1: [▪ APAGADO = 0] [▪ ACESO = 1]. N2: [▪ = 110], um cartão por cor que aparece na figura, com cada 1 na cor da sua luz (vermelho, verde, azul) e o 0 apagado. N3: [O = 0100 1111], uma plaquinha por letra da palavra, com a metade 0100 mais apagada e separada; o cartão da letra na mira acende (ver §6). Até 6 cartões (4 no N3, para o código não encolher); se a fileira não cabe, a letra diminui |
| **figura** (a tela do tablet de perto) | centro (640, 378) | N1: 8 × 8 casas de 48 px. N2: 12 × 12 casas de 32 px. N3: uma linha de 3 ou 4 letras, casas de 64 px. Em volta, a tela do tablet (quase preta) |
| **fujões** | na frente da figura, centros em x 236–1010 e y 238–512; de ~52 a ~100 px, conforme a distância | **no máximo 4** ao mesmo tempo. No N2/N3, a fileira de caixinhas do código vai em cima de cada um |
| **codificador** | embaixo, no meio (x 640, base no y 720), ~150 px de altura | a "mão" da primeira pessoa. O visor dele mostra o último número mandado |
| **joystick** | canto de baixo à esquerda (140, 604); pega em qualquer ponto com x < 330 e y > 420 | move a mira |
| **botões 0 e 1** | canto de baixo à direita: 0 em (1062, 612), 1 em (1190, 612), 116 px | mandam o número; os dois rosa |

**Teto de alvos:** 4 fujões ao mesmo tempo. **Regiões tocáveis:** joystick, botão 0, botão 1 e `?`. A figura e os fujões não aceitam toque: quem mira é o joystick.

**PC:** WASD (e setas) movem a mira; as teclas 0 e 1 (também do teclado numérico) mandam; H abre a ajuda. Com mouse: arrastar o joystick, soltar (a mira fica e acompanha o fujão) e clicar no botão.

## 6. A mira e os fujões (a primeira pessoa)

- **Profundidade:** cada fujão tem uma distância `z` (N1 0,52–0,85; N2 0,36–0,62; N3 0,64–0,92). O tamanho é casa/z, e o mais perto fica na frente. A distância oscila devagar: o fujão vem e vai.
- **Olhar em volta:** a mira puxa a câmera um pouco (6 % do desvio da mira, até 40 px). A figura anda −L e cada fujão anda −L/z, no máximo 2,2 × L: os de perto andam mais (paralaxe), e a cena ganha fundo. O codificador também balança com a mira.
- **Movimento:** cada fujão vagueia (o rumo gira devagar), quica nas bordas, fica longe dos outros (nunca se sobrepõem, e no N3, com as 8 caixinhas, a distância é maior; a letra fisgada não anda) e dá pulinhos. A velocidade sobe por fase, com uma escapada curta de vez em quando na fase 3.
- **Mira:** 560 px/s com o joystick todo. Ela fecha sobre um fujão quando o centro dela fica a menos de (meio tamanho + 12 px) do centro dele; se dois cabem, ganha o mais perto da câmera. Com o joystick solto, a mira acompanha o fujão travado (assistência de mira), e assim dá para soltar o joystick e tocar o botão. O retículo fica aberto e lilás no vazio, e fechado e ciano sobre o fujão, abraçando-o.
- **O raio:** o alvo é decidido no instante do toque (o fujão travado). O raio leva 130 ms e acompanha o fujão.
- **As caixinhas do código (N2, N3):** uma por número, em cima do fujão. A da vez tem aro branco; as cheias mostram o número que entrou. No N2 o aro de cada caixinha tem a cor da sua luz (vermelha, verde, azul), na ordem do combinado. No N3 as 4 primeiras já vêm com 0100, mais estreitas, apagadas e separadas das 4 da criança.
- **Número certo no meio do código:** uma faisquinha ciano e o fujão pisca. No N2 ele recua um pouco; no N3 a letra fica **fisgada** (abaixo).
- **Fuga (N3):** se a mira fica travada numa letra por um tempo (1,1 s na fase 1, 0,9 s na fase 2, 0,75 s na fase 3), ela pula ~160 px para o lado com mais espaço, deixa uma fumacinha de pixel e a mira se solta. Depois descansa 1,2 s antes de poder fugir de novo. Fugir **não é erro**.
- **Letra fisgada (N3):** depois do primeiro número certo da criança, a letra para de andar e de fugir até o código fechar, e o contorno dela fica ciano. Quem chega perto é que se afasta. A fuga desafia só a primeira mira; os 4 números seguintes são sem pressa.
- **O cartão acompanha a letra (N3):** enquanto uma letra está na mira (ou fisgada, com o raio voando), o cartão dela no combinado ganha um aro ciano, e os números que ela já tem ficam ciano (o 0100 desde o começo). O próximo a mandar é o primeiro número branco, sem a criança perder o lugar no meio dos 8. Nada pisca: o cartão só muda de cor.
- **Contorno claro:** cada fujão tem um contorno lilás-claro de 4 px. Sem ele, o fujão escuro sumia na frente das casas escuras.
- **Expressões do fujão:** normal, piscando de vez em quando, susto quando a mira trava nele, alegre no instante em que o raio pega. A letra do N3 é uma plaquinha creme com a letra no meio e os olhinhos nos cantos de cima.

## 7. O combinado e os níveis (`data/levels.ts`)

```ts
type Kind = 'bit' | 'rgb' | 'ascii'
type Entry = { id; code; name; color; glyph? }           // o que a casa guarda e o código dela
type PhaseDef = { id; rows: string[]; escaped: [row, col][]; dodge; speed; dash }
type LevelDef = { level; kind; title; message; view: { zoom; near; far }; given; phases }
```

A figura é escrita com símbolos (`rows`): no N1 `0`/`1`, no N2 a letra da cor (`K R G B Y C M W`) e no N3 a própria mensagem. `entryOf(kind, símbolo)` diz o que a casa guarda; `decode(kind, código)` diz o que o tablet pinta quando chega um código; `phaseTable` monta o combinado da fase (só o que aparece na figura).

**N1, aceso e apagado: 1 número.** 0 = apagado (roxo-escuro) e 1 = aceso (amarelo). É a matriz de 0 e 1 do PBM; no lugar de branco e preto, a luz da tela (decisão do usuário, 13/10/2026).

| Fase | Figurinha (8 × 8) | Fujões | Movimento |
|---|---|---|---|
| 1 | coração | 3: um aceso (2,1), o apagado do meio do coração (1,3) e outro aceso (4,5) | 45 px/s |
| 2 | gatinho | 4: (3,1), (0,0), (5,4), (6,2) | 65 px/s |
| 3 | fantasminha | 4: (3,1), (1,3), (4,6), (7,7) | 85 px/s, com escapadas |

**N2, pixel colorido (RGB): 3 números.** Cada pixel tem 3 luzinhas, na ordem vermelha, verde e azul; acesa é 1, apagada é 0.

| Cor | Código | | Cor | Código |
|---|---|---|---|---|
| apagado | 000 | | amarelo | 110 |
| vermelho | 100 | | ciano | 011 |
| verde | 010 | | rosa | 101 |
| azul | 001 | | branco | 111 |

| Fase | Figurinha (12 × 12) | Fujões | Combinado | Movimento |
|---|---|---|---|---|
| 1 | flor | (1,4) vermelho, (3,5) amarelo, (9,2) verde, (0,0) apagado | apagado, vermelho, verde, amarelo | 50 px/s |
| 2 | planeta | (1,5) azul, (3,3) verde, (6,6) branco, (0,0) apagado | apagado, verde, azul, branco | 62 px/s |
| 3 | sorvete | (1,5) vermelho, (3,4) rosa, (6,3) branco, (8,5) amarelo | apagado, vermelho, amarelo, rosa, branco | 75 px/s, com escapadas |

**N3, letra em código (ASCII): 8 números, 4 pela criança.** O código ASCII de verdade das maiúsculas, lido em duas metades. As palavras só usam letras de **A a O**, que começam todas com **0100**: essa metade vem pronta nas caixinhas (`given: 4`), e a criança manda a outra metade, 4 números. As letras **fogem da mira** (o pedido do usuário para o N3: *"quadradinhos que fogem da mira"*), mas só até o primeiro número certo: depois ficam fisgadas (§6).

| Fase | Mensagem | Fujões (código) | Foge após | Movimento |
|---|---|---|---|---|
| 1 | OI! | O 0100 1111, I 0100 1001 (o "!" fica: não tem código no combinado) | 1,1 s | 55 px/s |
| 2 | GALO | G 0100 0111, L 0100 1100, O 0100 1111 | 0,9 s | 65 px/s |
| 3 | FADA | F 0100 0110, D 0100 0100, A 0100 0001 | 0,75 s | 75 px/s, com escapadas |

O combinado do N3 traz todas as letras da palavra, na ordem (também as que não fugiram): é a tabela ASCII só com o que a tela mostra. Com 4 cartões no máximo, o código fica na letra grande.

**Por que a metade e não o 010** (14/10/2026, *"melhore a parte do ASCII, ela é mt difícil por conta do tamanho enorme da sequência"*): com o 010 dado, a criança mandava 5 números seguidos, a letra era empurrada a cada raio e voltava a fugir no meio do código, e no cartão era fácil se perder entre os 8 dígitos. Agora são 4 números, num bloco separado do que vem pronto, com a letra parada e o cartão marcando o lugar.

**`validateLevels`:**
- linhas do mesmo tamanho; no N1/N2, só símbolos do combinado;
- de 2 a 4 fujões por fase, em casas diferentes, dentro da figura e numa casa que tem código;
- combinado com no máximo 6 cartões (4 no N3);
- N1: aceso e apagado em toda fase, e o primeiro fujão (o da demonstração) é aceso;
- o começo dado (`given`) é igual em todos os códigos da fase (no N3, o 0100), e a fase 1 do N3 tem fuga (para a demonstração mostrar);
- uma figura diferente em cada fase.

## 8. Introduções (uma vez por nível) e as ajudas

**Quem explica é a animação** (pedido do usuário, 14/10/2026: *"remova falar sobre WASD e o resto dos controles. e deixe o tutorial mais voltado pro visual"*). Cada passo é uma cena acontecendo, com um balão de **2 a 5 palavras** que espera o botão. Nenhum balão fala de joystick, botão ou teclado: os controles aparecem só na demonstração, mexendo-se sozinhos (o joystick anda, a mira trava, o anel acende no botão tocado).

**N1:**
1. **O tablet em escala real** e o zoom até os pixels. *"Cada quadradinho é um pixel."* [Próximo]
2. **Raio-x:** a figurinha vira 0 e 1, linha por linha, e os cartões do combinado pulam. *"Cada pixel vira um número."* [Próximo] Depois, ela volta às cores.
3. **Três pixels pulam para fora** (buracos com "?"), e entram o codificador, a mira, o joystick e os botões. Recorte nos fujões: *"Fugiram! Devolva com o número."* [Ver]
4. **Demonstração, sem balão:** os fujões param, o joystick se mexe sozinho, a mira trava no fujão aceso, o cartão ACESO = 1 pula, o 1 é tocado (um anel no botão), o raio sai, o fujão vira 1, volta, e o tablet acende a casa. Esse fujão conta.
5. *"Sua vez!"* [Vamos começar!]

**N2:**
1. Zoom na flor. *"Agora com cores!"* [Próximo]
2. **A lupa:** um pixel amarelo grande se abre em três luzinhas (vermelha e verde acesas, azul apagada), e cada uma ganha o seu número: 1 1 0. *"Cada cor são 3 luzes."* [Próximo]
3. **A onda:** o cartão do amarelo pula, e o 1, o 1 e o 0 pulam um por um, **ao mesmo tempo na lupa e no cartão** (é a ligação entre as luzes e o código, sem seta nem linha). *"Amarelo é 110!"* [Próximo] A lupa some.
4. Os fujões saem, cada um com 3 caixinhas. *"3 números por cor."* [Ver]
5. **Demonstração, sem balão:** a mira trava no fujão vermelho, o cartão dele pula, e os números saem um por vez (1, 0, 0), cada um enchendo uma caixinha; no último ele vira 100, volta, e o tablet pinta a casa de vermelho.
6. *"Sua vez!"*

**N3:**
1. Zoom na mensagem "OI!"; os cartões do combinado pulam um por um. *"Letras também viram números!"* [Próximo]
2. **A onda do 0100:** os 4 números da metade apagada pulam um por um, em todos os cartões juntos. *"Todas começam com 0100."* [Próximo]
3. As letras saem, com 8 caixinhas e o 0100 já dentro. *"Cuidado: elas fogem!"* [Ver]
4. **Demonstração, sem balão:** a mira trava no O, e ele pula para longe; a mira vai rápido até ele de novo e o cartão do O acende, com o 0100 ciano. O 1º número sai, o O fica fisgado (contorno ciano, parado), e os outros saem sem pressa (1 1 1 1, cada um ficando ciano no cartão); o O volta para a mensagem.
5. *"Sua vez!"*

**Ajuda fixa:** a mira fechada e ciano sobre o fujão, e a caixinha da vez com aro branco. Elas dizem onde está a mira e qual número falta, nunca qual é o número.

**`?`:** os fujões param, os cartões do combinado pulam, e sai um balão só, com recorte no combinado [Continuar]: N1 *"Aceso é 1. Apagado é 0."*, N2 *"Ache a cor do fujão."*, N3 *"Ache a letra do fujão."*.

## 9. Erros (a cena antes do `lose()`)

O número errado, em qualquer posição, **fecha o código**: entra o número errado, e o resto é completado como devia ser. Assim o que o tablet mostra depende só do número que a criança errou. O código inteiro aparece numa etiqueta em cima da casa (no N2, cada 1 na cor da sua luz; no N3, o 010 mais apagado), o tablet pinta o que esse código significa, a casa ganha contorno laranja e treme, e a casinha do alto fica com a coisa errada.

| Nível | Exemplo | Faixa grande |
|---|---|---|
| N1 | 0 num fujão aceso: a casa fica apagada, a figura fica furada | *"PIXEL ACESO É 1. COM 0, ELE VOLTOU APAGADO!"* |
| N1 | 1 num fujão apagado: uma mancha de luz | *"PIXEL APAGADO É 0. COM 1, ELE VOLTOU ACESO!"* |
| N2 | amarelo (110), 0 no 2º número: chega 100 | *"AMARELO É 110. COM 100, VIROU VERMELHO!"* |
| N3 | L (0100 1100), 0 no 2º número da criança: chega 0100 1000 | *"L É 0100 1100. COM 0100 1000, VIROU H!"* |
| N3 | um código que não é letra (só o 0100 0000, que é @) | *"… VIROU UM SINAL ESTRANHO!"*, e a casa mostra "?" |

No N3 a faixa e a etiqueta escrevem o código em duas metades (0100 1100), do mesmo jeito que o cartão.

A mira no vazio, o raio que não pega ninguém e o fujão que foge são grátis. Sem som áspero, só um "blom". A cena dura ~2,4 s antes do `lose()`.

## 9b. O cronômetro (pedido do usuário, 14/10/2026: *"coloque cronômetro"*)

- **Pixel art própria** (`scenes/stopwatch.ts`), e não o `shared/hud/createTimeBar`: o da `shared` é desenhado em vetor, com cantos redondos, e o usuário pediu um feito para o jogo (*"se quiser crie um pra si mesmo, pq esse não é pixel art"*).
- **O desenho:** um relógio de bolso (botão em cima, aro lilás, mostrador claro, miolo rosa) cujo ponteiro dá um passo por segundo, e uma régua de **10 gomos** que esvazia. O gomo da vez some de cima para baixo, uma linha de pixel por vez (30 passos no total). Os gomos são brancos com tempo, **laranja** abaixo de 34 % e **vermelhos** abaixo de 15 %. Nada pisca: no começo do vermelho o relógio sacode uma vez (de pixel em pixel) e toca um tique-taque curto.
- **Só anda na jogada:** com o jogo em `play` e algum fujão ainda solto. Parado (abertura, demonstração, `?`, erro, troca de fase, ou com o último raio já voando), ele fica apagado. Cada fase começa com a régua cheia.
- **O tempo sai dos dados** (`phaseTime` em `data/levels.ts`): 10 s, mais 6 s por fujão e 2,5 s por número que a criança manda. Dá 35–44 s no N1, 64 s no N2 e 42–58 s no N3.
- **Zerou com fujão solto:** o raio que estiver voando não conta mais, os fujões param, sai a faixa grande *"O TEMPO ACABOU!"* e, depois de ~2,4 s, `WRONG_ANSWER` + `lose()` (regra da rodada: tempo zerado é game over).

## 10. Fim de fase e de nível

- **Fim de fase:** saem o codificador e os controles; no N1, o raio-x de comemoração (a figurinha vira números linha por linha e volta); no N2 e no N3, um brilho sobre a figura; a figura dá um pulinho; a bolinha acende; zoom de volta ao tablet; a galeria desliza para a próxima.
- **Fim de nível:** confete e `showLevelComplete` (com a mensagem do nível). Sem quadro de resumo.

## 11. Arte: pixel art feita no código, tema "fliperama à noite"

- **Não há textura para gerar** (decisão do usuário, 13/10/2026: *"o jogo precisa nem de textura, vc msm pode fzr, já que é pixel art"*). Tudo é desenhado pixel por pixel em `scenes/pixelart.ts`: o tablet, os fujões (4 expressões; um por cor e um por letra, assados na hora em que a fase precisa), as caixinhas do código, o codificador, a mira, o joystick, os botões, as placas do cabeçalho e a fonte. As texturas nascem no tamanho de arte e são ampliadas em **NEAREST**, com escala inteira sempre que dá (interface em 4×).
- **Paleta "fliperama à noite"** (`data/theme.ts`): fundo roxo-escuro, tela do tablet quase preta, painéis roxos com aro lilás e três destaques: **ciano** (o raio e a mira), **rosa** (os botões e a placa do nível) e **amarelo** (o pixel aceso). No N2 entram as 8 cores do RGB, e no N3 o creme das plaquinhas de letra. Nada de fundo claro.
- **Uma fonte só:** uma fonte de pixel própria (`data/glyphs.ts`, maiúsculas 5 × 7 com acentos e cedilha) vira `BitmapText` (um atlas por cor: branco, ciano, escuro, apagado, amarelo, vermelho, verde, azul) e também os números-imagem. Só o que é da **plataforma** (balão do tutorial, painel de fim de nível e tela de carregar) continua na fonte padrão do catálogo.
- **O cabeçalho é pixel art:** duas faixas roxas com sulco pontilhado, aro lilás embaixo e sombra em degraus; a placa rosa "NÍVEL 1"; as fases em quadradinhos (verde = feita, amarelo = a da vez, vazado = a próxima); o `?` ciano; e os cartões do combinado, cada um na sua largura.
- **O zoom amplia a arte:** o tablet tem 1 pixel de arte = 4 px de mundo, e cada casa da figura ocupa 8 px de mundo; o zoom (6×, 4× ou 8×) a leva a 48, 32 ou 64 px.
- **A figura é dado, não arte:** cada casa é pintada pelo código com a cor exata do combinado (ou a plaquinha com a letra), para que a tela e o veredito nunca discordem.

## 12. Arquivos e registro

**Código** (`src/games/EF04CO05/pixels-fujoes/`):
- `types.ts`, `index.ts`;
- `data/{levels,layout,theme,words,files,glyphs}.ts`: `glyphs` é a fonte de pixel (letras, números e acentos);
- `scenes/{BootScene,GameScene,tablet,swarm,aim,blaster,controls,table,order,subpixels,stopwatch,header,hud,banner,guide,audio,art,pixelart}.ts`:
  - `stopwatch` é o cronômetro em pixel art (relógio e régua de gomos), com a arte dele;
  - `pixelart` desenha toda a arte e a fonte;
  - `tablet` é o tablet, a figura, os buracos, a etiqueta do código, o raio-x e o zoom;
  - `swarm` são os fujões em 3D (movimento, projeção, caixinhas, fuga e a mira que trava);
  - `table` é o combinado (um tipo de cartão por nível);
  - `subpixels` é a lupa do N2;
  - `aim` é a mira e o joystick;
  - `blaster` é o codificador e o raio.

**Arte:** toda no código (`pixelart.ts`). Só a capa do catálogo ainda falta (prompt no [TEXTURAS.md](./TEXTURAS.md), ou feita também em pixel art pelo código).

**Registro:** id **117** (o `NEXT_FREE_ID` foi para 118), slug `pixels-fujoes`, Mundo Digital, ordem 277 (logo depois da Expedição Pixel), `gameInstructions` e `GAMES_WITH_IN_GAME_COMPLETION_SCREEN`. Dev server: `jogos-dev-pixels` (porta 5269).

## 13. Travas para quem mexer depois

- **Escala real:** o tablet tem tamanho de tablet, e os quadradões só existem depois do zoom.
- **Os botões são só 0 e 1, em todos os níveis** (*"deveria só existir 0 ou 1"*). Código maior é mais raios, nunca mais botões. E nunca pinte os botões com a cor de um valor: os dois são rosa.
- **Cada raio que pega um fujão é julgado.** Não existe raio "de graça" num fujão; o número errado fecha o código e encerra.
- **O código errado se completa com o resto certo**, para o resultado mostrar só o efeito do número errado.
- **O tablet é quem pinta o buraco, a partir do código** (decodifica, com `decode`). Nunca use a cor do fujão para pintar a casa.
- **Uma fonte só no que é do jogo:** texto novo do jogo sai em `ptext` (a fonte de pixel), nunca em `scene.add.text`.
- **Amarelo é cor de pixel** (aceso no N1, 110 no N2). Não use amarelo para número, mira ou botão.
- **O 0100 do ASCII vem pronto, apagado e separado.** Ele é igual em todas as letras de A a O, e pedir à criança seria só repetição. Palavra nova no N3 só com letras de A a O, e no máximo 4 letras diferentes (a validação cobra as duas coisas).
- **A letra fisgada não foge nem anda.** A fuga é o desafio da primeira mira; depois dela, o código de 4 números se manda sem pressa.
- **Nada congela:** o acerto e o erro acontecem enquanto os outros fujões continuam flutuando.
- **Mira no vazio e fuga são grátis; número errado num fujão encerra.**
- **Pixel art com NEAREST.** Não ponha `setResolution` nem filtro LINEAR nas texturas de pixel, e toda textura usada tem de ser assada em `ensureArt` (o quadrado verde de textura faltando já apareceu uma vez).
- **Vocabulário de tela:** fujão, pixel, letra, número, código, raio, codificador. Nunca arma, tiro, inimigo ou alvo.
- **Balão não fala de controle.** Joystick, botões e teclado se explicam mexendo-se sozinhos na demonstração; o balão fica com a habilidade, em 2 a 5 palavras.

## 14. Dúvidas

1. **A capa.** Ela pode ser gerada pelo prompt do TEXTURAS.md ou feita também em pixel art pelo código.

## Histórico

- **13/10/2026:** plano a partir da ficha *Mesa de Luz*, no gênero pedido pelo usuário (FPS sem sangue). Ideias oferecidas: **Pixels Fujões** (escolhida), Canhão de Luz e Mosaico da Torcida. Motivo da troca: a ficha repetia o Ateliê (027) e a Expedição Pixel (072), e deixava de fora a parte de imagem do exemplo oficial.
- **13/10/2026, N1 feito em Graphics (id 117):**
  - a arte de reserva é pixel art de verdade, desenhada pelo código (mapas de pixels);
  - conferido no navegador do começo ao fim: a história de 5 passos, a demonstração, as 3 fases, o erro (faixa e `GAME_OVER`), o `?`, o joystick no mouse, o teclado e a tela de fim. Cada quadro custa ~2 ms;
  - ajustes do teste: a mira travada abraça o fujão, os fujões ganharam o contorno claro, o balão "Fugiram!" ilumina os fujões, e o cartão do combinado pula na demonstração.
- **13/10/2026, tema e arte refeitos** (*"o jogo precisa nem de textura, vc msm pode fzr… preciso de dedicação no header… vc misturou números em pixel art… a temática de pôr um amarelo/branco no bg tá ruim… esse preto do 1 tbm tá feio, o 0 deveria ser branco mesmo?"*):
  - sem texturas: a pixel art do código virou a arte final (`pixelart.ts`), redesenhada no tema novo;
  - tema "fliperama à noite" (roxo-escuro, ciano, rosa e amarelo) no lugar do lavanda e do creme;
  - **aceso (1) e apagado (0)** no lugar de preto e branco;
  - uma fonte de pixel própria com acentos, em tudo o que o jogo escreve; o cabeçalho foi redesenhado em pixel art.
- **14/10/2026, cabeçalho e N2/N3:**
  - cabeçalho: saiu a etiqueta "COMBINADO" (*"sem nenhuma finalidade"*); a ordem e os cartões ficaram centrados na tela, um embaixo do outro, e cada cartão na largura do seu conteúdo;
  - **N2** (*"pixeis mais resistentes, e faça artes maiores com os quadradinhos"*): quanta luz de 0 a 3, figurinhas de 12 × 12 e fujões blindados;
  - **N3** (*"faça sair quadradinhos que fogem da mira"*): figurinhas de 16 × 16 e fujões que pulam para longe se a mira demora neles.
- **14/10/2026, só 0 e 1** (*"deveria só existir 0 ou 1. os resistentes continuam sendo 0 ou 1, só precisariam de mais tiros"*):
  - saíram os tons de luz de 0 a 3 e os 4 botões; o resistente ganhou armadura vazada, com **cada raio julgado**;
  - corrigido o quadrado verde da textura que faltava (`px-dot`, da fumacinha da fuga).
- **14/10/2026, um código por nível** (*"será que tem como codificar mais diferentes informações (ASCII, atributos de pixel, como RGB etc.) além desse só 0 e 1? e deixar o jogo mais variado"* e *"faça assim, n3 com letras ascii"*):
  - **N2 = pixel colorido RGB:** 3 números por pixel (vermelho, verde, azul), 8 cores, figurinhas de 12 × 12 (flor, planeta, sorvete), a lupa que abre o pixel amarelo em 1 1 0, e as caixinhas do código em cima do fujão (aro na cor de cada luz);
  - **N3 = letras ASCII:** mensagens OI!, GATO e PIXEL; 8 números por letra, com o 010 já dado; as letras continuam fugindo da mira;
  - saíram a armadura e as marquinhas do resistente: o "mais tiros" agora é o próprio código, um número por raio, cada um julgado;
  - o código errado se completa com o resto certo e o tablet mostra o que ele significa (outra cor, outra letra ou um sinal estranho);
  - conferido no navegador: N2 inteiro (introdução, lupa, demonstração de 3 números, erro com a faixa e a passagem para o N3) e N3 (introdução, demonstração com fuga e 5 números, erro com a faixa *"I É 01001001. COM 01011001, VIROU Y!"*), sem textura faltando.
- **14/10/2026, tutorial visual** (*"remova falar sobre WASD e o resto dos controles. e deixe o tutorial mais voltado pro visual"*):
  - todos os balões encolheram para 2 a 5 palavras, e nenhum fala de joystick, botão ou teclado (saíram *"Mire no fujão"*, *"Teclado: WASD, 0 e 1"* e *"Mire de novo e toque rápido"*); o último balão é só *"Sua vez!"*;
  - os controles se explicam na demonstração, que agora corre inteira sem balão (também a fuga do N3);
  - a ligação entre o desenho e o código virou animação: no N2 o 1 1 0 pula ao mesmo tempo na lupa e no cartão do amarelo; no N3 o 010 pula em todos os cartões;
  - o `?` virou um balão só, sobre o combinado, com os cartões pulando;
  - as instruções do catálogo também não citam mais o teclado;
  - conferido no navegador: as aberturas dos três níveis, as demonstrações e o `?` do N3.
- **14/10/2026, ASCII mais fácil** (*"melhore a parte do ASCII, ela é mt difícil por conta do tamanho enorme da sequência"*):
  - **4 números em vez de 5:** as palavras só usam letras de A a O (OI!, GALO, FADA), que começam todas com 0100; essa metade vem pronta, e a criança manda a outra. O código aparece sempre em duas metades (0100 1111), no cartão, nas caixinhas, na etiqueta e na faixa de erro;
  - **letra fisgada:** depois do primeiro número certo, a letra para de andar e de fugir, com contorno ciano, até o código fechar (antes, ela era empurrada a cada raio e fugia de novo no meio do código);
  - **o cartão marca o lugar:** o cartão da letra na mira ganha aro ciano, e os números que ela já tem ficam ciano; o próximo é o primeiro branco;
  - PIXEL e GATO saíram (P, T e X começam com 0101); BOLHA chegou a entrar, mas os 5 cartões encolhiam o código, e a validação agora limita o N3 a 4 letras diferentes;
  - conferido no navegador: a abertura com a onda do 0100, a demonstração com a fuga e a letra fisgada, a fase 1 inteira, o erro na fase 2 (*"L É 0100 1100. COM 0100 1000, VIROU H!"*) e o cabeçalho das 3 fases.
- **14/10/2026, cronômetro** (*"coloque cronômetro. já tem um componente pra isso eu acho no shared/"*, e depois *"se quiser crie um pra si mesmo, pq esse não é pixel art"*):
  - o `createTimeBar` da `shared` foi deixado de lado por ser vetorial; o jogo ganhou o próprio, em pixel art (`scenes/stopwatch.ts`): relógio de bolso com ponteiro e régua de 10 gomos que esvazia linha por linha, branco → laranja → vermelho;
  - tempo por fase calculado pelos dados (`phaseTime`), só correndo na jogada; zerou = faixa *"O TEMPO ACABOU!"* + `WRONG_ANSWER` + `lose()`;
  - conferido no navegador: o cronômetro no cabeçalho (sem textura faltando), as três cores e o tempo acabando até o `GAME_OVER`.
