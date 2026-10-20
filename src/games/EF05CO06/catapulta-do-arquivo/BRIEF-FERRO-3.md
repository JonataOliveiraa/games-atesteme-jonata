# Brief do Ferro 3 — aparelhos na superfície, buraco vira túnel

Pedido do usuário (20/10/2026): *"notei que os components sempre estão num buraco. o buraco é só uma adição, onde o arquivo pode cair e ir percorrendo o buraco."*

Então:
- **Os aparelhos ficam em pé na superfície**: no chão (num trecho plano) ou em cima de uma tábua. O arquivo que **encosta** no aparelho é guardado nele (alvo). A nuvem continua no céu.
- **O buraco é um túnel**: o arquivo cai na boca, **percorre o túnel por baixo da terra** (a criança vê o caminho) e **sai rolando** em outro ponto do mapa (`exit`), continuando a jogada. Túnel não é alvo nem erro: é atalho/obstáculo.

O contrato novo já está em `types.ts` (`DeviceDef`, `TunnelDef`, `MapDef.tunnels`/`devices`, `TargetId` = `d${n}` | `c${n}`, modo `tunnel`) e em `data/levels.ts` (`targetsOf`/`deviceAt`). O jogo não compila até você terminar; tudo bem.

## Seu (pode editar)

`data/maps.ts`, `scenes/world.ts`, `scenes/ball.ts`, `scenes/stage.ts`, `scenes/targets.ts`, `scenes/minimap.ts`, `scenes/fallback.ts`, `data/files.ts`, `data/theme.ts`, e **acrescentar** constantes novas em `data/layout.ts` (não mude as que existem, a não ser `HOLE_ART`/`DEVICE_SCALE`/`GABINETE`, que são deste assunto).

**Não mexa em:** `scenes/GameScene.ts` (é meu), `scenes/catapult.ts`, `order.ts`, `guide.ts`, `tap.ts`, `data/words.ts`, `data/levels.ts`, `types.ts`.

## API que eu vou usar no GameScene

```ts
// world
tunnelPath(i: number): Array<{ x: number; y: number }>   // da boca (centro) descendo, andando por baixo da terra, subindo até a saída na superfície
exitLaunch(i: number): { x: number; y: number; vx: number; vy: number } // o arquivo sai da boca de saída com um pulinho para a frente
deviceBox(i: number): { x: number; y: number; w: number; h: number }   // centro e tamanho da área de acerto, em pé na superfície
// ball.step devolve também
| { type: 'tunnel'; tunnel: number }   // entrou na boca (no lugar do antigo 'hole')
| { type: 'device'; device: number }   // encostou no aparelho
// targets (mesma interface de hoje): pos(id) = centro do aparelho; rect(id) = retângulo para o recorte do tutorial
```

`preview()` (a mira, em `ball.ts`) já para no primeiro evento que não é `none`; mantenha: a linha termina na boca do túnel ou no aparelho.

## O que fazer

1. **world/ball:** colisão círculo × caixa do aparelho → `device`; boca → `tunnel`. Caixa de acerto **generosa** (≥ 110 × 110 na tela) para criança. O aparelho não é parede: encostou, guardou.
2. **stage:** o túnel aparece **por dentro da terra**: um corredor com a textura `tunnel` do cenário (Rope ou TileSprites) seguindo o `tunnelPath`, largura ~80 % da boca, com contorno; na saída, uma **boca de saída** na superfície (anel/cano curtinho em Graphics assado ou textura). O caminho não pode cruzar outro túnel nem sair da tela por baixo (y < 700).
3. **targets:** aparelhos em pé (origem embaixo, na superfície), plaquinha com o **nome** acima. O aparelho `hdInterno` aparece como o **computador** (célula 0 da folha, que já traz o HD visível dentro; veja o contrato novo da arte abaixo). `glow/shake/tag` como hoje.
4. **minimap:** ícones dos aparelhos na superfície; túneis como linha tracejada por baixo.
5. **maps (os 12):** refaça com aparelhos na superfície e **1 a 3 túneis por mapa** (N1 F1 pode ter 0 ou 1). Mesmas listas de aparelhos/certos por mapa do brief 1 (troque "buraco" por "aparelho em pé"), mesma curva do acréscimo do N1 (F1: certo é o primeiro alvo, perto, ≤ 3 alvos; F2: certo é o segundo, sem mola; F3/F4 sobem), mesmos critérios do simulador (N1 F1–F2 ≥ 50 acertos, F3–F4 ≥ 30; N2/N3 no nível do N1 F4 ou abaixo; todo errado alcançável; densidade ≤ 4 alvos por janela de 1280). **Pelo menos um túnel por mapa (do N2 em diante) tem de ser útil**: a saída dele deixa o arquivo rolar até um aparelho (certo ou errado), e o simulador tem de contar acertos que passam por túnel. No simulador, o túnel é instantâneo: troque o estado pelo `exitLaunch`.
6. **DEMO do tutorial** (`DEMO.pull` em `layout.ts`, x −61, y 35, no VALE): tem de parar no chão sem tocar aparelho, túnel nem nuvem. Se o VALE novo não deixar, me mande outro puxão.
7. **fallback:** aparelhos em pé no novo contrato (abaixo) e a boca de saída.

## Contrato novo da `aparelhos.png` (a Aquarela vai regerar)

3 × 2 células de 320, sem recorte, **cada aparelho em pé com a base em y = 300**, centrado em x:
0 computador (torre com a tampa lateral aberta e o HD visível dentro) ≈ 200 × 280 · 1 HD interno sozinho (ícone) ≈ 160 × 110 · 2 pen drive em pé, ponta USB para cima ≈ 90 × 200 · 3 cartão de memória em pé ≈ 140 × 180 · 4 HD externo em pé ≈ 160 × 200 · 5 nuvem (centrada, sem base) ≈ 240 × 160.

Escala na tela sugerida: ~0,5 (aparelhos de ~100–140 px de altura). Ajuste ao MANIFEST quando chegar.

Rode `npx tsc --noEmit -p .` (o GameScene vai acusar `hole`/`holeCenter` até eu trocar; ignore só esses) e responda com `maestri ask "Claude Code #4" "<resultado + tabela do simulador>"`.
