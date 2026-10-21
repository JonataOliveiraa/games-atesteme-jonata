
## Codex — fundo e capa (2026-10-21)

Gerados com **image_gen integrado**, anexando `references/35-chibi-voador.webp` em todas as gerações. Os prompts integrais utilizados, incluindo os negativos e as correções, estão em `outputs/boliche-magico/prompts-codex-20261021.md`. Nenhuma alteração no código do jogo ou no TEXTURAS.md.

| Arquivo publicado | Dimensões | Grade | Alfa |
|---|---|---|---|
| `fundo.png` | 1280 × 720 | cena única, sem células | não; RGB opaco |
| `cover-boliche-magico.png` | 1672 × 941 | capa única, sem células | não; RGB opaco |

### Fundo — posições conferidas

- Capô/sanefa: início em x≈330, topo y≈140; borda festonada até y≈225; segue até a borda direita. Pontos de luz amarelos na sanefa.
- Tampo da pista: y=470–515, madeira cor de mel com três pequenas setas para a direita; frente da pista: y=515–560; carpete lilás: y=560–720. Contornos nas linhas de transição têm antialias de cerca de 1px.
- Devolução de bola: máquina baixa à esquerda, aproximadamente x=30–173 e y=441–515, incluindo o contorno e a pequena boca voltada para a direita. O corpo principal ocupa x≈30–170; a boca fica na altura do tampo.
- Retângulo do medidor x=90–330, y=260–440: parede lisa clara, sem obstáculo. Retângulo dos pinos x=360–1180, y=230–460: parede lisa clara. Os enfeites luminosos de lua e estrela ficam somente no alto à esquerda.
- Sem bola, pino, personagem, texto, placar ou interface. Pista horizontal até a borda direita, sem fosso nem fuga em perspectiva.
- A primeira geração foi descartada por deslocar pista e sanefa. A segunda usou guia de composição e registro das faixas; a terceira fez limpeza localizada da parede. Original final de 1672×941 normalizado para 1280×720, sem recorte.

### Capa — composição conferida

- Título no alto, aproximadamente x=300–1540 e y=134–344: **Boliche Mágico**, conferido letra a letra, com acento agudo em **á**. Sem outro texto.
- Bola à esquerda, aproximadamente x=340–645, y=448–744; três furos, olhos brilhantes, estrelinhas douradas e rastro curto para a esquerda.
- Pino verde de óculos saltando: aproximadamente x=676–932, y=304–632. Pino azul com estrela e rosto sonolento caindo sobre travesseiro: aproximadamente x=980–1290, y=400–726. Pino vermelho deitado dormindo, cabeça no travesseiro à direita e pés na outra extremidade do corpo: aproximadamente x=1292–1644, y=525–720.
- Rostos nas cabeças, separados das barrigas pelas duas faixas brancas do pescoço; estrela somente na barriga do azul. Exatamente uma bola e três pinos; sem braços, mãos, chapéus ou pessoas.
- Correções por image_gen: anatomia dos pinos e posição dos pés do vermelho. Acabamento autorizado com sharp: ajuste cromático localizado nas cores-base azul `#4F9BEA`, verde `#5CC46A`, vermelho `#EF5A5A`, bola `#3B3F8F`, estrela `#FFD23F`, óculos `#2B2440`, travesseiros `#FFF4DC`, preservando sombras, brilhos e contornos. Sem alteração na tipografia durante o acabamento.
- A posição do salto do verde ficou um pouco à frente e à direita da bola, em vez de diretamente sobre ela. Os três estados e atributos pedidos estão representados.

### Brutos preservados

Todos os brutos abaixo são originais opacos de 1672×941 em `outputs/boliche-magico/raw/`. Nenhum bruto apagado ou sobrescrito.

- `fundo-v1-84a01776.png` — primeira geração.
- `fundo-v2-9357cfd4.png` — geração com guia de composição.
- `fundo-v3-f0107870.png` — **selecionado**, limpeza da parede.
- `cover-v1-1a057c95.png` — primeira geração.
- `cover-v2-ff85b97f.png` — correção de anatomia.
- `cover-v3-13873f5f.png` — **selecionado**, correção dos pés do pino vermelho, anterior ao ajuste cromático.



## Codex #6 / Aquarela — pinos, enfeites e bola (21/10/2026)

Geração com `image_gen` integrado, uma geração por folha, sempre com a referência `references/35-chibi-voador.webp` anexada. Prompts integrais dos §§4–6 preservados em `outputs/boliche-magico/raw/PROMPTS-CODEX6-512bfb62.md`. Nenhum código nem TEXTURAS.md alterado.

| Arquivo | Dimensões | Grade | Célula | Alfa |
|---|---|---|---|---|
| `pinos.png` | 768 × 576 | 4 × 2 | 192 × 288 | real, RGBA |
| `enfeites.png` | 576 × 288 | 3 × 1 | 192 × 288 | real, RGBA |
| `bola.png` | 768 × 512 | 3 × 2 | 256 × 256 | real, RGBA |

### Posição medida de cada camada

Coordenadas locais da célula, índices começando em 0, da esquerda para a direita e de cima para baixo. Caixas abaixo medidas com alfa ≥128; não incluem os poucos pixels de antialias mais tênues.

| Arquivo | Célula | Peça | Caixa medida (x, y, largura, altura) |
|---|---|---|---|
| `pinos.png` | 0 | corpo azul, sem rosto | 41, 20, 111, 259 |
| `pinos.png` | 1 | corpo verde, sem rosto | 41, 20, 111, 259 |
| `pinos.png` | 2 | corpo vermelho, sem rosto | 41, 20, 111, 259 |
| `pinos.png` | 3 | vazia | totalmente transparente, zero pixels |
| `pinos.png` | 4 | rosto acordado | 63, 53, 66, 44 |
| `pinos.png` | 5 | rosto com sono | 62, 53, 67, 41 |
| `pinos.png` | 6 | rosto dormindo | 63, 53, 66, 35 |
| `pinos.png` | 7 | rosto tonto | 64, 53, 65, 39 |
| `enfeites.png` | 0 | estrela amarela | 64, 176, 64, 58 |
| `enfeites.png` | 1 | óculos redondos, lentes transparentes | 57, 55, 79, 39 |
| `enfeites.png` | 2 | travesseiro creme, bolinhas lilás e duas estrelas | 21, 110, 150, 80 |
| `bola.png` | 0 | corpo azul-noite, três furos e estrelas, sem rosto | 20, 20, 216, 216 |
| `bola.png` | 1 | rosto normal | 57, 96, 143, 97 |
| `bola.png` | 2 | rosto rolando / esforço | 56, 109, 145, 71 |
| `bola.png` | 3 | rosto feliz | 51, 99, 154, 90 |
| `bola.png` | 4 | rosto ops, com gota de suor | 55, 95, 146, 98 |
| `bola.png` | 5 | rosto força / prendendo o fôlego | 62, 102, 132, 84 |

### Pontos do contrato e cores

- Corpos dos pinos: cabeça centrada em **(96,74)**, diâmetro visível de **108 px** na linha y=74 (x=43–150); barriga ancorada em **(96,200)**; base dos pezinhos em **y=278**, com os 9 pixels seguintes transparentes. Mesma geometria e mesmo alfa nos três corpos, conferidos byte a byte. Duas faixas brancas no centro do pescoço: **y=125–131** e **y=140–146**. A quarta célula superior está integralmente vazia.
- Rostos dos pinos: olhos alinhados aos pontos **(76,74)** e **(116,74)**, de modo a encaixar nos óculos; centro horizontal **x=96**, feições na área da cabeça, sem cabeça ou corpo atrás. As caixas medidas de cada expressão estão na tabela.
- Estrela: centro de caixa **(96,205)**, **64 × 58 px**; largura ~64 conforme o contrato. Óculos: centros das lentes **(76,74)** e **(116,74)**, conjunto visível **79 × 39 px** com keyline, interior transparente (alfa zero nos dois centros e discos centrais de raio 14 px). Travesseiro: centro **(96,150)**, **150 × 80 px**.
- Bola: corpo visível **216 × 216 px**, caixa **(20,20,216,216)**, centro **(128,128)**. Os cinco rostos ficam ancorados em **(128,144)**, um pouco abaixo do meio, com as caixas medidas da tabela; não há bola por trás dessas cinco células.

| Camada | Cor base exata | Pixels opacos com esse RGB |
|---|---|---|
| pinos.png, célula 0 | `#4F9BEA` | 13480 |
| pinos.png, célula 1 | `#5CC46A` | 13480 |
| pinos.png, célula 2 | `#EF5A5A` | 13480 |
| enfeites.png, célula 0 | `#FFD23F` | 1651 |
| enfeites.png, célula 1 | `#2B2440` | 497 |
| enfeites.png, célula 2 | `#FFF4DC` | 7580 |
| bola.png, célula 0 | `#3B3F8F` | 20310 |

### Finalização e verificação

Reempacotamento a partir dos bitmaps gerados: corpos, feições e enfeites extraídos e recolocados nos pontos do contrato. Os três pinos usam a geometria canônica do pino azul gerado, reproduzida com as três cores, para eliminar diferenças de silhueta entre as variantes. Ajuste do mapeamento vertical do corpo para compatibilizar cabeça, barriga e base. Recoloração das áreas de pintura para os RGB exatos, preservando faixas brancas, keyline, brilhos e sombra em tom da própria cor. A bola recebeu keyline branca fina; as feições têm keyline fina para leitura sobre azul-noite. Limpeza dos resíduos de alfa e de pequenas ilhas de cor da geração. Nenhum pixel com 0<alfa<32, nenhum RGB oculto sob alfa zero, nenhum vazamento nas bordas de qualquer célula. Prévia das sobreposições conferida visualmente, incluindo rostos com óculos e estrela e os cinco rostos sobre a bola.

Sem desvios de conteúdo, grade ou posição após a finalização. A altura da estrela ficou em 58 px (largura exata 64), mantendo o aspecto do desenho do gerador; o contrato pede tamanho aproximado.

### Brutos preservados sem alteração

- `outputs/boliche-magico/raw/pinos-raw-512bfb62-a809.png` — 1448 × 1086, RGBA.
- `outputs/boliche-magico/raw/enfeites-raw-02cd42bf-b74b.png` — 1774 × 887, RGBA.
- `outputs/boliche-magico/raw/bola-raw-5e5f0f7a-e814.png` — 1536 × 1024, RGBA.

Os brutos não são sobrescritos; os nomes incluem o identificador da geração.

