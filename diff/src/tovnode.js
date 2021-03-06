import { htmlDomApi } from "./htmldomapi";
import { vnode } from "./vnode";

export function toVNode(
  node /* : Node */,
  domApi /* ?: DOMAPI */
) /* : VNode */ {
  const api /* : DOMAPI */ = domApi !== undefined ? domApi : htmlDomApi;
  let text; /* : string */
  if (api.isElement(node)) {
    const id = node.id ? "#" + node.id : "";
    const cn = node.getAttribute("class");
    const c = cn ? "." + cn.split(" ").join(".") : "";
    const sel = api.tagName(node).toLowerCase() + id + c;
    const attrs = {};
    const children /* : VNode[] */ = [];
    let name;
    let i, n;
    const elmAttrs = node.attributes;
    const elmChildren = node.childNodes;
    for (i = 0, n = elmAttrs.length; i < n; i++) {
      name = elmAttrs[i].nodeName;
      if (name !== "id" && name !== "class") {
        attrs[name] = elmAttrs[i].nodeValue;
      }
    }
    for (i = 0, n = elmChildren.length; i < n; i++) {
      children.push(toVNode(elmChildren[i], domApi));
    }
    return vnode(sel, { attrs }, children, undefined, node);
  } else if (api.isText(node)) {
    text = api.getTextContent(node);
    return vnode(undefined, undefined, undefined, text, node);
  } else if (api.isComment(node)) {
    text = api.getTextContent(node);
    return vnode("!", {}, [], text, node);
  } else {
    return vnode("", {}, [], undefined, node);
  }
}
