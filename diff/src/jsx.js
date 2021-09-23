import { h } from "./h";

function flattenAndFilter(
  children /* : JsxVNodeChildren[] */,
  flattened /* : VNode[] */
) /* : VNode[] */ {
  for (const child of children) {
    // filter out falsey children, except 0 since zero can be a valid value e.g inside a chart
    if (
      child !== undefined &&
      child !== null &&
      child !== false &&
      child !== ""
    ) {
      if (Array.isArray(child)) {
        flattenAndFilter(child, flattened);
      } else if (
        typeof child === "string" ||
        typeof child === "number" ||
        typeof child === "boolean"
      ) {
        flattened.push(
          vnode(undefined, undefined, undefined, String(child), undefined)
        );
      } else {
        flattened.push(child);
      }
    }
  }
  return flattened;
}

export function jsx(
  tag /* : string | FunctionComponent */,
  data /* : VNodeData | null */,
  ...children /* : JsxVNodeChildren[] */
) /* : VNode */ {
  const flatChildren = flattenAndFilter(children, []);
  if (typeof tag === "function") {
    // tag is a function component
    return tag(data, flatChildren);
  } else {
    if (
      flatChildren.length === 1 &&
      !flatChildren[0].sel &&
      flatChildren[0].text
    ) {
      // only child is a simple text node, pass as text for a simpler vtree
      return h(tag, data, flatChildren[0].text);
    } else {
      return h(tag, data, flatChildren);
    }
  }
}
