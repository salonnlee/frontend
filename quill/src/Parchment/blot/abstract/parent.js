import LinkedList from "../../collection/LinkedList.js";
import ParchmentError from "../../error.js";
import Registry from "../../registry.js";
import Scope from "../../scope.js";

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

class ParentBlot /* extends ShadowBlot */ {
  static blotName = "abstract";
  static className;
  static requiredContainer;
  static scope;
  static tagName;
  static allowedChildren;
  static defaultChild;
  static uiClass = "";

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

  prev;
  next;
  parent;
  children;
  domNode;
  uiNode = null;

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
    this.build();
  }

  length() {
    return this.children.reduce((memo, child) => {
      return memo + child.length();
    }, 0);
  }
  offset(root = this.parent) {
    if (this.parent == null || this === root) {
      return 0;
    }
    return this.parent.children.offset(this) + this.parent.offset(root);
  }

  attach() {
    this.children.forEach((child) => {
      child.attach();
    });
  }
  detach() {
    this.children.forEach((child) => {
      child.detach();
    });
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
  unwrap() {
    if (this.parent) {
      this.moveChildren(this.parent, this.next || undefined);
    }

    this.remove();
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
  deleteAt(index, length) {
    if (index === 0 && length === this.length()) {
      return this.remove();
    }

    this.children.forEachAt(index, length, (child, offset, childLength) => {
      child.deleteAt(offset, childLength);
    });
  }
  replaceWith(name, value) {
    const replacement =
      typeof name === "string" ? this.scroll.create(name, value) : name;

    if (replacement instanceof ParentBlot) {
      this.moveChildren(replacement);
    }

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

  appendChild(other) {
    this.insertBefore(other);
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

  moveChildren(targetParent, refNode) {
    this.children.forEach((child) => {
      targetParent.insertBefore(child, refNode);
    });
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

  formatAt(index, length, name, value) {
    this.children.forEachAt(index, length, (child, offset, childLength) => {
      child.formatAt(offset, childLength, name, value);
    });
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
