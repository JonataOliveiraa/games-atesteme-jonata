# Vila das Máquinas - EF02CO03

Documento irmão: [TEXTURAS.md](./TEXTURAS.md)

RPG leve de micro-missões para 2º ano: um morador mostra um problema por
pictograma, e a criança toca na máquina que entende os comandos capazes de
resolver aquilo.

O briefing foi simplificado. Em vez de três moradores simultâneos, diálogos
longos e missão dupla que exige memorizar duas máquinas, a tela mostra **uma
missão por vez**. No nível 3 ainda há duas etapas, mas só uma fica ativa por vez:
primeiro escolher quem leva, depois escolher quem assa.

---

## 1. A habilidade, e o teste que ela precisa passar

> **(EF02CO03)** Identificar que máquinas diferentes executam conjuntos próprios
> de instruções e que podem ser usadas para definir algoritmos.

Objeto: **Instrução de máquina**.

Exemplo oficial: nesta etapa, o aluno poderia começar a identificar que alguns
conjuntos de instruções bem definidos, como operações aritméticas simples de uma
calculadora ou operações de dobradura, podem ser usados em sequências definidas
para produzir coisas.

O teste da bolinha é este: **troque robô-vassoura, drone e forninho por bolinhas
sem função. O jogo muda?**

Muda. A decisão depende do conjunto de instruções que cada máquina entende:
`VARRER/GIRAR`, `VOAR/SOLTAR`, `ASSAR/APITAR`. Sem essa relação, tocar uma
máquina vira chute visual.

Alinhamento com o código BNCC:

| Campo | Valor no jogo |
|---|---|
| Código | `EF02CO03` |
| Ano | 2º ano |
| Unidade | Mundo Digital |
| Objeto | Instrução de máquina |
| Verbo da habilidade | identificar |
| Evidência jogável | escolher a máquina pelo conjunto de comandos e ver esses comandos executando a missão |

---

## 2. Como isso não vira o jogo irmão

Já existe um jogo publicado para EF02CO03: **Fábrica de Máquinas**.

| Jogo | O que a criança faz | Diferença pedagógica |
|---|---|---|
| Fábrica de Máquinas | Arrasta várias máquinas para uma esteira na ordem correta para fabricar produto. | Trabalha sequência de produção com muitas etapas e ordem global. |
| Vila das Máquinas | Toca na máquina que entende os comandos necessários para uma micro-missão da vila. | Trabalha o repertório próprio de cada máquina: cada uma só executa alguns comandos. |

O irmão pergunta "qual é a ordem das etapas?". Este pergunta "qual máquina sabe
fazer esse tipo de instrução?".

---

## 3. O laço

```
morador entra com problema em pictograma
-> máquinas ficam no galpão, cada uma com dois ícones de comando
-> criança toca uma máquina
-> máquina vai até o problema
-> seus dois comandos acendem e são executados
-> se os comandos resolvem, missão fecha e morador comemora
-> se não resolvem, falha cômica curta e TRAVA na escolha
-> depois de 3 missões, catálogo visual das máquinas aparece
```

Controle: **um toque em uma máquina visível**. No nível 3, continuam sendo
escolhas de uma máquina por vez; a segunda etapa só aparece depois que a primeira
foi resolvida.

---

## 4. Clareza para criança

| Conceito | Como a tela mostra |
|---|---|
| problema | pictograma grande no pedido e a cena real no palco da vila |
| comando da máquina | dois ícones fixos sob a máquina, na ordem em que ela executa |
| máquina certa | seus ícones combinam com o que o problema pede |
| execução | ícones acendem um por um enquanto a máquina age |
| erro | a máquina tenta usar seus próprios comandos e falha de forma engraçada |
| progresso | um selo por missão, preenchido com a máquina que resolveu |

Texto durante a partida é legenda curta, nunca frase longa: `FOLHAS`, `PÃO`,
`GATINHO`.

---

## 5. A grade

Tela fixa de **1280 x 720** com `Phaser.Scale.FIT`.

| Faixa | y | Conteúdo |
|---|---|---|
| HUD | 0 - 82 | nível, 3 selos de missão, botão `?` em (1210, 42) |
| Pedido | 82 - 200 | morador + pictograma do problema + legenda de 1 palavra |
| Vila | 201 - 479 | palco da execução: chão em y 430, cena do problema, máquina em ação |
| Galpão | 474 - 720 | máquinas em botões de 320 x 190, com dois comandos sob cada uma |

Posição dos botões, conforme quantas máquinas a missão mostra:

| Máquinas | Centros |
|---|---|
| 2 | 400, 880 |
| 3 | 240, 640, 1040 |

---

## 6. Máquinas e comandos

| Máquina | Comandos fixos | O que resolve |
|---|---|---|
| robô-vassoura | `GIRAR`, `VARRER` | folhas, poeira, sujeira em cantos |
| drone | `VOAR`, `SOLTAR` | entregar item em lugar alto, levar algo leve |
| forninho | `ASSAR`, `APITAR` | pão, bolo, comida crua |

A ordem das plaquinhas é a ordem de execução: a criança lê da esquerda para a
direita e vê acontecer nessa ordem.

---

## 7. Níveis e fases

A **fase deste jogo é uma micro-missão**. Cada nível tem 3 missões.

| Nível | Missões | Máquinas visíveis | O que cresce |
|---|---|---|---|
| 1 | 3 missões 1-a-1 | 2 máquinas por missão | associar comando óbvio ao problema |
| 2 | 3 missões com 3 máquinas | 3 máquinas | comparar comandos parecidos |
| 3 | 3 missões, uma com 2 etapas | 3 máquinas | algoritmo que combina máquinas, uma etapa por vez |

Conteúdo do nível 1, o único implementado:

| Missão | Problema visual | Máquina certa | Distrator | Comandos que acendem |
|---|---|---|---|---|
| 1.1 | folhas na calçada | robô-vassoura | forninho | `GIRAR -> VARRER` |
| 1.2 | pão cru na mesa | forninho | drone | `ASSAR -> APITAR` |
| 1.3 | lanchinho para o gatinho no telhado | drone | robô-vassoura | `VOAR -> SOLTAR` |

---

## 8. As regras, em código

A regra compara o que a etapa pede com os comandos que a máquina executa.

```ts
export function canRunStep(machine: MachineDef, step: MissionStep) {
    return step.requiredCommands.every(command => machine.commands.includes(command))
}
```

O veredito sai dos comandos, não de um campo `correctMachineId`. É isso que
preserva a ideia da habilidade: a máquina é escolhida porque entende o conjunto
necessário de instruções.

Pontuação interna:

| Situação | Evento | Pontos |
|---|---|---|
| etapa correta de primeira | `CORRECT_ANSWER` | +10 |
| etapa correta depois da TRAVA | `CORRECT_ANSWER` | +5 |
| máquina sem os comandos necessários | `WRONG_ANSWER` + `lives.lose()` | 0 |

Nenhum número de ponto aparece na tela.

---

## 9. O erro

1. A máquina escolhida vai até o problema.
2. Seus dois comandos acendem, porque ela sempre tenta fazer o que sabe.
3. A gag curta acontece, e o problema continua igual.
4. Os dois comandos ficam cinza: eles rodaram e não serviram.
5. O pictograma do comando que faltou pulsa em cima do problema.
6. A máquina volta ao galpão e o botão dela fica gasto até o fim da missão.
7. Depois de 2 erros na mesma etapa, a máquina certa pulsa.

O botão gasto existe para o erro custar UMA vida, e não uma por toque repetido
na mesma máquina que a criança já viu falhar.

Gags do nível 1:

| Escolha incompatível | Cena |
|---|---|
| forninho nas folhas | esquenta, apita e as folhas continuam lá |
| drone no pão cru | levanta a massa, solta de volta e ela continua crua |
| vassoura no telhado | gira, varre o chão e olha para cima sem alcançar |

Frase de apoio, no máximo 3 palavras: `Procure quem varre.`, `Procure quem
voa.`, `Procure quem assa.`

---

## 9b. O modo cena

Quando a criança toca numa máquina, o jogo **apaga a interface inteira e fecha
a câmera na ação**. Some o nível, os selos, o `?`, o painel do pedido, o galpão,
a moldura do palco e os corações. Ficam a máquina, as duas plaquinhas dela e o
problema.

A razão é a de sempre neste jogo: o que precisa ser visto é o comando
acontecendo. Com a tela cheia de interface, a execução vira um detalhe no meio
do resto.

O enquadramento tem três tempos, e cada missão declara os seus em
`problems.ts`:

| Tempo | O que mostra | Como |
|---|---|---|
| abertura | a máquina chegando e o problema | `shot`, entre 1.42x e 1.5x |
| trabalho | fecha na máquina enquanto os comandos acendem | 1.8x em cima dela |
| detalhe | o problema mudando de estado | `detail`, de 1.5x a 1.85x |

A câmera **acompanha** quem se move: a vassoura atravessando a calçada e o drone
subindo ao telhado têm o mesmo tempo de tween da máquina e do enquadramento.

Três regras que o código garante sozinho:

- **A câmera nunca mostra o vazio.** Todo alvo passa por um `clamp` que o prende
  ao retângulo que ainda cabe naquele zoom, porque o `bg-vila.png` cobre
  exatamente 1280 x 720 e um pixel a mais é faixa preta.
- **As plaquinhas acompanham a máquina** quando ela atravessa a cena — menos no
  drone, onde subir junto as faria bater no balão do desejo do gatinho.
- **O erro e o acerto são contados fora da cena.** `WRONG_ANSWER`, a perda de
  vida, o selo e a frase de apoio acontecem depois que a câmera volta: com o
  zoom aberto, o painel de fim de nível e a frase nasceriam fora de quadro.

Com `prefers-reduced-motion`, o zoom cai para 30% da aproximação pedida.

---

## 10. Feedback

| Momento | Visual | Som |
|---|---|---|
| missão aparece | morador acena e o pictograma pula | sino curto |
| toque na máquina | botão afunda e a máquina sai do galpão | clique macio |
| comando acende | plaquinha ganha cor, anel e brilho | plim curto |
| vassoura acerta | gira, atravessa a calçada e as folhas voam | motor + vassoura |
| drone acerta | sobe em arco com o pacote e solta no telhado | zumbido + plim |
| forninho acerta | luz aquece, a massa doura e cresce | calor + bip |
| erro | comandos ficam cinza e a cena não muda | boing curto |
| missão fecha | selo enche com a máquina que resolveu | acorde curto |
| fim do nível | catálogo das máquinas com comandos acesos | fanfarra |

---

## 11. Tutorial

Quatro passos curtos, disparados na primeira missão e reabertos pelo `?`:

| Passo | Frase | Alvo |
|---|---|---|
| 1 | `O morador tem um problema.` | painel do pedido |
| 2 | `Cada máquina sabe dois comandos.` | plaquinhas da máquina certa |
| 3 | `Toque na máquina que resolve.` | botão da máquina certa, com dedo |
| 4 | `Ela resolve e o selo acende!` | fileira de selos |

---

## 12. Texturas

Seis arquivos, todos já entregues em
`src/assets/games/EF02CO03/vila-das-maquinas/`:

| Arquivo | Grade real | Uso |
|---|---|---|
| `maquinas.png` | 900 x 600, quadros de 300 x 300 | 3 máquinas em repouso + 3 em ação |
| `icones-comandos.png` | 1536 x 256, quadros de 256 x 256 | varrer, girar, voar, soltar, assar, apitar |
| `itens.png` | 600 x 400, quadros de 200 x 200 | folhas, massa e pacote, antes e depois |
| `morador.png` | 750 x 250, quadros de 250 x 250 | pedindo, comemorando, preocupado |
| `gato-e-peixe.png` | 500 x 250, quadros de 250 x 250 | o gatinho e o petisco do desejo |
| `bg-vila.png` | 1672 x 941 | fundo da vila |
| `cover-vila-das-maquinas.png` | 1672 x 941 | capa do catálogo |

Todo o resto é `Graphics`: palco, chão, galpão, mesa, calçada, casa, telhado,
gatinho, balão de desejo, plaquinhas, selos, botões e catálogo final.

Cada consumo passa por `textures.exists()`, e o desenho antigo continua no
código como reserva — o jogo roda igual se uma folha faltar.

---

## 13. Registro

| Onde | O que entrou |
|---|---|
| `src/data/catalog.ts` | id `055`, order `105`, `module: "EF02CO03/vila-das-maquinas"` |
| `src/data/gameInstructions.ts` | 3 linhas de como jogar |
| `src/pages/GameDetailsPage.tsx` | slug em `GAMES_WITH_IN_GAME_COMPLETION_SCREEN` |

---

## 14. O que mudou na construção

**O palco não é um painel opaco.** A primeira ideia era um cartão cremoso
cobrindo a faixa da vila. Ele apagava o `bg-vila.png` inteiro, que é a coisa
mais bonita da tela. Virou um véu claro com borda: a vila continua aparecendo e
o palco continua se distinguindo do fundo.

**As plaquinhas viajam com a máquina.** Deixá-las paradas no botão enquanto a
máquina trabalhava lá em cima quebrava o elo entre "o que ela sabe" e "o que ela
está fazendo". Agora elas sobem junto e param acima da máquina, e é lá que
acendem.

**A máquina errada gasta o botão.** Sem isso, tocar duas vezes na mesma máquina
que já falhou custava duas vidas pelo mesmo engano. O botão gasto encerra o
assunto: aquela máquina já mostrou o que sabe.

**A ordem das plaquinhas é a ordem da execução.** O briefing listava
`VARRER, GIRAR` para a vassoura mas mandava executar `GIRAR -> VARRER`. Ler numa
ordem e ver noutra é ruído para criança de 7 anos; o código usa a ordem da
execução nos dois lugares.

**O giro não é `angle`.** Rodar 360° no `angle` deixava o robô de cabeça para
baixo no meio do movimento — a única pose que uma vassoura de chão nunca faz. O
`GIRAR` virou uma volta no próprio eixo, com `scaleX` indo de 1 a -1 e voltando
duas vezes.

**A tira de comandos é presa ao palco.** Ela para acima da máquina, mas com a
posição limitada às bordas do palco: no primeiro layout a plaquinha da esquerda
saía do painel e ficava boiando em cima da vila.

**O quadro de `maquinas.png` é quadrado, não 3:2.** Declarei `frameHeight: 200`
numa folha de 900 x 600 em grade 3 x 2, e o Phaser não reclama: ele divide, acha
3 x 3 = 9 quadros, e o "quadro 0" vira o terço de cima do robô. A pose de ação
ficou pior ainda, porque o índice 3 caiu na faixa do meio, metade de uma máquina
e metade da outra. Grade 3 x 2 em 600 de altura dá quadros de 300.

**O tinte não varia a cor de um sprite colorido, escurece.** As folhas soltas
levavam `setTint` com laranja e vermelho para parecerem diferentes entre si; o
tinte multiplica, e sobre uma folha que já é laranja o resultado é marrom. Só
tons quase brancos passam.

**O pictograma do pedido do gatinho continua em `Graphics`.** `itens.png` traz o
lanchinho, e o lanchinho é a SOLUÇÃO. O balão do morador precisa mostrar quem
está com fome, não o que resolve. (Isso valeu até o `gato-e-peixe.png` chegar;
agora o pedido usa o gatinho de sprite, e a regra continua: o que aparece no
balão é o problema.)

**A fumaça branca sumia dentro das nuvens.** O `bg-vila.png` tem nuvens brancas
bem em cima da chaminé. A fumacinha virou cinza-azulada com contorno, que lê
tanto no céu quanto na nuvem.

**A chaminé mudou de lugar duas vezes.** No topo do telhado o gatinho a
escondia; à direita, ela caía justo onde o pacote pousa. Ficou no caimento da
esquerda, que é o único trecho de telhado que nada mais usa.

**O balão do desejo e a tira de comandos brigavam pelo mesmo canto.** Na missão
do gatinho a tira agora não sobe com o drone, e o plano de detalhe é o mais
aberto dos três — é o único que precisa caber quatro coisas ao mesmo tempo.
