import Phaser from 'phaser'

import carregandoUrl from '../../../assets/games/EF01CO04/carregando.png'

import bgMapaUrl from '../../../assets/games/EF01CO04/bg_mapa.png'
import painelOrigemUrl from '../../../assets/games/EF01CO04/painel_origem.png'
import painelDestinoUrl from '../../../assets/games/EF01CO04/painel_destino.png'
import balaoPensamentoUrl from '../../../assets/games/EF01CO04/balao_pensamento.png'
import coverUrl from '../../../assets/games/EF01CO04/cover-correio-multimidia.png'

import estacaoMicrofoneUrl from '../../../assets/games/EF01CO04/estacao_microfone.png'
import estacaoMicrofoneAtivaUrl from '../../../assets/games/EF01CO04/estacao_microfone_ativa.png'
import estacaoLapisUrl from '../../../assets/games/EF01CO04/estacao_lapis.png'
import estacaoLapisAtivaUrl from '../../../assets/games/EF01CO04/estacao_lapis_ativa.png'
import estacaoEnvelopeUrl from '../../../assets/games/EF01CO04/estacao_envelope.png'
import estacaoEnvelopeAtivaUrl from '../../../assets/games/EF01CO04/estacao_envelope_ativa.png'

import infoCachorroUrl from '../../../assets/games/EF01CO04/info_cachorro.png'
import infoGatoUrl from '../../../assets/games/EF01CO04/info_gato.png'
import infoSolUrl from '../../../assets/games/EF01CO04/info_sol.png'
import infoCarroUrl from '../../../assets/games/EF01CO04/info_carro.png'
import infoMacaUrl from '../../../assets/games/EF01CO04/info_maca.png'
import infoCasaUrl from '../../../assets/games/EF01CO04/info_casa.png'

import botaoAvancarUrl from '../../../assets/games/EF01CO04/botao_avancar.png'
import botaoConfirmarUrl from '../../../assets/games/EF01CO04/botao_confirmar.png'
import cursorTutorialUrl from '../../../assets/games/EF01CO04/cursor_tutorial.png'
import indicadorProgressoUrl from '../../../assets/games/EF01CO04/indicador_progresso.png'
import quadroDesenhoUrl from '../../../assets/games/EF01CO04/quadro_desenho.png'
import efeitoStarburstUrl from '../../../assets/games/EF01CO04/efeito-starburst.png'
import ondaDeSom from '../../../assets/games/EF01CO04/onda_de_som.png'
import papelDesenhado from '../../../assets/games/EF01CO04/papel_desenhado.png'
import destinoAnalisaDesenho from '../../../assets/games/EF01CO04/destino_analisa_desenho.png'
import aceitarUrl from '../../../assets/games/EF01CO04/aceitar.png'
import voltarUrl from '../../../assets/games/EF01CO04/voltar.png'
import iconeSom from '../../../assets/games/EF01CO04/icone-som.png'
import somLatidoUrl from '../../../assets/games/EF01CO04/audio/som_latido.ogg'
import somMiadoUrl from '../../../assets/games/EF01CO04/audio/som_miado.ogg'
import somBuzinaUrl from '../../../assets/games/EF01CO04/audio/som_buzina.ogg'
import { createLoadingScreen } from '../../../shared/loading/createLoadingScreen'

export class BootScene extends Phaser.Scene {
  private progressBar!: Phaser.GameObjects.Graphics

  constructor() {
    super({ key: 'BootScene' })
  }

  preload() {
    createLoadingScreen(this, {
      title: 'Correio Multimídia',
      description: 'Carregando...',
      theme: {
        background: {
          kind: 'stripes',
          base: 0x164e72,
          color: 0x9ee8cf,
          alpha: 0.12,
          size: 40,
          gap: 60,
          angle: 'diagonal',
        },

        card: 0x247ba0,
        cardShadow: 0x0b3954,
        cardHighlight: 0xffffff,
        cardBorder: 0xa7f3d0,

        title: 0xffffff,
        subtitle: 0xbaf7e3,
        description: 0xe4f7f3,

        titleStroke: 0x0b3954,

        progressTrack: 0x123e5a,
        progressBorder: 0xffffff,
        progressFill: 0x86efc4,
        progressHighlight: 0xffffff,
      },
    })
    this.load.image('carregando', carregandoUrl)
    this.load.image('bg_mapa', bgMapaUrl)
    this.load.image('painel_origem', painelOrigemUrl)
    this.load.image('painel_destino', painelDestinoUrl)
    this.load.image('balao_pensamento', balaoPensamentoUrl)
    this.load.image('cover_correio_multimidia', coverUrl)
    this.load.image('aceitar', aceitarUrl)
    this.load.image('voltar', voltarUrl)
    this.load.image('icone_som', iconeSom)

    this.load.image('estacao_microfone', estacaoMicrofoneUrl)
    this.load.image('estacao_microfone_ativa', estacaoMicrofoneAtivaUrl)
    this.load.image('estacao_lapis', estacaoLapisUrl)
    this.load.image('estacao_lapis_ativa', estacaoLapisAtivaUrl)
    this.load.image('estacao_envelope', estacaoEnvelopeUrl)
    this.load.image('estacao_envelope_ativa', estacaoEnvelopeAtivaUrl)

    this.load.image('info_cachorro', infoCachorroUrl)
    this.load.image('info_gato', infoGatoUrl)
    this.load.image('info_sol', infoSolUrl)
    this.load.image('info_carro', infoCarroUrl)
    this.load.image('info_maca', infoMacaUrl)
    this.load.image('info_casa', infoCasaUrl)

    this.load.image('botao_avancar', botaoAvancarUrl)
    this.load.image('botao_confirmar', botaoConfirmarUrl)
    this.load.image('cursor_tutorial', cursorTutorialUrl)
    this.load.image('indicador_progresso', indicadorProgressoUrl)
    this.load.image('quadro_desenho', quadroDesenhoUrl)
    this.load.image('efeito_starburst', efeitoStarburstUrl)
    this.load.image('onda_de_som', ondaDeSom)
    this.load.image('papel_desenhado', papelDesenhado)
    this.load.image('destino_analisa_desenho', destinoAnalisaDesenho)


    this.load.audio('som_latido', somLatidoUrl)
    this.load.audio('som_miado', somMiadoUrl)
    this.load.audio('som_buzina', somBuzinaUrl)

    this.load.once('complete', () => {
      this.scene.start('GameScene')
      this.scene.launch('UIScene')
    })
  }

  create() {
    this.loadRemainingAssets()
  }

  private loadRemainingAssets() {
    this.load.start()
  }
}