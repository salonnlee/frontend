import LeafBlot from "./abstract/leaf.js";

class EmbedBlot extends LeafBlot {
  static formats(_domNode, _scroll) {
    return undefined;
  }

  format(name, value) {
    // super.formatAt wraps, which is what we want in general,
    // but this allows subclasses to overwrite for formats
    // that just apply to particular embeds
    super.formatAt(0, this.length(), name, value);
  }

  formatAt(index, length, name, value) {
    if (index === 0 && length === this.length()) {
      this.format(name, value);
    } else {
      super.formatAt(index, length, name, value);
    }
  }

  formats() {
    return this.statics.formats(this.domNode, this.scroll);
  }
}

export default EmbedBlot;
