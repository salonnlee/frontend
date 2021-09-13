import LinkedList from "../../collection/LinkedList.js";
import ParchmentError from "../../error.js";
import Scope from "../../scope.js";
import ShadowBlot from "./shadow.js";

export function makeAttachedBlot(node, scroll) {
  let blot = scroll.find(node);
  if (blot == null) {
    try {
      blot = scroll.create(node);
    } catch (e) {
      blot = scroll.create(Scope.INLINE);
      Array.from(node.childNodes).forEach((child) => {
        blot.domNode.appendChild(child);
      });
      if (node.parentNode) {
        node.parentNode.replaceChild(blot.domNode, node);
      }
      blot.attach();
    }
  }
  return blot;
}

class ParentBlot extends ShadowBlot {
  static allowedChildren;
  static defaultChild;
  static uiClass = "";

  children;
  domNode;
  uiNode = null;

  constructor(scroll, domNode) {
    super(scroll, domNode);
    this.build();
  }

  appendChild(other) {
    this.insertBefore(other);
  }

  attach() {
    super.attach();
    this.children.forEach((child) => {
      child.attach();
    });
  }

  attachUI(node) {
    if (this.uiNode != null) {
      this.uiNode.remove();
    }

    this.uiNode = node;

    if (ParentBlot.uiClass) {
      this.uiNode.classList.add(ParentBlot.uiClass);
    }

    this.uiNode.setAttribute("contenteditable", "false");
    this.domNode.insertBefore(this.uiNode, this.domNode.firstChild);
  }

  build() {
    this.children = new LinkedList(); // Need to be reversed for if DOM nodes already in order

    Array.from(this.domNode.childNodes)
      .filter((node) => node !== this.uiNode)
      .reverse()
      .forEach((node) => {
        try {
          const child = makeAttachedBlot(node, this.scroll);
          this.insertBefore(child, this.children.head || undefined);
        } catch (err) {
          if (err instanceof ParchmentError) {
            return;
          } else {
            throw err;
          }
        }
      });
  }

  deleteAt(index, length) {
    if (index === 0 && length === this.length()) {
      return this.remove();
    }

    this.children.forEachAt(index, length, (child, offset, childLength) => {
      child.deleteAt(offset, childLength);
    });
  }

  descendant(criteria, index = 0) {
    const [child, offset] = this.children.find(index);

    if (
      (criteria.blotName == null && criteria(child)) ||
      (criteria.blotName != null && child instanceof criteria)
    ) {
      return [child, offset];
    } else if (child instanceof ParentBlot) {
      return child.descendant(criteria, offset);
    } else {
      return [null, -1];
    }
  }

  descendants(criteria, index = 0, length = Number.MAX_VALUE) {
    let descendants = [];
    let lengthLeft = length;
    this.children.forEachAt(index, length, (child, childIndex, childLength) => {
      if (
        (criteria.blotName == null && criteria(child)) ||
        (criteria.blotName != null && child instanceof criteria)
      ) {
        descendants.push(child);
      }

      if (child instanceof ParentBlot) {
        descendants = descendants.concat(
          child.descendants(criteria, childIndex, lengthLeft)
        );
      }

      lengthLeft -= childLength;
    });
    return descendants;
  }

  detach() {
    this.children.forEach((child) => {
      child.detach();
    });
    super.detach();
  }

  enforceAllowedChildren() {
    let done = false;
    this.children.forEach((child) => {
      if (done) {
        return;
      }

      const allowed = this.statics.allowedChildren.some(
        (def) => child instanceof def
      );

      if (allowed) {
        return;
      }

      if (child.statics.scope === Scope.BLOCK_BLOT) {
        if (child.next != null) {
          this.splitAfter(child);
        }

        if (child.prev != null) {
          this.splitAfter(child.prev);
        }

        child.parent.unwrap();
        done = true;
      } else if (child instanceof ParentBlot) {
        child.unwrap();
      } else {
        child.remove();
      }
    });
  }

  formatAt(index, length, name, value) {
    this.children.forEachAt(index, length, (child, offset, childLength) => {
      child.formatAt(offset, childLength, name, value);
    });
  }

  insertAt(index, value, def) {
    const [child, offset] = this.children.find(index);

    if (child) {
      child.insertAt(offset, value, def);
    } else {
      const blot =
        def == null
          ? this.scroll.create("text", value)
          : this.scroll.create(value, def);
      this.appendChild(blot);
    }
  }

  insertBefore(childBlot, refBlot) {
    if (childBlot.parent != null) {
      childBlot.parent.children.remove(childBlot);
    }

    let refDomNode = null;
    this.children.insertBefore(childBlot, refBlot || null);
    childBlot.parent = this;

    if (refBlot != null) {
      refDomNode = refBlot.domNode;
    }

    if (
      this.domNode.parentNode !== childBlot.domNode ||
      this.domNode.nextSibling !== refDomNode
    ) {
      this.domNode.insertBefore(childBlot.domNode, refDomNode);
    }

    childBlot.attach();
  }

  length() {
    return this.children.reduce((memo, child) => {
      return memo + child.length();
    }, 0);
  }

  moveChildren(targetParent, refNode) {
    this.children.forEach((child) => {
      targetParent.insertBefore(child, refNode);
    });
  }

  optimize(context) {
    super.optimize(context);
    this.enforceAllowedChildren();

    if (this.uiNode != null && this.uiNode !== this.domNode.firstChild) {
      this.domNode.insertBefore(this.uiNode, this.domNode.firstChild);
    }

    if (this.children.length === 0) {
      if (this.statics.defaultChild != null) {
        const child = this.scroll.create(this.statics.defaultChild.blotName);
        this.appendChild(child); // TODO double check if necessary
        // child.optimize(context);
      } else {
        this.remove();
      }
    }
  }

  path(index, inclusive = false) {
    const [child, offset] = this.children.find(index, inclusive);
    const position = [[this, index]];

    if (child instanceof ParentBlot) {
      return position.concat(child.path(offset, inclusive));
    } else if (child != null) {
      position.push([child, offset]);
    }

    return position;
  }

  removeChild(child) {
    this.children.remove(child);
  }

  replaceWith(name, value) {
    const replacement =
      typeof name === "string" ? this.scroll.create(name, value) : name;

    if (replacement instanceof ParentBlot) {
      this.moveChildren(replacement);
    }

    return super.replaceWith(replacement);
  }

  split(index, force = false) {
    if (!force) {
      if (index === 0) {
        return this;
      }

      if (index === this.length()) {
        return this.next;
      }
    }

    const after = this.clone();

    if (this.parent) {
      this.parent.insertBefore(after, this.next || undefined);
    }

    this.children.forEachAt(index, this.length(), (child, offset, _length) => {
      const split = child.split(offset, force);

      if (split != null) {
        after.appendChild(split);
      }
    });
    return after;
  }

  splitAfter(child) {
    const after = this.clone();

    while (child.next != null) {
      after.appendChild(child.next);
    }

    if (this.parent) {
      this.parent.insertBefore(after, this.next || undefined);
    }

    return after;
  }

  unwrap() {
    if (this.parent) {
      this.moveChildren(this.parent, this.next || undefined);
    }

    this.remove();
  }

  update(mutations, _context) {
    const addedNodes = [];
    const removedNodes = [];
    mutations.forEach((mutation) => {
      if (mutation.target === this.domNode && mutation.type === "childList") {
        addedNodes.push(...mutation.addedNodes);
        removedNodes.push(...mutation.removedNodes);
      }
    });
    removedNodes.forEach((node) => {
      // Check node has actually been removed
      // One exception is Chrome does not immediately remove IFRAMEs
      // from DOM but MutationRecord is correct in its reported removal
      if (
        node.parentNode != null && // @ts-ignore
        node.tagName !== "IFRAME" &&
        document.body.compareDocumentPosition(node) &
          Node.DOCUMENT_POSITION_CONTAINED_BY
      ) {
        return;
      }

      const blot = this.scroll.find(node);

      if (blot == null) {
        return;
      }

      if (
        blot.domNode.parentNode == null ||
        blot.domNode.parentNode === this.domNode
      ) {
        blot.detach();
      }
    });
    addedNodes
      .filter((node) => {
        return node.parentNode === this.domNode || node === this.uiNode;
      })
      .sort((a, b) => {
        if (a === b) {
          return 0;
        }

        if (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) {
          return 1;
        }

        return -1;
      })
      .forEach((node) => {
        let refBlot = null;

        if (node.nextSibling != null) {
          refBlot = this.scroll.find(node.nextSibling);
        }

        const blot = makeAttachedBlot(node, this.scroll);

        if (blot.next !== refBlot || blot.next == null) {
          if (blot.parent != null) {
            blot.parent.removeChild(this);
          }

          this.insertBefore(blot, refBlot || undefined);
        }
      });
    this.enforceAllowedChildren();
  }
}

export default ParentBlot;
