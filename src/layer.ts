import type { Stage } from "./stage"

export type Layer = {
  updateable ?: boolean
  renderable ?: boolean
  onUpdate ?: (context: Layer.UpdateContext) => void
  onRender ?: (context: Layer.RenderContext) => void
  onAttach ?: (stage: Stage) => void
  onDetach ?: (stage: Stage) => void
}

export namespace Layer {
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

export const Layer = {
  isUpdateable(a: Layer): a is Layer.Updateable {
    return (a.updateable || a.updateable === undefined) && !!a.onUpdate;
  },

  isRenderable(a: Layer): a is Layer.Renderable {
    return (a.renderable || a.renderable === undefined) && !!a.onRender;
  },
}