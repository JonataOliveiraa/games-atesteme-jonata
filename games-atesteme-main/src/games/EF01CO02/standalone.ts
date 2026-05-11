import Phaser from "phaser";
import config from "./index";

const root = document.getElementById("game-root");
if (!root) {
  throw new Error("Elemento #game-root não encontrado.");
}

new Phaser.Game({
  ...config,
  parent: root,
});
