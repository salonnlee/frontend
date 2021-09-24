import { createErrorClass } from "./createErrorClass";

// an error thrown when a value or values are missing from an observable sequence.
export const NotFoundError = createErrorClass(
  (_super) =>
    function NotFoundErrorImpl(message) {
      _super(this);
      this.name = "NotFoundError";
      this.message = message;
    }
);
