import { Observable } from "../Observable";
import { noop } from "../util/noop";

// an observable that emits no items to the Observer
// and never completes.
export const NEVER = new Observable(noop);
