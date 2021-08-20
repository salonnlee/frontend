import { cloneDeep, isEqual } from "lodash";

let AttributeMap;

(function (_AttributeMap) {
  function compose(a, b, keepNull) {
    if (typeof a !== "object") a = {};
    if (typeof b !== "object") b = {};
    let attributes = cloneDeep(b);
    if (!keepNull) {
      attributes = Object.keys(attributes).reduce((copy, key) => {
        if (attributes[key] != null) {
          copy[key] = attributes[key];
        }
        return copy;
      }, {});
    }
    for (const key in a) {
      if (a[key] !== undefined && b[key] === undefined) {
        attributes[key] = a[key];
      }
    }
    return Object.keys(attributes).length > 0 ? attributes : undefined;
  }
  _AttributeMap.compose = compose;

  function diff(a, b) {
    if (typeof a !== "object") a = {};
    if (typeof b !== "object") b = {};
    const attributes = Object.keys(a)
      .concat(Object.keys(b))
      .reduce((attrs, key) => {
        if (!isEqual(a[key], b[key])) {
          attrs[key] = b[key] === undefined ? null : b[key];
        }
        return attrs;
      }, {});
    return Object.keys(attributes).length > 0 ? attributes : undefined;
  }
  _AttributeMap.diff = diff;

  function invert(attr, base) {
    attr = attr || {};
    const baseInverted = Object.keys(base).reduce((memo, key) => {
      if (base[key] !== attr[key] && attr[key] !== undefined) {
        memo[key] = base[key];
      }
      return memo;
    }, {});
    return Object.keys(attr).reduce((memo, key) => {
      if (attr[key] !== base[key] && base[key] === undefined) {
        memo[key] = null;
      }
      return memo;
    }, baseInverted);
  }
  _AttributeMap.invert = invert;

  function transform(a, b, priority = false) {
    if (typeof a !== "object") return b;
    if (typeof b !== "object") return undefined;
    if (!priority) return b;
    const attributes = Object.keys(b).reduce((attrs, key) => {
      if (a[key] === undefined) {
        attrs[key] = b[key];
      }
      return attrs;
    }, {});
    return Object.keys(attributes).length > 0 ? attributes : undefined;
  }
  _AttributeMap.transform = transform;
})(AttributeMap || (AttributeMap = {}));

export default AttributeMap;
