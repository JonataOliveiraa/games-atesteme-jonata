# Portas do Computador — planejamento

Jogo **110** (o mesmo id do Pinball, que este jogo substitui) · EF03CO06 · 3º ano · 3ª rodada.
Documento irmão: [TEXTURAS.md](./TEXTURAS.md). Ficha original: `docs/rodada-3/EF03CO06.md`.

**Por que existe (06/10/2026).** O Pinball de Entrada e Saída teve três versões, e as três foram reprovadas:
- **trilho:** *"chato e sem graça… confuso"*;
- **física:** *"aleatório e estranho… fugiu do conceito da habilidade"*;
- **aparelhos plugados:** *"não está saindo bem"*.

O usuário pediu ideias alinhadas com a habilidade e escolheu esta. Ao aprovar, deu a régua: *"é importante sempre deixar o jogo o mais fácil possível de se jogar e ser claro com seu objetivo"*. O §3 trata disso, e toda decisão passa por ele primeiro.

Regras fixas da rodada:
- **1 erro encerra**: `WRONG_ANSWER` + `lose()`, uma vez, com a cena do erro **antes**;
- tutorial com `createTutorial`, uma frase curta por balão e sem mãozinha;
- a Lily só fala no **começo e no fim** do nível;
- "faça o jogo" = **só o N1** (N2 e N3 ficam planejados).

---

## 1. O jogo em uma frase

No meio da tela está **o computador** (um gabinete com janela de vidro, que mostra o processador por dentro). Os **aparelhos** ficam do lado de fora, **ligados por fio nas portas dele**. As **informações** são personagens que chegam do mundo lá fora: a Notinha é um SOM, a Fotinho é uma IMAGEM, a Letrinha são LETRAS. A criança toca no **aparelho certo**, e a informação entra nele, corre pelo fio e **entra** no computador (N1). Depois, as informações **saem** pela porta que dá o que cada pessoa quer (N2). No fim, elas fazem a viagem toda: entram e saem (N3).

## 2. A habilidade

> **(EF03CO06)** Reconhecer que, para um computador realizar tarefas, ele se comunica com o mundo exterior com o uso de interfaces físicas (dispositivos de entrada e saída). Exemplificar os diferentes tipos de dispositivos de entrada (teclado, mouse, microfone, sensores, antena etc.) e de dispositivos de saída (monitor, alto-falante, impressora etc.)

| O que a BNCC pede | Onde acontece |
|---|---|
| **comunica-se com o mundo exterior** | o computador fica no meio; o lado de fora é o mundo; a informação **passa pelo aparelho e pelo fio** até dentro dele |
| **por interfaces físicas** | a única passagem é **uma porta-aparelho**: não há outro jeito de entrar ou sair |
| **dispositivo de entrada** | as portas da **esquerda** deixam a informação ENTRAR: microfone (som), câmera (imagem), teclado (letras) |
| **dispositivo de saída** | as portas da **direita** deixam a informação SAIR: alto-falante (ouvir), tela (ver), impressora (papel) |
| **exemplificar os tipos** | cada aparelho, na hora em que funciona, mostra o que faz: o microfone acende quando o som entra, e a impressora solta a folha |

**O teste da porta.** Se as portas fossem iguais, o jogo não teria solução. Só quem sabe **o que cada aparelho pega ou entrega** acerta.

**O que fica de fora, e por quê.** Mouse, sensores e antena ficam fora. Cada informação-personagem tem de ser algo que a criança reconhece num relance (um som, uma foto, letras). "Um clique" ou "um sinal de antena" como personagem confundiria. Fica como dúvida para um N4 (§11).

**Os irmãos:**
- *Central de Entrada e Saída* (019): a criança **liga** aparelhos;
- *Fase de Entrada e Saída* (065): a criança **escolhe 1 de 2** numa bancada parada;
- *Portas do Computador* (este): a criança **deixa a informação atravessar** a parede do computador, nos dois sentidos, pela porta certa.

## 3. Fácil e claro: a régua do usuário

Tudo abaixo é obrigatório e entra na validação ou nas travas (§10).

- **O objetivo numa frase, dito no começo do nível** pela Lily:
  - N1: *"Ajude as informações a ENTRAR no computador pela porta certa!"*;
  - N2: *"Agora ajude as informações a SAIR pela porta certa!"*;
  - N3: *"Agora elas entram E saem!"*.
- **O objetivo continua visível.** No alto do gabinete, uma fileira de **luzes apagadas** mostra quantas informações faltam. Cada acerto acende um lugar, e quando a fileira enche o nível acaba.
- **Uma informação por vez.** Ela chega andando, para na frente das portas e **espera para sempre**. Não há relógio, fila nem pressa.
- **Só o lado da vez fica aceso.** Na entrada, só as portas da esquerda estão coloridas e tocáveis; na saída, só as da direita. O outro lado fica apagado.
- **A informação diz o que é.** Embaixo dela há uma plaquinha: SOM, IMAGEM ou LETRAS. O pedido da pessoa diz o que ela quer, com um ícone: *"Quero OUVIR!"* com uma orelha, *"Quero VER!"* com um olho, *"Quero no PAPEL!"* com uma folha.
- **Toda porta tem o nome escrito**, grande: MICROFONE, CÂMERA, TECLADO, ALTO-FALANTE, TELA, IMPRESSORA.
- **No máximo 3 portas acesas.** Cada nível começa com **2** portas, e a terceira estreia no meio, apresentada sozinha.
- **A primeira vez de cada tipo é guiada.** Um balão mostra a porta certa e explica: *"O SOM entra pelo MICROFONE. Toque nele!"*. Da segunda vez em diante, a criança faz sozinha.
- **A dificuldade vem só da habilidade**: nunca da mira, do tempo ou da leitura. O toque é na porta, que é grande; errar o dedo fora da porta não faz nada.

**Dá para entender sem ler?** Quase tudo. A informação anda até o computador, o aparelho acende, a informação pula para dentro e o lugar vazio lá em cima acende. O que se lê é o nome do tipo e o verbo do pedido, e o 3º ano lê.

## 4. O laço

**Uma ENTRADA (N1, e o primeiro passo do N3):**
```
a informação chega pela esquerda, andando, e para na frente das portas
        │ (portas da esquerda acesas; a da direita, apagadas)
        ▼
a criança toca numa porta-aparelho
  ┌─────────────┴──────────────────┐
porta certa                     porta errada
o aparelho funciona             o aparelho abre, a informação tenta
(o microfone pisca com          entrar e quica para fora, tonta
ondinhas), a informação         "O MICROFONE não pega IMAGEM!"
pula para dentro, anda até      WRONG_ANSWER + lose()
o PROCESSADOR, que acende
        │
        ▼
a luz dela acende no alto do computador · CORRECT_ANSWER
```

**Uma SAÍDA (N2, e o segundo passo do N3):**
```
o processador acende e uma informação sai dele, por dentro,
até o lado direito; lá fora, uma pessoa espera com o pedido
("Quero OUVIR!", com a orelha)
        │ (portas da direita acesas)
        ▼
a criança toca numa porta-aparelho
  ┌─────────────┴──────────────────┐
porta certa                     porta errada
a informação passa pelo         o aparelho faz a coisa errada:
aparelho e vira o que a         a impressora solta a nota de música
pessoa queria: o alto-falante   no papel, e a vovó fica confusa
toca, e a vovó dança            "A vovó queria OUVIR!"
CORRECT_ANSWER                  WRONG_ANSWER + lose()
```

**No N3 os dois laços vêm seguidos na mesma informação.** Ela entra pela esquerda, passa pelo processador e sai pela direita. A pessoa só aparece quando a informação já entrou, para que nunca haja duas perguntas na tela.

## 5. A tela (1280 × 720)

| Região | Caixa / centro | O quê |
|---|---|---|
| HUD | nível + bolinhas em (194, 44); `?` em (1220, 56) | padrão da rodada, sem texto de fase |
| **luzes do objetivo** | faixa escura no alto do gabinete, y 172 | 6 luzes que acendem com a informação dentro |
| **computador (gabinete)** | x 440–840, y 132–692 | PNG; janela de vidro no meio, com o processador em (640, 420) |
| **portas de ENTRADA** | parede esquerda, x ≈ 420, y 250 / 400 / 550 | moldura azul + aparelho + nome |
| **portas de SAÍDA** | parede direita, x ≈ 860, mesmas alturas | moldura laranja + aparelho + nome |
| **calçada da esquerda** | a informação para em (260, 470) | a plaquinha do tipo fica embaixo dela |
| **calçada da direita** | a pessoa fica em (1080, 470), com o balão do pedido em (1080, 250) | só no N2 e no N3 |
| faixa do erro | (640, 360), grande | o motivo, antes do `lose()` |

**Câmera.** O zoom com Sine.easeInOut, que o usuário pediu na versão anterior e aprovou, continua, mas curto (~500 ms). Ele aproxima a porta quando a informação atravessa e o processador quando ele acende, depois volta. O HUD some no close, e o tutorial só aparece no plano aberto.

**Teclado:**
- `1`, `2`, `3` tocam as portas acesas, de cima para baixo;
- `Espaço` ou `Enter` respondem o balão;
- `H` repete a ajuda.

## 6. Personagens, portas e níveis

### As informações (quem entra)

| Personagem | Tipo (plaquinha) | Porta de entrada |
|---|---|---|
| **Notinha** (nota musical lilás) | SOM | MICROFONE |
| **Fotinho** (foto com uma paisagem) | IMAGEM | CÂMERA |
| **Letrinha** (pecinha creme; o código escreve "A") | LETRAS | TECLADO |

### As pessoas (quem recebe)

| Pessoa | Pode pedir |
|---|---|
| **Vovó Rosa** | OUVIR · VER · PAPEL |
| **Theo** (amigo da Lily) | OUVIR · VER · PAPEL |
| **Professora Bia** | OUVIR · VER · PAPEL |

A pessoa **não** decide a resposta. O **pedido** decide, e cada pessoa pede coisas diferentes ao longo do jogo. Assim a criança não decora "vovó = alto-falante".

### As missões (`data/levels.ts`)

| Nível | # | Quem | Pede | Porta certa | Guiada? |
|---|---|---|---|---|---|
| 1 | 1 | Notinha | — | MICROFONE | sim (tutorial) |
| 1 | 2 | Fotinho | — | CÂMERA | sim |
| 1 | 3 | Notinha | — | MICROFONE | — |
| 1 | 4 | Letrinha | — | TECLADO (**estreia**) | sim |
| 1 | 5 | Fotinho | — | CÂMERA | — |
| 1 | 6 | Letrinha | — | TECLADO | — |
| 2 | 1 | Notinha → Vovó | OUVIR | ALTO-FALANTE | sim |
| 2 | 2 | Fotinho → Theo | VER | TELA | sim |
| 2 | 3 | Notinha → Professora | OUVIR | ALTO-FALANTE | — |
| 2 | 4 | Fotinho → Vovó | PAPEL | IMPRESSORA (**estreia**) | sim |
| 2 | 5 | Letrinha → Professora | VER | TELA | — |
| 2 | 6 | Letrinha → Theo | PAPEL | IMPRESSORA | — |
| 3 | 1 | Notinha → Theo | OUVIR | MICROFONE → ALTO-FALANTE | — |
| 3 | 2 | Fotinho → Professora | PAPEL | CÂMERA → IMPRESSORA | — |
| 3 | 3 | Letrinha → Vovó | VER | TECLADO → TELA | — |
| 3 | 4 | Fotinho → Theo | VER | CÂMERA → TELA | — |

**Notas:**
- N1 e N2 têm **6** missões curtas (cerca de 6 s cada), porque 3 delas são guiadas;
- no N3 cada missão tem dois passos, então são **4**;
- no N2, o pedido sempre combina com a informação: ninguém pede para OUVIR uma foto. Pedir PAPEL de uma foto ou de letras é natural;
- o N2 também mostra a porta de entrada, mas apagada: a informação já está lá dentro.

**`validateLevels` no import** (`console.error` em dev):
- a porta certa sai do **tipo** (entrada) e do **pedido** (saída), pelas tabelas acima;
- cada nível começa com 2 portas, e a terceira estreia uma vez só, com o balão;
- toda primeira vez de um tipo ou de um pedido é guiada;
- a mesma porta não se repete 3 vezes seguidas;
- no N3, cada par (entrada, saída) é diferente;
- N1 e N2 têm 6 missões, e o N3 tem 4.

## 7. O tutorial (N1, uma vez) e as estreias

`createTutorial`, uma frase por balão, com recorte e sem mãozinha:

| # | Recorte | Frase | Botão |
|---|---|---|---|
| 0 | — | a Lily, em close: *"Ajude as informações a ENTRAR no computador pela porta certa!"* | Vamos lá! |
| 1 | o computador | *"Este é o computador. Os aparelhos ficam ligados nas portas dele."* | Próximo |
| 2 | a Notinha + a plaquinha | *"Chegou uma informação do mundo lá fora: um SOM."* | Próximo |
| 3 | o MICROFONE | *"O SOM entra pelo MICROFONE. Toque nele!"* | — (espera o toque; só o microfone responde) |
| 4 | os lugares do objetivo | *"Ela entrou! Encha todos os lugares."* | Vamos jogar! |

**Estreias guiadas.** Na primeira Fotinho (*"A IMAGEM entra pela CÂMERA. Toque nela!"*) e na primeira Letrinha (*"As LETRAS entram pelo TECLADO."*), a porta nova aparece com um pulo e o balão espera o toque nela.

**N2:**
- abertura: a Lily diz *"Agora ajude as informações a SAIR pela porta certa!"*;
- primeiro balão: *"A vovó quer OUVIR. O som SAI pelo ALTO-FALANTE. Toque nele!"*;
- os pedidos VER e PAPEL estreiam do mesmo jeito.

**N3:** um balão só: *"Agora a informação ENTRA, passa pelo processador e SAI."*

## 8. O erro

**Porta de entrada errada:** a porta abre, a informação pula, bate e volta tonta. Aparece a faixa grande *"O MICROFONE não pega IMAGEM!"* (o aparelho tocado + o tipo). Depois, `WRONG_ANSWER` + `lose()`.

**Porta de saída errada:** a informação passa pelo aparelho errado, e ele faz a coisa errada com ela:
- a impressora imprime a nota de música;
- a tela mostra a nota em silêncio;
- o alto-falante chia.

A pessoa fica confusa, e a faixa diz *"A vovó queria OUVIR!"*. Depois, `WRONG_ANSWER` + `lose()`.

**Não é erro:** tocar fora das portas, na porta apagada, na informação ou na pessoa.

Sem vermelho e sem som áspero: um "blom" grave curto.

## 9. O acerto e o fim

**Acerto:**
- o aparelho funciona com som próprio:
  - o microfone faz ondinhas;
  - a câmera faz flash;
  - o teclado bate as teclas;
  - o alto-falante solta notas;
  - a tela mostra a foto;
  - a impressora solta a folha;
- a informação (ou a pessoa) pula de alegria;
- o lugar do objetivo acende;
- `CORRECT_ANSWER`.

**Fim do nível:**
1. a Lily volta em close e agradece (*"O computador conversou com o mundo todo!"*);
2. aparece o quadro com uma linha por missão: [informação] → [porta] (→ [porta] no N3);
3. confete e `showLevelComplete`.

## 10. Travas para quem mexer depois

- Uma informação por vez, sem relógio. Esperar nunca é erro.
- Só as portas do lado da vez ficam acesas e tocáveis.
- A porta certa vem do **tipo** (entrada) ou do **pedido** (saída), nunca da pessoa nem de cor. Todas as portas de um lado têm a mesma moldura.
- A primeira vez de cada tipo e de cada pedido é guiada.
- Todo aparelho tem o nome escrito.
- A cena do erro vem antes do `lose()`.
- O tutorial só aparece no plano aberto.

## 11. Dúvidas

1. **Nome e slug.** Proponho o título **Portas do Computador** e o slug `portas-do-computador`, no id 110. Na hora do código:
   - a pasta `pinball-de-entrada-e-saida` (código e assets) sai;
   - a entrada do catálogo, as `gameInstructions` e o `GameDetailsPage` trocam de slug;
   - aparelhos, peças e Lily são copiados para a pasta nova.
2. **Um N4 com mouse, sensor e antena?** Fica fora por clareza (§2). Só entra se você quiser.

## 12. Arquivos

**Código** (`src/games/EF03CO06/portas-do-computador/`):
- `types.ts`, `index.ts`;
- `data/{levels,words,layout,theme,files}.ts`;
- `scenes/BootScene.ts` e `scenes/GameScene.ts` (estado `mode` único, `gen`, bridge como na Praia);
- `scenes/{computer,doors,info,banner,kid,finale,hud,guide,audio,art,fallback}.ts`.

Do Pinball aproveita-se:
- a Lily em close com o fundo escurecido (`kid.ts`);
- a câmera `frame()` com ease in-out;
- o HUD que some no close;
- `guide`, `audio` e `finale`.

**Texturas** (prompts no [TEXTURAS.md](./TEXTURAS.md), linha **chibi voador** `35`):

| Arquivo | Situação |
|---|---|
| `aparelhos.png`, `pecas.png`, `lily.png` | **já existem**; vêm do Pinball |
| `bg-mundo.png` | novo: rua e jardim de dia, com o centro calmo |
| `computador.png` | novo: o gabinete, com a janela de vidro e o encaixe do processador vazio |
| `informacoes.png` | nova: Notinha, Fotinho e Letrinha em 4 poses |
| `pessoas.png` | nova: Vovó, Theo e Professora em 3 poses |
| `pedidos.png` | nova: orelha, olho e folha (os ícones do pedido) |
| `cover-portas-do-computador.png` | nova, com o título |

**Antes da arte:** o jogo roda com arte de reserva em `Graphics`, nas mesmas folhas e grades, para o PNG entrar sem código novo.

## Histórico

- **06/10/2026** — ideia escolhida entre três (Portas do Computador, Casa que Percebe e Esteira dos Aparelhos), depois de o Pinball ser reprovado três vezes. A régua do usuário, *"o mais fácil possível de se jogar e claro com seu objetivo"*, virou o §3. O histórico do Pinball está em `../pinball-de-entrada-e-saida/PLANEJAMENTO.md` até a pasta sair.
- **06/10/2026** — **N1 feito em `Graphics`** (pedido: *"faça o jogo, use Graphics, textura eu mando depois. apenas n1"*):
  - aparelhos, peças e Lily vêm dos PNGs do Pinball, copiados para `src/assets/games/EF03CO06/portas-do-computador/`;
  - fundo, casinha e informações são arte de reserva nas mesmas chaves e grades do TEXTURAS;
  - o catálogo (id 110), `gameInstructions` e `GameDetailsPage` passaram para o slug `portas-do-computador`;
  - o `levels.ts` só tem o N1, e o N2/N3 continuam planejados (§6);
  - conferido no navegador: Lily na abertura; tutorial (casinha → Notinha → microfone, com só a porta certa respondendo → lugares); as 6 missões, com a câmera e o teclado guiados na estreia; os 6 lugares cheios; Lily no fim; o quadro dos caminhos; a porta errada (a Notinha bate, volta tonta, *"A CÂMERA não pega SOM!"*, `WRONG_ANSWER`).
- **06/10/2026** — **a casinha virou o computador.** O usuário: *"a 'casinha' não era pra ser o computador? o jogo está fugindo do contexto."* Metáfora em cima de metáfora afasta da habilidade. Agora:
  - no meio fica um **gabinete de verdade**, com janela de vidro mostrando a placa e o processador;
  - os aparelhos ficam à esquerda, ligados por **fio na porta** do gabinete;
  - a informação pula no aparelho, uma luz corre pelo fio, e ela aparece **dentro** do computador, ao lado do processador;
  - o objetivo virou as **6 luzes** no alto do gabinete.

  Código: `scenes/computer.ts` (era `house.ts`), a folha é `computador.png` (era `casinha.png`), e o prompt foi trocado no TEXTURAS (§4 e a capa). Onde este plano ainda disser "porta", leia "aparelho ligado na porta". Conferido: o N1 inteiro de novo, com as 6 luzes acesas.
