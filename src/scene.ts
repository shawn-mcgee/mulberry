import type { Stage } from "./stage"

export type Scene = {
  updateable ?: boolean
  renderable ?: boolean
  onUpdate ?: (context: Scene.UpdateContext) => void
  onRender ?: (context: Scene.RenderContext) => void
  onAttach ?: (stage: Stage) => void
  onDetach ?: (stage: Stage) => void
}

export namespace Scene {
  export type UpdateContext = {
    stage: Stage
    t : number
    dt: number
  }

  export type RenderContext = {
    stage: Stage
    t : number
    dt: number

    g : OffscreenCanvasRenderingContext2D
  }

  export type Updateable = {
    onUpdate: (context: UpdateContext) => void
  }

  export type Renderable = {
    onRender: (context: RenderContext) => void
  }

}

export const Scene = {
  isUpdateable(a: Scene | undefined): a is Scene.Updateable {
    return !!a && (a.updateable || a.updateable === undefined) && !!a.onUpdate;
  },

  isRenderable(a: Scene | undefined): a is Scene.Renderable {
    return !!a && (a.renderable || a.renderable === undefined) && !!a.onRender;
  },
}