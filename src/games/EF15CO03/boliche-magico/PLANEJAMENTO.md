# Boliche Mágico — planejamento

Documento irmão: [TEXTURAS.md](./TEXTURAS.md)

**EF15CO03 · 1º ao 5º ano · Pensamento Computacional · Lógica computacional** · pasta `src/games/EF15CO03/boliche-magico/`

> **(EF15CO03)** Realizar operações de negação, conjunção e disjunção sobre sentenças lógicas e valores 'verdadeiro' e 'falso'.

Pedido do usuário (20/10/2026): colou a ficha *Boliche da Verdade*. Avisei que ela repetia o Rio de Chocolate (124: ler a frase e tocar nos objetos que a deixam verdadeira) e que o modo espelho repetia o Portões Lógicos (078) e o Achados e Perdidos (081). Entre quatro ideias, ele escolheu o **Boliche Mágico: a criança monta a frase da bola**, e pediu *"prossiga com o planejamento e faça o n1. use apenas Graphics. a textura eu adicionarei em breve"*.

---

## 0. Por que não é a ficha, e o que ficou dela

| Irmão | O que a criança faz |
|---|---|
| Arena da Lógica (033) | julga frases soltas |
| Circuito da Verdade (044) | julga frases sobre coisas do mundo |
| Portões Lógicos (078) | olha a criaturinha e escolhe o portão da frase verdadeira |
| Achados e Perdidos (081) | olha o bichinho e pendura as frases verdadeiras sobre ele |
| Rio de Chocolate (124) | lê a frase e pula nos doces que a deixam verdadeira |

Nos cinco, a frase vem pronta e a criança só julga. Aqui ela **realiza a operação**: escolhe o termo e decide se põe o NÃO (no N2, se junta com E ou com OU). A frase dela é executada pela bola contra cada pino, e o resultado aparece na pista.

Da ficha ficaram: a pista de boliche, os pinos com atributos bem visíveis (cor, estrela, óculos, tamanho), as sentenças do conteúdo pedagógico, o letreiro no alto que confere termo a termo com ✓/✗, a dancinha de quem "sobreviveu de direito" e o modo espelho, que aqui virou o jogo inteiro (da queda para a sentença).

## 1. O jogo em uma frase

**Alguns pinos estão com sono e querem deitar. Monte a frase da Bola Mágica, aperte JOGAR, e ela derruba só quem a frase diz.**

## 2. A habilidade na tela

| A habilidade pede | Onde está |
|---|---|
| **sentença lógica** | a placa no alto, que a criança monta: *"Derruba quem tem ESTRELA"* |
| **valor verdadeiro / falso** | a bola para diante de cada pino e o letreiro confere: ✓ = a frase vale para ele (a bola derruba), ✗ = não vale (o pino pula e a bola passa por baixo) |
| **negação** (N1) | a criança põe ou tira o **NÃO**: *"Derruba quem NÃO tem ÓCULOS"*. Na conferência, o NÃO vira a marca |
| **conjunção e disjunção** (N2 e N3) | ela escolhe **E** ou **OU** entre duas partes, e o operador junta as duas marcas numa só |

**Teste da bolinha:** se os pinos fossem iguais, nenhuma frase separaria os com sono dos outros. Os atributos visíveis são os termos que ela usa.

## 3. O laço

1. **Os pinos descem** na pista, um a um, em fila. Os que estão com sono têm olhinhos fechando e um balão "Zz". Os outros estão bem acordados.
2. **A placa começa vazia:** *"Derruba quem [ ? ]"*. Embaixo, na bancada, ficam as cartas de termo (*tem ESTRELA*, *tem ÓCULOS*…), o botão **NÃO** e o botão **JOGAR**.
3. **A criança monta a frase.** Tocar numa carta manda a peça dela para a placa (outra carta troca a peça). Tocar no NÃO põe a pílula NÃO na frente da peça, e tocar de novo tira. Ela pode mudar quantas vezes quiser: só o JOGAR vale.
4. **JOGAR:** a bancada desce e a bola rola. Diante de cada pino ela para; o pino e a peça da placa pulam juntos, aparece ✓ ou ✗, e o NÃO, se houver, vira a marca.
   - **✓** a bola derruba o pino. Se ele tinha sono, deita e ronca.
   - **✗** o pino pula e a bola passa por baixo. Se ele estava acordado, aterrissa contente.
5. **Todos os com sono deitados e todos os acordados de pé:** os de pé fazem a dancinha, a bola volta pela canaleta, a bolinha da fase acende. O rastelo varre a pista e descem os pinos da próxima fase.

Não há relógio: a montagem espera o tempo que for.

## 4. Controle

| Onde | O quê |
|---|---|
| as cartas de termo (1 ou 2) | tocar = essa peça vai para a placa |
| o NÃO | tocar = põe ou tira o NÃO da frase |
| o JOGAR | tocar = a bola rola com a frase da placa |

Montar não custa nada; só o JOGAR é julgado. O JOGAR fica desligado até a placa ter uma peça (resposta vazia não conta). Os pinos e a bola não são tocáveis. No computador, o mouse basta; o botão sob o ponteiro sobe um pouco, parado.

**Teto de alvos:** no máximo 4 tocáveis ao mesmo tempo (2 cartas + NÃO + JOGAR), numa fileira limpa na bancada. As regiões tocáveis da tela são 2: a bancada e o `?`.

## 5. A tela (1280 × 720), vista de lado

```
┌──────────────────────────────────────────────────────────────────────┐
│ [Nível 1] ●○○○○ │   Derruba quem  [NÃO] [⭐ tem ESTRELA]   │    (?)  │  faixa 96
├──────────────────────────────────────────────────────────────────────┤
│  parede do boliche (luzes, letreiros de estrela e de pino)            │
│                          Zz                 Zz                        │
│    (bola)             🎳       🎳       🎳       🎳                  │
│ ▓▓═════════════════════════ pista (madeira) ══════════════════ capô  │
├──────────────────────────────────────────────────────────────────────┤
│   [⭐ tem ESTRELA]   [👓 tem ÓCULOS]     [ NÃO ]        [ JOGAR ▶ ]   │  bancada
└──────────────────────────────────────────────────────────────────────┘
```

- **Cabeçalho em faixas**, de ponta a ponta: o nível e as bolinhas das fases à esquerda, **a placa** no meio exato (x 640) e o `?` à direita.
- **A placa** é uma frase com peças: *"Derruba quem"* em letra pequena, a pílula **NÃO** (violeta) e a peça do termo com ícone e palavra. A vaga vazia é uma peça tracejada com "?". As marcas ✓ (verde) e ✗ (laranja) aparecem no canto da peça.
- **A pista** atravessa a tela em y ≈ 470–560. A bola descansa em x 210; os 4 pinos ficam em x 440, 650, 860 e 1070; a pista vai até a borda direita, e o capô da máquina de pinos fica no alto, de x 330 em diante.
- **A bancada** ocupa o pé da tela (y ≥ 590), com as cartas à esquerda, o NÃO no meio e o JOGAR à direita.

## 6. Os pinos e a bola

| Atributo | Valores | Como se vê |
|---|---|---|
| cor | azul · verde · vermelho | o corpo inteiro do pino, com as duas faixas brancas no pescoço |
| estrela | tem · não tem | estrela amarela grande na barriga |
| óculos | tem · não tem | óculos redondos escuros |
| tamanho | grande · pequeno | 200 px · 72 % disso (só a partir do N2) |

O **sono** não é atributo de frase: é a encomenda da fase. Pino com sono tem olhos quase fechando e o balão "Zz" parado em cima; acordado tem olhos grandes e sorriso. Depois da jogada: deitado e com sono = dormindo feliz; deitado e acordado = tonto; de pé e com sono = bocejo triste.

A **Bola Mágica** é a personagem que fala: azul-noite com estrelinhas, os três furos de boliche e um rosto que fica sempre de pé enquanto o corpo gira.

## 7. O N1 — O NÃO TROCA QUEM CAI

Assunto único: **a frase de um termo e o NÃO que a vira do avesso.** A fase 1 não tem NÃO; ele estreia na fase 2 com demonstração. Em cada fase mudam só **2 atributos** de pino para pino, e o tamanho é sempre grande.

| Fase | Cartas | NÃO | Pinos (da esquerda para a direita) | Com sono | A frase que resolve |
|---|---|---|---|---|---|
| 1 | tem ÓCULOS · tem ESTRELA | — | verdes: óculos · estrela · nada · estrela e óculos | 2º, 4º | tem ESTRELA |
| 2 | tem ÓCULOS | sim | azuis: estrela · óculos e estrela · óculos · nada | 1º, 4º | NÃO tem ÓCULOS |
| 3 | é AZUL · tem ESTRELA | sim | sem óculos: azul com estrela · verde · azul · vermelho com estrela | 2º, 4º | NÃO é AZUL |
| 4 | é VERDE · tem ÓCULOS | sim | sem estrela: verde de óculos · vermelho · verde · azul de óculos | 1º, 4º | tem ÓCULOS |
| 5 | é VERMELHO · tem ESTRELA | sim | de óculos: vermelho com estrela · azul com estrela · vermelho · verde com estrela | 3º | NÃO tem ESTRELA |

Em toda fase com NÃO, a frase sem ele derruba exatamente os pinos errados: quem esquece o NÃO deita os acordados. A fase 4 não precisa do NÃO, para a criança não apertá-lo sempre.

**A resposta não fica nos dados.** A fase guarda os pinos (com o sono de cada um) e as cartas; o veredito é `holds(frase, pino) === pino.sleepy` para cada pino, calculado no instante da jogada.

**Validação** (`validateLevels`, só em DEV):
- 4 pinos diferentes por fase, de 1 a 3 com sono;
- exatamente 2 atributos mudam, e o de cada carta é um deles;
- das frases que dá para montar com as cartas (e o NÃO, quando existe), **exatamente uma** deixa todos certos;
- a fase 1 não tem NÃO; as outras têm; existe fase em que a frase certa tem NÃO e fase em que não tem;
- o desenho dos com sono muda de uma fase para a seguinte, e a carta certa não fica sempre do mesmo lado;
- toda fase que ensina tem demonstração com pinos próprios, cuja frase de roteiro é a única certa ali e cujo desenho de sono é diferente do da fase.

## 8. Erro (a cena antes do `lose()`)

A bola segue a frase da placa. No primeiro pino que dá errado ela para:

- **derrubou um acordado:** ele cai tonto, com estrelinhas girando. Faixa: *"Ele tem óculos, mas não tinha sono!"*;
- **pulou um com sono:** ele aterrissa bocejando, triste. Faixa: *"Ele é azul, mas queria deitar!"*.

O fato da faixa é sempre o termo da placa conferido nele (*é azul*, *não tem óculos*). A peça da placa treme (e o NÃO junto, quando foi ele que virou a marca), a bola faz cara de "ops", e depois de ~2,4 s vêm `WRONG_ANSWER` e `lose()`, uma vez. Não existe outro erro: montar e desmontar a frase é de graça.

## 9. Abertura e tutorial do N1 (uma vez)

1. **Close na bola**, cabeçalho e bancada escondidos. **Bola:** *"Oi! Eu sou a Bola Mágica."* [Próximo]
2. A câmera vai até os pinos; um deles boceja. **Bola:** *"Estes pinos estão com sono."* [Próximo]
3. Volta para a bola. **Bola:** *"Eu derrubo quem a frase mandar!"* [Próximo]. A câmera abre; cabeçalho e bancada voltam.
4. **Guia** (recorte nos pinos com sono): *"Derrube só quem tem sono!"* [Próximo] → (recorte na placa e na bancada) *"Monte a frase da bola."* [Ver].
5. **Demonstração, sem balão**, com pinos próprios (azuis e vermelhos; com sono = os azuis): a bolinha de toque aperta *é AZUL*, a peça voa para a placa, a bolinha aperta JOGAR e a bola faz a jogada inteira.
6. O rastelo varre, descem os pinos da fase 1. **Guia** (recorte na bancada inteira, todas as saídas por igual): *"Sua vez!"* [Vamos!].
7. **Fase 2, estreia do NÃO.** Descem os pinos da demonstração (com sono = os que não são vermelhos). **Guia** (recorte no NÃO): *"O NÃO troca a resposta."* [Ver]. A bolinha aperta *é VERMELHO*, depois o NÃO, depois JOGAR: na conferência, *é VERMELHO* ✓ vira ✗ e o pino pula; ✗ vira ✓ e ele cai. Rastelo, pinos da fase, *"Sua vez!"*.

Numa partida repetida, a abertura e as demonstrações não aparecem.

O `?` (em jogo) repete: *"Derrube só quem tem sono!"* (recorte nos pinos), *"Monte a frase da bola."* (placa + bancada) e, se a fase tem NÃO, *"O NÃO troca a resposta."* (recorte no NÃO).

## 10. Fim de fase e de nível

Acerto: os deitados roncam, os de pé dançam, a bola volta pela canaleta e sorri, a bolinha da fase acende (`CORRECT_ANSWER`, 10 pontos por fase). O rastelo desce, empurra os pinos para fora da pista e sobe; descem os da próxima fase.

Na última fase: confete, `GAME_COMPLETED` (com `stage` = nível e `totalStages: LEVELS.length`) e `showLevelComplete`. Enquanto o jogo tem só o N1, o painel traz JOGAR DE NOVO. Sem quadro de resumo, sem placar de strikes e sem taxa por operador.

## 11. N2 e N3 (planejados; só entram quando o usuário pedir)

### N2 — O E e o OU juntam duas partes

A placa já vem com as duas peças, e a vaga do meio está vazia: *"Derruba quem [é PEQUENO] [ ? ] [tem ÓCULOS]"*. Na bancada ficam **E**, **OU** e JOGAR. Na conferência, as duas peças ganham ✓/✗ e as marcas voam para o operador, que ganha a marca final (o letreiro do Rio de Chocolate). Nas fases finais, uma das peças também é escolhida entre duas cartas (2 cartas + E + OU + JOGAR = 5 tocáveis, numa fileira limpa). Pinos: 5, com 3 atributos mudando (entra o tamanho).

Armadilhas, garantidas na validação: no E, todo conjunto tem pino com só uma das partes (quem acha que E é OU deita um acordado); no OU, há pino certo só pela esquerda e só pela direita, e nenhum com as duas (quem acha que OU é E deixa um com sono de pé).

Sentenças da ficha: *é pequeno E tem óculos*, *é verde OU tem estrela*, *é azul E NÃO é grande* (esta vai para o N3).

### N3 — O NÃO dentro do E e do OU

As duas peças vêm na placa, cada uma com o seu botão NÃO embaixo, e o operador é escolhido: NÃO da esquerda + NÃO da direita + E/OU (um botão que alterna) + JOGAR = 4 tocáveis. Sentenças da ficha: *NÃO é verde E tem estrela*, *é grande OU NÃO tem óculos*, *é azul E NÃO é grande*. A validação exige que a frase certa tenha NÃO e que a mesma frase sem ele, ou com o operador trocado, erre.

## 12. O que mudou da ficha, e por quê

| Ficha | Aqui | Motivo |
|---|---|---|
| ler a sentença pronta e tocar nos pinos que a tornam verdadeira | a criança monta a frase; a bola executa | a mecânica da ficha é a do Rio de Chocolate (124); o usuário escolheu esta |
| modo espelho em 1 rodada do N3 | a montagem é o jogo inteiro | é o que sobrava de novo na ficha |
| 5–6 pinos | 4 no N1 (5 no N2 e no N3) | um pino a mais é mais 2 s de conferência para o 1º ano |
| TRAVA com cadeado, +5, corretos balançam após 2 travas | o erro acontece na pista: `WRONG_ANSWER` + `lose()` | errou, perdeu; balançar entregaria a resposta |
| derrubar "os pinos que tornam a frase verdadeira" | derrubar os pinos com sono | a encomenda precisa ser vista sem ler; a frase é da criança |
| a bola vai reta até o pino tocado | a bola passa por todos, e os que a frase não pega pulam | no boliche de verdade a bola derruba os vizinhos; aqui cada pino é conferido e cada um reage |
| placar de strikes, taxa por operador, troféu | bolinhas de fase, confete, `showLevelComplete` | nada de placar nem quadro de resumo |
| TÍTULO → exemplo 5 s → JOGO → RESULTADO | abertura em close, demonstração e `?` | fluxo da plataforma |
| "estrela no chapéu" | estrela na barriga | o chapéu seria mais um objeto com cor, e a estrela grande na barriga se lê a 60 px |
| NÃO/E/OU "em cores de destaque" | NÃO violeta | azul, verde e vermelho já são cores de pino |

## 13. Dados e arquivos

```
index.ts  types.ts
data/   files.ts layout.ts theme.ts timing.ts logic.ts levels.ts words.ts
scenes/ BootScene.ts GameScene.ts fallback.ts art.ts audio.ts view.ts
        lane.ts pins.ts ball.ts bench.ts header.ts sign.ts guide.ts touch.ts
        bubble.ts banner.ts
```

**Arte:** o N1 roda inteiro com a **arte de reserva** em Graphics, assada nas mesmas folhas, grades e ordem de células do TEXTURAS (`scenes/fallback.ts`). Um PNG com o mesmo nome em `src/assets/games/EF15CO03/boliche-magico/` substitui a reserva sem mudar código. O cabeçalho, a placa, a bancada, as marcas, o rastelo, o "Zz", o confete e a bolinha de toque são sempre do código.

## 14. Dúvidas

1. **Linha de arte.** O TEXTURAS está na linha padrão da rodada (chibi de figurinha, `references/19-chibi-figurinhas.jpg`). Se for outra, os prompts trocam só o bloco STYLE e o negativo.
2. **O sono como encomenda.** Se a criança não ler "com sono" de relance, a troca é por pinos que pedem para cair (braços para cima). O sono ficou porque é parado: nada pisca pedindo toque.
3. **Fase 2 com uma carta só.** Ali a única escolha é pôr ou não o NÃO, de propósito (é o treino logo depois da demonstração). Se ficar fácil demais, ela ganha uma segunda carta.

## Histórico

- 20/10/2026: plano e N1 em Graphics. Id 134 no catálogo (order 447), `NEXT_FREE_ID` = 135. Servidor `jogos-dev-boliche` (porta 5321). `LEVELS = [N1]` por enquanto, então o painel final traz JOGAR DE NOVO.
- Conferido sem navegador (o embutido não respondeu e o Chrome estava desconectado): `tsc` e `eslint` limpos, todos os módulos compilam no Vite, `validateLevels` passa e, para cada fase, cada frase errada cai na faixa esperada. **Ainda não jogado na tela.**
