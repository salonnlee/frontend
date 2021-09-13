import ParchmentError from "../error.js";
import Registry from "../registry.js";
import Scope from "../scope.js";

class TextBlot /* extends LeafBlot extends ShadowBlot */ {
  static blotName = "text";
  static className;
  static requiredContainer;
  static scope = Scope.INLINE_BLOT;
  static tagName;

  static create(value) {
    return document.createTextNode(value);
  }
  static value(domNode) {
    return domNode.data;
  }

  prev;
  next;
  parent;
  domNode;
  text;

  get statics() {
    return this.constructor;
  }

  constructor(scroll, domNode) {
    this.scroll = scroll;
    this.domNode = domNode;
    Registry.blots.set(domNode, this);
    this.prev = null;
    this.next = null;

    this.text = this.statics.value(this.domNode);
  }

  value() {
    return this.text;
  }
  length() {
    return this.text.length;
  }
  index(node, offset) {
    if (this.domNode === node) {
      return offset;
    }
    return -1;
  }
  offset(root = this.parent) {
    if (this.parent == null || this === root) {
      return 0;
    }
    return this.parent.children.offset(this) + this.parent.offset(root);
  }
  position(index, _inclusive = false) {
    return [this.domNode, index];
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
    if (def == null) {
      this.text = this.text.slice(0, index) + value + this.text.slice(index);
      this.domNode.data = this.text;
    } else {
      const blot =
        def == null
          ? this.scroll.create("text", value)
          : this.scroll.create(value, def);
      const ref = this.split(index);
      this.parent.insertBefore(blot, ref || undefined);
    }
  }
  deleteAt(index, length) {
    this.domNode.data = this.text =
      this.text.slice(0, index) + this.text.slice(index + length);
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

  optimize(context) {
    if (
      this.statics.requiredContainer &&
      !(this.parent instanceof this.statics.requiredContainer)
    ) {
      this.wrap(this.statics.requiredContainer.blotName);
    }

    if (
      this.statics.requiredContainer &&
      !(this.parent instanceof this.statics.requiredContainer)
    ) {
      this.wrap(this.statics.requiredContainer.blotName);
    }
    if (this.text.length === 0) {
      this.remove();
    } else if (this.next instanceof TextBlot && this.next.prev === this) {
      this.insertAt(this.length(), this.next.value());
      this.next.remove();
    }
  }
  split(index, force) {
    if (!force) {
      if (index === 0) {
        return this;
      }
      if (index === this.length()) {
        return this.next;
      }
    }
    const after = this.scroll.create(this.domNode.splitText(index));
    this.parent.insertBefore(after, this.next || undefined);
    this.text = this.statics.value(this.domNode);
    return after;
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
  update(mutations, _context) {
    if (
      mutations.some((mutation) => {
        return (
          mutation.type === "characterData" && mutation.target === this.domNode
        );
      })
    ) {
      this.text = this.statics.value(this.domNode);
    }
  }
}

export default TextBlot;
