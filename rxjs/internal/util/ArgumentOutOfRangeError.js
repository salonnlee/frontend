import { createErrorClass } from "./createErrorClass";

// an error thrown when an element was queried at a certain index of an Observable
// but no such index or position exists in that sequence.
export const ArgumentOutOfRangeError = createErrorClass(
  (_super) =>
    function ArgumentOutOfRangeErrorImpl() {
      _super(this);
      this.name = "ArgumentOutOfRangeError";
      this.message = "argument out of range";
    }
);
