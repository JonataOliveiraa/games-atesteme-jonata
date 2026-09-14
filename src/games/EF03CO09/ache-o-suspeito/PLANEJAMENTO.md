# Ache o Suspeito — Planejamento

Documento irmão: [TEXTURAS.md](./TEXTURAS.md)

**EF03CO09 · 3º ano · Cultura Digital · Segurança e responsabilidade**

**Versão revisada:** galeria escolar vista diretamente pelos olhos do jogador.
Não aparecem mãos, corpo, estilingue ou lançador. A criança toca numa placa e
uma bolinha de papel voa automaticamente da parte inferior da tela até ela.

> **“Suspeito” é o compartilhamento mostrado na placa, nunca uma pessoa.**

---

## 1. Habilidade BNCC

> (EF03CO09) Reconhecer o potencial impacto do compartilhamento de informações pessoais ou de seus pares em meio digital.

Objeto: **Segurança e responsabilidade no uso da tecnologia**.

> O professor poderá apresentar um caso em que foram utilizados dados roubados de pessoas, solicitando aos alunos que destaquem o que pode ter acontecido para que os dados pudessem ter sido roubados. Poderá ainda, a partir do que foi levantado pelos alunos, criar um painel com imagens dos dispositivos computacionais como tablets, celular, computador, apontando em cada um os impactos de acordo com o que mais se utiliza nesses dispositivos.

O jogo pede que a criança reconheça:

- qual informação está na placa;
- de quem é a informação;
- para qual público ela será enviada;
- se existe permissão;
- qual impacto o compartilhamento pode produzir.

A bolinha é apenas a forma divertida de marcar a decisão. O sentido pedagógico
está nas situações e na consequência apresentada após cada acerto.

---

## 2. Teste da bolinha

Se endereço, telefone, localização, foto e destino forem substituídos por
formas sem significado, não é possível descobrir qual placa deve ser atingida.

A posição, a cor e o movimento das placas não indicam a resposta. A criança
precisa ler e interpretar o compartilhamento.

---

## 3. Diferença para o jogo irmão

Já existe `EF03CO09/investigacao-dados-risco`.

| Investigação: Dados em Risco | Ache o Suspeito |
|---|---|
| post já publicado | compartilhamento prestes a acontecer |
| toca num trecho perigoso do texto | toca numa placa com situação completa |
| procura dado dentro da mensagem | considera dado, destino e permissão |
| tela de investigação | galeria escolar de placas |
| espectadores aparecem | cópias percorrem a rede mostrando impacto |
| compara versões no nível 3 | protege dados dos colegas com consentimento |

Não dividir a frase da placa em palavras tocáveis. A placa inteira é a decisão.

---

## 4. O jogo em uma frase

**Leia as placas e toque no compartilhamento suspeito; uma bolinha de papel
voa até ele e revela o impacto que foi evitado.**

Gênero: **tiro ao alvo educativo / jogo de atenção e interpretação**.

A aparência lembra uma brincadeira escolar de acertar painéis com papel, sem
arma, estilingue, pedra, explosão ou pessoa usada como alvo.

---

## 5. Visão do jogador

A câmera fica diante de uma sala de aula acolhedora:

- duas janelas aparecem nas laterais;
- parede central clara recebe as placas;
- carteiras e estantes ficam somente nas bordas;
- placas entram como elementos digitais flutuantes;
- não existem trilhos, ganchos ou suportes segurando as perguntas;
- uma bolinha surge da borda inferior somente depois do toque;
- pequeno avatar fictício “VOCÊ” aparece no HUD.

É uma visão pelos olhos do jogador, mas sem mãos ou corpo visíveis.

A foto de usuário é uma personagem fictícia do jogo. Não acessar webcam,
arquivos ou fotografia real.

---

## 6. O laço

~~~text
PLACAS ENTRAM
→ descem suavemente
→ param para leitura
→ cada uma mostra dado, destino e permissão

ESCOLHER
→ a criança toca na placa suspeita
→ controles bloqueiam por um instante

BOLINHA
→ surge no centro inferior
→ percorre um arco automático
→ atinge exatamente a placa tocada

RESULTADO
→ suspeita: placa amassa e o impacto evitado aparece
→ segura: placa balança e ativa a TRAVA

CONCLUIR
→ placas seguras seguem para o destino
→ começa a próxima onda
~~~

**Fase = uma onda de placas.** Cada nível tem três ondas.

Não há pontaria manual, tiro perdido ou cálculo de força. O clique na placa é a
resposta e a animação da bolinha confirma essa resposta.

---

## 7. Uma onda concreta

Placa A:

- **“Enviar meu desenho para a professora.”**
- destino: **MURAL FECHADO DA TURMA**
- dado: produção escolar própria.

Placa B:

- **“Mandar meu endereço para ganhar um prêmio.”**
- destino: **PERFIL PÚBLICO DESCONHECIDO**
- dado: endereço de casa.

As duas placas descem e param.

A criança toca na Placa B:

1. uma bolinha de papel surge em (640, 690);
2. percorre um arco até o centro da placa;
3. gira durante o voo;
4. achata levemente no impacto;
5. a placa dobra como papel;
6. aparece uma simulação transparente;
7. cópias do ícone de casa chegam a desconhecidos;
8. surge:
   **“O endereço poderia mostrar a desconhecidos onde você mora.”**
9. a placa segura segue para a professora.

Se tocar na Placa A, a bolinha bate e cai. A placa permanece inteira:
**“O desenho é seu e iria para a professora num espaço fechado.”**

---

## 8. Controle

Um gesto: **toque**.

| Toque | Resultado |
|---|---|
| placa | lança a bolinha automaticamente até ela |
| placa durante TRAVA | permite nova resposta |
| ? | pausa e abre tutorial |
| CONTINUAR | passa à próxima onda |
| impacto no resultado | repete a simulação |

Não tocar na bolinha, arrastar, mirar, segurar ou controlar a força.

Durante o voo de aproximadamente 0,45 s, todas as placas e botões ficam
inativos. O ? continua disponível e pausa a animação.

A área tocável é toda a placa, não apenas o texto ou pictograma.

---

## 9. Movimento sem punir leitura

As placas sempre chegam e permanecem paradas por tempo suficiente para a
primeira leitura. Não há cronômetro.

### Nível 1

Placas totalmente estáticas.

### Nível 2

Depois da entrada, as placas executam:

1. pausa de 3,5 s;
2. deslocamento horizontal de 65 px em 0,9 s;
3. pausa de 3,5 s;
4. retorno em 0,9 s.

O ciclo se repete. Elas nunca trocam de faixa nem se sobrepõem.

### Nível 3

Depois da entrada, as placas executam:

1. pausa de 3,5 s;
2. descida de 58 px em 0,7 s;
3. subida de 116 px em 1,0 s;
4. retorno ao centro em 0,7 s;
5. pausa de 3,5 s.

O texto não muda e a placa nunca sai da tela.

Ao tocar numa placa, todas congelam imediatamente antes do lançamento.
Portanto, a bolinha sempre atinge a opção escolhida.

Modo de movimento reduzido mantém as placas paradas em todos os níveis.

---

## 10. Grade fixa — 1280 × 720

Usar Phaser.Scale.FIT.

| Faixa | y | Conteúdo | Tamanho base | A 30% |
|---|---:|---|---:|---:|
| cabeçalho | 0–140 | avatar, nível, ondas, vidas e ? | ? 134 × 134 | 40 × 40 |
| placas | 140–510 | duas ou três situações | 340 × 310 ou 310 × 310 | 102 × 93 |
| lançamento | 510–720 | espaço de voo e origem da bolinha | bolinha 92 × 92 | 28 × 28 |

### Placas do nível 1

| Placa | Caixa |
|---|---|
| esquerda | (205, 166, 360, 310) |
| direita | (715, 166, 360, 310) |

### Placas dos níveis 2 e 3

| Placa | Caixa |
|---|---|
| esquerda | (105, 166, 320, 310) |
| centro | (480, 166, 320, 310) |
| direita | (855, 166, 320, 310) |

### Outros elementos

| Elemento | Caixa |
|---|---|
| avatar VOCÊ | (16, 8, 120, 120) |
| ? | (1132, 3, 134, 134) |
| progresso | (470, 42, 340, 64) |
| origem da bolinha | centro (640, 684) |
| caixa de reciclagem | (1090, 548, 140, 140) |
| faixa de feedback | (170, 150, 940, 118) |

A bolinha não é um botão; pode ter 28 px reais porque não precisa ser tocada.

---

## 11. Conteúdo das placas

Cada placa contém:

| Área | Altura |
|---|---:|
| dono do dado | 44 px |
| mensagem | 116 px |
| destino | 62 px |
| permissão | 44 px |
| rodapé visual | 28 px |

O pictograma do dado ocupa 72 × 72 ao lado da mensagem.

Limites:

- mensagem: 66 caracteres;
- destino: 24 caracteres;
- permissão: 18 caracteres;
- dica: 82 caracteres;
- no máximo três linhas.

Comando geral:

**“Toque no compartilhamento suspeito.”**

Não repetir uma pergunta longa em cada placa.

---

## 12. Progressão

### Nível 1 — Duas placas paradas

Dados próprios e situações evidentes.

| Onda | Suspeita | Segura | Impacto |
|---|---|---|---|
| 1.1 | endereço para perfil público desconhecido | desenho para professora | desconhecidos podem saber onde mora |
| 1.2 | telefone para pessoa desconhecida do jogo | animal favorito no grupo da turma | desconhecido pode ligar ou enviar mensagens |
| 1.3 | localização ao vivo em perfil público | experimento sem rostos no site escolar | pessoas podem saber onde está agora |

### Nível 2 — Três placas em movimento horizontal

O destino altera o risco.

| Onda | Suspeita | Seguras |
|---|---|---|
| 2.1 | horário e nome da escola em perfil público | desenho no mural fechado; projeto sem rostos no site escolar |
| 2.2 | foto da fachada de casa para grupo aberto | convite sem endereço; preferência no grupo da turma |
| 2.3 | identificação do carro em postagem pública | foto de objeto sem pessoas; mensagem para professora |

### Nível 3 — Movimento vertical e dados dos colegas

Permissão fica explícita.

| Onda | Suspeita | Seguras |
|---|---|---|
| 3.1 | foto de Téo sem permissão no perfil público | desenho autorizado para exposição; projeto coletivo autorizado |
| 3.2 | apelido constrangedor de Bia no grupo da escola | foto autorizada no grupo das famílias; parabéns sem dado pessoal |
| 3.3 | endereço do colega enviado a desconhecido | trabalho autorizado com crédito; resultado da equipe sem dado sensível |

A dificuldade principal continua conceitual. O movimento é lento, previsível e
pode ser desligado.

---

## 13. Regra em dados

Tudo fica em `data/levels.ts`.

~~~ts
type Owner = 'self' | 'peer' | 'none'
type Audience = 'trusted' | 'closed-group' | 'public' | 'unknown'
type DataKind =
    | 'address'
    | 'phone'
    | 'live-location'
    | 'school-routine'
    | 'vehicle-plate'
    | 'peer-image'
    | 'peer-story'
    | 'school-work'
    | 'preference'

interface TargetCard {
    id: string
    message: string
    destination: string
    owner: Owner
    audience: Audience
    dataKinds: DataKind[]
    consent?: boolean
    impact: string
}

interface Wave {
    id: string
    movement: 'still' | 'horizontal' | 'vertical'
    cards: TargetCard[]
}
~~~

Não guardar `dangerousCardId`.

~~~ts
const SENSITIVE = new Set<DataKind>([
    'address',
    'phone',
    'live-location',
    'school-routine',
    'vehicle-plate',
])

const exposesSensitiveData = (card: TargetCard) =>
    card.dataKinds.some(kind => SENSITIVE.has(kind))
    && (card.audience === 'public' || card.audience === 'unknown')

const exposesPeerWithoutConsent = (card: TargetCard) =>
    card.owner === 'peer' && card.consent !== true

const isSuspiciousShare = (card: TargetCard) =>
    exposesSensitiveData(card) || exposesPeerWithoutConsent(card)
~~~

Validar:

- três ondas por nível;
- duas placas no nível 1;
- três nos níveis 2 e 3;
- exatamente uma suspeita por onda;
- todo dado de colega declara consentimento;
- textos respeitam limites;
- nenhuma resposta depende de posição;
- ordem embaralhada uma vez por onda;
- placas não se sobrepõem em nenhum extremo do movimento.

---

## 14. Lançamento automático

Não usar física livre. O voo é determinístico:

1. registrar o centro atual da placa tocada;
2. congelar todas as placas;
3. criar bolinha em (640, 684);
4. calcular ponto de controle acima e deslocado;
5. percorrer curva quadrática em 0,45 s;
6. girar 300°;
7. trocar para frame de impacto;
8. chamar uma única resolução;
9. destruir ou devolver a bolinha.

Uma placa clicada sempre é atingida. Não existe tiro perdido.

O arco deve permanecer dentro da tela e não passar sobre o botão ? ou avatar.
Usar token de lançamento para ignorar callbacks antigos.

---

## 15. Erro e TRAVA

Atingir placa segura é erro conceitual:

1. bolinha bate e cai;
2. placa balança e permanece inteira;
3. todas as placas ficam paradas;
4. cadeado âmbar aparece sem cobrir o texto;
5. dica explica por que o compartilhamento é adequado;
6. emitir `WRONG_ANSWER`;
7. chamar `lives.lose()`;
8. reativar as placas;
9. após dois erros, a suspeita pulsa;
10. somente acertar a suspeita destrava.

Exemplo:

**“O desenho é seu e vai para a professora num espaço fechado.”**

Não usar “Errou” sem causa.

---

## 16. Acerto e impacto

Ao acertar a suspeita:

1. bolinha achata levemente;
2. placa dobra como papel;
3. voa para a reciclagem;
4. outras placas congelam;
5. pictograma do dado cria cópias transparentes;
6. cópias viajam até público/desconhecidos;
7. frase explica o impacto potencial;
8. placas seguras seguem para os destinos;
9. próxima onda.

A transparência e linha pontilhada deixam claro que o impacto foi evitado.

---

## 17. Pontuação

| Evento | Pontos internos |
|---|---:|
| suspeita na primeira escolha | +10 |
| suspeita depois da TRAVA | +5 |
| placa segura atingida | perde vida; não subtrai ponto |
| rever impacto | 0 |

Máximo: 90.

Nenhum número aparece na tela. Mostrar vidas, três ondas e estrelas 90–70.

---

## 18. Feedback

| Momento | Visual | Som |
|---|---|---|
| placas entram | descem e param | papel deslizando |
| tocar placa | afunda levemente | clique |
| bolinha surge | escala de 0 para 1 | amassado curto |
| voo | arco e rotação | sopro leve |
| placa segura | balança e TRAVA | tom neutro grave |
| suspeita | dobra e recicla | impacto de papel |
| impacto evitado | fichas transparentes se multiplicam | pulsos |
| onda completa | seguras seguem | acorde curto |
| nível completo | painel com três placas | aplauso curto |

Sem explosão, fogo, rachadura, arma ou sirene.

---

## 19. Tutorial

Quatro passos:

1. **“Leia o dado e o destino.”**
2. **“Ache o compartilhamento suspeito.”**
3. **“Toque na placa.”**
4. bolinha voa:
   **“O impacto mostra o que você evitou.”**

Exemplo: endereço público versus desenho para professora.

O ? pausa movimento, bolinha, áudio e callbacks.

---

## 20. Resultado

Após três ondas:

- três placas suspeitas amassadas;
- pictograma de cada dado;
- região que poderia receber cópias;
- frase de impacto;
- selo **PROTETOR DE DADOS**;
- estrelas;
- REVER IMPACTOS e CONTINUAR.

Frase-síntese:

**“Antes de compartilhar, veja qual é o dado, de quem ele é e até onde pode
chegar.”**

---

## 21. Áudio

Sintetizado em WebAudio:

- entrada de placa;
- surgimento da bolinha;
- voo de papel;
- impacto macio;
- cópias digitais;
- conclusão.

Respeitar `mute-audio`. Todo feedback tem equivalente visual.

---

## 22. Texturas

Seis arquivos:

1. `bg-sala-de-alvos.png`;
2. `bolinha-de-papel.png`;
3. `foto-usuario.png`;
4. `destinos-da-rede.png`;
5. `dados-suspeitos.png`;
6. `cover-ache-o-suspeito.png`.

Não existem texturas de mãos, corpo, lançador, trilho ou suporte de placa.

Placas, textos, trajetória do voo, reciclagem, fichas, botões e HUD ficam em
Graphics/Phaser.Text.

Detalhes em [TEXTURAS.md](./TEXTURAS.md).

---

## 23. Arquitetura prevista

~~~text
ache-o-suspeito/
├── PLANEJAMENTO.md
├── TEXTURAS.md
├── index.ts
├── types.ts
├── data/
│   ├── layout.ts
│   ├── theme.ts
│   └── levels.ts
└── scenes/
    ├── BootScene.ts
    ├── GameScene.ts
    ├── createTargets.ts
    ├── launchPaperBall.ts
    ├── createImpactPreview.ts
    └── audio.ts
~~~

Usar:

- Phaser 1280 × 720 com Scale.FIT;
- `createLoadingScreen`;
- `faseInicial`;
- `createLives`;
- `createTutorial`;
- `showLevelComplete`;
- `runtimeGameBridge`;
- FX compartilhados;
- níveis somente em `data/levels.ts`;
- `import.meta.glob` com fallback;
- GameScene como orquestradora.

---

## 24. Primeiro corte

Implementar somente o nível 1:

- sala de aula com janelas;
- nenhuma mão ou lançador;
- duas placas estáticas;
- toque na placa;
- bolinha voando automaticamente;
- TRAVA ao acertar placa segura;
- impacto evitado;
- três ondas;
- tutorial, ?, vidas, mudo e conclusão.

Somente após o teste:

- terceira placa;
- movimento horizontal;
- movimento vertical;
- dados dos colegas;
- capa definitiva.

---

## 25. Telemetria

Registrar:

- placa escolhida primeiro;
- tempo antes do primeiro toque;
- movimento ativo ou reduzido;
- erros conceituais;
- correção após TRAVA;
- dado próprio ou de colega;
- uso do ?.

Não registrar coordenadas brutas, foto real ou informação pessoal.

---

## 26. Critérios de aceite

### Visual

- [ ] cenário é uma sala de aula com janelas;
- [ ] parede central funciona como área de brincadeira de alvo;
- [ ] não há trilho, gancho ou suporte;
- [ ] não aparecem mãos ou corpo;
- [ ] não aparece lançador;
- [ ] bolinha de papel é claramente visível;
- [ ] avatar é fictício.

### Pedagógico

- [ ] cada placa mostra dado, destino e permissão;
- [ ] impacto aparece depois do acerto;
- [ ] suspeito é compartilhamento, não pessoa;
- [ ] regra não depende de posição ou cor;
- [ ] nível 3 inclui dados dos colegas.

### Interação

- [ ] um toque lança;
- [ ] placa clicada sempre é atingida;
- [ ] área inteira da placa é tocável;
- [ ] não existe arraste ou pontaria manual;
- [ ] movimento congela no toque;
- [ ] modo reduzido deixa placas paradas.

### Produção

- [ ] três níveis × três ondas;
- [ ] apenas nível 1 no primeiro corte;
- [ ] seis texturas;
- [ ] nenhuma textura de mão ou lançador;
- [ ] áudio sintetizado;
- [ ] regra sem `dangerousCardId`;
- [ ] fallback completo.

---

## 27. Resumo

Ache o Suspeito agora é uma galeria escolar simples. A criança lê placas numa
sala de aula, toca na situação perigosa e vê uma bolinha de papel voar sozinha
até o alvo.

A interação ficou direta e a tela ficou limpa. O movimento acrescenta vida aos
níveis seguintes sem transformar a atividade em teste de pontaria.

---

## 28. O que foi construído (nível 1, 11/09/2026)

O primeiro corte do §24 está de pé e jogável: sala de aula sem mão nem lançador,
duas placas estáticas por onda, toque na placa, bolinha voando sozinha, TRAVA ao
acertar a placa segura, prévia do impacto evitado, três ondas, tutorial, `?`,
vidas, mudo e conclusão. Os níveis 2 e 3 não existem em código — `LEVELS` tem
uma entrada, e o movimento das placas (`Wave.movement`) já está no tipo,
esperando.

### Arquivos

~~~text
index.ts            1280x720, Scale.FIT, scene: [BootScene, GameScene]
types.ts            Owner/Audience/DataKind, TargetCard, Wave, Mode
data/art.ts         folhas, frames e as caixas alfa MEDIDAS das quatro folhas
data/layout.ts      W/H, DEPTH, HUD, CARD, SLOT, BAND, BALL, BIN, PUBLIC_EYE
data/levels.ts      LEVELS (só o nível 1) e a pontuação
data/rules.ts       isSuspicious() + validateLevels() + shuffled()
scenes/BootScene    carrega as cinco folhas
scenes/GameScene    orquestra; não desenha nada
scenes/room         fundo, véu e a sombra do quadro de cortiça
scenes/cards        as placas: dono, dado, mensagem, destino, TRAVA e amassado
scenes/ball         a bolinha: surgir, arco determinístico, rastro, impacto
scenes/impact       as cópias transparentes viajando até o destino público
scenes/band         a faixa de dica e de impacto
scenes/hud          avatar VOCÊ, ondas, o comando e o `?`
scenes/audio        os sons em WebAudio
~~~

### As folhas vieram maiores, e o código mede em vez de supor

| Folha | §0 pedia | Veio | Célula usada |
|---|---|---|---|
| `bg-sala-de-alvos` | 1672 × 941 | 1672 × 941 | imagem |
| `bolinha-de-papel` | 1024 × 256 (4×1 de 256) | 1400 × 350 | 350 × 350 |
| `foto-usuario` | 256 × 256 | 500 × 500 | imagem |
| `destinos-da-rede` | 1024 × 512 (4×2 de 256) | 1200 × 600 | 300 × 300 |
| `dados-suspeitos` | 768 × 768 (3×3 de 256) | 900 × 900 | 300 × 300 |

Todas dividem certo, então o `load.spritesheet` bastou. O que NÃO bastou foi
assumir que o desenho ocupa a célula: as 8 + 9 + 4 caixas alfa estão medidas e
gravadas em `data/art.ts`, e é delas que sai o enquadramento — o pictograma do
dado, o ícone do destino e a bolinha são centrados pelo DESENHO, não pela
célula, senão cada um ficaria deslocado de um jeito diferente.

### Decisões que o planejamento deixou em aberto

| Onde | Plano | Feito | Motivo |
|---|---|---|---|
| cabeçalho | 0–140 | 92 px | o de 140 comia o quadro de cortiça, que é onde as placas moram |
| reciclagem | caixa em Graphics em (1090, 548) | a lixeira PINTADA no fundo, em (1118, 452) | o fundo já trouxe uma; desenhar outra por cima seria duas lixeiras |
| linha de permissão | 44 px na placa | não existe no N1 | no nível 1 todo dado é da própria criança; consentimento é assunto do N3 |
| prévia do impacto | cópias sobem até o público | cópias DESCEM e cruzam o chão vazio | subindo, elas passavam por cima da placa segura e atrapalhavam a leitura dela |
| resultado | painel próprio com selo e REVER IMPACTOS | `showLevelComplete` com o selo no título | é o padrão do catálogo; rever impactos volta quando o painel próprio existir |

A frase-síntese do §20 virou a mensagem do painel, inteira.

### Erro, vidas e pontos

Como o §15 e o §17 mandam: acertar placa segura é **erro conceitual** — a
bolinha bate e cai, a placa balança e ganha cadeado âmbar, a dica explica por
que aquele compartilhamento é adequado, sai `WRONG_ANSWER` e cai uma vida. A
onda NÃO avança; a criança responde de novo na mesma onda, e a partir do
segundo erro a placa suspeita pulsa. Acertar de primeira vale 10; depois da
TRAVA, 5.

Uma vida por ONDA, não por toque: o `stalled` garante que errar duas vezes na
mesma onda não custa duas vidas.

`validateLevels()` roda no `create()` e escreve no console: três ondas, pelo
menos duas placas, **exatamente uma suspeita por onda**, ids distintos, limites
de 66/24/82 caracteres, frame existente para cada dado e consentimento
declarado em todo dado de colega.

### O que falta

1. `cover-ache-o-suspeito.png` — o catálogo usa a sala vazia como capa
   provisória, e a entrada está em `status: "draft"`.
2. Níveis 2 e 3: a terceira placa, o movimento horizontal e o vertical (com o
   respeito ao modo de movimento reduzido do §9) e os dados dos colegas.
3. Teste com criança e no celular.

---

## 29. A mecânica de arremesso (12/09/2026)

O jogo entregue em 11/09 era: leia dois cartões, toque no suspeito, a bolinha
voa sozinha. O toque continuava sendo o único gesto, e o §8 dizia isso de
propósito. Esta revisão mantém aquele caminho e acrescenta um **gesto de
verdade** por cima dele, a pedido do usuário.

### O que mudou

| Antes | Agora |
|---|---|
| cartões de papel parados | **placas de madeira penduradas** por dois fios, balançando |
| chip `MEU` em cada cartão | nada no nível 1; fita `DE UM COLEGA` só quando o dado é de outra pessoa |
| bolinha nascia a cada tiro | bolinha **mora numa bandeja** e é puxada de lá |
| só toque | **puxar e soltar**, com linha de mira, ou o toque de sempre |
| acerto: cópias transparentes viajando até um ícone de desconhecidos | acerto: **os fios arrebentam e a placa cai**, quica e assenta; o dado escapa e volta para o avatar |

### A mira trava, e é isso que salva a habilidade

O ângulo do arrasto não vira a direção do tiro: ele **escolhe uma placa**, e a
bolinha vai ao centro exato dela. A tolerância é de 55°, sempre pela menor
diferença angular.

Sem a trava, o jogo passaria a medir pontaria. Uma criança que leu as duas
placas, entendeu qual era a suspeita e mirou torto perderia uma vida pelo
pulso — e a EF03CO09 não fala de pulso. O §9 já dizia que a dificuldade é
conceitual; a trava é o que mantém isso de pé agora que existe um gesto físico.

Puxar para os lados ou para baixo não mira em nada e vira **arremesso de
treino**: a bolinha voa, bate no chão e volta. Não emite nada, não gasta vida,
não conta tentativa. O gesto ficou incompleto, não a leitura.

### A ordem da comemoração é o conteúdo

Deitada no chão, a placa derrubada ocupa exatamente a faixa da tela onde a dica
aparece. Por isso a sequência é: cai → quica → **some** → frase + resgate do
dado. Se a frase entrasse antes, a explicação do impacto nasceria atrás de uma
placa de madeira.

A frase agora fica na tela cerca de 3,5 s, contra 2,2 s da versão anterior — ela
é o ponto pedagógico do jogo e nove palavras não se leem em dois segundos.

### Por que as cópias transparentes saíram

Elas mostravam o que **não** aconteceu: cópias do dado escapando para
desconhecidos, logo depois de a criança ter impedido a saída. Pedia uma leitura
invertida. No lugar entrou o pictograma escapando da placa caída e voltando
para o avatar do cabeçalho — o dado que ia embora continua sendo seu.

### Arquivos

~~~text
scenes/arc.ts       a curva do arremesso, compartilhada pela mira e pelo voo
scenes/aim.ts       puxar, soltar, travar alvo, desenhar trajetória e bandeja
scenes/signs.ts     as placas penduradas (era cards.ts); balanço, queda, quique
scenes/rescue.ts    o dado voltando para o avatar (era impact.ts)
scenes/ball.ts      reescrito: a bolinha vive na bandeja e é puxada
~~~

`cards.ts` e `impact.ts` foram removidos.

### O container mora no pivô

`root` fica onde os fios prendem; `hang` é o corpo, pendurado abaixo. Assim
`root.angle` balança em torno do prego e `hang.angle` gira em torno do próprio
centro na queda. Duas rotações independentes, nenhum tween gêmeo — e, como a
placa se move o tempo todo, a zona de toque vai DENTRO do container.

### O que falta

1. As duas folhas pedidas no §7 do TEXTURAS.md: `placa-de-madeira.png` e
   `bandeja-de-papeis.png`. As duas peças estão em `Graphics` de reserva, que
   roda mas não é entrega.
2. `cover-ache-o-suspeito.png` — o catálogo ainda usa a sala vazia, e a entrada
   segue em `status: "draft"`.
3. Níveis 2 e 3. O `endLevel` já tem o ramo de `autoAdvance` esperando, e
   `SIGN_BY_COUNT` já sabe posicionar três placas dentro do quadro da parede.
4. Teste com criança. Em retrato de celular a página `/jogos/<slug>` estica o
   palco; em paisagem está correto. Isso é da camada de embed, não do jogo.

---

## 30. O arrasto saiu; entraram `<`, `>` e JOGAR (12/09/2026)

O puxa-e-solta do §29 durou poucas horas. O usuário testou e disse o essencial:
**arrastar é difícil**. Está certo, e o motivo tem nome.

Puxar e soltar exige três coisas ao mesmo tempo: segurar sem escorregar, medir
a distância do arrasto e largar no instante certo. São três habilidades motoras
para responder uma pergunta de leitura, e a mão de 8 anos falha em qualquer uma
delas sem ter errado nada do que a EF03CO09 pede. Em tela de celular, com o
dedo por cima justamente do que precisa ser lido, é pior.

### O que existe agora

Uma barra fixa na base, três botões grandes:

| Botão | Tamanho do alvo | O que faz |
|---|---|---|
| `<` | 96 px de diâmetro | anda uma placa para a esquerda |
| **JOGAR** | 250 × 66 | arremessa na placa escolhida |
| `>` | 96 px de diâmetro | anda uma placa para a direita |

A placa escolhida acende e uma linha pontilhada sai da bandeja em direção a
ela. Tocar numa placa também a escolhe, como atalho para as setas. Setas do
teclado e barra de espaço fazem o mesmo, para quem joga no computador.

### Decisões que vieram junto

- **A volta é circular.** `>` na última placa volta para a primeira. Seta que
  desliga na ponta parece defeito para quem não conta os itens, e a criança
  fica batendo num botão morto achando que travou.
- **A primeira placa já vem escolhida.** Ninguém precisa de um passo extra só
  para poder jogar, e como a ordem é sorteada a cada onda, começar na primeira
  não entrega resposta nenhuma.
- **Tocar na placa escolhe, não lança.** Antes o toque disparava direto. Com a
  barra na tela, dois gestos fazendo coisas diferentes com a mesma peça
  confundem: o modelo agora é um só, "escolho e depois jogo".
- **A força deixou de existir.** Sem puxada não há o que medir: todo arremesso
  sai com o mesmo arco. Isso também elimina o arremesso de treino do §29, que
  só fazia sentido quando dava para mirar no vazio.
- **A linha pontilhada para antes da placa.** Os últimos pontos caíam em cima
  da frase, e a linha que existe para ajudar a escolher atrapalhava a leitura
  de que a escolha depende. Quem marca o alvo é o anel da placa.

### O que continua igual

A trava de alvo do §29 continua valendo, agora por construção: não há como
mirar torto, porque não há mira. Errar segue sendo erro conceitual, com dica,
cadeado, vida e a onda parada no lugar.

### Geometria que mudou por causa da barra

A barra ocupa a faixa de 624 a 720. Para caber, a placa encurtou de 268 para
244 px de corpo, o chão da queda subiu para 530 e a faixa de dica desceu para
492. A conta que governa isso: a base da placa (425) tem de ficar acima do topo
da faixa de dica mesmo quando ela cresce para duas linhas (440).

---

## 31. Mira de verdade, e os controles em dois cantos (12/09/2026)

Terceira volta na mesma mecânica, e desta vez o pedido veio com o motivo
junto: *"inves ele ja selecionar quem vai atirar, ele ter uma mira real, onde o
jogador vai movimentando. pq em proximos niveis irei adicionar mecanica das
placas se movendo. entao mira assim é essencial."*

O motivo está certo e derruba a solução anterior. Selecionar uma PLACA trava o
tiro nela; no dia em que as placas andarem, a bolinha perseguiria a peça e o
movimento viraria enfeite — o acerto não teria nada a ver com o instante do
arremesso.

### O que existe agora

- **`<` e `>` juntas no canto esquerdo**, movendo um retículo pela parede.
- **Botão redondo de 136 px no canto direito**, que arremessa.
- É a divisão do controle de videogame: polegar esquerdo move, direito age. No
  celular deitado cada mão fica no seu canto, e nada do que precisa ser lido
  fica debaixo dos dedos.
- Um toque anda 34 px; **segurar passa a deslizar** a 400 px/s depois de 260 ms.
  Atravessar a parede com trinta toquinhos cansa antes de ensinar nada.

### A colisão é perguntada quadro a quadro

Esta é a mudança que importa, e ela mora no `travel` de `ball.ts`: a cada
quadro do voo a bolinha pergunta a `signs.hitAt(x, y)` se há uma placa naquele
ponto. A primeira que responder é a resposta.

Testado nos dois sentidos, movendo uma placa na mão durante o voo:

| Situação | Resultado |
|---|---|
| a placa mirada foge no meio do voo | a bolinha passa reto, e não custa nada |
| uma placa entra no caminho no meio do voo | a bolinha acerta essa placa |

É por isso que o nível 2 não vai precisar de código novo de acerto: basta as
placas começarem a andar.

### O que segura a justiça agora que a pontaria é real

1. **O retículo avisa.** Sobre uma placa ele fecha e fica ciano; no vazio, abre
   e fica cinza. A linha pontilhada muda de cor junto. Sem esse aviso a mira
   viraria adivinhação.
2. **Errar o alvo não é errar a resposta.** A bolinha atravessa, cai, volta
   para a bandeja. Nada é emitido, nenhuma vida cai, a tentativa não conta e a
   onda não anda. A EF03CO09 pergunta qual compartilhamento é arriscado, não se
   a criança tem mira boa.
3. **Tocar na placa leva a mira até ela**, como atalho. Não anula nada: com
   placas em movimento, apontar para onde a placa estava não garante acerto.

### A mira é desenhada mesmo quando não aceita toque

`setEnabled` cuida dos botões; `setSight` cuida do desenho. O passo do tutorial
que diz "as setas movem a mira" apaga os botões, e apagar a mira junto deixaria
a criança lendo sobre uma coisa que não está na tela. Ela some mesmo é durante
o voo, quando quem importa é a bolinha.

### Para o nível 2 e o nível 3

- O movimento horizontal do §9 entra mexendo em `signs.ts` apenas. O acerto já
  está resolvido.
- O movimento VERTICAL do nível 3 vai precisar de `AIM.y` deixar de ser fixo —
  hoje ele é o centro das placas paradas. Ou a mira ganha controle vertical, ou
  a criança espera a placa cruzar a altura da mira. A segunda opção é mais
  simples e já funciona com o código atual.

---

## 32. Os três níveis de pé (12/09/2026)

Botões maiores, o rótulo `JOGAR` trocado pelo desenho de uma mira, e os níveis
2 e 3 escritos e jogáveis. O jogo deixou de ser um corte de nível 1.

### Controles

| Peça | Antes | Agora |
|---|---:|---:|
| setas | 96 px | **116 px** |
| botão de arremesso | 136 px, escrito `JOGAR` | **164 px, com o símbolo da mira** |

O rótulo escrito saiu porque é uma palavra a mais para ler numa tela que já
pede leitura em toda placa. O botão passou a mostrar o MESMO símbolo que está
na parede, e quem ainda não lê liga um ao outro pelo desenho.

O curso da mira também cresceu, de 196–1084 para 130–1150: no carrossel havia
placas à vista e fora de alcance, e a criança batia na seta contra um limite
invisível enquanto o alvo desfilava do outro lado.

### Nível 2 — o destino decide o risco

Três placas, dado sempre da própria criança. Duas ondas de **vaivém em bloco** e
a terceira em **carrossel**, onde a placa sai por uma borda e volta pela outra.

O vaivém é em bloco porque as três placas dividem 866 px de quadro: com fases
diferentes elas entrariam uma na outra.

### Nível 3 — permissão, e a placa vem tapada

Três placas em carrossel, todas cobertas. **Acertar uma placa coberta REVELA e
não julga**: não emite nada, não tira vida, não conta tentativa. Só depois de
aberta a placa pode ser acusada.

Foi assim que a camuflagem virou investigação em vez de chute. Se o primeiro
arremesso já valesse como acusação, o nível estaria premiando adivinhação —
justamente o hábito que a EF03CO09 quer desmontar. Do jeito que ficou, a criança
abre quantas quiser antes de decidir, e o que o nível cobra é ter LIDO antes de
acusar.

O conteúdo é o do §12: foto do Téo sem permissão, apelido que a Bia não gosta,
endereço do colega para um desconhecido. O que separa a suspeita das seguras
deixou de ser o destino e passou a ser o consentimento.

### Dois defeitos que o teste pegou, e as contas que os resolveram

**1. A bolinha batia numa placa no meio do caminho.** O arco era alto
(`210 − power·118`), então ela entrava na faixa das placas ainda no meio do
percurso: mirando na placa da ponta, acertava a do meio. A mira prometia um
alvo e o jogo entregava outro. O arco virou `74 − power·30`, quase a reta que a
linha pontilhada desenha. Seis tiros mirados no centro de placas seguras, com
tudo em movimento: zero desvios.

**2. A placa podia derivar para a vizinha durante o voo.** Entre o arremesso e o
impacto passam ~0,58 s, e a parede anda nesse tempo. A conta que mantém isso
seguro, e que precisa ser refeita se algum destes números mudar:

~~~text
deriva = 2·π·swayAmp / (swayMs/1000) · 0,58  ≈  26 px
vão    = espaçamento (300) − placa com moldura (266)  =  34 px
~~~

Para fechar essa margem o período subiu de 5,2 s para 8 s e a placa estreitou de
245 para 232. No carrossel o risco não existe: lá as placas ficam a 520 px uma
da outra.

### Texto cortado nas placas estreitas

Com três placas, a frase era centrada verticalmente e crescia para os dois
lados, entrando na tira de destino. Agora ela é ancorada pelo TOPO, com o
pictograma acima e a tira embaixo, cada um com o seu espaço.

### O que falta

1. As duas folhas do §7 do TEXTURAS.md. A placa coberta do nível 3 também está
   em `Graphics`, e entra na mesma conversa.
2. Tirar o `status: "draft"` do catálogo. A capa chegou em 14/09/2026 e o
   import já aponta para ela; o que segura a publicação são as folhas do item 1.
3. Teste com criança, principalmente no nível 3: é o único que pede duas
   decisões seguidas (abrir e acusar).
