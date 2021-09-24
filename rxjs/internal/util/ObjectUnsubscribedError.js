import { createErrorClass } from "./createErrorClass";

// an error thrown when an action is invalid because the object has been unsubscribed.
export const ObjectUnsubscribedError = createErrorClass(
  (_super) =>
    function ObjectUnsubscribedErrorImpl() {
      _super(this);
      this.name = "ObjectUnsubscribedError";
      this.message = "object unsubscribed";
    }
);
