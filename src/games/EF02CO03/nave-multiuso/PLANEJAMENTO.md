# Nave Multiuso — planejamento

Jogo **100** · EF02CO03 · 2º ano · 3ª rodada · slug `nave-multiuso`.
Documento irmão: [TEXTURAS.md](./TEXTURAS.md).
Ficha de origem: `docs/rodada-3/EF02CO03.md` (*Controle Certo*), trocada pelo
usuário duas vezes em 02/10/2026: primeiro pela *Oficina de Papel* (a ficha
repetia a *Vila das Máquinas*), depois por esta nave (*Histórico*).
Padrão: `docs/rodada-3/PADRAO-R3.md`. Modelos de código: `EF02CO02/robo-pintor`
(estrutura) e `EF02CO04/trem-peca-e-programa` (tutorial com `createTutorial`).

**Regras de sempre na rodada:**
- errou, perdeu, **do jeito deste jogo** (§7): ferramenta errada só atrapalha por 1,5 s; **deixar uma coisa passar** encerra;
- 2º ano com tutorial visual e **uma frase curta por balão**;
- vocabulário de nave, nunca de briga (nada de arma, tiro, inimigo ou alvo).

---

## 1. O jogo em uma frase

Um shooter vertical **visto de cima**. A **Zuri** pilota uma nave que sobe pela
tela enquanto o mundo rola de cima para baixo: primeiro a **Terra**, depois o
**espaço** e por fim a **Lua**. Pelo caminho descem coisas para resolver:
- **montões de poeira ou de folhas** (a maioria);
- **algo pegando fogo**;
- **um bichinho perdido**.

A criança **pilota com um joystick** (uma bolinha arrastada no canto esquerdo),
voando para qualquer lado, até ficar embaixo da coisa. Depois **encaixa a
ferramenta certa** (assoprador, água ou raio-puxa). Quando a coisa entra na
**faixa de alcance** à frente do bico, a ferramenta funciona sozinha.

## 2. A habilidade

> **(EF02CO03)** Identificar que máquinas diferentes executam conjuntos próprios
> de instruções e que podem ser usadas para definir algoritmos.

Cada ferramenta da nave é uma máquina com **um conjunto próprio de
instruções**: o **assoprador só assopra**, a **água só molha** e o **raio-puxa
só puxa**. Nenhuma faz o trabalho da outra, e o erro mostra isso acontecendo: o
vento **aviva** o fogo, a água **encharca** a poeira e o raio **suga** a poeira
para dentro da nave. A criança decide **qual máquina** serve para cada tarefa.

No espaço e na Lua as coisas mudam de cara, mas a **regra das máquinas é a
mesma**. A criança transfere o que aprendeu para um mundo novo.

**Por que não repete os irmãos:** a *Vila das Máquinas* (055) escolhe a máquina
numa tela parada; o *Robô Pintor* (098) conta repetições. Aqui a máquina é
**trocada em movimento**, e a armadilha é o **hábito**: depois do fogo, é preciso
**voltar** para o assoprador.

## 3. O laço

1. A nave voa, e o mundo rola sozinho para baixo (100, 110 e 120 px/s no N1,
   N2 e N3).
2. As coisas descem do alto em 5 posições (x 450 a 830). Às vezes vêm **duas
   juntas**, sempre de poeira ou folhas e afastadas.
3. A criança arrasta a bolinha do joystick: a nave voa para qualquer lado, na
   área x 340–940, y 330–615. Ela toca numa ferramenta para encaixá-la, o bico
   muda e a faixa de alcance muda de cor.
4. A coisa entra na faixa (a menos de 62 px do eixo da nave, até 230 px à
   frente do bico) e a ferramenta funciona:
   - **certa:** a coisa se resolve e o voo continua;
   - **errada:** o estrago acontece, a ferramenta certa pisca, e a coisa
     **volta inteira um pouco acima da faixa** para a criança trocar e tentar de
     novo (§7).
5. A coisa que passa **sem entrar na faixa** não conta para nada: ela some por
   baixo e **volta mais tarde**, no fim da onda. Desviar é sempre de graça.

**Carregar antes, disparar no alcance** (regra da *Pista Binária*): trocar a
ferramenta é livre e não vale nada até a coisa entrar na faixa.

**O joystick é pedido do usuário** e substitui as setas ◀ ▶ (*"queria que fosse
com joystick, permitindo ir pra todo lado"*). Como funciona:
- o toque pega a bolinha num raio de 170 px da base;
- a direção é proporcional ao arrasto, com zona morta de 15%;
- soltar zera a direção, e a bolinha volta ao centro;
- o joystick e as ferramentas aceitam toques ao mesmo tempo, porque são
  ponteiros diferentes;
- no teclado, as setas ou WASD pilotam, e 1, 2 e 3 trocam a ferramenta.
- no mouse, a **rodinha troca a ferramenta**: para baixo vai para a próxima (assoprador → água → raio-puxa → assoprador) e para cima volta. Há uma trava de 180 ms, para um giro de touchpad não pular várias ferramentas.

## 4. Os três pares, em três lugares (`data/levels.ts`, `data/words.ts`)

| Ferramenta | Terra | Espaço | Lua |
|---|---|---|---|
| 💨 **assoprador** | montão de folhas | nuvem de poeira das estrelas | montinho de poeira da Lua |
| 💧 **água** | árvore pegando fogo | meteoro pegando fogo | robô lunar pegando fogo |
| 🧲 **raio-puxa** | ovelhinha perdida | ovelha astronauta | coelhinho da Lua |

O estrago de cada erro é o mesmo nos três lugares:
- vento no fogo: o fogo cresce;
- água na poeira: vira lama encharcada;
- raio na poeira: a poeira é sugada, e a nave tosse;
- raio no fogo: o fogo é puxado, e a nave esquenta;
- vento no bichinho: ele sai rolando, tonto;
- água no bichinho: ele fica molhado e bravo.

## 5. Os níveis (bolinhas do HUD = ondas)

| Nível | Onda 1 | Onda 2 | Onda 3 | Coisas | Velocidade |
|---|---|---|---|---|---|
| **N1** | Terra | Terra | Terra | 23 (17 🍂, 3 🔥, 3 🐑) | 100 |
| **N2** | Terra | Terra | **decola para o espaço** | 25 | 110 |
| **N3** | espaço | espaço | **pousa na Lua** | 27 | 120 |

- **Entre ondas de lugares diferentes:**
  - o chão novo aparece por cima do antigo em 1,6 s;
  - o cenário antigo some, e as nuvens dão lugar aos rastros de estrela;
  - toca um "vuuush";
  - o mundo continua rolando durante a troca.
- **Cada lugar novo ganha uma apresentação, só na primeira vez:**
  - a Zuri diz "Segura firme: vamos para o espaço!" ou "Chegamos na Lua!";
  - depois vem o desfile das 3 coisas novas, cada uma ao lado do botão da
    ferramenta dela.
- **Vãos:**
  - mínimo de 240 px entre duas coisas;
  - 360 px em volta de toda surpresa;
  - par junto (vão 0) só de poeira ou folhas, a pelo menos 2 posições de
    distância;
  - uma coisa que passou volta com vão de 320.
- **No N3,** a onda 2 junta uma ovelha e um meteoro seguidos: é preciso trocar
  do raio-puxa direto para a água.

**A validação (`validateLevels`) confere:**
- os lugares de cada nível;
- o primeiro vão = 0;
- uma surpresa por onda, no mínimo;
- as regras dos vãos e dos pares;
- os três tipos de coisa em todo nível.

## 6. A tela (1280 × 720, visão de cima)

| Região | O que tem |
|---|---|
| fundo | **Terra:** grama e rio (Graphics), elementos pequenos de `cenario.png` nas laterais e nuvens rápidas. **Espaço:** fundo escuro estrelado (Graphics), elementos de `cenario-espaco.png` passando mais devagar e rastros de estrela. **Lua:** chão cinza com crateras (Graphics) e elementos de `cenario-lua.png` |
| y 0–90 | HUD: plaquinha "Nível N" + 3 bolinhas (esq.), `?` (dir.) |
| área de voo | x 340–940, y 330–615; a nave (≈ 170 × 210) de bico para cima |
| à frente do bico | a **faixa de alcance** (110 × 230), na cor da ferramenta |
| (150, 580), raio 92 | o **joystick** |
| x 1180, y 390 / 520 / 650 | 💨 💧 🧲, em coluna |

### Densidade de alvos

- **3 regiões tocáveis:** joystick (canto esquerdo), ferramentas (coluna à
  direita) e o `?`.
- **5 alvos:** joystick, 3 ferramentas e o `?`. É um a menos que com as setas,
  em dois grupos limpos, como um controle de videogame.
- Nada tocável dentro do mundo.

## 7. O erro e a derrota

Pedidos do usuário em 02/10/2026:
- *"o jogador nao deveria perder se uso a ferramenta errada em alguem"*;
- *"gostaria que o jogo nao congelasse ao acertar algum"*;
- *"quando o jogador acertar o errado, o alvo deve ficar 1.5s naquele estado e
  dps voltar ao normal. o jogador perde se deixar algum passar"*.

**Nada congela.** Acerto e erro acontecem com o mundo rolando e a nave
pilotável. O raio da ferramenta segue a coisa em movimento: ele é desenhado
numa Graphics própria, girada do bico até o alvo, e duas coisas podem ser
atendidas ao mesmo tempo.

**Ferramenta errada (não encerra):**
1. o estrago aparece na coisa, que segue descendo: folhas encharcadas, fogo
   grande, bichinho molhado, bichinho tonto girando no lugar, ou poeira sugada
   para a nave;
2. o botão da ferramenta certa pisca;
3. depois de **1,5 s**, a coisa **volta ao normal** com um brilho e pode ser
   resolvida. Se a nave continua embaixo com a ferramenta errada, conta outro
   erro;
4. cada erro manda `WRONG_ANSWER` com -5 pontos e zera a sequência do plim,
   mas **não chama `lives.lose()`**.

**Deixar passar (encerra):** uma coisa que sai por baixo sem ser resolvida,
estragada ou não, chama `lose()`:
- a Zuri faz cara de "ops";
- `WRONG_ANSWER` + `lives.loseAll()`, e a plataforma recebe `GAME_OVER`.

Nos tutoriais isso não vale.

As estrelas do painel final medem os erros de ferramenta: 0 erros dão 3
estrelas, até 2 dão 2, e mais que isso dá 1.

**Sinal de alvo:** toda coisa ainda por resolver tem um **anel amarelo fraco,
tracejado e girando**, com um pontinho em cima (`things.ts`, alfa 0,42
pulsando). É o mesmo anel para todas as coisas, então diz "isto precisa da
nave", nunca qual ferramenta usar.

## 7b. Área de alcance e animações das ferramentas (`scenes/ship.ts`)

- **A área de alcance é um cone** saindo do bico (38 px de meia-largura no bico
  e 72 no fim, 230 de comprimento):
  - três camadas de cor fazem o degradê;
  - as bordas são tracejadas e andam para a frente;
  - um colchete marca o fim do alcance;
  - na troca de ferramenta, o cone pisca em branco e sai um anel do bico.
- **Mira:** a coisa alinhada à frente da nave, até 240 px depois do alcance,
  ganha **cantoneiras pulsando** na cor da ferramenta encaixada, e o cone fica
  mais forte. Ela mostra **qual** coisa vai receber, nunca se a ferramenta está
  certa.
- **Efeito parado dentro do cone:**
  - assoprador: linhas de vento ondulando, brancas com contorno ciano;
  - água: gotas subindo em duas fileiras, com bolhinhas;
  - raio-puxa: anéis rosa descendo para o bico, com brilhinhos girando.
- **Resgate (raio-puxa certo):** o bichinho voa até a nave perseguindo o bico,
  rodopia 1,5 volta e depois **desce rodando** e sai por baixo da tela. Nada
  sobe e fica para sempre.
- **Ação:**
  - assoprador: rajada em cone, 10 linhas de vento serpenteando e dois
    redemoinhos girando na coisa;
  - água: jato grosso que ondula, anel de respingo crescendo no ponto de
    impacto e gotas espirrando;
  - raio-puxa: feixe cônico rosa, anéis descendo e brilhos espiralando até a
    nave;
  - nos três, um brilho pulsa no bico.

## 8. O acerto e o fim

- **Cada acerto:** `CORRECT_ANSWER` (5 pontos), checkpoint (resolvidas ÷ total),
  brilho e plim.
- **Fim da onda:** a bolinha acende, e a próxima onda começa, com viagem se o
  lugar muda.
- **Fim do nível:**
  - `GAME_COMPLETED`, confete e a Zuri comemorando;
  - os painéis: N1 "Caminho limpo!", N2 "Até o espaço!", N3 "Pouso na Lua!";
  - do N1 e do N2 o jogo avança sozinho, e o N3 termina com JOGAR DE NOVO.

## 9. Tutorial (`createTutorial`, uma frase por balão)

**N1, primeira vez** (chave `ef02co03-l1`):
1. Close na Zuri: "Oi! Eu sou a Zuri, piloto desta nave."
2. Desfile, com cada coisa ao lado do botão da ferramenta dela:
   - "O assoprador tira as folhas do caminho."
   - "A água apaga o fogo."
   - "O raio-puxa resgata a ovelhinha."
3. "Esta faixa mostra onde a ferramenta alcança."
4. **Demonstração A**, com o mundo parado:
   - "Olhe: folhas no caminho!";
   - "Arraste a bolinha para pilotar a nave até lá.", com o dedo arrastando a
     bolinha e o botão **Ver**;
   - a bolinha se inclina, a nave voa até as folhas e elas voam.
5. **Demonstração B:** "Agora vem uma árvore pegando fogo!" e "Troque para a
   água antes de chegar.", com o dedo na água e **Ver**.
6. "Depois, volte para o assoprador!", com **Ver**.
7. "Ferramenta errada não funciona: troque e tente de novo!" e **Vamos começar!**

**N2 e N3, primeira vez:** um balão lembra "Arraste a bolinha para voar para
qualquer lado."

**Lugar novo, primeira vez** (chaves `ef02co03-earth`, `-space`, `-moon`):
- a Zuri diz a frase de chegada;
- o desfile dos 3 pares daquele lugar.

Quem entra direto no N2 vê também a apresentação da Terra.

**`?`:**
- o par de cada ferramenta naquele lugar (por exemplo, "Assoprador: poeira.
  Água: meteoro. Raio-puxa: ovelha.");
- o lembrete do joystick, com **Continuar**.

## 10. Áudio (WebAudio, `scenes/audio.ts`)

- troca de ferramenta: "clac";
- assoprador: vento;
- água: chiado com gotas;
- raio-puxa: "uuuóóm";
- acerto: plim, com a nota subindo na onda;
- erro: "fom-fom";
- fim de onda: arpejo;
- **viagem entre lugares:** "vuuush" subindo;
- vitória e derrota.

## 11. Ciclo da cena

- **`mode`:**
  - `intro`;
  - `guide`;
  - `fly`: voo com controles;
  - `act`: ferramenta funcionando, mundo parado;
  - `panel`: `?`;
  - `wave`: entre ondas; o mundo rola, mas nada nasce;
  - `done`.
- O contador `gen` é conferido depois de todo `await`.
- Tween de objeto que pode ser destruído **nunca é esperado**: o fade do
  cenário antigo na viagem travava a transição (ver a memória
  *killTweensOf não chama onStop*).

## 12. Próximos passos possíveis

- **Duas máquinas em seguida** (a ideia antiga de N3): coisas que pedem duas
  ferramentas em ordem, como poeira pegando fogo (água e depois assoprador).
  Ficou de fora porque o usuário definiu os níveis pelos lugares.

## 13. Arquivos

| Arquivo | O quê |
|---|---|
| `types.ts` | `Kind`, `Tool`, `Place`, `Slot`, `ThingDef`, `WaveDef`, `LevelDef`, `Mode`, `Vec` |
| `data/levels.ts` | os 3 níveis, `TOOL_FOR`, vãos, validação |
| `data/files.ts` | chaves por lugar (`GROUND`, `THINGS`, `SCENERY`), grades e frames |
| `data/layout.ts` | área de voo, nave, faixa, joystick, ferramentas, HUD |
| `data/words.ts` | frases do tutorial, por lugar |
| `scenes/fallback.ts` | desenhos de reserva da Terra, da nave, da Zuri e dos ícones |
| `scenes/places.ts` | desenhos de reserva do espaço e da Lua (chão, cenário e coisas) |
| `scenes/world.ts` | o mundo rolando, os elementos do cenário, nuvens e rastros, e a viagem entre lugares |
| `scenes/ship.ts` | nave livre, faixa, motores e efeitos das ferramentas |
| `scenes/things.ts` | coisas: nascer, descer, acerto e estrago, com a folha do lugar |
| `scenes/controls.ts` | joystick, teclado e as 3 ferramentas |
| `scenes/guide.ts` | `teach()` com `createTutorial` |
| `scenes/GameScene.ts` | laço, ondas, viagens, tutoriais e bridge |

## Histórico

- **02/10/2026, Oficina de Papel.** A ficha *Controle Certo* repetia a *Vila
  das Máquinas*, e o usuário escolheu a **Oficina de Papel** (duas máquinas
  fabricando dobraduras). O N1 foi feito e conferido.
- **02/10/2026, a troca pela nave.** O usuário pediu: *"mudar esse jogo, por uma
  nave espacial, que muda das 'armas'… dai o jogador pode ir controlando"*. Em
  seguida: *"a nave tivesse voando na terra, como naqueles jogos de voar e
  atirar laser nas pedrinhas"*. Depois trocou a pedra por um **montão de
  folhas** com **assoprador** (*"poderia ter mtas folhas no decorrer do
  estágio"*). Por fim, pediu:
  - o estilo de arte das imagens anexadas (linha nova, **pop chapado**, refs
    `30`–`32`);
  - a nave controlada pela criança;
  - uma piloto **negra, de olhos verdes, cabelo liso, roupa de piloto e sem
    capacete**, parecida com a personagem gótica de cabelo roxo da referência.
    Depois o usuário corrigiu: o cabelo é **preto liso**, não roxo;
  - só o N1, com Graphics, porque as texturas ficam com o usuário.

  A pasta foi renomeada de `oficina-de-papel` para `nave-multiuso` (id 100
  mantido).
- **02/10/2026, visão de cima.** A primeira versão era de rolagem lateral
  (ilhinhas flutuantes em 3 alturas, ▲ ▼). O usuário mandou duas imagens de
  shooter vertical: *"o jogo deveria ser angulo top side"*. Mudanças:
  - virou **top-down**: a nave embaixo de bico para cima, as coisas descendo em
    3 colunas, ◀ ▶ e as ferramentas em coluna à direita;
  - a velocidade caiu para 100 px/s, porque a tela deitada tem pouca altura;
  - o TEXTURAS trocou céu, morros e chão por um único `terreno.png` vertical, a
    nave passou a ser vista de cima e as ilhinhas viraram canteiros no chão.

  Conferido no navegador:
  - tutorial inteiro;
  - partida completa (17 de 17, com uma ovelha desviada que voltou e foi
    resgatada);
  - erro (raio-puxa nas folhas → folhas sugadas, a água acende, game over).
- **02/10/2026, cenário.** O usuário pediu um prompt de **elementos** de cenário, e não um mapa pronto: *"quem vai fazer o cenario é vc pelo Graphics"*. Mudanças:
  - o chão (grama e rio) é Graphics;
  - os 12 elementos de `cenario.png` (árvores, telhados, plantações, flores, pedras, lago e cerca) são espalhados nas laterais por `scenes/world.ts`;
  - a pedido, **sem estrada** (*"quero tudo grama"*) e com os elementos **pequenos**, mais nuvens rápidas, para parecer *"uma nave voando mesmo"*;
  - o funil verde da nave foi recolorido para ciano, e o original está em `outputs/nave-multiuso/`.
- **02/10/2026, joystick, N2 e N3.** Pedido do usuário: *"nao queria setas <>
  pra controlar, queria que fosse com joystick, permitindo ir pra todo lado, mas
  coloque mais elementos aparecendo. no nivel 2, faça o jogador ir pra o espaço
  na fase 3, e no n3, deixe o jogador só no espaço, e na f3 n3 faça na lua"*.
  Mudanças:
  - a nave voa livre com o joystick;
  - as coisas descem em 5 posições, às vezes em par: N1 com 23, N2 com 25 e N3
    com 27;
  - o N2 decola para o espaço na onda 3, e o N3 pousa na Lua na onda 3;
  - o espaço e a Lua têm chão em Graphics, folhas novas de coisas e de cenário
    (TEXTURAS §9) e desenhos de reserva em `scenes/places.ts`.

  Conferido no navegador:
  - tutorial do N1 com o joystick;
  - N1 completo (23 de 23);
  - N2 completo, com a viagem e a apresentação do espaço (25 de 25);
  - N3 completo, com a apresentação da Lua (27 de 27);
  - o joystick por eventos de toque.
- **02/10/2026, erro sem derrota e ferramentas melhores.** O usuário pediu:
  *"o jogador nao deveria perder se uso a ferramenta errada em alguem. alem
  disso, melhore a animaçao, area de range, etc. das ferramentas"*. Mudanças:
  - o erro passou a devolver a coisa para uma nova tentativa (§7);
  - o alcance virou um cone com mira, e as três ferramentas ganharam efeitos
    novos (§7b).

  Conferido no navegador:
  - água nas folhas: folhas encharcadas, a coisa volta, nenhuma vida perdida;
  - em seguida, o assoprador resolve;
  - o feixe do raio-puxa numa ovelha.
- **02/10/2026, sem congelar e Zuri presente.** Mudanças:
  - acerto e erro rodam com o mundo andando (§7);
  - o bichinho resgatado voa até a nave, rodopia e desce;
  - pedido *"coloque pra Zuri aparecer mais quando ela for explicar. assim como
    for pro espaço e quando for pra lua"*: em toda explicação, a Zuri aparece
    em busto (escala 0,55) **acima do véu**, no canto oposto ao recorte. Ela
    fica à esquerda quando o recorte está à direita ou no meio, e à direita
    quando o recorte é o joystick. Em toda viagem para o espaço ou para a Lua,
    ela entra comemorando, mesmo que a apresentação do lugar já tenha sido
    vista;
  - as texturas novas (`coisas-espaco`, `coisas-lua` e `cenario-espaco`) foram
    limpas e reempacotadas (ver o MANIFEST). A estação espacial saiu do sorteio
    do cenário porque, vista de cima, parece uma mira.

  Conferido no navegador:
  - o tutorial com a Zuri nos dois lados;
  - o N1 inteiro com um erro de propósito: as folhas encharcadas voltaram e
    foram resolvidas, 23 de 23;
  - o resgate da ovelha;
  - a decolagem do N2 com a Zuri.
- **02/10/2026, viagens, derrota por deixar passar e sinal de alvo.** Pedidos
  do usuário: viagens com as turbinas aumentando e a nave disparando, erro de
  1,5 s, perder ao deixar passar, o chão da Lua menos destacado e um sinal
  amarelo fraco em todo objeto. Mudanças:
  - **viagem para o espaço** (`travel` em `GameScene`):
    1. a Zuri entra comemorando;
    2. a nave vai ao centro e as turbinas crescem e tremem em 1,1 s (`setBoost`, com chama ciano e branca);
    3. a nave dispara: o mundo acelera até 12×, os rastros aparecem, a nave sobe e o céu clareia (véu azul-claro) até sair da atmosfera;
    4. sob o véu, o chão troca para o espaço;
    5. o véu escurece e some, e a velocidade volta ao normal;
  - **viagem para a Lua:** uma Lua grande desce e aparece no alto antes; na arrancada, ela cresce até encher a tela (véu cinza-claro);
  - o chão da Lua ganhou um véu escuro (alfa 0,38) e crateras mais suaves;
  - a plataforma de pouso saiu do sorteio do cenário da Lua, porque os anéis amarelos dela se confundiam com o sinal de alvo.

  Conferido no navegador:
  - as duas viagens;
  - o estrago de 1,5 s voltando ao normal;
  - a derrota ao deixar passar;
  - o chão da Lua com os anéis amarelos.

- **02/10/2026, espaço mais calmo e ferramenta marcada.** Pedido do usuário:
  *"deixe o bg do espaço menos destacado, ele ta mt misturado. alem disso,
  deixe uma borda amarela piscando na ferramenta selecionada atual"*.
  Mudanças:
  - o espaço ganhou um véu escuro (alfa 0,42), como a Lua;
  - os rastros de estrela caíram para alfa 0,35;
  - a **nebulosa saiu do sorteio**, porque rosa e roxa como ela se confundia com
    a nuvem de poeira que a criança precisa resolver;
  - o botão da ferramenta encaixada ganhou um **anel amarelo com contorno
    marinho, piscando** (alfa 1 ↔ 0,2 em 420 ms), que acompanha a troca.
