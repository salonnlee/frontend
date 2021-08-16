// import { Observable } from "rxjs";

// const observable = Observable.create((observer) => {
//   observer.next("foo");
//   setTimeout(() => {
//     observer.next("bar");
//   }, 1000);
// });

// observable.subscribe((value) => console.log(value));

// const observer = {
//   next: function (value) {
//     console.log("value", value);
//   },
//   error: function (error) {
//     console.log("error", error);
//   },
//   complete: function () {
//     console.log("complete");
//   }
// };

// console.log(observable);

// import { interval, take } from "rxjs";

// const source = interval(1000).pipe(take(3));

// const subject = {
//   observers: [],
//   subscribe: function (observer) {
//     this.observers.push(observer);
//   },
//   next: function (value) {
//     this.observers.forEach((next) => next(value));
//   }
// };

// source.subscribe(subject);

// subject.subscribe((value) => console.log("observerA " + value));

// setTimeout(() => {
//   subject.subscribe((value) => console.log("observerB " + value));
// }, 1000);

// observerA 0
// (after 1000ms..)
// observerA 1
// observerB 1
// (after 1000ms..)
// observerA 2
// observerB 2

import { fromEvent } from "rxjs";
import { throttleTime, scan, map } from "rxjs/operators";

setTimeout(() => {
  fromEvent(document, "click")
    .pipe(
      throttleTime(1000),
      map((event) => event.clientX),
      scan((count, clientX) => count + clientX, 0)
    )
    .subscribe((count) => console.log(count));
}, 1000);
