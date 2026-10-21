# Brief do Ferro — Operação Formiga, N2 e N3

O N1 está pronto e jogável (em Graphics). Você faz o **N2 e o N3 em código**, com **arte de reserva** em `scenes/fallback.ts` para as quatro folhas novas. A Aquarela está gerando os PNGs, e quando eles chegarem substituem a reserva sem mudar código.

**Leia antes:** `PLANEJAMENTO.md` §11 (as regras, os números, as aberturas e a validação, que são o contrato) e `TEXTURAS.md` §9 (as grades e a ordem das células das folhas novas). O padrão da casa está no N1: `gen` em todo `await`, `FX`, `createTutorial` via `guide.ts`, legendas curtas, nada pulsando à espera de toque.

## O que fazer

1. **Medidas (`data/fruits.ts`, `data/cutting.ts`):** `WIND_AREA = 15_000` no lugar de `WIND_MIN × whole`, com `blows(a)` sem a fruta inteira (o N1 tem de continuar igual: a maçã dá ~15 mil); `LIFT = 110_000` e `lifts(a)` com a mesma folga de `fits`; `MAX_PIECES = 12`. As duas folhas do N2 entram como itens cortáveis: `x = −a·cos t`, `y = b·sen t·(1 + 0,12·cos t)`, com folha verde (400, 223) e folha grande (440, 260), e polpa/pele: folha `#6CC24A`/polpa `#C9EFA0`, grande `#A8C93A`/polpa `#E9F5A8`. Generalize `FruitKind`, ou crie um tipo de item, como achar mais limpo, com folha e célula próprias (`folhas.png` é 1 × 2, células de 1024 × 640).
2. **Escala:** o prato com escala por item (`plateScale`, §11) e o zoom do corte por item (`min(CUT.zoom, 640 ÷ largura no mundo)`). O medidor no N2 ganha o círculo cheio com a formiguinha (`LIFT`).
3. **N2 (`levels.ts` + `GameScene`):**
   - **PESADA!**: encostar num pedaço maior que `LIFT` → empurra, legenda e modo de corte daquele pedaço (como o entalo: linha sugerida, ✓ só depois de um corte). Não é erro. Nada de empurrar em loop: depois do corte o pedaço é outro;
   - o cartão em **árvore** (2º andar pendurado na casinha-mãe; a mãe acende quando todas as filhas acendem);
   - a abertura/demonstração do §11;
   - o `?` do N2;
   - estrelas: 3 ao completar;
   - `validateLevels` com as regras do N2.
4. **N3:**
   - a folha gigante (sem corte);
   - a sujeira por cima, com o **esfregar** em raspadinha (modo próprio, câmera aproximada, ✓ para sair antes, sai sozinho quando limpa);
   - as amigas cochilando, que acordam ao encostar e seguem em fila pelo rastro;
   - **levar** só com todas as amigas, com o grupo junto e mais lento;
   - a folha que não passa na fresta (*NÃO PASSA!* e os pontinhos acendendo o caminho largo);
   - o caminho largo, que é o muro sem as pedras de y 168 e 250 só no N3;
   - entregar a folha **suja** = faixa + `WRONG_ANSWER` + `lose()`, uma vez;
   - o cartão com as 3 tarefas;
   - a abertura do §11, o `?` do N3, a validação e as fases da tabela.
5. **Reserva (`fallback.ts`):** `folhas` (as duas silhuetas exatas do contrato), `folha-gigante`, `sujeira` (gota, grão, raminho, pétala) e `amigas` (8 poses, verde-oliva com laço amarelo na antena; pode ser a formiga da reserva recolorida, com as poses novas de cochilo e bocejo). Registre as quatro em `data/files.ts` e no `BootScene` como as outras.
6. **Fim:** `LEVELS = [N1, N2, N3]`, N1 → N2 → N3 com `autoAdvance` e JOGAR DE NOVO no N3. Os sons novos podem sair do `audio.ts` (esfregar, acordar, PESADA, nojo).

## Regras

- Não mexa no N1 além do que o §11 manda (vento fixo, prato e zoom por item), e confira que ele continua passando na validação e jogando igual.
- Só esta pasta (`src/games/EF15CO04/operacao-formiga/`). Não commite.
- Identificadores em inglês; o texto que a criança lê em português.

## Antes de responder

- `npx tsc --noEmit -p .`, filtrando por `operacao-formiga`, sem erro novo, e `npx eslint` nos arquivos do jogo, limpo.
- **Jogue de verdade**, com o Chrome headless pelo CDP e cliques reais, na rota `/jogos/operacao-formiga` do servidor que estiver de pé: 5335 (`jogos-dev-formiga`) ou 5173. Perfil e capturas **no D:** (`--user-data-dir=D:/claude-temp/ferro-chrome --disk-cache-dir=D:/claude-temp/ferro-cache --disable-extensions`, capturas em `D:/claude-temp/ferro-shots`), nunca no C:, que vive cheio. A memória do PC também anda curta: um Chrome só, e feche-o no fim.
- O que testar: o N2 inteiro (demonstração, PESADA, o cartão em árvore, as duas folhas); o N3 inteiro (limpar e chamar em ordens diferentes, levar pelo caminho largo, NÃO PASSA na fresta); um erro de cada (vento no N2, folha suja no N3), cada um com UM `WRONG_ANSWER`; e o N1 intacto.
- Atualize o PLANEJAMENTO (Histórico) e responda: o que fez, o que testou, os ajustes que viu na tela e o que não fez.
