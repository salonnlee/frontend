import Scope from "../../scope.js";
import ShadowBlot from "./shadow.js";

class LeafBlot extends ShadowBlot {
  static scope = Scope.INLINE_BLOT;
  static value(_domNode) {
    return true;
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
}

export default LeafBlot;
