import Attributor from "../attributor/attributor";
import AttributorStore from "../attributor/store";
import Scope from "../scope";
import LeafBlot from "./abstract/leaf";
import ParentBlot from "./abstract/parent";

// Shallow object comparison
function isEqual(obj1, obj2) {
  if (Object.keys(obj1).length !== Object.keys(obj2).length) {
    return false;
  }
  // @ts-ignore
  for (const prop in obj1) {
    // @ts-ignore
    if (obj1[prop] !== obj2[prop]) {
      return false;
    }
  }
  return true;
}

class InlineBlot extends ParentBlot {
  static allowedChildren = [InlineBlot, LeafBlot];
  static blotName = "inline";
  static scope = Scope.INLINE_BLOT;
  static tagName = "SPAN";

  static formats(domNode, scroll) {
    const match = scroll.query(InlineBlot.blotName);
    if (match != null && domNode.tagName === match.tagName) {
      return undefined;
    } else if (typeof this.tagName === "string") {
      return true;
    } else if (Array.isArray(this.tagName)) {
      return domNode.tagName.toLowerCase();
    }
    return undefined;
  }

  attributes;

  constructor(scroll, domNode) {
    super(scroll, domNode);
    this.attributes = new AttributorStore(this.domNode);
  }

  format(name, value) {
    if (name === this.statics.blotName && !value) {
      this.children.forEach((child) => {
        if (!(child instanceof InlineBlot)) {
          child = child.wrap(InlineBlot.blotName, true);
        }
        this.attributes.copy(child);
      });
      this.unwrap();
    } else {
      const format = this.scroll.query(name, Scope.INLINE);
      if (format == null) {
        return;
      }
      if (format instanceof Attributor) {
        this.attributes.attribute(format, value);
      } else if (
        value &&
        (name !== this.statics.blotName || this.formats()[name] !== value)
      ) {
        this.replaceWith(name, value);
      }
    }
  }

  formats() {
    const formats = this.attributes.values();
    const format = this.statics.formats(this.domNode, this.scroll);
    if (format != null) {
      formats[this.statics.blotName] = format;
    }
    return formats;
  }

  formatAt(index, length, name, value) {
    if (
      this.formats()[name] != null ||
      this.scroll.query(name, Scope.ATTRIBUTE)
    ) {
      const blot = this.isolate(index, length);
      blot.format(name, value);
    } else {
      super.formatAt(index, length, name, value);
    }
  }

  optimize(context) {
    super.optimize(context);
    const formats = this.formats();
    if (Object.keys(formats).length === 0) {
      return this.unwrap(); // unformatted span
    }
    const next = this.next;
    if (
      next instanceof InlineBlot &&
      next.prev === this &&
      isEqual(formats, next.formats())
    ) {
      next.moveChildren(this);
      next.remove();
    }
  }

  replaceWith(name, value) {
    const replacement = super.replaceWith(name, value);
    this.attributes.copy(replacement);
    return replacement;
  }

  update(mutations, context) {
    super.update(mutations, context);
    const attributeChanged = mutations.some(
      (mutation) =>
        mutation.target === this.domNode && mutation.type === "attributes"
    );
    if (attributeChanged) {
      this.attributes.build();
    }
  }

  wrap(name, value) {
    const wrapper = super.wrap(name, value);
    if (wrapper instanceof InlineBlot) {
      this.attributes.move(wrapper);
    }
    return wrapper;
  }
}

export default InlineBlot;
