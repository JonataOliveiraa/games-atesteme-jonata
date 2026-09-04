# Série do Campeão - EF02CO02

Documento irmão: [TEXTURAS.md](./TEXTURAS.md)

Jogo esportivo para 2º ano: o treinador mostra uma série pictográfica, e a
criança toca nos movimentos na quantidade exata para o atleta repetir o
algoritmo.

O briefing foi simplificado. Saem o rival IA, as notas numéricas dos juízes e o
terceiro movimento obrigatório. Para criança de 7 anos, dois botões grandes
resolvem melhor: **pular** e **girar**. A dificuldade cresce pela quantidade e
pela ordem das etapas, não por mais botões na tela.

---

## 1. A habilidade, e o teste que ela precisa passar

> **(EF02CO02)** Criar e simular algoritmos representados em linguagem oral,
> escrita ou pictográfica, construídos como sequências com repetições simples
> (iterações definidas) com base em instruções preestabelecidas ou criadas,
> analisando como a precisão da instrução impacta na execução do algoritmo.

Objeto: **Algoritmos com repetições simples**.

Exemplo oficial: os alunos podem construir algoritmos com instruções
pré-definidas, como avançar, virar à direita, virar à esquerda, e expressar
repetições como "ande um passo 10 vezes".

O teste da bolinha é este: **troque pulo, giro e atleta por bolinhas sem
movimento. O jogo muda?**

Muda. O centro do jogo é executar uma instrução repetida: `3 x pulo` precisa
virar três pulos visíveis, nem dois nem quatro. Sem o movimento e sem a
contagem definida, vira apenas tocar botões.

Alinhamento com o código BNCC:

| Campo | Valor no jogo |
|---|---|
| Código | `EF02CO02` |
| Ano | 2º ano |
| Unidade | Pensamento Computacional |
| Objeto | Algoritmos com repetições simples |
| Verbo da habilidade | criar e simular algoritmos |
| Representação | pictográfica: número, bolinhas e ícone do movimento |
| Evidência jogável | repetir cada etapa exatamente a quantidade indicada e ver a execução falhar quando a instrução não é precisa |

---

## 2. Como isso não vira o jogo irmão

Já existe um jogo publicado para EF02CO02: **Desfile do Robô Repetidor**.

| Jogo | O que a criança faz | Diferença pedagógica |
|---|---|---|
| Desfile do Robô Repetidor | Monta comandos de deslocamento em uma grade e depois executa o programa. | Trabalha caminho, direção, obstáculos e planejamento antes da simulação. |
| Série do Campeão | Executa uma série corporal já mostrada, tocando a quantidade exata de cada repetição. | Trabalha iteração definida de forma imediata: cada toque é uma repetição e o atleta mostra a simulação na hora. |

O irmão é "programar um caminho". Este é "repetir uma instrução `N` vezes com
precisão".

---

## 3. O laço

```
treinador mostra a série em cartões grandes
→ cartão atual acende: 3 bolinhas + ícone de pulo
→ criança toca no botão do movimento
→ atleta faz 1 repetição e 1 bolinha preenche
→ completou a quantidade: cartão ganha selo e o próximo acende
→ tocou movimento errado ou passou da conta: TRAVA e refaz só aquele cartão
→ terminou a série: replay curto + medalha visual + próxima série
```

Controle: **um toque em botões grandes**. Cada toque executa uma repetição na
hora. Não há arrastar, segurar, configurar número, teclado obrigatório ou
confirmar depois.

---

## 4. Clareza para criança

O propósito precisa aparecer sem leitura constante.

| Conceito | Como a tela mostra |
|---|---|
| "repita 3 vezes" | algarismo grande `3` + três bolinhas vazias |
| "qual movimento" | ícone grande de pulo ou giro, vindo de `icones-serie.png` quando existir |
| "em qual etapa estou" | cartão atual maior, colorido e pulsando |
| "quantas já fiz" | bolinhas preenchendo uma a uma |
| "acabou a etapa" | todas as bolinhas cheias e selo verde |
| "errei a precisão" | bolinhas tremem e voltam vazias no cartão atual |

Texto durante a jogada deve caber em palavras isoladas: `PULO`, `GIRO`,
`AGORA`, `DE NOVO`. A instrução real é visual.

---

## 5. A grade

Tela fixa de **1280 x 720** com `Phaser.Scale.FIT`. Num celular em pé, a tela
vira uma faixa 16:9; ela não recompõe. A coluna "No celular" usa fator 0,30.

| Faixa | y | Conteúdo | Tamanho | No celular |
|---|---|---|---|---|
| HUD | 0 - 84 | 3 medalhas de série, botão `?` em (1210, 42) | `?` hitbox 144 x 144 | 43 x 43 toque |
| Série | 84 - 220 | 1 a 3 cartões de algoritmo: número, bolinhas, ícone | cartão 300 x 116; ícone 58 | 91 x 35; ícone 18 |
| Ginásio | 220 - 520 | atleta grande no centro, treinador lateral simples | atleta 220 x 220 | 67 x 67 |
| Botões | 520 - 720 | dois botões enormes: pulo e giro | cada botão 420 x 150 | 128 x 46 |

Os botões ficam sempre nos mesmos lugares:

| Botão | Área |
|---|---|
| Pulo | x 170 - 590, y 540 - 690 |
| Giro | x 690 - 1110, y 540 - 690 |

No nível 1, só aparece o botão necessário para a etapa atual e o outro fica
apagado. No nível 2 em diante, os dois aparecem; o cartão atual indica qual usar.

---

## 6. Níveis e fases

A **fase deste jogo é uma série esportiva**. Cada nível tem 3 séries.

| Nível | Séries | Botões | O que cresce |
|---|---|---|---|
| 1 | 1 etapa por série | só o botão correto aparece ativo | entender repetição definida sem escolher movimento |
| 2 | 2 etapas por série | pulo e giro aparecem | seguir ordem: completar uma etapa antes da próxima |
| 3 | 3 etapas por série | pulo e giro aparecem | manter precisão em sequência maior, sem rival IA |

Conteúdo:

| Série | Algoritmo pictográfico |
|---|---|
| 1.1 | `2 x PULO` |
| 1.2 | `3 x GIRO` |
| 1.3 | `4 x PULO` |
| 2.1 | `2 x PULO -> 2 x GIRO` |
| 2.2 | `3 x GIRO -> 2 x PULO` |
| 2.3 | `4 x PULO -> 1 x GIRO` |
| 3.1 | `2 x PULO -> 3 x GIRO -> 1 x PULO` |
| 3.2 | `3 x GIRO -> 2 x PULO -> 2 x GIRO` |
| 3.3 | `4 x PULO -> 2 x GIRO -> 3 x PULO` |

Números vão até 4. O briefing falava em até 6, mas isso aumenta repetição sem
melhorar muito a aprendizagem. Para 7 anos, `4` já permite perceber "exato" sem
virar exercício cansativo.

---

## 7. As regras, em código

O algoritmo é uma sequência de etapas com iteração definida.

```ts
type Move = 'jump' | 'spin'

type RoutineStep = {
  move: Move
  count: number
}

type Routine = {
  id: string
  steps: RoutineStep[]
}

function expectedStep(routine: Routine, stepIndex: number) {
  return routine.steps[stepIndex]
}

function tapResult(step: RoutineStep, tappedMove: Move, currentCount: number) {
  if (tappedMove !== step.move) return 'wrong-move'
  if (currentCount + 1 > step.count) return 'too-many'
  if (currentCount + 1 === step.count) return 'step-complete'
  return 'keep-going'
}
```

O veredito é calculado no toque, não guardado como `isCorrect` no botão. O mesmo
botão pode ser correto em uma etapa e errado na próxima.

Pontuação interna:

| Situação | Evento | Pontos |
|---|---|---|
| etapa exata de primeira | `CORRECT_ANSWER` | +10 |
| etapa exata depois de TRAVA | `CORRECT_ANSWER` | +5 |
| movimento errado | `WRONG_ANSWER` + `lives.lose()` | 0 |
| toque a mais | `WRONG_ANSWER` + `lives.lose()` | 0 |

Nenhuma nota numérica aparece na tela. A criança vê medalhas, selos e estrelas.

---

## 8. O erro

A TRAVA mostra precisão, não punição.

1. Se a criança toca o movimento errado, o atleta começa o movimento e para em
   pose cômica antes de completar.
2. Se toca a mais, a bolinha extra aparece vermelha por 1 segundo e cai fora.
3. O cartão atual congela com cadeado.
4. As bolinhas do cartão esvaziam e pulsam na quantidade correta.
5. Só repetir a etapa exata destrava.
6. Depois de 2 erros na mesma etapa, o botão correto pulsa e o botão errado
   fica menor/escurecido até destravar.

Frases curtas opcionais:

| Erro | Frase máxima |
|---|---|
| movimento errado | `Esse não é agora.` |
| toque a mais | `Foi um a mais.` |
| faltou tocar | Não é erro; a etapa só espera. |

Não existe "perdeu porque demorou". Sem tempo visível, sem pressa.

---

## 9. Feedback e diversão

| Momento | Visual | Som |
|---|---|---|
| toque em PULO | atleta pula, sombra estica, bolinha preenche | pop ascendente |
| toque em GIRO | atleta gira com rastro circular | whoosh curto |
| etapa completa | cartão fecha com selo verde; atleta comemora rápido | aplauso curto |
| movimento errado | atleta faz pose atrapalhada leve | boing macio |
| toque a mais | bolinha extra salta e cai | bloop grave |
| fim da série | replay acelerado de 3 s com todos os movimentos | fanfarra curta |
| fim do nível | pódio visual com medalha e estrelas | fanfarra maior |

Diversão sem complexidade:

| Recurso | Como usar |
|---|---|
| atleta expressivo | muda pose a cada toque, sem depender de texto |
| bolinhas como torcida | cada bolinha preenchida dá uma piscada como "contei!" |
| replay curto | mostra que a sequência inteira virou uma apresentação |
| treinador visual | levanta a plaquinha do próximo cartão, mas não fala frases longas |

---

## 10. Tutorial

Exemplo animado de 5 segundos, pulável:

| Passo | Frase curta | Cena |
|---|---|---|
| 1 | `2 PULOS` | cartão mostra `2` + duas bolinhas + ícone de pulo |
| 2 | `TOQUE` | dedo toca botão PULO uma vez, atleta pula, 1 bolinha enche |
| 3 | `DE NOVO` | segundo toque, segunda bolinha enche |
| 4 | `PRONTO!` | cartão ganha selo e atleta comemora |

O botão `?` pausa e reabre o tutorial. Sem narração.

---

## 11. Textura mínima e o que fica no código

Pouca textura. O jogo funciona com `Graphics` se a arte ainda não existir.

| Elemento | Fazer em |
|---|---|
| ginásio, chão, arquibancada simples | Graphics |
| cartões de algoritmo | Graphics |
| bolinhas de contagem | Graphics |
| botões PULO/GIRO | Graphics |
| selos, medalhas, estrelas, cadeado, brilho | Graphics/shared |
| ícones de pulo, giro, repetir e pronto | spritesheet pequena opcional, com fallback em Graphics |
| treinador | Graphics simples ou sprite opcional |
| atleta | spritesheet única |
| capa | PNG |

Sem textura para botões, contador, plaquinhas, juízes, notas ou painel. Os
ícones podem entrar como uma folha única porque aparecem repetidos em cartões,
botões e tutorial, mas não podem virar dependência estrutural.

Todo carregamento de textura usa `import.meta.glob`, e todo consumo passa por
`textures.exists()`.

Background: o jogo tem ginásio, mas ele nasce em `Graphics` na primeira versão
para não bloquear implementação nem pesar assets. Se a versão visual precisar
ficar mais rica, entra `bg-ginasio.png` como textura **opcional**, com centro
limpo para o atleta e base livre para os botões.

---

## 12. Produção

Ordem recomendada:

1. dados das séries e função `tapResult`;
2. tela com cartão de algoritmo, bolinhas e dois botões;
3. atleta placeholder em Graphics;
4. lógica de etapa completa e próxima etapa;
5. TRAVA de movimento errado e toque a mais;
6. replay curto da série;
7. eventos da plataforma e painel de fim de nível;
8. ícones opcionais de movimento;
9. background opcional do ginásio, se o visual em Graphics ficar pobre;
10. textura do atleta e capa.

Para implementação inicial, seguir a regra do projeto: construir **1 nível só
para teste**, avisar o usuário e mostrar o resultado antes de expandir para os
3 níveis planejados.

---

## 13. Registro

Pasta do jogo:

```
src/games/EF02CO02/serie-do-campeao/
```

Pasta de assets:

```
src/assets/games/EF02CO02/serie-do-campeao/
```

Slug: `serie-do-campeao`

Título: `Série do Campeão`

Entrada futura no catálogo:

| Campo | Valor |
|---|---|
| `slug` | `serie-do-campeao` |
| `module` | `EF02CO02/serie-do-campeao` |
| `skill` | `EF02CO02` |
| `years` | `[2]` |
| `tags` | `["algoritmos", "repetição", "sequência", "toque"]` |
| `category` | `Pensamento Computacional` |
| `points` | `60` |
| `icon` | sugerido: medalha ou atleta |

Também registrar:

| Arquivo | O que entra |
|---|---|
| `src/data/gameInstructions.ts` | 3 linhas: veja o cartão, toque o movimento, preencha as bolinhas |
| `src/pages/GameDetailsPage.tsx` | incluir em `GAMES_WITH_IN_GAME_COMPLETION_SCREEN` se usar painel interno |

---

## 14. O que mudou na construção

O **nível 1** saiu primeiro sozinho, conforme a regra do projeto de entregar um
nível para teste antes de expandir. Os níveis 2 e 3 entraram depois, com o
conteúdo da tabela da seção 6 sem alteração — e, como previsto, foram edição de
`data/routines.ts`: `LevelDef` já tinha `routines[]` e `soloButton`, e a cena
deriva o resto.

Os nomes dos níveis são **Aquecimento**, **Treino** e **Apresentação**.

### A janela de precisão

O ponto que precisou de conserto foi o mais importante do jogo.

Na primeira montagem, o cartão fechava **no toque que completava a contagem**.
Isso tornava o veredito `too-many` inalcançável: o `busy` que engole toques
durante a animação só liberava depois de a etapa já ter sido selada. Somando o
botão errado desligado no nível 1, a criança não tinha nenhum jeito de errar — e
"analisar como a precisão da instrução impacta na execução" some junto.

Agora, ao completar a contagem, o cartão **pulsa e espera 700 ms** antes de
selar. Um toque nessa janela é `too-many`: bolinha vermelha, TRAVA e refaz a
etapa. Quem para na conta certa vê o selo verde.

A janela precisou de um segundo contador de geração, `stepGen`, além do `gen`
da cena. `gen` protege contra troca de cena; `stepGen` protege contra a corrida
específica desta janela — o toque a mais leva ~1,2 s de animação até chamar a
TRAVA, e nesse meio-tempo a espera de 700 ms terminava e selava o cartão que
acabara de ser invalidado. Por isso `stepGen` sobe no instante em que o veredito
de erro é calculado, e não quando a TRAVA começa.

Efeito colateral: o `?` (rever tutorial) fica indisponível durante a janela.
Abrir o tutorial ali cancelaria uma etapa que já está esperando para fechar.

### Toques engolidos não são erro

Toque durante uma repetição em andamento não conta e não pune. Cada toque é uma
repetição visível, e duas não podem se sobrepor. Na prática isso significa que
martelar o botão rápido não gera TRAVA — só deixa de contar. Para dar
`too-many`, o toque a mais tem que ser deliberado: pelo menos ~460 ms depois do
anterior, dentro da janela de 700 ms.

### O que ficou diferente do briefing

| Item | Briefing | Implementado | Por quê |
|---|---|---|---|
| Cadeado da TRAVA | cartão congela com cadeado | cadeado aparece durante a batida do erro (~1 s) e sai | destravar é só repetir a etapa; cadeado permanente prometeria uma ação que não existe |
| Frases de erro | opcionais | usadas, como texto que sobe e some em `y 470` | não é caixa de diálogo: aparece longe do cartão e da mão, e some sozinho |
| Treinador | "levanta a plaquinha do próximo cartão" | plaquinha mostra o ícone do movimento da etapa atual e balança a cada etapa nova | repete o pedido perto do atleta, sem ler o cartão lá em cima |
| Replay | 3 s | ~1 s por série no nível 1 (2 a 4 repetições a 2,2×) | 3 s de espera para 2 pulos é tempo parado; a duração sai do próprio algoritmo |

### Arte

Os três PNGs chegaram prontos, em tamanhos diferentes do que a especificação
pedia — `atleta.png` veio 1400 × 399 (quadros de 280 × 399, não 256 × 256) e
`icones-serie.png` veio 512 × 128. Em vez de exigir regeração, o `BootScene`
carrega as duas folhas como imagem simples e **fatia os quadros em tempo de
execução**, dividindo a largura pelo número de colunas declarado no código
(`ATHLETE_COLUMNS`, `ICON_COLUMNS`). Trocar a arte por uma versão em outro
tamanho continua funcionando, desde que a grade seja a mesma.

O fallback em `Graphics` está escrito e ativo: sem `atleta.png` entra um boneco
vetorial com as cinco poses; sem `icones-serie.png` entram pictogramas
desenhados; sem `bg-ginasio.png` entra uma quadra com arquibancada. Nenhuma
textura é dependência estrutural.

### A série virou coluna, e a coluna encolhe

Os cartões moravam numa fileira no topo da tela — que é exatamente onde a
cabeça do atleta chega no auge do pulo. O painel tapava o movimento que ele
está contando, então a série passou para uma **coluna à direita**, longe da
área de salto e longe dos botões.

Empilhada, ela precisa caber entre o header e os botões (y 112 a 512). Por isso
a altura do cartão é derivada, não fixa: `cardH(n)` divide a faixa disponível
pelo número de etapas, com teto de 152. Uma etapa fica em 152, três ficam em
120. Assim o nível 3 entra sem reescrever posição nenhuma.

### O tutorial do nível 2 é outro

Séries de mais de um cartão têm dois conceitos novos que o nível 1 não tem:
existe uma ORDEM entre cartões, e os dois botões passam a funcionar. Um
tutorial que só repete "o cartão diz quantas vezes" não cobre isso — então,
para `n > 1`, ele troca de roteiro: a coluna inteira, os dois botões, e
"termine um cartão antes de passar para o de baixo". A chave do tutorial já era
por nível (`ef02co02-serie-lN`), então cada um aparece uma vez.

### Fora do escopo desta entrega

- Pódio visual de fim de nível: hoje o fim usa o painel compartilhado
  `showLevelComplete` com as três medalhas já visíveis no HUD.
