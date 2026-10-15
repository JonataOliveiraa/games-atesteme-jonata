# Árvore da Família — planejamento

EF05CO02 · 5º ano · Pensamento Computacional · id 122
Texturas: [TEXTURAS.md](./TEXTURAS.md)

> **Estado (15/10/2026):** N1, N2 e N3 jogáveis com a arte, capa no catálogo.

---

## 0. Por que não é a ficha

A ficha da planilha (*Fábrica de Constelações*) repetia o **Metrô Mirim (076)**:
pedido de ligação, prova do caminho, limite de linhas e uma ligação que some.
O **Mapas em Rede (032)** também já cobria desenhar ligações a partir de uma
lista, a rota mais curta, a rede de amigos e o isomorfismo. A primeira troca, o
*Cometa de Um Traço Só* (caminho de Euler), foi feita e reprovada: *"não gostei
mt da ideia"*.

O usuário escolheu a **árvore genealógica**, com a referência de um jogo em que
cartões com rosto e parentesco (Tia, Irmão, Primo, Avô…) são pendurados nos
círculos de um diagrama desenhado em cima de uma árvore. Nenhum irmão da
EF05CO02 usa esse objeto. Ele é um grafo do mundo real que toda criança conhece.

## 1. O jogo em uma frase

**O vento (no N1), a onda (no N2) ou a chegada dos bichos (no N3) derrubam os
cartões da árvore da família, e a criança pendura cada pessoa de volta no lugar
dela, seguindo as linhas que ligam pais, filhos e casais.**

## 2. A habilidade na tela

| Frase da EF05CO02 | Onde aparece |
|---|---|
| "objetos do mundo real … representados através de grafos" | a família de verdade (avós, pais, tios, primos) vira **pontos** (os cartões) ligados por **linhas** (os galhos). Antes do vento, a árvore completa acende linha por linha, de cima para baixo |
| "quantidade variável de vértices" | a família cresce de fase em fase: brotam lugares novos (o tio, a irmã, os primos), e o N2 junta os dois lados da família |
| "vértices conectados por arestas" | a linha de um cartão só acende quando as duas pontas estão no lugar: quem está no chão deixa a ligação apagada |
| "manipulações simples sobre estas representações" | pendurar cada ponto pela ligação que ele tem. No N2, a ligação vem escrita no cartão ("mãe da Mãe"). No N3, a criança monta três grafos separados ao mesmo tempo |

**A régua do nível:** a posição de cada pessoa é decidida pelas **ligações**
dela (de quem é filho, com quem é casado), e não por uma cor ou um símbolo.

## 3. O laço

```
a família completa aparece ─► o vento derruba os cartões ─► toque num cartão
        ▲                                                         │
        │                                       os lugares vazios acendem iguais
        │                                                         │
 a família cresce  ◄── todos no lugar: a árvore comemora ◄── toque num lugar
 (fase seguinte)                                                  │
                                         certo: o cartão encaixa e a linha acende
                                         errado: cai, a faixa diz a ligação, lose()
```

## 4. Controle (toque, toque)

- **Toque num cartão do chão:** ele levanta. Os lugares vazios ganham todos a
  mesma borda amarela pulsante (sem apontar o certo).
- **Toque num lugar vazio:** o cartão voa até lá e é julgado na hora.
- Tocar no mesmo cartão, na grama ou no céu solta o cartão sem custo. Tocar em
  outro cartão troca a escolha, também sem custo.
- **Não há arrastar.** Arrastar um cartão só o escolhe; o encaixe vem do toque
  no lugar (`pointerdown` do lugar), e um dedo que escorrega não pendura nada.
- No PC é o mesmo, com o mouse.

## 5. A tela (1280 × 720, sem rolagem)

```
┌──────────────────────────────────────────────────────────────────────┐
│ (Nível 1) ● ○ ○  │      Arrume a árvore da família!       │      (?) │  96
├──────────────────────────────────────────────────────────────────────┤
│                     [Avô]──────[Avó]            ← fileira 0 (y 170)  │
│                 ┌──────────┴───────────┐                             │
│        [Mãe]──[Pai]                  [Tio]──[Tia]  ← fileira 1 (325) │
│           ┌──┴──┐                      │                             │
│       [João]  [Irmã]                [Primo]       ← fileira 2 (480)  │
│                    (a copa da árvore atrás)                          │
│ ~~~~ grama ~~~ [ ][ ][ ][ ][ ][ ] ~~~ cartões caídos (y 645) ~~~~~~~~ │
└──────────────────────────────────────────────────────────────────────┘
```

- Cartão de pessoa: **104 × 133**, a proporção da moldura do `ui.png` (189 × 241):
  rosto em cima (103) e faixa do nome embaixo (30, fonte 20). Fileiras em y 165,
  328 e 491.
- Lugar vazio: a moldura do cartão, tracejada e meio transparente.
- **No chão cabem no máximo 6 cartões**, numa fileira limpa (ver
  *densidade de alvos no celular*). Quando a família tem mais gente, alguns cartões
  **ficam presos** na árvore (balançam com o vento e não caem).
- O João é o cartão de referência: está sempre preso, com a faixa do nome em
  coral. Todos os parentescos dos cartões são **em relação a ele**.

## 6. O N1 — VENTANIA

**Assunto:** as gerações e os ramos de **um lado** da família (o do pai): avós
em cima, pais e tios no meio, filhos e primos embaixo. Quem é irmão tem a mesma
linha de cima.

| Fase | A família | Presos | No chão | O que é novo |
|---|---|---|---|---|
| 1 | Avô, Avó · Pai, Mãe · **João** | João | 4 | os pais ficam em cima do filho |
| 2 | + Tio (irmão do Pai) · + Irmã | João, Avô | 5 | o irmão do Pai é ligado aos mesmos avós; a irmã do João é ligada aos mesmos pais |
| 3 | + Tia (casada com o Tio) · + Primo | João, Avó, Pai | 6 | o casal do Tio e o filho deles |

**Lugares que valem a mesma coisa:** os dois lugares de um casal e os lugares de
irmãos aceitam qualquer um do par. Avô ou Avó em qualquer um dos dois lugares
de cima; Pai ou Mãe no casal de cima do João; Tio ou Tia no outro casal; Irmã no
lugar ao lado do João; Primo ou Prima embaixo do Tio e da Tia. O jogo julga pela
**ligação**, e não pela ordem de esquerda e direita.

Entre as fases, **a família cresce**: os lugares novos brotam na copa já com os
cartões novos ("Chegaram o Tio e a Irmã!"), e o vento volta.

## 7. Erro (a cena antes do `lose()`)

O cartão chega ao lugar errado, as linhas que ele tocaria piscam em laranja, ele
treme e cai. A faixa diz a ligação certa dele, em poucas palavras:

| Cartão | Faixa |
|---|---|
| Avô / Avó | "O Avô é pai do Pai!" / "A Avó é mãe do Pai!" |
| Pai / Mãe | "O João é filho do Pai!" / "O João é filho da Mãe!" |
| Tio / Tia | "O Tio é irmão do Pai!" / "A Tia é casada com o Tio!" |
| Irmã / Irmão | "A Irmã é filha do Pai e da Mãe!" |
| Primo / Prima | "O Primo é filho do Tio!" |

Depois, `WRONG_ANSWER` + `lose()`, que é a regra de um erro só. Escolher, soltar
e trocar de cartão nunca é erro.

## 8. Abertura e tutorial do N1 (uma vez)

1. A árvore com a família completa. As linhas acendem de cima para baixo e os
   cartões pulam um por um, em ordem de geração.
2. O João fala (balão letra a letra, esperando o botão):
   *"Esta é a árvore da minha família!"* [Próximo]
3. O vento: rajadas, folhas voando, a copa balança, os cartões tremem e voam
   para a grama, girando.
4. O João: *"O vento derrubou todo mundo!"* [Próximo] · *"Me ajuda a pendurar?"* [Vamos!]
5. **Demonstração sem texto:** o jogo escolhe o cartão do Pai (ele levanta, os
   lugares acendem), o cartão voa para o lugar em cima do João, encaixa, e a
   linha Pai–João acende.
6. Balões (`createTutorial`, recorte no Pai e no João): *"Pais ficam em cima dos filhos."*
   e depois *"Sua vez!"*.

O `?` repete dois balões: *"Siga as linhas da família."* e *"Pais em cima dos filhos."*.
Nenhum balão fala de toque ou de controle.

## 9. Fim de fase e de nível

- **Fase:** os cartões pulam em onda, seguindo as linhas de cima para baixo.
  Florzinhas brotam na copa, e o João comemora. Não há carimbo nem painel.
- **Nível:** confete e `showLevelComplete` com *"A árvore da família é um GRAFO:
  cada pessoa é um ponto, e as linhas ligam pais, filhos e casais."*

## 10. O N2 — MARÉ

**Assunto:** os **dois lados** da família. O João tem avós do lado do pai e avós
do lado da mãe, e os dois ramos se encontram no casal Pai + Mãe.

- **Cenário:** a praia. A árvore é desenhada na areia molhada, com as linhas
  cavadas e os cartões presos por conchas. O mar fica no alto da tela.
- **A bagunça:** a onda sobe a areia, carrega os cartões na espuma e os larga
  na faixa de baixo. Cada fase tem **até duas ondas**, cada uma levando **um
  lado**, para o chão nunca passar de 6 cartões.
- **O cartão diz a ligação:** há dois Avôs e duas Avós, então a faixa do nome
  traz a **ligação** no lugar do parentesco: *"Pai do Pai"*, *"Mãe da Mãe"*,
  *"Irmão do Pai"*, *"Irmã da Mãe"*, *"Filho da Tia"*. O cartão do N2 é mais
  largo (124 × 133) para caber. A pista é o conteúdo, e não a cor.
- **Feito assim (15/10/2026):** o `praia.png` fica a 0,97× com o mar numa
  faixa logo abaixo do cabeçalho. A onda (`onda.png`) desce de cima puxando o
  mar junto (um retângulo da cor da água acima dela), e os cartões soltos boiam
  por cima da espuma até a areia seca. Fase 3: o Primo bebê é filho só da Tia.

| Fase | A família | Ondas |
|---|---|---|
| 1 | avós do Pai · avós da Mãe · Pai, Mãe · João (7) | 1 onda leva os 4 avós |
| 2 | + Tio (irmão do Pai) · + Tia (irmã da Mãe) · + Irmã (10) | 1ª: lado do Pai · 2ª: lado da Mãe |
| 3 | + Tio (casado com a Tia) · + Primo bebê (12) | 1ª: lado da Mãe · 2ª: lado do Pai |

Erro: o mesmo idioma do N1, com a faixa usando a ligação escrita ("A Avó Lúcia
é mãe da Mãe!").

## 11. O N3 — TRÊS FAMÍLIAS DE BICHOS

**Assunto:** **três grafos separados ao mesmo tempo**. Cada cartão é ponto de
uma família só.

- **Cenário: um quintal largo, arrastável na horizontal** (pedido do usuário,
  15/10/2026). O `quintal.png` chegou com **2336 × 724**: ocupa a altura da tela
  e é quase duas telas de largura. Tem as **três arvorezinhas** lado a lado (a
  dos gatos, a dos cachorros e a dos coelhos), com os troncos em x ≈ 350, 1140 e
  1975 da imagem. Cada árvore tem o seu filhote preso embaixo (Mimi, Totó e
  Pipoca), e os parentescos são em relação a ele.
- **Arrastar o quintal** de lado é o gesto novo do N3 (e entra com o assunto
  novo). Enquanto o dedo arrasta, a cesta, o cabeçalho e os anéis somem e param
  de pegar toque; voltam quando o quintal para (como na Etiqueta Certa). Toque em
  lugar vale no **soltar** e só se o dedo não andou mais que ~12 px, para um
  arrasto nunca pendurar um cartão por engano. Setinhas nas bordas mostram que há
  mais quintal para os lados.
- **Os cartões chegam aos poucos:** o pombo-correio entra voando, traz **um
  cartão por vez** e o larga numa **cesta com 3 vagas**, presa no canto de baixo
  da tela (ela não rola com o quintal). A cesta enche até 3 e o pombo espera.
  **Não há relógio**: a pressa é só a da cesta cheia.
- A criança toca um cartão da cesta (ele levanta e fica levantado enquanto ela
  arrasta o quintal), leva o olho até a árvore certa e toca o lugar. Cartão na
  árvore de outro bicho é erro ("O Totó é filhote de cachorro!").
- **Abertura:** a câmera passeia pelas três árvores, uma por vez, com cada
  filhote se apresentando, e volta para a do meio.

| Fase | Cada árvore | Cartões que chegam |
|---|---|---|
| 1 | Pai, Mãe · filhote (preso) | 6 |
| 2 | Pai, Mãe · filhote + irmão | 9 |
| 3 | Avô, Avó · Pai, Mãe · filhote | 12 |

**Feito assim (15/10/2026):** o quintal entra com **zoom 1,4×** (mundo de 3270 ×
1002), a câmera fica em y 183 e só rola de lado; cada árvore ocupa uma tela
(troncos em x 477, 1593 e 2756 do mundo). Cartão do N3: **84 × 107**. Os avós
(fase 3) ficam acima da copa, sobre o céu. A cesta de 3 vagas fica no canto de
baixo à esquerda; o pombo voa da direita até ela. Erro de família: *"É da família
dos gatos!"*.

## 12. Regras na validação (`validateLevels`)

- no máximo 5 fases por nível; no máximo **6 cartões no chão** por vento ou onda;
- todo lugar aceita pelo menos um dos cartões da fase, e cada cartão que cai tem
  um lugar livre que o aceita;
- o João (ou o filhote, no N3) está sempre preso;
- toda pessoa está ligada à família (o grafo é conexo), e todo filho tem um casal
  ou um pai em cima;
- os cartões não se sobrepõem (≥ 132 px entre centros na mesma fileira) e não
  saem da copa;
- N1: um lado só (nenhum papel "materno"); N2: os cartões trazem a linha da
  ligação; N3: cada cartão pertence a uma espécie que existe na fase.

## 13. Dados e arquivos

```
data/people.ts   os papéis: nome no cartão, aparência, frase do erro
data/levels.ts   LEVELS: fases com lugares (x, y, papéis aceitos), famílias
                 (casal → filhos), quem fica preso, e a validação
data/layout.ts   cartão, fileiras, chão, cabeçalho
data/files.ts    as folhas (grade, recorte), qual célula é de quem
scenes/art.ts    usa os PNGs; sem eles, céu, árvore e moldura de reserva
scenes/faces.ts  rosto do cartão: familia.png / joao.png, ou reserva em Graphics
scenes/board.ts  a árvore: lugares, linhas, cartões, vento, comemoração
scenes/card.ts   o cartão (levanta, voa, encaixa, cai)
```

## 14. Decisões (régua: fácil e claro)

0. **Cartão levantado esconde o cabeçalho** (pedido do usuário, 15/10/2026): ao
   tocar num cartão, o cabeçalho sobe e some; volta quando o cartão é pendurado ou
   solto. Vale nos três níveis.

1. **Julga na hora**, cartão por cartão, sem botão de PRONTO. Cada cartão
   pendurado é uma decisão e tem uma resposta visível na hora.
2. **Toque, toque**, sem arrastar (ver *gesto físico precisa de trava*).
3. **Lugares equivalentes valem iguais** (casal, irmãos, primos): o jogo cobra a
   ligação, e não a esquerda ou a direita.
4. **A família completa aparece antes do vento.** É o momento em que o grafo se
   mostra, e no N1 lembrar também ajuda.
5. **Sem relógio** em nenhum nível. No N3 a pressa é só a da cesta cheia.

## 15. Dúvidas

1. Mostrar a árvore completa antes do vento deixa a criança **decorar** as
   posições. Isso está bom no N1? No N2 dá para mostrar só por 1 s, ou não
   mostrar.
2. No N2, ler a segunda linha do cartão ("mãe da Mãe") é a pista. Está bom para
   o 5º ano, ou prefere a ligação dita por um balão quando o cartão é tocado?
3. N3: a cesta enche e espera, sem pressa. Ele quer pressão de verdade (a cesta
   transborda e isso é erro)?

## Histórico

- 15/10/2026 — Fábrica de Constelações → Cometa de Um Traço Só (reprovado) →
  **Árvore da Família**, com N1 em `Graphics` para teste. Linha de arte: chibi de
  caderno (`references/37` e `38`).
- 15/10/2026 — chegaram as 9 folhas (falta a capa). O N1 passou a usar
  `familia`, `joao`, `ui`, `arvore` e `parque`; o cartão mudou para a proporção
  da moldura. O N3 ganhou o quintal largo e arrastável.
- 15/10/2026 — N2 e N3 feitos com a arte da pasta; o cabeçalho some enquanto um
  cartão está levantado.
