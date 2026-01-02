export type Event = {

}

export namespace Event {
  export type Listen   = { action: "listen"  , path: string, kind  : string, listener  : Listener<any> }
  export type Deafen   = { action: "deafen"  , path: string, kind ?: string, listener ?: Listener<any> }
  export type Dispatch = { action: "dispatch", path: string, kind  : string, event: any }
  export type Action   = Listen | Deafen | Dispatch

  export type Tree = {
    root   : Node
    pending: Array<Action>
  }

  export type Node = {
    listeners: Map<string, Set<Listener<any>>>
    children : Map<string, Node              >
  }

  export type Listener<T> = {
    (event: T, context: Context<T>): void
  }

  export type Context<T> = {
    tree: Tree
    node: Node
    path: string
    kind: string
    self: Listener<T>
  }
}

export const Event = {
  Tree: {
    new() {
      return {
        root   : Event.Node.new(),
        pending:               [],
      } satisfies Event.Tree
    },

    queue(tree: Event.Tree, a: Event.Action) {
      tree.pending.push(a);
    },

    flush(tree: Event.Tree, a: Event.Action) {
      switch (a.action) {
        case "listen"  : onListen  (tree, a); break;
        case "deafen"  : onDeafen  (tree, a); break;
        case "dispatch": onDispatch(tree, a); break;
      }
    },

    poll(tree: Event.Tree) {
      tree.pending.splice(0).forEach(
        a => Event.Tree.flush(tree, a)
      )
    },

  },

  Node: {
    new() {
      return {
        listeners: new Map(),
        children : new Map(),
      } satisfies Event.Node
    }
  }
}

function onListen  (tree: Event.Tree, a: Event.Listen  ) {
}

function onDeafen  (tree: Event.Tree, a: Event.Deafen  ) {
}

function onDispatch(tree: Event.Tree, a: Event.Dispatch) {
}

function reDispatch(
  tree: Event.Tree, 
  node: Event.Node,
  path: string, 
  kind: string,
  event: any
) {

}