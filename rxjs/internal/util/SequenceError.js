import { createErrorClass } from "./createErrorClass";

// an error thrown when something is wrong with the sequence of
// values arriving on the observable.
export const SequenceError = createErrorClass(
  (_super) =>
    function SequenceErrorImpl(message) {
      _super(this);
      this.name = "SequenceError";
      this.message = message;
    }
);
