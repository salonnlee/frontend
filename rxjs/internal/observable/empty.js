import { Observable } from "../Observable";

// an observable that emits no items to the Observer
// and immediately emits a complete notification.
export const EMPTY = new Observable((subscriber) => subscriber.complete());
