import { createErrorClass } from "./createErrorClass";

// an error thrown when an Observable or a sequence was queried
// but has no elements.
export const EmptyError = createErrorClass(
  (_super) =>
    function EmptyErrorImpl() {
      _super(this);
      this.name = "EmptyError";
      this.message = "no elements in sequence";
    }
);
