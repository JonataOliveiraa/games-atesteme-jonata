# Boliche Mágico — brief dos dois artistas (21/10/2026)

Contrato: `D:/Documentos/Atesteme Jogos Fund 1/src/games/EF15CO03/boliche-magico/TEXTURAS.md` (leia inteiro).
Referência de estilo, anexar em TODA geração: `D:/Documentos/Atesteme Jogos Fund 1/references/35-chibi-voador.webp`.
Use o prompt copiável de cada seção inteiro, sem cortar o negativo.

## Divisão
- **Codex** → `fundo.png` (§3) e depois `cover-boliche-magico.png` (§7).
- **Codex #6** → `pinos.png` (§4), `enfeites.png` (§5) e `bola.png` (§6).

## Entrega
- Brutos em `D:/Documentos/Atesteme Jogos Fund 1/outputs/boliche-magico/raw/` (nunca apague nem sobrescreva bruto).
- Publicado em `D:/Documentos/Atesteme Jogos Fund 1/src/assets/games/EF15CO03/boliche-magico/` com o nome exato do TEXTURAS.
- Tamanho final exato da tabela do §1. Fundo e capa opacos; folhas com alfa de verdade (sem fundo branco/xadrez, sem halo; limpe alfa baixo).
- **Posição dentro da célula é contrato** (§1): rostos, estrela, óculos e travesseiro são camadas sobrepostas. Se a geração sair fora, recorte cada peça e recoloque no ponto de contrato com sharp (`D:/Documentos/Atesteme Jogos Fund 1/node_modules/sharp`). Os rostos devem cair em cima da cabeça do pino (centro 96,74) e no centro da bola.
- Confira as cores exatas dos pinos (azul #4F9BEA, verde #5CC46A, vermelho #EF5A5A) — recolorir com sharp se o gerador desviar.
- Ao terminar, acrescente a sua seção em `src/assets/games/EF15CO03/boliche-magico/MANIFEST.md` (arquivo, dimensões, grade, alfa, e onde ficou cada peça medida). Codex #6 cria o arquivo; Codex só acrescenta a seção dele.
- Não edite código nem o TEXTURAS. Não use maestri ask para falar com colegas: só responda aqui.
