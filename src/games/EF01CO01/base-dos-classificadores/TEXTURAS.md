# Base dos Classificadores — texturas

Uma clareira de floresta. A criança arrasta **pedrinhas polidas** para dentro
de **cestos de palha** com tampa de folha. Só a pedra e o cesto ganham textura,
porque são as duas coisas que ela olha o tempo todo. O resto é Graphics.

Tudo **PNG-24**, alfa real, grade exata sem sangria, cerca de 8% de margem
vazia por quadro. Sem texto, número, marca, moldura, linha de grade ou
interface. Leitura da grade da esquerda para a direita, de cima para baixo.

Peso alvo: sprites até 250 KB, fundo e capa até 400 KB. As texturas do jogo
antigo iam de 700 KB a 2 MB cada.

| arquivo | grade | quadro | folha | quadros |
|---|---|---|---|---|
| `pedras.png` | 2 × 2 | 512 | 1024 × 1024 | círculo · quadrado · triângulo · retângulo |
| `cestos.png` | 2 × 2 | 512 | 1024 × 1024 | fechado · aberto · engolindo · recusando |
| `bg-clareira.png` | — | — | 1672 × 941 | a clareira vazia |
| `cover-base-dos-classificadores.png` | — | — | 1672 × 941 | capa do catálogo |

## O que fica em Graphics

Plaquinha de regra, tronco de apoio das pedras, ícone de critério, brilho,
partícula, painel, botão, barra de tempo, medalha de fim de nível.

## As duas regras técnicas

### `pedras.png` vem quase branca

As três cores (vermelho, azul e amarelo) são pintadas com `setTint`. Cor na arte vira cor errada depois
de tingida.

| | |
|---|---|
| massa | `#f2f2f2` |
| brilho de cima | `#ffffff` |
| sombra de baixo | `#c8c8c8` |
| contorno | `#3a3a3a` |

As quatro formas precisam ter a **mesma massa visual**. Um triângulo inscrito
num quadrado parece menor que ele, e *tamanho* é um dos critérios de
classificação — se a forma já muda o tamanho aparente, o critério deixa de ser
honesto.

### `cestos.png` não tem cor de regra nem símbolo

Palha acinzentada e folha verde, sem vermelho, azul ou amarelo, e sem
círculo, quadrado ou triângulo desenhado nele. É exatamente isso que confunde
no jogo de hoje: base vermelha embaixo de uma regra de triângulo faz a criança
achar que precisa de um triângulo vermelho. Quem diz a regra é a plaquinha de
madeira desenhada em Graphics acima do cesto, e ninguém mais.

A palha também não pode puxar para amarelo saturado, senão briga com a pedra
amarela. Bege acinzentado, com o trançado em marrom.

Nos quatro quadros o cesto fica na mesma posição, no mesmo tamanho e com a base
na mesma linha: só o estado muda.

## Paleta

```
grama     #7fcb8a  #5aa96a        folha    #2f7a44  #4f9e5c
tronco    #a86b3c  #6b4a2f        palha    #d8c49b  #8a6a3f
céu       #bfe7ff                 sol      #ffd88a
tinta     #1f2a37
```

Cores das pedras, aplicadas por código e nunca na arte (só estas três, desde
29/09/2026):

```
vermelho #e14b4b   azul #4da3ff   amarelo #ffc857
```

As pedras nunca ficam soltas no gramado: elas descansam num tronco caído
desenhado em Graphics, de madeira clara.

A capa (`cover-base-dos-classificadores.png`, com título) mostra só as três
cores. A capa antiga `cover-01.png` continua na pasta, mas o catálogo não a usa mais.

## Ordem

`pedras.png` e `cestos.png` já sustentam o jogo inteiro. Depois o fundo, e a
capa por último.

## Som

Sem arquivo. Tudo sintetizado em WebAudio, respeitando `mute-audio`: pegar a
pedra, encaixe no cesto, recusa, acerto, fim de fase, alerta de tempo.
