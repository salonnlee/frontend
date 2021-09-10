import Registry from "../registry.js";
import Scope from "../scope.js";
import ContainerBlot from "./abstract/container.js";
import ParentBlot from "./abstract/parent.js";
import BlockBlot from "./block.js";

const OBSERVER_CONFIG = {
  attributes: true,
  characterData: true,
  characterDataOldValue: true,
  childList: true,
  subtree: true
};

const MAX_OPTIMIZE_ITERATIONS = 100;

class ScrollBlot extends ParentBlot {
  static blotName = "scroll";
  static defaultChild = BlockBlot;
  static allowedChildren = [BlockBlot, ContainerBlot];
  static scope = Scope.BLOCK_BLOT;
  static tagName = "DIV";

  registry;
  observer;

  constructor(registry, node) {
    super(null, node);
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

  build() {
    if (this.scroll == null) {
      return;
    }
    super.build();
  }

  detach() {
    super.detach();
    this.observer.disconnect();
  }

  deleteAt(index, length) {
    this.update();
    if (index === 0 && length === this.length()) {
      this.children.forEach((child) => {
        child.remove();
      });
    } else {
      super.deleteAt(index, length);
    }
  }

  formatAt(index, length, name, value) {
    this.update();
    super.formatAt(index, length, name, value);
  }

  insertAt(index, value, def) {
    this.update();
    super.insertAt(index, value, def);
  }

  optimize(mutations = [], context = {}) {
    super.optimize(context);
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
      super.update(mutationsMap.get(this.domNode), context);
    }
    this.optimize(mutations, context);
  }
}

export default ScrollBlot;
