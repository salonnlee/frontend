// type Listener<T> = (this: VNode, ev: T, vnode: VNode) => void;

// export type On = {
//   [N in keyof HTMLElementEventMap]?:
//     | Listener<HTMLElementEventMap[N]>
//     | Array<Listener<HTMLElementEventMap[N]>>;
// } & {
//   [event: string]: Listener<any> | Array<Listener<any>>;
// };

// type SomeListener<N extends keyof HTMLElementEventMap> =
//   | Listener<HTMLElementEventMap[N]>
//   | Listener<any>;

function invokeHandler /* <N extends keyof HTMLElementEventMap> */(
  handler /* : SomeListener<N> | Array<SomeListener<N>> */,
  vnode /* : VNode */,
  event /* ?: Event */
) /* : void */ {
  if (typeof handler === "function") {
    // call function handler
    handler.call(vnode, event, vnode);
  } else if (typeof handler === "object") {
    // call multiple handlers
    for (let i = 0; i < handler.length; i++) {
      invokeHandler(handler[i], vnode, event);
    }
  }
}

function handleEvent(event /* : Event */, vnode /* : VNode */) {
  const name = event.type;
  const on = vnode.data.on;

  // call event handler(s) if exists
  if (on && on[name]) {
    invokeHandler(on[name], vnode, event);
  }
}

function createListener() {
  return function handler(event /* : Event */) {
    handleEvent(event, handler.vnode);
  };
}

function updateEventListeners(
  oldVnode /* : VNode */,
  vnode /* ?: VNode */
) /* : void */ {
  const oldOn = oldVnode.data.on;
  const oldListener = oldVnode.listener;
  const oldElm = oldVnode.elm;
  const on = vnode && vnode.data.on;
  const elm = vnode && vnode.elm;
  let name;

  // optimization for reused immutable handlers
  if (oldOn === on) {
    return;
  }

  // remove existing listeners which no longer used
  if (oldOn && oldListener) {
    // if element changed or deleted we remove all existing listeners unconditionally
    if (!on) {
      for (name in oldOn) {
        // remove listener if element was changed or existing listeners removed
        oldElm.removeEventListener(name, oldListener, false);
      }
    } else {
      for (name in oldOn) {
        // remove listener if existing listener removed
        if (!on[name]) {
          oldElm.removeEventListener(name, oldListener, false);
        }
      }
    }
  }

  // add new listeners which has not already attached
  if (on) {
    // reuse existing listener or create new
    const listener = (vnode.listener = oldVnode.listener || createListener());
    // update vnode for listener
    listener.vnode = vnode;

    // if element changed or added we add all needed listeners unconditionally
    if (!oldOn) {
      for (name in on) {
        // add listener if element was changed or new listeners added
        elm.addEventListener(name, listener, false);
      }
    } else {
      for (name in on) {
        // add listener if new listener added
        if (!oldOn[name]) {
          elm.addEventListener(name, listener, false);
        }
      }
    }
  }
}

export const eventListenersModule /* : Module */ = {
  create: updateEventListeners,
  update: updateEventListeners,
  destroy: updateEventListeners
};
