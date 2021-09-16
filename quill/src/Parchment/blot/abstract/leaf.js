import ParchmentError from "../../error.js";
import Registry from "../../registry.js";
import Scope from "../../scope.js";

class LeafBlot /* extends ShadowBlot */ {
  static blotName = "abstract";
  static className;
  static requiredContainer;
  static scope = Scope.INLINE_BLOT;
  static tagName;

  static create(value) {
    if (this.tagName == null) {
      throw new ParchmentError("Blot definition missing tagName");
    }
    let node;
    if (Array.isArray(this.tagName)) {
      // tagName: string[]
      if (typeof value === "string") {
        value = value.toUpperCase();
        if (parseInt(value, 10).toString() === value) {
          value = parseInt(value, 10);
        }
      }
      if (typeof value === "number") {
        // value: number
        node = document.createElement(this.tagName[value - 1]);
      } else if (this.tagName.indexOf(value) > -1) {
        // value: string
        node = document.createElement(value);
      } else {
        // value: !number & !string
        node = document.createElement(this.tagName[0]);
      }
    } else {
      // tagName: string
      node = document.createElement(this.tagName);
    }
    return node;
  }
  static value(_domNode) {
    return true;
  }

  prev;
  next;
  parent;

  // Hack for accessing inherited static methods
  get statics() {
    return this.constructor;
  }
  constructor(scroll, domNode) {
    this.scroll = scroll;
    this.domNode = domNode;
    Registry.blots.set(domNode, this);
    this.prev = null;
    this.next = null;
  }

  index(node, offset) {
    if (
      this.domNode === node ||
      this.domNode.compareDocumentPosition(node) &
        Node.DOCUMENT_POSITION_CONTAINED_BY
    ) {
      return Math.min(offset, 1);
    }
    return -1;
  }
  position(index, _inclusive) {
    const childNodes = Array.from(this.parent.domNode.childNodes);
    let offset = childNodes.indexOf(this.domNode);
    if (index > 0) {
      offset += 1;
    }
    return [this.parent.domNOde, offset];
  }
  value() {
    return {
      [this.statics.blotName]: this.statics.value(this.domNode) || true
    };
  }
  length() {
    return 1;
  }
  offset(root = this.parent) {
    if (this.parent == null || this === root) {
      return 0;
    }
    return this.parent.children.offset(this) + this.parent.offset(root);
  }

  attach() {
    // Nothing to do
  }
  detach() {
    if (this.parent != null) {
      this.parent.removeChild(this);
    }
    Registry.blots.delete(this.domNode);
  }

  clone() {
    const domNode = this.domNode.cloneNode(false);
    return this.scroll.create(domNode);
  }
  wrap(name, value) {
    const wrapper =
      typeof name === "string" ? this.scroll.create(name, value) : name;
    if (this.parent != null) {
      this.parent.insertBefore(wrapper, this.next || undefined);
    }
    if (typeof wrapper.appendChild !== "function") {
      throw new ParchmentError(`Cannot wrap ${name}`);
    }
    wrapper.appendChild(this);
    return wrapper;
  }

  insertAt(index, value, def) {
    const blot =
      def == null
        ? this.scroll.create("text", value)
        : this.scroll.create(value, def);
    const ref = this.split(index);
    this.parent.insertBefore(blot, ref || undefined);
  }
  deleteAt(index, length) {
    const blot = this.isolate(index, length);
    blot.remove();
  }
  replaceWith(name, value) {
    const replacement =
      typeof name === "string" ? this.scroll.create(name, value) : name;
    if (this.parent != null) {
      this.parent.insertBefore(replacement, this.next || undefined);
      this.remove();
    }
    return replacement;
  }

  isolate(index, length) {
    const target = this.split(index);
    if (target == null) {
      throw new Error("Attempt to isolate at end");
    }
    target.split(length);
    return target;
  }
  remove() {
    if (this.domNode.parentNode != null) {
      this.domNode.parentNode.removeChild(this.domNode);
    }
    this.detach();
  }

  optimize(_context) {
    if (
      this.statics.requiredContainer &&
      !(this.parent instanceof this.statics.requiredContainer)
    ) {
      this.wrap(this.statics.requiredContainer.blotName);
    }
  }

  split(index, _force) {
    return index === 0 ? this : this.next();
  }

  formatAt(index, length, name, value) {
    const blot = this.isolate(index, length);
    if (this.scroll.query(name, Scope.BLOT) != null && value) {
      blot.wrap(name, value);
    } else if (this.scroll.query(name, Scope.ATTRIBUTE) != null) {
      const parent = this.scroll.create(this.statics.scope);
      blot.wrap(parent);
      parent.format(name, value);
    }
  }

  update(_mutations, _context) {
    // Nothing to do by default
  }
}

export default LeafBlot;
