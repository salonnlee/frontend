import ParchmentError from "./error.js";
import Scope from "./scope.js";

export default class Registry {
  static blots = new WeakMap();

  static find(node, bubble) {
    if (node == null) {
      return null;
    }
    if (this.blots.has(node)) {
      return this.blots.get(node) || null;
    }
    if (bubble) {
      return this.find(node.parentNode, bubble);
    }
    return null;
  }

  attributes = {};
  classes = {};
  tags = {};
  types = {};

  create(scroll, input, value) {
    const match = this.query(input);
    if (match == null) {
      throw new ParchmentError(`Unable to create ${input} blot`);
    }
    const blotClass = match;
    const node =
      input instanceof Node || input.nodeType === Node.TEXT_NODE
        ? input
        : blotClass.create(value);

    const blot = new blotClass(scroll, node, value);
    Registry.blots.set(blot.domNode, blot);
    return blot;
  }
  find(node, bubble = false) {
    return Registry.find(node, bubble);
  }
  query(query, scope = Scope.ANY) {
    let match;
    if (typeof query === "string") {
      match = this.types[query] || this.attributes[query];
    } else if (query instanceof Text || query.nodeType === Node.TEXT_NODE) {
      match = this.types.text;
    } else if (typeof query === "number") {
      if (query & Scope.LEVEL & Scope.BLOCK) {
        match = this.types.block;
      } else if (query & Scope.LEVEL & Scope.INLINE) {
        match = this.types.inline;
      }
    } else if (query instanceof HTMLElement) {
      const names = (query.getAttribute("class") || "").split(/\s+/);
      names.some((name) => {
        match = this.classes[name];
        if (match) {
          return true;
        }
        return false;
      });
      match = match || this.tags[query.tagName];
    }
    if (match == null) {
      return null;
    }
    if (scope & Scope.LEVEL & match.scope && scope & Scope.TYPE & match.scope) {
      return match;
    }
    return null;
  }
  register(...definitions) {
    if (definitions.length > 1) {
      return definitions.map((d) => {
        return this.register(d);
      });
    }
    const definition = definitions[0];
    if (
      typeof definition.blotName !== "string" &&
      typeof definition.attrName !== "string"
    ) {
      throw new ParchmentError("Invalid definition");
    } else if (definition.blotName === "abstract") {
      throw new ParchmentError("Cannot register abstract class");
    }
    this.types[definition.blotName || definition.attrName] = definition;
    if (typeof definition.keyName === "string") {
      this.attributes[definition.keyName] = definition;
    } else {
      if (definition.className != null) {
        this.classes[definition.className] = definition;
      }
      if (definition.tagName != null) {
        if (Array.isArray(definition.tagName)) {
          definition.tagName = definition.tagName.map((tagName) => {
            return tagName.toUpperCase();
          });
        } else {
          definition.tagName = definition.tagName.toUpperCase();
        }
        const tagNames = Array.isArray(definition.tagName)
          ? definition.tagName
          : [definition.tagName];
        tagNames.forEach((tag) => {
          if (this.tags[tag] == null || definition.className == null) {
            this.tags[tag] = definition;
          }
        });
      }
    }
    return definition;
  }
}
