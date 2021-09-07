import Attributor from "./attributor";

function camelize(name) {
  const parts = name.split("-");
  const rest = parts
    .slice(1)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join("");
  return parts[0] + rest;
}

class StyleAttributor extends Attributor {
  static keys(node) {
    return (node.getAttribute("style") || "").split(";").map((value) => {
      const arr = value.split(":");
      return arr[0].trim();
    });
  }

  add(node, value) {
    if (!this.canAdd(node, value)) {
      return false;
    }
    node.style[camelize(this.keyName)] = value;
    return true;
  }

  remove(node) {
    node.style[camelize(this.keyName)] = "";
    if (!node.getAttribute("style")) {
      node.removeAttribute("style");
    }
  }

  value(node) {
    const value = node.style[camelize(this.keyName)];
    return this.canAdd(node, value) ? value : "";
  }
}

export default StyleAttributor;
