import { from, Subject } from "rxjs";
import { multicast } from "rxjs/operators";

const source = from([1, 2]);
const subject = new Subject();
const multicasted = source.pipe(multicast(subject));

// subject.subscribe({...})
multicasted.subscribe({
  next: (x) => console.log(`observerA: ${x}`)
});
multicasted.subscribe({
  next: (x) => console.log(`observerB: ${x}`)
});

// source.subscribe(subject)
multicasted.connect();
