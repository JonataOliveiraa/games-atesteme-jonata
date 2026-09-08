# Corrida do Cotidiano - EF02CO05

Documentos irmãos: [TEXTURAS.md](./TEXTURAS.md) · [PISTA.md](./PISTA.md)

A criança corre por um bairro. Um balão mostra uma situação do dia a dia — `Que
horas são?` — e lá na frente aparecem **dois portões**, cada um com um objeto
desenhado em cima. Ela toca na faixa do portão que resolve aquilo.

O portão certo abre com luz e o corredor acelera. O errado **fecha na cara
dele**: a corrida para, uma plaquinha diz para que aquele objeto serve, e só
tocar no outro portão destrava.

No fim do trecho, o mapa do bairro mostra cada tecnologia que ela reconheceu,
morando no lugar onde foi usada.

---

## 1. A habilidade, e o teste que ela precisa passar

> **(EF02CO05)** Reconhecer as características e usos das tecnologias
> computacionais no cotidiano dentro e fora da escola.

Objeto: **Uso de artefatos computacionais**.

O teste da bolinha: **troque os objetos dos portões e o balão por bolinhas
coloridas sem significado. O jogo muda?**

Muda, e acaba. Com bolinhas, não existe nada na tela que diga qual lado é o
certo — a regra do jogo é `este objeto serve para isto`, e essa ligação não
está desenhada em lugar nenhum: está no que a criança sabe da casa dela. Não há
cor combinando, forma encaixando nem posição repetindo. Tirar o conteúdo não
deixa um jogo mais fácil, deixa um jogo impossível — que é o sinal de que a
habilidade está na mecânica, e não na decoração.

| Campo | Valor no jogo |
|---|---|
| Código | `EF02CO05` |
| Ano | 2º ano |
| Unidade | Cultura Digital |
| Objeto | Uso de artefatos computacionais |
| Verbo da habilidade | reconhecer |
| Evidência jogável | atravessar o portão do objeto que resolve a situação daquele lugar |

O reconhecimento não é perguntado, é **atravessado**. E o objeto errado não
some: ele fecha o caminho e conta, em uma linha, para que serve de verdade — que
é a outra metade do texto oficial, a *característica* de cada tecnologia.

---

## 2. Como isso não vira o jogo irmão

Já existe um jogo publicado para EF02CO05: **Cidade das Tecnologias**.

| Jogo | O que a criança faz | Diferença |
|---|---|---|
| Cidade das Tecnologias | Toca num prédio do mapa, lê a situação e escolhe entre três tecnologias, parada. | O lugar é o menu: primeiro escolhe onde, depois responde. |
| Corrida do Cotidiano | Corre, e decide entre dois caminhos enquanto o mundo vem na direção dela. | O lugar é o percurso: as situações vêm em fila, no ritmo do bairro, e a decisão tem consequência física. |

Duas diferenças que não são de embalagem:

- **O erro tem corpo.** No irmão, errar mostra uma explicação e segue. Aqui o
  portão fecha, o corredor para e a criança precisa fazer a escolha certa para
  a corrida voltar a andar. Ninguém atravessa por sorte.
- **Existe portão SEM tecnologia** (nível 3): regar a planta se resolve com
  regador, e o certo é o portão que não tem tecnologia nenhuma. O irmão nunca
  oferece essa saída, e é ela que separa reconhecer de apontar o aparelho mais
  bonito.

---

## 3. O laço

```
o balão mostra a SITUAÇÃO (pictograma + frase curta)
→ lá longe nascem DOIS portões, um objeto em cada
→ a criança toca na faixa da esquerda ou da direita (ou setas)
   ↳ o corredor troca de faixa e a faixa escolhida acende
→ o portão chega
   ↳ certo: abre com luz, ele acelera 1 s, e o objeto voa para o mapa
   ↳ errado: FECHA, ele para, plaquinha com o que aquele objeto faz
      ↳ ela toca no outro portão, ele abre, a corrida continua
→ acabaram os portões do trecho: o mapa do bairro com o que foi reconhecido
```

Controle: **um toque**. A zona de toque é a **faixa da pista**, que está
desenhada e acende quando é escolhida — a metade da tela apenas estende essa
faixa até a borda, para o dedo não precisar de pontaria. As setas do teclado
fazem o mesmo. Nada de arrastar, nada de zona invisível solta no céu.

Trocar de faixa antes do portão chegar não custa nada: mudar de ideia enquanto
corre é pensar, não errar.

---

## 4. Clareza para criança

| Conceito | Como a tela mostra |
|---|---|
| o que precisa resolver | o balão grande no topo, com pictograma antes da frase |
| as duas opções | dois portões, um objeto grande em cima de cada |
| eu escolhi este | a faixa acende e o corredor troca de lado, ainda longe do portão |
| acertei | o portão abre, luz, e ele corre mais rápido por 1 s |
| errei | o portão fecha e o mundo para; nada acontece até eu resolver |
| por que errei | a plaquinha: `O liquidificador serve para bater frutas.` |
| estou perdida | depois de 2 erros no mesmo portão, o certo pisca |
| progresso | os objetos reconhecidos se acumulando no mapa do fim do trecho |

O nome de cada objeto aparece **uma vez**, na plaquinha do erro, que é o único
momento em que a criança está parada olhando para ele. Portão não tem rótulo
embaixo: texto pequeno correndo na tela ninguém lê.

---

## 5. A grade: o balão mora no céu, a corrida mora no chão

Tela fixa de **1280 x 720** com `Phaser.Scale.FIT`. A coluna "No celular" usa
fator 0,30 (aparelho de 390 px de largura).

| Faixa | y | Conteúdo | Tamanho | No celular |
|---|---|---|---|---|
| Header | 0 - 72 | vidas em (40, 40), pílula do nível, `?` em (1218, 36) | `?` toque 122 x 122 | 37 x 37 |
| Balão | 78 - 196 | pictograma 92 + frase de 34 px | balão 760 x 118 | 228 x 35 |
| Céu | 196 - 334 | gradiente e nuvens, horizonte em y = 334 | — | — |
| Pista | 334 - 720 | os dois portões e o corredor | — | — |
| Faixa de toque | 200 - 720 | esquerda 0 - 640, direita 640 - 1280 | 640 x 520 | 192 x 156 |

Na pista, os números que o código usa. Todos saem da mesma projeção, explicada
em [PISTA.md](./PISTA.md) — nenhum deles é número de conserto:

| Peça | Posição | Tamanho | No celular |
|---|---|---|---|
| portão longe (`p` = 0,22) | y = 401 | 75 x 77 | — |
| portão no julgamento (`p` = 0,92) | y = 616 | 312 x 323 | 94 x 97 |
| centro da faixa esquerda | x = 420 perto, 592 longe | — | — |
| centro da faixa direita | x = 860 perto, 688 longe | — | — |
| corredor | (faixa, 640) | 200 de altura | 60 |
| plaquinha da trava | (640, 470) | 620 x 150 | 186 x 45 |

**O balão nunca encosta na pista.** Ele termina em y = 196 e o horizonte está
em 334: 138 px de céu de folga, e o portão nasce **no** horizonte, minúsculo. A
plaquinha da trava é a única coisa que entra na área de jogo, e só enquanto o
mundo está parado — quando a corrida volta, ela sai.

Nenhuma barra, bolinha ou porcentagem de progresso. O que a criança tem para
olhar é o mapa no fim do trecho.

---

## 6. Níveis e fases

**Os três níveis existem.** Cada um tem 3 trechos de 3 portões.

Aqui, **fase = um trecho corrido**, com 3 portões cada. O que cresce dentro do
nível é o ritmo, não a quantidade: uma corrida de 2 portões não parece corrida,
e uma de 5 logo no primeiro contato cansa antes da criança entender o gesto.

### Nível 1 — Pela casa

Distratora **óbvia**: ou não é tecnologia (liquidificador, ventilador,
vassoura), ou é de uso muito distante da situação.

| Fase | Velocidade | Situação | Resolve | Distratora |
|---|---|---|---|---|
| 1 | 480 | `Que horas são?` | relógio | liquidificador |
| 1 | | `Guardar a comida gelada` | geladeira | ventilador |
| 1 | | `Ouvir uma música` | caixinha de som | vassoura |
| 2 | 545 | `Assistir ao desenho` | televisão | ventilador |
| 2 | | `Esquentar o leite` | micro-ondas | vassoura |
| 2 | | `Falar com a vó que mora longe` | telefone | geladeira |
| 3 | 610 | `Lavar a roupa suja` | máquina de lavar | caixinha de som |
| 3 | | `Guardar a foto do passeio` | câmera | ventilador |
| 3 | | `Descobrir como se faz o bolo` | computador | liquidificador |

### Nível 2 — Da casa até a escola

Aqui a distratora é **plausível**: é sempre uma tecnologia de verdade, do mesmo
ambiente, e às vezes a mesma dupla volta com a resposta trocada. É o par
`merenda` / `marmita` que carrega o nível — geladeira contra micro-ondas nas
duas ordens, uma logo depois da outra. Não dá para decorar o lado nem o objeto:
só serve saber para que cada um serve.

| Fase | Velocidade | Situação | Resolve | Distratora |
|---|---|---|---|---|
| 1 | 545 | `Saber a hora do recreio` | relógio | computador |
| 1 | | `Guardar a merenda gelada` | geladeira | **micro-ondas** |
| 1 | | `Esquentar a marmita` | micro-ondas | **geladeira** |
| 2 | 610 | `Fazer a chamada da turma` | computador | televisão |
| 2 | | `Tocar a música da festa` | caixinha de som | televisão |
| 2 | | `Avisar em casa que a aula acabou` | telefone | computador |
| 3 | 675 | `Pesquisar sobre os planetas` | computador | caixinha de som |
| 3 | | `Guardar a foto do mural` | câmera | televisão |
| 3 | | `Lavar o uniforme sujo` | máquina de lavar | geladeira |

O nível 2 também **muda de clima**: o céu vira fim de tarde, as colinas
esquentam e a grama recebe um tom quente. É a única pista visual de que a
criança mudou de lugar, já que a arte do trecho da escola ainda não existe.

O tutorial roda **só no nível 1**. Quem chegou ao 2 já correu nove portões.

### Nível 3 — A cidade no inverno

O plano original pedia portões **SEM tecnologia** (regador, lápis, maquininha).
Nenhum desses objetos existe no `tecnologias.png`, então o nível 3 pega a mesma
lição por outro caminho, com a arte que há:

> **Os três objetos que sempre foram a resposta errada passam a ser a certa.**

Liquidificador, ventilador e vassoura atravessaram dezoito portões como
distratora. No nível 3 aparecem `Bater o suco de morango`, `Refrescar o quarto
no calor` e `Varrer as folhas da sala`. Quem decorou "o objeto sem tela é o
errado" erra os três de primeira — e é exatamente essa a armadilha que o portão
sem tecnologia existia para armar: o que decide é **o uso**, não a aparência de
aparelho.

| Fase | Velocidade | Situação | Resolve | Distratora |
|---|---|---|---|---|
| 1 | 675 | `Bater o suco de morango` | **liquidificador** | micro-ondas |
| 1 | | `Refrescar o quarto no calor` | **ventilador** | geladeira |
| 1 | | `Varrer as folhas da sala` | **vassoura** | máquina de lavar |
| 2 | 745 | `Fazer gelo para a festa` | geladeira | liquidificador |
| 2 | | `Esquentar a pipoca` | micro-ondas | liquidificador |
| 2 | | `Guardar a foto do aniversário` | câmera | televisão |
| 3 | 815 | `Ver o jornal da noite` | televisão | computador |
| 3 | | `Mandar um recado para o vovô` | telefone | câmera |
| 3 | | `Lavar o lençol da cama` | máquina de lavar | vassoura |

O último portão fecha o argumento: vassoura e máquina de lavar **as duas
limpam**, e só uma lava.

#### O inverno, e os efeitos soltos

O nível 3 corre a 815 no fim — quase o dobro do primeiro trecho do nível 1 — e
liga um pacote que só existe aqui, marcado por `mood.wild` em
[data/levels.ts](./data/levels.ts):

| Efeito | O que é |
|---|---|
| neve | 46 flocos caindo com balanço próprio, na frente do mundo |
| chão nevado | véu branco sobre a grama (`mood.frost`), com a pista limpa por cima |
| céu de inverno | azul acinzentado, colinas geladas, sol lavado |
| rajada de vento | um borrão branco cruzando a tela de tempos em tempos |
| rastro permanente | o corredor deixa fantasma o tempo todo, não só na aceleração |
| riscos de velocidade | ficam sempre acesos, no piso |
| soco de câmera | a cada acerto: zoom curto, tremida leve e estrelas |

Nada disso muda a regra do jogo: é o mesmo portão, a mesma trava e a mesma
decisão — mais rápido e mais barulhento, que é o que a última etapa pede.

## 7. As regras, em código

O veredito é **função da situação no instante em que o portão é atravessado**,
nunca um campo `correto` guardado no portão:

```ts
export const USES: Record<TechId, SituationId[]> = {
  relogio: ['horas'],
  telefone: ['falar-longe'],
  computador: ['receita', 'chamada'],
  vassoura: [],
}

export const solves = (tech: TechId, situation: SituationId) =>
  USES[tech].includes(situation)

export const outcomeOf = (gate: Gate, situation: SituationId) =>
  solves(gate.tech, situation) ? 'open' : 'block'
```

É isso que permite o mesmo computador ser o acerto de `descobrir como se faz o
bolo` e o erro de `ouvir uma música`, e faz o portão SEM tecnologia do nível 3
funcionar sem regra especial: o regador simplesmente tem `['regar']` na lista
dele.

Pontuação interna:

| Situação | Evento | Pontos |
|---|---|---|
| atravessou o certo de primeira | `CORRECT_ANSWER` | +10 |
| atravessou depois da trava | `CORRECT_ANSWER` | +5 |
| 3 acertos seguidos | — | +5 de combo |
| portão errado | `WRONG_ANSWER` + `lives.lose()` | 0 |

Nenhum número de ponto, acerto ou porcentagem aparece na tela.

### Sobre as vidas, e onde o briefing muda

O briefing pede "sem vidas: a corrida sempre vai até o fim". A corrida vai
mesmo — **o jogo nunca termina sozinho, nunca tem tela de derrota própria e
nunca decide reprovação**. Mas as vidas são da plataforma: chegam em `?lives=`,
valem pela partida inteira, e quem as conta é `shared/hud/createLives`, que
emite o `GAME_OVER` no zero. Portão errado é erro de cabeça, então custa uma
vida, como em todos os outros jogos do catálogo. O que o briefing garante e o
jogo cumpre é que nenhum erro encurta o percurso.

### Sobre o relógio

Não tem. A corrida já é o ritmo, e uma barra esvaziando por cima dela cobraria
duas pressas ao mesmo tempo. O tempo total é medido e entra no subtítulo do
painel de fim de nível.

---

## 8. O erro

**A trava.** O corredor entra no portão errado, o portão fecha (grade descendo,
baque surdo), a pista para e o parallax congela. A plaquinha sobe com o objeto
desenhado ao lado de uma linha só:

> `O liquidificador serve para bater frutas.`

O outro portão continua aberto e brilhando. Um toque nele e a corrida volta: o
corredor troca de faixa, atravessa e ganha +5.

Depois de **dois erros no mesmo portão**, o certo pisca. O contador de erros
**zera quando o portão é resolvido** — senão o terceiro erro e todos os
seguintes cobrariam sozinhos, e a regra generosa viraria a mais dura do jogo.

**Chegar sem escolher não é erro.** Se o portão chega e a criança não tocou em
nada, o corredor segue na faixa em que já estava e o resultado vale normalmente
— não existe estado de "não respondeu" que trave o jogo, e não existe punição
por dedo lento. O que ela perde é o combo.

O erro não pode ser:

| Não fazer | Motivo |
|---|---|
| buzina e `tente de novo` | não diz nada sobre o objeto que ela escolheu |
| tirar a criança do lugar e recomeçar o trecho | punir com repetição não ensina o uso |
| mostrar a resposta na primeira tentativa | a plaquinha fala do objeto ERRADO, nunca aponta o certo |
| deixar a corrida seguir por cima do erro | atravessar sem entender é o que o jogo existe para impedir |

---

## 9. Feedback

| Momento | Visual | Som |
|---|---|---|
| balão aparece | desce com `back` e o pictograma dá um pulo | plim curto |
| portões nascem | crescem do horizonte junto com o parallax | — |
| toque na faixa | a faixa acende e o corredor troca de lado, inclinado | toque seco |
| portão certo | as folhas abrem para os lados, luz atravessa, o objeto voa para o canto | arpejo de 3 notas |
| aceleração | rastro atrás do corredor, cenário mais rápido por 1 s | sopro curto |
| combo de 3 | contorno verde piscando nas bordas da tela | mesma nota, um tom acima a cada acerto |
| portão errado | grade descendo, tela treme, moldura vermelha | baque + acorde descendo |
| corredor travado | ele para de costas, ombros caídos, poeirinha nos pés | tropeço fofo |
| plaquinha | sobe de baixo, com o objeto girando devagar | papel |
| destravou | o portão certo abre e ele sai correndo | mola + passos voltando |
| fim do trecho | o mapa monta e cada objeto reconhecido cai no lugar dele | fanfarra curta |

Passos: ruído passa-banda curto, no **mesmo relógio** que move o cenário. Se a
velocidade sobe, o passo sobe junto — tween paralelo descola em um minuto.

Tudo sintetizado em WebAudio, sem arquivo, respeitando `mute-audio` do
`EventBus`.

---

## 10. Tutorial: uma demonstração de 1,5 s, sem texto

A primeira vez que um par de placas se aproxima, o mundo para e uma mão
aparece: ela toca o lado esquerdo — a faixa acende e o corredor vai para lá —,
depois toca o lado direito. O corredor volta para onde estava e a corrida
segue. Nenhuma palavra, nenhum botão, nenhum passo para avançar.

| | |
|---|---|
| Duração | ~1,5 s |
| Toques exigidos | nenhum |
| Texto | nenhum |
| Repetir | o botão `?` roda de novo |

A versão anterior tinha quatro passos escritos, com botão `Próximo`, e levava
uns 15 segundos antes da criança correr pela primeira vez. Para um jogo cujo gesto
é *tocar de um lado ou do outro*, mostrar custa menos que explicar — e o
INSTRUCOES permite o tutorial puramente visual justamente para casos assim.

---

## 11. Textura e Graphics

**É textura:** corredor, portão, os objetos das tecnologias, os pictogramas das
situações, os fundos, os objetos de rua e o mapa. Todos no
[TEXTURAS.md](./TEXTURAS.md).

**É Graphics:** balão, plaquinha, listras da pista, brilho da faixa acesa, luz
do portão abrindo, poeira, rastro, moldura de acerto e erro, cadeado, seta,
estrela, `?`, barra de vidas e painel de fim de nível.

Duas decisões que valem explicar:

- **A pista é `Graphics`, desenhada por cima da grama.** O plano original era
  botar o asfalto dentro do PNG do fundo, por causa da regra da emenda. A arte
  veio desmontada — `grama.png` é só o chão — e isso ficou melhor: o asfalto
  muda todo quadro (listra correndo, faixa acesa, brilho do acerto) e PNG não
  muda. Não há emenda porque a pista fica **em cima** da grama, e não ao lado
  dela: a costura mora dentro do próprio traço do meio-fio.
- **O portão é textura, e é a única peça parecida com interface que virou PNG.**
  Ele é objeto do mundo, cresce chegando na câmera e é onde o olho fica o tempo
  todo; em `Graphics` seria um retângulo. São dois estados só, aberto e
  fechado — a luz, o cadeado e o piscar depois de 2 erros são efeito, e ficam
  no código.

Todo carregamento passa por `import.meta.glob`; todo consumo, por
`textures.exists()`. Cada peça tem desenho de reserva, então o jogo abre e é
jogável com zero PNG na pasta, e nenhum arquivo faltando derruba o `vite build`.

---

## 12. Registro

```
src/games/EF02CO05/corrida-do-cotidiano/
src/assets/games/EF02CO05/corrida-do-cotidiano/
```

| Campo | Valor |
|---|---|
| `id` | `057` |
| `slug` | `corrida-do-cotidiano` |
| `module` | `EF02CO05/corrida-do-cotidiano` |
| `skill` | `EF02CO05` |
| `years` | `[2]` |
| `tags` | `["tecnologia", "cotidiano", "corrida", "toque"]` |
| `order` | `122` |
| `points` | `55` |
| `icon` | `🏃` |

Também em `src/data/gameInstructions.ts` (três linhas) e no conjunto
`GAMES_WITH_IN_GAME_COMPLETION_SCREEN`, em `src/pages/GameDetailsPage.tsx`.

---

## 13. Arquivos

```
types.ts                Tech, Situation, Gate, Phase, Outcome
data/theme.ts           cores, fontes, tamanhos
data/layout.ts          W/H, o horizonte, as duas faixas, a curva de aproximação
data/tech.ts            os 12 objetos, USES, solves(), a frase de cada um
data/levels.ts          LEVELS: as fases e os portões de cada uma
scenes/BootScene.ts     glob + corte das folhas + createLoadingScreen
scenes/GameScene.ts     orquestração. Não desenha nada.
scenes/track.ts         fundo, parallax, listras correndo, faixa acesa
scenes/gate.ts          o portão: nasce longe, cresce, abre ou fecha
scenes/runner.ts        o corredor e a troca de faixa
scenes/balloon.ts       o balão da situação
scenes/trava.ts         a plaquinha e o destrave
scenes/props.ts         os objetos que passam pelas laterais
scenes/neighborhood.ts  o mapa do fim do trecho
scenes/hud.ts           a barra fina do topo
scenes/audio.ts         WebAudio, sem arquivo
```

**A GameScene não desenha.** Se ela precisar de um `fillRoundedRect`, falta um
painter num módulo de `scenes/`.

---

## 14. Antes da arte existir

Cada textura tem reserva em código, no tamanho final:

| Faltando | Reserva |
|---|---|
| `corredor.png` | **entregue** |
| `portao.png` | **entregue** |
| `tecnologias.png` | **entregue** |
| `grama.png`, `casa.png`, `moita.png` | **entregues** |
| `situacoes.png` | o balão fica só com a frase |
| `mapa-bairro.png` | três círculos rotulados: casa, escola, praça |
| `cover-...png` | nenhuma; sem ele o jogo não entra no catálogo |

A reserva de cada peça usa **a mesma projeção** da textura (§2 do
[PISTA.md](./PISTA.md)), para o layout não mudar quando a arte chega.

---

## 15. O que mudou na construção

**O portão virou duas placas de beira de pista.** A arte do portão chegou com
uma placa de 161 x 73 px para receber um objeto quadrado de 350: encaixado ali,
o relógio teria 20 px reais no celular na hora de decidir, e ninguém distingue
micro-ondas de máquina de lavar a 20 px. A decisão é o objeto, então o objeto
passou a mandar no desenho: cada faixa ganhou um poste na borda de fora com um
painel de 262 sobre ela, e o objeto dentro dele tem 196 px — 88 px reais no
momento do julgamento. Tudo em `Graphics`, o que também resolveu os três
estados (parada, acerto, bloqueio) que um PNG não faria.

**A trava ganhou cancela.** Sem portão para fechar, o bloqueio precisava de
outro corpo: uma cancela listrada desce atravessando a faixa errada, na frente
do corredor, e a placa fica âmbar com cadeado. A faixa certa continua aberta ao
lado — é o que faz a saída ser óbvia sem apontar a resposta.

**A plaquinha do erro foi para o lugar do balão.** Ela precisava de 880 px de
largura para caber a frase com o objeto ao lado, e não existe faixa livre no
meio da tela: embaixo está o corredor, no meio estão as duas placas. Como o
balão sai de cena no instante da decisão, o topo fica vago exatamente quando a
plaquinha precisa dele.

**As velocidades caíram.** O plano previa 620 a 806 unidades por segundo. Na
tela isso deixava menos de um segundo com o objeto grande o bastante para ser
reconhecido. Ficaram 480, 545 e 610, o que dá de 3,4 a 4,3 segundos entre a
placa nascer e ser julgada — e a sensação de velocidade não caiu junto, porque
ela vem das casas e moitas passando de lado, não do avanço em si.

**O mapa do bairro saiu.** Ele virou um cartão no canto superior direito e foi
removido depois de jogado: era interface parada ocupando um canto da tela e
disputando atenção com a corrida. O acerto agora se mostra no próprio lugar
onde aconteceu — o objeto salta da placa, cresce e some com estrelas.

**A pista inteira ficou em `Graphics`.** Ver §11 e o [PISTA.md](./PISTA.md).
