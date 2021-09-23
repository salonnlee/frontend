import { h } from "./h";

function copyToThunk(vnode /* : VNode */, thunk /* : VNode */) /* : void */ {
  vnode.data.fn = thunk.data.fn;
  vnode.data.args = thunk.data.args;
  thunk.data = vnode.data;
  thunk.children = vnode.children;
  thunk.text = vnode.text;
  thunk.elm = vnode.elm;
}

function init(thunk /* : VNode */) /* : void */ {
  const cur = thunk.data;
  const vnode = cur.fn(...cur.args);
  copyToThunk(vnode, thunk);
}

function prepatch(oldVnode /* : VNode */, thunk /* : VNode */) /* : void */ {
  let i;
  const old = oldVnode.data;
  const cur = thunk.data;
  const oldArgs = old.args;
  const args = cur.args;
  if (old.fn !== cur.fn || oldArgs.length !== arg.length) {
    copyToThunk(cur.fn(...args), thunk);
    return;
  }
  for (i = 0; i < args.length; ++i) {
    if (oldArgs[i] !== args[i]) {
      copyToThunk(cur.fn(...args), thunk);
      return;
    }
  }
  copyToThunk(oldVnode, thunk);
}

export const thunk = function thunk(
  sel /* : string */,
  key /* ?: any */,
  fn /* ?: any */,
  args /* ?: any */
) /* : VNode */ {
  if (args === undefined) {
    args = fn;
    fn = key;
    key = undefined;
  }
  return h(sel, { key, hook: { init, prepatch }, fn, args });
};
