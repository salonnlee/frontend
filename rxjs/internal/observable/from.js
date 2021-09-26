import { scheduled } from "../scheduled/scheduled";
import { innerFrom } from "./innerFrom";

// creates an Observable from an Array, an array-like object, a Promise,
// an iterable object, or an Observable-like object
export function from(input, scheduler) {
  return scheduler ? scheduled(input, scheduler) : innerFrom(input);
}
