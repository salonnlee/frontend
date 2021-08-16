// 基于数组实现的队列
class QueueBasedArray {
  constructor(n) {
    this.head = 0;
    this.tail = 0;
    this.items = [];
    this.n = n;
  }
  // 入队
  enqueue(item) {
    // 如果tail === n表示队列已经满了
    if (this.tail === this.n) return false;
    this.items[this.tail] = item;
    ++this.tail;
    return true;
  }
  // 出队
  dequeue() {
    // 如果head === tail表示队列为空
    if (this.head === this.tail) return null;
    const ret = this.items[this.head];
    ++head;
    return ret;
  }
}

class Node {
  constructor(element) {
    this.element = element;
    this.next = null;
  }
}

// 基于链表实现的队列
class QueueBasedLinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
  }
  enqueue(item) {
    // tail === n 表示队列末尾没有空间了
    if (this.tail === n) {
      // tail === n && head === 0 表示整个队列都占满了
      if (this.head === 0) return false;
      // 数据搬移
      for (let i = this.head; i < tail; ++i) {
        this.items[i - this.head] = this.items[i];
      }
      // 搬移完后重新更新head和tail
      this.tail -= this.head;
      this.head = 0;
    }
    this.items[tail] = item;
    ++tail;
    return true;
  }
  dequeue() {
    if (this.head !== null) {
      const value = this.head.element;
      this.head = this.head.next;
      return value;
    } else {
      return -1;
    }
  }
}
