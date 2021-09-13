import LinkedList from "../collection/LinkedList.js";
import ParchmentError from "../error.js";
import Registry from "../registry.js";
import Scope from "../scope.js";
import ContainerBlot from "./abstract/container.js";
import ParentBlot, { makeAttachedBlot } from "./abstract/parent.js";
import BlockBlot from "./block.js";

const OBSERVER_CONFIG = {
  attributes: true,
  characterData: true,
  characterDataOldValue: true,
  childList: true,
  subtree: true
};

const MAX_OPTIMIZE_ITERATIONS = 100;

class ScrollBlot /* extends ParentBlot extends ShadowBlot */ {
  static blotName = "scroll";
  static className;
  static requireContainer;
  static scope = Scope.BLOCK_BLOT;
  static tagName = "DIV";
  static allowedChildren = [BlockBlot, ContainerBlot];
  static defaultChild = BlockBlot;
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
  registry;
  observer;

  constructor(registry, domNode) {
    this.domNode = domNode;
    Registry.blots.set(domNode, this);
    this.prev = null;
    this.next = null;

    this.registry = registry;
    this.scroll = this;
    this.build();
    this.observer = new MutationObserver((mutations) => {
      this.update(mutations);
    });
    this.observer.observe(this.domNode, OBSERVER_CONFIG);
    this.attach();
  }

  create(input, value) {
    return this.registry.create(this, input, value);
  }
  find(node, bubble = false) {
    return this.registry.find(node, bubble);
  }
  query(query, scope = Scope.ANY) {
    return this.registry.query(query, scope);
  }

  length() {
    return this.children.reduce((memo, child) => {
      return memo + child.length();
    }, 0);
  }

  unwrap() {
    if (this.parent) {
      this.moveChildren(this.parent, this.next || undefined);
    }

    this.remove();
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
    this.observer.disconnect();
  }
  deleteAt(index, length) {
    this.update();
    if (index === 0 && length === this.length()) {
      this.children.forEach((child) => {
        child.remove();
      });
    } else {
      if (index === 0 && length === this.length()) {
        return this.remove();
      }

      this.children.forEachAt(index, length, (child, offset, childLength) => {
        child.deleteAt(offset, childLength);
      });
    }
  }
  formatAt(index, length, name, value) {
    this.update();
    this.children.forEachAt(index, length, (child, offset, childLength) => {
      child.formatAt(offset, childLength, name, value);
    });
  }
  insertAt(index, value, def) {
    this.update();
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
  moveChildren(targetParent, refNode) {
    this.children.forEach((child) => {
      targetParent.insertBefore(child, refNode);
    });
  }
  removeChild(child) {
    this.children.remove(child);
  }
  appendChild(other) {
    this.insertBefore(other);
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
  optimize(mutations = [], context = {}) {
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
    const mutationsMap = context.mutationsMap || new WeakMap();
    // We must modify mutations directly, cannot make copy and then modify
    let records = Array.from(this.observer.takeRecords());
    // Array.push currently seems to be implemented by a non-tail recursive function
    // so we cannot just mutations.push.apply(mutations, this.observer.takeRecords());
    while (records.length > 0) {
      mutations.push(records.pop());
    }
    const mark = (blot, markParent = true) => {
      if (blot == null || blot === this) {
        return;
      }
      if (blot.domNode.parentNode == null) {
        return;
      }
      if (!mutationsMap.has(blot.domNode)) {
        mutationsMap.set(blot.domNode, []);
      }
      if (markParent) {
        mark(blot.parent);
      }
    };
    const optimize = (blot) => {
      // Post-order traversal
      if (!mutationsMap.has(blot.domNode)) {
        return;
      }
      if (blot instanceof ParentBlot) {
        blot.children.forEach(optimize);
      }
      mutationsMap.delete(blot.domNode);
      blot.optimize(context);
    };
    let remaining = mutations;
    for (let i = 0; remaining.length > 0; i += 1) {
      if (i >= MAX_OPTIMIZE_ITERATIONS) {
        throw new Error("[Parchment] Maximum optimize iterations reached");
      }
      remaining.forEach((mutation) => {
        const blot = this.find(mutation.target, true);
        if (blot == null) {
          return;
        }
        if (blot.domNode === mutation.target) {
          if (mutation.type === "childList") {
            mark(this.find(mutation.previousSibling, false));
            Array.from(mutation.addedNodes).forEach((node) => {
              const child = this.find(node, false);
              mark(child, false);
              if (child instanceof ParentBlot) {
                child.children.forEach((grandChild) => {
                  mark(grandChild, false);
                });
              }
            });
          } else if (mutation.type === "attributes") {
            mark(blot.prev);
          }
        }
        mark(blot);
      });
      this.children.forEach(optimize);
      remaining = Array.from(this.observer.takeRecords());
      records = remaining.slice();
      while (records.length > 0) {
        mutations.push(records.pop());
      }
    }
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
  update(mutations, context = {}) {
    mutations = mutations || this.observer.takeRecords();
    const mutationsMap = new WeakMap();
    mutations
      .map((mutation) => {
        const blot = Registry.find(mutation.target, true);
        if (blot == null) {
          return null;
        }
        if (mutationsMap.has(blot.domNode)) {
          mutationsMap.get(blot.domNode).push(mutation);
          return null;
        } else {
          mutationsMap.set(blot.domNode, [mutation]);
          return blot;
        }
      })
      .forEach((blot) => {
        if (blot != null && blot !== this && mutationsMap.has(blot.domNode)) {
          blot.update(mutationsMap.get(blot.domNode) || [], context);
        }
      });
    context.mutationsMap = mutationsMap;
    if (mutationsMap.has(this.domNode)) {
      const addedNodes = [];
      const removedNodes = [];
      mutationsMap.get(this.domNode).forEach((mutation) => {
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
    this.optimize(mutations, context);
  }
}

export default ScrollBlot;
