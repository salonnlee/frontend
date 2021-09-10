import Registry from "../registry.js";
import Scope from "../scope.js";
import Attributor from "./attributor.js";
import ClassAttributor from "./class.js";
import StyleAttributor from "./style.js";

class AttributorStore {
  attributes = {};
  domNode;

  constructor(domNode) {
    this.domNode = domNode;
    this.build();
  }

  build() {
    this.attributes = {};
    const blot = Registry.find(this.domNode);
    if (blot == null) {
      return;
    }
    const attributes = Attributor.keys(this.domNode);
    const classes = ClassAttributor.keys(this.domNode);
    const styles = StyleAttributor.keys(this.domNode);
    attributes
      .concat(classes)
      .concat(styles)
      .forEach((name) => {
        const attr = blot.scroll.query(name, Scope.ATTRIBUTE);
        if (attr instanceof Attributor) {
          this.attributes[attr.attrName] = attr;
        }
      });
  }
  attribute(attribute, value) {
    // verb
    if (value) {
      if (attribute.add(this.domNode, value)) {
        this.attributes[attribute.attrName] = attribute;
      } else {
        delete this.attributes[attribute.attrName];
      }
    } else {
      attribute.remove(this.domNode);
      delete this.attributes[attribute.attrName];
    }
  }
  values() {
    return Object.keys(this.attributes).reduce((attributes, name) => {
      attributes[name] = this.attributes[name].value(this.domNode);
      return attributes;
    }, {});
  }

  copy(target) {
    Object.keys(this.attributes).forEach((key) => {
      const value = this.attributes[key].value(this.domNode);
      target.format(key, value);
    });
  }
  move(target) {
    this.copy(target);
    Object.keys(this.attributes).forEach((key) => {
      this.attributes[key].remove(this.domNode);
    });
    this.attributes = {};
  }
}

export default AttributorStore;
