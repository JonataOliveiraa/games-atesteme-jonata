import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'

import bgOficinaUrl from '../../../../assets/games/EF05CO11/escolha-a-ferramenta-certa/bg-oficina.png'

import techCelularUrl from '../../../../assets/games/EF05CO11/escolha-a-ferramenta-certa/tech-celular.png'
import techTabletUrl from '../../../../assets/games/EF05CO11/escolha-a-ferramenta-certa/tech-tablet.png'
import techNotebookUrl from '../../../../assets/games/EF05CO11/escolha-a-ferramenta-certa/tech-notebook.png'
import techProjetorUrl from '../../../../assets/games/EF05CO11/escolha-a-ferramenta-certa/tech-projetor.png'
import techImpressoraUrl from '../../../../assets/games/EF05CO11/escolha-a-ferramenta-certa/tech-impressora.png'
import techScannerUrl from '../../../../assets/games/EF05CO11/escolha-a-ferramenta-certa/tech-scanner.png'
import techNuvemUrl from '../../../../assets/games/EF05CO11/escolha-a-ferramenta-certa/tech-nuvem.png'
import techHdExternoUrl from '../../../../assets/games/EF05CO11/escolha-a-ferramenta-certa/tech-hd-externo.png'
import techPendriveUrl from '../../../../assets/games/EF05CO11/escolha-a-ferramenta-certa/tech-pendrive.png'
import techCaixaSomUrl from '../../../../assets/games/EF05CO11/escolha-a-ferramenta-certa/tech-caixa-som.png'
import techCameraUrl from '../../../../assets/games/EF05CO11/escolha-a-ferramenta-certa/tech-camera.png'
import techMicrofoneUrl from '../../../../assets/games/EF05CO11/escolha-a-ferramenta-certa/tech-microfone.png'
import techLousaDigitalUrl from '../../../../assets/games/EF05CO11/escolha-a-ferramenta-certa/tech-lousa-digital.png'
import techFoneUrl from '../../../../assets/games/EF05CO11/escolha-a-ferramenta-certa/tech-fone.png'

import casoAuditorioUrl from '../../../../assets/games/EF05CO11/escolha-a-ferramenta-certa/caso-auditorio.png'
import casoQuadraUrl from '../../../../assets/games/EF05CO11/escolha-a-ferramenta-certa/caso-quadra.png'
import casoSalaAulaUrl from '../../../../assets/games/EF05CO11/escolha-a-ferramenta-certa/caso-sala-aula.png'
import casoBibliotecaUrl from '../../../../assets/games/EF05CO11/escolha-a-ferramenta-certa/caso-biblioteca.png'
import casoExcursaoUrl from '../../../../assets/games/EF05CO11/escolha-a-ferramenta-certa/caso-excursao.png'
import casoSecretariaUrl from '../../../../assets/games/EF05CO11/escolha-a-ferramenta-certa/caso-secretaria.png'
import casoFeiraCienciasUrl from '../../../../assets/games/EF05CO11/escolha-a-ferramenta-certa/caso-feira-ciencias.png'
import casoSalaInformaticaUrl from '../../../../assets/games/EF05CO11/escolha-a-ferramenta-certa/caso-sala-informatica.png'
import { faseInicial } from '../../../../shared/level/faseInicial'

const ASSETS: Array<[string, string]> = [
  ['bg-oficina', bgOficinaUrl],

  ['tech-celular', techCelularUrl],
  ['tech-tablet', techTabletUrl],
  ['tech-notebook', techNotebookUrl],
  ['tech-projetor', techProjetorUrl],
  ['tech-impressora', techImpressoraUrl],
  ['tech-scanner', techScannerUrl],
  ['tech-nuvem', techNuvemUrl],
  ['tech-hd-externo', techHdExternoUrl],
  ['tech-pendrive', techPendriveUrl],
  ['tech-caixa-som', techCaixaSomUrl],
  ['tech-camera', techCameraUrl],
  ['tech-microfone', techMicrofoneUrl],
  ['tech-lousa-digital', techLousaDigitalUrl],
  ['tech-fone', techFoneUrl],

  ['caso-auditorio', casoAuditorioUrl],
  ['caso-quadra', casoQuadraUrl],
  ['caso-sala-aula', casoSalaAulaUrl],
  ['caso-biblioteca', casoBibliotecaUrl],
  ['caso-excursao', casoExcursaoUrl],
  ['caso-secretaria', casoSecretariaUrl],
  ['caso-feira-ciencias', casoFeiraCienciasUrl],
  ['caso-sala-informatica', casoSalaInformaticaUrl],
]

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload() {
    createLoadingScreen(this, {
      title: 'Escolha a Ferramenta Certa',
      subtitle: 'Abrindo a oficina',
      description: 'Preparando os chamados da escola...',
      theme: {
        background: { kind: 'stripes', base: 0x0b3b44, color: 0x7fd4dd, alpha: 0.1, size: 40, gap: 60, angle: 'diagonal' },
        card: 0x11616d,
        cardShadow: 0x041e24,
        cardHighlight: 0xffffff,
        cardBorder: 0x7fd4dd,
        title: 0xffffff,
        subtitle: 0x9fe4ec,
        description: 0xdcf1f3,
        titleStroke: 0x041e24,
        progressTrack: 0x041e24,
        progressBorder: 0xffffff,
        progressFill: 0x9fe4ec,
        progressHighlight: 0xffffff,
      },
    })

    ASSETS.forEach(([key, url]) => this.load.image(key, url))
  }

  create() {
    this.scene.launch('UIScene')
    this.scene.start('GameScene', { level: faseInicial(this, 1), phase: 0, points: 0 })
  }
}