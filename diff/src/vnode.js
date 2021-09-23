export function vnode(
  sel /* : string | undefined */,
  data /* : any | undefined */,
  children /* : Array<VNode, string> | undefined */,
  text /* : string | undefined */,
  elm /* : Element | Text | undefined */
) /* : VNode */ {
  const key = data === undefined ? undefined : data.key;
  return { sel, data, children, text, elm, key };
}
