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
3. **Mirar:** puxar a bolinha para trás (começando perto dela). Pontinhos mostram só o começo do voo.
4. **Soltar:** a câmera segue o arquivo. Ele voa, quica, rola, salta nas **molas**, pousa e escorrega das **tábuas**.
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

## 5. Os mapas do N1 (`data/maps.ts`)

| Rodada | Mapa | Largura | Pedido | Alvos (certos em **negrito**) | Peças |
|---|---|---|---|---|---|
| 1 | Vale | 2000 | REMOTO, foto | HD, **pen drive** (no alto do morro), HD; **nuvem** | 1 mola, 1 tábua |
| 2 | Mesa | 2200 | LOCAL, vídeo | cartão, HD externo, **HD** (em cima da mesa, com funil); nuvem | 1 mola, 1 tábua |
| 3 | Cânion | 2400 | REMOTO, música | HD, HD, **cartão**, **pen drive**; **nuvem** (longe) | 1 mola, 2 tábuas |
| 4 | Serra | 2600 | LOCAL, trabalho | pen drive, HD externo, cartão, **HD** (no fim, com funil); 2 nuvens | 2 molas, 2 tábuas |

**Funil:** nos alvos difíceis o chão desce dos dois lados para a boca do buraco, então quem acerta a região vê o arquivo rolar para dentro.

**Alcance validado no simulador** (399 puxões por mapa, de 30 a 190 px e de −10° a 80°): o alvo certo mais difícil de cada mapa é atingido por 14 a 57 puxões, e o simulador acha puxões "seguros" (que continuam acertando com ±2 px) em todos.

## 6. A física (`scenes/ball.ts`, `scenes/world.ts`)

- **Passo fixo de 1/180 s**, acumulado a partir do tempo real (no máximo 50 ms por quadro). Assim o mesmo puxão cai no mesmo lugar em qualquer aparelho. Com passo variável, um tiro certo a 60 fps caía no buraco errado a 25 fps.
- Gravidade 980 px/s², puxão máximo 190 px, força 8 (até 1520 px/s).
- Quica se a queda for forte; depois rola, com atrito alto.
- **Tábua:** pousa e rola em cima; batida por baixo devolve, batida de lado rebate. Ela **escorrega**: quem quase para em cima rola até a borda mais perto e cai (nada fica preso numa tábua).
- **Mola:** quem cai nela é jogado para cima (860 px/s) e segue para a frente.
- Buraco: o centro do arquivo dentro da boca e na altura dela. Nuvem: distância ao centro menor que o raio.
- O resultado é sensível a poucos pixels (quiques e molas): é um jogo de mira, e a criança ajusta pelo que viu.

## 7. Introdução (só na 1ª vez) e o `?`

Cinco balões, um de cada vez, com a câmera indo até o que cada um mostra:
1. *"Guarde a FOTO num lugar REMOTO."* — o pedido;
2. *"O HD de dentro do computador é LOCAL."* — a câmera vai até um HD;
3. *"Pen drive e nuvem saem do computador: são REMOTOS."* — a câmera vai até eles;
4. *"Arraste a tela para ver o mapa todo. O mapinha mostra onde você está."* — com o ponteiro de arrasto;
5. *"Puxe a catapulta para trás, mire e solte!"* — a câmera volta à catapulta.

O `?` mostra os mesmos cinco, com os dispositivos do mapa atual.

## 8. Erros

| Situação | Cobra? |
|---|---|
| guardou num dispositivo do tipo errado | sim: cena + `lose()` |
| parou no chão, saiu do mapa, puxão curto, arrastou o mapa | não |

## 9. Arquivos

~~~text
data/maps.ts (os 4 mapas)  levels.ts  layout.ts  theme.ts  words.ts  files.ts
scenes/GameScene.ts (câmera, entrada, rodada)  BootScene.ts
scenes/world.ts (relevo, buracos)  ball.ts (física)  stage.ts (terra, túneis, tábuas, molas)
scenes/targets.ts  minimap.ts  catapult.ts  order.ts  hud.ts  guide.ts  banner.ts  audio.ts  art.ts
scenes/fallback.ts (arte em Graphics)
~~~

Registro: `src/data/catalog.ts` (id 126) e `src/data/gameInstructions.ts`.

## 10. Travas para quem mexer depois

- **Mudou um mapa, rode o simulador.** Um mapa bonito pode ter o alvo certo inalcançável (aconteceu: 1 puxão em 399). Funil e nuvens altas resolveram.
- **A física não pode voltar a usar o `delta` do quadro.** O passo é fixo.
- **O rótulo do alvo é o nome, nunca o tipo.**
- **HUD, pedido, faixa e mapinha precisam de `setScrollFactor(0)`**; o painel de fim de nível e o confete não têm, por isso a câmera volta ao começo antes deles.
- **Nuvem baixa no meio do caminho é armadilha:** ela pega os arcos médios e encerra a rodada LOCAL. Nuvens ficam altas ou fora da linha principal.

## 11. Dúvidas

1. Estilo de arte: o TEXTURAS usa linha chapada (`references/30-pop-chapado-a.jpg`).
2. O passeio de abertura roda em toda rodada. Se cansar, pode virar só na primeira vez de cada mapa.

## Histórico

- 19/10/2026 — criado (só o N1, em `Graphics`), no lugar do *Puxa que Vem!*.
- 19/10/2026 — mapas diferentes e maiores que a tela por rodada; arrastar e mapinha; tábuas e molas; passo de física fixo.
