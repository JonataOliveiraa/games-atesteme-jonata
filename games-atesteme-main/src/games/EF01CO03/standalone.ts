import * as Phaser from "phaser";
import EF01CO03Config from "./index";

new Phaser.Game({
  ...EF01CO03Config,
  parent: "game-container",
});