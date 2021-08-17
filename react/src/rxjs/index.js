import { Subject } from "rxjs";

const subject = new Subject();

subject.subscribe({
  next: (x) => console.log(`observerA: ${x}`)
});
subject.subscribe({
  next: (x) => console.log(`observerB: ${x}`)
});

subject.next(1);
subject.next(2);

// observerA: 1
// observerB: 1
// observerA: 2
// observerB: 2
