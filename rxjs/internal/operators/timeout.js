import { createErrorClass } from "../util/createErrorClass";

// an error thrown by the `operators/timeout` operator.
export const TimeoutError = createErrorClass(
  (_super) =>
    function TimeoutErrorImpl(info) {
      _super(this);
      this.message = "Timeout has occurred";
      this.name = "TimeoutError";
      this.info = info;
    }
);
