const app = document.getElementById("app")!;

const canvas = document.createElement("canvas");
  canvas.style.position   = "absolute";
  canvas.style.top        = "0px";
  canvas.style.left       = "0px";
  canvas.style.width      = "100dvw";
  canvas.style.height     = "100dvh";
  canvas.style.background = "#000";
app.appendChild(canvas);

import grassTileUrl from "../public/png/grass_tile.png";
import { Asset } from "./asset";
import { Stage } from "./stage";

const bundle: Array<Asset> = [
  {kind: "image", path: grassTileUrl, id: "grassTile"},
]

const cache = Asset.Cache.new();
await Asset.Cache.loadAll(cache, bundle);

const grassTile = Asset.Cache.getImage(cache, "grassTile");

const stage = Stage.new(canvas, {w: 768, h: 768, si: 1});
Stage.attach(stage, {
  onRender(context) {
    context.g.fillStyle="#fff";
    context.g.fillRect(0, 0, context.stage.virtualCanvasElement.width, context.stage.virtualCanvasElement.height);
  }
})

