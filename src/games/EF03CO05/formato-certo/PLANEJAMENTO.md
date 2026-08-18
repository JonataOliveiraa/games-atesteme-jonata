# Formato Certo — Planejamento geral

**EF03CO05** · 3º ano · Mundo Digital · Codificação da informação
*Compreender que dados são estruturados em formatos específicos dependendo da informação armazenada.*

Documentos irmãos: [VISUAL.md](./VISUAL.md) · [MECANICA.md](./MECANICA.md)

---

## 1. A ideia em uma frase

**A criança guarda uma informação numa caixa e depois manda um leitor tentar ler de volta.**
Se a caixa não serve, ou os dados estão no lugar errado, o leitor mostra a bobagem que saiu — e é essa bobagem que ensina.

Tudo no jogo existe para tornar visível uma coisa que normalmente é invisível: *a estrutura*. A informação "18 de junho de 2026" não muda. O que muda é a caixa onde ela mora, e a caixa decide se dá para recuperá-la depois.

## 2. Por que reescrever em vez de consertar

A versão atual tem 1110 linhas numa única `GameScene`, com a paleta, o layout, os painters e a lógica misturados no mesmo arquivo — o mesmo estado em que o Chef dos Subproblemas estava antes do refactor. Isso sozinho já justificaria o trabalho, mas não é o motivo principal.

O motivo principal é de design: **os três níveis são a mesma tarefa**. `LEVELS` define `mode: 'pixels' | 'date' | 'text'` e cada nível preenche três encaixes com peças diferentes. A tela de escolher formato existe (`drawChooseScreen`), mas o nível já declara `requiredFormat`, então escolher é um palpite de 1 em 3 sem consequência: errar não mostra nada, acertar não ensina nada.

A habilidade da BNCC não é "arraste três peças". É *perceber que a estrutura é uma decisão*. Isso pede uma progressão, e uma progressão não se enxerta num jogo cuja arquitetura assume uma tarefa só.

Herdamos coisas boas e elas ficam: o conteúdo de `data/levels.ts` (a data 18/06/2026, a faixa de cores, o código A-12) é bom e vira a base das missões novas.

## 3. O que a criança faz — o ciclo

O ciclo do briefing é **ler → escolher/montar → preencher → testar a recuperação**. No jogo ele vira quatro momentos, sempre na mesma ordem:

1. **PEDIDO** — um cartão no alto diz, em português normal, o que precisa ser guardado. *"A festa da escola é em 18 de junho de 2026."*
2. **CAIXA** — a criança escolhe (N1) ou recebe (N2, N3) a caixa de formato: Data, Pixels ou Texto. Cada caixa mostra na cara dela como guarda: campos rotulados, grade de pontos, fileira de posições.
3. **PREENCHER** — arrasta as peças da bandeja para os campos da caixa.
4. **TESTAR** — aperta **LER** no leitor, à direita. O leitor tenta recuperar a informação e mostra o resultado.

O passo 4 é o jogo. Os outros três são preparação.

## 4. Progressão dos níveis

Os três níveis são as três linhas do briefing, nesta ordem.

### Nível 1 — Escolher a caixa

> *"Usar formatos básicos dados pelo jogo e associá-los a exemplos evidentes."*

Três caixas na bancada, uma informação no pedido. A criança escolhe a caixa, ela se abre e revela os campos, e aí preenche.

Escolher errado tem consequência visível: a caixa aceita a peça, mas na hora de LER o leitor falha e diz **por quê** naquele caso concreto — "essa caixa guarda pontos de cor, e você me deu um mês". A criança volta e troca a caixa. Esse é o momento em que a associação informação↔formato deixa de ser adivinhação.

### Nível 2 — A mesma informação, outra caixa

> *"Preencher formatos diferentes com a mesma informação em contextos distintos."*

Agora são **duas caixas ao mesmo tempo**, e o pedido é um só. A mesma data vai para a caixa Data (do convite) e para a caixa Texto (do nome do arquivo da foto). O leitor só lê depois que as duas estiverem certas, e mostra as duas leituras lado a lado — idênticas em significado, diferentes em forma.

Uma das missões tem uma caixa com **menos campos do que peças disponíveis**: o mural do aniversário guarda dia e mês, e o ano fica na bandeja. Sobrar peça não é erro. É a lição: o formato decide o que cabe.

### Nível 3 — Consertar o formato

> *"Corrigir formatos inadequados e reorganizar dados para que a informação possa ser lida corretamente."*

A caixa chega preenchida e errada. A criança lê a falha, entende o defeito e conserta. Um defeito por missão, em ordem crescente de sutileza:

| Missão | Defeito | O que o leitor mostra |
|---|---|---|
| 3.1 | **Ordem trocada** | `1A-2` em vez de `A-12` |
| 3.2 | **Campo errado** | `dia 2026 · mês junho · ano 18` — e "não existe dia 2026" |
| 3.3 | **Peça intrusa** | a imagem com um buraco onde entrou um calendário |

## 5. As nove missões

Três por nível. Conteúdo herdado da versão atual onde fazia sentido.

### Nível 1 — Escolher a caixa

| # | Pedido | Caixa certa | Peças corretas | Leitura de sucesso |
|---|---|---|---|---|
| 1.1 | "A festa da escola é em 18 de junho de 2026." | **Data** | `18` · `junho` · `2026` | *18 de junho de 2026* |
| 1.2 | "Guarde a faixa da bandeira: vermelho, azul, amarelo." | **Pixels** | 🔴 · 🔵 · 🟡 | a faixa desenhada |
| 1.3 | "A placa da sala é A-12." | **Texto** | `A` · `-` · `1` · `2` | *A-12* |

Em cada missão a bandeja traz **duas peças distratoras** de outro tipo — uma estrela, uma placa "sala 4", uma gota de tinta — que não têm campo nenhum onde caber. Elas existem para a escolha da caixa ter peso.

### Nível 2 — A mesma informação, outra caixa

| # | Pedido | Caixa A | Caixa B | Observação |
|---|---|---|---|---|
| 2.1 | "A data 18/06/2026 vai no convite **e** no nome da foto." | Data: `18`·`junho`·`2026` | Texto: `18`·`-`·`06` | mesma data, duas formas |
| 2.2 | "As cores da bandeira vão no desenho **e** na lista do pintor." | Pixels: 🔴·🔵·🟡 | Texto: `vermelho`·`azul`·`amarelo` | cor como ponto e como palavra |
| 2.3 | "O aniversário da Luna, 12 de abril de 2026, vai no mural **e** na etiqueta." | Data curta: `12`·`abril` (sem ano) | Texto: `12`·`/`·`04` | **o ano sobra, e está certo** |

### Nível 3 — Consertar o formato

| # | Estado inicial (errado) | Conserto | Leitura de falha |
|---|---|---|---|
| 3.1 | Texto: `1` `A` `-` `2` | reordenar para `A` `-` `1` `2` | *"Li: 1A-2. Não é uma placa."* |
| 3.2 | Data: dia=`2026`, mês=`junho`, ano=`18` | trocar dia e ano | *"Dia 2026? Não existe dia 2026."* |
| 3.3 | Pixels: 🔴 `18` 🟡 | tirar o `18`, pôr 🔵 | *"O ponto 2 não é uma cor. Ficou buraco."* |

## 6. Tempo, pontos e erro

### Cronômetro — por missão, sem game over

Uma barra por missão. Quando acaba: o leitor falha com *"acabou o tempo"*, as peças voltam para a bandeja e **a mesma missão recomeça**. Custa pontos, não custa progresso.

A escolha é deliberada. Este jogo ensina por tentativa e leitura do erro; encerrar a partida no terceiro tropeço puniria exatamente o comportamento que queremos — testar, ver a bobagem, corrigir. A barra existe para dar ritmo e evitar que a criança fique parada, não para ameaçar.

| Nível | Tempo por missão | Por quê |
|---|---|---|
| 1 | 60 s | escolher + preencher 3 campos |
| 2 | 90 s | duas caixas para preencher |
| 3 | 60 s | a caixa já vem preenchida; é só corrigir |

A barra **pausa** durante tutorial, modais e a animação do leitor. Ela mede o tempo em que a criança de fato pode agir.

### Pontos

| Evento | Pontos |
|---|---|
| Escolher a caixa certa (N1) | **+10** |
| Leitor recuperar a informação | **+20** |
| Escolher a caixa errada | −5 |
| Leitura falhar | −5 |
| Tempo esgotado | −10 |

Pontuação nunca fica negativa na tela: o placar exibido é `max(0, pontos)`.

### O erro é conteúdo, não punição

Regra que atravessa o jogo inteiro: **o leitor nunca diz "errado"**. Ele diz o que leu. `1A-2` não é uma mensagem de erro, é o resultado honesto de ler aquela caixa daquele jeito. A criança compara com o pedido e descobre sozinha o que fazer — que é a diferença entre decorar a resposta e entender o formato.

## 7. Eventos de plataforma

Mesmo contrato dos outros jogos (`runtimeGameBridge`, `shared/contracts/platformEvents`).

| Evento | Quando |
|---|---|
| `GAME_READY` | fim do `create()` |
| `CHECKPOINT` | troca de missão, acerto, erro e fim de nível |
| `CORRECT_ANSWER` | leitor recupera a informação (`pointsEarned: 20`) |
| `WRONG_ANSWER` | leitura falha, caixa errada ou tempo esgotado |
| `GAME_COMPLETED` | fim de cada nível |
| `GAME_OVER` | **não é emitido** — o jogo não tem derrota |

`progress` é `missões concluídas / 9 × 100`, contando os três níveis, para a barra da plataforma andar sem saltos entre níveis.

## 8. Estrutura de arquivos

Mesma organização do Chef dos Subproblemas, que é o padrão da casa.

```
src/games/EF03CO05/formato-certo/
├── index.ts              cenas: [BootScene, GameScene]
├── types.ts              modelo de dados (ver MECANICA.md §2)
├── data/
│   ├── theme.ts          paleta, alfas, fontes, tamanhos  (VISUAL.md §2)
│   ├── layout.ts         coordenadas de 1280×720          (VISUAL.md §3)
│   └── missions.ts       as 9 missões                     (substitui levels.ts)
└── scenes/
    ├── BootScene.ts      tela de carregamento
    ├── GameScene.ts      só orquestra; não desenha nada
    ├── effects.ts        painters puros + construtores    (VISUAL.md §4)
    └── reader.ts         o leitor, componente próprio     (MECANICA.md §5)
```

**Sai:** `scenes/UIScene.ts` (hoje é uma classe vazia registrada no `index.ts`), `data/levels.ts` (vira `missions.ts`).

**Entra do compartilhado:** `FX`, `createTutorial`, `showLevelComplete`, `runtimeGameBridge`, `EventBus` — nada novo precisa ser escrito lá.

## 9. Arte

Decisão: **tudo desenhado em código**, com `Graphics`, como o Chef faz com os pratos. Nenhum PNG de peça, caixa ou leitor.

O ganho é consistência: peça, campo e caixa passam a compartilhar a mesma linguagem de sombra, borda e brilho, e mudam de estado (vazio, sob o cursor, preenchido, defeituoso) repintando em vez de trocando textura. Os PNGs 3D existentes são bonitos mas vêm de bancos diferentes, em escalas diferentes, e nenhum deles tem estado de erro.

**Uma exceção, e quero que fique explícita:** o *fundo* também é desenhado em código — parede, prateleira e a laje da bancada — em vez de usar `bg-date-format.png` ou `bg-text-format.png`. Foi a leitura mais fiel da decisão, mas é o ponto onde ela mais custa: os dois fundos existentes são bonitos e já estão pagos. Se preferir mantê-los, é uma linha em `paintWorkbench()` e o resto do plano não muda.

Detalhamento em [VISUAL.md §5](./VISUAL.md).

## 10. Riscos e o que fazer com eles

**A criança arrasta ao acaso até passar.** Com 3 campos e 5 peças dá para forçar. Mitigação: o leitor só roda no botão **LER**, e cada leitura falha custa pontos. Testar tem preço, então pensar compensa — sem bloquear quem quer experimentar.

**"Escolher a caixa" vira sorteio de 1 em 3.** Mitigação: as distratoras da bandeja. Se a criança escolhe Pixels para guardar uma data, não existe peça de cor no pedido — a bandeja fica cheia de coisa que não encaixa e o desencaixe é visível antes mesmo de apertar LER.

**O N2 fica pesado com duas caixas.** Mitigação: as caixas do N2 têm no máximo 3 campos cada, e a segunda só destrava depois da primeira ficar completa. A criança nunca olha para seis campos vazios ao mesmo tempo.

**Texto longo demais para quem ainda soleta.** Mitigação: nenhum pedido passa de duas linhas, as peças de texto são pedaços (`18`, `-`, `06`) e não letras soltas, e a leitura de falha usa a mesma frase-modelo em todas as missões, mudando só o dado. Ver [MECANICA.md §5.3](./MECANICA.md).

**O leitor virar decoração.** Se a animação for longa, a criança aperta LER e olha para o lado. Mitigação: a leitura inteira cabe em ~1,2 s, e a falha aparece antes do sucesso — quem errou não espera a festa de quem acertou.
