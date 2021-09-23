function updateProps(oldVnode /* : VNode */, vnode /* : VNode */) /* : void */ {
  let key;
  let cur;
  let old;
  const elm = vnode.elm;
  let oldProps = oldVnode.props;
  let props = vnode.props;

  if (!oldProps && !props) return;
  if (oldProps === props) return;
  oldProps = oldProps || {};
  props = props || {};

  for (key in props) {
    cur = props[key];
    old = oldProps[key];
    if (old !== cur && (key !== "value" || elm[key] !== cur)) {
      elm[key] = cur;
    }
  }
}

export const propsModule /* : Module */ = {
  create: updateProps,
  update: updateProps
};
