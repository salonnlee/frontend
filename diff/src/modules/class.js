function updateClass(oldVnode /* : VNode */, vnode /* : VNode */) /* : void */ {
  let cur;
  let name;
  const elm = vnode.elm;
  let oldClass = oldVnode.data.class;
  let klass = vnode.data.class;

  if (!oldClass && !klass) return;
  if (oldClass === klass) return;
  oldClass = oldClass || {};
  klass = klass || {};

  for (name in oldClass) {
    if (oldClass[name] && !Object.prototype.hasOwnProperty.call(klass, name)) {
      // was `true` and now not provided
      elm.classList.remove(name);
    }
  }
  for (name in klass) {
    cur = klass[name];
    if (cur !== oldClass[name]) {
      elm.classList[cur ? "add" : "remove"](name);
    }
  }
}

export const classModule /* : Module */ = {
  create: updateClass,
  update: updateClass
};
