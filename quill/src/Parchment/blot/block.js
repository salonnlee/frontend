import Attributor from "../attributor/attributor";
import AttributorStore from "../attributor/store";
import Scope from "../scope";
import LeafBlot from "./abstract/leaf";
import ParentBlot from "./abstract/parent";
import InlineBlot from "./inline";

class BlockBlot extends ParentBlot {
  static blotName = "block";
  static scope = Scope.BLOCK_BLOT;
  static tagName = "P";
  static allowedChildren = [InlineBlot, BlockBlot, LeafBlot];

  static formats(domNode, scroll) {
    const match = scroll.query(BlockBlot.blotName);
    if (match != null && domNode.tagName === match.tagName) {
      return undefined;
    } else if (typeof this.tagName === "string") {
      return true;
    } else if (Array.isArray(this.tagName)) {
      return domNode.tagName.toLowerCase();
    }
  }

  attributes;

  constructor(scroll, domNode) {
    super(scroll, domNode);
    this.attributes = new AttributorStore(this.domNode);
  }

  format(name, value) {
    const format = this.scroll.query(name, Scope.BLOCK);
    if (format == null) {
      return;
    } else if (format instanceof Attributor) {
      this.attributes.attribute(format, value);
    } else if (name === this.statics.blotName && !value) {
      this.replaceWith(BlockBlot.blotName);
    } else if (
      value &&
      (name !== this.statics.blotName || this.formats()[name] !== value)
    ) {
      this.replaceWith(name, value);
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
    if (this.scroll.query(name, Scope.BLOCK) != null) {
      this.format(name, value);
    } else {
      super.formatAt(index, length, name, value);
    }
  }

  insertAt(index, value, def) {
    if (def == null || this.scroll.query(value, Scope.INLINE) != null) {
      // Insert text or inline
      super.insertAt(index, value, def);
    } else {
      const after = this.split(index);
      if (after != null) {
        const blot = this.scroll.create(value, def);
        after.parent.insertBefore(blot, after);
      } else {
        throw new Error("Attempt to insertAt after block boundaries");
      }
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
}

export default BlockBlot;
