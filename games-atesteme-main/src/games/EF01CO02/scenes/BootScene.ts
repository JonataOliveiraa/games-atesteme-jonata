import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
    constructor() { super('BootScene'); }

    preload() {
        this.generateOrigamiTextures();
    }

    private generateOrigamiTextures() {
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });

        // --- FIGURAS DO BARCO (NÍVEL 1) ---
        // Base
        graphics.clear();
        graphics.fillStyle(0xffd700);
        graphics.fillRect(0, 0, 100, 100);
        graphics.lineStyle(2, 0xb8860b, 0.5);
        graphics.lineBetween(0, 50, 100, 50);
        graphics.generateTexture('origami_base', 100, 100);

        // Dobra Central
        graphics.clear();
        graphics.fillStyle(0xffd700);
        graphics.fillTriangle(0, 100, 50, 0, 100, 100);
        graphics.generateTexture('origami_center', 100, 100);

        // Pontas
        graphics.clear();
        graphics.fillStyle(0xffd700);
        graphics.fillPoints([new Phaser.Geom.Point(50, 0), new Phaser.Geom.Point(100, 50), new Phaser.Geom.Point(50, 100), new Phaser.Geom.Point(0, 50)], true);
        graphics.generateTexture('origami_tips', 100, 100);

        // Barco Final
        graphics.clear();
        graphics.fillStyle(0xffd700);
        graphics.fillPoints([new Phaser.Geom.Point(10, 60), new Phaser.Geom.Point(90, 60), new Phaser.Geom.Point(80, 90), new Phaser.Geom.Point(20, 90)], true);
        graphics.fillTriangle(50, 10, 50, 60, 80, 60);
        graphics.generateTexture('origami_boat', 100, 100);

        // --- FIGURAS DO AVIÃO (NÍVEL 2) ---
        // Usaremos cores levemente diferentes para distinguir os níveis
        const planeColor = 0x4ade80; // Verde água moderno

        for (let i = 1; i <= 6; i++) {
            graphics.clear();
            graphics.fillStyle(planeColor);
            
            if (i === 1) graphics.fillRect(20, 10, 60, 80); // Papel Retangular
            else if (i === 2) graphics.fillTriangle(20, 10, 80, 10, 50, 40); // Pontas dobradas
            else if (i === 3) graphics.fillTriangle(50, 10, 50, 90, 10, 90); // Dobra ao meio
            else if (i === 4) graphics.fillTriangle(10, 50, 90, 30, 90, 70); // Asa 1
            else if (i === 5) graphics.fillTriangle(10, 50, 95, 20, 95, 80); // Asa 2
            else graphics.fillPoints([new Phaser.Geom.Point(10, 50), new Phaser.Geom.Point(90, 20), new Phaser.Geom.Point(80, 50), new Phaser.Geom.Point(90, 80)], true); // Avião pronto
            
            graphics.lineStyle(2, 0x166534);
            graphics.strokePath();
            graphics.generateTexture(`plane_step_${i}`, 100, 100);

            // --- FIGURAS DO CACHORRO (NÍVEL 3) ---
const dogColor = 0xf97316; // Laranja/Marrom para o cachorro

for (let i = 1; i <= 6; i++) {
    graphics.clear();
    graphics.fillStyle(dogColor);
    
    if (i === 1) {
        graphics.fillRect(20, 20, 60, 60); // Quadrado inicial
    } else if (i === 2) {
        graphics.fillTriangle(10, 10, 90, 10, 50, 60); // Triângulo base
    } else if (i === 3) {
        graphics.fillPoints([new Phaser.Geom.Point(10, 10), new Phaser.Geom.Point(40, 10), new Phaser.Geom.Point(20, 50)], true); // Uma orelha
    } else if (i === 4) {
        graphics.fillPoints([new Phaser.Geom.Point(10, 10), new Phaser.Geom.Point(90, 10), new Phaser.Geom.Point(20, 50), new Phaser.Geom.Point(80, 50)], true); // Duas orelhas
    } else if (i === 5) {
        graphics.fillPoints([new Phaser.Geom.Point(10, 10), new Phaser.Geom.Point(90, 10), new Phaser.Geom.Point(50, 50), new Phaser.Geom.Point(50, 40)], true); // Queixo dobrado
    } else {
        // Rosto pronto com olhos (detalhe simples)
        graphics.fillCircle(50, 40, 40);
        graphics.fillStyle(0x000000);
        graphics.fillCircle(35, 35, 5);
        graphics.fillCircle(65, 35, 5);
        graphics.fillTriangle(45, 50, 55, 50, 50, 60);
    }
    
    graphics.lineStyle(2, 0x7c2d12);
    graphics.strokePath();
    graphics.generateTexture(`dog_step_${i}`, 100, 100);
}
        }
    }

    create() { this.scene.start('GameScene'); }
}