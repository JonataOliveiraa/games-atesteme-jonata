import type { FieldId, LicenseId, MediaItem, MediaKind, SealId } from '../types'

export const FIELDS: Array<{ id: FieldId; prefix: string; question: string }> = [
  { id: 'autor', prefix: 'Autor:', question: 'Quem fez esta mídia?' },
  { id: 'fonte', prefix: 'Veio de:', question: 'De onde ela veio?' },
  { id: 'uso', prefix: 'Uso:', question: 'O que você pode fazer com ela?' },
]

export const LICENSE_LABEL: Record<LicenseId, string> = {
  livreComCredito: 'Livre para usar, com crédito',
  usoEscolar: 'Apenas para trabalho escolar',
  reservado: 'Todos os direitos reservados',
  autoral: 'Feito por você',
}

export const KIND_LABEL: Record<MediaKind, string> = {
  imagem: 'IMAGEM',
  audio: 'ÁUDIO',
  video: 'VÍDEO',
  quadrinho: 'QUADRINHO',
}

export const SEAL_LABEL: Record<SealId, string> = {
  verde: 'PODE USAR',
  amarelo: 'REVISE',
  vermelho: 'NÃO PODE',
}

export const MEDIA: Record<string, MediaItem> = {
  natureza: {
    id: 'natureza',
    thumb: 'thumb-foto-natureza',
    kind: 'imagem',
    title: 'Foto de cachoeira na mata',
    license: 'livreComCredito',
    origin: 'Baixada do banco de imagens Livrepix',
    greenNote: 'A foto é livre, mas o nome de quem fotografou precisa aparecer junto.',
    options: {
      autor: [
        { label: 'Ana Prado, fotógrafa', chip: 'Ana Prado', seal: 'verde', why: 'O nome estava na página da foto: é esse o crédito certo.' },
        { label: 'Não achei o autor', chip: 'Autor desconhecido', seal: 'vermelho', why: 'O nome estava na página da foto. Vale procurar antes de dizer que não tem.' },
        { label: 'Eu mesmo', chip: 'Eu mesmo', seal: 'vermelho', why: 'A foto não é sua. Assinar como sua tira o crédito de quem fez.' },
      ],
      fonte: [
        { label: 'Banco de imagens Livrepix', chip: 'Livrepix', seal: 'verde', why: 'Dizer o site de onde veio permite que qualquer um confira.' },
        { label: 'Achei na internet', chip: 'Internet', seal: 'vermelho', why: '"Achei na internet" não é fonte: ninguém volta até o original.' },
        { label: 'Um amigo me mandou', chip: 'Um amigo', seal: 'amarelo', why: 'Quem mandou não é a origem. A fonte é onde a foto foi publicada.' },
      ],
      uso: [
        { label: 'Usar no trabalho da escola, com crédito', chip: 'Escola, com crédito', seal: 'verde', why: 'A licença permite usar em qualquer lugar, desde que o crédito apareça.' },
        { label: 'Publicar na galeria da turma, com crédito', chip: 'Galeria, com crédito', seal: 'verde', why: 'A licença permite publicar, contanto que o crédito vá junto.' },
        { label: 'Usar sem escrever o crédito', chip: 'Sem crédito', seal: 'vermelho', why: 'Essa licença só vale se o nome do autor aparecer.' },
      ],
    },
  },
  robo: {
    id: 'robo',
    thumb: 'thumb-ilustracao-robo',
    kind: 'imagem',
    title: 'Desenho do robô ajudante',
    license: 'autoral',
    origin: 'Desenhado por você na aula de arte',
    greenNote: 'Quando a mídia é sua, você é o autor e decide como ela será usada.',
    options: {
      autor: [
        { label: 'Eu mesmo', chip: 'Eu mesmo', seal: 'verde', why: 'Você desenhou, então você é o autor e assina a obra.' },
        { label: 'Não achei o autor', chip: 'Autor desconhecido', seal: 'vermelho', why: 'O autor é você. Deixar em branco apaga o seu próprio crédito.' },
        { label: 'Um site de desenhos', chip: 'Site de desenhos', seal: 'vermelho', why: 'Dar o crédito a outro é errado, mesmo quando você se prejudica.' },
      ],
      fonte: [
        { label: 'Meu caderno da aula de arte', chip: 'Meu caderno', seal: 'verde', why: 'A fonte é onde a obra nasceu: o seu próprio caderno.' },
        { label: 'Achei na internet', chip: 'Internet', seal: 'vermelho', why: 'O desenho não veio da internet. A informação precisa ser verdadeira.' },
        { label: 'Não sei dizer', chip: 'Não sei', seal: 'amarelo', why: 'Você sabe: foi feito por você na aula. Vale registrar isso.' },
      ],
      uso: [
        { label: 'Publicar na galeria da turma', chip: 'Publicar na galeria', seal: 'verde', why: 'A obra é sua, então você pode publicar como quiser.' },
        { label: 'Usar no trabalho da escola', chip: 'Usar na escola', seal: 'verde', why: 'A obra é sua e pode ser usada livremente por você.' },
        { label: 'Pedir permissão antes', chip: 'Pedir permissão', seal: 'amarelo', why: 'Não precisa pedir permissão para usar o que você mesmo criou.' },
      ],
    },
  },
  trilha: {
    id: 'trilha',
    thumb: 'thumb-musica-trilha',
    kind: 'audio',
    title: 'Trilha sonora "Passos na chuva"',
    license: 'livreComCredito',
    origin: 'Baixada do acervo Som Aberto',
    greenNote: 'Música também tem autor. O crédito do som vale igual ao da imagem.',
    options: {
      autor: [
        { label: 'Grupo Som Aberto', chip: 'Grupo Som Aberto', seal: 'verde', why: 'O grupo que compôs está na página da faixa: esse é o crédito.' },
        { label: 'Não achei o autor', chip: 'Autor desconhecido', seal: 'vermelho', why: 'O nome do grupo estava na página. Música também tem quem a criou.' },
        { label: 'Eu mesmo', chip: 'Eu mesmo', seal: 'vermelho', why: 'A trilha não é sua. Assinar como sua toma o crédito de outra pessoa.' },
      ],
      fonte: [
        { label: 'Acervo Som Aberto', chip: 'Som Aberto', seal: 'verde', why: 'É o site oficial de onde a faixa foi baixada.' },
        { label: 'Vídeo que eu vi ontem', chip: 'Um vídeo', seal: 'vermelho', why: 'Ouvir em um vídeo não diz de onde a música veio de verdade.' },
        { label: 'Achei na internet', chip: 'Internet', seal: 'vermelho', why: 'Sem o nome do acervo, ninguém consegue conferir a licença.' },
      ],
      uso: [
        { label: 'Usar de fundo, citando o grupo', chip: 'Fundo, com crédito', seal: 'verde', why: 'A licença libera o uso desde que o grupo seja citado.' },
        { label: 'Usar sem citar o grupo', chip: 'Sem crédito', seal: 'vermelho', why: 'Essa licença exige o crédito. Sem ele, o uso não vale.' },
        { label: 'Dizer que a música é minha', chip: 'Dizer que é minha', seal: 'vermelho', why: 'Isso é tomar para si a obra de outra pessoa.' },
      ],
    },
  },
  semAutor: {
    id: 'semAutor',
    thumb: 'thumb-foto-sem-autor',
    kind: 'imagem',
    title: 'Foto encontrada em um grupo',
    license: 'reservado',
    origin: 'Chegou encaminhada, sem nenhuma informação',
    greenNote: 'Quando não dá para saber quem fez nem de onde veio, o mais seguro é não usar.',
    options: {
      autor: [
        { label: 'Não foi possível identificar', chip: 'Não identificado', seal: 'amarelo', why: 'Registrar que o autor é desconhecido é honesto, mas não libera o uso.' },
        { label: 'Eu mesmo', chip: 'Eu mesmo', seal: 'vermelho', why: 'A foto não é sua. Isso seria assinar o trabalho de outra pessoa.' },
        { label: 'Autor desconhecido da internet', chip: 'Alguém da internet', seal: 'amarelo', why: 'Continua sem identificar ninguém: o crédito segue vazio.' },
      ],
      fonte: [
        { label: 'Mensagem encaminhada', chip: 'Mensagem encaminhada', seal: 'amarelo', why: 'É a verdade, mas não permite chegar até o original.' },
        { label: 'Banco de imagens', chip: 'Banco de imagens', seal: 'vermelho', why: 'Não veio de banco de imagens. Inventar a fonte é pior que não ter.' },
        { label: 'Achei na internet', chip: 'Internet', seal: 'vermelho', why: 'Não indica lugar nenhum: é o mesmo que não dar fonte.' },
      ],
      uso: [
        { label: 'Não usar esta foto', chip: 'Não usar', seal: 'verde', why: 'Sem autor e sem fonte, deixar de fora é a escolha correta.' },
        { label: 'Publicar na galeria da turma', chip: 'Publicar na galeria', seal: 'vermelho', why: 'Publicar sem autoria pode usar a obra de alguém sem permissão.' },
        { label: 'Usar só no trabalho da escola', chip: 'Só na escola', seal: 'amarelo', why: 'Mesmo na escola, usar sem saber a origem continua arriscado.' },
      ],
    },
  },
  famoso: {
    id: 'famoso',
    thumb: 'thumb-personagem-famoso-alerta',
    kind: 'imagem',
    title: 'Mascote de uma marca conhecida',
    license: 'reservado',
    origin: 'Copiada do site oficial da marca',
    greenNote: 'Personagem de marca é protegido. Nem citar o autor libera publicar por conta própria.',
    options: {
      autor: [
        { label: 'Equipe da marca', chip: 'Equipe da marca', seal: 'verde', why: 'O personagem foi criado pela equipe da empresa: esse é o crédito real.' },
        { label: 'Eu mesmo', chip: 'Eu mesmo', seal: 'vermelho', why: 'Você não criou o personagem. Isso é tomar a obra da empresa.' },
        { label: 'Não achei o autor', chip: 'Autor desconhecido', seal: 'amarelo', why: 'O site oficial mostra de quem é. Dá para descobrir com uma olhada.' },
      ],
      fonte: [
        { label: 'Site oficial da marca', chip: 'Site da marca', seal: 'verde', why: 'É de onde a imagem foi copiada, e isso precisa ser dito.' },
        { label: 'Achei na internet', chip: 'Internet', seal: 'vermelho', why: 'Some com a origem e esconde que a imagem é protegida.' },
        { label: 'Desenhei olhando', chip: 'Desenhei olhando', seal: 'vermelho', why: 'Copiar o personagem de outra pessoa não torna o desenho seu.' },
      ],
      uso: [
        { label: 'Pedir permissão antes de usar', chip: 'Pedir permissão', seal: 'verde', why: 'Com todos os direitos reservados, só o dono pode liberar o uso.' },
        { label: 'Publicar na galeria da turma', chip: 'Publicar na galeria', seal: 'vermelho', why: 'Publicar sem permissão desrespeita os direitos da marca.' },
        { label: 'Usar e escrever o crédito', chip: 'Usar, com crédito', seal: 'amarelo', why: 'O crédito ajuda, mas nesta licença ele não substitui a permissão.' },
      ],
    },
  },
  videoEscolar: {
    id: 'videoEscolar',
    thumb: 'thumb-video-escolar',
    kind: 'video',
    title: 'Vídeo da apresentação da turma',
    license: 'usoEscolar',
    origin: 'Gravado pela professora Rita, na escola',
    greenNote: 'Uso escolar quer dizer dentro da escola. Publicar na internet precisa de outra autorização.',
    options: {
      autor: [
        { label: 'Professora Rita', chip: 'Professora Rita', seal: 'verde', why: 'Foi ela quem gravou: é dela o crédito da gravação.' },
        { label: 'A turma toda', chip: 'A turma toda', seal: 'amarelo', why: 'A turma aparece no vídeo, mas quem gravou foi a professora.' },
        { label: 'Não achei o autor', chip: 'Autor desconhecido', seal: 'vermelho', why: 'O autor é conhecido. Não registrar apaga o crédito de propósito.' },
      ],
      fonte: [
        { label: 'Arquivo da escola', chip: 'Arquivo da escola', seal: 'verde', why: 'O vídeo está guardado no arquivo da escola: é lá que ele vive.' },
        { label: 'Achei na internet', chip: 'Internet', seal: 'vermelho', why: 'O vídeo nunca foi publicado na internet. A informação seria falsa.' },
        { label: 'Celular de um colega', chip: 'Celular de um colega', seal: 'amarelo', why: 'Ter uma cópia não é a mesma coisa que ser a origem.' },
      ],
      uso: [
        { label: 'Mostrar no trabalho da escola', chip: 'Mostrar na escola', seal: 'verde', why: 'É exatamente o que a licença de uso escolar permite.' },
        { label: 'Publicar na galeria da turma', chip: 'Publicar na galeria', seal: 'amarelo', why: 'A galeria fica online. Aparecem crianças, então precisa de autorização.' },
        { label: 'Publicar em qualquer rede', chip: 'Publicar em tudo', seal: 'vermelho', why: 'Uso escolar não permite espalhar o vídeo fora da escola.' },
      ],
    },
  },
  espacial: {
    id: 'espacial',
    thumb: 'thumb-personagem-espacial',
    kind: 'imagem',
    title: 'Personagem astronauta Lumi',
    license: 'livreComCredito',
    origin: 'Baixado do acervo Traço Livre',
    greenNote: 'Personagem de acervo livre entra na galeria, sempre com o nome de quem o criou.',
    options: {
      autor: [
        { label: 'Bia Nogueira, ilustradora', chip: 'Bia Nogueira', seal: 'verde', why: 'O nome da ilustradora está no acervo: é esse o crédito.' },
        { label: 'Eu mesmo', chip: 'Eu mesmo', seal: 'vermelho', why: 'O personagem não é seu. Assinar como seu é tomar a obra dela.' },
        { label: 'Não achei o autor', chip: 'Autor desconhecido', seal: 'vermelho', why: 'O acervo mostra o nome. Bastava olhar a página do desenho.' },
      ],
      fonte: [
        { label: 'Acervo Traço Livre', chip: 'Traço Livre', seal: 'verde', why: 'É o site de onde o personagem foi baixado.' },
        { label: 'Achei na internet', chip: 'Internet', seal: 'vermelho', why: 'Sem o nome do acervo, ninguém confere a licença.' },
        { label: 'Um jogo que eu jogo', chip: 'Um jogo', seal: 'vermelho', why: 'O personagem não veio de jogo nenhum: a informação seria falsa.' },
      ],
      uso: [
        { label: 'Publicar na galeria, com crédito', chip: 'Galeria, com crédito', seal: 'verde', why: 'A licença permite publicar quando o crédito vai junto.' },
        { label: 'Publicar sem o crédito', chip: 'Sem crédito', seal: 'vermelho', why: 'Sem o nome da ilustradora, a licença deixa de valer.' },
        { label: 'Pedir permissão antes', chip: 'Pedir permissão', seal: 'amarelo', why: 'A licença já libera. Pedir de novo não é errado, mas não é preciso.' },
      ],
    },
  },
  floresta: {
    id: 'floresta',
    thumb: 'thumb-personagem-floresta',
    kind: 'imagem',
    title: 'Criatura da floresta Tuim',
    license: 'usoEscolar',
    origin: 'Recebido do projeto Floresta na Escola',
    greenNote: 'Esta criatura foi liberada só para atividades escolares, não para a galeria pública.',
    options: {
      autor: [
        { label: 'Projeto Floresta na Escola', chip: 'Projeto Floresta', seal: 'verde', why: 'O projeto criou e distribuiu o personagem para as turmas.' },
        { label: 'Eu mesmo', chip: 'Eu mesmo', seal: 'vermelho', why: 'Você recebeu pronto. O crédito é de quem criou.' },
        { label: 'Não achei o autor', chip: 'Autor desconhecido', seal: 'vermelho', why: 'O nome do projeto veio junto com o arquivo.' },
      ],
      fonte: [
        { label: 'Material do projeto na escola', chip: 'Material do projeto', seal: 'verde', why: 'É de onde o arquivo saiu e permite conferir a permissão.' },
        { label: 'Achei na internet', chip: 'Internet', seal: 'vermelho', why: 'Não veio da internet: a informação seria falsa.' },
        { label: 'Não sei dizer', chip: 'Não sei', seal: 'amarelo', why: 'Você sabe: chegou pelo projeto. Vale registrar isso.' },
      ],
      uso: [
        { label: 'Usar no trabalho da escola', chip: 'Usar na escola', seal: 'verde', why: 'É exatamente o que a permissão do projeto autoriza.' },
        { label: 'Publicar na galeria da turma', chip: 'Publicar na galeria', seal: 'vermelho', why: 'A permissão é só para atividades escolares, não para publicar.' },
        { label: 'Pedir permissão para publicar', chip: 'Pedir permissão', seal: 'amarelo', why: 'Pedir é o caminho certo, mas hoje a mídia ainda não pode ir à galeria.' },
      ],
    },
  },
  quadrinho: {
    id: 'quadrinho',
    thumb: 'thumb-quadrinho-digital',
    kind: 'quadrinho',
    title: 'Quadrinho "A dupla curiosa"',
    license: 'autoral',
    origin: 'Feito por você e por um colega',
    greenNote: 'Quando duas pessoas criam juntas, as duas assinam a obra.',
    options: {
      autor: [
        { label: 'Eu e o Téo, juntos', chip: 'Eu e o Téo', seal: 'verde', why: 'Os dois criaram, então os dois assinam.' },
        { label: 'Eu mesmo', chip: 'Eu mesmo', seal: 'amarelo', why: 'O Téo também desenhou. Deixá-lo de fora apaga o crédito dele.' },
        { label: 'Não achei o autor', chip: 'Autor desconhecido', seal: 'vermelho', why: 'Os autores são vocês dois, e isso é fácil de registrar.' },
      ],
      fonte: [
        { label: 'Oficina de quadrinhos da escola', chip: 'Oficina da escola', seal: 'verde', why: 'É onde o quadrinho foi criado.' },
        { label: 'Achei na internet', chip: 'Internet', seal: 'vermelho', why: 'O quadrinho é original de vocês, não veio da internet.' },
        { label: 'Site de quadrinhos', chip: 'Site de quadrinhos', seal: 'vermelho', why: 'Dar crédito a um site apaga o trabalho de vocês dois.' },
      ],
      uso: [
        { label: 'Publicar na galeria, com os dois nomes', chip: 'Galeria, dois nomes', seal: 'verde', why: 'A obra é de vocês e pode ser publicada com os dois créditos.' },
        { label: 'Publicar só com o meu nome', chip: 'Só o meu nome', seal: 'vermelho', why: 'Isso esconde a participação do colega que criou junto.' },
        { label: 'Não usar o quadrinho', chip: 'Não usar', seal: 'amarelo', why: 'Não há impedimento: a obra é de vocês e pode entrar na galeria.' },
      ],
    },
  },
}