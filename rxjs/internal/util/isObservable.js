import { Observable } from "../Observable";
import { isFunction } from "./isFunction";

// tests to see if the object is an RxJS `Observable`
export function isObservable(obj) {
  return (
    !!obj &&
    (obj instanceof Observable ||
      (isFunction(obj.lift) && isFunction(obj.subscribe)))
  );
}
