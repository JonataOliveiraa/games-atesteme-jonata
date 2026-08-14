import * as Phaser from "phaser";
import EF01CO05Config from "./index";

new Phaser.Game({
  ...EF01CO05Config,
  parent: "game-container",
});
