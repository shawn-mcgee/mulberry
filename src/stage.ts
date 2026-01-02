import { Layer } from "./layer";

export type Stage = {
  configureDebug: "print" | "paint" | boolean;
  configureW    : number;
  configureH    : number;
  configureUpdatesPerSecond: number;
  configureRendersPerSecond: number;
  configureScaleIncrement ?: number;
  configureImageSmoothing ?: ImageSmoothingQuality;

  logicalCanvasElement: HTMLCanvasElement
  virtualCanvasElement: OffscreenCanvas
  logicalCanvasContext: CanvasRenderingContext2D
  virtualCanvasContext: OffscreenCanvasRenderingContext2D
  virtualScale: number;

  layers: Array<Layer>

  framesPerSecond : number
  updatesPerSecond: number
  rendersPerSecond: number
  averageMillisPerUpdate: number
  averageMillisPerRender: number
  minimumMillisPerUpdate: number
  minimumMillisPerRender: number
  maximumMillisPerUpdate: number
  maximumMillisPerRender: number

  __lastUpdate__       : number
  __lastRender__       : number
  __millisPerUpdate__  : number
  __millisPerRender__  : number
  __secondAccumulator__: number
  __updateAccumulator__: number
  __renderAccumulator__: number

  __framesPerSecondAccumulator__       : number
  __updatesPerSecondAccumulator__      : number
  __rendersPerSecondAccumulator__      : number
  __averageMillisPerUpdateAccumulator__: number
  __averageMillisPerRenderAccumulator__: number
  __minimumMillisPerUpdateAccumulator__: number
  __minimumMillisPerRenderAccumulator__: number
  __maximumMillisPerUpdateAccumulator__: number
  __maximumMillisPerRenderAccumulator__: number
}

export const Stage = {
  new(canvas: HTMLCanvasElement, o ?: {
    debug ?: "print" | "paint" | boolean;
    w   ?: number;
    h   ?: number;
    ups ?: number;
    rps ?: number;

    si ?: number;
    is ?: ImageSmoothingQuality;
  }) {
    const configureDebug            = o?.debug ?? false;
    const configureW                = o?.w     ?? 0;
    const configureH                = o?.h     ?? 0;
    const configureUpdatesPerSecond = o?.ups   ?? 0;
    const configureRendersPerSecond = o?.rps   ?? 0;
    const configureScaleIncrement   = o?.si
    const configureImageSmoothing   = o?.is
    
    const logicalCanvasElement = canvas;
    const virtualCanvasElement = new OffscreenCanvas(
      configureW || logicalCanvasElement.width,
      configureH || logicalCanvasElement.height
    );

    const logicalCanvasContext = logicalCanvasElement.getContext("2d")!;
    const virtualCanvasContext = virtualCanvasElement.getContext("2d")!;

    logicalCanvasContext.imageSmoothingEnabled = !!configureImageSmoothing;
    virtualCanvasContext.imageSmoothingEnabled = !!configureImageSmoothing;
    if (configureImageSmoothing) {
      logicalCanvasContext.imageSmoothingQuality = configureImageSmoothing;
      virtualCanvasContext.imageSmoothingQuality = configureImageSmoothing;
    }

    let virtualScale = Math.min(
      logicalCanvasElement.width  / virtualCanvasElement.width ,
      logicalCanvasElement.height / virtualCanvasElement.height
    )
    if (configureScaleIncrement)
      virtualScale = Math.floor(virtualScale / configureScaleIncrement) * configureScaleIncrement;

    const __millisPerUpdate__ = configureUpdatesPerSecond ? 1000 / configureUpdatesPerSecond : 0;
    const __millisPerRender__ = configureRendersPerSecond ? 1000 / configureRendersPerSecond : 0;

    const stage = {
      configureDebug,
      configureW    ,
      configureH    ,
      configureUpdatesPerSecond,
      configureRendersPerSecond,
      configureScaleIncrement,
      configureImageSmoothing,

      logicalCanvasElement,
      virtualCanvasElement,
      logicalCanvasContext,
      virtualCanvasContext,
      virtualScale,

      layers: [],

      // metrics
      framesPerSecond       : 0,
      updatesPerSecond      : 0,
      rendersPerSecond      : 0,
      averageMillisPerUpdate: 0,
      averageMillisPerRender: 0,
      minimumMillisPerUpdate: 0,
      minimumMillisPerRender: 0,
      maximumMillisPerUpdate: 0,
      maximumMillisPerRender: 0,

      __lastUpdate__       : 0,
      __lastRender__       : 0,
      __millisPerUpdate__,
      __millisPerRender__,
      __secondAccumulator__: 0,
      __updateAccumulator__: 0,
      __renderAccumulator__: 0,
      __framesPerSecondAccumulator__       : 0,
      __updatesPerSecondAccumulator__      : 0,
      __rendersPerSecondAccumulator__      : 0,
      __averageMillisPerUpdateAccumulator__: 0,
      __averageMillisPerRenderAccumulator__: 0,
      __minimumMillisPerUpdateAccumulator__: Infinity,
      __minimumMillisPerRenderAccumulator__: Infinity,
      __maximumMillisPerUpdateAccumulator__: 0,
      __maximumMillisPerRenderAccumulator__: 0,
    } satisfies Stage;

    new ResizeObserver(() => resize(stage)).observe(canvas);

    requestAnimationFrame(
      firstFrame => requestAnimationFrame(
        lastFrame => requestAnimationFrame(
          thisFrame => {
            stage.__lastUpdate__  = thisFrame;
            stage.__lastRender__  = thisFrame;
            animate(stage, firstFrame, lastFrame, thisFrame)
          }
        )
      )
    )

    return stage;
  },

  attach(stage: Stage, layer: Layer) {
    if ( stage.layers.includes(layer))
      throw new Error(`[Stage.attach]: Layer is already attached`);
    stage.layers = [...stage.layers, layer];
    if (layer.onAttach)
      layer.onAttach(stage);
  },

  detach(stage: Stage, layer: Layer) {
    if (!stage.layers.includes(layer))
      throw new Error(`[Stage.detach]: Layer is not attached`);
    stage.layers = stage.layers.filter(l => l !== layer);
    if (layer.onDetach)
      layer.onDetach(stage);
  },
}

function resize(stage: Stage) {
  stage.logicalCanvasElement.width  = stage.logicalCanvasElement.getBoundingClientRect().width ;
  stage.logicalCanvasElement.height = stage.logicalCanvasElement.getBoundingClientRect().height;

  stage.virtualCanvasElement = new OffscreenCanvas(
    stage.configureW || stage.logicalCanvasElement.width,
    stage.configureH || stage.logicalCanvasElement.height
  )

  stage.logicalCanvasContext = stage.logicalCanvasElement.getContext("2d")!;
  stage.virtualCanvasContext = stage.virtualCanvasElement.getContext("2d")!;

  // configure image smoothing
  stage.logicalCanvasContext.imageSmoothingEnabled = !!stage.configureImageSmoothing;
  stage.virtualCanvasContext.imageSmoothingEnabled = !!stage.configureImageSmoothing;
  if (stage.configureImageSmoothing) {
    stage.logicalCanvasContext.imageSmoothingQuality = stage.configureImageSmoothing;
    stage.virtualCanvasContext.imageSmoothingQuality = stage.configureImageSmoothing;
  }

  // configure virtual scale
  stage.virtualScale = Math.min(
    stage.logicalCanvasElement.width  / stage.virtualCanvasElement.width ,
    stage.logicalCanvasElement.height / stage.virtualCanvasElement.height
  )
  if (stage.configureScaleIncrement)
    stage.virtualScale = Math.floor(stage.virtualScale / stage.configureScaleIncrement) * stage.configureScaleIncrement;
}

function update(stage: Stage, t: number, dt: number) {
  for (const layer of stage.layers)
    if (Layer.isUpdateable(layer))
      layer.onUpdate({stage, t, dt});
}

function render(stage: Stage, t: number, dt: number) {
  const lw = stage.logicalCanvasElement.width ;
  const lh = stage.logicalCanvasElement.height;
  const vw = stage.virtualCanvasElement.width ;
  const vh = stage.virtualCanvasElement.height;
  const vs = stage.virtualScale;


  const f = stage.logicalCanvasContext;
  const g = stage.virtualCanvasContext;

  f.resetTransform();
  g.resetTransform();

  f.translate(
    (lw - vw * vs) / 2,
    (lh - vh * vs) / 2
  )
  f.scale(vs, vs);

  for (const layer of stage.layers)
    if (Layer.isRenderable(layer))
      layer.onRender({stage, t, dt, g});

  f.drawImage(stage.virtualCanvasElement, 0, 0);
}

function animate(stage: Stage, firstFrame: number, lastFrame: number, thisFrame: number) {
  const deltaFrame = thisFrame - lastFrame;
  stage.__secondAccumulator__ += deltaFrame;
  stage.__updateAccumulator__ += deltaFrame;
  stage.__renderAccumulator__ += deltaFrame;

  if (stage.__updateAccumulator__ >= stage.__millisPerUpdate__) {
    const  t = (thisFrame -         firstFrame  ) / 1000;
    const dt = (thisFrame - stage.__lastUpdate__) / 1000;

    const a = performance.now();
    update(stage, t, dt);
    const b = performance.now();

    const updateMillis = b - a;
    stage.__lastUpdate__ = thisFrame;
    stage.__updatesPerSecondAccumulator__ += 1;
    stage.__updateAccumulator__ -= stage.__millisPerUpdate__;

    stage.__averageMillisPerUpdateAccumulator__ += updateMillis;
    if (updateMillis < stage.__minimumMillisPerUpdateAccumulator__)
      stage.__minimumMillisPerUpdateAccumulator__ = updateMillis;
    if (updateMillis > stage.__maximumMillisPerUpdateAccumulator__)
      stage.__maximumMillisPerUpdateAccumulator__ = updateMillis;
  }

  if (stage.__renderAccumulator__ >= stage.__millisPerRender__) {
    const  t = (thisFrame -         firstFrame  ) / 1000;
    const dt = (thisFrame - stage.__lastRender__) / 1000;

    const a = performance.now();
    render(stage, t, dt);
    const b = performance.now();

    const renderMillis = b - a;
    stage.__lastRender__ = thisFrame;
    stage.__rendersPerSecondAccumulator__ += 1;
    stage.__renderAccumulator__ -= stage.__millisPerRender__;

    stage.__averageMillisPerRenderAccumulator__ += renderMillis;
    if (renderMillis < stage.__minimumMillisPerRenderAccumulator__)
      stage.__minimumMillisPerRenderAccumulator__ = renderMillis;
    if (renderMillis > stage.__maximumMillisPerRenderAccumulator__)
      stage.__maximumMillisPerRenderAccumulator__ = renderMillis;
  }

  if (stage.__secondAccumulator__ >= 1000) {
    stage.__secondAccumulator__ = 0;

    stage.framesPerSecond  = stage.__framesPerSecondAccumulator__ ;
    stage.updatesPerSecond = stage.__updatesPerSecondAccumulator__;
    stage.rendersPerSecond = stage.__rendersPerSecondAccumulator__;

    stage.averageMillisPerUpdate = stage.__averageMillisPerUpdateAccumulator__ / stage.__updatesPerSecondAccumulator__;
    stage.averageMillisPerRender = stage.__averageMillisPerRenderAccumulator__ / stage.__rendersPerSecondAccumulator__;
    stage.minimumMillisPerUpdate = stage.__minimumMillisPerUpdateAccumulator__;
    stage.minimumMillisPerRender = stage.__minimumMillisPerRenderAccumulator__;
    stage.maximumMillisPerUpdate = stage.__maximumMillisPerUpdateAccumulator__;
    stage.maximumMillisPerRender = stage.__maximumMillisPerRenderAccumulator__;

    stage.__framesPerSecondAccumulator__        = 0;
    stage.__updatesPerSecondAccumulator__       = 0;
    stage.__rendersPerSecondAccumulator__       = 0;
    stage.__averageMillisPerUpdateAccumulator__ = 0;
    stage.__averageMillisPerRenderAccumulator__ = 0;
    stage.__minimumMillisPerUpdateAccumulator__ = Infinity;
    stage.__minimumMillisPerRenderAccumulator__ = Infinity;
    stage.__maximumMillisPerUpdateAccumulator__ = 0;
    stage.__maximumMillisPerRenderAccumulator__ = 0;

    if (stage.configureDebug && stage.configureDebug !== "paint") {
      console.log(getFrameInfo (stage));
      console.log(getUpdateInfo(stage));
      console.log(getRenderInfo(stage));
      console.log(getCanvasInfo(stage));
    }
  }

  stage.__framesPerSecondAccumulator__ += 1;

  requestAnimationFrame(nextFrame => animate(stage, firstFrame, thisFrame, nextFrame));
}

function getFrameInfo (stage: Stage) {
  return `Frame ${stage.framesPerSecond} hz`
}

function getUpdateInfo(stage: Stage) {
  return `Update ${stage.updatesPerSecond}/${stage.configureUpdatesPerSecond} hz @ ${stage.averageMillisPerUpdate.toFixed(2)} ms [${stage.minimumMillisPerUpdate.toFixed(2)} - ${stage.maximumMillisPerUpdate.toFixed(2)}]`
}

function getRenderInfo(stage: Stage) {
  return `Render ${stage.rendersPerSecond}/${stage.configureRendersPerSecond} hz @ ${stage.averageMillisPerRender.toFixed(2)} ms [${stage.minimumMillisPerRender.toFixed(2)} - ${stage.maximumMillisPerRender.toFixed(2)}]`
}

function getCanvasInfo(stage: Stage) {
  const lw = stage.logicalCanvasElement.width ;
  const lh = stage.logicalCanvasElement.height;
  const vw = stage.virtualCanvasElement.width ;
  const vh = stage.virtualCanvasElement.height;
  const vs = stage.virtualScale;
  return `Canvas ${lw}x${lh} -> ${vw}x${vh} @${(100 * vs).toFixed(2)}%`
}