import Iterator from "./Iterator.js";

let Op;

(function (_Op) {
  function iterator(ops) {
    return new Iterator(ops);
  }
  _Op.iterator = iterator;

  function length(op) {
    if (typeof op.delete === "number") {
      return op.delete;
    } else if (typeof op.retain === "number") {
      return op.retain;
    } else {
      return typeof op.insert === "string" ? op.insert.length : 1;
    }
  }
  _Op.length = length;
})(Op || (Op = {}));

export default Op;
