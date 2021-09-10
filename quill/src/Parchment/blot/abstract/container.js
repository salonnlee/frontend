import Scope from "../../scope.js";
import ParentBlot from "./parent.js";

class ContainerBlot extends ParentBlot {
  static blotName = "container";
  static scope = Scope.BLOCK_BLOT;
  static tagName;

  prev;
  next;

  checkMerge() {
    return (
      this.next !== null && this.next.statics.blotName === this.statics.blotName
    );
  }
  deleteAt(index, length) {
    super.deleteAt(index, length);
    this.enforceAllowedChildren();
  }
  formatAt(index, length, name, value) {
    super.formatAt(index, length, name, value);
    this.enforceAllowedChildren();
  }
  insertAt(index, value, def) {
    super.insertAt(index, value, def);
    this.enforceAllowedChildren();
  }
  optimize(context) {
    super.optimize(context);
    if (this.children.length > 0 && this.next != null && this.checkMerge()) {
      this.next.moveChildren(this);
      this.next.remove();
    }
  }
}

export default ContainerBlot;
