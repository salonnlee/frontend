class LinkedList {
  head;
  tail;
  length;

  constructor() {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  iterator(curNode = this.head) {
    // TODO use yield when we can
    return () => {
      const ret = curNode;
      if (curNode != null) {
        curNode = curNode.next;
      }
      return ret;
    };
  }

  contains(node) {
    const next = this.iterator();
    let cur = next();
    while (cur) {
      if (cur === node) {
        return true;
      }
      cur = next();
    }
    return false;
  }
  append(...nodes) {
    this.insertBefore(nodes[0], null);
    if (nodes.length > 1) {
      const rest = nodes.slice(1);
      this.append(...rest);
    }
  }
  insertBefore(node, refNode) {
    if (node == null) {
      return;
    }
    this.remove(node);
    node.next = refNode;
    if (refNode != null) {
      node.prev = refNode.prev;
      if (refNode.prev != null) {
        refNode.prev.next = node;
      }
      refNode.prev = node;
      if (refNode === this.head) {
        this.head = node;
      }
    } else if (this.tail != null) {
      this.tail.next = node;
      node.prev = this.tail;
      this.tail = node;
    } else {
      node.prev = null;
      this.head = this.tail = node;
    }
    this.length += 1;
  }
  remove(node) {
    if (!this.contains(node)) {
      return;
    }
    if (node.prev != null) {
      node.prev.next = node.next;
    }
    if (node.next != null) {
      node.next.prev = node.prev;
    }
    if (node === this.head) {
      this.head = node.next;
    }
    if (node === this.tail) {
      this.tail = node.prev;
    }
    this.length -= 1;
  }

  find(offset, inclusive = false) {
    const next = this.iterator();
    let cur = next();
    while (cur) {
      const length = cur.length();
      if (
        offset < length ||
        (inclusive &&
          offset === length &&
          (cur.next == null || cur.next.length() !== 0))
      ) {
        return [cur, offset];
      }
      offset -= length;
      cur = next();
    }
    return [null, 0];
  }

  // at
  indexAt(index) {
    const next = this.iterator();
    let cur = next();
    while (cur && index > 0) {
      index -= 1;
      cur = next();
    }
    return cur;
  }
  indexOf(node) {
    const next = this.iterator();
    let cur = next();
    let index = 0;
    while (cur) {
      if (cur === node) {
        return index;
      }
      index += 1;
      cur = next();
    }
    return -1;
  }
  offsetAt(offset) {
    return this.find(offset, false)[0];
  }
  // offset
  offsetOf(node) {
    const next = this.iterator();
    let cur = next();
    let offset = 0;
    while (cur) {
      if (cur === node) {
        return offset;
      }
      offset += cur.length();
      cur = next();
    }
    return -1;
  }

  forEach(callback) {
    const next = this.iterator();
    let cur = next();
    while (cur) {
      callback(cur);
      cur = next();
    }
  }
  map(callback) {
    return this.reduce((memo, cur) => {
      memo.push(callback(cur));
      return memo;
    }, []);
  }
  reduce(callback, memo) {
    const next = this.iterator();
    let cur = next();
    while (cur) {
      memo = callback(memo, cur);
      cur = next();
    }
    return memo;
  }

  // @TODO
  forEachAt(offset, length, callback) {
    if (length <= 0) {
      return;
    }

    const startOffset = offset;
    const endOffset = offset + length;

    const [startNode, startNodeOffset] = this.find(startOffset);
    let curOffset = startOffset - startNodeOffset;

    // first node
    const next = this.iterator(startNode);
    let cur = next();
    if (cur) {
      const curLength = cur.length();
      callback(
        cur,
        startNodeOffset,
        Math.min(
          curLength - startNodeOffset,
          /* first && last node : endOffset - startOffset = */ length
        )
      );
      curOffset += curLength;
      cur = next();
    } else {
      return;
    }

    while (cur && curOffset < endOffset) {
      const curLength = cur.length();
      callback(
        cur,
        0,
        Math.min(curLength, /* last node */ endOffset - curOffset)
      );
      curOffset += curLength;
      cur = next();
    }
  }
}

export default LinkedList;
