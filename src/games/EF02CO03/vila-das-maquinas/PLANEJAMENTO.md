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
→ três máquinas ficam no galpão, cada uma com dois ícones de comando
→ criança toca uma máquina
→ máquina vai até o problema
→ seus dois comandos acendem e são executados
→ se os comandos resolvem, missão fecha e morador comemora
→ se não resolvem, falha cômica curta e TRAVA na escolha
→ depois de 3 missões, catálogo visual das máquinas aparece
```

Controle: **um toque em uma máquina visível**. No nível 3, continuam sendo
escolhas de uma máquina por vez; a segunda etapa só aparece depois que a primeira
foi resolvida.

---

## 4. Clareza para criança

O jogo não deve depender de leitura constante.

| Conceito | Como a tela mostra |
|---|---|
| problema | pictograma grande: folhas, telhado, pão cru, janela alta, massa do bolo |
| comando da máquina | dois ícones fixos sob a máquina |
| máquina certa | seus ícones combinam visualmente com o problema |
| execução | ícones acendem um por um enquanto a máquina age |
| erro | a máquina tenta usar seus próprios comandos e falha de forma engraçada |
| algoritmo de 2 etapas | trilha com dois cartões: etapa 1 acesa, etapa 2 apagada até chegar sua vez |

Texto durante a partida deve ser legenda curta, nunca frase longa:
`FOLHAS`, `TELHADO`, `PÃO`, `JANELA`, `BOLO`.

---

## 5. A grade

Tela fixa de **1280 x 720** com `Phaser.Scale.FIT`. Num celular em pé, a tela
vira uma faixa 16:9; ela não recompõe. A coluna "No celular" usa fator 0,30.

| Faixa | y | Conteúdo | Tamanho | No celular |
|---|---|---|---|---|
| HUD | 0 - 82 | 3 casas/selo de missão, botão `?` em (1210, 42) | `?` hitbox 144 x 144 | 43 x 43 toque |
| Pedido | 82 - 210 | morador + pictograma grande do problema + legenda de 1 palavra | pictograma 96; fonte 40 | 29; fonte 12 |
| Vila | 210 - 470 | área de execução: calçada, telhado, janela, forninho ou mesa | alvo 560 x 240 | 170 x 73 |
| Galpão | 470 - 720 | três máquinas em botões grandes, com dois comandos sob cada uma | botão 320 x 190 | 97 x 58 |

Botões das máquinas:

| Máquina | Área |
|---|---|
| robô-vassoura | x 80 - 400, y 500 - 690 |
| drone | x 480 - 800, y 500 - 690 |
| forninho | x 880 - 1200, y 500 - 690 |

O pedido fica no alto e o galpão sempre no rodapé. A criança não precisa
procurar máquina em mapa.

---

## 6. Máquinas e comandos

| Máquina | Comandos fixos | O que resolve |
|---|---|---|
| robô-vassoura | `VARRER`, `GIRAR` | folhas, poeira, sujeira em cantos |
| drone | `VOAR`, `SOLTAR` | entregar item em lugar alto, levar algo leve |
| forninho | `ASSAR`, `APITAR` | pão, bolo, comida crua |

Os comandos são sempre os mesmos. A criança aprende por repetição visual: cada
máquina tem uma "língua" própria.

---

## 7. Níveis e fases

A **fase deste jogo é uma micro-missão**. Cada nível tem 3 missões.

| Nível | Missões | Máquinas visíveis | O que cresce |
|---|---|---|---|
| 1 | 3 missões 1-a-1 | 2 máquinas por missão | associar comando óbvio ao problema |
| 2 | 3 missões com 3 máquinas | 3 máquinas | comparar comandos parecidos e escolher pelo que a máquina entende |
| 3 | 3 missões, uma com 2 etapas | 3 máquinas | ver que algoritmo pode combinar máquinas, mas uma etapa de cada vez |

Conteúdo:

| Missão | Problema visual | Máquina certa | Comandos que acendem |
|---|---|---|---|
| 1.1 | folhas na calçada | robô-vassoura | `GIRAR -> VARRER` |
| 1.2 | pão cru na mesa | forninho | `ASSAR -> APITAR` |
| 1.3 | lanchinho para gatinho no telhado | drone | `VOAR -> SOLTAR` |
| 2.1 | poeira atrás do sofá | robô-vassoura | `GIRAR -> VARRER` |
| 2.2 | bilhete na janela alta | drone | `VOAR -> SOLTAR` |
| 2.3 | bolo cru da festa | forninho | `ASSAR -> APITAR` |
| 3.1 | folhas no canto apertado | robô-vassoura | `GIRAR -> VARRER` |
| 3.2 | presente leve na varanda | drone | `VOAR -> SOLTAR` |
| 3.3a | massa precisa chegar ao forninho | drone | `VOAR -> SOLTAR` |
| 3.3b | massa chegou crua ao forninho | forninho | `ASSAR -> APITAR` |

Na missão 3.3, a tela mostra dois cartões pequenos no topo:
`LEVAR` e `ASSAR`. Só `LEVAR` fica aceso no começo. Depois que o drone completa,
`ASSAR` acende. A criança não precisa guardar a sequência.

---

## 8. As regras, em código

A regra compara o problema com os comandos que a máquina executa.

```ts
type MachineId = 'sweeper' | 'drone' | 'oven'
type Command = 'sweep' | 'turn' | 'fly' | 'drop' | 'bake' | 'beep'
type Need = 'clean' | 'highDelivery' | 'bakeFood'

type Machine = {
  id: MachineId
  commands: Command[]
}

type MissionStep = {
  need: Need
  requiredCommands: Command[]
}

function canRunStep(machine: Machine, step: MissionStep) {
  return step.requiredCommands.every((command) => machine.commands.includes(command))
}
```

O veredito sai dos comandos, não de um campo `correctMachineId`. Isso preserva a
ideia BNCC: a máquina é escolhida porque entende o conjunto necessário de
instruções.

Pontuação interna:

| Situação | Evento | Pontos |
|---|---|---|
| etapa correta de primeira | `CORRECT_ANSWER` | +10 |
| etapa correta depois da TRAVA | `CORRECT_ANSWER` | +5 |
| máquina sem comandos necessários | `WRONG_ANSWER` + `lives.lose()` | 0 |

Nenhum número de ponto aparece na tela.

---

## 9. O erro

Erro precisa mostrar "essa máquina não entende esse comando", sem muito texto.

TRAVA:

1. A máquina escolhida vai até o problema.
2. Seus dois comandos acendem, porque ela sempre tenta fazer o que sabe.
3. O comando que não serve fica cinza e a cena faz uma gag curta.
4. O problema original pulsa com o pictograma do comando necessário.
5. A máquina volta ao galpão.
6. Só tocar uma máquina que tenha os comandos necessários destrava.
7. Depois de 2 erros na mesma etapa, a plaquinha correta pulsa.

Exemplos de gag:

| Escolha incompatível | Cena |
|---|---|
| forninho nas folhas | forninho apita, esquenta um pouco e as folhas continuam lá |
| vassoura no telhado | robô-vassoura gira no chão e olha para cima sem alcançar |
| drone no pão cru | drone voa com o pão, mas ele continua cru |
| forninho no bilhete alto | forninho apita embaixo da janela e não consegue subir |

Frase opcional, no máximo 5 palavras:

| Erro | Frase |
|---|---|
| precisa limpar | `Procure quem varre.` |
| precisa levar alto | `Procure quem voa.` |
| precisa assar | `Procure quem assa.` |

---

## 10. Feedback e diversão

| Momento | Visual | Som |
|---|---|---|
| missão aparece | morador acena e pictograma pula | sino curto |
| toque na máquina | botão afunda e comandos brilham | clique macio |
| robô-vassoura acerta | gira, varre folhas e deixa rastro limpo | motorzinho + vassoura |
| drone acerta | voa em arco e solta item no alvo | zumbido leve + plim |
| forninho acerta | luz aquece, comida cresce e apita | calor suave + bip |
| erro | máquina tenta seu próprio comando e falha engraçado | boing curto |
| etapa dupla avança | cartão `LEVAR` fecha, cartão `ASSAR` acende | plim de troca |
| fim do nível | catálogo das 3 máquinas com comandos acesos | fanfarra curta |

Diversão com clareza:

| Recurso | Como usar |
|---|---|
| máquinas com personalidade | vassoura gira, drone balança no ar, forninho pisca a luz |
| comandos que acendem | criança vê a "linguagem" da máquina funcionando |
| problema muda de estado | folhas somem, bilhete chega, pão assa |
| falhas bobas | erro ensina sem susto e sem humilhar |
| catálogo final | mostra cada máquina com seus dois comandos como coleção visual |

---

## 11. Tutorial

Exemplo animado de 5 segundos, pulável:

| Passo | Frase curta | Cena |
|---|---|---|
| 1 | `FOLHAS` | folhas aparecem na calçada |
| 2 | `QUEM VARRE?` | comando `VARRER` pulsa na plaquinha da vassoura |
| 3 | `TOQUE` | dedo toca o robô-vassoura |
| 4 | `LIMPOU!` | robô gira, varre e o selo acende |

O botão `?` pausa e reabre o tutorial. Sem narração e sem painel longo.

---

## 12. Textura mínima e o que fica no código

Pouca textura. A vila deve funcionar em `Graphics`, e as máquinas podem ter
sprites para carisma.

| Elemento | Fazer em |
|---|---|
| vila, chão, casas simples, galpão | Graphics |
| moradores | Graphics simples |
| problemas: folhas, pão, gatinho, bilhete, massa | Graphics/pictogramas |
| cartões de missão e plaquinhas de comando | Graphics |
| ícones de comando | spritesheet pequena opcional, fallback em Graphics |
| máquinas | spritesheet única |
| efeitos, brilho, cadeado, selo, estrelas | Graphics/shared |
| background da vila | opcional |
| capa | PNG |

Sem textura para plaquinhas completas, balões, botões, catálogo, `?`, estrelas
ou cadeado. Esses elementos mudam de estado e ficam mais seguros em código.

Todo carregamento de textura usa `import.meta.glob`, e todo consumo passa por
`textures.exists()`.

---

## 13. Produção

Ordem recomendada:

1. dados das máquinas e função `canRunStep`;
2. layout com pedido, área de execução e três botões de máquina;
3. placeholders em Graphics para máquinas, comandos e problemas;
4. animação de sucesso das três máquinas;
5. TRAVA e falhas cômicas;
6. nível 1 completo;
7. missão dupla simplificada do nível 3;
8. catálogo final e eventos da plataforma;
9. texturas opcionais.

Para implementação inicial, seguir a regra do projeto: construir **1 nível só
para teste**, avisar o usuário e mostrar o resultado antes de expandir para os
3 níveis planejados.

---

## 14. Registro

Pasta do jogo:

```
src/games/EF02CO03/vila-das-maquinas/
```

Pasta de assets:

```
src/assets/games/EF02CO03/vila-das-maquinas/
```

Slug: `vila-das-maquinas`

Título: `Vila das Máquinas`

Entrada futura no catálogo:

| Campo | Valor |
|---|---|
| `slug` | `vila-das-maquinas` |
| `module` | `EF02CO03/vila-das-maquinas` |
| `skill` | `EF02CO03` |
| `years` | `[2]` |
| `tags` | `["máquinas", "instruções", "algoritmos", "toque"]` |
| `category` | `Mundo Digital` |
| `points` | `60` |
| `icon` | sugerido: engrenagem ou máquina |

Também registrar:

| Arquivo | O que entra |
|---|---|
| `src/data/gameInstructions.ts` | 3 linhas: veja o problema, toque na máquina, observe os comandos |
| `src/pages/GameDetailsPage.tsx` | incluir em `GAMES_WITH_IN_GAME_COMPLETION_SCREEN` se usar painel interno |

---

## 15. O que mudou na construção

Preencher depois da implementação.
