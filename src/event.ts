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

    listen<T>(tree: Event.Tree, kind  : string, listener  : Event.Listener<T>, o ?: { path ?: string, defer ?: boolean }) {
      const a: Event.Listen = { action: "listen", path: o?.path ?? "", kind, listener };
      if (o?.defer ?? true) queue(tree, a);
      else                  flush(tree, a);
    },

    deafen<T>(tree: Event.Tree, kind ?: string, listener ?: Event.Listener<T>, o ?: { path ?: string, defer ?: boolean }) {
      const a: Event.Deafen = { action: "deafen", path: o?.path ?? "", kind, listener };
      if (o?.defer ?? true) queue(tree, a);
      else                  flush(tree, a);
    },

    dispatch<T>(tree: Event.Tree, kind: string, event: T, o ?: { path ?: string, defer ?: boolean }) {
      const a: Event.Dispatch = { action: "dispatch", path: o?.path ?? "", kind, event };
      if (o?.defer ?? true) queue(tree, a);
      else                  flush(tree, a);
    },

    poll(tree: Event.Tree) {
      tree.pending.splice(0).forEach(
        a => flush(tree, a)
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


function queue(tree: Event.Tree, a: Event.Action) {
  tree.pending.push(a);
}

function flush(tree: Event.Tree, a: Event.Action) {
  switch (a.action) {
    case "listen"  : onListen  (tree, a); break;
    case "deafen"  : onDeafen  (tree, a); break;
    case "dispatch": onDispatch(tree, a); break;
  }
}

function requestListeners(root: Event.Node | undefined, kind: string) {
  let listeners = root?.listeners.get(kind);
  return listeners;
}

function requireListeners(root: Event.Node            , kind: string) {
  let listeners = root?.listeners.get(kind);
  if (!listeners) root.listeners.set(
    kind, listeners = new Set()
  )
  return listeners;
}

function requestNode(root: Event.Node | undefined, path: string) {
  for (const part of path.split("/")) {
    let node = root?.children.get(part);
    if (!node) return undefined;
    root = node;
  }
  return root;
}

function requireNode(root: Event.Node            , path: string) {
  for (const part of path.split("/")) {
    let node = root.children.get(part);
    if (!node) root.children.set(
      part, node = Event.Node.new()
    )
    root = node;
  }
  return root;
}

function onListen  (tree: Event.Tree, a: Event.Listen  ) {
  const node = requireNode(tree.root, a.path);
  const list = requireListeners(node, a.kind);
  list.add(a.listener);
}

function onDeafen  (tree: Event.Tree, a: Event.Deafen  ) {
         if (a.kind !== undefined && a.listener !== undefined) {
    const node = requestNode(tree.root, a.path);
    const list = requestListeners(node, a.kind);
    list?.delete(a.listener);
  } else if (a.kind !== undefined && a.listener === undefined) {
    const node = requestNode(tree.root, a.path);
    const list = requestListeners(node, a.kind);
    list?.clear();
  } else if (a.kind === undefined && a.listener !== undefined) {
    const node = requestNode(tree.root, a.path);
    node?.listeners.forEach((list) => {
      list.delete(a.listener!);
    })
  } else if (a.kind === undefined && a.listener === undefined) {
    const node = requestNode(tree.root, a.path);
    node?.children .clear();
    node?.listeners.clear();
  }
}

function onDispatch(tree: Event.Tree, a: Event.Dispatch) {
  const node = requestNode(tree.root, a.path);
  if (node) reDispatch(tree, node, a.path, a.kind, a.event);
}

function reDispatch(
  tree: Event.Tree, 
  node: Event.Node,
  path: string, 
  kind: string,
  event: any
) {
  requestListeners(node, kind)?.forEach(self => {
    self(event, {tree, node, path, kind, self})
  })

  node.children.forEach((node, name) => {
    reDispatch(tree, node, path + "/" + name, kind, event)
  })
}