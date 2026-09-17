# Texturas — Sistema Operacional

## Princípio visual

O jogo mostra uma sala de controle infantil, clara o bastante para a criança entender que está operando o computador por trás dos programas. A arte precisa dar identidade aos programas e recursos; a interface e os estados ficam em código.

Não desenhar texto dentro de PNG. Não desenhar números, letras, placas, botões, balões, setas, brilho, X de erro, estrela, barra, trilho, encaixe, moldura, halo ou painel. Esses elementos mudam de estado e pertencem ao Phaser `Graphics`.

## Arquivos usados

| Key | Arquivo | Uso | Observação |
|---|---|---|---|
| `bg-central` | `bg-central.png` | cenário de fundo | sala de controle 16:9, sem texto, sem personagens importantes nas bordas |
| `recurso-teclado` | `recurso-teclado.png` | peça tocável | objeto isolado, fundo transparente |
| `recurso-mouse` | `recurso-mouse.png` | peça tocável | objeto isolado, fundo transparente |
| `recurso-monitor` | `recurso-monitor.png` | peça tocável | tela sem letras ou ícones reconhecíveis |
| `recurso-arquivos` | `recurso-arquivos.png` | peça tocável | pasta/arquivos genéricos, sem nomes escritos |
| `recurso-impressora` | `recurso-impressora.png` | peça tocável | sem papel com texto |
| `recurso-memoria` | `recurso-memoria.png` | peça tocável e referência dos encaixes | pente de RAM com quatro chips visíveis |
| `programa-editor` | `programa-editor.png` | programa que pede recursos | personagem/ícone de app sem letra |
| `programa-navegador` | `programa-navegador.png` | programa que pede recursos | diferenciar por forma/cor, sem logotipo real |
| `programa-player` | `programa-player.png` | programa que pede recursos | pode sugerir mídia sem usar botão textual |
| `programa-fotos` | `programa-fotos.png` | programa que pede recursos | pode sugerir imagem/câmera, sem texto |
| `programa-impressao` | `programa-impressao.png` | programa que pede recursos | relacionado à impressão, sem letras |
| `cover-sistema-operacional` | `cover-sistema-operacional.png` | thumbnail do catálogo | mostrar programa pedindo recurso, não apenas computador genérico |

Arquivos existentes mas fora do carregamento atual: `bg-sistemas.png`, `icone-app.png`, `programa-jogo.png`. Só devem voltar se uma fase realmente usar esses elementos.

## Formato

- PNG com transparência real para todos os recursos e programas.
- Cenário em 16:9, mínimo `1280 × 720`.
- Objetos e programas podem ficar em arquivos separados, como estão hoje; se forem refeitos em lote, preferir folha de sprites para cada família.
- Para folha de sprites: célula `256 × 256`, ordem documentada, sem linhas de grade exportadas.
- Negativo obrigatório em geração: `text, letters, numbers, logo, watermark, grid lines, UI buttons`.

## Escala no jogo

| Tipo | Tamanho na grade | Tamanho real aproximado no celular |
|---|---:|---:|
| Programa no pedido | 118 px de altura útil | 35 px |
| Programa na fila | 46 px de altura útil | 14 px |
| Programa no encaixe | 38 px de altura útil | 11 px |
| Recurso na fileira | até 132 px de altura útil e 168 px de largura útil | até 40 × 50 px |
| Área de toque do recurso | 176 × 168 px | 53 × 50 px |

Como a arte tem margens transparentes diferentes, cada quadro precisa ser medido por caixa alfa. Os recortes atuais ficam em `data/niveis.ts` no objeto `RECORTE`.

## Direção por família

### Cenário

Sala de controle acolhedora, com luz ciano discreta e fundo escuro limpo. Deve ter profundidade, mas pouco ruído visual. O pedido fica em uma placa translúcida por cima, então o centro da tela não pode ter detalhes que disputem com texto.

Evitar: telas com texto, números, gráficos reais, cabos cruzando a área central, objetos muito contrastantes atrás da frase.

### Recursos

Todos os recursos precisam parecer do mesmo conjunto, com iluminação parecida e perspectiva compatível. Eles ficam alinhados no chão da sala, sem placa atrás.

Regras específicas:

- `recurso-memoria` deve continuar largo e baixo, com quatro chips visíveis;
- `recurso-impressora` deve parecer indisponível só pelo estado do código, não pela arte;
- `recurso-monitor` não deve exibir conteúdo legível;
- `recurso-arquivos` deve ler como arquivos/pasta, não como aplicativo.

### Programas

Os programas funcionam como pequenos personagens ou mascotes de aplicativo. Precisam ser distintos de relance na fila, mesmo pequenos.

Cada programa deve ter silhueta própria:

- editor: forma de folha/lápis ou app de escrita, sem letras;
- navegador: globo/compasso/janela genérica, sem logotipo real;
- player: mídia/som/vídeo sem símbolo textual;
- fotos: álbum/câmera/paisagem simplificada;
- impressão: app relacionado à impressora, diferente da própria impressora.

## O que não pedir para a arte

Não pedir:

- botão `NÃO DÁ`;
- botão `?`;
- luzes de vida;
- barra de tempo;
- X vermelho de sem energia;
- encaixes da memória;
- trilho da fila;
- halos, brilhos, partículas, sombras de estado;
- painéis, cartões, balões, molduras;
- textos dentro de cenário, programa ou recurso.

Esses elementos precisam mudar de cor, tamanho, alfa e estado; ficam em código.

## Placeholder

Enquanto uma textura não existir:

- recurso vira cartão no tamanho final com o nome da peça;
- programa vira ícone simples com silhueta genérica;
- cenário vira preenchimento escuro com véu;
- a jogabilidade continua inteira, porque todo estado importante é desenhado por código.

O carregamento deve continuar por `import.meta.glob`. Arte ausente não pode quebrar `vite build`.

## Checklist de entrega da arte

- [ ] PNGs sem texto, letras, números, marcas ou watermark;
- [ ] transparência real nos objetos;
- [ ] margem transparente moderada e consistente;
- [ ] todos os recursos com escala visual parecida;
- [ ] programas distintos quando reduzidos para 46 px;
- [ ] pente de memória com quatro chips;
- [ ] cenário limpo no centro;
- [ ] thumbnail comunica “programa pede recurso ao sistema”;
- [ ] recortes alfa medidos de novo após qualquer troca de arquivo.
