# Boliche Mágico — brief do Ferro (21/10/2026): dados do N2 e do N3

Pasta: `D:/Documentos/Atesteme Jogos Fund 1/src/games/EF15CO03/boliche-magico/`. Leia `src/games/INSTRUCOES.md`, o `PLANEJAMENTO.md` (§7 e §11) e `types.ts` (já atualizado por mim — é contrato, não mude).

**Você é dono só de `data/levels.ts` e `data/words.ts`.** Eu (Maestro) estou mexendo em todas as `scenes/*`, `data/layout.ts`, `data/files.ts`, `data/timing.ts`. Não toque nelas. O projeto não vai compilar inteiro enquanto eu trabalho; confira os seus dois arquivos com um script (ex.: `npx tsx` chamando `validateLevels()` e listando as soluções de cada fase), e mande o resultado.

## O contrato novo (types.ts)

```ts
export type Rack =
    | { kind: 'one'; pins: Pin[]; cards: Term[]; not: boolean }          // N1 (como hoje)
    | { kind: 'join'; pins: Pin[]; left: Term; right: Term }            // N2: a criança escolhe E ou OU
    | { kind: 'nots'; pins: Pin[]; left: Term; right: Term; op: Op }    // N3: operador fixo; a criança põe/tira o NÃO de cada parte
export type Teach = 'build' | 'not' | 'e' | 'ou' | 'nots'
```

## O que fazer

1. **N1:** acrescentar `kind: 'one'` em todos os racks (fases e demonstrações). Nada mais muda no N1.
2. **`sentences(rack)`** enumera por tipo: `one` como hoje; `join` = `{left, op:'e', right}` e `{left, op:'ou', right}` (sem NÃO); `nots` = as 4 combinações de NÃO na esquerda/direita com o `op` do rack. `solutions` continua `sentences().filter(fits)`.
3. **N2 — "O E e o OU juntam duas partes"** (`kind: 'join'`), **5 pinos**, 5 fases:
   - fase 1 `teach: 'e'` com `demo` (pinos próprios, roteiro com E); fase 2 `teach: 'ou'` com `demo` (roteiro com OU); fases 3–5 sem demo;
   - **exatamente 3 atributos mudam** entre os pinos (o tamanho entra: `size: 'pequeno'` aparece); `left.attr !== right.attr`, e os dois estão entre os que mudam;
   - de 1 a 4 com sono; pinos diferentes entre si;
   - **exatamente uma** das duas frases resolve;
   - armadilhas: fase de **E** tem pino acordado só com a esquerda e pino acordado só com a direita; fase de **OU** tem pino com sono só pela esquerda e pino com sono só pela direita;
   - respostas: E e OU os dois aparecem nas fases 3–5 (nada de cinco iguais); o desenho dos com sono muda de uma fase para a seguinte;
   - use as sentenças da ficha em alguma fase: *é PEQUENO E tem ÓCULOS*, *é VERDE OU tem ESTRELA*.
4. **N3 — "O NÃO dentro do E e do OU"** (`kind: 'nots'`), **5 pinos**, 5 fases:
   - fase 1 `teach: 'nots'` com `demo` (roteiro com NÃO numa parte só);
   - 3 atributos mudam (como no N2); **exatamente uma** das 4 combinações resolve, e ela tem pelo menos um NÃO;
   - no nível: há fase com o NÃO só na esquerda, fase com o NÃO só na direita; `op` aparece E e OU; no máximo uma fase com NÃO nas duas partes;
   - sentenças da ficha: *NÃO é VERDE E tem ESTRELA*, *é GRANDE OU NÃO tem ÓCULOS*, *é AZUL E NÃO é GRANDE*.
5. **`validateLevels`** cobre tudo acima (por nível), além das regras de hoje que valem para todos (pinos repetidos, sono no mesmo lugar da fase anterior, demo com sono em lugar diferente da fase, demo que resolve com o roteiro e é a única solução da demo). N1 continua com 4 pinos e 2 atributos.
6. **`LEVELS = [N1, N2, N3]`**, com `title` e `message` curtos no estilo do N1 (o `message` é o texto do painel de fim de nível; criança de 7–10 anos).
7. **`words.ts`:**
   - `TEACH.e = 'O E quer as duas.'`, `TEACH.ou = 'O OU quer uma ou outra.'`, `TEACH.nots = 'Cada NÃO vira a sua parte.'`;
   - `why(pin, s: Sentence, miss)` passa a receber a **frase inteira**: frase de um termo = como hoje; com `right` = `Ele ${fato da esquerda} e ${fato da direita}, mas não tinha sono!` / `..., mas queria deitar!`. O fato é sempre sobre o pino (`has`), não sobre o NÃO.
   - exporte também `opText(op)` → `'E'`/`'OU'`.

Ao terminar, responda aqui com: as 10 fases novas numa tabela curta (pinos, com sono, frase que resolve) e a saída da validação.
