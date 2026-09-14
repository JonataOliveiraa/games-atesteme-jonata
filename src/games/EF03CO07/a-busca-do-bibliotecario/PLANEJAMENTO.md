# A Busca do Bibliotecário — PLANEJAMENTO.md

## 0. Correção do briefing

O briefing original precisa de uma correção para que o jogo não repita o mesmo núcleo de **Detetives da Busca**.

A mudança principal é esta:

> **A criança não escolhe qual resultado está certo. Ela precisa melhorar a busca até o resultado certo aparecer.**

No briefing inicial, a criança montava palavras-chave e depois tocava na carta-resultado correta. Isso aproximava demais a mecânica de um jogo de seleção de resposta.

Agora o desafio central é:

1. ler o pedido do personagem;
2. observar a consulta atual;
3. observar os resultados;
4. decidir como melhorar a busca;
5. adicionar ou retirar palavras;
6. aplicar filtros;
7. comparar ferramentas de busca;
8. repetir até o resultado-alvo chegar à primeira posição.

O resultado final não é uma pergunta de múltipla escolha. Ele é consequência da consulta construída.

---

## 1. Habilidade BNCC

**EF03CO07 — Utilizar diferentes navegadores e ferramentas de busca para pesquisar e acessar informações.**

A habilidade envolve especialmente:

- associação de palavras;
- refinamento de termos;
- uso de filtros;
- observação dos resultados;
- comparação entre diferentes ferramentas de busca;
- acesso à informação desejada.

---

## 2. Teste da bolinha

Pergunta:

> **Se todo o conteúdo for substituído por bolinhas sem significado, o jogo continua funcionando?**

Não.

A criança precisa compreender semanticamente o pedido e perceber o que falta ou sobra na consulta.

Exemplo:

**Pedido:** “Quero um vídeo de vulcão em erupção.”

**Busca atual:** `VULCÃO`

**Resultados:** vulcão parado, maquete escolar, desenho.

A criança precisa perceber que a consulta ainda não especifica:

- `ERUPÇÃO`;
- o tipo `VÍDEO`.

Logo, o conteúdo é parte da mecânica e não apenas decoração.

---

## 3. Como isso não vira o jogo irmão

| Detetives da Busca | A Busca do Bibliotecário |
|---|---|
| Monta uma consulta a partir de opções | Recebe uma consulta imperfeita e precisa refiná-la |
| Depois escolhe qual resultado serve | O resultado correto aparece como consequência da consulta |
| Pergunta principal: “qual resultado está certo?” | Pergunta principal: “o que falta ou sobra na minha busca?” |
| A decisão final está no resultado | A decisão principal está na consulta |
| Filtros ajudam a selecionar conteúdo | Filtros fazem parte do algoritmo da busca |
| Busca termina em escolha de carta | Busca termina quando o alvo chega à melhor posição |
| Ferramenta de busca pode ser apenas visual | Ferramentas diferentes alteram a ordenação dos resultados |

---

## 4. Fantasia do jogo

O bibliotecário mágico precisa localizar materiais pedidos pelos visitantes.

Cada visitante chega ao balcão com uma necessidade.

Exemplo:

> “Preciso de uma foto de tucano para o cartaz.”

O grimório de busca já está aberto, mas a consulta ainda está vaga:

`TUCANO`

Os primeiros resultados não resolvem bem o pedido.

Na área de decisão aparecem três ações grandes:

`+ FOTO`

`+ PELÚCIA`

`+ DESENHO`

A criança toca em `+ FOTO`.

A consulta muda para:

`TUCANO + FOTO`

Os resultados são recalculados.

O resultado correto sobe.

Quando chega à primeira posição, ele é automaticamente entregue ao visitante.

---

## 5. Regra de tom

> **O jogo é de investigação, não de prova.**

A criança deve sentir que está consertando uma pesquisa.

Nada de:

- cronômetro regressivo;
- personagem bravo;
- erro como punição;
- “resposta errada” genérica;
- resultado vermelho permanente;
- ranking agressivo;
- sensação de urgência.

O feedback precisa explicar **o efeito da busca**.

---

## 6. O laço principal

```text
VISITANTE FAZ UM PEDIDO
        ↓
BUSCA ATUAL APARECE
        ↓
3 RESULTADOS APARECEM
        ↓
CRIANÇA COMPARA PEDIDO × CONSULTA × RESULTADOS
        ↓
3 AÇÕES GRANDES
        ↓
TOCA EM UMA AÇÃO
        ↓
CONSULTA MUDA
        ↓
BUSCA É RECALCULADA
        ↓
RESULTADO MELHOROU?
   ↙             ↘
SIM              NÃO
 ↓                ↓
CONTINUA       TRAVA + DICA
 ↓                ↓
ALVO CHEGOU       CORRIGIR
AO TOPO?
   ↙      ↘
 NÃO      SIM
 ↓         ↓
NOVA     ENTREGA
DECISÃO  DO ACHADO
            ↓
      PRÓXIMO PEDIDO
```

---

## 7. Controle

**Um toque por decisão.**

Não há arrastar.

A área inferior apresenta sempre no máximo três opções grandes e visíveis.

Exemplos:

- `+ FOTO`
- `+ ERUPÇÃO`
- `− DESENHO`
- `IMAGEM`
- `VÍDEO`
- `TEXTO`
- `OUTRO BUSCADOR`

Não existe botão separado “Pesquisar”.

Após a criança alterar a consulta, a busca roda automaticamente.

Isso evita um toque sem valor pedagógico.

---

## 8. Grade fixa — 1280 × 720

O jogo usa `Phaser.Scale.FIT`.

Não há breakpoint nem recomposição de layout.

| Faixa | y | Conteúdo | Tamanho na grade | No celular ×0,30 |
|---|---:|---|---:|---:|
| HUD | 0–136 | título curto, fase, progresso e `?` | `?` 136×136 | ~41×41 px |
| Pedido + consulta | 136–280 | visitante, pedido e busca atual | não interativo | — |
| Resultados | 280–488 | 3 resultados recalculados | ~270×170 cada | visual |
| Decisão | 488–720 | 3 ações grandes | ~350×172 cada | ~105×52 px |

### Organização horizontal

```text
┌─────────────────────────────────────────────────────────────────┐
│ Pedido 2 de 3                                      [?]          │
├─────────────────────────────────────────────────────────────────┤
│ visitante │ "Quero um vídeo..." │ BUSCA: VULCÃO + ERUPÇÃO      │
├─────────────────────────────────────────────────────────────────┤
│           resultado 1       resultado 2       resultado 3       │
│           [imagem]          [imagem]          [imagem]           │
├─────────────────────────────────────────────────────────────────┤
│      [ + VÍDEO ]         [ + BRINQUEDO ]       [ + FOTO ]       │
└─────────────────────────────────────────────────────────────────┘
```

Nenhum painel pode cortar a área de jogo.

Nenhum personagem deve invadir a faixa de decisões.

---

## 9. O que conta como fase

**Uma fase = um pedido completo de um visitante.**

Cada nível possui 3 fases.

Total:

**3 níveis × 3 fases = 9 pedidos.**

O crescimento acontece dentro do próprio nível.

---

## 10. Níveis e fases

| | Fase 1 | Fase 2 | Fase 3 |
|---|---|---|---|
| **Nível 1 — Palavras melhores** | 1 refinamento | 2 refinamentos | 3 refinamentos |
| **Nível 2 — Palavras + filtros** | palavra + filtro | 2 palavras + filtro | adicionar + remover + filtro |
| **Nível 3 — Ferramentas diferentes** | refinar + comparar | refinar + filtro + comparar | consulta completa + comparação |

---

# NÍVEL 1 — Palavras melhores

Objetivo:

> perceber que palavras mais específicas melhoram uma busca.

Ainda não existe filtro separado.

## Fase 1 — Foto de tucano

**Pedido**

> “Quero uma foto de tucano para o cartaz.”

**Busca inicial**

`TUCANO`

**Resultados iniciais**

- pelúcia de tucano;
- desenho de tucano;
- tucano real.

**Opções**

- `+ FOTO`
- `+ PELÚCIA`
- `+ DESENHO`

**Ação correta**

`+ FOTO`

**Busca final**

`TUCANO + FOTO`

O tucano real sobe para a primeira posição.

---

## Fase 2 — Vulcão em erupção

**Pedido**

> “Quero ver um vulcão entrando em erupção.”

**Busca inicial**

`VULCÃO`

### Decisão 1

- `+ ERUPÇÃO`
- `+ MAQUETE`
- `+ CALMO`

Correta:

`+ ERUPÇÃO`

### Decisão 2

- `+ VÍDEO`
- `+ BRINQUEDO`
- `+ DESENHO`

Correta:

`+ VÍDEO`

Busca final:

`VULCÃO + ERUPÇÃO + VÍDEO`

---

## Fase 3 — Baleia azul

**Pedido**

> “Preciso de um texto curto sobre baleias azuis.”

**Busca inicial**

`BALEIA`

### Decisão 1

`+ AZUL`

### Decisão 2

`+ TEXTO`

### Decisão 3

`+ CURTO`

Busca final:

`BALEIA + AZUL + TEXTO + CURTO`

---

# NÍVEL 2 — Palavras + filtros

Objetivo:

> perceber que o tipo de resultado também faz parte de uma boa pesquisa.

Agora aparece a categoria:

- IMAGEM;
- VÍDEO;
- TEXTO.

O filtro só é mostrado quando a etapa exige essa decisão.

---

## Fase 1 — Planetas

**Pedido**

> “Quero uma imagem dos planetas do Sistema Solar.”

**Busca inicial**

`SISTEMA SOLAR`

### Decisão 1

`+ PLANETAS`

### Decisão 2

Filtro:

`IMAGEM`

---

## Fase 2 — Plantar feijão

**Pedido**

> “Quero um vídeo ensinando a plantar feijão.”

**Busca inicial**

`FEIJÃO`

### Decisão 1

`+ PLANTAR`

### Decisão 2

`+ PASSO A PASSO`

### Decisão 3

Filtro:

`VÍDEO`

---

## Fase 3 — Ciclo da água

**Pedido**

> “Preciso de um texto explicando o ciclo da água.”

**Busca inicial**

`CICLO DA ÁGUA + DESENHO`

Aqui existe uma palavra que atrapalha.

### Decisão 1

`− DESENHO`

### Decisão 2

`+ EXPLICAÇÃO`

### Decisão 3

Filtro:

`TEXTO`

Esta fase introduz uma ideia importante:

> **melhorar uma busca não significa apenas acrescentar palavras. Às vezes é necessário retirar uma palavra ruim.**

---

# NÍVEL 3 — Ferramentas diferentes

Objetivo:

> perceber que ferramentas diferentes podem ordenar os mesmos resultados de maneiras diferentes.

Entram dois buscadores fictícios:

- **Buscador Sol**
- **Buscador Lua**

Não usar marcas reais.

Os dois pesquisam o mesmo conjunto de documentos, mas utilizam pesos diferentes para ordenar os resultados.

Nenhum deles deve ser apresentado como “certo” ou “errado”.

---

## Exemplo de diferença

Consulta:

`LOBO-GUARÁ + CERRADO`

### Buscador Sol

1. lobo-guará de pelúcia;
2. animais do Cerrado;
3. foto de lobo-guará.

### Buscador Lua

1. foto de lobo-guará;
2. animais do Cerrado;
3. desenho de lobo-guará.

A criança percebe:

> a mesma consulta pode aparecer organizada de forma diferente.

---

## Fase 1 — Lobo-guará

**Pedido**

> “Quero uma foto de lobo-guará no Cerrado.”

Fluxo:

1. `+ CERRADO`
2. filtro `IMAGEM`
3. `OUTRO BUSCADOR`

No primeiro buscador, o alvo ainda aparece abaixo.

No segundo, sobe para a primeira posição.

---

## Fase 2 — Saturno

**Pedido**

> “Quero um texto curto explicando os anéis de Saturno.”

Fluxo:

1. `+ ANÉIS`
2. filtro `TEXTO`
3. `OUTRO BUSCADOR`

---

## Fase 3 — Reciclagem

**Pedido**

> “Quero um vídeo ensinando a separar materiais recicláveis.”

Fluxo:

1. `+ SEPARAR`
2. `+ RECICLÁVEIS`
3. filtro `VÍDEO`
4. comparar buscadores

É a reprise completa da habilidade.

---

## 11. A regra como função

O jogo não deve armazenar algo como:

```ts
correctAnswer: "VIDEO"
```

O resultado precisa ser consequência do estado da busca.

Pseudocódigo:

```ts
function search(state: SearchState): RankedResult[] {
  return RESULTS
    .filter(result => matchesFilter(result, state.filter))
    .map(result => ({
      ...result,
      score:
        semanticMatch(result, state.queryTerms) +
        exactMatchBonus(result, state.queryTerms) +
        engineBias(state.engine, result)
    }))
    .sort((a, b) => b.score - a.score)
}

function targetRank(state: SearchState, targetId: string) {
  return search(state).findIndex(result => result.id === targetId)
}

function improvesSearch(
  state: SearchState,
  action: SearchAction,
  targetId: string
) {
  const before = targetRank(state, targetId)
  const afterState = applySearchAction(state, action)
  const after = targetRank(afterState, targetId)

  return after >= 0 && (before < 0 || after < before)
}

function solvesMission(
  state: SearchState,
  mission: Mission
) {
  return search(state)[0]?.id === mission.targetId
}
```

---

## 12. Regras de ranking

Cada resultado pode possuir metadados:

```ts
type SearchResult = {
  id: string
  title: string
  terms: string[]
  type: "image" | "video" | "text"
  topic: string
  traits: string[]
  engineAffinity?: {
    sol?: number
    lua?: number
  }
}
```

Cada missão define:

```ts
type Mission = {
  id: string
  request: string
  targetId: string
  initialTerms: string[]
  allowedActions: SearchAction[][]
  expectedProgression: SearchAction[]
}
```

A função de ranking deve ser determinística.

Não usar aleatoriedade que possa trocar o resultado correto de posição em uma mesma consulta.

---

## 13. O erro

Todo erro relevante é erro de decisão.

Não existe erro de reflexo.

Fluxo:

```text
TOQUE EM UMA OPÇÃO
        ↓
A BUSCA RODA
        ↓
RESULTADO PIORA OU NÃO MELHORA
        ↓
BORDA PISCA VERMELHO
        ↓
OPÇÃO BALANÇA
        ↓
TRAVA
        ↓
DICA EXPLICA O PROBLEMA
        ↓
CRIANÇA FAZ UMA AÇÃO QUE MELHORA A BUSCA
        ↓
DESTRAVA
```

A dica não deve entregar diretamente o botão correto.

---

## 14. Exemplos de dicas

### Pedido pede vídeo, criança escolhe FOTO

> “O visitante quer ver algo acontecendo. Uma foto fica parada.”

### Criança acrescenta BRINQUEDO

> “Essa palavra mudou o assunto da pesquisa. O pedido continua falando do objeto de verdade.”

### Filtro ainda não foi escolhido

> “As palavras já estão boas. Agora falta dizer que tipo de resultado você procura.”

### Palavra específica está faltando

> “Ainda aparecem coisas diferentes. Qual detalhe do pedido pode deixar a busca mais precisa?”

Depois de dois erros na mesma decisão, a ação correta ganha apenas um contorno pulsante.

---

## 15. Feedback

| Momento | Feedback |
|---|---|
| toque | botão afunda ~8 px |
| termo correto | termo voa até a consulta |
| remover termo | termo sai da consulta e dissolve |
| busca | brilho percorre a barra |
| atualização | resultados antigos saem e novos entram |
| melhoria | resultado-alvo sobe |
| erro | opção balança + borda vermelha |
| segundo erro | opção útil pulsa |
| troca de buscador | interface vira lateralmente |
| missão resolvida | resultado aumenta e voa até o visitante |
| nível concluído | os 3 achados reaparecem juntos |

Nada deve cobrir permanentemente os resultados.

---

## 16. Acerto

Quando uma ação melhora a busca:

1. botão afunda;
2. palavra entra ou sai;
3. toca um efeito curto;
4. resultados deslizam;
5. nova ordenação aparece;
6. alvo sobe;
7. borda da tela pisca verde por ~180 ms.

Quando o alvo chega à primeira posição:

> **não pedir outra confirmação.**

O resultado:

1. aumenta ~8%;
2. recebe um contorno luminoso;
3. voa até o visitante;
4. é guardado no mural/prateleira da fase.

O prêmio é a própria busca ter funcionado.

---

## 17. Tutorial

Duração aproximada: 5 segundos.

Pulável.

```text
PEDIDO
"Quero uma FOTO de tucano."
       ↓
BUSCA
TUCANO
       ↓
RESULTADOS RUINS
       ↓
opção FOTO pulsa uma vez
       ↓
dedo ilustrado toca FOTO
       ↓
TUCANO + FOTO
       ↓
resultado certo sobe
```

Texto:

> **Veja o pedido. Melhore a busca.**

Depois:

> **Quando a busca fica boa, o achado aparece.**

O botão `?` permanece visível durante o jogo.

---

## 18. Resultado de fase e nível

Ao finalizar uma fase, o achado vai para uma pequena prateleira.

No fim do nível, mostrar uma reprise:

```text
TUCANO
↓
TUCANO + FOTO

VULCÃO
↓
VULCÃO + ERUPÇÃO + VÍDEO

BALEIA
↓
BALEIA + AZUL + TEXTO + CURTO
```

Sem número de pontos.

Sem porcentagem.

Sem contador de erros.

Usar estrelas e selos do padrão do catálogo.

---

## 19. Pontuação

Pontuação existe apenas no código e no `runtimeGameBridge`.

Não mostrar números na interface do jogo.

A lógica deve manter o padrão do catálogo:

- acerto de primeira: valor cheio;
- acerto depois da TRAVA: valor reduzido;
- conclusão de fase e nível: eventos normais do bridge.

---

## 20. Tempo

**Não usar barra regressiva.**

A habilidade exige leitura, comparação e refinamento.

Pressa prejudicaria o raciocínio.

Pode ser medido internamente:

- tempo total;
- número de consultas;
- refinamentos;
- filtros;
- trocas de buscador;
- erros;
- primeira decisão correta ou não.

Nada disso aparece para a criança.

---

## 21. Áudio

Tudo sintetizado via WebAudio.

| Evento | Síntese |
|---|---|
| toque | pluck curto |
| palavra entrando | sine ascendente |
| palavra saindo | sine descendente |
| busca rodando | ruído passa-banda + clique |
| troca de buscador | ruído curto de página |
| melhoria | dois tons ascendentes |
| erro | woodblock grave |
| achado | três notas ascendentes |
| nível concluído | fanfarra curta |

Respeitar `mute-audio`.

Sem narração gravada.

---

## 22. Efeitos usados

O jogo usa:

- borda verde no acerto;
- borda vermelha no erro;
- botão afundando;
- palavra voando até a consulta;
- resultado-alvo subindo no ranking;
- resultado resolvido voando até o visitante;
- contorno pulsante após dois erros;
- reprise das buscas no fim do nível.

O jogo não usa:

- explosão que toma a tela;
- confete contínuo;
- tremor forte de câmera;
- brilho cobrindo a leitura;
- partículas permanentes no centro.

---

## 23. Antes da arte existir

O jogo precisa funcionar com placeholders.

Exemplo:

- bibliotecário = retângulo com nome;
- visitante = círculo simples;
- resultado = card com título;
- thumbnail = forma geométrica;
- cenário = fundo chapado.

As texturas entram por:

```ts
import.meta.glob(...)
```

Nunca quebrar o build porque uma arte ainda não existe.

---

## 24. O que é textura e o que é código

### Textura

- personagens;
- ilustrações de resultados;
- cenário de biblioteca.

### Graphics / código

- barra de pesquisa;
- grimórios;
- filtros;
- botões;
- cards;
- painel;
- balões;
- bordas;
- lupa;
- partículas;
- estrelas;
- selos;
- indicadores de fase;
- destaque de erro;
- destaque de acerto;
- prateleira de progresso.

---

## 25. Estrutura de arquivos

```text
src/games/EF03CO07/a-busca-do-bibliotecario/
    PLANEJAMENTO.md
    TEXTURAS.md
    index.ts
    types.ts

    data/
        layout.ts
        theme.ts
        results.ts
        missions.ts
        engines.ts

    scenes/
        BootScene.ts
        GameScene.ts
        SearchView.ts
        ResultsView.ts
        ChoiceView.ts
        CharacterView.ts
        TutorialView.ts
        FeedbackView.ts
        audio.ts

src/assets/games/EF03CO07/a-busca-do-bibliotecario/
    personagens.png
    resultados.png
    bg-biblioteca.png
```

---

## 26. Responsabilidade de cada módulo

### `GameScene.ts`

Orquestra:

- fase;
- estado;
- fluxo;
- eventos;
- bridge.

Não desenha interface diretamente.

### `SearchView.ts`

Desenha:

- consulta;
- termos;
- remoção;
- animação de busca.

### `ResultsView.ts`

Desenha:

- 3 resultados;
- atualização;
- troca de posição;
- resolução.

### `ChoiceView.ts`

Desenha:

- ações;
- filtros;
- troca de ferramenta.

### `CharacterView.ts`

Desenha:

- bibliotecário;
- visitante;
- entrega do resultado.

### `TutorialView.ts`

Controla:

- demonstração;
- pausa;
- retomada.

### `FeedbackView.ts`

Controla:

- bordas;
- destaques;
- TRAVA;
- dicas.

---

## 27. Registro

Registrar em:

- `src/data/catalog.ts`;
- `src/data/gameInstructions.ts`;
- `src/pages/GameDetailsPage.tsx`.

Slug sugerido:

```text
a-busca-do-bibliotecario
```

Habilidade:

```text
EF03CO07
```

Tags sugeridas:

```text
busca
pesquisa
palavras-chave
filtros
navegador
cultura-digital
```

---

## 28. Telemetria

Registrar:

```ts
{
  missionId,
  level,
  phase,
  initialQuery,
  finalQuery,
  actionsUsed,
  searchCount,
  filtersUsed,
  engineSwitches,
  errors,
  firstActionCorrect,
  completionTimeMs
}
```

Não enviar conteúdo pessoal da criança.

Todas as consultas são conteúdos fictícios do jogo.

---

## 29. Checklist de implementação

- [ ] grade 1280×720
- [ ] `Phaser.Scale.FIT`
- [ ] jogo inteiro possível apenas com toque
- [ ] nenhum arrastar
- [ ] nenhum alvo pequeno
- [ ] busca roda automaticamente
- [ ] resultado correto não é selecionado manualmente
- [ ] TRAVA funcionando
- [ ] dica explica o motivo
- [ ] dois erros fazem a opção útil pulsar
- [ ] filtros alteram realmente o conjunto/ranking
- [ ] Buscador Sol e Lua produzem ordem diferente
- [ ] nenhum buscador é retratado como ruim
- [ ] nenhuma marca real de navegador
- [ ] sem cronômetro regressivo
- [ ] sem pontos na tela
- [ ] `?` pausa corretamente
- [ ] mudo funciona
- [ ] placeholder funciona sem PNG
- [ ] texturas por `import.meta.glob`
- [ ] `npx tsc --noEmit` limpo
- [ ] ESLint limpo
- [ ] fase inteira testada no navegador
- [ ] TRAVA vista funcionando de verdade
- [ ] nenhum `window.__algo` restante

---

## 30. O que mudou na construção

### Rodada 1 — nível 1 jogável (11/09/2026)

| Decisão | Por quê |
|---|---|
| O nível 1 tem **1, 2 e 2 decisões**, e não 1, 2 e 3 | Com três resultados por busca, uma palavra discriminante já resolve: para um passo NÃO ser decisivo é preciso um concorrente que responda a mesma palavra. O acervo de vulcão tem esse concorrente (a maquete também está em erupção) e sustenta dois passos; os de tucano e baleia, não. A baleia ganhou o segundo passo dando `FOTO` à pelúcia — "a foto da pelúcia também é foto" — que é a melhor lição do nível. Um terceiro passo pediria um quadro de resultado que a folha não tem. |
| A vida só cai na **segunda** tentativa errada da mesma decisão | O §5 proíbe erro como punição, e experimentar uma palavra para ver o que ela faz com a busca É o exercício. O primeiro tropeço custa os pontos cheios da missão (10 → 5) e ganha a dica; a vida fica para quem insiste. |
| A palavra errada **não entra** na consulta | Ver a consulta suja com um termo ruim e ter de removê-lo seria um segundo problema em cima do primeiro. A busca não muda, a faixa explica o efeito que aquela palavra teria, e a criança volta para a mesma decisão. |
| A ação certa muda de botão a cada decisão | Ficou nas posições 2, 1, 2, 3, 2. Com a certa sempre na esquerda, o jogo viraria "toque no primeiro". |
| A faixa da dica mora **entre** os resultados e os botões | No lugar de cima ela cobria os números de posição dos cards — justamente o que responde "a busca melhorou?". |
| A posição do resultado aparece em número grande | É o placar real do jogo: o alvo subir de 3º para 2º é a prova de que a palavra ajudou, mesmo antes de ele chegar ao topo. |

Verificado no navegador: os três pedidos do nível 1, a trava com a palavra
recusada e a dica, a dica de segundo tropeço contornando a ação útil, a entrega
do achado ao visitante e a reprise das três consultas no fim do nível.

Falta a capa (`cover-a-busca-do-bibliotecario.png`). Como toda entrada do
catálogo precisa de uma, o salão da biblioteca entrou como provisório, com
comentário no `catalog.ts` apontando isso.

### Rodada 2 — a tela ficou óbvia (11/09/2026)

O usuário jogou e reprovou a clareza: muitos elementos com o mesmo peso, sem
dizer onde tocar nem o que o toque faz. O que mudou:

| Antes | Agora | Por quê |
|---|---|---|
| nada dizia qual resultado o visitante queria | o resultado pedido tem um **coração** grudado nele | a criança não escolhe o alvo — ela precisa enxergá-lo para saber o que consertar |
| três cards iguais com números 1, 2, 3 | três **vagas fixas**: o 1º lugar é grande, com moldura dourada, medalha `1º` e uma seta apontando para o visitante; o 2º e o 3º são menores | "a posição" deixou de ser número e virou lugar: quem chega no dourado vai para o visitante, e o card cresce ao subir |
| o header vazio | o objetivo, sempre visível: `Faça o ♥ chegar ao 1º lugar!` | uma frase só, com o coração desenhado igual ao do card |
| título e `imagem`/`vídeo` escritos em cada card | só a ilustração; vídeo ganha um ▶ | dois blocos de texto a menos por card, e o formato continua legível |
| a palavra errada não entrava na busca | ela **entra**, a busca roda, os cards mudam de ordem, o visitante balança a cabeça, a faixa explica — e a palavra volta voando para o botão | "o que isso faz" passou a ser visto, não contado |
| acerto intermediário mudo | faixa verde `Subiu! Falta mais uma palavra.` e brilho no card do coração | sem isso, a palavra certa que não resolve de uma vez parecia errada |
| o dedo do tutorial tocava bem no FOTO | o tutorial mostra o coração, o 1º lugar e a fileira de palavras, sem apontar nenhuma | ele entregava a resposta do primeiro pedido |
| `WRONG_ANSWER` no 1º erro, vida no 2º | os dois juntos, no 2º erro da mesma decisão, e o contador zera depois de cobrar | a `GameDetailsPage` desconta vida a cada `WRONG_ANSWER`; separados, a plataforma e o jogo contavam vidas diferentes |
| `data/missions.ts` | `data/levels.ts` | regra do `INSTRUCOES.md` |

As falas dos pedidos e das dicas encolheram para uma linha curta, e nenhuma
dica usa "ele" ou "ela": os visitantes mudam a cada pedido.

### Rodada 2b — o visitante reage (11/09/2026)

Chegou `visitantes-reacoes.png`, e `personagens.png` ficou só com a
bibliotecária. O visitante agora diz com o rosto o que está no 1º lugar:

| Momento | Reação |
|---|---|
| chegando e fazendo o pedido | esperando |
| os resultados aparecem e o 1º lugar não é o pedido | dúvida — mão aberta, sobrancelha franzida |
| palavra errada | dúvida, balançando |
| o coração chega ao 1º lugar | alegria — braços estendidos para receber, com um pulinho |

A dúvida fica desde o primeiro quadro de resultados de propósito: é ela que
diz, sem texto, "o que está no 1º lugar não é o que eu quero". `visitor` em
`levels.ts` passou a ser a COLUNA da folha nova (0 a 3).
