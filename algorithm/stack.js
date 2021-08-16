// 基于数组实现的顺序栈
class StackBasedArray {
  // 初始化数组，申请一个大小为n的数组空间
  constructor(n) {
    this.items = []; // 数组
    this.n = n; // 栈的大小
    this.count = 0; // 栈中元素个数
  }
  // 入栈操作
  push(item) {
    // 数组空间不足，直接返回false，入栈失败
    if (this.count === this.n) return false;
    this.items[this.count] = item;
    ++this.count;
    return true;
  }
  // 出栈操作
  pop() {
    // 栈为空，则直接返回null
    if (this.count === 0) return null;
    const tmp = this.items[this.count - 1];
    --this.count;
    return tmp;
  }
}

class Node {
  constructor(element) {
    this.element = element;
    this.next = null;
  }
}

// 基于链表实现的链式栈
class StackBasedLinkedList {
  constructor() {
    this.top = null;
  }
  push(value) {
    const node = new Node(value);
    if (this.top !== null) {
      node.next = this.top;
    }
    this.top = node;
  }
  pop() {
    if (this.top === null) {
      return -1;
    }
    const value = this.top.element;
    this.top = this.top.next;
    return value;
  }
  clear() {
    this.top = null;
  }
  display() {
    if (this.top !== null) {
      let temp = this.top;
      while (temp !== null) {
        console.log(temp.element);
        temp = temp.next;
      }
    }
  }
}

function main() {
  const a = 1;
  let ret = 0;
  let res = 0;
  ret = add(3, 5);
  res = a + ret;
  console.log(res);
}

function add(x, y) {
  let sum = 0;
  sum = x + y;
  return sum;
}

main();
