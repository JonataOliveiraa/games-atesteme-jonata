# Fase de Entrada e Saída — EF03CO06

Documento irmão: [TEXTURAS.md](./TEXTURAS.md)

**Versão revisada: bancada de conexões com objetos do cotidiano.**

A criança ajuda Lia a fazer uma informação sair do mundo, entrar no computador
por um aparelho de entrada e voltar ao mundo por um aparelho de saída. Em cada
desafio, uma das duas conexões já está pronta; a criança toca em um entre dois
aparelhos conhecidos para completar ou consertar o caminho.

A revisão elimina duas imagens difíceis de reconhecer:

- o gabinete metálico genérico dá lugar a um computador central com silhueta
  explícita de torre de desktop, visor de rosto, botão de energia e o rótulo
  permanente **COMPUTADOR** feito pelo código;
- a caixinha de manivela deixa de existir; a própria personagem fala, mostra
  um desenho ou pede para digitar, tornando a origem da informação evidente.

---

## 1. Habilidade BNCC

> (EF03CO06) Reconhecer que, para um computador realizar tarefas, ele se comunica com o mundo exterior com o uso de interfaces físicas (dispositivos de entrada e saída).

Objeto: **Interface física**.

> Exemplificar os diferentes tipos de dispositivos de entrada (teclado, mouse, microfone, sensores, antena etc.) e de dispositivos de saída (monitor, alto-falante, impressora etc.)

O texto oficial permanece sem alteração. O jogo trabalha exemplos familiares
e visualmente distintos:

| Entrada | O que leva ao computador |
|---|---|
| teclado | letras digitadas |
| mouse | movimento e clique |
| microfone | som da voz |
| câmera | imagem de um desenho |

| Saída | O que leva do computador ao mundo |
|---|---|
| monitor | imagem ou texto na tela |
| alto-falante | som que pode ser ouvido |
| impressora | imagem ou texto no papel |

Sensores e antenas pertencem ao exemplo oficial, mas não entram nesta primeira
produção. Acrescentá-los agora aumentaria o vocabulário visual sem melhorar a
evidência central da habilidade.

---

## 2. O jogo em uma frase

**Veja o pedido de Lia e toque no aparelho que completa o caminho
ENTRADA → COMPUTADOR → SAÍDA.**

---

## 3. Por que a mecânica evidencia a habilidade

A criança não separa cartões em duas caixas e não responde apenas a uma
pergunta escrita. Ela vê uma pequena ação acontecer no mundo:

1. Lia fala, mostra uma imagem, digita ou aponta;
2. um aparelho físico leva essa informação ao computador;
3. o computador processa por um instante;
4. outro aparelho físico devolve o resultado ao mundo;
5. o resultado concreto confirma por que aquele aparelho serve.

O fluxo permanece escrito e visível durante toda a partida:

**MUNDO → ENTRADA → COMPUTADOR → SAÍDA → MUNDO**

A direção também aparece nos cabos: pulsos azuis entram no computador e pulsos
laranja saem dele. Cor ajuda a acompanhar o movimento, mas não entrega a
resposta. Teclado, mouse, microfone, câmera, monitor, alto-falante e impressora
mantêm cores materiais semelhantes.

### Teste da bolinha

Se os aparelhos forem trocados por círculos coloridos, o jogo perde o sentido.
A solução depende da função física reconhecível de cada objeto e do efeito
observado — falar no microfone, ver no monitor, ouvir no alto-falante ou receber
papel da impressora.

### Regra de honestidade

O jogo representa um kit escolar simplificado:

- a câmera representa captura de imagem;
- o microfone representa captura de som;
- o teclado representa entrada de texto;
- o mouse representa movimento e clique;
- o monitor representa saída visual;
- o alto-falante representa saída sonora;
- a impressora representa saída em papel.

Não afirmar que aparelhos reais nunca combinam funções. O balão inicial diz:
**“Neste kit, cada aparelho vai mostrar uma função.”**

---

## 4. Gênero e escopo

Gênero: **quebra-cabeça de conexão em uma bancada**, com sensação leve de
escape room. A porta à direita tem três fechos; cada desafio resolvido abre um.
Ela é apenas a recompensa de progresso, não um dispositivo de saída.

| Fazer | Limite |
|---|---|
| uma sala | câmera fixa, tela única |
| uma bancada | mesma composição em todos os desafios |
| um fluxo | entrada à esquerda, computador no centro, saída à direita |
| uma decisão | tocar em uma entre duas opções |
| sete aparelhos | quatro entradas e três saídas |
| um lado editável | o outro já está correto e protegido |
| três desafios por nível | nove planejados |
| primeiro corte | implementar e testar somente o nível 1 |
| animações curtas | tweens e Graphics, sem física |

Não há plataforma, auto-runner, inventário, encaixe por arraste, uso de webcam
ou microfone real, digitação real, impressão real ou permissão do navegador.

---

## 5. Laço de um desafio

~~~text
PEDIDO
→ Lia demonstra o que quer comunicar
→ a bancada destaca onde falta um aparelho
→ duas opções grandes aparecem

UM TOQUE
→ a criança toca em um aparelho
→ o aparelho entra automaticamente no encaixe
→ o fluxo é executado sem botão adicional

RESULTADO
→ a informação percorre entrada → computador → saída
→ o efeito físico aparece no monitor, alto-falante ou papel
→ se atende ao pedido, um fecho abre
→ se não atende, o fluxo para no ponto incompatível e entra em TRAVA

CONTINUAR
→ depois do acerto, próximo pedido
→ três fechos abertos encerram o nível
~~~

A remoção do antigo botão **USAR** é intencional. Ele criava duas decisões
para uma atividade que precisa de um gesto único. Agora escolher o aparelho já
é experimentar e responder.

---

## 6. Uma partida concreta do nível 1

### Desafio 1 — A voz de Lia

Pedido: **“Faça minha voz sair no alto-falante.”**

Lia aparece falando. O alto-falante já está conectado no lado SAÍDA. O encaixe
ENTRADA está vazio. As opções são **MICROFONE** e **CÂMERA**.

- Câmera: surge uma miniatura do rosto no computador, mas nenhum som chega ao
  alto-falante. O caminho para e a dica diz:
  **“A câmera levou uma imagem. Precisamos levar a voz.”**
- Microfone: ondas saem da boca de Lia, chegam ao microfone, atravessam o
  computador e reaparecem no alto-falante. Primeiro fecho aberto.

### Desafio 2 — O desenho de Lia

Pedido: **“Faça meu desenho aparecer na tela.”**

Lia segura um cartão com uma flor. O monitor já está conectado no lado SAÍDA.
As opções de ENTRADA são **CÂMERA** e **MICROFONE**.

- Microfone: nada visual é capturado. A dica diz:
  **“O microfone procura sons. O desenho é uma imagem.”**
- Câmera: o mesmo desenho aparece dentro do monitor. Segundo fecho aberto.

### Desafio 3 — Escrever o nome

Pedido: **“Faça a palavra LIA aparecer na tela.”**

O monitor continua como SAÍDA. As opções de ENTRADA são **TECLADO** e
**MOUSE**.

- Mouse: uma seta se move na tela, mas não aparecem letras.
- Teclado: três teclas afundam; o texto **LIA** aparece no monitor.
  Terceiro fecho aberto e porta aberta.

O texto LIA é desenhado por Phaser.Text, nunca incluído na textura.

---

## 7. Layout fixo — 1280 × 720

Usar Phaser.Scale.FIT. Conferir também em aproximadamente 390 × 219.

| Faixa | y | Conteúdo |
|---|---:|---|
| cabeçalho | 0–92 | título curto, vidas, progresso e ? |
| pedido | 92–190 | fala de Lia e pictograma do objetivo |
| fluxo | 190–520 | Lia, entrada, computador, saída e porta |
| escolhas | 520–720 | dois cartões de aparelho |

### Áreas principais

| Elemento | Caixa base |
|---|---|
| Lia / fonte no mundo | (24, 220, 180, 270) |
| encaixe ENTRADA | (225, 250, 210, 220) |
| computador central | (485, 225, 250, 265) |
| encaixe SAÍDA | (770, 250, 210, 220) |
| porta e três fechos | (1040, 205, 210, 300) |
| cartão A | (220, 545, 360, 150) |
| cartão B | (700, 545, 360, 150) |
| botão ? | (1132, 16, 132, 76) |

Acima de cada área, manter rótulos grandes feitos em código:

- **MUNDO**
- **ENTRADA**
- **COMPUTADOR**
- **SAÍDA**
- **MUNDO**

Setas grossas apontam sempre da esquerda para a direita. O rótulo não some
durante animações, dicas ou travas. A criança nunca precisa deduzir se o
computador está à esquerda ou à direita.

Os cartões têm no mínimo 360 × 150 no projeto base. O objeto ocupa a metade
esquerda do cartão; nome e frase curta ficam na metade direita. No celular,
cada alvo visível permanece maior que 96 × 40.

---

## 8. Controles

Um gesto: **toque**.

| Toque | Resultado |
|---|---|
| cartão de aparelho | conecta e executa o fluxo |
| aparelho correto durante TRAVA | conclui o desafio e destrava |
| aparelho incorreto durante TRAVA | repete o resultado causal; após 2 erros, a opção correta pulsa |
| ? | pausa e abre painel ilustrado |
| CONTINUAR no resultado | avança para o próximo desafio |

Não retirar cabo, arrastar plugue, mover personagem, apertar o computador ou
tocar diretamente na porta. O encaixe automático evita precisão fina.

Durante o fluxo, cartões ficam temporariamente inativos para impedir callbacks
duplicados. O ? continua funcional.

---

## 9. Progressão completa

### Nível 1 — O que entra

Uma SAÍDA correta já está conectada. A criança escolhe o aparelho de ENTRADA.

| ID | Pedido / fonte | Saída fixa | Opções de entrada | Resultado correto |
|---|---|---|---|---|
| 1.1 | voz de Lia | alto-falante | microfone / câmera | a voz é reproduzida |
| 1.2 | desenho de flor | monitor | câmera / microfone | a flor aparece |
| 1.3 | escrever LIA | monitor | teclado / mouse | LIA aparece |

Balões de apoio mostram **“Estamos escolhendo por onde a informação ENTRA.”**

### Nível 2 — O que sai

Uma ENTRADA correta já está conectada. A criança escolhe o aparelho de SAÍDA.

| ID | Pedido / entrada | Entrada fixa | Opções de saída | Resultado correto |
|---|---|---|---|---|
| 2.1 | mostrar o desenho | câmera | monitor / alto-falante | desenho na tela |
| 2.2 | ouvir a voz | microfone | alto-falante / monitor | voz reproduzida |
| 2.3 | levar a palavra no papel | teclado | impressora / monitor | folha com a palavra |

Balão: **“Agora escolhemos por onde a informação SAI.”**

### Nível 3 — Conserte o caminho

As duas pontas aparecem conectadas, mas uma não cumpre o pedido. O teste
inicial é automático e não custa vida. Duas peças de reposição aparecem.

| ID | Pedido | Montagem inicial | Lado editável | Reposição correta |
|---|---|---|---|---|
| 3.1 | ouvir a voz | microfone → monitor | saída | alto-falante |
| 3.2 | ver o desenho | microfone → monitor | entrada | câmera |
| 3.3 | levar LIA no papel | teclado → monitor | saída | impressora |

A progressão muda a leitura do problema, não o gesto. Não acrescentar terceiro
candidato, combinação livre ou encadeamento de duas respostas.

---

## 10. Modelo de dados e regra

Tudo que varia por desafio fica em `data/levels.ts`.

~~~ts
type DeviceId =
    | 'keyboard'
    | 'mouse'
    | 'microphone'
    | 'camera'
    | 'monitor'
    | 'speaker'
    | 'printer'

type Medium = 'typed-text' | 'pointer' | 'sound' | 'image'
type Carrier = 'screen' | 'audio' | 'paper'
type Side = 'input' | 'output'

interface Challenge {
    id: string
    prompt: string
    source: Medium
    editableSide: Side
    fixedDevice: DeviceId
    options: [DeviceId, DeviceId]
    initialDevice?: DeviceId
    goal: {
        medium: Medium
        carrier: Carrier
    }
}
~~~

Não guardar `correctDeviceId`. Os dispositivos expõem capacidades:

~~~ts
const INPUT_CAPABILITY = {
    keyboard: 'typed-text',
    mouse: 'pointer',
    microphone: 'sound',
    camera: 'image',
} as const

const OUTPUT_CAPABILITY = {
    monitor: ['typed-text', 'pointer', 'image'],
    speaker: ['sound'],
    printer: ['typed-text', 'image'],
} as const
~~~

A solução é calculada pelo meio capturado e pelo suporte solicitado. Assim,
monitor pode funcionar para mostrar texto e ainda ser inadequado quando o
pedido exige papel.

Validar na inicialização:

- exatamente três desafios por nível;
- exatamente duas opções distintas;
- as opções pertencem ao lado editável;
- uma única opção satisfaz a meta;
- o aparelho fixo pertence ao outro lado;
- `initialDevice`, quando existe, está entre as opções;
- nenhum texto de resposta depende da posição esquerda/direita.

---

## 11. Estados visuais do fluxo

| Estado | O que aparece |
|---|---|
| APRESENTAÇÃO | Lia demonstra a fonte; encaixe editável pulsa |
| ESCOLHA | dois cartões ativos; cabos neutros |
| CAPTURA | ação de Lia e aparelho de entrada ativo |
| PROCESSAMENTO | visor do computador anima por 0,5 s |
| SAÍDA | aparelho de saída produz tela, som ou papel |
| ACERTO | cadeia inteira acende; um fecho abre |
| TRAVA | pulso para exatamente onde o meio não atende; cadeado âmbar |
| CONCLUÍDO | porta abre; cartões desabilitados |

O computador não precisa “adivinhar” nada. Ele apenas recebe um tipo de
informação e o encaminha. A tela de rosto muda de expressão durante o processo,
mas não exibe a foto ou a palavra; isso pertence ao monitor.

### Resultados causais de erro

| Situação | Resultado e dica |
|---|---|
| câmera para uma tarefa de voz | miniatura visual chega; “Entrou uma imagem, não a voz.” |
| microfone para um desenho | sem imagem; “O microfone procura sons.” |
| mouse para escrever | cursor se move; “O mouse move e clica; precisamos de letras.” |
| monitor quando é preciso ouvir | onda silenciosa na tela; “A tela mostra; não faz o som sair.” |
| alto-falante quando é preciso ver | nenhum desenho; “O alto-falante faz som.” |
| monitor quando é preciso papel | palavra aparece na tela; “Funcionou na tela, mas o pedido é no papel.” |

Um aparelho incorreto não fica vermelho nem quebrado. Ele executa sua função
normal; apenas não atende à tarefa atual.

### O que só o nível 3 tem

O N1 e o N2 marcam o encaixe VAZIO — moldura tracejada com `?` pulsando. No N3
não há vazio: as duas pontas estão montadas e uma delas não serve. A marca,
então, cai sobre a PEÇA, e nunca como defeito:

| Sinal | O que é | Por que não é “quebrado” |
|---|---|---|
| peça acinzentada | tinta cinza-azulada e 88% de alpha | continua inteira e continua funcionando; só perde o destaque |
| halo âmbar | brilho arredondado atrás da peça, respirando | é a cor de TRAVA do jogo, a mesma do cadeado |
| inclinação de 3,5° | a peça “desencaixa” de leve | movimento, não avaria |
| cabo âmbar e parado | o ramo do problema troca de cor e as setas de fluxo somem | diz onde a informação não passa, sem palavra |

A troca também é diferente. No N1/N2 o encaixe está vazio e a peça só ENTRA
(`dock`). No N3 as duas peças se cruzam no ar (`swap`): a que não serve sai em
arco para o cartão enquanto a nova vem do cartão para a mesa. É o gesto de
TROCAR, e ele é o que o nível ensina.

O teste automático que abre o nível não custa vida, e a marca sobrevive a um
erro: se a criança trocar a ponta errada, a peça marcada volta marcada.

---

## 12. TRAVA, vidas e pontuação

A escolha incorreta é erro conceitual:

1. completar a demonstração causal;
2. pausar o avanço;
3. mostrar cadeado âmbar junto ao encaixe editável;
4. emitir `WRONG_ANSWER`;
5. chamar `lives.lose()`;
6. permitir somente nova escolha e ajuda;
7. após dois erros no desafio, fazer a alternativa correta pulsar;
8. destravar apenas quando a criança toca na opção correta.

Pontuação interna, sem números na tela:

- +10 no acerto de primeira;
- +5 após TRAVA;
- máximo 90 em nove desafios;
- estrelas em 90% e 70%.

No primeiro corte, o máximo local do nível 1 é 30, mas o registro do catálogo
usa a normalização compartilhada.

---

## 13. Tutorial

Exemplo animado e interativo, pulável:

1. Lia fala e o balão diz **“A voz está no mundo.”**
2. MICROFONE pulsa.
3. a criança toca no MICROFONE;
4. pulsos azuis percorrem **ENTRADA → COMPUTADOR**;
5. pulsos laranja chegam ao ALTO-FALANTE;
6. ondas aparecem e o balão conclui:
   **“O microfone fez a voz entrar. O alto-falante fez o som sair.”**

A primeira tela do painel ? repete a mesma composição. A segunda mostra os
quatro aparelhos de entrada; a terceira, os três de saída. Não usar áudio
narrado. O tutorial funciona no mudo.

---

## 14. Resultado

Após três desafios, abrir a porta e mostrar três cartões de fluxo resolvido.
Cada cartão contém:

- fonte no mundo;
- aparelho de entrada usado;
- computador central;
- aparelho de saída usado;
- resultado no mundo;
- setas e os termos ENTRADA e SAÍDA.

Frase-síntese:

**“O computador conversa com o mundo: a informação ENTRA por alguns aparelhos
e SAI por outros.”**

Usar `showLevelComplete`, estrelas compartilhadas e botão de repetir.

### Entre um nível e o outro não se lê nada

A tela de fim de nível deixou de ser um `showLevelComplete` com título. Entre
o N1 e o N2, e entre o N2 e o N3, entra o `showNextLevel` (`scenes/levelCard.ts`):
véu, um painel pequeno e as três bolinhas do percurso — a do nível recém-vencido
enche com um estalo e faíscas douradas. **Nenhuma palavra.**

O motivo é que ali não havia nada a dizer. "Muito bem!" é elogio, não
informação: quem venceu o nível já viu a cadeia acender, a Lia comemorar e o
confete cair. A bolinha que enche diz a única coisa nova — onde a criança está
na trilha — e diz isso de relance, sem depender de leitura. É a mesma escolha
da barra de tempo contra o mostrador `m:ss`.

O `showLevelComplete` continua no FIM do jogo, onde há decisão a tomar: ali as
palavras são dos botões ("Jogar de novo", "Escolher jogo"), e botão sem rótulo
seria adivinhação.

---

## 15. Arquitetura prevista

~~~text
fase-de-entrada-e-saida/
├── Game.ts
├── PLANEJAMENTO.md
├── TEXTURAS.md
├── data/
│   └── levels.ts
├── scenes/
│   ├── BootScene.ts
│   └── GameScene.ts
└── ui/
    ├── buildDeviceCard.ts
    ├── createFlowBoard.ts
    └── createHelpPanel.ts
~~~

Obrigatório:

- `phaser`;
- `loading`;
- `faseInicial`;
- `createLives`;
- `createTutorial`;
- `showLevelComplete`;
- `runtimeGameBridge`;
- FX compartilhados;
- Phaser.Text para nomes e instruções;
- fallback Graphics para toda textura ainda ausente.

Carregar imagens com `import.meta.glob` e ignorar `cover-` dentro do jogo.

---

## 16. Assets planejados

Somente seis arquivos:

1. `bg-laboratorio.png` — fundo limpo;
2. `personagem-lia.png` — estados reconhecíveis de Lia;
3. `computador-central.png` — torre de desktop amigável e inequívoca;
4. `dispositivos-entrada.png` — teclado, mouse, microfone e câmera;
5. `dispositivos-saida.png` — monitor, alto-falante e impressora;
6. `cover-fase-de-entrada-e-saida.png` — capa do catálogo.

Bancada, porta, cabos, setas, encaixes, desenhos, palavras, papel, ondas,
cartões e feedbacks continuam em Graphics/Text. A especificação completa está
em [TEXTURAS.md](./TEXTURAS.md).

---

## 17. Critérios de aceite

### Pedagógico

- [ ] a criança vê o caminho MUNDO → ENTRADA → COMPUTADOR → SAÍDA → MUNDO;
- [ ] entrada e saída são ações observáveis, não cores de categoria;
- [ ] os sete aparelhos têm funções familiares e exemplos concretos;
- [ ] o erro mostra o que o aparelho realmente fez;
- [ ] a porta é recompensa, não “saída do computador”;
- [ ] não há acesso a dispositivos reais.

### Interação

- [ ] um toque conclui a decisão;
- [ ] somente duas opções por desafio;
- [ ] nenhuma hitbox pequena de cabo ou soquete;
- [ ] TRAVA segue o padrão do catálogo;
- [ ] ? pausa e abre ajuda;
- [ ] o jogo continua compreensível sem som.

### Visual

- [ ] ENTRADA, COMPUTADOR e SAÍDA ficam escritos o tempo todo;
- [ ] o computador parece uma torre de desktop, não uma caixa industrial;
- [ ] não existe caixinha de música ou aparelho de manivela;
- [ ] entradas e saídas ficam em folhas de arte separadas;
- [ ] monitor, alto-falante e impressora são reconhecíveis em miniatura;
- [ ] nenhuma cor revela a resposta.

### Produção

- [ ] nível 1 é implementado e testado antes dos demais;
- [ ] todos os níveis futuros são somente dados;
- [ ] assets faltantes usam fallback;
- [ ] nenhum PNG contém texto;
- [ ] o usuário testa o fluxo real antes da expansão.

---

## 18. Decisões desta revisão

| Antes | Agora | Motivo |
|---|---|---|
| gabinete sem tela e sem identidade | torre de computador com rosto, energia e rótulo em código | reconhecimento imediato |
| fonte sonora por caixinha de manivela | Lia fala | ação cotidiana e óbvia |
| cinco aparelhos numa única folha | entradas e saídas em folhas separadas | planejamento e integração legíveis |
| conectar, observar e apertar USAR | tocar e ver o fluxo executar | gesto único, menos confusão |
| desenho e caixinha como fontes | voz, desenho, texto e ponteiro | cobre quatro entradas familiares |
| cinco periféricos | sete periféricos | inclui teclado e mouse do exemplo oficial |
| bancada sem fluxo textual completo | MUNDO → ENTRADA → COMPUTADOR → SAÍDA → MUNDO permanente | relação curricular visível |

As duas imagens geradas a partir da especificação anterior não devem ser
aproveitadas: elas documentam conceitos retirados deste planejamento.

---

## 19. O que mudou na construção

### Rodada 1 — nível 1 jogável (11/09/2026)

O critério que mandou nesta rodada foi a queixa mais recente sobre o
Bibliotecário: tela cheia demais, sem dizer onde tocar nem o que o toque faz.
Toda decisão abaixo tira alguma coisa da tela ou deixa o toque mais óbvio.

| Decisão | Por quê |
|---|---|
| **A informação vira uma bolha que viaja** | É o que liga os três aparelhos numa história só. A bolha sai da boca (ou do cartão) da Lia com o que ela quer comunicar, entra no aparelho escolhido, corre pelo cabo azul, some dentro do computador e sai pelo cabo laranja. O desenho dentro dela é a prova: a câmera troca a voz por uma foto, o microfone diante do desenho não captura nada e a bolha se desfaz ali mesmo. |
| **O erro mostra onde o caminho parou** | Câmera no pedido da voz: a foto chega ao alto-falante, bate e volta com um `?`. Microfone no pedido do desenho: nada entra. Mouse no pedido do nome: a seta anda na tela, mas não aparece letra. É o "resultado causal" do §11, e ele se entende sem ler a dica. |
| **A dica é montada pela regra, e não escrita por caso** | `explain()` junta o que o aparelho leva com o que o pedido precisa: *"A câmera leva imagens. Precisamos levar a voz."* Os níveis 2 e 3 herdam as frases sem texto novo por desafio. |
| **Vida e `WRONG_ANSWER` saem juntos, uma vez por desafio** | O primeiro erro custa uma vida e emite o evento; repetir o mesmo aparelho só repete a demonstração. Os dois nunca se separam, para a plataforma e o jogo contarem igual. |
| **O aparelho errado volta para o cartão** | O encaixe fica vazio de novo, com o cadeado âmbar e o plugue solto: está claro que falta ligar alguma coisa ali. No segundo erro, o cartão certo ganha contorno dourado. |
| **Sem porta e sem fechos** | A porta ocuparia o lado direito com um objeto que não faz parte do caminho e competiria com a saída — e em `Graphics` ela seria o móvel desenhado em código que já foi reprovado na Fuga do Laboratório. O progresso fica nas três bolinhas do topo. Se a porta voltar, precisa de textura. |
| **Sem rótulos MUNDO** | ENTRADA → COMPUTADOR → SAÍDA ficam escritos o tempo todo, em placas na frente da bancada, com setas entre elas. "Mundo" é a Lia de um lado e o efeito do outro; escrito, vira mais dois blocos de texto sem ação. |
| **Sem CONTINUAR** | O acerto segura a tela 1,5 s com o efeito à vista (a voz saindo, a flor na tela, LIA escrito) e avança sozinho. Um toque a mais não ensinaria nada. |
| **Sem o balão "Neste kit, cada aparelho vai mostrar uma função"** | Era mais uma frase antes do primeiro toque. |
| **O `?` repete o tutorial** | Como nos outros jogos da família, em vez de um painel de três telas. O tutorial tem três passos: o pedido, o encaixe vazio e os cartões. O último passo **não** tem dedo, para não apontar o cartão certo. |
| **Cartão com nome, sem frase** | "Leva a voz" no cartão transformaria a decisão em ligar palavra com palavra. O nome e o desenho do aparelho bastam. |
| **A resposta certa muda de lado** | Direita, esquerda, direita. Voz e desenho usam o mesmo par, câmera e microfone, nas mesmas posições, e a resposta troca. |

A bancada, os cabos, as placas e o encaixe são `Graphics`. A bancada é o único
móvel desenhado em código; ela ficou limpa, mas uma textura dela (com as três
placas lisas, sem texto) deixaria a cena mais inteira.

### As folhas chegaram em outro tamanho

A grade bateu com o contrato do `TEXTURAS.md`; só o lado da célula mudou, e
ele mora em `SHEET` (`data/devices.ts`):

| Folha | Chegou | Célula |
|---|---|---|
| `personagem-lia.png` | 1600 × 550 | 400 × 550 |
| `computador-central.png` | 1600 × 650 | 400 × 650 |
| `dispositivos-entrada.png` | 1400 × 700 | 350 × 350 |
| `dispositivos-saida.png` | 1050 × 700 | 350 × 350 |

A caixa alfa de cada quadro foi medida no arquivo. Neutro e ativo têm alturas
diferentes (o teclado ativo desce 12 px), então cada quadro é ancorado pela
própria base e pelo próprio centro, e a troca de quadro não pula. Também saíram
da medição a tela útil do monitor, o cone do alto-falante, as duas portas do
computador e a área branca do cartão da Lia, onde a flor é desenhada.

O fundo chegou como `bg-labolatorio.png` e foi renomeado para
`bg-laboratorio.png`, o nome do `TEXTURAS.md`.

A Lia saiu loira e de pele clara; o prompt pedia pele morena e cabelo cacheado
escuro. O jogo não depende disso, mas a folha não segue a especificação.

Falta a capa. O fundo do laboratório entrou provisório no catálogo, com
comentário no `catalog.ts`.

Verificado no navegador: os três desafios, os três erros causais (foto batendo
no alto-falante, microfone sem nada, seta sem letra), uma vida por desafio,
o segundo erro sem vida e com o contorno no cartão certo, a partida inteira
acertando de primeira (30 pontos, nenhum erro), o `?` e o `GAME_COMPLETED` com
`stage: 1` e `totalStages: 1`.

### Rodada 2 — balão, a informação sem disco, setas vivas e o nível 2 (11/09/2026)

O usuário aprovou o nível 1 e pediu três ajustes de acabamento.

| Pedido | O que virou |
|---|---|
| **Melhorar o balão da Lia** | A ponta fina e comprida, que saía da borda e terminava no ar, virou um rabinho curto, largo e curvo que nasce do próprio contorno do balão e encosta na cabeça dela. O balão chegou mais para a esquerda (começa logo acima da Lia), ficou em pílula, com sombra e um friso claro embaixo. |
| **A informação sem o disco branco** | A coisa viaja como ela mesma: a voz são ondas piscando com duas notinhas; o desenho, a folha com a flor; a foto, uma polaroide; as letras, três teclas L‑I‑A pulando; o mouse, a setinha com um anel de clique. Um rastro de pontinhos na cor do cabo (azul entrando, laranja saindo) substitui o anel colorido. A troca no aparelho ficou visível: a voz é engolida pela câmera e sai uma foto do outro lado. |
| **Setas animadas e mais transparentes** | A ponta branca parada no meio de cada cabo saiu. No lugar, três setinhas brancas translúcidas andam pelo cabo o tempo todo, no sentido da informação, somem nas pontas e aceleram e acendem quando a informação está passando. |

#### Nível 2 — O que sai

A ENTRADA vem ligada e a criança escolhe a SAÍDA. Os pedidos **não dizem o
aparelho** — no nível 1 eles podiam ("sair no alto-falante"), porque a saída
era fixa; aqui dizer "na tela" entregaria a resposta.

| Pedido | Entrada fixa | Opções | O erro mostra |
|---|---|---|---|
| Quero que todos vejam meu desenho. | câmera | alto-falante / **monitor** | o desenho bate no alto-falante e volta com `?` |
| Quero que todos ouçam minha voz. | microfone | **alto-falante** / monitor | a voz bate no monitor e volta com `?` |
| Quero levar meu nome no papel. | teclado | monitor / **impressora** | LIA aparece na tela, mas não no papel |

A resposta certa fica em direita, esquerda, direita. As dicas saem do mesmo
`explain()`: *"O alto-falante só faz som. Precisamos ver o desenho."*,
*"O monitor mostra na tela. Precisamos do nome no papel."*

A impressora ganhou efeito: a folha sai pela boca da frente (medida na arte, 80
px acima da base nos dois quadros), cresce para baixo e sobe acima da
impressora, com LIA escrito. O tutorial do nível 2 tem dois passos — o encaixe
de SAÍDA vazio e os cartões — e não repete "leia o pedido".

Cada nível fecha com a sua frase (`summary`): o 1 fala de levar a informação
para DENTRO, o 2 de levar para FORA. O catálogo subiu para 60 pontos.

Verificado no navegador: o balão novo, a voz saindo como ondas, a câmera
trocando a voz por uma foto no cabo, a foto e o desenho batendo no
alto-falante, a folha com LIA saindo da impressora, o nível 2 aberto direto por
`stage=2`, e o nível 1 passando ao 2 com a vida perdida e os pontos atravessando
o `scene.restart`. Eventos do nível 2: um `WRONG_ANSWER` por desafio errado e
`GAME_COMPLETED` com `stage: 2` e `totalStages: 2`.
