# Catapulta do Arquivo — planejamento

Jogo **126** · EF05CO06 · 5º ano · Mundo Digital · 3ª rodada.
Documento irmão: [TEXTURAS.md](./TEXTURAS.md). Ficha: `docs/rodada-3/EF05CO06.md` (*Cofre ou Correio*), trocada a pedido do usuário em 19/10/2026.

**De onde veio:** a ficha repetia a mecânica do `missao-arquivo-seguro`. A primeira troca, *Puxa que Vem!*, foi reprovada (*"confuso, sem orientação, sem diversão"*). Os pedidos do usuário que formam este jogo:
1. o jogador tem um arquivo e o guarda num dispositivo local ou remoto, **com uma catapulta**; o arquivo rola, cai num buraco e chega ao dispositivo embaixo, ou acerta um dispositivo no céu;
2. **cada fase tem um mapa diferente e complexo, maior que a tela**, e dá para **arrastar o mapa** e ver tudo antes de planejar o tiro.

**Réguas, nesta ordem:**
1. **O pedido sempre à vista**, no alto: *Guarde no LOCAL* / *Guarde no REMOTO*, com cor própria.
2. **Ver antes de atirar:** cada rodada abre mostrando o fim do mapa e volta passeando até a catapulta; dá para arrastar a tela e tocar o mapinha.
3. **Um gesto por intenção:** puxar a bolinha = mirar; arrastar em qualquer outro lugar = olhar o mapa.
4. **Errar a mira não custa.** O arquivo que para no chão volta para a catapulta.
5. **Guardar no tipo errado encerra** (regra da plataforma), com a cena do porquê antes.

---

## 1. O jogo em uma frase

Olhe o mapa, puxe a catapulta e guarde o arquivo no lugar que o pedido manda: os buracos levam a dispositivos embaixo da terra, e a nuvem fica no céu.

## 2. A habilidade

> **(EF05CO06)** Reconhecer que os dados podem ser armazenados em um dispositivo **local** ou **remoto**.
> Local: acoplado permanentemente ao computador. Remoto: removível ou na Internet.

| O que o texto pede | Onde está no jogo |
|---|---|
| armazenar dados | o arquivo é lançado e **guardado** dentro do dispositivo |
| local | o HD de dentro do gabinete, no fim de um buraco |
| remoto removível | pen drive, cartão de memória, HD externo, no fim de outros buracos |
| remoto na Internet | a nuvem, no céu |
| reconhecer | o pedido diz o **tipo**; cada alvo mostra só o **nome** do dispositivo |

Em cada mapa os dispositivos mudam de lugar, e há mais de um alvo de cada tipo: o local não mora sempre no mesmo canto.

## 3. O laço

1. **Abertura:** o pedido aparece e a câmera começa no fim do mapa, mostrando os alvos de lá, e volta passeando (1,8 s) até a catapulta.
2. **Planejar:** arrastar a tela anda pelo mapa; tocar ou arrastar no **mapinha** pula para aquele ponto. O mapinha mostra o relevo, os ícones dos dispositivos, as tábuas, as molas e a janela da câmera.
3. **Mirar:** puxar a bolinha para trás (começando perto dela). Ao esticar, a câmera **se afasta até caber o mapa inteiro** (`OVERVIEW`) e uma **linha de bolinhas** mostra o voo até onde o arquivo **aterrissa** (o primeiro toque), apagando para a ponta, com um anel meio transparente no ponto. A bolinha nunca desce para dentro do chão (`CATAPULT.maxDown`): antes, puxada para baixo, ela nascia dentro da terra e saía rastejando.
4. **Soltar:** a câmera continua afastada, com o mapa inteiro, e só volta perto onde o arquivo cair. Ele voa, quica, rola, salta nas **molas**, pousa e escorrega das **tábuas**.
   - cai num buraco → desce até o dispositivo;
   - entra numa nuvem → some dentro dela;
   - para no chão ou sai do mapa → *"Quase! De novo!"*, a câmera volta e o arquivo reaparece.
5. **Certo:** brilho, *"PEN DRIVE = REMOTO"*, bolinha verde no HUD e próximo mapa.
6. **Errado:** o alvo treme, *"CARTÃO = REMOTO"* em vermelho, faixa *"O pedido era LOCAL!"*, os alvos certos acendem e, 1,7 s depois, `lose()`.

## 4. A tela (1280 × 720) e o mundo

~~~text
┌────────────────────────────────────────────────────────────────────────┐
│ [Nível 1 ●○○○]      [🖼 Guarde no (REMOTO)]                       (?)  │ 0–96 fixo
│                                              ┌──────── mapinha ───────┐│ fixo
│                                              └────────────────────────┘│
│   \_/ catapulta          ☁ nuvem         ▭ tábua                       │ ← o mundo anda
│ ───┴──╲        [pen drive]          ╱──────╲     [HD do computador]    │
│        ╲__⌇mola__│  ▯  │__________╱          ╲______│  ▯  │___         │
└────────────────────────────────────────────────────────────────────────┘
~~~

O mundo tem a largura do mapa (2000 a 2600) e 720 de altura; a câmera só anda na horizontal. HUD, pedido, mapinha, faixa e tutorial são fixos na tela.

**Cabeçalho recolhido:** arrastando o mapa, puxando a catapulta ou com o arquivo voando, a faixa (nível, bolinhas, `?`) sobe e esmaece em 220 ms, e o pedido fica sozinho no alto, centralizado, 80 % do tamanho e com a pílula justa no conteúdo. O mapinha fica no arrasto (guia quem arrasta) e some no puxão e no voo. Só esconde depois de 12 px de dedo: um toque não mexe em nada. Volta 200 ms depois de soltar o mapa ou de um puxão curto, e na hora em que o arquivo cai.

## 5. Os mapas (`data/maps.ts`)

**N1, curva suave** (refeito em 20/10/2026: antes a MESA já punha a nuvem e o HD externo antes do HD certo):

| Rodada | Mapa | Largura | Pedido | Alvos, da esquerda para a direita (certos em **negrito**) | Peças |
|---|---|---|---|---|---|
| 1 | Vale | 2000 | REMOTO, foto | **pen drive** (o 1º buraco, perto, puxão médio), HD, HD; sem nuvem | 1 mola, 1 tábua, ambas depois dos alvos de perto |
| 2 | Mesa | 2200 | LOCAL, vídeo | cartão, **HD** (o 2º alvo, com funil), HD externo; nuvem longe e alta | 1 mola, 1 tábua, depois do HD |
| 3 | Cânion | 2400 | REMOTO, música | HD, HD, **cartão**; **nuvem** | 2 molas, 1 tábua |
| 4 | Serra | 2600 | LOCAL, trabalho | pen drive, HD externo, **HD** (no fim, com funil); nuvem alta no começo | 2 molas, 2 tábuas |

**N2 e N3** (2400 a 3000 px, 2–4 molas, 2–3 tábuas, 4 a 6 alvos; o certo nunca é o 1º buraco):

| Nível | Mapa | Largura | Pedido | Alvos (certos em **negrito**) |
|---|---|---|---|---|
| N2 | Duna | 2400 | REMOVÍVEL | HD, **pen drive**, HD, **HD externo**; nuvem alta |
| N2 | Píer | 2600 | INTERNET | cartão, HD, pen drive, HD externo; **nuvem** do meio, **nuvem** longe e alta (mola embaixo) |
| N2 | Farol | 2800 | REMOVÍVEL | HD, **cartão**, HD, **pen drive** (funil); nuvem alta |
| N2 | Recife | 3000 | LOCAL | pen drive, HD externo, cartão, **HD** (no fim, rampa-funil); 2 nuvens altas |
| N3 | Pico | 2600 | INTERNET | HD, pen drive, cartão; **nuvem** |
| N3 | Gruta | 2800 | REMOVÍVEL | HD, **HD externo**, HD, **pen drive**; nuvem alta |
| N3 | Trilha | 2800 | LOCAL | cartão, pen drive, **HD** (funil), HD externo; nuvem alta |
| N3 | Cume | 3000 | REMOVÍVEL | HD, **cartão**, HD; 2 nuvens altas |

**Funil:** nos alvos difíceis o chão desce dos dois lados para a boca do buraco, então quem acerta a região vê o arquivo rolar para dentro. Rampa com inclinação acima de 0,08 nunca deixa o arquivo parar: ele rola até a boca.

**Alcance validado no simulador** (399 puxões por mapa, de 30 a 190 px e de −10° a 80°; nuvem em 3 fases do balanço). Puxões que acertam o certo mais difícil: N1 80 / 86 / 47 / 34; N2 37 / 18 / 18 / 25; N3 23 / 22 / 29 / 18. Todo certo tem puxão "seguro" (continua acertando com ±2 px), todo errado é alcançável e nenhuma janela de 1280 px tem mais de 4 alvos. O puxão da demonstração (`DEMO`, x −61, y 35) para no chão do Vale em x ≈ 790, antes da boca do pen drive (940).

## 6. A física (`scenes/ball.ts`, `scenes/world.ts`)

- **Passo fixo de 1/180 s**, acumulado a partir do tempo real (no máximo 50 ms por quadro). Assim o mesmo puxão cai no mesmo lugar em qualquer aparelho. Com passo variável, um tiro certo a 60 fps caía no buraco errado a 25 fps.
- Gravidade 980 px/s², puxão máximo 190 px, força 8 (até 1520 px/s).
- Quica se a queda for forte; depois rola, com atrito alto.
- **Tábua:** pousa e rola em cima; batida por baixo devolve, batida de lado rebate. Ela **escorrega**: quem quase para em cima rola até a borda mais perto e cai (nada fica preso numa tábua).
- **Mola:** quem cai nela é jogado para cima (860 px/s) e segue para a frente.
- Buraco: o centro do arquivo dentro da boca e na altura dela. Nuvem: distância ao centro menor que o raio.
- O resultado é sensível a poucos pixels (quiques e molas): é um jogo de mira, e a criança ajusta pelo que viu.

## 7. Introdução (só na estreia de cada nível) e o `?`

Balões de 2–5 palavras (`data/words.ts` `TEACH`), a câmera indo até o que cada um cita; nenhum balão fala de controle — o controle se explica na demonstração.

- **N1:** pedido → *"HD de dentro: LOCAL."* → *"Pen drive e nuvem saem: REMOTOS."* → *"Veja o mapa todo."* [Ver] → **demonstração sem balão**: a bolinha (`scenes/tap.ts`, sem mãozinha) arrasta a tela e o mapa anda; depois puxa a catapulta (pontinhos do voo aparecendo) e solta. O puxão (`DEMO` em `layout.ts`) para no chão do VALE perto da mola (simulado, estável a ±2 px): aparece *"Quase! De novo!"* e o arquivo volta — a criança vê que errar a mira não custa. A demonstração nunca é julgada (`demoDone`). → *"Sua vez!"*
- **N2:** pedido → *"Remoto tem dois jeitos!"* → *"Tira e leva: REMOVÍVEL."* (num buraco removível) → *"Nuvem: INTERNET."* → *"HD de dentro: LOCAL."* → *"Sua vez!"*
- **N3:** *"Leia o pedido."* → *"Onde ele precisa estar?"* → *"Sua vez!"*

O `?` repete os balões do nível, sem a demonstração.

## 8. Erros

| Situação | Cobra? |
|---|---|
| guardou num dispositivo do tipo errado | sim: cena + `lose()` |
| parou no chão, saiu do mapa, puxão curto, arrastou o mapa | não |

## 9. Arquivos

~~~text
data/maps.ts (os 12 mapas)  levels.ts  layout.ts  theme.ts  words.ts  files.ts
scenes/GameScene.ts (câmera, entrada, rodada)  BootScene.ts
scenes/world.ts (relevo, buracos)  ball.ts (física)  stage.ts (chão, borda em Rope, túneis, tábuas, molas)
scenes/targets.ts  minimap.ts  catapult.ts  order.ts  hud.ts  guide.ts  banner.ts  audio.ts  art.ts
scenes/fallback.ts (arte em Graphics)
~~~

Registro: `src/data/catalog.ts` (id 126) e `src/data/gameInstructions.ts`.

**A borda de cima do chão é uma `Rope`** (`stage.ts`): a textura `borda-<lugar>` (512 × 96, chão em y 36) segue cada trecho do relevo, reamostrado a cada 16 px, com as quinas cortadas por dois pontos, em pedaços de 512 px de comprimento (uma Rope por pedaço, o último usa só a parte do PNG que cabe). Assim a textura repete, não estica. Os pontos descem 12 px pela normal porque a Rope centra a textura no caminho. Os túneis são `TileSprite` de `tunel-<lugar>` (128 × 256, repete na vertical, escala para a largura da boca). Tudo estático: um mapa de 3000 px dá cerca de 10 Ropes. Rope só desenha em WebGL.

## 10. Travas para quem mexer depois

- **Mudou um mapa, rode o simulador.** Um mapa bonito pode ter o alvo certo inalcançável (aconteceu: 1 puxão em 399). Funil e nuvens altas resolveram.
- **A física não pode voltar a usar o `delta` do quadro.** O passo é fixo.
- **O rótulo do alvo é o nome, nunca o tipo.**
- **A interface mora numa segunda câmera** (`uiCam`, sem zoom): tudo com `setScrollFactor(0)` vai para ela sozinho (`route()` a cada quadro), menos o céu, que fica na câmera do mundo e é esticado ao contrário do zoom. **HUD, pedido, faixa e mapinha precisam de `setScrollFactor(0)`**; o painel de fim de nível e o confete não têm, por isso a câmera volta ao começo antes deles.
- **Nuvem baixa no meio do caminho é armadilha:** ela pega os arcos médios e encerra a rodada LOCAL. Nuvens ficam altas ou fora da linha principal.

## 12. Níveis 2 e 3

| Nível | Assunto (um só) | O pedido | Lugar |
|---|---|---|---|
| 1 | local × remoto | *Guarde no LOCAL / REMOTO* | campo de dia (`bg-ceu`, `terra`) |
| 2 | o remoto tem dois jeitos: **removível** ou **na internet** | *Guarde no LOCAL / REMOVÍVEL*, *Guarde na INTERNET* | praia no fim da tarde (`bg-praia`, `areia`) |
| 3 | **por que** guardar lá: a situação decide | uma frase, sem a palavra do lugar (*"A escola está sem internet. Leve o TRABALHO."*) | serra à noite (`bg-serra`, `pedra`) |

- `types.ts`: `Want = Kind | Place`; `fits()` em `levels.ts` aceita os dois lugares de fora quando o pedido é `remoto`. A plaquinha do acerto/erro diz o tipo no N1 e o lugar depois (`classOf`): *"NUVEM = INTERNET"*.
- No N3 a faixa do erro diz o **porquê** da situação (`Round.why`), não só *"O pedido era…"*.
- Mapas do N2 (DUNA, PIER, FAROL, RECIFE) e do N3 (PICO, GRUTA, TRILHA, CUME), 2400 a 3000 px, mais peças que o N1, validados no simulador (ver brief do Ferro).

| N3 | Situação | Certo |
|---|---|---|
| 1 | A vovó mora longe e quer ver a FOTO hoje. | nuvem (INTERNET) |
| 2 | A escola está sem internet. Leve o TRABALHO. | REMOVÍVEL |
| 3 | Só você vê o VÍDEO, e só neste computador. | LOCAL |
| 4 | O carro do tio não tem internet. Leve a MÚSICA. | REMOVÍVEL |

## 11. Dúvidas

1. Estilo de arte: chibi voador (`references/35-chibi-voador.webp`), escolha do usuário em 20/10/2026.
2. O passeio de abertura roda em toda rodada. Se cansar, pode virar só na primeira vez de cada mapa.

## Histórico

- 19/10/2026 — criado (só o N1, em `Graphics`), no lugar do *Puxa que Vem!*.
- 19/10/2026 — mapas diferentes e maiores que a tela por rodada; arrastar e mapinha; tábuas e molas; passo de física fixo.
- 20/10/2026 — cabeçalho recolhe ao arrastar, puxar e voar; só o pedido fica, compacto (pedido do usuário).
- 20/10/2026 — N2 (removível × internet) e N3 (situação), um lugar por nível; tutorial em balões curtos com demonstração (arrasto + jogada); arte no chibi voador e capa.
- 20/10/2026 — N1 com dificuldade suave; zoom-out ao mirar com a linha até a aterrissagem; corrigido o arquivo que nascia dentro do chão (pedido do usuário).
