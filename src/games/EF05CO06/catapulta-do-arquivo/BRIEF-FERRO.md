# Brief do Ferro — Catapulta do Arquivo, N2 e N3

Leia antes: `D:/Documentos/Atesteme Jogos Fund 1/src/games/INSTRUCOES.md`, o `PLANEJAMENTO.md` deste jogo (§5 mapas, §6 física, §10 travas), `types.ts` e `data/levels.ts` (já com N2/N3, contrato do Maestro).

Código em inglês, sem comentários novos além do estilo do arquivo. Não commite.

**Não mexa em:** `scenes/GameScene.ts`, `scenes/order.ts`, `scenes/guide.ts`, `scenes/targets.ts`, `data/words.ts`, `data/levels.ts`, `types.ts` (são do Maestro, que está mexendo agora). Se precisar de algo neles, me diga.

## A. Oito mapas novos em `data/maps.ts`

Hoje `DUNA`, `PIER`, `FAROL`, `RECIFE` (N2) e `PICO`, `GRUTA`, `TRILHA`, `CUME` (N3) são apelidos dos mapas do N1. Troque por mapas próprios, **mais complexos que os do N1** (2–3 molas, 2–3 tábuas, relevo com subidas e descidas), largura crescente:

| Mapa | Largura | Pedido | Buracos (da esquerda p/ direita) | Nuvens | Certos |
|---|---|---|---|---|---|
| DUNA | 2400 | REMOVÍVEL | hdInterno, penDrive, hdInterno, hdExterno | 1 | penDrive, hdExterno |
| PIER | 2600 | INTERNET | cartao, hdInterno, penDrive, hdExterno | 2 (uma no meio, alcançável; outra longe e alta) | as 2 nuvens |
| FAROL | 2800 | REMOVÍVEL | hdInterno, cartao, hdInterno, penDrive | 1 (errada: alta, fora da linha principal) | cartao, penDrive |
| RECIFE | 3000 | LOCAL | penDrive, hdExterno, cartao, hdInterno (no fim, com funil) | 2 | hdInterno |
| PICO | 2600 | INTERNET | hdInterno, penDrive, cartao | 1 (alcançável, com mola ou tábua ajudando) | nuvem |
| GRUTA | 2800 | REMOVÍVEL | hdInterno, hdExterno, hdInterno, penDrive | 1 (errada, alta) | hdExterno, penDrive |
| TRILHA | 2800 | LOCAL | cartao, penDrive, hdInterno, hdExterno | 1 | hdInterno |
| CUME | 3000 | REMOVÍVEL | hdInterno, cartao, hdInterno | 2 (erradas, altas) | cartao |

Regras (as do §10 do PLANEJAMENTO):
- todos começam no planalto da catapulta (x 0–300, y 460); bocas de buraco com a mesma altura dos dois lados;
- **densidade:** nunca mais de 4 alvos (buracos + nuvens) dentro de uma janela de 1280 px;
- o certo não pode ser sempre o mais perto: misture;
- **nuvem errada** fica alta ou fora da linha principal (não pode ser armadilha dos arcos médios);
- **valide no simulador** (escreva no scratchpad `C:/Users/teste123/AppData/Local/Temp/claude/D--Documentos-Atesteme-Jogos-Fund-1/2bf4ce89-d569-4da6-bdce-687b08e96cf1/scratchpad/`, reusando `scenes/ball.ts` `launch/step` e `scenes/world.ts`, passo fixo 1/180; a nuvem anda com `sway`, então teste a nuvem em 3 fases do balanço): grade de puxões de 30 a 190 px e de −10° a 80°. Cada alvo **certo** precisa de ≥ 12 puxões que o acertem e de pelo menos um puxão "seguro" (continua acertando com ±2 px). Cada **errado** também precisa ser alcançável (a decisão tem de ser real). Me mande a tabela de contagens por mapa.

## B. Um lugar por nível (`LevelDef.scenery`: `campo` | `praia` | `serra`)

- `data/files.ts`: chaves por cenário — céu `bg-ceu` / `bg-praia` / `bg-serra`; chão repetível `terra` / `areia` / `pedra`. Exporte algo como `SCENERY: Record<Scenery, { sky: string; ground: string }>`.
- `data/theme.ts`: cores por cenário para a borda de cima do chão (campo = grama verde; praia = areia clara com uma faixa de espuma/areia molhada; serra = neve lilás-clara), para os túneis/câmaras e para o mapinha. Algo como `LAND: Record<Scenery, {...}>`.
- `scenes/stage.ts`: `createStage(scene, map, world, scenery)` usa o chão e as cores do cenário.
- `scenes/minimap.ts`: as cores do relevo seguem o cenário (receba o `scenery`).
- `scenes/fallback.ts`: desenhe em `Graphics` os quatro novos (`bg-praia`, `bg-serra`, `areia`, `pedra`), mesmo tamanho dos PNGs (TEXTURAS.md §1). Fundo da praia: céu de fim de tarde lilás→pêssego, sol baixo, mar menta embaixo. Serra: céu marinho-lilás (nunca preto), lua creme, montanhas índigo com neve. A arte de verdade está sendo gerada pela Aquarela/Tesoura e vai substituir sozinha.
- O `BootScene` já carrega todo PNG da pasta.

Eu (Maestro) troco no `GameScene` a imagem do céu e a chamada do `createStage`/`createMinimap` para passar o cenário: deixe as assinaturas com `scenery` como último parâmetro.

## Fim

Rode `npx tsc --noEmit -p .` na raiz e corrija o que for seu. Responda com `maestri ask "Claude Code #4" "<resultado + tabela do simulador>"`.
