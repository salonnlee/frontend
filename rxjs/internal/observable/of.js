import { popScheduler } from "../util/args";
import { from } from "./from";

// converts the arguments to an observable sequence.
export function of(...args) {
  const scheduler = popScheduler(args);
  return from(args, scheduler);
}
