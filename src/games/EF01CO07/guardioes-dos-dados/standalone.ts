import * as Phaser from "phaser";
import EF01CO07Config from "./index";

new Phaser.Game({
  ...EF01CO07Config,
  parent: "game-container",
});
