# Mergulho da Pesquisa — planejamento

_EF03CO07 · 3º ano · Cultura Digital · slug `mergulho-da-pesquisa`_
Documento irmão: [TEXTURAS.md](./TEXTURAS.md) · Ficha: `docs/rodada-3/EF03CO07.md`

## 0. A ideia, e o que muda em relação à ficha

A ficha repetia o núcleo dos dois irmãos (escolher palavras, ver resultados, filtrar, escolher o
certo). O usuário pediu outra ideia em 06/10/2026: *"o jogador explorar o mar, daí vai revelando os
lugares conforme explora. Será que dá pra fazer combinar com a skill?"* Dá, como metáfora:

> **O mar escuro é a internet. O submarino é o navegador. O sonar é a ferramenta de busca.**

O mar está escuro e cheio de lugares (naufrágios, grutas, recifes, baús), e cada lugar guarda uma
informação: uma foto, um vídeo, um texto, um desenho. Dá para **explorar à mão**: o submarino vai
aonde a criança toca, e o farol revela só o que está em volta. Mas o mar é grande e o ar é pouco.
O jeito rápido é **pesquisar**: tocar nas fichas-palavra do sonar faz uma onda varrer o mar e
**acender só os lugares que combinam** com todas as palavras. Aí o submarino vai até um lugar aceso
(**acessar**), abre o achado e, se for o pedido, **entrega**.

| Ficha | Aqui | Por quê |
|---|---|---|
| a tela "desce" e 3 achados sobem em bolhas | o **mar inteiro** fica na tela, no escuro; a busca acende os lugares onde estão os achados | pedido do usuário (explorar e revelar); a busca vira um mapa |
| tocar no achado certo entrega | é preciso **ir até** o lugar aceso (acessar) e abrir o achado; só então ENTREGAR | "pesquisar **e acessar** informações" vira dois gestos diferentes |
| explorar não existia | **explorar à mão** existe e funciona, mas é lento e gasta ar | mostra por que se usa uma ferramenta de busca |
| botão de mergulhar depois de escolher as fichas | cada toque numa ficha já faz o sonar pingar de novo | menos botões; a busca reage na hora, como num buscador |
| fichas certas com brilho sutil (N1); após 2 travas a ficha pisca | **nada brilha** antes da resposta | o brilho entregava a resposta ([[decisao-sem-pista-que-entrega]]) |
| TRAVA com cadeado no cartaz, +5 | **errou, perdeu**: entregar o achado errado, ou o ar acabar | padrão da rodada ([[errou-bloqueia]]) |
| trocar de sonar = outro navegador | trocar de **submarino** = outro navegador: o painel muda de cara, a busca e os achados são os mesmos | separa navegador (o veículo) de ferramenta de busca (o sonar) |

Fica da ficha: o pedido do cliente no cais, as fichas-palavra, os achados engraçados de busca vaga
(pelúcia e chinelo de tucano), o filtro de tipo no N3, o mural de cartazes e o letreiro-síntese.

## 1. A habilidade

> **(EF03CO07)** Utilizar diferentes navegadores e ferramentas de busca para pesquisar e acessar
> informações.

| Parte | Onde acontece |
|---|---|
| ferramentas de busca | o sonar: fichas-palavra (todas as palavras precisam combinar) e, no N3, o filtro de tipo |
| pesquisar | escolher e combinar palavras; palavra larga acende muitos lugares, palavra a mais acende menos, palavra que não combina não acende nada |
| acessar informações | levar o submarino até um lugar aceso e abrir o achado |
| diferentes navegadores | no N3, o submarino amarelo dá lugar ao azul: painel com outra cara, mesmo mar, mesmos achados |

**Teste da bolinha** (troque os achados por bolinhas: o jogo morre?): morre. A criança precisa ler
o pedido ("FOTO de tucano") e reconhecer, no achado aberto, o assunto e o tipo: foto (moldura de
polaroide), desenho (papel com giz), vídeo (telinha com fita), texto (página com linhas), objeto
(pelúcia, chinelo, boia, maquete).

## 2. Os irmãos

| Jogo | Decisão |
|---|---|
| Detetives da Busca (021) | escolher palavras e filtro; o mural reage; tocar no cartão que responde |
| A Busca do Bibliotecário (064) | refinar uma busca vaga até o resultado certo subir para o 1º lugar |
| **Mergulho da Pesquisa** | **explorar × pesquisar**: o sonar acende lugares num mapa escuro; ir até lá (acessar) e entregar; navegador ≠ buscador |

## 3. O jogo em 1 frase

O mar da internet é escuro e enorme: use o sonar com as palavras certas para acender só os
lugares que guardam o que o cliente pediu, mergulhe até lá com o submarino e entregue o achado.

## 4. Como joga (uma fase = um pedido)

1. **O pedido.** No cais, o cliente pede num balão: *"Preciso de uma FOTO de tucano!"*. O mar está
   escuro; só o cais e um pedacinho de água em volta do submarino aparecem.
2. **Explorar (sempre possível).** Tocar no mar escuro leva o submarino até lá. O farol revela um
   círculo em volta do caminho, e o que foi revelado **fica revelado**. Lugares revelados mostram a
   plaquinha do achado (miniatura). Cada viagem gasta **1 bolha de ar**.
3. **Pesquisar (de graça).** Tocar numa ficha-palavra do painel do sonar liga ou desliga a palavra.
   A cada toque o sonar pinga: uma onda varre o mar e **acendem** (anel brilhando + plaquinha) os
   lugares cujo achado combina com **todas** as palavras ligadas. O contador do sonar diz quantos
   acenderam. Nenhum aceso = "Nada encontrado." Pesquisar não gasta ar.
4. **Acessar.** Tocar num lugar aceso (ou revelado) leva o submarino até ele (1 bolha) e abre o
   achado grande, num cartão: a figura e o tipo dela. Botões **ENTREGAR** e **VOLTAR**.
5. **Entregar.**
   - **Certo:** o submarino sobe até o cais, o achado vira cartaz no mural do cliente, ele
     comemora. A bolinha da fase acende.
   - **Errado:** o cliente aponta a diferença no balão ("Pedi FOTO, isso é desenho!"). É o erro.
6. **O ar acabou** (todas as bolhas): o submarino sobe sem nada. Também é o erro.

## 5. Erro

**Errou, perdeu** (`WRONG_ANSWER` + `lives.lose()`, uma vez), em dois casos:

| Erro | O que a criança vê | Balão do cliente |
|---|---|---|
| entregar o achado errado | o achado vai para o cartaz e o cliente faz careta | diz o que faltou: "Pedi FOTO, isso é desenho!" · "Esse tucano não está voando!" · "Pedi um VÍDEO!" |
| o ar acabar | a última bolha estoura, o submarino sobe | "Acabou o ar! Use o sonar." |

**De graça:** pesquisar (ligar/desligar fichas, filtro), busca sem resultado, abrir um achado e
VOLTAR (só gasta a bolha da viagem), tocar no cais ou no painel fora dos botões.

**Ar por fase:** 5 bolhas. Com a busca certa bastam 1 ou 2 viagens; explorando à mão, quase nunca dá.

## 6. Níveis

Um nível, um assunto ([[um-nivel-um-assunto]]). Cada nível tem **3 fases** (3 pedidos, 3
clientes). O mar de cada fase tem **10 lugares**: os achados do assunto do pedido e outros de
assuntos diferentes, embaralhados.

| Nível | Pedidos | Painel do sonar | Assunto (o que estreia) |
|---|---|---|---|
| **N1 — Palavra certa** | 1 refinamento: FOTO de tucano · VÍDEO de vulcão · TEXTO sobre baleia | 4 fichas (assunto, tipo certo, 2 distratoras) | explorar × pesquisar; palavra larga acende muito, palavra a mais filtra |
| **N2 — Mais palavras** | 2 refinamentos: FOTO de tucano VOANDO · VÍDEO de vulcão em ERUPÇÃO · TEXTO sobre FILHOTE de baleia | 6 fichas (2 distratoras) | combinar três palavras; palavra que não combina zera |
| **N3 — Filtros e navegadores** | pedidos do N2 com outro assunto à frente | 4 fichas + **filtro de tipo** (FOTO / VÍDEO / TEXTO); nas fases 2 e 3, **troca de submarino** no meio | o tipo vira filtro; outro navegador, mesma busca |

**Os achados** (`data/finds.ts`, cada um com assunto, tipo e palavras):

| Assunto | Achados |
|---|---|
| tucano | foto de tucano · foto de tucano voando · foto de tucano de perto · desenho de tucano · tucano de pelúcia · chinelo de tucano · vídeo de tucano · texto sobre tucano |
| vulcão | vídeo de vulcão em erupção · vídeo de vulcão parado · foto de vulcão · maquete de vulcão · desenho de vulcão · texto sobre vulcão |
| baleia | texto sobre baleia · texto sobre filhote de baleia · foto de baleia · foto de baleia pulando · vídeo de baleia pulando · boia de baleia · desenho de baleia |

**A busca** (`search(words, filter)`): acende o achado se cada palavra ligada está nas palavras dele
e, no N3, se o tipo bate com o filtro. A conta que acende é a mesma que a validação usa.

**Validação** (`validateLevels`):
- todo pedido tem **exatamente um** achado que o atende no mar da fase;
- a combinação certa de fichas acende **só** esse achado; a ficha do assunto sozinha acende ≥ 3;
- toda ficha distratora, junto com as certas, zera ou acende só achados errados (nunca o certo);
- ≤ 6 fichas; ≤ 10 lugares; lugares sem sobreposição e dentro do mar;
- o achado certo nunca fica no círculo inicial do farol (tem de ser pesquisado ou explorado);
- com 5 bolhas, ir direto ao certo sempre cabe (≥ 1 viagem de folga).

## 7. Tela (1280 × 720)

```
┌─────────────────────────────────────────────────────────── HUD ─┐
│ [Nível ● ○ ○]                      ○○○○○ ar                 (?) │
│ ┌cais┐  cliente + balão do pedido                                │
│ │ 🚢 │~~~~~~~~~~~~~~~~~~ superfície ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~│
│ └────┘   (escuro)   ◉ lugar aceso    (escuro)      ◉            │
│          (escuro)        ◌ revelado        (escuro)              │
│ ════════════════════════ fundo de areia ═════════════════════════│
│ [SONAR 3 achados] [tucano] [foto] [desenho] [pelúcia] [FOTO|VÍDEO|TEXTO]│
└──────────────────────────────────────────────────────────────────┘
```

- **Cais** no alto à esquerda (x 0–260, y 90–250), com o cliente e o submarino atracado.
- **Mar** de x 0 a 1280, y 250 a 590: 10 lugares, cada um com ~100 px.
- **Escuro** (`RenderTexture` preta a ~88 %): o farol apaga círculos de ~110 px no caminho.
- **Painel do sonar** (y 600–720), em `Graphics`: o contador, as fichas (~150 × 56) e, no N3, os 3
  filtros. Com o submarino azul, o painel muda de cara (cor, forma das fichas e lugar dos filtros);
  as mesmas palavras fazem o mesmo.
- **Ar**: 5 bolhas no alto, no meio.

**Regiões tocáveis:** o mar (viajar/acessar), as fichas, os filtros e o cartão do achado aberto
(que cobre o resto). Fichas + filtros chegam a 7 no N3, mas ficam numa fileira só, como teclas.

## 8. Tutorial (createTutorial, uma frase por balão, sem mãozinha)

Véu escuro com recorte, contorno amarelo e anel pulsando no ponto citado.

**N1** (primeira vez), na fase 1:
1. *(recorte: cliente)* o balão do pedido escreve "Preciso de uma FOTO de tucano!" — Próximo
2. *(recorte: mar)* "O mar é enorme e escuro. Toque para explorar." → **treino**: uma viagem
   (gasta 1 bolha, revela um pedaço)
3. *(recorte: painel)* "O sonar acha mais rápido. Toque em TUCANO." → treino → 4 lugares acendem
4. "Muitos! Junte mais uma palavra." → a criança liga FOTO → 1 lugar fica aceso
5. *(recorte: lugar aceso)* "Vá até lá e abra." → treino
6. *(recorte: cartão)* "É o que pediram? Entregue!" — Ok

**N2:** "Agora são três palavras." *(recorte: painel)* — Ok.
**N3:** *(recorte: filtros)* "O tipo virou filtro." — Ok. Na troca: *(recorte: submarino azul)* "Outro
navegador! O sonar funciona igual." — Ok.

O `?` repete: "Toque nas palavras: o sonar acende o que combina." → "Vá até o lugar aceso e abra." →
"Entregue só o que foi pedido." — Continuar.

## 9. Fim do nível

O submarino atraca e o **mural do cais** desce com os 3 cartazes entregues e o selo de
mergulhador-pesquisador. Um cliente diz o letreiro-síntese: **"Palavra certa + tipo certo = achado
certo, em qualquer navegador!"** Depois, `showLevelComplete` (autoAdvance no N1 e N2; JOGAR DE
NOVO no N3).

## 10. Textos (`data/words.ts`)

| Onde | Texto |
|---|---|
| pedidos N1 | Preciso de uma FOTO de tucano! · Quero um VÍDEO de vulcão! · Me traz um TEXTO sobre baleia? |
| pedidos N2/N3 | FOTO de tucano VOANDO! · VÍDEO de vulcão em ERUPÇÃO! · TEXTO sobre FILHOTE de baleia! |
| sonar | {n} achados · 1 achado · Nada encontrado. |
| erro: tipo | Pedi FOTO, isso é desenho! · Pedi um VÍDEO! · Pedi um TEXTO! |
| erro: detalhe | Esse tucano não está voando! · Esse vulcão está parado! · Essa baleia não é filhote! |
| erro: assunto | Isso nem é tucano! |
| erro: ar | Acabou o ar! Use o sonar. |
| acerto | Era isso! Obrigado! |
| síntese | Palavra certa + tipo certo = achado certo, em qualquer navegador! |
| troca | Outro navegador! O sonar funciona igual. |

## 11. Arte

Linha **Muse Dash** (as três referências em toda geração), escolhida pelo usuário em 06/10/2026.
Cinco arquivos (TEXTURAS); lugares, achados, submarinos e clientes chegaram em 06/10/2026, falta a
capa. **O mapa é todo em `Graphics`**, a pedido do usuário: céu, mar, areia, cais e a pedra montada
em pedaços, um mapa diferente por fase.

| PNG | `Graphics` |
|---|---|
| 8 tipos de lugar, 21 achados, 2 submarinos × 2 quadros + bolha de ar, 3 clientes × 4 poses, capa | o mapa (pedra em pedaços, cais, céu, mar, areia), escuro e farol, onda do sonar, anel e plaquinha dos lugares acesos, painel do sonar nas 2 caras, fichas e filtros, cartão do achado aberto, balões, HUD, mural do fim |

## 12. Plataforma

`GAME_READY` → `CHECKPOINT` (fases / 3) → entrega certa = `CORRECT_ANSWER` (+10) → erro =
`WRONG_ANSWER` (−5) + `lives.lose()` → fim = `GAME_COMPLETED` + tela própria
(`GAMES_WITH_IN_GAME_COMPLETION_SCREEN`). Telemetria da ficha: pings até a entrega, viagens, uso de
refinamento e de filtro, fase com troca de navegador.

## 13. Arquivos

```
types.ts · index.ts
data/  files.ts layout.ts finds.ts (achados e search) levels.ts maps.ts (os 3 mapas, colisão, caminho) theme.ts words.ts
scenes/ BootScene.ts GameScene.ts fallback.ts
        world.ts (fundo, escuro, farol, lugares, acender) rocks.ts (pedra assada) sub.ts (pilotar, colisão)
        sonar.ts (painel, fichas, filtros, onda) controls.ts overlay.ts arrows.ts bake.ts
        card.ts (achado aberto) client.ts (cais, pedido, mural) hud.ts guide.ts audio.ts ui.ts
```

## 14. Decisões e dúvidas

**Decididas (régua "simples e claro"):**
- o mar cabe numa tela (sem câmera), para o celular;
- pesquisar é de graça e reage a cada toque; só viajar gasta ar;
- o lugar aceso já mostra a miniatura do achado (como a lista de resultados), mas só dá para
  entregar depois de ir até lá e abrir;
- nada brilha antes da resposta; o brilho dos lugares acesos é a **consequência** da busca.

**Dúvidas (não seguram o TEXTURAS):**
1. **O ar acabar perde a partida?** Planejei que sim (5 bolhas, sobra folga). A outra saída é o
   submarino subir e o mar escurecer de novo, sem perder.
2. **Quantos níveis fazer agora?** O plano tem os três.
3. **Mar maior que a tela** (com câmera que acompanha o submarino) daria mais sensação de
   exploração, mas no celular os lugares ficam menores ou fora da vista. Ficou de fora.

## 15. Histórico

- 06/10/2026 — planejado. A ficha repetia os irmãos; a ideia de explorar o mar e revelar lugares
  veio do usuário e virou a metáfora mar = internet, submarino = navegador, sonar = busca. Arte
  Muse Dash.
- 06/10/2026 — **N1 feito** (id 109), a pedido ("faça só n1, use Graphics por enquanto"), com toda a
  arte em `Graphics` nas mesmas chaves e grades do TEXTURAS (`scenes/fallback.ts`). A dúvida 1 ficou
  como no plano: o ar acabar encerra a partida. Mudanças em relação ao plano, ao construir:
  - **3 bolhas de ar** (não 5) e o lugar aceso **não mostra a miniatura** do achado, só o lugar com
    o anel: com 5 bolhas e miniatura, dava para achar o certo sem refinar a busca. Agora "tucano"
    acende 4 lugares iguais aos olhos, e quem decide é juntar a palavra do tipo;
  - **9 lugares** por mar (5 no fundo, 4 em cima de pilares de pedra);
  - o cartão do achado traz o **título** (como um resultado de busca: "Desenho de tucano"), e o
    pedido do cliente continua visível por cima do véu enquanto o cartão está aberto;
  - o tutorial ganhou o passo "Cada viagem gasta uma bolha de ar." depois da primeira exploração.
  Testado no navegador: tutorial inteiro (explorar, TUCANO acende 4, + FOTO acende 1, ir, entregar),
  as 3 fases até o mural, erro de entrega ("Pedi FOTO, isso é desenho!") e ar acabando.
- 06/10/2026 — **refeito como jogo de exploração.** O usuário jogou o N1 e disse: *"o jogo tá muito
  bugado. Eu tava esperando um jogo onde o jogador controla o submarino, e vai explorando o mapa. E
  coletando informações, com joystick, boost, etc."* Perguntado, escolheu: encostar no achado e
  pegar ali mesmo; ar que acaba (com bolhas para recarregar); mapa de **4 × 3 telas com
  minimapa**; sonar que mostra **setas na borda** da tela. O que ficou:
  - **mundo de 5120 × 2160** com a câmera seguindo o submarino; céu e cais no alto à esquerda,
    mar em degradê, fundo de areia com pedras e algas, lugares no fundo e em cima de pilares;
  - **pilotar**: joystick no canto de baixo à esquerda (ou setas/WASD), **BOOST** no canto direito
    (ou espaço): 1 s mais rápido, 1,4 s de recarga, gasta mais ar. Inércia leve;
  - **névoa**: o farol revela um círculo em volta do submarino e o que foi visto fica visto; o
    **minimapa** (alto à direita) mostra o que já foi explorado e onde está o submarino;
  - **ar**: barra no alto, abaixo do pedido; desce com o tempo (≈ 45 s), mais rápido no boost;
    bolhas espalhadas devolvem ar, e o cais recarrega. Acabou, perde;
  - **sonar**: fichas-palavra embaixo; cada toque pinga, acende os lugares que combinam com todas
    as palavras e põe **setas nas bordas** apontando para eles. "tucano" dá 4 setas; "tucano +
    foto", uma só;
  - **pegar**: encostar num lugar abre o cartão do achado (título e figura) com **PEGAR** e
    **DEIXAR**. Pegar o certo leva o submarino de volta ao cais e o cliente agradece; pegar o errado
    perde. DEIXAR afasta o submarino e segue a exploração;
  - o **pedido** fica sempre visível no alto da tela;
  - tutorial (uma frase por balão, sem mãozinha): pedido → arraste para pilotar (treino) → BOOST
    (treino) → o ar → TUCANO (treino) → junte FOTO (treino) → "Siga a seta e encoste no achado" →
    no primeiro cartão, "É o pedido? Então PEGUE!". No tutorial o ar não desce e pegar o errado
    só é recusado.
  Testado no navegador: tutorial inteiro, pilotar, boost, setas, cartão, as 3 fases até o mural,
  pegar o errado e o ar acabando.
- 06/10/2026 — *"o jogo tá congelando do nada, e veja se parece alinhado com a habilidade"*:
  - **desempenho**: o fundo do mundo e a interface eram `Graphics` vetoriais recalculados a cada
    quadro (~8,6 ms no computador). Viraram imagens assadas uma vez (degradê em textura de
    canvas, faixas repetidas, painel, fichas, joystick, BOOST, moldura do minimapa, barra de ar
    com retângulo). Caiu para ~3 ms. Teste de 21 s pilotando sem erro nem travada;
  - **a derrota parecia travamento**: no `GAME_OVER` a plataforma congela o jogo, e o único sinal
    era o pedido ficar vermelho. Agora há aviso de pouco ar (o pedido vira "Pouco ar! Pegue bolhas
    ou volte ao cais.") e um aviso grande no centro com o motivo ("Acabou o ar!" / "Não era
    esse!") antes do congelamento;
  - **alinhamento** (EF03CO07): busca, refinamento, acessar e avaliar estão no N1; "diferentes
    navegadores" segue só no N3 planejado. O usuário escolheu aplicar **"só abre o que a busca
    achou"**: lugar que o sonar não acendeu fica lacrado ("Use o sonar para ver o que tem aqui!",
    o lugar balança e o submarino recua). Explorar continua servindo para navegar e pegar ar, mas
    acessar a informação exige pesquisar. Os outros ajustes oferecidos (ar acabar não perder,
    abrir achado gastar ar, outro navegador já no N1) ficaram de fora.
- 06/10/2026 — *"texturas adicionadas. Não coloquei bg-mar e não vejo por que pôr. Você mesmo pode
  fazer o mapa por Graphics … uma textura de pedra onde você poderá construir os pedaços (não quero
  de tile), ou você mesmo pode fazer tudo no Graphics. Cada nível deve usar um mapa diferente."*
  - **folhas**: lugares e submarinos vieram em 2048 × 1024 (células de 512) e foram reduzidas para
    256; achados e clientes tinham peças vazando para a célula vizinha e foram reempacotados por
    componentes. Os clientes ficaram na grade de **350** (como vieram; o usuário avisou) e os
    originais estão em `outputs/mergulho-da-pesquisa/`. `leito.png` e `cais.png` saíram do plano;
  - **mapa em pedaços**, todo em `Graphics` e assado uma vez por peça (`data/maps.ts`,
    `scenes/rocks.ts`): cada pedra é um polígono irregular com contorno índigo, face clara em cima e
    rachaduras; montes, colunas com prateleira, ilhas flutuantes, tetos de caverna com estalactites e
    paredões. Algas, corais, cristais, estrelas e conchas nascem só no topo exposto da pedra, longe dos
    lugares. **O submarino bate na pedra** (empurrão para fora dos círculos de cada pedra, sem
    atravessar), e o minimapa mostra a pedra já revelada;
  - **um mapa por fase**, cada um com cor própria: *jardim* (lavanda, aberto, para o tutorial),
    *cavernas* (violeta, um teto de pedra com três passagens separa o mar de cima da caverna de
    baixo) e *desfiladeiro* (coral, dois paredões e duas ilhas grandes). Cada mapa traz 12 lugares e
    8 bolhas de ar; a fase usa 9 lugares;
  - **validação** (`validateMaps` + `validateLevels`): pedra ≤ 2048 px, lugar não enterrado nem
    flutuando, todo lugar e bolha alcançável pelo submarino (Dijkstra numa grade de 40 px com o raio
    do submarino), e o ar até o achado certo medido pelo **caminho**, não em linha reta;
  - **o farol ficou macio**: a névoa era apagada todo quadro e a borda endurecia; agora cada
    pedaço de 48 px é carimbado uma vez com pincel de borda suave (raio de luz 200 → 260). Isso também
    deixou o quadro mais leve (~1,7 ms);
  - **subir ao cais** não atravessa mais a pedra: o submarino some em bolhas e reaparece no cais.
  Testado no navegador: colisão (para e desliza na parede), as 3 fases com os 3 mapas até o fim,
  cartão com a arte nova, sem erro.
- 06/10/2026 — ícones das fichas do sonar: o usuário pediu *"um prompt que gera um spritesheet, onde
  cada ícone representa o que o filtro vai filtrar"* (eu tinha feito 17 prompts soltos; trocado).
  TEXTURAS §9: `filtros.png`, 4 × 5 células de 256, 17 ícones na ordem de `FILTER_FRAME`
  (`data/files.ts`). A palavra continua escrita embaixo do ícone. Ícone de tipo usa a forma do
  achado sem assunto dentro; ícone de assunto não tem moldura; ícone de detalhe não tem bicho — para
  o ícone não entregar o achado. As fichas do painel ficam mais altas quando a folha chegar.
- 06/10/2026 — *"textura dos filtros adicionada. Ajuste a interface, mapa, e troque o sistema de
  iluminação: o jogador vai iluminando o MAPA, que fica permanentemente revelado, e no ambiente ainda
  fica escuro. O mapa será o ponto de ajuda quando tiver em labirintos, e aumente um pouquinho o
  tamanho do mapa"*:
  - `filtros.png` recentrada por peças (originais em `outputs/`); as fichas do sonar viraram cartões
    de 132 × 110 com o **ícone em cima e a palavra embaixo** (sem a folha, volta a ser só palavra);
    o painel subiu para 128 px de altura;
  - **luz**: o mar é escuro sempre; só o farol do submarino clareia, e o escuro volta quando ele
    passa (camada de escuridão na tela, redesenhada a cada quadro em 1/8 de resolução). Perto da
    superfície a luz do dia entra um pouco. Lugares acesos pelo sonar e bolhas de ar aparecem por
    cima do escuro;
  - **mapa (minimapa)**: maior (300 × 127, na proporção do mundo), no canto direito abaixo do "?";
    guarda para sempre o que o farol já mostrou: pedra (clara com contorno), lugares, bolhas
    restantes; os achados acesos aparecem como anéis amarelos mesmo no que não foi visto. Novo passo
    no tutorial ("O mapa guarda o que você já viu e mostra o achado aceso.") e na ajuda ("Perdido no
    escuro? Olhe o mapa.");
  - as setas da borda desviam do mapa. ~2,7 ms por quadro.
- 06/10/2026 — pedidos do usuário: tutorial "não prossegue", voltar ao cais sozinho, tirar o "Sonar
  pronto", bolhas sem brilho (marcadas no mapa, com ondinhas fracas) e **N2/N3**:
  - **tutorial**: não reproduzi travamento com o relógio andando; o que travava era o pane do
    navegador do app com o relógio adiantado pelos meus testes (recarregar a página ao terminar).
    Achado no caminho: duas teclas no mesmo quadro (diagonal) perdiam a segunda no plugin de teclado
    do Phaser; o teclado agora é lido direto da janela;
  - **entregar é voltar ao cais pilotando**: PEGAR guarda o achado numa bolsa (círculos ao lado da
    barra de ar), o lugar fica apagado e não abre mais, a busca zera, o pedido vira "Volte ao cais
    para entregar!", a seta e o mapa apontam o cais; ao encostar no cais o cliente agradece. O ar
    continua descendo na volta. No tutorial, um passo novo: "Pegou! Agora leve ao cais. Siga a seta.";
  - **sonar sem a caixa "SONAR / pronto"**: só as fichas, centradas;
  - **bolhas**: ficam no escuro (sem brilho), soltam uma ondinha bem fraca de tempos em tempos e
    aparecem sempre no mapa;
  - **N2 — Uma palavra só** (mar fundo 5120 × 3240, mapas *abismo*, *degraus*, *fendas*): o sonar
    aceita UMA ficha por vez (tocar outra troca); a melhor ficha acende 2 ou 3 (o certo + vizinhos do
    mesmo tipo), a outra acende ≥ 2 a mais; a criança escolhe a mais estreita e confere cada achado.
    Pedidos: VÍDEO de tucano, DESENHO de vulcão, FOTO de baleia;
  - **N3 — Dois achados** (mar fundo, labirintos simples *serpente*, *colunas*, *grutas*: camadas de
    pedra com passagens alternadas e pilares que dividem os corredores): dois pedidos por fase, uma
    busca para cada, os dois na bolsa e só então o cais. Pedidos: FOTO e VÍDEO de tucano, TEXTO e
    MAQUETE de vulcão, DESENHO e BOIA de baleia;
  - ar por nível (gasto 2,2 / 1,6 / 1,4 por segundo); a validação mede o ar da **ida e volta** pelo
    caminho (com dois achados, a melhor ordem): N1 43–53, N2 28–46, N3 56–74 de 100;
  - mundo com profundidade por nível (`setWorld`), minimapa que se ajusta à proporção;
  - catálogo: 90 pontos (3 níveis); instruções com a volta ao cais, o N2 e o N3.
- 09/10/2026 — *"é meio confuso no início. Ele pede pra usar o 'sonar', mas não tem nada ali, e também
  não está claro quem é a barrinha de oxigênio. O N1 F1 deveria já ativar o sonar, mostrar o que é
  sonar … e troque o nome pra 'Filtro'"*:
  - **o sonar virou FILTRO** em todo texto que a criança lê (balões, ajuda, lacre, derrota,
    instruções da plataforma, catálogo). O código segue chamando o módulo de `sonar`;
  - o painel ganhou uma **aba "FILTRO"** em cima, à esquerda, na mesma cor do painel;
  - a barra de ar virou **OXIGÊNIO**: a bolha da folha como ícone e o nome escrito ao lado; os
    textos dizem "oxigênio" no lugar de "ar";
  - **tutorial do N1**: o oxigênio desce na frente da criança até ficar vermelho ("Este é o seu
    OXIGÊNIO. Ele vai acabando!") e volta a encher ("Bolhas e o cais enchem de novo."); depois
    "Este é o FILTRO. Ele procura no mar escuro." [Ver] e **o próprio jogo liga TUCANO**: a onda
    sai, os lugares acendem, as setas aparecem ("Acendeu tudo de TUCANO. Cada seta aponta um."); só
    então a criança junta FOTO;
  - o joystick pega o dedo num raio de 130 (era 150): com 5 fichas no N3 a borda da 1ª ficha também
    agarrava o controle.
- 09/10/2026 — *"ao entregar o item pro cliente, deveria vir uma animação dando zoom, ocultando
  elementos da UI e mostrando a animação de entrega. Enquadre no centro."* A entrega virou um close
  (`scenes/close.ts`, como a [[abertura-em-close]]): toda a interface de tela (HUD, pedido, oxigênio,
  bolsa, mapa, FILTRO, controles e o escuro) some; a câmera vai a 2× com o encontro no centro; o
  cliente anda até a ponta do píer e o submarino sobe ao lado, virado para ele; cada achado salta da
  escotilha, faz um arco até as mãos do cliente (faíscas, pulinho, pose feliz) e fica flutuando ao
  lado dele; "Era isso! Obrigado!" sai acima da cabeça. Depois a câmera volta ao plano aberto, a
  interface reaparece e a bolinha da fase acende. A câmera volta a 1× e a seguir o submarino no
  começo de cada fase.
- 09/10/2026 — *"o que seria 'cais'? ninguém conhece essa palavra. A introdução do tutorial parte de
  se mover e depois pro boost; o boost deveria ser à parte, o que importa é ensinar sobre o filtro.
  Deixe o tutorial mais visual do que textual."*
  - **"cais" saiu de todo texto**: "Leve para o cliente!", "Pegue bolhas!", "Mural dos achados",
    instruções e catálogo ("volte ao cliente"). O código segue com `DOCK`;
  - **tutorial do N1 começa pelo filtro e mostra antes de pedir**: "Ache este pedido!" → "Use o
    FILTRO!" [Ver] → **o jogo toca sozinho** em TUCANO (anel no botão, onda, muitas setas) e depois em
    FOTO (sobra uma seta) → limpa → "Sua vez!" → contorno amarelo pulsando na ficha certa, sem
    balão, até o toque (TUCANO, depois FOTO) → "O OXIGÊNIO acaba. Pegue bolhas!" com a barra descendo
    e enchendo de novo → "Siga a seta!" → o joystick se mexe sozinho, com contorno, até a criança
    pilotar. São 6 balões curtos (antes eram 9 frases longas);
  - **BOOST à parte**: um balão só, no começo da fase 2 do N1 ("BOOST corre mais. Gasta oxigênio!"),
    com chave própria no `registry`. O passo do mapa saiu do N1 (fica na ajuda e no N2/N3).
