const app = document.getElementById("app")!;

const canvas = document.createElement("canvas");
  canvas.style.position   = "absolute";
  canvas.style.top        = "0px";
  canvas.style.left       = "0px";
  canvas.style.width      = "100dvw";
  canvas.style.height     = "100dvh";
  canvas.style.background = "#000";
app.appendChild(canvas);


import { Asset } from "./asset";
import { Stage } from "./stage";

const bundle: Array<Asset> = [
  {kind: "image", path: "/png/grass_tile.png", id: "grassTile"},
]

const cache = Asset.Cache.new();
await Asset.Cache.loadAll(cache, bundle);

const grassTile = Asset.Cache.getImage(cache, "grassTile");

const stage = Stage.new(canvas, { debug: true });

Stage.scene(stage, {
  onRender(context) {
    context.g.scale(2, 2);
    context.g.drawImage(grassTile, 0, 0);
  }
})

